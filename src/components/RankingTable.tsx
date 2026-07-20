import clsx from "clsx";

type RankingTableProps = {
  title: string;
  rows: {
    userId: string;
    nickname: string;
    score: string;
    scoreLabel: string;
    detail: string;
    submittedAt: string | null;
    columns?: {
      label: string;
      value: string;
      className?: string;
    }[];
  }[];
  emptyMessage: string;
};

const positionStyles: Record<number, string> = {
  1: "border-yellow-400/80 bg-yellow-400/10 text-yellow-200",
  2: "border-slate-300/70 bg-slate-300/10 text-slate-100",
  3: "border-amber-700/80 bg-amber-700/10 text-amber-200"
};

function formatSubmittedAt(value: string | null) {
  if (!value) {
    return "Sem envio";
  }

  return `${new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value))} BRT`;
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

export function RankingTable({ title, rows, emptyMessage }: RankingTableProps) {
  const podium = rows.slice(0, 3);
  const leader = rows[0];

  if (rows.length === 0) {
    return (
      <section className="rounded-2xl border border-slate-700 bg-slate-900 p-6 text-slate-400 shadow-xl">
        {emptyMessage}
      </section>
    );
  }

  return (
    <>
      <section className="grid gap-4 lg:grid-cols-3">
        {podium.map((row, index) => {
          const position = index + 1;

          return (
            <article
              key={row.userId}
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
                  <p className="text-4xl font-black text-slate-50">{row.score}</p>
                  <p className="text-xs font-bold uppercase text-slate-500">{row.scoreLabel}</p>
                </div>
                <div className="text-right text-sm text-slate-300">
                  <p className="font-bold">{row.detail}</p>
                  <p className="text-xs text-slate-500">{formatSubmittedAt(row.submittedAt)}</p>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-xl">
        <div className="flex flex-col gap-3 border-b border-slate-700 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm font-black uppercase text-slate-100">{title}</h2>
          <p className="text-xs font-bold uppercase text-slate-500">
            Lider: {leader.nickname} · {leader.score} {leader.scoreLabel}
          </p>
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead className="bg-slate-950 text-xs font-black uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3">Posicao</th>
                <th className="px-5 py-3">Jogador</th>
                <th className="px-5 py-3 text-right">Score</th>
                <th className="px-5 py-3 text-right">Detalhe</th>
                <th className="px-5 py-3 text-right">Envio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {rows.map((row, index) => {
                const position = index + 1;

                return (
                  <tr key={row.userId} className={clsx(position === 1 ? "bg-yellow-400/5" : "bg-slate-900")}>
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
                    <td className="px-5 py-4 text-right">
                      <p className="text-2xl font-black text-slate-50">{row.score}</p>
                      <p className="text-xs font-bold uppercase text-slate-500">{row.scoreLabel}</p>
                    </td>
                    <td className="px-5 py-4 text-right font-bold text-green-300">{row.detail}</td>
                    <td className="px-5 py-4 text-right text-sm text-slate-400">
                      {formatSubmittedAt(row.submittedAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="grid gap-3 p-4 md:hidden">
          {rows.map((row, index) => {
            const position = index + 1;

            return (
              <article key={row.userId} className="rounded-2xl border border-slate-700 bg-slate-950 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-black uppercase text-slate-500">#{position}</p>
                    <h3 className="mt-1 truncate text-lg font-black uppercase text-slate-100">{row.nickname}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-slate-50">{row.score}</p>
                    <p className="text-xs font-bold uppercase text-slate-500">{row.scoreLabel}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-800 pt-3 text-sm">
                  <span className="font-bold text-green-300">{row.detail}</span>
                  <span className="text-right text-xs text-slate-500">{formatSubmittedAt(row.submittedAt)}</span>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
}
