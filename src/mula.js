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

const MF_ID='mula', MF_KEY='mf', MF_PRICE=59;   /* RM59 since 12 Nov 2026 (Seth: "harga RM59"); RM49 on 11 Nov */
const MF_NAME='THE START', MF_SUB='6 Minggu Asas Kecergasan';
/* Before launch only the listed accounts (and anyone who owns it) see it. */
const MF_LIVE=true, MF_TESTERS=['sethnasser1991@gmail.com','hitfat91@gmail.com'];

/* (10 Nov 2026, Seth: "buat 6 minggu", with the poster "6 WEEKS OF THE START.")
   six weeks, eighteen sessions; still one change a week */
/* week names and movement-pattern labels are in English in both languages too
   (13 Nov 2026, Seth: "nama dalam apps tu kena tukar"); the descriptions stay Malay */
const MF_WEEKS=[
  {n:'The Basics',        s:'Teknik, pernafasan dan cara sesi berjalan. Setiap set gerakan dibuat 2 kali.'},
  {n:'One More Time',       s:'Gerakan sama, ulang satu kali lagi.'},
  {n:'Longer',        s:'Buat 40 saat, rehat masih 30 saat. Kenal beza penat dengan sakit.'},
  {n:'Shorter Rest',      s:'Rehat dipendekkan ke 20 saat. Rentak sama.'},
  {n:'Step Up',        s:'Masa sama. Beberapa gerakan naik satu tahap.'},
  {n:'Check and Carry On', s:'Kekalkan rentak, kemudian semak sejauh mana anda pergi.'}
];
const MF_WK=MF_WEEKS.length;
/* by week: seconds of work, seconds of rest, rounds. (10 Nov 2026) one thing
   changes each week, as the program's own lesson says: rounds, then work,
   then rest, then the moves themselves (week 5), then a fourth round for
   those who chose 25 minutes or Beransur (week 6). */
/* (14 Nov 2026) sessions run 14–23 minutes, so the app and /start say "15–20 minit" and the third time
   choice reads "20+ minit" (it adds a round in week 6); its value stays 25 for the answers already saved */
const MF_LOAD=[[30,30,2],[30,30,3],[40,30,3],[40,20,3],[40,20,3],[40,20,3]];
/* the movement patterns. (11 Nov 2026) each path holds a few versions of
   the same pattern at the same level, so a session looks different every
   time the pattern comes back (Seth: "nampak berbeza selalu setiap hari dan
   setiap minggu") while the body learns one pattern: the pattern stays, the
   version turns. "late" are the versions from week 5, one step up. Paths:
   Mudah, Asas, Beransur. */
const MF_PAT={
  squat: {n:'Sit-to-stand',
    l:[['Sit To Stand','Chair Assist Squat Hold','Chair Assist Squat Calf Raise'],['Chair Squat','Chair Squat Pause','Towel Squat Front Raises'],['Bodyweight Squat','Squat Pause','Towel Squat Press']],
    late:[['Chair Squat','Chair Squat Pause','Chair Squat Calf Raises'],['Bodyweight Squat','Squat Pause','Towel Squat Overhead'],null]},
  push:  {n:'Push',
    l:[['Wall Push Up','Towel Shoulder Press','Towel Shoulder Press 2'],['Incline Push Up (Chair)','Incline Wide Push Up','Towel Shoulder Press'],['Knee Push Ups','Incline Wide Push Up','Towel Shoulder Press 2']],
    late:[['Incline Push Up (Chair)','Incline Wide Push Up','Towel Shoulder Press 2'],['Knee Push Ups','Incline Wide Push Up','Towel Shoulder Press 2'],null]},
  bridge:{n:'Hip bridge',
    l:[['Hip Thrust','Towel Glute Bridge'],['Hip Thrust','Towel Glute Bridge','Chair Glute Bridge'],['Hip Thrust','Chair Glute Bridge','Towel Glute Bridge']],
    late:[null,null,['Single Leg Glutes Bridge','Chair Single Leg Glute Bridge']]},
  hinge: {n:'Hip hinge',
    l:[['Towel Deadlift','Hip Thrust'],['Towel Deadlift','Backpack Deadlift'],['Towel Deadlift','Backpack Deadlift','Backpack Good Morning']]},
  pull:  {n:'Pull',
    l:[['Towel Shoulder Back Pull','Towel Rotation Shoulder','Towel Upright Row'],['Towel Shoulder Back Pull','Towel Rotation Shoulder','Towel Upright Row'],['Bottle Bent Over Row','Towel Shoulder Back Pull','Towel Rotation Shoulder']],
    late:[null,['Bottle Bent Over Row','Towel Shoulder Back Pull','Towel Rotation Shoulder'],null]},
  core:  {n:'Core control',
    l:[['Dead Bug','Seated Knee To Chest','Seated Twist'],['Bird Dog','Dead Bug','Towel Side Bend'],['Plank','Bird Dog','Dead Bug','Side Plank']]},
  bal:   {n:'Balance',
    l:[['Chair Assist Hip Abduction','Chair Calf Raises','Chair Kick Back'],['Chair Calf Raises','Chair Assist Hip Abduction','Chair Kick Back','Lateral Step Over'],['Single Leg Calf Raises','Lateral Step Over','Chair Kick Back','Chair Assist Hip Abduction']]},
  cardio:{n:'Stamina',
    l:[['Seated High Knee','Seated Jack'],['Seated High Knee','Seated Jack','High Knee Tap Chair'],['High Knee','Butt Kick','Jumping Jack','Fast Feet']],
    late:[null,['Fast Seated High Knee','High Knee Tap Chair','Butt Kick'],null]}
};
/* what a sore spot or the floor rules out, and what stands in */
const MF_FLOOR=['Hip Thrust','Towel Glute Bridge','Chair Glute Bridge','Chair Single Leg Glute Bridge','Single Leg Glutes Bridge','Dead Bug','Bird Dog','Plank','Side Plank','Knee Push Ups'];
const MF_SEATED_CORE=['Seated Twist','Seated Knee To Chest','Towel Side Bend','Chair Russian Twist'];
const MF_TYPES={
  A:{n:'Sit-to-Stand & Push', p:['squat','push','bridge','core']},
  B:{n:'Hips & Balance',   p:['hinge','pull','bal','core']},
  C:{n:'Combo & Stamina',     p:['squat','push','pull','cardio']}
};
/* each session's name turns with the week too, so the list never repeats. In English in both
   languages (12 Nov 2026, Seth: "nama training ... guna bahasa English") */
const MF_NAMES={
  A:['Sit-to-Stand & Push','Legs & Chest','Glutes & Shoulders','Steady Legs','Step Up: Legs & Chest','Full-Body Strength'],
  B:['Hips & Balance','Back & Posture','Balance & Control','Strong Hips','Step Up: Back','Stand Tall'],
  C:['Combo & Stamina','Breath & Rhythm','Full Circuit','More Stamina','Step Up: Stamina','Final Round']
};
const MF_ORDER=[].concat.apply([],MF_WEEKS.map(()=>['A','B','C']));
const MF_N=MF_ORDER.length, MF_RECS=[0,MF_N-1];
/* three warm-ups and three cool-downs, turning by session and week */
const MF_WARMS=[
  ['Arm Forward Circle','Arm Back Circle','Seated High Knee','Calf Raises','Chair Squat','IC Warm'],
  ['Arm Back Circle','Towel Rotation Shoulder','Seated Jack','Calf Raises','Seated Twist','Sit To Stand'],
  ['Arm Forward Circle','Towel Side Bend','High Knee Tap Chair','Chair Calf Raises','Chair Squat','IC Warm']];
const MF_COOLS=[
  ['Knee to Chest','Back Stretch','Butterfly Stretch','Side Abs Stretch','Cobra Stretch'],
  ['Cobra Stretch','Side Abs Stretch','Knee to Chest','Butterfly Stretch','Seated Twist'],
  ['Back Stretch','Seated Twist','Butterfly Stretch','Knee to Chest','Side Abs Stretch']];
/* (14 Nov 2026) for "Sukar turun dan bangun dari lantai": the cool-down stays on the chair and on
   the feet too, as the moves already do (the stretches above are on the floor) */
const MF_COOLS_UP=[
  ['Seated Twist','Seated Knee To Chest','Towel Side Bend','Towel Rotation Shoulder','Arm Back Circle'],
  ['Towel Rotation Shoulder','Seated Twist','Towel Side Bend','Seated Knee To Chest','Arm Forward Circle'],
  ['Seated Knee To Chest','Towel Side Bend','Seated Twist','Arm Back Circle','Towel Rotation Shoulder']];
const MF_WARM=MF_WARMS[0], MF_COOL=MF_COOLS[0];
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
  ['Semak dan sambung','Bandingkan rekod anda dengan sesi 1. Pilih dua tabiat untuk diteruskan. Kemudian ulang THE START pada tahap seterusnya, atau teruskan dengan program HITFAT+.','S']
];
const MF_DAYS=[['isn','Isnin'],['sel','Selasa'],['rab','Rabu'],['kha','Khamis'],['jum','Jumaat'],['sab','Sabtu'],['ahd','Ahad']];

const MF=(function(){
  const weeks=MF_WEEKS.map((w,wi)=>({days:[0,1,2].map(j=>{ const t=MF_TYPES[MF_ORDER[wi*3+j]]; return {name:MF_NAMES[MF_ORDER[wi*3+j]][wi], ex:[MF_PAT.squat.l[0][0],'Wall Push Up'], r:MF_LOAD[wi][2], k:'train'}; })}));
  return {id:MF_ID, name:MF_NAME, sub:MF_SUB, goal:'Strength', level:'Beginner', dur:20, rounds:2,
    packHas:'latihan, langkah harian, tabiat makan, 20 scan makanan AI dan Belajar', c1:'#F0531C', c2:'#5C1A03', ac:'#FFF1E2', icon:'✦', weeks, hub:'mf', len:MF_N+' sesi', oneTime:true, price:MF_PRICE, wk:MF_WK,
    desc:'Program asas 6 minggu untuk lelaki dan wanita yang baru mula atau mahu aktif semula. '+
         MF_N+' sesi seluruh badan di rumah, 15–20 minit, dengan teknik setiap gerakan, pelajaran ringkas dan pemakanan Malaysia.'};
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

/* how many sessions before this one already had the pattern */
function mfOcc(gi,pat){ let k=0; for(let g=0;g<gi;g++) if(MF_TYPES[MF_ORDER[g]].p.indexOf(pat)>=0) k++; return k; }
/* the move a pattern gives this person in this week; k turns the version */
function mfMove(pat,wi,me,k){
  const P=MF_PAT[pat], path=mfPathOf(me), pain=(me&&me.pain)||[], has=x=>pain.indexOf(x)>=0;
  /* week 5 steps the moves up one, but not for someone whose health answer
     keeps them on Mudah until a doctor or physio says more */
  let pool=((wi>=4 && !mfRiskOf(me) && P.late && P.late[path]) || P.l[path]).slice();
  if(has('lutut') && pat==='squat') pool=['Sit To Stand'];
  if(has('lutut') && pat==='bal') pool=pool.filter(n=>n!=='Single Leg Calf Raises' && n!=='Lateral Step Over');
  if(has('lutut') && pat==='cardio') pool=['Seated High Knee','Seated Jack'];
  if(has('bahu') && pat==='push') pool=['Wall Push Up'];
  if(has('bahu') && pat==='pull') pool=['Towel Shoulder Back Pull'];
  if(has('pinggang') && pat==='hinge') pool=['Hip Thrust'];
  if(has('pinggang') && pat==='pull') pool=['Towel Shoulder Back Pull'];
  if(has('lantai')){
    /* a sore back with the floor ruled out: the standing kick-back, not a deadlift */
    const hip=has('pinggang')?'Chair Kick Back':'Towel Deadlift';
    if(pat==='bridge') pool=[hip];
    if(pat==='core') pool=MF_SEATED_CORE;
    pool=pool.map(n=>MF_FLOOR.indexOf(n)<0?n:(pat==='push'?'Incline Push Up (Chair)':pat==='hinge'?hip:n));
  }
  /* (14 Nov 2026) no water bottle at home (quiz "alat"): the towel versions instead of the bottle row */
  const al=me&&me.alat; if(Array.isArray(al) && al.indexOf('botol')<0) pool=pool.filter(n=>!/Bottle/.test(n));
  if(!pool.length) pool=[P.l[path][0]];
  return pool[(k||0)%pool.length];
}
/* a session: its type, its four moves, the load of its week */
function mfSession(gi,meArg){
  if(gi<0 || gi>=MF_N) return null;
  const me=meArg===undefined?mfMe():meArg, wi=mfWeekOf(gi), t=MF_TYPES[MF_ORDER[gi]], L=MF_LOAD[wi];
  let r=L[2];
  if(me && me.masa===15) r=Math.min(r,2);
  const rest=L[1];
  if(wi===MF_WK-1 && ((me && me.masa===25) || mfPathOf(me)===2) && !(me && me.masa===15)) r=4;
  /* the first and last sessions hold the record, so their squat and push are
     the same move as session 1, for a fair count */
  const rec=MF_RECS.indexOf(gi)>=0;
  const main=[]; t.p.forEach(p=>{
    let n=rec && (p==='squat'||p==='push') ? mfMove(p,0,me,0) : mfMove(p,wi,me,mfOcc(gi,p));
    if(main.some(x=>x.n===n)) n=mfMove(p,wi,me,mfOcc(gi,p)+1);
    if(main.some(x=>x.n===n)) n=MF_PAT[p].l[1][0];
    main.push({n, p}); });
  return {gi, type:MF_ORDER[gi], n:MF_NAMES[MF_ORDER[gi]][wi], wi, w:L[0], rest, r, main, warm:MF_WARMS[(gi+wi)%3], cool:((me&&me.pain||[]).indexOf('lantai')>=0?MF_COOLS_UP:MF_COOLS)[(gi+wi+1)%3]};
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
function mfCue(p){ const c=MF_TECH[p]; return c ? c[0].map(mfT).join(' ')+' '+mfL('Elak: ','Avoid: ')+mfT(c[1]).toLowerCase()+'.' : ''; }
/* the whole session, warm-up to cool-down, in one list (rounds unrolled) */
function mfExercises(s){
  const out=[];
  s.warm.forEach((n,i)=>{ const e=mfEx(n,30,i===s.warm.length-1?15:0); e.mfw='warm'; out.push(e); });
  for(let r=0;r<s.r;r++) s.main.forEach((x,i)=>{
    const last=r===s.r-1 && i===s.main.length-1;
    const e=mfEx(x.n,s.w,last?15:s.rest,mfCue(x.p)); e.mfp=x.p; out.push(e);
  });
  s.cool.forEach((n,i)=>{ const e=mfEx(n,40,0); e.mfw='cool'; out.push(e); });
  return out;
}
function mfSecs(s){ return mfExercises(s).reduce((a,e)=>a+e.dur+(e.rest||0),0); }
function mfMinutes(s){ return Math.max(1,Math.round(mfSecs(s)/60)); }
function mfInDB(n){ return DB.some(x=>x.n===n && x.v) || (typeof LB30_DEMO!=='undefined' && !!LB30_DEMO[n]); }

/* ── English (10 Nov 2026, Seth: "Tambah English") ──
   THE START reads in Malay by default; BM | EN on its page switches it for
   this person (mfData().lang). The Malay text is the key, so the data above
   stays as it is: mfT(malay) gives the English when it is chosen, and mfL
   takes the two for a line that is built with numbers. */
const MF_EN={
  /* weeks */
  'Belajar Gerakan':'The Basics','Teknik, pernafasan dan cara sesi berjalan. Setiap set gerakan dibuat 2 kali.':'Technique, breathing and how a session runs. Each set of moves done twice.',
  'Tambah Satu Kali':'One More Time','Gerakan sama, ulang satu kali lagi.':'Same moves, one more round.',
  'Lebih Lama':'Longer','Buat 40 saat, rehat masih 30 saat. Kenal beza penat dengan sakit.':'Work 40 seconds, rest stays 30. Know tired from pain.',
  'Rehat Pendek':'Shorter Rest','Rehat dipendekkan ke 20 saat. Rentak sama.':'Rest drops to 20 seconds. Same pace.',
  'Naik Tahap':'Step Up','Masa sama. Beberapa gerakan naik satu tahap.':'Same timing. Some moves step up one level.',
  'Semak dan Sambung':'Check and Carry On','Kekalkan rentak, kemudian semak sejauh mana anda pergi.':'Keep the pace, then see how far you have come.',
  /* patterns, session types, paths */
  'Duduk-bangun':'Sit-to-stand','Tolak':'Push','Jambatan pinggul':'Hip bridge','Bengkok pinggul':'Hip hinge','Tarik':'Pull',
  'Kawalan badan':'Core control','Imbangan':'Balance','Stamina':'Stamina',
  'Duduk-Bangun & Tolak':'Sit-to-Stand & Push','Pinggul & Imbangan':'Hips & Balance','Gabung & Stamina':'Combo & Stamina',
  'Kaki & Dada':'Legs & Chest','Punggung & Bahu':'Glutes & Shoulders','Kaki Tegap':'Steady Legs','Naik Setingkat: Kaki & Dada':'Step Up: Legs & Chest','Kuat Seluruh Badan':'Full-Body Strength',
  'Belakang & Postur':'Back & Posture','Imbangan & Kawalan':'Balance & Control','Pinggul Kuat':'Strong Hips','Naik Setingkat: Belakang':'Step Up: Back','Berdiri Tegak':'Stand Tall',
  'Nafas & Rentak':'Breath & Rhythm','Litar Penuh':'Full Circuit','Stamina Bertambah':'More Stamina','Naik Setingkat: Stamina':'Step Up: Stamina','Pusingan Akhir':'Final Round',
  'Mudah':'Easy','Asas':'Basic','Beransur':'Build',
  /* technique cards */
  'Kaki selebar bahu.':'Feet shoulder-width apart.','Tolak punggung ke belakang seperti nak duduk.':'Push your hips back as if to sit.','Bangun dengan menolak lantai.':'Stand up by pushing the floor away.',
  'Lutut masuk ke dalam':'Knees caving in','Kerusi lebih tinggi, tangan pada peha':'A higher chair, hands on your thighs',
  'Badan lurus dari kepala ke tumit.':'Body straight from head to heels.','Siku 45°, bukan terkeluar ke tepi.':'Elbows at 45°, not flared out.','Hembus nafas semasa menolak.':'Breathe out as you push.',
  'Pinggang jatuh':'Hips sagging','Berdiri lebih dekat dinding':'Stand closer to the wall',
  'Tumit dekat punggung.':'Heels close to your bottom.','Ketatkan punggung, angkat pinggul.':'Squeeze your glutes, lift your hips.','Tahan 1 saat di atas.':'Hold 1 second at the top.',
  'Melengkungkan pinggang':'Arching the lower back','Angkat separuh sahaja':'Lift only halfway',
  'Lutut bengkok sedikit.':'Knees slightly bent.','Tolak punggung ke belakang, belakang lurus.':'Push your hips back, back straight.','Rasa tarikan di belakang peha.':'Feel the stretch behind your thighs.',
  'Membongkok belakang':'Rounding the back','Gerak lebih pendek':'Move a shorter range',
  'Bahu turun, jauh dari telinga.':'Shoulders down, away from your ears.','Rapatkan bilah bahu.':'Squeeze your shoulder blades together.','Gerak perlahan.':'Move slowly.',
  'Mengangkat bahu':'Shrugging','Buat tanpa tuala atau botol':'Do it without the towel or bottle',
  'Pinggang rapat ke lantai, atau belakang neutral.':'Lower back on the floor, or a neutral back.','Bernafas biasa, jangan tahan.':'Breathe normally, do not hold it.',
  'Menahan nafas':'Holding your breath','Gerakkan tangan sahaja, atau kaki sahaja':'Move only the arms, or only the legs',
  'Pegang kerusi.':'Hold the chair.','Pandang satu titik di depan.':'Look at one point in front.','Gerak terkawal.':'Move with control.',
  'Bersandar ke tepi':'Leaning to the side','Dua tangan pada kerusi':'Both hands on the chair',
  'Duduk atau berdiri tegak.':'Sit or stand tall.','Ikut rentak sendiri.':'Go at your own pace.','Boleh bercakap, tapi tak boleh menyanyi.':'You can talk, but not sing.',
  'Terlalu laju di awal':'Going too fast at the start','Lebih perlahan, separuh masa':'Slower, for half the time',
  /* lessons */
  'Cara bernafas':'How to breathe','Hembus nafas semasa usaha: bangun, tolak, angkat. Tarik nafas semasa turun. Jangan tahan nafas, walaupun gerakan terasa berat.':'Breathe out on the effort: standing up, pushing, lifting. Breathe in on the way down. Never hold your breath, even when a move feels heavy.',
  'Pinggan seimbang':'A balanced plate','Ikut Pinggan Sihat Malaysia: separuh pinggan sayur dan buah, suku nasi, suku lauk protein. Nasi tetap ada. Yang kita jaga ialah berapa banyak.':"Follow the Malaysian Healthy Plate: half vegetables and fruit, a quarter rice, a quarter protein. Rice stays. What we watch is how much.",
  'Skala usaha 1–10':'Effort from 1 to 10','Sasaran THE START ialah 5 hingga 7: penat, tapi masih boleh bercakap satu ayat. Tahap 9–10 tak perlu. Rutin yang boleh diulang lebih penting daripada sesi yang menyeksa.':'THE START aims for 5 to 7: tired, but you can still say a sentence. 9 to 10 is not needed. A routine you can repeat beats a session that punishes you.',
  'Sukatan guna tangan':'Portions by hand','Lauk protein setapak tangan. Nasi segenggam. Sayur dua genggam. Minyak atau kuah sebesar ibu jari. Tangan anda sentiasa ada, di rumah atau di kedai.':'Protein the size of your palm. Rice one fist. Vegetables two fists. Oil or gravy the size of your thumb. Your hands are always with you, at home or eating out.',
  'Rehat dan lenguh biasa':'Rest and normal soreness','Lenguh 1 hingga 3 hari selepas sesi adalah biasa, terutama minggu pertama. Hari rehat ialah masa badan membina. Jalan santai membantu lenguh hilang lebih cepat.':'Soreness for 1 to 3 days after a session is normal, especially in the first week. Rest days are when your body builds. An easy walk helps soreness pass sooner.',
  'Protein lauk harian':'Protein every day','Ayam, ikan kembung, telur, tempe, tauhu, dhal. Cuba ada satu lauk protein setiap kali makan. Ia bantu anda kenyang lebih lama.':'Chicken, mackerel, eggs, tempeh, tofu, dhal. Try to have one protein at every meal. It keeps you full for longer.',
  'Mencabar atau sakit?':'Challenging or painful?','Penat, berpeluh dan lenguh otot: teruskan. Sakit tajam di sendi, pening, sakit dada atau sesak nafas luar biasa: berhenti terus. Jangan paksa untuk cukupkan rekod.':'Tired, sweaty and sore muscles: carry on. Sharp joint pain, dizziness, chest pain or unusual breathlessness: stop at once. Never push through to finish a record.',
  'Makan di luar':'Eating out','Nasi campur: satu lauk protein, dua jenis sayur, kuah sedikit. Di mamak: pilih yang dibakar atau berkuah jernih, dan teh o kurang manis.':'Mixed rice: one protein, two vegetables, a little gravy. At the mamak: pick grilled or clear soups, and teh o less sweet.',
  'Tidur itu latihan':'Sleep is training','Otot pulih semasa tidur. Sasarkan sekurang-kurangnya 7 jam. Cuba tidur 30 minit lebih awal, dan letak telefon jauh dari katil.':'Muscles recover while you sleep. Aim for at least 7 hours. Try going to bed 30 minutes earlier, with your phone away from the bed.',
  'Air dan minuman manis':'Water and sweet drinks','Bawa botol air ke mana-mana. Teh tarik "kurang manis" atau "kosong" ialah langkah pertama. Tak perlu berhenti terus.':'Carry a water bottle everywhere. Teh tarik "less sweet" or "no sugar" is a first step. No need to stop all at once.',
  'Jalan kaki dikira':'Walking counts','Langkah harian ialah separuh program ini. Jalan lepas makan, parking jauh sedikit, naik tangga. Sepuluh minit tiga kali sehari pun dikira.':'Daily steps are half of this program. Walk after meals, park a little further away, take the stairs. Ten minutes three times a day counts too.',
  'Snek dan gorengan':'Snacks and fried food','Buah, kacang atau telur rebus sebagai snek biasa. Kuih dan gorengan sekali-sekala, bukan setiap hari. Tiada makanan yang haram dalam THE START.':'Fruit, nuts or a boiled egg as your usual snack. Kuih and fried food now and then, not every day. No food is banned in THE START.',
  'Naik tahap sendiri':'Stepping up yourself','Tukar satu perkara sahaja pada satu masa: ulangan, masa, julat atau versi gerakan. Teknik dahulu, baru tambah. Kalau teknik merosot, undur semula.':'Change one thing at a time: reps, time, range or the version of a move. Technique first, then add. If technique slips, step back.',
  'Sarapan yang mengenyangkan':'A filling breakfast','Roti canai atau nasi lemak tetap boleh. Tambah telur, kurangkan kuah, pilih teh o. Sarapan yang ada protein membantu anda kenyang sampai tengah hari.':'Roti canai or nasi lemak are still fine. Add an egg, less gravy, choose teh o. A breakfast with protein helps you stay full until lunch.',
  'Hari susah':'The hard day','Akan ada hari tak larat. Pada hari itu, buat dua gerakan atau jalan 10 minit. Sedikit lebih baik daripada kosong, dan rutin tak putus.':'Some days you will not feel up to it. On those days, do two moves or walk 10 minutes. A little beats nothing, and the routine holds.',
  'Kenduri dan hujung minggu':'Weddings and weekends','Ambil satu pinggan, mula dengan sayur dan lauk. Tiada makanan yang perlu ditinggal. Esoknya, sambung rutin seperti biasa.':'Take one plate, start with vegetables and protein. No food has to be skipped. The next day, carry on as usual.',
  'Bina tabiat':'Build the habit','Latih pada hari dan masa yang sama setiap minggu. Letak kasut atau tuala di tempat yang nampak. Tabiat dibina dengan ulangan, bukan semangat.':'Train on the same days and times each week. Leave your shoes or towel where you can see them. Habits come from repetition, not motivation.',
  'Semak dan sambung':'Check and carry on','Bandingkan rekod anda dengan sesi 1. Pilih dua tabiat untuk diteruskan. Kemudian ulang THE START pada tahap seterusnya, atau teruskan dengan program HITFAT+.':'Compare your record with session 1. Pick two habits to keep. Then repeat THE START on the next path, or carry on with a HITFAT+ program.',
  /* days */
  'Isnin':'Monday','Selasa':'Tuesday','Rabu':'Wednesday','Khamis':'Thursday','Jumaat':'Friday','Sabtu':'Saturday','Ahad':'Sunday',
  /* the questions */
  'Kenapa anda mula?':'Why are you starting?','Tiada jawapan salah.':'There is no wrong answer.',
  'Baru nak mula bersenam':'Just starting to exercise','Nak aktif semula':'Getting active again','Pernah, tapi dah lama berhenti':'I used to, but stopped a while ago',
  'Nak lebih bertenaga':'More energy','Nak kuat untuk kerja harian':'Strong for daily life','Angkat barang, naik tangga, main dengan anak':'Lifting things, stairs, playing with the kids',
  'Seberapa aktif anda sekarang?':'How active are you now?','Jujur. Boleh ubah kemudian.':'Be honest. You can change it later.',
  'Hampir tiada':'Hardly at all','Banyak duduk':'I sit a lot','Jalan kadang-kadang':'I walk sometimes','Aktif sikit':'A little active','Bergerak atau bersenam 1–2 kali seminggu':'Moving or exercising 1–2 times a week',
  'Pengalaman bersenam?':'Exercise experience?','Tak pernah':'Never','Pernah, dah lama berhenti':'Yes, but stopped a while ago','Pernah ikut program':'I have followed a program',
  'Berapa lama setiap sesi?':'How long for each session?','Pemanasan dan penyejukan sudah termasuk.':'Warm-up and cool-down included.',
  '15 minit':'15 minutes','Setiap set gerakan 2 kali sahaja':'Two rounds only','20 minit':'20 minutes','Ikut pelan':'As planned','20+ minit':'20+ minutes','Ulang sekali lagi di minggu 6':'One more round in week 6',
  'Apa yang ada di rumah?':'What do you have at home?','Kerusi diperlukan. Tuala dan botol air untuk gerakan tarik.':'A chair is needed. A towel and a water bottle for the pulling moves.',
  'Kerusi yang stabil':'A sturdy chair','Tidak beroda, tidak bergoyang':'No wheels, does not wobble','Tuala':'Towel','Botol air':'Water bottle',
  'Ada bahagian yang kurang selesa?':'Anywhere that feels uncomfortable?','Kami tukar gerakan yang membebankannya.':'We swap the moves that load it.',
  'Lutut':'Knees','Bahu':'Shoulders','Pinggang atau belakang bawah':'Waist or lower back','Sukar turun dan bangun dari lantai':'Hard to get down to and up from the floor','Tiada':'None','Badan okey':'Body feels fine',
  'Saringan kesihatan':'Health check','Pilih semua yang berkaitan. Disimpan dalam akaun anda sahaja.':'Choose all that apply. Kept in your account only.',
  'Sakit dada ketika aktif':'Chest pain when active','Pening atau pernah pitam':'Dizziness or fainting','Doktor pernah kata ada masalah jantung atau tekanan darah':'A doctor has mentioned a heart or blood pressure problem',
  'Mengandung atau baru bersalin':'Pregnant or recently gave birth','Pembedahan atau kecederaan baru':'Recent surgery or injury','Sakit berpanjangan atau penyakit kronik':'Ongoing pain or a chronic condition','Setakat yang saya tahu':'As far as I know',
  'Hari latihan pilihan?':'Which training days?','Pilih 3 hari, dengan satu hari rehat di antaranya jika boleh.':'Choose 3 days, with a rest day between them if you can.',
  'Selalu makan di mana?':'Where do you usually eat?','Untuk tip pemakanan yang sesuai.':'For the right eating tips.','Rumah':'Home','Kedai':'Eating out','Campur':'Both',
  /* records */
  'Yakin (1–5)':'Confidence (1–5)','kali':'reps'
};
function mfEn(){ try{ return mfData().lang==='en'; }catch(e){ return false; } }
function mfT(s){ return mfEn() && MF_EN[s]!==undefined ? MF_EN[s] : s; }
function mfL(ms,en){ return mfEn() ? en : ms; }
function mfSetLang(l){
  mfData().lang=l==='en'?'en':'ms'; HF.save();
  const dd=$('daydetail');
  if(dd && dd.style.display==='block' && curDay && curDay.p===MF) mfOpenSession(curDay.gi); else renderMF();
}
function mfLangBtn(){
  return '<div class="mf-lang" role="group" aria-label="Bahasa / Language">'+
    '<button class="'+(mfEn()?'':'on')+'" aria-pressed="'+!mfEn()+'" onclick="event.stopPropagation();mfSetLang(\'ms\')">BM</button>'+
    '<button class="'+(mfEn()?'on':'')+'" aria-pressed="'+mfEn()+'" onclick="event.stopPropagation();mfSetLang(\'en\')">EN</button></div>';
}

/* ── the program's home ──
   (10 Nov 2026, Seth: "mcm serabut susunan") one thing at a time: the
   photograph, the name and one line; the next session and its button; one
   task due (the record, else the lesson); then the tabs. */
let mfTab='plan', mfWeek=-1, mfLsOpen=-1;
function mfScrollTabs(){ try{ const s=$('screen'), a=$('mf-tabs'); if(s&&a&&a.offsetTop) s.scrollTop=Math.max(0,a.offsetTop-70); }catch(e){} }
function mfSetTab(t){ mfTab=t; renderMF(); mfScrollTabs(); }
function mfHero(){
  return '<div class="mf-top"><div class="mf-top-ph" role="img" aria-label="THE START">'+mfLangBtn()+'</div>'+
    '<div class="mf-top-b"><div class="mf-top-k">'+mfL(MF_WK+' Minggu',MF_WK+' Weeks of')+'</div>'+
    '<div class="mf-top-t">THE <b>START.</b></div>'+
    '<div class="mf-top-s">'+mfL('Program untuk anda yang baru mula','For anyone just starting out')+'</div>'+
    '<div class="mf-top-m">'+MF_N+' '+mfL('sesi','sessions')+' · 15–20 min · '+mfL('di rumah','at home')+' · '+mfL('lelaki & wanita','men & women')+'</div></div></div>';
}

/* ── the program page once the plan is built (11 Nov 2026, Seth showed a
   "today first" app: "ui mcm ni ok tak?"): a small header with the name,
   today's workout as one big card, today's three ticks, today's meals as a
   row of photos, the technique check, then the tabs. The big photograph and
   the how-it-works card stay for the first visit. ── */
const MF_DAYCODE=['ahd','isn','sel','rab','kha','jum','sab'];
function mfTrainDay(){ const me=mfMe(); return !me || !(me.days||[]).length || (me.days||[]).indexOf(MF_DAYCODE[new Date().getDay()])>=0; }
/* ── active days (14 Nov 2026, Seth: "takut ada nak training 4-5 kali seminggu", picked "3 sesi + hari aktif") ──
   THE START stays three sessions a week, so a beginner's body has the days between to recover. Someone who wants to
   move on four or five days picks up to two more in the quiz; on those days the app offers a walk and a ten-minute
   stretch made of THE START's own warm-up and cool-down moves (seated or standing for those who find the floor hard).
   It counts in the streak, not in the 18 sessions. */
const MF_AKTIF_MAX=2;
function mfAktifDays(me){ const d=(me&&me.days)||[]; return ((me&&me.aktif)||[]).filter(x=>x!=='tiada' && d.indexOf(x)<0); }
function mfAktifToday(){ const me=mfMe(); return !!me && !mfTrainDay() && mfAktifDays(me).indexOf(MF_DAYCODE[new Date().getDay()])>=0; }
function mfAktifKey(){ return MF_KEY+'-aktif-'+iso(0); }
function mfAktifDone(){ return !!((HF.data.sessions||{})[mfAktifKey()]); }
function mfAktifList(){
  const me=mfMe(), k=Math.floor(Date.now()/864e5)%3, low=!!me && (me.pain||[]).indexOf('lantai')>=0;
  const L=MF_WARMS[k].map(n=>{ const e=mfEx(n,50,0); e.mfw='warm'; return e; })
    .concat((low?MF_COOLS_UP:MF_COOLS)[k].map(n=>{ const e=mfEx(n,60,0); e.mfw='cool'; return e; }));
  return L;
}
function mfAktifMin(){ return Math.round(mfAktifList().reduce((a,e)=>a+e.dur+(e.rest||0),0)/60); }
function mfAktifPlay(){
  if(!mfOwned()) return mfBuy();
  if(!mfMe()) return mfQuizOpen();
  startWorkout(mfAktifList(),{rounds:1, name:'THE START · '+mfL('Hari Aktif','Active Day'), key:mfAktifKey(), mf:{gi:-1, aktif:1}});
}
function mfDoneToday(){
  const S=HF.data.sessions||{}, t=iso(0);
  for(let i=MF_N-1;i>=0;i--){ const x=S[MF_KEY+'-s'+i]; if(x && x.date){ const d=new Date(x.date);
    if(d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2)===t) return i; } }
  return -1;
}
function mfWalkOn(){ const w=mfData().walk||{}; return !!w[iso(0)]; }
function mfWalkTick(){ const d=mfData(), w=d.walk||(d.walk={}), t=iso(0); if(w[t]) delete w[t]; else w[t]=1; HF.save(); renderMF(); }
function mfHead(){
  const nm=mfFirst(), done=mfDone(), wi=mfWeekOf(Math.min(done,MF_N-1));
  return '<div class="mf-head"><div class="mf-head-k">THE <b>START.</b></div>'+
    '<div class="mf-head-t">'+(nm?mfL('Hai ','Hi ')+hesc(nm)+'!':mfL('Hai!','Hi!'))+'</div>'+
    '<div class="mf-head-s">'+(done>=MF_N?mfL('Program selesai · '+MF_N+' sesi','Program done · '+MF_N+' sessions')
      :mfL('Minggu ','Week ')+(wi+1)+mfL(' daripada ',' of ')+MF_WK+' · '+done+'/'+MF_N+mfL(' sesi siap',' sessions done'))+'</div>'+
    '<div class="mf-head-bar"><i style="width:'+Math.round(done/MF_N*100)+'%"></i></div>'+mfLangBtn()+'</div>';
}
function mfToday(){
  const nx=mfDone(), dt=mfDoneToday(), train=mfTrainDay();
  if(nx>=MF_N) return '';
  const s=mfSession(nx), img=mfSessPic(nx);
  let k, t, m, btn;
  if(dt>=0){
    k=mfL('Latihan hari ini','Today’s workout'); t=mfL('Sesi '+(dt+1)+' selesai ✓','Session '+(dt+1)+' done ✓');
    m=mfL('Bagus. Rehat, minum air, dan jalan santai. Sesi '+(nx+1)+' pada hari latihan seterusnya.','Well done. Rest, drink water and take an easy walk. Session '+(nx+1)+' on your next training day.');
    btn='<button class="mf-link" onclick="mfOpenSession('+nx+')">'+mfL('Lihat sesi ','See session ')+(nx+1)+' ›</button>';
  } else if(!train && mfAktifToday()){
    const ad=mfAktifDone();
    k=mfL('Hari aktif','Active day'); t=ad?mfL('Regangan selesai ✓','Stretch done ✓'):mfL('Jalan 20 minit + regangan '+mfAktifMin()+' minit','Walk 20 min + stretch '+mfAktifMin()+' min');
    m=ad?mfL('Bagus. Jalan santai bila sempat. Sesi '+(nx+1)+' pada hari latihan seterusnya.','Well done. Take an easy walk when you can. Session '+(nx+1)+' on your next training day.')
        :mfL('Hari pilihan anda untuk terus bergerak. Sesi THE START kekal pada hari latihan supaya badan sempat pulih.','Your day to keep moving. THE START’s sessions stay on your training days so your body can recover.');
    btn=ad?'<button class="mf-link" onclick="mfOpenSession('+nx+')">'+mfL('Lihat sesi ','See session ')+(nx+1)+' ›</button>'
          :'<button class="lbx-go" onclick="mfAktifPlay()">'+glyph('play')+mfL('Mula regangan · ','Start stretch · ')+mfAktifMin()+' min</button>';
  } else if(!train){
    k=mfL('Hari rehat','Rest day'); t=mfL('Jalan kaki 20 minit','Walk for 20 minutes');
    m=mfL('Hari ini bukan hari latihan anda. Jalan santai, masih boleh bercakap. Nak buat Sesi '+(nx+1)+' juga? Boleh.','Today is not one of your training days. An easy walk, still able to talk. Want to do Session '+(nx+1)+' anyway? You can.');
    btn='<button class="lbx-ghost mf-today-alt" onclick="mfPlay('+nx+')">'+glyph('play')+mfL('Buat Sesi ','Do Session ')+(nx+1)+' · '+mfMinutes(s)+' min</button>';
  } else {
    k=mfL('Latihan hari ini · Sesi ','Today’s workout · Session ')+(nx+1); t=mfT(s.n);
    m=mfMinutes(s)+' min · '+s.main.length+' '+mfL('gerakan','moves')+' · '+mfL('kerusi','chair')+(s.main.some(x=>/Towel/.test(x.n))?' · '+mfL('tuala','towel'):'');
    btn='<button class="lbx-go" onclick="mfPlay('+nx+')">'+glyph('play')+mfL('Mula','Start')+'</button>'+
      '<button class="mf-link" onclick="mfOpenSession('+nx+')">'+mfL('Lihat gerakan','See the moves')+' ›</button>';
  }
  return '<div class="lbx-card mf-today'+(dt>=0?' done':!train?' rest':'')+(!train&&dt<0&&mfAktifToday()?' aktif':'')+'"><div class="mf-today-tx"><div class="lbx-k">'+k+'</div><div class="lbx-h">'+t+'</div><div class="lbx-p">'+m+'</div>'+btn+'</div>'+
    '<div class="mf-today-ph" style="background-image:url(\''+(dt>=0||!train?'/img/p/mula-hero2.jpg':img)+'\')"></div></div>';
}
function mfTicks(){
  const nx=mfDone(), dt=mfDoneToday(), train=mfTrainDay(), wi=mfWeekOf(Math.min(nx,MF_N-1));
  const g=mfStepGoal(wi), now=scDaily().steps, hb=MF_HABIT[mfMkWeek()], hOn=mfMk()[iso(0)]===mfMkWeek();
  const rows=[
    dt>=0||train ? [dt>=0, mfL('Sesi '+((dt>=0?dt:nx)+1),'Session '+((dt>=0?dt:nx)+1)), dt>=0?mfL('Siap','Done'):mfMinutes(mfSession(Math.min(nx,MF_N-1)))+' min', dt>=0?'':'mfPlay('+nx+')']
                 : [mfWalkOn(), mfL('Jalan kaki 20 minit','Walk 20 minutes'), mfL('Tanda bila siap','Tick when done'), 'mfWalkTick()'],
    [hOn, mfL(hb[0],hb[2]), mfL('Tabiat makan minggu ini','This week’s eating habit'), 'mfMkTick()'],
    [now>=g, mfFmt(g)+mfL(' langkah',' steps'), mfFmt(now)+mfL(' setakat ini',' so far'), "scSheet('steps')"]];
  if(dt<0 && !train && mfAktifToday()) rows.unshift([mfAktifDone(), mfL('Regangan '+mfAktifMin()+' minit','Stretch '+mfAktifMin()+' min'), mfAktifDone()?mfL('Siap','Done'):mfL('Hari aktif','Active day'), mfAktifDone()?'':'mfAktifPlay()']);
  const n=rows.filter(r=>r[0]).length;
  return '<div class="lbx-card mf-ticks"><div class="mf-ticks-h"><b>'+mfL('Hari Ini','Today')+'</b><span>'+(n===rows.length?mfL('Selesai ✓','All done ✓'):n+' / '+rows.length)+'</span></div>'+
    rows.map(r=>'<div class="mf-tk'+(r[0]?' on':'')+'"'+(r[3]?' onclick="'+r[3]+'"':'')+'><span class="ck">'+(r[0]?glyph('check'):'')+'</span><div class="tx"><b>'+r[1]+'</b><span>'+r[2]+'</span></div>'+(r[3]&&!r[0]?'<span class="pdx-chev">›</span>':'')+'</div>').join('')+'</div>';
}
function mfMealRow(){
  const look={sarapan:mfL('Sarapan','Breakfast'),tengahari:mfL('Tengah hari','Lunch'),malam:mfL('Makan malam','Dinner')};
  const cards=['sarapan','tengahari','malam'].map(sl=>{ const o=mfMkDish(sl); if(!o) return '';
    const im=typeof lbDishImg==='function'?lbDishImg(LB30_MENU[sl].opts.indexOf(o)>=0?sl:'tengahari',o):'';
    return '<button class="mf-ml" onclick="mfSetTab(\'food\')"><span class="ph" style="background-image:url(\''+im+'\')"></span><span class="k">'+look[sl]+'</span><b>'+o.n+'</b></button>'; }).join('');
  if(!cards) return '';
  return '<div class="lbx-sec mf-row-h"><div class="lbx-sh"><div class="lbx-st">'+mfL('Makan Hari Ini','Today’s Meals')+'</div></div>'+
    '<button class="mf-row-a" onclick="mfScanGo()">'+glyph('photo')+'Scan</button></div><div class="mf-meals">'+cards+'</div>';
}
function renderMF(){
  if(mfQ>=0){ $('pgd-body').innerHTML=mfQuiz(); return; }
  const owned=mfOwned(), done=mfDone(), nx=done;
  if(mfWeek<0) mfWeek=mfWeekOf(Math.min(nx,MF_N-1));
  const pill=!owned ? {icon:'lock',label:'RM'+MF_PRICE,go:'mfBuy()'}
           : !mfMe() && !nx ? null
           : nx<MF_N ? {icon:'play',label:mfL('Sesi ','Session ')+(nx+1),go:'mfOpenSession('+nx+')'} : null;
  const built=owned && !!mfMe();
  let h=pdxBar('program',pill)+(built?mfHead():mfHero())+'<div class="lbx mf'+(built?' mf-built':'')+'">';
  if(!owned){
    h+='<div class="lbx-card lbx-sell">'+
      '<div class="lbx-h">'+mfL('Tak tahu nak mula dari mana? Mula di sini.','Not sure where to begin? Begin here.')+'</div>'+
      '<div class="lbx-p">'+mfL(MF_N+' sesi berpandu di rumah, setiap gerakan diajar, ada versi lebih mudah, dan pelajaran makan cara Malaysia.',
        MF_N+' guided sessions at home, every move taught with an easier version, and lessons on eating the Malaysian way.')+'</div>'+
      '<button class="lbx-go" onclick="mfBuy()">'+glyph('lock')+mfL('Dapatkan THE START · RM','Get THE START · RM')+MF_PRICE+'</button>'+
      '<button class="lbx-ghost" onclick="openPaywall(\'THE START is included in HITFAT+.\')">'+glyph('star')+mfL('Termasuk dalam HITFAT+','Included in HITFAT+')+'</button></div>';
  } else if(!mfMe() && !done){
    /* (11 Nov 2026, Seth: "kalau kau beginner, kau faham tak?") a first-timer
       sees how THE START runs and one button, nothing else, until the plan is built */
    h+=mfWelcome();
    h+='<div class="lbx-card mf-how"><div class="lbx-k">'+mfL('Macam mana ia berjalan','How it works')+'</div>'+
      '<div class="lbx-h">'+mfL('Tiga langkah. Mula dengan yang pertama.','Three steps. Start with the first.')+'</div>'+
      [[mfL('Jawab '+mfQCount()+' soalan','Answer '+mfQCount()+' questions'),mfL('2 minit. Pelan anda ikut tahap dan keselesaan badan anda.','2 minutes. Your plan fits your level and how your body feels.')],
       [mfL('3 sesi seminggu di rumah','3 sessions a week at home'),mfL('15–20 minit. Video setiap gerakan, dan versi lebih mudah. Cuma perlu kerusi.','15–20 minutes. A video for every move, and an easier version. You only need a chair.')],
       [mfL('Hari lain: jalan kaki dan satu tabiat makan','Other days: walk, and one eating habit'),mfL('Tak perlu kira kalori. Nasi tetap ada.','No calorie counting. Rice stays.')]]
      .map((x,i)=>'<div class="mf-how-s"><span class="n">'+(i+1)+'</span><div class="tx"><b>'+x[0]+'</b><span>'+x[1]+'</span></div></div>').join('')+
      '<button class="lbx-go" onclick="mfQuizOpen()">'+glyph('sliders')+mfL('Bina Pelan Saya','Build My Plan')+'</button></div>';
    h+='</div>'; $('pgd-body').innerHTML=h; return;
  } else if(!mfMe()){
    h+='<div class="lbx-card lbq-invite"><div class="lbx-h">'+mfL('Jom pilih tahap anda.','Let us pick your path.')+'</div>'+
      '<div class="lbx-p">'+mfL(mfQCount()+' soalan, 2 minit. Jawapan anda memilih versi gerakan dan masa setiap sesi.',
        mfQCount()+' questions, 2 minutes. Your answers choose the version of each move and the length of each session.')+'</div>'+
      '<button class="lbx-go" onclick="mfQuizOpen()">'+glyph('sliders')+mfL('Bina Pelan Saya','Build My Plan')+'</button>'+
      (done?'<button class="lbx-ghost" onclick="mfOpenSession('+Math.min(nx,MF_N-1)+')">'+glyph('play')+mfL('Teruskan Sesi ','Continue Session ')+(Math.min(nx,MF_N-1)+1)+'</button>':'')+'</div>';
  } else if(nx<MF_N){
    h+=mfToday()+mfTicks()+(mfRecDue()||mfLessonDue())+mfMealRow()+mfTkBanner();
  } else {
    h+='<div class="lbx-card mf-now mf-fin">'+lbRing(1,64,''+MF_N,'')+
      '<div class="tx"><div class="lbx-h">'+mfL('THE START selesai','THE START is done')+'</div><div class="lbx-p">'+
      mfL(MF_N+' sesi. Tengok sejauh mana anda pergi.',MF_N+' sessions. See how far you have come.')+'</div>'+
      '<button class="mf-link" onclick="mfSetTab(\'progress\')">'+mfL('Lihat Kemajuan','See Progress')+' ›</button></div></div>'+mfNextCard();
  }
  if(owned && !(mfMe() && nx<MF_N)) h+=(mfRecDue()||mfLessonDue()||mfScanCard());
  h+='<div class="lbx-seg" id="mf-tabs">'+[['plan',mfL('Pelan','Plan')],['food',mfL('Makan','Eat')],['learn',mfL('Belajar','Learn')],['progress',mfL('Kemajuan','Progress')]]
    .map(t=>'<button class="'+(mfTab===t[0]?'on':'')+'" onclick="mfSetTab(\''+t[0]+'\')">'+t[1]+'</button>').join('')+'</div>';
  if(mfTab==='food') h+=mfFood();
  else if(mfTab==='learn') h+=mfLearn();
  else if(mfTab==='progress') h+=mfProgress();
  else h+=mfPlan();
  h+='</div>';
  $('pgd-body').innerHTML=h;
}

/* ── Coach Seth's welcome (11 Nov 2026, Seth: "video sambutan coach seth",
   then "buang je terus avatar aku tu, teruskan voiceover je", then "ok on"):
   33 s, his voice over THE START's graphics, for a first visit. A small
   card; a tap plays it full screen, with sound, and ✕ closes it. ── */
const MF_WELCOME='/img/p/mula/sambutan.mp4?v=1', MF_WELCOME_PIC='/img/p/mula/sambutan.jpg?v=1';
function mfWelcome(){
  return '<button class="lbx-card mf-wel" onclick="mfWelcomePlay()"><span class="ph" style="background-image:url(\''+MF_WELCOME_PIC+'\')"><i>'+glyph('play')+'</i></span>'+
    '<span class="tx"><span class="lbx-k">'+mfL('Mula di sini','Start here')+'</span><b>'+mfL('Tonton Coach Seth','Watch Coach Seth')+'</b>'+
    '<span>'+mfL('33 saat: macam mana THE START berjalan.','33 seconds on how THE START works (in Malay).')+'</span></span></button>';
}
function mfWelcomePlay(){
  mfWelcomeClose();
  const o=document.createElement('div'); o.id='mfvov';
  o.innerHTML='<video id="mfv" src="'+MF_WELCOME+'" poster="'+MF_WELCOME_PIC+'" playsinline controls autoplay></video>'+
    '<button class="x" aria-label="'+mfL('Tutup','Close')+'" onclick="mfWelcomeClose()">✕</button>';
  document.body.appendChild(o);
  const v=$('mfv');
  if(v){ try{ const pr=v.play(); if(pr && pr['catch']) pr['catch'](function(){}); }catch(e){}
    v.onended=function(){ mfWelcomeClose(); const d=mfData(); d.welcome=1; HF.save(); }; }
}
function mfWelcomeClose(){ const o=$('mfvov'); if(o){ try{ const v=$('mfv'); if(v) v.pause(); }catch(e){} if(o.parentNode) o.parentNode.removeChild(o); } }

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
    [15,'15 minit','Setiap set gerakan 2 kali sahaja','clock'],[20,'20 minit','Ikut pelan','clock'],[25,'20+ minit','Ulang sekali lagi di minggu 6','clock']]},
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
    mfQA[k]=l; if(k==='sihat' && !mfRiskOf(mfQA)) delete mfQA.clear;
    if(k==='days' && mfQA.aktif) mfQA.aktif=mfQA.aktif.filter(x=>l.indexOf(x)<0);
    renderMF(); return;
  }
  mfQA[k]=v; mfQuizNext();
}
function mfQAktif(c){
  let l=(mfQA.aktif||[]).filter(x=>x!=='tiada' && (mfQA.days||[]).indexOf(x)<0); const i=l.indexOf(c);
  if(i>=0) l.splice(i,1); else { if(l.length>=MF_AKTIF_MAX) l.shift(); l.push(c); }
  mfQA.aktif=l; renderMF();
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
    return h+bar+'<div class="mf-qhero"><div class="mf-top-t">THE <b>START.</b></div>'+mfLangBtn()+
      '<div class="mf-top-s">'+mfL('Jom pilih tahap anda','Let us pick your path')+(nm?', '+hesc(nm):'')+'.</div></div>'+
      '<div class="lbq-p">'+mfL(n+' soalan, lebih kurang 2 minit. Jawapan anda memilih tahap Mudah, Asas atau Beransur, dan masa setiap sesi.',
        n+' questions, about 2 minutes. Your answers choose the Easy, Basic or Build path, and the length of each session.')+'</div>'+
      '<div class="lbq-list">'+[['person',mfL('Tahap dan pengalaman anda','Your level and experience')],['clock',mfL('Masa dan alat di rumah','Time and kit at home')],
        ['heart',mfL('Keselesaan badan dan saringan kesihatan','How your body feels, and a health check')],['calendar',mfL('Hari latihan','Training days')]]
        .map(x=>'<div><span>'+glyph(x[0])+'</span>'+x[1]+'</div>').join('')+'</div>'+
      '<button class="lbx-go" onclick="mfQuizNext()">'+glyph('play')+mfL('Mula','Start')+'</button></div>';
  }
  if(mfQ>n) return h+mfQuizResult()+'</div>';
  const q=MF_Q[mfQ-1], v=mfQA[q.k];
  h+=bar+'<div class="lbq-q">'+hesc(mfT(q.t))+'</div>'+(q.s?'<div class="lbq-s">'+hesc(mfT(q.s))+'</div>':'');
  h+='<div class="lbq-opts'+(q.grid?' grid':'')+'">'+q.o.map(o=>{
    const on=q.multi ? (v||[]).indexOf(o[0])>=0 : v===o[0];
    return '<button class="lbq-o'+(on?' on':'')+'" onclick="mfQPick(\''+q.k+'\','+(typeof o[0]==='number'?o[0]:'\''+o[0]+'\'')+(q.multi?',1':'')+')">'+
      '<span class="ic">'+glyph(o[3])+'</span><span class="tx"><b>'+hesc(mfT(o[1]))+'</b>'+(o[2]?'<small>'+hesc(mfT(o[2]))+'</small>':'')+'</span>'+
      '<span class="tk">'+(on?glyph('check'):'')+'</span></button>';
  }).join('')+'</div>';
  if(q.k==='sihat' && mfRiskOf(mfQA)){
    const preg=(mfQA.sihat||[]).indexOf('hamil')>=0;
    h+='<div class="lbq-warn">'+glyph('heart')+'<div><b>'+mfL('Dapatkan nasihat dahulu.','Get advice first.')+'</b> '+
      (preg?mfL('Semasa mengandung atau selepas bersalin, senaman perlu disesuaikan oleh doktor atau fisioterapis anda. ','During pregnancy or after giving birth, exercise should be adjusted by your doctor or physiotherapist. ')
           :mfL('Jumpa doktor atau fisioterapis sebelum mula, dan tunjukkan program ini kepada mereka. ','See a doctor or physiotherapist before you start, and show them this program. '))+
      mfL('THE START akan guna tahap Mudah. Berhenti terus jika sakit tajam, pening, sakit dada atau sesak nafas luar biasa.','THE START will use the Easy path. Stop at once with sharp pain, dizziness, chest pain or unusual breathlessness.')+'</div></div>'+
      '<div class="lbq-ticks"><div class="obrow obtick'+(mfQA.clear?' on':'')+'" onclick="mfQA.clear=!mfQA.clear;renderMF()"><span class="box">'+(mfQA.clear?'✓':'')+'</span><span>'+
      mfL('Saya faham, dan akan dapatkan nasihat','I understand, and will get advice')+'</span></div></div>';
  }
  if(q.k==='days'){
    const tk=mfQA.days||[], ak=(mfQA.aktif||[]).filter(x=>tk.indexOf(x)<0);
    h+='<div class="mf-qak"><div class="mf-qak-h"><b>'+mfL('Nak bergerak hari lain juga?','Want to move on other days too?')+'</b><span>'+mfL('Pilihan, maksimum '+MF_AKTIF_MAX+' hari','Optional, up to '+MF_AKTIF_MAX+' days')+'</span></div>'+
      '<div class="mf-qak-s">'+mfL('Sesi THE START kekal 3 seminggu supaya badan sempat pulih. Pada hari aktif: jalan 20 minit dan regangan 10 minit.','THE START stays at 3 sessions a week so your body can recover. On an active day: a 20-minute walk and a 10-minute stretch.')+'</div>'+
      '<div class="mf-qak-d">'+MF_DAYS.map(d=>{ const t=tk.indexOf(d[0])>=0, on=ak.indexOf(d[0])>=0;
        return '<button class="'+(t?'t':on?'on':'')+'"'+(t?' disabled':' onclick="mfQAktif(\''+d[0]+'\')"')+'>'+(mfEn()?['Mon','Tue','Wed','Thu','Fri','Sat','Sun']:['Isn','Sel','Rab','Kha','Jum','Sab','Ahd'])[MF_DAYS.indexOf(d)]+(t?'<i>'+mfL('Sesi','Session')+'</i>':on?'<i>'+mfL('Aktif','Active')+'</i>':'')+'</button>'; }).join('')+'</div></div>';
  }
  if(q.multi){
    const ok=mfQOk(q);
    h+=(q.max && (v||[]).length && (v||[]).length<q.max?'<div class="lbq-hint">'+mfL('Pilih '+q.max+' hari ('+(v||[]).length+' dipilih).','Choose '+q.max+' days ('+(v||[]).length+' chosen).')+'</div>':'')+
      '<button class="lbx-go'+(ok?'':' off')+'" onclick="'+(ok?'mfQuizNext()':'')+'">'+mfL('Seterusnya','Next')+'</button>';
  } else if(v!==undefined && v!==null && v!=='') h+='<button class="lbx-go" onclick="mfQuizNext()">'+mfL('Seterusnya','Next')+'</button>';
  return h+'</div>';
}
function mfDayNames(me){ return (me.days||[]).map(d=>mfT((MF_DAYS.filter(x=>x[0]===d)[0]||['',''])[1])).filter(Boolean); }
function mfAktifNames(me){ return mfAktifDays(me).map(d=>mfT((MF_DAYS.filter(x=>x[0]===d)[0]||['',''])[1])).filter(Boolean); }
function mfQuizResult(){
  const me=Object.assign({},mfQA,{done:true}), path=mfAutoPath(me), s1=mfSession(0,me), sN=mfSession(MF_N-1,me), nm=mfFirst();
  const lines=[]; (me.pain||[]).forEach(p=>{ const t={
    lutut:mfL('Lutut: duduk-bangun kekal versi kerusi.','Knees: sit-to-stand stays on the chair.'),
    bahu:mfL('Bahu: tolak kekal di dinding.','Shoulders: push-ups stay on the wall.'),
    pinggang:mfL('Pinggang: bengkok pinggul ditukar kepada jambatan pinggul.','Lower back: the hip hinge becomes a hip bridge.'),
    lantai:mfL('Lantai: gerakan lantai ditukar kepada versi duduk atau berdiri.','Floor: floor moves become seated or standing versions.')}[p]; if(t) lines.push(t); });
  if(mfRiskOf(me)) lines.push(mfL('Saringan: tahap Mudah, dan dapatkan nasihat sebelum mula.','Health check: the Easy path, and get advice before you start.'));
  const al=me.alat||[]; if(al.indexOf('tuala')<0) lines.push(mfL('Tiada tuala? Gerakan tarik boleh dibuat tanpa tuala, gerak sahaja.','No towel? The pulling moves work without one; just make the movement.'));
  const days=mfDayNames(me);
  return '<div class="lbq-res"><div class="mf-qhero"><div class="lbx-k">'+mfL('Pelan anda sedia','Your plan is ready')+'</div><div class="mf-top-s">'+
      mfL(MF_N+' sesi, untuk '+(nm?hesc(nm):'anda')+'.',MF_N+' sessions, for '+(nm?hesc(nm):'you')+'.')+'</div></div>'+
    '<div class="lbq-card"><div class="lbq-ch">'+glyph('workout')+'<b>'+mfL('Tahap','Path')+'</b><span>'+mfT(MF_PATHS[path])+'</span></div>'+
      '<div class="lbq-stats"><div><b>'+mfMinutes(s1)+'</b><span>'+mfL('min minggu 1','min week 1')+'</span></div><div><b>'+mfMinutes(sN)+'</b><span>'+mfL('min minggu ','min week ')+MF_WK+'</span></div><div><b>3</b><span>'+mfL('sesi seminggu','a week')+'</span></div></div>'+
      '<div class="mf-ladder">'+['squat','push','pull','core'].map(p=>'<div><span>'+mfT(MF_PAT[p].n)+'</span><b>'+mfMove(p,0,me)+'</b></div>').join('')+'</div></div>'+
    (days.length?'<div class="lbq-chips">'+days.map(x=>'<span>'+x+'</span>').join('')+mfAktifNames(me).map(x=>'<span class="ak">'+x+' · '+mfL('aktif','active')+'</span>').join('')+'</div>':'')+
    (lines.length?'<div class="lbq-lines">'+lines.map(l=>'<div><span>'+glyph('check')+'</span><p>'+l+'</p></div>').join('')+'</div>':'')+
    '<div class="lbq-fine">'+mfL('Bukan rawatan atau program pemulihan. Berhenti jika sakit tajam, pening, sakit dada atau sesak nafas luar biasa.','Not a treatment or rehab program. Stop with sharp pain, dizziness, chest pain or unusual breathlessness.')+'</div>'+
    '<button class="lbx-go" onclick="mfQuizSave()">'+glyph('play')+mfL('Lihat Pelan Saya','See My Plan')+'</button>'+
    '<button class="lbx-ghost" onclick="mfQ=1;renderMF()">'+mfL('Tukar jawapan','Change answers')+'</button></div>';
}
function mfQuizSave(){
  const d=mfData(); mfQA.done=true; mfQA.at=iso(0); d.me=mfQA;
  HF.save(); mfQ=-1; mfTab='plan'; mfWeek=-1; renderMF(); $('screen').scrollTop=0; toast(mfL('Pelan THE START sudah sedia','Your THE START plan is ready'));
}
/* the plan in one row, with the path the person can move up or down */
function mfSetPath(p){ const me=mfMe(); if(!me) return; me.path=p; HF.save(); renderMF(); }
function mfMeCard(){
  const me=mfMe(); if(!me) return '';
  const p=mfPath(), auto=mfAutoPath(me), days=mfDayNames(me);
  return '<div class="lbx-card mf-me"><div class="h"><div class="tt"><b>'+mfL('Tahap ','Path: ')+mfT(MF_PATHS[p])+'</b>'+
      (days.length?'<span>'+days.join(' · ')+(mfAktifNames(me).length?' + '+mfAktifNames(me).join(' · ')+' '+mfL('(aktif)','(active)'):'')+'</span>':'')+'</div>'+
    '<button onclick="mfQuizOpen()">'+glyph('pencil')+mfL('Ubah','Edit')+'</button></div>'+
    '<div class="lbx-split mf-path" role="radiogroup" aria-label="'+mfL('Tahap','Path')+'">'+MF_PATHS.map((x,i)=>
      '<button class="'+(p===i?'on':'')+'" role="radio" aria-checked="'+(p===i)+'" '+(mfRiskOf(me)&&i>0?'disabled ':'')+'onclick="mfSetPath('+i+')">'+mfT(x)+(i===auto?' ·':'')+'</button>').join('')+'</div>'+
    (mfRiskOf(me)?'<div class="lb-fine">'+mfL('Saringan kesihatan anda: tahap Mudah sehingga doktor atau fisioterapis benarkan lebih.','Your health check: the Easy path until a doctor or physiotherapist says more.')+'</div>':'')+'</div>';
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
  return '<div class="lbx-card mf-steps" onclick="scSheet(\'steps\')"><div class="mf-steps-h"><span class="ic">'+glyph('steps')+'</span>'+
    '<div class="tx"><b>'+mfFmt(g)+mfL(' langkah sehari',' steps a day')+'</b><span>'+
      (top?mfL('Anda dah aktif. Kekalkan langkah ini.','You are already active. Keep it up.'):mfL('Naik 1,000 setiap minggu, sampai 7,000.','Up 1,000 each week, to 7,000.'))+'</span></div>'+
    '<em>'+(now>=g?'✓':mfFmt(now))+'</em></div>'+
    '<div class="pbar mf-bar"><i style="width:'+pct+'%"></i></div>'+
    '<div class="mf-steps-n">'+mfL('Hari tanpa sesi: jalan 10–20 minit, masih boleh bercakap.','Days without a session: walk 10–20 minutes, still able to talk.')+'</div></div>';
}

/* ── Plan: the weeks in one row, the chosen week's three sessions ── */
function mfPlan(){
  const owned=mfOwned(), done=mfDone(), nx=done;
  let h=owned?mfMeCard():'';
  h+='<div class="lbx-sec"><div class="lbx-sh"><div class="lbx-st">'+mfL(MF_N+' Sesi Anda','Your '+MF_N+' Sessions')+'</div>'+
    '<div class="lbx-ss">'+mfL(done+' daripada '+MF_N+' siap · 3 sesi seminggu',done+' of '+MF_N+' done · 3 a week')+'</div></div></div>';
  h+='<div class="mf-weeks" role="tablist">'+MF_WEEKS.map((x,i)=>
    '<button role="tab" aria-selected="'+(i===mfWeek)+'" class="'+(i===mfWeek?'on':'')+(done>=(i+1)*3?' ok':'')+'" onclick="mfWeek='+i+';renderMF()">'+
      (done>=(i+1)*3?'✓ ':'')+mfL('Minggu ','Week ')+(i+1)+'</button>').join('')+'</div>';
  const w=MF_WEEKS[mfWeek]||MF_WEEKS[0], ws=mfSession(mfWeek*3)||{};
  h+='<div class="mf-wk"><b>'+mfT(w.n)+'</b><span>'+mfT(w.s)+'</span><em>'+mfL('Buat '+ws.w+' saat · rehat '+ws.rest+' saat','Work '+ws.w+' s · rest '+ws.rest+' s')+'</em></div>';
  h+='<div class="lbx-days">'+[0,1,2].map(j=>{
    const gi=mfWeek*3+j, s=mfSession(gi), isDone=gi<done, now=gi===nx&&owned;
    return '<div class="lbx-day mf-pc'+(isDone?' done':'')+(now?' now':'')+'" onclick="mfOpenSession('+gi+')">'+
      '<span class="pc-ph" style="background-image:url(\''+mfSessPic(gi)+'\')"></span>'+
      '<div class="lbx-day-n"><small>'+mfL('SESI','SESSION')+'</small><b>'+(gi+1)+'</b>'+(isDone?'<span class="ck">'+glyph('check')+'</span>':'')+'</div>'+
      '<div class="lbx-day-t">'+mfT(s.n)+'</div>'+
      '<div class="lbx-day-m">'+mfMinutes(s)+' min'+(MF_RECS.indexOf(gi)>=0?' · '+mfL('Rekod','Record'):'')+'</div>'+
      '<div class="lbx-day-k">'+s.main.length+' '+mfL('gerakan','moves')+' · '+mfL('kerusi','chair')+(s.main.some(x=>/Towel/.test(x.n))?' · '+mfL('tuala','towel'):'')+'</div></div>';
  }).join('')+'</div>';
  if(owned) h+=mfStepCard(mfWeek);
  return h;
}

/* (11 Nov 2026, Seth: "setiap session ni ade gambar training mcm poster") each of
   the 18 sessions has its own studio poster photo, the move it is built on */
function mfSessPic(gi){ return '/img/p/mula/s/s'+(gi<9?'0':'')+(gi+1)+'.jpg?v=2'; }
/* ── a session: what it is, one big button; warm-up and cool-down as one
   line each, the four main moves with their technique folded away ── */
function mfOpenSession(gi){
  const s=mfSession(gi); if(!s) return;
  const owned=mfOwned(), done=gi<mfDone();
  curProg=MF; curDay={p:MF, day:MF.weeks[s.wi].days[gi%3], gi};
  const part=(no,t,meta,names)=>'<div class="mf-part"><div class="h"><b>'+no+' · '+t+'</b><span>'+meta+'</span></div>'+
    '<div class="mf-chips">'+names.map(n=>'<span>'+hesc(n)+'</span>').join('')+'</div></div>';
  let h=pdxBar('day', owned?{icon:'play',label:mfL('Mula','Start'),go:'mfPlay('+gi+')'}:{icon:'lock',label:'RM'+MF_PRICE,go:'mfBuy()'})+
    '<div class="mf-hero mf-day mf-'+s.type+' mf-dpic" style="background-image:linear-gradient(180deg,rgba(0,0,0,.25),rgba(0,0,0,0) 35%,rgba(0,0,0,.78)),url(\''+mfSessPic(gi)+'\')"><div class="mf-hero-k">'+mfL('Sesi ','Session ')+(gi+1)+' / '+MF_N+' · '+mfL('Minggu ','Week ')+(s.wi+1)+(done?' · ✓':'')+'</div>'+
    '<div class="mf-hero-t sm">'+mfT(s.n)+'</div>'+mfLangBtn()+'</div><div class="lbx mf">';
  h+='<div class="lbx-facts">'+[[mfMinutes(s)+'',mfL('minit','min')],[s.main.length+'',mfL('gerakan','moves')],[s.r+'',mfL('kali ulang','rounds')],[s.w+'/'+s.rest,mfL('saat buat/rehat','work/rest s')]]
    .map(x=>'<div><b>'+x[0]+'</b><span>'+x[1]+'</span></div>').join('')+'</div>';
  h+=owned?'<button class="lbx-go" onclick="mfPlay('+gi+')">'+glyph('play')+mfL('Mula · ','Start · ')+mfMinutes(s)+' min</button>'
          :'<button class="lbx-go" onclick="mfBuy()">'+glyph('lock')+mfL('Buka · RM','Unlock · RM')+MF_PRICE+'</button>';
  if(MF_RECS.indexOf(gi)>=0) h+='<div class="mf-note">'+glyph('chart')+'<span>'+mfL('Sesi rekod: kira duduk-bangun dan tolak dalam 30 saat pertama. App akan tanya selepas sesi.','Record session: count your sit-to-stands and push-ups in the first 30 seconds. The app asks after the session.')+'</span></div>';
  h+=part(1,mfL('Pemanasan','Warm-up'),mfL('4 minit','4 min'),s.warm);
  h+='<div class="mf-part main"><div class="h"><b>2 · '+mfL('Latihan Utama','Main Workout')+'</b><span>'+mfL('ulang '+s.r+' kali · buat '+s.w+' saat, rehat '+s.rest+' saat',s.r+' rounds · '+s.w+' / '+s.rest+' s')+'</span></div>'+
    '<div class="lbx-moves">'+s.main.map((x,i)=>{ const c=MF_TECH[x.p];
      return '<div class="lbx-move mf-mv"><span class="n">'+(i+1)+'</span><div class="tx" onclick="'+(owned?'mfPlayOne(\''+x.n.replace(/'/g,"\\'")+'\','+gi+')':'mfBuy()')+'">'+
        '<div class="t">'+x.n+'</div><div class="m">'+mfT(MF_PAT[x.p].n)+' · '+s.w+' s</div></div>'+
        '<span class="pl" onclick="'+(owned?'mfPlayOne(\''+x.n.replace(/'/g,"\\'")+'\','+gi+')':'mfBuy()')+'">'+glyph(owned?'play':'lock')+'</span>'+
        '<details class="mf-tip"><summary>'+mfL('Teknik','Technique')+'</summary>'+mfTkPics(x.p,true)+'<ul>'+c[0].map(t=>'<li>'+mfT(t)+'</li>').join('')+'</ul>'+
        '<small>'+mfL('Elak: ','Avoid: ')+mfT(c[1]).toLowerCase()+'. '+mfL('Jika susah: ','If it is hard: ')+mfT(c[2]).toLowerCase()+'.</small>'+
        (owned&&MF_TK[x.p]?mfTkBtn(x.p):'')+'</details></div>'; }).join('')+'</div></div>';
  h+=part(3,mfL('Penyejukan','Cool-down'),Math.round(s.cool.length*40/60*10)/10+' '+mfL('minit','min'),s.cool);
  const kit=[mfL('ruang selamat','a safe space'),mfL('kerusi stabil','a sturdy chair')];
  if(s.main.some(x=>/Towel/.test(x.n))) kit.push(mfL('tuala','a towel')); if(s.main.some(x=>/Bottle/.test(x.n))) kit.push(mfL('botol air','a water bottle')); if(s.main.some(x=>/Wall/.test(x.n))) kit.push(mfL('dinding','a wall'));
  const ls=MF_LESSON[gi];
  h+='<div class="mf-foot">'+
    '<div>'+glyph('mat')+'<span>'+mfL('Perlu: ','You need: ')+kit.join(', ')+'</span></div>'+
    '<div>'+glyph('doc')+'<span>'+mfL('Pelajaran selepas sesi: ','Lesson after the session: ')+'<b>'+mfT(ls[0])+'</b></span></div>'+
    '<div class="safe">'+glyph('heart')+'<span>'+mfL('Berhenti jika sakit tajam, pening, sakit dada atau sesak nafas luar biasa.','Stop with sharp pain, dizziness, chest pain or unusual breathlessness.')+'</span></div></div>';
  if(owned) h+='<button class="mf-link c" onclick="mfComplete('+gi+')">'+mfL('Tanda siap tanpa main','Mark done without playing')+'</button>';
  h+='</div>';
  $('dd-body').innerHTML=h;
  hidePanels(); $('daydetail').style.display='block'; $('screen').scrollTop=0;
}
function mfPlay(gi){
  const s=mfSession(gi); if(!s) return;
  if(!mfOwned()) return mfBuy();
  if(!mfMe()) return mfQuizOpen();
  startWorkout(mfExercises(s),{rounds:1, name:'THE START · '+mfL('Sesi ','Session ')+(gi+1), mf:{gi}, key:MF_KEY+'-s'+gi, pid:MF_ID, gi});
}
function mfPlayOne(n,gi){
  if(!mfOwned()) return mfBuy();
  const s=mfSession(gi), x=s.main.filter(m=>m.n===n)[0];
  startWorkout([mfEx(n,x?s.w:30,0,x?mfCue(x.p):'')],{rounds:1, name:n, mf:{gi:-1,back:gi}});
}
function mfAfterSession(m){
  if(m.aktif){ hidePanels(); $('progdetail').style.display='block'; mfTab='plan'; renderMF(); $('screen').scrollTop=0; return; }
  if(m.gi<0) return mfOpenSession(m.back);
  hidePanels(); $('progdetail').style.display='block'; mfTab='plan';
  if(m.gi<mfDone()) mfLsOpen=m.gi;
  renderMF(); $('screen').scrollTop=0;
}
function mfComplete(gi){
  const s=mfSession(gi);
  HF.markDone(MF_KEY+'-s'+gi,{name:'THE START · '+mfL('Sesi ','Session ')+(gi+1), mins:mfMinutes(s)});
  if(progDone(MF_ID)===gi) HF.data.progress[MF_ID]=gi+1;
  HF.save(); toast(mfL('Sesi siap 🔥','Session done 🔥')); mfLsOpen=gi;
  hidePanels(); $('progdetail').style.display='block'; renderMF(); $('screen').scrollTop=0;
}

/* ── after a session: the record (the first and last sessions), else the lesson ── */
const MF_REC=[['sq','Sit-to-stand','kali'],['pu','Push','kali'],['yk','Yakin (1–5)','/ 5']];
function mfRecKey(gi){ return 's'+(gi+1); }
function mfRecDue(){
  const done=mfDone(), d=mfData();
  const gi=MF_RECS.filter(g=>g<done && !d.rec[mfRecKey(g)])[0];
  if(gi===undefined) return '';
  return '<div class="lbx-card mf-rec"><div class="lbx-k">'+mfL('Rekod sesi ','Session record ')+(gi+1)+'</div>'+
    '<div class="lbx-h">'+(gi===0?mfL('Rekod permulaan anda','Your starting record'):mfL('Bandingkan dengan sesi 1','Compare with session 1'))+'</div>'+
    '<div class="lbx-p">'+mfL('Ikut ingatan, dalam 30 saat pertama latihan utama. Tak ingat? Langkau.','From memory, in the first 30 seconds of the main workout. Can’t remember? Skip.')+'</div>'+
    '<div class="esfields">'+MF_REC.map(x=>'<label class="esf"><span>'+mfT(x[1])+'</span><input class="inp" id="mfr-'+x[0]+'" inputmode="numeric" placeholder="0" aria-label="'+mfT(x[1])+'"><em>'+mfT(x[2])+'</em></label>').join('')+'</div>'+
    '<button class="lbx-go" onclick="mfRecSave('+gi+')">'+glyph('check')+mfL('Simpan','Save')+'</button>'+
    '<button class="lbx-ghost" onclick="mfRecSkip('+gi+')">'+mfL('Langkau','Skip')+'</button></div>';
}
function mfRecSave(gi){
  const g=k=>parseInt(($('mfr-'+k)||{}).value,10)||0, yk=Math.max(0,Math.min(5,g('yk')));
  mfData().rec[mfRecKey(gi)]={sq:g('sq'), pu:g('pu'), yk, at:iso(0)}; HF.save(); toast(mfL('Rekod disimpan','Record saved')); renderMF();
}
function mfRecSkip(gi){ mfData().rec[mfRecKey(gi)]={skip:true, at:iso(0)}; HF.save(); renderMF(); }
/* the lesson of the session just done, until it is read */
function mfLessonDue(){
  const done=mfDone(), d=mfData();
  let gi=mfLsOpen>=0 && mfLsOpen<done ? mfLsOpen : -1;
  if(gi<0) for(let i=done-1;i>=Math.max(0,done-1);i--) if(!d.lesson[i]) gi=i;
  if(gi<0 || (d.lesson[gi] && mfLsOpen!==gi)) return '';
  const ls=MF_LESSON[gi];
  return '<div class="lbx-card mf-lesson"><div class="lbx-k">'+mfL('Pelajaran · Sesi ','Lesson · Session ')+(gi+1)+'</div><div class="lbx-h">'+mfT(ls[0])+'</div>'+
    '<p>'+mfT(ls[1])+'</p><button class="lbx-go" onclick="mfLsDone('+gi+')">'+glyph('check')+(d.lesson[gi]?mfL('Tutup','Close'):mfL('Faham','Got it'))+'</button></div>';
}
function mfLsDone(gi){ mfData().lesson[gi]=true; mfLsOpen=-1; HF.save(); renderMF(); }
function mfLsShow(gi){ mfLsOpen=gi; mfTab='plan'; renderMF(); $('screen').scrollTop=0; }

/* ── the meal scan (11 Nov 2026, Seth: "scan 20x untuk 6 minggu tu. mcm style
   mak2fit"): 20 scans kept until used, the same welcome MAK2FIT gives. One
   quiet strip, shown when there is no record or lesson waiting. ── */
function mfScanN(){ return typeof welcomeScanN==='function' ? welcomeScanN('prog_mula') : 20; }
function mfScanCard(){
  if(typeof scanAccess!=='function') return '';
  const a=scanAccess(), has=a.left>0, N=mfScanN();
  const sub=!has ? mfL(N+' scan anda dah digunakan · 3 lagi bulan depan','Your '+N+' scans are used · 3 more next month')
    : a.mode==='pass' ? mfL(a.left+' daripada '+a.daily+' scan lagi hari ini',a.left+' of '+a.daily+' scans left today')
    : a.ladies ? mfL(a.left+' daripada '+(a.of||N)+' scan lagi',a.left+' of '+(a.of||N)+' scans left')
    : a.label;
  return '<div class="lbx-scanhero mf-scan" role="button" tabindex="0" onclick="mfScanGo()">'+
    '<div class="ph" style="background-image:url(\'/ladies/img/menu/d11.jpg\')"><i class="c1"></i><i class="c2"></i><i class="c3"></i><i class="c4"></i><i class="ln"></i></div>'+
    '<div class="tx"><div class="k">'+glyph('spark')+mfL('Scan Makanan AI','AI Meal Scan')+'</div><b>'+mfL('Ambil gambar, tahu kalorinya.','Snap it, know its calories.')+'</b><span>'+sub+'</span></div>'+
    '<span class="go">'+glyph('photo')+'</span></div>';
}
function mfScanGo(){ const a=typeof scanAccess==='function' ? scanAccess() : {left:0}; if(a.left>0) openScan('meal'); else openScanPlans(''); }

/* ── ?tebus=mula (11 Nov 2026): paid on app.hitfat.io/start and back through
   /start/berjaya. Signed in, it opens: by the order number when that page had
   one (any account), else by the email paid with. The webhook can land a few
   seconds later, so two more looks before asking for the order number. As
   MAK2FIT's lbTebus. ── */
function mfTebus(tries){
  tries=tries||0;
  let o=''; try{ o=localStorage.getItem('hf_tebus_o')||''; }catch(e){}
  const hl=/^HL[A-Z0-9]+/i.exec(o); if(hl) o=hl[0].toUpperCase();
  const claim=(sb && HF.userId) ? sb.rpc('plus_claim_landing', o?{p_order:o}:{}) : Promise.resolve(null);
  const after=function(){
    if(owns('prog_'+MF_ID)){
      try{ localStorage.removeItem('hf_tebus_o'); }catch(e){}
      _paySku='prog_'+MF_ID; openProgram(MF_ID); coConfirm('ok');
      return;
    }
    if(tries<2){ if(!tries) mfTebusSheet('wait',o); setTimeout(function(){ mfTebus(tries+1); },4000); return; }
    mfTebusSheet('miss',o);
  };
  Promise.resolve(claim).then(function(){ return loadEntitlement(); }, function(){ return loadEntitlement(); }).then(after, after);
}
function mfTebusSheet(state,o){
  let h='<div class="pwtop"><span></span><button class="pwx" aria-label="Tutup" onclick="closeProduct()">✕</button></div>';
  if(state==='wait') h+='<div class="co co-done"><div class="co-badge co-wait"><span class="co-dot"></span><span class="co-dot"></span><span class="co-dot"></span></div>'+
    '<div class="coh">'+mfL('Menyemak pembayaran anda','Checking your payment')+'</div><div class="co-s">'+mfL('Biasanya beberapa saat sahaja.','Usually just a few seconds.')+'</div></div>';
  else h+='<div class="co co-done"><div class="co-badge co-late">'+glyph('clock')+'</div>'+
    '<div class="coh">'+mfL('Kami belum jumpa pembayaran anda','We have not found your payment yet')+'</div>'+
    '<div class="co-s">'+mfL('Kalau anda bayar guna emel lain, masukkan nombor pesanan dari resit Bayarcash.','If you paid with another email, enter the order number from your Bayarcash receipt.')+'</div></div>'+
    '<div class="wl-claim"><div class="wl-claim-f"><input id="mf-order" placeholder="'+mfL('Nombor pesanan','Order number')+'" autocomplete="off" value="'+hesc(o||'')+'"><button onclick="mfClaim()">'+mfL('Buka','Open')+'</button></div></div>'+
    '<button class="bigbtn lb-btn" onclick="mfTebus(1)">'+mfL('Cuba lagi','Try again')+'</button>'+
    '<button class="authalt" onclick="window.open(\'https://wa.me/60189174656?text='+encodeURIComponent('Hai HITFAT, saya dah bayar THE START tapi belum terbuka.')+'\',\'_blank\',\'noopener\')">'+mfL('Masih tak terbuka? <b>WhatsApp kami</b>','Still locked? <b>WhatsApp us</b>')+'</button>';
  $('pw-body').innerHTML=h; $('pwm').classList.add('on');
}
function mfClaim(){
  let o=String((($('mf-order')||{}).value)||'').trim(); const hl=/^HL[A-Z0-9]+/i.exec(o); if(hl) o=hl[0].toUpperCase();
  if(!o) return toast(mfL('Masukkan nombor pesanan dari resit anda','Enter the order number from your receipt'));
  if(!sb||!HF.userId) return toast(mfL('Log masuk dahulu','Sign in first'));
  sb.rpc('plus_claim_landing',{p_order:o}).then(function(r){ if(r.error) throw r.error; return loadEntitlement(); }).then(function(){
    if(owns('prog_'+MF_ID)){ closeProduct(); toast(mfL('Dibuka. Selamat datang ke THE START','Unlocked. Welcome to THE START')); openProgram(MF_ID); }
    else toast(mfL('Tiada pesanan berbayar dengan nombor itu. Semak resit, atau mesej kami.','No paid order with that number. Check the receipt, or message us.'));
  })['catch'](function(){ toast(mfL('Pesanan itu tidak dapat disemak. Cuba lagi sebentar.','That order could not be checked. Try again shortly.')); });
}

/* ── Belajar: the technique cards and the lessons so far ── */
function mfLearn(){
  if(!mfOwned()) return mfLocked('doc',mfL('Belajar Asas','Learn the Basics'),mfL('Kad teknik untuk setiap gerakan dan '+MF_N+' pelajaran ringkas tentang latihan dan makan cara Malaysia.',
    'Technique cards for every move and '+MF_N+' short lessons on training and eating the Malaysian way.'));
  const done=mfDone(), me=mfMe();
  let h=mfTkBanner()+'<div class="lbx-sec"><div class="lbx-sh"><div class="lbx-st">'+mfL('Kad Teknik','Technique Cards')+'</div><div class="lbx-ss">'+
    mfL('Tiga isyarat, satu kesilapan biasa, satu cara lebih mudah','Three cues, one common mistake, one easier way')+'</div></div></div>';
  h+='<div class="mf-tech">'+Object.keys(MF_TECH).map(p=>{ const c=MF_TECH[p];
    return '<div class="lbx-card"><div class="lbx-k">'+mfT(MF_PAT[p].n)+'</div><b>'+mfMove(p,mfWeekOf(Math.min(done,MF_N-1)),me)+'</b>'+mfTkPics(p)+
      '<ol>'+c[0].map(t=>'<li>'+mfT(t)+'</li>').join('')+'</ol><div class="no">'+mfL('Elak: ','Avoid: ')+mfT(c[1])+'</div><div class="ez">'+mfL('Jika susah: ','If it is hard: ')+mfT(c[2])+'</div>'+
      (MF_TK[p]?mfTkBtn(p):'')+'</div>'; }).join('')+'</div>';
  h+='<div class="lbx-sec"><div class="lbx-sh"><div class="lbx-st">'+mfL('Pelajaran','Lessons')+'</div><div class="lbx-ss">'+mfL('Terbuka selepas setiap sesi','Each opens after its session')+'</div></div></div>';
  h+='<div class="lbx-card lbx-cl">'+MF_LESSON.map((l,i)=>{
    const open=i<done, kind={L:mfL('Latihan','Training'),M:mfL('Makan','Eating'),S:mfL('Semak','Review')}[l[2]]||'';
    return '<div class="lbx-cr'+(mfData().lesson[i]?' on':'')+'"'+(open?' onclick="mfLsShow('+i+')"':'')+'><span class="ck'+(mfData().lesson[i]?' on':'')+'">'+glyph(open?(mfData().lesson[i]?'check':'doc'):'lock')+'</span>'+
      '<div class="tx"><span class="k">'+mfL('Sesi ','Session ')+(i+1)+(kind?' · '+kind:'')+'</span><b class="w">'+(open?mfT(l[0]):mfL('Selepas sesi ','After session ')+(i+1))+'</b></div>'+(open?'<span class="pdx-chev">›</span>':'')+'</div>';
  }).join('')+'</div>';
  return h;
}

/* ── Makan (11 Nov 2026, Seth: "tak ada nutrition ke?", picked "Beginner, tak
   kira kalori"): no calorie target and no numbers to type. One eating habit a
   week, in step with the lessons, ticked each day, the weeks before kept;
   today's three meals from MAK2FIT's photographed menu (kedai dishes only for
   those who eat out); the plate and the hands; swaps; eating out. ── */
const MF_HABIT=[
  ['Separuh pinggan sayur','Sekurang-kurangnya sekali sehari, separuh pinggan sayur atau buah.','Half a plate of vegetables','At least once a day, half your plate vegetables or fruit.','leaf'],
  ['Nasi segenggam','Ambil nasi sebesar genggaman anda. Masih lapar? Tambah sayur dulu.','Rice, one fist','Take rice the size of your fist. Still hungry? Add vegetables first.','food'],
  ['Protein setiap kali makan','Ayam, ikan, telur, tempe, tauhu atau dhal, pada setiap waktu makan.','Protein at every meal','Chicken, fish, eggs, tempeh, tofu or dhal, at every meal.','food'],
  ['Air kosong 6–8 gelas','Segelas sebelum setiap kali makan. Minuman manis, satu sehari sahaja.','Plain water, 6–8 glasses','A glass before every meal. Sweet drinks, one a day only.','water'],
  ['Snek terancang','Lapar antara waktu makan? Buah, kacang atau telur rebus.','Planned snacks','Hungry between meals? Fruit, nuts or a boiled egg.','leaf'],
  ['Sarapan ada protein','Tambah telur, susu atau tempe pada sarapan anda.','Protein at breakfast','Add an egg, milk or tempeh to your breakfast.','sunrise']
];
let mfMkSwap={};
function mfMk(){ const d=mfData(); return d.mk||(d.mk={}); }
function mfMkWeek(){ return mfWeekOf(Math.min(mfDone(),MF_N-1)); }
function mfMkTick(){
  const m=mfMk(), t=iso(0), wi=mfMkWeek();
  if(m[t]===wi) delete m[t]; else m[t]=wi;
  HF.save(); renderMF();
  if(m[t]===wi) toast(mfL('Bagus. Tabiat hari ini ditanda.','Nice. Today’s habit is ticked.'));
}
function mfMkDays(wi){ const m=mfMk(); return Object.keys(m).filter(k=>m[k]===wi).length; }
function mfPlateSVG(){
  return '<svg class="lbx-plate-svg" viewBox="0 0 120 120" aria-hidden="true">'+
    '<circle cx="60" cy="60" r="58" fill="#fff" stroke="rgba(0,0,0,.08)" stroke-width="2"/>'+
    '<circle cx="60" cy="60" r="50" fill="#F3EFEA"/>'+
    '<path d="M60 60 L60 12 A48 48 0 0 0 60 108 Z" fill="#1F9D6A"/>'+
    '<path d="M60 60 L60 12 A48 48 0 0 1 108 60 Z" fill="#E8480F"/>'+
    '<path d="M60 60 L108 60 A48 48 0 0 1 60 108 Z" fill="#E6A100"/>'+
    '<circle cx="104" cy="22" r="8" fill="#9C7A3C" stroke="#fff" stroke-width="2"/>'+
    '<line x1="60" y1="12" x2="60" y2="108" stroke="#fff" stroke-width="2.5"/><line x1="60" y1="60" x2="108" y2="60" stroke="#fff" stroke-width="2.5"/></svg>';
}
/* today's dish for a meal: changes each day, "Tukar" shows the next one */
function mfMkDish(slot){
  if(typeof LB30_MENU==='undefined' || !LB30_MENU[slot]) return null;
  const me=mfMe(), out=me && me.makan==='kedai';
  /* the dinners are all home cooking: someone who eats out gets the kedai lunches */
  let opts=LB30_MENU[slot].opts.filter(o=>!out || o.b);
  if(!opts.length && out) opts=LB30_MENU.tengahari.opts.filter(o=>o.b);
  if(!opts.length) opts=LB30_MENU[slot].opts;
  const day=Math.floor((new Date(iso(0)+'T12:00:00')).getTime()/864e5);
  return opts[((day*7+(slot==='malam'?3:0)+(mfMkSwap[slot]||0)) % opts.length + opts.length) % opts.length];
}
function mfMkNext(slot){ mfMkSwap[slot]=(mfMkSwap[slot]||0)+1; renderMF(); }
function mfFood(){
  if(!mfOwned()) return mfLocked('food',mfL('Makan Cara Malaysia','Eating the Malaysian Way'),mfL('Satu tabiat makan setiap minggu, idea menu Malaysia setiap hari, pinggan sihat dan sukatan tangan. Tak perlu kira kalori.',
    'One eating habit a week, Malaysian meal ideas every day, the healthy plate and hand portions. No calorie counting.'));
  const wi=mfMkWeek(), hb=MF_HABIT[wi], t=iso(0), on=mfMk()[t]===wi, me=mfMe();
  let h='<div class="lbx-card mf-hab"><div class="mf-hab-top"><span class="ic">'+glyph(hb[4])+'</span><div class="tx"><div class="lbx-k">'+mfL('Tabiat minggu ','Habit for week ')+(wi+1)+'</div>'+
    '<div class="lbx-h">'+mfL(hb[0],hb[2])+'</div><div class="lbx-p">'+mfL(hb[1],hb[3])+'</div></div></div>'+
    '<div class="mf-hab-wk">'+[6,5,4,3,2,1,0].map(n=>{ const k=iso(-n), x=mfMk()[k]===wi, d=new Date(k+'T12:00:00');
      return '<div class="'+(x?'on':'')+(n===0?' now':'')+'"><i>'+(x?glyph('check'):'')+'</i><span>'+mfL(['Ah','Is','Se','Ra','Kh','Ju','Sa'],['Su','Mo','Tu','We','Th','Fr','Sa'])[d.getDay()]+'</span></div>'; }).join('')+'</div>'+
    '<button class="lbx-go'+(on?' mf-hab-done':'')+'" onclick="mfMkTick()">'+glyph('check')+(on?mfL('Dah buat hari ini','Done today'):mfL('Saya buat hari ini','I did it today'))+'</button>'+
    (wi>0?'<div class="mf-hab-keep"><span>'+mfL('Teruskan juga:','Keep these too:')+'</span>'+MF_HABIT.slice(0,wi).map(x=>'<b>'+mfL(x[0],x[2])+'</b>').join('')+'</div>':'')+
    '<div class="mf-hab-n">'+mfL(mfMkDays(wi)+' hari minggu ini · tabiat baru setiap minggu sesi anda',mfMkDays(wi)+' days this week · a new habit each week of sessions')+'</div></div>';
  h+=mfScanCard();
  /* today's meals: one idea each, a photograph, no calories */
  const look={sarapan:['sunrise','#E6A100',mfL('Sarapan','Breakfast')],tengahari:['sun','#E8480F',mfL('Tengah hari','Lunch')],malam:['moon','#5B4BC4',mfL('Makan malam','Dinner')]};
  h+='<div class="lbx-sec"><div class="lbx-sh"><div class="lbx-st">'+mfL('Idea Makan Hari Ini','Meal Ideas for Today')+'</div><div class="lbx-ss">'+
    (me&&me.makan==='kedai'?mfL('Yang mudah dibeli di kedai dan warung','Easy to buy at a kedai or warung'):mfL('Masakan Malaysia, nasi tetap ada','Malaysian food, rice included'))+'</div></div></div>';
  h+='<div class="lbx-meals">'+['sarapan','tengahari','malam'].map(sl=>{ const o=mfMkDish(sl), lk=look[sl]; if(!o) return '';
    const im=typeof lbDishImg==='function'?lbDishImg(LB30_MENU[sl].opts.indexOf(o)>=0?sl:'tengahari',o):'';
    return '<div class="mpslot lbx-meal" style="--mc:'+lk[1]+'"><div class="mpslot-h"><span class="ic">'+glyph(lk[0])+'</span><div class="hd"><div class="t">'+lk[2]+'</div></div>'+
      '<button class="mf-mk-sw" onclick="mfMkNext(\''+sl+'\')">'+glyph('repeat')+mfL('Tukar','Swap')+'</button></div>'+
      '<div class="lbx-mo">'+(im?'<div class="lbx-dish sm" style="background-image:url(\''+im+'\')"></div>':'<div></div>')+
      '<div class="tx"><div class="mpopt-h"><div class="t">'+o.n+'</div></div><div class="lbx-items">'+o.it.map(x=>'<span>'+x.replace('{nasi}',mfL('segenggam','one fist'))+'</span>').join('')+'</div></div></div>'+
      '<div class="lbx-meal-f"><div class="lbx-meal-n">'+mfL('Ikut pinggan sihat di bawah','Follow the healthy plate below')+'</div><button class="lbx-mscan" onclick="mfScanGo()">'+glyph('photo')+'Scan</button></div></div>';
  }).join('')+'</div>';
  /* the plate, then the hands */
  h+='<div class="lbx-sec"><div class="lbx-sh"><div class="lbx-st">'+mfL('Pinggan Sihat','The Healthy Plate')+'</div><div class="lbx-ss">'+mfL('Bentuk pinggan setiap kali makan. Tak perlu penimbang.','The shape of every meal. No scales needed.')+'</div></div></div>';
  h+='<div class="lbx-card lbx-plate">'+mfPlateSVG()+'<div class="lbx-plate-k">'+
    [['#1F9D6A',mfL('Sayur & buah','Veg & fruit'),mfL('½ pinggan · 2 genggam','½ plate · 2 fists')],['#E8480F','Protein',mfL('¼ pinggan · 1 tapak tangan','¼ plate · 1 palm')],
     ['#E6A100',mfL('Nasi / karbo','Rice / carbs'),mfL('¼ pinggan · 1 genggam','¼ plate · 1 fist')],['#9C7A3C',mfL('Minyak & kuah','Oil & gravy'),mfL('1 ibu jari','1 thumb')]]
    .map(x=>'<div><i style="background:'+x[0]+'"></i><b>'+x[1]+'</b><span>'+x[2]+'</span></div>').join('')+'</div></div>';
  h+='<div class="lbx-por">'+[['food','Protein','1',mfL('tapak tangan','palm'),mfL('ayam, ikan, telur, tauhu, tempe','chicken, fish, eggs, tofu, tempeh'),'#E8480F'],
      ['workout',mfL('Karbo','Carbs'),'1',mfL('genggam','fist'),mfL('nasi, mi, roti','rice, noodles, bread'),'#E6A100'],
      ['leaf',mfL('Sayur','Veg'),'2',mfL('genggam','fists'),mfL('separuh pinggan','half the plate'),'#1F9D6A'],
      ['water',mfL('Lemak','Fat'),'1',mfL('ibu jari','thumb'),mfL('minyak, santan, kuah','oil, santan, gravy'),'#9C7A3C']]
    .map(x=>'<div class="lbx-po" style="--pc:'+x[5]+'"><div class="lbx-po-top"><span class="ic">'+glyph(x[0])+'</span><span class="k">'+x[1]+'</span></div>'+
      '<div class="lbx-po-n"><b>'+x[2]+'</b><span>'+x[3]+'</span></div><div class="lbx-po-s">'+x[4]+'</div></div>').join('')+'</div>'+
    '<div class="lb-fine">'+mfL('Ukuran ini untuk setiap kali makan. Lelaki atau badan lebih besar biasanya perlukan dua tapak tangan protein dan dua genggam nasi.',
      'These are for each meal. Men and bigger bodies usually need two palms of protein and two fists of rice.')+'</div>';
  h+='<div class="lbx-sec"><div class="lbx-sh"><div class="lbx-st">'+mfL('Tukar Satu','One Swap')+'</div><div class="lbx-ss">'+mfL('Satu perubahan kecil, bukan semua sekali gus.','One small change, not all at once.')+'</div></div></div>';
  h+='<div class="lbx-swaps">'+[[mfL('Teh tarik','Teh tarik'),mfL('Teh o kurang manis','Teh o, less sweet'),mfL('Langkah pertama yang paling mudah untuk ramai orang.','The easiest first step for most people.')],
    [mfL('Ayam goreng','Fried chicken'),mfL('Ayam bakar','Grilled chicken'),mfL('Ayam yang sama, minyak jauh kurang.','The same chicken, far less oil.')],
    [mfL('Mi goreng','Fried noodles'),mfL('Mi sup','Noodle soup'),mfL('Masih mi, lebih ringan.','Still noodles, lighter.')],
    [mfL('Tambah nasi kali kedua','A second helping of rice'),mfL('Tambah sayur','More vegetables'),mfL('Kenyang sama, lebih banyak serat.','Just as full, more fibre.')]]
    .map(x=>'<div class="lbx-sw"><div class="lbx-sw-r"><span class="from">'+x[0]+'</span><span class="arr">→</span><span class="to">'+x[1]+'</span></div><div class="lbx-sw-s">'+x[2]+'</div></div>').join('')+'</div>';
  h+='<div class="lbx-sec"><div class="lbx-sh"><div class="lbx-st">'+mfL('Makan Di Luar','Eating Out')+'</div><div class="lbx-ss">'+mfL('Apa nak order, bila tak masak.','What to order when you are not cooking.')+'</div></div></div>';
  h+='<div class="lbx-out">'+[
    ['people','#E8480F','Mamak',[mfL('Roti canai kosong + kuah dal','Roti canai kosong + dhal'),mfL('Nasi kandar: ayam bakar, sayur, kuah sikit','Nasi kandar: grilled chicken, veg, a little gravy'),mfL('Teh o atau teh tarik kurang manis','Teh o or teh tarik, less sweet')]],
    ['food','#1F9D6A',mfL('Nasi campur','Mixed rice'),[mfL('Satu lauk protein','One protein dish'),mfL('Dua jenis sayur','Two vegetables'),mfL('Kuah sedikit, nasi segenggam','A little gravy, rice one fist')]],
    ['star','#5B4BC4',mfL('Kenduri','Weddings & feasts'),[mfL('Ambil sayur dan lauk dulu','Take vegetables and protein first'),mfL('Satu pinggan, tiada makanan yang perlu ditinggal','One plate, no food has to be skipped'),mfL('Air kosong, bukan sirap','Plain water, not syrup')]],
    ['bag','#E6A100',mfL('Makanan segera','Fast food'),[mfL('Burger ayam bakar, bukan goreng','Grilled chicken burger, not fried'),mfL('Air kosong atau minuman zero','Plain water or a zero drink'),mfL('Kentang goreng: kongsi','Fries: share them')]]]
    .map(x=>'<div class="lbx-oc" style="--mc:'+x[1]+'"><div class="h"><span class="ic">'+glyph(x[0])+'</span><b>'+x[2]+'</b></div>'+
      x[3].map(o=>'<div class="o">'+glyph('check')+'<span>'+o+'</span></div>').join('')+'</div>').join('')+'</div>';
  /* the eating lessons opened so far */
  const done=mfDone(), ls=MF_LESSON.map((l,i)=>[l,i]).filter(x=>x[0][2]==='M');
  h+='<div class="lbx-sec"><div class="lbx-sh"><div class="lbx-st">'+mfL('Pelajaran Makan','Eating Lessons')+'</div><div class="lbx-ss">'+mfL('Terbuka selepas sesinya','Each opens after its session')+'</div></div></div>';
  h+='<div class="lbx-card lbx-cl">'+ls.map(x=>{ const i=x[1], open=i<done, rd=mfData().lesson[i];
    return '<div class="lbx-cr'+(rd?' on':'')+'"'+(open?' onclick="mfLsShow('+i+')"':'')+'><span class="ck'+(rd?' on':'')+'">'+glyph(open?(rd?'check':'doc'):'lock')+'</span>'+
      '<div class="tx"><span class="k">'+mfL('Sesi ','Session ')+(i+1)+'</span><b class="w">'+(open?mfT(x[0][0]):mfL('Selepas sesi ','After session ')+(i+1))+'</b></div>'+(open?'<span class="pdx-chev">›</span>':'')+'</div>'; }).join('')+'</div>';
  return h;
}

/* ── Kemajuan: sessions, how they felt, the two records side by side ── */
function mfProgress(){
  if(!mfOwned()) return mfLocked('chart',mfL('Kemajuan','Progress'),mfL('Sesi siap, rasa setiap sesi, dan rekod sesi 1 berbanding sesi '+MF_N+'.','Sessions done, how each felt, and your session 1 record against session '+MF_N+'.'));
  const done=mfDone(), S=HF.data.sessions||{}, d=mfData(), f={easy:0,right:0,hard:0};
  for(let i=0;i<MF_N;i++){ const x=S[MF_KEY+'-s'+i]; if(x && f[x.feel]!==undefined) f[x.feel]++; }
  const mins=MF_ORDER.reduce((a,t,i)=>{ const x=S[MF_KEY+'-s'+i]; return a+(x&&x.mins||0); },0);
  let h='<div class="lbx-facts">'+[[done+'/'+MF_N,mfL('sesi siap','sessions done')],[mins+'',mfL('minit','minutes')],[(typeof liveStreak==='function'?liveStreak():0)+'',mfL('hari berturut','day streak')]]
    .map(x=>'<div><b>'+x[0]+'</b><span>'+x[1]+'</span></div>').join('')+'</div>';
  h+='<div class="lbx-sec"><div class="lbx-sh"><div class="lbx-st">'+mfL('Macam mana sesi anda?','How did your sessions feel?')+'</div><div class="lbx-ss">'+mfL('Dari jawapan selepas setiap sesi','From your answer after each session')+'</div></div></div>'+
    '<div class="mf-feel">'+[['easy',mfL('Mudah','Easy')],['right',mfL('Ngam','Just right')],['hard',mfL('Susah','Hard')]].map(x=>'<div><b>'+f[x[0]]+'</b><span>'+x[1]+'</span></div>').join('')+'</div>';
  if(f.hard>=2) h+='<div class="lbx-note"><div class="q">'+glyph('heart')+'</div><div><div class="k">'+mfL('Nasihat','Advice')+'</div><div class="t">'+
    mfL('Beberapa sesi terasa susah. Tak apa: tukar ke tahap lebih mudah di tab Pelan, atau ulang minggu ini sebelum naik.','Some sessions felt hard. That is fine: switch to an easier path in the Plan tab, or repeat this week before moving on.')+'</div></div></div>';
  const a=d.rec.s1||{}, b=d.rec['s'+MF_N]||{}, cell=(o,k)=>o.skip||o[k]===undefined?'–':o[k];
  h+='<div class="lbx-sec"><div class="lbx-sh"><div class="lbx-st">'+mfL('Rekod Anda','Your Records')+'</div><div class="lbx-ss">'+mfL('Sesi 1 berbanding sesi ','Session 1 against session ')+MF_N+'</div></div></div>'+
    '<div class="lbx-card mf-recs"><div class="h"><span></span><b>'+mfL('Sesi','Session')+' 1</b><b>'+mfL('Sesi','Session')+' '+MF_N+'</b></div>'+
    MF_REC.map(x=>'<div><span>'+mfT(x[1])+'</span><b>'+cell(a,x[0])+'</b><b>'+cell(b,x[0])+'</b></div>').join('')+'</div>'+
    '<div class="lb-fine">'+mfL('Berat, ukuran dan gambar tidak diperlukan dalam THE START. Jangan bandingkan diri dengan orang lain; bandingkan dengan anda pada sesi 1.',
      'Weight, measurements and photos are not needed in THE START. Do not compare yourself with others; compare with you at session 1.')+'</div>';
  if(done>=MF_N) h+=mfNextCard();
  return h;
}
/* (10 Nov 2026) after the last session, the next step by name. Six weeks
   start a habit, they do not finish one: in the studies a new habit took a
   median of about two months, and most app beginners stop within the year,
   so the end of THE START points somewhere at once. First its next path (the
   same sessions, each move one step up), then a HITFAT+ program with no
   jumps: Fit After 40, chair-assisted, six weeks. */
const MF_NEXT='f40';
function mfNextCard(){
  const me=mfMe(), p=mfPath(), up=me && !mfRiskOf(me) && p<2, risk=me && mfRiskOf(me);
  const np=typeof findProg==='function'?findProg(MF_NEXT):null, round=mfData().round||1;
  let h='<div class="lbx-card mf-next"><div class="lbx-k">'+mfL('Langkah seterusnya','What next')+'</div><div class="lbx-h">'+mfL('Teruskan rentak ini.','Keep this going.')+'</div>'+
    '<div class="lbx-p">'+mfL('Enam minggu ialah permulaan yang kukuh. Tabiat baru biasanya ambil kira-kira dua bulan, jadi jangan berhenti di sini.',
      'Six weeks is a strong start. A new habit usually takes about two months, so do not stop here.')+'</div>';
  h+='<div class="mf-nx" onclick="mfRestart()"><span class="n">1</span><div class="tx"><b>'+(up?'THE START · '+mfL('Tahap ','Path: ')+mfT(MF_PATHS[p+1]):mfL('Ulang THE START','Repeat THE START')+(round>1?' ('+mfL('pusingan ','round ')+(round+1)+')':''))+'</b>'+
    '<span>'+(up?mfL(MF_N+' sesi sama, setiap gerakan naik satu tahap.','The same '+MF_N+' sessions, each move one step up.')
      :risk?mfL('Kekal tahap Mudah sehingga doktor atau fisioterapis benarkan lebih.','Stay on the Easy path until a doctor or physiotherapist says more.')
      :mfL('Anda dah di tahap tertinggi. Ulang untuk kukuhkan rutin.','You are on the top path. Repeat it to lock in the routine.'))+'</span></div><span class="pdx-chev">›</span></div>';
  if(np) h+='<div class="mf-nx" onclick="openProgram(\''+MF_NEXT+'\')"><span class="n">2</span><div class="tx"><b>'+hesc(np.name)+(contentOpen()?'':' · HITFAT+')+'</b>'+
    '<span>'+mfL('Tiada lompat, guna kerusi, 6 minggu. Lunge, step-up dan beg galas untuk beban.','No jumping, chair-assisted, 6 weeks. Lunges, step-ups and a backpack for load.')+'</span></div><span class="pdx-chev">›</span></div>';
  h+='<button class="lbx-ghost" onclick="switchTab(\'train\')">'+glyph('workout')+mfL('Lihat semua program','See all programs')+'</button></div>';
  return h;
}
function mfRestart(){
  const me=mfMe(), d=mfData();
  /* the finished round is kept, so a second round can be compared with the first */
  d.hist=(d.hist||[]).concat([{round:d.round||1, path:mfPath(), rec:d.rec, at:iso(0)}]);
  d.round=(d.round||1)+1;
  if(me && !mfRiskOf(me)) me.path=Math.min(2,mfPath()+1);
  HF.data.progress[MF_ID]=0; d.lesson={}; d.rec={}; HF.save(); mfTab='plan'; mfWeek=-1; renderMF(); $('screen').scrollTop=0;
  toast(mfL('THE START bermula semula · tahap ','THE START starts again · path: ')+mfT(MF_PATHS[mfPath()]));
}
function mfLocked(icon,title,text){
  return '<div class="wl-lock">'+ic(icon)+'<div class="t">'+title+'</div><div class="s">'+text+'</div>'+
    '<button class="lbx-go" onclick="mfBuy()">'+mfL('Dapatkan THE START · RM','Get THE START · RM')+MF_PRICE+'</button></div>';
}

/* ── buying it ── */
function mfBuy(){
  if(mfOwned()) return openProgram(MF_ID);
  $('pw-body').innerHTML='<div class="pwtop"><span></span><button class="pwx" aria-label="Close" onclick="closeProduct()">✕</button></div>'+
    '<div class="mf-buy"><div class="mf-top-t">THE <b>START.</b></div><span>'+MF_WK+mfL(' MINGGU · ',' WEEKS · ')+MF_N+mfL(' SESI · DI RUMAH',' SESSIONS · AT HOME')+'</span></div>'+
    '<div class="pwlist">'+[
      ['sliders',mfL('Tahap anda sendiri','Your own path'),mfL('Mudah, Asas atau Beransur, ikut tahap dan keselesaan badan','Easy, Basic or Build, by your level and how your body feels')],
      ['workout',MF_N+mfL(' sesi berpandu',' guided sessions'),mfL('Pemanasan, latihan utama, penyejukan. Video setiap gerakan','Warm-up, main workout, cool-down. A video for every move')],
      ['target',mfL('Teknik setiap gerakan','Technique for every move'),mfL('Tiga isyarat, kesilapan biasa dan versi lebih mudah','Three cues, the common mistake and an easier version')],
      ['steps',mfL('Langkah harian','Daily steps'),mfL('Sasaran naik sedikit setiap minggu, sampai 7,000','A goal that rises a little each week, to 7,000')],
      ['photo',mfScanN()+mfL(' scan makanan AI',' AI meal scans'),mfL('Ambil gambar makanan, AI anggarkan kalorinya. Simpan sampai anda guna','Snap a meal and AI estimates its calories. Kept until you use them')],
      ['food',mfL('Makan cara Malaysia','Eating the Malaysian way'),mfL('Satu tabiat makan seminggu, idea menu setiap hari. Tak kira kalori, nasi tetap ada','One eating habit a week, meal ideas every day. No calorie counting, rice stays')],
      ['trophy',mfL('Milik anda','Yours to keep'),mfL('Bayar sekali. Tiada langganan','Pay once. No subscription')]]
      .map(b=>'<div class="pwf"><div class="ic"><span class="wl-kic">'+glyph(b[0])+'</span></div><div><div class="t">'+b[1]+'</div><div class="m">'+b[2]+'</div></div></div>').join('')+'</div>'+
    '<div class="pwprice"><div class="p">RM'+MF_PRICE+'</div><div class="per">'+mfL('sekali bayar','one payment')+'</div></div>'+
    '<button class="bigbtn" onclick="startCheckout(\'prog_'+MF_ID+'\')">'+mfL('Beli RM','Buy for RM')+MF_PRICE+'</button>'+
    '<button class="authalt" onclick="openPaywall(\'THE START is included in HITFAT+.\')">'+mfL('Atau dapatkan semua dengan HITFAT+','Or get everything with HITFAT+')+'</button>';
  $('pwm').classList.add('on');
  try{ $('pwm').scrollTop=0; }catch(e){}
}
function mfHomeCard(){
  mfEnsure(); if(!mfLive() || typeof hpoCard!=='function') return '';
  const owned=mfOwned(), done=mfDone();
  if(owned && done>=MF_N) return '';
  if(owned && done) return hpoCard(MF,{wide:true,kick:mfL('Sesi ','Session ')+(done+1)+' · '+mfMinutes(mfSession(done))+' min',go:'mfOpenSession('+done+')'});
  if(owned) return hpoCard(MF,{wide:true,kick:mfL('Baru · Sedia bila anda sedia','New · Ready when you are'),go:"openProgram('"+MF_ID+"')"});
  return hpoCard(MF,{wide:true,kick:mfL('Program Baru · RM','New Program · RM')+MF_PRICE,go:"openProgram('"+MF_ID+"')"});
}

/* ── THE START in the player (11 Nov 2026, Seth: "kita nak hidup vibe color the start ... dia tak
   boleh sama dengan Mark Taufik. Dia kena lain. Style lain. Khas untuk orang beginner") ──
   Not MAK2FIT's recolour of the same screens: a poster player that teaches. On the move, the
   three technique cues one at a time and the easier version a tap away; the rest is a cream
   breathing screen; Ready and Done show where this session sits in the 18; every word in
   THE START's own language (BM, or English when the member chose it). Only meta.mf sessions;
   every other program keeps the HITFAT player as it was. */
const MF_PL_WARM=[['Gerak perlahan, badan masih sejuk.','Ikut julat yang selesa.','Bernafas biasa.'],
                  ['Regang perlahan, jangan melantun.','Tahan dan bernafas.','Rasa tarikan, bukan sakit.']];
const MF_PL_LBL=[['#pl-rest .rph','Rest'],['#pl-rest .rnk','→ Up next'],['#pl-rest .rs','Skip'],
                 ['#pl-cd .cdk','Get ready!'],['#pl-ready .rdk','Ready?'],['#pl-done .dk','Workout Complete'],
                 ['#pl-done .dgrid > div:nth-child(1) > span','Time'],['#pl-done .dgrid > div:nth-child(2) > span','Burned'],
                 ['#pl-done .dgrid > div:nth-child(3) > span','Moves'],['#pl-done .dgrid > div:nth-child(4) > span','Streak'],
                 ['#pl-done .dshare','Share'],['#pl-done .dbtns .bigbtn','Done']];
function mfPlCues(ex){
  const c=ex&&ex.mfp&&MF_TECH[ex.mfp];
  if(c) return c[0].map(mfT);
  return MF_PL_WARM[ex&&ex.mfw==='cool'?1:0].map(mfT);
}
/* the 18 sessions as dots: done, this one, the two record sessions ringed */
function mfPlJourney(gi,justDone){
  if(typeof gi!=='number' || gi<0) return '';
  const done=Math.max(mfDone(), justDone?gi+1:0);
  let d='';
  for(let i=0;i<MF_N;i++) d+='<i class="'+[i<done?'on':'',i===gi?'now':'',MF_RECS.indexOf(i)>=0?'rec':''].join(' ').trim()+'"></i>';
  const wk=mfWeekOf(gi)+1, left=MF_N-done;
  const line=justDone
    ? (left>0 ? mfL(done+' daripada '+MF_N+' sesi siap. Lagi '+left+' sesi.', done+' of '+MF_N+' sessions done. '+left+' to go.')
              : mfL('Semua '+MF_N+' sesi siap. Tahniah!','All '+MF_N+' sessions done. Well done!'))
    : mfL('Minggu '+wk+' daripada '+MF_WK+' · sesi '+(gi+1)+' daripada '+MF_N,'Week '+wk+' of '+MF_WK+' · session '+(gi+1)+' of '+MF_N);
  return '<div class="mfj"><div class="mfj-d">'+d+'</div><div class="mfj-l">'+line+'</div></div>';
}
/* On: THE START's words over the player's English labels. Off: the labels put back. */
function mfPlLabels(on){
  MF_PL_LBL.forEach(x=>{ const e=document.querySelector(x[0]); if(e) e.textContent=on?'':x[1]; });
  ['mfj-rd','mfj-dn'].forEach(id=>{ const e=$(id); if(e && !on) e.innerHTML=''; });
  const rk=document.querySelector('#pl-rest .rk');
  if(rk) rk.innerHTML=on?'<span class="b1">'+mfL('Tarik nafas','Breathe in')+'</span><span class="b2">'+mfL('Hembus','Breathe out')+'</span>':'Rest';
  if(!on) return;
  const set=(s,v)=>{ const e=document.querySelector(s); if(e) e.textContent=v; };
  set('#pl-rest .rph',mfL('Rehat','Rest')); set('#pl-rest .rnk',mfL('Seterusnya','Up next'));
  set('#pl-rest .rs',mfL('Langkau','Skip')); set('#pl-cd .cdk',mfL('Bersedia!','Get ready!'));
  set('#pl-done .dgrid > div:nth-child(1) > span',mfL('Masa','Time')); set('#pl-done .dgrid > div:nth-child(2) > span',mfL('Dibakar','Burned'));
  set('#pl-done .dgrid > div:nth-child(3) > span',mfL('Gerakan','Moves')); set('#pl-done .dgrid > div:nth-child(4) > span',mfL('Berturut','Streak'));
  set('#pl-done .dshare',mfL('Kongsi','Share')); set('#pl-done .dbtns .bigbtn',mfL('Siap','Done'));
}
/* (11 Nov 2026, Seth picked "Sesi pertama berpandu") the first time THE
   START's Sesi 1 starts, three pointers over the player before the count:
   where pause is, the easier version, follow the video at your own pace.
   Once only (mfData().guide1); "Langkau" skips them. */
const MF_GUIDE=[
  ['👆','Ketik skrin untuk jeda','Butang jeda, ulang dan langkau keluar bila anda ketik skrin. Rehat bila perlu.',
   'Tap the screen to pause','Pause, back and skip appear when you tap the screen. Rest whenever you need to.'],
  ['🪜','Terlalu susah? Ada versi mudah','Pada setiap gerakan utama, tekan “Versi mudah” dalam kad Kunci teknik di bawah. Ia tunjuk cara yang lebih ringan.',
   'Too hard? There is an easier version','On every main move, tap “Easier version” on the Technique card below. It shows a lighter way.'],
  ['🎥','Ikut video, ikut rentak sendiri','Video tunjuk contoh gerakan. Tak perlu sama laju. Teknik dulu, laju kemudian.',
   'Follow the video, at your own pace','The video shows the move. You do not need to match its speed. Technique first.']];
function mfPlGuide(go){
  if(!pl || !pl.meta || !pl.meta.mf || pl.meta.mf.gi!==0) return false;
  const d=mfData(); if(d.guide1) return false;
  const host=$('play'); if(!host || !document.createElement) return false;
  let i=0; const o=document.createElement('div'); o.id='mfgd';
  const end=()=>{ d.guide1=1; HF.save(); const e=document.querySelector('#pl-learn .mfk-e'); if(e) e.classList.remove('mf-glow'); if(o.parentNode) o.parentNode.removeChild(o); go(); };
  const draw=()=>{
    const x=MF_GUIDE[i], e=document.querySelector('#pl-learn .mfk-e');
    if(e) e.classList.toggle('mf-glow', i===1);
    o.className='s'+i;
    o.innerHTML='<div class="c"><div class="e">'+x[0]+'</div><div class="k">'+mfL('Sesi pertama · ','First session · ')+(i+1)+' / '+MF_GUIDE.length+'</div>'+
      '<b>'+mfL(x[1],x[3])+'</b><p>'+mfL(x[2],x[4])+'</p><div class="d">'+MF_GUIDE.map((_,k)=>'<i class="'+(k===i?'on':'')+'"></i>').join('')+'</div>'+
      '<button class="go">'+(i<MF_GUIDE.length-1?mfL('Seterusnya','Next'):mfL('Faham, jom mula!','Got it, let’s go!'))+'</button>'+
      '<button class="sk">'+mfL('Langkau','Skip')+'</button></div>';
    o.querySelector('.go').onclick=ev=>{ ev.stopPropagation(); if(i<MF_GUIDE.length-1){ i++; draw(); } else end(); };
    o.querySelector('.sk').onclick=ev=>{ ev.stopPropagation(); end(); };
  };
  draw(); host.appendChild(o);
  return true;
}
function mfPlEasy(){ const x=$('mfk-x'); if(x && x.classList) x.classList.toggle('on'); }
function mfPl(stage,arg){
  if(!pl || !pl.meta || !pl.meta.mf) return;
  const gi=pl.meta.mf.gi, ex=pl.exs[pl.i];
  if(stage==='work'){
    if($('pl-ph')) $('pl-ph').textContent=ex.mfw==='warm'?mfL('Pemanasan','Warm-up'):ex.mfw==='cool'?mfL('Regangan','Cool-down'):mfL('Gerak','Move');
    if($('pl-mv')) $('pl-mv').textContent=mfL('Gerakan ','Move ')+(pl.i+1)+'/'+pl.exs.length;
    const n=plNextIndex();
    if($('pl-next')) $('pl-next').innerHTML=n?(mfL('Seterusnya: ','Next: ')+'<b>'+pl.exs[n.i].n+'</b>'):mfL('Gerakan terakhir!','Last one!');
    const c=ex.mfp&&MF_TECH[ex.mfp], cues=mfPlCues(ex);
    if($('pl-learn')) $('pl-learn').innerHTML='<div class="mfk"><div class="mfk-h">'+mfL('Kunci teknik','Technique')+'</div><div class="mfk-c">'+
      cues.map((t,i)=>'<span class="k'+i+'"><em>'+(i+1)+'</em>'+t+'</span>').join('')+'</div>'+
      (c?'<button class="mfk-e" onclick="event.stopPropagation();mfPlEasy()">'+mfL('Terlalu susah? Versi mudah','Too hard? Easier version')+'</button>'+
         '<div class="mfk-x" id="mfk-x">'+mfT(c[2])+'. <i>'+mfL('Elak: ','Avoid: ')+mfT(c[1]).toLowerCase()+'.</i></div>':'')+'</div>';
  } else if(stage==='rest'){
    const n=arg, nx=n&&pl.exs[n.i]; if(!nx) return;
    if($('pl-restmeta')) $('pl-restmeta').textContent=mfL('Gerakan ','Move ')+(n.i+1)+'/'+pl.exs.length;
    if($('pl-resttip')) $('pl-resttip').innerHTML='<b>'+mfL('Kunci teknik','Technique')+'</b>'+mfPlCues(nx).join(' ');
  } else if(stage==='count'){
    if($('pl-cdx')) $('pl-cdx').innerHTML='<span>'+mfL('Mula dengan','First up')+'</span><b>'+ex.n+'</b>';
  } else if(stage==='ready'){
    const secs=pl.exs.reduce((t,e)=>t+(e.dur||45)+plRestOf(e),0), mins=Math.max(1,Math.round(secs/60)), nm=pl.exs.length;
    if(document.querySelector('#pl-ready .rdk')) document.querySelector('#pl-ready .rdk').textContent=gi>=0?mfL('Sesi '+(gi+1)+' / '+MF_N,'Session '+(gi+1)+' / '+MF_N):(pl.meta.mf.aktif?mfL('Hari aktif','Active day'):mfL('Cuba gerakan','Try the move'));
    const ss=gi>=0&&mfSession(gi); if($('pl-rdt') && ss && ss.n) $('pl-rdt').textContent=mfT(ss.n);
    if(pl.meta.mf.aktif && $('pl-rdt')) $('pl-rdt').textContent=mfL('Regangan','Stretch');
    if($('pl-rdm')) $('pl-rdm').textContent=nm+mfL(' gerakan · lebih kurang ',' moves · about ')+mins+mfL(' minit',' min');
    if($('pl-rds')) $('pl-rds').innerHTML='<div class="pl-chips"><span><b>'+mins+'</b> '+mfL('minit','min')+'</span><span><b>'+nm+'</b> '+mfL('gerakan','moves')+'</span><span>'+mfL('Ikut rentak anda','Your own pace')+'</span></div>';
    if($('pl-rdgo')) $('pl-rdgo').textContent=mfL('Mula sesi','Start session');
    if($('pl-rdf')) $('pl-rdf').innerHTML=mfPlJourney(gi)+'<div class="mf-rdf">'+mfL('Mula dengan: ','First up: ')+pl.exs[0].n+'</div>';
  } else if(stage==='done'){
    const dk=document.querySelector('#pl-done .dk');
    if(dk) dk.textContent=gi>=0?mfL('Sesi '+(gi+1)+' siap!','Session '+(gi+1)+' done!'):(pl.meta.mf.aktif?mfL('Hari aktif siap!','Active day done!'):mfL('Siap!','Done!'));
    if($('pl-dn-date')) $('pl-dn-date').textContent=new Date().toLocaleDateString(mfEn()?'en-GB':'ms-MY',{weekday:'long',day:'numeric',month:'long'});
    let j=$('mfj-dn');
    if(!j){ const at=$('pl-dn-date'); if(at && at.insertAdjacentHTML){ at.insertAdjacentHTML('afterend','<div id="mfj-dn"></div>'); j=$('mfj-dn'); } }
    if(j) j.innerHTML=mfPlJourney(gi,true);
    /* a session with a squat or a push-up: Coach Seth can check it with the camera */
    const tp=['squat','push'].filter(p=>pl.exs.some(e=>e.mfp===p))[0];
    if(j && tp && mfOwned()) j.innerHTML+='<button class="mf-tkdn" onclick="mfTk(\''+MF_TK[tp]+'\')">'+glyph('target')+'<span><b>'+
      mfL('Semak teknik '+(tp==='squat'?'squat':'push up')+' dengan AI','Check your '+(tp==='squat'?'squat':'push-up')+' with AI')+'</b>'+
      mfL('Coach Seth tengok melalui kamera','Coach Seth watches through the camera')+'</span></button>';
    /* how it felt, in THE START's own three words (the Pelan tab counts them the same way) */
    const fk=document.querySelector('#pl-dn-feel .fk'); if(fk) fk.textContent=mfL('Macam mana sesi tadi?','How was it?');
    const fw={easy:mfL('Mudah','Easy'),right:mfL('Ngam','Just right'),hard:mfL('Susah','Hard')};
    Array.prototype.forEach.call(document.querySelectorAll('#pl-dn-feel button'),b=>{ const w=fw[b.getAttribute('data-f')]; if(w) b.textContent=w; });
    const su=$('pl-dn-streak-u'); if(su) su.textContent=mfL('HARI',su.textContent);
    try{
      const days=daysThisWeek(), wg=HF.data.weekGoal||5, wm=weekMinutes();
      const wh=document.querySelector('#pl-dn-week .wkh');
      if(wh) wh.innerHTML='<b>'+mfL('Minggu ini','This week')+'</b><span>'+mfL(days+' daripada '+wg+' hari · '+wm+' minit',days+' of '+wg+' days · '+wm+' min')+'</span>';
      const wl=document.querySelector('#pl-dn-week .wkl');
      if(wl) wl.textContent=days>=wg?mfL('Sasaran minggu ini tercapai 🎉','Weekly goal reached 🎉'):mfL('Lagi '+(wg-days)+' hari untuk sasaran anda.',(wg-days)+' more day'+(wg-days===1?'':'s')+' to your goal.');
    }catch(e){}
  }
}

/* ── Semak Teknik inside THE START (11 Nov 2026, Seth: "aku nk ko masukkan terus dalam apps ... dalam 6 week the
   start"). The AI camera check lives at /teknik (same origin, so its memory is the member's); here it opens over
   the app in a frame with the camera allowed, and closes back to where the member was. Squat and push-up are the
   two THE START patterns the AI can judge; the other moves (lunge, burpee) stay on its own home screen. ── */
const MF_TK={squat:'squat', push:'pushup'};
function mfTkBtn(p){
  return '<button class="mf-tkb" onclick="event.stopPropagation();mfTk(\''+MF_TK[p]+'\')">'+glyph('target')+
    mfL('Semak teknik dengan AI','Check technique with AI')+'</button>';
}
function mfTkBanner(){
  return '<button class="mf-tkban" onclick="mfTk(\'\')"><span class="k">'+mfL('BARU · AI COACH','NEW · AI COACH')+'</span>'+
    '<b>'+mfL('Semak Teknik','Technique Check')+'</b><span class="s">'+
    mfL('Letak telefon, buat 5 rep. Coach Seth tengok melalui kamera dan beritahu apa yang perlu dibetulkan.',
        'Prop up your phone and do 5 reps. Coach Seth watches through the camera and tells you what to fix.')+'</span>'+
    '<span class="go">'+mfL('Squat · Push up · Lunge · Burpee','Squat · Push-up · Lunge · Burpee')+' →</span></button>';
}
function mfTk(move){
  mfTkClose();
  const ov=document.createElement('div'); ov.id='tkov';
  ov.innerHTML='<iframe src="/teknik/?app=1'+(move?'#'+move:'')+'" allow="camera; microphone; autoplay; fullscreen" title="Semak Teknik"></iframe>';
  document.body.appendChild(ov);
  if(!mfTk._on){ mfTk._on=1; window.addEventListener('message',e=>{ if(e.origin===location.origin && e.data && e.data.tk==='close') mfTkClose(); }); }
}
function mfTkClose(){ const o=$('tkov'); if(o && o.parentNode) o.parentNode.removeChild(o); }

/* ── Technique cards with pictures (11 Nov 2026, Seth: "kad teknik letak gambar baru mudah faham"; he picked
   "betul vs salah"). One athlete per pattern, the same person and studio twice: ✓ the cue done right, ✗ the
   usual mistake. Photos in /img/p/mula/tk/<pattern>-ok.jpg and -x.jpg. ── */
const MF_TK_PIC={
  squat: [['Lutut ikut arah jari kaki','Knees follow the toes'],['Lutut masuk ke dalam','Knees cave in']],
  push:  [['Badan lurus macam papan','Body straight like a plank'],['Pinggang jatuh','Hips sag']],
  bridge:[['Bahu, pinggul, lutut segaris','Shoulders, hips, knees in line'],['Pinggang melengkung','Lower back arches']],
  hinge: [['Belakang lurus, punggung ke belakang','Flat back, hips back'],['Belakang membongkok','Rounded back']],
  pull:  [['Bahu turun, jauh dari telinga','Shoulders down, away from ears'],['Bahu terangkat','Shoulders shrug up']],
  core:  [['Pinggang rapat ke lantai','Lower back flat on the floor'],['Pinggang terangkat','Lower back lifts']],
  bal:   [['Badan tegak, pandang depan','Tall, eyes ahead'],['Badan condong ke tepi','Leaning to the side']],
  cardio:[['Duduk tegak, rentak sendiri','Sit tall, your own pace'],['Membongkok','Slumped']]
};
function mfTkPics(p,small){
  const c=MF_TK_PIC[p]; if(!c) return '';
  const one=(k,ok,cap)=>'<figure class="'+(ok?'ok':'x')+'"><span class="tg">'+(ok?'✓ '+mfL('BETUL','RIGHT'):'✗ '+mfL('SALAH','WRONG'))+'</span>'+
    '<img src="/img/p/mula/tk/'+p+'-'+k+'.jpg?v=2" alt="'+mfL(cap[0],cap[1])+'" loading="lazy" width="300" height="375"><figcaption>'+mfL(cap[0],cap[1])+'</figcaption></figure>';
  return '<div class="mf-tkpic'+(small?' sm':'')+'">'+one('ok',true,c[0])+one('x',false,c[1])+'</div>';
}
