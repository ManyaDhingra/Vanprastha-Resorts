# One-command local database setup: creates the DB if missing, applies
# migrations and seeds rooms + admin user.
# Usage: npm run db:setup
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot

function Find-Psql {
  $cmd = Get-Command psql -ErrorAction SilentlyContinue
  if ($cmd) { return $cmd.Source }
  $candidates = @(
    "C:\Program Files\PostgreSQL\16\bin\psql.exe",
    "C:\Program Files\PostgreSQL\17\bin\psql.exe",
    "C:\Program Files\PostgreSQL\15\bin\psql.exe"
  )
  foreach ($c in $candidates) { if (Test-Path $c) { return $c } }
  throw "psql not found. Install PostgreSQL 15+ or add psql to PATH."
}

$psql = Find-Psql
$dbName = "vanprastha"

# Parse DATABASE_URL (postgresql://user:pass@host:port/db) if present.
$envLine = Get-Content "$root\.env" -ErrorAction SilentlyContinue | Where-Object { $_ -match "^DATABASE_URL=" } | Select-Object -First 1
$url = $null
if ($envLine) { $url = $envLine -replace "^DATABASE_URL=", "" -replace '"', '' }
$user = "postgres"; $hostName = "localhost"; $port = "5432"
if ($url -match "postgres(ql)?://([^:]+):([^@]+)@([^:/]+):?(\d+)?/([^?]+)") {
  $user = $matches[2]; $hostName = $matches[4]; if ($matches[5]) { $port = $matches[5] }
}

# Password: reuse from .env DATABASE_URL if present, else try PGPASSWORD,
# else common local default.
$envPassword = $null
if ($envLine -and $url -match "postgres(ql)?://([^:]+):([^@]+)@") { $envPassword = $matches[3] }
if ($envPassword) { $env:PGPASSWORD = $envPassword }
elseif (-not $env:PGPASSWORD) { $env:PGPASSWORD = "postgres" }

Write-Host "Using PostgreSQL at $hostName`:$port (user $user)"

# Create the database if it does not exist.
$exists = & $psql -w -U $user -h $hostName -p $port -t -A -c "SELECT 1 FROM pg_database WHERE datname='$dbName';" 2>$null
if ($LASTEXITCODE -ne 0 -or -not $exists) {
  Write-Host "Creating database $dbName ..."
  & $psql -w -U $user -h $hostName -p $port -c "CREATE DATABASE $dbName;" 2>&1 | Out-Null
  if ($LASTEXITCODE -ne 0) { throw "Could not create database $dbName" }
} else {
  Write-Host "Database $dbName exists."
}

Push-Location $root
try {
  Write-Host "Applying migrations..."
  npx prisma migrate deploy
  if ($LASTEXITCODE -ne 0) { throw "migrate deploy failed" }
  Write-Host "Seeding..."
  npx prisma db seed
  if ($LASTEXITCODE -ne 0) { throw "seed failed" }
} finally {
  Pop-Location
}
Write-Host "DB setup complete."