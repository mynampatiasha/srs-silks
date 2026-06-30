$content = Get-Content 'src/index.css'
$content[60] = '  position: relative;'
$content[61] = ''
$content | Set-Content 'src/index.css'
Write-Host "Done"
