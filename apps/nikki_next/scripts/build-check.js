const path = require("path")
const ts = require("typescript")

const appDir = path.join(__dirname, "..")

const configPath = ts.findConfigFile(appDir, ts.sys.fileExists, "tsconfig.json")

if (!configPath) {
  console.error("Cannot find tsconfig.json for nikki_next")
  process.exit(1)
}

const configFile = ts.readConfigFile(configPath, ts.sys.readFile)
const parsedConfig = ts.parseJsonConfigFileContent(
  configFile.config,
  ts.sys,
  path.dirname(configPath),
)

const projectFiles = parsedConfig.fileNames.filter((filePath) => {
  const normalized = path.normalize(filePath)
  const inApp = normalized.startsWith(appDir)
  const isTest = normalized.includes(".test.") || normalized.endsWith("run-tests.ts") || normalized.endsWith("tests.ts")
  return inApp && !isTest
})

const program = ts.createProgram({
  rootNames: projectFiles,
  options: { ...parsedConfig.options, incremental: false, composite: false },
})

const diagnostics = ts.getPreEmitDiagnostics(program)

if (diagnostics.length > 0) {
  const formatted = ts.formatDiagnosticsWithColorAndContext(diagnostics, {
    getCanonicalFileName: (fileName) => fileName,
    getCurrentDirectory: () => path.dirname(configPath),
    getNewLine: () => ts.sys.newLine,
  })
  console.error(formatted)
  process.exit(1)
}

console.log(
  "TypeScript check passed. Next.js build is skipped in this sandbox because spawning child processes is blocked.",
)
