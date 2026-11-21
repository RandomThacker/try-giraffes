/// <reference lib="esnext" />
/// <reference lib="webworker" />
import type { PrecacheEntry, RuntimeCaching, SerwistGlobalConfig } from "serwist";
import { NetworkFirst, NetworkOnly, Serwist, StaleWhileRevalidate } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const runtimeCaching: RuntimeCaching[] = [
  // Auth + API must always hit the network (session cookies / live data).
  {
    handler: new NetworkOnly(),
    matcher: ({ sameOrigin, url: { pathname } }) =>
      sameOrigin && (pathname.startsWith("/api/") || pathname.startsWith("/uploads/")),
  },
  {
    handler: new StaleWhileRevalidate({ cacheName: "static-assets" }),
    matcher: /\.(?:js|css|png|jpg|jpeg|svg|webp|woff2?)$/i,
  },
  {
    handler: new NetworkFirst({
      cacheName: "pages",
      networkTimeoutSeconds: 5,
    }),
    matcher: ({ request, sameOrigin, url: { pathname } }) =>
      request.destination === "document" &&
      sameOrigin &&
      !pathname.startsWith("/api/") &&
      !pathname.startsWith("/serwist/"),
  },
];

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching,
  fallbacks: {
    entries: [
      {
        url: "/~offline",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

serwist.addEventListeners();
