/* ═══════════════════════════════════════════════════════════════════════
   c_pose.js — kamera, enjin pose, dan LAPISAN PENYESUAI.

   Ini pembaikan seni bina terbesar berbanding AI Trainer lama.

   Yang lama menulis `lm[23]` terus dalam setiap detektor. Indeks itu milik
   satu model tertentu, jadi menukar model bermakna menulis semula setiap
   detektor — dan itulah sebabnya AI Trainer masih terkunci pada
   `@mediapipe/pose`, sebuah API yang Google sudah tidak sokong.

   Di sini enjin memulangkan SENDI BERNAMA:
       j.lknee.x   j.lknee.y   j.lknee.s
   Detektor tidak pernah melihat nombor indeks dan tidak tahu model mana yang
   sedang berjalan. Menukar enjin ialah menukar satu peta.

   Dua enjin dimuatkan, dengan sebab:
     MediaPipe Tasks Vision (PoseLandmarker)  — 33 titik, GPU, API semasa.
     TensorFlow.js MoveNet Lightning          — 17 titik, sandaran.
   MoveNet ialah satu-satunya enjin yang pernah disahkan berjalan pada telefon
   Seth (lihat Wall Ball Lab: BlazePose dinyahkan sebagai lalai pada 20 Ogos
   selepas ia tersangkut pada MOVE INTO FRAME di lapangan). Jadi Tasks dicuba
   dahulu kerana ia lebih baik, tetapi kegagalan memuat TIDAK pernah mematikan
   app — ia jatuh ke MoveNet dan MENGATAKANNYA pada skrin, supaya sandaran
   senyap tidak boleh menyamar sebagai penjejakan 33 titik.

   Tiga pelajaran iOS yang mahal, dikekalkan dengan sengaja:
   1. play() MESTI di dalam gerak isyarat pengguna, jika tidak iOS membekukan
      video (currentTime kekal 0 walaupun readyState 4).
   2. Kanvas mesti diselaraskan dengan dimensi VIDEO sebenar, bukan CSS.
   3. Trek mesti dihentikan bila halaman disembunyikan, jika tidak kamera
      kekal dikunci dan skrin seterusnya tergantung.
   ═══════════════════════════════════════════════════════════════════════ */

/* Peta sendi. Kiri/kanan ialah kiri/kanan ATLET, bukan penonton — kedua-dua
   model memberi label begitu, dan menukarnya di sini bermakna setiap isyarat
   "guna kaki kiri" akan menyebut kaki yang salah. */
TR.MAP_TASKS = {   // MediaPipe Pose (33 titik)
  nose:0, lsh:11, rsh:12, lel:13, rel:14, lwr:15, rwr:16,
  lhip:23, rhip:24, lknee:25, rknee:26, lank:27, rank:28,
  lheel:29, rheel:30, lfoot:31, rfoot:32
};
TR.MAP_MOVENET = { // MoveNet / COCO (17 titik) — tiada tumit atau tapak kaki
  nose:0, lsh:5, rsh:6, lel:7, rel:8, lwr:9, rwr:10,
  lhip:11, rhip:12, lknee:13, rknee:14, lank:15, rank:16
};
TR.JOINTS = ['nose','lsh','rsh','lel','rel','lwr','rwr','lhip','rhip',
             'lknee','rknee','lank','rank','lheel','rheel','lfoot','rfoot'];

/* Tulang untuk melukis. Dinyatakan dalam NAMA, jadi satu senarai berfungsi
   untuk kedua-dua model; segmen yang sendinya tiada dilangkau sendiri. */
TR.BONES = [
  ['lsh','rsh'], ['lsh','lel'], ['lel','lwr'], ['rsh','rel'], ['rel','rwr'],
  ['lsh','lhip'], ['rsh','rhip'], ['lhip','rhip'],
  ['lhip','lknee'], ['lknee','lank'], ['rhip','rknee'], ['rknee','rank'],
  ['lank','lheel'], ['lheel','lfoot'], ['rank','rheel'], ['rheel','rfoot']
];

TR.Pose = {
  stream: null, video: null, canvas: null, ctx: null,
  engine: null, kind: '', map: null,
  looping: false, rafId: null, lastTs: 0,
  onFrame: null, lostFrames: 0, err: '',

  /* ── Kamera ─────────────────────────────────────────────────────────── */

  /* Dipanggil DI DALAM pengendali klik. Merampas kamera awal supaya iOS
     tidak membekukan strim kemudian. */
  grab: function (facing) {
    var self = this;
    if (self.stream) return Promise.resolve(self.stream);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia)
      return Promise.reject(new Error('Camera not supported by this browser.'));
    return navigator.mediaDevices.getUserMedia({
      video: { facingMode: facing || 'user', width: { ideal: 960 }, height: { ideal: 720 } },
      audio: false
    }).then(function (s) { self.stream = s; return s; });
  },

  attach: function (videoEl) {
    var self = this;
    self.video = videoEl;
    if (videoEl.srcObject !== self.stream) videoEl.srcObject = self.stream;
    videoEl.setAttribute('playsinline', '');
    videoEl.setAttribute('webkit-playsinline', '');
    videoEl.muted = true;
    var p = videoEl.play();
    return (p && p['catch'] ? p['catch'](function () { return videoEl.play()['catch'](function () {}); })
                            : Promise.resolve())
      .then(function () {
        return new Promise(function (res) {
          if (videoEl.readyState >= 1) { res(); return; }
          videoEl.addEventListener('loadedmetadata', res, { once: true });
          setTimeout(res, 3000);        // fail-safe: loadedmetadata kadang tidak fire pada iOS
        });
      });
  },

  syncCanvas: function (canvasEl) {
    this.canvas = canvasEl;
    this.ctx = canvasEl.getContext('2d');
    var v = this.video;
    canvasEl.width  = (v && v.videoWidth)  || 640;
    canvasEl.height = (v && v.videoHeight) || 480;
  },

  release: function () {
    this.stop();
    if (this.stream) {
      var t = this.stream.getTracks();
      for (var i = 0; i < t.length; i++) { try { t[i].stop(); } catch (e) {} }
      this.stream = null;
    }
    if (this.video) { try { this.video.srcObject = null; } catch (e) {} }
  },

  /* ── Memuat pustaka ────────────────────────────────────────────────────
     Tasks Vision ialah modul ES. Daripada menulis import() dalam fail ini
     (yang mengunci keseluruhan sumber kepada penghurai yang menyokongnya),
     satu <script type="module"> kecil disuntik dan hasilnya diletakkan pada
     window. Sumber di sini kekal ES5 dan boleh disemak dengan jsc. */
  loadTasks: function () {
    if (window.__TRV) return Promise.resolve(!!window.__TRV.PoseLandmarker);
    return new Promise(function (res) {
      var URL_ = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14';
      var done = false;
      var finish = function () { if (!done) { done = true; res(!!(window.__TRV && window.__TRV.PoseLandmarker)); } };
      var s = document.createElement('script');
      s.type = 'module';
      s.textContent =
        'import("' + URL_ + '").then(function(m){window.__TRV=m;})' +
        '.catch(function(e){window.__TRV={};window.__TRVERR=String(e);})' +
        '.then(function(){window.dispatchEvent(new Event("trv-ready"));});';
      window.addEventListener('trv-ready', finish, { once: true });
      document.head.appendChild(s);
      setTimeout(finish, 12000);        // rangkaian mati tidak boleh menggantung app
    });
  },

  loadScript: function (src) {
    return new Promise(function (res) {
      var el = document.createElement('script');
      el.src = src; el.crossOrigin = 'anonymous';
      el.onload = function () { res(true); };
      el.onerror = function () { res(false); };   // jangan sekat; kesediaan diperiksa selepas
      document.head.appendChild(el);
      setTimeout(function () { res(typeof window.poseDetection !== 'undefined'); }, 12000);
    });
  },

  loadMoveNet: function () {
    var self = this;
    if (typeof window.poseDetection !== 'undefined') return Promise.resolve(true);
    return self.loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-core@4.20.0/dist/tf-core.min.js')
      .then(function () { return self.loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-converter@4.20.0/dist/tf-converter.min.js'); })
      .then(function () { return self.loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-webgl@4.20.0/dist/tf-backend-webgl.min.js'); })
      .then(function () { return self.loadScript('https://cdn.jsdelivr.net/npm/@tensorflow-models/pose-detection@2.1.3/dist/pose-detection.min.js'); })
      .then(function () { return typeof window.poseDetection !== 'undefined'; });
  },

  /* Muatan yang tergantung selama-lamanya ialah kegagalan yang paling teruk
     kerana ia tidak kelihatan seperti kegagalan — ia kelihatan seperti app
     yang lambat, jadi tiada siapa melaporkannya. Setiap percubaan enjin
     mendapat siling; melepasinya bermakna cuba yang seterusnya. */
  withTimeout: function (promise, ms, label) {
    return new Promise(function (res, rej) {
      var done = false;
      var timer = setTimeout(function () {
        if (!done) { done = true; rej(new Error(label + ' timed out after ' + Math.round(ms / 1000) + 's')); }
      }, ms);
      promise.then(function (v) { if (!done) { done = true; clearTimeout(timer); res(v); } },
                   function (e) { if (!done) { done = true; clearTimeout(timer); rej(e); } });
    });
  },

  /* ── Memulakan enjin ───────────────────────────────────────────────────
     Kembalikan nama enjin yang BENAR-BENAR berjalan. Pemanggil memaparkannya
     pada skrin; sandaran senyap ialah pembohongan yang mahal untuk dikesan.

     PILIHAN MODEL, diukur bukan diteka (26 Ogos 2026, desktop, cache sejuk):
         pose_landmarker_full   29.0s   33 titik
         MoveNet Lightning      13.7s   17 titik
         pose_landmarker_lite    7.4s   33 titik
     `lite` menang pada kedua-dua paksi — separuh masa muat MoveNet dan dua
     kali ganda bilangan titiknya — jadi ia yang menjadi lalai. `full` kekal
     di belakang ?model=full untuk sesiapa yang mahu menukar 20 saat tambahan
     dengan ketepatan sendi yang lebih baik. Nombor ini dari desktop; ukur
     semula pada telefon sebelum mengubah lalai. */
  initEngine: function (prefer) {
    var self = this;
    self.err = '';
    var q = String(location.search || '');
    var wantMove = (prefer === 'movenet') || q.indexOf('engine=movenet') > -1;
    var wantFull = q.indexOf('model=full') > -1;
    var MODEL = wantFull ? 'full' : 'lite';
    var LIMIT = 25000;

    var startTasks = function () {
      return self.loadTasks().then(function (okv) {
        if (!okv) throw new Error(window.__TRVERR || 'tasks-vision unavailable');
        var V = window.__TRV;
        var asset = 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_' +
                    MODEL + '/float16/1/pose_landmarker_' + MODEL + '.task';
        return self.withTimeout(V.FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
        ), LIMIT, 'pose runtime').then(function (fileset) {
          var make = function (delegate) {
            return V.PoseLandmarker.createFromOptions(fileset, {
              baseOptions: { modelAssetPath: asset, delegate: delegate },
              runningMode: 'VIDEO', numPoses: 1,
              minPoseDetectionConfidence: 0.5, minPosePresenceConfidence: 0.5, minTrackingConfidence: 0.5
            });
          };
          /* GPU ditolak oleh sesetengah pelayar dalam-app dan mod jimat kuasa.
             Kegagalan itu dahulunya muncul sebagai ralat kamera, yang menghantar
             penyahpepijatan ke arah yang salah sepenuhnya. */
          return self.withTimeout(make('GPU'), LIMIT, 'pose model')['catch'](function () {
            return self.withTimeout(make('CPU'), LIMIT, 'pose model (CPU)');
          });
        }).then(function (lm) {
          self.engine = lm; self.kind = 'tasks'; self.map = TR.MAP_TASKS;
          return 'MediaPipe Pose · 33 points' + (MODEL === 'full' ? ' (full)' : '');
        });
      });
    };

    var startMove = function () {
      return self.loadMoveNet().then(function (okv) {
        if (!okv) throw new Error('MoveNet unavailable');
        return window.tf.setBackend('webgl')['catch'](function () { return window.tf.setBackend('cpu'); })
          .then(function () { return window.tf.ready(); })
          .then(function () {
            return self.withTimeout(window.poseDetection.createDetector(
              window.poseDetection.SupportedModels.MoveNet,
              { modelType: window.poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING }), LIMIT, 'MoveNet');
          }).then(function (det) {
            self.engine = det; self.kind = 'movenet'; self.map = TR.MAP_MOVENET;
            return 'TensorFlow MoveNet · 17 points';
          });
      });
    };

    var first  = wantMove ? startMove : startTasks;
    var second = wantMove ? startTasks : startMove;
    return first()['catch'](function (e) {
      self.err = String(e && (e.message || e));
      return second()['catch'](function (e2) {
        throw new Error('No pose engine could load. ' + self.err + ' · ' + String(e2 && (e2.message || e2)));
      });
    });
  },

  /* ── Menormalkan keluaran ──────────────────────────────────────────────
     Tasks memberi x,y sudah dinormalkan 0..1. MoveNet memberi PIKSEL, jadi ia
     dibahagi dengan dimensi video. Selepas fungsi ini tiada kod hiliran yang
     boleh mengetahui perbezaannya — itulah gunanya.

     Nota keyakinan: Tasks kadang meninggalkan `visibility` sebagai undefined,
     dan `undefined > 0.4` ialah false — yang menandakan setiap sendi ghaib dan
     memaku app pada "MOVE INTO FRAME" sedangkan pose berjalan dengan baik.
     Skor yang hilang bermakna KELIHATAN. Pepijat ini sudah memakan sehari
     penuh dalam Wall Ball Lab; ia tidak akan berulang di sini. */
  normalise: function (raw, w, h) {
    var j = {}, i, name, p, m = this.map, isTasks = (this.kind === 'tasks');
    for (i = 0; i < TR.JOINTS.length; i++) {
      name = TR.JOINTS[i];
      if (!(name in m)) { j[name] = null; continue; }
      p = raw[m[name]];
      if (!p) { j[name] = null; continue; }
      j[name] = {
        x: isTasks ? p.x : (p.x / (w || 1)),
        y: isTasks ? p.y : (p.y / (h || 1)),
        s: (typeof p.visibility === 'number') ? p.visibility
           : (typeof p.score === 'number') ? p.score : 1
      };
    }
    return j;
  },

  /* ── Gelung frame ──────────────────────────────────────────────────── */
  start: function (cb) {
    var self = this;
    if (self.looping) { self.onFrame = cb; return; }
    self.looping = true; self.onFrame = cb; self.lostFrames = 0;
    var vid = self.video;

    var step = function () {
      if (!self.looping) return;
      self.rafId = requestAnimationFrame(step);
      if (!vid || vid.readyState < 2 || !self.engine) return;
      var w = vid.videoWidth, h = vid.videoHeight;
      if (!w || !h) return;
      if (self.canvas && (self.canvas.width !== w || self.canvas.height !== h)) self.syncCanvas(self.canvas);

      var pts = null;
      try {
        if (self.kind === 'tasks') {
          var ts = performance.now();
          if (ts <= self.lastTs) ts = self.lastTs + 1;   // Tasks menolak cap masa yang tidak menaik
          self.lastTs = ts;
          var r = self.engine.detectForVideo(vid, ts);
          if (r && r.landmarks && r.landmarks.length) pts = r.landmarks[0];
        } else {
          // MoveNet tidak segerak dari segi API tetapi mengembalikan promise;
          // frame diproses pada kadarnya sendiri supaya gelung tidak beratur.
          if (!self.busy) {
            self.busy = true;
            self.engine.estimatePoses(vid, { flipHorizontal: false }).then(function (poses) {
              self.busy = false;
              var kp = (poses && poses[0] && poses[0].keypoints) ? poses[0].keypoints : null;
              self.deliver(kp, w, h);
            })['catch'](function () { self.busy = false; });
          }
          return;
        }
      } catch (e) { return; }
      self.deliver(pts, w, h);
    };
    self.rafId = requestAnimationFrame(step);
  },

  deliver: function (pts, w, h) {
    if (!pts) {
      this.lostFrames++;
      if (this.onFrame) this.onFrame(null, this.lostFrames);
      return;
    }
    this.lostFrames = 0;
    var j = this.normalise(pts, w, h);
    if (this.onFrame) this.onFrame(j, 0);
  },

  stop: function () {
    this.looping = false; this.busy = false;
    if (this.rafId) { cancelAnimationFrame(this.rafId); this.rafId = null; }
  },

  /* ── Melukis ───────────────────────────────────────────────────────── */
  draw: function (j, tint) {
    var ctx = this.ctx, c = this.canvas;
    if (!ctx || !c) return;
    ctx.clearRect(0, 0, c.width, c.height);
    if (!j) return;
    var i, a, b, col = tint || '#F0392B';
    ctx.strokeStyle = col; ctx.lineWidth = Math.max(2, c.width / 220);
    ctx.lineCap = 'round';
    for (i = 0; i < TR.BONES.length; i++) {
      a = j[TR.BONES[i][0]]; b = j[TR.BONES[i][1]];
      if (!a || !b || a.s < TR.CFG.minScore || b.s < TR.CFG.minScore) continue;
      ctx.beginPath();
      ctx.moveTo(a.x * c.width, a.y * c.height);
      ctx.lineTo(b.x * c.width, b.y * c.height);
      ctx.stroke();
    }
    ctx.fillStyle = '#fff';
    for (i = 0; i < TR.JOINTS.length; i++) {
      a = j[TR.JOINTS[i]];
      if (!a || a.s < TR.CFG.minScore) continue;
      ctx.beginPath();
      ctx.arc(a.x * c.width, a.y * c.height, Math.max(2.5, c.width / 260), 0, Math.PI * 2);
      ctx.fill();
    }
  }
};
