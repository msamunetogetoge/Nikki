#!/usr/bin/env node
const { spawn } = require("child_process")
const path = require("path")

const host = process.env.HOST || "0.0.0.0"
const port = process.env.PORT || "3000"
const nextBin = path.join(__dirname, "..", "node_modules", "next", "dist", "bin", "next")

const child = spawn(process.execPath, [nextBin, "start", "--hostname", host, "--port", port], {
  cwd: path.join(__dirname, ".."),
  stdio: "inherit",
})

child.on("exit", (code) => {
  process.exit(code ?? 0)
})

child.on("error", (err) => {
  console.error(err)
  process.exit(1)
})
