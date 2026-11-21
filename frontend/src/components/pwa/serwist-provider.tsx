"use client";

import type { ReactNode } from "react";
import { SerwistProvider as Provider } from "@serwist/turbopack/react";

export function SerwistProvider({ children }: { children: ReactNode }) {
  return (
    <Provider
      swUrl="/serwist/sw.js"
      cacheOnNavigation={false}
      disable={process.env.NODE_ENV === "development"}
    >
      {children}
    </Provider>
  );
}
