/**
 * TORNEO SNOOKER BLACKPOOL MADRID - APP CONTROLLER V3
 * Filtros Intuitivos por Grupo, Mesa y Hora | Nombres Grandes | Supabase Live Sync
 */

let tournamentState = null;
let currentTab = 'matches';
let currentVenue = 'vallecas';

// Filtros avanzados para partidos
let filterGroup = 'all';
let filterTable = 'all';
let filterHour = 'all';
let filterStatus = 'all';

let isAdminAuthenticated = false;
let autoSyncInterval = null;
let isSupabaseTableMissing = false;

const PUBLIC_NETLIFY_URL = 'https://snookertorneomadrid.netlify.app/';

document.addEventListener('DOMContentLoaded', async () => {
  await initApp();
});

async function initApp() {
  checkAdminAuth();
  updateAdminUIState();

  // 1. Cargar datos locales primero para disponibilidad instantánea
  tournamentState = loadTournamentDataLocal();
  setupNavigation();
  setupEventListeners();
  renderAllViews();
  updateHeaderStats();

  // 2. Conectar y sincronizar con Supabase
  await syncFromSupabase();

  // 3. Polling en tiempo real cada 10 segundos
  if (autoSyncInterval) clearInterval(autoSyncInterval);
  autoSyncInterval = setInterval(async () => {
    if (!document.hidden) {
      await syncFromSupabase(true);
    }
  }, 10000);
}

function checkAdminAuth() {
  const session = sessionStorage.getItem('SNOOKER_ADMIN_AUTH') || localStorage.getItem('SNOOKER_ADMIN_AUTH');
  isAdminAuthenticated = session === 'true';
}

function setAdminAuth(isAuth) {
  isAdminAuthenticated = isAuth;
  if (isAuth) {
    sessionStorage.setItem('SNOOKER_ADMIN_AUTH', 'true');
    localStorage.setItem('SNOOKER_ADMIN_AUTH', 'true');
  } else {
    sessionStorage.removeItem('SNOOKER_ADMIN_AUTH');
    localStorage.removeItem('SNOOKER_ADMIN_AUTH');
  }
  updateAdminUIState();
}

function updateAdminUIState() {
  const loginTrigger = document.getElementById('btn-login-admin-trigger');
  const logoutTrigger = document.getElementById('btn-logout-admin-trigger');
  const adminBadge = document.getElementById('admin-status-badge');
  const spectatorBadge = document.getElementById('spectator-status-badge');

  if (isAdminAuthenticated) {
    if (loginTrigger) loginTrigger.style.display = 'none';
    if (logoutTrigger) logoutTrigger.style.display = 'inline-flex';
    if (adminBadge) adminBadge.style.display = 'inline-flex';
    if (spectatorBadge) spectatorBadge.style.display = 'none';
  } else {
    if (loginTrigger) loginTrigger.style.display = 'inline-flex';
    if (logoutTrigger) logoutTrigger.style.display = 'none';
    if (adminBadge) adminBadge.style.display = 'none';
    if (spectatorBadge) spectatorBadge.style.display = 'inline-flex';
  }
}

async function syncFromSupabase(silent = false) {
  try {
    const result = await loadTournamentDataAsync();
    isSupabaseTableMissing = result.isTableMissing;

    updateSupabaseAlertBanner();

    if (result.success && result.state) {
      const remoteTs = result.state.lastUpdated || '';
      const localTs = tournamentState ? (tournamentState.lastUpdated || '') : '';

      // Solo actualizar la vista si el estado remoto es más reciente (o primera carga)
      // Esto evita que el polling sobreescriba cambios que el admin acaba de guardar
      if (!tournamentState || remoteTs > localTs || !silent) {
        tournamentState = result.state;
        renderAllViews();
        updateHeaderStats();
      }

      if (!silent) {
        setSyncStatus('Conectado • Supabase en vivo', true);
      } else {
        setSyncStatus('🟢 En vivo (Supabase)', true);
      }
    } else if (result.isTableMissing) {
      setSyncStatus('⚠️ Tabla no creada en Supabase', false);
    } else {
      setSyncStatus('📂 Modo local (sin conexión)', false);
    }
  } catch (e) {
    console.error('Error durante sincronización Supabase:', e);
    if (!silent) setSyncStatus('Error de sincronización', false);
  }
}


function setSyncStatus(text, isOnline) {
  const syncEl = document.getElementById('sync-status-text');
  const dotEl = document.getElementById('sync-status-dot');
  if (syncEl) syncEl.textContent = text;
  if (dotEl) {
    dotEl.style.background = isOnline ? 'var(--snooker-green-light)' : '#fca5a5';
    dotEl.style.boxShadow = isOnline ? '0 0 9px var(--snooker-green-light)' : '0 0 9px #fca5a5';
  }
}

function updateSupabaseAlertBanner() {
  const banner = document.getElementById('supabase-missing-banner');
  if (!banner) return;
  banner.style.display = isSupabaseTableMissing ? 'flex' : 'none';
}

/**
 * Navegación y Filtros
 */
function setupNavigation() {
  document.querySelectorAll('.nav-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      switchTab(targetTab);
    });
  });

  document.querySelectorAll('.venue-pill-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const venue = btn.getAttribute('data-venue');
      switchVenue(venue);
    });
  });

  // Filtros de Partidos
  const selGroup = document.getElementById('filter-matches-group');
  const selTable = document.getElementById('filter-matches-table');
  const selHour = document.getElementById('filter-matches-hour');
  const selStatus = document.getElementById('filter-matches-status');
  const btnReset = document.getElementById('btn-reset-match-filters');

  if (selGroup) {
    selGroup.addEventListener('change', (e) => {
      filterGroup = e.target.value;
      renderMatchesView();
    });
  }
  if (selTable) {
    selTable.addEventListener('change', (e) => {
      filterTable = e.target.value;
      renderMatchesView();
    });
  }
  if (selHour) {
    selHour.addEventListener('change', (e) => {
      filterHour = e.target.value;
      renderMatchesView();
    });
  }
  if (selStatus) {
    selStatus.addEventListener('change', (e) => {
      filterStatus = e.target.value;
      renderMatchesView();
    });
  }
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      resetMatchFilters();
    });
  }

  // Filtro en pestaña Grupos
  const selStandingsGroup = document.getElementById('filter-group-standings');
  if (selStandingsGroup) {
    selStandingsGroup.addEventListener('change', (e) => {
      filterGroup = e.target.value;
      renderStandingsView();
    });
  }
}

function resetMatchFilters() {
  filterGroup = 'all';
  filterTable = 'all';
  filterHour = 'all';
  filterStatus = 'all';

  const g = document.getElementById('filter-matches-group');
  const t = document.getElementById('filter-matches-table');
  const h = document.getElementById('filter-matches-hour');
  const s = document.getElementById('filter-matches-status');

  if (g) g.value = 'all';
  if (t) t.value = 'all';
  if (h) h.value = 'all';
  if (s) s.value = 'all';

  renderMatchesView();
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
  updateGroupFilterOptions();
  resetMatchFilters();
  renderCurrentView();
}

function updateGroupFilterOptions() {
  const groupIndices = VENUES[currentVenue.toUpperCase()].groupIndices;
  const filterSelects = [
    document.getElementById('filter-matches-group'),
    document.getElementById('filter-group-standings')
  ];

  filterSelects.forEach(select => {
    if (!select) return;
    select.innerHTML = `<option value="all">Todos los Grupos (${currentVenue === 'vallecas' ? '1 al 4' : '5 al 8'})</option>` +
      groupIndices.map(g => `<option value="${g}">Grupo ${g}</option>`).join('');
    select.value = 'all';
  });
}

/**
 * Event Listeners & Modales
 */
function setupEventListeners() {
  // Modal Login Admin (Contraseña blackpool123)
  const btnLoginTrigger = document.getElementById('btn-login-admin-trigger');
  const modalLogin = document.getElementById('modal-admin-login');
  const btnSubmitLogin = document.getElementById('btn-submit-admin-login');
  const btnCancelLogin = document.getElementById('btn-cancel-admin-login');
  const txtPassword = document.getElementById('txt-admin-password');
  const btnLogoutTrigger = document.getElementById('btn-logout-admin-trigger');

  if (btnLoginTrigger && modalLogin) {
    btnLoginTrigger.addEventListener('click', () => {
      if (txtPassword) txtPassword.value = '';
      modalLogin.classList.add('is-open');
      if (txtPassword) txtPassword.focus();
    });
  }

  if (btnCancelLogin && modalLogin) {
    btnCancelLogin.addEventListener('click', () => {
      modalLogin.classList.remove('is-open');
    });
  }

  if (btnSubmitLogin) {
    btnSubmitLogin.addEventListener('click', () => {
      const pass = txtPassword ? txtPassword.value.trim() : '';
      if (ADMIN_PASSWORDS.includes(pass)) {
        setAdminAuth(true);
        modalLogin.classList.remove('is-open');
        showToast('🔓 Modo Administrador desbloqueado con éxito', 'success');
        renderAllViews();
      } else {
        alert('❌ Contraseña incorrecta');
      }
    });
  }

  if (txtPassword) {
    txtPassword.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') btnSubmitLogin.click();
    });
  }

  if (btnLogoutTrigger) {
    btnLogoutTrigger.addEventListener('click', () => {
      setAdminAuth(false);
      showToast('🔒 Sesión de Administrador cerrada', 'info');
      renderAllViews();
    });
  }

  // Modal SQL Supabase Helper
  const btnOpenSql = document.getElementById('btn-open-sql-modal');
  const modalSql = document.getElementById('modal-supabase-sql');
  const btnCloseSql = document.getElementById('btn-close-sql-modal');
  const btnCopySql = document.getElementById('btn-copy-sql-code');

  if (btnOpenSql && modalSql) {
    btnOpenSql.addEventListener('click', () => modalSql.classList.add('is-open'));
  }
  if (btnCloseSql && modalSql) {
    btnCloseSql.addEventListener('click', () => modalSql.classList.remove('is-open'));
  }
  if (btnCopySql) {
    btnCopySql.addEventListener('click', () => {
      const code = document.getElementById('sql-code-display')?.textContent || '';
      navigator.clipboard.writeText(code).then(() => {
        showToast('📋 Código SQL copiado al portapapeles', 'success');
      });
    });
  }

  // Modal Reinicio
  const btnOpenReset = document.getElementById('btn-open-reset-modal');
  const modalReset = document.getElementById('modal-reset');
  const btnConfirmReset = document.getElementById('btn-confirm-reset');
  const btnCancelReset = document.getElementById('btn-cancel-reset');

  if (btnOpenReset) {
    btnOpenReset.addEventListener('click', () => {
      if (!isAdminAuthenticated) {
        showToast('⚠️ Debes identificarte como Administrador', 'warning');
        if (btnLoginTrigger) btnLoginTrigger.click();
        return;
      }
      modalReset.classList.add('is-open');
    });
  }

  if (btnCancelReset && modalReset) {
    btnCancelReset.addEventListener('click', () => modalReset.classList.remove('is-open'));
  }

  if (btnConfirmReset && modalReset) {
    btnConfirmReset.addEventListener('click', async () => {
      const resetPlayers = document.getElementById('chk-reset-names')?.checked || false;
      await resetTournament(resetPlayers);
      modalReset.classList.remove('is-open');
      showToast('🔄 Torneo reiniciado y sincronizado', 'success');
    });
  }

  // Modal QR
  const btnShareQR = document.getElementById('btn-share-qr');
  const modalQR = document.getElementById('modal-qr');
  const btnCloseQR = document.getElementById('btn-close-qr');

  if (btnShareQR && modalQR) {
    btnShareQR.addEventListener('click', () => {
      generateQRCode();
      modalQR.classList.add('is-open');
    });
  }

  if (btnCloseQR && modalQR) {
    btnCloseQR.addEventListener('click', () => modalQR.classList.remove('is-open'));
  }

  // Exportar / Importar
  const btnExport = document.getElementById('btn-export-json');
  if (btnExport) btnExport.addEventListener('click', exportTournamentJSON);

  const fileInputImport = document.getElementById('file-import-json');
  if (fileInputImport) fileInputImport.addEventListener('change', handleImportFile);

  // Guardar nombres
  const btnSaveAllNames = document.getElementById('btn-save-player-names');
  if (btnSaveAllNames) btnSaveAllNames.addEventListener('click', savePlayerNamesFromAdmin);

  // Cerrar modales clicando fuera
  document.querySelectorAll('.modal-backdrop').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('is-open');
    });
  });
}

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

function updateHeaderStats() {
  let totalMatches = 0;
  let completedMatches = 0;
  let totalPoints = 0;
  let highestBreakTournament = 0;

  for (let g = 1; g <= 8; g++) {
    const group = tournamentState.groups[g];
    totalMatches += group.matches.length;
    group.matches.forEach(m => {
      if (m.isCompleted || m.p1FramesWon >= 2 || m.p2FramesWon >= 2) {
        completedMatches++;
      }
      if (m.p1HighestBreak) highestBreakTournament = Math.max(highestBreakTournament, Number(m.p1HighestBreak));
      if (m.p2HighestBreak) highestBreakTournament = Math.max(highestBreakTournament, Number(m.p2HighestBreak));

      m.frames.forEach(f => {
        if (f.p1Points) totalPoints += Number(f.p1Points);
        if (f.p2Points) totalPoints += Number(f.p2Points);
      });
    });
  }

  const elCompleted = document.getElementById('stat-matches-completed');
  const elPoints = document.getElementById('stat-total-points');
  const elBreak = document.getElementById('stat-highest-break');
  const elPercent = document.getElementById('stat-progress-percent');

  if (elCompleted) elCompleted.textContent = `${completedMatches}/${totalMatches}`;
  if (elPoints) elPoints.textContent = totalPoints.toLocaleString();
  if (elBreak) elBreak.textContent = highestBreakTournament > 0 ? `${highestBreakTournament} pts` : '-';
  if (elPercent) {
    const pct = totalMatches > 0 ? Math.round((completedMatches / totalMatches) * 100) : 0;
    elPercent.textContent = `${pct}%`;
  }
}

/**
 * =========================================================================
 * VISTA 1: PARTIDOS (MATCHES VIEW) - FILTRADA Y REDISEÑADA
 * =========================================================================
 */
function renderMatchesView() {
  const container = document.getElementById('matches-container');
  if (!container) return;

  const targetGroupIndices = VENUES[currentVenue.toUpperCase()].groupIndices;

  // Recolectar todos los partidos de la sede seleccionada
  let allVenueMatches = [];
  targetGroupIndices.forEach(gId => {
    const g = tournamentState.groups[gId];
    g.matches.forEach(m => {
      allVenueMatches.push({ match: m, group: g });
    });
  });

  // Aplicar filtros: Grupo, Mesa, Hora, Estado
  let filtered = allVenueMatches.filter(({ match, group }) => {
    // 1. Filtro por grupo
    if (filterGroup !== 'all' && group.id.toString() !== filterGroup.toString()) {
      return false;
    }
    // 2. Filtro por mesa
    if (filterTable !== 'all' && match.table !== filterTable) {
      return false;
    }
    // 3. Filtro por hora/día
    if (filterHour !== 'all') {
      const matchScheduleStr = `${match.day} ${match.time}`;
      if (matchScheduleStr !== filterHour) return false;
    }
    // 4. Filtro por estado
    if (filterStatus !== 'all') {
      const isCompleted = (match.isCompleted || match.p1FramesWon >= 2 || match.p2FramesWon >= 2);
      const isProgress = !isCompleted && (match.p1FramesWon > 0 || match.p2FramesWon > 0 || match.frames.some(f => f.p1Points !== null || f.p2Points !== null));
      const isPending = !isCompleted && !isProgress;

      if (filterStatus === 'completed' && !isCompleted) return false;
      if (filterStatus === 'in_progress' && !isProgress) return false;
      if (filterStatus === 'pending' && !isPending) return false;
    }
    return true;
  });

  // Actualizar contador de partidos
  const countBadge = document.getElementById('filtered-matches-counter');
  if (countBadge) {
    countBadge.textContent = `Mostrando ${filtered.length} de ${allVenueMatches.length} partidos`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="info-notice" style="text-align:center; justify-content:center;">
        <span>🔍</span>
        <div>No se encontraron partidos con los filtros seleccionados. <button type="button" class="btn-clear-match" onclick="resetMatchFilters()" style="color:var(--gold-light); font-weight:800; text-decoration:underline;">Restablecer filtros</button></div>
      </div>
    `;
    return;
  }

  // Agrupar los partidos filtrados por grupo
  const matchesByGroup = {};
  filtered.forEach(({ match, group }) => {
    if (!matchesByGroup[group.id]) {
      matchesByGroup[group.id] = { group, matches: [] };
    }
    matchesByGroup[group.id].matches.push(match);
  });

  let html = '';
  Object.values(matchesByGroup).forEach(({ group, matches }) => {
    const groupStatus = getGroupStatus(group);

    html += `
      <div class="group-match-card-container">
        <div class="group-header-banner">
          <div class="group-title-wrap">
            <span class="group-badge-num">${group.id}</span>
            <div>
              <h2>${group.name} · ${group.venueName}</h2>
            </div>
          </div>
          <div class="group-players-chips">
            ${group.playerIds.map(pId => `<span class="player-mini-chip">👤 ${escapeHtml(tournamentState.players[pId]?.name || `Jugador ${pId}`)}</span>`).join('')}
            <span class="match-status-badge ${groupStatus.badgeClass}">${groupStatus.icon} ${groupStatus.text}</span>
          </div>
        </div>
        
        <div class="matches-list-grid">
          ${matches.map(m => renderSingleMatchCard(m, group)).join('')}
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
  attachMatchInputListeners();
}

function renderSingleMatchCard(match, group) {
  const p1 = tournamentState.players[match.player1Id] || { name: `Jugador ${match.player1Id}` };
  const p2 = tournamentState.players[match.player2Id] || { name: `Jugador ${match.player2Id}` };

  const isCompleted = (match.isCompleted || match.p1FramesWon >= 2 || match.p2FramesWon >= 2);
  const isInProgress = !isCompleted && (match.p1FramesWon > 0 || match.p2FramesWon > 0 || match.frames.some(f => f.p1Points !== null || f.p2Points !== null));

  let statusClass = 'badge-pending';
  let statusText = '⏳ Pendiente';
  let cardClass = 'is-pending';

  if (isCompleted) {
    statusClass = 'badge-completed';
    statusText = '🏆 Finalizado';
    cardClass = 'is-completed';
  } else if (isInProgress) {
    statusClass = 'badge-progress';
    statusText = '🔴 En juego';
    cardClass = 'in-progress';
  }

  const p1IsWinner = isCompleted && match.winnerId === p1.id;
  const p2IsWinner = isCompleted && match.winnerId === p2.id;
  const disabledAttr = !isAdminAuthenticated ? 'disabled' : '';

  const winnerName = p1IsWinner ? p1.name : (p2IsWinner ? p2.name : null);

  return `
    <div class="match-card ${cardClass}" id="card-${match.id}" data-match-id="${match.id}">
      
      <!-- Cabecera de Horario y Mesa -->
      <div class="match-card-schedule-header">
        <div class="schedule-badge-highlight">
          <span>🕒</span>
          <span>${escapeHtml(match.day || 'Viernes')} · ${escapeHtml(match.time || '12:00')}</span>
        </div>
        <div style="display:flex; align-items:center; gap:0.5rem;">
          <span class="table-badge-highlight">${escapeHtml(match.table || 'Mesa 1')} · ${escapeHtml(match.venueName || 'Vallecas')}</span>
          <span class="match-status-badge ${statusClass}">${statusText}</span>
        </div>
      </div>

      ${isCompleted && winnerName ? `
        <div class="match-finished-banner">
          <span>🏆 GANADOR:</span>
          <strong style="color:#fff; font-size:0.95rem;">${escapeHtml(winnerName)}</strong>
          <span>(${match.p1FramesWon} - ${match.p2FramesWon})</span>
        </div>
      ` : ''}

      <!-- Enfrentamiento con NOMBRES MUY GRANDES -->
      <div class="match-players-faceoff">
        <div class="player-side player-left">
          <span class="player-name-display ${p1IsWinner ? 'is-winner' : ''}" title="${escapeHtml(p1.name)}">
            ${p1IsWinner ? '🏆 ' : ''}${escapeHtml(p1.name)}
          </span>
          <span class="player-frames-count" id="fcount-p1-${match.id}">${match.p1FramesWon}</span>
        </div>

        <div class="match-vs-divider">
          <span>VS</span>
        </div>

        <div class="player-side player-right">
          <span class="player-name-display ${p2IsWinner ? 'is-winner' : ''}" title="${escapeHtml(p2.name)}">
            ${escapeHtml(p2.name)}${p2IsWinner ? ' 🏆' : ''}
          </span>
          <span class="player-frames-count" id="fcount-p2-${match.id}">${match.p2FramesWon}</span>
        </div>
      </div>

      <!-- Break Máximo -->
      <div class="match-highest-breaks-row">
        <div class="break-item-box">
          <span class="break-label">🔥 Break J1:</span>
          <input type="number" min="0" max="155" placeholder="-" class="break-input" data-match="${match.id}" data-player="p1" 
                 value="${match.p1HighestBreak !== null ? match.p1HighestBreak : ''}" ${disabledAttr}>
        </div>
        <div class="break-item-box">
          <span class="break-label">🔥 Break J2:</span>
          <input type="number" min="0" max="155" placeholder="-" class="break-input" data-match="${match.id}" data-player="p2" 
                 value="${match.p2HighestBreak !== null ? match.p2HighestBreak : ''}" ${disabledAttr}>
        </div>
      </div>

      <!-- Puntuación por Frames -->
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
                     data-match="${match.id}" data-frame-idx="${idx}" data-player="p1" value="${p1Pts}" ${disabledAttr}>
              <span class="frame-mid-indicator">-</span>
              <input type="number" min="0" max="155" placeholder="0" class="frame-pts-input frame-p2-pts ${p2WinFrame ? 'winner-pts' : ''}" 
                     data-match="${match.id}" data-frame-idx="${idx}" data-player="p2" value="${p2Pts}" ${disabledAttr}>
            </div>
          `;
        }).join('')}
      </div>

      ${isAdminAuthenticated ? `
        <div class="match-card-actions">
          <button type="button" class="btn-clear-match" data-match="${match.id}" title="Limpiar resultado">
            🗑️ Limpiar
          </button>
          <button type="button" class="btn-quick-save" data-match="${match.id}">
            💾 Guardar Partido
          </button>
        </div>
      ` : `
        <div style="font-size:0.75rem; color:var(--text-dim); text-align:center; padding-top:0.2rem;">
          👀 Solo lectura · Inicia sesión como admin para editar
        </div>
      `}
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

  document.querySelectorAll('.break-input').forEach(input => {
    input.addEventListener('change', (e) => {
      const matchId = e.target.getAttribute('data-match');
      const playerKey = e.target.getAttribute('data-player');
      const value = e.target.value.trim() === '' ? null : parseInt(e.target.value);
      handleBreakChange(matchId, playerKey, value);
    });
  });

  document.querySelectorAll('.btn-clear-match').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const matchId = btn.getAttribute('data-match');
      if (confirm('¿Deseas limpiar las puntuaciones de este partido?')) {
        clearMatchScores(matchId);
      }
    });
  });

  document.querySelectorAll('.btn-quick-save').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const saveRes = await saveTournamentDataAsync(tournamentState);
      if (saveRes.success) {
        showToast('💾 Partido guardado y sincronizado en Supabase', 'success');
      } else if (saveRes.isTableMissing) {
        showToast('⚠️ Guardado local. Falta crear la tabla en Supabase.', 'warning');
        updateSupabaseAlertBanner();
      } else {
        showToast('⚠️ Guardado local (revisa conexión)', 'warning');
      }
      renderAllViews();
    });
  });
}

function handleBreakChange(matchId, playerKey, value) {
  const match = findMatchById(matchId);
  if (!match) return;

  if (playerKey === 'p1') match.p1HighestBreak = value;
  if (playerKey === 'p2') match.p2HighestBreak = value;

  saveTournamentDataAsync(tournamentState);
  updateHeaderStats();
}

function handleFrameScoreChange(matchId, frameIdx, playerKey, value) {
  const match = findMatchById(matchId);
  if (!match) return;

  const frame = match.frames[frameIdx];
  if (playerKey === 'p1') frame.p1Points = value;
  else if (playerKey === 'p2') frame.p2Points = value;

  recalculateMatchOutcome(match);
  saveTournamentDataAsync(tournamentState);
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
    match.status = 'completed';
  } else if (p2FramesWon >= 2) {
    match.winnerId = match.player2Id;
    match.isCompleted = true;
    match.status = 'completed';
  } else if (p1FramesWon > 0 || p2FramesWon > 0 || match.frames.some(f => f.p1Points !== null || f.p2Points !== null)) {
    match.winnerId = null;
    match.isCompleted = false;
    match.status = 'in_progress';
  } else {
    match.winnerId = null;
    match.isCompleted = false;
    match.status = 'pending';
  }
}

function updateMatchCardUI(match) {
  const card = document.getElementById(`card-${match.id}`);
  if (!card) return;

  const p1Count = document.getElementById(`fcount-p1-${match.id}`);
  const p2Count = document.getElementById(`fcount-p2-${match.id}`);

  if (p1Count) p1Count.textContent = match.p1FramesWon;
  if (p2Count) p2Count.textContent = match.p2FramesWon;

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
  match.p1HighestBreak = null;
  match.p2HighestBreak = null;
  match.winnerId = null;
  match.status = 'pending';
  match.isCompleted = false;

  saveTournamentDataAsync(tournamentState);
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
  const filteredIndices = (filterGroup === 'all') 
    ? targetGroupIndices 
    : targetGroupIndices.filter(g => g.toString() === filterGroup.toString());

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
              <h2 style="font-size:1.2rem; font-weight:900; color:#fff;">${group.name} · ${group.venueName}</h2>
            </div>
          </div>
          <span class="match-status-badge ${groupStatus.badgeClass}">${groupStatus.icon} ${groupStatus.text}</span>
        </div>

        <div class="table-responsive">
          <table class="standings-table">
            <thead>
              <tr>
                <th style="width: 50px;">Pos</th>
                <th>Jugador</th>
                <th style="text-align: center;">PJ</th>
                <th style="text-align: center;">PG</th>
                <th style="text-align: center;">FG</th>
                <th style="text-align: center;">FP</th>
                <th style="text-align: center;">Break Máx</th>
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
                        ${row.isQualified ? '<span class="qualify-dot" title="Clasifica a Octavos de Final"></span>' : ''}
                        <span>${escapeHtml(row.player.name)}</span>
                      </div>
                    </td>
                    <td class="num-cell">${row.matchesPlayed}</td>
                    <td class="num-cell" style="color:#86efac; font-weight:800;">${row.matchesWon}</td>
                    <td class="num-cell" style="color:var(--gold); font-weight:800;">${row.framesWon}</td>
                    <td class="num-cell" style="color:var(--text-dim);">${row.framesLost}</td>
                    <td class="num-cell" style="color:var(--gold-light); font-weight:800;">${row.highestBreak > 0 ? row.highestBreak : '-'}</td>
                    <td class="num-cell points-cell">${row.totalPoints} pts</td>
                    <td class="num-cell">
                      ${row.position <= 2 ? '<span style="color:#86efac; font-weight:900; font-size:0.88rem;">Octavos ✅</span>' : '<span style="color:var(--text-dim); font-size:0.8rem;">-</span>'}
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
  const filteredIndices = (filterGroup === 'all') 
    ? targetGroupIndices 
    : targetGroupIndices.filter(g => g.toString() === filterGroup.toString());

  let html = '';

  filteredIndices.forEach(groupId => {
    const group = tournamentState.groups[groupId];

    html += `
      <div class="group-frame-breakdown-card" style="background:var(--bg-card); border:1px solid var(--border-color); border-radius:var(--radius-lg); overflow:hidden; margin-bottom:1.5rem;">
        <div class="group-header-banner">
          <div class="group-title-wrap">
            <span class="group-badge-num">${group.id}</span>
            <h2 style="font-size:1.15rem; font-weight:800;">Desglose Individual de Frames · ${group.name}</h2>
          </div>
        </div>

        <div style="display:flex; flex-direction:column; padding:0.5rem;">
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
                <div style="display:flex; align-items:center; justify-content:space-between; padding:0.75rem 1rem; border-bottom:1px solid rgba(255,255,255,0.04); font-size:0.92rem; gap:1rem; flex-wrap:wrap;">
                  <div style="display:flex; align-items:center; gap:0.75rem; min-width:280px;">
                    <span style="background:var(--bg-surface); color:var(--gold); border:1px solid var(--border-gold); font-size:0.75rem; font-weight:800; padding:0.2rem 0.5rem; border-radius:4px; font-family:'JetBrains Mono',monospace;">Gr.${groupId} P${m.matchNumber} · F${fNum}</span>
                    <span style="font-weight:800; color:#fff;">${escapeHtml(p1.name)} vs ${escapeHtml(p2.name)}</span>
                    <span style="font-size:0.75rem; color:var(--text-dim);">(${m.day} ${m.time} · ${m.table})</span>
                  </div>

                  <div style="display:flex; align-items:center; gap:1.25rem;">
                    <div style="display:flex; align-items:center; gap:0.5rem;">
                      <span style="color: ${p1Wins ? '#86efac' : 'var(--text-main)'}; font-weight: ${p1Wins ? '800' : '600'};">${escapeHtml(p1.name)}</span>
                      <span class="score-num-badge ${p1Wins ? 'winner' : ''}" style="background:var(--bg-input); border:1px solid var(--border-color); padding:0.2rem 0.6rem; border-radius:4px; font-weight:800; font-family:'JetBrains Mono',monospace;">${p1Pts !== null ? p1Pts : '-'}</span>
                    </div>
                    <span style="color:var(--text-dim); font-size:0.85rem;">vs</span>
                    <div style="display:flex; align-items:center; gap:0.5rem;">
                      <span class="score-num-badge ${p2Wins ? 'winner' : ''}" style="background:var(--bg-input); border:1px solid var(--border-color); padding:0.2rem 0.6rem; border-radius:4px; font-weight:800; font-family:'JetBrains Mono',monospace;">${p2Pts !== null ? p2Pts : '-'}</span>
                      <span style="color: ${p2Wins ? '#86efac' : 'var(--text-main)'}; font-weight: ${p2Wins ? '800' : '600'};">${escapeHtml(p2.name)}</span>
                    </div>
                    ${diff !== null ? `<span style="font-size:0.75rem; color:var(--text-dim); font-family:'JetBrains Mono',monospace;">(Dif: +${diff} pts)</span>` : '<span style="font-size:0.75rem; color:var(--text-dim);">Sin jugar</span>'}
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
 * VISTA 4: FASE FINAL (OCTAVOS -> CUARTOS -> SEMIS -> FINAL)
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
        
        <!-- OCTAVOS DE FINAL (16 CLASIFICADOS - 8 PARTIDOS) -->
        <div class="bracket-round-column">
          <div class="bracket-round-header">Octavos de Final (8 Partidos)</div>
          <div class="bracket-matches-list">
            ${po.octavos.map(m => renderPlayoffNode(m, 'octavos')).join('')}
          </div>
        </div>

        <!-- CUARTOS DE FINAL (4 PARTIDOS) -->
        <div class="bracket-round-column">
          <div class="bracket-round-header">Cuartos de Final (4 Partidos)</div>
          <div class="bracket-matches-list">
            ${po.cuartos.map(m => renderPlayoffNode(m, 'cuartos')).join('')}
          </div>
        </div>

        <!-- SEMIFINALES (DOMINGO 09:00) -->
        <div class="bracket-round-column">
          <div class="bracket-round-header">Semifinales (Domingo 09:00)</div>
          <div class="bracket-matches-list">
            ${po.semifinales.map(m => renderPlayoffNode(m, 'semifinales')).join('')}
          </div>
        </div>

        <!-- GRAN FINAL (DOMINGO 13:00) -->
        <div class="bracket-round-column">
          <div class="bracket-round-header">🏆 Gran Final (Domingo 13:00)</div>
          <div class="bracket-matches-list">
            ${renderPlayoffNode(po.final, 'final')}
          </div>
        </div>

      </div>
    </div>
  `;

  if (po.final && po.final.winnerId) {
    const champion = tournamentState.players[po.final.winnerId];
    html += `
      <div class="champion-trophy-card" style="margin-top:2rem; background:linear-gradient(135deg, rgba(241,184,52,0.2) 0%, rgba(22,38,62,0.9) 100%); border:2px solid var(--gold); border-radius:var(--radius-lg); padding:2rem; text-align:center; box-shadow:0 0 35px var(--gold-glow); display:flex; flex-direction:column; align-items:center; gap:0.85rem;">
        <div style="font-size:3.5rem; animation:bounce 2s infinite ease-in-out;">🏆</div>
        <div style="font-size:0.95rem; text-transform:uppercase; letter-spacing:0.12em; color:var(--gold); font-weight:900;">¡CAMPEÓN DEL TORNEO DE SNOOKER!</div>
        <div style="font-size:2rem; font-weight:900; color:var(--gold-light); text-shadow:0 0 20px rgba(241,184,52,0.7);">${escapeHtml(champion?.name || 'Campeón')}</div>
        <p style="color:var(--text-muted); font-size:0.95rem;">Ganador absoluto del Torneo Snooker Blackpool Madrid</p>
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
  const disabledAttr = (!isAdminAuthenticated || !match.player1Id || !match.player2Id) ? 'disabled' : '';

  return `
    <div class="bracket-match-node" data-round="${roundKey}" data-playoff-id="${match.id}">
      <div class="bracket-node-header">
        <span>${escapeHtml(match.label)}</span>
        <span class="bracket-node-schedule">${match.day || ''} ${match.time || ''}</span>
      </div>

      <div class="bracket-participant-row ${p1Won ? 'is-winner' : ''}">
        <span class="bracket-participant-name" title="${escapeHtml(p1Name)}">${p1Won ? '🏆 ' : ''}${escapeHtml(p1Name)}</span>
        <input type="number" min="0" max="3" class="bracket-score-input" data-round="${roundKey}" data-playoff-id="${match.id}" data-player="p1" 
               value="${match.p1FramesWon || 0}" ${disabledAttr}>
      </div>

      <div class="bracket-participant-row ${p2Won ? 'is-winner' : ''}">
        <span class="bracket-participant-name" title="${escapeHtml(p2Name)}">${p2Won ? '🏆 ' : ''}${escapeHtml(p2Name)}</span>
        <input type="number" min="0" max="3" class="bracket-score-input" data-round="${roundKey}" data-playoff-id="${match.id}" data-player="p2" 
               value="${match.p2FramesWon || 0}" ${disabledAttr}>
      </div>
    </div>
  `;
}

function attachPlayoffScoreListeners() {
  document.querySelectorAll('.bracket-score-input').forEach(input => {
    input.addEventListener('change', async (e) => {
      const roundKey = e.target.getAttribute('data-round');
      const playoffId = e.target.getAttribute('data-playoff-id');
      const playerKey = e.target.getAttribute('data-player');
      const val = parseInt(e.target.value) || 0;

      await handlePlayoffScoreUpdate(roundKey, playoffId, playerKey, val);
    });
  });
}

async function handlePlayoffScoreUpdate(roundKey, playoffId, playerKey, val) {
  const po = tournamentState.playoffs;
  let match = null;

  if (roundKey === 'octavos') match = po.octavos.find(m => m.id === playoffId);
  else if (roundKey === 'cuartos') match = po.cuartos.find(m => m.id === playoffId);
  else if (roundKey === 'semifinales') match = po.semifinales.find(m => m.id === playoffId);
  else if (roundKey === 'final') match = po.final;

  if (!match) return;

  if (playerKey === 'p1') match.p1FramesWon = val;
  if (playerKey === 'p2') match.p2FramesWon = val;

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

  await saveTournamentDataAsync(tournamentState);
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
    const disabledAttr = !isAdminAuthenticated ? 'disabled' : '';

    html += `
      <div class="player-input-item" style="display:flex; align-items:center; gap:0.6rem; background:var(--bg-input); padding:0.55rem 0.8rem; border-radius:var(--radius-sm); border:1px solid var(--border-color);">
        <span class="player-num-tag" style="font-size:0.85rem; font-weight:900; color:var(--gold); width:28px;">#${i}</span>
        <input type="text" class="player-name-input" data-player-id="${i}" value="${escapeHtml(p.name)}" placeholder="Jugador ${i}" ${disabledAttr} style="flex:1; background:transparent; border:none; color:#fff; font-family:'Outfit',sans-serif; font-size:0.95rem; font-weight:700; outline:none;">
        <span style="font-size:0.75rem; color:var(--text-dim); white-space:nowrap;">Gr.${groupNum} (${venueName})</span>
      </div>
    `;
  }
  container.innerHTML = html;
}

async function savePlayerNamesFromAdmin() {
  if (!isAdminAuthenticated) {
    showToast('⚠️ Inicia sesión como administrador para guardar cambios', 'warning');
    return;
  }

  document.querySelectorAll('.player-name-input').forEach(input => {
    const pId = parseInt(input.getAttribute('data-player-id'));
    const val = input.value.trim();
    if (tournamentState.players[pId]) {
      tournamentState.players[pId].name = val !== '' ? val : `Jugador ${pId}`;
    }
  });

  const res = await saveTournamentDataAsync(tournamentState);
  if (res.success) {
    showToast('💾 Nombres sincronizados en Supabase para todos los jugadores', 'success');
  } else {
    showToast('⚠️ Guardado local (Falta tabla en Supabase)', 'warning');
    updateSupabaseAlertBanner();
  }
  renderAllViews();
}

/**
 * Exportar e Importar
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
  showToast('📥 Backup JSON descargado', 'success');
}

function handleImportFile(event) {
  if (!isAdminAuthenticated) {
    showToast('⚠️ Solo el administrador puede restaurar backups', 'warning');
    return;
  }

  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const imported = JSON.parse(e.target.result);
      if (imported && imported.groups && imported.players) {
        tournamentState = imported;
        await saveTournamentDataAsync(tournamentState);
        renderAllViews();
        showToast('✅ Torneo restaurado correctamente', 'success');
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
 * Reinicio del Torneo
 */
async function resetTournament(resetNames = false) {
  const fresh = createDefaultTournamentState();
  if (!resetNames && tournamentState && tournamentState.players) {
    fresh.players = tournamentState.players;
  }
  tournamentState = fresh;
  await saveTournamentDataAsync(tournamentState);
  renderAllViews();
}

/**
 * Generador de Código QR apuntando a la URL pública de Netlify
 */
function generateQRCode() {
  const container = document.getElementById('qr-canvas-wrap');
  if (!container) return;

  const targetUrl = PUBLIC_NETLIFY_URL;
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(targetUrl)}&bgcolor=ffffff&color=0b0d13`;

  container.innerHTML = `
    <img src="${qrApiUrl}" alt="Código QR del Torneo" style="width:220px; height:220px; border-radius:8px; display:block; margin:0 auto;" />
    <p style="margin-top:0.85rem; font-size:0.92rem; font-weight:800; color:var(--gold-light); word-break:break-all;">${targetUrl}</p>
    <p style="margin-top:0.25rem; font-size:0.82rem; color:var(--text-muted);">Enlace público en Netlify con actualización en vivo</p>
  `;
}

/**
 * Sistema Toast
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
  }, 2800);
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
