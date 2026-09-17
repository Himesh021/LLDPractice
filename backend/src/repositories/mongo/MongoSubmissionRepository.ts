import { SubmissionModel } from "../../models/Submission";
import type { Submission, SubmissionStatus } from "../../types/domain";
import type { SubmissionRepository } from "../SubmissionRepository";

function toSubmission(doc: {
  _id: { toString(): string };
  problemId: { toString(): string };
  solution: Submission["solution"];
  status: SubmissionStatus;
  evaluationError?: string;
  createdAt: Date;
}): Submission {
  return {
    id: doc._id.toString(),
    problemId: doc.problemId.toString(),
    solution: doc.solution,
    status: doc.status,
    evaluationError: doc.evaluationError,
    createdAt: doc.createdAt,
  };
}

export class MongoSubmissionRepository implements SubmissionRepository {
  async create(input: { problemId: string; solution: Submission["solution"] }): Promise<Submission> {
    const doc = await SubmissionModel.create({
      problemId: input.problemId,
      solution: input.solution,
      status: "pending",
    });
    return toSubmission(doc.toObject());
  }

  async findById(id: string): Promise<Submission | null> {
    const doc = await SubmissionModel.findById(id).lean();
    return doc ? toSubmission(doc) : null;
  }

  async findByProblemId(problemId: string): Promise<Submission[]> {
    const docs = await SubmissionModel.find({ problemId }).sort({ createdAt: 1 }).lean();
    return docs.map(toSubmission);
  }

  async findAllNewestFirst(): Promise<Submission[]> {
    const docs = await SubmissionModel.find().sort({ createdAt: -1 }).lean();
    return docs.map(toSubmission);
  }

  async updateStatus(id: string, status: SubmissionStatus, evaluationError?: string): Promise<void> {
    await SubmissionModel.findByIdAndUpdate(id, {
      status,
      evaluationError: evaluationError ?? undefined,
    });
  }
}
