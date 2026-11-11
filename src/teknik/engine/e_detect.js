/* ═══════════════════════════════════════════════════════════════════════
   e_detect.js — mesin keadaan, get rep, dan penghakiman bentuk.

   PRINSIP TERAS, dan ia bertentangan dengan cara AI Trainer lama bekerja:

       MENGESAN rep dan MENGHAKIMI rep ialah dua kerja berasingan.

   Dalam enjin lama, satu squat yang berhenti di atas paralel tidak pernah
   memasuki fasa 'down', jadi ia tidak dikira LANGSUNG. Atlet melihat kaunter
   kekal pada 4 sedangkan mereka baru sahaja bergerak — tiada maklum balas,
   tiada sebab, hanya app yang kelihatan rosak. Itu bertentangan sepenuhnya
   dengan tujuan alat ini.

   Di sini setiap kitaran yang selesai menghasilkan rekod. Rekod itu membawa
   satu KEPUTUSAN — valid, grey (di sempadan), atau norep — dan SEBAB yang
   boleh diucapkan kepada atlet. Kaunter menunjukkan rep sah berbanding
   sasaran, tetapi tiada usaha yang hilang senyap.

   Kitaran dibuka dengan MURAH HATI dan disahkan dengan KETAT. Membuka pada
   satu ambang sahaja pernah menghasilkan 8 rep dalam 4 saat daripada atlet
   yang berdiri diam, kerana anggaran lutut bergoyang ~15 darjah pada figura
   jauh dan setiap goyangan melintasi garisan. Jadi kitaran yang selesai mesti
   melepasi ketiga-tiga get — tempoh, perjalanan, bengkokan — sebelum ia wujud
   sebagai rep langsung.
   ═══════════════════════════════════════════════════════════════════════ */

TR.STEP = {};

TR.Detector = {};

TR.Detector.create = function (key) {
  var def = TR.EX[key];
  if (!def) throw new Error('unknown exercise: ' + key);

  var d = {
    key: key, def: def,
    state: def.states[0],
    n: 0, valid: 0, grey: 0, norep: 0,
    lastRepAt: 0, lastCueAt: 0, lastCueText: '',
    extKnee: null, extElbow: null,
    cyc: null,                 // kitaran yang sedang berjalan
    flags: { l: false, r: false }, legs: { l: null, r: null },
    hipHist: [],               // untuk mengesan lompatan
    holdMs: 0, holdFrom: 0,    // pergerakan tahan-masa
    burpee: { sawPlank: false, sawReach: false },
    lost: 0
  };

  d.cool = function () { return def.cooldownMs || TR.CFG.cooldownMs; };

  /* GARIS DASAR ANGGOTA TERBUKA.

     Get `minBend` bertanya "adakah sendi ini benar-benar membengkok?", dan
     jawapan itu memerlukan titik permulaan. Versi pertama merakamnya pada
     saat kitaran DIBUKA — tetapi kitaran dibuka kerana sendi sudah pun
     membengkok melepasi ambang, jadi bengkokan yang diukur bermula dari
     ambang itu dan bukan dari lengan lurus atlet. Pushup penuh 175→100
     dilaporkan sebagai bengkokan 30 darjah dan gagal getnya sendiri.

     Sebaliknya, pelajari kedudukan terbuka semasa mereka BEREHAT: naik pantas
     ke maksimum baharu, hanyut turun perlahan. Tidak semua orang mengunci
     lutut pada 180, dan sesiapa yang tidak tidak patut dihukum untuknya. */
  d.baseline = function (m) {
    if (m.kneeAngle != null)
      d.extKnee = (d.extKnee == null) ? m.kneeAngle
                : Math.max(d.extKnee * 0.97 + m.kneeAngle * 0.03, m.kneeAngle);
    if (m.elbowAngle != null)
      d.extElbow = (d.extElbow == null) ? m.elbowAngle
                 : Math.max(d.extElbow * 0.97 + m.elbowAngle * 0.03, m.elbowAngle);
  };

  /* Isyarat teknik jarang dan tidak berulang. Seorang jurulatih yang menyebut
     "turun lagi" tiga kali sesaat bukan jurulatih, ia penggera. */
  d.cue = function (text) {
    var now = TR.now();
    if (!text) return null;
    if (text === d.lastCueText && now - d.lastCueAt < TR.CFG.voiceGapMs * 2) return null;
    if (now - d.lastCueAt < TR.CFG.voiceGapMs) return null;
    d.lastCueAt = now; d.lastCueText = text;
    return { t: 'cue', text: text };
  };

  d.go = function (to) {
    if (d.state === to) return null;
    var from = d.state; d.state = to;
    return { t: 'state', from: from, to: to };
  };

  /* ── Membuka kitaran ───────────────────────────────────────────────── */
  d.open = function (m, side) {
    d.cyc = {
      t0: TR.now(), tBottom: TR.now(), side: side || null,
      kneeStart: (d.extKnee != null ? d.extKnee : (TR.Calib.standKnee || 175)),
      elbowStart: (d.extElbow != null ? d.extElbow : 180),
      kneeMin: m.kneeAngle == null ? 180 : m.kneeAngle,
      elbowMin: m.elbowAngle == null ? 180 : m.elbowAngle,
      dropMax: m.hipDropU == null ? 0 : m.hipDropU,
      liftMax: m.kneeLiftU == null ? -9 : m.kneeLiftU,
      spreadMax: m.spreadU == null ? 0 : m.spreadU,
      hipKneeMax: m.hipKneeU == null ? -9 : m.hipKneeU,
      leanMax: m.lean == null ? 0 : m.lean,
      symMax: m.kneeSym == null ? 0 : m.kneeSym,
      sagMax: 0, levelMin: 9,
      tapMin: 9, shiftMax: 0, footMax: 0,
      hipY: []
    };
    return d.go(def.states[1]);
  };

  /* ── Mengumpul semasa kitaran berjalan ─────────────────────────────── */
  d.track = function (m) {
    var c = d.cyc; if (!c) return;
    var now = TR.now();
    if (m.kneeAngle  != null && m.kneeAngle  < c.kneeMin)  { c.kneeMin  = m.kneeAngle; c.tBottom = now; }
    if (m.elbowAngle != null && m.elbowAngle < c.elbowMin) { c.elbowMin = m.elbowAngle; c.tBottom = now; }
    if (m.hipDropU   != null && m.hipDropU   > c.dropMax)  { c.dropMax  = m.hipDropU;  c.tBottom = now; }
    if (m.kneeLiftU  != null && m.kneeLiftU  > c.liftMax)  c.liftMax  = m.kneeLiftU;
    if (m.hipKneeU   != null && m.hipKneeU   > c.hipKneeMax) { c.hipKneeMax = m.hipKneeU; c.tBottom = now; }
    if (m.spreadU    != null && m.spreadU    > c.spreadMax) c.spreadMax = m.spreadU;
    if (m.lean       != null && m.lean       > c.leanMax)  c.leanMax  = m.lean;
    if (m.kneeSym    != null && m.kneeSym    > c.symMax)   c.symMax   = m.kneeSym;
    if (m.shHipU     != null && m.shHipU     < c.levelMin) c.levelMin = m.shHipU;
    if (m.footSpreadU!= null && m.footSpreadU> c.footMax)  c.footMax  = m.footSpreadU;
    var tapNow = Math.min(m.tapLU == null ? 9 : m.tapLU, m.tapRU == null ? 9 : m.tapRU);
    if (tapNow < c.tapMin) { c.tapMin = tapNow; c.tBottom = now; }
    if (m.hip) { c.hipY.push(m.hip.y); if (c.hipY.length > 10) c.hipY.shift(); }
  };

  /* ── Menutup kitaran: get dahulu, penghakiman kemudian ─────────────────
     Pulangan:
       null            bukan rep — bunyi bising, dibuang dengan senyap
       {t:'rep', rep}  rep wujud; rep.verdict memberitahu ia sah atau tidak
     Kitaran yang gagal get TIDAK menjadi 'norep' yang kelihatan, kerana ia
     bukan percubaan — ia goyangan model. Yang kelihatan hanyalah percubaan
     sebenar yang tidak memenuhi piawaian. */
  d.close = function (m, judgeFn) {
    var c = d.cyc; if (!c) return null;
    d.cyc = null;
    var now = TR.now(), ms = now - c.t0;
    var g = def.gate || {};

    if (ms < Math.max(TR.CFG.minRepMs, g.minMs || 0)) return null;
    if (ms > TR.CFG.maxRepMs) return null;
    if ((g.minDrop || 0) > 0 && c.dropMax < g.minDrop) return null;
    if ((g.minBend || 0) > 0) {
      var bendK = (c.kneeStart  != null && c.kneeMin  != null) ? (c.kneeStart  - c.kneeMin)  : 0;
      var bendE = (c.elbowStart != null && c.elbowMin != null) ? (c.elbowStart - c.elbowMin) : 0;
      if (Math.max(bendK, bendE) < g.minBend) return null;
    }
    if (now - d.lastRepAt < d.cool()) return null;
    d.lastRepAt = now;

    var v = judgeFn(c, m);           // {verdict, reason, cue}
    var rep = {
      n: ++d.n, verdict: v.verdict, reason: v.reason || '',
      ms: ms, ecc: (c.tBottom - c.t0) / 1000, con: (now - c.tBottom) / 1000,
      kneeMin: c.kneeMin < 180 ? Math.round(c.kneeMin) : null,
      elbowMin: c.elbowMin < 180 ? Math.round(c.elbowMin) : null,
      drop: c.dropMax, lift: c.liftMax, spread: c.spreadMax,
      tap: c.tapMin < 9 ? c.tapMin : null, shift: c.shiftMax || null,
      footSpread: c.footMax || null,
      hipKnee: c.hipKneeMax > -9 ? c.hipKneeMax : null,
      lean: c.leanMax != null ? Math.round(c.leanMax) : null,
      sym: c.symMax ? Math.round(c.symMax) : null,
      side: c.side, score: v.score == null ? 0 : v.score
    };
    if (v.verdict === 'valid') d.valid++;
    else if (v.verdict === 'grey') d.grey++;
    else d.norep++;
    return { t: 'rep', rep: rep, cue: v.cue || '' };
  };

  /* ── Masukan sebingkai ─────────────────────────────────────────────── */
  d.feed = function (j) {
    if (!j) {
      d.lost++;
      if (d.lost > TR.CFG.lostFrameReset && d.cyc) { d.cyc = null; d.state = def.states[0]; }
      if (d.lost === TR.CFG.lostFrameWarn) return [{ t: 'lost', text: 'Step back into frame' }];
      return [];
    }
    d.lost = 0;

    if (!TR.needsMet(def, j)) {
      return [{ t: 'lost', text: def.view === 'side' ? 'Turn side-on to the camera' : 'Show your full body' }];
    }
    if (!TR.Calib.ready) {
      var okc = TR.Calib.feed(j);
      return [{ t: 'calib', done: okc, text: TR.Calib.msg }];
    }

    var m = TR.measure(j);
    if (d.state === def.states[0]) d.baseline(m);
    var out = TR.STEP[key](d, m) || [];
    if (!out.length && out.t) out = [out];
    /* d.cue() dan d.go() memulangkan null apabila mereka menahan diri (isyarat
       berulang, keadaan tidak berubah). Menapis di SATU tempat bermakna setiap
       detektor boleh menolak hasilnya tanpa memeriksa dahulu. */
    var clean = [], i;
    for (i = 0; i < out.length; i++) if (out[i]) clean.push(out[i]);
    return clean;
  };

  d.reset = function () {
    d.state = def.states[0]; d.n = 0; d.valid = 0; d.grey = 0; d.norep = 0;
    d.cyc = null; d.lastRepAt = 0; d.lastCueAt = 0; d.lastCueText = '';
    d.extKnee = null; d.extElbow = null;
    d.flags = { l: false, r: false }; d.legs = { l: null, r: null };
    d.holdMs = 0; d.holdFrom = 0; d.lastTick = 0;
    d.burpee = { sawPlank: false, sawReach: false }; d.lost = 0;
  };

  return d;
};

/* ── Pembantu dikongsi ─────────────────────────────────────────────────── */

/* Jarak pinggul dari garis lurus bahu→buku lali, dalam unit torso.
   Inilah "sag" dalam pushup dan plank: badan yang lurus meletakkan pinggul
   pada garis itu, pinggul yang jatuh atau terjungkit menyimpang darinya. */
TR.sag = function (m) {
  var sh = m.sh, hip = m.hip, ank = m.ank;
  if (!sh || !hip || !ank) return null;
  var vx = ank.x - sh.x, vy = ank.y - sh.y;
  var len = Math.sqrt(vx * vx + vy * vy);
  if (len < 0.01) return null;
  var cross = Math.abs((hip.x - sh.x) * vy - (hip.y - sh.y) * vx) / len;
  return cross / m.torso;
};

/* Skor rep 0–100 daripada satu ukuran berbanding sasarannya. Digunakan supaya
   setiap pergerakan melaporkan pada skala yang sama dan kad keputusan tidak
   perlu tahu senaman mana yang dilakukan. */
TR.scoreFrom = function (val, full, none) {
  if (val == null) return 0;
  var t = (val - none) / (full - none);
  return Math.max(0, Math.min(100, Math.round(t * 100)));
};

/* ═══════════════════════════════════════════════════════════════════════
   PERGERAKAN
   Setiap satu ialah satu fungsi. Ia membaca `m` dan config, tidak menyentuh
   DOM, tidak bercakap, tidak menyimpan apa-apa. Itu yang membuatkan
   pergerakan yang sama boleh dipakai oleh ujian, workout dan analisis.
   ═══════════════════════════════════════════════════════════════════════ */

/* HISTERESIS: buka atas MANA-MANA isyarat, tutup hanya apabila SETIAP isyarat
   yang tersedia kembali berehat.

   Versi pertama memakai OR pada kedua-dua hujung, dan ia rosak dengan cara
   yang hanya kelihatan pada jarak bingkai tertentu. Squat membuka pada
   pinggul-jatuh 0.22 torso semasa lutut masih 170 darjah hampir lurus; satu
   bingkai kemudian lutut melepasi ambang tutup 162 darjah — sudut yang tidak
   pernah membuka kitaran itu — dan menutupnya. Kitaran 45ms itu kemudian
   gagal get tempohnya dan dibuang dengan senyap, jadi atlet melakukan squat
   penuh dan kaunter kekal pada sifar.

   Ujian meja terlepas ini kerana jarak bingkainya kebetulan melangkau tetingkap
   yang rosak. Peraturan yang betul ialah: mana-mana isyarat boleh membukanya,
   tetapi setiap isyarat mesti bersetuju sebelum ia ditutup. Isyarat yang tiada
   (buku lali terlindung, jadi tiada sudut) diabaikan dan bukan dianggap
   berehat — jika tidak satu sendi yang hilang menutup setiap kitaran. */
TR.restingAll = function (m, closeCfg) {
  var any = false, all = true;
  if (closeCfg.kneeAngle != null && m.kneeAngle != null) {
    any = true; if (!(m.kneeAngle > closeCfg.kneeAngle)) all = false;
  }
  if (closeCfg.hipRise != null && m.hipDropU != null) {
    any = true; if (!(m.hipDropU < closeCfg.hipRise)) all = false;
  }
  return any && all;
};

/* Kedalaman squat, sekali sahaja, dipakai oleh squat DAN jump squat.

   Ukuran utama ialah pinggul berbanding lutut. Sudut lutut hanya digunakan
   apabila buku lali tidak kelihatan — kejadian biasa dari tepi apabila kaki
   belakang menutup kaki depan — kerana sudut memerlukan tiga sendi sedangkan
   pinggul-berbanding-lutut hanya memerlukan dua. Alat yang senyap kerana satu
   buku lali hilang ialah alat yang atlet berhenti percaya. */
TR.judgeSquat = function (cy, def, jd) {
  var byHip = (cy.hipKneeMax != null && cy.hipKneeMax > -9);
  if (byHip) {
    if (cy.hipKneeMax >= jd.hipBelowKnee)
      return { verdict: 'valid', score: TR.scoreFrom(cy.hipKneeMax, jd.hipBelowKnee + 0.10, jd.greyBelow) };
    if (cy.hipKneeMax >= jd.greyBelow)
      return { verdict: 'grey', reason: 'shallow', cue: def.cue.shallow,
               score: TR.scoreFrom(cy.hipKneeMax, jd.hipBelowKnee, jd.greyBelow) };
    return { verdict: 'norep', reason: 'shallow', cue: def.cue.shallow, score: 0 };
  }
  if (cy.kneeMin <= jd.deepAngle)
    return { verdict: 'valid', score: TR.scoreFrom(cy.kneeMin, jd.deepAngle - 15, jd.greyAngle) };
  if (cy.kneeMin <= jd.greyAngle)
    return { verdict: 'grey', reason: 'shallow', cue: def.cue.shallow,
             score: TR.scoreFrom(cy.kneeMin, jd.deepAngle, jd.greyAngle) };
  return { verdict: 'norep', reason: 'shallow', cue: def.cue.shallow, score: 0 };
};

TR.STEP.squat = function (d, m) {
  var def = d.def, o = def.open, c = def.close, jd = def.judge, ev = [];
  if (d.state === 'STANDING') {
    var byAngle = (m.kneeAngle != null && m.kneeAngle < o.kneeAngle);
    var byDrop  = (m.hipDropU  != null && m.hipDropU  > o.hipDrop);
    if (byAngle || byDrop) { ev.push(d.open(m)); }
  } else {
    d.track(m);
    if (TR.restingAll(m, c)) {
      d.state = 'STANDING';
      var r = d.close(m, function (cy) { return TR.judgeSquat(cy, def, jd); });
      if (r) {
        ev.push(r);
        if (r.rep.lean != null && r.rep.lean > def.form.leanMax) ev.push(d.cue(def.cue.lean));
        else if (r.rep.sym != null && r.rep.sym > def.form.symMax) ev.push(d.cue(def.cue.sym));
      }
    }
  }
  return ev;
};

TR.STEP.pushup = function (d, m) {
  var def = d.def, o = def.open, c = def.close, jd = def.judge, ev = [];
  if (d.state === 'UP') {
    if (m.elbowAngle != null && m.elbowAngle < o.elbowAngle) ev.push(d.open(m));
  } else {
    d.track(m);
    var s = TR.sag(m); if (s != null && s > d.cyc.sagMax) d.cyc.sagMax = s;
    if (m.elbowAngle != null && m.elbowAngle > c.elbowAngle) {
      d.state = 'UP';
      var sagMax = d.cyc ? d.cyc.sagMax : 0;
      var r = d.close(m, function (cy) {
        if (cy.elbowMin <= jd.deepAngle)
          return { verdict: 'valid', score: TR.scoreFrom(cy.elbowMin, jd.deepAngle - 15, jd.greyAngle) };
        if (cy.elbowMin <= jd.greyAngle)
          return { verdict: 'grey', reason: 'shallow', cue: def.cue.shallow,
                   score: TR.scoreFrom(cy.elbowMin, jd.deepAngle, jd.greyAngle) };
        return { verdict: 'norep', reason: 'shallow', cue: def.cue.shallow, score: 0 };
      });
      if (r) {
        r.rep.sag = sagMax;
        ev.push(r);
        if (sagMax > def.form.sagMax) ev.push(d.cue(def.cue.sag));
        else if (m.elbowSym != null && m.elbowSym > def.form.symMax) ev.push(d.cue(def.cue.sym));
      }
    }
  }
  return ev;
};

TR.STEP.lunge = function (d, m) {
  var def = d.def, o = def.open, c = def.close, jd = def.judge, ev = [];
  var lo = (m.lKnee != null && m.lKnee < o.kneeAngle);
  var ro = (m.rKnee != null && m.rKnee < o.kneeAngle);
  if (d.state === 'STANDING') {
    if (lo || ro) {
      /* Sisi ialah kaki yang membengkok LEBIH — itulah lutut belakang yang
         jatuh, dan itu yang atlet fikir mereka sedang lakukan. */
      var side = (m.lKnee != null && m.rKnee != null) ? (m.lKnee < m.rKnee ? 'l' : 'r') : (lo ? 'l' : 'r');
      ev.push(d.open(m, side));
    }
  } else {
    d.track(m);
    if (m.kneeAngle != null && m.kneeAngle > c.kneeAngle) {
      d.state = 'STANDING';
      var r = d.close(m, function (cy) {
        if (cy.kneeMin <= jd.deepAngle)
          return { verdict: 'valid', score: TR.scoreFrom(cy.kneeMin, jd.deepAngle - 15, jd.greyAngle) };
        if (cy.kneeMin <= jd.greyAngle)
          return { verdict: 'grey', reason: 'shallow', cue: def.cue.shallow,
                   score: TR.scoreFrom(cy.kneeMin, jd.deepAngle, jd.greyAngle) };
        return { verdict: 'norep', reason: 'shallow', cue: def.cue.shallow, score: 0 };
      });
      if (r) {
        ev.push(r);
        if (r.rep.lean != null && r.rep.lean > def.form.leanMax) ev.push(d.cue(def.cue.lean));
      }
    }
  }
  return ev;
};

TR.STEP.jumpjack = function (d, m) {
  var def = d.def, o = def.open, c = def.close, jd = def.judge, ev = [];
  if (d.state === 'CLOSED') {
    var up = (m.wristShU != null && m.wristShU > o.wristAboveShoulder) &&
             (m.spreadU  != null && m.spreadU  > o.armSpread);
    if (up) ev.push(d.open(m));
  } else {
    d.track(m);
    if (m.wristHipU != null && m.wristHipU < c.wristBelowHip) {
      d.state = 'CLOSED';
      var r = d.close(m, function (cy) {
        if (cy.spreadMax >= jd.fullSpread)
          return { verdict: 'valid', score: TR.scoreFrom(cy.spreadMax, jd.fullSpread, 0.6) };
        return { verdict: 'grey', reason: 'narrow', cue: def.cue.shallow,
                 score: TR.scoreFrom(cy.spreadMax, jd.fullSpread, 0.6) };
      });
      if (r) ev.push(r);
    }
  }
  return ev;
};

/* Berselang-seli: kiri dan kanan ialah rep berasingan dengan bendera
   berasingan, jadi satu kaki yang tersangkut di udara tidak menghalang kaki
   yang satu lagi daripada dikira. */
TR.STEP.highknee = function (d, m) {
  var def = d.def, o = def.open, c = def.close, jd = def.judge, ev = [];
  var sides = [['l', m.kneeLiftLU], ['r', m.kneeLiftRU]];
  if (!d.legs) d.legs = { l: null, r: null };

  for (var i = 0; i < sides.length; i++) {
    var k = sides[i][0], lift = sides[i][1];
    if (lift == null) continue;
    var cyc = d.legs[k];

    if (!cyc && lift > o.kneeLift) {
      /* Setiap kaki membawa kitarannya sendiri. Berkongsi satu bermakna kaki
         kanan yang naik semasa kaki kiri masih di udara akan menulis ganti
         kitaran kiri, dan salah satu rep hilang pada setiap langkah. */
      d.legs[k] = { t0: TR.now(), tBottom: TR.now(), side: k,
                    kneeMin: 180, elbowMin: 180, kneeStart: 180, elbowStart: 180,
                    dropMax: 0, liftMax: lift, spreadMax: 0,
                    leanMax: m.lean || 0, symMax: 0, sagMax: 0, levelMin: 9, hipY: [] };
      continue;
    }
    if (!cyc) continue;
    if (lift > cyc.liftMax) { cyc.liftMax = lift; cyc.tBottom = TR.now(); }

    if (lift < c.kneeLift) {
      d.legs[k] = null;
      d.cyc = cyc;                        // d.close() menilai kitaran semasa
      var r = d.close(m, function (cy) {
        if (cy.liftMax >= jd.fullLift)
          return { verdict: 'valid', score: TR.scoreFrom(cy.liftMax, jd.fullLift, jd.greyLift) };
        if (cy.liftMax >= jd.greyLift)
          return { verdict: 'grey', reason: 'low', cue: def.cue.shallow,
                   score: TR.scoreFrom(cy.liftMax, jd.fullLift, jd.greyLift) };
        return { verdict: 'norep', reason: 'low', cue: def.cue.shallow, score: 0 };
      });
      if (r) ev.push(r);
    }
  }
  return ev;
};

TR.STEP.jumpsquat = function (d, m) {
  var def = d.def, o = def.open, c = def.close, jd = def.judge, ev = [];
  if (d.state === 'STANDING') {
    var byAngle = (m.kneeAngle != null && m.kneeAngle < o.kneeAngle);
    var byDrop  = (m.hipDropU  != null && m.hipDropU  > o.hipDrop);
    if (byAngle || byDrop) ev.push(d.open(m));
  } else {
    d.track(m);
    if (TR.restingAll(m, c)) {
      d.state = 'STANDING';
      /* Kelajuan naik pinggul merentas bingkai terakhir = adakah mereka
         benar-benar meninggalkan lantai, atau hanya berdiri semula. */
      var hy = d.cyc ? d.cyc.hipY : [];
      var rise = hy.length >= 4 ? (hy[hy.length - 4] - hy[hy.length - 1]) / m.torso : 0;
      var r = d.close(m, function (cy) {
        var deep = TR.judgeSquat(cy, def, jd).verdict === 'valid';
        var flew = rise >= jd.minAirRise;
        if (deep && flew) return { verdict: 'valid', score: TR.scoreFrom(cy.kneeMin, jd.deepAngle - 15, jd.greyAngle) };
        if (!flew) return { verdict: 'grey', reason: 'no-jump', cue: def.cue.air,
                            score: Math.round(TR.judgeSquat(cy, def, jd).score * 0.6) };
        var js = TR.judgeSquat(cy, def, jd);
        return { verdict: js.verdict === 'valid' ? 'grey' : js.verdict,
                 reason: 'shallow', cue: def.cue.shallow, score: js.score };
      });
      if (r) { r.rep.rise = rise; ev.push(r); }
    }
  }
  return ev;
};

/* Burpee memakai garis dasar pinggul daripada kalibrasi, jadi ia tidak lagi
   memerlukan 20 bingkai kalibrasinya sendiri seperti dalam HitFatMON — satu
   kalibrasi melayani semua pergerakan. */
TR.STEP.burpee = function (d, m) {
  var def = d.def, o = def.open, c = def.close, jd = def.judge, ev = [];
  if (m.hipDropU == null) return ev;

  if (d.state === 'STANDING') {
    if (m.hipDropU > o.hipDrop) {
      d.burpee = { sawPlank: false, sawReach: false };
      ev.push(d.open(m)); d.state = 'CROUCH';
    }
  } else {
    d.track(m);
    if (!d.burpee.sawPlank && m.shHipU != null && m.shHipU < jd.plankLevel) {
      d.burpee.sawPlank = true; ev.push(d.go('PLANK'));
    }
    if (!d.burpee.sawReach && m.wristShU != null && m.wristShU > jd.reachGap) d.burpee.sawReach = true;

    if (m.hipDropU < c.hipRise) {
      d.state = 'STANDING';
      var sawPlank = d.burpee.sawPlank, sawReach = d.burpee.sawReach;
      var r = d.close(m, function (cy) {
        if (!sawPlank) return { verdict: 'norep', reason: 'no-plank', cue: def.cue.plank, score: 0 };
        if (jd.requireReach && !sawReach)
          return { verdict: 'grey', reason: 'no-reach', cue: def.cue.stand, score: 60 };
        return { verdict: 'valid', score: TR.scoreFrom(cy.dropMax, 0.9, 0.5) };
      });
      if (r) ev.push(r);
    } else if (!d.burpee.sawPlank) {
      var cu = d.cue(def.cue.plank); if (cu) ev.push(cu);
    }
  }
  return ev;
};

/* Tahan masa, bukan rep. Kaunter melaporkan saat. */
TR.STEP.plank = function (d, m) {
  var def = d.def, jd = def.judge, ev = [];
  var level = m.shHipU, wristLow = (m.wristShU != null && m.wristShU < jd.wristBelow);
  var flat = (level != null && level < jd.level);
  var s = TR.sag(m);
  var now = TR.now();

  if (flat && wristLow) {
    if (d.state !== 'HOLD') { d.state = 'HOLD'; d.holdFrom = now; ev.push({ t: 'state', to: 'HOLD' }); }
    d.holdMs += (now - (d.lastTick || now));
    d.lastTick = now;
    if (s != null && s > def.form.sagMax) {
      var which = (m.hip && m.sh && m.ank && m.hip.y > (m.sh.y + m.ank.y) / 2) ? def.cue.sag : def.cue.pike;
      var cu = d.cue(which); if (cu) ev.push(cu);
    }
    ev.push({ t: 'hold', ms: d.holdMs, sag: s });
  } else {
    d.lastTick = now;
    if (d.state === 'HOLD') { d.state = 'OUT'; ev.push({ t: 'state', to: 'OUT' }); }
    var c2 = d.cue(def.cue.out); if (c2) ev.push(c2);
    ev.push({ t: 'hold', ms: d.holdMs, sag: s, broken: true });
  }
  return ev;
};


/* ═══════════════════════════════════════════════════════════════════════
   LAPAN PERGERAKAN YANG DIPORT DARIPADA AI TRAINER LAMA

   Setiap satu ditulis semula pada seni bina yang sama seperti lapan yang
   pertama: buka murah hati, tutup apabila setiap isyarat berehat, lulus get
   amplitud, kemudian dihakimi dengan sebab. Tiada satu pun daripadanya
   memulangkan awal apabila borang buruk — itu perkara paling merosakkan yang
   dilakukan enjin lama, kerana ia bermakna rep yang buruk tidak pernah
   dikira DAN tidak pernah dilaporkan, jadi atlet hanya melihat kaunter yang
   diam dan tiada sebab.
   ═══════════════════════════════════════════════════════════════════════ */

/* Pergerakan sisi-ke-sisi berkongsi satu bentuk: pinggul mengembara keluar
   dari pusat, mendarat, kembali. Setiap perjalanan keluar ialah satu rep.
   Pusat itu dipelajari dan HANYUT — atlet merentasi bilik semasa mereka
   melakukannya, dan pusat tetap akan berhenti mengira selepas empat hop. */
TR.lateral = function (d, m, requireLow) {
  var def = d.def, o = def.open, c = def.close, jd = def.judge, ev = [];
  if (m.hipX == null) return ev;
  if (d.centreX == null) { d.centreX = m.hipX; return ev; }

  var u = (m.hipX - d.centreX) / m.torso;
  var away = Math.abs(u);

  if (d.state === def.states[0]) {
    d.centreX = d.centreX * 0.93 + m.hipX * 0.07;      // hanyut hanya semasa di tengah
    var lowOk = !requireLow || (m.hipDropU != null && m.hipDropU > o.minDrop);
    if (away > o.shift) {
      if (!lowOk) { var cu = d.cue(def.cue.high); if (cu) ev.push(cu); return ev; }
      ev.push(d.open(m, u > 0 ? 'r' : 'l'));
      d.cyc.shiftMax = away;
    }
  } else {
    d.track(m);
    if (away > d.cyc.shiftMax) d.cyc.shiftMax = away;
    if (away < c.shift) {
      d.state = def.states[0];
      var r = d.close(m, function (cy) {
        if (cy.shiftMax >= jd.fullShift)
          return { verdict: 'valid', score: TR.scoreFrom(cy.shiftMax, jd.fullShift, jd.greyShift) };
        if (cy.shiftMax >= jd.greyShift)
          return { verdict: 'grey', reason: 'short', cue: def.cue.shallow,
                   score: TR.scoreFrom(cy.shiftMax, jd.fullShift, jd.greyShift) };
        return { verdict: 'norep', reason: 'short', cue: def.cue.shallow, score: 0 };
      });
      if (r) ev.push(r);
    }
  }
  return ev;
};

TR.STEP.sumosquat = function (d, m) {
  var def = d.def, o = def.open, c = def.close, jd = def.judge, ev = [];
  if (d.state === 'STANDING') {
    var byAngle = (m.kneeAngle != null && m.kneeAngle < o.kneeAngle);
    var byDrop  = (m.hipDropU  != null && m.hipDropU  > o.hipDrop);
    if (byAngle || byDrop) ev.push(d.open(m));
  } else {
    d.track(m);
    if (TR.restingAll(m, c)) {
      d.state = 'STANDING';
      var r = d.close(m, function (cy) {
        var base = TR.judgeSquat(cy, def, jd);
        /* Kaki rapat menjadikannya squat biasa, bukan sumo. Ia masih dikira
           sebagai percubaan — cuma bukan pergerakan yang diminta. */
        if (base.verdict === 'valid' && cy.footMax && cy.footMax < jd.wideStance)
          return { verdict: 'grey', reason: 'narrow', cue: def.cue.narrow, score: Math.round(base.score * 0.7) };
        return base;
      });
      if (r) {
        ev.push(r);
        if (r.rep.sym != null && r.rep.sym > def.form.symMax) ev.push(d.cue(def.cue.sym));
      }
    }
  }
  return ev;
};

/* Tahan masa. Ambang kedalaman yang sama seperti squat, jadi "cukup rendah"
   bermakna perkara yang sama sama ada kau mengira atau menahan. */
TR.STEP.squathold = function (d, m) {
  var def = d.def, jd = def.judge, ev = [], now = TR.now();
  var deep = (m.hipKneeU != null && m.hipKneeU >= jd.hipBelowKnee) ||
             (m.hipKneeU == null && m.kneeAngle != null && m.kneeAngle < jd.kneeAngle);
  if (deep) {
    if (d.state !== 'HOLD') { d.state = 'HOLD'; ev.push({ t: 'state', to: 'HOLD' }); }
    d.holdMs += (now - (d.lastTick || now));
    d.lastTick = now;
    if (m.lean != null && m.lean > def.form.leanMax) { var cu = d.cue(def.cue.lean); if (cu) ev.push(cu); }
    ev.push({ t: 'hold', ms: d.holdMs });
  } else {
    d.lastTick = now;
    if (d.state === 'HOLD') { d.state = 'OUT'; ev.push({ t: 'state', to: 'OUT' }); }
    var c2 = d.cue(def.cue.out); if (c2) ev.push(c2);
    ev.push({ t: 'hold', ms: d.holdMs, broken: true });
  }
  return ev;
};

TR.STEP.squatjack = function (d, m) {
  var def = d.def, o = def.open, c = def.close, jd = def.judge, ev = [];
  if (d.state === 'UP') {
    /* Kedua-duanya diperlukan di sini, bukan salah satu: squat dengan kaki
       rapat ialah squat, dan melompat kaki melebar sambil berdiri tegak ialah
       jumping jack. Pergerakan ini ialah kedua-duanya sekali. */
    var low  = (m.hipDropU != null && m.hipDropU > o.hipDrop);
    var wide = (m.footSpreadU != null && m.footSpreadU > o.footSpread);
    if (low && wide) ev.push(d.open(m));
  } else {
    d.track(m);
    if (m.hipDropU != null && m.hipDropU < c.hipRise) {
      d.state = 'UP';
      var r = d.close(m, function (cy) {
        if (cy.hipKneeMax > -9 && cy.hipKneeMax >= jd.hipBelowKnee)
          return { verdict: 'valid', score: TR.scoreFrom(cy.hipKneeMax, jd.hipBelowKnee + 0.10, jd.greyBelow) };
        if (cy.hipKneeMax > -9 && cy.hipKneeMax >= jd.greyBelow)
          return { verdict: 'grey', reason: 'shallow', cue: def.cue.shallow,
                   score: TR.scoreFrom(cy.hipKneeMax, jd.hipBelowKnee, jd.greyBelow) };
        return { verdict: 'grey', reason: 'shallow', cue: def.cue.shallow,
                 score: TR.scoreFrom(cy.dropMax, 0.55, 0.25) };
      });
      if (r) ev.push(r);
    }
  }
  return ev;
};

TR.STEP.squatside = function (d, m) { return TR.lateral(d, m, true); };
TR.STEP.sidehop   = function (d, m) { return TR.lateral(d, m, false); };

TR.STEP.tricepspushup = function (d, m) {
  var def = d.def, o = def.open, c = def.close, jd = def.judge, ev = [];
  if (d.state === 'UP') {
    if (m.elbowAngle != null && m.elbowAngle < o.elbowAngle) ev.push(d.open(m));
  } else {
    d.track(m);
    var sg = TR.sag(m); if (sg != null && sg > d.cyc.sagMax) d.cyc.sagMax = sg;
    if (m.elbowAngle != null && m.elbowAngle > c.elbowAngle) {
      d.state = 'UP';
      var sagMax = d.cyc ? d.cyc.sagMax : 0;
      var r = d.close(m, function (cy) {
        if (cy.elbowMin <= jd.deepAngle)
          return { verdict: 'valid', score: TR.scoreFrom(cy.elbowMin, jd.deepAngle - 15, jd.greyAngle) };
        if (cy.elbowMin <= jd.greyAngle)
          return { verdict: 'grey', reason: 'shallow', cue: def.cue.shallow,
                   score: TR.scoreFrom(cy.elbowMin, jd.deepAngle, jd.greyAngle) };
        return { verdict: 'norep', reason: 'shallow', cue: def.cue.shallow, score: 0 };
      });
      if (r) { r.rep.sag = sagMax; ev.push(r); if (sagMax > def.form.sagMax) ev.push(d.cue(def.cue.sag)); }
    }
  }
  return ev;
};

TR.STEP.pushuptap = function (d, m) {
  var def = d.def, o = def.open, c = def.close, jd = def.judge, ev = [];
  var near = Math.min(m.tapLU == null ? 9 : m.tapLU, m.tapRU == null ? 9 : m.tapRU);
  if (near > 8) return ev;
  if (d.state === 'PLANK') {
    if (near < o.tapDist) {
      var side = ((m.tapLU == null ? 9 : m.tapLU) <= (m.tapRU == null ? 9 : m.tapRU)) ? 'l' : 'r';
      ev.push(d.open(m, side));
      d.cyc.tapMin = near;
    }
  } else {
    d.track(m);
    var sg = TR.sag(m); if (sg != null && sg > d.cyc.sagMax) d.cyc.sagMax = sg;
    if (near > c.tapDist) {
      d.state = 'PLANK';
      var sagMax = d.cyc ? d.cyc.sagMax : 0;
      var r = d.close(m, function (cy) {
        /* Lebih kecil lebih baik di sini — ia jarak ke bahu. */
        if (cy.tapMin <= jd.fullTap)
          return { verdict: 'valid', score: TR.scoreFrom(cy.tapMin, jd.fullTap, jd.greyTap) };
        if (cy.tapMin <= jd.greyTap)
          return { verdict: 'grey', reason: 'short', cue: def.cue.shallow,
                   score: TR.scoreFrom(cy.tapMin, jd.fullTap, jd.greyTap) };
        return { verdict: 'norep', reason: 'short', cue: def.cue.shallow, score: 0 };
      });
      if (r) { r.rep.sag = sagMax; ev.push(r); if (sagMax > def.form.sagMax) ev.push(d.cue(def.cue.sag)); }
    }
  }
  return ev;
};

/* Static run ialah high knee pada irama berlari. Ia memakai kod yang SAMA —
   hanya ambang dalam config yang berbeza. Menyalin fungsi high knee dan
   menala salinan itu ialah cara AI Trainer lama berakhir dengan dua
   pengesan lutut yang tidak bersetuju antara satu sama lain. */
TR.STEP.staticrun = TR.STEP.highknee;
