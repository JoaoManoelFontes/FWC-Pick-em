import clsx from "clsx";
import { PICK_LIMITS } from "@/lib/picks/constants";
import type { PickType, Team } from "@/types/picks";

type PickCategoryProps = {
  type: PickType;
  title: string;
  description: string;
  teams: Team[];
  active?: boolean;
  readonly?: boolean;
  onSelect?: () => void;
  onRemove?: (teamId: string) => void;
};

export function PickCategory({
  type,
  title,
  description,
  teams,
  active = false,
  readonly = false,
  onSelect,
  onRemove
}: PickCategoryProps) {
  const limit = PICK_LIMITS[type];
  const complete = teams.length === limit;

  return (
    <section
      className={clsx(
        "rounded-2xl border bg-slate-900 p-4 shadow transition",
        active && "border-sky-400 bg-sky-950/30",
        complete && !active && "border-green-500/80",
        !active && !complete && "border-slate-700"
      )}
    >
      <button
        type="button"
        disabled={readonly}
        onClick={onSelect}
        className="flex w-full items-start justify-between gap-3 text-left disabled:cursor-default"
      >
        <span>
          <span className="block text-sm font-black uppercase text-slate-100">{title}</span>
          <span className="mt-1 block text-xs text-slate-400">{description}</span>
        </span>
        <span
          className={clsx(
            "rounded-full border px-3 py-1 text-sm font-black",
            complete ? "border-green-500 text-green-300" : "border-slate-600 text-slate-300"
          )}
        >
          {teams.length}/{limit}
        </span>
      </button>
      <div className="mt-4 grid gap-2">
        {teams.length ? (
          teams.map((team) => (
            <div
              key={team.id}
              className="flex min-h-10 items-center justify-between gap-2 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2"
            >
              <span className="min-w-0 truncate text-sm font-bold text-slate-200">
                <span className="mr-2">{team.flag_emoji}</span>
                {team.name}
              </span>
              {!readonly ? (
                <button
                  type="button"
                  onClick={() => onRemove?.(team.id)}
                  className="rounded-lg border border-slate-700 px-2 py-1 text-xs font-bold text-slate-400 hover:border-red-500 hover:text-red-300"
                >
                  Remover
                </button>
              ) : null}
            </div>
          ))
        ) : (
          <p className="rounded-xl border border-dashed border-slate-700 px-3 py-3 text-sm text-slate-500">
            Nenhuma selecao escolhida.
          </p>
        )}
      </div>
    </section>
  );
}
