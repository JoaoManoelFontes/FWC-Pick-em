const DEFAULT_LOCKED_AT = "2026-06-11T18:00:00.000Z";

export function getPicksLockedAt(): Date {
  const value = process.env.PICKS_LOCKED_AT ?? DEFAULT_LOCKED_AT;
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return new Date(DEFAULT_LOCKED_AT);
  }

  return date;
}

export function isPicksLocked(now = new Date()): boolean {
  return now.getTime() >= getPicksLockedAt().getTime();
}

export function formatBrasiliaDeadline(date = getPicksLockedAt()): string {
  const formatted = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(date);

  return `${formatted.replace(",", "")} BRT`;
}
