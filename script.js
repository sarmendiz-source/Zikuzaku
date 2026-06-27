// ============================================================
// PORRALAB ZIKU ZAKU â€” script.js
// Conecta con el Worker zikuzakuapi (Cloudflare) que a su vez
// consulta football-data.org y devuelve los partidos del Mundial.
// ============================================================

const API_URL = "https://zikuzakuapi.sarmendiz.workers.dev/";

// --- Tabla de equipos: puntos por victoria/empate segÃºn su grupo ---
const TEAM_RULES = {
  "EspaÃ±a":{api:["Spain"],win:21,draw:7},
  "Francia":{api:["France"],win:21,draw:7},
  "Argentina":{api:["Argentina"],win:21,draw:7},
  "Portugal":{api:["Portugal"],win:21,draw:7},
  "Inglaterra":{api:["England"],win:24,draw:8},
  "Brasil":{api:["Brazil"],win:24,draw:8},
  "Alemania":{api:["Germany"],win:24,draw:8},
  "PaÃ­ses Bajos":{api:["Netherlands"],win:24,draw:8},
  "Marruecos":{api:["Morocco"],win:27,draw:9},
  "BÃ©lgica":{api:["Belgium"],win:27,draw:9},
  "Croacia":{api:["Croatia"],win:27,draw:9},
  "Colombia":{api:["Colombia"],win:27,draw:9},
  "Noruega":{api:["Norway"],win:30,draw:10},
  "Uruguay":{api:["Uruguay"],win:30,draw:10},
  "Senegal":{api:["Senegal"],win:30,draw:10},
  "Suiza":{api:["Switzerland"],win:30,draw:10},
  "JapÃ³n":{api:["Japan"],win:33,draw:11},
  "USA":{api:["United States","USA"],win:33,draw:11},
  "Turquia":{api:["Turkey","TÃ¼rkiye"],win:33,draw:11},
  "Ecuador":{api:["Ecuador"],win:33,draw:11},
  "Austria":{api:["Austria"],win:36,draw:12},
  "Suecia":{api:["Sweden"],win:36,draw:12},
  "Paraguay":{api:["Paraguay"],win:36,draw:12},
  "MÃ©xico":{api:["Mexico"],win:36,draw:12},
  "Corea del Sur":{api:["South Korea","Korea Republic"],win:39,draw:13},
  "Escocia":{api:["Scotland"],win:39,draw:13},
  "Costa de Marfil":{api:["Ivory Coast","CÃ´te d'Ivoire"],win:39,draw:13},
  "CanadÃ¡":{api:["Canada"],win:39,draw:13},
  "Bosnia":{api:["Bosnia and Herzegovina"],win:42,draw:14},
  "Republica Checa":{api:["Czechia","Czech Republic"],win:42,draw:14},
  "Egipto":{api:["Egypt"],win:42,draw:14},
  "Ghana":{api:["Ghana"],win:42,draw:14},
  "Argelia":{api:["Algeria"],win:45,draw:15},
  "TÃºnez":{api:["Tunisia"],win:45,draw:15},
  "Australia":{api:["Australia"],win:45,draw:15},
  "Iran":{api:["Iran"],win:45,draw:15},
  "Arabia SaudÃ­":{api:["Saudi Arabia"],win:48,draw:16},
  "Qatar":{api:["Qatar"],win:48,draw:16},
  "RD Congo":{api:["DR Congo","Congo DR"],win:48,draw:16},
  "SudÃ¡frica":{api:["South Africa"],win:48,draw:16},
  "Nueva Zelanda":{api:["New Zealand"],win:51,draw:17},
  "UzbekistÃ¡n":{api:["Uzbekistan"],win:51,draw:17},
  "Cabo Verde":{api:["Cape Verde"],win:51,draw:17},
  "PanamÃ¡":{api:["Panama"],win:51,draw:17},
  "HaitÃ­":{api:["Haiti"],win:54,draw:18},
  "Curazao":{api:["Curacao","CuraÃ§ao"],win:54,draw:18},
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

// --- Jugadores y sus 11 equipos elegidos ---
let players = [
  {name:"ALBA",img:"img/alba.png",shirt:"Escocia",number:7,animal:"BÃºho",
   bio:"Le gustan las galletitas de dinosaurios y el viento en su sÃ©ptimo piso.",
   teams:[["Argentina",0],["Inglaterra",0],["Colombia",0],["Suiza",0],["JapÃ³n",0],["Austria",0],["Escocia",0],["Egipto",0],["Australia",0],["RD Congo",0],["Curazao",0]]},
  {name:"MIKEL XABIER",img:"img/xabier.png",shirt:"Argentina",number:6,animal:"Capibara",
   bio:"Le gusta hablar con personas desconocidas y con personas de la tercera edad.",
   teams:[["Argentina",0],["Alemania",0],["Marruecos",0],["Noruega",0],["USA",0],["MÃ©xico",0],["Costa de Marfil",0],["Egipto",0],["Australia",0],["RD Congo",0],["Curazao",0]]},
  {name:"LEIRE",img:"img/leire.png",shirt:"EspaÃ±a",number:9,animal:"Pantera",
   bio:"Le gusta la Virgen del Pilar y la paloterapia.",
   teams:[["EspaÃ±a",0],["Alemania",0],["Colombia",0],["Noruega",0],["JapÃ³n",0],["MÃ©xico",0],["CanadÃ¡",0],["Ghana",0],["Iran",0],["SudÃ¡frica",0],["HaitÃ­",0]]},
  {name:"ITOITZ",img:"img/itoitz.png",shirt:"Francia",number:8,animal:"Border Collie",
   bio:"Le gusta la bici, el Excel y hacer dominadas.",
   teams:[["Francia",0],["Inglaterra",0],["Colombia",0],["Noruega",0],["USA",0],["MÃ©xico",0],["Corea del Sur",0],["Egipto",0],["Australia",0],["RD Congo",0],["Curazao",0]]},
  {name:"ANE",img:"img/ane.png",shirt:"MÃ©xico",number:12,animal:"Setter inglÃ©s",
   bio:"Le gustan las motos y los perros.",
   teams:[["EspaÃ±a",0],["Alemania",0],["Colombia",0],["Noruega",0],["USA",0],["MÃ©xico",0],["Corea del Sur",0],["Egipto",0],["Australia",0],["RD Congo",0],["Curazao",0]]},
  {name:"AITOR",img:"img/aitor.png",shirt:"Brasil",number:10,animal:"Sapo",
   bio:"DJ y residente en el Bukowski. FanÃ¡tico de Andoni Brun.",
   teams:[["EspaÃ±a",0],["Brasil",0],["Colombia",0],["Noruega",0],["USA",0],["Suecia",0],["CanadÃ¡",0],["Egipto",0],["Australia",0],["RD Congo",0],["Curazao",0]]}
];

players.forEach(p => p.points = 0);

// ============================================================
// LÃ“GICA DE CÃLCULO
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

// Detecta si hubo prÃ³rroga/penaltis. football-data.org marca esto en score.duration
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

// Bonus de prÃ³rroga/penaltis
function getExtraBonus(m, result){
  const info = getExtraInfo(m);
  let bonus = 0;
  if(info.wentToPenalties){
    if(result === "win") bonus += 3;       // ganar en penaltis
  } else if(info.wentToExtraTime){
    if(result === "win") bonus += 10;      // ganar en prÃ³rroga
    if(result === "draw") bonus += 2;      // empatar tras la prÃ³rroga (no deberÃ­a pasar en eliminatorias, pero por si acaso)
  }
  return bonus;
}

function calculatePointsFromMatches(matches){
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
// CONEXIÃ“N A LA API
// ============================================================

async function updateFromApi(){
  const status = document.getElementById("status");
  status.textContent = "â³ Consultando resultados oficiales del Mundial...";
  try{
    const res = await fetch(API_URL);
    const data = await res.json();
    if(!data.ok) throw new Error(data.message || "API sin datos");
    calculatePointsFromMatches(data.matches || []);
    render();
    status.textContent = "âœ… Puntos actualizados con resultados oficiales â€” " + new Date().toLocaleString("es-ES");
  }catch(e){
    console.error(e);
    status.textContent = "âš ï¸ No se han podido actualizar los resultados. Revisa la conexiÃ³n con la API.";
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
  if(r === 1) return "ðŸ¥‡";
  if(r === 2) return "ðŸ¥ˆ";
  if(r === 3) return "ðŸ¥‰";
  return String(r);
}

function render(){
  const ordered = sortedPlayers();
  const ranks = getRanks(ordered);
  const leaders = ordered.filter(p => p.points === ordered[0].points).map(p => p.name).join(" y ");

  document.getElementById("leaderBanner").innerHTML =
    `<h2>ðŸ”¥ Ahora va ${leaders.includes(" y ") ? "primero (empate)" : "primero"}: <strong>${leaders}</strong></h2>
     <div style="font-family:'Anton',sans-serif;font-size:1.4rem;color:#d4af37;">${ordered[0].points} puntos</div>`;

  const rankingBody = document.getElementById("rankingBody");
  rankingBody.innerHTML = "";
  ordered.forEach((p,i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${medalIcon(ranks[i])}</td><td>${p.name}</td><td>${p.points}</td>`;
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
      <div class="points-tag">${p.points} pt</div>
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
  document.getElementById("sheetMeta").textContent = `${p.animal} Â· camiseta de ${p.shirt} #${p.number}`;
  document.getElementById("sheetPoints").textContent = p.points;
  document.getElementById("bioTitle").textContent = `${p.name} â€” ${p.animal}`;
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
// PANTALLA DE BIENVENIDA Y MÃšSICA
// ============================================================

let musicPlaying = false;

function startPorralab(){
  const intro = document.getElementById("intro");
  const app = document.getElementById("app");
  const audio = document.getElementById("himno");

  intro.classList.add("hidden");
  app.classList.remove("hidden");

  audio.play().then(() => {
    musicPlaying = true;
    document.getElementById("musicToggle").textContent = "ðŸ”Š Himno ON";
  }).catch(() => {
    musicPlaying = false;
    document.getElementById("musicToggle").textContent = "ðŸ”‡ Himno OFF";
  });
}

function toggleMusic(){
  const audio = document.getElementById("himno");
  const btn = document.getElementById("musicToggle");
  if(audio.paused){
    audio.play().then(() => { musicPlaying = true; btn.textContent = "ðŸ”Š Himno ON"; });
  } else {
    audio.pause();
    musicPlaying = false;
    btn.textContent = "ðŸ”‡ Himno OFF";
  }
}

// ============================================================
// INICIO
// ============================================================

render();
updateFromApi();
