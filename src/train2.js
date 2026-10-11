/* ═══════════════ TRAIN · Fitness+ structure ═══════════════
   Four segments behind a pill control, and each section built to the pattern it
   copies: sampler strip, activity tiles, big programs, gradient browse tiles,
   and a workout list. Content is HITFAT+'s own.                               */

let trSeg='explore';
const TR_SEGS=[['foryou','For You'],['explore','Explore'],['plans','Plans'],['recovery','Recovery'],['bar','HITFAT BAR'],['library','Library']]
  .filter(s=>BAR_ENABLED || s[0]!=='bar');
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
    '<div class="im" style="background-image:url(\''+progImg(p)+'\')">'+(badge?'<span class="fnew">'+badge+'</span>':'')+lockTag(p)+'</div>'+
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
  const sub = p.weeks ? wks(p.weeks.length).replace(/^\w/,c=>c.toUpperCase())+' of '+(p.goal||'training').toLowerCase() : p.level;
  return '<div class="fbig" onclick="openProgram(\''+p.id+'\')" style="background-image:url(\''+progImg(p)+'\')">'+
    '<div class="ov"></div>'+lockTag(p)+'<div class="in"><div class="t">'+p.name+'</div>'+
    '<div class="s">'+sub+'</div></div>'+
    '<div class="m">'+(p.weeks?planSessions(p)+' WORKOUTS':p.dur+' MIN')+'</div></div>';
}
/* Training days, not calendar days: what "18 EPISODES" counts on Fitness+. */
function planSessions(p){ let n=0; (p.weeks||[]).forEach(w=>(w.days||[]).forEach(d=>{ if(!d.rest) n++; })); return n; }
function planPerWeek(p){ const w=(p.weeks||[])[0]; return w ? (w.days||[]).filter(d=>!d.rest).length : 0; }

/* ── Browse Programs: the bright category tiles ── */
const BROWSE=[
  {k:'Fat Loss',  n:'Fat Loss',          g:'linear-gradient(135deg,#8A0F12 0%,#E0341E 55%,#FF8A3D 100%)', ic:'flame'},
  {k:'Strength',  n:'Strength',          g:'linear-gradient(135deg,#1C1C1E 0%,#5A0A0E 55%,#DC1A22 100%)', ic:'workout'},
  {k:'Core',      n:'Core & Abs',        g:'linear-gradient(135deg,#3A2600 0%,#A87400 55%,#FFC21A 100%)', ic:'target'},
  {k:'Beginner',  n:'Easy to Start',     g:'linear-gradient(135deg,#2C2C2E 0%,#5A4A1E 55%,#D9A21A 100%)', ic:'sunrise'},
  {k:'Short',     n:'Four Weeks or Less',g:'linear-gradient(135deg,#2A0608 0%,#8E1218 55%,#E8424A 100%)', ic:'clock'},
  {k:'Long',      n:'The Long Game',     g:'linear-gradient(135deg,#0B0B0C 0%,#3A3A3C 55%,#8E8E93 100%)', ic:'trophy'}
];
function planGroup(k){
  const all=trainingPlans().filter(p=>p.id!=='custom');
  if(k==='Short') return all.filter(p=>p.weeks.length<=4).sort((a,b)=>a.weeks.length-b.weeks.length);
  if(k==='Long')  return all.filter(p=>p.weeks.length>=6);
  if(k==='Beginner') return all.filter(p=>p.level==='Beginner');
  return all.filter(p=>p.goal===k);
}
function fcat(b){
  return '<div class="ftile fcat" onclick="openPlanGroup(\''+b.k+'\')" style="background:'+b.g+'">'+
    '<div class="t">'+b.n+'</div><div class="ic">'+glyph(b.ic)+'</div></div>';
}
function openPlanGroup(k){
  const b=BROWSE.filter(x=>x.k===k)[0]||{n:k}, list=planGroup(k);
  let h='<div class="hgroup"><div class="k">Programs</div><h2>'+b.n+'</h2><p>'+list.length+' '+
        (list.length===1?'program':'programs')+'</p></div>';
  h+= list.length ? list.map(p=>frow(p)).join('') : '<div class="empty">Nothing here yet.</div>';
  $('lib-body').innerHTML=h;
  hidePanels(); $('library').style.display='block'; $('screen').scrollTop=0;
}

/* ── Workouts: columns of three rows, paged sideways ── */
function fwRow(p,badge){
  return '<div class="fwr" onclick="openProgram(\''+p.id+'\')">'+
    '<div class="th" style="background-image:url(\''+progImg(p)+'\');'+thumbCrop(p.name)+'">'+
      (badge?'<span class="fnew">'+badge+'</span>':'')+lockTag(p)+'</div>'+
    '<div class="tx"><div class="t">'+p.name+'</div><div class="m">'+p.dur+'min · '+(p.goal||p.level)+'</div></div></div>';
}
function fwCols(list){
  let h='<div class="hscroll fwcols">';
  for(let i=0;i<list.length;i+=3)
    h+='<div class="fwcol">'+list.slice(i,i+3).map((p,j)=>fwRow(p,i+j<2?'NEW':'')).join('')+'</div>';
  return h+'</div>';
}

/* ── Collections: the challenges, as big cards ── */
function fcoll(c){
  return '<div class="fcoll" onclick="openProgram(\''+c.id+'\')" style="background:'+grad(c)+'">'+
    '<div class="ic">'+glyph((c.icon||''))+'</div>'+
    '<div class="t">'+c.name+'</div>'+
    '<div class="m">'+(c.days||progDays(c))+' DAYS · '+(c.dur||'')+' MIN/DAY</div>'+
    (c.desc?'<div class="d">'+c.desc+'</div>':'')+'</div>';
}

/* ── Plans: Made For You, the way Fitness+ lays a plan out ── */
const PLAN_GRADS={
  'Fat Loss':'linear-gradient(118deg,#2A0C10 0%,#8E1E2C 42%,#F06A4E 78%,#FFB28A 100%)',
  'Strength':'linear-gradient(118deg,#141414 0%,#4A0C10 42%,#B81A1F 72%,#F2645A 100%)',
  'Core':    'linear-gradient(118deg,#1A1406 0%,#5A4206 45%,#B88A12 75%,#F2C94C 100%)'
};
function fplanCard(p){
  const done=progDone(p.id), tot=progDays(p), going=done>0&&done<tot;
  return '<div class="fmade" style="background:'+(PLAN_GRADS[p.goal]||PLAN_GRADS.Strength)+'">'+lockTag(p)+
    '<div class="t">'+p.name+'</div>'+
    '<div class="s">'+(p.goal||'')+' · '+p.level+'</div>'+
    '<div class="mt">'+planPerWeek(p)+' DAYS A WEEK · '+p.dur+'MIN/DAY</div>'+
    (going?'<div class="pb"><i style="width:'+Math.round(done/tot*100)+'%"></i></div>':'')+
    '<button class="fglass" onclick="openProgram(\''+p.id+'\')">'+glyph('calendar')+
      (going?'Continue · Day '+(done+1):'Plan Preview')+'</button></div>';
}
function madeForYou(){
  const lvl=(HF.data.prefs&&HF.data.prefs.level)||'Beginner';
  const goal=(HF.data.prefs&&HF.data.prefs.goal)||'';
  const want=/fat|lose/i.test(goal)?'Fat Loss':/strong|strength/i.test(goal)?'Strength':/core|abs/i.test(goal)?'Core':'';
  const all=trainingPlans().filter(p=>p.id!=='custom');
  const going=all.filter(p=>progDone(p.id)>0&&progDone(p.id)<progDays(p));
  const score=p=>(going.indexOf(p)>=0?-10:0)+(want&&p.goal===want?0:3)+(p.level===lvl?0:2)+(/^sig/.test(p.id)?0:1);
  return all.slice().sort((a,b)=>score(a)-score(b)).slice(0,6);
}

/* gradient browse tile — the coloured Strength / Pilates blocks */
function ftile(p){
  return '<div class="ftile" onclick="openProgram(\''+p.id+'\')" style="background:'+grad(p)+'">'+
    '<div class="t">'+p.name+'</div><div class="ic">'+glyph((p.icon||''))+'</div>'+lockTag(p)+'</div>';
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

/* T42 has a seat in Train, not only a banner on Home: when an edition is
   open (or one has finished for this member), it is the first chip and the
   first card. It opens the T42 panel — the challenge lives there. */
function t42InTrain(){
  return typeof T42!=='undefined' && T42.state==='ready' && !!(T42.challenge||T42.past);
}
function renderTrain(){
  if(trSeg==='t42'){ trSeg='foryou'; if(typeof openT42==='function') openT42(); return; }
  const segs=(t42InTrain()?[['t42','T42']]:[]).concat(TR_SEGS);
  /* The large title over the pills, as Fitness+ puts its name over For You,
     Explore, Plans and Library — the date small above it, as every tab has. */
  const dl=new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'}).toUpperCase();
  $('tr-segs').innerHTML='<div class="hsum"><div class="hsum-l"><div class="k">'+dl+'</div><div class="t">Train</div></div></div>'+
    '<div class="segs">'+segs.map(s=>
    '<button class="seg'+(trSeg===s[0]?' on':'')+'" onclick="setTrSeg(\''+s[0]+'\')">'+s[1]+'</button>').join('')+'</div>';
  /* More pills than fit: bring the chosen one into view, so Library (the
     last) is never selected off the edge of the screen. */
  try{
    const row=$('tr-segs').querySelector('.segs'), on=row&&row.querySelector('.seg.on');
    if(row && on && typeof on.offsetLeft==='number'){
      const want=on.offsetLeft-(row.clientWidth-on.offsetWidth)/2;
      row.scrollLeft=Math.max(0,want);
    }
  }catch(e){}
  if(trSeg==='store'){ openStore('programs'); return; }
  if(trSeg==='bar' && BAR_ENABLED) return trBar();
  if(trSeg==='recovery') return trRecovery();
  if(trSeg==='foryou')  return trForYou();
  if(trSeg==='plans')   return trPlans();
  if(trSeg==='library') return trLibrary();
  trExplore();
}

/* ── FOR YOU ── */
function fqCard(){
  return '<div class="fqcta" onclick="openFinder()"><div class="ic">'+glyph('target')+'</div>'+
    '<div style="flex:1;"><div class="t">Find my program</div>'+
    '<div class="m">Four questions, one match — from '+PROGRAMS.filter(p=>p.weeks).length+' programs</div></div>'+
    '<div class="chev">›</div></div>';
}
/* ── For You, after Fitness+ ──
   Someone who is not a member meets the membership first, on a collage of
   the programs it opens. A member meets their plan: today's session and
   the button that starts it. Then what suits them, short sessions, and the
   programs most people start with. */
function fyJoinCard(){
  const pics=[]; trainingPlans().concat(PROGRAMS.filter(p=>!p.weeks)).forEach(p=>{
    const u=progImg(p); if(pics.indexOf(u)<0) pics.push(u); });
  const m=(SUB_PLANS[0].price/12).toFixed(2);
  return '<div class="fyjoin"><div class="fyjoin-grid">'+pics.slice(0,6).map((u,i)=>
      '<div style="background-image:url(\''+u+'\')"></div>').join('')+'</div>'+
    '<div class="fyjoin-b"><div class="t">Join HITFAT+</div>'+
    '<div class="s">Every program, meal plan and AI meal scan — designed for all levels.</div>'+
    '<button class="bigbtn" onclick="openPaywall()">See Membership</button>'+
    '<div class="f">From RM'+m+' a month on the 12-month plan. No auto-renew.</div>'+
    '<button class="fyjoin-alt" onclick="openPaywall();pwSetPlan(\'sub_plus_6m\')">or the 6-month plan '+glyph('chevleft')+'</button>'+
    '</div></div>';
}
function nextSession(p){
  const done=progDone(p.id); let c=0, gi=-1;
  (p.weeks||[]).forEach(w=>w.days.forEach(d=>{ if(gi<0 && c>=done && !d.rest) gi=c; c++; }));
  return gi;
}
function sessionAt(p,gi){
  let c=0, out=null;
  (p.weeks||[]).forEach((w,wi)=>w.days.forEach(d=>{ if(c===gi) out={day:d,week:wi+1}; c++; }));
  return out;
}
function fyPlanCard(p){
  const done=progDone(p.id), tot=progDays(p), gi=nextSession(p), at=gi>=0?sessionAt(p,gi):null;
  return '<div class="fmade fyplan" style="background:'+(PLAN_GRADS[p.goal]||PLAN_GRADS.Strength)+'">'+
    '<div class="t">'+p.name+'</div>'+
    '<div class="s">'+(at?'Week '+at.week+' · ':'')+'Day '+Math.min(done+1,tot)+' of '+tot+'</div>'+
    '<div class="pb"><i style="width:'+Math.round(done/tot*100)+'%"></i></div>'+
    (at?'<div class="fyplan-next"><div class="k">Up Next</div><div class="n">'+(at.day.name||'Workout')+'</div>'+
        '<div class="m">'+(at.day.ex?at.day.ex.length:0)+' exercises · '+p.dur+' min</div></div>'+
        '<button class="bigbtn" onclick="openDay(\''+p.id+'\','+gi+')">'+glyph('play')+'Start Day '+(gi+1)+'</button>'
      :'<div class="fyplan-next"><div class="n">Every day done.</div></div>')+
    '<button class="fglass" onclick="openProgram(\''+p.id+'\')">'+glyph('calendar')+'View Plan</button></div>';
}
function trForYou(){
  const goal=(HF.data.prefs&&HF.data.prefs.goal)||'';
  const lvl=(HF.data.prefs&&HF.data.prefs.level)||'Beginner';
  const going=trainingPlans().filter(p=>progDone(p.id)>0&&progDone(p.id)<progDays(p));
  const goalKey=/fat|lose/i.test(goal)?'Fat Loss':/strong|strength/i.test(goal)?'Strength':/core|abs/i.test(goal)?'Core':'';
  const singles=PROGRAMS.filter(p=>!p.weeks&&!p.rehab);
  /* What the line under the title promises is what the row holds: goal and
     level when there are enough of those, then level alone, then a mix —
     never "matched to your level" over sessions at another level. */
  const byGoal=goalKey?singles.filter(p=>activityMatch(goalKey,p)&&p.level===lvl):[];
  const byLvl=singles.filter(p=>p.level===lvl);
  let pick, pickSub;
  if(byGoal.length>=3){ pick=byGoal.slice(0,8); pickSub='For your goal: '+goal.toLowerCase()+' · '+lvl; }
  else if(byLvl.length>=3){ pick=byLvl.slice(0,8); pickSub='Matched to your level · '+lvl; }
  else { pick=singles.slice(0,8); pickSub='A mix to start with'; }
  const quick=singles.filter(p=>p.dur<=20&&pick.indexOf(p)<0).slice(0,9);

  let h='';
  if(!contentOpen()) h+=fyJoinCard();
  if(t42InTrain()) h+=t42HomeCard();

  if(going.length){
    h+=fsec('Your Plan',going.length>1?'You have '+going.length+' plans going.':'Today, and the rest of the week.');
    h+='<div class="hscroll fmades">'+going.map(fyPlanCard).join('')+'</div>';
  } else {
    h+=fsec('Find Your Plan','Four questions, one match.');
    h+=fqCard();
  }
  h+=fsec('Picked for You',pickSub);
  h+='<div class="hscroll">'+pick.map((p,i)=>flandCard(p,i<2?'NEW':'')).join('')+'</div>';
  if(quick.length){
    h+=fsec('Quick Workouts','Twenty minutes or less.');
    h+=fwCols(quick);
  }
  h+=fsec('Popular Programs','Where most members start.',true);
  h+='<div class="hscroll">'+trainingPlans().filter(p=>p.id!=='custom'&&going.indexOf(p)<0).slice(0,5).map(fbigCard).join('')+'</div>';
  $('tr-body').innerHTML=h;
}

/* ── EXPLORE ──
   Each section claims its cards and the next one takes what is left. Without
   this the same pool of single sessions feeds three strips and the page shows
   the same workout three times — the exact fault found in Hybrid's Explore. */
function trExplore(){
  const singles=PROGRAMS.filter(p=>!p.weeks);
  const multi=trainingPlans();
  const used=new Set();
  const take=(pool,n)=>{ const out=[];
    for(const p of pool){ if(out.length>=n) break; if(used.has(p.id)) continue; used.add(p.id); out.push(p); }
    return out; };

  // deterministic weekly rotation so the sampler changes but never mid-session
  const wk=Math.floor(new Date().getTime()/6048e5);
  const rotated=singles.map((_,i)=>singles[(wk+i)%singles.length]);

  let h=(contentOpen()?'':fyJoinCard())+(t42InTrain()?t42HomeCard():'');
  h+=fsec('This Week','A new set of sessions every week.');
  h+='<div class="hscroll">'+take(rotated,6).map((p,i)=>flandCard(p,i<2?'NEW':'')).join('')+'</div>';

  h+=fsec('Activity Types');
  h+='<div class="hscroll">'+ACTIVITIES.map(factCard).join('')+'</div>';

  h+=fsec('Top Programs','HITFAT signature programs first',true);
  h+='<div class="hscroll">'+take(multi,5).map(fbigCard).join('')+'</div>';

  h+=fsec('Browse Programs','',true);
  h+='<div class="hscroll">'+BROWSE.filter(b=>planGroup(b.k).length).map(fcat).join('')+'</div>';

  h+=fsec('Workouts','New and picked for you');
  h+=fwCols(take(rotated,9));

  h+=fsec('Collections','Challenges with a finish line',true);
  h+='<div class="hscroll">'+CHALLENGES.map(fcoll).join('')+'</div>';
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
      '<div class="ov"></div>'+lockTag(p)+
      '<div class="ic">'+glyph((p.icon||''))+'</div>'+
      (done>0?'<div class="pb"><i style="width:'+pct+'%"></i></div>':'')+
      '<div class="in"><div class="t">'+p.name+'</div>'+
      '<div class="m">'+p.weeks.length+' wk · '+p.dur+' min</div></div>'+
    '</div></div>';
}
/* Netflix repeats a title across rows on purpose — different lens, same
   catalogue. What it never does is show two rows with the SAME list, or bury a
   plan in every row. Both are capped here. */
let _rowSeen={}, _rowSigs=new Set();
function nrow(title,list,ranked,sub){
  list=(list||[]).filter(p=>ranked || (_rowSeen[p.id]||0)<3);
  if(!list.length) return '';
  const sig=list.map(p=>p.id).join(',');
  if(_rowSigs.has(sig)) return '';          // an identical row already exists
  _rowSigs.add(sig);
  list.forEach(p=>{ _rowSeen[p.id]=(_rowSeen[p.id]||0)+1; });
  /* the same section head as every other row in the app: Title Case, a line under it */
  return '<div class="nrow">'+fsec(title,sub||'')+
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
  const multi=trainingPlans().filter(p=>p.id!=='custom');
  const lvl=(HF.data.prefs&&HF.data.prefs.level)||'Beginner';
  const goal=(HF.data.prefs&&HF.data.prefs.goal)||'';
  const goalKey=/fat|lose/i.test(goal)?'Fat Loss':/strong|strength/i.test(goal)?'Strength':/move|mobil|core|abs/i.test(goal)?'Core':'';

  /* Made For You: big plan cards, the one in progress first, then the
     ones matched to this member's goal and level. */
  let h='';
  h+=fsec('Made For You','Programs matched to your goal and level. Preview one before you start.');
  h+='<div class="hscroll fmades">'+madeForYou().map(fplanCard).join('')+'</div>';

  /* Build Your Own: the custom plan, on the gold card */
  h+=fsec('Build Your Own','Choose the activities and set your schedule.');
  h+='<div class="fcustom">'+
     '<div class="t">'+(hasCustom()?'Your Custom Plan':'Custom Plan')+'</div>'+
     '<div class="s">'+(hasCustom()
        ? 'Change the activities, days, length or equipment any time — your progress carries over.'
        : 'Your activities, workout length, days of the week and the equipment you have.')+'</div>'+
     '<button class="fglass" onclick="openCustom()">'+(hasCustom()?'Edit My Plan':'Build Your Own')+'</button>'+
     (hasCustom()?'<button class="fglass fglass-q" onclick="cpDelete()">Delete it</button>':'')+
     '</div>';

  /* Everything else, by what it is for */
  const by=k=>multi.filter(p=>p.goal===k);
  h+='<div class="nrows">';
  const ROWS={'Fat Loss':['Burn Fat','Plans built around the deficit.'],
              'Strength':['Build Strength','Stronger, week on week.'],
              'Core':['Core & Abs','A stronger middle, and a back that thanks you.']};
  if(goalKey) h+=nrow(ROWS[goalKey][0], by(goalKey), false, 'For your goal.');
  ['Fat Loss','Strength','Core'].forEach(k=>{
    if(k===goalKey) return;
    h+=nrow(ROWS[k][0], by(k), false, ROWS[k][1]);
  });
  h+=nrow('Easy to Start',      multi.filter(p=>p.level===lvl&&p.level==='Beginner'), false, 'Beginner plans, at your level.');
  h+=nrow('Four Weeks or Less', multi.filter(p=>p.weeks.length<=4).sort((a,b)=>a.weeks.length-b.weeks.length), false, 'Short plans, quick to finish.');
  h+=nrow('The Long Game',      multi.filter(p=>p.weeks.length>=6), false, 'Six weeks and more, for the real change.');
  h+='</div>';
  $('tr-body').innerHTML=h;
}

/* ── LIBRARY ── */
/* ── Library, after Fitness+ ──
   One grouped list in the accent colour — what HITFAT+ holds and what is
   yours in it, each with its count — then what you trained last, or the
   empty state that says it will appear there. */
function trLibrary(){
  const singles=PROGRAMS.filter(p=>!p.weeks&&!p.rehab);
  const plans=trainingPlans().filter(p=>p.id!=='custom');
  const going=trainingPlans().filter(p=>progDone(p.id)>0&&progDone(p.id)<progDays(p));
  const done=trainingPlans().filter(p=>progDone(p.id)>=progDays(p)&&progDays(p)>0);
  const rows=[
    ['workout',  'Workouts',     singles.length,              "openLibList('workouts')"],
    ['clipboard','Programs',     plans.length,                "openLibList('programs')"],
    ['play',     'Exercises',    libDB().length,              "openLibrary()"],
    ['trophy',   'Collections',  CHALLENGES.length,           "openLibList('collections')"],
    ['repeat',   'In Progress',  going.length,                "openActivity('Started')"],
    ['medal',    'Finished',     done.length,                 "openActivity('Finished')"],
    ['star',     'Saved Meals',  (HF.data.favs||[]).length,   "switchTab('eat')"]
  ];
  let h='<div class="flib2">'+rows.map(r=>
    '<div class="row" onclick="'+r[3]+'"><span class="ic">'+glyph(r[0])+'</span>'+
    '<span class="lb">'+r[1]+'</span><span class="ct">'+r[2]+'</span><span class="cv">›</span></div>').join('')+'</div>';

  /* what you trained last */
  const recent=Object.keys(HF.data.sessions||{}).map(k=>Object.assign({key:k},HF.data.sessions[k]))
    .filter(x=>x&&x.date).sort((a,b)=>String(b.date).localeCompare(String(a.date))).slice(0,8);
  if(!recent.length){
    h+='<div class="flib-empty">'+glyph('clock')+'<div class="t">Your Recently Trained</div>'+
       '<div class="s">Workouts you finish will show up in your Library.</div></div>';
  } else {
    h+=fsec('Recently Trained','The last sessions you finished.');
    h+='<div class="pdx-eps">'+recent.map(x=>{
      const pid=String(x.key).replace(/-d\d+$/,'').replace(/-\d{4}-\d\d-\d\d$/,'');
      const p=findProg(pid);
      const when=new Date(x.date); const d=isNaN(when)?'':when.toLocaleDateString('en-GB',{day:'numeric',month:'short'});
      return '<div class="fwr"'+(p?' onclick="openProgram(\''+p.id+'\')"':'')+'>'+
        '<div class="th" style="background-image:url(\''+(p?progImg(p):IMG.home)+'\');'+thumbCrop(x.name||'')+'"></div>'+
        '<div class="tx"><div class="t">'+(x.name||'Workout')+'</div>'+
        '<div class="m">'+[d, x.mins?x.mins+'min':'', p&&p.name!==x.name?p.name:''].filter(Boolean).join(' · ')+'</div></div></div>';
    }).join('')+'</div>';
  }
  $('tr-body').innerHTML=h;
}
/* The catalogue lists the Library rows open onto. */
function openLibList(k){
  const T={workouts:['Workouts',PROGRAMS.filter(p=>!p.weeks&&!p.rehab)],
           programs:['Programs',trainingPlans().filter(p=>p.id!=='custom')],
           collections:['Collections',CHALLENGES]}[k];
  if(!T) return;
  let h='<div class="hgroup"><div class="k">Library</div><h2>'+T[0]+'</h2><p>'+T[1].length+' in HITFAT+</p></div>';
  /* Collections are posters wherever they appear, as in Explore and in
     Fitness+ — here stacked full width rather than as rows. */
  h+= k==='collections' ? '<div class="fcolls">'+T[1].map(fcoll).join('')+'</div>' : T[1].map(p=>frow(p)).join('');
  $('lib-body').innerHTML=h;
  hidePanels(); $('library').style.display='block'; $('screen').scrollTop=0;
}

/* ── filtered program list (activity tiles + library rows land here) ── */
let curActivity='';
function openActivity(k){
  if(k==='Recovery' && !RECOVERY_LIVE){ switchTab('train'); setTrSeg('recovery'); return; }
  curActivity=k;
  let list;
  if(k==='Started')       list=PROGRAMS.filter(p=>progDone(p.id)>0);
  else if(k==='Finished') list=PROGRAMS.filter(p=>p.weeks&&progDone(p.id)>=progDays(p));
  else                    list=PROGRAMS.filter(p=>activityMatch(k,p));
  /* Started and Finished are reached from the Library and are named there
     In Progress and Finished; the activity tiles keep their own names. */
  const fromLib=(k==='Started'||k==='Finished');
  let h='<div class="hgroup"><div class="k">'+(fromLib?'Library':'Activity')+'</div><h2>'+(k==='Started'?'In Progress':k)+'</h2><p>'+list.length+' '+
        (list.length===1?'program':'programs')+'</p></div>';
  if(k==='Recovery'){
    h+='<div class="today"><div class="tk"><span style="color:var(--hyrox);font-weight:800;">● IN BUILD</span></div>'+
       '<div class="tt">Knee Strength &amp; Mobility</div>'+
       '<div class="tm">Mobility &amp; activation → basic strength → progressive strength → return to movement.</div>'+
       '<div style="font-size:13px;color:#8a8a8a;margin-top:6px;line-height:1.6;">Ships with a short screening step first, because some knees should see a physio before any program.</div></div>';
  }
  h+= list.length ? list.map(p=>frow(p)).join('') : '<div class="empty">Nothing here yet.</div>';
  if(k==='Recovery'){
    const mob=libDB().filter(e=>e.m==='Mobility'||e.t==='hold');
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
  const started=bp.filter(p=>progDone(p.id)>0 && progDone(p.id)<progDays(p));
  let h='';

  /* ── the hero ── the bar is a physical product, so the top of this screen
     has one job: make somebody want it, and give somebody who owns it a way
     straight back into training. */
  h+='<div class="barhero" onclick="openStore(\'bar\')">'+
     '<div class="bh-k">HITFAT BAR</div>'+
     '<div class="bh-t">A gym that folds<br>into a drawer</div>'+
     '<div class="bh-s">A bar and five bands. Squat, hinge, press, row and carry — '+
     'the five patterns, in the space of a doorway.</div>'+
     '<div class="bh-row">'+
       (ownsBar()
         ? '<span class="bh-own">You own the bar</span>'
         : '<span class="bh-cta">Get the bar · RM'+BAR_PRICE+'</span><span class="bh-was">RM'+BAR_WAS+'</span>')+
     '</div>'+
     '<div class="bh-f">'+bp.length+' programs · '+BAR_DB.length+' movements · free for everyone</div>'+
     '</div>';

  /* Filming is not finished. Saying so here costs a little polish and buys
     the one thing a training app cannot recover from being wrong about. */
  if(!barFootageReady()){
    const fc=barFootageCount();
    h+='<div class="mpnote" style="border-color:rgba(245,158,11,.35);color:var(--note-amber);">'+
       (fc.have
         ? fc.have+' of '+fc.total+' movements are filmed. The rest are still being shot — '+
           'each one says so in the player rather than showing you a different exercise.'
         : 'Sets and sessions are ready to follow now. The clips are still being filmed — '+
           'each movement says so in the player rather than showing you a different exercise.')+
       '</div>';
  }

  if(started.length){
    h+=fsec('Pick up where you left off','');
    h+='<div class="hscroll barrow">'+started.map(p=>barCard(p,true)).join('')+'</div>';
  }

  h+=fsec('Start here','Two weeks to learn the five patterns');
  const first=bp.filter(p=>p.id==='bar1');
  h+='<div class="hscroll barrow">'+(first.length?first:bp.slice(0,1)).map(p=>barCard(p)).join('')+'</div>';

  const byGoal={};
  bp.forEach(p=>{ (byGoal[p.goal]=byGoal[p.goal]||[]).push(p); });
  Object.keys(byGoal).forEach(g=>{
    h+=fsec(g,byGoal[g].length+' program'+(byGoal[g].length===1?'':'s'));
    h+='<div class="hscroll barrow">'+byGoal[g].map(p=>barCard(p)).join('')+'</div>';
  });

  h+=fsec('Under 20 minutes','For the days there is no time');
  const quick=bp.filter(p=>(p.dur||99)<=20);
  h+= quick.length
      ? '<div class="hscroll barrow">'+quick.map(p=>barCard(p)).join('')+'</div>'
      : '<div class="mpnote">No short programs yet.</div>';

  h+=fsec('Every movement',BAR_DB.length+' in the library');
  h+='<div class="flib">'+['hinge','squat','push','pull','full','core'].map(t=>{
      const n=BAR_DB.filter(e=>e.t===t).length; if(!n) return '';
      const label={hinge:'Hinge',squat:'Squat & lunge',push:'Press',pull:'Row & pull',
                   full:'Full body',core:'Core & carry'}[t];
      return '<div class="row" onclick="openLibrary(BAR_EQ)"><b>'+label+'</b>'+
             '<span>'+n+'</span><i class="chev">›</i></div>';
    }).join('')+'</div>';

  $('tr-body').innerHTML=h;
}

/* One poster. Netflix works because a shelf of distinct covers can be read at
   a glance; five identical rectangles cannot. Until the shoot happens these
   are built from each program's own colour and mark rather than the same
   placeholder photograph repeated five times. */
function barCard(p,showProgress){
  const done=progDone(p.id), total=progDays(p);
  const pct=total?Math.round(done/total*100):0;
  return '<div class="barcard" onclick="openProgram(\''+p.id+'\')" '+
    'style="background:linear-gradient(160deg,'+(p.c1||'#241a12')+' 0%,'+(p.c2||'#0b0906')+' 92%);">'+
    '<div class="bc-ic" style="color:'+(p.ac||'var(--hitfat)')+'">'+glyph((p.icon||'🏋️'))+'</div>'+
    '<div class="bc-b">'+
      '<div class="bc-k" style="color:'+(p.ac||'var(--hitfat)')+'">'+(p.level||'')+'</div>'+
      '<div class="bc-n">'+p.name+'</div>'+
      '<div class="bc-m">'+((p.weeks||[]).length||p.wk||'')+' wk · '+p.dur+' min</div>'+
      (showProgress
        ? '<div class="bc-bar"><i style="width:'+pct+'%;background:'+(p.ac||'var(--hitfat)')+'"></i></div>'+
          '<div class="bc-m">'+done+' of '+total+' days</div>'
        : '')+
    '</div></div>';
}

/* ── RECOVERY ──
   Prehab: building range and joint resilience before something complains.
   Not treatment, and the notice below says so once rather than hedging in
   every description. */
/* Coming soon: what is on the way, nothing that opens. */
/* Coming soon, as Fitness+ would put it: a poster in the recovery colour
   (HITFAT's yellow) with the promise on it, then what is on the way as
   Fitness+ lists a series — each one marked Soon, none of them opening. */
function trRecoverySoon(){
  let h='<div class="rcpost">'+
     '<span class="rcpost-pill">Coming Soon</span>'+
     '<div class="rcpost-ic" aria-hidden="true">'+glyph('leaf')+'</div>'+
     '<div class="t">Recovery &amp; Prehab</div>'+
     '<div class="s">Joint-by-joint programs for knees, shoulders, hips and the back a desk gives you. '+
     'We are filming every movement now — they open here when the videos are ready.</div>'+
     '<div class="m">'+REHAB_PLANS.length+' programs · '+REHAB_PLANS.reduce((t,p)=>t+progDays(p),0)+' sessions</div></div>';
  h+=fsec('What Is Coming',REHAB_PLANS.length+' programs, filming now.');
  h+='<div class="pdx-eps">'+REHAB_PLANS.map(p=>
    '<div class="fwr pdx-ep soon"><div class="th" style="background-image:url(\''+progImg(p)+'\');'+thumbCrop(p.name)+'"></div>'+
    '<div class="tx"><div class="t">'+p.name+'</div>'+
    '<div class="m">'+wks(p.weeks.length)+' · '+progDays(p)+' days</div>'+
    '<span class="soon-tag">Soon</span></div></div>').join('')+'</div>';
  $('tr-body').innerHTML=h;
}

function trRecovery(){
  if(!RECOVERY_LIVE) return trRecoverySoon();
  const rh=PROGRAMS.filter(isRehabProgram);
  let h='';
  h+='<div class="ecta" style="background:'+egrad('#0f1f22','#07090a','#38bdf8')+';">'+
     '<div class="ic">'+glyph('leaf')+'</div><div class="t">Recovery &amp; prehab</div>'+
     '<div class="s">Joint-by-joint work for knees, shoulders, hips, ankles and the back a desk gives you. '+
     REHAB_DB.length+' movements, '+rh.length+' programs.</div></div>';
  h+='<div class="mpnote" style="border-color:rgba(56,189,248,.35);color:var(--note-sky);">'+
     'This is training to build resilience, not treatment for an injury. If a movement hurts, '+
     'stop doing it — and if something is already painful, see a doctor or physiotherapist first.</div>';
  if(!rehabFootageReady())
    h+='<div class="mpnote" style="border-color:rgba(245,158,11,.35);color:var(--note-amber);">'+
       'Sets and reps are ready to follow. Most clips are still being filmed — the player says which, '+
       'rather than showing you a different movement.</div>';

  h+=fqCard();
  h+=fsec('Where does it bother you?','Pick the joint, not the workout');
  h+='<div class="hscroll">'+REHAB_JOINTS.map(j=>
    '<div class="eslot" onclick="openJoint(\''+j.k+'\')" style="width:172px;">'+
    '<div class="e">'+glyph(j.e)+'</div><div class="n">'+j.n+'</div>'+
    '<div class="v" style="font-size:20px;">'+rehabFor(j.k).length+'</div>'+
    '<div class="m" style="line-height:1.35;">'+j.d+'</div></div>').join('')+'</div>';

  h+=fsec('Recovery programs','Start with Daily Mobility 10 if you are not sure');
  h+=rh.map(p=>frow(p)).join('');
  $('tr-body').innerHTML=h;
}

/* One joint, every movement for it — the filmed ones included. */
function openJoint(k){
  if(!RECOVERY_LIVE){ toast('Recovery is coming soon'); return; }
  const j=REHAB_JOINTS.filter(x=>x.k===k)[0]; if(!j) return;
  const names=rehabFor(k);
  hidePanels(); $('library').style.display='block';
  $('lib-body').innerHTML='<div class="hgroup"><div class="k">Recovery</div><h2>'+j.n+'</h2>'+
    '<p>'+j.d+'.</p></div>'+
    '<div class="mpnote" style="border-color:rgba(56,189,248,.35);color:var(--note-sky);">'+
    'If a movement hurts, stop. Prehab should feel like work, never like pain.</div>'+
    '<div class="flib">'+names.map(n=>{
      const e=DB.filter(x=>x.n===n)[0]; if(!e) return '';
      return '<div class="row" onclick="playExercise(\''+n.replace(/'/g,"\\'")+'\')">'+
        '<div class="ic">'+(e.v?'▶':'○')+'</div><div class="lb">'+n+'</div>'+
        '<div class="ct">'+e.sets+'×'+e.reps+'</div><div class="cv">›</div></div>';
    }).join('')+'</div>'+
    '<button class="bigbtn sec" onclick="switchTab(\'train\')">Back to Recovery</button>';
  $('screen').scrollTop=0;
}


