# Screen Specification: Login Screen

## 1. Overview
*   **Screen Name**: Login Screen
*   **Path**: `/` (Root)
*   **Purpose**: Entry point for the application. Allows users to log in or navigate to sign up / trial.

## 2. UI Specifications

### 2.1 Layout
*   Centered Card layout on a background.
*   Title "Nikkiへようこそ" (Welcome to Nikki).
*   Input fields for User ID and Password.
*   Action buttons at the bottom.

### 2.2 Components
| Component Name | Type (MUI) | Properties/State | Description |
| :--- | :--- | :--- | :--- |
| `UserIdInput` | `TextField` | `required`, `label="ユーザーID"` | Input for user ID |
| `PasswordInput` | `TextField` | `type="password"`, `required`, `label="パスワード"` | Input for password. Includes eye icon to toggle visibility. |
| `LoginButton` | `Button` | `variant="contained"`, `color="primary"` | Triggers login action |
| `SignupButton` | `Button` | `variant="text"`, `color="secondary"` | Navigates to `/signup` |
| `TrialButton` | `Button` | `variant="outlined"` | Triggers trial login |

## 3. Behavior & Logic

### 3.1 Initial State
*   User ID and Password fields are empty.
*   Password is masked.

### 3.2 User Interactions
*   **Click Login Button**:
    1.  Validate inputs (User ID and Password must not be empty).
    2.  Call API `POST /api/login`.
    3.  If success: Store user info in global state/Signal and redirect to `/home`.
    4.  If failure: Show alert "login失敗" (Login failed).
*   **Click Signup Button**:
    1.  Navigate to `/signup`.
*   **Click Trial Button**:
    1.  Call API `POST /api/trial` (or similar logic).
    2.  Redirect to `/trial`.

## 4. Data & State Management

### 4.1 Local State
*   `userId`: Signal<string>
*   `password`: Signal<string>
*   `showPassword`: Signal<boolean>

### 4.2 Global State
*   `user`: Update with `UserStore` data upon successful login.

## 5. API Integration
| Method | Endpoint | Trigger | Request Data | Response Handling |
| :--- | :--- | :--- | :--- | :--- |
| POST | `/api/login` | Login Button Click | `{ user_id, password }` | Success: Redirect / Error: Alert |

## 6. Validation Rules
*   **User ID**: Required.
*   **Password**: Required.
