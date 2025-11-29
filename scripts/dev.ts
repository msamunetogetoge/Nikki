// Run frontend (Next.js via npm) and backend (Hono via deno) together.
// Keeps commands simple and cross-shell on Windows/macOS/Linux.

type ProcConfig = {
  name: string
  cmd: string
  args: string[]
  cwd?: string
}

const processes: ProcConfig[] = [
  { name: "app", cmd: "npm", args: ["run", "dev"], cwd: "apps/nikki_next" },
  { name: "api", cmd: "deno", args: ["task", "-c", "apps/api/deno.json", "dev"] },
]

const prefix = (name: string, line: string) => `[${name}] ${line}`

async function pipe(name: string, stream: ReadableStream<Uint8Array>) {
  const decoder = new TextDecoderStream()
  const reader = stream.pipeThrough(decoder).getReader()
  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    if (value) {
      for (const line of value.split(/\r?\n/)) {
        if (line.length) console.log(prefix(name, line))
      }
    }
  }
}

async function runProcess(proc: ProcConfig) {
  const command = new Deno.Command(proc.cmd, {
    args: proc.args,
    cwd: proc.cwd,
    stdout: "piped",
    stderr: "piped",
  })
  const child = command.spawn()
  pipe(proc.name, child.stdout)
  pipe(proc.name, child.stderr)
  return { proc, child }
}

const children = await Promise.all(processes.map(runProcess))

let shuttingDown = false
const shutdown = async () => {
  if (shuttingDown) return
  shuttingDown = true
  console.log("Stopping dev processes...")
  await Promise.all(
    children.map(async ({ child, proc }) => {
      try {
        child.kill("SIGINT")
        await child.status
      } catch (error) {
        console.error(prefix(proc.name, `stop failed: ${error}`))
      }
    }),
  )
}

const signals: Deno.Signal[] =
  Deno.build.os === "windows" ? ["SIGINT", "SIGBREAK"] : ["SIGINT", "SIGTERM"]

for (const signal of signals) {
  Deno.addSignalListener(signal, () => {
    shutdown()
      .catch((err) => console.error(`shutdown error: ${err}`))
      .finally(() => Deno.exit())
  })
}

const results = await Promise.all(children.map(({ child }) => child.status))

const failedIndex = results.findIndex((r) => r.success === false)
if (failedIndex !== -1) {
  console.error(prefix(processes[failedIndex].name, "exited with error"))
  await shutdown()
  Deno.exit(1)
}
