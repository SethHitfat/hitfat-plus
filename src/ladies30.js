/* ═══════════════ LADIES BURN 30 ═══════════════
   The women's 30-day program, built on BURN30's template and replacing
   "Ladies Beginner" (the SKU prog_lad4 stays, so anyone who bought that
   keeps it). Its content moved here from the old HITFAT Ladies 30 Day app
   (ladieshitfat.netlify.app): the 30 daily nutrition missions, the walking
   ramp of 4,000 to 10,000 steps and the water ramp of 2.0 to 2.5 L. The
   movements are HITFAT's own filmed library (DB), real people, not the old
   app's 3D animations.

   Unlike BURN30 it is written in Malay, and while it is on screen the
   language layer (i18n.js) puts the shared screens, the player among them,
   into Malay too.

   What is different from BURN30:
     · nothing jumps (quiet enough for a terrace house, an apartment, a
       sleeping baby); low impact, no equipment, 20 minutes at most, and
       any day can be done as 2 × 10 minutes, morning and evening;
     · day 1 is the body check-in first (weight, waist, hip, photo), then
       a low-impact fit test that can be skipped;
     · check-ins on days 1, 15 and 30 include the hip;
     · the calorie target is BURN30's own sum (mpNut), never below 1,200;
     · Malay home-cooking menus with three options per meal.

   Placeholders, to be filled when Seth sends them, live in one place each:
     LB30_NAME            the program's name
     LB30_DAYS[].ex       the 30 days of movements (no jumping)
     LB30_MENU            the Malay menus
     LB30_SETH            Coach Seth's videos (intro, every week, nutrition)
     LB30_DEMO            the hijab demonstration videos, by movement name
                          (until then each move plays its HITFAT library clip)
     LB30_POSTER          the poster (a woman in hijab, modest clothing)
   A Vimeo value is 'id' or 'id/hash' (an unlisted video).

   ES5 only in this file (var, function, no arrows or template strings),
   as the brief for this program asks. */

var LB30_NAME='Ladies Burn 30';                 /* nama sementara: tukar di sini sahaja */
var LB30_SUB='30 Hari Bakar Lemak · Khas Wanita';
var LB30_ID='lad4';                             /* the SKU is prog_lad4 */
var LB30_KEY='lb30';                            /* its data, its session keys */
var LB30_PRICE=39;
var LB30_POSTER='';                             /* gambar poster: model berhijab, akan datang */
var LB30_ACCENT='#E30613';             /* HITFAT red, as the page she bought it from (25 Oct) */
var LB30_REST=20;                               /* the player's rest between moves (REST_SECS) */

/* ── videos ── */
var LB30_SETH={
  intro:'',                                     /* intro program */
  weeks:['','','',''],                          /* intro Minggu 1–4 */
  nutrition:['','','']                          /* tips pemakanan */
};
/* hijab demonstrations, by movement name: { 'Bodyweight Squat':'123456789/abcdef' } */
var LB30_DEMO={};
/* ── the 30 days ──
   From HITFAT's filmed library only, and from what in it has no jump, no
   running on the spot and no equipment (a wall at most): quiet enough for
   a terrace house, an apartment or a sleeping baby. Two rounds in week 1,
   three after; five moves, then six; push-ups move from the wall to the
   knees to the floor. 20 minutes at most. k: test · work · recover. */
var LB30_TEST=['Bodyweight Squat','Knee Push Ups','Hip Thrust','Crunch','Plank'];
var LB30_RECOVER=['IC Warm','Bird Dog','Dead Bug','Hip Thrust','Calf Raises'];
var LB30_WEEKS=[
  {n:'Start', s:'Sesi pendek, tiada lompatan. Tugas minggu ini cuma satu: hadir.',              from:1,  to:7},
  {n:'Build', s:'Tiga pusingan sekarang. Sedikit lebih lama, sedikit lebih variasi.',            from:8,  to:14},
  {n:'Glow',  s:'Minggu paling bertenaga. Enam gerakan sehari, tetap tanpa lompat.',              from:15, to:21},
  {n:'Strong',s:'Sembilan hari terakhir. Anda lebih kuat daripada wanita yang mula pada Hari 1.', from:22, to:30}
];
var LB30_DAYS=[
  {n:'Check-in & Fit Test',      k:'test',    r:1, ex:LB30_TEST},
  {n:'Full Body Basics',        k:'work',    r:2, ex:['Bodyweight Squat','Wall Push Up','Hip Thrust','Dead Bug','Calf Raises']},
  {n:'Glutes & Legs',              k:'work',    r:2, ex:['Bodyweight Squat','Reverse Lunges','Hip Thrust','Side Lunges','Wall Sit']},
  {n:'Core Basics',                k:'work',    r:2, ex:['Dead Bug','Crunch','Bird Dog','Reverse Crunch','Plank']},
  {n:'Posture & Upper Body',       k:'work',    r:2, ex:['Wall Push Up','Bird Dog','Knee Push Ups','Dead Bug','Plank']},
  {n:'Low-Impact Burn',        k:'work',    r:2, ex:['Squat Pulse','Mountain Climber','Alternating Lunges','Bicycle Crunch','Calf Raises']},
  {n:'Stretch & Recover',          k:'recover', r:1, ex:LB30_RECOVER},

  {n:'Full Body',             k:'work',    r:3, ex:['Bodyweight Squat','Knee Push Ups','Reverse Lunges','Mountain Climber','Hip Thrust']},
  {n:'Glute Focus',               k:'work',    r:3, ex:['Hip Thrust','Curtsy Lunges','Single Leg Glutes Bridge','Side Lunges','Squat Hold']},
  {n:'Low-Impact Burn',        k:'work',    r:3, ex:['Squat Pulse','Mountain Climber','Alternating Lunges','Plank Shoulder Taps','Calf Raises']},
  {n:'Strong Core',                k:'work',    r:3, ex:['Dead Bug','Russian Twist','Reverse Crunch','Side Plank','Plank']},
  {n:'Posture & Upper Body',       k:'work',    r:3, ex:['Knee Push Ups','Bird Dog','Push Up Hold','Plank Shoulder Taps','Dead Bug']},
  {n:'Glutes & Legs',              k:'work',    r:3, ex:['Squat Pause','Walking Lunges','Hip Thrust','Curtsy Lunges','Wall Sit']},
  {n:'Stretch & Recover',          k:'recover', r:1, ex:LB30_RECOVER},

  {n:'Full Body Burn',       k:'work',    r:3, ex:['Bodyweight Squat','Knee Push Ups','Alternating Lunges','Mountain Climber','Hip Thrust','Bicycle Crunch']},
  {n:'Glutes & Legs',              k:'work',    r:3, ex:['Squat Pulse','Reverse Lunges','Single Leg Glutes Bridge','Curtsy Lunges','Side Lunges','Single Leg Calf Raises']},
  {n:'Core & Waist',          k:'work',    r:3, ex:['Dead Bug','Russian Twist','Bicycle Crunch','Leg Raises','Side Plank','Plank']},
  {n:'Stretch & Recover',          k:'recover', r:1, ex:LB30_RECOVER},
  {n:'Posture & Upper Strength',    k:'work',    r:3, ex:['Knee Push Ups','Bird Dog','Plank Shoulder Taps','Push Up Hold','Wall Push Up','Dead Bug']},
  {n:'Glute Burn',               k:'work',    r:3, ex:['Hip Thrust','Single Leg Glutes Bridge','Curtsy Lunges','Squat Hold','Side Lunges','Calf Raises']},
  {n:'Stretch & Recover',          k:'recover', r:1, ex:LB30_RECOVER},

  {n:'Strong Full Body',        k:'work',    r:3, ex:['Squat Pause','Push Up','Walking Lunges','Mountain Climber','Hip Thrust','Plank']},
  {n:'Low-Impact Burn',        k:'work',    r:3, ex:['Squat Pulse','Mountain Climber','Reverse Lunges','Plank Shoulder Taps','Bicycle Crunch','Calf Raises']},
  {n:'Glutes & Legs',              k:'work',    r:3, ex:['Squat Pause','Curtsy Lunges','Single Leg Glutes Bridge','Side Lunges','Wall Sit','Single Leg Calf Raises']},
  {n:'Stretch & Recover',          k:'recover', r:1, ex:LB30_RECOVER},
  {n:'Core Finisher',             k:'work',    r:3, ex:['Dead Bug','Leg Raises','Russian Twist','Flutter Kick','Side Plank','Hollow Hold']},
  {n:'Posture & Upper Strength',    k:'work',    r:3, ex:['Push Up','Bird Dog','Plank Shoulder Taps','Push Up Hold','Knee Push Ups','Plank']},
  {n:'Full Body Challenge',     k:'work',    r:3, ex:['Bodyweight Squat','Push Up','Alternating Lunges','Mountain Climber','Hip Thrust','Plank']},
  {n:'Stretch & Recover',          k:'recover', r:1, ex:LB30_RECOVER},
  {n:'Final Check-in & Fit Test', k:'test',    r:1, ex:LB30_TEST}
];
/* one line from the coach for each day */
var LB30_TIPS=[
  'Hari ini garisan permulaan anda. Rekod badan dahulu, kemudian fit test — atau langkau fit test jika belum bersedia.',
  'Perlahan dan belajar bentuk setiap gerakan. Laju datang kemudian.',
  'Tolak lantai dengan tumit. Kaki dan punggung ialah enjin terbesar anda.',
  'Tekan pinggang ke lantai. Perut yang rata bermula dengan teras yang kuat.',
  'Bahu ke belakang, dada terbuka. Postur yang baik dilatih, bukan diharap.',
  'Gerak berterusan tanpa lompat. Berpeluh tetap berpeluh.',
  'Hari pulih. Tambah jalan kaki 20 minit jika boleh.',
  'Tiga pusingan bermula hari ini. Rehat bila pemasa kata, bukan sebelum.',
  'Picit punggung di setiap ulangan. Rasa ototnya bekerja.',
  'Lutut naik setinggi selesa. Senyap tetapi laju.',
  'Hembus nafas semasa mengecut perut. Jangan tahan nafas.',
  'Push-up dari lutut sekarang. Dada ke lantai, siku 45 darjah.',
  'Turun perlahan, naik dengan kuat.',
  'Dua minggu siap. Esok pagi, Hari 15: rekod berat, pinggang dan pinggul sebelum sarapan.',
  'Separuh jalan. Ambil gambar Hari 15 — cermin boleh menipu, pita ukur tidak.',
  'Satu kaki pada satu masa. Imbangan datang dengan ulangan.',
  'Pinggang dan teras hari ini. Pusing dari dada, bukan dari leher.',
  'Hari pulih. Badan anda menjadi kuat semasa berehat.',
  'Kekuatan badan atas membantu kerja harian: angkat anak, angkat beg barang.',
  'Fokus punggung. Picit di atas, turun perlahan.',
  'Tiga minggu siap. Ini sudah tabiat, bukan cabaran lagi.',
  'Minggu terakhir, dan push-up penuh. Turun ke lutut bila perlu — itu tetap dikira.',
  'Bakar tanpa lompat. Muzik kegemaran, dan teruskan bergerak.',
  'Kaki dan punggung. Tahan sekejap di bawah setiap lunge.',
  'Hari pulih. Tidur awal malam ini.',
  'Teras penamat. Kawal setiap ulangan, jangan terburu-buru.',
  'Postur dan kekuatan. Berdiri tinggi selepas sesi ini.',
  'Sesi paling panjang program ini. Habiskan dengan kuat.',
  'Rehat dengan baik. Esok hari terakhir.',
  'Hari 30. Rekod badan anda, ulang fit test, dan lihat sejauh mana anda sudah pergi.'
];

/* ── the daily checklist: walking and water climb through the month ── */
var LB30_STEPS=[4000,4000,4200,4500,4500,5000,5000,5500,5500,6000,6000,6000,6500,6500,6500,
                7000,7000,7000,7500,8000,8000,8000,8000,8500,8500,9000,9000,9500,9500,10000];
function lbWater(gi){ return gi<7?2.0:gi<14?2.2:gi<21?2.3:2.5; }
/* the 30 daily nutrition missions, from Ladies 30 Day */
var LB30_MISI=[
  'Tukar satu minuman manis kepada air kosong hari ini. Satu sahaja.',
  'Tambah sebiji telur atau seketul ayam pada sarapan.',
  'Separuh pinggan makan tengah hari ialah sayur hari ini.',
  'Minum segelas penuh air sebelum makan utama.',
  'Kurangkan satu makanan bergoreng hari ini. Satu sahaja.',
  'Buah, bukan kuih, selepas makan tengah hari.',
  'Kurang manis untuk setiap minuman yang anda pesan hari ini.',
  'Protein setiap kali makan hari ini: telur, ayam, ikan atau tauhu.',
  'Berhenti makan bila rasa cukup kenyang, bukan sendat.',
  'Tiada minuman manis langsung hari ini. Air kosong, kopi o kosong atau teh o kosong.',
  'Makan protein dan sayur dahulu, nasi kemudian.',
  'Sediakan sarapan esok pagi pada malam ini.',
  'Segelas air tambahan sebelum anda rasa lapar.',
  'Nasi sebesar genggaman tangan anda sendiri hari ini.',
  'Langkau tambah kali kedua. Tunggu sepuluh minit dahulu.',
  'Isi separuh pinggan dengan sayur sebelum yang lain.',
  'Jangan makan di depan telefon atau TV hari ini.',
  'Buah dan segelas air untuk makan lewat malam, bukan snek.',
  'Makan di luar hari ini? Minta kurang nasi, lebih sayur.',
  'Protein dahulu waktu sarapan, sebelum roti atau nasi.',
  'Rancang makanan hujung minggu hari ini, sebelum hujung minggu yang merancang untuk anda.',
  'Air sebelum setiap kali makan hari ini. Tiga gelas, tiga hidangan.',
  'Tiada makanan bergoreng hari ini. Bakar, kukus atau sup.',
  'Sayur pada dua waktu makan hari ini, bukan satu.',
  'Satu hidangan masak di rumah hari ini, bukan pesan dari luar.',
  'Baca satu label minuman hari ini dan tengok jumlah gulanya.',
  'Protein waktu makan tengah hari DAN makan malam hari ini.',
  'Makan cukup perlahan sehingga anda yang terakhir habis di meja.',
  'Tulis apa yang berkesan untuk anda sepanjang 30 hari ini. Anda akan perlukannya.',
  'Misi terakhir: makan seperti hari terbaik anda bulan ini.'
];
/* BURN30's own checklist items, kept beside the new ones */
var LB30_CHECKS=[['misi','Nutrition mission','food'],['makan','Ate to plan','clipboard'],['tidur','Slept 7 hours','moon']];

/* ── the menus: Malay home cooking ──
   Ten Malay home dishes for each meal (19 Oct: four added to each, so the
   30 days don't repeat two sets); each day shows three, picked by the day.
   kcal is for the portion shown. Seth can still swap in his own list here. */
var LB30_MENU={
  sarapan:{label:'Breakfast', time:'7:00 am', share:0.25, note:'Cepat, untuk ibu yang bekerja', opts:[
    {n:'Telur rebus & roti mil penuh', k:350, it:['2 biji telur rebus','2 keping roti mil penuh','Teh o kurang manis']},
    {n:'Oat susu & pisang',            k:330, it:['Oat dimasak dengan susu rendah lemak','1 biji pisang']},
    {n:'Nasi lemak separuh',           k:420, it:['Nasi lemak, separuh pinggan','1 biji telur rebus','Timun','Sambal, sedikit']},
    {n:'Roti telur',                   k:330, it:['2 keping roti mil penuh','Telur dadar 1 biji','Kopi o kosong']},
    {n:'Bihun goreng kurang minyak',   k:400, it:['Bihun goreng, 1 genggam','1 biji telur mata','Sayur sawi']},
    {n:'Lempeng pisang & telur',       k:360, it:['2 keping lempeng pisang kecil','1 biji telur rebus','Teh o kosong']},
    {n:'Bubur nasi ayam',              k:340, it:['Bubur nasi ayam, 1 mangkuk','Hirisan halia & daun bawang','Teh o kosong']},
    {n:'Ubi rebus & telur',            k:320, it:['Ubi kayu rebus, 1 genggam','1 biji telur rebus','Kopi o kosong']},
    {n:'Tosai & kuah sambar',          k:350, it:['2 keping tosai','Kuah sambar','Teh o kurang manis']},
    {n:'Roti canai kosong & dal',      k:380, it:['1 keping roti canai kosong','Kuah dal, sedikit','Teh o kosong']}
  ]},
  tengahari:{label:'Lunch Box', time:'1:00 pm', share:0.40, note:'Bekal dari rumah', opts:[
    {n:'Ayam masak kicap',             k:500, it:['Nasi putih, 1 genggam','Ayam masak kicap, 1 tapak tangan','Sayur campur, 2 genggam']},
    {n:'Ikan bakar & kangkung',        k:480, it:['Nasi perang, 1 genggam','Ikan bakar, 1 tapak tangan','Kangkung tumis']},
    {n:'Mi sup ayam',                  k:430, it:['Mi kuning, 1 genggam','Ayam carik, 1 tapak tangan','Sup sayur']},
    {n:'Telur dadar sayur',            k:450, it:['Nasi putih, 1 genggam','Telur dadar sayur 2 biji','Sambal timun']},
    {n:'Daging masak merah',           k:520, it:['Nasi putih, 1 genggam','Daging masak merah, kuah sedikit','Sawi tumis']},
    {n:'Nasi goreng kampung',          k:520, it:['Nasi goreng kampung kurang minyak, 1 genggam','1 biji telur mata','Timun']},
    {n:'Ayam percik & ulam',           k:510, it:['Nasi putih, 1 genggam','Ayam percik tanpa kulit, 1 tapak tangan','Ulam & timun']},
    {n:'Sup daging & sayur',           k:480, it:['Nasi putih, 1 genggam','Sup daging, isi 1 tapak tangan','Kobis goreng sedikit minyak']},
    {n:'Ikan masak lemak cili api',    k:510, it:['Nasi putih, 1 genggam','Ikan masak lemak, kuah sedikit','Kacang buncis goreng']},
    {n:'Nasi kerabu & ikan bakar',     k:500, it:['Nasi kerabu, 1 genggam','Ikan bakar, 1 tapak tangan','Ulam & kerabu, sambal sedikit']}
  ]},
  malam:{label:'Family Dinner', time:'7:30 pm', share:0.35, note:'Makan bersama keluarga', opts:[
    {n:'Asam pedas ikan',              k:480, it:['Nasi putih, 1 genggam','Ikan asam pedas, 1 tapak tangan','Bayam tumis']},
    {n:'Sup ayam & tempe',             k:450, it:['Sup ayam dengan sayur','Nasi, separuh genggam','Tempe bakar']},
    {n:'Ayam panggang & ulam',         k:480, it:['Nasi putih, 1 genggam','Ayam panggang tanpa kulit','Ulam & sambal belacan']},
    {n:'Ikan kukus halia',             k:450, it:['Nasi putih, 1 genggam','Ikan kukus halia','Sawi tumis']},
    {n:'Gulai ayam',                   k:520, it:['Nasi putih, 1 genggam','Gulai ayam, kuah sedikit','Timun & tomato']},
    {n:'Tauhu sumbat & sup sayur',     k:430, it:['Nasi, separuh genggam','Tauhu sumbat 2 keping','Sup sayur']},
    {n:'Ayam masak halia',             k:460, it:['Nasi putih, 1 genggam','Ayam masak halia, 1 tapak tangan','Kailan tumis']},
    {n:'Sotong sambal kurang minyak',  k:470, it:['Nasi putih, 1 genggam','Sotong sambal, 1 tapak tangan','Kacang panjang goreng']},
    {n:'Telur bistik & sayur',         k:450, it:['Nasi, separuh genggam','Telur bistik 2 biji','Sayur campur']},
    {n:'Udang masak merah',            k:480, it:['Nasi putih, 1 genggam','Udang masak merah, 1 tapak tangan','Taugeh goreng']}
  ]}
};
var LB30_SLOTS=['sarapan','tengahari','malam'];

/* the fit test, low impact: reps in the time, the plank in seconds */
var LB30_FIT=[['squat','Bodyweight Squat','reps'],['push','Knee Push Ups','reps'],['bridge','Hip Thrust','reps'],
              ['crunch','Crunch','reps'],['plank','Plank','secs']];
var LB30_CHECKINS=[1,15,30];

/* ── the program, in the shape the rest of the app reads ──
   Ladies Beginner's own object is updated in place, so every list that
   already holds it (collections, plans, the store) shows the new program.
   Its days carry no movement names: they are not in the library, and the
   hub plays them itself. */
var LB30=(function(){
  var weeks=LB30_WEEKS.map(function(w){
    return {days:LB30_DAYS.slice(w.from-1,w.to).map(function(d){ return {name:d.n, ex:[], r:d.r, k:d.k}; })};
  });
  /* the card's minutes: the average training day, as every other card */
  var work=LB30_DAYS.filter(function(d){ return d.k==='work'; }), tot=0;
  work.forEach(function(d){ tot+=lbMinutes(d); });
  var fields={id:LB30_ID, name:LB30_NAME, sub:LB30_SUB, goal:'Fat Loss', level:'Beginner', dur:Math.round(tot/work.length), rounds:3,
    c1:'#3a1f2d', c2:'#0d080b', ac:LB30_ACCENT, icon:'🌸', weeks:weeks, hub:'lb30', oneTime:true, price:LB30_PRICE, wk:4,
    desc:'30 hari bakar lemak di rumah, khas untuk wanita. Tiada lompatan, tanpa alat, 20 minit sehari — '+
         'atau 2 × 10 minit pagi dan petang. Dengan sasaran kalori, menu masakan Melayu, misi pemakanan harian '+
         'dan progres anda direkod.'};
  var p=null, i;
  for(i=0;i<PROGRAMS.length;i++) if(PROGRAMS[i].id===LB30_ID){ p=PROGRAMS[i]; break; }
  if(!p){ p={}; PROGRAMS.push(p); }
  for(var k in fields) if(fields.hasOwnProperty(k)) p[k]=fields[k];
  delete p.ex;
  return p;
})();

/* ── state ── */
function lbData(){
  var d=HF.data.lb30||(HF.data.lb30={});
  d.check=d.check||{}; d.fit=d.fit||{}; d.body=d.body||{}; d.half=d.half||{}; d.steps=d.steps||{}; d.water=d.water||{}; d.shop=d.shop||{};
  /* the old Ladies Beginner counted its own days; the new program starts at day 1 */
  if(!d.v){ d.v=1; HF.data.progress[LB30_ID]=0; }
  return d;
}
function lbOwned(){ return ownsProgram(LB30); }
function lbDone(){ lbData(); return Math.min(progDone(LB30_ID), LB30_DAYS.length); }
function lbNext(){ return lbDone(); }
function lbWeekOf(gi){ var n=gi+1; for(var i=0;i<LB30_WEEKS.length;i++) if(n>=LB30_WEEKS[i].from&&n<=LB30_WEEKS[i].to) return i; return 0; }
function lbVid(v){ var p=String(v||'').split('/'); return {v:p[0]||'', h:p[1]||''}; }
/* a movement, in the shape the player plays: the hijab demo when there is one */
function lbEx(name){
  var e=null, i, demo=LB30_DEMO[name];
  for(i=0;i<DB.length;i++) if(DB[i].n===name && DB[i].v){ e=DB[i]; break; }
  if(!e) for(i=0;i<DB.length;i++) if(DB[i].n===name){ e=DB[i]; break; }
  e=e||{n:name, v:'', m:'Full Body', dur:45};
  var v=demo?lbVid(demo):{v:e.v||'', h:''};
  return {n:name, v:v.v, h:v.h, m:e.m, dur:e.dur||45, eq:'Tanpa alat', t:e.t};
}
function lbExercises(d){ return d.ex.map(lbEx); }
function lbSecs(exs,r){ var s=0; exs.forEach(function(e){ s+=e.dur+LB30_REST; }); return s*r; }
function lbMinutes(d){ return Math.max(1, Math.round(lbSecs(lbExercises(d),d.r)/60)); }
/* 2 × 10: the moves split in two, each half for all its rounds */
function lbHalves(d){ var exs=lbExercises(d), m=Math.ceil(exs.length/2); return [exs.slice(0,m), exs.slice(m)]; }
var LB30_KIND={test:'Check-in & Fit Test', work:'Workout', recover:'Recovery'};
var LB30_PIC={test:'act-beginner', work:'act-fatloss', recover:'act-recovery'};
function lbPic(d){ return '/img/p/'+(LB30_PIC[d.k]||'act-beginner')+'.jpg'; }

/* While the program is on screen, everything is in Malay: its own pages are
   written so, and the language layer covers the shared ones (the player,
   the bar at the top). Leaving the program puts English back. */
/* 25 Oct 2026 (Seth): the labels are English — Plan, Progress, Week 1, Day 1,
   Today — and the notes stay Malay, so the program no longer turns the
   shared screens Malay. Set true to bring the old all-Malay mode back. */
var LB30_MS_UI=false;
var _lbMs=false;
function lbLang(on){
  if(typeof i18nApply!=='function') return;
  if(on && !LB30_MS_UI) return;
  /* the tab bar at the bottom stays as the rest of the app has it (18 Oct:
     it turned into Utama / Makan / Saya on this one program) */
  var tb=$('tabs');
  if(on && !_lbMs){ _lbMs=true; if(tb&&tb.setAttribute) tb.setAttribute('data-noi18n','1'); LANG='ms'; i18nApply(document.body); }
  else if(!on && _lbMs){ _lbMs=false; LANG='en'; i18nRestore(document.body); if(tb&&tb.removeAttribute) tb.removeAttribute('data-noi18n'); }
}

/* ── the program's home (25 Oct 2026, Seth: "nampak premium macam BODi dan
   Sweat … kene wow sangat untuk orang sanggup beli") ──
   A big photograph, then one card that says where she is (a ring for the
   month, today's workout with its picture and one button), the day's routine
   as tiles, and the month as day tiles she can swipe through. Warm cream and
   HITFAT red, like the page she bought it from. The photographs are the ones
   the landing page uses (/ladies/img), one per kind of day. */
var LB30_IMG={hero:'/ladies/img/lb-penyelesaian.webp', work:'/ladies/img/hero-rumah.webp',
  test:'/ladies/img/hero-rumah.webp', recover:'/ladies/img/lb-ibu-anak.webp', food:'/ladies/img/lb-makanan.webp'};
/* one cover a week (25 Oct): Mula at sunrise, Bina, Bakar, Kuat at dusk; a
   training day shows its week's, so the picture moves on as she does */
var LB30_WEEK_IMG=['/ladies/img/lb-w1.jpg','/ladies/img/lb-w2.jpg','/ladies/img/lb-w3.jpg','/ladies/img/lb-w4.jpg'];
function lbImg(k){ return LB30_IMG[k]||LB30_IMG.work; }
function lbDayImg(gi){ var d=LB30_DAYS[gi]; return (d && d.k==='work') ? LB30_WEEK_IMG[lbWeekOf(gi)] : lbImg(d?d.k:'work'); }
var lbTab='plan', lbWeek=-1, lbMenuDay=-1;
function lbSetTab(t){ lbTab=t; renderLB30(); try{ var s=$('screen'), a=$('lb-tabs'); if(s&&a&&a.offsetTop) s.scrollTop=Math.max(0,a.offsetTop-70); }catch(e){} }
/* a ring: pct 0–1, its number and a word in the middle */
function lbRing(pct,size,label,sub){
  var sw=size>80?9:6, r=(size-sw)/2, c=2*Math.PI*r, off=c*(1-Math.max(0,Math.min(1,pct)));
  return '<div class="lbx-ring" style="width:'+size+'px;height:'+size+'px">'+
    '<svg viewBox="0 0 '+size+' '+size+'" width="'+size+'" height="'+size+'" aria-hidden="true">'+
    '<circle cx="'+size/2+'" cy="'+size/2+'" r="'+r+'" stroke-width="'+sw+'" class="bg"/>'+
    '<circle cx="'+size/2+'" cy="'+size/2+'" r="'+r+'" stroke-width="'+sw+'" class="fg" stroke-dasharray="'+c.toFixed(1)+'" stroke-dashoffset="'+off.toFixed(1)+'" transform="rotate(-90 '+size/2+' '+size/2+')"/></svg>'+
    '<div class="in"><b>'+label+'</b>'+(sub?'<span>'+sub+'</span>':'')+'</div></div>';
}
function lbHello(){
  var h=new Date().getHours(), w=h<12?'Selamat pagi':h<15?'Selamat tengah hari':h<19?'Selamat petang':'Selamat malam';
  var n=((HF.data.prefs&&HF.data.prefs.name)||'').trim().split(/\s+/)[0];
  return w+(n?', '+hesc(n):'');
}
function renderLB30(){
  lbLang(true);
  var owned=lbOwned(), done=lbDone(), tot=LB30_DAYS.length, nx=lbNext();
  if(lbWeek<0) lbWeek=lbWeekOf(Math.min(nx,tot-1));
  var pill=!owned ? {icon:'lock',label:'RM'+LB30_PRICE,go:'lbBuy()'}
         : nx<tot ? {icon:'play',label:'Day '+(nx+1),go:'lbOpenDay('+nx+')'} : null;
  var h=pdxBar('program',pill)+
    '<div class="lbx-hero" style="background-image:url(\''+lbImg('hero')+'\')"><div class="lbx-hero-ov"></div>'+
    '<div class="lbx-hero-tx"><img class="lbx-mark" src="/img/brand/hfplus-mark.png" alt="HITFAT+">'+
    '<div class="lbx-name">'+hesc(LB30_NAME)+'</div>'+
    '<div class="lbx-tags"><span>30 days</span><span>20 min a day</span><span>No jumping</span><span>At home</span></div></div></div>';
  h+='<div class="lbx">';
  if(!owned){
    h+='<div class="lbx-card lbx-sell"><div class="lbx-k">For women</div>'+
      '<div class="lbx-h">30 hari bakar lemak, dari rumah anda.</div>'+
      '<div class="lbx-p">Workout tanpa lompat 20 minit sehari, sasaran kalori, menu makanan Malaysia, dan progres anda direkod.</div>'+
      '<button class="lbx-go" onclick="lbBuy()">'+glyph('lock')+'Get the Program · RM'+LB30_PRICE+'</button>'+
      '<button class="lbx-ghost" onclick="openPaywall(\'\')">'+glyph('star')+'Included in HITFAT+</button></div>';
  } else if(nx<tot){
    var d=LB30_DAYS[nx], wi=lbWeekOf(nx);
    h+='<div class="lbx-card lbx-now">'+
      '<div class="lbx-now-top">'+lbRing(done/tot,84,done+'<i>/'+tot+'</i>','days')+
        '<div class="lbx-now-tx"><div class="lbx-hello">'+lbHello()+'</div>'+
        '<div class="lbx-h">Day '+(nx+1)+' · Week '+(wi+1)+'</div>'+
        '<div class="lbx-p">'+LB30_WEEKS[wi].n+'. '+(liveStreak()>1?liveStreak()+'-day streak 🔥':'One day at a time.')+'</div></div></div>'+
      '<div class="lbx-today" onclick="lbOpenDay('+nx+')">'+
        '<div class="lbx-today-ph" style="background-image:url(\''+lbDayImg(nx)+'\')"><span class="lbx-badge">Today</span></div>'+
        '<div class="lbx-today-b"><div class="lbx-k">'+(d.k==='test'?'Check-in & fit test':d.k==='recover'?'Recovery':'Workout')+' · '+lbMinutes(d)+' min · '+d.ex.length+' moves</div>'+
        '<div class="lbx-t">'+d.n+'</div></div></div>'+
      '<button class="lbx-go" onclick="lbOpenDay('+nx+')">'+glyph('play')+(done?'Continue Day '+(nx+1):'Start Day 1')+'</button></div>';
  } else {
    h+='<div class="lbx-card lbx-now lbx-fin">'+lbRing(1,84,'30','days')+
      '<div class="lbx-h">30 days complete</div><div class="lbx-p">Lihat sejauh mana anda sudah pergi.</div>'+
      '<button class="lbx-go" onclick="lbSetTab(\'progress\')">'+glyph('trophy')+'See Your Results</button></div>';
  }
  h+='<div class="lbx-seg" id="lb-tabs">'+[['plan','Plan'],['food','Nutrition'],['learn','Learn'],['progress','Progress'],['guide','Start Here']]
    .map(function(t){ return '<button class="'+(lbTab===t[0]?'on':'')+'" onclick="lbSetTab(\''+t[0]+'\')">'+t[1]+'</button>'; }).join('')+'</div>';
  if(lbTab==='food') h+=lbFood();
  else if(lbTab==='learn') h+=lbLearn();
  else if(lbTab==='progress') h+=lbProgress();
  else if(lbTab==='guide') h+=lbGuide();
  else h+=lbPlan();
  h+='</div>';
  $('pgd-body').innerHTML=h;
}
/* the poster: the photograph when there is one, the name in type until then */
function lbPoster(cls){
  if(LB30_POSTER) return '<div class="'+cls+'"><img src="'+LB30_POSTER+'" alt="'+hesc(LB30_NAME)+'"></div>';
  /* until the poster comes (18 Oct): the ladies' studio photo (lad4) cut out
     on rose, in the look of the covers, with the name beside her */
  var ph='background-image:url(\'/img/p/lad4.jpg\'),linear-gradient(#4A0A36,#4A0A36);background-position:50% 22%;'+
    '-webkit-mask-image:url(\'/img/p/mask/lad4.png\');mask-image:url(\'/img/p/mask/lad4.png\');-webkit-mask-position:50% 22%;mask-position:50% 22%';
  return '<div class="'+cls+' lb-type lb-art"><div class="hpo-fig"><div class="hpo-ph" style="'+ph+'"></div></div>'+
    '<div class="lb-tx"><img class="lb-mark" src="/img/brand/hfplus-mark.png" alt="HITFAT+">'+
    '<div class="lb-name">'+hesc(LB30_NAME)+'</div><div class="lb-sub">30 HARI · DI RUMAH · TANPA LOMPAT</div></div></div>';
}
function lbHero(kicker,sub,meta,pill){
  return pdxBar(kicker,pill)+lbPoster('wl-hero lb-hero'+(kicker==='day'?' day':''))+
    '<div class="wl-hero-tx"><div class="s">'+sub+'</div>'+(meta?'<div class="m">'+meta+'</div>':'')+'</div>';
}

/* ── Plan: today's routine, then the month as day tiles ── */
function lbPlan(){
  var owned=lbOwned(), done=lbDone(), tot=LB30_DAYS.length, nx=lbNext(), h='';
  if(owned && nx<tot) h+=lbChecklist();
  var w=LB30_WEEKS[lbWeek]||LB30_WEEKS[0];
  h+='<div class="lbx-sec"><div class="lbx-sh"><div class="lbx-st">Your 30 Days</div><div class="lbx-ss">'+done+' of '+tot+' days done</div></div></div>';
  h+='<div class="lbx-dots">'+LB30_DAYS.map(function(d,i){ return '<i class="'+(i<done?'d':i===nx&&owned?'n':'')+(LB30_WEEKS.some(function(x){ return x.from===i+1&&i>0; })?' gap':'')+'"></i>'; }).join('')+'</div>';
  h+='<div class="lbx-weeks">'+LB30_WEEKS.map(function(x,i){
    var all=done>=x.to;
    return '<button class="'+(i===lbWeek?'on':'')+'" onclick="lbWeek='+i+';renderLB30()"><small>Week '+(i+1)+'</small><b>'+(all?'✓ ':'')+x.n+'</b></button>'; }).join('')+'</div>';
  h+='<div class="lbx-wcover" style="background-image:url(\''+LB30_WEEK_IMG[lbWeek]+'\')"><div><small>Week '+(lbWeek+1)+' · Days '+w.from+'–'+w.to+'</small><b>'+w.n+'</b><span>'+w.s+'</span></div></div>';
  if(LB30_SETH.weeks[lbWeek]) h+=lbVideoCard(LB30_SETH.weeks[lbWeek],'Week '+(lbWeek+1)+' intro with Coach Seth');
  h+='<div class="lbx-days">'+LB30_DAYS.slice(w.from-1,w.to).map(function(d,j){
    var gi=w.from-1+j, isDone=gi<done, now=gi===nx&&owned;
    return '<div class="lbx-day'+(isDone?' done':'')+(now?' now':'')+' k-'+d.k+'" onclick="lbOpenDay('+gi+')">'+
      '<div class="lbx-day-n"><small>DAY</small><b>'+(gi+1)+'</b>'+(isDone?'<span class="ck">'+glyph('check')+'</span>':'')+'</div>'+
      '<div class="lbx-day-t">'+d.n+'</div>'+
      '<div class="lbx-day-m">'+(d.k==='test'?'Check-in':d.k==='recover'?'Recovery · '+lbMinutes(d)+' min':lbMinutes(d)+' min')+'</div>'+
      (now?'<span class="lbx-day-now">Today</span>':'')+'</div>';
  }).join('')+'</div>';
  return h;
}

/* today's routine: the steps and the water as two tiles that fill, the
   day's nutrition mission written out, and the rest as ticks */
function lbChecklist(){
  var lb=lbData(), t=iso(0), gi=Math.min(lbNext(),LB30_DAYS.length-1);
  var c=lb.check[t]||{}, trained=doneToday();
  var stepT=LB30_STEPS[gi], st=+lb.steps[t]||0, waterT=lbWater(gi), wt=+lb.water[t]||0;
  var stepOk=st>=stepT, waterOk=wt>=waterT-0.001;
  var n=(trained?1:0)+(stepOk?1:0)+(waterOk?1:0);
  LB30_CHECKS.forEach(function(x){ if(c[x[0]]) n++; });
  var total=3+LB30_CHECKS.length;
  var tile=function(on,icon,title,val,goal,pct,minus,plus,lm,lp,go){
    return '<div class="lbx-tile'+(on?' on':'')+'"'+(go?' onclick="'+go+'"':'')+'>'+
      '<div class="lbx-tile-h"><span class="ic">'+glyph(icon)+'</span><span>'+title+'</span>'+(on?'<span class="ok">'+glyph('check')+'</span>':'')+'</div>'+
      '<div class="lbx-tile-v"><b>'+val+'</b><span>/ '+goal+'</span></div>'+
      '<div class="lbx-tile-bar"><i style="width:'+Math.round(Math.min(1,pct)*100)+'%"></i></div>'+
      '<div class="lbx-tile-c" onclick="event.stopPropagation()"><button onclick="'+minus+'" aria-label="'+lm+'">−</button><button onclick="'+plus+'" aria-label="'+lp+'">+</button></div></div>';
  };
  var d=LB30_DAYS[gi];
  var h='<div class="lbx-sec"><div class="lbx-sh"><div class="lbx-st">Today&rsquo;s Checklist</div><div class="lbx-ss">'+n+' of '+total+' done</div></div>'+
    lbRing(n/total,44,n,'')+'</div>';
  h+='<div class="lbx-row'+(trained?' on':'')+'" onclick="lbOpenDay('+gi+')"><span class="b">'+(trained?glyph('check'):glyph('play'))+'</span>'+
     '<div class="tx"><div class="t">Workout · '+d.n+'</div><div class="m">'+lbMinutes(d)+' min · no jumping</div></div><span class="pdx-chev">›</span></div>';
  h+='<div class="lbx-tiles">'+
    tile(stepOk,'steps','Steps',st.toLocaleString(),stepT.toLocaleString(),st/stepT,'lbSteps(-500)','lbSteps(500)','500 fewer steps','500 more steps','lbSteps(\'goal\')')+
    tile(waterOk,'bottle','Water',wt.toFixed(2).replace(/0$/,'')+' L',waterT.toFixed(1)+' L',wt/waterT,'lbWaterAdd(-0.25)','lbWaterAdd(0.25)','250 ml less','250 ml more','')+'</div>';
  h+='<div class="lbx-misi'+(c.misi?' on':'')+'" onclick="lbTick(\'misi\')"><span class="b">'+(c.misi?glyph('check'):'')+'</span>'+
     '<div><div class="k">Nutrition mission · Day '+(gi+1)+'</div><div class="t">'+LB30_MISI[gi]+'</div></div></div>';
  h+='<div class="lbx-ticks">'+
     '<button class="'+(c.makan?'on':'')+'" onclick="lbTick(\'makan\')"><span class="b">'+(c.makan?glyph('check'):'')+'</span>Ate to plan</button>'+
     '<button class="'+(c.tidur?'on':'')+'" onclick="lbTick(\'tidur\')"><span class="b">'+(c.tidur?glyph('check'):'')+'</span>Slept 7 hours</button></div>';
  return h;
}
function lbTick(k){ var d=lbData(), t=iso(0); d.check[t]=d.check[t]||{}; d.check[t][k]=!d.check[t][k]; HF.save(); renderLB30(); }
function lbSteps(n){
  var d=lbData(), t=iso(0), gi=Math.min(lbNext(),LB30_DAYS.length-1);
  d.steps[t]= n==='goal' ? (((+d.steps[t]||0)>=LB30_STEPS[gi]) ? 0 : LB30_STEPS[gi]) : Math.max(0,(+d.steps[t]||0)+n);
  HF.save(); renderLB30();
}
function lbWaterAdd(n){ var d=lbData(), t=iso(0); d.water[t]=Math.max(0,Math.round(((+d.water[t]||0)+n)*100)/100); HF.save(); renderLB30(); }

/* ── a video slot: Coach Seth, or "coming" until it is filmed ── */
function lbVimeo(v){ var x=lbVid(v); return 'https://player.vimeo.com/video/'+x.v+'?'+(x.h?'h='+x.h+'&':'')+'title=0&byline=0&portrait=0&dnt=1&playsinline=1'; }
function lbVideoCard(v,title){
  if(!v) return '<div class="lb-vid soon">'+glyph('play')+'<div><div class="k">Video Coach Seth</div><div class="t">'+title+'</div><div class="s">Video akan datang</div></div></div>';
  return '<div class="lb-vid"><div class="lb-frame"><iframe src="'+lbVimeo(v)+'" allow="fullscreen; picture-in-picture" allowfullscreen title="'+hesc(title)+'"></iframe></div>'+
    '<div class="t">'+title+'</div></div>';
}

/* ── a day: the photograph, what it is, one big button, the moves ── */
function lbOpenDay(gi){
  var d=LB30_DAYS[gi]; if(!d) return;
  var owned=lbOwned(), exs=lbExercises(d), lb=lbData();
  curProg=LB30; curDay={p:LB30, day:LB30.weeks[lbWeekOf(gi)].days[gi-LB30_WEEKS[lbWeekOf(gi)].from+1], gi:gi};
  var wi=lbWeekOf(gi), done=gi<lbDone();
  var h=pdxBar('day', owned?{icon:'play',label:'Start',go:'lbPlay('+gi+')'}:{icon:'lock',label:'RM'+LB30_PRICE,go:'lbBuy()'})+
    '<div class="lbx-hero day" style="background-image:url(\''+lbDayImg(gi)+'\')"><div class="lbx-hero-ov"></div>'+
    '<div class="lbx-hero-tx"><div class="lbx-kick">Day '+(gi+1)+' of 30 · Week '+(wi+1)+': '+LB30_WEEKS[wi].n+(done?' · ✓ Done':'')+'</div>'+
    '<div class="lbx-name">'+d.n+'</div></div></div>';
  h+='<div class="lbx">';
  h+='<div class="lbx-facts">'+[[lbMinutes(d)+'','minutes'],[exs.length+'','moves'],[d.r+'','rounds'],['0','jumps']]
    .map(function(x){ return '<div><b>'+x[0]+'</b><span>'+x[1]+'</span></div>'; }).join('')+'</div>';
  var isCheck=LB30_CHECKINS.indexOf(gi+1)>=0;
  if(!owned){
    h+='<button class="lbx-go" onclick="lbBuy()">'+glyph('lock')+'Unlock · RM'+LB30_PRICE+'</button>';
  } else if(d.k==='test'){
    /* day 1 and day 30: the body first, then the fit test, which may be skipped */
    h+='<div class="lbx-card lbx-steps"><div class="lbx-step"><span class="n">1</span><div class="tx"><div class="t">Body Check-in</div>'+
       '<div class="s">Berat, pinggang dan pinggul — pagi, sebelum sarapan. Gambar jika anda mahu.</div></div></div>'+
       lbBodyForm(gi+1)+
       '<div class="lbx-step"><span class="n">2</span><div class="tx"><div class="t">Low-Impact Fit Test</div>'+
       '<div class="s">Lima gerakan, satu pusingan, tanpa lompat. Kira ulangan setiap satu — untuk plank, saat anda tahan.</div></div></div></div>'+
       '<button class="lbx-go" onclick="lbPlay('+gi+')">'+glyph('play')+'Start Fit Test</button>'+
       '<button class="lbx-ghost" onclick="lbSkipTest('+gi+')">Skip the fit test, mark the day done</button>'+
       lbFitForm(gi===0?'d1':'d30');
  } else {
    if(isCheck) h+='<div class="lbx-card lbx-steps"><div class="lbx-step"><span class="n">'+glyph('flag')+'</span><div class="tx"><div class="t">Body Check-in · Day '+(gi+1)+'</div>'+
       '<div class="s">Rekod sebelum latihan: pagi, sebelum sarapan.</div></div></div>'+lbBodyForm(gi+1)+'</div>';
    var hv=lbHalves(d), parts=lb.half[gi]||{}, split=!!lb.split && d.k!=='recover';
    if(d.k!=='recover') h+='<div class="lbx-split" role="radiogroup" aria-label="How to do it">'+
       '<button class="'+(split?'':'on')+'" role="radio" aria-checked="'+(split?'false':'true')+'" onclick="'+(split?'lbToggleSplit('+gi+')':'')+'">All at once<small>'+lbMinutes(d)+' min</small></button>'+
       '<button class="'+(split?'on':'')+'" role="radio" aria-checked="'+(split?'true':'false')+'" onclick="'+(split?'':'lbToggleSplit('+gi+')')+'">2 × 10 min<small>morning & evening</small></button></div>';
    if(split){
      h+='<button class="lbx-go'+(parts.a?' sec':'')+'" onclick="lbPlay('+gi+',\'a\')">'+glyph(parts.a?'check':'sun')+'Morning · '+Math.round(lbSecs(hv[0],d.r)/60)+' min</button>'+
        '<button class="lbx-go'+(parts.b?' sec':'')+'" onclick="lbPlay('+gi+',\'b\')">'+glyph(parts.b?'check':'moon')+'Evening · '+Math.round(lbSecs(hv[1],d.r)/60)+' min</button>';
    } else {
      h+='<button class="lbx-go" onclick="lbPlay('+gi+')">'+glyph('play')+'Start Workout</button>'+
         '<button class="lbx-ghost" onclick="lbComplete('+gi+')">'+glyph('check')+'Mark done without playing</button>';
    }
  }
  h+='<div class="lbx-note"><div class="q">“</div><div><div class="k">Coach&rsquo;s note</div><div class="t">'+LB30_TIPS[gi]+'</div></div></div>';
  if(d.k==='recover') h+='<div class="lbx-note leaf"><div class="q">'+glyph('leaf')+'</div><div><div class="k">Recovery day</div>'+
    '<div class="t">Bergerak perlahan dan bernafas. Hari ini badan anda menjadi lebih kuat.</div></div></div>';
  h+='<div class="lbx-sec"><div class="lbx-sh"><div class="lbx-st">In This Workout</div><div class="lbx-ss">Tap a move to watch it.</div></div></div>'+
    '<div class="lbx-moves">'+exs.map(function(e,i){
      return '<div class="lbx-move" onclick="'+(owned?'lbPlayOne(\''+e.n.replace(/'/g,"\\'")+'\')':'lbBuy()')+'">'+
      '<span class="n">'+(i+1)+'</span><div class="tx"><div class="t">'+e.n+'</div><div class="m">'+e.dur+' sec · '+(e.m||'Full body')+' · no jumping</div></div>'+
      '<span class="pl">'+glyph(owned?'play':'lock')+'</span></div>'; }).join('')+'</div>';
  h+='<div class="lbx-need"><span>'+glyph('mat')+'</span>You need: a mat or towel'+(d.ex.join(' ').indexOf('Wall')>=0?', a wall':'')+'</div>';
  h+='</div>';
  $('dd-body').innerHTML=h;
  hidePanels(); $('daydetail').style.display='block'; $('screen').scrollTop=0;
  lbLang(true);
}
function lbToggleSplit(gi){ var lb=lbData(); lb.split=!lb.split; HF.save(); lbOpenDay(gi); }

/* play a day, or half of it; the player hands back to lbAfterSession */
function lbPlay(gi,half){
  var d=LB30_DAYS[gi]; if(!d) return;
  if(!lbOwned()) return lbBuy();
  var exs=half ? lbHalves(d)[half==='a'?0:1] : lbExercises(d);
  var meta={rounds:d.r, name:d.n, lb:{gi:gi, half:half||''}, key:LB30_KEY+'-d'+gi+(half?'-'+half:'')};
  /* the day counts when it is all done: whole, or the second of its halves */
  var other=half ? lbData().half[gi] : null;
  if(!half || (other && other[half==='a'?'b':'a'])){ meta.pid=LB30_ID; meta.gi=gi; }
  startWorkout(exs, meta);
}
function lbPlayOne(name){
  if(!lbOwned()) return lbBuy();
  startWorkout([lbEx(name)],{rounds:1, name:name, lb:{gi:-1}});
}
/* back from the player: note the half, then the day it came from */
function lbAfterSession(m){
  if(m.gi<0) return lbOpenDay(curDay?curDay.gi:lbNext());
  var key=LB30_KEY+'-d'+m.gi+(m.half?'-'+m.half:'');
  if(m.half && HF.data.sessions[key]){
    var lb=lbData(); lb.half[m.gi]=lb.half[m.gi]||{}; lb.half[m.gi][m.half]=true;
    if(lb.half[m.gi].a && lb.half[m.gi].b && progDone(LB30_ID)===m.gi){ HF.data.progress[LB30_ID]=m.gi+1; }
    HF.save();
  }
  if(progDone(LB30_ID)>m.gi){ hidePanels(); $('progdetail').style.display='block'; lbTab='plan'; renderLB30(); $('screen').scrollTop=0; }
  else lbOpenDay(m.gi);
}
function lbComplete(gi){
  HF.markDone(LB30_KEY+'-d'+gi,{name:LB30_DAYS[gi].n, mins:lbMinutes(LB30_DAYS[gi])});
  if(progDone(LB30_ID)===gi){ HF.data.progress[LB30_ID]=gi+1; }
  HF.save(); toast('Day done 🔥');
  hidePanels(); $('progdetail').style.display='block'; renderLB30(); $('screen').scrollTop=0;
}
function lbSkipTest(gi){ lbComplete(gi); }

/* ── the body: weight, waist and hip on days 1, 15 and 30 ── */
var LB30_BODY=[['kg','Weight','kg'],['waist','Waist','cm'],['hip','Hips','cm']];
function lbBodyForm(n){
  var b=lbData().body[n]||{}, src=lbPhoto(n);
  return '<div class="lb-body"><div class="esfields">'+LB30_BODY.map(function(m){
      return '<label class="esf"><span>'+m[1]+'</span><input class="inp" inputmode="decimal" placeholder="0" aria-label="'+m[1]+' day '+n+'" value="'+(b[m[0]]||'')+'" '+
        'onchange="lbSetBody('+n+',\''+m[0]+'\',this.value)"><em>'+m[2]+'</em></label>'; }).join('')+'</div>'+
    '<label class="wl-ph lb-ph'+(src?' has':'')+'"'+(src?' style="background-image:url(\''+src+'\')"':'')+'>'+
      '<input type="file" accept="image/*" onchange="lbAddPhoto('+n+',this)">'+(src?'':ic('photo'))+'<span>Photo · Day '+n+'</span></label>'+
    '<div class="lb-fine">Gambar disimpan dalam telefon ini sahaja.</div></div>';
}
function lbFitForm(when){
  var f=lbData().fit[when]||{};
  return fsec('Fit Test Results',when==='d1'?'Day 1':'Day 30')+'<div class="esfields">'+LB30_FIT.map(function(x){
    return '<label class="esf"><span>'+x[1]+'</span><input class="inp" inputmode="numeric" placeholder="0" aria-label="'+x[1]+'" value="'+(f[x[0]]||'')+'" '+
      'onchange="lbSetFit(\''+when+'\',\''+x[0]+'\',this.value)"><em>'+x[2]+'</em></label>'; }).join('')+'</div>';
}
function lbSetBody(n,k,v){ var w=lbData(); w.body[n]=w.body[n]||{}; w.body[n][k]=parseFloat(v)||0; HF.save(); }
function lbSetFit(when,k,v){ var w=lbData(); w.fit[when]=w.fit[when]||{}; w.fit[when][k]=parseInt(v,10)||0; HF.save(); }
function lbPhotoKey(n){ return 'hf_lb30_photo_'+(HF.userId||'me')+'_'+n; }
function lbPhoto(n){ try{ return localStorage.getItem(lbPhotoKey(n))||''; }catch(e){ return ''; } }
function lbAddPhoto(n,input){
  var f=input&&input.files&&input.files[0]; if(!f) return;
  var r=new FileReader();
  r.onload=function(){ var im=new Image(); im.onload=function(){
    var s=Math.min(1,640/Math.max(im.width,im.height)), c=document.createElement('canvas');
    c.width=Math.round(im.width*s); c.height=Math.round(im.height*s);
    c.getContext('2d').drawImage(im,0,0,c.width,c.height);
    try{ localStorage.setItem(lbPhotoKey(n), c.toDataURL('image/jpeg',0.72)); toast('Gambar disimpan'); }
    catch(e){ toast('Ruang telefon tidak cukup untuk gambar'); }
    if($('daydetail') && $('daydetail').style.display==='block' && curDay) lbOpenDay(curDay.gi); else renderLB30();
  }; im.src=r.result; };
  r.readAsDataURL(f);
}

/* ── nutrition: BURN30's calorie sum, never under 1,200, and Malay menus ── */
function lbProfile(){
  var n=HF.data.nutrition||{}, pr=lbData().profile||{};
  return {age:pr.age||n.a||0, wt:pr.wt||n.w||0, ht:pr.ht||n.h||0};
}
function lbTarget(){
  var pr=lbProfile(); if(!pr.wt||!pr.ht||!pr.age) return null;
  var n=mpNut({goal:'loss', rate:0.5, gender:'female', age:pr.age, wt:pr.wt, ht:pr.ht, activity:1.375, styles:['hiprotein']});
  var cal=Math.max(1200, n.cal);
  return {cal:cal, prot:n.prot, carb:n.carb, fat:n.fat};
}
function lbSaveProfile(){
  var g=function(x){ return parseFloat(($(x)||{}).value); };
  var wt=g('lb-wt'), ht=g('lb-ht'), age=parseInt(($('lb-age')||{}).value,10);
  if(!wt||!ht||!age){ toast('Isi berat, tinggi dan umur'); return; }
  lbData().profile={wt:wt, ht:ht, age:age}; HF.save(); renderLB30();
}
function lbForgetNumbers(){ lbData().profile={}; HF.save(); renderLB30(); }
/* the three options a meal shows on a day: different every day, never twice */
function lbMenuFor(slot,day){
  var opts=LB30_MENU[slot].opts, n=opts.length, out=[], k;
  /* three in a row from day×3, so one day's dishes don't come back the next */
  for(k=0;k<3;k++) out.push(opts[(day*3+k)%n]);
  return out;
}
/* Learn (25 Oct 2026, Seth): the Nutrition Academy, all of it, inside her
   program; Ladies Burn 30 opens every episode (acLadies, academy.js) */
function lbLearn(){
  if(typeof academyHTML!=='function') return '';
  if(!lbOwned()) return lbLocked('book','Nutrition Academy','Episod video pendek tentang makan untuk turun lemak, cara Malaysia, setiap satu dengan kuiz 3 soalan.');
  return '<div class="lbx-acad">'+academyHTML()+'</div>';
}
/* her meal scans (25 Oct 2026): 10 free in her first 30 days, then Scan 6,
   six a day for 30 days at RM14.90, the plan that covers a whole program */
function lbScanCard(){
  if(typeof scanAccess!=='function') return '';
  var a=scanAccess(), has=a.left>0;
  var head=a.mode==='pass' ? a.left+' of '+a.daily+' scans left today' : a.label;
  var tx='<div class="lbx-scan-tx"><div class="lbx-k">Meal scan</div><div class="t">Ambil gambar hidangan, dapat kalori serta-merta.</div>'+
    '<div class="s">'+head+'</div></div>';
  if(has) return '<div class="lbx-scan">'+tx+'<button class="lbx-go" onclick="openScan()">'+glyph('photo')+'Scan a Meal</button></div>';
  return '<div class="lbx-scan">'+tx+'<button class="lbx-go" onclick="startCheckout(\'scan_d6\')">'+glyph('photo')+'Get Scan 6 · RM14.90</button>'+
    '<div class="lbx-scan-fine">6 scan sehari selama 30 hari: sarapan, makan tengah hari, makan malam dan snek.</div></div>';
}
/* ── the shopping list (25 Oct 2026, Seth): a week's menu (option 1 of each
   meal) turned into what to buy, grouped as a market is, ticked off in the
   shop and sent on WhatsApp ── */
var LB30_SHOP_ING=[['nasi lemak','Beras & santan'],['nasi perang','Beras perang'],['nasi','Beras'],['bubur','Beras'],
  ['roti canai','Roti canai (beku)'],['roti','Roti mil penuh'],['oat','Oat'],['mi ','Mi kuning'],['mi kuning','Mi kuning'],['bihun','Bihun'],['ubi','Ubi kayu'],['tosai','Tepung tosai'],['lempeng','Tepung & pisang'],
  ['ayam','Ayam'],['ikan','Ikan'],['telur','Telur'],['daging','Daging'],['sotong','Sotong'],['udang','Udang'],['tauhu','Tauhu'],['tempe','Tempe'],
  ['kangkung','Kangkung'],['sawi','Sawi'],['bayam','Bayam'],['kailan','Kailan'],['kobis','Kobis'],['taugeh','Taugeh'],['kacang panjang','Kacang panjang'],['buncis','Kacang buncis'],
  ['timun','Timun'],['tomato','Tomato'],['ulam','Ulam'],['sayur','Sayur campur'],['pisang','Pisang'],['halia','Halia'],
  ['susu','Susu rendah lemak'],['dal','Kacang dal'],['sambal','Cili & belacan'],['santan','Santan'],['kicap','Kicap'],['teh','Teh'],['kopi','Kopi']];
var LB30_SHOP_CAT=[['Protein','food','#E30613',['Ayam','Ikan','Telur','Daging','Sotong','Udang','Tauhu','Tempe']],
  ['Karbohidrat','workout','#E08A00',['Beras','Beras perang','Beras & santan','Roti mil penuh','Roti canai (beku)','Oat','Mi kuning','Bihun','Ubi kayu','Tepung tosai','Tepung & pisang']],
  ['Sayur & Buah','leaf','#1F9D6A',['Kangkung','Sawi','Bayam','Kailan','Kobis','Taugeh','Kacang panjang','Kacang buncis','Timun','Tomato','Ulam','Sayur campur','Pisang','Halia']]];
var lbShopWeek=-1;
function lbShopItems(wi){
  var w=LB30_WEEKS[wi], n={}, d, si, it, k, low;
  for(d=w.from-1; d<w.to; d++) for(si=0; si<LB30_SLOTS.length; si++){
    lbMenuFor(LB30_SLOTS[si],d)[0].it.forEach(function(x){
      low=' '+String(x).toLowerCase()+' ';
      for(k=0;k<LB30_SHOP_ING.length;k++) if(low.indexOf(LB30_SHOP_ING[k][0])>=0){ it=LB30_SHOP_ING[k][1]; n[it]=(n[it]||0)+1; break; }
    });
  }
  return n;
}
function lbShopTick(wi,name){ var sh=lbData().shop, k='w'+wi; sh[k]=sh[k]||{}; sh[k][name]=!sh[k][name]; HF.save(); renderLB30(); }
function lbShopText(wi){
  var n=lbShopItems(wi), t='Senarai belanja Ladies Burn 30 · Week '+(wi+1)+'\n';
  LB30_SHOP_CAT.concat([['Lain-lain']]).forEach(function(c,ci){
    var names=Object.keys(n).filter(function(x){ return ci<LB30_SHOP_CAT.length ? c[3].indexOf(x)>=0 : !LB30_SHOP_CAT.some(function(cc){ return cc[3].indexOf(x)>=0; }); });
    if(names.length) t+='\n'+c[0]+':\n'+names.map(function(x){ return '• '+x; }).join('\n')+'\n';
  });
  return t;
}
function lbShopping(){
  if(lbShopWeek<0) lbShopWeek=lbWeekOf(Math.min(lbNext(),LB30_DAYS.length-1));
  var wi=lbShopWeek, n=lbShopItems(wi), got=(lbData().shop['w'+wi])||{}, all=Object.keys(n).sort(function(a,b){ return n[b]-n[a]; }), have=all.filter(function(x){ return got[x]; }).length;
  var h='<div class="lbx-sec"><div class="lbx-sh"><div class="lbx-st">Shopping List</div><div class="lbx-ss">Untuk menu seminggu (pilihan 1). Tanda bila dah beli.</div></div></div>';
  h+='<div class="lbx-card lbx-shop"><div class="lbx-shop-w">'+LB30_WEEKS.map(function(x,i){ return '<button class="'+(i===wi?'on':'')+'" onclick="lbShopWeek='+i+';renderLB30()">Week '+(i+1)+'</button>'; }).join('')+'</div>'+
    '<div class="lbx-shop-p"><div class="bar"><i style="width:'+(all.length?Math.round(have/all.length*100):0)+'%"></i></div><span>'+have+' / '+all.length+' dibeli</span></div>';
  LB30_SHOP_CAT.concat([['Lain-lain','bag','#6B6B6B']]).forEach(function(c,ci){
    var names=all.filter(function(x){ return ci<LB30_SHOP_CAT.length ? c[3].indexOf(x)>=0 : !LB30_SHOP_CAT.some(function(cc){ return cc[3].indexOf(x)>=0; }); });
    if(!names.length) return;
    h+='<div class="lbx-shop-c" style="--mc:'+c[2]+'"><div class="h"><span class="ic">'+glyph(c[1])+'</span><b>'+c[0]+'</b><span>'+names.length+'</span></div>'+
      names.map(function(x){ var on=!!got[x]; return '<button class="lbx-shop-i'+(on?' on':'')+'" onclick="lbShopTick('+wi+',\''+x.replace(/'/g,"\\'")+'\')"><span class="b">'+(on?glyph('check'):'')+'</span><span class="n">'+x+'</span><span class="q">'+n[x]+'× hidangan</span></button>'; }).join('')+'</div>';
  });
  h+='<a class="lbx-ghost lbx-shop-wa" href="https://wa.me/?text='+encodeURIComponent(lbShopText(wi))+'" target="_blank" rel="noopener">'+glyph('share')+'Hantar senarai ke WhatsApp</a></div>';
  return h;
}
/* the healthy plate: half veg, a quarter protein, a quarter carbs */
function lbPlateSVG(){
  return '<svg class="lbx-plate-svg" viewBox="0 0 120 120" aria-hidden="true">'+
    '<circle cx="60" cy="60" r="58" fill="#fff" stroke="rgba(0,0,0,.08)" stroke-width="2"/>'+
    '<circle cx="60" cy="60" r="50" fill="#F3EFEA"/>'+
    '<path d="M60 60 L60 12 A48 48 0 0 0 60 108 Z" fill="#1F9D6A"/>'+
    '<path d="M60 60 L60 12 A48 48 0 0 1 108 60 Z" fill="#E30613"/>'+
    '<path d="M60 60 L108 60 A48 48 0 0 1 60 108 Z" fill="#E08A00"/>'+
    '<circle cx="104" cy="22" r="8" fill="#C9A227" stroke="#fff" stroke-width="2"/>'+
    '<line x1="60" y1="12" x2="60" y2="108" stroke="#fff" stroke-width="2.5"/><line x1="60" y1="60" x2="108" y2="60" stroke="#fff" stroke-width="2.5"/></svg>';
}

/* each dish's photograph (25 Oct 2026): made with ChatGPT in one style, in
   menu order, breakfast 1-10, lunch 11-20, dinner 21-30 (ladies/img/menu) */
function lbDishImg(slot,o){
  var n=LB30_SLOTS.indexOf(slot)*10+LB30_MENU[slot].opts.indexOf(o)+1;
  return '/ladies/img/menu/d'+(n<10?'0':'')+n+'.jpg';
}
function lbFood(){
  if(!lbOwned()) return lbLocked('food','Calorie target & 30-day menu',
    'Sasaran harian dari berat, tinggi dan umur anda — sarapan, bekal tengah hari dan makan malam keluarga, '+
    'masakan Melayu, tiga pilihan setiap waktu makan, dan satu misi pemakanan setiap hari.');
  var t=lbTarget(), h='';
  if(!t){
    var pr=lbProfile();
    var fld=function(id,l,u,v,m){ return '<label class="esf"><span>'+l+'</span><input class="inp" id="'+id+'" inputmode="'+m+'" placeholder="0" value="'+(v||'')+'"><em>'+u+'</em></label>'; };
    return fsec('Your Calorie Target','Tiga nombor, dan ia dikira sendiri.')+
      '<div class="esfields">'+fld('lb-wt','Weight','kg',pr.wt,'decimal')+fld('lb-ht','Height','cm',pr.ht,'decimal')+fld('lb-age','Age','yrs',pr.age,'numeric')+'</div>'+
      '<button class="bigbtn esave lb-btn" onclick="lbSaveProfile()">Work Out My Target</button>';
  }
  var tot=LB30_DAYS.length;
  if(lbMenuDay<0) lbMenuDay=Math.min(lbNext(),tot-1);
  h+='<div class="lbx-foodph" style="background-image:url(\''+lbImg('food')+'\')"><div><b>Makan biasa, sukatan yang betul.</b><span>Nasi dan lauk yang anda kenal — tiga pilihan setiap waktu makan.</span></div></div>';
  h+='<div class="nstage wl-stage lb-stage"><span class="wl-st-gly">'+glyph('flame')+'</span><div class="nstage-k">Your daily target</div>'+
    '<div class="nstage-n">'+t.cal.toLocaleString()+'<span> kcal</span></div>'+
    '<div class="nstage-s">Lebih kurang 0.5 kg seminggu · tidak pernah bawah 1,200 kcal</div>'+
    '<div class="nstage-g">'+[[t.prot+'g','Protein'],[t.carb+'g','Carbs'],[t.fat+'g','Fat'],[lbWater(lbMenuDay).toFixed(1)+' L','Water']]
      .map(function(x){ return '<div><b>'+x[0]+'</b><span>'+x[1]+'</span></div>'; }).join('')+'</div></div>';
  h+='<div class="lbx-misi"><span class="b">'+glyph('target')+'</span><div><div class="k">Nutrition mission · Day '+(lbMenuDay+1)+'</div><div class="t">'+LB30_MISI[lbMenuDay]+'</div></div></div>';
  h+=lbScanCard();
  /* the menu: a day, three meals, three options each */
  h+='<div class="lbx-sec"><div class="lbx-sh"><div class="lbx-st">Today&rsquo;s Menu</div><div class="lbx-ss">Day '+(lbMenuDay+1)+' · tiga pilihan untuk setiap waktu makan</div></div></div>';
  h+='<div class="hscroll wl-mdays lbx-mdays">'+LB30_DAYS.map(function(d,i){
    return '<button class="wl-md'+(i===lbMenuDay?' on':'')+'" onclick="lbMenuDay='+i+';renderLB30()"><small>Day</small><b>'+(i+1)+'</b></button>'; }).join('')+'</div>';
  var slotLook={sarapan:['sunrise','#E08A00'],tengahari:['sun','#E30613'],malam:['moon','#5B4BC4']};
  h+='<div class="lbx-meals">'+LB30_SLOTS.map(function(slot,si){
    var s=LB30_MENU[slot], opts=lbMenuFor(slot,lbMenuDay), sid='lbm-'+lbMenuDay+'-'+si, lk=slotLook[slot]||['food','#E30613'];
    return '<div class="mpslot lbx-meal" id="'+sid+'" style="--mc:'+lk[1]+'"><div class="mpslot-h"><span class="ic">'+glyph(lk[0])+'</span>'+
      '<div class="hd"><div class="t">'+s.label+'</div><div class="m">'+s.time+' · ~'+Math.round(t.cal*s.share)+' kcal</div></div>'+
      '<div class="mpopts">'+opts.map(function(o,oi){ return '<button class="mpo'+(oi===0?' on':'')+'" aria-label="Option '+(oi+1)+'" onclick="mpOpt(\''+sid+'\','+oi+')">'+(oi+1)+'</button>'; }).join('')+'</div></div>'+
      opts.map(function(o,oi){ return '<div class="mpopt" style="display:'+(oi===0?'block':'none')+';">'+
        '<div class="lbx-dish" style="background-image:url(\''+lbDishImg(slot,o)+'\')"></div>'+
        '<div class="mpopt-h"><div class="t">'+o.n+'</div><div class="k">'+o.k+' kcal</div></div>'+
        '<div class="lbx-items">'+o.it.map(function(it){ return '<span>'+it+'</span>'; }).join('')+'</div>'+
      '</div>'; }).join('')+'<div class="lbx-meal-n">'+s.note+'</div></div>';
  }).join('')+'</div>';
  h+=lbShopping();
  /* the healthy plate, then the hands */
  h+='<div class="lbx-sec"><div class="lbx-sh"><div class="lbx-st">Pinggan Sihat</div><div class="lbx-ss">Bentuk pinggan setiap kali makan. Tak perlu penimbang.</div></div></div>';
  h+='<div class="lbx-card lbx-plate">'+lbPlateSVG()+'<div class="lbx-plate-k">'+
    [['#1F9D6A','Sayur','½ pinggan · 2 genggam'],['#E30613','Protein','¼ pinggan · 1 tapak tangan'],['#E08A00','Karbo','¼ pinggan · 1 genggam'],['#C9A227','Lemak','1 ibu jari']]
    .map(function(x){ return '<div><i style="background:'+x[0]+'"></i><b>'+x[1]+'</b><span>'+x[2]+'</span></div>'; }).join('')+'</div></div>';
  h+='<div class="lbx-por">'+[['food','Protein','1','palm','tapak tangan','ayam, ikan, telur, tauhu, tempe','#E30613'],
      ['workout','Carbs','1','fist','genggam','nasi, mi, roti','#E08A00'],
      ['leaf','Veg','2','fists','genggam','separuh pinggan','#1F9D6A'],
      ['water','Fat','1','thumb','ibu jari','minyak, santan, kuah','#B7791F']]
    .map(function(x){ return '<div class="lbx-po" style="--pc:'+x[6]+'"><div class="lbx-po-top"><span class="ic">'+glyph(x[0])+'</span><span class="k">'+x[1]+'</span></div>'+
      '<div class="lbx-po-n"><b>'+x[2]+'</b><span>'+x[4]+'</span></div><div class="lbx-po-s">'+x[5]+'</div></div>'; }).join('')+'</div>';
  h+='<div class="lbx-sec"><div class="lbx-sh"><div class="lbx-st">Smart Swaps</div><div class="lbx-ss">Tukar satu, rasa bezanya.</div></div></div>';
  h+='<div class="lbx-swaps">'+[['Teh tarik','Teh o kosong','Perubahan tunggal paling besar untuk kebanyakan orang.'],
    ['Ayam goreng','Ayam panggang','Ayam yang sama, minyak jauh kurang.'],
    ['Mi goreng','Mi sup','Versi sup, setiap kali boleh.'],
    ['Kuih selepas makan','Buah','Sama-sama manis, buah buat kenyang.'],
    ['Tambah kali kedua','Segelas air','Tunggu 10 minit. Rasa kenyang sampai lewat.']]
    .map(function(x){ return '<div class="lbx-sw"><div class="lbx-sw-r"><span class="from">'+x[0]+'</span><span class="arr">→</span><span class="to">'+x[1]+'</span></div><div class="lbx-sw-s">'+x[2]+'</div></div>'; }).join('')+'</div>';
  /* eating out, the places she actually goes */
  h+='<div class="lbx-sec"><div class="lbx-sh"><div class="lbx-st">Makan Di Luar</div><div class="lbx-ss">Apa nak order, bila tak masak.</div></div></div>';
  h+='<div class="lbx-out">'+[
    ['people','#7C3AED','Mamak',['Roti canai kosong + kuah dal','Nasi kandar: ayam bakar, sayur, kuah sikit','Teh o kosong atau teh tarik kurang manis']],
    ['star','#DB2777','Kenduri & Raya',['Ambil sayur dulu, kemudian lauk','Nasi separuh pinggan','Pilih lauk tak bersantan bila ada','Air kosong, bukan sirap']],
    ['bag','#E08A00','Makanan Segera',['Burger ayam panggang, bukan goreng','Air kosong atau minuman zero','Langkau kentang goreng, atau kongsi']],
    ['food','#1F9D6A','Kedai Kopitiam',['Roti bakar + 2 telur separuh masak','Kopi o kurang manis','Mi sup berbanding mi goreng']]]
    .map(function(x){ return '<div class="lbx-oc" style="--mc:'+x[1]+'"><div class="h"><span class="ic">'+glyph(x[0])+'</span><b>'+x[2]+'</b></div>'+
      x[3].map(function(o){ return '<div class="o">'+glyph('check')+'<span>'+o+'</span></div>'; }).join('')+'</div>'; }).join('')+'</div>';
  if(typeof AC_EPS!=='undefined') h+='<div class="lbx-row" onclick="lbSetTab(\'learn\')"><span class="b">'+glyph('play')+'</span><div class="tx"><div class="t">Nutrition Academy</div><div class="m">'+AC_EPS.length+' episod · full access with Ladies Burn 30</div></div><span class="pdx-chev">›</span></div>';
  h+=LB30_SETH.nutrition.map(function(v,i){ return v?lbVideoCard(v,'Nutrition tip '+(i+1)+' with Coach Seth'):''; }).join('');
  h+='<button class="authalt" onclick="lbForgetNumbers()">Change my numbers</button>';
  return h;
}

/* ── progress: days, the body, photos, the fit test ── */
function lbProgress(){
  if(!lbOwned()) return lbLocked('chart','See yourself change',
    'Berat, pinggang dan pinggul pada Hari 1, 15 dan 30, gambar sebelum dan selepas, dan fit test Hari 1 berbanding Hari 30.');
  var w=lbData(), done=lbDone(), tot=LB30_DAYS.length, mins=0, k;
  for(k in HF.data.sessions) if(HF.data.sessions.hasOwnProperty(k) && k.indexOf(LB30_KEY+'-')===0) mins+=(HF.data.sessions[k].mins||0);
  var streak=liveStreak();
  /* the month at a glance: a ring, the streak, the minutes */
  var h='<div class="lbx-card lbx-pstat">'+lbRing(done/tot,92,done+'<i>/'+tot+'</i>','days')+
    '<div class="lbx-pstat-r"><div class="lbx-chip fl"><span class="ic">'+glyph('flame')+'</span><div><b>'+streak+'</b><span>Day streak</span></div></div>'+
    '<div class="lbx-chip cl"><span class="ic">'+glyph('clock')+'</span><div><b>'+Math.round(mins)+'</b><span>Minutes trained</span></div></div></div></div>';
  if(done>=tot) h+='<div class="wl-cert">'+ic('trophy')+'<div class="t">30 Days Complete</div>'+
    '<div class="s">'+hesc(((HF.data.prefs&&HF.data.prefs.name)||'Anda').trim())+' telah menamatkan '+hesc(LB30_NAME)+'.</div></div>';
  /* the body, day 1 / 15 / 30: the check-in due next is lit */
  var nextCi=LB30_CHECKINS.filter(function(n){ return done<n; })[0]||30;
  var icons={kg:'scale',waist:'measure',hip:'measure'};
  h+='<div class="lbx-sec"><div class="lbx-sh"><div class="lbx-st">Body Check-in</div><div class="lbx-ss">Pagi, sebelum sarapan · next on Day '+nextCi+'</div></div></div>';
  h+='<div class="lbx-card lbx-body"><div class="lbx-bh"><span></span>'+LB30_CHECKINS.map(function(n){ return '<b class="'+(n===nextCi?'on':'')+'">Day '+n+'</b>'; }).join('')+'</div>'+
    LB30_BODY.map(function(m){ return '<div class="lbx-br"><span class="lab"><span class="ic">'+glyph(icons[m[0]]||'measure')+'</span><span>'+m[1]+'<small>'+m[2]+'</small></span></span>'+
      LB30_CHECKINS.map(function(n){ var v=(w.body[n]||{})[m[0]]||''; return '<input class="'+(v?'has':'')+(n===nextCi?' on':'')+'" inputmode="decimal" placeholder="–" aria-label="'+m[1]+' day '+n+'" value="'+v+'" onchange="lbSetBody('+n+',\''+m[0]+'\',this.value);renderLB30()">'; }).join('')+'</div>'; }).join('')+
    '</div>';
  var b1=w.body[1]||{}, bl=(w.body[30]&&w.body[30].kg)?w.body[30]:(w.body[15]||{});
  if(b1.kg&&bl.kg){
    var chip=function(lab,a,b,u){ var d=Math.round((b-a)*10)/10; return '<div class="lbx-dl '+(d<0?'dn':d>0?'up':'')+'"><b>'+(d>0?'+':'')+d+' '+u+'</b><span>'+lab+'</span></div>'; };
    h+='<div class="lbx-deltas">'+chip('Weight',b1.kg,bl.kg,'kg')+(b1.waist&&bl.waist?chip('Waist',b1.waist,bl.waist,'cm'):'')+(b1.hip&&bl.hip?chip('Hips',b1.hip,bl.hip,'cm'):'')+'</div>';
  }
  /* photos */
  h+='<div class="lbx-sec"><div class="lbx-sh"><div class="lbx-st">Progress Photos</div><div class="lbx-ss">Disimpan dalam telefon ini sahaja.</div></div></div>';
  h+='<div class="lbx-photos">'+LB30_CHECKINS.map(function(n){
    var src=lbPhoto(n);
    return '<label class="lbx-ph'+(src?' has':'')+(n===nextCi&&!src?' on':'')+'"'+(src?' style="background-image:url(\''+src+'\')"':'')+'>'+
      '<input type="file" accept="image/*" onchange="lbAddPhoto('+n+',this)">'+
      (src?'':'<span class="ic">'+glyph('photo')+'</span><span class="add">Add photo</span>')+'<span class="d">Day '+n+'</span></label>';
  }).join('')+'</div>';
  /* the fit test, day 1 against day 30 */
  h+='<div class="lbx-sec"><div class="lbx-sh"><div class="lbx-st">Fit Test</div><div class="lbx-ss">Day 1 vs Day 30.</div></div></div>';
  h+='<div class="lbx-card lbx-fit"><div class="lbx-fh"><span></span><b>Day 1</b><b>Day 30</b><b>Change</b></div>'+
    LB30_FIT.map(function(f){
      var a=+(w.fit.d1||{})[f[0]]||0, b=+(w.fit.d30||{})[f[0]]||0, ch=(a&&b)?Math.round((b-a)/a*100):null;
      return '<div class="lbx-fr"><span class="lab">'+f[1]+'<small>'+f[2]+'</small></span>'+
        '<input class="'+(a?'has':'')+'" inputmode="numeric" placeholder="–" aria-label="'+f[1]+' day 1" value="'+(a||'')+'" onchange="lbSetFit(\'d1\',\''+f[0]+'\',this.value);renderLB30()">'+
        '<input class="'+(b?'has':'')+'" inputmode="numeric" placeholder="–" aria-label="'+f[1]+' day 30" value="'+(b||'')+'" onchange="lbSetFit(\'d30\',\''+f[0]+'\',this.value);renderLB30()">'+
        '<span class="ch '+(ch>0?'up':ch<0?'dn':'')+'">'+(ch===null?'—':(ch>0?'+':'')+ch+'%')+'</span></div>';
    }).join('')+'</div>';
  /* a medal for each week */
  h+='<div class="lbx-sec"><div class="lbx-sh"><div class="lbx-st">Badges</div><div class="lbx-ss">Satu untuk setiap minggu yang anda tamatkan.</div></div></div>';
  var wicons=['sunrise','workout','flame','trophy'];
  h+='<div class="lbx-medals">'+LB30_WEEKS.map(function(x,i){
    var got=done>=x.to, part=Math.max(0,Math.min(1,(done-(x.from-1))/(x.to-x.from+1)));
    return '<div class="lbx-medal'+(got?' on':'')+'"><div class="m" style="--p:'+Math.round(part*100)+'%"><span>'+glyph(got?wicons[i]:'lock')+'</span></div>'+
      '<b>'+x.n+'</b><small>'+(got?'Earned':'Day '+x.to)+'</small></div>';
  }).join('')+'</div>';
  return h;
}

/* ── start here ── */
function lbGuide(){
  var h=LB30_SETH.intro?lbVideoCard(LB30_SETH.intro,'Program intro with Coach Seth'):'';
  h+='<div class="lb-safe">'+ic('warning')+'<div><div class="t">Before you start</div>'+
    '<div class="s">Jika anda baru bersalin (kurang 6 minggu), selepas pembedahan caesarean, hamil, atau ada masalah kesihatan, '+
    'dapatkan nasihat doktor sebelum mula.</div></div></div>';
  h+=fsec('How It Works','');
  h+='<div class="wl-steps">'+[
    ['Hari 1: check-in, kemudian fit test','Rekod berat, pinggang dan pinggul dahulu. Fit test impak rendah selepas itu — boleh dilangkau.'],
    ['Satu workout setiap hari','Maksimum 20 minit, tanpa lompat. Atau pecah 2 × 10 minit, pagi dan petang.'],
    ['Senarai semak harian','Workout, langkah, air, misi pemakanan, makan ikut pelan, tidur.'],
    ['Hari 15 & 30: check-in semula','Berat, pinggang, pinggul dan gambar. Hari 30, ulang fit test.']]
    .map(function(s,i){ return '<div class="wl-step"><span class="n">'+(i+1)+'</span><div><div class="t">'+s[0]+'</div><div class="m">'+s[1]+'</div></div></div>'; }).join('')+'</div>';
  h+=fsec('What You Need','Tiada apa yang perlu dibeli.');
  h+='<div class="wl-kit">'+[['mat','Tikar atau tuala'],['home','Sedikit ruang & dinding'],['bottle','Botol air minum'],['clock','20 minit sehari']]
    .map(function(k){ return '<div><span class="wl-kic">'+glyph(k[0])+'</span><span>'+k[1]+'</span></div>'; }).join('')+'</div>';
  h+=fsec('Four Weeks','');
  h+='<div class="wl-phases">'+LB30_WEEKS.map(function(p,i){ return '<div><b>Week '+(i+1)+': '+p.n+'</b><span>Days '+p.from+'–'+p.to+'</span><small>'+p.s+'</small></div>'; }).join('')+'</div>';
  h+=fsec('Ground Rules','');
  h+='<div class="wl-tips">'+[
    'Ikut susunan hari. Tertinggal satu? Buat hari ini — pelan menunggu anda.',
    'Tiada lompatan. Senyap untuk rumah teres, apartmen, dan anak yang sedang tidur.',
    'Timbang hanya pada Hari 1, 15 dan 30. Nombor harian naik turun dan tidak banyak makna.',
    'Langkah naik setiap minggu, 4,000 hingga 10,000. Air dari 2.0 hingga 2.5 liter.',
    'Sakit pada sendi tanda berhenti. Otot rasa terbakar tidak.']
    .map(function(t){ return '<div>'+t+'</div>'; }).join('')+'</div>';
  h+=fsec('Questions','');
  h+='<div class="wl-faq">'+[
    ['Saya tertinggal sehari.','Teruskan dari hari anda sekarang. Tiga puluh workout matlamatnya, bukan tiga puluh tarikh berturut-turut.'],
    ['Tak ada masa 20 minit.','Hidupkan "Pecah kepada 2 × 10 minit" pada halaman hari: separuh gerakan pagi, separuh petang.'],
    ['Terlalu susah.','Kurangkan julat gerakan, rehat lebih lama. Habis perlahan lebih baik daripada berhenti.'],
    ['Berapa lama saya boleh simpan?','Selamanya. Bayar sekali, tiada langganan. Ulang bila-bila masa.']]
    .map(function(q){ return '<details><summary>'+q[0]+'</summary><div>'+q[1]+'</div></details>'; }).join('')+'</div>';
  if(typeof COACH_WA!=='undefined' && COACH_WA)
    h+='<button class="bigbtn sec" onclick="window.open(\'https://wa.me/'+COACH_WA+'\',\'_blank\',\'noopener\')">'+glyph('people')+'Ask a Coach on WhatsApp</button>';
  return h;
}

function lbLocked(icon,title,text){
  return '<div class="wl-lock">'+ic(icon)+'<div class="t">'+title+'</div><div class="s">'+text+'</div>'+
    '<button class="bigbtn lb-btn" onclick="lbBuy()">Dapatkan Program · RM'+LB30_PRICE+'</button></div>';
}

/* ── buying it: this program alone, or everything with HITFAT+ ── */
function lbBuy(){
  if(lbOwned()) return openProgram(LB30_ID);
  $('pw-body').innerHTML=
    '<div class="pwtop"><span></span><button class="pwx" aria-label="Tutup" onclick="closeProduct()">✕</button></div>'+
    lbPoster('wl-buy-poster lb-buy')+
    '<div class="pwlist">'+[
      ['workout','30 workout tanpa lompat','Maksimum 20 minit, atau 2 × 10 minit, video untuk setiap gerakan'],
      ['food','Sasaran kalori & menu Melayu','Tidak pernah bawah 1,200 kcal, tiga pilihan setiap waktu makan'],
      ['chart','Check-in, gambar, fit test','Berat, pinggang dan pinggul — Hari 1, 15 dan 30'],
      ['trophy','Milik anda selamanya','Bayar sekali. Tiada langganan, tiada apa untuk dibatalkan']]
      .map(function(b){ return '<div class="pwf"><div class="ic">'+ic(b[0])+'</div><div><div class="t">'+b[1]+'</div><div class="m">'+b[2]+'</div></div></div>'; }).join('')+'</div>'+
    '<div class="pwprice"><div class="p">RM'+LB30_PRICE+'</div><div class="per">bayar sekali</div></div>'+
    '<button class="bigbtn lb-btn" onclick="startCheckout(\'prog_'+LB30_ID+'\')">Buy · RM'+LB30_PRICE+'</button>'+
    '<button class="authalt" onclick="openPaywall(\'\')">Atau dapatkan semua dengan HITFAT+</button>'+
    '<div class="wl-claim"><div class="t">Beli di laman web kami?</div>'+
    '<div class="s">Log masuk dengan emel yang anda guna untuk bayar, dan ia terbuka sendiri. Guna emel lain? Masukkan nombor pesanan dari resit anda.</div>'+
    '<div class="wl-claim-f"><input id="lb-order" placeholder="Nombor pesanan" autocomplete="off"><button onclick="lbClaim()">Buka</button></div></div>';
  $('pwm').classList.add('on');
  try{ $('pwm').scrollTop=0; }catch(e){}
  lbLang(true);
}
function lbClaim(){
  var o=String((($('lb-order')||{}).value)||'').trim();
  if(!o) return toast('Masukkan nombor pesanan dari resit anda');
  if(!sb||!HF.userId) return toast('Log masuk dahulu');
  sb.rpc('plus_claim_landing',{p_order:o}).then(function(r){
    if(r.error) throw r.error;
    return loadEntitlement();
  }).then(function(){
    if(lbOwned()){ closeProduct(); toast('Dibuka — selamat datang ke 30 hari'); openProgram(LB30_ID); }
    else toast('Tiada pesanan berbayar dengan nombor itu. Semak resit, atau mesej kami.');
  })['catch'](function(){ toast('Pesanan itu tidak dapat disemak — cuba lagi sebentar.'); });
}

/* ── ?tebus=lad4 (24 Oct 2026): she paid on the landing page (Bayarcash) and
   came back through "Pembayaran berjaya". Signed in, it opens: by the order
   number when that page had one (any account), else by the email she paid
   with. The webhook can land a few seconds after her, so two more looks
   before asking for the order number. ── */
function lbTebus(tries){
  tries=tries||0;
  var o=''; try{ o=localStorage.getItem('hf_tebus_o')||''; }catch(e){}
  var claim=(sb && HF.userId) ? sb.rpc('plus_claim_landing', o?{p_order:o}:{}) : Promise.resolve(null);
  var after=function(){
    if(lbOwned()){
      try{ localStorage.removeItem('hf_tebus_o'); }catch(e){}
      _paySku='prog_'+LB30_ID; openProgram(LB30_ID); coConfirm('ok');
      return;
    }
    if(tries<2){ if(!tries) lbTebusSheet('wait',o); setTimeout(function(){ lbTebus(tries+1); },4000); return; }
    lbTebusSheet('miss',o);
  };
  Promise.resolve(claim).then(function(){ return loadEntitlement(); }, function(){ return loadEntitlement(); }).then(after, after);
}
function lbTebusSheet(state,o){
  var h='<div class="pwtop"><span></span><button class="pwx" aria-label="Tutup" onclick="closeProduct()">✕</button></div>';
  if(state==='wait') h+='<div class="co co-done"><div class="co-badge co-wait"><span class="co-dot"></span><span class="co-dot"></span><span class="co-dot"></span></div>'+
    '<div class="coh">Menyemak pembayaran anda</div><div class="co-s">Biasanya beberapa saat sahaja.</div></div>';
  else h+='<div class="co co-done"><div class="co-badge co-late">'+glyph('clock')+'</div>'+
    '<div class="coh">Kami belum jumpa pembayaran anda</div>'+
    '<div class="co-s">Kalau anda bayar guna emel lain, masukkan nombor pesanan dari resit Bayarcash.</div></div>'+
    '<div class="wl-claim"><div class="wl-claim-f"><input id="lb-order" placeholder="Nombor pesanan" autocomplete="off" value="'+hesc(o||'')+'"><button onclick="lbClaim()">Buka</button></div></div>'+
    '<button class="bigbtn lb-btn" onclick="lbTebus(1)">Cuba lagi</button>'+
    '<button class="authalt" onclick="window.open(\'https://wa.me/60189174656?text='+encodeURIComponent('Hai HITFAT, saya dah bayar Ladies Burn 30 tapi belum terbuka.')+'\',\'_blank\',\'noopener\')">Masih tak terbuka? <b>WhatsApp kami</b></button>';
  $('pw-body').innerHTML=h; $('pwm').classList.add('on');
}

/* ── Home: the full card once she has started it or bought it on its own;
   until then a tile in the programs row (hubRow, diet6.js) ── */
function lbFull(){ return lbOwned() && lbNext()<LB30_DAYS.length && (owns('prog_'+LB30_ID) || lbDone()>0); }
function lbHomeCard(){
  if(!lbFull()) return '';
  var done=lbDone(), tot=LB30_DAYS.length, nx=lbNext(), d=LB30_DAYS[nx], pct=Math.round(done/tot*100);
  return '<div class="wl-poster lb-card" onclick="openProgram(\''+LB30_ID+'\')">'+lbPoster('lb-card-poster')+
    '<div class="wl-poster-b"><div class="tx"><div class="k">Day '+(nx+1)+' · '+lbMinutes(d)+' min</div>'+
    '<div class="t">'+d.n+'</div><div class="pbar lb-bar"><i style="width:'+pct+'%"></i></div></div>'+
    '<button class="bigbtn lb-btn" onclick="event.stopPropagation();lbOpenDay('+nx+')">'+glyph('play')+'Start Day '+(nx+1)+'</button></div></div>';
}
