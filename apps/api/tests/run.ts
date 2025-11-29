import { runTestSuites } from "../../../scripts/deno_test_runner.ts"
import { apiTestSuites } from "./mod.ts"

await runTestSuites(apiTestSuites)
