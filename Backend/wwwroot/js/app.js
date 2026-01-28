const API_BASE = '/api';

let allTopologies = [];
let allServers = [
    { id: 1, name: 'IETTMSSQLDB01', ip: '10.100.0.36', critical: 'Yüksek', date: '26.01.2026' },
    { id: 2, name: 'IETTMSSQLDB02', ip: '10.100.0.37', critical: 'Yüksek', date: '26.01.2026' },
    { id: 3, name: 'AYSPROD2', ip: '172.16.80.174', critical: 'Yüksek', date: '26.01.2026' },
    { id: 4, name: 'ABONEWEB', ip: '172.16.80.8', critical: 'Orta', date: '26.01.2026' },
    { id: 5, name: 'EMC_BACKUP_SRV', ip: '10.98.100.120', critical: 'Orta', date: '26.01.2026' }
];
let allPorts = [];
let canvasData = { shapes: [], connections: [] };

const sampleSheflikler = [
    { name: 'YAZILIM ŞEFLİĞİ', status: 'Aktif', date: '07.05.2025 16:13' },
    { name: 'VERİ YÖNETİM ŞEFLİĞİ', status: 'Aktif', date: '07.05.2025 16:13' },
    { name: 'BİLİŞİM HİZMETLERİ ŞEFLİĞİ', status: 'Aktif', date: '07.05.2025 16:13' },
    { name: 'KURUMSAL MİMARİ ŞEFLİĞİ', status: 'Aktif', date: '07.05.2025 16:13' },
    { name: 'AKILLI TOPLU ULAŞIM ŞEFLİĞİ', status: 'Aktif', date: '07.05.2025 16:13' },
    { name: 'AR-GE ve FİNANSAL TEKNOLOJİLER ŞEFLİĞİ', status: 'Aktif', date: '07.05.2025 16:13' },
    { name: 'HABERLEŞME SİSTEMLERİ VE KURUMSAL HAT ŞEFLİĞİ', status: 'Aktif', date: '07.05.2025 16:13' },
    { name: 'ARAÇ İÇİ SİSTEMLER VE SAHA ŞEFLİĞİ', status: 'Aktif', date: '07.05.2025 16:13' },
    { name: 'SUNUCU VE NETWORK SİSTEMLER ŞEFLİĞİ', status: 'Aktif', date: '07.05.2025 16:13' },
    { name: 'Bakım Onarım Tesisat', status: 'Aktif', date: '07.05.2025 16:13' },
    { name: 'ULAŞIM PLANLAMA', status: 'Aktif', date: '07.05.2025 16:13' },
    { name: 'İŞ ZEKASI ŞEFLİĞİ', status: 'Aktif', date: '07.05.2025 16:13' }
];

const platformOptions = ['Windows', 'Linux', 'Unix', 'Diğer'];
const criticalOptions = ['Düşük', 'Orta', 'Yüksek'];

// ======== DEFAULT PORTLAR ========
const defaultPorts = [
    { name: 'HTTP', number: '80', shape: 'circle', color: '#4CAF50', description: 'Web sunucusu (şifreli değil)' },
    { name: 'HTTPS', number: '443', shape: 'circle', color: '#2196F3', description: 'Güvenli web sunucusu (SSL/TLS)' },
    { name: 'LDAP', number: '389', shape: 'circle', color: '#FF9800', description: 'Dizin erişim protokolü' },
    { name: 'LDAPS', number: '636', shape: 'circle', color: '#FF5722', description: 'Güvenli LDAP' },
    { name: 'SMB', number: '445', shape: 'circle', color: '#9C27B0', description: 'Windows dosya paylaşımı' },
    { name: 'Kerberos', number: '88', shape: 'circle', color: '#3F51B5', description: 'Kimlik doğrulama protokolü' },
    { name: 'DNS', number: '53', shape: 'circle', color: '#00BCD4', description: 'Domain Name System' },
    { name: 'FTP', number: '21', shape: 'circle', color: '#607D8B', description: 'Dosya transfer protokolü' },
    { name: 'SSH', number: '22', shape: 'circle', color: '#795548', description: 'Güvenli shell erişimi' },
    { name: 'SMTP', number: '25', shape: 'circle', color: '#E91E63', description: 'E-posta gönderme' },
    { name: 'NFS', number: '2049', shape: 'circle', color: '#8BC34A', description: 'Network File System' },
    { name: 'RDP', number: '3389', shape: 'circle', color: '#009688', description: 'Remote Desktop Protocol' },
    { name: 'MySQL', number: '3306', shape: 'circle', color: '#FF6F00', description: 'MySQL veritabanı' },
    { name: 'PostgreSQL', number: '5432', shape: 'circle', color: '#0277BD', description: 'PostgreSQL veritabanı' },
    { name: 'Oracle', number: '1521', shape: 'circle', color: '#D32F2F', description: 'Oracle veritabanı' },
    { name: 'MSSQL', number: '1433', shape: 'circle', color: '#C62828', description: 'Microsoft SQL Server' },
    { name: 'Redis', number: '6379', shape: 'circle', color: '#D50000', description: 'Redis cache' },
    { name: 'MongoDB', number: '27017', shape: 'circle', color: '#4CAF50', description: 'MongoDB veritabanı' },
    { name: 'Zabbix', number: '10051', shape: 'circle', color: '#EF5350', description: 'Zabbix izleme' },
    { name: 'Trellix', number: '8081', shape: 'circle', color: '#AB47BC', description: 'Trellix güvenlik' },
    { name: 'ms-netlogon', number: '456c8', shape: 'circle', color: '#42A5F5', description: 'Microsoft Netlogon' },
    { name: 'ms-ds-smb3', number: '445', shape: 'circle', color: '#5C6BC0', description: 'Microsoft SMB3' },
    { name: 'Active-Ds', number: '49667', shape: 'circle', color: '#7E57C2', description: 'Active Directory' },
    { name: 'NTP', number: '123', shape: 'circle', color: '#26A69A', description: 'Network Time Protocol' },
    { name: 'Backend', number: '8096', shape: 'circle', color: '#66BB6A', description: 'Backend servisi' }
];

// Tekrarlayan port numaralarını tekilleştirir
const uniquePortsByNumber = (ports) => {
    const map = new Map();
    ports.forEach(p => {
        const key = String(p.number).trim();
        if (!map.has(key)) {
            map.set(key, { ...p, number: key });
        }
    });
    return Array.from(map.values());
};

document.addEventListener('DOMContentLoaded', () => {
    attachNav();
    attachChangePassword();
    loadAndDisplayTopologies();
    attachSheflikler();
    attachServers();
    attachPorts();
    attachDrawio();
    attachExportFeatures();
    attachUploadForm();
    attachThemeToggle();
    attachFabActions();
    attachDeleteButtons();
    ensureAuth();
});

// ======== SİLME İŞLEMLERİ ========
function attachDeleteButtons() {
    const deleteBtn = document.getElementById('deleteSelectedBtn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', async () => {
            const selected = Array.from(document.querySelectorAll('.topology-checkbox:checked'));
            if (selected.length === 0) {
                alert('Lütfen silmek için en az bir topoloji seçin.');
                return;
            }
            if (!confirm('Seçili topolojiler silinsin mi?')) return;
            for (const cb of selected) {
                const file = cb.getAttribute('data-file');
                try {
                    const response = await fetch(`${API_BASE}/topology/delete?file=${encodeURIComponent(file)}`, {
                        method: 'DELETE',
                        credentials: 'include'
                    });
                    if (!response.ok) {
                        console.error('Silinemedi:', file);
                    }
                } catch (err) {
                    console.error('Silme hatası:', file, err);
                }
            }
            await loadAndDisplayTopologies();
        });
    }
}

// ======== NAVİGASYON ========
function attachNav() {
    const buttons = document.querySelectorAll('.nav-item[data-target]');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-target');
            showSection(target);
            buttons.forEach(b => b.classList.toggle('active', b === btn));
        });
    });
    if (buttons[0]) buttons[0].classList.add('active');
}

function showSection(id) {
    document.querySelectorAll('.section').forEach(sec => {
        sec.classList.toggle('active', sec.id === id);
    });
}

// ======== ŞIFRE DEĞIŞTIR ========
function attachChangePassword() {
    const toggle = document.getElementById('toggleChange');
    const form = document.getElementById('changePasswordForm');
    const msg = document.getElementById('changePasswordMessage');

    if (toggle && form) {
        toggle.addEventListener('click', () => {
            const visible = form.style.display === 'block';
            form.style.display = visible ? 'none' : 'block';
            msg.textContent = '';
            msg.className = 'message';
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            msg.textContent = '';
            msg.className = 'message';

            const oldPassword = document.getElementById('oldPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            if (newPassword !== confirmPassword) {
                msg.textContent = 'Yeni şifreler eşleşmiyor';
                msg.classList.add('error');
                return;
            }

            if ((newPassword || '').length < 3) {
                msg.textContent = 'Yeni şifre en az 3 karakter olmalı';
                msg.classList.add('error');
                return;
            }

            try {
                const response = await fetch(`${API_BASE}/auth/change-password`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ oldPassword, newPassword })
                });

                const data = await response.json();

                if (response.ok) {
                    msg.textContent = 'Şifre güncellendi. Yeniden giriş yapın.';
                    msg.classList.add('success');
                    setTimeout(() => logout(), 1200);
                } else {
                    msg.textContent = data.message || 'Şifre değiştirilirken hata oluştu';
                    msg.classList.add('error');
                }
            } catch (error) {
                msg.textContent = 'Bağlantı hatası: ' + error.message;
                msg.classList.add('error');
            }
        });
    }
}

// ======== TOPOLOJILER (OVERVIEW) ========
async function loadAndDisplayTopologies() {
    try {
        const response = await fetch(`${API_BASE}/topology/list`, { credentials: 'include' });
        if (response.ok) {
            allTopologies = await response.json();
            console.log('Loaded topologies:', allTopologies.length);
            if (allTopologies.length > 0) {
                console.log('Sample topology:', allTopologies[0]);
            }
        } else {
            allTopologies = [];
        }
    } catch (error) {
        console.error('Error loading topologies:', error);
        allTopologies = [];
    }
    
    renderOverview();
    renderFilters();
    renderTable(allTopologies);
}

function renderOverview() {
    const cards = document.getElementById('overviewCards');
    if (!cards) return;
    
    const total = allTopologies.length;
    const highCritical = allServers.filter(s => s.critical === 'Yüksek').length;
    const mediumCritical = allServers.filter(s => s.critical === 'Orta').length;
    const lowCritical = allServers.filter(s => s.critical === 'Düşük').length;
    
    const lastDate = allServers.length > 0 ? allServers[allServers.length - 1]?.date || '-' : '-';
    
    cards.innerHTML = `
        <div class="info-card">
            <p class="label">En Son Görüntülenenler</p>
            <h3>${lastDate}</h3>
            <p class="muted">En son eklenen sunucu tarihi</p>
        </div>
        <div class="info-card">
            <p class="label">Topoloji Sayısı</p>
            <h3>${total}</h3>
            <p class="muted">Kayıtlı toplam topoloji</p>
        </div>
        <div class="info-card">
            <p class="label">Yüksek Kritik</p>
            <h3 style="color: #ff6b6b;">${highCritical}</h3>
            <p class="muted">Kritiklik seviyesi yüksek sunucular</p>
        </div>
        <div class="info-card">
            <p class="label">Orta Seviye</p>
            <h3 style="color: #ff9f43;">${mediumCritical}</h3>
            <p class="muted">Kritiklik seviyesi orta sunucular</p>
        </div>
        <div class="info-card">
            <p class="label">Düşük Seviye</p>
            <h3 style="color: #3ed598;">${lowCritical}</h3>
            <p class="muted">Kritiklik seviyesi düşük sunucular</p>
        </div>
    `;
}

function renderFilters() {
    const deptSelect = document.getElementById('filterDept');
    if (!deptSelect) return;
    deptSelect.innerHTML = '<option value="">Tüm Şeflikler</option>';
    const depts = [...new Set(allTopologies.map(t => t.dept))];
    depts.forEach(d => {
        const opt = document.createElement('option');
        opt.value = d;
        opt.textContent = d;
        deptSelect.appendChild(opt);
    });
}

function applyFilters() {
    const dept = document.getElementById('filterDept')?.value || '';
    const crit = document.getElementById('filterCrit')?.value || '';
    const text = (document.getElementById('filterSearch')?.value || '').toLowerCase();

    const filtered = allTopologies.filter(t => {
        const matchDept = dept ? t.dept === dept : true;
        const matchCrit = crit ? t.critical === crit : true;
        const matchText = text ? (t.server + t.file + t.dept).toLowerCase().includes(text) : true;
        return matchDept && matchCrit && matchText;
    });

    renderTable(filtered);
}

function resetFilters() {
    const dept = document.getElementById('filterDept');
    const crit = document.getElementById('filterCrit');
    const search = document.getElementById('filterSearch');
    if (dept) dept.value = '';
    if (crit) crit.value = '';
    if (search) search.value = '';
    renderTable(allTopologies);
}

function renderTable(rows) {
    const tbody = document.querySelector('#topologyTable tbody');
    if (!tbody) return;
    
    // Debug: İlk satırı console'a yazdır
    if (rows.length > 0) {
        console.log('First row data:', rows[0]);
    }
    
    // Çoklu seçim kontrolleri ekle
    const thead = document.querySelector('#topologyTable thead tr');
    if (thead && !thead.querySelector('.select-all-checkbox')) {
        const thCheckbox = document.createElement('th');
        thCheckbox.style.width = '40px';
        thCheckbox.innerHTML = `<input type="checkbox" class="select-all-checkbox" style="cursor:pointer;">`;
        thead.insertBefore(thCheckbox, thead.firstChild);
        
        thCheckbox.querySelector('.select-all-checkbox').addEventListener('change', (e) => {
            document.querySelectorAll('.topology-checkbox').forEach(cb => {
                cb.checked = e.target.checked;
            });
            updateSelectedCount();
        });
    }
    
    tbody.innerHTML = rows.map(r => {
        // Hem PascalCase hem camelCase destekle
        const name = r.name || r.Name || r.server || r.Server || 'İsimsiz';
        const server = r.server || r.Server || '-';
        const ip = r.ip || r.Ip || '-';
        const file = r.file || r.File || '-';
        const dept = r.dept || r.Dept || '-';
        const version = r.version || r.Version || 'v1';
        const date = r.date || r.Date || '-';
        const user = r.user || r.User || '-';
        const platform = r.platform || r.Platform || '-';
        const critical = r.critical || r.Critical || '-';

        // Sunucu sembolü ve görsel sunum
        const serverCell = `
            <div style="display:flex;align-items:center;gap:0.5rem;">
                <span style="display:inline-flex;align-items:center;justify-content:center;width:2rem;height:2rem;background:#6366f1;color:#fff;border-radius:0.5rem;font-size:1.2rem;"><i class='fa fa-server'></i></span>
                <div style="display:flex;flex-direction:column;">
                    <span style="font-weight:600;">${server}</span>
                    <span style="font-size:0.9em;color:#64748b;">${ip}</span>
                </div>
            </div>`;

        return `
        <tr style="cursor:default;">
            <td onclick="event.stopPropagation()"><input type="checkbox" class="topology-checkbox" data-file="${file}" style="cursor:pointer;" onchange="updateSelectedCount()"></td>
            <td onclick="viewTopology('${file}')" style="cursor:pointer;"><strong>${name}</strong></td>
            <td onclick="viewTopology('${file}')" style="cursor:pointer;">${serverCell}</td>
            <td onclick="viewTopology('${file}')" style="cursor:pointer;">${file}</td>
            <td onclick="viewTopology('${file}')" style="cursor:pointer;">${dept}</td>
            <td style="cursor:pointer;" onclick="event.stopPropagation();showVersionHistory('${server}','${ip}')"><span class="badge muted" title="Geçmiş versiyonları gör">${version}</span></td>
            <td onclick="viewTopology('${file}')" style="cursor:pointer;">${date}</td>
            <td onclick="viewTopology('${file}')" style="cursor:pointer;"><span class="badge info">${user}</span></td>
            <td onclick="viewTopology('${file}')" style="cursor:pointer;"><span class="badge ${platform === 'Windows' ? 'primary' : 'success'}">${platform}</span></td>
            <td onclick="viewTopology('${file}')" style="cursor:pointer;"><span class="badge ${critical === 'Yüksek' ? 'danger' : critical === 'Orta' ? 'warning' : 'success'}">${critical}</span></td>
            <td class="actions">
                <button class="tag" onclick="viewTopology('${file}')"><i class="fa fa-eye"></i> Görüntüle</button>
                <button class="tag" onclick="editTopology('${file}')"><i class="fa fa-pen"></i> Düzenle</button>
            </td>
        </tr>
        `;
    }).join('');
    // Versiyon geçmişi modalı fonksiyonları (global scope)
    function showVersionHistory(server, ip) {
        const modal = document.getElementById('versionModal');
        const content = document.getElementById('versionModalContent');
        if (!modal || !content) return;
        // Tüm versiyonları bul
        const versions = allTopologies.filter(t => {
            const s = t.server || t.Server;
            const i = t.ip || t.Ip;
            return s && i && s.trim().toLowerCase() === server.trim().toLowerCase() && i.trim() === ip.trim();
        }).sort((a, b) => {
            // v1, v2, v3... sıralama
            const va = parseInt((a.version || a.Version || 'v1').replace(/\D/g, '')) || 1;
            const vb = parseInt((b.version || b.Version || 'v1').replace(/\D/g, '')) || 1;
            return va - vb;
        });
        if (versions.length === 0) {
            content.innerHTML = '<div style="color:#ef4444">Geçmiş versiyon bulunamadı.</div>';
        } else {
            content.innerHTML = `<table class="table" style="min-width:400px;">
                <thead><tr><th>Versiyon</th><th>Dosya</th><th>Tarih</th><th>Ekleyen</th><th>İşlem</th></tr></thead>
                <tbody>
                ${versions.map(function(v) {
                    return `<tr>
                        <td><span class="badge muted">${v.version || v.Version || 'v1'}</span></td>
                        <td>${v.file || v.File || '-'}</td>
                        <td>${v.date || v.Date || '-'}</td>
                        <td>${v.user || v.User || '-'}</td>
                        <td><button class="tag" onclick="viewTopology('${v.file || v.File}')"><i class="fa fa-eye"></i> Görüntüle</button></td>
                    </tr>`;
                }).join('')}
                </tbody></table>`;
        }
        modal.style.display = 'flex';
    }

    function closeVersionModal() {
        const modal = document.getElementById('versionModal');
        if (modal) modal.style.display = 'none';
    }
    // Sunucular tablosuna otomatik ekleme
    if (Array.isArray(allServers)) {
        rows.forEach(r => {
            const server = r.server || r.Server;
            const ip = r.ip || r.Ip;
            const critical = r.critical || r.Critical || '-';
            if (server && ip && !allServers.some(s => s.name === server && s.ip === ip)) {
                allServers.push({
                    id: Date.now() + Math.random(),
                    name: server,
                    ip: ip,
                    critical: critical,
                    date: r.date || r.Date || new Date().toLocaleDateString('tr-TR')
                });
            }
        });
        if (typeof renderServersTable === 'function') renderServersTable();
    }
}


// Topoloji meta düzenleme (istemci tarafı)
function editTopology(idOrFile) {
    const topo = allTopologies.find(t => (t.id && String(t.id) === String(idOrFile)) || t.file === idOrFile);
    if (!topo) return;
    currentEditTopology = topo;
    const saveForm = document.getElementById('saveDrawingForm');
    const topologySaveForm = document.getElementById('topologySaveForm');
    if (!topologySaveForm) return;
    document.getElementById('drawingTopologyName').value = topo.topologyName || topo.Name || topo.name || topo.server || '';
    document.getElementById('drawingServerName').value = topo.server || '';
    document.getElementById('drawingServerIp').value = topo.ip || '';
    document.getElementById('drawingDept').value = topo.dept || '';
    document.getElementById('drawingPlatform').value = topo.platform || '';
    document.getElementById('drawingCritical').value = topo.critical || '';
    document.getElementById('drawingNote').value = topo.note || '';
    if (saveForm) {
        saveForm.style.display = 'block';
        saveForm.scrollIntoView({ behavior: 'smooth' });
    }
}

// ======== TEMA ========
function attachThemeToggle() {
    const btn = document.getElementById('themeToggle');
    if (!btn) return;
    const saved = localStorage.getItem('theme') || 'light';
    if (saved === 'dark') document.body.classList.add('dark-theme');
    btn.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
    });
}

// ======== ŞEFLIKLER ========
function attachSheflikler() {
    const tbody = document.querySelector('#sheflikTable tbody');
    if (!tbody) return;
    tbody.innerHTML = sampleSheflikler.map((s, idx) => `
        <tr>
            <td>${idx + 1}</td>
            <td>${s.name}</td>
            <td><span class="badge success">${s.status}</span></td>
            <td>${s.date}</td>
            <td class="actions">
                <button class="tag"><i class="fa fa-pen"></i></button>
                <button class="tag danger"><i class="fa fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

// ======== DOSYA YÜKLEME ========
// ======== TOPOLOGY PARSING VE VERSIYONLAMA ========
// SVG dosyasından sunucu adı ve IP'sini çıkartır
function parseServerInfoFromFile(filename) {
    // Format: ServerName(IP.Address) veya serveradı(ip) şeklinde
    const regex = /^(.+?)\(([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})\)/;
    const match = filename.replace(/\.[^.]+$/, '').match(regex); // Dosya uzantısını çıkar
    
    if (match) {
        return {
            name: match[1].trim(),
            ip: match[2].trim(),
            extracted: true
        };
    }
    
    return {
        name: filename.replace(/\.[^.]+$/, ''),
        ip: null,
        extracted: false
    };
}

// Aynı isimde topology varsa versiyonlandırır (v1, v2, vb.)
function getUniqueTopologyName(originalName, existingTopologies) {
    let baseName = originalName;
    let version = 1;
    let newName = baseName;
    
    // Eğer zaten v1, v2 vb varsa, versiyon numarası çıkar
    const versionMatch = baseName.match(/(.+?)_v(\d+)$/);
    if (versionMatch) {
        baseName = versionMatch[1];
    }
    
    // Aynı isimde başka topoloji olup olmadığını kontrol et
    while (existingTopologies.some(t => t.name === newName)) {
        newName = `${baseName}_v${version}`;
        version++;
    }
    
    return newName;
}

function attachUploadForm() {
    // Global değişken: her dosya için ayarlar
    window.fileConfigs = {};
    
    // Dosya seçildiğinde otomatik parse et ve form oluştur
    const fileInput = document.getElementById('topologyFiles');
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            const files = e.target.files;
            const container = document.getElementById('fileConfigContainer');
            const preview = document.getElementById('parsedFilesPreview');
            const copyBtn = document.getElementById('copyFirstToAll');
            
            window.fileConfigs = {};
            
            if (files.length > 0) {
                preview.style.display = 'block';
                let html = '';
                
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    const parsed = parseServerInfoFromFile(file.name);
                    const fileId = `file-${i}`;
                    window.fileConfigs[fileId] = {
                        fileName: file.name,
                        server: parsed.name,
                        ip: parsed.ip || '',
                        dept: '',
                        platform: '',
                        critical: '',
                        note: ''
                    };
                    
                    const icon = parsed.extracted ? '✅' : '⚠️';
                    const color = parsed.extracted ? '#10b981' : '#f59e0b';
                    
                    html += `
                    <div style="margin:1rem 0;padding:1rem;background:white;border-radius:8px;border-left:4px solid ${color};">
                        <div style="display:flex;align-items:center;margin-bottom:1rem;">
                            <span style="margin-right:0.5rem;font-size:1.2rem;">${icon}</span>
                            <strong style="flex:1;color:#0f172a;">${file.name}</strong>
                            <span style="color:#64748b;font-size:0.85rem;">
                                <strong>${parsed.name}</strong> (${parsed.ip || 'IP parselenemedi'})
                            </span>
                        </div>
                        
                        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:1rem;margin-bottom:1rem;">
                            <div>
                                <label style="display:block;font-size:0.85rem;font-weight:600;color:#0f172a;margin-bottom:0.3rem;">Şeflik</label>
                                <select class="file-dept" data-file-id="${fileId}" style="width:100%;padding:0.5rem;border:1px solid #cbd5e1;border-radius:6px;font-size:0.9rem;"></select>
                            </div>
                            <div>
                                <label style="display:block;font-size:0.85rem;font-weight:600;color:#0f172a;margin-bottom:0.3rem;">Platform</label>
                                <select class="file-platform" data-file-id="${fileId}" style="width:100%;padding:0.5rem;border:1px solid #cbd5e1;border-radius:6px;font-size:0.9rem;"></select>
                            </div>
                            <div>
                                <label style="display:block;font-size:0.85rem;font-weight:600;color:#0f172a;margin-bottom:0.3rem;">Kritiklik</label>
                                <select class="file-critical" data-file-id="${fileId}" style="width:100%;padding:0.5rem;border:1px solid #cbd5e1;border-radius:6px;font-size:0.9rem;"></select>
                            </div>
                        </div>
                        
                        <div>
                            <label style="display:block;font-size:0.85rem;font-weight:600;color:#0f172a;margin-bottom:0.3rem;">Not</label>
                            <textarea class="file-note" data-file-id="${fileId}" style="width:100%;padding:0.5rem;border:1px solid #cbd5e1;border-radius:6px;font-size:0.9rem;min-height:80px;resize:vertical;" placeholder="Bu dosya için not yazınız..."></textarea>
                        </div>
                    </div>`;
                }
                
                container.innerHTML = html;
                
                // Select alanlarını doldur
                document.querySelectorAll('.file-dept').forEach(select => {
                    select.innerHTML = '<option value="">Şeflik seçiniz...</option>' +
                        sampleSheflikler.map(d => `<option value="${d.name}">${d.name}</option>`).join('');
                    select.addEventListener('change', (e) => {
                        const fileId = e.target.dataset.fileId;
                        window.fileConfigs[fileId].dept = e.target.value;
                    });
                });
                
                document.querySelectorAll('.file-platform').forEach(select => {
                    select.innerHTML = '<option value="">Platform seçiniz...</option>' +
                        platformOptions.map(p => `<option value="${p}">${p}</option>`).join('');
                    select.addEventListener('change', (e) => {
                        const fileId = e.target.dataset.fileId;
                        window.fileConfigs[fileId].platform = e.target.value;
                    });
                });
                
                document.querySelectorAll('.file-critical').forEach(select => {
                    select.innerHTML = '<option value="">Kritiklik seçiniz...</option>' +
                        criticalOptions.map(c => `<option value="${c}">${c}</option>`).join('');
                    select.addEventListener('change', (e) => {
                        const fileId = e.target.dataset.fileId;
                        window.fileConfigs[fileId].critical = e.target.value;
                    });
                });
                
                document.querySelectorAll('.file-note').forEach(textarea => {
                    textarea.addEventListener('change', (e) => {
                        const fileId = e.target.dataset.fileId;
                        window.fileConfigs[fileId].note = e.target.value;
                    });
                });
                
                // Kopyala butonu
                if (files.length > 1) {
                    copyBtn.style.display = 'inline-block';
                    copyBtn.addEventListener('click', () => {
                        const firstFileId = 'file-0';
                        const firstConfig = window.fileConfigs[firstFileId];
                        
                        Object.keys(window.fileConfigs).forEach((fileId, index) => {
                            if (index > 0) {
                                window.fileConfigs[fileId].dept = firstConfig.dept;
                                window.fileConfigs[fileId].platform = firstConfig.platform;
                                window.fileConfigs[fileId].critical = firstConfig.critical;
                            }
                        });
                        
                        // UI'ı güncelle
                        document.querySelectorAll('.file-dept').forEach((select, idx) => {
                            if (idx > 0) select.value = firstConfig.dept;
                        });
                        document.querySelectorAll('.file-platform').forEach((select, idx) => {
                            if (idx > 0) select.value = firstConfig.platform;
                        });
                        document.querySelectorAll('.file-critical').forEach((select, idx) => {
                            if (idx > 0) select.value = firstConfig.critical;
                        });
                    });
                } else {
                    copyBtn.style.display = 'none';
                }
            } else {
                preview.style.display = 'none';
            }
        });
    }

    const form = document.getElementById('uploadForm');
    const message = document.getElementById('uploadMessage');
    if (form && message) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            message.textContent = '';
            message.className = 'message';

            const files = document.getElementById('topologyFiles').files;

            if (!files || files.length === 0) {
                message.textContent = 'Lütfen en az bir dosya seçin';
                message.classList.add('error');
                return;
            }

            let uploadedCount = 0;
            let failedFiles = [];
            
            // Her dosya için ayrı upload
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const fileId = `file-${i}`;
                const config = window.fileConfigs[fileId];
                
                if (!config) {
                    failedFiles.push(`${file.name}: Konfigürasyon bulunamadı`);
                    continue;
                }
                
                if (!config.dept || !config.platform || !config.critical) {
                    failedFiles.push(`${file.name}: Şeflik, Platform ve Kritiklik seçimi gereklidir`);
                    continue;
                }
                
                const uniqueName = getUniqueTopologyName(config.server, allTopologies);
                
                const formData = new FormData();
                formData.append('files', file);
                formData.append('server', config.server);
                formData.append('ip', config.ip);
                formData.append('topologyName', uniqueName);
                formData.append('dept', config.dept);
                formData.append('platform', config.platform);
                formData.append('critical', config.critical);
                formData.append('note', config.note || '');
                
                try {
                    const response = await fetch('/api/topology/upload', {
                        method: 'POST',
                        credentials: 'include',
                        body: formData
                    });

                    const data = await response.json();

                    if (response.ok) {
                        uploadedCount++;
                        const serverExists = allServers.some(s => s.name === config.server && s.ip === config.ip);
                        if (!serverExists) {
                            allServers.push({
                                id: Date.now() + Math.random(),
                                name: config.server,
                                ip: config.ip,
                                critical: config.critical,
                                date: new Date().toLocaleDateString('tr-TR')
                            });
                        }
                    } else {
                        failedFiles.push(`${file.name}: ${data.message || 'Yükleme başarısız'}`);
                    }
                } catch (error) {
                    failedFiles.push(`${file.name}: ${error.message}`);
                }
            }

            if (uploadedCount > 0 && failedFiles.length === 0) {
                message.textContent = `✓ ${uploadedCount} dosya başarıyla yüklendi!`;
                message.classList.add('success');
                renderServersTable();
                renderOverview();
                form.reset();
                document.getElementById('parsedFilesPreview').style.display = 'none';
                setTimeout(async () => {
                    showSection('topologies');
                    await loadAndDisplayTopologies();
                    document.querySelectorAll('.nav-item[data-target]').forEach(btn => {
                        btn.classList.toggle('active', btn.getAttribute('data-target') === 'topologies');
                    });
                }, 1000);
            } else if (uploadedCount > 0) {
                message.innerHTML = `✓ ${uploadedCount} dosya yüklendi<br>✗ Hata:<br>${failedFiles.map(f => `• ${f}`).join('<br>')}`;
                message.classList.add('warning');
                renderServersTable();
                renderOverview();
            } else {
                message.innerHTML = `✗ Dosya yüklenemedi:<br>${failedFiles.map(f => `• ${f}`).join('<br>')}`;
                message.classList.add('error');
            }
        });
    }
}

function attachFabActions() {
    document.getElementById('fabLogout')?.addEventListener('click', logout);
}

async function ensureAuth() {
    try {
        const res = await fetch(`${API_BASE}/auth/status`, { credentials: 'include' });
        if (!res.ok) {
            location.href = '/index.html';
            return;
        }
        const data = await res.json();
        if (!data.authenticated) {
            location.href = '/index.html';
            return;
        }
        const user = data.username || 'admin';
        const tag = document.getElementById('usernameTag');
        if (tag) tag.textContent = user;
        
        const currentUserEl = document.getElementById('currentUser');
        if (currentUserEl) currentUserEl.textContent = 'Hoş geldiniz, ' + user;
        
        const adminBtn = document.getElementById('adminTopBtn');
        if (adminBtn) {
            adminBtn.addEventListener('click', () => {
                showSection('admin');
                document.querySelectorAll('.nav-item[data-target]').forEach(btn => {
                    btn.classList.toggle('active', btn.getAttribute('data-target') === 'admin');
                });
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
    } catch (error) {
        console.error('Auth check failed', error);
        location.href = '/index.html';
    }
}

async function logout() {
    try {
        await fetch(`${API_BASE}/auth/logout`, { method: 'POST', credentials: 'include' });
    } catch (error) {
        console.error('Logout error:', error);
    }
    location.href = '/index.html';
}

function viewTopology(filename) {
    window.open(`/uploads/${filename}`, '_blank');
}

// ======== SUNUCULAR (SERVERS) ========
function attachServers() {
    const addServerBtn = document.getElementById('addServerBtn');
    const serverNameInput = document.getElementById('serverNameInput');
    const serverIpInput = document.getElementById('serverIpInput');
    const serversTable = document.getElementById('serversTable')?.querySelector('tbody');
    
    if (!serversTable) return;
    
    if (addServerBtn) {
        addServerBtn.addEventListener('click', () => {
            const name = serverNameInput?.value.trim();
            const ip = serverIpInput?.value.trim();
            
            if (!name || !ip) {
                alert('Lütfen sunucu adı ve IP adresini giriniz');
                return;
            }
            
            const server = { id: Date.now(), name, ip, critical: '-', date: new Date().toLocaleDateString('tr-TR') };
            allServers.push(server);
            
            serverNameInput.value = '';
            serverIpInput.value = '';
            renderServersTable();
            renderServerLibrary();
        });
    }
    
    renderServersTable();
}

function renderServersTable() {
    const serversTable = document.getElementById('serversTable')?.querySelector('tbody');
    if (!serversTable) return;
    
    serversTable.innerHTML = allServers.map(server => `
        <tr>
            <td><div style="display:flex;align-items:center;gap:0.5rem;"><div style="width:40px;height:40px;background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);border-radius:6px;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:1.2rem;box-shadow:0 2px 8px rgba(102, 126, 234, 0.4);">🖥️</div><div><strong>${server.name}</strong><div style="font-size:0.85em;color:var(--muted);">${server.ip}</div></div></div></td>
            <td><span class="badge" style="background:${server.critical === 'Yüksek' ? '#ff6b6b' : server.critical === 'Orta' ? '#ff9f43' : server.critical === 'Düşük' ? '#3ed598' : '#ccc'};color:white;font-weight:600;padding:6px 12px;border-radius:20px;box-shadow:0 2px 8px rgba(0,0,0,0.2);display:inline-flex;align-items:center;gap:6px;"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,0.8);"></span>${server.critical}</span></td>
            <td>${server.date}</td>
            <td><button class="btn btn-sm ghost" onclick="deleteServer(${server.id})"><i class="fa fa-trash"></i></button></td>
        </tr>
    `).join('');
}

function deleteServer(id) {
    if (confirm('Sunucuyu silmek istediğinize emin misiniz?')) {
        allServers = allServers.filter(s => s.id !== id);
        renderServersTable();
        renderOverview();
        renderServerLibrary();
    }
}

// ======== PORTLAR (PORTS) ========
function attachPorts() {
    const loadDefaultBtn = document.getElementById('loadDefaultPortsBtn');
    const searchInput = document.getElementById('portSearchInput');
    const addPortForm = document.getElementById('addPortForm');
    
    if (addPortForm) {
        addPortForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('portNameInput').value.trim();
            const number = document.getElementById('portNumberInput').value.trim();
            const color = document.getElementById('portColorInput').value;
            const shape = document.getElementById('portShapeInput').value;
            const description = document.getElementById('portDescInput').value.trim();
            
            if (!name || !number) {
                alert('Port adı ve numarası gereklidir!');
                return;
            }
            
            if (editingPortId) {
                // Düzenleme modu
                const portIndex = allPorts.findIndex(p => p.id === editingPortId);
                if (portIndex > -1) {
                    allPorts[portIndex] = {
                        id: editingPortId,
                        name,
                        number,
                        color,
                        shape,
                        description,
                        date: allPorts[portIndex].date
                    };
                    console.log('Port güncellendi:', allPorts[portIndex]);
                }
                editingPortId = null;
                addPortForm.querySelector('button[type="submit"]').textContent = 'Port Ekle';
            } else {
                // Ekleme modu
                const newPort = {
                    id: Date.now(),
                    name,
                    number,
                    color,
                    shape,
                    description,
                    date: new Date().toLocaleDateString('tr-TR')
                };
                allPorts.push(newPort);
                console.log('Yeni port eklendi:', newPort);
            }
            
            // Formu temizle
            addPortForm.reset();
            document.getElementById('portColorInput').value = '#3db8ff';
            document.getElementById('portShapeInput').value = 'circle';
            
            renderPortsTable(uniquePortsByNumber(allPorts));
            renderPortReference();
        });
    }
    
    if (loadDefaultBtn) {
        loadDefaultBtn.addEventListener('click', loadDefaultPorts);
    }
    
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const filtered = uniquePortsByNumber(allPorts).filter(p => 
                p.name.toLowerCase().includes(query) || 
                p.number.toLowerCase().includes(query) ||
                (p.description && p.description.toLowerCase().includes(query))
            );
            renderPortsTable(filtered);
        });
    }
    
    if (allPorts.length === 0) {
        loadDefaultPorts();
    } else {
        renderPortsTable(uniquePortsByNumber(allPorts));
    }
}

function loadDefaultPorts() {
    const uniqueDefaults = uniquePortsByNumber(defaultPorts);
    allPorts = uniqueDefaults.map((p, idx) => ({
        id: Date.now() + idx,
        name: p.name,
        number: p.number,
        shape: p.shape,
        color: p.color,
        description: p.description,
        date: new Date().toLocaleDateString('tr-TR')
    }));
    renderPortsTable(uniquePortsByNumber(allPorts));
    renderPortReference();
}

function renderPortsTable(portsToRender = null) {
    const portsTable = document.getElementById('portsTable')?.querySelector('tbody');
    if (!portsTable) return;
    
    const ports = portsToRender || uniquePortsByNumber(allPorts);
    
    if (ports.length === 0) {
        portsTable.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2rem;color:var(--muted);">Port bulunamadı</td></tr>';
        return;
    }
    
    portsTable.innerHTML = ports.map(port => `
        <tr>
            <td><strong>${port.name}</strong></td>
            <td><span class="badge" style="background:#ffffff;color:#333;font-weight:600;border:2px solid ${port.color};padding:6px 12px;border-radius:4px;">${port.number}</span></td>
            <td><span style="display:inline-block;padding:0.3rem 0.6rem;background:${port.color};color:white;border-radius:3px;font-size:0.85rem;font-weight:600;">${port.shape || 'circle'}</span></td>
            <td><span style="display:inline-block;width:20px;height:20px;background:${port.color};border-radius:3px;margin-right:5px;"></span><code style="background:#f0f0f0;padding:2px 6px;border-radius:3px;color:#333;font-size:0.85em;">${port.color}</code></td>
            <td style="max-width:200px;font-size:0.9em;">${port.description || '-'}</td>
            <td>
                <button class="btn btn-sm ghost" onclick="editPort(${port.id})" title="Düzenle"><i class="fa fa-edit"></i></button>
                <button class="btn btn-sm ghost" onclick="deletePort(${port.id})" title="Sil"><i class="fa fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

let editingPortId = null;

function editPort(id) {
    const port = allPorts.find(p => p.id === id);
    if (!port) return;
    
    editingPortId = id;
    document.getElementById('portNameInput').value = port.name;
    document.getElementById('portNumberInput').value = port.number;
    document.getElementById('portColorInput').value = port.color;
    document.getElementById('portShapeInput').value = port.shape || 'circle';
    document.getElementById('portDescInput').value = port.description || '';
    
    // Formu açık al
    const form = document.getElementById('addPortForm');
    form.scrollIntoView({ behavior: 'smooth' });
    form.querySelector('button[type="submit"]').textContent = 'Portu Güncelle';
    
    console.log('Düzenlenen port:', port);
}

function deletePort(id) {
    if (confirm('Portu silmek istediğinize emin misiniz?')) {
        allPorts = allPorts.filter(p => p.id !== id);
        renderPortsTable();
        renderPortReference();
        console.log('Port silindi, ID:', id);
    }
}

function renderPortReference() {
    const container = document.getElementById('portReferenceList');
    if (!container) return;
    
    const uniquePorts = uniquePortsByNumber(allPorts);
    container.innerHTML = uniquePorts.map(p => `
        <div draggable="true" data-port-id="${p.id}" class="port-library-item"
             style="display:flex;align-items:center;gap:0.6rem;padding:0.6rem;border-radius:5px;background:rgba(${p.color === '#4CAF50' ? '76,175,80' : p.color === '#2196F3' ? '33,150,243' : p.color === '#FF9800' ? '255,152,0' : p.color === '#FF5722' ? '255,87,34' : p.color === '#9C27B0' ? '156,39,176' : p.color === '#3F51B5' ? '63,81,181' : p.color === '#00BCD4' ? '0,188,212' : p.color === '#607D8B' ? '96,125,139' : p.color === '#795548' ? '121,85,72' : p.color === '#E91E63' ? '233,30,99' : p.color === '#8BC34A' ? '139,195,74' : p.color === '#009688' ? '0,150,136' : p.color === '#FF6F00' ? '255,111,0' : p.color === '#0277BD' ? '2,119,189' : p.color === '#D32F2F' ? '211,47,47' : p.color === '#C62828' ? '198,40,40' : p.color === '#D50000' ? '213,0,0' : p.color === '#EF5350' ? '239,83,80' : p.color === '#AB47BC' ? '171,71,188' : p.color === '#42A5F5' ? '66,165,245' : p.color === '#5C6BC0' ? '92,107,192' : p.color === '#7E57C2' ? '126,87,194' : p.color === '#26A69A' ? '38,166,154' : p.color === '#66BB6A' ? '102,187,106' : '33,150,243'},0.15);border:1.5px solid ${p.color};cursor:grab;transition:all 0.2s;user-select:none;"
             onmouseover="this.style.background='${p.color}30';this.style.boxShadow='0 2px 8px ${p.color}55';"
             onmouseout="this.style.background='rgba(33,150,243,0.15)';this.style.boxShadow='none';">
            <span style="display:inline-block;width:24px;height:24px;border-radius:50%;background:${p.color};border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.3);flex-shrink:0;"></span>
            <div style="flex:1;min-width:0;">
                <div style="font-size:0.85rem;font-weight:600;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${p.name}</div>
                <div style="font-size:0.75rem;color:var(--muted);">🔌 ${p.number}</div>
            </div>
        </div>
    `).join('');
    
    // Event listeners ekle
    container.querySelectorAll('.port-library-item').forEach(item => {
        item.addEventListener('dragstart', handlePortDragStart);
        item.addEventListener('dragend', (e) => {
            e.target.style.opacity = '1';
        });
    });
}

function renderServerLibrary() {
    const container = document.getElementById('serverLibraryList');
    if (!container) return;
    
    const criticalityColors = {
        'Yüksek': '#ff6b6b',
        'Orta': '#ff9f43',
        'Düşük': '#3ed598'
    };
    
    container.innerHTML = allServers.map(s => {
        const critColor = criticalityColors[s.critical] || '#ccc';
        return `
            <div draggable="true" data-server-id="${s.id}" class="server-library-item"
                 style="display:flex;align-items:center;gap:0.6rem;padding:0.6rem;border-radius:5px;background:rgba(102,126,234,0.1);border:1.5px solid rgba(102,126,234,0.3);cursor:grab;transition:all 0.2s;user-select:none;"
                 onmouseover="this.style.background='rgba(102,126,234,0.2)';this.style.boxShadow='0 2px 8px rgba(102,126,234,0.4)';"
                 onmouseout="this.style.background='rgba(102,126,234,0.1)';this.style.boxShadow='none';">
                <div style="display:flex;align-items:center;justify-content:center;width:28px;height:28px;background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);border-radius:4px;color:white;font-weight:bold;font-size:1rem;flex-shrink:0;box-shadow:0 1px 3px rgba(0,0,0,0.2);">🖥️</div>
                <div style="flex:1;min-width:0;">
                    <div style="font-size:0.85rem;font-weight:600;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${s.name}</div>
                    <div style="font-size:0.75rem;color:var(--muted);display:flex;gap:0.3rem;align-items:center;">
                        <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:${critColor};"></span>
                        ${s.ip}
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // Event listeners ekle
    container.querySelectorAll('.server-library-item').forEach(item => {
        item.addEventListener('dragstart', handleServerDragStart);
        item.addEventListener('dragend', (e) => {
            e.target.style.opacity = '1';
        });
    });
}

// Drag-Drop İşleyicileri
let draggedPort = null;
let draggedServer = null;

function handlePortDragStart(event) {
    try {
        const element = event.currentTarget;
        const portId = parseInt(element.getAttribute('data-port-id'));
        draggedPort = allPorts.find(p => p.id === portId);
        
        if (draggedPort) {
            event.dataTransfer.effectAllowed = 'copy';
            event.dataTransfer.setData('type', 'port');
            event.dataTransfer.setData('portId', portId.toString());
            element.style.opacity = '0.6';
            console.log('Port sürükleniyor:', draggedPort.name);
        }
    } catch (e) {
        console.error('Port drag start hatası:', e);
    }
}

function handleServerDragStart(event) {
    try {
        const element = event.currentTarget;
        const serverId = parseInt(element.getAttribute('data-server-id'));
        draggedServer = allServers.find(s => s.id === serverId);
        
        if (draggedServer) {
            event.dataTransfer.effectAllowed = 'copy';
            event.dataTransfer.setData('type', 'server');
            event.dataTransfer.setData('serverId', serverId.toString());
            element.style.opacity = '0.6';
            console.log('Sunucu sürükleniyor:', draggedServer.name);
        }
    } catch (e) {
        console.error('Sunucu drag start hatası:', e);
    }
}

function setupDrawioDropZone() {
    const drawioContainer = document.getElementById('drawioContainer');
    if (!drawioContainer) return;
    
    console.log('Draw.io drop zone kuruldu');
    
    drawioContainer.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        drawioContainer.style.backgroundColor = 'rgba(61, 184, 255, 0.1)';
        drawioContainer.style.borderColor = 'var(--accent)';
        drawioContainer.style.borderWidth = '2px';
    });
    
    drawioContainer.addEventListener('dragleave', (e) => {
        if (e.target === drawioContainer) {
            drawioContainer.style.backgroundColor = '';
            drawioContainer.style.borderColor = '';
            drawioContainer.style.borderWidth = '';
        }
    });
    
    drawioContainer.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        drawioContainer.style.backgroundColor = '';
        drawioContainer.style.borderColor = '';
        drawioContainer.style.borderWidth = '';
        
        console.log('Drop event tetiklendi - draggedPort:', draggedPort, 'draggedServer:', draggedServer);
        
        if (draggedPort) {
            console.log('Port eklenmeye hazır:', draggedPort);
            addPortToCanvas(draggedPort);
            draggedPort = null;
        } else if (draggedServer) {
            console.log('Sunucu eklenmeye hazır:', draggedServer);
            addServerToCanvas(draggedServer);
            draggedServer = null;
        } else {
            console.log('Hiçbir şey sürüklenmedi');
        }
    });
}

function addPortToCanvas(port) {
    const canvas = document.createElement('div');
    canvas.style.position = 'fixed';
    canvas.style.bottom = '1rem';
    canvas.style.right = '1rem';
    canvas.style.padding = '1rem';
    canvas.style.background = 'var(--card)';
    canvas.style.border = '1px solid var(--border)';
    canvas.style.borderRadius = '0.5rem';
    canvas.style.zIndex = '1000';
    canvas.style.maxWidth = '300px';
    canvas.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    canvas.style.animation = 'slideUp 0.3s ease';
    
    canvas.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.8rem;">
            <h4 style="margin:0;display:flex;align-items:center;gap:0.5rem;">
                <span style="display:inline-block;width:20px;height:20px;border-radius:50%;background:${port.color};"></span>
                ${port.name}
            </h4>
            <button onclick="this.parentElement.parentElement.remove()" style="background:none;border:none;cursor:pointer;color:var(--muted);font-size:1.2em;padding:0;width:24px;height:24px;display:flex;align-items:center;justify-content:center;">×</button>
        </div>
        <p style="margin:0.5rem 0;font-size:0.9rem;color:var(--text);">
            <strong>Port Numarası:</strong> ${port.number}
        </p>
        <p style="margin:0.5rem 0;font-size:0.9rem;color:var(--text);">
            <strong>Renk:</strong> <code style="background:#f0f0f0;padding:2px 6px;border-radius:3px;color:${port.color};">${port.color}</code>
        </p>
        <p style="margin:0.5rem 0;font-size:0.85rem;color:var(--muted);">
            ${port.description}
        </p>
        <div style="margin-top:1rem;padding-top:0.8rem;border-top:1px solid var(--border);">
            <p style="margin:0.5rem 0;font-size:0.8rem;color:var(--muted);text-align:center;">
                ✓ Port çizime eklenmiştir. Daha fazla eklemeyi devam edebilirsiniz.
            </p>
        </div>
    `;
    
    document.body.appendChild(canvas);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        canvas.style.animation = 'slideDown 0.3s ease';
        setTimeout(() => canvas.remove(), 300);
    }, 3000);
}

function addServerToCanvas(server) {
    const canvas = document.createElement('div');
    canvas.style.position = 'fixed';
    canvas.style.bottom = '1rem';
    canvas.style.right = '1rem';
    canvas.style.padding = '1rem';
    canvas.style.background = 'var(--card)';
    canvas.style.border = '1px solid var(--border)';
    canvas.style.borderRadius = '0.5rem';
    canvas.style.zIndex = '1000';
    canvas.style.maxWidth = '300px';
    canvas.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    canvas.style.animation = 'slideUp 0.3s ease';
    
    const criticalityColors = {
        'Yüksek': '#ff6b6b',
        'Orta': '#ff9f43',
        'Düşük': '#3ed598',
        '-': '#ccc'
    };
    
    canvas.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.8rem;">
            <h4 style="margin:0;display:flex;align-items:center;gap:0.5rem;">
                <span style="display:inline-block;width:28px;height:28px;background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);border-radius:4px;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:0.9rem;">🖥️</span>
                ${server.name}
            </h4>
            <button onclick="this.parentElement.parentElement.remove()" style="background:none;border:none;cursor:pointer;color:var(--muted);font-size:1.2em;padding:0;width:24px;height:24px;display:flex;align-items:center;justify-content:center;">×</button>
        </div>
        <p style="margin:0.5rem 0;font-size:0.9rem;color:var(--text);">
            <strong>IP Adresi:</strong> ${server.ip}
        </p>
        <p style="margin:0.5rem 0;font-size:0.9rem;color:var(--text);">
            <strong>Kritiklik:</strong> <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${criticalityColors[server.critical]};margin-right:0.3rem;"></span>${server.critical}
        </p>
        <p style="margin:0.5rem 0;font-size:0.9rem;color:var(--text);">
            <strong>Tarih:</strong> ${server.date}
        </p>
        <div style="margin-top:1rem;padding-top:0.8rem;border-top:1px solid var(--border);">
            <p style="margin:0.5rem 0;font-size:0.8rem;color:var(--muted);text-align:center;">
                ✓ Sunucu çizime eklenmiştir. Daha fazla eklemeyi devam edebilirsiniz.
            </p>
        </div>
    `;
    
    document.body.appendChild(canvas);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        canvas.style.animation = 'slideDown 0.3s ease';
        setTimeout(() => canvas.remove(), 300);
    }, 3000);
}

// ======== DRAW.IO ENTEGRASYONU ========
let currentDrawingData = null;
let currentEditTopology = null; // düzenleme modu için

function attachDrawio() {
    const iframe = document.getElementById('drawioFrame');
    const saveBtn = document.getElementById('saveDrawingBtn');
    const newBtn = document.getElementById('newDrawingBtn');
    const togglePortListBtn = document.getElementById('togglePortListBtn');
    const portReferencePanel = document.getElementById('portReferencePanel');
    const saveForm = document.getElementById('saveDrawingForm');
    const cancelBtn = document.getElementById('cancelSaveBtn');
    const topologySaveForm = document.getElementById('topologySaveForm');
    
    populateDrawingSelects();
    renderPortReference();
    renderServerLibrary();
    attachTopologyBuilder();
    renderTopologyConnections();
    
    if (iframe) {
        setupDrawioDropZone();
    }
    
    if (togglePortListBtn && portReferencePanel) {
        togglePortListBtn.addEventListener('click', () => {
            portReferencePanel.style.display = portReferencePanel.style.display === 'none' ? 'block' : 'none';
        });
    }
    
    window.addEventListener('message', function(evt) {
        if (evt.data.length > 0) {
            try {
                const msg = JSON.parse(evt.data);
                if (msg.event === 'save' || msg.event === 'export') {
                    currentDrawingData = msg.xml;
                }
                if (msg.event === 'init') {
                    iframe.contentWindow.postMessage(JSON.stringify({action: 'load', autosave: 1}), '*');
                }
            } catch (e) {
                console.error('Draw.io message error:', e);
            }
        }
    });
    
    if (newBtn) {
        newBtn.addEventListener('click', () => {
            if (confirm('Mevcut çizimi temizlemek istediğinize emin misiniz?')) {
                iframe.contentWindow.postMessage(JSON.stringify({action: 'template'}), '*');
                currentDrawingData = null;
            }
        });
    }
    
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            iframe.contentWindow.postMessage(JSON.stringify({action: 'export', format: 'xml'}), '*');
            setTimeout(() => {
                if (saveForm) {
                    saveForm.style.display = 'block';
                    saveForm.scrollIntoView({ behavior: 'smooth' });
                }
            }, 500);
        });
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            if (saveForm) saveForm.style.display = 'none';
            if (topologySaveForm) topologySaveForm.reset();
        });
    }
    
    if (topologySaveForm) {
        topologySaveForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const message = document.getElementById('saveDrawingMessage');
            if (!message) return;
            
            message.textContent = '';
            message.className = 'message';
            
            if (!currentEditTopology && !currentDrawingData) {
                message.textContent = 'Lütfen önce bir çizim yapınız';
                message.classList.add('error');
                return;
            }
            
            const topologyName = document.getElementById('drawingTopologyName')?.value?.trim();
            const serverName = document.getElementById('drawingServerName')?.value;
            const serverIp = document.getElementById('drawingServerIp')?.value;
            const dept = document.getElementById('drawingDept')?.value;
            const platform = document.getElementById('drawingPlatform')?.value;
            const critical = document.getElementById('drawingCritical')?.value;
            const note = document.getElementById('drawingNote')?.value || '';
            
            if (!topologyName || !serverName || !serverIp || !dept || !platform || !critical) {
                message.textContent = 'Lütfen tüm zorunlu alanları doldurun';
                message.classList.add('error');
                return;
            }
            
            const drawingBlob = currentDrawingData ? new Blob([currentDrawingData], { type: 'text/xml' }) : null;
            const fileName = `${topologyName.replace(/\s+/g, '_')}_topology.xml`;
            
            const formData = new FormData();
            if (drawingBlob) formData.append('files', drawingBlob, fileName);
            formData.append('topologyName', topologyName);
            formData.append('server', serverName);
            formData.append('ip', serverIp);
            formData.append('dept', dept);
            formData.append('platform', platform);
            formData.append('critical', critical);
            formData.append('note', note);
            if (currentEditTopology?.id) {
                formData.append('id', currentEditTopology.id);
            }
            
            try {
                const response = await fetch('/api/topology/upload', {
                    method: 'POST',
                    credentials: 'include',
                    body: formData
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    message.textContent = currentEditTopology ? 'Topoloji güncellendi!' : 'Topoloji başarıyla kaydedildi!';
                    message.classList.add('success');
                    
                    const serverExists = allServers.some(s => s.name === serverName && s.ip === serverIp);
                    if (!serverExists) {
                        allServers.push({
                            id: Date.now(),
                            name: serverName,
                            ip: serverIp,
                            critical: critical,
                            date: new Date().toLocaleDateString('tr-TR')
                        });
                        renderServersTable();
                        renderOverview();
                    }
                    
                    currentEditTopology = null;
                    topologySaveForm.reset();
                    currentDrawingData = null;
                    
                    setTimeout(async () => {
                        if (saveForm) saveForm.style.display = 'none';
                        showSection('topologies');
                        await loadAndDisplayTopologies();
                        document.querySelectorAll('.nav-item[data-target]').forEach(btn => {
                            btn.classList.toggle('active', btn.getAttribute('data-target') === 'topologies');
                        });
                    }, 1500);
                } else {
                    message.textContent = data.message || 'Kaydetme başarısız';
                    message.classList.add('error');
                }
            } catch (error) {
                message.textContent = 'Bir hata oluştu: ' + error.message;
                message.classList.add('error');
            }
        });
    }
}

function populateDrawingSelects() {
    const deptSelect = document.getElementById('drawingDept');
    const platformSelect = document.getElementById('drawingPlatform');
    const critSelect = document.getElementById('drawingCritical');
    
    if (deptSelect) {
        deptSelect.innerHTML = '<option value="">Şeflik seçiniz...</option>' +
            sampleSheflikler.map(d => `<option value="${d.name}">${d.name}</option>`).join('');
    }
    if (platformSelect) {
        platformSelect.innerHTML = '<option value="">İşletim sistemi seçiniz...</option>' +
            platformOptions.map(p => `<option value="${p}">${p}</option>`).join('');
    }
    if (critSelect) {
        critSelect.innerHTML = '<option value="">Kritiklik seçiniz...</option>' +
            criticalOptions.map(c => `<option value="${c}">${c}</option>`).join('');
    }
}

// ======== EXCEL / PDF EXPORT ========
function attachExportFeatures() {
    document.getElementById('exportExcelBtn')?.addEventListener('click', exportToExcel);
    document.getElementById('exportPdfBtn')?.addEventListener('click', exportToPdf);
}

function exportToExcel() {
    let csv = 'Sunucu Adı,IP Adresi,Şeflik,Platform,Kritiklik,Tarih,Ekleyen Kullanıcı\n';
    
    allTopologies.forEach(top => {
        const row = [
            top.server || '',
            top.ip || '',
            top.dept || '',
            top.platform || '',
            top.critical || '',
            top.date || '',
            top.user || ''
        ].map(v => `"${v}"`).join(',');
        csv += row + '\n';
    });
    
    const link = document.createElement('a');
    link.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    link.download = `Sunucular_${new Date().toLocaleDateString('tr-TR')}.csv`;
    link.click();
}

function exportToPdf() {
    const printWindow = window.open('', '_blank');
    let html = '<h2>Sunucular Raporu</h2>';
    html += '<table border="1" cellpadding="10"><tr><th>Sunucu</th><th>IP</th><th>Şeflik</th><th>Platform</th><th>Kritiklik</th><th>Tarih</th><th>Kullanıcı</th></tr>';
    
    allTopologies.forEach(top => {
        html += `<tr>
            <td>${top.server || ''}</td>
            <td>${top.ip || ''}</td>
            <td>${top.dept || ''}</td>
            <td>${top.platform || ''}</td>
            <td>${top.critical || ''}</td>
            <td>${top.date || ''}</td>
            <td>${top.user || ''}</td>
        </tr>`;
    });
    
    html += '</table>';
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
}

// ======== TOPOLOGY BUILDER ========
function attachTopologyBuilder() {
    const sourceType = document.getElementById('sourceType');
    const destType = document.getElementById('destType');
    const sourceServerSearch = document.getElementById('sourceServerSearch');
    const destServerSearch = document.getElementById('destServerSearch');
    const sourceServerId = document.getElementById('sourceServerId');
    const destServerId = document.getElementById('destServerId');
    const sourceServerList = document.getElementById('sourceServerList');
    const destServerList = document.getElementById('destServerList');
    const addConnectionBtn = document.getElementById('addConnectionBtn');
    const portSelectContainer = document.getElementById('portSelectContainer');
    const selectedPortsPreview = document.getElementById('selectedPortsPreview');
    const portSearchInput = document.getElementById('canvasPortSearchInput');
    
    if (!sourceType || !destType || !addConnectionBtn) return;
    
    // ===== AUTOCOMPLETE SUNUCU ARAMA =====
    const setupServerAutocomplete = (inputEl, hiddenIdEl, listEl) => {
        // İlk render - tüm sunucuları göster
        const renderServerList = (servers) => {
            if (servers.length === 0) {
                listEl.innerHTML = '<div style="padding:0.8rem;color:var(--muted);text-align:center;">Sonuç bulunamadı</div>';
                return;
            }
            
            listEl.innerHTML = servers.map(s => `
                <div data-id="${s.id}" data-name="${s.name}" data-ip="${s.ip}" 
                     style="padding:0.6rem 0.8rem;cursor:pointer;border-bottom:1px solid var(--border);transition:background 0.2s;color:#0f172a;"
                     onmouseover="this.style.background='rgba(61,184,255,0.1)'"
                     onmouseout="this.style.background='transparent'">
                    <div style="font-weight:600;font-size:0.9rem;">🖥️ ${s.name}</div>
                    <div style="font-size:0.8rem;color:var(--muted);">${s.ip}</div>
                </div>
            `).join('');
            
            // Liste itemlarına click eventi
            listEl.querySelectorAll('[data-id]').forEach(item => {
                item.addEventListener('click', () => {
                    hiddenIdEl.value = item.dataset.id;
                    inputEl.value = `${item.dataset.name} (${item.dataset.ip})`;
                    listEl.style.display = 'none';
                });
            });
        };
        
        // Input'a focus olunca dropdown'u aç
        inputEl.addEventListener('focus', () => {
            renderServerList(allServers);
            listEl.style.display = 'block';
        });
        
        // Input'a tıklanınca dropdown'u aç/kapat
        inputEl.addEventListener('click', () => {
            renderServerList(allServers);
            listEl.style.display = listEl.style.display === 'none' ? 'block' : 'none';
        });
        
        inputEl.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            
            if (searchTerm.length === 0) {
                renderServerList(allServers);
                listEl.style.display = 'block';
                return;
            }
            
            const filtered = allServers.filter(s => 
                s.name.toLowerCase().includes(searchTerm) || 
                s.ip.includes(searchTerm)
            );
            
            renderServerList(filtered);
            listEl.style.display = 'block';
        });
        
        // Dropdown dışına tıklanınca kapat
        document.addEventListener('click', (e) => {
            if (!inputEl.contains(e.target) && !listEl.contains(e.target)) {
                listEl.style.display = 'none';
            }
        });
    };
    
    setupServerAutocomplete(sourceServerSearch, sourceServerId, sourceServerList);
    setupServerAutocomplete(destServerSearch, destServerId, destServerList);
    
    // Sunucu dropdown ok işaretlerine tıklama olayları
    const sourceServerDropdownIcon = document.getElementById('sourceServerDropdownIcon');
    const destServerDropdownIcon = document.getElementById('destServerDropdownIcon');
    
    if (sourceServerDropdownIcon) {
        sourceServerDropdownIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            const isVisible = sourceServerList.style.display === 'block';
            if (isVisible) {
                sourceServerList.style.display = 'none';
            } else {
                sourceServerSearch.dispatchEvent(new Event('focus'));
                sourceServerSearch.focus();
            }
        });
    }
    
    if (destServerDropdownIcon) {
        destServerDropdownIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            const isVisible = destServerList.style.display === 'block';
            if (isVisible) {
                destServerList.style.display = 'none';
            } else {
                destServerSearch.dispatchEvent(new Event('focus'));
                destServerSearch.focus();
            }
        });
    }
    
    // ===== PORT DROPDOWN VE TAG SİSTEMİ =====
    const portDropdown = document.getElementById('portDropdown');
    const selectedPortsTags = document.getElementById('selectedPortsTags');
    let selectedPorts = []; // Seçilen portlar
    
    const renderPortList = (searchTerm = '') => {
        const allPortsList = uniquePortsByNumber([...defaultPorts, ...allPorts]);
        const filtered = searchTerm 
            ? allPortsList.filter(p => 
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.number.toString().includes(searchTerm)
              )
            : allPortsList;
        
        if (filtered.length === 0) {
            portDropdown.innerHTML = '<div style="padding:0.8rem;color:var(--muted);text-align:center;font-size:0.85rem;">Port bulunamadı</div>';
            return;
        }
        
        portDropdown.innerHTML = filtered.map(p => `
            <div class="port-list-item" data-port-id="${p.number}" data-port-name="${p.name}" data-port-number="${p.number}" data-port-color="${p.color}"
                 style="display:flex;align-items:center;gap:0.6rem;padding:0.6rem 0.8rem;cursor:pointer;border-bottom:1px solid var(--border);transition:all 0.15s;background:#ffffff;color:#0f172a;"
                 onmouseover="this.style.background='rgba(61,184,255,0.08)'"
                 onmouseout="this.style.background='#ffffff'">
                <div style="width:12px;height:12px;background:${p.color};border-radius:50%;flex-shrink:0;"></div>
                <span style="font-size:0.85rem;font-weight:700;min-width:45px;">${p.number}</span>
                <span style="font-size:0.85rem;font-weight:500;flex:1;color:var(--text);">${p.name}</span>
                <i class="fa fa-check-circle" style="color:${p.color};font-size:1rem;display:${selectedPorts.some(sp => String(sp.number) === String(p.number)) ? 'block' : 'none'};"></i>
            </div>
        `).join('');
        
        // Port list item event listeners
        document.querySelectorAll('.port-list-item').forEach(item => {
            item.addEventListener('click', () => {
                const portId = String(item.dataset.portId);
                const portName = item.dataset.portName;
                const portNumber = String(item.dataset.portNumber);
                const portColor = item.dataset.portColor;
                
                console.log('Port seçildi:', { portId, portName, portNumber, portColor });
                
                // Eğer zaten seçiliyse kaldır
                const existingIndex = selectedPorts.findIndex(p => String(p.number) === String(portNumber));
                if (existingIndex > -1) {
                    selectedPorts.splice(existingIndex, 1);
                    console.log('Port kaldırıldı:', portNumber);
                } else {
                    selectedPorts.push({
                        id: portId,
                        name: portName,
                        number: portNumber,
                        color: portColor
                    });
                    console.log('Port eklendi:', { portId, portName, portNumber });
                }
                
                console.log('selectedPorts sonrası (toplam:', selectedPorts.length, ')', selectedPorts);
                
                // Listeyi yeniden renderla (checkmark göstermek için)
                renderPortList(portSearchInput.value);
                updateSelectedPortsTags();
            });
        });
    };
    
    const updateSelectedPortsTags = () => {
        console.log('updateSelectedPortsTags çağrıldı, selectedPorts:', selectedPorts);
        if (selectedPorts.length === 0) {
            selectedPortsTags.innerHTML = '<span style="color:var(--muted);font-size:0.85rem;">Henüz port seçilmedi</span>';
            return;
        }
        
        selectedPortsTags.innerHTML = selectedPorts.map(p => `
            <span style="display:inline-flex;align-items:center;gap:0.4rem;padding:0.35rem 0.65rem;background:${p.color};color:white;border-radius:6px;font-size:0.8rem;font-weight:700;box-shadow:0 2px 4px rgba(0,0,0,0.1);">
                ${p.number} - ${p.name}
                <i class="fa fa-times-circle" style="cursor:pointer;opacity:0.9;font-size:0.9rem;margin-left:0.2rem;"></i>
            </span>
        `).join('');
        
        // X iconlarına click event ekle
        selectedPortsTags.querySelectorAll('.fa-times-circle').forEach((icon, index) => {
            icon.addEventListener('click', (e) => {
                e.stopPropagation();
                const portToRemove = selectedPorts[index];
                selectedPorts = selectedPorts.filter((p, idx) => idx !== index);
                console.log('Port X ile silindi:', portToRemove);
                renderPortList(portSearchInput.value);
                updateSelectedPortsTags();
            });
        });
    };
    
    // Port input'a tıklanınca dropdown'u aç/kapat
    portSearchInput.addEventListener('click', () => {
        renderPortList(portSearchInput.value);
        portDropdown.style.display = portDropdown.style.display === 'none' ? 'block' : 'none';
    });
    
    // Port input'a focus olunca dropdown'u aç
    portSearchInput.addEventListener('focus', () => {
        renderPortList(portSearchInput.value);
        portDropdown.style.display = 'block';
    });
    
    // Port arama
    portSearchInput.addEventListener('input', (e) => {
        renderPortList(e.target.value);
        portDropdown.style.display = 'block';
    });
    
    // Port dropdown ok işaretine tıklama olayı
    const portDropdownIcon = document.getElementById('portDropdownIcon');
    if (portDropdownIcon) {
        portDropdownIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            const isVisible = portDropdown.style.display === 'block';
            portDropdown.style.display = isVisible ? 'none' : 'block';
            if (!isVisible) {
                renderPortList(''); // Tüm portları göster
                portSearchInput.focus();
            }
        });
    }
    
    // Dropdown dışına tıklanınca kapat
    document.addEventListener('click', (e) => {
        if (!portSearchInput.contains(e.target) && !portDropdown.contains(e.target) && !portDropdownIcon?.contains(e.target)) {
            portDropdown.style.display = 'none';
        }
    });
    
    // ===== SOURCE TÜRÜ DEĞIŞIMI =====
    sourceType.addEventListener('change', () => {
        const sourceServerField = document.getElementById('sourceServerField');
        const sourceExternalField = document.getElementById('sourceExternalField');
        const sourceNameField = document.getElementById('sourceNameField');
        
        if (sourceType.value === 'server') {
            sourceServerField.style.display = 'block';
            sourceExternalField.style.display = 'none';
            sourceNameField.style.display = 'none';
        } else {
            sourceServerField.style.display = 'none';
            sourceExternalField.style.display = 'block';
            sourceNameField.style.display = 'block';
        }
    });
    
    // ===== DESTINATION TÜRÜ DEĞIŞIMI =====
    destType.addEventListener('change', () => {
        const destServerField = document.getElementById('destServerField');
        const destExternalField = document.getElementById('destExternalField');
        const destNameField = document.getElementById('destNameField');
        
        if (destType.value === 'server') {
            destServerField.style.display = 'block';
            destExternalField.style.display = 'none';
            destNameField.style.display = 'none';
        } else {
            destServerField.style.display = 'none';
            destExternalField.style.display = 'block';
            destNameField.style.display = 'block';
        }
    });
    
    // ===== BAĞLANTI EKLE BUTONU =====
    addConnectionBtn.addEventListener('click', () => {
        let source = null, destination = null;
        
        const note = document.getElementById('connectionNote').value.trim();
        const includeFirewall = document.getElementById('includeFirewall').checked;
        const connectionMessage = document.getElementById('connectionMessage');
        
        // Mesajı temizle
        if (connectionMessage) connectionMessage.textContent = '';
        
        console.log('=== BAĞLANTI EKLEME BAŞLADI ===');
        console.log('Seçilen portlar:', selectedPorts);
        console.log('Port sayısı:', selectedPorts.length);
        
        // Port validasyonu
        if (selectedPorts.length === 0) {
            if (connectionMessage) connectionMessage.textContent = '⚠️ En az bir port seçiniz';
            console.warn('⚠️ Port seçilmedi!');
            return;
        }
        
        // Source bilgisi al
        if (sourceType.value === 'server') {
            const serverId = parseInt(document.getElementById('sourceServerId').value);
            const server = allServers.find(s => s.id === serverId);
            if (!server) {
                if (connectionMessage) connectionMessage.textContent = '❌ Lütfen kaynak sunucusu seçin';
                return;
            }
            source = {
                type: 'server',
                id: serverId,
                name: server.name,
                ip: server.ip
            };
        } else {
            const sourceIp = document.getElementById('sourceIp').value.trim();
            const sourceName = document.getElementById('sourceName').value.trim();
            if (!sourceIp) {
                if (connectionMessage) connectionMessage.textContent = '❌ Lütfen kaynak IP adresini girin';
                return;
            }
            source = {
                type: 'external',
                name: sourceName || 'Dış IP',
                ip: sourceIp
            };
        }
        
        // Destination bilgisi al
        if (destType.value === 'server') {
            const serverId = parseInt(document.getElementById('destServerId').value);
            if (!serverId) {
                if (connectionMessage) connectionMessage.textContent = '❌ Lütfen hedef sunucusunu seçin';
                return;
            }
            const server = allServers.find(s => s.id === serverId);
            destination = {
                type: 'server',
                id: serverId,
                name: server.name,
                ip: server.ip
            };
        } else {
            const destIp = document.getElementById('destIp').value.trim();
            const destName = document.getElementById('destName').value.trim();
            if (!destIp) {
                if (connectionMessage) connectionMessage.textContent = '❌ Lütfen hedef IP adresini girin';
                return;
            }
            destination = {
                type: 'external',
                name: destName || 'Dış IP',
                ip: destIp
            };
        }
        
        // Bağlantı oluştur (firewall optional)
        console.log('Eklenecek portlar:', selectedPorts);
        const connection = {
            id: Date.now(),
            source: source,
            destination: destination,
            ports: selectedPorts.map(p => ({...p})), // Derin kopya
            firewall: includeFirewall ? { name: 'Firewall', ip: null } : null,
            note: note
        };
        console.log('Oluşturulan bağlantı:', connection);
        
        canvasData.connections.push(connection);
        
        // Formu temizle
        document.getElementById('sourceServerId').value = '';
        document.getElementById('destServerId').value = '';
        document.getElementById('sourceServerSearch').value = '';
        document.getElementById('destServerSearch').value = '';
        document.getElementById('sourceIp').value = '';
        document.getElementById('destIp').value = '';
        document.getElementById('sourceName').value = '';
        document.getElementById('destName').value = '';
        document.getElementById('connectionNote').value = '';
        document.getElementById('canvasPortSearchInput').value = '';
        
        // Seçilen portları temizle
        selectedPorts = [];
        updateSelectedPortsTags();
        
        renderTopologyConnections();
        renderNetworkDiagram(); // Görsel diyagramı güncelle

        // Başarı mesajını göster
        if (connectionMessage) {
            connectionMessage.textContent = '✓ Bağlantı başarıyla eklendi';
            setTimeout(() => { connectionMessage.textContent = ''; }, 3000);
        }
    });
}

function renderTopologyConnections() {
    const container = document.getElementById('topologyConnectionsList');
    if (!container) return;
    
    if (canvasData.connections.length === 0) {
        container.innerHTML = '<p style="color:var(--muted);font-size:0.9rem;text-align:center;padding:1rem;">Henüz bağlantı yok</p>';
        return;
    }
    
    container.innerHTML = canvasData.connections.map((conn, idx) => {
        const getSourceIcon = () => conn.source.type === 'server' ? '🖥️' : '🌐';
        const getDestIcon = () => conn.destination.type === 'server' ? '🖥️' : '🌐';
        
        console.log(`Bağlantı ${idx} portları:`, conn.ports);
        
        // Portları inline olarak göster
        const portsHtml = conn.ports && conn.ports.length > 0 
            ? conn.ports.map(p => `<span style="background:${p.color};color:white;padding:0.3rem 0.6rem;border-radius:0.4rem;font-size:0.85rem;font-weight:800;display:inline-flex;gap:0.3rem;align-items:center;letter-spacing:0.01em;box-shadow:0 2px 4px rgba(0,0,0,0.15);">${p.number}<span style="font-weight:700;color:#f8fafc;opacity:0.95;white-space:nowrap;">${p.name || ''}</span></span>`).join(' ')
            : '<span style="color:#ef4444;font-size:0.8rem;font-weight:600;">⚠️ Port Yok</span>';
        
        // Kompakt tek satır düzen
        let html = '';
        if (conn.firewall) {
            html = `
                <div style="display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;">
                    <span style="color:var(--accent);font-weight:600;font-size:0.85rem;">${getSourceIcon()} ${conn.source.name}</span>
                    <span style="color:var(--muted);font-size:0.75rem;">(${conn.source.ip})</span>
                    <i class="fa fa-arrow-right" style="color:var(--muted);font-size:0.7rem;"></i>
                    <span style="display:inline-flex;align-items:center;gap:0.45rem;background:linear-gradient(135deg,#1d4ed8,#2563eb);color:#e8f0ff;padding:0.32rem 0.7rem;border-radius:0.45rem;font-size:0.85rem;font-weight:820;box-shadow:0 3px 10px rgba(37,99,235,0.35);">
                        🧱 <span style="letter-spacing:0.03em;">FW</span>
                    </span>
                    <i class="fa fa-arrow-right" style="color:var(--muted);font-size:0.7rem;"></i>
                    <span style="color:#4CAF50;font-weight:600;font-size:0.85rem;">${getDestIcon()} ${conn.destination.name}</span>
                    <span style="color:var(--muted);font-size:0.75rem;">(${conn.destination.ip})</span>
                    <span style="margin-left:0.5rem;color:var(--muted);font-size:0.7rem;font-weight:600;">→</span>
                    ${portsHtml}
                </div>
            `;
        } else {
            html = `
                <div style="display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;">
                    <span style="color:var(--accent);font-weight:600;font-size:0.85rem;">${getSourceIcon()} ${conn.source.name}</span>
                    <span style="color:var(--muted);font-size:0.75rem;">(${conn.source.ip})</span>
                    <i class="fa fa-arrow-right" style="color:var(--muted);font-size:0.7rem;"></i>
                    <span style="color:#4CAF50;font-weight:600;font-size:0.85rem;">${getDestIcon()} ${conn.destination.name}</span>
                    <span style="color:var(--muted);font-size:0.75rem;">(${conn.destination.ip})</span>
                    <span style="margin-left:0.5rem;color:var(--muted);font-size:0.7rem;font-weight:600;">→</span>
                    ${portsHtml}
                </div>
            `;
        }
        
        return `
            <div style="padding:0.6rem 0.7rem;background:#ffffff;border-radius:0.3rem;border:1px solid var(--border);margin-bottom:0.4rem;display:flex;justify-content:space-between;align-items:center;">
                <div style="flex:1;">
                    ${html}
                    ${conn.note ? `<div style="margin-top:0.4rem;padding:0.3rem 0.5rem;background:rgba(255,159,67,0.08);border-left:2px solid #ff9f43;border-radius:0.2rem;font-size:0.75rem;color:var(--text);max-width:600px;"><strong>📝</strong> ${conn.note}</div>` : ''}
                </div>
                <button type="button" onclick="removeConnection(${conn.id})" style="font-size:0.75rem;background:none;border:none;color:var(--error);cursor:pointer;padding:0.3rem 0.5rem;opacity:0.6;transition:opacity 0.2s;margin-left:0.5rem;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.6'" title="Sil">
                    <i class="fa fa-trash"></i>
                </button>
            </div>
        `;
    }).join('');
}

function removeConnection(connId) {
    if (confirm('Bu bağlantıyı silmek istediğinize emin misiniz?')) {
        canvasData.connections = canvasData.connections.filter(c => c.id !== connId);
        renderTopologyConnections();
        renderNetworkDiagram(); // Diyagramı güncelle
    }
}

// Görsel diyagram için Vis.js network
let networkInstance = null;

function switchTopologyView(view) {
    const listView = document.getElementById('listView');
    const diagramView = document.getElementById('diagramView');
    const listViewTab = document.getElementById('listViewTab');
    const diagramViewTab = document.getElementById('diagramViewTab');
    
    if (view === 'list') {
        listView.style.display = 'block';
        diagramView.style.display = 'none';
        listViewTab.style.borderBottomColor = 'var(--accent)';
        listViewTab.style.color = 'var(--accent)';
        diagramViewTab.style.borderBottomColor = 'transparent';
        diagramViewTab.style.color = 'var(--muted)';
        listViewTab.classList.add('active');
        diagramViewTab.classList.remove('active');
    } else {
        listView.style.display = 'none';
        diagramView.style.display = 'block';
        diagramViewTab.style.borderBottomColor = 'var(--accent)';
        diagramViewTab.style.color = 'var(--accent)';
        listViewTab.style.borderBottomColor = 'transparent';
        listViewTab.style.color = 'var(--muted)';
        diagramViewTab.classList.add('active');
        listViewTab.classList.remove('active');
        renderNetworkDiagram();
    }
}

function renderNetworkDiagram() {
    if (!window.vis) {
        console.error('Vis.js yüklenmemiş');
        return;
    }
    
    const container = document.getElementById('topologyNetwork');
    if (!container) return;
    
    if (canvasData.connections.length === 0) {
        container.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--muted);font-size:0.9rem;">Henüz bağlantı yok</div>';
        return;
    }
    
    // Düğümleri ve kenarları oluştur
    const nodes = new vis.DataSet();
    const edges = new vis.DataSet();
    const nodeIds = new Set();
    
    canvasData.connections.forEach((conn, idx) => {
        // Source node
        const sourceId = `${conn.source.type}-${conn.source.id || conn.source.ip}`;
        if (!nodeIds.has(sourceId)) {
            nodes.add({
                id: sourceId,
                label: `${conn.source.name}\n${conn.source.ip}`,
                title: `${conn.source.name}\n${conn.source.ip}`,
                shape: 'box',
                image: undefined,
                color: {
                    background: '#3db8ff',
                    border: '#2196F3',
                    highlight: { background: '#2196F3', border: '#1976D2' }
                },
                font: { size: 14, color: '#ffffff', multi: 'html', bold: { size: 15 } },
                borderWidth: 2,
                shadow: { enabled: true, color: 'rgba(0,0,0,0.3)', size: 8, x: 0, y: 2 }
            });
            nodeIds.add(sourceId);
        }
        
        // Destination node
        const destId = `${conn.destination.type}-${conn.destination.id || conn.destination.ip}`;
        if (!nodeIds.has(destId)) {
            nodes.add({
                id: destId,
                label: `${conn.destination.name}\n${conn.destination.ip}`,
                title: `${conn.destination.name}\n${conn.destination.ip}`,
                shape: 'box',
                image: undefined,
                color: {
                    background: '#4CAF50',
                    border: '#388E3C',
                    highlight: { background: '#388E3C', border: '#2E7D32' }
                },
                font: { size: 14, color: '#ffffff', multi: 'html', bold: { size: 15 } },
                borderWidth: 2,
                shadow: { enabled: true, color: 'rgba(0,0,0,0.3)', size: 8, x: 0, y: 2 }
            });
            nodeIds.add(destId);
        }
        
        // Port node'larını oluştur (varsa)
        let portIds = [];
        if (conn.ports && conn.ports.length > 0) {
            conn.ports.forEach((port, pIdx) => {
                const portId = `port-${idx}-${pIdx}`;
                portIds.push(portId);
                
                // Port rengini belirle (port'ta varsa, yoksa varsayılan)
                const portColor = port.color || '#3db8ff';
                
                nodes.add({
                    id: portId,
                    label: `${port.name || 'Port'}\n${port.number}`,
                    title: `${port.name} - Port ${port.number}`,
                    shape: 'circle',
                    size: 40,
                    color: {
                        background: portColor,
                        border: portColor,
                        highlight: { background: portColor, border: portColor }
                    },
                    font: { 
                        size: 12, 
                        color: '#ffffff', 
                        bold: true,
                        multi: 'html'
                    },
                    borderWidth: 3,
                    shadow: { enabled: true, color: 'rgba(0,0,0,0.2)', size: 5, x: 0, y: 1 }
                });
            });
        }
        
        // Firewall node (eğer varsa)
        if (conn.firewall) {
            const fwId = `firewall-${idx}`;
            
            // SVG tuğla duvar görseli oluştur
            const brickWallSvg = `data:image/svg+xml,${encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" width="140" height="100" viewBox="0 0 140 100">
                    <defs>
                        <pattern id="bricks" x="0" y="0" width="35" height="20" patternUnits="userSpaceOnUse">
                            <rect x="0" y="0" width="35" height="10" fill="#dc2626" stroke="#fff" stroke-width="1.5"/>
                            <rect x="0" y="10" width="17.5" height="10" fill="#b91c1c" stroke="#fff" stroke-width="1.5"/>
                            <rect x="17.5" y="10" width="17.5" height="10" fill="#dc2626" stroke="#fff" stroke-width="1.5"/>
                        </pattern>
                        <linearGradient id="fireGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" style="stop-color:#ff6b00;stop-opacity:1" />
                            <stop offset="50%" style="stop-color:#ff8800;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#ff6b00;stop-opacity:1" />
                        </linearGradient>
                    </defs>
                    <rect width="140" height="100" fill="url(#bricks)" rx="4"/>
                    <rect x="15" y="35" width="110" height="30" fill="rgba(139,0,0,0.7)" rx="3" stroke="#fff" stroke-width="2"/>
                    <text x="70" y="55" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#fff" text-anchor="middle">FW</text>
                    <circle cx="25" cy="15" r="4" fill="url(#fireGradient)">
                        <animate attributeName="opacity" values="1;0.6;1" dur="1.5s" repeatCount="indefinite"/>
                    </circle>
                    <circle cx="115" cy="15" r="4" fill="url(#fireGradient)">
                        <animate attributeName="opacity" values="0.6;1;0.6" dur="1.5s" repeatCount="indefinite"/>
                    </circle>
                </svg>
            `)}`;
            
            nodes.add({
                id: fwId,
                label: 'FIREWALL',
                title: 'Firewall',
                shape: 'image',
                image: brickWallSvg,
                size: 50,
                font: { size: 0 },
                shadow: { enabled: true, color: 'rgba(0,0,0,0.5)', size: 12, x: 0, y: 4 }
            });
            
            // Source -> Firewall (port etiketi YOK)
            edges.add({
                from: sourceId,
                to: fwId,
                arrows: 'to',
                color: { color: '#3b82f6', highlight: '#1e40af' },
                width: 3
            });
            
            // Firewall -> Destination (port etiketi YOK)
            edges.add({
                from: fwId,
                to: destId,
                arrows: 'to',
                color: { color: '#3b82f6', highlight: '#1e40af' },
                width: 3
            });
            
            // Destination -> Port node'ları (sağ tarafta)
            if (portIds.length > 0) {
                portIds.forEach(portId => {
                    edges.add({
                        from: destId,
                        to: portId,
                        arrows: 'to',
                        color: { color: '#9ca3af', highlight: '#6b7280' },
                        width: 2,
                        dashes: true
                    });
                });
            }
        } else {
            // Direkt bağlantı
            edges.add({
                from: sourceId,
                to: destId,
                arrows: 'to',
                color: { color: '#3b82f6', highlight: '#1e40af' },
                width: 3
            });
            
            // Destination -> Port node'ları (sağ tarafta)
            if (portIds.length > 0) {
                portIds.forEach(portId => {
                    edges.add({
                        from: destId,
                        to: portId,
                        arrows: 'to',
                        color: { color: '#9ca3af', highlight: '#6b7280' },
                        width: 2,
                        dashes: true
                    });
                });
            }
        }
    });
    
    const data = { nodes, edges };
    const options = {
        layout: {
            hierarchical: {
                enabled: true,
                direction: 'LR', // Left to Right (soldan sağa)
                sortMethod: 'directed',
                nodeSpacing: 200,
                levelSeparation: 300,
                parentCentralization: true
            }
        },
        physics: {
            enabled: false // Hierarchical layout kullanıyoruz
        },
        interaction: {
            hover: true,
            tooltipDelay: 200,
            dragNodes: true,
            dragView: true,
            zoomView: true
        },
        edges: {
            smooth: {
                type: 'cubicBezier',
                forceDirection: 'horizontal'
            },
            arrows: {
                to: {
                    enabled: true,
                    scaleFactor: 0.8,
                    type: 'arrow'
                }
            }
        }
    };
    
    if (networkInstance) {
        networkInstance.destroy();
    }
    
    networkInstance = new vis.Network(container, data, options);
}

// Global fonksiyon olarak dışa aktar
window.switchTopologyView = switchTopologyView;

// Sayfa navigasyonu
function switchSection(targetId) {
    // Tüm section'ları gizle
    document.querySelectorAll('section.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Hedef section'u göster
    const targetSection = document.getElementById(targetId);
    if (targetSection) {
        targetSection.classList.add('active');
        
        // Spesifik section'lar için render fonksiyonları
        if (targetId === 'overview') {
            renderOverview();
        } else if (targetId === 'canvas') {
            attachTopologyBuilder();
        } else if (targetId === 'servers') {
            renderServers();
        } else if (targetId === 'ports') {
            renderPorts();
        } else if (targetId === 'topologies') {
            loadAndDisplayTopologies();
        } else if (targetId === 'sheflikler') {
            renderSheflikler();
        } else if (targetId === 'admin-list') {
            renderAdminList();
        } else if (targetId === 'access-list') {
            renderAccessList();
        }
    }
}

// Render fonksiyonları
function renderOverview() {
    const container = document.getElementById('overviewCards');
    if (!container) return;
    
    const totalTopologies = allTopologies.length;
    const totalSheflikler = sampleSheflikler.length;
    const criticalServers = allServers.filter(s => s.critical === 'Yüksek').length;
    const mediumServers = allServers.filter(s => s.critical === 'Orta').length;
    const lowServers = allServers.filter(s => s.critical === 'Düşük').length;
    
    container.innerHTML = `
        <div class="info-card" onclick="switchSection('topologies')" style="cursor:pointer;transition:transform 0.2s;" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
            <div class="card-header">
                <h3>Toplam Topoloji</h3>
                <i class="fa fa-diagram-project" style="color:#3b82f6"></i>
            </div>
            <div class="card-value">${totalTopologies}</div>
            <p class="card-meta">Kayıtlı topoloji tasarımı</p>
        </div>
        <div class="info-card" onclick="switchSection('sheflikler')" style="cursor:pointer;transition:transform 0.2s;" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
            <div class="card-header">
                <h3>Şeflik Sayısı</h3>
                <i class="fa fa-sitemap" style="color:#8b5cf6"></i>
            </div>
            <div class="card-value">${totalSheflikler}</div>
            <p class="card-meta">Aktif şeflik</p>
        </div>
        <div class="info-card" onclick="switchSection('servers')" style="cursor:pointer;transition:transform 0.2s;border-left:4px solid #ef4444;" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
            <div class="card-header">
                <h3>Kritik Sunucu</h3>
                <i class="fa fa-exclamation-triangle" style="color:#ef4444"></i>
            </div>
            <div class="card-value" style="color:#ef4444">${criticalServers}</div>
            <p class="card-meta">Yüksek kritiklik seviyesi</p>
        </div>
        <div class="info-card" onclick="switchSection('servers')" style="cursor:pointer;transition:transform 0.2s;border-left:4px solid #f59e0b;" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
            <div class="card-header">
                <h3>Orta Seviye Sunucu</h3>
                <i class="fa fa-server" style="color:#f59e0b"></i>
            </div>
            <div class="card-value" style="color:#f59e0b">${mediumServers}</div>
            <p class="card-meta">Orta kritiklik seviyesi</p>
        </div>
        <div class="info-card" onclick="switchSection('servers')" style="cursor:pointer;transition:transform 0.2s;border-left:4px solid #10b981;" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
            <div class="card-header">
                <h3>Düşük Seviye Sunucu</h3>
                <i class="fa fa-check-circle" style="color:#10b981"></i>
            </div>
            <div class="card-value" style="color:#10b981">${lowServers}</div>
            <p class="card-meta">Düşük kritiklik seviyesi</p>
        </div>
        <div class="info-card" onclick="switchSection('canvas')" style="cursor:pointer;transition:transform 0.2s;background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);color:white;" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
            <div class="card-header">
                <h3 style="color:white;">Son Topolojiler</h3>
                <i class="fa fa-clock-rotate-left" style="color:white"></i>
            </div>
            <div class="card-value" style="color:white;font-size:1.5rem;">
                ${allTopologies.slice(-3).map(t => `<div style="font-size:0.85rem;margin:0.3rem 0;">${t.topologyName || t.Name || t.name || 'İsimsiz'}</div>`).join('') || '<div style="font-size:0.9rem;">Henüz topoloji yok</div>'}
            </div>
            <p class="card-meta" style="color:rgba(255,255,255,0.8);">Son görüntülenen tasarımlar</p>
        </div>
    `;
}


function renderServers() {
    const tbody = document.querySelector('#serversTable tbody');
    if (!tbody) return;
    
    const criticalColors = {
        'Yüksek': '#ef4444',
        'Orta': '#f59e0b',
        'Düşük': '#10b981'
    };
    
    tbody.innerHTML = allServers.map(server => `
        <tr>
            <td>
                <div style="display:flex;align-items:center;gap:0.8rem;">
                    <div style="width:40px;height:40px;background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);border-radius:8px;display:flex;align-items:center;justify-content:center;">
                        <i class="fa fa-server" style="color:white;font-size:1.2rem;"></i>
                    </div>
                    <div>
                        <div style="font-weight:600;color:var(--text);">${server.name}</div>
                        <div style="font-size:0.85rem;color:var(--muted);">${server.ip}</div>
                    </div>
                </div>
            </td>
            <td>
                <span class="badge" style="background:${criticalColors[server.critical] || '#64748b'};color:white;padding:0.3rem 0.8rem;border-radius:6px;font-size:0.85rem;font-weight:600;">
                    ${server.critical || '-'}
                </span>
            </td>
            <td>${server.date || '-'}</td>
            <td>
                <button class="btn-small danger" onclick="deleteServer('${server.id}')">Sil</button>
            </td>
        </tr>
    `).join('');
}

function renderPorts() {
    const tbody = document.querySelector('#portsTable tbody');
    if (!tbody) return;
    
    const allPortsList = uniquePortsByNumber([...defaultPorts, ...allPorts]);
    tbody.innerHTML = allPortsList.map(port => `
        <tr>
            <td>
                <div style="display:flex;align-items:center;gap:0.8rem;">
                    <div style="width:36px;height:36px;background:${port.color};border-radius:50%;display:flex;align-items:center;justify-content:center;">
                        <i class="fa fa-network-wired" style="color:white;font-size:0.9rem;"></i>
                    </div>
                    <span style="font-weight:600;color:var(--text);">${port.name}</span>
                </div>
            </td>
            <td>
                <span style="background:${port.color};color:white;padding:0.3rem 0.7rem;border-radius:6px;font-size:0.85rem;font-weight:700;">${port.number}</span>
            </td>
            <td>${port.shape || 'circle'}</td>
            <td>
                <div style="width:28px;height:28px;background:${port.color};border-radius:6px;border:2px solid var(--border);"></div>
            </td>
            <td style="color:var(--muted);font-size:0.9rem;">${port.description || ''}</td>
            <td>
                <button class="btn-small" onclick="editPort('${port.number}')">Düzenle</button>
            </td>
        </tr>
    `).join('');
}

function renderTopologies() {
    const tbody = document.querySelector('#topologyTable tbody');
    if (!tbody) return;
    
    tbody.innerHTML = allTopologies.length ? allTopologies.map(topo => `
        <tr>
            <td>${topo.name || 'İsimsiz'}</td>
            <td>${topo.filename || '-'}</td>
            <td>${topo.dept || '-'}</td>
            <td>${topo.version || '1.0'}</td>
            <td>${topo.date || '-'}</td>
            <td>${topo.user || '-'}</td>
            <td>${topo.platform || '-'}</td>
            <td>${topo.critical || '-'}</td>
            <td>
                <button class="btn-small primary" onclick="loadTopology('${topo.id}')">Aç</button>
            </td>
            <td></td>
            <td>
                <button class="btn-small danger" onclick="deleteTopology('${topo.id}')">Sil</button>
            </td>
        </tr>
    `).join('') : '<tr><td colspan="11" style="text-align:center;color:var(--muted);">Kayıtlı topoloji yok</td></tr>';
}

function renderSheflikler() {
    const tbody = document.querySelector('#sheflikTable tbody');
    if (!tbody) return;
    
    tbody.innerHTML = sampleSheflikler.map((sheflık, idx) => `
        <tr>
            <td>${idx + 1}</td>
            <td>${sheflık.name}</td>
            <td><span class="badge success">${sheflık.status}</span></td>
            <td>${sheflık.date}</td>
            <td>
                <button class="btn-small">Düzenle</button>
            </td>
        </tr>
    `).join('');
}

function renderAdminList() {
    // Admin listesi şu anda basit görüntüleme
    return;
}

function renderAccessList() {
    // Access listesi şu anda basit görüntüleme
    return;
}

function deleteServer(id) {
    if (confirm('Sunucuyu silmek istediğinize emin misiniz?')) {
        allServers = allServers.filter(s => s.id != id);
        renderServers();
    }
}

function loadTopology(id) {
    alert('Topoloji yükleme özelliği yakında gelecek');
}

function editPort(number) {
    alert('Port düzenleme özelliği yakında gelecek');
}

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
    // Nav butonlarına event listener ekle
    document.querySelectorAll('.nav-item[data-target]').forEach(btn => {
        btn.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            switchSection(targetId);
            
            // Aktif nav item'ı güncelle
            document.querySelectorAll('.nav-item[data-target]').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Server ekle butonu
    const addServerBtn = document.getElementById('addServerBtn');
    if (addServerBtn) {
        addServerBtn.addEventListener('click', function() {
            const name = document.getElementById('serverNameInput')?.value.trim();
            const ip = document.getElementById('serverIpInput')?.value.trim();
            
            if (name && ip) {
                allServers.push({
                    id: `server-${Date.now()}`,
                    name: name,
                    ip: ip,
                    critical: 'Orta',
                    date: new Date().toLocaleDateString('tr-TR')
                });
                
                document.getElementById('serverNameInput').value = '';
                document.getElementById('serverIpInput').value = '';
                renderServers();
                alert('Sunucu başarıyla eklendi!');
            } else {
                alert('Lütfen tüm alanları doldurunuz!');
            }
        });
    }
    
    // Default portları yükle butonu
    const loadDefaultPortsBtn = document.getElementById('loadDefaultPortsBtn');
    if (loadDefaultPortsBtn) {
        loadDefaultPortsBtn.addEventListener('click', function() {
            allPorts = [...defaultPorts];
            renderPorts();
            alert('Varsayılan portlar yüklendi!');
        });
    }
    
    // İlk sayfayı render et
    const overview = document.getElementById('overview');
    if (overview) {
        overview.classList.add('active');
        const firstNav = document.querySelector('.nav-item[data-target="overview"]');
        if (firstNav) firstNav.classList.add('active');
    }
    
    renderOverview();
    renderServers();
    renderSheflikler();
    renderPorts();
});


