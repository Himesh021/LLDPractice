# AI usage

This assessment was implemented with **Cursor Grok 4.6** as a coding assistant (plus the usual editor tooling). AI was used. This file records what that means in practice.

## Tools used

- Cursor agent for scaffolding, implementation, tests, and documentation
- Language model APIs **in the product**: OpenAI-compatible Chat Completions (`OpenAIFeedbackProvider`, `GroqFeedbackProvider`)
- A **MockFeedbackProvider** for local demo and automated tests (not a hosted model)

No other code-generation services were wired into the repo.

## What AI helped generate

- Folder layout and Express/React boilerplate consistent with the brief
- Mongoose models and repository mappings
- Evaluation prompt and JSON parser
- Seed problem statements (edited for length and realism)
- Tailwind UI pages (dashboard, workspace, feedback, history)
- Jest/Supertest and Vitest tests
- README, DESIGN, RESEARCH, API docs (this file included)

Human direction in the prompt specified stack, non-goals, scoring rubric, routes, and the FeedbackProvider split. The assistant implemented against that spec.

## Architecture suggestions

**Accepted**

- Modular monolith with controller → service → repository
- `FeedbackProvider` interface instead of calling OpenAI from a controller
- Injecting the provider into `createApp` for tests
- Clamp-and-sum category scores so totals cannot drift
- Keep submissions on evaluation failure
- In-memory Mongo for API tests

**Rejected**

- Microservices / message bus / Redis — the brief forbids them and a single process is enough for five problems and a few documents.
- Job queue for evaluation — extra moving parts for a 2-day MVP; a loading state on a sync POST is enough.
- Full auth and User model — not required; would dominate the demo.
- Drag-and-drop UML — out of scope; structured textareas match the evaluation input.
- Generic plugin/DI container framework — a constructor graph in `createApp` is the injection we need.

Example of a rejected (hypothetical) suggestion in the spirit of the brief:

> “AI suggested a microservices architecture. I rejected it because the assessment explicitly allows a simple monolith and microservices would increase unnecessary complexity.”

The same reasoning was applied whenever a “platform-scale” pattern appeared: **simple + understandable + extensible** over enterprise theater.

## Code generation

Most application files were drafted with Cursor agent assistance and then reviewed and verified through local builds, automated tests, browser testing, and deployment checks. The final implementation was not accepted solely because it was generated successfully; runtime behavior and API flows were tested before submission.

Types, error codes, validation rules, and API contracts were aligned to the assessment requirements rather than left as generic CRUD.

## Debugging

AI assistance was also used during debugging, but fixes were verified by running the relevant builds, tests, and deployed application.

Issues encountered included:

- ESM vs CommonJS with Jest → backend stays CommonJS
- Route order: `/history` registered before `/:id`
- Model JSON that does not add up → parser recomputes the total
- Missing API keys → `FEEDBACK_PROVIDER=mock` default
- Render TypeScript build failure caused by the removed `moduleResolution=node10` option → removed the obsolete compiler option while keeping the backend CommonJS configuration
- Render production build missing TypeScript/type declaration packages → moved the required compiler/type packages into the backend dependencies so the deployment build could compile
- MongoDB Atlas authentication failure during deployment → corrected the Atlas database-user configuration and verified the deployed API
- Full backend integration tests were blocked in the automated environment because `mongodb-memory-server` attempted to download a MongoDB binary and the download timed out. This was treated as an environment/network limitation rather than hiding the failure. Frontend tests and builds, backend builds, and the deployed end-to-end flow were verified separately.
- Vercel frontend API configuration was verified against the deployed Render API endpoint.

## Prompt development

The product evaluator prompt is `backend/src/prompts/evaluation.prompt.ts`. It tells the model to:

- Review against **this** problem’s requirements
- Not reward name-dropped patterns
- Return JSON only, with fixed category maxima

That prompt is separate from the Cursor session that wrote the app.

The evaluator was tested with intentionally different submissions, including a weak design, a keyword-heavy design that name-dropped patterns, and a structurally stronger design. The keyword-heavy submission did not receive a higher score simply because it contained more pattern names.

## Honesty limits

- The mock evaluator is keyword-overlap, not an interview-quality review.
- Live model output was not guaranteed in CI (no keys in the repo).
- Docs describe intended architecture; they are not a claim that every line was hand-typed.
