"use client";

import { useState } from "react";

export function SaveRowButton({ form }: { form: string }) {
  const [isSaving, setIsSaving] = useState(false);

  const handleClick = () => {
    setIsSaving(true);
    const targetForm = document.getElementById(form) as HTMLFormElement | null;
    targetForm?.requestSubmit();
    window.setTimeout(() => setIsSaving(false), 1800);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`rounded-md bg-[#173785] px-2.5 py-1.5 text-sm font-semibold text-white transition-opacity hover:bg-[#0f2a6c] ${
        isSaving ? "opacity-55" : "opacity-100"
      }`}
    >
      Save
    </button>
  );
}
