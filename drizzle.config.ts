import { defineConfig } from "drizzle-kit";
<<<<<<< HEAD
import dotenv from 'dotenv';
dotenv.config();
=======

>>>>>>> 9bce921 (Improve form generation prompt for Gemini LLM)
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
