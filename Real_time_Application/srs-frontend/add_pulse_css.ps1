$css = @"

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: .5; }
}
"@
Add-Content -Path "src/index.css" -Value $css
Write-Host "Done"
