# Login Backend Implementation Plan (Issue #96)

## Goal

Deliver `/api/login` on Fresh/Deno with Clean Architecture so valid credentials
return user info and invalid ones return proper errors.

## Assumptions / Open Questions

- DB: use SQLite `users` table from `packages/db/schema.sql`; file path via
  `DB_PATH` env or fallback `packages/db/nikki.db`.
- Passwords are compared as stored (hashing not specified). If hashing is
  required, we need a follow-up change.
- Response omits `password`; returns `{ id, user_id, user_name }`.
- Error mapping: no result or multi result -> 400; unexpected errors -> 500.

## Deliverables

- `packages/domain/entities/User.ts`: domain entity definition.
- `packages/usecase/interfaces/IUserRepository.ts`: repository contract.
- `packages/usecase/usecases/LoginUseCase.ts`: auth use case returning public
  user.
- `packages/infrastructure/db/sqlite.ts`: helper to create SQLite client and
  resolve DB path.
- `packages/infrastructure/repositories/UserRepositoryImpl.ts`: SQLite-backed
  repository.
- `apps/web/routes/api/login.ts`: Fresh API route wiring request parsing to use
  case and HTTP response mapping.
- Tests: use case unit, repository integration, route integration.

## Implementation Steps

1. **Domain**

- Add `User` interface with `id`, `user_id`, `user_name`, `password`.
- Optionally export `PublicUser` type omitting `password` for responses.

2. **Repository Interface**

- Define
  `IUserRepository.findByUserIdAndPassword(userId, password): Promise<User | null>`.

3. **Use Case**

- `LoginUseCase.execute(userId, password)`:
  - Validate non-empty inputs (trimmed); on invalid or null repository result,
    throw `Error("User not found")`.
  - Return public user (strip password).

4. **Infrastructure: DB Helper**

- `createSQLiteClient(dbPath?)` using `deno-sqlite`.
- Resolve default path from `DB_PATH` env or `packages/db/nikki.db`.

5. **Infrastructure: Repository**

- Query:
  `SELECT id, user_id, user_name, password FROM users WHERE user_id = ? AND password = ?`.
- 0 rows -> null; >1 rows -> throw `Error("Multi Result Found")`; 1 row -> map
  to `User`.

6. **API Route `/api/login`**

- Parse JSON body; validate `user_id` and `password` are present strings.
- Instantiate repository + use case with SQLite client.
- Success: 200 + public user JSON. Expected errors -> 400. Unexpected -> 500
  (log).
- Ensure DB connection is closed in `finally`.

7. **Testing**

- **Use Case**: success path, repo null -> error, empty inputs -> error (mock
  repo).
- **Repository**: using temp SQLite DB seeded from schema; test success, null,
  duplicate rows -> error.
- **Route**: with temp DB via `DB_PATH` env; test 200 on valid, 400 on invalid
  credentials, 400 on missing fields.

## Risks / Watchpoints

- Password hashing ambiguity; currently plaintext compare per spec.
- DB lifecycle: avoid leaked handles; close per request in route/tests.
- Avoid leaking detailed auth errors to client; keep consistent messages.
