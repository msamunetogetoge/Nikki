import { Handlers } from "$fresh/server.ts";
import { LoginUseCase } from "../../../../packages/usecase/usecases/LoginUseCase.ts";
import { UserRepositoryImpl } from "../../../../packages/infrastructure/repositories/UserRepositoryImpl.ts";
import {
  createSQLiteClient,
  defaultDbPath,
} from "../../../../packages/infrastructure/db/sqlite.ts";
import { setCookie } from "std/http/cookie";
import {
  createSession,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
} from "../../utils/session.ts";
import type { PublicUser } from "@domain/entities/User.ts";

interface LoginBody {
  user_id?: string;
  password?: string;
}

const handler: Handlers = {
  async POST(request) {
    let payload: LoginBody | undefined;
    try {
      payload = (await request.json()) as LoginBody;
    } catch (_err) {
      return jsonResponse({ error: "Invalid JSON body" }, 400);
    }

    if (!payload?.user_id || !payload?.password) {
      return jsonResponse(
        { error: "user_id と password は必須です。" },
        400,
      );
    }

    const userId = payload.user_id;
    const password = payload.password;

    const db = createSQLiteClient(defaultDbPath());
    const userRepository = new UserRepositoryImpl(db);
    const loginUseCase = new LoginUseCase(userRepository);

    try {
      const user = await loginUseCase.execute(userId, password);
      const publicUser: PublicUser = {
        id: user.id,
        user_id: user.user_id,
        user_name: user.user_name,
      };
      const headers = new Headers();
      setCookie(headers, {
        name: SESSION_COOKIE_NAME,
        value: createSession(publicUser),
        httpOnly: true,
        sameSite: "Lax",
        secure: shouldUseSecureCookie(request),
        path: "/",
        maxAge: SESSION_MAX_AGE_SECONDS,
      });

      return jsonResponse(publicUser, 200, headers);
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : "Unexpected error";

      if (message === "User not found" || message === "Multi Result Found") {
        return jsonResponse({ error: message }, 400);
      }

      console.error("[/api/login] Unexpected error:", message);
      return jsonResponse({ error: "Unexpected error" }, 500);
    } finally {
      db.close();
    }
  },
};

export { handler };

function shouldUseSecureCookie(request: Request) {
  const requestIsHttps = new URL(request.url).protocol === "https:";
  return requestIsHttps || Deno.env.get("COOKIE_SECURE") === "true";
}

function jsonResponse(
  body: unknown,
  status = 200,
  headersInit?: HeadersInit,
) {
  const headers = new Headers(headersInit ?? {});
  headers.set("Content-Type", "application/json");
  return new Response(JSON.stringify(body), {
    status,
    headers,
  });
}
