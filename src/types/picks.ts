export type PickType = "GROUP_WINNER" | "QUALIFIED_NOT_WINNER" | "ELIMINATED";

export type Team = {
  id: string;
  name: string;
  code: string;
  group_name: string;
  flag_emoji: string | null;
};

export type PickInput = {
  teamId: string;
  pickType: PickType;
};

export type PickWithTeam = {
  pickType: PickType;
  team: Team;
};

export type PickSubmissionSummary = {
  id: string;
  submittedAt: string;
  picks: PickWithTeam[];
};
