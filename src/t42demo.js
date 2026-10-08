/* ═══════════════════════════════════════════════════════════════
   T42 · DEMO MODE

   For recording the landing page: app.hitfat.io/?demo turns it on for
   this browser tab, ?demo=off turns it off. Every screen of T42 can then
   be shown with a believable member's 42 days, and everything in HITFAT+
   is open.

   Nothing here touches the database. T42.load() is answered from the data
   below, the leaderboard and My T42 Journey too, and anything that would
   write (a check-in, a finished workout) changes only what is on screen.
   The real edition, its dates and its participants are not involved.
   ═══════════════════════════════════════════════════════════════ */

var T42_DEMO=false, t42DemoStage='active', t42DemoHidden=false;
(function(){
  try{
    var q=String(location.search||'')+String(location.hash||'');
    if(/[?&#]demo=off\b/.test(q)) sessionStorage.removeItem('hf_demo');
    else if(/[?&#]demo\b/.test(q)) sessionStorage.setItem('hf_demo','1');
    T42_DEMO = sessionStorage.getItem('hf_demo')==='1';
    var st=sessionStorage.getItem('hf_demo_stage'); if(st) t42DemoStage=st;
  }catch(e){}
})();

/* The stages a viewer moves through, in order. */
var T42_DEMO_STAGES=[
  ['discover','Invitation',     'Not joined yet'],
  ['pay',     'Secure your spot','Signed up, payment next'],
  ['upcoming','You\'re in',      'Paid, counting down to day 1'],
  ['day1',    'Day 1',          'The first morning'],
  ['active',  'Day 18',         'Mid-challenge, a missed day behind'],
  ['halfway', 'Day 21',         'Halfway milestone'],
  ['final',   'Day 40',         'Final assessment open'],
  ['results', 'Results',        'Finished — result and certificate'],
  ['journey', 'My T42 Journey', 'Every edition, the trophy cabinet']
];

function t42DemoISO(off){
  var d=new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate()+off);
  return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);
}
function t42DemoName(){
  var n=((HF&&HF.data&&HF.data.prefs&&HF.data.prefs.name)||'').trim();
  return n || 'Aiman Rahim';
}

var T42_DEMO_WEEKS=[
  {week_no:1,theme:'Build the Habit',focus:'Start consistently. Small, every day, beats big once a week.',step_target:7000,
   mini_title:'Step Challenge',mini_detail:'Hit your step target five days out of seven.',rush_title:'City Circuit',rush_target:'Complete 1 race'},
  {week_no:2,theme:'Move More',focus:'Daily movement. Walk more, sit less — steps count.',step_target:8000,
   mini_title:'Hydration Challenge',mini_detail:'Two litres a day, every day this week.',rush_title:'City Circuit',rush_target:'Complete 1 race'},
  {week_no:3,theme:'Eat Better',focus:'A good protein source with every main meal, portions under control.',step_target:8000,
   mini_title:'Protein Week',mini_detail:'A palm of protein at every main meal.',rush_title:'Night Run',rush_target:'Beat your previous time'},
  {week_no:4,theme:'Build Fitness',focus:'Harder sessions, better recovery. Your body can do more than week one.',step_target:9000,
   mini_title:'Consistency Challenge',mini_detail:'Every check-in, every day, no gaps.',rush_title:'Night Run',rush_target:'Complete 1 race'},
  {week_no:5,theme:'Push Performance',focus:'Better quality in every session. Beat last week.',step_target:9000,
   mini_title:'Workout Streak',mini_detail:'Four sessions, no missed days between them.',rush_title:'Hill Sprint',rush_target:'Complete 1 race'},
  {week_no:6,theme:'Finish Strong',focus:'Every day to the line. Final assessment, final result.',step_target:10000,
   mini_title:'Final Push',mini_detail:'Everything you have, for seven days.',rush_title:'Hill Sprint',rush_target:'Post your best time'}
];

/* Today's workout, from movements that are filmed, so Start plays clips. */
/* The real TRANSFORM plan, written by deploy/t42plan.py — the demo shows
   exactly the sessions a member will get. */
var T42_DEMO_PLAN=/*PLAN>*/{"1":["Full Body Strength",15,"Water bottles","Every major muscle, once. Controlled reps, full range.",[{"n":"Bodyweight Squat","label":"Bodyweight Squat","sets":3,"reps":12},{"n":"Push Up","label":"Push-Up","sets":3,"reps":10},{"n":"Reverse Lunges","label":"Reverse Lunge","sets":3,"reps":10},{"n":"Bottle Bent Over Row","label":"Bent-Over Row (Bottles)","sets":3,"reps":12},{"n":"Plank","label":"Plank","sets":3,"sec":30}]],"2":["Fat Burn Conditioning",15,"No equipment","Short rests, steady effort. Keep moving.",[{"n":"Jumping Jack","label":"Jumping Jacks","sets":3,"sec":30},{"n":"Squat Jump","label":"Squat Jump","sets":3,"reps":10},{"n":"Mountain Climber","label":"Mountain Climbers","sets":3,"sec":30},{"n":"Half Burpee","label":"Half Burpee","sets":3,"reps":8},{"n":"High Knee","label":"High Knees","sets":3,"sec":30}]],"4":["Upper Body & Core",20,"Water bottles \u00b7 Chair","Push, pull, brace.",[{"n":"Push Up","label":"Push-Up","sets":3,"reps":10},{"n":"Bottle Shoulder Press","label":"Shoulder Press (Bottles)","sets":3,"reps":12},{"n":"Bottle Bent Over Row","label":"Bent-Over Row (Bottles)","sets":3,"reps":12},{"n":"Tricep Dip Chair","label":"Tricep Dip (Chair)","sets":3,"reps":10},{"n":"Dead Bug","label":"Dead Bug","sets":3,"reps":12},{"n":"Side Plank","label":"Side Plank","sets":3,"sec":20}]],"6":["Lower Body & Glutes",20,"No equipment","The biggest muscles, the biggest burn.",[{"n":"Bodyweight Squat","label":"Bodyweight Squat","sets":3,"reps":15},{"n":"Walking Lunges","label":"Walking Lunge","sets":3,"reps":12},{"n":"Hip Thrust","label":"Hip Thrust","sets":3,"reps":15},{"n":"Side Lunges","label":"Side Lunge","sets":3,"reps":10},{"n":"Calf Raises","label":"Calf Raise","sets":3,"reps":16},{"n":"Wall Sit","label":"Wall Sit","sets":3,"sec":30}]],"8":["Full Body Strength",15,"Water bottles","Every major muscle, once. Controlled reps, full range.",[{"n":"Bodyweight Squat","label":"Bodyweight Squat","sets":3,"reps":14},{"n":"Push Up","label":"Push-Up","sets":3,"reps":12},{"n":"Reverse Lunges","label":"Reverse Lunge","sets":3,"reps":12},{"n":"Bottle Bent Over Row","label":"Bent-Over Row (Bottles)","sets":3,"reps":14},{"n":"Plank","label":"Plank","sets":3,"sec":35}]],"9":["Fat Burn Conditioning",15,"No equipment","Short rests, steady effort. Keep moving.",[{"n":"Jumping Jack","label":"Jumping Jacks","sets":3,"sec":35},{"n":"Squat Jump","label":"Squat Jump","sets":3,"reps":12},{"n":"Mountain Climber","label":"Mountain Climbers","sets":3,"sec":35},{"n":"Half Burpee","label":"Half Burpee","sets":3,"reps":10},{"n":"High Knee","label":"High Knees","sets":3,"sec":35}]],"11":["Upper Body & Core",20,"Water bottles \u00b7 Chair","Push, pull, brace.",[{"n":"Push Up","label":"Push-Up","sets":3,"reps":12},{"n":"Bottle Shoulder Press","label":"Shoulder Press (Bottles)","sets":3,"reps":14},{"n":"Bottle Bent Over Row","label":"Bent-Over Row (Bottles)","sets":3,"reps":14},{"n":"Tricep Dip Chair","label":"Tricep Dip (Chair)","sets":3,"reps":12},{"n":"Dead Bug","label":"Dead Bug","sets":3,"reps":14},{"n":"Side Plank","label":"Side Plank","sets":3,"sec":25}]],"13":["Lower Body & Glutes",20,"No equipment","The biggest muscles, the biggest burn.",[{"n":"Bodyweight Squat","label":"Bodyweight Squat","sets":3,"reps":18},{"n":"Walking Lunges","label":"Walking Lunge","sets":3,"reps":14},{"n":"Hip Thrust","label":"Hip Thrust","sets":3,"reps":18},{"n":"Side Lunges","label":"Side Lunge","sets":3,"reps":12},{"n":"Calf Raises","label":"Calf Raise","sets":3,"reps":18},{"n":"Wall Sit","label":"Wall Sit","sets":3,"sec":35}]],"15":["Full Body Strength",20,"Water bottles","Every major muscle, once. Controlled reps, full range.",[{"n":"Bodyweight Squat","label":"Bodyweight Squat","sets":4,"reps":14},{"n":"Push Up","label":"Push-Up","sets":4,"reps":12},{"n":"Reverse Lunges","label":"Reverse Lunge","sets":4,"reps":12},{"n":"Bottle Bent Over Row","label":"Bent-Over Row (Bottles)","sets":4,"reps":14},{"n":"Plank","label":"Plank","sets":4,"sec":35}]],"16":["Fat Burn Conditioning",20,"No equipment","Short rests, steady effort. Keep moving.",[{"n":"Jumping Jack","label":"Jumping Jacks","sets":4,"sec":35},{"n":"Squat Jump","label":"Squat Jump","sets":4,"reps":12},{"n":"Mountain Climber","label":"Mountain Climbers","sets":4,"sec":35},{"n":"Half Burpee","label":"Half Burpee","sets":4,"reps":10},{"n":"High Knee","label":"High Knees","sets":4,"sec":35}]],"18":["Upper Body & Core",25,"Water bottles \u00b7 Chair","Push, pull, brace.",[{"n":"Push Up","label":"Push-Up","sets":4,"reps":12},{"n":"Bottle Shoulder Press","label":"Shoulder Press (Bottles)","sets":4,"reps":14},{"n":"Bottle Bent Over Row","label":"Bent-Over Row (Bottles)","sets":4,"reps":14},{"n":"Tricep Dip Chair","label":"Tricep Dip (Chair)","sets":4,"reps":12},{"n":"Dead Bug","label":"Dead Bug","sets":4,"reps":14},{"n":"Side Plank","label":"Side Plank","sets":4,"sec":25}]],"20":["Lower Body & Glutes",25,"No equipment","The biggest muscles, the biggest burn.",[{"n":"Bodyweight Squat","label":"Bodyweight Squat","sets":4,"reps":18},{"n":"Walking Lunges","label":"Walking Lunge","sets":4,"reps":14},{"n":"Hip Thrust","label":"Hip Thrust","sets":4,"reps":18},{"n":"Side Lunges","label":"Side Lunge","sets":4,"reps":12},{"n":"Calf Raises","label":"Calf Raise","sets":4,"reps":18},{"n":"Wall Sit","label":"Wall Sit","sets":4,"sec":35}]],"22":["Full Body Strength",15,"Water bottles \u00b7 Backpack","Single-leg and loaded work. Slow down, own every rep.",[{"n":"Bulgarian Split Squat","label":"Bulgarian Split Squat","sets":3,"reps":10},{"n":"Wide Push Up","label":"Wide Push-Up","sets":3,"reps":10},{"n":"Backpack Deadlift","label":"Deadlift (Backpack)","sets":3,"reps":12},{"n":"Bottle Bent Over Row","label":"Bent-Over Row (Bottles)","sets":3,"reps":14},{"n":"Plank Shoulder Taps","label":"Plank Shoulder Tap","sets":3,"reps":16}]],"23":["Fat Burn Conditioning",15,"No equipment","Full burpees now. Hold the pace to the last round.",[{"n":"Burpee","label":"Burpee","sets":3,"reps":8},{"n":"Skater Jump","label":"Skater Jump","sets":3,"reps":16},{"n":"Mountain Climber","label":"Mountain Climbers","sets":3,"sec":40},{"n":"Squat Jump","label":"Squat Jump","sets":3,"reps":12},{"n":"Sprint On Spot","label":"Sprint on the Spot","sets":3,"sec":30}]],"25":["Upper Body & Core",20,"Water bottles","Harder pressing, a stronger brace.",[{"n":"Diamond Push Up","label":"Diamond Push-Up","sets":3,"reps":8},{"n":"Bottle ALT Shoulder Press","label":"Alternating Shoulder Press (Bottles)","sets":3,"reps":12},{"n":"Bottle Bent Over Row","label":"Bent-Over Row (Bottles)","sets":3,"reps":14},{"n":"Push Up Shoulder Tap","label":"Push-Up Shoulder Tap","sets":3,"reps":10},{"n":"Russian Twist","label":"Russian Twist","sets":3,"reps":20},{"n":"Hollow Hold","label":"Hollow Hold","sets":3,"sec":25}]],"27":["Lower Body & Glutes",20,"No equipment","One leg at a time, and a long hold to finish.",[{"n":"Bulgarian Split Squat","label":"Bulgarian Split Squat","sets":3,"reps":10},{"n":"Curtsy Lunges","label":"Curtsy Lunge","sets":3,"reps":12},{"n":"Single Leg Glutes Bridge","label":"Single-Leg Glute Bridge","sets":3,"reps":12},{"n":"Squat Pulse","label":"Squat Pulse","sets":3,"reps":15},{"n":"Single Leg Calf Raises","label":"Single-Leg Calf Raise","sets":3,"reps":12},{"n":"Squat Hold","label":"Squat Hold","sets":3,"sec":40}]],"29":["Full Body Strength",20,"Water bottles \u00b7 Backpack","Single-leg and loaded work. Slow down, own every rep.",[{"n":"Bulgarian Split Squat","label":"Bulgarian Split Squat","sets":4,"reps":10},{"n":"Wide Push Up","label":"Wide Push-Up","sets":4,"reps":10},{"n":"Backpack Deadlift","label":"Deadlift (Backpack)","sets":4,"reps":12},{"n":"Bottle Bent Over Row","label":"Bent-Over Row (Bottles)","sets":4,"reps":14},{"n":"Plank Shoulder Taps","label":"Plank Shoulder Tap","sets":4,"reps":16}]],"30":["Fat Burn Conditioning",20,"No equipment","Full burpees now. Hold the pace to the last round.",[{"n":"Burpee","label":"Burpee","sets":4,"reps":8},{"n":"Skater Jump","label":"Skater Jump","sets":4,"reps":16},{"n":"Mountain Climber","label":"Mountain Climbers","sets":4,"sec":40},{"n":"Squat Jump","label":"Squat Jump","sets":4,"reps":12},{"n":"Sprint On Spot","label":"Sprint on the Spot","sets":4,"sec":30}]],"32":["Upper Body & Core",25,"Water bottles","Harder pressing, a stronger brace.",[{"n":"Diamond Push Up","label":"Diamond Push-Up","sets":4,"reps":8},{"n":"Bottle ALT Shoulder Press","label":"Alternating Shoulder Press (Bottles)","sets":4,"reps":12},{"n":"Bottle Bent Over Row","label":"Bent-Over Row (Bottles)","sets":4,"reps":14},{"n":"Push Up Shoulder Tap","label":"Push-Up Shoulder Tap","sets":4,"reps":10},{"n":"Russian Twist","label":"Russian Twist","sets":4,"reps":20},{"n":"Hollow Hold","label":"Hollow Hold","sets":4,"sec":25}]],"34":["Lower Body & Glutes",25,"No equipment","One leg at a time, and a long hold to finish.",[{"n":"Bulgarian Split Squat","label":"Bulgarian Split Squat","sets":4,"reps":10},{"n":"Curtsy Lunges","label":"Curtsy Lunge","sets":4,"reps":12},{"n":"Single Leg Glutes Bridge","label":"Single-Leg Glute Bridge","sets":4,"reps":12},{"n":"Squat Pulse","label":"Squat Pulse","sets":4,"reps":15},{"n":"Single Leg Calf Raises","label":"Single-Leg Calf Raise","sets":4,"reps":12},{"n":"Squat Hold","label":"Squat Hold","sets":4,"sec":40}]],"36":["Full Body Strength",20,"Water bottles \u00b7 Backpack","Single-leg and loaded work. Slow down, own every rep.",[{"n":"Bulgarian Split Squat","label":"Bulgarian Split Squat","sets":4,"reps":12},{"n":"Wide Push Up","label":"Wide Push-Up","sets":4,"reps":12},{"n":"Backpack Deadlift","label":"Deadlift (Backpack)","sets":4,"reps":14},{"n":"Bottle Bent Over Row","label":"Bent-Over Row (Bottles)","sets":4,"reps":16},{"n":"Plank Shoulder Taps","label":"Plank Shoulder Tap","sets":4,"reps":18}]],"37":["Fat Burn Conditioning",20,"No equipment","Full burpees now. Hold the pace to the last round.",[{"n":"Burpee","label":"Burpee","sets":4,"reps":10},{"n":"Skater Jump","label":"Skater Jump","sets":4,"reps":18},{"n":"Mountain Climber","label":"Mountain Climbers","sets":4,"sec":45},{"n":"Squat Jump","label":"Squat Jump","sets":4,"reps":14},{"n":"Sprint On Spot","label":"Sprint on the Spot","sets":4,"sec":35}]],"39":["Upper Body & Core",25,"Water bottles","Harder pressing, a stronger brace.",[{"n":"Diamond Push Up","label":"Diamond Push-Up","sets":4,"reps":10},{"n":"Bottle ALT Shoulder Press","label":"Alternating Shoulder Press (Bottles)","sets":4,"reps":14},{"n":"Bottle Bent Over Row","label":"Bent-Over Row (Bottles)","sets":4,"reps":16},{"n":"Push Up Shoulder Tap","label":"Push-Up Shoulder Tap","sets":4,"reps":12},{"n":"Russian Twist","label":"Russian Twist","sets":4,"reps":22},{"n":"Hollow Hold","label":"Hollow Hold","sets":4,"sec":30}]],"41":["Lower Body & Glutes",25,"No equipment","One leg at a time, and a long hold to finish.",[{"n":"Bulgarian Split Squat","label":"Bulgarian Split Squat","sets":4,"reps":12},{"n":"Curtsy Lunges","label":"Curtsy Lunge","sets":4,"reps":14},{"n":"Single Leg Glutes Bridge","label":"Single-Leg Glute Bridge","sets":4,"reps":14},{"n":"Squat Pulse","label":"Squat Pulse","sets":4,"reps":18},{"n":"Single Leg Calf Raises","label":"Single-Leg Calf Raise","sets":4,"reps":14},{"n":"Squat Hold","label":"Squat Hold","sets":4,"sec":45}]]}/*<PLAN*/;
function t42DemoPlan(day){
  var p=T42_DEMO_PLAN[day]; if(!p) return null;
  return {id:'demo-plan-'+day, track:'transform', day_no:day, title:p[0], est_minutes:p[1], level:'Intermediate',
          equipment:p[2], focus:p[3], exercises:p[4]};
}

/* Days that had a check-in and a workout, up to (not including) today. */
function t42DemoHistory(day, missed){
  var ck=[], wo=[];
  for(var d=1; d<day; d++){
    if(missed.indexOf(d)>=0) continue;
    ck.push({day_no:d, steps:6200+((d*1373)%4800), water_ml:[1500,2000,2250,2500][d%4],
             nutrition:d%5===0?'partly':'on_track', energy:3+(d%3), sleep:d%4===0?'ok':'good'});
    var pd=T42_DEMO_PLAN[d];
    if(pd) wo.push({day_no:d, title:pd[0], minutes:pd[1]});
  }
  return {ck:ck.reverse(), wo:wo.reverse()};
}

function t42DemoApply(){
  var st=t42DemoStage, total=42, day;
  var dayFor={discover:-20, pay:-20, upcoming:-12, day1:1, active:18, halfway:21, final:40, results:60, journey:60};
  day=dayFor[st]||18;
  var startOff = day<0 ? -day : -(day-1);
  var c={id:'demo-nov', slug:'t42-nov-demo', name:'T42 November 2026', edition:'November 2026',
         subtitle:'42 days. One transformation.', starts_on:t42DemoISO(startOff), ends_on:t42DemoISO(startOff+41),
         reg_opens_on:t42DemoISO(startOff-30), reg_closes_on:t42DemoISO(startOff-1), status:'registration',
         total_days:total, price_rm:99, results_on:t42DemoISO(startOff+45), access_ends_on:t42DemoISO(startOff+41),
         config:{tracks:['transform','perform'], gym_enabled:true, online_enabled:false, step_target:8000, water_target_ml:2000,
                 scoring:{gym_transform:{bodyfat_pct:40,weight_waist_pct:25,attendance_pct:20,consistency_pct:10,rush_pct:5},
                          perform:{fitness_pct:50,rush_pct:25,workout_pct:15,consistency_pct:10}}}};
  if(day>0 && day<=total) c.status='running';
  if(st==='results'||st==='journey') c.status='complete';
  if(st==='final') c.status='running';

  T42.state='ready'; T42.err=null;
  T42.challenge=c; T42.open=c; T42.past=null; T42.weeks=T42_DEMO_WEEKS.slice();
  T42.duo=null; T42.duoCard=[]; T42.duoScore=null; T42.reviews=[]; T42.journey=null;
  T42.reg=null; T42.baseline=null; T42.mid=null; T42.final=null; T42.certs=[]; T42.score=null;
  T42.t42ClearDay();
  if(st==='discover') return;

  /* Gym Duo: November is physical, at HITFAT HQ, in pairs. Before paying
     there is no duo yet; from the countdown on the viewer is paired with
     Amir, who is still waiting on his InBody — the checklist has work in it. */
  var paired = st!=='pay';
  T42.reg={id:'demo-reg', challenge_id:c.id, mode:'gym_duo', track:'transform', gender:'male',
           duo_id: paired ? 'demo-duo' : null,
           status: st==='pay' ? 'pending' : (c.status==='complete' ? 'completed' : (day>0?'active':'paid')),
           verify_code:'T42-48217'};
  T42.baseline={id:'demo-b', phase:'baseline', weight_kg:86.4, height_cm:174, waist_cm:98, age:31,
                body_fat_pct: st==='upcoming' ? null : 27.8,
                photo_front:'demo', fitness:{pushups:14, plank_sec:45, squats_60:28, run1k_sec:420}};
  if(paired){
    T42.duo={id:'demo-duo', code:'T42-K8F2'};
    T42.duoCard=t42DemoDuoCard(st, Math.max(0,Math.min(day,total)));
  }
  if(st==='pay'||st==='upcoming') return;

  var cur=Math.min(day,total), missed=[9];
  var hist=t42DemoHistory(cur, missed);
  T42.checkins=hist.ck; T42.completions=hist.wo;
  T42.week=T42_DEMO_WEEKS[Math.ceil(cur/7)-1]||null;
  T42.planDay=t42DemoPlan(cur);
  /* Day 18 opens with yesterday missed and today still to do — the screen
     a member most often sees. Day 21 has today's check-in in. */
  if(st==='active'){ T42.checkins=T42.checkins.filter(function(x){ return x.day_no!==17; }); }
  if(st==='halfway'){
    T42.today={day_no:cur, steps:8420, water_ml:2000, nutrition:'on_track', energy:4, sleep:'good'};
    T42.checkins.unshift(T42.today);
  }
  if(cur>=21) T42.mid={id:'demo-m', phase:'mid', weight_kg:83.9, waist_cm:94.5, taken_on:t42DemoISO(startOff+20)};
  T42.duoScore={duo_id:'demo-duo', eligible:true, category:'duo_transform_male',
                team_total:cur>=40?82.6:73.1, rank_category:cur>=40?2:3};
  T42.score={registration_id:'demo-reg', eligible:true, category:'gym_transform_male', total:cur>=40?84.2:74.6,
             consistency_total:cur>=40?88:82, rank_category:cur>=40?3:4, rank_consistency:6,
             workout_pct:cur>=40?92:89, consistency_pct:cur>=40?93:88, is_final:c.status==='complete'};
  if(c.status==='complete'){
    T42.final={id:'demo-f', phase:'final', weight_kg:81.9, waist_cm:90.5, body_fat_pct:23.1, verify_status:'verified',
               fitness:{pushups:24, plank_sec:95, squats_60:39, run1k_sec:350}};
    T42.certs=[{id:'demo-cert', kind:'finisher', participant_name:t42DemoName(), edition:'November 2026',
                final_score:84.2, issued_on:t42DemoISO(-14), serial:'T42-2611-8F3C21'}];
  }
}

/* The two partners as t42_duo_card() returns them: me first. Amir's
   InBody is still to do before day 1; from day 1 both are ready. */
function t42DemoDuoCard(st, day){
  var before = st==='upcoming', ok = !before;
  var wl = day>=40 ? -5.2 : day>=21 ? -2.9 : day>=18 ? -2.4 : 0;
  return [
    {is_me:true, display_name:t42DemoName().split(/\s+/)[0], baseline_ok:true, inbody_ok:ok, ready:ok,
     workout_today: st==='final', gym_today: st==='halfway'||st==='final',
     checked_in_today: st==='halfway', steps_today: st==='halfway' ? 8420 : st==='active' ? 3120 : null,
     weight_change_pct: day ? wl : null, waist_change_pct: day ? wl*1.4 : null,
     attended: Math.round(day*0.55), workout_pct: day ? 89 : null, total: day ? (day>=40?84.2:74.6) : null},
    {is_me:false, display_name:'Amir', baseline_ok:true, inbody_ok:ok, ready:ok,
     workout_today: day>0 && day%7!==0, gym_today: day>0 && st!=='active', checked_in_today: day>0,
     steps_today: day>0 ? 9650 : null,
     weight_change_pct: day ? wl-0.6 : null, waist_change_pct: day ? (wl-0.6)*1.3 : null,
     attended: Math.round(day*0.62), workout_pct: day ? 93 : null, total: day ? (day>=40?81.0:71.6) : null}
  ];
}

/* The duo board: teams by first names, ours third (second at the end). */
function t42DemoDuoBoard(id){
  var teams={
    duo_transform_male:['Hafiz & Daniel','Arif & Kumar','__me__','Faizal & Jason','Irfan & Syafiq','Wei Jie & Zack','Hakim & Ryan'],
    duo_transform_female:['Nurul & Siti','Aina & Mei Ling','Farah & Priya','Hani & Liyana','Joanne & Amira'],
    duo_perform_male:['Haziq & Ravi','Zul & Adam','Kelvin & Firdaus','Amir B. & Shah'],
    duo_perform_female:['Ain & Grace','Nadia & Sofea','Kavitha & Yasmin','Bella & Dina']
  }[id]||[];
  var ds=T42.duoScore||{}, mine=Number(ds.team_total)||73;
  if(id==='duo_transform_male' && ds.rank_category===2){ teams.splice(teams.indexOf('__me__'),1); teams.splice(1,0,'__me__'); }
  var at=teams.indexOf('__me__'), top = at>=0 ? mine+at*1.6 : 80;
  return teams.map(function(t,i){
    var me=t==='__me__';
    return {place:i+1, team: me ? t42DemoName().split(/\s+/)[0]+' & Amir' : t,
            score: me ? mine : Math.round((top-i*1.6-(i>at?0.3:0))*10)/10, is_mine:me};
  });
}

/* A leaderboard with people on it: first names and an initial, the way the
   real board shows them. The viewer sits fourth. */
function t42DemoBoard(id){
  var names={
    transform_male:['Hafiz R.','Daniel L.','Arif S.','__me__','Kumar V.','Faizal M.','Jason T.','Irfan Z.','Syafiq A.','Wei Jie C.'],
    transform_female:['Nurul A.','Siti H.','Aina R.','Mei Ling T.','Farah N.','Priya K.','Hani Z.','Liyana S.','Joanne W.','Amira F.'],
    perform_male:['Haziq A.','Ravi P.','Zul K.','Adam L.','Kelvin O.','Firdaus H.','Hakim J.','Ryan T.','Amir B.','Shah N.'],
    perform_female:['Ain M.','Grace L.','Nadia R.','Sofea I.','Kavitha S.','Yasmin H.','Bella C.','Dina A.','Ika N.','Zara Q.'],
    consistency:['Siti H.','Hafiz R.','Nurul A.','Ravi P.','Aina R.','__me__','Daniel L.','Grace L.','Arif S.','Farah N.']
  }[id]||[];
  /* Scores fall away from the top in uneven steps, with the viewer's own
     score sitting exactly at their place — a board where fourth outscores
     fifth by the rules, not by accident. */
  var me=T42.score||{}, mineAt=names.indexOf('__me__');
  var myScore=Number(id==='consistency'?me.consistency_total:me.total)||80;
  var steps=[2.1,1.7,1.4,1.2,1.3,1.1,1.25,1.15,1.35];
  var at=function(i){
    var anchor=mineAt>=0?mineAt:3, v=myScore, k;
    if(i<anchor){ for(k=i;k<anchor;k++) v+=steps[k]; }
    else { for(k=anchor;k<i;k++) v-=steps[k]; }
    return Math.round(v*10)/10;
  };
  return names.map(function(n,i){
    var mine=n==='__me__';
    return {place:i+1, display_name: mine ? (t42DemoName().split(/\s+/)[0]+' '+((t42DemoName().split(/\s+/)[1]||'')[0]||'')+'.').trim() : n,
            score: mine ? myScore : at(i), is_me: mine};
  });
}

function t42DemoJourney(){
  var c=T42.challenge||{};
  return [
    {id:'demo-reg', challenge_id:c.id, status:'completed', track:'transform', joined_at:t42DemoISO(-90),
     t42_challenges:Object.assign({},c,{status:'complete'}),
     t42_scores:{total:84.2, consistency_total:88, consistency_pct:93, eligible:true, rank_category:3, category:'gym_transform_male'},
     t42_certificates:[{id:'demo-cert',kind:'finisher'}],
     t42_measurements:[{phase:'baseline',weight_kg:86.4,waist_cm:98},{phase:'final',weight_kg:81.9,waist_cm:90.5}]}
  ];
}

function t42DemoNote(){ toast('Demo — nothing is saved'); }

/* ── the switcher ──
   A small pill, bottom left, above the tab bar. Hide it before recording;
   it comes back on reload. */
function t42DemoGo(st){
  t42DemoStage=st;
  try{ sessionStorage.setItem('hf_demo_stage',st); }catch(e){}
  t42DemoApply();
  t42DemoSheet(false);
  if(typeof openT42==='function') openT42();
  if(st==='journey' && typeof t42GoJourney==='function'){ T42.journey=t42DemoJourney(); t42GoJourney(); }
  try{ renderHome(); }catch(e){}
}
function t42DemoSheet(open){
  var el=document.getElementById('t42-demo'); if(!el) return;
  el.className = open ? 'open' : '';
  if(!open){ el.innerHTML=t42DemoPill(); return; }
  el.innerHTML='<div class="dm-sheet"><div class="dm-h">Demo · T42 stages</div>'+
    T42_DEMO_STAGES.map(function(s){
      return '<button class="dm-row'+(s[0]===t42DemoStage?' on':'')+'" onclick="t42DemoGo(\''+s[0]+'\')">'+
        '<b>'+s[1]+'</b><span>'+s[2]+'</span></button>'; }).join('')+
    '<div class="dm-actions"><button onclick="t42DemoHide()">Hide this button</button>'+
    '<button onclick="t42DemoSheet(false)">Close</button></div>'+
    '<div class="dm-f">Nothing here is saved. Leave demo: add ?demo=off to the address.</div></div>';
}
function t42DemoPill(){
  return '<button class="dm-pill" onclick="t42DemoSheet(true)">Demo · '+
    ((T42_DEMO_STAGES.filter(function(s){ return s[0]===t42DemoStage; })[0]||[])[1]||'')+'</button>';
}
function t42DemoHide(){ var el=document.getElementById('t42-demo'); if(el) el.remove(); }
function t42DemoMount(){
  if(!T42_DEMO || typeof document==='undefined' || !document.body || document.getElementById('t42-demo')) return;
  var el=document.createElement('div'); el.id='t42-demo';
  document.body.appendChild(el); t42DemoSheet(false);
}
