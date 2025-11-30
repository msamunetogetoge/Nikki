import type { LoginUser } from "../../../packages/core/src/api/login.ts"

export type LoginUseCasePort = {
  execute(userId: string, password: string): Promise<LoginUser>
}
