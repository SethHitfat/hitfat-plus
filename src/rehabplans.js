   Joint-by-joint prehab. Built with the same PLAN() generator, but the day
   pools are named explicitly instead of filtered by type — for prehab, which
   exercise appears matters more than which pattern it belongs to.

   goal:'Recovery' is what the Recovery activity tile now matches on. Before
   this it matched a name regex, which quietly swept up chair workouts,
   "Beginner Foundations" and even "BAR Foundations" — none of which are
   recovery work.                                                           */

function REHAB_PLAN(s){
  const weeks=[];
  for(let w=0; w<s.wk; w++){
    weeks.push({days:s.days.map(d=>{
      if(d.rest) return {rest:true};
      const pool=d.pool||[];
      return {name:d.n, ex:pickN(pool, Math.min(d.c||5, pool.length), w)};
    })});
  }
  return {id:s.id, name:s.name, goal:'Recovery', level:s.level, dur:s.dur, rounds:s.rounds||2,
          c1:s.c1, c2:s.c2, ac:s.ac, icon:s.icon, desc:s.desc, rehab:true, weeks};
}

const RH_C1='#0f1f22', RH_C2='#07090a', RH_AC='#38bdf8';

const REHAB_PLANS=[
  REHAB_PLAN({id:'rh1', name:'Knee Prehab', level:'Beginner', dur:18, wk:4,
    c1:RH_C1, c2:RH_C2, ac:RH_AC, icon:'🦵',
    desc:'Four weeks of controlled work around the knee — quad control, calf strength and slow eccentrics. For building resilience before stairs and squats start to complain.',
    days:[{n:'Quad Control',  pool:rehabFor('Knee'),  c:6},
          {n:'Ankle & Calf',  pool:rehabFor('Ankle'), c:5},
          {rest:true},
          {n:'Knee & Hip',    pool:rehabFor('Knee').concat(rehabFor('Hip')), c:6},
          {n:'Balance',       pool:rehabFor('Ankle').concat(rehabFor('Knee')), c:5},
          {rest:true},{rest:true}]}),

  REHAB_PLAN({id:'rh2', name:'Shoulder Prehab', level:'Beginner', dur:18, wk:4,
    c1:RH_C1, c2:RH_C2, ac:RH_AC, icon:'💪',
    desc:'Scapular control, rotator work and the chest range that pressing takes away. Four weeks, three sessions a week, a towel is all you need.',
    days:[{n:'Scapular Control', pool:rehabFor('Shoulder'), c:6},
          {rest:true},
          {n:'Rotator Work',     pool:rehabFor('Shoulder'), c:6},
          {rest:true},
          {n:'Range & Posture',  pool:rehabFor('Shoulder').concat(rehabFor('Spine')), c:6},
          {rest:true},{rest:true}]}),

  REHAB_PLAN({id:'rh3', name:'Hip & Lower Back', level:'Beginner', dur:20, wk:4,
    c1:RH_C1, c2:RH_C2, ac:RH_AC, icon:'🧘',
    desc:'The pair that usually go together. Glute strength, hip range and the spine work that stops a desk job settling into your lower back.',
    days:[{n:'Glute Strength', pool:rehabFor('Hip'), c:6},
          {n:'Spine Control',  pool:rehabFor('Spine'), c:6},
          {rest:true},
          {n:'Hip Range',      pool:rehabFor('Hip'), c:6},
          {n:'Full Reset',     pool:rehabFor('Hip').concat(rehabFor('Spine')), c:6},
          {rest:true},{rest:true}]}),

  REHAB_PLAN({id:'rh4', name:'Daily Mobility 10', level:'Beginner', dur:10, wk:2,
    c1:RH_C1, c2:RH_C2, ac:RH_AC, icon:'🌿',
    desc:'Ten minutes, every day, every joint. The one to start with if you are not sure which of these you need.',
    days:[{n:'Hips & Spine',   pool:rehabFor('Hip').concat(rehabFor('Spine')), c:4},
          {n:'Shoulders',      pool:rehabFor('Shoulder'), c:4},
          {n:'Knees & Ankles', pool:rehabFor('Knee').concat(rehabFor('Ankle')), c:4},
          {n:'Full Body',      pool:rehabFor('Spine').concat(rehabFor('Hip'),rehabFor('Shoulder')), c:4},
          {n:'Hips & Spine',   pool:rehabFor('Spine').concat(rehabFor('Hip')), c:4},
          {n:'Easy Flow',      pool:rehabFor('Spine'), c:4},
          {rest:true}]}),

  REHAB_PLAN({id:'rh5', name:'Desk Reset', level:'Beginner', dur:12, wk:3,
    c1:RH_C1, c2:RH_C2, ac:RH_AC, icon:'💻',
    desc:'Built for eight hours in a chair. Neck, mid back, hip flexors and the shoulders that round forward by four in the afternoon.',
    days:[{n:'Neck & Mid Back', pool:rehabFor('Spine'), c:5},
          {n:'Hip Flexors',     pool:rehabFor('Hip'), c:5},
          {n:'Shoulders',       pool:rehabFor('Shoulder'), c:5},
          {rest:true},
          {n:'Full Reset',      pool:rehabFor('Spine').concat(rehabFor('Hip')), c:5},
          {rest:true},{rest:true}]}),

  REHAB_PLAN({id:'rh6', name:'Post-Workout Recovery', level:'Beginner', dur:12, wk:2,
    c1:RH_C1, c2:RH_C2, ac:RH_AC, icon:'🌙',
    desc:'What to do on the days between hard sessions. Range, blood flow and controlled positions — not another workout in disguise.',
    days:[{n:'Lower Body',  pool:rehabFor('Hip').concat(rehabFor('Knee')), c:5},
          {n:'Upper Body',  pool:rehabFor('Shoulder').concat(rehabFor('Spine')), c:5},
          {rest:true},
          {n:'Full Body',   pool:rehabFor('Hip').concat(rehabFor('Shoulder'),rehabFor('Ankle')), c:5},
          {n:'Wind Down',   pool:rehabFor('Spine'), c:5},
          {rest:true},{rest:true}]})
];

/* Recovery leads the list — it is the section people arrive looking for. */
PROGRAMS = REHAB_PLANS.concat(PROGRAMS);


/* ═══════════════ MONTHLY CHALLENGE ═══════════════
