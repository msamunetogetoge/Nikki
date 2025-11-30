import type { LoginUser } from "./login.ts"

export type CurrentUserResponse = { user: LoginUser }
export type LogoutResponse = { success: boolean }
