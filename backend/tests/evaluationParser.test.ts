import { SEED_PROBLEMS } from "../src/data/seedProblems";
import { MockFeedbackProvider } from "../src/providers/MockFeedbackProvider";
import { parseEvaluationResult, assertScoreMatchesCategories } from "../src/utils/evaluationParser";

describe("evaluation parser", () => {
  it("computes score as the sum of clamped category scores", () => {
    const result = parseEvaluationResult(
      JSON.stringify({
        score: 99,
        categories: {
          classDesign: 1.6,
          abstraction: 1.7,
          encapsulation: 0.9,
          relationships: 1.6,
          extensibility: 1.4,
          designPatterns: 0.8,
        },
        strengths: ["Clear parking spot types"],
        weaknesses: ["Fee strategy is hardcoded"],
        suggestions: ["Extract PricingStrategy"],
        improvedDesign: "Lot -> Floor -> Spot; Ticket; PricingStrategy",
      }),
    );

    expect(result.score).toBe(8);
    expect(assertScoreMatchesCategories(result)).toBe(true);
  });

  it("rejects invalid AI JSON", () => {
    expect(() => parseEvaluationResult("not json")).toThrow(/not valid JSON/i);
  });

  it("rejects JSON that does not match the schema", () => {
    expect(() => parseEvaluationResult(JSON.stringify({ score: 5 }))).toThrow(/did not match/i);
  });

  it("clamps category scores to their maxima", () => {
    const result = parseEvaluationResult(
      JSON.stringify({
        categories: {
          classDesign: 9,
          abstraction: 9,
          encapsulation: 9,
          relationships: 9,
          extensibility: 9,
          designPatterns: 9,
        },
        strengths: [],
        weaknesses: [],
        suggestions: [],
        improvedDesign: "x",
      }),
    );

    expect(result.categories.classDesign).toBe(2);
    expect(result.categories.encapsulation).toBe(1);
    expect(result.categories.designPatterns).toBe(1);
    expect(result.score).toBe(10);
  });

  it("does not award a high score to a keyword-only answer", async () => {
    const parking = SEED_PROBLEMS.find((problem) => problem.slug === "parking-lot");
    if (!parking) {
      throw new Error("parking lot seed missing");
    }

    const weakSolution = {
      classes: "Strategy, State, Factory, Pattern",
      interfaces: "PricingStrategy, ParkingSpotStrategy",
      relationships: "Strategy Pattern uses State Pattern; Factory Pattern creates objects; Encapsulation is used",
      responsibilities: "Strategy pattern handles pricing; State pattern handles spot states; Factory pattern creates tickets",
      explanation:
        "This design uses Strategy Pattern, Factory Pattern, State Pattern, Encapsulation, and Abstraction. We will add these patterns everywhere.",
    };

    const result = await new MockFeedbackProvider().evaluate(parking as any, weakSolution as any);

    expect(result.score).toBeLessThan(6);
    expect(result.categories.relationships).toBeLessThan(1.8);
  });

  it("rewards structurally grounded solutions with clear ownership and extension points", async () => {
    const parking = SEED_PROBLEMS.find((problem) => problem.slug === "parking-lot");
    if (!parking) {
      throw new Error("parking lot seed missing");
    }

    const strongSolution = {
      classes: "ParkingLot, Floor, Spot, Ticket, Vehicle, PricingStrategy",
      interfaces: "PricingStrategy { calculateFee(vehicle, duration) }",
      relationships:
        "ParkingLot owns Floors; Floor contains Spots; Ticket references Spot and Vehicle; PricingStrategy is injected into ParkingLot; Spot has state available|occupied",
      responsibilities:
        "ParkingLot assigns a compatible Spot to a Vehicle; Floor tracks occupancy; Ticket records entry time; PricingStrategy computes fees on exit; Spot exposes isAvailable() and assignVehicle()",
      explanation:
        "Each floor owns its spot inventory, while the lot delegates pricing to a replaceable strategy. This keeps parking rules encapsulated and allows peak-hour pricing or flat-rate pricing without changing the lot's core logic.",
    };

    const result = await new MockFeedbackProvider().evaluate(parking as any, strongSolution as any);

    expect(result.score).toBeGreaterThanOrEqual(7);
    expect(result.categories.relationships).toBeGreaterThan(1.5);
    expect(result.categories.extensibility).toBeGreaterThan(1.2);
  });

  it("flags missing requirements with specific guidance tied to the actual problem", async () => {
    const parking = SEED_PROBLEMS.find((problem) => problem.slug === "parking-lot");
    if (!parking) {
      throw new Error("parking lot seed missing");
    }

    const weakOnOccupancy = {
      classes: "ParkingLot, Vehicle, Ticket",
      interfaces: "PricingStrategy { calculateFee() }",
      relationships: "ParkingLot has Vehicles; Ticket references Vehicle; PricingStrategy is used for fees",
      responsibilities: "ParkingLot parks vehicles and calculates a fee on exit; Ticket records entry time",
      explanation:
        "ParkingLot manages parking and uses a strategy for fee calculation. Tickets are created on entry and pricing is handled on exit.",
    };

    const result = await new MockFeedbackProvider().evaluate(parking as any, weakOnOccupancy as any);

    expect(result.score).toBeLessThan(7);
    expect(result.weaknesses.some((item) => /occupancy|floor|compatible spot|reject|free spot/i.test(item))).toBe(true);
    expect(result.suggestions.some((item) => /floor|occupancy|spot|allocation/i.test(item))).toBe(true);
  });

  it("prefers evidence-based strategy abstraction over keyword-only pattern mention", async () => {
    const parking = SEED_PROBLEMS.find((problem) => problem.slug === "parking-lot");
    if (!parking) {
      throw new Error("parking lot seed missing");
    }

    const keywordHeavy = {
      classes: "ParkingLot, Vehicle, Ticket, Spot",
      interfaces: "FeeStrategy",
      relationships: "Composition, aggregation, inheritance, strategy pattern",
      responsibilities: "ParkingLot uses strategy pattern and abstraction; Ticket handles fees; Spot has state",
      explanation: "This solution uses Strategy, Factory, Observer, Singleton, abstraction, and encapsulation to solve fee and spot logic.",
    };

    const result = await new MockFeedbackProvider().evaluate(parking as any, keywordHeavy as any);

    expect(result.score).toBeLessThan(7);
    expect(result.weaknesses.some((item) => /ownership|responsibility|delegates|fee/i.test(item))).toBe(true);
  });
});
