/* ═══════════════ PLANS ═══════════════
   Multi-week plans are generated from the exercise library instead of being typed
   out day by day: a plan is a 7-day shape, repeated, with the exercise pick
   rotating each week so week 4 is not week 1. Selection is deterministic — the
   same plan always contains the same sessions, on every device, forever.       */

function exNames(f){
  const seen={}, out=[];
  DB.forEach(e=>{ if(f(e) && !seen[e.n]){ seen[e.n]=1; out.push(e.n); } });
  return out;
}
/* pick n names from a pool, offset by the week, wrapping — no randomness */
function pickN(pool,n,offset){
  if(!pool.length) return [];
  const out=[];
  for(let i=0;i<n;i++) out.push(pool[(offset*3+i)%pool.length]);
  return out;
}
function dayPool(d){
  return exNames(e=>{
    if(d.eq && e.eq!==d.eq) return false;
    /* The HITFAT BAR and Recovery libraries are opt-in. They were concatenated
       onto DB so the player and search find them, and that quietly poisoned
       every generic plan: "HITFAT Strong" at RM69 filled up with Bar Pendlay
       Rows and "Bodyweight Strength" started prescribing Child's Pose — both
       unfilmed, both the wrong program. A plan gets them only by asking for
       them by equipment. */
    if(e.eq===BAR_EQ && d.eq!==BAR_EQ) return false;
    /* The prehab moves are tagged Bodyweight, Chair and Towel, so gating them
       on d.eq missed them entirely — "Bodyweight Strength" asked for bodyweight
       and got Child's Pose. They carry a joint (e.j) and nothing else does, so
       that is the flag. REHAB_PLAN builds its days from named pools and never
       calls this, so excluding them here costs the recovery programs nothing. */
    if(e.j) return false;
    if(d.t   && d.t.indexOf(e.t)<0) return false;
    if(d.m   && d.m.indexOf(e.m)<0) return false;
    return true;
  });
}
/* Expand {days:[7 templates], weeks:N} into the weeks/days shape the app renders. */
function PLAN(s){
  const weeks=[];
  for(let w=0;w<s.wk;w++){
    weeks.push({days:s.days.map(d=>{
      if(d.rest) return {rest:true};
      // if the equipment filter empties the pool, keep the movement pattern and
      // drop the equipment rather than shipping a day with one filler exercise
      let pool=dayPool(d);
      if(pool.length<(d.c||5)) pool=dayPool({t:d.t,m:d.m});
      if(!pool.length)         pool=dayPool({t:d.t});
      if(!pool.length)         pool=exNames(e=>e.eq==='Bodyweight');
      const ex=pickN(pool, d.c||5, w);
      return {name:d.n, ex};
    })});
  }
  return {id:s.id,name:s.name,goal:s.goal,level:s.level,dur:s.dur,rounds:s.rounds||3,
          c1:s.c1,c2:s.c2,ac:s.ac,icon:s.icon,desc:s.desc,weeks};
}

const BW='Bodyweight';
const NEW_PLANS=[
  PLAN({id:'fl30', name:'30-Day Fat Loss', goal:'Fat Loss', level:'Beginner', dur:20, wk:5,
    c1:'#3a1f1f', c2:'#0d0808', ac:'#FF3B30', icon:'🔥',
    desc:'Five weeks of short, sweaty sessions you can do in a living room. No equipment, no excuses — just show up on the days marked.',
    days:[{n:'Full Body Burn',t:['cardio','squat','push'],eq:BW,c:6},
          {n:'Lower Body',t:['squat','lunge','hinge'],eq:BW,c:5},
          {rest:true},
          {n:'Core & Cardio',t:['core','cardio'],eq:BW,c:6},
          {n:'Upper Body',t:['push'],eq:BW,c:5},
          {n:'Sweat Finisher',t:['cardio','jump'],eq:BW,c:6},
          {rest:true}]}),

  PLAN({id:'lad4', name:'Ladies Beginner', goal:'Fat Loss', level:'Beginner', dur:16, wk:4,
    c1:'#3a1f2d', c2:'#0d080b', ac:'#FF2D78', icon:'🌸',
    desc:'A gentle four-week start. Low impact, nothing jumpy, and every session scales down if today is a hard day.',
    days:[{n:'Move & Warm Up',t:['squat','core'],eq:BW,c:5},
          {rest:true},
          {n:'Legs & Glutes',t:['squat','lunge','hinge'],eq:BW,c:5},
          {rest:true},
          {n:'Arms & Core',t:['push','core'],eq:BW,c:5},
          {n:'Easy Full Body',t:['squat','push','core'],eq:'Chair',c:5},
          {rest:true}]}),

  PLAN({id:'men6', name:"Men's Body Reset", goal:'Strength', level:'Intermediate', dur:28, wk:6,
    c1:'#16273a', c2:'#080b0d', ac:'#2EA8FF', icon:'⚙️',
    desc:'Six weeks to rebuild a base. Push, pull, legs and conditioning — the split that has worked for fifty years.',
    days:[{n:'Push',t:['push'],eq:'Dumbbell',c:6},
          {n:'Legs',t:['squat','lunge','hinge'],eq:'Dumbbell',c:6},
          {rest:true},
          {n:'Pull & Arms',t:['push','hinge'],eq:'Dumbbell',c:6},
          {n:'Conditioning',t:['cardio','jump'],eq:BW,c:6},
          {n:'Full Body',t:['squat','push','core'],eq:'Dumbbell',c:6},
          {rest:true}]}),

  PLAN({id:'f40', name:'Fit After 40', goal:'Strength', level:'Beginner', dur:22, wk:6,
    c1:'#2a1830', c2:'#0d0610', ac:'#C16BFF', icon:'🌿',
    desc:'Built around joints, not ego. Chair-supported strength, controlled tempo and real rest days — six weeks of getting stronger without getting sore.',
    days:[{n:'Strength & Support',t:['squat','push'],eq:'Chair',c:5},
          {rest:true},
          {n:'Stability & Core',t:['core','hold'],eq:BW,c:5},
          {rest:true},
          {n:'Standing Strength',t:['squat','lunge','hinge'],eq:BW,c:5},
          {n:'Easy Movement',t:['core','hold'],eq:'Chair',c:5},
          {rest:true}]}),

  PLAN({id:'core14', name:'14-Day Core', goal:'Core', level:'Beginner', dur:12, wk:2,
    c1:'#16302d', c2:'#080d0c', ac:'#00D9C0', icon:'💎',
    desc:'Two weeks, twelve minutes a day, one job: a midsection that holds you together. Floor work only.',
    days:[{n:'Core Basics',t:['core'],eq:BW,c:5},
          {n:'Holds',t:['hold'],eq:BW,c:4},
          {n:'Obliques',t:['core'],eq:BW,c:5},
          {rest:true},
          {n:'Lower Abs',t:['core'],eq:BW,c:5},
          {n:'Full Core',t:['core','hold'],eq:BW,c:6},
          {rest:true}]}),

  PLAN({id:'bws8', name:'Bodyweight Strength', goal:'Strength', level:'Intermediate', dur:26, wk:8,
    c1:'#1a3322', c2:'#080d0a', ac:'#1FD655', icon:'🤸',
    desc:'Eight weeks of calisthenics progression. Push-ups, squats, lunges and holds — the same movements, harder every fortnight.',
    days:[{n:'Push Strength',t:['push'],eq:BW,c:6},
          {n:'Leg Strength',t:['squat','lunge'],eq:BW,c:6},
          {rest:true},
          {n:'Core & Holds',t:['core','hold'],eq:BW,c:6},
          {n:'Power',t:['jump'],eq:BW,c:5},
          {n:'Full Body',t:['push','squat','core'],eq:BW,c:7},
          {rest:true}]}),

  PLAN({id:'hiit4', name:'Home HIIT', goal:'Fat Loss', level:'Intermediate', dur:18, wk:4,
    c1:'#3a2a18', c2:'#0d0a06', ac:'#FF6B00', icon:'⚡',
    desc:'Four weeks of intervals in a space the size of a towel. Hard for eighteen minutes, then done.',
    days:[{n:'Intervals',t:['cardio','jump'],eq:BW,c:6},
          {rest:true},
          {n:'Tabata Legs',t:['squat','jump'],eq:BW,c:6},
          {n:'Full Body HIIT',t:['cardio','push','squat'],eq:BW,c:7},
          {rest:true},
          {n:'Finisher',t:['cardio','core'],eq:BW,c:6},
          {rest:true}]}),

  PLAN({id:'min3', name:'Towel & Bottle', goal:'Strength', level:'Beginner', dur:18, wk:3,
    c1:'#1a2a30', c2:'#06100d', ac:'#33C9D6', icon:'🧴',
    desc:'Three weeks using what is already in your house — two bottles and a towel. Proof that equipment was never the reason.',
    days:[{n:'Bottle Upper',t:['push'],eq:'Bottle',c:6},
          {n:'Towel Full Body',t:['squat','push','core'],eq:'Towel',c:6},
          {rest:true},
          {n:'Bottle Core',t:['core'],eq:'Bottle',c:5},
          {n:'Towel Legs',t:['squat','lunge'],eq:'Towel',c:6},
          {rest:true},
          {rest:true}]}),

  PLAN({id:'am21', name:'Morning 10', goal:'Fat Loss', level:'Beginner', dur:10, wk:3,
    c1:'#2a2118', c2:'#0d0a06', ac:'#FF8A1E', icon:'☀️',
    desc:'Twenty-one mornings, ten minutes each. This one is not about the workout — it is about becoming a person who trains before the day starts.',
    days:[{n:'Wake Up',t:['cardio'],eq:BW,c:4},
          {n:'Quick Legs',t:['squat'],eq:BW,c:4},
          {n:'Quick Core',t:['core'],eq:BW,c:4},
          {n:'Quick Upper',t:['push'],eq:BW,c:4},
          {n:'Quick Full Body',t:['squat','push','core'],eq:BW,c:5},
          {n:'Easy Move',t:['hold','core'],eq:BW,c:4},
          {rest:true}]}),

  PLAN({id:'reset12', name:'Full Body Reset', goal:'Strength', level:'Intermediate', dur:32, wk:12,
    c1:'#2a1f3a', c2:'#0b080d', ac:'#A855F7', icon:'🏛️',
    desc:'The long one. Twelve weeks, four sessions a week, every muscle and every energy system. Start it when you are ready to finish it.',
    days:[{n:'Lower Power',t:['squat','lunge','jump'],eq:'Kettlebell',c:6},
          {rest:true},
          {n:'Upper Strength',t:['push'],eq:'Dumbbell',c:6},
          {n:'Conditioning',t:['cardio'],eq:BW,c:6},
          {rest:true},
          {n:'Full Body',t:['squat','push','hinge','core'],eq:'Kettlebell',c:7},
          {rest:true}]})
];

/* New plans lead the catalogue — they are the ones built for this audience. */
PROGRAMS = NEW_PLANS.concat(PROGRAMS);


