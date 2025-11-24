import { MiddlewareHandlerContext } from "$fresh/server.ts";
import { getCookies } from "std/http/cookie";
import { SESSION_COOKIE_NAME, validateSession } from "../utils/session.ts";
import type { PublicUser } from "@domain/entities/User.ts";

const PUBLIC_PATHS = ["/", "/login", "/api/login"];
const PUBLIC_PREFIXES = ["/static", "/_frsh", "/favicon.ico", "/manifest.json"];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.includes(pathname) ||
    PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function isProtectedPath(pathname: string) {
  return pathname === "/home";
}

export async function handler(
  req: Request,
  ctx: MiddlewareHandlerContext<Record<string, unknown>>,
) {
  const url = new URL(req.url);
  const pathname = url.pathname;

  const cookies = getCookies(req.headers);
  const token = cookies[SESSION_COOKIE_NAME];
  const session = token ? validateSession(token) : null;
  const user: PublicUser | null = session ?? null;

  if (user) {
    ctx.state.user = user;
  }

  if (!user && isProtectedPath(pathname)) {
    return Response.redirect(new URL("/", req.url), 302);
  }

  if (user && pathname === "/") {
    return Response.redirect(new URL("/home", req.url), 302);
  }

  if (!user && !isPublicPath(pathname) && !isProtectedPath(pathname)) {
    return Response.redirect(new URL("/", req.url), 302);
  }

  return await ctx.next();
}
