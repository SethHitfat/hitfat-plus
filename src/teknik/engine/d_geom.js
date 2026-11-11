/* ═══════════════════════════════════════════════════════════════════════
   d_geom.js — geometri, kalibrasi, dan ukuran sebingkai.

   Detektor tidak mengira sudut sendiri. Mereka membaca objek `m` yang dibina
   sekali setiap bingkai di sini. Sebabnya praktikal: dalam AI Trainer lama
   fungsi ang() disalin ke dalam tiga tempat berbeza dan salah satu daripada
   salinan itu terlupa mengapit acos kepada [-1,1], jadi ia memulangkan NaN
   pada sendi yang lurus sempurna dan rep hilang tanpa sebab yang kelihatan.
   Satu salinan sahaja, dikira sekali, dibaca oleh semua.
   ═══════════════════════════════════════════════════════════════════════ */

TR.G = {

  vis: function (p) { return !!p && p.s >= TR.CFG.minScore; },

  /* Sudut dalam pada b, dalam darjah. Apitan itu bukan hiasan: ralat titik
     terapung membuatkan dot/mag menjadi 1.0000000002 pada anggota yang lurus,
     dan acos daripada itu ialah NaN. */
  ang: function (a, b, c) {
    if (!a || !b || !c) return null;
    var abx = a.x - b.x, aby = a.y - b.y, cbx = c.x - b.x, cby = c.y - b.y;
    var mag = Math.sqrt(abx * abx + aby * aby) * Math.sqrt(cbx * cbx + cby * cby);
    if (!mag) return null;
    var d = (abx * cbx + aby * cby) / mag;
    return Math.acos(Math.max(-1, Math.min(1, d))) * 180 / Math.PI;
  },

  mid: function (a, b) {
    if (!a && !b) return null;
    if (!a) return b; if (!b) return a;
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, s: Math.min(a.s, b.s) };
  },

  /* 0 darjah = batang tubuh tegak sempurna. */
  lean: function (hip, sh) {
    if (!hip || !sh) return null;
    return Math.abs(Math.atan2(sh.x - hip.x, -(sh.y - hip.y)) * 180 / Math.PI);
  },

  dist: function (a, b) {
    if (!a || !b) return null;
    return Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));
  },

  /* Sisi yang lebih dipercayai kamera. Squat dan lunge dilihat dari tepi,
     jadi satu sisi sentiasa separa terlindung; memaksa purata dua-dua sisi
     bermakna anggota yang terlindung menarik sudut ke arah karut. */
  bestSide: function (j) {
    var l = ((j.lhip ? j.lhip.s : 0) + (j.lknee ? j.lknee.s : 0)) / 2;
    var r = ((j.rhip ? j.rhip.s : 0) + (j.rknee ? j.rknee.s : 0)) / 2;
    return r > l
      ? { k: 'r', hip: j.rhip, knee: j.rknee, ank: j.rank, sh: j.rsh, wr: j.rwr, el: j.rel, foot: j.rfoot }
      : { k: 'l', hip: j.lhip, knee: j.lknee, ank: j.lank, sh: j.lsh, wr: j.lwr, el: j.lel, foot: j.lfoot };
  }
};

/* ═══════════════════════════════════════════════════════════════════════
   KALIBRASI

   Atlet berdiri tegak beberapa bingkai. Kita merakam torso mereka SEKALI dan
   membekukannya untuk set itu, lalu setiap ambang jarak dibahagi dengannya.

   Kenapa dibekukan dan bukan diukur setiap bingkai: dalam pushup dan plank
   badan mendatar, jadi jarak MENEGAK bahu→pinggul pada skrin hampir sifar.
   Membahagi dengan angka itu meletup — dan itulah sebabnya HitFatMON perlu
   mengapit skala torsonya kepada [0.6, 1.6]. Apitan itu menyembunyikan gejala.
   Mengukur sekali semasa berdiri membuang puncanya: torso berdiri ialah unit
   saiz badan yang sah untuk mana-mana kedudukan badan seterusnya.

   Ia juga memberi kita dua garis dasar percuma yang detektor perlukan:
   ketinggian pinggul semasa berdiri, dan sudut lutut semasa berdiri (bukan
   semua orang mengunci lutut pada 180).
   ═══════════════════════════════════════════════════════════════════════ */
TR.Calib = {
  frames: [], hips: [], knees: [],
  torso: null, standHipY: null, standKnee: null, ready: false, msg: '',

  reset: function () {
    this.frames = []; this.hips = []; this.knees = [];
    this.torso = null; this.standHipY = null; this.standKnee = null;
    this.ready = false; this.msg = '';
  },

  /* Pulangkan true bila kalibrasi selesai. */
  feed: function (j) {
    if (this.ready) return true;
    var G = TR.G;
    var sh = G.mid(j.lsh, j.rsh), hip = G.mid(j.lhip, j.rhip);
    if (!G.vis(j.lsh) && !G.vis(j.rsh)) { this.msg = 'Show your shoulders'; return false; }
    if (!G.vis(j.lhip) && !G.vis(j.rhip)) { this.msg = 'Show your hips'; return false; }

    var t = Math.abs(hip.y - sh.y);
    if (t < TR.CFG.calibUprightMin) { this.msg = 'Stand up straight'; this.frames = []; return false; }
    if (t < TR.CFG.torsoMin) { this.msg = 'Step closer to the camera'; return false; }
    if (t > TR.CFG.torsoMax) { this.msg = 'Step back — full body in frame'; return false; }

    this.frames.push(t);
    this.hips.push(hip.y);
    var s = G.bestSide(j);
    var ka = G.ang(s.hip, s.knee, s.ank);
    if (ka != null) this.knees.push(ka);

    this.msg = 'Hold still — ' + this.frames.length + '/' + TR.CFG.calibFrames;
    if (this.frames.length < TR.CFG.calibFrames) return false;

    /* Median, bukan purata: satu bingkai di mana model meletakkan pinggul pada
       bahu merosakkan purata sepenuhnya dan mendiamkan detektor untuk
       keseluruhan set. Median tidak peduli. */
    this.torso     = this.median(this.frames);
    this.standHipY = this.median(this.hips);
    this.standKnee = this.knees.length ? this.median(this.knees) : 175;
    this.ready = true; this.msg = '';
    return true;
  },

  median: function (a) {
    var b = a.slice().sort(function (x, y) { return x - y; });
    var n = b.length;
    if (!n) return 0;
    return n % 2 ? b[(n - 1) / 2] : (b[n / 2 - 1] + b[n / 2]) / 2;
  }
};

/* ═══════════════════════════════════════════════════════════════════════
   UKURAN SEBINGKAI

   Segala-galanya yang lebih daripada satu detektor perlukan, dikira sekali.
   Setiap medan berakhir dengan U ialah UNIT TORSO — bahagikan sekali di sini
   dan tiada detektor perlu ingat untuk melakukannya.
   ═══════════════════════════════════════════════════════════════════════ */
TR.measure = function (j) {
  var G = TR.G, C = TR.Calib;
  var T = C.torso || 0.25;

  var sh  = G.mid(j.lsh, j.rsh);
  var hip = G.mid(j.lhip, j.rhip);
  var kne = G.mid(j.lknee, j.rknee);
  var ank = G.mid(j.lank, j.rank);
  var wr  = G.mid(j.lwr, j.rwr);
  var s   = G.bestSide(j);

  var lKnee = G.ang(j.lhip, j.lknee, j.lank);
  var rKnee = G.ang(j.rhip, j.rknee, j.rank);
  var lElb  = G.ang(j.lsh, j.lel, j.lwr);
  var rElb  = G.ang(j.rsh, j.rel, j.rwr);

  var m = {
    j: j, side: s, sh: sh, hip: hip, knee: kne, ank: ank, wrist: wr,
    torso: T,

    kneeAngle: (lKnee != null && rKnee != null) ? Math.min(lKnee, rKnee)
             : (lKnee != null ? lKnee : rKnee),
    lKnee: lKnee, rKnee: rKnee,
    elbowAngle: (lElb != null && rElb != null) ? (lElb + rElb) / 2
              : (lElb != null ? lElb : rElb),
    lElb: lElb, rElb: rElb,
    hipAngle: G.ang(s.sh, s.hip, s.knee),
    lean: G.lean(hip, sh),

    /* Simetri: berapa banyak kedua-dua belah tidak bersetuju. Hanya bermakna
       apabila kedua-dua belah benar-benar kelihatan, jadi null bila tidak —
       melaporkan 0 akan berbohong bahawa atlet seimbang sempurna. */
    kneeSym: (lKnee != null && rKnee != null && G.vis(j.lknee) && G.vis(j.rknee))
             ? Math.abs(lKnee - rKnee) : null,
    elbowSym: (lElb != null && rElb != null && G.vis(j.lel) && G.vis(j.rel))
             ? Math.abs(lElb - rElb) : null,

    /* Semua di bawah dalam unit torso. y skrin bertambah ke BAWAH, jadi
       "jatuh" ialah positif. */
    hipDropU:  (hip && C.standHipY != null) ? (hip.y - C.standHipY) / T : null,
    kneeLiftU: null, kneeLiftLU: null, kneeLiftRU: null,
    shHipU:    (sh && hip) ? Math.abs(hip.y - sh.y) / T : null,
    wristShU:  (wr && sh)  ? (sh.y - wr.y) / T : null,     // positif = tangan atas bahu
    wristHipU: (wr && hip) ? (hip.y - wr.y) / T : null,
    spreadU:   (j.lwr && j.rwr) ? Math.abs(j.lwr.x - j.rwr.x) / T : null,
    footSpreadU: (j.lank && j.rank) ? Math.abs(j.lank.x - j.rank.x) / T : null,

    /* PINGGUL BERBANDING LUTUT — piawaian kedalaman sebenar.
       y skrin bertambah ke bawah, jadi positif bermakna pinggul berada DI
       BAWAH lutut, iaitu rumusan yang setiap rulebook squat pakai. Sudut
       lutut hanya berkorelasi dengannya: seseorang berpaha panjang boleh
       mencapai 95 darjah dan masih tinggi, dan seseorang berpaha pendek
       boleh berada jauh di bawah paralel pada 105. Menghakimi ukuran yang
       betul bermakna app dan pengadil bersetuju. */
    hipKneeU: (hip && kne) ? (hip.y - kne.y) / T : null,

    /* Pergelangan tangan ke bahu BERTENTANGAN — tepukan bahu. */
    tapLU: null, tapRU: null,
    /* Kedudukan pinggul mendatar, untuk pergerakan sisi-ke-sisi. */
    hipX: hip ? hip.x : null,

    visible: true, lostReason: ''
  };

  if (j.lwr && j.rsh) m.tapLU = G.dist(j.lwr, j.rsh) / T;
  if (j.rwr && j.lsh) m.tapRU = G.dist(j.rwr, j.lsh) / T;

  if (j.lknee && hip) m.kneeLiftLU = (hip.y - j.lknee.y) / T;
  if (j.rknee && hip) m.kneeLiftRU = (hip.y - j.rknee.y) / T;
  if (m.kneeLiftLU != null || m.kneeLiftRU != null)
    m.kneeLiftU = Math.max(m.kneeLiftLU == null ? -9 : m.kneeLiftLU,
                           m.kneeLiftRU == null ? -9 : m.kneeLiftRU);

  return m;
};

/* Adakah sendi yang pergerakan ini perlukan benar-benar kelihatan?
   `need` ialah array-dalam-array: mana-mana kumpulan dalam yang lengkap
   memadai, jadi "kiri ATAU kanan" ditulis sekali dalam config dan tidak
   pernah diulang dalam kod detektor. */
TR.needsMet = function (def, j) {
  var G = TR.G, i, k, group, allOk;
  for (i = 0; i < def.need.length; i++) {
    group = def.need[i]; allOk = true;
    for (k = 0; k < group.length; k++) {
      if (!G.vis(j[group[k]])) { allOk = false; break; }
    }
    if (allOk) return true;
  }
  return false;
};
