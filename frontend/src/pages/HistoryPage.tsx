import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { EmptyState, ErrorBanner, Skeleton } from "../components/FeedbackBits";
import { StatusBadge } from "../components/StatusBadge";
import { apiClient, getErrorMessage } from "../services/api";
import type { HistoryItem } from "../types/domain";

export function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .getHistory()
      .then(setItems)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const grouped = useMemo(() => {
    const map = new Map<string, HistoryItem[]>();
    for (const item of items) {
      const list = map.get(item.problemId) ?? [];
      list.push(item);
      map.set(item.problemId, list);
    }
    return [...map.values()];
  }, [items]);

  return (
    <div className="page-wrap bg-[var(--bg)]">
      {error && (
        <div className="mb-6">
          <ErrorBanner message={error} />
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-16" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title="No submissions yet"
          body="Complete your first LLD challenge to start building your design history."
          action={
            <Link className="btn-primary" to="/problems">
              Browse Problems
            </Link>
          }
        />
      ) : (
        <div className="space-y-8">
          {grouped.map((group) => (
            <section key={group[0].problemId} className="space-y-3">
              <h2 className="text-[2.1rem] font-semibold tracking-[-0.06em] text-[var(--text-primary)]">
                {group[0].problemTitle}
              </h2>

              <ul className="overflow-hidden rounded-[14px] border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow-soft)]">
                {[...group]
                  .sort((a, b) => a.attemptNumber - b.attemptNumber)
                  .map((item) => (
                    <li key={item.id} className="border-b border-[var(--border)] last:border-b-0">
                      <Link
                        to={`/submissions/${item.id}`}
                        className="flex flex-col gap-3 px-5 py-4 transition duration-200 hover:bg-[var(--surface-soft)] sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <p className="text-[13px] font-medium text-[var(--text-muted)]">Attempt {item.attemptNumber}</p>
                          <p className="mt-1 text-[12px] text-[var(--text-muted)]">
                            {new Date(item.createdAt).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="tabular text-[14px] font-semibold tracking-[-0.02em] text-[var(--text-primary)]">
                            {item.score === null ? "—" : `${item.score} / 10`}
                          </span>
                          <StatusBadge status={item.status} />
                        </div>
                      </Link>
                    </li>
                  ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
