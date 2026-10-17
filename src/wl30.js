/* ═══════════════ BURN30 · 30-DAY WEIGHT LOSS ═══════════════
   The first program sold on its own: RM39, one payment, yours for good. It
   is bought on its landing page (Bayarcash), or in the app, and is part of
   HITFAT+ for members. Someone who owns only this sees the rest of the app
   locked, the way Fitness+ shows what a subscription would add.

   It is written out day by day, not generated: a beginner's first month is
   too important to leave to a rotation. Every movement is filmed and needs
   no more than a chair, two water bottles and a mat. The weeks get longer
   (2, then 3 rounds) and the moves get harder (wall push-ups to knee push-
   ups, step-backs to squat jumps); day 1 and day 30 are the same fit test
   so the change can be counted.

   The program has its own home — a calendar, a meal plan for the 30 days,
   a progress page and a start-here guide — in place of the ordinary
   program page.                                                          */

const WL30_ID='wl30', WL30_PRICE=39;
/* its name, the way Beachbody names a program, and what it is */
const WL30_NAME='BURN30', WL30_SUB='30-Day Weight Loss', WL30_POSTER='/img/p/burn30-poster.jpg?v=4';
const WL30_TEST=['Bodyweight Squat','Knee Push Ups','Jumping Jack','Crunch','Plank'];
const WL30_RECOVER=['IC Warm','Bird Dog','Dead Bug','Hip Thrust','Calf Raises'];
const WL30_PHASES=[
  {n:'Foundation', s:'Learn the moves, build the habit.',      from:1,  to:7},
  {n:'Build',      s:'Three rounds now. Same moves, more of them.', from:8,  to:14},
  {n:'Burn',       s:'Harder moves, longer sessions.',          from:15, to:21},
  {n:'Push',       s:'The strongest week. Seven moves a day.',  from:22, to:28},
  {n:'Finish',     s:'One last burn, then test what changed.',  from:29, to:30}
];
/* k: test · train · cardio · recover — what the day is, for its picture and
   its tile. r: rounds. tip: one line from the coach, shown on the day. */
const WL30_DAYS=[
  {n:'Fit Test',            k:'test',    r:1, ex:WL30_TEST,
   tip:'Today is your starting line. Count every rep honestly — day 30 is measured against it.'},
  {n:'Full Body Start',     k:'train',   r:2, ex:['Bodyweight Squat','Wall Push Up','Reverse Lunges','Dead Bug','Hip Thrust','Jumping Jack'],
   tip:'Go slow and learn the shape of each move. Speed comes later; form comes first.'},
  {n:'Lower Body Basics',   k:'lower',   r:2, ex:['Chair Squat','Alternating Lunges','Hip Thrust','Side Lunges','Calf Raises','Wall Sit'],
   tip:'Push the floor away through your heels. Your legs are the biggest engine you have.'},
  {n:'Cardio Kickstart',    k:'cardio',  r:2, ex:['Jumping Jack','High Knee','Butt Kick','Fast Feet','Mountain Climber','Half Burpee'],
   tip:'Breathless is fine. If you cannot speak at all, march instead of jumping — keep moving.'},
  {n:'Upper & Core',        k:'upper',   r:2, ex:['Wall Push Up','Bottle Shoulder Press','Bottle Bent Over Row','Tricep Dip Chair','Crunch','Plank'],
   tip:'Two water bottles are your dumbbells this month. Fill them more as you get stronger.'},
  {n:'Full Body Burn',      k:'train',   r:2, ex:['Squat Pulse','Knee Push Ups','Reverse Lunges','Mountain Climber','Bird Dog','High Knee'],
   tip:'Last training day of week one. Finish it and the hardest part — starting — is behind you.'},
  {n:'Active Recovery',     k:'recover', r:2, ex:WL30_RECOVER,
   tip:'Easy movement helps sore muscles recover. Add a 20-minute walk if you can.'},

  {n:'Lower Body Build',    k:'lower',   r:3, ex:['Bodyweight Squat','Walking Lunges','Hip Thrust','Curtsy Lunges','Squat Hold'],
   tip:'Three rounds from today. Rest when the timer says, not before.'},
  {n:'Cardio Intervals',    k:'cardio',  r:3, ex:['Jumping Jack','High Knee','Half Burpee','Butt Kick','Plank Jack'],
   tip:'Work hard for the interval, then use every second of the rest to breathe.'},
  {n:'Upper Body Build',    k:'upper',   r:3, ex:['Knee Push Ups','Bottle Shoulder Press','Bottle Bent Over Row','Bottle Lateral Raises','Tricep Dip Chair'],
   tip:'Knee push-ups now. Chest to the floor, elbows at 45 degrees.'},
  {n:'Core Build',          k:'core',    r:3, ex:['Dead Bug','Reverse Crunch','Russian Twist','Flutter Kick','Plank'],
   tip:'Press your lower back into the mat. A flat belly starts with a strong one.'},
  {n:'Full Body Build',     k:'train',   r:3, ex:['Squat Pause','Incline Push Up (Chair)','Alternating Lunges','Mountain Climber','Bicycle Crunch'],
   tip:'Pause at the bottom of every squat. Slow is harder, and harder is the point.'},
  {n:'Sweat Session',       k:'cardio',  r:3, ex:['Jumping Jack','Squat Pulse','Fast Feet','Step Up Box or Chair','High Knee'],
   tip:'A towel and a full bottle of water before you start. You will need both.'},
  {n:'Active Recovery',     k:'recover', r:2, ex:WL30_RECOVER,
   tip:'Two weeks done. Check your weight and waist tomorrow morning, before breakfast.'},

  {n:'Lower Burn',          k:'lower',   r:3, ex:['Squat Pulse','Reverse Lunges','Single Leg Glutes Bridge','Side Lunges','Wall Sit','Calf Raises'],
   tip:'Halfway. Take your day-15 photo and measurements — the mirror lies, the tape does not.'},
  {n:'HIIT Burn',           k:'cardio',  r:3, ex:['Jumping Jack','Half Burpee','High Knee','Mountain Climber','Power Skip','Fast Feet'],
   tip:'Six moves, three rounds. The last round is where the change happens.'},
  {n:'Upper Burn',          k:'upper',   r:3, ex:['Knee Push Ups','Bottle Bent Over Row','Bottle Shoulder Press','Bottle Bicep Curl','Tricep Dip Chair','Plank Shoulder Taps'],
   tip:'Squeeze your shoulder blades on every row. Good posture is trained, not wished for.'},
  {n:'Core Burn',           k:'core',    r:3, ex:['Bicycle Crunch','Leg Raises','Russian Twist','Plank Jack','Side Plank','Dead Bug'],
   tip:'Breathe out as you crunch. Holding your breath makes every rep harder.'},
  {n:'Full Body Burn',      k:'train',   r:3, ex:['Bodyweight Squat','Incline Push Up (Chair)','Walking Lunges','Plank Jack','Hip Thrust','Skater Jump'],
   tip:'Skater jumps are new — land soft and quiet, like the floor is glass.'},
  {n:'Cardio Burn',         k:'cardio',  r:3, ex:['High Knee','Butt Kick','Half Burpee','Squat Jump','Jumping Jack','Mountain Climber'],
   tip:'Squat jumps today. Too much for your knees? Do a fast squat without leaving the floor.'},
  {n:'Active Recovery',     k:'recover', r:2, ex:WL30_RECOVER,
   tip:'Three weeks in. You are not the person who started on day 1 any more.'},

  {n:'Lower Push',          k:'lower',   r:3, ex:['Squat Pause','Walking Lunges','Hip Thrust','Curtsy Lunges','Squat Jump','Wall Sit','Calf Raises'],
   tip:'Seven moves a day this week. This is the week that makes the month.'},
  {n:'HIIT Push',           k:'cardio',  r:3, ex:['Half Burpee','Squat Jump','High Knee','Skater Jump','Mountain Climber','Plank Jack','Fast Feet'],
   tip:'Hardest cardio of the program. Go all in for 45 seconds, then breathe.'},
  {n:'Upper Push',          k:'upper',   r:3, ex:['Knee Push Ups','Incline Push Up (Chair)','Bottle Bent Over Row','Bottle Shoulder Press','Bottle Lateral Raises','Tricep Dip Chair','Plank Shoulder Taps'],
   tip:'Try one or two full push-ups at the start of each round. Then back to your knees.'},
  {n:'Core Push',           k:'core',    r:3, ex:['Dead Bug','Bicycle Crunch','Leg Raises','Russian Twist','Flutter Kick','Side Plank','Plank'],
   tip:'Your plank on day 1 felt long. See how today\'s feels.'},
  {n:'Full Body Push',      k:'train',   r:3, ex:['Bodyweight Squat','Knee Push Ups','Reverse Lunges','Mountain Climber','Hip Thrust','Half Burpee','Bicycle Crunch'],
   tip:'Everything you have learnt, in one session. Own every rep.'},
  {n:'Total Sweat',         k:'cardio',  r:3, ex:['Jumping Jack','Squat Pulse','High Knee','Alternating Lunges','Butt Kick','Plank Jack','Power Skip'],
   tip:'Last big sweat. Put on music you like and finish strong.'},
  {n:'Active Recovery',     k:'recover', r:2, ex:WL30_RECOVER,
   tip:'Rest well tonight. Two days left.'},

  {n:'Final Burn',          k:'train',   r:3, ex:['Bodyweight Squat','Half Burpee','Knee Push Ups','Walking Lunges','Mountain Climber','Bicycle Crunch','High Knee'],
   tip:'The last workout of the program. Leave nothing in the tank.'},
  {n:'Fit Test & Celebrate',k:'test',    r:1, ex:WL30_TEST,
   tip:'Same five moves as day 1. Count honestly — then look at how far you have come.'}
];

/* the program, in the shape the rest of the app reads */
const WL30=(function(){
  const weeks=[];
  for(let i=0;i<WL30_DAYS.length;i+=7)
    weeks.push({days:WL30_DAYS.slice(i,i+7).map(d=>({name:d.n, ex:d.ex, r:d.r, k:d.k, tip:d.tip}))});
  return {id:WL30_ID, name:WL30_NAME, sub:WL30_SUB, goal:'Fat Loss', level:'Beginner', dur:20, rounds:3,
    c1:'#2a1016', c2:'#0b0b0d', ac:'#EF4444', icon:'✦', weeks, hub:true, oneTime:true, price:WL30_PRICE,
    desc:'Thirty days to lose fat and build the habit, made for beginners. A workout every day at home — '+
         'a chair, two bottles of water and a mat are all you need — with a meal plan for the month, '+
         'a fit test on day 1 and day 30, and your progress tracked as you go.'};
})();
PROGRAMS = [WL30].concat(PROGRAMS);

/* ── state ── */
function wlData(){
  const d=HF.data.wl30||(HF.data.wl30={});
  d.check=d.check||{}; d.fit=d.fit||{}; d.body=d.body||{};
  return d;
}
function wlOwned(){ return ownsProgram(WL30); }
function wlDone(){ return Math.min(progDone(WL30_ID), WL30_DAYS.length); }
/* the day to do next, 0-based; 30 when the program is finished */
function wlNext(){ return wlDone(); }
function wlPhaseOf(gi){ const n=gi+1; return WL30_PHASES.filter(p=>n>=p.from&&n<=p.to)[0]||WL30_PHASES[0]; }
function wlPhaseIndex(gi){ return WL30_PHASES.indexOf(wlPhaseOf(gi)); }
const WL30_PIC={test:'act-equipment', train:'act-beginner', lower:'act-strength', upper:'act-equipment',
                cardio:'act-fatloss', core:'act-core', recover:'act-recovery'};
function wlPic(d){ return '/img/p/'+(WL30_PIC[d.k]||'act-beginner')+'.jpg'; }
function wlExercises(d){ return pickEx(d.ex, null); }
function wlMinutes(d){
  const rest=(typeof REST_SECS!=='undefined')?REST_SECS:20;
  return Math.max(1, Math.round(d.r*wlExercises(d).reduce((a,e)=>a+(e.dur||45)+rest,0)/60));
}
const WL30_GLY={test:'flag', train:'bolt', lower:'steps', upper:'workout', cardio:'flame', core:'target', recover:'leaf'};
const WL30_KIND={test:'Fit Test', train:'Full Body', lower:'Lower Body', upper:'Upper Body',
                 cardio:'Cardio', core:'Core', recover:'Recovery'};

/* ── the program's home ── */
let wlTab='plan', wlWeek=-1, wlMenuDay=-1;
function wlSetTab(t){ wlTab=t; renderWL30(); try{ const s=$('screen'), a=$('wl-tabs'); if(s&&a&&a.offsetTop) s.scrollTop=Math.max(0,a.offsetTop-70); }catch(e){} }
function renderWL30(){
  const p=WL30, owned=wlOwned(), done=wlDone(), tot=WL30_DAYS.length, nx=wlNext();
  const pct=Math.round(done/tot*100);
  if(wlWeek<0) wlWeek=wlPhaseIndex(Math.min(nx,tot-1));
  const pill=!owned ? {icon:'lock',label:'RM'+WL30_PRICE,go:'wlBuy()'}
           : nx<tot ? {icon:'play',label:'Day '+(nx+1),go:'wlOpenDay('+nx+')'} : null;
  let h=wlHero('program','',
    owned ? (nx<tot ? 'Day '+(nx+1)+' of '+tot+' · '+wlPhaseOf(nx).n : 'Program complete') : WL30_SUB+' · Beginner · At home',
    owned ? '' : 'One payment · yours for good', pill);

  h+='<div class="pdx-btns">';
  if(!owned){
    h+='<button class="bigbtn" onclick="wlBuy()">Get the Program · RM'+WL30_PRICE+'</button>'+
       '<button class="pdx-prev" onclick="openPaywall(\'BURN30 is included in HITFAT+.\')">'+glyph('star')+'Included with HITFAT+</button>';
  } else if(nx<tot){
    h+='<button class="bigbtn" onclick="wlOpenDay('+nx+')">'+glyph('play')+(done?'Continue · Day '+(nx+1):'Start Day 1')+'</button>';
  } else {
    h+='<button class="bigbtn" onclick="wlSetTab(\'progress\')">'+glyph('trophy')+'See Your Results</button>';
  }
  h+='</div>';

  /* one progress line, in days done (18 Oct: it said "Day 1 of 30" above and "Day 0 of 30" here) */
  if(owned) h+='<div class="wl-prog"><div class="wl-prog-h"><span>'+Math.min(done,tot)+' of '+tot+' days done</span><b>'+pct+'%</b></div>'+
    '<div class="pbar"><i style="width:'+pct+'%"></i></div></div>';

  h+='<div class="filters wl-tabs" id="wl-tabs">'+[['plan','Plan'],['food','Nutrition'],['progress','Progress'],['guide','Start Here']]
    .map(t=>'<button class="chip'+(wlTab===t[0]?' y':'')+'" onclick="wlSetTab(\''+t[0]+'\')">'+t[1]+'</button>').join('')+'</div>';

  if(wlTab==='food') h+=wlFood();
  else if(wlTab==='progress') h+=wlProgress();
  else if(wlTab==='guide') h+=wlGuide();
  else h+=wlPlan();
  $('pgd-body').innerHTML=h;
  if(wlTab==='progress' && owned) loadBoard('burn30','lb-burn30');
}

/* The poster heads every page of the program, so tapping it on Home opens
   the same picture: whole on the program's home, its top (the name and the
   two faces) as a banner on a day. The poster carries the name, so the home
   adds no title over it. */
function wlHero(kicker,title,sub,meta,pill){
  return pdxBar(kicker,pill)+
    '<div class="wl-hero'+(kicker==='day'?' day':'')+'"><img src="'+WL30_POSTER+'" alt="HITFAT BURN30: 30 days at home"></div>'+
    '<div class="wl-hero-tx">'+(title?'<div class="t">'+title+'</div>':'')+
    '<div class="s">'+sub+'</div>'+(meta?'<div class="m">'+meta+'</div>':'')+'</div>';
}

/* Plan: today, the checklist, the 30-day calendar, then the week as episodes */
function wlPlan(){
  const owned=wlOwned(), done=wlDone(), tot=WL30_DAYS.length, nx=wlNext();
  let h='';
  if(nx<tot){
    const d=WL30_DAYS[nx];
    h+=fsec(owned?'Today':'Day 1','');
    h+='<div class="wl-today" onclick="wlOpenDay('+nx+')">'+
      '<div class="wl-today-im">'+hpoArt(WL30,{ar:FA.hero})+'</div>'+   /* the poster's own athlete, cut out on its red (18 Oct) */
      '<div class="wl-today-tx"><div class="k">Day '+(nx+1)+' · '+wlPhaseOf(nx).n+'</div>'+
      '<div class="t">'+d.n+'</div>'+
      '<div class="m">'+wlMinutes(d)+' min · '+d.ex.length+' moves · '+d.r+(d.r===1?' round':' rounds')+'</div>'+
      '<button class="bigbtn wl-go" onclick="event.stopPropagation();wlOpenDay('+nx+')">'+glyph(owned?'play':'lock')+(owned?'Start':'Preview')+'</button></div></div>';
  }
  if(owned) h+=wlChecklist();

  h+=fsec('Your 30 Days','Tap any day to see it.');
  h+='<div class="wl-cal">'+WL30_PHASES.map((ph,pi)=>
    '<div class="wl-cal-row"><div class="wl-cal-w">W'+(pi+1)+'</div><div class="wl-cal-d">'+
    WL30_DAYS.slice(ph.from-1,ph.to).map((d,j)=>{
      const gi=ph.from-1+j, st=gi<done?'done':(gi===nx&&owned?'now':'');
      return '<button class="wl-day '+st+' k-'+d.k+'" onclick="wlOpenDay('+gi+')" aria-label="Day '+(gi+1)+', '+hesc(d.n)+'">'+
        '<b>'+(gi+1)+'</b>'+(gi<done?glyph('check'):d.k==='recover'?glyph('moon'):d.k==='test'?glyph('flag'):'<i></i>')+'</button>';
    }).join('')+'</div></div>').join('')+'</div>'+
    '<div class="wl-key"><span><i class="kd"></i>Done</span><span><i class="kn"></i>Today</span>'+
    '<span>'+glyph('flag')+'Fit test</span><span>'+glyph('moon')+'Recovery</span></div>';

  const ph=WL30_PHASES[wlWeek]||WL30_PHASES[0];
  h+='<div class="filters pdx-weeks">'+WL30_PHASES.map((x,i)=>
    '<button class="chip'+(i===wlWeek?' y':'')+'" onclick="wlWeek='+i+';renderWL30()">Week '+(i+1)+'</button>').join('')+'</div>';
  h+='<div class="wl-phase"><div class="t">'+ph.n+'</div><div class="s">'+ph.s+'</div></div>';
  const pc=hpoPal(WL30);
  h+='<div class="pdx-eps">'+WL30_DAYS.slice(ph.from-1,ph.to).map((d,j)=>{
    const gi=ph.from-1+j, isDone=gi<done;
    /* numbered tiles in BURN30 red, the kind of day as a glyph (18 Oct): the
       studio photos of five other people on grey did not belong to this plan */
    return '<div class="fwr pdx-ep'+(isDone?' done':'')+'" onclick="wlOpenDay('+gi+')">'+
      '<div class="th pdx-dt" style="--a:'+pc[0]+';--b:'+pc[1]+'"><span class="dg">'+glyph(WL30_GLY[d.k]||'workout')+'</span>'+
        '<span class="k">DAY</span><b>'+(gi+1)+'</b>'+(isDone?'<span class="ok">'+glyph('check')+'</span>':'')+'</div>'+
      '<div class="tx"><div class="t">'+d.n+'</div>'+
      '<div class="m">Day '+(gi+1)+' · '+WL30_KIND[d.k]+' · '+wlMinutes(d)+' min</div></div>'+
      '<span class="pdx-chev">›</span></div>';
  }).join('')+'</div>';
  return h;
}

/* four small wins a day, ticked by hand — the workout ticks itself */
const WL30_CHECKS=[['water','8 glasses of water','water'],['food','Ate to the plan','food'],['sleep','7 hours of sleep','moon']];
function wlChecklist(){
  const c=wlData().check[iso(0)]||{}, trained=doneToday();
  const row=(on,label,icon,go)=>'<button class="wl-chk'+(on?' on':'')+'"'+(go?' onclick="'+go+'"':' disabled')+'>'+
    '<span class="b">'+(on?glyph('check'):'')+'</span>'+ic(icon)+'<span class="l">'+label+'</span></button>';
  const n=(trained?1:0)+WL30_CHECKS.filter(x=>c[x[0]]).length;
  return fsec('Today\'s Checklist',n+' of 4 done')+'<div class="wl-chks">'+
    row(trained,'Today\'s workout','workout','')+
    WL30_CHECKS.map(x=>row(!!c[x[0]],x[1],x[2],'wlTick(\''+x[0]+'\')')).join('')+'</div>';
}
function wlTick(k){
  const d=wlData(), t=iso(0); d.check[t]=d.check[t]||{};
  d.check[t][k]=!d.check[t][k]; HF.save(); renderWL30();
}

/* ── a day ── */
function wlOpenDay(gi){
  const d=WL30_DAYS[gi]; if(!d) return;
  const p=WL30, owned=wlOwned(), exs=wlExercises(d), ph=wlPhaseOf(gi);
  curProg=p;
  let day=null, c=0; p.weeks.forEach(w=>w.days.forEach(x=>{ if(c===gi) day=x; c++; }));
  curDay={p, day, gi};
  let h=wlHero('day',d.n,'Day '+(gi+1)+' of 30 · '+ph.n,
    wlMinutes(d)+' min · '+exs.length+' moves · '+d.r+(d.r===1?' round':' rounds'),
    owned?{icon:'play',label:'Start',go:'playDay()'}:{icon:'lock',label:'RM'+WL30_PRICE,go:'wlBuy()'});
  h+='<div class="pdx-btns">'+(owned
    ? '<button class="bigbtn" onclick="playDay()">'+glyph('play')+'Start Workout</button>'+
      '<button class="pdx-prev" onclick="completeDay()">'+glyph('check')+'Mark done without playing</button>'
    : '<button class="bigbtn" onclick="wlBuy()">'+glyph('lock')+'Unlock · RM'+WL30_PRICE+'</button>')+'</div>';
  h+='<div class="wl-tip">'+ic('spark')+'<div><div class="k">Coach\'s note</div><div class="t">'+d.tip+'</div></div></div>';
  if(d.k==='test') h+='<div class="wl-tip wl-tip-test">'+ic('flag')+'<div><div class="k">How the fit test works</div>'+
    '<div class="t">One round, five moves. Count your reps for each — for the plank, the seconds you hold. '+
    'Write them in Progress when you finish.</div></div></div>';
  if(d.k==='recover') h+='<div class="wl-tip">'+ic('leaf')+'<div><div class="k">Recovery day</div>'+
    '<div class="t">Move slowly and breathe. This is the day your body uses to get stronger.</div></div></div>';
  h+='<div class="fsec"><div class="ft">In This Workout</div><div class="fs">Tap a movement to watch it.</div></div>'+
    '<div class="pdx-eps">'+exs.map((e,i)=>'<div class="pdx-ex" onclick="'+(owned?'playExercise(\''+e.n.replace(/'/g,"\\'")+'\')':'wlBuy()')+'">'+
      '<span class="n">'+(i+1)+'</span>'+
      '<div class="tx"><div class="t">'+e.n+'</div><div class="m">'+(e.dur||45)+'s · '+e.m+' · '+e.eq+'</div></div>'+
      '<span class="pdx-play">'+glyph(owned?'play':'lock')+'</span></div>').join('')+'</div>';
  h+='<div class="wl-need">'+ic('chair')+'<span>You need: '+wlNeeds(exs)+'</span></div>';
  $('dd-body').innerHTML=h;
  hidePanels(); $('daydetail').style.display='block'; $('screen').scrollTop=0;
}
function wlNeeds(exs){
  const n=['a mat'];
  if(exs.some(e=>/Chair|Step Up|Incline Push Up \(Chair\)|Tricep Dip Chair/.test(e.n)||e.eq==='Chair')) n.push('a sturdy chair');
  if(exs.some(e=>e.eq==='Bottle'||/^Bottle/.test(e.n))) n.push('two full water bottles');
  if(exs.some(e=>/Wall/.test(e.n))) n.push('a wall');
  return n.join(', ');
}

/* ── nutrition: a meal plan for the 30 days, from the person's own numbers ── */
let _wlPlan=null, _wlPlanKey='';
function wlProfile(){
  const n=HF.data.nutrition||{}, w=wlData();
  const pr=w.profile||{};
  return {gender:pr.gender||n.gender||'female', age:pr.age||n.a||0, wt:pr.wt||n.w||0, ht:pr.ht||n.h||0};
}
function wlMealPlan(){
  const pr=wlProfile(); if(!pr.wt||!pr.ht||!pr.age) return null;
  const key=[pr.gender,pr.age,pr.wt,pr.ht].join('|');
  if(_wlPlan && _wlPlanKey===key) return _wlPlan;
  _wlPlan=buildPlan({goal:'loss', rate:0.5, gender:pr.gender, age:pr.age, wt:pr.wt, ht:pr.ht,
                     activity:1.375, struct:'3x', days:30, styles:['hiprotein'], prefs:[]});
  _wlPlanKey=key;
  return _wlPlan;
}
let _wlSex='';
function wlSaveProfile(){
  const g=x=>parseFloat(($(x)||{}).value);
  const wt=g('wl-wt'), ht=g('wl-ht'), age=parseInt(($('wl-age')||{}).value,10);
  if(!wt||!ht||!age){ toast('Fill in weight, height and age'); return; }
  const d=wlData(); d.profile={gender:_wlSex||wlProfile().gender, wt, ht, age}; HF.save();
  renderWL30();
}
/* the food in Malay (18 Oct, Seth: "nutrition tu makanan bahasa melayu"):
   dish names, items, portions and the shopping list, from the app's own
   dictionary; the screen around them stays English like the rest */
const WL30_MS={
  /* dishes */
  'Wholegrain cereal + milk + fruit':'Bijirin penuh + susu + buah','Egg fried rice + vegetables':'Nasi goreng telur + sayur',
  'Bread wrap + tuna + salad':'Wrap roti + tuna + salad','Grilled chicken chop + potato + salad':'Chicken chop panggang + kentang + salad',
  'Rice vermicelli soup + greens':'Bihun sup + sayur hijau','Brown rice buddha bowl':'Mangkuk nasi perang campur',
  'Tofu + tempe + vegetables + a little rice':'Tauhu + tempe + sayur + sedikit nasi','Soy tempe + grilled aubergine + brown rice':'Tempe kicap + terung bakar + nasi perang',
  'Greek yoghurt + granola + fruit':'Yogurt Greek + granola + buah','Wholemeal bread + omelette + cucumber':'Roti mil penuh + telur dadar + timun',
  'Oats + banana + milk':'Oat + pisang + susu','Chicken tomyam + a little rice':'Tomyam ayam + sedikit nasi','Asam laksa, lighter version':'Asam laksa, versi ringan',
  'Rice + egg + anchovy sambal + vegetables':'Nasi + telur + sambal ikan bilis + sayur','Chicken salad + boiled egg + dressing':'Salad ayam + telur rebus + sos salad',
  'Fried noodles, portion controlled':'Mi goreng, porsi terkawal','Vegetable soup + tofu + a little rice':'Sup sayur + tauhu + sedikit nasi',
  'Nasi lemak, portion controlled':'Nasi lemak, porsi terkawal','Fried noodles with vegetables + tempe':'Mi goreng sayur + tempe',
  'Chicken stir-fry + vegetables + egg + rice':'Ayam tumis + sayur + telur + nasi','Grilled fish + ulam + sambal + a little rice':'Ikan bakar + ulam + sambal + sedikit nasi',
  'Boiled eggs + wholemeal bread + tea':'Telur rebus + roti mil penuh + teh','Rice vermicelli chicken soup':'Bihun sup ayam',
  'Rice + grilled fish + vegetables + sambal':'Nasi + ikan bakar + sayur + sambal','Steamed ginger fish + rice + vegetables':'Ikan stim halia + nasi + sayur',
  'Ginger soy chicken + vegetables + a little rice':'Ayam kicap halia + sayur + sedikit nasi','Brown rice + tempe + tofu + vegetables':'Nasi perang + tempe + tauhu + sayur',
  'Chicken vegetable soup + a little rice':'Sup sayur ayam + sedikit nasi','Fried rice vermicelli + beans':'Bihun goreng + kacang',
  'Wholemeal bread + tuna salad':'Roti mil penuh + salad tuna','Rice + vegetable curry + tofu + beans':'Nasi + kari sayur + tauhu + kacang',
  'Steamed rice + chicken, portion controlled':'Nasi ayam, porsi terkawal',
  /* foods */
  'Fried egg':'Telur goreng','Wholemeal wrap':'Wrap mil penuh','Canned tuna in water':'Tuna tin dalam air','Low-fat mayonnaise':'Mayonis rendah lemak',
  'Boiled chickpeas':'Kacang kuda rebus','Grilled tofu':'Tauhu bakar','Olive oil':'Minyak zaitun','Oats (cooked)':'Oat (dimasak)',
  'Rice vermicelli / laksa noodles':'Bihun / mi laksa','Mackerel / sardines':'Ikan kembung / sardin','Cucumber + pineapple':'Timun + nanas',
  'Asam laksa broth':'Kuah asam laksa','Chicken / egg':'Ayam / telur','Mixed vegetable soup':'Sup sayur campur','Boiled tofu':'Tauhu rebus',
  'Stir-fried spinach':'Bayam tumis','Fried tempe':'Tempe goreng','Ulam / cucumber':'Ulam / timun','Shredded boiled chicken':'Ayam rebus carik',
  'Mustard greens / spinach':'Sawi / bayam','Steamed fish':'Ikan stim','Ginger + soy sauce':'Halia + kicap','Boiled broccoli / kailan':'Brokoli / kailan rebus',
  'Soy chicken, light on oil':'Ayam kicap, kurang minyak','Cut watermelon':'Tembikai potong','Boiled chicken, skinless':'Ayam rebus, tanpa kulit',
  'Chickpeas + sweetcorn':'Kacang kuda + jagung manis','Cut papaya':'Betik potong','Vegetable curry (dhal + pumpkin)':'Kari sayur (dal + labu)',
  'Stir-fried long beans':'Kacang panjang tumis','Sambal':'Sambal','Orange':'Oren','Salad + tomato':'Salad + tomato','Salad + ulam':'Salad + ulam',
  'Cucumber + tomato':'Timun + tomato',
  /* parts */
  'a little rice':'sedikit nasi','fruit':'buah','milk':'susu','potato':'kentang','salad':'salad','tuna':'tuna','greens':'sayur hijau','beans':'kacang'};
function wlMs1(s){ if(WL30_MS.hasOwnProperty(s)) return WL30_MS[s]; const t=(typeof i18n==='function')?i18n(s):null; return t; }
function wlMs(s){
  s=String(s||''); const t=wlMs1(s); if(t) return t;
  /* a dish with a fruit after it ('… + Banana'): the longest known start, then the rest one by one */
  const parts=s.split(' + ');
  for(let k=parts.length-1;k>=1;k--){ const h=wlMs1(parts.slice(0,k).join(' + ')); if(h) return h+' + '+parts.slice(k).map(x=>wlMs1(x)||x).join(' + '); }
  return parts.map(x=>wlMs1(x)||x).join(' + ');
}
/* portions in Malay: the measures; the numbers and grams as they are */
const WL30_UNITS=[[/\bsmall bowl\b/g,'mangkuk kecil'],[/\blarge bowl\b/g,'mangkuk besar'],[/\bbowl\b/g,'mangkuk'],[/\blarge palm\b/g,'tapak tangan besar'],
  [/\bpalm\b/g,'tapak tangan'],[/\bsmall pancakes\b/g,'pancake kecil'],[/\bfist\b/g,'kepal'],[/\bhandfuls?\b/g,'genggam'],[/\bcooked\b/g,'masak'],
  [/\btbsp\b/g,'sudu besar'],[/\btsp\b/g,'sudu kecil'],[/\bglass\b/g,'gelas'],[/\bcup\b/g,'cawan'],[/\bcan\b/g,'tin'],[/\bladle\b/g,'senduk'],
  [/\bstick\b/g,'batang'],[/\bwhole\b/g,'biji'],[/\bpieces?\b/g,'ketul'],[/\bblocks?\b/g,'keping'],[/\bslices?\b/g,'keping'],
  [/(\d) medium\b/g,'$1 biji sederhana'],[/\bmedium\b/g,'sederhana'],[/\ba little\b/g,'sedikit']];
function wlPortion(s){ let t=String(s||''); WL30_UNITS.forEach(r=>{ t=t.replace(r[0],r[1]); }); return t; }
function wlFood(){
  if(!wlOwned()) return wlLockedNote('food','A meal plan for all 30 days',
    'Built from your weight, height and age — breakfast, lunch and dinner every day, Malaysian food, '+
    'three options for every meal and a shopping list for each week.');
  const plan=wlMealPlan();
  if(!plan){
    const pr=wlProfile(); if(!_wlSex) _wlSex=pr.gender;
    const fld=(id,l,u,v,m)=>'<label class="esf"><span>'+l+'</span><input id="'+id+'" inputmode="'+m+'" value="'+(v||'')+'"><em>'+u+'</em></label>';
    return fsec('Your Meal Plan','Three numbers and it builds itself.')+
      '<div class="esfields">'+fld('wl-wt','Weight','kg',pr.wt,'decimal')+fld('wl-ht','Height','cm',pr.ht,'decimal')+fld('wl-age','Age','years',pr.age,'numeric')+'</div>'+
      '<div class="obseg"><button class="'+(_wlSex==='male'?'on':'')+'" onclick="_wlSex=\'male\';renderWL30()">Male</button>'+
      '<button class="'+(_wlSex==='female'?'on':'')+'" onclick="_wlSex=\'female\';renderWL30()">Female</button></div>'+
      '<button class="bigbtn esave" onclick="wlSaveProfile()">Build My Meal Plan</button>';
  }
  const n=plan.nut, tot=plan.days.length;
  if(wlMenuDay<0) wlMenuDay=Math.min(wlNext(),tot-1);
  const day=plan.days[wlMenuDay];
  let h='<div class="nstage wl-stage"><div class="nstage-k">Your daily target</div>'+
    '<div class="nstage-n">'+n.cal.toLocaleString()+'<span> kcal</span></div>'+
    '<div class="nstage-s">About 0.5 kg a week · high protein</div>'+
    '<div class="nstage-g">'+[[n.prot+'g','Protein'],[n.carb+'g','Carbs'],[n.fat+'g','Fat'],['8','Glasses']]
      .map(x=>'<div><b>'+x[0]+'</b><span>'+x[1]+'</span></div>').join('')+'</div></div>';
  h+=fsec('Menu','Day '+(wlMenuDay+1)+' · '+day.total.toLocaleString()+' kcal');
  h+='<div class="hscroll wl-mdays">'+plan.days.map((d,i)=>
    '<button class="wl-md'+(i===wlMenuDay?' on':'')+'" onclick="wlMenuDay='+i+';renderWL30()"><small>Day</small><b>'+(i+1)+'</b></button>').join('')+'</div>';
  h+='<div class="wl-meals">'+day.slots.map((s,si)=>{
    const sid='wlm-'+wlMenuDay+'-'+si;
    return '<div class="mpslot" id="'+sid+'"><div class="mpslot-h"><div><div class="t">'+s.label+'</div>'+
      '<div class="m">'+s.time+' · about '+s.target+' kcal</div></div>'+
      '<div class="mpopts">'+s.options.map((o,oi)=>'<button class="mpo'+(oi===0?' on':'')+'" aria-label="Option '+(oi+1)+'" onclick="mpOpt(\''+sid+'\','+oi+')">'+(oi+1)+'</button>').join('')+'</div></div>'+
      s.options.map((o,oi)=>'<div class="mpopt" style="display:'+(oi===0?'block':'none')+';">'+
        '<div class="mpopt-h"><div class="t">'+wlMs(o.name)+'</div><div class="k">'+kcalOf(o)+' kcal</div></div>'+
        o.items.map(it=>'<div class="mpitem"><div><div class="t">'+wlMs(it.food)+'</div><div class="m">'+wlPortion(it.portion)+'</div></div><div class="k">'+it.kcal+'</div></div>').join('')+
      '</div>').join('')+'</div>';
  }).join('')+'</div>';
  /* the week's shopping, from the first option of every meal */
  const ph=wlPhaseOf(wlMenuDay), shop={};
  plan.days.slice(ph.from-1,ph.to).forEach(d=>d.slots.forEach(s=>{ const o=s.options[0]; if(o) o.items.forEach(it=>{ shop[it.food]=(shop[it.food]||0)+1; }); }));
  const list=Object.keys(shop).sort((a,b)=>shop[b]-shop[a]);
  h+=fsec('Shopping List','Week '+(wlPhaseIndex(wlMenuDay)+1)+' · days '+ph.from+'–'+ph.to);
  h+='<div class="wl-shop">'+list.map(f=>'<div><span>'+wlMs(f)+'</span><b>×'+shop[f]+'</b></div>').join('')+'</div>';
  h+=fsec('Portion Guide','No scale needed — use your hand.');
  h+='<div class="wl-hands">'+[['Protein','1 tapak tangan','daging, ikan, telur, tauhu'],['Carbs','1 kepal','nasi, mi, roti'],
      ['Vegetables','2 genggam','separuh pinggan'],['Fat','1 ibu jari','minyak, mentega, kacang']]
    .map(x=>'<div><b>'+x[1]+'</b><span>'+x[0]+'</span><small>'+x[2]+'</small></div>').join('')+'</div>';
  h+='<div class="wl-tips">'+planTips({goal:'loss', struct:'3x', styles:['hiprotein']}).slice(0,4).map(t=>'<div>'+t+'</div>').join('')+'</div>';
  h+='<button class="authalt" onclick="wlForgetNumbers()">Change my numbers</button>';
  return h;
}
function wlForgetNumbers(){ const d=wlData(); d.profile={gender:wlProfile().gender}; _wlPlan=null; HF.save(); renderWL30(); }

/* ── progress: the fit test, the body, photos, the badges ── */
const WL30_FIT=[['squat','Squats','reps'],['push','Knee push-ups','reps'],['jack','Jumping jacks','reps'],['crunch','Crunches','reps'],['plank','Plank','seconds']];
const WL30_CHECKINS=[1,15,30];
function wlProgress(){
  if(!wlOwned()) return wlLockedNote('chart','Watch yourself change',
    'A fit test on day 1 and day 30, your weight and waist on days 1, 15 and 30, before-and-after photos, '+
    'and a badge for every week you finish.');
  const w=wlData(), done=wlDone();
  let mins=0; Object.keys(HF.data.sessions).forEach(k=>{ if(k.indexOf(WL30_ID+'-')===0) mins+=(HF.data.sessions[k].mins||0); });
  let h='<div class="wl-stats">'+[[done,'Days done'],[liveStreak(),'Day streak'],[Math.round(mins),'Minutes']]
    .map(x=>'<div><b>'+x[0]+'</b><span>'+x[1]+'</span></div>').join('')+'</div>';

  h+=fsec('Leaderboard','Everyone on BURN30, by the days they have played.');
  h+='<div id="lb-burn30"></div>';
  h+=fsec('Badges','One for every week you finish.');
  h+='<div class="wl-badges">'+WL30_PHASES.map((ph,i)=>{
    const got=done>=ph.to;
    return '<div class="wl-badge'+(got?' on':'')+'"><div class="m">'+(got?ic('medal'):ic('lock'))+'</div>'+
      '<b>'+ph.n+'</b><span>'+(got?'Earned':'Day '+ph.to)+'</span></div>';
  }).join('')+'</div>';
  if(done>=WL30_DAYS.length) h+='<div class="wl-cert">'+ic('trophy')+'<div class="t">30 Days Complete</div>'+
    '<div class="s">'+hesc(((HF.data.prefs&&HF.data.prefs.name)||'You').trim())+' finished HITFAT BURN30 — 30 workouts in 30 days.</div>'+
    '<button class="bigbtn" onclick="wlShare()">'+glyph('share')+'Share It</button></div>';

  /* fit test, day 1 against day 30 */
  h+=fsec('Fit Test','Day 1 against day 30.');
  h+='<div class="wl-fit"><div class="wl-fit-h"><span></span><b>Day 1</b><b>Day 30</b><b>Change</b></div>'+
    WL30_FIT.map(f=>{
      const a=+(w.fit.d1||{})[f[0]]||0, b=+(w.fit.d30||{})[f[0]]||0;
      const ch=a&&b ? Math.round((b-a)/a*100) : null;
      return '<div class="wl-fit-r"><span>'+f[1]+'<small>'+f[2]+'</small></span>'+
        '<input inputmode="numeric" aria-label="'+f[1]+' day 1" value="'+(a||'')+'" onchange="wlSetFit(\'d1\',\''+f[0]+'\',this.value)">'+
        '<input inputmode="numeric" aria-label="'+f[1]+' day 30" value="'+(b||'')+'" onchange="wlSetFit(\'d30\',\''+f[0]+'\',this.value)">'+
        '<b class="'+(ch>0?'up':ch<0?'dn':'')+'">'+(ch===null?'—':(ch>0?'+':'')+ch+'%')+'</b></div>';
    }).join('')+'</div>';

  /* the body: weight and waist on days 1, 15 and 30 */
  h+=fsec('Body Check-ins','First thing in the morning, before breakfast.');
  h+='<div class="wl-fit wl-body"><div class="wl-fit-h"><span></span>'+WL30_CHECKINS.map(n=>'<b>Day '+n+'</b>').join('')+'</div>'+
    [['kg','Weight','kg'],['waist','Waist','cm']].map(m=>'<div class="wl-fit-r"><span>'+m[1]+'<small>'+m[2]+'</small></span>'+
      WL30_CHECKINS.map(n=>'<input inputmode="decimal" aria-label="'+m[1]+' day '+n+'" value="'+((w.body[n]||{})[m[0]]||'')+'" onchange="wlSetBody('+n+',\''+m[0]+'\',this.value)">').join('')+'</div>').join('')+
    '</div>';
  const b1=w.body[1]||{}, bl=w.body[30]&&w.body[30].kg?w.body[30]:(w.body[15]||{});
  if(b1.kg&&bl.kg){ const dk=Math.round((bl.kg-b1.kg)*10)/10;
    h+='<div class="wl-delta">'+(dk<0?'Down '+(-dk)+' kg':dk>0?'Up '+dk+' kg':'Holding steady')+
      (b1.waist&&bl.waist?' · waist '+(bl.waist-b1.waist<=0?'down '+Math.round((b1.waist-bl.waist)*10)/10:'up '+Math.round((bl.waist-b1.waist)*10)/10)+' cm':'')+'</div>'; }

  /* photos stay on the phone they were taken with */
  h+=fsec('Progress Photos','Saved on this phone only.');
  h+='<div class="wl-photos">'+WL30_CHECKINS.map(n=>{
    const src=wlPhoto(n);
    return '<label class="wl-ph'+(src?' has':'')+'"'+(src?' style="background-image:url(\''+src+'\')"':'')+'>'+
      '<input type="file" accept="image/*" onchange="wlAddPhoto('+n+',this)">'+
      (src?'':ic('photo'))+'<span>Day '+n+'</span></label>';
  }).join('')+'</div>';
  return h;
}
function wlSetFit(when,k,v){ const w=wlData(); w.fit[when]=w.fit[when]||{}; w.fit[when][k]=parseInt(v,10)||0; HF.save(); renderWL30(); }
function wlSetBody(n,k,v){ const w=wlData(); w.body[n]=w.body[n]||{}; w.body[n][k]=parseFloat(v)||0; HF.save(); renderWL30(); }
function wlPhotoKey(n){ return 'hf_wl30_photo_'+(HF.userId||'me')+'_'+n; }
function wlPhoto(n){ try{ return localStorage.getItem(wlPhotoKey(n))||''; }catch(e){ return ''; } }
function wlAddPhoto(n,input){
  const f=input&&input.files&&input.files[0]; if(!f) return;
  const r=new FileReader();
  r.onload=()=>{ const im=new Image(); im.onload=()=>{
    const s=Math.min(1,640/Math.max(im.width,im.height)), c=document.createElement('canvas');
    c.width=Math.round(im.width*s); c.height=Math.round(im.height*s);
    c.getContext('2d').drawImage(im,0,0,c.width,c.height);
    try{ localStorage.setItem(wlPhotoKey(n), c.toDataURL('image/jpeg',.72)); toast('Photo saved'); }
    catch(e){ toast('Not enough space on this phone for the photo'); }
    renderWL30();
  }; im.src=r.result; };
  r.readAsDataURL(f);
}
function wlShare(){
  const t='I just finished HITFAT BURN30 — 30 workouts in 30 days.';
  try{ if(navigator.share){ navigator.share({title:'BURN30 Complete', text:t, url:'https://app.hitfat.io'}); return; } }catch(e){}
  try{ navigator.clipboard.writeText(t+' https://app.hitfat.io'); toast('Copied — paste it anywhere'); }catch(e){ toast(t); }
}

/* ── start here ── */
function wlGuide(){
  let h=fsec('How It Works','');
  h+='<div class="wl-steps">'+[
    ['flag','Day 1: the fit test','Five moves, one round. It is your starting line.'],
    ['workout','A workout every day','15 to 25 minutes at home. Follow the video, the timer counts for you.'],
    ['food','Eat to your plan','Your calories and a menu for every day, in Nutrition.'],
    ['chart','Day 30: test again','Same five moves. Then compare in Progress.']]
    .map((s,i)=>'<div class="wl-step"><span class="n">'+(i+1)+'</span><div><div class="t">'+s[1]+'</div><div class="m">'+s[2]+'</div></div></div>').join('')+'</div>';
  h+=fsec('What You Need','Nothing you have to buy.');
  h+='<div class="wl-kit">'+[['person','A mat or a towel'],['chair','A sturdy chair'],['water','Two water bottles'],['clock','20 minutes a day']]
    .map(k=>'<div>'+ic(k[0])+'<span>'+k[1]+'</span></div>').join('')+'</div>';
  h+=fsec('The Five Phases','');
  h+='<div class="wl-phases">'+WL30_PHASES.map((p,i)=>'<div><b>'+p.n+'</b><span>Days '+p.from+'–'+p.to+'</span><small>'+p.s+'</small></div>').join('')+'</div>';
  h+=fsec('The Rules','');
  h+='<div class="wl-tips">'+[
    'Do the days in order. Missed one? Do it today — the plan waits for you.',
    'Every move has an easier version: march instead of jump, push-ups on your knees or against a wall.',
    'Weigh yourself on days 1, 15 and 30 only. Daily numbers go up and down and mean little.',
    'Drink 8 glasses of water a day. Hunger is often thirst.',
    'Sleep 7 hours. Fat is lost while you recover, not only while you sweat.',
    'Pain in a joint is a stop sign. Muscle burn is not.']
    .map(t=>'<div>'+t+'</div>').join('')+'</div>';
  h+=fsec('Questions','');
  h+='<div class="wl-faq">'+[
    ['I missed a day.','Carry on from the day you are on. Thirty workouts is the goal, not thirty dates in a row.'],
    ['It is too hard.','Do fewer reps, rest longer, or march instead of jumping. Finishing slowly beats stopping.'],
    ['It is too easy.','Fill your bottles fuller, move slower on the way down, and add a round.'],
    ['How long do I keep it?','For good. One payment, no subscription. Do it again whenever you like.']]
    .map(q=>'<details><summary>'+q[0]+'</summary><div>'+q[1]+'</div></details>').join('')+'</div>';
  if(typeof COACH_WA!=='undefined' && COACH_WA)
    h+='<button class="bigbtn sec" onclick="window.open(\'https://wa.me/'+COACH_WA+'\',\'_blank\',\'noopener\')">'+glyph('people')+'Ask the Coach on WhatsApp</button>';
  return h;
}

/* what a tab looks like before the program is bought */
function wlLockedNote(icon,title,text){
  return '<div class="wl-lock">'+ic(icon)+'<div class="t">'+title+'</div><div class="s">'+text+'</div>'+
    '<button class="bigbtn" onclick="wlBuy()">Get the Program · RM'+WL30_PRICE+'</button></div>';
}

/* ── buying it ── */
function wlBuy(){
  if(wlOwned()) return openProgram(WL30_ID);
  $('pw-body').innerHTML=
    '<div class="pwtop"><span></span><button class="pwx" aria-label="Close" onclick="closeProduct()">✕</button></div>'+
    '<img class="wl-buy-poster" src="'+WL30_POSTER+'" alt="HITFAT BURN30: 30 days at home">'+
    '<div class="pwlist">'+[
      ['workout','30 workouts, made for beginners','15–25 minutes at home, video for every move'],
      ['food','A meal plan for the month','Your calories, Malaysian food, a weekly shopping list'],
      ['chart','Fit test, check-ins, photos','Day 1 against day 30, in numbers'],
      ['trophy','Yours for good','One payment. No subscription, nothing to cancel']]
      .map(b=>'<div class="pwf"><div class="ic">'+ic(b[0])+'</div><div><div class="t">'+b[1]+'</div><div class="m">'+b[2]+'</div></div></div>').join('')+'</div>'+
    '<div class="pwprice"><div class="p">RM'+WL30_PRICE+'</div><div class="per">one payment</div></div>'+
    '<button class="bigbtn" onclick="startCheckout(\'prog_'+WL30_ID+'\')">Buy for RM'+WL30_PRICE+'</button>'+
    '<button class="authalt" onclick="openPaywall(\'BURN30 is included in HITFAT+.\')">Or get everything with HITFAT+</button>'+
    '<div class="wl-claim"><div class="t">Bought it on our website?</div>'+
    '<div class="s">Sign in with the email you paid with and it opens by itself. Paid with a different email? Enter the order number from your receipt.</div>'+
    '<div class="wl-claim-f"><input id="wl-order" placeholder="Order number" autocomplete="off"><button onclick="wlClaim()">Unlock</button></div></div>';
  $('pwm').classList.add('on');
  try{ $('pwm').scrollTop=0; }catch(e){}
}
async function wlClaim(){
  const o=String((($('wl-order')||{}).value)||'').trim();
  if(!o) return toast('Enter the order number from your receipt');
  if(!sb||!HF.userId) return toast('Sign in first');
  try{
    const r=await sb.rpc('plus_claim_landing',{p_order:o});
    if(r.error) throw r.error;
    await loadEntitlement();
    if(wlOwned()){ closeProduct(); toast('Unlocked — welcome to the 30 days'); openProgram(WL30_ID); }
    else toast('No paid order with that number. Check the receipt, or message us.');
  }catch(e){ toast('Could not check that order — try again in a moment.'); }
}
/* Purchases made on the landing page wait under the buyer's email until they
   sign in; this turns them into the account's own. Quietly — nothing to show
   when there is nothing to claim. */
async function claimLandingPurchases(){
  if(!sb||!HF.userId) return;
  try{ await sb.rpc('plus_claim_landing',{p_order:null}); }catch(e){}
}

/* ── the Home card: the program for its owner, its offer for everyone else ── */
function wlHomeCard(){
  const owned=wlOwned(), done=wlDone(), tot=WL30_DAYS.length, nx=wlNext();
  if(owned && nx>=tot) return '';
  const d=WL30_DAYS[Math.min(nx,tot-1)];
  /* (16 Oct) the same poster as in Train, after FIIT: the athlete cut out on
     HITFAT red, BURN30 big, the day it is on once started, and the button
     that starts today's day (or shows the program to someone without it) */
  if(typeof hpoCard!=='function') return '';
  if(owned && done)
    return hpoCard(WL30,{wide:true,kick:'Day '+(nx+1)+' · '+wlMinutes(d)+' min',go:'wlOpenDay('+nx+')'});
  if(owned)
    return hpoCard(WL30,{wide:true,kick:contentOpen()?'New · In HITFAT+':'Yours · Ready when you are',go:'wlOpenDay(0)'});
  return hpoCard(WL30,{wide:true,kick:'New Program · RM'+WL30_PRICE,go:"openProgram('"+WL30_ID+"')"});
}
