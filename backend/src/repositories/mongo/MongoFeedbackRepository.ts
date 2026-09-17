import { FeedbackModel } from "../../models/Feedback";
import type { Feedback } from "../../types/domain";
import type { FeedbackRepository } from "../SubmissionRepository";

function toFeedback(doc: {
  _id: { toString(): string };
  submissionId: { toString(): string };
  score: number;
  categories: Feedback["categories"];
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  improvedDesign: string;
  createdAt: Date;
}): Feedback {
  return {
    id: doc._id.toString(),
    submissionId: doc.submissionId.toString(),
    score: doc.score,
    categories: doc.categories,
    strengths: doc.strengths,
    weaknesses: doc.weaknesses,
    suggestions: doc.suggestions,
    improvedDesign: doc.improvedDesign,
    createdAt: doc.createdAt,
  };
}

export class MongoFeedbackRepository implements FeedbackRepository {
  async create(input: Omit<Feedback, "id" | "createdAt">): Promise<Feedback> {
    const doc = await FeedbackModel.create(input);
    return toFeedback(doc.toObject());
  }

  async findBySubmissionId(submissionId: string): Promise<Feedback | null> {
    const doc = await FeedbackModel.findOne({ submissionId }).lean();
    return doc ? toFeedback(doc) : null;
  }

  async findBySubmissionIds(submissionIds: string[]): Promise<Feedback[]> {
    const docs = await FeedbackModel.find({ submissionId: { $in: submissionIds } }).lean();
    return docs.map(toFeedback);
  }

  async replaceForSubmission(input: Omit<Feedback, "id" | "createdAt">): Promise<Feedback> {
    const doc = await FeedbackModel.findOneAndUpdate(
      { submissionId: input.submissionId },
      { $set: input },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ).lean();
    if (!doc) {
      throw new Error("Failed to store feedback.");
    }
    return toFeedback(doc);
  }
}
