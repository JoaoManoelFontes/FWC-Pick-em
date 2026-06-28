import { redirect } from "next/navigation";
import { KnockoutBracket } from "@/components/KnockoutBracket";
import { getAppSession } from "@/lib/auth/session";
import { formatBrasiliaDeadline, getKnockoutPicksLockedAt, isKnockoutPicksLocked } from "@/lib/picks/deadline";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  KnockoutBracketSide,
  KnockoutMatch,
  KnockoutRound,
  KnockoutSlotName,
  KnockoutSubmissionSummary
} from "@/types/knockout";
import type { Team } from "@/types/picks";

type KnockoutMatchRow = {
  id: string;
  code: string;
  fifa_match_number: number | null;
  round: KnockoutRound;
  bracket_side: KnockoutBracketSide;
  display_order: number;
  home_team_id: string | null;
  away_team_id: string | null;
  home_source_match_code: string | null;
  away_source_match_code: string | null;
  next_match_code: string | null;
  next_slot: KnockoutSlotName | null;
  points: number;
};

type KnockoutPickRow = {
  match_id: string;
  picked_team_id: string;
};

export default async function KnockoutPage() {
  const session = getAppSession();

  if (!session) {
    redirect("/login?next=/mata-mata");
  }

  const supabase = createAdminClient();
  const { data: profileData } = await supabase
    .from("profiles")
    .select("id,nickname")
    .eq("id", session.userId)
    .maybeSingle();
  const profile = profileData as { id: string; nickname: string } | null;

  if (!profile?.nickname) {
    redirect("/profile?next=/mata-mata");
  }

  const { data: teamsData } = await supabase.from("teams").select("id,name,code,group_name,flag_emoji");
  const teams = (teamsData ?? []) as Team[];
  const teamsById = new Map(teams.map((team) => [team.id, team]));

  const { data: matchRows } = await supabase
    .from("knockout_matches")
    .select(
      "id,code,fifa_match_number,round,bracket_side,display_order,home_team_id,away_team_id,home_source_match_code,away_source_match_code,next_match_code,next_slot,points"
    )
    .order("display_order");

  const matches: KnockoutMatch[] = ((matchRows ?? []) as KnockoutMatchRow[]).map((match) => ({
    id: match.id,
    code: match.code,
    fifaMatchNumber: match.fifa_match_number,
    round: match.round,
    bracketSide: match.bracket_side,
    displayOrder: match.display_order,
    homeTeam: match.home_team_id ? teamsById.get(match.home_team_id) ?? null : null,
    awayTeam: match.away_team_id ? teamsById.get(match.away_team_id) ?? null : null,
    homeSourceMatchCode: match.home_source_match_code,
    awaySourceMatchCode: match.away_source_match_code,
    nextMatchCode: match.next_match_code,
    nextSlot: match.next_slot,
    points: match.points
  }));

  const { data: submissionData } = await supabase
    .from("knockout_submissions")
    .select("id,submitted_at")
    .eq("user_id", session.userId)
    .maybeSingle();
  const submissionRow = submissionData as { id: string; submitted_at: string } | null;

  let submission: KnockoutSubmissionSummary | null = null;
  if (submissionRow) {
    const { data: pickRows } = await supabase
      .from("knockout_picks")
      .select("match_id,picked_team_id")
      .eq("submission_id", submissionRow.id);
    const matchCodeById = new Map(matches.map((match) => [match.id, match.code]));

    submission = {
      id: submissionRow.id,
      submittedAt: submissionRow.submitted_at,
      picks: ((pickRows ?? []) as KnockoutPickRow[])
        .map((pick) => ({
          matchCode: matchCodeById.get(pick.match_id) ?? "",
          pickedTeam: teamsById.get(pick.picked_team_id) ?? null
        }))
        .filter((pick): pick is { matchCode: string; pickedTeam: Team } => Boolean(pick.matchCode && pick.pickedTeam))
    };
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <KnockoutBracket
        matches={matches}
        nickname={profile.nickname}
        deadlineLabel={formatBrasiliaDeadline(getKnockoutPicksLockedAt())}
        locked={isKnockoutPicksLocked()}
        submission={submission}
      />
    </main>
  );
}
