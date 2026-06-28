import clsx from "clsx";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type RankingRow = {
  user_id: string;
  nickname: string;
  submitted_at: string;
  total_points: number;
  correct_picks: number;
  scored_picks: number;
};

const positionStyles: Record<number, string> = {
  1: "border-yellow-400/80 bg-yellow-400/10 text-yellow-200",
  2: "border-slate-300/70 bg-slate-300/10 text-slate-100",
  3: "border-amber-700/80 bg-amber-700/10 text-amber-200"
};

function formatSubmittedAt(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}

function getPositionLabel(position: number) {
  if (position === 1) {
    return "Campeao";
  }

  if (position === 2) {
    return "Vice";
  }

  if (position === 3) {
    return "Top 3";
  }

  return "Participante";
}

export default async function RankingPage() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("ranking_scores")
    .select("user_id,nickname,submitted_at,total_points,correct_picks,scored_picks")
    .order("total_points", { ascending: false })
    .order("submitted_at", { ascending: true });

  const ranking = (data ?? []) as RankingRow[];
  const podium = ranking.slice(0, 3);
  const leader = ranking[0];

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-xl">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="text-sm font-bold uppercase text-sky-300">Ranking final</p>
              <h1 className="mt-2 text-3xl font-black uppercase text-slate-50 sm:text-5xl">
                Bolao Pick&apos;em Copa
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-slate-400">
                Pontuacao da fase de grupos. Empates sao decididos pelo envio mais antigo.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 rounded-2xl border border-slate-700 bg-slate-950 p-3 text-center">
              <div>
                <p className="text-2xl font-black text-slate-50">{ranking.length}</p>
                <p className="text-xs font-bold uppercase text-slate-500">Jogadores</p>
              </div>
              <div>
                <p className="text-2xl font-black text-sky-300">{leader?.total_points ?? 0}</p>
                <p className="text-xs font-bold uppercase text-slate-500">Maior score</p>
              </div>
              <div>
                <p className="text-2xl font-black text-green-300">{leader?.correct_picks ?? 0}/22</p>
                <p className="text-xs font-bold uppercase text-slate-500">Melhor acerto</p>
              </div>
            </div>
          </div>
        </section>

        {error ? (
          <section className="rounded-2xl border border-red-500 bg-red-950/20 p-6 text-red-200 shadow-xl">
            Nao foi possivel carregar o ranking: {error.message}
          </section>
        ) : null}

        {!error && ranking.length === 0 ? (
          <section className="rounded-2xl border border-slate-700 bg-slate-900 p-6 text-slate-400 shadow-xl">
            O ranking ainda nao tem pontuacoes calculadas.
          </section>
        ) : null}

        {podium.length > 0 ? (
          <section className="grid gap-4 lg:grid-cols-3">
            {podium.map((row, index) => {
              const position = index + 1;

              return (
                <article
                  key={row.user_id}
                  className={clsx(
                    "rounded-2xl border bg-slate-900 p-5 shadow-xl",
                    positionStyles[position] ?? "border-slate-700"
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs font-black uppercase text-slate-400">{getPositionLabel(position)}</p>
                      <h2 className="mt-2 truncate text-2xl font-black uppercase text-slate-50">{row.nickname}</h2>
                    </div>
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-current text-xl font-black">
                      {position}
                    </span>
                  </div>
                  <div className="mt-6 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-4xl font-black text-slate-50">{row.total_points}</p>
                      <p className="text-xs font-bold uppercase text-slate-500">pontos</p>
                    </div>
                    <div className="text-right text-sm text-slate-300">
                      <p className="font-bold">
                        {row.correct_picks}/{row.scored_picks} acertos
                      </p>
                      <p className="text-xs text-slate-500">{formatSubmittedAt(row.submitted_at)} BRT</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        ) : null}

        {ranking.length > 0 ? (
          <section className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-xl">
            <div className="border-b border-slate-700 px-5 py-4">
              <h2 className="text-sm font-black uppercase text-slate-100">Classificacao geral</h2>
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[720px] border-collapse text-left">
                <thead className="bg-slate-950 text-xs font-black uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Posicao</th>
                    <th className="px-5 py-3">Jogador</th>
                    <th className="px-5 py-3 text-right">Pontos</th>
                    <th className="px-5 py-3 text-right">Acertos</th>
                    <th className="px-5 py-3 text-right">Envio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {ranking.map((row, index) => {
                    const position = index + 1;

                    return (
                      <tr key={row.user_id} className={clsx(position === 1 ? "bg-yellow-400/5" : "bg-slate-900")}>
                        <td className="px-5 py-4">
                          <span
                            className={clsx(
                              "inline-flex h-9 min-w-9 items-center justify-center rounded-xl border px-3 text-sm font-black",
                              positionStyles[position] ?? "border-slate-700 text-slate-300"
                            )}
                          >
                            {position}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-black uppercase text-slate-100">{row.nickname}</p>
                          <p className="text-xs text-slate-500">{getPositionLabel(position)}</p>
                        </td>
                        <td className="px-5 py-4 text-right text-2xl font-black text-slate-50">{row.total_points}</td>
                        <td className="px-5 py-4 text-right font-bold text-green-300">
                          {row.correct_picks}/{row.scored_picks}
                        </td>
                        <td className="px-5 py-4 text-right text-sm text-slate-400">
                          {formatSubmittedAt(row.submitted_at)} BRT
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="grid gap-3 p-4 md:hidden">
              {ranking.map((row, index) => {
                const position = index + 1;

                return (
                  <article key={row.user_id} className="rounded-2xl border border-slate-700 bg-slate-950 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-xs font-black uppercase text-slate-500">#{position}</p>
                        <h3 className="mt-1 truncate text-lg font-black uppercase text-slate-100">{row.nickname}</h3>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-slate-50">{row.total_points}</p>
                        <p className="text-xs font-bold uppercase text-slate-500">pontos</p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-800 pt-3 text-sm">
                      <span className="font-bold text-green-300">
                        {row.correct_picks}/{row.scored_picks} acertos
                      </span>
                      <span className="text-right text-xs text-slate-500">{formatSubmittedAt(row.submitted_at)} BRT</span>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
