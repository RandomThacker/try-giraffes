import type { Metadata } from "next";
import { RequireSession } from "@/components/auth/require-session";
import { SetPinForm } from "@/components/auth/set-pin-form";
import { AuthSplit } from "@/components/layout/auth-split";

export const metadata: Metadata = {
  title: "Set your Pin",
};

export default function SetPinPage() {
  return (
    <RequireSession allow="set_pin">
      <AuthSplit>
        <SetPinForm />
      </AuthSplit>
    </RequireSession>
  );
}
