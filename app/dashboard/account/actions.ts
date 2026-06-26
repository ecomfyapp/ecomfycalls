"use server";

import { getCurrentUserProfile } from "@/lib/user-profile";
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

export type AccountProfileFormState = {
  status: "idle" | "success" | "error";
  message: string;
};

function normalizeText(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

function createAdminClient() {
  const supabaseUrl =
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY or Supabase URL on the server.",
    );
  }

  return createSupabaseAdminClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function updateAccountProfile(
  _state: AccountProfileFormState,
  formData: FormData,
): Promise<AccountProfileFormState> {
  const { user } = await getCurrentUserProfile();

  if (!user) {
    return {
      status: "error",
      message: "Authentication required.",
    };
  }

  const fullName = normalizeText(formData.get("full_name"));

  if (!fullName) {
    return {
      status: "error",
      message: "Full name is required.",
    };
  }

  const admin = createAdminClient();
  const { error: profileError } = await admin
    .from("user_profiles")
    .update({
      full_name: fullName,
    })
    .eq("id", user.id);

  if (profileError) {
    return {
      status: "error",
      message: profileError.message,
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/account");

  return {
    status: "success",
    message: "Profile updated.",
  };
}
