import type { Metadata } from "next";
import { SignupForm } from "@/components/auth/signup-form";
import { AuthSplit } from "@/components/layout/auth-split";

export const metadata: Metadata = {
  title: "Sign up",
};

export default function SignupPage() {
  return (
    <AuthSplit>
      <SignupForm />
    </AuthSplit>
  );
}
