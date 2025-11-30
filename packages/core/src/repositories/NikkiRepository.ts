import type { Nikki } from "../domain/nikki.ts"

export interface NikkiRepository {
  findByUser(
    userId: string,
    options?: { limit?: number; offset?: number },
  ): Promise<Nikki[]>
}
