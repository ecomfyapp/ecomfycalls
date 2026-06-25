"use client";

import {
  type InvitePendingProfileState,
  invitePendingProfile,
} from "@/app/dashboard/users/actions";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

const initialInvitePendingProfileState: InvitePendingProfileState = {
  status: "idle",
  message: "",
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-[#173785] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#0f2a6c] disabled:cursor-wait disabled:opacity-60"
    >
      {pending ? "Inviting..." : "Invite"}
    </button>
  );
}

export function PendingInviteButton({ id }: { id: number }) {
  const [state, formAction] = useActionState(
    invitePendingProfile,
    initialInvitePendingProfileState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-1">
      <input type="hidden" name="id" value={id} />
      <SubmitButton />
      {state.message ? (
        <span
          className={`max-w-40 text-xs ${
            state.status === "success" ? "text-[#047857]" : "text-[#b91c1c]"
          }`}
        >
          {state.message}
        </span>
      ) : null}
    </form>
  );
}
