import { assertEquals } from "jsr:@std/assert"
import type { TestSuite } from "../../../scripts/deno_test_runner.ts"
import type { Nikki } from "../../../packages/core/src/domain/nikki.ts"
import type { NikkiRepository } from "../../../packages/core/src/repositories/NikkiRepository.ts"
import { GetNikkiListUseCase } from "../../../packages/core/src/usecase/GetNikkiListUseCase.ts"

class NikkiRepositoryStub implements NikkiRepository {
  public lastArgs:
    | { userId: string; limit?: number; offset?: number }
    | undefined

  constructor(private readonly nikkis: Nikki[]) {}

  async findByUser(
    userId: string,
    options?: { limit?: number; offset?: number },
  ): Promise<Nikki[]> {
    this.lastArgs = { userId, ...options }
    const limit = options?.limit ?? 50
    const offset = options?.offset ?? 0
    return this.nikkis.slice(offset, offset + limit)
  }
}

export const getNikkiListUseCaseSuite: TestSuite = {
  name: "GetNikkiListUseCase",
  tests: [
    {
      name: "returns nikki items with default pagination",
      fn: async () => {
        const repo = new NikkiRepositoryStub([
          { id: 1, content: "First", date: new Date("2024-01-01"), tags: ["life"], userId: "alice" },
        ])
        const useCase = new GetNikkiListUseCase(repo)

        const result = await useCase.execute("alice", {})

        assertEquals(result.items, [
          { id: 1, content: "First", date: new Date("2024-01-01"), tags: ["life"], userId: "alice" },
        ])
        assertEquals(repo.lastArgs, { userId: "alice", limit: undefined, offset: undefined })
      },
    },
    {
      name: "honors provided limit and offset",
      fn: async () => {
        const repo = new NikkiRepositoryStub([
          { id: 1, content: "First", date: new Date("2024-01-01"), tags: ["life"], userId: "alice" },
          { id: 2, content: "Second", date: new Date("2024-01-02"), tags: ["work"], userId: "alice" },
          { id: 3, content: "Third", date: new Date("2024-01-03"), tags: ["study"], userId: "alice" },
        ])
        const useCase = new GetNikkiListUseCase(repo)

        const result = await useCase.execute("alice", { limit: 1, offset: 1 })

        assertEquals(result.items, [
          { id: 2, content: "Second", date: new Date("2024-01-02"), tags: ["work"], userId: "alice" },
        ])
        assertEquals(repo.lastArgs, { userId: "alice", limit: 1, offset: 1 })
      },
    },
  ],
}
