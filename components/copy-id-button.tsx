"use client";

import { Copy, Check } from "lucide-react";
import { useState } from "react";

export function CopyIdButton({
  value,
  previewLength = 5,
  label = "UID",
}: {
  value: string;
  previewLength?: number;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);
  const preview = value.slice(0, previewLength);

  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-1 rounded-md bg-[#f1f5fb] px-2 py-1 font-mono text-xs text-[#0b1020] hover:bg-[#e4ecf7]"
      title={copied ? "Copied" : `Copy full ${label}`}
      aria-label={`Copy full ${label}`}
    >
      <span>{preview}</span>
      {copied ? (
        <Check className="h-3.5 w-3.5 text-[#047857]" />
      ) : (
        <Copy className="h-3.5 w-3.5 text-[#4b5567]" />
      )}
    </button>
  );
}
