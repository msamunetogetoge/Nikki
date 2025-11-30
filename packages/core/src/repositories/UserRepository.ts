import type { User } from "../domain/user.ts"

export interface UserRepository {
  findById(id: string): Promise<User | null>
}
