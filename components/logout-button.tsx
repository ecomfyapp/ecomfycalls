"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export function LogoutButton({ iconOnly = false }: { iconOnly?: boolean }) {
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  if (iconOnly) {
    return (
      <button
        type="button"
        onClick={logout}
        aria-label="Logout"
        className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#647084] hover:bg-white hover:text-[#173785]"
      >
        <LogOut className="h-4 w-4" />
      </button>
    );
  }

  return <Button onClick={logout}>Logout</Button>;
}
