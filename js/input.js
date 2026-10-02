// Bomba Neon 84 — direcional, botão de bomba e teclado
/* ---------- input ---------- */
const dpad=$('#dpad'),arms={u:dpad.querySelector('.u'),d:dpad.querySelector('.d'),l:dpad.querySelector('.l'),r:dpad.querySelector('.r')};let pid=null;
function padDir(e){
  const r=dpad.getBoundingClientRect(),dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2);
  const d=Math.hypot(dx,dy)<12?null:Math.abs(dx)>Math.abs(dy)?[Math.sign(dx),0]:[0,Math.sign(dy)];
  input.dir=d;
  arms.u.classList.toggle('on',!!d&&d[1]<0);arms.d.classList.toggle('on',!!d&&d[1]>0);
  arms.l.classList.toggle('on',!!d&&d[0]<0);arms.r.classList.toggle('on',!!d&&d[0]>0);
}
dpad.addEventListener('pointerdown',e=>{pid=e.pointerId;dpad.setPointerCapture(pid);padDir(e);e.preventDefault();});
dpad.addEventListener('pointermove',e=>{if(e.pointerId===pid)padDir(e);});
const pend=e=>{if(e.pointerId!==pid)return;pid=null;input.dir=null;for(const k in arms)arms[k].classList.remove('on');};
dpad.addEventListener('pointerup',pend);dpad.addEventListener('pointercancel',pend);
$('#bombBtn').addEventListener('pointerdown',e=>{e.preventDefault();if(G.phase==='play')input.bomb=true;});
const KM={ArrowUp:[0,-1],KeyW:[0,-1],ArrowDown:[0,1],KeyS:[0,1],ArrowLeft:[-1,0],KeyA:[-1,0],ArrowRight:[1,0],KeyD:[1,0]};
function keyDir(){const k=input.keys[input.keys.length-1];input.dir=k?KM[k]:null;}
addEventListener('keydown',e=>{
  if(KM[e.code]){if(!input.keys.includes(e.code))input.keys.push(e.code);keyDir();e.preventDefault();}
  if(e.code==='Space'&&G.phase==='play'){input.bomb=true;e.preventDefault();}
});
addEventListener('keyup',e=>{if(KM[e.code]){input.keys=input.keys.filter(k=>k!==e.code);keyDir();}});
