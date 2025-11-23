import { DB } from "https://deno.land/x/sqlite@v3.9.1/mod.ts";
import { fromFileUrl, join, dirname } from "https://deno.land/std@0.224.0/path/mod.ts";

const __dirname = dirname(fromFileUrl(import.meta.url));
const dbPath = join(__dirname, "../packages/db/nikki.db");
const schemaPath = join(__dirname, "../packages/db/schema.sql");

function seedData(db: DB) {
  console.log("Checking for existing data...");
  const userCount = db.query<[number]>("SELECT COUNT(*) FROM users")[0][0];

  if (userCount > 0) {
    console.log("Data already exists. Skipping seed.");
    return;
  }

  console.log("Seeding sample data...");

  // Insert User
  // Password is "password123"
  db.query(
    "INSERT INTO users (user_id, user_name, password) VALUES (?, ?, ?)",
    ["testuser", "Test User", "password123"]
  );
  const userId = db.lastInsertRowId;

  // Insert Nikki
  db.query(
    "INSERT INTO nikki (created_by, title, summary, content, goodness) VALUES (?, ?, ?, ?, ?)",
    [userId, "First Entry", "This is a summary", "This is the content of the first entry.", 10]
  );
  const nikkiId = db.lastInsertRowId;

  // Insert Tag
  db.query("INSERT INTO tag (created_by, name) VALUES (?, ?)", [userId, "sample"]);
  const tagId = db.lastInsertRowId;

  // Link Nikki and Tag
  db.query("INSERT INTO nikkitag (nikki_id, tag_id) VALUES (?, ?)", [nikkiId, tagId]);

  console.log("Sample data seeded successfully.");
}

try {
  console.log(`Creating database at ${dbPath}...`);
  const db = new DB(dbPath);

  console.log(`Reading schema from ${schemaPath}...`);
  const schema = await Deno.readTextFile(schemaPath);

  console.log("Executing schema...");
  db.execute(schema);

  seedData(db);

  console.log("Database initialized successfully.");
  db.close();
} catch (error) {
  console.error("Failed to initialize database:", error);
  Deno.exit(1);
}
