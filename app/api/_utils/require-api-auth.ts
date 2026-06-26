import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

type ApiUser = {
  id: string;
  email: string | null;
};

type ApiProfile = {
  id: string;
  email: string | null;
  buyer_id: number | null;
  role: string;
  status: string;
};

type RequireApiAuthOptions = {
  activeOnly?: boolean;
  roles?: string[];
};

type ApiAuthSuccess = {
  user: ApiUser;
  profile: ApiProfile | null;
};

type ApiAuthFailure = {
  response: NextResponse;
};

export async function requireApiAuth(
  options: RequireApiAuthOptions = {},
): Promise<ApiAuthSuccess | ApiAuthFailure> {
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims?.sub) {
    return {
      response: NextResponse.json(
        { error: "Authentication required." },
        { status: 401 },
      ),
    };
  }

  const user: ApiUser = {
    id: claimsData.claims.sub,
    email:
      typeof claimsData.claims.email === "string"
        ? claimsData.claims.email
        : null,
  };

  const { data: profile, error: profileError } = await supabase
    .from("user_profiles")
    .select("id,email,buyer_id,role,status")
    .eq("id", user.id)
    .maybeSingle<ApiProfile>();

  if (profileError) {
    return {
      response: NextResponse.json(
        { error: profileError.message },
        { status: 500 },
      ),
    };
  }

  if (options.activeOnly && profile?.status !== "active") {
    return {
      response: NextResponse.json(
        { error: "Active account required." },
        { status: 403 },
      ),
    };
  }

  if (options.roles?.length && !options.roles.includes(profile?.role ?? "")) {
    return {
      response: NextResponse.json(
        { error: "Insufficient permissions." },
        { status: 403 },
      ),
    };
  }

  return { user, profile };
}
