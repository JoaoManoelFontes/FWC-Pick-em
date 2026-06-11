import type { PickType } from "@/types/picks";

export type TeamResult = {
  group_position: number | null;
  qualified: boolean;
};

export function calculatePickPoints(pickType: PickType, result: TeamResult): number {
  if (pickType === "GROUP_WINNER") {
    return result.group_position === 1 ? 1 : 0;
  }

  if (pickType === "QUALIFIED_NOT_WINNER") {
    return result.qualified && result.group_position !== 1 ? 1 : 0;
  }

  return result.qualified ? 0 : 1;
}
