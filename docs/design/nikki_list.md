# Design: Nikki List & Auth Persistence

## 1. Auth Persistence

### Overview
Ensure the user remains logged in across page reloads. The frontend will check the session status on initialization.

### API: `GET /api/me`

- **Description**: Returns the currently authenticated user's information.
- **Auth**: Required (Session Cookie).

#### Swagger Definition
```yaml
paths:
  /me:
    get:
      summary: Get current user
      responses:
        '200':
          description: Authenticated
          content:
            application/json:
              schema:
                type: object
                properties:
                  user:
                    type: object
                    properties:
                      id:
                        type: string
                      name:
                        type: string
        '401':
          description: Not Authenticated
```

### Frontend Logic
- **Component**: `AuthProvider` (or similar context).
- **Behavior**:
    - On mount, call `GET /api/me`.
    - If 200: Set user state, allow access to protected routes.
    - If 401: Clear user state, redirect to `/` (Login) if on a protected route.

---

## 2. Nikki List (Home Page)

### Overview
The main dashboard displaying a list of diary entries (Nikkis).

### API: `GET /api/nikki`

- **Description**: Fetch a list of Nikki entries for the current user.
- **Auth**: Required.

#### Swagger Definition
```yaml
paths:
  /nikki:
    get:
      summary: List Nikki entries
      parameters:
        - in: query
          name: limit
          schema:
            type: integer
            default: 50
        - in: query
          name: offset
          schema:
            type: integer
            default: 0
      responses:
        '200':
          description: List of entries
          content:
            application/json:
              schema:
                type: object
                properties:
                  items:
                    type: array
                    items:
                      type: object
                      properties:
                        id:
                          type: integer
                        content:
                          type: string
                        date:
                          type: string
                          format: date-time
                        tags:
                          type: array
                          items:
                            type: string
```

### Database Schema (Prisma)

Need to add `Nikki` and `Tag` models.

```prisma
model Nikki {
  id        Int      @id @default(autoincrement())
  content   String
  date      DateTime @default(now())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  tags      Tag[]
}

model Tag {
  id      Int     @id @default(autoincrement())
  name    String
  nikkis  Nikki[]
}
```

### Frontend UI (`/home`)

- **Layout**:
    - **Header**: App Bar with Logo and "Logout" button.
    - **Main**: Grid or List of `NikkiCard` components.
    - **FAB**: Floating Action Button (+) to create a new entry (navigate to `/nikki/new` - implementation later).

- **Components**:
    - `NikkiCard`:
        - Display `date` (formatted).
        - Display `content` (truncated if too long).
        - Display `tags` (Chips).
