import { PublicUser } from "../../domain/entities/User.ts";
import { IUserRepository } from "../interfaces/IUserRepository.ts";

export class LoginUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string, password: string): Promise<PublicUser> {
    if (!userId?.trim() || !password?.trim()) {
      throw new Error("User not found");
    }

    const user = await this.userRepository.findByUserIdAndPassword(
      userId,
      password,
    );

    if (!user) {
      throw new Error("User not found");
    }

    const { password: _password, ...publicUser } = user;
    return publicUser;
  }
}
