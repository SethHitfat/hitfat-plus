/* ═══════════════ MEAL PLAN ═══════════════
   Ported from Seth's generator. The guideline work is the valuable part and is
   kept exactly: MDG 2020 macro ranges, CPG MOH 2023 calorie floors and safe
   deficit caps, Asian BMI cut-offs, waist-circumference risk.

   Computation is separated from rendering here (the source interleaved them)
   so the numbers can be tested without a DOM.                                */

/* ── CPG MOH 2023 · Asian BMI cut-offs ── */
function bmiClass(b){
  if(b<18.5) return {label:'Underweight', cls:'under',   c:'#5eb8ff', advice:'Bring your calories up in a healthy way.'};
  if(b<23)   return {label:'Normal',      cls:'normal',  c:'var(--ok)', advice:'Keep the eating and activity habits you have.'};
  if(b<27.5) return {label:'Pre-obese',    cls:'preobes', c:'#f59e0b', advice:'Now is the time to start changing habits.'};
  if(b<35)   return {label:'Obese Class I', cls:'obes1',  c:'#ff6b6b', advice:'Seeing a doctor or dietitian is recommended.'};
  if(b<40)   return {label:'Obese Class II',cls:'obes2',  c:'#ff4444', advice:'Seeing a doctor really does matter here.'};
  return       {label:'Obese Class III',cls:'obes3', c:'#ff3333', advice:'Please seek medical care soon.'};
}
function wcRisk(cm,gender){
  if(!cm) return null;
  const risk=(gender==='male'&&cm>=90)||(gender==='female'&&cm>=80);
  return {risk, label: risk?'Abdominal obesity':'Within range',
          c: risk?'#ff6b6b':'var(--ok)',
          note: risk?'Higher cardiovascular risk — worth seeing a doctor.':''};
}
/* CPG MOH 2023: floors 1,500 kcal male / 1,200 female; safe deficit 500–750. */
const KCAL_FLOOR={male:1500, female:1200};

/* ── MDG 2020 macro split ──
   CHO 50–65% · Protein 10–20% (high-protein capped at min(20%, 2g/kg)) · Fat 25–35% */
function mpNut(d){
  const bmr = d.gender==='male' ? 10*d.wt+6.25*d.ht-5*d.age+5 : 10*d.wt+6.25*d.ht-5*d.age-161;
  const tdee=Math.round(bmr*d.activity);
  const delta=d.rate*7700/7;
  const floor=KCAL_FLOOR[d.gender]||1200;
  const raw = d.goal==='loss' ? tdee-delta : d.goal==='gain' ? tdee+delta : tdee;
  const cal = d.goal==='loss' ? Math.max(floor,Math.round(raw)) : Math.round(raw);
  const floorHit = d.goal==='loss' && Math.round(raw)<floor;

  const hi=(d.styles||[]).indexOf('hiprotein')>-1;
  const lo=(d.styles||[]).indexOf('lowcarb')>-1;
  let protPct=0.15;
  if(hi) protPct=Math.min(0.20,(d.wt*2*4)/cal);   // the lower of 20% or 2 g/kg
  let fatPct=lo?0.32:0.28;
  let pK=cal*protPct, fK=cal*fatPct, cK=cal-pK-fK;
  if(cK/cal<0.50){ cK=cal*0.50; fK=cal-pK-cK; }    // MDG minimum carbohydrate

  const bmi=d.ht?d.wt/Math.pow(d.ht/100,2):0;
  return {bmr:Math.round(bmr), tdee, cal, floorHit, floor,
          prot:Math.round(pK/4), carb:Math.round(cK/4), fat:Math.round(fK/9),
          pPct:Math.round(pK/cal*100), cPct:Math.round(cK/cal*100), fPct:Math.round(fK/cal*100),
          deficit: d.goal==='loss' ? tdee-cal : 0, bmi};
}
function mdgOk(n){
  return {cho:n.cPct>=50&&n.cPct<=65, prot:n.pPct>=10&&n.pPct<=20, fat:n.fPct>=25&&n.fPct<=35};
}
/* CPG: 500–750 kcal/day is the safe band; >1 kg/week is over the limit. */
function deficitVerdict(k){
  if(k<=400)  return {label:'Relaxed and sustainable', c:'var(--ok)', msg:'Realistic for the long run — 1–2 kg a month.'};
  if(k<=750)  return {label:'Smart fat loss',       c:'#EF4444', msg:'Inside the CPG MOH 2023 band: 500–750 kcal = 0.5–1 kg a week.'};
  if(k<=1000) return {label:'Aggressive',           c:'#f59e0b', msg:'Above the CPG band. Keep protein high and do not skip training.'};
  return           {label:'Too aggressive',      c:'#ff4444', msg:'Past the CPG safe limit (1 kg a week). Give yourself more time instead.'};
}

/* ── meal structures ── */
const MP_STRUCTS={
  '3x' :[['breakfast','Breakfast','7:30 am',.28],['lunch','Lunch','1:00 pm',.40],['dinner','Dinner','7:00 pm',.32]],
  '333':[['breakfast','Breakfast','7:30 am',.28],['lunch','Lunch','1:00 pm',.40],['dinner','Dinner','7:00 pm',.32]],
  '6x' :[['breakfast','Breakfast','7:30 am',.18],['snack','Snack 1','10:00 am',.10],['lunch','Lunch','1:00 pm',.25],
         ['snack','Snack 2','3:30 pm',.10],['dinner','Dinner','7:00 pm',.27],['snack','Evening snack','9:00 pm',.10]],
  'if' :[['breakfast','Meal 1','12:00 noon',.35],['lunch','Meal 2','4:00 pm',.30],['dinner','Meal 3','7:30 pm',.35]]
};
function mpSlots(s){ return (MP_STRUCTS[s]||MP_STRUCTS['3x']).map(x=>({key:x[0],label:x[1],time:x[2],ratio:x[3]})); }

/* deterministic shuffle — the same plan regenerates identically */
function mpShuffle(a,seed){
  const r=a.slice(); let s=seed+1;
  for(let i=r.length-1;i>0;i--){ s=(s*1664525+1013904223)&0xffffffff;
    const j=Math.abs(s)%(i+1); const t=r[i]; r[i]=r[j]; r[j]=t; }
  return r;
}
function mpOptions(key,prefs,styles,day,slot){
  let pool=(MDB[key]||[]).slice();
  ['noegg','noseafood','nomeat'].forEach(p=>{
    if(prefs.indexOf(p)>-1) pool=pool.filter(o=>o.tags.indexOf(p)>-1);
  });
  const score=o=>{ let s=0;
    if(prefs.indexOf('lovenasi')>-1 && o.tags.indexOf('lovenasi')>-1) s+=3;
    if(prefs.indexOf('lessnasi')>-1 && o.tags.indexOf('lovenasi')<0)  s+=2;
    if(prefs.indexOf('lovemee')>-1  && o.tags.indexOf('lovemee')>-1)  s+=3;
    if(prefs.indexOf('loveroti')>-1 && o.tags.indexOf('loveroti')>-1) s+=3;
    if(styles.indexOf('hiprotein')>-1&&o.tags.indexOf('hiprotein')>-1)s+=2;
    if(styles.indexOf('lowcarb')>-1 && o.tags.indexOf('lowcarb')>-1)  s+=2;
    if(styles.indexOf('budget')>-1  && o.tags.indexOf('budget')>-1)   s+=2;
    return s; };
  pool.sort((a,b)=>score(b)-score(a));
  return mpShuffle(pool, day*37+slot*13).slice(0,3);
}
function kcalOf(o){ return o.items.reduce((s,i)=>s+i.kcal,0); }
/* Word-boundary match, not substring. "goreng" contains "oren", so plain
   indexOf tagged every fried dish as fruit — tempe goreng came out as BUAH. */
function hasKW(name,kws){
  const words=String(name).toLowerCase().split(/[^a-z]+/).filter(Boolean);
  return kws.some(w=>words.some(x=>x===w||x===w+'s'));
}
function isFruit(name){ return hasKW(name,FRUIT_KW); }
function groupsOf(items){
  const g={buah:0,sayur:0,protein:0,karbo:0};
  items.forEach(it=>{
    if(hasKW(it.food,FRUIT_KW))   g.buah++;
    if(hasKW(it.food,SAYUR_KW))   g.sayur++;
    if(hasKW(it.food,PROTEIN_KW)) g.protein++;
    if(hasKW(it.food,KARBO_KW))   g.karbo++;
  });
  g.buah=Math.min(g.buah,1);
  return g;
}
function gapItems(gap,dayGroups){
  const out=[]; let rem=gap;
  for(const s of GAP_POOL){
    if(out.length>=3||rem<=30) break;
    if(s.grp==='buah'&&dayGroups&&dayGroups.buah>0) continue;   // 2 servings is the MDG cap
    if(s.kcal<=rem+80){ out.push(s); rem-=s.kcal; }
  }
  return out;
}
function scalePortion(str,f){
  if(f<=1.1) return str;
  return String(str).replace(/(\d+(?:\.\d+)?)/g,m=>{
    const n=parseFloat(m); let s=n*f;
    s = n<5 ? Math.round(s*2)/2 : Math.round(s/5)*5;
    return (s===Math.floor(s)?Math.floor(s):s).toString();
  });
}

/* ── the plan itself: pure data, no DOM ── */
/* A base menu is one normal serving (~300-400 kcal). A 2,100 kcal target wants
   ~840 kcal at lunch, so the plan scales the serving to the slot instead of
   handing over a day that only reaches 45% of target and calling it a plan.
   The scale is capped — past 2x it stops being one plate of food — and the
   gap card covers whatever is still short.                                  */
const MP_MAX_SCALE=2.0;
function scaleOption(o,target){
  const base=kcalOf(o);
  let f = base>0 ? target/base : 1;
  if(f<1) f=1;                                   // never shrink below one serving
  if(f>MP_MAX_SCALE) f=MP_MAX_SCALE;
  f=Math.round(f*10)/10;
  return {name:o.name, tags:o.tags, scale:f, base,
          items:o.items.map(i=>({food:i.food, portion:f>1?scalePortion(i.portion,f):i.portion,
                                 kcal:Math.round(i.kcal*f)}))};
}
function buildPlan(d){
  const nut=mpNut(d), slots=mpSlots(d.struct), days=[];
  for(let day=1; day<=d.days; day++){
    const opts=slots.map((s,i)=>mpOptions(s.key,d.prefs||[],d.styles||[],day,i));

    // MDG wants fruit every day — promote a fruit option in whichever slot has one
    let hasFruit=opts.some(o=>o.length&&groupsOf(o[0].items).buah>0);
    if(!hasFruit){
      for(let i=0;i<slots.length && !hasFruit;i++){
        const j=opts[i].findIndex((o,k)=>k>0&&groupsOf(o.items).buah>0);
        if(j>0){ const t=opts[i][0]; opts[i][0]=opts[i][j]; opts[i][j]=t; hasFruit=true; }
      }
    }
    // some days simply draw three fruitless options in every slot — add one
    if(!hasFruit && opts[0].length){
      const f=MP_FRUITS[day%MP_FRUITS.length];
      opts[0]=opts[0].slice();
      opts[0][0]={name:opts[0][0].name+' + '+f.food, tags:opts[0][0].tags,
                  items:opts[0][0].items.concat([f])};
      hasFruit=true;
    }
    const targets=slots.map(s=>Math.round(nut.cal*s.ratio));
    const scaled=opts.map((o,i)=>o.map(x=>scaleOption(x,targets[i])));

    const bal={buah:0,sayur:0,protein:0,karbo:0}; let total=0; const fruitSlots=[];
    scaled.forEach((o,i)=>{
      if(!o.length) return;
      total+=kcalOf(o[0]);
      const g=groupsOf(o[0].items);
      if(g.buah>0) fruitSlots.push(i);
      bal.buah+=g.buah; bal.sayur+=g.sayur; bal.protein+=g.protein; bal.karbo+=g.karbo;
    });
    days.push({day, slots:slots.map((s,i)=>Object.assign({},s,
      {target:targets[i], options:scaled[i], fruitExcess:fruitSlots.indexOf(i)>=2})),
      total, bal,
      diff: total-nut.cal, pct: Math.round(total/nut.cal*100),
      ok: Math.abs(total-nut.cal)<=nut.cal*0.10});
  }
  return {nut, days, struct:d.struct, meta:d};
}
function planTips(d){
  const base=[
    'Drink at least 8 glasses of plain water a day — hunger is often thirst.',
    'Hand guide: protein 1 palm · carbs 1 fist · fat 1 thumb · vegetables 1–2 handfuls.',
    'Eating out: protein first, vegetables second, carbs last. That controls the portion for you.',
    'Missing an ingredient? Switch to another option in the same slot — the calories still land in range.',
    'Being 85% consistent beats being perfect for three days and then stopping.'];
  const ex=[];
  if(d.goal==='loss') ex.push('The deficit comes from what you eat, not from training. Training is what protects your muscle.');
  if(d.goal==='gain') ex.push('Do not skip main meals. A small consistent surplus beats one big meal.');
  if(d.struct==='if') ex.push('16:8 fasting — you still have to hit the daily calories inside the 8-hour window, not cut them.');
  if((d.styles||[]).indexOf('budget')>-1) ex.push('Budget still works: eggs, tempe, tofu, chicken, mackerel, local vegetables.');
  if((d.styles||[]).indexOf('mealprep')>-1) ex.push('Weekend meal prep: cook protein and carbs separately, they keep 4–5 days.');
  return ex.concat(base).slice(0,6);
}

/* ═══════════════ MEAL PLAN · UI ═══════════════ */
let mp={step:0, goal:'loss', rate:0.5, struct:'3x', days:7, styles:[], prefs:[], wc:0};
const MP_STEPS=['Goal','Profile','Structure','Length','Style'];

function openMealPlan(){
  const n=HF.data.nutrition||{};
  mp={step:0,
      goal: n.goal==='lose'?'loss':n.goal==='maintain'?'maintain':n.goal?'gain':'loss',
      rate:0.5, struct:'3x', days:7, styles:[], prefs:[], wc:HF.data.wc||0,
      gender:n.gender||'male', age:n.a||30, wt:n.w||70, ht:n.h||168, activity:1.55};
  $('mpm').classList.add('on'); renderMP();
}
function closeMealPlan(){ $('mpm').classList.remove('on'); renderEat(); }
function mpGo(d){ const n=mp.step+d; if(n<0) return closeMealPlan(); if(n>=MP_STEPS.length) return; mp.step=n; renderMP(); $('mpm').scrollTop=0; }
function mpSet(k,v){ mp[k]=v; renderMP(); }
function mpToggle(list,v){ const i=mp[list].indexOf(v); if(i>=0) mp[list].splice(i,1); else mp[list].push(v); renderMP(); }
function mpNum(id,k){ const e=$(id); if(e) mp[k]=parseFloat(e.value)||mp[k]; }

const MP_RATES={loss:[[0.25,'Relaxed — 0.25 kg a week'],[0.5,'Standard — 0.5 kg a week'],[0.75,'Faster — 0.75 kg a week'],[1.0,'Safe maximum — 1.0 kg a week']],
                gain:[[0.25,'Relaxed — +0.25 kg a week'],[0.5,'Standard — +0.5 kg a week']],
                maintain:[[0,'Hold your current weight']]};
const MP_STYLES=[['hiprotein','💪 High protein','Capped at 20% of calories or 2g/kg'],['lowcarb','🌾 Controlled carbs','Carbs stay, just tidier'],
                 ['budget','💰 Budget','Cheap food that actually works'],['simple','✂️ Simple','Fewer ingredients, easy to cook'],
                 ['eatout','🍱 Eating out','You eat out often'],['mealprep','📦 Meal prep','Cook ahead, save time']];
const MP_PREFS=[['noegg','🚫 No egg'],['noseafood','🚫 No seafood'],['nomeat','🚫 No meat'],
                ['lovenasi','🍚 I like rice'],['lessnasi','⬇️ Less rice'],['loveroti','🍞 I like bread'],
                ['lovemee','🍜 I like noodles'],['family','👨‍👩‍👧 Family friendly']];

function renderMP(){
  const s=mp.step; let b='';
  if(s===0){
    b='<div class="cph">What are you aiming for?</div><div class="cpsub">This is what sets your daily calories.</div>'+
      [['loss','⬇️ Lose weight','A deficit you can actually keep to'],
       ['maintain','↔️ Maintain','Hold your weight with balanced eating'],
       ['gain','⬆️ Gain weight','Add calories in a controlled way']]
      .map(g=>'<button class="cprow'+(mp.goal===g[0]?' on':'')+'" onclick="mp.rate='+(0.5)+';mpSet(\'goal\',\''+g[0]+'\')">'+
        '<span class="t">'+g[1]+'</span><span class="s">'+g[2]+'</span></button>').join('')+
      '<div class="qh">Pace</div>'+
      (MP_RATES[mp.goal]||[]).map(r=>'<button class="cprow'+(mp.rate===r[0]?' on':'')+'" onclick="mpSet(\'rate\','+r[0]+')">'+
        '<span class="t">'+r[1]+'</span></button>').join('');
  } else if(s===1){
    b='<div class="cph">About you</div><div class="cpsub">Filled in from your calorie target — change anything that is off.</div>'+
      '<div class="qh">Sex</div><div class="filters">'+
      [['male','Male'],['female','Female']].map(g=>'<button class="chip'+(mp.gender===g[0]?' y':'')+'" onclick="mpSet(\'gender\',\''+g[0]+'\')">'+g[1]+'</button>').join('')+'</div>'+
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:9px;">'+
      '<input class="inp" id="mp-age" type="number" inputmode="numeric" placeholder="Age" value="'+mp.age+'" oninput="mpNum(\'mp-age\',\'age\')">'+
      '<input class="inp" id="mp-wt" type="number" inputmode="decimal" placeholder="Weight kg" value="'+mp.wt+'" oninput="mpNum(\'mp-wt\',\'wt\')">'+
      '<input class="inp" id="mp-ht" type="number" inputmode="numeric" placeholder="Height cm" value="'+mp.ht+'" oninput="mpNum(\'mp-ht\',\'ht\')">'+
      '<input class="inp" id="mp-wc" type="number" inputmode="decimal" placeholder="Waist cm" value="'+(mp.wc||'')+'" oninput="mpNum(\'mp-wc\',\'wc\')">'+
      '</div>'+
      '<div class="cpsub" style="font-size:13px;">Waist is optional — CPG MOH 2023 puts the risk line at 90cm for men, 80cm for women.</div>'+
      '<div class="qh">Activity level</div>'+
      [[1.2,'Not very active','Mostly sitting'],[1.375,'Light','A bit of walking'],[1.55,'Moderate','Training 3–5x a week'],
       [1.725,'Active','Most days'],[1.9,'Very active','Physical job or heavy training']]
      .map(a=>'<button class="cprow'+(mp.activity===a[0]?' on':'')+'" onclick="mpSet(\'activity\','+a[0]+')">'+
        '<span class="t">'+a[1]+'</span><span class="s">'+a[2]+'</span></button>').join('');
  } else if(s===2){
    b='<div class="cph">How you eat</div><div class="cpsub">Pick the one you find easiest to stick to.</div>'+
      [['3x','🍽️ Three meals','Breakfast, lunch, dinner'],
       ['333','🥗 Quarter-quarter-half','Half vegetables, quarter protein, quarter carbs'],
       ['6x','🕑 Six small meals','Smaller plates, more often'],
       ['if','⏳ Intermittent fasting 16:8','Everything inside an 8-hour window']]
      .map(x=>'<button class="cprow'+(mp.struct===x[0]?' on':'')+'" onclick="mpSet(\'struct\',\''+x[0]+'\')">'+
        '<span class="t">'+x[1]+'</span><span class="s">'+x[2]+'</span></button>').join('');
  } else if(s===3){
    b='<div class="cph">How many days?</div><div class="cpsub">Every day gets a different menu.</div><div class="cpdays">'+
      [1,3,7,14].map(n=>{
        const locked = n>maxPlanDays();
        return '<button class="cpd wide'+(mp.days===n?' on':'')+(locked?' plocked':'')+'" onclick="'+
          (locked?'openProduct(BUNDLE_SKU)':'mpSet(\'days\','+n+')')+'">'+n+(n===1?' day':' days')+
          (locked?' 🔒':'')+'</button>';
      }).join('')+'</div>'+
      (ownsAll()?'':'<div class="cpnote">Free builds up to '+FREE_PLAN_DAYS+' days. All Access builds 14.</div>');
  } else {
    b='<div class="cph">Style &amp; restrictions</div><div class="cpsub">Pick as many as apply.</div>'+
      '<div class="qh">Eating style</div><div class="cpgrid">'+
      MP_STYLES.map(x=>'<button class="cpo'+(mp.styles.indexOf(x[0])>=0?' on':'')+'" onclick="mpToggle(\'styles\',\''+x[0]+'\')">'+
        '<span class="n">'+x[1]+'</span><span class="s" style="font-size:11px;color:var(--dim);">'+x[2]+'</span></button>').join('')+'</div>'+
      '<div class="qh">Restrictions &amp; preferences</div><div class="filters" style="flex-wrap:wrap;">'+
      MP_PREFS.map(x=>'<button class="chip'+(mp.prefs.indexOf(x[0])>=0?' y':'')+'" onclick="mpToggle(\'prefs\',\''+x[0]+'\')">'+x[1]+'</button>').join('')+'</div>';
  }
  $('mp-body').innerHTML=
    '<div class="cpbar">'+MP_STEPS.map((_,i)=>'<i class="'+(i<=s?'on':'')+'"></i>').join('')+'</div>'+
    '<div class="cpstep">Step '+(s+1)+' of '+MP_STEPS.length+' · '+MP_STEPS[s]+'</div>'+b+
    '<div class="cpfoot">'+
      '<button class="bigbtn sec" style="margin:0;" onclick="mpGo(-1)">'+(s===0?'Cancel':'Back')+'</button>'+
      (s===MP_STEPS.length-1
        ? '<button class="bigbtn" style="margin:0;" onclick="mpGenerate()">🔥 Build my plan</button>'
        : '<button class="bigbtn" style="margin:0;" onclick="mpGo(1)">Next</button>')+
    '</div>';
}

let mpPlan=null;
function mpGenerate(){
  if(!mp.wt||!mp.ht||!mp.age){ toast('Fill in your profile first'); mp.step=1; renderMP(); return; }
  if(mp.wc) HF.data.wc=mp.wc;
  if(mp.days>maxPlanDays()) mp.days=maxPlanDays();
  mpPlan=buildPlan({goal:mp.goal, rate:mp.rate, gender:mp.gender, age:mp.age, wt:mp.wt, ht:mp.ht,
                    activity:mp.activity, struct:mp.struct, days:mp.days, styles:mp.styles, prefs:mp.prefs});
  HF.save();
  closeMealPlan(); openPlanView();
}
function openPlanView(){ hidePanels(); $('mealplan').style.display='block'; renderPlanView(); $('screen').scrollTop=0; }
function mpDay(i){ const c=$('mpday-'+i); if(c) c.classList.toggle('open'); }
function mpOpt(slotId,idx){
  const w=$(slotId); if(!w) return;
  Array.prototype.forEach.call(w.querySelectorAll('.mpo'),(b,i)=>b.classList.toggle('on',i===idx));
  Array.prototype.forEach.call(w.querySelectorAll('.mpopt'),(c,i)=>c.style.display=(i===idx?'block':'none'));
}
function mpSavePlan(){
  if(!mpPlan) return;
  const list=(HF.data.mealPlans||[]).slice();
  list.unshift({ts:Date.now(), meta:mpPlan.meta, cal:mpPlan.nut.cal, days:mpPlan.meta.days});
  const cap=maxSavedPlans();
  const trimmed=list.slice(0,cap);
  HF.data.mealPlans=trimmed; HF.save();
  toast(list.length>cap ? 'Plan saved — free keeps your latest one' : 'Plan saved');
  renderPlanView();
}
function mpLoad(i){
  const p=(HF.data.mealPlans||[])[i]; if(!p) return;
  mpPlan=buildPlan(p.meta); openPlanView();
}
function mpDelete(i){ const l=(HF.data.mealPlans||[]).slice(); l.splice(i,1); HF.data.mealPlans=l; HF.save(); renderEat(); }

function renderPlanView(){
  const p=mpPlan; if(!p){ $('mp-view').innerHTML='<div class="empty">No plan yet.</div>'; return; }
  const n=p.nut, ok=mdgOk(n), bc=bmiClass(n.bmi), wr=wcRisk(p.meta.wc||HF.data.wc, p.meta.gender);
  let h='';

  // hero — the number that matters, set the way the rest of the app sets numbers
  h+='<div class="ehero"><div class="k">Your daily target</div>'+
     '<div class="row"><div style="flex:1;min-width:0;"><div class="n">'+n.cal.toLocaleString()+'</div>'+
     '<div class="u">kcal a day · '+p.meta.days+(p.meta.days===1?' day':' days')+' of menus</div></div></div>'+
     '<div class="sp">'+
     [[n.tdee.toLocaleString(),'TDEE'],[n.bmr.toLocaleString(),'BMR'],
      [n.deficit?('−'+n.deficit):'—','Deficit'],[n.bmi.toFixed(1),'BMI']]
      .map((x,i)=>'<div><div class="v"'+(i===3?' style="color:'+bc.c+';"':'')+'>'+x[0]+'</div><div class="l">'+x[1]+'</div></div>').join('')+
     '</div></div>';

  // body status — CPG MOH 2023
  h+=fsec('Where you are','CPG MOH 2023 · Asian cut-offs');
  h+='<div class="emacs" style="grid-template-columns:'+(wr?'1fr 1fr':'1fr')+';">'+
     '<div class="emac"><div class="v" style="color:'+bc.c+';">'+n.bmi.toFixed(1)+'</div>'+
     '<div class="l">Body Mass Index</div>'+
     '<div class="mppill" style="color:'+bc.c+';border-color:'+hexA(bc.c,.35)+';background:'+hexA(bc.c,.12)+';">'+bc.label+'</div></div>'+
     (wr?'<div class="emac"><div class="v" style="color:'+wr.c+';">'+(p.meta.wc||HF.data.wc)+
       '<span style="font-size:15px;font-weight:400;letter-spacing:0;">cm</span></div>'+
       '<div class="l">Waist</div>'+
       '<div class="mppill" style="color:'+wr.c+';border-color:'+hexA(wr.c,.35)+';background:'+hexA(wr.c,.12)+';">'+wr.label+'</div></div>':'')+
     '</div>';
  if(n.bmi>=23) h+='<div class="mpnote" style="border-color:'+hexA(bc.c,.35)+';color:'+bc.c+';">'+bc.advice+'</div>';
  if(wr&&wr.risk) h+='<div class="mpnote" style="border-color:rgba(255,107,107,.35);color:#ff6b6b;">'+wr.note+'</div>';

  // macros
  h+=fsec('Daily macros','MDG 2020 · carbs 50–65% · protein 10–20% · fat 25–35%');
  h+='<div class="emacs">'+
     [['Protein',n.prot,n.pPct,'#fb923c',ok.prot],['Carbs',n.carb,n.cPct,'#38bdf8',ok.cho],['Fat',n.fat,n.fPct,'var(--ok)',ok.fat]]
     .map(m=>'<div class="emac"><div class="v" style="color:'+m[3]+';">'+m[1]+
       '<span style="font-size:15px;font-weight:400;letter-spacing:0;">g</span></div>'+
       '<div class="l">'+m[0]+'</div>'+
       '<div class="g" style="color:'+(m[4]?'var(--ok)':'#f59e0b')+';">'+m[2]+'% '+(m[4]?'✓':'⚠')+'</div>'+
       '<div class="b"><i style="width:'+m[2]+'%;background:'+m[3]+';"></i></div></div>').join('')+'</div>';
  if(n.floorHit) h+='<div class="mpnote" style="border-color:rgba(94,184,255,.35);color:#5eb8ff;">Calories were held at the safe minimum of '+n.floor.toLocaleString()+' kcal (CPG MOH 2023). Give yourself more time, or ease the target.</div>';
  if(n.deficit){ const v=deficitVerdict(n.deficit);
    h+='<div class="mpnote" style="border-color:'+hexA(v.c,.35)+';color:'+v.c+';"><b>'+v.label+'</b> — '+v.msg+'</div>'; }

  // days
  h+=fsec('Daily menus','Three options per slot — swap when an ingredient is missing');
  p.days.forEach((d,di)=>{
    const bal=(good,txt)=>'<span class="mpbal" style="color:'+(good?'var(--ok)':'#f59e0b')+
      ';border-color:'+(good?'rgba(46,194,126,.3)':'rgba(245,158,11,.3)')+';">'+txt+'</span>';
    h+='<div class="mpday'+(di===0?' open':'')+'" id="mpday-'+di+'">'+
      '<button class="mpday-h" onclick="mpDay('+di+')"><div><div class="t">Day '+d.day+'</div>'+
      '<div class="m">'+d.total.toLocaleString()+' kcal · '+d.pct+'% of target</div></div><span class="ar">⌄</span></button>'+
      '<div class="mpday-b">'+
      '<div class="mpbals">'+
        bal(d.bal.buah>0,'🍎 Fruit')+ bal(d.bal.sayur>=2,'🥗 Veg')+
        bal(d.bal.protein>=d.slots.length-1,'🍗 Protein')+ bal(d.bal.karbo>=1,'🍚 Carbs')+
        bal(d.ok,'⚡ '+d.total.toLocaleString()+' kcal')+
      '</div>';
    d.slots.forEach((s,si)=>{
      const sid='mps-'+di+'-'+si;
      h+='<div class="mpslot" id="'+sid+'">'+
        '<div class="mpslot-h"><div><div class="t">'+s.label+'</div>'+
        '<div class="m">'+s.time+'</div></div><div class="mppill" style="margin-top:0;">~'+s.target+' kcal</div></div>'+
        '<div class="mpopts">'+
        s.options.map((o,oi)=>'<button class="mpo'+(oi===0?' on':'')+'" onclick="mpOpt(\''+sid+'\','+oi+')">'+(oi+1)+'</button>').join('')+
        '</div>';
      s.options.forEach((o,oi)=>{
        const tot=kcalOf(o), g=groupsOf(o.items), gap=s.target-tot;
        h+='<div class="mpopt" style="display:'+(oi===0?'block':'none')+';">'+
          '<div class="mpopt-h"><div class="t">'+o.name+'</div><div class="k">'+tot+'</div></div>'+
          o.items.map(it=>'<div class="mpitem"><div><div class="t">'+it.food+'</div>'+
            '<div class="m">'+it.portion+'</div></div><div class="k">'+it.kcal+'</div></div>').join('')+
          '<div class="mpbals" style="margin-top:11px;">'+
            (g.protein?'<span class="mpbal" style="color:#38bdf8;border-color:rgba(56,189,248,.3);">Protein</span>':'')+
            (g.karbo?'<span class="mpbal" style="color:#f59e0b;border-color:rgba(245,158,11,.3);">Carbs</span>':'')+
            (g.sayur?'<span class="mpbal" style="color:var(--ok);border-color:rgba(46,194,126,.3);">Veg</span>':'')+
            (g.buah?'<span class="mpbal" style="color:#fb923c;border-color:rgba(251,146,60,.3);">Fruit</span>':'')+
          '</div>'+
          (o.scale>1?'<div class="mpnote" style="border-color:rgba(94,184,255,.3);color:#5eb8ff;">'+
            'Portion scaled ×'+o.scale.toFixed(1)+' to reach the '+s.target+' kcal this slot needs.</div>':'')+
          (gap>80&&gapItems(gap,d.bal).length?'<div class="mpgap">'+
            '<div class="mpgap-h">Still '+gap+' kcal short</div>'+
            '<div class="mpgap-s">'+gapItems(gap,d.bal).map(x=>'+'+x.kcal+' kcal · '+x.food).join('<br>')+'</div>'+
            '</div>':'')+
          '</div>';
      });
      h+='</div>';
    });
    h+='</div></div>';
  });

  h+=fsec('Tips','');
  h+='<div class="flib">'+planTips(p.meta).map((t,i)=>
    '<div class="row" style="cursor:default;align-items:flex-start;">'+
    '<div class="ic" style="color:var(--hyrox);font-weight:800;">'+(i+1)+'</div>'+
    '<div style="flex:1;font-size:15px;line-height:1.6;color:rgba(255,255,255,.8);">'+t+'</div></div>').join('')+'</div>';
  h+='<div class="mpnote" style="border-color:rgba(245,158,11,.35);color:#f59e0b;">General guidance based on what you entered. If you have diabetes, kidney disease, severe reflux, are pregnant, or your BMI is 27.5 or above — see a doctor or a registered dietitian.</div>';
  h+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:18px;">'+
     '<button class="bigbtn sec" style="margin:0;" onclick="openMealPlan()">Edit</button>'+
     '<button class="bigbtn" style="margin:0;" onclick="mpSavePlan()">💾 Save</button></div>';
  $('mp-view').innerHTML=h;
}


