"use server";

import { getCurrentUserProfile } from "@/lib/user-profile";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

function optionalNumber(value: FormDataEntryValue | null) {
  const normalized = String(value ?? "").trim();

  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function requiredNumber(value: FormDataEntryValue | null) {
  const parsed = optionalNumber(value);

  if (parsed === null) {
    throw new Error("A numeric value is required.");
  }

  return parsed;
}

async function requireActiveAdmin() {
  const { user, profile } = await getCurrentUserProfile();

  if (!user || profile?.role !== "admin" || profile.status !== "active") {
    throw new Error("Only active admins can perform this action.");
  }
}

export async function updateUserProfile(formData: FormData) {
  await requireActiveAdmin();

  const id = String(formData.get("id") ?? "");
  const supabase = await createClient();
  const { error } = await supabase
    .from("user_profiles")
    .update({
      buyer_id: optionalNumber(formData.get("buyer_id")),
      ppc_status: formData.get("ppc_status") === "on",
      role: String(formData.get("role") ?? "agent").trim() || "agent",
      status: String(formData.get("status") ?? "pending").trim() || "pending",
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/users");
}

export async function updatePendingProfile(formData: FormData) {
  await requireActiveAdmin();

  const id = requiredNumber(formData.get("id"));
  const supabase = await createClient();
  const { error } = await supabase
    .from("pending_profiles")
    .update({
      first_name: String(formData.get("first_name") ?? "").trim() || null,
      last_name: String(formData.get("last_name") ?? "").trim() || null,
      email: String(formData.get("email") ?? "").trim(),
      buyer_id: requiredNumber(formData.get("buyer_id")),
      account_status:
        String(formData.get("account_status") ?? "").trim() || null,
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/users");
}

export async function deletePendingProfile(formData: FormData) {
  await requireActiveAdmin();

  const id = requiredNumber(formData.get("id"));
  const supabase = await createClient();
  const { error } = await supabase.from("pending_profiles").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/users");
}
