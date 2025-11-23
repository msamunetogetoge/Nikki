# Backend API Design: Login

## Overview
*   **Method**: `POST`
*   **Path**: `/api/login`
*   **Description**: Authenticates a user and returns their user information.

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
Returns the `UserStore` object (User ID, Name, and internal ID).
```json
{
  "id": 1,
  "user_id": "test_user",
  "user_name": "Test User"
}
```

### Error Responses
*   **400 Bad Request**: "No Result Found" (User not found) or "Multi Result Found" (Duplicate users).
*   **500 Internal Server Error**: Unexpected error.

## Implementation Details (Clean Architecture)

### Domain Entity (`packages/domain/entities/User.ts`)
*   **Interface**: `User`
*   **Properties**:
    *   `id`: `number` (Internal ID)
    *   `user_id`: `string` (Login ID)
    *   `user_name`: `string` (Display Name)
    *   `password`: `string` (Hashed Password)

### Controller (`apps/web/routes/api/login.ts`)
*   **Handler Function**: `handler` (POST)
*   **Responsibility**:
    1.  Parse JSON body to get `user_id` and `password`.
    2.  Call `LoginUseCase.execute(user_id, password)`.
    3.  Return 200 with user data or 400 if error.

### Use Case (`packages/usecase/usecases/LoginUseCase.ts`)
*   **Name**: `LoginUseCase`
*   **Input**: `user_id`, `password`
*   **Output**: `User` entity
*   **Logic**:
    1.  Call `userRepository.findByUserIdAndPassword(user_id, password)`.
    2.  If null, throw Error("User not found").
    3.  Return User.

### Repository Interface (`packages/usecase/interfaces/IUserRepository.ts`)
*   **Interface Name**: `IUserRepository`
*   **Method**: `findByUserIdAndPassword(userId: string, password: string): Promise<User | null>`

### Infrastructure (`packages/infrastructure/repositories/UserRepositoryImpl.ts`)
*   **Implementation**: `UserRepositoryImpl`
*   **Tables Used**:
    *   `users` (Select)
*   **SQL**:
    ```sql
    -- Find user by ID and Password
    SELECT id, user_id, user_name, password FROM users WHERE user_id = ? AND password = ?
    ```

## Testing Strategy

### Unit Tests (`packages/usecase/tests/LoginUseCase.test.ts`)
*   **Test Case 1**: Should return User entity when valid `user_id` and `password` are provided.
*   **Test Case 2**: Should throw "User not found" error when `user_id` does not exist.
*   **Test Case 3**: Should throw "User not found" error when `password` is incorrect.

### Integration Tests (`packages/infrastructure/tests/UserRepository.test.ts`)
*   **Test Case 1**: Should return `User` object when querying with existing `user_id` and `password`.
*   **Test Case 2**: Should return `null` when querying with non-existent `user_id`.
