/* ═══════════════ WORKOUT PLAYER ═══════════════
   Video-guided sessions. Every exercise in the library carries a Vimeo id, so a
   day is playable end to end: clip, clock, rest, next.

   Two details carried over from Mirror Coaching because they were right:
   the next clip is loaded DURING the rest window so it is already buffered when
   rest ends, and reloading the same id is skipped so a repeated movement does
   not restart with a black frame.                                             */

const REST_SECS=20;
let pl=null, plTick=null;

function vimeoSrc(id){
  return 'https://player.vimeo.com/video/'+id+
         '?background=1&autoplay=1&loop=1&muted=1&controls=0&autopause=0';
}
function setClip(ex){
  const f=$('pl-video'); if(!f||!ex) return;
  const nf=$('pl-nofilm');
  /* No clip is not the same as "keep the previous clip". Leaving the last
     video running under a different exercise name is worse than an empty
     screen — it shows the wrong movement and looks deliberate. */
  if(!ex.v){
    if(pl) pl.clip=null;
    f.src='about:blank';
    if(nf) nf.style.display='grid';
    const t=$('pl-nofilm-m');
    if(t) t.textContent=ex.n+' is being filmed. Follow the sets and reps below — the clip appears here as soon as it is ready.';
    return;
  }
  if(nf) nf.style.display='none';
  if(pl && pl.clip===ex.v) return;        // already playing this one — do not restart it
  if(pl) pl.clip=ex.v;
  f.src=vimeoSrc(ex.v);
}
function fmtT(s){ s=Math.max(0,Math.round(s)); return Math.floor(s/60)+':'+('0'+(s%60)).slice(-2); }

/* start a workout from a list of exercise objects */
function startWorkout(exs,meta){
  if(!exs || !exs.length){ toast('Nothing to play'); return; }
  pl={exs, i:0, round:1, rounds:(meta&&meta.rounds)||1, meta:meta||{},
      left:exs[0].dur||45, running:false, resting:false, clip:null,
      t0:Date.now(), done:0};
  $('play').classList.add('on');
  $('pl-done').classList.remove('on');
  plCam.off=false; $('play').classList.remove('camoff');
  plSetMode(plCam.mode);
  renderPl(); setClip(exs[0]);
  plReady();
}
function exitPlayer(){
  stopTick();
  plStopCam();
  const f=$('pl-video'); if(f) f.src='';
  if(pl) pl.clip=null;
  pl=null;
  $('play').classList.remove('on');
  $('pl-rest').classList.remove('on');
  $('pl-cd').classList.remove('on');
  $('pl-ready').classList.remove('on');
}
function stopTick(){ if(plTick){ clearInterval(plTick); plTick=null; } if(pl) pl.running=false; }

function plCountdown(done){
  const el=$('pl-cd'), n=$('pl-cdn');
  el.classList.add('on'); let c=3; n.textContent=c;
  const t=setInterval(()=>{
    c--;
    if(c>0){ n.textContent=c; }
    else if(c===0){ n.textContent='GO'; }
    else { clearInterval(t); el.classList.remove('on'); done&&done(); }
  },700);
}
function plResume(){
  if(!pl || pl.running) return;
  pl.running=true; $('pl-play').textContent='❚❚';
  plTick=setInterval(()=>{
    if(!pl) return;
    pl.left--;
    $('pl-clock').textContent=fmtT(pl.left);
    if(pl.left<=0) plNext(true);
  },1000);
}
function plPause(){ stopTick(); const b=$('pl-play'); if(b) b.textContent='▶'; }
function plToggle(){ if(!pl) return; pl.running?plPause():plResume(); }
function plAdjust(d){ if(!pl) return; pl.left=Math.max(5,pl.left+d); $('pl-clock').textContent=fmtT(pl.left); }

function plNextIndex(){
  if(!pl) return null;
  if(pl.i+1 < pl.exs.length) return {i:pl.i+1, round:pl.round};
  if(pl.round < pl.rounds)   return {i:0, round:pl.round+1};
  return null;
}
function plNext(auto){
  if(!pl) return;
  stopTick();
  pl.done++;
  const nxt=plNextIndex();
  if(!nxt){ plFinish(); return; }
  if(auto) plRest(nxt); else plGo(nxt);
}
function plPrev(){
  if(!pl) return;
  stopTick();
  if(pl.i>0) plGo({i:pl.i-1, round:pl.round});
  else if(pl.round>1) plGo({i:pl.exs.length-1, round:pl.round-1});
  else { pl.left=pl.exs[0].dur||45; renderPl(); plResume(); }
}
function plGo(n){
  pl.i=n.i; pl.round=n.round;
  pl.left=pl.exs[pl.i].dur||45;
  $('pl-rest').classList.remove('on');
  renderPl(); setClip(pl.exs[pl.i]);
  plResume();
}
/* Rest — and the reason it exists twice over: it is also when the next clip loads. */
function plRest(n){
  pl.resting=true;
  const nx=pl.exs[n.i];
  setClip(nx);                                   // buffers behind the rest overlay
  $('pl-restnext').textContent='NEXT · '+nx.n;
  $('pl-rest').classList.add('on');
  let r=REST_SECS; $('pl-restn').textContent=r;
  plTick=setInterval(()=>{
    r--; $('pl-restn').textContent=Math.max(0,r);
    if(r<=0){ clearInterval(plTick); plTick=null; pl.resting=false; plGo(n); }
  },1000);
}
function plSkipRest(){
  if(!pl||!pl.resting) return;
  stopTick(); pl.resting=false;
  const n=plNextIndex(); if(n) plGo(n); else plFinish();
}

function renderPl(){
  if(!pl) return;
  const ex=pl.exs[pl.i];
  $('pl-name').textContent=ex.n;
  $('pl-sub').textContent=ex.m+' · '+ex.eq;
  $('pl-clock').textContent=fmtT(pl.left);
  $('pl-pill').innerHTML=(pl.rounds>1?'Round <b>'+pl.round+'/'+pl.rounds+'</b> · ':'')+
                         '<b>'+(pl.i+1)+'</b>/'+pl.exs.length;
  // one tick per exercise beats a bare percentage — you can see the shape of the set
  $('pl-segs').innerHTML=pl.exs.map((_,i)=>
    '<i class="'+(i<pl.i?'done':(i===pl.i?'now':''))+'"></i>').join('');
  // a quiet line instead of the loud stack that used to sit over the movement
  const n=plNextIndex();
  $('pl-next').innerHTML = n ? ('Up next · <b>'+pl.exs[n.i].n+'</b>') : 'Last one';
}
function plFinish(){
  stopTick();
  const mins=Math.max(1,Math.round((Date.now()-pl.t0)/60000));
  const m=pl.meta||{};
  if(m.key) HF.markDone(m.key,{name:m.name||'Workout', mins});
  if(m.pid && progDone(m.pid)===m.gi){ HF.data.progress[m.pid]=m.gi+1; HF.save(); }
  $('pl-dn-ex').textContent=pl.exs.length;
  $('pl-dn-min').textContent=mins;
  $('pl-dn-rnd').textContent=pl.rounds;
  $('pl-done').classList.add('on');
}
function plClose(){
  const back=pl&&pl.meta&&pl.meta.pid;
  exitPlayer();
  if(back) backToProgram(); else switchTab('home');
}

/* ── entry points ── */
function playDay(){
  if(!curDay) return;
  const {p,day,gi}=curDay;
  const exs=pickEx(day.ex, progEq(p));
  startWorkout(exs,{rounds:p.rounds||3, pid:p.id, gi, key:p.id+'-d'+gi, name:day.name||'Workout'});
}
function playSingle(id){
  const p=findProg(id); if(!p||p.weeks) return;
  const exs=pickEx(p.ex||[], progEq(p));
  startWorkout(exs,{rounds:p.rounds||3, key:p.id+'-'+iso(0), name:p.name});
}
/* one movement on its own — used from the library so a clip is always one tap away */
function playExercise(name){
  const e=DB.find(x=>x.n===name); if(!e) return;
  startWorkout([e],{rounds:1, key:'ex-'+name+'-'+iso(0), name:e.n});
}

/* ═══════════════ CAMERA ═══════════════
   The mirror is the point of HITFAT+: you watch the coach and yourself at once.
   Two modes, swappable mid-session —
     COACH  : coach fills the screen, you are a small frame in the corner
     MIRROR : you fill the screen, the coach shrinks into the corner
   The acquisition handling (timeout probe, busy screen, release on hide) is
   carried over from Mirror Coaching because it was already right: a phone that
   never answers getUserMedia would otherwise hang the whole workout. */

let plCam={stream:null, mode:'coach', off:false, asked:false};

function plSetMode(m){
  plCam.mode=m;
  const r=$('play'); if(!r) return;
  r.classList.toggle('mirrormode', m==='mirror');
  const b=$('pl-mode'); if(b) b.textContent = m==='mirror' ? '👤' : '🪞';
}
function plToggleMode(){ plSetMode(plCam.mode==='mirror'?'coach':'mirror'); }
function plToggleCam(){
  plCam.off=!plCam.off;
  $('play').classList.toggle('camoff', plCam.off);
  const b=$('pl-camhide'); if(b) b.textContent = plCam.off ? '🚫' : '📷';
}

function plStopCam(){
  try{ const r=$('play'); if(r) r.classList.remove('hascam');
     const d=$('pl-camdot'); if(d) d.classList.remove('on'); }catch(e){}
  try{
    if(plCam.stream){ plCam.stream.getTracks().forEach(t=>t.stop()); plCam.stream=null; }
    const v=$('pl-cam');
    if(v && v.srcObject){ try{ v.srcObject.getTracks().forEach(t=>t.stop()); }catch(e){} v.srcObject=null; }
  }catch(e){}
}
/* Probe with our own timeout. If another feature still holds the camera the
   browser simply never resolves, so waiting forever is not an option. */
function plAskCam(done){
  plStopCam();
  const v=$('pl-cam');
  if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){ plCamBusy('no-cam'); return; }
  let settled=false;
  const timer=setTimeout(()=>{ if(!settled){ settled=true; plCamBusy('busy'); } },4000);
  navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:640},height:{ideal:480}},audio:false})
    .then(stream=>{
      if(settled){ try{ stream.getTracks().forEach(t=>t.stop()); }catch(e){} return; }
      settled=true; clearTimeout(timer);
      plCam.stream=stream; if(v) v.srcObject=stream;
      $('play').classList.add('hascam');
      $('pl-camdot').classList.add('on');
      done&&done();
    })
    .catch(()=>{ if(settled) return; settled=true; clearTimeout(timer); plCamBusy('denied'); });
}
function plCamBusy(why){
  const r=$('pl-ready'); if(!r) return;
  $('pl-rdt').textContent = why==='denied' ? 'Camera blocked' : 'Camera busy';
  $('pl-rds').innerHTML = why==='denied'
    ? 'Allow camera access in your browser settings, or train without it.'
    : 'Another app or tab may still be using the camera.<br>Close it and retry, or train without it.';
  $('pl-modes').style.display='none';
  $('pl-rdgo').style.display='none';
  $('pl-rdbusy').style.display='flex';
  r.classList.add('on');
}
function plRetryCam(){
  $('pl-rdbusy').style.display='none';
  $('pl-modes').style.display='flex';
  $('pl-rdgo').style.display='block';
  $('pl-rdt').textContent='Ready?';
  $('pl-rds').textContent='Pick your view, then start.';
  plBegin();
}
function plNoCam(){
  $('pl-rdbusy').style.display='none';
  plSetMode('coach');
  $('pl-camdot').classList.remove('on');
  plStart();
}

/* READY screen → mode choice → camera → countdown → play */
function plReady(){
  $('pl-rdt').textContent='Ready?';
  $('pl-rds').textContent='Pick your view, then start.';
  $('pl-modes').style.display='flex';
  $('pl-rdgo').style.display='block';
  $('pl-rdbusy').style.display='none';
  plRenderModes();
  $('pl-ready').classList.add('on');
}
function plPickMode(m){ plSetMode(m); plRenderModes(); }
function plRenderModes(){
  const el=$('pl-modes'); if(!el) return;
  el.innerHTML=[['mirror','🪞','Mirror','See yourself'],['coach','👤','Coach','Follow along']]
    .map(m=>'<button class="pl-mo'+(plCam.mode===m[0]?' on':'')+'" onclick="plPickMode(\''+m[0]+'\')">'+
      '<span class="e">'+m[1]+'</span><span class="n">'+m[2]+'</span><span class="s">'+m[3]+'</span></button>').join('');
}
function plBegin(){
  plAskCam(()=>plStart());
}
function plStart(){
  $('pl-ready').classList.remove('on');
  plCountdown(()=>plResume());
}
/* release the camera whenever the page is hidden — iOS will not do it for us */
if(typeof document!=='undefined' && document.addEventListener){
  document.addEventListener('visibilitychange',function(){ if(document.hidden){ plPause(); plStopCam(); } });
}
if(typeof window!=='undefined' && window.addEventListener){
  window.addEventListener('pagehide', plStopCam);
}


function challengeWeeks(numDays, dayPools, restEvery){
  // dayPools: array of exercise-name arrays to rotate through
  // restEvery: insert rest day every Nth day (0 = no rest)
  var allDays=[];
  var workoutCount=0;
  for(var d=0; d<numDays; d++){
    var dayNum=d+1;
    if(restEvery && dayNum%restEvery===0){
      allDays.push({rest:true});
    } else {
      var pool=dayPools[workoutCount % dayPools.length];
      allDays.push({name:'Day '+dayNum, ex:pool.slice()});
      workoutCount++;
    }
  }
  // group into weeks of 7
  var weeks=[];
  for(var i=0;i<allDays.length;i+=7){
    weeks.push({days:allDays.slice(i,i+7)});
  }
  return weeks;
}

