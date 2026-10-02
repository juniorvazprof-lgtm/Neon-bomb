// Bomba Neon 84 — inicialização
/* ---------- boot ---------- */
function applyLang(){
  document.documentElement.lang=LANG==='en'?'en':'pt-BR';
  document.querySelectorAll('[data-i]').forEach(el=>el.innerHTML=T(el.dataset.i));
  $('#mute').textContent=muted?T('mute'):T('sound');
  $('#modLbl').textContent=G.mod?L(G.mod,'name'):T('waiting');
  document.querySelectorAll('#segLang button').forEach(b=>b.classList.toggle('on',b.dataset.v===LANG));
  document.querySelectorAll('#segFx button').forEach(b=>b.classList.toggle('on',+b.dataset.v===FX));
  $('#app').dataset.fx=FX;renderChips();
}
document.querySelectorAll('#segLang button').forEach(b=>b.onclick=()=>{LANG=b.dataset.v;try{localStorage.setItem('bn84_lang',LANG);}catch(e){}applyLang();});
document.querySelectorAll('#segFx button').forEach(b=>b.onclick=()=>{FX=+b.dataset.v;try{localStorage.setItem('bn84_fx',FX);}catch(e){}applyLang();});
applyLang();
fit();buildArena(null);spawnEnts();renderChips();$('#modLbl').textContent=T('waiting');
requestAnimationFrame(frame);
