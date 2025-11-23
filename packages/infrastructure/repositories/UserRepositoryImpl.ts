import { User } from "../../domain/entities/User.ts";
import { IUserRepository } from "../../usecase/interfaces/IUserRepository.ts";
import { SQLiteClient } from "../db/sqlite.ts";

type UserRow = {
  id: number;
  user_id: string;
  user_name: string;
  password: string;
};

export class UserRepositoryImpl implements IUserRepository {
  constructor(private readonly db: SQLiteClient) {}

  async findByUserIdAndPassword(
    userId: string,
    password: string,
  ): Promise<User | null> {
    const results = this.db.queryEntries<UserRow>(
      `
        SELECT id, user_id, user_name, password
        FROM users
        WHERE user_id = ? AND password = ?
      `,
      [userId, password],
    );

    if (results.length === 0) {
      return null;
    }

    if (results.length > 1) {
      throw new Error("Multi Result Found");
    }

    const user = results[0];
    return {
      id: user.id,
      user_id: user.user_id,
      user_name: user.user_name,
      password: user.password,
    };
  }
}
