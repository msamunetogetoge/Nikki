# Implementation Plan: Issue #105 - HttpOnly Auth Cookie

## Goal

Implement secure authentication using HttpOnly cookies for the `/api/login` endpoint. After successful login, set a secure session cookie that will be used to authenticate subsequent requests to protected routes like `/home` and `/api/nikki`.

## User Review Required

> [!IMPORTANT]
> **Security Consideration**: This implementation will use HttpOnly cookies to prevent XSS attacks. The cookie will be:
> - HttpOnly (not accessible via JavaScript)
> - Secure (HTTPS only in production)
> - SameSite=Lax (CSRF protection)

> [!IMPORTANT]
> **Session Management**: This initial implementation will use a simple session token approach. For production, consider:
> - Session expiration (e.g., 24 hours)
> - Session storage (in-memory for now, database for production)
> - Logout functionality (future issue)

## Proposed Changes

### Backend API

#### [MODIFY] [login.ts](file:///c:/Users/kenji/code/typescript/Nikki/apps/web/routes/api/login.ts)

Update the login handler to set HttpOnly cookie:
- After successful authentication, generate session token
- Set cookie with `Set-Cookie` header
- Cookie name: `nikki_session`
- Cookie attributes: `HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=86400`
- Return user data (without password) in response body

Example response headers:
```
Set-Cookie: nikki_session=<token>; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=86400
```

#### [NEW] [session.ts](file:///c:/Users/kenji/code/typescript/Nikki/apps/web/utils/session.ts)

Session utility functions:
- `generateSessionToken()`: Generate secure random token
- `createSession(userId: string)`: Create session and return token
- `validateSession(token: string)`: Validate token and return user info
- `deleteSession(token: string)`: Delete session (for logout)

Session storage (in-memory for now):
```typescript
const sessions = new Map<string, { userId: string; expiresAt: number }>();
```

#### [MODIFY] [home.tsx](file:///c:/Users/kenji/code/typescript/Nikki/apps/web/routes/home.tsx)

Update home route handler to validate auth:
- Read `nikki_session` cookie from request
- Call `validateSession(token)` to get user info
- If valid: render home page with user data
- If invalid: redirect to `/` (login page)

---

### Testing

#### [NEW] [session.test.ts](file:///c:/Users/kenji/code/typescript/Nikki/apps/web/utils/__tests__/session.test.ts)

Unit tests for session utilities:
- Should generate unique session tokens
- Should create and validate sessions
- Should reject expired sessions
- Should delete sessions

#### [MODIFY] [login.test.ts](file:///c:/Users/kenji/code/typescript/Nikki/apps/web/routes/api/__tests__/login.test.ts)

Update login tests to verify cookie:
- Should set `Set-Cookie` header on successful login
- Cookie should have HttpOnly attribute
- Cookie should have correct Max-Age
- Should not set cookie on failed login

#### [NEW] [home.test.ts](file:///c:/Users/kenji/code/typescript/Nikki/apps/web/routes/__tests__/home.test.ts)

Tests for home route auth:
- Should render home page when valid session cookie present
- Should redirect to `/` when no cookie present
- Should redirect to `/` when invalid cookie present
- Should redirect to `/` when expired cookie present

---

## Verification Plan

### Automated Tests

Run all tests:
```bash
cd apps/web
deno test
```

Specific test files:
- `deno test utils/__tests__/session.test.ts`
- `deno test routes/api/__tests__/login.test.ts`
- `deno test routes/__tests__/home.test.ts`

### Manual Verification

**Prerequisites**:
1. Start dev server: `cd apps/web && deno task start`
2. Open browser DevTools (Network tab)

**Test Steps**:

1. **Login and Cookie Set**:
   - Navigate to `http://localhost:8000/`
   - Open DevTools → Application → Cookies
   - Login with valid credentials
   - **Expected**: See `nikki_session` cookie set
   - **Expected**: Cookie has HttpOnly flag
   - **Expected**: Cookie has SameSite=Lax
   - **Expected**: Redirect to `/home`

2. **Home Page Access with Cookie**:
   - After login, verify you're on `/home`
   - Refresh the page
   - **Expected**: Still on `/home` (cookie persists)

3. **Home Page Access without Cookie**:
   - Open DevTools → Application → Cookies
   - Delete `nikki_session` cookie
   - Navigate to `http://localhost:8000/home`
   - **Expected**: Redirect to `/` (login page)

4. **Cookie Expiration** (optional, requires waiting):
   - Login successfully
   - Wait for cookie to expire (24 hours, or reduce Max-Age for testing)
   - Try to access `/home`
   - **Expected**: Redirect to `/` (login page)

### Browser Testing

Use browser tool to automate:
- Login flow
- Verify cookie is set in response headers
- Verify redirect to `/home`
- Delete cookie and verify redirect back to login
- Capture screenshots of each step

## Implementation Notes

- Use `crypto.randomUUID()` for session token generation
- Store sessions in memory (Map) for simplicity
- Session expiration: 24 hours (86400 seconds)
- Cookie path: `/` (accessible to all routes)
- In production, consider using Redis or database for session storage
- Consider implementing CSRF tokens for additional security

## Migration Reference

This is new functionality not present in the Nuxt.js version. The original app likely used different authentication (possibly JWT or server-side sessions with different framework).
