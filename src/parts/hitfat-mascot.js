/*
 * HITFAT+ Maskot Progres (ES5)
 * --------------------------------------------------------------
 * Maskot berubah ikut BILANGAN HARI AKTIF dalam 7 hari terakhir,
 * dari mana-mana program (Burn 30, IF, HYROX, dll). Tak terikat
 * dengan jadual program.
 *
 *   0-1 hari  -> Tahap 1 Comel  (mengantuk, BUKAN gemuk)
 *   2-3 hari  -> Tahap 2 Aktif
 *   4-5 hari  -> Tahap 3 Tegap
 *   6-7 hari  -> Tahap 4 Juara
 *
 * "Aktiviti siap" = user tekan selesai pada mana-mana workout.
 * Panggil HFMascot.logActivity() pada saat itu.
 *
 * Guna:
 *   HFMascot.config.images = ['img/m1.png','img/m2.png','img/m3.png','img/m4.png'];
 *   HFMascot.render(document.getElementById('mascot-home'), { mode: 'compact' });
 *   HFMascot.render(document.getElementById('mascot-progress'), { mode: 'full' });
 *
 * Kalau data aktiviti datang dari server, hantar terus:
 *   HFMascot.render(el, { mode: 'full', dates: ['2026-10-14', '2026-10-15T08:00:00Z'] });
 */
(function (root) {
  'use strict';

  var STORAGE_KEY = 'hf_activity_log';
  var DAY_MS = 86400000;

  var STAGES = [
    { level: 1, name: 'Comel', min: 0, max: 1, msg: 'Zzz... jom gerak sikit hari ni? Satu sesi pun cukup.' },
    { level: 2, name: 'Aktif', min: 2, max: 3, msg: 'Best! Badan dah mula panas. Teruskan!' },
    { level: 3, name: 'Tegap', min: 4, max: 5, msg: 'Tengok lengan ni! Konsisten betul minggu ni.' },
    { level: 4, name: 'Juara', min: 6, max: 7, msg: 'JUARA! Minggu ni memang padu. Kekalkan!' }
  ];

  var config = {
    images: [null, null, null, null],
    windowDays: 7
  };

  /* ---------- tarikh ---------- */

  function pad(n) {
    return n < 10 ? '0' + n : '' + n;
  }

  // Kunci hari ikut waktu tempatan peranti (YYYY-MM-DD)
  function dayKey(d) {
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }

  function toDate(v) {
    if (v instanceof Date) { return v; }
    if (typeof v === 'number') { return new Date(v); }
    if (typeof v === 'string') {
      // 'YYYY-MM-DD' sahaja -> anggap hari tempatan
      var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
      if (m) { return new Date(+m[1], +m[2] - 1, +m[3]); }
      return new Date(v);
    }
    return null;
  }

  /* ---------- storan (fallback tempatan) ---------- */

  function readLog() {
    try {
      var raw = root.localStorage.getItem(STORAGE_KEY);
      var arr = raw ? JSON.parse(raw) : [];
      return arr instanceof Array ? arr : [];
    } catch (e) {
      return [];
    }
  }

  function writeLog(arr) {
    try {
      root.localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
    } catch (e) { /* storan disekat: abaikan */ }
  }

  function logActivity(when) {
    var d = toDate(when || new Date());
    if (!d || isNaN(d.getTime())) { return; }
    var key = dayKey(d);
    var log = readLog();
    var i;
    for (i = 0; i < log.length; i++) {
      if (log[i] === key) { return; } // satu hari dikira sekali sahaja
    }
    log.push(key);
    // simpan 60 hari terakhir sahaja
    if (log.length > 60) { log = log.slice(log.length - 60); }
    writeLog(log);
  }

  /* ---------- logik ---------- */

  // Pulangkan array 7 boolean (paling lama -> hari ini)
  function weekMap(dates, now) {
    var today = toDate(now || new Date());
    var set = {};
    var i, d, out = [];
    for (i = 0; i < dates.length; i++) {
      d = toDate(dates[i]);
      if (d && !isNaN(d.getTime())) { set[dayKey(d)] = true; }
    }
    for (i = config.windowDays - 1; i >= 0; i--) {
      d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
      out.push(set[dayKey(d)] === true);
    }
    return out;
  }

  function countActive(map) {
    var n = 0, i;
    for (i = 0; i < map.length; i++) { if (map[i]) { n++; } }
    return n;
  }

  function stageFor(activeDays) {
    var i;
    for (i = STAGES.length - 1; i >= 0; i--) {
      if (activeDays >= STAGES[i].min) { return STAGES[i]; }
    }
    return STAGES[0];
  }

  function getState(opts) {
    opts = opts || {};
    var dates = opts.dates || readLog();
    var map = weekMap(dates, opts.now);
    var active = countActive(map);
    var stage = stageFor(active);
    var next = stage.level < 4 ? STAGES[stage.level] : null;
    return {
      activeDays: active,
      week: map,
      stage: stage,
      daysToNext: next ? next.min - active : 0,
      nextName: next ? next.name : null,
      doneToday: map[map.length - 1]
    };
  }

  /* ---------- placeholder SVG (sementara, sebelum imej sebenar) ---------- */

  function placeholderSvg(level) {
    var eyes, mouth, arms, extra = '';
    if (level === 1) {
      eyes = '<path d="M38 62 q6 4 12 0" stroke="#111" stroke-width="3" fill="none" stroke-linecap="round"/>' +
             '<path d="M70 62 q6 4 12 0" stroke="#111" stroke-width="3" fill="none" stroke-linecap="round"/>';
      mouth = '<ellipse cx="60" cy="78" rx="4" ry="5" fill="#7a0010"/>';
      arms = '<ellipse cx="22" cy="80" rx="6" ry="9" fill="#E30613"/><ellipse cx="98" cy="80" rx="6" ry="9" fill="#E30613"/>';
      extra = '<text x="88" y="34" font-size="12" fill="#888" font-family="sans-serif">z</text>';
    } else {
      eyes = '<circle cx="44" cy="62" r="7" fill="#111"/><circle cx="76" cy="62" r="7" fill="#111"/>' +
             '<circle cx="46" cy="59" r="2.5" fill="#fff"/><circle cx="78" cy="59" r="2.5" fill="#fff"/>';
      mouth = '<path d="M52 76 q8 9 16 0" fill="#7a0010"/>';
      if (level === 2) {
        arms = '<ellipse cx="22" cy="76" rx="7" ry="9" fill="#E30613"/><ellipse cx="100" cy="60" rx="7" ry="9" fill="#E30613"/>';
      } else if (level === 3) {
        arms = '<circle cx="18" cy="70" r="11" fill="#E30613"/><circle cx="102" cy="70" r="11" fill="#E30613"/>';
      } else {
        arms = '<circle cx="16" cy="44" r="11" fill="#E30613"/><circle cx="104" cy="44" r="11" fill="#E30613"/>';
        extra = '<text x="6" y="22" font-size="14" fill="#FFC20E" font-family="sans-serif">*</text>' +
                '<text x="104" y="22" font-size="14" fill="#FFC20E" font-family="sans-serif">*</text>';
      }
    }
    var band = level >= 3 ? '<rect x="28" y="40" width="64" height="6" rx="3" fill="#fff"/>' : '';
    var scale = level === 1 ? 0.92 : (level === 4 ? 1.06 : 1);
    return '<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<g transform="translate(60 64) scale(' + scale + ') translate(-60 -64)">' +
      '<path d="M40 40 v-12 a20 20 0 0 1 40 0 v12" stroke="#111" stroke-width="10" fill="none" stroke-linecap="round"/>' +
      arms +
      '<circle cx="60" cy="70" r="36" fill="#E30613"/>' +
      band +
      '<circle cx="36" cy="74" r="5" fill="#ff9aa8" opacity=".8"/><circle cx="84" cy="74" r="5" fill="#ff9aa8" opacity=".8"/>' +
      eyes + mouth +
      '<rect x="42" y="102" width="12" height="8" rx="4" fill="#fff" stroke="#ddd"/><rect x="66" y="102" width="12" height="8" rx="4" fill="#fff" stroke="#ddd"/>' +
      extra + '</g></svg>';
  }

  function figureHtml(level) {
    var src = config.images[level - 1];
    if (src) {
      return '<img src="' + src + '" alt="Maskot HITFAT tahap ' + level + '">';
    }
    return placeholderSvg(level);
  }

  /* ---------- paparan ---------- */

  var DAY_LABELS = ['Ah', 'Is', 'Se', 'Ra', 'Kh', 'Ju', 'Sa'];

  function render(el, opts) {
    if (!el) { return null; }
    opts = opts || {};
    var s = getState(opts);
    var lv = s.stage.level;
    var html = '';
    var i, d, today = toDate(opts.now || new Date());

    if (opts.mode === 'compact') {
      html =
        '<div class="hfm hfm-compact hfm-lv' + lv + '">' +
          '<div class="hfm-fig">' + figureHtml(lv) + '</div>' +
          '<div class="hfm-bubble">' +
            '<div class="hfm-tag">' + s.stage.name + ' &middot; ' + s.activeDays + '/7 hari</div>' +
            '<div class="hfm-msg">' + (s.doneToday ? 'Hari ni dah aktif. Mantap!' : s.stage.msg) + '</div>' +
          '</div>' +
        '</div>';
    } else {
      var dots = '';
      for (i = 0; i < s.week.length; i++) {
        d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (s.week.length - 1 - i));
        dots += '<div class="hfm-day' + (s.week[i] ? ' on' : '') + (i === s.week.length - 1 ? ' today' : '') + '">' +
                  '<span class="hfm-dot"></span><span class="hfm-dl">' + DAY_LABELS[d.getDay()] + '</span>' +
                '</div>';
      }
      var steps = '';
      for (i = 0; i < STAGES.length; i++) {
        steps += '<div class="hfm-step' + (STAGES[i].level <= lv ? ' on' : '') + '">' + STAGES[i].name + '</div>';
      }
      var hint = s.nextName
        ? 'Aktif <b>' + s.daysToNext + ' hari lagi</b> minggu ni untuk naik ke <b>' + s.nextName + '</b>.'
        : 'Tahap tertinggi! Kekalkan supaya tak turun.';
      html =
        '<div class="hfm hfm-full hfm-lv' + lv + '">' +
          '<div class="hfm-fig">' + figureHtml(lv) + '</div>' +
          '<div class="hfm-name">' + s.stage.name + '</div>' +
          '<div class="hfm-msg">' + s.stage.msg + '</div>' +
          '<div class="hfm-steps">' + steps + '</div>' +
          '<div class="hfm-count"><b>' + s.activeDays + '</b>/7 hari aktif</div>' +
          '<div class="hfm-week">' + dots + '</div>' +
          '<div class="hfm-hint">' + hint + '</div>' +
        '</div>';
    }

    el.innerHTML = html;
    if (typeof opts.onClick === 'function') {
      el.onclick = function () { opts.onClick(s); };
    }
    return s;
  }

  root.HFMascot = {
    config: config,
    STAGES: STAGES,
    logActivity: logActivity,
    getState: getState,
    stageFor: stageFor,
    render: render,
    _readLog: readLog,
    _writeLog: writeLog
  };
}(typeof window !== 'undefined' ? window : this));
