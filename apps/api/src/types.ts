import type { LoginUser } from "../../../packages/core/src/api/login.ts"
import type { Nikki } from "../../../packages/core/src/domain/nikki.ts"

export type LoginUseCasePort = {
  execute(userId: string, password: string): Promise<LoginUser>
}

export type AuthUseCasePort = {
  getCurrentUser(sessionId?: string | null): Promise<LoginUser | null>
}

export type GetNikkiListUseCasePort = {
  execute(
    userId: string,
    pagination: { limit?: number; offset?: number },
  ): Promise<{ items: Nikki[] }>
}
