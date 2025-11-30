import type {
  LoginRequestBody,
  LoginResponse,
} from "../../../packages/core/src/api/login.ts"
import type { NikkiListResponse } from "../../../packages/core/src/api/nikki.ts"
import type { CurrentUserResponse, LogoutResponse } from "../../../packages/core/src/api/session.ts"

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

export async function getCurrentUser(): Promise<CurrentUserResponse | null> {
  const response = await fetch(`${getBaseUrl()}/me`, {
    method: "GET",
    credentials: "include",
  })

  if (response.status === 401) {
    return null
  }

  if (!response.ok) {
    throw new Error(`Session check failed with status ${response.status}`)
  }

  return (await response.json()) as CurrentUserResponse
}

type PaginationParams = { limit?: number; offset?: number }

export async function fetchNikkis(params: PaginationParams = {}): Promise<NikkiListResponse> {
  const searchParams = new URLSearchParams()
  if (params.limit !== undefined) searchParams.set("limit", String(params.limit))
  if (params.offset !== undefined) searchParams.set("offset", String(params.offset))
  const query = searchParams.size > 0 ? `?${searchParams.toString()}` : ""

  const response = await fetch(`${getBaseUrl()}/nikki${query}`, {
    method: "GET",
    credentials: "include",
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch nikki list: ${response.status}`)
  }

  return (await response.json()) as NikkiListResponse
}

export async function logout(): Promise<LogoutResponse> {
  const response = await fetch(`${getBaseUrl()}/logout`, {
    method: "POST",
    credentials: "include",
  })

  if (!response.ok) {
    throw new Error(`Logout failed with status ${response.status}`)
  }

  return (await response.json()) as LogoutResponse
}
