/* ═══════════════ RECOVERY · prehab library ═══════════════
   Prehab, not rehab. These build joint resilience and range before something
   goes wrong; they do not treat an injury, and nothing here is presented as
   physiotherapy. The app says so once, plainly, at the top of the section.

   Organised by joint via `j`, because that is how the person actually thinks
   about it — "my knee bothers me on stairs", not "I need a hinge day".

   Five movements already exist in the library and are filmed: Bird Dog,
   Dead Bug, Side Plank, Wall Sit and Calf Raises. Those are reused by name
   rather than duplicated, so the filmed clip still plays.                  */

const REHAB_EQ='Bodyweight';
const REHAB_DB=[
  /* ── knee ── */
  {n:'Terminal Knee Extension', v:'', sets:3, reps:15, m:'Mobility', t:'mobility', j:'Knee',     dur:40, eq:REHAB_EQ},
  {n:'Short Arc Quad',          v:'', sets:3, reps:15, m:'Mobility', t:'mobility', j:'Knee',     dur:40, eq:REHAB_EQ},
  {n:'Straight Leg Raise',      v:'', sets:3, reps:12, m:'Mobility', t:'mobility', j:'Knee',     dur:40, eq:REHAB_EQ},
  {n:'Heel Slide',              v:'', sets:3, reps:15, m:'Mobility', t:'mobility', j:'Knee',     dur:40, eq:REHAB_EQ},
  {n:'Spanish Squat Hold',      v:'', sets:3, reps:30, m:'Mobility', t:'hold',     j:'Knee',     dur:45, eq:'Towel'},
  {n:'Slow Step Down',          v:'', sets:3, reps:10, m:'Mobility', t:'mobility', j:'Knee',     dur:45, eq:'Chair'},
  {n:'Wall Slide Squat',        v:'', sets:3, reps:12, m:'Mobility', t:'mobility', j:'Knee',     dur:45, eq:REHAB_EQ},
  {n:'Tibialis Raise',          v:'', sets:3, reps:20, m:'Mobility', t:'mobility', j:'Knee',     dur:40, eq:REHAB_EQ},
  {n:'Slow Eccentric Calf Raise',v:'',sets:3, reps:12, m:'Mobility', t:'mobility', j:'Knee',     dur:45, eq:REHAB_EQ},
  {n:'Reverse Nordic',          v:'', sets:3, reps:8,  m:'Mobility', t:'mobility', j:'Knee',     dur:45, eq:REHAB_EQ},

  /* ── shoulder ── */
  {n:'Scapular Push Up',        v:'', sets:3, reps:15, m:'Mobility', t:'mobility', j:'Shoulder', dur:40, eq:REHAB_EQ},
  {n:'Scapular Retraction',     v:'', sets:3, reps:15, m:'Mobility', t:'mobility', j:'Shoulder', dur:40, eq:REHAB_EQ},
  {n:'Wall Angel',              v:'', sets:3, reps:12, m:'Mobility', t:'mobility', j:'Shoulder', dur:45, eq:REHAB_EQ},
  {n:'Prone Y Raise',           v:'', sets:3, reps:12, m:'Mobility', t:'mobility', j:'Shoulder', dur:40, eq:REHAB_EQ},
  {n:'Prone T Raise',           v:'', sets:3, reps:12, m:'Mobility', t:'mobility', j:'Shoulder', dur:40, eq:REHAB_EQ},
  {n:'Prone W Raise',           v:'', sets:3, reps:12, m:'Mobility', t:'mobility', j:'Shoulder', dur:40, eq:REHAB_EQ},
  {n:'Towel External Rotation', v:'', sets:3, reps:15, m:'Mobility', t:'mobility', j:'Shoulder', dur:40, eq:'Towel'},
  {n:'Towel Internal Rotation', v:'', sets:3, reps:15, m:'Mobility', t:'mobility', j:'Shoulder', dur:40, eq:'Towel'},
  {n:'Serratus Wall Slide',     v:'', sets:3, reps:12, m:'Mobility', t:'mobility', j:'Shoulder', dur:45, eq:REHAB_EQ},
  {n:'Doorway Chest Stretch',   v:'', sets:2, reps:30, m:'Mobility', t:'hold',     j:'Shoulder', dur:40, eq:REHAB_EQ},
  {n:'Shoulder Circles',        v:'', sets:2, reps:20, m:'Mobility', t:'mobility', j:'Shoulder', dur:40, eq:REHAB_EQ},
  {n:'Bear Hold',               v:'', sets:3, reps:30, m:'Mobility', t:'hold',     j:'Shoulder', dur:45, eq:REHAB_EQ},

  /* ── hip ── */
  {n:'Glute Bridge',            v:'', sets:3, reps:15, m:'Mobility', t:'mobility', j:'Hip',      dur:40, eq:REHAB_EQ},
  {n:'Single Leg Glute Bridge', v:'', sets:3, reps:12, m:'Mobility', t:'mobility', j:'Hip',      dur:45, eq:REHAB_EQ},
  {n:'Clamshell',               v:'', sets:3, reps:15, m:'Mobility', t:'mobility', j:'Hip',      dur:40, eq:REHAB_EQ},
  {n:'Side Lying Leg Raise',    v:'', sets:3, reps:15, m:'Mobility', t:'mobility', j:'Hip',      dur:40, eq:REHAB_EQ},
  {n:'Fire Hydrant',            v:'', sets:3, reps:15, m:'Mobility', t:'mobility', j:'Hip',      dur:40, eq:REHAB_EQ},
  {n:'Hip Airplane',            v:'', sets:3, reps:8,  m:'Mobility', t:'mobility', j:'Hip',      dur:45, eq:REHAB_EQ},
  {n:'90/90 Hip Switch',        v:'', sets:3, reps:12, m:'Mobility', t:'mobility', j:'Hip',      dur:45, eq:REHAB_EQ},
  {n:'Couch Stretch',           v:'', sets:2, reps:40, m:'Mobility', t:'hold',     j:'Hip',      dur:50, eq:REHAB_EQ},
  {n:'Frog Stretch',            v:'', sets:2, reps:40, m:'Mobility', t:'hold',     j:'Hip',      dur:50, eq:REHAB_EQ},
  {n:'Standing Hip Circles',    v:'', sets:2, reps:16, m:'Mobility', t:'mobility', j:'Hip',      dur:40, eq:REHAB_EQ},
  {n:'Cossack Squat',           v:'', sets:3, reps:10, m:'Mobility', t:'mobility', j:'Hip',      dur:45, eq:REHAB_EQ},

  /* ── ankle ── */
  {n:'Ankle Dorsiflexion Rock', v:'', sets:3, reps:15, m:'Mobility', t:'mobility', j:'Ankle',    dur:40, eq:REHAB_EQ},
  {n:'Single Leg Balance',      v:'', sets:3, reps:30, m:'Mobility', t:'hold',     j:'Ankle',    dur:40, eq:REHAB_EQ},
  {n:'Ankle Circles',           v:'', sets:2, reps:20, m:'Mobility', t:'mobility', j:'Ankle',    dur:35, eq:REHAB_EQ},
  {n:'Heel Walk',               v:'', sets:3, reps:20, m:'Mobility', t:'mobility', j:'Ankle',    dur:40, eq:REHAB_EQ},
  {n:'Toe Walk',                v:'', sets:3, reps:20, m:'Mobility', t:'mobility', j:'Ankle',    dur:40, eq:REHAB_EQ},

  /* ── spine and lower back ── */
  {n:'Cat Cow',                 v:'', sets:2, reps:15, m:'Mobility', t:'mobility', j:'Spine',    dur:40, eq:REHAB_EQ},
  {n:'McGill Curl Up',          v:'', sets:3, reps:10, m:'Mobility', t:'mobility', j:'Spine',    dur:45, eq:REHAB_EQ},
  {n:'Prone Press Up',          v:'', sets:3, reps:12, m:'Mobility', t:'mobility', j:'Spine',    dur:40, eq:REHAB_EQ},
  {n:'Thoracic Rotation',       v:'', sets:3, reps:12, m:'Mobility', t:'mobility', j:'Spine',    dur:40, eq:REHAB_EQ},
  {n:'Childs Pose',             v:'', sets:2, reps:40, m:'Mobility', t:'hold',     j:'Spine',    dur:45, eq:REHAB_EQ},
  {n:'Standing Back Extension', v:'', sets:2, reps:12, m:'Mobility', t:'mobility', j:'Spine',    dur:35, eq:REHAB_EQ},
  {n:'Seated Spinal Twist',     v:'', sets:2, reps:12, m:'Mobility', t:'mobility', j:'Spine',    dur:40, eq:'Chair'},
  {n:'Neck Retraction',         v:'', sets:2, reps:15, m:'Mobility', t:'mobility', j:'Spine',    dur:35, eq:REHAB_EQ}
];

DB = DB.concat(REHAB_DB);

/* Already in the library and already filmed — reused rather than duplicated,
   so these days still show a real clip. */
const REHAB_REUSED={ Spine:['Bird Dog','Dead Bug','Side Plank'], Knee:['Wall Sit','Calf Raises'] };

const REHAB_JOINTS=[
  {k:'Knee',     n:'Knee',            e:'🦵', d:'Stairs, squats and the ache after a long walk'},
  {k:'Shoulder', n:'Shoulder',        e:'💪', d:'Overhead reach, pressing and desk-rounded posture'},
  {k:'Hip',      n:'Hip',             e:'🕺', d:'Tight hips from sitting, and the range squats need'},
  {k:'Ankle',    n:'Ankle',           e:'🦶', d:'Balance, depth in a squat, and landing well'},
  {k:'Spine',    n:'Back & neck',     e:'🧘', d:'Lower back, mid back and the neck a phone gives you'}
];

function isRehabExercise(name){ return REHAB_DB.some(e => e.n === name); }
function rehabFor(joint){
  return REHAB_DB.filter(e => e.j === joint).map(e => e.n)
    .concat(REHAB_REUSED[joint] || []);
}
function rehabFootageReady(){ return REHAB_DB.some(e => !!e.v); }


