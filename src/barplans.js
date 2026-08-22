/* ═══════════════ HITFAT BAR · programs ═══════════════
   Built from BAR_DB with the same PLAN() generator the rest of the app uses,
   so they behave identically — same day shape, same weekly rotation, same
   deterministic pick. bar:true keeps them free and out of the paid catalogue,
   because the bar itself is the product; these sessions sell it.          */

const BAR_PLANS=[
  PLAN({id:'bar1', name:'BAR Foundations', goal:'Strength', level:'Beginner', dur:20, wk:2,
    c1:'#241a12', c2:'#0b0906', ac:'#FF8A1E', icon:'🏋️', bar:true,
    desc:'Two weeks to learn the five patterns the bar is built around — squat, hinge, press, row, carry. Light bands, clean technique.',
    days:[{n:'Squat & Hinge',t:['squat','hinge'],eq:BAR_EQ,c:5},
          {n:'Press & Pull',t:['push','pull'],eq:BAR_EQ,c:5},
          {rest:true},
          {n:'Full Body',t:['full','squat'],eq:BAR_EQ,c:5},
          {n:'Core & Carry',t:['core'],eq:BAR_EQ,c:4},
          {rest:true},{rest:true}]}),

  PLAN({id:'bar2', name:'BAR Full Body', goal:'Strength', level:'Intermediate', dur:28, wk:4,
    c1:'#241a12', c2:'#0b0906', ac:'#FF8A1E', icon:'🏋️', bar:true,
    desc:'Four weeks, four sessions a week, every session hitting the whole body. The band gets heavier as the weeks go.',
    days:[{n:'Push Focus',t:['push','core'],eq:BAR_EQ,c:6},
          {n:'Pull Focus',t:['pull','core'],eq:BAR_EQ,c:6},
          {rest:true},
          {n:'Legs',t:['squat','hinge','lunge'],eq:BAR_EQ,c:6},
          {n:'Full Body',t:['full'],eq:BAR_EQ,c:5},
          {rest:true},{rest:true}]}),

  PLAN({id:'bar3', name:'BAR Fat Loss', goal:'Fat Loss', level:'Intermediate', dur:24, wk:4,
    c1:'#241a12', c2:'#0b0906', ac:'#FF8A1E', icon:'🔥', bar:true,
    desc:'Short rest, big movements, five days a week. The bar keeps the load on while the heart rate stays up.',
    days:[{n:'Full Body Burn',t:['full','squat'],eq:BAR_EQ,c:6},
          {n:'Upper Circuit',t:['push','pull'],eq:BAR_EQ,c:6},
          {n:'Lower Circuit',t:['squat','hinge','lunge'],eq:BAR_EQ,c:6},
          {rest:true},
          {n:'Conditioning',t:['full','core'],eq:BAR_EQ,c:6},
          {n:'Core Finisher',t:['core'],eq:BAR_EQ,c:5},
          {rest:true}]}),

  PLAN({id:'bar4', name:'BAR Strength 6', goal:'Strength', level:'Intermediate', dur:32, wk:6,
    c1:'#241a12', c2:'#0b0906', ac:'#FF8A1E', icon:'💪', bar:true,
    desc:'Six weeks of heavier bands and lower reps. The closest a folding bar gets to a barbell block.',
    days:[{n:'Lower Strength',t:['squat','hinge'],eq:BAR_EQ,c:5},
          {n:'Upper Push',t:['push'],eq:BAR_EQ,c:5},
          {rest:true},
          {n:'Upper Pull',t:['pull'],eq:BAR_EQ,c:5},
          {n:'Posterior Chain',t:['hinge','lunge'],eq:BAR_EQ,c:5},
          {n:'Core',t:['core'],eq:BAR_EQ,c:4},
          {rest:true}]}),

  PLAN({id:'bar5', name:'BAR Express 15', goal:'Fat Loss', level:'Beginner', dur:15, wk:1,
    c1:'#241a12', c2:'#0b0906', ac:'#FF8A1E', icon:'⚡', bar:true,
    desc:'Fifteen minutes, five days. For the weeks where the only honest answer is "no time".',
    days:[{n:'Full Body 15',t:['full'],eq:BAR_EQ,c:4},
          {n:'Upper 15',t:['push','pull'],eq:BAR_EQ,c:4},
          {n:'Lower 15',t:['squat','hinge'],eq:BAR_EQ,c:4},
          {n:'Core 15',t:['core'],eq:BAR_EQ,c:4},
          {n:'Full Body 15',t:['full','lunge'],eq:BAR_EQ,c:4},
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
PROGRAMS = SIG_PLANS.concat(BAR_PLANS, PROGRAMS);


