// ============================================================
// PORRALAB ZIKU ZAKU — script.js
// Conecta con el Worker zikuzakuapi (Cloudflare) que a su vez
// consulta football-data.org y devuelve los partidos del Mundial.
// ============================================================

const API_URL = "https://zikuzakuapi.sarmendiz.workers.dev/";

// --- Tabla de equipos: puntos por victoria/empate según su grupo ---
const TEAM_RULES = {
  "España":{api:["Spain"],win:21,draw:7},
  "Francia":{api:["France"],win:21,draw:7},
  "Argentina":{api:["Argentina"],win:21,draw:7},
  "Portugal":{api:["Portugal"],win:21,draw:7},
  "Inglaterra":{api:["England"],win:24,draw:8},
  "Brasil":{api:["Brazil"],win:24,draw:8},
  "Alemania":{api:["Germany"],win:24,draw:8},
  "Países Bajos":{api:["Netherlands"],win:24,draw:8},
  "Marruecos":{api:["Morocco"],win:27,draw:9},
  "Bélgica":{api:["Belgium"],win:27,draw:9},
  "Croacia":{api:["Croatia"],win:27,draw:9},
  "Colombia":{api:["Colombia"],win:27,draw:9},
  "Noruega":{api:["Norway"],win:30,draw:10},
  "Uruguay":{api:["Uruguay"],win:30,draw:10},
  "Senegal":{api:["Senegal"],win:30,draw:10},
  "Suiza":{api:["Switzerland"],win:30,draw:10},
  "Japón":{api:["Japan"],win:33,draw:11},
  "USA":{api:["United States","USA"],win:33,draw:11},
  "Turquia":{api:["Turkey","Türkiye"],win:33,draw:11},
  "Ecuador":{api:["Ecuador"],win:33,draw:11},
  "Austria":{api:["Austria"],win:36,draw:12},
  "Suecia":{api:["Sweden"],win:36,draw:12},
  "Paraguay":{api:["Paraguay"],win:36,draw:12},
  "México":{api:["Mexico"],win:36,draw:12},
  "Corea del Sur":{api:["South Korea","Korea Republic"],win:39,draw:13},
  "Escocia":{api:["Scotland"],win:39,draw:13},
  "Costa de Marfil":{api:["Ivory Coast","Côte d'Ivoire"],win:39,draw:13},
  "Canadá":{api:["Canada"],win:39,draw:13},
  "Bosnia":{api:["Bosnia and Herzegovina"],win:42,draw:14},
  "Republica Checa":{api:["Czechia","Czech Republic"],win:42,draw:14},
  "Egipto":{api:["Egypt"],win:42,draw:14},
  "Ghana":{api:["Ghana"],win:42,draw:14},
  "Argelia":{api:["Algeria"],win:45,draw:15},
  "Túnez":{api:["Tunisia"],win:45,draw:15},
  "Australia":{api:["Australia"],win:45,draw:15},
  "Iran":{api:["Iran"],win:45,draw:15},
  "Arabia Saudí":{api:["Saudi Arabia"],win:48,draw:16},
  "Qatar":{api:["Qatar"],win:48,draw:16},
  "RD Congo":{api:["DR Congo","Congo DR"],win:48,draw:16},
  "Sudáfrica":{api:["South Africa"],win:48,draw:16},
  "Nueva Zelanda":{api:["New Zealand"],win:51,draw:17},
  "Uzbekistán":{api:["Uzbekistan"],win:51,draw:17},
  "Cabo Verde":{api:["Cape Verde"],win:51,draw:17},
  "Panamá":{api:["Panama"],win:51,draw:17},
  "Haití":{api:["Haiti"],win:54,draw:18},
  "Curazao":{api:["Curacao","Curaçao"],win:54,draw:18},
  "Iraq":{api:["Iraq"],win:54,draw:18},
  "Jordania":{api:["Jordan"],win:54,draw:18}
};

// --- Bonus por avanzar de ronda (se suma SOLO al partido en el que se logra el pase) ---
const ROUND_BONUS = {
  GROUP_STAGE: 0,
  LAST_32: 5, ROUND_OF_32: 5,
  LAST_16: 10, ROUND_OF_16: 10,
  QUARTER_FINALS: 15,
  SEMI_FINALS: 20,
  FINAL: 40,
  THIRD_PLACE: 10
};

// --- Jugadores cargados desde data.js (edita ese archivo para actualizar puntos) ---
let players = PLAYERS_DATA.map(p => ({...p, points: p.teams.reduce((s,t)=>s+t[1],0)}));

players.forEach(p => p.points = 0);

// ============================================================
// LÓGICA DE CÁLCULO
// ============================================================

function normalizeName(n){
  return String(n||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();
}

function teamMatchesPorraName(porra, apiName){
  const rule = TEAM_RULES[porra];
  if(!rule) return normalizeName(porra) === normalizeName(apiName);
  return rule.api.some(a => normalizeName(a) === normalizeName(apiName));
}

function isFinished(m){
  return ["FINISHED","AWARDED"].includes(m.status);
}

function getWinnerName(m){
  const w = m?.score?.winner;
  if(w === "HOME_TEAM") return m.homeTeam?.name;
  if(w === "AWAY_TEAM") return m.awayTeam?.name;
  if(w === "DRAW") return "DRAW";
  return null;
}

// Detecta si hubo prórroga/penaltis. football-data.org marca esto en score.duration
// ("REGULAR", "EXTRA_TIME", "PENALTY_SHOOTOUT") y en score.regularTime (resultado a los 90').
function getExtraInfo(m){
  const duration = m?.score?.duration || "REGULAR";
  return {
    wentToExtraTime: duration === "EXTRA_TIME" || duration === "PENALTY_SHOOTOUT",
    wentToPenalties: duration === "PENALTY_SHOOTOUT",
    regularTime: m?.score?.regularTime || null
  };
}

function getTeamResult(m, team){
  if(!isFinished(m)) return null;
  const home = m.homeTeam?.name || "";
  const away = m.awayTeam?.name || "";
  const isHome = teamMatchesPorraName(team, home);
  const isAway = teamMatchesPorraName(team, away);
  if(!isHome && !isAway) return null;

  const winner = getWinnerName(m);
  if(winner === "DRAW") return "draw";
  if(isHome && winner === home) return "win";
  if(isAway && winner === away) return "win";
  return "loss";
}

// Bonus de ronda: solo se aplica si ESTE partido es el que decide el pase
// (es decir, si el partido pertenece a una fase eliminatoria y el equipo lo gana,
// se entiende que con esa victoria avanza a la siguiente ronda).
function getRoundBonus(m, result){
  if(result !== "win") return 0;
  const stage = m.stage || "GROUP_STAGE";
  return ROUND_BONUS[stage] || 0;
}

// Bonus de prórroga/penaltis
function getExtraBonus(m, result){
  const info = getExtraInfo(m);
  let bonus = 0;
  if(info.wentToPenalties){
    if(result === "win") bonus += 3;       // ganar en penaltis
  } else if(info.wentToExtraTime){
    if(result === "win") bonus += 10;      // ganar en prórroga
    if(result === "draw") bonus += 2;      // empatar tras la prórroga (no debería pasar en eliminatorias, pero por si acaso)
  }
  return bonus;
}

function calculatePointsFromMatches(matchesRaw){
  // Deduplicar por ID para evitar que el mismo partido sume varias veces
  const seen = new Set();
  const matches = matchesRaw.filter(m => {
    if(!m.id || seen.has(m.id)) return false;
    seen.add(m.id);
    return true;
  });

  players = players.map(p => {
    let total = 0;
    const teams = p.teams.map(([team]) => {
      const rule = TEAM_RULES[team] || {win:0, draw:0};
      let pts = 0;
      matches.forEach(m => {
        const result = getTeamResult(m, team);
        if(result === "win"){
          pts += rule.win;
          pts += getRoundBonus(m, result);
          pts += getExtraBonus(m, result);
        } else if(result === "draw"){
          pts += rule.draw;
          pts += getExtraBonus(m, result);
        }
      });
      total += pts;
      return [team, pts];
    });
    return {...p, points: total, teams};
  });
}

// ============================================================
// CONEXIÓN A LA API
// ============================================================

async function updateFromApi(){
  const status = document.getElementById("status");
  status.textContent = "⏳ Consultando resultados oficiales del Mundial...";
  try{
    const res = await fetch(API_URL);
    const data = await res.json();
    if(!data.ok) throw new Error(data.message || "API sin datos");

    // El Worker ya devuelve los puntos calculados — solo los asignamos
    if(data.players && data.players.length){
      players = data.players.map(p => ({...p, points: p.points}));
    }

    render();
    renderProximos(data.upcoming || []);
    renderStats(data.upcoming || [], data.players || []);
    renderGoleadores();
    renderCuriosidades(data.players || []);
    status.textContent = "✅ Puntos actualizados con resultados oficiales — " + new Date().toLocaleString("es-ES");
  }catch(e){
    console.error(e);
    status.textContent = "⚠️ No se han podido actualizar los resultados. Revisa la conexión con la API.";
  }
}

// ============================================================
// RENDER
// ============================================================

function sortedPlayers(){
  return [...players].sort((a,b) => b.points - a.points);
}

function getRanks(ordered){
  let ranks = [], lastPoints = null, rank = 0;
  ordered.forEach((p,i) => {
    if(p.points !== lastPoints){ rank = i+1; lastPoints = p.points; }
    ranks.push(rank);
  });
  return ranks;
}

function medalClass(r){
  if(r === 1) return "first";
  if(r === 2) return "second";
  if(r === 3) return "third";
  return "";
}

function medalIcon(r){
  if(r === 1) return "🥇";
  if(r === 2) return "🥈";
  if(r === 3) return "🥉";
  return String(r);
}

function render(){
  const ordered = sortedPlayers();
  const ranks = getRanks(ordered);
  const leader = ordered[0];

  document.getElementById("leaderName").textContent = leader.name;
  document.getElementById("leaderPts").textContent = leader.points + " puntos";

  const rankingBody = document.getElementById("rankingBody");
  rankingBody.innerHTML = "";
  ordered.forEach((p,i) => {
    const r = ranks[i];
    const tr = document.createElement("tr");
    if(r === 1) tr.className = "row-first";
    else if(r === 2) tr.className = "row-second";
    else if(r === 3) tr.className = "row-third";
    tr.innerHTML = `
      <td class="rank-icon">${medalIcon(r)}</td>
      <td><div class="player-cell">
        <img class="avatar-sm" src="${p.img}" alt="${p.name}">
        <span class="player-name-bold">${p.name}</span>
      </div></td>
      <td class="pts-cell">${p.points}</td>
      <td style="color:#9fb0c4;font-size:0.85rem;">${p.shirt}</td>
    `;
    rankingBody.appendChild(tr);
  });

  const cards = document.getElementById("cards");
  cards.innerHTML = "";
  ordered.forEach((p,i) => {
    const card = document.createElement("button");
    card.className = "card " + medalClass(ranks[i]);
    card.onclick = () => openFicha(p.name);
    card.innerHTML = `
      <div class="rank-badge">${medalIcon(ranks[i])}</div>
      <img src="${p.img}" alt="${p.name}">
      <div class="card-footer">
        <span class="card-name">${p.name}</span>
        <span class="card-pts">${p.points}pt</span>
      </div>
    `;
    cards.appendChild(card);
  });
}

function openFicha(name){
  const ordered = sortedPlayers();
  const ranks = getRanks(ordered);
  const p = ordered.find(x => x.name === name);
  const i = ordered.findIndex(x => x.name === name);
  const active = p.teams.filter(t => t[1] > 0).length;
  const best = [...p.teams].sort((a,b) => b[1]-a[1])[0];

  document.getElementById("sheetImg").src = p.img;
  document.getElementById("sheetImg").alt = p.name;
  document.getElementById("sheetName").textContent = p.name;
  document.getElementById("sheetMeta").textContent = `${p.animal} · camiseta de ${p.shirt} #${p.number}`;
  document.getElementById("sheetPoints").textContent = p.points;
  document.getElementById("bioTitle").textContent = `${p.name} — ${p.animal}`;
  document.getElementById("bioText").textContent = p.bio;
  document.getElementById("sheetRank").textContent = ranks[i];
  document.getElementById("sheetTeams").textContent = p.teams.length;
  document.getElementById("sheetActive").textContent = active;
  document.getElementById("sheetBest").textContent = best ? best[1] : 0;

  const rows = document.getElementById("sheetScoreRows");
  rows.innerHTML = "";
  p.teams.forEach(([team, pts]) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${team}</td><td>${pts}</td><td>${pts > 0 ? "Ha sumado" : "Pendiente"}</td>`;
    rows.appendChild(tr);
  });

  document.getElementById("modal").classList.add("active");
}

function closeFicha(){
  document.getElementById("modal").classList.remove("active");
}

// ============================================================
// PANTALLA DE BIENVENIDA Y MÚSICA
// ============================================================

let musicPlaying = false;

function startPorralab(){
  const intro = document.getElementById("intro");
  const app = document.getElementById("app");
  const audio = document.getElementById("himno");

  intro.style.display = "none";
  app.classList.remove("hidden");

  audio.play().then(() => {
    musicPlaying = true;
    document.getElementById("musicToggle").textContent = "🔊 Himno ON";
  }).catch(() => {
    musicPlaying = false;
    document.getElementById("musicToggle").textContent = "🔇 Himno OFF";
  });
}

function toggleMusic(){
  const audio = document.getElementById("himno");
  const btn = document.getElementById("musicToggle");
  if(audio.paused){
    audio.play().then(() => { musicPlaying = true; btn.textContent = "🔊 Himno ON"; });
  } else {
    audio.pause();
    musicPlaying = false;
    btn.textContent = "🔇 Himno OFF";
  }
}

// ============================================================
// ESTADÍSTICAS Y CURIOSIDADES
// ============================================================

function renderStats(matches){
  const finished = matches.filter(m => ["FINISHED","AWARDED"].includes(m.status));
  const total = finished.length;

  // Goles totales
  let totalGoals = 0;
  finished.forEach(m => {
    const ft = m.score?.fullTime;
    if(ft) totalGoals += (ft.home||0) + (ft.away||0);
  });

  // Partido con más goles
  let maxGoals = 0, maxMatch = null;
  finished.forEach(m => {
    const ft = m.score?.fullTime;
    if(ft){
      const g = (ft.home||0)+(ft.away||0);
      if(g > maxGoals){ maxGoals = g; maxMatch = m; }
    }
  });

  // Equipo más goleador de la porra
  const teamGoals = {};
  finished.forEach(m => {
    const ft = m.score?.fullTime;
    if(!ft) return;
    const h = m.homeTeam?.name; const a = m.awayTeam?.name;
    if(h) teamGoals[h] = (teamGoals[h]||0) + (ft.home||0);
    if(a) teamGoals[a] = (teamGoals[a]||0) + (ft.away||0);
  });
  const topTeam = Object.entries(teamGoals).sort((a,b)=>b[1]-a[1])[0];

  // Jugador líder de la porra
  const ordered = sortedPlayers();

  const statsGrid = document.getElementById("statsGrid");
  if(statsGrid){
    statsGrid.innerHTML = `
      <div class="stat-card"><span class="stat-val">${total}</span><span class="stat-label">Partidos jugados</span></div>
      <div class="stat-card"><span class="stat-val">${totalGoals}</span><span class="stat-label">Goles totales</span><div class="stat-sub">${total ? (totalGoals/total).toFixed(1) + " por partido" : ""}</div></div>
      <div class="stat-card"><span class="stat-val">${topTeam ? topTeam[1] : 0}</span><span class="stat-label">Máximo goleador</span><div class="stat-sub">${topTeam ? topTeam[0] : "—"}</div></div>
      <div class="stat-card"><span class="stat-val">${ordered[0]?.points||0}</span><span class="stat-label">Mejor puntuación</span><div class="stat-sub">${ordered[0]?.name||"—"}</div></div>
      <div class="stat-card"><span class="stat-val">${ordered[ordered.length-1]?.points||0}</span><span class="stat-label">Puntuación más baja</span><div class="stat-sub">${ordered[ordered.length-1]?.name||"—"}</div></div>
      <div class="stat-card"><span class="stat-val">${maxGoals}</span><span class="stat-label">Más goles en un partido</span><div class="stat-sub">${maxMatch ? maxMatch.homeTeam?.name+" vs "+maxMatch.awayTeam?.name : "—"}</div></div>
    `;
  }

  // Curiosidades
  const dif = ordered[0].points - ordered[ordered.length-1].points;
  const allPts = ordered.map(p=>p.points);
  const media = Math.round(allPts.reduce((a,b)=>a+b,0)/allPts.length);
  const bestTeamPorra = ordered.map(p=>({player:p.name, team:[...p.teams].sort((a,b)=>b[1]-a[1])[0]})).sort((a,b)=>b.team[1]-a.team[1])[0];

  const curiosidadesGrid = document.getElementById("curiosidadesGrid");
  if(curiosidadesGrid){
    curiosidadesGrid.innerHTML = `
      <div class="curiosidad-card"><div class="cur-title">🔥 Diferencia líder-colista</div><div class="cur-text">${ordered[0].name} aventaja a ${ordered[ordered.length-1].name} por <strong style="color:var(--oro)">${dif} puntos</strong></div></div>
      <div class="curiosidad-card"><div class="cur-title">📈 Media de puntos</div><div class="cur-text">La media de la porra está en <strong style="color:var(--oro)">${media} puntos</strong></div></div>
      <div class="curiosidad-card"><div class="cur-title">🌟 Equipo estrella</div><div class="cur-text">El equipo que más puntos da es <strong style="color:var(--oro)">${bestTeamPorra?.team?.[0]||"—"}</strong> con ${bestTeamPorra?.team?.[1]||0} pts — elegido por ${bestTeamPorra?.player||"—"}</div></div>
      ${maxMatch ? `<div class="curiosidad-card"><div class="cur-title">💥 Partido más loco</div><div class="cur-text">${maxMatch.homeTeam?.name} vs ${maxMatch.awayTeam?.name} con <strong style="color:var(--oro)">${maxGoals} goles</strong></div></div>` : ""}
    `;
  }
}

async function renderGoleadores(){
  const tbody = document.getElementById("goleadoresBody");
  if(!tbody) return;
  try{
    const res = await fetch(API_URL + "scorers");
    const data = await res.json();
    const scorers = data.scorers || [];
    if(!scorers.length) throw new Error("sin datos");
    tbody.innerHTML = "";
    scorers.slice(0,20).forEach((s,i) => {
      const tr = document.createElement("tr");
      if(i<3) tr.className = ["row-first","row-second","row-third"][i];
      const medals = ["🥇","🥈","🥉"];
      tr.innerHTML = `
        <td class="rank-icon">${medals[i]||i+1}</td>
        <td class="player-name-bold">${s.player?.name||"—"}</td>
        <td style="color:var(--gris-azul);font-size:0.85rem">${s.team?.name||"—"}</td>
        <td class="pts-cell">${s.goals??0}</td>
        <td style="color:var(--gris-azul)">${s.assists??0}</td>
      `;
      tbody.appendChild(tr);
    });
  }catch(e){
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--gris-azul);padding:20px">Goleadores no disponibles aún — el torneo acaba de comenzar</td></tr>`;
  }
}

// ============================================================
// CURIOSIDADES POR JUGADOR
// ============================================================

const TEAM_POINTS_MAX = {
  "Argentina":21,"España":21,"Francia":21,"Portugal":21,
  "Inglaterra":24,"Brasil":24,"Alemania":24,"Países Bajos":24,
  "Marruecos":27,"Bélgica":27,"Croacia":27,"Colombia":27,
  "Noruega":30,"Uruguay":30,"Senegal":30,"Suiza":30,
  "Japón":33,"USA":33,"Turquia":33,"Ecuador":33,
  "Austria":36,"Suecia":36,"Paraguay":36,"México":36,
  "Corea del Sur":39,"Escocia":39,"Costa de Marfil":39,"Canadá":39,
  "Bosnia":42,"Republica Checa":42,"Egipto":42,"Ghana":42,
  "Argelia":45,"Túnez":45,"Australia":45,"Iran":45,
  "Arabia Saudí":48,"Qatar":48,"RD Congo":48,"Sudáfrica":48,
  "Nueva Zelanda":51,"Uzbekistán":51,"Cabo Verde":51,"Panamá":51,
  "Haití":54,"Curazao":54,"Iraq":54,"Jordania":54
};

function renderCuriosidades(apiPlayers){
  const container = document.getElementById("curiosidadesJugadores");
  if(!container) return;

  const base = apiPlayers && apiPlayers.length ? apiPlayers : players;
  const ordered = [...base].sort((a,b) => b.points - a.points);

  // Equipos compartidos entre todos
  const allTeams = base.map(p => p.teams.map(t => Array.isArray(t) ? t[0] : t));
  const sharedByAll = allTeams[0].filter(t => allTeams.every(ts => ts.includes(t)));

  container.innerHTML = "";

  base.forEach(p => {
    const myTeams = p.teams.map(t => Array.isArray(t) ? t[0] : t);
    const myPts   = p.teams.map(t => Array.isArray(t) ? t : [t, 0]);

    // Equipo más rentable (más puntos)
    const best = [...myPts].sort((a,b) => b[1]-a[1])[0];
    // Equipo más arriesgado (mayor win pts = más improbable)
    const riskiest = [...myTeams].sort((a,b) => (TEAM_POINTS_MAX[b]||0)-(TEAM_POINTS_MAX[a]||0))[0];
    // Equipos únicos (solo este jugador los tiene)
    const unique = myTeams.filter(t => base.filter(p2 => p2.teams.some(t2 => (Array.isArray(t2)?t2[0]:t2) === t)).length === 1);
    // Posición actual
    const pos = ordered.findIndex(x => x.name === p.name) + 1;
    // Potencial máximo teórico (si todos sus equipos ganaran todo)
    const maxPot = myTeams.reduce((s,t) => s + (TEAM_POINTS_MAX[t]||0)*6 + 5+10+15+20+40, 0);

    const card = document.createElement("div");
    card.className = "cur-jugador-card";
    card.innerHTML = `
      <img src="${p.img}" alt="${p.name}">
      <div class="cur-jugador-info">
        <h4>${p.name} — ${pos}º con ${p.points} pts</h4>
        <ul>
          <li>🌟 Mejor equipo ahora: <strong>${best && best[1]>0 ? best[0]+' ('+best[1]+' pts)' : 'Ninguno suma aún'}</strong></li>
          <li>🎲 Apuesta más arriesgada: <strong>${riskiest||'—'}</strong> (${TEAM_POINTS_MAX[riskiest]||0} pts/victoria)</li>
          <li>🔒 Equipos únicos suyos: <strong>${unique.length ? unique.join(', ') : 'Ninguno — comparte todos'}</strong></li>
          <li>🤝 Equipos que comparte con todos: <strong>${sharedByAll.length ? sharedByAll.join(', ') : 'Ninguno'}</strong></li>
          <li>📈 Potencial máximo teórico: <strong>${maxPot} pts</strong></li>
        </ul>
      </div>
    `;
    container.appendChild(card);
  });
}

// ============================================================
// PRÓXIMOS PARTIDOS
// ============================================================

const STAGE_NAMES = {
  GROUP_STAGE:"Grupos", LAST_32:"16avos", ROUND_OF_32:"16avos",
  LAST_16:"Octavos", ROUND_OF_16:"Octavos",
  QUARTER_FINALS:"Cuartos", SEMI_FINALS:"Semis",
  FINAL:"Final", THIRD_PLACE:"3er puesto"
};

function renderProximos(matches){
  const tbody = document.getElementById("proximosBody");
  if(!tbody) return;
  const upcoming = matches
    .filter(m => !["FINISHED","AWARDED"].includes(m.status))
    .sort((a,b) => new Date(a.utcDate) - new Date(b.utcDate))
    .slice(0, 20);
  if(!upcoming.length){
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#9fb0c4;padding:20px">No hay partidos próximos disponibles</td></tr>`;
    return;
  }
  tbody.innerHTML = "";
  upcoming.forEach(m => {
    const fecha = new Date(m.utcDate).toLocaleDateString("es-ES",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"});
    const fase = STAGE_NAMES[m.stage] || m.stage || "—";
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td style="color:#9fb0c4;font-size:0.85rem;white-space:nowrap">${fecha}</td>
      <td style="font-weight:700;text-align:right">${m.homeTeam?.name||"—"}</td>
      <td style="text-align:center;color:#d4af37;font-family:'Anton',sans-serif">VS</td>
      <td style="font-weight:700">${m.awayTeam?.name||"—"}</td>
      <td style="color:#9fb0c4;font-size:0.85rem">${fase}</td>
    `;
    tbody.appendChild(tr);
  });
}

// ============================================================
// INICIO
// ============================================================

render();
updateFromApi();
