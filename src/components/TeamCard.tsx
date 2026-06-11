import clsx from "clsx";
import type { Team } from "@/types/picks";

type TeamCardProps = {
  team: Team;
  selectedLabel?: string;
  disabled?: boolean;
  locked?: boolean;
  onClick?: () => void;
};

export function TeamCard({ team, selectedLabel, disabled = false, locked = false, onClick }: TeamCardProps) {
  const isSelected = Boolean(selectedLabel);

  return (
    <button
      type="button"
      disabled={locked || (disabled && !isSelected)}
      onClick={onClick}
      className={clsx(
        "flex min-h-16 w-full items-center justify-between gap-3 rounded-2xl border bg-slate-950 px-4 py-3 text-left shadow transition",
        isSelected && "border-sky-400 bg-sky-950/40",
        !isSelected && !disabled && !locked && "border-slate-700 hover:border-sky-400 hover:bg-slate-800",
        disabled && !isSelected && "border-slate-800 opacity-45",
        locked && "cursor-not-allowed border-slate-800 opacity-70"
      )}
    >
      <span className="flex min-w-0 items-center gap-3">
        <span className="text-2xl" aria-hidden>
          {team.flag_emoji ?? "🏳️"}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-black uppercase text-slate-100">{team.name}</span>
          <span className="text-xs font-bold text-slate-500">{team.code}</span>
        </span>
      </span>
      {selectedLabel ? (
        <span className="shrink-0 rounded-full border border-sky-500/60 px-2 py-1 text-xs font-bold text-sky-300">
          {selectedLabel}
        </span>
      ) : null}
    </button>
  );
}
