(() => {
  const state = {
    file: '',
    topologyName: '',
    connections: [],
    listNotes: [],
    diagramNotes: [],
    topologyNote: ''
  };

  const els = {
    title: document.getElementById('diagramTitle'),
    file: document.getElementById('diagramFile'),
    network: document.getElementById('diagramNetwork'),
    compactList: document.getElementById('compactListView'),
    noteView: document.getElementById('topologyNoteView'),
    noteEditor: document.getElementById('topologyNoteEditor'),
    noteContent: document.getElementById('topologyNoteContent'),
    noteToggleBtn: document.getElementById('topologyNoteToggleBtn'),
    saveStatus: document.getElementById('saveStatus')
  };

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getFileParam() {
    const params = new URLSearchParams(window.location.search);
    return params.get('file') || '';
  }

  function normalizePayload(payload) {
    if (Array.isArray(payload)) {
      return {
        connections: payload,
        listNotes: [],
        diagramNotes: [],
        note: ''
      };
    }
    return {
      connections: Array.isArray(payload?.connections) ? payload.connections : [],
      listNotes: Array.isArray(payload?.listNotes) ? payload.listNotes : [],
      diagramNotes: Array.isArray(payload?.diagramNotes) ? payload.diagramNotes : [],
      note: typeof payload?.note === 'string' ? payload.note : ''
    };
  }

  function deriveNoteFromDiagramNotes(diagramNotes) {
    if (!Array.isArray(diagramNotes) || diagramNotes.length === 0) return '';
    const first = diagramNotes[0] || {};
    return String(first.content || '').trim();
  }

  function setStatus(message, type) {
    if (!els.saveStatus) return;
    els.saveStatus.textContent = message;
    els.saveStatus.style.display = 'block';
    els.saveStatus.style.background = type === 'success' ? '#d1fae5' : '#fee2e2';
    els.saveStatus.style.color = type === 'success' ? '#065f46' : '#991b1b';
    els.saveStatus.style.border = type === 'success' ? '1px solid #10b981' : '1px solid #ef4444';
  }

  function clearStatus() {
    if (!els.saveStatus) return;
    els.saveStatus.textContent = '';
    els.saveStatus.style.display = 'none';
    els.saveStatus.style.background = '';
    els.saveStatus.style.color = '';
    els.saveStatus.style.border = '';
  }

  function renderNetworkDiagramFor(container, connections) {
    if (!window.vis) {
      container.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#64748b;">Vis.js yuklenmedi</div>';
      return;
    }
    if (!connections || connections.length === 0) {
      container.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#64748b;">Henüz baglanti yok</div>';
      return;
    }

    const nodes = new vis.DataSet();
    const edges = new vis.DataSet();
    const nodeIds = new Set();

    connections.forEach((conn, idx) => {
      const sourceId = `${conn.source.type}-${conn.source.id || conn.source.ip}`;
      if (!nodeIds.has(sourceId)) {
        nodes.add({
          id: sourceId,
          label: `${conn.source.name}\n${conn.source.ip}`,
          title: `${conn.source.name}\n${conn.source.ip}`,
          shape: 'box',
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

      const destId = `${conn.destination.type}-${conn.destination.id || conn.destination.ip}`;
      if (!nodeIds.has(destId)) {
        nodes.add({
          id: destId,
          label: `${conn.destination.name}\n${conn.destination.ip}`,
          title: `${conn.destination.name}\n${conn.destination.ip}`,
          shape: 'box',
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

      const portIds = [];
      if (conn.ports && conn.ports.length > 0) {
        conn.ports.forEach((port, pIdx) => {
          const portId = `port-${idx}-${pIdx}`;
          portIds.push(portId);
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
            font: { size: 12, color: '#ffffff', bold: true, multi: 'html' },
            borderWidth: 3,
            shadow: { enabled: true, color: 'rgba(0,0,0,0.2)', size: 5, x: 0, y: 1 }
          });
        });
      }

      if (conn.firewall) {
        const fwId = `firewall-${conn.source.ip || conn.source.id}`;
        if (!nodeIds.has(fwId)) {
          const brickWallSvg = `data:image/svg+xml,${encodeURIComponent(`
            <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"140\" height=\"100\" viewBox=\"0 0 140 100\">
              <defs>
                <pattern id=\"bricks\" x=\"0\" y=\"0\" width=\"35\" height=\"20\" patternUnits=\"userSpaceOnUse\">
                  <rect x=\"0\" y=\"0\" width=\"35\" height=\"10\" fill=\"#dc2626\" stroke=\"#fff\" stroke-width=\"1.5\"/>
                  <rect x=\"0\" y=\"10\" width=\"17.5\" height=\"10\" fill=\"#b91c1c\" stroke=\"#fff\" stroke-width=\"1.5\"/>
                  <rect x=\"17.5\" y=\"10\" width=\"17.5\" height=\"10\" fill=\"#dc2626\" stroke=\"#fff\" stroke-width=\"1.5\"/>
                </pattern>
                <linearGradient id=\"fireGradient\" x1=\"0%\" y1=\"0%\" x2=\"100%\" y2=\"0%\">
                  <stop offset=\"0%\" style=\"stop-color:#ff6b00;stop-opacity:1\" />
                  <stop offset=\"50%\" style=\"stop-color:#ff8800;stop-opacity:1\" />
                  <stop offset=\"100%\" style=\"stop-color:#ff6b00;stop-opacity:1\" />
                </linearGradient>
              </defs>
              <rect width=\"140\" height=\"100\" fill=\"url(#bricks)\" rx=\"4\"/>
              <rect x=\"15\" y=\"35\" width=\"110\" height=\"30\" fill=\"rgba(139,0,0,0.7)\" rx=\"3\" stroke=\"#fff\" stroke-width=\"2\"/>
              <text x=\"70\" y=\"55\" font-family=\"Arial, sans-serif\" font-size=\"18\" font-weight=\"bold\" fill=\"#fff\" text-anchor=\"middle\">FW</text>
              <circle cx=\"25\" cy=\"15\" r=\"4\" fill=\"url(#fireGradient)\">
                <animate attributeName=\"opacity\" values=\"1;0.6;1\" dur=\"1.5s\" repeatCount=\"indefinite\"/>
              </circle>
              <circle cx=\"115\" cy=\"15\" r=\"4\" fill=\"url(#fireGradient)\">
                <animate attributeName=\"opacity\" values=\"0.6;1;0.6\" dur=\"1.5s\" repeatCount=\"indefinite\"/>
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
          nodeIds.add(fwId);
        }

        let portLabel = '';
        if (conn.ports && conn.ports.length > 0) {
          portLabel = conn.ports.map(p => `${p.number}`).join(', ');
        }
        edges.add({
          from: sourceId,
          to: fwId,
          arrows: 'to',
          color: { color: '#3b82f6', highlight: '#1e40af' },
          width: 3,
          label: portLabel,
          font: { size: 13, color: '#1e40af', background: '#ffffff', bold: true }
        });
        edges.add({
          from: fwId,
          to: destId,
          arrows: 'to',
          color: { color: '#3b82f6', highlight: '#1e40af' },
          width: 3
        });

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
        edges.add({
          from: sourceId,
          to: destId,
          arrows: 'to',
          color: { color: '#3b82f6', highlight: '#1e40af' },
          width: 3
        });

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
          direction: 'LR',
          sortMethod: 'directed',
          nodeSpacing: 200,
          levelSeparation: 300,
          parentCentralization: true
        }
      },
      physics: { enabled: false },
      interaction: {
        hover: true,
        tooltipDelay: 200,
        dragNodes: true,
        dragView: true,
        zoomView: true
      },
      edges: {
        smooth: { type: 'cubicBezier', forceDirection: 'horizontal' },
        arrows: { to: { enabled: true, scaleFactor: 0.8, type: 'arrow' } }
      }
    };

    new vis.Network(container, data, options);
  }

  function renderCompactListView() {
    if (!els.compactList) return;
    const normalizedListNotes = Array.isArray(state.listNotes) ? state.listNotes : [];
    const connections = Array.isArray(state.connections) ? state.connections : [];
    if (normalizedListNotes.length === 0 && connections.length === 0) {
      els.compactList.style.display = 'none';
      els.compactList.innerHTML = '';
      return;
    }

    els.compactList.style.display = 'block';
    const listNotesHtml = normalizedListNotes.map(note => `
      <div class="compact-item">📝 ${escapeHtml(note.content || '')}</div>
    `).join('');

    const connectionsHtml = connections.map(conn => {
      const ports = (conn.ports || []).map(p => p.number).join(', ') || '-';
      return `
        <div class="compact-item">
          <strong>${escapeHtml(conn.source?.name || '')}</strong> (${escapeHtml(conn.source?.ip || '')})
          →
          <strong>${escapeHtml(conn.destination?.name || '')}</strong> (${escapeHtml(conn.destination?.ip || '')})
          <span style="color:#64748b;">[${escapeHtml(ports)}]</span>
        </div>
      `;
    }).join('');

    els.compactList.innerHTML = listNotesHtml + connectionsHtml;
  }

  function renderTopologyNote() {
    if (!els.noteView || !els.noteContent) return;
    const noteText = state.topologyNote || '';
    els.noteView.innerHTML = noteText
      ? `<div>${escapeHtml(noteText)}</div>`
      : '<div style="color:#64748b;">Not yok</div>';
  }

  function toggleNoteEdit() {
    if (!els.noteEditor || !els.noteToggleBtn || !els.noteContent) return;
    const isEditing = els.noteEditor.dataset.editing === 'true';
    if (!isEditing) {
      els.noteEditor.dataset.editing = 'true';
      els.noteEditor.style.display = 'block';
      els.noteContent.value = state.topologyNote || '';
      els.noteToggleBtn.textContent = 'Kaydet';
      return;
    }

    state.topologyNote = els.noteContent.value.trim();
    els.noteEditor.dataset.editing = 'false';
    els.noteEditor.style.display = 'none';
    els.noteToggleBtn.textContent = 'Duzenle';
    renderTopologyNote();
    saveTopologyNote();
  }

  async function saveTopologyNote() {
    clearStatus();
    try {
      const response = await fetch('/api/topology/update-diagram-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          file: state.file,
          note: state.topologyNote
        })
      });
      const rawText = await response.text();
      let data = null;
      if (rawText) {
        try {
          data = JSON.parse(rawText);
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
        }
      }
      if (!response.ok) {
        const fallback = rawText ? rawText.slice(0, 200) : 'Kaydetme hatasi';
        throw new Error(data?.message || fallback);
      }
      setStatus('Not kaydedildi.', 'success');
    } catch (error) {
      console.error('Save error:', error);
      setStatus('Kaydetme basarisiz: ' + error.message, 'error');
    }
  }

  async function init() {
    state.file = getFileParam();
    if (!state.file) {
      setStatus('Dosya bulunamadi.', 'error');
      return;
    }

    const rawName = state.file.replace(/_diagram\.json$/i, '');
    state.topologyName = rawName.replace(/_/g, ' ');
    els.title.textContent = state.topologyName;
    els.file.textContent = state.file;

    try {
      const response = await fetch(`/uploads/${state.file}`);
      const payload = await response.json();
      const normalized = normalizePayload(payload);
      state.connections = normalized.connections;
      state.listNotes = normalized.listNotes;
      state.diagramNotes = normalized.diagramNotes;
      state.topologyNote = (normalized.note || '').trim();
      if (!state.topologyNote) {
        state.topologyNote = deriveNoteFromDiagramNotes(normalized.diagramNotes);
      }
    } catch (error) {
      console.error('Load error:', error);
      setStatus('Diyagram yuklenemedi.', 'error');
      return;
    }

    renderNetworkDiagramFor(els.network, state.connections);
    renderCompactListView();
    renderTopologyNote();
    if (els.noteToggleBtn) {
      els.noteToggleBtn.addEventListener('click', toggleNoteEdit);
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
