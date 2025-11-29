# Implementation Request: Login Page & Auth API

## Objective
Implement the Login Page and Authentication API to enable user login.

## References
- **Design (Frontend)**: [docs/design/login_page.md](../design/login_page.md)
- **Design (Backend)**: [docs/design/auth_api.md](../design/auth_api.md)
- **Implementation Plan**: [docs/implementation/login_auth_plan.md](../implementation/login_auth_plan.md)

## Instructions
1.  **Read the References**: Understand the design and the steps required.
2.  **Execute Phase 1 (Backend)**:
    -   **Runtime Enforcement**: You MUST use **Deno**. Do NOT use Node.js.
    -   **Cleanup**: Remove `@hono/node-server` and other Node-specific dependencies from `apps/api/package.json`. Ensure `deno.json` is used.
    -   **TDD Enforcement**: You MUST use Test-Driven Development. Write the test *before* the implementation for every component.
    -   **Type Generation**: Generate TypeScript types from the Swagger definition in `docs/design/auth_api.md` (or save it to a file and generate). Ensure both FE and BE use these types.
    -   **Database**: Setup Prisma with SQLite and the `User` model.
    -   **Crypto**: Implement simple encryption/decryption using a standard library.
    -   **API**: Create the Hono API endpoint `POST /login` using the generated types.
3.  **Execute Phase 2 (Frontend)**:
    -   **Login Page**: Implement the Login Page in Next.js using MUI.
    -   **Alerts**: Display "Login Success" or "Login Failed" alerts instead of redirecting.
    -   **API Integration**: Connect to the API using the generated types.
4.  **Verify**:
    -   Ensure you can log in with a test user (seed data).
5.  **Create PR**:
    -   Create a Pull Request with your changes.

## Notes
- Ensure strict adherence to the Clean Architecture principles defined in `docs/architecture.md`.
- Use the existing `packages/db` and `packages/core` workspaces.
