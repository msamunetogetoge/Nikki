import type { Nikki } from "../domain/nikki.ts"
import type { NikkiRepository } from "../repositories/NikkiRepository.ts"

type Pagination = { limit?: number; offset?: number }

export class GetNikkiListUseCase {
  constructor(private readonly nikkiRepository: NikkiRepository) {}

  async execute(userId: string, pagination: Pagination): Promise<{ items: Nikki[] }> {
    const items = await this.nikkiRepository.findByUser(userId, {
      limit: pagination.limit,
      offset: pagination.offset,
    })
    return { items }
  }
}
