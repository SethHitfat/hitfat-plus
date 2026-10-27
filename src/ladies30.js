/* ═══════════════ MAK2FIT 30 ═══════════════
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
     · Malay home-cooking menus with three options per meal, for 3 to 6
       meals a day, without what she doesn't eat, her rice measured.

   Placeholders, to be filled when Seth sends them, live in one place each:
     LB30_NAME            the program's name
     LB30_DAYS[].ex       the 30 days of movements (no jumping): the
                          template her own plan is built from (lbDayFor)
     LB30_MENU            the Malay menus
     LB30_SETH            Coach Seth's videos (intro, every week, nutrition)
     LB30_DEMO            the hijab demonstration videos, by movement name
                          (until then each move plays its HITFAT library clip)
     LB30_POSTER          the poster (a woman in hijab, modest clothing)
   A Vimeo value is 'id' or 'id/hash' (an unlisted video).

   ES5 only in this file (var, function, no arrows or template strings),
   as the brief for this program asks. */

var LB30_NAME='MAK2FIT 30';                 /* nama sementara: tukar di sini sahaja */
var LB30_SUB='30 Hari Bakar Lemak · Khas Wanita';
var LB30_ID='lad4';                             /* the SKU is prog_lad4 */
var LB30_KEY='lb30';                            /* its data, its session keys */
var LB30_PRICE=39;
var LB30_POSTER='';                             /* gambar poster: model berhijab, akan datang */
var LB30_COVER='/ladies/img/lb-cover.jpg';         /* the cover: her photograph on HITFAT red */
var LB30_ACCENT='#C02A7C';             /* magenta, her program's own colour (25 Oct, Seth: "warna magenta aku nk") */
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
/* the notes that name a move, a round count or the longest day hold only
   for the template; once her plan has changed that day (25 Oct 2026), a note
   whose subject is not in her day gives way to one that fits any day.
   gi: [is it still true of her day?, the note instead] */
var LB30_LUNGE=['Reverse Lunges','Curtsy Lunges','Side Lunges','Walking Lunges','Alternating Lunges'];
var LB30_TIP_IF={
  7: [function(d){ return d.r>=3; }, 'Minggu kedua bermula. Rehat bila pemasa kata, bukan sebelum.'],
  9: [function(d){ return lbHasMove(d,['Mountain Climber']); }, 'Gerak berterusan tanpa lompat. Senyap, tetapi bertenaga.'],
  11:[function(d){ return lbHasMove(d,['Knee Push Ups']); }, 'Bentuk dahulu, laju kemudian. Turun perlahan, naik dengan kuat.'],
  15:[function(d){ return lbHasMove(d,LB30_LUNGE.concat(['Single Leg Glutes Bridge','Single Leg Calf Raises'])); }, 'Gerakan yang perlahan dan terkawal lebih berkesan daripada yang laju.'],
  16:[function(d){ return lbHasMove(d,['Russian Twist','Bicycle Crunch']); }, 'Teras hari ini. Tarik pusat ke arah tulang belakang, dan terus bernafas.'],
  19:[function(d){ return lbHasMove(d,['Hip Thrust','Single Leg Glutes Bridge','Chair Glute Bridge','Bottle Hip Thrust','Towel Glute Bridge']); }, 'Rasa otot yang bekerja di setiap ulangan. Turun perlahan.'],
  21:[function(d){ return lbHasMove(d,['Push Up']); }, 'Minggu terakhir. Buat setiap ulangan dengan bentuk terbaik anda.'],
  23:[function(d){ return lbHasMove(d,LB30_LUNGE); }, 'Tahan sekejap di bahagian paling susah setiap gerakan. Di situ otot paling bekerja.'],
  27:[function(d){ var m=0; for(var i=0;i<LB30_DAYS.length;i++) if(LB30_DAYS[i].k==='work') m=Math.max(m,lbMinutes(lbDay(i))); return lbMinutes(d)>=m; },
      'Satu sesi penuh lagi sebelum hari terakhir. Habiskan dengan kuat.']
};
function lbHasMove(d,names){ return d.ex.some(function(n){ return names.indexOf(n)>=0; }); }
/* the coach's note for her day */
function lbTip(gi){ var c=LB30_TIP_IF[gi]; return c && lbMe() && !c[0](lbDay(gi)) ? c[1] : LB30_TIPS[gi]; }

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
   Each day shows three of each meal's dishes, picked by the day; kcal is for
   the portion shown. Seth can still swap in his own list here.
   25 Oct 2026, her own menu:
   Every dish says what is in it, so her answers can take it off her menu:
   x: ikan · laut (udang, sotong, belacan) · daging · santan · pedas · susu ·
   telur · kacang. b:1 she can buy it at a kedai or warung. ra: the rice in
   the dish, in fists (genggam, about 200 kcal each), written {nasi} in its
   items; her own rice is worked out from her target for that meal.
   The first ten of breakfast, lunch and dinner keep their photographs
   (ladies/img/menu/d01-d30.jpg); the rest have theirs in n01-n34.
   kcal are estimates for the portions written. */
var LB30_MENU={
  sarapan:{label:'Breakfast', time:'7:00 am', share:0.25, note:'Cepat, untuk ibu yang bekerja', opts:[
    {n:'Telur rebus & roti mil penuh', k:350, x:'telur', it:['2 biji telur rebus','2 keping roti mil penuh','Teh o kurang manis']},
    {n:'Oat susu & pisang',            k:330, x:'susu', it:['Oat dimasak dengan susu rendah lemak','1 biji pisang']},
    {n:'Nasi lemak separuh',           k:420, x:'santan pedas telur laut', b:1, it:['Nasi lemak, separuh pinggan','1 biji telur rebus','Timun','Sambal, sedikit']},
    {n:'Roti telur',                   k:330, x:'telur', it:['2 keping roti mil penuh','Telur dadar 1 biji','Kopi o kosong']},
    {n:'Bihun goreng kurang minyak',   k:400, x:'telur', b:1, it:['Bihun goreng, 1 genggam','1 biji telur mata','Sayur sawi']},
    {n:'Lempeng pisang & telur',       k:360, x:'telur', it:['2 keping lempeng pisang kecil','1 biji telur rebus','Teh o kosong']},
    {n:'Bubur nasi ayam',              k:340, b:1, it:['Bubur nasi ayam, 1 mangkuk','Hirisan halia & daun bawang','Teh o kosong']},
    {n:'Ubi rebus & telur',            k:320, x:'telur', it:['Ubi kayu rebus, 1 genggam','1 biji telur rebus','Kopi o kosong']},
    {n:'Tosai & kuah sambar',          k:350, b:1, it:['2 keping tosai','Kuah sambar','Teh o kurang manis']},
    {n:'Roti canai kosong & dal',      k:380, b:1, it:['1 keping roti canai kosong','Kuah dal, sedikit','Teh o kosong']},
    {n:'Mihun sup',                    k:320, b:1, it:['Mihun sup, 1 mangkuk','Ayam carik, sedikit','Teh o kosong']},
    {n:'Sandwic tuna',                 k:340, x:'ikan', it:['2 keping roti mil penuh','Tuna dalam air, 3 sudu','Timun & salad']},
    {n:'Pancake oat pisang',           k:330, x:'telur susu', it:['Pancake: oat, 1 biji pisang, 1 biji telur','Susu rendah lemak, 1 gelas']},
    {n:'Nasi impit & kuah kacang',     k:380, x:'kacang', b:1, it:['Nasi impit, 5 ketul','Kuah kacang, 2 sudu','Timun']}
  ]},
  tengahari:{label:'Lunch Box', time:'1:00 pm', share:0.40, note:'Bekal dari rumah', opts:[
    {n:'Ayam masak kicap',             k:500, ra:1, it:['Nasi putih, {nasi}','Ayam masak kicap, 1 tapak tangan','Sayur campur, 2 genggam']},
    {n:'Ikan bakar & kangkung',        k:480, ra:1, x:'ikan', it:['Nasi perang, {nasi}','Ikan bakar, 1 tapak tangan','Kangkung tumis']},
    {n:'Mi sup ayam',                  k:430, b:1, it:['Mi kuning, 1 genggam','Ayam carik, 1 tapak tangan','Sup sayur']},
    {n:'Telur dadar sayur',            k:450, ra:1, x:'telur pedas', it:['Nasi putih, {nasi}','Telur dadar sayur 2 biji','Sambal timun']},
    {n:'Daging masak merah',           k:520, ra:1, x:'daging pedas', it:['Nasi putih, {nasi}','Daging masak merah, kuah sedikit','Sawi tumis']},
    {n:'Nasi goreng kampung',          k:520, ra:1, x:'telur pedas ikan', b:1, it:['Nasi goreng kampung kurang minyak, {nasi}','1 biji telur mata','Timun']},
    {n:'Ayam percik & ulam',           k:510, ra:1, x:'santan pedas', b:1, it:['Nasi putih, {nasi}','Ayam percik tanpa kulit, 1 tapak tangan','Ulam & timun']},
    {n:'Sup daging & sayur',           k:480, ra:1, x:'daging', it:['Nasi putih, {nasi}','Sup daging, isi 1 tapak tangan','Kobis goreng sedikit minyak']},
    {n:'Ikan masak lemak cili api',    k:510, ra:1, x:'ikan santan pedas', it:['Nasi putih, {nasi}','Ikan masak lemak, kuah sedikit','Kacang buncis goreng']},
    {n:'Nasi kerabu & ikan bakar',     k:500, ra:1, x:'ikan pedas laut', b:1, it:['Nasi kerabu, {nasi}','Ikan bakar, 1 tapak tangan','Ulam & kerabu, sambal sedikit']},
    {n:'Nasi campur pilihan',          k:540, ra:1, b:1, it:['Nasi putih, {nasi}','Ayam goreng tanpa kulit, 1 ketul','2 jenis sayur, bukan bersantan']},
    {n:'Nasi ayam & sup',              k:540, ra:1, b:1, it:['Nasi ayam, {nasi}','Ayam panggang tanpa kulit, 1 tapak tangan','Sup & timun']},
    {n:'Kuey teow sup',                k:420, x:'ikan', b:1, it:['Kuey teow sup, 1 mangkuk','Bebola ikan & ayam carik','Sayur sawi']},
    {n:'Bihun tomyam ayam',            k:430, x:'pedas', b:1, it:['Bihun tomyam, 1 mangkuk','Ayam, 1 tapak tangan','Sayur & cendawan']},
    {n:'Tempe & tauhu sambal',         k:480, ra:1, x:'pedas', it:['Nasi putih, {nasi}','Tempe & tauhu sambal, 1 tapak tangan','Sayur campur']}
  ]},
  malam:{label:'Family Dinner', time:'7:30 pm', share:0.35, note:'Makan bersama keluarga', opts:[
    {n:'Asam pedas ikan',              k:480, ra:1, x:'ikan pedas', it:['Nasi putih, {nasi}','Ikan asam pedas, 1 tapak tangan','Bayam tumis']},
    {n:'Sup ayam & tempe',             k:450, ra:0.5, it:['Sup ayam dengan sayur','Nasi, {nasi}','Tempe bakar']},
    {n:'Ayam panggang & ulam',         k:480, ra:1, x:'pedas laut', it:['Nasi putih, {nasi}','Ayam panggang tanpa kulit','Ulam & sambal belacan']},
    {n:'Ikan kukus halia',             k:450, ra:1, x:'ikan', it:['Nasi putih, {nasi}','Ikan kukus halia','Sawi tumis']},
    {n:'Gulai ayam',                   k:520, ra:1, x:'santan pedas', it:['Nasi putih, {nasi}','Gulai ayam, kuah sedikit','Timun & tomato']},
    {n:'Tauhu sumbat & sup sayur',     k:430, ra:0.5, it:['Nasi, {nasi}','Tauhu sumbat 2 keping','Sup sayur']},
    {n:'Ayam masak halia',             k:460, ra:1, it:['Nasi putih, {nasi}','Ayam masak halia, 1 tapak tangan','Kailan tumis']},
    {n:'Sotong sambal kurang minyak',  k:470, ra:1, x:'laut pedas', it:['Nasi putih, {nasi}','Sotong sambal, 1 tapak tangan','Kacang panjang goreng']},
    {n:'Telur bistik & sayur',         k:450, ra:0.5, x:'telur', it:['Nasi, {nasi}','Telur bistik 2 biji','Sayur campur']},
    {n:'Udang masak merah',            k:480, ra:1, x:'laut pedas', it:['Nasi putih, {nasi}','Udang masak merah, 1 tapak tangan','Taugeh goreng']},
    {n:'Ayam masak lemak cili padi',   k:520, ra:1, x:'santan pedas', it:['Nasi putih, {nasi}','Ayam masak lemak, kuah sedikit','Ulam timun']},
    {n:'Daging masak kicap',           k:500, ra:1, x:'daging', it:['Nasi putih, {nasi}','Daging masak kicap, 1 tapak tangan','Kobis tumis']},
    {n:'Sayur lodeh & tempe',          k:450, ra:0.5, x:'santan', it:['Nasi, {nasi}','Sayur lodeh, 1 mangkuk','Tempe goreng 2 keping']},
    {n:'Ikan bawal bakar & air asam',  k:470, ra:1, x:'ikan pedas', it:['Nasi putih, {nasi}','Ikan bawal bakar, 1 ekor kecil','Air asam & ulam']},
    {n:'Telur kukus & sup sayur',      k:400, ra:0.5, x:'telur', it:['Nasi, {nasi}','Telur kukus 2 biji','Sup sayur campur']}
  ]},
  /* snacks: one list for the morning and the afternoon, a lighter one at night */
  pagi:{label:'Morning Snack', time:'10:00 am', note:'Kecil, supaya tak lapar sangat waktu tengah hari', opts:null},
  petang:{label:'Tea Time', time:'4:30 pm', note:'Ganti goreng pisang petang', opts:null},
  lewat:{label:'Supper', time:'9:30 pm', note:'Ringan, sekurang-kurangnya sejam sebelum tidur', opts:[
    {n:'Susu suam rendah lemak',       k:110, x:'susu', it:['Susu rendah lemak, 1 gelas']},
    {n:'Epal',                         k:80,  it:['1 biji epal']},
    {n:'Oat & kurma',                  k:140, it:['Oat, 3 sudu, dimasak dengan air','1 biji kurma']},
    {n:'Yogurt asli',                  k:100, x:'susu', it:['Yogurt asli, 1 cawan kecil']},
    {n:'Bubur kacang hijau tanpa santan', k:150, it:['Bubur kacang hijau, separuh mangkuk','Gula sedikit, tanpa santan']},
    {n:'Telur rebus & timun',          k:90,  x:'telur', it:['1 biji telur rebus','Timun']},
    {n:'Pisang',                       k:90,  it:['1 biji pisang kecil']},
    {n:'Susu soya tanpa gula',         k:100, it:['Susu soya tanpa gula, 1 gelas']}
  ]}
};
var LB30_SNACKS=[
  {n:'Pisang & kacang tanah',          k:170, x:'kacang', it:['1 biji pisang','Kacang tanah, 1 genggam kecil']},
  {n:'Yogurt asli & betik',            k:150, x:'susu', it:['Yogurt asli, 1 cawan kecil','Betik potong, 1 genggam']},
  {n:'Epal & susu',                    k:170, x:'susu', it:['1 biji epal','Susu rendah lemak, 1 gelas']},
  {n:'Kurma & air kosong',             k:110, it:['3 biji kurma','Segelas air kosong']},
  {n:'Jambu batu & telur rebus',       k:140, x:'telur', it:['Jambu batu, separuh biji','1 biji telur rebus']},
  {n:'Jagung rebus',                   k:150, b:1, it:['Jagung rebus, 1 tongkol','Teh o kosong']},
  {n:'Ubi keledek rebus',              k:150, it:['Ubi keledek rebus, 1 genggam','Teh o kosong']},
  {n:'Biskut kraker & teh o',          k:130, it:['3 keping biskut kraker','Teh o kurang manis']},
  {n:'Sebiji kuih & teh o kosong',     k:160, x:'santan', b:1, it:['1 biji kuih muih','Teh o kosong']},
  {n:'Roti mil & mentega kacang',      k:190, x:'kacang', it:['1 keping roti mil penuh','Mentega kacang, 1 sudu teh']},
  {n:'Tembikai & badam',               k:150, x:'kacang', it:['Tembikai, 1 mangkuk','Badam, 10 biji']},
  {n:'Air kelapa & buah naga',         k:120, b:1, it:['Air kelapa muda, 1 gelas','Buah naga, separuh biji']}
];
LB30_MENU.pagi.opts=LB30_SNACKS; LB30_MENU.petang.opts=LB30_SNACKS;
/* the photographs of the dishes added on 25 Oct, made with ChatGPT in the
   style of the first thirty as four 3x3 grids, in this order: breakfast 11-14,
   lunch 11-15, dinner 11-15, the twelve snacks, the eight suppers (n01-n34) */
(function(){ var n=1;
  [[LB30_MENU.sarapan.opts,10],[LB30_MENU.tengahari.opts,10],[LB30_MENU.malam.opts,10],[LB30_SNACKS,0],[LB30_MENU.lewat.opts,0]].forEach(function(x){
    for(var i=x[1];i<x[0].length;i++){ x[0][i].img='/ladies/img/menu/n'+(n<10?'0':'')+n+'.jpg'; n++; } });
})();
var LB30_SLOTS=['sarapan','tengahari','malam'];   /* before her answers: three meals */
/* her meals a day, each with its share of her target */
var LB30_MEALS={
  3:[['sarapan',0.30],['tengahari',0.38],['malam',0.32]],
  4:[['sarapan',0.25],['tengahari',0.33],['petang',0.12],['malam',0.30]],
  5:[['sarapan',0.22],['pagi',0.10],['tengahari',0.30],['petang',0.10],['malam',0.28]],
  6:[['sarapan',0.20],['pagi',0.09],['tengahari',0.27],['petang',0.09],['malam',0.25],['lewat',0.10]]
};

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

/* ═══ her own plan (25 Oct 2026, Seth: "personalized … setiap orang dapat
   training yang berbeza … diet yang berbeza") ═══
   After she buys it and before Day 1 she answers a short questionnaire, and
   the 30 days are rebuilt from her answers. LB30_DAYS stays the template;
   lbDayFor(gi) is what she does:
     · her level sets the rounds, the seconds of work and the step on each
       ladder (wall → knee → floor push-up, chair → floor squat);
     · a sore knee, lower back or wrist, or a birth in the last year, swaps
       the moves that load it for ones that don't, from the same filmed
       library; a pregnancy stops the questionnaire (not built for it);
     · her minutes cap every day (rounds first, then moves);
     · her focus turns one day a week to it;
     · a chair or two bottles bring their moves in;
     · her own activity and pace set the calorie target.
   Only questions that change something are asked, and her plan's summary
   lists only the changes that happened. Day 1 and Day 30 (the fit test)
   keep the same moves and seconds so the two can be compared. */
var LB30_Q=[
  {k:'level', t:'Bagaimana anda bersenam sekarang?', s:'Jujur, pelan anda bermula di sini.', o:[
    ['baru','Baru mula','Tak bersenam, atau sudah lama berhenti','sunrise'],
    ['pernah','Kadang-kadang','Bersenam sekali-sekala','steps'],
    ['aktif','Aktif','Bersenam 2–3 kali seminggu atau lebih','flame']]},
  {k:'pain', multi:true, t:'Ada bahagian yang selalu sakit?', s:'Kami tukar gerakan yang membebankannya. Pilih semua yang berkaitan.', o:[
    ['lutut','Lutut','Sakit bila naik tangga atau mencangkung','person'],
    ['belakang','Belakang bawah','Sakit bila membongkok atau baring lama','person'],
    ['tangan','Pergelangan tangan','Sakit bila menongkat badan dengan tangan','person'],
    ['tiada','Tiada','Badan saya okey','check']]},
  {k:'mom', t:'Ada yang perlu kami tahu?', s:'Supaya pelan anda selamat.', o:[
    ['tidak','Tiada','','check'],
    ['bersalin','Bersalin dalam 12 bulan lepas','','heart'],
    ['hamil','Sedang mengandung','','heart']]},
  {k:'mins', t:'Berapa minit sehari anda ada?', s:'Setiap sesi tidak akan melebihi masa ini.', o:[
    [10,'10 minit','Waktu sibuk, sesi pendek','clock'],
    [15,'15 minit','Sederhana','clock'],
    [20,'20 minit','Paling banyak hasil','clock']]},
  {k:'fact', f:'minit'},
  {k:'focus', t:'Mana yang paling anda mahu ubah?', s:'Satu hari seminggu jadi khas untuknya.', o:[
    ['semua','Seluruh badan','Seimbang, semua bahagian','person'],
    ['perut','Perut & pinggang','Teras yang kuat dan pinggang','target'],
    ['punggung','Punggung & paha','Punggung yang padat, kaki yang kuat','flame'],
    ['postur','Postur & lengan','Bahu, belakang dan lengan','workout']]},
  {k:'equip', multi:true, t:'Apa yang ada di rumah?', s:'Tiada pun tak apa. Tuala dan dinding sudah cukup.', o:[
    ['kerusi','Kerusi yang kukuh','Untuk squat dan sokongan','chair'],
    ['botol','Dua botol air','Penuh, sebagai pemberat ringan','bottle'],
    ['tiada','Tiada','Badan sendiri sahaja','home']]},
  {k:'fact', f:'tabiat'},
  {k:'body', t:'Badan anda sekarang', s:'Untuk sasaran kalori anda. Disimpan dalam akaun anda sahaja.'},
  {k:'act', t:'Hari biasa anda…', s:'Selain senaman. Ini mengubah sasaran kalori anda.', o:[
    ['duduk','Banyak duduk','Kerja pejabat, memandu, di rumah','laptop'],
    ['ringan','Banyak berdiri & berjalan','Urus rumah dan anak, kerja kedai','steps'],
    ['aktif','Kerja fizikal','Banyak mengangkat dan bergerak','workout']]},
  {k:'pace', t:'Rentak yang anda mahu', s:'Perlahan lebih mudah dikekalkan.', o:[
    ['perlahan','Perlahan & selesa','Lebih kurang 0.25 kg seminggu','leaf'],
    ['sederhana','Sederhana','Lebih kurang 0.5 kg seminggu','flame']]},
  {k:'fact', f:'jangka'},
  {k:'meals', t:'Berapa kali anda makan sehari?', s:'Termasuk snek. Menu anda ikut cara anda makan.', o:[
    [3,'3 kali','Sarapan, tengah hari, malam','food'],
    [4,'4 kali','Tambah minum petang','food'],
    [5,'5 kali','Tambah minum pagi dan petang','food'],
    [6,'6 kali','Tambah snek malam','food']]},
  {k:'avoid', multi:true, grid:true, t:'Ada makanan yang anda tak makan?', s:'Kami keluarkan dari menu anda. Pilih semua yang berkaitan.', o:[
    ['ikan','Ikan','','food'],['laut','Udang & sotong','','food'],['daging','Daging lembu','','food'],['santan','Santan','','bottle'],
    ['pedas','Pedas','','flame'],['susu','Susu & yogurt','','bottle'],['telur','Telur','','food'],['kacang','Kacang','','leaf'],
    ['tiada','Semua boleh','','check']]},
  {k:'cook', t:'Siapa yang sediakan makanan anda?', s:'Supaya menu anda sesuai dengan hari anda.', o:[
    ['sendiri','Saya masak sendiri','Bawa bekal ke tempat kerja','home'],
    ['keluarga','Saya masak untuk keluarga','Satu masakan untuk seisi rumah','people'],
    ['beli','Kebanyakannya beli','Kedai, warung, kafe pejabat','bag']]}
];
var LB30_MEAL_MS={sarapan:'sarapan',pagi:'minum pagi',tengahari:'makan tengah hari',petang:'minum petang',malam:'makan malam',lewat:'snek malam'};
var LB30_AVOID={ikan:'ikan',laut:'udang & sotong',daging:'daging lembu',santan:'santan',pedas:'pedas',susu:'susu',telur:'telur',kacang:'kacang'};
var LB30_ACT={duduk:1.2, ringan:1.375, aktif:1.55};
var LB30_PACE={perlahan:0.25, sederhana:0.5};
var LB30_SECS={baru:30, pernah:40, aktif:45};
var LB30_FOCUS={perut:['Perut & Pinggang',[3,10,16,25]], punggung:['Punggung & Paha',[2,8,15,23]], postur:['Postur & Lengan',[4,11,18,26]]};
var LB30_FLEX=[5,9,19,22];                       /* one day a week that turns to her focus */
/* what loads a sore part, or a body after birth, and what replaces it;
   '|kerusi' or '|botol' needs that at home */
var LB30_SWAP={
  lutut:{from:['Bodyweight Squat','Squat Pulse','Squat Pulse 2','Squat Pause','Squat Hold','Reverse Lunges','Walking Lunges',
               'Alternating Lunges','Curtsy Lunges','Side Lunges','Wall Sit','Chair Squat','Step Up Box or Chair','Bulgarian Split Squat'],
         to:['Hip Thrust','Single Leg Glutes Bridge','Chair Assist Hip Abduction|kerusi','Chair Kick Back|kerusi','Bottle Hip Thrust|botol',
             'Towel Glute Bridge','Towel Deadlift','Calf Raises','Single Leg Calf Raises','Dead Bug']},
  belakang:{from:['Leg Raises','Flutter Kick','Russian Twist','Sit Up','Hollow Hold','Bicycle Crunch','V Sit Squat','Reverse Crunch'],
         to:['Dead Bug','Bird Dog','Side Plank','Plank','Single Leg Glutes Bridge','Hip Thrust','Calf Raises']},
  tangan:{from:['Wall Push Up','Knee Push Ups','Push Up','Push Up Hold','Plank Shoulder Taps','Mountain Climber','Bird Dog','Bear Walk','Incline Push Up (Chair)'],
         to:['Bottle Shoulder Press|botol','Bottle Upright Row|botol','Bottle Front Raises|botol','Towel Shoulder Back Pull','Towel Upright Row',
             'Towel Front Raises','Dead Bug','Crunch','Hip Thrust','Wall Sit']},
  bersalin:{from:['Crunch','Sit Up','Bicycle Crunch','Russian Twist','Leg Raises','Flutter Kick','Hollow Hold','V Sit Squat','Reverse Crunch',
               'Plank Shoulder Taps','Mountain Climber','Push Up','Side Plank'],
         to:['Dead Bug','Bird Dog','Hip Thrust','Single Leg Glutes Bridge','Chair Glute Bridge|kerusi','Knee Push Ups','Wall Push Up','Calf Raises']}
};
/* her level's ladders: [from, to…, weeks it applies (wi below), or all] */
var LB30_LADDER={
  baru:[['Push Up',['Knee Push Ups']],['Knee Push Ups',['Wall Push Up'],2],['Push Up Hold',['Wall Push Up','Plank']],
        ['Squat Pause',['Bodyweight Squat']],['Bodyweight Squat',['Chair Squat|kerusi'],2],
        ['Walking Lunges',['Reverse Lunges','Squat Pulse']],['Alternating Lunges',['Reverse Lunges','Squat Pulse']],['Curtsy Lunges',['Reverse Lunges','Side Lunges']],
        ['Leg Raises',['Reverse Crunch','Dead Bug']],['Flutter Kick',['Dead Bug','Crunch']],['Hollow Hold',['Dead Bug','Plank']],
        ['Mountain Climber',['Seated High Knee|kerusi','Squat Pulse','Calf Raises']],['Plank Shoulder Taps',['Plank','Bird Dog']]],
  aktif:[['Wall Push Up',['Knee Push Ups']],['Knee Push Ups',['Push Up'],-2],['Bodyweight Squat',['Squat Pause'],-2]]
};
var LB30_BOTTLE=[['Push Up Hold','Bottle Shoulder Press'],['Plank Shoulder Taps','Bottle Upright Row']];

function lbMe(){ var m=lbData().me; return m&&m.done ? m : null; }
function lbHas(me,k,v){ return (me[k]||[]).indexOf(v)>=0; }
function lbInDB(n){ for(var i=0;i<DB.length;i++) if(DB[i].n===n) return true; return false; }
/* the first candidate she can do: filmed, not already in the day, her
   equipment, and not loading anything she said hurts; off turns the list
   round so the days don't all get the same one */
function lbPick(cands,me,used,off){
  for(var k=0;k<cands.length;k++){
    var c=cands[(k+(off||0))%cands.length].split('|'), n=c[0], need=c[1];
    if(need && !lbHas(me,'equip',need)) continue;
    if(used.indexOf(n)>=0 || !lbInDB(n)) continue;
    if(lbBlocked(n,me)) continue;
    return n;
  }
  return null;
}
function lbParts(me){ var p=(me.pain||[]).filter(function(x){ return LB30_SWAP[x]; }); if(me.mom==='bersalin') p.push('bersalin'); return p; }
function lbBlocked(n,me){ return lbParts(me).some(function(p){ return LB30_SWAP[p].from.indexOf(n)>=0; }); }
/* one day, rebuilt for her; log (optional) counts what changed and why */
function lbDayFor(gi,log){
  var t=LB30_DAYS[gi], me=lbMe(); if(!t||!me) return t;
  var wi=lbWeekOf(gi), name=t.n, src=t, r=t.r, i;
  if(t.k==='work' && LB30_FOCUS[me.focus] && LB30_FLEX.indexOf(gi)>=0){
    src=LB30_DAYS[LB30_FOCUS[me.focus][1][wi]]; name='Focus: '+LB30_FOCUS[me.focus][0];
    if(log) log.focus=(log.focus||0)+1;
  }
  var ex=[], note=function(k){ if(log) log[k]=(log[k]||0)+1; };
  /* a replacement is never a move the day already has, nor one still to come */
  var taken=function(){ return ex.concat(src.ex); };
  src.ex.forEach(function(n0){
    var n=n0;
    /* her level first: the step on the ladder (the fit test keeps its moves) */
    if(t.k==='work') (LB30_LADDER[me.level]||[]).forEach(function(l){
      if(l[0]!==n) return;
      if(l[2]>0 && wi>=l[2]) return; if(l[2]<0 && wi< -l[2]) return;
      var p=lbPick(l[1],me,taken()); if(p){ n=p; note('level'); }
    });
    if(t.k==='work' && lbHas(me,'equip','botol')) LB30_BOTTLE.forEach(function(b){ if(b[0]===n && taken().indexOf(b[1])<0){ n=b[1]; note('botol'); } });
    if(n==='Chair Squat') note('kerusi');
    /* then anything that hurts */
    lbParts(me).forEach(function(p){
      if(LB30_SWAP[p].from.indexOf(n)<0) return;
      var q=lbPick(LB30_SWAP[p].to,me,taken(),t.k==='test'?0:gi); if(q){ n=q; note(p); } else { n=''; note(p); }
    });
    if(n!==n0) note('swap');
    if(n && ex.indexOf(n)<0) ex.push(n);
  });
  /* her level: rounds and seconds (the fit test stays as it is) */
  var dur=null;
  if(t.k==='work'){
    dur=LB30_SECS[me.level]||null;
    if(me.level==='baru' && wi<2) r=Math.min(r,2);
    if(me.level==='aktif' && wi===0) r=3;
  }
  var d={n:name, k:t.k, r:r, ex:ex, dur:dur};
  /* her minutes: down to two rounds, then down to four moves, then one round */
  var cap=+me.mins||20;
  if(t.k!=='test'){
    while(lbMinutes(d)>cap && d.r>2) d.r--;
    while(lbMinutes(d)>cap && d.ex.length>4) d.ex=d.ex.slice(0,-1);
    while(lbMinutes(d)>cap && d.r>1) d.r--;
  }
  return d;
}
function lbDay(gi){ return lbDayFor(gi)||LB30_DAYS[gi]; }
/* the fit test, with her own moves where a sore part changed one */
function lbFitList(){
  var d=lbDay(0);
  return LB30_FIT.map(function(f,i){
    var n=d.ex[i]||f[1], e=null, j; for(j=0;j<DB.length;j++) if(DB[j].n===n){ e=DB[j]; break; }
    return [f[0], n, e&&e.t==='hold'?'secs':'reps'];
  });
}
/* her calorie target's inputs */
function lbAct(){ var me=lbMe(); return me&&LB30_ACT[me.act] || 1.375; }
function lbPace(){ return lbPaceOf(lbMe()); }
function lbPaceOf(me){ if(me&&me.feed) return 0.25; return me&&LB30_PACE[me.pace] || 0.5; }

/* ── the questionnaire: one question a screen ── */
var lbQ=-1, lbQA=null;
function lbQuizOpen(at){
  var me=lbData().me||{}, pr=lbProfile();
  lbQA=JSON.parse(JSON.stringify(me)); lbQA.wt=lbQA.wt||pr.wt||''; lbQA.ht=lbQA.ht||pr.ht||''; lbQA.age=lbQA.age||pr.age||'';
  lbQ=at||0; hidePanels(); $('progdetail').style.display='block'; renderLB30(); $('screen').scrollTop=0;
}
/* those who answered before the menu questions came: straight to them */
function lbQuizMenu(){ var i; for(i=0;i<LB30_Q.length;i++) if(LB30_Q[i].k==='meals') break; lbQuizOpen(i+1); }
function lbQuizBack(){ if(lbQ<=0){ lbQ=-1; renderLB30(); } else { lbQ--; renderLB30(); } $('screen').scrollTop=0; }
function lbQuizNext(){ lbQ++; renderLB30(); $('screen').scrollTop=0; }
function lbQPick(k,v,multi){
  if(multi){
    var l=lbQA[k]||[], i=l.indexOf(v);
    if(v==='tiada') l=i>=0?[]:['tiada'];
    else { l=l.filter(function(x){ return x!=='tiada'; }); if(i>=0) l.splice(l.indexOf(v),1); else l.push(v); }
    lbQA[k]=l; renderLB30(); return;
  }
  lbQA[k]=v; if(k==='mom' && v!=='bersalin'){ delete lbQA.clear; delete lbQA.feed; }
  if(k==='mom' && v!=='tidak'){ renderLB30(); return; }   /* a follow-up on the same screen */
  lbQuizNext();
}
function lbQTick(k){ lbQA[k]=!lbQA[k]; renderLB30(); }
function lbQBody(){
  var g=function(x){ return parseFloat(($(x)||{}).value); };
  var wt=g('lbq-wt'), ht=g('lbq-ht'), age=parseInt(($('lbq-age')||{}).value,10);
  if(!(wt>=30&&wt<=250) || !(ht>=120&&ht<=220) || !(age>=15&&age<=90)){ toast('Isi berat, tinggi dan umur'); return; }
  lbQA.wt=wt; lbQA.ht=ht; lbQA.age=age; lbQuizNext();
}
function lbQuizSave(){
  var d=lbData(); lbQA.done=true; lbQA.at=iso(0);
  d.me=lbQA; d.profile={wt:lbQA.wt, ht:lbQA.ht, age:lbQA.age};
  HF.save(); lbQ=-1; lbTab='plan'; lbWeek=-1; renderLB30(); $('screen').scrollTop=0; toast('Pelan anda sudah sedia');
}
/* the questions alone, without the facts between them */
function lbQCount(upto){ var c=0; for(var i=0;i<Math.min(upto,LB30_Q.length);i++) if(LB30_Q[i].k!=='fact') c++; return c; }
function lbQuiz(){
  var n=LB30_Q.length, qn=lbQCount(n), h='<div class="lbq">', isFact=lbQ>0&&lbQ<=n&&LB30_Q[lbQ-1].k==='fact';
  var bar='<div class="lbq-top"><button class="pdx-back" aria-label="Back" onclick="lbQuizBack()">'+glyph('chevleft')+'</button>'+
    '<div class="lbq-bar"><i style="width:'+Math.round(Math.min(lbQ,n)/n*100)+'%"></i></div><span class="lbq-n">'+(isFact?'':lbQCount(Math.min(lbQ,n))+'/'+qn)+'</span></div>';
  if(lbQ===0){
    var nm=((HF.data.prefs&&HF.data.prefs.name)||'').trim().split(/\s+/)[0];
    return h+bar+'<div class="lbq-intro'+(LB30_COVER?' cover':'')+'" style="background-image:url(\''+lbTopImg()+'\')"><div class="lbx-hero-ov"></div><div class="tx">'+
      '<div class="k">MAK2FIT 30</div><div class="t">Jom bina pelan 30 hari anda'+(nm?', '+hesc(nm):'')+'.</div></div></div>'+
      '<div class="lbq-p">'+qn+' soalan, lebih kurang 2 minit. Jawapan anda menentukan gerakan, pusingan, minit setiap hari dan sasaran kalori anda.</div>'+
      '<div class="lbq-list">'+[['person','Tahap anda dan bahagian yang sakit'],['clock','Masa yang anda ada'],['target','Bahagian yang mahu diubah'],['flame','Badan, aktiviti dan rentak'],['food','Cara anda makan']]
        .map(function(x){ return '<div><span>'+glyph(x[0])+'</span>'+x[1]+'</div>'; }).join('')+'</div>'+
      '<button class="lbx-go" onclick="lbQuizNext()">'+glyph('play')+'Mula</button></div>';
  }
  if(lbQ>n) return h+lbQuizResult()+'</div>';
  var q=LB30_Q[lbQ-1], v=lbQA[q.k];
  if(q.k==='fact') return h+bar+lbFact(q.f)+'<button class="lbx-go" onclick="lbQuizNext()">Seterusnya</button></div>';
  h+=bar+'<div class="lbq-q">'+hesc(q.t)+'</div>'+(q.s?'<div class="lbq-s">'+hesc(q.s)+'</div>':'');
  if(q.k==='body'){
    var fld=function(id,l,u,val,m){ return '<label class="esf"><span>'+l+'</span><input class="inp" id="'+id+'" inputmode="'+m+'" placeholder="0" value="'+(val||'')+'"><em>'+u+'</em></label>'; };
    return h+'<div class="esfields lbq-body">'+fld('lbq-wt','Berat','kg',lbQA.wt,'decimal')+fld('lbq-ht','Tinggi','cm',lbQA.ht,'decimal')+fld('lbq-age','Umur','tahun',lbQA.age,'numeric')+'</div>'+
      '<button class="lbx-go" onclick="lbQBody()">Seterusnya</button></div>';
  }
  h+='<div class="lbq-opts'+(q.grid?' grid':'')+'">'+q.o.map(function(o){
    var on=q.multi ? (v||[]).indexOf(o[0])>=0 : v===o[0];
    return '<button class="lbq-o'+(on?' on':'')+'" onclick="lbQPick(\''+q.k+'\','+(typeof o[0]==='number'?o[0]:'\''+o[0]+'\'')+(q.multi?',1':'')+')">'+
      '<span class="ic">'+glyph(o[3])+'</span><span class="tx"><b>'+hesc(o[1])+'</b>'+(o[2]?'<small>'+hesc(o[2])+'</small>':'')+'</span>'+
      '<span class="tk">'+(on?glyph('check'):'')+'</span></button>';
  }).join('')+'</div>';
  if(q.k==='mom' && v==='hamil'){
    return h+'<div class="lbq-warn">'+glyph('heart')+'<div><b>Tahniah.</b> MAK2FIT 30 tidak dibina untuk kehamilan: ia mengurangkan kalori, dan '+
      'gerakannya tidak disusun untuk badan yang mengandung. Simpan program ini sehingga selepas bersalin dan doktor membenarkan anda bersenam. '+
      'Program ini kekal dalam akaun anda.</div></div></div>';
  }
  if(q.k==='mom' && v==='bersalin'){
    h+='<div class="lbq-ticks">'+
      '<div class="obrow obtick'+(lbQA.clear?' on':'')+'" onclick="lbQTick(\'clear\')"><span class="box">'+(lbQA.clear?'✓':'')+'</span>'+
        '<span>Doktor sudah membenarkan saya bersenam (biasanya pada pemeriksaan 6 minggu selepas bersalin)</span></div>'+
      '<div class="obrow obtick'+(lbQA.feed?' on':'')+'" onclick="lbQTick(\'feed\')"><span class="box">'+(lbQA.feed?'✓':'')+'</span>'+
        '<span>Saya sedang menyusukan bayi</span></div></div>';
    return h+(lbQA.clear?'<button class="lbx-go" onclick="lbQuizNext()">Seterusnya</button>':'<div class="lbq-hint">Tunggu kebenaran doktor dahulu. Program ini kekal dalam akaun anda.</div>')+'</div>';
  }
  if(q.multi || (v!==undefined && v!==null && v!=='')) h+='<button class="lbx-go'+((v&&v.length)?'':' off')+'" onclick="'+((v&&v.length)?'lbQuizNext()':'')+'">Seterusnya</button>';
  return h+'</div>';
}
/* ── between the questions, what the research says (25 Oct 2026, Seth: in
   the style of Jeremy Ethier's app, "nampak educated research, siap ade
   graf"). Only claims with a source, each named under its chart; the
   habit curve is drawn as an illustration and says so; her estimate is
   her own pace and says it is not a promise. ── */
function lbFact(f){
  var a=lbQA||{}, h='<div class="lbq-fact"><div class="lbq-fk">'+glyph('lab')+'Tahukah anda?</div>';
  if(f==='minit'){
    var m=+a.mins||20;
    h+='<div class="lbq-q">Setiap minit dikira.</div>'+
      '<div class="lbq-chart">'+lbSplitSVG()+'</div>'+
      '<p>Garis panduan WHO 2020 tidak lagi menetapkan sekurang-kurangnya 10 minit setiap sesi: <b>semua pergerakan dikira</b>. Jadi 2 × 10 minit, pagi dan petang, sama nilainya dengan 20 minit sekali gus.</p>'+
      '<div class="lbq-you">'+glyph('clock')+'Pelan anda: '+m+' minit sehari, sekali gus atau dibahagi dua.</div>'+
      '<div class="lbq-src">Sumber: WHO Guidelines on Physical Activity and Sedentary Behaviour, 2020.</div>';
  } else if(f==='tabiat'){
    h+='<div class="lbq-q">Tabiat dibina, bukan dipaksa.</div>'+
      '<div class="lbq-chart">'+lbHabitSVG()+'</div>'+
      '<p>Dalam satu kajian University College London, purata masa untuk tabiat baharu menjadi automatik ialah <b>66 hari</b>, dan <b>tertinggal satu hari tidak menjejaskan prosesnya</b>. 30 hari ini membawa anda hampir separuh jalan.</p>'+
      '<div class="lbq-you">'+glyph('repeat')+'Tertinggal sehari? Pelan anda menunggu. Sambung esok.</div>'+
      '<div class="lbq-src">Sumber: Lally et al., European Journal of Social Psychology, 2010. Graf ialah ilustrasi.</div>';
  } else if(f==='jangka'){
    var wt=+a.wt||0, pace=a.feed?0.25:(LB30_PACE[a.pace]||0.5), end=Math.round((wt-pace*30/7)*10)/10;
    h+='<div class="lbq-q">Anggaran 30 hari anda.</div>'+
      (wt?'<div class="lbq-chart">'+lbProjSVG(wt,end)+'</div>':'')+
      '<p>Pada rentak '+(pace<0.5?'perlahan':'sederhana')+', sasaran anda <b>lebih kurang '+(Math.round(pace*30/7*10)/10)+' kg dalam 30 hari</b>. Garis panduan klinikal Malaysia menganggap 0.5 hingga 1 kg seminggu sebagai kadar yang selamat; lebih perlahan lebih mudah dikekalkan.</p>'+
      '<div class="lbq-you">'+glyph('measure')+'Ini anggaran, bukan janji. Berat naik turun setiap hari kerana air dan makanan, jadi ukur pinggang juga.</div>'+
      '<div class="lbq-src">Sumber: CPG Management of Obesity, Kementerian Kesihatan Malaysia, 2023.</div>';
  }
  return h+'</div>';
}
/* 20 minutes at once beside 10 + 10: the same height */
function lbSplitSVG(){
  return '<svg viewBox="0 0 300 150" role="img" aria-label="20 minit sekali sama dengan 10 tambah 10 minit">'+
    '<line x1="20" y1="122" x2="280" y2="122" class="ax"/>'+
    '<rect x="55" y="22" width="70" height="100" rx="10" class="b1"/><text x="90" y="77" class="in c">20</text>'+
    '<rect x="175" y="74" width="70" height="48" rx="10" class="b1"/><text x="210" y="103" class="in c">10</text>'+
    '<rect x="175" y="22" width="70" height="48" rx="10" class="b2"/><text x="210" y="51" class="in c">10</text>'+
    '<text x="90" y="142" class="lb c">sekali gus</text><text x="210" y="142" class="lb c">pagi + petang</text>'+
    '<text x="150" y="80" class="eq c">=</text></svg>';
}
/* automaticity rising and levelling: a missed day, then on; day 30 marked */
function lbHabitSVG(){
  var pts=[], x, y, d;
  for(d=0; d<=90; d+=3){ x=20+d/90*260; y=120-95*(1-Math.exp(-d/22)); if(d>=21&&d<24) y+=6; pts.push(x.toFixed(1)+','+y.toFixed(1)); }
  var x30=20+30/90*260, x66=20+66/90*260, x21=20+21/90*260, y21=120-95*(1-Math.exp(-21/22))+6;
  return '<svg viewBox="0 0 300 150" role="img" aria-label="Tabiat menjadi automatik dari masa ke masa">'+
    '<line x1="20" y1="122" x2="280" y2="122" class="ax"/><line x1="20" y1="20" x2="20" y2="122" class="ax"/>'+
    '<rect x="20" y="20" width="'+(x30-20).toFixed(1)+'" height="102" class="zone"/>'+
    '<polyline points="'+pts.join(' ')+'" class="ln"/>'+
    '<circle cx="'+x21.toFixed(1)+'" cy="'+y21.toFixed(1)+'" r="4" class="dot2"/><text x="'+(x21+8).toFixed(1)+'" y="'+(y21+26).toFixed(1)+'" class="sm" text-anchor="start">tertinggal sehari</text>'+
    '<line x1="'+x66.toFixed(1)+'" y1="20" x2="'+x66.toFixed(1)+'" y2="122" class="mk"/>'+
    '<text x="26" y="36" class="lb" text-anchor="start">30 hari anda</text>'+
    '<text x="'+(x66+5).toFixed(1)+'" y="114" class="lb" text-anchor="start">66 hari</text>'+
    '<text x="20" y="142" class="sm" text-anchor="start">Hari 1</text><text x="280" y="142" class="sm" text-anchor="end">Hari 90</text>'+
    '<text x="20" y="14" class="sm" text-anchor="start">↑ automatik</text></svg>';
}
/* her weight, today and an estimate on day 30, at her pace */
function lbProjSVG(a,b){
  var lo=Math.min(a,b)-0.8, hi=Math.max(a,b)+0.6, Y=function(v){ return 22+(hi-v)/(hi-lo)*96; };
  var pts=[1,8,15,22,30].map(function(d){ var v=a-(a-b)*(d-1)/29; return [20+(d-1)/29*250, Y(v)]; });
  return '<svg viewBox="0 0 300 150" role="img" aria-label="Anggaran berat dari '+a+' ke '+b+' kg dalam 30 hari">'+
    '<line x1="20" y1="122" x2="280" y2="122" class="ax"/>'+
    '<polyline points="'+pts.map(function(p){ return p[0].toFixed(1)+','+p[1].toFixed(1); }).join(' ')+'" class="ln dash"/>'+
    pts.map(function(p,i){ return '<circle cx="'+p[0].toFixed(1)+'" cy="'+p[1].toFixed(1)+'" r="'+(i===0||i===4?5:3)+'" class="'+(i===4?'dot':'dot2')+'"/>'; }).join('')+
    '<text x="'+pts[0][0]+'" y="'+(pts[0][1]-10).toFixed(1)+'" class="lb" text-anchor="start">'+a+' kg</text>'+
    '<text x="'+pts[4][0]+'" y="'+(pts[4][1]+22).toFixed(1)+'" class="lb hl" text-anchor="end">~'+b+' kg</text>'+
    '<text x="20" y="142" class="sm" text-anchor="start">Hari 1</text><text x="270" y="142" class="sm" text-anchor="end">Hari 30</text></svg>';
}
/* minutes a week in her plan, weeks 1 to 4 */
function lbWeeksSVG(mins){
  var mx=Math.max.apply(null,mins)||1;
  return '<svg viewBox="0 0 300 150" role="img" aria-label="Minit latihan seminggu, minggu 1 hingga 4">'+
    '<line x1="20" y1="122" x2="280" y2="122" class="ax"/>'+mins.map(function(m,i){ var hgt=Math.max(8,m/mx*92), x=34+i*64;
      return '<rect x="'+x+'" y="'+(122-hgt).toFixed(1)+'" width="40" height="'+hgt.toFixed(1)+'" rx="8" class="'+(i===3?'b1':'b2')+'"/>'+
        '<text x="'+(x+20)+'" y="'+(116-hgt).toFixed(1)+'" class="lb c">'+m+'</text><text x="'+(x+20)+'" y="142" class="sm c">'+LB30_WEEKS[i].n+'</text>'; }).join('')+'</svg>';
}
/* what her answers did: only the changes that really happened */
var LB30_SAYS={
  baru:'Bermula perlahan: 30 saat setiap gerakan, 2 pusingan untuk dua minggu pertama, dan versi yang lebih mudah seperti push-up dinding.',
  pernah:'40 saat setiap gerakan, naik ke 3 pusingan dari Minggu 2.',
  aktif:'45 saat setiap gerakan, 3 pusingan dari minggu pertama, dan push-up penuh di minggu akhir.',
  lutut:'Lutut selamat: squat dan lunge ditukar kepada gerakan punggung yang tidak membebankan lutut.',
  belakang:'Belakang selamat: tiada leg raise, sit-up atau pusingan badan; teras dilatih dengan dead bug, bird dog dan plank.',
  tangan:'Pergelangan tangan selamat: push-up dan gerakan menongkat tangan ditukar kepada gerakan berdiri dan baring.',
  bersalin:'Selepas bersalin: tiada crunch, sit-up atau leg raise; teras dibina semula dengan dead bug, bird dog dan bridge.',
  botol:'Dua botol air jadi pemberat untuk bahu dan lengan.',
  kerusi:'Squat ke kerusi pada minggu awal, lebih mudah untuk lutut dan imbangan.'
};
function lbQuizResult(){
  var keep=lbData().me; lbData().me=JSON.parse(JSON.stringify(lbQA)); lbData().me.done=true;
  var log={}, mins=0, gi, d, wk=[0,0,0,0], secs=45, r1=0, r4=0;
  for(gi=0;gi<LB30_DAYS.length;gi++){ d=lbDayFor(gi,log); wk[lbWeekOf(gi)]+=lbMinutes(d);
    if(d.k==='work'){ mins=Math.max(mins,lbMinutes(d)); if(d.dur) secs=d.dur; if(!r1) r1=d.r; r4=d.r; } }
  var swapped=log.swap||0;
  var me=lbData().me, tg=lbTarget(), nm=((HF.data.prefs&&HF.data.prefs.name)||'').trim().split(/\s+/)[0];
  var lunch=LB30_MEALS[me.meals] ? LB30_MEALS[me.meals].filter(function(m){ return m[0]==='tengahari'; })[0] : null;
  var rice=tg&&lunch ? lbFist(lbRice(LB30_MENU.tengahari.opts[0],tg.cal*lunch[1])).replace(' genggam','') : null;
  lbData().me=keep;
  var lines=[[me.level==='baru'?'sunrise':me.level==='aktif'?'flame':'steps', LB30_SAYS[me.level]]];
  ['lutut','belakang','tangan','bersalin'].forEach(function(k){ if(log[k]) lines.push(['heart',LB30_SAYS[k]]); });
  if(log.focus) lines.push(['target','Satu hari seminggu khas untuk '+LB30_FOCUS[me.focus][0].toLowerCase()+'.']);
  if(log.botol) lines.push(['bottle',LB30_SAYS.botol]);
  if(log.kerusi) lines.push(['chair',LB30_SAYS.kerusi]);
  if(me.cook==='beli') lines.push(['bag','Sarapan dan makan tengah hari dari pilihan yang mudah dibeli di kedai dan warung.']);
  /* the tags: what is safe, her focus, her kit */
  var wt=[];
  if(log.lutut) wt.push('Lutut selamat'); if(log.belakang) wt.push('Belakang selamat'); if(log.tangan) wt.push('Tangan selamat');
  if(log.bersalin) wt.push('Selepas bersalin'); if(log.focus) wt.push('Fokus '+LB30_FOCUS[me.focus][0].toLowerCase());
  if(log.botol) wt.push('Botol air'); if(log.kerusi) wt.push('Kerusi');
  var av=(me.avoid||[]).filter(function(a){ return LB30_AVOID[a]; }), mt=av.map(function(a){ return 'Tanpa '+LB30_AVOID[a]; });
  if(me.cook==='beli') mt.push('Mudah dibeli'); if(me.feed) mt.push('Menyusukan bayi');
  var stat=function(xs){ return '<div class="lbq-stats">'+xs.map(function(x){ return '<div><b>'+x[0]+'</b><span>'+x[1]+'</span></div>'; }).join('')+'</div>'; };
  var chips=function(xs){ return xs.length?'<div class="lbq-chips">'+xs.map(function(x){ return '<span>'+hesc(x)+'</span>'; }).join('')+'</div>':''; };
  var end=tg&&me.wt ? Math.round((me.wt-lbPaceOf(me)*30/7)*10)/10 : null;
  return '<div class="lbq-res"><div class="lbq-res-h'+(LB30_COVER?' cover':'')+'" style="background-image:url(\''+lbTopImg()+'\')"><div class="lbx-hero-ov"></div><div class="tx">'+
      '<div class="k">Pelan anda sudah sedia</div><div class="t">30 hari, dibina untuk '+(nm?hesc(nm):'anda')+'.</div></div></div>'+
    '<div class="lbq-card"><div class="lbq-ch">'+glyph('workout')+'<b>Workout anda</b><span>'+LB30_Q[0].o.filter(function(o){ return o[0]===me.level; })[0][1]+'</span></div>'+
      stat([[mins,'min sehari'],[secs,'saat / gerakan'],[(r1===r4?r1:r1+'→'+r4),'pusingan'],[swapped,'gerakan ditukar']])+chips(wt)+
      '<div class="lbq-chart sm">'+lbWeeksSVG(wk)+'</div><div class="lbq-cap">Minit seminggu: naik perlahan, supaya badan sempat menyesuaikan diri.</div></div>'+
    (tg?'<div class="lbq-card"><div class="lbq-ch">'+glyph('food')+'<b>Menu anda</b><span>'+(LB30_MEALS[me.meals]?me.meals+' kali sehari':'3 kali sehari')+'</span></div>'+
      stat([[tg.cal.toLocaleString(),'kcal sehari'],[tg.prot+'g','protein'],[rice||'–','genggam nasi tengah hari']])+chips(mt)+
      (end!==null?'<div class="lbq-chart sm">'+lbProjSVG(me.wt,end)+'</div><div class="lbq-cap">Anggaran jika anda ikut pelan, '+lbPaceOf(me)+' kg seminggu. Bukan janji: setiap badan berbeza.</div>':'')+'</div>':'')+
    '<details class="lbq-more"><summary>'+glyph('check')+'Apa yang berubah untuk anda <span>'+lines.length+'</span></summary>'+
      '<div class="lbq-lines">'+lines.map(function(l){ return '<div><span>'+glyph(l[0])+'</span><p>'+l[1]+'</p></div>'; }).join('')+'</div></details>'+
    '<div class="lbq-fine">Rasa sakit semasa bersenam? Berhenti dan berehat. Anda boleh ubah jawapan bila-bila masa di tab Plan.</div>'+
    '<button class="lbx-go" onclick="lbQuizSave()">'+glyph('play')+'Lihat Pelan Saya</button>'+
    '<button class="lbx-ghost" onclick="lbQ=1;renderLB30()">Ubah jawapan</button></div>';
}
/* her plan in one card, at the top of Plan */
function lbMeCard(){
  var me=lbMe(); if(!me) return '';
  var tags=[LB30_Q[0].o.filter(function(o){ return o[0]===me.level; })[0][1], me.mins+' min'];
  (me.pain||[]).forEach(function(p){ if(LB30_SWAP[p]) tags.push({lutut:'Lutut selamat',belakang:'Belakang selamat',tangan:'Tangan selamat'}[p]); });
  if(me.mom==='bersalin') tags.push('Selepas bersalin');
  if(LB30_FOCUS[me.focus]) tags.push(LB30_FOCUS[me.focus][0]);
  if(LB30_MEALS[me.meals]) tags.push(me.meals+'× makan sehari');
  return '<div class="lbx-card lbq-me"><div class="h"><span class="ic">'+glyph('sliders')+'</span><div class="tt"><div class="lbx-k">Your plan</div><b>Dibina dari jawapan anda</b></div>'+
    '<button onclick="lbQuizOpen()">'+glyph('pencil')+'Ubah</button></div>'+
    '<div class="lbq-chips row">'+tags.map(function(x){ return '<span>'+hesc(x)+'</span>'; }).join('')+'</div></div>';
}
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
function lbExercises(d){ return d.ex.map(function(n){ var e=lbEx(n); if(d.dur) e.dur=d.dur; return e; }); }
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
var LB30_IMG={hero:'/ladies/img/lb-penyelesaian.jpg', work:'/ladies/img/hero-rumah.jpg',
  test:'/ladies/img/hero-rumah.jpg', recover:'/ladies/img/lb-ibu-anak.jpg', food:'/ladies/img/lb-makanan.jpg'};
/* one cover a week (25 Oct): Mula at sunrise, Bina, Bakar, Kuat at dusk; a
   training day shows its week's, so the picture moves on as she does */
var LB30_WEEK_IMG=['/ladies/img/lb-w1.jpg','/ladies/img/lb-w2.jpg','/ladies/img/lb-w3.jpg','/ladies/img/lb-w4.jpg'];
/* the picture at the top of her pages: the magenta cover when there is one (25 Oct 2026, Seth: "try tukar") */
function lbTopImg(){ return LB30_COVER || lbImg('hero'); }
function lbImg(k){ return LB30_IMG[k]||LB30_IMG.work; }
function lbDayImg(gi){ var d=LB30_DAYS[gi]; return (d && d.k==='work') ? LB30_WEEK_IMG[lbWeekOf(gi)] : lbImg(d?d.k:'work'); }
var lbTab='plan', lbWeek=-1, lbMenuDay=-1, lbFoodSeg='today';
function lbSetFoodSeg(x){ lbFoodSeg=x; renderLB30(); try{ var s=$('screen'), a=$('lb-tabs'); if(s&&a&&a.offsetTop) s.scrollTop=Math.max(0,a.offsetTop-70); }catch(e){} }
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
  if(lbQ>=0){ $('pgd-body').innerHTML=lbQuiz(); return; }
  var owned=lbOwned(), done=lbDone(), tot=LB30_DAYS.length, nx=lbNext();
  if(lbWeek<0) lbWeek=lbWeekOf(Math.min(nx,tot-1));
  var pill=!owned ? {icon:'lock',label:'RM'+LB30_PRICE,go:'lbBuy()'}
         : nx<tot ? {icon:'play',label:'Day '+(nx+1),go:'lbOpenDay('+nx+')'} : null;
  var h=pdxBar('program',pill)+
    '<div class="lbx-hero'+(LB30_COVER?' cover':'')+'" style="background-image:url(\''+lbTopImg()+'\')"><div class="lbx-hero-ov"></div>'+
    '<div class="lbx-hero-tx"><img class="lbx-mark" src="/img/brand/hfplus-mark.png" alt="HITFAT+">'+
    '<div class="lbx-name lb-logo">'+lbLogo('w')+'</div>'+
    '<div class="lbx-tags"><span>30 days</span><span>20 min a day</span><span>No jumping</span><span>At home</span></div></div></div>';
  h+='<div class="lbx">';
  if(!owned){
    h+='<div class="lbx-card lbx-sell"><div class="lbx-k">For women</div>'+
      '<div class="lbx-h">30 hari bakar lemak, dari rumah anda.</div>'+
      '<div class="lbx-p">Workout tanpa lompat 20 minit sehari, sasaran kalori, menu makanan Malaysia, dan progres anda direkod.</div>'+
      '<button class="lbx-go" onclick="lbBuy()">'+glyph('lock')+'Get the Program · RM'+LB30_PRICE+'</button>'+
      '<button class="lbx-ghost" onclick="openPaywall(\'\')">'+glyph('star')+'Included in HITFAT+</button></div>';
  } else if(nx<tot && !lbMe()){
    /* before her first day: the questionnaire that builds her plan */
    h+='<div class="lbx-card lbq-invite"><div class="lbx-k">'+(done?'New · your own plan':'Before Day 1')+'</div>'+
      '<div class="lbx-h">Jom bina pelan 30 hari anda.</div>'+
      '<div class="lbx-p">'+lbQCount(LB30_Q.length)+' soalan, 2 minit. Gerakan, minit dan kalori ikut tahap, badan dan masa anda.</div>'+
      '<button class="lbx-go" onclick="lbQuizOpen()">'+glyph('sliders')+'Bina Pelan Saya</button>'+
      (done?'<button class="lbx-ghost" onclick="lbOpenDay('+nx+')">'+glyph('play')+'Continue Day '+(nx+1)+'</button>':'')+'</div>';
  } else if(nx<tot){
    var d=lbDay(nx), wi=lbWeekOf(nx);
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
  if(owned) h+=lbScanHero();
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
/* the MAK2FIT 30 logo (Seth's, 26 Oct 2026): '' plum and rose gold for light
   grounds, 'w' white and rose gold on photographs, 'ww' all white on magenta */
function lbLogo(v){ return '<img src="/ladies/img/mak2fit-logo'+(v?'-'+v:'')+'.png" alt="'+hesc(LB30_NAME)+'">'; }
/* the poster: the photograph when there is one, the name in type until then */
function lbPoster(cls){
  /* the cover (25 Oct 2026, Seth: "colour asal", "lagi wow"): her photograph
     in its own colours on HITFAT red, the name in live type on the left */
  if(LB30_COVER) return '<div class="'+cls+' lb-photo" style="background-image:url(\''+LB30_COVER+'\')">'+
    '<div class="lb-tx"><img class="lb-mark" src="/img/brand/hfplus-mark.png" alt="HITFAT+">'+
    '<div class="lb-name lb-logo">'+lbLogo('ww')+'</div><div class="lb-sub">30 HARI · DI RUMAH · TANPA LOMPAT</div>'+
    '<div class="lb-pill">'+glyph('sliders')+'Pelan peribadi</div></div></div>';
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
  if(owned) h+=lbMeCard();
  if(owned && nx<tot) h+=lbChecklist();
  var w=LB30_WEEKS[lbWeek]||LB30_WEEKS[0];
  h+='<div class="lbx-sec"><div class="lbx-sh"><div class="lbx-st">Your 30 Days</div><div class="lbx-ss">'+done+' of '+tot+' days done</div></div></div>';
  h+='<div class="lbx-dots">'+LB30_DAYS.map(function(d,i){ return '<i class="'+(i<done?'d':i===nx&&owned?'n':'')+(LB30_WEEKS.some(function(x){ return x.from===i+1&&i>0; })?' gap':'')+'"></i>'; }).join('')+'</div>';
  h+='<div class="lbx-weeks">'+LB30_WEEKS.map(function(x,i){
    var all=done>=x.to;
    return '<button class="'+(i===lbWeek?'on':'')+'" onclick="lbWeek='+i+';renderLB30()"><small>Week '+(i+1)+'</small><b>'+(all?'✓ ':'')+x.n+'</b></button>'; }).join('')+'</div>';
  h+='<div class="lbx-wcover" style="background-image:url(\''+LB30_WEEK_IMG[lbWeek]+'\')"><div><small>Week '+(lbWeek+1)+' · Days '+w.from+'–'+w.to+'</small><b>'+w.n+'</b><span>'+w.s+'</span></div></div>';
  if(LB30_SETH.weeks[lbWeek]) h+=lbVideoCard(LB30_SETH.weeks[lbWeek],'Week '+(lbWeek+1)+' intro with Coach Seth');
  h+='<div class="lbx-days">'+LB30_DAYS.slice(w.from-1,w.to).map(function(d0,j){
    var gi=w.from-1+j, d=lbDay(gi), isDone=gi<done, now=gi===nx&&owned;
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
  var total=3+LB30_CHECKS.length, d=lbDay(gi);
  /* one card, one row a thing (25 Oct 2026, Seth: "kemaskan lagi"): a ring
     that fills when it is done, what it is, and on the right what to press */
  var ck=function(on,icon){ return '<span class="ck'+(on?' on':'')+'">'+glyph(on?'check':icon)+'</span>'; };
  var bar=function(p){ return '<div class="bar"><i style="width:'+Math.round(Math.min(1,p)*100)+'%"></i></div>'; };
  var pm=function(minus,plus,lm,lp){ return '<div class="pm" onclick="event.stopPropagation()"><button onclick="'+minus+'" aria-label="'+lm+'">−</button><button onclick="'+plus+'" aria-label="'+lp+'">+</button></div>'; };
  var h='<div class="lbx-sec"><div class="lbx-sh"><div class="lbx-st">Today&rsquo;s Checklist</div><div class="lbx-ss">'+n+' of '+total+' done</div></div>'+
    lbRing(n/total,44,n,'')+'</div>';
  h+='<div class="lbx-card lbx-cl">'+
    '<div class="lbx-cr'+(trained?' on':'')+'" onclick="lbOpenDay('+gi+')">'+ck(trained,'play')+
      '<div class="tx"><b>'+d.n+'</b><span>Workout · '+lbMinutes(d)+' min · no jumping</span></div><span class="pdx-chev">›</span></div>'+
    '<div class="lbx-cr'+(stepOk?' on':'')+'" onclick="lbSteps(\'goal\')">'+ck(stepOk,'steps')+
      '<div class="tx"><b>'+st.toLocaleString()+' <em>/ '+stepT.toLocaleString()+' steps</em></b>'+bar(st/stepT)+'</div>'+
      pm('lbSteps(-500)','lbSteps(500)','500 fewer steps','500 more steps')+'</div>'+
    '<div class="lbx-cr'+(waterOk?' on':'')+'">'+ck(waterOk,'bottle')+
      '<div class="tx"><b>'+wt.toFixed(2).replace(/0$/,'')+' <em>/ '+waterT.toFixed(1)+' L water</em></b>'+bar(wt/waterT)+'</div>'+
      pm('lbWaterAdd(-0.25)','lbWaterAdd(0.25)','250 ml less','250 ml more')+'</div>'+
    '<div class="lbx-cr'+(c.misi?' on':'')+'" onclick="lbTick(\'misi\')">'+ck(c.misi,'target')+
      '<div class="tx"><span class="k">Nutrition mission</span><b class="w">'+LB30_MISI[gi]+'</b></div></div>'+
    '<div class="lbx-cr'+(c.makan?' on':'')+'" onclick="lbTick(\'makan\')">'+ck(c.makan,'food')+'<div class="tx"><b>Ate to plan</b></div></div>'+
    '<div class="lbx-cr'+(c.tidur?' on':'')+'" onclick="lbTick(\'tidur\')">'+ck(c.tidur,'moon')+'<div class="tx"><b>Slept 7 hours</b></div></div>'+
  '</div>';
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
  var d=lbDay(gi); if(!d) return;
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
  h+='<div class="lbx-note"><div class="q">“</div><div><div class="k">Coach&rsquo;s note</div><div class="t">'+lbTip(gi)+'</div></div></div>';
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
  var d=lbDay(gi); if(!d) return;
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
  HF.markDone(LB30_KEY+'-d'+gi,{name:lbDay(gi).n, mins:lbMinutes(lbDay(gi))});
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
  return fsec('Fit Test Results',when==='d1'?'Day 1':'Day 30')+'<div class="esfields">'+lbFitList().map(function(x){
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
  var n=HF.data.nutrition||{}, pr=lbData().profile||{}, me=lbData().me||{};
  return {age:me.age||pr.age||n.a||0, wt:me.wt||pr.wt||n.w||0, ht:me.ht||pr.ht||n.h||0};
}
function lbTarget(){
  var pr=lbProfile(); if(!pr.wt||!pr.ht||!pr.age) return null;
  var me=lbData().me||{};
  var n=mpNut({goal:'loss', rate:lbPace(), gender:'female', age:pr.age, wt:pr.wt, ht:pr.ht, activity:lbAct(), styles:['hiprotein']});
  var cal=Math.max(1200, n.cal);
  /* feeding a baby: about 400 kcal more, and never under 1,500 */
  if(me.done && me.feed) cal=Math.max(1500, cal+400);
  return {cal:cal, prot:n.prot, carb:n.carb, fat:n.fat};
}
function lbSaveProfile(){
  var g=function(x){ return parseFloat(($(x)||{}).value); };
  var wt=g('lb-wt'), ht=g('lb-ht'), age=parseInt(($('lb-age')||{}).value,10);
  if(!wt||!ht||!age){ toast('Isi berat, tinggi dan umur'); return; }
  lbData().profile={wt:wt, ht:ht, age:age}; HF.save(); renderLB30();
}
function lbForgetNumbers(){ var d=lbData(); d.profile={}; if(d.me){ delete d.me.wt; delete d.me.ht; delete d.me.age; } HF.save(); renderLB30(); }
/* the three options a meal shows on a day: different every day, never twice */
function lbMenuFor(slot,day){
  var me=lbMe(), opts=LB30_MENU[slot].opts.filter(function(o){ return lbOk(o,me); }), out=[], k, n;
  /* she mostly buys: breakfast and lunch from what a kedai sells, when there are three */
  if(me && me.cook==='beli' && (slot==='sarapan'||slot==='tengahari')){
    var bought=opts.filter(function(o){ return o.b; }); if(bought.length>=3) opts=bought;
  }
  n=opts.length;
  /* three in a row from day×3, so one day's dishes don't come back the next;
     tea time starts further round than the morning, from the same list */
  for(k=0;k<Math.min(3,n);k++) out.push(opts[(day*3+k+(slot==='petang'?5:0))%n]);
  return out;
}
/* her meals, each with its share of her target */
function lbSlots(){ var me=lbMe(); if(me && LB30_MEALS[me.meals]) return LB30_MEALS[me.meals];
  return LB30_SLOTS.map(function(s){ return [s, LB30_MENU[s].share]; }); }
/* nothing she said she doesn't eat */
function lbOk(o,me){ if(!me||!me.avoid) return true; var x=' '+(o.x||'')+' '; return me.avoid.every(function(a){ return x.indexOf(' '+a+' ')<0; }); }
/* her rice for a dish, in half fists, from her target for that meal */
function lbRice(o,kcal){ if(!o.ra) return null; if(!kcal) return o.ra;
  var r=Math.round((kcal-(o.k-o.ra*200))/100)/2; return Math.max(0.5,Math.min(2,r)); }
function lbFist(r){ return (r<1?'½':Math.floor(r)+(r%1?'½':''))+' genggam'; }
function lbDish(o,kcal){
  var r=lbRice(o,kcal);
  return {k:r===null?o.k:Math.round(o.k-o.ra*200+r*200), r:r,
    it:o.it.map(function(x){ return x.replace('{nasi}', lbFist(r===null?1:r)); })};
}
/* Learn (25 Oct 2026, Seth): the Nutrition Academy, all of it, inside her
   program; MAK2FIT 30 opens every episode (acLadies, academy.js) */
function lbLearn(){
  if(typeof academyHTML!=='function') return '';
  if(!lbOwned()) return lbLocked('book','Nutrition Academy','Episod video pendek tentang makan untuk turun lemak, cara Malaysia, setiap satu dengan kuiz 3 soalan.');
  return '<div class="lbx-acad">'+academyHTML()+'</div>';
}
/* her meal scans (25 Oct 2026): 10 free in her first 30 days, then Scan 6,
   six a day for 30 days at RM14.90, the plan that covers a whole program */
/* the meal scan, where she sees it every time she opens the program
   (25 Oct 2026, Seth: "killer feature", "mudah nampak"): a red strip
   above the tabs, and a Scan button on every meal of her menu */
function lbScanGo(){
  var a=typeof scanAccess==='function' ? scanAccess() : {left:0};
  if(a.left>0) openScan('meal'); else startCheckout('scan_d6');
}
function lbScanHero(){
  if(typeof scanAccess!=='function') return '';
  var a=scanAccess(), has=a.left>0;
  var sub=has ? (a.mode==='pass' ? a.left+' of '+a.daily+' scans left today' : a.label) : 'Scan 6 · 6 sehari, 30 hari · RM14.90';
  return '<div class="lbx-scanhero" role="button" tabindex="0" onclick="lbScanGo()">'+
    '<div class="ph" style="background-image:url(\'/ladies/img/menu/d11.jpg\')"><i class="c1"></i><i class="c2"></i><i class="c3"></i><i class="c4"></i><i class="ln"></i></div>'+
    '<div class="tx"><div class="k">'+glyph('spark')+'AI Meal Scan</div><b>Snap makanan anda, tahu kalorinya.</b><span>'+sub+'</span></div>'+
    '<span class="go">'+glyph('photo')+'</span></div>';
}
/* ── the shopping list (25 Oct 2026, Seth): a week's menu (option 1 of each
   meal) turned into what to buy, grouped as a market is, ticked off in the
   shop and sent on WhatsApp ── */
var LB30_SHOP_ING=[['nasi impit','Beras'],['bebola ikan','Bebola ikan'],['tuna','Tuna'],['kuey teow','Kuey teow'],['mihun','Bihun'],
  ['ubi keledek','Ubi keledek'],['mentega kacang','Mentega kacang'],['kacang tanah','Kacang tanah'],['kacang hijau','Kacang hijau'],['badam','Badam'],
  ['susu soya','Susu soya'],['yogurt','Yogurt asli'],['epal','Epal'],['kurma','Kurma'],['jambu','Jambu batu'],['jagung','Jagung'],['kraker','Biskut kraker'],
  ['kuih','Kuih'],['tembikai','Tembikai'],['betik','Betik'],['buah naga','Buah naga'],['kelapa','Kelapa muda'],['cendawan','Cendawan'],
  ['nasi lemak','Beras & santan'],['nasi perang','Beras perang'],['nasi','Beras'],['bubur','Beras'],
  ['roti canai','Roti canai (beku)'],['roti','Roti mil penuh'],['oat','Oat'],['mi ','Mi kuning'],['mi kuning','Mi kuning'],['bihun','Bihun'],['ubi','Ubi kayu'],['tosai','Tepung tosai'],['lempeng','Tepung & pisang'],
  ['ayam','Ayam'],['ikan','Ikan'],['telur','Telur'],['daging','Daging'],['sotong','Sotong'],['udang','Udang'],['tauhu','Tauhu'],['tempe','Tempe'],
  ['kangkung','Kangkung'],['sawi','Sawi'],['bayam','Bayam'],['kailan','Kailan'],['kobis','Kobis'],['taugeh','Taugeh'],['kacang panjang','Kacang panjang'],['buncis','Kacang buncis'],
  ['timun','Timun'],['tomato','Tomato'],['ulam','Ulam'],['sayur','Sayur campur'],['pisang','Pisang'],['halia','Halia'],
  ['susu','Susu rendah lemak'],['dal','Kacang dal'],['sambal','Cili & belacan'],['santan','Santan'],['kicap','Kicap'],['teh','Teh'],['kopi','Kopi']];
var LB30_SHOP_CAT=[['Protein','food','#E30613',['Ayam','Ikan','Telur','Daging','Sotong','Udang','Tauhu','Tempe','Tuna','Bebola ikan']],
  ['Karbohidrat','workout','#E08A00',['Beras','Beras perang','Beras & santan','Roti mil penuh','Roti canai (beku)','Oat','Mi kuning','Bihun','Ubi kayu','Tepung tosai','Tepung & pisang',
    'Kuey teow','Ubi keledek','Jagung','Biskut kraker']],
  ['Sayur & Buah','leaf','#1F9D6A',['Kangkung','Sawi','Bayam','Kailan','Kobis','Taugeh','Kacang panjang','Kacang buncis','Timun','Tomato','Ulam','Sayur campur','Pisang','Halia',
    'Epal','Kurma','Jambu batu','Tembikai','Betik','Buah naga','Kelapa muda','Cendawan']]];
var lbShopWeek=-1;
function lbShopItems(wi){
  var w=LB30_WEEKS[wi], n={}, d, si, it, k, low;
  var sl=lbSlots();
  for(d=w.from-1; d<w.to; d++) for(si=0; si<sl.length; si++){
    lbDish(lbMenuFor(sl[si][0],d)[0]).it.forEach(function(x){
      low=' '+String(x).toLowerCase()+' ';
      for(k=0;k<LB30_SHOP_ING.length;k++) if(low.indexOf(LB30_SHOP_ING[k][0])>=0){ it=LB30_SHOP_ING[k][1]; n[it]=(n[it]||0)+1; break; }
    });
  }
  return n;
}
function lbShopTick(wi,name){ var sh=lbData().shop, k='w'+wi; sh[k]=sh[k]||{}; sh[k][name]=!sh[k][name]; HF.save(); lbShopRe(); }
/* her own things on the list (25 Oct 2026, Seth: "tak leh ade yang nk add
   sendiri?"): typed in, a week's list each, ticked and crossed off like the
   rest, sent to WhatsApp with it. Kept by index, so any text is safe. */
function lbShopMine(wi){ var sh=lbData().shop, k='x'+wi; sh[k]=sh[k]||[]; return sh[k]; }
function lbShopRe(){ var s=$('screen'), y=s?s.scrollTop:0; renderLB30(); if(s) s.scrollTop=y; }
function lbShopAdd(wi){
  var el=$('lb-shop-in'), v=String(el&&el.value||'').replace(/\s+/g,' ').trim().slice(0,40), mine=lbShopMine(wi);
  if(!v) return;
  if(mine.some(function(x){ return x.n.toLowerCase()===v.toLowerCase(); })){ toast('Dah ada dalam senarai'); return; }
  mine.push({n:v, on:false}); HF.save(); lbShopRe();
  var again=$('lb-shop-in'); if(again) again.focus();
}
function lbShopMineTick(wi,i){ var x=lbShopMine(wi)[i]; if(!x) return; x.on=!x.on; HF.save(); lbShopRe(); }
function lbShopMineDel(wi,i){ lbShopMine(wi).splice(i,1); HF.save(); lbShopRe(); }
function lbShopText(wi){
  var n=lbShopItems(wi), t='Senarai belanja MAK2FIT 30 · Week '+(wi+1)+'\n';
  LB30_SHOP_CAT.concat([['Lain-lain']]).forEach(function(c,ci){
    var names=Object.keys(n).filter(function(x){ return ci<LB30_SHOP_CAT.length ? c[3].indexOf(x)>=0 : !LB30_SHOP_CAT.some(function(cc){ return cc[3].indexOf(x)>=0; }); });
    if(names.length) t+='\n'+c[0]+':\n'+names.map(function(x){ return '• '+x; }).join('\n')+'\n';
  });
  var mine=lbShopMine(wi);
  if(mine.length) t+='\nBarang saya:\n'+mine.map(function(x){ return '• '+x.n; }).join('\n')+'\n';
  return t;
}
function lbShopping(){
  if(lbShopWeek<0) lbShopWeek=lbWeekOf(Math.min(lbNext(),LB30_DAYS.length-1));
  var wi=lbShopWeek, n=lbShopItems(wi), got=(lbData().shop['w'+wi])||{}, all=Object.keys(n).sort(function(a,b){ return n[b]-n[a]; }), mine=lbShopMine(wi);
  var have=all.filter(function(x){ return got[x]; }).length+mine.filter(function(x){ return x.on; }).length, count=all.length+mine.length;
  var h='<div class="lbx-sec"><div class="lbx-sh"><div class="lbx-st">Shopping List</div><div class="lbx-ss">Dari menu minggu ini, dan apa saja yang anda tambah. Tanda bila dah beli.</div></div></div>';
  h+='<div class="lbx-card lbx-shop"><div class="lbx-shop-w">'+LB30_WEEKS.map(function(x,i){ return '<button class="'+(i===wi?'on':'')+'" onclick="lbShopWeek='+i+';lbShopRe()">Week '+(i+1)+'</button>'; }).join('')+'</div>'+
    '<div class="lbx-shop-p"><div class="bar"><i style="width:'+(count?Math.round(have/count*100):0)+'%"></i></div><span>'+have+' / '+count+' dibeli</span></div>';
  /* her own things, first: what she types in */
  h+='<div class="lbx-shop-c lbx-shop-mine" style="--mc:var(--lr,#C02A7C)"><div class="h"><span class="ic">'+glyph('pencil')+'</span><b>Barang Saya</b><span>'+(mine.length||'')+'</span></div>'+
    '<form class="lbx-shop-add" onsubmit="event.preventDefault();lbShopAdd('+wi+')"><input id="lb-shop-in" class="inp" maxlength="40" placeholder="Tambah barang, cth. kicap, susu anak" aria-label="Tambah barang">'+
    '<button type="submit" aria-label="Tambah">'+glyph('plus')+'</button></form>'+
    mine.map(function(x,i){ return '<div class="lbx-shop-i mine'+(x.on?' on':'')+'" role="button" onclick="lbShopMineTick('+wi+','+i+')"><span class="b">'+(x.on?glyph('check'):'')+'</span>'+
      '<span class="n">'+hesc(x.n)+'</span><button class="del" aria-label="Buang '+hesc(x.n)+'" onclick="event.stopPropagation();lbShopMineDel('+wi+','+i+')">×</button></div>'; }).join('')+'</div>';
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
  if(o.img) return o.img;
  var si=LB30_SLOTS.indexOf(slot), oi=LB30_MENU[slot].opts.indexOf(o), n=si*10+oi+1;
  if(si<0 || oi<0 || oi>9) return '';
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
  /* three parts, so nothing is a long scroll away (25 Oct 2026, Seth):
     today's menu, the shopping list, and the guide */
  h+='<div class="lbx-fseg" id="lb-fseg">'+[['today','Today','food'],['shop','Shopping','bag'],['guide','Guide','leaf']].map(function(x){
    return '<button class="'+(lbFoodSeg===x[0]?'on':'')+'" onclick="lbSetFoodSeg(\''+x[0]+'\')">'+glyph(x[2])+x[1]+'</button>'; }).join('')+'</div>';
  if(lbFoodSeg==='shop') return h+lbShopping();
  if(lbFoodSeg!=='guide'){
  h+='<div class="nstage wl-stage lb-stage sm"><span class="wl-st-gly">'+glyph('flame')+'</span><div class="nstage-k">Your daily target</div>'+
    '<div class="nstage-n">'+t.cal.toLocaleString()+'<span> kcal</span></div>'+
    '<div class="nstage-s">Lebih kurang '+lbPace()+' kg seminggu · tidak pernah bawah '+(lbMe()&&lbMe().feed?'1,500':'1,200')+' kcal</div>'+
    '<div class="nstage-g">'+[[t.prot+'g','Protein'],[t.carb+'g','Carbs'],[t.fat+'g','Fat'],[lbWater(lbMenuDay).toFixed(1)+' L','Water']]
      .map(function(x){ return '<div><b>'+x[0]+'</b><span>'+x[1]+'</span></div>'; }).join('')+'</div></div>';
  h+='<div class="lbx-misi"><span class="b">'+glyph('target')+'</span><div><div class="k">Nutrition mission · Day '+(lbMenuDay+1)+'</div><div class="t">'+LB30_MISI[lbMenuDay]+'</div></div></div>';
  if(lbMe() && !lbMe().meals) h+='<div class="lbx-card lbq-invite"><div class="lbx-k">New · your own menu</div>'+
    '<div class="lbx-h">Menu ikut cara anda makan.</div><div class="lbx-p">3 soalan: berapa kali makan sehari, apa yang anda tak makan, siapa yang masak.</div>'+
    '<button class="lbx-go" onclick="lbQuizMenu()">'+glyph('sliders')+'Jawab 3 Soalan</button></div>';
  /* the menu: a day, her meals, three options each */
  h+='<div class="lbx-sec"><div class="lbx-sh"><div class="lbx-st">Today&rsquo;s Menu</div><div class="lbx-ss">Day '+(lbMenuDay+1)+' · '+lbSlots().length+' kali makan, tiga pilihan setiap satu</div></div></div>';
  h+='<div class="hscroll wl-mdays lbx-mdays">'+LB30_DAYS.map(function(d,i){
    return '<button class="wl-md'+(i===lbMenuDay?' on':'')+'" onclick="lbMenuDay='+i+';renderLB30()"><small>Day</small><b>'+(i+1)+'</b></button>'; }).join('')+'</div>';
  var slotLook={sarapan:['sunrise','#E08A00'],pagi:['leaf','#1F9D6A'],tengahari:['sun','#E30613'],petang:['clock','#DB2777'],malam:['moon','#5B4BC4'],lewat:['moon','#0F766E']};
  var me=lbMe(), cook=me&&me.cook;
  h+='<div class="lbx-meals">'+lbSlots().map(function(sl,si){
    var slot=sl[0], s=LB30_MENU[slot], kc=Math.round(t.cal*sl[1]), opts=lbMenuFor(slot,lbMenuDay), sid='lbm-'+lbMenuDay+'-'+si, lk=slotLook[slot]||['food','#E30613'];
    var label=slot==='tengahari'&&cook&&cook!=='sendiri'?'Lunch':slot==='malam'&&cook==='beli'?'Dinner':s.label;
    var note=slot==='tengahari'&&cook==='beli'?'Pilihan yang mudah dibeli di kedai dan warung':slot==='malam'&&cook==='keluarga'?'Masak sekali untuk seisi rumah, ambil bahagian anda':s.note;
    return '<div class="mpslot lbx-meal" id="'+sid+'" style="--mc:'+lk[1]+'"><div class="mpslot-h"><span class="ic">'+glyph(lk[0])+'</span>'+
      '<div class="hd"><div class="t">'+label+'</div><div class="m">'+s.time+' · ~'+kc+' kcal</div></div>'+
      '<div class="mpopts">'+opts.map(function(o,oi){ return '<button class="mpo'+(oi===0?' on':'')+'" aria-label="Option '+(oi+1)+'" onclick="mpOpt(\''+sid+'\','+oi+')">'+(oi+1)+'</button>'; }).join('')+'</div></div>'+
      /* one dish: its photograph beside it, small, so a day's meals fit on a screen or two */
      opts.map(function(o,oi){ var ds=lbDish(o,kc), im=lbDishImg(slot,o); return '<div class="mpopt" style="display:'+(oi===0?'block':'none')+';"><div class="lbx-mo">'+
        (im?'<div class="lbx-dish sm" style="background-image:url(\''+im+'\')"></div>':'<div></div>')+
        '<div class="tx"><div class="mpopt-h"><div class="t">'+o.n+'</div><div class="k">'+ds.k+' kcal</div></div>'+
        (ds.r!==null&&me?'<div class="lbx-rice">'+glyph('food')+'Nasi: <b>'+lbFist(ds.r)+'</b></div>':'')+
        '<div class="lbx-items">'+ds.it.map(function(it){ return '<span>'+it+'</span>'; }).join('')+'</div></div>'+
      '</div></div>'; }).join('')+'<div class="lbx-meal-f"><div class="lbx-meal-n">'+note+'</div>'+
      '<button class="lbx-mscan" onclick="lbScanGo()">'+glyph('photo')+'Scan</button></div></div>';
  }).join('')+'</div>';
  return h;
  }
  /* the guide: the healthy plate, then the hands */
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
  if(typeof AC_EPS!=='undefined') h+='<div class="lbx-row" onclick="lbSetTab(\'learn\')"><span class="b">'+glyph('play')+'</span><div class="tx"><div class="t">Nutrition Academy</div><div class="m">'+AC_EPS.length+' episod · full access with MAK2FIT 30</div></div><span class="pdx-chev">›</span></div>';
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
    lbFitList().map(function(f){
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
  var o=String((($('lb-order')||{}).value)||'').trim(), hl=/^HL[A-Z0-9]+/i.exec(o); if(hl) o=hl[0].toUpperCase();
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
  var hl=/^HL[A-Z0-9]+/i.exec(o); if(hl) o=hl[0].toUpperCase();   /* an order with Bayarcash's ?payment_intent_id stuck on (27 Oct 2026) */
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
    '<button class="authalt" onclick="window.open(\'https://wa.me/60189174656?text='+encodeURIComponent('Hai HITFAT, saya dah bayar MAK2FIT 30 tapi belum terbuka.')+'\',\'_blank\',\'noopener\')">Masih tak terbuka? <b>WhatsApp kami</b></button>';
  $('pw-body').innerHTML=h; $('pwm').classList.add('on');
}

/* ── Home: the full card once she has started it or bought it on its own;
   until then a tile in the programs row (hubRow, diet6.js) ── */
function lbFull(){ return lbOwned() && lbNext()<LB30_DAYS.length && (owns('prog_'+LB30_ID) || lbDone()>0); }
function lbHomeCard(){
  if(!lbFull()) return '';
  var done=lbDone(), tot=LB30_DAYS.length, nx=lbNext(), d=lbDay(nx), pct=Math.round(done/tot*100);
  return '<div class="wl-poster lb-card" onclick="openProgram(\''+LB30_ID+'\')">'+lbPoster('lb-card-poster')+
    '<div class="wl-poster-b"><div class="tx"><div class="k">Day '+(nx+1)+' · '+lbMinutes(d)+' min</div>'+
    '<div class="t">'+d.n+'</div><div class="pbar lb-bar"><i style="width:'+pct+'%"></i></div></div>'+
    '<button class="bigbtn lb-btn" onclick="event.stopPropagation();lbOpenDay('+nx+')">'+glyph('play')+'Start Day '+(nx+1)+'</button></div></div>';
}
