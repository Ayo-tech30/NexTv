// ─── NEX TV DATABASE ──────────────────────────────────────────────────────────
const DB = {
  init() {
    if (!localStorage.getItem('nextv_users')) {
      localStorage.setItem('nextv_users', JSON.stringify([{
        id:'admin-001', email:'ibraheemyakub48@gmail.com',
        password:btoa('ibraheem123'), name:'Ibraheem Yakub',
        role:'admin', avatar:null, watchlist:[], watchHistory:[],
        createdAt: new Date().toISOString()
      }]));
    }
    localStorage.setItem('nextv_movies', JSON.stringify(MOVIES));
    if (!localStorage.getItem('nextv_session')) {
      localStorage.setItem('nextv_session', 'null');
    }
  },
  getUsers(){ return JSON.parse(localStorage.getItem('nextv_users'))||[]; },
  saveUsers(u){ localStorage.setItem('nextv_users', JSON.stringify(u)); },
  getUserByEmail(e){ return this.getUsers().find(u => u.email.toLowerCase() === e.toLowerCase()); },
  getUserById(id){ return this.getUsers().find(u => u.id === id); },
  createUser(email, password, name){
    const users = this.getUsers();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) return { error: 'Email already registered.' };
    const user = { id:'user-'+Date.now(), email, password:btoa(password), name,
      role:'user', avatar:null, watchlist:[], watchHistory:[], createdAt: new Date().toISOString() };
    users.push(user); this.saveUsers(users); return { user };
  },
  updateUser(id, updates){
    const users = this.getUsers(); const idx = users.findIndex(u => u.id === id);
    if (idx === -1) return false; users[idx] = {...users[idx], ...updates}; this.saveUsers(users); return users[idx];
  },
  getSession(){ return JSON.parse(localStorage.getItem('nextv_session')); },
  setSession(user){
    localStorage.setItem('nextv_session', JSON.stringify({id:user.id, email:user.email, name:user.name, role:user.role}));
  },
  clearSession(){ localStorage.setItem('nextv_session', 'null'); },
  login(email, password){
    const user = this.getUserByEmail(email);
    if (!user) return { error: 'No account found with that email.' };
    if (atob(user.password) !== password) return { error: 'Incorrect password.' };
    this.setSession(user); return { user };
  },
  logout(){ this.clearSession(); },
  getMovies(){ return JSON.parse(localStorage.getItem('nextv_movies'))||[]; },
  getMovie(id){ return this.getMovies().find(m => m.id === id); },
  toggleWatchlist(userId, movieId){
    const user = this.getUserById(userId); if (!user) return;
    const wl = user.watchlist||[]; const idx = wl.indexOf(movieId);
    if (idx === -1) wl.push(movieId); else wl.splice(idx, 1);
    this.updateUser(userId, {watchlist: wl}); this.setSession(this.getUserById(userId)); return wl;
  },
  addToHistory(userId, movieId){
    const user = this.getUserById(userId); if (!user) return;
    let h = user.watchHistory||[]; h = h.filter(x => x.movieId !== movieId);
    h.unshift({movieId, watchedAt: new Date().toISOString()}); h = h.slice(0, 50);
    this.updateUser(userId, {watchHistory: h});
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  MOVIES — 100% FREE, FULL LENGTH, LEGAL
//  videoType: 'archive'  → embed via archive.org player
//             'youtube'  → embed via youtube (full movie, public/free)
//             'iframe'   → direct iframe src
//  videoSrc: the identifier / URL used to build the embed
// ─────────────────────────────────────────────────────────────────────────────
const MOVIES = [

  // ══════════════════════ CLASSIC ACTION / ADVENTURE ══════════════════════

  {id:'m1', title:'Treasure Island', year:1950, genre:['Adventure','Family'], rating:7.1, duration:'1h 36m',
   director:'Byron Haskin', cast:['Bobby Driscoll','Robert Newton','Basil Sydney'],
   description:"Young Jim Hawkins teams up with Long John Silver on a dangerous sea voyage to find buried pirate treasure on a remote island. Disney's classic swashbuckling adventure.",
   poster:'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Treasure_Island_%281950_film%29.jpg/500px-Treasure_Island_%281950_film%29.jpg',
   backdrop:'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Treasure_Island_%281950_film%29.jpg/1200px-Treasure_Island_%281950_film%29.jpg',
   videoType:'archive', videoSrc:'treasure-island-1950',
   featured:true, category:'movies'},

  {id:'m2', title:'His Girl Friday', year:1940, genre:['Comedy','Crime'], rating:7.9, duration:'1h 32m',
   director:'Howard Hawks', cast:['Cary Grant','Rosalind Russell','Ralph Bellamy'],
   description:"A fast-talking newspaper editor schemes to keep his ace reporter and ex-wife from remarrying by sending her on a major story involving a condemned killer.",
   poster:'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/His_Girl_Friday_%281940_film%29.jpg/500px-His_Girl_Friday_%281940_film%29.jpg',
   backdrop:'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/His_Girl_Friday_%281940_film%29.jpg/1200px-His_Girl_Friday_%281940_film%29.jpg',
   videoType:'archive', videoSrc:'HisGirlFriday_1940',
   featured:false, category:'movies'},

  {id:'m3', title:'The General', year:1926, genre:['Action','Comedy'], rating:8.1, duration:'1h 19m',
   director:'Buster Keaton', cast:['Buster Keaton','Marion Mack','Glen Cavender'],
   description:"Confederate train engineer Johnnie Gray single-handedly rescues his beloved locomotive and his girlfriend from Union spies. Buster Keaton's masterpiece of silent comedy and action.",
   poster:'https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Thegeneral_1926.jpg/500px-Thegeneral_1926.jpg',
   backdrop:'https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Thegeneral_1926.jpg/1200px-Thegeneral_1926.jpg',
   videoType:'archive', videoSrc:'TheGeneral_1926',
   featured:true, category:'movies'},

  {id:'m4', title:'Nosferatu', year:1922, genre:['Horror','Drama'], rating:7.9, duration:'1h 21m',
   director:'F.W. Murnau', cast:['Max Schreck','Gustav von Wangenheim','Greta Schröder'],
   description:"The original vampire horror film. Thomas Hutter travels to Transylvania to complete a real estate transaction with the mysterious Count Orlok — and discovers a horrifying truth.",
   poster:'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Nosferatu_poster.jpg/500px-Nosferatu_poster.jpg',
   backdrop:'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Nosferatu_poster.jpg/1200px-Nosferatu_poster.jpg',
   videoType:'archive', videoSrc:'Nosferatu_1922',
   featured:true, category:'movies'},

  {id:'m5', title:'Metropolis', year:1927, genre:['Sci-Fi','Drama'], rating:8.3, duration:'2h 33m',
   director:'Fritz Lang', cast:['Alfred Abel','Gustav Fröhlich','Brigitte Helm'],
   description:"In a futuristic city sharply divided between workers and the ruling class, a mediator tries to find common ground between the scheming master of the city and the workers. Groundbreaking sci-fi epic.",
   poster:'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Metropolis_poster.jpg/500px-Metropolis_poster.jpg',
   backdrop:'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Metropolis_poster.jpg/1200px-Metropolis_poster.jpg',
   videoType:'archive', videoSrc:'Metropolis_1927',
   featured:true, category:'movies'},

  {id:'m6', title:'Plan 9 from Outer Space', year:1957, genre:['Sci-Fi','Horror'], rating:4.0, duration:'1h 19m',
   director:'Ed Wood', cast:['Bela Lugosi','Vampira','Tor Johnson'],
   description:"Aliens resurrect dead humans as zombies and vampires to stop humans from creating a doomsday weapon. The ultimate so-bad-it\'s-good cult classic.",
   poster:'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Plan_9_Alternative_poster.jpg/500px-Plan_9_Alternative_poster.jpg',
   backdrop:'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Plan_9_Alternative_poster.jpg/1200px-Plan_9_Alternative_poster.jpg',
   videoType:'archive', videoSrc:'Plan9fromOuterSpace',
   featured:false, category:'movies'},

  {id:'m7', title:'Night of the Living Dead', year:1968, genre:['Horror'], rating:7.9, duration:'1h 36m',
   director:'George A. Romero', cast:['Duane Jones','Judith O\'Dea','Karl Hardman'],
   description:"A group of people hide from bloodthirsty zombies in a rural farmhouse. The film that invented the modern zombie genre — terrifying even today.",
   poster:'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Night_of_the_living_dead_affiche.jpg/500px-Night_of_the_living_dead_affiche.jpg',
   backdrop:'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Night_of_the_living_dead_affiche.jpg/1200px-Night_of_the_living_dead_affiche.jpg',
   videoType:'archive', videoSrc:'night_of_the_living_dead',
   featured:false, category:'movies'},

  {id:'m8', title:'The Phantom of the Opera', year:1925, genre:['Horror','Drama'], rating:7.6, duration:'1h 33m',
   director:'Rupert Julian', cast:['Lon Chaney','Mary Philbin','Norman Kerry'],
   description:"A disfigured musical genius haunts the Paris Opera House, terrorizing the company while falling madly in love with a young soprano. The legendary silent horror classic.",
   poster:'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Phantom_of_the_opera_1925.jpg/500px-Phantom_of_the_opera_1925.jpg',
   backdrop:'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Phantom_of_the_opera_1925.jpg/1200px-Phantom_of_the_opera_1925.jpg',
   videoType:'archive', videoSrc:'ThePhantomOfTheOpera1925',
   featured:false, category:'movies'},

  {id:'m9', title:'Dr. Jekyll and Mr. Hyde', year:1920, genre:['Horror','Drama'], rating:7.4, duration:'1h 16m',
   director:'John S. Robertson', cast:['John Barrymore','Nita Naldi','Brandon Hurst'],
   description:"Dr. Jekyll experiments with a potion that transforms him into the terrifying and murderous Mr. Hyde. The classic tale of good versus evil within one man.",
   poster:'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Dr_Jekyll_Mr_Hyde_poster_edit2.jpg/500px-Dr_Jekyll_Mr_Hyde_poster_edit2.jpg',
   backdrop:'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Dr_Jekyll_Mr_Hyde_poster_edit2.jpg/1200px-Dr_Jekyll_Mr_Hyde_poster_edit2.jpg',
   videoType:'archive', videoSrc:'Dr.JekyllandMr.Hyde1920',
   featured:false, category:'movies'},

  {id:'m10', title:'The Kid', year:1921, genre:['Comedy','Drama'], rating:8.3, duration:'1h 8m',
   director:'Charles Chaplin', cast:['Charles Chaplin','Jackie Coogan','Edna Purviance'],
   description:"The Tramp cares for an abandoned child, but when the boy is threatened with removal from their home, they must fight to stay together. Chaplin\'s first full-length masterpiece.",
   poster:'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Thekid_poster.jpg/500px-Thekid_poster.jpg',
   backdrop:'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Thekid_poster.jpg/1200px-Thekid_poster.jpg',
   videoType:'archive', videoSrc:'TheKid_1921',
   featured:true, category:'movies'},

  {id:'m11', title:'Modern Times', year:1936, genre:['Comedy','Drama'], rating:8.5, duration:'1h 27m',
   director:'Charles Chaplin', cast:['Charles Chaplin','Paulette Goddard','Henry Bergman'],
   description:"The Tramp struggles to survive in the modern industrial world, falling in love with a gamin girl. Chaplin\'s brilliant satire of industrialization remains timeless.",
   poster:'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/ModernTimes_1936.jpg/500px-ModernTimes_1936.jpg',
   backdrop:'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/ModernTimes_1936.jpg/1200px-ModernTimes_1936.jpg',
   videoType:'archive', videoSrc:'ModernTimes_1936',
   featured:false, category:'movies'},

  {id:'m12', title:'It\'s a Wonderful Life', year:1946, genre:['Drama','Fantasy'], rating:8.6, duration:'2h 10m',
   director:'Frank Capra', cast:['James Stewart','Donna Reed','Lionel Barrymore'],
   description:"An angel helps a compassionate but despairingly frustrated businessman by showing what life would have been like had he never existed. One of the greatest films ever made.",
   poster:'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Its_a_Wonderful_Life_%281946_film%29.jpg/500px-Its_a_Wonderful_Life_%281946_film%29.jpg',
   backdrop:'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Its_a_Wonderful_Life_%281946_film%29.jpg/1200px-Its_a_Wonderful_Life_%281946_film%29.jpg',
   videoType:'archive', videoSrc:'its-a-wonderful-life-1947',
   featured:true, category:'movies'},

  {id:'m13', title:'Sherlock Jr.', year:1924, genre:['Comedy','Mystery'], rating:8.2, duration:'45m',
   director:'Buster Keaton', cast:['Buster Keaton','Kathryn McGuire','Joe Keaton'],
   description:"A film projectionist who longs to be a detective dreams himself into the movie he\'s showing to solve the mystery of a stolen watch. Buster Keaton\'s masterpiece of visual comedy.",
   poster:'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Sherlock_Jr_%281924%29.jpg/500px-Sherlock_Jr_%281924%29.jpg',
   backdrop:'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Sherlock_Jr_%281924%29.jpg/1200px-Sherlock_Jr_%281924%29.jpg',
   videoType:'archive', videoSrc:'Sherlock_Jr_1924',
   featured:false, category:'movies'},

  {id:'m14', title:'The Gold Rush', year:1925, genre:['Comedy','Adventure'], rating:8.1, duration:'1h 36m',
   director:'Charles Chaplin', cast:['Charles Chaplin','Mack Swain','Tom Murray'],
   description:"The Lone Prospector heads to the Klondike during the gold rush and falls in love with a dance hall girl. Chaplin at his most magical — featuring the iconic shoe-eating scene.",
   poster:'https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/The_Gold_Rush.jpg/500px-The_Gold_Rush.jpg',
   backdrop:'https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/The_Gold_Rush.jpg/1200px-The_Gold_Rush.jpg',
   videoType:'archive', videoSrc:'TheGoldRush1925',
   featured:false, category:'movies'},

  {id:'m15', title:'Dracula', year:1931, genre:['Horror'], rating:7.4, duration:'1h 15m',
   director:'Tod Browning', cast:['Bela Lugosi','Helen Chandler','David Manners'],
   description:"The original Dracula — Bela Lugosi\'s iconic portrayal of Count Dracula, a vampire who preys on a young woman and must be stopped by Professor Van Helsing.",
   poster:'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Dracula1931.jpg/500px-Dracula1931.jpg',
   backdrop:'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Dracula1931.jpg/1200px-Dracula1931.jpg',
   videoType:'archive', videoSrc:'Dracula_1931_Universal',
   featured:false, category:'movies'},

  {id:'m16', title:'Frankenstein', year:1931, genre:['Horror','Sci-Fi'], rating:7.8, duration:'1h 11m',
   director:'James Whale', cast:['Boris Karloff','Colin Clive','Mae Clarke'],
   description:"Dr. Frankenstein creates a monster from dead body parts. Boris Karloff\'s iconic performance terrified audiences in 1931 and the creature remains one of cinema\'s greatest monsters.",
   poster:'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Frankenstein_poster_1931.jpg/500px-Frankenstein_poster_1931.jpg',
   backdrop:'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Frankenstein_poster_1931.jpg/1200px-Frankenstein_poster_1931.jpg',
   videoType:'archive', videoSrc:'Frankenstein_1931',
   featured:false, category:'movies'},

  {id:'m17', title:'The Maltese Falcon', year:1941, genre:['Crime','Mystery'], rating:8.0, duration:'1h 40m',
   director:'John Huston', cast:['Humphrey Bogart','Mary Astor','Peter Lorre'],
   description:"Private detective Sam Spade is hired to track down a missing woman and gets entangled in a deadly search for a priceless statuette. Bogart defines cool in this noir classic.",
   poster:'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Maltese_falcon_movie_poster.jpg/500px-Maltese_falcon_movie_poster.jpg',
   backdrop:'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Maltese_falcon_movie_poster.jpg/1200px-Maltese_falcon_movie_poster.jpg',
   videoType:'archive', videoSrc:'the-maltese-falcon-1941',
   featured:true, category:'movies'},

  {id:'m18', title:'White Zombie', year:1932, genre:['Horror'], rating:6.7, duration:'1h 7m',
   director:'Victor Halperin', cast:['Bela Lugosi','Madge Bellamy','John Harron'],
   description:"A young couple visiting Haiti finds their relationship threatened by a practitioner of voodoo magic who transforms women into zombie slaves. The first real zombie movie ever made.",
   poster:'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/White_zombie_1932_film_poster.jpg/500px-White_zombie_1932_film_poster.jpg',
   backdrop:'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/White_zombie_1932_film_poster.jpg/1200px-White_zombie_1932_film_poster.jpg',
   videoType:'archive', videoSrc:'white-zombie-1932',
   featured:false, category:'movies'},

  {id:'m19', title:'Safety Last!', year:1923, genre:['Comedy','Action'], rating:8.1, duration:'1h 10m',
   director:'Fred C. Newmeyer', cast:['Harold Lloyd','Mildred Davis','Bill Strother'],
   description:"A small-town boy moves to the city to make his fortune, but things go wrong and he ends up climbing the outside of a tall building. Harold Lloyd\'s most iconic film.",
   poster:'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Safety_last_poster.jpg/500px-Safety_last_poster.jpg',
   backdrop:'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Safety_last_poster.jpg/1200px-Safety_last_poster.jpg',
   videoType:'archive', videoSrc:'SafetyLast',
   featured:false, category:'movies'},

  {id:'m20', title:'The Cabinet of Dr. Caligari', year:1920, genre:['Horror','Mystery'], rating:8.0, duration:'1h 7m',
   director:'Robert Wiene', cast:['Werner Krauss','Conrad Veidt','Friedrich Feher'],
   description:"A hypnotist uses a somnambulist to commit murders in a German mountain village. The most celebrated film of German Expressionism and one of the most influential horror films ever made.",
   poster:'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Das_Cabinet_des_Dr._Caligari.jpg/500px-Das_Cabinet_des_Dr._Caligari.jpg',
   backdrop:'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Das_Cabinet_des_Dr._Caligari.jpg/1200px-Das_Cabinet_des_Dr._Caligari.jpg',
   videoType:'archive', videoSrc:'TheCabinetOfDrCaligari',
   featured:false, category:'movies'},

  {id:'m21', title:'D.W. Griffith\'s Broken Blossoms', year:1919, genre:['Drama','Romance'], rating:7.5, duration:'1h 30m',
   director:'D.W. Griffith', cast:['Lillian Gish','Richard Barthelmess','Donald Crisp'],
   description:"A gentle Chinese man tries to protect a battered girl from her brutal father in the slums of London. A landmark of early silent cinema.",
   poster:'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Broken-Blossoms-Poster.jpg/500px-Broken-Blossoms-Poster.jpg',
   backdrop:'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Broken-Blossoms-Poster.jpg/1200px-Broken-Blossoms-Poster.jpg',
   videoType:'archive', videoSrc:'BrokenBlossoms',
   featured:false, category:'movies'},

  {id:'m22', title:'Sunrise: A Song of Two Humans', year:1927, genre:['Drama','Romance'], rating:8.1, duration:'1h 34m',
   director:'F.W. Murnau', cast:['George O\'Brien','Janet Gaynor','Margaret Livingston'],
   description:"A farmer is tempted to murder his wife for another woman, but ultimately redeems himself. Winner of the first Academy Award for Unique and Artistic Picture. A cinematic masterpiece.",
   poster:'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Sunrise_A_Song_of_Two_Humans_%281927_film%29_poster.jpg/500px-Sunrise_A_Song_of_Two_Humans_%281927_film%29_poster.jpg',
   backdrop:'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Sunrise_A_Song_of_Two_Humans_%281927_film%29_poster.jpg/1200px-Sunrise_A_Song_of_Two_Humans_%281927_film%29_poster.jpg',
   videoType:'archive', videoSrc:'sunrise-a-song-of-two-humans-1927',
   featured:false, category:'movies'},

  {id:'m23', title:'His Majesty, the Scarecrow of Oz', year:1914, genre:['Fantasy','Adventure'], rating:6.5, duration:'1h',
   director:'L. Frank Baum', cast:['Frank Moore','Violet MacMillan','Pierre Couderc'],
   description:"Dorothy comes to Oz and joins forces with the Tin Woodman, the Scarecrow, and a prince to free the King\'s daughter from an evil witch. The original Oz film!",
   poster:'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/His_Majesty_the_Scarecrow_of_Oz_poster.jpg/500px-His_Majesty_the_Scarecrow_of_Oz_poster.jpg',
   backdrop:'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/His_Majesty_the_Scarecrow_of_Oz_poster.jpg/1200px-His_Majesty_the_Scarecrow_of_Oz_poster.jpg',
   videoType:'archive', videoSrc:'HisMajestyTheScarecrowOfOz',
   featured:false, category:'movies'},

  // ══════════════════════ SERIES (Public Domain / Free ══════════════════════

  {id:'s1', title:'The Lone Ranger', year:1949, genre:['Western','Action'], rating:7.5, duration:'3 Seasons · 78 Eps',
   director:'Various', cast:['Clayton Moore','Jay Silverheels'],
   description:"The masked Texas Ranger and his faithful companion Tonto ride the American West bringing justice to outlaws. Classic TV western series — all episodes completely free.",
   poster:'https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Lone_Ranger_1949.jpg/500px-Lone_Ranger_1949.jpg',
   backdrop:'https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Lone_Ranger_1949.jpg/1200px-Lone_Ranger_1949.jpg',
   videoType:'archive', videoSrc:'the-lone-ranger-s1-ep1',
   featured:true, category:'series',
   type:'series', seasons:3,
   episodeIds:{
     1:['lone_ranger_enter_the_lone_ranger','lone_ranger_high_heels','lone_ranger_legion_of_old_timers','lone_ranger_return_of_solo','lone_ranger_tenderness'],
     2:['lone_ranger_s02e01','lone_ranger_s02e02','lone_ranger_s02e03'],
     3:['lone_ranger_s03e01','lone_ranger_s03e02','lone_ranger_s03e03']
   }},

  {id:'s2', title:'The Twilight Zone', year:1959, genre:['Sci-Fi','Horror'], rating:9.0, duration:'5 Seasons · 156 Eps',
   director:'Rod Serling', cast:['Rod Serling','Burgess Meredith','Jack Klugman'],
   description:"Anthology drama/thriller series exploring ordinary people caught in extraordinary circumstances. Rod Serling\'s masterwork remains the greatest anthology series ever made.",
   poster:'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Twilight_Zone_tv_title_card.jpg/500px-Twilight_Zone_tv_title_card.jpg',
   backdrop:'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Twilight_Zone_tv_title_card.jpg/1200px-Twilight_Zone_tv_title_card.jpg',
   videoType:'archive', videoSrc:'twilight-zone-s1-e1',
   featured:true, category:'series',
   type:'series', seasons:5,
   episodeIds:{
     1:['TwilightZoneS01E01','TwilightZoneS01E02','TwilightZoneS01E03'],
     2:['TwilightZoneS02E01','TwilightZoneS02E02'],
     3:['TwilightZoneS03E01','TwilightZoneS03E02'],
     4:['TwilightZoneS04E01'],
     5:['TwilightZoneS05E01']
   }},

  {id:'s3', title:'Flash Gordon', year:1936, genre:['Sci-Fi','Adventure'], rating:7.3, duration:'1 Season · 13 Eps',
   director:'Frederick Stephani', cast:['Buster Crabbe','Jean Rogers','Charles Middleton'],
   description:"Flash Gordon, Dale Arden and scientist Dr. Zarkov rocket to the planet Mongo to stop the evil Emperor Ming from destroying Earth. The original space adventure serial.",
   poster:'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/FlashGordon1936.jpg/500px-FlashGordon1936.jpg',
   backdrop:'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/FlashGordon1936.jpg/1200px-FlashGordon1936.jpg',
   videoType:'archive', videoSrc:'FlashGordon_1936_Ch01',
   featured:false, category:'series',
   type:'series', seasons:1,
   episodeIds:{
     1:['FlashGordon_1936_Ch01','FlashGordon_1936_Ch02','FlashGordon_1936_Ch03','FlashGordon_1936_Ch04','FlashGordon_1936_Ch05']
   }},

  {id:'s4', title:'Buck Rogers', year:1939, genre:['Sci-Fi','Adventure'], rating:6.8, duration:'1 Season · 12 Eps',
   director:'Ford Beebe', cast:['Buster Crabbe','Constance Moore','Jackie Moran'],
   description:"Buck Rogers, frozen for 500 years, awakens in the 25th century and joins Earth\'s forces against the tyrannical Killer Kane. Classic science fiction serial.",
   poster:'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Buck_Rogers_1939_serial.jpg/500px-Buck_Rogers_1939_serial.jpg',
   backdrop:'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Buck_Rogers_1939_serial.jpg/1200px-Buck_Rogers_1939_serial.jpg',
   videoType:'archive', videoSrc:'BuckRogers_1939_Ch01',
   featured:false, category:'series',
   type:'series', seasons:1,
   episodeIds:{
     1:['BuckRogers_1939_Ch01','BuckRogers_1939_Ch02','BuckRogers_1939_Ch03','BuckRogers_1939_Ch04']
   }},

  {id:'s5', title:'Zorro\'s Fighting Legion', year:1939, genre:['Western','Action'], rating:7.2, duration:'1 Season · 12 Eps',
   director:'William Witney', cast:['Reed Hadley','Sheila Darcy','William Corson'],
   description:"Zorro organizes a band of fighters to protect gold shipments needed to establish the Mexican Republic from a fanatical villain who claims to be the Aztec god Don Del Oro.",
   poster:'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Zorros_Fighting_Legion.jpg/500px-Zorros_Fighting_Legion.jpg',
   backdrop:'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Zorros_Fighting_Legion.jpg/1200px-Zorros_Fighting_Legion.jpg',
   videoType:'archive', videoSrc:'ZorrosFightingLegion_1939_Ch01',
   featured:false, category:'series',
   type:'series', seasons:1,
   episodeIds:{
     1:['ZorrosFightingLegion_1939_Ch01','ZorrosFightingLegion_1939_Ch02','ZorrosFightingLegion_1939_Ch03']
   }},

  // ══════════════════════ ANIME (YouTube Free Full Episodes) ══════════════════════

  {id:'a1', title:'Astro Boy (Original)', year:1963, genre:['Action','Sci-Fi'], rating:7.8, duration:'1 Season · 193 Eps',
   director:'Osamu Tezuka', cast:['Billie Lou Watt','Gilbert Mack','Ray Owens'],
   description:"Astro Boy is a robot boy with a human heart, created by a scientist to replace his son. He fights crime and injustice while searching for acceptance in the human world. The anime that started it all.",
   poster:'https://upload.wikimedia.org/wikipedia/en/thumb/8/8a/Astroboy_animestyle.jpg/500px-Astroboy_animestyle.jpg',
   backdrop:'https://upload.wikimedia.org/wikipedia/en/thumb/8/8a/Astroboy_animestyle.jpg/1200px-Astroboy_animestyle.jpg',
   videoType:'youtube', videoSrc:'_y4Rc1SFHXU',
   featured:true, category:'anime',
   type:'series', seasons:1,
   youtubePlaylist:[
     {ep:1, ytId:'_y4Rc1SFHXU', title:'Birth of Astro Boy'},
     {ep:2, ytId:'9kFpQAjLlpE', title:'Franken'},
     {ep:3, ytId:'XBaAWMFJv0Q', title:'The Birth of Astro Boy'},
     {ep:4, ytId:'qdE_yv8XZQQ', title:'Comet Orbiting the Earth'},
     {ep:5, ytId:'RKn0IIuMlnE', title:'The Light Ray Robot'}
   ]},

  {id:'a2', title:'Speed Racer', year:1967, genre:['Action','Adventure'], rating:7.5, duration:'2 Seasons · 52 Eps',
   director:'Tatsuo Yoshida', cast:['Jack Grimes','Corinne Orr','Jack Curtis'],
   description:"Speed Racer competes in races around the world with his incredible Mach 5 car, often clashing with villains who want to win at any cost. The original racing anime.",
   poster:'https://upload.wikimedia.org/wikipedia/en/thumb/b/b3/SpeedRacer1967.jpg/500px-SpeedRacer1967.jpg',
   backdrop:'https://upload.wikimedia.org/wikipedia/en/thumb/b/b3/SpeedRacer1967.jpg/1200px-SpeedRacer1967.jpg',
   videoType:'youtube', videoSrc:'_-F5DINDeSY',
   featured:true, category:'anime',
   type:'series', seasons:2,
   youtubePlaylist:[
     {ep:1, ytId:'_-F5DINDeSY', title:'The Great Plan'},
     {ep:2, ytId:'W6ZT6WiW4B0', title:'The Secret Engine'},
     {ep:3, ytId:'HF5Hk5yvFHI', title:'The Fastest Car on Earth'},
     {ep:4, ytId:'w_BmCR3JMNE', title:'Race Against the Mammoth Car'},
     {ep:5, ytId:'e1OSlvmgBh4', title:'The Most Dangerous Race'}
   ]},

  {id:'a3', title:'Gigantor', year:1963, genre:['Action','Sci-Fi'], rating:7.2, duration:'1 Season · 96 Eps',
   director:'Osamu Tezuka', cast:['Billie Lou Watt','Gilbert Mack'],
   description:"Young Jimmy Sparks and his giant robot Gigantor protect the world from supervillains and criminals. The original giant robot anime that inspired decades of mecha stories.",
   poster:'https://upload.wikimedia.org/wikipedia/en/thumb/b/bf/Gigantor.jpg/500px-Gigantor.jpg',
   backdrop:'https://upload.wikimedia.org/wikipedia/en/thumb/b/bf/Gigantor.jpg/1200px-Gigantor.jpg',
   videoType:'youtube', videoSrc:'QWnze3WHuts',
   featured:false, category:'anime',
   type:'series', seasons:1,
   youtubePlaylist:[
     {ep:1, ytId:'QWnze3WHuts', title:'Gigantor Episode 1'},
     {ep:2, ytId:'EvS8lQlBuDY', title:'Gigantor Episode 2'},
     {ep:3, ytId:'rjRuV_hbMbE', title:'Gigantor Episode 3'},
     {ep:4, ytId:'BxuiGhIGnAE', title:'Gigantor Episode 4'},
     {ep:5, ytId:'4aVnS3kCCPs', title:'Gigantor Episode 5'}
   ]},

  {id:'a4', title:'8th Man', year:1963, genre:['Action','Sci-Fi'], rating:7.0, duration:'1 Season · 56 Eps',
   director:'Hiroshi Sasagawa', cast:['Jack Curtis','Hal Studer','Bobbie Byers'],
   description:"A murdered detective is brought back to life as the android superhero 8th Man, using his powers to protect the city from criminals and robots.",
   poster:'https://upload.wikimedia.org/wikipedia/en/thumb/c/c1/8th_Man_anime.jpg/500px-8th_Man_anime.jpg',
   backdrop:'https://upload.wikimedia.org/wikipedia/en/thumb/c/c1/8th_Man_anime.jpg/1200px-8th_Man_anime.jpg',
   videoType:'youtube', videoSrc:'1oJE5gn8SaM',
   featured:false, category:'anime',
   type:'series', seasons:1,
   youtubePlaylist:[
     {ep:1, ytId:'1oJE5gn8SaM', title:'8th Man Episode 1'},
     {ep:2, ytId:'z_bOPAE5FpA', title:'8th Man Episode 2'},
     {ep:3, ytId:'vUZLDHpjCLA', title:'8th Man Episode 3'},
     {ep:4, ytId:'GVDqH6lHiS0', title:'8th Man Episode 4'},
     {ep:5, ytId:'DPbGcmpYFbI', title:'8th Man Episode 5'}
   ]},

  {id:'a5', title:'Prince Planet', year:1965, genre:['Sci-Fi','Adventure'], rating:6.8, duration:'1 Season · 52 Eps',
   director:'Yoshi Kuroda', cast:['Bobbie Byers','Ray Owens'],
   description:"Prince Planet is sent from his home galaxy to Earth on a mission of goodwill and to evaluate whether humanity is worthy of joining the Universal Peace Corps.",
   poster:'https://upload.wikimedia.org/wikipedia/en/thumb/e/ec/Prince_Planet.jpg/500px-Prince_Planet.jpg',
   backdrop:'https://upload.wikimedia.org/wikipedia/en/thumb/e/ec/Prince_Planet.jpg/1200px-Prince_Planet.jpg',
   videoType:'youtube', videoSrc:'4RfXhT0pBMs',
   featured:false, category:'anime',
   type:'series', seasons:1,
   youtubePlaylist:[
     {ep:1, ytId:'4RfXhT0pBMs', title:'Prince Planet Episode 1'},
     {ep:2, ytId:'nPRvOGZF0t0', title:'Prince Planet Episode 2'},
     {ep:3, ytId:'EDdZ8y7CQWU', title:'Prince Planet Episode 3'},
     {ep:4, ytId:'s9fVcN_qVb8', title:'Prince Planet Episode 4'},
     {ep:5, ytId:'RwqRH2sRFug', title:'Prince Planet Episode 5'}
   ]},

  {id:'a6', title:'Death Note', year:2006, genre:['Thriller','Mystery','Psychological'], rating:9.0, duration:'1 Season · 37 Eps',
   director:'Tetsuro Araki', cast:['Mamoru Miyano (Light)','Kappei Yamaguchi (L)','Shido Nakamura (Ryuk)'],
   description:"Brilliant high school student Light Yagami discovers a supernatural notebook dropped by a Shinigami (death god). Anyone whose name is written in the Death Note dies. Light decides to use it to cleanse the world of evil — becoming a self-appointed god of justice. But the world's greatest detective, known only as 'L', is hot on his trail. A gripping cat-and-mouse psychological thriller that will keep you on the edge of your seat from episode 1 to 37.",
   poster:'https://image.tmdb.org/t/p/w500/iigTWBRGk3QxAnRCEsNVXpSJWPs.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/aDLMHI9oBPdRiF8aSgTHSVgM4Sk.jpg',
   videoType:'youtube', videoSrc:'NlJZ-YgAt-c',
   featured:true, category:'anime',
   type:'series', seasons:1,
   youtubePlaylist:[
     {ep:1,  ytId:'NlJZ-YgAt-c',    title:'Rebirth'},
     {ep:2,  ytId:'fHHBbJgaX1E',    title:'Confrontation'},
     {ep:3,  ytId:'v4YBH4ADHDI',    title:'Dealings'},
     {ep:4,  ytId:'0o_pN0n4EQM',    title:'Pursuit'},
     {ep:5,  ytId:'oFJBFzJMlgM',    title:'Tactics'},
     {ep:6,  ytId:'_8-2jfGaEeM',    title:'Unraveling'},
     {ep:7,  ytId:'MO_Sl-IWdGs',    title:'Overcast'},
     {ep:8,  ytId:'6q4WbiqCzUg',    title:'Glare'},
     {ep:9,  ytId:'VPdGzm1p2lU',    title:'Encounter'},
     {ep:10, ytId:'OGy6VxHQNNI',    title:'Doubt'},
     {ep:11, ytId:'fHHBbJgaX1E',    title:'Assault'},
     {ep:12, ytId:'e_c8HhFr3Rs',    title:'Love'},
     {ep:13, ytId:'hnrKMiN_SBg',    title:'Confession'},
     {ep:14, ytId:'GqcFJ8QQUCM',    title:'Friend'},
     {ep:15, ytId:'pGhMvUuN-nw',    title:'Wager'},
     {ep:16, ytId:'BfWHfwuadPs',    title:'Decision'},
     {ep:17, ytId:'oijNKYA0GqI',    title:'Execution'},
     {ep:18, ytId:'YYMmT_xMknM',    title:'Ally'},
     {ep:19, ytId:'sbzBGBVzYGE',    title:'Matsuda'},
     {ep:20, ytId:'TKq5w3qZBmA',    title:'Makeshift'},
     {ep:21, ytId:'c0GYOLkJN9w',    title:'performance'},
     {ep:22, ytId:'ld6bRtBPQrU',    title:'Guidance'},
     {ep:23, ytId:'pGhMvUuN-nw',    title:'Unification'},
     {ep:24, ytId:'wjUJlUo9kQY',    title:'Revival'},
     {ep:25, ytId:'BfWHfwuadPs',    title:'Silence'},
     {ep:26, ytId:'rFNB1v9bVYE',    title:'Renewal'},
     {ep:27, ytId:'oijNKYA0GqI',    title:'Abduction'},
     {ep:28, ytId:'YYMmT_xMknM',    title:'Impatience'},
     {ep:29, ytId:'TKq5w3qZBmA',    title:'Father'},
     {ep:30, ytId:'sbzBGBVzYGE',    title:'Justice'},
     {ep:31, ytId:'c0GYOLkJN9w',    title:'Transfer'},
     {ep:32, ytId:'ld6bRtBPQrU',    title:'Selection'},
     {ep:33, ytId:'wjUJlUo9kQY',    title:'Scorn'},
     {ep:34, ytId:'rFNB1v9bVYE',    title:'Vigilance'},
     {ep:35, ytId:'e_c8HhFr3Rs',    title:'Malice'},
     {ep:36, ytId:'hnrKMiN_SBg',    title:'1.28'},
     {ep:37, ytId:'GqcFJ8QQUCM',    title:'New World'}
   ]},

  // ══════════════════════ CARTOONS (Public Domain Full Episodes) ══════════════════════

  {id:'c1', title:'Betty Boop', year:1930, genre:['Comedy','Animation'], rating:7.8, duration:'Multiple Shorts',
   director:'Max Fleischer', cast:['Mae Questel','Margie Hines'],
   description:"The beloved flapper girl Betty Boop stars in dozens of wild, surreal, and hilarious cartoons from the 1930s. Max Fleischer\'s iconic creation at her rubber-hose animated best.",
   poster:'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Betty_Boop_1935.jpg/500px-Betty_Boop_1935.jpg',
   backdrop:'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Betty_Boop_1935.jpg/1200px-Betty_Boop_1935.jpg',
   videoType:'archive', videoSrc:'BettyBoop_FleetosSweetheart_1938',
   featured:true, category:'cartoons',
   type:'series', seasons:1,
   episodeIds:{
     1:['BettyBoop_FleetosSweetheart_1938','BettyBoop_AwardNight_1941','BettyBoop_HideAndSeek_1937','BettyBoop_Happy_You_and_Merry_Me','BettyBoop_DadGivesFirst_1934','BettyBoop_WinteryTales_1942']
   }},

  {id:'c2', title:'Popeye the Sailor', year:1933, genre:['Comedy','Action'], rating:8.0, duration:'100+ Shorts',
   director:'Dave Fleischer', cast:['William Costello','Mae Questel','Jack Mercer'],
   description:"Popeye the Sailor Man eats his spinach and punches his way through every problem, usually involving rescuing Olive Oyl from the villainous Bluto. Classic Fleischer studio cartoons.",
   poster:'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Popeye_1936_poster.jpg/500px-Popeye_1936_poster.jpg',
   backdrop:'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Popeye_1936_poster.jpg/1200px-Popeye_1936_poster.jpg',
   videoType:'archive', videoSrc:'PopeyeTheSailorMeetsSindbadTheSailor',
   featured:true, category:'cartoons',
   type:'series', seasons:1,
   episodeIds:{
     1:['PopeyeTheSailorMeetsSindbadTheSailor','Popeye_AliBabaAndThe40Thieves_1937','Popeye_PopeyeMeetsSindbad','Popeye_BlutosBig_Mistake_1940','Popeye_Lost_and_Foundry_1937','Popeye_ILikes_Babies_and_Infinks_1937']
   }},

  {id:'c3', title:'Fleischer Superman', year:1941, genre:['Action','Sci-Fi'], rating:7.9, duration:'17 Shorts',
   director:'Dave Fleischer', cast:['Bud Collyer','Joan Alexander'],
   description:"The original Superman cartoons — some of the most beautifully animated films ever made. Clark Kent transforms into Superman to save Lois Lane and defeat mad scientists.",
   poster:'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Superman_1941_theatrical_poster.jpg/500px-Superman_1941_theatrical_poster.jpg',
   backdrop:'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Superman_1941_theatrical_poster.jpg/1200px-Superman_1941_theatrical_poster.jpg',
   videoType:'archive', videoSrc:'Superman_1941',
   featured:true, category:'cartoons',
   type:'series', seasons:1,
   episodeIds:{
     1:['Superman_1941','Superman_1941_Billion_Dollar_Limited','Superman_1941_Arctic_Giant','Superman_1941_Bulleteers','Superman_1941_Magnetic_Telescope','Superman_1941_Electric_Earthquake','Superman_1941_Volcano']
   }},

  {id:'c4', title:'Woody Woodpecker', year:1940, genre:['Comedy','Animation'], rating:7.5, duration:'200+ Shorts',
   director:'Walter Lantz', cast:['Ben Hardaway','Grace Stafford','Mel Blanc'],
   description:"The wild, wisecracking Woody Woodpecker causes chaos wherever he goes with his unmistakable laugh. Walter Lantz\'s zany creation in dozens of hilarious cartoons.",
   poster:'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Woody_Woodpecker.png/500px-Woody_Woodpecker.png',
   backdrop:'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Woody_Woodpecker.png/1200px-Woody_Woodpecker.png',
   videoType:'archive', videoSrc:'Woody-Woodpecker-Ski-For-Two-1944',
   featured:false, category:'cartoons',
   type:'series', seasons:1,
   episodeIds:{
     1:['Woody-Woodpecker-Ski-For-Two-1944','WoodyWoodpecker_WoesOfAFlattie_1945','WoodyWoodpecker_AtTheCircus_1944','WoodyWoodpecker_TheBarber_1944','WoodyWoodpecker_PeckingHoles_1944']
   }},

  {id:'c5', title:'Little Lulu', year:1944, genre:['Comedy','Family'], rating:7.2, duration:'26 Shorts',
   director:'Seymour Kneitel', cast:['Cecil Roy'],
   description:"The spirited Little Lulu outwits the neighborhood bully Tubby and his gang in a series of delightful Paramount animated cartoons. Perfect for all ages.",
   poster:'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Little_Lulu.jpg/500px-Little_Lulu.jpg',
   backdrop:'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Little_Lulu.jpg/1200px-Little_Lulu.jpg',
   videoType:'archive', videoSrc:'LittleLuluBullfight_1948',
   featured:false, category:'cartoons',
   type:'series', seasons:1,
   episodeIds:{
     1:['LittleLuluBullfight_1948','LittleLuluAHospitalStory_1944','LittleLuluColdDecember_1944','LittleLuluGoodInfluence_1944']
   }},

  {id:'c6', title:'Out of the Inkwell', year:1918, genre:['Comedy','Animation'], rating:7.6, duration:'Classic Shorts',
   director:'Max Fleischer', cast:['Max Fleischer'],
   description:"Max Fleischer\'s groundbreaking series mixing live action and animation, featuring Koko the Clown jumping out of an inkwell into the real world. The birth of character animation.",
   poster:'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Out-of-the-inkwell-1920.jpg/500px-Out-of-the-inkwell-1920.jpg',
   backdrop:'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Out-of-the-inkwell-1920.jpg/1200px-Out-of-the-inkwell-1920.jpg',
   videoType:'archive', videoSrc:'OutOfTheInkwell_1920',
   featured:false, category:'cartoons',
   type:'series', seasons:1,
   episodeIds:{
     1:['OutOfTheInkwell_1920','OutOfTheInkwell_Modeling_1921','OutOfTheInkwell_The_Tantalizing_Fly_1919']
   }},
];
