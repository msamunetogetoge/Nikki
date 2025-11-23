import { DB } from "https://deno.land/x/sqlite@v3.9.1/mod.ts";

try {
  const dbPath = "packages/db/nikki.db";
  const schemaPath = "packages/db/schema.sql";

  console.log(`Creating database at ${dbPath}...`);
  const db = new DB(dbPath);

  console.log(`Reading schema from ${schemaPath}...`);
  const schema = await Deno.readTextFile(schemaPath);

  console.log("Executing schema...");
  db.execute(schema);

  console.log("Database initialized successfully.");
  db.close();
} catch (error) {
  console.error("Failed to initialize database:", error);
  Deno.exit(1);
}
