# Implementation Plan: Login Page & Auth API

## Prerequisites

- [ ] **Database**: SQLite database initialized with `User` table using **Prisma**.
- [ ] **Shared Core**: `packages/core` set up for shared types.

## Phase 1: Backend (Auth API)

**IMPORTANT: All backend implementation MUST follow the TDD (Test-Driven Development) cycle: Red -> Green -> Refactor.**

### 1. Domain & Infrastructure (`packages/core`, `packages/db`)

- [ ] **Prisma Schema (`packages/db/prisma/schema.prisma`)**:
    ```prisma
    datasource db {
      provider = "sqlite"
      url      = "file:./dev.db"
    }

    generator client {
      provider = "prisma-client-js"
    }

    model User {
      id       String @id
      password String // Encrypted
      name     String
    }
    ```
- [ ] **Crypto Service**: Implement `CryptoService` in `packages/core` using a standard library (e.g., `crypto-js`).
- [ ] **User Repository**: Implement `UserRepository` in `packages/db`.
    ```typescript
    // packages/db/src/repositories/UserRepository.ts
    import { PrismaClient } from '@prisma/client';
    const prisma = new PrismaClient();

    export class UserRepository {
      async findById(id: string) {
        return prisma.user.findUnique({ where: { id } });
      }
    }
    ```
- [ ] **Auth Use Case**: Implement `LoginUseCase` in `packages/core`.

### 2. API Layer (`apps/api`)
- [ ] **Route**: Create `routes/auth.ts`.
- [ ] **Handler**: Implement `POST /login` handler.
    - Validate input.
    - Call `LoginUseCase`.
    - Set session cookie (Hono session or standard cookie).
    - Return response.
- [ ] **Integration**: Register route in `apps/api/src/index.ts`.

## Phase 2: Frontend (Login Page)

### 1. API Client (`apps/nikki_next`)
- [ ] **Client**: Update `lib/api.ts` to include `login(userId, password)` method.

### 2. UI Implementation (`apps/nikki_next`)
- [ ] **Page**: Create/Update `app/page.tsx` (Login Page).
    - Implement layout (MUI Container, Card).
    - Implement Form (TextFields, Button).
    - Wire up state (`useState`).
    - Call `api.login()` on submit.
    - Handle success (redirect to `/home`) and error (show Alert).

## Phase 3: Verification

- [ ] **Manual Test**:
    - Start API and Web.
    - Try logging in with seeded user.
    - Verify cookie is set.
    - Verify redirect to `/home`.
