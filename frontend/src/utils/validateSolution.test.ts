import { describe, expect, it } from "vitest";
import { validateSolutionForm } from "../utils/validateSolution";

describe("validateSolutionForm", () => {
  it("rejects empty designs", () => {
    expect(
      validateSolutionForm({
        classes: "",
        interfaces: "",
        relationships: "",
        responsibilities: "",
        explanation: "",
      }),
    ).toMatch(/at least three/i);
  });

  it("accepts a meaningful design", () => {
    expect(
      validateSolutionForm({
        classes: "ParkingLot Floor Spot Vehicle Ticket",
        interfaces: "PricingStrategy calculate fee",
        relationships: "Lot contains floors and spots",
        responsibilities: "Lot assigns spots and issues tickets",
        explanation: "Strategy for pricing keeps the lot closed for modification.",
      }),
    ).toBeNull();
  });
});
