import Link from "next/link";
import { RankingTable } from "@/components/RankingTable";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type GeneralRankingRow = {
  user_id: string;
  nickname: string;
  group_points: number;
  knockout_points: number;
  total_points: number;
  correct_group_picks: number;
  correct_knockout_picks: number;
  scored_group_picks: number;
  scored_knockout_picks: number;
  group_submitted_at: string | null;
  knockout_submitted_at: string | null;
};

function formatWeightedScore(groupPoints: number, knockoutPoints: number) {
  return ((groupPoints + knockoutPoints * 2) / 3).toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  });
}

export default async function RankingPage() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("combined_ranking_scores")
    .select(
      "user_id,nickname,group_points,knockout_points,total_points,correct_group_picks,correct_knockout_picks,scored_group_picks,scored_knockout_picks,group_submitted_at,knockout_submitted_at"
    );

  const ranking = ((data ?? []) as GeneralRankingRow[])
    .filter((row) => row.group_points > 0 && row.knockout_points > 0)
    .sort((a, b) => {
      const scoreDiff = b.group_points + b.knockout_points * 2 - (a.group_points + a.knockout_points * 2);

      if (scoreDiff !== 0) {
        return scoreDiff;
      }

      return (a.group_submitted_at ?? "").localeCompare(b.group_submitted_at ?? "");
    });

  const leader = ranking[0];

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-xl">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="text-sm font-bold uppercase text-sky-300">Ranking geral</p>
              <h1 className="mt-2 text-3xl font-black uppercase text-slate-50 sm:text-5xl">
                Grupos + Mata-mata
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-slate-400">
                Media ponderada: fase de grupos peso 1 e mata-mata peso 2. Jogadores com zero em qualquer fase ficam fora.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 rounded-2xl border border-slate-700 bg-slate-950 p-3 text-center">
              <div>
                <p className="text-2xl font-black text-slate-50">{ranking.length}</p>
                <p className="text-xs font-bold uppercase text-slate-500">Jogadores</p>
              </div>
              <div>
                <p className="text-2xl font-black text-sky-300">
                  {leader ? formatWeightedScore(leader.group_points, leader.knockout_points) : "0,0"}
                </p>
                <p className="text-xs font-bold uppercase text-slate-500">Melhor media</p>
              </div>
              <div>
                <p className="text-2xl font-black text-green-300">{leader?.total_points ?? 0}</p>
                <p className="text-xs font-bold uppercase text-slate-500">Pontos crus</p>
              </div>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-sky-400" href="/ranking">
              Geral
            </Link>
            <Link
              className="rounded-xl border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-bold text-slate-100 hover:bg-slate-700"
              href="/ranking/mata-mata"
            >
              Mata-mata
            </Link>
          </div>
        </section>

        {error ? (
          <section className="rounded-2xl border border-red-500 bg-red-950/20 p-6 text-red-200 shadow-xl">
            Nao foi possivel carregar o ranking: {error.message}
          </section>
        ) : null}

        {!error ? (
          <RankingTable
            title="Classificacao geral ponderada"
            emptyMessage="O ranking geral ainda nao tem jogadores com pontuacao nas duas fases."
            rows={ranking.map((row) => ({
              userId: row.user_id,
              nickname: row.nickname,
              score: formatWeightedScore(row.group_points, row.knockout_points),
              scoreLabel: "media",
              detail: `${row.group_points} grupos · ${row.knockout_points} mata-mata`,
              submittedAt: row.group_submitted_at
            }))}
          />
        ) : null}
      </div>
    </main>
  );
}
