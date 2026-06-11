"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { submitPicksAction } from "@/actions/picks";
import { GROUP_ORDER, PICK_CATEGORIES, PICK_LIMITS, TOTAL_PICKS } from "@/lib/picks/constants";
import type { PickInput, PickType, Team } from "@/types/picks";
import { PickCategory } from "./PickCategory";
import { TeamCard } from "./TeamCard";

type PicksState = Record<PickType, Team[]>;

type PicksBoardProps = {
  teams: Team[];
  locked: boolean;
  deadlineLabel: string;
};

const initialState: PicksState = {
  GROUP_WINNER: [],
  QUALIFIED_NOT_WINNER: [],
  ELIMINATED: []
};

const categoryLabels: Record<PickType, string> = {
  GROUP_WINNER: "Lider",
  QUALIFIED_NOT_WINNER: "Classificado",
  ELIMINATED: "Eliminado"
};

export function PicksBoard({ teams, locked, deadlineLabel }: PicksBoardProps) {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<PickType>("GROUP_WINNER");
  const [picks, setPicks] = useState<PicksState>(initialState);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedByTeam = useMemo(() => {
    const map = new Map<string, PickType>();
    PICK_CATEGORIES.forEach((category) => {
      picks[category.type].forEach((team) => map.set(team.id, category.type));
    });
    return map;
  }, [picks]);

  const total = PICK_CATEGORIES.reduce((sum, category) => sum + picks[category.type].length, 0);
  const complete = total === TOTAL_PICKS && PICK_CATEGORIES.every((category) => picks[category.type].length === PICK_LIMITS[category.type]);

  const groupedTeams = GROUP_ORDER.map((group) => ({
    group,
    teams: teams.filter((team) => team.group_name === group)
  }));

  function removeTeam(teamId: string) {
    setPicks((current) => ({
      GROUP_WINNER: current.GROUP_WINNER.filter((team) => team.id !== teamId),
      QUALIFIED_NOT_WINNER: current.QUALIFIED_NOT_WINNER.filter((team) => team.id !== teamId),
      ELIMINATED: current.ELIMINATED.filter((team) => team.id !== teamId)
    }));
  }

  function toggleTeam(team: Team) {
    if (locked) {
      return;
    }

    const selectedType = selectedByTeam.get(team.id);
    if (selectedType) {
      removeTeam(team.id);
      return;
    }

    if (picks[activeCategory].length >= PICK_LIMITS[activeCategory]) {
      setMessage(`${categoryLabels[activeCategory]} ja esta completo.`);
      return;
    }

    setMessage(null);
    setPicks((current) => ({
      ...current,
      [activeCategory]: [...current[activeCategory], team]
    }));
  }

  function toPayload(): PickInput[] {
    return PICK_CATEGORIES.flatMap((category) =>
      picks[category.type].map((team) => ({
        teamId: team.id,
        pickType: category.type
      }))
    );
  }

  function submit() {
    startTransition(async () => {
      const result = await submitPicksAction(toPayload());
      setMessage(result.message);
      if (result.ok) {
        setModalOpen(false);
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase text-sky-300">Escolha suas selecoes</p>
            <h1 className="mt-1 text-3xl font-black uppercase text-slate-50">MEUS PICKS</h1>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm font-bold text-slate-300">
            {locked ? "Picks bloqueados" : `Envios abertos ate ${deadlineLabel}`}
          </div>
        </div>
        {locked ? (
          <p className="mt-4 rounded-xl border border-red-800 bg-red-950/30 p-3 text-sm text-red-300">
            A fase ja comecou. Quem ainda nao enviou nao pode mais salvar picks.
          </p>
        ) : null}
      </section>

      <div>
        <div className="grid gap-3 lg:grid-cols-3">
          {PICK_CATEGORIES.map((category) => (
            <PickCategory
              key={category.type}
              type={category.type}
              title={category.title}
              description={category.description}
              teams={picks[category.type]}
              active={activeCategory === category.type}
              readonly={locked}
              onSelect={() => setActiveCategory(category.type)}
              onRemove={removeTeam}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-700 bg-slate-900 p-4 shadow sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className={clsx("text-sm font-black", complete ? "text-green-300" : "text-slate-300")}>
            {total}/{TOTAL_PICKS} picks totais
          </p>
          {message ? <p className="mt-1 text-sm text-slate-400">{message}</p> : null}
        </div>
        <button
          type="button"
          disabled={!complete || locked}
          onClick={() => {
            setConfirmed(false);
            setModalOpen(true);
          }}
          className="rounded-xl bg-sky-500 px-5 py-3 font-bold text-slate-950 hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
        >
          Salvar picks
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {groupedTeams.map(({ group, teams: groupTeams }) => (
          <section key={group} className="rounded-2xl border border-slate-700 bg-slate-900 p-4 shadow">
            <h2 className="mb-4 text-sm font-black uppercase text-slate-100">{group}</h2>
            <div className="grid gap-3">
              {groupTeams.map((team) => {
                const selectedType = selectedByTeam.get(team.id);
                const activeFull = picks[activeCategory].length >= PICK_LIMITS[activeCategory];
                return (
                  <TeamCard
                    key={team.id}
                    team={team}
                    selectedLabel={selectedType ? categoryLabels[selectedType] : undefined}
                    disabled={Boolean(selectedType && selectedType !== activeCategory) || activeFull}
                    locked={locked}
                    onClick={() => toggleTeam(team)}
                  />
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {modalOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/80 p-4">
          <section className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-2xl">
            <h2 className="text-2xl font-black uppercase text-slate-50">Envio definitivo</h2>
            <p className="mt-2 text-sm text-slate-400">Depois de salvar, seus picks nao poderao ser alterados.</p>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {PICK_CATEGORIES.map((category) => (
                <PickCategory
                  key={category.type}
                  type={category.type}
                  title={category.title}
                  description={category.description}
                  teams={picks[category.type]}
                  readonly
                />
              ))}
            </div>
            <label className="mt-5 flex items-start gap-3 rounded-xl border border-slate-700 bg-slate-950 p-4 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(event) => setConfirmed(event.target.checked)}
                className="mt-1 h-4 w-4"
              />
              Entendo que o envio e definitivo e nao poderei alterar meus picks depois.
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
