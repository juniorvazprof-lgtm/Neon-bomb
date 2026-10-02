// Bomba Neon 84 — estado do jogo e modelos dos personagens
/* ---------- state ---------- */
const grid=new Uint8Array(N),brickSlot=new Int16Array(N),fireT=new Float32Array(N),fireOwner=new Int8Array(N);
let bombs=[],echoes=[],bombAt=new Map(),powerups=new Map(),falls=[];
let wallCount=0,brickCount=0,shake=0;
const G={phase:'menu',arena:1,mod:null,time:0,count:0,sdT:0,sdI:0,spiral:[],endT:-1,stats:{a:0,k:0,b:0}};
const input={dir:null,bomb:false,keys:[]};

function makeModel(color){
  const g=new THREE.Group(),inner=new THREE.Group();g.add(inner);
  const body=new THREE.Mesh(new THREE.CylinderGeometry(.24,.32,.46,10),new THREE.MeshLambertMaterial({color,emissive:color,emissiveIntensity:.25}));body.position.y=.33;
  const head=new THREE.Mesh(new THREE.SphereGeometry(.25,14,10),new THREE.MeshLambertMaterial({color:0xf1e6ff,emissive:0x2a1a40}));head.position.y=.74;
  const visor=new THREE.Mesh(new THREE.BoxGeometry(.36,.1,.12),new THREE.MeshBasicMaterial({color}));visor.position.set(0,.76,.19);
  const stick=new THREE.Mesh(new THREE.CylinderGeometry(.02,.02,.2,4),new THREE.MeshBasicMaterial({color:0xffffff}));stick.position.y=1.02;
  const ball=new THREE.Mesh(new THREE.SphereGeometry(.07,8,6),new THREE.MeshBasicMaterial({color}));ball.position.y=1.14;
  const armL=new THREE.Mesh(new THREE.SphereGeometry(.09,8,6),body.material);armL.position.set(-.33,.38,0);
  const armR=armL.clone();armR.position.x=.33;
  inner.add(body,head,visor,stick,ball,armL,armR);
  const glow=new THREE.Mesh(glowGeo,new THREE.MeshBasicMaterial({map:glowTex,color,transparent:true,opacity:.75,blending:THREE.AdditiveBlending,depthWrite:false}));
  glow.rotation.x=-Math.PI/2;glow.position.y=.02;glow.scale.setScalar(1.5);g.add(glow);
  glow.userData.keep=true;
  const bubble=new THREE.Mesh(new THREE.SphereGeometry(.62,10,6),new THREE.MeshBasicMaterial({color:0xffe36e,wireframe:true,transparent:true,opacity:.28,blending:THREE.AdditiveBlending,depthWrite:false}));
  bubble.position.y=.55;bubble.visible=false;bubble.userData.keep=true;g.add(bubble);
  scene.add(g);
  return {g,inner,body,armL,armR,glow,bubble};
}
const ents=COLORS.map((c,i)=>({id:i,human:i===0,color:c,name:NAMES[i],m:makeModel(c),perm:{},ups:[],x:0,z:0,tx:0,tz:0,p:0,moving:false,dx:0,dz:1,alive:true,deadT:0,walk:0,sq:0,thinkCD:0,inv:0}));

// arrow + floor ring that mark the human player
{const h=ents[0],m=h.m;
 const mk=new THREE.Mesh(new THREE.ConeGeometry(.28,.46,3),new THREE.MeshBasicMaterial({color:0xff5fb5}));
 const edge=new THREE.LineSegments(new THREE.EdgesGeometry(mk.geometry),new THREE.LineBasicMaterial({color:0xffffff}));mk.add(edge);
 mk.position.y=1.6;mk.userData.keep=edge.userData.keep=true;
 const ring=new THREE.Mesh(new THREE.RingGeometry(.44,.54,36),new THREE.MeshBasicMaterial({color:0xff2e97,transparent:true,opacity:.8,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));
 ring.rotation.x=-Math.PI/2;ring.position.y=.04;ring.userData.keep=true;
 m.g.add(mk,ring);m.mk=mk;m.ring=ring;}
function resetPerm(){for(const e of ents){e.perm={bomb:0,fire:0,speed:0,shield:0,pierce:0,eco:0,xb:0,beat:0};e.ups=[];}}
resetPerm();
