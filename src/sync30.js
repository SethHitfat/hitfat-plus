/* ── HITFAT SYNC 30 (13 Nov 2026; the 30-day program page 17 Nov) ──
   Seth, 13 Nov: "dia asing, dia dalam HITFAT Plus, tapi dia kena beli … harga tu nanti",
   then the model ("ni terbaik"), the 15-minute pilot ("semua okay"), levels "Easy · Medium · Hard"
   and "3, ya" (put it in the app). 14 Nov: "ok" to 10 sessions over 30 days in three phases.
   17 Nov: "buat satu interface khas dulu … lepas tu barulah kita masukkan satu video per video".
   One session is one video made in _projek/sync: the coach's voice, the music and the moves on one
   timeline, so the app only plays it. Every rep is counted aloud ("Down… Up! ONE!"); timed moves get
   energy, not counting. 10 sessions × 3 levels = 30 videos, each 15 minutes.
   Sold on its own: HITFAT+ does NOT include it (the first program like that). Until it has a price it is
   kept out of PROGRAMS, the Store and checkout; testers see it on Home and own it for testing. */
const SYNC_ID='sync30', SYNC_NAME='HITFAT SYNC 30', SYNC_N=30, SYNC_MIN=15;
const SYNC_LIVE=false, SYNC_TESTERS=['sethnasser1991@gmail.com'];
/* Vimeo "id" or "id/hash" for each of the 30 videos, filled one by one as Seth uploads them.
   Key: s<session>_<level>. An empty one shows "Video akan datang" on every day that uses it. */
const SYNC_VIDEO={
  s1_easy:'', s1_medium:'', s1_hard:'',
  s2_easy:'', s2_medium:'', s2_hard:'',
  s3_easy:'', s3_medium:'', s3_hard:'',
  s4_easy:'', s4_medium:'', s4_hard:'',
  s5_easy:'', s5_medium:'', s5_hard:'',
  s6_easy:'', s6_medium:'', s6_hard:'',
  s7_easy:'', s7_medium:'', s7_hard:'',
  s8_easy:'', s8_medium:'', s8_hard:'',
  s9_easy:'', s9_medium:'', s9_hard:'',
  s10_easy:'', s10_medium:'', s10_hard:''
};
const SYNC_PIC='/img/p/sync/hero.jpg?v=2';
const SYNC_LEVELS=[
  {k:'easy',   n:'Easy',   s:'Gentle, no jumping. 6–8 reps, 25 s rest.'},
  {k:'medium', n:'Medium', s:'Full tempo. 10–12 reps, 15 s rest.'},
  {k:'hard',   n:'Hard',   s:'More reps, longer holds, 10 s rest.'}
];
/* the 10 sessions (the whole page in English, Seth 17 Nov: "nama training semua english", then "semua … English … day 1, day 2"); moves per level as "warm up / one round (×3) / finisher", read from the rendered
   timelines in _projek/sync so the page lists exactly what the video plays */
const SYNC_S=[
  {n:'Full Body',     s:'Full-body basics', m:{easy:'High Knee 40s/Squat ×8|Push Up ×6|Mountain Climber 25s|Plank 25s/Wall Sit 30s', medium:'High Knee 40s|Jumping Jack 40s/Squat ×12|Push Up ×10|Mountain Climber 30s|Plank 30s/Wall Sit 40s|Burpee ×8', hard:'High Knee 40s|Jumping Jack 40s/Squat ×12|Push Up ×12|Mountain Climber 40s|Plank 40s/Wall Sit 45s|Burpee ×10'}},
  {n:'Legs',          s:'Lunges, squats and jumps', m:{easy:'Butt Kick 40s/Reverse Lunges ×8|Squat Pause ×8|Fast Feet 25s|Squat Hold 25s/Calf Raises ×8|Squat Pause ×8', medium:'Butt Kick 40s|Jumping Jack 40s/Reverse Lunges ×12|Squat Pause ×12|Fast Feet 25s|Squat Hold 25s/Calf Raises ×12|Squat Jump ×10', hard:'Butt Kick 40s|Jumping Jack 40s/Reverse Lunges ×12|Squat Pause ×12|Fast Feet 30s|Squat Hold 30s/Calf Raises ×12|Squat Jump ×12'}},
  {n:'Upper Body + Core', s:'Chest, arms and abs', m:{easy:'High Knee 40s|Plank Shoulder Tap 40s/Knee Push Up ×6|Tricep Dip ×6|Plank Shoulder Tap 25s|Crunch ×8/Russian Twist 30s|Plank 30s', medium:'High Knee 40s|Plank Jack 40s/Push Up ×10|Tricep Dip ×10|Plank Shoulder Tap 30s|Crunch ×12/Russian Twist 40s|Plank 40s', hard:'High Knee 40s|Plank Jack 40s/Push Up ×12|Tricep Dip ×12|Plank Shoulder Tap 35s|Crunch ×12/Russian Twist 40s|Plank 40s'}},
  {n:'Full Body 2',   s:'Full body, new moves', m:{easy:'Butt Kick 40s/Squat ×8|Incline Push Up ×6|Mountain Climber 25s|Sit Up ×8/Wall Sit 30s|Half Burpee ×6', medium:'Jumping Jack 40s|Butt Kick 40s/Squat ×12|Wide Push Up ×10|Mountain Climber 30s|Sit Up ×12/Wall Sit 40s|Half Burpee ×8', hard:'Jumping Jack 40s|Butt Kick 40s/Squat ×12|Wide Push Up ×12|Mountain Climber 35s|Sit Up ×12/Wall Sit 40s|Half Burpee ×10'}},
  {n:'Legs + Cardio', s:'Strong legs, fast heart', m:{easy:'High Knee 40s|Fast Feet 40s/Alternating Lunges ×8|Squat Pause ×8|Fast Feet 25s|Wall Sit 25s/Side Lunges ×8|Half Burpee ×6', medium:'High Knee 40s|Fast Feet 40s/Alternating Lunges ×12|Squat Jump ×10|Skater Jump 30s|Wall Sit 30s/Side Lunges ×12|Burpee ×8', hard:'High Knee 40s|Fast Feet 40s/Alternating Lunges ×12|Squat Jump ×12|Skater Jump 35s|Wall Sit 35s/Side Lunges ×12|Burpee ×10'}},
  {n:'Core',          s:'Abs and waist', m:{easy:'Butt Kick 40s|Plank Shoulder Tap 40s/Crunch ×8|Leg Raises ×8|Flutter Kick 25s|Side Plank 25s/Hollow Hold 30s|Bicycle Crunch 30s', medium:'Jumping Jack 40s|Plank Jack 40s/Crunch ×12|Leg Raises ×12|Flutter Kick 30s|Side Plank 30s/Hollow Hold 40s|Bicycle Crunch 40s', hard:'Jumping Jack 40s|Plank Jack 40s/Crunch ×12|Leg Raises ×12|Flutter Kick 35s|Side Plank 35s/Hollow Hold 40s|Bicycle Crunch 40s'}},
  {n:'Push',          s:'Chest, shoulders and triceps', m:{easy:'High Knee 40s|Butt Kick 40s/Knee Push Up ×6|Push Up Shoulder Tap 25s|Tricep Dip ×6/Push Up Hold 30s|Plank Shoulder Tap 30s', medium:'High Knee 40s|Jumping Jack 40s/Push Up ×10|Diamond Push Up ×10|Push Up Shoulder Tap 30s|Tricep Dip ×10/Push Up Hold 40s|Plank Jack 40s', hard:'High Knee 40s|Jumping Jack 40s/Push Up ×12|Diamond Push Up ×12|Push Up Shoulder Tap 40s|Tricep Dip ×12/Push Up Hold 45s|Plank Jack 45s'}},
  {n:'Leg Power',     s:'Legs, glutes and jumps', m:{easy:'Butt Kick 40s|High Knee 40s/Curtsy Lunges ×8|Squat Pause ×8|Reverse Lunges ×8|Squat Hold 25s/Hip Thrust ×8|Squat Pause ×8', medium:'Butt Kick 40s|High Knee 40s/Curtsy Lunges ×12|Squat Pause ×12|Jump Lunges ×10|Squat Hold 25s/Hip Thrust ×12|Squat Jump ×10', hard:'Butt Kick 40s|High Knee 40s/Curtsy Lunges ×12|Squat Pause ×12|Jump Lunges ×12|Squat Hold 30s/Hip Thrust ×12|Squat Jump ×12'}},
  {n:'HIIT',          s:'All-out cardio', m:{easy:'Butt Kick 40s|High Knee 40s/Half Burpee ×6|High Knee 25s|Fast Feet 25s|Mountain Climber 25s/Butt Kick 30s|Squat Pause ×8', medium:'Jumping Jack 40s|High Knee 40s/Burpee ×8|High Knee 30s|Skater Jump 30s|Mountain Climber 30s/Butt Kick 40s|Squat Jump ×10', hard:'Jumping Jack 40s|High Knee 40s/Burpee ×10|High Knee 35s|Skater Jump 35s|Mountain Climber 35s/Butt Kick 40s|Squat Jump ×12'}},
  {n:'Final Test',    s:'See how far you have come', m:{easy:'High Knee 40s|Butt Kick 40s/Squat ×8|Knee Push Up ×6|Half Burpee ×6|Plank 25s/Wall Sit 30s|High Knee 30s', medium:'High Knee 40s|Jumping Jack 40s/Squat ×12|Push Up ×10|Burpee ×8|Plank 30s/Wall Sit 40s|High Knee 40s', hard:'High Knee 40s|Jumping Jack 40s/Squat ×12|Push Up ×12|Burpee ×10|Plank 40s/Wall Sit 45s|High Knee 45s'}}
];
/* 30 days in three phases (Seth, 14 Nov): each phase repeats its sessions three times */
const SYNC_PHASES=[
  {n:'Phase 1', t:'Foundation', s:[1,2,3], from:1,  to:9},
  {n:'Phase 2', t:'Build', s:[4,5,6], from:10, to:18},
  {n:'Phase 3', t:'Strong', s:[7,8,9,10], from:19, to:30}
];
function syPhase(day){ return SYNC_PHASES.find(p=>day>=p.from && day<=p.to)||SYNC_PHASES[0]; }
function sySession(day){ const p=syPhase(day); return p.s[(day-p.from)%p.s.length]; }   /* 1–10 */
function syKey(sn,lv){ return 's'+sn+'_'+lv; }

function syTester(){ return SYNC_TESTERS.indexOf(String(HF.email||'').toLowerCase())>=0; }
/* bought on its own: never through contentOpen()/hasPlus() */
function syOwned(){ return (typeof owns==='function' && owns('prog_'+SYNC_ID)) || syTester(); }
function syLive(){ return SYNC_LIVE || syOwned(); }
function syData(){
  const d=HF.data.sync||(HF.data.sync={}); d.log=d.log||[]; d.level=d.level||'medium';
  /* days done: {day: {lv, at}}; the first testers' sessions were counted in order, so session n was day n */
  if(!d.days){ d.days={}; d.log.forEach(x=>{ if(x.n>=1 && x.n<=SYNC_N && !d.days[x.n]) d.days[x.n]={lv:x.lv, at:x.at}; }); }
  return d;
}
function syDone(){ return Object.keys(syData().days).length; }
function syNext(){ const dd=syData().days; for(let i=1;i<=SYNC_N;i++) if(!dd[i]) return i; return SYNC_N; }
function syLevel(k){ return SYNC_LEVELS.find(l=>l.k===k)||SYNC_LEVELS[1]; }
function syReady(sn,lv){ return !!SYNC_VIDEO[syKey(sn,lv)]; }
function syVideos(){ return Object.keys(SYNC_VIDEO).filter(k=>SYNC_VIDEO[k]).length; }

/* ── Home: a tile in "Program & Kursus" for testers ── */
function syHomeTile(){
  if(!syLive() || typeof hpoTile!=='function') return '';
  const n=syDone();
  return hpoTile({t:'HITFAT SYNC', kick:n?'Day '+Math.min(n+1,SYNC_N)+' / '+SYNC_N:'New · '+SYNC_N+' days', lv:'Coach in your ear · move to the beat', pal:'red', img:SYNC_PIC, pos:'50% 35%', go:'syOpen()'});
}

const SYNC_COL=['#FF2E43','#FF7A1A','#7C5CFF','#E9418F','#14B8A6','#3B82F6','#F59E0B','#C81E3A','#B44DFF','#E5B800'];
const SY_I={
  play:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/></svg>',
  prev:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5h2v14H6zM19 6.2v11.6a1 1 0 0 1-1.55.83L9.5 13.2a1.4 1.4 0 0 1 0-2.4l7.95-5.43A1 1 0 0 1 19 6.2z"/></svg>',
  next:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 5h2v14h-2zM5 6.2v11.6a1 1 0 0 0 1.55.83l7.95-5.43a1.4 1.4 0 0 0 0-2.4L6.55 5.37A1 1 0 0 0 5 6.2z"/></svg>',
  ok:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.5 16.2 5.3 12l-1.4 1.4 5.6 5.6 11-11-1.4-1.4z"/></svg>',
  down:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.4 8.6 12 14.2l5.6-5.6L19 10l-7 7-7-7z"/></svg>',
  back:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.4 6.4 9.8 12l5.6 5.6L14 19l-7-7 7-7z"/></svg>'
};
let _syS=0, _syIn=false, _syPh=0;   /* the day open full screen (0 = none); _syIn = slide it up this render; _syPh = the phase tab (0 = the next day's) */
function syOpen(){
  syClose(); _syS=0; _syPh=0;
  const o=document.createElement('div'); o.id='syv'; o.className='sy';
  document.body.appendChild(o); syRender(true);
}
function syClose(){ const o=$('syv'); if(o&&o.parentNode) o.parentNode.removeChild(o); _syS=0; }
function syPick(k){ syData().level=k; HF.save(); syRender(); }
function syDay(n){ _syIn=!_syS; _syS=Math.max(1,Math.min(SYNC_N,n)); syRender(); _syIn=false; }
function syShut(){ _syS=0; syRender(); }
/* the big play button: plays the next day, or opens it when its video is not up yet */
function syGo(){ syDayPlay(syNext()); }
function syDaysOf(sn){ const r=[]; for(let i=1;i<=SYNC_N;i++) if(sySession(i)===sn) r.push(i); return r; }
function sySessionDay(sn){ const dd=syData().days, r=syDaysOf(sn); return r.find(i=>!dd[i])||r[0]; }
/* ── the page. 17 Nov, Seth: "style Spotify … YouTube Music", then a screen recording of Spotify's own
   workout videos: "aku nk ko tgk spotify betul, pastu try fikir n tiruvasi". Taken from it: the coach photo
   full width with the title big across it and the header tinted below; the days as episodes (a 16:9 frame,
   the name, a line on what is in it, "15 min" or "8 min left" with its bar, a play button); a day opens like
   an episode page: the video frame on top, the day and phase in colour, the big title, ⏮ ⏭ and play, and
   "Chapters" (warm up, the three rounds, finisher) that start the video right there. Our own on top: the
   three phases as tabs so a phase fits on a screen, every move with its technique cue under the chapters
   (a tap plays that move), carrying on where you stopped, and the posters kept as the sessions shelf. ── */
const SYNC_HERO='/img/p/sync/w0.jpg?v=1';
function syWide(sn){ return '/img/p/sync/v'+sn+'.jpg?v=1'; }    /* 960×540, the coach on the session's colour */
function syThumb(sn){ return '/img/p/sync/t'+sn+'.jpg?v=1'; }   /* 400×225 */
/* 17 Nov, two more Spotify recordings from Seth ("yang ini sekali"): its featured class plays itself, muted, in
   a 16:9 card, and the episode page shows the video. Ours loop a 6-second silent clip of the session (its first
   move of round 1, made by _projek/sync/tools/sync_previews.py, ~90 KB); still frame when motion is reduced. */
function syPrev(sn){
  let still=false; try{ still=window.matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(e){}
  return '<video class="sy-pv" src="/img/p/sync/p'+sn+'.mp4?v=1" poster="'+syWide(sn)+'" muted loop playsinline preload="metadata"'+(still?'':' autoplay')+' aria-hidden="true"></video>';
}
/* each session's poster (17 Nov, Seth: "gambar coach tu ai xpe, cantik sikit", "masuk"): the coach in studio light in the
   session's colour, its English name on it. Made in _projek/sync (tools/poster_sync_ai.html), 720 px. */
const SYNC_ART='/img/p/sync/cover.jpg?v=2';
function syArt(sn){ return '/img/p/sync/s'+sn+'.jpg?v=2'; }
function syCover(sn,cls){
  return '<div class="sy-cv'+(cls?' '+cls:'')+'" role="img" aria-label="'+hesc(SYNC_S[sn-1].n)+'" style="--c:'+SYNC_COL[sn-1]+';background-image:url(\''+syArt(sn)+'\')"></div>';
}
const SY_EQ='<i class="sy-eq"><i></i><i></i><i></i></i>';
/* where a day was stopped part way (only the last one), so its play button carries on from there */
function syPos(day){ const d=syData(), p=d.pos; return p && p.day===day && p.lv===d.level ? p : null; }
function syLeft(p){ return Math.max(1,Math.round((p.dur-p.t)/60))+' min left'; }
function syPbar(p){ return '<i class="sy-pb"><b style="width:'+Math.min(100,p.t/p.dur*100).toFixed(1)+'%"></b></i>'; }
function sySoon(day){ const sn=sySession(day); if(typeof toast==='function') toast(SYNC_S[sn-1].n+' ('+syLevel(syData().level).n+'): video coming soon'); }
/* a play button: plays the day (from where it was stopped), or says its video is not up yet */
function syDayPlay(day){
  const p=syPos(day);
  if(syReady(sySession(day),syData().level)) syPlay(day,p?p.t:0); else if(_syS===day) sySoon(day); else syDay(day);
}
function syPh(k){ _syPh=k; syRender(); }
function syMoveNames(sn,lv){
  const r=[]; String(SYNC_S[sn-1].m[lv]||'').split(/[|/]/).forEach(m=>{ const x=m.replace(/\s+(×\d+|\d+s)$/,'').trim(); if(x && r.indexOf(x)<0) r.push(x); });
  return r;
}
/* the video's chapters from its cues: warm up, round 1–3, finisher, each with when it starts and its moves */
function syChapters(sn,lv){
  const c=SYNC_CUE[syKey(sn,lv)]; if(!c) return [];
  const r=[];
  c.m.forEach(m=>{ let x=r.find(y=>y.k===m[6]); if(!x){ x={k:m[6], t:m[0], moves:[]}; r.push(x); } if(x.moves.indexOf(m[4])<0) x.moves.push(m[4]); });
  if(r.length) r[0].t=0;
  r.forEach((x,i)=>{ x.e=i+1<r.length?r[i+1].t:c.d; });
  return r;
}
function syMin(s){ return Math.max(1,Math.round(s/60))+' min'; }
/* one day as an episode */
function syRow(i){
  const d=syData(), lv=syLevel(d.level), s=sySession(i), S=SYNC_S[s-1], dn=d.days[i], ok=syReady(s,lv.k), nx=i===syNext() && !dn, p=syPos(i);
  const meta=dn?'<span class="sy-ok">'+SY_I.ok+'</span>Done · '+syLevel(dn.lv).n
    : p?syLeft(p)+syPbar(p)
    : SYNC_MIN+' min'+(ok?'':' · Coming soon');
  return '<div class="sy-ep'+(nx?' nx':'')+(dn?' done':'')+(ok?'':' soon')+'">'+
    '<button class="sy-ep-a" onclick="syDay('+i+')">'+
      '<span class="sy-ep-top"><span class="sy-th" style="background-image:url(\''+syThumb(s)+'\')"><i>Day '+i+'</i></span>'+
      '<span class="sy-ep-in"><b>'+(nx?SY_EQ:'')+hesc(S.n)+'</b><small>Day '+i+' · '+lv.n+'</small></span></span>'+
      '<span class="sy-ep-d">'+hesc(S.s)+'. '+hesc(syMoveNames(s,lv.k).join(' · '))+'</span>'+
    '</button>'+
    '<div class="sy-ep-f"><span class="sy-ep-m">'+meta+'</span>'+
      '<button class="sy-ep-p'+(ok?'':' off')+'" aria-label="Play day '+i+'" onclick="syDayPlay('+i+')">'+SY_I.play+'</button></div></div>';
}
function syRender(top){
  const o=$('syv'); if(!o) return;
  const d=syData(), n=syDone(), lv=syLevel(d.level), nxt=syNext(), nsn=sySession(nxt), np=syPos(nxt);
  const pc=(n/SYNC_N*100).toFixed(1), ph=_syPh?SYNC_PHASES[_syPh-1]:syPhase(nxt);
  const chips=(cls)=>'<div class="sy-chips'+(cls?' '+cls:'')+'">'+SYNC_LEVELS.map(l=>'<button class="'+(l.k===lv.k?'on':'')+'" onclick="syPick(\''+l.k+'\')">'+l.n+'</button>').join('')+'</div>';
  let h='<button class="sy-x" aria-label="Close" onclick="syClose()">'+SY_I.back+'</button>'+
    '<div class="sy-hero" role="img" aria-label="HITFAT SYNC 30" style="background-image:url(\''+SYNC_HERO+'\')"><div class="sy-hero-t">HITFAT<br>SYNC 30</div></div>'+
    '<div class="sy-top">'+
      '<div class="sy-s">Your coach in your ear. Every rep counted out loud, right on the beat. '+SYNC_N+' days, '+SYNC_MIN+' minutes a day, no equipment.</div>'+
      '<div class="sy-meta"><span class="sy-logo">H</span><b>HITFAT</b></div>'+
      '<div class="sy-meta2">'+n+' / '+SYNC_N+' days done · 10 sessions · '+SYNC_MIN+' min a day</div>'+
      '<div class="sy-bar"><i style="width:'+pc+'%"></i></div>'+
      '<div class="sy-acts">'+chips()+
        '<button class="sy-play" aria-label="Play day '+nxt+'" onclick="syDayPlay('+nxt+')">'+SY_I.play+'</button></div>'+
      '<div class="sy-lvs">'+hesc(lv.s)+'</div>'+
    '</div>'+
    '<div class="sy-body">';
  /* up next: the featured card, its clip playing */
  h+='<div class="sy-h2">'+(n?'Up next':'Start here')+'</div>'+
    '<div class="sy-ft"><button class="sy-ft-v" aria-label="Open day '+nxt+'" onclick="syDay('+nxt+')">'+syPrev(nsn)+
      '<span class="sy-np-vt">'+(np?syLeft(np):SYNC_MIN+':00')+'</span>'+(np?syPbar(np):'')+'</button>'+
    '<div class="sy-ft-i">'+syCover(nsn,'xs')+'<button class="sy-ft-t" onclick="syDay('+nxt+')"><b>Day '+nxt+' · '+hesc(SYNC_S[nsn-1].n)+'</b>'+
      '<small>'+syPhase(nxt).n+' · '+syPhase(nxt).t+' · '+lv.n+'</small></button>'+
      '<button class="sy-ep-p'+(syReady(nsn,lv.k)?'':' off')+'" aria-label="Play day '+nxt+'" onclick="syDayPlay('+nxt+')">'+SY_I.play+'</button></div></div>';
  /* the 30 days as episodes, one phase at a time */
  const pd=Object.keys(d.days).filter(x=>x>=ph.from && x<=ph.to).length;
  h+='<div class="sy-pt">'+SYNC_PHASES.map((p,k)=>'<button class="'+(p===ph?'on':'')+'" onclick="syPh('+(k+1)+')">'+p.t+'</button>').join('')+'</div>'+
    '<div class="sy-pt-s">'+ph.n+' · Days '+ph.from+'–'+ph.to+' · '+pd+' of '+(ph.to-ph.from+1)+' done</div><div class="sy-eps">';
  for(let i=ph.from;i<=ph.to;i++) h+=syRow(i);
  h+='</div>';
  /* the 10 sessions: the posters, a shelf that scrolls sideways */
  h+='<div class="sy-h2">Choose your own workout</div><div class="sy-shelf">';
  SYNC_S.forEach((S,i)=>{
    const sn=i+1, ds=syDaysOf(sn), dn=ds.filter(x=>d.days[x]).length;
    h+='<button class="sy-al'+(syReady(sn,lv.k)?'':' soon')+'" onclick="syDay('+sySessionDay(sn)+')">'+syCover(sn)+
      '<b>'+hesc(S.s)+'</b><small>Days '+ds.join(', ')+(dn?' · '+dn+'/'+ds.length+' ✓':'')+'</small></button>';
  });
  h+='</div>';
  h+='<div class="sy-h2">About the program</div><div class="sy-how">'+
      '<div><span>'+glyph('play')+'</span><p><b>Down… Up! ONE!</b> Every rep is counted out loud, right on the beat of the music.</p></div>'+
      '<div><span>'+glyph('bolt')+'</span><p><b>Timed moves</b> (high knees, plank…): your coach keeps you going until "3, 2, 1, Stop!"</p></div>'+
      '<div><span>'+glyph('target')+'</span><p><b>Put your earphones in</b> and turn it up. No equipment, just a chair for tricep dips.</p></div></div>';
  if(syVideos()<SYNC_N) h+='<div class="sy-note">'+syVideos()+' / '+SYNC_N+' videos ready. The rest are added one by one.</div>';
  h+='</div>';
  /* the mini player: the next day, always one tap away */
  if(!_syS) h+='<div class="sy-mini" style="--c:'+SYNC_COL[nsn-1]+'" onclick="syDay('+nxt+')"><span class="sy-th sm" style="background-image:url(\''+syThumb(nsn)+'\')"></span>'+
      '<div class="sy-mini-in"><b>Day '+nxt+' · '+hesc(SYNC_S[nsn-1].n)+'</b><small>'+(np?syLeft(np):'Up next')+' · '+lv.n+' · '+SYNC_MIN+' min</small></div>'+
      '<button class="sy-mini-p" aria-label="Play" onclick="event.stopPropagation();syDayPlay('+nxt+')">'+SY_I.play+'</button>'+
      '<i class="sy-mini-bar" style="width:'+(np?(np.t/np.dur*100).toFixed(1):pc)+'%"></i></div>';
  /* a bar that slides in once the header has scrolled away */
  h+='<div class="sy-tb" id="sy-tb" style="--c:'+SYNC_COL[0]+'"><b>HITFAT SYNC 30</b>'+
    '<button class="sy-tb-p" aria-label="Play day '+nxt+'" onclick="syDayPlay('+nxt+')">'+SY_I.play+'</button></div>';
  if(_syS) h+=sySheet(_syS);
  const old=$('sy-np'), keepNp=old && !_syIn ? old.scrollTop : 0, keep=top?0:o.scrollTop;
  o.innerHTML=h; o.scrollTop=keep;
  const tb=$('sy-tb'), hero=o.querySelector('.sy-hero'), hh=Math.min(o.clientWidth,440);
  const on=()=>{ const st=o.scrollTop; if(tb) tb.classList.toggle('on', st>hh-60); if(hero) hero.style.setProperty('--f', Math.min(1,Math.max(0,st/hh)).toFixed(3)); };
  o.onscroll=on; on();
  const np2=$('sy-np'), nb=$('sy-npb');
  if(np2){ np2.scrollTop=keepNp; const on2=()=>{ if(nb) nb.classList.toggle('on', np2.scrollTop>260); }; np2.onscroll=on2; on2(); }
}
/* one day, like an episode page */
function sySheet(day){
  const d=syData(), lv=syLevel(d.level), sn=sySession(day), S=SYNC_S[sn-1], ph=syPhase(day), dn=d.days[day], ok=syReady(sn,lv.k), p=syPos(day);
  const go='syDayPlay('+day+')', cue=SYNC_CUE[syKey(sn,lv.k)], ch=syChapters(sn,lv.k);
  const names=syMoveNames(sn,lv.k), chair=names.some(x=>/Tricep Dip|Incline Push Up/.test(x));
  const meta=dn?'<span class="sy-ok">'+SY_I.ok+'</span>Done · '+syLevel(dn.lv).n+' · '+String(dn.at||'').slice(0,10)
    : p?syLeft(p)+syPbar(p)
    : lv.n+' · '+SYNC_MIN+' min'+(ok?'':' · Video coming soon');
  let h='<div class="sy-np'+(_syIn?' in':'')+'" id="sy-np" style="--c:'+SYNC_COL[sn-1]+'">'+
    '<div class="sy-npb" id="sy-npb"><button class="sy-np-x" aria-label="Back" onclick="syShut()">'+SY_I.back+'</button><b>'+hesc(S.n)+'</b>'+
      '<button class="sy-tb-p'+(ok?'':' off')+'" aria-label="Play" onclick="'+go+'">'+SY_I.play+'</button></div>'+
    '<button class="sy-np-v" aria-label="Play day '+day+'" onclick="'+go+'">'+syPrev(sn)+
      '<span class="sy-np-vp'+(ok?'':' off')+'">'+SY_I.play+'</span><span class="sy-np-vt">'+(p?syLeft(p):SYNC_MIN+':00')+'</span>'+(p?syPbar(p):'')+'</button>'+
    '<div class="sy-np-k">Day '+day+' of '+SYNC_N+' · '+ph.n+' · '+ph.t+'</div>'+
    '<div class="sy-np-t">'+hesc(S.n)+'</div>'+
    '<div class="sy-np-o">'+syCover(sn,'xs')+'<b>HITFAT SYNC 30</b></div>'+
    '<div class="sy-np-m">'+meta+'</div>'+
    '<div class="sy-np-a">'+
      '<button class="sy-np-i" aria-label="Previous day" '+(day>1?'onclick="syDay('+(day-1)+')"':'disabled')+'>'+SY_I.prev+'</button>'+
      '<button class="sy-np-i" aria-label="Next day" '+(day<SYNC_N?'onclick="syDay('+(day+1)+')"':'disabled')+'>'+SY_I.next+'</button>'+
      '<span></span><button class="sy-play'+(ok?'':' off')+'" aria-label="Play" onclick="'+go+'">'+SY_I.play+'</button></div>'+
    '<div class="sy-chips">'+SYNC_LEVELS.map(l=>'<button class="'+(l.k===lv.k?'on':'')+'" onclick="syPick(\''+l.k+'\')">'+l.n+'</button>').join('')+'</div>'+
    '<p class="sy-np-d">'+hesc(S.s)+'. '+hesc(lv.s)+' '+(chair?'You need a chair.':'No equipment needed.')+' Earphones in and turn it up.</p>';
  if(ch.length){
    h+='<div class="sy-np-h">Chapters</div>';
    ch.forEach(c=>{
      const cur=p && p.t>=c.t && p.t<c.e;
      h+='<button class="sy-chp'+(cur?' now':'')+'" onclick="'+(ok?'syPlay('+day+','+c.t+')':'sySoon('+day+')')+'">'+
        '<span class="sy-th xs" style="background-image:url(\''+syThumb(sn)+'\')"><i>'+syTime(c.t)+'</i></span>'+
        '<span class="sy-chp-in"><b>'+(cur?SY_EQ:'')+SY_RND[c.k]+'</b><small>'+syMin(c.e-c.t)+' · '+hesc(c.moves.join(' · '))+'</small></span></button>';
    });
  }
  /* every move once, with what to think about; a tap plays that move */
  h+='<div class="sy-np-h">Moves &amp; technique</div><div class="sy-mvs">';
  if(cue){
    const seen={}; let k=0;
    cue.m.forEach(m=>{
      if(seen[m[4]]) return; seen[m[4]]=1; k++;
      h+='<button class="sy-mv" onclick="'+(ok?'syPlay('+day+','+m[0]+')':'sySoon('+day+')')+'"><span class="sy-mv-n">'+k+'</span>'+
        '<span class="sy-mv-in"><b>'+hesc(m[4])+'</b><small>'+hesc(SYNC_TIP[m[4]]||'')+'</small></span><em>'+(m[3]==='r'?'×'+m[5]:m[5]+'s')+'</em></button>';
    });
  } else names.forEach((x,k)=>{ h+='<div class="sy-mv"><span class="sy-mv-n">'+(k+1)+'</span><span class="sy-mv-in"><b>'+hesc(x)+'</b><small>'+hesc(SYNC_TIP[x]||'')+'</small></span></div>'; });
  h+='</div><button class="sy-np-all" onclick="syShut()">See all '+SYNC_N+' days<span>›</span></button></div>';
  return h;
}

/* ── the player (17 Nov, Seth: "konsep Spotify", "lebih kepada orang nak faham teknik", "buat sekarang") ──
   1 the video full screen and clean, a thin progress line and a "Moves" pill;
   2 a tap shows the controls: the bar marked at each round, time gone and left, ⟲ 10 s, ⏮ ⏭ to the
     previous or next move, play/pause;
   3 "Moves" opens the moves like a song's lyrics: they follow the video, the one being done is big
     with its live count and a technique cue, a tap on any move jumps there.
   The times come from each video's own timeline (SYNC_CUE, written by tools/sync_cues.py). The video is
   Vimeo ("id" or "id/hash"), or a direct .mp4 address. */
let _sy=null;   /* {day, sn, lv, key, sid, t, dur, last, watched, playing, started, cur, ui, ly, done} */
const SY_RND=['Warm up','Round 1 of 3','Round 2 of 3','Round 3 of 3','Finisher'];
const SY_P={
  pause:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>',
  back:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5V2L7 6.5 12 11V7.5a5.5 5.5 0 1 1-5.5 5.5H4a8 8 0 1 0 8-8z"/><text x="12" y="16.2" font-size="6.4" font-weight="800" text-anchor="middle" font-family="Inter,Arial,sans-serif">10</text></svg>',
  up:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.4 15.4 12 9.8l5.6 5.6L19 14l-7-7-7 7z"/></svg>',
  full:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h6v2H6v4H4zm10 0h6v6h-2V6h-4zM4 14h2v4h4v2H4zm14 0h2v6h-6v-2h4z"/></svg>'
};
function syIsFile(v){ return /^(https?:\/\/|\/).+\.mp4(\?|$)/i.test(String(v)); }
function syVimeo(v){
  const p=String(v).split('/');
  return 'https://player.vimeo.com/video/'+p[0]+'?'+(p[1]?'h='+p[1]+'&':'')+'autoplay=1&controls=0&title=0&byline=0&portrait=0&dnt=1&playsinline=1&autopause=0&texttrack=false';
}
function syTime(s){ s=Math.max(0,Math.round(s||0)); return Math.floor(s/60)+':'+String(s%60).padStart(2,'0'); }
function syCues(){ const c=_sy&&SYNC_CUE[_sy.key]; return c?c.m:[]; }
function syPlay(n,at){
  const lv=syData().level, day=n||syNext(), sn=sySession(day), key=syKey(sn,lv); if(!syReady(sn,lv)) return;
  syStop(true); at=Math.max(0,+at||0);
  const pos=syPos(day);   /* carrying on: what was already played still counts towards finishing */
  const cue=SYNC_CUE[key], src=SYNC_VIDEO[key];
  _sy={day:day, sn:sn, lv:lv, key:key, sid:null, at:at, t:at, dur:cue?cue.d:0, last:at, watched:pos&&at?pos.w||0:0, playing:false, started:false, cur:-2, ui:false, ly:false, done:false};
  const S=SYNC_S[sn-1], ms=syCues();
  const media=syIsFile(src)
    ? '<video id="syp-vid" src="'+hesc(src)+'" playsinline autoplay preload="auto"></video>'
    : '<iframe src="'+syVimeo(src)+(at?'#t='+Math.floor(at)+'s':'')+'" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen title="HITFAT SYNC"></iframe>';
  let marks='', lines='', r=-1;
  ms.forEach((m,i)=>{
    if(m[6]!==r){ r=m[6]; lines+='<div class="syp-lr">'+SY_RND[r]+'</div>'; if(i && _sy.dur) marks+='<i style="left:'+(m[0]/_sy.dur*100).toFixed(2)+'%"></i>'; }
    lines+='<button class="syp-ln" id="syp-ln'+i+'" onclick="syJump('+i+')"><b>'+hesc(m[4])+'</b><span>'+(m[3]==='r'?'×'+m[5]:m[5]+'s')+'</span><em></em><small>'+hesc(SYNC_TIP[m[4]]||'')+'</small></button>';
  });
  const bar=(id)=>'<div class="syp-bar" onclick="sySeekBar(event,this)"><div class="syp-track">'+marks+'<b id="'+id+'"></b></div></div>'+
    '<div class="syp-tm"><span class="syp-t0">0:00</span><span class="syp-chn">Warm up</span><span class="syp-t1">−'+syTime(_sy.dur)+'</span></div>';
  const play='<button class="syp-pp" aria-label="Play or pause" onclick="syToggle()">'+SY_I.play+'</button>';
  const o=document.createElement('div'); o.id='syp'; o.style.setProperty('--c',SYNC_COL[sn-1]);
  o.innerHTML=
    '<div class="syp-bg" style="background-image:url(\''+syArt(sn)+'\')"></div>'+
    '<div class="syp-v">'+media+'<div class="syp-tap" onclick="syTap()"></div></div>'+
    '<div class="syp-cover"><div class="sy-cv lg" style="background-image:url(\''+syArt(sn)+'\')"></div>'+
      '<b>Day '+day+' · '+hesc(S.n)+'</b><small>'+syLevel(lv).n+' · '+SYNC_MIN+' min · Get ready</small><i class="syp-spin"></i></div>'+
    '<div class="syp-dim" onclick="syTap()"></div>'+
    '<div class="syp-top"><button class="syp-ic" aria-label="Close" onclick="syStop()">'+SY_I.down+'</button>'+
      '<div><small>Playing · Day '+day+' / '+SYNC_N+'</small><b>HITFAT SYNC 30</b></div><span></span></div>'+
    '<div class="syp-bot"><div class="syp-hd">'+syCover(sn,'xs')+'<div><div class="syp-ti">'+hesc(S.n)+'</div><div class="syp-su" id="syp-su">'+syLevel(lv).n+' · '+SYNC_MIN+' min</div></div>'+
      '<button class="syp-skip" id="syp-skip" onclick="sySkip()">'+SY_I.next+'<span>Skip ahead</span></button></div>'+
      bar('syp-b1')+
      '<div class="syp-ctl"><button class="syp-ic" aria-label="Back 10 seconds" onclick="sySeek(_sy.t-10)">'+SY_P.back+'</button>'+
        '<button class="syp-ic" aria-label="Previous move" onclick="syStep(-1)">'+SY_I.prev+'</button>'+play+
        '<button class="syp-ic" aria-label="Next move" onclick="syStep(1)">'+SY_I.next+'</button>'+
        '<button class="syp-ic syp-fs" aria-label="Full screen" onclick="syFull()">'+SY_P.full+'</button></div>'+
      '<button class="syp-chip" onclick="syLy(1)">'+SY_P.up+'Moves</button></div>'+
    '<button class="syp-pill" onclick="syLy(1)">'+SY_P.up+'Moves</button><i class="syp-line"><b id="syp-b0"></b></i>'+
    '<div class="syp-ly"><div class="syp-lybg" style="background-image:url(\''+syArt(sn)+'\')"></div><div class="syp-lyh"><span class="syp-lyv"></span><div><b>'+hesc(S.n)+' · Day '+day+'</b><small>HITFAT SYNC · '+syLevel(lv).n+'</small></div>'+
      '<button class="syp-ic" aria-label="Back to the video" onclick="syLy(0)">'+SY_I.down+'</button></div>'+
      '<div class="syp-lines" id="syp-lines">'+lines+'</div>'+
      '<div class="syp-lyf">'+bar('syp-b2')+'<div class="syp-ctl sm"><button class="syp-ic" aria-label="Previous move" onclick="syStep(-1)">'+SY_I.prev+'</button>'+play+
        '<button class="syp-ic" aria-label="Next move" onclick="syStep(1)">'+SY_I.next+'</button></div></div></div>';
  document.body.appendChild(o);
  if(!(document.fullscreenEnabled||document.webkitFullscreenEnabled)) o.classList.add('nofs');
  const v=$('syp-vid');
  if(v){
    v.addEventListener('timeupdate',()=>syTick(v.currentTime, v.duration));
    v.addEventListener('play',()=>syPlaying(true));
    v.addEventListener('pause',()=>syPlaying(false));
    v.addEventListener('ended',()=>syEnded());
    if(at) v.addEventListener('loadedmetadata',()=>{ try{ v.currentTime=at; }catch(e){} },{once:true});
  }
  try{ if(navigator.wakeLock) navigator.wakeLock.request('screen').then(l=>{ if(_sy) _sy.lock=l; else l.release(); }).catch(()=>{}); }catch(e){}
  setTimeout(()=>{ const c=document.querySelector('#syp .syp-cover'); if(c) c.classList.add('gone'); },3000);
  syUi(true);
}
function syStop(quiet){
  if(_sy && _sy.lock) try{ _sy.lock.release(); }catch(e){}
  /* stopped part way: remember where, so the day's play button carries on from there */
  if(_sy && _sy.started && !_sy.done && _sy.dur && _sy.t>20 && _sy.t<_sy.dur-20){
    const d=syData(); d.pos={day:_sy.day, lv:_sy.lv, t:Math.round(_sy.t), dur:Math.round(_sy.dur), w:Math.round(_sy.watched)}; HF.save();
  }
  try{ if(document.fullscreenElement && document.exitFullscreen) document.exitFullscreen(); }catch(e){}
  const o=$('syp'); if(o&&o.parentNode) o.parentNode.removeChild(o); _sy=null;
  if(!quiet && $('syv')) syRender();
}
function syPost(method,value){
  const f=document.querySelector('#syp iframe'), w=f&&f.contentWindow; if(!w) return;
  try{ w.postMessage(JSON.stringify(value===undefined?{method}:{method,value}),'https://player.vimeo.com'); }catch(e){}
}
function syCmd(m,v){
  const el=$('syp-vid');
  if(el){ try{ if(m==='play') el.play(); else if(m==='pause') el.pause(); else if(m==='setCurrentTime') el.currentTime=v; }catch(e){} return; }
  syPost(m,v);
}
function syToggle(){ if(!_sy) return; syCmd(_sy.playing?'pause':'play'); syShowUi(); }
function sySeek(s){
  if(!_sy) return; s=Math.max(0,Math.min((_sy.dur||1)-1,s));
  _sy.t=s; _sy.last=s; syCmd('setCurrentTime',s); syUi(); syShowUi();
}
function sySeekBar(ev,el){
  if(!_sy || !_sy.dur) return; ev.stopPropagation();
  const r=el.getBoundingClientRect(); sySeek((ev.clientX-r.left)/r.width*_sy.dur);
}
/* ⏮: back to the start of this move, or to the one before it when this one has only just begun */
function syIdx(t){ const ms=syCues(); let i=-1; ms.forEach((m,k)=>{ if(m[0]<=t+0.05) i=k; }); return i; }
function syStep(d){
  if(!_sy) return; const ms=syCues(); if(!ms.length) return sySeek(_sy.t+d*30);
  let i=syIdx(_sy.t);
  if(d<0){ if(i>=0 && _sy.t-ms[i][0]>3) return sySeek(ms[i][0]); i=Math.max(0,i-1); }
  else i=Math.min(ms.length-1,i+1);
  sySeek(ms[i][0]);
}
/* Skip ahead: past the intro to the first move, or past a rest to the next move */
function sySkip(){ if(_sy && _sy.skip!=null){ sySeek(_sy.skip); if(!_sy.playing) syCmd('play'); } }
function syJump(i){ const m=syCues()[i]; if(m){ sySeek(m[0]); if(!_sy.playing) syCmd('play'); } }
function syFull(){
  const o=$('syp'); if(!o) return;
  try{ if(document.fullscreenElement){ document.exitFullscreen(); } else if(o.requestFullscreen){ o.requestFullscreen(); } else if(o.webkitRequestFullscreen){ o.webkitRequestFullscreen(); } }catch(e){}
}
/* the controls show on a tap and hide again after 4 s while the video plays */
function syShowUi(){
  if(!_sy) return; clearTimeout(_sy.hide); _sy.ui=true; syClass();
  _sy.hide=setTimeout(()=>{ if(_sy && _sy.playing && !_sy.ly){ _sy.ui=false; syClass(); } },4000);
}
function syTap(){ if(!_sy) return; if(_sy.ui){ clearTimeout(_sy.hide); _sy.ui=false; syClass(); } else syShowUi(); }
function syLy(on){ if(!_sy) return; _sy.ly=!!on; _sy.ui=false; clearTimeout(_sy.hide); syClass(); _sy.cur=-2; syUi(); }
function syClass(){
  const o=$('syp'); if(!o||!_sy) return;
  o.classList.toggle('ui', _sy.ui || (!_sy.playing && _sy.started && !_sy.ly));
  o.classList.toggle('ly', _sy.ly);
  o.classList.toggle('on', _sy.started);
  o.querySelectorAll('.syp-pp').forEach(b=>b.innerHTML=_sy.playing?SY_P.pause:SY_I.play);
}
function syPlaying(p){
  if(!_sy) return; _sy.playing=p;
  if(p && !_sy.started){ _sy.started=true; sySessionStart(); const c=document.querySelector('#syp .syp-cover'); if(c) c.classList.add('gone'); }
  syClass();
}
/* count only time really played, so skipping to the end is not a session; ⏮ ⏭ and seeking are fine */
function syTick(s,dur){
  if(!_sy) return;
  if(dur) _sy.dur=dur;
  const dt=s-_sy.last; if(dt>0 && dt<3) _sy.watched+=dt; _sy.last=s; _sy.t=s;
  syUi();
  if(_sy.dur && s>=_sy.dur-2 && _sy.watched>=_sy.dur*0.85) syFinish();
}
function syEnded(){ if(_sy && _sy.dur && _sy.watched>=_sy.dur*0.85) syFinish(); else if(_sy){ _sy.playing=false; syClass(); } }
/* the live parts: bars, times, the current move, its count */
function syUi(force){
  if(!_sy) return; const o=$('syp'); if(!o) return;
  const t=_sy.t, d=_sy.dur||1, pc=Math.min(100,t/d*100).toFixed(2)+'%';
  ['syp-b0','syp-b1','syp-b2'].forEach(id=>{ const b=$(id); if(b) b.style.width=pc; });
  o.querySelectorAll('.syp-t0').forEach(e=>e.textContent=syTime(t));
  o.querySelectorAll('.syp-t1').forEach(e=>e.textContent='−'+syTime(d-t));
  const ms=syCues(); if(!ms.length) return;
  const i=syIdx(t), m=ms[i];
  o.querySelectorAll('.syp-chn').forEach(e=>e.textContent=SY_RND[ms[Math.max(0,i)][6]]);
  let skip=null, sk='';
  if(i<0 && ms[0][0]-t>4){ skip=ms[0][0]; sk='Skip intro'; }
  else if(m && t>=m[2] && ms[i+1] && ms[i+1][0]-t>4){ skip=ms[i+1][0]; sk='Skip rest'; }
  _sy.skip=skip;
  const sb=$('syp-skip'); if(sb){ sb.classList.toggle('on',skip!=null); if(sk) sb.querySelector('span').textContent=sk; }
  let live='', state='';
  if(m){
    if(t>=m[2]){ state='rest'; const n=ms[i+1]; live=n?'Next · '+Math.max(0,Math.ceil(n[0]-t))+'s':'Last one done'; }
    else if(t<m[1]){ state='ready'; live='Get ready'; }
    else if(m[3]==='r'){ state='go'; live=m[7].filter(x=>x<=t+0.05).length+' / '+m[5]; }
    else { state='go'; live=Math.max(0,Math.ceil(m[2]-t))+'s left'; }
  }
  /* during a rest the next move is the one to look at */
  const show=state==='rest' && ms[i+1] ? i+1 : i;
  const su=$('syp-su');
  if(su) su.textContent=(ms[show]?SY_RND[ms[show][6]]+' · '+ms[show][4]+' · ':'')+syLevel(_sy.lv).n;
  if(show!==_sy.cur || force){
    _sy.cur=show;
    ms.forEach((x,k)=>{ const ln=$('syp-ln'+k); if(!ln) return; ln.classList.toggle('done',k<show); ln.classList.toggle('now',k===show); });
    const ln=$('syp-ln'+show), box=$('syp-lines');
    if(ln && box && _sy.ly) box.scrollTo({top:Math.max(0,ln.offsetTop-box.clientHeight*0.3), behavior:force?'auto':'smooth'});
  }
  const ln=$('syp-ln'+show); if(ln){ const em=ln.querySelector('em'); if(em) em.textContent=show===i?live:'Next · '+Math.max(0,Math.ceil(ms[show][0]-t))+'s'; }
}
function syOnMessage(ev){
  if(ev.origin!=='https://player.vimeo.com' || !_sy) return;
  let d; try{ d=typeof ev.data==='string'?JSON.parse(ev.data):ev.data; }catch(e){ return; }
  if(!d) return;
  if(d.event==='ready'){ ['timeupdate','play','pause','ended'].forEach(x=>syPost('addEventListener',x)); if(_sy.at) syPost('setCurrentTime',_sy.at); return; }
  if(d.event==='play') syPlaying(true);
  if(d.event==='pause') syPlaying(false);
  if(d.event==='timeupdate' && d.data) syTick(d.data.seconds||0, d.data.duration||0);
  if(d.event==='ended') syEnded();
}
if(typeof window!=='undefined' && window.addEventListener) window.addEventListener('message',syOnMessage);
function syLabel(p){ return 'HITFAT SYNC · Day '+p.day+' · '+SYNC_S[p.sn-1].n+' · '+syLevel(p.lv).n; }
function sySessionStart(){
  try{
    if(!sb || !HF.userId || !_sy) return;
    const p=_sy;
    sb.rpc('plus_session_start',{p_program:SYNC_ID, p_day:p.day-1, p_label:syLabel(p)})
      .then(r=>{ if(r && !r.error && _sy===p) p.sid=r.data; }).catch(()=>{});
  }catch(e){}
}
function syFinish(){
  if(!_sy || _sy.done) return; _sy.done=true;
  const d=syData(), p=_sy, at=new Date().toISOString();
  d.days[p.day]={lv:p.lv, at:at}; if(d.pos && d.pos.day===p.day) delete d.pos;
  d.log.push({n:p.day, s:p.sn, lv:p.lv, at:at});
  HF.markDone(SYNC_ID+'-s'+(p.day-1),{name:syLabel(p), mins:SYNC_MIN});
  try{ if(sb && p.sid){ const id=p.sid; p.sid=null; sb.rpc('plus_session_finish',{p_id:id}).then(()=>{ if(typeof _lbCache!=='undefined') _lbCache={}; }).catch(()=>{}); } }catch(e){}
  const o=$('syp');
  if(o){
    if(_sy.lock) try{ _sy.lock.release(); }catch(e){}
    const el=document.createElement('div'); el.className='sy-done';
    const nx=syNext(), more=Object.keys(d.days).length<SYNC_N;
    el.style.setProperty('--c',SYNC_COL[p.sn-1]);
    el.innerHTML='<div class="sy-done-art"><div class="sy-cv lg" style="background-image:url(\''+syArt(p.sn)+'\')"></div><span class="sy-done-ok">'+SY_I.ok+'</span></div>'+
      '<div class="sy-k">Day '+p.day+' / '+SYNC_N+' · '+hesc(SYNC_S[p.sn-1].n)+' · '+syLevel(p.lv).n+'</div><div class="sy-t">DONE!</div>'+
      '<div class="sy-s">'+SYNC_MIN+' minutes, on the beat. Added to your streak.</div>'+
      '<div class="sy-done-bar"><i style="width:'+(Object.keys(d.days).length/SYNC_N*100).toFixed(1)+'%"></i></div>'+
      '<div class="sy-done-n">'+Object.keys(d.days).length+' / '+SYNC_N+' days done'+(more?' · Up next: Day '+nx+' · '+hesc(SYNC_S[sySession(nx)-1].n):' · Program complete')+'</div>'+
      '<button class="sy-go" onclick="_syS=0;syStop()">Close</button>';
    o.appendChild(el);
  }
  if(typeof toast==='function') toast('SYNC day '+p.day+' done 🔥');
}
/*CUES*/
/* written by _projek/sync/tools/sync_cues.py from each video's timeline.json — do not edit by hand */
const SYNC_TIP={"Alternating Lunges":"Left, right, torso upright","Bicycle Crunch":"Elbow to the opposite knee","Burpee":"Chest to the floor, then jump","Butt Kick":"Heels up to your glutes","Calf Raises":"Rise up onto your toes","Crunch":"Lift your shoulders just off the floor","Curtsy Lunges":"Cross one leg behind the other","Diamond Push Up":"Hands close together under your chest","Fast Feet":"Quick feet, stay low","Flutter Kick":"Legs straight, small fast kicks","Half Burpee":"Hands down, feet back, feet in","High Knee":"Knees high, on the beat","Hip Thrust":"Drive your hips up, squeeze","Hollow Hold":"Lower back pressed into the floor","Incline Push Up":"Hands on the chair, body straight","Jump Lunges":"Jump and switch legs","Jumping Jack":"Arms up, feet apart","Knee Push Up":"Knees down, body straight from the knees","Leg Raises":"Legs straight, lift and lower slowly","Mountain Climber":"Drive your knees to your chest","Plank":"Elbows under shoulders, body straight","Plank Jack":"Hold the plank, feet in and out","Plank Shoulder Tap":"Tap a shoulder, keep your hips still","Push Up":"Hands under shoulders, body straight","Push Up Hold":"Hold at the top, arms straight","Push Up Shoulder Tap":"Push up, then tap a shoulder","Reverse Lunges":"Step back, knee towards the floor","Russian Twist":"Lean back, twist left and right","Side Lunges":"Step out wide, hips back","Side Plank":"Body straight, hips up","Sit Up":"Come all the way up","Skater Jump":"Leap side to side, land soft","Squat":"Feet shoulder-width, chest up, sit back","Squat Hold":"Sit low and hold","Squat Jump":"Squat down, jump up, land soft","Squat Pause":"Down, pause at the bottom, up","Tricep Dip":"Hands on the chair, elbows straight back","Wall Sit":"Back flat on the wall, thighs level","Wide Push Up":"Hands wider than your shoulders"};
const SYNC_CUE={
  s1_easy:{d:897.4,m:[[11.2,16.7,57.2,"t","High Knee",40,0,[]],[86.2,89.8,118.6,"r","Squat",8,1,[92.1,95.6,99.2,102.8,106.4,110.0,113.6,117.2]],[143.7,147.4,169.5,"r","Push Up",6,1,[149.7,153.4,157.1,160.8,164.4,168.1]],[195.2,200.6,226.1,"t","Mountain Climber",25,1,[]],[251.3,254.9,280.5,"h","Plank",25,1,[]],[340.9,344.5,373.7,"r","Squat",8,2,[346.8,350.4,354.1,357.7,361.4,365.0,368.7,372.3]],[399.1,402.8,424.6,"r","Push Up",6,2,[405.0,408.7,412.3,415.9,419.6,423.2]],[450.0,455.5,480.9,"t","Mountain Climber",25,2,[]],[506.3,510.1,536.1,"h","Plank",25,2,[]],[597.2,600.9,630.4,"r","Squat",8,3,[603.2,606.9,610.6,614.3,618.0,621.7,625.3,629.0]],[656.3,659.9,682.1,"r","Push Up",6,3,[662.2,666.0,669.7,673.4,677.1,680.7]],[708.1,713.6,739.5,"t","Mountain Climber",25,3,[]],[765.3,769.0,794.9,"h","Plank",25,3,[]],[855.7,861.1,890.2,"h","Wall Sit",30,4,[]]]},
  s1_medium:{d:906.1,m:[[11.2,16.7,57.2,"t","High Knee",40,0,[]],[71.7,77.2,116.7,"t","Jumping Jack",40,0,[]],[145.6,149.3,182.4,"r","Squat",12,1,[150.9,153.7,156.5,159.2,162.0,164.7,167.5,170.3,173.0,175.8,178.5,181.3]],[197.1,200.7,228.0,"r","Push Up",10,1,[202.3,205.1,207.8,210.5,213.3,216.0,218.7,221.4,224.1,226.9]],[242.4,247.8,276.9,"t","Mountain Climber",30,1,[]],[291.6,295.2,324.5,"h","Plank",30,1,[]],[370.1,373.8,406.5,"r","Squat",12,2,[375.3,378.1,380.8,383.5,386.2,389.0,391.7,394.4,397.1,399.9,402.6,405.3]],[421.0,424.7,452.0,"r","Push Up",10,2,[426.3,429.0,431.7,434.4,437.2,439.9,442.6,445.4,448.1,450.8]],[466.5,471.9,501.2,"t","Mountain Climber",30,2,[]],[516.1,519.8,549.4,"h","Plank",30,2,[]],[595.6,599.3,632.5,"r","Squat",12,3,[600.9,603.6,606.4,609.2,612.0,614.7,617.5,620.3,623.0,625.8,628.6,631.3]],[647.4,651.1,678.9,"r","Push Up",10,3,[652.7,655.5,658.3,661.1,663.8,666.6,669.4,672.2,675.0,677.7]],[693.7,699.2,728.8,"t","Mountain Climber",30,3,[]],[743.5,747.2,776.8,"h","Plank",30,3,[]],[806.4,811.9,852.1,"h","Wall Sit",40,4,[]],[866.5,870.1,898.9,"r","Burpee",8,4,[872.0,875.6,879.2,882.8,886.4,890.0,893.6,897.2]]]},
  s1_hard:{d:898.5,m:[[11.2,16.7,57.2,"t","High Knee",40,0,[]],[66.3,71.7,111.4,"t","Jumping Jack",40,0,[]],[131.1,134.8,168.0,"r","Squat",12,1,[136.4,139.2,142.0,144.8,147.5,150.3,153.0,155.8,158.6,161.3,164.1,166.8]],[177.1,180.8,213.4,"r","Push Up",12,1,[182.4,185.1,187.8,190.6,193.3,196.0,198.7,201.5,204.2,206.9,209.6,212.3]],[222.4,227.8,268.2,"t","Mountain Climber",40,1,[]],[277.3,281.0,321.1,"h","Plank",40,1,[]],[350.2,353.8,386.5,"r","Squat",12,2,[355.4,358.1,360.8,363.6,366.3,369.0,371.8,374.5,377.2,379.9,382.7,385.4]],[395.6,399.3,432.0,"r","Push Up",12,2,[400.9,403.6,406.3,409.1,411.8,414.5,417.2,420.0,422.7,425.4,428.1,430.9]],[441.1,446.5,487.3,"t","Mountain Climber",40,2,[]],[496.6,500.3,540.9,"h","Plank",40,2,[]],[570.4,574.1,607.4,"r","Squat",12,3,[575.7,578.5,581.3,584.0,586.8,589.6,592.4,595.1,597.9,600.7,603.5,606.3]],[616.7,620.4,653.6,"r","Push Up",12,3,[622.0,624.8,627.6,630.3,633.1,635.9,638.6,641.4,644.2,646.9,649.7,652.5]],[662.9,668.4,709.1,"t","Mountain Climber",40,3,[]],[718.3,722.0,762.3,"h","Plank",40,3,[]],[791.2,796.6,841.6,"h","Wall Sit",45,4,[]],[850.9,854.6,891.2,"r","Burpee",10,4,[856.5,860.2,863.9,867.6,871.2,874.9,878.6,882.2,885.9,889.5]]]},
  s2_easy:{d:872.9,m:[[11.3,15.0,56.2,"t","Butt Kick",40,0,[]],[86.2,93.7,123.5,"r","Reverse Lunges",8,1,[96.7,100.4,104.2,107.9,111.6,115.3,119.0,122.8]],[143.9,147.6,184.6,"r","Squat Pause",8,1,[151.3,155.9,160.6,165.2,169.8,174.4,179.1,183.7]],[204.9,208.6,234.5,"t","Fast Feet",25,1,[]],[254.9,258.6,284.6,"h","Squat Hold",25,1,[]],[319.8,327.2,356.7,"r","Reverse Lunges",8,2,[330.2,333.9,337.6,341.3,345.0,348.6,352.3,356.0]],[377.0,380.7,417.5,"r","Squat Pause",8,2,[384.3,388.9,393.5,398.1,402.7,407.3,411.9,416.5]],[437.8,441.5,467.2,"t","Fast Feet",25,2,[]],[487.2,490.8,516.0,"h","Squat Hold",25,2,[]],[550.1,557.5,587.0,"r","Reverse Lunges",8,3,[560.5,564.2,567.9,571.6,575.3,578.9,582.6,586.3]],[607.1,610.7,647.0,"r","Squat Pause",8,3,[614.4,619.0,623.5,628.0,632.6,637.1,641.6,646.1]],[667.0,670.7,696.3,"t","Fast Feet",25,3,[]],[716.5,720.1,745.7,"h","Squat Hold",25,3,[]],[765.7,769.3,805.7,"r","Calf Raises",8,4,[772.2,776.8,781.3,785.9,790.4,795.0,799.5,804.1]],[825.7,829.3,865.6,"r","Squat Pause",8,4,[832.9,837.5,842.0,846.6,851.1,855.7,860.2,864.7]]]},
  s2_medium:{d:901.1,m:[[11.2,14.9,55.7,"t","Butt Kick",40,0,[]],[70.5,76.1,116.6,"t","Jumping Jack",40,0,[]],[146.0,153.3,197.6,"r","Reverse Lunges",12,1,[155.4,159.2,162.9,166.6,170.3,173.9,177.6,181.3,185.0,188.7,192.3,196.0]],[206.7,210.3,264.4,"r","Squat Pause",12,1,[213.3,217.8,222.4,226.9,231.4,235.9,240.4,244.9,249.4,253.9,258.4,262.9]],[273.4,277.0,302.9,"t","Fast Feet",25,1,[]],[312.0,315.7,341.2,"h","Squat Hold",25,1,[]],[361.1,368.2,412.0,"r","Reverse Lunges",12,2,[370.3,373.9,377.5,381.0,384.7,388.4,392.1,395.8,399.4,403.1,406.8,410.4]],[421.2,424.8,479.6,"r","Squat Pause",12,2,[427.8,432.4,437.0,441.5,446.1,450.7,455.2,459.8,464.4,468.9,473.5,478.0]],[488.7,492.3,517.8,"t","Fast Feet",25,2,[]],[526.9,530.5,556.0,"h","Squat Hold",25,2,[]],[576.0,583.2,627.4,"r","Reverse Lunges",12,3,[585.3,588.9,592.5,596.2,599.8,603.4,607.1,610.8,614.6,618.3,622.0,625.7]],[636.7,640.4,695.8,"r","Squat Pause",12,3,[643.4,648.0,652.6,657.2,661.9,666.5,671.1,675.7,680.3,684.9,689.5,694.2]],[705.0,708.7,734.5,"t","Fast Feet",25,3,[]],[743.8,747.5,773.4,"h","Squat Hold",25,3,[]],[793.7,797.4,852.8,"r","Calf Raises",12,4,[799.7,804.3,808.9,813.6,818.2,822.8,827.4,832.0,836.6,841.3,845.9,850.5]],[862.1,865.8,893.7,"r","Squat Jump",10,4,[867.0,869.8,872.6,875.4,878.2,880.9,883.7,886.5,889.3,892.1]]]},
  s2_hard:{d:911.6,m:[[11.2,14.9,55.3,"t","Butt Kick",40,0,[]],[64.4,69.9,109.6,"t","Jumping Jack",40,0,[]],[129.3,136.7,180.8,"r","Reverse Lunges",12,1,[138.7,142.5,146.1,149.8,153.5,157.2,160.9,164.5,168.2,171.9,175.5,179.2]],[189.8,193.5,248.0,"r","Squat Pause",12,1,[196.4,201.0,205.5,210.0,214.5,218.9,223.4,228.1,232.7,237.3,241.8,246.4]],[257.2,260.9,290.1,"t","Fast Feet",30,1,[]],[299.2,302.9,332.0,"h","Squat Hold",30,1,[]],[352.0,359.2,402.9,"r","Reverse Lunges",12,2,[361.3,364.9,368.5,372.2,375.8,379.5,383.1,386.7,390.4,394.0,397.7,401.3]],[412.0,415.6,470.7,"r","Squat Pause",12,2,[418.6,423.1,427.6,432.2,436.7,441.3,445.8,450.4,455.1,459.8,464.4,469.1]],[480.0,483.7,513.2,"t","Fast Feet",30,2,[]],[522.5,526.2,555.7,"h","Squat Hold",30,2,[]],[576.0,583.4,627.8,"r","Reverse Lunges",12,3,[585.5,589.2,592.9,596.6,600.3,604.0,607.7,611.4,615.1,618.8,622.5,626.2]],[637.0,640.7,696.1,"r","Squat Pause",12,3,[643.7,648.3,652.9,657.6,662.2,666.8,671.4,676.0,680.6,685.3,689.9,694.5]],[705.3,709.0,738.5,"t","Fast Feet",30,3,[]],[747.6,751.3,780.4,"h","Squat Hold",30,3,[]],[800.4,804.1,858.3,"r","Calf Raises",12,4,[806.3,810.9,815.4,819.9,824.5,829.0,833.5,838.0,842.5,847.0,851.5,856.0]],[867.4,871.0,904.1,"r","Squat Jump",12,4,[872.2,874.9,877.7,880.5,883.3,886.0,888.8,891.5,894.3,897.0,899.7,902.5]]]},
  s3_easy:{d:898.9,m:[[11.1,16.6,57.0,"t","High Knee",40,0,[]],[71.6,75.2,115.3,"t","Plank Shoulder Tap",40,0,[]],[144.4,148.0,169.8,"r","Knee Push Up",6,1,[150.3,153.9,157.5,161.2,164.8,168.5]],[195.3,200.8,222.6,"r","Tricep Dip",6,1,[203.5,207.2,210.8,214.4,218.1,221.7]],[248.0,251.7,277.8,"t","Plank Shoulder Tap",25,1,[]],[303.8,307.5,337.0,"r","Crunch",8,1,[309.3,313.0,316.7,320.4,324.1,327.8,331.5,335.2]],[362.9,366.6,388.7,"r","Knee Push Up",6,2,[368.9,372.5,376.2,379.9,383.6,387.3]],[414.6,420.2,442.4,"r","Tricep Dip",6,2,[423.0,426.7,430.4,434.0,437.7,441.5]],[468.3,472.0,497.9,"t","Plank Shoulder Tap",25,2,[]],[523.7,527.4,556.9,"r","Crunch",8,2,[529.2,532.9,536.6,540.3,544.0,547.7,551.4,555.1]],[582.7,586.4,608.4,"r","Knee Push Up",6,3,[588.7,592.4,596.1,599.7,603.4,607.1]],[634.0,639.5,661.3,"r","Tricep Dip",6,3,[642.2,645.8,649.5,653.1,656.7,660.3]],[686.6,690.3,715.5,"t","Plank Shoulder Tap",25,3,[]],[741.0,744.7,774.1,"r","Crunch",8,3,[746.5,750.2,753.9,757.6,761.3,764.9,768.5,772.2]],[799.7,803.3,832.3,"t","Russian Twist",30,4,[]],[857.9,861.7,891.4,"h","Plank",30,4,[]]]},
  s3_medium:{d:878.8,m:[[11.2,16.8,57.7,"t","High Knee",40,0,[]],[72.4,76.1,116.7,"t","Plank Jack",40,0,[]],[146.4,150.1,177.9,"r","Push Up",10,1,[151.8,154.5,157.3,160.1,162.9,165.6,168.4,171.2,174.0,176.8]],[187.2,192.7,229.6,"r","Tricep Dip",10,1,[195.2,198.9,202.6,206.3,210.0,213.7,217.4,221.1,224.8,228.5]],[238.9,242.5,272.1,"t","Plank Shoulder Tap",30,1,[]],[281.3,285.0,329.0,"r","Crunch",12,1,[286.4,290.1,293.7,297.4,301.1,304.8,308.4,312.1,315.8,319.4,323.1,326.7]],[358.1,361.7,388.9,"r","Push Up",10,2,[363.3,366.0,368.8,371.5,374.2,376.9,379.6,382.4,385.1,387.8]],[398.0,403.4,439.7,"r","Tricep Dip",10,2,[405.9,409.5,413.1,416.7,420.3,423.9,427.6,431.2,434.8,438.5]],[448.9,452.6,481.9,"t","Plank Shoulder Tap",30,2,[]],[491.0,494.6,538.1,"r","Crunch",12,2,[496.0,499.6,503.2,506.9,510.5,514.1,517.7,521.4,525.0,528.6,532.2,535.9]],[567.9,571.6,599.5,"r","Push Up",10,3,[573.3,576.0,578.8,581.6,584.4,587.2,590.0,592.8,595.6,598.4]],[608.8,614.4,651.8,"r","Tricep Dip",10,3,[617.0,620.7,624.4,628.1,631.9,635.7,639.4,643.2,646.9,650.7]],[661.2,665.0,695.0,"t","Plank Shoulder Tap",30,3,[]],[704.3,708.1,753.0,"r","Crunch",12,3,[709.5,713.2,717.0,720.7,724.5,728.2,732.0,735.7,739.5,743.2,746.9,750.6]],[773.4,777.1,817.6,"t","Russian Twist",40,4,[]],[826.8,830.5,871.3,"h","Plank",40,4,[]]]},
  s3_hard:{d:903.5,m:[[11.1,16.7,57.2,"t","High Knee",40,0,[]],[66.3,70.0,110.0,"t","Plank Jack",40,0,[]],[130.0,133.6,166.1,"r","Push Up",12,1,[135.2,137.9,140.6,143.4,146.1,148.8,151.5,154.2,156.9,159.6,162.3,165.0]],[175.2,180.6,224.7,"r","Tricep Dip",12,1,[183.1,186.8,190.4,194.1,197.8,201.5,205.2,208.9,212.5,216.1,219.9,223.6]],[233.8,237.4,271.9,"t","Plank Shoulder Tap",35,1,[]],[281.0,284.6,329.3,"r","Crunch",12,1,[286.0,289.7,293.5,297.2,300.9,304.6,308.3,312.1,315.8,319.5,323.2,326.9]],[349.7,353.5,386.9,"r","Push Up",12,2,[355.1,357.9,360.7,363.5,366.2,369.0,371.8,374.6,377.4,380.2,383.0,385.8]],[396.5,402.2,447.2,"r","Tricep Dip",12,2,[404.7,408.5,412.2,416.0,419.7,423.5,427.2,431.0,434.7,438.5,442.2,446.0]],[456.5,460.3,495.9,"t","Plank Shoulder Tap",35,2,[]],[505.3,509.0,553.5,"r","Crunch",12,2,[510.4,514.1,517.8,521.6,525.3,529.0,532.7,536.4,540.1,543.8,547.5,551.2]],[573.8,577.5,610.6,"r","Push Up",12,3,[579.1,581.8,584.6,587.3,590.1,592.9,595.6,598.4,601.1,603.9,606.7,609.4]],[619.7,625.3,670.2,"r","Tricep Dip",12,3,[627.8,631.6,635.4,639.1,642.9,646.6,650.3,654.0,657.8,661.5,665.3,669.0]],[679.6,683.4,718.8,"t","Plank Shoulder Tap",35,3,[]],[728.1,731.8,776.6,"r","Crunch",12,3,[733.2,736.9,740.6,744.4,748.1,751.8,755.6,759.3,763.1,766.8,770.6,774.3]],[797.3,801.0,842.2,"t","Russian Twist",40,4,[]],[851.5,855.3,896.1,"h","Plank",40,4,[]]]},
  s4_easy:{d:908.8,m:[[11.2,14.9,55.8,"t","Butt Kick",40,0,[]],[85.6,89.3,119.1,"r","Squat",8,1,[91.4,95.1,98.9,102.6,106.3,110.0,113.7,117.5]],[145.5,149.3,171.8,"r","Incline Push Up",6,1,[151.2,154.9,158.7,162.4,166.2,169.9]],[198.0,203.7,229.9,"t","Mountain Climber",25,1,[]],[256.2,259.9,297.3,"r","Sit Up",8,1,[263.2,267.9,272.6,277.3,281.9,286.6,291.2,295.9]],[332.5,336.2,365.7,"r","Squat",8,2,[338.2,341.9,345.6,349.3,353.0,356.7,360.4,364.0]],[391.4,395.1,417.2,"r","Incline Push Up",6,2,[396.9,400.6,404.3,407.9,411.6,415.3]],[443.4,449.0,475.2,"t","Mountain Climber",25,2,[]],[501.3,505.0,542.3,"r","Sit Up",8,2,[508.3,513.0,517.6,522.3,526.9,531.6,536.2,540.9]],[577.9,581.6,611.6,"r","Squat",8,3,[583.7,587.5,591.2,595.0,598.7,602.5,606.2,610.0]],[637.8,641.6,664.0,"r","Incline Push Up",6,3,[643.4,647.2,650.9,654.7,658.4,662.2]],[690.2,695.8,721.8,"t","Mountain Climber",25,3,[]],[747.7,751.4,788.4,"r","Sit Up",8,3,[754.7,759.3,763.9,768.5,773.1,777.8,782.4,787.0]],[814.3,819.8,849.5,"h","Wall Sit",30,4,[]],[875.5,879.2,901.4,"r","Half Burpee",6,4,[880.3,884.0,887.7,891.4,895.1,898.8]]]},
  s4_medium:{d:877.9,m:[[11.2,16.9,57.9,"t","Jumping Jack",40,0,[]],[72.7,76.4,116.9,"t","Butt Kick",40,0,[]],[146.3,150.0,183.7,"r","Squat",12,1,[151.6,154.4,157.3,160.1,162.9,165.7,168.5,171.3,174.1,176.9,179.7,182.5]],[193.0,196.8,224.8,"r","Wide Push Up",10,1,[198.2,201.0,203.8,206.6,209.5,212.3,215.1,217.9,220.7,223.5]],[234.2,239.7,269.5,"t","Mountain Climber",30,1,[]],[278.8,282.6,338.8,"r","Sit Up",12,1,[285.4,290.1,294.8,299.5,304.2,308.8,313.5,318.2,322.9,327.6,332.3,336.9]],[365.0,368.7,402.2,"r","Squat",12,2,[370.4,373.2,376.0,378.8,381.6,384.4,387.2,389.9,392.7,395.5,398.3,401.1]],[411.5,415.2,443.0,"r","Wide Push Up",10,2,[416.6,419.4,422.2,425.0,427.8,430.5,433.3,436.1,438.9,441.6]],[452.3,457.8,487.4,"t","Mountain Climber",30,2,[]],[496.6,500.3,556.0,"r","Sit Up",12,2,[503.1,507.7,512.3,517.0,521.6,526.3,530.9,535.6,540.2,544.9,549.5,554.1]],[581.9,585.5,618.7,"r","Squat",12,3,[587.2,589.9,592.7,595.5,598.2,601.0,603.8,606.5,609.3,612.1,614.8,617.6]],[627.9,631.6,659.2,"r","Wide Push Up",10,3,[633.0,635.8,638.5,641.3,644.0,646.8,649.5,652.3,655.0,657.8]],[668.4,674.0,703.5,"t","Mountain Climber",30,3,[]],[712.6,716.3,770.5,"r","Sit Up",12,3,[719.0,723.6,728.1,732.7,737.2,741.7,746.2,750.7,755.2,759.7,764.2,768.7]],[790.2,795.8,836.2,"h","Wall Sit",40,4,[]],[845.3,849.0,870.7,"r","Half Burpee",8,4,[850.0,852.7,855.4,858.2,860.9,863.6,866.3,869.0]]]},
  s4_hard:{d:886.2,m:[[11.3,16.9,58.1,"t","Jumping Jack",40,0,[]],[67.5,71.2,112.3,"t","Butt Kick",40,0,[]],[132.7,136.4,169.8,"r","Squat",12,1,[138.1,140.8,143.6,146.4,149.2,152.0,154.7,157.5,160.3,163.1,165.9,168.6]],[179.0,182.7,216.0,"r","Wide Push Up",12,1,[184.1,186.9,189.7,192.4,195.2,198.0,200.7,203.5,206.3,209.1,211.8,214.6]],[225.2,230.8,266.1,"t","Mountain Climber",35,1,[]],[275.3,279.0,334.4,"r","Sit Up",12,1,[281.8,286.4,291.1,295.7,300.3,304.9,309.5,314.2,318.8,323.4,328.0,332.6]],[354.7,358.4,391.5,"r","Squat",12,2,[360.0,362.7,365.5,368.3,371.0,373.8,376.5,379.3,382.0,384.8,387.6,390.3]],[400.8,404.4,437.4,"r","Wide Push Up",12,2,[405.8,408.6,411.3,414.1,416.9,419.6,422.4,425.1,427.9,430.6,433.3,436.1]],[446.5,452.0,486.2,"t","Mountain Climber",35,2,[]],[495.2,498.8,553.7,"r","Sit Up",12,2,[501.5,505.9,510.5,515.1,519.8,524.4,529.0,533.6,538.2,542.8,547.3,551.9]],[573.7,577.4,610.0,"r","Squat",12,3,[579.0,581.7,584.4,587.0,589.7,592.4,595.1,597.8,600.5,603.3,606.1,608.8]],[619.2,622.8,655.8,"r","Wide Push Up",12,3,[624.2,627.0,629.7,632.5,635.2,638.0,640.7,643.4,646.2,648.9,651.7,654.4]],[664.9,670.4,705.0,"t","Mountain Climber",35,3,[]],[714.1,717.7,772.3,"r","Sit Up",12,3,[720.5,725.0,729.5,734.1,738.6,743.2,747.7,752.3,756.8,761.4,765.9,770.5]],[792.4,797.8,837.8,"h","Wall Sit",40,4,[]],[846.9,850.5,878.7,"r","Half Burpee",10,4,[851.6,854.4,857.2,860.0,862.9,865.7,868.5,871.3,874.1,876.9]]]},
  s5_easy:{d:890.2,m:[[11.2,16.8,57.6,"t","High Knee",40,0,[]],[72.4,76.1,116.6,"t","Fast Feet",40,0,[]],[146.0,151.5,181.1,"r","Alternating Lunges",8,1,[154.3,158.0,161.7,165.4,169.1,172.8,176.5,180.2]],[201.2,204.9,241.2,"r","Squat Pause",8,1,[208.5,213.1,217.6,222.2,226.7,231.3,235.8,240.3]],[260.9,264.5,289.9,"t","Fast Feet",25,1,[]],[310.2,315.8,341.5,"h","Wall Sit",25,1,[]],[361.5,366.9,395.8,"r","Alternating Lunges",8,2,[369.6,373.2,376.8,380.4,384.0,387.6,391.2,394.9]],[416.1,419.7,456.3,"r","Squat Pause",8,2,[423.4,428.0,432.5,437.1,441.7,446.2,450.8,455.4]],[476.4,480.0,505.4,"t","Fast Feet",25,2,[]],[525.4,530.9,556.4,"h","Wall Sit",25,2,[]],[576.4,581.8,610.9,"r","Alternating Lunges",8,3,[584.5,588.2,591.8,595.4,599.1,602.7,606.3,610.0]],[631.4,635.1,672.1,"r","Squat Pause",8,3,[638.8,643.5,648.1,652.7,657.3,662.0,666.6,671.2]],[692.4,696.1,722.0,"t","Fast Feet",25,3,[]],[742.3,747.8,773.7,"h","Wall Sit",25,3,[]],[794.1,799.6,836.6,"r","Side Lunges",8,4,[803.1,807.7,812.3,816.9,821.6,826.2,830.8,835.4]],[856.9,860.6,882.8,"r","Half Burpee",6,4,[861.7,865.4,869.1,872.8,876.5,880.2]]]},
  s5_medium:{d:898.8,m:[[11.2,16.7,57.2,"t","High Knee",40,0,[]],[71.7,75.3,115.0,"t","Fast Feet",40,0,[]],[143.7,149.3,193.4,"r","Alternating Lunges",12,1,[151.4,155.1,158.7,162.4,166.1,169.8,173.5,177.1,180.8,184.5,188.1,191.8]],[207.9,211.5,238.6,"r","Squat Jump",10,1,[212.7,215.4,218.1,220.8,223.5,226.2,228.9,231.6,234.2,236.9]],[253.4,257.1,286.4,"t","Skater Jump",30,1,[]],[301.0,306.5,335.7,"h","Wall Sit",30,1,[]],[361.1,366.6,410.2,"r","Alternating Lunges",12,2,[368.6,372.3,375.9,379.5,383.2,386.8,390.5,394.1,397.7,401.4,405.0,408.7]],[424.8,428.5,455.7,"r","Squat Jump",10,2,[429.6,432.3,435.1,437.8,440.5,443.2,446.0,448.7,451.4,454.1]],[470.2,473.9,503.6,"t","Skater Jump",30,2,[]],[518.5,524.0,553.6,"h","Wall Sit",30,2,[]],[579.4,584.9,629.3,"r","Alternating Lunges",12,3,[587.0,590.7,594.4,598.1,601.8,605.5,609.2,612.9,616.5,620.2,623.9,627.6]],[644.1,647.7,675.5,"r","Squat Jump",10,3,[648.9,651.7,654.5,657.3,660.0,662.8,665.6,668.3,671.1,673.9]],[690.3,694.0,723.5,"t","Skater Jump",30,3,[]],[738.3,743.8,773.3,"h","Wall Sit",30,3,[]],[793.5,799.0,842.7,"r","Side Lunges",12,4,[801.7,805.4,809.0,812.7,816.3,820.0,823.6,827.2,830.9,834.5,838.1,841.8]],[857.2,862.6,891.5,"r","Burpee",8,4,[864.6,868.2,871.8,875.4,879.0,882.6,886.2,889.8]]]},
  s5_hard:{d:877.6,m:[[11.1,16.6,57.0,"t","High Knee",40,0,[]],[66.1,69.7,109.8,"t","Fast Feet",40,0,[]],[129.8,135.2,178.9,"r","Alternating Lunges",12,1,[137.3,140.9,144.6,148.2,151.8,155.5,159.1,162.8,166.4,170.0,173.7,177.3]],[188.0,191.6,224.3,"r","Squat Jump",12,1,[192.8,195.5,198.2,201.0,203.7,206.4,209.1,211.8,214.6,217.3,220.0,222.7]],[233.4,237.1,272.4,"t","Skater Jump",35,1,[]],[281.7,287.2,322.3,"h","Wall Sit",35,1,[]],[342.6,348.1,392.5,"r","Alternating Lunges",12,2,[350.2,353.9,357.6,361.3,365.0,368.7,372.4,376.1,379.8,383.5,387.2,390.9]],[401.8,405.5,438.7,"r","Squat Jump",12,2,[406.6,409.4,412.2,414.9,417.7,420.5,423.2,426.0,428.8,431.5,434.3,437.1]],[447.9,451.6,486.7,"t","Skater Jump",35,2,[]],[495.9,501.4,536.3,"h","Wall Sit",35,2,[]],[556.4,561.8,605.4,"r","Alternating Lunges",12,3,[563.9,567.5,571.1,574.8,578.4,582.0,585.7,589.3,592.9,596.5,600.2,603.8]],[614.4,618.0,650.6,"r","Squat Jump",12,3,[619.2,621.9,624.6,627.3,630.0,632.7,635.4,638.1,640.8,643.6,646.3,649.0]],[659.9,663.6,698.3,"t","Skater Jump",35,3,[]],[707.4,712.9,747.3,"h","Wall Sit",35,3,[]],[767.6,773.2,817.9,"r","Side Lunges",12,4,[776.0,779.7,783.5,787.2,790.9,794.6,798.3,802.1,805.8,809.5,813.2,816.9]],[827.2,832.8,870.1,"r","Burpee",10,4,[834.7,838.5,842.2,845.9,849.6,853.3,857.1,860.8,864.5,868.3]]]},
  s6_easy:{d:886.3,m:[[11.2,14.9,55.8,"t","Butt Kick",40,0,[]],[70.6,74.3,114.9,"t","Plank Shoulder Tap",40,0,[]],[144.5,148.2,177.8,"r","Crunch",8,1,[150.1,153.8,157.5,161.2,164.9,168.6,172.3,176.0]],[198.2,201.8,238.8,"r","Leg Raises",8,1,[204.6,209.2,213.9,218.5,223.1,227.7,232.3,236.9]],[259.1,264.6,290.5,"t","Flutter Kick",25,1,[]],[310.7,314.4,339.9,"h","Side Plank",25,1,[]],[359.9,363.6,392.6,"r","Crunch",8,2,[365.4,369.0,372.6,376.3,379.9,383.5,387.2,390.8]],[412.5,416.1,452.5,"r","Leg Raises",8,2,[418.8,423.3,427.8,432.4,436.9,441.4,446.1,450.7]],[472.7,478.3,503.7,"t","Flutter Kick",25,2,[]],[523.7,527.3,552.9,"h","Side Plank",25,2,[]],[573.4,577.1,606.9,"r","Crunch",8,3,[579.0,582.7,586.4,590.1,593.9,597.6,601.3,605.0]],[627.4,631.1,668.6,"r","Leg Raises",8,3,[633.9,638.6,643.3,647.9,652.6,657.3,662.0,666.7]],[689.2,694.8,721.1,"t","Flutter Kick",25,3,[]],[741.7,745.5,771.7,"h","Side Plank",25,3,[]],[792.2,795.9,825.6,"h","Hollow Hold",30,4,[]],[845.9,849.5,879.0,"t","Bicycle Crunch",30,4,[]]]},
  s6_medium:{d:890.1,m:[[11.1,16.7,57.2,"t","Jumping Jack",40,0,[]],[71.8,75.4,115.5,"t","Plank Jack",40,0,[]],[144.5,148.1,191.6,"r","Crunch",12,1,[149.5,153.1,156.7,160.3,163.9,167.5,171.1,174.7,178.4,182.0,185.6,189.3]],[200.9,204.5,248.3,"r","Leg Raises",12,1,[206.6,210.2,213.9,217.5,221.3,225.0,228.6,232.2,235.9,239.5,243.1,246.8]],[257.4,262.9,291.9,"t","Flutter Kick",30,1,[]],[301.2,305.0,334.7,"h","Side Plank",30,1,[]],[355.2,358.9,403.7,"r","Crunch",12,2,[360.3,364.0,367.8,371.5,375.2,378.9,382.6,386.4,390.1,393.8,397.6,401.4]],[413.1,416.8,461.8,"r","Leg Raises",12,2,[418.9,422.7,426.4,430.2,433.9,437.7,441.4,445.2,448.9,452.7,456.4,460.2]],[471.2,476.8,506.8,"t","Flutter Kick",30,2,[]],[516.1,519.8,549.5,"h","Side Plank",30,2,[]],[569.8,573.5,617.6,"r","Crunch",12,3,[574.8,578.5,582.2,585.9,589.6,593.2,596.9,600.6,604.3,608.0,611.6,615.3]],[626.8,630.5,675.5,"r","Leg Raises",12,3,[632.7,636.5,640.2,643.9,647.7,651.4,655.1,658.8,662.6,666.3,670.1,673.8]],[684.9,690.5,720.3,"t","Flutter Kick",30,3,[]],[729.6,733.3,763.2,"h","Side Plank",30,3,[]],[783.8,787.5,828.7,"h","Hollow Hold",40,4,[]],[838.1,841.8,882.7,"t","Bicycle Crunch",40,4,[]]]},
  s6_hard:{d:912.9,m:[[11.2,16.8,57.7,"t","Jumping Jack",40,0,[]],[67.0,70.7,111.7,"t","Plank Jack",40,0,[]],[132.4,136.1,181.1,"r","Crunch",12,1,[137.5,141.3,145.0,148.8,152.5,156.3,160.0,163.8,167.5,171.3,175.0,178.8]],[190.5,194.2,239.1,"r","Leg Raises",12,1,[196.4,200.1,203.8,207.6,211.3,215.1,218.8,222.6,226.3,230.0,233.7,237.5]],[248.4,253.9,289.0,"t","Flutter Kick",35,1,[]],[298.2,301.8,336.8,"h","Side Plank",35,1,[]],[357.3,361.1,406.0,"r","Crunch",12,2,[362.5,366.2,369.9,373.6,377.4,381.1,384.9,388.7,392.4,396.2,399.9,403.7]],[415.3,419.0,463.7,"r","Leg Raises",12,2,[421.1,424.8,428.6,432.3,436.0,439.7,443.4,447.2,450.9,454.6,458.3,462.1]],[473.0,478.7,514.3,"t","Flutter Kick",35,2,[]],[523.6,527.4,562.9,"h","Side Plank",35,2,[]],[583.5,587.2,631.7,"r","Crunch",12,3,[588.6,592.3,596.0,599.7,603.4,607.1,610.9,614.6,618.3,622.0,625.7,629.4]],[641.0,644.7,689.0,"r","Leg Raises",12,3,[646.7,650.4,654.1,657.8,661.5,665.2,668.9,672.6,676.3,680.0,683.7,687.4]],[698.3,703.8,739.1,"t","Flutter Kick",35,3,[]],[748.3,752.0,787.2,"h","Side Plank",35,3,[]],[807.5,811.2,851.6,"h","Hollow Hold",40,4,[]],[860.8,864.5,905.4,"t","Bicycle Crunch",40,4,[]]]},
  s7_easy:{d:909.0,m:[[11.2,16.9,57.9,"t","High Knee",40,0,[]],[72.7,76.4,116.9,"t","Butt Kick",40,0,[]],[146.3,150.0,172.5,"r","Knee Push Up",6,1,[152.3,156.1,159.9,163.6,167.4,171.1]],[198.6,202.4,224.8,"r","Knee Push Up",6,1,[204.7,208.5,212.2,216.0,219.7,223.5]],[250.9,256.5,282.6,"t","Push Up Shoulder Tap",25,1,[]],[308.8,314.4,336.9,"r","Tricep Dip",6,1,[317.2,321.0,324.7,328.5,332.2,336.0]],[372.5,376.2,398.7,"r","Knee Push Up",6,2,[378.6,382.3,386.1,389.8,393.6,397.3]],[424.9,428.6,450.9,"r","Knee Push Up",6,2,[430.9,434.6,438.3,442.0,445.8,449.5]],[476.8,482.4,508.3,"t","Push Up Shoulder Tap",25,2,[]],[534.1,539.7,561.9,"r","Tricep Dip",6,2,[542.4,546.1,549.8,553.5,557.2,560.9]],[597.2,600.9,623.2,"r","Knee Push Up",6,3,[603.3,607.0,610.7,614.4,618.1,621.8]],[649.1,652.8,674.9,"r","Knee Push Up",6,3,[655.1,658.8,662.5,666.1,669.8,673.5]],[700.7,706.2,731.9,"t","Push Up Shoulder Tap",25,3,[]],[757.8,763.4,785.4,"r","Tricep Dip",6,3,[766.1,769.8,773.5,777.1,780.8,784.5]],[811.0,814.6,843.6,"h","Push Up Hold",30,4,[]],[868.8,872.3,901.6,"t","Plank Shoulder Tap",30,4,[]]]},
  s7_medium:{d:899.5,m:[[11.3,16.9,58.1,"t","High Knee",40,0,[]],[73.1,78.7,119.7,"t","Jumping Jack",40,0,[]],[149.4,153.1,180.9,"r","Push Up",10,1,[154.8,157.6,160.3,163.1,165.9,168.7,171.4,174.2,177.0,179.8]],[195.7,199.4,227.1,"r","Diamond Push Up",10,1,[200.8,203.6,206.3,209.1,211.9,214.6,217.4,220.2,223.0,225.7]],[241.9,247.5,277.2,"t","Push Up Shoulder Tap",30,1,[]],[292.0,297.6,334.5,"r","Tricep Dip",10,1,[300.1,303.8,307.5,311.2,314.9,318.6,322.3,326.0,329.7,333.3]],[369.5,373.2,400.8,"r","Push Up",10,2,[374.8,377.5,380.3,383.0,385.8,388.5,391.3,394.0,396.8,399.6]],[415.6,419.3,446.8,"r","Diamond Push Up",10,2,[420.6,423.4,426.2,428.9,431.7,434.4,437.2,439.9,442.7,445.4]],[461.3,466.8,495.6,"t","Push Up Shoulder Tap",30,2,[]],[510.0,515.4,552.1,"r","Tricep Dip",10,2,[517.8,521.4,525.1,528.8,532.5,536.2,539.9,543.6,547.3,550.9]],[586.8,590.5,617.7,"r","Push Up",10,3,[592.1,594.8,597.5,600.3,603.0,605.7,608.4,611.2,613.9,616.6]],[632.1,635.7,663.3,"r","Diamond Push Up",10,3,[637.1,639.9,642.6,645.4,648.1,650.9,653.7,656.4,659.2,661.9]],[677.9,683.4,712.6,"t","Push Up Shoulder Tap",30,3,[]],[727.2,732.7,769.0,"r","Tricep Dip",10,3,[735.2,738.8,742.5,746.1,749.7,753.4,757.0,760.6,764.3,767.9]],[789.1,792.7,832.7,"h","Push Up Hold",40,4,[]],[847.2,850.8,892.0,"t","Plank Jack",40,4,[]]]},
  s7_hard:{d:897.4,m:[[11.2,16.8,57.6,"t","High Knee",40,0,[]],[66.8,72.4,112.9,"t","Jumping Jack",40,0,[]],[133.2,136.8,170.0,"r","Push Up",12,1,[138.4,141.2,144.0,146.7,149.5,152.2,155.0,157.8,160.5,163.3,166.1,168.9]],[179.2,182.9,215.8,"r","Diamond Push Up",12,1,[184.3,187.0,189.8,192.6,195.3,198.0,200.8,203.5,206.2,209.0,211.7,214.4]],[224.9,230.3,269.8,"t","Push Up Shoulder Tap",40,1,[]],[278.8,284.4,328.4,"r","Tricep Dip",12,1,[286.9,290.6,294.3,298.0,301.7,305.3,309.0,312.7,316.3,320.0,323.7,327.3]],[348.4,352.0,384.7,"r","Push Up",12,2,[353.6,356.3,359.0,361.7,364.4,367.1,369.8,372.5,375.3,378.0,380.8,383.6]],[393.9,397.6,430.5,"r","Diamond Push Up",12,2,[398.9,401.7,404.4,407.2,409.9,412.7,415.4,418.2,420.9,423.6,426.4,429.1]],[439.6,445.1,485.2,"t","Push Up Shoulder Tap",40,2,[]],[494.3,499.7,543.4,"r","Tricep Dip",12,2,[502.2,505.8,509.5,513.1,516.8,520.4,524.0,527.7,531.3,535.0,538.6,542.2]],[563.4,567.1,599.8,"r","Push Up",12,3,[568.7,571.4,574.1,576.9,579.6,582.3,585.0,587.8,590.5,593.2,595.9,598.7]],[608.9,612.5,646.0,"r","Diamond Push Up",12,3,[613.8,616.6,619.4,622.2,625.0,627.8,630.6,633.4,636.2,639.0,641.8,644.6]],[655.2,660.8,701.4,"t","Push Up Shoulder Tap",40,3,[]],[710.6,716.2,760.5,"r","Tricep Dip",12,3,[718.7,722.4,726.1,729.8,733.5,737.2,740.9,744.5,748.2,751.9,755.6,759.3]],[780.8,784.6,830.7,"h","Push Up Hold",45,4,[]],[840.0,843.7,889.9,"t","Plank Jack",45,4,[]]]},
  s8_easy:{d:875.6,m:[[11.2,14.9,55.3,"t","Butt Kick",40,0,[]],[69.9,75.3,115.0,"t","High Knee",40,0,[]],[143.7,147.4,176.9,"r","Curtsy Lunges",8,1,[150.4,154.1,157.8,161.5,165.2,168.9,172.5,176.2]],[191.6,195.2,231.5,"r","Squat Pause",8,1,[198.9,203.4,208.0,212.5,217.0,221.6,226.1,230.6]],[245.9,253.2,282.6,"r","Reverse Lunges",8,1,[256.2,259.9,263.6,267.3,270.9,274.6,278.2,281.9]],[297.2,300.9,326.4,"h","Squat Hold",25,1,[]],[355.5,359.1,388.2,"r","Curtsy Lunges",8,2,[362.1,365.7,369.4,373.0,376.6,380.3,383.9,387.5]],[402.8,406.4,442.8,"r","Squat Pause",8,2,[410.1,414.6,419.2,423.7,428.2,432.8,437.3,441.9]],[457.3,464.6,494.4,"r","Reverse Lunges",8,2,[467.7,471.4,475.1,478.9,482.6,486.3,490.0,493.7]],[509.2,512.9,538.8,"h","Squat Hold",25,2,[]],[568.3,572.0,601.6,"r","Curtsy Lunges",8,3,[575.0,578.7,582.4,586.1,589.8,593.5,597.2,600.9]],[616.4,620.1,657.1,"r","Squat Pause",8,3,[623.8,628.4,633.1,637.7,642.3,647.0,651.6,656.2]],[671.9,679.3,708.8,"r","Reverse Lunges",8,3,[682.3,686.0,689.7,693.4,697.1,700.8,704.4,708.1]],[723.6,727.3,753.1,"h","Squat Hold",25,3,[]],[773.4,777.1,813.8,"r","Hip Thrust",8,4,[780.3,784.9,789.5,794.1,798.7,803.3,807.9,812.4]],[828.4,832.0,868.4,"r","Squat Pause",8,4,[835.7,840.2,844.8,849.3,853.8,858.4,862.9,867.4]]]},
  s8_medium:{d:896.8,m:[[11.1,14.8,55.1,"t","Butt Kick",40,0,[]],[69.7,75.2,115.3,"t","High Knee",40,0,[]],[144.4,148.0,191.7,"r","Curtsy Lunges",12,1,[150.3,153.9,157.5,161.2,164.8,168.5,172.1,175.7,179.4,183.0,186.7,190.3]],[200.7,204.4,259.6,"r","Squat Pause",12,1,[207.3,211.9,216.4,220.9,225.5,230.0,234.7,239.3,244.0,248.6,253.3,257.9]],[268.9,272.6,300.3,"r","Jump Lunges",10,1,[273.7,276.5,279.3,282.0,284.8,287.6,290.3,293.1,295.9,298.6]],[309.5,313.2,339.0,"h","Squat Hold",25,1,[]],[359.3,363.0,407.4,"r","Curtsy Lunges",12,2,[365.3,369.0,372.7,376.4,380.1,383.8,387.5,391.2,395.0,398.6,402.3,406.0]],[416.7,420.4,475.7,"r","Squat Pause",12,2,[423.4,428.0,432.6,437.2,441.8,446.4,451.1,455.7,460.3,464.9,469.5,474.1]],[485.0,488.7,516.3,"r","Jump Lunges",10,2,[489.8,492.6,495.4,498.1,500.9,503.7,506.4,509.2,511.9,514.7]],[525.5,529.2,554.8,"h","Squat Hold",25,2,[]],[574.8,578.4,621.9,"r","Curtsy Lunges",12,3,[580.7,584.3,587.9,591.6,595.2,598.8,602.5,606.1,609.7,613.3,616.9,620.6]],[630.9,634.5,689.3,"r","Squat Pause",12,3,[637.5,642.0,646.5,651.1,655.6,660.2,664.8,669.4,674.0,678.6,683.1,687.7]],[698.6,702.3,729.5,"r","Jump Lunges",10,3,[703.4,706.1,708.8,711.6,714.3,717.0,719.7,722.5,725.2,727.9]],[738.6,742.2,767.8,"h","Squat Hold",25,3,[]],[788.3,792.0,847.8,"r","Hip Thrust",12,4,[794.5,799.2,803.8,808.5,813.1,817.8,822.4,827.1,831.7,836.4,841.0,845.7]],[857.4,861.1,889.3,"r","Squat Jump",10,4,[862.3,865.1,867.9,870.7,873.6,876.4,879.2,882.0,884.8,887.6]]]},
  s8_hard:{d:920.1,m:[[11.2,14.9,55.8,"t","Butt Kick",40,0,[]],[65.1,70.6,111.2,"t","High Knee",40,0,[]],[131.5,135.2,179.6,"r","Curtsy Lunges",12,1,[137.5,141.2,144.9,148.6,152.3,156.0,159.7,163.4,167.1,170.8,174.5,178.2]],[188.8,192.5,247.9,"r","Squat Pause",12,1,[195.5,200.1,204.8,209.4,214.0,218.6,223.2,227.8,232.5,237.1,241.7,246.3]],[257.2,260.8,294.0,"r","Jump Lunges",12,1,[262.0,264.8,267.5,270.3,273.1,275.8,278.6,281.4,284.1,286.9,289.6,292.4]],[303.2,306.9,336.1,"h","Squat Hold",30,1,[]],[356.1,359.7,403.1,"r","Curtsy Lunges",12,2,[362.0,365.6,369.2,372.8,376.5,380.1,383.7,387.3,391.0,394.6,398.2,401.8]],[412.1,415.8,470.8,"r","Squat Pause",12,2,[418.7,423.3,427.8,432.4,437.0,441.6,446.2,450.8,455.3,459.9,464.6,469.2]],[479.8,483.5,516.1,"r","Jump Lunges",12,2,[484.6,487.3,490.1,492.8,495.5,498.2,500.9,503.7,506.4,509.1,511.8,514.5]],[525.2,528.9,558.6,"h","Squat Hold",30,2,[]],[579.1,582.8,627.6,"r","Curtsy Lunges",12,3,[585.1,588.9,592.6,596.3,600.0,603.7,607.5,611.2,614.9,618.6,622.4,626.2]],[637.0,640.7,697.0,"r","Squat Pause",12,3,[643.8,648.4,653.1,657.8,662.5,667.2,671.9,676.6,681.3,685.9,690.6,695.3]],[706.4,710.1,743.8,"r","Jump Lunges",12,3,[711.3,714.1,716.9,719.7,722.5,725.3,728.1,730.9,733.7,736.5,739.3,742.1]],[753.1,756.8,786.4,"h","Squat Hold",30,3,[]],[806.6,810.3,865.8,"r","Hip Thrust",12,4,[812.8,817.4,822.0,826.6,831.2,835.8,840.4,845.0,849.6,854.3,859.0,863.7]],[875.1,878.8,912.6,"r","Squat Jump",12,4,[880.0,882.8,885.6,888.4,891.2,894.1,896.9,899.7,902.5,905.3,908.1,910.9]]]},
  s9_easy:{d:908.9,m:[[11.1,14.8,55.3,"t","Butt Kick",40,0,[]],[70.0,75.4,115.5,"t","High Knee",40,0,[]],[144.5,148.1,169.7,"r","Half Burpee",6,1,[149.2,152.8,156.5,160.1,163.7,167.3]],[195.2,200.7,226.4,"t","High Knee",25,1,[]],[252.1,255.7,281.1,"t","Fast Feet",25,1,[]],[306.6,312.2,338.3,"t","Mountain Climber",25,1,[]],[358.7,362.4,384.8,"r","Half Burpee",6,2,[363.6,367.3,371.0,374.8,378.5,382.2]],[410.8,416.4,442.7,"t","High Knee",25,2,[]],[468.9,472.7,498.9,"t","Fast Feet",25,2,[]],[525.2,530.8,557.0,"t","Mountain Climber",25,2,[]],[577.4,581.1,603.3,"r","Half Burpee",6,3,[582.3,586.0,589.7,593.4,597.1,600.8]],[629.1,634.6,660.3,"t","High Knee",25,3,[]],[686.4,690.1,716.3,"t","Fast Feet",25,3,[]],[742.5,748.1,774.2,"t","Mountain Climber",25,3,[]],[800.2,804.0,834.0,"t","Butt Kick",30,4,[]],[860.2,863.9,901.4,"r","Squat Pause",8,4,[867.7,872.4,877.1,881.7,886.4,891.1,895.8,900.4]]]},
  s9_medium:{d:913.0,m:[[11.2,16.8,57.7,"t","Jumping Jack",40,0,[]],[72.6,78.2,119.2,"t","High Knee",40,0,[]],[149.2,154.8,184.8,"r","Burpee",8,1,[156.8,160.6,164.3,168.1,171.8,175.6,179.3,183.1]],[199.8,205.5,235.4,"t","High Knee",30,1,[]],[250.3,254.0,283.7,"t","Skater Jump",30,1,[]],[298.4,304.0,333.4,"t","Mountain Climber",30,1,[]],[379.8,385.3,415.3,"r","Burpee",8,2,[387.3,391.0,394.8,398.5,402.3,406.0,409.8,413.6]],[430.3,435.8,465.6,"t","High Knee",30,2,[]],[480.5,484.2,514.2,"t","Skater Jump",30,2,[]],[529.2,534.8,564.8,"t","Mountain Climber",30,2,[]],[611.4,617.0,646.7,"r","Burpee",8,3,[619.0,622.7,626.4,630.1,633.8,637.5,641.2,645.0]],[661.5,667.1,696.7,"t","High Knee",30,3,[]],[711.5,715.1,744.7,"t","Skater Jump",30,3,[]],[759.6,765.2,794.9,"t","Mountain Climber",30,3,[]],[815.3,819.0,859.5,"t","Butt Kick",40,4,[]],[874.3,877.9,905.5,"r","Squat Jump",10,4,[879.1,881.8,884.6,887.4,890.1,892.9,895.6,898.4,901.1,903.9]]]},
  s9_hard:{d:882.1,m:[[11.2,16.9,57.9,"t","Jumping Jack",40,0,[]],[67.2,72.7,113.2,"t","High Knee",40,0,[]],[133.5,139.0,176.2,"r","Burpee",10,1,[140.9,144.6,148.3,152.0,155.8,159.6,163.3,167.1,170.8,174.5]],[185.6,191.2,226.7,"t","High Knee",35,1,[]],[236.0,239.8,275.2,"t","Skater Jump",35,1,[]],[284.5,290.2,325.8,"t","Mountain Climber",35,1,[]],[355.7,361.3,398.7,"r","Burpee",10,2,[363.3,367.1,370.8,374.6,378.3,382.0,385.8,389.5,393.3,397.0]],[408.0,413.6,448.8,"t","High Knee",35,2,[]],[458.0,461.7,496.8,"t","Skater Jump",35,2,[]],[506.1,511.6,546.9,"t","Mountain Climber",35,2,[]],[576.5,582.1,619.0,"r","Burpee",10,3,[584.1,587.8,591.5,595.1,598.8,602.5,606.2,609.9,613.6,617.3]],[628.2,633.7,668.6,"t","High Knee",35,3,[]],[677.9,681.6,716.6,"t","Skater Jump",35,3,[]],[725.8,731.2,765.7,"t","Mountain Climber",35,3,[]],[785.4,789.0,829.2,"t","Butt Kick",40,4,[]],[838.4,842.0,874.8,"r","Squat Jump",12,4,[843.2,845.9,848.7,851.4,854.1,856.9,859.6,862.3,865.1,867.8,870.5,873.2]]]},
  s10_easy:{d:898.4,m:[[11.3,16.9,58.1,"t","High Knee",40,0,[]],[73.1,76.8,117.9,"t","Butt Kick",40,0,[]],[147.6,151.3,180.9,"r","Squat",8,1,[153.6,157.3,161.0,164.7,168.4,172.1,175.8,179.5]],[206.8,210.5,232.6,"r","Knee Push Up",6,1,[212.8,216.5,220.2,223.9,227.6,231.3]],[258.6,262.3,284.6,"r","Half Burpee",6,1,[263.5,267.2,270.9,274.6,278.4,282.1]],[310.6,314.3,340.1,"h","Plank",25,1,[]],[366.0,369.6,399.1,"r","Squat",8,2,[371.9,375.6,379.3,383.0,386.7,390.3,394.0,397.7]],[424.9,428.6,450.8,"r","Knee Push Up",6,2,[430.9,434.6,438.3,442.0,445.7,449.4]],[476.4,480.1,501.9,"r","Half Burpee",6,2,[481.2,484.9,488.5,492.1,495.8,499.4]],[527.2,530.7,555.9,"h","Plank",25,2,[]],[581.1,584.8,614.3,"r","Squat",8,3,[587.1,590.8,594.5,598.2,601.9,605.5,609.2,612.9]],[639.9,643.5,665.4,"r","Knee Push Up",6,3,[645.8,649.5,653.1,656.8,660.4,664.0]],[690.6,694.2,716.0,"r","Half Burpee",6,3,[695.4,698.9,702.5,706.1,709.8,713.5]],[741.7,745.4,771.0,"h","Plank",25,3,[]],[796.5,802.0,831.1,"h","Wall Sit",30,4,[]],[856.5,862.0,891.1,"t","High Knee",30,4,[]]]},
  s10_medium:{d:900.9,m:[[11.2,16.8,57.6,"t","High Knee",40,0,[]],[72.4,77.9,118.5,"t","Jumping Jack",40,0,[]],[147.9,151.5,184.8,"r","Squat",12,1,[153.1,155.9,158.7,161.5,164.2,167.0,169.8,172.6,175.3,178.1,180.8,183.6]],[199.4,203.1,230.3,"r","Push Up",10,1,[204.7,207.4,210.1,212.9,215.6,218.3,221.0,223.8,226.5,229.2]],[244.8,250.2,278.9,"r","Burpee",8,1,[252.1,255.7,259.3,262.9,266.4,270.0,273.6,277.2]],[293.3,297.0,326.5,"h","Plank",30,1,[]],[366.7,370.3,402.8,"r","Squat",12,2,[371.9,374.6,377.3,380.1,382.8,385.5,388.2,390.9,393.6,396.3,399.0,401.6]],[417.5,421.2,448.7,"r","Push Up",10,2,[422.8,425.6,428.3,431.1,433.8,436.6,439.3,442.1,444.8,447.6]],[463.3,468.8,498.0,"r","Burpee",8,2,[470.8,474.4,478.1,481.7,485.4,489.0,492.7,496.3]],[512.6,516.2,545.3,"h","Plank",30,2,[]],[585.3,589.0,621.7,"r","Squat",12,3,[590.6,593.3,596.0,598.8,601.5,604.2,606.9,609.7,612.4,615.1,617.8,620.5]],[636.2,639.9,667.8,"r","Push Up",10,3,[641.6,644.4,647.1,649.9,652.7,655.5,658.3,661.1,663.9,666.7]],[682.7,688.2,717.8,"r","Burpee",8,3,[690.2,693.9,697.6,701.3,705.0,708.7,712.4,716.0]],[732.5,736.2,765.8,"h","Plank",30,3,[]],[786.3,791.9,832.6,"h","Wall Sit",40,4,[]],[847.3,852.9,893.5,"t","High Knee",40,4,[]]]},
  s10_hard:{d:889.9,m:[[11.2,16.7,57.2,"t","High Knee",40,0,[]],[66.3,71.7,111.4,"t","Jumping Jack",40,0,[]],[131.1,134.8,168.0,"r","Squat",12,1,[136.4,139.2,142.0,144.8,147.5,150.3,153.0,155.8,158.6,161.3,164.1,166.8]],[177.1,180.8,213.4,"r","Push Up",12,1,[182.4,185.1,187.8,190.6,193.3,196.0,198.7,201.5,204.2,206.9,209.6,212.3]],[222.4,227.8,264.5,"r","Burpee",10,1,[229.7,233.4,237.1,240.8,244.5,248.1,251.8,255.5,259.1,262.8]],[273.7,277.3,317.4,"h","Plank",40,1,[]],[346.5,350.2,382.9,"r","Squat",12,2,[351.8,354.5,357.2,359.9,362.7,365.4,368.1,370.8,373.6,376.3,379.0,381.8]],[392.0,395.6,428.4,"r","Push Up",12,2,[397.2,400.0,402.7,405.4,408.1,410.9,413.6,416.3,419.0,421.8,424.5,427.2]],[437.4,442.9,480.0,"r","Burpee",10,2,[444.8,448.5,452.2,455.9,459.7,463.4,467.1,470.8,474.5,478.3]],[489.3,493.0,533.6,"h","Plank",40,2,[]],[563.1,566.8,600.0,"r","Squat",12,3,[568.4,571.2,574.0,576.7,579.5,582.3,585.0,587.8,590.6,593.3,596.1,598.9]],[609.4,613.1,646.5,"r","Push Up",12,3,[614.8,617.5,620.3,623.1,625.9,628.6,631.4,634.2,637.0,639.8,642.5,645.3]],[655.7,661.2,698.2,"r","Burpee",10,3,[663.2,666.9,670.6,674.3,678.0,681.7,685.3,689.0,692.7,696.4]],[707.4,711.1,751.7,"h","Plank",40,3,[]],[771.9,777.4,822.9,"h","Wall Sit",45,4,[]],[832.0,837.4,882.6,"t","High Knee",45,4,[]]]}
};
/*/CUES*/
