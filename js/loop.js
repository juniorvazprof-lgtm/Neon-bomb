// Bomba Neon 84 — loop principal, câmera e qualidade adaptativa
/* ---------- main loop ---------- */
let pulse=0,last=performance.now(),timerAcc=0;
function update(dt){
  G.time+=dt;
  const ph=beatPhase();pulse=Math.exp(-ph*5);
  floorMat.color.setScalar(.62+.45*pulse);wallMat.emissiveIntensity=.65+.5*pulse;outerGrid.material.opacity=.35+.35*pulse;
  $('#bombBtn').classList.toggle('beat',ph<.17||ph>.85);

  if(G.phase==='count'){
    G.count-=dt;const c=$('#count');
    const beamK=Math.min(1,Math.max(0,(3.6-G.count-1.2)/.8));
    for(const e of ents){e.m.g.scale.setScalar(Math.max(.001,beamK));
      if(beamK>0&&beamK<1)for(let j=0;j<3;j++)emit(e.x+(Math.random()-.5)*.5,Math.random()*.3,e.z+(Math.random()-.5)*.5,0,4+Math.random()*4,0,.5,.22,e.color,0,0);
      if(beamK>=1&&!e.beamed){e.beamed=true;shock(e.x,e.z,1.5,e.color,e.color);}}
    if(G.count>0){c.hidden=false;c.textContent=G.count>.6?Math.ceil(G.count-.6):T('go');}
    else{c.hidden=true;G.phase='play';G.time=0;G.sdT=0;G.sdI=0;}
  }
  const playing=G.phase==='play';
  if(playing){
    const nowC=clock();
    for(const b of bombs.slice()){updBombMotion(b,dt);b.t=b.explodeAt-nowC;if(b.t<=0)explode(b);}
    for(const b of echoes.slice()){b.t=b.explodeAt-nowC;if(b.t<=0){echoes.splice(echoes.indexOf(b),1);explode(b);}}
    updBeatBar();updWarn();
    for(let i=0;i<N;i++)if(fireT[i]>0)fireT[i]=Math.max(0,fireT[i]-dt);
    for(const e of ents)updEnt(e,dt);
    for(const e of ents){if(!e.alive)continue;const c=cellOf(e);if(fireT[c]>0)kill(e,fireOwner[c]);}
    if(G.time>60){
      if(G.sdI===0&&G.sdT===0)toast(T('t_sd'));
      G.sdT-=dt;
      while(G.sdT<=0&&G.sdI<G.spiral.length){
        G.sdT+=.28;const i=G.spiral[G.sdI++];if(grid[i]===1)continue;
        if(grid[i]===2)hideBrick(i);grid[i]=1;const b=bombAt.get(i);if(b){bombAt.delete(i);bombs.splice(bombs.indexOf(b),1);b.owner.active--;scene.remove(b.mesh);}
        removePU(i);falls.push({slot:setWall(i,6),i,t:0});
        for(const e of ents)if(e.alive&&cellOf(e)===i)kill(e,'wall');
      }
    }
    timerAcc+=dt;if(timerAcc>.2){timerAcc=0;const r=Math.max(0,60-G.time);$('#timer').textContent=r>0?`${T('walls')}${Math.floor(r/60)}:${String(Math.floor(r%60)).padStart(2,'0')}`:T('sd');}
    const human=ents[0],alive=ents.filter(e=>e.alive).length;
    if(G.endT<0&&alive<=1){G.endT=human.alive?1.1:1.6;}
    if(G.endT>=0){G.endT-=dt;if(G.endT<0){G.endT=-1;finishArena(human.alive);}}
  } else if(G.phase==='menu'||G.phase==='roulette'){
    for(const e of ents){e.m.inner.position.y=Math.sin(G.time*3+e.id)*.03;e.m.g.rotation.y+=dt*.6;}
  }
  // visuals
  for(const b of bombs){const k=1-b.t/b.fuse,f=6+k*18,s=1+Math.sin(G.time*f)*(.06+k*.1);b.s.scale.setScalar(s);b.ring.rotation.z+=dt*(2+k*8);
    b.glow.material.opacity=.35+.4*k+.25*Math.sin(G.time*f);b.glow.scale.setScalar(1.4+k*1.2);b.spark.scale.setScalar(.35+Math.random()*.25);
    if(Math.random()<dt*(18+k*40))emit(b.x+(Math.random()-.5)*.1,.82,b.z+(Math.random()-.5)*.1,(Math.random()-.5)*1.6,1+Math.random()*1.5,(Math.random()-.5)*1.6,.4,.14,Math.random()<.5?0xffd27a:0xffffff,6,1);}
  updParticles(dt);updWaves(dt);
  // ambient neon dust
  if(Math.random()<dt*14)emit(Math.random()*W,.05,Math.random()*H,(Math.random()-.5)*.2,.35+Math.random()*.4,(Math.random()-.5)*.2,3.5,.12+Math.random()*.1,Math.random()<.5?0xff2e97:0x00e5ff,-.02,0);
  // victory fireworks
  if(G.phase==='play'&&G.endT>=0&&ents[0].alive&&Math.random()<dt*7){const x=1+Math.random()*(W-2),z=1+Math.random()*(H-2);burst(x,2.5+Math.random()*2,z,40,5,[COLORS[Math.floor(Math.random()*4)],0xffffff],1.1,.26,3);sfxBlip(200+Math.random()*300,.15,'triangle');}
  // arena intro: blocks fall from the sky
  if(G.intro>0){
    G.introT+=dt;let done=true;
    for(const it of introList){
      const k=Math.min(1,Math.max(0,(G.introT-it.d)/.38));if(k<1)done=false;
      const y=it.y0+(1-easeBounce(k))*9;
      dummy.position.set(it.i%W,y,Math.floor(it.i/W));dummy.scale.set(1,1,1);dummy.updateMatrix();it.mesh.setMatrixAt(it.slot,dummy.matrix);
      if(k>=1&&!it.landed){it.landed=true;if(Math.random()<.35)burst(it.i%W,.1,Math.floor(it.i/W),5,1.6,[it.mesh===brickMesh?0x27e9ff:0xff2e97],.4,.16,2);}
    }
    wallMesh.instanceMatrix.needsUpdate=brickMesh.instanceMatrix.needsUpdate=true;
    if(done)G.intro=0;
  }
  for(const f of fires){if(f.life<=0)continue;f.age+=dt;if(f.age<0)continue;f.o.visible=f.c.visible=true;const k=f.age/f.life;if(k>=1){f.life=0;f.o.visible=f.c.visible=false;continue;}
    const s=k<.15?k/.15:1-Math.pow((k-.15)/.85,2);f.o.scale.set(.7+.3*s,Math.max(.01,s*1.1),.7+.3*s);f.c.scale.set(s,Math.max(.01,s),s);}
  for(const s of shards){if(s.life<=0)continue;s.life-=dt;s.v.y-=14*dt;s.m.position.addScaledVector(s.v,dt);if(s.m.position.y<.09){s.m.position.y=.09;s.v.multiplyScalar(.5);s.v.y*=-.4;}s.m.rotation.x+=dt*8;s.m.scale.setScalar(Math.max(.01,s.life/.8));if(s.life<=0)s.m.visible=false;}
  for(const p of powerups.values()){p.gem.rotation.y+=dt*2;p.gem.position.y=.5+Math.sin(G.time*4)*.08;if(Math.random()<dt*4)emit(p.mesh.position.x,.3,p.mesh.position.z,(Math.random()-.5)*.3,1.5,(Math.random()-.5)*.3,.8,.15,PU[p.t].c,0,.5);}
  for(const f of falls.slice()){f.t+=dt;const k=Math.min(1,f.t/.25);dummy.position.set(f.i%W,6-5.5*k,Math.floor(f.i/W));dummy.scale.set(1,1,1);dummy.updateMatrix();wallMesh.setMatrixAt(f.slot,dummy.matrix);wallMesh.instanceMatrix.needsUpdate=true;if(k>=1){falls.splice(falls.indexOf(f),1);shake=Math.max(shake,.12);}}
}
function updMarker(dt){
  const m=ents[0].m;if(!m.mk)return;
  m.mk.rotation.set(Math.PI,G.time*2.5,0);m.mk.position.y=(ents[0].ghost?1.3:1.8)+Math.sin(G.time*5)*.08;
  m.ring.visible=!ents[0].ghost;m.ring.scale.setScalar(1+.15*pulse);m.ring.material.opacity=.45+.4*pulse;
}
function frame(now){
  const dt=Math.min(.05,(now-last)/1000);last=now;
  if(slowT>0){slowT-=dt;if(slowT<=0)timeScale=1;}
  update(dt*timeScale);updMarker(dt);
  shake=Math.max(0,shake-dt*1.4);zoom=Math.max(0,zoom-dt*(slowT>0?.4:2.2));
  camera.position.lerpVectors(camBase,zoomAt,zoom*.22);
  if(shake>0){camera.position.x+=(Math.random()-.5)*shake;camera.position.z+=(Math.random()-.5)*shake;camera.position.y+=(Math.random()-.5)*shake*.5;}
  flashV=Math.max(0,flashV-dt*3.2);flashEl.style.opacity=(Math.min(1,flashV)*FXF[FX]).toFixed(3);
  if(bloom)bloom.strength=FXB[FX]+flashV*.25*FXB[FX]+pulse*.12;
  if(composer&&quality>0&&FX>0)composer.render();else renderer.render(scene,camera);
  // adaptive quality: step down if the phone can't hold ~45 fps
  fpsAcc+=dt;fpsN++;
  if(fpsAcc>2){const fps=fpsN/fpsAcc;fpsAcc=0;fpsN=0;
    if(fps<42&&quality>0){quality--;applyQuality();}}
  requestAnimationFrame(frame);
}
const camBase=new THREE.Vector3();
const flashEl=$('#flash');let lastBeatIdx=-1;
function updBeatBar(){
  const n=barBeats(),bi=Math.floor((clock()-t0)/BEAT)%n,el=$('#beatBar');
  if(el.dataset.n!=String(n))el.dataset.n=n;
  if(bi===lastBeatIdx)return;lastBeatIdx=bi;
  el.querySelectorAll('i').forEach((c,k)=>c.classList.toggle('on',k===bi));
}let fpsAcc=0,fpsN=0;
function applyQuality(){
  const pr=quality>=2?Math.min(devicePixelRatio||1,1.75):1;
  renderer.setPixelRatio(pr);if(composer){composer.setPixelRatio(pr);composer.setSize(innerWidth,innerHeight);}
  pMat.uniforms.uScale.value=innerHeight*pr*.9;
}
function fit(){
  const w=innerWidth,h=innerHeight;renderer.setSize(w,h);camera.aspect=w/h;
  const vf=THREE.MathUtils.degToRad(camera.fov),hf=2*Math.atan(Math.tan(vf/2)*camera.aspect);
  const dW=(W+.6)/2/Math.tan(hf/2)*1.1,dH=(H+1)/2/Math.tan(vf/2)/.62;
  camDist=Math.max(dW,dH);const tilt=.5;
  camBase.set(CX,camDist*Math.cos(tilt),CZ+camDist*Math.sin(tilt));camera.position.copy(camBase);camera.lookAt(CX,0,CZ);
  camera.setViewOffset(w,h,0,h*.06,w,h);camera.updateProjectionMatrix();
  applyQuality();
  const fogOn=G.mod&&G.mod.fog;scene.fog.near=fogOn?camDist-4:camDist+20;scene.fog.far=fogOn?camDist+9:camDist+70;
}
addEventListener('resize',fit);
