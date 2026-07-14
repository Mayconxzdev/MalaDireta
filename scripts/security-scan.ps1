$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$extensions = @('.json', '.js', '.md', '.html', '.css', '.ps1', '.yml', '.yaml', '.csv', '.txt')
$excludedDirectories = @('.git', 'node_modules')
$allowedEmail = 'mayconxz00dev@gmail.com'

$patterns = @(
    @{ Name = 'IP privado'; Regex = '(?<![\w.])(?:10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})(?![\w.])' },
    @{ Name = 'Dominio corporativo'; Regex = '(?i)vesper\.ind\.br|ventrio\.ind\.br|smtp\.skymail\.net\.br' },
    @{ Name = 'Caminho local'; Regex = '(?i)C:\\Users\\|K:\\' },
    @{ Name = 'Segredo em texto'; Regex = '(?i)(password|senha|api[_-]?key|token)\s*[:=]\s*["'']?(?!CHANGE_ME|\$\{|<)[A-Za-z0-9_\-]{16,}' }
)

$issues = @()
$files = Get-ChildItem -LiteralPath $root -Recurse -File | Where-Object {
    $relative = $_.FullName.Substring($root.Length + 1)
    $extensions -contains $_.Extension -and -not ($excludedDirectories | Where-Object { $relative -like "$_\*" })
}

foreach ($file in $files) {
    $content = Get-Content -LiteralPath $file.FullName -Raw -ErrorAction SilentlyContinue
    if (-not $content) { continue }
    $relative = $file.FullName.Substring($root.Length + 1)
    foreach ($item in $patterns) {
        if ($relative -like 'scripts\security-scan.ps1') { continue }
        foreach ($match in [regex]::Matches($content, $item.Regex)) {
            $issues += [pscustomobject]@{ File = $relative; Pattern = $item.Name; Sample = $match.Value }
        }
    }

    if ($relative -notlike 'README*') {
        foreach ($email in [regex]::Matches($content, '(?i)[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}')) {
            if ($email.Value -ne $allowedEmail -and $email.Value -notmatch '@example\.(com|org)$|@[a-z0-9-]+\.example$|@empresa-exemplo\.com\.br$') {
                $issues += [pscustomobject]@{ File = $relative; Pattern = 'E-mail nao ficticio'; Sample = $email.Value }
            }
        }
    }
}

if ($issues.Count) {
    $issues | Sort-Object File, Pattern, Sample -Unique | Format-Table -AutoSize
    throw "Varredura encontrou $($issues.Count) possivel(is) vazamento(s)."
}

Write-Host 'OK Nenhum segredo, IP privado ou dado corporativo detectado.' -ForegroundColor Green
