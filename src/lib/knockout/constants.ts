import type { KnockoutRound } from "@/types/knockout";

export const TOTAL_KNOCKOUT_PICKS = 31;

export const KNOCKOUT_ROUND_ORDER: KnockoutRound[] = [
  "ROUND_OF_32",
  "ROUND_OF_16",
  "QUARTERFINAL",
  "SEMIFINAL",
  "FINAL"
];

export const KNOCKOUT_ROUND_LABELS: Record<KnockoutRound, string> = {
  ROUND_OF_32: "16-avos",
  ROUND_OF_16: "Oitavas",
  QUARTERFINAL: "Quartas",
  SEMIFINAL: "Semifinais",
  FINAL: "Final"
};

export const KNOCKOUT_POINT_VALUES: Record<KnockoutRound, number> = {
  ROUND_OF_32: 1,
  ROUND_OF_16: 2,
  QUARTERFINAL: 4,
  SEMIFINAL: 8,
  FINAL: 16
};

export const FRIENDLY_TEAM_CODES: Record<string, string> = {
  BIH: "BOS",
  CIV: "CDM",
  COD: "RDC",
  CPV: "CV",
  CZE: "TCH",
  KOR: "COR",
  KSA: "ARA",
  RSA: "AFS",
  USA: "EUA"
};

export function getFriendlyTeamCode(code: string): string {
  return FRIENDLY_TEAM_CODES[code] ?? code;
}
