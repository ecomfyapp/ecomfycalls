"use client";

import {
  type AccountProfileFormState,
  updateAccountProfile,
} from "@/app/dashboard/account/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit3, X } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";

const initialState: AccountProfileFormState = {
  status: "idle",
  message: "",
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      className="bg-[#173785] text-white hover:bg-[#0f2a6c]"
    >
      {pending ? "Saving..." : "Save changes"}
    </Button>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[#647084]">{label}</dt>
      <dd className="mt-1 font-medium">{value || "-"}</dd>
    </div>
  );
}

function StatusField({ status }: { status: string }) {
  const isActive = status.toLowerCase() === "active";

  return (
    <div>
      <dt className="text-[#647084]">Status</dt>
      <dd className="mt-1">
        <span
          className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-sm font-semibold capitalize ${
            isActive
              ? "bg-[#dcfce7] text-[#047857]"
              : "bg-[#e8eef8] text-[#173785]"
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              isActive ? "bg-[#10b981]" : "bg-[#647084]"
            }`}
          />
          {status || "-"}
        </span>
      </dd>
    </div>
  );
}

export function AccountProfileForm({
  email,
  fullName,
  role,
  profileStatus,
}: {
  email: string;
  fullName: string;
  role: string;
  profileStatus: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [state, formAction] = useActionState(
    updateAccountProfile,
    initialState,
  );

  useEffect(() => {
    if (state.status === "success") {
      setIsEditing(false);
    }
  }, [state.status]);

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Profile details</h2>
          <p className="mt-1 text-sm text-[#647084]">
            Email and role are read-only. You can update the rest of your
            profile.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsEditing((current) => !current)}
          className="flex h-9 items-center gap-2 rounded-md border border-[#d8e2f0] bg-white px-3 text-sm font-semibold text-[#173785] hover:bg-[#f1f5fb]"
        >
          {isEditing ? <X className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
          {isEditing ? "Cancel" : "Edit"}
        </button>
      </div>

      {!isEditing ? (
        <dl className="mt-6 grid gap-5 text-sm md:grid-cols-2">
          <ReadOnlyField label="Email" value={email} />
          <ReadOnlyField label="Full name" value={fullName} />
          <StatusField status={profileStatus} />
          <ReadOnlyField label="Role" value={role} />
        </dl>
      ) : (
        <form action={formAction} className="mt-6 space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={email} disabled />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Input value={role} disabled className="capitalize" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="full_name">Full name</Label>
              <Input
                id="full_name"
                name="full_name"
                defaultValue={fullName}
                placeholder="Your full name"
                required
              />
            </div>
          </div>

          {state.message ? (
            <p
              className={`rounded-md border px-3 py-2 text-sm ${
                state.status === "success"
                  ? "border-[#bfe8d8] bg-[#effdf7] text-[#047857]"
                  : "border-[#ffd3d3] bg-[#fff8f8] text-[#b91c1c]"
              }`}
            >
              {state.message}
            </p>
          ) : null}

          <SubmitButton />
        </form>
      )}

      {!isEditing && state.message ? (
        <p
          className={`mt-5 rounded-md border px-3 py-2 text-sm ${
            state.status === "success"
              ? "border-[#bfe8d8] bg-[#effdf7] text-[#047857]"
              : "border-[#ffd3d3] bg-[#fff8f8] text-[#b91c1c]"
          }`}
        >
          {state.message}
        </p>
      ) : null}
    </div>
  );
}
