import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "src/infra/database/prisma/schema.prisma",
  migrations: {
    path: "src/infra/database/prisma/migrations",
    seed: "ts-node --transpile-only src/infra/database/prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
