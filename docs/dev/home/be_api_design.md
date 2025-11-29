# Backend API Design: Get Nikki List

## Overview

- **Method**: `GET`
- **Path**: `/api/nikki`
- **Description**: Retrieves a list of diary entries (Nikki) for the authenticated user, filtered by date range.

## Swagger Definition (Required)

```yaml
openapi: 3.0.0
info:
  title: Nikki API
  version: 1.0.0
paths:
  /api/nikki:
    get:
      summary: Get user's diary entries
      description: Retrieves a paginated list of diary entries for the authenticated user, starting from a specified date
      parameters:
        - name: from_date
          in: query
          required: true
          schema:
            type: string
            format: date-time
          description: UTC date string to fetch entries from (inclusive)
        - name: created_by
          in: query
          required: true
          schema:
            type: string
          description: User ID of the diary owner
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/definitions/NikkiWithTags'
        '400':
          description: Bad request - invalid parameters
        '401':
          description: Unauthorized - user not authenticated
        '500':
          description: Internal server error

components:
  definitions:
    NikkiWithTags:
      type: object
      properties:
        id:
          type: integer
          description: Nikki ID
        created_at:
          type: integer
          description: Unix timestamp in seconds
        created_by:
          type: string
          description: User ID who created this entry
        title:
          type: string
          description: Diary title
        goodness:
          type: integer
          description: Happiness/goodness rating (1-10)
        summary:
          type: string
          description: Brief summary of the diary
        content:
          type: string
          description: Full diary content
        tags:
          type: array
          items:
            $ref: '#/components/definitions/Tag'
    Tag:
      type: object
      properties:
        id:
          type: integer
        name:
          type: string
        created_by:
          type: string
```

## Request

### Headers

- `Cookie`: Session cookie for authentication (set by `/api/login`)

### Query Parameters

| Name         | Type   | Required | Description                                           |
| :----------- | :----- | :------- | :---------------------------------------------------- |
| `from_date`  | string | Yes      | UTC date string to fetch entries from (e.g., "Mon, 20 Nov 2023 00:00:00 GMT") |
| `created_by` | string | Yes      | User ID of the diary owner                            |

### Example Request

```
GET /api/nikki?from_date=Mon%2C%2020%20Nov%202023%2000%3A00%3A00%20GMT&created_by=test_user
```

## Response

### Success (200 OK)

Returns an array of diary entries with their associated tags.

```json
[
  {
    "id": 1,
    "created_at": 1700524800,
    "created_by": "test_user",
    "title": "今日の出来事",
    "goodness": 8,
    "summary": "良い一日でした",
    "content": "今日は天気が良くて、公園で散歩しました。とても気持ちよかったです。",
    "tags": [
      {
        "id": 1,
        "name": "日常",
        "created_by": "test_user"
      },
      {
        "id": 2,
        "name": "散歩",
        "created_by": "test_user"
      }
    ]
  },
  {
    "id": 2,
    "created_at": 1700438400,
    "created_by": "test_user",
    "title": "仕事の振り返り",
    "goodness": 6,
    "summary": "忙しい一日",
    "content": "プロジェクトの締め切りが近づいてきて、少し焦っています。",
    "tags": [
      {
        "id": 3,
        "name": "仕事",
        "created_by": "test_user"
      }
    ]
  }
]
```

### Error Responses

- **400 Bad Request**: Invalid `from_date` format or missing required parameters.
- **401 Unauthorized**: User not authenticated (no valid session cookie).
- **500 Internal Server Error**: Database error or unexpected server error.

## Implementation Details (Clean Architecture)

### Controller (`apps/web/routes/api/nikki.ts`)

- **Handler Function**: `handler` (GET)
- **Responsibility**: 
  1. Validate authentication (check session cookie)
  2. Parse and validate query parameters (`from_date`, `created_by`)
  3. Call `GetNikkiListUseCase.execute(fromDate, createdBy)`
  4. Return 200 with nikki list or appropriate error status

### Use Case (`packages/usecase/usecases/GetNikkiListUseCase.ts`)

- **Name**: `GetNikkiListUseCase`
- **Input**: `GetNikkiListInput` (DTO)
  - `fromDate: Date`
  - `createdBy: string`
- **Output**: `NikkiWithTags[]`
- **Logic**:
  1. Call `nikkiRepository.findByUserAndDateRange(createdBy, fromDate)`
  2. For each nikki, call `tagRepository.findByNikkiId(nikkiId)` to get associated tags
  3. Combine nikki and tags into `NikkiWithTags` objects
  4. Return array sorted by `created_at` descending

### Repository Interface (`packages/usecase/interfaces/INikkiRepository.ts`)

- **Interface Name**: `INikkiRepository`
- **Methods**:
  - `findByUserAndDateRange(userId: string, fromDate: Date): Promise<Nikki[]>`
    - Fetches nikki entries created by user before fromDate
    - Returns up to a reasonable limit (e.g., 20 entries)

### Repository Interface (`packages/usecase/interfaces/ITagRepository.ts`)

- **Interface Name**: `ITagRepository`
- **Methods**:
  - `findByNikkiId(nikkiId: number): Promise<Tag[]>`
    - Fetches all tags associated with a nikki entry

### Infrastructure (`packages/infrastructure/repositories/NikkiRepositoryImpl.ts`)

- **Implementation**: `NikkiRepositoryImpl`
- **Tables Used**:
  - `nikki` (Select)
- **SQL**:
  ```sql
  -- Fetch nikki entries by user and date range
  SELECT id, created_by, title, goodness, summary, content, created_at
  FROM nikki
  WHERE created_by = ? 
    AND created_at <= ?
  ORDER BY created_at DESC
  LIMIT 20
  ```

### Infrastructure (`packages/infrastructure/repositories/TagRepositoryImpl.ts`)

- **Implementation**: `TagRepositoryImpl`
- **Tables Used**:
  - `tag` (Select)
  - `nikkitag` (Select - join table)
- **SQL**:
  ```sql
  -- Fetch tags for a specific nikki
  SELECT t.id, t.name, t.created_by
  FROM tag t
  INNER JOIN nikkitag nt ON t.id = nt.tag_id
  WHERE nt.nikki_id = ?
  ```

## Testing Strategy

### Unit Tests (`packages/usecase/tests/GetNikkiListUseCase.test.ts`)

- **Test Case 1**: Should return array of NikkiWithTags when valid parameters are provided
- **Test Case 2**: Should return empty array when user has no nikki entries
- **Test Case 3**: Should only return entries created before fromDate
- **Test Case 4**: Should include all associated tags for each nikki

### Integration Tests (`apps/web/routes/api/__tests__/nikki.test.ts`)

- **Test Case 1**: Should return 200 with nikki list when authenticated user requests their entries
- **Test Case 2**: Should return 401 when user is not authenticated
- **Test Case 3**: Should return 400 when from_date parameter is invalid
- **Test Case 4**: Should return entries in descending order by created_at
- **Test Case 5**: Should limit results to reasonable page size (e.g., 20 entries)

## Notes

- The API uses date-based pagination (not offset/limit) for infinite scroll
- `created_at` is stored as Unix timestamp in seconds in the database
- The `from_date` query parameter should be in UTC format
- Tags are fetched separately and joined in the use case layer
- Consider adding caching for frequently accessed diary lists in future iterations
