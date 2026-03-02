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
  
  const src = ytId 
    ? `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`
    : `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(m.title + ' official trailer')}&autoplay=1`;

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
