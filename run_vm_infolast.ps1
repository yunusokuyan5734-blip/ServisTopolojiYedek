Import-Module VMware.PowerCLI

# Sertifika uyarilarini kapat
Set-PowerCLIConfiguration -InvalidCertificateAction Ignore -Confirm:$false | Out-Null

# vCenter bilgileri (otomatik calisma icin sabit/ortam degiskeni)
$vcenter = $env:VCENTER_SERVER
if ([string]::IsNullOrWhiteSpace($vcenter)) {
    $vcenter = "vxvc.iett.gov.tr"
}

$username = $env:VCENTER_USER
if ([string]::IsNullOrWhiteSpace($username)) {
    $username = "iett\srvtopology"
}

# DPAPI ile kaydedilmis credential'i kullan (PowerShell 7 uyumlu)
$credPath = Join-Path $PSScriptRoot "vc_cred.xml"
if (-not (Test-Path $credPath)) {
    $credential = Get-Credential -UserName $username -Message "vCenter sifresini girin (ilk kayit)"
    $credential | Export-Clixml -Path $credPath
    Write-Host "Credential kaydedildi: $credPath"
} else {
    $credential = Import-Clixml -Path $credPath
}

# vCenter baglantisi
Connect-VIServer -Server $vcenter -Credential $credential | Out-Null

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

try {
    # VM bilgileri
    $vmlist = Get-VM | Select-Object Name,
        @{N = 'Description'; E = { $_.ExtensionData.Config.Annotation }},
        @{N = 'Uptime (days)'; E = {
            if ($_.ExtensionData.Runtime.BootTime) {
                ((Get-Date) - $_.ExtensionData.Runtime.BootTime).Days
            } else {
                "N/A"
            }
        }},
        @{N = 'IP Address'; E = {
            $ips = $_.Guest.IPAddress | Where-Object { $_ -match '\\.' }
            if ($ips) {
                $ips -join ', '
            } else {
                "N/A"
            }
        }}

    # Proje topolojilerine gore name/ip match ederek vcenter.json olustur
    $vmByName = @{}
    $vmByIp = @{}
    foreach ($vm in $vmlist) {
        $nameKey = Normalize-Name $vm.Name
        if ($nameKey -and -not $vmByName.ContainsKey($nameKey)) {
            $vmByName[$nameKey] = $vm
        }

        $ipText = $vm.'IP Address'
        if ($ipText -and $ipText -ne "N/A") {
            $ipText.Split(',') | ForEach-Object { $_.Trim() } | Where-Object { $_ } | ForEach-Object {
                if (-not $vmByIp.ContainsKey($_)) {
                    $vmByIp[$_] = $vm
                }
            }
        }
    }

    $topoPath = Join-Path $PSScriptRoot "Backend\Data\topologies.json"
    $vcenterOutput = Join-Path $PSScriptRoot "Backend\Data\vcenter.json"
    $matchedList = @()
    if (Test-Path $topoPath) {
        $topologies = Get-Content $topoPath -Raw | ConvertFrom-Json
        $seen = @{}
        foreach ($topo in $topologies) {
            $server = Get-FirstNonEmpty @($topo.Server, $topo.Name)
            $ip = Get-FirstNonEmpty @($topo.Ip, $topo.IP, $topo.IpAddress)

            $vm = $null
            if ($ip -and $vmByIp.ContainsKey($ip)) {
                $vm = $vmByIp[$ip]
            }

            if (-not $vm -and $server) {
                $nameKey = Normalize-Name $server
                if ($nameKey -and $vmByName.ContainsKey($nameKey)) {
                    $vm = $vmByName[$nameKey]
                }
            }

            if ($vm) {
                $ipOut = if ($ip) {
                    $ip
                } elseif ($vm.'IP Address' -and $vm.'IP Address' -ne "N/A") {
                    $vm.'IP Address'
                } else {
                    "N/A"
                }

                $entry = [pscustomobject]@{
                    Name = $vm.Name
                    Description = $vm.Description
                    'Uptime (days)' = $vm.'Uptime (days)'
                    'IP Address' = $ipOut
                }

                $key = "{0}|{1}" -f $entry.Name, $entry.'IP Address'
                if (-not $seen.ContainsKey($key)) {
                    $matchedList += $entry
                    $seen[$key] = $true
                }
            }
        }
    }

    # JSON export
    $outputPath = Join-Path $HOME "Desktop\vm_infolast.json"
    $vmlist | ConvertTo-Json -Depth 4 | Out-File $outputPath -Encoding utf8
    Write-Host "JSON dosyasi olusturuldu: $outputPath"

    if ($matchedList.Count -gt 0) {
        $matchedList | ConvertTo-Json -Depth 4 | Out-File $vcenterOutput -Encoding utf8
        Write-Host "vcenter.json guncellendi: $vcenterOutput"
    } else {
        $vmlist | ConvertTo-Json -Depth 4 | Out-File $vcenterOutput -Encoding utf8
        Write-Host "topologies.json bulunamadi veya eslesme yok; vcenter.json tum liste ile yazildi: $vcenterOutput"
    }
} finally {
    # Baglantiyi kapat
    Disconnect-VIServer -Confirm:$false | Out-Null
}
