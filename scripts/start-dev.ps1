$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$runtimeDir = Join-Path $projectRoot '.runtime'
$pidFile = Join-Path $runtimeDir 'vite-dev.pid'
$logFile = Join-Path $runtimeDir 'vite-dev.log'
$port = 5173
$devHost = '127.0.0.1'

New-Item -ItemType Directory -Path $runtimeDir -Force | Out-Null

if (Test-Path $pidFile) {
  $existingPid = (Get-Content $pidFile -Raw).Trim()

  if ($existingPid) {
    $runningProcess = Get-Process -Id ([int]$existingPid) -ErrorAction SilentlyContinue

    if ($runningProcess) {
      Write-Host "Vite dev server is already running on PID $existingPid."
      exit 0
    }
  }

  Remove-Item -LiteralPath $pidFile -Force -ErrorAction SilentlyContinue
}

if (Test-Path $logFile) {
  Remove-Item -LiteralPath $logFile -Force -ErrorAction SilentlyContinue
}

$launcher = Start-Process `
  -FilePath 'npm.cmd' `
  -ArgumentList 'run', 'dev' `
  -WorkingDirectory $projectRoot `
  -WindowStyle Hidden `
  -RedirectStandardOutput $logFile `
  -RedirectStandardError $logFile `
  -PassThru

Start-Sleep -Seconds 2

$listening = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue |
  Where-Object { $_.LocalAddress -eq $devHost }

if (-not $listening) {
  Write-Host "Vite dev server did not start successfully. Check $logFile"
  Stop-Process -Id $launcher.Id -Force -ErrorAction SilentlyContinue
  exit 1
}

$devPid = $listening | Select-Object -First 1 -ExpandProperty OwningProcess
Set-Content -LiteralPath $pidFile -Value $devPid

Write-Host "Vite dev server started at http://$devHost`:$port"
Write-Host "PID: $devPid"
Write-Host "Log: $logFile"
