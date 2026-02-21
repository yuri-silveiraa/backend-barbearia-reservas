import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "src/infra/database/prisma/schema.prisma",
  migrations: {
    path: "src/infra/database/prisma/migrations",
    seed: "node dist/infra/database/prisma/seed.js || ts-node --transpile-only src/infra/database/prisma/seed.ts",
  },
  datasource: {
    url: process.env.DATABASE_URL as string,
  },
});
