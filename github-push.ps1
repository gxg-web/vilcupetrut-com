# Run this in PowerShell where you are logged in: gh auth status shows "Logged in"
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

$env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")

gh auth status

if (git remote get-url origin 2>$null) {
  git push -u origin main
} else {
  gh repo create vilcupetrut-com --public --source=. --remote=origin --push
}
