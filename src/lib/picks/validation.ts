import { PICK_LIMITS, TOTAL_PICKS } from "./constants";
import type { PickInput, PickType } from "@/types/picks";

export type PickValidationResult =
  | { ok: true }
  | { ok: false; message: string };

const PICK_TYPES: PickType[] = ["GROUP_WINNER", "QUALIFIED_NOT_WINNER", "ELIMINATED"];

export function validatePickShape(picks: PickInput[]): PickValidationResult {
  if (picks.length !== TOTAL_PICKS) {
    return { ok: false, message: `Voce precisa enviar exatamente ${TOTAL_PICKS} picks.` };
  }

  const teamIds = new Set<string>();
  const counts: Record<PickType, number> = {
    GROUP_WINNER: 0,
    QUALIFIED_NOT_WINNER: 0,
    ELIMINATED: 0
  };

  for (const pick of picks) {
    if (!pick.teamId) {
      return { ok: false, message: "Existe um pick sem selecao valida." };
    }

    if (!PICK_TYPES.includes(pick.pickType)) {
      return { ok: false, message: "Existe um tipo de pick invalido." };
    }

    if (teamIds.has(pick.teamId)) {
      return { ok: false, message: "Uma selecao nao pode aparecer em mais de uma categoria." };
    }

    teamIds.add(pick.teamId);
    counts[pick.pickType] += 1;
  }

  for (const pickType of PICK_TYPES) {
    if (counts[pickType] !== PICK_LIMITS[pickType]) {
      return {
        ok: false,
        message: `A categoria ${pickType} precisa ter ${PICK_LIMITS[pickType]} picks.`
      };
    }
  }

  return { ok: true };
}

export function normalizeNickname(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}
