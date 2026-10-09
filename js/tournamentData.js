/**
 * TORNEO SNOOKER BLACKPOOL MADRID - DATA & ENGINE V3
 * 32 Jugadores | 8 Grupos de 4 | 2 Sedes (Vallecas & Alcobendas)
 * Conexión Supabase en Tiempo Real + Motor de Horarios y Breaks
 */

const SUPABASE_CONFIG = {
  url: typeof ENV !== 'undefined' ? ENV.SUPABASE_URL : '',
  anonKey: typeof ENV !== 'undefined' ? ENV.SUPABASE_ANON_KEY : '',
  tableName: 'tournament_state',
  recordId: 'current'
};

const STORAGE_KEY = 'SNOOKER_TOURNAMENT_BLACKPOOL_MADRID_V3';

// Contraseñas de administración aceptadas
const ADMIN_PASSWORDS = typeof ENV !== 'undefined' ? ENV.ADMIN_PASSWORDS : [];

// Sede Vallecas (Black Ball Madrid): Grupos 1, 4, 5 y 8
// Sede Alcobendas (Club Snooker Valdelasfuentes): Grupos 2, 3, 6 y 7
const VENUES = {
  VALLECAS: {
    id: 'vallecas',
    name: 'Sede Vallecas (Black Ball Madrid)',
    shortName: 'Vallecas',
    groupIndices: [1, 4, 5, 8],
    tables: ['Mesa 1', 'Mesa 2', 'Mesa 3']
  },
  ALCOBENDAS: {
    id: 'alcobendas',
    name: 'Sede Alcobendas (Club Snooker Valdelasfuentes)',
    shortName: 'Alcobendas',
    groupIndices: [2, 3, 6, 7],
    tables: ['Mesa 1', 'Mesa 2', 'Mesa 3']
  }
};

/**
 * Horarios oficiales calculados para asegurar 1-2 partidos de descanso entre partidos de un jugador.
 * "slot" = posición (1º, 2º, 3º o 4º grupo) que ese grupo ocupa dentro de su sede,
 * independiente del número absoluto de grupo que le haya tocado.
 */
const DEFAULT_SCHEDULE_VALLECAS = [
  // Viernes
  { matchIdx: 0, slot: 1, matchNum: 1, day: 'Viernes', time: '12:00', table: 'Mesa 1' },
  { matchIdx: 1, slot: 1, matchNum: 2, day: 'Viernes', time: '12:00', table: 'Mesa 2' },
  { matchIdx: 2, slot: 2, matchNum: 1, day: 'Viernes', time: '12:00', table: 'Mesa 3' },
  
  { matchIdx: 3, slot: 2, matchNum: 2, day: 'Viernes', time: '14:00', table: 'Mesa 1' },
  { matchIdx: 4, slot: 3, matchNum: 1, day: 'Viernes', time: '14:00', table: 'Mesa 2' },
  { matchIdx: 5, slot: 3, matchNum: 2, day: 'Viernes', time: '14:00', table: 'Mesa 3' },
  
  { matchIdx: 6, slot: 4, matchNum: 1, day: 'Viernes', time: '16:00', table: 'Mesa 1' },
  { matchIdx: 7, slot: 4, matchNum: 2, day: 'Viernes', time: '16:00', table: 'Mesa 2' },
  { matchIdx: 8, slot: 1, matchNum: 3, day: 'Viernes', time: '16:00', table: 'Mesa 3' },
  
  { matchIdx: 9, slot: 1, matchNum: 4, day: 'Viernes', time: '18:00', table: 'Mesa 1' },
  { matchIdx: 10, slot: 2, matchNum: 3, day: 'Viernes', time: '18:00', table: 'Mesa 2' },
  { matchIdx: 11, slot: 2, matchNum: 4, day: 'Viernes', time: '18:00', table: 'Mesa 3' },
  
  { matchIdx: 12, slot: 3, matchNum: 3, day: 'Viernes', time: '20:00', table: 'Mesa 1' },
  { matchIdx: 13, slot: 3, matchNum: 4, day: 'Viernes', time: '20:00', table: 'Mesa 2' },
  { matchIdx: 14, slot: 4, matchNum: 3, day: 'Viernes', time: '20:00', table: 'Mesa 3' },
  
  // Sábado
  { matchIdx: 15, slot: 4, matchNum: 4, day: 'Sábado', time: '09:30', table: 'Mesa 1' },
  { matchIdx: 16, slot: 1, matchNum: 5, day: 'Sábado', time: '09:30', table: 'Mesa 2' },
  { matchIdx: 17, slot: 1, matchNum: 6, day: 'Sábado', time: '09:30', table: 'Mesa 3' },
  
  { matchIdx: 18, slot: 2, matchNum: 5, day: 'Sábado', time: '11:30', table: 'Mesa 1' },
  { matchIdx: 19, slot: 2, matchNum: 6, day: 'Sábado', time: '11:30', table: 'Mesa 2' },
  { matchIdx: 20, slot: 3, matchNum: 5, day: 'Sábado', time: '11:30', table: 'Mesa 3' },
  
  { matchIdx: 21, slot: 3, matchNum: 6, day: 'Sábado', time: '13:30', table: 'Mesa 1' },
  { matchIdx: 22, slot: 4, matchNum: 5, day: 'Sábado', time: '13:30', table: 'Mesa 2' },
  { matchIdx: 23, slot: 4, matchNum: 6, day: 'Sábado', time: '13:30', table: 'Mesa 3' }
];

const DEFAULT_SCHEDULE_ALCOBENDAS = [
  // Viernes
  { matchIdx: 0, slot: 1, matchNum: 1, day: 'Viernes', time: '12:00', table: 'Mesa 1' },
  { matchIdx: 1, slot: 1, matchNum: 2, day: 'Viernes', time: '12:00', table: 'Mesa 2' },
  { matchIdx: 2, slot: 2, matchNum: 1, day: 'Viernes', time: '12:00', table: 'Mesa 3' },
  
  { matchIdx: 3, slot: 2, matchNum: 2, day: 'Viernes', time: '14:00', table: 'Mesa 1' },
  { matchIdx: 4, slot: 3, matchNum: 1, day: 'Viernes', time: '14:00', table: 'Mesa 2' },
  { matchIdx: 5, slot: 3, matchNum: 2, day: 'Viernes', time: '14:00', table: 'Mesa 3' },
  
  { matchIdx: 6, slot: 4, matchNum: 1, day: 'Viernes', time: '16:00', table: 'Mesa 1' },
  { matchIdx: 7, slot: 4, matchNum: 2, day: 'Viernes', time: '16:00', table: 'Mesa 2' },
  { matchIdx: 8, slot: 1, matchNum: 3, day: 'Viernes', time: '16:00', table: 'Mesa 3' },
  
  { matchIdx: 9, slot: 1, matchNum: 4, day: 'Viernes', time: '18:00', table: 'Mesa 1' },
  { matchIdx: 10, slot: 2, matchNum: 3, day: 'Viernes', time: '18:00', table: 'Mesa 2' },
  { matchIdx: 11, slot: 2, matchNum: 4, day: 'Viernes', time: '18:00', table: 'Mesa 3' },
  
  { matchIdx: 12, slot: 3, matchNum: 3, day: 'Viernes', time: '20:00', table: 'Mesa 1' },
  { matchIdx: 13, slot: 3, matchNum: 4, day: 'Viernes', time: '20:00', table: 'Mesa 2' },
  { matchIdx: 14, slot: 4, matchNum: 3, day: 'Viernes', time: '20:00', table: 'Mesa 3' },
  
  // Sábado
  { matchIdx: 15, slot: 4, matchNum: 4, day: 'Sábado', time: '09:30', table: 'Mesa 1' },
  { matchIdx: 16, slot: 1, matchNum: 5, day: 'Sábado', time: '09:30', table: 'Mesa 2' },
  { matchIdx: 17, slot: 1, matchNum: 6, day: 'Sábado', time: '09:30', table: 'Mesa 3' },
  
  { matchIdx: 18, slot: 2, matchNum: 5, day: 'Sábado', time: '11:30', table: 'Mesa 1' },
  { matchIdx: 19, slot: 2, matchNum: 6, day: 'Sábado', time: '11:30', table: 'Mesa 2' },
  { matchIdx: 20, slot: 3, matchNum: 5, day: 'Sábado', time: '11:30', table: 'Mesa 3' },
  
  { matchIdx: 21, slot: 3, matchNum: 6, day: 'Sábado', time: '13:30', table: 'Mesa 1' },
  { matchIdx: 22, slot: 4, matchNum: 5, day: 'Sábado', time: '13:30', table: 'Mesa 2' },
  { matchIdx: 23, slot: 4, matchNum: 6, day: 'Sábado', time: '13:30', table: 'Mesa 3' }
];

/**
 * Crea el estado inicial por defecto del torneo
 */
function createDefaultTournamentState() {
  const players = {};
  const groups = {};

  for (let i = 1; i <= 32; i++) {
    players[i] = {
      id: i,
      name: `Jugador ${i}`,
      seed: i,
      highestBreak: 0
    };
  }

  for (let g = 1; g <= 8; g++) {
    const isVallecas = VENUES.VALLECAS.groupIndices.includes(g);
    const venue = isVallecas ? VENUES.VALLECAS.id : VENUES.ALCOBENDAS.id;
    const venueName = isVallecas ? VENUES.VALLECAS.shortName : VENUES.ALCOBENDAS.shortName;
    const slot = isVallecas
      ? VENUES.VALLECAS.groupIndices.indexOf(g) + 1
      : VENUES.ALCOBENDAS.groupIndices.indexOf(g) + 1;

    const startPlayerId = (g - 1) * 4 + 1;
    const playerIds = [startPlayerId, startPlayerId + 1, startPlayerId + 2, startPlayerId + 3];

    // Combinaciones Round-Robin
    const pairings = [
      [playerIds[0], playerIds[1]],
      [playerIds[2], playerIds[3]],
      [playerIds[0], playerIds[2]],
      [playerIds[1], playerIds[3]],
      [playerIds[0], playerIds[3]],
      [playerIds[1], playerIds[2]]
    ];

    const schedList = isVallecas ? DEFAULT_SCHEDULE_VALLECAS : DEFAULT_SCHEDULE_ALCOBENDAS;

    const matches = pairings.map((pair, index) => {
      const matchNum = index + 1;
      const sched = schedList.find(s => s.slot === slot && s.matchNum === matchNum) || {
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

  // FASE FINAL: Octavos -> Cuartos -> Semis -> Final
  const playoffs = {
    drawMode: 'manual', // Los cruces se asignan a mano por el admin (sorteo)
    octavos: [
      { id: 'OCT_1', matchNum: 1, label: 'Octavos 1', roundName: 'Octavos de Final', p1Source: { group: 1, pos: 1 }, p2Source: { group: 2, pos: 2 }, player1Id: null, player2Id: null, day: 'Sábado', time: '15:00', table: 'Mesa 1', venue: 'vallecas', venueName: 'Vallecas', p1HighestBreak: null, p2HighestBreak: null, frames: [{p1Points: null, p2Points: null}, {p1Points: null, p2Points: null}, {p1Points: null, p2Points: null}], p1FramesWon: 0, p2FramesWon: 0, winnerId: null, status: 'pending', isCompleted: false },
      { id: 'OCT_2', matchNum: 2, label: 'Octavos 2', roundName: 'Octavos de Final', p1Source: { group: 2, pos: 1 }, p2Source: { group: 1, pos: 2 }, player1Id: null, player2Id: null, day: 'Sábado', time: '15:00', table: 'Mesa 2', venue: 'vallecas', venueName: 'Vallecas', p1HighestBreak: null, p2HighestBreak: null, frames: [{p1Points: null, p2Points: null}, {p1Points: null, p2Points: null}, {p1Points: null, p2Points: null}], p1FramesWon: 0, p2FramesWon: 0, winnerId: null, status: 'pending', isCompleted: false },
      { id: 'OCT_3', matchNum: 3, label: 'Octavos 3', roundName: 'Octavos de Final', p1Source: { group: 3, pos: 1 }, p2Source: { group: 4, pos: 2 }, player1Id: null, player2Id: null, day: 'Sábado', time: '15:00', table: 'Mesa 3', venue: 'vallecas', venueName: 'Vallecas', p1HighestBreak: null, p2HighestBreak: null, frames: [{p1Points: null, p2Points: null}, {p1Points: null, p2Points: null}, {p1Points: null, p2Points: null}], p1FramesWon: 0, p2FramesWon: 0, winnerId: null, status: 'pending', isCompleted: false },
      { id: 'OCT_4', matchNum: 4, label: 'Octavos 4', roundName: 'Octavos de Final', p1Source: { group: 4, pos: 1 }, p2Source: { group: 3, pos: 2 }, player1Id: null, player2Id: null, day: 'Sábado', time: '17:00', table: 'Mesa 1', venue: 'vallecas', venueName: 'Vallecas', p1HighestBreak: null, p2HighestBreak: null, frames: [{p1Points: null, p2Points: null}, {p1Points: null, p2Points: null}, {p1Points: null, p2Points: null}], p1FramesWon: 0, p2FramesWon: 0, winnerId: null, status: 'pending', isCompleted: false },
      { id: 'OCT_5', matchNum: 5, label: 'Octavos 5', roundName: 'Octavos de Final', p1Source: { group: 5, pos: 1 }, p2Source: { group: 6, pos: 2 }, player1Id: null, player2Id: null, day: 'Sábado', time: '15:00', table: 'Mesa 1', venue: 'alcobendas', venueName: 'Alcobendas', p1HighestBreak: null, p2HighestBreak: null, frames: [{p1Points: null, p2Points: null}, {p1Points: null, p2Points: null}, {p1Points: null, p2Points: null}], p1FramesWon: 0, p2FramesWon: 0, winnerId: null, status: 'pending', isCompleted: false },
      { id: 'OCT_6', matchNum: 6, label: 'Octavos 6', roundName: 'Octavos de Final', p1Source: { group: 6, pos: 1 }, p2Source: { group: 5, pos: 2 }, player1Id: null, player2Id: null, day: 'Sábado', time: '15:00', table: 'Mesa 2', venue: 'alcobendas', venueName: 'Alcobendas', p1HighestBreak: null, p2HighestBreak: null, frames: [{p1Points: null, p2Points: null}, {p1Points: null, p2Points: null}, {p1Points: null, p2Points: null}], p1FramesWon: 0, p2FramesWon: 0, winnerId: null, status: 'pending', isCompleted: false },
      { id: 'OCT_7', matchNum: 7, label: 'Octavos 7', roundName: 'Octavos de Final', p1Source: { group: 7, pos: 1 }, p2Source: { group: 8, pos: 2 }, player1Id: null, player2Id: null, day: 'Sábado', time: '15:00', table: 'Mesa 3', venue: 'alcobendas', venueName: 'Alcobendas', p1HighestBreak: null, p2HighestBreak: null, frames: [{p1Points: null, p2Points: null}, {p1Points: null, p2Points: null}, {p1Points: null, p2Points: null}], p1FramesWon: 0, p2FramesWon: 0, winnerId: null, status: 'pending', isCompleted: false },
      { id: 'OCT_8', matchNum: 8, label: 'Octavos 8', roundName: 'Octavos de Final', p1Source: { group: 8, pos: 1 }, p2Source: { group: 7, pos: 2 }, player1Id: null, player2Id: null, day: 'Sábado', time: '17:00', table: 'Mesa 1', venue: 'alcobendas', venueName: 'Alcobendas', p1HighestBreak: null, p2HighestBreak: null, frames: [{p1Points: null, p2Points: null}, {p1Points: null, p2Points: null}, {p1Points: null, p2Points: null}], p1FramesWon: 0, p2FramesWon: 0, winnerId: null, status: 'pending', isCompleted: false }
    ],
    cuartos: [
      { id: 'QF_1', matchNum: 1, label: 'Cuartos 1', roundName: 'Cuartos de Final', p1SourceMatch: 'OCT_1', p2SourceMatch: 'OCT_3', player1Id: null, player2Id: null, day: 'Sábado', time: '19:00', table: 'Mesa 1', venue: 'vallecas', venueName: 'Vallecas', p1HighestBreak: null, p2HighestBreak: null, frames: [{p1Points: null, p2Points: null}, {p1Points: null, p2Points: null}, {p1Points: null, p2Points: null}], p1FramesWon: 0, p2FramesWon: 0, winnerId: null, status: 'pending', isCompleted: false },
      { id: 'QF_2', matchNum: 2, label: 'Cuartos 2', roundName: 'Cuartos de Final', p1SourceMatch: 'OCT_2', p2SourceMatch: 'OCT_4', player1Id: null, player2Id: null, day: 'Sábado', time: '19:00', table: 'Mesa 2', venue: 'vallecas', venueName: 'Vallecas', p1HighestBreak: null, p2HighestBreak: null, frames: [{p1Points: null, p2Points: null}, {p1Points: null, p2Points: null}, {p1Points: null, p2Points: null}], p1FramesWon: 0, p2FramesWon: 0, winnerId: null, status: 'pending', isCompleted: false },
      { id: 'QF_3', matchNum: 3, label: 'Cuartos 3', roundName: 'Cuartos de Final', p1SourceMatch: 'OCT_5', p2SourceMatch: 'OCT_7', player1Id: null, player2Id: null, day: 'Sábado', time: '19:00', table: 'Mesa 1', venue: 'alcobendas', venueName: 'Alcobendas', p1HighestBreak: null, p2HighestBreak: null, frames: [{p1Points: null, p2Points: null}, {p1Points: null, p2Points: null}, {p1Points: null, p2Points: null}], p1FramesWon: 0, p2FramesWon: 0, winnerId: null, status: 'pending', isCompleted: false },
      { id: 'QF_4', matchNum: 4, label: 'Cuartos 4', roundName: 'Cuartos de Final', p1SourceMatch: 'OCT_6', p2SourceMatch: 'OCT_8', player1Id: null, player2Id: null, day: 'Sábado', time: '19:00', table: 'Mesa 2', venue: 'alcobendas', venueName: 'Alcobendas', p1HighestBreak: null, p2HighestBreak: null, frames: [{p1Points: null, p2Points: null}, {p1Points: null, p2Points: null}, {p1Points: null, p2Points: null}], p1FramesWon: 0, p2FramesWon: 0, winnerId: null, status: 'pending', isCompleted: false }
    ],
    semifinales: [
      { id: 'SF_1', matchNum: 1, label: 'Semifinal 1', roundName: 'Semifinales', p1SourceMatch: 'QF_1', p2SourceMatch: 'QF_2', player1Id: null, player2Id: null, day: 'Domingo', time: '09:00', table: 'Mesa 1', venue: 'vallecas', venueName: 'Vallecas', p1HighestBreak: null, p2HighestBreak: null, frames: [{p1Points: null, p2Points: null}, {p1Points: null, p2Points: null}, {p1Points: null, p2Points: null}], p1FramesWon: 0, p2FramesWon: 0, winnerId: null, status: 'pending', isCompleted: false },
      { id: 'SF_2', matchNum: 2, label: 'Semifinal 2', roundName: 'Semifinales', p1SourceMatch: 'QF_3', p2SourceMatch: 'QF_4', player1Id: null, player2Id: null, day: 'Domingo', time: '09:00', table: 'Mesa 2', venue: 'vallecas', venueName: 'Vallecas', p1HighestBreak: null, p2HighestBreak: null, frames: [{p1Points: null, p2Points: null}, {p1Points: null, p2Points: null}, {p1Points: null, p2Points: null}], p1FramesWon: 0, p2FramesWon: 0, winnerId: null, status: 'pending', isCompleted: false }
    ],
    final: {
      id: 'FINAL',
      matchNum: 1,
      label: 'FINAL CAMPEONATO DE ESPAÑA',
      roundName: 'Gran Final',
      p1SourceMatch: 'SF_1',
      p2SourceMatch: 'SF_2',
      player1Id: null,
      player2Id: null,
      day: 'Domingo',
      time: '13:00',
      table: 'Mesa Principal',
      venue: 'vallecas',
      venueName: 'Vallecas',
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
    version: 3,
    title: 'Torneo Snooker Blackpool Madrid',
    lastUpdated: new Date().toISOString(),
    players,
    groups,
    playoffs
  };
}

/**
 * Corrige la sede (venue/venueName) de cada grupo y de sus partidos según el
 * mapeo vigente de sedes, sin tocar resultados, frames, breaks u horarios ya
 * introducidos. Necesario porque un torneo ya guardado (local o en Supabase)
 * puede tener grupos asignados con el mapeo de sedes anterior.
 */
function migrateVenueAssignments(state) {
  if (!state || !state.groups) return state;

  for (let g = 1; g <= 8; g++) {
    const group = state.groups[g];
    if (!group) continue;

    const isVallecas = VENUES.VALLECAS.groupIndices.includes(g);
    const correctVenue = isVallecas ? VENUES.VALLECAS.id : VENUES.ALCOBENDAS.id;
    const correctVenueName = isVallecas ? VENUES.VALLECAS.shortName : VENUES.ALCOBENDAS.shortName;

    if (group.venue !== correctVenue || group.venueName !== correctVenueName) {
      group.venue = correctVenue;
      group.venueName = correctVenueName;
      if (Array.isArray(group.matches)) {
        group.matches.forEach(m => {
          m.venue = correctVenue;
          m.venueName = correctVenueName;
        });
      }
    }
  }

  // Corrige el rótulo de la Gran Final si el torneo ya estaba guardado con el texto antiguo
  if (state.playoffs && state.playoffs.final && state.playoffs.final.label !== 'FINAL CAMPEONATO DE ESPAÑA') {
    state.playoffs.final.label = 'FINAL CAMPEONATO DE ESPAÑA';
  }

  return state;
}

/**
 * Las eliminatorias pasan a definirse por sorteo (asignación manual del admin).
 * Una sola vez, limpia los cruces que se habían autocompletado desde la clasificación
 * de grupos (y cualquier resultado asociado a ellos). Conserva día, hora, mesa y enlace.
 */
function migratePlayoffsToManualDraw(state) {
  if (!state || !state.playoffs || state.playoffs.drawMode === 'manual') return state;

  const po = state.playoffs;
  const allMatches = [
    ...(po.octavos || []),
    ...(po.cuartos || []),
    ...(po.semifinales || []),
    ...(po.final ? [po.final] : [])
  ];

  allMatches.forEach(m => {
    m.player1Id = null;
    m.player2Id = null;
    m.p1FramesWon = 0;
    m.p2FramesWon = 0;
    m.p1HighestBreak = null;
    m.p2HighestBreak = null;
    m.winnerId = null;
    m.isCompleted = false;
    m.status = 'pending';
  });

  po.drawMode = 'manual';
  return state;
}

/**
 * Punto único de migración de un estado cargado (local, Supabase o backup importado)
 */
function applyStateMigrations(state) {
  migrateVenueAssignments(state);
  migratePlayoffsToManualDraw(state);
  return state;
}

/**
 * Carga el estado del torneo desde Supabase con diagnóstico detallado
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

    if (res.status === 404 || res.status === 400) {
      console.warn('⚠️ Supabase: La tabla tournament_state no existe todavía.');
      return { success: false, isTableMissing: true, state: loadTournamentDataLocal() };
    }

    if (res.ok) {
      const data = await res.json();
      if (data && data.length > 0 && data[0].state) {
        // ✅ Datos remotos encontrados: usar siempre los remotos (fuente de verdad)
        const remoteState = applyStateMigrations(data[0].state);
        saveTournamentDataLocal(remoteState);
        return { success: true, isTableMissing: false, state: remoteState };
      } else {
        // La tabla existe pero está VACÍA (primera vez).
        // En este caso subimos el estado local (que puede tener nombres ya editados).
        const localState = loadTournamentDataLocal();
        console.log('ℹ️ Supabase vacío – subiendo estado local actual...');
        await saveTournamentDataAsync(localState);
        return { success: true, isTableMissing: false, state: localState };
      }
    }

    // Respuesta no-ok no es 404: error genérico
    console.warn('Respuesta inesperada de Supabase:', res.status);
  } catch (e) {
    console.warn('Error al conectar con Supabase:', e);
  }

  // Fallback: usar datos locales
  return { success: false, isTableMissing: false, state: loadTournamentDataLocal() };
}

/**
 * Guarda el estado en Supabase y en LocalStorage
 */
async function saveTournamentDataAsync(state) {
  state.lastUpdated = new Date().toISOString();
  // Siempre guardamos localmente primero (copia de seguridad instantánea)
  saveTournamentDataLocal(state);

  const payload = {
    id: SUPABASE_CONFIG.recordId,
    title: state.title || 'Torneo Snooker Blackpool Madrid',
    state: state,
    version: state.version || 3,
    last_updated: state.lastUpdated
  };

  try {
    // ✅ UPSERT: inserta si no existe, actualiza si ya existe (operación atómica y segura)
    const upsertRes = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/${SUPABASE_CONFIG.tableName}`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_CONFIG.anonKey,
        'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates,return=minimal'
      },
      body: JSON.stringify(payload)
    });

    if (upsertRes.status === 404 || upsertRes.status === 400) {
      // La tabla no existe aún
      const errText = await upsertRes.text().catch(() => '');
      console.warn('Supabase table missing:', upsertRes.status, errText);
      return { success: false, isTableMissing: true, error: 'Tabla no encontrada en Supabase' };
    }

    if (upsertRes.ok || upsertRes.status === 201 || upsertRes.status === 204) {
      return { success: true, isTableMissing: false };
    }

    const errText = await upsertRes.text().catch(() => '');
    console.error('Error al guardar en Supabase:', upsertRes.status, errText);
    return { success: false, isTableMissing: false, error: errText };
  } catch (e) {
    console.error('Error de red al guardar en Supabase:', e);
    return { success: false, isTableMissing: false, error: e.message };
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
        return applyStateMigrations(parsed);
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
    // 3º Frames Perdidos (menos frames perdidos, mejor posición)
    if (a.framesLost !== b.framesLost) {
      return a.framesLost - b.framesLost;
    }
    // 4º Break Máximo conseguido
    if (b.highestBreak !== a.highestBreak) {
      return b.highestBreak - a.highestBreak;
    }
    // 5º Enfrentamiento directo (último desempate posible)
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
 * Obtiene el estado general de un grupo
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
 * Jugadores que han pasado de grupos (1º y 2º de cada grupo).
 * Son los únicos que el administrador puede asignar manualmente al cuadro de eliminatorias.
 */
function getQualifiedPlayers(state) {
  const qualified = [];
  for (let g = 1; g <= 8; g++) {
    const group = state.groups[g];
    if (!group) continue;
    calculateGroupStandings(group, state.players).forEach(row => {
      if (row.isQualified) {
        qualified.push({ playerId: row.playerId, groupId: g, position: row.position });
      }
    });
  }
  return qualified;
}