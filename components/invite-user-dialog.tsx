"use client";

import {
  type InvitePendingProfileState,
  inviteUserByEmail,
} from "@/app/dashboard/users/actions";
import { X } from "lucide-react";
import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";

const initialInviteState: InvitePendingProfileState = {
  status: "idle",
  message: "",
};

function InviteSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="h-10 rounded-md bg-[#173785] px-4 text-sm font-semibold text-white shadow-sm hover:bg-[#0f2a6c] disabled:cursor-wait disabled:opacity-60"
    >
      {pending ? "Invitando..." : "Invitar"}
    </button>
  );
}

export function InviteUserDialog({ onClose }: { onClose: () => void }) {
  const [state, formAction] = useActionState(
    inviteUserByEmail,
    initialInviteState,
  );

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1020]/35 px-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-md rounded-[8px] border border-[#d8e2f0] bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold">Invitar usuario</h3>
            <p className="mt-1 text-sm text-[#647084]">
              Envía una invitación para que el usuario cree su cuenta.
            </p>
          </div>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md text-[#647084] hover:bg-[#f1f5fb] hover:text-[#173785]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form action={formAction} className="mt-5 space-y-4">
          <label className="block">
            <span className="text-sm font-semibold text-[#0b1020]">Email</span>
            <input
              autoFocus
              required
              type="email"
              name="email"
              placeholder="usuario@email.com"
              className="mt-2 h-10 w-full rounded-md border border-[#d8e2f0] bg-white px-3 text-sm outline-none focus:border-[#173785]"
            />
          </label>

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

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-md border border-[#d8e2f0] bg-white px-4 text-sm font-semibold text-[#173785] hover:bg-[#f1f5fb]"
            >
              Cancelar
            </button>
            <InviteSubmitButton />
          </div>
        </form>
      </div>
    </div>
  );
}
