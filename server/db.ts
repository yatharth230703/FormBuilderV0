import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";
import { log } from "./vite";

import dotenv from 'dotenv';
dotenv.config();
// Create a PostgreSQL connection
const connectionString = process.env.DATABASE_URL || '';

if (!connectionString) {
  log("DATABASE_URL is not set. Database features will not function properly.", "db");
}

// Initialize the database connection
export const client = postgres(connectionString, { max: 1 });
export const db = drizzle(client, { schema });

// Function to verify database connection
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await client`SELECT 1`;
    log("Database connection successful", "db");
    return true;
  } catch (error) {
    log(`Database connection failed: ${error}`, "db");
    return false;
  }
}