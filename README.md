# LLD Practice Platform

A small modular-monolith app for practicing **Low-Level Design**. Learners pick a problem, sketch a design (classes, interfaces, relationships, responsibilities, explanation), submit it, and receive structured AI-assisted feedback. Previous attempts are kept so they can retry and see score change.

This is an MVP for a 2-day engineering assessment. It is intentionally a **single backend + single frontend**, not a distributed system.

## Live Demo

- **Frontend:** https://lld-practice-omega.vercel.app/
- **Backend API:** https://lldpractice.onrender.com/api/problems
- **GitHub:** https://github.com/Himesh021/LLDPractice

## Product loop

Choose problem → Read requirements → Design → Submit → Evaluate → Review → Try again → Track improvement

## Key Features

- Five LLD practice problems with requirements and expected concepts
- Structured design workspace for classes, interfaces, relationships, methods, and explanation
- AI-assisted evaluation across six LLD dimensions
- Category-level scoring with a total score out of 10
- Strengths, weaknesses, suggestions, and improved-design feedback
- Submission history and retry workflow
- Mock evaluation provider for deterministic local/demo testing
- Provider abstraction supporting OpenAI, Groq, and Mock evaluators

## Stack

| Layer | Choice |
| --- | --- |
| Frontend | React, TypeScript, Vite, Tailwind CSS, React Router, Axios |
| Backend | Node.js, Express, TypeScript |
| Database | MongoDB + Mongoose |
| AI | `FeedbackProvider` with OpenAI, Groq (OpenAI-compatible), or mock |
| Tests | Jest + Supertest (API), Vitest + Testing Library (UI) |

## Architecture (short)

```
Route → Controller → Service → Repository → MongoDB
FeedbackService path: SubmissionService → FeedbackProvider → OpenAI / Groq / Mock
```

See [docs/DESIGN.md](docs/DESIGN.md) for the design note and [docs/RESEARCH.md](docs/RESEARCH.md) for product context.

## Folder structure

```
frontend/          React SPA
backend/           Express API
  src/controllers
  src/services
  src/repositories
  src/models
  src/providers
  src/prompts
docs/
```

## Setup

### Prerequisites

- Node.js 20+
- MongoDB running locally (default `mongodb://127.0.0.1:27017/lld_practice`)

### Install

```bash
cp .env.example .env
npm install
npm install --prefix backend
npm install --prefix frontend
```

### Environment

Copy `.env.example` to `.env`. Never commit `.env`.

- `MONGODB_URI` — required
- `FEEDBACK_PROVIDER` — `mock` | `openai` | `groq`
- `OPENAI_API_KEY` — required if provider is `openai`
- `GROQ_API_KEY` — required if provider is `groq`
- `VITE_API_URL` — frontend API base (`http://localhost:4000/api`)

For local demo without an API key, keep `FEEDBACK_PROVIDER=mock`. The mock evaluator is deterministic and is **not** a substitute for a model in a real review.

### Seed problems

```bash
npm run seed
```

Loads five problems: Vending Machine, Library Management System, Parking Lot, Elevator System, Movie Ticket Booking.

### Run

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:4000

Or run them separately:

```bash
npm run dev:backend
npm run dev:frontend
```

### Tests

```bash
npm run test:backend
npm test --prefix frontend
```

Backend tests use an in-memory MongoDB (`mongodb-memory-server`). They do not call OpenAI or Groq.

## API

See [docs/API.md](docs/API.md).

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Liveness |
| GET | `/api/stats` | Dashboard counters |
| GET | `/api/problems` | Problem library |
| GET | `/api/problems/:id` | Problem details |
| POST | `/api/submissions` | Create submission and evaluate |
| GET | `/api/submissions/history` | Attempt history |
| GET | `/api/submissions/:id` | Submission + feedback |
| POST | `/api/submissions/:id/evaluate` | Retry evaluation |

## Scoring

Total **/10**:

- Class Design /2
- Abstraction /2
- Encapsulation /1
- Relationships /2
- Extensibility /2
- Design Patterns /1

Category scores are clamped and summed so the stored total always matches the categories.

A problem counts as **solved** on the dashboard when the latest evaluated attempt scores **7 or higher**.

## Assessment Scope

This project was implemented as a focused 2-day engineering assessment MVP. The architecture intentionally favors a modular monolith with clear boundaries over premature distributed-system complexity.

The main engineering focus was:

1. LLD practice workflow
2. Structured evaluation and feedback
3. Extensible evaluation-provider architecture
4. Submission history and improvement loop
5. Automated testing
6. Deployment and reproducibility

## AI usage

See [AI_USAGE.md](AI_USAGE.md). This project was built with AI assistance; architecture stayed a modular monolith on purpose.

## Known limitations

- No authentication (single implicit learner on one database).
- Mock provider scores from keyword overlap, not real design quality.
- Live OpenAI/Groq quality depends on the model and prompt; JSON is validated but not perfect.
- No UML canvas; designs are structured text.
- No pagination; history is a simple list.

## License

Assessment / educational sample. Not a production learning product.

## Assessment Scope

This project was implemented as a focused 2-day engineering assessment MVP. The architecture intentionally favors a modular monolith with clear boundaries over premature distributed-system complexity.

The main engineering focus was:

1. LLD practice workflow
2. Structured evaluation and feedback
3. Extensible evaluation-provider architecture
4. Submission history and improvement loop
5. Automated testing
6. Deployment and reproducibility

