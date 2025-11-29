import { createApp } from "./src/app.ts"
import { CryptoService } from "../../packages/core/src/services/CryptoService.ts"
import { LoginUseCase } from "../../packages/core/src/usecase/LoginUseCase.ts"
import { UserRepository } from "../../packages/db/src/UserRepository.ts"

const port = Number(Deno.env.get("PORT") ?? "8000")
const authSecret = Deno.env.get("AUTH_SECRET") ?? "dev-secret"

const cryptoService = new CryptoService(authSecret)
const userRepository = new UserRepository()
const loginUseCase = new LoginUseCase(userRepository, cryptoService)

const app = createApp({ loginUseCase })

console.log(`Auth API listening on http://localhost:${port}`)
Deno.serve({ port }, app.fetch)
