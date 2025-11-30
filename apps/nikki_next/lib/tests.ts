import type { TestSuite } from "../../../scripts/deno_test_runner.ts"
import { loginApiSuite } from "./api.test.ts"

export const nikkiNextTestSuites: TestSuite[] = [loginApiSuite]
