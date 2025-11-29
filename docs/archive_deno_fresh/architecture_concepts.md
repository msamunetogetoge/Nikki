# Architecture Concepts

## 1. Islands Architecture (Frontend)

**Islands Architecture** is a web architecture pattern used by **Fresh**.

### Concept

Instead of sending a large JavaScript bundle to the client to control the entire page (like standard React/Vue SPAs), Fresh renders the page as **static HTML** on the server.

- **The Ocean (Static HTML)**: Most of the page is static. It requires **0KB of JavaScript** to display. It loads instantly and is great for SEO.
- **The Islands (Interactive UI)**: Only specific interactive components (like a "Login Button", "Carousel", or "Like Counter") are "hydrated" with JavaScript. These are the **Islands**.

### In Practice

- **`components/`**: Standard UI components. Rendered on the server. No state (`useState`), no effects (`useEffect`). Just pure HTML/CSS.
- **`islands/`**: Interactive components. Hydrated on the client. Can use `useState`, `useEffect`, event handlers (`onClick`).

**Benefit**: Drastically reduces the amount of JavaScript sent to the browser, resulting in faster load times and better performance.

---

## 2. Clean Architecture (Backend)

We can implement **Clean Architecture** within the Deno Monorepo structure by mapping layers to packages.

### Layers & Packages

| Clean Architecture Layer                     | Package                   | Description                                                                                          | Dependencies                                     |
| :------------------------------------------- | :------------------------ | :--------------------------------------------------------------------------------------------------- | :----------------------------------------------- |
| **Enterprise Business Rules** (Entities)     | `packages/domain`         | Core business objects (User, Nikki) and logic.                                                       | **None**                                         |
| **Application Business Rules** (Use Cases)   | `packages/usecase`        | Application specific logic (e.g., "Register User", "Post Nikki"). Defines **Repository Interfaces**. | Depends on `domain`                              |
| **Interface Adapters** (Gateways/Presenters) | `packages/infrastructure` | Implementation of Repository Interfaces (SQLite, External APIs).                                     | Depends on `domain`, `usecase`                   |
| **Frameworks & Drivers** (Web)               | `apps/web`                | The Fresh App. Controllers (Routes) call Use Cases.                                                  | Depends on `domain`, `usecase`, `infrastructure` |

### Dependency Rule

Dependencies only point **inwards** (or towards the stable domain).

- `domain` knows nothing about `usecase` or `infrastructure`.
- `usecase` knows about `domain`, but nothing about `infrastructure` (only interfaces).
- `infrastructure` knows about `domain` and implements interfaces from `usecase`.
- `apps/web` wires everything together (Dependency Injection).

### Example Flow (Create Nikki)

1.  **Web (`apps/web`)**: User hits `POST /api/nikki`. Route handler receives request.
2.  **Web**: Calls `CreateNikkiUseCase` (in `packages/usecase`), injecting the `NikkiRepositoryImpl` (from `packages/infrastructure`).
3.  **UseCase (`packages/usecase`)**: `CreateNikkiUseCase` creates a `Nikki` entity (from `packages/domain`).
4.  **UseCase**: Calls `nikkiRepository.save(nikki)`.
5.  **Infrastructure (`packages/infrastructure`)**: `NikkiRepositoryImpl` converts the entity to a SQL query and saves it to SQLite.
