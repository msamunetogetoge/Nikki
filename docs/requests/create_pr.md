# Request: Create PR for Login/Auth Implementation

## Objective
Create a Pull Request for the Login Page and Authentication API implementation.

## Instructions
1.  **Verify Current Branch**: Ensure you are on the correct feature branch (e.g., `feature/login-auth` or similar).
2.  **Stage All Changes**: Add all modified, created, and deleted files related to the Login/Auth implementation.
    ```bash
    git add .
    ```
3.  **Commit Changes**: Create a comprehensive commit message describing the implementation.
    ```bash
    git commit -m "feat(auth): implement login page and authentication API

    - Add Login page with Material-UI components and form validation
    - Implement POST /api/login endpoint with AES-CBC encryption
    - Create Prisma schema for User model and SQLite database setup
    - Add database seeding script with test user
    - Implement CryptoService for password encryption/decryption
    - Add LoginUseCase following clean architecture
    - Generate API types from Swagger definition
    - Include comprehensive backend tests (TDD)
    - Configure Deno runtime with all required permissions
    "
    ```
4.  **Push Branch**: Push the feature branch to origin.
    ```bash
    git push origin HEAD
    ```
5.  **Create PR**: Create a Pull Request using the GitHub CLI.
    ```bash
    gh pr create --title "feat(auth): Implement Login Page and Authentication API" --body "## Summary
    Implements the Login Page frontend and Authentication API backend as defined in:
    - docs/design/login_page.md
    - docs/design/auth_api.md
    - docs/implementation/login_auth_plan.md

    ## Changes
    ### Backend (apps/api)
    - POST /api/login endpoint
    - AES-CBC password encryption
    - Prisma User repository
    - Clean architecture (Controller → UseCase → Repository)
    - TDD tests for all core logic

    ### Frontend (apps/nikki_next)
    - Login page at / with MUI components
    - Form validation
    - API client integration
    - Alert display for login success/failure

    ### Database (packages/db)
    - Prisma schema for User model (SQLite)
    - Database seeding script

    ### Shared (packages/core)
    - CryptoService
    - LoginUseCase
    - API types generated from Swagger

    ## Testing
    - All backend tests pass
    - Development servers start successfully
    - Frontend builds without errors

    Closes #[issue_number if any]"
    ```

## Output
Provide the PR number and URL after creation.
