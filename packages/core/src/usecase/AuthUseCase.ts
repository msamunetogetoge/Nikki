import type { LoginUser } from "../api/login.ts"
import type { UserRepository } from "../repositories/UserRepository.ts"

export class AuthUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async getCurrentUser(sessionId?: string | null): Promise<LoginUser | null> {
    if (!sessionId) return null

    const user = await this.userRepository.findById(sessionId)
    if (!user) return null

    return { id: user.id, name: user.name }
  }
}
