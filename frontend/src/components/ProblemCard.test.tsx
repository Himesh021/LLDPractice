import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ProblemCard } from "../components/ProblemCard";
import type { Problem } from "../types/domain";

const problem: Problem = {
  id: "abc",
  title: "Parking Lot",
  slug: "parking-lot",
  difficulty: "Medium",
  description: "Assign spots and calculate fees.",
  requirements: ["Park vehicles"],
  constraints: ["Multiple sizes"],
  expectedConcepts: ["Strategy Pattern", "Composition"],
  createdAt: new Date().toISOString(),
};

describe("ProblemCard", () => {
  it("shows title, difficulty, and a practice link", () => {
    render(
      <MemoryRouter>
        <ProblemCard problem={problem} />
      </MemoryRouter>,
    );
    expect(screen.getByText("Parking Lot")).toBeInTheDocument();
    expect(screen.getByText("Medium")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Practice" })).toHaveAttribute(
      "href",
      "/problems/abc/practice",
    );
  });
});
