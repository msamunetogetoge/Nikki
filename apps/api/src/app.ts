import { Hono } from "hono"
import { cors } from "hono/cors"
import { registerAuthRoutes } from "./routes/auth.ts"
import type { LoginUseCasePort } from "./types.ts"

export type AppDependencies = {
  loginUseCase: LoginUseCasePort
}

export function createApp(dependencies: AppDependencies) {
  const app = new Hono()

  app.use(
    "/*",
    cors({
      origin: (origin) => origin ?? "*",
      allowMethods: ["POST", "OPTIONS"],
      allowHeaders: ["Content-Type"],
      credentials: true,
    }),
  )

  app.get("/healthcheck", (c) => c.text("I'm fine!"))

  registerAuthRoutes(app, dependencies)

  return app
}
