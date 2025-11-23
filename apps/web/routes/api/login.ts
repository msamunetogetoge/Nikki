import { Handlers } from "$fresh/server.ts";
import { LoginUseCase } from "../../../../packages/usecase/usecases/LoginUseCase.ts";
import { UserRepositoryImpl } from "../../../../packages/infrastructure/repositories/UserRepositoryImpl.ts";
import {
  createSQLiteClient,
  defaultDbPath,
} from "../../../../packages/infrastructure/db/sqlite.ts";

interface LoginBody {
  user_id?: string;
  password?: string;
}

const ERROR_USER_NOT_FOUND = "User not found";
const ERROR_MULTI_RESULT = "Multi Result Found";

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
      return jsonResponse(user, 200);
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : "Unexpected error";

      if (message === ERROR_USER_NOT_FOUND) {
        return jsonResponse({ error: "ユーザーが見つかりません。" }, 400);
      }

      if (message === ERROR_MULTI_RESULT) {
        return jsonResponse({ error: "複数のユーザーが見つかりました。" }, 400);
      }

      console.error("[/api/login] Unexpected error:", error);
      return jsonResponse({ error: "Unexpected error" }, 500);
    } finally {
      db.close();
    }
  },
};

export { handler };

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
