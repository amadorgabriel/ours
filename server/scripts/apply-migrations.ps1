# Apply EF migrations (Change 025 T31)
# Usage: from repo root — .\server\scripts\apply-migrations.ps1

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)

Push-Location (Join-Path $root "server")
try {
    dotnet ef database update `
        --project src/ProjectOurs.Infrastructure `
        --startup-project src/ProjectOurs.API
    Write-Host "Migrations applied successfully."
}
finally {
    Pop-Location
}
