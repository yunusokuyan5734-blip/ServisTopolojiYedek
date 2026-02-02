// ======== TOPOLOJİ İNDİRME ========
function downloadTopology(file) {
    if (!file) return;
    const link = document.createElement('a');
    link.href = `/uploads/${file}`;
    link.download = file;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
function showDiagramModal(connections, filename) {
    // Modal oluştur
    const modal = document.createElement('div');
    modal.id = 'diagramViewModal';
    modal.style = 'display:flex;position:fixed;z-index:99999;left:0;top:0;width:100vw;height:100vh;background:rgba(0,0,0,0.4);align-items:center;justify-content:center;';
    
    const modalContent = document.createElement('div');
    modalContent.style = 'background:#fff;padding:2rem;border-radius:1rem;max-width:95vw;max-height:90vh;overflow:auto;box-shadow:0 8px 32px #0002;position:relative;min-width:800px;';
    
    modalContent.innerHTML = `
        <button onclick="document.getElementById('diagramViewModal').remove()" style="position:absolute;top:1rem;right:1rem;font-size:1.2rem;background:none;border:none;cursor:pointer;"><i class='fa fa-times'></i></button>
        <h2 style="margin-bottom:1.5rem;display:flex;align-items:center;gap:0.5rem;"><i class="fa fa-sitemap" style="color:var(--accent);"></i> ${filename.replace('_diagram.json', '')}</h2>
        
        <div style="display:flex;gap:0.5rem;margin-bottom:1rem;border-bottom:1px solid var(--border);">
            <button id="modalListViewTab" class="diagram-modal-tab active" style="padding:0.5rem 1rem;border:none;background:none;cursor:pointer;border-bottom:2px solid var(--accent);font-weight:600;color:var(--accent);">
                <i class="fa fa-list"></i> Liste Görünümü
            </button>
            <button id="modalDiagramViewTab" class="diagram-modal-tab" style="padding:0.5rem 1rem;border:none;background:none;cursor:pointer;border-bottom:2px solid transparent;font-weight:600;color:var(--muted);">
                <i class="fa fa-project-diagram"></i> Görsel Diyagram
            </button>
        </div>
        
        <div id="modalListViewContent" style="display:block;"></div>
        <div id="modalDiagramViewContent" style="display:none;"></div>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Liste görünümünü render et
    renderModalListView(connections);
    
    // Diyagram görünümünü render et
    renderModalDiagramView(connections);
    
    // Tab değiştirme
    document.getElementById('modalListViewTab').addEventListener('click', () => {
        document.getElementById('modalListViewContent').style.display = 'block';
        document.getElementById('modalDiagramViewContent').style.display = 'none';
        document.getElementById('modalListViewTab').style.borderBottom = '2px solid var(--accent)';
        document.getElementById('modalListViewTab').style.color = 'var(--accent)';
        document.getElementById('modalDiagramViewTab').style.borderBottom = '2px solid transparent';
        document.getElementById('modalDiagramViewTab').style.color = 'var(--muted)';
    });
    
    document.getElementById('modalDiagramViewTab').addEventListener('click', () => {
        document.getElementById('modalListViewContent').style.display = 'none';
        document.getElementById('modalDiagramViewContent').style.display = 'block';
        document.getElementById('modalListViewTab').style.borderBottom = '2px solid transparent';
        document.getElementById('modalListViewTab').style.color = 'var(--muted)';
        document.getElementById('modalDiagramViewTab').style.borderBottom = '2px solid var(--accent)';
        document.getElementById('modalDiagramViewTab').style.color = 'var(--accent)';
    });
}

function renderModalListView(connections) {
    const container = document.getElementById('modalListViewContent');
    if (!container) return;
    
    if (!connections || connections.length === 0) {
        container.innerHTML = '<p style="color:var(--muted);text-align:center;padding:2rem;">Bağlantı bulunamadı</p>';
        return;
    }
    
    container.innerHTML = connections.map((conn, idx) => {
        const getSourceIcon = () => conn.source.type === 'server' ? '🖥️' : '🌐';
        const getDestIcon = () => conn.destination.type === 'server' ? '🖥️' : '🌐';
        
        const portsHtml = conn.ports && conn.ports.length > 0 
            ? conn.ports.map(p => `<span style="background:${p.color};color:white;padding:0.3rem 0.6rem;border-radius:0.4rem;font-size:0.85rem;font-weight:800;display:inline-flex;gap:0.3rem;align-items:center;">${p.number} ${p.name || ''}</span>`).join(' ')
            : '<span style="color:#ef4444;">⚠️ Port Yok</span>';
        
        let html = '';
        if (conn.firewall) {
            html = `
                <div style="display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;">
                    <span style="color:var(--accent);font-weight:600;">${getSourceIcon()} ${conn.source.name}</span>
                    <span style="color:var(--muted);font-size:0.85rem;">(${conn.source.ip})</span>
                    <i class="fa fa-arrow-right" style="color:var(--muted);"></i>
                    <span style="background:linear-gradient(135deg,#1d4ed8,#2563eb);color:#fff;padding:0.4rem 0.8rem;border-radius:0.5rem;font-weight:700;">🧱 FW</span>
                    <i class="fa fa-arrow-right" style="color:var(--muted);"></i>
                    <span style="color:#4CAF50;font-weight:600;">${getDestIcon()} ${conn.destination.name}</span>
                    <span style="color:var(--muted);font-size:0.85rem;">(${conn.destination.ip})</span>
                    <span style="margin-left:0.5rem;">→</span>
                    ${portsHtml}
                </div>
            `;
        } else {
            html = `
                <div style="display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;">
                    <span style="color:var(--accent);font-weight:600;">${getSourceIcon()} ${conn.source.name}</span>
                    <span style="color:var(--muted);font-size:0.85rem;">(${conn.source.ip})</span>
                    <i class="fa fa-arrow-right" style="color:var(--muted);"></i>
                    <span style="color:#4CAF50;font-weight:600;">${getDestIcon()} ${conn.destination.name}</span>
                    <span style="color:var(--muted);font-size:0.85rem;">(${conn.destination.ip})</span>
                    <span style="margin-left:0.5rem;">→</span>
                    ${portsHtml}
                </div>
            `;
        }
        
        return `
            <div style="padding:1rem;background:#f8f9fa;border-radius:0.5rem;border:1px solid var(--border);margin-bottom:0.8rem;">
                ${conn.topologyName ? `<div style="font-weight:700;font-size:1rem;color:var(--accent);margin-bottom:0.5rem;"><i class="fa fa-sitemap"></i> ${conn.topologyName}</div>` : ''}
                ${html}
                ${conn.note ? `<div style="margin-top:0.5rem;padding:0.5rem;background:rgba(255,159,67,0.1);border-left:3px solid #ff9f43;border-radius:0.3rem;font-size:0.9rem;">📝 ${conn.note}</div>` : ''}
            </div>
        `;
    }).join('');
}

function renderModalDiagramView(connections) {
    const container = document.getElementById('modalDiagramViewContent');
    if (!container) return;
    
    container.innerHTML = '<div id="modalTopologyNetwork" style="width:100%;height:600px;border:1px solid var(--border);border-radius:0.5rem;background:#fafafa;"></div>';
    
    setTimeout(() => {
        const networkContainer = document.getElementById('modalTopologyNetwork');
        if (!networkContainer || typeof vis === 'undefined') return;
        
        const nodes = [];
        const edges = [];
        const nodeMap = new Map();
        
        let nodeId = 1;
        connections.forEach((conn, idx) => {
            const sourceKey = `${conn.source.name}_${conn.source.ip}`;
            const destKey = `${conn.destination.name}_${conn.destination.ip}`;
            
            if (!nodeMap.has(sourceKey)) {
                nodeMap.set(sourceKey, nodeId);
                nodes.push({
                    id: nodeId,
                    label: conn.source.name + '\\n' + conn.source.ip,
                    shape: conn.source.type === 'server' ? 'box' : 'ellipse',
                    color: { background: '#667eea', border: '#5a67d8' },
                    font: { color: '#fff', size: 14 }
                });
                nodeId++;
            }
            
            if (!nodeMap.has(destKey)) {
                nodeMap.set(destKey, nodeId);
                nodes.push({
                    id: nodeId,
                    label: conn.destination.name + '\\n' + conn.destination.ip,
                    shape: conn.destination.type === 'server' ? 'box' : 'ellipse',
                    color: { background: '#4CAF50', border: '#45a049' },
                    font: { color: '#fff', size: 14 }
                });
                nodeId++;
            }
            
            if (conn.firewall) {
                const fwKey = 'firewall';
                if (!nodeMap.has(fwKey)) {
                    nodeMap.set(fwKey, nodeId);
                    nodes.push({
                        id: nodeId,
                        label: '🧱 Firewall',
                        shape: 'diamond',
                        color: { background: '#ff6b6b', border: '#ff5252' },
                        font: { color: '#fff', size: 14 }
                    });
                    nodeId++;
                }
                
                edges.push({
                    from: nodeMap.get(sourceKey),
                    to: nodeMap.get(fwKey),
                    arrows: 'to',
                    label: conn.ports.map(p => p.number).join(','),
                    color: { color: '#3b82f6' }
                });
                
                edges.push({
                    from: nodeMap.get(fwKey),
                    to: nodeMap.get(destKey),
                    arrows: 'to',
                    label: conn.ports.map(p => p.number).join(','),
                    color: { color: '#3b82f6' }
                });
            } else {
                edges.push({
                    from: nodeMap.get(sourceKey),
                    to: nodeMap.get(destKey),
                    arrows: 'to',
                    label: conn.ports.map(p => p.number).join(','),
                    color: { color: '#3b82f6' }
                });
            }
        });
        
        const data = { nodes: new vis.DataSet(nodes), edges: new vis.DataSet(edges) };
        const options = {
            nodes: { borderWidth: 2, shadow: true },
            edges: { width: 2, smooth: { type: 'cubicBezier' } },
            physics: { enabled: true, barnesHut: { gravitationalConstant: -30000, springLength: 200 } }
        };
        
        new vis.Network(networkContainer, data, options);
    }, 100);
}

// ======== SVG'DEN OLUŞTUR MODAL ========
// SVG drawing integration removed - not needed
window.handleSvgDrawing = function(svgContent) {
    console.log('SVG drawing removed');
};

// API URL tanımı
const API_BASE = '/api';

let allTopologies = [];
let allServers = [];
let allPorts = [];
let canvasData = { shapes: [], connections: [] };
let currentPage = 1;
let pageSize = 10;
let lastFilteredRaw = [];
let serverCriticalFilter = null;
let preserveServerFilterOnce = false;
let pendingLatestTopologiesCount = null;

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
    loadShefliklerFromBackend();
    attachTopologyFilters();
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
            // Seçili sunucu+ip'leri grupla
            const selectedServers = selected.map(cb => ({
                server: cb.getAttribute('data-server'),
                ip: cb.getAttribute('data-ip')
            }));
            // Tekrarsız sunucu+ip listesi
            const uniqueKeys = [];
            const uniqueServers = selectedServers.filter(s => {
                const key = s.server + '|' + s.ip;
                if (uniqueKeys.includes(key)) return false;
                uniqueKeys.push(key);
                return true;
            });
            // Onay modalı oluştur
            const confirmModal = document.createElement('div');
            confirmModal.style = 'position:fixed;z-index:99999;left:0;top:0;width:100vw;height:100vh;background:rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;';
            confirmModal.innerHTML = `
                <div style="background:#fff;padding:2rem 2.5rem;border-radius:1rem;max-width:90vw;max-height:80vh;overflow:auto;box-shadow:0 8px 32px #0002;position:relative;min-width:320px;">
                    <button id="closeDeleteModal" style="position:absolute;top:1rem;right:1rem;font-size:1.2rem;background:none;border:none;cursor:pointer;"><i class='fa fa-times'></i></button>
                    <h2 style="margin-bottom:1rem;">Seçili Sunucuları Sil</h2>
                    <div style="margin-bottom:1rem;">Aşağıdaki sunucular ve tüm versiyonları silinecek. Emin misiniz?</div>
                    <ul style="margin-bottom:1.5rem;">
                        ${uniqueServers.map(s => `<li><b>${s.server}</b> <span style='color:#888'>(${s.ip})</span></li>`).join('')}
                    </ul>
                    <button id="confirmDeleteBtn" class="btn danger" style="margin-right:1rem;">Evet, Sil</button>
                    <button id="cancelDeleteBtn" class="btn ghost">Vazgeç</button>
                </div>
            `;
            document.body.appendChild(confirmModal);
            document.getElementById('closeDeleteModal').onclick = () => document.body.removeChild(confirmModal);
            document.getElementById('cancelDeleteBtn').onclick = () => document.body.removeChild(confirmModal);
            document.getElementById('confirmDeleteBtn').onclick = async () => {
                for (const s of uniqueServers) {
                    // Tüm versiyonları bul ve sil
                    const toDelete = allTopologies.filter(t => {
                        const server = (t.server || t.Server || '').trim().toLowerCase();
                        const ip = (t.ip || t.Ip || '').trim();
                        return server === (s.server || '').trim().toLowerCase() && ip === (s.ip || '').trim();
                    });
                    for (const topo of toDelete) {
                        const file = topo.file || topo.File;
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
                }
                document.body.removeChild(confirmModal);
                await loadAndDisplayTopologies();
            };
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

    if (id === 'integration') {
        if (typeof loadLdapConfig === 'function') loadLdapConfig();
        if (typeof loadLdapMappings === 'function') loadLdapMappings();
    }

    if (id === 'admin-list' || id === 'access-list') {
        if (typeof loadUsers === 'function') loadUsers();
    }
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
    console.log('loadAndDisplayTopologies called');
    try {
        const response = await fetch(`${API_BASE}/topology/list`, { credentials: 'include' });
        console.log('API response status:', response.status);
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
    
    rebuildServersFromTopologies(allTopologies);
    console.log('Calling renderOverview, renderFilters, renderTable...');
    renderOverview();
    renderFilters();
    renderTable(allTopologies);
    if (typeof renderServersTable === 'function') renderServersTable();
    if (typeof renderServerLibrary === 'function') renderServerLibrary();
    if (pendingLatestTopologiesCount) {
        renderLatestTopologies(pendingLatestTopologiesCount);
        pendingLatestTopologiesCount = null;
    }
}

function rebuildServersFromTopologies(topologies) {
    const grouped = {};
    (topologies || []).forEach(t => {
        const server = (t.server || t.Server || '').trim();
        const ip = (t.ip || t.Ip || '').trim();
        if (!server || !ip) return;
        const key = server.toLowerCase() + '|' + ip;
        const versionNum = parseInt((t.version || t.Version || 'v1').replace(/\D/g, '')) || 1;
        if (!grouped[key] || versionNum > grouped[key].__versionNum) {
            grouped[key] = { ...t, __versionNum: versionNum, __server: server, __ip: ip };
        }
    });

    const latestRows = Object.values(grouped);
    allServers = latestRows.map((r, idx) => ({
        id: idx + 1,
        name: r.__server || r.server || r.Server || 'İsimsiz',
        ip: r.__ip || r.ip || r.Ip || '-',
        critical: r.critical || r.Critical || '-',
        date: r.date || r.Date || '-'
    }));
}

function renderFilters() {
    const deptSelect = document.getElementById('filterDept');
    if (!deptSelect) return;
    deptSelect.innerHTML = '<option value="">Tüm Şeflikler</option>';
    const depts = [...new Set(allTopologies.map(t => t.dept || t.Dept).filter(Boolean))];
    depts.forEach(d => {
        const opt = document.createElement('option');
        opt.value = d;
        opt.textContent = d;
        deptSelect.appendChild(opt);
    });
}

function attachTopologyFilters() {
    const dept = document.getElementById('filterDept');
    const crit = document.getElementById('filterCrit');
    const search = document.getElementById('filterSearch');
    const server = document.getElementById('filterServer');
    const reset = document.getElementById('filterReset');
    const sizeSelect = document.getElementById('pageSizeSelect');
    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');

    if (dept) dept.addEventListener('change', applyFilters);
    if (crit) crit.addEventListener('change', applyFilters);
    if (search) search.addEventListener('input', applyFilters);
    if (server) server.addEventListener('input', applyFilters);
    if (reset) reset.addEventListener('click', (e) => {
        e.preventDefault();
        resetFilters();
    });
    if (sizeSelect) {
        sizeSelect.addEventListener('change', () => {
            const val = sizeSelect.value;
            pageSize = val === 'all' ? 0 : parseInt(val, 10);
            currentPage = 1;
            renderTable(lastFilteredRaw.length ? lastFilteredRaw : allTopologies);
        });
    }
    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentPage > 1) {
                currentPage -= 1;
                renderTable(lastFilteredRaw.length ? lastFilteredRaw : allTopologies);
            }
        });
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            currentPage += 1;
            renderTable(lastFilteredRaw.length ? lastFilteredRaw : allTopologies);
        });
    }
}

function applyFilters() {
    const dept = document.getElementById('filterDept')?.value || '';
    const crit = document.getElementById('filterCrit')?.value || '';
    const text = (document.getElementById('filterSearch')?.value || '').toLowerCase();
    const serverText = (document.getElementById('filterServer')?.value || '').toLowerCase();

    const filtered = allTopologies.filter(t => {
        const deptVal = (t.dept || t.Dept || '').trim();
        const critVal = (t.critical || t.Critical || '').trim();
        const serverVal = (t.server || t.Server || '').trim();
        const ipVal = (t.ip || t.Ip || '').trim();
        const fileVal = (t.file || t.File || '').trim();
        const matchDept = dept ? deptVal === dept : true;
        const matchCrit = crit ? critVal === crit : true;
        const matchServer = serverText ? `${serverVal} ${ipVal}`.toLowerCase().includes(serverText) : true;
        const matchText = text ? `${serverVal} ${fileVal} ${deptVal} ${ipVal}`.toLowerCase().includes(text) : true;
        return matchDept && matchCrit && matchServer && matchText;
    });

    currentPage = 1;
    renderTable(filtered);
}

function resetFilters() {
    const dept = document.getElementById('filterDept');
    const crit = document.getElementById('filterCrit');
    const search = document.getElementById('filterSearch');
    const server = document.getElementById('filterServer');
    if (dept) dept.value = '';
    if (crit) crit.value = '';
    if (search) search.value = '';
    if (server) server.value = '';
    currentPage = 1;
    renderTable(allTopologies);
}

function updatePagination(totalCount, pageCount, shownCount) {
    const countEl = document.getElementById('topologyCount');
    const infoEl = document.getElementById('pageInfo');
    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');

    if (countEl) countEl.textContent = `Görüntülenen: ${shownCount} / Toplam: ${totalCount}`;
    if (infoEl) infoEl.textContent = pageSize === 0 ? 'Tümü' : `${currentPage} / ${pageCount}`;
    if (prevBtn) prevBtn.disabled = currentPage <= 1 || pageSize === 0;
    if (nextBtn) nextBtn.disabled = currentPage >= pageCount || pageSize === 0;
}

function renderTable(rows) {
    const tbody = document.querySelector('#topologyTable tbody');
    if (!tbody) return;
    lastFilteredRaw = Array.isArray(rows) ? rows : [];
    
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
    
    // Sunucu bazında grupla, sadece en yüksek versiyonu göster (sadece tablo için)
    const grouped = {};
    rows.forEach(r => {
        const server = (r.server || r.Server || '').trim().toLowerCase();
        const ip = (r.ip || r.Ip || '').trim();
        if (!server || !ip) return;
        const key = server + '|' + ip;
        const versionNum = parseInt((r.version || r.Version || 'v1').replace(/\D/g, '')) || 1;
        if (!grouped[key] || versionNum > grouped[key].__versionNum) {
            grouped[key] = { ...r, __versionNum: versionNum };
        }
    });
    const latestRows = Object.values(grouped);
    const totalCount = latestRows.length;

    let pageCount = 1;
    let pageRows = latestRows;
    if (pageSize > 0) {
        pageCount = Math.max(1, Math.ceil(totalCount / pageSize));
        if (currentPage > pageCount) currentPage = pageCount;
        const start = (currentPage - 1) * pageSize;
        pageRows = latestRows.slice(start, start + pageSize);
    } else {
        currentPage = 1;
    }

    updatePagination(totalCount, pageCount, pageRows.length);

    // Tablo sadece son versiyonu gösterir, ama allTopologies tüm versiyonları içerir
    tbody.innerHTML = pageRows.map(r => {
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
        const versionBadge = `<span class="badge lilac" style="background:linear-gradient(90deg,#a084ee,#7c5dff);color:#fff;">${version}</span>`;
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
            <td onclick="event.stopPropagation()"><input type="checkbox" class="topology-checkbox" data-server="${server}" data-ip="${ip}" style="cursor:pointer;" onchange="updateSelectedCount()"></td>
            <td><strong>${name}</strong></td>
            <td>${serverCell}</td>
            <td>${file}</td>
            <td>${dept}</td>
            <td>${versionBadge}</td>
            <td>${date}</td>
            <td><span class="badge info">${user}</span></td>
            <td><span class="badge ${platform === 'Windows' ? 'primary' : 'success'}">${platform}</span></td>
            <td><span class="badge ${critical === 'Yüksek' ? 'danger' : critical === 'Orta' ? 'warning' : 'success'}">${critical}</span></td>
            <td class="actions">
                <button class="btn primary" onclick="downloadTopology('${file}')"><i class="fa fa-download"></i> İndir</button>
                <button class="btn" style="color:#64748b;border:1.5px solid #64748b;background:#fff;" onclick="viewTopology('${file}')"><i class="fa fa-eye"></i> Görüntüle</button>
                <button class="btn lilac" onclick="showVersionHistory('${server}','${ip}')"><i class="fa fa-history"></i> Geçmiş</button>
                <button class="btn warning" onclick="editTopology('${server}','${ip}')"><i class="fa fa-pen"></i> Düzenle</button>
                <button class="btn danger" onclick="deleteTopology('${server}','${ip}')"><i class="fa fa-trash"></i> Sil</button>
            </td>
        </tr>
        `;
    }).join('');
    // Versiyon geçmişi modalı fonksiyonları (global scope)
    window.showVersionHistory = function(server, ip) {
        const modal = document.getElementById('versionModal');
        const content = document.getElementById('versionModalContent');
        if (!modal || !content) return;
        // Tüm versiyonları bul
        const versions = (window.allTopologies || allTopologies).filter(t => {
            const s = (t.server || t.Server || '').trim().toLowerCase();
            const i = (t.ip || t.Ip || '').trim();
            return s === server.trim().toLowerCase() && i === ip.trim();
        }).sort((a, b) => {
            // v1, v2, v3... sıralama
            const va = parseInt((a.version || a.Version || 'v1').replace(/\D/g, '')) || 1;
            const vb = parseInt((b.version || b.Version || 'v1').replace(/\D/g, '')) || 1;
            return va - vb;
        });
        if (versions.length === 0) {
            content.innerHTML = '<div style="color:#ef4444">Geçmiş versiyon bulunamadı.</div>';
        } else {
            content.innerHTML = `
            <div style="margin-bottom:1.2rem;font-size:1.1rem;font-weight:600;color:#222;">Sunucu: <span style='color:#64748b'>${versions[0].server || versions[0].Server || '-'}</span></div>
            <table class="table" style="min-width:420px;">
                <thead style="background:#f3f4f6;">
                    <tr>
                        <th style="color:#7c5dff;">Versiyon</th>
                        <th>Ekleyen</th>
                        <th>Eklenen Tarih</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                ${versions.map(function(v) {
                    const file = v.file || v.File || '-';
                    const version = v.version || v.Version || 'v1';
                    const date = v.date || v.Date || '-';
                    const user = v.user || v.User || '-';
                    return `<tr>
                        <td><span class="badge lilac" style="background:linear-gradient(90deg,#a084ee,#7c5dff);color:#fff;font-size:1.05em;">${version}</span></td>
                        <td style="font-weight:500;">${user}</td>
                        <td>${date}</td>
                        <td><a class="btn" style="color:#64748b;border:2px solid #64748b;background:#fff;padding:6px 18px;font-weight:600;font-size:1em;border-radius:6px;" href="/uploads/${file}" target="_blank"><i class="fa fa-eye"></i> Görüntüle</a></td>
                    </tr>`;
                }).join('')}
                </tbody>
            </table>`;
        }
        modal.style.display = 'flex';
    }

    window.closeVersionModal = function() {
        const modal = document.getElementById('versionModal');
        if (modal) modal.style.display = 'none';
    }
}



// Topoloji meta düzenleme (server, ip ile)
function editTopology(server, ip) {
    const topo = allTopologies.find(t => {
        const s = (t.server || t.Server || '').trim().toLowerCase();
        const i = (t.ip || t.Ip || '').trim();
        return s === server.trim().toLowerCase() && i === ip.trim();
    });
    if (!topo) return;
    window.currentEditTopology = topo;
    // Modalı doldur
    document.getElementById('editTopologyName').value = topo.name || topo.Name || '';
    document.getElementById('editServerName').value = topo.server || topo.Server || '';
    document.getElementById('editServerIp').value = topo.ip || topo.Ip || '';
    document.getElementById('editFileName').value = topo.file || topo.File || '';
    document.getElementById('editDept').value = topo.dept || topo.Dept || '';
    document.getElementById('editPlatform').value = topo.platform || topo.Platform || '';
    document.getElementById('editCritical').value = topo.critical || topo.Critical || '';
    document.getElementById('editNote').value = topo.note || topo.Note || '';
    document.getElementById('editTopologyModal').style.display = 'flex';
}

// Modal kaydetme işlemi
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('editTopologyForm');
    if (form) {
        form.onsubmit = async function(e) {
            e.preventDefault();
            const topo = window.currentEditTopology;
            if (!topo) return;
            // Yeni değerleri al
            const updated = {
                name: document.getElementById('editTopologyName').value,
                server: document.getElementById('editServerName').value,
                ip: document.getElementById('editServerIp').value,
                file: document.getElementById('editFileName').value,
                dept: document.getElementById('editDept').value,
                platform: document.getElementById('editPlatform').value,
                critical: document.getElementById('editCritical').value,
                note: document.getElementById('editNote').value,
                version: topo.version || topo.Version || 'v1',
                date: topo.date || topo.Date || new Date().toISOString().slice(0,10),
                user: topo.user || topo.User || 'admin'
            };
            // Backend'e güncelleme isteği gönder
            try {
                const res = await fetch(`/api/topology/update`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(updated)
                });
                if (res.ok) {
                    document.getElementById('editTopologyModal').style.display = 'none';
                    await loadAndDisplayTopologies();
                } else {
                    alert('Güncelleme başarısız!');
                }
            } catch (err) {
                alert('Sunucuya ulaşılamadı!');
            }
        }
    }
});

// Topoloji silme (server, ip ile)
async function deleteTopology(server, ip) {
    if (!confirm('Bu topolojiyi silmek istediğinize emin misiniz?')) return;
    // Tüm versiyonları bul ve sil
    const toDelete = allTopologies.filter(t => {
        const s = (t.server || t.Server || '').trim().toLowerCase();
        const i = (t.ip || t.Ip || '').trim();
        return s === server.trim().toLowerCase() && i === ip.trim();
    });
    for (const topo of toDelete) {
        const file = topo.file || topo.File;
        try {
            const response = await fetch(`${API_BASE}/topology/delete?file=${encodeURIComponent(file)}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (!response.ok) {
                alert('Silinemedi: ' + file);
            }
        } catch (err) {
            alert('Silme hatası: ' + file);
        }
    }
    await loadAndDisplayTopologies();
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
function showNotification(message, type = 'info') {
    const notificationDiv = document.createElement('div');
    notificationDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        animation: slideIn 0.3s ease-in-out;
        ${type === 'success' ? 'background: #10b981;' : type === 'error' ? 'background: #ef4444;' : 'background: #3b82f6;'}
    `;
    notificationDiv.textContent = message;
    document.body.appendChild(notificationDiv);
    
    setTimeout(() => {
        notificationDiv.style.animation = 'slideOut 0.3s ease-in-out';
        setTimeout(() => notificationDiv.remove(), 300);
    }, 3000);
}

async function loadShefliklerFromBackend() {
    try {
        const response = await fetch('/api/sheflik/list');
        console.log('API Response status:', response.status, 'ok:', response.ok);
        
        const data = await response.json();
        console.log('Backend\'den gelen veri:', data);
        
        if (Array.isArray(data)) {
            console.log('Veri array, eleman sayısı:', data.length);
            if (data.length > 0) {
                console.log('İlk eleman:', data[0]);
            }
            
            sampleSheflikler.length = 0;
            sampleSheflikler.push(...data.map(s => {
                console.log('Mapping:', s);
                return {
                    name: s.Name || s.name,
                    status: s.Status || s.status,
                    date: s.Date || s.date
                };
            }));
            console.log('Yüklenen sampleSheflikler:', sampleSheflikler);
            attachSheflikler();
            populateMetadataSelects();
        } else {
            console.error('Veri array değil:', typeof data);
        }
    } catch (error) {
        console.error('Şeflikler yüklenirken hata:', error);
    }
}

function attachSheflikler() {
    const tbody = document.querySelector('#sheflikTable tbody');
    if (!tbody) return;
    tbody.innerHTML = sampleSheflikler.map((s, idx) => `
        <tr>
            <td>${idx + 1}</td>
            <td>${s.name}</td>
            <td><span class="badge success">${s.status}</span></td>
            <td>${s.date}</td>
            <td class="actions sheflik-actions">
                <button class="btn-edit" onclick="editSheflik(${idx})"><i class="fa fa-pen"></i> Düzenle</button>
                <button class="btn-delete" onclick="deleteSheflik(${idx})"><i class="fa fa-trash"></i> Sil</button>
            </td>
        </tr>
    `).join('');
}

function openSheflikModal(mode = 'add', idx = null) {
    const modal = document.getElementById('sheflikModal');
    const title = document.getElementById('sheflikModalTitle');
    const input = document.getElementById('sheflikNameInput');
    
    if (mode === 'add') {
        title.textContent = 'Yeni Şeflik Ekle';
        input.value = '';
        input.focus();
        modal.dataset.mode = 'add';
        modal.dataset.index = '';
    } else if (mode === 'edit' && idx !== null) {
        title.textContent = 'Şeflik Adını Düzenle';
        input.value = sampleSheflikler[idx].name;
        input.focus();
        modal.dataset.mode = 'edit';
        modal.dataset.index = idx;
    }
    
    modal.style.display = 'flex';
}

function closeSheflikModal() {
    document.getElementById('sheflikModal').style.display = 'none';
}

function editSheflik(idx) {
    openSheflikModal('edit', idx);
}

async function deleteSheflik(idx) {
    if (confirm(`"${sampleSheflikler[idx].name}" şefliğini silmek istediğinize emin misiniz?`)) {
        try {
            const response = await fetch(`/api/sheflik/delete/${idx}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                await loadShefliklerFromBackend();
                showNotification('Şeflik başarıyla silindi', 'success');
            } else {
                showNotification('Şeflik silinirken hata oluştu', 'error');
            }
        } catch (error) {
            console.error('Silme hatası:', error);
            showNotification('Şeflik silinirken hata oluştu', 'error');
        }
    }
}

// Modal form submit
document.addEventListener('DOMContentLoaded', function() {
    const sheflikForm = document.getElementById('sheflikForm');
    if (sheflikForm) {
        sheflikForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const name = document.getElementById('sheflikNameInput').value.trim();
            const modal = document.getElementById('sheflikModal');
            const mode = modal.dataset.mode;
            const idx = parseInt(modal.dataset.index);
            
            if (!name) {
                showNotification('Şeflik adı boş olamaz', 'error');
                return;
            }
            
            try {
                if (mode === 'add') {
                    const response = await fetch('/api/sheflik/add', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name: name })
                    });
                    
                    if (response.ok) {
                        showNotification('Şeflik başarıyla eklendi', 'success');
                        await loadShefliklerFromBackend();
                        closeSheflikModal();
                    } else {
                        showNotification('Şeflik eklenirken hata oluştu', 'error');
                    }
                } else if (mode === 'edit' && !isNaN(idx)) {
                    const response = await fetch(`/api/sheflik/update/${idx}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name: name })
                    });
                    
                    if (response.ok) {
                        showNotification('Şeflik başarıyla güncellendi', 'success');
                        await loadShefliklerFromBackend();
                        closeSheflikModal();
                    } else {
                        showNotification('Şeflik güncellenirken hata oluştu', 'error');
                    }
                }
            } catch (error) {
                console.error('İşlem hatası:', error);
                showNotification('İşlem sırasında hata oluştu', 'error');
                closeSheflikModal();
            }
        });
    }
    
    const addSheflikBtn = document.getElementById('addSheflikBtn');
    if (addSheflikBtn) {
        addSheflikBtn.addEventListener('click', () => openSheflikModal('add'));
    }
    
    const modal = document.getElementById('sheflikModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeSheflikModal();
            }
        });
    }
});

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
        console.log('Auth status response:', res.status, res.ok);
        if (!res.ok) {
            console.error('Auth failed: response not ok');
            location.href = '/index.html';
            return;
        }
        const data = await res.json();
        console.log('Auth data:', data);
        if (!data.authenticated) {
            console.error('Auth failed: not authenticated');
            location.href = '/index.html';
            return;
        }
        const user = data.username || 'admin';
        const role = data.role || 'User';
        const seflikId = data.seflikId || null;
        const seflikName = data.seflikName || null;

        window.currentUserRole = role;
        
        const tag = document.getElementById('usernameTag');
        if (tag) {
            tag.textContent = user;
            // Rol ve şeflik bilgisini kullanıcı adının altına ekle
            if (role && role !== 'Admin') {
                const roleInfo = document.createElement('div');
                roleInfo.style.cssText = 'font-size:0.75rem;color:#94a3b8;margin-top:0.2rem;';
                roleInfo.textContent = role === 'SheflikYetkilisi' ? `Şeflik: ${seflikName || seflikId || '-'}` : role;
                tag.parentElement.appendChild(roleInfo);
            }
        }
        
        const currentUserEl = document.getElementById('currentUser');
        if (currentUserEl) {
            currentUserEl.textContent = 'Hoş geldiniz, ' + user;
            if (role && role !== 'User') {
                currentUserEl.textContent += ` (${role === 'Admin' ? 'Yönetici' : role === 'SheflikYetkilisi' ? 'Şeflik Yetkilisi' : role})`;
            }
        }
        
        // *** ROL BAZLI UI KISITLAMASI ***
        // Şeflik Yetkilisi için sidebar'daki belirli menüleri gizle
        if (role === 'SheflikYetkilisi') {
            const restrictedTargets = ['servers', 'ports', 'canvas', 'admin'];
            restrictedTargets.forEach(target => {
                const navItem = document.querySelector(`.nav-item[data-target="${target}"]`);
                if (navItem) {
                    navItem.style.display = 'none';
                }
            });
            console.log('Şeflik Yetkilisi UI kısıtlaması uygulandı');
        }
        
        // Admin değilse admin panelini gizle
        if (role !== 'Admin') {
            const adminNavItem = document.querySelector('.nav-item[data-target="admin"]');
            if (adminNavItem) {
                adminNavItem.style.display = 'none';
            }
        }
        
        const adminBtn = document.getElementById('adminTopBtn');
        if (adminBtn) {
            // Admin değilse butonu gizle
            if (role !== 'Admin') {
                adminBtn.style.display = 'none';
            } else {
                adminBtn.addEventListener('click', () => {
                    showSection('admin');
                    document.querySelectorAll('.nav-item[data-target]').forEach(btn => {
                        btn.classList.toggle('active', btn.getAttribute('data-target') === 'admin');
                    });
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                });
            }
        }

        attachLdapIntegration();
        attachUserManagement();
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
window.logout = logout;

async function viewTopology(filename) {
    if (filename.endsWith('_diagram.json')) {
        // JSON diagram dosyası için özel modal göster
        try {
            const response = await fetch(`/uploads/${filename}`);
            const connections = await response.json();
            showDiagramModal(connections, filename);
        } catch (error) {
            console.error('Error loading diagram:', error);
            alert('Diyagram yüklenemedi!');
        }
    } else {
        // Diğer dosyalar için normal açılış
        window.open(`/uploads/${filename}`, '_blank');
    }
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

    document.getElementById('exportServersExcelBtn')?.addEventListener('click', () => {
        exportServersCurrentFilter('excel');
    });
    document.getElementById('exportServersPdfBtn')?.addEventListener('click', () => {
        exportServersCurrentFilter('pdf');
    });
    
    renderServersTable();
}

function renderServersTable() {
    const serversTable = document.getElementById('serversTable')?.querySelector('tbody');
    if (!serversTable) return;
    const filteredServers = serverCriticalFilter
        ? allServers.filter(s => s.critical === serverCriticalFilter)
        : allServers;
    
    serversTable.innerHTML = filteredServers.map(server => `
        <tr>
            <td><div style="display:flex;align-items:center;gap:0.5rem;"><div style="width:40px;height:40px;background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);border-radius:6px;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:1.2rem;box-shadow:0 2px 8px rgba(102, 126, 234, 0.4);">🖥️</div><div><strong>${server.name}</strong><div style="font-size:0.85em;color:var(--muted);">${server.ip}</div></div></div></td>
            <td><span class="badge" style="background:${server.critical === 'Yüksek' ? '#ff6b6b' : server.critical === 'Orta' ? '#ff9f43' : server.critical === 'Düşük' ? '#3ed598' : '#ccc'};color:white;font-weight:600;padding:6px 12px;border-radius:20px;box-shadow:0 2px 8px rgba(0,0,0,0.2);display:inline-flex;align-items:center;gap:6px;"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,0.8);"></span>${server.critical}</span></td>
            <td>${server.date}</td>
            <td>
                <button class="btn btn-sm ghost" onclick="viewServerTopologies('${server.name}','${server.ip}')"><i class="fa fa-eye"></i></button>
                <button class="btn btn-sm ghost" onclick="deleteServer(${server.id})"><i class="fa fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
    updateServersFilterLabel(filteredServers.length);
}

function updateServersFilterLabel(count) {
    const label = document.getElementById('serversFilterLabel');
    if (!label) return;
    const title = serverCriticalFilter ? `Filtre: ${serverCriticalFilter}` : 'Filtre: Tümü';
    label.textContent = `${title} (Görüntülenen: ${count})`;
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
    populateMetadataSelects();
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
            // Çizim alanı topolojisini kaydet
            if (!canvasData.connections || canvasData.connections.length === 0) {
                alert('⚠️ Kaydedilecek bağlantı yok! Lütfen önce en az bir bağlantı ekleyin.');
                return;
            }
            
            // Metadata alanlarını al
            const topologyName = document.getElementById('topologyName')?.value?.trim();
            const platform = document.getElementById('topologyPlatform')?.value?.trim();
            const critical = document.getElementById('topologyCritical')?.value?.trim();
            const sheflik = document.getElementById('topologySheflik')?.value?.trim();
            const note = document.getElementById('topologyNote')?.value?.trim() || '';
            
            // Zorunlu alanları kontrol et
            if (!topologyName) {
                alert('⚠️ Topoloji Adı zorunludur!');
                return;
            }
            if (!platform) {
                alert('⚠️ İşletim Sistemi zorunludur!');
                return;
            }
            if (!critical) {
                alert('⚠️ Kritiklik Seviyesi zorunludur!');
                return;
            }
            if (!sheflik) {
                alert('⚠️ Şeflik zorunludur!');
                return;
            }
            
            (async () => {
                try {
                    const response = await fetch('/api/topology/save-diagram', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({
                            topologyName: topologyName,
                            platform: platform,
                            critical: critical,
                            dept: sheflik,
                            note: note,
                            connections: canvasData.connections
                        })
                    });
                    
                    const data = await response.json();
                    
                    if (response.ok) {
                        alert('✅ Topoloji başarıyla kaydedildi!');
                        // Form alanlarını temizle
                        document.getElementById('topologyName').value = '';
                        document.getElementById('topologyPlatform').value = '';
                        document.getElementById('topologyCritical').value = '';
                        document.getElementById('topologySheflik').value = '';
                        document.getElementById('topologyNote').value = '';
                        canvasData.connections = [];
                        renderTopologyConnections();
                        await loadAndDisplayTopologies();
                    } else {
                        alert('❌ Kaydetme başarısız: ' + (data.message || 'Bilinmeyen hata'));
                    }
                } catch (error) {
                    console.error('Save error:', error);
                    alert('❌ Sunucuya bağlanılamadı!');
                }
            })();
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

// ======== METADATA SELECTS POPULATE ========
function populateMetadataSelects() {
    const sheflikSelect = document.getElementById('topologySheflik');
    
    if (sheflikSelect) {
        // Şeflik dropdown'ını populate et
        sheflikSelect.innerHTML = '<option value="">Şeflik Seçin...</option>' +
            sampleSheflikler.map(s => `<option value="${s.name}">${s.name}</option>`).join('');
    }
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
            // internal-vip veya wan-ip için
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
            // internal-vip veya wan-ip için
            destServerField.style.display = 'none';
            destExternalField.style.display = 'block';
            destNameField.style.display = 'block';
        }
    });
    
    // ===== TOPOLOJI ADI DEĞİŞİMİ - SOURCE ADDRESSİ OTOMATIK ÇEKME =====
    const topologyNameInput = document.getElementById('topologyName');
    if (topologyNameInput) {
        topologyNameInput.addEventListener('input', () => {
            const topologyName = topologyNameInput.value.trim();
            // Format: "SUNUCU_ADI(IP)" veya "SUNUCU_ADI(IP.IP.IP.IP)"
            const match = topologyName.match(/^(.+?)\s*\(([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})\)$/);
            
            if (match) {
                const serverName = match[1].trim();
                const serverIp = match[2].trim();
                
                // Source otomatik doldur
                const sourceTypeSelect = document.getElementById('sourceType');
                if (sourceTypeSelect) {
                    sourceTypeSelect.value = 'server';
                    sourceTypeSelect.dispatchEvent(new Event('change'));
                }
                
                // 100ms sonra (change event işlendikten sonra) kaynak sunucu ara
                setTimeout(() => {
                    const sourceServerInput = document.getElementById('sourceServerSearch');
                    if (sourceServerInput) {
                        sourceServerInput.value = serverName + ' ' + serverIp;
                        sourceServerInput.dispatchEvent(new Event('input'));
                        
                        // Listeden otomatik seç
                        setTimeout(() => {
                            const matchingServer = allServers.find(s => 
                                (s.name.toLowerCase().includes(serverName.toLowerCase()) || 
                                 serverName.toLowerCase().includes(s.name.toLowerCase())) &&
                                s.ip === serverIp
                            );
                            
                            if (matchingServer) {
                                document.getElementById('sourceServerId').value = matchingServer.id;
                                sourceServerInput.value = matchingServer.name + ' (' + matchingServer.ip + ')';
                                const serverList = document.getElementById('sourceServerList');
                                if (serverList) serverList.style.display = 'none';
                            }
                        }, 200);
                    }
                }, 100);
            }
        });
    }
    
    // ===== BAĞLANTI EKLE BUTONU =====
    addConnectionBtn.addEventListener('click', () => {
        let source = null, destination = null;
        
        const topologyName = document.getElementById('topologyName')?.value.trim();
        const note = document.getElementById('connectionNote').value.trim();
        const includeFirewall = document.getElementById('includeFirewall').checked;
        const connectionMessage = document.getElementById('connectionMessage');
        
        // Mesajı temizle
        if (connectionMessage) connectionMessage.textContent = '';
        
        console.log('=== BAĞLANTI EKLEME BAŞLADI ===');
        console.log('Topoloji Adı:', topologyName);
        console.log('Seçilen portlar:', selectedPorts);
        console.log('Port sayısı:', selectedPorts.length);
        
        // Topoloji adı validasyonu
        if (!topologyName) {
            if (connectionMessage) connectionMessage.textContent = '⚠️ Topoloji adı giriniz';
            console.warn('⚠️ Topoloji adı girilmedi!');
            return;
        }
        
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
            // internal-vip veya wan-ip için
            const sourceIp = document.getElementById('sourceIp').value.trim();
            const sourceName = document.getElementById('sourceName').value.trim();
            if (!sourceIp) {
                if (connectionMessage) connectionMessage.textContent = '❌ Lütfen kaynak IP adresini girin';
                return;
            }
            const typeLabel = sourceType.value === 'internal-vip' ? 'Internal VIP' : 'WAN IP';
            source = {
                type: sourceType.value,
                name: sourceName || typeLabel,
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
            // internal-vip veya wan-ip için
            const destIp = document.getElementById('destIp').value.trim();
            const destName = document.getElementById('destName').value.trim();
            if (!destIp) {
                if (connectionMessage) connectionMessage.textContent = '❌ Lütfen hedef IP adresini girin';
                return;
            }
            const typeLabel = destType.value === 'internal-vip' ? 'Internal VIP' : 'WAN IP';
            destination = {
                type: destType.value,
                name: destName || typeLabel,
                ip: destIp
            };
        }
        
        // Bağlantı oluştur
        console.log('Eklenecek portlar:', selectedPorts);
        
        // FIREWALL MANTIGI: Aynı source ve firewall'ı kullanarak yeni destination ekle
        // Veya farklı source ise yeni firewall oluştur
        let connection = null;
        
        if (includeFirewall) {
            // Mevcut bağlantılardan aynı source + firewall ile eşleşenini bul
            const existingConnection = canvasData.connections.find(conn => 
                conn.firewall &&
                conn.source.name === source.name &&
                conn.source.ip === source.ip
            );
            
            if (existingConnection) {
                // Mevcut bağlantının destination'una yeni bir tane ekle
                // (aynı firewall'dan farklı destination çıkışı)
                const newDestinationConnection = {
                    id: Date.now(),
                    topologyName: topologyName,
                    source: source,
                    destination: destination,
                    ports: selectedPorts.map(p => ({...p})),
                    firewall: existingConnection.firewall, // Mevcut firewall'ı kullan
                    note: note
                };
                connection = newDestinationConnection;
            } else {
                // Yeni firewall oluştur (farklı source için)
                connection = {
                    id: Date.now(),
                    topologyName: topologyName,
                    source: source,
                    destination: destination,
                    ports: selectedPorts.map(p => ({...p})),
                    firewall: { name: 'Firewall', ip: null },
                    note: note
                };
            }
        } else {
            // Firewall olmadan
            connection = {
                id: Date.now(),
                topologyName: topologyName,
                source: source,
                destination: destination,
                ports: selectedPorts.map(p => ({...p})),
                firewall: null,
                note: note
            };
        }
        
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
            <div style="padding:0.6rem 0.7rem;background:#ffffff;border-radius:0.3rem;border:1px solid var(--border);margin-bottom:0.4rem;">
                ${conn.topologyName ? `<div style="font-weight:700;font-size:0.9rem;color:var(--accent);margin-bottom:0.5rem;display:flex;align-items:center;gap:0.4rem;"><i class="fa fa-sitemap" style="font-size:0.85rem;"></i> ${conn.topologyName}</div>` : ''}
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <div style="flex:1;">
                        ${html}
                        ${conn.note ? `<div style="margin-top:0.4rem;padding:0.3rem 0.5rem;background:rgba(255,159,67,0.08);border-left:2px solid #ff9f43;border-radius:0.2rem;font-size:0.75rem;color:var(--text);max-width:600px;"><strong>📝</strong> ${conn.note}</div>` : ''}
                    </div>
                    <button type="button" onclick="removeConnection(${conn.id})" style="font-size:0.75rem;background:none;border:none;color:var(--error);cursor:pointer;padding:0.3rem 0.5rem;opacity:0.6;transition:opacity 0.2s;margin-left:0.5rem;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.6'" title="Sil">
                        <i class="fa fa-trash"></i>
                    </button>
                </div>
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
            if (!preserveServerFilterOnce) {
                serverCriticalFilter = null;
            }
            preserveServerFilterOnce = false;
            renderServers();
        } else if (targetId === 'ports') {
            renderPorts();
        } else if (targetId === 'topologies') {
            loadAndDisplayTopologies();
        } else if (targetId === 'sheflikler') {
            loadShefliklerFromBackend();
        } else if (targetId === 'admin-list') {
            renderAdminList();
        } else if (targetId === 'access-list') {
            renderAccessList();
        } else if (targetId === 'admin') {
            // LDAP konfigürasyonlarını ve mappings'i yükle
            loadLdapConfigsList();
            loadLdapMappings();
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
    const latestTopologies = getLatestTopologies(3);
    
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
        <div class="info-card" onclick="showServersByCritical('Yüksek')" style="cursor:pointer;transition:transform 0.2s;border-left:4px solid #ef4444;" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
            <div class="card-header">
                <h3>Kritik Sunucu</h3>
                <i class="fa fa-exclamation-triangle" style="color:#ef4444"></i>
            </div>
            <div class="card-value" style="color:#ef4444">${criticalServers}</div>
            <p class="card-meta">Yüksek kritiklik seviyesi</p>
            <div style="display:flex;gap:0.4rem;margin-top:0.4rem;">
                <button class="btn ghost" style="padding:0.25rem 0.5rem;" onclick="event.stopPropagation(); exportServersByCritical('Yüksek','excel')"><i class="fa fa-file-excel"></i></button>
                <button class="btn ghost" style="padding:0.25rem 0.5rem;" onclick="event.stopPropagation(); exportServersByCritical('Yüksek','pdf')"><i class="fa fa-file-pdf"></i></button>
            </div>
        </div>
        <div class="info-card" onclick="showServersByCritical('Orta')" style="cursor:pointer;transition:transform 0.2s;border-left:4px solid #f59e0b;" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
            <div class="card-header">
                <h3>Orta Seviye Sunucu</h3>
                <i class="fa fa-server" style="color:#f59e0b"></i>
            </div>
            <div class="card-value" style="color:#f59e0b">${mediumServers}</div>
            <p class="card-meta">Orta kritiklik seviyesi</p>
            <div style="display:flex;gap:0.4rem;margin-top:0.4rem;">
                <button class="btn ghost" style="padding:0.25rem 0.5rem;" onclick="event.stopPropagation(); exportServersByCritical('Orta','excel')"><i class="fa fa-file-excel"></i></button>
                <button class="btn ghost" style="padding:0.25rem 0.5rem;" onclick="event.stopPropagation(); exportServersByCritical('Orta','pdf')"><i class="fa fa-file-pdf"></i></button>
            </div>
        </div>
        <div class="info-card" onclick="showServersByCritical('Düşük')" style="cursor:pointer;transition:transform 0.2s;border-left:4px solid #10b981;" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
            <div class="card-header">
                <h3>Düşük Seviye Sunucu</h3>
                <i class="fa fa-check-circle" style="color:#10b981"></i>
            </div>
            <div class="card-value" style="color:#10b981">${lowServers}</div>
            <p class="card-meta">Düşük kritiklik seviyesi</p>
            <div style="display:flex;gap:0.4rem;margin-top:0.4rem;">
                <button class="btn ghost" style="padding:0.25rem 0.5rem;" onclick="event.stopPropagation(); exportServersByCritical('Düşük','excel')"><i class="fa fa-file-excel"></i></button>
                <button class="btn ghost" style="padding:0.25rem 0.5rem;" onclick="event.stopPropagation(); exportServersByCritical('Düşük','pdf')"><i class="fa fa-file-pdf"></i></button>
            </div>
        </div>
        <div class="info-card" onclick="showLatestTopologies(10)" style="cursor:pointer;transition:transform 0.2s;background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);color:white;" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
            <div class="card-header">
                <h3 style="color:white;">Son Topolojiler</h3>
                <i class="fa fa-clock-rotate-left" style="color:white"></i>
            </div>
            <div class="card-value" style="color:white;font-size:1.5rem;">
                ${latestTopologies.map(t => `<div style="font-size:0.85rem;margin:0.3rem 0;">${t.topologyName || t.Name || t.name || 'İsimsiz'}</div>`).join('') || '<div style="font-size:0.9rem;">Henüz topoloji yok</div>'}
            </div>
            <p class="card-meta" style="color:rgba(255,255,255,0.8);">Son görüntülenen tasarımlar</p>
        </div>
    `;
}

function parseTopologyDate(value) {
    if (!value) return new Date(0);
    const iso = new Date(value);
    if (!isNaN(iso.getTime())) return iso;
    const match = String(value).match(/(\d{2})\.(\d{2})\.(\d{4})(?:\s*(\d{2}):(\d{2}))?/);
    if (match) {
        const day = parseInt(match[1], 10);
        const month = parseInt(match[2], 10) - 1;
        const year = parseInt(match[3], 10);
        const hour = parseInt(match[4] || '0', 10);
        const minute = parseInt(match[5] || '0', 10);
        return new Date(year, month, day, hour, minute);
    }
    return new Date(0);
}

function getLatestTopologies(count) {
    return [...allTopologies]
        .sort((a, b) => parseTopologyDate(b.date || b.Date) - parseTopologyDate(a.date || a.Date))
        .slice(0, count);
}

function showLatestTopologies(count) {
    pendingLatestTopologiesCount = count;
    switchSection('topologies');
}

function renderLatestTopologies(count) {
    const latest = getLatestTopologies(count);
    const dept = document.getElementById('filterDept');
    const crit = document.getElementById('filterCrit');
    const search = document.getElementById('filterSearch');
    const server = document.getElementById('filterServer');
    if (dept) dept.value = '';
    if (crit) crit.value = '';
    if (search) search.value = '';
    if (server) server.value = '';
    pageSize = 0;
    const sizeSelect = document.getElementById('pageSizeSelect');
    if (sizeSelect) sizeSelect.value = 'all';
    renderTable(latest);
}

function showServersByCritical(level) {
    serverCriticalFilter = level;
    preserveServerFilterOnce = true;
    switchSection('servers');
}

function viewServerTopologies(serverName, serverIp) {
    switchSection('topologies');
    const dept = document.getElementById('filterDept');
    const crit = document.getElementById('filterCrit');
    const search = document.getElementById('filterSearch');
    const server = document.getElementById('filterServer');
    if (dept) dept.value = '';
    if (crit) crit.value = '';
    if (search) search.value = '';
    if (server) server.value = `${serverName} ${serverIp}`.trim();
    applyFilters();
}

function exportServersByCritical(level, format) {
    const servers = allServers.filter(s => s.critical === level);
    if (format === 'excel') {
        let csv = 'Sunucu Adı,IP Adresi,Kritiklik,Tarih\n';
        servers.forEach(s => {
            const row = [s.name || '', s.ip || '', s.critical || '', s.date || '']
                .map(v => `"${v}"`).join(',');
            csv += row + '\n';
        });
        const link = document.createElement('a');
        link.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
        link.download = `Sunucular_${level}_${new Date().toLocaleDateString('tr-TR')}.csv`;
        link.click();
    } else {
        const printWindow = window.open('', '_blank');
        let html = `<h2>${level} Kritiklik Sunucular</h2>`;
        html += '<table border="1" cellpadding="10"><tr><th>Sunucu</th><th>IP</th><th>Kritiklik</th><th>Tarih</th></tr>';
        servers.forEach(s => {
            html += `<tr>
                <td>${s.name || ''}</td>
                <td>${s.ip || ''}</td>
                <td>${s.critical || ''}</td>
                <td>${s.date || ''}</td>
            </tr>`;
        });
        html += '</table>';
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.print();
    }
}

function exportServersCurrentFilter(format) {
    const label = serverCriticalFilter ? serverCriticalFilter : 'Tümü';
    const servers = serverCriticalFilter ? allServers.filter(s => s.critical === serverCriticalFilter) : allServers;
    if (format === 'excel') {
        let csv = 'Sunucu Adı,IP Adresi,Kritiklik,Tarih\n';
        servers.forEach(s => {
            const row = [s.name || '', s.ip || '', s.critical || '', s.date || '']
                .map(v => `"${v}"`).join(',');
            csv += row + '\n';
        });
        const link = document.createElement('a');
        link.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
        link.download = `Sunucular_${label}_${new Date().toLocaleDateString('tr-TR')}.csv`;
        link.click();
    } else {
        const printWindow = window.open('', '_blank');
        let html = `<h2>${label} Sunucular</h2>`;
        html += '<table border="1" cellpadding="10"><tr><th>Sunucu</th><th>IP</th><th>Kritiklik</th><th>Tarih</th></tr>';
        servers.forEach(s => {
            html += `<tr>
                <td>${s.name || ''}</td>
                <td>${s.ip || ''}</td>
                <td>${s.critical || ''}</td>
                <td>${s.date || ''}</td>
            </tr>`;
        });
        html += '</table>';
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.print();
    }
}

function renderServers() {
    renderServersTable();
    if (typeof renderServerLibrary === 'function') renderServerLibrary();
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
            <td class="actions sheflik-actions">
                <button class="btn-edit" onclick="editSheflik(${idx})"><i class="fa fa-pen"></i> Düzenle</button>
                <button class="btn-delete" onclick="deleteSheflik(${idx})"><i class="fa fa-trash"></i> Sil</button>
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

// ======== LDAP ENTEGRASYON YÖNETİMİ ========
let currentEditingMappingId = null;

async function readJsonSafe(response) {
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
        try {
            const data = await response.json();
            return { ok: true, data: data, isHtml: false };
        } catch (error) {
            console.error('JSON parse hatası:', error);
            return { ok: false, data: null, isHtml: false, error: error.message };
        }
    }

    const text = await response.text();
    const trimmed = text.trim();
    const isHtml = contentType.includes('text/html') || /^\s*<!DOCTYPE/i.test(text);
    if (!isHtml && (trimmed.startsWith('{') || trimmed.startsWith('['))) {
        try {
            const data = JSON.parse(trimmed);
            return { ok: true, data: data, isHtml: false };
        } catch (error) {
            console.error('JSON parse hatası (text):', error);
            return { ok: false, data: null, isHtml: false, error: error.message, text };
        }
    }
    return { ok: false, data: null, isHtml, text };
}

function attachLdapIntegration() {
    const ldapConfigForm = document.getElementById('ldapConfigForm');
    const addMappingBtn = document.getElementById('addMappingBtn');
    const ldapMappingForm = document.getElementById('ldapMappingForm');
    const newLdapConfigBtn = document.getElementById('newLdapConfigBtn');
    const closeLdapFormBtn = document.getElementById('closeLdapFormBtn');

    if (window.currentUserRole && window.currentUserRole !== 'Admin') {
        if (newLdapConfigBtn) newLdapConfigBtn.disabled = true;
        if (addMappingBtn) addMappingBtn.disabled = true;
        const msgDiv = document.getElementById('ldapConfigMessage');
        if (msgDiv) {
            msgDiv.textContent = 'Bu alan yalnızca Admin kullanıcılar içindir.';
            msgDiv.style.display = 'block';
            msgDiv.style.background = '#fee2e2';
            msgDiv.style.color = '#991b1b';
            msgDiv.style.border = '1px solid #ef4444';
        }
        return;
    }

    // Sayfa yüklendiğinde konfigürasyonları yükle
    loadLdapConfigsList();

    // Yeni Yapılandırma butonu
    if (newLdapConfigBtn) {
        newLdapConfigBtn.addEventListener('click', () => {
            openLdapConfigForm(null);
        });
    }

    // Formu Kapat butonu
    if (closeLdapFormBtn) {
        closeLdapFormBtn.addEventListener('click', () => {
            closeLdapConfigForm();
        });
    }

    // LDAP Config Kaydetme
    if (ldapConfigForm) {
        ldapConfigForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const nameField = document.getElementById('ldapName');
            if (!nameField.value.trim()) {
                showMessage('ldapConfigMessage', 'LDAP İsmi gereklidir!', 'error');
                return;
            }

            const config = {
                name: nameField.value.trim(),
                host: document.getElementById('ldapHost').value.trim(),
                port: parseInt(document.getElementById('ldapPort').value) || 389,
                baseDn: document.getElementById('ldapBaseDn').value.trim(),
                bindDn: document.getElementById('ldapBindDn').value.trim(),
                bindPassword: document.getElementById('ldapBindPassword').value,
                userSearchFilter: document.getElementById('ldapUserFilter').value.trim() || '(sAMAccountName={0})',
                groupMemberAttribute: document.getElementById('ldapGroupAttr').value.trim() || 'memberOf',
                enableLdap: document.getElementById('ldapEnableLdap').checked,
                enableJitProvisioning: document.getElementById('ldapEnableJit').checked
            };

            try {
                const response = await fetch(`${API_BASE}/ldap/config`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(config)
                });

                if (response.ok) {
                    showMessage('ldapConfigMessage', '✓ LDAP yapılandırması başarıyla kaydedildi!', 'success');
                    setTimeout(() => {
                        closeLdapConfigForm();
                        loadLdapConfigsList();
                    }, 1500);
                } else {
                    const result = await readJsonSafe(response);
                    const errorMsg = result.ok ? (result.data?.message || 'Kayıt başarısız') : (result.error || result.text || 'Kayıt başarısız');
                    showMessage('ldapConfigMessage', '✗ Hata: ' + errorMsg, 'error');
                }
            } catch (error) {
                showMessage('ldapConfigMessage', '✗ Bağlantı hatası: ' + error.message, 'error');
            }
        });
    }

    // LDAP bağlantı testi
    const testLdapBtn = document.getElementById('testLdapBtn');
    if (testLdapBtn) {
        testLdapBtn.addEventListener('click', async () => {
            const msgDiv = document.getElementById('ldapConfigMessage');
            msgDiv.textContent = '⏳ Bağlantı test ediliyor...';
            msgDiv.style.display = 'block';
            msgDiv.style.background = '#dbeafe';
            msgDiv.style.color = '#1e40af';
            msgDiv.style.border = '1px solid #3b82f6';

            try {
                const testConfig = {
                    host: document.getElementById('ldapHost').value.trim(),
                    port: parseInt(document.getElementById('ldapPort').value) || 389,
                    baseDn: document.getElementById('ldapBaseDn').value.trim(),
                    bindDn: document.getElementById('ldapBindDn').value.trim(),
                    bindPassword: document.getElementById('ldapBindPassword').value,
                    userSearchFilter: document.getElementById('ldapUserFilter').value.trim(),
                    groupMemberAttribute: document.getElementById('ldapGroupAttr').value.trim(),
                    enableLdap: document.getElementById('ldapEnableLdap').checked,
                    enableJitProvisioning: document.getElementById('ldapEnableJit').checked
                };

                const response = await fetch(`${API_BASE}/ldap/test`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(testConfig)
                });

                const result = await readJsonSafe(response);
                const data = result.data || {};

                if (response.ok) {
                    // Sunucudan gelen success bayrağını kontrol et
                    if (data.success) {
                        msgDiv.textContent = '✓ ' + (data.message || 'LDAP bağlantısı başarılı!');
                        msgDiv.style.background = '#d1fae5';
                        msgDiv.style.color = '#065f46';
                        msgDiv.style.border = '1px solid #10b981';
                    } else {
                        msgDiv.textContent = '✗ ' + (data.message || 'LDAP bağlantısı başarısız');
                        msgDiv.style.background = '#fee2e2';
                        msgDiv.style.color = '#991b1b';
                        msgDiv.style.border = '1px solid #ef4444';
                    }
                } else {
                    msgDiv.textContent = '✗ Bağlantı başarısız: ' + (data.message || (result.isHtml ? 'Oturum geçersiz, lütfen yeniden giriş yapın.' : 'Bilinmeyen hata'));
                    msgDiv.style.background = '#fee2e2';
                    msgDiv.style.color = '#991b1b';
                    msgDiv.style.border = '1px solid #ef4444';
                }

                setTimeout(() => { msgDiv.style.display = 'none'; }, 4000);
            } catch (error) {
                msgDiv.textContent = '✗ Test hatası: ' + error.message;
                msgDiv.style.background = '#fee2e2';
                msgDiv.style.color = '#991b1b';
                msgDiv.style.border = '1px solid #ef4444';
            }
        });
    }

    // Mapping ekleme butonu
    if (addMappingBtn) {
        addMappingBtn.addEventListener('click', () => {
            currentEditingMappingId = null;
            document.getElementById('ldapMappingModalTitle').textContent = 'Yeni Grup Eşleştirmesi';
            document.getElementById('mappingLdapGroup').value = '';
            const seflikSelect = document.getElementById('mappingSeflikSelect');
            if (seflikSelect) {
                seflikSelect.value = '';
            }
            document.getElementById('mappingRole').value = '';
            document.getElementById('ldapMappingModal').style.display = 'flex';
            // Şeflikleri yükle ve autocomplete'i başlat
            loadSefliklerForMapping();
            setTimeout(() => setupLdapGroupAutocomplete(), 100);
        });
    }



    function normalizeSeflikId(seflikName) {
        if (!seflikName) return '';
        return seflikName
            .toLocaleUpperCase('tr-TR')
            .replace(/[^A-Z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '')
            .replace(/_+/g, '_');
    }

    // LDAP Grup Adı Otomatik Tamamlama
    function setupLdapGroupAutocomplete() {
        const groupInput = document.getElementById('mappingLdapGroup');
        const autocompleteDiv = document.getElementById('ldapGroupAutocomplete');
        
        if (!groupInput || !autocompleteDiv) {
            console.error('Autocomplete elementleri bulunamadı');
            return;
        }

        let debounceTimer;
        
        groupInput.addEventListener('input', async (e) => {
            const searchTerm = e.target.value.trim();
            
            // Debounce - 300ms bekle
            clearTimeout(debounceTimer);
            
            // Az karakterse gösterme
            if (searchTerm.length < 2) {
                autocompleteDiv.style.display = 'none';
                autocompleteDiv.innerHTML = '';
                return;
            }

            debounceTimer = setTimeout(async () => {
                try {
                    // Yapılandırılmış LDAP'ları al (sadece aktif olanı kullan)
                    const configsRes = await fetch(`${API_BASE}/ldap/configs`, { credentials: 'include' });
                    
                    if (!configsRes.ok) {
                        console.error('LDAP configs yüklenemedi:', configsRes.status);
                        autocompleteDiv.innerHTML = '<div style="padding:0.5rem;color:#991b1b;">LDAP yapılandırması yüklenemedi</div>';
                        autocompleteDiv.style.display = 'block';
                        return;
                    }
                    
                    const configsResult = await readJsonSafe(configsRes);
                    const configs = configsResult.data || [];
                    
                    console.log('LDAP Configs:', configs);
                    
                    if (!configs.length) {
                        autocompleteDiv.innerHTML = '<div style="padding:0.5rem;color:#94a3b8;">LDAP yapılandırması yok</div>';
                        autocompleteDiv.style.display = 'block';
                        return;
                    }

                    const configName = configs[0].name;
                    console.log('Grup aranıyor:', searchTerm, 'Config:', configName);
                    
                    // Grupları ara
                    const response = await fetch(`${API_BASE}/ldap/search-groups`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ configName, searchTerm })
                    });

                    if (!response.ok) {
                        console.error('Grup arama başarısız:', response.status);
                        autocompleteDiv.innerHTML = '<div style="padding:0.5rem;color:#991b1b;">Grup araması başarısız</div>';
                        autocompleteDiv.style.display = 'block';
                        return;
                    }

                    const result = await readJsonSafe(response);
                    console.log('Grup arama sonucu:', result);
                    
                    const groups = (result.data?.groups || []).slice(0, 10); // Max 10 sonuç

                    if (groups.length === 0) {
                        autocompleteDiv.innerHTML = '<div style="padding:0.5rem;color:#94a3b8;">Grup bulunamadı</div>';
                    } else {
                        autocompleteDiv.innerHTML = groups.map(group => `
                            <div style="padding:0.6rem 0.75rem;cursor:pointer;border-bottom:1px solid #e2e8f0;transition:background 0.2s;color:#334155;" 
                                 onmouseover="this.style.background='#f1f5f9'"
                                 onmouseout="this.style.background='transparent'"
                                 onclick="selectLdapGroup('${group.replace(/'/g, "\\'")}')">
                                ${escapeHtml(group)}
                            </div>
                        `).join('');
                    }
                    
                    autocompleteDiv.style.display = 'block';
                } catch (error) {
                    console.error('Grup arama hatası:', error);
                    autocompleteDiv.innerHTML = '<div style="padding:0.5rem;color:#991b1b;">Hata: ' + error.message + '</div>';
                    autocompleteDiv.style.display = 'block';
                }
            }, 300);
        });

        // Enter tuşu çalışmasını sağla
        groupInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                autocompleteDiv.style.display = 'none';
            }
        });

        // Dış tıklama kapatma
        document.addEventListener('click', (e) => {
            if (!groupInput.contains(e.target) && !autocompleteDiv.contains(e.target)) {
                autocompleteDiv.style.display = 'none';
            }
        });
    }

    window.selectLdapGroup = function(groupName) {
        const groupInput = document.getElementById('mappingLdapGroup');
        const autocompleteDiv = document.getElementById('ldapGroupAutocomplete');
        
        // Get the base DN from LDAP config to construct proper group DN
        const selectedConfig = document.getElementById('ldapName');
        let cn_value = groupName;
        
        // Usually we set just the CN and let admin add full DN if needed
        groupInput.value = `CN=${cn_value}`;
        autocompleteDiv.style.display = 'none';
        autocompleteDiv.innerHTML = '';
    };

    // Mapping form submit
    if (ldapMappingForm) {
        ldapMappingForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const seflikSelect = document.getElementById('mappingSeflikSelect');
            const seflikName = seflikSelect ? seflikSelect.value.trim() : '';
            if (!seflikName) {
                showNotification('Lütfen bir şeflik seçin', 'error');
                return;
            }

            const mapping = {
                ldapGroupName: document.getElementById('mappingLdapGroup').value.trim(),
                seflikId: normalizeSeflikId(seflikName),
                seflikName: seflikName,
                assignedRole: document.getElementById('mappingRole').value
            };

            try {
                let response;
                if (currentEditingMappingId !== null) {
                    // Güncelleme
                    response = await fetch(`${API_BASE}/ldap/mappings/${currentEditingMappingId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify(mapping)
                    });
                } else {
                    // Yeni ekleme
                    response = await fetch(`${API_BASE}/ldap/mappings`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify(mapping)
                    });
                }

                const result = await readJsonSafe(response);
                const data = result.data || {};
                const msgDiv = document.getElementById('ldapMappingMessage');

                if (response.ok) {
                    msgDiv.textContent = '✓ Eşleştirme başarıyla kaydedildi!';
                    msgDiv.style.display = 'block';
                    msgDiv.style.background = '#d1fae5';
                    msgDiv.style.color = '#065f46';
                    msgDiv.style.border = '1px solid #10b981';
                    
                    setTimeout(() => {
                        closeLdapMappingModal();
                        loadLdapMappings();
                    }, 1000);
                } else {
                    msgDiv.textContent = '✗ Hata: ' + (data.message || (result.isHtml ? 'Oturum geçersiz, lütfen yeniden giriş yapın.' : 'İşlem başarısız'));
                    msgDiv.style.display = 'block';
                    msgDiv.style.background = '#fee2e2';
                    msgDiv.style.color = '#991b1b';
                    msgDiv.style.border = '1px solid #ef4444';
                }
            } catch (error) {
                const msgDiv = document.getElementById('ldapMappingMessage');
                msgDiv.textContent = '✗ Hata: ' + error.message;
                msgDiv.style.display = 'block';
                msgDiv.style.background = '#fee2e2';
                msgDiv.style.color = '#991b1b';
                msgDiv.style.border = '1px solid #ef4444';
            }
        });
    }

    // Mappingleri yükle
    loadLdapMappings();
}

async function loadLdapConfig() {
    try {
        const response = await fetch(`${API_BASE}/ldap/config`, { credentials: 'include' });
        const result = await readJsonSafe(response);
        
        if (!response.ok) {
            console.warn('LDAP config yanıt hatası:', response.status);
            updateLdapConfigStatus(false);
            return;
        }
        
        if (!result.ok) {
            console.warn('readJsonSafe hatası:', result.error || result.text);
            updateLdapConfigStatus(false);
            return;
        }
        
        const config = result.data || {};
        console.log('LDAP config yüklendi:', config);
        
        // Config durumunu kontrol et - şifre varsa (masked bile olsa) yapılandırılmış sayılır
        const isConfigured = config.host && config.baseDn && config.bindDn && config.bindPassword;
        updateLdapConfigStatus(isConfigured);
        
        document.getElementById('ldapHost').value = config.host || '';
        document.getElementById('ldapPort').value = config.port || 389;
        document.getElementById('ldapBaseDn').value = config.baseDn || '';
        document.getElementById('ldapBindDn').value = config.bindDn || '';
        // Password backend'den masked geliyor, boş bırakıyoruz
        const passwordField = document.getElementById('ldapBindPassword');
        passwordField.value = '';
        if (config.bindPassword === '********') {
            passwordField.placeholder = '🔒 Mevcut şifre korunuyor (değiştirmek için yeni şifre girin)';
            passwordField.style.borderColor = '#10b981';
        } else {
            passwordField.placeholder = 'Bind şifresini girin';
            passwordField.style.borderColor = '#cbd5e1';
        }
        document.getElementById('ldapUserFilter').value = config.userSearchFilter || '(sAMAccountName={0})';
        document.getElementById('ldapGroupAttr').value = config.groupMemberAttribute || 'memberOf';
        document.getElementById('ldapEnableLdap').checked = config.enableLdap || false;
        document.getElementById('ldapEnableJit').checked = config.enableJitProvisioning || false;
    } catch (error) {
        console.error('LDAP config yüklenemedi:', error);
        updateLdapConfigStatus(false);
    }
}

function updateLdapConfigStatus(isConfigured) {
    const statusEl = document.getElementById('ldapConfigStatus');
    if (!statusEl) return;
    
    if (isConfigured) {
        statusEl.textContent = '✓ Ekli';
        statusEl.style.display = 'inline-block';
        statusEl.style.background = '#d1fae5';
        statusEl.style.color = '#065f46';
        statusEl.style.border = '1px solid #10b981';
    } else {
        statusEl.textContent = '○ Yapılandırılmamış';
        statusEl.style.display = 'inline-block';
        statusEl.style.background = '#fee2e2';
        statusEl.style.color = '#991b1b';
        statusEl.style.border = '1px solid #ef4444';
    }
}

// LDAP Configurasyonları Listesi
async function loadLdapConfigsList() {
    try {
        const response = await fetch(`${API_BASE}/ldap/configs`, { credentials: 'include' });
        const result = await readJsonSafe(response);

        const listDiv = document.getElementById('ldapConfigsList');
        const emptyDiv = document.getElementById('ldapConfigsEmpty');

        if (!listDiv || !emptyDiv) {
            console.error('LDAP DOM elemanları bulunamadı');
            return;
        }

        if (!response.ok) {
            console.error('LDAP configs API hatası:', response.status, result.data || result.text);
            listDiv.innerHTML = '';
            emptyDiv.style.display = 'block';
            emptyDiv.textContent = 'LDAP yapılandırmaları yüklenemedi. Admin olarak giriş yapın.';
            return;
        }

        if (!result.ok) {
            console.warn('LDAP configs JSON hatası:', result.error || result.text);
            listDiv.innerHTML = '';
            emptyDiv.style.display = 'block';
            emptyDiv.textContent = 'LDAP yapılandırmaları yüklenirken hata oluştu.';
            return;
        }

        // API direkt array döndürüyor
        const configs = Array.isArray(result.data) ? result.data : [];
        console.log('LDAP configs yüklendi:', configs);

        if (configs.length === 0) {
            listDiv.innerHTML = '';
            emptyDiv.style.display = 'block';
            return;
        }

        emptyDiv.style.display = 'none';
        listDiv.innerHTML = configs.filter(c => c && c.name).map(config => `
            <div style="background:#fff;border:1px solid #cbd5e1;border-radius:0.5rem;padding:1rem;cursor:pointer;transition:all 0.2s;hover:box-shadow:0 4px 12px rgba(0,0,0,0.1);" onclick="openLdapConfigForm('${(config.name || '').replace(/'/g, "\\'")}')">
                <div style="display:flex;align-items:start;justify-content:space-between;margin-bottom:0.8rem;">
                    <div>
                        <h4 style="margin:0;color:#1e293b;font-weight:600;">${escapeHtml(config.name || '')}</h4>
                        <small style="color:#64748b;">${config.host || 'Not configured'}</small>
                    </div>
                    <span style="padding:0.3rem 0.6rem;background:${config.enableLdap ? '#d1fae5' : '#fee2e2'};color:${config.enableLdap ? '#065f46' : '#991b1b'};border-radius:0.3rem;font-size:0.75rem;font-weight:600;white-space:nowrap;">
                        ${config.enableLdap ? '✓ Aktif' : '○ Devre Dışı'}
                    </span>
                </div>
                <div style="display:flex;gap:0.5rem;margin-top:0.8rem;">
                    <button type="button" class="btn ghost" style="flex:1;padding:0.4rem;font-size:0.85rem;white-space:nowrap;" onclick="event.stopPropagation(); editLdapConfig('${(config.name || '').replace(/'/g, "\\'")}')" title="Düzenle"><i class="fa fa-edit"></i> Düzenle</button>
                    <button type="button" class="btn ghost" style="flex:1;padding:0.4rem;font-size:0.85rem;color:#ef4444;white-space:nowrap;" onclick="event.stopPropagation(); deleteLdapConfig('${(config.name || '').replace(/'/g, "\\'")}')" title="Sil"><i class="fa fa-trash"></i> Sil</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('LDAP configs listesi yüklenemedi:', error);
        const listDiv = document.getElementById('ldapConfigsList');
        const emptyDiv = document.getElementById('ldapConfigsEmpty');
        if (listDiv && emptyDiv) {
            listDiv.innerHTML = '';
            emptyDiv.style.display = 'block';
            emptyDiv.textContent = 'Hata: ' + error.message;
        }
    }
}

function openLdapConfigForm(name) {
    const formSection = document.getElementById('ldapConfigFormSection');
    const formTitle = document.getElementById('ldapFormTitle');
    const nameField = document.getElementById('ldapName');

    if (name) {
        formTitle.innerHTML = '<i class="fa fa-cog"></i> LDAP Sunucu Ayarlarını Düzenle';
        nameField.readOnly = true; // İsim değiştirilemez
        loadLdapConfigToForm(name);
    } else {
        formTitle.innerHTML = '<i class="fa fa-cog"></i> Yeni LDAP Sunucu Yapılandırması';
        nameField.readOnly = false;
        clearLdapConfigForm();
    }

    formSection.style.display = 'block';
    window.scrollTo({ top: document.getElementById('ldapConfigFormSection').offsetTop, behavior: 'smooth' });
}

function closeLdapConfigForm() {
    document.getElementById('ldapConfigFormSection').style.display = 'none';
    clearLdapConfigForm();
}

function clearLdapConfigForm() {
    document.getElementById('ldapName').value = '';
    document.getElementById('ldapHost').value = '';
    document.getElementById('ldapPort').value = '389';
    document.getElementById('ldapBaseDn').value = '';
    document.getElementById('ldapBindDn').value = '';
    document.getElementById('ldapBindPassword').value = '';
    document.getElementById('ldapBindPassword').placeholder = '••••••••';
    document.getElementById('ldapBindPassword').style.borderColor = '#cbd5e1';
    document.getElementById('ldapUserFilter').value = '(sAMAccountName={0})';
    document.getElementById('ldapGroupAttr').value = 'memberOf';
    document.getElementById('ldapEnableLdap').checked = false;
    document.getElementById('ldapEnableJit').checked = false;
    document.getElementById('ldapConfigMessage').style.display = 'none';
}

async function loadLdapConfigToForm(name) {
    try {
        const response = await fetch(`${API_BASE}/ldap/config?name=${encodeURIComponent(name)}`, { credentials: 'include' });
        const result = await readJsonSafe(response);

        if (!response.ok || !result.ok) {
            showMessage('ldapConfigMessage', 'Yapılandırma yüklenemedi', 'error');
            return;
        }

        const config = result.data || {};
        document.getElementById('ldapName').value = config.name || '';
        document.getElementById('ldapHost').value = config.host || '';
        document.getElementById('ldapPort').value = config.port || 389;
        document.getElementById('ldapBaseDn').value = config.baseDn || '';
        document.getElementById('ldapBindDn').value = config.bindDn || '';
        document.getElementById('ldapBindPassword').value = '';
        
        if (config.bindPassword === '********') {
            document.getElementById('ldapBindPassword').placeholder = '🔒 Mevcut şifre korunuyor (değiştirmek için yeni şifre girin)';
            document.getElementById('ldapBindPassword').style.borderColor = '#10b981';
        } else {
            document.getElementById('ldapBindPassword').placeholder = '••••••••';
            document.getElementById('ldapBindPassword').style.borderColor = '#cbd5e1';
        }

        document.getElementById('ldapUserFilter').value = config.userSearchFilter || '(sAMAccountName={0})';
        document.getElementById('ldapGroupAttr').value = config.groupMemberAttribute || 'memberOf';
        document.getElementById('ldapEnableLdap').checked = config.enableLdap || false;
        document.getElementById('ldapEnableJit').checked = config.enableJitProvisioning || false;
    } catch (error) {
        console.error('Yapılandırma yüklenemedi:', error);
        showMessage('ldapConfigMessage', 'Yapılandırma yüklenemedi: ' + error.message, 'error');
    }
}

function editLdapConfig(name) {
    openLdapConfigForm(name);
}

async function deleteLdapConfig(name) {
    if (!confirm(`"${name}" yapılandırmasını silmek istediğinize emin misiniz?`)) return;

    try {
        const response = await fetch(`${API_BASE}/ldap/config/${encodeURIComponent(name)}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (response.ok) {
            showMessage('ldapConfigMessage', '✓ Yapılandırma başarıyla silindi!', 'success');
            setTimeout(() => loadLdapConfigsList(), 1000);
        } else {
            showMessage('ldapConfigMessage', '✗ Silme başarısız!', 'error');
        }
    } catch (error) {
        showMessage('ldapConfigMessage', '✗ Hata: ' + error.message, 'error');
    }
}

function showMessage(elementId, text, type) {
    const msgDiv = document.getElementById(elementId);
    if (!msgDiv) return;
    
    msgDiv.textContent = text;
    msgDiv.style.display = 'block';
    
    if (type === 'success') {
        msgDiv.style.background = '#d1fae5';
        msgDiv.style.color = '#065f46';
        msgDiv.style.border = '1px solid #10b981';
    } else if (type === 'error') {
        msgDiv.style.background = '#fee2e2';
        msgDiv.style.color = '#991b1b';
        msgDiv.style.border = '1px solid #ef4444';
    } else {
        msgDiv.style.background = '#dbeafe';
        msgDiv.style.color = '#0c4a6e';
        msgDiv.style.border = '1px solid #0284c7';
    }
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Global - Mapping formunda şeflikleri yükle
async function loadSefliklerForMapping() {
    try {
        const response = await fetch(`${API_BASE}/sheflik/list`, { credentials: 'include' });
        if (response.ok) {
            const sheflikler = await response.json();
            const select = document.getElementById('mappingSeflikSelect');
            if (select) {
                select.innerHTML = '<option value="">Şeflik seçiniz...</option>';
                sheflikler.forEach(s => {
                    const opt = document.createElement('option');
                    const name = s.name || s.Name || '';
                    opt.value = name;
                    opt.textContent = name;
                    select.appendChild(opt);
                });
            }
        } else {
            console.error('Şeflikler yüklenemedi: HTTP', response.status);
        }
    } catch (error) {
        console.error('Şeflikler yüklenemedi:', error);
    }
}

async function loadLdapMappings() {
    try {
        const response = await fetch(`${API_BASE}/ldap/mappings`, { credentials: 'include' });
        
        if (!response.ok) {
            console.warn('LDAP mappings yanıt hatası:', response.status);
            if (response.status === 401 || response.status === 403) {
                console.warn('Yetki hatası - Admin olarak giriş yapın');
            }
            return;
        }
        
        const result = await readJsonSafe(response);
        
        if (!result.ok) {
            if (result.isHtml) {
                console.warn('LDAP mappings alınamadı: oturum geçersiz veya yetkisiz.');
            } else {
                console.error('LDAP mappings JSON hatası:', result.error || result.text);
            }
            return;
        }

        const mappings = Array.isArray(result.data) ? result.data : [];
        console.log('LDAP mappings yüklendi:', mappings.length, 'adet');
        
        const tbody = document.getElementById('ldapMappingsBody');
        if (!tbody) {
            console.error('ldapMappingsBody elementi bulunamadı');
            return;
        }
        
        if (!mappings || mappings.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align:center;padding:2rem;color:#94a3b8;">
                        <i class="fa fa-inbox" style="font-size:2rem;margin-bottom:0.5rem;display:block;"></i>
                        Henüz eşleştirme eklenmemiş. "Yeni Eşleştirme Ekle" butonuna tıklayın.
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = mappings.map(m => {
            const roleColor = m.assignedRole === 'Admin' ? '#ef4444' : m.assignedRole === 'SheflikYetkilisi' ? '#3b82f6' : '#10b981';
            const roleName = m.assignedRole === 'Admin' ? 'Admin' : m.assignedRole === 'SheflikYetkilisi' ? 'Şeflik Yetkilisi' : 'Kullanıcı';
            
            return `
                <tr style="border-bottom:1px solid #e2e8f0;">
                    <td style="padding:0.75rem;font-family:monospace;font-size:0.9rem;color:#475569;">${m.ldapGroupName || m.LdapGroupName}</td>
                    <td style="padding:0.75rem;"><span style="background:#f1f5f9;padding:0.3rem 0.6rem;border-radius:0.4rem;font-weight:600;color:#334155;">${m.seflikId || m.SeflikId}</span></td>
                    <td style="padding:0.75rem;color:#1e293b;font-weight:500;">${m.seflikName || m.SeflikName}</td>
                    <td style="padding:0.75rem;"><span style="background:${roleColor};color:#fff;padding:0.3rem 0.8rem;border-radius:0.4rem;font-weight:600;font-size:0.85rem;">${roleName}</span></td>
                    <td style="padding:0.75rem;text-align:center;">
                        <button onclick="editLdapMapping(${m.id || m.Id})" class="btn" style="padding:0.4rem 0.8rem;margin-right:0.5rem;background:#f1f5f9;color:#334155;border:1px solid #cbd5e1;"><i class="fa fa-pen"></i></button>
                        <button onclick="deleteLdapMapping(${m.id || m.Id})" class="btn danger" style="padding:0.4rem 0.8rem;"><i class="fa fa-trash"></i></button>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (error) {
        console.error('LDAP mappings yüklenemedi:', error);
    }
}

window.editLdapMapping = async function(id) {
    try {
        const response = await fetch(`${API_BASE}/ldap/mappings`, { credentials: 'include' });
        if (response.ok) {
            const mappings = await response.json();
            const mapping = mappings.find(m => (m.id || m.Id) === id);
            
            if (mapping) {
                currentEditingMappingId = id;
                document.getElementById('ldapMappingModalTitle').textContent = 'Grup Eşleştirmesini Düzenle';
                document.getElementById('mappingLdapGroup').value = mapping.ldapGroupName || mapping.LdapGroupName;
                await loadSefliklerForMapping();
                const seflikSelect = document.getElementById('mappingSeflikSelect');
                const seflikName = mapping.seflikName || mapping.SeflikName || '';
                if (seflikSelect) {
                    seflikSelect.value = seflikName;
                }
                document.getElementById('mappingRole').value = mapping.assignedRole || mapping.AssignedRole;
                document.getElementById('ldapMappingModal').style.display = 'flex';
            }
        }
    } catch (error) {
        console.error('Mapping yüklenemedi:', error);
        alert('Eşleştirme yüklenemedi');
    }
}

window.deleteLdapMapping = async function(id) {
    if (!confirm('Bu eşleştirmeyi silmek istediğinize emin misiniz?')) return;

    try {
        const response = await fetch(`${API_BASE}/ldap/mappings/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (response.ok) {
            showNotification('Eşleştirme başarıyla silindi', 'success');
            loadLdapMappings();
        } else {
            const data = await response.json();
            showNotification('Silme başarısız: ' + (data.message || 'Bilinmeyen hata'), 'error');
        }
    } catch (error) {
        showNotification('Silme hatası: ' + error.message, 'error');
    }
}

window.closeLdapMappingModal = function() {
    document.getElementById('ldapMappingModal').style.display = 'none';
    document.getElementById('ldapMappingMessage').style.display = 'none';
    currentEditingMappingId = null;
}

// ============== KULLANICI YÖNETİMİ ==============
let currentEditingUser = null;
let allTopologiesForSelection = [];

function attachUserManagement() {
    const addUserBtn = document.getElementById('addUserBtn');
    const addAdminBtn = document.getElementById('addAdminBtn');
    const userForm = document.getElementById('userForm');
    const adminUserForm = document.getElementById('adminUserForm');

    if (addUserBtn) {
        addUserBtn.addEventListener('click', () => openUserModal());
    }

    if (addAdminBtn) {
        addAdminBtn.addEventListener('click', () => openAdminUserModal());
    }

    if (userForm) {
        userForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await saveUser();
        });
    }

    if (adminUserForm) {
        adminUserForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await saveAdminUser();
        });
    }

    // Kullanıcıları yükle
    loadUsers();
    
    // Şeflik dropdown'ını doldur
    populateSheflikDropdown();
    
    // Topoloji listesini yükle
    loadTopologiesForSelection();
}

async function loadUsers() {
    // Sadece Admin kullanıcılar için kullanıcı listesini yükle
    if (window.currentUserRole !== 'Admin') {
        console.log('Kullanıcı listesi sadece Admin kullanıcılar için yüklenebilir');
        return;
    }

    try {
        const adminTable = document.getElementById('adminUsersTable');
        const usersTable = document.getElementById('usersTable');
        if (adminTable) {
            adminTable.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#94a3b8;">Yükleniyor...</td></tr>';
        }
        if (usersTable) {
            usersTable.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#94a3b8;">Yükleniyor...</td></tr>';
        }

        const response = await fetch(`${API_BASE}/user/list`, { credentials: 'include' });
        if (!response.ok) {
            console.error('Kullanıcılar yüklenemedi, status:', response.status);
            if (adminTable) {
                adminTable.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#ef4444;">Kullanıcı listesi alınamadı</td></tr>';
            }
            if (usersTable) {
                usersTable.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#ef4444;">Kullanıcı listesi alınamadı</td></tr>';
            }
            return;
        }

        const result = await readJsonSafe(response);
        if (!result.ok || result.isHtml) {
            console.error('Kullanıcılar yüklenirken hata:', result.error || 'HTML response');
            if (adminTable) {
                adminTable.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#ef4444;">Oturum geçersiz veya veri okunamadı</td></tr>';
            }
            if (usersTable) {
                usersTable.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#ef4444;">Oturum geçersiz veya veri okunamadı</td></tr>';
            }
            return;
        }

        const users = result.data;
        if (!Array.isArray(users)) {
            console.error('Kullanıcı listesi formatı hatalı:', users);
            if (adminTable) {
                adminTable.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#ef4444;">Kullanıcı listesi formatı hatalı</td></tr>';
            }
            if (usersTable) {
                usersTable.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#ef4444;">Kullanıcı listesi formatı hatalı</td></tr>';
            }
            return;
        }
        
        // Admin kullanıcıları
        const admins = users.filter(u => (u.role || u.Role) === 'Admin');
        if (adminTable) {
            if (admins.length === 0) {
                adminTable.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#94a3b8;">Henüz admin kullanıcı eklenmemiş</td></tr>';
            } else {
                adminTable.innerHTML = admins.map(u => {
                    const isLdap = (u.isLdapUser ?? u.IsLdapUser);
                    const username = u.username || u.Username;
                    const isAdminUser = username === 'admin';
                    return `
                    <tr>
                        <td><strong>${username}</strong></td>
                        <td><span style="padding:0.3rem 0.6rem;border-radius:0.3rem;background:${isLdap ? '#dbeafe' : '#fef3c7'};color:${isLdap ? '#1e40af' : '#92400e'};font-size:0.85rem;">${isLdap ? 'LDAP' : 'Lokal'}</span></td>
                        <td>${new Date(u.createdAt || u.CreatedAt).toLocaleDateString('tr-TR')}</td>
                        <td>
                            <button onclick="editUser('${username}')" class="btn-edit" ${isAdminUser ? 'disabled' : ''}><i class="fa fa-edit"></i> Düzenle</button>
                            ${!isLdap ? `<button onclick="openChangePasswordModal('${username}')" class="btn-primary" style="padding:0.4rem 0.8rem;font-size:0.85rem;margin:0 0.3rem;"><i class="fa fa-key"></i> Şifre</button>` : ''}
                            <button onclick="deleteUser('${username}')" class="btn-delete" ${isAdminUser ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}><i class="fa fa-trash"></i> Sil</button>
                        </td>
                    </tr>
                    `;
                }).join('');
            }
        }

        // Diğer kullanıcılar
        const otherUsers = users.filter(u => (u.role || u.Role) !== 'Admin');
        if (usersTable) {
            if (otherUsers.length === 0) {
                usersTable.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#94a3b8;">Henüz kullanıcı eklenmemiş</td></tr>';
            } else {
                usersTable.innerHTML = otherUsers.map(u => {
                    const role = u.role || u.Role;
                    const roleColor = role === 'SheflikYetkilisi' ? '#3b82f6' : '#10b981';
                    const roleName = role === 'SheflikYetkilisi' ? 'Şeflik Yetkilisi' : 'Kullanıcı';
                    const allowedIds = u.allowedTopologyIds || u.AllowedTopologyIds || [];
                    const permType = (u.permissionType || u.PermissionType) === 'Specific' ? `Spesifik (${allowedIds.length} sunucu)` : 'Şeflik Bazlı';
                    const isLdapUser = (u.isLdapUser ?? u.IsLdapUser);
                    const username = u.username || u.Username;
                    const seflikName = u.seflikName || u.SeflikName || '-';
                    const createdAt = new Date(u.createdAt || u.CreatedAt).toLocaleDateString('tr-TR');
                    
                    return `
                        <tr>
                            <td><strong>${username}</strong></td>
                            <td><span style="padding:0.3rem 0.6rem;border-radius:0.3rem;background:${roleColor}15;color:${roleColor};font-size:0.85rem;">${roleName}</span></td>
                            <td>${seflikName}</td>
                            <td><span style="font-size:0.85rem;color:#64748b;">${permType}</span></td>
                            <td><span style="padding:0.3rem 0.6rem;border-radius:0.3rem;background:${isLdapUser ? '#dbeafe' : '#fef3c7'};color:${isLdapUser ? '#1e40af' : '#92400e'};font-size:0.85rem;">${isLdapUser ? 'LDAP' : 'Lokal'}</span></td>
                            <td>${createdAt}</td>
                            <td>
                                <button onclick="editUser('${username}')" class="btn-edit"><i class="fa fa-edit"></i> Düzenle</button>
                                <button onclick="deleteUser('${username}')" class="btn-delete"><i class="fa fa-trash"></i> Sil</button>
                            </td>
                        </tr>
                    `;
                }).join('');
            }
        }
    } catch (error) {
        console.error('Kullanıcılar yüklenirken hata:', error);
    }
}

function openUserModal(defaultRole = null) {
    currentEditingUser = null;
    document.getElementById('userModalTitle').textContent = 'Yeni Giriş Yetkilisi';
    document.getElementById('userForm').reset();
    
    // Lokal kullanıcı seçili
    document.querySelector('input[name="userType"][value="local"]').checked = true;
    toggleUserType();
    
    // Şeflik bazlı seçili
    document.querySelector('input[name="permType"][value="Sheflik"]').checked = true;
    togglePermType();
    
    // LDAP kullanıcı autocomplete'i başlat
    setTimeout(() => setupLdapUserAutocomplete('user'), 100);
    
    document.getElementById('userModal').style.display = 'flex';
}

function openAdminUserModal() {
    currentEditingUser = null;
    document.getElementById('adminUserModalTitle').textContent = 'Yeni Admin Kullanıcı';
    document.getElementById('adminUserForm').reset();
    
    // Lokal kullanıcı seçili
    document.querySelector('input[name="adminUserType"][value="local"]').checked = true;
    toggleAdminUserType();
    
    // LDAP kullanıcı autocomplete'i başlat
    setTimeout(() => setupLdapUserAutocomplete('admin'), 100);
    
    document.getElementById('adminUserModal').style.display = 'flex';
}

// LDAP Kullanıcı Autocomplete
function setupLdapUserAutocomplete(modalType) {
    const inputId = modalType === 'admin' ? 'adminUsername' : 'userUsername';
    const autocompleteId = modalType === 'admin' ? 'adminUserAutocomplete' : 'userAutocomplete';
    const userTypeRadioName = modalType === 'admin' ? 'adminUserType' : 'userType';
    
    const userInput = document.getElementById(inputId);
    const autocompleteDiv = document.getElementById(autocompleteId);
    
    if (!userInput || !autocompleteDiv) {
        console.error('User autocomplete elementleri bulunamadı');
        return;
    }

    let debounceTimer;
    
    userInput.addEventListener('input', async (e) => {
        const searchTerm = e.target.value.trim();
        
        // Sadece LDAP kullanıcı seçiliyse autocomplete çalışsın
        const isLdap = document.querySelector(`input[name="${userTypeRadioName}"]:checked`)?.value === 'ldap';
        
        if (!isLdap || searchTerm.length < 2) {
            autocompleteDiv.style.display = 'none';
            autocompleteDiv.innerHTML = '';
            return;
        }

        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(async () => {
            try {
                // LDAP config'i al
                const configsRes = await fetch(`${API_BASE}/ldap/configs`, { credentials: 'include' });
                
                if (!configsRes.ok) {
                    console.error('LDAP configs yüklenemedi');
                    return;
                }
                
                const configsResult = await readJsonSafe(configsRes);
                const configs = configsResult.data || [];
                
                if (!configs.length) {
                    autocompleteDiv.innerHTML = '<div style="padding:0.5rem;color:#94a3b8;">LDAP yapılandırması yok</div>';
                    autocompleteDiv.style.display = 'block';
                    return;
                }

                const configName = configs[0].name;
                
                // Kullanıcıları ara
                const response = await fetch(`${API_BASE}/ldap/search-users`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ configName, searchTerm })
                });

                if (!response.ok) {
                    console.error('Kullanıcı arama başarısız:', response.status);
                    return;
                }

                const result = await readJsonSafe(response);
                const users = (result.data?.users || []).slice(0, 10);

                if (users.length === 0) {
                    autocompleteDiv.innerHTML = '<div style="padding:0.5rem;color:#94a3b8;">Kullanıcı bulunamadı</div>';
                } else {
                    autocompleteDiv.innerHTML = users.map(user => {
                        // "username (Display Name)" formatından username'i çıkar
                        const username = user.split(' (')[0];
                        return `
                            <div style="padding:0.6rem 0.75rem;cursor:pointer;border-bottom:1px solid #e2e8f0;transition:background 0.2s;color:#334155;" 
                                 onmouseover="this.style.background='#f1f5f9'"
                                 onmouseout="this.style.background='transparent'"
                                 onclick="selectLdapUser('${username.replace(/'/g, "\\'")}', '${modalType}')">
                                ${escapeHtml(user)}
                            </div>
                        `;
                    }).join('');
                }
                
                autocompleteDiv.style.display = 'block';
            } catch (error) {
                console.error('Kullanıcı arama hatası:', error);
                autocompleteDiv.innerHTML = '<div style="padding:0.5rem;color:#991b1b;">Hata: ' + error.message + '</div>';
                autocompleteDiv.style.display = 'block';
            }
        }, 300);
    });

    // Escape tuşu ile kapat
    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            autocompleteDiv.style.display = 'none';
        }
    });
}

window.selectLdapUser = function(username, modalType) {
    const inputId = modalType === 'admin' ? 'adminUsername' : 'userUsername';
    const autocompleteId = modalType === 'admin' ? 'adminUserAutocomplete' : 'userAutocomplete';
    
    const userInput = document.getElementById(inputId);
    const autocompleteDiv = document.getElementById(autocompleteId);
    
    userInput.value = username;
    autocompleteDiv.style.display = 'none';
    autocompleteDiv.innerHTML = '';
};

window.editUser = async function(username) {
    try {
        const response = await fetch(`${API_BASE}/user/list`, { credentials: 'include' });
        if (!response.ok) return;
        
        const users = await response.json();
        const user = users.find(u => u.username === username);
        
        if (user) {
            currentEditingUser = username;
            document.getElementById('userModalTitle').textContent = 'Kullanıcıyı Düzenle';
            document.getElementById('userUsername').value = user.username;
            document.getElementById('userUsername').readOnly = true;
            document.getElementById('userRole').value = user.role;
            
            // Şeflik seç
            const seflikSelect = document.getElementById('userSeflik');
            for (let opt of seflikSelect.options) {
                if (opt.value === user.seflikId) {
                    opt.selected = true;
                    break;
                }
            }
            
            // Kullanıcı tipi
            if (user.isLdapUser) {
                document.querySelector('input[name="userType"][value="ldap"]').checked = true;
            } else {
                document.querySelector('input[name="userType"][value="local"]').checked = true;
            }
            toggleUserType();
            
            // İzin tipi
            document.querySelector(`input[name="permType"][value="${user.permissionType}"]`).checked = true;
            togglePermType();
            
            // Spesifik sunucular
            if (user.permissionType === 'Specific' && user.allowedTopologyIds) {
                setTimeout(() => {
                    user.allowedTopologyIds.forEach(id => {
                        const checkbox = document.querySelector(`#topologyCheckboxes input[value="${id}"]`);
                        if (checkbox) checkbox.checked = true;
                    });
                }, 500);
            }
            
            document.getElementById('userModal').style.display = 'flex';
        }
    } catch (error) {
        console.error('Kullanıcı yüklenemedi:', error);
    }
}

window.deleteUser = async function(username) {
    if (!confirm(`"${username}" kullanıcısını silmek istediğinize emin misiniz?`)) return;
    
    try {
        const response = await fetch(`${API_BASE}/user/delete/${username}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        
        if (response.ok) {
            showNotification('Kullanıcı başarıyla silindi', 'success');
            loadUsers();
        } else {
            const data = await response.json();
            showNotification('Silme başarısız: ' + (data.message || 'Bilinmeyen hata'), 'error');
        }
    } catch (error) {
        showNotification('Silme hatası: ' + error.message, 'error');
    }
}

async function saveUser() {
    const username = document.getElementById('userUsername').value.trim();
    const password = document.getElementById('userPassword').value;
    const seflikSelect = document.getElementById('userSeflik');
    const seflikId = seflikSelect.value;
    const seflikName = seflikSelect.options[seflikSelect.selectedIndex]?.text;
    const isLdapUser = document.querySelector('input[name="userType"]:checked').value === 'ldap';
    const permType = document.querySelector('input[name="permType"]:checked').value;
    
    // Spesifik sunucuları topla
    let allowedTopologyIds = [];
    if (permType === 'Specific') {
        const checkboxes = document.querySelectorAll('#topologyCheckboxes input[type="checkbox"]:checked');
        allowedTopologyIds = Array.from(checkboxes).map(cb => cb.value);
    }
    
    const userData = {
        username,
        password: password || null,
        role: 'User', // Giriş yetkilisi her zaman User rolü
        seflikId: seflikId || null,
        seflikName: seflikName !== 'Seçiniz...' ? seflikName : null,
        isLdapUser,
        permissionType: permType,
        allowedTopologyIds
    };
    
    try {
        const url = currentEditingUser ? `${API_BASE}/user/update` : `${API_BASE}/user/add`;
        const response = await fetch(url, {
            method: currentEditingUser ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(userData)
        });
        
        const msgDiv = document.getElementById('userModalMessage');
        
        if (response.ok) {
            msgDiv.textContent = '✓ Kullanıcı başarıyla kaydedildi!';
            msgDiv.style.display = 'block';
            msgDiv.style.background = '#d1fae5';
            msgDiv.style.color = '#065f46';
            msgDiv.style.border = '1px solid #10b981';
            
            setTimeout(() => {
                closeUserModal();
                loadUsers();
            }, 1500);
        } else {
            const data = await response.json();
            msgDiv.textContent = '✗ Hata: ' + (data.message || 'Kayıt başarısız');
            msgDiv.style.display = 'block';
            msgDiv.style.background = '#fee2e2';
            msgDiv.style.color = '#991b1b';
            msgDiv.style.border = '1px solid #ef4444';
        }
    } catch (error) {
        const msgDiv = document.getElementById('userModalMessage');
        msgDiv.textContent = '✗ Bağlantı hatası: ' + error.message;
        msgDiv.style.display = 'block';
        msgDiv.style.background = '#fee2e2';
        msgDiv.style.color = '#991b1b';
        msgDiv.style.border = '1px solid #ef4444';
    }
}

async function saveAdminUser() {
    const username = document.getElementById('adminUsername').value.trim();
    const password = document.getElementById('adminPassword').value;
    const isLdapUser = document.querySelector('input[name="adminUserType"]:checked').value === 'ldap';
    
    // LDAP kullanıcısı seçiliyse şifre zorunlu değil
    if (!isLdapUser && !password && !currentEditingUser) {
        const msgDiv = document.getElementById('adminUserModalMessage');
        msgDiv.textContent = '✗ Lokal kullanıcılar için şifre zorunludur';
        msgDiv.style.display = 'block';
        msgDiv.style.background = '#fee2e2';
        msgDiv.style.color = '#991b1b';
        msgDiv.style.border = '1px solid #ef4444';
        return;
    }
    
    const userData = {
        username,
        password: password || null,
        role: 'Admin', // Admin rolü sabit
        seflikId: null,
        seflikName: null,
        isLdapUser,
        permissionType: 'Sheflik',
        allowedTopologyIds: []
    };
    
    try {
        const url = currentEditingUser ? `${API_BASE}/user/update` : `${API_BASE}/user/add`;
        const response = await fetch(url, {
            method: currentEditingUser ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(userData)
        });
        
        const msgDiv = document.getElementById('adminUserModalMessage');
        
        if (response.ok) {
            msgDiv.textContent = '✓ Admin kullanıcı başarıyla kaydedildi!';
            msgDiv.style.display = 'block';
            msgDiv.style.background = '#d1fae5';
            msgDiv.style.color = '#065f46';
            msgDiv.style.border = '1px solid #10b981';
            
            setTimeout(() => {
                closeAdminUserModal();
                loadUsers();
            }, 1500);
        } else {
            const data = await response.json();
            msgDiv.textContent = '✗ Hata: ' + (data.message || 'Kayıt başarısız');
            msgDiv.style.display = 'block';
            msgDiv.style.background = '#fee2e2';
            msgDiv.style.color = '#991b1b';
            msgDiv.style.border = '1px solid #ef4444';
        }
    } catch (error) {
        const msgDiv = document.getElementById('adminUserModalMessage');
        msgDiv.textContent = '✗ Bağlantı hatası: ' + error.message;
        msgDiv.style.display = 'block';
        msgDiv.style.background = '#fee2e2';
        msgDiv.style.color = '#991b1b';
        msgDiv.style.border = '1px solid #ef4444';
    }
}

window.closeUserModal = function() {
    document.getElementById('userModal').style.display = 'none';
    document.getElementById('userModalMessage').style.display = 'none';
    document.getElementById('userUsername').readOnly = false;
    currentEditingUser = null;
}

window.closeAdminUserModal = function() {
    document.getElementById('adminUserModal').style.display = 'none';
    document.getElementById('adminUserModalMessage').style.display = 'none';
    document.getElementById('adminUsername').readOnly = false;
    currentEditingUser = null;
}

window.toggleUserType = function() {
    const isLdap = document.querySelector('input[name="userType"]:checked').value === 'ldap';
    const passwordField = document.getElementById('passwordField');
    const passwordInput = document.getElementById('userPassword');
    
    if (isLdap) {
        passwordField.style.display = 'none';
        passwordInput.required = false;
        document.getElementById('localUserLabel').style.borderColor = '#e2e8f0';
        document.getElementById('localUserLabel').style.background = '#fff';
        document.getElementById('ldapUserLabel').style.borderColor = '#3b82f6';
        document.getElementById('ldapUserLabel').style.background = '#eff6ff';
    } else {
        passwordField.style.display = 'block';
        passwordInput.required = !currentEditingUser; // Düzenlemede zorunlu değil
        document.getElementById('localUserLabel').style.borderColor = '#3b82f6';
        document.getElementById('localUserLabel').style.background = '#eff6ff';
        document.getElementById('ldapUserLabel').style.borderColor = '#e2e8f0';
        document.getElementById('ldapUserLabel').style.background = '#fff';
    }
}

window.toggleAdminUserType = function() {
    const isLdap = document.querySelector('input[name="adminUserType"]:checked').value === 'ldap';
    const passwordField = document.getElementById('adminPasswordField');
    const passwordInput = document.getElementById('adminPassword');
    
    if (isLdap) {
        passwordField.style.display = 'none';
        passwordInput.required = false;
        document.getElementById('adminLocalUserLabel').style.borderColor = '#e2e8f0';
        document.getElementById('adminLocalUserLabel').style.background = '#fff';
        document.getElementById('adminLdapUserLabel').style.borderColor = '#3b82f6';
        document.getElementById('adminLdapUserLabel').style.background = '#eff6ff';
    } else {
        passwordField.style.display = 'block';
        passwordInput.required = !currentEditingUser;
        document.getElementById('adminLocalUserLabel').style.borderColor = '#3b82f6';
        document.getElementById('adminLocalUserLabel').style.background = '#eff6ff';
        document.getElementById('adminLdapUserLabel').style.borderColor = '#e2e8f0';
        document.getElementById('adminLdapUserLabel').style.background = '#fff';
    }
}

window.togglePermType = function() {
    const isSpecific = document.querySelector('input[name="permType"]:checked').value === 'Specific';
    const specificField = document.getElementById('specificServersField');
    
    if (isSpecific) {
        specificField.style.display = 'block';
        document.getElementById('sheflikPermLabel').style.borderColor = '#e2e8f0';
        document.getElementById('sheflikPermLabel').style.background = '#fff';
        document.getElementById('specificPermLabel').style.borderColor = '#3b82f6';
        document.getElementById('specificPermLabel').style.background = '#eff6ff';
    } else {
        specificField.style.display = 'none';
        document.getElementById('sheflikPermLabel').style.borderColor = '#3b82f6';
        document.getElementById('sheflikPermLabel').style.background = '#eff6ff';
        document.getElementById('specificPermLabel').style.borderColor = '#e2e8f0';
        document.getElementById('specificPermLabel').style.background = '#fff';
    }
}

function populateSheflikDropdown() {
    const select = document.getElementById('userSeflik');
    if (!select) return;
    
    select.innerHTML = '<option value="">Seçiniz...</option>' +
        sampleSheflikler.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
}

async function loadTopologiesForSelection() {
    try {
        const response = await fetch(`${API_BASE}/topology/list`, { credentials: 'include' });
        if (!response.ok) return;
        
        allTopologiesForSelection = await response.json();
        updateTopologyCheckboxes();
    } catch (error) {
        console.error('Topolojiler yüklenemedi:', error);
    }
}

function updateTopologyCheckboxes() {
    const container = document.getElementById('topologyCheckboxes');
    if (!container) return;
    
    if (allTopologiesForSelection.length === 0) {
        container.innerHTML = '<p style="color:#94a3b8;text-align:center;">Henüz sunucu eklenmemiş</p>';
        return;
    }
    
    container.innerHTML = allTopologiesForSelection.map(t => `
        <label style="display:block;padding:0.5rem;border-bottom:1px solid #e2e8f0;cursor:pointer;transition:background 0.2s;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='transparent'">
            <input type="checkbox" value="${t.id}" style="margin-right:0.5rem;">
            <strong>${t.server || t.name}</strong> <span style="color:#64748b;font-size:0.85rem;">(${t.ip || 'IP yok'}) - ${t.dept || 'Şeflik yok'}</span>
        </label>
    `).join('');
}
// Şifre değişimi fonksiyonları
function openChangePasswordModal(username) {
    document.getElementById('changePasswordUsername').value = username;
    document.getElementById('changePasswordForm').reset();
    document.getElementById('changePasswordMessage').innerHTML = '';
    document.getElementById('changePasswordMessage').style.display = 'none';
    document.getElementById('changePasswordModal').style.display = 'flex';
}

function closeChangePasswordModal() {
    document.getElementById('changePasswordModal').style.display = 'none';
    document.getElementById('changePasswordForm').reset();
    document.getElementById('changePasswordMessage').innerHTML = '';
}

document.addEventListener('DOMContentLoaded', function() {
    const changePasswordForm = document.getElementById('changePasswordForm');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = document.getElementById('changePasswordUsername').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const messageDiv = document.getElementById('changePasswordMessage');
            
            // Doğrulama
            if (!newPassword || !confirmPassword) {
                messageDiv.innerHTML = '<p style="color:#dc2626;margin:0;"><i class="fa fa-exclamation-circle"></i> Lütfen tüm alanları doldurunuz</p>';
                messageDiv.style.display = 'block';
                return;
            }
            
            if (newPassword.length < 6) {
                messageDiv.innerHTML = '<p style="color:#dc2626;margin:0;"><i class="fa fa-exclamation-circle"></i> Şifre en az 6 karakter olmalıdır</p>';
                messageDiv.style.display = 'block';
                return;
            }
            
            if (newPassword !== confirmPassword) {
                messageDiv.innerHTML = '<p style="color:#dc2626;margin:0;"><i class="fa fa-exclamation-circle"></i> Şifreler eşleşmiyor</p>';
                messageDiv.style.display = 'block';
                return;
            }
            
            try {
                messageDiv.innerHTML = '<p style="color:#3b82f6;margin:0;"><i class="fa fa-spinner fa-spin"></i> Şifre değiştiriliyor...</p>';
                messageDiv.style.display = 'block';
                
                const response = await fetch(`${API_BASE}/user/change-password`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, newPassword })
                });
                
                const result = await readJsonSafe(response);
                
                if (response.ok) {
                    messageDiv.innerHTML = '<p style="color:#10b981;margin:0;"><i class="fa fa-check-circle"></i> Şifre başarıyla değiştirildi!</p>';
                    messageDiv.style.background = '#d1fae5';
                    messageDiv.style.borderLeft = '3px solid #10b981';
                    messageDiv.style.color = '#065f46';
                    document.getElementById('changePasswordForm').reset();
                    
                    setTimeout(() => {
                        closeChangePasswordModal();
                        loadUsers();
                    }, 1500);
                } else {
                    const errorMessage = result.data?.message || result.error || 'Şifre değiştirilemedi';
                    messageDiv.innerHTML = `<p style="color:#dc2626;margin:0;"><i class="fa fa-exclamation-circle"></i> ${errorMessage}</p>`;
                    messageDiv.style.background = '#fee2e2';
                    messageDiv.style.borderLeft = '3px solid #dc2626';
                    messageDiv.style.color = '#7f1d1d';
                }
            } catch (error) {
                console.error('Şifre değişim hatası:', error);
                messageDiv.innerHTML = `<p style="color:#dc2626;margin:0;"><i class="fa fa-exclamation-circle"></i> Hata: ${error.message}</p>`;
                messageDiv.style.background = '#fee2e2';
                messageDiv.style.borderLeft = '3px solid #dc2626';
            }
        });
    }
});