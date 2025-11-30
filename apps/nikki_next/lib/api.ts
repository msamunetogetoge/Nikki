import type {
  LoginRequestBody,
  LoginResponse,
} from "../../../packages/core/src/api/login.ts"

const getBaseUrl = () => {
  // deno-lint-ignore no-explicit-any
  const nodeProcess = (globalThis as any).process as
    | { env?: Record<string, string | undefined> }
    | undefined
  if (nodeProcess?.env?.NEXT_PUBLIC_API_BASE_URL) {
    return nodeProcess.env.NEXT_PUBLIC_API_BASE_URL
  }

  // Allow overriding via Deno when running tests.
  // deno-lint-ignore no-explicit-any
  const deno = (globalThis as any).Deno as typeof Deno | undefined
  const denoEnv = deno?.env?.get("NEXT_PUBLIC_API_BASE_URL")
  if (denoEnv) return denoEnv

  return "http://localhost:8000"
}

export async function login(
  credentials: LoginRequestBody,
): Promise<LoginResponse> {
  const response = await fetch(`${getBaseUrl()}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(credentials),
  })

  if (!response.ok) {
    throw new Error(`Login request failed with status ${response.status}`)
  }

  return (await response.json()) as LoginResponse
}
