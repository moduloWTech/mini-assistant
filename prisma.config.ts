import "dotenv/config";
import { defineConfig } from "@prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // URL principal (geralmente com connection pooling, p.ex. PgBouncer, Supabase, Neon)
    url: process.env["DATABASE_URL"] || "",
    // URL direta usada pelo Prisma CLI para rodar as migrations com sucesso
    // @ts-ignore
    directUrl: process.env["DIRECT_URL"],
  },
});
