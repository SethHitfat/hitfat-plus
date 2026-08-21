   The Fitness+ builder flow: activities → days → length → equipment → weeks →
   preview. Only the SPEC is stored; the plan itself is regenerated from it on
   every load, so a custom plan costs a few hundred bytes and syncs with the
   account like everything else.                                              */

const CP_ACTS=[
  {k:'fat',    n:'Fat Burn',   e:'🔥', t:['cardio','jump'],            goal:'Fat Loss'},
  {k:'full',   n:'Full Body',  e:'💪', t:['squat','push','core'],      goal:'Strength'},
  {k:'legs',   n:'Legs',       e:'🦵', t:['squat','lunge','hinge'],    goal:'Strength'},
  {k:'upper',  n:'Upper Body', e:'🤜', t:['push'],                     goal:'Strength'},
  {k:'core',   n:'Core',       e:'💎', t:['core'],                     goal:'Core'},
  {k:'cardio', n:'Cardio',     e:'🏃', t:['cardio'],                   goal:'Fat Loss'},
  {k:'mob',    n:'Mobility',   e:'🌿', t:['hold','core'],              goal:'Core'}
];
const CP_DAYS=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const CP_LENS=[[10,'10 min','Quick — habit first'],[20,'20 min','The usual'],
               [30,'30 min','Proper session'],[45,'45 min','Long and thorough']];
const CP_EQ=[['Bodyweight','Bodyweight only','Nothing but you and the floor'],
             ['Chair','Home basics','A chair and a towel'],
             ['Bottle','Bottles','Two water bottles'],
             ['Dumbbell','Dumbbells','Real weight at home'],
             ['Kettlebell','Kettlebell','One bell']];
const CP_WKS=[[2,'2 weeks'],[4,'4 weeks'],[8,'8 weeks'],[12,'12 weeks']];
const CP_STEPS=['Activities','Days','Length','Equipment','Weeks','Preview'];

let cp={step:0, acts:[], days:[], len:20, eq:'Bodyweight', wk:4};

function openCustom(){
  const saved=HF.data.custom;
  cp = saved ? Object.assign({step:0},JSON.parse(JSON.stringify(saved)))
             : {step:0, acts:['full','fat'], days:[0,2,4], len:20, eq:'Bodyweight', wk:4};
  $('cpm').classList.add('on'); renderCP();
}
function closeCustom(){ $('cpm').classList.remove('on'); }
function cpGo(d){
  const n=cp.step+d;
  if(n<0) return closeCustom();
  if(n>=CP_STEPS.length) return;
  cp.step=n; renderCP();
}
function cpToggle(list,v){
  const i=cp[list].indexOf(v);
  if(i>=0) cp[list].splice(i,1); else cp[list].push(v);
  renderCP();
}
function cpSet(k,v){ cp[k]=v; renderCP(); }
function cpValid(){
  if(cp.step===0) return cp.acts.length>0;
  if(cp.step===1) return cp.days.length>0;
  return true;
}

/* how many exercises a session of N minutes should hold */
function cpCount(){ return cp.len<=10?4 : cp.len<=20?5 : cp.len<=30?6 : 8; }

/* Build the spec the generator understands: activities are dealt round-robin
   across the chosen days, everything else is a rest day. */
function cpSpec(){
  const acts=CP_ACTS.filter(a=>cp.acts.indexOf(a.k)>=0);
  const days=[];
  let ai=0;
  for(let d=0;d<7;d++){
    if(cp.days.indexOf(d)<0){ days.push({rest:true}); continue; }
    const a=acts[ai%acts.length]; ai++;
    days.push({n:a.n, t:a.t, eq:cp.eq, c:cpCount()});
  }
  const goal=acts[0]?acts[0].goal:'Strength';
  return {id:'custom', name:'My Plan', goal, level:(HF.data.prefs&&HF.data.prefs.level)||'Beginner',
          dur:cp.len, wk:cp.wk, rounds:3, c1:'#2a1f3a', c2:'#0b080d', ac:'#EF4444', icon:'⭐',
          desc:acts.map(a=>a.n).join(' · ')+' · '+cp.days.length+' days a week · '+cp.len+' minutes · '+
               (cp.eq==='Bodyweight'?'no equipment':cp.eq)+'.',
          days};
}
function cpBuild(){ return PLAN(cpSpec()); }

function renderCP(){
  const s=cp.step;
  let body='';
  if(s===0){
    body='<div class="cph">What do you want to do?</div>'+
      '<div class="cpsub">Pick as many as you like — they get spread across your week.</div>'+
      '<div class="cpgrid">'+CP_ACTS.map(a=>
        '<button class="cpo'+(cp.acts.indexOf(a.k)>=0?' on':'')+'" onclick="cpToggle(\'acts\',\''+a.k+'\')">'+
        '<span class="e">'+a.e+'</span><span class="n">'+a.n+'</span></button>').join('')+'</div>';
  } else if(s===1){
    body='<div class="cph">Which days?</div>'+
      '<div class="cpsub">Everything else becomes a rest day.</div>'+
      '<div class="cpdays">'+CP_DAYS.map((d,i)=>
        '<button class="cpd'+(cp.days.indexOf(i)>=0?' on':'')+'" onclick="cpToggle(\'days\','+i+')">'+d+'</button>').join('')+'</div>'+
      '<div class="cpnote">'+cp.days.length+' session'+(cp.days.length===1?'':'s')+' a week</div>';
  } else if(s===2){
    body='<div class="cph">How long is each session?</div>'+
      '<div class="cpsub">You can still stop early — nothing is wasted.</div>'+
      CP_LENS.map(l=>'<button class="cprow'+(cp.len===l[0]?' on':'')+'" onclick="cpSet(\'len\','+l[0]+')">'+
        '<span class="t">'+l[1]+'</span><span class="s">'+l[2]+'</span></button>').join('');
  } else if(s===3){
    body='<div class="cph">What do you have?</div>'+
      '<div class="cpsub">If a movement needs kit you do not own, the plan swaps it out.</div>'+
      CP_EQ.map(e=>'<button class="cprow'+(cp.eq===e[0]?' on':'')+'" onclick="cpSet(\'eq\',\''+e[0]+'\')">'+
        '<span class="t">'+e[1]+'</span><span class="s">'+e[2]+'</span></button>').join('');
  } else if(s===4){
    body='<div class="cph">How many weeks?</div>'+
      '<div class="cpsub">Pick something you will actually finish. You can build another after.</div>'+
      '<div class="cpdays">'+CP_WKS.map(w=>
        '<button class="cpd wide'+(cp.wk===w[0]?' on':'')+'" onclick="cpSet(\'wk\','+w[0]+')">'+w[1]+'</button>').join('')+'</div>';
  } else {
    const p=cpBuild();
    body='<div class="cph">Your plan</div>'+
      '<div class="cpsub">'+p.desc+'</div>'+
      '<div class="fplan" style="background:'+grad(p)+';margin:14px 0 18px;">'+
      '<div class="t">My Plan</div><div class="mt">'+cp.wk+' WEEKS · '+progDays(p)+' DAYS · '+cp.len+' MIN/DAY</div></div>'+
      '<div class="cpsub" style="margin-bottom:10px;">Week 1</div>'+
      '<div style="display:flex;flex-direction:column;gap:9px;">'+
      p.weeks[0].days.map((d,i)=>
        '<div class="wrow'+(d.rest?'':'')+'"><div class="num">'+CP_DAYS[i]+'</div>'+
        '<div class="tx"><div class="t">'+(d.rest?'Rest':d.name)+'</div>'+
        '<div class="m">'+(d.rest?'Recovery':(d.ex.length+' exercises · '+cp.len+' min'))+'</div></div></div>').join('')+
      '</div>';
  }

  $('cp-body').innerHTML=
    '<div class="cpbar">'+CP_STEPS.map((_,i)=>'<i class="'+(i<=s?'on':'')+'"></i>').join('')+'</div>'+
    '<div class="cpstep">Step '+(s+1)+' of '+CP_STEPS.length+' · '+CP_STEPS[s]+'</div>'+
    body+
    '<div class="cpfoot">'+
      '<button class="bigbtn sec" style="margin:0;" onclick="cpGo(-1)">'+(s===0?'Cancel':'Back')+'</button>'+
      (s===CP_STEPS.length-1
        ? '<button class="bigbtn" style="margin:0;" onclick="cpSave()">Start this plan</button>'
        : '<button class="bigbtn" style="margin:0;'+(cpValid()?'':'opacity:.4;')+'" onclick="'+
            (cpValid()?'cpGo(1)':'toast(\'Pick at least one to continue\')')+'">Continue</button>')+
    '</div>';
}

function cpSave(){
  const spec={acts:cp.acts.slice(), days:cp.days.slice(), len:cp.len, eq:cp.eq, wk:cp.wk};
  HF.data.custom=spec;
  HF.data.progress['custom']=0;
  HF.save();
  applyCustom();
  closeCustom();
  toast('Your plan is ready');
  openProgram('custom');
}
function cpDelete(){
  if(!confirm('Delete your custom plan? Its progress is lost.')) return;
  delete HF.data.custom; delete HF.data.progress['custom'];
  HF.save(); applyCustom(); switchTab('train'); toast('Custom plan deleted');
}
/* Rebuild the plan from the stored spec and put it at the head of the catalogue.
   Called on boot and after every edit, so there is only ever one 'custom'. */
function applyCustom(){
  PROGRAMS = PROGRAMS.filter(p=>p.id!=='custom');
  if(!HF.data || !HF.data.custom) return;
  const saved=cp;
  cp=Object.assign({step:0},HF.data.custom);
  try{ PROGRAMS = [cpBuild()].concat(PROGRAMS); }catch(e){ console.warn('custom plan rebuild failed',e); }
  cp=saved;
}
function hasCustom(){ return !!(HF.data && HF.data.custom); }


/* ═══════════════ WORKOUT PLAYER ═══════════════
