// Bomba Neon 84 — montagem da arena e spawn
/* ---------- arena ---------- */
function setWall(i,y=.5){dummy.position.set(i%W,y,Math.floor(i/W));dummy.scale.set(1,1,1);dummy.rotation.set(0,0,0);dummy.updateMatrix();wallMesh.setMatrixAt(wallCount,dummy.matrix);wallCount++;wallMesh.count=wallCount;wallMesh.instanceMatrix.needsUpdate=true;return wallCount-1;}
function hideBrick(i){const s=brickSlot[i];if(s<0)return;dummy.position.set(0,-9,0);dummy.scale.set(0,0,0);dummy.updateMatrix();brickMesh.setMatrixAt(s,dummy.matrix);brickMesh.instanceMatrix.needsUpdate=true;brickSlot[i]=-1;}

let introList=[];
function easeBounce(k){const n=7.5625,d=2.75;if(k<1/d)return n*k*k;if(k<2/d)return n*(k-=1.5/d)*k+.75;if(k<2.5/d)return n*(k-=2.25/d)*k+.9375;return n*(k-=2.625/d)*k+.984375;}
function buildArena(mod,intro){
  clearDynamic();
  grid.fill(0);brickSlot.fill(-1);fireT.fill(0);wallCount=0;brickCount=0;
  const safe=new Set();
  for(const [sx,sz] of SPAWNS){safe.add(idx(sx,sz));const ix=sx<CX?1:-1,iz=sz<CZ?1:-1;safe.add(idx(sx+ix,sz));safe.add(idx(sx,sz+iz));safe.add(idx(sx+2*ix,sz));safe.add(idx(sx,sz+2*iz));}
  const dens=(mod&&mod.density)||.72;
  for(let z=0;z<H;z++)for(let x=0;x<W;x++){
    const i=idx(x,z);
    if(x===0||z===0||x===W-1||z===H-1||(x%2===0&&z%2===0)){grid[i]=1;setWall(i);}
    else if(!safe.has(i)&&Math.random()<dens){grid[i]=2;dummy.position.set(x,.39,z);dummy.scale.set(1,1,1);dummy.updateMatrix();brickMesh.setMatrixAt(brickCount,dummy.matrix);brickSlot[i]=brickCount++;}
  }
  brickMesh.count=brickCount;brickMesh.instanceMatrix.needsUpdate=true;
  introList=[];
  if(intro){
    for(let i=0;i<N;i++){
      const x=i%W,z=Math.floor(i/W),d=Math.hypot(x-CX,z-CZ)/10*1.1+Math.random()*.25;
      if(grid[i]===2)introList.push({i,slot:brickSlot[i],mesh:brickMesh,y0:.39,d});
    }
    let s=0;for(let i=0;i<N;i++){if(grid[i]!==1)continue;const x=i%W,z=Math.floor(i/W);
      if(x>0&&z>0&&x<W-1&&z<H-1)introList.push({i,slot:s,mesh:wallMesh,y0:.5,d:Math.random()*.3});s++;}
    for(const it of introList){dummy.position.set(it.i%W,40,Math.floor(it.i/W));dummy.updateMatrix();it.mesh.setMatrixAt(it.slot,dummy.matrix);}
    G.intro=1;G.introT=0;
  }
  // spiral for sudden death
  G.spiral=[];let x0=1,z0=1,x1=W-2,z1=H-2;
  while(x0<=x1&&z0<=z1){
    for(let x=x0;x<=x1;x++)G.spiral.push(idx(x,z0));
    for(let z=z0+1;z<=z1;z++)G.spiral.push(idx(x1,z));
    if(z0<z1)for(let x=x1-1;x>=x0;x--)G.spiral.push(idx(x,z1));
    if(x0<x1)for(let z=z1-1;z>z0;z--)G.spiral.push(idx(x0,z));
    x0++;z0++;x1--;z1--;
  }
  const fogOn=mod&&mod.fog;
  scene.fog.near=fogOn?camDist-4:camDist+20;scene.fog.far=fogOn?camDist+9:camDist+70;
}
function clearDynamic(){
  hideWarn();
  for(const b of bombs)scene.remove(b.mesh);bombs=[];echoes=[];bombAt.clear();
  for(const p of powerups.values())scene.remove(p.mesh);powerups.clear();falls=[];
  for(const f of fires){f.o.visible=f.c.visible=false;f.life=0;}
}
function spawnEnts(){
  const mod=G.mod||{};
  ents.forEach((e,i)=>{
    const [sx,sz]=SPAWNS[i];const P=e.perm;
    Object.assign(e,{x:sx,z:sz,tx:sx,tz:sz,p:0,moving:false,alive:true,ghost:false,kickCD:0,beamed:false,guardT:0,rushT:0,trailT:0,mega:false,deadT:0,active:0,sq:0,inv:0,thinkCD:.3+Math.random()*.3,
      maxBombs:1+P.bomb,range:2+P.fire+(mod.rangeAdd||0),speed:(3.6+P.speed*.5)*(mod.speedMul||1),
      shield:P.shield,pierce:!!P.pierce,eco:!!P.eco,xb:!!P.xb,
      react:Math.max(.05,.26-.06*G.arena),aggr:.55+.12*G.arena,mistake:.25-.06*G.arena});
    e.dz=sx<CX?-1:1;e.dx=0;e.dz=sz<CZ?1:-1;
    setGhostLook(e,false);e.m.g.visible=true;e.m.g.position.set(sx,0,sz);e.m.g.scale.setScalar(1);e.m.inner.rotation.set(0,0,0);e.m.inner.position.y=0;
  });
}
