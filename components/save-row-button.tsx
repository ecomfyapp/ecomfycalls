"use client";

import { useState } from "react";

export function SaveRowButton({ form }: { form: string }) {
  const [isSaving, setIsSaving] = useState(false);

  return (
    <button
      type="submit"
      form={form}
      disabled={isSaving}
      onClick={() => setIsSaving(true)}
      className="rounded-md bg-[#173785] px-2.5 py-1.5 text-sm font-semibold text-white hover:bg-[#0f2a6c] disabled:cursor-default disabled:opacity-70"
    >
      Save
    </button>
  );
}
