import type { Nikki } from "../../domain/entities/Nikki.ts";

export interface INikkiRepository {
  findByUserPaginated(
    userId: number,
    page: number,
    pageSize: number,
  ): Promise<{ items: Nikki[]; total: number }>;
}
