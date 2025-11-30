import { createApp } from "./src/app.ts"
import { CryptoService } from "../../packages/core/src/services/CryptoService.ts"
import { AuthUseCase } from "../../packages/core/src/usecase/AuthUseCase.ts"
import { GetNikkiListUseCase } from "../../packages/core/src/usecase/GetNikkiListUseCase.ts"
import { LoginUseCase } from "../../packages/core/src/usecase/LoginUseCase.ts"
import { NikkiRepository } from "../../packages/db/src/NikkiRepository.ts"
import { UserRepository } from "../../packages/db/src/UserRepository.ts"

const port = Number(Deno.env.get("PORT") ?? "8000")
const authSecret = Deno.env.get("AUTH_SECRET") ?? "dev-secret"

const cryptoService = new CryptoService(authSecret)
const userRepository = new UserRepository()
const nikkiRepository = new NikkiRepository()
const loginUseCase = new LoginUseCase(userRepository, cryptoService)
const authUseCase = new AuthUseCase(userRepository)
const getNikkiListUseCase = new GetNikkiListUseCase(nikkiRepository)

const app = createApp({ loginUseCase, authUseCase, getNikkiListUseCase })

console.log(`Auth API listening on http://localhost:${port}`)
Deno.serve({ port }, app.fetch)
