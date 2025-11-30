# Frontend Screen Design: Login Page

## Overview

- **Path**: `/`
- **Description**: The entry point of the application. Allows existing users to log in and new users to navigate to the registration page.

## UI Components (MUI)

- `Container` (Layout centering)
- `Box` (Flexbox layout)
- `Typography` (Headings)
- `TextField` (User ID, Password input)
- `Button` (Login, Sign Up, Trial)
- `Alert` (Error display)
- `CircularProgress` (Loading state)

## State Management

- **Local State**:
  - `userId` (string): Input value for User ID.
  - `password` (string): Input value for Password.
  - `isLoading` (boolean): To disable buttons and show spinner.
  - `error` (string | null): To display login errors.

## API Interactions

- `POST /api/login` (on submit)
  - **Body**: `{ "user_id": "...", "password": "..." }`
  - **Response**: `{ "token": "..." }` (or cookie set by server)

## Layout / Mockup

- **Center Aligned Card**:
  - **Header**: App Logo / Title "Nikki"
  - **Form**:
    - User ID Input
    - Password Input
    - Login Button (Primary)
  - **Footer**:
    - "Don't have an account? Sign Up" link/button
    - "Try Demo" button (Secondary)

## Migration Notes

- **Original File**: `nikki_nuxt/pages/index.vue`
- **Key Logic to Port**:
  - Form validation (required fields).
  - Error handling (invalid credentials).
  - **Temporary Behavior**: On login success or failure, display a browser `alert()` or MUI `Alert` component with the message "Login Success" or "Login Failed". Do not redirect immediately until the home page is ready.
