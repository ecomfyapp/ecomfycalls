import { createClient } from "@/lib/supabase/server";

export type UserProfile = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: string;
  status: string;
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
    .select("id,email,full_name,role,status")
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
    .select("id,email,full_name,role,status")
    .single<UserProfile>();

  return {
    user,
    profile: createdProfile,
    error: insertError?.message ?? null,
  };
}
