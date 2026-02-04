$filePath = 'C:\Users\dk_yokuyan\Desktop\VSCODE\ServisTopoloji\Backend\wwwroot\js\app.js'
$content = Get-Content $filePath -Raw

# Değiştir - satırları bul ve değiştir
$oldText = @"
        // Port bilgilerini hazırla (ok üzerinde göstermek için)
        // Port numaraları ok üzerinde gösterilmez (opsiyonel olarak kaldırıldı)
        let portLabel = '';
"@

$newText = @"
        // Port bilgilerini hazırla (ok üzerinde göstermek için)
        let portLabel = '';
        if (conn.ports && conn.ports.length > 0) {
            portLabel = conn.ports.map(p => `+"`${p.number}`"+`).join(', ');
        }
"@

$content = $content -replace [regex]::Escape($oldText), $newText
Set-Content $filePath $content -Encoding UTF8
Write-Host "Dosya güncellendi - Port numaraları gösterilecek"
