import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { EmptyState, ErrorBanner, Skeleton } from "../components/FeedbackBits";
import { PageHeader } from "../components/PageHeader";
import { ProblemCard } from "../components/ProblemCard";
import { StatCard } from "../components/StatCard";
import { apiClient, getErrorMessage } from "../services/api";
import type { DashboardStats, Problem } from "../types/domain";

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [nextStats, nextProblems] = await Promise.all([apiClient.getStats(), apiClient.getProblems()]);
        if (!cancelled) {
          setStats(nextStats);
          setProblems(nextProblems);
        }
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="page-wrap">
      <PageHeader
        kicker="Practice dashboard"
        title="Practice Dashboard"
        description="Master low-level design through deliberate practice."
      />

      {error && <div className="mb-6"><ErrorBanner message={error} /></div>}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Progress overview">
        {loading || !stats ? (
          Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-[88px]" />)
        ) : (
          <>
            <StatCard label="Problems" value={String(stats.problemCount)} icon={<GridIcon />} />
            <StatCard label="Attempted" value={String(stats.problemsAttempted)} icon={<EditIcon />} />
            <StatCard label="Solved" value={String(stats.problemsSolved)} icon={<CheckIcon />} />
            <StatCard
              label="Avg Score"
              value={stats.averageScore === null ? "—" : `${stats.averageScore} / 10`}
              icon={<ScoreIcon />}
            />
          </>
        )}
      </section>

      <section className="mt-10">
        <div className="mb-4 flex items-end justify-between gap-3">
          <h2 className="text-base font-semibold tracking-[-0.02em] text-[var(--text-primary)]">Problem Library</h2>
          <Link
            to="/problems"
            className="text-sm font-medium text-[var(--text-secondary)] transition-colors duration-200 hover:text-[var(--accent)]"
          >
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-3 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-40" />
            ))}
          </div>
        ) : problems.length === 0 ? (
          <EmptyState
            title="No problems yet"
            body="Seed the database with npm run seed from the project root, then refresh."
          />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {problems.map((problem) => (
              <ProblemCard key={problem.id} problem={problem} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function GridIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 13h3l7-7-3-3-7 7v3z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3.5 8.5 6.5 11.5 12.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ScoreIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 12V8.5M8 12V4M13 12V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
