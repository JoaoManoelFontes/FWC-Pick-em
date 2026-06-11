import { redirect } from "next/navigation";
import { PicksBoard } from "@/components/PicksBoard";
import { PickSummary } from "@/components/PickSummary";
import { formatBrasiliaDeadline, isPicksLocked } from "@/lib/picks/deadline";
import { createClient } from "@/lib/supabase/server";
import type { PickSubmissionSummary, PickType, Team } from "@/types/picks";

type SubmissionRow = {
  id: string;
  submitted_at: string;
};

type ProfileRow = {
  id: string;
  nickname: string;
};

type PickRow = {
  pick_type: PickType;
  teams: Team | null;
};

export default async function PicksPage() {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profileData } = await supabase
    .from("profiles")
    .select("id,nickname")
    .eq("id", user.id)
    .maybeSingle();
  const profile = profileData as ProfileRow | null;

  if (!profile) {
    redirect("/profile");
  }

  const { data: teamsData } = await supabase.from("teams").select("id,name,code,group_name,flag_emoji").order("group_name").order("name");
  const teams = (teamsData ?? []) as Team[];

  const { data: submissionData } = await supabase
    .from("pick_submissions")
    .select("id,submitted_at")
    .eq("user_id", user.id)
    .maybeSingle();
  const submission = submissionData as SubmissionRow | null;

  if (submission) {
    const { data: pickRows } = await supabase
      .from("picks")
      .select("pick_type,teams(id,name,code,group_name,flag_emoji)")
      .eq("submission_id", submission.id);

    const summary: PickSubmissionSummary = {
      id: submission.id,
      submittedAt: submission.submitted_at,
      picks: ((pickRows ?? []) as PickRow[])
        .filter((row) => row.teams)
        .map((row) => ({
          pickType: row.pick_type,
          team: row.teams as Team
        }))
    };

    return (
      <main className="mx-auto max-w-6xl px-4 py-6">
        <PickSummary nickname={profile.nickname} submission={summary} />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <PicksBoard teams={teams} locked={isPicksLocked()} deadlineLabel={formatBrasiliaDeadline()} />
    </main>
  );
}
