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
    sedia: 'Berdiri tegak, sisi badan menghadap kamera. Lepas 5 squat, pusing menghadap kamera untuk 3 squat lagi.',
    mula: 'Sedia! Buat 5 squat perlahan.',
    /* 5 rep dari tepi, kemudian 3 dari depan untuk lutut (11 Nov) */
    rows: [['Kedalaman', ['dalam', 'dalam_sikit']], ['Dada naik', ['dada']], ['Tumit di lantai', ['tumit']],
           ['Naik serentak', ['pinggul_naik']], ['Kawalan turun', ['laju']], ['Lutut tak masuk', ['lutut_masuk']]],
    front: 3, clipSedia: 's_sedia_sq'
  },
  pushup: {
    nama: 'Push Up', sub: 'Push up lutut atau biasa', vid: '1183277738', vidFull: '1183253182',
    kunci: ['Tangan di bawah bahu, sedikit lebih lebar',
            'Badan lurus dari kepala ke lutut (atau kaki)',
            'Ketatkan perut, pinggul jangan jatuh',
            'Turun sampai siku lebih kurang 90°'],
    sedia: 'Berdiri tegak dulu, sisi badan menghadap kamera. Bila AI dah sedia, baru turun.',
    mula: 'Sedia! Turun ke posisi push up, kemudian buat 5 rep.',
    rows: [['Siku sampai 90°', ['siku', 'siku_sikit']], ['Badan lurus', ['pinggul']], ['Kawalan turun', ['laju']]],
    clipSedia: 's_sedia_pu'
  },
  lunge: {
    nama: 'Lunge', sub: 'Reverse Lunge', vid: '1183237088',
    kunci: ['Langkah ke BELAKANG, bukan ke depan',
            'Lutut belakang turun ke arah lantai',
            'Badan tegak, jangan condong ke depan',
            'Tukar kaki setiap rep. Pegang kerusi kalau perlu'],
    sedia: 'Berdiri tegak, sisi badan menghadap kamera.',
    mula: 'Sedia! Buat 5 lunge, tukar kaki setiap rep.',
    rows: [['Lutut turun', ['lutut', 'lutut_sikit']], ['Badan tegak', ['badan']], ['Kawalan turun', ['laju']]],
    clipSedia: 's_sedia_lu'
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
    rows: [['Sampai plank', ['plank']], ['Bangun penuh', []]],
    clipSedia: 's_sedia_bu'
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
                 body: 'Habiskan setiap burpee dengan berdiri tegak dan angkat tangan ke atas kepala.' },
  tumit:       { cue: 'Tumit di lantai.', title: 'Tumit kekal di lantai',
                 body: 'Tumit anda terangkat masa turun. Tolak punggung ke belakang dan biar berat badan di tengah tapak kaki hingga ke tumit.' },
  pinggul_naik:{ cue: 'Naik sama-sama, dada dengan punggung.', title: 'Naik serentak',
                 body: 'Masa bangun, punggung naik dulu dan dada tertinggal. Tolak lantai, dan biar dada serta punggung naik bersama-sama.' },
  lutut_masuk: { cue: 'Tolak lutut keluar.', title: 'Lutut ikut arah jari kaki',
                 body: 'Lutut anda masuk ke dalam masa squat. Tolak lutut keluar sedikit supaya ia selari dengan jari kaki. Kalau susah, turun separuh dulu.' }
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

/* ═══════════════════════════════════════════════════════════════════════
   SQUAT, SEMAKAN PENUH (11 Nov, Seth: "kalau boleh kita buat betul-betul ...
   check orang squat tu betul ke tak").

   Enjin mengesan BILA rep berlaku. Penjejak ini membaca setiap bingkai di
   dalam rep itu dan menjawab soalan yang coach tanya:
     dari tepi  — cukup dalam? dada jatuh lebih daripada kaki bawah? tumit
                  terangkat? punggung naik dulu (dada tertinggal)? turun laju?
     dari depan — lutut masuk ke dalam?
   Ia juga bercakap SEMASA rep: "Cukup! Naik!" bila paha sampai selari,
   "Tumit di lantai!" bila tumit naik, "Tolak lutut keluar!" bila lutut masuk.
   Tulen: masuk bingkai + keadaan detektor, keluar ukuran dan isyarat.
   ═══════════════════════════════════════════════════════════════════════ */
TK.SQ_DEPTH = -0.15;          // hipKneeU: 0 = pinggul sama paras lutut; -0.15 ≈ paha selari
TK.SQ = {
  create: function (view) {
    return { view: view || 'side', acc: null, stand: [], hkStand: null, heelBase: null, ratioBase: null, heelRun: 0 };
  },
  /* sudut dari menegak, darjah: kaki bawah (buku lali → lutut) */
  shin: function (s) {
    if (!s || !s.knee || !s.ank) return null;
    return Math.atan2(Math.abs(s.knee.x - s.ank.x), Math.abs(s.ank.y - s.knee.y)) * 180 / Math.PI;
  },
  heelU: function (j, s, T) {
    var h = j[s.k + 'heel'], t = j[s.k + 'foot'];
    if (!h || !t || h.s < 0.5 || t.s < 0.5) return null;
    return (t.y - h.y) / T;                       // positif = tumit lebih tinggi daripada hujung kaki
  },
  kneeRatio: function (j) {
    if (!j.lknee || !j.rknee || !j.lank || !j.rank) return null;
    var aw = Math.abs(j.lank.x - j.rank.x);
    if (aw < 0.02) return null;
    return Math.abs(j.lknee.x - j.rknee.x) / aw;  // < 1 = lutut lebih rapat daripada buku lali
  },
  median: function (a) { var b = a.slice().sort(function (x, y) { return x - y; }); return b.length ? b[Math.floor(b.length / 2)] : null; },

  /* Satu bingkai. inRep = detektor sedang dalam kitaran. Pulang senarai isyarat hidup. */
  frame: function (t, j, inRep) {
    var out = [];
    if (!TR.Calib.ready || !j) return out;
    var m = TR.measure(j), s = m.side, T = m.torso;
    var hk = m.hipKneeU, lean = m.lean, shin = TK.SQ.shin(s), heel = TK.SQ.heelU(j, s, T), ratio = TK.SQ.kneeRatio(j);
    if (!inRep) {
      if (t.acc) t.acc = null;
      /* garis dasar berdiri, dikemas kini setiap kali atlet berehat di atas */
      t.stand.push({ hk: hk, heel: heel, ratio: ratio });
      if (t.stand.length > 15) t.stand.shift();
      var hs = [], he = [], ra = [], i;
      for (i = 0; i < t.stand.length; i++) {
        if (t.stand[i].hk != null) hs.push(t.stand[i].hk);
        if (t.stand[i].heel != null) he.push(t.stand[i].heel);
        if (t.stand[i].ratio != null) ra.push(t.stand[i].ratio);
      }
      if (hs.length) t.hkStand = TK.SQ.median(hs);
      if (he.length) t.heelBase = TK.SQ.median(he);
      if (ra.length) t.ratioBase = TK.SQ.median(ra);
      t.heelRun = 0;
      return out;
    }
    var a = t.acc;
    if (!a) a = t.acc = { hkMax: -9, leanBot: null, shinBot: null, leanAsc: null, deep: false, heel: false, valgus: false, ratioMin: 9, asc: false };
    if (hk != null && hk > a.hkMax) { a.hkMax = hk; a.leanBot = lean; a.shinBot = shin; a.asc = false; a.leanAsc = null; }
    else if (hk != null && hk < a.hkMax - 0.06) {
      a.asc = true;
      /* separuh pertama naik: kalau dada makin condong sedangkan pinggul naik, punggung naik dulu */
      if (hk > a.hkMax - 0.5 && lean != null) a.leanAsc = (a.leanAsc == null) ? lean : Math.max(a.leanAsc, lean);
    }
    if (!a.deep && hk != null && hk >= TK.SQ_DEPTH) { a.deep = true; out.push({ t: 'say', k: 'cukup', deep: true }); }
    if (t.view === 'side' && heel != null && t.heelBase != null && heel - t.heelBase > 0.10) {
      if (++t.heelRun >= 3 && !a.heel) { a.heel = true; out.push({ t: 'say', k: 'tumit' }); }
    } else t.heelRun = 0;
    if (t.view === 'front' && ratio != null) {
      a.ratioMin = Math.min(a.ratioMin, ratio);
      var base = t.ratioBase || 1;
      if (!a.valgus && a.hkMax > -0.6 && (ratio < base * 0.75 || ratio < 0.8)) { a.valgus = true; out.push({ t: 'say', k: 'lutut_masuk' }); }
    }
    return out;
  },
  /* kedalaman untuk tolok di skrin: 0 = berdiri, 1 = paha selari */
  depth: function (t, j) {
    if (!TR.Calib.ready || !j || t.hkStand == null) return 0;
    var hk = TR.measure(j).hipKneeU; if (hk == null) return 0;
    var d = (hk - t.hkStand) / (TK.SQ_DEPTH - t.hkStand);
    return Math.max(0, Math.min(1.15, d));
  },
  /* rep selesai → isu */
  issues: function (t, rep) {
    var a = t.acc || {}, is = [];
    if (t.view === 'front') {
      if (a.valgus) is.push('lutut_masuk');
      t.acc = null; return is;
    }
    var hk = rep.hipKnee, k = rep.kneeMin;
    var ok = a.deep || (hk != null && hk >= TK.SQ_DEPTH) || (k != null && k <= 110);
    var near = (hk != null && hk >= -0.35) || (k != null && k <= 135);
    if (!ok) is.push(near ? 'dalam_sikit' : 'dalam');
    var lb = a.leanBot != null ? a.leanBot : rep.lean, sb = a.shinBot;
    if (lb != null && (lb > 52 || (sb != null && lb - sb > 22 && lb > 40))) is.push('dada');
    if (a.heel) is.push('tumit');
    if (a.leanAsc != null && lb != null && a.leanAsc - lb > 12) is.push('pinggul_naik');
    if (rep.ecc != null && rep.ecc < 0.5) is.push('laju');
    t.acc = null;
    return is;
  }
};

/* Dari depan, lutut membengkok KE ARAH kamera, jadi sudut lutut 2D hampir tidak
   berubah. Detektor depan hanya membaca pinggul jatuh dan naik. */
TK.tuneFront = function () {
  if (TR.EX.squatfront) return;
  var b = TR.EX.squat, f = {}, k;
  for (k in b) if (b.hasOwnProperty(k)) f[k] = b[k];
  f.name = 'Squat (depan)'; f.view = 'front';
  f.need = [['lhip', 'rhip', 'lknee', 'rknee', 'lank', 'rank']];
  f.open = { kneeAngle: 0, hipDrop: 0.22 };
  f.close = { kneeAngle: 0, hipRise: 0.12 };
  f.gate = { minMs: 300, minBend: 0, minDrop: 0.28 };
  TR.EX.squatfront = f;
  TR.STEP.squatfront = TR.STEP.squat;
};

/* Klip suara Coach Seth untuk setiap isu (sfx dalam /teknik/v/). */
TK.CLIP = { dalam: 'dalam', dalam_sikit: 'sikit', siku_sikit: 'sikit', lutut_sikit: 'sikit', dada: 'dada', laju: 'laju',
  siku: 'siku', pinggul: 'pinggul', lutut: 'lutut', badan: 'badan', plank: 'plank', tumit: 'tumit',
  pinggul_naik: 'pinggul_naik', lutut_masuk: 'lutut_masuk' };
TK.CLIPS = ['s_tegak', 's_sedia_sq', 's_depan', 's_depan_mula', 's_sedia_pu', 's_sedia_lu', 's_sedia_bu', 'c1', 'c2', 'c3', 'c4', 'c5',
  'cukup', 'cantik', 'mantap', 'dalam', 'sikit', 'dada', 'tumit', 'pinggul_naik', 'laju', 'lutut_masuk', 'berdiri', 'siku', 'pinggul',
  'lutut', 'badan', 'plank', 'hilang', 'kaki', 'r_cantik', 'r_hampir', 'r_betul', 'fokus', 'siap'];
