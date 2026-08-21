   A bar loaded with resistance bands. The movement patterns are the barbell
   patterns — squat, hinge, press, row, carry — which is exactly why the bar
   sells: it is not a gimmick, it is a barbell that folds into a drawer.

   Every entry here has v:'' because none of these are filmed yet. The 310
   exercises already in DB are bodyweight, chair, towel, bottle, dumbbell and
   kettlebell — not one band among them. Labelling a dumbbell clip as a bar
   exercise would show the buyer a dumbbell, so these carry no clip at all and
   the player says so. Paste the Vimeo ids into v and they light up; nothing
   else has to change.                                                       */

const BAR_EQ='HITFAT BAR';
const BAR_DB=[
  /* ── hinge ── */
  {n:'Bar Deadlift',            v:'', sets:4, reps:10, m:'Back',      t:'hinge',  dur:50, eq:BAR_EQ},
  {n:'Bar Romanian Deadlift',   v:'', sets:3, reps:12, m:'Legs',      t:'hinge',  dur:45, eq:BAR_EQ},
  {n:'Bar Good Morning',        v:'', sets:3, reps:12, m:'Back',      t:'hinge',  dur:45, eq:BAR_EQ},
  {n:'Bar Sumo Deadlift',       v:'', sets:3, reps:10, m:'Legs',      t:'hinge',  dur:45, eq:BAR_EQ},
  {n:'Bar Hip Thrust',          v:'', sets:3, reps:15, m:'Legs',      t:'hinge',  dur:45, eq:BAR_EQ},
  {n:'Bar Pull Through',        v:'', sets:3, reps:15, m:'Legs',      t:'hinge',  dur:40, eq:BAR_EQ},

  /* ── squat ── */
  {n:'Bar Front Squat',         v:'', sets:4, reps:12, m:'Legs',      t:'squat',  dur:50, eq:BAR_EQ},
  {n:'Bar Back Squat',          v:'', sets:4, reps:12, m:'Legs',      t:'squat',  dur:50, eq:BAR_EQ},
  {n:'Bar Sumo Squat',          v:'', sets:3, reps:15, m:'Legs',      t:'squat',  dur:45, eq:BAR_EQ},
  {n:'Bar Split Squat',         v:'', sets:3, reps:10, m:'Legs',      t:'squat',  dur:45, eq:BAR_EQ},
  {n:'Bar Reverse Lunge',       v:'', sets:3, reps:12, m:'Legs',      t:'lunge',  dur:45, eq:BAR_EQ},
  {n:'Bar Forward Lunge',       v:'', sets:3, reps:12, m:'Legs',      t:'lunge',  dur:45, eq:BAR_EQ},
  {n:'Bar Step Through Lunge',  v:'', sets:3, reps:10, m:'Legs',      t:'lunge',  dur:45, eq:BAR_EQ},
  {n:'Bar Calf Raise',          v:'', sets:3, reps:20, m:'Legs',      t:'squat',  dur:40, eq:BAR_EQ},

  /* ── push ── */
  {n:'Bar Overhead Press',      v:'', sets:4, reps:10, m:'Shoulders', t:'push',   dur:45, eq:BAR_EQ},
  {n:'Bar Push Press',          v:'', sets:3, reps:10, m:'Shoulders', t:'push',   dur:45, eq:BAR_EQ},
  {n:'Bar Floor Press',         v:'', sets:4, reps:12, m:'Chest',     t:'push',   dur:45, eq:BAR_EQ},
  {n:'Bar Incline Press',       v:'', sets:3, reps:12, m:'Chest',     t:'push',   dur:45, eq:BAR_EQ},
  {n:'Bar Close Grip Press',    v:'', sets:3, reps:12, m:'Arms',      t:'push',   dur:45, eq:BAR_EQ},
  {n:'Bar Triceps Extension',   v:'', sets:3, reps:15, m:'Arms',      t:'push',   dur:40, eq:BAR_EQ},
  {n:'Bar Skull Crusher',       v:'', sets:3, reps:12, m:'Arms',      t:'push',   dur:40, eq:BAR_EQ},
  {n:'Bar Landmine Press',      v:'', sets:3, reps:10, m:'Shoulders', t:'push',   dur:45, eq:BAR_EQ},

  /* ── pull ── */
  {n:'Bar Bent Over Row',       v:'', sets:4, reps:12, m:'Back',      t:'pull',   dur:45, eq:BAR_EQ},
  {n:'Bar Pendlay Row',         v:'', sets:3, reps:10, m:'Back',      t:'pull',   dur:45, eq:BAR_EQ},
  {n:'Bar Upright Row',         v:'', sets:3, reps:12, m:'Shoulders', t:'pull',   dur:40, eq:BAR_EQ},
  {n:'Bar High Pull',           v:'', sets:3, reps:10, m:'Back',      t:'pull',   dur:45, eq:BAR_EQ},
  {n:'Bar Lat Pulldown',        v:'', sets:3, reps:15, m:'Back',      t:'pull',   dur:45, eq:BAR_EQ},
  {n:'Bar Pullover',            v:'', sets:3, reps:12, m:'Back',      t:'pull',   dur:45, eq:BAR_EQ},
  {n:'Bar Face Pull',           v:'', sets:3, reps:15, m:'Shoulders', t:'pull',   dur:40, eq:BAR_EQ},
  {n:'Bar Shrug',               v:'', sets:3, reps:15, m:'Back',      t:'pull',   dur:40, eq:BAR_EQ},
  {n:'Bar Bicep Curl',          v:'', sets:3, reps:15, m:'Arms',      t:'pull',   dur:40, eq:BAR_EQ},
  {n:'Bar Hammer Curl',         v:'', sets:3, reps:15, m:'Arms',      t:'pull',   dur:40, eq:BAR_EQ},
  {n:'Bar Reverse Curl',        v:'', sets:3, reps:12, m:'Arms',      t:'pull',   dur:40, eq:BAR_EQ},

  /* ── full body and conditioning ── */
  {n:'Bar Thruster',            v:'', sets:4, reps:12, m:'Full Body', t:'full',   dur:50, eq:BAR_EQ},
  {n:'Bar Clean',               v:'', sets:4, reps:10, m:'Full Body', t:'full',   dur:50, eq:BAR_EQ},
  {n:'Bar Clean and Press',     v:'', sets:3, reps:10, m:'Full Body', t:'full',   dur:50, eq:BAR_EQ},
  {n:'Bar Snatch',              v:'', sets:3, reps:8,  m:'Full Body', t:'full',   dur:45, eq:BAR_EQ},
  {n:'Bar Swing',               v:'', sets:3, reps:20, m:'Full Body', t:'full',   dur:45, eq:BAR_EQ},
  {n:'Bar Halo',                v:'', sets:3, reps:12, m:'Shoulders', t:'full',   dur:40, eq:BAR_EQ},
  {n:'Bar Burpee Deadlift',     v:'', sets:3, reps:10, m:'Full Body', t:'full',   dur:50, eq:BAR_EQ},

  /* ── core ── */
  {n:'Bar Woodchop',            v:'', sets:3, reps:15, m:'Core',      t:'core',   dur:40, eq:BAR_EQ},
  {n:'Bar Russian Twist',       v:'', sets:3, reps:20, m:'Core',      t:'core',   dur:40, eq:BAR_EQ},
  {n:'Bar Landmine Twist',      v:'', sets:3, reps:16, m:'Core',      t:'core',   dur:45, eq:BAR_EQ},
  {n:'Bar Rollout',             v:'', sets:3, reps:12, m:'Core',      t:'core',   dur:45, eq:BAR_EQ},
  {n:'Bar Overhead Hold',       v:'', sets:3, reps:30, m:'Core',      t:'core',   dur:40, eq:BAR_EQ},
  {n:'Bar Suitcase Carry',      v:'', sets:3, reps:40, m:'Core',      t:'core',   dur:45, eq:BAR_EQ}
];

/* One library, so the player, the exercise picker and the search all find
   these without knowing they are special. */
DB = DB.concat(BAR_DB);

function isBarExercise(name){
  return BAR_DB.some(e => e.n === name);
}
/* Nothing here is filmed yet. Used by the player to say so honestly rather
   than leaving whatever clip was on screen still running. */
function barFootageReady(){ return BAR_DB.some(e => !!e.v); }


/* ═══════════════ PLANS ═══════════════
