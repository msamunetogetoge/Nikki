# Architecture Overview

## Current Architecture

### Frontend

- **Framework**: Nuxt.js (Vue.js 2)
- **UI Library**: Vuetify (Material Design)
- **State Management**: Vuex (implied by `$accessor`)
- **Routing**: Nuxt file-system routing
- **Deployment**: Google Cloud Run (implied by README)

### Backend

- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy
- **Migration**: Alembic
- **Authentication**: Custom implementation (User ID/Password)

## Target Architecture

### Frontend & Backend (Full Stack)

- **Runtime**: Deno
- **Framework**: Fresh (Server-side rendering, Island architecture)
- **UI Library**: React + MUI (Material UI)
- **Deployment**: Deno Deploy (Recommended) or Docker container

## Migration Strategy

- **Frontend**: Rewrite Vue components to React components using MUI. Move from Client-side routing (Nuxt) to Server-side routing (Fresh).
- **Backend**: Rewrite FastAPI endpoints to Fresh routes/handlers or a separate Deno backend (e.g., Oak/Hono) if preferred, but Fresh can handle API routes as well.
- **Database**: Reuse existing PostgreSQL database. Need to find a Deno ORM (e.g., Drizzle, Kysely, or raw Postgres.js).
