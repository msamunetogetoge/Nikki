# Implementation Request: Nikki List & Auth Persistence

## Objective
Implement the "Nikki List" (Home Page) and "Auth Persistence" (Session check) features.

## References
- **Design**: [docs/design/nikki_list.md](../design/nikki_list.md)
- **Implementation Plan**: [docs/implementation/nikki_list_plan.md](../implementation/nikki_list_plan.md)

## Instructions

### Phase 1: Database & Backend
1.  **Schema**: Update `packages/db/prisma/schema.prisma` to add `Nikki` and `Tag` models as defined in the design doc.
2.  **Migration**: Run `prisma migrate dev` (or `db push` if using SQLite dev file directly).
3.  **Seed**: Update `packages/db/seed.ts` to create at least 5 sample Nikki entries for `demo_user`.
4.  **Repositories**: Implement `NikkiRepository` in `packages/db`.
5.  **Use Cases**: Implement `GetNikkiListUseCase` and update `AuthUseCase` in `packages/core`.
6.  **API**:
    -   Implement `GET /api/me` (Auth Persistence).
    -   Implement `GET /api/nikki` (List).
    -   Implement `POST /api/logout` (Logout).
    -   **Constraint**: Use TDD. Write tests in `apps/api/tests` before implementing the routes.
    -   **Constraint**: Use Deno.
    -   **Constraint**: All test commands are allowed.

### Phase 2: Frontend
1.  **Auth Context**: Create an `AuthProvider` (or similar) to check `GET /api/me` on app mount. Redirect to `/` if not logged in (except for public pages if any).
2.  **Home Page**: Implement `apps/nikki_next/app/home/page.tsx`.
    -   Fetch Nikkis from `GET /api/nikki`.
    -   Display them using `NikkiList` and `NikkiCard` components (MUI).
    -   Add a "Logout" button that calls `POST /api/logout` and redirects to `/`.

## Verification
**Note**: The Docker environment is currently being prepared. For this task, focus ONLY on Implementation and Unit Testing. End-to-end verification will be requested separately.

-   **Backend**:
    -   Run unit tests: `deno task test` (or `deno test -A ...`).
    -   Ensure all new tests pass.
-   **Frontend**:
    -   Ensure the build passes: `npm run build` (or equivalent check).
