# Function to check if a port is available
function Test-PortAvailable {
    param (
        [int]$Port
    )
    $tcpConnection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    return $null -eq $tcpConnection
}

# Function to find the next available port (reused logic for verification context)
function Get-AvailablePort {
    param (
        [int]$StartPort
    )
    $port = $StartPort
    while (-not (Test-PortAvailable -Port $port)) {
        $port++
    }
    return $port
}

Write-Host "Verifying Docker Setup..." -ForegroundColor Cyan

# 1. Run start_docker.ps1 logic (simulated or actual)
# Ideally, we should run the start script, but for verification, we can just check if the containers are running and on which ports.
# However, the requirement says "Update to use the dynamic port logic (or call start_docker.ps1 logic) and verify on the assigned ports."

# Let's try to run the start script and capture the output to parse ports, or just trust the environment variables if set.
# For this verification script, let's assume we want to TEST the start script.

Write-Host "Running start_docker.ps1..." -ForegroundColor Cyan
# We need to run it in a way that we can capture the ports. 
# Since start_docker.ps1 sets process-level env vars, they won't persist here unless we dot-source it.
# But start_docker.ps1 runs `docker compose up`, which might block if not detached. I added -d to start_docker.ps1.

. "$PSScriptRoot\start_docker.ps1"

# Wait for containers to be ready (simple sleep for now, could be more robust)
Write-Host "Waiting for containers to initialize..." -ForegroundColor Cyan
Start-Sleep -Seconds 10

# Verify Web Port
$webResponse = Invoke-WebRequest -Uri "http://localhost:$env:NIKKI_WEB_PORT" -Method Head -ErrorAction SilentlyContinue
if ($webResponse.StatusCode -eq 200) {
    Write-Host "SUCCESS: Web App is reachable at http://localhost:$env:NIKKI_WEB_PORT" -ForegroundColor Green
}
else {
    Write-Host "FAILURE: Web App is NOT reachable at http://localhost:$env:NIKKI_WEB_PORT" -ForegroundColor Red
    # exit 1 # Don't exit yet, check API too
    # Function to check if a port is available
    function Test-PortAvailable {
        param (
            [int]$Port
        )
        $tcpConnection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        return $null -eq $tcpConnection
    }

    # Function to find the next available port (reused logic for verification context)
    function Get-AvailablePort {
        param (
            [int]$StartPort
        )
        $port = $StartPort
        while (-not (Test-PortAvailable -Port $port)) {
            $port++
        }
        return $port
    }

    Write-Host "Verifying Docker Setup..." -ForegroundColor Cyan

    # 1. Run start_docker.ps1 logic (simulated or actual)
    # Ideally, we should run the start script, but for verification, we can just check if the containers are running and on which ports.
    # However, the requirement says "Update to use the dynamic port logic (or call start_docker.ps1 logic) and verify on the assigned ports."

    # Let's try to run the start script and capture the output to parse ports, or just trust the environment variables if set.
    # For this verification script, let's assume we want to TEST the start script.

    Write-Host "Running start_docker.ps1..." -ForegroundColor Cyan
    # We need to run it in a way that we can capture the ports. 
    # Since start_docker.ps1 sets process-level env vars, they won't persist here unless we dot-source it.
    # But start_docker.ps1 runs `docker compose up`, which might block if not detached. I added -d to start_docker.ps1.

    . "$PSScriptRoot\start_docker.ps1"

    # Wait for containers to be ready (simple sleep for now, could be more robust)
    Write-Host "Waiting for containers to initialize..." -ForegroundColor Cyan
    Start-Sleep -Seconds 10

    # Verify Web Port
    $webResponse = Invoke-WebRequest -Uri "http://localhost:$env:NIKKI_WEB_PORT" -Method Head -ErrorAction SilentlyContinue
    if ($webResponse.StatusCode -eq 200) {
        Write-Host "SUCCESS: Web App is reachable at http://localhost:$env:NIKKI_WEB_PORT" -ForegroundColor Green
    }
    else {
        Write-Host "FAILURE: Web App is NOT reachable at http://localhost:$env:NIKKI_WEB_PORT" -ForegroundColor Red
        # exit 1 # Don't exit yet, check API too
    }

    # Verify API Port
    # API might return 404 for root, so let's check connectivity or a specific health endpoint if available.
    # Assuming root returns something or 404 is fine for connectivity check.
    try {
        Invoke-WebRequest -Uri "http://localhost:$env:NIKKI_API_PORT" -Method Head -ErrorAction Stop | Out-Null
        Write-Host "SUCCESS: API is reachable at http://localhost:$env:NIKKI_API_PORT" -ForegroundColor Green
    }
    catch {
        if ($_.Exception.Response.StatusCode -eq 404) {
            Write-Host "SUCCESS: API is reachable (404) at http://localhost:$env:NIKKI_API_PORT" -ForegroundColor Green
        }
        else {
            Write-Host "FAILURE: API is NOT reachable at http://localhost:$env:NIKKI_API_PORT. Error: $($_.Exception.Message)" -ForegroundColor Red
        }
    }

    # Clean up (optional, maybe we want to leave it running?)
    # docker compose down
