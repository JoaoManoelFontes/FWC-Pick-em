import Link from "next/link";
import {
  formatBrasiliaDeadline,
  getKnockoutPicksLockedAt,
  isKnockoutPicksLocked
} from "@/lib/picks/deadline";

export default function HomePage() {
  const locked = isKnockoutPicksLocked();

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div className="space-y-6">
          <div className="inline-flex rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-bold text-sky-300">
            {locked ? "Mata-mata bloqueado" : `Mata-mata aberto ate ${formatBrasiliaDeadline(getKnockoutPicksLockedAt())}`}
          </div>
          <div className="space-y-4">
            <h1 className="max-w-3xl text-4xl font-black uppercase text-slate-50 sm:text-6xl">
              Bolao Pick&apos;em Copa
            </h1>
            <p className="max-w-2xl text-lg text-slate-300">
              Monte sua chave completa do mata-mata: 31 vencedores, do primeiro jogo ate o campeao. Enviou, travou.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link className="rounded-xl bg-sky-500 px-5 py-3 font-bold text-slate-950 hover:bg-sky-400" href="/mata-mata">
              Montar mata-mata
            </Link>
            <Link
              className="rounded-xl border border-slate-600 bg-slate-800 px-5 py-3 font-bold text-slate-100 hover:bg-slate-700"
              href="/picks"
            >
              Rever fase de grupos
            </Link>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-xl">
          <h2 className="text-lg font-black uppercase text-slate-100">Regras rapidas</h2>
          <div className="mt-5 grid gap-3 text-sm text-slate-300">
            <div className="rounded-xl border border-slate-700 bg-slate-950 p-4">Escolha um vencedor para cada jogo da chave.</div>
            <div className="rounded-xl border border-slate-700 bg-slate-950 p-4">Oitavas, quartas, semi e final nascem dos seus picks anteriores.</div>
            <div className="rounded-xl border border-slate-700 bg-slate-950 p-4">A chave e unica, definitiva e independente da fase de grupos.</div>
          </div>
        </div>
      </section>
    </main>
  );
}
