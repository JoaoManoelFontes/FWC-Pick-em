import { KNOCKOUT_ROUND_ORDER } from "./constants";
import type {
  KnockoutMatch,
  KnockoutPicksByMatch,
  ResolvedKnockoutMatch,
  ResolvedKnockoutSlot
} from "@/types/knockout";
import type { Team } from "@/types/picks";

function placeholder(sourceCode: string | null): string {
  return sourceCode ? `Vencedor ${sourceCode}` : "A definir";
}

function resolveSlot(
  directTeam: Team | null,
  sourceCode: string | null,
  winnerTeamsByMatch: Map<string, Team>
): ResolvedKnockoutSlot {
  if (directTeam) {
    return { team: directTeam, placeholder: directTeam.name };
  }

  return {
    team: sourceCode ? winnerTeamsByMatch.get(sourceCode) ?? null : null,
    placeholder: placeholder(sourceCode)
  };
}

export function resolveKnockoutMatches(matches: KnockoutMatch[], picksByMatch: KnockoutPicksByMatch): ResolvedKnockoutMatch[] {
  const winnerTeamsByMatch = new Map<string, Team>();
  const byRoundOrder = [...matches].sort((left, right) => {
    const roundDelta = KNOCKOUT_ROUND_ORDER.indexOf(left.round) - KNOCKOUT_ROUND_ORDER.indexOf(right.round);
    return roundDelta === 0 ? left.displayOrder - right.displayOrder : roundDelta;
  });

  return byRoundOrder.map((match) => {
    const homeSlot = resolveSlot(match.homeTeam, match.homeSourceMatchCode, winnerTeamsByMatch);
    const awaySlot = resolveSlot(match.awayTeam, match.awaySourceMatchCode, winnerTeamsByMatch);
    const pickedTeamId = picksByMatch[match.code];
    const pickedTeam =
      homeSlot.team?.id === pickedTeamId ? homeSlot.team : awaySlot.team?.id === pickedTeamId ? awaySlot.team : null;

    if (pickedTeam) {
      winnerTeamsByMatch.set(match.code, pickedTeam);
    }

    return {
      ...match,
      homeSlot,
      awaySlot,
      pickedTeam
    };
  });
}

export function clearDescendantPicks(
  matches: KnockoutMatch[],
  changedMatchCode: string,
  picksByMatch: KnockoutPicksByMatch
): KnockoutPicksByMatch {
  const nextByCode = new Map(matches.map((match) => [match.code, match.nextMatchCode]));
  const next = { ...picksByMatch };
  let current = nextByCode.get(changedMatchCode) ?? null;

  while (current) {
    delete next[current];
    current = nextByCode.get(current) ?? null;
  }

  return next;
}
