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
/* scans made today, against a daily allowance (the server keeps the real count) */
function scanUsedToday(){ const q=HF.data.scanQuota||{}; return q.day===iso(0)?(q.today||0):0; }
function scanBump(today){
  HF.data.scanQuota={month:thisMonth(), used:scanUsed()+1, day:iso(0),
    today:(typeof today==='number')?today:scanUsedToday()+1};
  HF.save();
}

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
const EAT_SEGS=[['today','Today'],['plan','Plan'],['log','Log'],['journal','Journal'],['learn','Learn']];
function setEatSeg(s){ eatSeg=s; renderEat(); $('screen').scrollTop=0; }

function egrad(c1,c2,ac){
  return 'radial-gradient(circle at 80% 10%,'+hexA(ac,.35)+',transparent 58%),linear-gradient(158deg,'+c1+','+c2+' 82%)';
}
function ecta(o){
  return '<div class="ecta" onclick="'+o.go+'" style="background:'+egrad(o.c1,o.c2,o.ac)+';">'+
    '<div class="ic">'+glyph(o.ic)+'</div><div class="t">'+o.t+'</div><div class="s">'+o.s+'</div>'+
    '<div class="go">'+o.btn+'</div>'+(o.note?'<div class="lock">'+o.note+'</div>':'')+'</div>';
}

/* The date small, the title large — the Home header's shape. */
function eatHead(){
  const d=new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'}).toUpperCase();
  return '<div class="hsum"><div class="hsum-l"><div class="k">'+d+'</div><div class="t">Eat</div></div></div>';
}
function renderEat(){
  const n=HF.data.nutrition||{};
  if(!n.cal){ $('eat-segs').innerHTML=''; renderEatSetup(); return; }
  $('eat-segs').innerHTML=eatHead()+'<div class="obseg eseg">'+EAT_SEGS.map(s=>
    '<button class="'+(eatSeg===s[0]?'on':'')+'" onclick="setEatSeg(\''+s[0]+'\')">'+s[1]+'</button>').join('')+'</div>';
  if(eatSeg==='plan') return eatPlan();
  if(eatSeg==='log')  return eatLog();
  if(eatSeg==='journal') return eatJournal();
  if(eatSeg==='learn') return eatLearn();
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
    /* Drawn from twelve o'clock as a path, rather than a circle rotated
       -90°: the app flattens every CSS transform (.app *{transform:none}). */
    (pct>0?'<path d="M'+size/2+' '+(size/2-r)+' a'+r+' '+r+' 0 1 1 0 '+(2*r)+' a'+r+' '+r+' 0 1 1 0 '+(-2*r)+'" class="nring-v" '+
      'stroke-dasharray="'+c.toFixed(1)+'" stroke-dashoffset="'+off.toFixed(1)+'"/>':'')+
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

  /* One card (16 Oct): the calorie ring with what is left in the middle, and
     the three macros as bars beside it; then Exercise and the meal balance
     (named so since 16 Oct: "Day Score" sat beside the HITFAT Score and read as a second score). */
  const over=t.kcal>budget;
  const bar=(l,v,tg,c)=>{ const p=Math.min(100,Math.round(v/(tg||1)*100));
    return '<div class="emb"><div class="emb-h"><span>'+l+'</span><b>'+v+'<i> / '+(tg||0)+' g</i></b></div><div class="emb-t"><i style="width:'+p+'%;background:'+c+'"></i></div></div>'; };
  let h='<div class="ehero">'+
      '<div class="ehero-top">'+nRing(pct,(over?'+':'')+(over?t.kcal-budget:left).toLocaleString(),over?'kcal over':'kcal left',132)+
      '<div class="ehero-m">'+bar('Protein',t.p,n.pt,'#E30613')+bar('Carbs',t.c,n.ct,'#FFC20E')+bar('Fat',t.f,n.ft,'#A1A1AA')+'</div></div>'+
      '<div class="ehero-f"><span>'+t.kcal.toLocaleString()+' eaten · '+budget.toLocaleString()+' target</span><span class="nstat2 '+st.c+'"><i></i>'+st.t+'</span></div>'+
    '</div>'+
    '<div class="etiles">'+
      '<div class="etile" onclick="openBurn()"><span class="ic" style="--c:#E30613">'+glyph('flame')+'</span><div><b>+'+burned.toLocaleString()+'<i> kcal</i></b><span>'+(burnFor().length?'Exercise · '+burnFor().length+' logged':'Exercise · tap to log')+'</span></div></div>'+
      '<div class="etile"><span class="ic" style="--c:#C9962E">'+glyph('target')+'</span><div><b>'+(logged?score:'—')+'</b><span>Meal balance</span></div></div>'+
    '</div>';

  /* drinks (20 Oct 2026): teh tarik, kopi, Milo… to water, and their sugar to food */
  if(typeof drRowHTML==='function') h+=drRowHTML();

  // meals: one grouped list, the slot to fill next marked, + to add
  h+=fsec('Meals', 'Tap a meal to log into it.');
  h+='<div class="nlist">'+SLOTS.map(s=>{
      const items=bySlot[s.k]||[], kc=items.reduce((a,m)=>a+(m.kcal||0),0);
      const aim=Math.round(n.cal*SLOT_SHARE[s.k]/10)*10;
      const sub= items.length ? kc.toLocaleString()+' kcal · '+hesc(items.map(m=>m.bm||m.name).join(', '))
                              : 'Aim for about '+aim.toLocaleString()+' kcal';
      return nRow(s.e, s.n, sub, '<span class="nadd" aria-label="Add">+</span>', "openManualAt('"+s.k+"')");
    }).join('')+'</div>';

  // tools, as colour tiles (the Library's look)
  /* (17 Oct) the tools as posters, like Train after FIIT: Scan a Meal wide
     (the plate cut out on HITFAT red, the scans left, a camera button), then
     Meal Plan and Log Exercise two to a row */
  h+=fsec('Tools','Log faster, plan ahead.');
  if(typeof hpoTile==='function'){
    const sa=typeof scanAccess==='function'?scanAccess():null;
    h+=hpoTile({cls:'hpo-w hpo-tool',t:'Scan a Meal',kick:'AI · reads the plate',lv:canScan()?(sa&&sa.label?sa.label:'Snap, check, log'):'Get more scans',
      pal:'red',img:'/img/p/scanmeal.jpg',pic:'scanmeal',pos:'78% 50%',go:'openScan()',btn:{ic:'photo',go:'openScan()',label:'Scan a meal'}});
    h+='<div class="hpo-grid etools2">'+
      hpoTile({t:'Meal Plan',kick:contentOpen()?'Malaysian menus':'With HITFAT+',lv:'1–14 days · 51 menus',cls:'hpo-sq hpo-br hpo-mp',pal:'gold',img:'/img/p/mealplan.jpg',pic:'mealplan',pos:'130% 125%',go:"setEatSeg('plan')"})+
      hpoTile({t:'Log Exercise',kick:'Earn calories back',lv:'Steps, runs, classes',pal:'charcoal',img:'/img/p/br-quick.jpg',pic:'br-quick',pos:'88% 30%',go:'openBurn()'})+
      '</div>';
  }

  h+='<button class="authalt" onclick="HF.data.nutrition={};HF.save();renderEat()">Change my daily target</button>';
  $('eat-body').innerHTML=h;
}
/* ── JOURNAL ──
   After Everfit's nutrition dashboard: the week as a macros report, then
   every meal of the last two weeks as a card with its photo. */
const MEAL_PH='hf_meal_ph_', MEAL_PH_KEEP=150;
function mealPhotoKey(id){ return MEAL_PH+(HF.userId||'me')+'_'+id; }
function mealPhoto(m){
  if(m && m.img) return m.img;
  if(!m || !m.id) return '';
  try{ return localStorage.getItem(mealPhotoKey(m.id))||''; }catch(e){ return ''; }
}
function saveMealPhoto(id,dataUrl){
  try{
    const img=new Image();
    img.onload=()=>{
      const S=160, s=Math.max(S/img.width,S/img.height), cv=document.createElement('canvas');
      cv.width=S; cv.height=S;
      cv.getContext('2d').drawImage(img,(S-img.width*s)/2,(S-img.height*s)/2,img.width*s,img.height*s);
      try{
        localStorage.setItem(mealPhotoKey(id),cv.toDataURL('image/jpeg',0.7));
        /* the newest MEAL_PH_KEEP stay; older thumbnails make room */
        const ik=MEAL_PH+'idx_'+(HF.userId||'me'); let idx=[];
        try{ idx=JSON.parse(localStorage.getItem(ik)||'[]'); }catch(e){}
        idx.push(id);
        while(idx.length>MEAL_PH_KEEP){ const old=idx.shift(); try{ localStorage.removeItem(mealPhotoKey(old)); }catch(e){} }
        localStorage.setItem(ik,JSON.stringify(idx));
      }catch(e){}
      cv.width=1; cv.height=1;
    };
    img.src=dataUrl;
  }catch(e){}
}
function isoBack(n){ return iso(-n); }
function journalDayName(d){
  if(d===iso(0)) return 'Today';
  if(d===iso(-1)) return 'Yesterday';
  return new Date(d+'T00:00:00').toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'short'});
}
function weekReport(){
  const n=HF.data.nutrition||{}, days=[];
  for(let i=6;i>=0;i--){ const d=iso(-i), t=mealTotals(d); days.push({d, t, logged:mealsFor(d).length>0}); }
  const logged=days.filter(x=>x.logged);
  const avg=k=>logged.length?Math.round(logged.reduce((s,x)=>s+x.t[k],0)/logged.length):0;
  const onTarget=logged.filter(x=>n.cal && x.t.kcal>=n.cal*0.85 && x.t.kcal<=n.cal*1.1).length;
  return {days, logged:logged.length, avgKcal:avg('kcal'), avgP:avg('p'), onTarget, target:n.cal||0};
}
/* stacked bars: calories from protein, carbs and fat, a day each, against the target */
function macroChart(r){
  const W=320, H=170, padL=6, padB=22, top=14, bw=26;
  const max=Math.max(r.target*1.2, ...r.days.map(x=>x.t.p*4+x.t.c*4+x.t.f*9), 1);
  const y=v=>top+(H-padB-top)*(1-v/max);
  const step=(W-padL*2)/7;
  let s='<svg class="mchart" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Calories by macro, last 7 days">';
  if(r.target){ const ty=y(r.target);
    s+='<line x1="0" x2="'+W+'" y1="'+ty+'" y2="'+ty+'" class="mc-goal"/><text x="'+(W-2)+'" y="'+(ty-4)+'" text-anchor="end" class="mc-gl">'+r.target.toLocaleString()+'</text>'; }
  r.days.forEach((x,i)=>{
    const cx=padL+step*i+step/2, segs=[['p',x.t.p*4],['c',x.t.c*4],['f',x.t.f*9]];
    let base=H-padB;
    segs.forEach(sg=>{ if(sg[1]<=0) return; const h=(H-padB-top)*sg[1]/max;
      s+='<rect x="'+(cx-bw/2)+'" y="'+(base-h)+'" width="'+bw+'" height="'+Math.max(1,h)+'" rx="3" class="mc-'+sg[0]+'"/>'; base-=h; });
    if(x.logged) s+='<text x="'+cx+'" y="'+(base-4)+'" text-anchor="middle" class="mc-v">'+x.t.kcal.toLocaleString()+'</text>';
    const dn=new Date(x.d+'T00:00:00').toLocaleDateString('en-GB',{weekday:'short'}).slice(0,1);
    s+='<text x="'+cx+'" y="'+(H-6)+'" text-anchor="middle" class="mc-d'+(x.d===iso(0)?' now':'')+'">'+dn+'</text>';
  });
  return s+'</svg>';
}
/* a meal as a compact row inside its day's card: the photo (or the meal's
   icon), the name, when, the macros in one grey line, the kcal on the right */
function journalCard(m,d,i){
  const ph=mealPhoto(m), sl=SLOTS.filter(s=>s.k===(m.slot||'snack'))[0]||SLOTS[3];
  return '<div class="jcard">'+
    (ph?'<div class="jph" style="background-image:url(\''+ph.replace(/'/g,"%27")+'\')"></div>'
       :'<div class="jph none">'+ic(m.src==='barcode'?'qr':sl.e)+'</div>')+
    '<div class="jtx"><div class="jt">'+hesc(m.bm||m.name)+'</div>'+
    '<div class="js">'+sl.n+(m.time?' · '+hesc(m.time):'')+'</div>'+
    '<div class="js jmac">P '+(m.p||0)+'g · C '+(m.c||0)+'g · F '+(m.f||0)+'g</div></div>'+
    '<b class="jk">'+(m.kcal||0).toLocaleString()+'</b>'+
    (d===iso(0)?'<button class="ndel" aria-label="Remove" onclick="delMeal('+i+')">✕</button>':'')+'</div>';
}
/* one line from the week, the thing most worth changing (16 Oct) */
function journalTip(r){
  const n=HF.data.nutrition||{};
  if(r.logged<2) return ['info','Log a few more days','Two or three days of meals and the week starts to tell you something.'];
  if(n.pt && r.avgP<n.pt*0.8) return ['risk','Protein is low','About '+r.avgP+' g a day against '+n.pt+' g. A palm of chicken, fish, eggs or tofu at each meal closes the gap.'];
  if(r.target && r.avgKcal>r.target*1.1) return ['risk','A little over, on average',r.avgKcal.toLocaleString()+' kcal a day against '+r.target.toLocaleString()+'. Half the rice at dinner is an easy start.'];
  if(r.target && r.avgKcal<r.target*0.8) return ['info','Eating quite light',r.avgKcal.toLocaleString()+' kcal a day against '+r.target.toLocaleString()+'. Too little slows you down — make sure every meal is logged, and eat enough.'];
  return ['ok','On track','Calories and protein are where they should be. Keep it going.'];
}
let _jOpen={};
function jToggle(d){ _jOpen[d]=!jIsOpen(d); renderEat(); }
function jIsOpen(d){ return d in _jOpen ? _jOpen[d] : (d===iso(0)||d===iso(-1)); }
function eatJournal(){
  const r=weekReport(), n=HF.data.nutrition||{};
  let h=fsec('Macros Report','Your last 7 days — calories from protein, carbs and fat.');
  const tip=journalTip(r);
  h+='<div class="mrep"><div class="mrep-top">'+
     '<div><b>'+(r.logged?r.avgKcal.toLocaleString():'—')+'</b><span>avg kcal a day</span></div>'+
     '<div><b>'+(r.logged?r.avgP+'<i>'+(n.pt?' / '+n.pt:'')+' g</i>':'—')+'</b><span>avg protein</span></div>'+
     '<div><b>'+r.onTarget+'<i> of '+r.logged+'</i></b><span>days on target</span></div></div>'+
     macroChart(r)+
     '<div class="mrep-key"><span><i class="p"></i>Protein</span><span><i class="c"></i>Carbs</span><span><i class="f"></i>Fat</span><span><i class="g"></i>Target</span></div>'+
     '<div class="jtip '+tip[0]+'"><i></i><div><b>'+tip[1]+'</b><span>'+tip[2]+'</span></div></div></div>';
  h+=fsec('Food Journal','The last two weeks, newest first.');
  let any=false;
  for(let i=0;i<14;i++){
    const d=iso(-i), list=mealsFor(d);
    if(!list.length) continue; any=true;
    const t=mealTotals(d), open=jIsOpen(d);
    let v=['','']; 
    if(d===iso(0)) v=['now','So far'];
    else if(n.cal) v=t.kcal>n.cal*1.1?['over','Over']:t.kcal<n.cal*0.85?['under','Under']:['ok','On target'];
    h+='<div class="nlist jdc'+(open?' open':'')+'"><div class="jdh" onclick="jToggle(\''+d+'\')">'+
       '<div class="jdh-t"><b>'+journalDayName(d)+'</b><span>'+list.length+(list.length>1?' meals':' meal')+' · '+t.kcal.toLocaleString()+' kcal</span></div>'+
       (v[1]?'<span class="jv '+v[0]+'"><i></i>'+v[1]+'</span>':'')+'<span class="jchev">›</span></div>'+
       (open?list.map((m,j)=>({m,j})).reverse().map(x=>journalCard(x.m,d,x.j)).join(''):'')+'</div>';
  }
  if(!any) h+='<div class="nempty">'+ic('food')+'<div class="nempty-t">Your journal starts with your first meal</div>'+
    '<div class="nempty-s">Scan a plate, a barcode or a label, or add a meal by hand.</div>'+
    '<button class="bigbtn" onclick="openScan()">Scan a Meal</button></div>';
  $('eat-body').innerHTML=h;
}
function eatTile(t,sub,g,icon,go){
  return '<div class="ftile fcat etile" onclick="'+go+'" style="background:'+g+'">'+
    '<div class="t">'+t+'</div><div class="es">'+sub+'</div><div class="ic">'+glyph(icon)+'</div></div>';
}
function dayName(){ return new Date().toLocaleDateString('en-MY',{weekday:'long', day:'numeric', month:'long'}); }

/* ── PLAN ── */
function eatPlan(){
  const mpl=(HF.data.mealPlans||[]), n=HF.data.nutrition||{};
  let h='';
  h+=fsec('Made For You','A full Malaysian menu, worked out for you.');
  /* the studio food shot on the right, the words on the left (16 Oct) */
  h+='<div class="fmade fmp emade2"><div class="fm-ph" style="background-image:url(\'/img/p/mealplan.jpg\')"></div>'+
     '<span class="fp-tag">MALAYSIAN MENUS</span>'+
     '<div class="t">Build Your Meal Plan</div>'+
     '<div class="s">Five questions, then your meals, worked out.</div>'+
     '<div class="emp-chips"><span>1–14 days</span><span>51 menus</span><span>Hand portions</span></div>'+
     '<button class="fglass emp-go" onclick="openMealPlan()">'+glyph('calendar')+(contentOpen()?'Build My Plan':'Unlock with HITFAT+')+'</button>'+
     '<div class="emp-src">MDG 2020 · CPG MOH 2023</div></div>';

  if(mpl.length){
    h+=fsec('Your Plans','Saved — reopens identical every time.');
    h+='<div class="nlist">'+mpl.map((p,i)=>nRow('clipboard',
        p.days+(p.days===1?' day · ':' days · ')+p.cal.toLocaleString()+' kcal',
        ({loss:'Lose weight',gain:'Gain weight',maintain:'Maintain'}[p.meta.goal]||p.meta.goal)+' · '+
        ({'3x':'Three meals','333':'Quarter-quarter-half','6x':'Six small meals','if':'Fasting 16:8'}[p.meta.struct]||p.meta.struct),
        '<button class="ndel" aria-label="Delete plan" onclick="event.stopPropagation();mpDelete('+i+')">✕</button><span class="chev">›</span>',
        'mpLoad('+i+')')).join('')+'</div>';
  }

  h+=fsec('How It Works','');
  h+='<div class="nlist">'+[
      ['Your profile','Weight, height, age and activity — filled in from your calorie target.'],
      ['Safe calories','Never below 1,500 kcal for men or 1,200 for women; the deficit is capped at 750 a day.'],
      ['Malaysian menus','51 menus, with portions in fists and palms rather than grams.'],
      ['Three options per meal','Swap when an ingredient is missing — the calories stay in range.']
    ].map((x,i)=>'<div class="nli nstep"><span class="nnum">'+(i+1)+'</span>'+
      '<div class="nli-b"><div class="nli-t">'+x[0]+'</div><div class="nli-s">'+x[1]+'</div></div></div>').join('')+'</div>';

  if(!contentOpen()) h+='<div class="nlist" style="margin-top:14px;">'+nRow('spark','HITFAT+ membership',
     'Meal plans, AI scan and every program — from RM'+Math.round(SUB_PLANS[0].price/12)+' a month','<span class="chev">›</span>','openPaywall()')+'</div>';
  if(n.cal) h+='<div class="nfoot">Your current target is '+n.cal.toLocaleString()+' kcal. The plan recalculates from whatever you enter in the wizard.</div>';
  $('eat-body').innerHTML=h;
}

/* ── LOG ── */
function eatLog(){
  const list=mealsFor(), favs=(HF.data.favs||[]).slice(0,10), n=HF.data.nutrition||{}, sa=scanAccess();
  let h='';
  /* Add Food: the scan is the hero (a studio plate, as Plan's card), barcode
     and by-hand as two small tiles, the way Today lays out its extras (16 Oct) */
  h+=fsec('Add Food','Snap the plate — or type it in.');
  h+='<div class="fmade fmp elscan" onclick="openScan()"><div class="fm-ph" style="background-image:url(\'/img/p/scanmeal.jpg\')"></div>'+
     '<span class="fp-tag">AI SCAN</span>'+
     '<div class="t">Snap Your Plate</div>'+
     '<div class="s">AI reads the food and the portions.</div>'+
     '<div class="emp-chips"><span>'+hesc(sa.label)+'</span></div>'+
     '<button class="fglass els-go" onclick="event.stopPropagation();openScan()">'+glyph('photo')+'Scan a Meal</button></div>';
  h+='<div class="etiles eladd">'+
     '<div class="etile" onclick="openScan(\'barcode\')"><span class="ic" style="--c:#2F6FB3">'+glyph('qr')+'</span><div><b>Barcode</b><span>Packaged food</span></div></div>'+
     '<div class="etile" onclick="openManual()"><span class="ic" style="--c:#8E8E93">'+glyph('pencil')+'</span><div><b>By Hand</b><span>Type it in</span></div></div>'+
     '</div>';

  if(favs.length){
    h+=fsec('Your Usuals','One tap — no scan spent.');
    h+='<div class="hscroll nfavs">'+favs.map((f,i)=>
      '<button class="nfav" onclick="logFav('+i+')"><span class="nfav-t">'+hesc(f.name)+'</span>'+
      '<span class="nfav-k">'+f.kcal+' kcal · P '+(f.p||0)+'g</span><span class="nadd">+</span></button>').join('')+'</div>';
  }

  /* Today's Log: the day against the target, then every meal as its own card
     with a + to add to it — an empty meal still shows, so the next step is
     one tap. The delete keeps the meal's index in the day (delMeal). */
  const tot=mealTotals().kcal;
  h+=fsec("Today's Log", list.length ? list.length+(list.length>1?' meals':' meal')+' · '+tot.toLocaleString()+' kcal' : '');
  if(n.cal){
    const left=n.cal-tot, pct=Math.min(100,Math.round(tot/n.cal*100));
    h+='<div class="elsum"><div class="elsum-h"><b>'+tot.toLocaleString()+'</b><span> / '+n.cal.toLocaleString()+' kcal</span>'+
       '<em class="'+(left<0?'over':'')+'">'+(left<0?(-left).toLocaleString()+' over':left.toLocaleString()+' left')+'</em></div>'+
       '<div class="emb-t"><i style="width:'+pct+'%;background:'+(left<0?'#8A0A10':'#E30613')+'"></i></div></div>';
  }
  if(!list.length) h+='<div class="elnone">Nothing logged yet today — tap + on a meal, or scan a plate.</div>';
  SLOTS.forEach(s=>{
    const rows=list.map((m,i)=>({m,i})).filter(x=>(x.m.slot||'snack')===s.k);
    const kc=rows.reduce((a,x)=>a+(x.m.kcal||0),0);
    const aim=n.cal?Math.round(n.cal*SLOT_SHARE[s.k]/10)*10:0;
    const sub=rows.length?'<b>'+kc.toLocaleString()+' kcal</b>'+(aim?' · aim '+aim.toLocaleString():'')
                         :(aim?'Aim for about '+aim.toLocaleString()+' kcal':'Nothing yet');
    h+='<div class="nlist elslot">'+
       nRow(s.e,'<span>'+s.n+'</span>',sub,'<span class="nadd" aria-label="Add to '+s.n+'">+</span>',"openManualAt('"+s.k+"')")+
       rows.map(x=>'<div class="nli elit"><div class="nli-b"><div class="nli-t">'+hesc(x.m.bm||x.m.name)+'</div>'+
          '<div class="nli-s">'+(x.m.time?x.m.time+' · ':'')+'P '+x.m.p+'g · C '+x.m.c+'g · F '+x.m.f+'g</div></div>'+
          '<span class="nval">'+x.m.kcal+'</span>'+
          '<button class="ndel" aria-label="Remove" onclick="event.stopPropagation();delMeal('+x.i+')">✕</button></div>').join('')+
       '</div>';
  });
  $('eat-body').innerHTML=h;
}
function logFav(i){
  const f=(HF.data.favs||[])[i]; if(!f) return;
  const b=typeof mrBefore==='function'?mrBefore():0;
  const m={name:f.name,bm:f.bm||f.name,kcal:f.kcal,p:f.p||0,c:f.c||0,f:f.f||0,slot:slotNow()};
  m.id=logMeal(m); renderEat();
  if(typeof mrOpen==='function') mrOpen(m,b); else toast('Logged '+f.name);
}

let _eg='male', _egoal='lose';
/* The target, set the way Build Your Plan asks: a large title, the three
   numbers as one grouped list with their units, sex as a segmented
   control, the goal as tiles, one pill to save. */
const EAT_GOALS=[['lose','Lose Fat','A steady deficit','flame'],['maintain','Maintain','Hold where you are','scale'],
                 ['muscle','Build Muscle','A small surplus','workout'],['bulk','Bulk','More, to grow','trophy']];
function renderEatSetup(){
  const fld=(id,label,unit,mode)=>'<label class="esf"><span>'+label+'</span>'+
    '<input class="inp" id="'+id+'" type="number" inputmode="'+mode+'" placeholder="0">'+
    '<em>'+unit+'</em></label>';
  $('eat-body').innerHTML=eatHead()+
    '<div class="esetk">First, your target</div>'+
    '<div class="esett">Set Your Daily Calories</div>'+
    '<div class="esets">Weight, height, age and goal — that is all it takes. Everything else on this tab builds itself from it.</div>'+
    '<div class="obq">About You</div>'+
    '<div class="esfields">'+fld('e-w','Weight','kg','decimal')+fld('e-h','Height','cm','decimal')+fld('e-a','Age','years','numeric')+'</div>'+
    '<div class="obq">Sex</div>'+
    '<div class="obseg"><button id="e-m" onclick="_eg=\'male\';renderPick()">Male</button>'+
    '<button id="e-f" onclick="_eg=\'female\';renderPick()">Female</button></div>'+
    '<div class="obq">Your Goal</div>'+
    '<div class="obgrid">'+EAT_GOALS.map(g=>'<button class="obtile" id="e-g-'+g[0]+'" onclick="_egoal=\''+g[0]+'\';renderPick()">'+
      '<span class="obtile-ic">'+glyph(g[3])+'</span><span class="obtile-t">'+g[1]+'</span><span class="obtile-s">'+g[2]+'</span></button>').join('')+'</div>'+
    '<button class="bigbtn esave" onclick="saveNutrition()">Save Target</button>';
  renderPick();
}
function renderPick(){
  const m=$('e-m'), f=$('e-f');
  if(m) m.className=_eg==='male'?'on':''; if(f) f.className=_eg==='female'?'on':'';
  EAT_GOALS.forEach(g=>{ const b=$('e-g-'+g[0]); if(b) b.className='obtile'+(_egoal===g[0]?' on':''); });
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
  const id=m.id||(Date.now().toString(36)+Math.random().toString(36).slice(2,6));
  HF.data.meals[d]=(HF.data.meals[d]||[]).concat([Object.assign({
    time:new Date().toLocaleTimeString('en-MY',{hour:'2-digit',minute:'2-digit',hour12:true}),
    slot:slotNow(), p:0,c:0,f:0, comps:[]
  },m,{id})]);
  HF.save();
  if(typeof scMealLogged==='function') scMealLogged(m);
  return id;
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
function openManual(){ _slot=slotNow(); _typed=null; _mText=''; $('mansheet').classList.add('on'); $('sheetbg').classList.add('on'); renderManual(); }
function closeManual(){ $('mansheet').classList.remove('on'); $('sheetbg').classList.remove('on'); renderEat(); }
function setSlot(s){ const keep={n:($('m-name')||{}).value,k:($('m-kcal')||{}).value,p:($('m-p')||{}).value,c:($('m-c')||{}).value,f:($('m-f')||{}).value};
  _slot=s; renderManual();
  [['m-name',keep.n],['m-kcal',keep.k],['m-p',keep.p],['m-c',keep.c],['m-f',keep.f]].forEach(x=>{ const e=$(x[0]); if(e&&x[1]) e.value=x[1]; }); }
function renderManual(){
  const favs=(HF.data.favs||[]).slice(0,8);
  $('man-body').innerHTML=
    '<div style="font-size:17px;font-weight:800;margin-bottom:3px;">Add a meal</div>'+
    '<div class="sub" style="margin-bottom:14px;">Type it and let AI work it out, or fill it in yourself. A drink? <button class="m-drink" onclick="closeManual();drOpen()">Log a drink</button></div>'+
    /* type it, and AI works it out (20 Oct 2026, after Simple's "type what you ate") */
    '<div class="qh">Type what you ate</div>'+
    '<div class="m-type"><textarea class="inp" id="m-text" rows="2" maxlength="300" placeholder="e.g. nasi lemak telur + teh tarik kurang manis" oninput="_mText=this.value">'+hesc(_mText)+'</textarea>'+
    '<button class="m-ai" id="m-ai" onclick="typeMeal()">'+glyph('spark')+'Work it out</button></div>'+
    '<div id="m-typed">'+typedHTML()+'</div>'+

    (favs.length?'<div class="qh">Quick pick</div><div class="filters">'+favs.map((f,i)=>
      '<button class="chip" onclick="fillFav('+i+')">'+f.name+' · '+f.kcal+'</button>').join('')+'</div>':'')+
    '<div class="qh">Meal</div><div class="filters">'+SLOTS.map(s=>
      '<button class="chip'+(_slot===s.k?' y':'')+'" onclick="setSlot(\''+s.k+'\')">'+glyph(s.e)+' '+s.n+'</button>').join('')+'</div>'+
    '<div class="qh">Or fill it in</div>'+
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
/* ── a typed meal: the words go to scan-food (mode 'text', its own daily
   allowance, never a photo scan), the estimate fills the form, the member
   checks it, then logs as usual ── */
let _typed=null, _mText='';
function typedHTML(){
  const d=_typed; if(!d) return '';
  const items=(d.breakdown||[]).map(x=>'<span class="m-it">'+hesc(x.ingredient||x.name||'')+'<b>'+Math.round(x.calories||0)+'</b></span>').join('');
  return '<div class="m-res"><div class="m-res-h"><b>'+hesc(d.food_name_bm||d.food_name||'')+'</b><span>≈ '+(d.estimated_calories||0).toLocaleString('en-MY')+' kcal</span></div>'+
    (items?'<div class="m-its">'+items+'</div>':'')+
    '<div class="m-res-f">'+(d.portion_size?hesc(d.portion_size)+' · ':'')+'An estimate. Change any number below before you log.</div></div>';
}
function typedFill(){
  const d=_typed; if(!d) return;
  const set=(id,v)=>{ const e=$(id); if(e) e.value=v; };
  set('m-name', (d.food_name_bm||d.food_name||'').slice(0,80));
  set('m-kcal', Math.round(d.estimated_calories||0)||'');
  set('m-p', Math.round(d.protein_g||0)||''); set('m-c', Math.round(d.carbs_g||0)||''); set('m-f', Math.round(d.fat_g||0)||'');
}
async function typeMeal(){
  const t=String((($('m-text')||{}).value)||'').trim(); _mText=t;
  if(t.length<2){ toast('Type what you ate first'); return; }
  const b=$('m-ai'); if(b){ b.disabled=true; b.innerHTML=glyph('spark')+'Working it out…'; }
  try{
    const tk=await scanToken(); if(!tk) throw new Error('Sign in to use this.');
    const r=await fetch(SCAN_FN,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+tk,'apikey':SUPA_KEY},
      body:JSON.stringify({mode:'text', text:t})});
    const j=await r.json().catch(()=>({}));
    if(!r.ok) throw new Error(j.error||'Could not work it out. Log it by hand.');
    if(!(j.estimated_calories>0) || !String(j.food_name||'').trim()) throw new Error('That does not look like food. Try again, or fill it in.');
    _typed=j; renderManual(); typedFill();
  }catch(e){ toast((e&&e.message)||'Could not work it out'); }
  finally{ const b2=$('m-ai'); if(b2){ b2.disabled=false; b2.innerHTML=glyph('spark')+'Work it out'; } }
}
function fillFav(i){
  const f=(HF.data.favs||[])[i]; if(!f) return;
  ['m-name','m-kcal','m-p','m-c','m-f'].forEach((id,k)=>{ const e=$(id); if(e) e.value=[f.name,f.kcal,f.p,f.c,f.f][k]||''; });
}
function saveManual(){
  const name=(($('m-name')||{}).value||'').trim(), kcal=parseInt(($('m-kcal')||{}).value,10);
  if(!name){ toast('Enter the food name'); return; }
  if(!kcal||kcal<=0){ toast('Enter the calories'); return; }
  const b=typeof mrBefore==='function'?mrBefore():0;
  const m={name, bm:name, kcal, slot:_slot,
    p:parseInt(($('m-p')||{}).value,10)||0, c:parseInt(($('m-c')||{}).value,10)||0, f:parseInt(($('m-f')||{}).value,10)||0};
  if(_typed){ m.src='text'; m.comps=(_typed.breakdown||[]).map(x=>({name:x.ingredient||x.name||'',kcal:Math.round(x.calories||0)})); }
  _typed=null; _mText='';
  m.id=logMeal(m); closeManual();
  if(typeof mrOpen==='function') mrOpen(m,b); else toast('Meal logged');
}

/* ── SCAN ──
   One scanner, three ways in, after Everfit's MacroSnap: a meal (the AI
   reads the plate), a barcode (the product's own label, from Open Food
   Facts: free, no AI, no scan used) and a nutrition label (the AI reads the
   printed panel). A live camera when the phone gives one; the phone's own
   camera and the gallery when it does not. */
let _scanData=null, _scanTok=0, _pctTimer=null;
/* A photo cannot weigh food: the person sets how many portions they ate
   and can rename a dish the AI got wrong. */
let _scanPortion=1, _scanName='', _scanEditing=false, _scanImg='';
let _scanMode='meal', _scanStream=null, _scanTorchOn=false, _bcReader=null, _bcTimer=null, _bcDone=false;
const SCAN_MODES=[['meal','Scan meal','photo'],['barcode','Barcode','qr'],['label','Food label','doc']];
const SCAN_HINT={meal:'Point at your plate, from above', barcode:'Line the barcode up inside the frame', label:'Fill the frame with the nutrition panel'};
const ZXING_URL='https://cdn.jsdelivr.net/npm/@zxing/library@0.21.3/umd/index.min.js';
const OFF_URL='https://world.openfoodfacts.org/api/v2/product/';
function setScanPortion(f){ _scanPortion=f; renderScanResult(_scanData); }
function scanQty(dir){ _scanPortion=Math.min(10,Math.max(0.5,Math.round(((_scanPortion||1)+dir*0.5)*2)/2)); renderScanResult(_scanData); }
function fmtQty(q){ return String(Math.round(q*100)/100); }
function editScanName(){ _scanEditing=true; renderScanResult(_scanData); setTimeout(()=>{ const i=$('scan-name-in'); if(i){ i.focus(); i.select(); } },50); }
function saveScanName(){ const i=$('scan-name-in'); const v=i?String(i.value||'').trim().slice(0,80):''; if(v) _scanName=v; _scanEditing=false; renderScanResult(_scanData); }

function openScan(mode){
  _scanData=null; _scanPortion=1; _scanName=''; _scanEditing=false; _scanImg='';
  $('scan').classList.add('on');
  $('scan-sheet').classList.remove('on');
  setScanMode(mode||_scanMode||'meal', true);
  startScanCam();
}
function closeScan(){
  stopScanCam(); stopScanAnim();
  $('scan').classList.remove('on','frozen');
  $('scan-sheet').classList.remove('on');
  renderEat();
}
function setScanMode(m, quiet){
  _scanMode=m; _bcDone=false;
  const s=$('scan'); if(s){ s.classList.remove('frozen'); if(s.setAttribute) s.setAttribute('data-mode',m); }
  $('scan-modes').innerHTML=SCAN_MODES.map(x=>
    '<button class="'+(x[0]===m?'on':'')+'" onclick="setScanMode(\''+x[0]+'\')">'+glyph(x[2])+'<span>'+x[1]+'</span></button>').join('');
  $('scan-hint').textContent=SCAN_HINT[m];
  $('scan-err').style.display='none';
  $('scan-code').hidden=true;
  /* a barcode is looked up, not read by the AI, so it costs no scan */
  $('scan-left').textContent = m==='barcode' ? 'Barcodes are free and unlimited' : scanAccess().label;
  if(!quiet){ $('scan-sheet').classList.remove('on'); _scanImg=''; const p=$('scan-prev'); if(p){ p.src=''; p.style.display='none'; } }
  if(m==='barcode') startBarcode(); else stopBarcode();
}
function scanAgain(){ $('scan-sheet').classList.remove('on'); setScanMode(_scanMode); if(!_scanStream) startScanCam(); }

/* ── the live camera ── */
async function startScanCam(){
  stopScanCam();
  const v=$('scan-video');
  if(!v || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return scanNoCam();
  try{
    const s=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:1280},height:{ideal:960}},audio:false});
    if(!$('scan').classList.contains('on')){ s.getTracks().forEach(t=>t.stop()); return; }
    _scanStream=s; v.srcObject=s; v.muted=true;
    try{ if(v.setAttribute) v.setAttribute('playsinline',''); if(v.play) await v.play(); }catch(e){}
    $('scan').classList.add('live');
    let caps={}; try{ const tr=s.getVideoTracks()[0]; caps=(tr&&tr.getCapabilities)?tr.getCapabilities():{}; }catch(e){}
    $('scan-torch').hidden=!caps.torch;
    if(_scanMode==='barcode') startBarcode();
  }catch(e){ scanNoCam(); }
}
function stopScanCam(){
  stopBarcode();
  if(_scanStream){ try{ _scanStream.getTracks().forEach(t=>t.stop()); }catch(e){} _scanStream=null; }
  const v=$('scan-video'); if(v){ try{ v.srcObject=null; }catch(e){} }
  const s=$('scan'); if(s) s.classList.remove('live');
  _scanTorchOn=false;
}
/* no camera in the page: the shutter opens the phone's own camera instead */
function scanNoCam(){ const s=$('scan'); if(s) s.classList.remove('live'); }
async function scanTorch(){
  try{ const tr=_scanStream&&_scanStream.getVideoTracks()[0]; if(!tr) return;
    _scanTorchOn=!_scanTorchOn; await tr.applyConstraints({advanced:[{torch:_scanTorchOn}]});
    $('scan-torch').classList.toggle('on',_scanTorchOn); }catch(e){}
}
/* the frame on screen, as a small JPEG: 600px is plenty for the AI */
function scanFrameJPEG(src,w,h){
  const M=600; let W=w,H=h;
  if(W>M){ H=Math.round(H*M/W); W=M; } if(H>M){ W=Math.round(W*M/H); H=M; }
  const cv=document.createElement('canvas'); cv.width=W; cv.height=H;
  cv.getContext('2d').drawImage(src,0,0,W,H);
  const url=cv.toDataURL('image/jpeg',0.72); cv.width=1; cv.height=1;
  return url;
}
function scanShoot(){
  if(_scanMode==='barcode'){ scanTypeCode(); return; }
  if(!canScan()){ openScanPlans('You have used your scans.'); return; }
  const v=$('scan-video');
  if(_scanStream && v && v.videoWidth){
    const url=scanFrameJPEG(v,v.videoWidth,v.videoHeight);
    try{ navigator.vibrate&&navigator.vibrate(20); }catch(e){}
    stopScanCam();
    sendScan(url);
  } else pickPhoto(true);
}
function pickPhoto(useCamera){
  const inp=document.createElement('input');
  inp.type='file'; inp.accept='image/*';
  if(useCamera) inp.capture='environment';
  inp.style.display='none';
  inp.onchange=()=>onScanFile(inp);
  document.body.appendChild(inp); inp.click();
  setTimeout(()=>{ try{ document.body.removeChild(inp); }catch(e){} },30000);
}
function onScanFile(input){
  const file=input.files&&input.files[0]; if(!file) return;
  const reader=new FileReader();
  reader.onload=e=>{
    const img=new Image();
    img.onload=()=>{
      if(_scanMode==='barcode') return scanBarcodeImage(img);
      if(!canScan()){ openScanPlans('You have used your scans.'); return; }
      stopScanCam();
      sendScan(scanFrameJPEG(img,img.width,img.height));
    };
    img.src=e.target.result;
  };
  reader.readAsDataURL(file);
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

/* ── a meal or a label: the AI reads it ── */
function sendScan(url){
  _scanTok++; const tok=_scanTok, mode=_scanMode;
  _scanImg=url;
  const prev=$('scan-prev'); prev.src=url; prev.style.display='block';
  $('scan').classList.add('frozen');
  $('scan-err').style.display='none';
  $('scan-hint').textContent = mode==='label' ? 'Reading the label…' : 'Reading the plate…';
  startScanAnim();
  const b64=url.split(',')[1];
  scanToken().then(tk=>{
    if(!tk) throw new Error('Sign in to use Meal Scan.');
    return fetch(SCAN_FN,{method:'POST',
      headers:{'Content-Type':'application/json','Authorization':'Bearer '+tk,'apikey':SUPA_KEY},
      body:JSON.stringify({image_base64:b64, mode, context:'Malaysian food', region:'Malaysia'})});
  })
    .then(r=>r.json().then(j=>({ok:r.ok,status:r.status,j})))
    .then(res=>{
      if(tok!==_scanTok) return;
      stopScanAnim();
      if(!res.ok) throw Object.assign(new Error((res.j&&res.j.error)||'Scan failed'),
                                      {status:res.status, code:res.j&&res.j.code});
      /* the server already counted this scan; mirror it so the screen agrees */
      scanBump(res.j && res.j.scans && typeof res.j.scans.today==='number' ? res.j.scans.today : undefined);
      _scanData=Object.assign({kind:mode},res.j);
      renderScanResult(_scanData);
    })
    .catch(err=>{
      if(tok!==_scanTok) return;
      stopScanAnim();
      $('scan').classList.remove('frozen'); prev.style.display='none';
      if(err && (err.code==='quota_exceeded' || err.code==='daily_limit')){
        if(err.code==='daily_limit') scanBump(scanAccess().daily||0);
        closeScan(); openScanPlans(err.message); return; }
      const el=$('scan-err');
      el.textContent=(err&&err.message)||'Scan failed. Try clearer lighting, or log it by hand.';
      el.style.display='block';
      $('scan-hint').textContent=SCAN_HINT[mode];
      startScanCam();
    });
}

/* ── a barcode: read on the phone, looked up in Open Food Facts ── */
function loadZXing(){
  if(window.ZXing) return Promise.resolve(window.ZXing);
  if(window._zxingP) return window._zxingP;
  window._zxingP=new Promise((ok,no)=>{
    const s=document.createElement('script'); s.src=ZXING_URL; s.async=true;
    s.onload=()=>window.ZXing?ok(window.ZXing):no(new Error('no ZXing'));
    s.onerror=()=>{ window._zxingP=null; no(new Error('barcode reader did not load')); };
    document.head.appendChild(s);
  });
  return window._zxingP;
}
async function startBarcode(){
  stopBarcode();
  if(_scanMode!=='barcode' || !_scanStream) return;
  const v=$('scan-video'); _bcDone=false;
  try{
    if('BarcodeDetector' in window){
      const det=new window.BarcodeDetector({formats:['ean_13','ean_8','upc_a','upc_e','code_128']});
      _bcTimer=setInterval(async()=>{
        if(_bcDone || !v.videoWidth) return;
        try{ const r=await det.detect(v); if(r && r[0] && r[0].rawValue) onBarcode(r[0].rawValue); }catch(e){}
      },300);
      return;
    }
    const Z=await loadZXing();
    if(_scanMode!=='barcode' || !_scanStream) return;
    _bcReader=new Z.BrowserMultiFormatReader();
    _bcReader.decodeFromVideoElementContinuously(v,(res)=>{ if(res && !_bcDone) onBarcode(res.getText()); });
  }catch(e){
    $('scan-hint').textContent='Type the number under the barcode instead';
    scanTypeCode();
  }
}
function stopBarcode(){
  if(_bcTimer){ clearInterval(_bcTimer); _bcTimer=null; }
  if(_bcReader){ try{ _bcReader.reset(); }catch(e){} _bcReader=null; }
}
async function scanBarcodeImage(img){
  try{
    if('BarcodeDetector' in window){
      const r=await new window.BarcodeDetector().detect(img);
      if(r && r[0]) return onBarcode(r[0].rawValue);
    } else {
      const Z=await loadZXing(); const res=await new Z.BrowserMultiFormatReader().decodeFromImageElement(img);
      if(res) return onBarcode(res.getText());
    }
  }catch(e){}
  const el=$('scan-err'); el.textContent='No barcode found in that photo. Try again, or type the number.'; el.style.display='block';
}
function scanTypeCode(){ const c=$('scan-code'); c.hidden=false; setTimeout(()=>{ const i=$('scan-code-in'); if(i) i.focus(); },50); }
function scanCodeGo(){ const v=String((($('scan-code-in')||{}).value)||'').replace(/\D/g,''); if(v.length<8){ toast('Type the full number under the barcode'); return; } onBarcode(v); }
function onBarcode(code){
  if(_bcDone) return; _bcDone=true;
  stopBarcode();
  try{ navigator.vibrate&&navigator.vibrate(30); }catch(e){}
  $('scan-hint').textContent='Looking up '+code+'…';
  lookupBarcode(code).then(d=>{
    if(_scanMode!=='barcode') return;
    if(!d){ scanNotFound(code); return; }
    stopScanCam(); $('scan').classList.add('frozen');
    _scanImg=d.image||''; _scanData=d; _scanPortion=1;
    renderScanResult(d);
  }).catch(()=>{ _bcDone=false; const el=$('scan-err'); el.textContent='Could not look that up — check your connection.'; el.style.display='block'; });
}
/* a product's macros, per serving when the label gives one, else per 100 g */
function offToScan(code,p){
  const n=(p&&p.nutriments)||{}, num=x=>{ const v=Number(x); return isFinite(v)?v:null; };
  const per=num(n['energy-kcal_serving'])!==null || num(n.proteins_serving)!==null ? 'serving' : '100g';
  const g=k=>num(n[k+'_'+per]);
  let kcal=num(n['energy-kcal_'+per]);
  if(kcal===null && num(n['energy_'+per])!==null) kcal=num(n['energy_'+per])/4.184;   // kJ on the label
  if(kcal===null && g('proteins')===null) return null;
  const name=[p.brands?String(p.brands).split(',')[0].trim():'', p.product_name||p.generic_name||''].filter(Boolean).join(' ').trim();
  return {kind:'barcode', code, food_name:name||('Product '+code), food_name_bm:'',
    portion_size: per==='serving' ? ('1 serving'+(p.serving_size?' · '+p.serving_size:'')) : '100 g',
    estimated_calories:Math.round(kcal||0), protein_g:Math.round(g('proteins')||0), carbs_g:Math.round(g('carbohydrates')||0), fat_g:Math.round(g('fat')||0),
    sugar_g:g('sugars'), fiber_g:g('fiber'), sodium_mg:g('sodium')!==null?Math.round(g('sodium')*1000):null,
    confidence:'high', breakdown:[], image:p.image_front_small_url||''};
}
async function lookupBarcode(code){
  const r=await fetch(OFF_URL+encodeURIComponent(code)+'.json?fields=product_name,generic_name,brands,nutriments,serving_size,image_front_small_url');
  if(!r.ok) return null;
  const j=await r.json();
  return (j && j.status===1 && j.product) ? offToScan(code,j.product) : null;
}
function scanNotFound(code){
  const h='<div class="sr-grab"></div><div class="sr-nf">'+ic('qr')+'<div class="t">Not in the product list yet</div>'+
    '<div class="s">Barcode '+hesc(code)+'. Photograph its nutrition label and every number logs as printed.</div>'+
    '<button class="bigbtn" onclick="setScanMode(\'label\')">Scan the label instead</button>'+
    '<button class="authalt" onclick="closeScan();openManual()">Type it in</button></div>';
  $('scan-sheet').innerHTML=h; $('scan-sheet').classList.add('on');
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
/* ── the result, after MacroSnap: the photo with what is on it, the
   servings, four macro tiles, the ingredients, one Log button ── */
function renderScanResult(d){
  if(!d) return;
  const k=_scanPortion||1, kind=d.kind||'meal';
  const kcal=Math.round(Number(d.estimated_calories||d.calories||0)*k);
  const p=Math.round(Number(d.protein_g||d.protein||0)*k);
  const c=Math.round(Number(d.carbs_g||d.carbs||0)*k);
  const f=Math.round(Number(d.fat_g||d.fat||0)*k);
  const name=(_scanName||d.food_name||'').trim();
  const unknown=!name||/^(n\/a|unknown)$/i.test(name);
  let h='<div class="sr-grab"></div>';
  if(unknown){
    h+='<div class="sr-nf">'+ic('photo')+'<div class="t">Could not identify the food</div>'+
       '<div class="s">Try a brighter photo from above, or log it by hand.</div>'+
       '<button class="bigbtn" onclick="scanAgain()">Try again</button>'+
       '<button class="authalt" onclick="closeScan();openManual()">Log it by hand</button></div>';
    $('scan-sheet').innerHTML=h; $('scan-sheet').classList.add('on'); return;
  }
  /* the photo, with what the AI found pinned where it found it */
  if(_scanImg){
    const pins=(kind==='meal'?(d.breakdown||[]):[]).filter(it=>isFinite(it.x)&&isFinite(it.y)).slice(0,5);
    h+='<div class="sr-photo'+(kind==='barcode'?' prod':'')+'" style="background-image:url(\''+_scanImg+'\')">'+
      pins.map(it=>'<span class="sr-pin" style="left:'+Math.min(88,Math.max(12,it.x))+'%;top:'+Math.min(88,Math.max(10,it.y))+'%"><i></i>'+hesc(it.ingredient||it.name||'')+'</span>').join('')+'</div>';
  }
  const unit=kind==='meal'?'Portion':'Servings';
  h+='<div class="sr-head"><div class="sr-name">';
  if(_scanEditing)
    h+='<div class="scan-rename"><input id="scan-name-in" value="'+hesc(name)+'" aria-label="Food name" onkeydown="if(event.key===\'Enter\')saveScanName()">'+
       '<button onclick="saveScanName()">Save</button></div>';
  else
    h+='<div class="t">'+hesc(name)+'</div>'+
       '<div class="s">'+[!_scanName&&d.food_name_bm&&d.food_name_bm.trim().toLowerCase()!==name.toLowerCase()?hesc(d.food_name_bm):'', d.portion_size?hesc(d.portion_size):''].filter(Boolean).join(' · ')+'</div>'+
       '<button class="scan-fix" onclick="editScanName()">'+(kind==='meal'?'Wrong food? Rename it':'Rename')+'</button>';
  h+='</div><div class="sr-qty" aria-label="'+unit+'"><button onclick="scanQty(-1)" aria-label="Less">−</button><b>'+fmtQty(k)+'</b><button onclick="scanQty(1)" aria-label="More">+</button></div></div>';
  if(String(d.confidence||'').toLowerCase()==='low')
    h+=nCall('warn','Not sure about this one','Check the name and the portion before you log it. A photo from above, with the whole plate in view, scans better.');
  const n=HF.data.nutrition||{};
  h+='<div class="sr-tiles">'+
     '<div class="sr-tile"><span class="sr-ic k">'+glyph('flame')+'</span><small>Calories</small><b>'+(kind==='meal'?'≈ ':'')+kcal.toLocaleString()+'</b>'+(n.cal?'<em>'+Math.round(kcal/n.cal*100)+'% of your day</em>':'')+'</div>'+
     '<div class="sr-tile"><span class="sr-ic p">P</span><small>Protein</small><b>'+p+' g</b></div>'+
     '<div class="sr-tile"><span class="sr-ic c">C</span><small>Carbs</small><b>'+c+' g</b></div>'+
     '<div class="sr-tile"><span class="sr-ic f">F</span><small>Fat</small><b>'+f+' g</b></div></div>';
  if(kind==='meal' && d.breakdown && d.breakdown.length){
    h+='<div class="nsub"><span>Ingredients</span><span>'+(d.portion_size?hesc(d.portion_size):'1 serving')+'</span></div>'+
       '<div class="nlist">'+d.breakdown.map(it=>{
        const wt=it.weight_g?(Math.round(it.weight_g*k)+' g'):(it.weight_ml?(Math.round(it.weight_ml*k)+' ml'):'');
        return '<div class="nli"><div class="nli-b"><div class="nli-t">'+hesc(it.ingredient||it.name||'')+'</div>'+
          (wt?'<div class="nli-s">'+wt+'</div>':'')+'</div><span class="nval">'+Math.round((it.calories||0)*k)+'</span></div>';
      }).join('')+'</div>';
  }
  if(kind!=='meal'){
    const extra=[['Sugar',d.sugar_g,' g'],['Fibre',d.fiber_g,' g'],['Sodium',d.sodium_mg,' mg']].filter(x=>x[1]!==null&&x[1]!==undefined&&x[1]!=='');
    if(extra.length) h+='<div class="nlist">'+extra.map(x=>'<div class="nli"><div class="nli-b"><div class="nli-t">'+x[0]+'</div></div><span class="nval">'+Math.round(x[1]*k*10)/10+x[2]+'</span></div>').join('')+'</div>';
  }
  h+='<button class="bigbtn sr-log" onclick="logScanned()">Log '+(k===1?'it':fmtQty(k)+' '+(kind==='meal'?'portions':'servings'))+'</button>'+
     '<div class="sr-row"><button class="authalt" onclick="saveFav()">Save as usual</button><button class="authalt" onclick="scanAgain()">Scan another</button></div>';
  /* the coach's read and what it takes to burn it, folded away */
  h+='<details class="sr-more"><summary>Coach tip · how long to burn it</summary>'+
     nCall('info','',coachText(kcal,p,c,f))+
     '<div class="nlist">'+burnOptions(kcal).map(x=>nLiStatic(x[0],x[1],'<span class="nval">'+x[2]+'</span>')).join('')+'</div></details>';
  h+='<div class="nfoot" style="text-align:center;">'+(kind==='meal'
     ? 'An estimate from a photo, usually within 20–30%. Oil and sauce are the hardest to see.'
     : kind==='barcode' ? 'From the product\'s label via Open Food Facts.' : 'Read from the label you photographed.')+'</div>';
  $('scan-sheet').innerHTML=h;
  $('scan-sheet').classList.add('on');
}
function scanToMeal(){
  const d=_scanData; if(!d) return null;
  const k=_scanPortion||1;
  return { name:_scanName||d.food_name||'Food', bm:_scanName?'':(d.food_name_bm||''),
    kcal:Math.round(Number(d.estimated_calories||d.calories||0)*k),
    p:Math.round(Number(d.protein_g||d.protein||0)*k),
    c:Math.round(Number(d.carbs_g||d.carbs||0)*k),
    f:Math.round(Number(d.fat_g||d.fat||0)*k),
    slot:slotNow(), src:d.kind||'meal',
    comps:(d.breakdown||[]).map(x=>({name:x.ingredient||x.name||'',kcal:Math.round((x.calories||0)*k)})) };
}
function logScanned(){
  const m=scanToMeal(); if(!m) return;
  /* a product's picture is a link and travels with the meal; a photo taken
     here stays on this phone, as a small thumbnail */
  if(/^https?:/.test(_scanImg)) m.img=_scanImg;
  const b=typeof mrBefore==='function'?mrBefore():0;
  const id=logMeal(m); m.id=id;
  if(/^data:image/.test(_scanImg)) saveMealPhoto(id,_scanImg);
  _scanData=null; closeScan();
  if(typeof mrOpen==='function') mrOpen(m,b); else toast('Meal logged');
}
function saveFav(){
  const m=scanToMeal(); if(!m) return;
  const favs=(HF.data.favs||[]).filter(x=>x.name!==m.name);
  favs.unshift({name:m.name,bm:m.bm,kcal:m.kcal,p:m.p,c:m.c,f:m.f});
  HF.data.favs=favs.slice(0,30); HF.save();
  toast('Saved to quick pick');
}


