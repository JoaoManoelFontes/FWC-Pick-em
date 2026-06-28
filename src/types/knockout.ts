import type { Team } from "./picks";

export type KnockoutRound = "ROUND_OF_32" | "ROUND_OF_16" | "QUARTERFINAL" | "SEMIFINAL" | "FINAL";
export type KnockoutBracketSide = "LEFT" | "RIGHT" | "CENTER";
export type KnockoutSlotName = "home" | "away";

export type KnockoutMatch = {
  id: string;
  code: string;
  fifaMatchNumber: number | null;
  round: KnockoutRound;
  bracketSide: KnockoutBracketSide;
  displayOrder: number;
  homeTeam: Team | null;
  awayTeam: Team | null;
  homeSourceMatchCode: string | null;
  awaySourceMatchCode: string | null;
  nextMatchCode: string | null;
  nextSlot: KnockoutSlotName | null;
  points: number;
};

export type KnockoutPickInput = {
  matchCode: string;
  pickedTeamId: string;
};

export type KnockoutPickWithTeam = {
  matchCode: string;
  pickedTeam: Team;
};

export type KnockoutSubmissionSummary = {
  id: string;
  submittedAt: string;
  picks: KnockoutPickWithTeam[];
};

export type ResolvedKnockoutSlot = {
  team: Team | null;
  placeholder: string;
};

export type ResolvedKnockoutMatch = KnockoutMatch & {
  homeSlot: ResolvedKnockoutSlot;
  awaySlot: ResolvedKnockoutSlot;
  pickedTeam: Team | null;
};

export type KnockoutPicksByMatch = Record<string, string>;
