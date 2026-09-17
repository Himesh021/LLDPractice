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

Most application files were drafted by the assistant and then checked by running install, tests, and (where possible) the servers. Types, error codes, and validation rules were aligned to the spec rather than left as generic CRUD.

## Debugging

Failures expected during bring-up (and handled if they appear):

- ESM vs CommonJS with Jest → backend stays CommonJS
- Route order: `/history` registered before `/:id`
- Model JSON that does not add up → parser recomputes the total
- Missing API keys → `FEEDBACK_PROVIDER=mock` default

## Prompt development

The product evaluator prompt is `backend/src/prompts/evaluation.prompt.ts`. It tells the model to:

- Review against **this** problem’s requirements
- Not reward name-dropped patterns
- Return JSON only, with fixed category maxima

That prompt is separate from the Cursor session that wrote the app.

## Honesty limits

- The mock evaluator is keyword-overlap, not an interview-quality review.
- Live model output was not guaranteed in CI (no keys in the repo).
- Docs describe intended architecture; they are not a claim that every line was hand-typed.
