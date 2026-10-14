/* ═══════════════ WORKOUT PLAYER ═══════════════
   Video-guided sessions. Every exercise in the library carries a Vimeo id, so a
   day is playable end to end: clip, clock, rest, next.

   Two details carried over from Mirror Coaching because they were right:
   the next clip is loaded DURING the rest window so it is already buffered when
   rest ends, and reloading the same id is skipped so a repeated movement does
   not restart with a black frame.                                             */

const REST_SECS=20;
let _lastWorkout=null;
let pl=null, plTick=null;

function vimeoSrc(id,hash){
  return 'https://player.vimeo.com/video/'+id+'?'+(hash?'h='+hash+'&':'')+
         'background=1&autoplay=1&loop=1&muted=1&controls=0&autopause=0';
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
  f.src=vimeoSrc(ex.v,ex.h);
}
const PL_ICON_PLAY='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>';
const PL_ICON_PAUSE='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6.5" y="5" width="4" height="14" rx="1.2" fill="currentColor"/><rect x="13.5" y="5" width="4" height="14" rx="1.2" fill="currentColor"/></svg>';
/* As in Fitness+, the transport gets out of the way of the coach while the
   movement runs: it fades three seconds after play, and a tap on the clip
   brings it back. Paused, it stays. */
let plIdleT=null;
function plWake(){
  const el=$('play'); if(!el) return;
  el.classList.remove('idle');
  if(plIdleT){ clearTimeout(plIdleT); plIdleT=null; }
  if(pl && pl.running) plIdleT=setTimeout(()=>{ if(pl && pl.running) el.classList.add('idle'); },3000);
}
function plTap(e){
  const t=e && e.target;
  if(t && t.closest && t.closest('button,.pl-ov')) return plWake();
  const el=$('play'); if(!el) return;
  if(el.classList.contains('idle')) plWake(); else if(pl && pl.running){ el.classList.add('idle'); }
}
function plSetPlayIcon(running){
  const b=$('pl-play'); if(!b) return;
  b.innerHTML=running?PL_ICON_PAUSE:PL_ICON_PLAY;
  try{ b.setAttribute('aria-label',running?'Pause':'Play'); }catch(e){}
}
/* The movement's time, as Fitness+ shows it: elapsed on the left, what is
   left on the right, and a bar between. pl.len grows and shrinks with the
   ten-second buttons so the elapsed side never jumps. */
function plTime(){
  if(!pl) return;
  const len=Math.max(pl.len||0,pl.left), el=Math.max(0,len-pl.left);
  $('pl-clock').textContent=fmtT(pl.left);
  if($('pl-el'))  $('pl-el').textContent=fmtT(el);
  if($('pl-rem')) $('pl-rem').textContent='−'+fmtT(pl.left);
  if($('pl-fill')) $('pl-fill').style.width=(len?Math.round(el/len*100):0)+'%';
}
function fmtT(s){ s=Math.max(0,Math.round(s)); return Math.floor(s/60)+':'+('0'+(s%60)).slice(-2); }

/* start a workout from a list of exercise objects */
function startWorkout(exs,meta){
  if(!exs || !exs.length){ toast('Nothing to play'); return; }
  pl={exs, i:0, round:1, rounds:(meta&&meta.rounds)||1, meta:meta||{},
      left:exs[0].dur||45, len:exs[0].dur||45, running:false, resting:false, clip:null,
      t0:Date.now(), done:0};
  $('play').classList.add('on');
  $('pl-done').classList.remove('on');
  plCam.off=false; $('play').classList.remove('camoff');
  plSetMode(plCam.mode);
  renderPl(); setClip(exs[0]);
  plReady();
  plSessionStart(pl);
}
/* The server keeps its own record of a workout, with its own clock: a start
   now, a finish at the end. That record is what the leaderboards count
   (35-plus-sessions.sql), so a session counts only when it really ran.
   Offline, nothing is sent and nothing breaks; the diary is the member's. */
function plSessionStart(p){
  try{
    if(!sb || !HF.userId || !p) return;
    const m=p.meta||{};
    sb.rpc('plus_session_start',{p_program:m.pid||null, p_day:(typeof m.gi==='number'?m.gi:null), p_label:m.name||''})
      .then(r=>{ if(r && !r.error && pl===p) p.sid=r.data; }).catch(()=>{});
  }catch(e){}
}
function plSessionFinish(p){
  try{
    if(!sb || !p || !p.sid) return;
    const id=p.sid; p.sid=null;
    sb.rpc('plus_session_finish',{p_id:id}).then(()=>{ if(typeof _lbCache!=='undefined') _lbCache={}; }).catch(()=>{});
  }catch(e){}
}
function exitPlayer(){
  stopTick();
  plStopCam();
  const f=$('pl-video'); if(f) f.src='';
  if(pl) pl.clip=null;
  pl=null;
  $('play').classList.remove('on','idle','rdy');
  if(plIdleT){ clearTimeout(plIdleT); plIdleT=null; }
  $('pl-rest').classList.remove('on');
  $('pl-cd').classList.remove('on');
  $('pl-ready').classList.remove('on','busy');
}
function stopTick(){ if(plTick){ clearInterval(plTick); plTick=null; } if(pl) pl.running=false; }

function plCountdown(done){
  const el=$('pl-cd'), n=$('pl-cdn');
  const paint=c=>{
    /* a fresh node each beat so the fade-in plays again */
    n.textContent=c>0?String(c):'GO';
    n.className='cdn'+(c>0?'':' go');
    try{ n.style.animation='none'; void n.offsetWidth; n.style.animation=''; }catch(e){}
    const a=$('pl-cdarc'), pct=c>0?(4-c)/3*100:100;
    if(a && typeof ringArc==='function')
      a.innerHTML='<path d="'+ringArc(100,100,88,pct)+'" fill="none" stroke-width="12" stroke-linecap="round"/>';
  };
  if($('pl-cdx') && pl) $('pl-cdx').innerHTML='Up first · <b>'+pl.exs[pl.i].n+'</b>';
  el.classList.add('on'); let c=3; paint(c);
  const t=setInterval(()=>{
    c--;
    if(c>=0){ paint(c); }
    else { clearInterval(t); el.classList.remove('on'); done&&done(); }
  },800);
}
function plResume(){
  if(!pl || pl.running) return;
  pl.running=true; plSetPlayIcon(true); plWake();
  plTick=setInterval(()=>{
    if(!pl) return;
    pl.left--;
    plTime();
    if(pl.left<=0) plNext(true);
  },1000);
}
function plPause(){ stopTick(); plSetPlayIcon(false); plWake(); }
function plToggle(){ if(!pl) return; pl.running?plPause():plResume(); }
function plAdjust(d){ if(!pl) return; const was=pl.left; pl.left=Math.max(5,pl.left+d); pl.len=(pl.len||was)+(pl.left-was); plTime(); }

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
  else { pl.left=pl.len=pl.exs[0].dur||45; renderPl(); plResume(); }
}
function plGo(n){
  pl.i=n.i; pl.round=n.round;
  pl.left=pl.len=pl.exs[pl.i].dur||45;
  $('pl-rest').classList.remove('on');
  renderPl(); setClip(pl.exs[pl.i]);
  plResume();
}
/* Rest — and the reason it exists twice over: it is also when the next clip loads. */
function plRestPaint(){
  if(!pl || !pl.rest) return;
  const r=pl.rest;
  $('pl-restn').textContent=Math.max(0,r.left);
  const a=$('pl-restarc');
  if(a && typeof ringArc==='function'){
    const pct=r.total?Math.max(0,r.left)/r.total*100:0;
    a.innerHTML = pct>0 ? '<path d="'+ringArc(100,100,88,pct)+'" fill="none" stroke-width="12" stroke-linecap="round"/>' : '';
  }
}
function plRest(n){
  pl.resting=true;
  const nx=pl.exs[n.i];
  setClip(nx);                                   // buffers behind the rest overlay
  $('pl-restnext').textContent=nx.n;
  if($('pl-restmeta')) $('pl-restmeta').textContent=[nx.m,nx.eq].filter(Boolean).join(' · ')+
    ' · '+(n.i+1)+' of '+pl.exs.length+(pl.rounds>1?', round '+n.round:'');
  $('pl-rest').classList.add('on');
  pl.rest={left:REST_SECS, total:REST_SECS, n};
  plRestPaint();
  plTick=setInterval(()=>{
    if(!pl || !pl.rest) return;
    pl.rest.left--; plRestPaint();
    if(pl.rest.left<=0){ clearInterval(plTick); plTick=null; pl.resting=false; pl.rest=null; plGo(n); }
  },1000);
}
/* Twenty more seconds: the ring grows with it, so it still empties at the end. */
function plRestAdd(d){
  if(!pl || !pl.rest) return;
  pl.rest.left+=d; pl.rest.total=Math.max(pl.rest.total, pl.rest.left);
  plRestPaint();
}
function plSkipRest(){
  if(!pl||!pl.resting) return;
  stopTick(); pl.resting=false; pl.rest=null;
  const n=plNextIndex(); if(n) plGo(n); else plFinish();
}

function renderPl(){
  if(!pl) return;
  const ex=pl.exs[pl.i];
  $('pl-name').textContent=ex.n;
  $('pl-sub').textContent=ex.m+' · '+ex.eq;
  plTime(); plSetPlayIcon(!!pl.running);
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
  /* A T42 session is logged twice on purpose: once above, in the member's
     own diary, and once on the server for the scorer. The diary is the
     member's and is written first — the server copy can fail and be re-sent
     without anyone losing a session they actually did. */
  if(m.t42day && typeof t42RecordWorkout==='function') t42RecordWorkout(m, mins);
  plSessionFinish(pl);
  /* what the share card shows when opened from here */
  _lastWorkout={name:m.name||'Workout', mins, exs:pl.exs.length, rounds:pl.rounds};
  $('pl-dn-ex').textContent=pl.exs.length;
  $('pl-dn-min').textContent=mins;
  $('pl-dn-rnd').textContent=pl.rounds;
  /* The Fitness+ summary: the workout by name, today's date, then the week
     this session went into, as the same three rings Home shows. */
  if($('pl-dn-name')) $('pl-dn-name').textContent=m.name||'Workout';
  if($('pl-dn-date')) $('pl-dn-date').textContent=new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'});
  try{ const st=liveStreak(); $('pl-dn-streak').textContent=st; $('pl-dn-streak-u').textContent=st===1?'DAY':'DAYS'; }catch(e){}
  try{
    const days=daysThisWeek(), wg=HF.data.weekGoal||5, wm=weekMinutes(), cons=consistency();
    $('pl-dn-week').innerHTML=ringsSVG([days/wg*100, wm/150*100, cons],78)+
      '<div><div class="t">This Week</div>'+
      '<div class="l"><b class="hc-days">'+days+'/'+wg+'</b> days · <b class="hc-mins">'+wm+'/150</b> min</div>'+
      '<div class="l">'+(days>=wg?'Weekly goal reached.':(wg-days)+' more day'+(wg-days===1?'':'s')+' to your goal.')+'</div></div>';
  }catch(e){ $('pl-dn-week').innerHTML=''; }
  $('pl-done').classList.add('on');
}
function plClose(){
  const back=pl&&pl.meta&&pl.meta.pid;
  /* Closing a T42 workout returns to T42, not to Home. Dropping someone on
     the home tab after the session their challenge asked for is the app
     losing their place for them. */
  const t42=pl&&pl.meta&&pl.meta.t42day;
  const aic=pl&&pl.meta&&pl.meta.aic;
  const lb=pl&&pl.meta&&pl.meta.lb;
  exitPlayer();
  if(lb && typeof lbAfterSession==='function') return lbAfterSession(lb);
  if(aic && typeof aicAfterSession==='function') return aicAfterSession(aic);
  if(t42 && typeof openT42==='function') return openT42();
  if(back) backToProgram(); else switchTab('home');
}

/* ── entry points ── */
function playDay(){
  if(!curDay) return;
  const {p,day,gi}=curDay;
  if(!ownsProgram(p)) return lockedProgram(p);
  const exs=pickEx(day.ex, progEq(p));
  /* a day may set its own rounds — the 30-day program grows from 2 to 3 */
  startWorkout(exs,{rounds:day.r||p.rounds||3, pid:p.id, gi, key:p.id+'-d'+gi, name:day.name||'Workout'});
}
function playSingle(id){
  const p=findProg(id); if(!p||p.weeks) return;
  if(!ownsProgram(p)) return openPaywall(p.name+' is part of HITFAT+.');
  const exs=pickEx(p.ex||[], progEq(p));
  startWorkout(exs,{rounds:p.rounds||3, key:p.id+'-'+iso(0), name:p.name});
}
/* one movement on its own — used from the library so a clip is always one tap away */
function playExercise(name){
  const e=DB.find(x=>x.n===name); if(!e) return;
  if(!e.v){ toast(e.n+' is coming soon — its video is being filmed.'); return; }
  /* A program bought on its own plays its own movements, without the
     membership the rest of the library needs. */
  const inOwnDay=!!(curDay && curDay.day && (curDay.day.ex||[]).indexOf(name)>=0 && ownsProgram(curDay.p));
  if(!inOwnDay && needPlus('Every movement in the library is part of HITFAT+.')) return;
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
  const b=$('pl-mode'); if(b) b.innerHTML = glyph(m==='mirror' ? 'person' : 'mirror');
}
function plToggleMode(){ plSetMode(plCam.mode==='mirror'?'coach':'mirror'); }
function plToggleCam(){
  plCam.off=!plCam.off;
  $('play').classList.toggle('camoff', plCam.off);
  const b=$('pl-camhide'); if(b) b.innerHTML = glyph(plCam.off ? 'photo' : 'eyeoff');
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
  r.classList.add('on','busy');
}
function plRetryCam(){
  plReadyText();
  $('pl-rdbusy').style.display='none';
  $('pl-modes').style.display='flex';
  $('pl-rdgo').style.display='block';
  plBegin();
}
function plNoCam(){
  $('pl-rdbusy').style.display='none';
  plSetMode('coach');
  $('pl-camdot').classList.remove('on');
  plStart();
}

/* READY screen → mode choice → camera → countdown → play */
/* What is in it, as Fitness+ lists an episode: the movements, the rounds,
   and roughly how long, rests included. */
function plReadyText(){
  const r=$('pl-ready'); if(r) r.classList.remove('busy');
  if(!pl) return;
  const n=pl.exs.length, rd=pl.rounds||1;
  const secs=pl.exs.reduce((t,e)=>t+(e.dur||45),0)*rd + REST_SECS*Math.max(0,n*rd-1);
  $('pl-rdt').textContent=(pl.meta&&pl.meta.name)||pl.exs[0].n;
  if($('pl-rdm')) $('pl-rdm').textContent=n+(n===1?' exercise':' exercises')+(rd>1?' · '+rd+' rounds':'')+' · about '+Math.max(1,Math.round(secs/60))+' min';
  $('pl-rds').textContent='Choose Your View';
  if($('pl-rdf')) $('pl-rdf').textContent='Up first: '+pl.exs[0].n;
}
function plReady(){
  plReadyText();
  $('pl-modes').style.display='flex';
  $('pl-rdgo').style.display='block';
  $('pl-rdbusy').style.display='none';
  plRenderModes();
  $('pl-ready').classList.add('on');
  $('play').classList.add('rdy');
}
function plPickMode(m){ plSetMode(m); plRenderModes(); }
function plRenderModes(){
  const el=$('pl-modes'); if(!el) return;
  el.innerHTML=[['mirror','🪞','Mirror','See yourself'],['coach','👤','Coach','Follow along']]
    .map(m=>'<button class="pl-mo'+(plCam.mode===m[0]?' on':'')+'" onclick="plPickMode(\''+m[0]+'\')">'+
      '<span class="e">'+glyph(m[1])+'</span><span class="n">'+m[2]+'</span><span class="s">'+m[3]+'</span></button>').join('');
}
function plBegin(){
  plAskCam(()=>plStart());
}
function plStart(){
  $('pl-ready').classList.remove('on','busy');
  $('play').classList.remove('rdy');
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

