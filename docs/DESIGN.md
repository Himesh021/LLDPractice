# Design note

## 1. Problem statement

Learners preparing for LLD interviews need a place to **design against a spec**, get **structured feedback**, and **retry** without losing earlier work. The assessment asks for a working MVP that itself demonstrates clear object design.

## 2. Goals

- Complete learning loop in one app.
- Clean modular monolith: routes → controllers → services → repositories → MongoDB.
- Swap AI vendors behind `FeedbackProvider`.
- Persist every submission; evaluation failure must not delete work.
- Tests for API contracts, validation, and evaluation parsing.
- Honest docs (research, design, AI usage, API).

## 3. Non-goals

Microservices, Kubernetes, Redis, Kafka, WebSockets, auth, admin, multi-tenant SaaS, real-time UML, production-grade observability.

## 4. User journey

1. Open dashboard: counts + problem cards.
2. Open problem details (or jump to practice).
3. Fill five design sections; client and server validate meaning, not just emptiness.
4. Submit → document saved → evaluator runs → feedback stored.
5. Review scores, strengths, weaknesses, suggestions, improved design.
6. Try again → new submission, old ones remain.
7. History groups attempts per problem.
8. If evaluation fails: message + retry evaluation on the same submission.

## 5. System architecture

Single Express process, single React SPA, one MongoDB.

```
Browser
  → REST /api/*
      → Controller
          → ProblemService / SubmissionService / StatsService
              → *Repository (Mongoose)
              → FeedbackProvider (OpenAI | Groq | Mock)
```

`createApp` accepts an injected `FeedbackProvider` so tests never call a network model.

**Why a monolith:** the domain is one product with a handful of documents. Extra processes would add failure modes without changing the LLD of the domain.

## 6. Domain model

- **Problem**: prompt + rubric hints (`expectedConcepts`).
- **Submission**: one attempt; `solution` is a value object of five strings; `status` is `pending | evaluating | evaluated | failed`.
- **Feedback**: one-to-one with a successful evaluation (replaced on retry).
- No User collection: implicit single learner.

Services own use cases. Repositories own persistence. Providers own model I/O. Controllers map HTTP.

## 7. Database model

MongoDB collections `problems`, `submissions`, `feedbacks`.

- Problem indexed on unique `slug` (seed upsert).
- Submission indexed on `problemId`.
- Feedback unique on `submissionId`.

ObjectIds are the public IDs. Invalid hex strings return 400, missing documents 404.

## 8. API design

REST, JSON, `/api` prefix. Errors: `{ error: { code, message } }` — no stack traces.

History is `GET /api/submissions/history` (static path before `/:id`).

Create submission is synchronous: save, evaluate, return. For MVP this is simpler than a job queue. The UI shows “Reviewing your design...” during the request.

Full examples: [API.md](./API.md).

## 9. AI evaluation architecture

```
SubmissionService.evaluateInternal
  → FeedbackProvider.evaluate(problem, solution)
      → chat completion + JSON mode
      → parseEvaluationResult (schema + clamp + sum)
  → FeedbackRepository.replaceForSubmission
  → status evaluated | failed
```

Prompt lives in `src/prompts/evaluation.prompt.ts` so it is not buried in the HTTP client.

**Why clamp and re-sum:** models drift on arithmetic. Stored scores must honor the published maxima and add up.

**Why retry is a new POST on the same id:** the design is already saved; only the review is redone.

## 10. Extensibility

- New model vendor: implement `FeedbackProvider`, add a branch in `createFeedbackProvider`.
- New problem: seed document; no code change.
- New rubric category: types + parser + prompt + UI labels (deliberate, not a plugin system).

No generic “plugin kernel.” That would be ceremony.

## 11. Error handling

| Case | Behavior |
| --- | --- |
| Invalid / missing ids | 400 / 404 |
| Empty solution | 400 validation |
| Missing env (URI, keys) | process fails at startup with a clear message |
| AI down / bad JSON | submission `failed`, user message, retry |
| Uncaught | 500 generic message, log server-side |

## 12. Testing strategy

- Unit: JSON parser and score summing.
- Integration: Supertest + in-memory Mongo; mock provider for success, throw, and invalid JSON.
- Frontend: form validation + problem card routing.

Not tested here: live OpenAI/Groq accounts (see README).

## 13. Tradeoffs

| Choice | Cost | Benefit |
| --- | --- | --- |
| Sync evaluation | Request can take seconds | No queue, easy demo |
| Mock default | Weak pedagogical scores | Demo and CI without secrets |
| Textareas not UML | Less “wow” | Fits the time box; model-friendly |
| No auth | Shared DB if deployed | Matches MVP scope |
| Latest score ≥ 7 = solved | Arbitrary | Dashboard needs a number |

## 14. Future improvements

- Accounts and per-user history.
- Async evaluation with a status poll if models get slower.
- Human-in-the-loop override of scores.
- Rubric calibration against real interview feedback.
- Optional UML export from the structured fields.
