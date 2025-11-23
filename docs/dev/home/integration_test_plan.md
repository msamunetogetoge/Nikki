# Integration Test Plan: Home Page Flow

## Overview

This test plan covers the end-to-end integration testing of the home page feature, including authentication, diary list display, and infinite scroll functionality.

## Prerequisites

Before running integration tests, ensure:
- [ ] Issue #105 is completed and merged (HttpOnly auth cookies)
- [ ] Issue #104 is completed and merged (GET /api/nikki API)
- [ ] Home frontend is completed and merged
- [ ] Database is seeded with test data
- [ ] Development server is running

## Test Environment Setup

### 1. Database Preparation

Create test database with sample data:

```sql
-- Test user
INSERT INTO users (user_id, user_name, password) 
VALUES ('test_user', 'テストユーザー', 'password123');

-- Sample nikki entries (at least 25 for infinite scroll testing)
INSERT INTO nikki (created_by, title, goodness, summary, content, created_at) VALUES
  (1, '今日の出来事', 8, '良い一日でした', '詳細な内容...', strftime('%s', 'now')),
  (1, '昨日の振り返り', 7, '普通の一日', '詳細な内容...', strftime('%s', 'now', '-1 day')),
  -- ... (add more entries)
  (1, '25日前の日記', 6, '古い日記', '詳細な内容...', strftime('%s', 'now', '-25 days'));

-- Sample tags
INSERT INTO tag (created_by, name) VALUES
  (1, '日常'),
  (1, '仕事'),
  (1, '趣味');

-- Tag associations
INSERT INTO nikkitag (nikki_id, tag_id) VALUES
  (1, 1),
  (2, 2);
```

### 2. Server Startup

```bash
cd apps/web
deno task start
```

Verify server is running at `http://localhost:8000`

---

## Test Cases

### TC-1: Authentication Flow

**Objective**: Verify complete login to home page flow with cookie authentication

**Steps**:
1. Open browser to `http://localhost:8000/`
2. Verify login page is displayed
3. Enter credentials: `test_user` / `password123`
4. Click "ログイン" button
5. Open DevTools → Application → Cookies
6. Verify `nikki_session` cookie is set with:
   - HttpOnly flag: ✓
   - SameSite: Lax
   - Path: /
7. Verify redirect to `/home`
8. Verify home page displays "ようこそ、テストユーザーさん"

**Expected Result**: ✅ User successfully logs in and is redirected to home page with valid session cookie

---

### TC-2: Unauthenticated Access Protection

**Objective**: Verify `/home` redirects to login when no valid session

**Steps**:
1. Open incognito/private window
2. Navigate directly to `http://localhost:8000/home`
3. Verify redirect to `/`
4. Verify login page is displayed

**Expected Result**: ✅ Unauthenticated users cannot access `/home` and are redirected to login

---

### TC-3: Nikki List Display

**Objective**: Verify diary entries are displayed correctly

**Prerequisites**: User is logged in

**Steps**:
1. On `/home` page, verify nikki list is displayed
2. Verify each nikki card shows:
   - Icon (fountain pen or similar)
   - Title
   - Summary
   - Created date in Japanese format (e.g., "2023年11月24日")
   - Heart icon + goodness number
3. Verify entries are sorted by date (newest first)
4. Verify first page shows up to 20 entries

**Expected Result**: ✅ Nikki list displays correctly with all required information

---

### TC-4: Infinite Scroll - Load More

**Objective**: Verify infinite scroll loads additional entries

**Prerequisites**: 
- User is logged in
- Database has 25+ nikki entries

**Steps**:
1. On `/home` page, note the number of displayed entries
2. Scroll to bottom of the page
3. Verify loading indicator appears
4. Wait for new entries to load
5. Verify more entries are appended to the list
6. Verify no duplicate entries
7. Verify total count increased

**Expected Result**: ✅ Infinite scroll successfully loads and appends more entries

---

### TC-5: Infinite Scroll - End of List

**Objective**: Verify proper handling when all entries are loaded

**Prerequisites**: User is logged in

**Steps**:
1. On `/home` page, scroll to bottom repeatedly
2. Continue scrolling until no more entries load
3. Verify "最後のNikkiです" message is displayed
4. Verify no loading indicator appears
5. Verify no duplicate entries in the list

**Expected Result**: ✅ End of list is properly indicated with message

---

### TC-6: Empty State

**Objective**: Verify proper display when user has no nikki entries

**Prerequisites**: Create test user with no nikki entries

**Steps**:
1. Login as user with no nikki entries
2. Navigate to `/home`
3. Verify appropriate empty state message is displayed

**Expected Result**: ✅ Empty state is handled gracefully

---

### TC-7: Session Persistence

**Objective**: Verify session cookie persists across page refreshes

**Prerequisites**: User is logged in

**Steps**:
1. On `/home` page, note current state
2. Refresh the page (F5)
3. Verify still on `/home` page
4. Verify nikki list is displayed
5. Verify no redirect to login

**Expected Result**: ✅ Session persists and user remains authenticated

---

### TC-8: Invalid Session Handling

**Objective**: Verify handling of invalid/expired session

**Prerequisites**: User is logged in

**Steps**:
1. On `/home` page
2. Open DevTools → Application → Cookies
3. Delete `nikki_session` cookie
4. Refresh the page
5. Verify redirect to `/` (login page)

**Expected Result**: ✅ Invalid session causes redirect to login

---

### TC-9: API Error Handling

**Objective**: Verify graceful handling of API errors

**Prerequisites**: 
- User is logged in
- Temporarily stop backend server or modify API to return error

**Steps**:
1. On `/home` page
2. Trigger API call (scroll for infinite scroll)
3. Verify error message is displayed
4. Verify app doesn't crash
5. Restart server
6. Retry operation
7. Verify normal functionality resumes

**Expected Result**: ✅ API errors are handled gracefully with user-friendly messages

---

### TC-10: Performance - Large Dataset

**Objective**: Verify performance with large number of entries

**Prerequisites**: Database has 100+ nikki entries

**Steps**:
1. Login and navigate to `/home`
2. Measure initial page load time
3. Scroll through multiple pages (infinite scroll)
4. Verify smooth scrolling (no lag)
5. Verify memory usage is reasonable

**Expected Result**: ✅ App performs well with large datasets

---

## Automated Test Execution

### Browser Automation Script

Use browser tool to automate key flows:

```typescript
// Test script outline
async function runIntegrationTests() {
  // TC-1: Login flow
  await testLoginFlow();
  
  // TC-2: Unauthenticated access
  await testUnauthenticatedAccess();
  
  // TC-3: Nikki list display
  await testNikkiListDisplay();
  
  // TC-4: Infinite scroll
  await testInfiniteScroll();
  
  // TC-5: End of list
  await testEndOfList();
  
  // TC-7: Session persistence
  await testSessionPersistence();
  
  // TC-8: Invalid session
  await testInvalidSession();
}
```

---

## Test Execution Checklist

- [ ] Set up test database with sample data
- [ ] Start development server
- [ ] Run TC-1: Authentication Flow
- [ ] Run TC-2: Unauthenticated Access Protection
- [ ] Run TC-3: Nikki List Display
- [ ] Run TC-4: Infinite Scroll - Load More
- [ ] Run TC-5: Infinite Scroll - End of List
- [ ] Run TC-6: Empty State
- [ ] Run TC-7: Session Persistence
- [ ] Run TC-8: Invalid Session Handling
- [ ] Run TC-9: API Error Handling
- [ ] Run TC-10: Performance - Large Dataset
- [ ] Document any issues found
- [ ] Create walkthrough with screenshots

---

## Success Criteria

All test cases must pass with:
- ✅ No critical bugs
- ✅ No security vulnerabilities
- ✅ Acceptable performance
- ✅ Good user experience

---

## Test Report Template

After execution, create report with:
- Test execution date
- Environment details
- Test results (pass/fail for each TC)
- Screenshots/recordings
- Issues found
- Recommendations
