import { AuthShell } from "@/components/auth-shell";
import { SignUpForm } from "@/components/sign-up-form";

export default function Page() {
  return (
    <AuthShell title="Create account">
      <SignUpForm />
    </AuthShell>
  );
}
