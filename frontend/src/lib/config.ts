export function serverApiBaseUrl() {
  return process.env.API_INTERNAL_URL ?? "http://localhost:8080";
}
