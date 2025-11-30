import type { paths } from "../generated/auth.ts"

export type LoginRequestBody = paths["/login"]["post"]["requestBody"]["content"]["application/json"]
export type LoginSuccessResponse = paths["/login"]["post"]["responses"][200]["content"]["application/json"]

export type LoginUser = {
  id: string
  name: string
}

export type LoginResponse =
  | { success: true; user: LoginUser }
  | { success: false; error?: string }
