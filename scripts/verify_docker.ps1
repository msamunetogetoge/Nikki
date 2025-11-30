$ErrorActionPreference = "Stop"

Write-Host "Starting Docker Verification..."

# 1. Clean up existing containers
Write-Host "Cleaning up existing containers..."
docker compose down

# 2. Build and Start Docker
Write-Host "Building and starting Docker container..."
docker compose up -d --build

# 3. Install Dependencies
Write-Host "Installing dependencies inside container..."
docker compose exec dev npm install

# 4. Start Application
Write-Host "Starting application inside container..."
# Run in background
docker compose exec -d dev npm run dev

# 5. Verify Ports
$maxRetries = 30
$retryDelay = 5 # seconds

function Check-Port($port, $name) {
    Write-Host "Checking $name on port $port..."
    for ($i = 0; $i -lt $maxRetries; $i++) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:$port" -Method Head -ErrorAction Stop
            if ($response.StatusCode -eq 200) {
                Write-Host "$name is UP!" -ForegroundColor Green
                return $true
            }
        }
        catch {
            Write-Host "Waiting for $name... ($($i+1)/$maxRetries)"
            Start-Sleep -Seconds $retryDelay
        }
    }
    Write-Host "$name failed to start." -ForegroundColor Red
    return $false
}

$apiUp = Check-Port 8000 "API"
$webUp = Check-Port 3000 "Web"

if ($apiUp -and $webUp) {
    Write-Host "Verification Passed!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "Verification Failed!" -ForegroundColor Red
    exit 1
}
