# Backend API Design: [API Name]

## Overview

- **Method**: `GET` / `POST` / `PUT` / `DELETE`
- **Path**: `/api/v1/...`
- **Description**: Brief description of what this API does.

## Request

### Headers

- `Authorization`: Bearer token (if applicable)

### Path Parameters

| Name | Type   | Description |
| :--- | :----- | :---------- |
| `id` | string | ...         |

### Query Parameters

| Name    | Type   | Required | Description |
| :------ | :----- | :------- | :---------- |
| `limit` | number | No       | ...         |

### Body (JSON)

```json
{
  "field": "value"
}
```

## Response

### Success (200 OK)

```json
{
  "data": ...
}
```

### Error Responses

# Backend API Design: [API Name]

## Overview

- **Method**: `GET` / `POST` / `PUT` / `DELETE`
- **Path**: `/api/v1/...`
- **Description**: Brief description of what this API does.

## Request

### Headers

- `Authorization`: Bearer token (if applicable)

### Path Parameters

| Name | Type   | Description |
| :--- | :----- | :---------- |
| `id` | string | ...         |

### Query Parameters

| Name    | Type   | Required | Description |
| :------ | :----- | :------- | :---------- |
| `limit` | number | No       | ...         |

### Body (JSON)

```json
{
  "field": "value"
}
```

## Response

### Success (200 OK)

```json
{
  "data": ...
}
```

### Error Responses

- **400 Bad Request**: Invalid input.
- **401 Unauthorized**: Missing or invalid token.
- **404 Not Found**: Resource not found.
- **500 Internal Server Error**: Server error.

## Implementation Details (Clean Architecture)

### Controller (`apps/web/routes/api/...`)

- **Handler Function**: `handlerName`
- **Responsibility**: Parse request, validate input, call Use Case, format response.

### Use Case (`packages/usecase/usecases/...`)

- **Name**: `[Action]UseCase` (e.g., `CreateNikkiUseCase`)
- **Input**: `[Action]Input` (DTO)
- **Output**: `[Action]Output` (DTO or Entity)
- **Logic**:
  1.  ...
  2.  ...

### Repository Interface (`packages/usecase/interfaces/...`)

- **Interface Name**: `I[Entity]Repository`
- **Method**: `methodName(args): Promise<ReturnType>`

### Infrastructure (`packages/infrastructure/repositories/...`)

- **Implementation**: `[Entity]RepositoryImpl`
- **SQL**:
  ```sql
  SELECT ...
  ```
