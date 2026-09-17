import type { ReactNode } from "react";

export function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <div className="group card px-4 py-3.5 transition duration-200 hover:-translate-y-px hover:border-[rgba(96,165,250,0.4)]">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--text-muted)]">{label}</p>
        <span className="text-[var(--text-muted)] transition-colors duration-200 group-hover:text-[var(--accent)]" aria-hidden="true">
          {icon}
        </span>
      </div>
      <p className="mt-2.5 text-[1.65rem] font-semibold leading-none tracking-[-0.03em] text-[var(--text-primary)] tabular">{value}</p>
    </div>
  );
}
