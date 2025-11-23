import {
  assertEquals,
  assertRejects,
} from "https://deno.land/std@0.224.0/testing/asserts.ts";
import { User } from "../../../domain/entities/User.ts";
import { IUserRepository } from "../../interfaces/IUserRepository.ts";
import { LoginUseCase } from "../LoginUseCase.ts";

class MockUserRepository implements IUserRepository {
  constructor(private readonly user: User | null) {}

  async findByUserIdAndPassword(): Promise<User | null> {
    return this.user;
  }
}

Deno.test("LoginUseCase returns public user for valid credentials", async () => {
  const user: User = {
    id: 1,
    user_id: "tester",
    user_name: "Tester",
    password: "secret",
  };

  const useCase = new LoginUseCase(new MockUserRepository(user));
  const result = await useCase.execute("tester", "secret");

  assertEquals(result, {
    id: 1,
    user_id: "tester",
    user_name: "Tester",
  });
});

Deno.test("LoginUseCase throws when repository returns null", async () => {
  const useCase = new LoginUseCase(new MockUserRepository(null));

  await assertRejects(
    () => useCase.execute("unknown", "secret"),
    Error,
    "User not found",
  );
});

Deno.test("LoginUseCase throws when inputs are empty", async () => {
  const useCase = new LoginUseCase(
    new MockUserRepository({
      id: 1,
      user_id: "tester",
      user_name: "Tester",
      password: "secret",
    }),
  );

  await assertRejects(
    () => useCase.execute("   ", ""),
    Error,
    "User not found",
  );
});
