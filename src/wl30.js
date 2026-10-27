/* ═══════════════ BURN30 · 30-DAY WEIGHT LOSS ═══════════════
   The first program sold on its own: RM39, one payment, yours for good. It
   is bought on its landing page (Bayarcash), or in the app, and is part of
   HITFAT+ for members. Someone who owns only this sees the rest of the app
   locked, the way Fitness+ shows what a subscription would add.

   28 Oct 2026 (Seth: "upgrade burn 30 mcm mak2fit … mak2fit target wanita,
   burn30 lelaki dan wanita"): it now works the way MAK2FIT 30 does, for men
   and women. After it is bought, a short questionnaire builds the member's
   own 30 days and menu; the program's home is the same premium one (a
   photograph, a ring for the month, today's card, the checklist, day tiles),
   with Nutrition (a target, Malaysian menus, a shopping list, a guide),
   Learn (the Nutrition Academy), Progress and Start Here. The labels are
   English and the notes Malay, as MAK2FIT's are.

   What stays BURN30's own: HITFAT red; the harder month (jumps, a chair and
   two bottles, up to seven moves and 25 minutes); five phases became four
   weeks, the last nine days long. The questionnaire takes out what a member
   can't do: the jumps (an apartment, a knee), the chair or the bottles they
   don't have, what hurts, and for a woman a recent birth.

   Shared with MAK2FIT 30 (ladies30.js, loaded after this file, so only at
   run time): the menus and their photographs, the meals a day, the shopping
   list's groups, the nutrition missions, the walking ramp, the ring, the
   research charts and the meal-scan strip. The styles are MAK2FIT's (.lbx,
   .lbq) in red (.bn).                                                     */

const WL30_ID='wl30', WL30_PRICE=39;
/* its name, the way Beachbody names a program, and what it is */
const WL30_NAME='BURN30', WL30_SUB='30-Day Weight Loss', WL30_POSTER='/img/p/burn30-poster.jpg?v=4';
const WL30_COVER='/img/p/wl30.jpg';
const WL30_KEY='wl30';                               /* its sessions: wl30-d0 … wl30-d29 */
const WL30_REST=20;                                  /* the player's rest between moves (REST_SECS) */
const WL30_TEST=['Bodyweight Squat','Knee Push Ups','Jumping Jack','Crunch','Plank'];
const WL30_RECOVER=['IC Warm','Bird Dog','Dead Bug','Hip Thrust','Calf Raises'];
const WL30_WEEKS=[
  {n:'Foundation', s:'Belajar setiap gerakan, bina tabiat. Dua pusingan sehari.',             from:1,  to:7},
  {n:'Build',      s:'Tiga pusingan sekarang. Gerakan yang sama, lebih banyak.',              from:8,  to:14},
  {n:'Burn',       s:'Gerakan lebih susah, sesi lebih panjang.',                              from:15, to:21},
  {n:'Push',       s:'Sembilan hari terakhir. Tujuh gerakan sehari, kemudian fit test semula.', from:22, to:30}
];
/* k: test · train · lower · upper · cardio · core · recover. r: rounds. */
const WL30_DAYS=[
  {n:'Fit Test',            k:'test',    r:1, ex:WL30_TEST},
  {n:'Full Body Start',     k:'train',   r:2, ex:['Bodyweight Squat','Wall Push Up','Reverse Lunges','Dead Bug','Hip Thrust','Jumping Jack']},
  {n:'Lower Body Basics',   k:'lower',   r:2, ex:['Chair Squat','Alternating Lunges','Hip Thrust','Side Lunges','Calf Raises','Wall Sit']},
  {n:'Cardio Kickstart',    k:'cardio',  r:2, ex:['Jumping Jack','High Knee','Butt Kick','Fast Feet','Mountain Climber','Half Burpee']},
  {n:'Upper & Core',        k:'upper',   r:2, ex:['Wall Push Up','Bottle Shoulder Press','Bottle Bent Over Row','Tricep Dip Chair','Crunch','Plank']},
  {n:'Full Body Burn',      k:'train',   r:2, ex:['Squat Pulse','Knee Push Ups','Reverse Lunges','Mountain Climber','Bird Dog','High Knee']},
  {n:'Active Recovery',     k:'recover', r:2, ex:WL30_RECOVER},

  {n:'Lower Body Build',    k:'lower',   r:3, ex:['Bodyweight Squat','Walking Lunges','Hip Thrust','Curtsy Lunges','Squat Hold']},
  {n:'Cardio Intervals',    k:'cardio',  r:3, ex:['Jumping Jack','High Knee','Half Burpee','Butt Kick','Plank Jack']},
  {n:'Upper Body Build',    k:'upper',   r:3, ex:['Knee Push Ups','Bottle Shoulder Press','Bottle Bent Over Row','Bottle Lateral Raises','Tricep Dip Chair']},
  {n:'Core Build',          k:'core',    r:3, ex:['Dead Bug','Reverse Crunch','Russian Twist','Flutter Kick','Plank']},
  {n:'Full Body Build',     k:'train',   r:3, ex:['Squat Pause','Incline Push Up (Chair)','Alternating Lunges','Mountain Climber','Bicycle Crunch']},
  {n:'Sweat Session',       k:'cardio',  r:3, ex:['Jumping Jack','Squat Pulse','Fast Feet','Step Up Box or Chair','High Knee']},
  {n:'Active Recovery',     k:'recover', r:2, ex:WL30_RECOVER},

  {n:'Lower Burn',          k:'lower',   r:3, ex:['Squat Pulse','Reverse Lunges','Single Leg Glutes Bridge','Side Lunges','Wall Sit','Calf Raises']},
  {n:'HIIT Burn',           k:'cardio',  r:3, ex:['Jumping Jack','Half Burpee','High Knee','Mountain Climber','Power Skip','Fast Feet']},
  {n:'Upper Burn',          k:'upper',   r:3, ex:['Knee Push Ups','Bottle Bent Over Row','Bottle Shoulder Press','Bottle Bicep Curl','Tricep Dip Chair','Plank Shoulder Taps']},
  {n:'Core Burn',           k:'core',    r:3, ex:['Bicycle Crunch','Leg Raises','Russian Twist','Plank Jack','Side Plank','Dead Bug']},
  {n:'Full Body Burn',      k:'train',   r:3, ex:['Bodyweight Squat','Incline Push Up (Chair)','Walking Lunges','Plank Jack','Hip Thrust','Skater Jump']},
  {n:'Cardio Burn',         k:'cardio',  r:3, ex:['High Knee','Butt Kick','Half Burpee','Squat Jump','Jumping Jack','Mountain Climber']},
  {n:'Active Recovery',     k:'recover', r:2, ex:WL30_RECOVER},

  {n:'Lower Push',          k:'lower',   r:3, ex:['Squat Pause','Walking Lunges','Hip Thrust','Curtsy Lunges','Squat Jump','Wall Sit','Calf Raises']},
  {n:'HIIT Push',           k:'cardio',  r:3, ex:['Half Burpee','Squat Jump','High Knee','Skater Jump','Mountain Climber','Plank Jack','Fast Feet']},
  {n:'Upper Push',          k:'upper',   r:3, ex:['Knee Push Ups','Incline Push Up (Chair)','Bottle Bent Over Row','Bottle Shoulder Press','Bottle Lateral Raises','Tricep Dip Chair','Plank Shoulder Taps']},
  {n:'Core Push',           k:'core',    r:3, ex:['Dead Bug','Bicycle Crunch','Leg Raises','Russian Twist','Flutter Kick','Side Plank','Plank']},
  {n:'Full Body Push',      k:'train',   r:3, ex:['Bodyweight Squat','Knee Push Ups','Reverse Lunges','Mountain Climber','Hip Thrust','Half Burpee','Bicycle Crunch']},
  {n:'Total Sweat',         k:'cardio',  r:3, ex:['Jumping Jack','Squat Pulse','High Knee','Alternating Lunges','Butt Kick','Plank Jack','Power Skip']},
  {n:'Active Recovery',     k:'recover', r:2, ex:WL30_RECOVER},

  {n:'Final Burn',          k:'train',   r:3, ex:['Bodyweight Squat','Half Burpee','Knee Push Ups','Walking Lunges','Mountain Climber','Bicycle Crunch','High Knee']},
  {n:'Fit Test & Celebrate',k:'test',    r:1, ex:WL30_TEST}
];
/* one line from the coach for each day */
const WL30_TIPS=[
  'Hari ini garisan permulaan anda. Kira setiap ulangan dengan jujur — Hari 30 dibandingkan dengannya.',
  'Perlahan dan belajar bentuk setiap gerakan. Laju datang kemudian; bentuk dahulu.',
  'Tolak lantai dengan tumit. Kaki ialah enjin terbesar badan anda.',
  'Termengah tak apa. Kalau langsung tak boleh bercakap, perlahankan — tapi terus bergerak.',
  'Dua botol air jadi dumbbell anda bulan ini. Isi lebih penuh bila anda makin kuat.',
  'Hari latihan terakhir minggu pertama. Habiskan, dan bahagian paling susah — bermula — sudah lepas.',
  'Gerakan ringan membantu otot pulih. Tambah jalan kaki 20 minit jika boleh.',
  'Tiga pusingan bermula hari ini. Rehat bila pemasa kata, bukan sebelum.',
  'Kerja kuat sepanjang selang, kemudian guna setiap saat rehat untuk bernafas.',
  'Push-up dari lutut sekarang. Dada ke lantai, siku 45 darjah.',
  'Tekan pinggang ke lantai. Perut yang rata bermula dengan teras yang kuat.',
  'Tahan sekejap di bawah setiap squat. Perlahan lebih susah, dan itulah tujuannya.',
  'Tuala dan sebotol air penuh sebelum mula. Anda akan perlukan kedua-duanya.',
  'Dua minggu siap. Esok pagi, rekod berat dan pinggang sebelum sarapan.',
  'Separuh jalan. Ambil gambar Hari 15 — cermin boleh menipu, pita ukur tidak.',
  'Enam gerakan, tiga pusingan. Pusingan terakhir di situlah perubahan berlaku.',
  'Picit bilah bahu di setiap tarikan. Postur yang baik dilatih, bukan diharap.',
  'Hembus nafas semasa mengecut perut. Menahan nafas buat setiap ulangan lebih susah.',
  'Skater jump baharu hari ini — mendarat lembut dan senyap.',
  'Squat jump hari ini. Lutut tak selesa? Squat laju tanpa meninggalkan lantai.',
  'Tiga minggu siap. Anda bukan lagi orang yang bermula pada Hari 1.',
  'Tujuh gerakan sehari minggu ini. Minggu inilah yang membentuk bulan ini.',
  'Kardio paling keras program ini. Habis-habisan semasa kerja, kemudian bernafas.',
  'Cuba satu dua push-up penuh di awal setiap pusingan, kemudian kembali ke lutut.',
  'Plank anda pada Hari 1 terasa lama. Rasa yang hari ini.',
  'Semua yang anda belajar, dalam satu sesi. Kuasai setiap ulangan.',
  'Peluh besar yang terakhir. Pasang muzik kegemaran dan habiskan dengan kuat.',
  'Rehat dengan baik malam ini. Tinggal dua hari.',
  'Workout terakhir program ini. Jangan tinggal apa-apa.',
  'Lima gerakan yang sama seperti Hari 1. Kira dengan jujur — kemudian lihat sejauh mana anda sudah pergi.'
];
/* a note that names a move, a round count or a day's length holds only for
   the template; once the member's plan has changed that day, a note that
   fits any day takes its place. gi: [is it still true of the day?, instead] */
const WL30_TIP_IF={
  4: [d=>wlHasMove(d,['Bottle Shoulder Press','Bottle Bent Over Row']), 'Kawal setiap ulangan, naik dan turun. Gerakan yang terkawal membina otot.'],
  7: [d=>d.r>=3, 'Minggu kedua bermula. Rehat bila pemasa kata, bukan sebelum.'],
  9: [d=>wlHasMove(d,['Knee Push Ups']), 'Bentuk dahulu, laju kemudian. Turun perlahan, naik dengan kuat.'],
  11:[d=>wlHasMove(d,['Squat Pause']), 'Turun perlahan, naik dengan kuat. Perlahan lebih susah, dan itulah tujuannya.'],
  15:[d=>d.ex.length>=6 && d.r>=3, 'Pusingan terakhir di situlah perubahan berlaku. Habiskan dengan kuat.'],
  18:[d=>wlHasMove(d,['Skater Jump']), 'Gerakan yang terkawal lebih berkesan daripada yang laju.'],
  19:[d=>wlHasMove(d,['Squat Jump']), 'Kardio hari ini. Terus bergerak, dan bernafas semasa rehat.'],
  21:[d=>d.ex.length>=7, 'Minggu terakhir. Buat setiap ulangan dengan bentuk terbaik anda.'],
  23:[d=>wlHasMove(d,['Knee Push Ups','Push Up']), 'Badan atas hari ini. Bahu ke belakang, teras ketat.']
};
function wlHasMove(d,names){ return d.ex.some(n=>names.indexOf(n)>=0); }
function wlTip(gi){ const c=WL30_TIP_IF[gi]; return c && wlMe() && !c[0](wlDay(gi)) ? c[1] : WL30_TIPS[gi]; }

/* the daily checklist: the walking ramp and the nutrition missions are
   MAK2FIT's (LB30_STEPS, LB30_MISI); water is half a litre more for a man */
const WL30_CHECKS=[['misi','Nutrition mission','food'],['makan','Ate to plan','clipboard'],['tidur','Slept 7 hours','moon']];
function wlWater(gi){ const w=gi<7?2.0:gi<14?2.2:gi<21?2.3:2.5; return wlMale()?w+0.5:w; }
function wlStepsFor(gi){ return (typeof LB30_STEPS!=='undefined' && LB30_STEPS[gi]) || 6000; }
function wlMisi(gi){ return (typeof LB30_MISI!=='undefined' && LB30_MISI[gi]) || ''; }

const WL30_FIT=[['squat','Bodyweight Squat','reps'],['push','Knee Push Ups','reps'],['jack','Jumping Jack','reps'],['crunch','Crunch','reps'],['plank','Plank','secs']];
const WL30_CHECKINS=[1,15,30];

/* the program, in the shape the rest of the app reads: the template's days
   (the hub plays each member's own, wlDayFor) */
const WL30=(function(){
  const weeks=WL30_WEEKS.map(w=>({days:WL30_DAYS.slice(w.from-1,w.to).map(d=>({name:d.n, ex:d.ex, r:d.r, k:d.k}))}));
  return {id:WL30_ID, name:WL30_NAME, sub:WL30_SUB, goal:'Fat Loss', level:'Beginner', dur:20, rounds:3,
    c1:'#2a1016', c2:'#0b0b0d', ac:'#EF4444', icon:'✦', weeks, hub:true, oneTime:true, price:WL30_PRICE, wk:4,
    desc:'30 hari bakar lemak di rumah, untuk lelaki dan wanita. Pelan anda sendiri dari soalan ringkas — '+
         'gerakan, minit dan kalori ikut tahap, badan dan masa anda — dengan menu Malaysia, senarai belanja, '+
         'Nutrition Academy dan fit test pada Hari 1 dan Hari 30.'};
})();
PROGRAMS = [WL30].concat(PROGRAMS);

/* ── state ── */
function wlData(){
  const d=HF.data.wl30||(HF.data.wl30={});
  d.check=d.check||{}; d.fit=d.fit||{}; d.body=d.body||{}; d.half=d.half||{}; d.steps=d.steps||{}; d.water=d.water||{}; d.shop=d.shop||{};
  return d;
}
function wlOwned(){ return ownsProgram(WL30); }
function wlDone(){ return Math.min(progDone(WL30_ID), WL30_DAYS.length); }
/* the day to do next, 0-based; 30 when the program is finished */
function wlNext(){ return wlDone(); }
function wlWeekOf(gi){ const n=gi+1; for(let i=0;i<WL30_WEEKS.length;i++) if(n>=WL30_WEEKS[i].from&&n<=WL30_WEEKS[i].to) return i; return 0; }

/* ═══ the member's own plan ═══
   WL30_DAYS stays the template; wlDayFor(gi) is what they do:
     · their level sets the seconds of work, the rounds and the step on each
       ladder (wall → knee → floor push-up, squat jump → squat pulse);
     · no jumping (an apartment, a sleeping child, a knee) swaps every jump
       and run on the spot for a quiet move; a sore knee, back or wrist, or a
       birth in the last year, swaps what loads it;
     · no chair or no bottles swaps the moves that need them;
     · their minutes cap every day (rounds first, then moves);
     · their focus turns one full-body day a week to it;
     · their sex, activity and pace set the calorie target.
   Day 1 and Day 30 (the fit test) keep the same moves so they can be compared. */
const WL30_Q=[
  {k:'sex', t:'Anda lelaki atau perempuan?', s:'Untuk sasaran kalori anda, dan soalan yang berkaitan dengan anda sahaja.', o:[
    ['l','Lelaki','','person'],
    ['p','Perempuan','','person']]},
  {k:'level', t:'Bagaimana anda bersenam sekarang?', s:'Jujur, pelan anda bermula di sini.', o:[
    ['baru','Baru mula','Tak bersenam, atau sudah lama berhenti','sunrise'],
    ['pernah','Kadang-kadang','Bersenam sekali-sekala','steps'],
    ['aktif','Aktif','Bersenam 2–3 kali seminggu atau lebih','flame']]},
  {k:'pain', multi:true, t:'Ada bahagian yang selalu sakit?', s:'Kami tukar gerakan yang membebankannya. Pilih semua yang berkaitan.', o:[
    ['lutut','Lutut','Sakit bila naik tangga atau mencangkung','person'],
    ['belakang','Belakang bawah','Sakit bila membongkok atau baring lama','person'],
    ['tangan','Pergelangan tangan','Sakit bila menongkat badan dengan tangan','person'],
    ['tiada','Tiada','Badan saya okey','check']]},
  {k:'mom', when:a=>a.sex==='p', t:'Ada yang perlu kami tahu?', s:'Supaya pelan anda selamat.', o:[
    ['tidak','Tiada','','check'],
    ['bersalin','Bersalin dalam 12 bulan lepas','','heart'],
    ['hamil','Sedang mengandung','','heart']]},
  {k:'jump', t:'Boleh melompat di rumah?', s:'Lompatan membakar lebih banyak, tetapi bising dan lebih berat untuk lutut.', o:[
    ['ya','Boleh','Tiada jiran di bawah, lantai yang sesuai','flame'],
    ['tidak','Tanpa lompat','Apartmen, anak tidur, atau lutut tak selesa','home']]},
  {k:'mins', t:'Berapa minit sehari anda ada?', s:'Setiap sesi tidak akan melebihi masa ini.', o:[
    [15,'15 minit','Waktu sibuk, sesi pendek','clock'],
    [20,'20 minit','Sederhana','clock'],
    [25,'25 minit','Paling banyak hasil','clock']]},
  {k:'fact', f:'minit'},
  {k:'focus', t:'Mana yang paling anda mahu ubah?', s:'Satu hari seminggu jadi khas untuknya.', o:[
    ['semua','Seluruh badan','Seimbang, semua bahagian','person'],
    ['perut','Perut & pinggang','Teras yang kuat dan pinggang','target'],
    ['atas','Dada, bahu & lengan','Badan atas yang kuat','workout'],
    ['bawah','Kaki & punggung','Enjin terbesar badan anda','flame']]},
  {k:'equip', multi:true, t:'Apa yang ada di rumah?', s:'Tiada pun tak apa. Kami tukar gerakan yang memerlukannya.', o:[
    ['kerusi','Kerusi yang kukuh','Untuk dip, step-up dan squat','chair'],
    ['botol','Dua botol air atau dumbbell','Sebagai pemberat','bottle'],
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
    ['keluarga','Masak untuk keluarga','Satu masakan untuk seisi rumah','people'],
    ['beli','Kebanyakannya beli','Kedai, warung, kafe pejabat','bag']]}
];
const WL30_ACT={duduk:1.2, ringan:1.375, aktif:1.55};
const WL30_PACE={perlahan:0.25, sederhana:0.5};
const WL30_SECS={baru:30, pernah:40, aktif:45};
/* their focus: what it is called, and for each week [the day that turns
   to it, the day it copies], never the day next to its copy */
const WL30_FOCUS={perut:['Perut & Pinggang',[[1,4],[12,10],[19,17],[26,24]]],
                  atas:['Dada, Bahu & Lengan',[[1,4],[12,9],[19,16],[26,23]]],
                  bawah:['Kaki & Punggung',[[5,2],[11,7],[18,14],[25,21]]]};
function wlFlex(me,gi){ const f=WL30_FOCUS[me.focus]; if(!f) return -1; const x=f[1].filter(p=>p[0]===gi)[0]; return x?x[1]:-1; }
/* the moves that leave the floor or run on the spot */
const WL30_JUMPS=['Jumping Jack','Squat Jump','Skater Jump','Half Burpee','Burpee','Power Skip','Plank Jack','High Knee','Butt Kick',
                  'Fast Feet','Lunges Jump','Tuck Jump','Sprint On Spot','Lateral Hop','Broad Jump'];
/* a jump that can't be done gives way to a quiet move that still raises the
   heart rate, before anything else */
const WL30_QUIET=['Mountain Climber','Plank Shoulder Taps','Bear Walk','Seated High Knee|kerusi','Fast Seated High Knee|kerusi',
                  'Seated Jack|kerusi','Bicycle Crunch','Squat Pulse','Side Lunges','Dead Bug'];
/* what loads a sore part, or a body after birth, or can't be done quietly,
   and what replaces it; '|kerusi' or '|botol' needs that at home */
const WL30_SWAP={
  lompat:{from:WL30_JUMPS,
         to:['Squat Pulse','Mountain Climber','Seated High Knee|kerusi','Alternating Lunges','Side Lunges','Plank Shoulder Taps',
             'Bicycle Crunch','Reverse Lunges','Calf Raises','Bear Walk','Squat Pause']},
  lutut:{from:['Bodyweight Squat','Squat Pulse','Squat Pause','Squat Hold','Reverse Lunges','Walking Lunges','Alternating Lunges',
               'Curtsy Lunges','Side Lunges','Wall Sit','Chair Squat','Step Up Box or Chair','Bulgarian Split Squat',
               'Squat Jump','Skater Jump','Lunges Jump','Tuck Jump','Jumping Jack','Power Skip','High Knee','Butt Kick','Fast Feet',
               'Half Burpee','Burpee','Sprint On Spot'],
         to:['Hip Thrust','Single Leg Glutes Bridge','Chair Kick Back|kerusi','Bottle Hip Thrust|botol','Towel Glute Bridge',
             'Towel Deadlift','Calf Raises','Dead Bug','Mountain Climber','Plank Shoulder Taps','Bicycle Crunch']},
  belakang:{from:['Leg Raises','Flutter Kick','Russian Twist','Sit Up','Hollow Hold','Bicycle Crunch','V Sit Squat','Reverse Crunch'],
         to:['Dead Bug','Bird Dog','Side Plank','Plank','Single Leg Glutes Bridge','Hip Thrust','Calf Raises']},
  tangan:{from:['Wall Push Up','Knee Push Ups','Push Up','Push Up Hold','Plank Shoulder Taps','Mountain Climber','Bird Dog','Bear Walk',
               'Incline Push Up (Chair)','Tricep Dip Chair','Plank Jack','Half Burpee','Burpee','Plank','Side Plank'],
         to:['Bottle Shoulder Press|botol','Bottle Upright Row|botol','Bottle Front Raises|botol','Towel Shoulder Back Pull','Towel Upright Row',
             'Towel Front Raises','Dead Bug','Crunch','Hip Thrust','Wall Sit','Squat Pulse']},
  bersalin:{from:['Crunch','Sit Up','Bicycle Crunch','Russian Twist','Leg Raises','Flutter Kick','Hollow Hold','V Sit Squat','Reverse Crunch',
               'Plank Shoulder Taps','Mountain Climber','Push Up','Side Plank'].concat(WL30_JUMPS),
         to:['Dead Bug','Bird Dog','Hip Thrust','Single Leg Glutes Bridge','Chair Glute Bridge|kerusi','Knee Push Ups','Wall Push Up',
             'Calf Raises','Squat Pulse','Side Lunges']}
};
/* without a chair or bottles: each move and what takes its place */
const WL30_KIT={
  'Chair Squat':['kerusi',['Bodyweight Squat','Squat Pause']],
  'Tricep Dip Chair':['kerusi',['Push Up Hold','Knee Push Ups','Towel Bicep Curl']],
  'Incline Push Up (Chair)':['kerusi',['Knee Push Ups','Wall Push Up','Push Up Hold']],
  'Step Up Box or Chair':['kerusi',['Reverse Lunges','Alternating Lunges','Squat Pulse']],
  'Bottle Shoulder Press':['botol',['Towel Shoulder Press','Towel Front Raises']],
  'Bottle Bent Over Row':['botol',['Towel Shoulder Back Pull','Towel Upright Row']],
  'Bottle Lateral Raises':['botol',['Towel Front Raises','Towel Rotation Shoulder']],
  'Bottle Bicep Curl':['botol',['Towel Bicep Curl','Towel Upright Row']]
};
/* their level's ladders: [from, to…, weeks it applies (wi below), or from that week on (−)] */
const WL30_LADDER={
  baru:[['Push Up',['Knee Push Ups']],['Knee Push Ups',['Wall Push Up'],2],['Incline Push Up (Chair)',['Wall Push Up'],2],
        ['Squat Jump',['Squat Pulse','Bodyweight Squat']],['Skater Jump',['Side Lunges','Curtsy Lunges']],['Power Skip',['High Knee','Fast Feet']],
        ['Walking Lunges',['Reverse Lunges','Squat Pulse']],['Leg Raises',['Reverse Crunch','Dead Bug']],['Flutter Kick',['Dead Bug','Crunch']],
        ['Plank Jack',['Plank','Mountain Climber']],['Squat Pause',['Bodyweight Squat'],2]],
  aktif:[['Wall Push Up',['Knee Push Ups']],['Knee Push Ups',['Push Up'],-2],['Half Burpee',['Burpee'],-3]]
};

function wlMe(){ const m=wlData().me; return m&&m.done ? m : null; }
/* a man's plan: his answer, else the sex saved with the old menu */
function wlMale(){ const m=wlData().me; if(m&&m.sex) return m.sex==='l'; return (wlData().profile||{}).gender==='male'; }
function wlHas(me,k,v){ return (me[k]||[]).indexOf(v)>=0; }
function wlInDB(n){ for(let i=0;i<DB.length;i++) if(DB[i].n===n) return true; return false; }
/* what their answers rule out */
function wlParts(me){
  const p=(me.pain||[]).filter(x=>WL30_SWAP[x]);
  if(me.jump==='tidak') p.push('lompat');
  if(me.sex==='p' && me.mom==='bersalin') p.push('bersalin');
  return p;
}
function wlBlocked(n,me){ return wlParts(me).some(p=>WL30_SWAP[p].from.indexOf(n)>=0); }
function wlNeedsKit(n,me){ const k=WL30_KIT[n]; return !!(k && !wlHas(me,'equip',k[0])); }
/* the first candidate they can do: filmed, not already in the day, their
   kit, nothing that hurts; off turns the list round so days differ */
function wlPick(cands,me,used,off){
  for(let k=0;k<cands.length;k++){
    const c=cands[(k+(off||0))%cands.length].split('|'), n=c[0], need=c[1];
    if(need && !wlHas(me,'equip',need)) continue;
    if(used.indexOf(n)>=0 || !wlInDB(n)) continue;
    if(wlBlocked(n,me) || wlNeedsKit(n,me)) continue;
    return n;
  }
  return null;
}
/* one day, rebuilt for them; log (optional) counts what changed and why */
function wlDayFor(gi,log){
  const t=WL30_DAYS[gi], me=wlMe(); if(!t||!me) return t;
  const wi=wlWeekOf(gi), test=t.k==='test', work=!test && t.k!=='recover';
  let name=t.n, src=t, r=t.r;
  if(work && wlFlex(me,gi)>=0){
    src=WL30_DAYS[wlFlex(me,gi)]; name='Focus: '+WL30_FOCUS[me.focus][0];
    if(log) log.focus=(log.focus||0)+1;
  }
  const ex=[], note=k=>{ if(log) log[k]=(log[k]||0)+1; };
  const taken=()=>ex.concat(src.ex);
  src.ex.forEach(n0=>{
    let n=n0;
    /* their level first: the step on the ladder (the fit test keeps its moves) */
    if(work) (WL30_LADDER[me.level]||[]).forEach(l=>{
      if(l[0]!==n) return;
      if(l[2]>0 && wi>=l[2]) return; if(l[2]<0 && wi< -l[2]) return;
      const p=wlPick(l[1],me,taken()); if(p){ n=p; note('level'); }
    });
    /* then the kit they don't have */
    if(wlNeedsKit(n,me)){ const k=WL30_KIT[n][0], q=wlPick(WL30_KIT[n][1],me,taken()); note(k); n=q||''; }
    /* then anything that can't be done or hurts: one pick that suits them
       all, a quiet move first for a jump */
    const why=n ? wlParts(me).filter(p=>WL30_SWAP[p].from.indexOf(n)>=0) : [];
    if(why.length){
      let c=[]; const off=test?0:gi;
      why.forEach(p=>{ note(p); c=c.concat(WL30_SWAP[p].to); });
      n=(WL30_JUMPS.indexOf(n)>=0 && wlPick(WL30_QUIET,me,taken(),off)) || wlPick(c,me,taken(),off) || '';
    }
    if(n!==n0) note('swap');
    if(n && ex.indexOf(n)<0) ex.push(n);
  });
  /* their level: rounds and seconds (the fit test stays as it is) */
  let dur=null;
  if(work){
    dur=WL30_SECS[me.level]||null;
    if(me.level==='aktif' && wi===0) r=3;
  }
  const d={n:name, k:t.k, r, ex, dur};
  /* their minutes: down to two rounds, then down to four moves, then one round */
  const cap=+me.mins||25;
  if(!test){
    while(wlMinutes(d)>cap && d.r>2) d.r--;
    while(wlMinutes(d)>cap && d.ex.length>4) d.ex=d.ex.slice(0,-1);
    while(wlMinutes(d)>cap && d.r>1) d.r--;
  }
  return d;
}
function wlDay(gi){ return wlDayFor(gi)||WL30_DAYS[gi]; }
/* the fit test, with their own moves where an answer changed one */
function wlFitList(){
  const d=wlDay(0);
  return WL30_FIT.map((f,i)=>{
    const n=d.ex[i]||f[1], e=DB.filter(x=>x.n===n)[0];
    return [f[0], n, e&&e.t==='hold'?'secs':'reps'];
  });
}
function wlPaceOf(me){ if(me&&me.feed) return 0.25; return me&&WL30_PACE[me.pace] || 0.5; }
function wlPace(){ return wlPaceOf(wlMe()); }

/* a movement, in the shape the player plays */
function wlEx(name){
  const e=DB.filter(x=>x.n===name && x.v)[0] || DB.filter(x=>x.n===name)[0] || {n:name, v:'', m:'Full Body', dur:45};
  return {n:name, v:e.v||'', m:e.m, dur:e.dur||45, eq:e.eq||'Bodyweight', t:e.t};
}
function wlExercises(d){ return d.ex.map(n=>{ const e=wlEx(n); if(d.dur) e.dur=d.dur; return e; }); }
function wlSecs(exs,r){ return exs.reduce((a,e)=>a+e.dur+WL30_REST,0)*r; }
function wlMinutes(d){ return Math.max(1, Math.round(wlSecs(wlExercises(d),d.r)/60)); }
/* two shorter sessions: the moves split in two, each half for all its rounds */
function wlHalves(d){ const exs=wlExercises(d), m=Math.ceil(exs.length/2); return [exs.slice(0,m), exs.slice(m)]; }
function wlJumps(d){ return d.ex.filter(n=>WL30_JUMPS.indexOf(n)>=0).length; }
const WL30_KIND={test:'Fit Test', train:'Full Body', lower:'Lower Body', upper:'Upper Body', cardio:'Cardio', core:'Core', recover:'Recovery'};

/* ── the photographs (28 Oct 2026, Seth: "kemaskan gambar semua"): one
   athlete on BURN30's seamless red, a woman's set and a man's, made with
   ChatGPT (img/p/burn30, illustration only). Each member sees their own
   once they have answered; before that, the man's cover and the two in
   turn. Week 1 squat, 2 lunge, 3 mountain climber, 4 jump; the fit test a
   plank, recovery a stretch. ── */
const WL30_PH='/img/p/burn30/';
const WL30_IMG={
  l:{cover:'/img/p/wl30.jpg', weeks:['l-squat','l-lunge','l-climber','l-jump'], test:'l-plank', recover:'l-stretch'},
  p:{cover:WL30_PH+'p-cover.jpg', weeks:['p-squat','p-lunge','p-climber','p-jump'], test:'p-plank', recover:'p-stretch'},
  x:{cover:'/img/p/wl30.jpg', weeks:['p-squat','l-lunge','p-climber','l-jump'], test:'l-plank', recover:'p-stretch'}
};
function wlImgSet(sx){ const m=wlData().me; return WL30_IMG[sx||(m&&m.sex)] || WL30_IMG.x; }
/* a day's and a week's photograph: the wide copy (name-w.jpg, the studio
   red carried out to both sides), so a wide box crops only backdrop */
function wlBg(u){ return "background-image:url('"+u+"')"; }
function wlCover(sx){ return wlImgSet(sx).cover; }
function wlWeekImg(wi){ const w=wlImgSet().weeks[wi]; return w ? WL30_PH+w+'-w.jpg' : WL30_COVER; }
function wlDayImg(gi){ const d=WL30_DAYS[gi], s=wlImgSet(); return d&&d.k==='test' ? WL30_PH+s.test+'-w.jpg' : d&&d.k==='recover' ? WL30_PH+s.recover+'-w.jpg' : wlWeekImg(wlWeekOf(gi)); }

/* ── the program's home ── */
let wlTab='plan', wlWeek=-1, wlMenuDay=-1, wlFoodSeg='today', wlShopWeek=-1;
function wlScrollTabs(){ try{ const s=$('screen'), a=$('wl-tabs'); if(s&&a&&a.offsetTop) s.scrollTop=Math.max(0,a.offsetTop-70); }catch(e){} }
function wlSetTab(t){ wlTab=t; renderWL30(); wlScrollTabs(); }
function wlSetFoodSeg(x){ wlFoodSeg=x; renderWL30(); wlScrollTabs(); }
function wlHero(){
  return '<div class="lbx-hero bn-hero" style="background-image:url(\''+wlCover()+'\')"><div class="lbx-hero-ov"></div>'+
    '<div class="lbx-hero-tx"><img class="lbx-mark" src="/img/brand/hfplus-mark.png" alt="HITFAT+">'+
    '<div class="lbx-name bn-name">'+WL30_NAME+'</div>'+
    '<div class="lbx-tags"><span>30 days</span><span>15–25 min</span><span>Men & women</span><span>At home</span></div></div></div>';
}
function renderWL30(){
  if(wlQ>=0){ $('pgd-body').innerHTML=wlQuiz(); return; }
  const owned=wlOwned(), done=wlDone(), tot=WL30_DAYS.length, nx=wlNext();
  if(wlWeek<0) wlWeek=wlWeekOf(Math.min(nx,tot-1));
  const pill=!owned ? {icon:'lock',label:'RM'+WL30_PRICE,go:'wlBuy()'}
           : nx<tot ? {icon:'play',label:'Day '+(nx+1),go:'wlOpenDay('+nx+')'} : null;
  let h=pdxBar('program',pill)+wlHero()+'<div class="lbx bn">';
  if(!owned){
    h+='<div class="lbx-card lbx-sell"><div class="lbx-k">For men & women</div>'+
      '<div class="lbx-h">30 hari bakar lemak, dari rumah anda.</div>'+
      '<div class="lbx-p">Pelan latihan anda sendiri 15–25 minit sehari, sasaran kalori, menu makanan Malaysia, dan progres anda direkod.</div>'+
      '<button class="lbx-go" onclick="wlBuy()">'+glyph('lock')+'Get the Program · RM'+WL30_PRICE+'</button>'+
      '<button class="lbx-ghost" onclick="openPaywall(\'BURN30 is included in HITFAT+.\')">'+glyph('star')+'Included in HITFAT+</button></div>';
  } else if(nx<tot && !wlMe()){
    /* before their first day (or, for a member part-way, now): the questionnaire */
    h+='<div class="lbx-card lbq-invite"><div class="lbx-k">'+(done?'New · your own plan':'Before Day 1')+'</div>'+
      '<div class="lbx-h">Jom bina pelan 30 hari anda.</div>'+
      '<div class="lbx-p">'+wlQCount(WL30_Q.length)+' soalan, 2 minit. Gerakan, minit dan kalori ikut tahap, badan dan masa anda.</div>'+
      '<button class="lbx-go" onclick="wlQuizOpen()">'+glyph('sliders')+'Bina Pelan Saya</button>'+
      (done?'<button class="lbx-ghost" onclick="wlOpenDay('+nx+')">'+glyph('play')+'Continue Day '+(nx+1)+'</button>':'')+'</div>';
  } else if(nx<tot){
    const d=wlDay(nx), wi=wlWeekOf(nx), st=liveStreak();
    h+='<div class="lbx-card lbx-now">'+
      '<div class="lbx-now-top">'+lbRing(done/tot,84,done+'<i>/'+tot+'</i>','days')+
        '<div class="lbx-now-tx"><div class="lbx-hello">'+lbHello()+'</div>'+
        '<div class="lbx-h">Day '+(nx+1)+' · Week '+(wi+1)+'</div>'+
        '<div class="lbx-p">'+WL30_WEEKS[wi].n+'. '+(st>1?st+'-day streak 🔥':'One day at a time.')+'</div></div></div>'+
      '<div class="lbx-today" onclick="wlOpenDay('+nx+')">'+
        '<div class="lbx-today-ph" style="'+wlBg(wlDayImg(nx))+'"><span class="lbx-badge">Today</span></div>'+
        '<div class="lbx-today-b"><div class="lbx-k">'+(WL30_KIND[d.k]||'Workout')+' · '+wlMinutes(d)+' min · '+d.ex.length+' moves</div>'+
        '<div class="lbx-t">'+d.n+'</div></div></div>'+
      '<button class="lbx-go" onclick="wlOpenDay('+nx+')">'+glyph('play')+(done?'Continue Day '+(nx+1):'Start Day 1')+'</button></div>';
  } else {
    h+='<div class="lbx-card lbx-now lbx-fin">'+lbRing(1,84,'30','days')+
      '<div class="lbx-h">30 days complete</div><div class="lbx-p">Lihat sejauh mana anda sudah pergi.</div>'+
      '<button class="lbx-go" onclick="wlSetTab(\'progress\')">'+glyph('trophy')+'See Your Results</button></div>';
  }
  if(owned && typeof lbScanHero==='function') h+=lbScanHero();
  h+='<div class="lbx-seg" id="wl-tabs">'+[['plan','Plan'],['food','Nutrition'],['learn','Learn'],['progress','Progress'],['guide','Start Here']]
    .map(t=>'<button class="'+(wlTab===t[0]?'on':'')+'" onclick="wlSetTab(\''+t[0]+'\')">'+t[1]+'</button>').join('')+'</div>';
  if(wlTab==='food') h+=wlFood();
  else if(wlTab==='learn') h+=wlLearn();
  else if(wlTab==='progress') h+=wlProgress();
  else if(wlTab==='guide') h+=wlGuide();
  else h+=wlPlan();
  h+='</div>';
  $('pgd-body').innerHTML=h;
  if(wlTab==='progress' && owned && typeof loadBoard==='function') loadBoard('burn30','lb-burn30');
}

/* ── the questionnaire: one question a screen, a woman's question only for her ── */
let wlQ=-1, wlQA=null;
function wlQOn(i){ const q=WL30_Q[i]; return !!q && (!q.when || q.when(wlQA||{})); }
function wlQuizOpen(at){
  const me=wlData().me||{}, pr=wlProfile();
  wlQA=JSON.parse(JSON.stringify(me));
  wlQA.wt=wlQA.wt||pr.wt||''; wlQA.ht=wlQA.ht||pr.ht||''; wlQA.age=wlQA.age||pr.age||'';
  if(!wlQA.sex && (wlData().profile||{}).gender) wlQA.sex=wlData().profile.gender==='male'?'l':'p';
  wlQ=at||0; hidePanels(); $('progdetail').style.display='block'; renderWL30(); $('screen').scrollTop=0;
}
/* wlQ: 0 the intro, i+1 question i, past the end the result */
function wlQuizNext(){ do{ wlQ++; } while(wlQ<=WL30_Q.length && !wlQOn(wlQ-1)); renderWL30(); $('screen').scrollTop=0; }
function wlQuizBack(){
  if(wlQ<=0){ wlQ=-1; renderWL30(); return; }
  do{ wlQ--; } while(wlQ>0 && !wlQOn(wlQ-1));
  renderWL30(); $('screen').scrollTop=0;
}
function wlQPick(k,v,multi){
  if(multi){
    let l=wlQA[k]||[]; const i=l.indexOf(v);
    if(v==='tiada') l=i>=0?[]:['tiada'];
    else { l=l.filter(x=>x!=='tiada'); if(i>=0) l.splice(l.indexOf(v),1); else l.push(v); }
    wlQA[k]=l; renderWL30(); return;
  }
  wlQA[k]=v;
  if(k==='sex' && v==='l'){ delete wlQA.mom; delete wlQA.clear; delete wlQA.feed; }
  if(k==='mom' && v!=='bersalin'){ delete wlQA.clear; delete wlQA.feed; }
  if(k==='mom' && v!=='tidak'){ renderWL30(); return; }   /* a follow-up on the same screen */
  wlQuizNext();
}
function wlQTick(k){ wlQA[k]=!wlQA[k]; renderWL30(); }
function wlQBody(){
  const g=x=>parseFloat(($(x)||{}).value);
  const wt=g('wlq-wt'), ht=g('wlq-ht'), age=parseInt(($('wlq-age')||{}).value,10);
  if(!(wt>=30&&wt<=250) || !(ht>=120&&ht<=220) || !(age>=15&&age<=90)){ toast('Isi berat, tinggi dan umur'); return; }
  wlQA.wt=wt; wlQA.ht=ht; wlQA.age=age; wlQuizNext();
}
function wlQuizSave(){
  const d=wlData(); wlQA.done=true; wlQA.at=iso(0);
  d.me=wlQA; d.profile={gender:wlQA.sex==='l'?'male':'female', wt:wlQA.wt, ht:wlQA.ht, age:wlQA.age};
  HF.save(); wlQ=-1; wlTab='plan'; wlWeek=-1; renderWL30(); $('screen').scrollTop=0; toast('Pelan anda sudah sedia');
}
/* the questions alone (without the facts, and without hers for a man) */
function wlQCount(upto){ let c=0; for(let i=0;i<Math.min(upto,WL30_Q.length);i++) if(WL30_Q[i].k!=='fact' && wlQOn(i)) c++; return c; }
function wlQuiz(){
  const n=WL30_Q.length, qn=wlQCount(n), isFact=wlQ>0&&wlQ<=n&&WL30_Q[wlQ-1].k==='fact';
  let h='<div class="lbq bn">';
  const bar='<div class="lbq-top"><button class="pdx-back" aria-label="Back" onclick="wlQuizBack()">'+glyph('chevleft')+'</button>'+
    '<div class="lbq-bar"><i style="width:'+Math.round(Math.min(wlQ,n)/n*100)+'%"></i></div><span class="lbq-n">'+(isFact?'':wlQCount(Math.min(wlQ,n))+'/'+qn)+'</span></div>';
  if(wlQ===0){
    const nm=((HF.data.prefs&&HF.data.prefs.name)||'').trim().split(/\s+/)[0];
    return h+bar+'<div class="lbq-intro bn-hero" style="background-image:url(\''+wlCover(wlQA&&wlQA.sex)+'\')"><div class="lbx-hero-ov"></div><div class="tx">'+
      '<div class="k">BURN30</div><div class="t">Jom bina pelan 30 hari anda'+(nm?', '+hesc(nm):'')+'.</div></div></div>'+
      '<div class="lbq-p">'+qn+' soalan, lebih kurang 2 minit. Jawapan anda menentukan gerakan, pusingan, minit setiap hari dan sasaran kalori anda.</div>'+
      '<div class="lbq-list">'+[['person','Anda, tahap anda dan bahagian yang sakit'],['home','Lompat atau tidak, dan alat di rumah'],['clock','Masa yang anda ada'],
        ['flame','Badan, aktiviti dan rentak'],['food','Cara anda makan']]
        .map(x=>'<div><span>'+glyph(x[0])+'</span>'+x[1]+'</div>').join('')+'</div>'+
      '<button class="lbx-go" onclick="wlQuizNext()">'+glyph('play')+'Mula</button></div>';
  }
  if(wlQ>n) return h+wlQuizResult()+'</div>';
  const q=WL30_Q[wlQ-1], v=wlQA[q.k];
  if(q.k==='fact') return h+bar+lbFact(q.f,wlQA)+'<button class="lbx-go" onclick="wlQuizNext()">Seterusnya</button></div>';
  h+=bar+'<div class="lbq-q">'+hesc(q.t)+'</div>'+(q.s?'<div class="lbq-s">'+hesc(q.s)+'</div>':'');
  if(q.k==='body'){
    const fld=(id,l,u,val,m)=>'<label class="esf"><span>'+l+'</span><input class="inp" id="'+id+'" inputmode="'+m+'" placeholder="0" value="'+(val||'')+'"><em>'+u+'</em></label>';
    return h+'<div class="esfields lbq-body">'+fld('wlq-wt','Berat','kg',wlQA.wt,'decimal')+fld('wlq-ht','Tinggi','cm',wlQA.ht,'decimal')+fld('wlq-age','Umur','tahun',wlQA.age,'numeric')+'</div>'+
      '<button class="lbx-go" onclick="wlQBody()">Seterusnya</button></div>';
  }
  h+='<div class="lbq-opts'+(q.grid?' grid':'')+'">'+q.o.map(o=>{
    const on=q.multi ? (v||[]).indexOf(o[0])>=0 : v===o[0];
    return '<button class="lbq-o'+(on?' on':'')+'" onclick="wlQPick(\''+q.k+'\','+(typeof o[0]==='number'?o[0]:'\''+o[0]+'\'')+(q.multi?',1':'')+')">'+
      '<span class="ic">'+glyph(o[3])+'</span><span class="tx"><b>'+hesc(o[1])+'</b>'+(o[2]?'<small>'+hesc(o[2])+'</small>':'')+'</span>'+
      '<span class="tk">'+(on?glyph('check'):'')+'</span></button>';
  }).join('')+'</div>';
  if(q.k==='mom' && v==='hamil'){
    return h+'<div class="lbq-warn">'+glyph('heart')+'<div><b>Tahniah.</b> BURN30 tidak dibina untuk kehamilan: ia mengurangkan kalori, dan '+
      'gerakannya tidak disusun untuk badan yang mengandung. Simpan program ini sehingga selepas bersalin dan doktor membenarkan anda bersenam. '+
      'Program ini kekal dalam akaun anda.</div></div></div>';
  }
  if(q.k==='mom' && v==='bersalin'){
    h+='<div class="lbq-ticks">'+
      '<div class="obrow obtick'+(wlQA.clear?' on':'')+'" onclick="wlQTick(\'clear\')"><span class="box">'+(wlQA.clear?'✓':'')+'</span>'+
        '<span>Doktor sudah membenarkan saya bersenam (biasanya pada pemeriksaan 6 minggu selepas bersalin)</span></div>'+
      '<div class="obrow obtick'+(wlQA.feed?' on':'')+'" onclick="wlQTick(\'feed\')"><span class="box">'+(wlQA.feed?'✓':'')+'</span>'+
        '<span>Saya sedang menyusukan bayi</span></div></div>';
    return h+(wlQA.clear?'<button class="lbx-go" onclick="wlQuizNext()">Seterusnya</button>':'<div class="lbq-hint">Tunggu kebenaran doktor dahulu. Program ini kekal dalam akaun anda.</div>')+'</div>';
  }
  if(q.multi || (v!==undefined && v!==null && v!=='')) h+='<button class="lbx-go'+((v&&(v.length||typeof v==='number'))?'':' off')+'" onclick="'+((v&&(v.length||typeof v==='number'))?'wlQuizNext()':'')+'">Seterusnya</button>';
  return h+'</div>';
}
/* what their answers did: only the changes that really happened */
const WL30_SAYS={
  baru:'Bermula perlahan: 30 saat setiap gerakan, dan versi yang lebih mudah seperti push-up dinding dan squat pulse ganti squat jump.',
  pernah:'40 saat setiap gerakan, dua pusingan minggu pertama, tiga dari Minggu 2.',
  aktif:'45 saat setiap gerakan, 3 pusingan dari minggu pertama, push-up penuh dan burpee di minggu akhir.',
  lompat:'Tanpa lompat: setiap lompatan dan larian setempat ditukar kepada gerakan yang senyap tetapi tetap membakar.',
  lutut:'Lutut selamat: squat, lunge dan lompatan ditukar kepada gerakan punggung dan teras yang tidak membebankan lutut.',
  belakang:'Belakang selamat: tiada leg raise, sit-up atau pusingan badan; teras dilatih dengan dead bug, bird dog dan plank.',
  tangan:'Pergelangan tangan selamat: push-up dan gerakan menongkat tangan ditukar kepada gerakan berdiri dan baring.',
  bersalin:'Selepas bersalin: tiada lompatan, crunch atau leg raise; teras dibina semula dengan dead bug, bird dog dan bridge.',
  kerusi:'Tiada kerusi: dip, step-up dan squat kerusi ditukar kepada gerakan lantai.',
  botol:'Tiada botol: gerakan pemberat ditukar kepada gerakan tuala untuk bahu dan lengan.'
};
function wlQuizResult(){
  const keep=wlData().me; wlData().me=JSON.parse(JSON.stringify(wlQA)); wlData().me.done=true;
  const log={}, wk=[0,0,0,0]; let mins=0, secs=45, r1=0, r4=0;
  for(let gi=0;gi<WL30_DAYS.length;gi++){ const d=wlDayFor(gi,log); wk[wlWeekOf(gi)]+=wlMinutes(d);
    if(d.k!=='test'&&d.k!=='recover'){ mins=Math.max(mins,wlMinutes(d)); if(d.dur) secs=d.dur; if(!r1) r1=d.r; r4=d.r; } }
  const swapped=log.swap||0, me=wlData().me, tg=wlTarget(), nm=((HF.data.prefs&&HF.data.prefs.name)||'').trim().split(/\s+/)[0];
  const lunch=LB30_MEALS[me.meals] ? LB30_MEALS[me.meals].filter(m=>m[0]==='tengahari')[0] : ['tengahari',LB30_MENU.tengahari.share];
  const rice=tg ? lbFist(lbRice(LB30_MENU.tengahari.opts[0],tg.cal*lunch[1])).replace(' genggam','') : null;
  wlData().me=keep;
  const lines=[[me.level==='baru'?'sunrise':me.level==='aktif'?'flame':'steps', WL30_SAYS[me.level]]];
  ['lompat','lutut','belakang','tangan','bersalin'].forEach(k=>{ if(log[k]) lines.push([k==='lompat'?'home':'heart',WL30_SAYS[k]]); });
  if(log.focus) lines.push(['target','Satu hari seminggu khas untuk '+WL30_FOCUS[me.focus][0].toLowerCase()+'.']);
  if(log.kerusi) lines.push(['chair',WL30_SAYS.kerusi]);
  if(log.botol) lines.push(['bottle',WL30_SAYS.botol]);
  if(me.cook==='beli') lines.push(['bag','Sarapan dan makan tengah hari dari pilihan yang mudah dibeli di kedai dan warung.']);
  const wt=[];
  if(log.lompat) wt.push('Tanpa lompat'); if(log.lutut) wt.push('Lutut selamat'); if(log.belakang) wt.push('Belakang selamat'); if(log.tangan) wt.push('Tangan selamat');
  if(log.bersalin) wt.push('Selepas bersalin'); if(log.focus) wt.push('Fokus '+WL30_FOCUS[me.focus][0].toLowerCase());
  if(log.kerusi) wt.push('Tanpa kerusi'); if(log.botol) wt.push('Tanpa botol');
  const mt=(me.avoid||[]).filter(a=>LB30_AVOID[a]).map(a=>'Tanpa '+LB30_AVOID[a]);
  if(me.cook==='beli') mt.push('Mudah dibeli'); if(me.feed) mt.push('Menyusukan bayi');
  const stat=xs=>'<div class="lbq-stats">'+xs.map(x=>'<div><b>'+x[0]+'</b><span>'+x[1]+'</span></div>').join('')+'</div>';
  const chips=xs=>xs.length?'<div class="lbq-chips">'+xs.map(x=>'<span>'+hesc(x)+'</span>').join('')+'</div>':'';
  const end=tg&&me.wt ? Math.round((me.wt-wlPaceOf(me)*30/7)*10)/10 : null;
  return '<div class="lbq-res"><div class="lbq-res-h bn-hero" style="background-image:url(\''+wlCover(me.sex)+'\')"><div class="lbx-hero-ov"></div><div class="tx">'+
      '<div class="k">Pelan anda sudah sedia</div><div class="t">30 hari, dibina untuk '+(nm?hesc(nm):'anda')+'.</div></div></div>'+
    '<div class="lbq-card"><div class="lbq-ch">'+glyph('workout')+'<b>Workout anda</b><span>'+WL30_Q[1].o.filter(o=>o[0]===me.level)[0][1]+'</span></div>'+
      stat([[mins,'min sehari'],[secs,'saat / gerakan'],[(r1===r4?r1:r1+'→'+r4),'pusingan'],[swapped,'gerakan ditukar']])+chips(wt)+
      '<div class="lbq-chart sm">'+lbWeeksSVG(wk,WL30_WEEKS)+'</div><div class="lbq-cap">Minit seminggu: naik perlahan, supaya badan sempat menyesuaikan diri.</div></div>'+
    (tg?'<div class="lbq-card"><div class="lbq-ch">'+glyph('food')+'<b>Menu anda</b><span>'+(LB30_MEALS[me.meals]?me.meals+' kali sehari':'3 kali sehari')+'</span></div>'+
      stat([[tg.cal.toLocaleString(),'kcal sehari'],[tg.prot+'g','protein'],[rice||'–','genggam nasi tengah hari']])+chips(mt)+
      (end!==null?'<div class="lbq-chart sm">'+lbProjSVG(me.wt,end)+'</div><div class="lbq-cap">Anggaran jika anda ikut pelan, '+wlPaceOf(me)+' kg seminggu. Bukan janji: setiap badan berbeza.</div>':'')+'</div>':'')+
    '<details class="lbq-more"><summary>'+glyph('check')+'Apa yang berubah untuk anda <span>'+lines.length+'</span></summary>'+
      '<div class="lbq-lines">'+lines.map(l=>'<div><span>'+glyph(l[0])+'</span><p>'+l[1]+'</p></div>').join('')+'</div></details>'+
    '<div class="lbq-fine">Rasa sakit semasa bersenam? Berhenti dan berehat. Anda boleh ubah jawapan bila-bila masa di tab Plan.</div>'+
    '<button class="lbx-go" onclick="wlQuizSave()">'+glyph('play')+'Lihat Pelan Saya</button>'+
    '<button class="lbx-ghost" onclick="wlQ=1;renderWL30()">Ubah jawapan</button></div>';
}
/* their plan in one card, at the top of Plan */
function wlMeCard(){
  const me=wlMe(); if(!me) return '';
  const tags=[me.sex==='l'?'Lelaki':'Perempuan', WL30_Q[1].o.filter(o=>o[0]===me.level)[0][1], me.mins+' min'];
  if(me.jump==='tidak') tags.push('Tanpa lompat');
  (me.pain||[]).forEach(p=>{ const t={lutut:'Lutut selamat',belakang:'Belakang selamat',tangan:'Tangan selamat'}[p]; if(t) tags.push(t); });
  if(me.sex==='p' && me.mom==='bersalin') tags.push('Selepas bersalin');
  if(WL30_FOCUS[me.focus]) tags.push(WL30_FOCUS[me.focus][0]);
  if(LB30_MEALS[me.meals]) tags.push(me.meals+'× makan sehari');
  return '<div class="lbx-card lbq-me"><div class="h"><span class="ic">'+glyph('sliders')+'</span><div class="tt"><div class="lbx-k">Your plan</div><b>Dibina dari jawapan anda</b></div>'+
    '<button onclick="wlQuizOpen()">'+glyph('pencil')+'Ubah</button></div>'+
    '<div class="lbq-chips row">'+tags.map(x=>'<span>'+hesc(x)+'</span>').join('')+'</div></div>';
}

/* ── Plan: their plan, today's routine, then the month as day tiles ── */
function wlPlan(){
  const owned=wlOwned(), done=wlDone(), tot=WL30_DAYS.length, nx=wlNext();
  let h='';
  if(owned) h+=wlMeCard();
  if(owned && nx<tot) h+=wlChecklist();
  const w=WL30_WEEKS[wlWeek]||WL30_WEEKS[0];
  h+='<div class="lbx-sec"><div class="lbx-sh"><div class="lbx-st">Your 30 Days</div><div class="lbx-ss">'+done+' of '+tot+' days done</div></div></div>';
  h+='<div class="lbx-dots">'+WL30_DAYS.map((d,i)=>'<i class="'+(i<done?'d':i===nx&&owned?'n':'')+(WL30_WEEKS.some(x=>x.from===i+1&&i>0)?' gap':'')+'"></i>').join('')+'</div>';
  h+='<div class="lbx-weeks">'+WL30_WEEKS.map((x,i)=>
    '<button class="'+(i===wlWeek?'on':'')+'" onclick="wlWeek='+i+';renderWL30()"><small>Week '+(i+1)+'</small><b>'+(done>=x.to?'✓ ':'')+x.n+'</b></button>').join('')+'</div>';
  h+='<div class="lbx-wcover" style="'+wlBg(wlWeekImg(wlWeek))+'"><div><small>Week '+(wlWeek+1)+' · Days '+w.from+'–'+w.to+'</small><b>'+w.n+'</b><span>'+w.s+'</span></div></div>';
  h+='<div class="lbx-days">'+WL30_DAYS.slice(w.from-1,w.to).map((d0,j)=>{
    const gi=w.from-1+j, d=wlDay(gi), isDone=gi<done, now=gi===nx&&owned;
    return '<div class="lbx-day'+(isDone?' done':'')+(now?' now':'')+' k-'+d.k+'" onclick="wlOpenDay('+gi+')">'+
      '<div class="lbx-day-n"><small>DAY</small><b>'+(gi+1)+'</b>'+(isDone?'<span class="ck">'+glyph('check')+'</span>':'')+'</div>'+
      '<div class="lbx-day-t">'+d.n+'</div>'+
      '<div class="lbx-day-m">'+(d.k==='test'?'Fit test':d.k==='recover'?'Recovery · '+wlMinutes(d)+' min':(WL30_KIND[d.k]||'')+' · '+wlMinutes(d)+' min')+'</div>'+
      (now?'<span class="lbx-day-now">Today</span>':'')+'</div>';
  }).join('')+'</div>';
  return h;
}

/* today's routine: the workout, the steps and the water that fill, the day's
   nutrition mission written out, and the rest as ticks */
function wlChecklist(){
  const w=wlData(), t=iso(0), gi=Math.min(wlNext(),WL30_DAYS.length-1);
  const c=w.check[t]||{}, trained=doneToday();
  const stepT=wlStepsFor(gi), st=+w.steps[t]||0, waterT=wlWater(gi), wt=+w.water[t]||0;
  const stepOk=st>=stepT, waterOk=wt>=waterT-0.001;
  let n=(trained?1:0)+(stepOk?1:0)+(waterOk?1:0);
  WL30_CHECKS.forEach(x=>{ if(c[x[0]]) n++; });
  const total=3+WL30_CHECKS.length, d=wlDay(gi);
  const ck=(on,icon)=>'<span class="ck'+(on?' on':'')+'">'+glyph(on?'check':icon)+'</span>';
  const bar=p=>'<div class="bar"><i style="width:'+Math.round(Math.min(1,p)*100)+'%"></i></div>';
  const pm=(minus,plus,lm,lp)=>'<div class="pm" onclick="event.stopPropagation()"><button onclick="'+minus+'" aria-label="'+lm+'">−</button><button onclick="'+plus+'" aria-label="'+lp+'">+</button></div>';
  return '<div class="lbx-sec"><div class="lbx-sh"><div class="lbx-st">Today&rsquo;s Checklist</div><div class="lbx-ss">'+n+' of '+total+' done</div></div>'+
    lbRing(n/total,44,n,'')+'</div>'+
    '<div class="lbx-card lbx-cl">'+
    '<div class="lbx-cr'+(trained?' on':'')+'" onclick="wlOpenDay('+gi+')">'+ck(trained,'play')+
      '<div class="tx"><b>'+d.n+'</b><span>Workout · '+wlMinutes(d)+' min</span></div><span class="pdx-chev">›</span></div>'+
    '<div class="lbx-cr'+(stepOk?' on':'')+'" onclick="wlSteps(\'goal\')">'+ck(stepOk,'steps')+
      '<div class="tx"><b>'+st.toLocaleString()+' <em>/ '+stepT.toLocaleString()+' steps</em></b>'+bar(st/stepT)+'</div>'+
      pm('wlSteps(-500)','wlSteps(500)','500 fewer steps','500 more steps')+'</div>'+
    '<div class="lbx-cr'+(waterOk?' on':'')+'">'+ck(waterOk,'bottle')+
      '<div class="tx"><b>'+wt.toFixed(2).replace(/0$/,'')+' <em>/ '+waterT.toFixed(1)+' L water</em></b>'+bar(wt/waterT)+'</div>'+
      pm('wlWaterAdd(-0.25)','wlWaterAdd(0.25)','250 ml less','250 ml more')+'</div>'+
    '<div class="lbx-cr'+(c.misi?' on':'')+'" onclick="wlTick(\'misi\')">'+ck(c.misi,'target')+
      '<div class="tx"><span class="k">Nutrition mission</span><b class="w">'+wlMisi(gi)+'</b></div></div>'+
    '<div class="lbx-cr'+(c.makan?' on':'')+'" onclick="wlTick(\'makan\')">'+ck(c.makan,'food')+'<div class="tx"><b>Ate to plan</b></div></div>'+
    '<div class="lbx-cr'+(c.tidur?' on':'')+'" onclick="wlTick(\'tidur\')">'+ck(c.tidur,'moon')+'<div class="tx"><b>Slept 7 hours</b></div></div>'+
  '</div>';
}
function wlTick(k){ const d=wlData(), t=iso(0); d.check[t]=d.check[t]||{}; d.check[t][k]=!d.check[t][k]; HF.save(); renderWL30(); }
function wlSteps(n){
  const d=wlData(), t=iso(0), gi=Math.min(wlNext(),WL30_DAYS.length-1), g=wlStepsFor(gi);
  d.steps[t]= n==='goal' ? (((+d.steps[t]||0)>=g) ? 0 : g) : Math.max(0,(+d.steps[t]||0)+n);
  HF.save(); renderWL30();
}
function wlWaterAdd(n){ const d=wlData(), t=iso(0); d.water[t]=Math.max(0,Math.round(((+d.water[t]||0)+n)*100)/100); HF.save(); renderWL30(); }

/* ── a day: the photograph, what it is, one big button, the moves ── */
function wlOpenDay(gi){
  const d=wlDay(gi); if(!d) return;
  const owned=wlOwned(), exs=wlExercises(d), w=wlData(), wi=wlWeekOf(gi), done=gi<wlDone();
  curProg=WL30; curDay={p:WL30, day:WL30.weeks[wi].days[gi-WL30_WEEKS[wi].from+1], gi};
  let h=pdxBar('day', owned?{icon:'play',label:'Start',go:'wlPlay('+gi+')'}:{icon:'lock',label:'RM'+WL30_PRICE,go:'wlBuy()'})+
    '<div class="lbx-hero day bn-day" style="'+wlBg(wlDayImg(gi))+'"><div class="lbx-hero-ov"></div>'+
    '<div class="lbx-hero-tx"><div class="lbx-kick">Day '+(gi+1)+' of 30 · Week '+(wi+1)+': '+WL30_WEEKS[wi].n+(done?' · ✓ Done':'')+'</div>'+
    '<div class="lbx-name">'+d.n+'</div></div></div>';
  h+='<div class="lbx bn">';
  h+='<div class="lbx-facts">'+[[wlMinutes(d)+'','minutes'],[exs.length+'','moves'],[d.r+'','rounds'],[wlJumps(d)+'','jumps']]
    .map(x=>'<div><b>'+x[0]+'</b><span>'+x[1]+'</span></div>').join('')+'</div>';
  const isCheck=WL30_CHECKINS.indexOf(gi+1)>=0;
  if(!owned){
    h+='<button class="lbx-go" onclick="wlBuy()">'+glyph('lock')+'Unlock · RM'+WL30_PRICE+'</button>';
  } else if(d.k==='test'){
    /* day 1 and day 30: the body first, then the fit test */
    h+='<div class="lbx-card lbx-steps"><div class="lbx-step"><span class="n">1</span><div class="tx"><div class="t">Body Check-in</div>'+
       '<div class="s">Berat dan pinggang'+(wlMale()?'':' dan pinggul')+' — pagi, sebelum sarapan. Gambar jika anda mahu.</div></div></div>'+
       wlBodyForm(gi+1)+
       '<div class="lbx-step"><span class="n">2</span><div class="tx"><div class="t">Fit Test</div>'+
       '<div class="s">Lima gerakan, satu pusingan. Kira ulangan setiap satu — untuk plank, saat anda tahan.</div></div></div></div>'+
       '<button class="lbx-go" onclick="wlPlay('+gi+')">'+glyph('play')+'Start Fit Test</button>'+
       '<button class="lbx-ghost" onclick="wlComplete('+gi+')">Skip the fit test, mark the day done</button>'+
       wlFitForm(gi===0?'d1':'d30');
  } else {
    if(isCheck) h+='<div class="lbx-card lbx-steps"><div class="lbx-step"><span class="n">'+glyph('flag')+'</span><div class="tx"><div class="t">Body Check-in · Day '+(gi+1)+'</div>'+
       '<div class="s">Rekod sebelum latihan: pagi, sebelum sarapan.</div></div></div>'+wlBodyForm(gi+1)+'</div>';
    const hv=wlHalves(d), parts=w.half[gi]||{}, split=!!w.split && d.k!=='recover';
    const m1=Math.round(wlSecs(hv[0],d.r)/60), m2=Math.round(wlSecs(hv[1],d.r)/60);
    if(d.k!=='recover') h+='<div class="lbx-split" role="radiogroup" aria-label="How to do it">'+
       '<button class="'+(split?'':'on')+'" role="radio" aria-checked="'+(split?'false':'true')+'" onclick="'+(split?'wlToggleSplit('+gi+')':'')+'">All at once<small>'+wlMinutes(d)+' min</small></button>'+
       '<button class="'+(split?'on':'')+'" role="radio" aria-checked="'+(split?'true':'false')+'" onclick="'+(split?'':'wlToggleSplit('+gi+')')+'">Two sessions<small>'+m1+' + '+m2+' min</small></button></div>';
    if(split){
      h+='<button class="lbx-go'+(parts.a?' sec':'')+'" onclick="wlPlay('+gi+',\'a\')">'+glyph(parts.a?'check':'sun')+'Morning · '+m1+' min</button>'+
        '<button class="lbx-go'+(parts.b?' sec':'')+'" onclick="wlPlay('+gi+',\'b\')">'+glyph(parts.b?'check':'moon')+'Evening · '+m2+' min</button>';
    } else {
      h+='<button class="lbx-go" onclick="wlPlay('+gi+')">'+glyph('play')+'Start Workout</button>'+
         '<button class="lbx-ghost" onclick="wlComplete('+gi+')">'+glyph('check')+'Mark done without playing</button>';
    }
  }
  h+='<div class="lbx-note"><div class="q">“</div><div><div class="k">Coach&rsquo;s note</div><div class="t">'+wlTip(gi)+'</div></div></div>';
  if(d.k==='recover') h+='<div class="lbx-note leaf"><div class="q">'+glyph('leaf')+'</div><div><div class="k">Recovery day</div>'+
    '<div class="t">Bergerak perlahan dan bernafas. Hari ini badan anda menjadi lebih kuat.</div></div></div>';
  h+='<div class="lbx-sec"><div class="lbx-sh"><div class="lbx-st">In This Workout</div><div class="lbx-ss">Tap a move to watch it.</div></div></div>'+
    '<div class="lbx-moves">'+exs.map((e,i)=>
      '<div class="lbx-move" onclick="'+(owned?'wlPlayOne(\''+e.n.replace(/'/g,"\\'")+'\')':'wlBuy()')+'">'+
      '<span class="n">'+(i+1)+'</span><div class="tx"><div class="t">'+e.n+'</div><div class="m">'+e.dur+' sec · '+(e.m||'Full body')+(WL30_JUMPS.indexOf(e.n)>=0?' · jump':'')+'</div></div>'+
      '<span class="pl">'+glyph(owned?'play':'lock')+'</span></div>').join('')+'</div>';
  const kit=['a mat or towel'];
  if(d.ex.some(n=>(WL30_KIT[n]||[])[0]==='kerusi' || /Chair/.test(n))) kit.push('a sturdy chair');
  if(d.ex.some(n=>/^Bottle/.test(n))) kit.push('two water bottles');
  if(d.ex.some(n=>/^Towel/.test(n))) kit.push('a towel');
  if(d.ex.some(n=>/Wall/.test(n))) kit.push('a wall');
  h+='<div class="lbx-need"><span>'+glyph('mat')+'</span>You need: '+kit.filter((x,i)=>kit.indexOf(x)===i).join(', ')+'</div>';
  h+='</div>';
  $('dd-body').innerHTML=h;
  hidePanels(); $('daydetail').style.display='block'; $('screen').scrollTop=0;
}
function wlToggleSplit(gi){ const w=wlData(); w.split=!w.split; HF.save(); wlOpenDay(gi); }

/* play a day, or half of it; the player hands back to wlAfterSession */
function wlPlay(gi,half){
  const d=wlDay(gi); if(!d) return;
  if(!wlOwned()) return wlBuy();
  const exs=half ? wlHalves(d)[half==='a'?0:1] : wlExercises(d);
  const meta={rounds:d.r, name:d.n, wl:{gi, half:half||''}, key:WL30_KEY+'-d'+gi+(half?'-'+half:'')};
  /* the day counts when it is all done: whole, or the second of its halves */
  const other=half ? wlData().half[gi] : null;
  if(!half || (other && other[half==='a'?'b':'a'])){ meta.pid=WL30_ID; meta.gi=gi; }
  startWorkout(exs, meta);
}
function wlPlayOne(name){
  if(!wlOwned()) return wlBuy();
  startWorkout([wlEx(name)],{rounds:1, name, wl:{gi:-1}});
}
/* back from the player: note the half, then the day it came from */
function wlAfterSession(m){
  if(m.gi<0) return wlOpenDay(curDay?curDay.gi:wlNext());
  const key=WL30_KEY+'-d'+m.gi+(m.half?'-'+m.half:'');
  if(m.half && HF.data.sessions[key]){
    const w=wlData(); w.half[m.gi]=w.half[m.gi]||{}; w.half[m.gi][m.half]=true;
    if(w.half[m.gi].a && w.half[m.gi].b && progDone(WL30_ID)===m.gi) HF.data.progress[WL30_ID]=m.gi+1;
    HF.save();
  }
  if(progDone(WL30_ID)>m.gi){ hidePanels(); $('progdetail').style.display='block'; wlTab='plan'; renderWL30(); $('screen').scrollTop=0; }
  else wlOpenDay(m.gi);
}
function wlComplete(gi){
  HF.markDone(WL30_KEY+'-d'+gi,{name:wlDay(gi).n, mins:wlMinutes(wlDay(gi))});
  if(progDone(WL30_ID)===gi) HF.data.progress[WL30_ID]=gi+1;
  HF.save(); toast('Day done 🔥');
  hidePanels(); $('progdetail').style.display='block'; renderWL30(); $('screen').scrollTop=0;
}

/* ── the body: weight and waist (and her hips) on days 1, 15 and 30 ── */
function wlBodyRows(){ return wlMale() ? [['kg','Weight','kg'],['waist','Waist','cm']] : [['kg','Weight','kg'],['waist','Waist','cm'],['hip','Hips','cm']]; }
function wlBodyForm(n){
  const b=wlData().body[n]||{}, src=wlPhoto(n);
  return '<div class="lb-body"><div class="esfields">'+wlBodyRows().map(m=>
      '<label class="esf"><span>'+m[1]+'</span><input class="inp" inputmode="decimal" placeholder="0" aria-label="'+m[1]+' day '+n+'" value="'+(b[m[0]]||'')+'" '+
        'onchange="wlSetBody('+n+',\''+m[0]+'\',this.value)"><em>'+m[2]+'</em></label>').join('')+'</div>'+
    '<label class="wl-ph lb-ph'+(src?' has':'')+'"'+(src?' style="background-image:url(\''+src+'\')"':'')+'>'+
      '<input type="file" accept="image/*" onchange="wlAddPhoto('+n+',this)">'+(src?'':ic('photo'))+'<span>Photo · Day '+n+'</span></label>'+
    '<div class="lb-fine">Gambar disimpan dalam telefon ini sahaja.</div></div>';
}
function wlFitForm(when){
  const f=wlData().fit[when]||{};
  return fsec('Fit Test Results',when==='d1'?'Day 1':'Day 30')+'<div class="esfields">'+wlFitList().map(x=>
    '<label class="esf"><span>'+x[1]+'</span><input class="inp" inputmode="numeric" placeholder="0" aria-label="'+x[1]+'" value="'+(f[x[0]]||'')+'" '+
      'onchange="wlSetFit(\''+when+'\',\''+x[0]+'\',this.value)"><em>'+x[2]+'</em></label>').join('')+'</div>';
}
function wlSetFit(when,k,v){ const w=wlData(); w.fit[when]=w.fit[when]||{}; w.fit[when][k]=parseInt(v,10)||0; HF.save(); }
function wlSetBody(n,k,v){ const w=wlData(); w.body[n]=w.body[n]||{}; w.body[n][k]=parseFloat(v)||0; HF.save(); }
function wlPhotoKey(n){ return 'hf_wl30_photo_'+(HF.userId||'me')+'_'+n; }
function wlPhoto(n){ try{ return localStorage.getItem(wlPhotoKey(n))||''; }catch(e){ return ''; } }
function wlAddPhoto(n,input){
  const f=input&&input.files&&input.files[0]; if(!f) return;
  const r=new FileReader();
  r.onload=()=>{ const im=new Image(); im.onload=()=>{
    const s=Math.min(1,640/Math.max(im.width,im.height)), c=document.createElement('canvas');
    c.width=Math.round(im.width*s); c.height=Math.round(im.height*s);
    c.getContext('2d').drawImage(im,0,0,c.width,c.height);
    try{ localStorage.setItem(wlPhotoKey(n), c.toDataURL('image/jpeg',.72)); toast('Gambar disimpan'); }
    catch(e){ toast('Ruang telefon tidak cukup untuk gambar'); }
    if($('daydetail') && $('daydetail').style.display==='block' && curDay) wlOpenDay(curDay.gi); else renderWL30();
  }; im.src=r.result; };
  r.readAsDataURL(f);
}

/* ── nutrition: the calorie sum (mpNut) for their sex, never under 1,200 kcal
   for a woman or 1,500 for a man, and MAK2FIT's Malaysian menus ── */
function wlProfile(){
  const n=HF.data.nutrition||{}, pr=wlData().profile||{}, me=wlData().me||{};
  return {age:me.age||pr.age||n.a||0, wt:me.wt||pr.wt||n.w||0, ht:me.ht||pr.ht||n.h||0,
          gender:me.sex?(me.sex==='l'?'male':'female'):(pr.gender||'')};
}
function wlTarget(){
  const pr=wlProfile(); if(!pr.wt||!pr.ht||!pr.age||!pr.gender) return null;
  const me=wlMe()||{}, male=pr.gender==='male';
  const n=mpNut({goal:'loss', rate:wlPaceOf(wlMe()), gender:pr.gender, age:pr.age, wt:pr.wt, ht:pr.ht, activity:WL30_ACT[me.act]||1.375, styles:['hiprotein']});
  let cal=Math.max(male?1500:1200, n.cal);
  /* feeding a baby: about 400 kcal more, and never under 1,500 */
  if(!male && me.feed) cal=Math.max(1500, cal+400);
  return {cal, prot:n.prot, carb:n.carb, fat:n.fat};
}
let _wlSex='';
function wlSaveProfile(){
  const g=x=>parseFloat(($(x)||{}).value);
  const wt=g('wl-wt'), ht=g('wl-ht'), age=parseInt(($('wl-age')||{}).value,10), gender=_wlSex||wlProfile().gender;
  if(!gender){ toast('Pilih lelaki atau perempuan'); return; }
  if(!wt||!ht||!age){ toast('Isi berat, tinggi dan umur'); return; }
  wlData().profile={gender, wt, ht, age}; HF.save(); renderWL30();
}
function wlForgetNumbers(){ const d=wlData(); d.profile={gender:wlProfile().gender}; if(d.me){ delete d.me.wt; delete d.me.ht; delete d.me.age; } HF.save(); renderWL30(); }
/* the three options a meal shows on a day: different every day, never twice */
function wlMenuFor(slot,day){
  const me=wlMe();
  let opts=LB30_MENU[slot].opts.filter(o=>lbOk(o,me));
  if(me && me.cook==='beli' && (slot==='sarapan'||slot==='tengahari')){ const b=opts.filter(o=>o.b); if(b.length>=3) opts=b; }
  const n=opts.length, out=[];
  for(let k=0;k<Math.min(3,n);k++) out.push(opts[(day*3+k+(slot==='petang'?5:0))%n]);
  return out;
}
function wlSlots(){ const me=wlMe(); if(me && LB30_MEALS[me.meals]) return LB30_MEALS[me.meals];
  return LB30_SLOTS.map(s=>[s, LB30_MENU[s].share]); }
/* the menu's own notes, for anyone (MAK2FIT's breakfast is "for a working mother") */
const WL30_MEAL_NOTE={sarapan:'Cepat, sebelum keluar bekerja'};

/* Learn: the Nutrition Academy, all of it, opened by the program (acLadies, academy.js) */
function wlLearn(){
  if(typeof academyHTML!=='function') return '';
  if(!wlOwned()) return wlLocked('book','Nutrition Academy','Episod video pendek tentang makan untuk turun lemak, cara Malaysia, setiap satu dengan kuiz 3 soalan.');
  return '<div class="lbx-acad">'+academyHTML()+'</div>';
}

/* ── the shopping list: a week's menu (option 1 of each meal) as what to buy ── */
function wlShopItems(wi){
  const w=WL30_WEEKS[wi], n={}, sl=wlSlots();
  for(let d=w.from-1; d<w.to; d++) sl.forEach(s=>{
    lbDish(wlMenuFor(s[0],d)[0]).it.forEach(x=>{
      const low=' '+String(x).toLowerCase()+' ';
      for(let k=0;k<LB30_SHOP_ING.length;k++) if(low.indexOf(LB30_SHOP_ING[k][0])>=0){ const it=LB30_SHOP_ING[k][1]; n[it]=(n[it]||0)+1; break; }
    });
  });
  return n;
}
function wlShopRe(){ const s=$('screen'), y=s?s.scrollTop:0; renderWL30(); if(s) s.scrollTop=y; }
function wlShopTick(wi,name){ const sh=wlData().shop, k='w'+wi; sh[k]=sh[k]||{}; sh[k][name]=!sh[k][name]; HF.save(); wlShopRe(); }
function wlShopMine(wi){ const sh=wlData().shop, k='x'+wi; sh[k]=sh[k]||[]; return sh[k]; }
function wlShopAdd(wi){
  const el=$('wl-shop-in'), v=String(el&&el.value||'').replace(/\s+/g,' ').trim().slice(0,40), mine=wlShopMine(wi);
  if(!v) return;
  if(mine.some(x=>x.n.toLowerCase()===v.toLowerCase())){ toast('Dah ada dalam senarai'); return; }
  mine.push({n:v, on:false}); HF.save(); wlShopRe();
  const again=$('wl-shop-in'); if(again) again.focus();
}
function wlShopMineTick(wi,i){ const x=wlShopMine(wi)[i]; if(!x) return; x.on=!x.on; HF.save(); wlShopRe(); }
function wlShopMineDel(wi,i){ wlShopMine(wi).splice(i,1); HF.save(); wlShopRe(); }
function wlShopGroups(all){
  return LB30_SHOP_CAT.concat([['Lain-lain','bag','#6B6B6B']]).map((c,ci)=>[c, all.filter(x=>ci<LB30_SHOP_CAT.length ? c[3].indexOf(x)>=0 : !LB30_SHOP_CAT.some(cc=>cc[3].indexOf(x)>=0))]);
}
function wlShopText(wi){
  const n=wlShopItems(wi); let t='Senarai belanja BURN30 · Week '+(wi+1)+'\n';
  wlShopGroups(Object.keys(n)).forEach(g=>{ if(g[1].length) t+='\n'+g[0][0]+':\n'+g[1].map(x=>'• '+x).join('\n')+'\n'; });
  const mine=wlShopMine(wi);
  if(mine.length) t+='\nBarang saya:\n'+mine.map(x=>'• '+x.n).join('\n')+'\n';
  return t;
}
function wlShopping(){
  if(wlShopWeek<0) wlShopWeek=wlWeekOf(Math.min(wlNext(),WL30_DAYS.length-1));
  const wi=wlShopWeek, n=wlShopItems(wi), got=(wlData().shop['w'+wi])||{}, all=Object.keys(n).sort((a,b)=>n[b]-n[a]), mine=wlShopMine(wi);
  const have=all.filter(x=>got[x]).length+mine.filter(x=>x.on).length, count=all.length+mine.length;
  let h='<div class="lbx-sec"><div class="lbx-sh"><div class="lbx-st">Shopping List</div><div class="lbx-ss">Dari menu minggu ini, dan apa saja yang anda tambah. Tanda bila dah beli.</div></div></div>';
  h+='<div class="lbx-card lbx-shop"><div class="lbx-shop-w">'+WL30_WEEKS.map((x,i)=>'<button class="'+(i===wi?'on':'')+'" onclick="wlShopWeek='+i+';wlShopRe()">Week '+(i+1)+'</button>').join('')+'</div>'+
    '<div class="lbx-shop-p"><div class="bar"><i style="width:'+(count?Math.round(have/count*100):0)+'%"></i></div><span>'+have+' / '+count+' dibeli</span></div>';
  h+='<div class="lbx-shop-c lbx-shop-mine" style="--mc:var(--lr)"><div class="h"><span class="ic">'+glyph('pencil')+'</span><b>Barang Saya</b><span>'+(mine.length||'')+'</span></div>'+
    '<form class="lbx-shop-add" onsubmit="event.preventDefault();wlShopAdd('+wi+')"><input id="wl-shop-in" class="inp" maxlength="40" placeholder="Tambah barang, cth. kicap, susu" aria-label="Tambah barang">'+
    '<button type="submit" aria-label="Tambah">'+glyph('plus')+'</button></form>'+
    mine.map((x,i)=>'<div class="lbx-shop-i mine'+(x.on?' on':'')+'" role="button" onclick="wlShopMineTick('+wi+','+i+')"><span class="b">'+(x.on?glyph('check'):'')+'</span>'+
      '<span class="n">'+hesc(x.n)+'</span><button class="del" aria-label="Buang '+hesc(x.n)+'" onclick="event.stopPropagation();wlShopMineDel('+wi+','+i+')">×</button></div>').join('')+'</div>';
  wlShopGroups(all).forEach(g=>{
    const c=g[0], names=g[1]; if(!names.length) return;
    h+='<div class="lbx-shop-c" style="--mc:'+c[2]+'"><div class="h"><span class="ic">'+glyph(c[1])+'</span><b>'+c[0]+'</b><span>'+names.length+'</span></div>'+
      names.map(x=>{ const on=!!got[x]; return '<button class="lbx-shop-i'+(on?' on':'')+'" onclick="wlShopTick('+wi+',\''+x.replace(/'/g,"\\'")+'\')"><span class="b">'+(on?glyph('check'):'')+'</span><span class="n">'+x+'</span><span class="q">'+n[x]+'× hidangan</span></button>'; }).join('')+'</div>';
  });
  h+='<a class="lbx-ghost lbx-shop-wa" href="https://wa.me/?text='+encodeURIComponent(wlShopText(wi))+'" target="_blank" rel="noopener">'+glyph('share')+'Hantar senarai ke WhatsApp</a></div>';
  return h;
}

function wlFood(){
  if(!wlOwned()) return wlLocked('food','Calorie target & 30-day menu',
    'Sasaran harian dari berat, tinggi, umur dan jantina anda — masakan Malaysia, tiga pilihan setiap waktu makan, '+
    'senarai belanja setiap minggu, dan satu misi pemakanan setiap hari.');
  const t=wlTarget();
  let h='';
  if(!t){
    const pr=wlProfile(), sx=_wlSex||pr.gender;
    const fld=(id,l,u,v,m)=>'<label class="esf"><span>'+l+'</span><input class="inp" id="'+id+'" inputmode="'+m+'" placeholder="0" value="'+(v||'')+'"><em>'+u+'</em></label>';
    return fsec('Your Calorie Target','Empat jawapan, dan ia dikira sendiri.')+
      '<div class="obseg"><button class="'+(sx==='male'?'on':'')+'" onclick="_wlSex=\'male\';renderWL30()">Male</button>'+
      '<button class="'+(sx==='female'?'on':'')+'" onclick="_wlSex=\'female\';renderWL30()">Female</button></div>'+
      '<div class="esfields">'+fld('wl-wt','Weight','kg',pr.wt,'decimal')+fld('wl-ht','Height','cm',pr.ht,'decimal')+fld('wl-age','Age','yrs',pr.age,'numeric')+'</div>'+
      '<button class="lbx-go" onclick="wlSaveProfile()">Work Out My Target</button>'+
      (!wlMe()?'<button class="lbx-ghost" onclick="wlQuizOpen()">'+glyph('sliders')+'Atau bina pelan penuh saya</button>':'');
  }
  const tot=WL30_DAYS.length;
  if(wlMenuDay<0) wlMenuDay=Math.min(wlNext(),tot-1);
  h+='<div class="lbx-fseg">'+[['today','Today','food'],['shop','Shopping','bag'],['guide','Guide','leaf']].map(x=>
    '<button class="'+(wlFoodSeg===x[0]?'on':'')+'" onclick="wlSetFoodSeg(\''+x[0]+'\')">'+glyph(x[2])+x[1]+'</button>').join('')+'</div>';
  if(wlFoodSeg==='shop') return h+wlShopping();
  if(wlFoodSeg==='guide') return h+wlFoodGuide();
  const male=wlProfile().gender==='male', me=wlMe();
  h+='<div class="nstage wl-stage lb-stage sm"><span class="wl-st-gly">'+glyph('flame')+'</span><div class="nstage-k">Your daily target</div>'+
    '<div class="nstage-n">'+t.cal.toLocaleString()+'<span> kcal</span></div>'+
    '<div class="nstage-s">Lebih kurang '+wlPace()+' kg seminggu · tidak pernah bawah '+(male||(me&&me.feed)?'1,500':'1,200')+' kcal</div>'+
    '<div class="nstage-g">'+[[t.prot+'g','Protein'],[t.carb+'g','Carbs'],[t.fat+'g','Fat'],[wlWater(wlMenuDay).toFixed(1)+' L','Water']]
      .map(x=>'<div><b>'+x[0]+'</b><span>'+x[1]+'</span></div>').join('')+'</div></div>';
  h+='<div class="lbx-misi"><span class="b">'+glyph('target')+'</span><div><div class="k">Nutrition mission · Day '+(wlMenuDay+1)+'</div><div class="t">'+wlMisi(wlMenuDay)+'</div></div></div>';
  if(!me) h+='<div class="lbx-card lbq-invite"><div class="lbx-k">Your own menu</div>'+
    '<div class="lbx-h">Menu ikut cara anda makan.</div><div class="lbx-p">Berapa kali makan sehari, apa yang anda tak makan, siapa yang masak — dalam pelan anda.</div>'+
    '<button class="lbx-go" onclick="wlQuizOpen()">'+glyph('sliders')+'Bina Pelan Saya</button></div>';
  h+='<div class="lbx-sec"><div class="lbx-sh"><div class="lbx-st">Today&rsquo;s Menu</div><div class="lbx-ss">Day '+(wlMenuDay+1)+' · '+wlSlots().length+' kali makan, tiga pilihan setiap satu</div></div></div>';
  h+='<div class="hscroll wl-mdays lbx-mdays">'+WL30_DAYS.map((d,i)=>
    '<button class="wl-md'+(i===wlMenuDay?' on':'')+'" onclick="wlMenuDay='+i+';renderWL30()"><small>Day</small><b>'+(i+1)+'</b></button>').join('')+'</div>';
  const look={sarapan:['sunrise','#E08A00'],pagi:['leaf','#1F9D6A'],tengahari:['sun','#E30613'],petang:['clock','#DB2777'],malam:['moon','#5B4BC4'],lewat:['moon','#0F766E']};
  const cook=me&&me.cook;
  h+='<div class="lbx-meals">'+wlSlots().map((sl,si)=>{
    const slot=sl[0], s=LB30_MENU[slot], kc=Math.round(t.cal*sl[1]), opts=wlMenuFor(slot,wlMenuDay), sid='wlm-'+wlMenuDay+'-'+si, lk=look[slot]||['food','#E30613'];
    const label=slot==='tengahari'&&cook&&cook!=='sendiri'?'Lunch':slot==='malam'&&cook==='beli'?'Dinner':s.label;
    const note=slot==='tengahari'&&cook==='beli'?'Pilihan yang mudah dibeli di kedai dan warung':slot==='malam'&&cook==='keluarga'?'Masak sekali untuk seisi rumah, ambil bahagian anda':(WL30_MEAL_NOTE[slot]||s.note);
    return '<div class="mpslot lbx-meal" id="'+sid+'" style="--mc:'+lk[1]+'"><div class="mpslot-h"><span class="ic">'+glyph(lk[0])+'</span>'+
      '<div class="hd"><div class="t">'+label+'</div><div class="m">'+s.time+' · ~'+kc+' kcal</div></div>'+
      '<div class="mpopts">'+opts.map((o,oi)=>'<button class="mpo'+(oi===0?' on':'')+'" aria-label="Option '+(oi+1)+'" onclick="mpOpt(\''+sid+'\','+oi+')">'+(oi+1)+'</button>').join('')+'</div></div>'+
      opts.map((o,oi)=>{ const ds=lbDish(o,kc), im=lbDishImg(slot,o); return '<div class="mpopt" style="display:'+(oi===0?'block':'none')+';"><div class="lbx-mo">'+
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
function wlFoodGuide(){
  let h='<div class="lbx-sec"><div class="lbx-sh"><div class="lbx-st">Pinggan Sihat</div><div class="lbx-ss">Bentuk pinggan setiap kali makan. Tak perlu penimbang.</div></div></div>';
  h+='<div class="lbx-card lbx-plate">'+lbPlateSVG()+'<div class="lbx-plate-k">'+
    [['#1F9D6A','Sayur','½ pinggan · 2 genggam'],['#E30613','Protein','¼ pinggan · 1 tapak tangan'],['#E08A00','Karbo','¼ pinggan · 1 genggam'],['#C9A227','Lemak','1 ibu jari']]
    .map(x=>'<div><i style="background:'+x[0]+'"></i><b>'+x[1]+'</b><span>'+x[2]+'</span></div>').join('')+'</div></div>';
  /* a man's portions are a hand bigger (Precision Nutrition's hand guide: two palms of protein, two fists of carbs) */
  const m=wlProfile().gender==='male';
  h+='<div class="lbx-por">'+[['food','Protein',m?'2':'1','tapak tangan','ayam, ikan, telur, tauhu, tempe','#E30613'],
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
  h+='<div class="lbx-sec"><div class="lbx-sh"><div class="lbx-st">Makan Di Luar</div><div class="lbx-ss">Apa nak order, bila tak masak.</div></div></div>';
  h+='<div class="lbx-out">'+[
    ['people','#7C3AED','Mamak',['Roti canai kosong + kuah dal','Nasi kandar: ayam bakar, sayur, kuah sikit','Teh o kosong atau teh tarik kurang manis']],
    ['star','#DB2777','Kenduri & Raya',['Ambil sayur dulu, kemudian lauk','Nasi separuh pinggan','Pilih lauk tak bersantan bila ada','Air kosong, bukan sirap']],
    ['bag','#E08A00','Makanan Segera',['Burger ayam panggang, bukan goreng','Air kosong atau minuman zero','Langkau kentang goreng, atau kongsi']],
    ['food','#1F9D6A','Kedai Kopitiam',['Roti bakar + 2 telur separuh masak','Kopi o kurang manis','Mi sup berbanding mi goreng']]]
    .map(x=>'<div class="lbx-oc" style="--mc:'+x[1]+'"><div class="h"><span class="ic">'+glyph(x[0])+'</span><b>'+x[2]+'</b></div>'+
      x[3].map(o=>'<div class="o">'+glyph('check')+'<span>'+o+'</span></div>').join('')+'</div>').join('')+'</div>';
  if(typeof AC_EPS!=='undefined') h+='<div class="lbx-row" onclick="wlSetTab(\'learn\')"><span class="b">'+glyph('play')+'</span><div class="tx"><div class="t">Nutrition Academy</div><div class="m">'+AC_EPS.length+' episod · full access with BURN30</div></div><span class="pdx-chev">›</span></div>';
  h+='<button class="authalt" onclick="wlForgetNumbers()">Change my numbers</button>';
  return h;
}

/* ── progress: days, the leaderboard, the body, photos, the fit test, badges ── */
function wlProgress(){
  if(!wlOwned()) return wlLocked('chart','See yourself change',
    'Berat dan pinggang pada Hari 1, 15 dan 30, gambar sebelum dan selepas, dan fit test Hari 1 berbanding Hari 30.');
  const w=wlData(), done=wlDone(), tot=WL30_DAYS.length;
  let mins=0; Object.keys(HF.data.sessions).forEach(k=>{ if(k.indexOf(WL30_KEY+'-')===0) mins+=(HF.data.sessions[k].mins||0); });
  let h='<div class="lbx-card lbx-pstat">'+lbRing(done/tot,92,done+'<i>/'+tot+'</i>','days')+
    '<div class="lbx-pstat-r"><div class="lbx-chip fl"><span class="ic">'+glyph('flame')+'</span><div><b>'+liveStreak()+'</b><span>Day streak</span></div></div>'+
    '<div class="lbx-chip cl"><span class="ic">'+glyph('clock')+'</span><div><b>'+Math.round(mins)+'</b><span>Minutes trained</span></div></div></div></div>';
  if(done>=tot) h+='<div class="wl-cert">'+ic('trophy')+'<div class="t">30 Days Complete</div>'+
    '<div class="s">'+hesc(((HF.data.prefs&&HF.data.prefs.name)||'Anda').trim())+' telah menamatkan HITFAT BURN30 — 30 workout dalam 30 hari.</div>'+
    '<button class="lbx-go" onclick="wlShare()">'+glyph('share')+'Share It</button></div>';
  /* the body, day 1 / 15 / 30: the check-in due next is lit */
  const nextCi=WL30_CHECKINS.filter(n=>done<n)[0]||30, icons={kg:'scale',waist:'measure',hip:'measure'}, rows=wlBodyRows();
  h+='<div class="lbx-sec"><div class="lbx-sh"><div class="lbx-st">Body Check-in</div><div class="lbx-ss">Pagi, sebelum sarapan · next on Day '+nextCi+'</div></div></div>';
  h+='<div class="lbx-card lbx-body"><div class="lbx-bh"><span></span>'+WL30_CHECKINS.map(n=>'<b class="'+(n===nextCi?'on':'')+'">Day '+n+'</b>').join('')+'</div>'+
    rows.map(m=>'<div class="lbx-br"><span class="lab"><span class="ic">'+glyph(icons[m[0]]||'measure')+'</span><span>'+m[1]+'<small>'+m[2]+'</small></span></span>'+
      WL30_CHECKINS.map(n=>{ const v=(w.body[n]||{})[m[0]]||''; return '<input class="'+(v?'has':'')+(n===nextCi?' on':'')+'" inputmode="decimal" placeholder="–" aria-label="'+m[1]+' day '+n+'" value="'+v+'" onchange="wlSetBody('+n+',\''+m[0]+'\',this.value);renderWL30()">'; }).join('')+'</div>').join('')+
    '</div>';
  const b1=w.body[1]||{}, bl=(w.body[30]&&w.body[30].kg)?w.body[30]:(w.body[15]||{});
  if(b1.kg&&bl.kg){
    const chip=(lab,a,b,u)=>{ const d=Math.round((b-a)*10)/10; return '<div class="lbx-dl '+(d<0?'dn':d>0?'up':'')+'"><b>'+(d>0?'+':'')+d+' '+u+'</b><span>'+lab+'</span></div>'; };
    h+='<div class="lbx-deltas">'+chip('Weight',b1.kg,bl.kg,'kg')+(b1.waist&&bl.waist?chip('Waist',b1.waist,bl.waist,'cm'):'')+(b1.hip&&bl.hip?chip('Hips',b1.hip,bl.hip,'cm'):'')+'</div>';
  }
  h+='<div class="lbx-sec"><div class="lbx-sh"><div class="lbx-st">Progress Photos</div><div class="lbx-ss">Disimpan dalam telefon ini sahaja.</div></div></div>';
  h+='<div class="lbx-photos">'+WL30_CHECKINS.map(n=>{
    const src=wlPhoto(n);
    return '<label class="lbx-ph'+(src?' has':'')+(n===nextCi&&!src?' on':'')+'"'+(src?' style="background-image:url(\''+src+'\')"':'')+'>'+
      '<input type="file" accept="image/*" onchange="wlAddPhoto('+n+',this)">'+
      (src?'':'<span class="ic">'+glyph('photo')+'</span><span class="add">Add photo</span>')+'<span class="d">Day '+n+'</span></label>';
  }).join('')+'</div>';
  h+='<div class="lbx-sec"><div class="lbx-sh"><div class="lbx-st">Fit Test</div><div class="lbx-ss">Day 1 vs Day 30.</div></div></div>';
  h+='<div class="lbx-card lbx-fit"><div class="lbx-fh"><span></span><b>Day 1</b><b>Day 30</b><b>Change</b></div>'+
    wlFitList().map(f=>{
      const a=+(w.fit.d1||{})[f[0]]||0, b=+(w.fit.d30||{})[f[0]]||0, ch=(a&&b)?Math.round((b-a)/a*100):null;
      return '<div class="lbx-fr"><span class="lab">'+f[1]+'<small>'+f[2]+'</small></span>'+
        '<input class="'+(a?'has':'')+'" inputmode="numeric" placeholder="–" aria-label="'+f[1]+' day 1" value="'+(a||'')+'" onchange="wlSetFit(\'d1\',\''+f[0]+'\',this.value);renderWL30()">'+
        '<input class="'+(b?'has':'')+'" inputmode="numeric" placeholder="–" aria-label="'+f[1]+' day 30" value="'+(b||'')+'" onchange="wlSetFit(\'d30\',\''+f[0]+'\',this.value);renderWL30()">'+
        '<span class="ch '+(ch>0?'up':ch<0?'dn':'')+'">'+(ch===null?'—':(ch>0?'+':'')+ch+'%')+'</span></div>';
    }).join('')+'</div>';
  h+='<div class="lbx-sec"><div class="lbx-sh"><div class="lbx-st">Leaderboard</div><div class="lbx-ss">Semua orang dalam BURN30, ikut hari yang dimainkan.</div></div></div>';
  h+='<div id="lb-burn30"></div>';
  h+='<div class="lbx-sec"><div class="lbx-sh"><div class="lbx-st">Badges</div><div class="lbx-ss">Satu untuk setiap minggu yang anda tamatkan.</div></div></div>';
  const wicons=['sunrise','workout','flame','trophy'];
  h+='<div class="lbx-medals">'+WL30_WEEKS.map((x,i)=>{
    const got=done>=x.to, part=Math.max(0,Math.min(1,(done-(x.from-1))/(x.to-x.from+1)));
    return '<div class="lbx-medal'+(got?' on':'')+'"><div class="m" style="--p:'+Math.round(part*100)+'%"><span>'+glyph(got?wicons[i]:'lock')+'</span></div>'+
      '<b>'+x.n+'</b><small>'+(got?'Earned':'Day '+x.to)+'</small></div>';
  }).join('')+'</div>';
  return h;
}
function wlShare(){
  const t='Saya baru tamatkan HITFAT BURN30 — 30 workout dalam 30 hari.';
  try{ if(navigator.share){ navigator.share({title:'BURN30 Complete', text:t, url:'https://app.hitfat.io'}); return; } }catch(e){}
  try{ navigator.clipboard.writeText(t+' https://app.hitfat.io'); toast('Disalin — tampal di mana-mana'); }catch(e){ toast(t); }
}

/* ── start here ── */
function wlGuide(){
  let h='<div class="lb-safe">'+ic('warning')+'<div><div class="t">Before you start</div>'+
    '<div class="s">Jika anda hamil, baru bersalin (kurang 6 minggu), selepas pembedahan, atau ada masalah jantung, tekanan darah atau sendi, '+
    'dapatkan nasihat doktor sebelum mula.</div></div></div>';
  h+=fsec('How It Works','');
  h+='<div class="wl-steps">'+[
    ['Bina pelan anda','Soalan ringkas, 2 minit. Gerakan, minit dan kalori ikut anda.'],
    ['Hari 1: check-in, kemudian fit test','Rekod berat dan pinggang dahulu. Lima gerakan, satu pusingan — garisan permulaan anda.'],
    ['Satu workout setiap hari','15 hingga 25 minit di rumah. Ikut video, pemasa kira untuk anda. Atau pecah kepada dua sesi.'],
    ['Senarai semak harian','Workout, langkah, air, misi pemakanan, makan ikut pelan, tidur.'],
    ['Hari 15 & 30: check-in semula','Berat, pinggang dan gambar. Hari 30, ulang fit test dan bandingkan di Progress.']]
    .map((s,i)=>'<div class="wl-step"><span class="n">'+(i+1)+'</span><div><div class="t">'+s[0]+'</div><div class="m">'+s[1]+'</div></div></div>').join('')+'</div>';
  h+=fsec('What You Need','Tiada apa yang perlu dibeli.');
  h+='<div class="wl-kit">'+[['mat','Tikar atau tuala'],['chair','Kerusi yang kukuh, jika ada'],['bottle','Dua botol air, jika ada'],['clock','15–25 minit sehari']]
    .map(k=>'<div><span class="wl-kic">'+glyph(k[0])+'</span><span>'+k[1]+'</span></div>').join('')+'</div>';
  h+=fsec('Four Weeks','');
  h+='<div class="wl-phases">'+WL30_WEEKS.map((p,i)=>'<div><b>Week '+(i+1)+': '+p.n+'</b><span>Days '+p.from+'–'+p.to+'</span><small>'+p.s+'</small></div>').join('')+'</div>';
  h+=fsec('Ground Rules','');
  h+='<div class="wl-tips">'+[
    'Ikut susunan hari. Tertinggal satu? Buat hari ini — pelan menunggu anda.',
    'Setiap gerakan ada versi lebih mudah. Tak boleh lompat? Ubah jawapan di Plan, semua lompatan ditukar.',
    'Timbang hanya pada Hari 1, 15 dan 30. Nombor harian naik turun dan tidak banyak makna.',
    'Langkah naik setiap minggu, 4,000 hingga 10,000.',
    'Tidur 7 jam. Lemak turun semasa badan pulih, bukan hanya semasa berpeluh.',
    'Sakit pada sendi tanda berhenti. Otot rasa terbakar tidak.']
    .map(t=>'<div>'+t+'</div>').join('')+'</div>';
  h+=fsec('Questions','');
  h+='<div class="wl-faq">'+[
    ['Saya tertinggal sehari.','Teruskan dari hari anda sekarang. Tiga puluh workout matlamatnya, bukan tiga puluh tarikh berturut-turut.'],
    ['Terlalu susah.','Kurangkan ulangan, rehat lebih lama, atau ubah jawapan anda kepada "Baru mula". Habis perlahan lebih baik daripada berhenti.'],
    ['Terlalu senang.','Ubah jawapan anda kepada "Aktif": 45 saat setiap gerakan, tiga pusingan, push-up penuh dan burpee.'],
    ['Berapa lama saya boleh simpan?','Selamanya. Bayar sekali, tiada langganan. Ulang bila-bila masa.']]
    .map(q=>'<details><summary>'+q[0]+'<span class="wl-qc">'+glyph('plus')+'</span></summary><div>'+q[1]+'</div></details>').join('')+'</div>';
  if(typeof COACH_WA!=='undefined' && COACH_WA)
    h+='<button class="bigbtn sec" onclick="window.open(\'https://wa.me/'+COACH_WA+'\',\'_blank\',\'noopener\')">'+glyph('people')+'Ask a Coach on WhatsApp</button>';
  return h;
}

/* what a tab looks like before the program is bought */
function wlLocked(icon,title,text){
  return '<div class="wl-lock">'+ic(icon)+'<div class="t">'+title+'</div><div class="s">'+text+'</div>'+
    '<button class="lbx-go" onclick="wlBuy()">Get the Program · RM'+WL30_PRICE+'</button></div>';
}

/* ── buying it ── */
function wlBuy(){
  if(wlOwned()) return openProgram(WL30_ID);
  $('pw-body').innerHTML=
    '<div class="pwtop"><span></span><button class="pwx" aria-label="Close" onclick="closeProduct()">✕</button></div>'+
    '<div class="wl-buy-poster wl-buy-art">'+hpoArt(WL30,{ar:1.4})+'<div class="tx"><b>'+WL30_NAME+'</b><span>30 DAYS · AT HOME · MEN & WOMEN</span></div></div>'+
    '<div class="pwlist">'+[
      ['sliders','Pelan anda sendiri','2 minit soal jawab: tahap, sakit, lompat atau tidak, alat dan masa anda'],
      ['workout','30 workout di rumah','15–25 minit, video untuk setiap gerakan, atau dua sesi pendek'],
      ['food','Sasaran kalori & menu Malaysia','Tiga pilihan setiap waktu makan, senarai belanja setiap minggu'],
      ['book','Nutrition Academy','Semua episod, terbuka dengan BURN30'],
      ['chart','Check-in, gambar, fit test','Hari 1 berbanding Hari 30, dalam nombor'],
      ['trophy','Milik anda selamanya','Bayar sekali. Tiada langganan, tiada apa untuk dibatalkan']]
      .map(b=>'<div class="pwf"><div class="ic"><span class="wl-kic">'+glyph(b[0])+'</span></div><div><div class="t">'+b[1]+'</div><div class="m">'+b[2]+'</div></div></div>').join('')+'</div>'+
    '<div class="pwprice"><div class="p">RM'+WL30_PRICE+'</div><div class="per">one payment</div></div>'+
    '<button class="bigbtn" onclick="startCheckout(\'prog_'+WL30_ID+'\')">Buy for RM'+WL30_PRICE+'</button>'+
    '<button class="authalt" onclick="openPaywall(\'BURN30 is included in HITFAT+.\')">Or get everything with HITFAT+</button>'+
    '<div class="wl-claim"><div class="t">Bought it on our website?</div>'+
    '<div class="s">Sign in with the email you paid with and it opens by itself. Paid with a different email? Enter the order number from your receipt.</div>'+
    '<div class="wl-claim-f"><input id="wl-order" placeholder="Order number" autocomplete="off"><button onclick="wlClaim()">Unlock</button></div></div>';
  $('pwm').classList.add('on');
  try{ $('pwm').scrollTop=0; }catch(e){}
}
async function wlClaim(){
  let o=String((($('wl-order')||{}).value)||'').trim();
  const hl=/^HL[A-Z0-9]+/i.exec(o); if(hl) o=hl[0].toUpperCase();
  if(!o) return toast('Enter the order number from your receipt');
  if(!sb||!HF.userId) return toast('Sign in first');
  try{
    const r=await sb.rpc('plus_claim_landing',{p_order:o});
    if(r.error) throw r.error;
    await loadEntitlement();
    if(wlOwned()){ closeProduct(); toast('Unlocked — welcome to the 30 days'); openProgram(WL30_ID); }
    else toast('No paid order with that number. Check the receipt, or message us.');
  }catch(e){ toast('Could not check that order — try again in a moment.'); }
}
/* Purchases made on the landing page wait under the buyer's email until they
   sign in; this turns them into the account's own. Quietly — nothing to show
   when there is nothing to claim. */
async function claimLandingPurchases(){
  if(!sb||!HF.userId) return;
  try{ await sb.rpc('plus_claim_landing',{p_order:null}); }catch(e){}
}

/* ── the Home card: the program for its owner, its offer for everyone else ── */
function wlHomeCard(){
  const owned=wlOwned(), done=wlDone(), tot=WL30_DAYS.length, nx=wlNext();
  if(owned && nx>=tot) return '';
  if(typeof hpoCard!=='function') return '';
  const d=wlDay(Math.min(nx,tot-1));
  if(owned && done)
    return hpoCard(WL30,{wide:true,kick:'Day '+(nx+1)+' · '+wlMinutes(d)+' min',go:'wlOpenDay('+nx+')'});
  if(owned)
    return hpoCard(WL30,{wide:true,kick:contentOpen()?'New · In HITFAT+':'Yours · Ready when you are',go:"openProgram('"+WL30_ID+"')"});
  return hpoCard(WL30,{wide:true,kick:'New Program · RM'+WL30_PRICE,go:"openProgram('"+WL30_ID+"')"});
}

/* ── the food in Malay (18 Oct, Seth: "nutrition tu makanan bahasa melayu") ──
   BURN30's old menu's dish names and portions, from the app's own
   dictionary; Eat's meal plans still read them (mpMs, mpPor) */
const WL30_MS={
  /* dishes */
  'Wholegrain cereal + milk + fruit':'Bijirin penuh + susu + buah','Egg fried rice + vegetables':'Nasi goreng telur + sayur',
  'Bread wrap + tuna + salad':'Wrap roti + tuna + salad','Grilled chicken chop + potato + salad':'Chicken chop panggang + kentang + salad',
  'Rice vermicelli soup + greens':'Bihun sup + sayur hijau','Brown rice buddha bowl':'Mangkuk nasi perang campur',
  'Tofu + tempe + vegetables + a little rice':'Tauhu + tempe + sayur + sedikit nasi','Soy tempe + grilled aubergine + brown rice':'Tempe kicap + terung bakar + nasi perang',
  'Greek yoghurt + granola + fruit':'Yogurt Greek + granola + buah','Wholemeal bread + omelette + cucumber':'Roti mil penuh + telur dadar + timun',
  'Oats + banana + milk':'Oat + pisang + susu','Chicken tomyam + a little rice':'Tomyam ayam + sedikit nasi','Asam laksa, lighter version':'Asam laksa, versi ringan',
  'Rice + egg + anchovy sambal + vegetables':'Nasi + telur + sambal ikan bilis + sayur','Chicken salad + boiled egg + dressing':'Salad ayam + telur rebus + sos salad',
  'Fried noodles, portion controlled':'Mi goreng, porsi terkawal','Vegetable soup + tofu + a little rice':'Sup sayur + tauhu + sedikit nasi',
  'Nasi lemak, portion controlled':'Nasi lemak, porsi terkawal','Fried noodles with vegetables + tempe':'Mi goreng sayur + tempe',
  'Chicken stir-fry + vegetables + egg + rice':'Ayam tumis + sayur + telur + nasi','Grilled fish + ulam + sambal + a little rice':'Ikan bakar + ulam + sambal + sedikit nasi',
  'Boiled eggs + wholemeal bread + tea':'Telur rebus + roti mil penuh + teh','Rice vermicelli chicken soup':'Bihun sup ayam',
  'Rice + grilled fish + vegetables + sambal':'Nasi + ikan bakar + sayur + sambal','Steamed ginger fish + rice + vegetables':'Ikan stim halia + nasi + sayur',
  'Ginger soy chicken + vegetables + a little rice':'Ayam kicap halia + sayur + sedikit nasi','Brown rice + tempe + tofu + vegetables':'Nasi perang + tempe + tauhu + sayur',
  'Chicken vegetable soup + a little rice':'Sup sayur ayam + sedikit nasi','Fried rice vermicelli + beans':'Bihun goreng + kacang',
  'Wholemeal bread + tuna salad':'Roti mil penuh + salad tuna','Rice + vegetable curry + tofu + beans':'Nasi + kari sayur + tauhu + kacang',
  'Steamed rice + chicken, portion controlled':'Nasi ayam, porsi terkawal',
  /* foods */
  'Fried egg':'Telur goreng','Wholemeal wrap':'Wrap mil penuh','Canned tuna in water':'Tuna tin dalam air','Low-fat mayonnaise':'Mayonis rendah lemak',
  'Boiled chickpeas':'Kacang kuda rebus','Grilled tofu':'Tauhu bakar','Olive oil':'Minyak zaitun','Oats (cooked)':'Oat (dimasak)',
  'Rice vermicelli / laksa noodles':'Bihun / mi laksa','Mackerel / sardines':'Ikan kembung / sardin','Cucumber + pineapple':'Timun + nanas',
  'Asam laksa broth':'Kuah asam laksa','Chicken / egg':'Ayam / telur','Mixed vegetable soup':'Sup sayur campur','Boiled tofu':'Tauhu rebus',
  'Stir-fried spinach':'Bayam tumis','Fried tempe':'Tempe goreng','Ulam / cucumber':'Ulam / timun','Shredded boiled chicken':'Ayam rebus carik',
  'Mustard greens / spinach':'Sawi / bayam','Steamed fish':'Ikan stim','Ginger + soy sauce':'Halia + kicap','Boiled broccoli / kailan':'Brokoli / kailan rebus',
  'Soy chicken, light on oil':'Ayam kicap, kurang minyak','Cut watermelon':'Tembikai potong','Boiled chicken, skinless':'Ayam rebus, tanpa kulit',
  'Chickpeas + sweetcorn':'Kacang kuda + jagung manis','Cut papaya':'Betik potong','Vegetable curry (dhal + pumpkin)':'Kari sayur (dal + labu)',
  'Stir-fried long beans':'Kacang panjang tumis','Sambal':'Sambal','Orange':'Oren','Salad + tomato':'Salad + tomato','Salad + ulam':'Salad + ulam',
  'Cucumber + tomato':'Timun + tomato',
  /* snacks (the Eat plans) */
  'Cut fruit (papaya / watermelon)':'Buah potong (betik / tembikai)','Papaya / watermelon':'Betik / tembikai','Edamame / boiled beans':'Edamame / kacang rebus',
  'High-protein milk':'Susu tinggi protein','High-protein milk / shake':'Susu tinggi protein / shake','Small chicken sandwich':'Sandwic ayam kecil',
  'Almonds / groundnuts':'Badam / kacang tanah','Boiled eggs':'Telur rebus','Peanut butter':'Mentega kacang','Greek yoghurt + honey':'Yogurt Greek + madu',
  'Tofu':'Tauhu','Low-sodium soy sauce':'Kicap rendah natrium',
  /* parts */
  'nuts':'kacang','peanut butter':'mentega kacang','soy sauce':'kicap','honey':'madu',
  'a little rice':'sedikit nasi','fruit':'buah','milk':'susu','potato':'kentang','salad':'salad','tuna':'tuna','greens':'sayur hijau','beans':'kacang'};
function wlMs1(s){ if(WL30_MS.hasOwnProperty(s)) return WL30_MS[s]; const t=(typeof i18n==='function')?i18n(s):null; return t; }
function wlMs(s){
  s=String(s||''); const t=wlMs1(s); if(t) return t;
  /* a dish with a fruit after it ('… + Banana'): the longest known start, then the rest one by one */
  const parts=s.split(' + ');
  for(let k=parts.length-1;k>=1;k--){ const h=wlMs1(parts.slice(0,k).join(' + ')); if(h) return h+' + '+parts.slice(k).map(x=>wlMs1(x)||x).join(' + '); }
  return parts.map(x=>wlMs1(x)||x).join(' + ');
}
/* portions in Malay: the measures; the numbers and grams as they are */
const WL30_UNITS=[[/\bsmall bowl\b/g,'mangkuk kecil'],[/\blarge bowl\b/g,'mangkuk besar'],[/\bbowl\b/g,'mangkuk'],[/\blarge palm\b/g,'tapak tangan besar'],
  [/\bpalm\b/g,'tapak tangan'],[/\bsmall pancakes\b/g,'pancake kecil'],[/\bfists?\b/g,'kepal'],[/\bsmall slices\b/g,'keping kecil'],[/\bthumbs?\b/g,'ibu jari'],[/\bhandfuls?\b/g,'genggam'],[/\bcooked\b/g,'masak'],
  [/\btbsp\b/g,'sudu besar'],[/\btsp\b/g,'sudu kecil'],[/\bglass\b/g,'gelas'],[/\bcup\b/g,'cawan'],[/\bcan\b/g,'tin'],[/\bladle\b/g,'senduk'],
  [/\bstick\b/g,'batang'],[/\bwhole\b/g,'biji'],[/\bpieces?\b/g,'ketul'],[/\bblocks?\b/g,'keping'],[/\bslices?\b/g,'keping'],
  [/(\d) medium\b/g,'$1 biji sederhana'],[/\bmedium\b/g,'sederhana'],[/\ba little\b/g,'sedikit']];
function wlPortion(s){ let t=String(s||''); WL30_UNITS.forEach(r=>{ t=t.replace(r[0],r[1]); }); return t; }
