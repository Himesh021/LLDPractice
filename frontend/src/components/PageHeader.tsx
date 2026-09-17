import type { ReactNode } from "react";

export function PageHeader({
  kicker,
  title,
  description,
  action,
}: {
  kicker?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-col gap-4 border-b border-ink-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {kicker ? <p className="label-muted">{kicker}</p> : null}
        <h1 className={`${kicker ? "mt-2" : ""} text-[1.75rem] font-semibold leading-tight tracking-[-0.02em] text-[var(--text-primary)]`}>
          {title}
        </h1>
        {description ? <p className="mt-2 max-w-xl text-[15px] leading-6 text-[var(--text-secondary)]">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}
