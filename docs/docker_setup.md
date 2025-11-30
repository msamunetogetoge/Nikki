# Docker Environment Setup

This guide explains how to set up and use the Docker environment for the Nikki project.

## Prerequisites

- Docker Desktop installed and running.
- PowerShell (for running scripts).

## Starting the Environment

To start the Docker environment, use the provided PowerShell script. This script automatically handles port conflicts by finding available ports if the defaults are occupied.

```powershell
.\scripts\start_docker.ps1
```

This script will:
1. Check if the default ports (3939 for Web, 8787 for API) are available.
2. If not, it will find the next available ports.
3. Set the `NIKKI_WEB_PORT` and `NIKKI_API_PORT` environment variables.
4. Run `docker compose up`.

## Accessing the Application

After the script starts the containers, you can access the application at:

- **Web App**: `http://localhost:<NIKKI_WEB_PORT>` (Default: `http://localhost:3939`)
- **API**: `http://localhost:<NIKKI_API_PORT>` (Default: `http://localhost:8787`)

The script output will display the actual ports being used.

## Entering the Container

To run commands inside the container (e.g., for database migrations or running tests), use:

```bash
docker compose exec dev bash
```

## Installing Dependencies

Dependencies are installed automatically when the container builds. If you add new dependencies, you may need to rebuild the container:

```bash
docker compose build
```

Or, inside the container:

```bash
npm install
# or for specific packages
npm install <package_name>
```

## Running the Application

The application is configured to start automatically with `npm run dev` when the container starts. This runs both the Next.js frontend and the Hono API backend.

- **Frontend**: Runs on port 3000 inside the container.
- **Backend**: Runs on port 8000 inside the container.

## Troubleshooting

### Port Conflicts
If you see errors about ports being already in use, the `start_docker.ps1` script should handle this automatically. If you are running `docker compose up` manually, you may need to set the environment variables yourself:

```powershell
$env:NIKKI_WEB_PORT=3940
$env:NIKKI_API_PORT=8788
docker compose up
```

### Hot Reload Not Working
Ensure that you are running the container with volume mounts enabled (which is the default in `docker-compose.yml`). If files are not updating, try restarting the container.
