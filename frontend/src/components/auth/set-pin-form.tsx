"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ApiError, routeForNext, setPin } from "@/lib/api/client";
import { ArrowLeftIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { PasswordField } from "@/components/ui/password-field";

export function SetPinForm() {
  const router = useRouter();
  const [pin, setPinValue] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const result = await setPin({ pin, confirm_pin: confirmPin });
      router.push(routeForNext(result.next));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to save PIN.");
    } finally {
      setSubmitting(false);
    }
  }

  function onBack() {
    if (window.history.length > 1) {
      router.back();
      return;
    }
    router.push("/login");
  }

  return (
    <form onSubmit={onSubmit} className="w-full">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex cursor-pointer items-center gap-2 text-[20px] font-semibold tracking-tight text-[#2a2a2a]"
      >
        <ArrowLeftIcon className="size-5" />
        Set your Pin
      </button>

      <div className="mt-8 flex flex-col gap-5">
        <PasswordField label="New Pin" name="pin" autoComplete="off" value={pin} onChange={setPinValue} />
        <PasswordField
          label="Confirm New Pin"
          name="confirmPin"
          autoComplete="off"
          value={confirmPin}
          onChange={setConfirmPin}
        />
      </div>

      {error ? <p className="mt-4 text-[14px] text-[#d14343]">{error}</p> : null}

      <Button type="submit" fullWidth className="mt-8" disabled={submitting}>
        {submitting ? "Saving..." : "Submit"}
      </Button>
    </form>
  );
}
