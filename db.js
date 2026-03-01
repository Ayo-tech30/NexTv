// ─── NEX TV DATABASE ──────────────────────────────────────────────────────────
const DB = {
  init() {
    if (!localStorage.getItem('nextv_users')) {
      localStorage.setItem('nextv_users', JSON.stringify([{
        id:'admin-001',email:'ibraheemyakub48@gmail.com',
        password:btoa('ibraheem123'),name:'Ibraheem Yakub',
        role:'admin',avatar:null,watchlist:[],watchHistory:[],
        createdAt:new Date().toISOString()
      }]));
    }
    // Always refresh movies to get latest data
    localStorage.setItem('nextv_movies', JSON.stringify(MOVIES));
    if (!localStorage.getItem('nextv_session')) {
      localStorage.setItem('nextv_session', 'null');
    }
  },
  getUsers(){ return JSON.parse(localStorage.getItem('nextv_users'))||[]; },
  saveUsers(u){ localStorage.setItem('nextv_users',JSON.stringify(u)); },
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
    if(idx===-1)return false; users[idx]={...users[idx],...updates}; this.saveUsers(users); return users[idx];
  },
  getSession(){ return JSON.parse(localStorage.getItem('nextv_session')); },
  setSession(user){
    localStorage.setItem('nextv_session',JSON.stringify({id:user.id,email:user.email,name:user.name,role:user.role}));
  },
  clearSession(){ localStorage.setItem('nextv_session','null'); },
  login(email,password){
    const user=this.getUserByEmail(email);
    if(!user)return{error:'No account found with that email.'};
    if(atob(user.password)!==password)return{error:'Incorrect password.'};
    this.setSession(user); return{user};
  },
  logout(){ this.clearSession(); },
  getMovies(){ return JSON.parse(localStorage.getItem('nextv_movies'))||[]; },
  getMovie(id){ return this.getMovies().find(m=>m.id===id); },
  toggleWatchlist(userId,movieId){
    const user=this.getUserById(userId); if(!user)return;
    const wl=user.watchlist||[]; const idx=wl.indexOf(movieId);
    if(idx===-1)wl.push(movieId); else wl.splice(idx,1);
    this.updateUser(userId,{watchlist:wl}); this.setSession(this.getUserById(userId)); return wl;
  },
  addToHistory(userId,movieId){
    const user=this.getUserById(userId); if(!user)return;
    let h=user.watchHistory||[]; h=h.filter(x=>x.movieId!==movieId);
    h.unshift({movieId,watchedAt:new Date().toISOString()}); h=h.slice(0,50);
    this.updateUser(userId,{watchHistory:h});
  }
};

const MOVIES = [
  // MOVIES
  {id:'m1',title:'Interstellar',year:2014,genre:['Sci-Fi','Drama'],rating:8.7,duration:'2h 49m',
   director:'Christopher Nolan',cast:['Matthew McConaughey','Anne Hathaway','Jessica Chastain'],
   description:"A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
   poster:'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/xJHokMbljvjADYdit5fK5VQsXEG.jpg',
   videoId:'zSWdZVtXT7E',featured:true,category:'movies'},

  {id:'m2',title:'The Dark Knight',year:2008,genre:['Action','Crime'],rating:9.0,duration:'2h 32m',
   director:'Christopher Nolan',cast:['Christian Bale','Heath Ledger','Aaron Eckhart'],
   description:"Batman raises the stakes in his war on crime with the help of Lt. Gordon and DA Harvey Dent, but the Joker unleashes chaos.",
   poster:'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/hkBaDkMWbLaf8B1lsWsKX7Ew3Xq.jpg',
   videoId:'EXeTwQWrcwY',featured:true,category:'movies'},

  {id:'m3',title:'Inception',year:2010,genre:['Sci-Fi','Thriller'],rating:8.8,duration:'2h 28m',
   director:'Christopher Nolan',cast:['Leonardo DiCaprio','Joseph Gordon-Levitt','Elliot Page'],
   description:"A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
   poster:'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/s2bT29y0ngXxxu2IA8AOzzXTRhd.jpg',
   videoId:'YoHD9XEInc0',featured:true,category:'movies'},

  {id:'m4',title:'Parasite',year:2019,genre:['Drama','Thriller'],rating:8.5,duration:'2h 12m',
   director:'Bong Joon-ho',cast:['Song Kang-ho','Lee Sun-kyun','Cho Yeo-jeong'],
   description:"Greed and class discrimination threaten the symbiotic relationship between the wealthy Park family and the destitute Kim clan.",
   poster:'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/ApiBzeaa95TNYliSbQ8pJv4Nj6M.jpg',
   videoId:'5xH0HfJHsaY',featured:false,category:'movies'},

  {id:'m5',title:'Avengers: Endgame',year:2019,genre:['Action','Adventure'],rating:8.4,duration:'3h 1m',
   director:'Russo Brothers',cast:['Robert Downey Jr.','Chris Evans','Mark Ruffalo'],
   description:"After Infinity War's devastating events, the Avengers assemble once more to reverse Thanos's actions and restore the universe.",
   poster:'https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg',
   videoId:'TcMBFSGVi1c',featured:true,category:'movies'},

  {id:'m6',title:'Dune',year:2021,genre:['Sci-Fi','Adventure'],rating:8.0,duration:'2h 35m',
   director:'Denis Villeneuve',cast:['Timothée Chalamet','Rebecca Ferguson','Oscar Isaac'],
   description:"A noble family becomes embroiled in a war for control over the galaxy's most valuable asset while a young heir fulfils his destiny.",
   poster:'https://image.tmdb.org/t/p/w500/d5NXSklpcvweasTZTdgw9J6tQj7.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/jYEW5xZkZk2WTrdbMGAPFuBqbDc.jpg',
   videoId:'n9xhJrPXop4',featured:false,category:'movies'},

  {id:'m7',title:'The Shawshank Redemption',year:1994,genre:['Drama'],rating:9.3,duration:'2h 22m',
   director:'Frank Darabont',cast:['Tim Robbins','Morgan Freeman','Bob Gunton'],
   description:"Two imprisoned men bond over years, finding solace and eventual redemption through acts of common decency.",
   poster:'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/avedvodAZUcwqevBfm8p4G2NziQ.jpg',
   videoId:'PLl99DlL6b4',featured:false,category:'movies'},

  {id:'m8',title:'Pulp Fiction',year:1994,genre:['Crime','Drama'],rating:8.9,duration:'2h 34m',
   director:'Quentin Tarantino',cast:['John Travolta','Uma Thurman','Samuel L. Jackson'],
   description:"The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption.",
   poster:'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg',
   videoId:'s7EdQ4FqbhY',featured:false,category:'movies'},

  {id:'m9',title:'John Wick',year:2014,genre:['Action','Thriller'],rating:7.4,duration:'1h 41m',
   director:'Chad Stahelski',cast:['Keanu Reeves','Michael Nyqvist','Alfie Allen'],
   description:"An ex-hit-man comes out of retirement to track down the gangsters that killed his dog and took everything from him.",
   poster:'https://image.tmdb.org/t/p/w500/fZPSd91abroad5JeYDp4hgaGhMx.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/umC04Cozevu7nn86uBnMmn3T7oT.jpg',
   videoId:'2AUmvWm5ZDQ',featured:false,category:'movies'},

  {id:'m10',title:'Spider-Man: No Way Home',year:2021,genre:['Action','Adventure'],rating:8.2,duration:'2h 28m',
   director:'Jon Watts',cast:['Tom Holland','Zendaya','Benedict Cumberbatch'],
   description:"Peter Parker's secret identity is revealed, leading chaos across the multiverse.",
   poster:'https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/iQFcwSGbZXMkeyKrxbPnwnRo5fl.jpg',
   videoId:'rt-2cxAiPJk',featured:false,category:'movies'},

  {id:'m11',title:'The Godfather',year:1972,genre:['Crime','Drama'],rating:9.2,duration:'2h 55m',
   director:'Francis Ford Coppola',cast:['Marlon Brando','Al Pacino','James Caan'],
   description:"The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.",
   poster:'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsLYHufncOHgx.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/tmU7GeKVEMrBleo5ycVBFurqvxJ.jpg',
   videoId:'sY1S34973zA',featured:true,category:'movies'},

  {id:'m12',title:'Oppenheimer',year:2023,genre:['Drama','History'],rating:8.3,duration:'3h 0m',
   director:'Christopher Nolan',cast:['Cillian Murphy','Emily Blunt','Matt Damon'],
   description:"The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.",
   poster:'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg',
   videoId:'uYPbbksJxIg',featured:true,category:'movies'},

  {id:'m13',title:'Top Gun: Maverick',year:2022,genre:['Action','Drama'],rating:8.3,duration:'2h 11m',
   director:'Joseph Kosinski',cast:['Tom Cruise','Miles Teller','Jennifer Connelly'],
   description:"After thirty years, Maverick is still pushing the envelope as a top naval aviator.",
   poster:'https://image.tmdb.org/t/p/w500/62HCnUTziyWcpDaBO2i1DX17ljH.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/AkB37EMGilAN21h0CAQRP2hKzDc.jpg',
   videoId:'qSqVVswa420',featured:false,category:'movies'},

  {id:'m14',title:'Avatar',year:2009,genre:['Sci-Fi','Adventure'],rating:7.9,duration:'2h 42m',
   director:'James Cameron',cast:['Sam Worthington','Zoe Saldana','Sigourney Weaver'],
   description:"A paraplegic marine on a mission to the alien moon Pandora becomes torn between orders and protecting the world he feels is his home.",
   poster:'https://image.tmdb.org/t/p/w500/jRXYjXNq0Cs2TcJjLkki24MLp7u.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/o0s4XsEDfDlvit5pDRKjzXR4pp2.jpg',
   videoId:'5PSNL1qE6VY',featured:false,category:'movies'},

  {id:'m15',title:'Gladiator',year:2000,genre:['Action','Drama'],rating:8.5,duration:'2h 35m',
   director:'Ridley Scott',cast:['Russell Crowe','Joaquin Phoenix','Connie Nielsen'],
   description:"A former Roman General sets out to exact vengeance against the corrupt emperor who murdered his family.",
   poster:'https://image.tmdb.org/t/p/w500/ty8TGRuvJLPUmAR1H1nRIsgwvim.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/6WBIzCgmDCYrqh2sKwcMdVbGgSD.jpg',
   videoId:'owK1qxDselE',featured:false,category:'movies'},

  {id:'m16',title:'The Matrix',year:1999,genre:['Sci-Fi','Action'],rating:8.7,duration:'2h 16m',
   director:'The Wachowskis',cast:['Keanu Reeves','Laurence Fishburne','Carrie-Anne Moss'],
   description:"A computer hacker learns about the true nature of his reality and his role in the war against its controllers.",
   poster:'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/ncEsesgOJDNrTUED89hYbA117gg.jpg',
   videoId:'vKQi3bBA1y8',featured:false,category:'movies'},

  {id:'m17',title:'Black Panther',year:2018,genre:['Action','Adventure'],rating:7.3,duration:'2h 14m',
   director:'Ryan Coogler',cast:["Chadwick Boseman","Michael B. Jordan","Lupita Nyong'o"],
   description:"T'Challa returns home to the African nation of Wakanda to take his rightful place as king.",
   poster:'https://image.tmdb.org/t/p/w500/uxzzxijgPIY7slzFvMotPv8wjKA.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/b6ZJZHUdMEFECvGiDpJjlfUWela.jpg',
   videoId:'xjDjIWPAgH4',featured:false,category:'movies'},

  {id:'m18',title:'Joker',year:2019,genre:['Crime','Drama'],rating:8.4,duration:'2h 2m',
   director:'Todd Phillips',cast:['Joaquin Phoenix','Robert De Niro','Zazie Beetz'],
   description:"In Gotham City, mentally troubled comedian Arthur Fleck is disregarded by society and becomes the Joker.",
   poster:'https://image.tmdb.org/t/p/w500/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/f5F4cRhQdUbyVbB5lTNC1F0FYzO.jpg',
   videoId:'zAGVQLHvwOY',featured:false,category:'movies'},

  {id:'m19',title:'Tenet',year:2020,genre:['Sci-Fi','Action'],rating:7.3,duration:'2h 30m',
   director:'Christopher Nolan',cast:['John David Washington','Robert Pattinson','Elizabeth Debicki'],
   description:"Armed with only one word, Tenet, and fighting for the survival of the entire world, a Protagonist journeys through international espionage.",
   poster:'https://image.tmdb.org/t/p/w500/k68nPLbIST6NP96JmTxmZijOneU.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/wzJRB4MKi3yK138bJyuL9nx47y6.jpg',
   videoId:'LdOM0x0XDMo',featured:false,category:'movies'},

  {id:'m20',title:'No Country for Old Men',year:2007,genre:['Crime','Thriller'],rating:8.1,duration:'2h 2m',
   director:'Coen Brothers',cast:['Tommy Lee Jones','Javier Bardem','Josh Brolin'],
   description:"Violence and mayhem ensue after a hunter stumbles upon a drug deal gone wrong and two million dollars in cash.",
   poster:'https://image.tmdb.org/t/p/w500/6d5XOczc0bEXOiMlKBSM1GkQaS9.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/5xkHUFKFOHwA5KZDV7WTGE5DXRI.jpg',
   videoId:'38A__WT3-o0',featured:false,category:'movies'},

  // TV SERIES
  {id:'s1',title:'Breaking Bad',year:2008,genre:['Drama','Crime'],rating:9.5,duration:'5 Seasons',
   director:'Vince Gilligan',cast:['Bryan Cranston','Aaron Paul','Anna Gunn'],
   description:"A chemistry teacher diagnosed with cancer turns to manufacturing meth to secure his family's future.",
   poster:'https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg',
   videoId:'HhesaQXLuRY',featured:true,category:'series'},

  {id:'s2',title:'Stranger Things',year:2016,genre:['Sci-Fi','Horror'],rating:8.7,duration:'4 Seasons',
   director:'Duffer Brothers',cast:['Millie Bobby Brown','Finn Wolfhard','Winona Ryder'],
   description:"When a young boy disappears, supernatural forces and secret experiments unravel a terrifying mystery in a small Indiana town.",
   poster:'https://image.tmdb.org/t/p/w500/x2LSRK2Cm7MZhjluni1msVJ3wDj.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/rcA37ys54PssDn9rHALMzOtChbW.jpg',
   videoId:'b9EkMc79ZSU',featured:true,category:'series'},

  {id:'s3',title:'The Crown',year:2016,genre:['Drama','History'],rating:8.6,duration:'6 Seasons',
   director:'Peter Morgan',cast:['Claire Foy','Olivia Colman','Imelda Staunton'],
   description:"Follows the political rivalries and romance of Queen Elizabeth II's reign across six decades.",
   poster:'https://image.tmdb.org/t/p/w500/1M876KPjulVwppEpldhdc8V4o68.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/who6VO0T9lENLGLfz8fPvdCx4bE.jpg',
   videoId:'JWtnJjn6ng0',featured:false,category:'series'},

  {id:'s4',title:'Game of Thrones',year:2011,genre:['Drama','Fantasy'],rating:9.2,duration:'8 Seasons',
   director:'David Benioff',cast:['Emilia Clarke','Kit Harington','Peter Dinklage'],
   description:"Nine noble families fight for control of the mythical land of Westeros while an ancient enemy returns after thousands of years.",
   poster:'https://image.tmdb.org/t/p/w500/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/suopoADq0k8YZr4dQXcU6aLJ3a.jpg',
   videoId:'KPLWWIOCOOQ',featured:true,category:'series'},

  {id:'s5',title:'The Witcher',year:2019,genre:['Fantasy','Action'],rating:8.2,duration:'3 Seasons',
   director:'Lauren S. Hissrich',cast:['Henry Cavill','Freya Allan','Anya Chalotra'],
   description:"Geralt of Rivia, a solitary monster hunter, struggles to find his place in a world where people often prove more wicked than beasts.",
   poster:'https://image.tmdb.org/t/p/w500/7vjaCdMw15FEbXyLQTVa04URsPm.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/jBJWaqoSCiARWtfV0GlqHrcdidd.jpg',
   videoId:'hiS0EoWB5EA',featured:false,category:'series'},

  {id:'s6',title:'The Last of Us',year:2023,genre:['Drama','Horror'],rating:8.8,duration:'2 Seasons',
   director:'Craig Mazin',cast:['Pedro Pascal','Bella Ramsey','Gabriel Luna'],
   description:"Joel, a hardened survivor, is hired to smuggle Ellie out of an oppressive quarantine zone. What starts as a small job soon becomes a brutal, heartbreaking journey.",
   poster:'https://image.tmdb.org/t/p/w500/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/6Wdl9N6dL0Hi5T4thkizCvrkTkM.jpg',
   videoId:'uLtkt8BonwM',featured:true,category:'series'},

  {id:'s7',title:'Peaky Blinders',year:2013,genre:['Crime','Drama'],rating:8.8,duration:'6 Seasons',
   director:'Steven Knight',cast:['Cillian Murphy','Paul Anderson','Helen McCrory'],
   description:"A gangster family epic set in 1900s England, centering on a gang who sews razor blades in the peaks of their caps.",
   poster:'https://image.tmdb.org/t/p/w500/vUUqzWa2LnHIVqkaKVlVGkPaQca.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/wiE9doxiLwq3WguhPef0bT4fLc.jpg',
   videoId:'oVzVdvGIC7U',featured:false,category:'series'},

  {id:'s8',title:'Dark',year:2017,genre:['Sci-Fi','Thriller'],rating:8.8,duration:'3 Seasons',
   director:'Baran bo Odar',cast:['Louis Hofmann','Oliver Masucci','Karoline Eichhorn'],
   description:"A family saga with a supernatural twist, set in a German town where the disappearance of two young children exposes the double lives of four families.",
   poster:'https://image.tmdb.org/t/p/w500/apbrbWs2BerzUCMBQl7JFHv00If.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/nMcayvRnSGcvtOxCAC7ELvDHBHC.jpg',
   videoId:'rrwycJ08PSA',featured:false,category:'series'},

  {id:'s9',title:'Squid Game',year:2021,genre:['Thriller','Drama'],rating:8.0,duration:'2 Seasons',
   director:'Hwang Dong-hyuk',cast:['Lee Jung-jae','Park Hae-soo','Wi Ha-jun'],
   description:"Hundreds of cash-strapped players accept a strange invitation to compete in children's games with deadly high stakes.",
   poster:'https://image.tmdb.org/t/p/w500/dDlEmu3EZ0Pgg93K2SVNLCjCSvE.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/qw3J9cNeLioOLoR68WX7z79aCdK.jpg',
   videoId:'oqxAJKy0ii4',featured:true,category:'series'},

  {id:'s10',title:'House of the Dragon',year:2022,genre:['Fantasy','Drama'],rating:8.4,duration:'2 Seasons',
   director:'Ryan Condal',cast:["Paddy Considine","Emma D'Arcy","Matt Smith"],
   description:"The story of House Targaryen set 200 years before the events of Game of Thrones.",
   poster:'https://image.tmdb.org/t/p/w500/z2yahl2uefxDCl0nogcRBstwruJ.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/etj8E2o0Bud0HkONVQPjyCkIvpv.jpg',
   videoId:'DotnJ7tTA34',featured:false,category:'series'},

  {id:'s11',title:'Money Heist',year:2017,genre:['Crime','Thriller'],rating:8.2,duration:'5 Seasons',
   director:'Alex Pina',cast:['Alvaro Morte','Itziar Ituno','Pedro Alonso'],
   description:"A criminal mastermind who goes by The Professor plans to pull off the biggest heist in recorded history.",
   poster:'https://image.tmdb.org/t/p/w500/reEMJA1uzscCbkpeRJeTT2bjqUp.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/xGexTKCJDkl61ljM3dB0CxLyGKm.jpg',
   videoId:'_InqQJRqGW4',featured:false,category:'series'},

  {id:'s12',title:'Chernobyl',year:2019,genre:['Drama','History'],rating:9.4,duration:'1 Season',
   director:'Johan Renck',cast:['Jared Harris','Stellan Skarsgard','Emily Watson'],
   description:"In April 1986, an explosion at the Chernobyl nuclear power plant becomes one of the world's worst man-made catastrophes.",
   poster:'https://image.tmdb.org/t/p/w500/hlLXt2tOPT6RRnjiUmoxyG1LTFi.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/6S8XKQD5k17cSmpFMSJT5MnGJJy.jpg',
   videoId:'s9APLXM9Ei8',featured:false,category:'series'},

  // ANIME
  {id:'a1',title:'Attack on Titan',year:2013,genre:['Action','Fantasy'],rating:9.0,duration:'4 Seasons',
   director:'Tetsuro Araki',cast:['Yuki Kaji','Yui Ishikawa','Marina Inoue'],
   description:"After his hometown is destroyed and his mother is killed, young Eren Yeager vows to cleanse the earth of the giant humanoid Titans that have brought humanity to the brink of extinction.",
   poster:'https://image.tmdb.org/t/p/w500/hTP1DtLGFamjfu8WqjnuQdP1n4i.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/iy5EKOlVleRHZwTaEjYgQH7JurC.jpg',
   videoId:'MGRm4IzK1SQ',featured:true,category:'anime'},

  {id:'a2',title:'Death Note',year:2006,genre:['Thriller','Mystery'],rating:9.0,duration:'1 Season',
   director:'Tetsuro Araki',cast:['Mamoru Miyano','Kappei Yamaguchi','Shido Nakamura'],
   description:"A high school student discovers a supernatural notebook that has the power to kill anyone whose name is written within its pages.",
   poster:'https://image.tmdb.org/t/p/w500/iigTWBRGk3QxAnRCEsNVXpSJWPs.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/aDLMHI9oBPdRiF8aSgTHSVgM4Sk.jpg',
   videoId:'NlJZ-YgAt-c',featured:true,category:'anime'},

  {id:'a3',title:'Demon Slayer',year:2019,genre:['Action','Fantasy'],rating:8.7,duration:'4 Seasons',
   director:'Haruo Sotozaki',cast:['Natsuki Hanae','Akari Kito','Yoshitsugu Matsuoka'],
   description:"A young boy becomes a demon slayer after his family is slaughtered and his sister is turned into a demon.",
   poster:'https://image.tmdb.org/t/p/w500/xUfRZu2mi8jH6SzQEJGP6tjBuYj.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/qEcg0kbMdPtqPBGVdQQGCRtBRGf.jpg',
   videoId:'VQGCKyvzIM4',featured:true,category:'anime'},

  {id:'a4',title:'Naruto',year:2002,genre:['Action','Adventure'],rating:8.4,duration:'9 Seasons',
   director:'Hayato Date',cast:['Junko Takeuchi','Chie Nakamura','Noriaki Sugiyama'],
   description:"Naruto Uzumaki, a mischievous adolescent ninja, searches for recognition and dreams to become the Hokage, the village's leader.",
   poster:'https://image.tmdb.org/t/p/w500/xppeysfvDKVx775MFuH8Z9BlpMk.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/BtOe6Jvzp50bCk96Mf1WBKI3s5.jpg',
   videoId:'QczyDKs-HzE',featured:false,category:'anime'},

  {id:'a5',title:'One Piece',year:1999,genre:['Action','Adventure'],rating:8.9,duration:'20+ Seasons',
   director:'Konosuke Uda',cast:['Mayumi Tanaka','Kazuya Nakai','Akemi Okamura'],
   description:"Monkey D. Luffy sets off on an adventure with his pirate crew in hopes of finding the greatest treasure ever left by the legendary Pirate, Gold Roger.",
   poster:'https://image.tmdb.org/t/p/w500/e3NBGiAifW9Xt8xD5tpARskjccO.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/2rmK7mnchw9Xr3XdiTFSxTTLXqv.jpg',
   videoId:'S8_YwFLCh4U',featured:false,category:'anime'},

  {id:'a6',title:'Dragon Ball Z',year:1989,genre:['Action','Adventure'],rating:8.8,duration:'9 Seasons',
   director:'Daisuke Nishio',cast:['Masako Nozawa','Ryo Horikawa','Toshio Furukawa'],
   description:"After learning that he is from another planet, a warrior named Goku and his friends are prompted to defend it from an onslaught of villains.",
   poster:'https://image.tmdb.org/t/p/w500/B7N7IOAFY3l8bFI0OwSxKyXBkDU.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/geGm4zkFCJi1SoFJnhCUrUZ02mO.jpg',
   videoId:'9MHo3BEGn18',featured:false,category:'anime'},

  {id:'a7',title:'Fullmetal Alchemist: Brotherhood',year:2009,genre:['Action','Fantasy'],rating:9.1,duration:'1 Season',
   director:'Yasuhiro Irie',cast:['Romi Park','Rie Kugimiya','Shinichiro Miki'],
   description:"Two brothers search for a Philosopher's Stone after an attempt to revive their deceased mother goes awry.",
   poster:'https://image.tmdb.org/t/p/w500/5ZFUEOULaVml7pQuXxhpR2SmVUw.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/ypbHt24SjoMidFfCX3Lk8aDEgK0.jpg',
   videoId:'--IcmZkvL0Q',featured:true,category:'anime'},

  {id:'a8',title:'Hunter x Hunter',year:2011,genre:['Action','Adventure'],rating:9.0,duration:'6 Seasons',
   director:'Hiroshi Kojina',cast:['Megumi Han','Mariya Ise','Cristina Valenzuela'],
   description:"Gon Freecss aspires to become a Hunter, an exceptional being capable of greatness. With his friends, he seeks out his father.",
   poster:'https://image.tmdb.org/t/p/w500/1ZdED4PBsFF1dtHJDfmTYbGrpMZ.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/pebZ1ZKRX2XYJzRU4YIAFxDELIn.jpg',
   videoId:'D7s6fxbqBnU',featured:false,category:'anime'},

  {id:'a9',title:'My Hero Academia',year:2016,genre:['Action','Comedy'],rating:8.4,duration:'7 Seasons',
   director:'Kenji Nagasaki',cast:['Daiki Yamashita','Kenta Miyake','Nobuhiko Okamoto'],
   description:"A superhero-loving boy without any powers is determined to enroll in a prestigious hero academy.",
   poster:'https://image.tmdb.org/t/p/w500/3AS8MLKXJ7vOTlvCJiXjmePuLq4.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/o5i88FtLSdnYUDnJGiXlEEiRFMF.jpg',
   videoId:'EPo5wWmKEaI',featured:false,category:'anime'},

  {id:'a10',title:'Jujutsu Kaisen',year:2020,genre:['Action','Fantasy'],rating:8.7,duration:'3 Seasons',
   director:'Sunghoo Park',cast:['Junya Enoki','Yuma Uchida','Asami Seto'],
   description:"A boy swallows a cursed talisman and becomes cursed himself. He enters a shaman's school to locate the demon's other body parts.",
   poster:'https://image.tmdb.org/t/p/w500/oiPTEJfJExILFdEVhJg36NiYRaD.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/bO3s5IOJFZq6V9P4E9vfR5HyOFP.jpg',
   videoId:'pkKu9hLT-t8',featured:false,category:'anime'},

  {id:'a11',title:'Sword Art Online',year:2012,genre:['Action','Sci-Fi'],rating:7.5,duration:'4 Seasons',
   director:'Tomohiko Ito',cast:['Yoshitsugu Matsuoka','Haruka Tomatsu','Ai Kayano'],
   description:"In the near future, a VRMMORPG called Sword Art Online has been released where players are trapped and cannot log out.",
   poster:'https://image.tmdb.org/t/p/w500/ajO1gNAzSoS1JE1e0dkp0tTMNmE.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/5U6rMLPcC3aVksBJRJxGYuLCkbq.jpg',
   videoId:'6ohYYtxfDCg',featured:false,category:'anime'},

  {id:'a12',title:'Tokyo Ghoul',year:2014,genre:['Horror','Action'],rating:7.9,duration:'4 Seasons',
   director:'Shuhei Morita',cast:['Natsuki Hanae','Sora Amamiya','Austin Tindle'],
   description:"A young man is attacked by a ghoul and becomes half-ghoul himself. He must now adapt to life in the shadows of Tokyo.",
   poster:'https://image.tmdb.org/t/p/w500/1enwEQVgBKy9lekSXSmXPCODJ6z.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/mCPW4QgCeNJE4MELSUVUNxPaEhL.jpg',
   videoId:'t9W0BqApf3k',featured:false,category:'anime'},

  // CARTOONS
  {id:'c1',title:'Avatar: The Last Airbender',year:2005,genre:['Action','Adventure'],rating:9.3,duration:'3 Seasons',
   director:'Michael DiMartino',cast:['Zach Tyler Eisen','Mae Whitman','Jack De Sena'],
   description:"In a world where humans can control the four elements, a young boy is destined to master all four and bring peace to a war-torn world.",
   poster:'https://image.tmdb.org/t/p/w500/cKhSgBzKQ0gPRQJXIBnrwQg77cF.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/orIt9gFdJaRuXNnrZBsBRMEr4y9.jpg',
   videoId:'d1EnW4kn1kg',featured:true,category:'cartoons'},

  {id:'c2',title:'The Simpsons',year:1989,genre:['Comedy','Animation'],rating:8.7,duration:'35 Seasons',
   director:'Matt Groening',cast:['Dan Castellaneta','Julie Kavner','Nancy Cartwright'],
   description:"The satirical adventures of a working-class family in the misfit city of Springfield.",
   poster:'https://image.tmdb.org/t/p/w500/2IWouZK4gkgHhJa4PPBn6VqAGRD.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/xmrRrQ9LjnCeaEkFyKXGaGwGBGF.jpg',
   videoId:'vNOBNSjGdto',featured:false,category:'cartoons'},

  {id:'c3',title:'Rick and Morty',year:2013,genre:['Sci-Fi','Comedy'],rating:9.1,duration:'7 Seasons',
   director:'Justin Roiland',cast:['Justin Roiland','Chris Parnell','Spencer Grammer'],
   description:"An alcoholic scientist and his timid grandson embark on dangerous, interdimensional adventures.",
   poster:'https://image.tmdb.org/t/p/w500/gdIrmf2DdY5mgN6ycVP0XlzKzbE.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/vBHgEMfCiAJ6lGkJMlUe5DTzklQ.jpg',
   videoId:'F3p7b_su4kQ',featured:true,category:'cartoons'},

  {id:'c4',title:'Spider-Man: Into the Spider-Verse',year:2018,genre:['Action','Animation'],rating:8.4,duration:'1h 57m',
   director:'Bob Persichetti',cast:['Shameik Moore','Jake Johnson','Hailee Steinfeld'],
   description:"Teen Miles Morales becomes the Spider-Man of his universe and must join other Spider-People to stop a threat for all realities.",
   poster:'https://image.tmdb.org/t/p/w500/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/7du3sLBjbCUTRoGnLfAHLrBsJb4.jpg',
   videoId:'tg52up16eq0',featured:true,category:'cartoons'},

  {id:'c5',title:'The Lion King',year:1994,genre:['Animation','Drama'],rating:8.5,duration:'1h 28m',
   director:'Roger Allers',cast:['Matthew Broderick','Jeremy Irons','James Earl Jones'],
   description:"Lion cub and future king Simba searches for his identity after witnessing his father's death.",
   poster:'https://image.tmdb.org/t/p/w500/sKCr5GY4Hq7LO09DWTL6GFF0Qp1.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/wXsQvli6tWqja51pYxXV4WQSg50.jpg',
   videoId:'pK7b3PVbNOQ',featured:false,category:'cartoons'},

  {id:'c6',title:'Gravity Falls',year:2012,genre:['Comedy','Mystery'],rating:8.9,duration:'2 Seasons',
   director:'Alex Hirsch',cast:['Jason Ritter','Kristen Schaal','Alex Hirsch'],
   description:"Twin siblings discover their great-uncle's house in a mysterious town full of supernatural forces.",
   poster:'https://image.tmdb.org/t/p/w500/sCx7FEFEanHxT4pSLSJjTNRJEQu.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/axKqalBXTnrKUF3R0jL7DnvRMPN.jpg',
   videoId:'7AQZB3dvBCo',featured:false,category:'cartoons'},

  {id:'c7',title:'Shrek',year:2001,genre:['Animation','Comedy'],rating:7.9,duration:'1h 30m',
   director:'Andrew Adamson',cast:['Mike Myers','Eddie Murphy','Cameron Diaz'],
   description:"A mean lord exiles fairytale creatures to the swamp of a grumpy ogre who must go on a quest to get his land back.",
   poster:'https://image.tmdb.org/t/p/w500/iB64vpL3dIObOtMZgX3RqdVdQDc.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/MaVrCCKBIKjBhFz5CNJNPF9D8VU.jpg',
   videoId:'W37DlG1i61s',featured:false,category:'cartoons'},

  {id:'c8',title:'Kung Fu Panda',year:2008,genre:['Animation','Action'],rating:7.6,duration:'1h 32m',
   director:'Mark Osborne',cast:['Jack Black','Dustin Hoffman','Angelina Jolie'],
   description:"The Dragon Warrior must fulfill his destiny and face the villainous snow leopard Tai Lung.",
   poster:'https://image.tmdb.org/t/p/w500/wWt9O2Ou3MQlqmVf9fL5vXEVTvJ.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/nEKxnrLOJxMVGHvkHjdNyPcNE0e.jpg',
   videoId:'9SvvOaLVye8',featured:false,category:'cartoons'},

  {id:'c9',title:'Teen Titans Go!',year:2013,genre:['Comedy','Action'],rating:5.9,duration:'8 Seasons',
   director:'Michael Jelenic',cast:['Greg Cipes','Scott Menville','Khary Payton'],
   description:"The comedy adventures of the Teen Titans as they solve crimes, villains, and their own personal issues.",
   poster:'https://image.tmdb.org/t/p/w500/b8IXYEiRlTPq2PtoMmJOWjnGHC0.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/qsMzFqmBGjEgVTWnL52l01pR5vN.jpg',
   videoId:'VFzX8CAkNAk',featured:false,category:'cartoons'},

  {id:'c10',title:'Over the Garden Wall',year:2014,genre:['Adventure','Mystery'],rating:8.7,duration:'1 Season',
   director:'Patrick McHale',cast:['Elijah Wood','Collin Dean','Melanie Lynskey'],
   description:"Two brothers travel through a strange forest trying to find their way home. A short but magical animated miniseries.",
   poster:'https://image.tmdb.org/t/p/w500/q6Fh3VE62RXGC2FhRJ94q2FZXoR.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/aOOYCpqBYtWWTBa9JN7KGPiMXp7.jpg',
   videoId:'3jhTqiWANKE',featured:false,category:'cartoons'},

  {id:'c11',title:'The Incredibles',year:2004,genre:['Animation','Action'],rating:8.0,duration:'1h 55m',
   director:'Brad Bird',cast:['Craig T. Nelson','Holly Hunter','Samuel L. Jackson'],
   description:"A family of undercover superheroes must use their abilities to save the world.",
   poster:'https://image.tmdb.org/t/p/w500/2LqaLgk4Z226KkgPJuiOQ58ShpS.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/lMKikBP3w8GjD2YMRLaBaDPxV30.jpg',
   videoId:'2X9eoNpE4Kk',featured:false,category:'cartoons'},

  {id:'c12',title:'Adventure Time',year:2010,genre:['Adventure','Comedy'],rating:8.6,duration:'10 Seasons',
   director:'Pendleton Ward',cast:['Jeremy Shada','John DiMaggio','Tom Kenny'],
   description:"Finn and Jake travel through the post-apocalyptic land of Ooo, experiencing amazing adventures.",
   poster:'https://image.tmdb.org/t/p/w500/qXthUuaFGmQQJMXXhMMBBumQU65.jpg',
   backdrop:'https://image.tmdb.org/t/p/original/rNFSmYXHdEMHJjrGzBRgvsKbUNk.jpg',
   videoId:'i6SXxAGRpHU',featured:false,category:'cartoons'},
];
