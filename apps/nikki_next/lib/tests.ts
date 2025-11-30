import type { TestSuite } from "../../../scripts/deno_test_runner.ts"
import { apiClientSuite } from "./api.test.ts"

export const nikkiNextTestSuites: TestSuite[] = [apiClientSuite]
