# Counts topologies matched to vcenter.json by IP or normalized name

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

$topo = Get-Content .\Backend\Data\topologies.json -Raw | ConvertFrom-Json
$vcenter = Get-Content .\Backend\Data\vcenter.json -Raw | ConvertFrom-Json

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

$matchCount = 0
foreach ($topoItem in $topo) {
    $server = Get-FirstNonEmpty @($topoItem.Server, $topoItem.Name)
    $ip = Get-FirstNonEmpty @($topoItem.Ip, $topoItem.IP, $topoItem.IpAddress)

    $match = $false
    if ($ip -and $byIp.ContainsKey($ip)) {
        $match = $true
    } elseif ($server) {
        $nameKey = Normalize-Name $server
        if ($nameKey -and $byName.ContainsKey($nameKey)) {
            $match = $true
        }
    }

    if ($match) {
        $matchCount++
    }
}

Write-Host ("Eslestirme sayisi: {0}" -f $matchCount)
Write-Host ("Toplam topoloji: {0}" -f $topo.Count)
