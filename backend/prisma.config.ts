import "dotenv/config";
import { defineConfig } from "prisma/config";

const fallbackDatabaseUrl = "postgresql://postgres:postgres@127.0.0.1:5432/logisticsflow";
const fallbackShadowDatabaseUrl = "postgresql://postgres:postgres@127.0.0.1:5432/logisticsflow_shadow";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DATABASE_URL || fallbackDatabaseUrl,
    shadowDatabaseUrl:
      process.env.SHADOW_DATABASE_URL || process.env.DATABASE_URL || fallbackShadowDatabaseUrl,
  },
});
