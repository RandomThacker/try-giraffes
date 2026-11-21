import type { ReactNode } from "react";
import { Logo } from "@/components/brand/logo";
import { IllustrationPanel } from "@/components/layout/illustration-panel";

export function AuthSplit({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-svh lg:grid-cols-[minmax(0,1.45fr)_minmax(380px,1fr)]">
      <IllustrationPanel />
      <div className="flex min-h-svh min-w-0 flex-col bg-white">
        <div className="px-6 pt-6 lg:hidden">
          <Logo tone="brand" />
        </div>
        <div className="flex flex-1 items-center justify-center px-6 py-10 sm:px-8">
          <div className="w-full max-w-[400px]">{children}</div>
        </div>
      </div>
    </div>
  );
}
