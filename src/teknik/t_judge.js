/* ═══════════════════════════════════════════════════════════════════════
   t_judge.js — Semak Teknik THE START: piawaian BEGINNER di atas enjin
   HITFAT Trainer (engine/*.js, disalin tanpa ubah dari hitfat-trainer-src).

   Enjin asal menghakimi seperti pengadil: squat mesti pinggul bawah lutut,
   kalau tidak "no rep". Untuk orang yang baru mula itu salah tujuan. Di sini
   tiada kiraan dan tiada "gagal": setiap rep diperiksa terhadap kunci teknik
   beginner, dan keputusan memberi SATU benda untuk dibetulkan.

   Fail ini tulen (tiada DOM) supaya ia boleh diuji dengan jsc.
   ═══════════════════════════════════════════════════════════════════════ */

var TK = TK || {};

/* Gerakan yang dibuka. Video = klip coach HITFAT yang sama dalam app. */
TK.EX = {
  squat: {
    nama: 'Squat', sub: 'Bodyweight Squat', vid: '1183237084',
    kunci: ['Kaki selebar bahu, tumit kekal di lantai',
            'Tolak punggung ke belakang, macam nak duduk kerusi',
            'Dada naik, pandang ke depan',
            'Turun 2 saat, naik 1 saat'],
    sedia: 'Berdiri tegak, sisi badan menghadap kamera.',
    mula: 'Sedia! Buat 5 squat perlahan.',
    rows: [['Kedalaman', ['dalam', 'dalam_sikit']], ['Dada naik', ['dada']], ['Kawalan turun', ['laju']]]
  },
  pushup: {
    nama: 'Push Up', sub: 'Push up lutut atau biasa', vid: '1183277738', vidFull: '1183253182',
    kunci: ['Tangan di bawah bahu, sedikit lebih lebar',
            'Badan lurus dari kepala ke lutut (atau kaki)',
            'Ketatkan perut, pinggul jangan jatuh',
            'Turun sampai siku lebih kurang 90°'],
    sedia: 'Berdiri tegak dulu, sisi badan menghadap kamera. Bila AI dah sedia, baru turun.',
    mula: 'Sedia! Turun ke posisi push up, kemudian buat 5 rep.',
    rows: [['Siku sampai 90°', ['siku', 'siku_sikit']], ['Badan lurus', ['pinggul']], ['Kawalan turun', ['laju']]]
  },
  lunge: {
    nama: 'Lunge', sub: 'Reverse Lunge', vid: '1183237088',
    kunci: ['Langkah ke BELAKANG, bukan ke depan',
            'Lutut belakang turun ke arah lantai',
            'Badan tegak, jangan condong ke depan',
            'Tukar kaki setiap rep. Pegang kerusi kalau perlu'],
    sedia: 'Berdiri tegak, sisi badan menghadap kamera.',
    mula: 'Sedia! Buat 5 lunge, tukar kaki setiap rep.',
    rows: [['Lutut turun', ['lutut', 'lutut_sikit']], ['Badan tegak', ['badan']], ['Kawalan turun', ['laju']]]
  },
  burpee: {
    nama: 'Burpee', sub: 'Burpee beginner, langkah ke belakang', vid: '1183253168',
    kunci: ['Cangkung, letak tangan di lantai',
            'Langkah kaki ke belakang satu-satu sampai badan lurus',
            'Langkah balik ke depan, kemudian bangun',
            'Berdiri tegak penuh di hujung setiap rep. Lompat tak perlu'],
    sedia: 'Berdiri tegak, sisi badan menghadap kamera.',
    mula: 'Sedia! Buat 5 burpee ikut rentak anda.',
    /* "Bangun penuh" tiada kod: enjin hanya menutup rep bila pinggul kembali
       ke paras berdiri, jadi setiap rep yang wujud SUDAH bangun penuh. */
    rows: [['Sampai plank', ['plank']], ['Bangun penuh', []]]
  }
};
TK.ORDER = ['squat', 'pushup', 'lunge', 'burpee'];
TK.TARGET = 5;

/* Ayat untuk setiap isu. cue = disebut semasa rep (pendek);
   title/body = kad "fokus seterusnya". */
TK.ISU = {
  dalam:       { cue: 'Turun lagi, sampai paha selari lantai.', title: 'Turun lebih dalam',
                 body: 'Bayangkan ada kerusi di belakang anda. Tolak punggung ke belakang dan turun sampai paha selari dengan lantai.' },
  dalam_sikit: { cue: 'Hampir! Turun sikit lagi.', title: 'Turun sikit lagi',
                 body: 'Dah hampir. Turun sedikit lagi sampai paha selari dengan lantai, tumit kekal di lantai.' },
  dada:        { cue: 'Dada naik, pandang depan.', title: 'Dada naik',
                 body: 'Badan anda condong terlalu ke depan. Angkat dada, pandang ke depan, dan biar punggung yang bergerak ke belakang.' },
  laju:        { cue: 'Perlahan masa turun. Kira dua saat.', title: 'Turun lebih perlahan',
                 body: 'Anda turun terlalu laju. Kira "satu, dua" masa turun. Gerakan perlahan bina kawalan dan jaga sendi.' },
  siku:        { cue: 'Bengkok siku lagi, dada ke lantai.', title: 'Turun lebih rendah',
                 body: 'Bengkokkan siku sampai lebih kurang 90°. Kalau terlalu berat, buat push up lutut dulu.' },
  siku_sikit:  { cue: 'Hampir! Turun sikit lagi.', title: 'Turun sikit lagi',
                 body: 'Dah hampir 90°. Turun sedikit lagi, dada ke arah lantai.' },
  pinggul:     { cue: 'Ketatkan perut, pinggul jangan jatuh.', title: 'Badan lurus',
                 body: 'Pinggul anda jatuh atau terangkat. Ketatkan perut dan punggung supaya badan lurus macam papan.' },
  lutut:       { cue: 'Lutut belakang turun lagi.', title: 'Lutut belakang turun',
                 body: 'Langkah cukup jauh ke belakang dan turunkan lutut belakang ke arah lantai.' },
  lutut_sikit: { cue: 'Hampir! Turun sikit lagi.', title: 'Turun sikit lagi',
                 body: 'Dah hampir. Turunkan lutut belakang sedikit lagi, badan kekal tegak.' },
  badan:       { cue: 'Badan tegak, jangan condong.', title: 'Badan tegak',
                 body: 'Badan anda condong ke depan. Kekalkan dada naik dan bahu di atas pinggul.' },
  plank:       { cue: 'Kaki ke belakang sampai badan lurus.', title: 'Sampai posisi plank',
                 body: 'Langkah kaki ke belakang sampai badan lurus dari bahu ke kaki, baru langkah balik ke depan.' },
  tangan:      { cue: 'Bangun penuh, tangan ke atas.', title: 'Bangun penuh',
                 body: 'Habiskan setiap burpee dengan berdiri tegak dan angkat tangan ke atas kepala.' }
};

/* Penyesuaian enjin untuk beginner. Get kekal (ia yang menghalang rep
   hantu), cuma dilonggarkan sedikit supaya squat cetek orang baru TETAP
   wujud sebagai rep dan boleh ditegur, bukannya hilang senyap. */
TK.tune = function () {
  TR.EX.squat.gate.minDrop = 0.28; TR.EX.squat.gate.minBend = 20;
  TR.EX.lunge.gate.minDrop = 0.15; TR.EX.lunge.gate.minBend = 20;
  TR.EX.pushup.gate.minBend = 25;
  TR.EX.burpee.gate.minMs = 900;
  /* Tangan atas kepala tidak diwajibkan: video coach HITFAT sendiri melompat
     dengan tangan di belakang kepala (diuji 11 Nov), dan burpee beginner
     tanpa lompat tidak perlu. Yang diwajibkan: sampai plank, bangun penuh. */
  TR.EX.burpee.judge.requireReach = false;
  /* Teguran enjin asal dalam English; Semak Teknik bercakap sendiri. */
  var k; for (k in TR.EX) if (TR.EX.hasOwnProperty(k)) TR.EX[k].cue = {};
};

/* Push up lutut: garis badan ialah bahu → LUTUT, bukan bahu → buku lali.
   Dengan sag asal, lutut di lantai membuat pinggul nampak "jatuh". */
TK.sagAnkle = null;
TK.setVariant = function (v) {
  if (!TK.sagAnkle) TK.sagAnkle = TR.sag;
  TR.sag = (v === 'lutut') ? function (m) {
    var sh = m.sh, hip = m.hip, kn = m.knee;
    if (!sh || !hip || !kn) return null;
    var vx = kn.x - sh.x, vy = kn.y - sh.y, len = Math.sqrt(vx * vx + vy * vy);
    if (len < 0.01) return null;
    return Math.abs((hip.x - sh.x) * vy - (hip.y - sh.y) * vx) / len / m.torso;
  } : TK.sagAnkle;
};

/* Adakah ini percubaan sebenar? Push up: badan mesti mendatar. Ujian pada
   video coach (11 Nov) menunjukkan turun dari berdiri ke posisi push up
   membengkokkan siku dan menjadi "rep" pertama dengan badan masih tegak
   (lean 27°); push up sebenar ialah ~108°. */
TK.accept = function (key, rep) {
  if (key === 'pushup' && rep.lean != null && rep.lean < 60) return false;
  return true;
};

/* Satu rep → senarai isu beginner.
   Had "laju" diuji pada video coach HITFAT sebenar (11 Nov): squat coach
   pada tempo biasa memberi ecc 0.58–0.82 s (ecc diukur dari lutut mula
   bengkok hingga titik terdalam). Hanya rep yang betul-betul "jatuh"
   (< 0.5 s) ditegur, supaya demo coach sendiri tidak dikatakan laju. */
TK.check = function (key, rep) {
  var is = [], hk = rep.hipKnee, k = rep.kneeMin, e = rep.elbowMin;
  if (key === 'squat') {
    var ok = (hk != null && hk >= -0.15) || (k != null && k <= 110);
    var near = (hk != null && hk >= -0.35) || (k != null && k <= 135);
    if (!ok) is.push(near ? 'dalam_sikit' : 'dalam');
    if (rep.lean != null && rep.lean > 45) is.push('dada');
    if (rep.ecc != null && rep.ecc < 0.5) is.push('laju');
  } else if (key === 'pushup') {
    if (!(e != null && e <= 105)) is.push((e != null && e <= 125) ? 'siku_sikit' : 'siku');
    if (rep.sag != null && rep.sag > 0.22) is.push('pinggul');
    if (rep.ecc != null && rep.ecc < 0.4) is.push('laju');
  } else if (key === 'lunge') {
    if (!(k != null && k <= 110)) is.push((k != null && k <= 130) ? 'lutut_sikit' : 'lutut');
    if (rep.lean != null && rep.lean > 40) is.push('badan');
    if (rep.ecc != null && rep.ecc < 0.45) is.push('laju');
  } else if (key === 'burpee') {
    if (rep.reason === 'no-plank') is.push('plank');
    else if (rep.reason === 'no-reach') is.push('tangan');
  }
  return is;
};

/* Set → keputusan: berapa rep cantik, status setiap kunci, dan SATU fokus.
   Fokus = kunci yang paling kerap terlepas; seri dipecah ikut susunan rows
   (kedalaman dahulu, kerana itu yang paling mengubah gerakan). */
TK.summary = function (key, reps) {
  var ex = TK.EX[key], n = reps.length, good = 0, i, r, c;
  var rows = [];
  for (r = 0; r < ex.rows.length; r++) rows.push({ label: ex.rows[r][0], codes: ex.rows[r][1], miss: 0, top: null, topN: 0, cnt: {} });
  for (i = 0; i < n; i++) {
    var is = reps[i].issues || [];
    if (!is.length) good++;
    for (r = 0; r < rows.length; r++) {
      var hit = false;
      for (c = 0; c < is.length; c++) if (rows[r].codes.indexOf(is[c]) > -1) {
        hit = true; rows[r].cnt[is[c]] = (rows[r].cnt[is[c]] || 0) + 1;
      }
      if (hit) rows[r].miss++;
    }
  }
  var focus = null, fN = 0;
  for (r = 0; r < rows.length; r++) {
    var row = rows[r], code;
    for (code in row.cnt) if (row.cnt.hasOwnProperty(code) && row.cnt[code] > row.topN) { row.top = code; row.topN = row.cnt[code]; }
    /* "dalam" mengatasi "dalam_sikit" bila kedua-duanya berlaku, kerana
       nasihat untuk yang jauh juga betul untuk yang hampir. */
    if (row.cnt[row.codes[0]] && row.codes.length > 1) row.top = row.codes[0];
    if (row.miss > fN) { fN = row.miss; focus = row.top; }
  }
  var level = !n ? 'kosong' : good === n ? 'cantik' : good / n >= 0.6 ? 'hampir' : 'betulkan';
  return { key: key, n: n, good: good, rows: rows, focus: focus, level: level };
};

/* ── Memory: setiap percubaan disimpan dalam telefon ─────────────────────
   Kiraan dan isu sahaja; tiada video, tiada titik badan. */
TK.MEM_KEY = 'hf_teknik_v1';
TK.memRead = function () {
  try { var a = JSON.parse(localStorage.getItem(TK.MEM_KEY) || '[]'); return Object.prototype.toString.call(a) === '[object Array]' ? a : []; }
  catch (e) { return []; }
};
TK.memAdd = function (s, variant) {
  var a = TK.memRead();
  var rows = {}, r;
  for (r = 0; r < s.rows.length; r++) rows[s.rows[r].label] = s.rows[r].miss;
  a.push({ ex: s.key, v: variant || '', t: TR.now(), n: s.n, good: s.good, rows: rows, focus: s.focus, level: s.level });
  try { localStorage.setItem(TK.MEM_KEY, JSON.stringify(a.slice(-200))); } catch (e) {}
  return a;
};
TK.memFor = function (key) {
  var a = TK.memRead(), out = [], i;
  for (i = 0; i < a.length; i++) if (a[i].ex === key) out.push(a[i]);
  return out;
};

/* Teks enjin (English) → BM, untuk kalibrasi dan "hilang dari kamera". */
TK.bm = function (t) {
  if (!t) return '';
  if (t.indexOf('Hold still') === 0) return 'Berdiri tegak, jangan bergerak…';
  var M = {
    'Show your shoulders': 'Pastikan bahu nampak dalam kamera',
    'Show your hips': 'Pastikan pinggul nampak dalam kamera',
    'Stand up straight': 'Berdiri tegak dulu',
    'Step closer to the camera': 'Dekat sikit dengan kamera',
    'Step back — full body in frame': 'Undur sikit, seluruh badan mesti nampak',
    'Turn side-on to the camera': 'Pusing ke tepi, sisi badan menghadap kamera',
    'Show your full body': 'Pastikan seluruh badan nampak',
    'Step back into frame': 'Masuk semula dalam kamera'
  };
  return M[t] || t;
};
