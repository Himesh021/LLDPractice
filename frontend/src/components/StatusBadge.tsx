export function StatusBadge({ status }: { status: string }) {
  const label =
    status === "evaluated"
      ? "Evaluated"
      : status === "failed"
        ? "Failed"
        : status === "evaluating"
          ? "Evaluating"
          : "Pending";

  const styles =
    status === "evaluated"
      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
      : status === "failed"
        ? "border-rose-500/20 bg-rose-500/10 text-rose-300"
        : status === "evaluating"
          ? "border-amber-500/20 bg-amber-500/10 text-amber-300"
          : "border-slate-500/30 bg-slate-500/10 text-slate-300";

  const dot =
    status === "evaluated"
      ? "bg-emerald-400"
      : status === "failed"
        ? "bg-rose-400"
        : status === "evaluating"
          ? "bg-amber-400"
          : "bg-slate-400";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${styles}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} aria-hidden="true" />
      {label}
    </span>
  );
}
