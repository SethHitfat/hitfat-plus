/* ═══════════════ AYAH2FIT 30 ═══════════════
   2 Nov 2026 (Seth: "tukar burn30 kepada ayah2fit", "ok semua"): thirty days
   at home for Malaysian dads, RM39 once, in navy and champagne gold. It takes
   BURN30's place on sale; BURN30 stays for whoever started it (wl30.js).

   Its own: casual Malay, no jumps (a sleeping child, the neighbours), 40 on
   20 off, a 12-minute version of every day that still counts, a Tanpa alat /
   Dumbbell switch, the Ayah Test on days 1, 15 and 30, Pinggan Ayah with no
   calorie counting, and a certificate on Day 30.

   Phase 2, not here: Geng (six dads ranked by consistency) and prayer times.
   Borrowed at run time from MAK2FIT and BURN30: lbRing, lbPlateSVG, the .lbx
   and .lbq styles (dressed by .ay in design.css).                         */

const AY30_ID='ay30', AY30_PRICE=39, AY30_KEY='ay30';
const AY30_NAME='AYAH2FIT 30', AY30_SUB='30 Hari Di Rumah · Khas Ayah';
const AY30_PH='/img/p/ayah/', AY30_LOGO='/img/p/ayah/logo-w.png';
const AY_STEPS=8000;

const AY_WEEKS=[
  {n:'Asas', s:'Belajar gerakan, bina rutin. Tiga pusingan sehari.', from:1,  to:7},
  {n:'Bina', s:'Empat pusingan sekarang. Gerakan sama, kerja lebih.',  from:8,  to:14},
  {n:'Kuat', s:'Selepas Ayah Test kedua. Saat kerja naik sikit.',      from:15, to:21},
  {n:'Tamat',s:'Sembilan hari terakhir, kemudian Ayah Test penutup.',  from:22, to:30}
];
/* each kind of day: ex without equipment, dx with dumbbells (no jumps in either) */
const AY_T={
  full:{n:'Badan Penuh',k:'train',
    ex:['Bodyweight Squat','Knee Push Ups','Reverse Lunges','Bird Dog','Hip Thrust','Mountain Climber'],
    dx:['Normal Squat','Chest Press','ALT Lunges','RDL','ALT Shoulder Press','Plank Taps']},
  kaki:{n:'Kaki Ayah',k:'lower',
    ex:['Bodyweight Squat','Walking Lunges','Hip Thrust','Side Lunges','Wall Sit','Calf Raises'],
    dx:['Wide Squat','ALT Lunges','RDL','Hip Thrust','Squat Hold','Calf Raises']},
  atas:{n:'Dada & Bahu',k:'upper',
    ex:['Knee Push Ups','Plank Shoulder Taps','Wall Push Up','Bear Walk','Push Up Hold','Plank'],
    dx:['Chest Press','Upright Row','ALT Shoulder Press','Bicep Curl','Tricep Kick Back','Chest Fly']},
  teras:{n:'Perut & Pinggang',k:'core',
    ex:['Dead Bug','Bicycle Crunch','Reverse Crunch','Russian Twist','Side Plank','Plank'],
    dx:['Russian Twist','Crunches','Flutter Kick','Hollow Hold','Side Plank','Plank Taps']},
  nafas:{n:'Nafas Panjang',k:'cardio',
    ex:['Mountain Climber','Squat Pulse','Bear Walk','Alternating Lunges','Plank Shoulder Taps','Side Lunges'],
    dx:['Squat Thruster','Clean Press','ALT Lunges','Squat Bicep Curl','Jerk Press','Plank Taps']},
  rehat:{n:'Regangan & Pulih',k:'recover',
    ex:['IC Warm','Bird Dog','Dead Bug','Hip Thrust','Calf Raises'], dx:null},
  test:{n:'Ayah Test',k:'test', ex:[], dx:null}
};
const AY_ORDER=['test','full','kaki','atas','nafas','teras','rehat',
                'full','kaki','atas','nafas','teras','full','rehat',
                'test','kaki','atas','nafas','teras','full','rehat',
                'kaki','atas','nafas','teras','full','kaki','rehat','full','test'];
const AY_DAYS=AY_ORDER.map(k=>Object.assign({id:k},AY_T[k]));
const AY_TESTS=[1,15,30];
const AY_KIND={test:'Ayah Test',train:'Badan penuh',lower:'Kaki',upper:'Badan atas',cardio:'Nafas',core:'Teras',recover:'Pulih'};

const AY30=(function(){
  const weeks=AY_WEEKS.map(w=>({days:AY_DAYS.slice(w.from-1,w.to).map(d=>({name:d.n, ex:d.ex.length?d.ex:['Bodyweight Squat','Knee Push Ups','Plank'], r:4, k:d.k}))}));
  return {id:AY30_ID, name:AY30_NAME, sub:AY30_SUB, goal:'Fat Loss', level:'Beginner', dur:24, rounds:4,
    c1:'#0B2A4A', c2:'#071A2F', ac:'#D4AF7C', icon:'✦', weeks, hub:'ay', oneTime:true, price:AY30_PRICE, wk:4,
    desc:'30 hari di rumah untuk ayah. Tanpa lompat, tanpa alat atau dengan dumbbell, 24 minit sehari, '+
         '12 minit bila hari sibuk. Ayah Test pada Hari 1, 15 dan 30, dan Pinggan Ayah tanpa kira kalori.'};
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
  d.steps=d.steps||{}; d.lesson=d.lesson||{}; d.test=d.test||{};
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

/* the photographs: the man's studio set, on navy until the dads' own are shot */
const AY_WK_IMG=['squat','lunge','climber','squat'];
function ayCover(){ return AY30_PH+'cover.jpg'; }
function ayBg(u){ return "background-image:url('"+u+"')"; }
function ayDayImg(gi){ const d=AY_DAYS[gi]; return AY30_PH+(d.k==='test'?'plank':d.k==='recover'?'stretch':AY_WK_IMG[ayWeekOf(gi)])+'-w.jpg'; }

/* ── the home ── */
let ayTab='hari', ayWeek=-1, ayQ=-1, ayQA=null, ayLsOpen=false, ayPing='malaysia';
function aySetTab(t){ ayTab=t; renderAY30(); try{ const s=$('screen'), a=$('ay-tabs'); if(s&&a&&a.offsetTop) s.scrollTop=Math.max(0,a.offsetTop-70); }catch(e){} }
function ayHero(){
  return '<div class="lbx-hero bn-hero ay-hero" style="background-image:url(\''+ayCover()+'\')"><div class="lbx-hero-ov"></div>'+
    '<div class="lbx-hero-tx"><img class="ay-logo" src="'+AY30_LOGO+'" alt="AYAH2FIT 30">'+
    '<div class="lbx-tags"><span>30 hari</span><span>12–24 minit</span><span>Tanpa lompat</span></div></div></div>';
}
function renderAY30(){
  if(ayQ>=0){ $('pgd-body').innerHTML=ayQuiz(); return; }
  const owned=ayOwned(), tot=AY_DAYS.length, nx=ayNext();
  if(ayWeek<0) ayWeek=ayWeekOf(Math.min(nx,tot-1));
  const pill=!owned ? {icon:'lock',label:'RM'+AY30_PRICE,go:'ayBuy()'}
           : nx<tot ? {icon:'play',label:'Hari '+(nx+1),go:'ayOpenDay('+nx+')'} : null;
  let h=pdxBar('program',pill)+ayHero()+'<div class="lbx ay">';
  if(!owned){
    h+='<div class="lbx-card lbx-sell"><div class="lbx-k">Khas untuk ayah</div>'+
      '<div class="lbx-h">30 hari. Di rumah. Lepas anak tidur pun boleh.</div>'+
      '<div class="lbx-p">Pelan ikut tahap dan kerja Ayah, tanpa lompat, 24 minit sehari atau 12 minit bila sibuk.</div>'+
      '<button class="lbx-go" onclick="ayBuy()">'+glyph('lock')+'Dapatkan · RM'+AY30_PRICE+'</button>'+
      '<button class="lbx-ghost" onclick="openPaywall(\'AYAH2FIT 30 is included in HITFAT+.\')">'+glyph('star')+'Termasuk dalam HITFAT+</button></div>';
  } else if(nx<tot && !ayMe()){
    h+='<div class="lbx-card lbq-invite"><div class="lbx-k">Sebelum Hari 1</div>'+
      '<div class="lbx-h">Jom bina pelan Ayah.</div>'+
      '<div class="lbx-p">'+AY_Q.length+' soalan, kurang 1 minit. Ikut tahap, kerja dan badan Ayah.</div>'+
      '<button class="lbx-go" onclick="ayQuizOpen()">'+glyph('sliders')+'Bina Pelan Saya</button></div>';
  }
  h+='<div class="lbx-seg ay-seg" id="ay-tabs">'+[['hari','Hari Ini'],['program','Program'],['pinggan','Pinggan'],['belajar','Belajar'],['progress','Progress']]
    .map(t=>'<button class="'+(ayTab===t[0]?'on':'')+'" onclick="aySetTab(\''+t[0]+'\')">'+t[1]+'</button>').join('')+'</div>';
  if(ayTab==='program') h+=ayProgram();
  else if(ayTab==='pinggan') h+=ayPinggan();
  else if(ayTab==='belajar') h+=ayBelajar();
  else if(ayTab==='progress') h+=ayProgress();
  else h+=ayHari();
  $('pgd-body').innerHTML=h+'</div>';
}

/* Hari Ini: the greeting, the day and its two buttons, three tasks */
function ayLine(me){
  if(!me) return '';
  if(me.anak==='bayi') return 'Bayi kecil, tidur tak cukup? Pilih 12 minit. Itu pun dikira.';
  if(me.kerja==='syif') return 'Kerja syif: buat bila bangun, bukan ikut jam orang lain.';
  if(me.kerja==='niaga') return 'Kedai tak tutup sendiri. Cari 12 minit sebelum buka.';
  if(me.anak==='ya') return 'Anak nampak Ayah bersenam. Itu pun satu pelajaran.';
  return 'Satu hari, satu sesi. Itu saja.';
}
function ayHari(){
  const owned=ayOwned(), tot=AY_DAYS.length, nx=ayNext(), done=ayDone();
  if(!owned) return ayLocked('home','Hari Ini','Satu sesi, 8,000 langkah dan satu lesson ringkas. Tiga benda sehari.');
  if(nx>=tot) return ayGrad();
  const d=ayDay(nx), st=liveStreak(), wi=ayWeekOf(nx);
  const greet='Assalamualaikum, Ayah';
  let h='<div class="lbx-card lbx-now ay-now"><div class="ay-hello">'+greet+'</div>'+
    '<div class="ay-count"><div><b>Hari '+(nx+1)+'</b><i>/ '+tot+'</i></div>'+
      '<span class="ay-streak'+(st>0?' on':'')+'">'+glyph('flame')+st+'</span></div>'+
    '<div class="lbx-p">Minggu '+(wi+1)+': '+AY_WEEKS[wi].n+'. '+ayLine(ayMe())+'</div>'+
    '<div class="lbx-today" onclick="ayOpenDay('+nx+')"><div class="lbx-today-ph" style="'+ayBg(ayDayImg(nx))+'"><span class="lbx-badge">Hari ini</span></div>'+
      '<div class="lbx-today-b"><div class="lbx-k">'+(AY_KIND[d.k]||'Sesi')+' · '+d.ex.length+' gerakan · '+d.r+' pusingan</div><div class="lbx-t">'+d.n+'</div></div></div>';
  if(d.k==='test') h+='<button class="lbx-go ay-go" onclick="ayOpenDay('+nx+')">'+glyph('play')+'MULA AYAH TEST</button>';
  else {
    h+='<button class="lbx-go ay-go" onclick="ayPlay('+nx+')">'+glyph('play')+'MULA '+ayMinutes(d)+' MINIT</button>';
    if(d.k!=='recover') h+='<button class="lbx-ghost" onclick="ayPlay('+nx+',1)">'+glyph('clock')+'Hari sibuk? '+ayMinutes(ayDay(nx,1))+' minit</button>';
  }
  h+='</div>';
  return h+ayTasks(done);
}
function ayTasks(done){
  const w=ayData(), t=iso(0), trained=doneToday(), gi=Math.max(0,Math.min(trained?done-1:done,AY_DAYS.length-1));
  const st=+w.steps[t]||0, stepOk=st>=AY_STEPS, ls=AY_LESSON[gi], lsOk=!!w.lesson[gi];
  const n=(trained?1:0)+(stepOk?1:0)+(lsOk?1:0);
  const ck=(on,icon)=>'<span class="ck'+(on?' on':'')+'">'+glyph(on?'check':icon)+'</span>';
  const pm='<div class="pm" onclick="event.stopPropagation()"><button onclick="aySteps(-500)" aria-label="Kurang 500 langkah">−</button><button onclick="aySteps(500)" aria-label="Tambah 500 langkah">+</button></div>';
  return '<div class="lbx-sec"><div class="lbx-sh"><div class="lbx-st">Tugas Hari Ini</div><div class="lbx-ss">'+n+' daripada 3 selesai</div></div>'+lbRing(n/3,44,n,'')+'</div>'+
    '<div class="lbx-card lbx-cl">'+
    '<div class="lbx-cr'+(trained?' on':'')+'" onclick="ayOpenDay('+Math.min(ayNext(),AY_DAYS.length-1)+')">'+ck(trained,'play')+'<div class="tx"><b>Workout</b><span>'+(trained?'Selesai hari ini':'Satu sesi')+'</span></div><span class="pdx-chev">›</span></div>'+
    '<div class="lbx-cr'+(stepOk?' on':'')+'" onclick="aySteps(\'goal\')">'+ck(stepOk,'steps')+
      '<div class="tx"><b>'+st.toLocaleString()+' <em>/ '+AY_STEPS.toLocaleString()+' langkah</em></b><div class="bar"><i style="width:'+Math.round(Math.min(1,st/AY_STEPS)*100)+'%"></i></div></div>'+pm+'</div>'+
    '<div class="lbx-cr'+(lsOk?' on':'')+'" onclick="ayLsToggle()">'+ck(lsOk,'book')+'<div class="tx"><span class="k">Lesson ringkas · Hari '+(gi+1)+'</span><b class="w">'+ls[0]+'</b></div><span class="pdx-chev">'+(ayLsOpen?'⌄':'›')+'</span></div>'+
    (ayLsOpen?'<div class="ay-lesson"><p>'+ls[1]+'</p><button class="lbx-go" onclick="ayLsDone('+gi+')">'+glyph('check')+(lsOk?'Sudah dibaca':'Faham')+'</button></div>':'')+
  '</div>';
}
function ayLsToggle(){ ayLsOpen=!ayLsOpen; const s=$('screen'), y=s?s.scrollTop:0; renderAY30(); if(s) s.scrollTop=y; }
function ayLsDone(gi){ ayData().lesson[gi]=true; ayLsOpen=false; HF.save(); const s=$('screen'), y=s?s.scrollTop:0; renderAY30(); if(s) s.scrollTop=y; }
function aySteps(n){
  const d=ayData(), t=iso(0);
  d.steps[t]= n==='goal' ? ((+d.steps[t]||0)>=AY_STEPS?0:AY_STEPS) : Math.max(0,(+d.steps[t]||0)+n);
  HF.save(); const s=$('screen'), y=s?s.scrollTop:0; renderAY30(); if(s) s.scrollTop=y;
}

/* ── Program: the plan, the month, how it works ── */
function ayProgram(){
  const owned=ayOwned(), done=ayDone(), tot=AY_DAYS.length, nx=ayNext(), me=ayMe(), w=AY_WEEKS[ayWeek]||AY_WEEKS[0];
  let h='';
  if(me){
    const tags=[me.level==='aktif'?'Aktif':'Asas', ayMode()==='dumbbell'?'Dumbbell':'Tanpa alat', {pejabat:'Kerja pejabat',syif:'Kerja syif',niaga:'Berniaga'}[me.kerja]];
    (me.pain||[]).forEach(p=>{ const t={lutut:'Lutut dijaga',belakang:'Belakang dijaga',tangan:'Tangan dijaga'}[p]; if(t) tags.push(t); });
    h+='<div class="lbx-card lbq-me"><div class="h"><span class="ic">'+glyph('sliders')+'</span><div class="tt"><div class="lbx-k">Pelan Ayah</div><b>Dibina dari jawapan Ayah</b></div>'+
      '<button onclick="ayQuizOpen()">'+glyph('pencil')+'Ubah</button></div><div class="lbq-chips row">'+tags.filter(Boolean).map(x=>'<span>'+hesc(x)+'</span>').join('')+'</div></div>';
  }
  h+='<div class="lbx-sec"><div class="lbx-sh"><div class="lbx-st">30 Hari Ayah</div><div class="lbx-ss">'+done+' daripada '+tot+' hari selesai</div></div></div>';
  h+='<div class="lbx-dots">'+AY_DAYS.map((d,i)=>'<i class="'+(i<done?'d':i===nx&&owned?'n':'')+(AY_WEEKS.some(x=>x.from===i+1&&i>0)?' gap':'')+'"></i>').join('')+'</div>';
  h+='<div class="lbx-weeks">'+AY_WEEKS.map((x,i)=>'<button class="'+(i===ayWeek?'on':'')+'" onclick="ayWeek='+i+';renderAY30()"><small>Minggu '+(i+1)+'</small><b>'+(done>=x.to?'✓ ':'')+x.n+'</b></button>').join('')+'</div>';
  h+='<div class="lbx-wcover" style="'+ayBg(ayDayImg(w.from))+'"><div><small>Minggu '+(ayWeek+1)+' · Hari '+w.from+'–'+w.to+'</small><b>'+w.n+'</b><span>'+w.s+'</span></div></div>';
  h+='<div class="lbx-days">'+AY_DAYS.slice(w.from-1,w.to).map((d0,j)=>{
    const gi=w.from-1+j, d=ayDay(gi), isDone=gi<done, now=gi===nx&&owned;
    return '<div class="lbx-day'+(isDone?' done':'')+(now?' now':'')+' k-'+d.k+'" onclick="ayOpenDay('+gi+')">'+
      '<div class="lbx-day-n"><small>HARI</small><b>'+(gi+1)+'</b>'+(isDone?'<span class="ck">'+glyph('check')+'</span>':'')+'</div>'+
      '<div class="lbx-day-t">'+d.n+'</div><div class="lbx-day-m">'+(d.k==='test'?'3 ujian':(AY_KIND[d.k]||'')+' · '+ayMinutes(d)+' min')+'</div>'+
      (now?'<span class="lbx-day-now">Hari ini</span>':'')+'</div>';
  }).join('')+'</div>';
  h+='<div class="lb-safe">'+ic('warning')+'<div><div class="t">Sebelum mula</div><div class="s">Darah tinggi, kencing manis, sakit dada, masalah jantung atau baru lepas pembedahan: '+
    'jumpa doktor dulu. Sakit dada, pening atau sesak nafas masa bersenam: berhenti terus dan dapatkan bantuan.</div></div></div>';
  h+=fsec('Cara Ikut','')+'<div class="wl-steps">'+[
    ['Hari 1: Ayah Test','Push-up, squat dan plank, dan lilit pinggang. Ini garisan permulaan.'],
    ['Satu sesi sehari','40 saat kerja, 20 saat rehat. Sibuk? Pilih 12 minit, hari tetap dikira.'],
    ['Tiga tugas','Workout, 8,000 langkah dan satu lesson ringkas.'],
    ['Hari 15 dan 30','Ulang Ayah Test dan tengok beza di Progress.']]
    .map((s,i)=>'<div class="wl-step"><span class="n">'+(i+1)+'</span><div><div class="t">'+s[0]+'</div><div class="m">'+s[1]+'</div></div></div>').join('')+'</div>';
  return h;
}

/* ── a day ── */
function ayOpenDay(gi){
  const d=ayDay(gi); if(!d) return;
  const owned=ayOwned(), exs=ayExercises(d), wi=ayWeekOf(gi), done=gi<ayDone();
  curProg=AY30; curDay={p:AY30, day:AY30.weeks[wi].days[gi-AY_WEEKS[wi].from+1], gi};
  let h=pdxBar('day', owned?{icon:'play',label:'Mula',go:'ayPlay('+gi+')'}:{icon:'lock',label:'RM'+AY30_PRICE,go:'ayBuy()'})+
    '<div class="lbx-hero day bn-day ay-day" style="'+ayBg(ayDayImg(gi))+'"><div class="lbx-hero-ov"></div>'+
    '<div class="lbx-hero-tx"><div class="lbx-kick">Hari '+(gi+1)+' / 30 · Minggu '+(wi+1)+': '+AY_WEEKS[wi].n+(done?' · ✓ Selesai':'')+'</div>'+
    '<div class="lbx-name">'+d.n+'</div></div></div><div class="lbx ay">';
  h+='<div class="lbx-facts">'+[[ayMinutes(d)+'','minit'],[exs.length+'','gerakan'],[d.r+'','pusingan'],[d.dur+'s','kerja']]
    .map(x=>'<div><b>'+x[0]+'</b><span>'+x[1]+'</span></div>').join('')+'</div>';
  if(!owned){
    h+='<button class="lbx-go" onclick="ayBuy()">'+glyph('lock')+'Buka · RM'+AY30_PRICE+'</button>';
  } else if(d.k==='test'){
    h+='<button class="lbx-go ay-go" onclick="ayPlay('+gi+')">'+glyph('play')+'MULA AYAH TEST</button>'+ayTestForm(gi+1)+
       '<button class="lbx-ghost" onclick="ayComplete('+gi+')">'+glyph('check')+'Simpan, hari ini selesai</button>';
  } else {
    if(AY_T[d.k==='recover'?'rehat':AY_DAYS[gi].id].dx) h+='<div class="lbx-split ay-mode" role="radiogroup" aria-label="Alat">'+
      [['tanpa','Tanpa alat'],['dumbbell','Dumbbell']].map(m=>'<button class="'+(ayMode()===m[0]?'on':'')+'" role="radio" aria-checked="'+(ayMode()===m[0])+'" onclick="aySetMode(\''+m[0]+'\','+gi+')">'+m[1]+'</button>').join('')+'</div>';
    h+='<button class="lbx-go ay-go" onclick="ayPlay('+gi+')">'+glyph('play')+'MULA '+ayMinutes(d)+' MINIT</button>';
    if(d.k!=='recover') h+='<button class="lbx-ghost" onclick="ayPlay('+gi+',1)">'+glyph('clock')+'Hari sibuk? '+ayMinutes(ayDay(gi,1))+' minit</button>';
  }
  h+='<div class="lbx-sec"><div class="lbx-sh"><div class="lbx-st">Dalam Sesi Ini</div><div class="lbx-ss">Tekan gerakan untuk tengok video.</div></div></div>'+
    '<div class="lbx-moves">'+exs.map((e,i)=>'<div class="lbx-move" onclick="'+(owned?'ayPlayOne('+i+','+gi+')':'ayBuy()')+'">'+
      '<span class="n">'+(i+1)+'</span><div class="tx"><div class="t">'+e.n+'</div><div class="m">'+e.dur+' saat · '+(e.m||'Full body')+'</div></div>'+
      '<span class="pl">'+glyph(owned?'play':'lock')+'</span></div>').join('')+'</div></div>';
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
  hidePanels(); $('progdetail').style.display='block'; ayTab='hari'; renderAY30(); $('screen').scrollTop=0;
}
function ayComplete(gi){
  HF.markDone(AY30_KEY+'-d'+gi,{name:ayDay(gi).n, mins:ayMinutes(ayDay(gi))});
  if(progDone(AY30_ID)===gi) HF.data.progress[AY30_ID]=gi+1;
  HF.save(); toast('Hari '+(gi+1)+' selesai');
  hidePanels(); $('progdetail').style.display='block'; ayTab='hari'; renderAY30(); $('screen').scrollTop=0;
}

/* ── Ayah Test: pinggang, push-up, squat, plank and his average steps, on days
   1, 15 and 30. Weight and a photo are his choice, and private. ── */
function ayTestRows(){
  const ex=ayDay(0).ex;
  return [['waist','Lilit pinggang','cm',-1],['a',ex[0]+(/Plank|Hold/.test(ex[0])?'':' · 1 minit'),'kali',1],
          ['b',(ex[1]||'Squat')+' · 1 minit','kali',1],['c',ex[2]||'Plank','saat',1],['steps','Purata langkah','sehari',1]];
}
function ayStepAvg(){
  const w=ayData(), xs=[]; for(let i=0;i<7;i++){ const v=+w.steps[iso(-i)]||0; if(v) xs.push(v); }
  return xs.length ? Math.round(xs.reduce((a,b)=>a+b,0)/xs.length) : 0;
}
function aySetTest(n,k,v){
  const t=ayData().test; t[n]=t[n]||{}; t[n][k]=parseFloat(v)||0; t[n].steps=ayStepAvg(); HF.save();
}
function ayTestForm(n){
  const t=ayData().test[n]||{};
  return '<div class="lbx-card ay-test"><div class="lbx-k">Keputusan · Hari '+n+'</div><div class="esfields">'+
    ayTestRows().filter(r=>r[0]!=='steps').map(r=>'<label class="esf"><span>'+r[1]+'</span><input class="inp" inputmode="decimal" placeholder="0" aria-label="'+r[1]+'" value="'+(t[r[0]]||'')+'" onchange="aySetTest('+n+',\''+r[0]+'\',this.value)"><em>'+r[2]+'</em></label>').join('')+'</div>'+
    '<details class="ay-opt"><summary>Berat & gambar (pilihan, peribadi)</summary><div class="esfields"><label class="esf"><span>Berat</span><input class="inp" inputmode="decimal" placeholder="0" aria-label="Berat" value="'+(t.kg||'')+'" onchange="aySetTest('+n+',\'kg\',this.value)"><em>kg</em></label></div>'+
      '<label class="wl-ph lb-ph'+(ayPhoto(n)?' has':'')+'"'+(ayPhoto(n)?' style="background-image:url(\''+ayPhoto(n)+'\')"':'')+'><input type="file" accept="image/*" onchange="ayAddPhoto('+n+',this)">'+(ayPhoto(n)?'':ic('photo'))+'<span>Gambar · Hari '+n+'</span></label>'+
      '<div class="lb-fine">Gambar disimpan dalam telefon ini sahaja.</div></details></div>';
}
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
    catch(e){ toast('Ruang telefon tak cukup untuk gambar'); }
    if($('daydetail') && $('daydetail').style.display==='block' && curDay) ayOpenDay(curDay.gi); else renderAY30();
  }; im.src=r.result; };
  r.readAsDataURL(f);
}
function ayCompare(){
  const t=ayData().test;
  return '<div class="lbx-card ay-cmp">'+ayTestRows().map(r=>{
    const vs=AY_TESTS.map(n=>+(t[n]||{})[r[0]]||0), mx=Math.max.apply(null,vs)||1;
    const seen=vs.filter(Boolean), diff=seen.length>1?Math.round((seen[seen.length-1]-seen[0])*10)/10:null, good=diff!==null&&diff*r[3]>0;
    return '<div class="ay-cr"><div class="h"><b>'+r[1]+'</b><span class="'+(good?'up':'')+'">'+(diff===null?'':(diff>0?'+':'')+diff+' '+r[2])+'</span></div>'+
      vs.map((v,i)=>'<div class="ay-bar"><small>H'+AY_TESTS[i]+'</small><div><i style="width:'+Math.round(v/mx*100)+'%"></i></div><em>'+(v||'–')+'</em></div>').join('')+'</div>';
  }).join('')+'<div class="lb-fine">Gambar & berat: pilihan, peribadi.</div></div>';
}

function ayProgress(){
  if(!ayOwned()) return ayLocked('chart','Nampak beza dalam nombor','Ayah Test pada Hari 1, 15 dan 30: pinggang, push-up, squat, plank dan langkah.');
  const done=ayDone(), tot=AY_DAYS.length;
  let mins=0; Object.keys(HF.data.sessions).forEach(k=>{ if(k.indexOf(AY30_KEY+'-')===0) mins+=(HF.data.sessions[k].mins||0); });
  let h='<div class="lbx-card lbx-pstat">'+lbRing(done/tot,92,done+'<i>/'+tot+'</i>','hari')+
    '<div class="lbx-pstat-r"><div class="lbx-chip fl"><span class="ic">'+glyph('flame')+'</span><div><b>'+liveStreak()+'</b><span>Hari berturut</span></div></div>'+
    '<div class="lbx-chip cl"><span class="ic">'+glyph('clock')+'</span><div><b>'+Math.round(mins)+'</b><span>Minit latihan</span></div></div></div></div>';
  if(done>=tot) h+=ayGrad();
  h+='<div class="lbx-sec"><div class="lbx-sh"><div class="lbx-st">Ayah Test</div><div class="lbx-ss">Hari 1, 15 dan 30. Bandingkan dengan diri sendiri.</div></div></div>'+ayCompare();
  const ics=['sunrise','workout','flame','trophy'];
  h+='<div class="lbx-sec"><div class="lbx-sh"><div class="lbx-st">Lencana</div><div class="lbx-ss">Satu untuk setiap minggu yang tamat.</div></div></div><div class="lbx-medals">'+AY_WEEKS.map((x,i)=>{
    const got=done>=x.to, part=Math.max(0,Math.min(1,(done-(x.from-1))/(x.to-x.from+1)));
    return '<div class="lbx-medal'+(got?' on':'')+'"><div class="m" style="--p:'+Math.round(part*100)+'%"><span>'+glyph(got?ics[i]:'lock')+'</span></div><b>'+x.n+'</b><small>'+(got?'Dapat':'Hari '+x.to)+'</small></div>';
  }).join('')+'</div>';
  return h;
}
/* Graduation: the certificate, the report card, and who wants what comes next */
function ayGrad(){
  const t=ayData().test, a=t[1]||{}, b=t[30]||{}, nm=hesc(((HF.data.prefs&&HF.data.prefs.name)||'Ayah').trim());
  const rows=ayTestRows().filter(r=>r[0]!=='steps' || a.steps||b.steps);
  return '<div class="ay-cert"><img src="'+AY30_LOGO+'" alt="AYAH2FIT 30"><div class="k">TAMAT</div><div class="t">'+nm+'</div>'+
    '<div class="s">30 hari, habis. Bukan senang, dan Ayah buat juga.</div>'+
    '<div class="ay-rep"><div class="h"><span></span><b>Hari 1</b><b>Hari 30</b></div>'+rows.map(r=>'<div><span>'+r[1]+'</span><b>'+(a[r[0]]||'–')+'</b><b>'+(b[r[0]]||'–')+'</b></div>').join('')+'</div>'+
    '<button class="lbx-go" onclick="ayShare()">'+glyph('share')+'Kongsi</button>'+
    (ayData().minat?'<div class="ay-min">'+glyph('check')+'Nama Ayah dah masuk senarai. Kami beritahu bila siap.</div>':
      '<button class="lbx-ghost" onclick="ayMinat()">'+glyph('star')+'Daftar minat program seterusnya</button>')+'</div>';
}
function ayMinat(){
  ayData().minat=iso(0); HF.save();
  try{ if(sb&&HF.userId){ const r=sb.rpc('plus_track',{p_items:[{n:'ay30_minat',t:new Date().toISOString()}]}); if(r&&r.then) r.then(null,function(){}); } }catch(e){}
  toast('Terima kasih, Ayah'); renderAY30();
}
function ayShare(){
  const t='Saya baru tamatkan AYAH2FIT 30: 30 hari di rumah.';
  try{ if(navigator.share){ navigator.share({title:'AYAH2FIT 30', text:t, url:'https://app.hitfat.io'}); return; } }catch(e){}
  try{ navigator.clipboard.writeText(t+' https://app.hitfat.io'); toast('Disalin'); }catch(e){ toast(t); }
}

/* ── Belajar: the Nutrition Academy, opened by the program (acLadies, academy.js) ── */
function ayBelajar(){
  if(typeof academyHTML!=='function') return '';
  if(!ayOwned()) return ayLocked('book','Nutrition Academy','Episod video pendek tentang makan cara Malaysia, setiap satu dengan kuiz.');
  return '<div class="lbx-acad">'+academyHTML()+'</div>';
}

/* ── Pinggan Ayah: what to pick, what to cut back, no calorie counting ── */
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
function ayPinggan(){
  if(!ayOwned()) return ayLocked('food','Pinggan Ayah','Makanan Malaysia yang Ayah makan setiap hari: pilih ini, kurangkan ini. Tak perlu kira kalori.');
  let h='<div class="lbx-sec"><div class="lbx-sh"><div class="lbx-st">Pinggan Ayah</div><div class="lbx-ss">Tak perlu kira kalori. Tak perlu tinggal nasi.</div></div></div>';
  h+='<div class="lbx-card lbx-plate">'+lbPlateSVG()+'<div class="lbx-plate-k">'+
    [['#1F9D6A','Sayur','½ pinggan'],['#D4AF7C','Protein','2 tapak tangan'],['#E08A00','Nasi','2 genggam'],['#9AA7B5','Lemak','2 ibu jari']]
    .map(x=>'<div><i style="background:'+x[0]+'"></i><b>'+x[1]+'</b><span>'+x[2]+'</span></div>').join('')+'</div></div>';
  h+='<div class="lbx-split ay-mode">'+[['malaysia','Seluruh Malaysia'],['kelantan','Kelantan']].map(m=>'<button class="'+(ayPing===m[0]?'on':'')+'" onclick="ayPing=\''+m[0]+'\';renderAY30()">'+m[1]+'</button>').join('')+'</div>';
  h+='<div class="ay-pg">'+AY_PINGGAN[ayPing].map(c=>'<div class="lbx-card"><b class="t">'+c[0]+'</b>'+
    '<div class="r ok"><span>Pilih ini</span>'+c[1].map(x=>'<div>'+glyph('check')+x+'</div>').join('')+'</div>'+
    '<div class="r no"><span>Kurangkan ini</span>'+c[2].map(x=>'<div>'+glyph('minus')+x+'</div>').join('')+'</div></div>').join('')+'</div>';
  return h;
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

/* the questions: one a screen, big buttons */
const AY_Q=[
  {k:'umur', t:'Umur?', s:'Supaya pelan sesuai dengan badan Ayah.'},
  {k:'anak', t:'Ada anak?', s:'Program ini untuk semua lelaki. Jawapan ini ubah nasihat harian saja.', o:[
    ['ya','Ya','','people'],['tak','Tak','','person'],['jauh','Ada tapi jauh','','heart'],['bayi','Masih bayi','','moon']]},
  {k:'kerja', t:'Jenis kerja?', s:'Hari Ayah lain-lain.', o:[
    ['pejabat','Pejabat','Banyak duduk','laptop'],['syif','Syif','Waktu tak tetap','clock'],['niaga','Niaga','Kedai, jualan, lapangan','bag']]},
  {k:'alat', t:'Alat?', s:'Boleh tukar bila-bila masa.', o:[
    ['tanpa','Tanpa alat','Badan sendiri saja','home'],['dumbbell','Dumbbell','Sepasang pun cukup','workout']]},
  {k:'level', t:'Tahap?', s:'Jujur. Boleh ubah kemudian.', o:[
    ['asas','Asas','Lama tak bersenam','sunrise'],['aktif','Aktif','Bersenam 2 kali seminggu atau lebih','flame']]},
  {k:'sihat', multi:true, t:'Kesihatan?', s:'Pilih semua yang berkaitan. Disimpan dalam akaun Ayah saja.', o:[
    ['darah','Darah tinggi','','heart'],['jantung','Sakit dada atau masalah jantung','','heart'],['gula','Kencing manis','','heart'],['tiada','Tiada','Setakat yang saya tahu','check']]},
  {k:'pain', multi:true, t:'Ada yang selalu sakit?', s:'Kami tukar gerakan yang membebankannya.', o:[
    ['lutut','Lutut','','person'],['belakang','Belakang bawah','','person'],['tangan','Pergelangan tangan','','person'],['tiada','Tiada','Badan okey','check']]}
];
function ayQuizOpen(){ ayQA=JSON.parse(JSON.stringify(ayData().me||{})); ayQ=0; hidePanels(); $('progdetail').style.display='block'; renderAY30(); $('screen').scrollTop=0; }
function ayQuizNext(){ ayQ++; renderAY30(); $('screen').scrollTop=0; }
function ayQuizBack(){ if(ayQ<=0){ ayQ=-1; } else ayQ--; renderAY30(); $('screen').scrollTop=0; }
function ayQPick(k,v,multi){
  if(multi){
    let l=ayQA[k]||[]; const i=l.indexOf(v);
    if(v==='tiada') l=i>=0?[]:['tiada'];
    else { l=l.filter(x=>x!=='tiada'); if(i>=0) l.splice(l.indexOf(v),1); else l.push(v); }
    ayQA[k]=l; if(k==='sihat' && !ayRisk()) delete ayQA.clear; renderAY30(); return;
  }
  ayQA[k]=v; ayQuizNext();
}
/* high blood pressure or a heart: the doctor first */
function ayRisk(){ const s=(ayQA&&ayQA.sihat)||[]; return s.indexOf('darah')>=0 || s.indexOf('jantung')>=0; }
function ayQUmur(){
  const a=parseInt(($('ayq-age')||{}).value,10);
  if(!(a>=18&&a<=80)){ toast('Isi umur, 18 ke atas'); return; }
  ayQA.umur=a; ayQuizNext();
}
function ayQuizSave(){
  const d=ayData(); ayQA.done=true; ayQA.at=iso(0); d.me=ayQA; delete d.mode;
  HF.save(); ayQ=-1; ayTab='hari'; ayWeek=-1; renderAY30(); $('screen').scrollTop=0; toast('Pelan Ayah dah sedia');
}
function ayQuiz(){
  const n=AY_Q.length, top='<div class="lbq-top"><button class="pdx-back" aria-label="Kembali" onclick="ayQuizBack()">'+glyph('chevleft')+'</button>'+
    '<div class="lbq-bar"><i style="width:'+Math.round(Math.min(ayQ,n)/n*100)+'%"></i></div><span class="lbq-n">'+Math.min(ayQ,n)+'/'+n+'</span></div>';
  let h='<div class="lbq ay">';
  if(ayQ===0) return h+top+'<div class="lbq-intro bn-hero ay-hero" style="background-image:url(\''+ayCover()+'\')"><div class="lbx-hero-ov"></div><div class="tx">'+
    '<img class="ay-logo" src="'+AY30_LOGO+'" alt="AYAH2FIT 30"><div class="t">Jom bina pelan Ayah.</div></div></div>'+
    '<div class="lbq-p">'+n+' soalan, kurang 1 minit. Satu soalan satu skrin.</div>'+
    '<button class="lbx-go" onclick="ayQuizNext()">'+glyph('play')+'Mula</button></div>';
  if(ayQ>n) return h+ayQuizResult()+'</div>';
  const q=AY_Q[ayQ-1], v=ayQA[q.k];
  h+=top+'<div class="lbq-q">'+hesc(q.t)+'</div>'+(q.s?'<div class="lbq-s">'+hesc(q.s)+'</div>':'');
  if(q.k==='umur') return h+'<div class="esfields lbq-body"><label class="esf"><span>Umur</span><input class="inp" id="ayq-age" inputmode="numeric" placeholder="0" value="'+(v||'')+'"><em>tahun</em></label></div>'+
    '<button class="lbx-go" onclick="ayQUmur()">Seterusnya</button></div>';
  h+='<div class="lbq-opts">'+q.o.map(o=>{
    const on=q.multi ? (v||[]).indexOf(o[0])>=0 : v===o[0];
    return '<button class="lbq-o'+(on?' on':'')+'" onclick="ayQPick(\''+q.k+'\',\''+o[0]+'\''+(q.multi?',1':'')+')"><span class="ic">'+glyph(o[3])+'</span>'+
      '<span class="tx"><b>'+hesc(o[1])+'</b>'+(o[2]?'<small>'+hesc(o[2])+'</small>':'')+'</span><span class="tk">'+(on?glyph('check'):'')+'</span></button>';
  }).join('')+'</div>';
  if(q.k==='sihat' && ayRisk()){
    h+='<div class="lbq-warn">'+glyph('heart')+'<div><b>Jumpa doktor dulu.</b> Senaman baik untuk jantung, tapi tekanan darah dan keadaan jantung Ayah perlu disemak sebelum mula.</div></div>'+
      '<div class="lbq-ticks"><div class="obrow obtick'+(ayQA.clear?' on':'')+'" onclick="ayQA.clear=!ayQA.clear;renderAY30()"><span class="box">'+(ayQA.clear?'✓':'')+'</span><span>Doktor dah benarkan saya bersenam</span></div></div>';
    return h+(ayQA.clear?'<button class="lbx-go" onclick="ayQuizNext()">Seterusnya</button>':'<div class="lbq-hint">Program ini kekal dalam akaun Ayah. Mula bila doktor dah benarkan.</div>')+'</div>';
  }
  if(q.multi){ const ok=v&&v.length; h+='<button class="lbx-go'+(ok?'':' off')+'" onclick="'+(ok?'ayQuizNext()':'')+'">Seterusnya</button>'; }
  return h+'</div>';
}
function ayQuizResult(){
  const keep=ayData().me, me=ayData().me=Object.assign({},ayQA,{done:true}), d=ayDay(8), busy=ayDay(8,1), mins=ayMinutes(d), lines=[];
  (me.pain||[]).forEach(p=>{ const t={lutut:'Squat dan lunge ditukar supaya lutut tak terbeban.',belakang:'Gerakan yang membebankan belakang ditukar.',tangan:'Gerakan menongkat tangan ditukar.'}[p]; if(t) lines.push(t); });
  if((me.sihat||[]).indexOf('gula')>=0) lines.push('Kencing manis: bawa sesuatu yang manis dekat, dan berhenti kalau rasa pening atau menggeletar.');
  ayData().me=keep;
  return '<div class="lbq-res"><div class="lbq-res-h bn-hero ay-hero" style="background-image:url(\''+ayCover()+'\')"><div class="lbx-hero-ov"></div><div class="tx"><div class="k">Pelan dah siap</div><div class="t">30 hari, untuk '+(ayFirst()?hesc(ayFirst()):'Ayah')+'.</div></div></div>'+
    '<div class="lbq-card"><div class="lbq-stats">'+[[mins,'minit sehari'],[ayMinutes(busy),'minit hari sibuk'],[d.dur,'saat kerja'],['0','lompat']].map(x=>'<div><b>'+x[0]+'</b><span>'+x[1]+'</span></div>').join('')+'</div></div>'+
    (lines.length?'<div class="lbq-lines">'+lines.map(l=>'<div><span>'+glyph('check')+'</span><p>'+l+'</p></div>').join('')+'</div>':'')+
    '<div class="lbq-fine">Rasa sakit dada, pening atau sesak nafas? Berhenti terus. Jawapan boleh diubah di tab Program.</div>'+
    '<button class="lbx-go" onclick="ayQuizSave()">'+glyph('play')+'Tengok Pelan Saya</button></div>';
}

function ayLocked(icon,title,text){
  return '<div class="wl-lock">'+ic(icon)+'<div class="t">'+title+'</div><div class="s">'+text+'</div><button class="lbx-go" onclick="ayBuy()">Dapatkan · RM'+AY30_PRICE+'</button></div>';
}
function ayBuy(){
  if(ayOwned()) return openProgram(AY30_ID);
  $('pw-body').innerHTML='<div class="pwtop"><span></span><button class="pwx" aria-label="Tutup" onclick="closeProduct()">✕</button></div>'+
    '<div class="ay-buy"><img src="'+AY30_LOGO+'" alt="AYAH2FIT 30"><span>30 HARI · DI RUMAH · KHAS AYAH</span></div>'+
    '<div class="pwlist">'+[
      ['sliders','Pelan Ayah sendiri','Ikut tahap, kerja, alat dan badan Ayah'],
      ['workout','30 hari di rumah','Tanpa lompat, tanpa alat atau dengan dumbbell, video setiap gerakan'],
      ['clock','12 minit bila sibuk','Hari tetap dikira'],
      ['chart','Ayah Test','Hari 1, 15 dan 30, dalam nombor'],
      ['food','Pinggan Ayah','Makanan Malaysia. Tak perlu kira kalori'],
      ['book','Nutrition Academy','Semua episod terbuka'],
      ['trophy','Milik Ayah selamanya','Bayar sekali. Tiada langganan']]
      .map(b=>'<div class="pwf"><div class="ic"><span class="wl-kic">'+glyph(b[0])+'</span></div><div><div class="t">'+b[1]+'</div><div class="m">'+b[2]+'</div></div></div>').join('')+'</div>'+
    '<div class="pwprice"><div class="p">RM'+AY30_PRICE+'</div><div class="per">sekali bayar</div></div>'+
    '<button class="bigbtn" onclick="startCheckout(\'prog_'+AY30_ID+'\')">Beli RM'+AY30_PRICE+'</button>'+
    '<button class="authalt" onclick="openPaywall(\'AYAH2FIT 30 is included in HITFAT+.\')">Atau dapatkan semua dengan HITFAT+</button>';
  $('pwm').classList.add('on');
  try{ $('pwm').scrollTop=0; }catch(e){}
}
function ayHomeCard(){
  ayEnsure(); if(!ayLive()) return '';
  const owned=ayOwned(), done=ayDone(), tot=AY_DAYS.length, nx=ayNext();
  if((owned && nx>=tot) || typeof hpoCard!=='function') return '';
  if(owned && done) return hpoCard(AY30,{wide:true,kick:'Hari '+(nx+1)+' · '+ayMinutes(ayDay(nx))+' min',go:'ayOpenDay('+nx+')'});
  if(owned) return hpoCard(AY30,{wide:true,kick:'Baru · Sedia bila Ayah sedia',go:"openProgram('"+AY30_ID+"')"});
  return hpoCard(AY30,{wide:true,kick:'Program Baru · RM'+AY30_PRICE,go:"openProgram('"+AY30_ID+"')"});
}
