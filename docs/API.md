# API

Base URL: `http://localhost:4000`

Error shape:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Please describe at least three sections with meaningful detail (12+ characters each). Empty or placeholder text is not enough."
  }
}
```

## GET /api/health

```json
{ "ok": true }
```

## GET /api/stats

```json
{
  "stats": {
    "problemCount": 5,
    "problemsAttempted": 2,
    "problemsSolved": 1,
    "averageScore": 7.5
  }
}
```

`averageScore` is the mean of each problem’s **latest evaluated** score, or `null`.

## GET /api/problems

```json
{
  "problems": [
    {
      "id": "66f000000000000000000001",
      "title": "Parking Lot",
      "slug": "parking-lot",
      "difficulty": "Medium",
      "description": "...",
      "requirements": ["..."],
      "constraints": ["..."],
      "expectedConcepts": ["Abstraction", "Composition"],
      "createdAt": "2026-09-16T12:00:00.000Z"
    }
  ]
}
```

## GET /api/problems/:id

```json
{
  "problem": { "id": "...", "title": "Parking Lot" }
}
```

Invalid id → `400`. Unknown id → `404`.

## POST /api/submissions

Request:

```json
{
  "problemId": "66f000000000000000000001",
  "solution": {
    "classes": "ParkingLot, Floor, Spot, Vehicle, Ticket",
    "interfaces": "PricingStrategy.calculate(ticket, exitTime)",
    "relationships": "ParkingLot contains Floor contains Spot",
    "responsibilities": "Lot assigns spots; Ticket records entry and exit",
    "explanation": "Pricing is a strategy so hourly vs flat fees do not change the lot."
  }
}
```

Response `201`:

```json
{
  "submission": {
    "id": "66f0000000000000000000aa",
    "problemId": "66f000000000000000000001",
    "solution": { "classes": "...", "interfaces": "...", "relationships": "...", "responsibilities": "...", "explanation": "..." },
    "status": "evaluated",
    "createdAt": "2026-09-16T12:05:00.000Z"
  },
  "feedback": {
    "id": "66f0000000000000000000bb",
    "submissionId": "66f0000000000000000000aa",
    "score": 8,
    "categories": {
      "classDesign": 1.6,
      "abstraction": 1.7,
      "encapsulation": 0.9,
      "relationships": 1.6,
      "extensibility": 1.4,
      "designPatterns": 0.8
    },
    "strengths": ["..."],
    "weaknesses": ["..."],
    "suggestions": ["..."],
    "improvedDesign": "...",
    "createdAt": "2026-09-16T12:05:02.000Z"
  }
}
```

If the model fails, `status` is `"failed"`, `feedback` is `null`, and `evaluationError` is a safe message. The submission id is still returned.

## GET /api/submissions/history

```json
{
  "submissions": [
    {
      "id": "66f0000000000000000000aa",
      "problemId": "66f000000000000000000001",
      "problemTitle": "Parking Lot",
      "difficulty": "Medium",
      "status": "evaluated",
      "score": 8,
      "attemptNumber": 2,
      "createdAt": "2026-09-16T12:05:00.000Z"
    }
  ]
}
```

Newest first. `attemptNumber` is chronological per problem (1, 2, …).

## GET /api/submissions/:id

```json
{
  "submission": {},
  "problem": {},
  "feedback": {},
  "attemptNumber": 2,
  "previousScore": 6,
  "improvement": 2
}
```

`previousScore` / `improvement` are null on the first scored attempt.

## POST /api/submissions/:id/evaluate

Re-runs the provider on the stored solution. Same response shape as create (`submission` + `feedback`). Used after a failed evaluation.
