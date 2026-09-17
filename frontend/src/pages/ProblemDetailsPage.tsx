import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { DifficultyBadge } from "../components/DifficultyBadge";
import { ErrorBanner, Skeleton } from "../components/FeedbackBits";
import { apiClient, getErrorMessage } from "../services/api";
import type { Problem } from "../types/domain";

export function ProblemDetailsPage() {
  const { id } = useParams();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      return;
    }
    apiClient
      .getProblem(id)
      .then(setProblem)
      .catch((err) => setError(getErrorMessage(err)));
  }, [id]);

  if (error) {
    return (
      <div className="page-wrap">
        <ErrorBanner message={error} />
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="page-wrap space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  return (
    <div className="page-wrap">
      <Link
        to="/problems"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--text-secondary)] transition-colors duration-200 hover:text-[var(--text-primary)]"
      >
        <span aria-hidden="true">←</span>
        Problems
      </Link>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <h1 className="text-[1.75rem] font-semibold tracking-[-0.02em] text-white">{problem.title}</h1>
        <DifficultyBadge difficulty={problem.difficulty} />
      </div>
      <p className="mt-3 max-w-3xl text-[15px] leading-7 text-[var(--text-secondary)]">{problem.description}</p>

      <Section title="Requirements" items={problem.requirements} />
      <Section title="Constraints" items={problem.constraints} />

      <h2 className="mt-8 text-sm font-semibold tracking-[-0.02em] text-[var(--text-primary)]">Expected concepts</h2>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {problem.expectedConcepts.map((concept) => (
          <span key={concept} className="chip">
            {concept}
          </span>
        ))}
      </div>

      <Link to={`/problems/${problem.id}/practice`} className="btn-accent mt-8">
        Start Practice
      </Link>
    </div>
  );
}

function Section({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="mt-8">
      <h2 className="text-sm font-semibold tracking-[-0.02em] text-[var(--text-primary)]">{title}</h2>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--text-secondary)]">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-[var(--text-muted)]" aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
