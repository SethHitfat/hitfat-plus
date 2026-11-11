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
TK.paintDots = function () {
  var h = '', i, r;
  for (i = 0; i < TK.TARGET; i++) {
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
  /* iOS: kamera, audio dan suara mesti "dibuka" di dalam klik ini. */
  try { if (window.speechSynthesis) speechSynthesis.speak(new SpeechSynthesisUtterance('')); } catch (e) {}
  try { if (!TK.ac) TK.ac = new (window.AudioContext || window.webkitAudioContext)(); if (TK.ac.resume) TK.ac.resume(); } catch (e) {}
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
  TR.Pose.draw(j, st.armed ? '#FF7A35' : '#FFF4EA');
  var evs = st.det.feed(j), i, e;
  for (i = 0; i < evs.length; i++) {
    e = evs[i];
    if (e.t === 'calib') {
      if (e.done && !st.armed) {
        st.armed = true;
        TK.setStatus('Mula!', TK.EX[st.key].mula, 'good');
        TK.say(TK.EX[st.key].mula);
      } else if (!e.done) {
        var p = Math.round((TR.Calib.frames.length / TR.CFG.calibFrames) * 100);
        TK.setStatus('Berdiri tegak' + (p ? ' · ' + p + '%' : ''), TK.bm(e.text));
      }
    } else if (e.t === 'lost') {
      TK.setStatus('Cari anda…', TK.bm(e.text), 'warn');
    } else if (e.t === 'rep') {
      TK.onRep(e.rep);
    }
  }
};

TK.onRep = function (rep) {
  var st = TK.st;
  if (st.done || st.reps.length >= TK.TARGET) return;
  if (!TK.accept(st.key, rep)) return;
  rep.issues = TK.check(st.key, rep);
  st.reps.push(rep);
  TK.paintDots();
  var n = st.reps.length;
  if (!rep.issues.length) {
    TK.setStatus('Cantik! ' + n + '/' + TK.TARGET, n < TK.TARGET ? 'Teruskan, macam tu.' : '', 'good');
    TK.beep(true); TK.say(n < TK.TARGET ? 'Cantik.' : 'Cantik. Siap!');
  } else {
    var cue = TK.ISU[rep.issues[0]].cue;
    TK.setStatus('Rep ' + n + '/' + TK.TARGET, cue, 'warn');
    TK.beep(false); TK.say(cue);
  }
  if (n >= TK.TARGET) { st.done = true; setTimeout(TK.finish, 1600); }
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
  TK.say(f ? 'Fokus seterusnya: ' + f.title + '.' : 'Teknik cantik!');
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
