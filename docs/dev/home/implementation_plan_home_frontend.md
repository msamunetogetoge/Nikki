# Implementation Plan: Home Frontend

## Goal

Implement the `/home` page frontend that displays a list of user's diary entries (Nikki) with infinite scroll functionality. This page requires authentication and will redirect to login if the user is not authenticated.

## Dependencies

> [!IMPORTANT]
> **Prerequisites**: This implementation depends on:
> - Issue #105: HttpOnly auth cookie must be implemented
> - Issue #104: `GET /api/nikki` backend API must be available

## Proposed Changes

### Frontend Routes

#### [NEW] [home.tsx](file:///c:/Users/kenji/code/typescript/Nikki/apps/web/routes/home.tsx)

Fresh route handler for `/home` page:

**Server-side logic**:
- Read `nikki_session` cookie from request headers
- Validate session using `validateSession()` utility
- If valid: render home page with user data
- If invalid/missing: redirect to `/` (login page)

**Page structure**:
```tsx
export const handler: Handlers = {
  async GET(req, ctx) {
    // 1. Get cookie from request
    const cookies = getCookies(req.headers);
    const sessionToken = cookies.nikki_session;
    
    // 2. Validate session
    if (!sessionToken) {
      return new Response("", {
        status: 302,
        headers: { Location: "/" },
      });
    }
    
    const session = await validateSession(sessionToken);
    if (!session) {
      return new Response("", {
        status: 302,
        headers: { Location: "/" },
      });
    }
    
    // 3. Render page with user data
    return ctx.render({ user: session });
  },
};

export default function Home({ data }: PageProps) {
  return (
    <div>
      <h1>ホーム</h1>
      <p>ようこそ、{data.user.user_name}さん</p>
      <NikkiList userId={data.user.user_id} />
    </div>
  );
}
```

---

### Islands (Interactive Components)

#### [NEW] [NikkiList.tsx](file:///c:/Users/kenji/code/typescript/Nikki/apps/web/islands/NikkiList.tsx)

Interactive component for diary list with infinite scroll:

**Props**:
- `userId: string` - Current user's ID

**State**:
- `nikkiList: Signal<NikkiFromApi[]>` - List of diary entries
- `isLoading: Signal<boolean>` - Loading state for infinite scroll
- `isLastNikki: Signal<boolean>` - Flag if all entries loaded
- `error: Signal<string | null>` - Error message

**Functionality**:

1. **Initial Load** (on mount):
```typescript
useEffect(() => {
  fetchNikkiList(new Date());
}, []);

async function fetchNikkiList(fromDate: Date) {
  const dateUtc = fromDate.toUTCString();
  const response = await fetch(
    `/api/nikki?from_date=${encodeURIComponent(dateUtc)}&created_by=${userId}`
  );
  const data = await response.json();
  nikkiList.value = data;
}
```

2. **Infinite Scroll**:
- Use Intersection Observer API
- Trigger when scrolling to bottom
- Fetch more entries using last entry's `created_at - 1 day`
- Append to existing list
- Set `isLastNikki` if response is empty

3. **UI Components** (Material UI):
- `Container` - Page wrapper
- `Stack` - Vertical layout
- `Card` - Each diary entry
- `CardContent` - Entry content
- `Typography` - Text elements
- `CircularProgress` - Loading indicator
- `Box` - Layout helpers

**Card Layout**:
```tsx
<Card>
  <CardContent>
    <Stack direction="row" spacing={1} alignItems="center">
      <EditNoteIcon /> {/* Fountain pen icon */}
      <Typography variant="h6">{nikki.title}</Typography>
    </Stack>
    
    <Typography variant="h5" fontWeight="bold">
      {nikki.summary}
    </Typography>
    
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Typography variant="body2">
        {formatDate(nikki.created_at)}
      </Typography>
      
      <Stack direction="row" spacing={1} alignItems="center">
        <FavoriteIcon />
        <Typography>{nikki.goodness}</Typography>
      </Stack>
    </Stack>
  </CardContent>
</Card>
```

---

### Utilities

#### [NEW] [dateFormat.ts](file:///c:/Users/kenji/code/typescript/Nikki/apps/web/utils/dateFormat.ts)

Date formatting utility:
```typescript
export function formatDate(unixTimestamp: number): string {
  const date = new Date(unixTimestamp * 1000);
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
```

---

### Types

#### [NEW] [nikki.ts](file:///c:/Users/kenji/code/typescript/Nikki/apps/web/types/nikki.ts)

TypeScript types for Nikki:
```typescript
export interface NikkiFromApi {
  id: number;
  created_at: number; // Unix timestamp in seconds
  created_by: string;
  title: string;
  goodness: number;
  summary: string;
  content: string;
  tags: TagFromApi[];
}

export interface TagFromApi {
  id: number;
  name: string;
  created_by: string;
}
```

---

### Configuration

#### [MODIFY] [deno.json](file:///c:/Users/kenji/code/typescript/Nikki/apps/web/deno.json)

Add Material UI dependencies (if not already present):
```json
{
  "imports": {
    "@mui/material": "npm:@mui/material@^5.14.0",
    "@mui/icons-material": "npm:@mui/icons-material@^5.14.0",
    "@emotion/react": "npm:@emotion/react@^11.11.0",
    "@emotion/styled": "npm:@emotion/styled@^11.11.0"
  }
}
```

---

## Verification Plan

### Manual Testing

**Prerequisites**:
1. Issue #105 must be completed (auth cookies working)
2. Issue #104 must be completed (GET /api/nikki working)
3. Database has sample nikki data
4. Dev server running: `cd apps/web && deno task start`

**Test Cases**:

1. **Auth Check - No Cookie**:
   - Open incognito window
   - Navigate to `http://localhost:8000/home`
   - **Expected**: Redirect to `/` (login page)

2. **Auth Check - Valid Cookie**:
   - Login with valid credentials
   - **Expected**: Redirect to `/home`
   - **Expected**: See "ようこそ、[username]さん"

3. **Nikki List Display**:
   - After login, verify `/home` page
   - **Expected**: See list of diary entries
   - **Expected**: Each entry shows:
     - Icon + Title
     - Summary
     - Date (Japanese format)
     - Heart icon + goodness number

4. **Infinite Scroll**:
   - Scroll to bottom of list
   - **Expected**: Loading indicator appears
   - **Expected**: More entries load automatically
   - **Expected**: Entries append to list (no duplicates)

5. **End of List**:
   - Keep scrolling until no more entries
   - **Expected**: See "最後のNikkiです" message
   - **Expected**: No more loading

6. **Empty State**:
   - Login as user with no nikki entries
   - **Expected**: Show appropriate empty state message

### Browser Testing

Use browser tool to automate:
- Login flow
- Verify redirect to `/home`
- Capture screenshot of nikki list
- Test infinite scroll
- Verify auth redirect when no cookie

---

## Design Reference

See design documents:
- Frontend: `docs/dev/home/fe_screen_design.md`
- Backend API: `docs/dev/home/be_api_design.md`

## Migration Reference

Original Nuxt.js files:
- `nikki_nuxt/pages/home.vue`
- `nikki_nuxt/components/NikkiList.vue`
- `nikki_nuxt/middleware/get-nikki-list.ts`
- `nikki_nuxt/script/nikki.ts`
