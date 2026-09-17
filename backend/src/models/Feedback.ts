import mongoose, { Schema } from "mongoose";
import type { FeedbackCategories } from "../types/domain";

export interface FeedbackDocument {
  _id: mongoose.Types.ObjectId;
  submissionId: mongoose.Types.ObjectId;
  score: number;
  categories: FeedbackCategories;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  improvedDesign: string;
  createdAt: Date;
}

const feedbackSchema = new Schema<FeedbackDocument>(
  {
    submissionId: {
      type: Schema.Types.ObjectId,
      ref: "Submission",
      required: true,
      unique: true,
      index: true,
    },
    score: { type: Number, required: true },
    categories: {
      classDesign: { type: Number, required: true },
      abstraction: { type: Number, required: true },
      encapsulation: { type: Number, required: true },
      relationships: { type: Number, required: true },
      extensibility: { type: Number, required: true },
      designPatterns: { type: Number, required: true },
    },
    strengths: { type: [String], required: true },
    weaknesses: { type: [String], required: true },
    suggestions: { type: [String], required: true },
    improvedDesign: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const FeedbackModel = mongoose.model<FeedbackDocument>("Feedback", feedbackSchema);
