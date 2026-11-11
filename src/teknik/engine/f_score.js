/* ═══════════════════════════════════════════════════════════════════════
   f_score.js — meringkaskan satu set, menggredkannya, dan memilih SATU
   perkara untuk dibetulkan.

   Pelajaran yang dibawa dari Wall Ball Lab: skrin keputusan yang menyenaraikan
   lima kelemahan sekaligus tidak membetulkan satu pun. Atlet membaca senarai,
   berasa teruk, dan menukar apa-apa. Jadi laporan penuh kekal ada untuk sesiapa
   yang mahu, tetapi bahagian atas skrin membawa satu keutamaan sahaja.

   Fungsi di sini tulen: masuk array rep, keluar objek. Tiada DOM, tiada masa,
   tiada storan. Itu yang membuatkannya boleh diuji tanpa telefon.
   ═══════════════════════════════════════════════════════════════════════ */

TR.summarise = function (key, repData, holdMs) {
  var def = TR.EX[key] || {};
  var r = repData || [];
  var s = {
    key: key, name: def.name || key, kind: def.kind || 'rep',
    total: r.length, valid: 0, grey: 0, norep: 0,
    holdSecs: holdMs ? Math.round(holdMs / 1000) : 0,
    avgScore: 0, quality: 0,
    kneeMin: null, elbowMin: null, leanMax: null, symMax: null, sagMax: null,
    liftMax: null, spreadMax: null, dropMax: null,
    ecc: null, con: null, consistency: 0,
    reasons: {}, grade: '—', headline: ''
  };
  if (!r.length) {
    s.headline = def.kind === 'hold'
      ? (s.holdSecs ? ('You held for ' + s.holdSecs + ' seconds.') : 'No hold recorded.')
      : 'No reps recorded. Check the camera can see your whole body.';
    return s;
  }

  var i, sum = 0, eccs = [], cons = [], durs = [];
  for (i = 0; i < r.length; i++) {
    var x = r[i];
    if (x.verdict === 'valid') s.valid++;
    else if (x.verdict === 'grey') s.grey++;
    else s.norep++;
    sum += x.score || 0;
    if (x.reason) s.reasons[x.reason] = (s.reasons[x.reason] || 0) + 1;
    if (x.kneeMin  != null) s.kneeMin  = (s.kneeMin  == null) ? x.kneeMin  : Math.min(s.kneeMin,  x.kneeMin);
    if (x.elbowMin != null) s.elbowMin = (s.elbowMin == null) ? x.elbowMin : Math.min(s.elbowMin, x.elbowMin);
    if (x.lean != null) s.leanMax = (s.leanMax == null) ? x.lean : Math.max(s.leanMax, x.lean);
    if (x.sym  != null) s.symMax  = (s.symMax  == null) ? x.sym  : Math.max(s.symMax,  x.sym);
    if (x.sag  != null) s.sagMax  = (s.sagMax  == null) ? x.sag  : Math.max(s.sagMax,  x.sag);
    if (x.lift   != null && x.lift   > -9) s.liftMax   = (s.liftMax   == null) ? x.lift   : Math.max(s.liftMax,   x.lift);
    if (x.spread != null && x.spread >  0) s.spreadMax = (s.spreadMax == null) ? x.spread : Math.max(s.spreadMax, x.spread);
    if (x.drop   != null && x.drop   >  0) s.dropMax   = (s.dropMax   == null) ? x.drop   : Math.max(s.dropMax,   x.drop);
    if (x.ecc) eccs.push(x.ecc);
    if (x.con) cons.push(x.con);
    if (x.ms)  durs.push(x.ms);
  }
  s.avgScore = Math.round(sum / r.length);
  s.quality  = Math.round((s.valid / r.length) * 100);
  s.ecc = eccs.length ? TR.mean(eccs) : null;
  s.con = cons.length ? TR.mean(cons) : null;

  /* Konsistensi ialah irama, bukan kedalaman: sisihan piawai tempoh rep
     berbanding min. Set yang bermula pantas dan hancur pada penghujungnya
     mendapat markah rendah di sini walaupun setiap rep sah. */
  if (durs.length >= 3) {
    var mu = TR.mean(durs), v = 0;
    for (i = 0; i < durs.length; i++) v += (durs[i] - mu) * (durs[i] - mu);
    var cv = Math.sqrt(v / durs.length) / (mu || 1);
    s.consistency = Math.max(0, Math.min(100, Math.round(100 - cv * 180)));
  } else {
    /* Dua rep tidak mempunyai irama untuk diukur. Melaporkan 100 di sini ialah
       pepijat sebenar yang ditemui dalam Wall Ball Lab: set kosong mendapat
       markah kerana konsistensi lalai kepada sempurna. */
    s.consistency = 0;
  }

  var g = Math.round(s.quality * 0.6 + s.avgScore * 0.25 + s.consistency * 0.15);
  s.overall = g;
  s.grade = g >= TR.CFG.gradeA ? 'A' : g >= TR.CFG.gradeB ? 'B' : g >= TR.CFG.gradeC ? 'C' : 'D';
  s.headline = TR.headline(s);
  return s;
};

TR.mean = function (a) {
  var t = 0, i; for (i = 0; i < a.length; i++) t += a[i];
  return a.length ? t / a.length : 0;
};

/* Satu ayat, dalam bahasa jurulatih, tanpa jargon. Tiada simbol darjah di
   sini — nombor teknikal ada tempatnya, dan ia bukan baris pertama. */
TR.headline = function (s) {
  if (!s.total) return 'No reps recorded.';
  if (s.valid === s.total) return 'All ' + s.total + ' reps counted. Clean set.';
  var lost = s.total - s.valid;
  return s.valid + ' of ' + s.total + ' reps counted — ' +
         lost + ' would not stand up on a judged floor.';
};

/* SATU keutamaan. Diambil daripada sebab yang paling kerap berulang, kerana
   perkara yang berlaku sembilan kali ialah tabiat dan yang berlaku sekali
   ialah gelinciran. */
TR.fixFirst = function (s) {
  var def = TR.EX[s.key] || {}, cue = def.cue || {}, form = def.form || {};
  if (!s.total) return { title: 'Nothing measured', body: 'Set the phone so your whole body is in frame, then try again.' };

  var top = null, topN = 0, k;
  for (k in s.reasons) if (s.reasons.hasOwnProperty(k) && s.reasons[k] > topN) { top = k; topN = s.reasons[k]; }

  if (top && topN >= Math.max(2, Math.ceil(s.total * 0.25))) {
    var body = cue[top] || cue.shallow || 'Work on your range of motion.';
    var title = top === 'shallow' ? 'Depth'
              : top === 'low' ? 'Height'
              : top === 'no-jump' ? 'Get off the floor'
              : top === 'no-plank' ? 'Full burpee'
              : top === 'no-reach' ? 'Finish standing tall'
              : top === 'narrow' ? 'Full arm range' : 'Range of motion';
    return { title: title, body: body + ' It cost you ' + topN + ' rep' + (topN > 1 ? 's' : '') + ' in this set.' };
  }
  if (s.sagMax != null && form.sagMax && s.sagMax > form.sagMax)
    return { title: 'Hips', body: cue.sag || 'Keep a straight line from shoulder to ankle.' };
  if (s.leanMax != null && form.leanMax && s.leanMax > form.leanMax)
    return { title: 'Torso', body: cue.lean || 'Stay more upright.' };
  if (s.symMax != null && form.symMax && s.symMax > form.symMax)
    return { title: 'Left and right', body: cue.sym || 'One side is working harder than the other.' };
  if (s.consistency && s.consistency < 55)
    return { title: 'Pacing', body: 'Your rep speed drifted through the set. Pick a rhythm you can hold and stay on it.' };
  return { title: 'Nothing to fix', body: 'Form held up across the set. Add reps or slow the lowering phase to make it harder.' };
};
