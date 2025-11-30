import { join } from "jsr:@std/path/join"

// Script location: apps/api/scripts/prisma_generate.ts
// Repo root: three levels up from here.
const rootUrl = new URL("../../../", import.meta.url)
const rootPath =
  rootUrl.pathname[0] === "/" && rootUrl.pathname[2] === ":"
    ? rootUrl.pathname.slice(1)
    : rootUrl.pathname

const schemaPath = join(rootPath, "packages", "db", "prisma", "schema.prisma")
const cacheDir = join(rootPath, ".deno_cache")
const prismaBin = join(
  rootPath,
  "node_modules",
  ".bin",
  `prisma${Deno.build.os === "windows" ? ".cmd" : ""}`,
)

const command = new Deno.Command(prismaBin, {
  args: ["generate", "--schema", schemaPath],
  cwd: rootPath,
  env: { ...Deno.env.toObject(), DENO_DIR: cacheDir },
})

try {
  const { success, code, stderr } = await command.output()

  if (!success) {
    console.error(new TextDecoder().decode(stderr))
    Deno.exit(code ?? 1)
  }
} catch (error) {
  const generatedClient = join(rootPath, "node_modules", ".prisma", "client", "index.js")
  try {
    Deno.statSync(generatedClient)
    console.warn(
      "Skipping prisma generate because the CLI is unavailable, using existing generated client at",
      generatedClient,
    )
    Deno.exit(0)
  } catch {
    // fallthrough to error handling below
  }

  console.error(
    `Failed to run Prisma CLI at ${prismaBin}. If this environment blocks child processes, run "npm exec prisma generate --schema packages/db/prisma/schema.prisma" from the repo root, then retry.`,
  )
  console.error(error)
  Deno.exit(1)
}
