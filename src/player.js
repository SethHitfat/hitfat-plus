/* ═══════════════ WORKOUT PLAYER ═══════════════
   Video-guided sessions. Every exercise in the library carries a Vimeo id, so a
   day is playable end to end: clip, clock, rest, next.

   Two details carried over from Mirror Coaching because they were right:
   the next clip is loaded DURING the rest window so it is already buffered when
   rest ends, and reloading the same id is skipped so a repeated movement does
   not restart with a black frame.                                             */

const REST_SECS=20;
/* The mirror (your camera beside the coach) is parked: Simple's player shows
   the coach full screen and nothing else, and that reads better on a phone.
   Its code stays below, behind this switch. */
const PL_MIRROR=false;
/* a rough burn for bodyweight HIIT: about 7 kcal a minute of work, rests not counted */
const PL_KCAL_MIN=7;
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
  ['pl-play','pl-play2'].forEach(id=>{
    const b=$(id); if(!b) return;
    b.innerHTML=running?PL_ICON_PAUSE:PL_ICON_PLAY;
    try{ b.setAttribute('aria-label',running?'Pause':'Play'); }catch(e){}
  });
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
  /* the segment under way fills with the time; the last three seconds go
     red, and in the last five what comes next steps forward */
  const seg=document.querySelector('#pl-segs i.now');
  if(seg && seg.style && seg.style.setProperty) seg.style.setProperty('--p',(len?Math.round(el/len*1000)/10:0)+'%');
  const c=$('pl-clock'); if(c && c.classList) c.classList.toggle('hot', !!pl.running && pl.left<=3 && pl.left>0);
  /* FIIT (18 Oct): a ring round the time empties with the move; the whole
     class's time left sits up top */
  const rg=$('pl-ringp'); if(rg && rg.style) rg.style.strokeDashoffset=String(Math.round(PL_RING*(len?el/len:0)*10)/10);
  const tt=$('pl-tot'); if(tt) tt.textContent=fmtT(plTotalLeft())+' left';
  const nx=$('pl-next'); if(nx && nx.classList) nx.classList.toggle('soon', !!pl.running && pl.left<=5 && pl.left>0);
}
/* the ring's length: 2πr for r = 54 */
const PL_RING=339.3;
/* what is left of the whole class: this move, then every move and rest after it */
function plTotalLeft(){
  if(!pl) return 0;
  let t=Math.max(0,pl.resting&&pl.rest?pl.rest.left:pl.left), i=pl.i, r=pl.round;
  if(pl.resting&&pl.rest&&pl.rest.n){ i=pl.rest.n.i; r=pl.rest.n.round; t+=pl.exs[i].dur||45; }
  for(;;){
    if(i+1<pl.exs.length) i++; else if(r<pl.rounds){ i=0; r++; } else break;
    t+=REST_SECS+(pl.exs[i].dur||45);
  }
  return t;
}
/* the count-out: a short tick for 3, 2, 1, a higher one at the change (not when the sound is off) */
function plBeep(hi){
  try{
    if(typeof hfSoundOn==='function' && !hfSoundOn()) return;
    const ac=typeof hfAC==='function'?hfAC():null; if(!ac || typeof hfTone!=='function') return;
    if(ac.state && ac.state!=='running' && ac.resume) ac.resume();
    hfTone(ac,ac.currentTime+0.01,'sine',hi?1320:880,hi?1320:880,hi?0.28:0.12,hi?0.22:0.14);
  }catch(e){}
}
function plKcal(){
  if(!pl) return 0;
  return Math.round((pl.work||0)/60*PL_KCAL_MIN);
}
function plStats(){ const k=$('pl-kcal'); if(k) k.textContent=String(plKcal()); }
function fmtT(s){ s=Math.max(0,Math.round(s)); return Math.floor(s/60)+':'+('0'+(s%60)).slice(-2); }

/* start a workout from a list of exercise objects */
function startWorkout(exs,meta){
  if(!exs || !exs.length){ toast('Nothing to play'); return; }
  pl={exs, i:0, round:1, rounds:(meta&&meta.rounds)||1, meta:meta||{},
      left:exs[0].dur||45, len:exs[0].dur||45, running:false, resting:false, clip:null,
      t0:Date.now(), done:0, work:0, started:false, finished:false,
      score0:(typeof scScore==='function'?scScore():null)};
  $('play').classList.add('on');
  $('pl-done').classList.remove('on');
  $('pl-why').classList.remove('on');
  $('play').classList.toggle('nomirror', !PL_MIRROR);
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
  $('play').classList.remove('on','idle','rdy','resting','counting');
  if(plIdleT){ clearTimeout(plIdleT); plIdleT=null; }
  $('pl-rest').classList.remove('on');
  $('pl-cd').classList.remove('on');
  $('pl-ready').classList.remove('on','busy');
  $('pl-why').classList.remove('on');
  plUnrotate();
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
  if($('pl-cdx') && pl) $('pl-cdx').innerHTML='<span>→ Up next</span><b>'+pl.exs[pl.i].n+'</b>';
  el.classList.add('on'); $('play').classList.add('counting'); let c=3; paint(c);
  const t=setInterval(()=>{
    c--;
    if(c>=0){ paint(c); }
    else { clearInterval(t); el.classList.remove('on'); $('play').classList.remove('counting'); done&&done(); }
  },800);
}
function plResume(){
  if(!pl || pl.running) return;
  pl.running=true; plSetPlayIcon(true); plWake();
  plTick=setInterval(()=>{
    if(!pl) return;
    pl.left--; pl.work=(pl.work||0)+1;
    plTime(); plStats();
    if(pl.left>0 && pl.left<=3) plBeep(false);
    if(pl.left<=0){ plBeep(true); plNext(true); }
  },1000);
}
function plPause(){ stopTick(); plSetPlayIcon(false); plTime(); plWake(); }
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
  $('pl-rest').classList.remove('on'); $('play').classList.remove('resting');
  renderPl(); setClip(pl.exs[pl.i]);
  plResume();
}
/* Rest — and the reason it exists twice over: it is also when the next clip loads. */
function plRestPaint(){
  if(!pl || !pl.rest) return;
  const r=pl.rest;
  $('pl-restn').textContent=Math.max(0,r.left);
  if($('pl-resttot')) $('pl-resttot').textContent=fmtT(plTotalLeft())+' left';
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
  $('play').classList.add('resting');
  if($('pl-restmeta')) $('pl-restmeta').textContent=[nx.m,nx.eq].filter(Boolean).join(' · ')+
    ' · '+(n.i+1)+' of '+pl.exs.length+(pl.rounds>1?', round '+n.round:'');
  $('pl-rest').classList.add('on');
  pl.rest={left:REST_SECS, total:REST_SECS, n};
  if($('pl-resttot')) $('pl-resttot').textContent=fmtT(plTotalLeft())+' left';
  plRestPaint();
  plTick=setInterval(()=>{
    if(!pl || !pl.rest) return;
    pl.rest.left--; plRestPaint();
    if(pl.rest.left>0 && pl.rest.left<=3) plBeep(false);
    if(pl.rest.left<=0) plBeep(true);
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
  /* the segments count the movements; the pill says only the round */
  $('pl-pill').innerHTML=pl.rounds>1?'Round <b>'+pl.round+'/'+pl.rounds+'</b>':'';
  if($('pl-ph')) $('pl-ph').textContent='Work';
  if($('pl-mv')) $('pl-mv').textContent='Move '+(pl.i+1)+' of '+pl.exs.length;
  // one tick per exercise beats a bare percentage — you can see the shape of the set
  $('pl-segs').innerHTML=pl.exs.map((_,i)=>
    '<i class="'+(i<pl.i?'done':(i===pl.i?'now':''))+'"></i>').join('');
  // a quiet line instead of the loud stack that used to sit over the movement
  const n=plNextIndex();
  $('pl-next').innerHTML = n ? ('Next: <b>'+pl.exs[n.i].n+'</b>') : 'Last one!';
  plStats();
}
function plFinish(){
  stopTick();
  pl.finished=true; $('play').classList.remove('resting');
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
  if($('pl-dn-kcal')) $('pl-dn-kcal').textContent=String(plKcal());
  plFinishExtras(m);
  $('pl-dn-min').textContent=mins;
  $('pl-dn-rnd').textContent=pl.rounds;
  /* The Fitness+ summary: the workout by name, today's date, then the week
     this session went into, as the same three rings Home shows. */
  if($('pl-dn-name')) $('pl-dn-name').textContent=m.name||'Workout';
  if($('pl-dn-date')) $('pl-dn-date').textContent=new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'});
  try{ const st=liveStreak(); $('pl-dn-streak').textContent=st; $('pl-dn-streak-u').textContent=st===1?'DAY':'DAYS'; }catch(e){}
  /* the week as a red bar of days to the goal (18 Oct: no more Apple rings) */
  try{
    const days=daysThisWeek(), wg=HF.data.weekGoal||5, wm=weekMinutes();
    $('pl-dn-week').innerHTML='<div class="wkh"><b>This week</b><span>'+days+' of '+wg+' days · '+wm+' min</span></div>'+
      '<div class="wkd">'+Array.from({length:wg},(_,i)=>'<i class="'+(i<days?'on':'')+'"></i>').join('')+'</div>'+
      '<div class="wkl">'+(days>=wg?'Weekly goal reached 🎉':(wg-days)+' more day'+(wg-days===1?'':'s')+' to your goal.')+'</div>';
  }catch(e){ $('pl-dn-week').innerHTML=''; }
  $('pl-done').classList.add('on');
}
/* the finish's top: Bara cheering, the HITFAT Score the workout moved, how it felt */
function plFinishExtras(m){
  try{
    const b=$('pl-dn-bara'); if(b) b.innerHTML='<img src="/img/mascot/anim/cheer.png" alt="Bara cheering">';
    const sc=$('pl-dn-score');
    if(sc && typeof scScore==='function'){
      const a=pl.score0, z=scScore(), red=a!==null && a<SC_PADU && z>=SC_PADU;
      sc.innerHTML=a!==null && z>a
        ? '<span>HITFAT Score</span><b>'+a+'</b><i>→</i><b class="up">'+z+'</b>'+(red?'<em>Bara is red! 🔥</em>':'<em>+'+(z-a)+'</em>')
        : '<span>HITFAT Score today</span><b class="up">'+z+'</b>';
    }
    const f=$('pl-dn-feel');
    if(f){ pl.feelKey=m&&m.key; f.innerHTML='<div class="fk">How was it?</div><div class="fb">'+
      [['easy','Easy'],['right','Just right'],['hard','Hard']].map(x=>'<button onclick="plFeel(\''+x[0]+'\')" data-f="'+x[0]+'">'+x[1]+'</button>').join('')+'</div>'; }
  }catch(e){}
}
function plFeel(v){
  const f=$('pl-dn-feel'); if(!f) return;
  Array.prototype.forEach.call(f.querySelectorAll('button'),b=>b.classList.toggle('on',b.getAttribute('data-f')===v));
  const k=pl&&pl.feelKey, S=HF.data.sessions||{};
  if(k && S[k]){ S[k].feel=v; HF.save(); }
  toast(v==='hard'?'Noted. Bara will remember it was tough 💪':v==='easy'?'Noted. Time to level up? 🔥':'Noted. Just right 👌');
}
const PL_WHY=[['came','Something came up'],['break','I need a break'],['dislike','Didn\'t like the exercises'],
  ['hard','Too difficult'],['easy','Too easy']];
function plClose(){
  if(pl && pl.started && !pl.finished && !pl.asked) return plWhy();
  plCloseNow();
}
function plWhy(){
  pl.asked=true; pl.wasRunning=pl.running||pl.resting;
  if(pl.running) plPause();
  if(pl.resting && plTick){ clearInterval(plTick); plTick=null; }
  $('pl-whyopts').innerHTML=PL_WHY.map(w=>'<button onclick="plWhyPick(\''+w[0]+'\')">'+w[1]+'</button>').join('');
  $('pl-why').classList.add('on');
}
function plWhyKeep(){
  if(!pl) return;
  pl.asked=false; $('pl-why').classList.remove('on');
  if(pl.resting && pl.rest){ const n=pl.rest.n; pl.rest.left=Math.max(3,pl.rest.left);
    plTick=setInterval(()=>{ if(!pl || !pl.rest) return; pl.rest.left--; plRestPaint();
      if(pl.rest.left<=0){ clearInterval(plTick); plTick=null; pl.resting=false; pl.rest=null; plGo(n); } },1000); }
  else if(pl.wasRunning) plResume();
}
function plWhyPick(r){
  if(!pl) return;
  const m=pl.meta||{}, q=HF.data.quits||(HF.data.quits=[]);
  q.push({d:iso(0), r, n:m.name||pl.exs[0].n, k:m.key||'', at:pl.done, of:pl.exs.length*(pl.rounds||1), s:pl.work||0});
  if(q.length>60) q.splice(0,q.length-60);
  HF.save();
  toast({came:'No worries. Pick it up when you can 👊',break:'Rest well. Bara will be here 🔔',dislike:'Thanks, we\'ll use that to pick better moves',
         hard:'Noted. Try an easier one next time, you\'ll get there 💪',easy:'Noted. Time for something harder 🔥'}[r]||'Saved');
  plCloseNow();
}
function plCloseNow(){
  const back=pl&&pl.meta&&pl.meta.pid;
  /* Closing a T42 workout returns to T42, not to Home. Dropping someone on
     the home tab after the session their challenge asked for is the app
     losing their place for them. */
  const t42=pl&&pl.meta&&pl.meta.t42day;
  const aic=pl&&pl.meta&&pl.meta.aic;
  const lb=pl&&pl.meta&&pl.meta.lb, pl0=pl&&pl.meta;
  exitPlayer();
  if(lb && typeof lbAfterSession==='function') return lbAfterSession(lb);
  const d6=pl0&&pl0.d6;
  if(d6 && typeof d6AfterSession==='function') return d6AfterSession(d6);
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
  $('pl-rds').textContent=PL_MIRROR?'Choose Your View':'';
  if(!PL_MIRROR && $('pl-rds')) $('pl-rds').innerHTML='<div class="pl-chips"><span><b>'+Math.max(1,Math.round(secs/60))+'</b> min</span><span><b>'+n+'</b> '+(n===1?'exercise':'exercises')+'</span><span><b>'+rd+'</b> '+(rd===1?'round':'rounds')+'</span></div>';
  if($('pl-rdf')) $('pl-rdf').textContent='Up first: '+pl.exs[0].n;
}
function plReady(){
  plReadyText();
  $('pl-modes').style.display=PL_MIRROR?'flex':'none';
  $('pl-rdgo').style.display='block';
  $('pl-rdgo').textContent=PL_MIRROR?'Let\'s Go':'Start workout';
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
  if(!PL_MIRROR) return plStart();
  plAskCam(()=>plStart());
}
function plStart(){
  if(pl) pl.started=true;
  $('pl-ready').classList.remove('on','busy');
  $('play').classList.remove('rdy');
  plCountdown(()=>plResume());
}
/* Landscape, as Simple offers it: full screen and locked sideways where the
   browser allows (Android); an iPhone turns the page itself when the phone
   is turned, and the CSS lays the player out for it. */
function plRotate(){
  const so=(typeof screen!=='undefined')&&screen.orientation, el=$('play');
  const land=so && /landscape/.test(so.type||'');
  if(land){ plUnrotate(); return; }
  const lock=()=>so.lock('landscape').catch(()=>toast('Turn your phone sideways for landscape'));
  if(so && so.lock){
    const fs=el && (el.requestFullscreen||el.webkitRequestFullscreen);
    if(fs && !document.fullscreenElement){ Promise.resolve(fs.call(el)).then(lock,()=>lock()); }
    else lock();
  } else toast('Turn your phone sideways for landscape');
}
function plUnrotate(){
  try{ const so=(typeof screen!=='undefined')&&screen.orientation; if(so && so.unlock) so.unlock(); }catch(e){}
  try{ if(document.fullscreenElement && document.exitFullscreen) document.exitFullscreen(); }catch(e){}
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

