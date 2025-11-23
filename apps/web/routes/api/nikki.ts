import { Handlers } from "$fresh/server.ts";
import { ListNikkiUseCase } from "@usecase/usecases/ListNikkiUseCase.ts";
import { NikkiRepositoryImpl } from "@infra/repositories/NikkiRepositoryImpl.ts";
import {
  createSQLiteClient,
  defaultDbPath,
} from "@infra/db/sqlite.ts";

interface AuthState {
  user?: {
    id: number;
    user_id: string;
    user_name: string;
  };
}

const handler: Handlers<unknown, AuthState> = {
  async GET(request, ctx) {
    // Check authentication
    if (!ctx.state.user) {
      return jsonResponse({ error: "unauthorized" }, 401);
    }

    const userId = ctx.state.user.id;

    // Parse query parameters
    const url = new URL(request.url);
    const pageParam = url.searchParams.get("page");
    const pageSizeParam = url.searchParams.get("page_size");

    const page = pageParam ? parseInt(pageParam, 10) : 1;
    const pageSize = pageSizeParam ? parseInt(pageSizeParam, 10) : 20;

    // Validate parameters
    if (isNaN(page) || page < 1) {
      return jsonResponse({ error: "invalid_page" }, 400);
    }
    if (isNaN(pageSize) || pageSize < 1 || pageSize > 100) {
      return jsonResponse({ error: "invalid_page" }, 400);
    }

    const db = createSQLiteClient(defaultDbPath());
    const nikkiRepository = new NikkiRepositoryImpl(db);
    const listNikkiUseCase = new ListNikkiUseCase(nikkiRepository);

    try {
      const result = await listNikkiUseCase.execute({
        userId,
        page,
        pageSize,
      });

      return jsonResponse(result, 200);
    } catch (error) {
      console.error("[/api/nikki] Unexpected error:", error);
      return jsonResponse({ error: "internal_error" }, 500);
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
