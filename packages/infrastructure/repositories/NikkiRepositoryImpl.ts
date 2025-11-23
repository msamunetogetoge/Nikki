import type { Nikki } from "../../domain/entities/Nikki.ts";
import type { INikkiRepository } from "../../usecase/interfaces/INikkiRepository.ts";
import type { SQLiteClient } from "../db/sqlite.ts";

type NikkiRow = {
  id: number;
  title: string;
  summary: string;
  content: string;
  goodness: number;
  created_at: string;
};

export class NikkiRepositoryImpl implements INikkiRepository {
  constructor(private readonly db: SQLiteClient) {}

  findByUserPaginated(
    userId: number,
    page: number,
    pageSize: number,
  ): Promise<{ items: Nikki[]; total: number }> {
    const offset = (page - 1) * pageSize;

    // Get total count
    const countResult = this.db.queryEntries<{ count: number }>(
      `SELECT COUNT(*) as count FROM nikki WHERE created_by = ?`,
      [userId],
    );

    const total = countResult[0]?.count ?? 0;

    // Get paginated items
    const results = this.db.queryEntries<NikkiRow>(
      `
        SELECT id, title, goodness, summary, content, created_at
        FROM nikki
        WHERE created_by = ?
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `,
      [userId, pageSize, offset],
    );

    const items: Nikki[] = results.map((row) => ({
      id: row.id,
      title: row.title,
      summary: row.summary,
      content: row.content,
      goodness: row.goodness,
      created_at: row.created_at,
    }));

    return Promise.resolve({ items, total });
  }
}
