import { TOTAL_KNOCKOUT_PICKS } from "./constants";
import type { KnockoutPickInput } from "@/types/knockout";

export type KnockoutValidationResult = { ok: true } | { ok: false; message: string };

export function validateKnockoutPickShape(picks: KnockoutPickInput[]): KnockoutValidationResult {
  if (!Array.isArray(picks) || picks.length !== TOTAL_KNOCKOUT_PICKS) {
    return { ok: false, message: `Voce precisa escolher os ${TOTAL_KNOCKOUT_PICKS} jogos do mata-mata.` };
  }

  const matchCodes = new Set<string>();

  for (const pick of picks) {
    if (!pick.matchCode || !pick.pickedTeamId) {
      return { ok: false, message: "Existe um pick incompleto no mata-mata." };
    }

    if (matchCodes.has(pick.matchCode)) {
      return { ok: false, message: "Cada jogo deve ter apenas um vencedor escolhido." };
    }

    matchCodes.add(pick.matchCode);
  }

  return { ok: true };
}
