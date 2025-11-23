import type { Nikki } from "../../domain/entities/Nikki.ts";
import type { INikkiRepository } from "../interfaces/INikkiRepository.ts";

export interface ListNikkiInput {
  userId: number;
  page: number;
  pageSize: number;
}

export interface ListNikkiOutput {
  items: Nikki[];
  page: number;
  pageSize: number;
  total: number;
}

export class ListNikkiUseCase {
  constructor(private readonly nikkiRepository: INikkiRepository) {}

  async execute(input: ListNikkiInput): Promise<ListNikkiOutput> {
    // Validate input
    if (input.page < 1) {
      throw new Error("Page must be >= 1");
    }
    if (input.pageSize < 1 || input.pageSize > 100) {
      throw new Error("Page size must be between 1 and 100");
    }

    const { items, total } = await this.nikkiRepository.findByUserPaginated(
      input.userId,
      input.page,
      input.pageSize,
    );

    return {
      items,
      page: input.page,
      pageSize: input.pageSize,
      total,
    };
  }
}
