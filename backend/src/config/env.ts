import dotenv from "dotenv";
import path from "node:path";
import { ConfigurationError } from "../utils/errors";

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
dotenv.config();

export type FeedbackProviderName = "openai" | "groq" | "mock";

export interface AppConfig {
  port: number;
  nodeEnv: string;
  mongoUri: string;
  corsOrigin: string;
  feedbackProvider: FeedbackProviderName;
  openaiApiKey: string;
  openaiModel: string;
  openaiBaseUrl: string;
  groqApiKey: string;
  groqModel: string;
  groqBaseUrl: string;
}

function readProvider(value: string | undefined): FeedbackProviderName {
  const name = (value ?? "mock").toLowerCase();
  if (name === "openai" || name === "groq" || name === "mock") {
    return name;
  }
  throw new ConfigurationError(
    `FEEDBACK_PROVIDER must be openai, groq, or mock. Received: ${value}`,
  );
}

export function loadConfig(): AppConfig {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new ConfigurationError(
      "MONGODB_URI is required. Copy .env.example to .env and set a MongoDB connection string.",
    );
  }

  const provider = readProvider(process.env.FEEDBACK_PROVIDER);

  if (provider === "openai" && !process.env.OPENAI_API_KEY) {
    throw new ConfigurationError("OPENAI_API_KEY is required when FEEDBACK_PROVIDER=openai.");
  }
  if (provider === "groq" && !process.env.GROQ_API_KEY) {
    throw new ConfigurationError("GROQ_API_KEY is required when FEEDBACK_PROVIDER=groq.");
  }

  return {
    port: Number(process.env.PORT ?? 4000),
    nodeEnv: process.env.NODE_ENV ?? "development",
    mongoUri,
    corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
    feedbackProvider: provider,
    openaiApiKey: process.env.OPENAI_API_KEY ?? "",
    openaiModel: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    openaiBaseUrl: process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1",
    groqApiKey: process.env.GROQ_API_KEY ?? "",
    groqModel: process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile",
    groqBaseUrl: process.env.GROQ_BASE_URL ?? "https://api.groq.com/openai/v1",
  };
}
