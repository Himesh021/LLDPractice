import type { Difficulty } from "../types/domain";

const styles: Record<Difficulty, string> = {
  Easy: "border-emerald-200/80 bg-emerald-50 text-emerald-800",
  Medium: "border-amber-200/80 bg-amber-50 text-amber-800",
  Hard: "border-rose-200/80 bg-rose-50 text-rose-800",
};

const dots: Record<Difficulty, string> = {
  Easy: "bg-emerald-600",
  Medium: "bg-amber-500",
  Hard: "bg-rose-600",
};

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-[3px] text-[11px] font-medium ${styles[difficulty]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dots[difficulty]}`} aria-hidden="true" />
      {difficulty}
    </span>
  );
}
