export interface User {
  id: number;
  user_id: string;
  user_name: string;
  password: string;
}

export type PublicUser = Omit<User, "password">;
