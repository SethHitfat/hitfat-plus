/* ═══════════════════════════════════════════════════════════════
   MY PLAN · a class member's own week (27 Oct 2026)

   Seth: class members (Active, Ladies, Mens) should feel the app is
   theirs, the way MAK2FIT 30 builds a plan from her answers; and it asks
   whether they train at HITFAT only, or at HITFAT and online at home,
   and puts it all in one timetable.

   Eight questions, then a week:
     class days   the days they can come, on the space's real timetable
                  (Kelas.data.classes), each at the class nearest the time
                  of day they prefer
     home days    for "HITFAT + online": short sessions on the days between
                  classes, built from HITFAT's filmed library for the goal,
                  the kit at home and anything that hurts
     recovery     one easy day when the week is full
     rest         the rest, with a walk
   and the day's targets: calories and protein (written to Eat as the
   daily target), steps and water.

   Kept per space in HF.data.kelas.plan, so a member with Active and
   Ladies has a plan for each. Home sessions are not points: the server
   cannot see them (HITFAT Points come from the kiosk). HYROX has its own
   programs, PT its coach, so neither gets this.
   ═══════════════════════════════════════════════════════════════ */

var KP_SPACES=['active','ladies','mens'];
var KP={q:-1, a:null, day:null};

var KP_GOALS={
  fat:   ['Lose fat',               'Burn fat, keep the muscle',     'flame'],
  strong:['Build muscle & strength','Stronger every month',          'workout'],
  fit:   ['Fitter, more energy',    'Better engine, less tired',     'bolt'],
  tone:  ['Tone & shape',           'Firmer glutes, arms and core',  'target'],
  health:['Healthier, no pain',     'Move well, feel good',          'heart']};
var KP_LEVELS={
  new:    ['New to training',     'Less than 3 months, or back after a long break', 'sunrise'],
  regular:['Training on and off', '1–2 times a week',                               'steps'],
  strong: ['Training a lot',      '3 or more times a week',                         'flame']};
var KP_PAIN={knee:'Knees', back:'Lower back', shoulder:'Shoulders', wrist:'Wrists'};

var KP_Q=[
  {k:'goal', t:'What do you want most from HITFAT?', s:'Your classes stay the same. Everything around them follows this.',
   o:Object.keys(KP_GOALS).map(function(k){ return [k,KP_GOALS[k][0],KP_GOALS[k][1],KP_GOALS[k][2]]; })},
  {k:'level', t:'How much do you train right now?', s:'Be honest. Your plan starts here, not where you want to be.',
   o:Object.keys(KP_LEVELS).map(function(k){ return [k,KP_LEVELS[k][0],KP_LEVELS[k][1],KP_LEVELS[k][2]]; })},
  {k:'pain', multi:true, t:'Anything that hurts?', s:'Your home sessions leave out what loads it. Tell your coach in class too.', o:[
    ['knee','Knees','Stairs, squats or kneeling','person'],
    ['back','Lower back','Bending or lifting','person'],
    ['shoulder','Shoulders','Lifting overhead','person'],
    ['wrist','Wrists','Planks and push-ups','person'],
    ['none','Nothing','My body is fine','check']]},
  {k:'mode', t:'How do you want to train?', s:'Either way, your classes at HQ come first.', o:[
    ['gym','HITFAT classes only','All my training at HQ. The other days are for rest.','gym'],
    ['hybrid','HITFAT + online at home','Classes at HQ, and short sessions at home in between.','home']]},
  {k:'days', t:'Which days can you come to class?', s:''},
  {k:'home', only:'hybrid', t:'Home sessions a week?', s:'On the days between your classes.', o:[
    [1,'1 session','Just a top-up','home'],
    [2,'2 sessions','The sweet spot for most','home'],
    [3,'3 sessions','For a big push','home']]},
  {k:'mins', only:'hybrid', t:'How long at home?', s:'A session never runs over this.', o:[
    [15,'15 minutes','Short and sharp','clock'],
    [20,'20 minutes','Most results for the time','clock'],
    [30,'30 minutes','A full session','clock']]},
  {k:'equip', only:'hybrid', multi:true, t:'What do you have at home?', s:'Nothing is fine. A mat and a chair are enough.', o:[
    ['db','Dumbbells','Any weight','workout'],
    ['kb','Kettlebell','Any weight','workout'],
    ['none','Just my body','A mat, a chair, a towel','mat']]},
  {k:'body', t:'Your body now', s:'For your daily calories and protein. Kept in your account only.'}
];

/* ── home sessions, from HITFAT's filmed library (DB) ──
   Two of each, A and B, taken in turn through the week. [name, equipment]
   picks the clip when a name is filmed with more than one kit. */
var KP_HOME={
  fat:{
    body:[['Burn Circuit',['Bodyweight Squat','Mountain Climber','Reverse Lunges','High Knee','Push Up','Plank Jack']],
          ['Burn Intervals',['Jumping Jack','Alternating Lunges','Half Burpee','Bicycle Crunch','Squat Pulse','Fast Feet']]],
    db:  [['Dumbbell Burn',[['Squat Clean','Dumbbell'],['Jerk Press','Dumbbell'],'Mountain Climber',['Squat Shoulder Fly','Dumbbell'],['Clean Press','Dumbbell'],['Russian Twist','Dumbbell']]],
          ['Dumbbell Intervals',[['Wide Squat','Dumbbell'],'Jumping Jack',['ALT Shoulder Press','Dumbbell'],'Alternating Lunges',['RDL','Dumbbell'],'Bicycle Crunch']]],
    kb:  [['Kettlebell Burn',['Kettlebell Swing','Kettlebell Goblet Squat','Mountain Climber','Kettlebell Thruster','Kettlebell Half Burpee','Kettlebell Russian Twist']],
          ['Kettlebell Intervals',['Kettlebell Swing','Jumping Jack','Kettlebell Reverse Lunges','High Knee','Kettlebell Halo','Kettlebell Crunches']]]},
  strong:{
    body:[['Strength · Lower',['Bulgarian Split Squat','Single Leg Glutes Bridge','Squat Pause','Side Lunges','Wall Sit','Single Leg Calf Raises']],
          ['Strength · Upper & Core',['Push Up','Tricep Dip Chair','Decline Push Up','Backpack Deadlift','Hollow Hold','Plank']]],
    db:  [['Dumbbell Strength A',[['Normal Squat','Dumbbell'],['RDL','Dumbbell'],['Chest Press','Dumbbell'],['Upright Row','Dumbbell'],['Hip Thrust','Dumbbell'],['Plank Taps','Dumbbell']]],
          ['Dumbbell Strength B',[['Wide Squat','Dumbbell'],['Deadlift','Dumbbell'],['ALT Shoulder Press','Dumbbell'],['Tricep Kick Back','Dumbbell'],['Hammer Curl','Dumbbell'],['Russian Twist','Dumbbell']]]],
    kb:  [['Kettlebell Strength A',['Kettlebell Goblet Squat','Kettlebell Deadlift','Kettlebell Shoulder Press','Kettlebell Bend Over Row','Kettlebell Swing','Kettlebell Russian Twist']],
          ['Kettlebell Strength B',['Kettlebell Reverse Lunges','Kettlebell Swing','Kettlebell Thruster','Kettlebell Halo','Farmer Carry','Kettlebell Crunches']]]},
  fit:{
    body:[['Engine',['High Knee','Squat Jump','Mountain Climber','Skater Jump','Burpee','Fast Feet']],
          ['Engine · Steady',['Jumping Jack','Walking Lunges','Butt Kick','Bear Walk','Power Skip','Plank']]]},
  tone:{
    body:[['Glutes & Core',['Hip Thrust','Curtsy Lunges','Single Leg Glutes Bridge','Side Lunges','Dead Bug','Side Plank']],
          ['Arms & Core',['Incline Push Up (Chair)','Tricep Dip Chair','Bottle Shoulder Press','Bottle Bicep Curl','Russian Twist','Plank']]],
    db:  [['Dumbbell Sculpt · Lower',[['Hip Thrust','Dumbbell'],['RDL','Dumbbell'],['Close Squat','Dumbbell'],'Curtsy Lunges',['Squat Hold','Dumbbell'],'Dead Bug']],
          ['Dumbbell Sculpt · Upper',[['Shoulder Fly','Dumbbell'],['Tricep Kick Back','Dumbbell'],['ALT Bicep Curl','Dumbbell'],['Chest Press','Dumbbell'],['Crunches','Dumbbell'],['Side Plank','Dumbbell']]]]},
  health:{
    body:[['Move Well',['IC Warm','Bird Dog','Chair Squat','Wall Push Up','Dead Bug','Calf Raises']],
          ['Strong Back & Hips',['Bird Dog','Hip Thrust','Side Lunges','Dead Bug','Squat Hold','Plank']]]}
};
var KP_RECOVER=['IC Warm','Bird Dog','Dead Bug','Hip Thrust','Calf Raises'];

/* what loads a part that hurts, and what can stand in */
var KP_BLOCK={
  knee:    {t:['squat','lunge','jump'], n:/squat|lunge|jump|burpee|skip|high knee|butt kick|fast feet|sprint|jack|wall sit|step up|thruster|skater|pistol/i},
  back:    {t:['hinge'], n:/deadlift|rdl|sldl|good morning|swing|clean|snatch|crunch|sit up|leg raise|russian twist|v in|flutter|toe touch|burpee|bicycle|row/i},
  shoulder:{t:[], n:/press|push up|dip|raise|fly|thruster|halo|burpee|plank jack|bear|inchworm|mountain climber|jerk|snatch|upright row/i},
  wrist:   {t:[], n:/push up|plank|mountain climber|burpee|bear|dip|inchworm|bird dog|side plank/i}};
var KP_SAFE=['Hip Thrust','Single Leg Glutes Bridge','Dead Bug','Calf Raises','Wall Sit','Bodyweight Squat','Bird Dog','Side Plank','Crunch','Chair Squat'];

function kpPains(a){ return ((a&&a.pain)||[]).filter(function(p){ return KP_BLOCK[p]; }); }
function kpDBRow(name,eq){
  var hit=null, i;
  for(i=0;i<DB.length;i++){ if(DB[i].n!==name) continue; if(!eq || DB[i].eq===eq) return DB[i]; if(!hit) hit=DB[i]; }
  return hit;
}
function kpBlocked(name,a){
  var row=kpDBRow(name)||{};
  return kpPains(a).some(function(p){ var b=KP_BLOCK[p]; return b.t.indexOf(row.t)>=0 || b.n.test(name); });
}
/* the moves of a session for these answers: blocked ones swapped for the
   first safe stand-in not already in it */
function kpMoves(list,a){
  var out=[], used={};
  list.forEach(function(x){ var n=Array.isArray(x)?x[0]:x; used[n]=1; });
  list.forEach(function(x){
    var n=Array.isArray(x)?x[0]:x, eq=Array.isArray(x)?x[1]:'';
    if(!kpBlocked(n,a)){ out.push([n,eq]); return; }
    for(var i=0;i<KP_SAFE.length;i++){ var s=KP_SAFE[i];
      if(!used[s] && !kpBlocked(s,a)){ used[s]=1; out.push([s,'']); return; } }
  });
  return out;
}
function kpKit(a){ var e=(a&&a.equip)||[]; return e.indexOf('kb')>=0?'kb':e.indexOf('db')>=0?'db':'body'; }
var KP_WORK={new:30, regular:40, strong:45};
/* the n-th home session of the week (0, 1, 2), its moves and its rounds */
function kpSession(a,n){
  var g=KP_HOME[a.goal]||KP_HOME.fat, kit=g[kpKit(a)]?kpKit(a):'body', t=g[kit][n%2];
  var moves=kpMoves(t[1],a), work=KP_WORK[a.level]||40, per=moves.length*(work+REST_SECS);
  var rounds=Math.max(2,Math.min(5,Math.round((a.mins||20)*60/per)));
  if(a.level==='new') rounds=Math.min(rounds,3);
  return {name:t[0], moves:moves, work:work, rounds:rounds, mins:Math.round(per*rounds/60), kit:kit};
}
function kpRecover(a){
  var moves=kpMoves(KP_RECOVER,a);
  return {name:'Easy Recovery', moves:moves, work:30, rounds:2, mins:Math.round(moves.length*(30+REST_SECS)*2/60), kit:'body', easy:true};
}
function kpExs(s){
  return s.moves.map(function(m){ var r=kpDBRow(m[0],m[1])||{n:m[0],v:'',m:'Full Body'};
    return {n:r.n, v:r.v||'', m:r.m, dur:s.work, eq:r.eq||'Bodyweight', t:r.t}; });
}

/* ── the week ── */
function kpSpace(){ var sp=typeof kelasSpace==='function'?kelasSpace():''; return KP_SPACES.indexOf(sp)>=0?sp:''; }
function kpStore(){ var k=HF.data.kelas||(HF.data.kelas={}); if(!k.plan||typeof k.plan!=='object') k.plan={}; return k.plan; }
function kpPlan(){ var sp=kpSpace(); if(!sp) return null; var p=kpStore()[sp]; return p&&p.done?p:null; }
function kpTarget(){ var sp=kpSpace(); return (typeof KELAS_TARGET!=='undefined'&&KELAS_TARGET[sp==='ladies'?'Ladies':sp==='mens'?'Mens':'Membership'])||4; }
function kpClock(hm){ return typeof kelasClock==='function'?kelasClock(hm):hm; }
/* 18:00 → 6pm, 08:15 → 8:15am: a day's four classes on one line */
function kpShort(hm){ var m=kpMinOf(hm), h=Math.floor(m/60), mm=m%60; return ((h+11)%12+1)+(mm?':'+('0'+mm).slice(-2):'')+(h<12?'am':'pm'); }
function kpMinOf(hm){ var p=String(hm||'0:0').split(':'); return (+p[0])*60+(+p[1]||0); }
/* the class on a day nearest the time they prefer */
function kpClassOn(dow,slot){
  var cls=(typeof kelasClasses==='function'?kelasClasses():[]).filter(function(c){ return c.dow===dow; })
    .sort(function(x,y){ return kpMinOf(x.start)-kpMinOf(y.start); });
  if(!cls.length) return null;
  if(slot==='pm'){ var ev=cls.filter(function(c){ return kpMinOf(c.start)>=16*60; }); return ev[0]||cls[cls.length-1]; }
  var am=cls.filter(function(c){ return kpMinOf(c.start)<12*60; }); return am[0]||cls[0];
}
/* the gap, in days round the week, from a day to the nearest busy one */
function kpGap(d,busy){ var g=7; busy.forEach(function(b){ var x=Math.abs(d-b); g=Math.min(g,x,7-x); }); return g; }
function kpWeek(a){
  var days=(a.days||[]).slice().sort(), wk=[], busy=[], d;
  for(d=1;d<=7;d++) wk.push({dow:d, kind:'rest'});
  days.forEach(function(dd){ var c=kpClassOn(dd,a.slot); if(c){ wk[dd-1]={dow:dd, kind:'class', c:c}; busy.push(dd); } });
  if(a.mode==='hybrid'){
    for(var n=0;n<(a.home||0);n++){
      var best=0, bg=-1;
      for(d=1;d<=7;d++){ if(wk[d-1].kind!=='rest') continue; var g=kpGap(d,busy); if(g>bg){ bg=g; best=d; } }
      if(!best) break;
      wk[best-1]={dow:best, kind:'home'}; busy.push(best);
    }
    /* their order through the week sets A and B */
    var i=0; wk.forEach(function(x){ if(x.kind==='home') x.s=kpSession(a,i++); });
  }
  var hard=wk.filter(function(x){ return x.kind==='class'||x.kind==='home'; }).length;
  if(hard>=4){
    var free=wk.filter(function(x){ return x.kind==='rest'; });
    if(free.length>=2){ var r=free.sort(function(x,y){ return kpGap(y.dow,[])-kpGap(x.dow,[]); })[0];
      /* the free day straight after the most work */
      var after=free.filter(function(x){ var p=wk[(x.dow+5)%7]; return p.kind!=='rest'; })[0]||r;
      after.kind='recover'; if(a.mode==='hybrid') after.s=kpRecover(a); }
  }
  return wk;
}

/* ── daily targets: written to Eat as the day's target ── */
var KP_EATGOAL={fat:'lose', tone:'lose', strong:'muscle', fit:'maintain', health:'maintain'};
function kpGender(a){ var sp=kpSpace(); return sp==='ladies'?'female':sp==='mens'?'male':(a.gender||'female'); }
function kpNut(a){
  if(!(a.wt&&a.ht&&a.age)) return null;
  var wk=kpWeek(a), n=wk.filter(function(x){ return x.kind==='class'||x.kind==='home'; }).length;
  var act=n>=5?1.55:n>=3?1.465:1.375, g=a.goal||'fat';
  var r=mpNut({goal:g==='strong'?'gain':(g==='fat'||g==='tone')?'loss':'keep', rate:g==='strong'?0.15:g==='tone'?0.25:0.5,
    gender:kpGender(a), age:a.age, wt:a.wt, ht:a.ht, activity:act, styles:['hiprotein']});
  var pt=Math.round(a.wt*(g==='strong'?2:g==='fat'?1.8:1.6));
  return {cal:r.cal, pt:pt, ct:Math.round((r.cal-pt*4-r.cal*0.28)/4), ft:Math.round(r.cal*0.28/9),
    steps:g==='fat'?9000:g==='health'?7000:8000, water:Math.round(a.wt*0.035*10)/10};
}

/* ── the questions ── */
function kpQs(a){ return KP_Q.filter(function(q){ return !q.only || (a&&a.mode)===q.only; }); }
function kpOpen(){
  var sp=kpSpace(); if(!sp) return;
  var me=kpStore()[sp]||{}, n=HF.data.nutrition||{};
  KP.a=JSON.parse(JSON.stringify(me));
  KP.a.wt=KP.a.wt||n.w||''; KP.a.ht=KP.a.ht||n.h||''; KP.a.age=KP.a.age||n.a||''; KP.a.gender=KP.a.gender||n.gender||'';
  if(!KP.a.slot) KP.a.slot='pm';
  KP.q=0; renderKelas(); $('screen').scrollTop=0;
}
function kpClose(){ KP.q=-1; KP.a=null; renderKelas(); $('screen').scrollTop=0; }
function kpBack(){ if(KP.q<=0) return kpClose(); KP.q--; renderKelas(); $('screen').scrollTop=0; }
function kpNext(){ KP.q++; renderKelas(); $('screen').scrollTop=0; }
function kpPick(k,v,multi){
  var a=KP.a;
  if(multi){
    var l=(a[k]||[]).slice(), i=l.indexOf(v);
    if(v==='none') l=i>=0?[]:['none'];
    else { l=l.filter(function(x){ return x!=='none'; }); if(i>=0) l.splice(l.indexOf(v),1); else l.push(v); }
    a[k]=l; renderKelas(); return;
  }
  a[k]=v; kpNext();
}
function kpDay(d){ var l=(KP.a.days||[]).slice(), i=l.indexOf(d); if(i>=0) l.splice(i,1); else l.push(d); KP.a.days=l; renderKelas(); }
function kpSlot(s){ KP.a.slot=s; renderKelas(); }
function kpSex(s){ KP.a.gender=s; renderKelas(); }
function kpBody(){
  var g=function(x){ return parseFloat(($(x)||{}).value); };
  var wt=g('kpq-wt'), ht=g('kpq-ht'), age=parseInt(($('kpq-age')||{}).value,10);
  if(!(wt>=30&&wt<=250) || !(ht>=120&&ht<=220) || !(age>=13&&age<=90)){ toast('Fill in weight, height and age'); return; }
  if(!kpSpace().match(/ladies|mens/) && !KP.a.gender){ toast('Choose male or female'); return; }
  KP.a.wt=wt; KP.a.ht=ht; KP.a.age=age; kpNext();
}
function kpSave(){
  var sp=kpSpace(), a=KP.a; if(!sp||!a) return;
  a.done=true; a.at=iso(0); kpStore()[sp]=a;
  var t=kpNut(a);
  if(t){
    HF.data.nutrition={w:a.wt, h:a.ht, a:a.age, gender:kpGender(a), goal:KP_EATGOAL[a.goal]||'maintain', cal:t.cal, pt:t.pt, ct:t.ct, ft:t.ft};
    HF.data.weight=(HF.data.weight||[]).filter(function(x){ return x.iso!==iso(0); }).concat([{iso:iso(0), kg:a.wt}]);
  }
  HF.save(); KP.q=-1; KP.a=null; KP.day=null; renderKelas(); $('screen').scrollTop=0;
  toast('Your week is ready');
}

var KP_DOW=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
function kpQuizHTML(){
  var a=KP.a, qs=kpQs(a), n=qs.length, h='<div class="lbq kpq kpq-'+kpSpace()+'">';
  var bar='<div class="lbq-top"><button class="pdx-back" aria-label="Back" onclick="kpBack()">'+glyph('chevleft')+'</button>'+
    '<div class="lbq-bar"><i style="width:'+Math.round(Math.min(KP.q,n)/n*100)+'%"></i></div><span class="lbq-n">'+(KP.q>0&&KP.q<=n?KP.q+'/'+n:'')+'</span></div>';
  if(KP.q===0){
    var nm=String((Kelas.data&&Kelas.data.name)||'').trim().split(/\s+/)[0];
    return h+bar+'<div class="kpq-intro"><div class="k">'+hesc(kelasCat(kpSpace()==='ladies'?'Ladies':kpSpace()==='mens'?'Mens':'Membership'))+' · My plan</div>'+
      '<div class="t">Let\'s build your week'+(nm?', '+hesc(nm):'')+'.</div>'+
      '<div class="s">Your classes at HQ, what you do between them, and how you eat. Built from your answers, about 2 minutes.</div></div>'+
      '<div class="lbq-list">'+[['target','Your goal and where you start'],['heart','Anything that hurts'],['calendar','The days you can come to class'],['home','HITFAT only, or HITFAT + online'],['food','Your calories and protein']]
        .map(function(x){ return '<div><span>'+glyph(x[0])+'</span>'+x[1]+'</div>'; }).join('')+'</div>'+
      '<button class="lbx-go" onclick="kpNext()">'+glyph('play')+'Start</button></div>';
  }
  if(KP.q>n) return h+kpResultHTML()+'</div>';
  var q=qs[KP.q-1], v=a[q.k];
  h+=bar+'<div class="lbq-q">'+hesc(q.t)+'</div>'+(q.s?'<div class="lbq-s">'+hesc(q.s)+'</div>':'');
  if(q.k==='days'){
    var cls=kelasClasses(), tg=kpTarget(), picked=(a.days||[]).length;
    h+='<div class="lbq-s">Aim for '+tg+' a week. Pick the days you can usually make.</div><div class="kpq-days">';
    for(var d=1;d<=7;d++){
      var on=(a.days||[]).indexOf(d)>=0, cs=cls.filter(function(c){ return c.dow===d; })
        .sort(function(x,y){ return kpMinOf(x.start)-kpMinOf(y.start); });
      h+=cs.length ? '<button class="kpq-d'+(on?' on':'')+'" onclick="kpDay('+d+')"><b>'+KP_DOW[d-1]+'</b><span>'+
          cs.map(function(c){ return kpShort(c.start); }).join(' · ')+'</span><i>'+(on?glyph('check'):'')+'</i></button>'
        : '<div class="kpq-d off"><b>'+KP_DOW[d-1]+'</b><span>No class</span></div>';
    }
    h+='</div><div class="kpq-slot"><span>I usually come in the</span><div class="obseg">'+
      '<button class="'+(a.slot==='am'?'on':'')+'" onclick="kpSlot(\'am\')">'+glyph('sunrise')+' Morning</button>'+
      '<button class="'+(a.slot!=='am'?'on':'')+'" onclick="kpSlot(\'pm\')">'+glyph('moon')+' Evening</button></div></div>';
    if(picked && picked<tg) h+='<div class="lbq-hint">'+picked+' a week is a good start. '+tg+' is where most members see the change.</div>';
    return h+'<button class="lbx-go'+(picked?'':' off')+'" onclick="'+(picked?'kpNext()':'')+'">Next</button></div>';
  }
  if(q.k==='body'){
    var fld=function(id,l,u,val,m){ return '<label class="esf"><span>'+l+'</span><input class="inp" id="'+id+'" inputmode="'+m+'" placeholder="0" value="'+(val||'')+'"><em>'+u+'</em></label>'; };
    if(!/ladies|mens/.test(kpSpace())) h+='<div class="obseg kpq-sex"><button class="'+(a.gender==='female'?'on':'')+'" onclick="kpSex(\'female\')">Female</button>'+
      '<button class="'+(a.gender==='male'?'on':'')+'" onclick="kpSex(\'male\')">Male</button></div>';
    return h+'<div class="esfields lbq-body">'+fld('kpq-wt','Weight','kg',a.wt,'decimal')+fld('kpq-ht','Height','cm',a.ht,'decimal')+fld('kpq-age','Age','years',a.age,'numeric')+'</div>'+
      '<button class="lbx-go" onclick="kpBody()">See my week</button></div>';
  }
  h+='<div class="lbq-opts">'+q.o.map(function(o){
    var on=q.multi ? (v||[]).indexOf(o[0])>=0 : v===o[0];
    return '<button class="lbq-o'+(on?' on':'')+'" onclick="kpPick(\''+q.k+'\','+(typeof o[0]==='number'?o[0]:'\''+o[0]+'\'')+(q.multi?',1':'')+')">'+
      '<span class="ic">'+glyph(o[3])+'</span><span class="tx"><b>'+hesc(o[1])+'</b>'+(o[2]?'<small>'+hesc(o[2])+'</small>':'')+'</span>'+
      '<span class="tk">'+(on?glyph('check'):'')+'</span></button>';
  }).join('')+'</div>';
  if(q.multi || (v!==undefined && v!==null && v!=='')) h+='<button class="lbx-go'+((q.multi?(v&&v.length):true)?'':' off')+'" onclick="'+((q.multi?(v&&v.length):true)?'kpNext()':'')+'">Next</button>';
  return h+'</div>';
}

/* the week as rows: what, when, how long */
function kpRow(x,a){
  if(x.kind==='class') return ['class', x.c.name||kelasCat(x.c.category), kpClock(x.c.start)+' · '+(x.c.min||45)+' min at HQ'+(x.c.coach?' · '+x.c.coach:''), 'gym'];
  if(x.kind==='home') return ['home', x.s.name, x.s.mins+' min at home · '+x.s.moves.length+' moves × '+x.s.rounds, 'home'];
  if(x.kind==='recover') return ['recover', 'Recovery', x.s?x.s.mins+' min easy mobility, then a walk':'An easy walk and a stretch', 'leaf'];
  return ['rest', 'Rest', 'Walk '+(((kpNut(a)||{}).steps)||8000).toLocaleString()+' steps', 'moon'];
}
function kpWeekRows(wk,a,today){
  return '<div class="kp-rows">'+wk.map(function(x){ var r=kpRow(x,a);
    return '<div class="kp-r '+r[0]+(x.dow===today?' now':'')+'"><span class="d">'+KP_DOW[x.dow-1]+'</span><span class="ic">'+glyph(r[3])+'</span>'+
      '<div class="tx"><b>'+hesc(r[1])+'</b><small>'+hesc(r[2])+'</small></div></div>'; }).join('')+'</div>';
}
function kpTags(a){
  var t=[KP_LEVELS[a.level]?KP_LEVELS[a.level][0]:''];
  kpPains(a).forEach(function(p){ t.push(KP_PAIN[p]+' safe'); });
  if(a.mode==='hybrid'){ t.push({kb:'Kettlebell',db:'Dumbbells',body:'No equipment'}[kpKit(a)]); t.push((a.mins||20)+' min at home'); }
  else t.push('HITFAT only');
  return t.filter(Boolean);
}
/* the plan, before it is saved (28 Oct 2026, Seth: "biar nampak kemas,
   premium"): the hero with the week in three numbers, the days as a
   timeline, the day's targets as four tiles */
function kpResultHTML(){
  var a=KP.a, wk=kpWeek(a), t=kpNut(a), nm=String((Kelas.data&&Kelas.data.name)||'').trim().split(/\s+/)[0];
  var nc=wk.filter(function(x){ return x.kind==='class'; }).length, nh=wk.filter(function(x){ return x.kind==='home'; }).length;
  var mins=wk.reduce(function(s,x){ return s+(x.kind==='class'?(x.c.min||45):x.s?x.s.mins:0); },0);
  var h='<div class="kpr">';
  h+='<div class="kpr-hero"><div class="kpr-k">'+glyph('check')+'Your week is ready</div>'+
    '<div class="kpr-t">Built for '+(nm?hesc(nm):'you')+'.</div>'+
    '<div class="kpr-s">'+hesc(KP_GOALS[a.goal][0])+' · '+(a.mode==='hybrid'?'HITFAT + online':'HITFAT classes only')+'</div>'+
    '<div class="kpr-nums"><div><b>'+nc+'</b><span>'+(nc===1?'class':'classes')+' at HQ</span></div>'+
      '<div><b>'+nh+'</b><span>at home</span></div><div><b>'+mins+'</b><span>min a week</span></div></div></div>';
  h+='<div class="kpr-tags">'+kpTags(a).map(function(x){ return '<span>'+hesc(x)+'</span>'; }).join('')+'</div>';
  h+='<div class="kpr-sh"><b>The week</b><span>Mon – Sun</span></div><div class="kpr-tl">'+wk.map(function(x){
    var r=kpRow(x,a), side=x.kind==='class'?kpClock(x.c.start):x.s?x.s.mins+' min':'';
    var kick={'class':'Class · HQ', home:'Online · home', recover:'Recovery', rest:'Rest'}[r[0]];
    var sub=x.kind==='class'?(x.c.min||45)+' min'+(x.c.coach?' · '+x.c.coach:'')
      : x.kind==='home'?x.s.moves.length+' moves × '+x.s.rounds+' rounds'
      : r[2];
    return '<div class="kpr-d '+r[0]+'"><div class="kpr-dw">'+KP_DOW[x.dow-1]+'</div><i class="kpr-dot"></i>'+
      '<div class="kpr-c"><div class="kpr-ck">'+kick+'</div><b>'+hesc(x.kind==='rest'?r[2]:x.kind==='recover'?(x.s?'Easy mobility, then a walk':r[2]):r[1])+'</b>'+
      (x.kind==='rest'||x.kind==='recover'?'':'<small>'+hesc(sub)+'</small>')+'</div>'+
      (side?'<em>'+side+'</em>':'')+'</div>';
  }).join('')+'</div>';
  if(t){
    h+='<div class="kpr-sh"><b>Every day</b><span>Eat follows this</span></div><div class="kpr-tg">'+
      [['flame',t.cal.toLocaleString(),'kcal','Calories'],['food',t.pt,'g','Protein'],['steps',t.steps.toLocaleString(),'','Steps'],['water',t.water,'L','Water']]
      .map(function(x){ return '<div><span class="ic">'+glyph(x[0])+'</span><b>'+x[1]+'<i>'+x[2]+'</i></b><small>'+x[3]+'</small></div>'; }).join('')+'</div>'+
      '<div class="kpr-note">Protein '+(a.goal==='strong'?'2':a.goal==='fat'?'1.8':'1.6')+' g per kg keeps the muscle your classes build. Calories never go under the CPG MOH floor.</div>';
  }
  h+='<div class="kpr-foot"><button class="lbx-go" onclick="kpSave()">'+glyph('check')+'Save my plan</button>'+
    '<button class="lbx-ghost" onclick="KP.q=1;renderKelas()">Change answers</button>'+
    '<div class="kpr-fine">Home sessions don\'t earn HITFAT Points: only check-ins at HQ do.</div></div>';
  return h+'</div>';
}

/* ── on the Class screen: the week, and today ── */
/* a home day's session done: the player's own record, by date */
function kpHomeDone(off){ return !!(HF.data.sessions&&HF.data.sessions['kp-'+iso(off-(kelasDow(kelasNowMY())-1))]); }
function kpCard(){
  var sp=kpSpace(); if(!sp || !kelasActive()) return '';
  var a=kpPlan();
  /* (28 Oct 2026) one line on Today, not a second big card */
  if(!a) return '<button class="kp-invite kp-'+sp+'" onclick="kpOpen()"><span class="kp-ii">'+glyph('sliders')+'</span>'+
    '<span class="kp-it"><b>Build my plan · 2 min</b><small>Your classes, home sessions and meals in one week</small></span><i class="kl-fold-c">›</i></button>';
  /* (28 Oct 2026, Seth: tidy, as the week before saving) the goal, the
     week's two counts as bars, the strip, the day as a card, the targets */
  var wk=kpWeek(a), today=kelasDow(kelasNowMY()), sel=KP.day||today, x=wk[sel-1], r=kpRow(x,a), t=kpNut(a);
  var nc=wk.filter(function(y){ return y.kind==='class'; }).length, nh=wk.filter(function(y){ return y.kind==='home'; });
  var hd=nh.filter(function(y){ return kpHomeDone(y.dow-1); }).length, cd=Math.min(nc,typeof kelasThisWeekN==='function'?kelasThisWeekN():0);
  var bar=function(cls,l,n,of){ return '<div class="kp-pb '+cls+'"><div><span>'+l+'</span><b>'+n+'<i>/'+of+'</i></b></div><u><i style="width:'+Math.round(n/(of||1)*100)+'%"></i></u></div>'; };
  var h='<div class="kp-card kp-'+sp+'"><div class="kp-top"><div><div class="kl-kick">My plan</div><b class="kp-h">'+hesc(KP_GOALS[a.goal][0])+'</b></div>'+
    '<button class="kp-edit" onclick="kpOpen()">'+glyph('pencil')+'Edit</button></div>';
  h+='<div class="kp-pbs">'+bar('class','Classes',cd,nc)+(nh.length?bar('home','At home',hd,nh.length):'')+'</div>';
  h+='<div class="kp-strip">'+wk.map(function(y){ var rr=kpRow(y,a), done=y.kind==='home'&&kpHomeDone(y.dow-1);
    return '<button class="'+rr[0]+(y.dow===sel?' on':'')+(y.dow===today?' now':'')+(done?' ok':'')+'" onclick="KP.day='+y.dow+';renderKelas()">'+
      '<small>'+KP_DOW[y.dow-1].charAt(0)+'</small><i>'+glyph(done?'check':rr[3])+'</i></button>'; }).join('')+'</div>';
  var kick={'class':'Class · HQ', home:'Online · home', recover:'Recovery', rest:'Rest'}[r[0]];
  h+='<div class="kp-day '+r[0]+'"><div class="kp-dk">'+(sel===today?'Today':KP_DOW[sel-1])+' · '+kick+'</div>';
  if(x.kind==='class'){
    h+='<b>'+hesc(r[1])+'</b><div class="kp-pills"><span>'+kpClock(x.c.start)+'</span><span>'+(x.c.min||45)+' min</span>'+(x.c.coach?'<span>'+hesc(x.c.coach)+'</span>':'')+'</div>';
    /* (28 Oct 2026) Check in sits under the card at the top; once is enough */
  } else if(x.s){
    var done=kpHomeDone(sel-1);
    h+='<b>'+hesc(x.s.name)+'</b><div class="kp-pills"><span>'+x.s.mins+' min</span><span>'+x.s.moves.length+' moves</span><span>'+x.s.rounds+' rounds</span></div>'+
      '<ol class="kp-ol">'+x.s.moves.map(function(m){ return '<li>'+hesc(m[0])+'</li>'; }).join('')+'</ol>';
    if(done && sel===today) h+='<div class="kp-done">'+glyph('check')+' Done today. Well done!</div>';
    else h+='<button class="kp-go" onclick="kpPlay('+sel+')">'+glyph('play')+' Start '+x.s.mins+' min</button>';
  } else h+='<b>'+hesc(x.kind==='recover'?'An easy day':'Rest day')+'</b><div class="kp-dp">'+hesc(r[2])+'</div>';
  /* a class on the timetable on a day the plan keeps for home or rest: going counts */
  if(x.kind!=='class' && sel===today){ var c=kpClassOn(today,a.slot);
    if(c) h+='<div class="kp-alt">'+glyph('gym')+'<span>Rather come to class? '+(c.name?hesc(c.name)+' at ':'There\'s one at ')+kpClock(c.start)+'. It counts for your week.</span></div>'; }
  h+='</div>';
  if(t) h+='<div class="kp-tg">'+[['flame',t.cal.toLocaleString(),'kcal'],['food',t.pt+'g','protein'],['steps',(t.steps/1000)+'k','steps'],['water',t.water+'L','water']]
    .map(function(y){ return '<div><span class="ic">'+glyph(y[0])+'</span><b>'+y[1]+'</b><small>'+y[2]+'</small></div>'; }).join('')+'</div>';
  return h+'</div>';
}
function kpPlay(dow){
  var a=kpPlan(); if(!a) return;
  var x=kpWeek(a)[dow-1]; if(!x||!x.s) return;
  var off=dow-kelasDow(kelasNowMY());
  startWorkout(kpExs(x.s),{rounds:x.s.rounds, name:x.s.name, key:'kp-'+iso(off), kp:1});
}
function kpAfterSession(){ if(typeof openKelas==='function') openKelas(); }
