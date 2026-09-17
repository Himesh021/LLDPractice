import { ProblemModel } from "../../models/Problem";
import type { Problem } from "../../types/domain";
import type { ProblemRepository } from "../ProblemRepository";

function toProblem(doc: {
  _id: { toString(): string };
  title: string;
  slug: string;
  difficulty: Problem["difficulty"];
  description: string;
  requirements: string[];
  constraints: string[];
  expectedConcepts: string[];
  createdAt: Date;
}): Problem {
  return {
    id: doc._id.toString(),
    title: doc.title,
    slug: doc.slug,
    difficulty: doc.difficulty,
    description: doc.description,
    requirements: doc.requirements,
    constraints: doc.constraints,
    expectedConcepts: doc.expectedConcepts,
    createdAt: doc.createdAt,
  };
}

export class MongoProblemRepository implements ProblemRepository {
  async findAll(): Promise<Problem[]> {
    const docs = await ProblemModel.find().sort({ title: 1 }).lean();
    return docs.map(toProblem);
  }

  async findById(id: string): Promise<Problem | null> {
    const doc = await ProblemModel.findById(id).lean();
    return doc ? toProblem(doc) : null;
  }

  async count(): Promise<number> {
    return ProblemModel.countDocuments();
  }

  async upsertBySlug(problem: Omit<Problem, "id" | "createdAt">): Promise<Problem> {
    const doc = await ProblemModel.findOneAndUpdate(
      { slug: problem.slug },
      { $set: problem },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ).lean();
    if (!doc) {
      throw new Error("Failed to upsert problem.");
    }
    return toProblem(doc);
  }
}
