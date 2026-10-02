// Bomba Neon 84 — constantes, regras da roleta, melhorias e textos PT/EN
const $=s=>document.querySelector(s);
const W=13,H=15,N=W*H;
const idx=(x,z)=>z*W+x;
const CX=(W-1)/2,CZ=(H-1)/2;
const COLORS=[0xff2e97,0x00e5ff,0xff9e2c,0xb98cff];
const CSSC=['#ff2e97','#00e5ff','#ff9e2c','#b98cff'];
const NAMES=['VOCÊ','CIANO','LARANJA','LAVANDA'];
const SPAWNS=[[1,H-2],[W-2,1],[W-2,H-2],[1,1]];
const DIRS=[[1,0],[-1,0],[0,1],[0,-1]];

const MODS=[
 {id:'turbo',name:'TURBO',desc:'Todos se movem 35% mais rápido.',speedMul:1.35},
 {id:'mega',name:'MEGAFOGO',desc:'Todas as explosões ganham +2 de alcance.',rangeAdd:2},
 {id:'pavio',name:'PAVIO CURTO',desc:'As bombas explodem a cada 2 tempos, não a cada compasso.',fuse:1},
 {id:'nevoa',name:'NÉVOA NEON',desc:'Uma névoa roxa encobre o fundo da arena.',fog:true},
 {id:'chuva',name:'CHUVA DE ITENS',desc:'60% dos blocos quebrados soltam itens.',drop:0.6},
 {id:'aberto',name:'CAMPO ABERTO',desc:'Bem menos blocos. A caçada começa cedo.',density:0.38},
];
const UPS=[
 {id:'bomb',g:'B+',name:'+1 Bomba',desc:'Uma bomba a mais ao mesmo tempo.',rar:'COMUM',max:4},
 {id:'fire',g:'F+',name:'+1 Alcance',desc:'Suas explosões vão uma casa mais longe.',rar:'COMUM',max:4},
 {id:'speed',g:'V+',name:'Turbo',desc:'Anda 0,5 casa por segundo mais rápido.',rar:'COMUM',max:3},
 {id:'shield',g:'ES',name:'Escudo',desc:'Absorve um golpe em cada arena.',rar:'RARA',max:1},
 {id:'pierce',g:'PF',name:'Perfurante',desc:'O fogo atravessa blocos quebráveis.',rar:'RARA',max:1},
 {id:'beat',g:'♪',name:'Metrônomo',desc:'Bomba solta na batida ganha +2 de alcance, não +1.',rar:'RARA',max:1,human:true},
 {id:'eco',g:'EC',name:'Eco',desc:'Cada bomba explode de novo na batida seguinte.',rar:'ÉPICA',max:1},
 {id:'xb',g:'X',name:'Explosão X',desc:'Suas bombas também explodem nas diagonais.',rar:'ÉPICA',max:1},
];
const MODS_EN={turbo:['TURBO','Everyone moves 35% faster.'],mega:['MEGAFIRE','All explosions get +2 range.'],pavio:['SHORT FUSE','Bombs go off every 2 beats instead of every bar.'],nevoa:['NEON FOG','A purple fog hides the back of the arena.'],chuva:['ITEM RAIN','60% of broken blocks drop items.'],aberto:['OPEN FIELD','Far fewer blocks. The hunt starts early.']};
MODS.forEach(m=>m.en={name:MODS_EN[m.id][0],desc:MODS_EN[m.id][1]});
const UPS_EN={bomb:['+1 Bomb','One more bomb at a time.'],fire:['+1 Range','Your explosions reach one tile further.'],speed:['Turbo','Move 0.5 tiles per second faster.'],shield:['Shield','Absorbs one hit each arena.'],pierce:['Piercing','Fire goes through breakable blocks.'],beat:['Metronome','Bombs dropped on the beat get +2 range instead of +1.'],eco:['Echo','Each bomb explodes again on the next beat.'],xb:['X Blast','Your bombs also explode diagonally.']};
UPS.forEach(u=>u.en={name:UPS_EN[u.id][0],desc:UPS_EN[u.id][1]});
const RARL={pt:{COMUM:'COMUM',RARA:'RARA','ÉPICA':'ÉPICA'},en:{COMUM:'COMMON',RARA:'RARE','ÉPICA':'EPIC'}};
const NAMES_L={pt:['VOCÊ','CIANO','LARANJA','LAVANDA'],en:['YOU','CYAN','ORANGE','LAVENDER']};
const I18N={
 pt:{lede:'Uma run de 3 arenas contra 3 robôs. A roleta muda as regras de cada arena e você escolhe uma melhoria a cada vitória.',
  h_compass:'COMPASSO',h_compass_d:'Toda bomba explode no 1º tempo do compasso. O chão pisca em vermelho antes',
  h_bomb:'BOMBA',h_bomb_d:'Solte no pulso para +1 de alcance. Toque de novo em cima dela para arremessar',
  h_kick:'CHUTE',h_kick_d:'Ande contra uma bomba para ela deslizar pela arena',
  h_items:'ITENS',h_items_d:'Blocos soltam alcance, bomba extra, velocidade, mega bomba, escudo e turbo',
  h_ghost:'FANTASMA',h_ghost_d:'Morreu? Jogue bombas da borda. Derrube alguém e volte no lugar dele',
  start:'COMEÇAR RUN',keys:'No teclado: setas ou WASD e espaço',o_lang:'IDIOMA',o_fx:'EFEITOS',fx0:'LIMPO',fx1:'SUAVE',fx2:'COMPLETO',
  enter:'ENTRAR NA ARENA',won:'ARENA VENCIDA',pick:'Escolha uma melhoria',st_a:'ARENAS',st_k:'ROBÔS',st_b:'BLOCOS',again:'NOVA RUN',
  ghostBar:'VOCÊ É UM FANTASMA · derrube alguém para voltar',bombBtn:'BOMBA',sound:'SOM',mute:'MUDO',
  c_throw:'ARREMESSO',c_chain:'CADEIA x',c_kick:'CHUTE',c_back_me:'VOLTEI!',c_back:'{0} VOLTOU',c_ghost:'VIROU FANTASMA',
  t_shield:'<b>Escudo</b> absorveu o golpe',t_ghost:'Você virou <b>fantasma</b>: ande pela borda e jogue bombas. Derrube alguém para voltar.',
  t_sd:'<b>MORTE SÚBITA</b> as paredes estão fechando',t_bots:'Os robôs também evoluíram: ',go:'VAI!',walls:'',sd:'MORTE SÚBITA',
  rou:'ROLETA DA ARENA {0}',spin:'Girando…',runDone:'RUN COMPLETA',runOver:'FIM DA RUN',champ:'Campeão da grade neon',fell:'Você caiu na arena {0}',
  build:'Sua build: ',nobuild:'Sem melhorias nesta run.',waiting:'AGUARDANDO',onbeat:'NA BATIDA +{0}',
  pu_fire:'+ALCANCE',pu_bomb:'+BOMBA',pu_speed:'+VELOCIDADE',pu_mega:'MEGA BOMBA',pu_guard:'ESCUDO 8s',pu_rush:'TURBO 6s'},
 en:{lede:'A 3-arena run against 3 robots. The roulette changes each arena\'s rules and you pick an upgrade after every win.',
  h_compass:'BAR',h_compass_d:'Every bomb explodes on beat 1 of the bar. The floor flashes red right before',
  h_bomb:'BOMB',h_bomb_d:'Drop it on the pulse for +1 range. Tap again while standing on it to throw it',
  h_kick:'KICK',h_kick_d:'Walk into a bomb to send it sliding across the arena',
  h_items:'ITEMS',h_items_d:'Blocks drop range, extra bomb, speed, mega bomb, shield and rush',
  h_ghost:'GHOST',h_ghost_d:'Died? Throw bombs from the edge. Take someone out and you return in their place',
  start:'START RUN',keys:'Keyboard: arrows or WASD and space',o_lang:'LANGUAGE',o_fx:'EFFECTS',fx0:'CLEAN',fx1:'SOFT',fx2:'FULL',
  enter:'ENTER THE ARENA',won:'ARENA CLEARED',pick:'Pick an upgrade',st_a:'ARENAS',st_k:'ROBOTS',st_b:'BLOCKS',again:'NEW RUN',
  ghostBar:'YOU ARE A GHOST · take someone out to come back',bombBtn:'BOMB',sound:'SOUND',mute:'MUTED',
  c_throw:'THROW',c_chain:'CHAIN x',c_kick:'KICK',c_back_me:"I'M BACK!",c_back:'{0} IS BACK',c_ghost:'GHOSTED',
  t_shield:'<b>Shield</b> absorbed the hit',t_ghost:'You became a <b>ghost</b>: move along the edge and throw bombs. Take someone out to come back.',
  t_sd:'<b>SUDDEN DEATH</b> the walls are closing in',t_bots:'The robots evolved too: ',go:'GO!',walls:'',sd:'SUDDEN DEATH',
  rou:'ARENA {0} ROULETTE',spin:'Spinning…',runDone:'RUN COMPLETE',runOver:'RUN OVER',champ:'Champion of the neon grid',fell:'You fell in arena {0}',
  build:'Your build: ',nobuild:'No upgrades this run.',waiting:'WAITING',onbeat:'ON BEAT +{0}',
  pu_fire:'+RANGE',pu_bomb:'+BOMB',pu_speed:'+SPEED',pu_mega:'MEGA BOMB',pu_guard:'SHIELD 8s',pu_rush:'RUSH 6s'}
};
let LANG='pt';try{LANG=localStorage.getItem('bn84_lang')||((navigator.language||'pt').toLowerCase().startsWith('pt')?'pt':'en');}catch(e){}
function T(k,...a){let v=(I18N[LANG]&&I18N[LANG][k])??I18N.pt[k]??k;a.forEach((x,i)=>v=v.replace('{'+i+'}',x));return v;}
function L(o,f){return LANG==='en'&&o.en?o.en[f]:o[f];}
function pname(e){return NAMES_L[LANG][e.id];}
const RARC={COMUM:'#00e5ff',RARA:'#ff9e2c','ÉPICA':'#ff2e97'};
const RARW={COMUM:5,RARA:3,'ÉPICA':1.6};
