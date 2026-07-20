import Link from "next/link";
import { RankingTable } from "@/components/RankingTable";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type KnockoutRankingRow = {
  user_id: string;
  nickname: string;
  submitted_at: string;
  knockout_points: number;
  correct_knockout_picks: number;
  scored_knockout_picks: number;
};

export default async function KnockoutRankingPage() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("knockout_ranking_scores")
    .select("user_id,nickname,submitted_at,knockout_points,correct_knockout_picks,scored_knockout_picks")
    .gt("knockout_points", 0)
    .order("knockout_points", { ascending: false })
    .order("submitted_at", { ascending: true });

  const ranking = (data ?? []) as KnockoutRankingRow[];
  const leader = ranking[0];

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-xl">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="text-sm font-bold uppercase text-sky-300">Ranking mata-mata</p>
              <h1 className="mt-2 text-3xl font-black uppercase text-slate-50 sm:text-5xl">
                Chave decisiva
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-slate-400">
                Pontuacao apenas dos picks do mata-mata. Jogadores com zero ponto nao aparecem nesta tabela.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 rounded-2xl border border-slate-700 bg-slate-950 p-3 text-center">
              <div>
                <p className="text-2xl font-black text-slate-50">{ranking.length}</p>
                <p className="text-xs font-bold uppercase text-slate-500">Jogadores</p>
              </div>
              <div>
                <p className="text-2xl font-black text-sky-300">{leader?.knockout_points ?? 0}</p>
                <p className="text-xs font-bold uppercase text-slate-500">Maior score</p>
              </div>
              <div>
                <p className="text-2xl font-black text-green-300">{leader?.correct_knockout_picks ?? 0}</p>
                <p className="text-xs font-bold uppercase text-slate-500">Melhor acerto</p>
              </div>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              className="rounded-xl border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-bold text-slate-100 hover:bg-slate-700"
              href="/ranking"
            >
              Geral
            </Link>
            <Link
              className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-sky-400"
              href="/ranking/mata-mata"
            >
              Mata-mata
            </Link>
          </div>
        </section>

        {error ? (
          <section className="rounded-2xl border border-red-500 bg-red-950/20 p-6 text-red-200 shadow-xl">
            Nao foi possivel carregar o ranking do mata-mata: {error.message}
          </section>
        ) : null}

        {!error ? (
          <RankingTable
            title="Classificacao do mata-mata"
            emptyMessage="O ranking do mata-mata ainda nao tem jogadores pontuados."
            rows={ranking.map((row) => ({
              userId: row.user_id,
              nickname: row.nickname,
              score: String(row.knockout_points),
              scoreLabel: "pontos",
              detail: `${row.correct_knockout_picks}/${row.scored_knockout_picks} acertos`,
              submittedAt: row.submitted_at
            }))}
          />
        ) : null}
      </div>
    </main>
  );
}
