/**
 * TORNEO SNOOKER BLACKPOOL MADRID - DATA & ENGINE
 * 32 Jugadores | 8 Grupos de 4 | 2 Sedes (Vallecas & Alcobendas)
 * Conexión Supabase + Persistencia Local + Motor de Horarios y Breaks
 */

const SUPABASE_CONFIG = {
  url: 'https://hiyamdvdvvslkvmpdkuh.supabase.co',
  anonKey: 'sb_publishable_wIOFzHcSvy5eJ44BJGEU4A_DPyP2P_R',
  tableName: 'tournament_state',
  recordId: 'current'
};

const STORAGE_KEY = 'SNOOKER_TOURNAMENT_BLACKPOOL_MADRID_V2';
const ADMIN_PASSWORD_HASH = 'blackpoolmadrid123'; // Contraseña de administración solicitada

const VENUES = {
  VALLECAS: {
    id: 'vallecas',
    name: 'Sede Vallecas (VF)',
    shortName: 'Vallecas',
    groupIndices: [1, 2, 3, 4],
    tables: ['Mesa 1', 'Mesa 2', 'Mesa 3']
  },
  ALCOBENDAS: {
    id: 'alcobendas',
    name: 'Sede Alcobendas (BBM)',
    shortName: 'Alcobendas',
    groupIndices: [5, 6, 7, 8],
    tables: ['Mesa 1', 'Mesa 2', 'Mesa 3']
  }
};

/**
 * Horarios oficiales calculados para asegurar 1-2 partidos de descanso entre partidos de un jugador
 */
const DEFAULT_SCHEDULE_VALLECAS = [
  // Viernes
  { matchIdx: 0, group: 1, matchNum: 1, day: 'Viernes', time: '12:00', table: 'Mesa 1' },
  { matchIdx: 1, group: 1, matchNum: 2, day: 'Viernes', time: '12:00', table: 'Mesa 2' },
  { matchIdx: 2, group: 2, matchNum: 1, day: 'Viernes', time: '12:00', table: 'Mesa 3' },
  
  { matchIdx: 3, group: 2, matchNum: 2, day: 'Viernes', time: '14:00', table: 'Mesa 1' },
  { matchIdx: 4, group: 3, matchNum: 1, day: 'Viernes', time: '14:00', table: 'Mesa 2' },
  { matchIdx: 5, group: 3, matchNum: 2, day: 'Viernes', time: '14:00', table: 'Mesa 3' },
  
  { matchIdx: 6, group: 4, matchNum: 1, day: 'Viernes', time: '16:00', table: 'Mesa 1' },
  { matchIdx: 7, group: 4, matchNum: 2, day: 'Viernes', time: '16:00', table: 'Mesa 2' },
  { matchIdx: 8, group: 1, matchNum: 3, day: 'Viernes', time: '16:00', table: 'Mesa 3' },
  
  { matchIdx: 9, group: 1, matchNum: 4, day: 'Viernes', time: '18:00', table: 'Mesa 1' },
  { matchIdx: 10, group: 2, matchNum: 3, day: 'Viernes', time: '18:00', table: 'Mesa 2' },
  { matchIdx: 11, group: 2, matchNum: 4, day: 'Viernes', time: '18:00', table: 'Mesa 3' },
  
  { matchIdx: 12, group: 3, matchNum: 3, day: 'Viernes', time: '20:00', table: 'Mesa 1' },
  { matchIdx: 13, group: 3, matchNum: 4, day: 'Viernes', time: '20:00', table: 'Mesa 2' },
  { matchIdx: 14, group: 4, matchNum: 3, day: 'Viernes', time: '20:00', table: 'Mesa 3' },
  
  // Sábado
  { matchIdx: 15, group: 4, matchNum: 4, day: 'Sábado', time: '09:00', table: 'Mesa 1' },
  { matchIdx: 16, group: 1, matchNum: 5, day: 'Sábado', time: '09:00', table: 'Mesa 2' },
  { matchIdx: 17, group: 1, matchNum: 6, day: 'Sábado', time: '09:00', table: 'Mesa 3' },
  
  { matchIdx: 18, group: 2, matchNum: 5, day: 'Sábado', time: '11:00', table: 'Mesa 1' },
  { matchIdx: 19, group: 2, matchNum: 6, day: 'Sábado', time: '11:00', table: 'Mesa 2' },
  { matchIdx: 20, group: 3, matchNum: 5, day: 'Sábado', time: '11:00', table: 'Mesa 3' },
  
  { matchIdx: 21, group: 3, matchNum: 6, day: 'Sábado', time: '13:00', table: 'Mesa 1' },
  { matchIdx: 22, group: 4, matchNum: 5, day: 'Sábado', time: '13:00', table: 'Mesa 2' },
  { matchIdx: 23, group: 4, matchNum: 6, day: 'Sábado', time: '13:00', table: 'Mesa 3' }
];

const DEFAULT_SCHEDULE_ALCOBENDAS = [
  // Viernes
  { matchIdx: 0, group: 5, matchNum: 1, day: 'Viernes', time: '12:00', table: 'Mesa 1' },
  { matchIdx: 1, group: 5, matchNum: 2, day: 'Viernes', time: '12:00', table: 'Mesa 2' },
  { matchIdx: 2, group: 6, matchNum: 1, day: 'Viernes', time: '12:00', table: 'Mesa 3' },
  
  { matchIdx: 3, group: 6, matchNum: 2, day: 'Viernes', time: '14:00', table: 'Mesa 1' },
  { matchIdx: 4, group: 7, matchNum: 1, day: 'Viernes', time: '14:00', table: 'Mesa 2' },
  { matchIdx: 5, group: 7, matchNum: 2, day: 'Viernes', time: '14:00', table: 'Mesa 3' },
  
  { matchIdx: 6, group: 8, matchNum: 1, day: 'Viernes', time: '16:00', table: 'Mesa 1' },
  { matchIdx: 7, group: 8, matchNum: 2, day: 'Viernes', time: '16:00', table: 'Mesa 2' },
  { matchIdx: 8, group: 5, matchNum: 3, day: 'Viernes', time: '16:00', table: 'Mesa 3' },
  
  { matchIdx: 9, group: 5, matchNum: 4, day: 'Viernes', time: '18:00', table: 'Mesa 1' },
  { matchIdx: 10, group: 6, matchNum: 3, day: 'Viernes', time: '18:00', table: 'Mesa 2' },
  { matchIdx: 11, group: 6, matchNum: 4, day: 'Viernes', time: '18:00', table: 'Mesa 3' },
  
  { matchIdx: 12, group: 7, matchNum: 3, day: 'Viernes', time: '20:00', table: 'Mesa 1' },
  { matchIdx: 13, group: 7, matchNum: 4, day: 'Viernes', time: '20:00', table: 'Mesa 2' },
  { matchIdx: 14, group: 8, matchNum: 3, day: 'Viernes', time: '20:00', table: 'Mesa 3' },
  
  // Sábado
  { matchIdx: 15, group: 8, matchNum: 4, day: 'Sábado', time: '09:00', table: 'Mesa 1' },
  { matchIdx: 16, group: 5, matchNum: 5, day: 'Sábado', time: '09:00', table: 'Mesa 2' },
  { matchIdx: 17, group: 5, matchNum: 6, day: 'Sábado', time: '09:00', table: 'Mesa 3' },
  
  { matchIdx: 18, group: 6, matchNum: 5, day: 'Sábado', time: '11:00', table: 'Mesa 1' },
  { matchIdx: 19, group: 6, matchNum: 6, day: 'Sábado', time: '11:00', table: 'Mesa 2' },
  { matchIdx: 20, group: 7, matchNum: 5, day: 'Sábado', time: '11:00', table: 'Mesa 3' },
  
  { matchIdx: 21, group: 7, matchNum: 6, day: 'Sábado', time: '13:00', table: 'Mesa 1' },
  { matchIdx: 22, group: 8, matchNum: 5, day: 'Sábado', time: '13:00', table: 'Mesa 2' },
  { matchIdx: 23, group: 8, matchNum: 6, day: 'Sábado', time: '13:00', table: 'Mesa 3' }
];

/**
 * Crea el estado inicial por defecto del torneo
 */
function createDefaultTournamentState() {
  const players = {};
  const groups = {};

  // Crear 32 jugadores (1 a 32)
  for (let i = 1; i <= 32; i++) {
    players[i] = {
      id: i,
      name: `Jugador ${i}`,
      seed: i,
      highestBreak: 0
    };
  }

  // Crear 8 Grupos de 4 personas
  for (let g = 1; g <= 8; g++) {
    const venue = g <= 4 ? 'vallecas' : 'alcobendas';
    const venueName = g <= 4 ? 'Vallecas' : 'Alcobendas';
    const startPlayerId = (g - 1) * 4 + 1;
    const playerIds = [startPlayerId, startPlayerId + 1, startPlayerId + 2, startPlayerId + 3];

    // Combinaciones Round-Robin optimizadas para descansos
    // J1 vs J2, J3 vs J4, J1 vs J3, J2 vs J4, J1 vs J4, J2 vs J3
    const pairings = [
      [playerIds[0], playerIds[1]],
      [playerIds[2], playerIds[3]],
      [playerIds[0], playerIds[2]],
      [playerIds[1], playerIds[3]],
      [playerIds[0], playerIds[4] || playerIds[3]],
      [playerIds[1], playerIds[2]]
    ];

    const schedList = g <= 4 ? DEFAULT_SCHEDULE_VALLECAS : DEFAULT_SCHEDULE_ALCOBENDAS;

    const matches = pairings.map((pair, index) => {
      const matchNum = index + 1;
      const sched = schedList.find(s => s.group === g && s.matchNum === matchNum) || {
        day: 'Viernes',
        time: '12:00',
        table: 'Mesa 1'
      };

      return {
        id: `G${g}_M${matchNum}`,
        groupId: g,
        matchNumber: matchNum,
        player1Id: pair[0],
        player2Id: pair[1],
        venue: venue,
        venueName: venueName,
        day: sched.day,
        time: sched.time,
        table: sched.table,
        p1HighestBreak: null,
        p2HighestBreak: null,
        frames: [
          { frameNum: 1, p1Points: null, p2Points: null, winnerId: null },
          { frameNum: 2, p1Points: null, p2Points: null, winnerId: null },
          { frameNum: 3, p1Points: null, p2Points: null, winnerId: null }
        ],
        p1FramesWon: 0,
        p2FramesWon: 0,
        winnerId: null,
        status: 'pending', // 'pending' | 'in_progress' | 'completed'
        isCompleted: false
      };
    });

    groups[g] = {
      id: g,
      name: `Grupo ${g}`,
      venue: venue,
      venueName: venueName,
      playerIds: playerIds,
      matches: matches
    };
  }

  // Estructura oficial de FASE FINAL:
  // Octavos de final (16 clasificados) -> Cuartos de final -> Semifinales -> Gran Final
  const playoffs = {
    octavos: [
      { id: 'OCT_1', matchNum: 1, label: 'Octavos 1', roundName: 'Octavos de Final', p1Source: { group: 1, pos: 1 }, p2Source: { group: 2, pos: 2 }, player1Id: null, player2Id: null, day: 'Sábado', time: '15:00', table: 'Mesa 1', venue: 'vallecas', p1HighestBreak: null, p2HighestBreak: null, frames: [{p1Points: null, p2Points: null}, {p1Points: null, p2Points: null}, {p1Points: null, p2Points: null}], p1FramesWon: 0, p2FramesWon: 0, winnerId: null, status: 'pending', isCompleted: false },
      { id: 'OCT_2', matchNum: 2, label: 'Octavos 2', roundName: 'Octavos de Final', p1Source: { group: 2, pos: 1 }, p2Source: { group: 1, pos: 2 }, player1Id: null, player2Id: null, day: 'Sábado', time: '15:00', table: 'Mesa 2', venue: 'vallecas', p1HighestBreak: null, p2HighestBreak: null, frames: [{p1Points: null, p2Points: null}, {p1Points: null, p2Points: null}, {p1Points: null, p2Points: null}], p1FramesWon: 0, p2FramesWon: 0, winnerId: null, status: 'pending', isCompleted: false },
      { id: 'OCT_3', matchNum: 3, label: 'Octavos 3', roundName: 'Octavos de Final', p1Source: { group: 3, pos: 1 }, p2Source: { group: 4, pos: 2 }, player1Id: null, player2Id: null, day: 'Sábado', time: '15:00', table: 'Mesa 3', venue: 'vallecas', p1HighestBreak: null, p2HighestBreak: null, frames: [{p1Points: null, p2Points: null}, {p1Points: null, p2Points: null}, {p1Points: null, p2Points: null}], p1FramesWon: 0, p2FramesWon: 0, winnerId: null, status: 'pending', isCompleted: false },
      { id: 'OCT_4', matchNum: 4, label: 'Octavos 4', roundName: 'Octavos de Final', p1Source: { group: 4, pos: 1 }, p2Source: { group: 3, pos: 2 }, player1Id: null, player2Id: null, day: 'Sábado', time: '17:00', table: 'Mesa 1', venue: 'vallecas', p1HighestBreak: null, p2HighestBreak: null, frames: [{p1Points: null, p2Points: null}, {p1Points: null, p2Points: null}, {p1Points: null, p2Points: null}], p1FramesWon: 0, p2FramesWon: 0, winnerId: null, status: 'pending', isCompleted: false },
      { id: 'OCT_5', matchNum: 5, label: 'Octavos 5', roundName: 'Octavos de Final', p1Source: { group: 5, pos: 1 }, p2Source: { group: 6, pos: 2 }, player1Id: null, player2Id: null, day: 'Sábado', time: '15:00', table: 'Mesa 1', venue: 'alcobendas', p1HighestBreak: null, p2HighestBreak: null, frames: [{p1Points: null, p2Points: null}, {p1Points: null, p2Points: null}, {p1Points: null, p2Points: null}], p1FramesWon: 0, p2FramesWon: 0, winnerId: null, status: 'pending', isCompleted: false },
      { id: 'OCT_6', matchNum: 6, label: 'Octavos 6', roundName: 'Octavos de Final', p1Source: { group: 6, pos: 1 }, p2Source: { group: 5, pos: 2 }, player1Id: null, player2Id: null, day: 'Sábado', time: '15:00', table: 'Mesa 2', venue: 'alcobendas', p1HighestBreak: null, p2HighestBreak: null, frames: [{p1Points: null, p2Points: null}, {p1Points: null, p2Points: null}, {p1Points: null, p2Points: null}], p1FramesWon: 0, p2FramesWon: 0, winnerId: null, status: 'pending', isCompleted: false },
      { id: 'OCT_7', matchNum: 7, label: 'Octavos 7', roundName: 'Octavos de Final', p1Source: { group: 7, pos: 1 }, p2Source: { group: 8, pos: 2 }, player1Id: null, player2Id: null, day: 'Sábado', time: '15:00', table: 'Mesa 3', venue: 'alcobendas', p1HighestBreak: null, p2HighestBreak: null, frames: [{p1Points: null, p2Points: null}, {p1Points: null, p2Points: null}, {p1Points: null, p2Points: null}], p1FramesWon: 0, p2FramesWon: 0, winnerId: null, status: 'pending', isCompleted: false },
      { id: 'OCT_8', matchNum: 8, label: 'Octavos 8', roundName: 'Octavos de Final', p1Source: { group: 8, pos: 1 }, p2Source: { group: 7, pos: 2 }, player1Id: null, player2Id: null, day: 'Sábado', time: '17:00', table: 'Mesa 1', venue: 'alcobendas', p1HighestBreak: null, p2HighestBreak: null, frames: [{p1Points: null, p2Points: null}, {p1Points: null, p2Points: null}, {p1Points: null, p2Points: null}], p1FramesWon: 0, p2FramesWon: 0, winnerId: null, status: 'pending', isCompleted: false }
    ],
    cuartos: [
      { id: 'QF_1', matchNum: 1, label: 'Cuartos 1', roundName: 'Cuartos de Final', p1SourceMatch: 'OCT_1', p2SourceMatch: 'OCT_3', player1Id: null, player2Id: null, day: 'Sábado', time: '19:00', table: 'Mesa 1', venue: 'vallecas', p1HighestBreak: null, p2HighestBreak: null, frames: [{p1Points: null, p2Points: null}, {p1Points: null, p2Points: null}, {p1Points: null, p2Points: null}], p1FramesWon: 0, p2FramesWon: 0, winnerId: null, status: 'pending', isCompleted: false },
      { id: 'QF_2', matchNum: 2, label: 'Cuartos 2', roundName: 'Cuartos de Final', p1SourceMatch: 'OCT_2', p2SourceMatch: 'OCT_4', player1Id: null, player2Id: null, day: 'Sábado', time: '19:00', table: 'Mesa 2', venue: 'vallecas', p1HighestBreak: null, p2HighestBreak: null, frames: [{p1Points: null, p2Points: null}, {p1Points: null, p2Points: null}, {p1Points: null, p2Points: null}], p1FramesWon: 0, p2FramesWon: 0, winnerId: null, status: 'pending', isCompleted: false },
      { id: 'QF_3', matchNum: 3, label: 'Cuartos 3', roundName: 'Cuartos de Final', p1SourceMatch: 'OCT_5', p2SourceMatch: 'OCT_7', player1Id: null, player2Id: null, day: 'Sábado', time: '19:00', table: 'Mesa 1', venue: 'alcobendas', p1HighestBreak: null, p2HighestBreak: null, frames: [{p1Points: null, p2Points: null}, {p1Points: null, p2Points: null}, {p1Points: null, p2Points: null}], p1FramesWon: 0, p2FramesWon: 0, winnerId: null, status: 'pending', isCompleted: false },
      { id: 'QF_4', matchNum: 4, label: 'Cuartos 4', roundName: 'Cuartos de Final', p1SourceMatch: 'OCT_6', p2SourceMatch: 'OCT_8', player1Id: null, player2Id: null, day: 'Sábado', time: '19:00', table: 'Mesa 2', venue: 'alcobendas', p1HighestBreak: null, p2HighestBreak: null, frames: [{p1Points: null, p2Points: null}, {p1Points: null, p2Points: null}, {p1Points: null, p2Points: null}], p1FramesWon: 0, p2FramesWon: 0, winnerId: null, status: 'pending', isCompleted: false }
    ],
    semifinales: [
      { id: 'SF_1', matchNum: 1, label: 'Semifinal 1', roundName: 'Semifinales', p1SourceMatch: 'QF_1', p2SourceMatch: 'QF_2', player1Id: null, player2Id: null, day: 'Domingo', time: '09:00', table: 'Mesa 1', venue: 'vallecas', p1HighestBreak: null, p2HighestBreak: null, frames: [{p1Points: null, p2Points: null}, {p1Points: null, p2Points: null}, {p1Points: null, p2Points: null}], p1FramesWon: 0, p2FramesWon: 0, winnerId: null, status: 'pending', isCompleted: false },
      { id: 'SF_2', matchNum: 2, label: 'Semifinal 2', roundName: 'Semifinales', p1SourceMatch: 'QF_3', p2SourceMatch: 'QF_4', player1Id: null, player2Id: null, day: 'Domingo', time: '09:00', table: 'Mesa 2', venue: 'vallecas', p1HighestBreak: null, p2HighestBreak: null, frames: [{p1Points: null, p2Points: null}, {p1Points: null, p2Points: null}, {p1Points: null, p2Points: null}], p1FramesWon: 0, p2FramesWon: 0, winnerId: null, status: 'pending', isCompleted: false }
    ],
    final: {
      id: 'FINAL',
      matchNum: 1,
      label: 'GRAN FINAL SNOOKER BLACKPOOL',
      roundName: 'Gran Final',
      p1SourceMatch: 'SF_1',
      p2SourceMatch: 'SF_2',
      player1Id: null,
      player2Id: null,
      day: 'Domingo',
      time: '13:00',
      table: 'Mesa Principal',
      venue: 'vallecas',
      p1HighestBreak: null,
      p2HighestBreak: null,
      frames: [{p1Points: null, p2Points: null}, {p1Points: null, p2Points: null}, {p1Points: null, p2Points: null}],
      p1FramesWon: 0,
      p2FramesWon: 0,
      winnerId: null,
      status: 'pending',
      isCompleted: false
    }
  };

  return {
    version: 2,
    title: 'Torneo Snooker Blackpool Madrid',
    lastUpdated: new Date().toISOString(),
    players,
    groups,
    playoffs
  };
}

/**
 * Carga el estado del torneo desde Supabase con fallback a LocalStorage
 */
async function loadTournamentDataAsync() {
  try {
    const res = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/${SUPABASE_CONFIG.tableName}?id=eq.${SUPABASE_CONFIG.recordId}&select=*`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_CONFIG.anonKey,
        'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`
      }
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.length > 0 && data[0].state) {
        const remoteState = data[0].state;
        saveTournamentDataLocal(remoteState);
        return remoteState;
      }
    }
  } catch (e) {
    console.warn('No se pudo conectar con Supabase en este momento, usando datos locales:', e);
  }

  // Fallback a LocalStorage
  return loadTournamentDataLocal();
}

/**
 * Guarda el estado en Supabase y en LocalStorage
 */
async function saveTournamentDataAsync(state) {
  state.lastUpdated = new Date().toISOString();
  saveTournamentDataLocal(state);

  try {
    const payload = {
      id: SUPABASE_CONFIG.recordId,
      title: state.title || 'Torneo Snooker Blackpool Madrid',
      state: state,
      version: state.version || 2,
      last_updated: state.lastUpdated
    };

    const res = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/${SUPABASE_CONFIG.tableName}`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_CONFIG.anonKey,
        'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      console.warn('Error al sincronizar con Supabase HTTP:', res.status);
    }
  } catch (e) {
    console.warn('Error de red al guardar en Supabase:', e);
  }
}

/**
 * Carga desde LocalStorage
 */
function loadTournamentDataLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.groups && parsed.players) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error al cargar datos desde LocalStorage:', e);
  }
  const defaultState = createDefaultTournamentState();
  saveTournamentDataLocal(defaultState);
  return defaultState;
}

/**
 * Guarda en LocalStorage
 */
function saveTournamentDataLocal(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Error al guardar datos en LocalStorage:', e);
  }
}

/**
 * Recalcula estadísticas y posiciones de un grupo
 */
function calculateGroupStandings(group, players) {
  const stats = {};

  group.playerIds.forEach(pId => {
    stats[pId] = {
      playerId: pId,
      player: players[pId] || { name: `Jugador ${pId}` },
      matchesPlayed: 0,
      matchesWon: 0,
      matchesLost: 0,
      framesWon: 0,
      framesLost: 0,
      totalPoints: 0,
      pointsAgainst: 0,
      highestBreak: 0,
      headToHead: {}
    };
  });

  group.matches.forEach(match => {
    const p1 = match.player1Id;
    const p2 = match.player2Id;

    let matchP1Points = 0;
    let matchP2Points = 0;
    let matchP1Frames = 0;
    let matchP2Frames = 0;

    // Actualizar highest breaks del partido
    if (match.p1HighestBreak && stats[p1]) {
      stats[p1].highestBreak = Math.max(stats[p1].highestBreak, Number(match.p1HighestBreak));
    }
    if (match.p2HighestBreak && stats[p2]) {
      stats[p2].highestBreak = Math.max(stats[p2].highestBreak, Number(match.p2HighestBreak));
    }

    match.frames.forEach(f => {
      const p1Pts = (f.p1Points !== null && f.p1Points !== '' && !isNaN(Number(f.p1Points))) ? Number(f.p1Points) : null;
      const p2Pts = (f.p2Points !== null && f.p2Points !== '' && !isNaN(Number(f.p2Points))) ? Number(f.p2Points) : null;

      if (p1Pts !== null && p2Pts !== null) {
        matchP1Points += p1Pts;
        matchP2Points += p2Pts;

        if (p1Pts > p2Pts) {
          matchP1Frames++;
        } else if (p2Pts > p1Pts) {
          matchP2Frames++;
        }
      }
    });

    if (stats[p1] && stats[p2]) {
      stats[p1].totalPoints += matchP1Points;
      stats[p1].pointsAgainst += matchP2Points;
      stats[p2].totalPoints += matchP2Points;
      stats[p2].pointsAgainst += matchP1Points;

      stats[p1].framesWon += matchP1Frames;
      stats[p1].framesLost += matchP2Frames;
      stats[p2].framesWon += matchP2Frames;
      stats[p2].framesLost += matchP1Frames;

      if (match.isCompleted || matchP1Frames >= 2 || matchP2Frames >= 2) {
        stats[p1].matchesPlayed++;
        stats[p2].matchesPlayed++;

        if (matchP1Frames > matchP2Frames) {
          stats[p1].matchesWon++;
          stats[p2].matchesLost++;
          stats[p1].headToHead[p2] = 1;
          stats[p2].headToHead[p1] = -1;
        } else if (matchP2Frames > matchP1Frames) {
          stats[p2].matchesWon++;
          stats[p1].matchesLost++;
          stats[p2].headToHead[p1] = 1;
          stats[p1].headToHead[p2] = -1;
        }
      }
    }
  });

  const standings = Object.values(stats);

  standings.sort((a, b) => {
    // 1º Partidos Ganados
    if (b.matchesWon !== a.matchesWon) {
      return b.matchesWon - a.matchesWon;
    }
    // 2º Frames Ganados
    if (b.framesWon !== a.framesWon) {
      return b.framesWon - a.framesWon;
    }
    // 3º Puntos Totales Acumulados (Criterio Principal de desempate en especificación)
    if (b.totalPoints !== a.totalPoints) {
      return b.totalPoints - a.totalPoints;
    }
    // 4º Diferencia de Frames
    const diffA = a.framesWon - a.framesLost;
    const diffB = b.framesWon - b.framesLost;
    if (diffB !== diffA) {
      return diffB - diffA;
    }
    // 5º Enfrentamiento directo
    if (a.headToHead[b.playerId]) {
      return b.headToHead[a.playerId] || (a.headToHead[b.playerId] === 1 ? -1 : 1);
    }
    return 0;
  });

  standings.forEach((item, index) => {
    item.position = index + 1;
    item.isQualified = (index < 2); // 1º y 2º clasifican a Octavos
  });

  return standings;
}

/**
 * Obtiene el estado de un grupo
 */
function getGroupStatus(group) {
  let completedCount = 0;
  let inProgressCount = 0;

  group.matches.forEach(m => {
    if (m.isCompleted || m.p1FramesWon >= 2 || m.p2FramesWon >= 2) {
      completedCount++;
    } else if (m.p1FramesWon > 0 || m.p2FramesWon > 0 || m.frames.some(f => f.p1Points !== null || f.p2Points !== null)) {
      inProgressCount++;
    }
  });

  if (completedCount === group.matches.length) {
    return { isCompleted: true, text: 'Completado', badgeClass: 'badge-completed', icon: '✅' };
  } else if (completedCount > 0 || inProgressCount > 0) {
    return { isCompleted: false, text: `En juego (${completedCount}/${group.matches.length})`, badgeClass: 'badge-progress', icon: '🔴' };
  } else {
    return { isCompleted: false, text: 'Pendiente', badgeClass: 'badge-pending', icon: '⚪' };
  }
}

/**
 * Actualiza los clasificados a los Octavos de final y fases siguientes
 */
function updatePlayoffQualifiers(state) {
  if (!state.playoffs) return;

  const groupStandings = {};
  for (let g = 1; g <= 8; g++) {
    groupStandings[g] = calculateGroupStandings(state.groups[g], state.players);
  }

  // Octavos de final (16 clasificados de los 8 grupos)
  if (state.playoffs.octavos) {
    state.playoffs.octavos.forEach(match => {
      const p1Standings = groupStandings[match.p1Source.group];
      const p2Standings = groupStandings[match.p2Source.group];

      if (p1Standings && p1Standings[match.p1Source.pos - 1]) {
        match.player1Id = p1Standings[match.p1Source.pos - 1].playerId;
      }
      if (p2Standings && p2Standings[match.p2Source.pos - 1]) {
        match.player2Id = p2Standings[match.p2Source.pos - 1].playerId;
      }
    });
  }

  // Cuartos de final
  if (state.playoffs.cuartos) {
    state.playoffs.cuartos.forEach(qf => {
      const src1 = state.playoffs.octavos.find(m => m.id === qf.p1SourceMatch);
      const src2 = state.playoffs.octavos.find(m => m.id === qf.p2SourceMatch);
      qf.player1Id = (src1 && src1.winnerId) ? src1.winnerId : null;
      qf.player2Id = (src2 && src2.winnerId) ? src2.winnerId : null;
    });
  }

  // Semifinales
  if (state.playoffs.semifinales) {
    state.playoffs.semifinales.forEach(sf => {
      const src1 = state.playoffs.cuartos.find(m => m.id === sf.p1SourceMatch);
      const src2 = state.playoffs.cuartos.find(m => m.id === sf.p2SourceMatch);
      sf.player1Id = (src1 && src1.winnerId) ? src1.winnerId : null;
      sf.player2Id = (src2 && src2.winnerId) ? src2.winnerId : null;
    });
  }

  // Gran Final
  if (state.playoffs.final) {
    const sf1 = state.playoffs.semifinales.find(m => m.id === state.playoffs.final.p1SourceMatch);
    const sf2 = state.playoffs.semifinales.find(m => m.id === state.playoffs.final.p2SourceMatch);
    state.playoffs.final.player1Id = (sf1 && sf1.winnerId) ? sf1.winnerId : null;
    state.playoffs.final.player2Id = (sf2 && sf2.winnerId) ? sf2.winnerId : null;
  }
}

/**
 * Calcula los breaks máximos globales del torneo para el ranking de Highest Break
 */
function getTournamentHighestBreaks(state) {
  const breaks = [];

  for (let i = 1; i <= 32; i++) {
    const p = state.players[i] || { name: `Jugador ${i}` };
    let maxBreak = Number(p.highestBreak || 0);

    // Revisar partidos de grupos
    for (let g = 1; g <= 8; g++) {
      state.groups[g].matches.forEach(m => {
        if (m.player1Id === i && m.p1HighestBreak) maxBreak = Math.max(maxBreak, Number(m.p1HighestBreak));
        if (m.player2Id === i && m.p2HighestBreak) maxBreak = Math.max(maxBreak, Number(m.p2HighestBreak));
      });
    }

    if (maxBreak > 0) {
      breaks.push({
        playerId: i,
        playerName: p.name,
        highestBreak: maxBreak
      });
    }
  }

  breaks.sort((a, b) => b.highestBreak - a.highestBreak);
  return breaks;
}
