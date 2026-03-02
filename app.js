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
      <img src="${movie.poster}" alt="${movie.title}"
           onload="this.classList.add('loaded');this.closest('.card-poster')?.classList.add('loaded')"
           onerror="this.onerror=null;this.src='https://placehold.co/300x450/1a1a2e/e50914?text='+encodeURIComponent(movie.title.substring(0,12));this.classList.add('loaded');this.closest('.card-poster')?.classList.add('loaded')">
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

  const mp = document.getElementById('modalPoster');
  mp.classList.remove('loaded');
  mp.src = m.poster;
  mp.onload = function(){ this.classList.add('loaded'); };
  mp.onerror = function(){ this.src='https://placehold.co/300x450/1a1a2e/e50914?text='+encodeURIComponent(m.title); this.classList.add('loaded'); };
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
        <img src="${m.poster}" alt="${m.title}"
             onload="this.classList.add('loaded')"
             onerror="this.onerror=null;this.src='https://placehold.co/120x180/1a1a2e/e50914?text='+encodeURIComponent('${m.title.substring(0,10)}');this.classList.add('loaded')">
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
        <img src="${m.poster}" alt="${m.title}"
             onload="this.classList.add('loaded');this.closest('.card-poster')?.classList.add('loaded')"
             onerror="this.onerror=null;this.src='https://placehold.co/300x450/1a1a2e/e50914?text='+encodeURIComponent(m.title);this.classList.add('loaded');this.closest('.card-poster')?.classList.add('loaded')">
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
          ${posters.map((m,i)=>`<img src="${m.poster}" alt="${m.title}" style="transform:rotate(${(i-1.5)*6}deg) translateY(${Math.abs(i-1.5)*8}px);">`).join('')}
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
  if (!panel) return;
  const isOpen = panel.classList.contains('show');
  panel.classList.toggle('show');
  // Mobile: add backdrop class to body
  if (window.innerWidth <= 768) {
    document.body.classList.toggle('sheet-open', !isOpen);
  }
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
    document.body.classList.remove('sheet-open');
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
          ${previews.map(m=>`<img src="${m.poster}" class="shuffle-mini-poster" alt="${m.title}" onclick="openModal('${m.id}')" title="${m.title}">`).join('')}
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
        <img src="${m.poster}" alt="${m.title}"
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
        <img class="ac-poster" src="${m.poster}" alt="${m.title}">
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
      <img src="${m.poster}" alt="${m.title}">
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
    { href:'downloads.html', icon:'fa-download', label:'Downloads' },
    { href:'history.html', icon:'fa-history', label:'History' },
    { href:'profile.html', icon:'fa-user', label:'Profile' },
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


// ── FAST IMAGE LOADING SYSTEM ─────────────────────────────────

// Preload hero backdrop images so they're ready before slider shows them
// ── INSTANT IMAGE PRELOADER ─────────────────────────────────────
// Fires IMMEDIATELY — no waiting for DOM, no lazy loading, no delays
// Dumps all movie poster + backdrop URLs into browser cache right away
(function preloadEverything() {
  const all = (typeof DB !== 'undefined' ? DB.getMovies() : []);
  const urls = [];
  all.forEach(m => {
    if (m.poster)   urls.push(m.poster);
    if (m.backdrop) urls.push(m.backdrop);
  });
  // Batch preload using link rel=preload for highest priority
  urls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
  });
  // Also fire Image() objects in parallel as backup
  urls.forEach(url => { const i = new Image(); i.src = url; });
})();

function preloadHeroImages() {
  // Already handled above — kept for compatibility
}

function initImageOptimization() {
  // Mark all already-loaded images instantly
  document.querySelectorAll('img').forEach(img => {
    if (img.complete && img.naturalWidth) {
      img.classList.add('loaded');
      img.closest('.card-poster')?.classList.add('loaded');
    }
    img.addEventListener('load', function() {
      this.classList.add('loaded');
      this.closest('.card-poster')?.classList.add('loaded');
    }, { once: true });
  });

  // Catch any dynamically added images too
  const mutObs = new MutationObserver(mutations => {
    mutations.forEach(m => {
      m.addedNodes.forEach(node => {
        if (node.nodeType !== 1) return;
        node.querySelectorAll?.('img').forEach(img => {
          if (img.complete && img.naturalWidth) {
            img.classList.add('loaded');
            img.closest('.card-poster')?.classList.add('loaded');
          }
          img.addEventListener('load', function() {
            this.classList.add('loaded');
            this.closest('.card-poster')?.classList.add('loaded');
          }, { once: true });
        });
      });
    });
  });
  mutObs.observe(document.body, { childList: true, subtree: true });
}

// Add <link rel="preconnect"> to TMDB CDN for DNS warmup
function addResourceHints() {
  const hints = [
    { rel: 'preconnect', href: 'https://image.tmdb.org' },
    { rel: 'dns-prefetch', href: 'https://image.tmdb.org' },
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  ];
  hints.forEach(h => {
    if (document.querySelector(`link[href="${h.href}"][rel="${h.rel}"]`)) return;
    const link = document.createElement('link');
    link.rel = h.rel;
    link.href = h.href;
    if (h.rel === 'preconnect') link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
}

// Run on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  addResourceHints();
  setTimeout(initImageOptimization, 100); // slight delay so rows render first
});

// ════════════════════════════════════════════════════════════════
// NEXTV 3.0 — ALL NEW FEATURES JS
// ════════════════════════════════════════════════════════════════

// ── PAGE TRANSITIONS ──────────────────────────────────────────
function navigateTo(url) {
  document.body.classList.add('page-exit');
  setTimeout(() => window.location.href = url, 250);
}

// Intercept all internal nav links for smooth transitions
document.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('javascript') || a.target === '_blank') return;
    if (href.endsWith('.html') || href === 'index.html') {
      e.preventDefault();
      navigateTo(href);
    }
  });
});

// ── NAV SEARCH DROPDOWN ───────────────────────────────────────
function initNavSearch() {
  const navRight = document.querySelector('.nav-right');
  if (!navRight || document.getElementById('navSearchWrap')) return;

  // Remove old plain search icon
  const oldSearch = navRight.querySelector('a[href="search.html"].nav-icon');
  if (oldSearch) oldSearch.remove();

  const wrap = document.createElement('div');
  wrap.className = 'nav-search-wrap'; wrap.id = 'navSearchWrap';
  wrap.innerHTML = `
    <input type="text" class="nav-search-input" id="navSearchInput" placeholder="Search titles, actors...">
    <i class="fas fa-search nav-search-icon-btn"></i>
    <div class="nav-dropdown" id="navDropdown"></div>`;

  // Toggle button
  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'nav-icon'; toggleBtn.title = 'Search';
  toggleBtn.innerHTML = '<i class="fas fa-search"></i>';
  toggleBtn.onclick = () => {
    const inp = document.getElementById('navSearchInput');
    inp.classList.toggle('open');
    if (inp.classList.contains('open')) { inp.focus(); }
    else { inp.value=''; closeNavDropdown(); }
  };

  navRight.insertBefore(toggleBtn, navRight.querySelector('#authArea'));
  navRight.insertBefore(wrap, toggleBtn);

  const inp = document.getElementById('navSearchInput');
  inp.addEventListener('input', debounce(doNavSearch, 200));
  inp.addEventListener('keydown', e => {
    if (e.key === 'Escape') { inp.classList.remove('open'); inp.value=''; closeNavDropdown(); }
    if (e.key === 'Enter') { navigateTo(`search.html?q=${encodeURIComponent(inp.value)}`); }
  });

  document.addEventListener('click', e => {
    if (!wrap.contains(e.target) && !toggleBtn.contains(e.target)) closeNavDropdown();
  });
}

function closeNavDropdown() {
  document.getElementById('navDropdown')?.classList.remove('show');
}

function doNavSearch() {
  const q = document.getElementById('navSearchInput')?.value?.trim()?.toLowerCase();
  const drop = document.getElementById('navDropdown');
  if (!drop) return;

  if (!q || q.length < 2) { drop.classList.remove('show'); return; }

  const all = DB.getMovies();
  const matches = all.filter(m =>
    m.title.toLowerCase().includes(q) ||
    m.cast?.some(c => c.toLowerCase().includes(q)) ||
    m.director?.toLowerCase().includes(q) ||
    m.genre?.some(g => g.toLowerCase().includes(q))
  ).slice(0, 6);

  const catColor = {movies:'rgba(229,9,20,.15)',series:'rgba(96,165,250,.15)',anime:'rgba(192,132,252,.15)',cartoons:'rgba(74,222,128,.15)'};
  const catText = {movies:'#e50914',series:'#60a5fa',anime:'#c084fc',cartoons:'#4ade80'};
  const catLabel = {movies:'MOVIE',series:'SERIES',anime:'ANIME',cartoons:'CARTOON'};

  if (!matches.length) {
    drop.innerHTML = `<div class="nav-drop-empty">No results for "<strong>${q}</strong>"</div>`;
  } else {
    drop.innerHTML = `
      <div class="nav-drop-header">Results for "${q}"</div>
      ${matches.map(m => `
        <div class="nav-drop-item" onclick="openModal('${m.id}');closeNavDropdown();">
          <img class="nav-drop-poster" src="${m.poster}" alt="${m.title}">
          <div class="nav-drop-info">
            <strong>${m.title}</strong>
            <span>${m.year} · ⭐ ${m.rating}</span>
          </div>
          <span class="nav-drop-cat" style="background:${catColor[m.category]};color:${catText[m.category]}">${catLabel[m.category]||'MOVIE'}</span>
        </div>`).join('')}
      <a class="nav-drop-more" href="search.html?q=${encodeURIComponent(q)}">See all results →</a>`;
  }
  drop.classList.add('show');
}

function debounce(fn, ms) {
  let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

// ── DARK / LIGHT MODE ─────────────────────────────────────────
function initThemeToggle() {
  const navRight = document.querySelector('.nav-right');
  if (!navRight || document.getElementById('themeToggle')) return;

  const saved = localStorage.getItem('nextv_theme') || 'dark';
  if (saved === 'light') document.body.classList.add('light-mode');

  const btn = document.createElement('button');
  btn.className = 'theme-toggle'; btn.id = 'themeToggle';
  btn.title = 'Toggle theme';
  btn.innerHTML = saved === 'light' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
  btn.onclick = toggleTheme;

  navRight.insertBefore(btn, navRight.querySelector('#authArea'));
}

function toggleTheme() {
  const isLight = document.body.classList.toggle('light-mode');
  localStorage.setItem('nextv_theme', isLight ? 'light' : 'dark');
  const btn = document.getElementById('themeToggle');
  if (btn) btn.innerHTML = isLight ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
  showToast(isLight ? '☀️ Light mode on' : '🌙 Dark mode on');
}

// ── WATCH PROGRESS TRACKING ───────────────────────────────────
const WP = {
  key: 'nextv_progress',
  get all() { return JSON.parse(localStorage.getItem(this.key) || '{}'); },
  save(id, percent) {
    const d = this.all; d[id] = { percent: Math.min(100, Math.max(0, percent)), ts: Date.now() };
    localStorage.setItem(this.key, JSON.stringify(d));
  },
  get(id) { return this.all[id] || null; },
  clear(id) { const d = this.all; delete d[id]; localStorage.setItem(this.key, JSON.stringify(d)); },
};

// Inject progress bar into continue-watching cards
function injectProgressBars() {
  const prog = WP.all;
  document.querySelectorAll('.movie-card[data-id]').forEach(card => {
    const id = card.dataset.id;
    const p = prog[id];
    if (!p || p.percent < 3 || p.percent > 97) return;
    const poster = card.querySelector('.card-poster');
    if (!poster || poster.querySelector('.card-progress')) return;
    const bar = document.createElement('div');
    bar.className = 'card-progress';
    bar.innerHTML = `<div class="card-progress-bar" style="width:${p.percent}%"></div>`;
    poster.appendChild(bar);
  });
}

// Simulate progress on watch page load (real implementation tracks iframe events)
function initWatchProgress(movieId) {
  if (!movieId) return;
  const existing = WP.get(movieId);
  // Simulate increasing progress while on watch page
  let progress = existing?.percent || 0;
  const interval = setInterval(() => {
    progress = Math.min(progress + 0.5, 99);
    WP.save(movieId, progress);
  }, 10000); // update every 10s
  window.addEventListener('beforeunload', () => clearInterval(interval));

  // Show "complete the series" prompt for series at 80%+
  setTimeout(() => checkNextEpisode(movieId), 5000);
}

// ── HOVER TRAILER PREVIEW ─────────────────────────────────────
let hoverTimer = null;
let activeHoverIframe = null;

function initHoverTrailers() {
  document.addEventListener('mouseover', e => {
    const card = e.target.closest('.movie-card[data-id]');
    if (!card) return;
    const id = card.dataset.id;
    if (!id || card.querySelector('.trailer-hover-wrap')) return;

    clearTimeout(hoverTimer);
    hoverTimer = setTimeout(() => {
      if (!card.matches(':hover')) return;
      const m = DB.getMovie(id);
      if (!m) return;
      const ytId = TRAILER_YOUTUBE[m.tmdbId];
      if (!ytId) return;

      const wrap = document.createElement('div');
      wrap.className = 'trailer-hover-wrap';
      wrap.innerHTML = `
        <div class="trailer-hover-badge">PREVIEW</div>
        <iframe src="https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${ytId}&modestbranding=1&rel=0"
          allow="autoplay"></iframe>`;
      card.querySelector('.card-poster').appendChild(wrap);
      activeHoverIframe = wrap;
    }, 900); // 900ms hover delay before preview loads
  });

  document.addEventListener('mouseout', e => {
    const card = e.target.closest('.movie-card[data-id]');
    if (!card) return;
    clearTimeout(hoverTimer);
    const wrap = card.querySelector('.trailer-hover-wrap');
    if (wrap) {
      wrap.style.opacity = '0';
      setTimeout(() => wrap.remove(), 400);
    }
  });
}

// ── "NEW THIS WEEK" BANNER ────────────────────────────────────
function renderNewWeekBanner() {
  const el = document.getElementById('newWeekBanner');
  if (!el) return;
  if (localStorage.getItem('nextv_banner_dismissed') === 'true') { el.style.display='none'; return; }

  const all = DB.getMovies();
  const newTitles = [...all].filter(m => m.year >= 2023).sort((a,b) => b.rating-a.rating).slice(0,5);
  const names = newTitles.slice(0,3).map(m=>m.title).join(', ');

  el.innerHTML = `
    <div class="new-week-text">
      <h4><i class="fas fa-sparkles"></i> New This Week</h4>
      <p>Just added: ${names} and ${newTitles.length - 3} more titles</p>
    </div>
    <div class="new-week-posters">
      ${newTitles.slice(0,4).map(m=>`<img class="new-week-poster" src="${m.poster}" alt="${m.title}" onclick="openModal('${m.id}')">`).join('')}
    </div>
    <button class="btn-dismiss-banner" onclick="dismissWeekBanner(this)" title="Dismiss">
      <i class="fas fa-times"></i>
    </button>`;
}

function dismissWeekBanner(btn) {
  localStorage.setItem('nextv_banner_dismissed', 'true');
  btn.closest('.new-week-banner').style.display = 'none';
}

// ── USER RATINGS (THUMBS) ─────────────────────────────────────
const RATINGS_KEY = 'nextv_ratings';
function getUserRating(id) {
  return JSON.parse(localStorage.getItem(RATINGS_KEY) || '{}')[id] || null;
}
function setUserRating(id, val) {
  const r = JSON.parse(localStorage.getItem(RATINGS_KEY) || '{}');
  r[id] = r[id] === val ? null : val; // toggle
  localStorage.setItem(RATINGS_KEY, JSON.stringify(r));
  return r[id];
}

function handleRating(e, id, val) {
  e.stopPropagation();
  const session = DB.getSession();
  if (!session) { showToast('Sign in to rate titles', 'error'); return; }
  const result = setUserRating(id, val);
  const card = e.target.closest('.movie-card');
  if (card) updateRatingButtons(card, id, result);
  showToast(result === 'up' ? '👍 Added to liked' : result === 'down' ? '👎 Noted!' : 'Rating removed');
}

function updateRatingButtons(card, id, rating) {
  const up = card.querySelector('.thumb-up');
  const down = card.querySelector('.thumb-down');
  if (up) up.classList.toggle('active', rating === 'up');
  if (down) down.classList.toggle('active', rating === 'down');
}

// Inject rating buttons into cards after render
function injectRatingButtons() {
  document.querySelectorAll('.movie-card[data-id]').forEach(card => {
    const id = card.dataset.id;
    if (card.querySelector('.card-user-rating')) return;
    const rating = getUserRating(id);
    const ratingEl = document.createElement('div');
    ratingEl.className = 'card-user-rating';
    ratingEl.innerHTML = `
      <button class="thumb-btn thumb-up ${rating==='up'?'active':''}" onclick="handleRating(event,'${id}','up')" title="Like">
        <i class="fas fa-thumbs-up"></i>
      </button>
      <button class="thumb-btn thumb-down ${rating==='down'?'active':''}" onclick="handleRating(event,'${id}','down')" title="Dislike">
        <i class="fas fa-thumbs-down"></i>
      </button>`;
    const overlay = card.querySelector('.card-overlay');
    if (overlay) overlay.after(ratingEl);
  });
}

// ── "COMPLETE THE SERIES" / NEXT EPISODE ─────────────────────
function checkNextEpisode(movieId) {
  const m = DB.getMovie(movieId);
  if (!m || m.type !== 'series') return;
  const all = DB.getMovies();
  const related = all.filter(x => x.category === 'series' && x.id !== movieId && x.genre.some(g => m.genre.includes(g)));
  if (!related.length) return;
  const suggestion = related.sort((a,b) => b.rating-a.rating)[0];
  showNextEpBanner(suggestion);
}

function showNextEpBanner(movie) {
  let banner = document.getElementById('nextEpBanner');
  if (!banner) {
    banner = document.createElement('div');
    banner.className = 'next-ep-banner'; banner.id = 'nextEpBanner';
    document.body.appendChild(banner);
  }
  banner.innerHTML = `
    <h4><i class="fas fa-tv"></i> Up Next</h4>
    <p>You might also love: <strong>${movie.title}</strong></p>
    <div class="next-ep-actions">
      <button class="btn-next-ep" onclick="navigateTo('watch.html?id=${movie.id}')">
        <i class="fas fa-play"></i> Watch Now
      </button>
      <button class="btn-dismiss-ep" onclick="dismissNextEp()">Later</button>
    </div>`;
  setTimeout(() => banner.classList.add('show'), 100);
}

function dismissNextEp() {
  document.getElementById('nextEpBanner')?.classList.remove('show');
}

// ── USER PLAYLISTS ────────────────────────────────────────────
const PLAYLISTS_KEY = 'nextv_playlists';
const DEFAULT_PLAYLISTS = [
  { id:'pl1', name:'Weekend Binge', emoji:'🎬', color:'#e50914', ids:['m1','m2','m3','m5'], public: true },
  { id:'pl2', name:'Anime Essentials', emoji:'🐉', color:'#8b5cf6', ids:['a1','a2','a3'], public: false },
  { id:'pl3', name:'Watch with Kids', emoji:'⭐', color:'#22c55e', ids:['c40','c41','c43'], public: false },
];

function getPlaylists() {
  return JSON.parse(localStorage.getItem(PLAYLISTS_KEY) || 'null') || DEFAULT_PLAYLISTS;
}
function savePlaylists(pls) { localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(pls)); }

function renderPlaylistsSection() {
  const el = document.getElementById('playlistsSection');
  if (!el) return;
  const pls = getPlaylists();
  const all = DB.getMovies();

  el.innerHTML = `
    <div class="collections-manager" id="playlistsList">
      ${pls.map(pl => {
        const movies = pl.ids.map(id=>all.find(m=>m.id===id)).filter(Boolean);
        return `
        <div class="user-playlist">
          <div class="playlist-header" onclick="openPlaylist('${pl.id}')">
            <div class="playlist-icon" style="background:${pl.color}22;font-size:1.3rem;">${pl.emoji}</div>
            <div class="playlist-meta">
              <h4>${pl.name}</h4>
              <span>${movies.length} titles · ${pl.public?'🔗 Public':'🔒 Private'}</span>
            </div>
            <div class="playlist-posters">
              ${movies.slice(0,3).map(m=>`<img class="playlist-thumb" src="${m.poster}" alt="${m.title}">`).join('')}
            </div>
            <div class="playlist-actions">
              <button class="btn-playlist-share" onclick="sharePlaylist(event,'${pl.id}')" title="Share">
                <i class="fas fa-share"></i>
              </button>
            </div>
          </div>
        </div>`;
      }).join('')}
      <button class="btn-new-playlist" onclick="openNewPlaylist()">
        <i class="fas fa-plus"></i> Create New Playlist
      </button>
    </div>`;
}

function openPlaylist(id) {
  const pls = getPlaylists();
  const pl = pls.find(p=>p.id===id);
  if (!pl) return;
  const all = DB.getMovies();
  const movies = pl.ids.map(mid=>all.find(m=>m.id===mid)).filter(Boolean);
  if (movies.length) openModal(movies[0].id); // open first as gateway
}

function sharePlaylist(e, id) {
  e.stopPropagation();
  const pls = getPlaylists(); const pl = pls.find(p=>p.id===id);
  if (!pl) return;
  const url = `${window.location.origin}${window.location.pathname}?playlist=${id}`;
  navigator.clipboard?.writeText(`Check out my NexTV playlist "${pl.name}"!\n${url}`)
    .then(()=>showToast('📋 Playlist link copied!'))
    .catch(()=>showToast(`Playlist: ${pl.name}`));
}

let selectedEmoji = '🎬';
function openNewPlaylist() {
  const modal = document.getElementById('newPlaylistModal');
  if (modal) { modal.classList.add('show'); document.body.style.overflow='hidden'; return; }
  const m = document.createElement('div');
  m.className = 'new-playlist-modal'; m.id = 'newPlaylistModal';
  const emojis = ['🎬','🐉','⭐','💥','😱','😌','🏆','🌙','🔥','❤️','🎭','🚀'];
  m.innerHTML = `
    <div class="playlist-box">
      <h3><i class="fas fa-list" style="color:var(--teal);"></i> New Playlist</h3>
      <div class="emoji-picker">${emojis.map(em=>`<div class="emoji-opt ${em==='🎬'?'selected':''}" onclick="selectEmoji(this,'${em}')">${em}</div>`).join('')}</div>
      <input class="admin-input" id="playlistName" placeholder="Playlist name..." style="margin-bottom:.75rem;">
      <div style="display:flex;gap:.5rem;">
        <label style="display:flex;align-items:center;gap:.4rem;font-size:.85rem;cursor:pointer;">
          <input type="checkbox" id="playlistPublic"> Make public
        </label>
      </div>
      <div style="display:flex;gap:.75rem;margin-top:1rem;">
        <button class="btn-admin-add" onclick="createPlaylist()" style="flex:1;justify-content:center;">
          <i class="fas fa-plus"></i> Create
        </button>
        <button class="btn-party-close" onclick="closeNewPlaylist()">Cancel</button>
      </div>
    </div>`;
  m.addEventListener('click', e=>{if(e.target===m)closeNewPlaylist();});
  document.body.appendChild(m);
  setTimeout(()=>m.classList.add('show'),10);
  document.body.style.overflow='hidden';
}

function selectEmoji(el, emoji) {
  selectedEmoji = emoji;
  document.querySelectorAll('.emoji-opt').forEach(e=>e.classList.remove('selected'));
  el.classList.add('selected');
}

function createPlaylist() {
  const name = document.getElementById('playlistName')?.value?.trim();
  if (!name) { showToast('Enter a playlist name', 'error'); return; }
  const isPublic = document.getElementById('playlistPublic')?.checked || false;
  const colors = ['#e50914','#8b5cf6','#00d4b4','#f97316','#22c55e','#f5c518'];
  const pls = getPlaylists();
  pls.push({ id:'pl'+Date.now(), name, emoji:selectedEmoji, color:colors[pls.length%colors.length], ids:[], public:isPublic });
  savePlaylists(pls);
  closeNewPlaylist();
  renderPlaylistsSection();
  showToast(`✓ "${name}" playlist created!`);
}

function closeNewPlaylist() {
  document.getElementById('newPlaylistModal')?.classList.remove('show');
  document.body.style.overflow='';
}

// ── SERVICE WORKER (offline support) ─────────────────────────
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(()=>{});
  }
}

// Online/offline indicator
function initOfflineDetection() {
  const makeToast = (msg, cls) => {
    let t = document.getElementById('offlineToast');
    if (!t) { t = document.createElement('div'); t.id='offlineToast'; t.className='offline-toast'; document.body.appendChild(t); }
    t.className = `offline-toast ${cls}`;
    t.innerHTML = msg;
    t.classList.add('show');
    if (cls === 'online-toast') setTimeout(()=>t.classList.remove('show'), 3000);
  };
  window.addEventListener('offline', () => makeToast('<i class="fas fa-wifi-slash"></i> You\'re offline — some features may be limited', ''));
  window.addEventListener('online',  () => makeToast('<i class="fas fa-wifi"></i> Back online!', 'online-toast'));
}

// ── KEYBOARD NAVIGATION (arrow keys on rows) ──────────────────
function initKeyboardNavigation() {
  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    // ? or F1 shows shortcut panel
    if (e.key === '?' || e.key === 'F1') { e.preventDefault(); openShortcutsPanel(); return; }

    // Arrow key row navigation
    if (['ArrowLeft','ArrowRight'].includes(e.key)) {
      const focused = document.querySelector('.movie-card:focus, .movie-card:hover');
      if (!focused) return;
      const row = focused.closest('.cards-row');
      if (!row) return;
      const cards = [...row.querySelectorAll('.movie-card')];
      const idx = cards.indexOf(focused);
      let next;
      if (e.key === 'ArrowLeft') next = cards[idx - 1];
      if (e.key === 'ArrowRight') next = cards[idx + 1];
      if (next) { next.focus(); next.scrollIntoView({ inline:'nearest', behavior:'smooth' }); e.preventDefault(); }
    }

    // Enter to open focused card
    if (e.key === 'Enter') {
      const focused = document.querySelector('.movie-card:focus');
      if (focused) { const id = focused.dataset.id; if(id) openModal(id); }
    }

    // F for fullscreen hint
    if (e.key === 'f' || e.key === 'F') {
      const iframe = document.querySelector('.player-frame-wrap iframe');
      if (iframe) iframe.requestFullscreen?.();
    }
  });

  // Make cards focusable
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      document.querySelectorAll('.movie-card').forEach(c => {
        if (!c.getAttribute('tabindex')) c.setAttribute('tabindex', '0');
      });
    }, 500);
  });
}

// ── KEYBOARD SHORTCUTS PANEL ──────────────────────────────────
function openShortcutsPanel() {
  let modal = document.getElementById('shortcutsModal');
  if (modal) { modal.classList.toggle('show'); return; }
  modal = document.createElement('div');
  modal.className = 'shortcut-modal'; modal.id = 'shortcutsModal';
  const shortcuts = [
    ['/','Open search'], ['H','Go home'], ['W','My watchlist'],
    ['R','Shuffle random'], ['F','Fullscreen (player)'],
    ['?','Show shortcuts'], ['Esc','Close / Go back'],
    ['←→','Navigate cards'], ['Enter','Open title'],
  ];
  modal.innerHTML = `
    <div class="shortcut-box">
      <h3><i class="fas fa-keyboard" style="color:var(--teal);"></i> Keyboard Shortcuts</h3>
      <div class="shortcut-grid">
        ${shortcuts.map(([k,v])=>`<div class="shortcut-item"><kbd>${k}</kbd><span>${v}</span></div>`).join('')}
      </div>
      <button class="btn-party-close" onclick="document.getElementById('shortcutsModal').classList.remove('show')" style="margin-top:1rem;width:100%;text-align:center;">Close</button>
    </div>`;
  modal.addEventListener('click', e => { if(e.target===modal) modal.classList.remove('show'); });
  document.body.appendChild(modal);
  setTimeout(()=>modal.classList.add('show'),10);
}

// ── "FREE TONIGHT?" QUIZ ──────────────────────────────────────
const quizState = { step: 0, answers: {} };
const quizConfig = [
  {
    q: 'What are you in the mood for?',
    key: 'mood',
    opts: [
      { label:'😂 Laugh', genres:['Comedy','Animation'] },
      { label:'💥 Action', genres:['Action','Adventure'] },
      { label:'😱 Scare Me', genres:['Horror','Thriller'] },
      { label:'😢 Feel Something', genres:['Drama','Romance'] },
      { label:'🤯 Mind Blown', genres:['Sci-Fi','Mystery'] },
    ]
  },
  {
    q: 'How much time do you have?',
    key: 'time',
    opts: [
      { label:'⚡ Under 90min', maxMins: 90 },
      { label:'🎬 2 Hours', maxMins: 130 },
      { label:'🍿 Whatever it takes', maxMins: 9999 },
    ]
  },
  {
    q: 'Watching with?',
    key: 'who',
    opts: [
      { label:'🙋 Just Me', cats:['movies','anime','series'] },
      { label:'👫 With Someone', cats:['movies','series'] },
      { label:'👨‍👩‍👧 Family / Kids', cats:['cartoons','movies'] },
    ]
  }
];

function renderQuizSection() {
  const el = document.getElementById('quizSection');
  if (!el) return;
  el.innerHTML = `
    <div class="quiz-card">
      <h3>🎯 Free Tonight?</h3>
      <p>Answer 3 quick questions and we'll find the perfect title for you.</p>
      <button class="btn-start-quiz" onclick="startQuiz()">
        <i class="fas fa-magic"></i> Find My Perfect Watch
      </button>
      <div class="quiz-steps" id="quizSteps" style="display:none;"></div>
      <div class="quiz-results" id="quizResults"></div>
    </div>`;
}

function startQuiz() {
  quizState.step = 0; quizState.answers = {};
  document.querySelector('.btn-start-quiz').style.display='none';
  document.getElementById('quizSteps').style.display='block';
  showQuizStep(0);
}

function showQuizStep(idx) {
  const stepsEl = document.getElementById('quizSteps');
  if (!stepsEl) return;
  const step = quizConfig[idx];
  stepsEl.innerHTML = `
    <div class="quiz-step active">
      <h4>${step.q} <span style="color:var(--muted);font-size:.8rem;">(${idx+1}/${quizConfig.length})</span></h4>
      <div class="quiz-options">
        ${step.opts.map((opt,i)=>`<button class="quiz-opt" onclick="answerQuiz(${idx},${i})">${opt.label}</button>`).join('')}
      </div>
    </div>`;
}

function answerQuiz(stepIdx, optIdx) {
  quizState.answers[quizConfig[stepIdx].key] = optIdx;
  if (stepIdx + 1 < quizConfig.length) {
    showQuizStep(stepIdx + 1);
  } else {
    showQuizResults();
  }
}

function showQuizResults() {
  document.getElementById('quizSteps').style.display='none';
  const moodOpt = quizConfig[0].opts[quizState.answers.mood];
  const timeOpt = quizConfig[1].opts[quizState.answers.time];
  const whoOpt  = quizConfig[2].opts[quizState.answers.who];

  const all = DB.getMovies();
  let picks = all.filter(m => {
    const genreMatch = m.genre.some(g => moodOpt.genres.includes(g));
    const catMatch = whoOpt.cats.includes(m.category);
    const dur = m.duration?.match(/(\d+)h\s*(\d+)?m?/);
    const mins = dur ? parseInt(dur[1])*60 + parseInt(dur[2]||0) : 120;
    const timeMatch = mins <= timeOpt.maxMins;
    return genreMatch && catMatch && timeMatch;
  }).sort((a,b)=>b.rating-a.rating).slice(0,3);

  if (!picks.length) picks = all.sort((a,b)=>b.rating-a.rating).slice(0,3);

  const res = document.getElementById('quizResults');
  res.innerHTML = `
    <h4 style="margin-bottom:.5rem;">✨ Perfect for tonight:</h4>
    <div class="quiz-result-cards">
      ${picks.map(m=>`
        <div class="quiz-result-card" onclick="openModal('${m.id}')">
          <img src="${m.poster}" alt="${m.title}">
          <span>${m.title}</span>
          <span style="font-size:.72rem;color:var(--muted)">⭐ ${m.rating}</span>
        </div>`).join('')}
    </div>
    <button class="btn-retake" onclick="startQuiz()"><i class="fas fa-redo"></i> Try again</button>`;
  res.classList.add('show');
}

// ── MOBILE SWIPE GESTURES ─────────────────────────────────────
function initSwipeGestures() {
  // Hero slider swipe
  const hero = document.getElementById('heroSection');
  if (!hero) return;
  let startX = 0;
  hero.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  hero.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) < 50) return;
    if (diff > 0) goHero((heroIdx + 1) % heroMovies.length);
    else goHero((heroIdx - 1 + heroMovies.length) % heroMovies.length);
  });

  // Horizontal row swipe momentum
  document.querySelectorAll('.cards-row').forEach(row => {
    let isDown = false, startScrollX = 0, scrollLeft = 0;
    row.addEventListener('mousedown', e => { isDown=true; startScrollX=e.pageX-row.offsetLeft; scrollLeft=row.scrollLeft; });
    row.addEventListener('mouseleave', () => isDown=false);
    row.addEventListener('mouseup', () => isDown=false);
    row.addEventListener('mousemove', e => {
      if (!isDown) return; e.preventDefault();
      const x = e.pageX - row.offsetLeft;
      row.scrollLeft = scrollLeft - (x - startScrollX) * 1.5;
    });
  });
}

// ── GENRE PAGE GENERATOR ──────────────────────────────────────
function initGenrePage() {
  const params = new URLSearchParams(window.location.search);
  const genre = params.get('genre');
  if (!genre || !document.getElementById('genrePageContent')) return;

  const all = DB.getMovies();
  const movies = all.filter(m => m.genre.includes(genre)).sort((a,b)=>b.rating-a.rating);
  const heroMovie = movies[0];

  const genreIcons = {Action:'fa-bolt',Drama:'fa-theater-masks','Sci-Fi':'fa-rocket',Thriller:'fa-exclamation-triangle',Crime:'fa-user-secret',Adventure:'fa-compass',Horror:'fa-skull',Fantasy:'fa-dragon',Comedy:'fa-laugh',Mystery:'fa-search',Animation:'fa-star'};
  const icon = genreIcons[genre] || 'fa-film';

  document.title = `${genre} — Nex TV`;

  const heroEl = document.getElementById('genreHero');
  if (heroEl && heroMovie) {
    heroEl.innerHTML = `
      <div class="genre-hero-bg" style="background-image:url('${heroMovie.backdrop}')"></div>
      <div class="genre-hero-overlay"></div>
      <div class="genre-hero-content">
        <h1><i class="fas ${icon}" style="color:var(--red);"></i> ${genre}</h1>
        <p>${movies.length} titles · Best of ${genre} films & shows</p>
      </div>`;
  }

  const content = document.getElementById('genrePageContent');
  if (content) {
    content.innerHTML = `
      <div class="filter-bar" style="margin-bottom:1.5rem;">
        <div class="filter-group">
          <label>Sort by</label>
          <select onchange="sortGenrePage(this.value,'${genre}')" style="background:var(--bg3);border:1px solid var(--border);color:var(--text);padding:.5rem .9rem;border-radius:7px;font-family:inherit;outline:none;">
            <option value="rating">Top Rated</option>
            <option value="year">Newest First</option>
            <option value="title">A–Z</option>
          </select>
        </div>
      </div>
      <div class="grid-full" id="genreGrid2"></div>`;
    renderGrid('genreGrid2', movies);
  }
}

function sortGenrePage(sort, genre) {
  const all = DB.getMovies();
  let movies = all.filter(m => m.genre.includes(genre));
  if (sort === 'rating') movies.sort((a,b)=>b.rating-a.rating);
  if (sort === 'year') movies.sort((a,b)=>b.year-a.year);
  if (sort === 'title') movies.sort((a,b)=>a.title.localeCompare(b.title));
  renderGrid('genreGrid2', movies);
}

// ── UPDATE renderGenres TO LINK TO GENRE PAGES ───────────────
function renderGenresV2() {
  const el = document.getElementById('genreGrid');
  if (!el) return;
  const genres = [
    {name:'Action',icon:'fa-bolt'},{name:'Drama',icon:'fa-theater-masks'},
    {name:'Sci-Fi',icon:'fa-rocket'},{name:'Thriller',icon:'fa-exclamation-triangle'},
    {name:'Crime',icon:'fa-user-secret'},{name:'Adventure',icon:'fa-compass'},
    {name:'Horror',icon:'fa-skull'},{name:'History',icon:'fa-landmark'},
    {name:'Fantasy',icon:'fa-dragon'},{name:'Comedy',icon:'fa-laugh'},
    {name:'Mystery',icon:'fa-search'},{name:'Animation',icon:'fa-star'},
  ];
  el.innerHTML = genres.map(g=>`
    <a href="genre.html?genre=${g.name}" class="genre-chip" onclick="event.preventDefault();navigateTo('genre.html?genre=${g.name}')">
      <i class="fas ${g.icon}"></i> ${g.name}
    </a>`).join('');
}

// ── INIT ALL v3 FEATURES ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initNavSearch();
  initThemeToggle();
  initHoverTrailers();
  initKeyboardNavigation();
  initOfflineDetection();
  registerServiceWorker();
  initSwipeGestures();
  initGenrePage();

  // Inject progress bars + ratings after rows render
  setTimeout(() => {
    injectProgressBars();
    injectRatingButtons();
  }, 600);

  // Re-inject on any dynamic content added
  const obs = new MutationObserver(() => {
    injectProgressBars();
    injectRatingButtons();
  });
  obs.observe(document.body, { childList: true, subtree: true });
});


// ════════════════════════════════════════════════════════════════
// NEXTV 4.0 — ELITE FEATURES JS
// ════════════════════════════════════════════════════════════════

// ── SPLASH SCREEN ─────────────────────────────────────────────
function initSplash() {
  if (sessionStorage.getItem('nextv_splashed')) return;
  sessionStorage.setItem('nextv_splashed', '1');
  const splash = document.createElement('div');
  splash.id = 'splash';
  splash.innerHTML = `
    <div class="splash-logo">NEX<span>TV</span></div>
    <div class="splash-bar"><div class="splash-fill"></div></div>
    <div class="splash-tagline">Free streaming. Real entertainment.</div>`;
  document.body.prepend(splash);
  setTimeout(() => splash.remove(), 2400);
}

// ── AI CHAT ───────────────────────────────────────────────────
let aiChatOpen = false;
const aiHistory = [];

function initAIChat() {
  if (document.getElementById('aiChatBtn')) return;

  const btn = document.createElement('button');
  btn.id = 'aiChatBtn'; btn.title = 'AI Movie Assistant';
  btn.innerHTML = '<i class="fas fa-robot"></i>';
  btn.onclick = toggleAIChat;
  document.body.appendChild(btn);

  const panel = document.createElement('div');
  panel.id = 'aiChatPanel';
  panel.innerHTML = `
    <div class="ai-chat-header">
      <div class="ai-avatar"><i class="fas fa-robot"></i></div>
      <div>
        <h4>NexTV AI</h4>
        <span><span class="ai-online-dot"></span> Ready to help</span>
      </div>
      <button class="btn-close-chat" onclick="toggleAIChat()"><i class="fas fa-times"></i></button>
    </div>
    <div class="ai-messages" id="aiMessages">
      <div class="ai-msg bot">👋 Hey! I'm your AI movie assistant. Tell me what you're in the mood for — I'll find the perfect match from our library!<br><br>Try: <em>"something like Parasite but shorter"</em> or <em>"best anime under 2 hours"</em></div>
    </div>
    <div class="ai-suggestions" id="aiSuggestions">
      <button class="ai-sugg" onclick="sendAIMessage(this.textContent)">🎬 Best movies tonight</button>
      <button class="ai-sugg" onclick="sendAIMessage(this.textContent)">🐉 Top anime picks</button>
      <button class="ai-sugg" onclick="sendAIMessage(this.textContent)">😂 Make me laugh</button>
      <button class="ai-sugg" onclick="sendAIMessage(this.textContent)">😱 Scare me</button>
    </div>
    <div class="ai-input-row">
      <input class="ai-input" id="aiInput" placeholder="Ask me anything about movies..." 
        onkeydown="if(event.key==='Enter')sendAIMessage()">
      <button class="ai-send" onclick="sendAIMessage()"><i class="fas fa-paper-plane"></i></button>
    </div>`;
  document.body.appendChild(panel);
}

function toggleAIChat() {
  aiChatOpen = !aiChatOpen;
  document.getElementById('aiChatPanel')?.classList.toggle('open', aiChatOpen);
  if (aiChatOpen) setTimeout(() => document.getElementById('aiInput')?.focus(), 300);
}

async function sendAIMessage(text) {
  const input = document.getElementById('aiInput');
  const msg = text || input?.value?.trim();
  if (!msg) return;
  if (input) input.value = '';

  appendAIMessage(msg, 'user');
  const typingId = showAITyping();

  const all = DB.getMovies();
  const catalog = all.map(m => `${m.id}|${m.title}|${m.year}|${m.genre.join(',')}|${m.category}|${m.rating}|${m.duration}`).join('\n');

  const systemPrompt = `You are NexTV's AI movie assistant. You help users find movies from NexTV's catalog.

CATALOG (id|title|year|genres|category|rating|duration):
${catalog}

RULES:
- Recommend 2-4 titles from the catalog that match the user's request
- Reply conversationally in 1-2 sentences, then list recommendations
- Format each recommendation as: [MOVIE:id:title:rating]
- Keep responses short and friendly
- If user asks for something not in catalog, pick the closest match
- Never make up titles not in the catalog`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 600,
        system: systemPrompt,
        messages: [
          ...aiHistory,
          { role: 'user', content: msg }
        ]
      })
    });
    const data = await res.json();
    const reply = data.content?.[0]?.text || "I couldn't find anything specific, but check out our Trending section!";
    aiHistory.push({ role: 'user', content: msg });
    aiHistory.push({ role: 'assistant', content: reply });
    if (aiHistory.length > 12) aiHistory.splice(0, 2);
    removeAITyping(typingId);
    renderAIReply(reply);
  } catch (e) {
    removeAITyping(typingId);
    // Fallback: local search
    const q = msg.toLowerCase();
    const matches = all.filter(m =>
      m.genre.some(g => q.includes(g.toLowerCase())) ||
      q.includes(m.category) ||
      (q.includes('anime') && m.category === 'anime') ||
      (q.includes('cartoon') && m.category === 'cartoons') ||
      (q.includes('series') && m.category === 'series')
    ).sort((a,b)=>b.rating-a.rating).slice(0,3);
    if (matches.length) {
      const reply = `Here are some great picks for you! ${matches.map(m=>`[MOVIE:${m.id}:${m.title}:${m.rating}]`).join(' ')}`;
      renderAIReply(reply);
    } else {
      appendAIMessage("Here are our top picks right now! " + all.sort((a,b)=>b.rating-a.rating).slice(0,3).map(m=>`[MOVIE:${m.id}:${m.title}:${m.rating}]`).join(' '), 'bot');
    }
  }
}

function renderAIReply(text) {
  // Parse [MOVIE:id:title:rating] chips
  const parts = text.split(/(\[MOVIE:[^\]]+\])/g);
  const msgs = document.getElementById('aiMessages');
  if (!msgs) return;
  const wrapper = document.createElement('div');
  wrapper.className = 'ai-msg bot';
  parts.forEach(part => {
    const match = part.match(/\[MOVIE:([^:]+):([^:]+):([^\]]+)\]/);
    if (match) {
      const [, id, title, rating] = match;
      const m = DB.getMovie(id);
      const chip = document.createElement('div');
      chip.className = 'ai-movie-chip';
      chip.onclick = () => openModal(id);
      chip.innerHTML = m ? `<img src="${m.poster}" alt="${title}"><span><strong>${title}</strong> ⭐${rating}</span>` : `<span>${title} ⭐${rating}</span>`;
      wrapper.appendChild(chip);
    } else if (part.trim()) {
      const t = document.createElement('span');
      t.textContent = part;
      wrapper.appendChild(t);
    }
  });
  msgs.appendChild(wrapper);
  msgs.scrollTop = msgs.scrollHeight;
}

function appendAIMessage(text, role) {
  const msgs = document.getElementById('aiMessages');
  if (!msgs) return;
  const div = document.createElement('div');
  div.className = `ai-msg ${role}`;
  div.textContent = text;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function showAITyping() {
  const msgs = document.getElementById('aiMessages');
  if (!msgs) return null;
  const id = 'typing-' + Date.now();
  const div = document.createElement('div');
  div.className = 'ai-msg typing'; div.id = id;
  div.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
  return id;
}

function removeAITyping(id) {
  document.getElementById(id)?.remove();
}

// ── NEXTV WRAPPED ─────────────────────────────────────────────
function openWrapped() {
  const session = DB.getSession();
  if (!session) { showToast('Sign in to see your Wrapped!', 'error'); return; }
  const user = DB.getUserById(session.id);
  const all = DB.getMovies();
  const history = user?.watchHistory || [];
  const progress = WP?.all || {};

  const watched = history.map(h => all.find(m => m.id === h.movieId)).filter(Boolean);
  const genreCounts = {};
  watched.forEach(m => m.genre.forEach(g => genreCounts[g] = (genreCounts[g]||0)+1));
  const topGenre = Object.entries(genreCounts).sort((a,b)=>b[1]-a[1])[0]?.[0] || 'Action';
  const catCounts = {};
  watched.forEach(m => catCounts[m.category] = (catCounts[m.category]||0)+1);
  const topCat = Object.entries(catCounts).sort((a,b)=>b[1]-a[1])[0]?.[0] || 'movies';
  const avgRating = watched.length ? (watched.reduce((s,m)=>s+m.rating,0)/watched.length).toFixed(1) : '0.0';
  const totalHrs = watched.length ? Math.round(watched.reduce((s,m)=>{
    const d = m.duration?.match(/(\d+)h\s*(\d+)?m?/);
    return s + (d ? parseInt(d[1])*60+parseInt(d[2]||0) : 90);
  },0)/60) : 0;
  const topMovie = watched.sort((a,b)=>b.rating-a.rating)[0];

  let modal = document.getElementById('wrappedModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.className = 'wrapped-modal'; modal.id = 'wrappedModal';
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if(e.target===modal) modal.classList.remove('show'); });
  }
  modal.innerHTML = `
    <div class="wrapped-box">
      <div class="wrapped-bg-glow"></div>
      <div class="wrapped-logo">NEX<span>TV</span></div>
      <div class="wrapped-year">YOUR 2025 WRAPPED</div>
      <div class="wrapped-stats-grid">
        <div class="wrapped-stat">
          <div class="wrapped-stat-num">${history.length || '0'}</div>
          <div class="wrapped-stat-label">Titles Watched</div>
        </div>
        <div class="wrapped-stat">
          <div class="wrapped-stat-num">${totalHrs}h</div>
          <div class="wrapped-stat-label">Hours Streamed</div>
        </div>
        <div class="wrapped-stat">
          <div class="wrapped-stat-num">${avgRating}</div>
          <div class="wrapped-stat-label">Avg Rating</div>
        </div>
        <div class="wrapped-stat">
          <div class="wrapped-stat-num">${Object.keys(genreCounts).length || 1}</div>
          <div class="wrapped-stat-label">Genres Explored</div>
        </div>
      </div>
      <div class="wrapped-highlight">
        <h4>Your Top Genre</h4>
        <p>✨ ${topGenre}</p>
      </div>
      ${topMovie ? `<div class="wrapped-highlight">
        <h4>Most Loved Title</h4>
        <p>🎬 ${topMovie.title}</p>
      </div>` : ''}
      <button class="btn-share-wrapped" onclick="shareWrapped()">
        <i class="fas fa-share"></i> Share My Wrapped
      </button>
      <button class="btn-close-wrapped" onclick="document.getElementById('wrappedModal').classList.remove('show');document.body.style.overflow='';">
        Close
      </button>
    </div>`;
  modal.classList.add('show');
  document.body.style.overflow = 'hidden';
}

function shareWrapped() {
  const text = `🎬 My NexTV 2025 Wrapped is here! Check out what I've been watching on NexTV — 100% free streaming!\nnextv.free`;
  navigator.clipboard?.writeText(text).then(() => showToast('📋 Wrapped copied! Share it anywhere'));
}

// ── ADVANCED FILTER PAGE ──────────────────────────────────────
function initAdvancedFilter(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const genres = ['Action','Drama','Sci-Fi','Thriller','Crime','Adventure','Horror','Comedy','Mystery','Fantasy','Animation','Romance'];
  el.innerHTML = `
    <div class="adv-filter-panel">
      <div class="adv-filter-grid">
        <div>
          <div class="adv-filter-label">Category</div>
          <select class="admin-input" id="afCat">
            <option value="all">All Categories</option>
            <option value="movies">Movies</option>
            <option value="series">TV Shows</option>
            <option value="anime">Anime</option>
            <option value="cartoons">Cartoons</option>
          </select>
        </div>
        <div>
          <div class="adv-filter-label">Genre</div>
          <select class="admin-input" id="afGenre">
            <option value="">Any Genre</option>
            ${genres.map(g=>`<option value="${g}">${g}</option>`).join('')}
          </select>
        </div>
        <div>
          <div class="adv-filter-label">Origin</div>
          <select class="admin-input" id="afOrigin">
            <option value="">Any Origin</option>
            <option value="us">🇺🇸 Hollywood</option>
            <option value="jp">🇯🇵 Japanese</option>
            <option value="kr">🇰🇷 Korean</option>
            <option value="uk">🇬🇧 British</option>
          </select>
        </div>
        <div>
          <div class="adv-filter-label">Min Rating: <span id="afRatingVal">7.0</span></div>
          <div class="range-row">
            <input type="range" class="range-input" id="afRating" min="5" max="10" step="0.1" value="7"
              oninput="document.getElementById('afRatingVal').textContent=parseFloat(this.value).toFixed(1)">
          </div>
        </div>
        <div>
          <div class="adv-filter-label">Max Duration: <span id="afDurVal">Any</span></div>
          <div class="range-row">
            <input type="range" class="range-input" id="afDur" min="60" max="240" step="10" value="240"
              oninput="document.getElementById('afDurVal').textContent=this.value>=240?'Any':this.value+'min'">
          </div>
        </div>
        <div>
          <div class="adv-filter-label">Sort By</div>
          <select class="admin-input" id="afSort">
            <option value="rating">Top Rated</option>
            <option value="year">Newest First</option>
            <option value="title">A–Z</option>
          </select>
        </div>
      </div>
      <div class="adv-filter-actions">
        <button class="btn-admin-add" onclick="applyAdvancedFilter()"><i class="fas fa-filter"></i> Apply Filters</button>
        <button class="btn-party-close" onclick="resetAdvancedFilter()">Reset</button>
      </div>
    </div>
    <div id="afResults"></div>`;
  applyAdvancedFilter();
}

function applyAdvancedFilter() {
  const cat = document.getElementById('afCat')?.value;
  const genre = document.getElementById('afGenre')?.value;
  const origin = document.getElementById('afOrigin')?.value;
  const minRating = parseFloat(document.getElementById('afRating')?.value || 7);
  const maxDur = parseInt(document.getElementById('afDur')?.value || 240);
  const sort = document.getElementById('afSort')?.value || 'rating';

  let movies = DB.getMovies();
  if (cat && cat !== 'all') movies = movies.filter(m => m.category === cat);
  if (genre) movies = movies.filter(m => m.genre.includes(genre));
  if (origin) {
    const ids = ORIGIN_MAP[origin] || [];
    movies = movies.filter(m => ids.includes(m.id));
  }
  movies = movies.filter(m => m.rating >= minRating);
  if (maxDur < 240) {
    movies = movies.filter(m => {
      const d = m.duration?.match(/(\d+)h\s*(\d+)?m?/);
      const mins = d ? parseInt(d[1])*60+parseInt(d[2]||0) : 90;
      return mins <= maxDur;
    });
  }
  if (sort === 'rating') movies.sort((a,b) => b.rating-a.rating);
  if (sort === 'year') movies.sort((a,b) => b.year-a.year);
  if (sort === 'title') movies.sort((a,b) => a.title.localeCompare(b.title));

  const res = document.getElementById('afResults');
  if (!res) return;
  res.innerHTML = `<p style="color:var(--muted);font-size:.85rem;margin-bottom:1rem;">${movies.length} titles found</p><div class="grid-full" id="afGrid"></div>`;
  renderGrid('afGrid', movies);
}

function resetAdvancedFilter() {
  ['afCat','afGenre','afOrigin','afSort'].forEach(id => { const el=document.getElementById(id); if(el) el.value=el.options[0].value; });
  const rat = document.getElementById('afRating'); if(rat){rat.value=7;document.getElementById('afRatingVal').textContent='7.0';}
  const dur = document.getElementById('afDur'); if(dur){dur.value=240;document.getElementById('afDurVal').textContent='Any';}
  applyAdvancedFilter();
}

// ── HIDDEN GEMS ───────────────────────────────────────────────
function renderHiddenGems(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const all = DB.getMovies();
  const POPULAR_IDS = ['m1','m2','m3','m5','m6','a1','a2','s1','s2'];
  const gems = all.filter(m => m.rating >= 8.0 && !POPULAR_IDS.includes(m.id))
    .sort((a,b) => b.rating - a.rating).slice(0, 12);
  const session = DB.getSession();
  el.innerHTML = gems.map(m => {
    const inWL = session && DB.getUserById(session.id)?.watchlist?.includes(m.id);
    return `<div class="movie-card" data-id="${m.id}">
      <div class="card-poster">
        <img src="${m.poster}" alt="${m.title}"
          onload="this.classList.add('loaded');this.closest('.card-poster')?.classList.add('loaded')"
          onerror="this.onerror=null;this.src='https://placehold.co/300x450/1a1a2e/e50914?text='+encodeURIComponent(m.title.substring(0,10))">
        <div class="gem-badge"><i class="fas fa-gem"></i> Hidden Gem</div>
        <div class="card-overlay">
          <button class="card-play" onclick="openModal('${m.id}')"><i class="fas fa-play"></i></button>
          <button class="card-wl ${inWL?'active':''}" onclick="handleWL(event,'${m.id}')">
            <i class="${inWL?'fas':'far'} fa-bookmark"></i>
          </button>
        </div>
        <div class="card-rating"><i class="fas fa-star"></i> ${m.rating}</div>
      </div>
      <div class="card-info">
        <h4 class="card-title">${m.title}</h4>
        <span class="card-year">${m.year} · ${m.genre[0]}</span>
      </div>
    </div>`;
  }).join('');
}

// ── DOUBLE FEATURE ────────────────────────────────────────────
const DOUBLE_FEATURES = [
  { a:'m1', b:'m3', reason:'Both are Christopher Nolan mind-benders about bending reality and time. Perfect back-to-back.' },
  { a:'m2', b:'m9', reason:'Crime masterpieces — one a superhero epic, one a mob saga. Two of the greatest films ever.' },
  { a:'a1', b:'a2', reason:'The ultimate anime night — Death Note\'s psychological chess match, then FMA\'s emotional journey.' },
  { a:'m4', b:'s10', reason:'Korean storytelling at its finest. Class, tension, and jaw-dropping twists in both.' },
];

function renderDoubleFeature() {
  const el = document.getElementById('doubleFeatureSection');
  if (!el) return;
  const all = DB.getMovies();
  const pair = DOUBLE_FEATURES[Math.floor(Math.random()*DOUBLE_FEATURES.length)];
  const mA = all.find(m=>m.id===pair.a);
  const mB = all.find(m=>m.id===pair.b);
  if (!mA || !mB) return;
  el.innerHTML = `
    <div class="double-feature-card">
      <div class="df-posters">
        <img class="df-poster" src="${mA.poster}" alt="${mA.title}" onclick="openModal('${mA.id}')">
        <div class="df-plus">+</div>
        <img class="df-poster" src="${mB.poster}" alt="${mB.title}" onclick="openModal('${mB.id}')">
      </div>
      <div class="df-info">
        <h3><i class="fas fa-film"></i> Double Feature Night</h3>
        <p><strong>${mA.title}</strong> + <strong>${mB.title}</strong><br>${pair.reason}</p>
        <button class="btn-watch-both" onclick="navigateTo('watch.html?id=${mA.id}')">
          <i class="fas fa-play"></i> Start Double Feature
        </button>
      </div>
    </div>`;
}

// ── "WHO'S WATCHING" LIVE COUNTERS ────────────────────────────
function injectWatchingCounters() {
  document.querySelectorAll('.movie-card[data-id]').forEach(card => {
    if (card.querySelector('.watching-badge')) return;
    const count = Math.floor(Math.random()*1200)+50;
    const poster = card.querySelector('.card-poster');
    if (!poster) return;
    const badge = document.createElement('div');
    badge.className = 'watching-badge';
    badge.innerHTML = `<span class="live-dot"></span> ${count.toLocaleString()} watching`;
    poster.appendChild(badge);
  });
}

// ── SHAREABLE MOVIE CARD ──────────────────────────────────────
function openShareCard(movieId) {
  const m = DB.getMovie(movieId || currentModalId);
  if (!m) return;
  let modal = document.getElementById('shareCardModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.className = 'share-card-modal'; modal.id = 'shareCardModal';
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if(e.target===modal){modal.classList.remove('show');document.body.style.overflow='';} });
  }
  modal.innerHTML = `
    <div class="share-card-box">
      <h3><i class="fas fa-share-alt" style="color:var(--teal);"></i> Share "${m.title}"</h3>
      <div class="share-preview">
        <img class="share-preview-backdrop" src="${m.backdrop}" alt="">
        <div class="share-preview-overlay"></div>
        <div class="share-preview-content">
          <img class="share-preview-poster" src="${m.poster}" alt="${m.title}">
          <div class="share-preview-info">
            <h4>${m.title}</h4>
            <span>${m.year} · ⭐ ${m.rating} · ${m.genre[0]}</span>
            <br><span style="font-size:.7rem;color:rgba(255,255,255,.4)">Watching on NexTV — Free</span>
          </div>
        </div>
        <div class="share-preview-logo">NEX<span>TV</span></div>
      </div>
      <div class="share-actions">
        <button class="btn-share-copy" onclick="copyShareLink('${m.id}','${m.title}')">
          <i class="fas fa-copy"></i> Copy Link
        </button>
        <button class="btn-share-copy" onclick="shareToWhatsApp('${m.id}','${m.title}')" style="background:#25d366;">
          <i class="fab fa-whatsapp"></i> WhatsApp
        </button>
        <button class="btn-share-copy" onclick="shareToTwitter('${m.id}','${m.title}')" style="background:#1da1f2;">
          <i class="fab fa-twitter"></i> Twitter
        </button>
      </div>
      <button class="btn-party-close" onclick="document.getElementById('shareCardModal').classList.remove('show');document.body.style.overflow='';" style="margin-top:.75rem;width:100%;text-align:center;">Close</button>
    </div>`;
  modal.classList.add('show');
  document.body.style.overflow = 'hidden';
}

function copyShareLink(id, title) {
  const url = `${location.origin}${location.pathname}watch.html?id=${id}`;
  navigator.clipboard?.writeText(`🎬 Watch "${title}" free on NexTV!\n${url}`)
    .then(() => showToast('📋 Link copied!'));
}
function shareToWhatsApp(id, title) {
  const url = `${location.origin}${location.pathname}watch.html?id=${id}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(`🎬 Watch "${title}" free on NexTV!\n${url}`)}`, '_blank');
}
function shareToTwitter(id, title) {
  const url = `${location.origin}${location.pathname}watch.html?id=${id}`;
  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Just watching "${title}" on NexTV — completely free! 🎬\n${url}`)}`, '_blank');
}

// Inject share button into modal
function addShareToModal() {
  const actions = document.querySelector('.modal-actions');
  if (!actions || document.getElementById('modalShareBtn')) return;
  const btn = document.createElement('button');
  btn.id = 'modalShareBtn'; btn.className = 'btn-wl';
  btn.innerHTML = '<i class="fas fa-share-alt"></i> Share';
  btn.onclick = () => openShareCard(currentModalId);
  actions.appendChild(btn);
}

// ── CINEMA MODE ───────────────────────────────────────────────
function initCinemaMode() {
  if (!document.querySelector('.player-frame-wrap')) return;
  const exitBtn = document.createElement('button');
  exitBtn.className = 'cinema-exit-btn';
  exitBtn.innerHTML = '<i class="fas fa-compress"></i> Exit Cinema';
  exitBtn.onclick = toggleCinemaMode;
  document.body.appendChild(exitBtn);

  document.addEventListener('keydown', e => {
    if ((e.key === 'c' || e.key === 'C') && e.target.tagName !== 'INPUT') toggleCinemaMode();
  });
}

function toggleCinemaMode() {
  document.body.classList.toggle('cinema-mode');
  const on = document.body.classList.contains('cinema-mode');
  showToast(on ? '🎬 Cinema mode — Press C to exit' : 'Cinema mode off');
}

// ── SKIP INTRO BUTTON ─────────────────────────────────────────
function initSkipIntro() {
  const wrap = document.querySelector('.player-frame-wrap');
  if (!wrap) return;
  const btn = document.createElement('button');
  btn.className = 'skip-intro-btn'; btn.textContent = 'Skip Intro ⏭';
  btn.onclick = () => { btn.classList.remove('show'); showToast('Intro skipped!'); };
  wrap.appendChild(btn);
  // Show skip intro button 8s in
  setTimeout(() => { btn.classList.add('show'); setTimeout(() => btn.classList.remove('show'), 10000); }, 8000);
}

// ── ADMIN TMDB CONTENT MANAGER ────────────────────────────────
function renderAdminContentManager() {
  const el = document.getElementById('adminContentManager');
  if (!el) return;
  const session = DB.getSession();
  if (!session || session.role !== 'admin') { el.style.display='none'; return; }

  el.innerHTML = `
    <div class="admin-header" style="margin-bottom:1rem;">
      <i class="fas fa-plus-circle"></i> Content Manager — Add New Title via TMDB ID
    </div>
    <div class="admin-tmdb-form">
      <input class="admin-input" id="tmdbIdInput" placeholder="TMDB ID (e.g. 157336 for Interstellar)" style="flex:1;min-width:200px;">
      <select class="admin-input" id="tmdbTypeInput" style="width:130px;">
        <option value="movie">Movie</option>
        <option value="tv">TV Series</option>
      </select>
      <button class="btn-admin-add" onclick="fetchTMDB()"><i class="fas fa-search"></i> Fetch</button>
    </div>
    <div class="tmdb-fetch-result" id="tmdbResult"></div>
    <div id="tmdbAddBtn"></div>`;
}

async function fetchTMDB() {
  const id = document.getElementById('tmdbIdInput')?.value?.trim();
  const type = document.getElementById('tmdbTypeInput')?.value;
  if (!id) { showToast('Enter a TMDB ID', 'error'); return; }

  const btn = document.querySelector('.admin-tmdb-form .btn-admin-add');
  if (btn) { btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Fetching...'; btn.disabled = true; }

  try {
    const res = await fetch(`https://api.themoviedb.org/3/${type}/${id}?api_key=2dca580c2a14b55200e784d157207b4d&append_to_response=credits`);
    const data = await res.json();
    if (data.success === false) throw new Error('Not found');

    const title = data.title || data.name;
    const year = new Date(data.release_date || data.first_air_date).getFullYear();
    const poster = data.poster_path ? `https://image.tmdb.org/t/p/w300${data.poster_path}` : '';
    const backdrop = data.backdrop_path ? `https://image.tmdb.org/t/p/w1280${data.backdrop_path}` : '';
    const rating = data.vote_average?.toFixed(1);
    const genres = data.genres?.map(g=>g.name).slice(0,3) || [];
    const cast = data.credits?.cast?.slice(0,3).map(c=>c.name) || [];
    const director = data.credits?.crew?.find(c=>c.job==='Director')?.name || 'Unknown';

    const result = document.getElementById('tmdbResult');
    result.classList.add('show');
    result.innerHTML = `
      <img class="tmdb-result-poster" src="${poster}" alt="${title}">
      <div class="tmdb-result-info">
        <h4>${title} (${year})</h4>
        <div class="tmdb-result-meta">
          <span class="badge-rating"><i class="fas fa-star"></i> ${rating}</span>
          ${genres.map(g=>`<span class="badge-genre">${g}</span>`).join('')}
        </div>
        <p>${data.overview?.substring(0,150)}...</p>
        <p style="font-size:.75rem;color:var(--muted);">Director: ${director} · Cast: ${cast.join(', ')}</p>
      </div>`;

    const addBtn = document.getElementById('tmdbAddBtn');
    addBtn.innerHTML = `<button class="btn-admin-add" onclick="addTMDBTitle(${JSON.stringify({id:`custom-${id}`,tmdbId:id,title,year,genre:genres,rating:parseFloat(rating),poster,backdrop,director,cast,description:data.overview?.substring(0,300),type:type==='movie'?'movie':'series',category:type==='movie'?'movies':'series',featured:false,duration:type==='movie'?(Math.floor((data.runtime||120)/60))+'h '+((data.runtime||120)%60)+'m':'N/A'}).replace(/"/g,'&quot;')})">
      <i class="fas fa-plus"></i> Add "${title}" to Library
    </button>`;
  } catch(e) {
    showToast('TMDB title not found. Check the ID.', 'error');
  } finally {
    if (btn) { btn.innerHTML = '<i class="fas fa-search"></i> Fetch'; btn.disabled = false; }
  }
}

function addTMDBTitle(movieData) {
  // In a real backend this would persist to DB. Here we show it works.
  showToast(`✓ "${movieData.title}" added to library! (Reload to see in DB)`);
  document.getElementById('tmdbResult')?.classList.remove('show');
  document.getElementById('tmdbAddBtn').innerHTML = '';
  document.getElementById('tmdbIdInput').value = '';
}

// ── SEO META TAGS ─────────────────────────────────────────────
function injectSEOMeta() {
  const page = window.location.pathname.split('/').pop();
  const params = new URLSearchParams(window.location.search);
  const movieId = params.get('id');

  let title = 'Nex TV – Stream Free Movies & Shows';
  let desc = 'Watch 198+ movies, series, anime and cartoons for free on NexTV. No subscription needed.';
  let image = 'https://image.tmdb.org/t/p/w1280/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg';

  if (movieId) {
    const m = DB.getMovie(movieId);
    if (m) {
      title = `${m.title} (${m.year}) – Watch Free on NexTV`;
      desc = m.description?.substring(0, 160);
      image = m.backdrop || m.poster;
    }
  }

  const metas = [
    ['og:title', title], ['og:description', desc], ['og:image', image],
    ['og:type', 'website'], ['og:site_name', 'NexTV'],
    ['twitter:card', 'summary_large_image'], ['twitter:title', title],
    ['twitter:description', desc], ['twitter:image', image],
  ];

  document.title = title;
  metas.forEach(([name, content]) => {
    let el = document.querySelector(`meta[property="${name}"],meta[name="${name}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(name.startsWith('og:') ? 'property' : 'name', name);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  });
}

// ── WEB PUSH NOTIFICATIONS ────────────────────────────────────
async function requestPushPermission() {
  if (!('Notification' in window)) {
    showToast('Push notifications not supported in this browser', 'error'); return;
  }
  const perm = await Notification.requestPermission();
  if (perm === 'granted') {
    showToast('🔔 Notifications enabled! We\'ll alert you when new titles drop.');
    localStorage.setItem('nextv_push', 'granted');
    // Demo: send a welcome notification
    setTimeout(() => {
      new Notification('NexTV 🎬', {
        body: 'Welcome! You\'ll now get alerts for new releases & trending picks.',
        icon: 'logo.jpg',
      });
    }, 1000);
  } else {
    showToast('Notifications blocked. You can enable them in browser settings.', 'error');
  }
}

function renderPushPrompt() {
  const el = document.getElementById('pushPrompt');
  if (!el) return;
  if (localStorage.getItem('nextv_push') === 'granted' || !('Notification' in window)) {
    el.style.display = 'none'; return;
  }
  el.innerHTML = `
    <div class="push-prompt">
      <p><strong>🔔 Stay in the loop</strong>New releases, trending picks, and watch party invites — straight to your browser.</p>
      <button class="btn-enable-push" onclick="requestPushPermission()">Enable Alerts</button>
      <button class="btn-pwa-dismiss" onclick="this.closest('.push-prompt').parentElement.style.display='none'">Not now</button>
    </div>`;
}

// ── HISTORY PAGE ──────────────────────────────────────────────
function renderFullHistory() {
  const el = document.getElementById('fullHistoryList');
  if (!el) return;
  const session = DB.getSession();
  if (!session) { el.innerHTML = '<p class="muted-text">Sign in to see your history.</p>'; return; }
  const user = DB.getUserById(session.id);
  const history = user?.watchHistory || [];
  const all = DB.getMovies();
  const prog = WP?.all || {};

  if (!history.length) {
    el.innerHTML = '<div class="empty-state"><i class="fas fa-history"></i><p>Nothing watched yet. Start streaming!</p></div>';
    return;
  }
  el.innerHTML = `<div class="history-full-list">
    ${history.map(h => {
      const m = all.find(x=>x.id===h.movieId); if(!m) return '';
      const p = prog[m.id]?.percent || 0;
      const date = new Date(h.watchedAt).toLocaleDateString('en-US',{month:'short',day:'numeric'});
      return `<div class="history-full-item" onclick="openModal('${m.id}')">
        <img class="history-full-poster" src="${m.poster}" alt="${m.title}">
        <div class="history-full-info">
          <h4>${m.title}</h4>
          <span>${m.year} · ${m.genre[0]} · Watched ${date}</span>
        </div>
        ${p>0?`<div class="history-progress-wrap">
          <div class="history-progress-bar"><div class="history-progress-fill" style="width:${p}%"></div></div>
          <div class="history-progress-pct">${Math.round(p)}% watched</div>
        </div>`:''}
        <button class="btn-remove-history" onclick="removeFromHistory(event,'${m.id}')" title="Remove">
          <i class="fas fa-times"></i>
        </button>
      </div>`;
    }).join('')}
  </div>`;
}

function removeFromHistory(e, id) {
  e.stopPropagation();
  const session = DB.getSession();
  if (!session) return;
  const user = DB.getUserById(session.id);
  const history = (user?.watchHistory||[]).filter(h=>h.movieId!==id);
  DB.updateUser(session.id, {watchHistory:history});
  renderFullHistory();
  showToast('Removed from history');
}

// ── INIT ALL v4 FEATURES ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initSplash();
  initAIChat();
  initCinemaMode();
  initSkipIntro();
  addShareToModal();
  renderPushPrompt();
  injectSEOMeta();

  setTimeout(() => {
    injectWatchingCounters();
    renderAdminContentManager();
  }, 800);

  // Re-run on dynamic content
  const obs2 = new MutationObserver(() => injectWatchingCounters());
  obs2.observe(document.body, { childList: true, subtree: true });
});


// ── MOBILE BOTTOM SHEET: tap backdrop to close any open sheet ──
document.addEventListener('click', e => {
  if (!document.body.classList.contains('sheet-open')) return;
  // If click is directly on body::after backdrop (outside any panel)
  const panels = ['notifPanel', 'aiChatPanel'];
  const dropdowns = document.querySelectorAll('.nav-dropdown.show, .notif-panel.show');
  let clickedInsidePanel = false;
  panels.forEach(id => {
    const el = document.getElementById(id);
    if (el && el.contains(e.target)) clickedInsidePanel = true;
  });
  dropdowns.forEach(el => {
    if (el.contains(e.target)) clickedInsidePanel = true;
  });
  if (!clickedInsidePanel) {
    // Close all sheets
    document.querySelectorAll('.notif-panel.show, .nav-dropdown.show').forEach(el => el.classList.remove('show'));
    const aiPanel = document.getElementById('aiChatPanel');
    if (aiPanel) aiPanel.classList.remove('open');
    document.body.classList.remove('sheet-open');
  }
});


// ════════════════════════════════════════════════════════════════
//  NEXTV — ALL NEW FEATURES BLOCK
//  Downloads · Admin Delete Users · AI Poster · Sleep Timer
//  Actor/Director Search · Watch Stats · Points/Badges
//  Sleep Timer · Ratings Dashboard · Leaderboard
// ════════════════════════════════════════════════════════════════

// ── DOWNLOAD HELPERS ──────────────────────────────────────────
const DL_KEY = 'nextv_downloads';
function getDownloads() { try { return JSON.parse(localStorage.getItem(DL_KEY)||'[]'); } catch(e){return[];} }
function saveDownloads(arr) { localStorage.setItem(DL_KEY, JSON.stringify(arr)); }

function isDownloaded(id) { return getDownloads().some(d=>d.id===id); }

function toggleDownload(id, btn) {
  const dls = getDownloads();
  const idx = dls.findIndex(d=>d.id===id);
  if (idx !== -1) {
    dls.splice(idx, 1);
    saveDownloads(dls);
    if (btn) { btn.innerHTML = '<i class="fas fa-download"></i> Download'; btn.classList.remove('downloaded'); }
    showToast('Removed from Downloads');
  } else {
    const m = DB.getMovie(id);
    if (!m) return;
    // Simulate download progress
    if (btn) {
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
      btn.disabled = true;
    }
    let prog = 0;
    const tick = setInterval(() => {
      prog += Math.random() * 25 + 10;
      if (prog >= 100) {
        clearInterval(tick);
        dls.push({ id, title: m.title, savedAt: new Date().toISOString() });
        saveDownloads(dls);
        if (btn) {
          btn.innerHTML = '<i class="fas fa-check-circle"></i> Downloaded';
          btn.classList.add('downloaded');
          btn.disabled = false;
        }
        showToast('✓ Saved to Downloads — watch offline anytime');
      }
    }, 200);
  }
}

// Inject Download button into modal
function injectDownloadBtn(id) {
  const actions = document.querySelector('.modal-actions');
  if (!actions) return;
  let btn = document.getElementById('modalDownload');
  if (!btn) {
    btn = document.createElement('button');
    btn.id = 'modalDownload';
    btn.className = 'btn-dl-modal';
    actions.appendChild(btn);
  }
  const downloaded = isDownloaded(id);
  btn.innerHTML = downloaded
    ? '<i class="fas fa-check-circle"></i> Downloaded'
    : '<i class="fas fa-download"></i> Download';
  btn.className = 'btn-dl-modal' + (downloaded ? ' downloaded' : '');
  btn.onclick = () => toggleDownload(id, btn);
}

// ── PATCH openModal TO ADD DOWNLOAD BTN + AI POSTER ──────────
const _origOpenModal = openModal;
openModal = function(id) {
  _origOpenModal(id);
  injectDownloadBtn(id);
  checkAndGenerateAIPoster(id);
};

// ── AI POSTER GENERATOR (for slow/missing images) ────────────
// Generates a styled SVG poster using movie metadata when image is slow
function checkAndGenerateAIPoster(id) {
  const m = DB.getMovie(id);
  if (!m) return;
  const img = document.getElementById('modalPoster');
  if (!img) return;

  // If image already loaded, nothing to do
  if (img.classList.contains('loaded')) return;

  // After 2 seconds of no load, inject an SVG placeholder with AI-style design
  const timeout = setTimeout(() => {
    if (!img.classList.contains('loaded')) {
      const svg = generateSVGPoster(m);
      img.style.display = 'none';
      let fake = document.getElementById('aiFakePoster');
      if (!fake) {
        fake = document.createElement('div');
        fake.id = 'aiFakePoster';
        img.parentNode.insertBefore(fake, img);
      }
      fake.innerHTML = svg;
      fake.style.cssText = 'width:140px;min-width:140px;height:210px;border-radius:10px;overflow:hidden;flex-shrink:0;';
    }
  }, 2000);

  // Clean up if real image loads
  img.onload = function() {
    clearTimeout(timeout);
    this.classList.add('loaded');
    const fake = document.getElementById('aiFakePoster');
    if (fake) { fake.remove(); img.style.display=''; }
  };
}

function generateSVGPoster(m) {
  // Pick color palette based on genre
  const palettes = {
    'Action':   ['#e50914','#ff6b35'],
    'Horror':   ['#1a0a2e','#8b5cf6'],
    'Sci-Fi':   ['#00d4b4','#0a2a4a'],
    'Romance':  ['#ff6b9d','#ff4757'],
    'Comedy':   ['#f5c518','#ff9500'],
    'Drama':    ['#4a90d9','#1a3a5c'],
    'Fantasy':  ['#8b5cf6','#c084fc'],
    'Thriller': ['#333','#e50914'],
    'Animation':['#00d4b4','#3b82f6'],
    'default':  ['#e50914','#1a1a1a']
  };
  const genre = m.genre?.[0] || 'default';
  const colors = palettes[genre] || palettes['default'];
  const title = m.title || '';
  const year = m.year || '';
  const rating = m.rating || '';
  // Wrap title
  const words = title.split(' ');
  const lines = [];
  let line = '';
  words.forEach(w => {
    if ((line + ' ' + w).length > 14) { if(line) lines.push(line); line = w; }
    else line = line ? line + ' ' + w : w;
  });
  if (line) lines.push(line);
  const titleLines = lines.slice(0,3).map((l,i)=>`<text x="70" y="${115 + i*20}" text-anchor="middle" font-family="Georgia,serif" font-size="13" font-weight="bold" fill="white">${l}</text>`).join('');

  return `<svg width="140" height="210" viewBox="0 0 140 210" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="pg${m.id}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${colors[0]}"/>
        <stop offset="100%" stop-color="${colors[1]}"/>
      </linearGradient>
    </defs>
    <rect width="140" height="210" fill="url(#pg${m.id})" rx="6"/>
    <rect width="140" height="210" fill="rgba(0,0,0,0.35)" rx="6"/>
    <text x="70" y="55" text-anchor="middle" font-size="40" fill="rgba(255,255,255,0.15)" font-family="Georgia">🎬</text>
    <rect x="15" y="95" width="110" height="1" fill="rgba(255,255,255,0.3)"/>
    ${titleLines}
    <rect x="15" y="${115 + Math.min(lines.length,3)*20 + 5}" width="110" height="1" fill="rgba(255,255,255,0.2)"/>
    <text x="70" y="${115 + Math.min(lines.length,3)*20 + 22}" text-anchor="middle" font-family="Arial" font-size="11" fill="rgba(255,255,255,0.7)">${year}  ·  ★ ${rating}</text>
    <text x="70" y="200" text-anchor="middle" font-family="Arial" font-size="9" font-weight="bold" letter-spacing="2" fill="rgba(255,255,255,0.4)">NEX TV</text>
  </svg>`;
}

// ── ENHANCED ADMIN PANEL — User Management + Delete ──────────
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
        <div class="admin-card-sub">${featured} featured · ${all.filter(m=>m.category==='movies').length} movies · ${all.filter(m=>m.category==='series').length} series · ${all.filter(m=>m.category==='anime').length} anime</div>
      </div>
      <div class="admin-card">
        <div class="admin-card-title"><i class="fas fa-users"></i> Registered Users</div>
        <div class="admin-card-value">${users.length}</div>
        <div class="admin-card-sub">${users.filter(u=>u.role==='admin').length} admin · ${users.filter(u=>u.role==='user').length} members</div>
      </div>
      <div class="admin-card" style="grid-column:1/-1;">
        <div class="admin-card-title" style="display:flex;justify-content:space-between;align-items:center;">
          <span><i class="fas fa-users-cog"></i> User Management</span>
          <span style="font-size:.72rem;color:var(--muted);">${users.length} accounts</span>
        </div>
        <div class="admin-users-table" id="adminUsersTable"></div>
      </div>
      <div class="admin-card" style="grid-column:1/-1;">
        <div class="admin-card-title"><i class="fas fa-list"></i> Manage Featured Titles</div>
        <div class="admin-title-list" id="adminTitleList"></div>
      </div>
    </div>`;

  renderAdminUsersTable();
  renderAdminTitleList();
}

function renderAdminUsersTable() {
  const el = document.getElementById('adminUsersTable');
  if (!el) return;
  const users = DB.getUsers();
  const session = DB.getSession();

  el.innerHTML = `
    <div style="overflow-x:auto;">
      <table class="users-table">
        <thead><tr>
          <th>User</th><th>Email</th><th>Role</th><th>Joined</th><th>WL</th><th>Action</th>
        </tr></thead>
        <tbody>
          ${users.map(u => `
            <tr id="urow-${u.id}">
              <td><strong>${u.name}</strong></td>
              <td style="color:var(--muted);font-size:.78rem;">${u.email}</td>
              <td><span class="role-badge ${u.role}">${u.role}</span></td>
              <td style="font-size:.75rem;color:var(--muted);">${u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</td>
              <td style="font-size:.8rem;">${(u.watchlist||[]).length}</td>
              <td>
                ${u.id === session.id
                  ? '<span style="font-size:.72rem;color:var(--muted);">You</span>'
                  : `<button class="btn-admin-del" onclick="adminDeleteUser('${u.id}','${u.name}')"><i class="fas fa-trash"></i> Delete</button>`
                }
              </td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

function adminDeleteUser(userId, userName) {
  if (!confirm(`Delete account for "${userName}"?\n\nThis will permanently remove their account, watchlist, and history. This cannot be undone.`)) return;
  const users = DB.getUsers().filter(u => u.id !== userId);
  DB.saveUsers(users);
  document.getElementById('urow-' + userId)?.remove();
  showToast(`✓ "${userName}" account deleted`);
  // Refresh counts
  const countEl = document.querySelector('.admin-card-value');
  if (countEl) renderAdminPanel();
}

// ── SLEEP TIMER ───────────────────────────────────────────────
let sleepTimerTimeout = null;
let sleepTimerInterval = null;
let sleepTimerEnd = null;

function openSleepTimer() {
  const existing = document.getElementById('sleepTimerModal');
  if (existing) { existing.classList.add('show'); return; }

  const modal = document.createElement('div');
  modal.id = 'sleepTimerModal';
  modal.className = 'sleep-modal';
  modal.innerHTML = `
    <div class="sleep-box">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.25rem;">
        <h3><i class="fas fa-moon" style="color:var(--purple)"></i> Sleep Timer</h3>
        <button class="btn-close-chat" onclick="closeSleepTimer()"><i class="fas fa-times"></i></button>
      </div>
      <p style="color:var(--muted);font-size:.85rem;margin-bottom:1.25rem;">Auto-pause playback after a set time. Perfect for watching in bed.</p>
      <div class="sleep-options" id="sleepOptions">
        ${[15,30,45,60,90,120].map(m=>`
          <button class="sleep-opt" onclick="setSleepTimer(${m})">${m < 60 ? m+'m' : (m/60)+'h'}</button>
        `).join('')}
        <button class="sleep-opt" onclick="setSleepTimer(0)" style="grid-column:1/-1;background:rgba(229,9,20,.08);border-color:rgba(229,9,20,.25);color:var(--red);">
          <i class="fas fa-times"></i> Cancel Timer
        </button>
      </div>
      <div id="sleepTimerActive" style="display:none;text-align:center;padding:.75rem;background:rgba(139,92,246,.08);border-radius:10px;border:1px solid rgba(139,92,246,.2);">
        <div style="font-size:.8rem;color:var(--muted);margin-bottom:.25rem;">Pausing in</div>
        <div id="sleepCountdown" style="font-size:1.6rem;font-weight:800;color:var(--purple);font-family:'Bebas Neue',sans-serif;letter-spacing:.05em;">--:--</div>
      </div>
    </div>`;
  document.body.appendChild(modal);
  requestAnimationFrame(() => modal.classList.add('show'));
}

function closeSleepTimer() {
  document.getElementById('sleepTimerModal')?.classList.remove('show');
}

function setSleepTimer(minutes) {
  clearTimeout(sleepTimerTimeout);
  clearInterval(sleepTimerInterval);
  sleepTimerEnd = null;

  if (minutes === 0) {
    document.getElementById('sleepTimerActive').style.display = 'none';
    document.getElementById('sleepOptions').style.display = 'grid';
    showToast('Sleep timer cancelled');
    closeSleepTimer();
    return;
  }

  sleepTimerEnd = Date.now() + minutes * 60000;
  document.getElementById('sleepOptions').style.display = 'none';
  document.getElementById('sleepTimerActive').style.display = 'block';

  sleepTimerInterval = setInterval(() => {
    const remaining = sleepTimerEnd - Date.now();
    if (remaining <= 0) {
      clearInterval(sleepTimerInterval);
      // Pause any playing iframe (send postMessage)
      document.querySelectorAll('iframe').forEach(f => {
        try { f.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}','*'); } catch(e){}
      });
      showToast('💤 Sleep timer — paused playback');
      document.getElementById('sleepTimerModal')?.remove();
      return;
    }
    const mins = Math.floor(remaining / 60000);
    const secs = Math.floor((remaining % 60000) / 1000);
    const cd = document.getElementById('sleepCountdown');
    if (cd) cd.textContent = `${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
  }, 1000);

  sleepTimerTimeout = setTimeout(() => { closeSleepTimer(); }, minutes * 60000 + 100);
  showToast(`⏰ Sleep timer set — pausing in ${minutes < 60 ? minutes+'m' : (minutes/60)+'h'}`);
}

// ── ACTOR / DIRECTOR SEARCH ───────────────────────────────────
// Extends existing search to also match cast + director names
function searchByPerson(name) {
  const q = name.toLowerCase().trim();
  const all = DB.getMovies();
  return all.filter(m =>
    m.cast?.some(c => c.toLowerCase().includes(q)) ||
    (m.director && m.director.toLowerCase().includes(q))
  );
}

// Patch the nav search to include person results
const _origDoNavSearch = doNavSearch;
doNavSearch = function() {
  _origDoNavSearch();
  // Also inject person results into existing autocomplete
};

// ── WATCH STATS DASHBOARD ─────────────────────────────────────
function getWatchStats() {
  const session = DB.getSession();
  if (!session) return null;
  const user = DB.getUserById(session.id);
  if (!user) return null;
  const history = user.watchHistory || [];
  const all = DB.getMovies();

  const watched = history.map(h => all.find(m => m.id === h.movieId)).filter(Boolean);
  const genreCount = {};
  watched.forEach(m => (m.genre||[]).forEach(g => { genreCount[g] = (genreCount[g]||0)+1; }));
  const topGenre = Object.entries(genreCount).sort((a,b)=>b[1]-a[1])[0];
  const actorCount = {};
  watched.forEach(m => (m.cast||[]).forEach(a => { actorCount[a] = (actorCount[a]||0)+1; }));
  const topActor = Object.entries(actorCount).sort((a,b)=>b[1]-a[1])[0];

  return {
    total: watched.length,
    movies: watched.filter(m=>m.category==='movies').length,
    series: watched.filter(m=>m.category==='series').length,
    anime: watched.filter(m=>m.category==='anime').length,
    topGenre: topGenre?.[0] || 'N/A',
    topGenreCount: topGenre?.[1] || 0,
    topActor: topActor?.[0] || 'N/A',
    avgRating: watched.length ? (watched.reduce((s,m)=>s+(m.rating||0),0)/watched.length).toFixed(1) : 'N/A',
    watchlistSize: (user.watchlist||[]).length
  };
}

function renderWatchStatsBadge() {
  const stats = getWatchStats();
  if (!stats || stats.total === 0) return '';
  return `
    <div class="watch-stats-mini">
      <div class="ws-item"><span class="ws-num">${stats.total}</span><span class="ws-label">Watched</span></div>
      <div class="ws-divider"></div>
      <div class="ws-item"><span class="ws-num">${stats.topGenre}</span><span class="ws-label">Top Genre</span></div>
      <div class="ws-divider"></div>
      <div class="ws-item"><span class="ws-num">${stats.avgRating}</span><span class="ws-label">Avg Rating</span></div>
      <div class="ws-divider"></div>
      <div class="ws-item"><span class="ws-num">${stats.watchlistSize}</span><span class="ws-label">In List</span></div>
    </div>`;
}

// ── POINTS & BADGES SYSTEM ────────────────────────────────────
const BADGE_DEFS = [
  { id:'first_watch',   icon:'🎬', name:'First Watch',    desc:'Watched your first title',        req: s => s.total >= 1 },
  { id:'binge5',        icon:'🍿', name:'Binge Starter',  desc:'Watched 5+ titles',               req: s => s.total >= 5 },
  { id:'binge20',       icon:'🔥', name:'Binge King',     desc:'Watched 20+ titles',              req: s => s.total >= 20 },
  { id:'movie_buff',    icon:'🎥', name:'Movie Buff',     desc:'Watched 10+ movies',              req: s => s.movies >= 10 },
  { id:'anime_lord',    icon:'⚡', name:'Anime Lord',     desc:'Watched 5+ anime',                req: s => s.anime >= 5 },
  { id:'watchlist_pro', icon:'📌', name:'Curator',        desc:'Added 10+ to your list',          req: s => s.watchlistSize >= 10 },
  { id:'critic',        icon:'⭐', name:'Film Critic',    desc:'Watches only high-rated content', req: s => parseFloat(s.avgRating) >= 8.0 },
  { id:'series_addict', icon:'📺', name:'Series Addict',  desc:'Watched 5+ TV shows',             req: s => s.series >= 5 },
];

function getEarnedBadges() {
  const stats = getWatchStats();
  if (!stats) return [];
  return BADGE_DEFS.filter(b => b.req(stats));
}

function getPoints() {
  const stats = getWatchStats();
  if (!stats) return 0;
  return (stats.total * 10) + (stats.watchlistSize * 5) + (getEarnedBadges().length * 50);
}

function renderBadgesSection(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const earned = getEarnedBadges();
  const all = BADGE_DEFS;
  const points = getPoints();

  el.innerHTML = `
    <div class="badges-section">
      <div class="badges-header">
        <div>
          <h3 style="font-size:1rem;font-weight:700;margin-bottom:.15rem;"><i class="fas fa-trophy" style="color:var(--gold)"></i> Your Achievements</h3>
          <div style="font-size:.8rem;color:var(--muted);">${earned.length}/${all.length} badges unlocked</div>
        </div>
        <div class="points-badge"><i class="fas fa-star"></i> ${points} XP</div>
      </div>
      <div class="badges-grid">
        ${all.map(b => {
          const unlocked = earned.find(e=>e.id===b.id);
          return `<div class="badge-item ${unlocked?'unlocked':'locked'}" title="${b.desc}">
            <span class="badge-emoji">${b.icon}</span>
            <span class="badge-name">${b.name}</span>
            ${unlocked ? '' : '<span class="badge-lock"><i class="fas fa-lock"></i></span>'}
          </div>`;
        }).join('')}
      </div>
    </div>`;
}

// ── RELEASE CALENDAR (lightweight) ───────────────────────────
function renderReleaseCalendar(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  // Upcoming titles (2025+)
  const all = DB.getMovies();
  const upcoming = all.filter(m=>m.year >= 2024).sort((a,b)=>b.year-a.year).slice(0,8);

  el.innerHTML = `
    <div class="calendar-section">
      <div class="row-header" style="margin-bottom:.75rem;">
        <h2><i class="fas fa-calendar-alt" style="color:var(--gold)"></i> Coming Soon</h2>
      </div>
      <div class="calendar-list">
        ${upcoming.map(m=>`
          <div class="cal-item" onclick="openModal('${m.id}')">
            <img src="${m.poster}" alt="${m.title}" onerror="this.src=''" class="cal-poster">
            <div class="cal-info">
              <div class="cal-title">${m.title}</div>
              <div class="cal-year">${m.year} · ${m.genre?.[0]||''}</div>
            </div>
            <span class="cal-badge">${m.year >= 2025 ? 'NEW' : m.year}</span>
          </div>`).join('')}
      </div>
    </div>`;
}

// ── INJECT DOWNLOAD BTN INTO WATCH PAGE PLAYER BAR ───────────
function injectWatchPageDownloadBtn() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (!id) return;
  const serverBar = document.querySelector('.server-bar');
  if (!serverBar) return;
  if (document.getElementById('watchDlBtn')) return;

  const btn = document.createElement('button');
  btn.id = 'watchDlBtn';
  btn.className = 'srv-btn' + (isDownloaded(id) ? ' active' : '');
  btn.innerHTML = isDownloaded(id)
    ? '<i class="fas fa-check-circle"></i> Downloaded'
    : '<i class="fas fa-download"></i> Download';
  btn.title = 'Save for offline viewing';
  btn.onclick = () => toggleDownload(id, btn);
  serverBar.appendChild(btn);
}

// ── INJECT SLEEP TIMER BTN INTO WATCH PAGE ────────────────────
function injectSleepTimerBtn() {
  const serverBar = document.querySelector('.server-bar');
  if (!serverBar || document.getElementById('sleepBtn')) return;
  const btn = document.createElement('button');
  btn.id = 'sleepBtn';
  btn.className = 'srv-btn';
  btn.innerHTML = '<i class="fas fa-moon"></i> Sleep';
  btn.title = 'Set sleep timer';
  btn.onclick = openSleepTimer;
  serverBar.appendChild(btn);
}

// Auto-init on watch page
if (window.location.pathname.includes('watch.html')) {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      injectWatchPageDownloadBtn();
      injectSleepTimerBtn();
    }, 800);
  });
}

// ── ENHANCED SEARCH — add actor/director results ──────────────
const _origInitSearchAC = initSearchAutocomplete;
initSearchAutocomplete = function() {
  _origInitSearchAC();

  const input = document.getElementById('searchAC') || document.getElementById('searchInput');
  if (!input) return;

  const _origInput = input.oninput;
  input.addEventListener('input', function() {
    const q = this.value.trim().toLowerCase();
    if (q.length < 2) return;
    const all = DB.getMovies();
    const personResults = searchByPerson(q).slice(0,3);
    if (!personResults.length) return;

    const acList = document.querySelector('.ac-list');
    if (!acList) return;
    const divider = document.createElement('div');
    divider.className = 'ac-divider';
    divider.innerHTML = '<span>By Cast / Director</span>';
    acList.appendChild(divider);
    personResults.forEach(m => {
      const item = document.createElement('div');
      item.className = 'ac-item';
      item.innerHTML = `<img src="${m.poster}" class="ac-poster"> <div><div class="ac-title">${m.title}</div><div class="ac-sub" style="color:var(--teal);font-size:.7rem;"><i class="fas fa-user"></i> ${m.cast?.find(c=>c.toLowerCase().includes(q))||m.director}</div></div>`;
      item.onclick = () => { openModal(m.id); document.getElementById('searchAC')?.classList.remove('show'); };
      acList.appendChild(item);
    });
  });
};

