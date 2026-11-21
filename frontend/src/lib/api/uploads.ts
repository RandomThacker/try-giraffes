import { ApiError } from "@/lib/api/client";

export async function uploadFile(file: File): Promise<{ url: string }> {
  const body = new FormData();
  body.append("file", file);

  const response = await fetch("/api/v1/uploads", {
    method: "POST",
    body,
    credentials: "same-origin",
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => null)) as
    | { data?: { url?: string }; error?: { code?: string; message?: string } }
    | null;

  if (!response.ok) {
    throw new ApiError(
      response.status,
      payload?.error?.code ?? "REQUEST_FAILED",
      payload?.error?.message ?? response.statusText,
    );
  }

  const url = payload?.data?.url;
  if (!url) {
    throw new ApiError(response.status, "INVALID_RESPONSE", "Upload response was invalid.");
  }
  return { url };
}
