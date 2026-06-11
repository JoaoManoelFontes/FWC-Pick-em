import { PICK_CATEGORIES } from "@/lib/picks/constants";
import type { PickSubmissionSummary } from "@/types/picks";
import { PickCategory } from "./PickCategory";

type PickSummaryProps = {
  nickname: string;
  submission: PickSubmissionSummary;
};

export function PickSummary({ nickname, submission }: PickSummaryProps) {
  const submittedAt = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(submission.submittedAt));

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-xl">
        <p className="text-sm font-bold uppercase text-sky-300">Meus picks</p>
        <h1 className="mt-2 text-3xl font-black uppercase text-slate-50">{nickname}</h1>
        <p className="mt-2 text-sm text-slate-400">Enviado em {submittedAt} BRT. Estes palpites estao travados.</p>
      </section>
      <div className="grid gap-4 lg:grid-cols-3">
        {PICK_CATEGORIES.map((category) => (
          <PickCategory
            key={category.type}
            type={category.type}
            title={category.title}
            description={category.description}
            teams={submission.picks.filter((pick) => pick.pickType === category.type).map((pick) => pick.team)}
            readonly
          />
        ))}
      </div>
    </div>
  );
}
