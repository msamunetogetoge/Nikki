import { authUseCaseSuite } from "./auth_usecase.test.ts"
import { cryptoServiceSuite } from "./crypto_service.test.ts"
import { getNikkiListUseCaseSuite } from "./get_nikki_list_usecase.test.ts"
import { loginRouteSuite } from "./login_route.test.ts"
import { loginUseCaseSuite } from "./login_usecase.test.ts"
import { nikkiRepositorySuite } from "./nikki_repository.test.ts"
import { sessionRouteSuite } from "./session_routes.test.ts"
import { userRepositorySuite } from "./user_repository.test.ts"
import type { TestSuite } from "../../../scripts/deno_test_runner.ts"

export const apiTestSuites: TestSuite[] = [
  authUseCaseSuite,
  cryptoServiceSuite,
  loginUseCaseSuite,
  loginRouteSuite,
  sessionRouteSuite,
  getNikkiListUseCaseSuite,
  userRepositorySuite,
  nikkiRepositorySuite,
]
