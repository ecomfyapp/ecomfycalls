"use client";

import { Check, Shield, UserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const statusStyles: Record<string, string> = {
  active: "bg-[#e8fff5] text-[#047857] border-[#9fe8cd]",
  pending: "bg-[#fff7e6] text-[#b45309] border-[#ffd08a]",
  banned: "bg-[#fff1f1] text-[#b91c1c] border-[#ffb7b7]",
};

const roleStyles: Record<string, string> = {
  agent: "bg-[#eef5ff] text-[#173785] border-[#bfd2ef]",
  admin: "bg-[#f0efff] text-[#4f46e5] border-[#c8c4ff]",
};

const channelStyles: Record<string, string> = {
  beta: "bg-[#fff7e6] text-[#b45309] border-[#ffd08a]",
  production: "bg-[#e8fff5] text-[#047857] border-[#9fe8cd]",
};

const roleIcons = {
  agent: UserRound,
  admin: Shield,
};

type ProfileSelectProps = {
  name: string;
  defaultValue: string;
  form: string;
  options: string[];
  variant: "role" | "status" | "channel";
};

export function ProfileSelect({
  name,
  defaultValue,
  form,
  options,
  variant,
}: ProfileSelectProps) {
  const [value, setValue] = useState(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const styles =
    variant === "status"
      ? statusStyles
      : variant === "channel"
        ? channelStyles
        : roleStyles;

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <input type="hidden" name={name} value={value} form={form} />
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className={`h-8 w-full rounded-md border px-3 text-left text-sm font-semibold capitalize outline-none transition-colors focus:border-[#173785] ${styles[value] ?? "border-[#d8e2f0] bg-white text-[#0b1020]"}`}
      >
        {value}
      </button>

      {isOpen ? (
        <div className="absolute left-0 top-9 z-30 min-w-full rounded-md border border-[#d8e2f0] bg-white p-1 shadow-[0_8px_20px_rgba(15,23,42,0.14)]">
          {options.map((option) => (
            <DropdownOption
              key={option}
              option={option}
              selected={option === value}
              styles={styles[option]}
              variant={variant}
              onSelect={() => {
                setValue(option);
                setIsOpen(false);
              }}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function DropdownOption({
  option,
  selected,
  styles,
  variant,
  onSelect,
}: {
  option: string;
  selected: boolean;
  styles: string;
  variant: "role" | "status" | "channel";
  onSelect: () => void;
}) {
  const Icon =
    variant === "role" ? roleIcons[option as keyof typeof roleIcons] : null;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`mb-1 flex h-8 w-full items-center gap-2 rounded-md border px-3 text-left text-sm font-semibold capitalize last:mb-0 ${styles ?? "border-[#d8e2f0] bg-white text-[#0b1020]"}`}
    >
      {Icon ? <Icon className="h-4 w-4 shrink-0" /> : null}
      <span className="min-w-0 flex-1">{option}</span>
      {selected ? <Check className="h-4 w-4 shrink-0" /> : null}
    </button>
  );
}
