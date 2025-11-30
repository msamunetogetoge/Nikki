import { Hono } from "hono"
import { cors } from "hono/cors"
import { registerAuthRoutes } from "./routes/auth.ts"
import { registerNikkiRoutes } from "./routes/nikki.ts"
import { registerSessionRoutes } from "./routes/session.ts"
import type {
  AuthUseCasePort,
  GetNikkiListUseCasePort,
  LoginUseCasePort,
} from "./types.ts"

export type AppDependencies = {
  loginUseCase: LoginUseCasePort
  authUseCase: AuthUseCasePort
  getNikkiListUseCase: GetNikkiListUseCasePort
}

export function createApp(dependencies: AppDependencies) {
  const app = new Hono()

  app.use(
    "/*",
    cors({
      origin: (origin) => origin ?? "*",
      allowMethods: ["GET", "POST", "OPTIONS"],
      allowHeaders: ["Content-Type"],
      credentials: true,
    }),
  )

  app.get("/healthcheck", (c) => c.text("I'm fine!"))

  registerAuthRoutes(app, dependencies)
  registerSessionRoutes(app, dependencies)
  registerNikkiRoutes(app, dependencies)

  return app
}
