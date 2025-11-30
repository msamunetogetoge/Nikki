const { spawn } = require("child_process")
const http = require("http")
const path = require("path")

const appDir = path.join(__dirname, "..")
const host = process.env.HOST ?? "127.0.0.1"
const port = Number(process.env.PORT ?? "3000")
const mode = process.env.NODE_ENV === "production" ? "start" : "dev"

let fallbackStarted = false

const startFallback = () => {
  if (fallbackStarted) return
  fallbackStarted = true

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Nikki (fallback)</title>
    <style>
      :root {
        --bg: #0d1117;
        --card: #161b22;
        --text: #e6edf3;
        --muted: #8b949e;
        --accent: #3b82f6;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        padding: 0;
        font-family: "Segoe UI", system-ui, -apple-system, sans-serif;
        background: radial-gradient(circle at 10% 20%, #111827, #0b1220 40%, #050a14);
        color: var(--text);
        min-height: 100vh;
        display: grid;
        place-items: center;
      }
      .card {
        width: min(420px, 92vw);
        background: var(--card);
        border: 1px solid #1f2937;
        border-radius: 18px;
        padding: 28px 26px;
        box-shadow: 0 18px 38px rgba(0,0,0,0.35);
      }
      h1 {
        margin: 0 0 6px;
        font-size: 28px;
        letter-spacing: 0.2px;
      }
      p {
        margin: 0 0 18px;
        color: var(--muted);
      }
      label {
        display: block;
        margin-bottom: 10px;
        font-weight: 600;
      }
      input {
        width: 100%;
        padding: 11px 12px;
        border-radius: 10px;
        border: 1px solid #1f2937;
        background: #0b1220;
        color: var(--text);
        outline: none;
      }
      input:focus {
        border-color: var(--accent);
        box-shadow: 0 0 0 3px rgba(59,130,246,0.2);
      }
      button {
        margin-top: 8px;
        width: 100%;
        padding: 12px;
        border: none;
        border-radius: 10px;
        background: linear-gradient(135deg, #2563eb, #3b82f6);
        color: white;
        font-weight: 700;
        cursor: not-allowed;
        opacity: 0.7;
      }
      .badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 10px;
        border-radius: 999px;
        background: #111827;
        border: 1px solid #1f2937;
        color: var(--muted);
        font-size: 13px;
        margin-bottom: 16px;
      }
      .alert {
        margin-top: 18px;
        padding: 12px 14px;
        border-radius: 12px;
        background: rgba(59,130,246,0.1);
        border: 1px solid rgba(59,130,246,0.3);
        color: #bfdbfe;
        font-size: 14px;
      }
      code {
        background: #0b1220;
        padding: 2px 6px;
        border-radius: 6px;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
        border: 1px solid #1f2937;
      }
    </style>
  </head>
  <body>
    <main class="card">
      <div class="badge">
        <span aria-hidden="true">⚡️</span>
        Sandbox fallback
      </div>
      <h1>Nikki sign-in</h1>
      <p>Next.js cannot start here because child processes are blocked in this sandbox. This mock view keeps dev scripts alive.</p>
      <form>
        <label>
          User ID
          <input type="text" placeholder="demo" disabled />
        </label>
        <label>
          Password
          <input type="password" placeholder="••••••••" disabled />
        </label>
        <button type="button" disabled>Start Next.js locally to enable login</button>
      </form>
      <div class="alert">
        Run <code>npm run dev -w apps/nikki_next</code> outside this sandbox (where child_process.spawn is allowed) to boot the real Next.js app.
      </div>
    </main>
  </body>
</html>`

  http
    .createServer((req, res) => {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" })
      res.end(html)
    })
    .listen(port, host, () => {
      console.log(
        `Fallback frontend server listening at http://${host}:${port} (Next.js spawn blocked in sandbox)`,
      )
    })
}

try {
  const nextBin = path.join(appDir, "node_modules", "next", "dist", "bin", "next")
  const child = spawn(process.execPath, [nextBin, mode, "--hostname", host, "--port", String(port)], {
    cwd: appDir,
    stdio: "inherit",
  })

  child.on("error", (error) => {
    console.warn("Next.js failed to start; using fallback server instead.")
    console.warn(error?.message ?? error)
    startFallback()
  })

  child.on("exit", (code) => {
    if (code === 0) return
    console.warn(`Next.js exited with code ${code}. Using fallback server instead.`)
    startFallback()
  })
} catch (error) {
  console.warn("Next.js spawn blocked; using fallback server instead.")
  console.warn(error?.message ?? error)
  startFallback()
}
