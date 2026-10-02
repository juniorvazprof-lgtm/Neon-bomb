// Bomba Neon 84 — cena Three.js, texturas, bloom, partículas e efeitos
/* ---------- renderer ---------- */
const stage=$('#stage');
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.75));
stage.appendChild(renderer.domElement);
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(34,1,0.5,300);
let camDist=40;
let composer=null,bloom=null,quality=2;
let FX=1;try{const v=localStorage.getItem('bn84_fx');if(v!==null)FX=+v;}catch(e){}
const FXB=[0,.45,.75],FXP=[.35,.6,1],FXF=[0,.28,.55];
try{
  if(THREE.EffectComposer&&THREE.UnrealBloomPass){
    composer=new THREE.EffectComposer(renderer);
    composer.addPass(new THREE.RenderPass(scene,camera));
    bloom=new THREE.UnrealBloomPass(new THREE.Vector2(256,256),.55,.45,.72);
    composer.addPass(bloom);
  }
}catch(e){composer=null;}

function canvasTex(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);return new THREE.CanvasTexture(c);}

const bgTex=canvasTex(512,1024,(g,w,h)=>{
  const gr=g.createLinearGradient(0,0,0,h);
  gr.addColorStop(0,'#05010f');gr.addColorStop(.35,'#1a0638');gr.addColorStop(.62,'#3a0b52');gr.addColorStop(1,'#12031f');
  g.fillStyle=gr;g.fillRect(0,0,w,h);
  for(let i=0;i<140;i++){g.fillStyle=`rgba(255,255,255,${Math.random()*.7})`;g.fillRect(Math.random()*w,Math.random()*h*.5,1.4,1.4);}
  const cy=h*.16,r=w*.3;
  const sg=g.createLinearGradient(0,cy-r,0,cy+r);
  sg.addColorStop(0,'#ffe36e');sg.addColorStop(.5,'#ff8a3c');sg.addColorStop(1,'#ff2e97');
  g.save();g.shadowColor='#ff2e97';g.shadowBlur=60;g.fillStyle=sg;g.beginPath();g.arc(w/2,cy,r,0,Math.PI*2);g.fill();g.restore();
  g.globalCompositeOperation='destination-out';
  for(let k=0;k<7;k++){const y=cy+r*.08+k*r*.14;g.fillRect(0,y,w,2+k*1.8);}
  g.globalCompositeOperation='source-over';
});
scene.background=bgTex;
scene.fog=new THREE.Fog(0x1c0736,60,110);

scene.add(new THREE.HemisphereLight(0x9a7cff,0x2a0033,1.0));
const dl=new THREE.DirectionalLight(0xffb3dc,0.7);dl.position.set(-6,14,8);scene.add(dl);

const outerGrid=new THREE.GridHelper(140,70,0xff2e97,0x6a1b9a);
outerGrid.position.set(CX,-1.4,CZ);outerGrid.material.transparent=true;outerGrid.material.opacity=.55;scene.add(outerGrid);

const floorTex=canvasTex(128,128,(g,w,h)=>{
  g.fillStyle='#0d0420';g.fillRect(0,0,w,h);
  g.strokeStyle='rgba(255,46,151,.9)';g.lineWidth=3;g.shadowColor='#ff2e97';g.shadowBlur=10;g.strokeRect(2,2,w-4,h-4);
  g.shadowBlur=0;g.fillStyle='rgba(0,229,255,.5)';g.fillRect(w/2-2,h/2-2,4,4);
});
floorTex.wrapS=floorTex.wrapT=THREE.RepeatWrapping;floorTex.repeat.set(W,H);
const floorMat=new THREE.MeshBasicMaterial({map:floorTex});
const floor=new THREE.Mesh(new THREE.PlaneGeometry(W,H),floorMat);
floor.rotation.x=-Math.PI/2;floor.position.set(CX,0,CZ);scene.add(floor);
const base=new THREE.Mesh(new THREE.BoxGeometry(W+.2,1.2,H+.2),new THREE.MeshLambertMaterial({color:0x120528,emissive:0x2a0a4a}));
base.position.set(CX,-0.61,CZ);scene.add(base);

const wallTex=canvasTex(128,128,(g,w,h)=>{
  g.fillStyle='#1d0a3a';g.fillRect(0,0,w,h);
  g.shadowColor='#ff2e97';g.shadowBlur=14;g.strokeStyle='#ff4fb0';g.lineWidth=6;g.strokeRect(5,5,w-10,h-10);
  g.shadowBlur=0;g.strokeStyle='rgba(185,140,255,.5)';g.lineWidth=2;g.strokeRect(22,22,w-44,h-44);
});
const brickTex=canvasTex(128,128,(g,w,h)=>{
  g.fillStyle='#0b1a33';g.fillRect(0,0,w,h);
  g.shadowColor='#00e5ff';g.shadowBlur=10;g.strokeStyle='#27e9ff';g.lineWidth=4;
  g.strokeRect(4,4,w-8,h-8);
  g.beginPath();g.moveTo(4,h/2);g.lineTo(w-4,h/2);g.moveTo(w/2,4);g.lineTo(w/2,h/2);g.moveTo(w/4,h/2);g.lineTo(w/4,h-4);g.moveTo(w*.75,h/2);g.lineTo(w*.75,h-4);g.stroke();
});
const wallMat=new THREE.MeshLambertMaterial({map:wallTex,emissiveMap:wallTex,emissive:0xffffff,emissiveIntensity:.8});
const brickMat=new THREE.MeshLambertMaterial({map:brickTex,emissiveMap:brickTex,emissive:0xffffff,emissiveIntensity:.75});
const wallMesh=new THREE.InstancedMesh(new THREE.BoxGeometry(.98,1,.98),wallMat,N);
const brickMesh=new THREE.InstancedMesh(new THREE.BoxGeometry(.9,.78,.9),brickMat,N);
wallMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);brickMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
scene.add(wallMesh,brickMesh);
const dummy=new THREE.Object3D();

const glowTex=canvasTex(128,128,(g,w,h)=>{const r=g.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.35,'rgba(255,255,255,.35)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,w,h);});
const glowGeo=new THREE.PlaneGeometry(1,1);

/* pools: fire + shards */
const fireGeo=new THREE.BoxGeometry(.96,.7,.96),coreGeo=new THREE.BoxGeometry(.5,.9,.5);
const fireMat=new THREE.MeshBasicMaterial({color:0xff2e6a,transparent:true,opacity:.5,blending:THREE.AdditiveBlending,depthWrite:false});
const coreMat=new THREE.MeshBasicMaterial({color:0xff9e2c,transparent:true,opacity:.6,blending:THREE.AdditiveBlending,depthWrite:false});
const FP=220,fires=[];let fireHead=0;
for(let i=0;i<FP;i++){const o=new THREE.Mesh(fireGeo,fireMat),c=new THREE.Mesh(coreGeo,coreMat);o.visible=c.visible=false;scene.add(o,c);fires.push({o,c,age:0,life:0});}
const shardGeo=new THREE.BoxGeometry(.18,.18,.18);
const shardMat=new THREE.MeshBasicMaterial({color:0x27e9ff});
const SP=120,shards=[];let shardHead=0;
for(let i=0;i<SP;i++){const m=new THREE.Mesh(shardGeo,shardMat);m.visible=false;scene.add(m);shards.push({m,v:new THREE.Vector3(),life:0});}

/* GPU particles: one draw call for every spark, ember and trail */
const PMAX=2600;
const pPos=new Float32Array(PMAX*3),pCol=new Float32Array(PMAX*3),pSize=new Float32Array(PMAX),pAlpha=new Float32Array(PMAX);
const pVel=new Float32Array(PMAX*3),pLife=new Float32Array(PMAX),pMax=new Float32Array(PMAX),pDrag=new Float32Array(PMAX),pGrav=new Float32Array(PMAX),pS0=new Float32Array(PMAX);
let pHead=0;
const pGeo=new THREE.BufferGeometry();
pGeo.setAttribute('position',new THREE.BufferAttribute(pPos,3).setUsage(THREE.DynamicDrawUsage));
pGeo.setAttribute('color',new THREE.BufferAttribute(pCol,3).setUsage(THREE.DynamicDrawUsage));
pGeo.setAttribute('size',new THREE.BufferAttribute(pSize,1).setUsage(THREE.DynamicDrawUsage));
pGeo.setAttribute('alpha',new THREE.BufferAttribute(pAlpha,1).setUsage(THREE.DynamicDrawUsage));
const pMat=new THREE.ShaderMaterial({
  uniforms:{uScale:{value:900}},
  vertexShader:'attribute float size;attribute float alpha;attribute vec3 color;varying vec3 vC;varying float vA;uniform float uScale;void main(){vC=color;vA=alpha;vec4 mv=modelViewMatrix*vec4(position,1.0);gl_PointSize=size*uScale/-mv.z;gl_Position=projectionMatrix*mv;}',
  fragmentShader:'varying vec3 vC;varying float vA;void main(){float d=length(gl_PointCoord-0.5);float a=smoothstep(0.5,0.0,d);a*=a;gl_FragColor=vec4(vC*(1.0+a*1.5),a*vA);}',
  transparent:true,depthWrite:false,blending:THREE.AdditiveBlending
});
const points=new THREE.Points(pGeo,pMat);points.frustumCulled=false;scene.add(points);
const tmpC=new THREE.Color();
function emit(x,y,z,vx,vy,vz,life,size,col,grav=0,drag=0){
  const i=pHead;pHead=(pHead+1)%PMAX;const k=i*3;
  pPos[k]=x;pPos[k+1]=y;pPos[k+2]=z;pVel[k]=vx;pVel[k+1]=vy;pVel[k+2]=vz;
  tmpC.set(col);pCol[k]=tmpC.r;pCol[k+1]=tmpC.g;pCol[k+2]=tmpC.b;
  pLife[i]=pMax[i]=life;pS0[i]=size;pGrav[i]=grav;pDrag[i]=drag;pAlpha[i]=1;pSize[i]=size;
}
function burst(x,y,z,n,speed,cols,life,size,grav=6,up=0){
  n=Math.max(1,Math.round(n*FXP[FX]));
  for(let j=0;j<n;j++){
    const a=Math.random()*Math.PI*2,e=Math.random()*Math.PI-Math.PI/2,s=speed*(.35+Math.random()*.65);
    emit(x,y,z,Math.cos(a)*Math.cos(e)*s,Math.abs(Math.sin(e))*s+up,Math.sin(a)*Math.cos(e)*s,life*(.6+Math.random()*.6),size*(.6+Math.random()*.8),cols[j%cols.length],grav,1.6);
  }
}
function updParticles(dt){
  for(let i=0;i<PMAX;i++){
    if(pLife[i]<=0)continue;
    pLife[i]-=dt;const k=i*3;
    if(pLife[i]<=0){pAlpha[i]=0;continue;}
    const dr=Math.max(0,1-pDrag[i]*dt);
    pVel[k]*=dr;pVel[k+1]=pVel[k+1]*dr-pGrav[i]*dt;pVel[k+2]*=dr;
    pPos[k]+=pVel[k]*dt;pPos[k+1]+=pVel[k+1]*dt;pPos[k+2]+=pVel[k+2]*dt;
    if(pPos[k+1]<.04){pPos[k+1]=.04;pVel[k+1]*=-.35;pVel[k]*=.7;pVel[k+2]*=.7;}
    const a=pLife[i]/pMax[i];pAlpha[i]=Math.min(1,a*1.6);pSize[i]=pS0[i]*(.35+.65*a);
  }
  pGeo.attributes.position.needsUpdate=pGeo.attributes.color.needsUpdate=pGeo.attributes.size.needsUpdate=pGeo.attributes.alpha.needsUpdate=true;
}

/* red warning tiles on cells about to burn */
const warnMat=new THREE.MeshBasicMaterial({color:0xff1f4a,transparent:true,opacity:.4,blending:THREE.AdditiveBlending,depthWrite:false});
const warnGeo=new THREE.PlaneGeometry(.9,.9),warns=[];
for(let k=0;k<140;k++){const w=new THREE.Mesh(warnGeo,warnMat);w.rotation.x=-Math.PI/2;w.visible=false;scene.add(w);warns.push(w);}
function updWarn(){
  let n=0;const seen=new Set();
  for(const b of bombs){if(b.t>.8||b.fly)continue;
    rays(b.x,b.z,b.range,b.pierce,b.xb,i=>{if(seen.has(i)||n>=warns.length)return;seen.add(i);warns[n++].position.set(i%W,.03,Math.floor(i/W));});}
  for(let k=0;k<warns.length;k++)warns[k].visible=k<n;
  warnMat.opacity=.2+.3*(.5+.5*Math.sin(G.time*28));
}
function hideWarn(){for(const w of warns)w.visible=false;}
/* shockwave rings + floor light splashes */
const ringGeoW=new THREE.RingGeometry(.82,1,48);
const waves=[];
for(let i=0;i<16;i++){
  const r=new THREE.Mesh(ringGeoW,new THREE.MeshBasicMaterial({color:0xffc26b,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));
  r.rotation.x=-Math.PI/2;r.visible=false;scene.add(r);
  const l=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:glowTex,color:0xff7a3c,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));
  l.rotation.x=-Math.PI/2;l.visible=false;scene.add(l);
  waves.push({r,l,age:0,life:0,size:1});
}
let waveHead=0;
function shock(x,z,size,col=0xffc26b,light=0xff7a3c){
  const w=waves[waveHead];waveHead=(waveHead+1)%waves.length;
  w.r.position.set(x,.06,z);w.l.position.set(x,.03,z);w.r.material.color.set(col);w.l.material.color.set(light);
  w.age=0;w.life=.5;w.size=size;w.r.visible=w.l.visible=true;
}
function updWaves(dt){
  for(const w of waves){if(w.life<=0)continue;w.age+=dt;const k=w.age/w.life;
    if(k>=1){w.life=0;w.r.visible=w.l.visible=false;continue;}
    const e=1-Math.pow(1-k,3);w.r.scale.setScalar(.3+w.size*e);w.r.material.opacity=1-k;
    w.l.scale.setScalar(w.size*2.2*(.6+.4*e));w.l.material.opacity=.9*(1-k)*(1-k);}
}
let flashV=0,timeScale=1,slowT=0,zoom=0;const zoomAt=new THREE.Vector3();
function hitStop(dur,x,z){slowT=dur;timeScale=.18;zoom=1;zoomAt.set(x,.5,z);}
function combo(txt,col){const c=$('#combo');c.textContent=txt;c.style.color=col||'';c.style.textShadow=`0 0 18px ${col||'#00e5ff'},0 0 2px #fff`;c.classList.remove('on');void c.offsetWidth;c.classList.add('on');}

/* powerups */
const PU={fire:{c:0xff9e2c,t:'F',w:.25},bomb:{c:0x00e5ff,t:'B',w:.25},speed:{c:0x9dff6a,t:'»',w:.2},mega:{c:0xff2e97,t:'M',w:.1},guard:{c:0xffe36e,t:'◆',w:.1},rush:{c:0xb98cff,t:'≫',w:.1}};
const beamGeo=new THREE.CylinderGeometry(.07,.16,2.6,8,1,true);
for(const k in PU){
  PU[k].mat=new THREE.MeshLambertMaterial({color:PU[k].c,emissive:PU[k].c,emissiveIntensity:.7});
  PU[k].lab=new THREE.SpriteMaterial({map:canvasTex(64,64,(g,w,h)=>{g.font='bold 44px "Chakra Petch",sans-serif';g.textAlign='center';g.textBaseline='middle';g.shadowColor='#'+PU[k].c.toString(16).padStart(6,'0');g.shadowBlur=10;g.fillStyle='#fff';g.fillText(PU[k].t,w/2,h/2+2);}),depthTest:false});
}
const puGeo=new THREE.OctahedronGeometry(.36);

/* bombs */
const bombGeo=new THREE.SphereGeometry(.34,16,12),bombMat=new THREE.MeshLambertMaterial({color:0x140a24,emissive:0x1a0633});
const ringGeo=new THREE.TorusGeometry(.36,.05,6,24);
const ringMats=COLORS.map(c=>new THREE.MeshBasicMaterial({color:c}));
const fuseMat=new THREE.SpriteMaterial({map:glowTex,color:0xffd27a,blending:THREE.AdditiveBlending,depthWrite:false});
