import 'dotenv/config'; // IMPORTANT: This line loads your .env file
import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set in your .env file");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts", // Keeping your original schema path
  dialect: "sqlite",           // <-- This is the main fix
  dbCredentials: {
    url: process.env.DATABASE_URL, // This correctly reads "file:./dev.db"
  },
});