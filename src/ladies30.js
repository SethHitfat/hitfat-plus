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
var LB30_ACCENT='#E8457A';
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
  {n:'Mula',  s:'Sesi pendek, tiada lompatan. Tugas minggu ini cuma satu: hadir.',              from:1,  to:7},
  {n:'Bina',  s:'Tiga pusingan sekarang. Sedikit lebih lama, sedikit lebih variasi.',            from:8,  to:14},
  {n:'Bakar', s:'Minggu bakar lemak. Enam gerakan sehari, tetap tanpa lompat.',                  from:15, to:21},
  {n:'Kuat',  s:'Sembilan hari terakhir. Anda lebih kuat daripada wanita yang mula pada Hari 1.', from:22, to:30}
];
var LB30_DAYS=[
  {n:'Check-in & Fit Test',      k:'test',    r:1, ex:LB30_TEST},
  {n:'Seluruh Badan Asas',        k:'work',    r:2, ex:['Bodyweight Squat','Wall Push Up','Hip Thrust','Dead Bug','Calf Raises']},
  {n:'Glute & Kaki',              k:'work',    r:2, ex:['Bodyweight Squat','Reverse Lunges','Hip Thrust','Side Lunges','Wall Sit']},
  {n:'Teras Asas',                k:'work',    r:2, ex:['Dead Bug','Crunch','Bird Dog','Reverse Crunch','Plank']},
  {n:'Postur & Badan Atas',       k:'work',    r:2, ex:['Wall Push Up','Bird Dog','Knee Push Ups','Dead Bug','Plank']},
  {n:'Bakar Impak Rendah',        k:'work',    r:2, ex:['Squat Pulse','Mountain Climber','Alternating Lunges','Bicycle Crunch','Calf Raises']},
  {n:'Regangan & Pulih',          k:'recover', r:1, ex:LB30_RECOVER},

  {n:'Seluruh Badan',             k:'work',    r:3, ex:['Bodyweight Squat','Knee Push Ups','Reverse Lunges','Mountain Climber','Hip Thrust']},
  {n:'Fokus Glute',               k:'work',    r:3, ex:['Hip Thrust','Curtsy Lunges','Single Leg Glutes Bridge','Side Lunges','Squat Hold']},
  {n:'Bakar Impak Rendah',        k:'work',    r:3, ex:['Squat Pulse','Mountain Climber','Alternating Lunges','Plank Shoulder Taps','Calf Raises']},
  {n:'Teras Kuat',                k:'work',    r:3, ex:['Dead Bug','Russian Twist','Reverse Crunch','Side Plank','Plank']},
  {n:'Postur & Badan Atas',       k:'work',    r:3, ex:['Knee Push Ups','Bird Dog','Push Up Hold','Plank Shoulder Taps','Dead Bug']},
  {n:'Glute & Kaki',              k:'work',    r:3, ex:['Squat Pause','Walking Lunges','Hip Thrust','Curtsy Lunges','Wall Sit']},
  {n:'Regangan & Pulih',          k:'recover', r:1, ex:LB30_RECOVER},

  {n:'Bakar Seluruh Badan',       k:'work',    r:3, ex:['Bodyweight Squat','Knee Push Ups','Alternating Lunges','Mountain Climber','Hip Thrust','Bicycle Crunch']},
  {n:'Glute & Kaki',              k:'work',    r:3, ex:['Squat Pulse','Reverse Lunges','Single Leg Glutes Bridge','Curtsy Lunges','Side Lunges','Single Leg Calf Raises']},
  {n:'Teras & Pinggang',          k:'work',    r:3, ex:['Dead Bug','Russian Twist','Bicycle Crunch','Leg Raises','Side Plank','Plank']},
  {n:'Regangan & Pulih',          k:'recover', r:1, ex:LB30_RECOVER},
  {n:'Postur & Kekuatan Atas',    k:'work',    r:3, ex:['Knee Push Ups','Bird Dog','Plank Shoulder Taps','Push Up Hold','Wall Push Up','Dead Bug']},
  {n:'Glute Bakar',               k:'work',    r:3, ex:['Hip Thrust','Single Leg Glutes Bridge','Curtsy Lunges','Squat Hold','Side Lunges','Calf Raises']},
  {n:'Regangan & Pulih',          k:'recover', r:1, ex:LB30_RECOVER},

  {n:'Seluruh Badan Kuat',        k:'work',    r:3, ex:['Squat Pause','Push Up','Walking Lunges','Mountain Climber','Hip Thrust','Plank']},
  {n:'Bakar Impak Rendah',        k:'work',    r:3, ex:['Squat Pulse','Mountain Climber','Reverse Lunges','Plank Shoulder Taps','Bicycle Crunch','Calf Raises']},
  {n:'Glute & Kaki',              k:'work',    r:3, ex:['Squat Pause','Curtsy Lunges','Single Leg Glutes Bridge','Side Lunges','Wall Sit','Single Leg Calf Raises']},
  {n:'Regangan & Pulih',          k:'recover', r:1, ex:LB30_RECOVER},
  {n:'Teras Penamat',             k:'work',    r:3, ex:['Dead Bug','Leg Raises','Russian Twist','Flutter Kick','Side Plank','Hollow Hold']},
  {n:'Postur & Kekuatan Atas',    k:'work',    r:3, ex:['Push Up','Bird Dog','Plank Shoulder Taps','Push Up Hold','Knee Push Ups','Plank']},
  {n:'Cabaran Seluruh Badan',     k:'work',    r:3, ex:['Bodyweight Squat','Push Up','Alternating Lunges','Mountain Climber','Hip Thrust','Plank']},
  {n:'Regangan & Pulih',          k:'recover', r:1, ex:LB30_RECOVER},
  {n:'Check-in & Fit Test Akhir', k:'test',    r:1, ex:LB30_TEST}
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
var LB30_CHECKS=[['misi','Misi pemakanan hari ini','food'],['makan','Makan ikut pelan','clipboard'],['tidur','Tidur 7 jam','moon']];

/* ── the menus: Malay home cooking ──
   Ten Malay home dishes for each meal (19 Oct: four added to each, so the
   30 days don't repeat two sets); each day shows three, picked by the day.
   kcal is for the portion shown. Seth can still swap in his own list here. */
var LB30_MENU={
  sarapan:{label:'Sarapan', time:'7:00 pagi', share:0.25, note:'Cepat, untuk ibu yang bekerja', opts:[
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
  tengahari:{label:'Bekal Tengah Hari', time:'1:00 petang', share:0.40, note:'Bekal dari rumah', opts:[
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
  malam:{label:'Makan Malam Keluarga', time:'7:30 malam', share:0.35, note:'Makan bersama keluarga', opts:[
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
var LB30_FIT=[['squat','Bodyweight Squat','ulangan'],['push','Knee Push Ups','ulangan'],['bridge','Hip Thrust','ulangan'],
              ['crunch','Crunch','ulangan'],['plank','Plank','saat']];
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
  d.check=d.check||{}; d.fit=d.fit||{}; d.body=d.body||{}; d.half=d.half||{}; d.steps=d.steps||{}; d.water=d.water||{};
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
var LB30_KIND={test:'Check-in & Fit Test', work:'Latihan', recover:'Pulih'};
var LB30_PIC={test:'act-beginner', work:'act-fatloss', recover:'act-recovery'};
function lbPic(d){ return '/img/p/'+(LB30_PIC[d.k]||'act-beginner')+'.jpg'; }

/* While the program is on screen, everything is in Malay: its own pages are
   written so, and the language layer covers the shared ones (the player,
   the bar at the top). Leaving the program puts English back. */
var _lbMs=false;
function lbLang(on){
  if(typeof i18nApply!=='function') return;
  /* the tab bar at the bottom stays as the rest of the app has it (18 Oct:
     it turned into Utama / Makan / Saya on this one program) */
  var tb=$('tabs');
  if(on && !_lbMs){ _lbMs=true; if(tb&&tb.setAttribute) tb.setAttribute('data-noi18n','1'); LANG='ms'; i18nApply(document.body); }
  else if(!on && _lbMs){ _lbMs=false; LANG='en'; i18nRestore(document.body); if(tb&&tb.removeAttribute) tb.removeAttribute('data-noi18n'); }
}

/* ── the program's home ── */
var lbTab='plan', lbWeek=-1, lbMenuDay=-1;
function lbSetTab(t){ lbTab=t; renderLB30(); try{ var s=$('screen'), a=$('lb-tabs'); if(s&&a&&a.offsetTop) s.scrollTop=Math.max(0,a.offsetTop-70); }catch(e){} }
function renderLB30(){
  lbLang(true);
  var owned=lbOwned(), done=lbDone(), tot=LB30_DAYS.length, nx=lbNext();
  var pct=Math.round(done/tot*100);
  if(lbWeek<0) lbWeek=lbWeekOf(Math.min(nx,tot-1));
  var pill=!owned ? {icon:'lock',label:'RM'+LB30_PRICE,go:'lbBuy()'}
         : nx<tot ? {icon:'play',label:'Hari '+(nx+1),go:'lbOpenDay('+nx+')'} : null;
  var status=!owned ? LB30_SUB : nx<tot ? 'Hari '+(nx+1)+' daripada '+tot+' · Minggu '+(lbWeekOf(nx)+1)+': '+LB30_WEEKS[lbWeekOf(nx)].n : 'Program selesai';
  var h=lbHero('program', status, owned ? '' : 'Bayar sekali · milik anda selamanya', pill);
  if(owned) h+='<div class="lb-head"><div class="pbar lb-bar"><i style="width:'+pct+'%"></i></div><span>'+pct+'%</span></div>';
  h+='<div class="pdx-btns">';
  if(!owned){
    h+='<button class="bigbtn lb-btn" onclick="lbBuy()">Dapatkan Program · RM'+LB30_PRICE+'</button>'+
       '<button class="pdx-prev" onclick="openPaywall(\'\')">'+glyph('star')+'Termasuk dalam HITFAT+</button>';
  } else if(nx<tot){
    h+='<button class="bigbtn lb-btn" onclick="lbOpenDay('+nx+')">'+glyph('play')+(done?'Teruskan · Hari '+(nx+1):'Mula Hari 1')+'</button>';
  } else {
    h+='<button class="bigbtn lb-btn" onclick="lbSetTab(\'progress\')">'+glyph('trophy')+'Lihat Keputusan Anda</button>';
  }
  h+='</div>';
  h+='<div class="filters wl-tabs lb-tabs" id="lb-tabs">'+[['plan','Pelan'],['food','Pemakanan'],['progress','Progres'],['guide','Mula Di Sini']]
    .map(function(t){ return '<button class="chip'+(lbTab===t[0]?' y':'')+'" onclick="lbSetTab(\''+t[0]+'\')">'+t[1]+'</button>'; }).join('')+'</div>';
  if(lbTab==='food') h+=lbFood();
  else if(lbTab==='progress') h+=lbProgress();
  else if(lbTab==='guide') h+=lbGuide();
  else h+=lbPlan();
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

/* ── Plan: today's list, then the week and its days ── */
function lbPlan(){
  var owned=lbOwned(), done=lbDone(), tot=LB30_DAYS.length, nx=lbNext(), h='';
  if(owned && nx<tot) h+=lbChecklist();
  var w=LB30_WEEKS[lbWeek]||LB30_WEEKS[0];
  h+=fsec('30 Hari','');
  h+='<div class="filters pdx-weeks">'+LB30_WEEKS.map(function(x,i){
    var all=done>=x.to;
    return '<button class="chip'+(i===lbWeek?' y':'')+'" onclick="lbWeek='+i+';renderLB30()">'+(all?'✓ ':'')+'Minggu '+(i+1)+'</button>'; }).join('')+'</div>';
  h+='<div class="lb-week"><div class="t">Minggu '+(lbWeek+1)+' · '+w.n+'</div><div class="s">'+w.s+'</div></div>';
  if(LB30_SETH.weeks[lbWeek]) h+=lbVideoCard(LB30_SETH.weeks[lbWeek],'Intro Minggu '+(lbWeek+1)+' bersama Coach Seth');
  h+='<div class="lb-days">'+LB30_DAYS.slice(w.from-1,w.to).map(function(d,j){
    var gi=w.from-1+j, isDone=gi<done, now=gi===nx&&owned;
    return '<div class="lb-dayrow'+(isDone?' done':'')+(now?' now':'')+'" onclick="lbOpenDay('+gi+')">'+
      '<span class="n">'+(isDone?glyph('check'):(gi+1))+'</span>'+
      '<div class="tx"><div class="t">'+d.n+'</div><div class="m">'+(d.k==='test'?'Check-in & fit test':d.k==='recover'?'Pulih · '+lbMinutes(d)+' min':lbMinutes(d)+' min · '+d.ex.length+' gerakan')+'</div></div>'+
      (now?'<span class="lb-now">Hari ini</span>':'<span class="pdx-chev">›</span>')+'</div>';
  }).join('')+'</div>';
  return h;
}

/* today's list, one row each: the workout ticks itself, walking and water
   count up, and the day's nutrition mission is written out in its row */
function lbChecklist(){
  var lb=lbData(), t=iso(0), gi=Math.min(lbNext(),LB30_DAYS.length-1);
  var c=lb.check[t]||{}, trained=doneToday();
  var stepT=LB30_STEPS[gi], st=+lb.steps[t]||0, waterT=lbWater(gi), wt=+lb.water[t]||0;
  var stepOk=st>=stepT, waterOk=wt>=waterT-0.001;
  var n=(trained?1:0)+(stepOk?1:0)+(waterOk?1:0);
  LB30_CHECKS.forEach(function(x){ if(c[x[0]]) n++; });
  var total=3+LB30_CHECKS.length;
  var box=function(on){ return '<span class="b">'+(on?glyph('check'):'')+'</span>'; };
  var row=function(on,title,sub,right,go){
    return '<div class="lb-chk'+(on?' on':'')+'"'+(go?' onclick="'+go+'"':'')+'>'+box(on)+
      '<div class="tx"><div class="t">'+title+'</div>'+(sub?'<div class="m">'+sub+'</div>':'')+'</div>'+(right||'')+'</div>';
  };
  var ctl=function(minus,val,plus,lm,lp){ return '<span class="lb-ctl" onclick="event.stopPropagation()"><button onclick="'+minus+'" aria-label="'+lm+'">−</button><b>'+val+'</b><button onclick="'+plus+'" aria-label="'+lp+'">+</button></span>'; };
  var d=LB30_DAYS[gi];
  var h=fsec('Senarai Semak Hari Ini',n+' daripada '+total+' siap')+'<div class="lb-chks">';
  h+=row(trained,'Workout · '+d.n, lbMinutes(d)+' min', '<span class="pdx-chev">›</span>', 'lbOpenDay('+gi+')');
  h+=row(!!c.misi,'Misi pemakanan',LB30_MISI[gi],'', 'lbTick(\'misi\')');
  h+=row(stepOk,'Langkah','Sasaran '+stepT.toLocaleString(), ctl('lbSteps(-500)',st.toLocaleString(),'lbSteps(500)','Kurang 500 langkah','Tambah 500 langkah'), 'lbSteps(\'goal\')');
  h+=row(waterOk,'Air','Sasaran '+waterT.toFixed(1)+' L', ctl('lbWaterAdd(-0.25)',wt.toFixed(2).replace(/0$/,'')+' L','lbWaterAdd(0.25)','Kurang 250 ml','Tambah 250 ml'), '');
  h+=row(!!c.makan,'Makan ikut pelan','','', 'lbTick(\'makan\')');
  h+=row(!!c.tidur,'Tidur 7 jam','','', 'lbTick(\'tidur\')');
  return h+'</div>';
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

/* ── a day ── */
function lbOpenDay(gi){
  var d=LB30_DAYS[gi]; if(!d) return;
  var owned=lbOwned(), exs=lbExercises(d), lb=lbData();
  curProg=LB30; curDay={p:LB30, day:LB30.weeks[lbWeekOf(gi)].days[gi-LB30_WEEKS[lbWeekOf(gi)].from+1], gi:gi};
  var h=lbHero('day','Hari '+(gi+1)+' daripada 30 · '+d.n, lbMinutes(d)+' min · '+exs.length+' gerakan · '+d.r+' pusingan',
    owned?{icon:'play',label:'Mula',go:'lbPlay('+gi+')'}:{icon:'lock',label:'RM'+LB30_PRICE,go:'lbBuy()'});
  var isCheck=LB30_CHECKINS.indexOf(gi+1)>=0;
  if(!owned){
    h+='<div class="pdx-btns"><button class="bigbtn lb-btn" onclick="lbBuy()">'+glyph('lock')+'Buka · RM'+LB30_PRICE+'</button></div>';
  } else if(d.k==='test'){
    /* day 1 and day 30: the body first, then the fit test, which may be skipped */
    h+='<div class="lb-steps"><div class="lb-step"><span class="n">1</span><div class="tx"><div class="t">Body Check-in</div>'+
       '<div class="s">Berat, pinggang dan pinggul — pagi, sebelum sarapan. Gambar jika anda mahu.</div></div></div>'+
       lbBodyForm(gi+1)+
       '<div class="lb-step"><span class="n">2</span><div class="tx"><div class="t">Fit Test impak rendah</div>'+
       '<div class="s">Lima gerakan, satu pusingan, tanpa lompat. Kira ulangan setiap satu — untuk plank, saat anda tahan.</div></div></div></div>'+
       '<div class="pdx-btns"><button class="bigbtn lb-btn" onclick="lbPlay('+gi+')">'+glyph('play')+'Mula Fit Test</button>'+
       '<button class="pdx-prev" onclick="lbSkipTest('+gi+')">Langkau fit test, tandakan hari siap</button></div>'+
       lbFitForm(gi===0?'d1':'d30');
  } else {
    if(isCheck) h+='<div class="lb-steps"><div class="lb-step"><span class="n">'+glyph('flag')+'</span><div class="tx"><div class="t">Body Check-in Hari '+(gi+1)+'</div>'+
       '<div class="s">Rekod sebelum latihan: pagi, sebelum sarapan.</div></div></div>'+lbBodyForm(gi+1)+'</div>';
    var hv=lbHalves(d), parts=lb.half[gi]||{}, split=!!lb.split && d.k!=='recover';
    h+='<div class="lb-split"><span>Pecah kepada 2 × 10 minit (pagi & petang)</span>'+
       '<button class="lb-sw'+(lb.split?' on':'')+'" role="switch" aria-checked="'+(lb.split?'true':'false')+'" onclick="lbToggleSplit('+gi+')"><i></i></button></div>';
    if(split){
      h+='<div class="pdx-btns">'+
        '<button class="bigbtn lb-btn'+(parts.a?' sec':'')+'" onclick="lbPlay('+gi+',\'a\')">'+glyph(parts.a?'check':'sun')+'Sesi Pagi · '+Math.round(lbSecs(hv[0],d.r)/60)+' min</button>'+
        '<button class="bigbtn lb-btn'+(parts.b?' sec':'')+'" onclick="lbPlay('+gi+',\'b\')">'+glyph(parts.b?'check':'moon')+'Sesi Petang · '+Math.round(lbSecs(hv[1],d.r)/60)+' min</button></div>';
    } else {
      h+='<div class="pdx-btns"><button class="bigbtn lb-btn" onclick="lbPlay('+gi+')">'+glyph('play')+'Mula Workout</button>'+
         '<button class="pdx-prev" onclick="lbComplete('+gi+')">'+glyph('check')+'Tanda siap tanpa main</button></div>';
    }
  }
  h+='<div class="wl-tip">'+ic('spark')+'<div><div class="k">Nota coach</div><div class="t">'+LB30_TIPS[gi]+'</div></div></div>';
  if(d.k==='recover') h+='<div class="wl-tip">'+ic('leaf')+'<div><div class="k">Hari pulih</div>'+
    '<div class="t">Bergerak perlahan dan bernafas. Hari ini badan anda menjadi lebih kuat.</div></div></div>';
  h+='<div class="fsec"><div class="ft">Dalam Workout Ini</div><div class="fs">Tekan gerakan untuk tonton.</div></div>'+
    '<div class="pdx-eps">'+exs.map(function(e,i){
      return '<div class="pdx-ex" onclick="'+(owned?'lbPlayOne(\''+e.n.replace(/'/g,"\\'")+'\')':'lbBuy()')+'">'+
      '<span class="n">'+(i+1)+'</span><div class="tx"><div class="t">'+e.n+'</div><div class="m">'+e.dur+'s · tanpa lompat</div></div>'+
      '<span class="pdx-play">'+glyph(owned?'play':'lock')+'</span></div>'; }).join('')+'</div>';
  h+='<div class="wl-need"><span class="wl-kic">'+glyph('mat')+'</span><span>Anda perlukan: tikar atau tuala'+(d.ex.join(' ').indexOf('Wall')>=0?', dinding':'')+'</span></div>';
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
  HF.save(); toast('Hari siap 🔥');
  hidePanels(); $('progdetail').style.display='block'; renderLB30(); $('screen').scrollTop=0;
}
function lbSkipTest(gi){ lbComplete(gi); }

/* ── the body: weight, waist and hip on days 1, 15 and 30 ── */
var LB30_BODY=[['kg','Berat','kg'],['waist','Pinggang','cm'],['hip','Pinggul','cm']];
function lbBodyForm(n){
  var b=lbData().body[n]||{}, src=lbPhoto(n);
  return '<div class="lb-body"><div class="esfields">'+LB30_BODY.map(function(m){
      return '<label class="esf"><span>'+m[1]+'</span><input class="inp" inputmode="decimal" placeholder="0" aria-label="'+m[1]+' hari '+n+'" value="'+(b[m[0]]||'')+'" '+
        'onchange="lbSetBody('+n+',\''+m[0]+'\',this.value)"><em>'+m[2]+'</em></label>'; }).join('')+'</div>'+
    '<label class="wl-ph lb-ph'+(src?' has':'')+'"'+(src?' style="background-image:url(\''+src+'\')"':'')+'>'+
      '<input type="file" accept="image/*" onchange="lbAddPhoto('+n+',this)">'+(src?'':ic('photo'))+'<span>Gambar Hari '+n+'</span></label>'+
    '<div class="lb-fine">Gambar disimpan dalam telefon ini sahaja.</div></div>';
}
function lbFitForm(when){
  var f=lbData().fit[when]||{};
  return fsec('Keputusan Fit Test',when==='d1'?'Hari 1':'Hari 30')+'<div class="esfields">'+LB30_FIT.map(function(x){
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
function lbFood(){
  if(!lbOwned()) return lbLocked('food','Sasaran kalori & menu 30 hari',
    'Sasaran harian dari berat, tinggi dan umur anda — sarapan, bekal tengah hari dan makan malam keluarga, '+
    'masakan Melayu, tiga pilihan setiap waktu makan, dan satu misi pemakanan setiap hari.');
  var t=lbTarget(), h='';
  if(!t){
    var pr=lbProfile();
    var fld=function(id,l,u,v,m){ return '<label class="esf"><span>'+l+'</span><input class="inp" id="'+id+'" inputmode="'+m+'" placeholder="0" value="'+(v||'')+'"><em>'+u+'</em></label>'; };
    return fsec('Sasaran Kalori Anda','Tiga nombor, dan ia dikira sendiri.')+
      '<div class="esfields">'+fld('lb-wt','Berat','kg',pr.wt,'decimal')+fld('lb-ht','Tinggi','cm',pr.ht,'decimal')+fld('lb-age','Umur','tahun',pr.age,'numeric')+'</div>'+
      '<button class="bigbtn esave lb-btn" onclick="lbSaveProfile()">Kira Sasaran Saya</button>';
  }
  var tot=LB30_DAYS.length;
  if(lbMenuDay<0) lbMenuDay=Math.min(lbNext(),tot-1);
  h+='<div class="nstage wl-stage lb-stage"><span class="wl-st-gly">'+glyph('flame')+'</span><div class="nstage-k">Sasaran harian anda</div>'+
    '<div class="nstage-n">'+t.cal.toLocaleString()+'<span> kcal</span></div>'+
    '<div class="nstage-s">Lebih kurang 0.5 kg seminggu · tidak pernah bawah 1,200 kcal</div>'+
    '<div class="nstage-g">'+[[t.prot+'g','Protein'],[t.carb+'g','Karbo'],[t.fat+'g','Lemak'],[lbWater(lbMenuDay).toFixed(1)+' L','Air']]
      .map(function(x){ return '<div><b>'+x[0]+'</b><span>'+x[1]+'</span></div>'; }).join('')+'</div></div>';
  h+='<div class="lb-misi">'+ic('food')+'<div><div class="k">Misi pemakanan · Hari '+(lbMenuDay+1)+'</div><div class="t">'+LB30_MISI[lbMenuDay]+'</div></div></div>';
  h+=fsec('Menu','Hari '+(lbMenuDay+1)+' · tiga pilihan untuk setiap waktu makan');
  h+='<div class="hscroll wl-mdays">'+LB30_DAYS.map(function(d,i){
    return '<button class="wl-md'+(i===lbMenuDay?' on':'')+'" onclick="lbMenuDay='+i+';renderLB30()"><small>Hari</small><b>'+(i+1)+'</b></button>'; }).join('')+'</div>';
  h+='<div class="wl-meals">'+LB30_SLOTS.map(function(slot,si){
    var s=LB30_MENU[slot], opts=lbMenuFor(slot,lbMenuDay), sid='lbm-'+lbMenuDay+'-'+si;
    return '<div class="mpslot" id="'+sid+'"><div class="mpslot-h"><div><div class="t">'+s.label+'</div>'+
      '<div class="m">'+s.time+' · lebih kurang '+Math.round(t.cal*s.share)+' kcal · '+s.note+'</div></div>'+
      '<div class="mpopts">'+opts.map(function(o,oi){ return '<button class="mpo'+(oi===0?' on':'')+'" aria-label="Pilihan '+(oi+1)+'" onclick="mpOpt(\''+sid+'\','+oi+')">'+(oi+1)+'</button>'; }).join('')+'</div></div>'+
      opts.map(function(o,oi){ return '<div class="mpopt" style="display:'+(oi===0?'block':'none')+';">'+
        '<div class="mpopt-h"><div class="t">'+o.n+'</div><div class="k">'+o.k+' kcal</div></div>'+
        o.it.map(function(it){ return '<div class="mpitem"><div><div class="t">'+it+'</div></div></div>'; }).join('')+
      '</div>'; }).join('')+'</div>';
  }).join('')+'</div>';
  h+=fsec('Panduan Porsi','Tak perlu penimbang — guna tangan anda.');
  h+='<div class="wl-hands">'+[['Protein','1 tapak tangan','ayam, ikan, telur, tauhu, tempe'],['Karbo','1 genggam','nasi, mi, roti'],
      ['Sayur','2 genggam','separuh pinggan'],['Lemak','1 ibu jari','minyak, santan, kuah']]
    .map(function(x){ return '<div><b>'+x[1]+'</b><span>'+x[0]+'</span><small>'+x[2]+'</small></div>'; }).join('')+'</div>';
  h+=fsec('Tukar Ini, Dapat Itu','');
  h+='<div class="wl-tips">'+[
    'Teh tarik → teh o kosong. Perubahan tunggal paling besar untuk kebanyakan orang.',
    'Ayam goreng → ayam panggang. Ayam yang sama, minyak jauh kurang.',
    'Mi goreng → mi sup. Versi sup, setiap kali boleh.',
    'Kuih selepas makan → buah. Sama-sama manis, buah buat kenyang.',
    'Tambah kali kedua → segelas air, tunggu 10 minit. Rasa kenyang sampai lewat.']
    .map(function(x){ return '<div>'+x+'</div>'; }).join('')+'</div>';
  h+=LB30_SETH.nutrition.map(function(v,i){ return v?lbVideoCard(v,'Tips Pemakanan '+(i+1)+' bersama Coach Seth'):''; }).join('');
  h+='<button class="authalt" onclick="lbForgetNumbers()">Tukar nombor saya</button>';
  return h;
}

/* ── progress: days, the body, photos, the fit test ── */
function lbProgress(){
  if(!lbOwned()) return lbLocked('chart','Lihat diri anda berubah',
    'Berat, pinggang dan pinggul pada Hari 1, 15 dan 30, gambar sebelum dan selepas, dan fit test Hari 1 berbanding Hari 30.');
  var w=lbData(), done=lbDone(), mins=0, k;
  for(k in HF.data.sessions) if(HF.data.sessions.hasOwnProperty(k) && k.indexOf(LB30_KEY+'-')===0) mins+=(HF.data.sessions[k].mins||0);
  var h='<div class="wl-stats">'+[[done,'Hari siap'],[liveStreak(),'Hari berturut'],[Math.round(mins),'Minit']]
    .map(function(x){ return '<div><b>'+x[0]+'</b><span>'+x[1]+'</span></div>'; }).join('')+'</div>';
  if(done>=LB30_DAYS.length) h+='<div class="wl-cert">'+ic('trophy')+'<div class="t">30 Hari Selesai</div>'+
    '<div class="s">'+hesc(((HF.data.prefs&&HF.data.prefs.name)||'Anda').trim())+' telah menamatkan '+hesc(LB30_NAME)+'.</div></div>';
  h+=fsec('Body Check-in','Pagi, sebelum sarapan.');
  h+='<div class="wl-fit wl-body"><div class="wl-fit-h"><span></span>'+LB30_CHECKINS.map(function(n){ return '<b>Hari '+n+'</b>'; }).join('')+'</div>'+
    LB30_BODY.map(function(m){ return '<div class="wl-fit-r"><span>'+m[1]+'<small>'+m[2]+'</small></span>'+
      LB30_CHECKINS.map(function(n){ return '<input inputmode="decimal" aria-label="'+m[1]+' hari '+n+'" value="'+((w.body[n]||{})[m[0]]||'')+'" onchange="lbSetBody('+n+',\''+m[0]+'\',this.value);renderLB30()">'; }).join('')+'</div>'; }).join('')+
    '</div>';
  var b1=w.body[1]||{}, bl=(w.body[30]&&w.body[30].kg)?w.body[30]:(w.body[15]||{});
  if(b1.kg&&bl.kg){
    var parts=[], dk=Math.round((bl.kg-b1.kg)*10)/10;
    parts.push(dk<0?'Turun '+(-dk)+' kg':dk>0?'Naik '+dk+' kg':'Berat kekal');
    if(b1.waist&&bl.waist) parts.push('pinggang '+(bl.waist<=b1.waist?'turun '+Math.round((b1.waist-bl.waist)*10)/10:'naik '+Math.round((bl.waist-b1.waist)*10)/10)+' cm');
    if(b1.hip&&bl.hip) parts.push('pinggul '+(bl.hip<=b1.hip?'turun '+Math.round((b1.hip-bl.hip)*10)/10:'naik '+Math.round((bl.hip-b1.hip)*10)/10)+' cm');
    h+='<div class="wl-delta">'+parts.join(' · ')+'</div>';
  }
  h+=fsec('Gambar Progres','Disimpan dalam telefon ini sahaja.');
  h+='<div class="wl-photos">'+LB30_CHECKINS.map(function(n){
    var src=lbPhoto(n);
    return '<label class="wl-ph'+(src?' has':'')+'"'+(src?' style="background-image:url(\''+src+'\')"':'')+'>'+
      '<input type="file" accept="image/*" onchange="lbAddPhoto('+n+',this)">'+(src?'':ic('photo'))+'<span>Hari '+n+'</span></label>';
  }).join('')+'</div>';
  h+=fsec('Fit Test','Hari 1 berbanding Hari 30.');
  h+='<div class="wl-fit"><div class="wl-fit-h"><span></span><b>Hari 1</b><b>Hari 30</b><b>Beza</b></div>'+
    LB30_FIT.map(function(f){
      var a=+(w.fit.d1||{})[f[0]]||0, b=+(w.fit.d30||{})[f[0]]||0, ch=(a&&b)?Math.round((b-a)/a*100):null;
      return '<div class="wl-fit-r"><span>'+f[1]+'<small>'+f[2]+'</small></span>'+
        '<input inputmode="numeric" aria-label="'+f[1]+' hari 1" value="'+(a||'')+'" onchange="lbSetFit(\'d1\',\''+f[0]+'\',this.value);renderLB30()">'+
        '<input inputmode="numeric" aria-label="'+f[1]+' hari 30" value="'+(b||'')+'" onchange="lbSetFit(\'d30\',\''+f[0]+'\',this.value);renderLB30()">'+
        '<b class="'+(ch>0?'up':ch<0?'dn':'')+'">'+(ch===null?'—':(ch>0?'+':'')+ch+'%')+'</b></div>';
    }).join('')+'</div>';
  h+=fsec('Lencana','Satu untuk setiap minggu yang anda tamatkan.');
  h+='<div class="wl-badges">'+LB30_WEEKS.map(function(x,i){
    var got=done>=x.to;
    return '<div class="wl-badge'+(got?' on':'')+'"><div class="m">'+(got?ic('medal'):ic('lock'))+'</div>'+
      '<b>'+x.n+'</b><span>'+(got?'Diperoleh':'Hari '+x.to)+'</span></div>';
  }).join('')+'</div>';
  return h;
}

/* ── start here ── */
function lbGuide(){
  var h=LB30_SETH.intro?lbVideoCard(LB30_SETH.intro,'Intro program bersama Coach Seth'):'';
  h+='<div class="lb-safe">'+ic('warning')+'<div><div class="t">Sebelum anda mula</div>'+
    '<div class="s">Jika anda baru bersalin (kurang 6 minggu), selepas pembedahan caesarean, hamil, atau ada masalah kesihatan, '+
    'dapatkan nasihat doktor sebelum mula.</div></div></div>';
  h+=fsec('Cara Ia Berfungsi','');
  h+='<div class="wl-steps">'+[
    ['Hari 1: check-in, kemudian fit test','Rekod berat, pinggang dan pinggul dahulu. Fit test impak rendah selepas itu — boleh dilangkau.'],
    ['Satu workout setiap hari','Maksimum 20 minit, tanpa lompat. Atau pecah 2 × 10 minit, pagi dan petang.'],
    ['Senarai semak harian','Workout, langkah, air, misi pemakanan, makan ikut pelan, tidur.'],
    ['Hari 15 & 30: check-in semula','Berat, pinggang, pinggul dan gambar. Hari 30, ulang fit test.']]
    .map(function(s,i){ return '<div class="wl-step"><span class="n">'+(i+1)+'</span><div><div class="t">'+s[0]+'</div><div class="m">'+s[1]+'</div></div></div>'; }).join('')+'</div>';
  h+=fsec('Apa Yang Anda Perlukan','Tiada apa yang perlu dibeli.');
  h+='<div class="wl-kit">'+[['mat','Tikar atau tuala'],['home','Sedikit ruang & dinding'],['bottle','Botol air minum'],['clock','20 minit sehari']]
    .map(function(k){ return '<div><span class="wl-kic">'+glyph(k[0])+'</span><span>'+k[1]+'</span></div>'; }).join('')+'</div>';
  h+=fsec('Empat Minggu','');
  h+='<div class="wl-phases">'+LB30_WEEKS.map(function(p,i){ return '<div><b>Minggu '+(i+1)+': '+p.n+'</b><span>Hari '+p.from+'–'+p.to+'</span><small>'+p.s+'</small></div>'; }).join('')+'</div>';
  h+=fsec('Peraturan','');
  h+='<div class="wl-tips">'+[
    'Ikut susunan hari. Tertinggal satu? Buat hari ini — pelan menunggu anda.',
    'Tiada lompatan. Senyap untuk rumah teres, apartmen, dan anak yang sedang tidur.',
    'Timbang hanya pada Hari 1, 15 dan 30. Nombor harian naik turun dan tidak banyak makna.',
    'Langkah naik setiap minggu, 4,000 hingga 10,000. Air dari 2.0 hingga 2.5 liter.',
    'Sakit pada sendi tanda berhenti. Otot rasa terbakar tidak.']
    .map(function(t){ return '<div>'+t+'</div>'; }).join('')+'</div>';
  h+=fsec('Soalan','');
  h+='<div class="wl-faq">'+[
    ['Saya tertinggal sehari.','Teruskan dari hari anda sekarang. Tiga puluh workout matlamatnya, bukan tiga puluh tarikh berturut-turut.'],
    ['Tak ada masa 20 minit.','Hidupkan "Pecah kepada 2 × 10 minit" pada halaman hari: separuh gerakan pagi, separuh petang.'],
    ['Terlalu susah.','Kurangkan julat gerakan, rehat lebih lama. Habis perlahan lebih baik daripada berhenti.'],
    ['Berapa lama saya boleh simpan?','Selamanya. Bayar sekali, tiada langganan. Ulang bila-bila masa.']]
    .map(function(q){ return '<details><summary>'+q[0]+'</summary><div>'+q[1]+'</div></details>'; }).join('')+'</div>';
  if(typeof COACH_WA!=='undefined' && COACH_WA)
    h+='<button class="bigbtn sec" onclick="window.open(\'https://wa.me/'+COACH_WA+'\',\'_blank\',\'noopener\')">'+glyph('people')+'Tanya Coach di WhatsApp</button>';
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
    '<button class="bigbtn lb-btn" onclick="startCheckout(\'prog_'+LB30_ID+'\')">Beli RM'+LB30_PRICE+'</button>'+
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
    '<div class="wl-poster-b"><div class="tx"><div class="k">Hari '+(nx+1)+' · '+lbMinutes(d)+' min</div>'+
    '<div class="t">'+d.n+'</div><div class="pbar lb-bar"><i style="width:'+pct+'%"></i></div></div>'+
    '<button class="bigbtn lb-btn" onclick="event.stopPropagation();lbOpenDay('+nx+')">'+glyph('play')+'Mula Hari '+(nx+1)+'</button></div></div>';
}
