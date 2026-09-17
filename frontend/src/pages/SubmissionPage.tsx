import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CategoryScores } from "../components/CategoryScores";
import { ErrorBanner, Skeleton } from "../components/FeedbackBits";
import { apiClient, getErrorMessage } from "../services/api";
import type { SubmissionDetails } from "../types/domain";

export function SubmissionPage() {
  const { id } = useParams();
  const [details, setDetails] = useState<SubmissionDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);

  async function load() {
    if (!id) {
      return;
    }
    const data = await apiClient.getSubmission(id);
    setDetails(data);
  }

  useEffect(() => {
    load().catch((err) => setError(getErrorMessage(err)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function retryEvaluation() {
    if (!id) {
      return;
    }
    setRetrying(true);
    setError(null);
    try {
      await apiClient.retryEvaluation(id);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setRetrying(false);
    }
  }

  if (error && !details) {
    return (
      <div className="page-wrap">
        <ErrorBanner message={error} />
      </div>
    );
  }

  if (!details) {
    return (
      <div className="page-wrap space-y-4">
        <div className="card px-5 py-6">
          <p className="text-sm font-semibold text-[var(--text-primary)]">Evaluating your design...</p>
          <ul className="mt-4 space-y-2 text-sm text-[var(--text-secondary)]">
            <li>Analyzing structure</li>
            <li>Checking relationships</li>
            <li>Reviewing extensibility</li>
          </ul>
        </div>
        <Skeleton className="h-32" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  const { submission, problem, feedback, attemptNumber, previousScore, improvement } = details;

  return (
    <div className="page-wrap">
      <header className="mb-8 border-b border-[var(--border)] pb-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[2.2rem] font-semibold tracking-[-0.06em] text-[var(--text-primary)]">{problem.title}</p>
            <p className="mt-2 text-[1.1rem] font-medium text-[var(--text-secondary)]">Attempt {attemptNumber}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link className="btn-secondary" to={`/problems/${problem.id}/practice`}>
              Try Again <span aria-hidden="true">→</span>
            </Link>
            <Link className="btn-secondary" to="/history">
              View History
            </Link>
          </div>
        </div>

        <h1 className="mt-6 text-[3rem] font-semibold leading-[0.96] tracking-[-0.08em] text-[var(--text-primary)]">
          Design Review
        </h1>
      </header>

      {error && (
        <div className="mb-6">
          <ErrorBanner message={error} />
        </div>
      )}

      {submission.status === "failed" && (
        <div className="card mb-6 border-amber-200 bg-amber-50 p-5">
          <h2 className="text-sm font-semibold text-amber-950">Something went wrong</h2>
          <p className="mt-2 text-sm leading-6 text-amber-900">
            {submission.evaluationError ??
              "Your submission was saved, but evaluation could not be completed."}
          </p>
          <button className="btn-primary mt-4" type="button" onClick={retryEvaluation} disabled={retrying}>
            {retrying ? "Evaluating your design..." : "Try Again"}
          </button>
        </div>
      )}

      {feedback && (
        <>
          <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <div className="card flex flex-col items-center justify-center border-[var(--border)] bg-[var(--surface)] px-5 py-6 text-center shadow-none">
              <div className="flex items-end justify-center gap-1 leading-none">
                <span className="text-[3.5rem] font-semibold tracking-[-0.06em] text-[var(--text-primary)] sm:text-[4rem]">
                  {feedback.score}
                </span>
                <span className="flex items-end pb-2 text-[1.5rem] font-medium text-[var(--text-secondary)] sm:text-[1.75rem]">
                  <span className="font-sans leading-none">/</span>
                  <span className="ml-1 font-sans leading-none">10</span>
                </span>
              </div>
              <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--text-muted)]">
                Overall Score
              </p>

              {previousScore !== null && improvement !== null && (
                <div className="mt-6 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 text-left text-sm text-[var(--text-secondary)]">
                  <p>Previous score: {previousScore} / 10</p>
                  <p className="mt-1">Current score: {feedback.score} / 10</p>
                  <p className={`mt-2 font-semibold ${improvement >= 0 ? "text-[var(--success)]" : "text-[var(--danger)]"}`}>
                    Improvement: {improvement >= 0 ? "+" : ""}
                    {improvement}
                  </p>
                </div>
              )}
            </div>

            <div className="card px-5 py-5">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">Category Scores</h2>
              <div className="mt-5">
                <CategoryScores categories={feedback.categories} />
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <ListBlock
              title="Strengths"
              marker="What you did well"
              tone="good"
              items={feedback.strengths}
            />
            <ListBlock
              title="Areas to Improve"
              marker="What to tighten"
              tone="warn"
              items={feedback.weaknesses}
            />
            <ListBlock
              title="Suggestions"
              marker="How to improve"
              tone="info"
              items={feedback.suggestions}
            />

            <section className="card border-l-4 border-l-sky-500 bg-sky-500/5 p-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                How to improve
              </p>
              <h2 className="mt-2 text-base font-semibold tracking-[-0.02em] text-[var(--text-primary)]">
                Improved Design
              </h2>

              {(() => {
                const improvedDesignItems = feedback.improvedDesign
                  .split(/\n+/)
                  .map((item) => item.trim())
                  .filter(Boolean);

                return improvedDesignItems.length === 0 ? (
                  <p className="mt-3 text-sm text-[var(--text-muted)]">None recorded.</p>
                ) : (
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--text-secondary)]">
                    {improvedDesignItems.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--text-primary)] opacity-80" aria-hidden="true" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                );
              })()}
            </section>
          </div>
        </>
      )}
    </div>
  );
}

function ListBlock({
  title,
  marker,
  tone,
  items,
}: {
  title: string;
  marker: string;
  tone: "good" | "warn" | "info";
  items: string[];
}) {
  const accent =
    tone === "good"
      ? "border-l-4 border-l-emerald-500 bg-emerald-500/5"
      : tone === "warn"
        ? "border-l-4 border-l-amber-500 bg-amber-500/5"
        : "border-l-4 border-l-sky-500 bg-sky-500/5";

  return (
    <section className={`card ${accent} p-5`}>
      <p className="label-muted">{marker}</p>
      <h2 className="mt-2 text-base font-semibold tracking-[-0.02em] text-[var(--text-primary)]">{title}</h2>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-[var(--text-muted)]">None recorded.</p>
      ) : (
        <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--text-secondary)]">
          {items.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--text-primary)] opacity-80" aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
