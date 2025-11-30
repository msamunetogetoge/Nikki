# Fix Request: Auth Flash Issue

## Problem
After logout, when navigating to `/home`, there is a brief flash where the previous user's data is visible before being redirected to the login page.

## Root Cause
The `HomePage` component renders immediately while `AuthProvider` is still checking the session asynchronously. This causes:
1. Page renders with stale state
2. Auth check completes
3. Redirect happens (but user already saw previous data)

## Required Fix
Add a loading guard in `app/home/page.tsx` to prevent rendering until auth check is complete.

### Implementation
In `apps/nikki_next/app/home/page.tsx`:

1. Check `authLoading` state from `useAuth()`
2. If `authLoading` is `true`, show a loading spinner instead of the page content
3. Only render the full page when `authLoading` is `false` AND `user` is not null

### Example Pattern
```typescript
export default function HomePage() {
  const { user, loading: authLoading, logout } = useAuth()
  
  // Guard: Don't render page until auth check completes
  if (authLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }
  
  // Rest of the component...
}
```

## Testing
After fix:
1. Login as `demo_user`
2. Navigate to `/home`
3. Logout
4. Manually navigate to `/home` in the address bar
5. **Expected**: Should see loading spinner, then redirect to `/` without flashing previous user data

## Notes
- This is a client-side rendering issue, not a backend problem
- The fix should be minimal (just add loading guard at the top of HomePage component)
- No changes to AuthProvider needed
