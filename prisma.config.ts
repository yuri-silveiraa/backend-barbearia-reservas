import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "src/infra/database/prisma/schema.prisma",
  migrations: {
    path: "src/infra/database/prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL as string,
  },
});
