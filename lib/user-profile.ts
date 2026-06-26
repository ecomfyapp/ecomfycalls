import { createServiceClient } from "@/lib/supabase/service";
import { createClient } from "@/lib/supabase/server";
import { randomBytes } from "crypto";

export type UserProfile = {
  id: string;
  email: string | null;
  full_name: string | null;
  buyer_id: number | null;
  balance: number;
  ppc_status: boolean;
  lead_status: boolean;
  role: string;
  status: string;
  created_at: string;
  updated_at: string;
};

type PendingProfileRow = {
  id: number;
  email: string;
  full_name: string | null;
  buyer_id: number;
  balance: number | null;
  account_status: string | null;
};

export async function getCurrentUserProfile() {
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims?.sub) {
    return {
      user: null,
      profile: null,
      error: claimsError?.message ?? "Not authenticated",
    };
  }

  const user = {
    id: claimsData.claims.sub,
    email:
      typeof claimsData.claims.email === "string"
        ? claimsData.claims.email
        : null,
  };

  const { data: profile, error } = await supabase
    .from("user_profiles")
    .select(
      "id,email,full_name,buyer_id,balance,ppc_status,lead_status,role,status,created_at,updated_at",
    )
    .eq("id", user.id)
    .maybeSingle<UserProfile>();

  if (profile) {
    return { user, profile, error: null };
  }

  if (error) {
    return { user, profile: null, error: error.message };
  }

  // Check if this user was invited from pending_profiles (Phonexa pipeline).
  // If so, migrate their data and generate a SIP extension automatically.
  const serviceClient = createServiceClient();
  const { data: pendingRow } = await serviceClient
    .from("pending_profiles")
    .select("id,email,full_name,buyer_id,balance,account_status")
    .ilike("email", user.email ?? "")
    .maybeSingle<PendingProfileRow>();

  let newProfileData: Record<string, unknown>;

  if (pendingRow) {
    newProfileData = {
      id: user.id,
      email: user.email,
      full_name: pendingRow.full_name,
      buyer_id: pendingRow.buyer_id,
      balance: pendingRow.balance ?? 0,
      role: "agent",
      status: "active",
      metadata: {
        sip_password: randomBytes(12).toString("base64url").slice(0, 16),
      },
    };

    // Remove from pending_profiles — migration complete.
    await serviceClient
      .from("pending_profiles")
      .delete()
      .eq("id", pendingRow.id);
  } else {
    newProfileData = {
      id: user.id,
      email: user.email,
      role: "agent",
      status: "pending",
    };
  }

  const { data: createdProfile, error: insertError } = await supabase
    .from("user_profiles")
    .insert(newProfileData)
    .select(
      "id,email,full_name,buyer_id,balance,ppc_status,lead_status,role,status,created_at,updated_at",
    )
    .single<UserProfile>();

  return {
    user,
    profile: createdProfile,
    error: insertError?.message ?? null,
  };
}
