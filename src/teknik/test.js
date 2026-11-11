/* test.js — Semak Teknik: piawaian beginner di atas enjin (jsc). */
load('engine/b_config.js'); load('engine/d_geom.js'); load('engine/e_detect.js'); load('t_judge.js');
var pass = 0, fail = 0, F = [];
function ok(n, c, x) { if (c) pass++; else { fail++; F.push(n + (x ? '  → ' + x : '')); } }
var CLOCK = 1e6; TR.now = function () { return CLOCK; };
function P(x, y) { return { x: x, y: y, s: 1 }; }
function lerp(a, b, t) { return a + (b - a) * t; }
function bodySquat(t, lean) {
  var hipY = lerp(0.55, 0.83, t), kneeY = lerp(0.75, 0.74, t), kneeX = lerp(0.50, 0.57, t);
  var shY = lerp(0.30, 0.60, t), shX = lerp(0.50, 0.50 + (lean || 0), t);
  return { nose: P(shX, shY - 0.10), lsh: P(shX - 0.06, shY), rsh: P(shX + 0.06, shY),
    lel: P(shX - 0.09, shY + 0.12), rel: P(shX + 0.09, shY + 0.12), lwr: P(shX - 0.10, shY + 0.24), rwr: P(shX + 0.10, shY + 0.24),
    lhip: P(0.46, hipY), rhip: P(0.54, hipY), lknee: P(kneeX - 0.04, kneeY), rknee: P(kneeX + 0.04, kneeY),
    lank: P(0.46, 0.92), rank: P(0.54, 0.92), lheel: null, rheel: null, lfoot: null, rfoot: null };
}
TK.tune();
function runSquats(depth, downMs, n, lean) {
  TR.Calib.reset(); var d = TR.Detector.create('squat'), reps = [], i, f, ev, k;
  for (i = 0; i < 25; i++) { d.feed(bodySquat(0)); CLOCK += 33; }
  var fr = Math.round(downMs / 33);
  for (k = 0; k < n; k++) {
    for (f = 0; f <= fr; f++) { d.feed(bodySquat(depth * f / fr, lean)); CLOCK += 33; }
    for (f = fr; f >= 0; f--) { ev = d.feed(bodySquat(depth * f / fr, lean)); CLOCK += 33;
      for (i = 0; i < ev.length; i++) if (ev[i].t === 'rep') { ev[i].rep.issues = TK.check('squat', ev[i].rep); reps.push(ev[i].rep); } }
    for (f = 0; f < 15; f++) { d.feed(bodySquat(0)); CLOCK += 33; }
  }
  return reps;
}
var a = runSquats(1, 1500, 5);
ok('5 deep slow squats are 5 reps', a.length === 5, a.length);
ok('...all clean', a.every(function (r) { return !r.issues.length; }), JSON.stringify(a.map(function (r) { return r.issues; })));
var s = TK.summary('squat', a);
ok('...summary cantik 5/5, no focus', s.good === 5 && s.level === 'cantik' && s.focus === null, JSON.stringify(s));
var b = runSquats(0.55, 1500, 5);
ok('a half-depth beginner squat still exists as a rep', b.length === 5, b.length);
ok('...and is told to go lower', b.length && b[0].issues[0].indexOf('dalam') === 0, JSON.stringify(b[0] && b[0].issues) + ' hk=' + (b[0] && b[0].hipKnee) + ' k=' + (b[0] && b[0].kneeMin));
var c = runSquats(1, 400, 5);
ok('fast lowering is flagged', c.length === 5 && c[0].issues.indexOf('laju') > -1, JSON.stringify(c[0] && c[0].issues) + ' ecc=' + (c[0] && c[0].ecc));
var sc = TK.summary('squat', c);
ok('...focus is control', sc.focus === 'laju' && sc.good === 0 && sc.level === 'betulkan', JSON.stringify(sc.focus));
/* standing still never makes reps */
TR.Calib.reset(); var dz = TR.Detector.create('squat'), ghost = 0, i;
for (i = 0; i < 300; i++) { var j = bodySquat(0.06 * Math.sin(i / 3)); var ev = dz.feed(j); CLOCK += 33; ev.forEach(function (e) { if (e.t === 'rep') ghost++; }); }
ok('standing and swaying makes no reps', ghost === 0, ghost);
/* pure judge checks */
ok('pushup shallow', TK.check('pushup', { elbowMin: 140 })[0] === 'siku');
ok('pushup near', TK.check('pushup', { elbowMin: 118 })[0] === 'siku_sikit');
ok('pushup sag', TK.check('pushup', { elbowMin: 90, sag: 0.4, ecc: 1 }).join() === 'pinggul');
ok('lunge clean', TK.check('lunge', { kneeMin: 100, lean: 10, ecc: 1 }).length === 0);
ok('burpee no plank', TK.check('burpee', { reason: 'no-plank' })[0] === 'plank');
ok('burpee no reach', TK.check('burpee', { reason: 'no-reach' })[0] === 'tangan');
var mix = TK.summary('squat', [{ issues: ['dalam_sikit'] }, { issues: ['dalam'] }, { issues: [] }, { issues: ['dada'] }, { issues: [] }]);
ok('far-from-depth advice wins over near', mix.focus === 'dalam' && mix.rows[0].miss === 2 && mix.good === 2 && mix.level === 'betulkan', JSON.stringify(mix.focus));
ok('every issue has words', Object.keys(TK.ISU).every(function (k) { var x = TK.ISU[k]; return x.cue && x.title && x.body; }));
ok('every row code has words', TK.ORDER.every(function (k) { return TK.EX[k].rows.every(function (r) { return r[1].every(function (c) { return !!TK.ISU[c]; }); }); }));
ok('engine cues silenced (no English)', TK.ORDER.every(function (k) { return Object.keys(TR.EX[k].cue).length === 0; }));
ok('knee pushup line uses the knee', (function () { TK.setVariant('lutut'); var m = { sh: P(0.3, 0.5), hip: P(0.5, 0.55), knee: P(0.7, 0.6), ank: P(0.8, 0.4), torso: 0.2 }; var v = TR.sag(m); TK.setVariant(''); return v < 0.05 && TR.sag(m) > 0.3; })());
ok('getting down to the floor is not a push up', !TK.accept('pushup', { lean: 27 }) && TK.accept('pushup', { lean: 108 }) && TK.accept('squat', { lean: 27 }));
ok('burpee: arms overhead not required', TR.EX.burpee.judge.requireReach === false);
print((fail ? 'UJIAN GAGAL ' : 'LULUS ') + pass + '/' + (pass + fail));
F.forEach(function (x) { print('  ✗ ' + x); });
