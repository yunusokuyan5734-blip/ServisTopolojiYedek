# Reports topologies that have no note and no vCenter match

function Normalize-Name($value) {
    if ([string]::IsNullOrWhiteSpace($value)) {
        return $null
    }

    $name = $value.Trim().ToLowerInvariant()
    $name = $name.Replace('ç', 'c').Replace('ğ', 'g').Replace('ı', 'i').Replace('ö', 'o').Replace('ş', 's').Replace('ü', 'u')
    $name = $name.Replace('service', 'servis')
    $name = $name -replace '[^a-z0-9]', ''
    return $name
}

function Get-FirstNonEmpty([object[]]$values) {
    foreach ($value in $values) {
        if ($null -ne $value) {
            $text = $value.ToString().Trim()
            if ($text) {
                return $text
            }
        }
    }
    return ""
}

$basePath = $PSScriptRoot
$topoPath = Join-Path $basePath "Backend\Data\topologies.json"
$vcenterPath = Join-Path $basePath "Backend\Data\vcenter.json"
$outputPath = Join-Path $basePath "Backend\Data\topologies_missing_notes.json"

if (-not (Test-Path $topoPath)) {
    throw "topologies.json bulunamadi: $topoPath"
}
if (-not (Test-Path $vcenterPath)) {
    throw "vcenter.json bulunamadi: $vcenterPath"
}

$topologies = Get-Content $topoPath -Raw | ConvertFrom-Json
$vcenter = Get-Content $vcenterPath -Raw | ConvertFrom-Json

$byIp = @{}
$byName = @{}
foreach ($vm in $vcenter) {
    $vmName = Normalize-Name $vm.Name
    if ($vmName -and -not $byName.ContainsKey($vmName)) {
        $byName[$vmName] = $vm
    }

    $ipText = Get-FirstNonEmpty @($vm.'IP Address', $vm.IpAddress, $vm.Ip, $vm.IP)
    if ($ipText) {
        $ipText.Split(',') | ForEach-Object { $_.Trim() } | Where-Object { $_ } | ForEach-Object {
            if (-not $byIp.ContainsKey($_)) {
                $byIp[$_] = $vm
            }
        }
    }
}

$missing = @()
foreach ($topo in $topologies) {
    $note = Get-FirstNonEmpty @($topo.Note)
    if ($note) {
        continue
    }

    $server = Get-FirstNonEmpty @($topo.Server, $topo.Name)
    $ip = Get-FirstNonEmpty @($topo.Ip, $topo.IP, $topo.IpAddress)

    $match = $false
    if ($ip -and $byIp.ContainsKey($ip)) {
        $match = $true
    } elseif ($server) {
        $nameKey = Normalize-Name $server
        if ($nameKey -and $byName.ContainsKey($nameKey)) {
            $match = $true
        }
    }

    if (-not $match) {
        $missing += $topo
    }
}

$missing | ConvertTo-Json -Depth 4 | Out-File $outputPath -Encoding utf8
Write-Host ("Eksik not ve eslesme olmayan kayit sayisi: {0}" -f $missing.Count)
Write-Host ("Rapor: {0}" -f $outputPath)
