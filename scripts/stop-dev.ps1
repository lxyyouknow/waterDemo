$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$runtimeDir = Join-Path $projectRoot '.runtime'
$pidFile = Join-Path $runtimeDir 'vite-dev.pid'
$logFile = Join-Path $runtimeDir 'vite-dev.log'

if (-not (Test-Path $pidFile)) {
  Write-Host 'No Vite dev server PID file found.'
  exit 0
}

$existingPid = (Get-Content $pidFile -Raw).Trim()

if (-not $existingPid) {
  Remove-Item -LiteralPath $pidFile -Force -ErrorAction SilentlyContinue
  Write-Host 'PID file was empty and has been cleared.'
  exit 0
}

$runningProcess = Get-Process -Id ([int]$existingPid) -ErrorAction SilentlyContinue

if ($runningProcess) {
  Stop-Process -Id ([int]$existingPid) -Force
  Write-Host "Stopped Vite dev server PID $existingPid."
} else {
  Write-Host "PID $existingPid is not running."
}

Remove-Item -LiteralPath $pidFile -Force -ErrorAction SilentlyContinue
if (Test-Path $logFile) {
  Remove-Item -LiteralPath $logFile -Force -ErrorAction SilentlyContinue
}
