import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

export function LandingPage() {
  return (
    <main className="relative min-h-svh overflow-hidden bg-[radial-gradient(ellipse_at_top_left,#eef0ff_0%,#ffffff_42%,#f7f8ff_100%)]">
      <div className="mx-auto flex min-h-svh w-full max-w-5xl flex-col px-6 py-8 sm:px-10">
        <header className="flex items-center justify-between gap-4">
          <Logo tone="brand" />
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-[14px] font-medium text-[#666CFF] hover:underline">
              Log in
            </Link>
            <Link href="/signup">
              <Button type="button" className="h-10 px-4">
                Sign up
              </Button>
            </Link>
          </div>
        </header>

        <section className="flex flex-1 flex-col items-start justify-center py-16">
          <p className="text-[14px] font-medium uppercase tracking-[0.18em] text-[#666CFF]">Try Giraffes</p>
          <h1 className="mt-4 max-w-2xl text-[40px] font-semibold leading-tight tracking-tight text-[#1f1f2b] sm:text-[52px]">
            Show up, mark present, and keep the day moving.
          </h1>
          <p className="mt-5 max-w-xl text-[17px] leading-7 text-[#6b6b78]">
            Create an account, set your PIN, and mark today&apos;s attendance in a few steps.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/signup">
              <Button type="button" className="h-11 px-6">
                Sign up
              </Button>
            </Link>
            <Link href="/login">
              <Button type="button" variant="secondary" className="h-11 px-6">
                Log in
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
