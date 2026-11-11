/* ═══════════════════════════════════════════════════════════════════════
   b_config.js — SATU sumber kebenaran untuk setiap nombor dalam app ini.

   SEBAB FAIL INI WUJUD (tiga pepijat sebenar daripada app HITFAT terdahulu):

   1. AI Trainer menyimpan ambang skrin "Detection Test" BERASINGAN daripada
      ambang workout — pushup lulus ujian pada 80 darjah tetapi memerlukan 95
      semasa bersenam, dan ujian itu berjalan pada model yang lebih ringan.
      Atlet melihat "Detection Works!" lalu tidak dikira. Di sini ujian,
      workout dan analisis membaca objek yang SAMA. Tiada pengecualian.

   2. Ambang jarak ditulis sebagai pecahan skrin (0.12, 0.18). Budak kecil
      berdiri jauh menghasilkan pergerakan yang lebih kecil pada skrin dan
      tidak pernah mencetuskan rep. HitFatMON menampalnya dengan mendarab
      ambang; di sini kita BAHAGIKAN ukuran dengan torso atlet sendiri, jadi
      setiap jarak dinyatakan dalam "unit torso" dan bebas skala sejak awal.

   3. Rep dicetuskan oleh satu ambang sahaja. Anggaran lutut bergoyang lebih
      kurang 15 darjah pada figura jauh berseluar longgar, dan setiap goyangan
      yang melintasi garisan menjadi rep — Wall Ball Lab pernah mengira 8 rep
      dalam 4 saat daripada atlet yang berdiri diam. Setiap pergerakan di sini
      mengisytiharkan `gate`: tempoh minimum, perjalanan minimum, bengkokan
      minimum. Kitaran dibuka dengan murah hati, disahkan dengan ketat.

   Tukar nilai DI SINI = tertukar di mana-mana. Jangan salin nombor ke tempat
   lain. Kalau kau tergoda untuk hardcode satu ambang dalam detektor, itu
   tanda medan baharu patut ditambah di sini.
   ═══════════════════════════════════════════════════════════════════════ */
var TR = { build: '__BUILD__' };

/* Satu sumber masa, supaya ujian boleh memalsukan jam. Rep ditakrifkan oleh
   TEMPOH — get minRepMs ialah pertahanan utama terhadap rep hantu — jadi
   logik itu mesti boleh dibuktikan tanpa menunggu masa sebenar berlalu. */
TR.now = function () { return Date.now(); };

TR.CFG = {
  debug: false,

  /* ── Keyakinan & masa ──────────────────────────────────────────────── */
  minScore: 0.4,         // keyakinan sendi minimum sebelum ia dipercayai
  cooldownMs: 350,       // jeda lalai antara rep (pergerakan boleh mengatasi)
  smoothAlpha: 0.35,     // EMA atas isyarat pengesanan sahaja

  /* Pengesanan berjalan atas isyarat yang dilicinkan (kurang jitter), tetapi
     TITIK TERDALAM diukur atas isyarat mentah. EMA ketinggalan pada pusingan
     dan sentiasa under-read paras paling dalam — kalau kedalaman dihakimi
     atas isyarat licin, squat yang betul-betul dalam dilaporkan cetek. */

  /* ── Kalibrasi ─────────────────────────────────────────────────────────
     Atlet berdiri tegak selama beberapa frame sebelum set bermula. Kita
     rakam torso mereka SEKALI dan bekukan untuk set itu.

     Kenapa bukan torso setiap frame: dalam pushup dan plank badan mendatar,
     jadi jarak menegak bahu→pinggul pada skrin hampir sifar. Membahagi
     dengannya meletup. Torso semasa BERDIRI ialah unit saiz badan yang sah
     untuk mana-mana kedudukan, jadi rakam ia sekali sahaja. */
  calibFrames: 18,          // frame tegak diperlukan sebelum ARMED
  calibUprightMin: 0.16,    // jarak bahu→pinggul (pecahan skrin) yang dikira "tegak"
  torsoMin: 0.08,           // torso lebih kecil daripada ini = atlet terlalu jauh
  torsoMax: 0.60,           // lebih besar = terlalu dekat, sendi keluar bingkai

  /* ── Lantai pengesahan sejagat ─────────────────────────────────────────
     Pergerakan boleh menaikkan nilai ini, tidak boleh menurunkannya. */
  /* Lantai ini mesti muat pergerakan TERPANTAS yang dikenali app, bukan yang
     biasa. Satu langkah high knee ialah kira-kira 250ms sekaki; meletakkan
     lantai sejagat pada 600 membunuh setiap high knee dalam app. Pertahanan
     sebenar terhadap rep hantu ialah `gate.minMs` setiap pergerakan (squat
     700, pushup 700, burpee 1200) — ini hanya menangkap yang mustahil. */
  minRepMs: 120,
  maxRepMs: 20000,          // lebih lama daripada ini = atlet berhenti, buang kitaran
  lostFrameWarn: 30,        // ~1s badan hilang → beri amaran
  lostFrameReset: 90,       // ~3s → buang kitaran yang sedang berjalan

  /* ── Gred set ──────────────────────────────────────────────────────────
     Skor = peratus rep yang sah, ditolak penalti bentuk. Nombor di sini
     supaya skrin keputusan, kad kongsi dan log semuanya bersetuju. */
  gradeA: 90, gradeB: 75, gradeC: 60,

  /* ── Rehat ─────────────────────────────────────────────────────────────
     Rehat antara SENAMAN lebih panjang daripada antara set kerana atlet perlu
     bangun, membaca isyarat kedudukan seterusnya dan menyusun semula diri
     mereka di hadapan kamera. Rehat antara set hanya untuk bernafas. */
  restSetSecs: 30,
  restExSecs: 45,

  /* ── Suara ─────────────────────────────────────────────────────────── */
  voiceGapMs: 2600,         // isyarat teknik jarang; jangan meleter
  voiceRate: 1.05,
  voicePitch: 1.0
};

/* ═══════════════════════════════════════════════════════════════════════
   PERGERAKAN

   Setiap pergerakan mengisytiharkan dirinya sepenuhnya. Menambah senaman
   baharu = satu entri di sini + satu fungsi step() dalam e_detect.js.
   Tiada fail lain perlu disentuh.

   Medan:
     need     sendi yang mesti kelihatan. Array-dalam-array = "kiri ATAU kanan".
     view     'side' | 'front' — dipakai untuk mengajar atlet meletak telefon.
     open     ambang murah hati yang MEMBUKA kitaran
     close    ambang yang MENUTUP kitaran (histeresis; sengaja lebih tinggi)
     judge    apa yang menjadikan rep SAH, dan di mana zon kelabu
     gate     lantai yang mesti dilepasi kitaran sebelum ia dikira langsung
     form     apa yang diperiksa selepas rep, dengan sasarannya
     cue      ayat jurulatih, dipilih oleh sebab
     standard ayat yang memberitahu atlet apa yang dikira, dalam bahasa mereka.
              Ia hidup di sini bersama nombor yang menguatkuasakannya, supaya
              teks dan ambang tidak boleh hanyut berasingan. Versi pertama
              meneka ayat daripada NAMA pergerakan ("kalau ia bermula dengan
              Push...") — yang memberi lunge teks lalai generik, dan akan pecah
              secara senyap pada kali pertama sesiapa menamakan semula sesuatu.
     report   baris MANA yang muncul dalam bacaan penuh. Enjin merekod setiap
              sendi yang dilihatnya, jadi tanpa senarai ini skrin keputusan
              memaparkan apa sahaja yang bukan null — dan sebuah squat berakhir
              melaporkan "sudut siku terdalam 171 darjah". Nombor yang tiada
              kaitan mengajar orang berhenti membaca laporan itu.
   Semua JARAK dalam unit torso (1.0 = satu torso berdiri). Semua SUDUT dalam
   darjah, dan sudut memang bebas skala jadi ia tidak pernah diskala.
   ═══════════════════════════════════════════════════════════════════════ */
TR.EX = {

  squat: {
    name: 'Squat', short: 'SQUAT', icon: '🦵', kind: 'rep', view: 'side',
    need: [['lhip','lknee','lank'], ['rhip','rknee','rank']],
    states: ['STANDING','DOWN'],
    open:  { kneeAngle: 155, hipDrop: 0.22 },   // salah satu memadai — buka murah hati
    close: { kneeAngle: 162, hipRise: 0.12 },
    judge: { hipBelowKnee: 0.00, greyBelow: -0.12, deepAngle: 100, greyAngle: 125 },
    gate:  { minMs: 300, minBend: 25, minDrop: 0.35 },
    form:  { leanMax: 45, symMax: 12 },
    cue: { shallow: 'Go lower — hips below the knee.',
           up: 'Stand all the way up between reps.',
           lean: 'Chest up. You are folding forward.',
           sym: 'You are favouring one leg. Even it out.' },
    standard: 'Hips have to finish below the knee. Anything higher shows in amber and does not add to your count.',
    report: ['counted','time','rhythm','knee','lean','sym','tempo'],
    kcal: 0.32
  },

  pushup: {
    name: 'Push-Up', short: 'PUSH-UP', icon: '💪', kind: 'rep', view: 'side',
    need: [['lsh','lel','lwr'], ['rsh','rel','rwr']],
    states: ['UP','DOWN'],
    open:  { elbowAngle: 130 },
    close: { elbowAngle: 145 },
    judge: { deepAngle: 95, greyAngle: 115 },
    /* 500ms, bukan 700: seorang atlet berirama pantas menyiapkan pushup dalam
       kira-kira 600ms, dan lantai yang menolaknya menghukum kelajuan. Yang
       melindungi pushup daripada goyangan bukan tempoh, tetapi minBend 30
       darjah diukur dari lengan lurus SEBENAR mereka, ditambah histeresis
       130/145 di antara buka dan tutup — kedua-duanya amplitud, jadi
       kedua-duanya adil terhadap pushup separuh. */
    gate:  { minMs: 300, minBend: 30, minDrop: 0 },
    form:  { sagMax: 0.22, symMax: 15 },              // pinggul jatuh/naik berbanding garis bahu→buku lali
    cue: { shallow: 'Chest lower. Elbows to 90.',
           up: 'Lock the arms out at the top.',
           sag: 'Hips are sagging — squeeze the glutes.',
           sym: 'One arm is doing more work than the other.' },
    standard: 'Elbows have to bend past 95 degrees. Half reps show in amber and do not add to your count.',
    report: ['counted','time','rhythm','elbow','sag','sym','tempo'],
    kcal: 0.30
  },

  lunge: {
    name: 'Reverse Lunge', short: 'LUNGE', icon: '🦶', kind: 'rep', view: 'side',
    need: [['lhip','lknee','lank'], ['rhip','rknee','rank']],
    states: ['STANDING','DOWN'],
    alternating: true,
    open:  { kneeAngle: 150 },
    close: { kneeAngle: 158 },
    judge: { deepAngle: 105, greyAngle: 130 },
    gate:  { minMs: 350, minBend: 25, minDrop: 0.20 },
    form:  { leanMax: 40 },
    cue: { shallow: 'Drop the back knee closer to the floor.',
           up: 'Stand tall before the next one.',
           lean: 'Stay upright — do not lean over the front leg.' },
    standard: 'The back knee has to drop until the front knee passes 105 degrees. Short reps show in amber.',
    report: ['counted','time','rhythm','knee','lean','tempo'],
    kcal: 0.30
  },

  jumpjack: {
    name: 'Jumping Jack', short: 'JACK', icon: '⚡', kind: 'rep', view: 'front',
    need: [['lsh','rsh','lwr','rwr','lhip','rhip']],
    states: ['CLOSED','OPEN'],
    open:  { wristAboveShoulder: 0.20, armSpread: 1.10 },  // kedua-dua dalam unit torso
    close: { wristBelowHip: -0.10 },                       // pergelangan tangan turun melepasi pinggul
    judge: { fullSpread: 1.30 },
    gate:  { minMs: 400, minBend: 0, minDrop: 0 },
    cooldownMs: 250,
    cue: { shallow: 'Arms all the way overhead.',
           up: 'Hands back down past the hips.' },
    standard: 'Hands all the way overhead, then all the way back down past the hips.',
    report: ['counted','time','rhythm','spread'],
    kcal: 0.16
  },

  highknee: {
    name: 'High Knees', short: 'HIGH KNEE', icon: '🏃', kind: 'rep', view: 'front',
    need: [['lhip','rhip','lknee','rknee']],
    states: ['DOWN','UP'],
    alternating: true,
    /* Unit torso, sifar = lutut betul-betul pada paras pinggul (paha melintang).
       HitFatMON memakai 0.12 unit skrin di sini, iaitu kira-kira setengah
       torso DI ATAS pinggul — lebih tinggi daripada yang mana-mana pelari
       capai. Piawaian sebenar ialah paha melintang, jadi itulah garisannya. */
    open:  { kneeLift: -0.10 },
    close: { kneeLift: -0.45 },
    judge: { fullLift: 0.05, greyLift: -0.15 },
    gate:  { minMs: 180, minBend: 0, minDrop: 0 },
    cooldownMs: 200,
    cue: { shallow: 'Knees higher — hip height.' },
    standard: 'The knee has to reach hip height. Lower than that shows in amber and does not add to your count.',
    report: ['counted','time','rhythm','lift'],
    kcal: 0.14
  },

  jumpsquat: {
    name: 'Jump Squat', short: 'JUMP SQUAT', icon: '🚀', kind: 'rep', view: 'side',
    need: [['lhip','lknee','lank'], ['rhip','rknee','rank']],
    states: ['STANDING','DOWN'],
    open:  { kneeAngle: 150, hipDrop: 0.25 },
    close: { kneeAngle: 150, hipRise: 0.10 },
    judge: { hipBelowKnee: -0.05, greyBelow: -0.18, deepAngle: 110, greyAngle: 130, minAirRise: 0.10 },  // pinggul mesti naik pantas = lompatan
    gate:  { minMs: 300, minBend: 25, minDrop: 0.30 },
    form:  { leanMax: 45 },
    cue: { shallow: 'Squat deeper before you jump.',
           air: 'Drive off the floor — that was a stand, not a jump.',
           lean: 'Chest up on the landing.' },
    standard: 'Hips below the knee AND both feet off the floor. A deep squat without the jump counts as a half rep.',
    report: ['counted','time','rhythm','knee','lean','tempo'],
    kcal: 0.45
  },

  burpee: {
    name: 'Burpee', short: 'BURPEE', icon: '🔥', kind: 'rep', view: 'side',
    need: [['lsh','rsh','lhip','rhip']],
    /* Kitaran: BERDIRI → CANGKUNG → PLANK → BANGUN (tangan atas kepala).
       Pengesanan lompatan sengaja TIDAK diwajibkan — ia yang paling kerap
       gagal pada kamera telefon, dan sebuah rep yang hilang kerana kamera
       terlepas 80ms di udara mengajar atlet bahawa app itu pembohong.
       Tangan atas kepala dipakai sebagai pengesahan berdiri penuh. */
    states: ['STANDING','CROUCH','PLANK','RECOVER'],
    open:  { hipDrop: 0.45 },
    close: { hipRise: 0.20 },
    judge: { plankLevel: 0.70, requireReach: true, reachGap: 0.02 },
    gate:  { minMs: 700, minBend: 0, minDrop: 0.60 },
    cooldownMs: 600,
    cue: { plank: 'Get all the way to plank.',
           stand: 'Stand up, hands overhead.',
           shallow: 'You did not get low enough.' },
    standard: 'Chest down to plank, then stand all the way up with hands overhead. Miss the plank and it is a no rep.',
    report: ['counted','time','rhythm','drop','tempo'],
    kcal: 0.55
  },

  plank: {
    name: 'Plank Hold', short: 'PLANK', icon: '🧱', kind: 'hold', view: 'side',
    need: [['lsh','rsh','lhip','rhip']],
    states: ['OUT','HOLD'],
    /* Tahan masa, bukan rep. `level` = jarak menegak bahu→pinggul dalam unit
       torso; kecil bermakna badan mendatar. */
    judge: { level: 0.55, wristBelow: 0.05 },
    form:  { sagMax: 0.30 },
    cue: { sag: 'Hips are dropping — squeeze the glutes.',
           pike: 'Hips too high — drop into a straight line.',
           out: 'Get into a plank position.' },
    standard: 'The clock only runs while your shoulders, hips and ankles hold a straight line.',
    report: ['counted','time','sag'],
    kcal: 0.06         // sesaat, bukan serep
  }
,
  /* ═══════════════════════════════════════════════════════════════════
     LAPAN PERGERAKAN YANG DIPORT DARIPADA AI TRAINER LAMA

     Ambang asal ditulis dalam unit SKRIN (0.18, 0.08, 0.06). Ia ditukar
     kepada unit torso di sini dengan membahagi dengan 0.25 — torso tipikal
     dalam bingkai yang ambang asal ditala. Itu menjadikannya adil merentas
     saiz badan dan jarak kamera, yang versi asal tidak pernah.

     Keluarga squat lama memakai nisbah kedalaman (kneeY-hipY)/(ankleY-hipY).
     Di sini semuanya memakai pinggul-berbanding-lutut yang sama dengan squat
     biasa, supaya "cukup dalam" bermakna perkara yang SAMA merentas setiap
     pergerakan squat dalam app. Sumo yang dikira dalam pada 0.52 sedangkan
     squat biasa memerlukan sudut 100 darjah ialah dua piawaian berbeza yang
     memakai perkataan yang sama.
     ═══════════════════════════════════════════════════════════════════ */

  sumosquat: {
    name: 'Sumo Squat', short: 'SUMO', icon: '🦿', kind: 'rep', view: 'front',
    need: [['lhip','rhip','lknee','rknee']],
    states: ['STANDING','DOWN'],
    open:  { hipDrop: 0.22, kneeAngle: 150 },
    close: { hipRise: 0.12, kneeAngle: 158 },
    judge: { hipBelowKnee: -0.05, greyBelow: -0.18, deepAngle: 105, greyAngle: 130, wideStance: 0.90 },
    gate:  { minMs: 300, minBend: 22, minDrop: 0.32 },
    form:  { symMax: 14 },
    cue: { shallow: 'Sink deeper — hips to knee level.',
           narrow: 'Feet wider, toes turned out.',
           sym: 'One side is dropping further than the other.' },
    standard: 'Feet wider than your shoulders, and hips down to knee level. Narrow or high reps show in amber.',
    report: ['counted','time','rhythm','knee','sym','tempo'],
    kcal: 0.30
  },

  squathold: {
    name: 'Squat Hold', short: 'SQUAT HOLD', icon: '⏱', kind: 'hold', view: 'side',
    need: [['lhip','lknee','lank'], ['rhip','rknee','rank']],
    states: ['OUT','HOLD'],
    judge: { hipBelowKnee: -0.15, kneeAngle: 120 },
    form:  { leanMax: 45 },
    cue: { out: 'Sit down into the squat and hold.',
           lean: 'Chest up while you hold.' },
    standard: 'The clock only runs while you stay down at or below parallel.',
    report: ['counted','time','knee'],
    kcal: 0.08
  },

  squatjack: {
    name: 'Squat Jack', short: 'SQUAT JACK', icon: '💥', kind: 'rep', view: 'front',
    need: [['lhip','rhip','lknee','rknee','lank','rank']],
    states: ['UP','DOWN'],
    open:  { hipDrop: 0.20, footSpread: 0.72 },   // kedua-dua diperlukan: jatuh DAN kaki melebar
    close: { hipRise: 0.12 },
    judge: { hipBelowKnee: -0.20, greyBelow: -0.35, fullSpread: 0.72 },
    gate:  { minMs: 300, minBend: 0, minDrop: 0.28 },
    cooldownMs: 300,
    cue: { shallow: 'Sit lower when your feet land wide.',
           narrow: 'Jump the feet wider.' },
    standard: 'Jump the feet wide and sit into a squat, then jump them back together.',
    report: ['counted','time','rhythm','drop'],
    kcal: 0.28
  },

  squatside: {
    name: 'Squat Side to Side', short: 'SQUAT SIDE', icon: '↔️', kind: 'rep', view: 'front',
    need: [['lhip','rhip','lknee','rknee']],
    states: ['CENTRE','SHIFTED'],
    alternating: true,
    /* Kekal rendah ialah SYARAT, bukan penghakiman: berjalan sisi-ke-sisi
       sambil berdiri tegak bukan pergerakan ini langsung, jadi anjakan tidak
       dikira melainkan pinggul sudah turun. */
    open:  { minDrop: 0.30, shift: 0.24 },
    close: { shift: 0.10 },
    judge: { fullShift: 0.34, greyShift: 0.20 },
    gate:  { minMs: 250, minBend: 0, minDrop: 0 },
    cooldownMs: 250,
    cue: { shallow: 'Travel further across.',
           high: 'Stay low between sides.' },
    standard: 'Stay down in the squat and travel side to side. Standing up between sides does not count.',
    report: ['counted','time','rhythm'],
    kcal: 0.26
  },

  tricepspushup: {
    name: 'Triceps Push-Up', short: 'TRICEPS', icon: '🔺', kind: 'rep', view: 'side',
    need: [['lsh','lel','lwr'], ['rsh','rel','rwr']],
    states: ['UP','DOWN'],
    open:  { elbowAngle: 125 },
    close: { elbowAngle: 145 },
    /* KEDUDUKAN SIKU TIDAK DIHAKIMI, DENGAN SENGAJA.

       Enjin lama menolak bingkai apabila siku melebar ("Keep elbows in!") dan
       berhenti mengesan sepenuhnya — jadi pushup lebar tidak dikira DAN tidak
       dilaporkan. Pembetulan pertama aku ialah mengira lalu melabelnya 'wide'.
       Ujian mendedahkan mengapa itu pun salah: dari pandangan sisi kau tidak
       boleh membengkokkan siku tanpa menggerakkannya ke tepi dalam imej, jadi
       "sudut siku" dan "siku keluar" ialah SATU ukuran yang sama diambil dua
       kali. Melabel rep sebagai lebar berdasarkan itu ialah tekaan yang
       kelihatan seperti pengukuran.

       Wall Ball Lab sampai ke kesimpulan yang sama dan menyenaraikan "elbows
       in" antara perkara yang sengaja tidak dipaparkan. Jadi pergerakan ini
       menghakimi apa yang boleh dilihatnya — kedalaman, lebih ketat daripada
       pushup biasa — dan `standard` memberitahu atlet bahawa kedudukan siku
       adalah tanggungjawab mereka. */
    judge: { deepAngle: 90, greyAngle: 110 },
    gate:  { minMs: 300, minBend: 30, minDrop: 0 },
    form:  { sagMax: 0.22 },
    cue: { shallow: 'Lower further — chest to the floor.',
           sag: 'Hips are sagging — squeeze the glutes.' },
    standard: 'Elbows bend past 90 degrees — deeper than a normal push-up. Keep them tucked to your ribs: the camera cannot check that from one angle, so that part is on you.',
    report: ['counted','time','rhythm','elbow','sag','tempo'],
    kcal: 0.30
  },

  pushuptap: {
    name: 'Push-Up Shoulder Tap', short: 'SHOULDER TAP', icon: '👋', kind: 'rep', view: 'front',
    need: [['lsh','rsh','lwr','rwr']],
    states: ['PLANK','TAP'],
    alternating: true,
    open:  { tapDist: 0.45 },      // pergelangan tangan dalam jarak ini dari bahu bertentangan
    close: { tapDist: 0.75 },
    judge: { fullTap: 0.38, greyTap: 0.55 },
    gate:  { minMs: 250, minBend: 0, minDrop: 0 },
    cooldownMs: 300,
    form:  { sagMax: 0.28 },
    cue: { shallow: 'Reach all the way to the shoulder.',
           sag: 'Stop the hips rocking — squeeze everything.' },
    standard: 'From a plank, the hand has to reach the opposite shoulder. Left and right count separately.',
    report: ['counted','time','rhythm','sag'],
    kcal: 0.22
  },

  staticrun: {
    name: 'Static Run', short: 'STATIC RUN', icon: '🏃‍♂️', kind: 'rep', view: 'front',
    need: [['lhip','rhip','lknee','rknee']],
    states: ['DOWN','UP'],
    alternating: true,
    /* Sama seperti high knee tetapi pada irama berlari: garisan lebih rendah,
       cooldown lebih pendek. Ini pergerakan kelajuan, bukan pergerakan julat. */
    open:  { kneeLift: -0.25 },
    close: { kneeLift: -0.55 },
    judge: { fullLift: -0.10, greyLift: -0.30 },
    gate:  { minMs: 140, minBend: 0, minDrop: 0 },
    cooldownMs: 130,
    cue: { shallow: 'Drive the knees up.' },
    standard: 'Fast alternating knee drive. Each knee counts as one, so the pace is what makes it hard.',
    report: ['counted','time','rhythm','lift'],
    kcal: 0.12
  },

  sidehop: {
    name: 'Side Hop', short: 'SIDE HOP', icon: '⤢', kind: 'rep', view: 'front',
    need: [['lhip','rhip']],
    states: ['CENTRE','SHIFTED'],
    alternating: true,
    open:  { shift: 0.32 },
    close: { shift: 0.12 },
    judge: { fullShift: 0.40, greyShift: 0.26 },
    gate:  { minMs: 200, minBend: 0, minDrop: 0 },
    cooldownMs: 220,
    cue: { shallow: 'Cover more ground each hop.' },
    standard: 'Hop side to side. Each landing counts, and short hops show in amber.',
    report: ['counted','time','rhythm'],
    kcal: 0.20
  }
};

TR.EX_ORDER = ['squat','pushup','lunge','jumpjack','highknee','jumpsquat','burpee','plank',
               'sumosquat','squathold','squatjack','squatside','tricepspushup','pushuptap',
               'staticrun','sidehop'];

/* Ujian pergerakan: rep SAH yang diperlukan sebelum app bersetuju bahawa
   kamera benar-benar melihat pergerakan itu. Ia menggunakan ambang di atas —
   objek yang sama dengan workout. Itulah keseluruhan maksudnya. */
TR.TEST_REPS = 3;
