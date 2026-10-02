// Bomba Neon 84 — inteligência dos robôs
/* ---------- bot AI ---------- */
const D=new Float32Array(N),dist=new Int16Array(N),prev=new Int16Array(N),Q=new Int16Array(N);
function danger(extra){
  D.fill(99);
  for(let i=0;i<N;i++)if(fireT[i]>0)D[i]=0;
  const mark=b=>rays(b.x,b.z,b.range,b.pierce,b.xb,i=>{if(b.t<D[i])D[i]=b.t;});
  bombs.forEach(mark);echoes.forEach(mark);if(extra)mark(extra);
}
function bfs(start,allow){
  dist.fill(-1);dist[start]=0;prev[start]=-1;let h=0,t=0;Q[t++]=start;
  while(h<t){const c=Q[h++],cx=c%W,cz=(c-cx)/W;
    for(const [ax,az] of DIRS){const n=idx(cx+ax,cz+az);if(dist[n]>=0||grid[n]!==0||bombAt.has(n)||!allow(n))continue;dist[n]=dist[c]+1;prev[n]=c;Q[t++]=n;}}
}
function stepTo(e,here,t){
  if(t<0||dist[t]<=0)return null;let c=t;while(prev[c]!==here)c=prev[c];
  return [c%W-e.x,Math.floor(c/W)-e.z];
}
function adjBrick(i){const x=i%W,z=(i-x)/W;for(const [ax,az] of DIRS)if(grid[idx(x+ax,z+az)]===2)return true;return false;}
function enemyInLine(e){
  for(const o of ents){if(o===e||!o.alive)continue;
    const ox=Math.round(o.x+(o.tx-o.x)*o.p),oz=Math.round(o.z+(o.tz-o.z)*o.p);
    if(ox!==e.x&&oz!==e.z)continue;const d=Math.abs(ox-e.x)+Math.abs(oz-e.z);if(d>e.range)continue;
    const sx=Math.sign(ox-e.x),sz=Math.sign(oz-e.z);let ok=true;
    for(let s=1;s<d;s++)if(grid[idx(e.x+sx*s,e.z+sz*s)]!==0){ok=false;break;}
    if(ok)return true;}
  return false;
}
function botThink(e){
  const here=idx(e.x,e.z);danger(null);
  if(D[here]<99){
    bfs(here,()=>true);let best=-1,bd=1e9;
    for(let i=0;i<N;i++)if(dist[i]>=0&&D[i]>=99&&dist[i]<bd){bd=dist[i];best=i;}
    if(best<0){let bt=-1;for(let i=0;i<N;i++)if(dist[i]>0&&D[i]>bt&&D[i]>dist[i]/e.speed){bt=D[i];best=i;}}
    return stepTo(e,here,best);
  }
  if(e.active<e.maxBombs&&Math.random()<e.aggr&&(adjBrick(here)||enemyInLine(e))){
    const fuse=nextBoom()-clock();
    danger({x:e.x,z:e.z,t:fuse,range:e.range,pierce:e.pierce,xb:e.xb});
    const D2=D.slice();danger(null);
    bfs(here,n=>D[n]>=99);
    for(let i=0;i<N;i++)if(dist[i]>0&&D2[i]>=99&&dist[i]/e.speed<fuse-.45){placeBomb(e);return null;}
  }
  bfs(here,n=>D[n]>=99);
  let best=-1,bs=1e9;
  const foes=ents.filter(o=>o!==e&&o.alive);
  for(let i=0;i<N;i++){
    if(dist[i]<0)continue;let s=1e9;const d=dist[i];
    if(powerups.has(i))s=d-7;
    else if(adjBrick(i))s=d+Math.random()*2.5;
    const x=i%W,z=(i-x)/W;
    for(const o of foes){const md=Math.abs(o.x-x)+Math.abs(o.z-z);if(md<=2)s=Math.min(s,d+md*1.5-G.arena*1.5);}
    if(i===here)s+=3;
    if(s<bs){bs=s;best=i;}
  }
  if(best<0||best===here){
    const opts=DIRS.filter(([ax,az])=>{const n=idx(e.x+ax,e.z+az);return grid[n]===0&&!bombAt.has(n)&&D[n]>=99;});
    return opts.length&&Math.random()<.5?opts[Math.floor(Math.random()*opts.length)]:null;
  }
  return stepTo(e,here,best);
}
