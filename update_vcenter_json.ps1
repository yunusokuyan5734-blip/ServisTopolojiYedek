Import-Module VMware.PowerCLI

# Sertifika uyarilarini kapat
Set-PowerCLIConfiguration -InvalidCertificateAction Ignore -Confirm:$false | Out-Null

# vCenter baglantisi (kullanici ve sifreyi ayri ayri sor)
$vcUser = Read-Host "vCenter user"
$vcPass = Read-Host "vCenter password" -AsSecureString
$credential = New-Object System.Management.Automation.PSCredential($vcUser, $vcPass)
$connection = Connect-VIServer -Server "vxvc.iett.gov.tr" -Credential $credential
Write-Host ("Connected to vCenter: {0}" -f $connection.Name)

try {
    $vmlist = Get-View -ViewType VirtualMachine -Property Name, Guest, Config, Runtime | ForEach-Object {
        $description = $_.Config.Annotation
        $uptime = if ($_.Runtime.BootTime) {
            ((Get-Date) - $_.Runtime.BootTime).Days
        } else {
            "N/A"
        }

        $ips = @()
        if ($_.Guest -and $_.Guest.IpAddress) {
            $ips += $_.Guest.IpAddress
        }
        if ($_.Guest -and $_.Guest.Net) {
            $ips += $_.Guest.Net | ForEach-Object { $_.IpAddress } | Where-Object { $_ }
        }

        $ips = $ips | Where-Object { $_ -match '\\.' } | Sort-Object -Unique
        $ipText = if ($ips) { $ips -join ', ' } else { "N/A" }

        [pscustomobject]@{
            Name = $_.Name
            'Description' = $description
            'Uptime (days)' = $uptime
            'IP Address' = $ipText
        }
    }

    $outputPath = Join-Path $PSScriptRoot "Backend\Data\vcenter.json"
    $vmlist | ConvertTo-Json -Depth 4 | Set-Content -Path $outputPath -Encoding UTF8
} finally {
    Disconnect-VIServer -Confirm:$false | Out-Null
}
