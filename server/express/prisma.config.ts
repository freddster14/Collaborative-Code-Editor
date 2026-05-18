import "dotenv/config";
import { defineConfig } from "prisma/config";
import requireEnv from "./src/utils/env.js";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: requireEnv("DATABASE_URL"),
  },
});
