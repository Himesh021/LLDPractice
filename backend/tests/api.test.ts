import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import { createApp } from "../src/app";
import type { AppConfig } from "../src/config/env";
import { SEED_PROBLEMS } from "../src/data/seedProblems";
import { MockFeedbackProvider } from "../src/providers/MockFeedbackProvider";
import { MongoProblemRepository } from "../src/repositories/mongo/MongoProblemRepository";
import { ExternalServiceError } from "../src/utils/errors";

const validSolution = {
  classes: "ParkingLot, Floor, Spot, Vehicle, Ticket, HourlyPricing",
  interfaces: "PricingStrategy with calculate(ticket, exitTime)",
  relationships: "ParkingLot contains Floors; Floor contains Spots; Ticket references Spot and Vehicle",
  responsibilities: "ParkingLot assigns spots; Ticket records entry; PricingStrategy computes fees on exit",
  explanation:
    "I used composition for floors and spots and a strategy for pricing so new vehicle sizes or fee rules can be added without rewriting the lot.",
};

function testConfig(mongoUri: string): AppConfig {
  return {
    port: 4000,
    nodeEnv: "test",
    mongoUri,
    corsOrigin: "http://localhost:5173",
    feedbackProvider: "mock",
    openaiApiKey: "",
    openaiModel: "gpt-4o-mini",
    openaiBaseUrl: "https://api.openai.com/v1",
    groqApiKey: "",
    groqModel: "llama-3.3-70b-versatile",
    groqBaseUrl: "https://api.groq.com/openai/v1",
  };
}

describe("API", () => {
  let mongo: MongoMemoryServer;
  let problemId: string;

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri());
    const repo = new MongoProblemRepository();
    for (const problem of SEED_PROBLEMS) {
      await repo.upsertBySlug(problem);
    }
    const problems = await repo.findAll();
    const parking = problems.find((item) => item.slug === "parking-lot");
    if (!parking) {
      throw new Error("seed failed");
    }
    problemId = parking.id;
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongo.stop();
  });

  it("GET /api/problems returns problems", async () => {
    const app = createApp({ config: testConfig(mongo.getUri()), feedbackProvider: new MockFeedbackProvider() });
    const response = await request(app).get("/api/problems");
    expect(response.status).toBe(200);
    expect(response.body.problems.length).toBeGreaterThanOrEqual(5);
    expect(response.body.problems[0]).toHaveProperty("title");
    expect(response.body.problems[0]).toHaveProperty("expectedConcepts");
  });

  it("GET /api/problems/:id returns a single problem", async () => {
    const app = createApp({ config: testConfig(mongo.getUri()), feedbackProvider: new MockFeedbackProvider() });
    const response = await request(app).get(`/api/problems/${problemId}`);
    expect(response.status).toBe(200);
    expect(response.body.problem.title).toBe("Parking Lot");
  });

  it("GET /api/problems/:id returns an error for an invalid id", async () => {
    const app = createApp({ config: testConfig(mongo.getUri()), feedbackProvider: new MockFeedbackProvider() });
    const badFormat = await request(app).get("/api/problems/not-an-id");
    expect(badFormat.status).toBe(400);

    const missing = await request(app).get("/api/problems/aaaaaaaaaaaaaaaaaaaaaaaa");
    expect(missing.status).toBe(404);
  });

  it("rejects an empty solution", async () => {
    const app = createApp({ config: testConfig(mongo.getUri()), feedbackProvider: new MockFeedbackProvider() });
    const response = await request(app).post("/api/submissions").send({
      problemId,
      solution: {
        classes: "",
        interfaces: "",
        relationships: "",
        responsibilities: "",
        explanation: "",
      },
    });
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("creates a valid submission and stores feedback", async () => {
    const app = createApp({ config: testConfig(mongo.getUri()), feedbackProvider: new MockFeedbackProvider() });
    const response = await request(app).post("/api/submissions").send({
      problemId,
      solution: validSolution,
    });
    expect(response.status).toBe(201);
    expect(response.body.submission.id).toBeDefined();
    expect(response.body.submission.status).toBe("evaluated");
    expect(response.body.feedback).toBeTruthy();
    expect(response.body.feedback.score).toBeGreaterThan(0);
    expect(response.body.feedback.categories).toHaveProperty("classDesign");

    const stored = await request(app).get(`/api/submissions/${response.body.submission.id}`);
    expect(stored.status).toBe(200);
    expect(stored.body.feedback.score).toBe(response.body.feedback.score);
  });

  it("includes the submission in history", async () => {
    const app = createApp({ config: testConfig(mongo.getUri()), feedbackProvider: new MockFeedbackProvider() });
    const created = await request(app).post("/api/submissions").send({
      problemId,
      solution: validSolution,
    });
    const history = await request(app).get("/api/submissions/history");
    expect(history.status).toBe(200);
    const ids = history.body.submissions.map((item: { id: string }) => item.id);
    expect(ids).toContain(created.body.submission.id);
    expect(history.body.submissions[0]).toHaveProperty("attemptNumber");
  });

  it("keeps the submission when AI evaluation fails", async () => {
    const failing = new MockFeedbackProvider(() => {
      throw new ExternalServiceError("provider down", "AI_PROVIDER_FAILURE");
    });
    const app = createApp({ config: testConfig(mongo.getUri()), feedbackProvider: failing });
    const response = await request(app).post("/api/submissions").send({
      problemId,
      solution: validSolution,
    });
    expect(response.status).toBe(201);
    expect(response.body.submission.status).toBe("failed");
    expect(response.body.feedback).toBeNull();

    const stored = await request(app).get(`/api/submissions/${response.body.submission.id}`);
    expect(stored.status).toBe(200);
    expect(stored.body.submission.id).toBe(response.body.submission.id);
    expect(stored.body.submission.solution.classes).toContain("ParkingLot");
  });

  it("handles invalid AI JSON without deleting the submission", async () => {
    const app = createApp({
      config: testConfig(mongo.getUri()),
      feedbackProvider: new MockFeedbackProvider("invalid-json"),
    });
    const response = await request(app).post("/api/submissions").send({
      problemId,
      solution: validSolution,
    });
    expect(response.status).toBe(201);
    expect(response.body.submission.status).toBe("failed");
    expect(response.body.submission.evaluationError).toMatch(/json/i);

    const stored = await request(app).get(`/api/submissions/${response.body.submission.id}`);
    expect(stored.body.submission.solution.explanation.length).toBeGreaterThan(10);
  });
});
