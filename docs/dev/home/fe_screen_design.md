# Frontend Screen Design: Home Screen

## Overview

- **Path**: `/home`
- **Description**: Main screen after login. Displays a list of user's diary entries (Nikki) with infinite scroll functionality.

## UI Components (MUI)

- `Container` (Layout wrapper)
- `Box` (Layout sections)
- `Card` (Diary entry card)
- `CardContent` (Card content area)
- `CardActions` (Card action buttons)
- `Typography` (Text display)
- `IconButton` (Delete button)
- `Button` (Detail button)
- `Dialog` (Diary detail modal)
- `CircularProgress` (Loading indicator)
- `List` / `ListItem` (Diary list container)

## State Management

### Local State
- `nikkiList` (Signal<NikkiFromApi[]>) - List of diary entries
- `isLoading` (Signal<boolean>) - Loading state for infinite scroll
- `isLastNikki` (Signal<boolean>) - Flag indicating if all entries are loaded
- `selectedNikki` (Signal<NikkiFromApi | null>) - Currently selected diary for detail view
- `showDetailDialog` (Signal<boolean>) - Dialog visibility state
- `showDeleteDialog` (Signal<boolean>) - Delete confirmation dialog state
- `deleteTarget` (Signal<{id: number, title: string} | null>) - Diary to be deleted

### Global State
- `user` (from auth context) - Current logged-in user information

## API Interactions

- `GET /api/nikki?from_date={date}&created_by={userId}` (on mount and infinite scroll)
- `DELETE /api/nikki/{id}` (on delete confirmation)

## Layout / Mockup

### Structure
```
┌─────────────────────────────────────┐
│ Header: "Nikki"                     │
├─────────────────────────────────────┤
│ Main Content:                       │
│  ┌───────────────────────────────┐  │
│  │ Diary Card 1                  │  │
│  │ - Icon + Title                │  │
│  │ - Summary                     │  │
│  │ - Date | Delete | ♥ | Detail │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ Diary Card 2                  │  │
│  │ ...                           │  │
│  └───────────────────────────────┘  │
│  ...                                │
│  [Loading Indicator / End Message]  │
└─────────────────────────────────────┘
```

### Diary Card Details
- **Icon**: Fountain pen icon (mdi-fountain-pen-tip equivalent)
- **Title**: Diary title (text-h6)
- **Summary**: Diary summary (text-h5, bold)
- **Date**: Created date in Japanese format
- **Goodness**: Heart icon + number
- **Actions**:
  - Delete button (icon button)
  - Detail button (text button)

### Infinite Scroll
- Uses Intersection Observer API
- Triggers when user scrolls to bottom
- Loads more entries by fetching from `created_at - 1 day` of last entry
- Shows loading spinner while fetching
- Shows "最後のNikkiです" message when all entries are loaded

## Migration Notes

### Original Files
- `nikki_nuxt/pages/home.vue`
- `nikki_nuxt/components/NikkiList.vue`
- `nikki_nuxt/middleware/get-nikki-list.ts`
- `nikki_nuxt/script/nikki.ts`

### Key Logic to Port

1. **Initial Load**:
   - Fetch diary list on component mount using current date
   - Store in local state

2. **Infinite Scroll**:
   - Detect scroll to bottom using Intersection Observer
   - Get last entry's `created_at`
   - Subtract 1 day and fetch more entries
   - Append to existing list
   - Set `isLastNikki` flag if no more entries

3. **Diary Detail**:
   - Click "詳細" button to open dialog
   - Display full diary information including tags
   - Support edit functionality (future enhancement)

4. **Delete Functionality**:
   - Click delete icon to show confirmation dialog
   - On confirm, call DELETE API
   - Remove from local list on success
   - Show alert message

5. **Date Formatting**:
   - Convert Unix timestamp (seconds) to JavaScript Date
   - Format using `toLocaleDateString('ja-japanese')`

### Data Types

```typescript
interface NikkiFromApi {
  id: number;
  created_at: number; // Unix timestamp in seconds
  created_by: string;
  title: string;
  goodness: number;
  summary: string;
  content: string;
  tags: TagFromApi[];
}

interface TagFromApi {
  id: number;
  name: string;
  created_by: string;
}
```

## Authentication

- Page requires authentication
- Redirect to `/login` if not authenticated
- Use cookie-based session validation
