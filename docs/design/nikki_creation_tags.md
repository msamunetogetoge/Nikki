# Nikki Creation, List, Detail, and Tag Management Design

## Overview
This document outlines the design for implementing "Create Nikki" (diary entry), Tag management, **Nikki List (Cards)**, and **Nikki Detail** in the new Nikki application.

## Nikki Creation

### Requirements
- Users can create a new Nikki entry.
- A Nikki entry consists of:
    - Content (text)
    - Tags (optional list of strings)
    - Date (defaults to now)
- Tags should be associated with the Nikki.
- If a tag doesn't exist for the user, it should be created.

### Architecture
- **Frontend**: `/home` page will have a "New Entry" section.
- **API**: `POST /nikkis` endpoint.
- **UseCase**: `CreateNikkiUseCase`

### Data Model Changes (Prisma)
To support user-specific tags (private tags), we will modify the `Tag` model.

```prisma
model Tag {
  id     Int    @id @default(autoincrement())
  name   String
  userId String // Add this
  user   User   @relation(fields: [userId], references: [id])

  nikkis Nikki[]

  @@unique([userId, name]) // Unique per user
}
```

## Nikki List (Cards)

### Requirements
- Display a list of Nikki entries for the logged-in user.
- Each entry (Card) should show:
    - Date
    - Content (truncated)
    - Tags (as chips)
- Clicking a card navigates to the Detail view.

### Architecture
- **Frontend**: `/home` page.
- **API**: `GET /nikkis`.

## Nikki Detail

### Requirements
- Display the full content of a specific Nikki entry.
- Show Date and Tags.
- (Future) Allow editing/deleting.

### Architecture
- **Frontend**: `/nikki/[id]` page.
- **API**: `GET /nikkis/:id`.
- **UseCase**: `GetNikkiUseCase` (Get single Nikki by ID and User ID).

## Tag Management

### Requirements
- Tags are private to the user.
- When creating a Nikki, users can select from existing tags or type a new one.

### Architecture
- **API**: `GET /tags`.
- **UseCase**: `GetTagsUseCase`.

## API Endpoints

### Nikki
- `POST /nikkis`
    - Body: `{ content: string, tags: string[] }`
    - Response: `{ success: true, nikki: Nikki }`
- `GET /nikkis`
    - Response: `{ items: Nikki[] }`
- `GET /nikkis/:id`
    - Response: `{ nikki: Nikki }`

### Tags
- `GET /tags`
    - Response: `{ tags: string[] }`

## Implementation Steps

1.  **Schema**: Update `packages/db/prisma/schema.prisma`.
2.  **Core**:
    - Create `CreateNikkiUseCase`.
    - Create `GetNikkiUseCase`.
    - Update `NikkiRepository` interface (`create`, `findById`).
    - Create `TagRepository` interface.
    - Create `GetTagsUseCase`.
3.  **DB**:
    - Update `NikkiRepository` implementation.
    - Create `TagRepository` implementation.
4.  **API**:
    - Create/Update `routes/nikki.ts` (add `GET /:id`).
    - Create `routes/tags.ts`.
5.  **Frontend**:
    - Create `components/NikkiCard.tsx`.
    - Update `/home` to list cards.
    - Create `/nikki/[id]/page.tsx` for detail view.
    - Add "Create" UI.
