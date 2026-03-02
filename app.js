// ─── NEX TV APP ───────────────────────────────────────────────────────────────

// ── Navigation ────────────────────────────────────────────────────────────────
function renderNav() {
  const session = DB.getSession();
  const authArea = document.getElementById('authArea');
  if (!authArea) return;

  if (session) {
    const initials = session.name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2);
    authArea.innerHTML = `
      <div class="user-menu" id="userMenu">
        <button class="avatar-btn" onclick="toggleUserMenu()">
          <div class="avatar-sm">${initials}</div>
          <span class="user-name-nav">${session.name.split(' ')[0]}</span>
          <i class="fas fa-chevron-down"></i>
        </button>
        <div class="dropdown" id="userDropdown">
          ${session.role==='admin'?'<a href="profile.html" class="dd-item"><i class="fas fa-shield-alt"></i> Admin Panel</a>':''}
          <a href="profile.html" class="dd-item"><i class="fas fa-user"></i> Profile</a>
          <a href="watchlist.html" class="dd-item"><i class="fas fa-bookmark"></i> My List</a>
          <div class="dd-divider"></div>
          <button class="dd-item dd-logout" onclick="doLogout()"><i class="fas fa-sign-out-alt"></i> Sign Out</button>
        </div>
      </div>`;
  } else {
    authArea.innerHTML = `
      <a href="login.html" class="btn-signin"><i class="fas fa-sign-in-alt"></i> Sign In</a>`;
  }

  // Hamburger
  const btn = document.getElementById('menuToggle');
  const links = document.getElementById('navLinks');
  if (btn && links) {
    btn.addEventListener('click', () => links.classList.toggle('open'));
  }

  // Sticky nav
  window.addEventListener('scroll', () => {
    const nav = document.getElementById('navbar');
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 50);
  });
}

function toggleUserMenu() {
  document.getElementById('userDropdown')?.classList.toggle('show');
}
document.addEventListener('click', e => {
  const menu = document.getElementById('userMenu');
  if (menu && !menu.contains(e.target)) {
    document.getElementById('userDropdown')?.classList.remove('show');
  }
});

function doLogout() { DB.logout(); window.location.href = 'index.html'; }

// ── Toast ──────────────────────────────────────────────────────────────────────
function showToast(msg, type='info') {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = 'toast show ' + type;
  setTimeout(() => t.classList.remove('show'), 3000);
}

// ── Password toggle ────────────────────────────────────────────────────────────
function togglePw(inputId, btn) {
  const input = document.getElementById(inputId);
  const icon = btn.querySelector('i');
  if (input.type === 'password') {
    input.type = 'text';
    icon.className = 'fas fa-eye-slash';
  } else {
    input.type = 'password';
    icon.className = 'fas fa-eye';
  }
}

// ── Movie Card ─────────────────────────────────────────────────────────────────
function makeCard(movie) {
  const session = DB.getSession();
  const inWL = session && DB.getUserById(session.id)?.watchlist?.includes(movie.id);
  return `<div class="movie-card" data-id="${movie.id}">
    <div class="card-poster">
      <img src="${movie.poster}" alt="${movie.title}" loading="lazy" onerror="this.onerror=null;this.src='https://placehold.co/300x450/1a1a2e/e50914?text='+encodeURIComponent(movie.title)"
           >
      <div class="card-overlay">
        <button class="card-play" onclick="openModal('${movie.id}')"><i class="fas fa-play"></i></button>
        <button class="card-wl ${inWL?'active':''}" onclick="handleWL(event,'${movie.id}')">
          <i class="${inWL?'fas':'far'} fa-bookmark"></i>
        </button>
      </div>
      <div class="card-rating"><i class="fas fa-star"></i> ${movie.rating}</div>
      <div class="card-category">${({series:'SERIES',anime:'ANIME',cartoons:'CARTOON',movies:'MOVIE'})[movie.category]||'MOVIE'}</div>
    </div>
    <div class="card-info">
      <h4 class="card-title">${movie.title}</h4>
      <span class="card-year">${movie.year} · ${movie.genre[0]}</span>
    </div>
  </div>`;
}

// ── Row (horizontal scroll) ────────────────────────────────────────────────────
function renderRow(containerId, movies) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = movies.map(makeCard).join('');
}

// ── Grid ────────────────────────────────────────────────────────────────────────
function renderGrid(containerId, movies) {
  const el = document.getElementById(containerId);
  if (!el) return;
  if (!movies.length) { el.innerHTML = '<p class="muted-text">No titles found.</p>'; return; }
  el.innerHTML = movies.map(makeCard).join('');
}

// ── Genres ─────────────────────────────────────────────────────────────────────
function renderGenres() {
  const el = document.getElementById('genreGrid');
  if (!el) return;
  const genres = ['Action','Drama','Sci-Fi','Thriller','Crime','Adventure','Horror','History','Fantasy','Comedy','Mystery','Animation'];
  const icons = {Action:'fa-bolt',Drama:'fa-theater-masks',
    'Sci-Fi':'fa-rocket',Thriller:'fa-exclamation-triangle',
    Crime:'fa-user-secret',Adventure:'fa-compass',Horror:'fa-skull',
    History:'fa-landmark',Fantasy:'fa-dragon'};
  el.innerHTML = genres.map(g=>`
    <a href="movies.html?genre=${g}" class="genre-chip">
      <i class="fas ${icons[g]||'fa-film'}"></i> ${g}
    </a>`).join('');
}

// ── Hero Slider ────────────────────────────────────────────────────────────────
let heroMovies = [], heroIdx = 0, heroTimer;
function renderHero() {
  // Pick exactly 5 featured movies for the hero (varied categories)
  const allFeatured = DB.getMovies().filter(m => m.featured);
  const picks = [];
  const cats = ['movies','series','anime','cartoons'];
  // Try to get one from each category first, then fill up to 5
  for (const cat of cats) {
    const match = allFeatured.find(m => m.category === cat && !picks.includes(m));
    if (match) picks.push(match);
  }
  while (picks.length < 5 && picks.length < allFeatured.length) {
    const next = allFeatured.find(m => !picks.includes(m));
    if (!next) break;
    picks.push(next);
  }
  heroMovies = picks.slice(0, 5);
  if (!heroMovies.length) return;
  const slidesEl = document.getElementById('heroSlides');
  const dotsEl = document.getElementById('heroDots');
  if (!slidesEl) return;

  slidesEl.innerHTML = heroMovies.map((m,i)=>`
    <div class="hero-slide ${i===0?'active':''}" style="background-image:url('${m.backdrop}')"></div>`).join('');

  if (dotsEl) dotsEl.innerHTML = heroMovies.map((_,i)=>
    `<span class="dot ${i===0?'active':''}" onclick="goHero(${i})"></span>`).join('');

  setHero(0);
  heroTimer = setInterval(()=>goHero((heroIdx+1)%heroMovies.length), 6000);
}

function setHero(idx) {
  heroIdx = idx;
  const m = heroMovies[idx];
  document.getElementById('heroTitle').textContent = m.title;
  document.getElementById('heroMeta').innerHTML =
    `<span><i class="fas fa-star" style="color:#f5c518"></i> ${m.rating}</span>
     <span>${m.year}</span><span>${m.duration}</span>
     <span>${m.genre.join(' · ')}</span>`;
  document.getElementById('heroDesc').textContent = m.description;

  const playBtn = document.getElementById('heroPlay');
  const moreBtn = document.getElementById('heroMore');
  if (playBtn) playBtn.onclick = () => window.location.href = `watch.html?id=${m.id}`;
  if (moreBtn) moreBtn.onclick = () => openModal(m.id);

  document.querySelectorAll('.hero-slide').forEach((s,i) => s.classList.toggle('active', i===idx));
  document.querySelectorAll('.dot').forEach((d,i) => d.classList.toggle('active', i===idx));
}

function goHero(idx) {
  clearInterval(heroTimer);
  setHero(idx);
  heroTimer = setInterval(()=>goHero((heroIdx+1)%heroMovies.length), 6000);
}

// ── Modal ──────────────────────────────────────────────────────────────────────
let currentModalId = null;
function openModal(id) {
  const m = DB.getMovie(id);
  if (!m) return;
  currentModalId = id;
  const session = DB.getSession();
  const inWL = session && DB.getUserById(session.id)?.watchlist?.includes(id);

  document.getElementById('modalPoster').src = m.poster;
  document.getElementById('modalPoster').onerror = function(){ this.src='https://placehold.co/300x450/1a1a2e/e50914?text='+encodeURIComponent(m.title); };
  document.getElementById('modalBackdrop').style.backgroundImage = `url('${m.backdrop}')`;
  document.getElementById('modalTitle').textContent = m.title;
  document.getElementById('modalMeta').innerHTML =
    `<span class="badge-year">${m.year}</span>
     <span class="badge-dur"><i class="fas fa-clock"></i> ${m.duration}</span>
     <span class="badge-rating"><i class="fas fa-star"></i> ${m.rating}</span>
     <span class="badge-dir"><i class="fas fa-video"></i> ${m.director}</span>`;
  document.getElementById('modalDesc').textContent = m.description;
  document.getElementById('modalCast').innerHTML = `<i class="fas fa-users"></i> <strong>Cast:</strong> ${m.cast.join(', ')}`;
  document.getElementById('modalPlay').onclick = () => { closeModal(); window.location.href = `watch.html?id=${id}`; };
  
  // Add/update trailer button
  let trailerBtn = document.getElementById('modalTrailer');
  if (!trailerBtn) {
    trailerBtn = document.createElement('button');
    trailerBtn.id = 'modalTrailer';
    trailerBtn.className = 'btn-trailer';
    trailerBtn.innerHTML = '<i class="fas fa-film"></i> Trailer';
    document.querySelector('.modal-actions')?.appendChild(trailerBtn);
  }
  trailerBtn.onclick = () => { closeModal(); openTrailer(id); };
  updateModalWL(inWL);

  document.getElementById('movieModal').classList.add('show');
  document.body.style.overflow = 'hidden';
}

function updateModalWL(inWL) {
  const btn = document.getElementById('modalWL');
  if (!btn) return;
  btn.innerHTML = inWL ? '<i class="fas fa-bookmark"></i> In My List' : '<i class="far fa-bookmark"></i> My List';
  btn.classList.toggle('active', inWL);
  btn.onclick = () => {
    const session = DB.getSession();
    if (!session) { window.location.href='login.html'; return; }
    DB.toggleWatchlist(session.id, currentModalId);
    const user = DB.getUserById(session.id);
    const nowIn = user?.watchlist?.includes(currentModalId);
    updateModalWL(nowIn);
    showToast(nowIn ? '✓ Added to My List' : 'Removed from My List');
  };
}

function closeModal() {
  document.getElementById('movieModal')?.classList.remove('show');
  document.body.style.overflow = '';
}

function handleWL(e, id) {
  e.stopPropagation();
  const session = DB.getSession();
  if (!session) { window.location.href='login.html'; return; }
  DB.toggleWatchlist(session.id, id);
  const user = DB.getUserById(session.id);
  const inWL = user?.watchlist?.includes(id);
  const btn = e.currentTarget;
  btn.className = 'card-wl ' + (inWL?'active':'');
  btn.innerHTML = `<i class="${inWL?'fas':'far'} fa-bookmark"></i>`;
  showToast(inWL ? '✓ Added to My List' : 'Removed from My List');
}

// Modal close events
document.addEventListener('DOMContentLoaded', () => {
  const mc = document.getElementById('modalClose');
  if (mc) mc.onclick = closeModal;
  const mo = document.getElementById('movieModal');
  if (mo) mo.addEventListener('click', e => { if (e.target === mo) closeModal(); });
});

// ── Most Searched ──────────────────────────────────────────────────────────────
// Curated "most searched" titles — mix of movies, anime, series, cartoons
const MOST_SEARCHED_IDS = [
  'm2','m3','m12','m71','m79','m77','m81','m80',   // movies
  'a1','a2','a3','a41','a42','a44','a47','a46',    // anime
  's1','s2','s3','s5',                             // series
  'c40','c41','c43','c1'                           // cartoons
];

function renderMostSearched(containerId, allMovies) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const picks = MOST_SEARCHED_IDS
    .map(id => allMovies.find(m => m.id === id))
    .filter(Boolean);
  el.innerHTML = picks.map((m, i) => {
    const session = DB.getSession();
    const inWL = session && DB.getUserById(session.id)?.watchlist?.includes(m.id);
    const rankColors = ['#e50914','#e50914','#ff6b35','#ff6b35','#ffd700','#ffd700','#aaa','#aaa','#aaa','#aaa','#aaa','#aaa','#aaa','#aaa','#aaa','#aaa','#aaa','#aaa','#aaa','#aaa','#aaa'];
    return `
    <div class="ms-card" data-id="${m.id}" onclick="openModal('${m.id}')">
      <div class="ms-rank" style="color:${rankColors[i]||'#aaa'}">${i + 1}</div>
      <div class="ms-poster">
        <img src="${m.poster}" alt="${m.title}" loading="lazy"
             onerror="this.onerror=null;this.src='https://placehold.co/120x180/1a1a2e/e50914?text='+encodeURIComponent('${m.title.substring(0,10)}')">
        <div class="ms-overlay">
          <button class="ms-play" onclick="event.stopPropagation();window.location.href='watch.html?id=${m.id}'">
            <i class="fas fa-play"></i>
          </button>
        </div>
      </div>
      <div class="ms-info">
        <h4 class="ms-title">${m.title}</h4>
        <div class="ms-meta">
          <span>${m.year}</span>
          <span class="ms-rating"><i class="fas fa-star"></i> ${m.rating}</span>
        </div>
        <span class="ms-cat ${m.category}">${({series:'SERIES',anime:'ANIME',cartoons:'CARTOON',movies:'MOVIE'})[m.category]||'MOVIE'}</span>
      </div>
    </div>`;
  }).join('');
}

// ── Top Rated Row (with rank numbers) ─────────────────────────────────────────
function renderTopRated(containerId, movies) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = movies.map((m, i) => {
    const session = DB.getSession();
    const inWL = session && DB.getUserById(session.id)?.watchlist?.includes(m.id);
    return `<div class="movie-card rank-card" data-id="${m.id}">
      <div class="rank-badge">#${i+1}</div>
      <div class="card-poster">
        <img src="${m.poster}" alt="${m.title}" loading="lazy"
             onerror="this.onerror=null;this.src='https://placehold.co/300x450/1a1a2e/e50914?text='+encodeURIComponent(m.title)">
        <div class="card-overlay">
          <button class="card-play" onclick="openModal('${m.id}')"><i class="fas fa-play"></i></button>
          <button class="card-wl ${inWL?'active':''}" onclick="handleWL(event,'${m.id}')">
            <i class="${inWL?'fas':'far'} fa-bookmark"></i>
          </button>
        </div>
        <div class="card-rating"><i class="fas fa-star"></i> ${m.rating}</div>
        <div class="card-category">${({series:'SERIES',anime:'ANIME',cartoons:'CARTOON',movies:'MOVIE'})[m.category]||'MOVIE'}</div>
      </div>
      <div class="card-info">
        <h4 class="card-title">${m.title}</h4>
        <span class="card-year">${m.year} · ${m.genre[0]}</span>
      </div>
    </div>`;
  }).join('');
}

// ── Featured Collections ───────────────────────────────────────────────────────
const COLLECTIONS = [
  { title:'Christopher Nolan Universe', icon:'fa-brain', color:'#1a6bc4',
    ids:['m1','m2','m3','m13','m70'], desc:'Mind-bending masterpieces from cinema\'s greatest visionary.' },
  { title:'Marvel Cinematic Universe', icon:'fa-shield-alt', color:'#b31010',
    ids:['m5','m6','m86','m87','m11','m90','m92','m76'], desc:'Earth\'s mightiest heroes. One legendary universe.' },
  { title:'Anime Legends', icon:'fa-dragon', color:'#c47d16',
    ids:['a1','a2','a60','a59','a58','a47'], desc:'The greatest anime ever created — all in one place.' },
  { title:'Crime & Thriller Greats', icon:'fa-user-secret', color:'#2d6b4f',
    ids:['m12','m9','m2','m18','m19','m8'], desc:'Edge-of-your-seat tension from Hollywood\'s finest.' },
];

function renderCollections() {
  const el = document.getElementById('collectionsGrid');
  if (!el) return;
  const all = DB.getMovies();
  el.innerHTML = COLLECTIONS.map(col => {
    const movies = col.ids.map(id => all.find(m=>m.id===id)).filter(Boolean);
    const posters = movies.slice(0,4);
    return `<div class="collection-card" onclick="openCollectionModal('${col.ids.join(',')}','${col.title}')">
      <div class="collection-bg" style="background:linear-gradient(135deg,${col.color}22,${col.color}44);">
        <div class="collection-posters">
          ${posters.map((m,i)=>`<img src="${m.poster}" alt="${m.title}" style="transform:rotate(${(i-1.5)*6}deg) translateY(${Math.abs(i-1.5)*8}px);" loading="lazy">`).join('')}
        </div>
        <div class="collection-icon" style="color:${col.color};"><i class="fas ${col.icon}"></i></div>
      </div>
      <div class="collection-info">
        <h3>${col.title}</h3>
        <p>${col.desc}</p>
        <span class="collection-count">${movies.length} titles</span>
      </div>
    </div>`;
  }).join('');
}

function openCollectionModal(idsStr, title) {
  const ids = idsStr.split(',');
  const all = DB.getMovies();
  const movies = ids.map(id=>all.find(m=>m.id===id)).filter(Boolean);
  // Re-use existing modal system — show first movie's modal as a gateway
  if (movies.length) openModal(movies[0].id);
}

// ── Staff Picks ────────────────────────────────────────────────────────────────
const STAFF_PICKS = [
  { id:'m1',  quote:'A masterpiece of human emotion set against the cosmos.' },
  { id:'a60', quote:'The greatest adventure anime ever conceived.' },
  { id:'m96', quote:'Brilliant satire wrapped in a pink bow.' },
  { id:'c41', quote:'Raises the bar for adult animation permanently.' },
  { id:'m88', quote:'The most fun you\'ll have watching a movie this year.' },
  { id:'a59', quote:'Jaw-dropping action with a story that hits deep.' },
];

function renderStaffPicks() {
  const el = document.getElementById('staffPicksGrid');
  if (!el) return;
  const all = DB.getMovies();
  el.innerHTML = STAFF_PICKS.map(pick => {
    const m = all.find(x=>x.id===pick.id);
    if (!m) return '';
    return `<div class="staff-card" onclick="openModal('${m.id}')">
      <div class="staff-poster" style="background-image:url('${m.backdrop}')">
        <div class="staff-overlay">
          <button class="staff-play" onclick="event.stopPropagation();window.location.href='watch.html?id=${m.id}'">
            <i class="fas fa-play"></i> Watch
          </button>
        </div>
        <div class="staff-ribbon"><i class="fas fa-hand-sparkles"></i> Staff Pick</div>
      </div>
      <div class="staff-info">
        <img src="${m.poster}" alt="${m.title}" class="staff-mini-poster">
        <div>
          <h4>${m.title}</h4>
          <span class="staff-year">${m.year} · <i class="fas fa-star" style="color:#f5c518;font-size:.7rem;"></i> ${m.rating}</span>
          <p class="staff-quote">"${pick.quote}"</p>
        </div>
      </div>
    </div>`;
  }).join('');
}

// ── Origin Filter ──────────────────────────────────────────────────────────────
const ORIGIN_MAP = {
  us: ['m1','m2','m3','m5','m6','m7','m8','m9','m10','m11','m12','m13','m14','m15','m16','m17','m18','m19','m86','m87','m88','m89','m90','m91','m92','m93','m96','s1','s2','s3','s4','c40','c41','c49','c50','c51','c56'],
  jp: ['a1','a2','a3','a4','a5','a6','a40','a41','a42','a43','a44','a45','a46','a47','a48','a49','a50','a51','a52','a53','a54','a55','a56','a57','a58','a59','a60'],
  kr: ['m4','s10','s11'],
  uk: ['m91','s5','m78'],
};

function filterOrigin(btn, origin) {
  document.querySelectorAll('.origin-tab').forEach(t=>t.classList.remove('active'));
  btn.classList.add('active');
  const all = DB.getMovies();
  let movies;
  if (origin === 'all') {
    movies = [...all].sort(()=>Math.random()-0.5).slice(0,12);
  } else {
    const ids = ORIGIN_MAP[origin] || [];
    movies = ids.map(id=>all.find(m=>m.id===id)).filter(Boolean);
  }
  renderRow('originRow', movies);
}

// ── Trailers Row ───────────────────────────────────────────────────────────────
function renderTrailersRow(containerId, movies) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = movies.map(m => `
    <div class="trailer-card" onclick="openTrailer('${m.id}')">
      <div class="trailer-thumb" style="background-image:url('${m.backdrop}')">
        <div class="trailer-play-icon"><i class="fas fa-play-circle"></i></div>
        <div class="trailer-label">TRAILER</div>
      </div>
      <div class="trailer-info">
        <h4>${m.title}</h4>
        <span>${m.year} · ${m.genre[0]}</span>
      </div>
    </div>`).join('');
}


// Map of movie/show IDs to YouTube trailer embed IDs
const TRAILER_MAP = {
  // Movies
  'm1':'gEU2QniE6E77NI6lCU6MxlNBvIx',  // placeholder, use video IDs below
};

// YouTube trailer IDs by tmdbId
const TRAILER_YOUTUBE = {
  '157336':'zSWdZVtXT7E', // Interstellar
  '272':'EXeTwQWrcwY',    // The Dark Knight
  '27205':'YoHD9XEInc0',  // Inception
  '496243':'5xH0HfJHsaY', // Parasite
  '299536':'6ZfuNTqbHE8', // Infinity War
  '299534':'TcMBFSGVi1c', // Endgame
  '438631':'n9xhJrPXop4', // Dune
  '278':'6hB3S9bIaco',    // Shawshank
  '680':'s7EdQ4FqbhY',    // Pulp Fiction
  '245891':'C0BMx-qxsP4', // John Wick
  '634649':'JfVOs4VSpmA', // Spider-Man NWH
  '238':'sY1S34973zA',    // Godfather
  '872585':'uYPbbksJxIg', // Oppenheimer
  '361743':'qSqVVswa420', // Top Gun Maverick
  '19995':'5PSNL1qE6VY',  // Avatar
  '98':'iJRVNBEYVZ0',     // Gladiator
  '603':'m8e-FF8MsqU',    // The Matrix
  '475557':'zAGVQLHvwOY', // Joker
  '550':'SUXWAEX2jlg',    // Fight Club
  '424':'9l6PB8FBfQ4',    // Schindler's List
  // Series
  '1396':'HhesaQXLuRY',   // Breaking Bad
  '1399':'KPLWWIOCOOQ',   // Game of Thrones
  '66732':'oqxAJKy0ii4',  // Stranger Things
  '76479':'KpYKJWzBqA0',  // The Boys
  '1100':'0as2D6CKqOI',   // How I Met Your Mother
  '85271':'q4-9GV5Zols',  // WandaVision
  '84773':'f_WMkFNbQJ4',  // Witcher
  '63174':'gO-YBBjkL2g',  // Suits
  // Anime
  '46298':'wqzGFkUsJ50',  // Death Note
  '31911':'VNmiZ47MEqM',  // Fullmetal Alchemist
  '37854':'MGRm4IzK1SQ',  // One Piece
  '30984':'eTRFpb1lO_0',  // Bleach
  '85937':'oqxAJKy0ii4',  // Demon Slayer
  // Cartoons/Animation
  '10194':'GSI1F_n01G8',  // Toy Story
  '920':'vgwzPBQewOI',    // Cars
  '862':'uXLsu5oqKiY',    // Toy Story 1
  // Extra anime
  '72636':'AhvBnHbNhxc',  // Tokyo Revengers
  '65667':'e7RZvFGUBXI',  // Black Clover
  '91239':'_mfJxKuEzBs',  // Dr. Stone
  '80462':'6ohYYtZr684',  // Sword Art Online
  '84922':'pkKu9hLT3Q4',  // Jujutsu Kaisen
  '36881':'wLODxJsKalQ',  // Hunter x Hunter
  '58510':'MGRm4IzK1SQ',  // My Hero Academia
  '85937':'aO2P4vjTr14',  // Re:Zero
  // Extra movies
  '24428':'eOrNdBpGMv8',  // The Avengers
  '1726':'8ugaeA-ntzY',   // Iron Man
  '569094':'cqGjhVJWtEg', // Spider-Verse
  '550988':'rrwycJ08PSA', // Free Guy
  '346698':'pBk4NYhWNMM', // Barbie
  '136797':'BIhNsAtPbPI', // No Time to Die
  '447365':'un-pTRzzvTk', // Guardians 3
  '533535':'FJT3jnZ-d3o', // Deadpool & Wolverine
  '872585':'uYPbbksJxIg', // Oppenheimer (dup ok)
  // Extra cartoons
  '68507':'vqCmnCBQbRU',  // Invincible
  '79008':'4IfMiPfCLmo',  // Legend of Korra
  '153313':'Pke_D5G5rj0', // The Owl House
  '1434':'zFfOcye6jmQ',   // Gravity Falls (tmdb c55 uses same id as American Dad - mapping by tmdbId in trailer func)
  '44006':'it0SF4CMR5A',  // Adventure Time
  '60574':'vL_2IgYMTZI',  // Steven Universe
};

function openTrailer(movieId) {
  const m = DB.getMovie(movieId);
  if (!m) return;
  const ytId = TRAILER_YOUTUBE[m.tmdbId];
  
  // Remove existing trailer modal if any
  const existing = document.getElementById('trailerModal');
  if (existing) existing.remove();

  // Always use YouTube — either a known trailer ID or search for it
  const src = ytId 
    ? `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`
    : `https://www.youtube.com/results?search_query=${encodeURIComponent(m.title + ' official trailer ' + m.year)}`;
  
  // If no ytId, open YouTube search in new tab instead of broken embed
  if (!ytId) {
    window.open(src, '_blank');
    showToast('Opening trailer on YouTube...');
    return;
  }

  const modal = document.createElement('div');
  modal.id = 'trailerModal';
  modal.style.cssText = `
    position:fixed;inset:0;background:rgba(0,0,0,.92);z-index:9999;
    display:flex;flex-direction:column;align-items:center;justify-content:center;
    padding:1rem;
  `;
  modal.innerHTML = `
    <div style="width:100%;max-width:900px;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.75rem;">
        <div style="font-family:'Bebas Neue',sans-serif;font-size:1.6rem;letter-spacing:.05em;">
          <span style="color:#e50914;">▶</span> ${m.title} — Official Trailer
        </div>
        <button onclick="document.getElementById('trailerModal').remove();document.body.style.overflow='';"
          style="background:rgba(255,255,255,.1);border:none;color:#fff;font-size:1.4rem;
                 width:42px;height:42px;border-radius:50%;cursor:pointer;line-height:1;">✕</button>
      </div>
      <div style="position:relative;aspect-ratio:16/9;background:#000;border-radius:10px;overflow:hidden;">
        <iframe src="${src}" style="width:100%;height:100%;border:none;"
          allow="autoplay;fullscreen;encrypted-media" allowfullscreen></iframe>
      </div>
      <div style="margin-top:.75rem;display:flex;gap:.75rem;justify-content:center;">
        <button onclick="closeTrailerAndWatch('${m.id}')"
          style="background:#e50914;border:none;color:#fff;padding:.65rem 1.8rem;
                 border-radius:8px;font-family:'Outfit',sans-serif;font-weight:700;
                 font-size:.95rem;cursor:pointer;display:flex;align-items:center;gap:.5rem;">
          <i class="fas fa-play"></i> Watch Full Movie
        </button>
      </div>
    </div>
  `;
  modal.addEventListener('click', e => { if (e.target === modal) { modal.remove(); document.body.style.overflow=''; }});
  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';
}

function closeTrailerAndWatch(id) {
  const modal = document.getElementById('trailerModal');
  if (modal) modal.remove();
  document.body.style.overflow = '';
  window.location.href = `watch.html?id=${id}`;
}

// ════════════════════════════════════════════════════════════════
// NEXTV 2.0 — ALL NEW FEATURES
// ════════════════════════════════════════════════════════════════

// ── NOTIFICATION SYSTEM ───────────────────────────────────────
const NOTIFICATIONS = [
  { id:'n1', type:'new-ep', icon:'fa-tv', title:'New Episodes Available', body:'Stranger Things S5 just dropped!', unread:true, time:'2m ago' },
  { id:'n2', type:'new-title', icon:'fa-film', title:'Just Added', body:'Dune: Part Two is now streaming for free', unread:true, time:'1h ago' },
  { id:'n3', type:'trending', icon:'fa-fire', title:'Trending Now', body:'Oppenheimer is #1 in your region today', unread:true, time:'3h ago' },
  { id:'n4', type:'new-title', icon:'fa-certificate', title:'New Release', body:'Spider-Man: No Way Home added this week', unread:false, time:'2d ago' },
  { id:'n5', type:'new-ep', icon:'fa-dragon', title:'Anime Update', body:'Attack on Titan final arc is now complete', unread:false, time:'5d ago' },
];

function renderNotifBtn() {
  const navRight = document.querySelector('.nav-right');
  if (!navRight || document.getElementById('notifBtn')) return;
  
  const stored = JSON.parse(localStorage.getItem('nextv_notifs') || 'null') || NOTIFICATIONS;
  const unreadCount = stored.filter(n=>n.unread).length;
  
  const wrapper = document.createElement('div');
  wrapper.style.position = 'relative';
  wrapper.innerHTML = `
    <button class="notif-btn" id="notifBtn" onclick="toggleNotifPanel()">
      <i class="fas fa-bell"></i>
      ${unreadCount > 0 ? '<span class="notif-dot"></span>' : ''}
    </button>
    <div class="notif-panel" id="notifPanel">
      <div class="notif-header">
        <h4><i class="fas fa-bell" style="color:var(--red);margin-right:.4rem;"></i> Notifications</h4>
        <button class="notif-mark-all" onclick="markAllRead()">Mark all read</button>
      </div>
      <div class="notif-list" id="notifList"></div>
      <div class="notif-footer"><a href="#" onclick="return false;">View all notifications</a></div>
    </div>`;
  
  const searchIcon = navRight.querySelector('.nav-icon');
  navRight.insertBefore(wrapper, searchIcon);
  renderNotifList();
}

function renderNotifList() {
  const el = document.getElementById('notifList');
  if (!el) return;
  const stored = JSON.parse(localStorage.getItem('nextv_notifs') || 'null') || NOTIFICATIONS;
  el.innerHTML = stored.map(n => `
    <div class="notif-item ${n.unread?'unread':''}" onclick="readNotif('${n.id}')">
      <div class="notif-ico ${n.type}"><i class="fas ${n.icon}"></i></div>
      <div class="notif-body">
        <strong>${n.title}</strong>
        <span>${n.body}</span><br>
        <span style="color:var(--muted);font-size:.7rem;">${n.time}</span>
      </div>
    </div>`).join('');
}

function toggleNotifPanel() {
  const panel = document.getElementById('notifPanel');
  panel?.classList.toggle('show');
}

function markAllRead() {
  let notifs = JSON.parse(localStorage.getItem('nextv_notifs') || 'null') || NOTIFICATIONS;
  notifs = notifs.map(n=>({...n, unread:false}));
  localStorage.setItem('nextv_notifs', JSON.stringify(notifs));
  document.querySelector('.notif-dot')?.remove();
  renderNotifList();
  showToast('All notifications marked as read');
}

function readNotif(id) {
  let notifs = JSON.parse(localStorage.getItem('nextv_notifs') || 'null') || NOTIFICATIONS;
  notifs = notifs.map(n => n.id===id ? {...n, unread:false} : n);
  localStorage.setItem('nextv_notifs', JSON.stringify(notifs));
  renderNotifList();
}

document.addEventListener('click', e => {
  const nb = document.getElementById('notifBtn');
  const np = document.getElementById('notifPanel');
  if (nb && np && !nb.closest('div').contains(e.target)) {
    np.classList.remove('show');
  }
});

// ── PWA INSTALL BANNER ────────────────────────────────────────
let pwaInstallEvent = null;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  pwaInstallEvent = e;
  if (!localStorage.getItem('nextv_pwa_dismissed')) {
    setTimeout(() => {
      const banner = document.getElementById('pwa-banner');
      if (banner) banner.classList.add('show');
    }, 3000);
  }
});

function installPWA() {
  if (pwaInstallEvent) {
    pwaInstallEvent.prompt();
    pwaInstallEvent.userChoice.then(r => {
      if (r.outcome === 'accepted') {
        showToast('🎉 NexTV installed! Check your home screen.');
      }
      document.getElementById('pwa-banner')?.classList.remove('show');
    });
  } else {
    showToast('💡 Tip: Use your browser menu → "Add to Home Screen" to install NexTV!');
  }
}

function dismissPWA() {
  localStorage.setItem('nextv_pwa_dismissed', '1');
  document.getElementById('pwa-banner')?.classList.remove('show');
}

// ── MOOD BROWSER ──────────────────────────────────────────────
const MOOD_CONFIG = {
  happy: { emoji:'😄', label:'Happy', genres:['Comedy','Animation','Adventure'], color:'#f5c518' },
  thrilling: { emoji:'😱', label:'Thrilling', genres:['Thriller','Horror','Crime'], color:'#e50914' },
  chill: { emoji:'😌', label:'Chill', genres:['Drama','Romance','Fantasy'], color:'#00d4b4' },
  emotional: { emoji:'😢', label:'Emotional', genres:['Drama','History','War'], color:'#8b5cf6' },
  action: { emoji:'💥', label:'Action', genres:['Action','Sci-Fi','Adventure'], color:'#f97316' },
  mystery: { emoji:'🕵️', label:'Mystery', genres:['Mystery','Crime','Thriller'], color:'#64748b' },
};

function renderMoodSection() {
  const el = document.getElementById('moodGrid');
  if (!el) return;
  el.innerHTML = Object.entries(MOOD_CONFIG).map(([key, m]) => `
    <div class="mood-card" data-mood="${key}" onclick="browseMood('${key}')">
      <span class="mood-emoji">${m.emoji}</span>
      <span class="mood-label" style="color:${m.color}">${m.label}</span>
    </div>`).join('');
}

function browseMood(mood) {
  const config = MOOD_CONFIG[mood];
  const all = DB.getMovies();
  const results = all.filter(m => m.genre.some(g => config.genres.includes(g)))
    .sort((a,b)=>b.rating-a.rating).slice(0,12);
  
  const resultsEl = document.getElementById('moodResults');
  const labelEl = document.getElementById('moodResultLabel');
  if (!resultsEl || !labelEl) return;
  
  labelEl.innerHTML = `${config.emoji} Feeling ${config.label}? Here are ${results.length} picks for you`;
  renderRow('moodResultsRow', results);
  resultsEl.classList.add('show');
  resultsEl.scrollIntoView({ behavior:'smooth', block:'nearest' });
  
  document.querySelectorAll('.mood-card').forEach(c=>c.style.opacity=c.dataset.mood===mood?'1':'.5');
}

function closeMoodResults() {
  document.getElementById('moodResults')?.classList.remove('show');
  document.querySelectorAll('.mood-card').forEach(c=>c.style.opacity='1');
}

// ── SHUFFLE / "I'M FEELING LUCKY" ─────────────────────────────
function shufflePlay() {
  const all = DB.getMovies();
  const random = all[Math.floor(Math.random()*all.length)];
  if (!random) return;
  showToast(`🎲 Opening: ${random.title}`);
  setTimeout(() => window.location.href = `watch.html?id=${random.id}`, 800);
}

function renderShuffleSection() {
  const el = document.getElementById('shuffleSection');
  if (!el) return;
  const all = DB.getMovies();
  const previews = [...all].sort(()=>Math.random()-0.5).slice(0,6);
  el.innerHTML = `
    <div class="shuffle-card">
      <div>
        <div class="shuffle-text">
          <h3><i class="fas fa-shuffle" style="color:var(--red);"></i> Can't Decide? Let Us Choose!</h3>
          <p>Hit shuffle and we'll pick something great from our 198+ title library.</p>
        </div>
        <div class="shuffle-preview">
          ${previews.map(m=>`<img src="${m.poster}" class="shuffle-mini-poster" alt="${m.title}" onclick="openModal('${m.id}')" title="${m.title}" loading="lazy">`).join('')}
        </div>
      </div>
      <button class="btn-shuffle" onclick="shufflePlay()">
        <i class="fas fa-shuffle"></i> Surprise Me!
      </button>
    </div>`;
}

// ── PERSONALIZED RECOMMENDATIONS ─────────────────────────────
function renderPersonalizedRow() {
  const session = DB.getSession();
  const el = document.getElementById('personalizedSection');
  if (!el) return;
  
  if (!session) { el.style.display='none'; return; }
  
  const user = DB.getUserById(session.id);
  const history = user?.watchHistory || [];
  
  if (history.length < 2) { el.style.display='none'; return; }
  
  const all = DB.getMovies();
  const watchedIds = history.map(h=>h.movieId);
  const watchedMovies = watchedIds.map(id=>all.find(m=>m.id===id)).filter(Boolean);
  
  // Find top genres from history
  const genreCounts = {};
  watchedMovies.forEach(m => m.genre.forEach(g => { genreCounts[g]=(genreCounts[g]||0)+1; }));
  const topGenres = Object.entries(genreCounts).sort((a,b)=>b[1]-a[1]).slice(0,3).map(e=>e[0]);
  
  // Find movies not yet watched, matching top genres
  const recs = all
    .filter(m => !watchedIds.includes(m.id) && m.genre.some(g=>topGenres.includes(g)))
    .sort((a,b)=>b.rating-a.rating).slice(0,10);
  
  if (!recs.length) { el.style.display='none'; return; }
  
  const firstName = session.name.split(' ')[0];
  document.getElementById('personalizedTitle').textContent = `Because You Watch ${topGenres[0]} · For ${firstName}`;
  renderRow('personalizedRow', recs);
  el.style.display='block';
}

// ── WATCH PARTY ───────────────────────────────────────────────
function openWatchParty() {
  const session = DB.getSession();
  if (!session) { window.location.href='login.html'; return; }
  
  // Generate room code
  const code = Math.random().toString(36).substr(2,6).toUpperCase();
  const shareUrl = `${window.location.origin}${window.location.pathname}?party=${code}`;
  
  const modal = document.getElementById('watchPartyModal');
  const codeEl = document.getElementById('partyCode');
  const urlEl = document.getElementById('partyShareUrl');
  if (modal && codeEl) {
    codeEl.textContent = code;
    if (urlEl) urlEl.textContent = shareUrl;
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
}

function closeWatchParty() {
  document.getElementById('watchPartyModal')?.classList.remove('show');
  document.body.style.overflow = '';
}

function copyPartyCode() {
  const code = document.getElementById('partyCode')?.textContent || '';
  const shareUrl = document.getElementById('partyShareUrl')?.textContent || '';
  navigator.clipboard?.writeText(`Join my NexTV Watch Party! Room: ${code}\n${shareUrl}`)
    .then(()=>showToast('📋 Invite link copied! Share with friends'))
    .catch(()=>showToast(`Room Code: ${code}`));
}

// ── USER REVIEWS ──────────────────────────────────────────────
const SAMPLE_REVIEWS = [
  { user:'Alex K.', color:'#e50914', movie:'Interstellar', movieId:'m1', stars:5, text:'Absolutely mind-blowing. The emotional weight combined with the sci-fi elements makes this the greatest film ever made.', date:'2d ago' },
  { user:'Priya M.', color:'#8b5cf6', movie:'Attack on Titan', movieId:'a2', stars:5, text:'The finale genuinely left me speechless. No show has ever affected me this deeply. A masterpiece of anime storytelling.', date:'5d ago' },
  { user:'Jake T.', color:'#00d4b4', movie:'The Dark Knight', movieId:'m2', stars:5, text:"Heath Ledger's Joker transcends acting. This movie defined an entire generation of superhero films.", date:'1w ago' },
  { user:'Sofia R.', color:'#f97316', movie:'Parasite', movieId:'m4', stars:5, text:'Watching this in English then rewatching with subtitles completely changed my perspective. Bong is a genius.', date:'2w ago' },
];

function renderReviewsSection() {
  const el = document.getElementById('reviewsList');
  if (!el) return;
  
  const stored = JSON.parse(localStorage.getItem('nextv_reviews') || '[]');
  const all = [...stored, ...SAMPLE_REVIEWS];
  
  el.innerHTML = all.slice(0,4).map(r => `
    <div class="review-card fade-in-up">
      <div class="review-movie-title"><i class="fas fa-film"></i> ${r.movie}</div>
      <div class="review-header">
        <div class="reviewer">
          <div class="reviewer-avatar" style="background:${r.color}">${r.user[0]}</div>
          <div>
            <div class="reviewer-name">${r.user}</div>
            <div class="reviewer-date">${r.date}</div>
          </div>
        </div>
        <div class="review-stars">${'★'.repeat(r.stars)}${'☆'.repeat(5-r.stars)}</div>
      </div>
      <p class="review-text">${r.text}</p>
    </div>`).join('');
}

function openWriteReview() {
  const session = DB.getSession();
  if (!session) { window.location.href='login.html'; return; }
  const modal = document.getElementById('writeReviewModal');
  if (modal) { modal.classList.add('show'); document.body.style.overflow='hidden'; }
}

function closeWriteReview() {
  document.getElementById('writeReviewModal')?.classList.remove('show');
  document.body.style.overflow='';
}

function submitReview() {
  const session = DB.getSession();
  if (!session) return;
  const stars = document.querySelectorAll('.star-pick.lit').length;
  const text = document.getElementById('reviewText')?.value?.trim();
  const movieSel = document.getElementById('reviewMovieSelect');
  const selectedOption = movieSel?.options[movieSel?.selectedIndex];
  const movieTitle = selectedOption?.text;
  const movieId = movieSel?.value;
  
  if (!stars) { showToast('Please select a star rating', 'error'); return; }
  if (!text || text.length < 10) { showToast('Write at least 10 characters', 'error'); return; }
  if (!movieId) { showToast('Please select a movie/show', 'error'); return; }
  
  const review = {
    user: session.name.split(' ')[0] + ' ' + session.name.split(' ')[1]?.[0] + '.',
    color: '#e50914', movie: movieTitle, movieId,
    stars, text, date: 'Just now'
  };
  
  const stored = JSON.parse(localStorage.getItem('nextv_reviews') || '[]');
  stored.unshift(review);
  localStorage.setItem('nextv_reviews', JSON.stringify(stored));
  
  closeWriteReview();
  renderReviewsSection();
  showToast('✓ Review posted! Thanks for sharing.');
}

let selectedStars = 0;
function setupStarPicker() {
  const stars = document.querySelectorAll('.star-pick');
  stars.forEach((star, i) => {
    star.addEventListener('click', () => {
      selectedStars = i+1;
      stars.forEach((s,j) => s.classList.toggle('lit', j<=i));
    });
    star.addEventListener('mouseenter', () => {
      stars.forEach((s,j) => s.classList.toggle('lit', j<=i));
    });
    star.addEventListener('mouseleave', () => {
      stars.forEach((s,j) => s.classList.toggle('lit', j<selectedStars));
    });
  });
}

function populateReviewMovieSelect() {
  const sel = document.getElementById('reviewMovieSelect');
  if (!sel) return;
  const all = DB.getMovies();
  const session = DB.getSession();
  const user = session ? DB.getUserById(session.id) : null;
  const history = user?.watchHistory || [];
  
  // Sort by history first, then all
  const histIds = history.map(h=>h.movieId);
  const histMovies = histIds.map(id=>all.find(m=>m.id===id)).filter(Boolean);
  const otherMovies = all.filter(m=>!histIds.includes(m.id));
  const sorted = [...histMovies, ...otherMovies];
  
  sel.innerHTML = '<option value="">-- Select a title you watched --</option>' +
    sorted.map(m=>`<option value="${m.id}">${m.title} (${m.year})</option>`).join('');
}

// ── TOP 10 ROW ─────────────────────────────────────────────────
function renderTop10Row(containerId, movies) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = movies.slice(0,10).map((m, i) => `
    <div class="top10-card" onclick="openModal('${m.id}')">
      <div class="top10-number">${i+1}</div>
      <div class="top10-poster">
        <img src="${m.poster}" alt="${m.title}" loading="lazy"
          onerror="this.onerror=null;this.src='https://placehold.co/300x450/1a1a2e/e50914?text='+encodeURIComponent('${m.title.substring(0,8)}')">
        <div class="top10-overlay">
          <button class="card-play" onclick="event.stopPropagation();window.location.href='watch.html?id=${m.id}'"><i class="fas fa-play"></i></button>
        </div>
      </div>
      <div class="top10-info">
        <div class="top10-title">${m.title}</div>
        <div class="top10-year">${m.year}</div>
      </div>
    </div>`).join('');
}

// ── SEARCH AUTOCOMPLETE ───────────────────────────────────────
function initSearchAutocomplete() {
  const input = document.getElementById('searchInputLg') || document.getElementById('searchInput');
  if (!input) return;
  
  const wrap = input.closest('.search-box-wrap');
  if (!wrap) return;
  
  // Create autocomplete dropdown
  const dropdown = document.createElement('div');
  dropdown.className = 'search-autocomplete';
  dropdown.id = 'searchAC';
  wrap.style.position = 'relative';
  wrap.appendChild(dropdown);
  
  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    if (q.length < 2) { dropdown.classList.remove('show'); return; }
    
    const all = DB.getMovies();
    const matches = all.filter(m =>
      m.title.toLowerCase().includes(q) ||
      m.director?.toLowerCase().includes(q) ||
      m.cast?.some(c=>c.toLowerCase().includes(q)) ||
      m.genre?.some(g=>g.toLowerCase().includes(q))
    ).slice(0,6);
    
    if (!matches.length) { dropdown.classList.remove('show'); return; }
    
    const catLabel = {movies:'MOVIE',series:'SERIES',anime:'ANIME',cartoons:'CARTOON'};
    const catColor = {movies:'var(--red)',series:'#60a5fa',anime:'#c084fc',cartoons:'#4ade80'};
    dropdown.innerHTML = matches.map(m=>`
      <div class="ac-item" onclick="openModal('${m.id}');document.getElementById('searchAC').classList.remove('show');">
        <img class="ac-poster" src="${m.poster}" alt="${m.title}" loading="lazy">
        <div class="ac-info">
          <strong>${m.title} <span class="ac-cat" style="background:${catColor[m.category]}22;color:${catColor[m.category]}">${catLabel[m.category]||'MOVIE'}</span></strong>
          <span>${m.year} · ${m.genre[0]} · ⭐ ${m.rating}</span>
        </div>
      </div>`).join('');
    dropdown.classList.add('show');
  });
  
  input.addEventListener('blur', () => setTimeout(()=>dropdown.classList.remove('show'),200));
  input.addEventListener('keydown', e => { if(e.key==='Escape') dropdown.classList.remove('show'); });
}

// ── KEYBOARD SHORTCUTS ─────────────────────────────────────────
function initKeyboardShortcuts() {
  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    
    if (e.key === '/' || e.key === 's') {
      e.preventDefault();
      window.location.href = 'search.html';
    }
    if (e.key === 'h') window.location.href = 'index.html';
    if (e.key === 'w') window.location.href = 'watchlist.html';
    if (e.key === 'r') {
      e.preventDefault();
      shufflePlay();
    }
  });
}

// ── ADMIN PANEL ENHANCEMENTS ───────────────────────────────────
function renderAdminPanel() {
  const el = document.getElementById('adminPanelSection');
  if (!el) return;
  
  const session = DB.getSession();
  if (!session || session.role !== 'admin') { el.style.display='none'; return; }
  
  const all = DB.getMovies();
  const users = DB.getUsers();
  const featured = all.filter(m=>m.featured).length;
  
  el.innerHTML = `
    <div class="admin-header" style="margin-bottom:1rem;">
      <i class="fas fa-shield-alt"></i> Admin Dashboard — Welcome, ${session.name.split(' ')[0]}!
    </div>
    <div class="admin-panel-grid">
      <div class="admin-card">
        <div class="admin-card-title"><i class="fas fa-film"></i> Total Titles</div>
        <div class="admin-card-value">${all.length}</div>
        <div class="admin-card-sub">${featured} featured · ${all.filter(m=>m.category==='movies').length} movies · ${all.filter(m=>m.category==='series').length} series</div>
      </div>
      <div class="admin-card">
        <div class="admin-card-title"><i class="fas fa-users"></i> Registered Users</div>
        <div class="admin-card-value">${users.length}</div>
        <div class="admin-card-sub">${users.filter(u=>u.role==='admin').length} admin · ${users.filter(u=>u.role==='user').length} members</div>
      </div>
      <div class="admin-card" style="grid-column:1/-1;">
        <div class="admin-card-title"><i class="fas fa-list"></i> Manage Featured Titles</div>
        <div class="admin-title-list" id="adminTitleList"></div>
      </div>
    </div>`;
  
  renderAdminTitleList();
}

function renderAdminTitleList() {
  const el = document.getElementById('adminTitleList');
  if (!el) return;
  const all = DB.getMovies();
  // Show featured + top rated non-featured (first 20 total)
  const featured = all.filter(m=>m.featured);
  const others = all.filter(m=>!m.featured).sort((a,b)=>b.rating-a.rating).slice(0,12);
  const list = [...featured, ...others].slice(0,20);
  
  el.innerHTML = list.map(m=>`
    <div class="admin-title-row">
      <img src="${m.poster}" alt="${m.title}" loading="lazy">
      <div class="title-info">
        <strong>${m.title}</strong>
        <span>${m.year} · ⭐ ${m.rating} · ${m.category}</span>
      </div>
      <button class="btn-feature-toggle ${m.featured?'featured':''}" onclick="toggleFeatured('${m.id}', this)">
        ${m.featured?'★ Featured':'☆ Feature'}
      </button>
    </div>`).join('');
}

function toggleFeatured(id, btn) {
  showToast(`Feature toggle is view-only in this demo (DB is static)`);
  btn.classList.toggle('featured');
  btn.textContent = btn.classList.contains('featured') ? '★ Featured' : '☆ Feature';
}

// ── TRUST SECTION ──────────────────────────────────────────────
function renderTrustSection() {
  const el = document.getElementById('trustSection');
  if (!el) return;
  el.innerHTML = `
    <div class="trust-item">
      <i class="fas fa-ban"></i>
      <div><h4>100% Ad-Free</h4><p>No ads, no popups, no interruptions. Ever.</p></div>
    </div>
    <div class="trust-item">
      <i class="fas fa-lock"></i>
      <div><h4>Privacy First</h4><p>We don't sell your data or track your behavior externally.</p></div>
    </div>
    <div class="trust-item">
      <i class="fas fa-infinity"></i>
      <div><h4>Completely Free</h4><p>198+ movies, series, anime & cartoons — zero cost.</p></div>
    </div>
    <div class="trust-item">
      <i class="fas fa-server"></i>
      <div><h4>5 Backup Servers</h4><p>If one server fails, we switch automatically.</p></div>
    </div>`;
}

// ── ABOUT MODAL ────────────────────────────────────────────────
function openAboutModal() {
  const existing = document.getElementById('aboutModal');
  if (existing) { existing.classList.add('show'); document.body.style.overflow='hidden'; return; }
  
  const modal = document.createElement('div');
  modal.className = 'about-modal'; modal.id = 'aboutModal';
  modal.innerHTML = `
    <div class="about-box">
      <h3>NEX<span>TV</span> — About Us</h3>
      <p>NexTV is a completely free streaming platform built for real entertainment lovers. We believe great movies, series, anime, and cartoons should be accessible to everyone — no subscriptions, no credit cards, no ads.</p>
      <div class="about-features">
        <div class="about-feature"><i class="fas fa-film"></i><div><strong>198+ Titles</strong><span>Movies, series, anime & cartoons</span></div></div>
        <div class="about-feature"><i class="fas fa-server"></i><div><strong>5 Streaming Servers</strong><span>Automatic failover for reliability</span></div></div>
        <div class="about-feature"><i class="fas fa-ban"></i><div><strong>Zero Ads</strong><span>Completely ad-free experience</span></div></div>
        <div class="about-feature"><i class="fas fa-globe"></i><div><strong>Global Content</strong><span>Hollywood, Korean, Japanese & British</span></div></div>
        <div class="about-feature"><i class="fas fa-mobile-alt"></i><div><strong>Fully Responsive</strong><span>Works on any device</span></div></div>
        <div class="about-feature"><i class="fas fa-lock"></i><div><strong>Privacy Focused</strong><span>Your data stays private</span></div></div>
      </div>
      <p>Built with passion for cinema by people who love great storytelling. Have feedback? We'd love to hear from you.</p>
      <div style="display:flex;gap:.75rem;flex-wrap:wrap;margin-top:1rem;">
        <button class="btn-play" onclick="document.getElementById('aboutModal').classList.remove('show');document.body.style.overflow='';" style="flex:1;">
          <i class="fas fa-play"></i> Start Watching
        </button>
        <button class="btn-more" onclick="document.getElementById('aboutModal').classList.remove('show');document.body.style.overflow='';" style="flex-shrink:0;">
          Close
        </button>
      </div>
    </div>`;
  modal.addEventListener('click', e => { if(e.target===modal) { modal.classList.remove('show'); document.body.style.overflow=''; }});
  document.body.appendChild(modal);
  setTimeout(()=>modal.classList.add('show'),10);
  document.body.style.overflow='hidden';
}

// ── MOBILE BOTTOM NAV ──────────────────────────────────────────
function injectMobileNav() {
  if (document.getElementById('mobileBottomNav')) return;
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navItems = [
    { href:'index.html', icon:'fa-home', label:'Home' },
    { href:'search.html', icon:'fa-search', label:'Search' },
    { href:'movies.html', icon:'fa-film', label:'Movies' },
    { href:'anime.html', icon:'fa-dragon', label:'Anime' },
    { href:'watchlist.html', icon:'fa-bookmark', label:'My List' },
  ];
  const nav = document.createElement('nav');
  nav.className = 'mobile-bottom-nav'; nav.id = 'mobileBottomNav';
  nav.innerHTML = navItems.map(item=>`
    <a href="${item.href}" class="mob-nav-item ${currentPage===item.href?'active':''}">
      <i class="fas ${item.icon}"></i>
      ${item.label}
    </a>`).join('');
  document.body.appendChild(nav);
}

// ── ENHANCED FOOTER ───────────────────────────────────────────
function enhanceFooter() {
  const footer = document.querySelector('.site-footer .footer-inner');
  if (!footer || document.querySelector('.footer-about')) return;
  
  const aboutSection = document.createElement('div');
  aboutSection.className = 'footer-about';
  aboutSection.innerHTML = `
    <div class="footer-col">
      <h4>NEX<span style="color:var(--red);">TV</span></h4>
      <p>Free streaming for everyone. 198+ titles across movies, series, anime, and cartoons.</p>
      <div class="footer-social">
        <a href="#" title="Twitter"><i class="fab fa-twitter"></i></a>
        <a href="#" title="Discord"><i class="fab fa-discord"></i></a>
        <a href="#" title="Reddit"><i class="fab fa-reddit"></i></a>
        <a href="#" title="YouTube"><i class="fab fa-youtube"></i></a>
      </div>
    </div>
    <div class="footer-col">
      <h4>Browse</h4>
      <a href="movies.html">Movies</a>
      <a href="series.html">TV Shows</a>
      <a href="anime.html">Anime</a>
      <a href="cartoons.html">Cartoons</a>
      <a href="watchlist.html">My Watchlist</a>
    </div>
    <div class="footer-col">
      <h4>Company</h4>
      <a href="#" onclick="openAboutModal();return false;">About NexTV</a>
      <a href="#" onclick="return false;">Help Center</a>
      <a href="#" onclick="return false;">Contact Us</a>
      <a href="#" onclick="return false;">Report an Issue</a>
      <a href="#" onclick="return false;">Suggest a Title</a>
    </div>
    <div class="footer-col">
      <h4>Legal</h4>
      <a href="#" onclick="return false;">Privacy Policy</a>
      <a href="#" onclick="return false;">Terms of Service</a>
      <a href="#" onclick="return false;">Cookie Policy</a>
      <a href="#" onclick="return false;">DMCA</a>
    </div>`;
  footer.insertBefore(aboutSection, footer.firstChild);
}

// ── INIT ALL NEW FEATURES ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderNotifBtn();
  injectMobileNav();
  initKeyboardShortcuts();
  initSearchAutocomplete();
  enhanceFooter();
  
  // Setup star picker if write review modal exists
  setupStarPicker();
  
  // PWA banner inject
  if (!document.getElementById('pwa-banner')) {
    const banner = document.createElement('div');
    banner.id = 'pwa-banner';
    banner.innerHTML = `
      <div class="pwa-icon">📱</div>
      <div class="pwa-text">
        <h4>Install NexTV App</h4>
        <p>Add to your home screen for the best experience — works offline too!</p>
      </div>
      <div class="pwa-actions">
        <button class="btn-install" onclick="installPWA()">Install</button>
        <button class="btn-pwa-dismiss" onclick="dismissPWA()">Not now</button>
      </div>`;
    document.body.appendChild(banner);
    
    // Show banner after 5s if not dismissed and on mobile
    if (!localStorage.getItem('nextv_pwa_dismissed') && window.innerWidth < 768) {
      setTimeout(()=>banner.classList.add('show'), 5000);
    }
  }
});

