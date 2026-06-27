let players = [
  {
    name: "ALBA",
    points: 70,
    img: "img/alba.png",
    shirt: "Escocia",
    number: 7,
    animal: "Búho",
    bio: "Le gustan las galletitas de dinosaurios y el viento en su séptimo piso.",
    teams: [["Argentina",0],["Inglaterra",0],["Colombia",0],["Suiza",30],["Japón",11],["Austria",0],["Escocia",0],["Egipto",14],["Australia",15],["RD Congo",0],["Curazao",0]]
  },
  {
    name: "XABIER",
    points: 131,
    img: "img/xabier.png",
    shirt: "Argentina",
    number: 6,
    animal: "Capibara",
    bio: "Le gusta hablar con personas desconocidas y con personas de la tercera edad.",
    teams: [["Argentina",0],["Alemania",0],["Marruecos",27],["Noruega",0],["USA",0],["México",36],["Costa de Marfil",39],["Egipto",14],["Australia",15],["RD Congo",0],["Curazao",0]]
  },
  {
    name: "LEIRE",
    points: 131,
    img: "img/leire.png",
    shirt: "España",
    number: 9,
    animal: "Pantera",
    bio: "Le gusta la Virgen del Pilar y la paloterapia.",
    teams: [["España",21],["Alemania",0],["Colombia",0],["Noruega",0],["Japón",11],["México",36],["Canadá",0],["Ghana",0],["Iran",15],["Sudáfrica",48],["Haití",0]]
  },
  {
    name: "ITOITZ",
    points: 86,
    img: "img/itoitz.png",
    shirt: "Francia",
    number: 8,
    animal: "Border Collie",
    bio: "Le gusta la bici, el Excel y hacer dominadas.",
    teams: [["Francia",21],["Inglaterra",0],["Colombia",0],["Noruega",0],["USA",0],["México",36],["Corea del Sur",0],["Egipto",14],["Australia",15],["RD Congo",0],["Curazao",0]]
  },
  {
    name: "ANE",
    points: 86,
    img: "img/ane.png",
    shirt: "México",
    number: 12,
    animal: "Setter inglés",
    bio: "Le gustan las motos y los perros.",
    teams: [["España",21],["Alemania",0],["Colombia",0],["Noruega",0],["USA",0],["México",36],["Corea del Sur",0],["Egipto",14],["Australia",15],["RD Congo",0],["Curazao",0]]
  },
  {
    name: "AITOR",
    points: 86,
    img: "img/aitor.png",
    shirt: "Brasil",
    number: 10,
    animal: "Sapo",
    bio: "DJ y residente en el Bukowski. Fanático de Andoni Brun.",
    teams: [["España",21],["Brasil",24],["Colombia",0],["Noruega",0],["USA",0],["Suecia",12],["Canadá",0],["Egipto",14],["Australia",15],["RD Congo",0],["Curazao",0]]
  }
];

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
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
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
    <h2>👑 Ahora va primero: <strong>${leaders}</strong></h2>
    <div style="font-family:Arial,sans-serif;font-weight:900;color:#073967;">
      ${ordered[0].points} puntos · reborde dorado activo
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
  document.getElementById("sheetMeta").textContent = `${p.animal} · camiseta ${p.shirt} #${p.number}`;
  document.getElementById("sheetPoints").textContent = p.points;
  document.getElementById("bioTitle").textContent = `${p.name} · ${p.animal}`;
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
  const random = Math.floor(Math.random() * players.length);
  const extra = Math.floor(Math.random() * 35) + 5;

  players[random].points += extra;

  document.getElementById("status").textContent =
    players[random].name + " suma +" + extra + " puntos. Ranking reordenado automáticamente.";

  render();
}

render();


let musicPlaying = false;

function startPorralab() {
  const intro = document.getElementById("intro");
  const audio = document.getElementById("himno");

  intro.classList.add("hidden");

  audio.play()
    .then(() => {
      musicPlaying = true;
      document.getElementById("musicToggle").textContent = "🔊 Himno";
    })
    .catch(() => {
      musicPlaying = false;
      document.getElementById("musicToggle").textContent = "🔇 Himno";
    });
}

function toggleMusic() {
  const audio = document.getElementById("himno");
  const button = document.getElementById("musicToggle");

  if (audio.paused) {
    audio.play().then(() => {
      musicPlaying = true;
      button.textContent = "🔊 Himno";
    }).catch(() => {
      button.textContent = "🔇 Himno";
    });
  } else {
    audio.pause();
    musicPlaying = false;
    button.textContent = "🔇 Himno";
  }
}
