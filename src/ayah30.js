/* ═══════════════ AYAH2FIT 30 ═══════════════
   2 Nov 2026 (Seth: "tukar burn30 kepada ayah2fit"): thirty days at home for
   Malaysian dads, RM39 once, in navy and champagne gold. It takes BURN30's
   place on sale; BURN30 stays for whoever started it (wl30.js).

   Same day (Seth: "semua sama dengan" MAK2FIT): the program works the way
   MAK2FIT 30 does, Plan, Nutrition, Learn, Progress and Start Here, with its
   calorie target, menus, shopping list, meal scan and body check-ins. The
   labels are English and the notes Malay, as MAK2FIT's are.

   Its own: no jumps, 40 on 20 off, a 12-minute version of every day that
   still counts, a Bodyweight / Dumbbell switch, the Ayah Test on days 1, 15
   and 30, and a man's portions: two palms of protein on the plate, a waist
   target under 90 cm (CPG Management of Obesity, KKM), never under 1,500 kcal.

   Phase 2, not here: Geng (six dads ranked by consistency) and prayer times.
   Borrowed at run time from MAK2FIT and BURN30: LB30_MENU and its photos, the
   meals a day, the shopping groups, the missions, the walking ramp, lbRing,
   lbFact, lbScanHero, WL30_Q's answers, and the .lbx / .lbq styles (dressed by
   .ay in design.css).                                                     */

const AY30_ID='ay30', AY30_PRICE=39, AY30_KEY='ay30';
const AY30_NAME='AYAH2FIT 30', AY30_SUB='30-Day Home Program for Dads';
const AY30_PH='/img/p/ayah/', AY30_LOGO='/img/p/ayah/logo-w.png?v=2';

const AY_WEEKS=[
  {n:'Foundation', s:'Belajar gerakan, bina rutin. Tiga pusingan sehari.', from:1,  to:7},
  {n:'Build', s:'Empat pusingan sekarang. Gerakan sama, kerja lebih.',  from:8,  to:14},
  {n:'Strong', s:'Selepas Ayah Test kedua. Saat kerja naik sikit.',      from:15, to:21},
  {n:'Finish', s:'Sembilan hari terakhir, kemudian Ayah Test penutup.',  from:22, to:30}
];
/* each kind of day: ex without equipment, dx with dumbbells (no jumps in either) */
const AY_T={
  full:{n:'Full Body',k:'train',
    ex:['Bodyweight Squat','Knee Push Ups','Reverse Lunges','Bird Dog','Hip Thrust','Mountain Climber'],
    dx:['Normal Squat','Chest Press','ALT Lunges','RDL','ALT Shoulder Press','Plank Taps']},
  kaki:{n:'Leg Day',k:'lower',
    ex:['Bodyweight Squat','Walking Lunges','Hip Thrust','Side Lunges','Wall Sit','Calf Raises'],
    dx:['Wide Squat','ALT Lunges','RDL','Hip Thrust','Squat Hold','Calf Raises']},
  atas:{n:'Chest & Shoulders',k:'upper',
    ex:['Knee Push Ups','Plank Shoulder Taps','Wall Push Up','Bear Walk','Push Up Hold','Plank'],
    dx:['Chest Press','Upright Row','ALT Shoulder Press','Bicep Curl','Tricep Kick Back','Chest Fly']},
  teras:{n:'Core & Waist',k:'core',
    ex:['Dead Bug','Bicycle Crunch','Reverse Crunch','Russian Twist','Side Plank','Plank'],
    dx:['Russian Twist','Crunches','Flutter Kick','Hollow Hold','Side Plank','Plank Taps']},
  nafas:{n:'Conditioning',k:'cardio',
    ex:['Mountain Climber','Squat Pulse','Bear Walk','Alternating Lunges','Plank Shoulder Taps','Side Lunges'],
    dx:['Squat Thruster','Clean Press','ALT Lunges','Squat Bicep Curl','Jerk Press','Plank Taps']},
  rehat:{n:'Recovery',k:'recover',
    ex:['IC Warm','Bird Dog','Dead Bug','Hip Thrust','Calf Raises'], dx:null},
  test:{n:'Ayah Test',k:'test', ex:[], dx:null}
};
const AY_ORDER=['test','full','kaki','atas','nafas','teras','rehat',
                'full','kaki','atas','nafas','teras','full','rehat',
                'test','kaki','atas','nafas','teras','full','rehat',
                'kaki','atas','nafas','teras','full','kaki','rehat','full','test'];
const AY_DAYS=AY_ORDER.map(k=>Object.assign({id:k},AY_T[k]));
const AY_TESTS=[1,15,30], AY_CHECKINS=AY_TESTS;
const AY_KIND={test:'Ayah Test',train:'Full Body',lower:'Lower Body',upper:'Upper Body',cardio:'Conditioning',core:'Core',recover:'Recovery'};

const AY30=(function(){
  const weeks=AY_WEEKS.map(w=>({days:AY_DAYS.slice(w.from-1,w.to).map(d=>({name:d.n, ex:d.ex.length?d.ex:['Bodyweight Squat','Knee Push Ups','Plank'], r:4, k:d.k}))}));
  return {id:AY30_ID, name:AY30_NAME, sub:AY30_SUB, goal:'Fat Loss', level:'Beginner', dur:24, rounds:4,
    c1:'#0B2A4A', c2:'#071A2F', ac:'#D4AF7C', icon:'✦', weeks, hub:'ay', oneTime:true, price:AY30_PRICE, wk:4,
    desc:'30 hari di rumah untuk ayah. Tanpa lompat, tanpa alat atau dengan dumbbell, 24 minit sehari, '+
         '12 minit bila sibuk, dengan sasaran kalori, menu Malaysia, senarai belanja, Nutrition Academy dan Ayah Test.'};
})();
/* Before the launch only the listed accounts see it, or anyone who has bought
   it; everyone else keeps today's app, BURN30 on sale included. Set AY30_LIVE
   to true on launch day. */
const AY30_LIVE=false, AY30_TESTERS=['sethnasser1991@gmail.com'];
function ayLive(){
  return AY30_LIVE || AY30_TESTERS.indexOf(String(HF.email||'').toLowerCase())>=0 || (typeof owns==='function' && owns('prog_'+AY30_ID));
}
/* it joins the programs only for those accounts, so no list shows it to anyone else */
function ayEnsure(){
  const i=PROGRAMS.indexOf(AY30), on=ayLive();
  if(on && i<0) PROGRAMS.unshift(AY30); else if(!on && i>=0) PROGRAMS.splice(i,1);
}

/* ── state ── */
function ayData(){
  const d=HF.data.ay30||(HF.data.ay30={});
  d.check=d.check||{}; d.fit=d.fit||{}; d.body=d.body||{}; d.steps=d.steps||{}; d.water=d.water||{}; d.shop=d.shop||{}; d.lesson=d.lesson||{};
  return d;
}
function ayOwned(){ return ownsProgram(AY30); }
function ayDone(){ return Math.min(progDone(AY30_ID), AY_DAYS.length); }
function ayNext(){ return ayDone(); }
function ayMe(){ const m=ayData().me; return m&&m.done ? m : null; }
function ayWeekOf(gi){ const n=gi+1; for(let i=0;i<AY_WEEKS.length;i++) if(n>=AY_WEEKS[i].from&&n<=AY_WEEKS[i].to) return i; return 0; }
function ayFirst(){ return ((HF.data.prefs&&HF.data.prefs.name)||'').trim().split(/\s+/)[0]; }

/* ── the day each dad does ──
   Level sets the seconds and the push-up; a sore part swaps what loads it;
   the switch picks bodyweight or dumbbells; busy keeps two rounds. */
const AY_SECS={asas:[30,30,35,40], aktif:[40,40,45,45]};
const AY_ROUNDS=[3,4,4,4];
const AY_SWAP={
  lutut:{from:['Bodyweight Squat','Reverse Lunges','Walking Lunges','Alternating Lunges','Side Lunges','Wall Sit','Squat Pulse',
               'Normal Squat','Wide Squat','ALT Lunges','Squat Hold','Squat Thruster','Squat Bicep Curl'],
         to:{Bodyweight:['Hip Thrust','Single Leg Glutes Bridge','Calf Raises','Dead Bug','Bird Dog','Bicycle Crunch','Towel Bicep Curl','Towel Upright Row'],
             Dumbbell:['Hip Thrust','Single Hip Thrust','Calf Raises','Bicep Curl','Upright Row','Shrug']}},
  belakang:{from:['Russian Twist','Flutter Kick','Reverse Crunch','Bicycle Crunch','Hollow Hold','RDL','Clean Press','Jerk Press','Squat Thruster'],
         to:{Bodyweight:['Dead Bug','Bird Dog','Side Plank','Plank','Hip Thrust','Calf Raises'],
             Dumbbell:['Hip Thrust','Side Plank','Calf Raises','Crunches','Bicep Curl','Upright Row']}},
  tangan:{from:['Knee Push Ups','Push Up','Wall Push Up','Push Up Hold','Plank Shoulder Taps','Mountain Climber','Bird Dog','Bear Walk','Plank','Side Plank','Plank Taps'],
         to:{Bodyweight:['Dead Bug','Bicycle Crunch','Hip Thrust','Wall Sit','Squat Pulse','Calf Raises','Towel Bicep Curl','Towel Upright Row','Towel Front Raises'],
             Dumbbell:['Crunches','Hip Thrust','Calf Raises','Upright Row','Bicep Curl','Shrug']}}
};
function ayMode(){ const w=ayData(); return w.mode||((ayMe()||{}).alat==='dumbbell'?'dumbbell':'tanpa'); }
function aySetMode(m,gi){ ayData().mode=m; HF.save(); if(gi>=0) ayOpenDay(gi); else renderAY30(); }
function ayInDB(n,eq){ return DB.some(x=>x.n===n && (x.eq===eq || x.eq==='Towel') && x.v); }
function ayPush(me){ return me&&me.level==='aktif' ? 'Push Up' : 'Knee Push Ups'; }
function ayDay(gi,busy){
  const t=AY_DAYS[gi]; if(!t) return null;
  const me=ayMe(), wi=ayWeekOf(gi), level=(me&&me.level)||'asas';
  if(t.k==='test'){
    let ex=[ayPush(me),'Bodyweight Squat','Plank'];
    ex=aySwapped(ex,me,'Bodyweight');
    return {n:t.n, k:t.k, r:1, ex, eq:'Bodyweight', dur:60};
  }
  const dumb=t.dx && ayMode()==='dumbbell', eq=dumb?'Dumbbell':'Bodyweight';
  let ex=(dumb?t.dx:t.ex).slice();
  if(!dumb && level==='aktif') ex=ex.map(n=>n==='Knee Push Ups'?'Push Up':n==='Wall Push Up'?'Knee Push Ups':n);
  ex=aySwapped(ex,me,eq);
  const rest=t.k==='recover';
  return {n:t.n, k:t.k, r:rest?2:(busy?2:AY_ROUNDS[wi]), ex, eq, dur:rest?40:AY_SECS[level][wi]};
}
function aySwapped(ex,me,eq){
  const parts=((me&&me.pain)||[]).filter(p=>AY_SWAP[p]), out=[];
  ex.forEach(n=>{
    const why=parts.filter(p=>AY_SWAP[p].from.indexOf(n)>=0);
    if(!why.length){ if(out.indexOf(n)<0) out.push(n); return; }
    const bad=m=>parts.some(p=>AY_SWAP[p].from.indexOf(m)>=0);
    let c=[]; why.forEach(p=>{ c=c.concat(AY_SWAP[p].to[eq]); });
    const pick=c.filter(m=>!bad(m) && out.indexOf(m)<0 && ex.indexOf(m)<0 && ayInDB(m,eq))[0];
    if(pick) out.push(pick);
  });
  return out;
}
function ayEx(n,eq,dur){
  const e=DB.filter(x=>x.n===n && x.eq===eq && x.v)[0] || DB.filter(x=>x.n===n && x.v)[0] || {n, v:'', m:'Full Body'};
  return {n, v:e.v||'', m:e.m, dur:dur||45, eq:e.eq||eq, t:e.t};
}
function ayExercises(d){ return d.ex.map(n=>ayEx(n,d.eq,d.dur)); }
function ayMinutes(d){ const s=ayExercises(d).reduce((a,e)=>a+e.dur+REST_SECS,0)*d.r; return Math.max(1,Math.round(s/60)); }


/* the daily checklist: the walking ramp and the missions are MAK2FIT's; a man drinks half a litre more */
function ayWater(gi){ return (gi<7?2.0:gi<14?2.2:gi<21?2.3:2.5)+0.5; }
function ayStepsFor(gi){ return (typeof LB30_STEPS!=='undefined' && LB30_STEPS[gi]) || 6000; }
function ayMisi(gi){ return String((typeof LB30_MISI!=='undefined' && LB30_MISI[gi]) || '').replace(/\banda\b/g,'Ayah').replace(/\bAnda\b/g,'Ayah'); }
function ayTip(gi){ return AY_LESSON[gi][1]; }
function ayMale(){ return true; }
const AY_ACT=WL30_ACT, AY_PACE=WL30_PACE;
function ayPaceOf(me){ return me&&AY_PACE[me.pace] || 0.5; }
function ayPace(){ return ayPaceOf(ayMe()); }
/* the Ayah Test: push-up and squat for a minute each, then the plank */
function ayFitList(){
  const ex=ayDay(0).ex, keys=['push','squat','plank'];
  return ex.map((n,i)=>{ const e=DB.filter(x=>x.n===n)[0]; return [keys[i]||('m'+i), n, e&&e.t==='hold'?'secs':'reps']; });
}
function ayStepAvg(){
  const w=ayData(), xs=[]; for(let i=0;i<7;i++){ const v=+w.steps[iso(-i)]||0; if(v) xs.push(v); }
  return xs.length ? Math.round(xs.reduce((a,b)=>a+b,0)/xs.length) : 0;
}
/* a man's plate (Precision Nutrition's hand guide): two palms of protein where
   MAK2FIT's menu says one, the rice trimmed so the meal stays on target */
function ayDish(o,kcal){
  const more=o.it.some(x=>/1 tapak tangan/.test(x));
  let d=lbDish(o,kcal?kcal-(more?90:0):kcal);
  /* never under a fist of rice: a Malaysian lunch he can keep eating */
  if(kcal && d.r!==null && d.r<1) d=lbDish(o,kcal-(more?90:0)+(1-d.r)*200);
  return {k:d.k+(more?90:0), r:d.r, it:d.it.map(x=>x.replace('1 tapak tangan','2 tapak tangan'))};
}
/* the questions: his own first, then MAK2FIT's for the target and the menu */
function ayQW(k){ return JSON.parse(JSON.stringify(WL30_Q.filter(q=>q.k===k)[0]).replace(/\banda\b/g,'Ayah')); }
const AY_Q=[
  {k:'anak', t:'Ada anak?', s:'Program ini untuk semua lelaki. Jawapan ini ubah nasihat harian saja.', o:[
    ['ya','Ya','','people'],['tak','Tak','','person'],['jauh','Ada tapi jauh','','heart'],['bayi','Masih bayi','','moon']]},
  {k:'kerja', t:'Jenis kerja?', s:'Hari Ayah lain-lain.', o:[
    ['pejabat','Pejabat','Banyak duduk','laptop'],['syif','Syif','Waktu tak tetap','clock'],['niaga','Niaga','Kedai, jualan, lapangan','bag']]},
  {k:'level', t:'Tahap sekarang?', s:'Jujur. Boleh ubah kemudian.', o:[
    ['asas','Foundation','Lama tak bersenam','sunrise'],['aktif','Active','Bersenam 2 kali seminggu atau lebih','flame']]},
  {k:'sihat', multi:true, t:'Kesihatan?', s:'Pilih semua yang berkaitan. Disimpan dalam akaun Ayah saja.', o:[
    ['darah','Darah tinggi','','heart'],['jantung','Sakit dada atau masalah jantung','','heart'],['gula','Kencing manis','','heart'],['tiada','Tiada','Setakat yang saya tahu','check']]},
  {k:'pain', multi:true, t:'Ada yang selalu sakit?', s:'Kami tukar gerakan yang membebankannya.', o:[
    ['lutut','Lutut','','person'],['belakang','Belakang bawah','','person'],['tangan','Pergelangan tangan','','person'],['tiada','Tiada','Badan okey','check']]},
  {k:'alat', t:'Alat di rumah?', s:'Boleh tukar bila-bila masa.', o:[
    ['tanpa','Bodyweight','Badan sendiri saja','home'],['dumbbell','Dumbbell','Sepasang pun cukup','workout']]},
  {k:'fact', f:'tabiat'},
  ayQW('body'), ayQW('act'), ayQW('pace'),
  {k:'fact', f:'jangka'},
  ayQW('meals'), ayQW('avoid'), ayQW('cook')
];
/* high blood pressure or a heart: the doctor first */
function ayRisk(){ const s=(ayQA&&ayQA.sihat)||[]; return s.indexOf('darah')>=0 || s.indexOf('jantung')>=0; }

/* the photographs: the man's studio set, on navy until the dads' own are shot */
const AY_WK_IMG=['squat','lunge','climber','squat'];
function ayCover(){ return AY30_PH+'cover.jpg'; }
function ayBg(u){ return "background-image:url('"+u+"')"; }
function ayWeekImg(wi){ return AY30_PH+AY_WK_IMG[wi]+'-w.jpg'; }
function ayDayImg(gi){ const d=AY_DAYS[gi]; return AY30_PH+(d.k==='test'?'plank':d.k==='recover'?'stretch':AY_WK_IMG[ayWeekOf(gi)])+'-w.jpg'; }

/* ── the program's home ── */
let ayPing='malaysia', ayLsOpen=false;
let ayTab='plan', ayWeek=-1, ayMenuDay=-1, ayFoodSeg='today', ayShopWeek=-1;
function ayScrollTabs(){ try{ const s=$('screen'), a=$('wl-tabs'); if(s&&a&&a.offsetTop) s.scrollTop=Math.max(0,a.offsetTop-70); }catch(e){} }
function aySetTab(t){ ayTab=t; renderAY30(); ayScrollTabs(); }
function aySetFoodSeg(x){ ayFoodSeg=x; renderAY30(); ayScrollTabs(); }
function ayHero(){
  return '<div class="lbx-hero bn-hero ay-hero" style="background-image:url(\''+ayCover()+'\')"><div class="lbx-hero-ov"></div>'+
    '<div class="lbx-hero-tx"><img class="ay-logo" src="'+AY30_LOGO+'" alt="AYAH2FIT 30">'+
    '<div class="lbx-tags"><span>30 days</span><span>12–24 min</span><span>No jumps</span><span>At home</span></div></div></div>';
}
function renderAY30(){
  if(ayQ>=0){ $('pgd-body').innerHTML=ayQuiz(); return; }
  const owned=ayOwned(), done=ayDone(), tot=AY_DAYS.length, nx=ayNext();
  if(ayWeek<0) ayWeek=ayWeekOf(Math.min(nx,tot-1));
  const pill=!owned ? {icon:'lock',label:'RM'+AY30_PRICE,go:'ayBuy()'}
           : nx<tot ? {icon:'play',label:'Day '+(nx+1),go:'ayOpenDay('+nx+')'} : null;
  let h=pdxBar('program',pill)+ayHero()+'<div class="lbx ay">';
  if(!owned){
    h+='<div class="lbx-card lbx-sell"><div class="lbx-k">Built for dads</div>'+
      '<div class="lbx-h">30 hari. Di rumah. Lepas anak tidur pun boleh.</div>'+
      '<div class="lbx-p">Pelan latihan Ayah sendiri 12–24 minit sehari, sasaran kalori, menu Malaysia, dan progres direkod.</div>'+
      '<button class="lbx-go" onclick="ayBuy()">'+glyph('lock')+'Get the Program · RM'+AY30_PRICE+'</button>'+
      '<button class="lbx-ghost" onclick="openPaywall(\'AYAH2FIT 30 is included in HITFAT+.\')">'+glyph('star')+'Included in HITFAT+</button></div>';
  } else if(nx<tot && !ayMe()){
    /* before their first day (or, for a member part-way, now): the questionnaire */
    h+='<div class="lbx-card lbq-invite"><div class="lbx-k">'+(done?'New · your own plan':'Before Day 1')+'</div>'+
      '<div class="lbx-h">Jom bina pelan 30 hari Ayah.</div>'+
      '<div class="lbx-p">'+ayQCount(AY_Q.length)+' soalan, 2 minit. Gerakan, minit dan kalori ikut tahap, badan dan masa Ayah.</div>'+
      '<button class="lbx-go" onclick="ayQuizOpen()">'+glyph('sliders')+'Bina Pelan Saya</button>'+
      (done?'<button class="lbx-ghost" onclick="ayOpenDay('+nx+')">'+glyph('play')+'Continue Day '+(nx+1)+'</button>':'')+'</div>';
  } else if(nx<tot){
    const d=ayDay(nx), wi=ayWeekOf(nx), st=liveStreak();
    h+='<div class="lbx-card lbx-now">'+
      '<div class="lbx-now-top">'+lbRing(done/tot,84,done+'<i>/'+tot+'</i>','days')+
        '<div class="lbx-now-tx"><div class="lbx-hello">Assalamualaikum, Ayah</div>'+
        '<div class="lbx-h">Day '+(nx+1)+' · Week '+(wi+1)+'</div>'+
        '<div class="lbx-p">'+AY_WEEKS[wi].n+'. '+(st>1?st+'-day streak 🔥':'One day at a time.')+'</div></div></div>'+
      '<div class="lbx-today" onclick="ayOpenDay('+nx+')">'+
        '<div class="lbx-today-ph" style="'+ayBg(ayDayImg(nx))+'"><span class="lbx-badge">Today</span></div>'+
        '<div class="lbx-today-b"><div class="lbx-k">'+(AY_KIND[d.k]||'Workout')+' · '+ayMinutes(d)+' min · '+d.ex.length+' moves</div>'+
        '<div class="lbx-t">'+d.n+'</div></div></div>'+
      (d.k==='test' ? '<button class="lbx-go" onclick="ayOpenDay('+nx+')">'+glyph('play')+'Start Ayah Test</button>' :
        '<button class="lbx-go" onclick="ayPlay('+nx+')">'+glyph('play')+'Start · '+ayMinutes(d)+' min</button>'+
        (d.k!=='recover'?'<button class="lbx-ghost" onclick="ayPlay('+nx+',1)">'+glyph('clock')+'Busy day? '+ayMinutes(ayDay(nx,1))+' min</button>':''))+'</div>';
  } else {
    h+='<div class="lbx-card lbx-now lbx-fin">'+lbRing(1,84,'30','days')+
      '<div class="lbx-h">30 days complete</div><div class="lbx-p">Tengok sejauh mana Ayah dah pergi.</div>'+
      '<button class="lbx-go" onclick="aySetTab(\'progress\')">'+glyph('trophy')+'See Your Results</button></div>';
  }
  if(owned && typeof lbScanHero==='function') h+=lbScanHero();
  h+='<div class="lbx-seg" id="wl-tabs">'+[['plan','Plan'],['food','Nutrition'],['learn','Learn'],['progress','Progress'],['guide','Start Here']]
    .map(t=>'<button class="'+(ayTab===t[0]?'on':'')+'" onclick="aySetTab(\''+t[0]+'\')">'+t[1]+'</button>').join('')+'</div>';
  if(ayTab==='food') h+=ayFood();
  else if(ayTab==='learn') h+=ayLearn();
  else if(ayTab==='progress') h+=ayProgress();
  else if(ayTab==='guide') h+=ayGuide();
  else h+=ayPlan();
  h+='</div>';
  $('pgd-body').innerHTML=h;
}

/* ── the questionnaire: one question a screen, a woman's question only for her ── */
let ayQ=-1, ayQA=null;
function ayQOn(i){ const q=AY_Q[i]; return !!q && (!q.when || q.when(ayQA||{})); }
function ayQuizOpen(at){
  const me=ayData().me||{}, pr=ayProfile();
  ayQA=JSON.parse(JSON.stringify(me));
  ayQA.wt=ayQA.wt||pr.wt||''; ayQA.ht=ayQA.ht||pr.ht||''; ayQA.age=ayQA.age||pr.age||'';
  ayQ=at||0; hidePanels(); $('progdetail').style.display='block'; renderAY30(); $('screen').scrollTop=0;
}
/* ayQ: 0 the intro, i+1 question i, past the end the result */
function ayQuizNext(){ do{ ayQ++; } while(ayQ<=AY_Q.length && !ayQOn(ayQ-1)); renderAY30(); $('screen').scrollTop=0; }
function ayQuizBack(){
  if(ayQ<=0){ ayQ=-1; renderAY30(); return; }
  do{ ayQ--; } while(ayQ>0 && !ayQOn(ayQ-1));
  renderAY30(); $('screen').scrollTop=0;
}
function ayQPick(k,v,multi){
  if(multi){
    let l=ayQA[k]||[]; const i=l.indexOf(v);
    if(v==='tiada') l=i>=0?[]:['tiada'];
    else { l=l.filter(x=>x!=='tiada'); if(i>=0) l.splice(l.indexOf(v),1); else l.push(v); }
    ayQA[k]=l; if(k==='sihat' && !ayRisk()) delete ayQA.clear; renderAY30(); return;
  }
  ayQA[k]=v;
  ayQuizNext();
}
function ayQTick(k){ ayQA[k]=!ayQA[k]; renderAY30(); }
function ayQBody(){
  const g=x=>parseFloat(($(x)||{}).value);
  const wt=g('wlq-wt'), ht=g('wlq-ht'), age=parseInt(($('wlq-age')||{}).value,10);
  if(!(wt>=30&&wt<=250) || !(ht>=120&&ht<=220) || !(age>=18&&age<=90)){ toast('Isi berat, tinggi dan umur'); return; }
  ayQA.wt=wt; ayQA.ht=ht; ayQA.age=age; ayQuizNext();
}
function ayQuizSave(){
  const d=ayData(); ayQA.done=true; ayQA.at=iso(0);
  d.me=ayQA; delete d.mode; d.profile={gender:'male', wt:ayQA.wt, ht:ayQA.ht, age:ayQA.age};
  HF.save(); ayQ=-1; ayTab='plan'; ayWeek=-1; renderAY30(); $('screen').scrollTop=0; toast('Pelan Ayah sudah sedia');
}
/* the questions alone (without the facts, and without hers for a man) */
function ayQCount(upto){ let c=0; for(let i=0;i<Math.min(upto,AY_Q.length);i++) if(AY_Q[i].k!=='fact' && ayQOn(i)) c++; return c; }
function ayQuiz(){
  const n=AY_Q.length, qn=ayQCount(n), isFact=ayQ>0&&ayQ<=n&&AY_Q[ayQ-1].k==='fact';
  let h='<div class="lbq ay">';
  const bar='<div class="lbq-top"><button class="pdx-back" aria-label="Back" onclick="ayQuizBack()">'+glyph('chevleft')+'</button>'+
    '<div class="lbq-bar"><i style="width:'+Math.round(Math.min(ayQ,n)/n*100)+'%"></i></div><span class="lbq-n">'+(isFact?'':ayQCount(Math.min(ayQ,n))+'/'+qn)+'</span></div>';
  if(ayQ===0){
    const nm=((HF.data.prefs&&HF.data.prefs.name)||'').trim().split(/\s+/)[0];
    return h+bar+'<div class="lbq-intro bn-hero ay-hero" style="background-image:url(\''+ayCover()+'\')"><div class="lbx-hero-ov"></div><div class="tx">'+
      '<img class="ay-logo" src="'+AY30_LOGO+'" alt="AYAH2FIT 30"><div class="t">Jom bina pelan 30 hari'+(nm?', '+hesc(nm):' Ayah')+'.</div></div></div>'+
      '<div class="lbq-p">'+qn+' soalan, lebih kurang 2 minit. Jawapan Ayah menentukan gerakan, minit setiap hari dan sasaran kalori.</div>'+
      '<div class="lbq-list">'+[['person','Anak, kerja dan tahap Ayah'],['heart','Kesihatan dan bahagian yang sakit'],['workout','Alat di rumah'],
        ['flame','Badan, aktiviti dan rentak'],['food','Cara Ayah makan']]
        .map(x=>'<div><span>'+glyph(x[0])+'</span>'+x[1]+'</div>').join('')+'</div>'+
      '<button class="lbx-go" onclick="ayQuizNext()">'+glyph('play')+'Mula</button></div>';
  }
  if(ayQ>n) return h+ayQuizResult()+'</div>';
  const q=AY_Q[ayQ-1], v=ayQA[q.k];
  if(q.k==='fact') return h+bar+lbFact(q.f,ayQA)+'<button class="lbx-go" onclick="ayQuizNext()">Seterusnya</button></div>';
  h+=bar+'<div class="lbq-q">'+hesc(q.t)+'</div>'+(q.s?'<div class="lbq-s">'+hesc(q.s)+'</div>':'');
  if(q.k==='body'){
    const fld=(id,l,u,val,m)=>'<label class="esf"><span>'+l+'</span><input class="inp" id="'+id+'" inputmode="'+m+'" placeholder="0" value="'+(val||'')+'"><em>'+u+'</em></label>';
    return h+'<div class="esfields lbq-body">'+fld('wlq-wt','Berat','kg',ayQA.wt,'decimal')+fld('wlq-ht','Tinggi','cm',ayQA.ht,'decimal')+fld('wlq-age','Umur','tahun',ayQA.age,'numeric')+'</div>'+
      '<button class="lbx-go" onclick="ayQBody()">Seterusnya</button></div>';
  }
  h+='<div class="lbq-opts'+(q.grid?' grid':'')+'">'+q.o.map(o=>{
    const on=q.multi ? (v||[]).indexOf(o[0])>=0 : v===o[0];
    return '<button class="lbq-o'+(on?' on':'')+'" onclick="ayQPick(\''+q.k+'\','+(typeof o[0]==='number'?o[0]:'\''+o[0]+'\'')+(q.multi?',1':'')+')">'+
      '<span class="ic">'+glyph(o[3])+'</span><span class="tx"><b>'+hesc(o[1])+'</b>'+(o[2]?'<small>'+hesc(o[2])+'</small>':'')+'</span>'+
      '<span class="tk">'+(on?glyph('check'):'')+'</span></button>';
  }).join('')+'</div>';
  if(q.k==='sihat' && ayRisk()){
    h+='<div class="lbq-warn">'+glyph('heart')+'<div><b>Jumpa doktor dulu.</b> Senaman baik untuk jantung, tapi tekanan darah dan keadaan jantung Ayah perlu disemak sebelum mula.</div></div>'+
      '<div class="lbq-ticks"><div class="obrow obtick'+(ayQA.clear?' on':'')+'" onclick="ayQA.clear=!ayQA.clear;renderAY30()"><span class="box">'+(ayQA.clear?'✓':'')+'</span><span>Doktor dah benarkan saya bersenam</span></div></div>';
    return h+(ayQA.clear?'<button class="lbx-go" onclick="ayQuizNext()">Seterusnya</button>':'<div class="lbq-hint">Program ini kekal dalam akaun Ayah. Mula bila doktor dah benarkan.</div>')+'</div>';
  }
  if(q.multi || (v!==undefined && v!==null && v!=='')) h+='<button class="lbx-go'+((v&&(v.length||typeof v==='number'))?'':' off')+'" onclick="'+((v&&(v.length||typeof v==='number'))?'ayQuizNext()':'')+'">Seterusnya</button>';
  return h+'</div>';
}
/* what the answers did */
function ayQuizResult(){
  const keep=ayData().me; ayData().me=Object.assign({},ayQA,{done:true});
  const me=ayData().me, d=ayDay(8), busy=ayDay(8,1), tg=ayTarget(), nm=((HF.data.prefs&&HF.data.prefs.name)||'').trim().split(/\s+/)[0];
  const wk=AY_WEEKS.map(w=>{ let m=0; for(let i=w.from-1;i<w.to;i++) m+=ayMinutes(ayDay(i)); return m; });
  const lunch=LB30_MEALS[me.meals] ? LB30_MEALS[me.meals].filter(m=>m[0]==='tengahari')[0] : ['tengahari',LB30_MENU.tengahari.share];
  const rice=tg ? lbFist(Math.max(1,lbRice(LB30_MENU.tengahari.opts[0],(tg.cal*lunch[1])-90))).replace(' genggam','') : null;
  const mins=ayMinutes(d), mb=ayMinutes(busy), secs=d.dur, end=tg&&me.wt ? Math.round((me.wt-ayPaceOf(me)*30/7)*10)/10 : null, pace=ayPaceOf(me);
  ayData().me=keep;
  const stat=xs=>'<div class="lbq-stats">'+xs.map(x=>'<div><b>'+x[0]+'</b><span>'+x[1]+'</span></div>').join('')+'</div>';
  const lines=[]; (me.pain||[]).forEach(p=>{ const t={lutut:'Squat dan lunge ditukar supaya lutut tak terbeban.',belakang:'Gerakan yang membebankan belakang ditukar.',tangan:'Gerakan menongkat tangan ditukar.'}[p]; if(t) lines.push(t); });
  if((me.sihat||[]).indexOf('gula')>=0) lines.push('Kencing manis: bawa sesuatu yang manis dekat, dan berhenti kalau rasa pening atau menggeletar.');
  const mt=(me.avoid||[]).filter(a=>LB30_AVOID[a]).map(a=>'Tanpa '+LB30_AVOID[a]); if(me.cook==='beli') mt.push('Mudah dibeli');
  return '<div class="lbq-res"><div class="lbq-res-h bn-hero ay-hero" style="background-image:url(\''+ayCover()+'\')"><div class="lbx-hero-ov"></div><div class="tx"><div class="k">Your plan is ready</div><div class="t">30 hari, untuk '+(nm?hesc(nm):'Ayah')+'.</div></div></div>'+
    '<div class="lbq-card"><div class="lbq-ch">'+glyph('workout')+'<b>Workout</b><span>'+(me.level==='aktif'?'Active':'Foundation')+'</span></div>'+
      stat([[mins,'min a day'],[mb,'min busy day'],[secs,'sec work'],['0','jumps']])+
      '<div class="lbq-chart sm">'+lbWeeksSVG(wk,AY_WEEKS)+'</div><div class="lbq-cap">Minit seminggu: naik perlahan, supaya badan sempat menyesuaikan diri.</div></div>'+
    (tg?'<div class="lbq-card"><div class="lbq-ch">'+glyph('food')+'<b>Nutrition</b><span>'+(LB30_MEALS[me.meals]?me.meals+' meals a day':'3 meals a day')+'</span></div>'+
      stat([[tg.cal.toLocaleString(),'kcal a day'],[tg.prot+'g','protein'],[rice||'–','fists of rice, lunch']])+
      (mt.length?'<div class="lbq-chips">'+mt.map(x=>'<span>'+hesc(x)+'</span>').join('')+'</div>':'')+
      (end!==null?'<div class="lbq-chart sm">'+lbProjSVG(me.wt,end)+'</div><div class="lbq-cap">Anggaran jika ikut pelan, '+pace+' kg seminggu. Bukan janji: setiap badan berbeza.</div>':'')+'</div>':'')+
    (lines.length?'<div class="lbq-lines">'+lines.map(l=>'<div><span>'+glyph('check')+'</span><p>'+l+'</p></div>').join('')+'</div>':'')+
    '<div class="lbq-fine">Sakit dada, pening atau sesak nafas? Berhenti terus. Jawapan boleh diubah di tab Plan.</div>'+
    '<button class="lbx-go" onclick="ayQuizSave()">'+glyph('play')+'See My Plan</button>'+
    '<button class="lbx-ghost" onclick="ayQ=1;renderAY30()">Change answers</button></div>';
}
/* their plan in one card, at the top of Plan */
function ayMeCard(){
  const me=ayMe(); if(!me) return '';
  const tags=[me.level==='aktif'?'Active':'Foundation', ayMode()==='dumbbell'?'Dumbbell':'Bodyweight', {pejabat:'Office',syif:'Shift work',niaga:'Business'}[me.kerja]];
  (me.pain||[]).forEach(p=>{ const t={lutut:'Knee-safe',belakang:'Back-safe',tangan:'Wrist-safe'}[p]; if(t) tags.push(t); });
  if(LB30_MEALS[me.meals]) tags.push(me.meals+' meals a day');
  return '<div class="lbx-card lbq-me"><div class="h"><span class="ic">'+glyph('sliders')+'</span><div class="tt"><div class="lbx-k">Your plan</div><b>Dibina dari jawapan Ayah</b></div>'+
    '<button onclick="ayQuizOpen()">'+glyph('pencil')+'Edit</button></div>'+
    '<div class="lbq-chips row">'+tags.filter(Boolean).map(x=>'<span>'+hesc(x)+'</span>').join('')+'</div></div>';
}

/* ── Plan: their plan, today's routine, then the month as day tiles ── */
function ayPlan(){
  const owned=ayOwned(), done=ayDone(), tot=AY_DAYS.length, nx=ayNext();
  let h='';
  if(owned) h+=ayMeCard();
  if(owned && nx<tot) h+=ayChecklist();
  const w=AY_WEEKS[ayWeek]||AY_WEEKS[0];
  h+='<div class="lbx-sec"><div class="lbx-sh"><div class="lbx-st">Your 30 Days</div><div class="lbx-ss">'+done+' of '+tot+' days done</div></div></div>';
  h+='<div class="lbx-dots">'+AY_DAYS.map((d,i)=>'<i class="'+(i<done?'d':i===nx&&owned?'n':'')+(AY_WEEKS.some(x=>x.from===i+1&&i>0)?' gap':'')+'"></i>').join('')+'</div>';
  h+='<div class="lbx-weeks">'+AY_WEEKS.map((x,i)=>
    '<button class="'+(i===ayWeek?'on':'')+'" onclick="ayWeek='+i+';renderAY30()"><small>Week '+(i+1)+'</small><b>'+(done>=x.to?'✓ ':'')+x.n+'</b></button>').join('')+'</div>';
  h+='<div class="lbx-wcover" style="'+ayBg(ayWeekImg(ayWeek))+'"><div><small>Week '+(ayWeek+1)+' · Days '+w.from+'–'+w.to+'</small><b>'+w.n+'</b><span>'+w.s+'</span></div></div>';
  h+='<div class="lbx-days">'+AY_DAYS.slice(w.from-1,w.to).map((d0,j)=>{
    const gi=w.from-1+j, d=ayDay(gi), isDone=gi<done, now=gi===nx&&owned;
    return '<div class="lbx-day'+(isDone?' done':'')+(now?' now':'')+' k-'+d.k+'" onclick="ayOpenDay('+gi+')">'+
      '<div class="lbx-day-n"><small>DAY</small><b>'+(gi+1)+'</b>'+(isDone?'<span class="ck">'+glyph('check')+'</span>':'')+'</div>'+
      '<div class="lbx-day-t">'+d.n+'</div>'+
      '<div class="lbx-day-m">'+(d.k==='test'?'Fit test':d.k==='recover'?'Recovery · '+ayMinutes(d)+' min':(AY_KIND[d.k]||'')+' · '+ayMinutes(d)+' min')+'</div>'+
      (now?'<span class="lbx-day-now">Today</span>':'')+'</div>';
  }).join('')+'</div>';
  return h;
}

/* today's routine: the workout, the steps and the water that fill, the day's
   nutrition mission written out, and the rest as ticks */
function ayChecklist(){
  const w=ayData(), t=iso(0), gi=Math.min(ayNext(),AY_DAYS.length-1);
  const c=w.check[t]||{}, trained=doneToday();
  const stepT=ayStepsFor(gi), st=+w.steps[t]||0, waterT=ayWater(gi), wt=+w.water[t]||0;
  const stepOk=st>=stepT, waterOk=wt>=waterT-0.001;
  const ls=AY_LESSON[gi], lsOk=!!w.lesson[gi];
  let n=(trained?1:0)+(stepOk?1:0)+(waterOk?1:0)+(lsOk?1:0);
  ['misi','makan','tidur'].forEach(x=>{ if(c[x]) n++; });
  const total=7, d=ayDay(gi);
  const ck=(on,icon)=>'<span class="ck'+(on?' on':'')+'">'+glyph(on?'check':icon)+'</span>';
  const bar=p=>'<div class="bar"><i style="width:'+Math.round(Math.min(1,p)*100)+'%"></i></div>';
  const pm=(minus,plus,lm,lp)=>'<div class="pm" onclick="event.stopPropagation()"><button onclick="'+minus+'" aria-label="'+lm+'">−</button><button onclick="'+plus+'" aria-label="'+lp+'">+</button></div>';
  return '<div class="lbx-sec"><div class="lbx-sh"><div class="lbx-st">Today&rsquo;s Checklist</div><div class="lbx-ss">'+n+' of '+total+' done</div></div>'+
    lbRing(n/total,44,n,'')+'</div>'+
    '<div class="lbx-card lbx-cl">'+
    '<div class="lbx-cr'+(trained?' on':'')+'" onclick="ayOpenDay('+gi+')">'+ck(trained,'play')+
      '<div class="tx"><b>'+d.n+'</b><span>Workout · '+ayMinutes(d)+' min</span></div><span class="pdx-chev">›</span></div>'+
    '<div class="lbx-cr'+(stepOk?' on':'')+'" onclick="aySteps(\'goal\')">'+ck(stepOk,'steps')+
      '<div class="tx"><b>'+st.toLocaleString()+' <em>/ '+stepT.toLocaleString()+' steps</em></b>'+bar(st/stepT)+'</div>'+
      pm('aySteps(-500)','aySteps(500)','500 fewer steps','500 more steps')+'</div>'+
    '<div class="lbx-cr'+(waterOk?' on':'')+'">'+ck(waterOk,'bottle')+
      '<div class="tx"><b>'+wt.toFixed(2).replace(/0$/,'')+' <em>/ '+waterT.toFixed(1)+' L water</em></b>'+bar(wt/waterT)+'</div>'+
      pm('ayWaterAdd(-0.25)','ayWaterAdd(0.25)','250 ml less','250 ml more')+'</div>'+
    '<div class="lbx-cr'+(c.misi?' on':'')+'" onclick="ayTick(\'misi\')">'+ck(c.misi,'target')+
      '<div class="tx"><span class="k">Nutrition mission</span><b class="w">'+ayMisi(gi)+'</b></div></div>'+
    '<div class="lbx-cr'+(c.makan?' on':'')+'" onclick="ayTick(\'makan\')">'+ck(c.makan,'food')+'<div class="tx"><b>Ate to plan</b></div></div>'+
    '<div class="lbx-cr'+(c.tidur?' on':'')+'" onclick="ayTick(\'tidur\')">'+ck(c.tidur,'moon')+'<div class="tx"><b>Slept 7 hours</b></div></div>'+
    '<div class="lbx-cr'+(lsOk?' on':'')+'" onclick="ayLsToggle()">'+ck(lsOk,'book')+'<div class="tx"><span class="k">Today&rsquo;s lesson</span><b class="w">'+ls[0]+'</b></div><span class="pdx-chev">'+(ayLsOpen?'⌄':'›')+'</span></div>'+
    (ayLsOpen?'<div class="ay-lesson"><p>'+ls[1]+'</p><button class="lbx-go" onclick="ayLsDone('+gi+')">'+glyph('check')+(lsOk?'Read':'Got It')+'</button></div>':'')+
  '</div>';
}
function ayLsToggle(){ ayLsOpen=!ayLsOpen; ayShopRe(); }
function ayLsDone(gi){ ayData().lesson[gi]=true; ayLsOpen=false; HF.save(); ayShopRe(); }
function ayTick(k){ const d=ayData(), t=iso(0); d.check[t]=d.check[t]||{}; d.check[t][k]=!d.check[t][k]; HF.save(); renderAY30(); }
function aySteps(n){
  const d=ayData(), t=iso(0), gi=Math.min(ayNext(),AY_DAYS.length-1), g=ayStepsFor(gi);
  d.steps[t]= n==='goal' ? (((+d.steps[t]||0)>=g) ? 0 : g) : Math.max(0,(+d.steps[t]||0)+n);
  HF.save(); renderAY30();
}
function ayWaterAdd(n){ const d=ayData(), t=iso(0); d.water[t]=Math.max(0,Math.round(((+d.water[t]||0)+n)*100)/100); HF.save(); renderAY30(); }

/* ── a day: the photograph, what it is, one big button, the moves ── */
function ayOpenDay(gi){
  const d=ayDay(gi); if(!d) return;
  const owned=ayOwned(), exs=ayExercises(d), wi=ayWeekOf(gi), done=gi<ayDone(), isCheck=AY_CHECKINS.indexOf(gi+1)>=0;
  curProg=AY30; curDay={p:AY30, day:AY30.weeks[wi].days[gi-AY_WEEKS[wi].from+1], gi};
  let h=pdxBar('day', owned?{icon:'play',label:'Start',go:'ayPlay('+gi+')'}:{icon:'lock',label:'RM'+AY30_PRICE,go:'ayBuy()'})+
    '<div class="lbx-hero day bn-day ay-day" style="'+ayBg(ayDayImg(gi))+'"><div class="lbx-hero-ov"></div>'+
    '<div class="lbx-hero-tx"><div class="lbx-kick">Day '+(gi+1)+' of 30 · Week '+(wi+1)+': '+AY_WEEKS[wi].n+(done?' · ✓ Done':'')+'</div>'+
    '<div class="lbx-name">'+d.n+'</div></div></div><div class="lbx ay">';
  h+='<div class="lbx-facts">'+[[ayMinutes(d)+'','minutes'],[exs.length+'','moves'],[d.r+'','rounds'],[d.dur+'s','work']]
    .map(x=>'<div><b>'+x[0]+'</b><span>'+x[1]+'</span></div>').join('')+'</div>';
  if(!owned){
    h+='<button class="lbx-go" onclick="ayBuy()">'+glyph('lock')+'Unlock · RM'+AY30_PRICE+'</button>';
  } else if(d.k==='test'){
    h+='<div class="lbx-card lbx-steps"><div class="lbx-step"><span class="n">1</span><div class="tx"><div class="t">Body Check-in</div>'+
       '<div class="s">Berat dan pinggang, pagi sebelum sarapan. Gambar kalau Ayah mahu.</div></div></div>'+ayBodyForm(gi+1)+
       '<div class="lbx-step"><span class="n">2</span><div class="tx"><div class="t">Ayah Test</div>'+
       '<div class="s">Push-up dan squat 1 minit, kemudian plank selama boleh. Kira dengan jujur.</div></div></div></div>'+
       '<button class="lbx-go" onclick="ayPlay('+gi+')">'+glyph('play')+'Start Ayah Test</button>'+ayFitForm('d'+(gi+1))+
       '<button class="lbx-ghost" onclick="ayComplete('+gi+')">'+glyph('check')+'Save and mark the day done</button>';
  } else {
    if(AY_DAYS[gi].dx) h+='<div class="lbx-split ay-mode" role="radiogroup" aria-label="Equipment">'+
      [['tanpa','Bodyweight'],['dumbbell','Dumbbell']].map(m=>'<button class="'+(ayMode()===m[0]?'on':'')+'" role="radio" aria-checked="'+(ayMode()===m[0])+'" onclick="aySetMode(\''+m[0]+'\','+gi+')">'+m[1]+'</button>').join('')+'</div>';
    h+='<button class="lbx-go" onclick="ayPlay('+gi+')">'+glyph('play')+'Start · '+ayMinutes(d)+' min</button>';
    if(d.k!=='recover') h+='<button class="lbx-ghost" onclick="ayPlay('+gi+',1)">'+glyph('clock')+'Busy day? '+ayMinutes(ayDay(gi,1))+' min</button>';
    h+='<button class="lbx-ghost" onclick="ayComplete('+gi+')">'+glyph('check')+'Mark done without playing</button>';
  }
  h+='<div class="lbx-note"><div class="q">“</div><div><div class="k">Coach&rsquo;s note</div><div class="t">'+ayTip(gi)+'</div></div></div>';
  if(d.k==='recover') h+='<div class="lbx-note leaf"><div class="q">'+glyph('leaf')+'</div><div><div class="k">Recovery day</div><div class="t">Bergerak perlahan dan bernafas. Hari ini badan Ayah jadi lebih kuat.</div></div></div>';
  h+='<div class="lbx-sec"><div class="lbx-sh"><div class="lbx-st">In This Workout</div><div class="lbx-ss">Tap a move to watch it.</div></div></div>'+
    '<div class="lbx-moves">'+exs.map((e,i)=>'<div class="lbx-move" onclick="'+(owned?'ayPlayOne('+i+','+gi+')':'ayBuy()')+'">'+
      '<span class="n">'+(i+1)+'</span><div class="tx"><div class="t">'+e.n+'</div><div class="m">'+e.dur+' sec · '+(e.m||'Full body')+'</div></div>'+
      '<span class="pl">'+glyph(owned?'play':'lock')+'</span></div>').join('')+'</div>';
  const kit=['a mat or towel']; if(d.eq==='Dumbbell') kit.push('dumbbells'); if(d.ex.some(n=>/Wall/.test(n))) kit.push('a wall');
  h+='<div class="lbx-need"><span>'+glyph('mat')+'</span>You need: '+kit.join(', ')+'</div></div>';
  $('dd-body').innerHTML=h;
  hidePanels(); $('daydetail').style.display='block'; $('screen').scrollTop=0;
}
function ayPlay(gi,busy){
  const d=ayDay(gi,busy); if(!d) return;
  if(!ayOwned()) return ayBuy();
  startWorkout(ayExercises(d),{rounds:d.r, name:d.n, ay:{gi}, key:AY30_KEY+'-d'+gi, pid:AY30_ID, gi});
}
function ayPlayOne(i,gi){
  if(!ayOwned()) return ayBuy();
  const d=ayDay(gi); startWorkout([ayExercises(d)[i]],{rounds:1, name:d.ex[i], ay:{gi:-1,back:gi}});
}
function ayAfterSession(m){
  if(m.gi<0) return ayOpenDay(m.back);
  if(AY_DAYS[m.gi].k==='test') return ayOpenDay(m.gi);
  hidePanels(); $('progdetail').style.display='block'; ayTab='plan'; renderAY30(); $('screen').scrollTop=0;
}
function ayComplete(gi){
  HF.markDone(AY30_KEY+'-d'+gi,{name:ayDay(gi).n, mins:ayMinutes(ayDay(gi))});
  if(progDone(AY30_ID)===gi) HF.data.progress[AY30_ID]=gi+1;
  HF.save(); toast('Day done 🔥');
  hidePanels(); $('progdetail').style.display='block'; renderAY30(); $('screen').scrollTop=0;
}

/* ── the body: weight and waist (and her hips) on days 1, 15 and 30 ── */
function ayBodyRows(){ return [['kg','Weight','kg'],['waist','Waist','cm']]; }
function ayBodyForm(n){
  const b=ayData().body[n]||{}, src=ayPhoto(n);
  return '<div class="lb-body"><div class="esfields">'+ayBodyRows().map(m=>
      '<label class="esf"><span>'+m[1]+'</span><input class="inp" inputmode="decimal" placeholder="0" aria-label="'+m[1]+' day '+n+'" value="'+(b[m[0]]||'')+'" '+
        'onchange="aySetBody('+n+',\''+m[0]+'\',this.value)"><em>'+m[2]+'</em></label>').join('')+'</div>'+
    '<label class="wl-ph lb-ph'+(src?' has':'')+'"'+(src?' style="background-image:url(\''+src+'\')"':'')+'>'+
      '<input type="file" accept="image/*" onchange="ayAddPhoto('+n+',this)">'+(src?'':ic('photo'))+'<span>Photo · Day '+n+'</span></label>'+
    '<div class="lb-fine">Gambar disimpan dalam telefon ini sahaja.</div></div>';
}
function ayFitForm(when){
  const f=ayData().fit[when]||{};
  return fsec('Ayah Test Results','Day '+when.slice(1))+'<div class="esfields">'+ayFitList().map(x=>
    '<label class="esf"><span>'+x[1]+'</span><input class="inp" inputmode="numeric" placeholder="0" aria-label="'+x[1]+'" value="'+(f[x[0]]||'')+'" '+
      'onchange="aySetFit(\''+when+'\',\''+x[0]+'\',this.value)"><em>'+x[2]+'</em></label>').join('')+'</div>';
}
function aySetFit(when,k,v){ const w=ayData(); w.fit[when]=w.fit[when]||{}; w.fit[when][k]=parseInt(v,10)||0; w.fit[when].steps=ayStepAvg(); HF.save(); }
function aySetBody(n,k,v){ const w=ayData(); w.body[n]=w.body[n]||{}; w.body[n][k]=parseFloat(v)||0; HF.save(); }
function ayPhotoKey(n){ return 'hf_ay30_photo_'+(HF.userId||'me')+'_'+n; }
function ayPhoto(n){ try{ return localStorage.getItem(ayPhotoKey(n))||''; }catch(e){ return ''; } }
function ayAddPhoto(n,input){
  const f=input&&input.files&&input.files[0]; if(!f) return;
  const r=new FileReader();
  r.onload=()=>{ const im=new Image(); im.onload=()=>{
    const s=Math.min(1,640/Math.max(im.width,im.height)), c=document.createElement('canvas');
    c.width=Math.round(im.width*s); c.height=Math.round(im.height*s);
    c.getContext('2d').drawImage(im,0,0,c.width,c.height);
    try{ localStorage.setItem(ayPhotoKey(n), c.toDataURL('image/jpeg',.72)); toast('Gambar disimpan'); }
    catch(e){ toast('Ruang telefon tidak cukup untuk gambar'); }
    if($('daydetail') && $('daydetail').style.display==='block' && curDay) ayOpenDay(curDay.gi); else renderAY30();
  }; im.src=r.result; };
  r.readAsDataURL(f);
}

/* ── nutrition: the calorie sum (mpNut) for a man, never under 1,500 kcal,
   and MAK2FIT's Malaysian menus at a man's portions (ayDish) ── */
function ayProfile(){
  const n=HF.data.nutrition||{}, pr=ayData().profile||{}, me=ayData().me||{};
  return {age:me.age||pr.age||n.a||0, wt:me.wt||pr.wt||n.w||0, ht:me.ht||pr.ht||n.h||0, gender:'male'};
}
function ayTarget(){
  const pr=ayProfile(); if(!pr.wt||!pr.ht||!pr.age) return null;
  const me=ayMe()||{}, n=mpNut({goal:'loss', rate:ayPaceOf(ayMe()), gender:'male', age:pr.age, wt:pr.wt, ht:pr.ht, activity:AY_ACT[me.act]||1.375, styles:['hiprotein']});
  /* his protein: 1.6 g/kg, what training men's muscle responds to (Nunes et al., 2022), never over 30% of his calories */
  const cal=Math.max(1500,n.cal), prot=Math.round(Math.min(1.6*pr.wt, cal*0.30/4));
  return {cal, prot, carb:Math.max(0,Math.round((cal-prot*4-n.fat*9)/4)), fat:n.fat};
}
function aySaveProfile(){
  const g=x=>parseFloat(($(x)||{}).value);
  const wt=g('wl-wt'), ht=g('wl-ht'), age=parseInt(($('wl-age')||{}).value,10);
  if(!wt||!ht||!age){ toast('Isi berat, tinggi dan umur'); return; }
  ayData().profile={gender:'male', wt, ht, age}; HF.save(); renderAY30();
}
function ayForgetNumbers(){ const d=ayData(); d.profile={gender:'male'}; if(d.me){ delete d.me.wt; delete d.me.ht; delete d.me.age; } HF.save(); renderAY30(); }
/* the three options a meal shows on a day: different every day, never twice */
function ayMenuFor(slot,day){
  const me=ayMe();
  let opts=LB30_MENU[slot].opts.filter(o=>lbOk(o,me));
  if(me && me.cook==='beli' && (slot==='sarapan'||slot==='tengahari')){ const b=opts.filter(o=>o.b); if(b.length>=3) opts=b; }
  const n=opts.length, out=[];
  for(let k=0;k<Math.min(3,n);k++) out.push(opts[(day*3+k+(slot==='petang'?5:0))%n]);
  return out;
}
function aySlots(){ const me=ayMe(); if(me && LB30_MEALS[me.meals]) return LB30_MEALS[me.meals];
  return LB30_SLOTS.map(s=>[s, LB30_MENU[s].share]); }
/* the menu's own notes, for anyone (MAK2FIT's breakfast is "for a working mother") */
const AY_MEAL_NOTE={sarapan:'Cepat, sebelum keluar bekerja'};

/* Learn: the Nutrition Academy, all of it, opened by the program (acLadies, academy.js) */
function ayLearn(){
  if(typeof academyHTML!=='function') return '';
  if(!ayOwned()) return ayLocked('book','Nutrition Academy','Episod video pendek tentang makan cara Malaysia, setiap satu dengan kuiz 3 soalan.');
  return '<div class="lbx-acad">'+academyHTML()+'</div>';
}

/* ── the shopping list: a week's menu (option 1 of each meal) as what to buy ── */
function ayShopItems(wi){
  const w=AY_WEEKS[wi], n={}, sl=aySlots();
  for(let d=w.from-1; d<w.to; d++) sl.forEach(s=>{
    ayDish(ayMenuFor(s[0],d)[0]).it.forEach(x=>{
      const low=' '+String(x).toLowerCase()+' ';
      for(let k=0;k<LB30_SHOP_ING.length;k++) if(low.indexOf(LB30_SHOP_ING[k][0])>=0){ const it=LB30_SHOP_ING[k][1]; n[it]=(n[it]||0)+1; break; }
    });
  });
  return n;
}
function ayShopRe(){ const s=$('screen'), y=s?s.scrollTop:0; renderAY30(); if(s) s.scrollTop=y; }
function ayShopTick(wi,name){ const sh=ayData().shop, k='w'+wi; sh[k]=sh[k]||{}; sh[k][name]=!sh[k][name]; HF.save(); ayShopRe(); }
function ayShopMine(wi){ const sh=ayData().shop, k='x'+wi; sh[k]=sh[k]||[]; return sh[k]; }
function ayShopAdd(wi){
  const el=$('wl-shop-in'), v=String(el&&el.value||'').replace(/\s+/g,' ').trim().slice(0,40), mine=ayShopMine(wi);
  if(!v) return;
  if(mine.some(x=>x.n.toLowerCase()===v.toLowerCase())){ toast('Dah ada dalam senarai'); return; }
  mine.push({n:v, on:false}); HF.save(); ayShopRe();
  const again=$('wl-shop-in'); if(again) again.focus();
}
function ayShopMineTick(wi,i){ const x=ayShopMine(wi)[i]; if(!x) return; x.on=!x.on; HF.save(); ayShopRe(); }
function ayShopMineDel(wi,i){ ayShopMine(wi).splice(i,1); HF.save(); ayShopRe(); }
function ayShopGroups(all){
  return LB30_SHOP_CAT.concat([['Lain-lain','bag','#6B6B6B']]).map((c,ci)=>[c, all.filter(x=>ci<LB30_SHOP_CAT.length ? c[3].indexOf(x)>=0 : !LB30_SHOP_CAT.some(cc=>cc[3].indexOf(x)>=0))]);
}
function ayShopText(wi){
  const n=ayShopItems(wi); let t='Senarai belanja AYAH2FIT 30 · Week '+(wi+1)+'\n';
  ayShopGroups(Object.keys(n)).forEach(g=>{ if(g[1].length) t+='\n'+g[0][0]+':\n'+g[1].map(x=>'• '+x).join('\n')+'\n'; });
  const mine=ayShopMine(wi);
  if(mine.length) t+='\nBarang saya:\n'+mine.map(x=>'• '+x.n).join('\n')+'\n';
  return t;
}
function ayShopping(){
  if(ayShopWeek<0) ayShopWeek=ayWeekOf(Math.min(ayNext(),AY_DAYS.length-1));
  const wi=ayShopWeek, n=ayShopItems(wi), got=(ayData().shop['w'+wi])||{}, all=Object.keys(n).sort((a,b)=>n[b]-n[a]), mine=ayShopMine(wi);
  const have=all.filter(x=>got[x]).length+mine.filter(x=>x.on).length, count=all.length+mine.length;
  let h='<div class="lbx-sec"><div class="lbx-sh"><div class="lbx-st">Shopping List</div><div class="lbx-ss">Dari menu minggu ini, dan apa saja yang Ayah tambah. Tanda bila dah beli.</div></div></div>';
  h+='<div class="lbx-card lbx-shop"><div class="lbx-shop-w">'+AY_WEEKS.map((x,i)=>'<button class="'+(i===wi?'on':'')+'" onclick="ayShopWeek='+i+';ayShopRe()">Week '+(i+1)+'</button>').join('')+'</div>'+
    '<div class="lbx-shop-p"><div class="bar"><i style="width:'+(count?Math.round(have/count*100):0)+'%"></i></div><span>'+have+' / '+count+' dibeli</span></div>';
  h+='<div class="lbx-shop-c lbx-shop-mine" style="--mc:var(--lr)"><div class="h"><span class="ic">'+glyph('pencil')+'</span><b>Barang Saya</b><span>'+(mine.length||'')+'</span></div>'+
    '<form class="lbx-shop-add" onsubmit="event.preventDefault();ayShopAdd('+wi+')"><input id="wl-shop-in" class="inp" maxlength="40" placeholder="Tambah barang, cth. kicap, susu" aria-label="Tambah barang">'+
    '<button type="submit" aria-label="Tambah">'+glyph('plus')+'</button></form>'+
    mine.map((x,i)=>'<div class="lbx-shop-i mine'+(x.on?' on':'')+'" role="button" onclick="ayShopMineTick('+wi+','+i+')"><span class="b">'+(x.on?glyph('check'):'')+'</span>'+
      '<span class="n">'+hesc(x.n)+'</span><button class="del" aria-label="Buang '+hesc(x.n)+'" onclick="event.stopPropagation();ayShopMineDel('+wi+','+i+')">×</button></div>').join('')+'</div>';
  ayShopGroups(all).forEach(g=>{
    const c=g[0], names=g[1]; if(!names.length) return;
    h+='<div class="lbx-shop-c" style="--mc:'+c[2]+'"><div class="h"><span class="ic">'+glyph(c[1])+'</span><b>'+c[0]+'</b><span>'+names.length+'</span></div>'+
      names.map(x=>{ const on=!!got[x]; return '<button class="lbx-shop-i'+(on?' on':'')+'" onclick="ayShopTick('+wi+',\''+x.replace(/'/g,"\\'")+'\')"><span class="b">'+(on?glyph('check'):'')+'</span><span class="n">'+x+'</span><span class="q">'+n[x]+'× hidangan</span></button>'; }).join('')+'</div>';
  });
  h+='<a class="lbx-ghost lbx-shop-wa" href="https://wa.me/?text='+encodeURIComponent(ayShopText(wi))+'" target="_blank" rel="noopener">'+glyph('share')+'Hantar senarai ke WhatsApp</a></div>';
  return h;
}

function ayFood(){
  if(!ayOwned()) return ayLocked('food','Calorie target & 30-day menu',
    'Sasaran harian dari berat, tinggi dan umur Ayah, masakan Malaysia, tiga pilihan setiap waktu makan, '+
    'senarai belanja setiap minggu, dan satu misi pemakanan setiap hari.');
  const t=ayTarget();
  let h='';
  if(!t){
    const pr=ayProfile();
    const fld=(id,l,u,v,m)=>'<label class="esf"><span>'+l+'</span><input class="inp" id="'+id+'" inputmode="'+m+'" placeholder="0" value="'+(v||'')+'"><em>'+u+'</em></label>';
    return fsec('Your Calorie Target','Tiga jawapan, dan ia dikira sendiri.')+
      '<div class="esfields">'+fld('wl-wt','Weight','kg',pr.wt,'decimal')+fld('wl-ht','Height','cm',pr.ht,'decimal')+fld('wl-age','Age','yrs',pr.age,'numeric')+'</div>'+
      '<button class="lbx-go" onclick="aySaveProfile()">Work Out My Target</button>'+
      (!ayMe()?'<button class="lbx-ghost" onclick="ayQuizOpen()">'+glyph('sliders')+'Atau bina pelan penuh saya</button>':'');
  }
  const tot=AY_DAYS.length;
  if(ayMenuDay<0) ayMenuDay=Math.min(ayNext(),tot-1);
  h+='<div class="lbx-fseg">'+[['today','Today','food'],['shop','Shopping','bag'],['guide','Guide','leaf']].map(x=>
    '<button class="'+(ayFoodSeg===x[0]?'on':'')+'" onclick="aySetFoodSeg(\''+x[0]+'\')">'+glyph(x[2])+x[1]+'</button>').join('')+'</div>';
  if(ayFoodSeg==='shop') return h+ayShopping();
  if(ayFoodSeg==='guide') return h+ayFoodGuide();
  const me=ayMe();
  h+='<div class="nstage wl-stage lb-stage sm"><span class="wl-st-gly">'+glyph('flame')+'</span><div class="nstage-k">Your daily target</div>'+
    '<div class="nstage-n">'+t.cal.toLocaleString()+'<span> kcal</span></div>'+
    '<div class="nstage-s">Lebih kurang '+ayPace()+' kg seminggu · tidak pernah bawah 1,500 kcal</div>'+
    '<div class="nstage-g">'+[[t.prot+'g','Protein'],[t.carb+'g','Carbs'],[t.fat+'g','Fat'],[ayWater(ayMenuDay).toFixed(1)+' L','Water']]
      .map(x=>'<div><b>'+x[0]+'</b><span>'+x[1]+'</span></div>').join('')+'</div></div>';
  h+='<div class="lbx-misi"><span class="b">'+glyph('target')+'</span><div><div class="k">Nutrition mission · Day '+(ayMenuDay+1)+'</div><div class="t">'+ayMisi(ayMenuDay)+'</div></div></div>';
  if(!me) h+='<div class="lbx-card lbq-invite"><div class="lbx-k">Your own menu</div>'+
    '<div class="lbx-h">Menu ikut cara Ayah makan.</div><div class="lbx-p">Berapa kali makan sehari, apa yang Ayah tak makan, siapa yang masak — dalam pelan Ayah.</div>'+
    '<button class="lbx-go" onclick="ayQuizOpen()">'+glyph('sliders')+'Bina Pelan Saya</button></div>';
  h+='<div class="lbx-sec"><div class="lbx-sh"><div class="lbx-st">Today&rsquo;s Menu</div><div class="lbx-ss">Day '+(ayMenuDay+1)+' · '+aySlots().length+' kali makan, tiga pilihan setiap satu</div></div></div>';
  h+='<div class="hscroll wl-mdays lbx-mdays">'+AY_DAYS.map((d,i)=>
    '<button class="wl-md'+(i===ayMenuDay?' on':'')+'" onclick="ayMenuDay='+i+';renderAY30()"><small>Day</small><b>'+(i+1)+'</b></button>').join('')+'</div>';
  const look={sarapan:['sunrise','var(--lr)'],pagi:['leaf','var(--lr)'],tengahari:['sun','var(--lr)'],petang:['clock','var(--lr)'],malam:['moon','var(--lr)'],lewat:['moon','var(--lr)']};
  const cook=me&&me.cook;
  h+='<div class="lbx-meals">'+aySlots().map((sl,si)=>{
    const slot=sl[0], s=LB30_MENU[slot], kc=Math.round(t.cal*sl[1]), opts=ayMenuFor(slot,ayMenuDay), sid='wlm-'+ayMenuDay+'-'+si, lk=look[slot]||['food','var(--lr)'];
    const label=slot==='tengahari'&&cook&&cook!=='sendiri'?'Lunch':slot==='malam'&&cook==='beli'?'Dinner':s.label;
    const note=slot==='tengahari'&&cook==='beli'?'Pilihan yang mudah dibeli di kedai dan warung':slot==='malam'&&cook==='keluarga'?'Masak sekali untuk seisi rumah, ambil bahagian Ayah':(AY_MEAL_NOTE[slot]||s.note);
    return '<div class="mpslot lbx-meal" id="'+sid+'" style="--mc:'+lk[1]+'"><div class="mpslot-h"><span class="ic">'+glyph(lk[0])+'</span>'+
      '<div class="hd"><div class="t">'+label+'</div><div class="m">'+s.time+' · ~'+kc+' kcal</div></div>'+
      '<div class="mpopts">'+opts.map((o,oi)=>'<button class="mpo'+(oi===0?' on':'')+'" aria-label="Option '+(oi+1)+'" onclick="mpOpt(\''+sid+'\','+oi+')">'+(oi+1)+'</button>').join('')+'</div></div>'+
      opts.map((o,oi)=>{ const ds=ayDish(o,kc), im=lbDishImg(slot,o); return '<div class="mpopt" style="display:'+(oi===0?'block':'none')+';"><div class="lbx-mo">'+
        (im?'<div class="lbx-dish sm" style="background-image:url(\''+im+'\')"></div>':'<div></div>')+
        '<div class="tx"><div class="mpopt-h"><div class="t">'+o.n+'</div><div class="k">'+ds.k+' kcal</div></div>'+
        (ds.r!==null&&me?'<div class="lbx-rice">'+glyph('food')+'Nasi: <b>'+lbFist(ds.r)+'</b></div>':'')+
        '<div class="lbx-items">'+ds.it.map(it=>'<span>'+it+'</span>').join('')+'</div></div>'+
      '</div></div>'; }).join('')+'<div class="lbx-meal-f"><div class="lbx-meal-n">'+note+'</div>'+
      '<button class="lbx-mscan" onclick="lbScanGo()">'+glyph('photo')+'Scan</button></div></div>';
  }).join('')+'</div>';
  return h;
}
/* the guide: the healthy plate, the hands, swaps, eating out */
function ayFoodGuide(){
  let h='<div class="lbx-sec"><div class="lbx-sh"><div class="lbx-st">Pinggan Sihat</div><div class="lbx-ss">Suku-Suku-Separuh, KKM. Tak perlu penimbang.</div></div></div>';
  h+='<div class="lbx-card lbx-plate">'+lbPlateSVG()+'<div class="lbx-plate-k">'+
    [['#1F9D6A','Sayur','½ pinggan · 2 genggam'],['#D4AF7C','Protein','¼ pinggan · 2 tapak tangan'],['#E08A00','Karbo','¼ pinggan · 2 genggam'],['#C9A227','Lemak','2 ibu jari']]
    .map(x=>'<div><i style="background:'+x[0]+'"></i><b>'+x[1]+'</b><span>'+x[2]+'</span></div>').join('')+'</div></div>';
  /* a man's portions: two palms of protein, two fists of carbs (Precision Nutrition's hand guide) */
  const m=true;
  h+='<div class="lbx-por">'+[['food','Protein',m?'2':'1','tapak tangan','ayam, ikan, telur, tauhu, tempe','#D4AF7C'],
      ['workout','Carbs',m?'2':'1','genggam','nasi, mi, roti','#E08A00'],
      ['leaf','Veg','2','genggam','separuh pinggan','#1F9D6A'],
      ['water','Fat',m?'2':'1','ibu jari','minyak, santan, kuah','#B7791F']]
    .map(x=>'<div class="lbx-po" style="--pc:'+x[5]+'"><div class="lbx-po-top"><span class="ic">'+glyph(x[0])+'</span><span class="k">'+x[1]+'</span></div>'+
      '<div class="lbx-po-n"><b>'+x[2]+'</b><span>'+x[3]+'</span></div><div class="lbx-po-s">'+x[4]+'</div></div>').join('')+'</div>';
  h+='<div class="lbx-sec"><div class="lbx-sh"><div class="lbx-st">Smart Swaps</div><div class="lbx-ss">Tukar satu, rasa bezanya.</div></div></div>';
  h+='<div class="lbx-swaps">'+[['Teh tarik','Teh o kosong','Perubahan tunggal paling besar untuk kebanyakan orang.'],
    ['Ayam goreng','Ayam panggang','Ayam yang sama, minyak jauh kurang.'],
    ['Mi goreng','Mi sup','Versi sup, setiap kali boleh.'],
    ['Air tin bergula','Air kosong atau zero','Satu tin, kira-kira 7 sudu teh gula.'],
    ['Tambah kali kedua','Segelas air','Tunggu 10 minit. Rasa kenyang sampai lewat.']]
    .map(x=>'<div class="lbx-sw"><div class="lbx-sw-r"><span class="from">'+x[0]+'</span><span class="arr">→</span><span class="to">'+x[1]+'</span></div><div class="lbx-sw-s">'+x[2]+'</div></div>').join('')+'</div>';
  h+='<div class="lbx-sec"><div class="lbx-sh"><div class="lbx-st">Khas Untuk Ayah</div><div class="lbx-ss">Tiga nombor yang patut Ayah tahu.</div></div></div>';
  h+='<div class="lbx-out">'+[
    ['measure','#D4AF7C','Pinggang bawah 90 cm',['Lelaki 90 cm ke atas, risiko kesihatan lebih tinggi','Ukur pagi, di paras pusat']],
    ['food','#1F9D6A','2 tapak tangan protein',['Setiap kali makan: ayam, ikan, telur, tauhu','Bantu kekalkan otot masa berat turun']],
    ['heart','#E08A00','Kurang masin, kurang manis',['Kicap, budu, sambal ikut sukat','Air manis paling mudah dikurangkan']]]
    .map(x=>'<div class="lbx-oc" style="--mc:'+x[1]+'"><div class="h"><span class="ic">'+glyph(x[0])+'</span><b>'+x[2]+'</b></div>'+
      x[3].map(o=>'<div class="o">'+glyph('check')+'<span>'+o+'</span></div>').join('')+'</div>').join('')+'</div>';
  h+='<div class="lbx-sec"><div class="lbx-sh"><div class="lbx-st">Eating Out</div><div class="lbx-ss">Choose this, cut back on that.</div></div></div>';
  h+='<div class="lbx-split ay-mode">'+[['malaysia','Malaysia'],['kelantan','Kelantan']].map(m2=>'<button class="'+(ayPing===m2[0]?'on':'')+'" onclick="ayPing=\''+m2[0]+'\';ayShopRe()">'+m2[1]+'</button>').join('')+'</div>';
  h+='<div class="ay-pg">'+AY_PINGGAN[ayPing].map(c=>'<div class="lbx-card"><b class="t">'+c[0]+'</b>'+
    '<div class="r ok"><span>Choose</span>'+c[1].map(x=>'<div>'+glyph('check')+x+'</div>').join('')+'</div>'+
    '<div class="r no"><span>Cut back</span>'+c[2].map(x=>'<div>'+glyph('minus')+x+'</div>').join('')+'</div></div>').join('')+'</div>';
  if(typeof AC_EPS!=='undefined') h+='<div class="lbx-row" onclick="aySetTab(\'learn\')"><span class="b">'+glyph('play')+'</span><div class="tx"><div class="t">Nutrition Academy</div><div class="m">'+AC_EPS.length+' episod · full access with AYAH2FIT 30</div></div><span class="pdx-chev">›</span></div>';
  h+='<button class="authalt" onclick="ayForgetNumbers()">Change my numbers</button>';
  return h;
}

/* ── progress: days, the leaderboard, the body, photos, the fit test, badges ── */
function ayProgress(){
  if(!ayOwned()) return ayLocked('chart','See yourself change',
    'Berat dan pinggang pada Hari 1, 15 dan 30, gambar, dan Ayah Test Hari 1 berbanding Hari 30.');
  const w=ayData(), done=ayDone(), tot=AY_DAYS.length;
  let mins=0; Object.keys(HF.data.sessions).forEach(k=>{ if(k.indexOf(AY30_KEY+'-')===0) mins+=(HF.data.sessions[k].mins||0); });
  let h='<div class="lbx-card lbx-pstat">'+lbRing(done/tot,92,done+'<i>/'+tot+'</i>','days')+
    '<div class="lbx-pstat-r"><div class="lbx-chip fl"><span class="ic">'+glyph('flame')+'</span><div><b>'+liveStreak()+'</b><span>Day streak</span></div></div>'+
    '<div class="lbx-chip cl"><span class="ic">'+glyph('clock')+'</span><div><b>'+Math.round(mins)+'</b><span>Minutes trained</span></div></div></div></div>';
  if(done>=tot) h+=ayGrad();
  /* the body, day 1 / 15 / 30: the check-in due next is lit */
  const nextCi=AY_CHECKINS.filter(n=>done<n)[0]||30, icons={kg:'scale',waist:'measure'}, rows=ayBodyRows();
  h+='<div class="lbx-sec"><div class="lbx-sh"><div class="lbx-st">Body Check-in</div><div class="lbx-ss">Pagi, sebelum sarapan · next on Day '+nextCi+'. Sasaran pinggang bawah 90 cm.</div></div></div>';
  h+='<div class="lbx-card lbx-body"><div class="lbx-bh"><span></span>'+AY_CHECKINS.map(n=>'<b class="'+(n===nextCi?'on':'')+'">Day '+n+'</b>').join('')+'</div>'+
    rows.map(m=>'<div class="lbx-br"><span class="lab"><span class="ic">'+glyph(icons[m[0]]||'measure')+'</span><span>'+m[1]+'<small>'+m[2]+'</small></span></span>'+
      AY_CHECKINS.map(n=>{ const v=(w.body[n]||{})[m[0]]||''; return '<input class="'+(v?'has':'')+(n===nextCi?' on':'')+'" inputmode="decimal" placeholder="–" aria-label="'+m[1]+' day '+n+'" value="'+v+'" onchange="aySetBody('+n+',\''+m[0]+'\',this.value);renderAY30()">'; }).join('')+'</div>').join('')+
    '</div>';
  const b1=w.body[1]||{}, bl=(w.body[30]&&w.body[30].kg)?w.body[30]:(w.body[15]||{});
  if(b1.kg&&bl.kg){
    const chip=(lab,a,b,u)=>{ const d=Math.round((b-a)*10)/10; return '<div class="lbx-dl '+(d<0?'dn':d>0?'up':'')+'"><b>'+(d>0?'+':'')+d+' '+u+'</b><span>'+lab+'</span></div>'; };
    h+='<div class="lbx-deltas">'+chip('Weight',b1.kg,bl.kg,'kg')+(b1.waist&&bl.waist?chip('Waist',b1.waist,bl.waist,'cm'):'')+'</div>';
  }
  h+='<div class="lbx-sec"><div class="lbx-sh"><div class="lbx-st">Progress Photos</div><div class="lbx-ss">Disimpan dalam telefon ini sahaja.</div></div></div>';
  h+='<div class="lbx-photos">'+AY_CHECKINS.map(n=>{
    const src=ayPhoto(n);
    return '<label class="lbx-ph'+(src?' has':'')+(n===nextCi&&!src?' on':'')+'"'+(src?' style="background-image:url(\''+src+'\')"':'')+'>'+
      '<input type="file" accept="image/*" onchange="ayAddPhoto('+n+',this)">'+
      (src?'':'<span class="ic">'+glyph('photo')+'</span><span class="add">Add photo</span>')+'<span class="d">Day '+n+'</span></label>';
  }).join('')+'</div>';
  h+='<div class="lbx-sec"><div class="lbx-sh"><div class="lbx-st">Ayah Test</div><div class="lbx-ss">Day 1, Day 15, Day 30.</div></div></div>';
  h+='<div class="lbx-card lbx-fit ay-fit"><div class="lbx-fh"><span></span><b>D1</b><b>D15</b><b>D30</b><b>Change</b></div>'+
    ayFitList().map(f=>{
      const v=['d1','d15','d30'].map(k=>+(w.fit[k]||{})[f[0]]||0), seen=v.filter(Boolean), ch=seen.length>1?Math.round((seen[seen.length-1]-seen[0])/seen[0]*100):null;
      return '<div class="lbx-fr"><span class="lab">'+f[1]+'<small>'+f[2]+'</small></span>'+['d1','d15','d30'].map((k,i)=>
        '<input class="'+(v[i]?'has':'')+'" inputmode="numeric" placeholder="–" aria-label="'+f[1]+' '+k+'" value="'+(v[i]||'')+'" onchange="aySetFit(\''+k+'\',\''+f[0]+'\',this.value);renderAY30()">').join('')+
        '<span class="ch '+(ch>0?'up':ch<0?'dn':'')+'">'+(ch===null?'—':(ch>0?'+':'')+ch+'%')+'</span></div>';
    }).join('')+'</div>';
  h+='<div class="lbx-sec"><div class="lbx-sh"><div class="lbx-st">Badges</div><div class="lbx-ss">Satu untuk setiap minggu yang Ayah tamatkan.</div></div></div>';
  const wicons=['sunrise','workout','flame','trophy'];
  h+='<div class="lbx-medals">'+AY_WEEKS.map((x,i)=>{
    const got=done>=x.to, part=Math.max(0,Math.min(1,(done-(x.from-1))/(x.to-x.from+1)));
    return '<div class="lbx-medal'+(got?' on':'')+'"><div class="m" style="--p:'+Math.round(part*100)+'%"><span>'+glyph(got?wicons[i]:'lock')+'</span></div>'+
      '<b>'+x.n+'</b><small>'+(got?'Earned':'Day '+x.to)+'</small></div>';
  }).join('')+'</div>';
  return h;
}
function ayShare(){
  const t='Saya baru tamatkan AYAH2FIT 30: 30 hari di rumah.';
  try{ if(navigator.share){ navigator.share({title:'AYAH2FIT 30 Complete', text:t, url:'https://app.hitfat.io'}); return; } }catch(e){}
  try{ navigator.clipboard.writeText(t+' https://app.hitfat.io'); toast('Disalin'); }catch(e){ toast(t); }
}

/* Graduation: the certificate, the report card, and who wants what comes next */
function ayGrad(){
  const w=ayData(), f1=w.fit.d1||{}, f30=w.fit.d30||{}, b1=w.body[1]||{}, b30=w.body[30]||{}, nm=hesc(((HF.data.prefs&&HF.data.prefs.name)||'Ayah').trim());
  const rows=[['Waist (cm)',b1.waist,b30.waist]].concat(ayFitList().map(f=>[f[1]+' ('+f[2]+')',f1[f[0]],f30[f[0]]]));
  if(f1.steps||f30.steps) rows.push(['Avg steps',f1.steps,f30.steps]);
  return '<div class="ay-cert"><img src="'+AY30_LOGO+'" alt="AYAH2FIT 30"><div class="k">COMPLETE</div><div class="t">'+nm+'</div>'+
    '<div class="s">30 hari, habis. Bukan senang, dan Ayah buat juga.</div>'+
    '<div class="ay-rep"><div class="h"><span></span><b>Day 1</b><b>Day 30</b></div>'+rows.map(r=>'<div><span>'+r[0]+'</span><b>'+(r[1]||'–')+'</b><b>'+(r[2]||'–')+'</b></div>').join('')+'</div>'+
    '<button class="lbx-go" onclick="ayShare()">'+glyph('share')+'Share It</button>'+
    (ayData().minat?'<div class="ay-min">'+glyph('check')+'You&rsquo;re on the list. Kami beritahu bila siap.</div>':
      '<button class="lbx-ghost" onclick="ayMinat()">'+glyph('star')+'Join the waitlist for the next program</button>')+'</div>';
}
function ayMinat(){
  ayData().minat=iso(0); HF.save();
  try{ if(sb&&HF.userId){ const r=sb.rpc('plus_track',{p_items:[{n:'ay30_minat',t:new Date().toISOString()}]}); if(r&&r.then) r.then(null,function(){}); } }catch(e){}
  toast('Terima kasih, Ayah'); renderAY30();
}

/* ── start here ── */
function ayGuide(){
  let h='<div class="lb-safe">'+ic('warning')+'<div><div class="t">Before you start</div><div class="s">Darah tinggi, kencing manis, sakit dada, masalah jantung atau baru lepas pembedahan: '+
    'jumpa doktor dulu. Sakit dada, pening atau sesak nafas masa bersenam: berhenti terus dan dapatkan bantuan.</div></div></div>';
  h+=fsec('How It Works','')+'<div class="wl-steps">'+[
    ['Bina pelan Ayah','Soalan ringkas, 2 minit. Gerakan, minit dan kalori ikut Ayah.'],
    ['Day 1: check-in, then the Ayah Test','Berat dan pinggang dulu, kemudian push-up, squat dan plank.'],
    ['One workout a day','40 saat kerja, 20 saat rehat. Sibuk? Pilih 12 minit, hari tetap dikira.'],
    ['Daily checklist','Workout, langkah, air, misi pemakanan, makan ikut pelan, tidur dan lesson.'],
    ['Day 15 and Day 30','Ulang Ayah Test dan tengok beza di Progress.']]
    .map((s,i)=>'<div class="wl-step"><span class="n">'+(i+1)+'</span><div><div class="t">'+s[0]+'</div><div class="m">'+s[1]+'</div></div></div>').join('')+'</div>';
  h+=fsec('What You Need','Tiada apa yang perlu dibeli.')+'<div class="wl-kit">'+[['mat','Tikar atau tuala'],['workout','Sepasang dumbbell, jika ada'],['clock','12–24 minit sehari']]
    .map(k=>'<div><span class="wl-kic">'+glyph(k[0])+'</span><span>'+k[1]+'</span></div>').join('')+'</div>';
  h+=fsec('Four Weeks','')+'<div class="wl-phases">'+AY_WEEKS.map((p,i)=>'<div><b>Week '+(i+1)+': '+p.n+'</b><span>Days '+p.from+'–'+p.to+'</span><small>'+p.s+'</small></div>').join('')+'</div>';
  h+=fsec('Questions','')+'<div class="wl-faq">'+[
    ['Saya tertinggal sehari.','Teruskan dari hari Ayah sekarang. Tiga puluh sesi matlamatnya, bukan tiga puluh tarikh berturut-turut.'],
    ['Terlalu susah.','Pilih Busy day 12 minit, atau ubah jawapan kepada Asas. Habis perlahan lebih baik daripada berhenti.'],
    ['Berapa lama saya boleh simpan?','Selamanya. Bayar sekali, tiada langganan.']]
    .map(q=>'<details><summary>'+q[0]+'<span class="wl-qc">'+glyph('plus')+'</span></summary><div>'+q[1]+'</div></details>').join('')+'</div>';
  return h;
}

/* what a tab looks like before the program is bought */
function ayLocked(icon,title,text){
  return '<div class="wl-lock">'+ic(icon)+'<div class="t">'+title+'</div><div class="s">'+text+'</div>'+
    '<button class="lbx-go" onclick="ayBuy()">Get the Program · RM'+AY30_PRICE+'</button></div>';
}


/* ── buying it ── */
function ayBuy(){
  if(ayOwned()) return openProgram(AY30_ID);
  $('pw-body').innerHTML='<div class="pwtop"><span></span><button class="pwx" aria-label="Close" onclick="closeProduct()">✕</button></div>'+
    '<div class="ay-buy"><img src="'+AY30_LOGO+'" alt="AYAH2FIT 30"><span>30 DAYS · AT HOME · BUILT FOR DADS</span></div>'+
    '<div class="pwlist">'+[
      ['sliders','Your own plan','Tahap, kerja, alat dan badan Ayah'],
      ['workout','30 days at home','Tanpa lompat, tanpa alat atau dengan dumbbell, video setiap gerakan'],
      ['clock','12 minutes on busy days','Hari tetap dikira'],
      ['food','Calorie target & Malaysian menu','Tiga pilihan setiap waktu makan, senarai belanja setiap minggu'],
      ['book','Nutrition Academy','Semua episod terbuka'],
      ['chart','Ayah Test & check-ins','Hari 1, 15 dan 30, dalam nombor'],
      ['trophy','Yours for good','Bayar sekali. Tiada langganan']]
      .map(b=>'<div class="pwf"><div class="ic"><span class="wl-kic">'+glyph(b[0])+'</span></div><div><div class="t">'+b[1]+'</div><div class="m">'+b[2]+'</div></div></div>').join('')+'</div>'+
    '<div class="pwprice"><div class="p">RM'+AY30_PRICE+'</div><div class="per">one payment</div></div>'+
    '<button class="bigbtn" onclick="startCheckout(\'prog_'+AY30_ID+'\')">Buy for RM'+AY30_PRICE+'</button>'+
    '<button class="authalt" onclick="openPaywall(\'AYAH2FIT 30 is included in HITFAT+.\')">Or get everything with HITFAT+</button>';
  $('pwm').classList.add('on');
  try{ $('pwm').scrollTop=0; }catch(e){}
}
function ayHomeCard(){
  ayEnsure(); if(!ayLive()) return '';
  const owned=ayOwned(), done=ayDone(), tot=AY_DAYS.length, nx=ayNext();
  if((owned && nx>=tot) || typeof hpoCard!=='function') return '';
  if(owned && done) return hpoCard(AY30,{wide:true,kick:'Day '+(nx+1)+' · '+ayMinutes(ayDay(nx))+' min',go:'ayOpenDay('+nx+')'});
  if(owned) return hpoCard(AY30,{wide:true,kick:'New · Ready when you are',go:"openProgram('"+AY30_ID+"')"});
  return hpoCard(AY30,{wide:true,kick:'New Program · RM'+AY30_PRICE,go:"openProgram('"+AY30_ID+"')"});
}

const AY_LESSON=[
  ['Kenapa mula hari ini','Bukan sebab nak nampak lain. Sebab anak perlukan ayah yang larat, dan badan Ayah makin susah kalau ditangguh.'],
  ['Bentuk dulu, laju kemudian','Gerakan yang betul jaga lutut dan belakang. Perlahan pun tak apa. Laju datang sendiri.'],
  ['Tidur itu latihan','Otot pulih masa tidur. Cuba tidur awal 30 minit daripada semalam. Telefon letak jauh dari katil.'],
  ['Air kosong dulu','Sebelum kopi pagi, minum segelas air. Mudah, murah, dan badan rasa lain.'],
  ['8,000 langkah, cara senang','Parking jauh sikit. Jalan masa call. Bawa anak jalan lepas Maghrib. Ia terkumpul sendiri.'],
  ['Protein setiap kali makan','Ayam, ikan, telur, tauhu. Dua tapak tangan sekali makan. Ia bantu Ayah kenyang lebih lama.'],
  ['Rehat bukan malas','Hari pulih buat kerja penting. Otot jadi kuat masa rehat, bukan masa berpeluh.'],
  ['Minggu pertama siap','Ramai berhenti sebelum sampai sini. Ayah tak. Cerita pada isteri atau kawan, supaya ada yang tanya esok.'],
  ['Teh tarik, satu sehari','Tak perlu buang terus. Satu gelas sehari lebih mudah dikekalkan daripada janji besar.'],
  ['Bawa bekal sekali seminggu','Mula sekali saja. Bekal semalam pun jadi. Satu hari kurang fikir nak makan apa.'],
  ['Kerja syif atau balik lewat','Latih bila bangun, bukan ikut jam orang. Yang penting tiap hari ada satu sesi, walau 12 minit.'],
  ['Duduk lama','Setiap jam, bangun dua minit. Regang pinggang, jalan ke pantri. Belakang akan berterima kasih.'],
  ['Lepak mamak, cara Ayah','Lepak tetap lepak. Pilih teh o, roti kosong satu, telur separuh masak. Kawan pun tak perasan.'],
  ['Stres kerja','Sepuluh minit bergerak selalunya lebih menenangkan daripada skrol telefon. Cuba bila balik kerja.'],
  ['Separuh jalan','Hari ini Ayah Test kedua. Jangan banding dengan orang. Banding dengan Ayah pada Hari 1.'],
  ['Nasi tak salah','Yang penting berapa banyak. Dua genggam, separuh pinggan sayur. Tak perlu tinggal nasi.'],
  ['Pinggang lebih jujur','Berat naik turun ikut air. Lilit pinggang lebih bagus untuk tengok perubahan, dan ia berkait dengan kesihatan jantung.'],
  ['Periksa kesihatan','Bila kali terakhir periksa darah, gula dan kolesterol? Klinik dekat rumah boleh buat. Tandakan satu tarikh.'],
  ['Merokok','Kalau merokok, kurangkan sebatang dulu. Bila bersedia, klinik kesihatan boleh bantu Ayah berhenti.'],
  ['Main dengan anak','Kejar-kejar di laman pun bergerak juga. Anak ingat masa itu lebih lama daripada hadiah.'],
  ['Hujung minggu','Hari biasa elok, hujung minggu lari. Pilih satu hidangan bebas, bukan dua hari bebas.'],
  ['Hari susah akan datang','Akan ada hari tak larat. Pada hari itu, 12 minit lebih baik daripada kosong. Jangan putus rantai.'],
  ['Minum manis di rumah','Kalau sirap selalu ada dalam peti, ia akan diminum. Ganti dengan air kosong sejuk dan limau.'],
  ['Jaga lutut','Lutut ikut arah jari kaki masa squat. Kalau sakit sendi, tukar gerakan. Otot penat lain, sendi sakit lain.'],
  ['Tidur dan selera','Kurang tidur buat kita lapar benda manis. Bila terasa nak makan malam-malam, tanya: penat atau lapar?'],
  ['Ajak seorang','Cari seorang kawan atau abang ipar buat sama. Lebih susah berhenti bila ada orang tengok.'],
  ['Puasa dan senaman','Kalau berpuasa, latih dekat waktu berbuka atau lepas makan malam. Pilih 12 minit, dan minum cukup lepas berbuka.'],
  ['Selepas 30 hari','Rutin kecil yang kekal lebih baik daripada program besar yang berhenti. Pilih dua tabiat untuk bawa terus.'],
  ['Esok Ayah Test','Tidur cukup malam ini. Esok buat macam Hari 1: kira jujur, pinggang ukur tempat sama.'],
  ['Ayah dah buat','Tiga puluh hari. Tengok balik angka Ayah. Yang lebih penting, anak nampak Ayah tak berhenti.']
];


/* Eating Out: what to pick, what to cut back */
const AY_PINGGAN={
  malaysia:[
    ['Nasi Lemak',['Nasi separuh, tambah telur atau ayam','Timun dan kacang sikit'],['Sambal berminyak banyak-banyak','Tambah nasi']],
    ['Roti Canai',['Satu keping, kuah dal','Tambah telur rebus atau teh o'],['Dua tiga keping sekali duduk','Kuah kari pekat']],
    ['Nasi Campur',['Sayur dulu, separuh pinggan','Ikan atau ayam bakar'],['Lauk bergoreng semua sekali','Kuah santan banjir']],
    ['Nasi Kandar',['Ayam bakar, sayur, kuah sikit','Nasi sepenggal genggam'],['Banjir semua kuah','Telur sotong goreng tepung']],
    ['Mi Goreng Mamak',['Mi sup, kalau ada','Tambah telur atau ayam, minta sayur'],['Sepinggan penuh dengan air manis','Minyak lebih']],
    ['Teh Tarik',['Teh o kosong atau kurang manis','Sekali sehari, kalau nak juga'],['Tiga gelas sehari','Tambah kuih setiap kali lepak']]],
  kelantan:[
    ['Nasi Kerabu',['Ulam banyak, ikan bakar','Budu sikit'],['Keropok dan solok lada goreng','Tambah nasi']],
    ['Nasi Dagang',['Ikan tongkol, nasi separuh','Timun acar'],['Kuah gulai banyak','Tambah nasi']],
    ['Nasi Berlauk',['Ikan atau ayam, sayur','Nasi segenggam dua'],['Lauk berminyak dua tiga jenis','Kuah santan banyak']]]
};
