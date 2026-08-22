/* ═══════════════ TRAIN · Fitness+ structure ═══════════════
   Four segments behind a pill control, and each section built to the pattern it
   copies: sampler strip, activity tiles, big programs, gradient browse tiles,
   and a workout list. Content is HITFAT+'s own.                               */

let trSeg='explore';
const TR_SEGS=[['foryou','For You'],['explore','Explore'],['plans','Plans'],['recovery','Recovery'],['bar','HITFAT BAR'],['store','Store'],['library','Library']];
function setTrSeg(s){
  /* Remember where we came from BEFORE overwriting trSeg — openStore() runs
     after this assignment and would only ever see 'store'. */
  if(s==='store' && trSeg!=='store') _storeBackSeg=trSeg;
  trSeg=s; renderTrain(); $('screen').scrollTop=0;
}

function fsec(title,sub,chev){
  return '<div class="fsec"><div class="ft">'+title+(chev?'<span class="cv">›</span>':'')+'</div>'+
         (sub?'<div class="fs">'+sub+'</div>':'')+'</div>';
}
function grad(p){ return 'radial-gradient(circle at 78% 16%,'+hexA(p.ac||p.c1,.34)+',transparent 58%),'+
                         'linear-gradient(158deg,'+(p.c1||'#222')+','+(p.c2||'var(--cardbot)')+')'; }
function metaOf(p){ return p.weeks ? (p.weeks.length+' wk · '+p.level) : (p.dur+'min · '+p.level); }

/* landscape card — image on top, title and meta UNDER it (the sampler pattern) */
function flandCard(p,badge){
  return '<div class="fland" onclick="openProgram(\''+p.id+'\')">'+
    '<div class="im" style="background-image:url(\''+progImg(p)+'\')">'+(badge?'<span class="fnew">'+badge+'</span>':'')+'</div>'+
    '<div class="t">'+p.name+'</div><div class="m">'+metaOf(p)+'</div></div>';
}
/* tall activity tile — photo with a light label bar across the bottom */
function factCard(a){
  return '<div class="fact" onclick="openActivity(\''+a.k+'\')">'+
    '<div class="im" style="background-image:url(\''+a.img+'\')"></div>'+
    '<div class="lb">'+a.n+'</div></div>';
}
/* big program card — title over the image */
function fbigCard(p){
  return '<div class="fbig" onclick="openProgram(\''+p.id+'\')" style="background-image:url(\''+progImg(p)+'\')">'+
    '<div class="ov"></div><div class="in"><div class="t">'+p.name+'</div>'+
    '<div class="m">'+(p.weeks?progDays(p)+' DAYS':p.dur+' MIN')+'</div></div></div>';
}
/* gradient browse tile — the coloured Strength / Pilates blocks */
function ftile(p){
  return '<div class="ftile" onclick="openProgram(\''+p.id+'\')" style="background:'+grad(p)+'">'+
    '<div class="t">'+p.name+'</div><div class="ic">'+(p.icon||'')+'</div></div>';
}

const ACTIVITIES=[
  {k:'Fat Loss',  n:'Fat Loss',  img:IMG.hiit},
  {k:'Strength',  n:'Strength',  img:IMG.db},
  {k:'Core',      n:'Core',      img:IMG.core},
  {k:'Beginner',  n:'Beginner',  img:IMG.home},
  {k:'Equipment', n:'Equipment', img:IMG.kb},
  {k:'Recovery',  n:'Recovery',  img:IMG.lowimp}
];
function activityMatch(k,p){
  if(k==='Beginner')  return p.level==='Beginner';
  if(k==='Equipment') return /Kettlebell|KB |Dumbbell|Chair|Towel|Bottle/i.test(p.name);
  /* was a name regex, which swept up chair workouts, "Beginner Foundations"
     and even "BAR Foundations" — none of them recovery work. Now the tile
     matches the real recovery programs and nothing else. */
  if(k==='Recovery')  return p.goal==='Recovery';
  return p.goal===k;
}

function renderTrain(){
  $('tr-segs').innerHTML='<div class="segs">'+TR_SEGS.map(s=>
    '<button class="seg'+(trSeg===s[0]?' on':'')+'" onclick="setTrSeg(\''+s[0]+'\')">'+s[1]+'</button>').join('')+'</div>';
  if(trSeg==='store'){ openStore('programs'); return; }
  if(trSeg==='bar')      return trBar();
  if(trSeg==='recovery') return trRecovery();
  if(trSeg==='foryou')  return trForYou();
  if(trSeg==='plans')   return trPlans();
  if(trSeg==='library') return trLibrary();
  trExplore();
}

/* ── FOR YOU ── */
function fqCard(){
  return '<div class="fqcta" onclick="openFinder()"><div class="ic">🎯</div>'+
    '<div style="flex:1;"><div class="t">Find my program</div>'+
    '<div class="m">Four questions, one match — from '+PROGRAMS.filter(p=>p.weeks).length+' programs</div></div>'+
    '<div class="chev">›</div></div>';
}
function trForYou(){
  const goal=(HF.data.prefs&&HF.data.prefs.goal)||'';
  const lvl=(HF.data.prefs&&HF.data.prefs.level)||'Beginner';
  const going=PROGRAMS.filter(p=>p.weeks&&progDone(p.id)>0&&progDone(p.id)<progDays(p));
  const goalKey=/fat|lose/i.test(goal)?'Fat Loss':/strong|strength/i.test(goal)?'Strength':/move|mobil/i.test(goal)?'Recovery':'';
  const picked=PROGRAMS.filter(p=>!p.weeks&&(goalKey?activityMatch(goalKey,p):p.level===lvl)).slice(0,8);
  const byLevel=PROGRAMS.filter(p=>!p.weeks&&p.level===lvl).slice(0,8);
  let h=fqCard();
  if(going.length){
    h+=fsec('Continue','Pick up where you left off');
    h+=going.map(frow).join('');
  }
  h+=fsec(goalKey?('For your goal · '+goal):'Picked for you','Matched to what you told us in setup');
  h+='<div class="hscroll">'+(picked.length?picked:byLevel).map(p=>flandCard(p)).join('')+'</div>';
  h+=fsec('At your level','Everything marked '+lvl);
  h+=byLevel.slice(0,6).map(p=>frow(p)).join('');
  if(!going.length && !picked.length && !byLevel.length)
    h='<div class="empty">Finish setup and start a program — this page fills itself in.</div>';
  $('tr-body').innerHTML=h;
}

/* ── EXPLORE ──
   Each section claims its cards and the next one takes what is left. Without
   this the same pool of single sessions feeds three strips and the page shows
   the same workout three times — the exact fault found in Hybrid's Explore. */
function trExplore(){
  const singles=PROGRAMS.filter(p=>!p.weeks);
  const multi=PROGRAMS.filter(p=>p.weeks);
  const used=new Set();
  const take=(pool,n)=>{ const out=[];
    for(const p of pool){ if(out.length>=n) break; if(used.has(p.id)) continue; used.add(p.id); out.push(p); }
    return out; };

  // deterministic weekly rotation so the sampler changes but never mid-session
  const wk=Math.floor(new Date().getTime()/6048e5);
  const rotated=singles.map((_,i)=>singles[(wk+i)%singles.length]);

  let h='';
  h+=fsec('Free This Week','Try these one time — everything here is free.');
  h+='<div class="hscroll">'+take(rotated,4).map(p=>flandCard(p)).join('')+'</div>';

  h+=fsec('Activity Types');
  h+='<div class="hscroll">'+ACTIVITIES.map(factCard).join('')+'</div>';

  h+=fsec('Top Programs','Most popular picks right now',true);
  h+='<div class="hscroll">'+take(multi,5).map(fbigCard).join('')+'</div>';

  h+=fsec('Browse Programs','',true);
  h+='<div class="hscroll">'+take(rotated,8).map(ftile).join('')+'</div>';

  h+=fsec('Workouts','New and picked for you');
  h+=take(rotated,8).map((p,i)=>frow(p,i<2?'NEW':'')).join('');

  h+=fsec('Challenges','Commit for a set number of days');
  h+=CHALLENGES.map(c=>frow(c)).join('');
  $('tr-body').innerHTML=h;
}

/* ── PLANS · Netflix-style browse ──
   A billboard for the one plan we think fits you, then rows of posters to scan
   sideways. Picking a plan should feel like picking something to watch.       */
function ncard(p,rank){
  const done=progDone(p.id), tot=progDays(p), pct=tot?Math.round(done/tot*100):0;
  return '<div class="ncard'+(rank?' ranked':'')+'" onclick="openProgram(\''+p.id+'\')">'+
    (rank?'<div class="rk">'+rank+'</div>':'')+
    '<div class="im" style="background-image:url(\''+progImg(p)+'\')">'+
      '<div class="ov"></div>'+
      '<div class="ic">'+(p.icon||'')+'</div>'+
      (done>0?'<div class="pb"><i style="width:'+pct+'%"></i></div>':'')+
      '<div class="in"><div class="t">'+p.name+'</div>'+
      '<div class="m">'+p.weeks.length+' wk · '+p.dur+' min</div></div>'+
    '</div></div>';
}
/* Netflix repeats a title across rows on purpose — different lens, same
   catalogue. What it never does is show two rows with the SAME list, or bury a
   plan in every row. Both are capped here. */
let _rowSeen={}, _rowSigs=new Set();
function nrow(title,list,ranked){
  list=(list||[]).filter(p=>ranked || (_rowSeen[p.id]||0)<3);
  if(!list.length) return '';
  const sig=list.map(p=>p.id).join(',');
  if(_rowSigs.has(sig)) return '';          // an identical row already exists
  _rowSigs.add(sig);
  list.forEach(p=>{ _rowSeen[p.id]=(_rowSeen[p.id]||0)+1; });
  return '<div class="nrow"><div class="nt">'+title+'</div>'+
    '<div class="hscroll">'+list.map((p,i)=>ncard(p,ranked?i+1:0)).join('')+'</div></div>';
}
/* a plan counts as "use what you have" only if its sessions really call for kit */
function usesEquipment(p){
  const names=[];
  (p.weeks||[]).forEach(w=>w.days.forEach(d=>{ if(d.ex) names.push.apply(names,d.ex); }));
  return names.some(n=>{ const e=DB.find(x=>x.n===n); return e && e.eq!=='Bodyweight'; });
}
function trPlans(){
  _rowSeen={}; _rowSigs=new Set();
  const multi=PROGRAMS.filter(p=>p.weeks);
  const lvl=(HF.data.prefs&&HF.data.prefs.level)||'Beginner';
  const goal=(HF.data.prefs&&HF.data.prefs.goal)||'';
  const goalKey=/fat|lose/i.test(goal)?'Fat Loss':/strong|strength/i.test(goal)?'Strength':/move|mobil/i.test(goal)?'Core':'';
  const going=multi.filter(p=>progDone(p.id)>0&&progDone(p.id)<progDays(p));

  const hero=going[0]
    || multi.filter(p=>(goalKey?p.goal===goalKey:true)&&p.level===lvl)[0]
    || multi.filter(p=>p.level===lvl)[0] || multi[0];

  let h='<div class="nhero" style="background-image:url(\''+progImg(hero)+'\')">'+
    '<div class="ov"></div><div class="in">'+
    '<div class="ic">'+(hero.icon||'')+'</div>'+
    '<div class="t">'+hero.name+'</div>'+
    '<div class="tags">'+hero.goal+' · '+hero.level+' · '+hero.weeks.length+' weeks · '+hero.dur+' min a day</div>'+
    '<div class="d">'+hero.desc+'</div>'+
    '<div class="btns">'+
      '<button class="pl" onclick="event.stopPropagation();openProgram(\''+hero.id+'\')">▶  '+
        (progDone(hero.id)>0?'Continue':'Start plan')+'</button>'+
      '<button class="inf" onclick="event.stopPropagation();openProgram(\''+hero.id+'\')">ⓘ  More info</button>'+
    '</div></div></div>';

  const rest=multi.filter(p=>p.id!==hero.id);
  const by=k=>rest.filter(p=>p.goal===k);

  h+='<div class="nrows">';
  const mine=multi.filter(p=>p.id==='custom');
  if(mine.length && mine[0].id!==hero.id) h+=nrow('Made by you',mine);
  if(going.length) h+=nrow('Continue your plan',going);
  h+=nrow('Top 10 in Malaysia today',multi.slice(0,10),true);
  // the goal row and its matching category row are the same list — show one
  if(goalKey) h+=nrow('Because your goal is '+goal.toLowerCase(), by(goalKey));
  ['Fat Loss','Strength','Core'].forEach(k=>{
    if(k===goalKey) return;
    h+=nrow({'Fat Loss':'Burn fat','Strength':'Build strength','Core':'Core & abs'}[k], by(k));
  });
  h+=nrow('Easy to start',            rest.filter(p=>p.level==='Beginner'));
  h+=nrow('Four weeks or less',       rest.filter(p=>p.weeks.length<=4).sort((a,b)=>a.weeks.length-b.weeks.length));
  h+=nrow('The long game',            rest.filter(p=>p.weeks.length>=6));
  h+=nrow('Use what you have',        rest.filter(usesEquipment));
  h+=nrow('Nothing but you',          rest.filter(p=>!usesEquipment(p)));
  h+='</div>';

  h+='<div class="nrow"><div class="nt">Challenges</div>'+CHALLENGES.map(c=>frow(c)).join('')+'</div>';
  h+='<div class="fplan" style="background:linear-gradient(150deg,#3a2030,#141014);margin-top:22px;">'+
     '<div class="t">'+(hasCustom()?'Your custom plan':'Build your own')+'</div>'+
     '<div class="s">'+(hasCustom()
        ? 'Change the activities, days, length or equipment any time — your progress carries over.'
        : 'Pick the activities, the days, the session length and what equipment you have. We build the weeks.')+'</div>'+
     '<button class="pill" onclick="openCustom()">'+(hasCustom()?'Edit my plan':'Build your own')+'</button>'+
     (hasCustom()?'<button class="pill" style="margin-top:9px;color:rgba(255,255,255,.5);" onclick="cpDelete()">Delete it</button>':'')+
     '</div>';
  $('tr-body').innerHTML=h;
}

/* ── LIBRARY ── */
function trLibrary(){
  const started=PROGRAMS.filter(p=>progDone(p.id)>0);
  const done=PROGRAMS.filter(p=>p.weeks&&progDone(p.id)>=progDays(p));
  const favs=(HF.data.favs||[]).length;
  const rows=[
    ['🏃','Exercises',DB.length,"openLibrary()"],
    ['📋','Programs started',started.length,"openActivity('Started')"],
    ['🏆','Programs finished',done.length,"openActivity('Finished')"],
    ['⭐','Saved meals',favs,"switchTab('eat')"],
    ['✅','Sessions logged',HF.count(),"switchTab('progress')"]
  ];
  let h='<div class="flib">'+rows.map(r=>
    '<div class="row" onclick="'+r[3]+'"><span class="ic">'+r[0]+'</span>'+
    '<span class="lb">'+r[1]+'</span><span class="ct">'+r[2]+'</span><span class="cv">›</span></div>').join('')+'</div>';
  h+=fsec('By equipment','Everything you can train with today');
  const eqs=Array.from(new Set(DB.map(e=>e.eq)));
  h+='<div class="flib">'+eqs.map(q=>{
    const n=DB.filter(e=>e.eq===q).length;
    return '<div class="row" onclick="libEq=\''+q+'\';openLibrary()"><span class="ic">🎽</span>'+
      '<span class="lb">'+q+'</span><span class="ct">'+n+'</span><span class="cv">›</span></div>';
  }).join('')+'</div>';
  if(!started.length) h+='<div class="empty">Start a program and it shows up here.</div>';
  $('tr-body').innerHTML=h;
}

/* ── filtered program list (activity tiles + library rows land here) ── */
let curActivity='';
function openActivity(k){
  curActivity=k;
  let list;
  if(k==='Started')       list=PROGRAMS.filter(p=>progDone(p.id)>0);
  else if(k==='Finished') list=PROGRAMS.filter(p=>p.weeks&&progDone(p.id)>=progDays(p));
  else                    list=PROGRAMS.filter(p=>activityMatch(k,p));
  let h='<div class="hgroup"><div class="k">Activity</div><h2>'+k+'</h2><p>'+list.length+' '+
        (list.length===1?'program':'programs')+'</p></div>';
  if(k==='Recovery'){
    h+='<div class="today"><div class="tk"><span style="color:var(--hyrox);font-weight:800;">● IN BUILD</span></div>'+
       '<div class="tt">Knee Strength &amp; Mobility</div>'+
       '<div class="tm">Mobility &amp; activation → basic strength → progressive strength → return to movement.</div>'+
       '<div style="font-size:13px;color:#8a8a8a;margin-top:6px;line-height:1.6;">Ships with a short screening step first, because some knees should see a physio before any program.</div></div>';
  }
  h+= list.length ? list.map(p=>frow(p)).join('') : '<div class="empty">Nothing here yet.</div>';
  if(k==='Recovery'){
    const mob=DB.filter(e=>e.m==='Mobility'||e.t==='hold');
    h+=fsec('Mobility &amp; holds')+'<div style="display:flex;flex-direction:column;gap:9px;">'+
      mob.slice(0,14).map(e=>'<div class="wrow"><div class="tx"><div class="t">'+e.n+'</div>'+
      '<div class="m">'+e.m+' · '+(e.dur||40)+'s hold</div></div></div>').join('')+'</div>'+
      '<p style="font-size:13px;color:var(--dim2);line-height:1.7;margin-top:22px;">HITFAT+ is not medical care. '+
      'If a joint is swollen, gives way, locks, or hurts after an injury or surgery, see a doctor or physiotherapist before training it.</p>';
  }
  $('lib-body').innerHTML=h;
  hidePanels(); $('library').style.display='block'; $('screen').scrollTop=0;
}

/* ── HITFAT BAR ──
   Free, whether or not the buyer owns the bar. The sessions are what sell it,
   so putting them behind anything would be working against the sale. */
function trBar(){
  const bp=PROGRAMS.filter(isBarProgram);
  let h='';
  h+='<div class="ecta" style="background:'+egrad('#241a12','#0b0906','#FF8A1E')+';" onclick="openStore(\'bar\')">'+
     '<div class="ic">🏋️</div><div class="t">Train with the HITFAT BAR</div>'+
     '<div class="s">A bar and five bands — squat, hinge, press, row and carry, in the space of a doorway.</div>'+
     '<div class="go">See the bar · RM'+BAR_PRICE+'</div>'+
     '<div class="lock">'+bp.length+' PROGRAMS · FREE FOR EVERYONE</div></div>';
  if(!barFootageReady())
    h+='<div class="mpnote" style="border-color:rgba(245,158,11,.35);color:#f59e0b;">'+
       'The sessions and sets are ready to follow now. The clips are still being filmed — '+
       'each exercise says so in the player rather than showing you the wrong movement.</div>';
  h+=fsec('BAR programs','Free · built around the bar and bands');
  h+=bp.map(p=>frow(p,'FREE')).join('');
  h+=fsec('BAR exercises',BAR_DB.length+' movements in the library');
  h+='<div class="flib">'+['hinge','squat','push','pull','full','core'].map(t=>{
      const n=BAR_DB.filter(e=>e.t===t).length; if(!n) return '';
      const label={hinge:'Hinge',squat:'Squat & lunge',push:'Press',pull:'Row & pull',full:'Full body',core:'Core & carry'}[t];
      return '<div class="row" onclick="openLibrary(\''+BAR_EQ+'\')"><div class="ic">•</div>'+
        '<div class="lb">'+label+'</div><div class="ct">'+n+'</div><div class="cv">›</div></div>';
    }).join('')+'</div>';
  $('tr-body').innerHTML=h;
}

/* ── RECOVERY ──
   Prehab: building range and joint resilience before something complains.
   Not treatment, and the notice below says so once rather than hedging in
   every description. */
function trRecovery(){
  const rh=PROGRAMS.filter(isRehabProgram);
  let h='';
  h+='<div class="ecta" style="background:'+egrad('#0f1f22','#07090a','#38bdf8')+';">'+
     '<div class="ic">🧘</div><div class="t">Recovery &amp; prehab</div>'+
     '<div class="s">Joint-by-joint work for knees, shoulders, hips, ankles and the back a desk gives you. '+
     REHAB_DB.length+' movements, '+rh.length+' programs.</div></div>';
  h+='<div class="mpnote" style="border-color:rgba(56,189,248,.35);color:#5eb8ff;">'+
     'This is training to build resilience, not treatment for an injury. If a movement hurts, '+
     'stop doing it — and if something is already painful, see a doctor or physiotherapist first.</div>';
  if(!rehabFootageReady())
    h+='<div class="mpnote" style="border-color:rgba(245,158,11,.35);color:#f59e0b;">'+
       'Sets and reps are ready to follow. Most clips are still being filmed — the player says which, '+
       'rather than showing you a different movement.</div>';

  h+=fqCard();
  h+=fsec('Where does it bother you?','Pick the joint, not the workout');
  h+='<div class="hscroll">'+REHAB_JOINTS.map(j=>
    '<div class="eslot" onclick="openJoint(\''+j.k+'\')" style="width:172px;">'+
    '<div class="e">'+j.e+'</div><div class="n">'+j.n+'</div>'+
    '<div class="v" style="font-size:20px;">'+rehabFor(j.k).length+'</div>'+
    '<div class="m" style="line-height:1.35;">'+j.d+'</div></div>').join('')+'</div>';

  h+=fsec('Recovery programs','Start with Daily Mobility 10 if you are not sure');
  h+=rh.map(p=>frow(p, isPaidProgram(p) ? 'RM'+programPrice(p) : 'FREE')).join('');
  $('tr-body').innerHTML=h;
}

/* One joint, every movement for it — the filmed ones included. */
function openJoint(k){
  const j=REHAB_JOINTS.filter(x=>x.k===k)[0]; if(!j) return;
  const names=rehabFor(k);
  hidePanels(); $('library').style.display='block';
  $('lib-body').innerHTML='<div class="hgroup"><div class="k">Recovery</div><h2>'+j.n+'</h2>'+
    '<p>'+j.d+'.</p></div>'+
    '<div class="mpnote" style="border-color:rgba(56,189,248,.35);color:#5eb8ff;">'+
    'If a movement hurts, stop. Prehab should feel like work, never like pain.</div>'+
    '<div class="flib">'+names.map(n=>{
      const e=DB.filter(x=>x.n===n)[0]; if(!e) return '';
      return '<div class="row" onclick="playExercise(\''+n.replace(/'/g,"\\'")+'\')">'+
        '<div class="ic">'+(e.v?'▶':'○')+'</div><div class="lb">'+n+'</div>'+
        '<div class="ct">'+e.sets+'×'+e.reps+'</div><div class="cv">›</div></div>';
    }).join('')+'</div>'+
    '<button class="bigbtn sec" onclick="switchTab(\'train\')">← Back to Recovery</button>';
  $('screen').scrollTop=0;
}


