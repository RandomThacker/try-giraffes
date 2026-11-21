"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ApiError, listAmcs, routeForNext, signup } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { PasswordField } from "@/components/ui/password-field";
import { SelectField, type SelectOption } from "@/components/ui/select-field";
import { TextField } from "@/components/ui/text-field";

export function SignupForm() {
  const router = useRouter();
  const [amcOptions, setAmcOptions] = useState<SelectOption[]>([]);
  const [amc, setAmc] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    listAmcs()
      .then((payload) => {
        if (cancelled) {
          return;
        }
        const options = payload.amcs.map((item) => ({ value: item.code, label: item.code }));
        setAmcOptions(options);
        setAmc((current) => current || options[0]?.value || "");
      })
      .catch(() => {
        if (!cancelled) {
          setError("Unable to load AMC options.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const result = await signup({
        email,
        full_name: fullName.trim(),
        password,
        amc_code: amc,
      });
      router.push(routeForNext(result.next));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Sign up failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="w-full">
      <h1 className="text-[22px] font-semibold leading-tight tracking-tight text-[#2a2a2a] sm:text-[24px]">
        Create your Try Giraffes account
      </h1>
      <p className="mt-2 text-[15px] text-[#8a8a8a]">Sign up to set your PIN and start marking attendance.</p>

      <div className="mt-7 flex flex-col gap-5">
        <SelectField label="Select AMC" name="amc" value={amc} options={amcOptions} onChange={setAmc} />
        <TextField
          label="Full name"
          name="full_name"
          autoComplete="name"
          value={fullName}
          onChange={setFullName}
        />
        <TextField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={setEmail}
        />
        <PasswordField
          label="Password"
          name="password"
          autoComplete="new-password"
          value={password}
          onChange={setPassword}
        />
      </div>

      {error ? <p className="mt-4 text-[14px] text-[#d14343]">{error}</p> : null}

      <Button type="submit" fullWidth className="mt-6" disabled={submitting || !amc}>
        {submitting ? "Creating account..." : "Sign up"}
      </Button>

      <p className="mt-5 text-center text-[14px] text-[#8a8a8a]">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-[#666CFF] hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
