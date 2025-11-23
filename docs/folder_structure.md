# Folder Structure (Deno Monorepo)

This document outlines the proposed folder structure for the Nikki application using Deno Workspaces.

# Folder Structure (Deno Monorepo)

This document outlines the proposed folder structure for the Nikki application using Deno Workspaces.

## Overview

The project will be structured as a monorepo using Deno's workspace feature.

## Where is the Backend?

In this Clean Architecture structure, the "Backend" is distributed:

1.  **API Endpoints (Controllers)**: `apps/web/routes/api/`. They receive requests and call **Use Cases**.
2.  **Business Logic**: `packages/usecase/`. This is where the actual "work" happens.
3.  **Database Logic**: `packages/infrastructure/`. This is where data is actually saved/loaded.
4.  **Entities**: `packages/domain/`. The core data structures.

```

```
