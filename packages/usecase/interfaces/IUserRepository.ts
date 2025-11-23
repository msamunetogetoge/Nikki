import { User } from "../../domain/entities/User.ts";

export interface IUserRepository {
  findByUserIdAndPassword(
    userId: string,
    password: string,
  ): Promise<User | null>;
}
