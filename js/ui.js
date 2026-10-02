// Bomba Neon 84 — telas, roleta, escolha de melhorias e fim de run
/* ---------- HUD / flow ---------- */
function renderChips(){
  $('#chips').innerHTML=ents.map(e=>`<div class="chip${e.alive?'':e.ghost?' ghost':' dead'}" style="--c:${CSSC[e.id]}"><div class="n">${pname(e)}</div><div class="t">${e.ups.map(u=>`<span>${UPS.find(x=>x.id===u).g}</span>`).join('')}</div></div>`).join('');
}
let toastT=0;
function toast(html){const t=$('#toast');t.innerHTML=html;t.classList.add('on');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('on'),2200);}
let beatT=0;
function flashBeat(txt){const b=$('#beatText');b.textContent=txt;b.classList.remove('on');void b.offsetWidth;b.classList.add('on');clearTimeout(beatT);beatT=setTimeout(()=>b.classList.remove('on'),160);}
function show(id){for(const o of ['#ovStart','#ovRoulette','#ovPick','#ovEnd'])$(o).hidden=o!==id;}

function startRun(){
  initAudio();resetPerm();G.arena=1;G.stats={a:0,k:0,b:0};renderChips();showRoulette();
}
function showRoulette(){
  G.phase='roulette';show('#ovRoulette');
  $('#rouEyebrow').textContent=T('rou',G.arena);$('#arenaLbl').textContent=`${G.arena}/3`;
  const reel=$('#reel'),loops=7,list=[];for(let l=0;l<loops;l++)for(const m of MODS)list.push(m);
  reel.innerHTML=list.map(m=>`<div class="ri">${L(m,'name')}</div>`).join('');
  const pick=Math.floor(Math.random()*MODS.length),target=(loops-2)*MODS.length+pick;
  const endPos=target*56,dur=2600,st=performance.now();let lastItem=-1;
  $('#enterBtn').disabled=true;$('#modDesc').textContent=T('spin');
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  function step(now){
    const k=reduce?1:Math.min(1,(now-st)/dur),e=1-Math.pow(1-k,4),pos=e*endPos;
    reel.style.transform=`translateY(${56-pos}px)`;
    const it=Math.round(pos/56);if(it!==lastItem){lastItem=it;sfxBlip(1200,.03);}
    if(k<1)requestAnimationFrame(step);
    else{G.mod=MODS[pick];$('#modDesc').textContent=L(G.mod,'desc');$('#modLbl').textContent=L(G.mod,'name');$('#enterBtn').disabled=false;sfxUp();}
  }
  requestAnimationFrame(step);
}
function startArena(){
  setSong(nextSongIdx());setTimeout(()=>toast('♪ <b>'+SONG.name+'</b>'),600);
  show(null);buildArena(G.mod,true);spawnEnts();renderChips();G.chain=0;
  for(const e of ents)e.m.g.scale.setScalar(.001);
  G.phase='count';G.count=3.6;G.endT=-1;$('#timer').textContent='';
}
function finishArena(won){
  G.phase='end';$('#ghostBar').hidden=true;
  if(won){G.stats.a++;if(G.arena>=3)return showEnd(true);showPick();}
  else showEnd(false);
}
function eligible(e){return UPS.filter(u=>(e.perm[u.id]||0)<u.max&&!(u.human&&!e.human));}
function weightedPick(pool,n){
  const out=[],p=pool.slice();
  while(out.length<n&&p.length){let tot=p.reduce((s,u)=>s+RARW[u.rar],0),r=Math.random()*tot;let k=0;for(;k<p.length;k++){r-=RARW[p[k].rar];if(r<=0)break;}out.push(p.splice(Math.min(k,p.length-1),1)[0]);}
  return out;
}
function grant(e,u){e.perm[u.id]=(e.perm[u.id]||0)+1;e.ups.push(u.id);}
function showPick(){
  G.phase='pick';show('#ovPick');
  const opts=weightedPick(eligible(ents[0]),3);
  $('#cards').innerHTML=opts.map((u,k)=>`<button class="up" data-k="${k}" style="--rc:${RARC[u.rar]}"><span class="g">${u.g}</span><span><span class="nm">${L(u,'name')}</span><span class="rr">${RARL[LANG][u.rar]}</span><div class="ds">${L(u,'desc')}</div></span></button>`).join('');
  $('#cards').querySelectorAll('.up').forEach(b=>b.onclick=()=>{
    grant(ents[0],opts[+b.dataset.k]);sfxUp();
    const notes=[];for(const e of ents.slice(1)){const u=weightedPick(eligible(e),1)[0];if(u){grant(e,u);notes.push(`${pname(e)} ${L(u,'name')}`);}}
    G.arena++;renderChips();showRoulette();
    setTimeout(()=>toast(T('t_bots')+'<b>'+notes.join(' · ')+'</b>'),300);
  });
}
function showEnd(won){
  G.phase='end';show('#ovEnd');
  $('#endEyebrow').textContent=won?T('runDone'):T('runOver');
  $('#endTitle').textContent=won?T('champ'):T('fell',G.arena);
  $('#stA').textContent=G.stats.a;$('#stK').textContent=G.stats.k;$('#stB').textContent=G.stats.b;
  const u=ents[0].ups.map(id=>L(UPS.find(x=>x.id===id),'name'));
  $('#endBuild').textContent=u.length?T('build')+u.join(', '):T('nobuild');
}
$('#startBtn').onclick=startRun;
$('#enterBtn').onclick=startArena;
$('#againBtn').onclick=startRun;
