const ALLOWED_NEXT_ROUTES = new Set(["/", "/mata-mata", "/picks", "/profile", "/ranking"]);

export function getSafeNextRoute(value: FormDataEntryValue | string | null | undefined, fallback = "/mata-mata"): string {
  if (typeof value !== "string") {
    return fallback;
  }

  const trimmed = value.trim();
  return ALLOWED_NEXT_ROUTES.has(trimmed) ? trimmed : fallback;
}

export function withNext(path: string, next: string): string {
  return `${path}?next=${encodeURIComponent(getSafeNextRoute(next))}`;
}
