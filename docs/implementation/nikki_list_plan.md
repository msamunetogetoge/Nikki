# Implementation Plan: Nikki List & Auth Persistence

## Phase 1: Database & Backend Core

- [ ] **Schema Update (`packages/db`)**:
    - Update `schema.prisma` to include `Nikki` and `Tag` models.
    - Run `prisma migrate dev` (or `db push` for SQLite dev).
    - Update `seed.ts` to include sample Nikki entries for `demo_user`.
- [ ] **Repositories (`packages/db`)**:
    - Create `NikkiRepository`.
- [ ] **Use Cases (`packages/core`)**:
    - Create `GetNikkiListUseCase`.
    - Create `AuthUseCase` (update to include `getCurrentUser`).

## Phase 2: API Implementation (`apps/api`)

- [ ] **Auth Persistence**:
    - Implement `GET /api/me`.
    - Ensure it verifies the session cookie.
    - Implement `POST /api/logout` (Clear cookie).
- [ ] **Nikki List**:
    - Implement `GET /api/nikki`.
    - Use `GetNikkiListUseCase`.

## Phase 3: Frontend Implementation (`apps/nikki_next`)

- [ ] **Auth Context**:
    - Create `AuthProvider` (or use Zustand/Jotai) to manage user state.
    - Implement `checkSession` on app mount (call `GET /api/me`).
    - Handle 401 redirects.
- [ ] **Home Page (`/home`)**:
    - Create `app/home/page.tsx`.
    - Implement `NikkiList` and `NikkiCard` components.
    - Fetch data from `GET /api/nikki`.
    - Add Logout button.

## Phase 4: Verification

- [ ] **Manual Test**:
    - Login -> Redirect to Home.
    - Refresh page -> Stay logged in.
    - View list of Nikkis (from seed).
    - Logout -> Redirect to Login.
