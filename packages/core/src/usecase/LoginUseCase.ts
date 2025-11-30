import type { LoginUser } from "../api/login.ts"
import type { UserRepository } from "../repositories/UserRepository.ts"
import type { CryptoService } from "../services/CryptoService.ts"

export class InvalidCredentialsError extends Error {
  constructor() {
    super("Invalid credentials")
    this.name = "InvalidCredentialsError"
  }
}

export class LoginUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly cryptoService: CryptoService,
  ) {}

  async execute(userId: string, password: string): Promise<LoginUser> {
    const user = await this.userRepository.findById(userId)

    if (!user) {
      throw new InvalidCredentialsError()
    }

    const encryptedInput = await this.cryptoService.encrypt(password)
    if (encryptedInput !== user.password) {
      throw new InvalidCredentialsError()
    }

    return { id: user.id, name: user.name }
  }
}
