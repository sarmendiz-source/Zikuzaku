const API_URL = "https://zikuzakuapi.sarmendiz.workers.dev/";

const TEAM_RULES = {
  "EspaÃ±a": { api: ["Spain"], win: 21, draw: 7 },
  "Francia": { api: ["France"], win: 21, draw: 7 },
  "Argentina": { api: ["Argentina"], win: 21, draw: 7 },
  "Portugal": { api: ["Portugal"], win: 21, draw: 7 },

  "Inglaterra": { api: ["England"], win: 24, draw: 8 },
  "Brasil": { api: ["Brazil"], win: 24, draw: 8 },
  "Alemania": { api: ["Germany"], win: 24, draw: 8 },
  "PaÃ­ses Bajos": { api: ["Netherlands"], win: 24, draw: 8 },

  "Marruecos": { api: ["Morocco"], win: 27, draw: 9 },
  "BÃ©lgica": { api: ["Belgium"], win: 27, draw: 9 },
  "Croacia": { api: ["Croatia"], win: 27, draw: 9 },
  "Colombia": { api: ["Colombia"], win: 27, draw: 9 },

  "Noruega": { api: ["Norway"], win: 30, draw: 10 },
  "Uruguay": { api: ["Uruguay"], win: 30, draw: 10 },
  "Senegal": { api: ["Senegal"], win: 30, draw: 10 },
  "Suiza": { api: ["Switzerland"], win: 30, draw: 10 },

  "JapÃ³n": { api: ["Japan"], win: 33, draw: 11 },
  "USA": { api: ["United States", "USA"], win: 33, draw: 11 },
  "Turquia": { api: ["Turkey", "TÃ¼rkiye"], win: 33, draw: 11 },
  "Ecuador": { api: ["Ecuador"], win: 33, draw: 11 },

  "Austria": { api: ["Austria"], win: 36, draw: 12 },
  "Suecia": { api: ["Sweden"], win: 36, draw: 12 },
  "Paraguay": { api: ["Paraguay"], win: 36, draw: 12 },
  "MÃ©xico": { api: ["Mexico"], win: 36, draw: 12 },

  "Corea del Sur": { api: ["South Korea", "Korea Republic"], win: 39, draw: 13 },
  "Escocia": { api: ["Scotland"], win: 39, draw: 13 },
  "Costa de Marfil": { api: ["Ivory Coast", "CÃ´te d'Ivoire"], win: 39, draw: 13 },
  "CanadÃ¡": { api: ["Canada"], win: 39, draw: 13 },

  "Bosnia": { api: ["Bosnia and Herzegovina", "Bosnia-Herzegovina"], win: 42, draw: 14 },
  "Republica Checa": { api: ["Czechia", "Czech Republic"], win: 42, draw: 14 },
  "Egipto": { api: ["Egypt"], win: 42, draw: 14 },
  "Ghana": { api: ["Ghana"], win: 42, draw: 14 },

  "Argelia": { api: ["Algeria"], win: 45, draw: 15 },
  "TÃºnez": { api: ["Tunisia"], win: 45, draw: 15 },
  "Australia": { api: ["Australia"], win: 45, draw: 15 },
  "Iran": { api: ["Iran"], win: 45, draw: 15 },

  "Arabia SaudÃ­": { api: ["Saudi Arabia"], win: 48, draw: 16 },
  "Qatar": { api: ["Qatar"], win: 48, draw: 16 },
  "RD Congo": { api: ["DR Congo", "Congo DR", "Congo"], win: 48, draw: 16 },
  "SudÃ¡frica": { api: ["South Africa"], win: 48, draw: 16 },

  "Nueva Zelanda": { api: ["New Zealand"], win: 51, draw: 17 },
  "UzbekistÃ¡n": { api: ["Uzbekistan"], win: 51, draw: 17 },
  "Cabo Verde": { api: ["Cape Verde"], win: 51, draw: 17 },
  "PanamÃ¡": { api: ["Panama"], win: 51, draw: 17 },

  "HaitÃ­": { api: ["Haiti"], win: 54, draw: 18 },
  "Curazao": { api: ["Curacao", "CuraÃ§ao"], win: 54, draw: 18 },
  "Iraq": { api: ["Iraq"], win: 54, draw: 18 },
  "Jordania": { api: ["Jordan"], win: 54, draw: 18 },
};

const ROUND_BONUS = {
  "LAST_32": 5,
  "ROUND_OF_32": 5,
  "LAST_16": 10,
  "ROUND_OF_16": 10,
  "QUARTER_FINALS": 15,
  "SEMI_FINALS": 20,
  "FINAL": 40,
  "THIRD_PLACE": 10,
};

let players = [
  {
    name: "ALBA",
    points: 0,
    img: "img/alba.png",
    shirt: "Escocia",
    number: 7,
    animal: "BÃºho",
    bio: "Le gustan las galletitas de dinosaurios y el viento en su sÃ©ptimo piso.",
    teams: [["Argentina",0],["Inglaterra",0],["Colombia",0],["Suiza",0],["JapÃ³n",0],["Austria",0],["Escocia",0],["Egipto",0],["Australia",0],["RD Congo",0],["Curazao",0]]
  },
  {
    name: "MIKEL XABIER",
    points: 0,
    img: "img/xabier.png",
    shirt: "Argentina",
    number: 6,
    animal: "Capibara",
    bio: "Le gusta hablar con personas desconocidas y con personas de la tercera edad.",
    teams: [["Argentina",0],["Alemania",0],["Marruecos",0],["Noruega",0],["USA",0],["MÃ©xico",0],["Costa de Marfil",0],["Egipto",0],["Australia",0],["RD Congo",0],["Curazao",0]]
  },
  {
    name: "LEIRE",
    points: 0,
    img: "img/leire.png",
    shirt: "EspaÃ±a",
    number: 9,
    animal: "Pantera",
    bio: "Le gusta la Virgen del Pilar y la paloterapia.",
    teams: [["EspaÃ±a",0],["Alemania",0],["Colombia",0],["Noruega",0],["JapÃ³n",0],["MÃ©xico",0],["CanadÃ¡",0],["Ghana",0],["Iran",0],["SudÃ¡frica",0],["HaitÃ­",0]]
  },
  {
    name: "ITOITZ",
    points: 0,
    img: "img/itoitz.png",
    shirt: "Francia",
    number: 8,
    animal: "Border Collie",
    bio: "Le gusta la bici, el Excel y hacer dominadas.",
    teams: [["Francia",0],["Inglaterra",0],["Colombia",0],["Noruega",0],["USA",0],["MÃ©xico",0],["Corea del Sur",0],["Egipto",0],["Australia",0],["RD Congo",0],["Curazao",0]]
  },
  {
    name: "ANE",
    points: 0,
    img: "img/ane.png",
    shirt: "MÃ©xico",
    number: 12,
    animal: "Setter inglÃ©s",
    bio: "Le gustan las motos y los perros.",
    teams: [["EspaÃ±a",0],["Alemania",0],["Colombia",0],["Noruega",0],["USA",0],["MÃ©xico",0],["Corea del Sur",0],["Egipto",0],["Australia",0],["RD Congo",0],["Curazao",0]]
  },
  {
    name: "AITOR",
    points: 0,
    img: "img/aitor.png",
    shirt: "Brasil",
    number: 10,
    animal: "Sapo",
    bio: "DJ y residente en el Bukowski. FanÃ¡tico de Andoni Brun.",
    teams: [["EspaÃ±a",0],["Brasil",0],["Colombia",0],["Noruega",0],["USA",0],["Suecia",0],["CanadÃ¡",0],["Egipto",0],["Australia",0],["RD Congo",0],["Curazao",0]]
  }
];

function normalizeName(name) {
  return String(name || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function teamMatchesPorraName(porraName, apiName) {
  const rule = TEAM_RULES[porraName];
  if (!rule) return normalizeName(porraName) === normalizeName(apiName);

  return rule.api.some(alias => normalizeName(alias) === normalizeName(apiName));
}

function getMatchWinnerName(match) {
  const winner = match?.score?.winner;
  if (winner === "HOME_TEAM") return match.homeTeam?.name;
  if (winner === "AWAY_TEAM") return match.awayTeam?.name;
  if (winner === "DRAW") return "DRAW";
  return null;
}

function isFinished(match) {
  return ["FINISHED", "AWARDED"].includes(match.status);
}

function getTeamResult(match, porraTeam) {
  const home = match.homeTeam?.name || "";
  const away = match.awayTeam?.name || "";
  const playsHome = teamMatchesPorraName(porraTeam, home);
  const playsAway = teamMatchesPorraName(porraTeam, away);

  if (!playsHome && !playsAway) return null;
  if (!isFinished(match)) return null;

  const winner = getMatchWinnerName(match);

  if (winner === "DRAW") return "draw";
  if (playsHome && winner === home) return "win";
  if (playsAway && winner === away) return "win";

  return "loss";
}

function getBonusForMatch(match, porraTeam, result) {
  if (result !== "win") return 0;

  const stage = match.stage || "";
  const bonus = ROUND_BONUS[stage] || 0;

  return bonus;
}

function calculatePointsFromMatches(matches) {
  players = players.map(player => {
    let total = 0;

    const updatedTeams = player.teams.map(([teamName]) => {
      const rule = TEAM_RULES[teamName] || { win: 0, draw: 0 };
      let teamPoints = 0;

      matches.forEach(match => {
        const result = getTeamResult(match, teamName);

        if (result === "win") {
          teamPoints += rule.win;
          teamPoints += getBonusForMatch(match, teamName, result);
        }

        if (result === "draw") {
          teamPoints += rule.draw;
        }
      });

      total += teamPoints;
      return [teamName, teamPoints];
    });

    return {
      ...player,
      points: total,
      teams: updatedTeams,
    };
  });
}

async function updateFromApi() {
  const status = document.getElementById("status");
  status.textContent = "Consultando resultados oficiales del Mundial...";

  try {
    const response = await fetch(API_URL);
    const data = await response.json();

    if (!data.ok) {
      throw new Error(data.message || "La API no ha devuelto datos vÃ¡lidos.");
    }

    calculatePointsFromMatches(data.matches || []);
    render();

    const now = new Date();
    status.textContent = "âœ… Puntos actualizados con resultados oficiales Â· " + now.toLocaleString("es-ES");
  } catch (error) {
    console.error(error);
    status.textContent = "âš ï¸ No se han podido actualizar los resultados. La web sigue funcionando con los Ãºltimos datos.";
  }
}

function sortedPlayers() {
  return [...players].sort((a, b) => b.points - a.points);
}

function getRanks(ordered) {
  let ranks = [];
  let lastPoints = null;
  let lastRank = 0;

  ordered.forEach((p, index) => {
    if (p.points !== lastPoints) {
      lastRank = index + 1;
      lastPoints = p.points;
    }

    ranks.push(lastRank);
  });

  return ranks;
}

function medalClass(rank) {
  if (rank === 1) return "first";
  if (rank === 2) return "second";
  if (rank === 3) return "third";
  return "";
}

function medalText(rank) {
  if (rank === 1) return "ðŸ¥‡";
  if (rank === 2) return "ðŸ¥ˆ";
  if (rank === 3) return "ðŸ¥‰";
  return rank;
}

function render() {
  const ordered = sortedPlayers();
  const ranks = getRanks(ordered);
  const leaders = ordered
    .filter(p => p.points === ordered[0].points)
    .map(p => p.name)
    .join(" y ");

  document.getElementById("leaderBanner").innerHTML = `
    <h2>ðŸ‘‘ Ahora va primero: <strong>${leaders}</strong></h2>
    <div style="font-family:Arial,sans-serif;font-weight:900;color:#073967;">
      ${ordered[0].points} puntos Â· reborde dorado activo
    </div>
  `;

  const ranking = document.getElementById("rankingBody");
  ranking.innerHTML = "";

  ordered.forEach((p, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${medalText(ranks[index])}</td><td>${p.name}</td><td>${p.points}</td>`;
    ranking.appendChild(tr);
  });

  const cards = document.getElementById("cards");
  cards.innerHTML = "";

  ordered.forEach((p, index) => {
    const card = document.createElement("button");
    card.className = "card " + medalClass(ranks[index]);
    card.onclick = () => openFicha(p.name);

    card.innerHTML = `
      <div class="rank-badge">${medalText(ranks[index])}</div>
      <img src="${p.img}" alt="${p.name}">
      <div class="points-tag">${p.points} pt</div>
    `;

    cards.appendChild(card);
  });
}

function openFicha(name) {
  const ordered = sortedPlayers();
  const ranks = getRanks(ordered);
  const p = ordered.find(x => x.name === name);
  const index = ordered.findIndex(x => x.name === name);
  const teamsWithPoints = p.teams.filter(t => t[1] > 0).length;
  const best = [...p.teams].sort((a, b) => b[1] - a[1])[0];

  document.getElementById("sheetImg").src = p.img;
  document.getElementById("sheetImg").alt = p.name;
  document.getElementById("sheetName").textContent = p.name;
  document.getElementById("sheetMeta").textContent = `${p.animal} Â· camiseta ${p.shirt} #${p.number}`;
  document.getElementById("sheetPoints").textContent = p.points;
  document.getElementById("bioTitle").textContent = `${p.name} Â· ${p.animal}`;
  document.getElementById("bioText").textContent = p.bio;
  document.getElementById("sheetRank").textContent = ranks[index];
  document.getElementById("sheetTeams").textContent = p.teams.length;
  document.getElementById("sheetActive").textContent = teamsWithPoints;
  document.getElementById("sheetBest").textContent = best[1];

  const rows = document.getElementById("sheetScoreRows");
  rows.innerHTML = "";

  p.teams.forEach(([team, pts]) => {
    const tr = document.createElement("tr");
    const estado = pts > 0 ? "Ha sumado" : "Pendiente";
    tr.innerHTML = `<td>${team}</td><td>${pts}</td><td>${estado}</td>`;
    rows.appendChild(tr);
  });

  document.getElementById("modal").classList.add("active");
}

function closeFicha() {
  document.getElementById("modal").classList.remove("active");
}

function demoChange() {
  updateFromApi();
}

render();
updateFromApi();

let musicPlaying = false;

function startPorralab() {
  const intro = document.getElementById("intro");
  const audio = document.getElementById("himno");

  intro.classList.add("hidden");

  audio.play()
    .then(() => {
      musicPlaying = true;
      document.getElementById("musicToggle").textContent = "ðŸ”Š Himno";
    })
    .catch(() => {
      musicPlaying = false;
      document.getElementById("musicToggle").textContent = "ðŸ”‡ Himno";
    });
}

function toggleMusic() {
  const audio = document.getElementById("himno");
  const button = document.getElementById("musicToggle");

  if (audio.paused) {
    audio.play().then(() => {
      musicPlaying = true;
      button.textContent = "ðŸ”Š Himno";
    }).catch(() => {
      button.textContent = "ðŸ”‡ Himno";
    });
  } else {
    audio.pause();
    musicPlaying = false;
    button.textContent = "ðŸ”‡ Himno";
  }
}
