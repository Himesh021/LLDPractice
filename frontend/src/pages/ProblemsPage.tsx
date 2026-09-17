import { useEffect, useMemo, useState } from "react";
import { EmptyState, ErrorBanner, Skeleton } from "../components/FeedbackBits";
import { apiClient, getErrorMessage } from "../services/api";
import type { Difficulty, Problem } from "../types/domain";

const difficultyOptions: Array<{ value: Difficulty; label: string }> = [
  { value: "Easy", label: "Easy" },
  { value: "Medium", label: "Medium" },
  { value: "Hard", label: "Hard" },
];

export function ProblemsPage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty | "All">("All");
  const [activeConcepts, setActiveConcepts] = useState<string[]>([]);

  useEffect(() => {
    apiClient
      .getProblems()
      .then(setProblems)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const conceptOptions = useMemo(
    () => Array.from(new Set(problems.flatMap((problem) => problem.expectedConcepts))).sort(),
    [problems],
  );

  const filteredProblems = useMemo(() => {
    return problems.filter((problem) => {
      const matchesSearch = problem.title.toLowerCase().includes(search.toLowerCase());
      const matchesDifficulty = difficulty === "All" || problem.difficulty === difficulty;
      const matchesConcepts =
        activeConcepts.length === 0 ||
        activeConcepts.every((concept) => problem.expectedConcepts.includes(concept));

      return matchesSearch && matchesDifficulty && matchesConcepts;
    });
  }, [activeConcepts, difficulty, problems, search]);

  return (
    <div className="page-wrap">
      <header className="mb-6 flex flex-col gap-4 border-b border-[var(--border)] pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="label-muted">Practice Library</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[var(--text-primary)]">
            Problems
          </h1>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2">
          <span className="text-sm font-medium text-[var(--text-secondary)]">12 / 40 solved</span>
          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
        </div>
      </header>

      {error && (
        <div className="mb-6">
          <ErrorBanner message={error} />
        </div>
      )}

      <div className="panel mb-6 overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-[var(--border)] bg-[var(--surface-soft)] p-3 md:flex-row md:items-center md:justify-between">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by title"
            className="field-textarea m-0 min-h-[42px] bg-[var(--surface-strong)] md:max-w-md"
            aria-label="Search problems"
          />

          <div className="flex flex-wrap gap-2">
            {[
              { value: "All", label: "All" },
              ...difficultyOptions,
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setDifficulty(option.value as Difficulty | "All")}
                className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition ${
                  difficulty === option.value
                    ? "border-[rgba(96,165,250,0.45)] bg-[var(--accent-soft)] text-[var(--text-primary)]"
                    : "border-[var(--border)] bg-[var(--surface-strong)] text-[var(--text-secondary)]"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 p-3">
          {conceptOptions.map((concept) => {
            const selected = activeConcepts.includes(concept);
            return (
              <button
                key={concept}
                type="button"
                onClick={() =>
                  setActiveConcepts((current) =>
                    current.includes(concept)
                      ? current.filter((value) => value !== concept)
                      : [...current, concept],
                  )
                }
                className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${
                  selected
                    ? "border-[rgba(96,165,250,0.45)] bg-[var(--accent-soft)] text-[var(--text-primary)]"
                    : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)]"
                }`}
              >
                {concept}
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-44 rounded-2xl" />
          ))}
        </div>
      ) : problems.length === 0 ? (
        <EmptyState title="Library is empty" body="Run the seed script to load the five starter problems." />
      ) : filteredProblems.length === 0 ? (
        <div className="panel p-8 text-center">
          <p className="text-lg font-semibold text-[var(--text-primary)]">No problems match your filters.</p>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">Try another search or clear one of the selected tags.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredProblems.map((problem) => (
            <article
              key={problem.id}
              className="group rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--shadow-soft)] transition duration-200 hover:-translate-y-0.5 hover:border-[rgba(96,165,250,0.45)]"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <span
                    className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                      problem.difficulty === "Easy"
                        ? "bg-emerald-500"
                        : problem.difficulty === "Medium"
                          ? "bg-amber-500"
                          : "bg-rose-500"
                    }`}
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-semibold tracking-[-0.02em] text-[var(--text-primary)]">
                      {problem.title}
                    </h2>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${
                    problem.difficulty === "Easy"
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
                      : problem.difficulty === "Medium"
                        ? "border-amber-500/30 bg-amber-500/10 text-amber-500"
                        : "border-rose-500/30 bg-rose-500/10 text-rose-500"
                  }`}
                >
                  {problem.difficulty}
                </span>
              </div>

              <p className="line-clamp-3 text-sm leading-6 text-[var(--text-secondary)]">{problem.description}</p>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {problem.expectedConcepts.slice(0, 4).map((concept) => (
                  <span key={concept} className="chip">
                    {concept}
                  </span>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between gap-3 border-t border-[var(--border)] pt-3">
                <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                  <span className="inline-flex h-2 w-2 rounded-full bg-sky-500" aria-hidden="true" />
                  Not Started
                </div>
                <a
                  href={`/problems/${problem.id}/practice`}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:text-[var(--accent)]"
                >
                  Practice <span aria-hidden="true">→</span>
                </a>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
