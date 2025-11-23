# Login Frontend Implementation Plan (Issue #97)

## Goal

Implement a stable login experience in **Fresh (Deno)** that authenticates
users, persists session state via Cookies, protects authenticated routes, and
provides clear UX/error handling.

## Assumptions / Open Questions

- **API Endpoint**: `/api/login` (POST).
- **Payload**: JSON `{ "user_id": "...", "password": "..." }`.
- **Auth Mechanism**: Server-side HttpOnly Cookie (`auth_token` or similar).
- **State Management**: Preact Signals for form state; Cookie for session
  persistence.
- **Protected Routes**: `/_middleware.ts` will handle redirection for
  unauthenticated users on protected paths (e.g., `/`, `/user`).

## Deliverables

- **UI Components**:
  - `islands/LoginForm.tsx`: Interactive form with validation and fetch logic.
  - `routes/login.tsx`: The login page wrapper.
- **Logic & State**:
  - `routes/_middleware.ts`: Global middleware to check auth cookie and redirect
    if needed.
  - `utils/auth_state.ts` (Optional): Signal for client-side UI updates (e.g.,
    header user name) if needed, though Fresh prefers SSR.
- **Integration**:
  - `routes/api/login.ts`: (Backend task, but FE relies on it) - Endpoint to
    verify credentials and set Cookie.
  - `routes/index.tsx`: Update to show different content based on auth state
    (passed via `ctx.state`).

## Implementation Steps

### 1) UI Components (Islands)

- **`islands/LoginForm.tsx`**
  - Inputs: `user_id`, `password`.
  - State: `useSignal` for inputs, `isLoading`, `error`.
  - Action: `fetch('/api/login', { method: 'POST', ... })`.
  - Success: `window.location.href = '/'` (or redirect URL).
  - Error: Display error message inline.

### 2) Page Route

- **`routes/login.tsx`**
  - Render `LoginForm` island.
  - Layout: Centered card design.
  - If already logged in (check `ctx.state.user`), redirect to home.

### 3) Middleware (Route Protection)

- **`routes/_middleware.ts`**
  - Intercept requests.
  - Check for Session Cookie.
  - If valid: Set `ctx.state.user`.
  - If invalid & accessing protected route: Redirect to `/login`.
  - Protected routes: `/` (Home), `/user/*`.
  - Public routes: `/login`, `/api/login`, `/static/*`.

### 4) Header / Navigation

- **`components/Header.tsx`** (or similar)
  - Update to display "Login" link if `!user`.
  - Display "Logout" / User Name if `user`.
  - Logout flow: Link to `/api/logout` (or button triggering fetch to clear
    cookie).

### 5) Testing

- **Unit**: Test `LoginForm` validation logic.
- **Integration**: Test middleware redirection (mock request/cookie).

## Risks / Watchpoints

- **Cookie Security**: Ensure `HttpOnly`, `Secure` (in prod), `SameSite=Lax`.
- **Hydration**: Ensure server-rendered state matches client expectations.
- **Error Handling**: Handle network errors gracefully in `LoginForm`.
