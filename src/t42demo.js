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
function t42DemoPlan(day){
  var pick=function(t){ return DB.filter(function(e){ return e.v && e.t===t && e.eq!==BAR_EQ; })[0]; };
  var names=['squat','push','lunge','core','full','hinge'].map(pick).filter(Boolean).map(function(e){ return e.n; }).slice(0,5);
  return {id:'demo-plan-'+day, track:'transform', day_no:day, title:'Full Body '+('0'+(Math.ceil(day/2))).slice(-2),
          est_minutes:28, level:'Beginner', equipment:'No equipment',
          focus:'Every major muscle, once. Steady pace, good form over speed.',
          exercises:names.map(function(n,i){ return {n:n, sets:3, reps:[12,10,12,40,30][i]||12}; })};
}

/* Days that had a check-in and a workout, up to (not including) today. */
function t42DemoHistory(day, missed){
  var ck=[], wo=[];
  for(var d=1; d<day; d++){
    if(missed.indexOf(d)>=0) continue;
    ck.push({day_no:d, steps:6200+((d*1373)%4800), water_ml:[1500,2000,2250,2500][d%4],
             nutrition:d%5===0?'partly':'on_track', energy:3+(d%3), sleep:d%4===0?'ok':'good'});
    if(d%7!==0 && d%7!==4) wo.push({day_no:d, title:'Full Body '+('0'+Math.ceil(d/2)).slice(-2), minutes:24+(d%9)});
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
         config:{tracks:['transform','perform'], gym_enabled:false, step_target:8000, water_target_ml:2000,
                 scoring:{online_transform:{weight_pct:40,waist_pct:25,workout_pct:20,consistency_pct:10,rush_pct:5},
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

  T42.reg={id:'demo-reg', challenge_id:c.id, mode:'online_solo', track:'transform', gender:'male',
           status: st==='pay' ? 'pending' : (c.status==='complete' ? 'completed' : (day>0?'active':'paid')),
           verify_code:'T42-48217'};
  T42.baseline={id:'demo-b', phase:'baseline', weight_kg:86.4, height_cm:174, waist_cm:98, age:31,
                photo_front:'demo', fitness:{pushups:14, plank_sec:45, squats_60:28, run1k_sec:420}};
  if(st==='pay'||st==='upcoming') return;

  var cur=Math.min(day,total), missed=[9];
  var hist=t42DemoHistory(cur, missed);
  T42.checkins=hist.ck; T42.completions=hist.wo;
  T42.week=T42_DEMO_WEEKS[Math.ceil(cur/7)-1]||null;
  T42.planDay=(cur%7===0) ? null : t42DemoPlan(cur);
  /* Day 18 opens with yesterday missed and today still to do — the screen
     a member most often sees. Day 21 has today's check-in in. */
  if(st==='active'){ T42.checkins=T42.checkins.filter(function(x){ return x.day_no!==17; }); }
  if(st==='halfway'){
    T42.today={day_no:cur, steps:8420, water_ml:2000, nutrition:'on_track', energy:4, sleep:'good'};
    T42.checkins.unshift(T42.today);
  }
  if(cur>=21) T42.mid={id:'demo-m', phase:'mid', weight_kg:83.9, waist_cm:94.5, taken_on:t42DemoISO(startOff+20)};
  T42.score={registration_id:'demo-reg', eligible:true, category:'transform_male', total:cur>=40?84.2:74.6,
             consistency_total:cur>=40?88:82, rank_category:cur>=40?3:4, rank_consistency:6,
             workout_pct:cur>=40?92:89, consistency_pct:cur>=40?93:88, is_final:c.status==='complete'};
  if(c.status==='complete'){
    T42.final={id:'demo-f', phase:'final', weight_kg:81.9, waist_cm:90.5, verify_status:'verified',
               fitness:{pushups:24, plank_sec:95, squats_60:39, run1k_sec:350}};
    T42.certs=[{id:'demo-cert', kind:'finisher', participant_name:t42DemoName(), edition:'November 2026',
                final_score:84.2, issued_on:t42DemoISO(-14), serial:'T42-2611-8F3C21'}];
  }
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
     t42_scores:{total:84.2, consistency_total:88, consistency_pct:93, eligible:true, rank_category:3, category:'transform_male'},
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
