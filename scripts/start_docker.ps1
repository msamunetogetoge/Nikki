# Function to check if a port is available
function Test-PortAvailable {
    param (
        [int]$Port
    )
    $tcpConnection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    return $null -eq $tcpConnection
}

# Function to find the next available port
function Get-AvailablePort {
    param (
        [int]$StartPort
    )
    $port = $StartPort
    while (-not (Test-PortAvailable -Port $port)) {
        Write-Host "Port $port is occupied." -ForegroundColor Yellow
        # Get process info for the occupied port
        $process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty OwningProcess
        $processName = (Get-Process -Id $process).ProcessName
        Write-Host "  Occupied by Process ID: $process ($processName)" -ForegroundColor Yellow
        $port++
    }
    return $port
}

# Default ports
$defaultWebPort = 3939
$defaultApiPort = 8787

# Find available ports
Write-Host "Checking ports..." -ForegroundColor Cyan
$webPort = Get-AvailablePort -StartPort $defaultWebPort
$apiPort = Get-AvailablePort -StartPort $defaultApiPort

Write-Host "Selected Ports:" -ForegroundColor Green
Write-Host "  Web: $webPort" -ForegroundColor Green
Write-Host "  API: $apiPort" -ForegroundColor Green

# Set environment variables
$env:NIKKI_WEB_PORT = $webPort
$env:NIKKI_API_PORT = $apiPort

# Run docker compose
Write-Host "Starting Docker Compose..." -ForegroundColor Cyan
docker compose up -d

Write-Host "Docker environment started." -ForegroundColor Green
Write-Host "  Web App: http://localhost:$webPort" -ForegroundColor Green
Write-Host "  API: http://localhost:$apiPort" -ForegroundColor Green
