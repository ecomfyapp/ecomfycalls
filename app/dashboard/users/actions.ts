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
  if (
    error instanceof Error &&
    error.message &&
    error.message.trim() !== "{}"
  ) {
    return error.message;
  }

  if (typeof error === "object" && error !== null) {
    const maybeError = error as {
      name?: unknown;
      message?: unknown;
      error_description?: unknown;
      code?: unknown;
      status?: unknown;
    };
    const name = typeof maybeError.name === "string" ? maybeError.name : "";
    const status =
      typeof maybeError.status === "number" || typeof maybeError.status === "string"
        ? String(maybeError.status)
        : "";

    const rawMessage =
      typeof maybeError.message === "string" && maybeError.message
        ? maybeError.message
        : typeof maybeError.error_description === "string" &&
            maybeError.error_description
          ? maybeError.error_description
          : "";
    const message = rawMessage.trim() === "{}" ? "" : rawMessage;

    if (message && maybeError.code) {
      return `${message} (${String(maybeError.code)})`;
    }

    if (message) {
      return message;
    }

    if (name === "AuthRetryableFetchError" || status === "500") {
      return "Supabase Auth returned a 500 while sending the invite. Check Auth SMTP/email settings and Auth URL Configuration in Supabase.";
    }
  }

  try {
    const serialized = JSON.stringify(error);
    return serialized && serialized !== "{}"
      ? serialized
      : "Supabase invite failed without details. Check Auth email settings, redirect URLs, and the service role key.";
  } catch {
    return "Supabase invite failed. Check Auth email settings, redirect URLs, and the service role key.";
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

function normalizeEmail(value: FormDataEntryValue | string | null) {
  return String(value ?? "").trim().toLowerCase();
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function createSupabaseAuthAdmin() {
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

async function ensureEmailCanBeInvited(email: string) {
  if (!email || !isValidEmail(email)) {
    throw new Error("Enter a valid email address.");
  }

  const supabase = await createClient();
  const { data: existingProfile, error: existingProfileError } = await supabase
    .from("user_profiles")
    .select("id,email")
    .ilike("email", email)
    .maybeSingle<{ id: string; email: string | null }>();

  if (existingProfileError) {
    throw new Error(getErrorMessage(existingProfileError));
  }

  if (existingProfile) {
    throw new Error("This email already exists in Active Users.");
  }

  const admin = await createSupabaseAuthAdmin();
  const { data: authUsers, error: listUsersError } =
    await admin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

  if (listUsersError) {
    throw new Error(getErrorMessage(listUsersError));
  }

  const authUserExists = authUsers.users.some(
    (current) => current.email?.toLowerCase() === email,
  );

  if (authUserExists) {
    throw new Error("This email already exists in Supabase Auth.");
  }

  return admin;
}

async function sendInviteEmail(email: string) {
  const admin = await ensureEmailCanBeInvited(email);
  const appUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : "https://www.ecomfycalls.com");
  const { error } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${appUrl}/auth/update-password`,
  });

  if (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function updateUserProfile(formData: FormData) {
  await requireActiveAdmin();

  const id = String(formData.get("id") ?? "");
  const role = String(formData.get("role") ?? "agent").trim() || "agent";
  const buyerId = role !== "admin" ? optionalNumber(formData.get("buyer_id")) : null;

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
    updateData.buyer_id = buyerId;
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

    await sendInviteEmail(normalizeEmail(pendingProfile.email));

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

export async function inviteUserByEmail(
  _state: InvitePendingProfileState,
  formData: FormData,
): Promise<InvitePendingProfileState> {
  const email = normalizeEmail(formData.get("email"));

  try {
    await requireActiveAdmin();
    await sendInviteEmail(email);
    revalidatePath("/dashboard/users");

    return {
      status: "success",
      message: `Invitation sent to ${email}.`,
    };
  } catch (error) {
    return {
      status: "error",
      message: getErrorMessage(error),
    };
  }
}
