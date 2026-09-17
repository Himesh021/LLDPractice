import { connectDatabase, disconnectDatabase } from "./config/database";
import { loadConfig } from "./config/env";
import { SEED_PROBLEMS } from "./data/seedProblems";
import { MongoProblemRepository } from "./repositories/mongo/MongoProblemRepository";

async function seed() {
  const config = loadConfig();
  await connectDatabase(config.mongoUri);
  const repo = new MongoProblemRepository();
  for (const problem of SEED_PROBLEMS) {
    const saved = await repo.upsertBySlug(problem);
    console.log(`Seeded ${saved.title} (${saved.id})`);
  }
  await disconnectDatabase();
}

seed().catch((error) => {
  console.error("Seed failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
