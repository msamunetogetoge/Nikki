import { Hono } from "hono"
import { registerAuthRoutes } from "./routes/auth.ts"
import type { LoginUseCasePort } from "./types.ts"

export type AppDependencies = {
  loginUseCase: LoginUseCasePort
}

export function createApp(dependencies: AppDependencies) {
  const app = new Hono()

  registerAuthRoutes(app, dependencies)

  return app
}
