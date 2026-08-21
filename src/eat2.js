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
    '<div class="ic">'+o.ic+'</div><div class="t">'+o.t+'</div><div class="s">'+o.s+'</div>'+
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

/* ── TODAY ── */
function eatToday(){
  const n=HF.data.nutrition||{};
  const t=mealTotals(), burned=burnTotal(), left=Math.max(0,n.cal-t.kcal+burned), net=t.kcal-burned;
  const pct=Math.min(100,Math.round(t.kcal/n.cal*100));
  const st=dayStatus(t.kcal), score=hfScore(t.kcal,t.p,t.c,t.f);
  const scoreC=score>=70?'var(--ok)':score>=45?'#f59e0b':'#EF4444';
  const bySlot={breakfast:0,lunch:0,dinner:0,snack:0}, cntSlot={breakfast:0,lunch:0,dinner:0,snack:0};
  mealsFor().forEach(m=>{ const k=m.slot||'snack'; bySlot[k]+=(m.kcal||0); cntSlot[k]++; });

  let h='';
  // hero
  h+='<div class="ehero"><div class="k">'+dayName()+' · Calories left</div>'+
     '<div class="row">'+donutSVG(pct,'#EF4444',104)+
     '<div style="flex:1;min-width:0;"><div class="n">'+left.toLocaleString()+'</div>'+
     '<div class="u">of '+n.cal.toLocaleString()+' kcal</div>'+
     '<div class="estat" style="background:'+hexA(st.c,.14)+';border:1px solid '+hexA(st.c,.32)+';">'+
     '<span class="d" style="background:'+st.c+';"></span>'+
     '<span class="t" style="color:'+st.c+';">'+st.t+'</span></div></div></div>'+
     '<div class="sp">'+
     [[t.kcal.toLocaleString(),'Eaten'],['+'+burned.toLocaleString(),'Burned'],[net.toLocaleString(),'Net'],[score,'HF Score']]
       .map((x,i)=>'<div><div class="v"'+(i===3?' style="color:'+scoreC+';"':'')+'>'+x[0]+'</div><div class="l">'+x[1]+'</div></div>').join('')+
     '</div></div>';

  // meals across the day
  h+=fsec('Your day','Tap a slot to log straight into it');
  h+='<div class="hscroll">'+SLOTS.map(s=>{
      const v=bySlot[s.k], share=Math.min(100,Math.round(v/(n.cal||1)*100*2.6));
      return '<div class="eslot'+(v>0?' hit':'')+'" onclick="openManualAt(\''+s.k+'\')">'+
        '<div class="e">'+s.e+'</div><div class="n">'+s.n+'</div>'+
        '<div class="v">'+(v||'—')+'</div>'+
        '<div class="m">'+(cntSlot[s.k]?cntSlot[s.k]+(cntSlot[s.k]>1?' items':' item'):'Nothing yet')+'</div>'+
        '<div class="b"><i style="width:'+(v>0?Math.max(6,share):0)+'%"></i></div></div>';
    }).join('')+'</div>';

  // macros
  h+=fsec('Macros','Against the split from your target');
  h+='<div class="emacs">'+
     [['Protein',t.p,n.pt,'#fb923c'],['Carbs',t.c,n.ct,'#38bdf8'],['Fat',t.f,n.ft,'var(--ok)']].map(m=>{
       const w=Math.min(100,Math.round(m[1]/(m[2]||1)*100));
       return '<div class="emac"><div class="v" style="color:'+m[3]+';">'+m[1]+'<span style="font-size:15px;font-weight:400;letter-spacing:0;">g</span></div>'+
         '<div class="l">'+m[0]+'</div><div class="g">of '+m[2]+'g</div>'+
         '<div class="b"><i style="width:'+w+'%;background:'+m[3]+';"></i></div></div>';
     }).join('')+'</div>';

  // burn
  h+=fsec('Moved today','Training buys back calories — logged, not guessed');
  h+='<div class="elog" onclick="openBurn()"><div class="e">🔥</div>'+
     '<div class="tx"><div class="t">Exercise burn</div>'+
     '<div class="m">'+(burnFor().length?burnFor().length+' logged today':'Tap to log an activity')+'</div></div>'+
     '<div class="k" style="color:var(--ok);">+'+burned+'</div><div class="chev">›</div></div>';

  // shortcut into the other two segments
  h+=fsec('Next','');
  h+='<div class="hscroll" style="gap:12px;">'+
     '<div style="flex:none;width:270px;">'+ecta({go:"setEatSeg('log')",ic:'📷',t:'Log a meal',
        s:'Scan it with AI, or type it in — logging by hand is always free.',
        btn:'Open log',c1:'#2a1016',c2:'#0b0b0d',ac:'#EF4444'})+'</div>'+
     '<div style="flex:none;width:270px;">'+ecta({go:"setEatSeg('plan')",ic:'🍽️',t:'Meal plan',
        s:'Malaysian menus, costed against your calories and restrictions.',
        btn:'Open plans',c1:'#0f2028',c2:'#0b0b0d',ac:'#38bdf8'})+'</div>'+
     '</div>';

  h+='<button class="authalt" onclick="HF.data.nutrition={};HF.save();renderEat()">Change my daily target</button>';
  $('eat-body').innerHTML=h;
}
function dayName(){ return new Date().toLocaleDateString('en-MY',{weekday:'long'}); }

/* ── PLAN ── */
function eatPlan(){
  const mpl=(HF.data.mealPlans||[]), n=HF.data.nutrition||{};
  let h='';
  h+=ecta({go:'openMealPlan()',ic:'🍽️',t:'Build your meal plan',
    s:'Five questions, then a full menu for 1 to 14 days — calories, macros and hand portions already worked out.',
    btn:'Start →',c1:'#2a1016',c2:'#0b0b0d',ac:'#EF4444',
    note:'MDG 2020 · CPG MOH 2023'});

  if(mpl.length){
    h+=fsec('Your plans','Saved as a spec — reopens identical every time');
    h+='<div class="flib">'+mpl.map((p,i)=>
      '<div class="row" onclick="mpLoad('+i+')">'+
      '<div class="ic">📋</div>'+
      '<div style="flex:1;min-width:0;"><div style="font-size:17px;font-weight:600;color:var(--txt);">'+
        p.days+(p.days===1?' day · ':' days · ')+p.cal.toLocaleString()+' kcal</div>'+
      '<div style="font-size:13px;color:var(--dim2);margin-top:3px;">'+
        ({loss:'Lose weight',gain:'Gain weight',maintain:'Maintain'}[p.meta.goal]||p.meta.goal)+' · '+
        ({'3x':'Three meals','333':'Quarter-quarter-half','6x':'Six small meals','if':'Fasting 16:8'}[p.meta.struct]||p.meta.struct)+'</div></div>'+
      '<div class="cv" onclick="event.stopPropagation();mpDelete('+i+')">✕</div></div>').join('')+'</div>';
  }

  h+=fsec('How it works','');
  h+='<div class="flib">'+[
      ['1','Your profile','Weight, height, age and activity — filled in from your calorie target'],
      ['2','Safe calories','Floor of 1,500 kcal for men and 1,200 for women, deficit capped at 750 a day'],
      ['3','Malaysian menus','51 menus, portions measured in fists and palms rather than grams'],
      ['4','Three options per slot','Swap when an ingredient is missing — the calories stay in range']
    ].map(x=>'<div class="row" style="cursor:default;"><div class="ic" style="color:var(--hyrox);font-weight:800;">'+x[0]+'</div>'+
      '<div style="flex:1;"><div style="font-size:15px;font-weight:600;color:var(--txt);">'+x[1]+'</div>'+
      '<div style="font-size:13px;color:var(--dim);margin-top:3px;line-height:1.45;">'+x[2]+'</div></div></div>').join('')+'</div>';

  if(!ownsAll()) h+='<div class="wrow" style="margin-top:14px;" onclick="openProduct(BUNDLE_SKU)">'+
     '<div style="font-size:20px;">✦</div><div class="tx"><div class="t">All Access · one payment</div>'+
     '<div class="m">14-day plans, every program, yours to keep</div></div><div class="chev">›</div></div>';
  if(n.cal) h+='<div class="mpnote">Your current target is '+n.cal.toLocaleString()+' kcal. The plan recalculates from whatever you enter in the wizard.</div>';
  $('eat-body').innerHTML=h;
}

/* ── LOG ── */
function eatLog(){
  const list=mealsFor(), favs=(HF.data.favs||[]).slice(0,10);
  const slotOf={}; SLOTS.forEach(s=>slotOf[s.k]=s.e);
  let h='';
  h+='<div style="display:grid;grid-template-columns:1fr;gap:12px;">'+
     ecta({go:'openScan()',ic:'📷',t:'AI Meal Scan',
       s:'Photograph your food — calories, protein, carbs and fat come back in seconds.',
       btn:'Scan now',c1:'#2a1016',c2:'#0b0b0d',ac:'#EF4444',
       note:scanAccess().label.toUpperCase()})+
     '</div>';
  h+='<div class="elog" style="margin-top:14px;" onclick="openManual()"><div class="e">✏️</div>'+
     '<div class="tx"><div class="t">Add manually</div><div class="m">Always free, unlimited</div></div>'+
     '<div class="chev">›</div></div>';

  if(favs.length){
    h+=fsec('Your usuals','One tap — no scan spent');
    h+='<div class="hscroll">'+favs.map((f,i)=>
      '<div class="eslot" onclick="logFav('+i+')" style="width:170px;">'+
      '<div class="e">⭐</div><div class="n" style="line-height:1.25;">'+f.name+'</div>'+
      '<div class="v">'+f.kcal+'</div><div class="m">kcal · P '+(f.p||0)+'g</div></div>').join('')+'</div>';
  }

  h+=fsec("Today's log", list.length ? list.length+(list.length>1?' meals':' meal')+' · '+mealTotals().kcal.toLocaleString()+' kcal' : '');
  h+= list.length
    ? '<div class="flib">'+list.map((m,i)=>
        '<div class="elog"><div class="e">'+(slotOf[m.slot]||'🍽️')+'</div>'+
        '<div class="tx"><div class="t">'+(m.bm||m.name)+'</div>'+
        '<div class="m">'+m.time+' · P '+m.p+'g · C '+m.c+'g · F '+m.f+'g</div></div>'+
        '<div class="k">'+m.kcal+'</div>'+
        '<div class="x" onclick="event.stopPropagation();delMeal('+i+')">✕</div></div>').join('')+'</div>'
    : '<div class="empty">Nothing logged yet today.</div>';
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
    '<div class="sub" style="margin-bottom:14px;">Log anything by hand — always free, no scan used.</div>'+
    (favs.length?'<div class="qh">Quick pick</div><div class="filters">'+favs.map((f,i)=>
      '<button class="chip" onclick="fillFav('+i+')">'+f.name+' · '+f.kcal+'</button>').join('')+'</div>':'')+
    '<div class="qh">Meal</div><div class="filters">'+SLOTS.map(s=>
      '<button class="chip'+(_slot===s.k?' y':'')+'" onclick="setSlot(\''+s.k+'\')">'+s.e+' '+s.n+'</button>').join('')+'</div>'+
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
  if(!canScan()){ openStore('scan'); return; }
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
          if(err && err.code==='quota_exceeded'){ closeScan(); openStore('scan'); return; }
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
  let h='<div style="width:36px;height:4px;background:rgba(255,255,255,.15);border-radius:2px;margin:0 auto 14px;"></div>';
  h+='<div class="sub" style="display:flex;align-items:center;gap:7px;margin-bottom:10px;">'+
     '<span style="width:6px;height:6px;border-radius:50%;background:var(--hyrox);"></span>AI Meal Scan · HITFAT+</div>';
  h+='<div style="font-size:20px;font-weight:800;line-height:1.2;">'+(unknown?'Could not identify the food':name)+'</div>';
  if(d.food_name_bm) h+='<div class="sub">'+d.food_name_bm+'</div>';
  if(d.portion_size) h+='<div class="sub" style="margin-top:2px;">'+d.portion_size+'</div>';
  if(unknown){
    h+='<div class="empty" style="padding:22px 0;">Try a brighter photo, or log it by hand.</div>'+
       '<button class="bigbtn" onclick="closeScan();openManual()">Log it manually</button>'+
       '<button class="bigbtn sec" onclick="$(\'scan-sheet\').classList.remove(\'on\')">Back</button>';
    $('scan-sheet').innerHTML=h; $('scan-sheet').classList.add('on'); return;
  }
  h+='<div style="display:inline-flex;align-items:center;gap:7px;padding:6px 13px;border-radius:99px;margin:12px 0;background:'+hexA(b.c,.12)+';border:1px solid '+hexA(b.c,.3)+';">'+
     '<span style="width:7px;height:7px;border-radius:50%;background:'+b.c+';"></span>'+
     '<span style="font-size:11px;font-weight:900;letter-spacing:1.5px;color:'+b.c+';">'+b.label+'</span></div>';
  h+='<div class="arow">'+
     [[kcal,'Calories','#EF4444'],[p+'g','Protein','#fb923c'],[c+'g','Carbs','#38bdf8'],[f+'g','Fat','var(--ok)']].map(x=>
       '<div class="acard" style="text-align:center;padding:12px 6px;"><div style="font-family:\'Oswald\';font-size:20px;color:'+x[2]+';">'+x[0]+'</div>'+
       '<div class="sub" style="font-size:11px;">'+x[1]+'</div></div>').join('')+'</div>';
  // tabs
  h+='<div class="filters" style="margin-top:16px;">'+['Overview','Coach','Action'].map((t,i)=>
      '<button class="chip'+(_mrt===i?' y':'')+'" onclick="setMRT('+i+')">'+t+'</button>').join('')+'</div>';
  if(_mrt===0){
    if(d.breakdown&&d.breakdown.length){
      h+='<div class="sub" style="margin-bottom:8px;">Based on 1 serving'+(d.portion_size?' ('+d.portion_size+')':'')+'</div>'+
         '<div style="display:flex;flex-direction:column;gap:8px;">'+d.breakdown.map(it=>{
        const wt=it.weight_g?(it.weight_g+'g'):(it.weight_ml?(it.weight_ml+'ml'):'');
        return '<div class="wrow"><div class="tx"><div class="t">'+(it.ingredient||it.name||'')+'</div>'+
          (wt?'<div class="m">'+wt+'</div>':'')+'</div>'+
          '<div style="font-family:\'Oswald\';font-size:17px;color:var(--dim);">'+Math.round(it.calories||0)+'</div></div>';
      }).join('')+'</div>';
    }
    h+='<div class="qh">To burn this meal</div><div style="display:flex;flex-direction:column;gap:8px;">'+
       burnOptions(kcal).map(x=>'<div class="wrow"><div style="font-size:17px;">'+x[0]+'</div>'+
       '<div class="tx"><div class="t">'+x[1]+'</div><div class="m">'+x[2]+'</div></div></div>').join('')+'</div>'+
       '<div class="sub" style="font-size:11px;text-align:center;margin-top:8px;">Estimated from your body weight</div>';
  } else if(_mrt===1){
    h+='<div class="acard"><div class="ah"><div style="width:32px;height:32px;border-radius:50%;background:var(--hyrox);display:grid;place-items:center;font-size:15px;">💪</div>'+
       '<div class="t">Coach says</div></div>'+
       '<div style="font-size:15px;line-height:1.7;color:rgba(255,255,255,.85);">'+coachText(kcal,p,c,f)+'</div></div>';
  } else {
    h+='<div style="display:flex;flex-direction:column;gap:8px;">'+coachActions(kcal,p,c,f).map(t=>
       '<div class="wrow"><div style="font-size:17px;">'+t[0]+'</div><div class="tx"><div class="m" style="color:rgba(255,255,255,.8);font-size:13px;">'+t[1]+'</div></div></div>').join('')+'</div>';
    const n=HF.data.nutrition||{};
    if(n.cal){ const eaten=mealTotals().kcal, rem=Math.max(0,n.cal-eaten+burnTotal());
      h+='<div class="acard" style="margin-top:10px;"><div class="ah"><div class="t">Calories left today</div></div>'+
         '<div class="sub">Target '+n.cal.toLocaleString()+' · eaten '+eaten.toLocaleString()+'</div>'+
         '<div class="big" style="color:var(--hyrox);margin-top:6px;">'+rem.toLocaleString()+' kcal</div></div>'; }
  }
  h+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:18px;">'+
     '<button class="bigbtn sec" style="margin:0;" onclick="saveFav()">☆ Save as usual</button>'+
     '<button class="bigbtn" style="margin:0;" onclick="logScanned()">Log this meal</button></div>'+
     '<div class="sub" style="font-size:11px;text-align:center;margin-top:10px;">AI estimate — treat it as a guide, not a measurement.</div>';
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


/* ═══════════════ PROGRESS ═══════════════
