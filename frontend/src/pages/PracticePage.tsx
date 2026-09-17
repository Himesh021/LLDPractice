import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DifficultyBadge } from "../components/DifficultyBadge";
import { ErrorBanner, Skeleton } from "../components/FeedbackBits";
import { apiClient, getErrorMessage } from "../services/api";
import type { Problem, Solution } from "../types/domain";
import { emptySolution } from "../types/domain";
import { validateSolutionForm } from "../utils/validateSolution";

const fields: { key: keyof Solution; label: string; hint: string }[] = [
  { key: "classes", label: "Classes", hint: "Name the types you would introduce and what each owns." },
  { key: "interfaces", label: "Interfaces", hint: "Contracts that hide implementation or variation." },
  { key: "relationships", label: "Relationships", hint: "Composition, aggregation, inheritance, dependency." },
  { key: "responsibilities", label: "Methods / Responsibilities", hint: "Who does what. Keep methods with the data they need." },
  { key: "explanation", label: "Design Explanation", hint: "Tradeoffs, extension points, and how requirements are met." },
];

export function PracticePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [solution, setSolution] = useState<Solution>(emptySolution());
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) {
      return;
    }
    apiClient
      .getProblem(id)
      .then(setProblem)
      .catch((err) => setError(getErrorMessage(err)));
  }, [id]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const validation = validateSolutionForm(solution);
    if (validation) {
      setError(validation);
      return;
    }
    if (!id) {
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const result = await apiClient.createSubmission(id, solution);
      navigate(`/submissions/${result.submission.id}`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (!problem && !error) {
    return (
      <div className="grid h-full gap-0 lg:grid-cols-[2fr_3fr]">
        <Skeleton className="h-full min-h-[24rem] rounded-none" />
        <Skeleton className="h-full min-h-[24rem] rounded-none" />
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="page-wrap">
        <ErrorBanner message={error ?? "Problem not found."} />
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col bg-[var(--bg)] lg:h-full lg:overflow-hidden">
      <div className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--surface)] px-4 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-[var(--text-secondary)] transition-colors duration-200 hover:text-[var(--text-primary)]"
            onClick={() => navigate("/problems")}
          >
            <span aria-hidden="true">←</span>
            <span>Problems</span>
          </button>
          <span className="hidden h-4 w-px bg-[var(--border)] sm:block" aria-hidden="true" />
          <h1 className="truncate text-sm font-semibold tracking-[-0.02em] text-[var(--text-primary)]">{problem.title}</h1>
        </div>
        <DifficultyBadge difficulty={problem.difficulty} />
      </div>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:overflow-hidden">
        <aside className="border-b border-[var(--border)] bg-[var(--card)] lg:border-b-0 lg:border-r lg:overflow-y-auto">
          <div className="border-b border-[var(--border)] px-5 py-3">
            <p className="label-muted">Problem</p>
          </div>
          <div className="space-y-7 px-5 py-5">
            <section>
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">Problem Statement</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{problem.description}</p>
            </section>

            <section>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">Requirements</h3>
              <ul className="mt-2 space-y-2 text-sm leading-6 text-[var(--text-secondary)]">
                {problem.requirements.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">Constraints</h3>
              <ul className="mt-2 space-y-2 text-sm leading-6 text-[var(--text-secondary)]">
                {problem.constraints.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">Expected Concepts</h3>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {problem.expectedConcepts.map((concept) => (
                  <span key={concept} className="chip">
                    {concept}
                  </span>
                ))}
              </div>
            </section>
          </div>
        </aside>

        <form className="relative flex min-h-0 flex-col bg-[var(--surface-soft)] lg:overflow-hidden" onSubmit={onSubmit}>
          <div className="flex shrink-0 items-center justify-between border-b border-[var(--border)] bg-[var(--surface-soft)] px-5 py-3">
            <p className="label-muted">Solution Editor</p>
            <span className="text-[11px] font-medium text-[var(--text-muted)]">Draft saved</span>
          </div>

          {error && (
            <div className="px-5 pt-4">
              <ErrorBanner message={error} />
            </div>
          )}

          <div className="min-h-0 flex-1 px-5 py-4 lg:overflow-y-auto">
            <div className="space-y-5">
              {fields.map((field) => (
                <div key={field.key} className="border-b border-[var(--border)] pb-5 last:border-b-0 last:pb-0">
                  <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                    <label htmlFor={field.key} className="text-sm font-medium text-[var(--text-primary)]">
                      {field.label}
                    </label>
                    <span className="text-[12px] leading-5 text-[var(--text-muted)]">{field.hint}</span>
                  </div>
                  <textarea
                    id={field.key}
                    className="field-textarea"
                    rows={field.key === "explanation" ? 7 : 4}
                    value={solution[field.key]}
                    onChange={(event) =>
                      setSolution((current) => ({ ...current, [field.key]: event.target.value }))
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="sticky bottom-0 shrink-0 border-t border-[var(--border)] bg-[var(--surface)]/95 px-5 py-3 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="text-[11px] text-[var(--text-muted)]">Attempt 1 · 12:34 elapsed</div>
              <button className="btn-primary min-w-[12rem]" type="submit" disabled={submitting}>
                {submitting ? "Evaluating…" : "Submit Solution"}
              </button>
            </div>
          </div>

          {submitting ? (
            <div
              className="absolute inset-0 z-20 flex items-center justify-center bg-[var(--surface)]/80 backdrop-blur-[2px]"
              role="status"
              aria-live="polite"
            >
              <div className="card w-[min(100%,20rem)] px-5 py-5 text-center">
                <p className="text-sm font-semibold text-[var(--text-primary)]">Evaluating your design...</p>
                <ul className="mt-4 space-y-2 text-left text-[13px] text-[var(--text-secondary)]">
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--accent)]" />
                    Analyzing structure
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--accent)] [animation-delay:150ms]" />
                    Checking relationships
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--accent)] [animation-delay:300ms]" />
                    Reviewing extensibility
                  </li>
                </ul>
              </div>
            </div>
          ) : null}
        </form>
      </div>
    </div>
  );
}
