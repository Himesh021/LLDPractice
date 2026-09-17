import mongoose, { Schema } from "mongoose";
import type { Solution, SubmissionStatus } from "../types/domain";

export interface SubmissionDocument {
  _id: mongoose.Types.ObjectId;
  problemId: mongoose.Types.ObjectId;
  solution: Solution;
  status: SubmissionStatus;
  evaluationError?: string;
  createdAt: Date;
}

const submissionSchema = new Schema<SubmissionDocument>(
  {
    problemId: { type: Schema.Types.ObjectId, ref: "Problem", required: true, index: true },
    solution: {
      classes: { type: String, required: true },
      interfaces: { type: String, required: true },
      relationships: { type: String, required: true },
      responsibilities: { type: String, required: true },
      explanation: { type: String, required: true },
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "evaluating", "evaluated", "failed"],
      default: "pending",
    },
    evaluationError: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const SubmissionModel = mongoose.model<SubmissionDocument>("Submission", submissionSchema);
