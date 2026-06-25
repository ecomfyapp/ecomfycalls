"use server";

import { getCurrentUserProfile } from "@/lib/user-profile";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

export type InvitePendingProfileState = {
  status: "idle" | "success" | "error";
  message: string;
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === "object" && error !== null) {
    const maybeError = error as {
      message?: unknown;
      error_description?: unknown;
      code?: unknown;
    };

    const message =
      typeof maybeError.message === "string" && maybeError.message
        ? maybeError.message
        : typeof maybeError.error_description === "string" &&
            maybeError.error_description
          ? maybeError.error_description
          : "";

    if (message && maybeError.code) {
      return `${message} (${String(maybeError.code)})`;
    }

    if (message) {
      return message;
    }
  }

  try {
    const serialized = JSON.stringify(error);
    return serialized && serialized !== "{}"
      ? serialized
      : "Supabase did not return a detailed error message.";
  } catch {
    return "Unknown error.";
  }
}

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
  const role = String(formData.get("role") ?? "agent").trim() || "agent";
  const updateData: {
    buyer_id?: number | null;
    ppc_status: boolean;
    role: string;
    status: string;
  } = {
    ppc_status: formData.get("ppc_status") === "on",
    role,
    status: String(formData.get("status") ?? "pending").trim() || "pending",
  };

  if (role !== "admin") {
    updateData.buyer_id = optionalNumber(formData.get("buyer_id"));
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("user_profiles")
    .update(updateData)
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
      full_name: String(formData.get("full_name") ?? "").trim() || null,
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

export async function invitePendingProfile(
  _state: InvitePendingProfileState,
  formData: FormData,
): Promise<InvitePendingProfileState> {
  try {
    await requireActiveAdmin();

    const id = requiredNumber(formData.get("id"));
    const supabase = await createClient();
    const { data: pendingProfile, error: pendingError } = await supabase
      .from("pending_profiles")
      .select("email,full_name,buyer_id")
      .eq("id", id)
      .single<{
        email: string;
        full_name: string | null;
        buyer_id: number;
      }>();

    if (pendingError) {
      throw new Error(getErrorMessage(pendingError));
    }

    const supabaseUrl =
      process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error(
        "Missing SUPABASE_SERVICE_ROLE_KEY or Supabase URL on the server.",
      );
    }

    const appUrl =
      process.env.NEXT_PUBLIC_SITE_URL ??
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");

    const admin = createSupabaseAdminClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { error } = await admin.auth.admin.inviteUserByEmail(
      pendingProfile.email,
      {
        redirectTo: `${appUrl}/auth/confirm?next=/dashboard`,
        data: {
          full_name: pendingProfile.full_name,
          buyer_id: pendingProfile.buyer_id,
        },
      },
    );

    if (error) {
      throw new Error(getErrorMessage(error));
    }

    revalidatePath("/dashboard/users");

    return {
      status: "success",
      message: `Invitation sent to ${pendingProfile.email}.`,
    };
  } catch (error) {
    return {
      status: "error",
      message: getErrorMessage(error),
    };
  }
}
