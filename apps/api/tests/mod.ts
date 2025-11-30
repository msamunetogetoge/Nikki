import { cryptoServiceSuite } from "./crypto_service.test.ts"
import { loginRouteSuite } from "./login_route.test.ts"
import { loginUseCaseSuite } from "./login_usecase.test.ts"
import { userRepositorySuite } from "./user_repository.test.ts"
import type { TestSuite } from "../../../scripts/deno_test_runner.ts"

export const apiTestSuites: TestSuite[] = [
  cryptoServiceSuite,
  loginUseCaseSuite,
  loginRouteSuite,
  userRepositorySuite,
]
