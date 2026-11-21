import { ApiError, getMe, routeForNext, type NextStep } from "@/lib/api/client";

export async function resolveAuthRoute(): Promise<string | null> {
  try {
    const me = await getMe();
    return routeForNext(me.next);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return null;
    }
    throw error;
  }
}

export function pathForStep(next: NextStep) {
  return routeForNext(next);
}
