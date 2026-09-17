# Research note: LLD practice with iterative feedback

## Existing approaches

Low-level design is a recurring topic in software-engineering interview preparation, particularly for object-oriented design and system-component discussions. Common prep looks like:

- **Static problem lists** (blogs, GitHub gists, “top 15 LLD questions”) with a sample class diagram in a solution post.
- **Video walkthroughs** that narrate one “correct” design.
- **Mock interviews** with a human, which are high quality and scarce.
- **Code-first platforms** (LeetCode-style) that grade running code, not object models.

Those formats teach vocabulary. They rarely sit with a learner through a second or third design of the same problem.## Existing approaches



## Limits of static problem solving

A published Parking Lot solution is a finished artifact. It does not:

- Check whether *this* sketch actually covers the stated requirements.
- Distinguish **name-dropping** “Strategy Pattern” from using a strategy.
- Preserve attempt 1 vs attempt 2 so the learner can see what changed.
- Give comparable scores on class design, coupling, or extensibility.

Without a review, practice collapses into memorizing diagrams. That is a weak proxy for interview performance, where the interviewer probes tradeoffs on a whiteboard.

## Need for iterative design feedback

LLD skill is closer to writing than to trivia. Writers improve by draft → critique → rewrite. The same loop applies here:

1. Produce a design against a frozen problem statement.
2. Receive structured critique tied to requirements.
3. Retry without erasing the previous attempt.
4. Compare scores so improvement is visible, even if crude.

The critique must stay **educational**: strengths, gaps, suggestions, and a sketch of a stronger design for *this* problem—not a generic OOP lecture.

The product therefore treats a submission as an attempt rather than a final answer. The important unit of progress is not only the latest score, but the ability to compare the learner's successive designs and understand what changed.

## Product opportunity

There is room for a small tool that is neither a coding judge nor a full LMS:

- A **short library** of classic LLD prompts (vending machine, parking lot, elevator, …).
- A **structured workspace** (not a UML editor) so submissions are comparable.
- An **evaluator** that returns JSON scores and prose, with a human-readable review page.
- **History** so retries are first-class.

This does not replace a mock interviewer. It makes independent practice less blind.

## Proposed solution

**LLD Practice Platform** is a modular monolith: React workspace, Express API, MongoDB documents for Problem / Submission / Feedback, and a `FeedbackProvider` interface in front of OpenAI, Groq, or a mock.

The MVP proves the loop end-to-end. It does not add accounts, real-time collaboration, or a custom model.

## Early evaluator validation

The evaluation approach was tested using three intentionally different Parking Lot submissions:

- A minimal design with limited structure.
- A keyword-heavy design containing many pattern names but limited supporting evidence.
- A stronger design with explicit responsibilities, relationships, interfaces, and variation points.

The keyword-heavy submission did not score higher simply because it contained more pattern names. This supported the product decision to make requirement coverage, responsibilities, relationships, and design evidence part of the evaluation rather than relying on keyword matching alone.

## Key product decisions

| Decision | Rationale |
| --- | --- |
| Structured text, not UML drag-and-drop | Faster to build, easier to send to a model, still forces responsibility thinking. |
| Rubric totaling 10 with fixed category maxima | Scores are comparable across attempts; the UI can show +2 improvement. |
| Keep failed evaluations | Losing a design on an API timeout would break trust. |
| No auth in MVP | One learner, one database; auth is a later product concern. |
| Mock provider as default | The app is demoable without a paid key; tests stay deterministic. |
| Solved = latest score ≥ 7 | Simple dashboard heuristic, not a claim of interview readiness. |

Claims this note does **not** make: that AI reviews match a senior interviewer, or that a 10-point rubric is scientifically validated. It is a teaching aid with an explicit scoring contract.

## Sources

- LeetCode — used as a reference for the code-first interview-practice model.
- GitHub — used to review how LLD problem examples and solution discussions are commonly structured.
- General LLD interview preparation material — used to compare static problem lists and walkthrough-based preparation with an iterative practice workflow.

These sources informed the product framing and workflow decisions; they were not treated as evidence that the proposed scoring rubric is scientifically validated.
