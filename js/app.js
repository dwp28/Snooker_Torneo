/**
 * TORNEO SNOOKER BLACKPOOL MADRID - APLICACIÓN PRINCIPAL
 * Interfaz interactiva, reactividad y persistencia
 */

// Estado global de la aplicación
let tournamentState = null;
let currentTab = 'matches';
let currentVenue = 'vallecas';
let currentGroupFilter = 'all';

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  tournamentState = loadTournamentData();
  setupNavigation();
  setupEventListeners();
  renderAllViews();
  updateHeaderStats();
}

/**
 * Configura la navegación por pestañas principales y filtros
 */
function setupNavigation() {
  const tabButtons = document.querySelectorAll('.nav-tab-btn');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      switchTab(targetTab);
    });
  });

  // Selector de sedes (Vallecas vs Alcobendas)
  document.querySelectorAll('.venue-pill-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const venue = btn.getAttribute('data-venue');
      switchVenue(venue);
    });
  });

  // Filtros de grupos
  const filterSelects = document.querySelectorAll('.filter-group-select');
  filterSelects.forEach(select => {
    select.addEventListener('change', (e) => {
      currentGroupFilter = e.target.value;
      renderCurrentView();
    });
  });
}

function switchTab(tabId) {
  currentTab = tabId;
  document.querySelectorAll('.nav-tab-btn').forEach(b => {
    b.classList.toggle('active', b.getAttribute('data-tab') === tabId);
  });
  document.querySelectorAll('.tab-pane').forEach(pane => {
    pane.classList.toggle('active', pane.id === `tab-${tabId}`);
  });
  renderCurrentView();
}

function switchVenue(venueId) {
  currentVenue = venueId;
  document.querySelectorAll('.venue-pill-btn').forEach(b => {
    b.classList.toggle('active', b.getAttribute('data-venue') === venueId);
  });
  // Actualizar selects de grupo acorde a la sede
  updateGroupFilterOptions();
  renderCurrentView();
}

function updateGroupFilterOptions() {
  const groupIndices = VENUES[currentVenue.toUpperCase()].groupIndices;
  const filterSelects = document.querySelectorAll('.filter-group-select');
  filterSelects.forEach(select => {
    select.innerHTML = `<option value="all">Todos los Grupos (${currentVenue === 'vallecas' ? '1 al 4' : '5 al 8'})</option>` +
      groupIndices.map(g => `<option value="${g}">Grupo ${g}</option>`).join('');
    select.value = 'all';
  });
  currentGroupFilter = 'all';
}

function setupEventListeners() {
  // Modal de reinicio
  const btnOpenReset = document.getElementById('btn-open-reset-modal');
  const modalReset = document.getElementById('modal-reset');
  const btnConfirmReset = document.getElementById('btn-confirm-reset');
  const btnCancelReset = document.getElementById('btn-cancel-reset');

  if (btnOpenReset) {
    btnOpenReset.addEventListener('click', () => {
      modalReset.classList.add('is-open');
    });
  }

  if (btnCancelReset) {
    btnCancelReset.addEventListener('click', () => {
      modalReset.classList.remove('is-open');
    });
  }

  if (btnConfirmReset) {
    btnConfirmReset.addEventListener('click', () => {
      const resetPlayers = document.getElementById('chk-reset-names')?.checked || false;
      resetTournament(resetPlayers);
      modalReset.classList.remove('is-open');
      showToast('🔄 Torneo reiniciado con éxito', 'success');
    });
  }

  // Modal de Exportar / Importar
  const btnExport = document.getElementById('btn-export-json');
  if (btnExport) {
    btnExport.addEventListener('click', exportTournamentJSON);
  }

  const fileInputImport = document.getElementById('file-import-json');
  if (fileInputImport) {
    fileInputImport.addEventListener('change', handleImportFile);
  }

  // Modal QR
  const btnShareQR = document.getElementById('btn-share-qr');
  const modalQR = document.getElementById('modal-qr');
  const btnCloseQR = document.getElementById('btn-close-qr');

  if (btnShareQR) {
    btnShareQR.addEventListener('click', () => {
      generateQRCode();
      modalQR.classList.add('is-open');
    });
  }

  if (btnCloseQR) {
    btnCloseQR.addEventListener('click', () => {
      modalQR.classList.remove('is-open');
    });
  }

  // Cerrar modales clicando fondo
  document.querySelectorAll('.modal-backdrop').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('is-open');
      }
    });
  });

  // Botón guardar todos los nombres
  const btnSaveAllNames = document.getElementById('btn-save-player-names');
  if (btnSaveAllNames) {
    btnSaveAllNames.addEventListener('click', savePlayerNamesFromAdmin);
  }
}

/**
 * Renderiza todas las vistas y actualiza estado
 */
function renderAllViews() {
  updatePlayoffQualifiers(tournamentState);
  renderMatchesView();
  renderStandingsView();
  renderFramesView();
  renderPlayoffsView();
  renderAdminView();
  updateHeaderStats();
}

function renderCurrentView() {
  updatePlayoffQualifiers(tournamentState);
  if (currentTab === 'matches') renderMatchesView();
  else if (currentTab === 'groups') renderStandingsView();
  else if (currentTab === 'frames') renderFramesView();
  else if (currentTab === 'playoffs') renderPlayoffsView();
  else if (currentTab === 'admin') renderAdminView();
  updateHeaderStats();
}

/**
 * Actualiza estadísticas rápidas en el encabezado
 */
function updateHeaderStats() {
  let totalMatches = 0;
  let completedMatches = 0;
  let totalPoints = 0;

  for (let g = 1; g <= 8; g++) {
    const group = tournamentState.groups[g];
    totalMatches += group.matches.length;
    group.matches.forEach(m => {
      if (m.isCompleted || m.p1FramesWon >= 2 || m.p2FramesWon >= 2) {
        completedMatches++;
      }
      m.frames.forEach(f => {
        if (f.p1Points) totalPoints += Number(f.p1Points);
        if (f.p2Points) totalPoints += Number(f.p2Points);
      });
    });
  }

  const elCompleted = document.getElementById('stat-matches-completed');
  const elPoints = document.getElementById('stat-total-points');
  const elPercent = document.getElementById('stat-progress-percent');

  if (elCompleted) elCompleted.textContent = `${completedMatches}/${totalMatches}`;
  if (elPoints) elPoints.textContent = totalPoints.toLocaleString();
  if (elPercent) {
    const pct = totalMatches > 0 ? Math.round((completedMatches / totalMatches) * 100) : 0;
    elPercent.textContent = `${pct}%`;
  }
}

/**
 * =========================================================================
 * VISTA 1: PARTIDOS (MATCHES VIEW)
 * =========================================================================
 */
function renderMatchesView() {
  const container = document.getElementById('matches-container');
  if (!container) return;

  const targetGroupIndices = VENUES[currentVenue.toUpperCase()].groupIndices;
  const filteredIndices = (currentGroupFilter === 'all') 
    ? targetGroupIndices 
    : targetGroupIndices.filter(g => g.toString() === currentGroupFilter.toString());

  if (filteredIndices.length === 0) {
    container.innerHTML = `<div class="info-notice">No hay grupos seleccionados.</div>`;
    return;
  }

  let html = '';

  filteredIndices.forEach(groupId => {
    const group = tournamentState.groups[groupId];
    const groupStatus = getGroupStatus(group);

    html += `
      <div class="group-match-card-container">
        <div class="group-header-banner">
          <div class="group-title-wrap">
            <span class="group-badge-num">${group.id}</span>
            <div>
              <h2>${group.name} - ${group.venue === 'vallecas' ? 'Sede Vallecas (VF)' : 'Sede Alcobendas (BBM)'}</h2>
            </div>
          </div>
          <div class="group-players-chips">
            ${group.playerIds.map(pId => `<span class="player-mini-chip">👤 ${escapeHtml(tournamentState.players[pId]?.name || `Jugador ${pId}`)}</span>`).join('')}
            <span class="match-status-badge ${groupStatus.badgeClass}">${groupStatus.icon} ${groupStatus.text}</span>
          </div>
        </div>
        
        <div class="matches-list-grid">
          ${group.matches.map(match => renderSingleMatchCard(match, group)).join('')}
        </div>
      </div>
    `;
  });

  container.innerHTML = html;

  // Asignar listeners a inputs de puntos
  attachMatchInputListeners();
}

function renderSingleMatchCard(match, group) {
  const p1 = tournamentState.players[match.player1Id] || { name: `Jugador ${match.player1Id}` };
  const p2 = tournamentState.players[match.player2Id] || { name: `Jugador ${match.player2Id}` };

  let statusClass = 'badge-pending';
  let statusText = 'Pendiente';
  let cardBorderClass = '';

  if (match.isCompleted || match.p1FramesWon >= 2 || match.p2FramesWon >= 2) {
    statusClass = 'badge-completed';
    statusText = 'Finalizado';
    cardBorderClass = 'is-completed';
  } else if (match.p1FramesWon > 0 || match.p2FramesWon > 0 || match.frames.some(f => f.p1Points !== null || f.p2Points !== null)) {
    statusClass = 'badge-progress';
    statusText = 'En curso';
    cardBorderClass = 'in-progress';
  }

  const p1IsWinner = match.winnerId === p1.id;
  const p2IsWinner = match.winnerId === p2.id;

  return `
    <div class="match-card ${cardBorderClass}" id="card-${match.id}" data-match-id="${match.id}">
      <div class="match-card-top">
        <span class="match-num-badge">Partido ${match.matchNumber} / 6</span>
        <span class="match-status-badge ${statusClass}">${statusText}</span>
      </div>

      <div class="match-players-faceoff">
        <div class="player-side player-left">
          <span class="player-name-display ${p1IsWinner ? 'is-winner' : ''}" title="${escapeHtml(p1.name)}">${p1IsWinner ? '🏆 ' : ''}${escapeHtml(p1.name)}</span>
          <span class="player-frames-count" id="fcount-p1-${match.id}">${match.p1FramesWon}</span>
        </div>
        <div class="match-vs-divider">
          <span>VS</span>
        </div>
        <div class="player-side player-right">
          <span class="player-name-display ${p2IsWinner ? 'is-winner' : ''}" title="${escapeHtml(p2.name)}">${escapeHtml(p2.name)}${p2IsWinner ? ' 🏆' : ''}</span>
          <span class="player-frames-count" id="fcount-p2-${match.id}">${match.p2FramesWon}</span>
        </div>
      </div>

      <div class="match-frames-inputs-wrap">
        ${match.frames.map((frame, idx) => {
          const fNum = idx + 1;
          const p1Pts = frame.p1Points !== null ? frame.p1Points : '';
          const p2Pts = frame.p2Points !== null ? frame.p2Points : '';
          const p1WinFrame = (p1Pts !== '' && p2Pts !== '' && Number(p1Pts) > Number(p2Pts));
          const p2WinFrame = (p1Pts !== '' && p2Pts !== '' && Number(p2Pts) > Number(p1Pts));

          return `
            <div class="frame-input-row" data-match="${match.id}" data-frame="${fNum}">
              <span class="frame-label">Frame ${fNum}</span>
              <input type="number" min="0" max="155" placeholder="0" class="frame-pts-input frame-p1-pts ${p1WinFrame ? 'winner-pts' : ''}" 
                     data-match="${match.id}" data-frame-idx="${idx}" data-player="p1" value="${p1Pts}">
              <span class="frame-mid-indicator">-</span>
              <input type="number" min="0" max="155" placeholder="0" class="frame-pts-input frame-p2-pts ${p2WinFrame ? 'winner-pts' : ''}" 
                     data-match="${match.id}" data-frame-idx="${idx}" data-player="p2" value="${p2Pts}">
            </div>
          `;
        }).join('')}
      </div>

      <div class="match-card-actions">
        <button type="button" class="btn-clear-match" data-match="${match.id}" title="Borrar puntuaciones de este partido">
          🗑️ Limpiar
        </button>
        <button type="button" class="btn-quick-save" data-match="${match.id}">
          💾 Guardar
        </button>
      </div>
    </div>
  `;
}

function attachMatchInputListeners() {
  document.querySelectorAll('.frame-pts-input').forEach(input => {
    input.addEventListener('input', (e) => {
      const matchId = e.target.getAttribute('data-match');
      const frameIdx = parseInt(e.target.getAttribute('data-frame-idx'));
      const playerKey = e.target.getAttribute('data-player');
      const value = e.target.value.trim() === '' ? null : parseInt(e.target.value);

      handleFrameScoreChange(matchId, frameIdx, playerKey, value);
    });
  });

  document.querySelectorAll('.btn-clear-match').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const matchId = btn.getAttribute('data-match');
      if (confirm('¿Deseas limpiar todos los puntos de este partido?')) {
        clearMatchScores(matchId);
      }
    });
  });

  document.querySelectorAll('.btn-quick-save').forEach(btn => {
    btn.addEventListener('click', (e) => {
      saveTournamentData(tournamentState);
      showToast('✅ Partido guardado', 'success');
      renderAllViews();
    });
  });
}

function handleFrameScoreChange(matchId, frameIdx, playerKey, value) {
  let match = findMatchById(matchId);
  if (!match) return;

  const frame = match.frames[frameIdx];
  if (playerKey === 'p1') frame.p1Points = value;
  else if (playerKey === 'p2') frame.p2Points = value;

  // Recalcular frame winner y partido
  recalculateMatchOutcome(match);

  // Auto-guardado
  saveTournamentData(tournamentState);

  // Actualizar la interfaz visual del match card sin perder foco si es posible
  updateMatchCardUI(match);
  updateHeaderStats();
}

function recalculateMatchOutcome(match) {
  let p1FramesWon = 0;
  let p2FramesWon = 0;

  match.frames.forEach(f => {
    const p1Pts = (f.p1Points !== null && f.p1Points !== '' && !isNaN(Number(f.p1Points))) ? Number(f.p1Points) : null;
    const p2Pts = (f.p2Points !== null && f.p2Points !== '' && !isNaN(Number(f.p2Points))) ? Number(f.p2Points) : null;

    if (p1Pts !== null && p2Pts !== null) {
      if (p1Pts > p2Pts) {
        f.winnerId = match.player1Id;
        p1FramesWon++;
      } else if (p2Pts > p1Pts) {
        f.winnerId = match.player2Id;
        p2FramesWon++;
      } else {
        f.winnerId = null;
      }
    } else {
      f.winnerId = null;
    }
  });

  match.p1FramesWon = p1FramesWon;
  match.p2FramesWon = p2FramesWon;

  if (p1FramesWon >= 2) {
    match.winnerId = match.player1Id;
    match.isCompleted = true;
  } else if (p2FramesWon >= 2) {
    match.winnerId = match.player2Id;
    match.isCompleted = true;
  } else {
    match.winnerId = null;
    match.isCompleted = false;
  }
}

function updateMatchCardUI(match) {
  const card = document.getElementById(`card-${match.id}`);
  if (!card) return;

  const p1Count = document.getElementById(`fcount-p1-${match.id}`);
  const p2Count = document.getElementById(`fcount-p2-${match.id}`);

  if (p1Count) p1Count.textContent = match.p1FramesWon;
  if (p2Count) p2Count.textContent = match.p2FramesWon;

  // Actualizar clases de ganador de frame
  match.frames.forEach((f, idx) => {
    const row = card.querySelector(`.frame-input-row[data-frame="${idx + 1}"]`);
    if (row) {
      const inp1 = row.querySelector('.frame-p1-pts');
      const inp2 = row.querySelector('.frame-p2-pts');
      const p1Win = (f.p1Points !== null && f.p2Points !== null && Number(f.p1Points) > Number(f.p2Points));
      const p2Win = (f.p1Points !== null && f.p2Points !== null && Number(f.p2Points) > Number(f.p1Points));

      if (inp1) inp1.classList.toggle('winner-pts', p1Win);
      if (inp2) inp2.classList.toggle('winner-pts', p2Win);
    }
  });
}

function clearMatchScores(matchId) {
  const match = findMatchById(matchId);
  if (!match) return;

  match.frames = [
    { frameNum: 1, p1Points: null, p2Points: null, winnerId: null },
    { frameNum: 2, p1Points: null, p2Points: null, winnerId: null },
    { frameNum: 3, p1Points: null, p2Points: null, winnerId: null }
  ];
  match.p1FramesWon = 0;
  match.p2FramesWon = 0;
  match.winnerId = null;
  match.isCompleted = false;

  saveTournamentData(tournamentState);
  renderAllViews();
  showToast('🧹 Partido restablecido', 'info');
}

function findMatchById(matchId) {
  for (let g = 1; g <= 8; g++) {
    const found = tournamentState.groups[g].matches.find(m => m.id === matchId);
    if (found) return found;
  }
  return null;
}

/**
 * =========================================================================
 * VISTA 2: GRUPOS (STANDINGS VIEW)
 * =========================================================================
 */
function renderStandingsView() {
  const container = document.getElementById('standings-container');
  if (!container) return;

  const targetGroupIndices = VENUES[currentVenue.toUpperCase()].groupIndices;
  const filteredIndices = (currentGroupFilter === 'all') 
    ? targetGroupIndices 
    : targetGroupIndices.filter(g => g.toString() === currentGroupFilter.toString());

  let html = '';

  filteredIndices.forEach(groupId => {
    const group = tournamentState.groups[groupId];
    const standings = calculateGroupStandings(group, tournamentState.players);
    const groupStatus = getGroupStatus(group);

    html += `
      <div class="standings-card">
        <div class="standings-card-header">
          <div class="group-title-wrap">
            <span class="group-badge-num">${group.id}</span>
            <div>
              <h2 style="font-size:1.05rem; font-weight:700; color:#fff;">${group.name} - ${group.venue === 'vallecas' ? 'Vallecas (VF)' : 'Alcobendas (BBM)'}</h2>
            </div>
          </div>
          <span class="match-status-badge ${groupStatus.badgeClass}">${groupStatus.icon} ${groupStatus.text}</span>
        </div>

        <div class="table-responsive">
          <table class="standings-table">
            <thead>
              <tr>
                <th style="width: 45px;">Pos</th>
                <th>Jugador</th>
                <th style="text-align: center;">PJ</th>
                <th style="text-align: center;">PG</th>
                <th style="text-align: center;">FG</th>
                <th style="text-align: center;">FP</th>
                <th style="text-align: center;">Pts Totales ⭐</th>
                <th style="text-align: center;">Pases</th>
              </tr>
            </thead>
            <tbody>
              ${standings.map(row => {
                const posClass = row.position === 1 ? 'pos-1' : (row.position === 2 ? 'pos-2' : '');
                const qualClass = row.isQualified ? 'row-qualified' : '';
                return `
                  <tr class="${qualClass}">
                    <td class="pos-cell ${posClass}">${row.position}º</td>
                    <td>
                      <div class="player-cell">
                        ${row.isQualified ? '<span class="qualify-dot" title="Puesto clasificatorio a Playoffs"></span>' : ''}
                        <span>${escapeHtml(row.player.name)}</span>
                      </div>
                    </td>
                    <td class="num-cell">${row.matchesPlayed}</td>
                    <td class="num-cell" style="color:#6ee7b7; font-weight:700;">${row.matchesWon}</td>
                    <td class="num-cell" style="color:var(--gold); font-weight:700;">${row.framesWon}</td>
                    <td class="num-cell" style="color:var(--text-dim);">${row.framesLost}</td>
                    <td class="num-cell points-cell">${row.totalPoints} pts</td>
                    <td class="num-cell">
                      ${row.position <= 2 ? '<span style="color:#86efac; font-weight:700; font-size:0.8rem;">16avos ✅</span>' : '<span style="color:var(--text-dim); font-size:0.75rem;">-</span>'}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

/**
 * =========================================================================
 * VISTA 3: DESGLOSE POR FRAME (FRAMES VIEW)
 * =========================================================================
 */
function renderFramesView() {
  const container = document.getElementById('frames-container');
  if (!container) return;

  const targetGroupIndices = VENUES[currentVenue.toUpperCase()].groupIndices;
  const filteredIndices = (currentGroupFilter === 'all') 
    ? targetGroupIndices 
    : targetGroupIndices.filter(g => g.toString() === currentGroupFilter.toString());

  let html = '';

  filteredIndices.forEach(groupId => {
    const group = tournamentState.groups[groupId];

    html += `
      <div class="group-frame-breakdown-card">
        <div class="group-header-banner">
          <div class="group-title-wrap">
            <span class="group-badge-num">${group.id}</span>
            <h2 style="font-size:1.05rem;">Desglose Individual de Frames - ${group.name}</h2>
          </div>
        </div>

        <div class="frame-detail-rows">
          ${group.matches.map(m => {
            const p1 = tournamentState.players[m.player1Id] || { name: `Jugador ${m.player1Id}` };
            const p2 = tournamentState.players[m.player2Id] || { name: `Jugador ${m.player2Id}` };

            return m.frames.map((f, fIdx) => {
              const fNum = fIdx + 1;
              const p1Pts = f.p1Points !== null ? Number(f.p1Points) : null;
              const p2Pts = f.p2Points !== null ? Number(f.p2Points) : null;
              const hasPlayed = (p1Pts !== null && p2Pts !== null);
              const p1Wins = hasPlayed && p1Pts > p2Pts;
              const p2Wins = hasPlayed && p2Pts > p1Pts;
              const diff = hasPlayed ? Math.abs(p1Pts - p2Pts) : null;

              return `
                <div class="frame-detail-item">
                  <div class="frame-detail-match-info">
                    <span class="frame-badge-tag">Gr.${groupId} P${m.matchNumber} · F${fNum}</span>
                    <span style="font-weight:600; color:#fff;">${escapeHtml(p1.name)} vs ${escapeHtml(p2.name)}</span>
                  </div>

                  <div class="frame-detail-scores">
                    <div class="player-score-box">
                      <span style="color: ${p1Wins ? '#86efac' : 'var(--text-main)'}; font-weight: ${p1Wins ? '700' : '500'};">${escapeHtml(p1.name)}</span>
                      <span class="score-num-badge ${p1Wins ? 'winner' : ''}">${p1Pts !== null ? p1Pts : '-'}</span>
                    </div>
                    <span style="color:var(--text-dim); font-size:0.8rem;">vs</span>
                    <div class="player-score-box">
                      <span class="score-num-badge ${p2Wins ? 'winner' : ''}">${p2Pts !== null ? p2Pts : '-'}</span>
                      <span style="color: ${p2Wins ? '#86efac' : 'var(--text-main)'}; font-weight: ${p2Wins ? '700' : '500'};">${escapeHtml(p2.name)}</span>
                    </div>
                    ${diff !== null ? `<span class="diff-badge">(Dif: +${diff} pts)</span>` : '<span class="diff-badge">Sin jugar</span>'}
                  </div>
                </div>
              `;
            }).join('');
          }).join('')}
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

/**
 * =========================================================================
 * VISTA 4: FASE FINAL / CUADRO PLAYOFFS (PLAYOFFS VIEW)
 * =========================================================================
 */
function renderPlayoffsView() {
  const container = document.getElementById('playoffs-container');
  if (!container) return;

  updatePlayoffQualifiers(tournamentState);
  const po = tournamentState.playoffs;

  let html = `
    <div class="bracket-wrapper">
      <div class="bracket-container">
        
        <!-- 16AVOS / OCTAVOS DE FINAL (16 CLASIFICADOS) -->
        <div class="bracket-round-column">
          <div class="bracket-round-header">16avos / Cruces (8 Partidos)</div>
          <div class="bracket-matches-list">
            ${po.roundOf16.map(m => renderPlayoffNode(m, 'r16')).join('')}
          </div>
        </div>

        <!-- CUARTOS DE FINAL -->
        <div class="bracket-round-column">
          <div class="bracket-round-header">Cuartos de Final (4 Partidos)</div>
          <div class="bracket-matches-list">
            ${po.quarterFinals.map(m => renderPlayoffNode(m, 'qf')).join('')}
          </div>
        </div>

        <!-- SEMIFINALES -->
        <div class="bracket-round-column">
          <div class="bracket-round-header">Semifinales (2 Partidos)</div>
          <div class="bracket-matches-list">
            ${po.semiFinals.map(m => renderPlayoffNode(m, 'sf')).join('')}
          </div>
        </div>

        <!-- GRAN FINAL -->
        <div class="bracket-round-column">
          <div class="bracket-round-header">🏆 Gran Final</div>
          <div class="bracket-matches-list">
            ${renderPlayoffNode(po.final, 'final')}
          </div>
        </div>

      </div>
    </div>
  `;

  // Si hay campeón en la final, mostrar tarjeta de trofeo
  if (po.final && po.final.winnerId) {
    const champion = tournamentState.players[po.final.winnerId];
    html += `
      <div class="champion-trophy-card">
        <div class="champion-trophy-icon">🏆</div>
        <div style="font-size:0.9rem; text-transform:uppercase; letter-spacing:0.1em; color:var(--gold);">¡CAMPEÓN DEL TORNEO DE SNOOKER!</div>
        <div class="champion-name-big">${escapeHtml(champion?.name || 'Campeón')}</div>
        <p style="color:var(--text-muted); font-size:0.9rem;">Ganador absoluto del Torneo Snooker Blackpool Madrid</p>
      </div>
    `;
  }

  container.innerHTML = html;

  attachPlayoffScoreListeners();
}

function renderPlayoffNode(match, roundKey) {
  const p1 = match.player1Id ? tournamentState.players[match.player1Id] : null;
  const p2 = match.player2Id ? tournamentState.players[match.player2Id] : null;

  const p1Name = p1 ? p1.name : (match.p1Source ? `${match.p1Source.pos}º Grupo ${match.p1Source.group}` : 'Por definir');
  const p2Name = p2 ? p2.name : (match.p2Source ? `${match.p2Source.pos}º Grupo ${match.p2Source.group}` : 'Por definir');

  const p1Won = match.winnerId && match.player1Id && match.winnerId === match.player1Id;
  const p2Won = match.winnerId && match.player2Id && match.winnerId === match.player2Id;

  return `
    <div class="bracket-match-node" data-round="${roundKey}" data-playoff-id="${match.id}">
      <div class="bracket-node-header">
        <span>${escapeHtml(match.label)}</span>
        <span>${match.isCompleted ? '✅' : '⏳'}</span>
      </div>

      <div class="bracket-participant-row ${p1Won ? 'is-winner' : ''}">
        <span class="bracket-participant-name" title="${escapeHtml(p1Name)}">${p1Won ? '🏆 ' : ''}${escapeHtml(p1Name)}</span>
        <input type="number" min="0" max="3" class="bracket-score-input" data-round="${roundKey}" data-playoff-id="${match.id}" data-player="p1" 
               value="${match.p1FramesWon || 0}" ${(!match.player1Id || !match.player2Id) ? 'disabled' : ''}>
      </div>

      <div class="bracket-participant-row ${p2Won ? 'is-winner' : ''}">
        <span class="bracket-participant-name" title="${escapeHtml(p2Name)}">${p2Won ? '🏆 ' : ''}${escapeHtml(p2Name)}</span>
        <input type="number" min="0" max="3" class="bracket-score-input" data-round="${roundKey}" data-playoff-id="${match.id}" data-player="p2" 
               value="${match.p2FramesWon || 0}" ${(!match.player1Id || !match.player2Id) ? 'disabled' : ''}>
      </div>
    </div>
  `;
}

function attachPlayoffScoreListeners() {
  document.querySelectorAll('.bracket-score-input').forEach(input => {
    input.addEventListener('change', (e) => {
      const roundKey = e.target.getAttribute('data-round');
      const playoffId = e.target.getAttribute('data-playoff-id');
      const playerKey = e.target.getAttribute('data-player');
      const val = parseInt(e.target.value) || 0;

      handlePlayoffScoreUpdate(roundKey, playoffId, playerKey, val);
    });
  });
}

function handlePlayoffScoreUpdate(roundKey, playoffId, playerKey, val) {
  const po = tournamentState.playoffs;
  let match = null;

  if (roundKey === 'r16') match = po.roundOf16.find(m => m.id === playoffId);
  else if (roundKey === 'qf') match = po.quarterFinals.find(m => m.id === playoffId);
  else if (roundKey === 'sf') match = po.semiFinals.find(m => m.id === playoffId);
  else if (roundKey === 'final') match = po.final;

  if (!match) return;

  if (playerKey === 'p1') match.p1FramesWon = val;
  if (playerKey === 'p2') match.p2FramesWon = val;

  // Determinar ganador (primero a 2 frames)
  if (match.p1FramesWon >= 2 && match.player1Id) {
    match.winnerId = match.player1Id;
    match.isCompleted = true;
  } else if (match.p2FramesWon >= 2 && match.player2Id) {
    match.winnerId = match.player2Id;
    match.isCompleted = true;
  } else {
    match.winnerId = null;
    match.isCompleted = false;
  }

  saveTournamentData(tournamentState);
  renderPlayoffsView();
}

/**
 * =========================================================================
 * VISTA 5: ADMINISTRACIÓN (ADMIN VIEW)
 * =========================================================================
 */
function renderAdminView() {
  const container = document.getElementById('admin-player-inputs');
  if (!container) return;

  let html = '';
  for (let i = 1; i <= 32; i++) {
    const p = tournamentState.players[i] || { name: `Jugador ${i}` };
    const groupNum = Math.ceil(i / 4);
    const venueName = groupNum <= 4 ? 'Vallecas' : 'Alcobendas';

    html += `
      <div class="player-input-item">
        <span class="player-num-tag">#${i}</span>
        <input type="text" class="player-name-input" data-player-id="${i}" value="${escapeHtml(p.name)}" placeholder="Jugador ${i}">
        <span style="font-size:0.7rem; color:var(--text-dim); white-space:nowrap;">Gr.${groupNum} (${venueName})</span>
      </div>
    `;
  }
  container.innerHTML = html;
}

function savePlayerNamesFromAdmin() {
  document.querySelectorAll('.player-name-input').forEach(input => {
    const pId = parseInt(input.getAttribute('data-player-id'));
    const val = input.value.trim();
    if (tournamentState.players[pId]) {
      tournamentState.players[pId].name = val !== '' ? val : `Jugador ${pId}`;
    }
  });

  saveTournamentData(tournamentState);
  showToast('💾 Nombres de jugadores actualizados', 'success');
  renderAllViews();
}

/**
 * Exporta los datos a un archivo .json descargable
 */
function exportTournamentJSON() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tournamentState, null, 2));
  const downloadAnchor = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `Torneo_Snooker_Blackpool_Backup_${dateStr}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  showToast('📥 Backup JSON descargado correctamente', 'success');
}

/**
 * Importa los datos desde un archivo .json
 */
function handleImportFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const imported = JSON.parse(e.target.result);
      if (imported && imported.groups && imported.players) {
        tournamentState = imported;
        saveTournamentData(tournamentState);
        renderAllViews();
        showToast('✅ Datos importados y restaurados correctamente', 'success');
      } else {
        alert('El archivo JSON no tiene la estructura válida del torneo.');
      }
    } catch (err) {
      alert('Error al leer el archivo JSON: ' + err.message);
    }
  };
  reader.readAsText(file);
}

/**
 * Reinicio completo del torneo
 */
function resetTournament(resetNames = false) {
  const fresh = createDefaultTournamentState();
  if (!resetNames && tournamentState && tournamentState.players) {
    // Conservar nombres de jugadores actuales
    fresh.players = tournamentState.players;
  }
  tournamentState = fresh;
  saveTournamentData(tournamentState);
  renderAllViews();
}

/**
 * Generador de Código QR usando SVG dinámico simple
 */
function generateQRCode() {
  const container = document.getElementById('qr-canvas-wrap');
  if (!container) return;

  const currentUrl = window.location.href;
  // Usar API de QR ligera para renderizar el QR oficial
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(currentUrl)}&bgcolor=ffffff&color=0f1016`;

  container.innerHTML = `
    <img src="${qrApiUrl}" alt="Código QR del Torneo" style="width:200px; height:200px; border-radius:8px; display:block; margin:0 auto;" />
    <p style="margin-top:0.75rem; font-size:0.8rem; color:#fff; word-break:break-all;">${currentUrl}</p>
  `;
}

/**
 * Sistema de notificaciones Toast
 */
function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
