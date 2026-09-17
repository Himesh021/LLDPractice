import { connectDatabase } from "./config/database";
import { loadConfig } from "./config/env";
import { createApp } from "./app";

async function main() {
  const config = loadConfig();
  await connectDatabase(config.mongoUri);
  const app = createApp({ config });
  app.listen(config.port, () => {
    console.log(`LLD Practice API listening on http://localhost:${config.port}`);
  });
}

main().catch((error) => {
  console.error("Failed to start server:", error instanceof Error ? error.message : error);
  process.exit(1);
});
