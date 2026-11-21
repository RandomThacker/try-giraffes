import { createSerwistRoute } from "@serwist/turbopack";
import { cacheLife } from "next/cache";

const revision = process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.SOURCE_VERSION ?? "v1";

const serwistRoute = createSerwistRoute({
  swSrc: "src/app/sw.ts",
  additionalPrecacheEntries: [{ url: "/~offline", revision }],
  useNativeEsbuild: true,
});

export const generateStaticParams = serwistRoute.generateStaticParams;

async function buildSerwistFile(path: string) {
  "use cache";
  cacheLife("max");
  const response = await serwistRoute.GET(new Request(`https://serwist.invalid/${path}`), {
    params: Promise.resolve({ path }),
  });
  return {
    body: await response.text(),
    contentType: response.headers.get("Content-Type") ?? "text/plain",
  };
}

export async function GET(_request: Request, context: { params: Promise<{ path: string }> }) {
  const { path } = await context.params;
  const { body, contentType } = await buildSerwistFile(path);
  return new Response(body, {
    headers: {
      "Content-Type": contentType,
      "Service-Worker-Allowed": "/",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
