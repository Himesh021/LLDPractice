import mongoose, { Schema } from "mongoose";
import type { Difficulty } from "../types/domain";

export interface ProblemDocument {
  _id: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  difficulty: Difficulty;
  description: string;
  requirements: string[];
  constraints: string[];
  expectedConcepts: string[];
  createdAt: Date;
}

const problemSchema = new Schema<ProblemDocument>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    difficulty: { type: String, required: true, enum: ["Easy", "Medium", "Hard"] },
    description: { type: String, required: true },
    requirements: { type: [String], required: true },
    constraints: { type: [String], required: true },
    expectedConcepts: { type: [String], required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const ProblemModel = mongoose.model<ProblemDocument>("Problem", problemSchema);
