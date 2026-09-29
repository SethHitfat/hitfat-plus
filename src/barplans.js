/* ═══════════════ HITFAT BAR · programs ═══════════════
   Built from BAR_DB with the same PLAN() generator the rest of the app uses,
   so they behave identically — same day shape, same weekly rotation, same
   deterministic pick. bar:true keeps them free and out of the paid catalogue,
   because the bar itself is the product; these sessions sell it.          */

const BAR_PLANS=[

  /* Designed around the twenty-four movements that are actually filmed, not
     around the fifty-seven in the library. Every day carries filmed:true, so a
     session never sends someone to a card that says "clip coming soon".

     That constraint also decides which programs exist. The filmed set is
     twelve upper-body movements against seven for legs, so an upper-body block
     is well supported and a lower-body one would repeat the same four squats
     every week. It is missing on purpose until the legs are shot. */

  PLAN({id:'bar1', name:'BAR Foundations', goal:'Strength', level:'Beginner', dur:20, wk:2,
    c1:'#241a12', c2:'#0b0906', ac:'#FF8A1E', icon:'🏋️', bar:true, rounds:3,
    desc:'Two weeks to learn what the bar does. Squat, hinge, press, row — light bands, '+
         'slow reps, nothing you have to be fit to start.',
    days:[
      {n:'Squat & Hinge',   t:['squat','hinge'], eq:BAR_EQ, filmed:true, c:4},
      {rest:true},
      {n:'Press & Row',     t:['push','pull'],   eq:BAR_EQ, filmed:true, c:4},
      {rest:true},
      {n:'Whole Body',      t:['full','squat','pull'], eq:BAR_EQ, filmed:true, c:4},
      {rest:true},{rest:true}]}),

  PLAN({id:'bar2', name:'BAR Full Body', goal:'Strength', level:'All levels', dur:30, wk:4,
    c1:'#2a1608', c2:'#0b0906', ac:'#F97316', icon:'🔥', bar:true, rounds:3,
    desc:'Three sessions a week, every pattern each time. The one to run if you own the '+
         'bar and want a single programme to stay on.',
    days:[
      {n:'Full Body A', t:['squat','push','pull'],  eq:BAR_EQ, filmed:true, c:6},
      {rest:true},
      {n:'Full Body B', t:['hinge','push','pull'],  eq:BAR_EQ, filmed:true, c:6},
      {rest:true},
      {n:'Full Body C', t:['full','lunge','core'],  eq:BAR_EQ, filmed:true, c:6},
      {rest:true},{rest:true}]}),

  PLAN({id:'bar3', name:'BAR Upper Body', goal:'Strength', level:'Intermediate', dur:25, wk:4,
    c1:'#1b1626', c2:'#0a0910', ac:'#A78BFA', icon:'💪', bar:true, rounds:3,
    desc:'Shoulders, back and arms. The bands are at their best here — constant tension '+
         'through the whole range, which is exactly what these muscles want.',
    days:[
      {n:'Press',          t:['push'], eq:BAR_EQ, filmed:true, c:5},
      {rest:true},
      {n:'Pull',           t:['pull'], eq:BAR_EQ, filmed:true, c:5},
      {rest:true},
      {n:'Shoulders & Arms', t:['push','pull'], m:['Shoulders','Arms'],
                           eq:BAR_EQ, filmed:true, c:6},
      {rest:true},{rest:true}]}),

  PLAN({id:'bar4', name:'BAR Conditioning', goal:'Fat Loss', level:'Intermediate', dur:20, wk:3,
    c1:'#2a0f14', c2:'#0b0708', ac:'#EF4444', icon:'⚡', bar:true, rounds:4,
    desc:'Four rounds, short rests, movements that use the whole body at once. Thrusters '+
         'and clean presses — you will be breathing hard by round two.',
    days:[
      {n:'Circuit A', t:['full','squat'], eq:BAR_EQ, filmed:true, c:5},
      {rest:true},
      {n:'Circuit B', t:['full','pull','core'], eq:BAR_EQ, filmed:true, c:5},
      {rest:true},
      {n:'Circuit C', t:['full','hinge','push'], eq:BAR_EQ, filmed:true, c:5},
      {rest:true},{rest:true}]}),

  PLAN({id:'bar5', name:'BAR Express 15', goal:'Fat Loss', level:'All levels', dur:15, wk:2,
    c1:'#0f1b26', c2:'#080b0f', ac:'#38BDF8', icon:'⏱️', bar:true, rounds:3,
    desc:'Fifteen minutes, four movements, no set-up beyond stepping on the bands. For '+
         'the days that would otherwise be a rest day by accident.',
    days:[
      {n:'Express A', t:['squat','push'],  eq:BAR_EQ, filmed:true, c:4},
      {n:'Express B', t:['hinge','pull'],  eq:BAR_EQ, filmed:true, c:4},
      {rest:true},
      {n:'Express C', t:['full','core'],   eq:BAR_EQ, filmed:true, c:4},
      {n:'Express D', t:['push','pull'],   eq:BAR_EQ, filmed:true, c:4},
      {rest:true},{rest:true}]})
];

/* ── SIGNATURE · the flagship paid programs ──
   Longer, harder and coach-led. These are the ones the store leads with. */
const SIG_PLANS=[
  PLAN({id:'sig1', name:'HITFAT Transformation', goal:'Fat Loss', level:'Intermediate', dur:35, wk:12,
    c1:'#2a1016', c2:'#0b0b0d', ac:'#EF4444', icon:'✦', special:true,
    desc:'Twelve weeks, five days a week, the full method. Training, structure and progression in one plan — the programme HITFAT is built on.',
    days:[{n:'Full Body Power',t:['full','squat'],c:7},
          {n:'Upper Strength',t:['push','pull'],c:7},
          {n:'Conditioning',t:['full','core'],c:7},
          {rest:true},
          {n:'Lower Strength',t:['squat','hinge','lunge'],c:7},
          {n:'Core & Finisher',t:['core','full'],c:6},
          {rest:true}]}),

  PLAN({id:'sig2', name:'HITFAT Strong', goal:'Strength', level:'Advanced', dur:40, wk:8,
    c1:'#2a1016', c2:'#0b0b0d', ac:'#EF4444', icon:'✦', special:true,
    desc:'Eight weeks built around getting genuinely stronger. Heavier, slower, fewer reps — and a lot more demanding than it looks on paper.',
    days:[{n:'Squat Day',t:['squat'],c:6},
          {n:'Press Day',t:['push'],c:6},
          {rest:true},
          {n:'Pull Day',t:['pull'],c:6},
          {n:'Hinge Day',t:['hinge','lunge'],c:6},
          {n:'Accessory',t:['core','full'],c:6},
          {rest:true}]}),

  PLAN({id:'sig3', name:'HITFAT Reset 21', goal:'Fat Loss', level:'Beginner', dur:25, wk:3,
    c1:'#2a1016', c2:'#0b0b0d', ac:'#EF4444', icon:'✦', special:true,
    desc:'Twenty-one days to get the habit back. Built for the restart after a long break, not for someone already training five days a week.',
    days:[{n:'Move',t:['full'],c:5},
          {n:'Lower',t:['squat','lunge'],c:5},
          {n:'Upper',t:['push','pull'],c:5},
          {rest:true},
          {n:'Full Body',t:['full','core'],c:5},
          {n:'Core',t:['core'],c:5},
          {rest:true}]}),

  PLAN({id:'sig4', name:'HITFAT Lean 8', goal:'Fat Loss', level:'Intermediate', dur:30, wk:8,
    c1:'#2a1016', c2:'#0b0b0d', ac:'#EF4444', icon:'✦', special:true,
    desc:'Eight weeks aimed squarely at losing fat while keeping the muscle you already have. Five sessions a week, no filler days.',
    days:[{n:'Full Body Burn',t:['full','squat'],c:7},
          {n:'Upper',t:['push','pull'],c:7},
          {n:'Intervals',t:['full','core'],c:7},
          {rest:true},
          {n:'Lower',t:['squat','hinge','lunge'],c:7},
          {n:'Core & Conditioning',t:['core','full'],c:6},
          {rest:true}]})
];

/* PLAN() only copies the fields it knows about, so re-apply the two flags. */
BAR_PLANS.forEach(p => { p.bar = true; });
SIG_PLANS.forEach(p => { p.special = true; });

/* Signature first — they lead every list — then the bar sessions. */
PROGRAMS = SIG_PLANS.concat(BAR_ENABLED ? BAR_PLANS : [], PROGRAMS);


