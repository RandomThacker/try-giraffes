import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import { AuthSplit } from "@/components/layout/auth-split";

export const metadata: Metadata = {
  title: "Login",
};

export default function LoginPage() {
  return (
    <AuthSplit>
      <LoginForm />
    </AuthSplit>
  );
}
