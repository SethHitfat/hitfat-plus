/* ═══════════════ EAT · Meal Scan ═══════════════
   Ported from the standalone HITFAT Tracker and restyled into the Hybrid design
   language (dark surfaces, red accent, Inter) instead of the original cream cards.
   Logging, coach text, actions and burn-this-meal are Seth's own logic, kept.   */

/* The scan endpoint. The quota shown in this file is a LABEL, not a limit —
   the real one is counted server-side in plus_scans and enforced inside the
   edge function. This client sends the signed-in user's access token, never
   the anon key: the anon key ships inside this HTML, so anything it can do,
   any reader of the page can do too. */
/* Same project as everything else. The old function lived in a separate
   meal-tracker project, but the new one verifies the caller's JWT and reads
   plus_entitlements and plus_scans — all of which belong to the project that
   issues the logins. A function cannot check a token its project did not
   sign. */
const SCAN_FN=SUPA_URL+'/functions/v1/scan-food';

function thisMonth(){ return iso(0).slice(0,7); }
function scanUsed(){ const q=HF.data.scanQuota||{}; return q.month===thisMonth()?(q.used||0):0; }
function scanLeft(){ return Math.max(0, SCAN_FREE_TIER - scanUsed()); }
function scanBump(){ HF.data.scanQuota={month:thisMonth(), used:scanUsed()+1}; HF.save(); }

function tdee(w,h,a,gender,goal){
  const bmr = gender==='male' ? 10*w+6.25*h-5*a+5 : 10*w+6.25*h-5*a-161;
  const t=bmr*1.4;
  return Math.round(goal==='lose'?t-500 : goal==='muscle'?t+200 : goal==='bulk'?t+500 : t);
}
function mealsFor(d){ return HF.data.meals[d||iso(0)]||[]; }
function burnFor(d){ return HF.data.burn[d||iso(0)]||[]; }
function burnTotal(d){ return burnFor(d).reduce((s,x)=>s+(x.kcal||0),0); }
function mealTotals(d){
  return mealsFor(d).reduce((a,m)=>({kcal:a.kcal+(m.kcal||0),p:a.p+(m.p||0),c:a.c+(m.c||0),f:a.f+(m.f||0)}),{kcal:0,p:0,c:0,f:0});
}
const SLOTS=[{k:'breakfast',n:'Breakfast',e:'🌅'},{k:'lunch',n:'Lunch',e:'☀️'},
             {k:'dinner',n:'Dinner',e:'🌙'},{k:'snack',n:'Snacks',e:'🍎'}];
function slotNow(){ const h=new Date().getHours();
  return h>=5&&h<11?'breakfast':h>=11&&h<15?'lunch':h>=18&&h<22?'dinner':'snack'; }

/* HF Score — the same rule set as the standalone tracker. */
function hfScore(kcal,p,c,f){
  const n=HF.data.nutrition||{}; if(!n.cal) return 0;
  if(kcal===0) return 50;
  let s=100;
  const over=kcal-n.cal;
  if(over>300) s-=25; else if(over>150) s-=15; else if(over>0) s-=8;
  const pp=p/(n.pt||1);
  if(pp<0.5) s-=20; else if(pp<0.7) s-=10; else if(pp>=0.9) s+=5;
  const fp=f/(n.ft||1);
  if(fp>1.4) s-=15; else if(fp>1.2) s-=8;
  const cp=c/(n.ct||1);
  if(cp>1.4) s-=10; else if(cp>1.2) s-=5;
  return Math.max(0,Math.min(100,Math.round(s)));
}
function dayStatus(kcal){
  const n=HF.data.nutrition||{}; if(!n.cal) return {k:'none',t:'NO TARGET',c:'#8a8a8a',s:'Set your daily target first'};
  if(kcal>n.cal)       return {k:'over', t:'OVER BUDGET', c:'#EF4444', s:'Over by '+(kcal-n.cal)+' kcal today'};
  if(kcal<n.cal*0.5)   return {k:'under',t:'UNDER TARGET',c:'#f59e0b', s:Math.round(n.cal*0.5-kcal)+' kcal below the halfway mark'};
  return {k:'on', t:'ON TRACK', c:'var(--ok)', s:'Within your daily target'};
}

/* ── EAT SCREEN · Fitness+ structure ──
   Three segments behind the same pill control TRAIN uses. Today is the dashboard,
   Plan is the meal-plan browse, Log is everything you type or scan. The numbers
   are set in thin large Inter the way Fitness+ sets its metrics — one accent,
   nothing shouting. No food photography exists yet, so the hero cards carry
   gradient and type; swap in photos when the shoot happens.                   */

let eatSeg='today';
const EAT_SEGS=[['today','Today'],['plan','Plan'],['log','Log']];
function setEatSeg(s){ eatSeg=s; renderEat(); $('screen').scrollTop=0; }

function egrad(c1,c2,ac){
  return 'radial-gradient(circle at 80% 10%,'+hexA(ac,.35)+',transparent 58%),linear-gradient(158deg,'+c1+','+c2+' 82%)';
}
function ecta(o){
  return '<div class="ecta" onclick="'+o.go+'" style="background:'+egrad(o.c1,o.c2,o.ac)+';">'+
    '<div class="ic">'+glyph(o.ic)+'</div><div class="t">'+o.t+'</div><div class="s">'+o.s+'</div>'+
    '<div class="go">'+o.btn+'</div>'+(o.note?'<div class="lock">'+o.note+'</div>':'')+'</div>';
}

function renderEat(){
  const n=HF.data.nutrition||{};
  if(!n.cal){ $('eat-segs').innerHTML=''; renderEatSetup(); return; }
  $('eat-segs').innerHTML='<div class="segs">'+EAT_SEGS.map(s=>
    '<button class="seg'+(eatSeg===s[0]?' on':'')+'" onclick="setEatSeg(\''+s[0]+'\')">'+s[1]+'</button>').join('')+'</div>';
  if(eatSeg==='plan') return eatPlan();
  if(eatSeg==='log')  return eatLog();
  eatToday();
}

/* ── shared pieces ──
   The Eat tab is a nutrition dashboard, so it is built from the same four
   parts everywhere: a summary card, grouped rows, quick-action tiles and
   callouts. Numbers are the heroes; colour is spent on meaning. */
const SLOT_SHARE={breakfast:.25,lunch:.35,dinner:.30,snack:.10};

/* The calorie ring: eaten against target, the remainder in the middle. */
function nRing(pct,big,small,size){
  size=size||132; const r=size/2-9, c=2*Math.PI*r, off=c*(1-Math.min(100,Math.max(0,pct))/100);
  return '<div class="nring" style="width:'+size+'px;height:'+size+'px;">'+
    '<svg viewBox="0 0 '+size+' '+size+'" aria-hidden="true"><defs><linearGradient id="nrg" x1="0" y1="0" x2="1" y2="1">'+
    '<stop offset="0" stop-color="#FF6A4D"/><stop offset="1" stop-color="#D7261E"/></linearGradient></defs>'+
    '<circle cx="'+size/2+'" cy="'+size/2+'" r="'+r+'" class="nring-t"/>'+
    (pct>0?'<circle cx="'+size/2+'" cy="'+size/2+'" r="'+r+'" class="nring-v" stroke-dasharray="'+c.toFixed(1)+'" stroke-dashoffset="'+off.toFixed(1)+'"/>':'')+
    '</svg><div class="nring-c"><b>'+big+'</b><span>'+small+'</span></div></div>';
}
/* A macro as a labelled bar: what is eaten, out of what, in its colour. */
function nMacro(label,v,target,col,extra){
  const w=Math.min(100,Math.round(v/(target||1)*100));
  return '<div class="nmac"><div class="nmac-h"><span class="nmac-l"><i style="background:'+col+'"></i>'+label+'</span>'+
    '<span class="nmac-v"><b>'+v+'</b> / '+target+' g'+(extra||'')+'</span></div>'+
    '<div class="nbar"><i style="width:'+w+'%;background:'+col+';"></i></div></div>';
}
/* One grouped-list row: icon tile, title, a line under it, and what sits on the right. */
function nRow(icon,title,sub,right,go){
  return '<div class="nli"'+(go?' onclick="'+go+'"':'')+'>'+ic(icon)+
    '<div class="nli-b"><div class="nli-t">'+title+'</div>'+(sub?'<div class="nli-s">'+sub+'</div>':'')+'</div>'+
    (right||'')+'</div>';
}
function nLiStatic(icon,title,right){
  return '<div class="nli nstep">'+ic(icon)+'<div class="nli-b">'+(title?'<div class="nli-t">'+title+'</div>':'')+
    (title?'':'<div class="nli-s nli-body">'+right+'</div>')+'</div>'+(title?right:'')+'</div>';
}
function nQuick(icon,title,sub,go){
  return '<button class="nquick" onclick="'+go+'">'+ic(icon)+
    '<span class="nquick-t">'+title+'</span><span class="nquick-s">'+sub+'</span></button>';
}
/* A callout: a note that carries a verdict. tone = ok | info | warn | risk */
function nCall(tone,title,text){
  return '<div class="ncall '+tone+'">'+(title?'<div class="ncall-t">'+title+'</div>':'')+
    '<div class="ncall-s">'+text+'</div></div>';
}
function nHead(title,sub){
  return '<div class="nhead"><div class="nhead-t">'+title+'</div>'+(sub?'<div class="nhead-s">'+sub+'</div>':'')+'</div>';
}

/* ── TODAY ── */
function eatToday(){
  const n=HF.data.nutrition||{};
  const t=mealTotals(), burned=burnTotal(), budget=n.cal+burned, left=Math.max(0,budget-t.kcal);
  const pct=Math.round(t.kcal/(budget||1)*100);
  const logged=mealsFor().length>0, score=hfScore(t.kcal,t.p,t.c,t.f);
  const bySlot={breakfast:[],lunch:[],dinner:[],snack:[]};
  mealsFor().forEach(m=>{ (bySlot[m.slot||'snack']=bySlot[m.slot||'snack']||[]).push(m); });

  /* What the day says, in words. Before anything is logged there is no
     verdict — "under target" at 8am with nothing eaten is not news. */
  let st;
  if(!logged)              st={c:'none', t:'Nothing logged yet — start with '+(SLOTS.filter(x=>x.k===slotNow())[0]||SLOTS[0]).n.toLowerCase()};
  else if(t.kcal>budget)   st={c:'risk', t:'Over by '+(t.kcal-budget).toLocaleString()+' kcal'};
  else if(t.kcal>=budget*.8) st={c:'ok',  t:'On track — '+left.toLocaleString()+' kcal to go'};
  else                     st={c:'info', t:left.toLocaleString()+' kcal still to eat today'};

  let h='';
  h+='<div class="nsum">'+
     '<div class="nsum-k">'+dayName()+'</div>'+
     '<div class="nsum-top">'+nRing(pct, left.toLocaleString(), t.kcal>budget?'over':'kcal left')+
     '<div class="nsum-side">'+
       '<div class="nsum-r"><span>Target</span><b>'+n.cal.toLocaleString()+'</b></div>'+
       '<div class="nsum-r"><span>Eaten</span><b>'+t.kcal.toLocaleString()+'</b></div>'+
       '<div class="nsum-r"><span>Exercise</span><b class="pos">+'+burned.toLocaleString()+'</b></div>'+
       '<div class="nsum-r"><span>Day score</span><b>'+(logged?score:'—')+'</b></div>'+
     '</div></div>'+
     '<div class="nstat '+st.c+'"><i></i>'+st.t+'</div>'+
     '<div class="nsum-macs">'+
       nMacro('Protein',t.p,n.pt,'var(--mac-p)')+
       nMacro('Carbs',t.c,n.ct,'var(--mac-c)')+
       nMacro('Fat',t.f,n.ft,'var(--ok)')+
     '</div></div>';

  // meals: one grouped list, the slot to fill next marked, + to add
  h+=nHead('Meals', 'Tap a meal to log into it');
  h+='<div class="nlist">'+SLOTS.map(s=>{
      const items=bySlot[s.k]||[], kc=items.reduce((a,m)=>a+(m.kcal||0),0);
      const aim=Math.round(n.cal*SLOT_SHARE[s.k]/10)*10;
      const sub= items.length ? kc.toLocaleString()+' kcal · '+hesc(items.map(m=>m.bm||m.name).join(', '))
                              : 'Aim for about '+aim.toLocaleString()+' kcal';
      return nRow(s.e, s.n, sub, '<span class="nadd" aria-label="Add">+</span>', "openManualAt('"+s.k+"')");
    }).join('')+'</div>';

  // activity
  h+=nHead('Activity', 'Training buys back calories — logged, not guessed');
  h+='<div class="nlist">'+nRow('flame','Exercise',
      burnFor().length ? burnFor().length+' logged today' : 'Log a session to earn calories back',
      '<span class="nval pos">+'+burned+'</span><span class="chev">›</span>','openBurn()')+'</div>';

  // quick actions
  h+='<div class="nquicks">'+
     nQuick('📷','Scan a meal',hasPlus()?'AI reads the plate':'With HITFAT+','openScan()')+
     nQuick('🍽️','Meal plan',hasPlus()?'Malaysian menus':'With HITFAT+',"setEatSeg('plan')")+
     '</div>';

  h+='<button class="authalt" onclick="HF.data.nutrition={};HF.save();renderEat()">Change my daily target</button>';
  $('eat-body').innerHTML=h;
}
function dayName(){ return new Date().toLocaleDateString('en-MY',{weekday:'long', day:'numeric', month:'long'}); }

/* ── PLAN ── */
function eatPlan(){
  const mpl=(HF.data.mealPlans||[]), n=HF.data.nutrition||{};
  let h='';
  h+='<div class="nstage">'+
     '<div class="nstage-k">Meal plan</div>'+
     '<div class="nstage-h">Build your meal plan</div>'+
     '<div class="nstage-s">Five questions, then a full Malaysian menu for 1 to 14 days — calories, macros and hand portions already worked out.</div>'+
     '<button class="nstage-cta" onclick="openMealPlan()">'+(hasPlus()?'Build my plan':'Unlock with HITFAT+')+'</button>'+
     '<div class="nstage-f">'+glyph('check')+'Malaysian Dietary Guidelines 2020 · CPG MOH 2023</div></div>';

  if(mpl.length){
    h+=nHead('Your plans','Saved as a spec — reopens identical every time');
    h+='<div class="nlist">'+mpl.map((p,i)=>nRow('clipboard',
        p.days+(p.days===1?' day · ':' days · ')+p.cal.toLocaleString()+' kcal',
        ({loss:'Lose weight',gain:'Gain weight',maintain:'Maintain'}[p.meta.goal]||p.meta.goal)+' · '+
        ({'3x':'Three meals','333':'Quarter-quarter-half','6x':'Six small meals','if':'Fasting 16:8'}[p.meta.struct]||p.meta.struct),
        '<button class="ndel" aria-label="Delete plan" onclick="event.stopPropagation();mpDelete('+i+')">✕</button><span class="chev">›</span>',
        'mpLoad('+i+')')).join('')+'</div>';
  }

  h+=nHead('How it works','');
  h+='<div class="nlist">'+[
      ['Your profile','Weight, height, age and activity — filled in from your calorie target.'],
      ['Safe calories','Never below 1,500 kcal for men or 1,200 for women; the deficit is capped at 750 a day.'],
      ['Malaysian menus','51 menus, with portions in fists and palms rather than grams.'],
      ['Three options per meal','Swap when an ingredient is missing — the calories stay in range.']
    ].map((x,i)=>'<div class="nli nstep"><span class="nnum">'+(i+1)+'</span>'+
      '<div class="nli-b"><div class="nli-t">'+x[0]+'</div><div class="nli-s">'+x[1]+'</div></div></div>').join('')+'</div>';

  if(!hasPlus()) h+='<div class="nlist" style="margin-top:14px;">'+nRow('spark','HITFAT+ membership',
     'Meal plans, AI scan and every program — from RM'+Math.round(SUB_PLANS[0].price/12)+' a month','<span class="chev">›</span>','openPaywall()')+'</div>';
  if(n.cal) h+='<div class="nfoot">Your current target is '+n.cal.toLocaleString()+' kcal. The plan recalculates from whatever you enter in the wizard.</div>';
  $('eat-body').innerHTML=h;
}

/* ── LOG ── */
function eatLog(){
  const list=mealsFor(), favs=(HF.data.favs||[]).slice(0,10);
  let h='';
  h+='<div class="nquicks">'+
     nQuick('📷','Scan with AI',hasPlus()?hesc(scanAccess().label):'With HITFAT+','openScan()')+
     nQuick('✏️','Add manually','Always open, unlimited','openManual()')+
     '</div>';

  if(favs.length){
    h+=nHead('Your usuals','One tap — no scan spent');
    h+='<div class="hscroll nfavs">'+favs.map((f,i)=>
      '<button class="nfav" onclick="logFav('+i+')"><span class="nfav-t">'+hesc(f.name)+'</span>'+
      '<span class="nfav-k">'+f.kcal+' kcal · P '+(f.p||0)+'g</span><span class="nadd">+</span></button>').join('')+'</div>';
  }

  const tot=mealTotals().kcal;
  h+=nHead("Today's log", list.length ? list.length+(list.length>1?' meals':' meal')+' · '+tot.toLocaleString()+' kcal' : '');
  if(!list.length){
    h+='<div class="nempty">'+ic('food')+'<div class="nempty-t">Nothing logged yet today</div>'+
       '<div class="nempty-s">Scan a plate or add it by hand — it lands in the right meal.</div></div>';
  } else {
    /* Grouped by meal, the way a food diary is read. The delete keeps the
       meal's index in the day, which is what delMeal expects. */
    SLOTS.forEach(s=>{
      const rows=list.map((m,i)=>({m,i})).filter(x=>(x.m.slot||'snack')===s.k);
      if(!rows.length) return;
      const kc=rows.reduce((a,x)=>a+(x.m.kcal||0),0);
      h+='<div class="nsub"><span>'+s.n+'</span><span>'+kc.toLocaleString()+' kcal</span></div><div class="nlist">'+
        rows.map(x=>'<div class="nli"><div class="nli-b"><div class="nli-t">'+hesc(x.m.bm||x.m.name)+'</div>'+
          '<div class="nli-s">'+(x.m.time?x.m.time+' · ':'')+'P '+x.m.p+'g · C '+x.m.c+'g · F '+x.m.f+'g</div></div>'+
          '<span class="nval">'+x.m.kcal+'</span>'+
          '<button class="ndel" aria-label="Remove" onclick="event.stopPropagation();delMeal('+x.i+')">✕</button></div>').join('')+
        '</div>';
    });
  }
  $('eat-body').innerHTML=h;
}
function logFav(i){
  const f=(HF.data.favs||[])[i]; if(!f) return;
  logMeal({name:f.name,bm:f.bm||f.name,kcal:f.kcal,p:f.p||0,c:f.c||0,f:f.f||0,slot:slotNow()});
  toast('Logged '+f.name); renderEat();
}

let _eg='male', _egoal='lose';
function renderEatSetup(){
  $('eat-body').innerHTML=
    '<div class="ehero"><div class="k">First, your target</div>'+
    '<div class="n" style="font-size:40px;margin-top:12px;">Set your<br>daily calories</div>'+
    '<div class="u" style="margin-top:10px;">Weight, height, age and goal — that is all it takes. Everything else on this tab builds itself from it.</div></div>'+
    fsec('About you','')+
    '<input class="inp" id="e-w" type="number" inputmode="decimal" placeholder="Weight (kg)">'+
    '<input class="inp" id="e-h" type="number" inputmode="decimal" placeholder="Height (cm)">'+
    '<input class="inp" id="e-a" type="number" inputmode="numeric" placeholder="Age">'+
    '<div class="qh">Sex</div><div class="filters">'+
    '<button class="chip" id="e-m" onclick="_eg=\'male\';renderPick()">Male</button>'+
    '<button class="chip" id="e-f" onclick="_eg=\'female\';renderPick()">Female</button></div>'+
    '<div class="qh">Goal</div><div class="filters">'+
    ['lose','maintain','muscle','bulk'].map(g=>'<button class="chip" id="e-g-'+g+'" onclick="_egoal=\''+g+'\';renderPick()">'+
      ({lose:'Lose fat',maintain:'Maintain',muscle:'Muscle',bulk:'Bulk'})[g]+'</button>').join('')+'</div>'+
    '<button class="bigbtn" onclick="saveNutrition()">Save target</button>';
  renderPick();
}
function renderPick(){
  const m=$('e-m'), f=$('e-f');
  if(m) m.className='chip'+(_eg==='male'?' y':''); if(f) f.className='chip'+(_eg==='female'?' y':'');
  ['lose','maintain','muscle','bulk'].forEach(g=>{ const b=$('e-g-'+g); if(b) b.className='chip'+(_egoal===g?' y':''); });
}
function saveNutrition(){
  const w=parseFloat(($('e-w')||{}).value), h=parseFloat(($('e-h')||{}).value), a=parseInt(($('e-a')||{}).value,10);
  if(!w||!h||!a){ toast('Fill in weight, height and age'); return; }
  const cal=tdee(w,h,a,_eg,_egoal);
  HF.data.nutrition={w,h,a,gender:_eg,goal:_egoal,cal,pt:Math.round(w*1.8),ct:Math.round(cal*.45/4),ft:Math.round(cal*.25/9)};
  HF.data.weight=(HF.data.weight||[]).filter(x=>x.iso!==iso(0)).concat([{iso:iso(0),kg:w}]);
  HF.save(); toast('Target set'); renderEat();
}
function logMeal(m){
  const d=iso(0);
  HF.data.meals[d]=(HF.data.meals[d]||[]).concat([Object.assign({
    time:new Date().toLocaleTimeString('en-MY',{hour:'2-digit',minute:'2-digit',hour12:true}),
    slot:slotNow(), p:0,c:0,f:0, comps:[]
  },m)]);
  HF.save();
}
function delMeal(i){ const d=iso(0); (HF.data.meals[d]||[]).splice(i,1); HF.save(); renderEat(); }

/* ── ACTIVITY BURN ── */
function openBurn(){ $('burnsheet').classList.add('on'); $('sheetbg').classList.add('on'); renderBurn(); }
function closeBurn(){ $('burnsheet').classList.remove('on'); $('sheetbg').classList.remove('on'); renderEat(); }
function addBurn(name,mins,rate){
  const d=iso(0);
  HF.data.burn[d]=(HF.data.burn[d]||[]).concat([{name,mins,kcal:Math.round(mins*rate)}]);
  HF.save(); renderBurn();
}
function delBurn(i){ const d=iso(0); (HF.data.burn[d]||[]).splice(i,1); HF.save(); renderBurn(); }
function renderBurn(){
  const list=burnFor();
  $('burn-body').innerHTML=
    '<div style="font-family:\'Oswald\';font-size:30px;color:var(--ok);line-height:1;">+'+burnTotal()+'</div>'+
    '<div class="sub" style="margin-bottom:14px;">kcal burned today</div>'+
    '<div class="filters">'+
    [['Walk',30,5],['Run',30,10],['Gym',45,7],['Cycling',45,8],['HIIT',20,11]].map(x=>
      '<button class="chip" onclick="addBurn(\''+x[0]+'\','+x[1]+','+x[2]+')">'+x[0]+' '+x[1]+'m</button>').join('')+'</div>'+
    (list.length?'<div style="display:flex;flex-direction:column;gap:8px;margin-top:6px;">'+list.map((x,i)=>
      '<div class="wrow"><div class="tx"><div class="t">'+x.name+'</div><div class="m">'+x.mins+' min</div></div>'+
      '<div style="font-family:\'Oswald\';font-size:17px;color:var(--ok);">+'+x.kcal+'</div>'+
      '<div class="chev" onclick="delBurn('+i+')">✕</div></div>').join('')+'</div>'
      :'<div class="empty" style="padding:24px 0;">No activity logged today.</div>')+
    '<button class="bigbtn" onclick="closeBurn()">Done</button>';
}

/* ── MANUAL ADD ── */
let _slot='breakfast';
function openManualAt(k){ openManual(); _slot=k; renderManual(); }
function openManual(){ _slot=slotNow(); $('mansheet').classList.add('on'); $('sheetbg').classList.add('on'); renderManual(); }
function closeManual(){ $('mansheet').classList.remove('on'); $('sheetbg').classList.remove('on'); renderEat(); }
function setSlot(s){ _slot=s; renderManual(); }
function renderManual(){
  const favs=(HF.data.favs||[]).slice(0,8);
  $('man-body').innerHTML=
    '<div style="font-size:17px;font-weight:800;margin-bottom:3px;">Add a meal</div>'+
    '<div class="sub" style="margin-bottom:14px;">Log anything by hand — always open, no scan used.</div>'+
    (favs.length?'<div class="qh">Quick pick</div><div class="filters">'+favs.map((f,i)=>
      '<button class="chip" onclick="fillFav('+i+')">'+f.name+' · '+f.kcal+'</button>').join('')+'</div>':'')+
    '<div class="qh">Meal</div><div class="filters">'+SLOTS.map(s=>
      '<button class="chip'+(_slot===s.k?' y':'')+'" onclick="setSlot(\''+s.k+'\')">'+glyph(s.e)+' '+s.n+'</button>').join('')+'</div>'+
    '<input class="inp" id="m-name" placeholder="What did you eat? e.g. Nasi lemak">'+
    '<input class="inp" id="m-kcal" type="number" inputmode="numeric" placeholder="Calories (kcal)">'+
    '<div class="qh">Macros (optional)</div>'+
    '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;">'+
    '<input class="inp" id="m-p" type="number" inputmode="numeric" placeholder="Protein g">'+
    '<input class="inp" id="m-c" type="number" inputmode="numeric" placeholder="Carbs g">'+
    '<input class="inp" id="m-f" type="number" inputmode="numeric" placeholder="Fat g"></div>'+
    '<button class="bigbtn" onclick="saveManual()">Log meal</button>'+
    '<button class="bigbtn sec" onclick="closeManual()">Cancel</button>';
}
function fillFav(i){
  const f=(HF.data.favs||[])[i]; if(!f) return;
  ['m-name','m-kcal','m-p','m-c','m-f'].forEach((id,k)=>{ const e=$(id); if(e) e.value=[f.name,f.kcal,f.p,f.c,f.f][k]||''; });
}
function saveManual(){
  const name=(($('m-name')||{}).value||'').trim(), kcal=parseInt(($('m-kcal')||{}).value,10);
  if(!name){ toast('Enter the food name'); return; }
  if(!kcal||kcal<=0){ toast('Enter the calories'); return; }
  logMeal({name, bm:name, kcal, slot:_slot,
    p:parseInt(($('m-p')||{}).value,10)||0, c:parseInt(($('m-c')||{}).value,10)||0, f:parseInt(($('m-f')||{}).value,10)||0});
  toast('Meal logged'); closeManual();
}

/* ── SCAN ── */
let _scanData=null, _scanTok=0, _pctTimer=null;
function openScan(){
  if(needPlus('AI meal scan is part of HITFAT+. Logging by hand stays open.')) return;
  if(!canScan()){ openPaywall('Your scans have run out.'); return; }
  _scanData=null;
  $('scan').classList.add('on');
  $('scan-prev').style.display='none'; $('scan-prev').src='';
  $('scan-ph').style.display='flex'; $('scan-frame').classList.remove('on');
  $('scan-sheet').classList.remove('on');
  $('scan-err').style.display='none';
  $('scan-live').textContent='Ready';
  $('scan-left').textContent=scanAccess().label;
}
function closeScan(){ $('scan').classList.remove('on'); stopScanAnim(); renderEat(); }
function pickPhoto(useCamera){
  const inp=document.createElement('input');
  inp.type='file'; inp.accept='image/*';
  if(useCamera) inp.capture='environment';
  inp.style.display='none';
  inp.onchange=()=>onScanFile(inp);
  document.body.appendChild(inp); inp.click();
  setTimeout(()=>{ try{ document.body.removeChild(inp); }catch(e){} },30000);
}
function startScanAnim(){
  stopScanAnim();
  const el=$('scan-pct'); if(!el) return;
  el.style.display='block'; let p=0; el.textContent='0%';
  _pctTimer=setInterval(()=>{ if(p<95) p+=Math.random()<.35?2:1; el.textContent=Math.min(p,99)+'%'; },100);
}
function stopScanAnim(){
  if(_pctTimer){ clearInterval(_pctTimer); _pctTimer=null; }
  const el=$('scan-pct'); if(el){ el.textContent='100%'; setTimeout(()=>{ el.style.display='none'; },400); }
}
function onScanFile(input){
  const file=input.files&&input.files[0]; if(!file) return;
  _scanTok++; const tok=_scanTok;
  $('scan-err').style.display='none'; $('scan-ph').style.display='none';
  $('scan-live').textContent='Scanning';
  const reader=new FileReader();
  reader.onload=e=>{
    if(tok!==_scanTok) return;
    const url=e.target.result;
    const prev=$('scan-prev'); prev.src=url; prev.style.display='block';
    $('scan-frame').classList.add('on'); startScanAnim();
    const img=new Image();
    img.onload=()=>{
      if(tok!==_scanTok) return;
      // downscale before upload — a full phone photo is megabytes of nothing useful
      let w=img.width,h=img.height; const M=600;
      if(w>M){ h=Math.round(h*M/w); w=M; }
      if(h>M){ w=Math.round(w*M/h); h=M; }
      const cv=document.createElement('canvas'); cv.width=w; cv.height=h;
      cv.getContext('2d').drawImage(img,0,0,w,h);
      const b64=cv.toDataURL('image/jpeg',0.7).split(',')[1];
      cv.width=1; cv.height=1;
      scanToken().then(tk=>{
        if(!tk) throw new Error('Sign in to use Meal Scan.');
        return fetch(SCAN_FN,{method:'POST',
          headers:{'Content-Type':'application/json','Authorization':'Bearer '+tk,'apikey':SUPA_KEY},
          body:JSON.stringify({image_base64:b64,context:'Malaysian food',region:'Malaysia'})});
      })
        .then(r=>r.json().then(j=>({ok:r.ok,status:r.status,j})))
        .then(res=>{
          if(tok!==_scanTok) return;
          $('scan-frame').classList.remove('on'); stopScanAnim();
          if(!res.ok) throw Object.assign(new Error((res.j&&res.j.error)||'Scan failed'),
                                          {status:res.status, code:res.j&&res.j.code});
          $('scan-live').textContent='Done';
          /* The server already recorded this scan. Mirror it locally so the
             count on screen matches without a second round trip. */
          scanBump();
          _scanData=res.j;
          renderScanResult(res.j);
        })
        .catch(err=>{
          if(tok!==_scanTok) return;
          $('scan-frame').classList.remove('on'); stopScanAnim();
          $('scan-live').textContent='Error';
          if(err && err.code==='quota_exceeded'){ closeScan(); openPaywall('Your scans have run out.'); return; }
          const el=$('scan-err');
          el.textContent=(err&&err.message)||'Scan failed. Try clearer lighting, or log it manually.';
          el.style.display='block';
        });
    };
    img.src=url;
  };
  reader.readAsDataURL(file);
}

/* ── RESULT ── */
function mealBadge(kcal){
  const n=HF.data.nutrition||{}, t=n.cal;
  let label,c;
  const pct = t ? kcal/t : null;
  if(pct!==null){ if(pct<0.30){label='GOOD TO EAT';c='var(--ok)';} else if(pct<=0.50){label='FINE, BUT ADJUST';c='#f59e0b';} else {label='SKIP IT TODAY';c='#EF4444';} }
  else { if(kcal<500){label='GOOD TO EAT';c='var(--ok)';} else if(kcal<=850){label='FINE, BUT ADJUST';c='#f59e0b';} else {label='SKIP IT TODAY';c='#EF4444';} }
  return {label,c};
}
function coachText(kcal,p,c,f){
  const out=[], n=HF.data.nutrition||{}, goal=n.goal||'lose';
  const eaten=mealTotals().kcal, rem=n.cal?Math.max(0,n.cal-eaten+burnTotal()):null;
  if(kcal>750) out.push('This one is on the heavy side, but it is still fine if you manage the next meal properly.');
  else if(kcal<250) out.push('Light meal — low calories, works as a snack or in a cut.');
  else out.push('Calories on this meal sit in a balanced range.');
  if(p<12) out.push('Protein is low — add eggs, chicken or tofu to the next meal.');
  else if(p>=25) out.push((goal==='muscle'||goal==='bulk')?'High protein — perfect for building muscle.':'High protein — good for staying full and supporting your metabolism.');
  if(c>70&&f>20) out.push('Carbs and fat are both a little high — balance it with high protein next meal.');
  else if(c>70) out.push('Carbs are high — go easy on rice, noodles and bread for the next meal.');
  else if(f>25) out.push('Fat is a bit high — skip fried food and coconut-milk gravy after this.');
  if(rem!==null&&rem<300) out.push('Not much of your budget left — pick something light and high in protein.');
  else if(rem!==null&&rem>600) out.push('You still have room — use it well, focus on protein.');
  return out.slice(0,3).join(' ')||'This looks fine — keep the protein up and drink plenty of water through the day.';
}
function coachActions(kcal,p,c,f){
  const t=[];
  if(p<15) t.push(['🥚','Add a protein source to your next meal — egg, chicken or fish.']);
  if(c>60) t.push(['🚫','Cut back on rice, noodles or bread for the next meal.']);
  if(f>25) t.push(['🍳','Avoid fried food or thick gravy after this one.']);
  if(kcal>700) t.push(['🏃','Walk 20–30 minutes this evening to buy back some calories.']);
  if(kcal<300) t.push(['⚡','Low-calorie meal — stay hydrated and do not skip your main meals.']);
  if(t.length<2) t.push(['💧','Drink enough water — it helps your metabolism and blunts hunger.']);
  if(t.length<3) t.push(['🌙','Make dinner high protein and lower carb.']);
  return t.slice(0,4);
}
/* "Burn this meal" — MET × body weight. Honest about being an estimate. */
function burnOptions(kcal){
  const w=(HF.data.nutrition&&HF.data.nutrition.w)||70;
  return [['🏃','Running',9.8],['🚶','Walking',3.5],['⚡','HIIT',10],['💪','Burpees',8],['🚴','Cycling',7.5]]
    .map(([e,n,met])=>{ const m=Math.round(kcal/(met*w/60)); const hh=Math.floor(m/60), mm=m%60;
      // raw minutes returned alongside the label so it can be compared, not just printed
      return [e,n, hh>0?(hh+'h '+(mm?mm+'m':'')):(m+' min'), m]; });
}
let _mrt=0;
function setMRT(i){ _mrt=i; renderScanResult(_scanData); }
function renderScanResult(d){
  if(!d) return;
  const kcal=Math.round(Number(d.estimated_calories||d.calories||0));
  const p=Math.round(Number(d.protein_g||d.protein||0));
  const c=Math.round(Number(d.carbs_g||d.carbs||0));
  const f=Math.round(Number(d.fat_g||d.fat||0));
  const name=(d.food_name||'').trim();
  const unknown=!name||/^(n\/a|unknown)$/i.test(name);
  const b=mealBadge(kcal);
  let h='<div style="width:36px;height:4px;background:var(--hairline);border-radius:2px;margin:0 auto 14px;"></div>';
  h+='<div class="sub" style="display:flex;align-items:center;gap:7px;margin-bottom:10px;">'+
     '<span style="width:6px;height:6px;border-radius:50%;background:var(--hyrox);"></span>AI Meal Scan · HITFAT+</div>';
  h+='<div style="font-size:20px;font-weight:800;line-height:1.2;">'+(unknown?'Could not identify the food':name)+'</div>';
  if(d.food_name_bm && d.food_name_bm.trim().toLowerCase()!==name.toLowerCase()) h+='<div class="sub">'+hesc(d.food_name_bm)+'</div>';
  if(d.portion_size) h+='<div class="sub" style="margin-top:2px;">'+d.portion_size+'</div>';
  if(unknown){
    h+='<div class="empty" style="padding:22px 0;">Try a brighter photo, or log it by hand.</div>'+
       '<button class="bigbtn" onclick="closeScan();openManual()">Log it manually</button>'+
       '<button class="bigbtn sec" onclick="$(\'scan-sheet\').classList.remove(\'on\')">Back</button>';
    $('scan-sheet').innerHTML=h; $('scan-sheet').classList.add('on'); return;
  }
  /* The verdict, then the meal against the day it has to fit in. */
  const tone=b.label==='GOOD TO EAT'?'ok':b.label==='SKIP IT TODAY'?'risk':'warn';
  const n=HF.data.nutrition||{};
  h+='<div style="margin:12px 0 4px;"><span class="npill '+tone+'">'+b.label.charAt(0)+b.label.slice(1).toLowerCase()+'</span></div>';
  h+='<div class="nbox nscan"><div class="nscan-k"><b>'+kcal.toLocaleString()+'</b> kcal'+
     (n.cal?'<span> · '+Math.round(kcal/n.cal*100)+'% of your day</span>':'')+'</div>'+
     nMacro('Protein',p,n.pt||Math.max(p,1),'var(--mac-p)')+
     nMacro('Carbs',c,n.ct||Math.max(c,1),'var(--mac-c)')+
     nMacro('Fat',f,n.ft||Math.max(f,1),'var(--ok)')+'</div>';
  // tabs
  h+='<div class="segs nscan-segs">'+['Overview','Coach','Action'].map((t,i)=>
      '<button class="seg'+(_mrt===i?' on':'')+'" onclick="setMRT('+i+')">'+t+'</button>').join('')+'</div>';
  if(_mrt===0){
    if(d.breakdown&&d.breakdown.length){
      h+='<div class="nsub"><span>What is in it</span><span>'+(d.portion_size?hesc(d.portion_size):'1 serving')+'</span></div>'+
         '<div class="nlist">'+d.breakdown.map(it=>{
        const wt=it.weight_g?(it.weight_g+' g'):(it.weight_ml?(it.weight_ml+' ml'):'');
        return '<div class="nli"><div class="nli-b"><div class="nli-t">'+hesc(it.ingredient||it.name||'')+'</div>'+
          (wt?'<div class="nli-s">'+wt+'</div>':'')+'</div><span class="nval">'+Math.round(it.calories||0)+'</span></div>';
      }).join('')+'</div>';
    }
    h+='<div class="nsub"><span>To burn this meal</span><span>for your weight</span></div>'+
       '<div class="nlist">'+burnOptions(kcal).map(x=>nLiStatic(x[0],x[1],'<span class="nval">'+x[2]+'</span>')).join('')+'</div>';
  } else if(_mrt===1){
    h+=nCall('info','Coach says',coachText(kcal,p,c,f));
  } else {
    h+='<div class="nlist" style="margin-top:12px;">'+coachActions(kcal,p,c,f).map(t=>nLiStatic(t[0],'',t[1])).join('')+'</div>';
    if(n.cal){ const eaten=mealTotals().kcal, rem=Math.max(0,n.cal-eaten+burnTotal());
      h+='<div class="nbox" style="margin-top:10px;"><div class="nsum-r"><span>Calories left today</span><b>'+rem.toLocaleString()+' kcal</b></div>'+
         '<div class="nsum-r" style="margin-top:6px;"><span>Target '+n.cal.toLocaleString()+' · eaten '+eaten.toLocaleString()+'</span></div></div>'; }
  }
  h+='<div class="nactions">'+
     '<button class="bigbtn sec" onclick="saveFav()">Save as usual</button>'+
     '<button class="bigbtn" onclick="logScanned()">Log this meal</button></div>'+
     '<div class="nfoot" style="text-align:center;">AI estimate — treat it as a guide, not a measurement.</div>';
  $('scan-sheet').innerHTML=h;
  $('scan-sheet').classList.add('on');
}
function scanToMeal(){
  const d=_scanData; if(!d) return null;
  return { name:d.food_name||'Food', bm:d.food_name_bm||'',
    kcal:Math.round(Number(d.estimated_calories||d.calories||0)),
    p:Math.round(Number(d.protein_g||d.protein||0)),
    c:Math.round(Number(d.carbs_g||d.carbs||0)),
    f:Math.round(Number(d.fat_g||d.fat||0)),
    slot:slotNow(),
    comps:(d.breakdown||[]).map(x=>({name:x.ingredient||x.name||'',kcal:Math.round(x.calories||0)})) };
}
function logScanned(){
  const m=scanToMeal(); if(!m) return;
  logMeal(m); _scanData=null; toast('Meal logged'); closeScan();
}
function saveFav(){
  const m=scanToMeal(); if(!m) return;
  const favs=(HF.data.favs||[]).filter(x=>x.name!==m.name);
  favs.unshift({name:m.name,bm:m.bm,kcal:m.kcal,p:m.p,c:m.c,f:m.f});
  HF.data.favs=favs.slice(0,30); HF.save();
  toast('Saved to quick pick');
}


