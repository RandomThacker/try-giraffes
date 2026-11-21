export type Health = {
  status: string;
};

export type User = {
  id: string;
  email: string;
  amc_code: string;
  has_pin: boolean;
};

export type NextStep = "set_pin" | "mark_present" | "dashboard";

export type AuthPayload = {
  user: User;
  next: NextStep;
};

export type AMC = {
  code: string;
};

type DataEnvelope<T> = {
  data: T;
};

type ErrorEnvelope = {
  error?: {
    code?: string;
    message?: string;
  };
};

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set("Accept", "application/json");
  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(path, {
    ...init,
    headers,
    credentials: "same-origin",
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => null)) as
    | DataEnvelope<T>
    | ErrorEnvelope
    | null;

  if (!response.ok) {
    const error = payload && "error" in payload ? payload.error : undefined;
    throw new ApiError(
      response.status,
      error?.code ?? "REQUEST_FAILED",
      error?.message ?? response.statusText,
    );
  }

  if (!payload || !("data" in payload)) {
    throw new ApiError(response.status, "INVALID_RESPONSE", "The server response was not recognized.");
  }

  return payload.data;
}

export function getHealth() {
  return apiFetch<Health>("/api/v1/health");
}

export function listAmcs() {
  return apiFetch<{ amcs: AMC[] }>("/api/v1/amcs");
}

export function signup(input: { email: string; password: string; amc_code: string }) {
  return apiFetch<AuthPayload>("/api/v1/auth/signup", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function login(input: { email: string; password: string; amc_code: string }) {
  return apiFetch<AuthPayload>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function logout() {
  return apiFetch<{ ok: boolean }>("/api/v1/auth/logout", { method: "POST" });
}

export function getMe() {
  return apiFetch<AuthPayload>("/api/v1/auth/me");
}

export function setPin(input: { pin: string; confirm_pin: string }) {
  return apiFetch<AuthPayload>("/api/v1/auth/pin", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function markAttendance(status: "present" | "absent") {
  return apiFetch<{ attendance: { day: string; status: string }; next: NextStep }>("/api/v1/attendance", {
    method: "POST",
    body: JSON.stringify({ status }),
  });
}

export function routeForNext(next: NextStep) {
  switch (next) {
    case "set_pin":
      return "/set-pin";
    case "mark_present":
      return "/mark-present";
    case "dashboard":
      return "/dashboard";
  }
}
