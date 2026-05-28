$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$runtimeDir = Join-Path $projectRoot '.runtime'
$pidFile = Join-Path $runtimeDir 'vite-dev.pid'
$logFile = Join-Path $runtimeDir 'vite-dev.log'
$port = 5173
$devHost = '127.0.0.1'

$listening = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue |
  Where-Object { $_.LocalAddress -eq $devHost }

if ($listening) {
  $listening | Select-Object LocalAddress, LocalPort, State, OwningProcess
} else {
  Write-Host "No process is listening on port $port."
}

if (Test-Path $pidFile) {
  $existingPid = (Get-Content $pidFile -Raw).Trim()
  Write-Host "PID file: $existingPid"
} else {
  Write-Host 'PID file: missing'
}

if (Test-Path $logFile) {
  Write-Host "Log file: $logFile"
} else {
  Write-Host 'Log file: missing'
}
