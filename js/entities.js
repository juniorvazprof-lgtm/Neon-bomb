// Bomba Neon 84 — movimento e animação dos personagens
/* ---------- entity update ---------- */
function updEnt(e,dt){
  const m=e.m;
  if(!e.alive){
    if(e.ghost){updGhost(e,dt);return;}
    e.deadT+=dt;const k=Math.min(e.deadT/.9,1);
    m.inner.position.y=k*1.6;m.inner.rotation.y+=dt*14;m.g.scale.setScalar(Math.max(.001,1-k));m.glow.material.opacity=.75*(1-k);
    if(k>=1){if(G.endT<0)becomeGhost(e);else m.g.visible=false;}
    return;
  }
  e.inv=Math.max(0,e.inv-dt);e.kickCD=Math.max(0,(e.kickCD||0)-dt);
  e.guardT=Math.max(0,(e.guardT||0)-dt);e.rushT=Math.max(0,(e.rushT||0)-dt);e.trailT=Math.max(0,(e.trailT||0)-dt);
  m.bubble.visible=e.guardT>0&&(e.guardT>1.5||Math.floor(G.time*10)%2===0);if(m.bubble.visible)m.bubble.rotation.y+=dt*2;
  if(e.human&&input.bomb){placeBomb(e);input.bomb=false;}
  let over=0;
  if(e.moving){
    e.p+=e.speed*(e.rushT>0?1.5:1)*dt;
    if(e.human&&input.dir&&input.dir[0]===-e.dx&&input.dir[1]===-e.dz&&!bombAt.has(idx(e.x,e.z))){
      [e.x,e.tx]=[e.tx,e.x];[e.z,e.tz]=[e.tz,e.z];e.p=1-e.p;e.dx=-e.dx;e.dz=-e.dz;
    }
    if(e.p>=1){over=e.p-1;e.x=e.tx;e.z=e.tz;e.p=0;e.moving=false;arrive(e);if(!e.human)e.thinkCD=Math.random()<e.mistake?e.react:0;}
  }
  if(!e.moving){
    let d=null;
    if(e.human)d=input.dir;
    else{e.thinkCD-=dt;if(e.thinkCD<=0){d=botThink(e);e.thinkCD=d?0:e.react;}}
    if(d&&tryMove(e,d))e.p=Math.min(over,.5);
    else if(d){e.dx=d[0];e.dz=d[1];}
  }
  const fx=e.x+(e.tx-e.x)*(e.moving?e.p:0),fz=e.z+(e.tz-e.z)*(e.moving?e.p:0);
  m.g.position.set(fx,0,fz);
  const ang=Math.atan2(e.dx,e.dz);let da=ang-m.g.rotation.y;da=Math.atan2(Math.sin(da),Math.cos(da));m.g.rotation.y+=da*Math.min(1,dt*16);
  {const hot=e.trailT>0||e.rushT>0;if(e.moving&&Math.random()<dt*(hot?70:22))emit(fx+(Math.random()-.5)*.25,.08+(hot?Math.random()*.5:0),fz+(Math.random()-.5)*.25,(Math.random()-.5)*.4,.5+Math.random()*.5,(Math.random()-.5)*.4,hot?.6:.45,hot?.3:.2,e.rushT>0?PU.rush.c:(e.trailT>0?e.trailC:e.color),0,1);}
  if(e.moving){e.walk+=dt*e.speed*Math.PI;m.inner.position.y=Math.abs(Math.sin(e.walk))*.1;m.inner.rotation.x=.14;m.armL.position.z=Math.sin(e.walk)*.12;m.armR.position.z=-Math.sin(e.walk)*.12;}
  else{m.inner.position.y=Math.sin(G.time*3+e.id)*.025;m.inner.rotation.x*=.8;m.armL.position.z*=.8;m.armR.position.z*=.8;}
  e.sq=Math.max(0,e.sq-dt*4);const s=Math.sin(e.sq*Math.PI)*.18;m.inner.scale.set(1+s,1-s,1+s);
  m.g.visible=e.inv>0?(Math.floor(G.time*18)%2===0):true;
  m.glow.material.opacity=.55+.35*pulse+(e.shield>0?.2:0);
}
