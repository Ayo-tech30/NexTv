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
  heroMovies = DB.getMovies().filter(m => m.featured);
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
  'm2','m3','m12','m13','m44','m57','m42','m43',  // movies
  'a1','a2','a3','a4','a29','a26','a27','a28',     // anime
  's1','s2','s3','s5','s8',                         // series
  'c27','c26','c2','c24'                            // cartoons
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
