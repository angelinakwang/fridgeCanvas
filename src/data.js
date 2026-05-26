export const PAPER_COLORS = [
  '#faf7ee', '#fef0f5', '#edf3fe', '#ecf7ef',
  '#fef9e7', '#f3eefe', '#f5f5f5', '#1f1f1f',
];

export const ACCENT_COLORS = [
  '#e8a0b4', '#fac775', '#9fe1cb', '#b5d4f4',
  '#cecbf6', '#c0dd97', '#e05c5c', '#4a90d9', '#1a1a1a',
];

export const TAG_COLORS = {
  wishlist: { bg: '#fce4ec', tag: '#e8a0b4', tagText: '#4a1528' },
  quote:    { bg: '#e3f0fd', tag: '#b5d4f4', tagText: '#042c53' },
  recipe:   { bg: '#f0f7e6', tag: '#c0dd97', tagText: '#173404' },
  create:   { bg: '#fff8e8', tag: '#fac775', tagText: '#412402' },
  place:    { bg: '#e0f5ed', tag: '#9fe1cb', tagText: '#04342c' },
  idea:     { bg: '#eeedfe', tag: '#cecbf6', tagText: '#26215c' },
};

export const INDEX_BORDERS = {
  wishlist: '#e8a0b4', quote: '#b5d4f4', recipe: '#c0dd97',
  create: '#fac775', place: '#9fe1cb', idea: '#cecbf6',
};

export const PIN_COLORS = ['#e05c5c','#4a90d9','#f0a030','#6abf69','#b06ed4','#40c9a2','#e07060'];

export const ALL_TAGS = ['wishlist','quote','recipe','create','place','idea'];
export const ALL_STYLES = ['sticky','torn','index','envelope'];

export const INITIAL_NOTES = [
  { id:'1',  title:'Le Creuset dutch oven',     body:'the sage green one 🌿',                                                                      tag:'wishlist', style:'sticky',   x:90,  y:70,  rot:-2   },
  { id:'2',  title:'',                           body:'"Be regular and orderly in your life so that you may be violent and original in your work." — Flaubert', tag:'quote',    style:'torn',     x:330, y:130, rot:1.5  },
  { id:'3',  title:'Miso Ramen',                 body:'dashi, white miso, tahini, soft egg, scallions. 30 min!',                                    tag:'recipe',  style:'index',    x:610, y:55,  rot:-1   },
  { id:'4',  title:'zine #2',                    body:'collage of found textures — risograph?',                                                     tag:'create',  style:'sticky',   x:170, y:290, rot:2    },
  { id:'5',  title:'Porto, Portugal',            body:'bookshop Lello, the ribeira, wine caves in Gaia',                                            tag:'place',   style:'envelope', x:490, y:300, rot:-1.5 },
  { id:'6',  title:'morning ritual app',         body:'no notifications until 9am. analog feel.',                                                   tag:'idea',    style:'sticky',   x:780, y:210, rot:1    },
  { id:'7',  title:'Maison Margiela Tabis',      body:'the white split-toe ones',                                                                   tag:'wishlist',style:'index',    x:940, y:65,  rot:-0.5 },
  { id:'8',  title:'',                           body:'"The best time to plant a tree was 20 years ago. The second best time is now."',             tag:'quote',   style:'sticky',   x:55,  y:470, rot:1.8  },
  { id:'9',  title:'Oaxaca, Mexico',             body:'mole negro, mezcal distilleries, Monte Albán ruins',                                         tag:'place',   style:'torn',     x:710, y:415, rot:-2   },
  { id:'10', title:'Brown butter cookies',       body:'nutty, sea salt flakes, slightly underbaked',                                                tag:'recipe',  style:'sticky',   x:305, y:475, rot:-1   },
  { id:'11', title:'learn risograph printing',   body:'find a studio that rents press time',                                                        tag:'create',  style:'torn',     x:920, y:355, rot:2.5  },
  { id:'12', title:'Aesop Marrakech',            body:'the room spray & hand balm duo',                                                             tag:'wishlist',style:'sticky',   x:555, y:510, rot:-0.8 },
  { id:'13', title:'Okonkwo quote',              body:'"There is no story that is not true." — Achebe, Things Fall Apart',                          tag:'quote',   style:'index',    x:130, y:620, rot:1.2  },
  { id:'14', title:'Lisbon, Portugal',           body:'trams, pastéis de nata, Alfama tiles',                                                       tag:'place',   style:'sticky',   x:400, y:640, rot:-1.8 },
  { id:'15', title:'sourdough loaf',             body:'75% hydration, overnight cold proof',                                                        tag:'recipe',  style:'envelope', x:720, y:580, rot:0.8  },
];
