/* ═══════════════ THE START (was StartFIT, was MulaFIT) ═══════════════
   10 Nov 2026, Seth sent the poster "6 WEEKS OF THE START. Program untuk
   anda yang baru mula" and asked for its name, its orange / cream / black
   look, and six weeks: now 18 sessions, a week 5 where the moves step up
   and a week 6 for the record. Internal ids stay mula / mf / prog_mula.

   8 Nov 2026 (Seth: "aku nak mula program baru dalam hitfat+. Program ni untuk
   beginner", then "kita buat dlu"). Four weeks, three whole-body sessions a
   week, twelve in all, 15–25 minutes each, at home, for men and women. RM39
   once, like MAK2FIT. The brief and the draft are the Claude Doc
   "THE START — Draf 12 Sesi".

   What makes it THE START and not another Beginner list: every session has the
   same warm-up, main circuit and cool-down; every main move carries a
   technique card; every session ends with a one-minute lesson (six on
   training, six on Malaysian eating, rice allowed, no calorie targets); and
   sessions 1 and 12 ask for a self-check inside the session itself, never a
   separate test day (69 of 96 MAK2FIT buyers stalled at its Day 0 Fit Test).

   Seth's choices (8 Nov): sold on its own at RM39; the videos already in the
   app; MAK2FIT's way of asking questions; no door anchors for pulling, so
   the towel and the water bottle (Superman and Y-T raises have no video).
   Warm-up arm circles and the cool-down stretches are MAK2FIT's woman-coach
   clips (LB30_DEMO); the main moves are the main library's.

   Not here yet: its own photographs (green palette until then), the landing
   page, prog_mula in the deployed edge functions.                        */

const MF_ID='mula', MF_KEY='mf', MF_PRICE=39;
const MF_NAME='THE START', MF_SUB='6 Minggu Asas Kecergasan';
/* Before launch only the listed accounts (and anyone who owns it) see it. */
const MF_LIVE=false, MF_TESTERS=['sethnasser1991@gmail.com','hitfat91@gmail.com'];

/* (10 Nov 2026, Seth: "buat 6 minggu", with the poster "6 WEEKS OF THE START.")
   six weeks, eighteen sessions; still one change a week */
const MF_WEEKS=[
  {n:'Kenal Asas',        s:'Teknik, pernafasan dan susunan sesi. Dua pusingan.'},
  {n:'Ulang Rutin',       s:'Gerakan sama, satu pusingan lagi.'},
  {n:'Lebih Lama',        s:'Kerja 40 saat, rehat kekal 30. Bezakan penat dengan sakit.'},
  {n:'Rehat Pendek',      s:'Rehat dipendekkan ke 20 saat. Rentak sama.'},
  {n:'Naik Tahap',        s:'Masa sama. Beberapa gerakan naik satu tahap.'},
  {n:'Semak dan Sambung', s:'Kekalkan rentak, kemudian semak sejauh mana anda pergi.'}
];
const MF_WK=MF_WEEKS.length;
/* by week: seconds of work, seconds of rest, rounds. (10 Nov 2026) one thing
   changes each week, as the program's own lesson says: rounds, then work,
   then rest, then the moves themselves (week 5), then a fourth round for
   those who chose 25 minutes or Beransur (week 6). */
const MF_LOAD=[[30,30,2],[30,30,3],[40,30,3],[40,20,3],[40,20,3],[40,20,3]];
/* the movement patterns, each a ladder: Mudah, Asas, Beransur */
const MF_PAT={
  squat: {n:'Duduk-bangun',     l:['Sit To Stand','Chair Squat','Bodyweight Squat'], late:['Chair Squat','Bodyweight Squat',null]},
  push:  {n:'Tolak',            l:['Wall Push Up','Incline Push Up (Chair)','Knee Push Ups'], late:['Incline Push Up (Chair)','Knee Push Ups',null]},
  bridge:{n:'Jambatan pinggul', l:['Hip Thrust','Hip Thrust','Hip Thrust'], late:[null,null,'Single Leg Glutes Bridge']},
  hinge: {n:'Bengkok pinggul',  l:['Towel Deadlift','Towel Deadlift','Towel Deadlift']},
  pull:  {n:'Tarik',            l:['Towel Shoulder Back Pull','Towel Shoulder Back Pull','Bottle Bent Over Row'], late:[null,'Bottle Bent Over Row',null]},
  core:  {n:'Kawalan badan',    l:['Dead Bug','Bird Dog','Plank']},
  bal:   {n:'Imbangan',         l:['Chair Assist Hip Abduction','Chair Calf Raises','Single Leg Calf Raises']},
  cardio:{n:'Stamina',          l:['Seated High Knee','Seated High Knee','High Knee'], late:[null,'Fast Seated High Knee',null]}
};
const MF_TYPES={
  A:{n:'Duduk-Bangun & Tolak', p:['squat','push','bridge','core']},
  B:{n:'Pinggul & Imbangan',   p:['hinge','pull','bal','core']},
  C:{n:'Gabung & Stamina',     p:['squat','push','pull','cardio']}
};
const MF_ORDER=[].concat.apply([],MF_WEEKS.map(()=>['A','B','C']));
const MF_N=MF_ORDER.length, MF_RECS=[0,MF_N-1];
const MF_WARM=['Arm Forward Circle','Arm Back Circle','Seated High Knee','Calf Raises','Chair Squat','IC Warm'];
const MF_COOL=['Knee to Chest','Back Stretch','Butterfly Stretch','Side Abs Stretch','Cobra Stretch'];
const MF_PATHS=['Mudah','Asas','Beransur'];

/* the technique card for each pattern: three cues, the usual mistake, the easier way */
const MF_TECH={
  squat: [['Kaki selebar bahu.','Tolak punggung ke belakang seperti nak duduk.','Bangun dengan menolak lantai.'],'Lutut masuk ke dalam','Kerusi lebih tinggi, tangan pada peha'],
  push:  [['Badan lurus dari kepala ke tumit.','Siku 45°, bukan terkeluar ke tepi.','Hembus nafas semasa menolak.'],'Pinggang jatuh','Berdiri lebih dekat dinding'],
  bridge:[['Tumit dekat punggung.','Ketatkan punggung, angkat pinggul.','Tahan 1 saat di atas.'],'Melengkungkan pinggang','Angkat separuh sahaja'],
  hinge: [['Lutut bengkok sedikit.','Tolak punggung ke belakang, belakang lurus.','Rasa tarikan di belakang peha.'],'Membongkok belakang','Gerak lebih pendek'],
  pull:  [['Bahu turun, jauh dari telinga.','Rapatkan bilah bahu.','Gerak perlahan.'],'Mengangkat bahu','Buat tanpa tuala atau botol'],
  core:  [['Pinggang rapat ke lantai, atau belakang neutral.','Gerak perlahan.','Bernafas biasa, jangan tahan.'],'Menahan nafas','Gerakkan tangan sahaja, atau kaki sahaja'],
  bal:   [['Pegang kerusi.','Pandang satu titik di depan.','Gerak terkawal.'],'Bersandar ke tepi','Dua tangan pada kerusi'],
  cardio:[['Duduk atau berdiri tegak.','Ikut rentak sendiri.','Boleh bercakap, tapi tak boleh menyanyi.'],'Terlalu laju di awal','Lebih perlahan, separuh masa']
};
/* one lesson after each session: training (L) and Malaysian eating (M) by
   turns, the review (S) last */
const MF_LESSON=[
  ['Cara bernafas','Hembus nafas semasa usaha: bangun, tolak, angkat. Tarik nafas semasa turun. Jangan tahan nafas, walaupun gerakan terasa berat.','L'],
  ['Pinggan seimbang','Ikut Pinggan Sihat Malaysia: separuh pinggan sayur dan buah, suku nasi, suku lauk protein. Nasi tetap ada. Yang kita jaga ialah berapa banyak.','M'],
  ['Skala usaha 1–10','Sasaran THE START ialah 5 hingga 7: penat, tapi masih boleh bercakap satu ayat. Tahap 9–10 tak perlu. Rutin yang boleh diulang lebih penting daripada sesi yang menyeksa.','L'],
  ['Sukatan guna tangan','Lauk protein setapak tangan. Nasi segenggam. Sayur dua genggam. Minyak atau kuah sebesar ibu jari. Tangan anda sentiasa ada, di rumah atau di kedai.','M'],
  ['Rehat dan lenguh biasa','Lenguh 1 hingga 3 hari selepas sesi adalah biasa, terutama minggu pertama. Hari rehat ialah masa badan membina. Jalan santai membantu lenguh hilang lebih cepat.','L'],
  ['Protein lauk harian','Ayam, ikan kembung, telur, tempe, tauhu, dhal. Cuba ada satu lauk protein setiap kali makan. Ia bantu anda kenyang lebih lama.','M'],
  ['Mencabar atau sakit?','Penat, berpeluh dan lenguh otot: teruskan. Sakit tajam di sendi, pening, sakit dada atau sesak nafas luar biasa: berhenti terus. Jangan paksa untuk cukupkan rekod.','L'],
  ['Makan di luar','Nasi campur: satu lauk protein, dua jenis sayur, kuah sedikit. Di mamak: pilih yang dibakar atau berkuah jernih, dan teh o kurang manis.','M'],
  ['Tidur itu latihan','Otot pulih semasa tidur. Sasarkan sekurang-kurangnya 7 jam. Cuba tidur 30 minit lebih awal, dan letak telefon jauh dari katil.','L'],
  ['Air dan minuman manis','Bawa botol air ke mana-mana. Teh tarik "kurang manis" atau "kosong" ialah langkah pertama. Tak perlu berhenti terus.','M'],
  ['Jalan kaki dikira','Langkah harian ialah separuh program ini. Jalan lepas makan, parking jauh sedikit, naik tangga. Sepuluh minit tiga kali sehari pun dikira.','L'],
  ['Snek dan gorengan','Buah, kacang atau telur rebus sebagai snek biasa. Kuih dan gorengan sekali-sekala, bukan setiap hari. Tiada makanan yang haram dalam THE START.','M'],
  ['Naik tahap sendiri','Tukar satu perkara sahaja pada satu masa: ulangan, masa, julat atau versi gerakan. Teknik dahulu, baru tambah. Kalau teknik merosot, undur semula.','L'],
  ['Sarapan yang mengenyangkan','Roti canai atau nasi lemak tetap boleh. Tambah telur, kurangkan kuah, pilih teh o. Sarapan yang ada protein membantu anda kenyang sampai tengah hari.','M'],
  ['Hari susah','Akan ada hari tak larat. Pada hari itu, buat dua gerakan atau jalan 10 minit. Sedikit lebih baik daripada kosong, dan rutin tak putus.','L'],
  ['Kenduri dan hujung minggu','Ambil satu pinggan, mula dengan sayur dan lauk. Tiada makanan yang perlu ditinggal. Esoknya, sambung rutin seperti biasa.','M'],
  ['Bina tabiat','Latih pada hari dan masa yang sama setiap minggu. Letak kasut atau tuala di tempat yang nampak. Tabiat dibina dengan ulangan, bukan semangat.','L'],
  ['Semak dan sambung','Bandingkan rekod anda dengan sesi 1. Pilih dua tabiat untuk diteruskan. Kemudian ulang THE START pada laluan seterusnya, atau teruskan dengan program HITFAT+.','S']
];
const MF_DAYS=[['isn','Isnin'],['sel','Selasa'],['rab','Rabu'],['kha','Khamis'],['jum','Jumaat'],['sab','Sabtu'],['ahd','Ahad']];

const MF=(function(){
  const weeks=MF_WEEKS.map((w,wi)=>({days:[0,1,2].map(j=>{ const t=MF_TYPES[MF_ORDER[wi*3+j]]; return {name:t.n, ex:MF_PAT.squat.l.slice(0,1).concat(['Wall Push Up']), r:MF_LOAD[wi][2], k:'train'}; })}));
  return {id:MF_ID, name:MF_NAME, sub:MF_SUB, goal:'Strength', level:'Beginner', dur:20, rounds:2,
    c1:'#F0531C', c2:'#5C1A03', ac:'#FFF1E2', icon:'✦', weeks, hub:'mf', len:MF_N+' sesi', oneTime:true, price:MF_PRICE, wk:MF_WK,
    desc:'Program asas 6 minggu untuk lelaki dan wanita yang baru mula atau mahu aktif semula. '+
         MF_N+' sesi seluruh badan di rumah, 15–25 minit, dengan teknik setiap gerakan, pelajaran ringkas dan pemakanan Malaysia.'};
})();
function mfLive(){
  return MF_LIVE || MF_TESTERS.indexOf(String(HF.email||'').toLowerCase())>=0 || (typeof owns==='function' && owns('prog_'+MF_ID));
}
function mfEnsure(){
  const i=PROGRAMS.indexOf(MF), on=mfLive();
  if(on && i<0) PROGRAMS.unshift(MF); else if(!on && i>=0) PROGRAMS.splice(i,1);
}

/* ── state ── */
function mfData(){ const d=HF.data.mf||(HF.data.mf={}); d.rec=d.rec||{}; d.lesson=d.lesson||{}; return d; }
function mfOwned(){ return ownsProgram(MF); }
function mfDone(){ return Math.min(progDone(MF_ID), MF_N); }
function mfMe(){ const m=mfData().me; return m&&m.done ? m : null; }
function mfWeekOf(gi){ return Math.min(MF_WK-1, Math.floor(gi/3)); }
function mfFirst(){ return ((HF.data.prefs&&HF.data.prefs.name)||'').trim().split(/\s+/)[0]; }

/* ── the path: Mudah 0, Asas 1, Beransur 2 ── */
function mfRiskOf(me){ const s=(me&&me.sihat)||[]; return s.length>0 && s.indexOf('tiada')<0; }
function mfPathOf(me){
  if(!me) return 1;
  if(typeof me.path==='number') return me.path;
  return mfAutoPath(me);
}
function mfAutoPath(me){
  if(mfRiskOf(me) || (me.pain||[]).indexOf('lutut')>=0 || (me.act==='tiada' && me.exp==='tak')) return 0;
  if(me.act==='aktif' && me.exp==='program') return 2;
  return 1;
}
function mfPath(){ return mfPathOf(mfMe()); }

/* the move a pattern gives this person in this week */
function mfMove(pat,wi,me){
  const P=MF_PAT[pat], path=mfPathOf(me), pain=(me&&me.pain)||[];
  /* week 5 steps the moves up one, but not for someone whose health answer
     keeps them on Mudah until a doctor or physio says more */
  let n=(wi>=4 && !mfRiskOf(me) && P.late && P.late[path]) || P.l[path];
  if(pain.indexOf('lutut')>=0 && pat==='squat') n='Sit To Stand';
  if(pain.indexOf('lutut')>=0 && pat==='bal' && n==='Single Leg Calf Raises') n='Chair Calf Raises';
  if(pain.indexOf('bahu')>=0 && pat==='push') n='Wall Push Up';
  if(pain.indexOf('pinggang')>=0 && pat==='hinge') n='Hip Thrust';
  if(pain.indexOf('pinggang')>=0 && pat==='pull') n='Towel Shoulder Back Pull';
  if(pain.indexOf('lantai')>=0){
    if(pat==='bridge') n='Towel Deadlift';
    if(pat==='core') n=wi%2?'Seated Twist':'Seated Knee To Chest';
    if(pat==='push' && n==='Knee Push Ups') n='Incline Push Up (Chair)';
  }
  return n;
}
/* a session: its type, its four moves, the load of its week */
function mfSession(gi,meArg){
  if(gi<0 || gi>=MF_N) return null;
  const me=meArg===undefined?mfMe():meArg, wi=mfWeekOf(gi), t=MF_TYPES[MF_ORDER[gi]], L=MF_LOAD[wi];
  let r=L[2];
  if(me && me.masa===15) r=Math.min(r,2);
  const rest=L[1];
  if(wi===MF_WK-1 && ((me && me.masa===25) || mfPathOf(me)===2) && !(me && me.masa===15)) r=4;
  const main=[]; t.p.forEach(p=>{ let n=mfMove(p,wi,me); if(main.some(x=>x.n===n)) n=MF_PAT[p].l[1]; main.push({n, p}); });
  return {gi, type:MF_ORDER[gi], n:t.n, wi, w:L[0], rest, r, main, warm:MF_WARM, cool:MF_COOL};
}
/* a move as the player plays it: the main library's clip, or MAK2FIT's woman coach for the stretches */
function mfEx(n,dur,rest,cue){
  let e=DB.filter(x=>x.n===n && x.v)[0] || null, v='', h='', m='Full Body', t='full';
  if(e){ v=e.v; m=e.m; t=e.t; }
  else if(typeof LB30_DEMO!=='undefined' && LB30_DEMO[n]){
    const p=String(LB30_DEMO[n]).split('/'); v=p[0]||''; h=p[1]||'';
    const mm=(typeof LB30_DEMO_M!=='undefined' && LB30_DEMO_M[n])||['Mobility','mobility']; m=mm[0]; t=mm[1];
  }
  const o={n, v, m, t, dur, rest, eq:'Bodyweight'};
  if(h) o.h=h; if(cue) o.cue=cue;
  return o;
}
function mfCue(p){ const c=MF_TECH[p]; return c ? c[0].join(' ')+' Elak: '+c[1].toLowerCase()+'.' : ''; }
/* the whole session, warm-up to cool-down, in one list (rounds unrolled) */
function mfExercises(s){
  const out=[];
  s.warm.forEach((n,i)=>out.push(mfEx(n,30,i===s.warm.length-1?15:0)));
  for(let r=0;r<s.r;r++) s.main.forEach((x,i)=>{
    const last=r===s.r-1 && i===s.main.length-1;
    out.push(mfEx(x.n,s.w,last?15:s.rest,mfCue(x.p)));
  });
  s.cool.forEach((n,i)=>out.push(mfEx(n,40,0)));
  return out;
}
function mfSecs(s){ return mfExercises(s).reduce((a,e)=>a+e.dur+(e.rest||0),0); }
function mfMinutes(s){ return Math.max(1,Math.round(mfSecs(s)/60)); }
function mfInDB(n){ return DB.some(x=>x.n===n && x.v) || (typeof LB30_DEMO!=='undefined' && !!LB30_DEMO[n]); }

/* ── the program's home ── */
let mfTab='plan', mfWeek=-1, mfLsOpen=-1;
function mfScrollTabs(){ try{ const s=$('screen'), a=$('mf-tabs'); if(s&&a&&a.offsetTop) s.scrollTop=Math.max(0,a.offsetTop-70); }catch(e){} }
function mfSetTab(t){ mfTab=t; renderMF(); mfScrollTabs(); }
function mfHero(){
  return '<div class="mf-hero"><div class="mf-hero-k mf-wk">'+MF_WK+' Weeks of</div>'+
    '<div class="mf-hero-t">THE <b>START.</b></div><div class="mf-hero-pill">Program untuk anda yang baru mula</div>'+
    '<div class="lbx-tags"><span>'+MF_WK+' minggu</span><span>'+MF_N+' sesi</span><span>15–25 min</span><span>Di rumah</span></div></div>';
}
function renderMF(){
  if(mfQ>=0){ $('pgd-body').innerHTML=mfQuiz(); return; }
  const owned=mfOwned(), done=mfDone(), nx=done;
  if(mfWeek<0) mfWeek=mfWeekOf(Math.min(nx,MF_N-1));
  const pill=!owned ? {icon:'lock',label:'RM'+MF_PRICE,go:'mfBuy()'}
           : nx<MF_N ? {icon:'play',label:'Sesi '+(nx+1),go:'mfOpenSession('+nx+')'} : null;
  let h=pdxBar('program',pill)+mfHero()+'<div class="lbx mf">';
  if(!owned){
    h+='<div class="lbx-card lbx-sell"><div class="lbx-k">Untuk yang baru mula</div>'+
      '<div class="lbx-h">Tak tahu nak mula dari mana? Mula di sini.</div>'+
      '<div class="lbx-p">'+MF_N+' sesi berpandu di rumah, setiap gerakan diajar, ada versi lebih mudah, dan pelajaran makan cara Malaysia. Tanpa gym, tanpa diet ekstrem.</div>'+
      '<button class="lbx-go" onclick="mfBuy()">'+glyph('lock')+'Dapatkan THE START · RM'+MF_PRICE+'</button>'+
      '<button class="lbx-ghost" onclick="openPaywall(\'THE START is included in HITFAT+.\')">'+glyph('star')+'Included in HITFAT+</button></div>';
  } else if(!mfMe()){
    h+='<div class="lbx-card lbq-invite"><div class="lbx-k">'+(done?'Pelan anda':'Sebelum Sesi 1')+'</div>'+
      '<div class="lbx-h">Jom pilih laluan anda.</div>'+
      '<div class="lbx-p">'+mfQCount()+' soalan, 2 minit. Jawapan anda memilih versi gerakan dan masa setiap sesi.</div>'+
      '<button class="lbx-go" onclick="mfQuizOpen()">'+glyph('sliders')+'Bina Pelan Saya</button>'+
      (done?'<button class="lbx-ghost" onclick="mfOpenSession('+Math.min(nx,MF_N-1)+')">'+glyph('play')+'Teruskan Sesi '+(Math.min(nx,MF_N-1)+1)+'</button>':'')+'</div>';
  } else if(nx<MF_N){
    const s=mfSession(nx), st=typeof liveStreak==='function'?liveStreak():0, nm=mfFirst();
    h+='<div class="lbx-card lbx-now">'+
      '<div class="lbx-now-top">'+lbRing(done/MF_N,84,done+'<i>/'+MF_N+'</i>','sesi')+
        '<div class="lbx-now-tx"><div class="lbx-hello">'+(nm?'Hai, '+hesc(nm):'Hai')+'</div>'+
        '<div class="lbx-h">Sesi '+(nx+1)+' · Minggu '+(s.wi+1)+'</div>'+
        '<div class="lbx-p">'+MF_WEEKS[s.wi].n+'. '+(st>1?st+' hari berturut 🔥':'Satu sesi pada satu masa.')+'</div>'+
        (mfMe()?'<div class="mf-stepln">'+glyph('steps')+'Langkah hari ini <b>'+mfFmt(scDaily().steps)+'</b> / '+mfFmt(mfStepGoal(s.wi))+'</div>':'')+'</div></div>'+
      '<div class="lbx-today mf-today" onclick="mfOpenSession('+nx+')">'+
        '<div class="lbx-today-ph mf-ph mf-'+s.type+'"><span class="lbx-badge">Seterusnya</span><b>'+s.type+'</b></div>'+
        '<div class="lbx-today-b"><div class="lbx-k">'+mfMinutes(s)+' min · '+s.main.length+' gerakan · '+s.r+' pusingan</div>'+
        '<div class="lbx-t">'+s.n+'</div></div></div>'+
      '<button class="lbx-go" onclick="mfPlay('+nx+')">'+glyph('play')+'Mula · '+mfMinutes(s)+' min</button></div>';
  } else {
    h+='<div class="lbx-card lbx-now lbx-fin">'+lbRing(1,84,''+MF_N,'sesi')+
      '<div class="lbx-h">THE START selesai</div><div class="lbx-p">'+MF_N+' sesi. Tengok sejauh mana anda pergi.</div>'+
      '<button class="lbx-ghost" onclick="mfSetTab(\'progress\')">'+glyph('trophy')+'Lihat Kemajuan</button></div>'+mfNextCard();
  }
  if(owned) h+=mfRecDue()+mfLessonDue();
  h+='<div class="lbx-seg" id="mf-tabs">'+[['plan','Pelan'],['learn','Belajar'],['progress','Kemajuan']]
    .map(t=>'<button class="'+(mfTab===t[0]?'on':'')+'" onclick="mfSetTab(\''+t[0]+'\')">'+t[1]+'</button>').join('')+'</div>';
  if(mfTab==='learn') h+=mfLearn();
  else if(mfTab==='progress') h+=mfProgress();
  else h+=mfPlan();
  h+='</div>';
  $('pgd-body').innerHTML=h;
}

/* ── the questionnaire (MAK2FIT's way: one question a screen) ── */
const MF_Q=[
  {k:'why', t:'Kenapa anda mula?', s:'Tiada jawapan salah.', o:[
    ['mula','Baru nak mula bersenam','','sunrise'],['semula','Nak aktif semula','Pernah, tapi dah lama berhenti','flame'],
    ['tenaga','Nak lebih bertenaga','','bolt'],['kuat','Nak kuat untuk kerja harian','Angkat barang, naik tangga, main dengan anak','workout']]},
  {k:'act', t:'Seberapa aktif anda sekarang?', s:'Jujur. Boleh ubah kemudian.', o:[
    ['tiada','Hampir tiada','Banyak duduk','home'],['jalan','Jalan kadang-kadang','','steps'],['aktif','Aktif sikit','Bergerak atau bersenam 1–2 kali seminggu','flame']]},
  {k:'exp', t:'Pengalaman bersenam?', s:'', o:[
    ['tak','Tak pernah','','sunrise'],['dulu','Pernah, dah lama berhenti','','clock'],['program','Pernah ikut program','','check']]},
  {k:'masa', t:'Berapa lama setiap sesi?', s:'Pemanasan dan penyejukan sudah termasuk.', o:[
    [15,'15 minit','Dua pusingan sahaja','clock'],[20,'20 minit','Ikut pelan','clock'],[25,'25 minit','Satu pusingan lagi di minggu 6','clock']]},
  {k:'alat', multi:true, t:'Apa yang ada di rumah?', s:'Kerusi diperlukan. Tuala dan botol air untuk gerakan tarik.', o:[
    ['kerusi','Kerusi yang stabil','Tidak beroda, tidak bergoyang','chair'],['tuala','Tuala','','mat'],['botol','Botol air','','bottle']]},
  {k:'pain', multi:true, t:'Ada bahagian yang kurang selesa?', s:'Kami tukar gerakan yang membebankannya.', o:[
    ['lutut','Lutut','','person'],['bahu','Bahu','','person'],['pinggang','Pinggang atau belakang bawah','','person'],
    ['lantai','Sukar turun dan bangun dari lantai','','person'],['tiada','Tiada','Badan okey','check']]},
  {k:'sihat', multi:true, t:'Saringan kesihatan', s:'Pilih semua yang berkaitan. Disimpan dalam akaun anda sahaja.', o:[
    ['dada','Sakit dada ketika aktif','','heart'],['pening','Pening atau pernah pitam','','heart'],
    ['jantung','Doktor pernah kata ada masalah jantung atau tekanan darah','','heart'],['hamil','Mengandung atau baru bersalin','','heart'],
    ['cedera','Pembedahan atau kecederaan baru','','heart'],['kronik','Sakit berpanjangan atau penyakit kronik','','heart'],['tiada','Tiada','Setakat yang saya tahu','check']]},
  {k:'days', multi:true, max:3, t:'Hari latihan pilihan?', s:'Pilih 3 hari, dengan satu hari rehat di antaranya jika boleh.', grid:true,
    o:MF_DAYS.map(d=>[d[0],d[1],'','calendar'])},
  {k:'makan', t:'Selalu makan di mana?', s:'Untuk tip pemakanan yang sesuai.', o:[
    ['rumah','Rumah','','home'],['kedai','Kedai','','food'],['campur','Campur','','food']]}
];
let mfQ=-1, mfQA=null;
function mfQuizOpen(at){
  mfQA=JSON.parse(JSON.stringify(mfData().me||{})); delete mfQA.path;
  mfQ=at||0; hidePanels(); $('progdetail').style.display='block'; renderMF(); $('screen').scrollTop=0;
}
function mfQuizNext(){ mfQ++; renderMF(); $('screen').scrollTop=0; }
function mfQuizBack(){ if(mfQ<=0){ mfQ=-1; renderMF(); return; } mfQ--; renderMF(); $('screen').scrollTop=0; }
function mfQPick(k,v,multi){
  if(multi){
    const q=MF_Q.filter(x=>x.k===k)[0]||{};
    let l=(mfQA[k]||[]).slice(); const i=l.indexOf(v);
    if(v==='tiada') l=i>=0?[]:['tiada'];
    else { l=l.filter(x=>x!=='tiada'); if(i>=0) l.splice(i,1); else { if(q.max && l.length>=q.max) l.shift(); l.push(v); } }
    mfQA[k]=l; if(k==='sihat' && !mfRiskOf(mfQA)) delete mfQA.clear; renderMF(); return;
  }
  mfQA[k]=v; mfQuizNext();
}
function mfQCount(){ return MF_Q.length; }
function mfQOk(q){
  const v=mfQA[q.k];
  if(q.multi) return !!(v && v.length) && (!q.max || v.length===q.max) && !(q.k==='sihat' && mfRiskOf(mfQA) && !mfQA.clear);
  return v!==undefined && v!==null && v!=='';
}
function mfQuiz(){
  const n=MF_Q.length;
  let h='<div class="lbq mf">';
  const bar='<div class="lbq-top"><button class="pdx-back" aria-label="Back" onclick="mfQuizBack()">'+glyph('chevleft')+'</button>'+
    '<div class="lbq-bar"><i style="width:'+Math.round(Math.min(mfQ,n)/n*100)+'%"></i></div><span class="lbq-n">'+Math.min(mfQ,n)+'/'+n+'</span></div>';
  if(mfQ===0){
    const nm=mfFirst();
    return h+bar+'<div class="mf-hero mf-qhero"><div class="mf-hero-t">THE <b>START.</b></div>'+
      '<div class="mf-hero-s">Jom pilih laluan anda'+(nm?', '+hesc(nm):'')+'.</div></div>'+
      '<div class="lbq-p">'+n+' soalan, lebih kurang 2 minit. Jawapan anda memilih laluan Mudah, Asas atau Beransur, dan masa setiap sesi.</div>'+
      '<div class="lbq-list">'+[['person','Tahap dan pengalaman anda'],['clock','Masa dan alat di rumah'],['heart','Keselesaan badan dan saringan kesihatan'],['calendar','Hari latihan']]
        .map(x=>'<div><span>'+glyph(x[0])+'</span>'+x[1]+'</div>').join('')+'</div>'+
      '<button class="lbx-go" onclick="mfQuizNext()">'+glyph('play')+'Mula</button></div>';
  }
  if(mfQ>n) return h+mfQuizResult()+'</div>';
  const q=MF_Q[mfQ-1], v=mfQA[q.k];
  h+=bar+'<div class="lbq-q">'+hesc(q.t)+'</div>'+(q.s?'<div class="lbq-s">'+hesc(q.s)+'</div>':'');
  h+='<div class="lbq-opts'+(q.grid?' grid':'')+'">'+q.o.map(o=>{
    const on=q.multi ? (v||[]).indexOf(o[0])>=0 : v===o[0];
    return '<button class="lbq-o'+(on?' on':'')+'" onclick="mfQPick(\''+q.k+'\','+(typeof o[0]==='number'?o[0]:'\''+o[0]+'\'')+(q.multi?',1':'')+')">'+
      '<span class="ic">'+glyph(o[3])+'</span><span class="tx"><b>'+hesc(o[1])+'</b>'+(o[2]?'<small>'+hesc(o[2])+'</small>':'')+'</span>'+
      '<span class="tk">'+(on?glyph('check'):'')+'</span></button>';
  }).join('')+'</div>';
  if(q.k==='sihat' && mfRiskOf(mfQA)){
    const preg=(mfQA.sihat||[]).indexOf('hamil')>=0;
    h+='<div class="lbq-warn">'+glyph('heart')+'<div><b>Dapatkan nasihat dahulu.</b> '+
      (preg?'Semasa mengandung atau selepas bersalin, senaman perlu disesuaikan oleh doktor atau fisioterapis anda. ':'Jumpa doktor atau fisioterapis sebelum mula, dan tunjukkan program ini kepada mereka. ')+
      'THE START akan guna laluan Mudah. Berhenti terus jika sakit tajam, pening, sakit dada atau sesak nafas luar biasa.</div></div>'+
      '<div class="lbq-ticks"><div class="obrow obtick'+(mfQA.clear?' on':'')+'" onclick="mfQA.clear=!mfQA.clear;renderMF()"><span class="box">'+(mfQA.clear?'✓':'')+'</span><span>Saya faham, dan akan dapatkan nasihat</span></div></div>';
  }
  if(q.multi){
    const ok=mfQOk(q);
    h+=(q.max && (v||[]).length && (v||[]).length<q.max?'<div class="lbq-hint">Pilih '+q.max+' hari ('+(v||[]).length+' dipilih).</div>':'')+
      '<button class="lbx-go'+(ok?'':' off')+'" onclick="'+(ok?'mfQuizNext()':'')+'">Seterusnya</button>';
  } else if(v!==undefined && v!==null && v!=='') h+='<button class="lbx-go" onclick="mfQuizNext()">Seterusnya</button>';
  return h+'</div>';
}
function mfQuizResult(){
  const me=Object.assign({},mfQA,{done:true}), path=mfAutoPath(me), s1=mfSession(0,me), s12=mfSession(MF_N-1,me), nm=mfFirst();
  const lines=[]; (me.pain||[]).forEach(p=>{ const t={lutut:'Lutut: duduk-bangun kekal versi kerusi.',bahu:'Bahu: tolak kekal di dinding.',
    pinggang:'Pinggang: bengkok pinggul ditukar kepada jambatan pinggul.',lantai:'Lantai: gerakan lantai ditukar kepada versi duduk atau berdiri.'}[p]; if(t) lines.push(t); });
  if(mfRiskOf(me)) lines.push('Saringan: laluan Mudah, dan dapatkan nasihat sebelum mula.');
  const al=me.alat||[]; if(al.indexOf('tuala')<0) lines.push('Tiada tuala? Gerakan tarik boleh dibuat tanpa tuala, gerak sahaja.');
  const days=(me.days||[]).map(d=>(MF_DAYS.filter(x=>x[0]===d)[0]||['',''])[1]).filter(Boolean);
  return '<div class="lbq-res"><div class="mf-hero mf-qhero"><div class="mf-hero-k">Pelan anda sedia</div><div class="mf-hero-s">'+MF_N+' sesi, untuk '+(nm?hesc(nm):'anda')+'.</div></div>'+
    '<div class="lbq-card"><div class="lbq-ch">'+glyph('workout')+'<b>Laluan</b><span>'+MF_PATHS[path]+'</span></div>'+
      '<div class="lbq-stats"><div><b>'+mfMinutes(s1)+'</b><span>min minggu 1</span></div><div><b>'+mfMinutes(s12)+'</b><span>min minggu '+MF_WK+'</span></div><div><b>3</b><span>sesi seminggu</span></div></div>'+
      '<div class="mf-ladder">'+['squat','push','pull','core'].map(p=>'<div><span>'+MF_PAT[p].n+'</span><b>'+mfMove(p,0,me)+'</b></div>').join('')+'</div></div>'+
    (days.length?'<div class="lbq-chips">'+days.map(x=>'<span>'+x+'</span>').join('')+'</div>':'')+
    (lines.length?'<div class="lbq-lines">'+lines.map(l=>'<div><span>'+glyph('check')+'</span><p>'+l+'</p></div>').join('')+'</div>':'')+
    '<div class="lbq-fine">Bukan rawatan atau program pemulihan. Berhenti jika sakit tajam, pening, sakit dada atau sesak nafas luar biasa.</div>'+
    '<button class="lbx-go" onclick="mfQuizSave()">'+glyph('play')+'Lihat Pelan Saya</button>'+
    '<button class="lbx-ghost" onclick="mfQ=1;renderMF()">Tukar jawapan</button></div>';
}
function mfQuizSave(){
  const d=mfData(); mfQA.done=true; mfQA.at=iso(0); d.me=mfQA;
  HF.save(); mfQ=-1; mfTab='plan'; mfWeek=-1; renderMF(); $('screen').scrollTop=0; toast('Pelan THE START sudah sedia');
}
/* the plan in one card, with the path the person can move up or down */
function mfSetPath(p){ const me=mfMe(); if(!me) return; me.path=p; HF.save(); renderMF(); }
function mfMeCard(){
  const me=mfMe(); if(!me) return '';
  const p=mfPath(), auto=mfAutoPath(me);
  const days=(me.days||[]).map(d=>(MF_DAYS.filter(x=>x[0]===d)[0]||['',''])[1]).filter(Boolean);
  return '<div class="lbx-card lbq-me"><div class="h"><span class="ic">'+glyph('sliders')+'</span><div class="tt"><div class="lbx-k">Pelan anda</div><b>Laluan '+MF_PATHS[p]+'</b></div>'+
    '<button onclick="mfQuizOpen()">'+glyph('pencil')+'Edit</button></div>'+
    '<div class="lbx-split mf-path" role="radiogroup" aria-label="Laluan">'+MF_PATHS.map((x,i)=>
      '<button class="'+(p===i?'on':'')+'" role="radio" aria-checked="'+(p===i)+'" '+(mfRiskOf(me)&&i>0?'disabled ':'')+'onclick="mfSetPath('+i+')">'+x+(i===auto?' ·':'')+'</button>').join('')+'</div>'+
    (days.length?'<div class="lbq-chips row">'+days.map(x=>'<span>'+x+'</span>').join('')+'</div>':'')+
    (mfRiskOf(me)?'<div class="lb-fine">Saringan kesihatan anda: laluan Mudah sehingga doktor atau fisioterapis benarkan lebih.</div>':'')+'</div>';
}

/* ── walking (10 Nov 2026) ──
   Three sessions of about 20 minutes are an hour a week; WHO asks 150
   minutes of moderate activity, and 29.9% of Malaysian adults do not reach
   it (NHMS 2023). So THE START also walks: a daily step goal that starts near
   where the person is and climbs 1,000 a week to 7,000, where most of the
   benefit is reached (Ding et al., Lancet Public Health 2025). The start is
   their own last week of steps when the app has it, else their answer to
   "Seberapa aktif anda sekarang?", and it is kept, so the goal never drifts. */
const MF_STEP_TOP=7000, MF_STEP_FROM={tiada:3000, jalan:4500, aktif:6000};
function mfFmt(n){ return Number(n||0).toLocaleString('en-US'); }
function mfStepBase(){
  const d=mfData(); if(d.stepBase) return d.stepBase;
  const all=HF.data.daily||{}, v=[];
  for(let i=1;i<=7;i++){ const x=all[iso(-i)]; if(x && x.steps>0) v.push(x.steps); }
  const me=mfMe()||{};
  let b=v.length>=3 ? v.reduce((a,c)=>a+c,0)/v.length : (MF_STEP_FROM[me.act]||3000);
  b=Math.max(2000,Math.round(b/500)*500);
  if(mfMe()){ d.stepBase=b; HF.save(); }
  return b;
}
function mfStepGoal(wi){
  const b=mfStepBase();
  return b>=MF_STEP_TOP ? Math.round(b/500)*500 : Math.min(MF_STEP_TOP, b+1000*(Math.max(0,Math.min(MF_WK-1,wi))+1));
}
function mfStepCard(wi){
  const g=mfStepGoal(wi), now=scDaily().steps, pct=Math.min(100,Math.round(now/g*100)), top=mfStepBase()>=MF_STEP_TOP;
  return '<div class="lbx-card mf-steps"><div class="lbx-k">'+glyph('steps')+'Langkah harian · Minggu '+(wi+1)+'</div>'+
    '<div class="lbx-h">'+mfFmt(g)+' langkah sehari</div>'+
    '<div class="pbar mf-bar"><i style="width:'+pct+'%"></i></div>'+
    '<div class="mf-steps-n"><span>Hari ini <b>'+mfFmt(now)+'</b></span><span>'+(now>=g?'✓ Sasaran capai':mfFmt(g-now)+' lagi')+'</span></div>'+
    '<div class="lbx-p">'+(top?'Anda dah aktif. Kekalkan langkah ini setiap hari.':'Naik 1,000 setiap minggu, sampai 7,000.')+
      ' Pada hari tanpa sesi, jalan 10–20 minit: laju sedikit, masih boleh bercakap.</div>'+
    '<button class="lbx-ghost" onclick="scSheet(\'steps\')">'+glyph('steps')+'Kemas kini langkah</button></div>';
}

/* ── Plan: the four weeks as session tiles ── */
function mfPlan(){
  const owned=mfOwned(), done=mfDone(), nx=done;
  let h=owned?mfMeCard():'';
  h+='<div class="lbx-sec"><div class="lbx-sh"><div class="lbx-st">'+MF_N+' Sesi Anda</div><div class="lbx-ss">'+done+' daripada '+MF_N+' siap · 3 sesi seminggu</div></div></div>';
  h+='<div class="lbx-dots">'+MF_ORDER.map((t,i)=>'<i class="'+(i<done?'d':i===nx&&owned?'n':'')+(i&&i%3===0?' gap':'')+'"></i>').join('')+'</div>';
  h+='<div class="lbx-weeks">'+MF_WEEKS.map((x,i)=>
    '<button class="'+(i===mfWeek?'on':'')+'" onclick="mfWeek='+i+';renderMF()"><small>Minggu '+(i+1)+'</small><b>'+(done>=(i+1)*3?'✓ ':'')+x.n+'</b></button>').join('')+'</div>';
  const w=MF_WEEKS[mfWeek]||MF_WEEKS[0], ws=mfSession(mfWeek*3)||{}, L=[ws.w,ws.rest];
  h+='<div class="mf-wcover"><small>Minggu '+(mfWeek+1)+' · Sesi '+(mfWeek*3+1)+'–'+(mfWeek*3+3)+'</small><b>'+w.n+'</b><span>'+w.s+'</span>'+
    '<em>Kerja '+L[0]+' s · rehat '+L[1]+' s</em></div>';
  h+='<div class="lbx-days">'+[0,1,2].map(j=>{
    const gi=mfWeek*3+j, s=mfSession(gi), isDone=gi<done, now=gi===nx&&owned;
    return '<div class="lbx-day'+(isDone?' done':'')+(now?' now':'')+'" onclick="mfOpenSession('+gi+')">'+
      '<div class="lbx-day-n"><small>SESI</small><b>'+(gi+1)+'</b>'+(isDone?'<span class="ck">'+glyph('check')+'</span>':'')+'</div>'+
      '<div class="lbx-day-t">'+s.n+'</div>'+
      '<div class="lbx-day-m">'+s.type+' · '+mfMinutes(s)+' min'+(MF_RECS.indexOf(gi)>=0?' · Rekod':'')+'</div>'+
      (now?'<span class="lbx-day-now">Seterusnya</span>':'')+'</div>';
  }).join('')+'</div>';
  h+=owned?mfStepCard(mfWeek):'<div class="lbx-note leaf"><div class="q">'+glyph('leaf')+'</div><div><div class="k">Hari lain</div><div class="t">Jalan kaki 10–20 minit, dengan sasaran langkah yang naik sedikit setiap minggu.</div></div></div>';
  return h;
}

/* ── a session: what it is, one big button, the three parts ── */
function mfOpenSession(gi){
  const s=mfSession(gi); if(!s) return;
  const owned=mfOwned(), done=gi<mfDone();
  curProg=MF; curDay={p:MF, day:MF.weeks[s.wi].days[gi%3], gi};
  const row=(n,meta,i,cue)=>'<div class="lbx-move" onclick="'+(owned?'mfPlayOne(\''+n.replace(/'/g,"\\'")+'\','+gi+')':'mfBuy()')+'">'+
    '<span class="n">'+i+'</span><div class="tx"><div class="t">'+n+'</div><div class="m">'+meta+'</div>'+(cue||'')+'</div>'+
    '<span class="pl">'+glyph(owned?'play':'lock')+'</span></div>';
  let h=pdxBar('day', owned?{icon:'play',label:'Mula',go:'mfPlay('+gi+')'}:{icon:'lock',label:'RM'+MF_PRICE,go:'mfBuy()'})+
    '<div class="mf-hero mf-day mf-'+s.type+'"><div class="mf-hero-k">Sesi '+(gi+1)+' daripada '+MF_N+' · Minggu '+(s.wi+1)+': '+MF_WEEKS[s.wi].n+(done?' · ✓ Siap':'')+'</div>'+
    '<div class="mf-hero-t sm">'+s.n+'</div></div><div class="lbx mf">';
  h+='<div class="lbx-facts">'+[[mfMinutes(s)+'','minit'],[s.main.length+'','gerakan'],[s.r+'','pusingan'],[s.w+'/'+s.rest,'kerja/rehat']]
    .map(x=>'<div><b>'+x[0]+'</b><span>'+x[1]+'</span></div>').join('')+'</div>';
  if(!owned) h+='<button class="lbx-go" onclick="mfBuy()">'+glyph('lock')+'Buka · RM'+MF_PRICE+'</button>';
  else {
    h+='<button class="lbx-go" onclick="mfPlay('+gi+')">'+glyph('play')+'Mula · '+mfMinutes(s)+' min</button>';
    h+='<button class="lbx-ghost" onclick="mfComplete('+gi+')">'+glyph('check')+'Tanda siap tanpa main</button>';
  }
  h+='<div class="mf-safe">'+glyph('heart')+'<span>Berhenti jika sakit tajam, pening, sakit dada atau sesak nafas luar biasa.</span></div>';
  if(MF_RECS.indexOf(gi)>=0) h+='<div class="lbx-note"><div class="q">'+glyph('chart')+'</div><div><div class="k">Sesi rekod</div><div class="t">Kira berapa kali anda buat duduk-bangun dan tolak dalam 30 saat pertama. Selepas sesi, app akan tanya.</div></div></div>';
  h+='<div class="lbx-sec"><div class="lbx-sh"><div class="lbx-st">1 · Pemanasan</div><div class="lbx-ss">4 minit · tanpa rehat</div></div></div>'+
    '<div class="lbx-moves">'+s.warm.map((n,i)=>row(n,'30 saat',i+1)).join('')+'</div>';
  h+='<div class="lbx-sec"><div class="lbx-sh"><div class="lbx-st">2 · Latihan Utama</div><div class="lbx-ss">'+s.r+' pusingan · kerja '+s.w+' s, rehat '+s.rest+' s</div></div></div>'+
    '<div class="lbx-moves">'+s.main.map((x,i)=>{ const c=MF_TECH[x.p];
      return row(x.n,MF_PAT[x.p].n+' · '+s.w+' saat',i+1,
        '<div class="mf-cue"><div>'+c[0].map(t=>'<span>'+t+'</span>').join('')+'</div><small>Elak: '+c[1]+'. Jika susah: '+c[2].toLowerCase()+'.</small></div>'); }).join('')+'</div>';
  h+='<div class="lbx-sec"><div class="lbx-sh"><div class="lbx-st">3 · Penyejukan</div><div class="lbx-ss">'+Math.round(s.cool.length*40/60*10)/10+' minit · regangan</div></div></div>'+
    '<div class="lbx-moves">'+s.cool.map((n,i)=>row(n,'40 saat',i+1)).join('')+'</div>';
  const ls=MF_LESSON[gi];
  h+='<div class="lbx-note"><div class="q">'+glyph('doc')+'</div><div><div class="k">Pelajaran selepas sesi</div><div class="t"><b>'+ls[0]+'</b></div></div></div>';
  const kit=['ruang selamat','kerusi stabil']; if(s.main.some(x=>/Towel/.test(x.n))) kit.push('tuala'); if(s.main.some(x=>/Bottle/.test(x.n))) kit.push('botol air'); if(s.main.some(x=>/Wall/.test(x.n))) kit.push('dinding');
  h+='<div class="lbx-need"><span>'+glyph('mat')+'</span>Anda perlukan: '+kit.join(', ')+'</div></div>';
  $('dd-body').innerHTML=h;
  hidePanels(); $('daydetail').style.display='block'; $('screen').scrollTop=0;
}
function mfPlay(gi){
  const s=mfSession(gi); if(!s) return;
  if(!mfOwned()) return mfBuy();
  if(!mfMe()) return mfQuizOpen();
  startWorkout(mfExercises(s),{rounds:1, name:'THE START · Sesi '+(gi+1), mf:{gi}, key:MF_KEY+'-s'+gi, pid:MF_ID, gi});
}
function mfPlayOne(n,gi){
  if(!mfOwned()) return mfBuy();
  const s=mfSession(gi), x=s.main.filter(m=>m.n===n)[0];
  startWorkout([mfEx(n,x?s.w:30,0,x?mfCue(x.p):'')],{rounds:1, name:n, mf:{gi:-1,back:gi}});
}
function mfAfterSession(m){
  if(m.gi<0) return mfOpenSession(m.back);
  hidePanels(); $('progdetail').style.display='block'; mfTab='plan';
  if(m.gi<mfDone()) mfLsOpen=m.gi;
  renderMF(); $('screen').scrollTop=0;
}
function mfComplete(gi){
  const s=mfSession(gi);
  HF.markDone(MF_KEY+'-s'+gi,{name:'THE START · Sesi '+(gi+1), mins:mfMinutes(s)});
  if(progDone(MF_ID)===gi) HF.data.progress[MF_ID]=gi+1;
  HF.save(); toast('Sesi siap 🔥'); mfLsOpen=gi;
  hidePanels(); $('progdetail').style.display='block'; renderMF(); $('screen').scrollTop=0;
}

/* ── after a session: the record (the first and last sessions), then the lesson ── */
const MF_REC=[['sq','Duduk-bangun','kali'],['pu','Tolak','kali'],['yk','Yakin (1–5)','/ 5']];
function mfRecKey(gi){ return 's'+(gi+1); }
function mfRecDue(){
  const done=mfDone(), d=mfData();
  const gi=MF_RECS.filter(g=>g<done && !d.rec[mfRecKey(g)])[0];
  if(gi===undefined) return '';
  return '<div class="lbx-card mf-rec"><div class="lbx-k">Rekod sesi '+(gi+1)+'</div>'+
    '<div class="lbx-h">'+(gi===0?'Rekod permulaan anda':'Bandingkan dengan sesi 1')+'</div>'+
    '<div class="lbx-p">Ikut ingatan, dalam 30 saat pertama latihan utama. Tak ingat? Langkau.</div>'+
    '<div class="esfields">'+MF_REC.map(x=>'<label class="esf"><span>'+x[1]+'</span><input class="inp" id="mfr-'+x[0]+'" inputmode="numeric" placeholder="0" aria-label="'+x[1]+'"><em>'+x[2]+'</em></label>').join('')+'</div>'+
    '<button class="lbx-go" onclick="mfRecSave('+gi+')">'+glyph('check')+'Simpan</button>'+
    '<button class="lbx-ghost" onclick="mfRecSkip('+gi+')">Langkau</button></div>';
}
function mfRecSave(gi){
  const g=k=>parseInt(($('mfr-'+k)||{}).value,10)||0, yk=Math.max(0,Math.min(5,g('yk')));
  mfData().rec[mfRecKey(gi)]={sq:g('sq'), pu:g('pu'), yk, at:iso(0)}; HF.save(); toast('Rekod disimpan'); renderMF();
}
function mfRecSkip(gi){ mfData().rec[mfRecKey(gi)]={skip:true, at:iso(0)}; HF.save(); renderMF(); }
/* the lesson of the session just done, until it is read */
function mfLessonDue(){
  const done=mfDone(), d=mfData();
  let gi=mfLsOpen>=0 && mfLsOpen<done ? mfLsOpen : -1;
  if(gi<0) for(let i=done-1;i>=Math.max(0,done-1);i--) if(!d.lesson[i]) gi=i;
  if(gi<0 || (d.lesson[gi] && mfLsOpen!==gi)) return '';
  const ls=MF_LESSON[gi];
  return '<div class="lbx-card mf-lesson"><div class="lbx-k">Pelajaran · Sesi '+(gi+1)+'</div><div class="lbx-h">'+ls[0]+'</div>'+
    '<p>'+ls[1]+'</p><button class="lbx-go" onclick="mfLsDone('+gi+')">'+glyph('check')+(d.lesson[gi]?'Tutup':'Faham')+'</button></div>';
}
function mfLsDone(gi){ mfData().lesson[gi]=true; mfLsOpen=-1; HF.save(); renderMF(); }
function mfLsShow(gi){ mfLsOpen=gi; mfTab='plan'; renderMF(); $('screen').scrollTop=0; }

/* ── Belajar: the technique cards and the lessons so far ── */
function mfLearn(){
  if(!mfOwned()) return mfLocked('doc','Belajar Asas','Kad teknik untuk setiap gerakan dan '+MF_N+' pelajaran ringkas tentang latihan dan makan cara Malaysia.');
  const done=mfDone(), me=mfMe();
  let h='<div class="lbx-sec"><div class="lbx-sh"><div class="lbx-st">Kad Teknik</div><div class="lbx-ss">Tiga isyarat, satu kesilapan biasa, satu cara lebih mudah</div></div></div>';
  h+='<div class="mf-tech">'+Object.keys(MF_TECH).map(p=>{ const c=MF_TECH[p];
    return '<div class="lbx-card"><div class="lbx-k">'+MF_PAT[p].n+'</div><b>'+mfMove(p,mfWeekOf(Math.min(done,MF_N-1)),me)+'</b>'+
      '<ol>'+c[0].map(t=>'<li>'+t+'</li>').join('')+'</ol><div class="no">Elak: '+c[1]+'</div><div class="ez">Jika susah: '+c[2]+'</div></div>'; }).join('')+'</div>';
  h+='<div class="lbx-sec"><div class="lbx-sh"><div class="lbx-st">Pelajaran</div><div class="lbx-ss">Terbuka selepas setiap sesi</div></div></div>';
  h+='<div class="lbx-card lbx-cl">'+MF_LESSON.map((l,i)=>{
    const open=i<done;
    return '<div class="lbx-cr'+(mfData().lesson[i]?' on':'')+'"'+(open?' onclick="mfLsShow('+i+')"':'')+'><span class="ck'+(mfData().lesson[i]?' on':'')+'">'+glyph(open?(mfData().lesson[i]?'check':'doc'):'lock')+'</span>'+
      '<div class="tx"><span class="k">Sesi '+(i+1)+({L:' · Latihan',M:' · Makan',S:' · Semak'}[l[2]]||'')+'</span><b class="w">'+(open?l[0]:'Selepas sesi '+(i+1))+'</b></div>'+(open?'<span class="pdx-chev">›</span>':'')+'</div>';
  }).join('')+'</div>';
  return h;
}

/* ── Kemajuan: sessions, how they felt, the two records side by side ── */
function mfProgress(){
  if(!mfOwned()) return mfLocked('chart','Kemajuan','Sesi siap, rasa setiap sesi, dan rekod sesi 1 berbanding sesi '+MF_N+'.');
  const done=mfDone(), S=HF.data.sessions||{}, d=mfData(), f={easy:0,right:0,hard:0};
  for(let i=0;i<MF_N;i++){ const x=S[MF_KEY+'-s'+i]; if(x && f[x.feel]!==undefined) f[x.feel]++; }
  const mins=MF_ORDER.reduce((a,t,i)=>{ const x=S[MF_KEY+'-s'+i]; return a+(x&&x.mins||0); },0);
  let h='<div class="lbx-facts">'+[[done+'/'+MF_N,'sesi siap'],[mins+'','minit'],[(typeof liveStreak==='function'?liveStreak():0)+'','hari berturut']]
    .map(x=>'<div><b>'+x[0]+'</b><span>'+x[1]+'</span></div>').join('')+'</div>';
  h+='<div class="lbx-sec"><div class="lbx-sh"><div class="lbx-st">Macam mana sesi anda?</div><div class="lbx-ss">Dari jawapan selepas setiap sesi</div></div></div>'+
    '<div class="mf-feel">'+[['easy','Mudah'],['right','Ngam'],['hard','Susah']].map(x=>'<div><b>'+f[x[0]]+'</b><span>'+x[1]+'</span></div>').join('')+'</div>';
  if(f.hard>=2) h+='<div class="lbx-note"><div class="q">'+glyph('heart')+'</div><div><div class="k">Nasihat</div><div class="t">Beberapa sesi terasa susah. Tak apa: tukar ke laluan lebih mudah di tab Pelan, atau ulang minggu ini sebelum naik.</div></div></div>';
  const a=d.rec.s1||{}, b=d.rec['s'+MF_N]||{}, cell=(o,k)=>o.skip||o[k]===undefined?'–':o[k];
  h+='<div class="lbx-sec"><div class="lbx-sh"><div class="lbx-st">Rekod Anda</div><div class="lbx-ss">Sesi 1 berbanding sesi '+MF_N+'</div></div></div>'+
    '<div class="lbx-card mf-recs"><div class="h"><span></span><b>Sesi 1</b><b>Sesi '+MF_N+'</b></div>'+
    MF_REC.map(x=>'<div><span>'+x[1]+'</span><b>'+cell(a,x[0])+'</b><b>'+cell(b,x[0])+'</b></div>').join('')+'</div>'+
    '<div class="lb-fine">Berat, ukuran dan gambar tidak diperlukan dalam THE START. Jangan bandingkan diri dengan orang lain; bandingkan dengan anda pada sesi 1.</div>';
  if(done>=MF_N) h+=mfNextCard();
  return h;
}
/* (10 Nov 2026) after the last session, the next step by name. Six weeks start a
   habit, they do not finish one: in the studies a new habit took a median of
   about two months, and most app beginners stop within the year, so the end
   of THE START points somewhere at once. First its next path (the same twelve
   sessions, each move one step up), then a HITFAT+ program with no jumps:
   Fit After 40, chair-assisted, six weeks. */
const MF_NEXT='f40';
function mfNextCard(){
  const me=mfMe(), p=mfPath(), up=me && !mfRiskOf(me) && p<2, risk=me && mfRiskOf(me);
  const np=typeof findProg==='function'?findProg(MF_NEXT):null, round=mfData().round||1;
  let h='<div class="lbx-card mf-next"><div class="lbx-k">Langkah seterusnya</div><div class="lbx-h">Teruskan rentak ini.</div>'+
    '<div class="lbx-p">Enam minggu ialah permulaan yang kukuh. Tabiat baru biasanya ambil kira-kira dua bulan, jadi jangan berhenti di sini. Pilih dua tabiat untuk diteruskan, dan sambung minggu depan.</div>';
  h+='<div class="mf-nx" onclick="mfRestart()"><span class="n">1</span><div class="tx"><b>'+(up?'THE START · Laluan '+MF_PATHS[p+1]:'Ulang THE START'+(round>1?' (pusingan '+(round+1)+')':''))+'</b>'+
    '<span>'+(up?MF_N+' sesi sama, setiap gerakan naik satu tahap.':risk?'Kekal laluan Mudah sehingga doktor atau fisioterapis benarkan lebih.':'Anda dah di laluan tertinggi. Ulang untuk kukuhkan rutin.')+'</span></div><span class="pdx-chev">›</span></div>';
  if(np) h+='<div class="mf-nx" onclick="openProgram(\''+MF_NEXT+'\')"><span class="n">2</span><div class="tx"><b>'+hesc(np.name)+(contentOpen()?'':' · HITFAT+')+'</b>'+
    '<span>Tiada lompat, guna kerusi, 6 minggu. Lunge, step-up dan beg galas untuk beban.</span></div><span class="pdx-chev">›</span></div>';
  h+='<button class="lbx-ghost" onclick="switchTab(\'train\')">'+glyph('workout')+'Lihat semua program</button></div>';
  return h;
}
function mfRestart(){
  const me=mfMe(), d=mfData();
  /* the finished round is kept, so a second round can be compared with the first */
  d.hist=(d.hist||[]).concat([{round:d.round||1, path:mfPath(), rec:d.rec, at:iso(0)}]);
  d.round=(d.round||1)+1;
  if(me && !mfRiskOf(me)) me.path=Math.min(2,mfPath()+1);
  HF.data.progress[MF_ID]=0; d.lesson={}; d.rec={}; HF.save(); mfTab='plan'; mfWeek=-1; renderMF(); $('screen').scrollTop=0;
  toast('THE START bermula semula · laluan '+MF_PATHS[mfPath()]);
}
function mfLocked(icon,title,text){
  return '<div class="wl-lock">'+ic(icon)+'<div class="t">'+title+'</div><div class="s">'+text+'</div>'+
    '<button class="lbx-go" onclick="mfBuy()">Dapatkan THE START · RM'+MF_PRICE+'</button></div>';
}

/* ── buying it ── */
function mfBuy(){
  if(mfOwned()) return openProgram(MF_ID);
  $('pw-body').innerHTML='<div class="pwtop"><span></span><button class="pwx" aria-label="Close" onclick="closeProduct()">✕</button></div>'+
    '<div class="mf-buy"><div class="mf-hero-t">THE <b>START.</b></div><span>'+MF_WK+' MINGGU · '+MF_N+' SESI · DI RUMAH</span></div>'+
    '<div class="pwlist">'+[
      ['sliders','Laluan anda sendiri','Mudah, Asas atau Beransur, ikut tahap dan keselesaan badan'],
      ['workout',MF_N+' sesi berpandu','Pemanasan, latihan utama, penyejukan. Video setiap gerakan'],
      ['target','Teknik setiap gerakan','Tiga isyarat, kesilapan biasa dan versi lebih mudah'],
      ['food','Makan cara Malaysia','6 pelajaran ringkas. Nasi tetap ada'],
      ['chart','Semak kemajuan','Rekod sesi 1 dan sesi '+MF_N+', tanpa wajib timbang'],
      ['trophy','Milik anda','Bayar sekali. Tiada langganan']]
      .map(b=>'<div class="pwf"><div class="ic"><span class="wl-kic">'+glyph(b[0])+'</span></div><div><div class="t">'+b[1]+'</div><div class="m">'+b[2]+'</div></div></div>').join('')+'</div>'+
    '<div class="pwprice"><div class="p">RM'+MF_PRICE+'</div><div class="per">sekali bayar</div></div>'+
    '<button class="bigbtn" onclick="startCheckout(\'prog_'+MF_ID+'\')">Beli RM'+MF_PRICE+'</button>'+
    '<button class="authalt" onclick="openPaywall(\'THE START is included in HITFAT+.\')">Atau dapatkan semua dengan HITFAT+</button>';
  $('pwm').classList.add('on');
  try{ $('pwm').scrollTop=0; }catch(e){}
}
function mfHomeCard(){
  mfEnsure(); if(!mfLive() || typeof hpoCard!=='function') return '';
  const owned=mfOwned(), done=mfDone();
  if(owned && done>=MF_N) return '';
  if(owned && done) return hpoCard(MF,{wide:true,kick:'Sesi '+(done+1)+' · '+mfMinutes(mfSession(done))+' min',go:'mfOpenSession('+done+')'});
  if(owned) return hpoCard(MF,{wide:true,kick:'Baru · Sedia bila anda sedia',go:"openProgram('"+MF_ID+"')"});
  return hpoCard(MF,{wide:true,kick:'Program Baru · RM'+MF_PRICE,go:"openProgram('"+MF_ID+"')"});
}
