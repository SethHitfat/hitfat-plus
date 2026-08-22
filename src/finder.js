/* ═══════════════ FIND MY PROGRAM ═══════════════
   The Prehab Guys lead with "Get Your Program in 2 Minutes" — tell us what
   hurts, get a program, start moving — and it is their primary call to action
   on every page. It is the single best thing on their site to borrow: a
   catalogue of 60 programs is a wall until something picks one for you.

   What this does NOT borrow is their Rehab category. Theirs treats named
   injuries — ACL surgery, rotator cuff, meniscus, postpartum — and rests on
   being written by Doctors of Physical Therapy. This asks what someone wants
   to train, never what is wrong with them, and never says it will fix it.  */

let fq={step:0, goal:null, joint:null, days:3, equip:null, level:null};
const FQ_STEPS=['Goal','Focus','Days','Equipment'];

const FQ_GOALS=[
  {k:'fat',    e:'⬇️', n:'Lose fat',            d:'Burn more than you eat, keep the muscle'},
  {k:'strong', e:'💪', n:'Get stronger',        d:'Build strength you can feel day to day'},
  {k:'move',   e:'🧘', n:'Move better',         d:'Range, joints and the aches from sitting'},
  {k:'start',  e:'🌱', n:'Just get started',    d:'Build the habit first, the rest follows'}
];
const FQ_EQUIP=[
  {k:'none',   e:'🏠', n:'Nothing at all',      d:'Bodyweight, a chair, a towel'},
  {k:'bar',    e:'🏋️', n:'HITFAT BAR',          d:'The bar and bands'},
  {k:'weights',e:'🔔', n:'Dumbbell or kettlebell', d:'Something to load up with'},
  {k:'any',    e:'✨', n:'Whatever works',      d:'Show me the best match either way'}
];

function openFinder(){
  const p=HF.data.prefs||{};
  fq={step:0, goal:null, joint:null, days:p.days||3, equip:null, level:p.level||'Beginner'};
  $('fqm').classList.add('on'); renderFinder();
}
function closeFinder(){ $('fqm').classList.remove('on'); }
function fqSet(k,v){ fq[k]=v; renderFinder(); }
function fqGo(d){
  let n=fq.step+d;
  /* Focus only applies when the answer is "move better" — asking everyone
     which joint bothers them turns a training app into a symptom form. */
  if(n===1 && fq.goal!=='move') n+=d;
  if(n<0) return closeFinder();
  if(n>=FQ_STEPS.length) return fqResult();
  fq.step=n; renderFinder(); $('fqm').scrollTop=0;
}

function renderFinder(){
  const s=fq.step; let b='';
  if(s===0){
    b='<div class="cph">What are you here for?</div>'+
      '<div class="cpsub">One answer. You can change it later.</div>'+
      FQ_GOALS.map(g=>'<button class="cprow'+(fq.goal===g.k?' on':'')+'" onclick="fqSet(\'goal\',\''+g.k+'\')">'+
        '<span class="t">'+g.e+' '+g.n+'</span><span class="s">'+g.d+'</span></button>').join('');
  } else if(s===1){
    b='<div class="cph">Where does it bother you?</div>'+
      '<div class="cpsub">Pick the one that nags most. If nothing does, choose Everywhere.</div>'+
      REHAB_JOINTS.map(j=>'<button class="cprow'+(fq.joint===j.k?' on':'')+'" onclick="fqSet(\'joint\',\''+j.k+'\')">'+
        '<span class="t">'+j.e+' '+j.n+'</span><span class="s">'+j.d+'</span></button>').join('')+
      '<button class="cprow'+(fq.joint==='all'?' on':'')+'" onclick="fqSet(\'joint\',\'all\')">'+
      '<span class="t">🌿 Everywhere</span><span class="s">A bit of everything, ten minutes a day</span></button>'+
      '<div class="cpnote">This asks what you want to train, not what is wrong with you. '+
      'If something is actually painful, see a doctor or physiotherapist first.</div>';
  } else if(s===2){
    b='<div class="cph">How many days a week?</div>'+
      '<div class="cpsub">Be honest — a plan you skip is worth nothing.</div><div class="cpdays">'+
      [2,3,4,5,6].map(n=>'<button class="cpd'+(fq.days===n?' on':'')+'" onclick="fqSet(\'days\','+n+')">'+n+'</button>').join('')+
      '</div>'+
      '<div class="qh">Where are you now?</div>'+
      ['Beginner','Intermediate','Advanced'].map(l=>'<button class="cprow'+(fq.level===l?' on':'')+'" onclick="fqSet(\'level\',\''+l+'\')">'+
        '<span class="t">'+l+'</span></button>').join('');
  } else {
    b='<div class="cph">What have you got?</div>'+
      '<div class="cpsub">No equipment is a real answer — most of the library needs none.</div>'+
      FQ_EQUIP.map(x=>'<button class="cprow'+(fq.equip===x.k?' on':'')+'" onclick="fqSet(\'equip\',\''+x.k+'\')">'+
        '<span class="t">'+x.e+' '+x.n+'</span><span class="s">'+x.d+'</span></button>').join('');
  }
  const canNext = (s===0&&fq.goal) || (s===1&&fq.joint) || s===2 || (s===3&&fq.equip);
  $('fq-body').innerHTML=
    '<div class="cpbar">'+FQ_STEPS.map((_,i)=>'<i class="'+(i<=s?'on':'')+'"></i>').join('')+'</div>'+
    '<div class="cpstep">'+FQ_STEPS[s]+'</div>'+b+
    '<div class="cpfoot">'+
      '<button class="bigbtn sec" style="margin:0;" onclick="fqGo(-1)">'+(s===0?'Cancel':'Back')+'</button>'+
      '<button class="bigbtn" style="margin:0;'+(canNext?'':'opacity:.4;')+'" onclick="'+
        (canNext?(s===FQ_STEPS.length-1?'fqResult()':'fqGo(1)'):'')+'">'+
        (s===FQ_STEPS.length-1?'Show my match':'Next')+'</button>'+
    '</div>';
}

/* ── scoring ──
   Every point has a reason attached, because a recommendation the buyer
   cannot see the logic of is just a banner. */
function fqScore(p){
  const why=[]; let s=0;
  if(!p.weeks) return {s:-1, why};

  const g=fq.goal;
  if(g==='move'){
    if(isRehabProgram(p)){ s+=6; why.push('Built for joints and range'); }
    else s-=4;
    if(fq.joint && fq.joint!=='all'){
      const j=REHAB_JOINTS.filter(x=>x.k===fq.joint)[0];
      if(j && p.name.toLowerCase().indexOf(j.n.toLowerCase().split(' ')[0])>=0){
        s+=5; why.push('Targets your '+j.n.toLowerCase());
      }
    } else if(fq.joint==='all' && /Daily Mobility|Desk Reset/i.test(p.name)){
      s+=4; why.push('Covers every joint');
    }
  } else {
    if(isRehabProgram(p)) s-=5;
    if(g==='fat'    && p.goal==='Fat Loss'){ s+=5; why.push('Aimed at fat loss'); }
    if(g==='strong' && p.goal==='Strength'){ s+=5; why.push('Aimed at strength'); }
    if(g==='start'  && p.level==='Beginner'){ s+=5; why.push('Built for starting out'); }
    if(g==='start'  && p.weeks.length<=4){ s+=2; why.push('Short enough to finish'); }
  }

  if(p.level===fq.level){ s+=3; why.push('Matches your level'); }
  else if(fq.level==='Beginner' && p.level==='Advanced') s-=4;

  const trainDays=Math.round(p.weeks[0].days.filter(d=>!d.rest).length);
  const gap=Math.abs(trainDays-fq.days);
  if(gap===0){ s+=4; why.push(trainDays+' days a week, exactly what you said'); }
  else if(gap===1){ s+=2; why.push(trainDays+' days a week'); }
  else s-=gap;

  if(fq.equip==='bar'){
    if(isBarProgram(p)){ s+=6; why.push('Uses the HITFAT BAR'); }
  } else if(fq.equip==='none'){
    if(isBarProgram(p)) s-=8;
    if(/Chair|Towel|Bottle|Home|Bodyweight|Mobility|Desk/i.test(p.name)){ s+=3; why.push('Needs no equipment'); }
  } else if(fq.equip==='weights'){
    if(/Kettlebell|Dumbbell/i.test(p.name)){ s+=5; why.push('Uses what you have'); }
    if(isBarProgram(p)) s-=6;
  } else if(fq.equip==='any'){
    if(isBarProgram(p)) s-=2;      // only if they own the bar, and they did not say so
  }

  if(!isPaidProgram(p)){ s+=1; why.push('Free'); }
  return {s, why:why.slice(0,3)};
}

function fqResult(){
  const scored=PROGRAMS.map(p=>({p, ...fqScore(p)}))
    .filter(x=>x.s>0).sort((a,b)=>b.s-a.s);
  closeFinder();
  hidePanels(); $('store').style.display='block';
  $('store-segs').innerHTML='';

  if(!scored.length){
    $('store-body').innerHTML='<div class="empty">Nothing matched that combination.</div>'+
      '<button class="bigbtn" onclick="openFinder()">Try again</button>'+
      '<button class="bigbtn sec" onclick="openStore(\'programs\')">Browse everything</button>';
    $('screen').scrollTop=0; return;
  }

  const top=scored[0], rest=scored.slice(1,7);
  let h='<div class="ecta" style="background:'+egrad('#2a1016','#0b0b0d','#EF4444')+
        ';" onclick="openProgram(\''+top.p.id+'\')">'+
    '<div class="ic">'+(top.p.icon||'✦')+'</div>'+
    '<div class="lock" style="margin:10px 0 0;">YOUR MATCH</div>'+
    '<div class="t">'+top.p.name+'</div>'+
    '<div class="s">'+(top.p.desc||'')+'</div>'+
    '<div class="fqwhy">'+top.why.map(w=>'<span>✓ '+w+'</span>').join('')+'</div>'+
    '<div class="go">'+(isPaidProgram(top.p)?'RM'+programPrice(top.p)+' · See the program':'Start free')+'</div></div>';

  h+='<div class="arow" style="margin-top:12px;">'+
     '<div class="acard"><div class="big">'+top.p.weeks.length+'</div><div class="sub">weeks</div></div>'+
     '<div class="acard"><div class="big">'+top.p.weeks[0].days.filter(d=>!d.rest).length+'</div><div class="sub">days / week</div></div>'+
     '<div class="acard"><div class="big">'+(top.p.dur||20)+'</div><div class="sub">min / session</div></div></div>';

  h+=weekPhases(top.p);

  if(rest.length){
    h+=fsec('Not the exact match?','These came close');
    h+=rest.map(x=>frow(x.p, isPaidProgram(x.p)?'RM'+programPrice(x.p):'FREE')).join('');
  }
  h+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:18px;">'+
     '<button class="bigbtn sec" style="margin:0;" onclick="openFinder()">Answer again</button>'+
     '<button class="bigbtn sec" style="margin:0;" onclick="openStore(\'programs\')">Browse all</button></div>';
  $('store-body').innerHTML=h;
  $('screen').scrollTop=0;
}

/* ── week-by-week, shown BEFORE buying ──
   The Prehab Guys put the whole 12-week breakdown on the sales page, phase by
   phase. It is the most convincing thing there: you can see exactly what you
   are getting before you pay. Ours is generated from the plan itself, so it
   cannot drift from what the program actually contains.                    */
function weekPhases(p){
  if(!p || !p.weeks || !p.weeks.length) return '';
  const n=p.weeks.length;
  return fsec('Week by week','Every session, before you pay for any of it')+
    '<div class="flib">'+p.weeks.map((w,i)=>{
      const days=w.days.filter(d=>!d.rest);
      return '<div class="row" style="cursor:default;align-items:flex-start;">'+
        '<div class="ic" style="color:var(--hyrox);font-weight:800;">'+(i+1)+'</div>'+
        '<div style="flex:1;min-width:0;">'+
        '<div style="font-size:15px;font-weight:600;color:var(--txt);">'+phaseName(i,n)+'</div>'+
        '<div style="font-size:13px;color:var(--dim2);margin-top:4px;line-height:1.5;">'+
          days.map(d=>d.name).join(' · ')+'</div></div>'+
        '<div class="ct">'+days.length+'</div></div>';
    }).join('')+'</div>';
}
/* Named phases rather than "Week 4", because the name is what tells someone
   the plan actually progresses instead of repeating itself. */
function phaseName(i,n){
  const t=(i+1)/n;
  if(t<=0.25) return 'Week '+(i+1)+' · Foundation';
  if(t<=0.50) return 'Week '+(i+1)+' · Build';
  if(t<=0.75) return 'Week '+(i+1)+' · Load';
  if(t<1)     return 'Week '+(i+1)+' · Peak';
  return 'Week '+(i+1)+' · Finish';
}


