import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

config({ path: ".env" }); // or .env.local

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const client = postgres(databaseUrl);
export const db = drizzle({ client });

// Export schema for use in queries
export { schema };
export const { events: eventsTable, memories: memoriesTable, user: userTable, session: sessionTable, account: accountTable, verification: verificationTable } = schema;