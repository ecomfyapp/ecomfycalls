"use server";

import { getCurrentUserProfile } from "@/lib/user-profile";
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

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

export async function updateAgentDeliveryStatus(formData: FormData) {
  const { user, profile } = await getCurrentUserProfile();

  if (!user || !profile || profile.role !== "agent" || profile.status !== "active") {
    return {
      ok: false,
      message: "Only active agents can update delivery status.",
    };
  }

  const field = String(formData.get("field") ?? "");
  const enabled = String(formData.get("enabled") ?? "") === "true";

  if (field !== "ppc_status" && field !== "lead_status") {
    return {
      ok: false,
      message: "Invalid status field.",
    };
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("user_profiles")
    .update({ [field]: enabled })
    .eq("id", user.id);

  if (error) {
    return {
      ok: false,
      message: error.message,
    };
  }

  revalidatePath("/dashboard");

  return {
    ok: true,
    message: "Status updated.",
  };
}
