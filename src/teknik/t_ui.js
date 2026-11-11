/* ═══════════════════════════════════════════════════════════════════════
   t_ui.js — skrin Semak Teknik: Pilih → Tonton → Kamera → Keputusan.
   Satu kamera dipegang sepanjang satu percubaan dan dilepaskan di skrin
   keputusan; "Cuba lagi" ialah klik, jadi iOS benarkan getUserMedia semula.
   ═══════════════════════════════════════════════════════════════════════ */

TK.$ = function (id) { return document.getElementById(id); };
TK.esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
TK.st = { key: null, variant: 'lutut', reps: [], det: null, armed: false, busy: false, done: false, sound: true };

TK.show = function (id) {
  var s = ['home', 'move', 'cam', 'result'], i;
  for (i = 0; i < s.length; i++) TK.$('v-' + s[i]).hidden = (s[i] !== id);
  document.body.className = 'on-' + id;
  window.scrollTo(0, 0);
};

TK.vimeo = function (id) {
  return 'https://player.vimeo.com/video/' + id + '?background=1&autoplay=1&loop=1&muted=1&controls=0&autopause=0';
};

TK.when = function (t) {
  var d = new Date(t), now = new Date();
  var days = Math.floor((new Date(now.getFullYear(), now.getMonth(), now.getDate()) - new Date(d.getFullYear(), d.getMonth(), d.getDate())) / 864e5);
  var bl = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'];
  return days === 0 ? 'Hari ini' : days === 1 ? 'Semalam' : d.getDate() + ' ' + bl[d.getMonth()];
};

/* ── Home ─────────────────────────────────────────────────────────────── */
TK.home = function () {
  var h = '', i, k, ex, m, last;
  for (i = 0; i < TK.ORDER.length; i++) {
    k = TK.ORDER[i]; ex = TK.EX[k]; m = TK.memFor(k); last = m[m.length - 1];
    h += '<button class="mv" onclick="TK.open(\'' + k + '\')">' +
      '<span class="mv-n">0' + (i + 1) + '</span>' +
      '<span class="mv-t"><b>' + ex.nama + '</b><small>' + TK.esc(ex.sub) + '</small></span>' +
      (last ? '<span class="chip ' + last.level + '">' + last.good + '/' + last.n + ' cantik</span>'
            : '<span class="chip baru">Belum cuba</span>') +
      '<span class="mv-go">›</span></button>';
  }
  TK.$('mvList').innerHTML = h;
  TK.show('home');
};

/* ── Satu gerakan: video + kunci teknik + cara letak telefon + kemajuan ── */
TK.open = function (k) {
  var ex = TK.EX[k], i, h = '';
  TK.st.key = k;
  TK.$('mvTitle').textContent = ex.nama;
  TK.$('mvSub').textContent = ex.sub;
  var vid = (k === 'pushup' && TK.st.variant === 'biasa') ? ex.vidFull : ex.vid;
  TK.$('mvVid').innerHTML = '<iframe src="' + TK.vimeo(vid) + '" allow="autoplay; fullscreen; picture-in-picture" title="Video coach ' + ex.nama + '"></iframe>';
  for (i = 0; i < ex.kunci.length; i++) h += '<li><span>' + (i + 1) + '</span>' + TK.esc(ex.kunci[i]) + '</li>';
  TK.$('mvKunci').innerHTML = h;
  TK.$('mvVar').hidden = (k !== 'pushup');
  TK.paintVar();
  TK.paintProgress();
  TK.show('move');
};

TK.setVar = function (v) {
  if (TK.st.variant === v) return;
  TK.st.variant = v;
  TK.open('pushup');
};
TK.paintVar = function () {
  var b = TK.$('mvVar').getElementsByTagName('button'), i;
  for (i = 0; i < b.length; i++) b[i].className = (b[i].getAttribute('data-v') === TK.st.variant) ? 'on' : '';
};

TK.paintProgress = function () {
  var m = TK.memFor(TK.st.key), box = TK.$('mvProg'), h = '', i, e, f;
  if (!m.length) { box.innerHTML = '<p class="muted">Belum ada rekod. Lepas cuba kali pertama, kemajuan teknik anda akan keluar di sini.</p>'; return; }
  var best = 0; for (i = 0; i < m.length; i++) best = Math.max(best, m[i].n ? m[i].good / m[i].n : 0);
  var shown = m.slice(-5).reverse();
  for (i = 0; i < shown.length; i++) {
    e = shown[i]; f = e.focus && TK.ISU[e.focus] ? TK.ISU[e.focus].title : 'Teknik cantik';
    h += '<li><span class="pd">' + TK.when(e.t) + (e.v ? ' · ' + (e.v === 'lutut' ? 'lutut' : 'biasa') : '') + '</span>' +
         '<span class="pg ' + e.level + '">' + e.good + '/' + e.n + '</span>' +
         '<span class="pf">' + TK.esc(f) + '</span></li>';
  }
  box.innerHTML = '<p class="pr-h">Percubaan: <b>' + m.length + '</b> · Terbaik: <b>' + Math.round(best * 100) + '%</b> rep cantik</p><ul class="pl">' + h + '</ul>';
};

/* ── Kamera ───────────────────────────────────────────────────────────── */
TK.say = function (t) {
  if (!TK.st.sound || !t || !window.speechSynthesis) return;
  try {
    if (TK.voice === undefined) {
      var vs = speechSynthesis.getVoices() || [], i;
      TK.voice = null;
      for (i = 0; i < vs.length; i++) if (/^ms/i.test(vs[i].lang)) { TK.voice = vs[i]; break; }
      if (!TK.voice) for (i = 0; i < vs.length; i++) if (/^id/i.test(vs[i].lang)) { TK.voice = vs[i]; break; }
      if (!vs.length) TK.voice = undefined;          // senarai belum dimuat; cuba lagi lain kali
    }
    if (!TK.voice) return;                            // suara English menyebut BM dengan teruk; diam lebih baik
    speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(t);
    u.voice = TK.voice; u.lang = TK.voice.lang; u.rate = 1.0;
    speechSynthesis.speak(u);
  } catch (e) {}
};
/* ── Suara Coach Seth: klip pendek dimuat sekali selepas klik pertama, dimainkan
   melalui Web Audio (iOS benarkan bila AudioContext dibuka dalam klik). Satu suara
   pada satu masa; isyarat lama yang belum sempat dimain dibuang, bukan beratur. ── */
TK.V = { buf: {}, loading: false, cur: null, busyUntil: 0 };
TK.V.load = function () {
  if (TK.V.loading || !TK.ac || !window.fetch) return;
  TK.V.loading = true;
  TK.CLIPS.forEach(function (k) {
    fetch('v/' + k + '.m4a').then(function (r) { if (!r.ok) throw 0; return r.arrayBuffer(); })
      .then(function (ab) { return new Promise(function (res, rej) { TK.ac.decodeAudioData(ab, res, rej); }); })
      .then(function (b) { TK.V.buf[k] = b; })['catch'](function () {});
  });
};
/* pri: 2 = mesti (mula, keputusan), 1 = teguran, 0 = kiraan/pujian (boleh dilangkau) */
TK.V.play = function (k, pri, fallbackText) {
  if (!TK.st.sound) return false;
  var now = Date.now(), b = TK.V.buf[k];
  if (now < TK.V.busyUntil && (pri || 0) < 2 && (pri || 0) <= (TK.V.curPri || 0)) return false;
  if (!b) { if (fallbackText) TK.say(fallbackText); return false; }
  try {
    if (TK.V.cur) { try { TK.V.cur.stop(); } catch (e) {} }
    var s = TK.ac.createBufferSource(), g = TK.ac.createGain();
    g.gain.value = 1.0; s.buffer = b; s.connect(g); g.connect(TK.ac.destination); s.start();
    TK.V.cur = s; TK.V.curPri = pri || 0; TK.V.busyUntil = now + b.duration * 1000;
    return true;
  } catch (e) { return false; }
};
/* dua klip berturut (contoh "Fokus seterusnya!" kemudian teguran) */
TK.V.chain = function (a, b, pri) {
  if (!TK.V.play(a, pri)) { if (b) TK.V.play(b, pri); return; }
  var d = TK.V.buf[a] ? TK.V.buf[a].duration * 1000 + 150 : 0;
  if (b) setTimeout(function () { TK.V.play(b, pri); }, d);
};

TK.beep = function (good) {
  if (!TK.st.sound) return;
  try {
    var A = TK.ac || (TK.ac = new (window.AudioContext || window.webkitAudioContext)());
    var o = A.createOscillator(), g = A.createGain();
    o.frequency.value = good ? 880 : 330; o.type = 'sine';
    g.gain.setValueAtTime(0.0001, A.currentTime);
    g.gain.exponentialRampToValueAtTime(0.25, A.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, A.currentTime + (good ? 0.18 : 0.32));
    o.connect(g); g.connect(A.destination); o.start(); o.stop(A.currentTime + 0.35);
  } catch (e) {}
};
TK.toggleSound = function () {
  TK.st.sound = !TK.st.sound;
  TK.$('camSound').textContent = TK.st.sound ? '🔊' : '🔇';
  try { localStorage.setItem('hf_teknik_sound', TK.st.sound ? '1' : '0'); } catch (e) {}
};

TK.setStatus = function (big, small, cls) {
  TK.$('camBig').textContent = big || '';
  TK.$('camBig').className = 'big' + (cls ? ' ' + cls : '');
  TK.$('camCue').textContent = small || '';
};
TK.total = function () { var ex = TK.EX[TK.st.key]; return TK.TARGET + ((ex && ex.front) || 0); };
TK.paintDots = function () {
  var h = '', i, r;
  for (i = 0; i < TK.total(); i++) {
    r = TK.st.reps[i];
    h += '<s class="' + (r ? (r.issues.length ? 'warn' : 'good') : '') + '"></s>';
  }
  TK.$('camDots').innerHTML = h;
  TK.$('camEnd').disabled = !TK.st.reps.length;
};

TK.start = function () {
  var k = TK.st.key, ex = TK.EX[k];
  if (TK.st.busy) return;
  TK.st.busy = true; TK.st.reps = []; TK.st.armed = false; TK.st.done = false;
  TK.st.phase = 'side'; TK.st.sq = (k === 'squat') ? TK.SQ.create('side') : null; TK.st.faceRun = 0; TK.st.lostAt = 0; TK.st.saidTegak = false;
  TK.paintGauge(0, false);
  /* iOS: kamera, audio dan suara mesti "dibuka" di dalam klik ini. */
  try { if (window.speechSynthesis) speechSynthesis.speak(new SpeechSynthesisUtterance('')); } catch (e) {}
  try { if (!TK.ac) TK.ac = new (window.AudioContext || window.webkitAudioContext)(); if (TK.ac.resume) TK.ac.resume(); } catch (e) {}
  TK.V.load();
  TK.show('cam');
  TK.$('camName').textContent = ex.nama + (k === 'pushup' ? (TK.st.variant === 'lutut' ? ' · lutut' : ' · biasa') : '');
  TK.$('camErr').hidden = true;
  TK.paintDots();
  TK.setStatus('Buka kamera…', 'Benarkan kamera bila telefon tanya.');
  TK.setVariant(k === 'pushup' ? TK.st.variant : '');
  TR.Pose.grab('user').then(function () {
    return TR.Pose.attach(TK.$('camVideo'));
  }).then(function () {
    TR.Pose.syncCanvas(TK.$('camCanvas'));
    if (TR.Pose.engine) return 'ready';
    TK.setStatus('AI sedang bersedia…', 'Kali pertama ambil 10–20 saat. Lepas ni lebih laju.');
    return TR.Pose.initEngine();
  }).then(function () {
    TK.st.busy = false;
    TR.Calib.reset();
    TK.st.det = TR.Detector.create(k);
    TK.setStatus('Berdiri tegak', ex.sedia);
    TK.$('camPhase').textContent = k === 'squat' ? 'Dari tepi' : '';
    TK.$('camGauge').hidden = (k !== 'squat');
    TR.Pose.start(TK.onFrame);
  })['catch'](function (e) {
    TK.st.busy = false;
    TK.fail(e);
  });
};

TK.fail = function (e) {
  var msg = String(e && (e.message || e) || '');
  var nice = /Permission|NotAllowed|denied/i.test(msg) ? 'Kamera tidak dibenarkan. Buka tetapan pelayar, benarkan kamera untuk laman ini, kemudian cuba lagi.'
           : /not supported|getUserMedia/i.test(msg) ? 'Pelayar ini tak sokong kamera. Buka page ini dalam Safari atau Chrome.'
           : /pose engine|unavailable|timed out|timeout/i.test(msg) ? 'AI tak dapat dimuat. Semak internet anda dan cuba lagi.'
           : 'Kamera tak dapat dibuka. Tutup app lain yang guna kamera, kemudian cuba lagi.';
  TK.$('camErr').hidden = false;
  TK.$('camErrMsg').textContent = nice;
  TK.$('camErrTech').textContent = msg;
  TK.setStatus('', '');
  try { TR.Pose.release(); } catch (x) {}
};

TK.onFrame = function (j) {
  var st = TK.st;
  if (!st.det || st.done) return;
  var tint = st.flashUntil && Date.now() < st.flashUntil ? st.flashCol : (st.armed ? '#FF7A35' : '#FFF4EA');
  TR.Pose.draw(j, tint);
  if (st.phase === 'turn') return TK.onTurn(j);
  var inRep = !!st.det.cyc;
  var evs = st.det.feed(j), i, e;
  if (st.sq && st.armed) {
    var live = TK.SQ.frame(st.sq, j, !!st.det.cyc || inRep);
    for (i = 0; i < live.length; i++) {
      if (live[i].k === 'cukup') { TK.V.play('cukup', 0); TK.flash('#5BE394'); }
      else { TK.V.play(live[i].k, 1); TK.setStatus(TK.$('camBig').textContent, TK.ISU[live[i].k].cue, 'warn'); }
    }
    if (st.phase === 'side') { var dp = TK.SQ.depth(st.sq, j); TK.paintGauge(dp, dp >= 1); }
  }
  for (i = 0; i < evs.length; i++) {
    e = evs[i];
    if (e.t === 'calib') {
      if (!st.saidTegak) { st.saidTegak = true; TK.V.play('s_tegak', 2, TK.EX[st.key].sedia); }
      if (e.done && !st.armed) {
        st.armed = true;
        TK.setStatus('Mula!', TK.EX[st.key].mula, 'good');
        TK.V.play(TK.EX[st.key].clipSedia, 2, TK.EX[st.key].mula);
      } else if (!e.done) {
        var p = Math.round((TR.Calib.frames.length / TR.CFG.calibFrames) * 100);
        TK.setStatus('Berdiri tegak' + (p ? ' · ' + p + '%' : ''), TK.bm(e.text));
      }
    } else if (e.t === 'lost') {
      TK.setStatus('Cari anda…', TK.bm(e.text), 'warn');
      if (Date.now() - st.lostAt > 7000) { st.lostAt = Date.now(); TK.V.play(/side-on|full body/.test(e.text) ? 'kaki' : 'hilang', 1); }
    } else if (e.t === 'rep') {
      TK.onRep(e.rep);
    }
  }
};

TK.flash = function (col) { TK.st.flashCol = col; TK.st.flashUntil = Date.now() + 600; };
TK.paintGauge = function (d, deep) {
  var g = TK.$('camGaugeFill'); if (!g) return;
  g.style.height = Math.round(Math.min(1.15, d) / 1.15 * 100) + '%';
  TK.$('camGauge').className = 'gauge' + (deep ? ' deep' : '');
};

/* Squat: lepas 5 rep dari tepi, pusing menghadap kamera untuk 3 rep (lutut) */
TK.toFront = function () {
  var st = TK.st;
  st.phase = 'turn'; st.faceRun = 0;
  TK.$('camGauge').hidden = true;
  TK.$('camPhase').textContent = 'Dari depan';
  TK.setStatus('Pusing!', 'Menghadap kamera untuk 3 squat lagi. AI nak tengok lutut anda.', 'good');
  setTimeout(function () { TK.V.play('s_depan', 2, 'Sekarang pusing, menghadap kamera. Tiga squat lagi.'); }, 700);
};
TK.onTurn = function (j) {
  var st = TK.st;
  if (!j || !j.lsh || !j.rsh || !j.lknee || !j.rknee || !j.lank || !j.rank) { st.faceRun = 0; return; }
  var T = TR.Calib.torso || 0.25, sw = Math.abs(j.lsh.x - j.rsh.x) / T;
  var hip = TR.G.mid(j.lhip, j.rhip), up = hip && TR.Calib.standHipY != null ? Math.abs(hip.y - TR.Calib.standHipY) / T < 0.15 : true;
  if (sw > 0.45 && up) st.faceRun++; else st.faceRun = 0;
  if (st.faceRun >= 20) {
    TK.tuneFront();
    st.det = TR.Detector.create('squatfront');
    st.sq = TK.SQ.create('front');
    st.phase = 'front';
    TK.setStatus('Mula!', 'Tiga squat, menghadap kamera.', 'good');
    TK.V.play('s_depan_mula', 2, 'Tiga squat. Mula.');
  }
};

TK.onRep = function (rep) {
  var st = TK.st, total = TK.total();
  if (st.done || st.reps.length >= total) return;
  if (!TK.accept(st.key, rep)) { if (st.sq) st.sq.acc = null; return; }
  rep.view = st.phase;
  rep.issues = st.sq ? TK.SQ.issues(st.sq, rep) : TK.check(st.key, rep);
  st.reps.push(rep);
  TK.paintDots();
  var n = st.reps.length, inPhase = st.phase === 'front' ? n - TK.TARGET : n;
  var phaseTotal = st.phase === 'front' ? TK.EX[st.key].front : TK.TARGET;
  if (!rep.issues.length) {
    TK.setStatus('Cantik! ' + inPhase + '/' + phaseTotal, 'Teruskan, macam tu.', 'good');
    TK.flash('#5BE394'); TK.beep(true);
    setTimeout(function () { TK.V.play('c' + Math.min(5, inPhase), 0, 'Cantik.'); }, 250);
  } else {
    var c = rep.issues[0];
    TK.setStatus('Rep ' + inPhase + '/' + phaseTotal, TK.ISU[c].cue, 'warn');
    TK.flash('#FF7A35'); TK.beep(false);
    var clip = TK.CLIP[c];
    setTimeout(function () { if (clip) TK.V.play(clip, 1, TK.ISU[c].cue); else TK.say(TK.ISU[c].cue); }, 250);
  }
  if (st.phase === 'side' && n >= TK.TARGET && TK.EX[st.key].front) { setTimeout(TK.toFront, 1500); return; }
  if (n >= total) { st.done = true; setTimeout(TK.finish, 1600); }
};

TK.stop = function () {
  /* Butang "Selesai": tamat dengan rep yang ada; tanpa rep, balik ke gerakan. */
  if (TK.st.reps.length) { TK.st.done = true; TK.finish(); return; }
  TK.teardown(); TK.open(TK.st.key);
};
TK.teardown = function () {
  TK.st.det = null; TK.st.busy = false;
  try { TR.Pose.release(); } catch (e) {}
  try { if (window.speechSynthesis) speechSynthesis.cancel(); } catch (e) {}
};

/* ── Keputusan ────────────────────────────────────────────────────────── */
TK.finish = function () {
  var k = TK.st.key, s = TK.summary(k, TK.st.reps), i, row, h = '';
  TK.teardown();
  TK.memAdd(s, k === 'pushup' ? TK.st.variant : '');
  var head = { cantik: 'Teknik cantik!', hampir: 'Dah hampir!', betulkan: 'Mari betulkan sama-sama', kosong: 'Tiada rep dikesan' }[s.level];
  TK.$('rsLevel').textContent = head;
  TK.$('rsLevel').className = 'rs-level ' + s.level;
  TK.$('rsBig').innerHTML = '<b>' + s.good + '</b><span>/' + s.n + '</span>';
  TK.$('rsBigLbl').textContent = 'rep teknik cantik';
  for (i = 0; i < s.rows.length; i++) {
    row = s.rows[i];
    h += '<li class="' + (row.miss ? 'miss' : 'ok') + '"><span class="ic">' + (row.miss ? '!' : '✓') + '</span>' +
         '<span class="lb">' + row.label + '</span><span class="vl">' + (row.miss ? row.miss + ' dari ' + s.n + ' rep' : 'Cantik') + '</span></li>';
  }
  TK.$('rsRows').innerHTML = h;
  var f = s.focus && TK.ISU[s.focus];
  TK.$('rsFocusT').textContent = f ? f.title : 'Langkah seterusnya';
  TK.$('rsFocusB').textContent = f ? f.body
    : 'Semua kunci teknik dah betul. Sekarang cuba turun lebih perlahan (kira 3 saat), atau tambah rep dalam sesi latihan anda.';
  TK.$('rsName').textContent = TK.EX[k].nama;
  TK.show('result');
  var lv = { cantik: 'r_cantik', hampir: 'r_hampir', betulkan: 'r_betul' }[s.level];
  setTimeout(function () {
    if (!lv) return;
    if (!s.focus) { TK.V.play(lv, 2, 'Teknik cantik!'); return; }
    TK.V.play(lv, 2, f.title);
    var d = TK.V.buf[lv] ? TK.V.buf[lv].duration * 1000 + 250 : 1500;
    setTimeout(function () { TK.V.chain('fokus', TK.CLIP[s.focus], 2); }, d);
  }, 400);
};

/* ── Pendawaian ───────────────────────────────────────────────────────── */
TK.boot = function () {
  TK.tune();
  try { TK.st.sound = localStorage.getItem('hf_teknik_sound') !== '0'; } catch (e) {}
  TK.$('camSound').textContent = TK.st.sound ? '🔊' : '🔇';
  try { if (window.speechSynthesis) speechSynthesis.getVoices(); } catch (e) {}
  document.addEventListener('visibilitychange', function () {
    if (document.hidden && TK.$('v-cam') && !TK.$('v-cam').hidden) { TK.teardown(); TK.open(TK.st.key); }
  });
  TK.home();
};
