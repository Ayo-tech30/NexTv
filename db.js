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
    if (!localStorage.getItem('nextv_session')) localStorage.setItem('nextv_session','null');
  },
  getUsers(){ return JSON.parse(localStorage.getItem('nextv_users'))||[]; },
  saveUsers(u){ localStorage.setItem('nextv_users', JSON.stringify(u)); },
  getUserByEmail(e){ return this.getUsers().find(u=>u.email.toLowerCase()===e.toLowerCase()); },
  getUserById(id){ return this.getUsers().find(u=>u.id===id); },
  createUser(email,password,name){
    const users=this.getUsers();
    if(users.find(u=>u.email.toLowerCase()===email.toLowerCase())) return{error:'Email already registered.'};
    const user={id:'user-'+Date.now(),email,password:btoa(password),name,
      role:'user',avatar:null,watchlist:[],watchHistory:[],createdAt:new Date().toISOString()};
    users.push(user); this.saveUsers(users); return{user};
  },
  updateUser(id,updates){
    const users=this.getUsers(); const idx=users.findIndex(u=>u.id===id);
    if(idx===-1) return false; users[idx]={...users[idx],...updates}; this.saveUsers(users); return users[idx];
  },
  getSession(){ return JSON.parse(localStorage.getItem('nextv_session')); },
  setSession(user){ localStorage.setItem('nextv_session',JSON.stringify({id:user.id,email:user.email,name:user.name,role:user.role})); },
  clearSession(){ localStorage.setItem('nextv_session','null'); },
  login(email,password){
    const user=this.getUserByEmail(email);
    if(!user) return{error:'No account found with that email.'};
    if(atob(user.password)!==password) return{error:'Incorrect password.'};
    this.setSession(user); return{user};
  },
  logout(){ this.clearSession(); },
  getMovies(){ return JSON.parse(localStorage.getItem('nextv_movies'))||[]; },
  getMovie(id){ return this.getMovies().find(m=>m.id===id); },
  toggleWatchlist(userId,movieId){
    const user=this.getUserById(userId); if(!user) return;
    const wl=user.watchlist||[]; const idx=wl.indexOf(movieId);
    if(idx===-1) wl.push(movieId); else wl.splice(idx,1);
    this.updateUser(userId,{watchlist:wl}); this.setSession(this.getUserById(userId)); return wl;
  },
  addToHistory(userId,movieId){
    const user=this.getUserById(userId); if(!user) return;
    let h=user.watchHistory||[]; h=h.filter(x=>x.movieId!==movieId);
    h.unshift({movieId,watchedAt:new Date().toISOString()}); h=h.slice(0,50);
    this.updateUser(userId,{watchHistory:h});
  }
};

// tmdbId  = TMDB ID used by vidsrc.to / vidsrc.xyz / 2embed.cc
// type    = 'movie' | 'series'   (series = has seasons + episodes)
// seasons / episodeCount only needed for series

const MOVIES = [

  // ═══════════════════════════ MOVIES ═══════════════════════════

  {id:'m1', tmdbId:'157336', title:'Interstellar', year:2014, genre:['Sci-Fi','Drama'], rating:8.7, duration:'2h 49m',
   director:'Christopher Nolan', cast:['Matthew McConaughey','Anne Hathaway','Jessica Chastain'],
   description:"A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival. A stunning, emotional journey across time, space and love.",
   poster:'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/xJHokMbljvjADYdit5fK5VQsXEG.jpg',
   type:'movie', featured:true, category:'movies'},

  {id:'m2', tmdbId:'272', title:'The Dark Knight', year:2008, genre:['Action','Crime'], rating:9.0, duration:'2h 32m',
   director:'Christopher Nolan', cast:['Christian Bale','Heath Ledger','Aaron Eckhart'],
   description:"When the Joker emerges from his mysterious past, he wreaks havoc on Gotham. Heath Ledger's legendary performance makes this one of the greatest films ever made.",
   poster:'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/hkBaDkMWbLaf8B1lsWsKX7Ew3Xq.jpg',
   type:'movie', featured:true, category:'movies'},

  {id:'m3', tmdbId:'27205', title:'Inception', year:2010, genre:['Sci-Fi','Thriller'], rating:8.8, duration:'2h 28m',
   director:'Christopher Nolan', cast:['Leonardo DiCaprio','Joseph Gordon-Levitt','Elliot Page'],
   description:"A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into the mind of a CEO.",
   poster:'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/s2bT29y0ngXxxu2IA8AOzzXTRhd.jpg',
   type:'movie', featured:true, category:'movies'},

  {id:'m4', tmdbId:'496243', title:'Parasite', year:2019, genre:['Drama','Thriller'], rating:8.5, duration:'2h 12m',
   director:'Bong Joon-ho', cast:['Song Kang-ho','Lee Sun-kyun','Cho Yeo-jeong'],
   description:"Greed and class discrimination threaten the symbiotic relationship between the wealthy Park family and the destitute Kim clan. Academy Award winner for Best Picture.",
   poster:'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/ApiBzeaa95TNYliSbQ8pJv4Nj6M.jpg',
   type:'movie', featured:false, category:'movies'},

  {id:'m5', tmdbId:'299536', title:'Avengers: Infinity War', year:2018, genre:['Action','Adventure'], rating:8.4, duration:'2h 29m',
   director:'Anthony & Joe Russo', cast:['Robert Downey Jr.','Chris Evans','Thanos'],
   description:"The Avengers and their allies must be willing to sacrifice all in an attempt to defeat the powerful Thanos before his blitz of devastation destroys the universe.",
   poster:'https://image.tmdb.org/t/p/w500/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/bOGkgRGdhrBYJSLpXaxhXVstddV.jpg',
   type:'movie', featured:true, category:'movies'},

  {id:'m6', tmdbId:'299534', title:'Avengers: Endgame', year:2019, genre:['Action','Adventure'], rating:8.4, duration:'3h 1m',
   director:'Anthony & Joe Russo', cast:['Robert Downey Jr.','Chris Evans','Mark Ruffalo'],
   description:"After the devastating events of Infinity War, the universe is in ruins. The Avengers assemble once more in the ultimate battle to reverse Thanos's actions.",
   poster:'https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg',
   type:'movie', featured:true, category:'movies'},

  {id:'m7', tmdbId:'438631', title:'Dune', year:2021, genre:['Sci-Fi','Adventure'], rating:8.0, duration:'2h 35m',
   director:'Denis Villeneuve', cast:['Timothée Chalamet','Rebecca Ferguson','Oscar Isaac'],
   description:"A noble family becomes embroiled in a war for control over the galaxy's most valuable asset while a young heir fulfils his incredible destiny.",
   poster:'https://image.tmdb.org/t/p/w500/d5NXSklpcvweasTZTdgw9J6tQj7.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/jYEW5xZkZk2WTrdbMGAPFuBqbDc.jpg',
   type:'movie', featured:false, category:'movies'},

  {id:'m8', tmdbId:'278', title:'The Shawshank Redemption', year:1994, genre:['Drama'], rating:9.3, duration:'2h 22m',
   director:'Frank Darabont', cast:['Tim Robbins','Morgan Freeman','Bob Gunton'],
   description:"Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency. Rated the greatest movie of all time.",
   poster:'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/avedvodAZUcwqevBfm8p4G2NziQ.jpg',
   type:'movie', featured:false, category:'movies'},

  {id:'m9', tmdbId:'680', title:'Pulp Fiction', year:1994, genre:['Crime','Drama'], rating:8.9, duration:'2h 34m',
   director:'Quentin Tarantino', cast:['John Travolta','Uma Thurman','Samuel L. Jackson'],
   description:"The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption. Tarantino's masterpiece.",
   poster:'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg',
   type:'movie', featured:false, category:'movies'},

  {id:'m10', tmdbId:'245891', title:'John Wick', year:2014, genre:['Action','Thriller'], rating:7.4, duration:'1h 41m',
   director:'Chad Stahelski', cast:['Keanu Reeves','Michael Nyqvist','Alfie Allen'],
   description:"An ex-hitman comes out of retirement to track down the gangsters who killed his dog and stole his car. Non-stop action from start to finish.",
   poster:'https://image.tmdb.org/t/p/w500/fZPSd91abroad5JeYDp4hgaGhMx.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/umC04Cozevu7nn86uBnMmn3T7oT.jpg',
   type:'movie', featured:false, category:'movies'},

  {id:'m11', tmdbId:'634649', title:'Spider-Man: No Way Home', year:2021, genre:['Action','Adventure'], rating:8.2, duration:'2h 28m',
   director:'Jon Watts', cast:['Tom Holland','Zendaya','Benedict Cumberbatch'],
   description:"With Spider-Man's identity revealed, Peter asks Doctor Strange for help. The spell goes wrong, unleashing villains from across the multiverse.",
   poster:'https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/iQFcwSGbZXMkeyKrxbPnwnRo5fl.jpg',
   type:'movie', featured:false, category:'movies'},

  {id:'m12', tmdbId:'238', title:'The Godfather', year:1972, genre:['Crime','Drama'], rating:9.2, duration:'2h 55m',
   director:'Francis Ford Coppola', cast:['Marlon Brando','Al Pacino','James Caan'],
   description:"The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son. Cinema's ultimate crime epic.",
   poster:'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsLYHufncOHgx.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/tmU7GeKVEMrBleo5ycVBFurqvxJ.jpg',
   type:'movie', featured:true, category:'movies'},

  {id:'m13', tmdbId:'872585', title:'Oppenheimer', year:2023, genre:['Drama','History'], rating:8.3, duration:'3h 0m',
   director:'Christopher Nolan', cast:['Cillian Murphy','Emily Blunt','Matt Damon'],
   description:"The story of J. Robert Oppenheimer and his role in the development of the atomic bomb during WWII. Winner of 7 Academy Awards.",
   poster:'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg',
   type:'movie', featured:true, category:'movies'},

  {id:'m14', tmdbId:'361743', title:'Top Gun: Maverick', year:2022, genre:['Action','Drama'], rating:8.3, duration:'2h 11m',
   director:'Joseph Kosinski', cast:['Tom Cruise','Miles Teller','Jennifer Connelly'],
   description:"After 30 years Maverick is still pushing the envelope, but must confront the ghosts of his past when he trains a new generation of Top Gun graduates.",
   poster:'https://image.tmdb.org/t/p/w500/62HCnUTziyWcpDaBO2i1DX17ljH.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/AkB37EMGilAN21h0CAQRP2hKzDc.jpg',
   type:'movie', featured:false, category:'movies'},

  {id:'m15', tmdbId:'19995', title:'Avatar', year:2009, genre:['Sci-Fi','Adventure'], rating:7.9, duration:'2h 42m',
   director:'James Cameron', cast:['Sam Worthington','Zoe Saldana','Sigourney Weaver'],
   description:"A paraplegic marine dispatched to the moon Pandora on a unique mission becomes torn between following orders and protecting the world he feels is his home.",
   poster:'https://image.tmdb.org/t/p/w500/jRXYjXNq0Cs2TcJjLkki24MLp7u.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/o0s4XsEDfDlvit5pDRKjzXR4pp2.jpg',
   type:'movie', featured:false, category:'movies'},

  {id:'m16', tmdbId:'98', title:'Gladiator', year:2000, genre:['Action','Drama'], rating:8.5, duration:'2h 35m',
   director:'Ridley Scott', cast:['Russell Crowe','Joaquin Phoenix','Connie Nielsen'],
   description:"A former Roman General sets out to exact vengeance against the corrupt emperor who murdered his family and sent him into slavery.",
   poster:'https://image.tmdb.org/t/p/w500/ty8TGRuvJLPUmAR1H1nRIsgwvim.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/6WBIzCgmDCYrqh2sKwcMdVbGgSD.jpg',
   type:'movie', featured:false, category:'movies'},

  {id:'m17', tmdbId:'603', title:'The Matrix', year:1999, genre:['Sci-Fi','Action'], rating:8.7, duration:'2h 16m',
   director:'The Wachowskis', cast:['Keanu Reeves','Laurence Fishburne','Carrie-Anne Moss'],
   description:"A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.",
   poster:'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/ncEsesgOJDNrTUED89hYbA117gg.jpg',
   type:'movie', featured:false, category:'movies'},

  {id:'m18', tmdbId:'475557', title:'Joker', year:2019, genre:['Crime','Drama'], rating:8.4, duration:'2h 2m',
   director:'Todd Phillips', cast:['Joaquin Phoenix','Robert De Niro','Zazie Beetz'],
   description:"In Gotham City, mentally troubled comedian Arthur Fleck is disregarded and mistreated by society, embarking on a downward spiral of revolution and bloody crime.",
   poster:'https://image.tmdb.org/t/p/w500/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/f5F4cRhQdUbyVbB5lTNC1F0FYzO.jpg',
   type:'movie', featured:false, category:'movies'},

  {id:'m19', tmdbId:'550', title:'Fight Club', year:1999, genre:['Drama','Thriller'], rating:8.8, duration:'2h 19m',
   director:'David Fincher', cast:['Brad Pitt','Edward Norton','Helena Bonham Carter'],
   description:"An insomniac office worker and a devil-may-care soap maker form an underground fight club that evolves into something much, much more.",
   poster:'https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/87hTDiay2N2qWyX4Ds7ybXi9h8I.jpg',
   type:'movie', featured:false, category:'movies'},

  {id:'m20', tmdbId:'424', title:"Schindler's List", year:1993, genre:['Drama','History'], rating:9.0, duration:'3h 15m',
   director:'Steven Spielberg', cast:['Liam Neeson','Ben Kingsley','Ralph Fiennes'],
   description:"In German-occupied Poland during WWII, industrialist Oskar Schindler gradually becomes concerned for his Jewish workforce after witnessing their persecution by the Nazis.",
   poster:'https://image.tmdb.org/t/p/w500/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/loRmRzQXZeqG78TqZuyvSlEQfZb.jpg',
   type:'movie', featured:false, category:'movies'},

  {id:'m21', tmdbId:'120', title:'The Lord of the Rings: The Fellowship', year:2001, genre:['Fantasy','Adventure'], rating:8.8, duration:'3h 48m',
   director:'Peter Jackson', cast:['Elijah Wood','Ian McKellen','Orlando Bloom'],
   description:"A meek Hobbit from the Shire and eight companions set out on a journey to destroy the powerful One Ring and save Middle-earth from the Dark Lord Sauron.",
   poster:'https://image.tmdb.org/t/p/w500/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/pIIskHRyB9SiNTpsx1Q0Ya2TUDU.jpg',
   type:'movie', featured:false, category:'movies'},

  {id:'m22', tmdbId:'346698', title:'Barbie', year:2023, genre:['Comedy','Fantasy'], rating:7.0, duration:'1h 54m',
   director:'Greta Gerwig', cast:['Margot Robbie','Ryan Gosling','America Ferrera'],
   description:"Barbie and Ken are having the time of their lives in the colourful Barbieland. When they go to the real world, however, they soon discover the joys and perils of living among humans.",
   poster:'https://image.tmdb.org/t/p/w500/iuFNMS8vlzsOne7rlNsdNYWzWWT.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/nHf61UzkfFno5X1ofIHQ4lnxITX.jpg',
   type:'movie', featured:false, category:'movies'},

  {id:'m23', tmdbId:'598', title:'City of God', year:2002, genre:['Crime','Drama'], rating:8.6, duration:'2h 10m',
   director:'Fernando Meirelles', cast:['Alexandre Rodrigues','Leandro Firmino','Phellipe Haagensen'],
   description:"In the slums of Rio de Janeiro, two boys grow up on opposite sides of violence — one becomes a photographer, the other a ruthless drug lord. A breathtaking true story.",
   poster:'https://image.tmdb.org/t/p/w500/k7eYdWvhYQyRQoU2TB2A2Xu2grZ.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/4NxCDWJ7FXfVkldHnNsQaVqk7VE.jpg',
   type:'movie', featured:false, category:'movies'},

  {id:'m24', tmdbId:'11', title:'Star Wars: A New Hope', year:1977, genre:['Sci-Fi','Adventure'], rating:8.6, duration:'2h 1m',
   director:'George Lucas', cast:['Mark Hamill','Harrison Ford','Carrie Fisher'],
   description:"Luke Skywalker joins forces with a Jedi Knight, a cocky pilot, a Wookiee and two droids to save the galaxy from the Empire's world-destroying battle station.",
   poster:'https://image.tmdb.org/t/p/w500/6FfCtAuVAW8XJjZ7eWeLibRLWTw.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/zqkmTXzjkAgXmEWLRsY4UpTWCeo.jpg',
   type:'movie', featured:false, category:'movies'},

  {id:'m25', tmdbId:'284054', title:'Black Panther', year:2018, genre:['Action','Adventure'], rating:7.3, duration:'2h 14m',
   director:'Ryan Coogler', cast:["Chadwick Boseman","Michael B. Jordan","Lupita Nyong'o"],
   description:"T'Challa returns home to the African nation of Wakanda to take his rightful place as king, but must defeat a challenger who wants to wage war on the world.",
   poster:'https://image.tmdb.org/t/p/w500/uxzzxijgPIY7slzFvMotPv8wjKA.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/b6ZJZHUdMEFECvGiDpJjlfUWela.jpg',
   type:'movie', featured:false, category:'movies'},

  // ═══════════════════════════ TV SERIES ═══════════════════════════

  {id:'s1', tmdbId:'1396', title:'Breaking Bad', year:2008, genre:['Drama','Crime'], rating:9.5, duration:'5 Seasons · 62 Eps',
   director:'Vince Gilligan', cast:['Bryan Cranston','Aaron Paul','Anna Gunn'],
   description:"A chemistry teacher diagnosed with cancer turns to manufacturing methamphetamine alongside a former student to secure his family's financial future before he dies.",
   poster:'https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg',
   type:'series', featured:true, category:'series',
   seasons:5, episodeCount:{1:7,2:13,3:13,4:13,5:16}},

  {id:'s2', tmdbId:'66732', title:'Stranger Things', year:2016, genre:['Sci-Fi','Horror'], rating:8.7, duration:'4 Seasons · 34 Eps',
   director:'Duffer Brothers', cast:['Millie Bobby Brown','Finn Wolfhard','Winona Ryder'],
   description:"When a young boy disappears, his mother, a police chief and his friends must confront terrifying supernatural forces in order to get him back.",
   poster:'https://image.tmdb.org/t/p/w500/x2LSRK2Cm7MZhjluni1msVJ3wDj.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/rcA37ys54PssDn9rHALMzOtChbW.jpg',
   type:'series', featured:true, category:'series',
   seasons:4, episodeCount:{1:8,2:9,3:8,4:9}},

  {id:'s3', tmdbId:'1399', title:'Game of Thrones', year:2011, genre:['Drama','Fantasy'], rating:9.2, duration:'8 Seasons · 73 Eps',
   director:'David Benioff', cast:['Emilia Clarke','Kit Harington','Peter Dinklage'],
   description:"Nine noble families fight for control of the mythical land of Westeros while an ancient enemy returns after being dormant for millennia.",
   poster:'https://image.tmdb.org/t/p/w500/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/suopoADq0k8YZr4dQXcU6aLJ3a.jpg',
   type:'series', featured:true, category:'series',
   seasons:8, episodeCount:{1:10,2:10,3:10,4:10,5:10,6:10,7:7,8:6}},

  {id:'s4', tmdbId:'100088', title:'The Last of Us', year:2023, genre:['Drama','Horror'], rating:8.8, duration:'2 Seasons · 17 Eps',
   director:'Craig Mazin', cast:['Pedro Pascal','Bella Ramsey','Gabriel Luna'],
   description:"Joel, a hardened survivor, smuggles Ellie out of an oppressive quarantine zone. What starts as a small job becomes a brutal, heartbreaking journey across a post-apocalyptic America.",
   poster:'https://image.tmdb.org/t/p/w500/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/6Wdl9N6dL0Hi5T4thkizCvrkTkM.jpg',
   type:'series', featured:true, category:'series',
   seasons:2, episodeCount:{1:9,2:8}},

  {id:'s5', tmdbId:'93405', title:'Squid Game', year:2021, genre:['Thriller','Drama'], rating:8.0, duration:'2 Seasons · 16 Eps',
   director:'Hwang Dong-hyuk', cast:['Lee Jung-jae','Park Hae-soo','Wi Ha-jun'],
   description:"Hundreds of cash-strapped players accept a strange invitation to compete in children's games. Inside, a brutal game with deadly consequences unfolds.",
   poster:'https://image.tmdb.org/t/p/w500/dDlEmu3EZ0Pgg93K2SVNLCjCSvE.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/qw3J9cNeLioOLoR68WX7z79aCdK.jpg',
   type:'series', featured:true, category:'series',
   seasons:2, episodeCount:{1:9,2:7}},

  {id:'s6', tmdbId:'60574', title:'Peaky Blinders', year:2013, genre:['Crime','Drama'], rating:8.8, duration:'6 Seasons · 36 Eps',
   director:'Steven Knight', cast:['Cillian Murphy','Paul Anderson','Helen McCrory'],
   description:"A gangster family epic set in 1900s England, centering on a gang who sews razor blades in the peaks of their caps, led by the ruthless Tommy Shelby.",
   poster:'https://image.tmdb.org/t/p/w500/vUUqzWa2LnHIVqkaKVlVGkPaQca.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/wiE9doxiLwq3WguhPef0bT4fLc.jpg',
   type:'series', featured:false, category:'series',
   seasons:6, episodeCount:{1:6,2:6,3:6,4:6,5:6,6:6}},

  {id:'s7', tmdbId:'63333', title:'Dark', year:2017, genre:['Sci-Fi','Thriller'], rating:8.8, duration:'3 Seasons · 26 Eps',
   director:'Baran bo Odar', cast:['Louis Hofmann','Oliver Masucci','Karoline Eichhorn'],
   description:"A family saga with a supernatural twist, set in a German town where children's disappearances expose a time travel conspiracy spanning four families across three centuries.",
   poster:'https://image.tmdb.org/t/p/w500/apbrbWs2BerzUCMBQl7JFHv00If.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/nMcayvRnSGcvtOxCAC7ELvDHBHC.jpg',
   type:'series', featured:false, category:'series',
   seasons:3, episodeCount:{1:10,2:8,3:8}},

  {id:'s8', tmdbId:'71446', title:'Money Heist', year:2017, genre:['Crime','Thriller'], rating:8.2, duration:'5 Seasons · 41 Eps',
   director:'Alex Pina', cast:['Alvaro Morte','Itziar Ituno','Pedro Alonso'],
   description:"A criminal mastermind known as The Professor recruits a band of thieves to carry out an ambitious heist on the Royal Mint of Spain.",
   poster:'https://image.tmdb.org/t/p/w500/reEMJA1uzscCbkpeRJeTT2bjqUp.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/xGexTKCJDkl61ljM3dB0CxLyGKm.jpg',
   type:'series', featured:false, category:'series',
   seasons:5, episodeCount:{1:9,2:6,3:8,4:8,5:10}},

  {id:'s9', tmdbId:'87108', title:'Chernobyl', year:2019, genre:['Drama','History'], rating:9.4, duration:'1 Season · 5 Eps',
   director:'Johan Renck', cast:['Jared Harris','Stellan Skarsgård','Emily Watson'],
   description:"In April 1986, an explosion at the Chernobyl nuclear power plant becomes one of the world's worst man-made catastrophes. A gripping, devastating miniseries.",
   poster:'https://image.tmdb.org/t/p/w500/hlLXt2tOPT6RRnjiUmoxyG1LTFi.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/6S8XKQD5k17cSmpFMSJT5MnGJJy.jpg',
   type:'series', featured:false, category:'series',
   seasons:1, episodeCount:{1:5}},

  {id:'s10', tmdbId:'94997', title:'House of the Dragon', year:2022, genre:['Fantasy','Drama'], rating:8.4, duration:'2 Seasons · 18 Eps',
   director:'Ryan Condal', cast:["Paddy Considine","Emma D'Arcy","Matt Smith"],
   description:"The story of House Targaryen set 200 years before Game of Thrones, chronicling the brutal civil war that nearly destroyed the Targaryen dynasty.",
   poster:'https://image.tmdb.org/t/p/w500/z2yahl2uefxDCl0nogcRBstwruJ.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/etj8E2o0Bud0HkONVQPjyCkIvpv.jpg',
   type:'series', featured:false, category:'series',
   seasons:2, episodeCount:{1:10,2:8}},

  {id:'s11', tmdbId:'46648', title:'The Witcher', year:2019, genre:['Fantasy','Action'], rating:8.2, duration:'3 Seasons · 24 Eps',
   director:'Lauren Schmidt Hissrich', cast:['Henry Cavill','Freya Allan','Anya Chalotra'],
   description:"Geralt of Rivia, a solitary monster hunter, struggles to find his place in a world where people often prove more wicked than beasts.",
   poster:'https://image.tmdb.org/t/p/w500/7vjaCdMw15FEbXyLQTVa04URsPm.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/jBJWaqoSCiARWtfV0GlqHrcdidd.jpg',
   type:'series', featured:false, category:'series',
   seasons:3, episodeCount:{1:8,2:8,3:8}},

  {id:'s12', tmdbId:'1402', title:'The Walking Dead', year:2010, genre:['Horror','Drama'], rating:8.2, duration:'11 Seasons',
   director:'Frank Darabont', cast:['Andrew Lincoln','Norman Reedus','Lauren Cohan'],
   description:"Sheriff Deputy Rick Grimes wakes from a coma to a post-apocalyptic world overrun by zombies. He searches for his family and leads a group of survivors.",
   poster:'https://image.tmdb.org/t/p/w500/n7PgcnYRqRNBSKwP4UkuCirr4Ly.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/x4OJAjXFNJ6GfFRZXU9tLrr0HKo.jpg',
   type:'series', featured:false, category:'series',
   seasons:11, episodeCount:{1:6,2:13,3:16,4:16,5:16,6:16,7:16,8:16,9:16,10:22,11:24}},

  // ═══════════════════════════ ANIME ═══════════════════════════

  {id:'a1', tmdbId:'13916', title:'Death Note', year:2006, genre:['Thriller','Mystery','Psychological'], rating:9.0, duration:'1 Season · 37 Eps',
   director:'Tetsuro Araki', cast:['Mamoru Miyano','Kappei Yamaguchi','Shido Nakamura'],
   description:"Brilliant student Light Yagami discovers a supernatural notebook — anyone whose name is written in it dies. He becomes self-appointed god of justice, but the world's greatest detective L closes in. All 37 episodes of the greatest psychological thriller in anime.",
   poster:'https://image.tmdb.org/t/p/w500/iigTWBRGk3QxAnRCEsNVXpSJWPs.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/aDLMHI9oBPdRiF8aSgTHSVgM4Sk.jpg',
   type:'series', featured:true, category:'anime',
   seasons:1, episodeCount:{1:37}},

  {id:'a2', tmdbId:'1429', title:'Attack on Titan', year:2013, genre:['Action','Fantasy'], rating:9.0, duration:'4 Seasons · 89 Eps',
   director:'Tetsuro Araki', cast:['Yuki Kaji','Yui Ishikawa','Marina Inoue'],
   description:"After his hometown is destroyed and his mother is killed, Eren Yeager vows to cleanse the earth of the giant humanoid Titans that have driven humanity behind massive walls.",
   poster:'https://image.tmdb.org/t/p/w500/hTP1DtLGFamjfu8WqjnuQdP1n4i.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/iy5EKOlVleRHZwTaEjYgQH7JurC.jpg',
   type:'series', featured:true, category:'anime',
   seasons:4, episodeCount:{1:25,2:12,3:22,4:30}},

  {id:'a3', tmdbId:'85552', title:'Demon Slayer', year:2019, genre:['Action','Fantasy'], rating:8.7, duration:'4 Seasons · 55 Eps',
   director:'Haruo Sotozaki', cast:['Natsuki Hanae','Akari Kito','Yoshitsugu Matsuoka'],
   description:"Tanjiro Kamado's family is slaughtered by a demon and his sister Nezuko is turned into one. He trains to become a demon slayer, fight for his sister's cure and avenge his family.",
   poster:'https://image.tmdb.org/t/p/w500/xUfRZu2mi8jH6SzQEJGP6tjBuYj.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/qEcg0kbMdPtqPBGVdQQGCRtBRGf.jpg',
   type:'series', featured:true, category:'anime',
   seasons:4, episodeCount:{1:26,2:7,3:11,4:11}},

  {id:'a4', tmdbId:'31911', title:'Fullmetal Alchemist: Brotherhood', year:2009, genre:['Action','Fantasy'], rating:9.1, duration:'1 Season · 64 Eps',
   director:'Yasuhiro Irie', cast:['Romi Park','Rie Kugimiya','Shinichiro Miki'],
   description:"Two brothers search for a Philosopher's Stone after an attempt to revive their deceased mother leaves them in damaged states. Widely considered the greatest anime ever made.",
   poster:'https://image.tmdb.org/t/p/w500/5ZFUEOULaVml7pQuXxhpR2SmVUw.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/ypbHt24SjoMidFfCX3Lk8aDEgK0.jpg',
   type:'series', featured:true, category:'anime',
   seasons:1, episodeCount:{1:64}},

  {id:'a5', tmdbId:'46261', title:'Naruto', year:2002, genre:['Action','Adventure'], rating:8.4, duration:'9 Seasons · 220 Eps',
   director:'Hayato Date', cast:['Junko Takeuchi','Chie Nakamura','Noriaki Sugiyama'],
   description:"Naruto Uzumaki, a young ninja with a demon fox sealed inside him, dreams of becoming Hokage — the greatest ninja and leader of his village.",
   poster:'https://image.tmdb.org/t/p/w500/xppeysfvDKVx775MFuH8Z9BlpMk.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/BtOe6Jvzp50bCk96Mf1WBKI3s5.jpg',
   type:'series', featured:false, category:'anime',
   seasons:5, episodeCount:{1:57,2:43,3:42,4:42,5:36}},

  {id:'a6', tmdbId:'37854', title:'One Piece', year:1999, genre:['Action','Adventure'], rating:8.9, duration:'20+ Seasons',
   director:'Konosuke Uda', cast:['Mayumi Tanaka','Kazuya Nakai','Akemi Okamura'],
   description:"Monkey D. Luffy sets off with his pirate crew to find the greatest treasure ever left by the legendary pirate Gold Roger — the One Piece — and become King of the Pirates.",
   poster:'https://image.tmdb.org/t/p/w500/e3NBGiAifW9Xt8xD5tpARskjccO.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/2rmK7mnchw9Xr3XdiTFSxTTLXqv.jpg',
   type:'series', featured:false, category:'anime',
   seasons:21, episodeCount:{1:61,2:16,3:16,4:14,5:13,6:43,7:16,8:16,9:30,10:21}},

  {id:'a7', tmdbId:'12971', title:'Dragon Ball Z', year:1989, genre:['Action','Adventure'], rating:8.8, duration:'9 Seasons · 291 Eps',
   director:'Daisuke Nishio', cast:['Masako Nozawa','Ryo Horikawa','Toshio Furukawa'],
   description:"Goku and his friends defend Earth from increasingly powerful alien invaders, androids and magical threats. The legendary anime that defined a generation.",
   poster:'https://image.tmdb.org/t/p/w500/B7N7IOAFY3l8bFI0OwSxKyXBkDU.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/geGm4zkFCJi1SoFJnhCUrUZ02mO.jpg',
   type:'series', featured:false, category:'anime',
   seasons:9, episodeCount:{1:39,2:35,3:26,4:25,5:29,6:28,7:26,8:26,9:26}},

  {id:'a8', tmdbId:'46298', title:'Hunter x Hunter (2011)', year:2011, genre:['Action','Adventure'], rating:9.0, duration:'6 Seasons · 148 Eps',
   director:'Hiroshi Kojina', cast:['Megumi Han','Mariya Ise','Keiji Fujiwara'],
   description:"Gon Freecss aspires to become a Hunter and find his missing father who is also a legendary Hunter. One of the most emotionally powerful anime series ever created.",
   poster:'https://image.tmdb.org/t/p/w500/1ZdED4PBsFF1dtHJDfmTYbGrpMZ.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/pebZ1ZKRX2XYJzRU4YIAFxDELIn.jpg',
   type:'series', featured:false, category:'anime',
   seasons:6, episodeCount:{1:26,2:23,3:30,4:31,5:25,6:13}},

  {id:'a9', tmdbId:'95479', title:'Jujutsu Kaisen', year:2020, genre:['Action','Fantasy'], rating:8.7, duration:'3 Seasons',
   director:'Sunghoo Park', cast:['Junya Enoki','Yuma Uchida','Asami Seto'],
   description:"A boy swallows a cursed talisman and becomes cursed himself. He enters a school of Jujutsu Sorcery to help destroy the rest of the Demon's body before being executed.",
   poster:'https://image.tmdb.org/t/p/w500/oiPTEJfJExILFdEVhJg36NiYRaD.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/bO3s5IOJFZq6V9P4E9vfR5HyOFP.jpg',
   type:'series', featured:false, category:'anime',
   seasons:3, episodeCount:{1:24,2:23,3:21}},

  {id:'a10', tmdbId:'65930', title:'My Hero Academia', year:2016, genre:['Action','Comedy'], rating:8.4, duration:'7 Seasons',
   director:'Kenji Nagasaki', cast:['Daiki Yamashita','Kenta Miyake','Nobuhiko Okamoto'],
   description:"In a world where most people have superpowers, a boy born without them is determined to become the greatest hero. He inherits power from the world's number one hero.",
   poster:'https://image.tmdb.org/t/p/w500/3AS8MLKXJ7vOTlvCJiXjmePuLq4.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/o5i88FtLSdnYUDnJGiXlEEiRFMF.jpg',
   type:'series', featured:false, category:'anime',
   seasons:7, episodeCount:{1:13,2:25,3:25,4:25,5:25,6:25,7:21}},

  {id:'a11', tmdbId:'30984', title:'Bleach', year:2004, genre:['Action','Adventure'], rating:8.2, duration:'16 Seasons · 366 Eps',
   director:'Noriyuki Abe', cast:['Masakazu Morita','Fumiko Orikasa','Hiroki Yasumoto'],
   description:"High school student Ichigo Kurosaki becomes a Soul Reaper and is charged with protecting the living world from evil spirits and guiding the dead to the afterlife.",
   poster:'https://image.tmdb.org/t/p/w500/2EewmxXe72ogD0EaWM8gqa0ccIw.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/hW5FHE6NBZSE4u5HcMaW3GeHerD.jpg',
   type:'series', featured:false, category:'anime',
   seasons:16, episodeCount:{1:20,2:22,3:28,4:28,5:22}},

  {id:'a12', tmdbId:'72636', title:'Tokyo Ghoul', year:2014, genre:['Horror','Action'], rating:7.9, duration:'4 Seasons · 48 Eps',
   director:'Shuhei Morita', cast:['Natsuki Hanae','Sora Amamiya','Austin Tindle'],
   description:"A young man is attacked by a ghoul and becomes half-ghoul himself, forced to consume human flesh to survive. He must navigate the violent underground world of Tokyo's ghouls.",
   poster:'https://image.tmdb.org/t/p/w500/1enwEQVgBKy9lekSXSmXPCODJ6z.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/mCPW4QgCeNJE4MELSUVUNxPaEhL.jpg',
   type:'series', featured:false, category:'anime',
   seasons:4, episodeCount:{1:12,2:12,3:12,4:12}},

  // ═══════════════════════════ CARTOONS ═══════════════════════════

  {id:'c1', tmdbId:'246', title:'Avatar: The Last Airbender', year:2005, genre:['Action','Adventure'], rating:9.3, duration:'3 Seasons · 61 Eps',
   director:'Michael DiMartino', cast:['Zach Tyler Eisen','Mae Whitman','Jack De Sena'],
   description:"In a world where humans can control one of the four elements, the long-lost Avatar must master all four and bring peace to a world torn apart by the Fire Nation's century-long war.",
   poster:'https://image.tmdb.org/t/p/w500/cKhSgBzKQ0gPRQJXIBnrwQg77cF.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/orIt9gFdJaRuXNnrZBsBRMEr4y9.jpg',
   type:'series', featured:true, category:'cartoons',
   seasons:3, episodeCount:{1:20,2:20,3:21}},

  {id:'c2', tmdbId:'83097', title:'Rick and Morty', year:2013, genre:['Sci-Fi','Comedy'], rating:9.1, duration:'7 Seasons · 71 Eps',
   director:'Justin Roiland', cast:['Justin Roiland','Chris Parnell','Spencer Grammer'],
   description:"An alcoholic genius scientist and his good-hearted but timid grandson embark on dangerous, reality-bending adventures across the infinite universe.",
   poster:'https://image.tmdb.org/t/p/w500/gdIrmf2DdY5mgN6ycVP0XlzKzbE.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/vBHgEMfCiAJ6lGkJMlUe5DTzklQ.jpg',
   type:'series', featured:true, category:'cartoons',
   seasons:7, episodeCount:{1:11,2:10,3:10,4:10,5:10,6:10,7:10}},

  {id:'c3', tmdbId:'2190', title:'The Simpsons', year:1989, genre:['Comedy','Animation'], rating:8.7, duration:'35+ Seasons',
   director:'Matt Groening', cast:['Dan Castellaneta','Julie Kavner','Nancy Cartwright'],
   description:"The satirical misadventures of a working-class family in the fictional American town of Springfield. The longest-running American animated series ever made.",
   poster:'https://image.tmdb.org/t/p/w500/2IWouZK4gkgHhJa4PPBn6VqAGRD.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/xmrRrQ9LjnCeaEkFyKXGaGwGBGF.jpg',
   type:'series', featured:false, category:'cartoons',
   seasons:35, episodeCount:{1:13,2:22,3:24,4:22,5:22}},

  {id:'c4', tmdbId:'40075', title:'Gravity Falls', year:2012, genre:['Comedy','Mystery'], rating:8.9, duration:'2 Seasons · 40 Eps',
   director:'Alex Hirsch', cast:['Jason Ritter','Kristen Schaal','Alex Hirsch'],
   description:"Twins Dipper and Mabel Pines spend the summer in Gravity Falls, Oregon — a mysterious town where the supernatural is just around every corner.",
   poster:'https://image.tmdb.org/t/p/w500/sCx7FEFEanHxT4pSLSJjTNRJEQu.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/axKqalBXTnrKUF3R0jL7DnvRMPN.jpg',
   type:'series', featured:false, category:'cartoons',
   seasons:2, episodeCount:{1:20,2:20}},

  {id:'c5', tmdbId:'58714', title:'Adventure Time', year:2010, genre:['Adventure','Comedy'], rating:8.6, duration:'10 Seasons',
   director:'Pendleton Ward', cast:['Jeremy Shada','John DiMaggio','Tom Kenny'],
   description:"Finn the human and Jake the magical shape-shifting dog adventure through the post-apocalyptic Land of Ooo, battling monsters and going on incredible quests.",
   poster:'https://image.tmdb.org/t/p/w500/qXthUuaFGmQQJMXXhMMBBumQU65.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/rNFSmYXHdEMHJjrGzBRgvsKbUNk.jpg',
   type:'series', featured:false, category:'cartoons',
   seasons:10, episodeCount:{1:26,2:26,3:26,4:26,5:52}},

  {id:'c6', tmdbId:'4057', title:'Family Guy', year:1999, genre:['Comedy','Animation'], rating:8.1, duration:'22 Seasons',
   director:'Seth MacFarlane', cast:['Seth MacFarlane','Alex Borstein','Seth Green'],
   description:"The hilariously dysfunctional Griffin family — Peter, Lois, their kids, and the talking dog Brian — stumble through outrageous misadventures in the town of Quahog.",
   poster:'https://image.tmdb.org/t/p/w500/qcOBTMOBBJSjWGKoXJ3dtABH8mb.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/8NsHFBNJi7GNFNlumMFvqFZ1s3d.jpg',
   type:'series', featured:false, category:'cartoons',
   seasons:22, episodeCount:{1:7,2:21,3:22,4:30,5:18}},

  {id:'c7', tmdbId:'38700', title:'Over the Garden Wall', year:2014, genre:['Adventure','Mystery'], rating:8.7, duration:'1 Season · 10 Eps',
   director:'Patrick McHale', cast:['Elijah Wood','Collin Dean','Melanie Lynskey'],
   description:"Two brothers, Wirt and Greg, find themselves lost in a mysterious forest called the Unknown and must find their way home while encountering strange and wondrous characters.",
   poster:'https://image.tmdb.org/t/p/w500/q6Fh3VE62RXGC2FhRJ94q2FZXoR.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/aOOYCpqBYtWWTBa9JN7KGPiMXp7.jpg',
   type:'series', featured:false, category:'cartoons',
   seasons:1, episodeCount:{1:10}},

  {id:'c8', tmdbId:'314', title:'Spider-Man: Into the Spider-Verse', year:2018, genre:['Action','Animation'], rating:8.4, duration:'1h 57m',
   director:'Bob Persichetti', cast:['Shameik Moore','Jake Johnson','Hailee Steinfeld'],
   description:"Teen Miles Morales becomes Spider-Man of his universe and must join other Spider-People from across the multiverse to stop a threat to all realities. A visual masterpiece.",
   poster:'https://image.tmdb.org/t/p/w500/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/7du3sLBjbCUTRoGnLfAHLrBsJb4.jpg',
   type:'movie', featured:true, category:'cartoons'},
];
