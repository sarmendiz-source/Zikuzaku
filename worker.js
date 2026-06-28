// ============================================================
// PORRALAB ZIKU ZAKU — Cloudflare Worker
// Llama a football-data.org, aplica las normas y devuelve
// los puntos calculados de cada jugador.
// ============================================================

const API_KEY = "4547df55b2114cd59fd24b5664eab0d3";
const API_BASE = "https://api.football-data.org/v4";
const COMPETITION = "WC"; // FIFA World Cup 2026

// ---- Reglas de puntuación por equipo ----
const TEAM_RULES = {
  "España":         { api:["Spain"],                          win:21, draw:7  },
  "Francia":        { api:["France"],                         win:21, draw:7  },
  "Argentina":      { api:["Argentina"],                      win:21, draw:7  },
  "Portugal":       { api:["Portugal"],                       win:21, draw:7  },
  "Inglaterra":     { api:["England"],                        win:24, draw:8  },
  "Brasil":         { api:["Brazil"],                         win:24, draw:8  },
  "Alemania":       { api:["Germany"],                        win:24, draw:8  },
  "Países Bajos":   { api:["Netherlands"],                    win:24, draw:8  },
  "Marruecos":      { api:["Morocco"],                        win:27, draw:9  },
  "Bélgica":        { api:["Belgium"],                        win:27, draw:9  },
  "Croacia":        { api:["Croatia"],                        win:27, draw:9  },
  "Colombia":       { api:["Colombia"],                       win:27, draw:9  },
  "Noruega":        { api:["Norway"],                         win:30, draw:10 },
  "Uruguay":        { api:["Uruguay"],                        win:30, draw:10 },
  "Senegal":        { api:["Senegal"],                        win:30, draw:10 },
  "Suiza":          { api:["Switzerland"],                    win:30, draw:10 },
  "Japón":          { api:["Japan"],                          win:33, draw:11 },
  "USA":            { api:["United States","USA"],             win:33, draw:11 },
  "Turquia":        { api:["Turkey","Türkiye"],                win:33, draw:11 },
  "Ecuador":        { api:["Ecuador"],                        win:33, draw:11 },
  "Austria":        { api:["Austria"],                        win:36, draw:12 },
  "Suecia":         { api:["Sweden"],                         win:36, draw:12 },
  "Paraguay":       { api:["Paraguay"],                       win:36, draw:12 },
  "México":         { api:["Mexico"],                         win:36, draw:12 },
  "Corea del Sur":  { api:["South Korea","Korea Republic"],   win:39, draw:13 },
  "Escocia":        { api:["Scotland"],                       win:39, draw:13 },
  "Costa de Marfil":{ api:["Ivory Coast","Côte d'Ivoire"],   win:39, draw:13 },
  "Canadá":         { api:["Canada"],                         win:39, draw:13 },
  "Bosnia":         { api:["Bosnia and Herzegovina"],         win:42, draw:14 },
  "Republica Checa":{ api:["Czechia","Czech Republic"],       win:42, draw:14 },
  "Egipto":         { api:["Egypt"],                          win:42, draw:14 },
  "Ghana":          { api:["Ghana"],                          win:42, draw:14 },
  "Argelia":        { api:["Algeria"],                        win:45, draw:15 },
  "Túnez":          { api:["Tunisia"],                        win:45, draw:15 },
  "Australia":      { api:["Australia"],                      win:45, draw:15 },
  "Iran":           { api:["Iran"],                           win:45, draw:15 },
  "Arabia Saudí":   { api:["Saudi Arabia"],                   win:48, draw:16 },
  "Qatar":          { api:["Qatar"],                          win:48, draw:16 },
  "RD Congo":       { api:["DR Congo","Congo DR"],            win:48, draw:16 },
  "Sudáfrica":      { api:["South Africa"],                   win:48, draw:16 },
  "Nueva Zelanda":  { api:["New Zealand"],                    win:51, draw:17 },
  "Uzbekistán":     { api:["Uzbekistan"],                     win:51, draw:17 },
  "Cabo Verde":     { api:["Cape Verde","Cape Verde Islands"],  win:51, draw:17 },
  "Panamá":         { api:["Panama"],                         win:51, draw:17 },
  "Haití":          { api:["Haiti"],                          win:54, draw:18 },
  "Curazao":        { api:["Curacao","Curaçao"],              win:54, draw:18 },
  "Iraq":           { api:["Iraq"],                           win:54, draw:18 },
  "Jordania":       { api:["Jordan"],                         win:54, draw:18 }
};

// ---- Bonus por pasar de ronda ----
const ROUND_BONUS = {
  GROUP_STAGE:    0,
  LAST_32:        5,  ROUND_OF_32:  5,
  LAST_16:       10,  ROUND_OF_16: 10,
  QUARTER_FINALS:15,
  SEMI_FINALS:   20,
  FINAL:         40,
  THIRD_PLACE:   10
};

// ---- Jugadores y sus equipos ----
const PLAYERS = [
  { name:"ALBA",        img:"img/alba.png",    shirt:"Escocia",   number:7,  animal:"Búho",
    bio:"Le gustan las galletitas de dinosaurios y el viento en su séptimo piso.",
    teams:["Argentina","Inglaterra","Colombia","Suiza","Japón","Austria","Escocia","Egipto","Australia","RD Congo","Cabo Verde","Curazao"] },
  { name:"MIKEL XABIER",img:"img/xabier.png",  shirt:"Argentina", number:6,  animal:"Capibara",
    bio:"Le gusta hablar con personas desconocidas y con personas de la tercera edad.",
    teams:["Argentina","Alemania","Marruecos","Noruega","USA","México","Costa de Marfil","Egipto","Australia","RD Congo","Cabo Verde","Curazao"] },
  { name:"LEIRE",       img:"img/leire.png",   shirt:"España",    number:9,  animal:"Pantera",
    bio:"Le gusta la Virgen del Pilar y la paloterapia.",
    teams:["España","Alemania","Colombia","Noruega","Japón","México","Canadá","Ghana","Iran","Sudáfrica","Cabo Verde","Haití"] },
  { name:"ITOITZ",      img:"img/itoitz.png",  shirt:"Francia",   number:8,  animal:"Border Collie",
    bio:"Le gusta la bici, el Excel y hacer dominadas.",
    teams:["Francia","Inglaterra","Colombia","Noruega","USA","México","Corea del Sur","Egipto","Australia","RD Congo","Cabo Verde","Curazao"] },
  { name:"ANE",         img:"img/ane.png",     shirt:"México",    number:12, animal:"Setter inglés",
    bio:"Le gustan las motos y los perros.",
    teams:["España","Alemania","Colombia","Noruega","USA","México","Corea del Sur","Egipto","Australia","RD Congo","Cabo Verde","Curazao"] },
  { name:"AITOR",       img:"img/aitor.png",   shirt:"Brasil",    number:10, animal:"Sapo",
    bio:"DJ y residente en el Bukowski. Fanático de Andoni Brun.",
    teams:["España","Brasil","Colombia","Noruega","USA","Suecia","Canadá","Egipto","Australia","RD Congo","Cabo Verde","Curazao"] }
];

// ============================================================
// HELPERS
// ============================================================

function norm(s){ return String(s||"").normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().trim(); }

function matchTeam(porraName, apiName){
  const rule = TEAM_RULES[porraName];
  if(!rule) return norm(porraName) === norm(apiName);
  return rule.api.some(a => norm(a) === norm(apiName));
}

function getResult(match, team){
  if(!["FINISHED","AWARDED"].includes(match.status)) return null;
  const home = match.homeTeam?.name || "";
  const away = match.awayTeam?.name || "";
  const isHome = matchTeam(team, home);
  const isAway = matchTeam(team, away);
  if(!isHome && !isAway) return null;
  const winner = match.score?.winner;
  if(winner === "DRAW") return "draw";
  if(isHome && winner === "HOME_TEAM") return "win";
  if(isAway && winner === "AWAY_TEAM") return "win";
  return "loss";
}

function getExtraBonus(match, result){
  const duration = match.score?.duration || "REGULAR";
  if(duration === "PENALTY_SHOOTOUT" && result === "win") return 3;
  if(duration === "EXTRA_TIME"       && result === "win") return 10;
  if(duration === "EXTRA_TIME"       && result === "draw") return 2;
  return 0;
}

const VALID_STAGES = new Set([
  "GROUP_STAGE","LAST_32","ROUND_OF_32","LAST_16","ROUND_OF_16",
  "QUARTER_FINALS","SEMI_FINALS","FINAL","THIRD_PLACE"
]);

function calcPoints(matches, teams){
  // Deduplicar por ID y filtrar solo stages del torneo (no qualifiers)
  const seen = new Set();
  const unique = matches.filter(m => {
    if(seen.has(m.id)) return false;
    seen.add(m.id);
    return VALID_STAGES.has(m.stage);
  });

  const result = {};
  for(const team of teams){
    const rule = TEAM_RULES[team] || { win:0, draw:0 };
    let pts = 0;
    for(const m of unique){
      const res = getResult(m, team);
      if(res === "win"){
        pts += rule.win;
        pts += ROUND_BONUS[m.stage] || 0;
        pts += getExtraBonus(m, res);
      } else if(res === "draw"){
        pts += rule.draw;
        pts += getExtraBonus(m, res);
      } else if(res === "loss" && m.stage === "FINAL"){
        pts += 20; // 2º puesto (finalista)
      }
    }
    result[team] = pts;
  }
  return result;
}

// ============================================================
// WORKER
// ============================================================

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,OPTIONS",
  "Content-Type": "application/json"
};

export default {
  async fetch(request) {
    if(request.method === "OPTIONS") return new Response(null, { headers: CORS });

    const url = new URL(request.url);

    // Ruta /scorers
    if(url.pathname.endsWith("/scorers")){
      const res = await fetch(`${API_BASE}/competitions/${COMPETITION}/scorers?limit=20`, {
        headers: { "X-Auth-Token": API_KEY }
      });
      const data = await res.json();
      return new Response(JSON.stringify(data), { headers: CORS });
    }

    // Ruta /debug — ver datos crudos de la API
    if(url.pathname.endsWith("/debug")){
      const res = await fetch(`${API_BASE}/competitions/${COMPETITION}/matches`, {
        headers: { "X-Auth-Token": API_KEY }
      });
      const data = await res.json();
      const matches = data.matches || [];
      const stages = [...new Set(matches.map(m => m.stage))];
      const statuses = [...new Set(matches.map(m => m.status))];
      const sample = matches.slice(0,3).map(m=>({id:m.id,stage:m.stage,status:m.status,home:m.homeTeam?.name,away:m.awayTeam?.name,date:m.utcDate,winner:m.score?.winner}));
      const finished = matches.filter(m=>["FINISHED","AWARDED"].includes(m.status));
      // Contar resultados por equipo seleccionado
      const allTeams = [...new Set(PLAYERS.flatMap(p=>p.teams))];
      const teamSummary = {};
      for(const team of allTeams){
        const rule = TEAM_RULES[team];
        if(!rule) continue;
        const teamMatches = finished.filter(m => matchTeam(team, m.homeTeam?.name||"") || matchTeam(team, m.awayTeam?.name||""));
        const wins = teamMatches.filter(m=>getResult(m,team)==="win").length;
        const draws = teamMatches.filter(m=>getResult(m,team)==="draw").length;
        teamSummary[team] = {wins, draws, total: teamMatches.length, stages:[...new Set(teamMatches.map(m=>m.stage))]};
      }
      return new Response(JSON.stringify({ok:true, total:matches.length, finished:finished.length, stages, statuses, sample, teamSummary}), { headers: CORS });
    }

    // Ruta principal — calcular puntos
    try {
      const res = await fetch(`${API_BASE}/competitions/${COMPETITION}/matches?stage=GROUP_STAGE,LAST_32,ROUND_OF_32,LAST_16,ROUND_OF_16,QUARTER_FINALS,SEMI_FINALS,FINAL,THIRD_PLACE`, {
        headers: { "X-Auth-Token": API_KEY }
      });

      if(!res.ok){
        const err = await res.text();
        return new Response(JSON.stringify({ ok:false, message: err }), { headers: CORS, status: res.status });
      }

      const data = await res.json();
      const matches = data.matches || [];

      // Calcular puntos por jugador
      const players = PLAYERS.map(p => {
        const teamPts = calcPoints(matches, p.teams);
        const teamsWithPts = p.teams.map(t => [t, teamPts[t] || 0]);
        const total = teamsWithPts.reduce((s, [,v]) => s + v, 0);
        return {
          name:   p.name,
          img:    p.img,
          shirt:  p.shirt,
          number: p.number,
          animal: p.animal,
          bio:    p.bio,
          points: total,
          teams:  teamsWithPts
        };
      });

      // Próximos partidos
      const upcoming = matches
        .filter(m => !["FINISHED","AWARDED"].includes(m.status))
        .sort((a,b) => new Date(a.utcDate) - new Date(b.utcDate))
        .slice(0, 20)
        .map(m => ({
          id:       m.id,
          utcDate:  m.utcDate,
          status:   m.status,
          stage:    m.stage,
          homeTeam: m.homeTeam?.name,
          awayTeam: m.awayTeam?.name
        }));

      // Estadísticas por equipo (victorias, empates, puntos)
      const allTeams = [...new Set(PLAYERS.flatMap(p => p.teams))];
      const teamStats = {};
      for(const team of allTeams){
        const rule = TEAM_RULES[team];
        if(!rule) continue;
        const seen2 = new Set();
        const uniqueMatches = matches.filter(m => {
          if(seen2.has(m.id)) return false;
          seen2.add(m.id);
          return true;
        });
        let wins=0, draws=0, pts=0;
        for(const m of uniqueMatches){
          if(!["FINISHED","AWARDED"].includes(m.status)) continue;
          const home = m.homeTeam?.name || "";
          const away = m.awayTeam?.name || "";
          const isHome = rule.api.some(a => norm(a) === norm(home));
          const isAway = rule.api.some(a => norm(a) === norm(away));
          if(!isHome && !isAway) continue;
          const winner = m.score?.winner;
          if(winner === "DRAW"){ draws++; pts += rule.draw; }
          else if((isHome && winner==="HOME_TEAM")||(isAway && winner==="AWAY_TEAM")){ wins++; pts += rule.win; }
        }
        teamStats[team] = {wins, draws, pts, winPts: rule.win, drawPts: rule.draw};
      }

      return new Response(JSON.stringify({ ok:true, players, upcoming, teamStats, total: matches.length }), { headers: CORS });

    } catch(e) {
      return new Response(JSON.stringify({ ok:false, message: e.message }), { headers: CORS, status: 500 });
    }
  }
};
