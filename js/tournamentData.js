/**
 * TORNEO SNOOKER BLACKPOOL MADRID - DATA & ENGINE
 * 32 Jugadores | 8 Grupos de 4 | 2 Sedes (Vallecas & Alcobendas)
 */

const STORAGE_KEY = 'SNOOKER_TOURNAMENT_BLACKPOOL_MADRID_V1';

const VENUES = {
  VALLECAS: {
    id: 'vallecas',
    name: 'Sede Vallecas (VF)',
    shortName: 'Vallecas',
    groupIndices: [1, 2, 3, 4]
  },
  ALCOBENDAS: {
    id: 'alcobendas',
    name: 'Sede Alcobendas (BBM)',
    shortName: 'Alcobendas',
    groupIndices: [5, 6, 7, 8]
  }
};

/**
 * Inicializa el estado por defecto del torneo
 */
function createDefaultTournamentState() {
  const players = {};
  const groups = {};

  // Crear 32 jugadores (1 a 32)
  for (let i = 1; i <= 32; i++) {
    players[i] = {
      id: i,
      name: `Jugador ${i}`,
      seed: i
    };
  }

  // Crear 8 Grupos de 4 jugadores
  for (let g = 1; g <= 8; g++) {
    const venue = g <= 4 ? 'vallecas' : 'alcobendas';
    const startPlayerId = (g - 1) * 4 + 1;
    const playerIds = [startPlayerId, startPlayerId + 1, startPlayerId + 2, startPlayerId + 3];

    // Generar 6 partidos del grupo (Round Robin)
    // Combinaciones: (0,1), (0,2), (0,3), (1,2), (1,3), (2,3)
    const pairings = [
      [playerIds[0], playerIds[1]],
      [playerIds[0], playerIds[2]],
      [playerIds[0], playerIds[3]],
      [playerIds[1], playerIds[2]],
      [playerIds[1], playerIds[3]],
      [playerIds[2], playerIds[3]]
    ];

    const matches = pairings.map((pair, index) => ({
      id: `G${g}_M${index + 1}`,
      groupId: g,
      matchNumber: index + 1,
      player1Id: pair[0],
      player2Id: pair[1],
      frames: [
        { frameNum: 1, p1Points: null, p2Points: null, winnerId: null },
        { frameNum: 2, p1Points: null, p2Points: null, winnerId: null },
        { frameNum: 3, p1Points: null, p2Points: null, winnerId: null }
      ],
      p1FramesWon: 0,
      p2FramesWon: 0,
      winnerId: null,
      isCompleted: false
    }));

    groups[g] = {
      id: g,
      name: `Grupo ${g}`,
      venue: venue,
      playerIds: playerIds,
      matches: matches
    };
  }

  // Estructura para Playoffs (16 clasificados -> 8avos -> Cuartos -> Semis -> Final)
  // Cruces según especificación: 1º Gr1 vs 2º Gr2, 1º Gr3 vs 2º Gr4, 1º Gr5 vs 2º Gr6, 1º Gr7 vs 2º Gr8, etc.
  const playoffs = {
    roundOf16: [
      { id: 'R16_1', matchNum: 1, label: '1º Grupo 1 vs 2º Grupo 2', p1Source: { group: 1, pos: 1 }, p2Source: { group: 2, pos: 2 }, player1Id: null, player2Id: null, frames: [{p1Points: null, p2Points: null, winnerId: null}, {p1Points: null, p2Points: null, winnerId: null}, {p1Points: null, p2Points: null, winnerId: null}], p1FramesWon: 0, p2FramesWon: 0, winnerId: null, isCompleted: false },
      { id: 'R16_2', matchNum: 2, label: '1º Grupo 2 vs 2º Grupo 1', p1Source: { group: 2, pos: 1 }, p2Source: { group: 1, pos: 2 }, player1Id: null, player2Id: null, frames: [{p1Points: null, p2Points: null, winnerId: null}, {p1Points: null, p2Points: null, winnerId: null}, {p1Points: null, p2Points: null, winnerId: null}], p1FramesWon: 0, p2FramesWon: 0, winnerId: null, isCompleted: false },
      { id: 'R16_3', matchNum: 3, label: '1º Grupo 3 vs 2º Grupo 4', p1Source: { group: 3, pos: 1 }, p2Source: { group: 4, pos: 2 }, player1Id: null, player2Id: null, frames: [{p1Points: null, p2Points: null, winnerId: null}, {p1Points: null, p2Points: null, winnerId: null}, {p1Points: null, p2Points: null, winnerId: null}], p1FramesWon: 0, p2FramesWon: 0, winnerId: null, isCompleted: false },
      { id: 'R16_4', matchNum: 4, label: '1º Grupo 4 vs 2º Grupo 3', p1Source: { group: 4, pos: 1 }, p2Source: { group: 3, pos: 2 }, player1Id: null, player2Id: null, frames: [{p1Points: null, p2Points: null, winnerId: null}, {p1Points: null, p2Points: null, winnerId: null}, {p1Points: null, p2Points: null, winnerId: null}], p1FramesWon: 0, p2FramesWon: 0, winnerId: null, isCompleted: false },
      { id: 'R16_5', matchNum: 5, label: '1º Grupo 5 vs 2º Grupo 6', p1Source: { group: 5, pos: 1 }, p2Source: { group: 6, pos: 2 }, player1Id: null, player2Id: null, frames: [{p1Points: null, p2Points: null, winnerId: null}, {p1Points: null, p2Points: null, winnerId: null}, {p1Points: null, p2Points: null, winnerId: null}], p1FramesWon: 0, p2FramesWon: 0, winnerId: null, isCompleted: false },
      { id: 'R16_6', matchNum: 6, label: '1º Grupo 6 vs 2º Grupo 5', p1Source: { group: 6, pos: 1 }, p2Source: { group: 5, pos: 2 }, player1Id: null, player2Id: null, frames: [{p1Points: null, p2Points: null, winnerId: null}, {p1Points: null, p2Points: null, winnerId: null}, {p1Points: null, p2Points: null, winnerId: null}], p1FramesWon: 0, p2FramesWon: 0, winnerId: null, isCompleted: false },
      { id: 'R16_7', matchNum: 7, label: '1º Grupo 7 vs 2º Grupo 8', p1Source: { group: 7, pos: 1 }, p2Source: { group: 8, pos: 2 }, player1Id: null, player2Id: null, frames: [{p1Points: null, p2Points: null, winnerId: null}, {p1Points: null, p2Points: null, winnerId: null}, {p1Points: null, p2Points: null, winnerId: null}], p1FramesWon: 0, p2FramesWon: 0, winnerId: null, isCompleted: false },
      { id: 'R16_8', matchNum: 8, label: '1º Grupo 8 vs 2º Grupo 7', p1Source: { group: 8, pos: 1 }, p2Source: { group: 7, pos: 2 }, player1Id: null, player2Id: null, frames: [{p1Points: null, p2Points: null, winnerId: null}, {p1Points: null, p2Points: null, winnerId: null}, {p1Points: null, p2Points: null, winnerId: null}], p1FramesWon: 0, p2FramesWon: 0, winnerId: null, isCompleted: false }
    ],
    quarterFinals: [
      { id: 'QF_1', matchNum: 1, label: 'Cuartos 1: Ganador 16A-1 vs Ganador 16A-3', p1SourceMatch: 'R16_1', p2SourceMatch: 'R16_3', player1Id: null, player2Id: null, frames: [{p1Points: null, p2Points: null, winnerId: null}, {p1Points: null, p2Points: null, winnerId: null}, {p1Points: null, p2Points: null, winnerId: null}], p1FramesWon: 0, p2FramesWon: 0, winnerId: null, isCompleted: false },
      { id: 'QF_2', matchNum: 2, label: 'Cuartos 2: Ganador 16A-2 vs Ganador 16A-4', p1SourceMatch: 'R16_2', p2SourceMatch: 'R16_4', player1Id: null, player2Id: null, frames: [{p1Points: null, p2Points: null, winnerId: null}, {p1Points: null, p2Points: null, winnerId: null}, {p1Points: null, p2Points: null, winnerId: null}], p1FramesWon: 0, p2FramesWon: 0, winnerId: null, isCompleted: false },
      { id: 'QF_3', matchNum: 3, label: 'Cuartos 3: Ganador 16A-5 vs Ganador 16A-7', p1SourceMatch: 'R16_5', p2SourceMatch: 'R16_7', player1Id: null, player2Id: null, frames: [{p1Points: null, p2Points: null, winnerId: null}, {p1Points: null, p2Points: null, winnerId: null}, {p1Points: null, p2Points: null, winnerId: null}], p1FramesWon: 0, p2FramesWon: 0, winnerId: null, isCompleted: false },
      { id: 'QF_4', matchNum: 4, label: 'Cuartos 4: Ganador 16A-6 vs Ganador 16A-8', p1SourceMatch: 'R16_6', p2SourceMatch: 'R16_8', player1Id: null, player2Id: null, frames: [{p1Points: null, p2Points: null, winnerId: null}, {p1Points: null, p2Points: null, winnerId: null}, {p1Points: null, p2Points: null, winnerId: null}], p1FramesWon: 0, p2FramesWon: 0, winnerId: null, isCompleted: false }
    ],
    semiFinals: [
      { id: 'SF_1', matchNum: 1, label: 'Semifinal 1: Ganador C1 vs Ganador C2', p1SourceMatch: 'QF_1', p2SourceMatch: 'QF_2', player1Id: null, player2Id: null, frames: [{p1Points: null, p2Points: null, winnerId: null}, {p1Points: null, p2Points: null, winnerId: null}, {p1Points: null, p2Points: null, winnerId: null}], p1FramesWon: 0, p2FramesWon: 0, winnerId: null, isCompleted: false },
      { id: 'SF_2', matchNum: 2, label: 'Semifinal 2: Ganador C3 vs Ganador C4', p1SourceMatch: 'QF_3', p2SourceMatch: 'QF_4', player1Id: null, player2Id: null, frames: [{p1Points: null, p2Points: null, winnerId: null}, {p1Points: null, p2Points: null, winnerId: null}, {p1Points: null, p2Points: null, winnerId: null}], p1FramesWon: 0, p2FramesWon: 0, winnerId: null, isCompleted: false }
    ],
    final: {
      id: 'FINAL',
      matchNum: 1,
      label: 'GRAN FINAL SNOOKER BLACKPOOL',
      p1SourceMatch: 'SF_1',
      p2SourceMatch: 'SF_2',
      player1Id: null,
      player2Id: null,
      frames: [{p1Points: null, p2Points: null, winnerId: null}, {p1Points: null, p2Points: null, winnerId: null}, {p1Points: null, p2Points: null, winnerId: null}],
      p1FramesWon: 0,
      p2FramesWon: 0,
      winnerId: null,
      isCompleted: false
    }
  };

  return {
    version: 1,
    title: 'Torneo Snooker Blackpool Madrid',
    lastUpdated: new Date().toISOString(),
    players,
    groups,
    playoffs
  };
}

/**
 * Carga el estado del torneo desde LocalStorage o inicializa uno nuevo
 */
function loadTournamentData() {
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
  saveTournamentData(defaultState);
  return defaultState;
}

/**
 * Guarda el estado del torneo en LocalStorage
 */
function saveTournamentData(state) {
  try {
    state.lastUpdated = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Error al guardar datos en LocalStorage:', e);
  }
}

/**
 * Recalcula las estadísticas y posiciones de un grupo con los criterios oficiales:
 * 1. Partidos Ganados (PG)
 * 2. Frames Ganados (FG)
 * 3. Puntos Totales Acumulados en todos los frames (Desempate primordial)
 * 4. Diferencia de Frames
 * 5. Enfrentamiento directo
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

  // Convertir a Array y ordenar según criterios
  const standings = Object.values(stats);

  standings.sort((a, b) => {
    // 1º Más Partidos Ganados
    if (b.matchesWon !== a.matchesWon) {
      return b.matchesWon - a.matchesWon;
    }
    // 2º Más Frames Ganados
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

  // Asignar posición
  standings.forEach((item, index) => {
    item.position = index + 1;
    item.isQualified = (index < 2); // 1º y 2º clasifican
  });

  return standings;
}

/**
 * Comprueba el estado general del grupo (Completado vs En Progreso)
 */
function getGroupStatus(group) {
  let completedCount = 0;
  group.matches.forEach(m => {
    if (m.isCompleted || m.p1FramesWon >= 2 || m.p2FramesWon >= 2) {
      completedCount++;
    }
  });

  if (completedCount === group.matches.length) {
    return { isCompleted: true, text: 'Completado', badgeClass: 'badge-completed', icon: '✅' };
  } else if (completedCount > 0) {
    return { isCompleted: false, text: `En progreso (${completedCount}/${group.matches.length})`, badgeClass: 'badge-progress', icon: '⏳' };
  } else {
    return { isCompleted: false, text: 'Pendiente', badgeClass: 'badge-pending', icon: '⚪' };
  }
}

/**
 * Actualiza los clasificados a los Playoffs en función de los grupos
 */
function updatePlayoffQualifiers(state) {
  if (!state.playoffs) return;

  const groupStandings = {};
  for (let g = 1; g <= 8; g++) {
    groupStandings[g] = calculateGroupStandings(state.groups[g], state.players);
  }

  // Actualizar Dieciseisavos / Octavos
  state.playoffs.roundOf16.forEach(match => {
    const p1Standings = groupStandings[match.p1Source.group];
    const p2Standings = groupStandings[match.p2Source.group];

    if (p1Standings && p1Standings[match.p1Source.pos - 1]) {
      match.player1Id = p1Standings[match.p1Source.pos - 1].playerId;
    }
    if (p2Standings && p2Standings[match.p2Source.pos - 1]) {
      match.player2Id = p2Standings[match.p2Source.pos - 1].playerId;
    }
  });

  // Actualizar Cuartos de Final
  state.playoffs.quarterFinals.forEach(qf => {
    const src1 = state.playoffs.roundOf16.find(m => m.id === qf.p1SourceMatch);
    const src2 = state.playoffs.roundOf16.find(m => m.id === qf.p2SourceMatch);
    qf.player1Id = (src1 && src1.winnerId) ? src1.winnerId : null;
    qf.player2Id = (src2 && src2.winnerId) ? src2.winnerId : null;
  });

  // Actualizar Semifinales
  state.playoffs.semiFinals.forEach(sf => {
    const src1 = state.playoffs.quarterFinals.find(m => m.id === sf.p1SourceMatch);
    const src2 = state.playoffs.quarterFinals.find(m => m.id === sf.p2SourceMatch);
    sf.player1Id = (src1 && sf.winnerId) ? sf.winnerId : ((src1 && src1.winnerId) ? src1.winnerId : null);
    sf.player2Id = (src2 && sf.winnerId) ? sf.winnerId : ((src2 && src2.winnerId) ? src2.winnerId : null);
  });

  // Actualizar Final
  if (state.playoffs.final) {
    const sf1 = state.playoffs.semiFinals.find(m => m.id === state.playoffs.final.p1SourceMatch);
    const sf2 = state.playoffs.semiFinals.find(m => m.id === state.playoffs.final.p2SourceMatch);
    state.playoffs.final.player1Id = (sf1 && sf1.winnerId) ? sf1.winnerId : null;
    state.playoffs.final.player2Id = (sf2 && sf2.winnerId) ? sf2.winnerId : null;
  }
}
