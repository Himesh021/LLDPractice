import { Link } from "react-router-dom";
import type { Problem } from "../types/domain";
import { DifficultyBadge } from "./DifficultyBadge";

export function ProblemCard({ problem }: { problem: Problem }) {
  return (
    <article className="group card flex flex-col p-4 transition duration-200 hover:-translate-y-px hover:border-ink-400">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-[15px] font-semibold tracking-[-0.02em] text-[var(--text-primary)]">{problem.title}</h3>
        <DifficultyBadge difficulty={problem.difficulty} />
      </div>

      <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--text-secondary)]">{problem.description}</p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {problem.expectedConcepts.slice(0, 4).map((concept) => (
          <span key={concept} className="chip">
            {concept}
          </span>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-end border-t border-ink-100 pt-3">
        <Link
          className="inline-flex items-center gap-1 text-sm font-medium text-[var(--text-primary)] transition-colors duration-200 hover:text-[var(--accent)]"
          to={`/problems/${problem.id}/practice`}
        >
          Practice
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}
