// Bomba Neon 84 — bombas, compasso, chute, arremesso, itens, mortes e fantasmas
/* ---------- mechanics ---------- */
function rays(x,z,range,pierce,xb,fn){
  fn(idx(x,z));
  const dirs=xb?DIRS.concat([[1,1],[1,-1],[-1,1],[-1,-1]]):DIRS;
  for(let d=0;d<dirs.length;d++){
    const [ax,az]=dirs[d],r=d<4?range:Math.max(1,Math.ceil(range/2));
    for(let s=1;s<=r;s++){
      const nx=x+ax*s,nz=z+az*s;if(nx<0||nz<0||nx>=W||nz>=H)break;
      const i=idx(nx,nz);if(grid[i]===1)break;
      const wasBrick=grid[i]===2;fn(i);if(wasBrick&&!pierce)break;
    }
  }
}
function cellOf(e){const f=e.moving&&e.p>=.5;return idx(f?e.tx:e.x,f?e.tz:e.z);}
/* rhythm: every bomb goes off on beat 1 of a bar (every 2 beats with Pavio Curto) */
function barBeats(){return G.mod&&G.mod.fuse?2:4;}
function nextBoom(){const L=barBeats()*BEAT,rel=clock()-t0,minA=G.mod&&G.mod.fuse?1.0:1.6;return t0+Math.ceil((rel+minA)/L)*L;}
function nextBeat(after){const rel=clock()-t0;return t0+Math.ceil((rel+after)/BEAT)*BEAT;}
function makeBomb(e,i,range,explodeAt){
  const mesh=new THREE.Group();
  const s=new THREE.Mesh(bombGeo,bombMat);s.position.y=.36;
  const ring=new THREE.Mesh(ringGeo,ringMats[e.id]);ring.rotation.x=Math.PI/2;ring.position.y=.36;
  const spark=new THREE.Sprite(fuseMat);spark.position.y=.8;spark.scale.setScalar(.45);
  const glow=new THREE.Mesh(glowGeo,new THREE.MeshBasicMaterial({map:glowTex,color:e.color,transparent:true,opacity:.5,blending:THREE.AdditiveBlending,depthWrite:false}));
  glow.rotation.x=-Math.PI/2;glow.position.y=.03;glow.scale.setScalar(1.6);
  mesh.add(s,ring,spark,glow);mesh.position.set(i%W,0,Math.floor(i/W));scene.add(mesh);
  const b={i,x:i%W,z:Math.floor(i/W),px:i%W,pz:Math.floor(i/W),owner:e,explodeAt,born:clock(),t:explodeAt-clock(),range,pierce:e.pierce,xb:e.xb,eco:e.eco,mesh,s,ring,glow,spark,fly:null,slide:null};
  b.fuse=Math.max(.3,b.t);bombs.push(b);e.active++;
  return b;
}
function placeBomb(e){
  if(!e.alive)return false;
  const i=cellOf(e);
  // tap again on top of a bomb = throw it
  const under=bombAt.get(i);
  if(under&&!under.fly&&!under.slide){throwBomb(under,e.dx,e.dz,3);return true;}
  if(e.active>=e.maxBombs||grid[i]!==0||bombAt.has(i))return false;
  let range=e.range,onBeat=false;
  if(e.human){const ph=beatPhase();if(ph<.17||ph>.85){onBeat=true;range+=e.perm.beat?2:1;}}
  const isMega=e.mega;if(isMega){range+=4;e.mega=false;}
  const b=makeBomb(e,i,range,nextBoom());bombAt.set(i,b);e.sq=1;if(isMega){b.mesh.scale.setScalar(1.4);b.mega=true;}
  burst(i%W,.2,Math.floor(i/W),10,2.2,[e.color,0xffffff],.35,.18,2);
  if(e.human){sfxBlip(onBeat?880:440);if(onBeat)flashBeat(T('onbeat',e.perm.beat?2:1));}
  return true;
}
function landingCell(x,z,dx,dz,minD,maxD){
  for(let s=minD;s<=maxD;s++){const nx=x+dx*s,nz=z+dz*s;if(nx<1||nz<1||nx>W-2||nz>H-2)break;const n=idx(nx,nz);if(grid[n]===0&&!bombAt.has(n))return n;}
  for(let s=minD-1;s>=1;s--){const nx=x+dx*s,nz=z+dz*s;if(nx<1||nz<1||nx>W-2||nz>H-2)continue;const n=idx(nx,nz);if(grid[n]===0&&!bombAt.has(n))return n;}
  return -1;
}
function throwBomb(b,dx,dz,dist,fromX,fromZ,fromY){
  if(!dx&&!dz)dz=-1;
  const sx=fromX??b.x,sz=fromZ??b.z;
  const n=landingCell(sx,sz,dx,dz,dist,dist+4);if(n<0)return false;
  bombAt.delete(b.i);
  b.fly={fx:b.px,fz:b.pz,fy:fromY||.2,tx:n%W,tz:Math.floor(n/W),t:0,dur:.42};
  b.i=n;b.x=n%W;b.z=Math.floor(n/W);
  sfxBlip(300,.18,'triangle');
  if(b.owner.human)combo(T('c_throw'),'#00e5ff');
  return true;
}
function kickBomb(b,dx,dz){
  const n=idx(b.x+dx,b.z+dz);if(grid[n]!==0||bombAt.has(n)||entAt(n))return false;
  b.slide={dx,dz,p:0};sfxBlip(180,.12,'square');
  burst(b.x,.2,b.z,12,3,[0x00e5ff,0xffffff],.35,.16,2);
  if(b.owner.human||true)shake=Math.max(shake,.12);
  return true;
}
function entAt(n){return ents.some(o=>o.alive&&cellOf(o)===n);}
function updBombMotion(b,dt){
  if(b.fly){
    const f=b.fly;f.t+=dt;const k=Math.min(1,f.t/f.dur);
    b.px=f.fx+(f.tx-f.fx)*k;b.pz=f.fz+(f.tz-f.fz)*k;
    b.mesh.position.set(b.px,f.fy*(1-k)+Math.sin(k*Math.PI)*2.4,b.pz);b.mesh.rotation.x+=dt*12;
    if(k>=1){b.fly=null;b.mesh.rotation.x=0;b.mesh.position.y=0;
      if(bombAt.has(b.i)||grid[b.i]!==0){const n=landingCell(b.x,b.z,Math.sign(f.tx-f.fx)||0,Math.sign(f.tz-f.fz)||1,1,4);if(n>=0){b.i=n;b.x=n%W;b.z=Math.floor(n/W);}}
      bombAt.set(b.i,b);b.px=b.x;b.pz=b.z;b.mesh.position.set(b.x,0,b.z);
      shock(b.x,b.z,1.2,b.owner.color,b.owner.color);burst(b.x,.2,b.z,14,3,[b.owner.color,0xffffff],.4,.18,3);sfxBlip(120,.1,'sine');}
  } else if(b.slide){
    const s=b.slide;s.p+=dt*9;
    while(s.p>=1){
      s.p-=1;const n=idx(b.x+s.dx,b.z+s.dz);
      bombAt.delete(b.i);b.i=n;b.x+=s.dx;b.z+=s.dz;bombAt.set(n,b);
      const nn=idx(b.x+s.dx,b.z+s.dz);
      if(grid[nn]!==0||bombAt.has(nn)||entAt(nn)){b.slide=null;s.p=0;break;}
    }
    b.px=b.x+(b.slide?s.dx*s.p:0);b.pz=b.z+(b.slide?s.dz*s.p:0);b.mesh.position.set(b.px,0,b.pz);
    if(b.slide&&Math.random()<dt*40)emit(b.px,.1,b.pz,-s.dx,.4,-s.dz,.3,.2,0x00e5ff,0,2);
  }
}
function spawnFire(i,life,delay=0){
  const f=fires[fireHead];fireHead=(fireHead+1)%FP;
  const x=i%W,z=Math.floor(i/W);f.o.position.set(x,.36,z);f.c.position.set(x,.46,z);
  f.o.rotation.y=f.c.rotation.y=Math.random()*.4-.2;f.age=-delay;f.life=life;f.o.visible=f.c.visible=false;
}
function spawnShards(i){
  const x=i%W,z=Math.floor(i/W);
  burst(x,.4,z,14,4,[0x27e9ff,0x8ff6ff,0xb98cff],.7,.16,9);
  for(let k=0;k<9;k++){const s=shards[shardHead];shardHead=(shardHead+1)%SP;s.m.position.set(x+(Math.random()-.5)*.5,.4+Math.random()*.3,z+(Math.random()-.5)*.5);s.v.set((Math.random()-.5)*5,3+Math.random()*3,(Math.random()-.5)*5);s.life=.8;s.m.visible=true;s.m.scale.setScalar(1);}
}
function dropPU(i){
  const drop=(G.mod&&G.mod.drop)||.45;if(Math.random()>drop)return;
  let r=Math.random(),t='fire';for(const k in PU){r-=PU[k].w;if(r<=0){t=k;break;}}
  const mesh=new THREE.Group(),gem=new THREE.Mesh(puGeo,PU[t].mat),lab=new THREE.Sprite(PU[t].lab);
  gem.position.y=.5;lab.position.y=1.15;lab.scale.setScalar(.62);
  const beam=new THREE.Mesh(beamGeo,new THREE.MeshBasicMaterial({color:PU[t].c,transparent:true,opacity:.35,blending:THREE.AdditiveBlending,depthWrite:false}));beam.position.y=1.3;
  const pg=new THREE.Mesh(glowGeo,new THREE.MeshBasicMaterial({map:glowTex,color:PU[t].c,transparent:true,opacity:.8,blending:THREE.AdditiveBlending,depthWrite:false}));pg.rotation.x=-Math.PI/2;pg.position.y=.03;pg.scale.setScalar(1.6);
  mesh.add(gem,lab,beam,pg);
  mesh.position.set(i%W,0,Math.floor(i/W));scene.add(mesh);
  powerups.set(i,{t,mesh,gem,born:G.time});
}
function removePU(i){const p=powerups.get(i);if(p){scene.remove(p.mesh);powerups.delete(i);}}
function explode(b){
  if(!b.echo){
    if(bombAt.get(b.i)===b)bombAt.delete(b.i);
    if(b.fly){b.px=b.x;b.pz=b.z;}
    const k=bombs.indexOf(b);if(k>=0)bombs.splice(k,1);b.owner.active--;scene.remove(b.mesh);
    if(b.eco)echoes.push({x:b.x,z:b.z,i:b.i,explodeAt:nextBeat(.5),t:1,range:b.range,pierce:b.pierce,xb:b.xb,owner:b.owner,echo:true});}
  sfxBoom();
  const hp=ents[0].m.g.position,dd=Math.abs(hp.x-b.x)+Math.abs(hp.z-b.z);
  shake=Math.max(shake,dd<4?.42:.22);flashV=Math.max(flashV,dd<5?.75:.4);
  if(b.chained){G.chain++;if(G.chain>=2)combo(T('c_chain')+G.chain,'#ff9e2c');}else G.chain=1;
  if(b.mega){flashV=Math.max(flashV,1);shake=Math.max(shake,.6);}
  shock(b.x,b.z,b.range+.6,b.echo?0x9dffff:0xffc26b,b.echo?0x2fd8ff:0xff7a3c);
  burst(b.x,.5,b.z,32,8,[0xffc15e,0xff9e2c,0xff2e97,0xff5a3c],.8,.3,7,2);
  burst(b.x,.6,b.z,10,1.5,[0xb98cff,0xff2e97],1.6,.9,-1.2);
  for(let j=0;j<6;j++)emit(b.x,.3,b.z,(Math.random()-.5)*.8,5+Math.random()*4,(Math.random()-.5)*.8,.9,.4,0xfff1c2,3,1);
  if(dd<4){try{navigator.vibrate&&navigator.vibrate(35);}catch(e){}}
  rays(b.x,b.z,b.range,b.pierce,b.xb,i=>{
    if(grid[i]===2){grid[i]=0;hideBrick(i);spawnShards(i);dropPU(i);if(b.owner.human)G.stats.b++;}
    fireT[i]=.42;fireOwner[i]=b.owner.id;spawnFire(i,.45,Math.max(Math.abs(i%W-b.x),Math.abs(Math.floor(i/W)-b.z))*.025);
    {const fx=i%W,fz=Math.floor(i/W),ddx=fx-b.x,ddz=fz-b.z,l=Math.hypot(ddx,ddz)||1;
     for(let j=0;j<5;j++)emit(fx+(Math.random()-.5)*.7,.3+Math.random()*.4,fz+(Math.random()-.5)*.7,ddx/l*3+(Math.random()-.5)*2,1.5+Math.random()*3.5,ddz/l*3+(Math.random()-.5)*2,.6+Math.random()*.4,.28,[0xff9e2c,0xff2e97,0xffe28a][j%3],5,1.2);}
    const ob=bombAt.get(i);if(ob&&ob!==b){ob.explodeAt=Math.min(ob.explodeAt,clock()+.08);ob.chained=true;}
    const pu=powerups.get(i);if(pu&&G.time-pu.born>.6)removePU(i);
  });
}
function tryMove(e,d){
  e.dx=d[0];e.dz=d[1];
  const nx=e.x+d[0],nz=e.z+d[1],n=idx(nx,nz);
  if(grid[n]===0&&!bombAt.has(n)){e.tx=nx;e.tz=nz;e.moving=true;return true;}
  // walking into a bomb kicks it
  const b=bombAt.get(n);
  if(b&&!b.slide&&!b.fly&&e.kickCD<=0){e.kickCD=.25;if(kickBomb(b,d[0],d[1])){e.sq=1;if(e.human)combo(T('c_kick'),'#00e5ff');}}
  return false;
}
function arrive(e){
  const i=idx(e.x,e.z),p=powerups.get(i);
  if(p){
    if(p.t==='fire')e.range=Math.min(e.range+1,9);
    if(p.t==='bomb')e.maxBombs=Math.min(e.maxBombs+1,8);
    if(p.t==='speed')e.speed=Math.min(e.speed+.4,7.5);
    if(p.t==='mega')e.mega=true;
    if(p.t==='guard')e.guardT=8;
    if(p.t==='rush')e.rushT=6;
    e.trailT=1.4;e.trailC=PU[p.t].c;
    burst(e.x,.5,e.z,28,4,[PU[p.t].c,0xffffff],.6,.22,1,1.5);shock(e.x,e.z,1.6,PU[p.t].c,PU[p.t].c);
    removePU(i);if(e.human){sfxUp();combo(T('pu_'+p.t),'#'+PU[p.t].c.toString(16).padStart(6,'0'));}
  }
}
function kill(e,by){
  if(!e.alive)return;
  if(e.inv>0)return;
  if(e.guardT>0&&by!=='wall')return;
  if(e.shield>0&&by!=='wall'){e.shield--;e.inv=1.5;if(e.human)toast(T('t_shield'));sfxBlip(300,.2,'triangle');return;}
  const vc=cellOf(e);
  e.alive=false;e.deadT=0;e.ghost=false;sfxDown();
  const p=e.m.g.position;
  burst(p.x,.6,p.z,50,7,[e.color,e.color,0xffffff],1.2,.28,4,2);
  for(let j=0;j<24;j++)emit(p.x,.2+j*.12,p.z,(Math.random()-.5)*.6,1+Math.random(),(Math.random()-.5)*.6,1.1,.35,e.color,-1,.5);
  shock(p.x,p.z,3.2,e.color,e.color);flashV=1;shake=Math.max(shake,.5);
  hitStop(.45,p.x,p.z);
  const killer=typeof by==='number'?ents[by]:null;
  if(by===0&&!e.human){G.stats.k++;}
  // a ghost that scores a K.O. takes the victim's place
  if(killer&&killer.ghost&&killer!==e){revive(killer,vc);combo(killer.human?T('c_back_me'):T('c_back',pname(killer)),'#b98cff');}
  else if(by===0&&!e.human)combo('K.O.','#ff2e97');
  else if(e.human)combo(T('c_ghost'),'#b98cff');
  renderChips();
}

/* ---------- ghosts on the border ---------- */
const RING=[];
for(let x=0;x<W;x++)RING.push(idx(x,0));
for(let z=1;z<H;z++)RING.push(idx(W-1,z));
for(let x=W-2;x>=0;x--)RING.push(idx(x,H-1));
for(let z=H-2;z>=1;z--)RING.push(idx(0,z));
const RL=RING.length;
function inward(c){const x=c%W,z=Math.floor(c/W);
  if(z===0&&x>0&&x<W-1)return[0,1];if(z===H-1&&x>0&&x<W-1)return[0,-1];
  if(x===0&&z>0&&z<H-1)return[1,0];if(x===W-1&&z>0&&z<H-1)return[-1,0];return null;}
function setGhostLook(e,on){
  e.m.g.traverse(o=>{if(o.material&&!o.userData.keep&&o!==e.halo){o.material.transparent=on;o.material.opacity=on?.8:1;o.material.needsUpdate=true;}});
  if(on&&!e.halo){e.halo=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:e.color,blending:THREE.AdditiveBlending,depthWrite:false,depthTest:false,transparent:true,opacity:.9}));e.halo.position.y=.6;e.halo.scale.setScalar(3);e.m.g.add(e.halo);}
  if(e.halo)e.halo.visible=on;
}
function becomeGhost(e){
  const p=e.m.g.position;let best=0,bd=1e9;
  RING.forEach((c,k)=>{const d=Math.abs(c%W-p.x)+Math.abs(Math.floor(c/W)-p.z);if(d<bd){bd=d;best=k;}});
  e.ghost=true;if(e.human)$('#ghostBar').hidden=false;e.ring=best;setTimeout(renderChips,0);e.ghostCD=1.5;e.gthink=0;
  e.m.g.visible=true;e.m.g.scale.setScalar(1.15);e.m.inner.rotation.set(0,0,0);e.m.inner.position.y=0;setGhostLook(e,true);
  burst(RING[best]%W,1.3,Math.floor(RING[best]/W),30,3,[e.color,0xffffff],.8,.22,-1);
  if(e.human)toast(T('t_ghost'));
}
function revive(e,c){
  e.ghost=false;e.alive=true;$('#ghostBar').hidden=true;e.x=e.tx=c%W;e.z=e.tz=Math.floor(c/W);e.p=0;e.moving=false;e.inv=2.2;e.deadT=0;
  e.m.g.scale.setScalar(1);setGhostLook(e,false);
  for(let j=0;j<40;j++)emit(e.x+(Math.random()-.5)*.6,Math.random()*.4,e.z+(Math.random()-.5)*.6,0,5+Math.random()*5,0,.6,.28,e.color,0,0);
  shock(e.x,e.z,2.4,e.color,e.color);sfxUp();
}
function ghostThrow(e){
  if(e.ghostCD>0)return;const c=RING[Math.round(e.ring)%RL],dir=inward(c);if(!dir)return;
  const n=landingCell(c%W,Math.floor(c/W),dir[0],dir[1],2,6);if(n<0)return;
  const b=makeBomb(e,c,2,nextBoom());b.px=c%W;b.pz=Math.floor(c/W);
  b.fly={fx:b.px,fz:b.pz,fy:1.3,tx:n%W,tz:Math.floor(n/W),t:0,dur:.5};b.i=n;b.x=n%W;b.z=Math.floor(n/W);
  e.ghostCD=3.2;e.sq=1;sfxBlip(260,.2,'triangle');
}
function updGhost(e,dt){
  const m=e.m;e.ghostCD=Math.max(0,e.ghostCD-dt);
  let dirSign=0;
  const k=Math.round(e.ring)%RL,c=RING[(k+RL)%RL],cx=c%W,cz=Math.floor(c/W);
  const nx=RING[(k+1)%RL],pv=RING[(k-1+RL)%RL];
  if(e.human){
    const d=input.dir;
    if(d){if(nx%W-cx===d[0]&&Math.floor(nx/W)-cz===d[1])dirSign=1;else if(pv%W-cx===d[0]&&Math.floor(pv/W)-cz===d[1])dirSign=-1;
      else{// pressing inward/outward on an edge: keep going along the edge toward that side
        const dx=d[0],dz=d[1];const tgt=idx(Math.min(W-1,Math.max(0,cx+dx*3)),Math.min(H-1,Math.max(0,cz+dz*3)));
        let bi=k,bd=1e9;RING.forEach((rc,ri)=>{const dd=Math.abs(rc%W-tgt%W)+Math.abs(Math.floor(rc/W)-Math.floor(tgt/W));if(dd<bd){bd=dd;bi=ri;}});
        const fw=(bi-k+RL)%RL;if(bi!==k)dirSign=fw<=RL/2?1:-1;}}
    if(input.bomb){input.bomb=false;ghostThrow(e);}
  } else {
    e.gthink-=dt;
    if(e.gthink<=0){e.gthink=.35;
      const foes=ents.filter(o=>o.alive&&o!==e);let bi=-1,bd=1e9;
      for(const o of foes)RING.forEach((rc,ri)=>{const dir=inward(rc);if(!dir)return;const al=dir[0]?rc%W===0||rc%W===W-1?Math.floor(rc/W)===o.z:false:rc%W===o.x;if(!al)return;const dd=Math.min((ri-k+RL)%RL,(k-ri+RL)%RL);if(dd<bd){bd=dd;bi=ri;}});
      e.gTarget=bi;
      if(bi===k&&Math.random()<.6)ghostThrow(e);
    }
    if(e.gTarget>=0&&e.gTarget!==k){const fw=(e.gTarget-k+RL)%RL;dirSign=fw<=RL/2?1:-1;}
  }
  e.ring=(e.ring+dirSign*dt*4.2+RL)%RL;
  const f=e.ring,i0=Math.floor(f)%RL,i1=(i0+1)%RL,t=f-Math.floor(f);
  const x=(RING[i0]%W)*(1-t)+(RING[i1]%W)*t,z=Math.floor(RING[i0]/W)*(1-t)+Math.floor(RING[i1]/W)*t;
  m.g.position.set(x,1.7+Math.sin(G.time*3+e.id)*.15,z);if(e.halo)e.halo.material.opacity=.55+.35*pulse;
  const dir=inward(RING[Math.round(f)%RL]);if(dir)m.g.rotation.y=Math.atan2(dir[0],dir[1]);
  m.glow.material.opacity=.3+(e.ghostCD<=0?.4*pulse+.2:0);
  e.sq=Math.max(0,e.sq-dt*4);const s=Math.sin(e.sq*Math.PI)*.18;m.inner.scale.set(1+s,1-s,1+s);
  if(Math.random()<dt*10)emit(x+(Math.random()-.5)*.4,1.1,z+(Math.random()-.5)*.4,0,-.3,0,.6,.18,e.color,0,0);
}
