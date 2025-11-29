import { runTestSuites } from "../../../scripts/deno_test_runner.ts"
import { nikkiNextTestSuites } from "./tests.ts"

await runTestSuites(nikkiNextTestSuites)
