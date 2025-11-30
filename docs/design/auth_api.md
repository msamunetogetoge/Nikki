# Backend API Design: Login

## Overview

- **Method**: `POST`
- **Path**: `/api/login`
- **Description**: Authenticates a user using User ID and Password. Returns a session token or cookie.
- **Type Safety**: API types (Request/Response) MUST be generated from the Swagger definition below.

## Swagger Definition (OpenAPI 3.0)

```yaml
openapi: 3.0.0
info:
  title: Nikki API
  version: 1.0.0
paths:
  /login:
    post:
      summary: Login user
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                user_id:
                  type: string
                password:
                  type: string
              required:
                - user_id
                - password
      responses:
        '200':
          description: Login successful
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  user:
                    type: object
                    properties:
                      id:
                        type: string
                      name:
                        type: string
        '401':
          description: Unauthorized
```

## Request

### Body (JSON)

```json
{
  "user_id": "test_user",
  "password": "password123"
}
```

## Response

### Success (200 OK)

```json
{
  "success": true,
  "user": {
    "id": "test_user",
    "name": "Test User"
  }
}
```
*Note: Session cookie should be set via `Set-Cookie` header.*

### Error Responses

- **400 Bad Request**: Missing `user_id` or `password`.
- **401 Unauthorized**: Invalid credentials.

## Implementation Details

### Controller (`apps/api/src/routes/auth.ts`)

- **Handler**: `login`
- **Logic**:
    1.  Receive `user_id` and `password`.
    2.  Call `AuthUseCase.login(user_id, password)`.
    3.  If successful, set session cookie (signed) and return user info.
    4.  If failed, return 401.

### Use Case (`packages/core/usecase/AuthUseCase.ts`)

- **Name**: `LoginUseCase`
- **Logic**:
    1.  Fetch user from `UserRepository` by `user_id`.
    2.  Verify password.
        - **Encryption**: Use a suitable library (e.g., `crypto-js` or Node's `crypto`) to handle encryption/decryption.
        - Simple reversible encryption is sufficient for now to match the legacy requirement.
        - `encrypt(input_password) === stored_password_encrypted`.

### Infrastructure (`packages/db/...`)

- **Repository**: `UserRepository`
- **Method**: `findById(id)`

## Testing Strategy

### Unit Tests
- `LoginUseCase`:
    - Valid credentials -> Success.
    - Invalid credentials -> Error.
    - User not found -> Error.

### Integration Tests
- `POST /api/login`:
    - Send valid JSON -> 200 OK + Cookie.
    - Send invalid JSON -> 401.
