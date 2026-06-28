"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { submitKnockoutPicksAction } from "@/actions/knockout";
import { clearDescendantPicks, resolveKnockoutMatches } from "@/lib/knockout/bracket";
import { getFriendlyTeamCode, KNOCKOUT_ROUND_LABELS, KNOCKOUT_ROUND_ORDER, TOTAL_KNOCKOUT_PICKS } from "@/lib/knockout/constants";
import type {
  KnockoutMatch,
  KnockoutPickInput,
  KnockoutPicksByMatch,
  KnockoutRound,
  KnockoutSubmissionSummary,
  ResolvedKnockoutSlot
} from "@/types/knockout";
import type { Team } from "@/types/picks";

type KnockoutBracketProps = {
  matches: KnockoutMatch[];
  nickname: string;
  deadlineLabel: string;
  locked: boolean;
  submission: KnockoutSubmissionSummary | null;
};

function slotLabel(slot: ResolvedKnockoutSlot): string {
  return slot.team ? `${slot.team.flag_emoji ?? ""} ${getFriendlyTeamCode(slot.team.code)}`.trim() : slot.placeholder;
}

function teamTitle(team: Team | null): string {
  return team ? `${team.name} (${team.code})` : "Slot bloqueado";
}

function MatchCard({
  match,
  readonly,
  onPick
}: {
  match: ReturnType<typeof resolveKnockoutMatches>[number];
  readonly: boolean;
  onPick: (matchCode: string, teamId: string) => void;
}) {
  const ready = Boolean(match.homeSlot.team && match.awaySlot.team);

  function renderSlot(slot: ResolvedKnockoutSlot) {
    const selected = slot.team?.id === match.pickedTeam?.id;
    const baseClass = clsx(
      "flex h-11 w-full items-center justify-between rounded-xl border px-3 text-left text-sm font-black transition",
      selected ? "border-sky-400 bg-sky-950/50 text-sky-100" : "border-slate-700 bg-slate-950 text-slate-200",
      !readonly && ready && slot.team ? "hover:border-sky-400 hover:bg-slate-800" : "",
      !slot.team ? "text-slate-500" : ""
    );

    if (readonly || !ready || !slot.team) {
      return (
        <div className={baseClass} title={teamTitle(slot.team)} aria-label={teamTitle(slot.team)}>
          <span className="truncate">{slotLabel(slot)}</span>
          {selected ? <span className="ml-2 text-xs text-sky-300">Vence</span> : null}
        </div>
      );
    }

    return (
      <button
        type="button"
        className={baseClass}
        title={teamTitle(slot.team)}
        aria-label={`Escolher ${teamTitle(slot.team)} como vencedor de ${match.code}`}
        onClick={() => {
          if (slot.team) {
            onPick(match.code, slot.team.id);
          }
        }}
      >
        <span className="truncate">{slotLabel(slot)}</span>
        {selected ? <span className="ml-2 text-xs text-sky-300">Vence</span> : null}
      </button>
    );
  }

  return (
    <article className="rounded-2xl border border-slate-700 bg-slate-900 p-3 shadow">
      <div className="mb-3 flex items-center justify-between gap-3 text-xs font-bold uppercase text-slate-500">
        <span>{match.code}</span>
        <span>{match.points} pts</span>
      </div>
      <div className="space-y-2">
        {renderSlot(match.homeSlot)}
        {renderSlot(match.awaySlot)}
      </div>
    </article>
  );
}

export function KnockoutBracket({ matches, nickname, deadlineLabel, locked, submission }: KnockoutBracketProps) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const readonly = Boolean(submission) || locked;

  const initialPicks = useMemo(() => {
    const picks: KnockoutPicksByMatch = {};
    submission?.picks.forEach((pick) => {
      picks[pick.matchCode] = pick.pickedTeam.id;
    });
    return picks;
  }, [submission]);

  const [picksByMatch, setPicksByMatch] = useState<KnockoutPicksByMatch>(initialPicks);
  const resolvedMatches = useMemo(() => resolveKnockoutMatches(matches, picksByMatch), [matches, picksByMatch]);
  const total = Object.keys(picksByMatch).length;
  const complete = total === TOTAL_KNOCKOUT_PICKS;

  const matchesByRound = KNOCKOUT_ROUND_ORDER.map((round) => ({
    round,
    matches: resolvedMatches.filter((match) => match.round === round)
  }));

  function pickWinner(matchCode: string, teamId: string) {
    setMessage(null);
    setPicksByMatch((current) => {
      const next = current[matchCode] === teamId ? current : clearDescendantPicks(matches, matchCode, current);
      return { ...next, [matchCode]: teamId };
    });
  }

  function clearBracket() {
    if (window.confirm("Limpar todos os picks da chave?")) {
      setPicksByMatch({});
      setMessage(null);
    }
  }

  function toPayload(): KnockoutPickInput[] {
    return matches.map((match) => ({
      matchCode: match.code,
      pickedTeamId: picksByMatch[match.code]
    }));
  }

  function submit() {
    startTransition(async () => {
      const result = await submitKnockoutPicksAction(toPayload());
      setMessage(result.message);
      if (result.ok) {
        setModalOpen(false);
        router.refresh();
      }
    });
  }

  function renderRound(round: KnockoutRound, extraClassName = "", side?: "LEFT" | "RIGHT" | "CENTER") {
    const roundMatches = (matchesByRound.find((item) => item.round === round)?.matches ?? []).filter(
      (match) => !side || match.bracketSide === side
    );

    return (
      <section className={clsx("space-y-3", extraClassName)}>
        <h2 className="text-xs font-black uppercase text-sky-300">{KNOCKOUT_ROUND_LABELS[round]}</h2>
        {roundMatches.map((match) => (
          <MatchCard key={match.code} match={match} readonly={readonly} onPick={pickWinner} />
        ))}
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-xl">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase text-sky-300">Mata-mata 2026</p>
            <h1 className="mt-1 text-3xl font-black uppercase text-slate-50">Minha chave</h1>
            <p className="mt-2 text-sm text-slate-400">
              {submission ? `Chave enviada por ${nickname}.` : "Escolha o vencedor de cada jogo ate chegar no campeao."}
            </p>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm font-bold text-slate-300">
            {submission ? "Chave travada" : locked ? "Picks bloqueados" : `Envios abertos ate ${deadlineLabel}`}
          </div>
        </div>
        {locked && !submission ? (
          <p className="mt-4 rounded-xl border border-red-800 bg-red-950/30 p-3 text-sm text-red-300">
            O mata-mata ja comecou. Quem ainda nao enviou nao pode mais salvar a chave.
          </p>
        ) : null}
      </section>

      {!readonly ? (
        <section className="sticky top-0 z-20 flex flex-col gap-3 rounded-2xl border border-slate-700 bg-slate-950/95 p-4 shadow lg:static lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className={clsx("text-sm font-black", complete ? "text-green-300" : "text-slate-300")}>
              {total}/{TOTAL_KNOCKOUT_PICKS} picks do mata-mata
            </p>
            {message ? <p className="mt-1 text-sm text-slate-400">{message}</p> : null}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={clearBracket}
              disabled={total === 0}
              className="rounded-xl border border-slate-600 bg-slate-800 px-5 py-3 font-bold text-slate-100 hover:bg-slate-700 disabled:cursor-not-allowed disabled:border-slate-800 disabled:text-slate-500"
            >
              Limpar chave
            </button>
            <button
              type="button"
              disabled={!complete || locked}
              onClick={() => {
                setConfirmed(false);
                setModalOpen(true);
              }}
              className="rounded-xl bg-sky-500 px-5 py-3 font-bold text-slate-950 hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
            >
              Salvar chave
            </button>
          </div>
        </section>
      ) : message ? (
        <p className="rounded-xl border border-slate-700 bg-slate-900 p-3 text-sm text-slate-400">{message}</p>
      ) : null}

      <div className="space-y-5 lg:hidden">
        {matchesByRound.map(({ round }) => (
          <div key={round}>{renderRound(round)}</div>
        ))}
      </div>

      <div className="hidden gap-4 lg:grid lg:grid-cols-[1fr_1fr_0.85fr_1fr_1fr] lg:items-start">
        <div className="space-y-6">{renderRound("ROUND_OF_32", "", "LEFT")}</div>
        <div className="space-y-10 pt-12">
          {renderRound("ROUND_OF_16", "", "LEFT")}
          {renderRound("QUARTERFINAL", "", "LEFT")}
        </div>
        <div className="space-y-10 pt-40">
          {renderRound("SEMIFINAL", "", "CENTER")}
          {renderRound("FINAL", "", "CENTER")}
        </div>
        <div className="space-y-10 pt-12">
          {renderRound("QUARTERFINAL", "", "RIGHT")}
          {renderRound("ROUND_OF_16", "", "RIGHT")}
        </div>
        <div className="space-y-6">{renderRound("ROUND_OF_32", "", "RIGHT")}</div>
      </div>

      {modalOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/80 p-4">
          <section className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-2xl">
            <h2 className="text-2xl font-black uppercase text-slate-50">Envio definitivo</h2>
            <p className="mt-2 text-sm text-slate-400">Depois de salvar, sua chave nao podera ser alterada.</p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {matchesByRound.map(({ round, matches: roundMatches }) => (
                <section key={round} className="rounded-2xl border border-slate-700 bg-slate-950 p-4">
                  <h3 className="text-sm font-black uppercase text-sky-300">{KNOCKOUT_ROUND_LABELS[round]}</h3>
                  <div className="mt-3 space-y-2 text-sm text-slate-300">
                    {roundMatches.map((match) => (
                      <div key={match.code} className="flex justify-between gap-3">
                        <span className="text-slate-500">{match.code}</span>
                        <span className="font-bold text-slate-100">{match.pickedTeam ? slotLabel({ team: match.pickedTeam, placeholder: "" }) : "-"}</span>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
            <label className="mt-5 flex items-start gap-3 rounded-xl border border-slate-700 bg-slate-950 p-4 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(event) => setConfirmed(event.target.checked)}
                className="mt-1 h-4 w-4"
              />
              Entendo que o envio e definitivo e nao poderei alterar minha chave depois.
            </label>
            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-xl border border-slate-600 bg-slate-800 px-5 py-3 font-bold text-slate-100 hover:bg-slate-700"
              >
                Revisar
              </button>
              <button
                type="button"
                disabled={!confirmed || isPending}
                onClick={submit}
                className="rounded-xl bg-sky-500 px-5 py-3 font-bold text-slate-950 hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
              >
                {isPending ? "Enviando..." : "Confirmar envio"}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
