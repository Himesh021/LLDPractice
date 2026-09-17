import type { ReactNode } from "react";

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-[6px] bg-[var(--surface-soft)] ${className}`} />;
}

export function ErrorBanner({ message, title = "Something went wrong" }: { message: string; title?: string }) {
  return (
    <div role="alert" className="rounded-[6px] border border-[rgba(248,113,113,0.28)] bg-[rgba(248,113,113,0.08)] px-4 py-3">
      <p className="text-sm font-medium text-[var(--text-primary)]">{title}</p>
      <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">{message}</p>
    </div>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="card px-6 py-14 text-center">
      <h2 className="text-base font-semibold tracking-tight text-[var(--text-primary)]">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--text-secondary)]">{body}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
