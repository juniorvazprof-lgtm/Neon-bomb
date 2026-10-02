// Bomba Neon 84 — músicas sintetizadas e efeitos sonoros
/* ---------- audio ---------- */
let actx=null,master=null,t0=0,nextStep=0,noiseBuf=null,muted=false;
const SONGS=[
 {name:'Neon Drive',bpm:112,roots:[33,29,36,31],bass:[0,12,0,12,0,12,0,12],bw:'sawtooth',bf:700,snare:[2,6],hat:1,lead:[0,3,6],arp:[0,7,12,15],lw:'square',lo:36},
 {name:'Midnight Grid',bpm:100,roots:[38,34,29,36],bass:[0,0,12,0,0,12,7,12],bw:'sawtooth',bf:420,snare:[4],hat:1,lead:[0,2,4,7],arp:[0,3,7,10],lw:'triangle',lo:24},
 {name:'Chrome Sunset',bpm:124,roots:[28,36,31,26],bass:[-99,12,-99,12,-99,12,-99,12],bw:'square',bf:900,snare:[2,6],hat:2,lead:[0,1,3,5,6],arp:[0,7,12,14,19],lw:'sawtooth',lo:36},
 {name:'Laser Arcade',bpm:132,roots:[36,32,39,34],bass:[0,12,0,12,0,12,0,12],bw:'square',bf:1200,snare:[2,6],hat:2,lead:[0,1,2,3,4,5,6,7],arp:[0,3,7,12,15,12,7,3],lw:'square',lo:24},
 {name:'Vapor Coast',bpm:92,roots:[29,33,26,34],bass:[0,-99,7,-99,12,-99,7,-99],bw:'triangle',bf:600,snare:[4],hat:0,lead:[0,5],arp:[0,4,7,11],lw:'triangle',lo:36},
];
let SONG=SONGS[0],BEAT=60/SONG.bpm;
const mtof=m=>440*Math.pow(2,(m-69)/12);
const clock=()=>actx?actx.currentTime:performance.now()/1000;
function initAudio(){
  if(actx){actx.resume&&actx.resume();return;}
  try{
    actx=new (window.AudioContext||window.webkitAudioContext)();
    master=actx.createGain();master.gain.value=.5;master.connect(actx.destination);
    noiseBuf=actx.createBuffer(1,actx.sampleRate,actx.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
    t0=actx.currentTime+.1;nextStep=0;setInterval(sched,25);
  }catch(e){actx=null;}
}
function env(g,t,a,dec){g.gain.setValueAtTime(a,t);g.gain.exponentialRampToValueAtTime(.001,t+dec);}
function osc(type,f,t,a,dec,filt){const o=actx.createOscillator(),g=actx.createGain();o.type=type;o.frequency.setValueAtTime(f,t);let n=o;if(filt){const bq=actx.createBiquadFilter();bq.type='lowpass';bq.frequency.value=filt;o.connect(bq);n=bq;}n.connect(g);g.connect(master);env(g,t,a,dec);o.start(t);o.stop(t+dec+.02);return o;}
function noise(t,a,dec,type,f){const s=actx.createBufferSource(),bq=actx.createBiquadFilter(),g=actx.createGain();s.buffer=noiseBuf;bq.type=type;bq.frequency.setValueAtTime(f,t);s.connect(bq);bq.connect(g);g.connect(master);env(g,t,a,dec);s.start(t);s.stop(t+dec+.02);return bq;}
function sched(){
  if(!actx)return;
  while(t0+nextStep*BEAT/2<actx.currentTime+.12){
    const S=SONG,t=t0+nextStep*BEAT/2,st=nextStep%8,bar=Math.floor(nextStep/8)%4,r=S.roots[bar];
    if(st%2===0){const o=osc('sine',140,t,.9,.18);o.frequency.exponentialRampToValueAtTime(45,t+.15);}
    else if(S.hat)noise(t,.12,.05,'highpass',7000);
    if(S.hat===2&&st%2===0)noise(t+BEAT/4,.06,.03,'highpass',9000);
    if(S.snare.includes(st))noise(t,.3,.14,'bandpass',1800);
    const bo=S.bass[st];if(bo>-50)osc(S.bw,mtof(r+bo),t,.15,BEAT/2,S.bf);
    if(G.phase==='play'&&S.lead.includes(st)){const k=S.lead.indexOf(st)+bar;osc(S.lw,mtof(r+S.lo+S.arp[k%S.arp.length]),t,S.lw==='triangle'?.09:.045,.24,2400);}
    nextStep++;
  }
}
function sfxBoom(){if(!actx)return;const t=actx.currentTime;const f=noise(t,.8,.55,'lowpass',1200);f.frequency.exponentialRampToValueAtTime(90,t+.5);const o=osc('sine',90,t,.6,.35);o.frequency.exponentialRampToValueAtTime(35,t+.3);}
function sfxBlip(f,d=.08,type='square'){if(!actx)return;osc(type,f,actx.currentTime,.12,d,3000);}
function sfxUp(){if(!actx)return;const o=osc('triangle',500,actx.currentTime,.18,.25);o.frequency.exponentialRampToValueAtTime(1400,actx.currentTime+.2);}
function sfxDown(){if(!actx)return;const o=osc('sawtooth',600,actx.currentTime,.2,.6,1500);o.frequency.exponentialRampToValueAtTime(60,actx.currentTime+.55);}
let songOrder=[];
function setSong(k){
  SONG=SONGS[k];BEAT=60/SONG.bpm;
  t0=(actx?actx.currentTime:performance.now()/1000)+.08;nextStep=0;
}
function nextSongIdx(){if(!songOrder.length){songOrder=SONGS.map((_,i)=>i).sort(()=>Math.random()-.5);if(songOrder[0]===SONGS.indexOf(SONG))songOrder.push(songOrder.shift());}return songOrder.shift();}
function beatPhase(){const p=((clock()-t0)/BEAT)%1;return p<0?p+1:p;}
$('#mute').onclick=()=>{muted=!muted;if(master)master.gain.value=muted?0:.5;$('#mute').textContent=muted?T('mute'):T('sound');};
