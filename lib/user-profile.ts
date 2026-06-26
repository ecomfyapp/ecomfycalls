import { createClient } from "@/lib/supabase/server";

export type UserProfile = {
  id: string;
  email: string | null;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  buyer_id: number | null;
  balance: number;
  ppc_status: boolean;
  lead_status: boolean;
  role: string;
  status: string;
  created_at: string;
  updated_at: string;
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
      "id,email,full_name,first_name,last_name,buyer_id,balance,ppc_status,lead_status,role,status,created_at,updated_at",
    )
    .eq("id", user.id)
    .maybeSingle<UserProfile>();

  if (profile) {
    return { user, profile, error: null };
  }

  if (error) {
    return { user, profile: null, error: error.message };
  }

  const { data: createdProfile, error: insertError } = await supabase
    .from("user_profiles")
    .insert({
      id: user.id,
      email: user.email,
      role: "agent",
      status: "pending",
    })
    .select(
      "id,email,full_name,first_name,last_name,buyer_id,balance,ppc_status,lead_status,role,status,created_at,updated_at",
    )
    .single<UserProfile>();

  return {
    user,
    profile: createdProfile,
    error: insertError?.message ?? null,
  };
}
