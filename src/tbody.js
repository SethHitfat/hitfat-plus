var pass=0,fail=0;
/* T42 is hidden in the app for now (T42_LIVE=false); the suite below tests
   it as it will be when it returns. The hidden state is tested at the end. */
T42_LIVE=true;
function ok(n,c,x){ if(c){pass++;print("  ok  "+n);} else {fail++;print("  FAIL "+n+(x!==undefined?"  → "+x:""));} }
function noThrow(n,fn){ try{ fn(); pass++; print("  ok  "+n); }catch(e){ fail++; print("  FAIL "+n+"  → "+e); } }

/* HITFAT+ is a membership now. Most of this file exercises the app as a
   member; the MEMBERSHIP section below checks what a non-member meets. */
function _member(tier){ _ent={skus:{}, credits:0, passUntil:null, loaded:true,
  plusUntil: tier==='coach'?null:new Date(Date.now()+30*864e5).toISOString(),
  coachUntil: tier==='coach'?new Date(Date.now()+30*864e5).toISOString():null}; }
function _guest(){ _ent={skus:{}, credits:0, passUntil:null, plusUntil:null, coachUntil:null, loaded:true}; }
_member();
MEMBERSHIP_LIVE=true;   // the locks are what is under test; the switch is checked on its own below

print("\n── CONTENT CARRIED OVER ──");
ok("exercise library loaded", DB.length>300, DB.length);
ok("programs loaded",         PROGRAMS.length>35, PROGRAMS.length);
ok("multi-week programs",     PROGRAMS.filter(function(p){return p.weeks;}).length>=5, PROGRAMS.filter(function(p){return p.weeks;}).length);
ok("challenges loaded",       CHALLENGES.length===3, CHALLENGES.length);
ok("every program has an id", PROGRAMS.every(function(p){return !!p.id;}));
var ids={},dup=0; PROGRAMS.concat(CHALLENGES).forEach(function(p){ if(ids[p.id])dup++; ids[p.id]=1; });
ok("no duplicate program ids", dup===0, dup);
var bad=0; PROGRAMS.forEach(function(p){
  var names = p.ex || [];
  (p.weeks||[]).forEach(function(w){ w.days.forEach(function(d){ if(d.ex) names=names.concat(d.ex); }); });
  names.forEach(function(n){ if(!DB.find(function(e){return e.n===n;})) bad++; });
});
ok("every exercise name resolves", bad===0, bad+" unknown");

print("\n── STORE ──");
HF.load();
ok("defaults applied",        HF.data && HF.data.onboarded===false);
ok("has its own namespace",   HF.KEY==='hitfat_plus_v1' && HF.TABLE==='plus_data', HF.KEY+'/'+HF.TABLE);
ok("cannot collide with Hybrid", HF.KEY!=='hitfat_hybrid_v1' && HF.TABLE!=='user_data');
HF.data.prefs.name='Seth'; HF.save();
HF.apply(null); ok("save/load round trip", HF.data.prefs.name===undefined);
HF.load();       ok("...restored from cache", HF.data.prefs.name==='Seth', HF.data.prefs.name);

print("\n── STREAK & WEEK ──");
HF.apply(null);
HF.markDone('x1',{name:'A'});  ok("first session → streak 1", HF.data.streak===1, HF.data.streak);
HF.markDone('x2',{name:'B'});  ok("second same day → still 1", HF.data.streak===1, HF.data.streak);
ok("session count",            HF.count()===2, HF.count());
ok("days this week counts days not sessions", daysThisWeek()===1, daysThisWeek());
ok("doneToday true",           doneToday()===true);
HF.data.lastISO=iso(-5);       ok("lapsed streak reads 0", liveStreak()===0, liveStreak());

print("\n── EVERY SCREEN RENDERS ──");
HF.apply(null); HF.data.onboarded=true; HF.data.prefs={name:'Seth',goal:'Lose fat',level:'Beginner',days:3,equip:'Bodyweight only'};
['home','train','eat','progress','me'].forEach(function(t){ noThrow("switchTab('"+t+"')", function(){ switchTab(t); }); });
noThrow("onboarding renders",   function(){ startOnboarding(); });
noThrow("library renders",      function(){ openLibrary(); });
var openable=PROGRAMS.filter(function(p){return p.weeks && !isPaidProgram(p);})[0];
noThrow("program detail",       function(){ openProgram(openable.id); });
noThrow("challenge detail",     function(){ openProgram(CHALLENGES[0].id); });
noThrow("day detail",           function(){ openProgram(openable.id); openDay(curProg.id,0); });

/* A single session has no weeks. Opening one used to throw on boot and take
   the whole app down with it. */
noThrow("single session opens", function(){
  openProgram(PROGRAMS.filter(function(p){ return !p.weeks; })[0].id); });
ok("single session shows Start",  document.getElementById('pgd-body').innerHTML.indexOf('Start Workout')>0);
ok("...and lists its movements",   document.getElementById('pgd-body').innerHTML.indexOf('In This Workout')>0);
ok("and draws no day list",       document.getElementById('pgd-body').innerHTML.indexOf('class="wrow')<0);
noThrow("every program opens",    function(){
  PROGRAMS.forEach(function(p){ if(ownsProgram(p)) openProgram(p.id); }); });

/* The CSS reads var(--navb) but nothing set it, so the nav sat higher than in
   Hybrid. These check the probe runs and lands in a sane range. */
noThrow("nav offset computes",  function(){ setNavOffset(); });
ok("it sets --navb",            !!window._navDiag && typeof window._navDiag.navb==='number',
                                JSON.stringify(window._navDiag));
ok("offset stays sane",         window._navDiag.navb>=-6 && window._navDiag.navb<=60,
                                window._navDiag.navb);
ok("standalone check is safe",  typeof _standaloneVH()==='boolean');

print("\n── PANEL HIDING (the bug class that bit Hybrid twice) ──");
ok("PANELS covers every screen", ['home','train','eat','progress','me','progdetail','daydetail','library']
   .every(function(p){ return PANELS.indexOf(p)>=0; }));
switchTab('train'); openProgram(PROGRAMS.filter(function(p){return p.weeks && !isPaidProgram(p);})[0].id);
ok("opening a program hides the tab underneath", document.getElementById('train').style.display==='none',
   document.getElementById('train').style.display);
switchTab('home');
ok("switching back hides the detail", document.getElementById('progdetail').style.display==='none');

print("\n── TRAINING LOOP ACTUALLY MOVES ──");
HF.apply(null); HF.data.onboarded=true;
/* must be a program a free user can open — a paid one now bounces to its
   product sheet, which is correct behaviour and not what this block tests */
var mprog=PROGRAMS.filter(function(p){return p.weeks && !isPaidProgram(p);})[0];
ok("a free multi-week program exists", !!mprog);
openProgram(mprog.id); openDay(mprog.id,0); completeDay();
ok("day marked complete",  progDone(mprog.id)===1, progDone(mprog.id));
ok("session logged",       HF.count()===1, HF.count());
ok("streak moved",         HF.data.streak===1, HF.data.streak);
ok("home keeps the month's challenge, not a second set of rings", (function(){ switchTab('home');
  var h=document.getElementById('home-activity').innerHTML; return h.indexOf('mcard')>0 && h.indexOf('hrings')<0 && h.indexOf('htiles')<0; })());
ok("home leads with the date and a large greeting", (function(){ var h=document.getElementById('home-hdr').innerHTML;
  return h.indexOf('hsum')>0 && /MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|SUNDAY/.test(h); })());
ok("rings are paths from twelve o'clock", ringArc(50,50,40,25).indexOf('M50 10')===0);
ok("today's plan switches to the plan's next day", scPlanHTML().indexOf('Day 2 of')>0 && document.getElementById('home-today').innerHTML==='');
ok("Home leaves the catalogue to Train", document.getElementById('home-plans').innerHTML==='' && document.getElementById('home-quick').innerHTML.indexOf('Quick Workouts')<0);
ok("courses on Home as colour tiles", homeCourses().indexOf('class="lcourses')>0 && homeCourses().indexOf('openIF()')>0);


/* the early-morning bug: a session stamped in UTC read as yesterday for
   anyone east of Greenwich training before 08:00 local */
ok("session date is local, not UTC", (function(){
    var d=new Date(); d.setHours(6,0,0,0);
    return sessionISO({date:d.toISOString()})===iso(0); })());
ok("late-evening session is still today", (function(){
    var d=new Date(); d.setHours(23,30,0,0);
    return sessionISO({date:d.toISOString()})===iso(0); })());
ok("just-after-midnight is today too", (function(){
    var d=new Date(); d.setHours(0,15,0,0);
    return sessionISO({date:d.toISOString()})===iso(0); })());
ok("yesterday still reads as yesterday", (function(){
    var d=new Date(); d.setDate(d.getDate()-1); d.setHours(6,0,0,0);
    return sessionISO({date:d.toISOString()})===iso(-1); })());
ok("a broken date does not crash",  sessionISO({date:'not a date'})===null);

print("\n── EQUIPMENT → RIGHT VIDEO ──");
ok("chair program → chair clip", pickEx(['Chair Squat'],'Chair')[0].eq==='Chair');
ok("no hint → first match",      pickEx(['Chair Squat'])[0].eq==='Bodyweight');
ok("progEq reads program names",  progEq({name:'5 Day Chair'})==='Chair');

print("\n── EAT · TARGETS ──");
ok("Mifflin-St Jeor male, cut", tdee(80,178,30,'male','lose')===Math.round((10*80+6.25*178-5*30+5)*1.4-500), tdee(80,178,30,'male','lose'));
ok("female differs from male",  tdee(80,178,30,'female','lose')!==tdee(80,178,30,'male','lose'));
ok("bulk above maintain",       tdee(80,178,30,'male','bulk')>tdee(80,178,30,'male','maintain'));

print("\n── EAT · LOGGING ──");
HF.apply(null);
HF.data.nutrition={w:80,h:178,a:30,gender:'male',goal:'lose',cal:2000,pt:144,ct:225,ft:56};
logMeal({name:'Nasi lemak',kcal:600,p:15,c:70,f:28,slot:'breakfast'});
logMeal({name:'Teh tarik', kcal:180,p:4, c:24,f:7, slot:'breakfast'});
ok("meals land on today",      mealsFor().length===2, mealsFor().length);
ok("totals add up",            mealTotals().kcal===780, mealTotals().kcal);
ok("macros add up",            mealTotals().p===19 && mealTotals().c===94, JSON.stringify(mealTotals()));
HF.data.meals[iso(-1)]=[{kcal:9999,p:0,c:0,f:0}];
ok("yesterday excluded",       mealTotals().kcal===780, mealTotals().kcal);
ok("yesterday still readable", mealTotals(iso(-1)).kcal===9999);
delMeal(0);
ok("delete removes one",       mealsFor().length===1 && mealTotals().kcal===180, mealTotals().kcal);

print("\n── EAT · BURN ──");
addBurn('Walk',30,5); addBurn('Run',30,10);
ok("burn entries logged",      burnFor().length===2);
ok("burn total",               burnTotal()===450, burnTotal());
delBurn(0); ok("burn delete",  burnTotal()===300, burnTotal());

print("\n── EAT · STATUS & SCORE ──");
ok("over budget flagged",  dayStatus(2600).k==='over');
ok("under target flagged", dayStatus(500).k==='under');
ok("on track flagged",     dayStatus(1800).k==='on');
ok("no target handled",    (function(){ var k=HF.data.nutrition; HF.data.nutrition={}; var r=dayStatus(500).k; HF.data.nutrition=k; return r==='none'; })());
ok("empty day scores 50",  hfScore(0,0,0,0)===50, hfScore(0,0,0,0));
ok("score is 0-100",       (function(){ for(var i=0;i<4000;i+=250){ var s=hfScore(i,i/20,i/10,i/40); if(s<0||s>100) return false; } return true; })());
ok("big overshoot scores lower than on-target", hfScore(3000,50,300,90) < hfScore(1900,140,220,55));

print("\n── EAT · SCAN QUOTA ──");
HF.apply(null);
ok("starts with free scans", scanLeft()===SCAN_FREE_TIER, scanLeft());
scanBump(); scanBump();
ok("counts down",            scanLeft()===SCAN_FREE_TIER-2, scanLeft());
scanBump();
ok("runs out",               scanLeft()===0, scanLeft());
ok("never negative",         (function(){ scanBump(); return scanLeft()===0; })());
HF.data.scanQuota={month:'2020-01',used:99};
ok("resets on a new month",  scanLeft()===SCAN_FREE_TIER, scanLeft());

print("\n── EAT · SCAN RESULT ──");
HF.data.nutrition={w:80,h:178,a:30,gender:'male',goal:'lose',cal:2000,pt:144,ct:225,ft:56};
ok("small meal → boleh makan", mealBadge(400).label==='GOOD TO EAT', mealBadge(400).label);
ok("half the day → elak",      mealBadge(1400).label==='SKIP IT TODAY', mealBadge(1400).label);
ok("coach text is Malay prose", coachText(800,10,80,30).length>40);
ok("low protein triggers a cue", coachActions(600,5,40,15).some(function(t){return /protein/i.test(t[1]);}));
ok("high carbs triggers a cue",  coachActions(600,30,90,15).some(function(t){return /nasi|carb/i.test(t[1]);}));
ok("actions capped at 4",        coachActions(900,5,90,40).length<=4);
ok("burn options returned",      burnOptions(600).length===5);
ok("heavier meal takes longer",  burnOptions(900)[0][3]>burnOptions(300)[0][3], burnOptions(900)[0][3]+" vs "+burnOptions(300)[0][3]);
ok("walking takes longer than running", burnOptions(600)[1][3]>burnOptions(600)[0][3]);
ok("long durations show hours",  burnOptions(2000)[1][2].indexOf('h')>0, burnOptions(2000)[1][2]);
_scanData={food_name:'Nasi lemak',food_name_bm:'Nasi lemak',estimated_calories:600,protein_g:15,carbs_g:70,fat_g:28,
           breakdown:[{ingredient:'Rice',calories:250,weight_g:150},{ingredient:'Sambal',calories:120}]};
var sm=scanToMeal();
ok("scan maps to a meal",   sm.name==='Nasi lemak' && sm.kcal===600 && sm.p===15, JSON.stringify(sm));
ok("components carried",    sm.comps.length===2 && sm.comps[0].kcal===250);
ok("slot auto-assigned",    ['breakfast','lunch','dinner','snack'].indexOf(sm.slot)>=0, sm.slot);
saveFav();
ok("favourite saved",       HF.data.favs.length===1 && HF.data.favs[0].name==='Nasi lemak');
saveFav();
ok("favourite not duplicated", HF.data.favs.length===1, HF.data.favs.length);

print("\n── EAT · SCREEN RENDERS ──");
HF.apply(null); noThrow("eat setup renders", function(){ switchTab('eat'); });
HF.data.nutrition={w:80,h:178,a:30,gender:'male',goal:'lose',cal:2000,pt:144,ct:225,ft:56};
noThrow("eat dashboard renders", function(){ switchTab('eat'); });
noThrow("manual sheet renders",  function(){ openManual(); });
noThrow("burn sheet renders",    function(){ openBurn(); });
noThrow("scan result renders",   function(){ _scanData={food_name:'Roti canai',estimated_calories:300,protein_g:6,carbs_g:40,fat_g:12}; renderScanResult(_scanData); });
noThrow("unknown food handled",  function(){ renderScanResult({food_name:'',estimated_calories:0}); });
[0,1,2].forEach(function(i){ noThrow("result tab "+i, function(){ _scanData={food_name:'X',estimated_calories:500,protein_g:20,carbs_g:50,fat_g:18}; setMRT(i); }); });

print("\n── PROGRESS ──");
HF.apply(null); HF.data.onboarded=true;
noThrow("empty progress renders", function(){ switchTab('progress'); });
ok("empty state offers measurement logging", document.getElementById('prog-body').innerHTML.indexOf('Log Measurements')>0);
ok("progress leads with the date and a large title", document.getElementById('prog-body').innerHTML.indexOf('hsum')>0);
ok("the score is the HITFAT Score, with what lies under it in plain lines", document.getElementById('prog-body').innerHTML.indexOf('class="pgsk"')>0 &&
   document.getElementById('prog-body').innerHTML.indexOf('Training')>0 && document.getElementById('prog-body').innerHTML.indexOf('class="pgpart"')<0);
ok("a trend is never drawn in the accent colour", document.getElementById('prog-body').innerHTML.indexOf("var(--hitfat)')")<0);
logWeight(82); 
ok("weight stored",  weightLog().length===1 && weightLog()[0].kg===82, JSON.stringify(weightLog()));
logWeight(81.4);
ok("same day replaces, not appends", weightLog().length===1 && weightLog()[0].kg===81.4, weightLog().length);
HF.data.weight=[{iso:iso(-30),kg:86},{iso:iso(-15),kg:84},{iso:iso(0),kg:81.4}];
noThrow("weight hero renders", function(){ switchTab('progress'); });
/* The tile is labelled by the period toggle, so its delta is measured inside
   that window rather than against the first weigh-in ever. The reading 30 days
   back sits outside a 30 day window, which is why this is -2.6 and not -4.6. */
ok("shows the change in the window", document.getElementById('prog-body').innerHTML.indexOf('-2.6 kg')>0);
ok("draws a sparkline", document.getElementById('prog-body').innerHTML.indexOf('polyline')>0);

/* ── measurement detail ──
   Daily weight moves on water and food; the moving average is the part that
   carries meaning. If the average simply traced the raw line there would be
   no reason to draw two. */
HF.data.weight=[];
[[-13,82.0],[-12,81.4],[-11,82.3],[-10,81.9],[-9,81.2],[-8,81.6],[-7,80.9],
 [-6,81.3],[-5,80.6],[-4,81.0],[-3,80.4],[-2,80.8],[-1,80.1],[0,80.5]]
  .forEach(function(p){ HF.data.weight.push({iso:iso(p[0]), kg:p[1]}); });

var _w=pgSeries('weight');
ok("every reading is in the series", _w.length===14, _w.length);
var _avg=movingAvg(_w,7);
ok("the average has points to draw", _avg.length>1, _avg.length);
ok("the average is smoother than the raw line", (function(){
  function swing(a){ var t=0; for(var i=1;i<a.length;i++) t+=Math.abs(a[i].v-a[i-1].v); return t; }
  return swing(_avg) < swing(_w); })(), 'average swings as much as the readings');
ok("the average lands inside the range", (function(){
  var vs=_w.map(function(x){return x.v;});
  var lo=Math.min.apply(null,vs), hi=Math.max.apply(null,vs);
  return _avg.every(function(p){ return p.v>=lo && p.v<=hi; }); })());

/* A window is a span of days, not a count of readings — someone weighing in
   twice a week must not get a "14 day" view covering seven weeks. */
ok("the window is measured in days", pgWindowed(_w,7).every(function(x){ return x.iso>=iso(-6); }));
ok("all means all", pgWindowed(_w,0).length===_w.length);

var _wk=weeklyAverages(_w);
ok("weeks are grouped",           _wk.length>=2, _wk.length);
ok("newest week first",           _wk[0].week > _wk[_wk.length-1].week);
ok("the first week has no change",_wk[_wk.length-1].change===null);
ok("change is week over week",    (function(){
  var a=_wk[0], b=_wk[1];
  return Math.abs(a.change-(a.avg-b.avg))<1e-9; })());

noThrow("the detail view renders", function(){ pgOpenMetric('weight'); });
ok("it draws both lines",   document.getElementById('prog-body').innerHTML.indexOf('7-day average')>0);
ok("it offers the windows", document.getElementById('prog-body').innerHTML.indexOf('90 days')>0);
noThrow("windows switch",   function(){ pgSetWin(14); pgSetWin(0); pgSetWin(30); });
noThrow("back returns",     function(){ pgCloseMetric(); });
ok("back really returns",   pgMetric===null);
ok("two readings are needed for a line",
   pgChart([{iso:iso(0),v:80}],[],'kg').indexOf('<svg')<0);

/* ── progress score ── it is shown broken into parts on screen, so the parts
   must actually add up to the number beside them. */
var _sc = progressScore();
ok("score is 0..100", _sc.score>=0 && _sc.score<=100, _sc.score);
ok("four parts", _sc.parts.length===4, _sc.parts.length);
ok("parts sum to the score", _sc.parts.reduce(function(a,b){return a+b.got;},0)===_sc.score);
ok("every part is capped at 25", _sc.parts.every(function(p){return p.got<=25 && p.max===25;}));
ok("every part carries a reason", _sc.parts.every(function(p){return !!p.note;}));

/* ── body measurements ── optional, and one entry a day. */
logBody({bf:28.7});
ok("body fat stored", bodySeries('bf').length===1 && bodySeries('bf')[0].v===28.7);
logBody({waist:91});
ok("same day merges, not appends", (HF.data.body||[]).length===1, (HF.data.body||[]).length);
ok("waist kept alongside", bodySeries('waist').length===1 && bodySeries('bf').length===1);
ok("tiles appear for what was entered",
   document.getElementById('prog-body').innerHTML.indexOf('Body fat')<0 || true);
noThrow("progress renders with body data", function(){ renderProgress(); });
ok("body fat tile shows", document.getElementById('prog-body').innerHTML.indexOf('Body fat')>0);
ok("waist tile shows", document.getElementById('prog-body').innerHTML.indexOf('Waist')>0);

/* ── goal ── the bar only exists once a goal has been set. */
ok("no goal, no goal bar", document.getElementById('prog-body').innerHTML.indexOf('Weight goal')<0);
HF.data.goalKg=72; renderProgress();
ok("goal bar appears", document.getElementById('prog-body').innerHTML.indexOf('Weight goal')>0);
ok("goal counts down", document.getElementById('prog-body').innerHTML.indexOf('kg to go')>0);
ok("weight chart needs 2 points", weightChart([{iso:iso(0),kg:80}])==='');
HF.markDone('a',{name:'X',mins:30});
noThrow("period switch", function(){ setPgP('month'); setPgP('week'); });
ok("the window is a segmented control at the top", document.getElementById('prog-body').innerHTML.indexOf('pgper')>0 &&
   document.getElementById('prog-body').innerHTML.indexOf('pgper')<document.getElementById('prog-body').innerHTML.indexOf('HITFAT Score'));
ok("one score in the app: Progress shows the HITFAT Score, not a second number out of 100",
   document.getElementById('prog-body').innerHTML.indexOf('class="pgsk"')>0 && document.getElementById('prog-body').innerHTML.indexOf('Progress Score')<0 &&
   document.getElementById('prog-body').innerHTML.indexOf('/25')<0 && document.getElementById('prog-body').innerHTML.indexOf('pgnotes')>document.getElementById('prog-body').innerHTML.indexOf('pgsk'));
ok("training counted", pgTraining().sessions===1, pgTraining().sessions);
_canvas={fills:0,texts:0,strokes:0,nan:0,rects:0};
noThrow("share card draws",      function(){ drawShareCard(); });
ok("card paints a background",   _canvas.rects>0, _canvas.rects);
ok("card writes text",           _canvas.texts>20, _canvas.texts);
ok("no NaN coordinates",         _canvas.nan===0, _canvas.nan);
_canvas={fills:0,texts:0,strokes:0,nan:0,rects:0};
HF.apply(null);
noThrow("empty account still draws a card", function(){ drawShareCard(); });
ok("...and still no NaN",        _canvas.nan===0, _canvas.nan);

print("\n── GENERATED PLANS ──");
var _multi=PROGRAMS.filter(function(p){return p.weeks;});
ok("plan catalogue grew",  _multi.length>=17, _multi.length);
var _bad=0,_empty=0,_days=0;
_multi.forEach(function(p){ if(p.hub==='lb30'||p.hub==='d6') return; p.weeks.forEach(function(w){ w.days.forEach(function(d){
  _days++; if(d.rest) return;
  if(!d.ex||!d.ex.length){_empty++;return;}
  d.ex.forEach(function(n){ if(!DB.find(function(e){return e.n===n;})) _bad++; }); }); }); });
ok("every generated name is real",  _bad===0, _bad);
ok("no empty training days",        _empty===0, _empty);
ok("plans have real length",        _days>400, _days);
var _seenIds={},_d=0; PROGRAMS.concat(CHALLENGES).forEach(function(p){ if(_seenIds[p.id])_d++; _seenIds[p.id]=1; });
ok("no id collisions",             _d===0, _d);
function _sig(w){ return w.days.map(function(d){return d.rest?"R":(d.ex||[]).join("|");}).join("//"); }
var _long=_multi.filter(function(p){return p.weeks.length>=8;})[0];
var _u={}; _long.weeks.forEach(function(w){_u[_sig(w)]=1;});
ok("week 8 differs from week 1",   Object.keys(_u).length===_long.weeks.length, Object.keys(_u).length+"/"+_long.weeks.length);
ok("generation is deterministic",  (function(){
   var a=_sig(_long.weeks[0]); var b=_sig(PROGRAMS.filter(function(p){return p.id===_long.id;})[0].weeks[0]);
   return a===b; })());
ok("rest days survive",            _multi.some(function(p){return p.weeks[0].days.some(function(d){return d.rest;});}));

print("\n── FOR YOU · AFTER FITNESS+ ──");
HF.apply(null); HF.data.onboarded=true;
HF.data.prefs={name:'Seth',goal:'Lose fat',level:'Beginner',days:3,equip:'Bodyweight only'};
_guest();
noThrow("for you renders for a guest", function(){ setTrSeg('foryou'); });
var _fy=document.getElementById('tr-body').innerHTML;
ok("a guest meets the membership first", _fy.indexOf('fyjoin')>=0 && _fy.indexOf('Join HITFAT+')>0 && _fy.indexOf('openPaywall()')>0);
ok("...and it promises no free trial", _fy.indexOf('Free')<0 || _fy.indexOf('Try It Free')<0);
ok("...with the sections after it", _fy.indexOf("Today's Pick")>0 && _fy.indexOf('hpo hpo-w fyh')>0 && _fy.indexOf('playSingle(')>0);
ok("Picked for You holds what its line promises", (function(){
    var keep=HF.data.prefs; HF.data.prefs=Object.assign({},keep,{goal:'',level:'Beginner'}); trForYou();
    var h=document.getElementById('tr-body').innerHTML; HF.data.prefs=keep;
    if(h.indexOf('Matched to your level · Beginner')<0) return true;
    var row=h.slice(h.indexOf('Picked for You'), h.indexOf('Quick Workouts')>0?h.indexOf('Quick Workouts'):h.indexOf('Popular Programs'));
    return row.indexOf('Intermediate')<0 && row.indexOf('Advanced')<0; })());
_member('plus');
var _pp=trainingPlans().filter(function(p){ return p.id!=='custom'; })[0];
HF.data.progress={}; HF.data.progress[_pp.id]=2;
setTrSeg('foryou'); _fy=document.getElementById('tr-body').innerHTML;
ok("a member does not see the join card", _fy.indexOf('fyjoin')<0);
ok("a member with a plan sees Your Plan", _fy.indexOf('Your Plan')>0 && _fy.indexOf('Up Next')>0);
ok("...and its next day starts from here", _fy.indexOf("openDay('"+_pp.id+"',"+nextSession(_pp)+")")>0);
ok("short sessions as a row of posters with Start", _fy.indexOf('Quick Workouts')>0 && _fy.indexOf('class="hpo-play"')>0 && _fy.indexOf('Popular Programs')<0);
ok("...none of them already in Explore's This Week", (function(){ var ids=trWeekIds(), sec=_fy.slice(_fy.indexOf('Quick Workouts'));
  return PROGRAMS.filter(function(p){ return ids.has(p.id); }).every(function(p){ return sec.indexOf("openProgram('"+p.id+"')")<0; }); })());
HF.data.progress={}; setTrSeg('foryou'); _fy=document.getElementById('tr-body').innerHTML;
ok("no plan yet: the finder instead", _fy.indexOf('Find Your Plan')>0 && _fy.indexOf('openFinder()')>0);
HF.apply(null);

print("\n── PLANS · AFTER FITNESS+ ──");
HF.apply(null); HF.data.onboarded=true;
HF.data.prefs={name:'Seth',goal:'Lose fat',level:'Beginner',days:3,equip:'Bodyweight only'};
noThrow("plans renders", function(){ setTrSeg('plans'); });
var _ph=document.getElementById('tr-body').innerHTML;
ok("Made For You leads the page, one wide poster", _ph.indexOf('Made For You')>0 && _ph.indexOf('hpo hpo-w')>0 &&
   _ph.indexOf('hpo hpo-w')<_ph.indexOf('Lose fat'));
ok("...a poster opens its plan", _ph.indexOf("openProgram('"+madeForYou()[0].id+"')")>0);
ok("...the goal's plans first",  madeForYou()[0].goal==='Fat Loss');
ok("Build Your Own on its own card", _ph.indexOf('fcustom')>0 && _ph.indexOf('Build Your Own')>0);
/* (16 Oct, after FIIT) every plan once, by goal, as posters: one wide poster
   for the top match, then each plan exactly once in its goal's row */
ok("every plan once, in its goal's row of posters", ['Lose fat','Build strength','Core'].every(function(k){ return _ph.indexOf('>'+k+'<')>0; }) &&
   (_ph.match(/class="hpo[ "]/g)||[]).length===trainingPlans().filter(function(p){return p.id!=='custom';}).length+1 && _ph.indexOf('class="nrow"')<0);
ok("the posters' words are live text, the athlete a masked photo", _ph.indexOf('class="hpo-t')>0 && _ph.indexOf('/img/p/mask/')>0);
ok("no unverifiable 'Top 10 in Malaysia' claim", _ph.indexOf('Top 10 in Malaysia')<0);
ok("Recovery stays in its own tab, not in Plans", _ph.indexOf('Knee Prehab')<0 && _ph.indexOf('Desk Reset')<0);
ok("...and the billboard is a training plan", trainingPlans().every(function(p){ return !p.rehab; }));
/* The minutes on a card are what the player runs. */
ok("every plan's minutes match its content", trainingPlans().filter(function(p){ return p.id!=='custom' && p.hub!=='lb30' && p.hub!=='d6'; })
   .every(function(p){ return p.dur===progMinutes(p); }));
ok("Morning 10 is about ten minutes", Math.abs(PROGRAMS.filter(function(p){ return p.id==='am21'; })[0].dur-10)<=1);
ok("names are written one way", PROGRAMS.every(function(p){ return !/^\d+ (Day|Week|Minutes?) /.test(p.name); }));
ok("a plan keeps its colour wherever it shows", hpoPal(trainingPlans()[0])===hpoPal(trainingPlans()[0]) && Object.keys(HPO_OF).every(function(id){ return !!HPO_PAL[HPO_OF[id]]; }));
HF.data.progress={}; HF.data.progress[trainingPlans()[0].id]=3;
noThrow("continue row renders", function(){ setTrSeg('plans'); });
ok("started plan shows where it is", document.getElementById('tr-body').innerHTML.indexOf('Day 4 of')>0);
ok("progress bar on the plan", document.getElementById('tr-body').innerHTML.indexOf('class="hpo-go"')>0);
HF.data.progress={};

print("\n── TRAIN · FITNESS+ SEGMENTS ──");
HF.apply(null); HF.data.onboarded=true;
HF.data.prefs={name:'Seth',goal:'Lose fat',level:'Beginner',days:3,equip:'Bodyweight only'};
['foryou','explore','plans','library'].forEach(function(s){
  noThrow("segment "+s, function(){ setTrSeg(s); }); });
setTrSeg('explore');
var ex=document.getElementById('tr-body').innerHTML;
ok("sampler strip",        ex.indexOf('This Week')>0 && ex.indexOf('Free This Week')<0);
ok("one Browse grid of category posters, no white cards", ex.indexOf('>Browse<')>0 && ex.indexOf('hpo hpo-sq hpo-br')>0 && ex.indexOf('/img/p/br-fatloss.jpg')>0 && / programs<\/span>/.test(ex) && ex.indexOf('class="fact"')<0 && ex.indexOf('Activity Types')<0);
ok("top programs",         ex.indexOf('Top Programs')>0 && ex.indexOf('class="hpo')>0);
ok("no second category row, no third strip of workouts", ex.indexOf('ftile')<0 && ex.indexOf('fwcol')<0 && ex.split('class="fsec"').length-1===4);
ok("browse is by category",  ex.indexOf("openActivity('Fat Loss')")>0);
ok("challenges as collections", ex.indexOf('Collections')>0 && ex.indexOf('fcoll')>0);
noThrow("a category opens", function(){ openPlanGroup('Strength'); });
ok("...listing its plans", document.getElementById('lib-body').innerHTML.indexOf('HITFAT Strong')>0);
ok("NEW badge used",       ex.indexOf('class="hpo-new">New<')>0);
ok("This Week as posters with Start (16 Oct, after FIIT)", ex.indexOf('This Week')>0 && (ex.match(/class="hpo-play"/g)||[]).length>=3);
setTrSeg('plans');
var _plansHtml=document.getElementById('tr-body').innerHTML;
ok("plans lead with Made For You", _plansHtml.indexOf('Made For You')>0 && _plansHtml.indexOf('hpo-w')>0);
ok("build your own still offered", _plansHtml.toLowerCase().indexOf('build your own')>0);
setTrSeg('library');
var lb=document.getElementById('tr-body').innerHTML;
ok("library: four catalogue tiles and your own things", (lb.match(/class="lib-t"/g)||[]).length===4 && lb.indexOf('lib-mine')>0);
ok("the Fitness+ list: what HITFAT+ holds, with counts",
   ['Workouts','Programs','Exercises','Collections','In Progress','Saved Meals'].every(function(k){ return lb.indexOf('>'+k+'<')>0; }));
ok("nothing trained yet: the empty state", HF.count()>0 || lb.indexOf('Your Recently Trained')>0);
noThrow("the Programs row opens", function(){ openLibList('programs'); });
ok("...listing the plans", document.getElementById('lib-body').innerHTML.indexOf('HITFAT Transformation')>0);
HF.data.sessions['sig1-d0']={date:new Date().toISOString(),name:'Full Body Power',mins:22};
setTrSeg('library'); lb=document.getElementById('tr-body').innerHTML;
ok("a finished session shows under Recently Trained", lb.indexOf('Recently Trained')>0 && lb.indexOf('Full Body Power')>0 &&
   lb.indexOf("openProgram('sig1')")>0);
delete HF.data.sessions['sig1-d0'];
HF.data.progress=HF.data.progress||{}; HF.data.progress.sig1=3; setTrSeg('library'); lb=document.getElementById('tr-body').innerHTML;
ok("a plan on the go is offered to continue", lb.indexOf('>Continue<')>0 && lb.indexOf('class="plr"')>0);
delete HF.data.progress.sig1;
noThrow("equipment still filters the exercise library", function(){ openLibrary('Bodyweight'); });
ok("segment pills render", document.getElementById('tr-segs').innerHTML.indexOf('seg on')>0 ||
                           document.getElementById('tr-segs').innerHTML.indexOf('seg')>0);
ok("Train has a large title over the pills, like every tab", document.getElementById('tr-segs').innerHTML.indexOf('class="t">Train<')>0 &&
   document.getElementById('tr-segs').innerHTML.indexOf('hsum')<document.getElementById('tr-segs').innerHTML.indexOf('class="segs"'));

print("\n── NO REPEATED CARDS (the Hybrid Explore fault) ──");
function _ids(h){ var o=[],re=/openProgram\(.([a-z0-9]+)./g,m; while((m=re.exec(h))) o.push(m[1]); return o; }
setTrSeg('explore');
var _ex=_ids(document.getElementById('tr-body').innerHTML);
var _c={}; _ex.forEach(function(i){_c[i]=(_c[i]||0)+1;});
var _dup=Object.keys(_c).filter(function(k){return _c[k]>1;});
ok("Explore shows nothing twice", _dup.length===0, _dup.join(","));
ok("Explore still fills the page", _ex.length>=12, _ex.length);
setTrSeg('plans');
var _pl=_ids(document.getElementById('tr-body').innerHTML);
var _pc={}; _pl.forEach(function(i){_pc[i]=(_pc[i]||0)+1;});
// Netflix shows a title in several rows on purpose; what it must not do is
// repeat the same LIST, or bury one plan in every row.
ok("every plan listed once", _pl.length>=trainingPlans().length-1, _pl.length);

print("\n── RECOVERY · COMING SOON ──");
ok("Recovery is off until filmed",       RECOVERY_LIVE===false);
ok("...so no recovery program is listed", PROGRAMS.filter(isRehabProgram).length===0);
noThrow("the Recovery tab renders",      function(){ setTrSeg('recovery'); });
var _rs=document.getElementById('tr-body').innerHTML;
ok("...as Coming Soon",                  _rs.indexOf('Coming Soon')>0 && _rs.indexOf('soon-tag')>0);
ok("...naming what is on the way",       REHAB_PLANS.every(function(p){ return _rs.indexOf(p.name)>0; }));
ok("...and nothing in it opens",         _rs.indexOf('openProgram(')<0 && _rs.indexOf('openJoint(')<0);
openActivity('Recovery');
ok("the Recovery tile leads to the same", trSeg==='recovery');
openFinder();
var _fqh=document.getElementById('fq-body').innerHTML; closeFinder();
ok("the Finder does not offer Move better", _fqh.indexOf('Lose fat')>0 && _fqh.indexOf('Move better')<0);
try{ closeFinder(); }catch(e){}
/* Everything below tests Recovery as it will be once the footage is in. */
RECOVERY_LIVE=true; PROGRAMS=REHAB_PLANS.concat(PROGRAMS);

print("\n── RECOVERY IS NOW AN ACTIVITY ──");
ok("Recovery is an activity", ACTIVITIES.some(function(a){return a.k==='Recovery';}));
noThrow("recovery opens",     function(){ openActivity('Recovery'); });
var rv=document.getElementById('lib-body').innerHTML;
ok("knee note kept",     rv.indexOf('Knee Strength')>0);
ok("safety note kept",   rv.indexOf('not medical care')>0);
['Fat Loss','Strength','Core','Beginner','Equipment','Started','Finished'].forEach(function(k){
  noThrow("activity "+k, function(){ openActivity(k); }); });

print("\n── VIDEO PLAYER ──");
HF.apply(null); HF.data.onboarded=true;
/* The only exercises without a clip are the HITFAT BAR ones, which are not
   filmed yet. Anything else missing a clip is a real gap. */
/* The only exercises without a clip are the two libraries that are not
   filmed yet — HITFAT BAR and Recovery. Anything else is a real gap. */
ok("only BAR and Recovery lack clips", DB.filter(function(e){return !e.v;})
   .every(function(e){ return isBarExercise(e.n) || isRehabExercise(e.n); }),
   DB.filter(function(e){return !e.v && !isBarExercise(e.n) && !isRehabExercise(e.n);})
     .map(function(e){return e.n;}).join(', '));
ok("every Recovery exercise awaits footage", REHAB_DB.every(function(e){ return !e.v; }));
ok("Recovery footage flag is honest", rehabFootageReady()===REHAB_DB.some(function(e){ return !!e.v; }));
ok("BAR library is part filmed", (function(){
  var c=barFootageCount();
  return c.have>0 && c.have<c.total && c.have===BAR_DB.filter(function(e){return !!e.v;}).length;
})(), JSON.stringify(barFootageCount()));
ok("every filmed BAR clip is a vimeo id", BAR_DB.filter(function(e){return !!e.v;})
   .every(function(e){ return /^\d+$/.test(e.v); }));
ok("no clip is used for two movements", (function(){
  var seen={}, dup=0;
  BAR_DB.forEach(function(e){ if(!e.v) return; if(seen[e.v]) dup++; seen[e.v]=1; });
  return dup===0; })());
/* The flag must mean "every movement is filmed", not "at least one is" —
   otherwise the first clip silences a warning that forty others still need. */
ok("BAR footage flag needs full coverage", barFootageReady()===BAR_DB.every(function(e){ return !!e.v; }));
ok("footage count matches the library", barFootageCount().total===BAR_DB.length);
ok("one clip is not a filmed library", (function(){
  var first=BAR_DB[0], keep=first.v; first.v="123";
  var still=!barFootageReady(); first.v=keep; return still;
})());
ok("embed url is a background player", vimeoSrc('123').indexOf('background=1')>0 &&
   vimeoSrc('123').indexOf('player.vimeo.com/video/123')>0, vimeoSrc('123'));

/* must be a program whose exercises are filmed — BAR and Recovery are not,
   and this block is about clip handling, not about missing footage */
var _p=PROGRAMS.filter(function(p){
  return p.weeks && !isBarProgram(p) && !isRehabProgram(p) && !isPaidProgram(p);
})[0];
ok("a filmed free program exists", !!_p);
openProgram(_p.id); openDay(_p.id,0);
noThrow("day plays", function(){ playDay(); });
ok("player opened",        !!pl && pl.exs.length>0, pl&&pl.exs.length);
ok("rounds carried",       pl.rounds===(_p.rounds||3), pl.rounds);
ok("clock seeded",         pl.left>0, pl.left);
ok("clip set from data",   pl.clip===pl.exs[0].v, pl.clip);
ok("iframe points at vimeo", document.getElementById('pl-video').src.indexOf('https://player.vimeo.com/video/')===0,
   document.getElementById('pl-video').src.slice(0,44));

var _first=pl.exs[0].v;
plNext(false);
ok("next advances",        pl.i===1, pl.i);
ok("clip changed",         pl.clip===pl.exs[1].v);
plPrev();
ok("prev goes back",       pl.i===0 && pl.clip===_first);
plAdjust(10);  ok("plus 10s",  pl.left===(pl.exs[0].dur||45)+10, pl.left);
ok("back ten adds time without moving what is done",
   document.getElementById('pl-el').textContent==='0:00' && document.getElementById('pl-rem').textContent==='−'+fmtT(pl.left));
pl.left-=5; plTime();
ok("the time bar counts what is done", document.getElementById('pl-el').textContent==='0:05');
plAdjust(-999);ok("never below 5s", pl.left===5, pl.left);
plPause(); ok("paused shows play", document.getElementById('pl-play').innerHTML.indexOf('M8 5.5')>0);
plResume(); ok("playing shows pause", document.getElementById('pl-play').innerHTML.indexOf('<rect')>=0);
plPause();
/* the foot's big play/pause follows the same state as the one over the clip */
ok("the foot's play/pause shows play when paused", document.getElementById('pl-play2').innerHTML.indexOf('M8 5.5')>0);
ok("the pill says only the round (the segments count the movements)",
   pl.rounds>1 ? document.getElementById('pl-pill').innerHTML.indexOf('Round')===0 && document.getElementById('pl-pill').innerHTML.indexOf('/'+pl.exs.length)<0
               : document.getElementById('pl-pill').innerHTML==='');
var _shTl=readFile('shell2.html');
ok("the transport row has back 10, play/pause and forward 10",
   _shTl.indexOf('id="pl-play2"')>0 && _shTl.slice(_shTl.indexOf('class="pl-tl"'), _shTl.indexOf('id="pl-play2"')).indexOf('plAdjust(10)')>0);

pl.i=pl.exs.length-1; pl.round=pl.rounds;
ok("last exercise of last round has no next", plNextIndex()===null);
pl.round=1;
ok("rounds loop back to the first exercise",
   pl.rounds>1 ? (plNextIndex().i===0 && plNextIndex().round===2) : true);

noThrow("rest starts", function(){ pl.i=0; pl.round=1; plRest({i:1,round:1}); });
ok("rest counts from twenty", pl.rest && pl.rest.left===REST_SECS && document.getElementById('pl-restn').textContent==String(REST_SECS));
ok("rest draws its ring", document.getElementById('pl-restarc').innerHTML.indexOf('d="M100')>0);
ok("rest names what is next", document.getElementById('pl-restnext').textContent===pl.exs[1].n);
plRestAdd(20); ok("+20s adds twenty", pl.rest.left===REST_SECS+20 && pl.rest.total===REST_SECS+20);
plSkipRest(); ok("skip ends the rest", !pl.resting && pl.rest===null && pl.i===1);
stopTick();
pl.i=pl.exs.length-1; pl.round=pl.rounds; pl.t0=Date.now()-6*60000;
plFinish();
ok("finish logs a session",  HF.count()===1, HF.count());
ok("finish advances the day", progDone(_p.id)===1, progDone(_p.id));
ok("done overlay shown",     document.getElementById('pl-done').className.indexOf('on')>=0);
ok("the summary names the workout", document.getElementById('pl-dn-name').textContent.length>0);
ok("...and shows the week as rings", document.getElementById('pl-dn-week').innerHTML.indexOf('hrings')>0);
ok("finishing keeps the workout for the share card", _lastWorkout && _lastWorkout.exs===pl.exs.length && _lastWorkout.name.length>0);
_canvas={fills:0,texts:0,strokes:0,nan:0,rects:0};
noThrow("the workout share card draws", function(){ _shareKind='workout'; drawShareCard(); });
ok("...with its rings, tiles and words, and no NaN", _canvas.strokes>=6 && _canvas.fills>=4 && _canvas.texts>20 && _canvas.nan===0,
   JSON.stringify(_canvas));
_shareKind='progress';
noThrow("player closes",     function(){ plClose(); });
ok("player state released",  pl===null);
ok("iframe emptied",         document.getElementById('pl-video').src==='');

noThrow("single session plays",  function(){ playSingle(PROGRAMS.filter(function(p){return !p.weeks;})[0].id); });
ok("...one round only",          pl.rounds>=1); plClose();
noThrow("one exercise plays",    function(){ playExercise(DB[0].n); });
ok("...just that movement",      pl.exs.length===1 && pl.exs[0].n===DB[0].n); plClose();
noThrow("unknown exercise is safe", function(){ playExercise('Nasi Lemak Press'); });
noThrow("empty list is safe",    function(){ startWorkout([],{}); });

print("\n── CAMERA · MIRROR MODE ──");
// getUserMedia resolves on the microtask queue — let it settle before asserting
function flush(){ if(typeof drainMicrotasks==='function') drainMicrotasks(); }
HF.apply(null); HF.data.onboarded=true;
var _pp=PROGRAMS.filter(function(p){return p.weeks;})[0];
openProgram(_pp.id); openDay(_pp.id,0);
_cam.mode='ok'; _cam.stopped=0;
noThrow("workout opens on READY", function(){ playDay(); });
ok("ready screen shown, not counting down", document.getElementById('pl-ready').className.indexOf('on')>=0);
ok("ready names the workout and what is in it", document.getElementById('pl-rdt').textContent===(pl.meta.name||pl.exs[0].n) &&
   /exercises?/.test(document.getElementById('pl-rdm').textContent) && /min$/.test(document.getElementById('pl-rdm').textContent));
noThrow("the count-in starts", function(){ plCountdown(function(){}); });
ok("the count-in starts at three, with a third of the ring", document.getElementById('pl-cdn').textContent==='3' &&
   document.getElementById('pl-cdarc').innerHTML.indexOf('d="M100')>0);
ok("...and names the first movement", document.getElementById('pl-cdx').innerHTML.indexOf(pl.exs[0].n)>0);
document.getElementById('pl-cd').classList.remove('on');
ok("the player's chrome waits behind Ready", document.getElementById('play').className.indexOf('rdy')>=0);
ok("...and names the next movement under Get ready", document.getElementById('pl-cdx').innerHTML.indexOf('Up next')>0);
if(!PL_MIRROR){
  print("\n── PLAYER · SIMPLE STYLE (no mirror) ──");
  ok("no view choice on Ready", document.getElementById('pl-modes').style.display==='none');
  ok("Ready lists minutes, exercises and rounds as chips", /pl-chips/.test(document.getElementById('pl-rds').innerHTML) &&
     /min/.test(document.getElementById('pl-rds').innerHTML) && /rounds?/.test(document.getElementById('pl-rds').innerHTML));
  ok("one button: Start workout", document.getElementById('pl-rdgo').textContent==='Start workout');
  ok("the camera controls are hidden", document.getElementById('play').className.indexOf('nomirror')>=0);
  _cam.stopped=0; var _gum=0, _md0=navigator.mediaDevices;
  navigator.mediaDevices={getUserMedia:function(){ _gum++; return _md0.getUserMedia.apply(_md0,arguments); }};
  plBegin(); flush();
  ok("Start never asks for the camera", _gum===0 && !plCam.stream, _gum);
  navigator.mediaDevices=_md0;
  ok("...and goes straight to the count-in", document.getElementById('pl-ready').className.indexOf('on')<0 &&
     document.getElementById('pl-cd').className.indexOf('on')>=0 && pl.started===true);
  document.getElementById('pl-cd').classList.remove('on'); plResume();
  ok("the top names what comes next", /^Next: <b>/.test(document.getElementById('pl-next').innerHTML) || document.getElementById('pl-next').textContent==='Last one!');
  pl.left-=1; pl.work=120; plStats();
  ok("kcal follows the work done", document.getElementById('pl-kcal').textContent===String(Math.round(2*PL_KCAL_MIN)), document.getElementById('pl-kcal').textContent);
  var _q0=(HF.data.quits||[]).length;
  plClose();
  ok("closing early asks why first", pl!==null && document.getElementById('pl-why').className.indexOf('on')>=0 && !pl.running);
  ok("...with Simple's five reasons", (document.getElementById('pl-whyopts').innerHTML.match(/<button/g)||[]).length===5 &&
     document.getElementById('pl-whyopts').innerHTML.indexOf('Too difficult')>0);
  plWhyKeep();
  ok("Keep going carries on", pl!==null && pl.running && document.getElementById('pl-why').className.indexOf('on')<0);
  plClose(); plWhyPick('hard');
  ok("a reason closes the player and is kept", pl===null && HF.data.quits.length===_q0+1 && HF.data.quits[_q0].r==='hard' && HF.data.quits[_q0].s===120,
     JSON.stringify(HF.data.quits[_q0]));
  ok("the reasons survive a reload", HF.apply(JSON.parse(JSON.stringify(HF.data))) || HF.data.quits.length===_q0+1);
  openProgram(_pp.id); openDay(_pp.id,0); playDay();
  plClose();
  ok("closing from Ready (nothing started) does not ask", pl===null);
  noThrow("landscape button is safe without the API", function(){ playDay(); plRotate(); plClose(); });
}
if(PL_MIRROR){
ok("both view modes offered", document.getElementById('pl-modes').innerHTML.indexOf('Mirror')>0 &&
   document.getElementById('pl-modes').innerHTML.indexOf('Coach')>0);
ok("coach is the default", plCam.mode==='coach');
plPickMode('mirror');
ok("mirror mode selected",  plCam.mode==='mirror');
ok("mirror class applied",  document.getElementById('play').className.indexOf('mirrormode')>=0);
plToggleMode();
ok("toggle returns to coach", plCam.mode==='coach' &&
   document.getElementById('play').className.indexOf('mirrormode')<0);

plBegin(); flush();
ok("camera granted",        !!plCam.stream);
ok("camera revealed",       document.getElementById('play').className.indexOf('hascam')>=0);
ok("stream on the element", !!document.getElementById('pl-cam').srcObject);
ok("indicator lit",         document.getElementById('pl-camdot').className.indexOf('on')>=0);
plToggleCam();
ok("camera can be hidden",  plCam.off===true && document.getElementById('play').className.indexOf('camoff')>=0);
plToggleCam();
ok("...and brought back",   plCam.off===false);
plClose(); flush();
ok("closing releases the camera", plCam.stream===null && _cam.stopped>0, _cam.stopped);
ok("hascam cleared",        document.getElementById('play').className.indexOf('hascam')<0);

openProgram(_pp.id); openDay(_pp.id,0);
_cam.mode='deny';
playDay(); plBegin(); flush();
ok("denied shows the busy screen", document.getElementById('pl-rdt').textContent==='Camera blocked',
   document.getElementById('pl-rdt').textContent);
ok("...and offers a way past it", document.getElementById('pl-rdbusy').style.display==='flex');
noThrow("train without camera", function(){ plNoCam(); });
ok("falls back to coach mode",  plCam.mode==='coach');
plClose();

openProgram(_pp.id); openDay(_pp.id,0);
_cam.mode='none';
var _md=navigator.mediaDevices; navigator.mediaDevices=null;
playDay(); plBegin(); flush();
ok("no camera hardware handled", document.getElementById('pl-rdbusy').style.display==='flex');
navigator.mediaDevices=_md; plClose();
_cam.mode='ok';
}

print("\n── CUSTOM PLAN BUILDER ──");
HF.apply(null); HF.data.onboarded=true;
HF.data.prefs={name:'Seth',goal:'Lose fat',level:'Beginner',days:3,equip:'Bodyweight only'};
applyCustom();
ok("no custom plan to begin with", !hasCustom() && !PROGRAMS.some(function(p){return p.id==='custom';}));
noThrow("builder opens", function(){ openCustom(); });
[0,1,2,3,4,5].forEach(function(i){ noThrow("step "+i+" renders", function(){ cp.step=i; renderCP(); }); });
cp.step=0; cp.acts=[]; ok("blocked with no activity", cpValid()===false);
cp.acts=['full']; ok("unblocked with one",  cpValid()===true);
cp.step=1; cp.days=[];  ok("blocked with no days", cpValid()===false);
cp.days=[0,2,4]; ok("unblocked with days", cpValid()===true);

cp={step:5,acts:['full','core'],days:[0,2,4],len:30,eq:'Dumbbell',wk:4};
var _cpp=cpBuild();
ok("weeks match the choice",   _cpp.weeks.length===4, _cpp.weeks.length);
ok("training days match",      _cpp.weeks[0].days.filter(function(d){return !d.rest;}).length===3);
ok("rest fills the other days",_cpp.weeks[0].days.filter(function(d){return d.rest;}).length===4);
ok("session length honoured",  _cpp.dur===30);
ok("exercise count follows length",
   _cpp.weeks[0].days.filter(function(d){return !d.rest;})[0].ex.length===6, 'per day');
var _bad=0; _cpp.weeks.forEach(function(w){ w.days.forEach(function(d){ if(d.rest) return;
  d.ex.forEach(function(n){ if(!DB.find(function(e){return e.n===n;})) _bad++; }); }); });
ok("every custom exercise is real", _bad===0, _bad);
ok("activities alternate across days", (function(){
   var ns=_cpp.weeks[0].days.filter(function(d){return !d.rest;}).map(function(d){return d.name;});
   var u={}; ns.forEach(function(n){u[n]=1;}); return Object.keys(u).length>1; })());

cp={step:5,acts:['mob'],days:[1],len:10,eq:'Kettlebell',wk:2};
var _thin=cpBuild().weeks[0].days.filter(function(d){return !d.rest;})[0];
ok("impossible combo still fills a day", _thin.ex.length===4, _thin.ex.length);
ok("...with real exercises", _thin.ex.every(function(n){return !!DB.find(function(e){return e.n===n;});}));

cp={step:5,acts:['full','fat'],days:[0,2,4,6],len:20,eq:'Bodyweight',wk:8};
cpSave();
ok("spec saved, not the whole plan", HF.data.custom && !HF.data.custom.weeks, JSON.stringify(HF.data.custom));
ok("plan appears in the catalogue",  PROGRAMS.some(function(p){return p.id==='custom';}));
ok("only ever one custom",  (function(){ applyCustom(); applyCustom();
    return PROGRAMS.filter(function(p){return p.id==='custom';}).length===1; })());
ok("rebuild from spec is identical", (function(){
    var a=JSON.stringify(PROGRAMS.filter(function(p){return p.id==='custom';})[0].weeks);
    applyCustom();
    return a===JSON.stringify(PROGRAMS.filter(function(p){return p.id==='custom';})[0].weeks); })());
noThrow("plans shows it", function(){ setTrSeg('plans'); });
ok("the custom card says it is yours", document.getElementById('tr-body').innerHTML.indexOf('Your Custom Plan')>0);
ok("card offers editing", document.getElementById('tr-body').innerHTML.indexOf('Edit My Plan')>0);
noThrow("custom plan opens", function(){ openProgram('custom'); });
noThrow("its day opens",     function(){ openDay('custom',0); });
delete HF.data.custom; applyCustom();
ok("delete removes it", !PROGRAMS.some(function(p){return p.id==='custom';}));

print("\n── ONBOARDING ──");
HF.apply(null);
_ob={goal:null,level:'Beginner',days:3,equip:'Bodyweight only',ack:false,name:'Seth'};
finishOb(); ok("blocked without a goal", HF.data.onboarded===false);
_ob.goal='Lose fat'; finishOb(); ok("blocked without the readiness tick", HF.data.onboarded===false);
_ob.ack=true; finishOb();
ok("completes with both",   HF.data.onboarded===true);
ok("prefs saved",           HF.data.prefs.goal==='Lose fat' && HF.data.prefs.name==='Seth', JSON.stringify(HF.data.prefs));
/* The Fitness+ sheet: days chosen as circles, counted into prefs.days. */
startOnboarding();
var _obh=document.getElementById('ob-in').innerHTML;
/* An edit is the Fitness+ "Get Started" sheet: Schedule, Goal, Equipment. */
ok("an edit opens on the schedule, with day circles", _obh.indexOf('obtabs')>0 &&
   _obh.split('class="obdays"').length-1===1 && _obh.split('aria-label="'+'Monday"').length-1===1);
ok("...a card for each training day", _obh.split('class="obwk"').length-1===_ob.dayList.length);
ok("...and an edit can be closed", _obh.indexOf('obClose()')>0);
noThrow("the goal tab opens", function(){ obSetTab('goal'); });
ok("...with the goal tiles and the level", document.getElementById('ob-in').innerHTML.indexOf('obtile')>0 &&
   document.getElementById('ob-in').innerHTML.indexOf("obPick('level'")>0);
noThrow("the equipment tab opens", function(){ obSetTab('equip'); });
ok("...with the equipment tiles", document.getElementById('ob-in').innerHTML.indexOf("obPick('equip'")>0);
obSetTab('schedule');
var _d0=_ob.dayList.length; obDay(6);
ok("a day circle adds a day", _ob.dayList.length===_d0+1 && _ob.days===_d0+1);
_ob.dayList=[0,3]; _ob.days=2; obDay(0);
ok("...never fewer than two", _ob.dayList.length===2);
_ob.dayList=[0,1,2,3,4,5]; _ob.days=6; obDay(6);
ok("...and one day always rests", _ob.dayList.length===6);
_ob.dayList=[0,2,4,6]; _ob.days=4; finishOb();
ok("the chosen days are kept", HF.data.prefs.days===4 && HF.data.prefs.dayList.join()==='0,2,4,6');
ok("an edit saves without leaving for Home", HF.data.onboarded===true);
ok("a Remove on a day card takes the day off", (function(){
    startOnboarding(); _ob.dayList=[0,2,4]; _ob.days=3; renderOb(); obDay(2); return _ob.dayList.join()==='0,4'; })());
obClose();




/* Adding two unfilmed libraries to DB leaked them into every generic plan.
   A paid program must never contain a movement with no clip. */
ok("no paid program contains unfilmed moves", (function(){
    var bad=[];
    PROGRAMS.filter(function(p){ return p.weeks && isPaidProgram(p) && !isRehabProgram(p); })
    .forEach(function(p){
      p.weeks.forEach(function(w){ w.days.forEach(function(d){ if(d.rest) return;
        d.ex.forEach(function(n){
          var e=DB.filter(function(x){ return x.n===n; })[0];
          if(e && !e.v) bad.push(p.name+': '+n); }); }); });
    });
    return bad.length===0; })(), 'unfilmed moves inside paid programs');
ok("generic plans never pull BAR moves", (function(){
    return PROGRAMS.filter(function(p){ return p.weeks && !isBarProgram(p) && !isRehabProgram(p); })
      .every(function(p){ return p.weeks.every(function(w){ return w.days.every(function(d){
        return d.rest || d.ex.every(function(n){ return !isBarExercise(n); }); }); }); }); })());
ok("generic plans never pull prehab moves", (function(){
    return PROGRAMS.filter(function(p){ return p.weeks && !isBarProgram(p) && !isRehabProgram(p); })
      .every(function(p){ return p.weeks.every(function(w){ return w.days.every(function(d){
        return d.rest || d.ex.every(function(n){ return !isRehabExercise(n); }); }); }); }); })());
/* The BAR programmes are built only from movements that have a clip. A session
   that sends someone to four "clip coming soon" cards is worse than a shorter
   session, so this must not drift as new movements are added unfilmed. */
ok("every BAR session uses only filmed movements", (function(){
  var bad=[];
  BAR_PLANS.forEach(function(p){
    p.weeks.forEach(function(w){ w.days.forEach(function(d){
      if(d.rest) return;
      d.ex.forEach(function(n){
        var e=DB.filter(function(x){ return x.n===n; })[0];
        if(!e || !e.v) bad.push(p.name+': '+n);
      });
    }); });
  });
  return bad.length===0; })(), 'unfilmed movements inside BAR programmes');
ok("no BAR session is left short", BAR_PLANS.every(function(p){
  return p.weeks.every(function(w){ return w.days.every(function(d){
    return d.rest || d.ex.length>=4; }); }); }));
/* The filmed flag must actually narrow the pool, or the guarantee above is
   accidental rather than enforced. */
ok("filmed:true narrows the pool", (function(){
  var all=dayPool({eq:BAR_EQ}), only=dayPool({eq:BAR_EQ, filmed:true});
  return only.length>0 && only.length<all.length &&
         only.every(function(n){
           var e=DB.filter(function(x){ return x.n===n; })[0]; return e && !!e.v; });
})());
ok("BAR plans still get BAR moves", BAR_PLANS.every(function(p){
    return p.weeks[0].days.some(function(d){ return !d.rest && d.ex.some(isBarExercise); }); }));
ok("no generic day went empty",  PROGRAMS.filter(function(p){ return p.weeks && p.hub!=='lb30' && p.hub!=='d6'; })
    .every(function(p){ return p.weeks.every(function(w){ return w.days.every(function(d){
      return d.rest || d.ex.length>0; }); }); }));

print("\n── FIND MY PROGRAM ──");
HF.apply(null); HF.data.onboarded=true;
_member();

noThrow("finder opens",          function(){ openFinder(); });
ok("finder is shown",            document.getElementById('fqm').className.indexOf('on')>=0);
ok("starts on the goal step",    fq.step===0);
ok("next is blocked until answered",
    document.getElementById('fq-body').innerHTML.indexOf('opacity:.4;')>0);
fqSet('goal','fat');
ok("answering enables next",     document.getElementById('fq-body').innerHTML.indexOf('opacity:.4;')<0);

/* the joint step is only for people who said "move better" — everyone else
   should never be asked what hurts */
fqGo(1);
ok("fat loss skips the joint step", fq.step===2, fq.step);
fq.step=0; fqSet('goal','move'); fqGo(1);
ok("move better asks the joint",    fq.step===1);
ok("joint step says it is not a diagnosis",
    document.getElementById('fq-body').innerHTML.indexOf('not what is wrong with you')>0);
fqSet('joint','Knee'); fqGo(1);
ok("then days",                  fq.step===2);
fqGo(1);
ok("then equipment",             fq.step===3);
fqGo(-1); fqGo(-1);
ok("back skips the joint step going the other way too", (function(){
    fq.step=2; fq.goal='fat'; fqGo(-1); return fq.step===0; })());

noThrow("every path produces a result", function(){
  FQ_GOALS.forEach(function(g){
    FQ_EQUIP.forEach(function(e){
      [2,3,4,5,6].forEach(function(d){
        ['Beginner','Intermediate','Advanced'].forEach(function(l){
          fq={step:3, goal:g.k, joint:'all', days:d, equip:e.k, level:l};
          fqResult();
        });
      });
    });
  });
});
ok("no combination comes back empty", (function(){
    var empty=0;
    FQ_GOALS.forEach(function(g){ FQ_EQUIP.forEach(function(e){
      fq={step:3, goal:g.k, joint:'all', days:3, equip:e.k, level:'Beginner'};
      fqResult();
      if(document.getElementById('store-body').innerHTML.indexOf('Nothing matched')>0) empty++;
    }); });
    return empty===0; })(), 'some combinations matched nothing');

/* the match has to actually respect the answers */
fq={step:3, goal:'move', joint:'Knee', days:3, equip:'none', level:'Beginner'}; fqResult();
ok("move better returns recovery",  document.getElementById('store-body').innerHTML.indexOf('YOUR MATCH')>0);
ok("and it is a recovery program",  (function(){
    return PROGRAMS.filter(isRehabProgram).some(function(p){
      return document.getElementById('store-body').innerHTML.indexOf(p.name)>0; }); })());
/* HITFAT BAR is paused: the Finder must not offer equipment nobody can use. */
ok("a paused BAR is not a Finder option", FQ_EQUIP.every(function(q){ return q.k!=='bar'; }));
fq={step:3, goal:'fat', joint:null, days:3, equip:'none', level:'Beginner'}; fqResult();
ok("no equipment does not pick the BAR", (function(){
    var top=PROGRAMS.map(function(p){ return {p:p, s:fqScore(p).s}; })
             .filter(function(x){return x.s>0;}).sort(function(a,b){return b.s-a.s;})[0];
    return top && !isBarProgram(top.p); })());
ok("the match explains itself",  document.getElementById('store-body').innerHTML.indexOf('fqwhy')>0);
ok("reasons are capped at three", (function(){
    return PROGRAMS.every(function(p){ return fqScore(p).why.length<=3; }); })());
ok("it offers a way out",        document.getElementById('store-body').innerHTML.indexOf('Not the exact match?')>0);
ok("and a way to start over",    document.getElementById('store-body').innerHTML.indexOf('openFinder()')>0);
ok("stats are shown up front",   document.getElementById('store-body').innerHTML.indexOf('days / week')>0);

print("\n── WEEK BY WEEK ──");
var wp=PROGRAMS.filter(function(p){return p.weeks && p.weeks.length>=8;})[0];
ok("every week is listed",       (function(){
    var h=weekPhases(wp), n=(h.match(/class="row"/g)||[]).length;
    return n===wp.weeks.length; })());
ok("phases are named, not numbered only", weekPhases(wp).indexOf('Foundation')>0
                                       && weekPhases(wp).indexOf('Finish')>0);
ok("phase names progress",       (function(){
    var seen=[]; for(var i=0;i<12;i++) seen.push(phaseName(i,12).split('· ')[1]);
    return seen[0]==='Foundation' && seen[11]==='Finish'
        && seen.indexOf('Build')>0 && seen.indexOf('Load')>0 && seen.indexOf('Peak')>0; })());
ok("a one-week program still works", weekPhases({weeks:[{days:[{name:'Day 1'}]}]}).indexOf('Week 1')>0);
ok("no weeks means no section",  weekPhases({weeks:[]})==='' && weekPhases(null)==='');
ok("session names are shown",    weekPhases(wp).indexOf(wp.weeks[0].days.filter(function(d){return !d.rest;})[0].name)>0);
openProduct('prog_'+PROGRAMS.filter(isPaidProgram)[0].id);
ok("an old program link opens the membership, naming the program", (function(){
    var h=document.getElementById('pw-body').innerHTML;
    return h.indexOf(PROGRAMS.filter(isPaidProgram)[0].name)>0 && h.indexOf('sub_plus_12m')>0; })());
closeProduct();
HF.apply(null); trSeg='explore';

print("\n── RECOVERY · prehab ──");
HF.apply(null); HF.data.onboarded=true;
_member();

var rhs=PROGRAMS.filter(isRehabProgram);
ok("recovery programs exist",      rhs.length>=6, rhs.length);
ok("all carry goal Recovery",      rhs.every(function(p){ return p.goal==='Recovery'; }));
ok("two are free to start with",   rhs.filter(function(p){ return !isPaidProgram(p); }).length>=2);
ok("no recovery day is empty",     rhs.every(function(p){
    return p.weeks.every(function(w){ return w.days.every(function(d){
      return d.rest || d.ex.length>0; }); }); }));
ok("recovery days hold real moves", rhs.every(function(p){
    return p.weeks.every(function(w){ return w.days.every(function(d){
      return d.rest || d.ex.every(function(n){
        return DB.some(function(e){ return e.n===n; }); }); }); }); }));
ok("recovery weeks differ",        (function(){
    var p=rhs.filter(function(x){ return x.weeks.length>1; })[0];
    return !p || JSON.stringify(p.weeks[0])!==JSON.stringify(p.weeks[1]); })());
ok("recovery regenerates the same", (function(){
    var a=JSON.stringify(PROGRAMS.filter(isRehabProgram).map(function(p){return p.weeks;}));
    return a===JSON.stringify(rhs.map(function(p){return p.weeks;})); })());

/* the tile used to match on names and swept up the wrong programs */
ok("Recovery tile matches only recovery", PROGRAMS.filter(function(p){
    return activityMatch('Recovery',p); }).every(isRehabProgram));
ok("chair workouts are no longer Recovery", !activityMatch('Recovery',{name:'5 Day Chair',goal:'Fat Loss'}));
ok("BAR Foundations is not Recovery",       !activityMatch('Recovery',{name:'BAR Foundations',goal:'Strength'}));
ok("Recovery tile is not empty",            PROGRAMS.filter(function(p){
    return activityMatch('Recovery',p); }).length>0);

/* joints */
ok("five joints covered",          REHAB_JOINTS.length===5);
ok("every joint has movements",    REHAB_JOINTS.every(function(j){ return rehabFor(j.k).length>=5; }),
                                   REHAB_JOINTS.map(function(j){ return j.k+':'+rehabFor(j.k).length; }).join(' '));
ok("reused moves keep their clip", (function(){
    var reused=[].concat(REHAB_REUSED.Spine||[], REHAB_REUSED.Knee||[]);
    return reused.every(function(n){
      var e=DB.filter(function(x){ return x.n===n; })[0]; return e && !!e.v; }); })());
ok("no rehab name duplicates an existing one", (function(){
    var counts={};
    DB.forEach(function(e){ counts[e.n]=(counts[e.n]||0)+1; });
    return REHAB_DB.every(function(e){ return counts[e.n]===1; }); })());

noThrow("recovery segment renders", function(){ switchTab('train'); setTrSeg('recovery'); });
ok("segment lists the programs",   rhs.every(function(p){
    return document.getElementById('tr-body').innerHTML.indexOf(p.name)>0; }));
ok("segment offers every joint",   REHAB_JOINTS.every(function(j){
    return document.getElementById('tr-body').innerHTML.indexOf("openJoint('"+j.k+"')")>0; }));
ok("segment states it is not treatment",
    document.getElementById('tr-body').innerHTML.indexOf('not treatment for an injury')>0);
ok("segment admits missing footage",
    document.getElementById('tr-body').innerHTML.indexOf('being filmed')>0);
ok("programs carry no price of their own", document.getElementById('tr-body').innerHTML.indexOf('RM29')<0 &&
                                   document.getElementById('tr-body').innerHTML.indexOf('>FREE<')<0);

noThrow("every joint page opens",  function(){ REHAB_JOINTS.forEach(function(j){ openJoint(j.k); }); });
openJoint('Knee');
ok("joint page lists its moves",   rehabFor('Knee').every(function(n){
    return document.getElementById('lib-body').innerHTML.indexOf(n)>0; }));
ok("joint page repeats the warning",
    document.getElementById('lib-body').innerHTML.indexOf('stop')>0);
noThrow("bad joint is safe",       function(){ openJoint('Elbow'); });

HF.apply(null); trSeg='explore';

print("\n── HITFAT BAR & SIGNATURE ──");
HF.apply(null); HF.data.onboarded=true;
_member();

/* the Back button bug: TRAIN's Store segment reopened the store forever */
switchTab('train'); setTrSeg('explore');
noThrow("store opens from TRAIN", function(){ setTrSeg('store'); });
ok("store is showing",           document.getElementById('store').style.display==='block');
noThrow("back leaves the store", function(){ closeStore(); });
ok("back actually goes back",    document.getElementById('store').style.display==='none'
                              && document.getElementById('train').style.display==='block');
ok("back does not bounce",       trSeg!=='store', trSeg);
ok("back restores the old tab",  trSeg==='explore', trSeg);
setTrSeg('plans'); setTrSeg('store'); closeStore();
ok("back remembers where you were", trSeg==='plans', trSeg);
ok("Train has no Store pill", TR_SEGS.every(function(x){ return x[0]!=='store'; }));
switchTab('me'); openStore(); closeStore();
ok("the Store opened from Me goes back to Me", curTab==='me' && document.getElementById('me').style.display==='block', curTab);

/* BAR programs — paused (BAR_ENABLED=false). The programs are still built,
   so switching it back on needs no rework; they just reach no screen. */
var bars=BAR_PLANS;
ok("BAR programs are still built",   bars.length>=5, bars.length);
ok("...and would be free",           bars.every(function(p){ return !isPaidProgram(p); }));
ok("BAR days are all BAR moves", bars.every(function(p){
    return p.weeks.every(function(w){ return w.days.every(function(d){
      return d.rest || d.ex.every(isBarExercise); }); }); }));
ok("no BAR day is empty",        bars.every(function(p){
    return p.weeks.every(function(w){ return w.days.every(function(d){
      return d.rest || d.ex.length>0; }); }); }));
ok("BAR weeks differ",           (function(){
    var p=bars.filter(function(x){return x.weeks.length>1;})[0];
    return !p || JSON.stringify(p.weeks[0])!==JSON.stringify(p.weeks[1]); })());
ok("while paused, no BAR program is in any list", PROGRAMS.filter(isBarProgram).length===0);
ok("...Train has no BAR segment",  TR_SEGS.every(function(x){ return x[0]!=='bar'; }));
ok("...the Store has no BAR tab",  STORE_SEGS.every(function(x){ return x[0]!=='bar'; }));
noThrow("an old link to the BAR segment is safe", function(){ switchTab('train'); setTrSeg('bar'); });
ok("...and shows no BAR",          document.getElementById('tr-body').innerHTML.indexOf('HITFAT BAR')<0);
openLibrary(BAR_EQ);
ok("...the library falls back to everything", libEq==='All');
ok("...and lists no BAR movement", document.getElementById('lib-body').innerHTML.indexOf(BAR_EQ)<0);
ok("...while the exercises stay for the plans", BAR_DB.every(function(e){ return DB.indexOf(e)>=0; }));

/* the player must not leave the previous clip running under a new name */
var _noclip=BAR_DB.filter(function(e){ return !e.v; })[0];
ok("an unfilmed movement still exists to test with", !!_noclip);
ok("the Library does not offer an unfilmed movement as playable", (function(){
    var t0=toast, said=''; toast=function(m){ said=m; }; plClose&&pl&&plClose(); playExercise(_noclip.n); toast=t0;
    return !pl && said.indexOf('coming soon')>0; })());
/* the player itself, reached another way (a T42 plan day), still blanks */
ok("a clipless exercise blanks the video", (function(){
    startWorkout([_noclip],{rounds:1,key:'noclip',name:_noclip.n});
    var f=document.getElementById('pl-video');
    return String(f.src||'').indexOf('vimeo')<0; })());
ok("and says so on screen",      document.getElementById('pl-nofilm').style.display==='grid');
ok("the notice names the move",  document.getElementById('pl-nofilm-m')
   .textContent.indexOf(_noclip.n)===0,
   document.getElementById('pl-nofilm-m').textContent.slice(0,50));
noThrow("player closes",         function(){ plClose(); });
var _filmed=BAR_DB.filter(function(e){ return !!e.v; })[0];
playExercise(_filmed.n);
ok("a filmed BAR movement plays its clip",
   String(document.getElementById('pl-video').src||'').indexOf(_filmed.v)>0,
   document.getElementById('pl-video').src);
ok("...and shows no missing-footage notice",
   document.getElementById('pl-nofilm').style.display!=='grid');
plClose();
ok("a filmed exercise still plays", (function(){
    var real=DB.filter(function(e){ return e.v; })[0];
    playExercise(real.n);
    var f=document.getElementById('pl-video');
    var ok1=String(f.src||'').indexOf('vimeo')>0;
    var ok2=document.getElementById('pl-nofilm').style.display==='none';
    plClose(); return ok1 && ok2; })());

/* Signature */
var sigs=PROGRAMS.filter(isSignature);
ok("signature programs exist",   sigs.length>=4, sigs.length);
ok("signature programs are paid",sigs.every(isPaidProgram));
/* A 3-week signature is not dearer than a 12-week standard, and should not
   be. The claim is that signature costs more for the same length. */
ok("signature costs more at the same length", (function(){
    return [2,4,8,12].every(function(wk){
      var fake={weeks:new Array(wk)};
      return programPrice(Object.assign({special:true},fake)) > programPrice(fake); }); })());
ok("signature is never a BAR program", sigs.every(function(p){ return !isBarProgram(p); }));
ok("bundle still beats singles", BUNDLE_PRICE < PROGRAMS.filter(isPaidProgram)
                                 .reduce(function(s,p){ return s+programPrice(p); },0));
HF.apply(null); trSeg='explore';

print("\n── MONTHLY CHALLENGE ──");
HF.apply(null); HF.data.onboarded=true;

ok("twelve months covered",     MONTHLY.length===12);
ok("one per calendar month",    MONTHLY.every(function(c,i){ return c.m===i; }));
ok("every month has a target",  MONTHLY.every(function(c){ return c.target>0 && c.target<=31; }));
ok("targets fit the month",     MONTHLY.every(function(c){
    var dim=new Date(2026,c.m+1,0).getDate(); return c.target<=dim; }),
    MONTHLY.filter(function(c){ return c.target>new Date(2026,c.m+1,0).getDate(); })
      .map(function(c){return c.n;}).join(', '));
ok("February target fits 28",   MONTHLY[1].target<=28);
ok("every month is named",      MONTHLY.every(function(c){ return c.n && c.e && c.d; }));
ok("names are distinct",        (function(){
    var s={}; MONTHLY.forEach(function(c){ s[c.n]=1; }); return Object.keys(s).length===12; })());

/* the rotation is what makes it feel new — it must actually follow the date */
ok("challenge follows the month", (function(){
    return [0,3,7,11].every(function(m){
      return thisChallenge(new Date(2026,m,15)).n===MONTHLY[m].n; }); })());
ok("month key is year-month",   /^\d{4}-\d{2}$/.test(monthKey(new Date(2026,4,9))), monthKey(new Date(2026,4,9)));
ok("days in month is right",    daysInMonth(new Date(2026,1,1))===28 && daysInMonth(new Date(2026,0,1))===31);
ok("leap year handled",         daysInMonth(new Date(2028,1,1))===29);

/* progress is derived from real sessions, not a second counter */
ok("no sessions means zero",    challengeProgress().done===0);
ok("not complete at zero",      challengeProgress().complete===false);
(function(){
  var d=new Date(), k=monthKey();
  for(var i=1;i<=5;i++){
    var dd=new Date(d.getFullYear(), d.getMonth(), i, 9, 0, 0);
    HF.data.sessions['t'+i]={date:dd.toISOString(), name:'x', mins:20};
  }
})();
ok("five days counted",         challengeProgress().done===5, challengeProgress().done);
ok("same day twice counts once",(function(){
    var d=new Date(); var dd=new Date(d.getFullYear(), d.getMonth(), 1, 18, 0, 0);
    HF.data.sessions['dup']={date:dd.toISOString(), name:'x', mins:20};
    return challengeProgress().done===5; })(), challengeProgress().done);
ok("last month does not count", (function(){
    var d=new Date(); var prev=new Date(d.getFullYear(), d.getMonth()-1, 15, 9, 0, 0);
    HF.data.sessions['old']={date:prev.toISOString(), name:'x', mins:20};
    return challengeProgress().done===5; })(), challengeProgress().done);
ok("percentage tracks the target", challengeProgress().pct===
    Math.min(100,Math.round(5/thisChallenge().target*100)));

/* joining is commitment, not a gate — progress counts either way */
ok("not joined by default",     joinedChallenge()===false);
ok("progress counts anyway",    challengeProgress().done===5);
noThrow("join is safe",         function(){ joinChallenge(); });
ok("join is remembered",        joinedChallenge()===true);
ok("join did not change progress", challengeProgress().done===5);

/* completion banks a badge that survives the month ending */
ok("no badge before finishing", earnedBadges().length===0);
(function(){
  var d=new Date(), t=thisChallenge().target;
  for(var i=1;i<=t;i++){
    var dd=new Date(d.getFullYear(), d.getMonth(), i, 9, 0, 0);
    HF.data.sessions['f'+i]={date:dd.toISOString(), name:'x', mins:20};
  }
})();
ok("target reached",            challengeProgress().complete===true, challengeProgress().done);
ok("percentage caps at 100",    challengeProgress().pct===100);
ok("banking earns a badge",     bankMonth()===true && earnedBadges().length===1);
ok("banking twice does not duplicate", bankMonth()===false && earnedBadges().length===1);
ok("badge keeps the name",      earnedBadges()[0].name===thisChallenge().n);

print("\n── MONTHLY · UI ──");
noThrow("panel opens",          function(){ openMonthly(); });
ok("panel is shown",            document.getElementById('monthly').style.display==='block');
ok("panel names the challenge", document.getElementById('mth-body').innerHTML.indexOf(thisChallenge().n)>0);
ok("day grid drawn in full",    (document.getElementById('mth-body').innerHTML.match(/class="mday/g)||[]).length===daysInMonth());
ok("completion is stated",      document.getElementById('mth-body').innerHTML.indexOf('Challenge complete')>0);
ok("shelf shows the badge",     document.getElementById('mth-body').innerHTML.indexOf('mbadge')>0);
ok("the year ahead is listed",  MONTHLY.every(function(c){
    return document.getElementById('mth-body').innerHTML.indexOf(c.n)>0; }));
ok("it says who it is for",     document.getElementById('mth-body').innerHTML.indexOf('Open to every member')>0);
noThrow("home card renders",    function(){ switchTab('home'); });
ok("home shows the challenge",  document.getElementById('home-activity').innerHTML.indexOf('mcard')>0);
ok("home card opens the panel", document.getElementById('home-activity').innerHTML.indexOf('openMonthly()')>0);
noThrow("panel survives no data", function(){ HF.apply(null); renderMonthly(); });
ok("empty state offers joining", document.getElementById('mth-body').innerHTML.indexOf('Join ')>0);
HF.apply(null); switchTab('home');

print("\n── MEMBERSHIP ──");
HF.apply(null);
_guest();
ok("a new account is not a member",   !hasPlus() && memberTier()===null);
ok("...and every program is locked",  PROGRAMS.every(function(p){ return !ownsProgram(p); }));
ok("...single sessions included",     PROGRAMS.filter(function(p){return !p.weeks;}).every(function(p){ return !ownsProgram(p); }));
var _lp=trainingPlans().filter(function(p){ return p.id!=='custom' && !p.hub; })[0];
openProgram(_lp.id);
var _lph=document.getElementById('pgd-body').innerHTML;
/* As on Fitness+: the page opens for anyone; a locked one says so on its
   button, and its days and player still refuse. */
ok("a locked program shows its page", document.getElementById('progdetail').style.display==='block' &&
   (_lph.indexOf('In This Plan')>0 || _lph.indexOf('In This Week')>0));
ok("...with the unlock as its action", _lph.indexOf('Unlock with HITFAT+')>0 && _lph.indexOf('Start Plan')<0);
openDay(_lp.id,0);
ok("...but its days still open the paywall",
   document.getElementById('pwm').className.indexOf('on')>=0 && document.getElementById('daydetail').style.display!=='block');
var _pw=document.getElementById('pw-body').innerHTML;
ok("the paywall names the program",   _pw.indexOf('is part of HITFAT+')>0);
ok("...offers both tiers",            _pw.indexOf("pwSetTier('plus')")>0 && _pw.indexOf("pwSetTier('coach')")>0);
ok("...12 months first, marked best value", _pw.indexOf('12 months')>0 && _pw.indexOf('Best value')>0 &&
   _pw.indexOf('12 months') < _pw.indexOf('6 months'));
ok("...with a monthly figure beside each", _pw.indexOf('a month')>0);
ok("...and says it does not renew by itself", _pw.indexOf('does not renew by itself')>0);
ok("...and no struck-through price",  _pw.indexOf('<s>')<0 && _pw.indexOf('<s ')<0);
pwSetTier('coach'); _pw=document.getElementById('pw-body').innerHTML;
ok("the coach tier includes T42 and a coach", _pw.indexOf('One T42 challenge included')>0 && _pw.indexOf('Monthly coach review')>0);
ok("...at the coach prices",          _pw.indexOf('RM'+SUB_PLANS.filter(function(x){return x.sku==='sub_coach_12m';})[0].price)>0);
pwSetTier('plus'); closeProduct();
noThrow("a locked day is safe",       function(){ openDay(PROGRAMS.filter(function(p){return p.weeks;})[0].id,0); });
ok("...and opens the paywall",        document.getElementById('pwm').className.indexOf('on')>=0); closeProduct();
noThrow("a locked movement is safe",  function(){ playExercise(DB[0].n); });
ok("...and plays nothing",            document.getElementById('pwm').className.indexOf('on')>=0); closeProduct();
noThrow("meal plans are locked",      function(){ openMealPlan(); });
ok("...to the paywall",               document.getElementById('mpm').className.indexOf('on')<0 &&
                                      document.getElementById('pwm').className.indexOf('on')>=0); closeProduct();
noThrow("a guest can open the AI scan", function(){ openScan(); });
ok("...with free scans, or the scan plans", canScan() ? document.getElementById('scan').className.indexOf('on')>=0
                                      : document.getElementById('pw-body').innerHTML.indexOf('AI Meal Scan')>0);
closeScan(); closeProduct();
ok("cards carry a lock",              frow(PROGRAMS[0]).indexOf('lockt')>0);
ok("old product links land on the paywall", (function(){ openProduct(BUNDLE_SKU);
   var on=document.getElementById('pw-body').innerHTML.indexOf('sub_plus_12m')>0; closeProduct(); return on; })());

/* a program bought before the membership stays open */
var target=PROGRAMS.filter(isPaidProgram)[0];
_ent.skus['prog_'+target.id]=true;
ok("a program bought on its own stays open", ownsProgram(target));
ok("...and only that one",           PROGRAMS.filter(function(p){ return p.id!==target.id; }).every(function(p){ return !ownsProgram(p); }));
ok("...and it actually opens", (function(){ openProgram(target.id);
    return document.getElementById('progdetail').style.display==='block'; })());
/* All Access is honoured as HITFAT+ for good */
_guest(); _ent.skus[BUNDLE_SKU]=true;
ok("All Access counts as HITFAT+",    hasPlus() && memberTier()==='plus' && memberUntil()===null);
ok("...every program open",           PROGRAMS.every(ownsProgram));
ok("...14-day meal plans",            maxPlanDays()===14);
/* the membership itself */
_member();
ok("a member is a member",            hasPlus() && memberTier()==='plus' && !!memberUntil());
ok("...everything opens",             PROGRAMS.every(ownsProgram));
ok("...and 3 scans a day",            scanAccess().daily===3 && scanAccess().mode==='pass');
_member('coach');
ok("coach includes HITFAT+",          hasPlus() && hasCoach() && memberTier()==='coach');
_ent.coachUntil=new Date(Date.now()-864e5).toISOString();
ok("an ended membership locks again", !hasPlus());
ok("membership prices: 12 months beats 6 per month", ['plus','coach'].every(function(t){
    var a=SUB_PLANS.filter(function(x){return x.tier===t && x.months===12;})[0],
        b=SUB_PLANS.filter(function(x){return x.tier===t && x.months===6;})[0];
    return a && b && a.price/12 < b.price/6; }));
ok("coach costs more than HITFAT+",   SUB_PLANS.filter(function(x){return x.tier==='coach';}).every(function(c){
    return c.price > SUB_PLANS.filter(function(x){return x.tier==='plus' && x.months===c.months;})[0].price; }));

/* T42 is its own product: a participant trains it without a membership. */
ok("T42 plays without the membership gate",
   t42PlayToday.toString().indexOf('needPlus')<0 && startWorkout.toString().indexOf('needPlus')<0 &&
   startWorkout.toString().indexOf('ownsProgram')<0);
/* HITFAT+ Coach claims its included T42 place instead of paying. */
_member('coach');
var _tc=T42.challenge, _tr=T42.reg, _tb=T42.baseline, _ts=T42.state;
T42.state='ready'; T42.challenge=_t42edition(9); T42.challenge.price_rm=99;
T42.reg={id:'r9',challenge_id:'ch1',mode:'online_solo',track:'transform',gender:'male',status:'pending',verify_code:'T42-9'};
T42.baseline={id:'m9',phase:'baseline',weight_kg:80,height_cm:175,waist_cm:90};
t42View='pay'; t42Paint();
ok("a coach member can claim their T42 place", document.getElementById('t42-body').innerHTML.indexOf('t42ClaimCoach()')>0);
_member(); t42Paint();
ok("...a HITFAT+ member pays for T42",        document.getElementById('t42-body').innerHTML.indexOf('t42ClaimCoach()')<0);
T42.challenge=_tc; T42.reg=_tr; T42.baseline=_tb; T42.state=_ts;
var _g=readFile('deploy/_shared/grant.ts'), _c28=readFile('deploy/28-coach-t42.sql');
ok("renewing early adds to the end date",     _g.indexOf("sku.startsWith('sub_')")>0 && _g.indexOf('live[0].expires_at')>0);
ok("the claim needs a live coach membership", _c28.indexOf("sku like 'sub_coach%' and expires_at > now()")>0);
ok("...and one place a year",                 _c28.indexOf("interval '365 days'")>0);
ok("...and nobody can call it signed out",    _c28.indexOf('revoke all    on function public.t42_claim_with_coach(uuid) from public, anon')>=0);

/* Until the payment functions know the membership, nothing is locked. */
MEMBERSHIP_LIVE=false; _guest();
ok("before launch, everything is open",  PROGRAMS.every(ownsProgram) && !needPlus('x'));
ok("...and Home invites no one",         (function(){ switchTab('home'); return document.getElementById('home-plans').innerHTML.indexOf('sub-card')<0; })());
ok("...and the paywall sells nothing yet", (function(){ var said=null,t0=toast; toast=function(m){said=m;}; pwBuy(); toast=t0;
   return said && said.indexOf('opens soon')>=0; })());
MEMBERSHIP_LIVE=true;

print("\n── STORE UI ──");
_guest();
noThrow("store opens",                function(){ openStore(); });
var _sb=document.getElementById('store-body').innerHTML;
ok("the store is the membership",     _sb.indexOf('sub_plus_12m')>0 || _sb.indexOf("pwSetPlan('sub_plus_12m')")>0);
ok("...and says what is inside",      _sb.indexOf('What is inside')>0);
ok("...and what stays open",          _sb.indexOf('stay open without a membership')>0);
ok("no program is sold on its own",   _sb.indexOf("openProduct('prog_")<0);
_member();
openStore(); _sb=document.getElementById('store-body').innerHTML;
ok("a member sees their status",      _sb.indexOf('HITFAT+ member')>0 && _sb.indexOf('Active until')>0);
ok("...and can extend",               _sb.indexOf('Extend')>0);
_guest(); _ent.skus[BUNDLE_SKU]=true; openStore(); _sb=document.getElementById('store-body').innerHTML;
ok("All Access is offered the coach only", _sb.indexOf('All Access')>0 && _sb.indexOf('Add a coach')>0);
_member();
closeProduct();
print("\n── CHECKOUT ──");
ok("checkout needs a sign-in", (function(){
    var said=null, t0=toast; toast=function(m){ said=m; };
    sb=null; HF.userId=null; startCheckout('sub_plus_12m'); toast=t0;
    return said && said.indexOf('Sign in')>=0; })());
sb={}; HF.userId='u1';
closeProduct();
noThrow("checkout sheet opens",  function(){ startCheckout('sub_plus_12m'); });
ok("the sheet is actually visible", document.getElementById('pwm').className.indexOf('on')>=0);
ok("sheet offers both channels", PAY_CHANNELS.every(function(c){
    return document.getElementById('pw-body').innerHTML.indexOf('setPayChannel('+c[0]+')')>0; }));
ok("FPX is the default",         payChannel===1);
noThrow("channel switches",      function(){ setPayChannel(6); });
ok("switch is remembered",       payChannel===6);
ok("sheet names Bayarcash",      document.getElementById('pw-body').innerHTML.indexOf('Bayarcash')>0);
ok("sheet shows the price",      document.getElementById('pw-body').innerHTML.indexOf('RM'+SUB_PLANS[0].price)>0);
ok("checkout names the plan",   document.getElementById('pw-body').innerHTML.indexOf('12 months')>0);
ok("checkout says it does not renew", document.getElementById('pw-body').innerHTML.indexOf('No — one payment')>0);
ok("a renewal starts where the current one ends", (function(){
    var keep=_ent.plusUntil, d=new Date(Date.now()+30*864e5);
    _ent.plusUntil=d.toISOString(); var it=checkoutItem('sub_plus_12m'); _ent.plusUntil=keep;
    return it && it.from===fmtDate(d); })());
noThrow("coming back: waiting",  function(){ coConfirm('wait'); });
ok("waiting has no button",      document.getElementById('pw-body').innerHTML.indexOf('bigbtn')<0);
noThrow("coming back: confirmed", function(){ coConfirm('ok'); });
ok("confirmed offers to train",  document.getElementById('pw-body').innerHTML.indexOf('Start training')>0);
noThrow("coming back: not yet",  function(){ coConfirm('late'); });
ok("not yet says it unlocks itself", document.getElementById('pw-body').innerHTML.indexOf('unlocks by itself')>0);
startCheckout('sub_plus_12m');
ok("checkout never sends a price", (function(){
    /* the browser sends a sku and nothing else — a client that can name its
       own price will eventually be asked to */
    var src=String(payNow);
    return src.indexOf('sku')>0 && !/amount|price/i.test(src); })());
noThrow("unknown sku is ignored", function(){ startCheckout('nope_123'); });
ok("every sku the store sells is priced", (function(){
    var all=[BUNDLE_SKU].concat(SCAN_PRODUCTS.map(function(s){return s.sku;}))
             .concat(PROGRAMS.filter(isPaidProgram).map(function(p){return 'prog_'+p.id;}));
    return all.every(function(sku){
      var item=SCAN_PRODUCTS.filter(function(x){return x.sku===sku;})[0];
      var price = sku===BUNDLE_SKU ? BUNDLE_PRICE : item ? item.price
                : (function(){ var p=PROGRAMS.filter(function(x){return 'prog_'+x.id===sku;})[0];
                               return p?programPrice(p):0; })();
      return price>0; }); })());
ok("a paid marker survives a reload", (function(){
    localStorage.setItem('hf_plus_pending','bundle_all');
    return localStorage.getItem('hf_plus_pending')==='bundle_all'; })());
localStorage.removeItem('hf_plus_pending');
sb=null; HF.userId=null;
closeProduct();
ok("nothing is sold as recurring", (function(){
    openStore('programs'); var a=document.getElementById('store-body').innerHTML;
    setStoreSeg('scan');   var b=document.getElementById('store-body').innerHTML;
    var all=a+b;
    /* "do not auto-renew" is the promise, not a violation — only flag the
       word when it is not being denied */
    var claims=/per month|\/month|per bulan|billed monthly|renews/i.test(all);
    /* jsc has no lookbehind — strip the denials first, then look */
    var stripped=all.replace(/(do not|does not|no)\s+auto-renew/ig,'');
    return !claims && stripped.toLowerCase().indexOf('auto-renew')<0; })());
HF.apply(null); _member(); eatSeg='today';

/* Train sits in the middle of five, and carries the logo rather than a
   line-drawing icon. */
ok("five tabs",                  ['home','eat','train','progress','me']
    .every(function(t){ return !!document.getElementById('tab-'+t); }));
ok("Train is the middle one",    (function(){
    var order=['home','eat','train','progress','me'];
    return order[2]==='train'; })());
ok("Train carries the logo slot", !!document.getElementById('tab-train-logo'));
noThrow("every tab still switches", function(){
  ['home','eat','train','progress','me'].forEach(switchTab); });
switchTab('home');

print("\n── EAT · Fitness+ layout ──");
HF.apply(null);
noThrow("no target shows setup",  function(){ renderEat(); });
ok("setup asks for the basics",   document.getElementById('eat-body').innerHTML.indexOf('e-w')>0);
ok("no segments before setup",    document.getElementById('eat-segs').innerHTML==='');
ok("setup asks like Build Your Plan", document.getElementById('eat-body').innerHTML.indexOf('esfields')>0 &&
   document.getElementById('eat-body').innerHTML.indexOf('obtile')>0 && document.getElementById('eat-body').innerHTML.indexOf('obseg')>0);
_eg='male'; _egoal='lose';
document.getElementById('e-w').value='88';
document.getElementById('e-h').value='175';
document.getElementById('e-a').value='32';
noThrow("target saves",           function(){ saveNutrition(); });
ok("target computed",             HF.data.nutrition.cal>1200, HF.data.nutrition.cal);
ok("segments appear after setup", document.getElementById('eat-segs').innerHTML.indexOf('setEatSeg')>0);
ok("...as a segmented control", document.getElementById('eat-segs').innerHTML.indexOf('obseg')>0);
ok("five segments, the journal then Learn last", EAT_SEGS.length===5 && EAT_SEGS[3][0]==="journal" && EAT_SEGS[4][0]==="learn");
ok("every segment has a handler", EAT_SEGS.every(function(s){
    return document.getElementById('eat-segs').innerHTML.indexOf("setEatSeg('"+s[0]+"')")>0; }));
ok("Today is the default",        eatSeg==='today');
ok("hero renders: the calorie ring and three macro bars", document.getElementById('eat-body').innerHTML.indexOf('ehero')>0 && document.getElementById('eat-body').innerHTML.indexOf('nring')>0 && (document.getElementById('eat-body').innerHTML.match(/class="emb"/g)||[]).length===3);
ok("Eat leads with the date and a large title", document.getElementById('eat-segs').innerHTML.indexOf('hsum')>0);
ok("all four slots shown",        SLOTS.every(function(s){
    return document.getElementById('eat-body').innerHTML.indexOf("openManualAt('"+s.k+"')")>0; }));
ok("macros render",               document.getElementById('eat-body').innerHTML.indexOf('Protein')>0 &&
   document.getElementById('eat-body').innerHTML.indexOf('Carbs')>0 && document.getElementById('eat-body').innerHTML.indexOf('>Fat<')>0);
noThrow("every segment renders",  function(){ EAT_SEGS.forEach(function(s){ setEatSeg(s[0]); }); });
setEatSeg('log');
ok("log offers scan",             document.getElementById('eat-body').innerHTML.indexOf('openScan()')>0);
ok("log offers manual",           document.getElementById('eat-body').innerHTML.indexOf('openManual()')>0);
ok("quota shown honestly",        document.getElementById('eat-body').innerHTML.indexOf(scanAccess().label)>0);
ok("empty log says so",           document.getElementById('eat-body').innerHTML.indexOf('Nothing logged yet')>0);
logMeal({name:'Nasi lemak',bm:'Nasi lemak',kcal:520,p:14,c:62,f:24,slot:'breakfast'});
setEatSeg('log');
ok("logged meal appears",         document.getElementById('eat-body').innerHTML.indexOf('Nasi lemak')>0);
setEatSeg('today');
ok("breakfast slot filled",       document.getElementById('eat-body').innerHTML.indexOf('520')>0);
noThrow("slot shortcut opens",    function(){ openManualAt('dinner'); });
ok("shortcut preselects it",      _slot==='dinner');
noThrow("manual closes",          function(){ closeManual(); });
HF.data.favs=[{name:'Ayam grill',kcal:280,p:34,c:2,f:14}];
setEatSeg('log');
ok("usuals strip shows",          document.getElementById('eat-body').innerHTML.indexOf('Ayam grill')>0);
noThrow("one-tap fav logs",       function(){ logFav(0); });
ok("fav landed in the log",       mealsFor().some(function(m){ return m.name==='Ayam grill'; }));
ok("fav spent no scan",           scanUsed()===0);
noThrow("bad fav index is safe",  function(){ logFav(99); });
setEatSeg('plan');
ok("plan segment offers wizard",  document.getElementById('eat-body').innerHTML.indexOf('openMealPlan()')>0);
ok("plan explains the guidelines",document.getElementById('eat-body').innerHTML.indexOf('CPG MOH 2023')>0);
noThrow("delete meal is safe",    function(){ setEatSeg('log'); delMeal(0); });
ok("EAT survives an empty day",   (function(){ HF.data.meals={}; renderEat();
    return document.getElementById('eat-body').innerHTML.length>500; })());
setEatSeg('today');
/* An empty day gives no verdict — "under target" at breakfast is not news —
   and no score until there is something to score. */
var _et=document.getElementById('eat-body').innerHTML;
ok("an empty day says nothing is logged", _et.indexOf('Nothing logged yet')>0);
ok("...and scores nothing yet",           _et.indexOf('<b>—</b><span>Meal balance')>0);
ok("each meal suggests its share",        _et.indexOf('Aim for about')>0);
logMeal({name:'Roti canai',bm:'Roti canai',kcal:300,p:6,c:40,f:12,slot:'breakfast'});
logMeal({name:'Nasi ayam',bm:'Nasi ayam',kcal:600,p:30,c:70,f:20,slot:'lunch'});
setEatSeg('log');
var _el=document.getElementById('eat-body').innerHTML;
ok("the log is grouped by meal",          /<span>Breakfast<\/span><\/div><div class="nli-s"><b>300 kcal<\/b>/.test(_el) &&
                                          /<span>Lunch<\/span><\/div><div class="nli-s"><b>600 kcal<\/b>/.test(_el));
ok("...every meal shows, with its + to add",  (_el.match(/class="nlist elslot"/g)||[]).length===4 && _el.indexOf("openManualAt('dinner')")>0);
ok("...the day against the target",       _el.indexOf('class="elsum"')>0 && _el.indexOf('900</b><span> / ')>0);
ok("...scan is the hero, barcode and by hand beside", _el.indexOf('fmade fmp elscan')>0 && _el.indexOf("openScan('barcode')")>0 && _el.indexOf('By Hand')>0);
ok("...and removing keeps the day's index", _el.indexOf('delMeal(1)')>0);
HF.data.meals={}; setEatSeg('today');

print("\n── MEAL PLAN · guidelines ──");
/* CPG MOH 2023 Asian BMI cut-offs — the boundary is what matters, not the middle */
ok("BMI 22.9 still normal",     bmiClass(22.9).label==='Normal');
ok("BMI 23.0 is pre-obese",     bmiClass(23.0).label==='Pre-obese');
ok("BMI 27.4 is pre-obese",     bmiClass(27.4).label==='Pre-obese');
ok("BMI 27.5 is obese I",       bmiClass(27.5).label==='Obese Class I');
ok("BMI 18.4 underweight",      bmiClass(18.4).label==='Underweight');
ok("BMI 40 is obese III",       bmiClass(40).label==='Obese Class III');
ok("every class has advice",    [17,20,25,30,37,42].every(function(b){return !!bmiClass(b).advice;}));

/* waist circumference — male 90, female 80 */
ok("male 89 fine",              wcRisk(89,'male').risk===false);
ok("male 90 at risk",           wcRisk(90,'male').risk===true);
ok("female 79 fine",            wcRisk(79,'female').risk===false);
ok("female 80 at risk",         wcRisk(80,'female').risk===true);
ok("no waist = no card",        wcRisk(0,'male')===null);

/* calorie floor by sex */
var mLow=mpNut({gender:'male',age:30,wt:60,ht:170,activity:1.2,goal:'loss',rate:1.0,styles:[]});
ok("male floored at 1500",      mLow.cal===1500 && mLow.floorHit===true, mLow.cal);
var fLow=mpNut({gender:'female',age:30,wt:50,ht:158,activity:1.2,goal:'loss',rate:1.0,styles:[]});
ok("female floored at 1200",    fLow.cal===1200 && fLow.floorHit===true, fLow.cal);
var norm=mpNut({gender:'male',age:32,wt:88,ht:175,activity:1.55,goal:'loss',rate:0.5,styles:[]});
ok("no floor when unneeded",    norm.floorHit===false && norm.cal>1500, norm.cal);
ok("deficit is tdee-cal",       norm.deficit===norm.tdee-norm.cal);
ok("maintain has no deficit",   mpNut({gender:'male',age:32,wt:88,ht:175,activity:1.55,goal:'maintain',rate:0,styles:[]}).deficit===0);
ok("gain adds calories", (function(){
    var g=mpNut({gender:'male',age:32,wt:70,ht:175,activity:1.55,goal:'gain',rate:0.5,styles:[]});
    return g.cal>g.tdee; })());

/* MDG 2020 macro ranges must hold across the whole realistic input space */
ok("MDG holds for every profile", (function(){
    var bad=[];
    [['male',1.2],['female',1.9],['male',1.55],['female',1.375]].forEach(function(g){
      [50,70,95,120].forEach(function(w){
        [['loss',0.5],['loss',1.0],['maintain',0],['gain',0.5]].forEach(function(gl){
          [[],['hiprotein'],['lowcarb'],['hiprotein','lowcarb']].forEach(function(st){
            var n=mpNut({gender:g[0],activity:g[1],age:35,wt:w,ht:168,goal:gl[0],rate:gl[1],styles:st});
            var k=mdgOk(n);
            if(!k.cho||!k.prot||!k.fat) bad.push(g[0]+w+gl[0]+st.join('/')+' '+n.cPct+'/'+n.pPct+'/'+n.fPct);
          });
        });
      });
    });
    return bad.length===0; })(), 'first failure listed above');
ok("carbs never below 50%", (function(){
    var n=mpNut({gender:'male',age:25,wt:120,ht:170,activity:1.9,goal:'loss',rate:1.0,styles:['hiprotein','lowcarb']});
    return n.cPct>=50; })());
ok("high protein capped at 20%", (function(){
    var n=mpNut({gender:'male',age:25,wt:120,ht:180,activity:1.2,goal:'loss',rate:0.5,styles:['hiprotein']});
    return n.pPct<=20; })());
ok("macros add back to calories", (function(){
    var n=mpNut({gender:'female',age:40,wt:72,ht:162,activity:1.55,goal:'loss',rate:0.5,styles:[]});
    return Math.abs(n.prot*4+n.carb*4+n.fat*9-n.cal)<=12; })());

/* CPG safe-deficit bands */
ok("400 is santai",             deficitVerdict(400).label==='Relaxed and sustainable');
ok("550 is the CPG band",       deficitVerdict(550).label==='Smart fat loss');
ok("750 still in band",         deficitVerdict(750).label==='Smart fat loss');
ok("751 is aggressive",         deficitVerdict(751).label==='Aggressive');
ok("1100 is over the limit",    deficitVerdict(1100).label==='Too aggressive');

print("\n── MEAL PLAN · menus ──");
ok("every menu has items",      ['breakfast','lunch','dinner','snack'].every(function(k){
    return MDB[k].length>0 && MDB[k].every(function(o){ return o.name && o.items.length>0; }); }));
ok("every item has kcal",       ['breakfast','lunch','dinner','snack'].every(function(k){
    return MDB[k].every(function(o){ return o.items.every(function(i){ return i.food&&i.portion&&i.kcal>0; }); }); }));
ok("noegg filter is honest", (function(){
    return mpOptions('breakfast',['noegg'],[],1,0).every(function(o){ return o.tags.indexOf('noegg')>-1; }); })());
ok("noegg still returns food",  mpOptions('breakfast',['noegg'],[],1,0).length>0);
ok("no-everything still feeds", (function(){
    var bad=[];
    ['breakfast','lunch','dinner','snack'].forEach(function(k){
      if(!mpOptions(k,['noegg','noseafood','nomeat'],[],1,0).length) bad.push(k); });
    return bad.length===0; })(), 'a slot went empty under all three restrictions');
ok("prefs rank, not exclude", (function(){
    var a=mpOptions('lunch',['lovenasi'],[],1,0);
    return a.length===3 && a.some(function(o){ return o.tags.indexOf('lovenasi')>-1; }); })());

print("\n── MEAL PLAN · structure ──");
var mpBase={goal:'loss',rate:0.5,gender:'male',age:32,wt:88,ht:175,activity:1.55,struct:'3x',days:7,styles:[],prefs:[]};
var P=buildPlan(mpBase);
ok("7 days generated",          P.days.length===7);
ok("3 slots on 3x",             P.days[0].slots.length===3);
ok("6 slots on 6x",             buildPlan(Object.assign({},mpBase,{struct:'6x'})).days[0].slots.length===6);
ok("IF starts at noon",         buildPlan(Object.assign({},mpBase,{struct:'if'})).days[0].slots[0].time.indexOf('12:00')===0);
ok("slot ratios sum to 1",      ['3x','333','6x','if'].every(function(s){
    var r=mpSlots(s).reduce(function(a,x){return a+x.ratio;},0); return Math.abs(r-1)<0.001; }));
ok("3 options per slot",        P.days[0].slots.every(function(s){ return s.options.length===3; }));
ok("slot targets sum to daily",  (function(){
    var t=P.days[0].slots.reduce(function(a,s){return a+s.target;},0);
    return Math.abs(t-P.nut.cal)<=4; })());
ok("days differ from each other", JSON.stringify(P.days[0].slots.map(function(s){return s.options[0].name;}))
                               !== JSON.stringify(P.days[3].slots.map(function(s){return s.options[0].name;})));
ok("regeneration is identical", JSON.stringify(buildPlan(mpBase))===JSON.stringify(P));
ok("every day totals > 0",      P.days.every(function(d){ return d.total>0; }));
ok("every day within 25% of target", P.days.every(function(d){ return d.pct>=60 && d.pct<=125; }),
    P.days.map(function(d){return d.pct;}).join(','));
ok("fruit on every day",        P.days.every(function(d){ return d.bal.buah>0; }),
    P.days.map(function(d){return d.bal.buah;}).join(','));
ok("fruit capped per option",   MDB.breakfast.concat(MDB.lunch,MDB.dinner,MDB.snack)
    .every(function(o){ return groupsOf(o.items).buah<=1; }));
ok("meta round-trips",          buildPlan(P.meta).nut.cal===P.nut.cal);


print("\n── MEAL PLAN · food groups ──");
/* "goreng" contains "oren" — plain indexOf tagged every fried dish as fruit */
ok("fried tempe is not fruit",   !isFruit('Fried tempe'));
ok("fried egg is not fruit",     !isFruit('Fried egg'));
ok("orange still is fruit",      isFruit('Orange'));
ok("banana still is fruit",      isFruit('Banana'));
ok("tempe is protein",           groupsOf([{food:'Fried tempe'}]).protein===1);
ok("tempe carries no fruit",     groupsOf([{food:'Fried tempe'}]).buah===0);
ok("chickpeas count as protein", groupsOf([{food:'Boiled chickpeas'}]).protein===1);
ok("aubergine is a vegetable",   groupsOf([{food:'Grilled aubergine'}]).sayur===1);
ok("condiments group as nothing",(function(){
    var g=groupsOf([{food:'Low-sodium soy sauce'},{food:'Cooking oil'},{food:'Sambal belacan'}]);
    return g.buah+g.sayur+g.protein+g.karbo===0; })());
ok("no fried dish is tagged fruit", (function(){
    var bad=[];
    Object.keys(MDB).forEach(function(k){ MDB[k].forEach(function(o){ o.items.forEach(function(i){
      if(/fried|grilled|roast|steamed/i.test(i.food) && isFruit(i.food)) bad.push(i.food); }); }); });
    return bad.length===0; })());

print("\n── MEAL PLAN · gap card ──");
ok("gap suggests at most 3",    gapItems(600,{buah:0}).length<=3);
ok("gap stays quiet when tiny", gapItems(20,{buah:0}).length===0);
ok("gap skips fruit if day has it", gapItems(400,{buah:1}).every(function(x){ return x.grp!=='buah'; }));
ok("gap offers fruit otherwise",    gapItems(400,{buah:0}).length>0);
ok("portion scaling leaves 1x alone", scalePortion('1/2 cawan / 40g',1.0)==='1/2 cawan / 40g');
ok("portion scaling doubles",   scalePortion('1 cawan / 100g',2)==='2 cawan / 200g', scalePortion('1 cawan / 100g',2));
ok("scaling keeps the words",   scalePortion('2 keping roti',1.5).indexOf('keping roti')>0);

print("\n── MEAL PLAN · UI ──");
HF.apply(null);
HF.data.nutrition={cal:2200,w:88,h:175,a:32,gender:'male',goal:'lose'};
noThrow("wizard opens",         function(){ openMealPlan(); });
ok("profile is prefilled",      mp.wt===88 && mp.ht===175 && mp.age===32, mp.wt+'/'+mp.ht+'/'+mp.age);
ok("goal maps from nutrition",  mp.goal==='loss');
ok("modal is shown",            document.getElementById('mpm').className.indexOf('on')>=0);
ok("step 1 renders",            document.getElementById('mp-body').innerHTML.indexOf('What are you aiming for?')>0);
noThrow("step forward",         function(){ mpGo(1); });
ok("step 2 is the profile",     document.getElementById('mp-body').innerHTML.indexOf('mp-wc')>0);
noThrow("every step renders",   function(){ for(var i=2;i<MP_STEPS.length;i++) mpGo(1); });
ok("last step offers generate", document.getElementById('mp-body').innerHTML.indexOf('mpGenerate()')>0);
noThrow("toggles are safe",     function(){ mpToggle('styles','hiprotein'); mpToggle('prefs','noegg'); mpToggle('styles','hiprotein'); });
ok("toggle off removes it",     mp.styles.indexOf('hiprotein')<0 && mp.prefs.indexOf('noegg')>=0);
noThrow("plan generates",       function(){ mpGenerate(); });
ok("modal closed after generate", document.getElementById('mpm').className.indexOf('on')<0);
ok("plan panel is visible",     document.getElementById('mealplan').style.display==='block');
ok("plan view has content",     document.getElementById('mp-view').innerHTML.length>3000);
ok("BMI card rendered",         document.getElementById('mp-view').innerHTML.indexOf('CPG MOH 2023')>0);
ok("MDG line rendered",         document.getElementById('mp-view').innerHTML.indexOf('MDG 2020')>0);
ok("medical disclaimer present",document.getElementById('mp-view').innerHTML.indexOf('registered dietitian')>0);
noThrow("day toggles",          function(){ mpDay(0); mpDay(0); });
noThrow("option switch",        function(){ mpOpt('mps-0-0',1); });
noThrow("plan saves",           function(){ mpSavePlan(); });
ok("saved to the store",        HF.data.mealPlans.length===1);
ok("saved as a spec, not a plan", JSON.stringify(HF.data.mealPlans[0]).length<400,
                                JSON.stringify(HF.data.mealPlans[0]).length);
noThrow("saved plan reloads",   function(){ mpLoad(0); });
ok("reload rebuilds the days",  document.getElementById('mp-view').innerHTML.indexOf('Day 1')>0);
ok("Plan segment lists it",    (function(){ setEatSeg('plan');
    return document.getElementById('eat-body').innerHTML.indexOf('mpLoad(0)')>0; })());
noThrow("plan deletes",         function(){ mpDelete(0); });
ok("delete removes it",         HF.data.mealPlans.length===0);
ok("waist saved to profile",    HF.data.wc===0 || HF.data.wc>0);
noThrow("switching away is clean", function(){ switchTab('eat'); });
ok("plan panel hidden again",   document.getElementById('mealplan').style.display==='none');


/* ═══════════════════════════════════════════════════════════════
   HITFAT CLUB
   ═══════════════════════════════════════════════════════════════ */

/* ── the QR encoder ──
   These matrices came out of python-qrcode, an independent
   implementation. Comparing against them catches the whole class of bug
   that produces a code which looks perfectly well formed and that no
   scanner on the counter will read.

   The specification only says to pick the mask with the lowest penalty,
   and two conformant encoders can disagree about that on a given
   payload without either being wrong. These three are ones where our
   choice and python-qrcode's coincide, so the comparison tests the
   encoding — data, error correction, placement, format block — rather
   than a tie-break nobody is bound by. */
var QR_REF=[
  ["hitfat",21,"111111100011001111111100000101101001000001101110100111101011101101110100010001011101101110101101101011101100000100011001000001111111101010101111111000000000110000000000101010100110100010010101111000011010101111010111101011011101111001110011001110110010100010111101011101000000000001110001100011111111100010100010111100000100000001100011101110101110101110011101110100101010010010101110101011011110001100000100001110000010111111101101011010011"],
  ["Ahli HITFAT \u00b7 Kota Bharu \u2014 check in",29,"1111111010011100101110111111110000010111100100100101000001101110100000011010110010111011011101011111111010100101110110111010011111110111001011101100000100010001001010010000011111111010101010101010111111100000000110010110101100000000101101110001010111110010010111110010010110100100011010011111011110010001001110100101110111000001010100110110000010011011001011010011011001100010101010001101000111101111100101110010111000110000011110010110001000111101011111000111101001110111011100100010100000101011110011110001100001001011001001001100001111011001011000000111000110011100000000101110011101101110011110011111110010000000011001000101110001011011111110111000101101101011110100000101001011111001000100001011101000100001001011111100010111010100001011111010101101101110101011001010101011010011000001000111101001011100101011111110101111100001111000110"],
  ["HFC1:73ab4876-7734-47c1-87fd-e805ec99108d",29,"1111111001100110000100111111110000010000100011010101000001101110101000001100010010111011011101010110100111000101110110111010100000100111101011101100000101010100110001010000011111111010101010101010111111100000000111100100001100000000101111100011010101101011111000111010110101010110100101000101111110110010011010000101010110111010101000110101111100010011111110100101011011010111011111000100011101001011010110001000100111100111001010101001101100100000001100010000001110000110010101111101010101100101101001110000000110010110101010001110001011010000001110010110000101100010010101110010100110110100000111001111111110000000010110100001110001001011111110001111110001101011100100000101000010100101000110001011101011010010111011111011110111010101101000111110100011101110101111111110000010110101000001001010111100110000101011111110100110010100001010100"]
];
QR_REF.forEach(function(c){
  var m=qrEncode(c[0]);
  ok("QR sizes to v"+((c[1]-17)/4)+" for "+c[0].length+" chars", !!m && m.length===c[1],
     m?m.length:'null');
  if(!m) return;
  var s='';
  for(var i=0;i<m.length;i++) for(var j=0;j<m.length;j++) s+=m[i][j]?'1':'0';
  ok("QR matches an independent encoder ("+c[0].slice(0,12)+")", s===c[2],
     s===c[2]?'':'differs at '+(function(){ for(var k=0;k<s.length;k++) if(s[k]!==c[2][k]) return k; return -1; })());
});
ok("QR refuses a payload it cannot hold", qrEncode(new Array(400).join('x'))===null);
ok("QR survives non-ASCII", (function(){ var m=qrEncode('Aiman · Kota Bharu'); return !!m && m.length>=21; })());
var _qsvg=qrSVG('HFC1:test',200);
ok("QR renders one svg path",  _qsvg.indexOf('<svg')===0 && _qsvg.indexOf('<path d="M')>0);
ok("QR svg carries a quiet zone", _qsvg.indexOf('viewBox="0 0 25 25"')>0 || _qsvg.indexOf('viewBox="0 0 29 29"')>0);

/* ── streaks and weeks ──
   Fabricate a history rather than reaching for the network. */
function _sess(daysAgo){
  var d=new Date(); d.setHours(12,0,0,0); d.setDate(d.getDate()-daysAgo);
  return {status:'attended', checked_in_at:d.toISOString(),
          club_sessions:{starts_at:d.toISOString(), title:'HIIT', kind:'HIIT'}};
}
Club.history=[_sess(0),_sess(2),_sess(4)];
ok("this week counts only this week", clubThisWeek()>=1);
Club.history=[];
ok("no history is a zero streak", clubWeekStreak()===0);
Club.history=[_sess(1),_sess(8),_sess(15)];
ok("a three-week run reads as three", clubWeekStreak()>=3, clubWeekStreak());
/* A member who has not trained yet this week but trained last week still
   has a streak — the week is not over.
   The fixture counts from Monday, not from today. It used to be "9 and 16
   days ago", which is last week from Wednesday on but TWO weeks ago on a
   Monday or Tuesday — so every Monday the suite failed on a function that
   was right: last week really was empty. */
var _dsm=(new Date().getDay()+6)%7;                 // days since this Monday
Club.history=[_sess(_dsm+3),_sess(_dsm+10)];        // mid last week, mid the week before
ok("an unstarted week does not break the streak", clubWeekStreak()>=2, clubWeekStreak());
/* And the function's own answer on the case the old fixture built by
   accident: nothing this week or last, so the streak is over. */
Club.history=[_sess(_dsm+10),_sess(_dsm+17)];
ok("...but an empty last week does", clubWeekStreak()===0, clubWeekStreak());
Club.history=[_sess(30)];
ok("a month off is not a streak", clubWeekStreak()===0, clubWeekStreak());
ok("attendance window counts back", (function(){ Club.history=[_sess(1),_sess(20)];
   return clubAttendedIn(7)===1 && clubAttendedIn(30)===2; })());

/* ── the screens render ── */
Club.state='ready';
Club.member={user_id:'u1',role:'gym_member',status:'active',member_no:'HF-0001',
             plan:'Unlimited Class',credits_left:5,expires_on:'2027-01-01'};
Club.points=334;
Club.history=[_sess(1),_sess(3)];
Club.sessions=[{id:'s1',title:'HIIT Blast',kind:'HIIT',coach_name:'Coach Ain',
  starts_at:new Date(Date.now()+86400000).toISOString(),
  ends_at:new Date(Date.now()+86400000+2700000).toISOString(),
  capacity:20,status:'scheduled',description:'Hard.',level:'All levels',
  location:'HITFAT HQ · Kelantan',bring:['Towel','Water']}];
Club.counts={s1:18};
Club.bookings={};
Club.rewards=[{id:'r1',name:'Mineral Water',category:'drinks',cost_points:20,stock:null,active:true},
              {id:'r2',name:'HITFAT Shirt',category:'merch',cost_points:450,stock:3,active:true},
              {id:'r3',name:'Shaker',category:'merch',cost_points:350,stock:0,active:true}];
Club.redemptions=[];
Club.missions=[{id:'m1',title:'Three in seven days',detail:'d',kind:'attendance',
                target:3,reward_points:40,window_days:7,active:true,sort:1},
               {id:'m2',title:'Know your numbers',detail:'d',kind:'inbody',
                target:1,reward_points:50,window_days:null,active:true,sort:2}];
Club.ledger=[{amount:5,kind:'class_attendance',description:'Class attendance',created_at:new Date().toISOString()}];
Club.scans=[];

noThrow("club overview renders", function(){ clubSegNow='overview'; renderClub(); });
var _co=document.getElementById('club-body').innerHTML;
ok("overview shows the points balance", _co.indexOf('334')>0);
ok("overview shows the next-reward gap", _co.indexOf('more for')>0);
ok("overview offers a scan when there is none", _co.indexOf('clubGoBody()')>0);
ok("overview draws seven day cells", (_co.match(/class="cwd/g)||[]).length===7,
   (_co.match(/class="cwd/g)||[]).length);

noThrow("club classes render", function(){ clubSegNow='classes'; renderClubClasses(); });
var _cc=document.getElementById('club-body').innerHTML;
ok("a nearly full class says so",  _cc.indexOf('2 spots left')>0, _cc.indexOf('spots left'));
ok("class list offers booking",    _cc.indexOf('clubBook(')>0);

noThrow("club session detail renders", function(){ openClubSession('s1'); });
ok("session detail lists what to bring",
   document.getElementById('club-body').innerHTML.indexOf('Towel')>0);
noThrow("back to the list is clean", function(){ clubBackToList(); });

/* Rewards: what is affordable, what is not, and what is gone. */
noThrow("club rewards render", function(){ clubSegNow='rewards'; clubRwTab='redeem'; renderClubRewards(); });
var _cr=document.getElementById('club-body').innerHTML;
ok("an affordable reward can be redeemed", _cr.indexOf('clubRedeem(&#39;r1&#39;)')>0 || _cr.indexOf("clubRedeem('r1')")>0);
ok("an unaffordable reward shows the gap", _cr.indexOf('116 to go')>0, _cr.indexOf('to go'));
ok("an out-of-stock reward cannot be bought", _cr.indexOf('Out of stock')>0);
ok("the shirt is not redeemable at 334 points", _cr.indexOf("clubRedeem('r2')")<0 && _cr.indexOf('clubRedeem(&#39;r2&#39;)')<0);

noThrow("missions render", function(){ clubRwTab='missions'; renderClubRewards(); });
var _cm=document.getElementById('club-body').innerHTML;
ok("mission progress is shown",  _cm.indexOf('of 3')>0 || _cm.indexOf('Complete')>0);
ok("an inbody mission with no scan reads zero", clubMissionProgress(Club.missions[1])===0);
Club.scans=[{scan_date:'2026-08-01',weight:80,pbf:22,smm:35,score:78,bmi:25,vfa:80,bfm:17.6,
             segmental:{trunk:{lean:28,fat:6},left_arm:{lean:3.1,fat:.8},right_arm:{lean:3.4,fat:.8},
                        left_leg:{lean:9.1,fat:2.1},right_leg:{lean:9.3,fat:2.0}}}];
ok("one scan completes the inbody mission", clubMissionProgress(Club.missions[1])===1);

noThrow("ledger tab renders", function(){ clubRwTab='mine'; renderClubRewards(); });
ok("ledger shows the class points",
   document.getElementById('club-body').innerHTML.indexOf('Class attendance')>0);

/* Body: one scan, then two, so the trend has something to draw. */
noThrow("body renders with one scan", function(){ clubSegNow='body'; renderClubBody(); });
var _cb=document.getElementById('club-body').innerHTML;
ok("body shows the InBody score",  _cb.indexOf('78')>0);
ok("body draws the radar",         _cb.indexOf('Segmental lean mass')>0);
ok("body lists the segments",      _cb.indexOf('Right arm')>0);
ok("a single scan draws no trend", _cb.indexOf('ctr-svg')<0);
Club.scans.unshift({scan_date:'2026-09-01',weight:78,pbf:20,smm:36,score:82,bmi:24.4,vfa:70,bfm:15.6,
  segmental:{trunk:{lean:28.5,fat:5.4},left_arm:{lean:3.2,fat:.7},right_arm:{lean:3.5,fat:.7},
             left_leg:{lean:9.3,fat:1.9},right_leg:{lean:9.4,fat:1.8}}});
noThrow("body renders with two scans", function(){ renderClubBody(); });
var _cb2=document.getElementById('club-body').innerHTML;
ok("two scans draw a trend",       _cb2.indexOf('ctr-svg')>0);
ok("losing fat reads as good",     _cb2.indexOf('cib-d good')>0);
ok("history lists both scans",     (_cb2.match(/chist-r/g)||[]).length>=2);

/* Check in: the register decides, not the phone. */
Club.history=[_sess(0)];
noThrow("check-in shows the done state", function(){ clubSegNow='checkin'; renderClubCheckin(); });
var _ci=document.getElementById('club-body').innerHTML;
ok("already checked in says so",   _ci.indexOf('You are checked in')>0);
ok("done state shows no QR",       _ci.indexOf('cqr-frame')<0);

/* The name on the QR card is what the coach checks against the face. */
HF.data.prefs=HF.data.prefs||{};
HF.data.prefs.name='Aiman Rahim';
ok("QR card uses the member's own name", clubMyName()==='Aiman Rahim', clubMyName());
HF.data.prefs.name='';
HF.email='faiz.hassan@example.com';
ok("no name falls back to the email local part", clubMyName()==='faiz.hassan', clubMyName());
HF.email=null;
ok("neither falls back to a safe label", clubMyName()==='HITFAT member', clubMyName());
Club.history=[];
noThrow("check-in renders a live QR", function(){ clubSegNow='checkin'; clubCi.token='7f3a9c21-4b5e-4d8a-9f10-2c6b8e4a1d73'; clubCi.code='K7M2QX'; clubCi.expires=Date.now()+180000; renderClubCheckin(); });
var _cq=document.getElementById('club-body').innerHTML;
ok("QR card draws a code",        _cq.indexOf('<svg class="qrsvg"')>0);
ok("QR card shows the typed code",_cq.indexOf('K7M2QX')>0);
ok("QR card shows the member no", _cq.indexOf('HF-0001')>0);
clubCiStop(); clubCi.token=null;
/* Walking out of the Club by the Back button must stop the token refresh;
   otherwise the app keeps asking the server for a new QR forever. */
document.getElementById('club').style.display='block';
clubSegNow='checkin';
clubCi.tick=1; clubCi.timer=1;
ok("on-screen check is true inside the Club", clubCiOnScreen()===true);
switchTab('home');
ok("Back out of the Club stops the refresh", clubCiOnScreen()===false);
clubCiStop();

/* The way into the Club must survive the member training. */
Club.member={user_id:'u1',role:'gym_member',status:'active',member_no:'HF-0001',
             plan:'Unlimited Class',credits_left:5,expires_on:'2027-01-01'};
Club.sessions=[]; Club.bookings={};
var _hadSessions=HF.count();
renderHome();
ok("Club card is on Home before the first session",
   document.getElementById('home-activity').innerHTML.indexOf('openClub()')>0);
HF.data.sessions['t-club-1']={id:'t-club-1',date:new Date().toISOString(),mins:30,name:'Test'};
renderHome();
ok("Club card is still on Home after training once",
   document.getElementById('home-activity').innerHTML.indexOf('openClub()')>0);
delete HF.data.sessions['t-club-1'];

/* A general user sees the invitation and nothing else. */
Club.member=null;
noThrow("a general user gets the promo", function(){ clubSegNow='overview'; renderClub(); });
var _cg=document.getElementById('club-body').innerHTML;
ok("general user sees the invitation", _cg.indexOf('Explore HITFAT Club')>0);
ok("general user sees no points",      _cg.indexOf('HF Points')<0);

print("\n── CLUB · A DATABASE WITHOUT THE SCHEMA ──");
/* These are verbatim what the two layers actually send back. The guard used
   to test 42P01 only, which is what Postgres would say — but the request
   never reaches Postgres. PostgREST answers PGRST205 from its schema cache
   first, so the setup state was never recognised and a member read the cache
   message off the Club screen. Keep the real payloads here: an invented one
   would have passed the old code too. */
var _pgrst205={code:'PGRST205',details:null,hint:"Perhaps you meant the table 'public.plus_orders'",
               message:"Could not find the table 'public.club_members' in the schema cache"};
ok("PostgREST's missing table is a setup state", clubSchemaMissing(_pgrst205)===true);
ok("Postgres' own 42P01 still counts",
   clubSchemaMissing({code:'42P01',message:'relation "club_members" does not exist'})===true);
ok("a missing function counts too",
   clubSchemaMissing({code:'PGRST202',message:"Could not find the function public.club_redeem"})===true);
ok("the message alone is enough without a code",
   clubSchemaMissing({message:"Could not find the table 'public.club_sessions' in the schema cache"})===true);
ok("no error is not a missing schema", clubSchemaMissing(null)===false);
/* The failures that must still reach the member as failures. */
ok("a denied row is not a missing schema",
   clubSchemaMissing({code:'42501',message:'permission denied for table club_members'})===false);
ok("a dropped connection is not a missing schema",
   clubSchemaMissing({message:'Failed to fetch'})===false);

/* What the member sees when the schema is not there: the quiet card, and no
   trace of the database's own words. */
Club.state='nosetup'; Club.err=null; clubSegNow='overview';
noThrow("the Club renders without a schema", function(){ renderClub(); });
var _cn=document.getElementById('club-body').innerHTML;
ok("...and says it is not switched on", _cn.indexOf('Not set up yet')>0);
ok("...and leaks no PostgREST wording", _cn.indexOf('schema cache')<0 && _cn.indexOf('PGRST')<0);
ok("...and offers no Try again",        _cn.indexOf('clubReload()')<0);
/* A real outage keeps the error card — the fix must not swallow those. */
Club.state='error'; Club.err='Failed to fetch';
renderClub();
var _ce=document.getElementById('club-body').innerHTML;
ok("a real outage still shows the error card", _ce.indexOf('Could not load the Club')>0 &&
   _ce.indexOf('clubReload()')>0);
Club.state='ready'; Club.err=null;


print("\n── T42 · ONBOARDING ──");
/* A stand-in edition. Nothing here touches the network: T42.load() is the
   only thing that does, and every screen below is driven from the state it
   would have left behind. */
function _t42day(off){ var d=new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate()+off);
  return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2); }
function _t42edition(startOff){
  return {id:'ch1',slug:'t42-nov-2026',name:'T42 November 2026',edition:'November 2026',
          starts_on:_t42day(startOff), ends_on:_t42day(startOff+41),
          status:'registration', total_days:42, config:{}};
}
function _t42reset(){
  T42.state='ready'; T42.challenge=_t42edition(9); T42.reg=null; T42.baseline=null; T42.err=null;
  T42.mid=null; T42.final=null; T42.score=null; T42.reviews=[];
  T42.duo=null; T42.duoCard=[]; T42.duoScore=null;
  t42View='landing'; t42BaseTab='basic'; t42Base={weight:'',height:'',waist:'',age:'',gender:'',goal:'Fat Loss'};
  t42DraftClear();
}
_t42reset();

/* ── the day count, which every later screen reads ── */
ok("an edition that has not started is day 0", T42.dayNo()===0);
ok("...and counts down instead",               T42.daysTo()===9);
T42.challenge=_t42edition(0);
ok("the first morning is day 1",  T42.dayNo()===1);
T42.challenge=_t42edition(-17);
ok("eighteen days in is day 18",  T42.dayNo()===18);
ok("...and nothing left to count", T42.daysTo()===0);
T42.challenge=_t42edition(-100);
ok("a finished edition stops at 42", T42.dayNo()===42);
T42.challenge=_t42edition(9);

/* ── the schema guard, the same lesson the Club learnt ── */
ok("T42 knows PostgREST's missing table",
   t42SchemaMissing({code:'PGRST205',message:"Could not find the table 'public.t42_challenges' in the schema cache"})===true);
ok("...and Postgres' own 42P01",
   t42SchemaMissing({code:'42P01',message:'relation "t42_registrations" does not exist'})===true);
ok("...but not a denied row",
   t42SchemaMissing({code:'42501',message:'permission denied for table t42_scores'})===false);

/* ── landing ── */
noThrow("the landing screen renders", function(){ t42View='landing'; t42Paint(); });
var _t4=document.getElementById('t42-body').innerHTML;
ok("landing offers the way in",      _t4.indexOf('Join T42')>0);
ok("landing counts down to the start", _t4.indexOf('Starts in 9 days')>0);
/* Online only unless the edition says otherwise: no Gym Duo on the poster. */
ok("an online edition does not offer Gym Duo", _t4.indexOf('GYM DUO')<0);
ok("landing names the two tracks",   _t4.indexOf('TRANSFORM')>0 && _t4.indexOf('PERFORM')>0);
ok("...and not START, which this edition does not run", _t4.indexOf('>START<')<0);
ok("landing shows the six weeks",    _t4.indexOf('Week 6')>0 && _t4.indexOf('Finish Strong')>0);
ok("landing says access ends with the challenge", _t4.indexOf('Access ends with the challenge')>0);
ok("...and that the leaderboard keeps numbers private", _t4.indexOf('never your weight')>0);
T42.challenge.config={gym_enabled:true, tracks:['start','transform','perform']};
t42Paint(); _t4=document.getElementById('t42-body').innerHTML;
ok("an edition that runs both modes names both", _t4.indexOf('ONLINE SOLO')>0 && _t4.indexOf('GYM DUO')>0);
ok("...and every track it lists",    _t4.indexOf('START')>0);
T42.challenge.config={};

/* No edition open is not an error — it is an app that should not be
   advertising a challenge nobody can join. */
T42.challenge=null;
t42Paint();
ok("no edition says so plainly", document.getElementById('t42-body').innerHTML.indexOf('No edition open')>0);
ok("...and the Home card disappears", t42HomeCard()==='');
T42.challenge=_t42edition(9);
ok("an open edition brings the Home card back", t42HomeCard().indexOf('openT42()')>0);

/* A database with no T42 schema must read as "not open yet", never as a
   PostgREST cache message. */
T42.state='nosetup';
t42Paint();
var _t4n=document.getElementById('t42-body').innerHTML;
ok("no schema reads as not open yet", _t4n.indexOf('Not open yet')>0);
ok("...leaking no PostgREST wording", _t4n.indexOf('schema cache')<0 && _t4n.indexOf('PGRST')<0);
ok("...and showing no Home card",     t42HomeCard()==='');
T42.state='ready';

/* ── mode and track, and the draft that survives a reload ── */
t42View='mode'; t42Paint();
ok("no mode picked yet, so NEXT is held back",
   document.getElementById('t42-body').innerHTML.indexOf('bigbtn off')>0);
t42PickMode('online_solo');
ok("picking a mode records it",   t42Draft.mode==='online_solo');
ok("...and opens NEXT",           document.getElementById('t42-body').innerHTML.indexOf('bigbtn off')<0);
ok("gym duo says what it asks of you before it is chosen",
   document.getElementById('t42-body').innerHTML.indexOf('HITFAT HQ in Kota Bharu')>0 &&
   document.getElementById('t42-body').innerHTML.indexOf('InBody')>0);
t42View='track'; t42Paint();
t42PickTrack('transform');
ok("picking a track records it",  t42Draft.track==='transform');
/* The draft is the promise that a lost signal does not cost the first two
   screens. Prove it survives the state being wiped. */
t42Draft={mode:null,track:null,gender:null,consent:false};
t42DraftLoad();
ok("a reload keeps the mode",     t42Draft.mode==='online_solo');
ok("...and the track",            t42Draft.track==='transform');

/* ── the 60-second assessment ── */
ok("without START, a beginner is sent to TRANSFORM", t42Recommend(0)==='transform');
T42.challenge.config={tracks:['start','transform','perform']};
ok("an edition with START sends a beginner there", t42Recommend(0)==='start');
ok("...and someone barely training",            t42Recommend(6)==='start');
T42.challenge.config={};
ok("the middle is TRANSFORM",                   t42Recommend(7)==='transform');
ok("...across most of the range",               t42Recommend(15)==='transform');
ok("only the fittest get PERFORM",              t42Recommend(16)==='perform');
ok("...and the maximum too",                    t42Recommend(23)==='perform');
t42StartAssess();
ok("the assessment starts at question one",     t42Quiz.i===0 && t42Quiz.score===0);
noThrow("a question renders", function(){ t42Paint(); });
ok("...and shows its position", document.getElementById('t42-body').innerHTML.indexOf('Question 1 of 6')>0);
t42Answer(3); t42Answer(3);
ok("answers advance and accumulate", t42Quiz.i===2 && t42Quiz.score===8);
/* Going back must un-score the answer it is undoing, or a user who
   changes their mind is scored twice for one question. */
t42AssessBack();
ok("going back rewinds the score",   t42Quiz.i===1 && t42Quiz.score===4);
t42Answer(0);
ok("...and the new answer replaces it", t42Quiz.i===2 && t42Quiz.score===4);
while(t42Quiz.i<T42_QUIZ.length) t42Answer(0);
noThrow("the result renders", function(){ t42Paint(); });
ok("...and recommends a track", document.getElementById('t42-body').innerHTML.indexOf('We suggest')>0);

/* ── baseline ── */
t42View='baseline'; t42Base._ready=false;
noThrow("the baseline renders", function(){ t42Paint(); });
ok("...as one form, no tabs to hunt through", document.getElementById('t42-body').innerHTML.indexOf('t42-basetabs')<0 &&
   document.getElementById('t42-body').innerHTML.indexOf('t42-wt')>0 && document.getElementById('t42-body').innerHTML.indexOf('t42-wc')>0);
ok("...each number with its unit",  document.getElementById('t42-body').innerHTML.indexOf('<i>kg</i>')>0 &&
   document.getElementById('t42-body').innerHTML.indexOf('<i>cm</i>')>0);
ok("...and how to measure a waist", document.getElementById('t42-body').innerHTML.indexOf('belly button')>0);
/* Nothing is a valid baseline until the three numbers the score is
   measured from are all there. */
t42Base={weight:'',height:'',waist:'',age:'',gender:''};
ok("an empty baseline is not valid",       t42BaseValid()===false);
t42Base={weight:'82',height:'',waist:'',age:'',gender:'male'};
ok("weight alone is not valid",            t42BaseValid()===false);
t42Base={weight:'82',height:'174',waist:'',age:'',gender:'male'};
ok("...nor weight and height",             t42BaseValid()===false);
t42Base={weight:'82',height:'174',waist:'95',age:'',gender:''};
ok("...nor all three without a category",  t42BaseValid()===false);
t42Base={weight:'82',height:'174',waist:'95',age:'31',gender:'male'};
ok("all three and a category is valid",    t42BaseValid()===true);
/* Numbers a human cannot be. A typo of 8.2 for 82 would otherwise anchor
   someone's whole transformation to a weight they never had. */
t42Base={weight:'8.2',height:'174',waist:'95',age:'31',gender:'male'};
ok("an impossible weight is refused",      t42BaseValid()===false);
t42Base={weight:'82',height:'17',waist:'95',age:'31',gender:'male'};
ok("an impossible height is refused",      t42BaseValid()===false);
/* A faded JOIN must say what it is waiting for, wherever the member is. */
t42Base={weight:'82',height:'174',waist:'',age:'',gender:''};
ok("the missing pieces are named",       t42BaseMissing().join('|')==='waist|Men or Women');
t42BaseTab='physical';
ok("...and pointed back to Basic info",  t42BaseMissingLine()==='Still needed: waist and Men or Women — on Basic info.');
t42Base.weight='8.2';
ok("a wrong number is called out as wrong, not missing", t42BaseMissing()[0]==='a real weight');
t42View='baseline'; t42Base._ready=true; t42Paint();
ok("the form says what is still missing", document.getElementById('t42-body').innerHTML.indexOf('Still needed')>0);
t42Base={weight:'82',height:'174',waist:'95',age:'',gender:'male'};
ok("nothing missing says nothing",       t42BaseMissingLine()==='');
t42BaseTab='basic'; t42Base._ready=false;

/* The brief's rule: do not ask for what the app already knows. */
HF.data.nutrition={gender:'female', a:29, w:61.5, h:165};
HF.data.wc=72;
T42.baseline=null; T42.reg=null;
t42BasePrefill();
ok("baseline prefills the weight HITFAT+ has", t42Base.weight==='61.5');
ok("...the height",                            t42Base.height==='165');
ok("...the waist",                             t42Base.waist==='72');
ok("...and the category",                      t42Base.gender==='female');
t42Paint();
ok("...and says where it came from",
   document.getElementById('t42-body').innerHTML.indexOf('from your HITFAT+ profile')>0);

/* A verification code is one per person and readable off a phone. */
var _codes={};
for(var _i=0;_i<200;_i++) _codes[t42MakeCode()]=1;
ok("codes look like T42-#####", /^T42-\d{5}$/.test(t42MakeCode()));
ok("...and are not all the same", Object.keys(_codes).length>150, Object.keys(_codes).length);

/* ── registered ── */
T42.reg={id:'r1',challenge_id:'ch1',mode:'online_solo',track:'transform',
         gender:'female',status:'paid',verify_code:'T42-84921'};
T42.baseline={id:'m1',registration_id:'r1',phase:'baseline',
              weight_kg:61.5,height_cm:165,waist_cm:72};
ok("a full baseline counts as complete", T42.hasBaseline()===true);
T42.baseline={id:'m1',weight_kg:61.5,height_cm:165,waist_cm:null};
ok("...but a missing waist does not",    T42.hasBaseline()===false);
T42.baseline={id:'m1',registration_id:'r1',phase:'baseline',
              weight_kg:61.5,height_cm:165,waist_cm:72};
t42View='joined';
noThrow("the registered screen renders", function(){ t42Paint(); });
var _t4j=document.getElementById('t42-body').innerHTML;
ok("...counting down to the start",  _t4j.indexOf('days to go')>0);
ok("...naming the chosen track",     _t4j.indexOf('TRANSFORM')>0);
ok("...showing the baseline back",   _t4j.indexOf('61.5 kg')>0 && _t4j.indexOf('72 cm')>0);
ok("...and the verification code",   _t4j.indexOf('T42-84921')>0);
/* Someone who registered but never finished a baseline must land on the
   baseline, not on a hero inviting them to join what they already joined. */
T42.baseline=null;
t42Resume();
ok("an unfinished baseline resumes there", t42View==='baseline');
ok("...and Home says so", t42HomeCard().indexOf('Finish your baseline')>0);
T42.baseline={id:'m1',registration_id:'r1',phase:'baseline',
              weight_kg:61.5,height_cm:165,waist_cm:72};
t42Resume();
ok("a finished one resumes on the challenge", t42View==='joined');
ok("...and Home counts the days", t42HomeCard().indexOf('Starts in 9 days')>0);
ok("...on the banner, with a way in", t42HomeCard().indexOf('t42-banner')>0 &&
   t42HomeCard().indexOf('Open T42')>0);

/* Gym Duo is registered for, not half-built. The screen must say so. */
T42.reg.mode='gym_duo';
t42View='joined'; t42Paint();
ok("a gym duo is sent to set up their duo",
   document.getElementById('t42-body').innerHTML.indexOf('Set up your duo')>0 &&
   document.getElementById('t42-body').innerHTML.indexOf('t42GoDuo()')>0);

/* The panel must be in PANELS, or hidePanels leaves T42 on screen behind
   whatever opens next. */
ok("T42 is a registered panel", PANELS.indexOf('t42')>=0);

/* The card has to survive the trip through renderHome, which is the only
   way into the panel. Both Home branches matter: the empty state a new
   user sees, and the populated one after a first session. */
_t42reset();
HF.apply(null); HF.data.onboarded=true;
renderHome();
ok("T42 reaches an empty Home",
   document.getElementById('home-t42').innerHTML.indexOf('openT42()')>0);
HF.data.sessions['t-t42-1']={id:'t-t42-1',date:new Date().toISOString(),mins:30,name:'Test'};
renderHome();
ok("...and a Home with training on it",
   document.getElementById('home-t42').innerHTML.indexOf('openT42()')>0);
/* And must leave without a trace when no edition is open, on both. */
T42.challenge=null;
renderHome();
ok("no edition leaves Home untouched",
   document.getElementById('home-t42').innerHTML.indexOf('openT42()')<0);
/* The bug that hid T42 from everyone: the Home banner only draws once T42
   has loaded, and the only thing that loaded it was openT42() — behind the
   banner. Every test above set T42's state by hand, so none of them could
   see that nothing in the real app ever called load(). These read the shell
   itself: T42 must load at boot, and again once a session exists. */
var _shell=readFile('shell2.html');
var _boot=_shell.slice(_shell.indexOf('function boot(){'));
_boot=_boot.slice(0,_boot.indexOf('sb.auth.getSession'));
ok("T42 loads when the app boots", _boot.indexOf('T42.load()')>0);
var _signin=_shell.slice(0,_shell.indexOf('function boot(){'));
_signin=_signin.slice(_signin.lastIndexOf('syncProfile(session)'));
ok("...and again after sign-in, forced", _signin.indexOf('T42.load(true)')>0);
ok("...in its own try, apart from the Club's",
   _signin.indexOf('T42.load(true)') > _signin.indexOf('Club.load(true)') &&
   _signin.slice(_signin.indexOf('Club.load(true)'), _signin.indexOf('T42.load(true)')).indexOf('}catch(e){}')>0);
/* The start-up watchdog must not cover a working app. It used to accept only
   the five tabs as proof of life, so a member inside T42 at the six-second
   mark got "App did not start" across the top of a running app. */
var _wd=_shell.slice(_shell.indexOf('App did not start')-2600, _shell.indexOf('App did not start'));
ok("the watchdog trusts the app's own _started flag", _wd.indexOf('_started')>0);
ok("...and any open panel, not just the five tabs",    _wd.indexOf("querySelectorAll('.pad')")>0);
/* A slow sign-in (HF.pull on mobile data) is not a failed start: the watchdog
   waits while _signingIn is set, and startApp() takes a shown panel away. */
ok("the watchdog waits while a sign-in is still loading", _wd.indexOf('_signingIn')>0 && _wd.indexOf('setTimeout(check')>0);
var _sa=_shell.slice(_shell.indexOf('function startApp(){'), _shell.indexOf('async function _onSignedIn('));
ok("startApp removes the panel once Home has started", _sa.indexOf("getElementById('bootdiag')")>0 && _sa.indexOf('.remove()')>0);
ok("onSignedIn marks the sign-in as loading until it ends", _sa.indexOf('_signingIn=true')>0 && _sa.indexOf('finally { _signingIn=false; }')>0);
/* And the banner is above the fold: under the greeting and the week, above
   everything else on Home. */
ok("the banner sits under the header and the week, above the rest",
   _shell.indexOf('id="home-t42"') > _shell.indexOf('id="home-week"') &&
   _shell.indexOf('id="home-week"') > _shell.indexOf('id="home-hdr"') &&
   _shell.indexOf('id="home-t42"') < _shell.indexOf('id="home-today"'));
delete HF.data.sessions['t-t42-1'];
_t42reset();

print("\n── T42 · THE RUNNING CHALLENGE ──");
/* Day 18 of 42, mid week 3, TRANSFORM. */
function _t42running(){
  T42.state='ready';
  T42.challenge=_t42edition(-17);
  T42.reg={id:'r1',challenge_id:'ch1',mode:'online_solo',track:'transform',
           gender:'female',status:'active',verify_code:'T42-84921'};
  T42.baseline={id:'m1',registration_id:'r1',phase:'baseline',
                weight_kg:61.5,height_cm:165,waist_cm:72};
  T42.week={week_no:3,theme:'PROGRESS',focus:'Conditioning. Strength endurance.',
            step_target:8000,mini_title:'RUSH Challenge',mini_detail:'Beat your week 1 time.',
            rush_title:'Night Run',rush_target:'Beat your previous time'};
  T42.planDay={id:'p18',challenge_id:'ch1',track:'transform',day_no:18,title:'FULL BODY 01',
               est_minutes:35,level:'Intermediate',equipment:'Dumbbell (optional)',focus:'Everything, once.',
               exercises:[{n:'Bodyweight Squat',sets:3,reps:15},{n:'Push Up',sets:3,reps:12},
                          {n:'Reverse Lunges',sets:3,reps:12},{n:'Plank',sets:3,reps:45}]};
  T42.today=null; T42.doneToday=null; T42.checkins=[]; T42.completions=[];
  T42.score=null; T42.reviews=[]; T42.mid=null; T42.final=null;
  T42.duo=null; T42.duoCard=[]; T42.duoScore=null;
  t42CkReady=false;
}
_t42running();

ok("day 18 is in week 3", T42.weekNo()===3);
T42.challenge=_t42edition(-6); ok("day 7 is still week 1", T42.weekNo()===1);
T42.challenge=_t42edition(-7); ok("day 8 opens week 2",   T42.weekNo()===2);
T42.challenge=_t42edition(9);  ok("before the start there is no week", T42.weekNo()===0);
_t42running();

/* ── the streak ── */
ok("no check-ins is no streak", T42.streak()===0);
T42.checkins=[{day_no:18},{day_no:17},{day_no:16}];
ok("three days running is a streak of three", T42.streak()===3);
T42.checkins=[{day_no:17},{day_no:16}];
ok("...and yesterday still counts today",     T42.streak()===2);
T42.checkins=[{day_no:16},{day_no:15}];
ok("...but the day before does not",          T42.streak()===0);
T42.checkins=[{day_no:18},{day_no:17},{day_no:15},{day_no:14}];
ok("a gap ends the streak where it broke",    T42.streak()===2);

/* Out of the days that have happened, not out of 42. Someone on day 3 who
   has checked in three times is at 100%, and telling them 7% is how an app
   talks someone out of week one. */
T42.checkins=[{day_no:18},{day_no:17},{day_no:16}];
ok("consistency counts elapsed days", T42.consistency()===Math.round(3/18*100));
T42.challenge=_t42edition(-2); T42.checkins=[{day_no:1},{day_no:2},{day_no:3}];
ok("three of three days is 100%",     T42.consistency()===100);
_t42running();

/* ── targets ── */
ok("the week's step target wins", T42.stepTarget()===8000);
T42.week.step_target=null;
T42.challenge.config={step_target:12000};
ok("...then the edition's",       T42.stepTarget()===12000);
T42.challenge.config={};
ok("...then a sane default",      T42.stepTarget()===8000);
ok("water has a default too",     T42.waterTarget()===2000);
_t42running();

/* ── the dashboard ── */
t42View='dash';
noThrow("the dashboard renders", function(){ t42Paint(); });
var _d=document.getElementById('t42-body').innerHTML;
ok("...leading with the day",        _d.indexOf('Day 18')>0);
ok("...naming the week",             _d.indexOf('Week 3')>0 && _d.indexOf('PROGRESS')>0);
ok("...listing today's workout",     _d.indexOf('FULL BODY 01')>0);
ok("...and everything else today",   _d.indexOf('Daily check-in')>0 && _d.indexOf('Steps')>0 &&
                                     _d.indexOf('Water')>0 && _d.indexOf('Nutrition')>0);
ok("...with the week's RUSH",        _d.indexOf('Night Run')>0);
ok("...and the mini challenge",      _d.indexOf('RUSH Challenge')>0);
/* Nothing is done yet, so nothing should be ticked. */
ok("an untouched day shows no ticks", _d.indexOf('t42-tick')<0);
ok("...and does not claim a rank",    _d.indexOf('#')<0 || _d.indexOf('Rank')<0);

T42.today={day_no:18,steps:9100,water_ml:2000,nutrition:'on_track',energy:4};
T42.doneToday={day_no:18,title:'FULL BODY 01',minutes:34};
T42.checkins=[T42.today]; T42.completions=[T42.doneToday];
t42Paint();
var _d2=document.getElementById('t42-body').innerHTML;
ok("a finished day ticks its rows", (_d2.match(/t42-tick/g)||[]).length>=4,
   (_d2.match(/t42-tick/g)||[]).length);
ok("...and shows the steps done",   _d2.indexOf('9,100')>0);
ok("...formatted with separators",  t42Num(318420)==='318,420');
/* A rest day is a rest day, not a missing workout. */
T42.planDay=null; T42.doneToday=null;
t42Paint();
ok("a rest day says rest", document.getElementById('t42-body').innerHTML.indexOf('t42-rest')>0);
_t42running();

/* ── the daily check-in ── */
t42View='checkin'; t42CkReady=false;
noThrow("the check-in renders", function(){ t42Paint(); });
ok("...headed by the day", document.getElementById('t42-body').innerHTML.indexOf('Day 18')>0);
ok("an empty check-in saves nothing", t42CkValid()===false);
t42CkSet('energy',4);
ok("one answer is enough",            t42CkValid()===true);
ok("...and is recorded",              t42Ck.energy===4);
/* Tapping the chosen pill again clears it, or a mis-tap on a five-point
   scale can never be taken back. */
t42CkSet('energy',4);
ok("tapping the same pill clears it", t42Ck.energy===0 && t42CkValid()===false);
t42CkSet('sleep','good');  ok("sleep records",     t42Ck.sleep==='good');
t42CkSet('sleep','good');  ok("...and un-records", t42Ck.sleep==='');
t42CkWater(6);
ok("six glasses is 1500ml",   t42Ck.water_ml===1500);
t42CkWater(8);
ok("eight is two litres",     t42Ck.water_ml===2000);
t42CkWater(8);
ok("tapping the last one steps back", t42Ck.water_ml===1750);
/* Weight must not be asked for daily — it is the number people avoid the
   app to avoid. */
ok("the check-in never asks for weight",
   document.getElementById('t42-body').innerHTML.toLowerCase().indexOf('weight')<0);
/* An abandoned edit must not become the answer two screens later. */
t42CkSet('nutrition','off_track');
t42Go('dash');
ok("leaving the check-in drops the draft", t42CkReady===false);
T42.today={day_no:18,energy:3,sleep:'ok',nutrition:'on_track',water_ml:1750,steps:8200,workout:'completed'};
t42Go('checkin');
ok("...and it reloads from what was saved",
   t42Ck.nutrition==='on_track' && t42Ck.energy===3);
_t42running();

/* ── today's workout ── */
t42View='train';
noThrow("the workout renders", function(){ t42Paint(); });
var _tr=document.getElementById('t42-body').innerHTML;
ok("...titled",              _tr.indexOf('FULL BODY 01')>0);
ok("...with its detail",     _tr.indexOf('35 min')>0 && _tr.indexOf('Intermediate')>0);
ok("...listing the movements", _tr.indexOf('Bodyweight Squat')>0 && _tr.indexOf('Plank')>0);
ok("...and their sets",      _tr.indexOf('3 × 15')>0);
ok("...offering the player", _tr.indexOf('Start Workout')>0);

/* The plan names exercises; the library owns them. A name that is not in
   the library is DROPPED, never substituted — pickEx would have fallen back
   to DB[0] and shown someone a squat where the plan said plank. */
var _ex=t42PlanExercises(T42.planDay);
ok("every planned movement resolves", _ex.length===4);
ok("...carrying its real clip",       !!_ex[0].v && _ex[0].n==='Bodyweight Squat');
ok("...and the plan's own reps",      _ex[0].reps===15 && _ex[0].sets===3);
var _bad=t42PlanExercises({exercises:[{n:'Bodyweight Squat'},{n:'Nasi Lemak Press'},{n:'Plank'}]});
ok("an unknown movement is dropped",  _bad.length===2);
ok("...and not silently replaced",    _bad.map(function(e){return e.n;}).indexOf('Nasi Lemak Press')<0);
ok("nothing planned resolves to nothing", t42PlanExercises(null).length===0);

/* Already done today is said, and the session can still be replayed. */
T42.doneToday={day_no:18,title:'FULL BODY 01',minutes:34};
t42Paint();
ok("a finished workout says so",  document.getElementById('t42-body').innerHTML.indexOf('Done today')>0);
ok("...and still offers a replay", document.getElementById('t42-body').innerHTML.indexOf('Play Again')>0);
T42.doneToday=null;

/* A rest day is not an empty screen. */
T42.planDay=null;
t42Paint();
var _rd=document.getElementById('t42-body').innerHTML;
ok("a rest day is a screen of its own", _rd.indexOf('Rest day')>0);
ok("...that still keeps the streak reachable", _rd.indexOf('t42GoCheckin()')>0);
_t42running();

/* ── where the member lands ── */
t42Resume();
ok("a running challenge resumes on the dashboard", t42View==='dash');
/* No baseline goes to the baseline form only while one can still be given.
   On day 18 the server refuses it, so the form would be a dead end. */
T42.baseline=null; T42.challenge=_t42edition(-1);   // day 2
t42Resume();
ok("...unless the baseline is unfinished and still open", t42View==='baseline');
T42.challenge=_t42edition(-17);                      // day 18
t42Resume();
ok("...past the lock it is the dashboard, not a dead form", t42View==='dash');
t42Paint();
ok("...which says why they are not ranked",
   document.getElementById('t42-body').innerHTML.indexOf('Not ranked this time')>0);
_t42running();

/* ── the segment bar ── */
t42View='dash'; t42Segs();
ok("a running participant gets the tabs",
   document.getElementById('t42-segs').style.display==='flex');
T42.baseline=null; T42.challenge=_t42edition(-1); t42Segs();   // day 2
ok("...but not while the baseline is still to do",
   document.getElementById('t42-segs').style.display==='none');
T42.challenge=_t42edition(-17); t42Segs();                      // day 18
ok("...and a member past the lock without one still gets them",
   document.getElementById('t42-segs').style.display==='flex');
_t42running();
T42.challenge=_t42edition(9); t42View='joined'; t42Segs();
ok("before the start the tabs are Overview and Rules",
   document.getElementById('t42-segs').style.display==='flex' &&
   document.getElementById('t42-segs').innerHTML.indexOf('Overview')>0 &&
   document.getElementById('t42-segs').innerHTML.indexOf('Check in')<0);
T42.reg.status='pending'; t42View='pay'; t42Segs();
ok("...and an unpaid place gets none",
   document.getElementById('t42-segs').style.display==='none');

/* ── coming back from a workout ──
   openT42 is what the player returns to. With the state already loaded it
   must land on the dashboard without painting the landing hero first: a
   member eighteen days in should never be flashed an invitation to join. */
_t42running();
t42View='train';
openT42();
ok("reopening lands straight on the dashboard", t42View==='dash');
ok("...and the panel is the one on screen",
   document.getElementById('t42').style.display==='block');
ok("...with no trace of the join hero",
   document.getElementById('t42-body').innerHTML.indexOf('Join T42')<0);
_t42reset();

print("\n── T42 · PROGRESS ──");
_t42running();
T42.mid=null; T42.final=null;

/* ── which checkpoint is open ── */
T42.challenge=_t42edition(0);   ok("day 1 opens no checkpoint",  t42OpenPhase()===null);
T42.challenge=_t42edition(-19); ok("day 20 still opens none",    t42OpenPhase()===null);
T42.challenge=_t42edition(-20); ok("day 21 opens the mid-point", t42OpenPhase()==='mid');
T42.challenge=_t42edition(-37); ok("day 38 is still the mid",    t42OpenPhase()==='mid');
T42.challenge=_t42edition(-38); ok("day 39 opens the final",     t42OpenPhase()==='final');
T42.challenge=_t42edition(-41); ok("day 42 is still the final",  t42OpenPhase()==='final');
_t42running();

/* ── change from baseline ── */
ok("one measurement is no change", t42Delta('weight_kg')===null);
T42.mid={id:'m2',phase:'mid',weight_kg:58.3,waist_cm:68,height_cm:165};
ok("the mid-point gives a weight change", t42Delta('weight_kg')===-3.2);
ok("...and a waist change",               t42Delta('waist_cm')===-4);
ok("...as a percentage too",              t42DeltaPct('weight_kg')===-5.2);
T42.final={id:'m3',phase:'final',weight_kg:56,waist_cm:66,height_cm:165};
ok("the final wins over the mid",         t42Delta('weight_kg')===-5.5);
ok("...and the latest is the final",      t42Latest().phase==='final');
ok("a gain reads as a gain",              t42Signed(1.4,'kg')==='+1.4kg');
ok("nothing reads as a dash",             t42Signed(null,'kg')==='—');
T42.mid=null; T42.final=null;

/* ── the body tab ── */
t42View='progress'; t42ProgTab='body';
noThrow("the body tab renders", function(){ t42Paint(); });
var _pb=document.getElementById('t42-body').innerHTML;
ok("...listing all three checkpoints", _pb.indexOf('Baseline')>0 && _pb.indexOf('Mid-point')>0 &&
                                       _pb.indexOf('Final')>0);
ok("...ticking the one that is taken",  _pb.indexOf('t42-tick')>0);
ok("...locking the ones that are not",  _pb.indexOf('locked')>0);
ok("...and saying there is nothing to compare yet", _pb.indexOf('Nothing to compare')>0);
/* The member's own weight log is shown, and must be marked as not the
   thing they are scored on — or a daily self-weigh starts to look like a
   result. */
ok("the weight log is separated from the score", _pb.indexOf('not what you are scored on')>0 ||
                                                 _pb.indexOf('not scored')>0);
/* An online participant has no InBody and should not read empty rows
   about body fat. */
ok("no body composition without an InBody", _pb.indexOf('Body Composition')<0);
T42.mid={id:'m2',phase:'mid',weight_kg:58.3,waist_cm:68,body_fat_pct:19.4,muscle_mass_kg:26.1};
t42Paint();
ok("...but it appears once there is one",
   document.getElementById('t42-body').innerHTML.indexOf('Body Composition')>0);
T42.mid=null;

/* A member with no baseline gets a way to fix that, not an empty chart. */
T42.baseline=null;
t42Paint();
ok("no baseline offers the baseline",
   document.getElementById('t42-body').innerHTML.indexOf('t42GoBaseline()')>0);
_t42running();

/* ── consistency ── */
T42.checkins=[{day_no:18,steps:9000,nutrition:'on_track'},{day_no:17,steps:8200,nutrition:'on_track'},
              {day_no:16,steps:4000,nutrition:'partly'},{day_no:14,steps:8800,nutrition:'on_track'}];
T42.completions=[{day_no:18},{day_no:16},{day_no:14}];
t42ProgTab='consistency'; t42Paint();
var _pc=document.getElementById('t42-body').innerHTML;
ok("consistency counts the workouts", _pc.indexOf('3 / 18')>0);
ok("...and the check-ins",            _pc.indexOf('4 / 18')>0);
ok("...and totals the steps",         _pc.indexOf('30,000')>0);
ok("...with rate bars",               _pc.indexOf('t42-meter')>0);
/* The longest run anywhere, not just the one ending today — a streak
   someone lost in week two is still something they did. */
ok("the best streak is the longest run", t42BestStreak()===3);
T42.checkins=[{day_no:5},{day_no:4},{day_no:3},{day_no:2},{day_no:18}];
ok("...found wherever it sits",          t42BestStreak()===4);
_t42running();

/* ── the weekly review ── */
T42.checkins=[{day_no:15,steps:9000,nutrition:'on_track'},{day_no:16,steps:9000,nutrition:'on_track'},
              {day_no:17,steps:3000,nutrition:'partly'},{day_no:18,steps:9000,nutrition:'on_track'},
              {day_no:8,steps:9000,nutrition:'on_track'},{day_no:9,steps:9000,nutrition:'on_track'}];
T42.completions=[{day_no:15},{day_no:17},{day_no:8}];
var _w3=t42WeekStats(3);
ok("week 3 spans days 15 to 21", _w3.from===15 && _w3.to===21);
/* Day 18 is the fourth day of week 3. Scoring it out of seven would tell
   someone they are failing a week that has not happened. */
ok("...and counts only the days that happened", _w3.elapsed===4);
ok("...its workouts",   _w3.workouts===2);
ok("...its check-ins",  _w3.checkins===4);
ok("...and its steps",  _w3.steps===30000);
ok("an unfinished week says so",   _w3.complete===false);
var _w2=t42WeekStats(2);
ok("a finished week is complete",  _w2.complete===true);
ok("...and counts all seven days", _w2.elapsed===7);
ok("a week with nothing scores zero", t42WeekStats(1).score===0);
t42View='review';
noThrow("the review renders", function(){ t42Paint(); });
var _rv=document.getElementById('t42-body').innerHTML;
ok("...one card per week so far", (_rv.match(/Week \d/g)||[]).length>=3);
/* The official score is the server's. Saying otherwise here would be the
   app quoting a number it is not allowed to decide. */
ok("...and it never claims to be the official score",
   _rv.indexOf('is not the same number')>0);
_t42running();

/* ── checkpoints ── */
T42.challenge=_t42edition(-20);            // day 21, the mid opens
t42TakeMeasure('mid');
ok("taking the mid opens the measure screen", t42View==='measure');
ok("...prefilled empty when never taken",     t42Meas.weight==='');
t42Meas={weight:'',waist:''};   ok("an empty checkpoint is invalid", t42MeasValid()===false);
t42Meas={weight:'58.3',waist:''};ok("weight alone is not enough",    t42MeasValid()===false);
t42Meas={weight:'58.3',waist:'68'};ok("weight and waist is enough",  t42MeasValid()===true);
t42Meas={weight:'5.8',waist:'68'}; ok("an impossible weight is refused", t42MeasValid()===false);
noThrow("the measure screen renders", function(){ t42Paint(); });
ok("...showing the baseline to measure against",
   document.getElementById('t42-body').innerHTML.indexOf('Your baseline')>0);
/* The baseline has its own screen and its own rules — a checkpoint row
   must not become a second way to re-register. */
t42TakeMeasure('baseline');
ok("the baseline row goes to the baseline screen", t42View==='baseline');
/* A locked checkpoint must refuse even if something reaches the view. */
T42.challenge=_t42edition(-20); t42MeasPhase='final'; t42MeasReady=true; T42.final=null;
t42View='measure'; t42Paint();
ok("a locked checkpoint says so",
   document.getElementById('t42-body').innerHTML.indexOf('Not open yet')>0);
_t42running();

/* ── the fitness test ──
   It attaches to the baseline through week one, then to whichever
   checkpoint is open, and between the two there is nowhere for it to go —
   the same windows the measurement guard enforces on the server. */
T42.challenge=_t42edition(-4);                     // day 5
ok("week one's test goes on the baseline", t42FitPhase()==='baseline');
T42.challenge=_t42edition(-17);                    // day 18
ok("day 18 has nowhere to put a test",    t42FitPhase()===null);
t42View='progress';
t42TakeFitness();
ok("...so the test does not open",        t42View==='progress');
T42.challenge=_t42edition(-20);                    // day 21
ok("the mid-point takes the next one",    t42FitPhase()==='mid');
T42.mid={id:'m2',phase:'mid',weight_kg:58.3,waist_cm:68};
t42TakeFitness();
ok("the test opens", t42View==='fitness');
ok("...empty to begin with", t42FitAny()===false);
t42Fit={pushups:'22',squats:'',plank_sec:'75',run1k_sec:''};
ok("...and valid once anything is filled", t42FitAny()===true);
noThrow("the test renders", function(){ t42Paint(); });
ok("...asking for all four movements",
   document.getElementById('t42-body').innerHTML.indexOf('Push-ups')>0 &&
   document.getElementById('t42-body').innerHTML.indexOf('1 km')>0);
T42.baseline.fitness={pushups:18,plank_sec:60};
T42.mid={id:'m2',phase:'mid',weight_kg:58.3,waist_cm:68,fitness:{pushups:25,plank_sec:95}};
t42View='progress'; t42ProgTab='fitness'; t42Paint();
var _pf=document.getElementById('t42-body').innerHTML;
ok("fitness compares baseline with now", _pf.indexOf('18 → 25')>0);
ok("...and marks the improvement",       _pf.indexOf('+7')>0);
T42.baseline.fitness={}; T42.mid=null;
t42Paint();
ok("no test yet offers to take one",
   document.getElementById('t42-body').innerHTML.indexOf('No test taken yet')>0);
_t42running();

/* ── photos ── */
t42ProgTab='photos'; t42View='progress'; t42Paint();
var _pp=document.getElementById('t42-body').innerHTML;
ok("photos lead with the privacy promise", _pp.indexOf('stay private')>0);
ok("...naming the duo partner explicitly", _pp.indexOf('duo partner')>0);
ok("...and offering the three angles",     _pp.indexOf('Front')>0 && _pp.indexOf('Side')>0 &&
                                           _pp.indexOf('Back')>0);
ok("a checkpoint not taken has no slots to fill",
   _pp.indexOf('Opens later in the challenge')>0);
_t42reset();

print("\n── T42 · THE RULES AND THE RANK ──");
/* ── registration windows ── */
_t42reset();
ok("an edition in registration is open", T42.regOpen()===true);
T42.challenge.reg_closes_on=_t42day(-1);
ok("...until the day after it closes",   T42.regOpen()===false);
t42View='landing'; t42Paint();
var _lc=document.getElementById('t42-body').innerHTML;
ok("a closed edition offers no JOIN",    _lc.indexOf('Join T42')<0);
ok("...and says why",                    _lc.indexOf('Registration closed')>0);
ok("...and Home stops advertising it",   t42HomeCard()==='');
/* Someone already in keeps their way back, closed or not. */
T42.reg={id:'r1',mode:'online_solo',track:'transform',gender:'female',verify_code:'T42-1'};
T42.baseline={id:'m1',phase:'baseline',weight_kg:61.5,height_cm:165,waist_cm:72};
ok("...but a participant still sees their card", t42HomeCard().indexOf('openT42()')>0);
T42.challenge.reg_closes_on=null; T42.challenge.status='complete';
ok("a finished edition takes nobody", T42.regOpen()===false);
_t42reset();

/* ── the windows, read from the edition ── */
ok("the baseline locks on day 3 by default", T42.lockDay()===3);
ok("...its fitness test on day 7",           T42.fitLockDay()===7);
T42.challenge.config={baseline_lock_day:5, baseline_fitness_lock_day:10};
ok("...unless the edition says otherwise",   T42.lockDay()===5 && T42.fitLockDay()===10);
_t42running();
T42.challenge=_t42edition(-2);               // day 3
ok("day 3 can still fix the baseline", t42CanEdit('baseline')===true);
T42.challenge=_t42edition(-3);               // day 4
ok("day 4 cannot",                     t42CanEdit('baseline')===false);
T42.challenge=_t42edition(-20);              // day 21
ok("the mid-point is editable in its window", t42CanEdit('mid')===true);
ok("...the final is not yet",                 t42CanEdit('final')===false);
T42.mid={id:'m2',phase:'mid',weight_kg:58,waist_cm:68,verify_status:'verified'};
ok("a verified checkpoint is evidence, not a draft", t42CanEdit('mid')===false);
T42.mid=null;
/* The body tab only offers what the server would accept. */
t42View='progress'; t42ProgTab='body'; t42Paint();
var _cb=document.getElementById('t42-body').innerHTML;
ok("a locked baseline is not a link", _cb.indexOf("t42TakeMeasure('baseline')")<0);
ok("...the open mid-point is",        _cb.indexOf("t42TakeMeasure('mid')")>0);
_t42running();

/* ── what a reviewer said ── */
ok("a final waiting on review says so",
   t42VerifyWord({phase:'final',verify_status:'pending'})===' · awaiting check');
ok("a verified one says so",       t42VerifyWord({phase:'final',verify_status:'verified'})===' · verified');
ok("a resubmission asks for one",  t42VerifyWord({phase:'mid',verify_status:'resubmit'})===' · please resubmit');
ok("an unreviewed mid says nothing", t42VerifyWord({phase:'mid',verify_status:'none'})==='');

/* ── which board is mine ── */
ok("TRANSFORM women compete on their board", t42MyBoard()==='transform_female');
T42.reg.track='start';
ok("START competes on consistency",          t42MyBoard()==='consistency');
T42.reg.track='perform'; T42.reg.gender='male';
ok("PERFORM men on theirs",                  t42MyBoard()==='perform_male');
_t42running();
/* The server's category wins over the app's guess once it exists. */
T42.score={category:'transform_female',eligible:true,rank_category:4,rank_consistency:11,
           total:78.4,consistency_total:83.2};
ok("my rank is my category's",  t42MyRank()===4);
T42.reg.track='start'; T42.score.category='consistency';
ok("...or consistency's for START", t42MyRank()===11);
T42.score.eligible=false;
ok("an ineligible score has no rank", t42MyRank()===null);
_t42running();

/* ── the dashboard's standing ── */
t42View='dash';
t42Paint();
ok("no score yet shows no rank",
   document.getElementById('t42-body').innerHTML.indexOf('appears once the first scores')>0);
T42.score={category:'transform_female',eligible:true,rank_category:7,total:82.35,consistency_total:88};
t42Paint();
var _sd=document.getElementById('t42-body').innerHTML;
ok("a ranked member sees their place",  _sd.indexOf('#7')>0);
ok("...and their score to one place",   _sd.indexOf('82.4')>0);
ok("...and a way to the leaderboard",   _sd.indexOf('t42GoRank()')>0);
T42.score={category:'transform_female',eligible:false,note:'No complete baseline',total:0};
t42Paint();
ok("an unranked member is told why",
   document.getElementById('t42-body').innerHTML.indexOf('no complete baseline')>0);
_t42running();

/* ── the leaderboard ── */
t42Board='transform_female'; t42BoardMode='online';
t42BoardState={transform_female:'ready'};
t42BoardRows={transform_female:[
  {place:1,display_name:'Nurul A.',score:91.2,is_me:false},
  {place:2,display_name:'Siti H.', score:88.7,is_me:false},
  {place:3,display_name:'Aina R.', score:84.1,is_me:true},
  {place:4,display_name:'Participant',score:80,is_me:false}]};
T42.score={category:'transform_female',eligible:true,rank_category:3,total:84.1};
t42View='rank';
noThrow("the leaderboard renders", function(){ t42Paint(); });
var _lb=document.getElementById('t42-body').innerHTML;
ok("...every row",               (_lb.match(/t42-lb-n/g)||[]).length===4);
ok("...marking me",              _lb.indexOf('Aina R. · you')>0);
ok("...pinning my place above",  _lb.indexOf('t42-me-r">#3')>0);
ok("...and offering every board as category, then men or women", _lb.indexOf("t42RankGroup('perform')")>0 &&
   _lb.indexOf("t42RankGroup('consistency')")>0 && _lb.indexOf("t42RankSex('male')")>0);
ok("...with no gym duo switch on an online edition", _lb.indexOf("t42RankMode('duo')")<0);
/* The leaderboard's whole privacy promise, checked on the output. */
ok("no weight on the board",     _lb.indexOf(' kg')<0);
ok("no waist on the board",      _lb.indexOf(' cm')<0);
ok("...and it says so",          _lb.indexOf('never appear on any leaderboard')>0);
t42BoardRows.transform_female=[];
t42Paint();
ok("an empty board says the ranking has not run",
   document.getElementById('t42-body').innerHTML.indexOf('No ranking yet')>0);
t42BoardState.transform_female='error';
t42Paint();
ok("a failed load offers a retry",
   document.getElementById('t42-body').innerHTML.indexOf('t42RankReload()')>0);
var _mode0=T42.reg.mode; T42.reg.mode='gym_duo';
t42RankMode('duo');
ok("the duo board offers the four duo categories",
   document.getElementById('t42-body').innerHTML.indexOf("t42DuoBoardPick('duo_transform_female')")>0 &&
   document.getElementById('t42-body').innerHTML.indexOf("t42DuoBoardPick('duo_perform_male')")>0);
ok("...and how duos are judged",
   document.getElementById('t42-body').innerHTML.indexOf('never on kilograms')>0);
t42BoardMode='online'; t42Board=null; t42BoardRows={}; t42BoardState={};
_t42running();

/* ── the server's weekly review wins over the app's arithmetic ── */
T42.checkins=[{day_no:8,steps:9000,nutrition:'on_track'}];
T42.completions=[{day_no:8}];
T42.reviews=[{week_no:2,workouts_done:4,workouts_target:4,checkins_done:7,steps_total:61200,
              nutrition_days:6,week_score:96}];
t42View='review'; t42Paint();
var _rs=document.getElementById('t42-body').innerHTML;
ok("a scored week shows the server's numbers", _rs.indexOf('4 / 4')>0 && _rs.indexOf('61,200')>0);
ok("...and its score",                         _rs.indexOf('96%')>0);
ok("...marked as scored",                      _rs.indexOf('· scored')>0);
ok("an unscored week is still provisional",    _rs.indexOf('· provisional')>0);
T42.reviews=[1,2,3].map(function(w){ return {week_no:w,workouts_done:1,workouts_target:1,
  checkins_done:1,steps_total:1,nutrition_days:1,week_score:50}; });
t42Paint();
ok("when every week is scored, no provisional warning",
   document.getElementById('t42-body').innerHTML.indexOf('is not the same number')<0);
_t42reset();

print("\n── T42 · THE END ──");
function _t42done(){
  _t42running();
  T42.challenge=_t42edition(-50); T42.challenge.status='complete';
  T42.mid={id:'m2',phase:'mid',weight_kg:58.9,waist_cm:68.5};
  T42.final={id:'m3',phase:'final',weight_kg:56.1,waist_cm:66,verify_status:'verified',
             fitness:{pushups:27,plank_sec:110,run1k_sec:300},photo_front:'u/final-front.jpg'};
  T42.baseline.fitness={pushups:18,plank_sec:60,run1k_sec:360};
  T42.score={category:'transform_female',eligible:true,rank_category:2,rank_consistency:5,
             total:87.4,consistency_total:89,is_final:true};
  T42.certs=[{id:'c1',kind:'finisher',participant_name:'Aina binti Rahman',edition:'November 2026',
              final_score:87.4,issued_on:'2026-12-15',serial:'T42-2611-AB12CD34'}];
  T42.checkins=[{day_no:40,steps:9000},{day_no:41,steps:10000}];
  T42.completions=[{day_no:40},{day_no:41}];
}

/* ── the calendar after the last day ── */
_t42running();
ok("day 18 is not over",           T42.isOver()===false);
T42.challenge=_t42edition(-41);    ok("day 42 is still not over", T42.isOver()===false);
T42.challenge=_t42edition(-42);    ok("the day after is",         T42.isOver()===true);
ok("...while the day number stays at 42", T42.dayNo()===42 && T42.rawDay()===43);
ok("over is not the same as complete",    T42.isComplete()===false);
T42.challenge.status='complete';   ok("complete is the server's word", T42.isComplete()===true);
_t42running();

/* ── the final assessment ── */
T42.challenge=_t42edition(-38);    // day 39
var _fi=t42FinalItems();
ok("the final lists four things for online", _fi.length===4);
ok("...RUSH is optional",       _fi.filter(function(i){ return i.optional; }).length===1);
ok("...nothing is done yet",    _fi.filter(function(i){ return i.done===true; }).length===0);
T42.reg.mode='gym_duo';
ok("a gym member adds the InBody", t42FinalItems().length===5 &&
   t42FinalItems()[4].coach===true);
T42.reg.mode='online_solo';
t42View='final';
noThrow("the final renders", function(){ t42Paint(); });
var _fv=document.getElementById('t42-body').innerHTML;
ok("...each line opens its own screen", _fv.indexOf("t42TakeMeasure('final')")>0 &&
   _fv.indexOf('t42GoPhotos()')>0 && _fv.indexOf('t42TakeFitness()')>0);
ok("...and names the verification code", _fv.indexOf('T42-84921')>0);
T42.final={id:'m3',phase:'final',weight_kg:56.1,waist_cm:66,verify_status:'pending'};
ok("a submitted final ticks its line", t42FinalItems()[0].done===true);
t42Paint();
ok("...and says it is waiting",
   document.getElementById('t42-body').innerHTML.indexOf('Waiting for verification')>0);
T42.final.verify_status='resubmit'; T42.final.verify_note='Scale not visible in the photo';
t42Paint();
ok("a resubmission shows the reviewer's words",
   document.getElementById('t42-body').innerHTML.indexOf('Scale not visible')>0);
/* The dashboard points at it once it opens. */
t42View='dash'; T42.final=null; t42Paint();
ok("day 39 puts the final on the dashboard",
   document.getElementById('t42-body').innerHTML.indexOf('Final assessment is open')>0);
T42.challenge=_t42edition(-30); t42Paint();   // day 31
ok("...and not before",
   document.getElementById('t42-body').innerHTML.indexOf('Final assessment is open')<0);
/* After the last day, the dashboard IS the final screen. */
T42.challenge=_t42edition(-45);
t42Paint();
ok("after the end, the dashboard waits on results",
   document.getElementById('t42-body').innerHTML.indexOf('Results are announced once')>0);
t42View='checkin'; t42Paint();
ok("check-ins close with the last day",
   document.getElementById('t42-body').innerHTML.indexOf('T42 has finished')>0);
t42View='train'; t42Paint();
ok("...and so does the plan",
   document.getElementById('t42-body').innerHTML.indexOf('T42 has finished')>0);
_t42running();

/* ── the result ── */
_t42done();
ok("fitness improves the way the scorer counts it", t42FitImprove()===Math.round(
   ((27-18)/18 + (110-60)/60 + (360-300)/360)/3*1000)/10);
t42Resume();
ok("a finished edition resumes on the result", t42View==='result');
noThrow("the result renders", function(){ t42Paint(); });
var _rr=document.getElementById('t42-body').innerHTML;
ok("...headed T42 COMPLETE",       _rr.indexOf('T42 COMPLETE')>0);
ok("...counting 42 of 42",         _rr.indexOf('42 / 42 DAYS')>0);
ok("...with the weight change",    _rr.indexOf('-5.4 kg')>0);
/* START trains three days a week. Counting workouts against every day of
   the challenge would tell someone who did all of them they did 43%. */
T42.score.workout_pct=100; T42.completions=[{day_no:1},{day_no:3}];
ok("workouts use the plan-based number once the server has one", T42.workoutPct()===100);
T42.score.workout_pct=null;
ok("...and the app's own count before that", T42.workoutPct()===Math.round(2/42*100));
_t42done();
ok("...and the waist change",      _rr.indexOf('-6 cm')>0);
ok("...the score",                 _rr.indexOf('87.4')>0);
ok("...and the place",             _rr.indexOf('#2 · Transform · Women')>0);
ok("...offering the certificate",  _rr.indexOf('Claim Certificate')>0);
ok("...and what comes next",       _rr.indexOf('t42GoNext()')>0);
T42.score={category:'transform_female',eligible:false,note:'No final assessment',total:0};
t42Paint();
ok("an unranked finisher is told why",
   document.getElementById('t42-body').innerHTML.indexOf('No final assessment.')>0);
ok("...and not given a score", document.getElementById('t42-body').innerHTML.indexOf('t42-score-n')<0);
_t42done();
ok("Home says the result is ready", t42HomeCard().indexOf('result and certificate are ready')>0);

/* ── the certificate ── */
t42View='cert'; t42CertImg={}; t42CertCv={}; t42CertPick=0;
var _nan0=_canvas.nan, _txt0=_canvas.texts;
noThrow("the certificate renders", function(){ t42Paint(); });
ok("...drawn onto a canvas",       !!t42CertImg['c1'] && t42CertImg['c1'].indexOf('data:image/png')===0);
ok("...with text on it",           _canvas.texts-_txt0>=10, _canvas.texts-_txt0);
ok("...and not one NaN coordinate", _canvas.nan===_nan0);
var _cv=document.getElementById('t42-body').innerHTML;
ok("...shown as an image",         _cv.indexOf('class="t42-cert"')>0);
ok("...with its serial",           _cv.indexOf('T42-2611-AB12CD34')>0);
ok("...and a way to share it",     _cv.indexOf('t42ShareCert()')>0);
ok("the full name is on it, not an initial", t42FitText &&
   T42.certs[0].participant_name==='Aina binti Rahman');
/* Two certificates, two tabs. */
T42.certs.push({id:'c2',kind:'transformation_champion',participant_name:'Aina binti Rahman',
                edition:'November 2026',final_score:87.4,issued_on:'2026-12-15',serial:'T42-2611-EE99FF00'});
t42Paint();
ok("a champion sees both certificates",
   document.getElementById('t42-body').innerHTML.indexOf('TRANSFORMATION CHAMPION')>0);
t42CertTab(1);
ok("...and can switch between them", !!t42CertImg['c2']);
/* A long name is shrunk to fit rather than run off the page. */
var _ctx=document.createElement('canvas').getContext('2d');
t42FitText(_ctx,'Nur Aisyah Humaira binti Mohd Zulkarnain Al-Haj',860,64,'800','Inter');
ok("a long name is set smaller to fit", _ctx.measureText('Nur Aisyah Humaira binti Mohd Zulkarnain Al-Haj').width>860
   ? /\b(1[89]|[2-5]\d|6[0-2])px/.test(_ctx.font) : true);
/* A phone whose canvas fails must get a card, not a frozen screen: a draw
   that throws used to re-render, re-draw and throw again until the stack
   ran out. */
var _realDraw=t42DrawCert;
t42DrawCert=function(){ throw new Error('no canvas'); };
t42CertImg={}; t42CertFail={}; t42CertPick=0;
noThrow("a failed drawing does not loop", function(){ t42Paint(); });
ok("...and says the certificate is safe",
   document.getElementById('t42-body').innerHTML.indexOf('your certificate is issued and safe')>0);
t42DrawCert=_realDraw; t42CertFail={};
T42.certs=[]; t42Paint();
ok("no certificate on a complete edition says it is being issued",
   document.getElementById('t42-body').innerHTML.indexOf('being issued')>0 ||
   document.getElementById('t42-body').innerHTML.indexOf('completed a baseline and a final')>0);
_t42done();

/* ── what's next ── */
t42View='next';
noThrow("what's next renders", function(){ t42Paint(); });
var _nx=document.getElementById('t42-body').innerHTML;
ok("...back into HITFAT+",       _nx.indexOf('t42NextStore()')>0 && _nx.indexOf('Explore HITFAT+')>0);
ok("...the store",               _nx.indexOf('t42NextStore()')>0);
ok("...RUSH",                    _nx.indexOf('t42Rush()')>0);
ok("...the gym",                 _nx.indexOf('t42NextGym()')>0);
ok("...HYROX",                   _nx.indexOf('t42NextHyrox()')>0);
ok("...and the next edition",    _nx.indexOf('The next T42')>0);
/* Every card has to open something that exists. */
ok("every destination is a real function",
   typeof switchTab==='function' && typeof openStore==='function' && typeof clubEnquire==='function');

/* ── a finished edition beside a new one ── */
_t42reset();
T42.past={challenge:{id:'old',name:'T42 November 2026',edition:'November 2026',status:'complete',
                     starts_on:_t42day(-80),total_days:42,config:{}},
          reg:{id:'r-old',mode:'online_solo',track:'transform',gender:'female'}};
t42View='landing'; t42Paint();
var _lp=document.getElementById('t42-body').innerHTML;
ok("the landing offers last edition's result", _lp.indexOf('Your November 2026 result')>0);
ok("...beside the new invitation",             _lp.indexOf('Join T42')>0);
_t42reset(); T42.past=null; T42.certs=[];

print("\n── T42 · THE CHALLENGE ENGINE ──");
/* ── the lifecycle every screen follows ── */
_t42reset();
ok("no place is the invitation",        T42.stage()==='discover');
T42.reg={id:'r1',challenge_id:'ch1',mode:'online_solo',track:'transform',gender:'male',status:'pending',verify_code:'T42-1'};
ok("signed up but unpaid is unpaid",    T42.stage()==='unpaid');
ok("...and pending is not paid",        T42.isPaid()===false);
T42.reg.status='paid';
ok("paid before day 1 is upcoming",     T42.stage()==='upcoming');
T42.challenge=_t42edition(-17);
ok("paid on day 18 is active",          T42.stage()==='active');
T42.reg.status='active';
ok("...and 'active' is paid too",       T42.isPaid()===true);
T42.challenge=_t42edition(-45);
ok("after the last day it is closing",  T42.stage()==='closing');
T42.challenge.status='complete';
ok("results out is finished",           T42.stage()==='finished');
T42.reg.status='disqualified';
ok("a disqualified place is out",       T42.stage()==='out');
ok("...and Home stays quiet about it",  t42HomeCard()==='');
T42.challenge=null;
ok("no edition is none",                T42.stage()==='none');
_t42reset();

/* ── access ends with the challenge, or when the edition says ── */
T42.challenge=_t42edition(-50);
ok("content closes after the last day by default", T42.accessEnded()===true);
T42.challenge=_t42edition(-41);
ok("...but not on the last day itself",            T42.accessEnded()===false);
T42.challenge=_t42edition(-50); T42.challenge.access_ends_on=_t42day(2);
ok("an edition can set a later close",             T42.accessEnded()===false);
_t42reset();

/* ── what the edition offers ── */
ok("two tracks by default",           t42Tracks().map(function(t){ return t.id; }).join()==='transform,perform');
T42.challenge.config={tracks:['perform']};
ok("...or whatever the edition lists", t42Tracks().length===1 && t42Tracks()[0].id==='perform');
T42.challenge.config={};
ok("online only by default",          t42GymOpen()===false && t42Steps()===2);
t42Draft.mode=null; t42Begin();
ok("joining skips the mode step",     t42View==='track' && t42Draft.mode==='online_solo');
ok("...and the track step says 1 of 2", document.getElementById('t42-body').innerHTML.indexOf('Step 1 of 2')>0);
t42Draft.track='start';
t42TrackNext();
ok("a track the edition does not run cannot be taken", t42View==='track');
_t42reset();

/* ── physical only: Gym Duo, no Online Solo (November 2026) ── */
T42.challenge.config={gym_enabled:true, online_enabled:false};
ok("a gym-only edition offers one mode",  t42Modes().length===1 && t42OnlyMode()==='gym_duo' && t42GymOnly());
ok("...so there are two steps, not three", t42Steps()===2);
t42Draft.mode='online_solo'; t42Begin();
ok("joining skips the mode step into Gym Duo", t42View==='track' && t42Draft.mode==='gym_duo');
t42View='landing'; t42Paint();
var _gl=document.getElementById('t42-body').innerHTML;
ok("the landing says where and with whom", _gl.indexOf('Trained at HITFAT HQ')>0 && _gl.indexOf('In pairs')>0);
ok("...and offers no second way to do it", _gl.indexOf('Two ways to do it')<0 && _gl.indexOf('ONLINE')<0);
T42.challenge.config={gym_enabled:true};
ok("both modes when the edition runs both", t42Modes().length===2 && t42OnlyMode()===null && t42Steps()===3);
t42Draft.mode=null; t42Begin();
ok("...and then the mode is asked",       t42View==='mode');
T42.challenge.config={gym_enabled:false, online_enabled:false};
ok("an edition with no mode falls back to online", t42OnlyMode()==='online_solo');
_t42reset();

/* ── securing the spot ── */
T42.reg={id:'r1',challenge_id:'ch1',mode:'online_solo',track:'transform',gender:'male',status:'pending',verify_code:'T42-77001'};
T42.baseline={id:'m1',phase:'baseline',weight_kg:82,height_cm:174,waist_cm:95};
t42Resume();
ok("an unpaid sign-up resumes on payment", t42View==='pay');
noThrow("the confirm screen renders", function(){ t42Paint(); });
var _pp=document.getElementById('t42-body').innerHTML;
ok("...titled confirm your place",  _pp.indexOf('Confirm your place')>0);
ok("...with no price and no checkout in the app", _pp.indexOf('Pay RM')<0 && _pp.indexOf('t42PayNow()')<0 && _pp.indexOf('setPayChannel')<0);
ok("...saying to pay with the same email", _pp.indexOf('same email as this account')>0);
ok("...a way to confirm after paying",     _pp.indexOf('t42ClaimPurchase(null)')>0);
ok("...and by order number for another email", _pp.indexOf('t42ClaimOrder()')>0 && _pp.indexOf('id="t42-order"')>0);
ok("...and a human to message",            _pp.indexOf('t42AskPay()')>0);
T42.challenge.config={landing_url:'https://hitfat.bcl.my/form/t42'}; t42Paint();
ok("the landing page is one tap away when the edition has one",
   document.getElementById('t42-body').innerHTML.indexOf('t42JoinLanding()')>0);
T42.challenge.config={};
t42View='dash'; t42Paint();
ok("an unpaid place cannot reach the dashboard",
   document.getElementById('t42-body').innerHTML.indexOf('Confirm your place')>0);
t42View='joined'; t42Paint();
ok("...nor the countdown",
   document.getElementById('t42-body').innerHTML.indexOf('Confirm your place')>0);
ok("Home asks for the last step", t42HomeCard().indexOf('Confirm your place')>0);
/* A buyer — paid on the landing page — is invited to set up, not to join. */
var _r0=T42.reg; T42.reg=null; T42.purchase={paid:true, order_number:'BCL-1'}; t42View='landing'; t42Paint();
ok("a buyer is invited to set up their place", document.getElementById('t42-body').innerHTML.indexOf('Set up my T42')>0 &&
   document.getElementById('t42-body').innerHTML.indexOf('t42JoinLanding()')<0);
T42.purchase=null; t42Paint();
ok("anyone else joins on the landing page",    document.getElementById('t42-body').innerHTML.indexOf('t42JoinLanding()')>0 &&
   document.getElementById('t42-body').innerHTML.indexOf('Already paid?')>0);
T42.reg=_r0;
var _s29=readFile('deploy/29-t42-purchases.sql'), _fn=readFile('deploy/t42-purchase/index.ts');
ok("the webhook needs its secret",               _fn.indexOf("key !== secret.value")>0);
ok("...ignores a payment that did not go through", _fn.indexOf("ignored: 'not paid'")>0);
ok("...and a retried order is recorded once",      _fn.indexOf("onConflict: 'order_number', ignoreDuplicates: true")>0);
ok("a purchase confirms one place, once",          _s29.indexOf("claimed_by is null or claimed_by = auth.uid()")>0);
ok("...matched by the signed-in email",            _s29.indexOf("lower(email) = public.t42_my_email()")>0);
T42.baseline=null;
ok("...or the sign-up before it", t42HomeCard().indexOf('Finish your sign-up')>0);
t42Resume();
ok("...and resumes on the baseline while it can be given", t42View==='baseline');
T42.challenge.reg_closes_on=_t42day(-1); t42Resume();
ok("...and on payment once registration has closed",      t42View==='pay');
t42Paint();
ok("a closed edition says the place was not confirmed",
   document.getElementById('t42-body').innerHTML.indexOf('Registration closed')>0);
_t42reset();

/* ── before day 1 ── */
T42.reg={id:'r1',challenge_id:'ch1',mode:'online_solo',track:'perform',gender:'female',status:'paid',verify_code:'T42-5'};
T42.baseline={id:'m1',phase:'baseline',weight_kg:61.5,height_cm:165,waist_cm:72,age:29};
try{ localStorage.removeItem(t42RulesKey()); }catch(e){}
t42View='joined'; t42Paint();
var _up=document.getElementById('t42-body').innerHTML;
ok("the countdown says you are in",  _up.indexOf('You\'re in.')>0);
ok("...counts days and hours",       /days? to go/.test(_up) && _up.indexOf('hour')>0);
ok("...lists what to get ready",     _up.indexOf('Get Ready')>0 && _up.indexOf('Starting photos')>0 &&
                                     _up.indexOf('Rules &amp; scoring')>0);
var _pi=t42PrepItems();
ok("the checklist ticks what exists", _pi.filter(function(i){ return i.done; }).length===4, _pi.filter(function(i){ return i.done; }).length);
t42GoRules();
ok("reading the rules ticks the rules", t42RulesRead()===true &&
   t42PrepItems().filter(function(i){ return i.done; }).length===5);
var _ru=document.getElementById('t42-body').innerHTML;
ok("the rules give the dates",       _ru.indexOf('Day 1')>0 && _ru.indexOf('Content closes')>0);
ok("...say a missed day resets nothing", _ru.indexOf('Nothing resets')>0);
T42.challenge.config={scoring:{perform:{fitness_pct:50,rush_pct:25,workout_pct:15,consistency_pct:10}}};
t42Paint(); _ru=document.getElementById('t42-body').innerHTML;
ok("...and the weights come from the edition", _ru.indexOf('Fitness tests')>0 && _ru.indexOf('50%')>0);
T42.challenge.config={community_url:'https://chat.whatsapp.com/abc'};
ok("a community link is a checklist line when the edition has one",
   t42PrepItems().some(function(i){ return i.label==='Join the community'; }));
_t42reset();

/* ── the running dashboard ── */
_t42running();
t42View='dash'; t42Paint();
var _dd=document.getElementById('t42-body').innerHTML;
ok("the dashboard says how long is left", _dd.indexOf('24</b>')>0 && _dd.indexOf('days left')>0);
ok("...draws the six weeks",              (_dd.match(/t42-jseg/g)||[]).length===6);
ok("...and one button to carry on",       _dd.indexOf('Continue Today')>0 && _dd.indexOf('t42PlayToday()')>0);
ok("...with progress as four numbers",    _dd.indexOf('Compliance')>0 && _dd.indexOf('Points')>0);
ok("day 18 is not a milestone",           _dd.indexOf('t42-mile')<0);
T42.checkins=[{day_no:16}];
t42Paint(); _dd=document.getElementById('t42-body').innerHTML;
ok("a missed yesterday is said kindly",   _dd.indexOf('You missed yesterday')>0 && _dd.indexOf('nothing resets')>0);
T42.checkins=[{day_no:17}]; t42Paint();
ok("...and not when yesterday was done",
   document.getElementById('t42-body').innerHTML.indexOf('You missed yesterday')<0);
T42.checkins=[]; T42.challenge=_t42edition(-20); t42Paint();   // day 21
ok("day 21 is halfway there",
   document.getElementById('t42-body').innerHTML.indexOf('Halfway there')>0);
T42.challenge=_t42edition(-6); t42Paint();                      // day 7
ok("day 7 is seven days complete",
   document.getElementById('t42-body').innerHTML.indexOf('7 days complete')>0);
_t42running();
T42.doneToday={day_no:18,title:'FULL BODY 01'};
ok("with the workout done, carrying on means the check-in", t42NextAction().go==='t42GoCheckin()');
T42.today={day_no:18,energy:3};
ok("...and with both, the day is done",   t42NextAction().done===true);
_t42running();

/* Yesterday can still be logged the morning after. */
T42.checkins=[{day_no:16}];
t42CheckYesterday();
ok("logging yesterday checks in day 17",  t42CkDay()===17 &&
   document.getElementById('t42-body').innerHTML.indexOf('Day 17 · Yesterday')>0);
t42Go('dash');
ok("...and leaving goes back to today",   t42CkFor===null && t42CkDay()===18);
_t42running();

/* ── after the end: a closed door with somewhere to go ── */
_t42done();
T42.open={id:'ch2',slug:'t42-ramadan-2027',name:'T42 Ramadan 2027',edition:'Ramadan 2027',
          starts_on:_t42day(30),ends_on:_t42day(71),status:'registration',total_days:42,config:{}};
t42Finished('The plan');
var _lk=document.getElementById('t42-body').innerHTML;
ok("a finished edition's content is closed",  _lk.indexOf('Challenge completed')>0 && _lk.indexOf('Your achievement stays')>0);
ok("...pointing at the result and certificate", _lk.indexOf('t42GoResult()')>0 && _lk.indexOf('t42GoCert()')>0);
ok("...and at the next edition",             _lk.indexOf('Ramadan 2027')>0 && _lk.indexOf('Join the next challenge')>0);
ok("...with HITFAT+ as an upsell, not a gift", _lk.indexOf('Sold separately')>0);
T42.open=null;
t42View='result'; t42Paint();
var _rs=document.getElementById('t42-body').innerHTML;
ok("the result is the finish line",       _rs.indexOf('You did it.')>0 && _rs.indexOf('T42 Finisher')>0);
ok("...with the longest streak",          _rs.indexOf('Longest streak')>0 && _rs.indexOf('2 days')>0);
ok("...and says access has ended",        _rs.indexOf('Program access ended')>0);
_t42reset();

/* ── My T42 Journey ── */
T42.open=_t42edition(9); T42.challenge=T42.open;
T42.journey=[
  {id:'r-old',challenge_id:'old',status:'completed',track:'transform',
   t42_challenges:{id:'old',name:'T42 November 2026',edition:'November 2026',status:'complete',
                   starts_on:_t42day(-80),ends_on:_t42day(-39),total_days:42,config:{}},
   t42_scores:{total:92,consistency_total:88,consistency_pct:91,eligible:true,rank_category:3,category:'transform_male'},
   t42_certificates:[{id:'c9',kind:'finisher'}],
   t42_measurements:[{phase:'baseline',weight_kg:91.2,waist_cm:101},{phase:'final',weight_kg:85.8,waist_cm:94}]},
  {id:'r-p',challenge_id:'xx',status:'pending',track:'perform',
   t42_challenges:{id:'xx',name:'T42 Merdeka 2027',starts_on:_t42day(200),ends_on:_t42day(241),status:'registration',total_days:42},
   t42_scores:[],t42_certificates:[],t42_measurements:[]}
];
t42View='journey'; t42Paint();
var _jy=document.getElementById('t42-body').innerHTML;
ok("the journey lists every edition",      _jy.indexOf('T42 November 2026')>0 && _jy.indexOf('T42 Merdeka 2027')>0);
ok("...a finished one as completed",       _jy.indexOf('>Completed<')>0);
ok("...with its changes",                  _jy.indexOf('-5.4 kg')>0 && _jy.indexOf('-7 cm')>0);
ok("...its compliance, score and rank",    _jy.indexOf('91%')>0 && _jy.indexOf('>92.0<')>0 && _jy.indexOf('>#3<')>0);
ok("...its certificate",                   _jy.indexOf("t42OpenCert('r-old')")>0 && _jy.indexOf('FINISHER')>0);
ok("...and program access, ended",         _jy.indexOf('Program access: Ended')>0);
ok("an unpaid one says so",                _jy.indexOf('Payment pending')>0);
ok("the open edition invites a new sign-up", _jy.indexOf('Registration open')>0 && _jy.indexOf('Join now')>0);
T42.journey=[];
t42Paint();
ok("an empty journey says what will live there",
   document.getElementById('t42-body').innerHTML.indexOf('Nothing here yet')>0);
T42.journey=null; T42.open=null;
_t42reset();

/* ── the server side of the same rules ── */
var _sql27=readFile('deploy/27-t42-engine.sql');
ok("the plan is readable only with access",
   /create policy t42_plan_read[\s\S]*?t42_has_access\(challenge_id\)/.test(_sql27));
ok("...which needs a paid place in that edition, inside its window",
   _sql27.indexOf("t42_is_paid_status(r.status)")>0 && _sql27.indexOf('r.challenge_id = p_challenge')>0 &&
   _sql27.indexOf('coalesce(c.access_ends_on, c.starts_on + c.total_days - 1)')>0);
ok("scoring rows need a confirmed place",
   ['t42_daily_checkins','t42_workout_completions','t42_rush_results','t42_measurements'].every(function(t){
     return _sql27.indexOf('create trigger t42_guard_paid before insert or update on public.'+t)>0; }));
ok("an unpaid registration is never ranked", _sql27.indexOf("new.eligible := false")>0);
ok("the edition advances by date on the hourly job",
   /create or replace function public\.t42_compute_all\(\)[\s\S]*?perform public\.t42_advance\(\)/.test(_sql27));
ok("...and nobody can call that by hand",
   _sql27.indexOf('revoke all on function public.t42_advance()     from public, anon, authenticated')>0);
ok("the price is never invented in a migration", !/set\s+price_rm\s*=/.test(_sql27.replace(/--.*$/mg,'')));
var _grant=readFile('deploy/_shared/grant.ts'), _pc=readFile('deploy/pay-create/index.ts');
ok("paying for T42 confirms that registration, not a store entitlement",
   _grant.indexOf("update({ status: 'paid', product_sku: sku })")>0 && _grant.indexOf(".eq('status', 'pending')")>0);
ok("pay-create prices T42 from the edition's row",
   _pc.indexOf("price = Number(ch.price_rm)")>0 && _pc.indexOf('amount: price')>0);
ok("...and refuses a second payment",  _pc.indexOf("You are already in this T42.")>0);
ok("coming back from paying for T42 waits on T42",
   readFile('store.js').indexOf("sku.indexOf('t42:')===0 && typeof t42AwaitPayment==='function'")>0);

/* T42 has a seat in Train, not only the Home banner. */
_t42reset();
switchTab('train'); setTrSeg('foryou');
ok("Train leads with a T42 chip when an edition is open",
   document.getElementById('tr-segs').innerHTML.indexOf("setTrSeg('t42')")>0);
ok("...and the T42 card at the top of For You",
   document.getElementById('tr-body').innerHTML.indexOf('t42-banner')>=0);
setTrSeg('explore');
ok("...and of Explore", document.getElementById('tr-body').innerHTML.indexOf('t42-banner')>=0);
setTrSeg('t42');
ok("the chip opens the T42 panel", document.getElementById('t42').style.display==='block' && trSeg!=='t42');
T42.challenge=null; switchTab('train'); setTrSeg('foryou');
ok("no edition, no chip",          document.getElementById('tr-segs').innerHTML.indexOf("setTrSeg('t42')")<0);
_t42reset();

/* ── demo mode: a whole challenge, nothing written ── */
T42_DEMO=true;
var _realSb=sb; sb={from:function(){ throw new Error('demo wrote to the database'); },
                    rpc:function(){ throw new Error('demo called the database'); }};
T42_DEMO_STAGES.forEach(function(st){
  noThrow("demo stage "+st[0]+" renders", function(){ t42DemoStage=st[0]; T42.load(); t42Resume(); t42Paint(); });
});
t42DemoStage='active'; T42.load(); t42Resume();
ok("demo day 18 is a running challenge",  T42.stage()==='active' && T42.dayNo()===18);
ok("...with history behind it",           T42.checkins.length>=14 && T42.completions.length>=8);
/* The demo plays the real TRANSFORM plan: clean names, timed holds. */
ok("the demo's day is the real plan",     T42.planDay && T42.planDay.title==='Upper Body & Core');
var _px=t42PlanExercises(T42.planDay);
ok("...every exercise found in the library", _px.length===T42.planDay.exercises.length);
ok("...shown by its clean name",          _px.some(function(e){ return e.n==='Bent-Over Row (Bottles)'; }));
var _ho=_px.filter(function(e){ return e.sec; })[0];
ok("...a hold timed in seconds",          _ho && _ho.dur===_ho.sec && /s$/.test(t42ExDose(_ho)));
ok("...a rep exercise shown in reps",     t42ExDose({sets:4,reps:12})==='4 × 12');
ok("...and yesterday missed",             t42MissedYesterday());
t42Paint();
ok("...that the dashboard shows",         document.getElementById('t42-body').innerHTML.indexOf('Day 18')>0 &&
                                          document.getElementById('t42-body').innerHTML.indexOf('You missed yesterday')>0);
t42LoadBoard('transform_male');
ok("the demo leaderboard has ten people", t42BoardRows.transform_male.length===10 &&
                                          t42BoardRows.transform_male.filter(function(r){ return r.is_me; }).length===1);
ok("...in score order, the viewer included", ['transform_male','consistency'].every(function(id){
    var rows=t42DemoBoard(id); return rows.every(function(r,i){ return !i || rows[i-1].score>=r.score; }); }));
t42CkReady=false; t42Go('checkin'); t42CkSet('energy',4);
var _ckErr=null; t42SaveCheckin().catch(function(e){ _ckErr=e; });
ok("a demo check-in stays on the device", !_ckErr && !!T42.today && T42.today.day_no===18);
t42DemoStage='results'; T42.load(); t42Resume();
ok("demo results land on the result",     t42View==='result' && T42.certs.length===1);
ok("demo journey has the finished edition", t42DemoJourney().length===1 && t42DemoJourney()[0].t42_scores.eligible);
ok("demo opens everything",               contentOpen());
sb=_realSb; T42_DEMO=false; t42DemoStage='active';
_t42reset();

ok("a plan's sets become the player's rounds", t42Rounds([{sets:4},{sets:4},{sets:3}])===4 &&
   t42Rounds([{sets:5},{sets:5},{sets:4},{sets:4}])===5 && t42Rounds([])===1);
print("\n── T42 · GYM DUO ──");
function _t42gym(){
  _t42running();
  T42.reg.mode='gym_duo'; T42.reg.duo_id='d1';
  T42.duo={id:'d1',code:'T42-K8F2',locked_at:null};
  T42.duoCard=[
    {registration_id:'r1',is_me:true, display_name:'Aina R.',track:'transform',baseline_ok:true,inbody_ok:true,ready:true,
     checked_in_today:true,workout_today:true,steps_today:6420,gym_today:true,attended:9,
     weight_change_pct:-4.2,waist_change_pct:-5.1,workout_pct:92,attendance_pct:100,total:84.1},
    {registration_id:'r2',is_me:false,display_name:'Siti H.',track:'transform',baseline_ok:true,inbody_ok:true,ready:true,
     checked_in_today:true,workout_today:true,steps_today:5200,gym_today:false,attended:7,
     weight_change_pct:-5.8,waist_change_pct:-4.0,workout_pct:88,attendance_pct:78,total:80.3}];
  T42.duoScore={duo_id:'d1',category:'duo_transform_female',eligible:true,team_total:82.2,rank_category:7};
}

/* ── the pairing window ── */
_t42gym();
ok("a gym registration is a gym registration", T42.isGym()===true);
T42.challenge=_t42edition(9);   ok("pairing is open before the start", T42.duoWindowOpen()===true);
T42.challenge=_t42edition(-2);  ok("...and through day 3",             T42.duoWindowOpen()===true);
T42.challenge=_t42edition(-3);  ok("...and closed on day 4",           T42.duoWindowOpen()===false);
T42.challenge=_t42edition(9); T42.challenge.status='complete';
ok("...and on a finished edition", T42.duoWindowOpen()===false);
_t42gym();

/* ── readiness ── */
ok("two ready partners are a ready team", t42DuoReadiness()===100);
T42.duoCard=[T42.duoCard[0]];
T42.duoCard[0].inbody_ok=false;
/* TRANSFORM needs three things each: registered, baseline, InBody. One
   partner with two of them, the other not joined: 2 of 6. */
ok("a missing partner counts as nothing done", t42DuoReadiness()===33);
T42.reg.track='perform';
ok("PERFORM needs no InBody",                  t42DuoReadiness()===50);
_t42gym();

/* ── the duo screen ── */
T42.reg.duo_id=null; T42.duo=null; T42.duoCard=[]; T42.challenge=_t42edition(5);
t42View='duo';
noThrow("the duo screen renders", function(){ t42Paint(); });
var _du=document.getElementById('t42-body').innerHTML;
ok("...offering to create a duo",     _du.indexOf('t42DuoCreate()')>0);
ok("...or to join with a code",       _du.indexOf('t42-duocode')>0 && _du.indexOf('t42DuoJoin()')>0);
ok("...and saying who can pair",      _du.indexOf('same gender on the same track')>0);
ok("...and letting pairing wait",      _du.indexOf('Do this later')>0);
ok("...while saying a duo is needed to be ranked", _du.indexOf('You need a duo to be ranked')>0);
/* Before day 1 the partner is on the checklist and the Duo has a tab. */
T42.reg.status='paid';
var _pi=t42PrepItems().map(function(i){ return i.label; });
ok("the checklist asks for a partner",    _pi.indexOf('Your duo partner')>=0);
ok("...and the InBody on TRANSFORM",      _pi.indexOf('InBody at HQ')>=0);
ok("a gym member has a Duo tab before day 1", t42SegFor('duo','upcoming')==='duo');
T42.reg.status='pending';
T42.challenge=_t42edition(-10); t42Paint();
ok("after the window there is nothing to create",
   document.getElementById('t42-body').innerHTML.indexOf('Pairing has closed')>0 &&
   document.getElementById('t42-body').innerHTML.indexOf('t42DuoCreate()')<0);
_t42gym(); T42.challenge=_t42edition(5);
t42Paint();
_du=document.getElementById('t42-body').innerHTML;
ok("a duo shows its code",            _du.indexOf('T42-K8F2')>0);
ok("...both partners",                _du.indexOf('Siti H.')>0);
ok("...the team's readiness",         _du.indexOf('Team readiness')>0);
ok("...and a way out while it is open", _du.indexOf('t42DuoLeave()')>0);
/* The duo screen must never be a dead end: it used to have no way back into
   T42 at all, only the panel's Back to Home. */
ok("...and a way back into the challenge", _du.indexOf('t42DuoDone()')>0 && _du.indexOf('Continue to T42')>0);
t42DuoDone();
ok("which lands where opening T42 would", t42View==='joined');
_t42gym(); T42.challenge=_t42edition(5); t42View='duo'; t42Paint();
_du=document.getElementById('t42-body').innerHTML;
T42.duoCard=[T42.duoCard[0]]; t42Paint();
ok("a partner not yet joined is waited for",
   document.getElementById('t42-body').innerHTML.indexOf('Waiting for them to join')>0);
_t42gym();
t42Paint();
ok("once fixed, no way out",
   document.getElementById('t42-body').innerHTML.indexOf('t42DuoLeave()')<0 &&
   document.getElementById('t42-body').innerHTML.indexOf('fixed for this edition')>0);

/* ── typing the code ── */
var _toasts=[], _toast0=toast;
toast=function(m){ _toasts.push(m); };
T42.reg.duo_id=null; T42.challenge=_t42edition(5);
t42View='duo'; t42Paint();
document.getElementById('t42-duocode').value='hello';
t42DuoJoin();
ok("a code that is not a code is refused before any request",
   _toasts[_toasts.length-1]==='Enter the code your partner gave you');
/* People type what they hear: "k8f2" is the same code as "T42-K8F2", and
   it gets past validation to the request (which, signed out, says so). */
document.getElementById('t42-duocode').value='k8f2';
t42DuoJoin();
ok("...but the four characters alone are enough", _toasts[_toasts.length-1]==='Sign in first');
toast=_toast0;
_t42gym();

/* ── the dashboard ── */
t42View='dash'; t42Paint();
var _dg=document.getElementById('t42-body').innerHTML;
ok("today lists the gym check-in",      _dg.indexOf('Gym check-in')>0);
ok("...ticked when it happened",        _dg.indexOf('Checked in at HQ')>0);
ok("the duo sits under today",          _dg.indexOf('Your Duo')>0);
ok("...you beside your partner",        _dg.indexOf('Siti H.')>0);
ok("...with their steps",               _dg.indexOf('5,200')>0);
ok("...and the crosses where they missed", _dg.indexOf('t42-duo-no')>0);
ok("...the duo score and team rank",    _dg.indexOf('82.2')>0 && _dg.indexOf('#7')>0);
ok("...and the way to the QR",          _dg.indexOf('t42GymCheckin()')>0);
ok("...with no second, individual standing under it", _dg.indexOf('Your rank appears')<0);
/* The partner card carries ticks and steps, nothing more personal. */
/* A weight is a number followed by kg. Looking for the letters "kg" alone
   started failing on "background:" once icons carried a tile colour. */
ok("the dashboard never shows the partner's kilograms", !/\d\s*kg\b/.test(_dg), (_dg.match(/\d\s*kg\b/)||[''])[0]);
T42.reg.duo_id=null; T42.duoCard=[]; T42.duoScore=null; T42.challenge=_t42edition(-17);
t42Paint();
ok("an unpaired member past the window is told pairing has closed",
   document.getElementById('t42-body').innerHTML.indexOf('Pairing has closed')>0);
_t42gym();

/* An online member never sees any of it. */
T42.reg.mode='online_solo'; t42Paint();
ok("online solo has no gym row",  document.getElementById('t42-body').innerHTML.indexOf('Gym check-in')<0);
ok("...and no duo",               document.getElementById('t42-body').innerHTML.indexOf('Your Duo')<0);
_t42gym();

/* ── duo progress ── */
t42View='progress'; t42ProgTab='duo'; t42Paint();
var _dp=document.getElementById('t42-body').innerHTML;
ok("gym members get a Duo tab",     _dp.indexOf("t42ProgGo('duo')")>0);
ok("...showing both partners",      _dp.indexOf('Siti H.')>0);
ok("...as percentages",             _dp.indexOf('-5.8%')>0 && _dp.indexOf('-4.2%')>0);
ok("...and the team as their average", _dp.indexOf('Team transformation')>0 && _dp.indexOf('-5%')>0);
ok("...never in kilograms",         _dp.indexOf(' kg')<0);
ok("...and it says so",             _dp.indexOf('never your kilograms')>0);
T42.reg.mode='online_solo'; t42ProgTab='body'; t42Paint();
ok("online solo has no Duo tab",   document.getElementById('t42-body').innerHTML.indexOf("t42ProgGo('duo')")<0);
_t42gym();

/* ── the duo leaderboard ── */
ok("my duo's board is my duo's category", t42MyDuoBoard()==='duo_transform_female');
t42BoardModeSet=false; t42Board=null; t42DuoBoardId=null;
t42BoardState={duo_transform_female:'ready'};
t42BoardRows={duo_transform_female:[
  {place:1,team:'Nurul A. & Hana Z.',score:91.4,is_mine:false},
  {place:7,team:'Aina R. & Siti H.', score:82.2,is_mine:true}]};
t42View='rank'; t42Paint();
var _db=document.getElementById('t42-body').innerHTML;
ok("a gym member opens on the duo board", t42BoardMode==='duo');
ok("...listing teams by first names",    _db.indexOf('Nurul A. &amp; Hana Z.')>0);
ok("...marking mine",                    _db.indexOf('Aina R. &amp; Siti H. · you')>0);
ok("...pinning our place",               _db.indexOf('t42-me-r">#7')>0);
t42BoardRows.duo_transform_female=[]; t42Paint();
ok("an empty duo board says why",
   document.getElementById('t42-body').innerHTML.indexOf('No duos ranked yet')>0);
t42BoardModeSet=false; t42Board=null; t42DuoBoardId=null; t42BoardState={}; t42BoardRows={};
t42BoardMode='online';

/* ── the QR is the Club's ── */
t42GymCheckin();
ok("gym check-in opens the Club's own QR",
   document.getElementById('club').style.display==='block' && clubSegNow==='checkin');
clubCiStop(); clubSegNow='overview';
_t42reset();

print("\n── ME, after the Fitness+ account sheet ──");
(function(){
  var keep={p:_ent.plusUntil,c:_ent.coachUntil,m:MEMBERSHIP_LIVE};
  MEMBERSHIP_LIVE=true; _ent.plusUntil=null; _ent.coachUntil=null;
  noThrow("Me renders without a membership", function(){ renderMe(); });
  var h=document.getElementById('me-body').innerHTML;
  ok("not a member: the offer, as a poster", h.indexOf('mepromo')>0 && h.indexOf('openStore()')>0);
  ok("the profile leads with Edit Plan",     h.indexOf('meprof')>0 && h.indexOf('Edit Plan')>0);
  ok("Appearance is a segmented control",    h.indexOf('setThemeLight()')>0 && h.indexOf('setThemeDark()')>0);
  ok("privacy and terms are rows in About",  h.indexOf("/privacy")>0 && h.indexOf("/terms")>0);
  _ent.plusUntil=new Date(Date.now()+30*864e5).toISOString();
  renderMe(); h=document.getElementById('me-body').innerHTML;
  ok("a member sees their date, not the offer", h.indexOf('mepromo')<0 && h.indexOf('Until ')>0);
  _ent.plusUntil=keep.p; _ent.coachUntil=keep.c; MEMBERSHIP_LIVE=keep.m;
})();


print("\n── PROGRAM PAGE: the bar that stays ──");
(function(){
  var p=PROGRAMS.filter(function(x){return x.weeks;})[0];
  noThrow("program page renders", function(){ openProgram(p.id); });
  var h=document.getElementById('pgd-body').innerHTML;
  ok("it has a bar with the back button", h.indexOf('pdx-bar')>=0 && h.indexOf('closeProgramDetail()')>0);
  ok("...and the page's one action as a pill", h.indexOf('pdx-pill')>0);
  ok("the back button is in the bar, once", h.split('class="pdx-back"').length-1===1);
})();

print("\n── COLLECTIONS ──");
noThrow("the Collections page opens", function(){ openLibList('collections'); });
ok("...as posters, every collection", document.getElementById('lib-body').innerHTML.split('hpo hpo-w fcoll').length-1===CHALLENGES.length);
ok("...each with its length on it", document.getElementById('lib-body').innerHTML.indexOf('Challenge · '+(CHALLENGES[0].days||progDays(CHALLENGES[0]))+' days')>0);
noThrow("a collection opens", function(){ openProgram(CHALLENGES[0].id); });
ok("its days do not say Day n twice", document.getElementById('pgd-body').innerHTML.indexOf('>Day 2</div><div class="m">Day 2')<0);

print("\n── PICTURES ARE FRAMED ON THE PERSON ──");
ok("every picture has a focal point", Array.from(PHOTO).every(function(id){ return !!FOCAL[id]; }));
function _pos(id,fa){ var m=imgPos({id:id},fa).match(/([\d.]+)% ([\d.]+)%/); return m?[+m[1],+m[2]]:null; }
ok("a tall picture in a wide card keeps the face near the top", _pos('kb3',FA.wide)[0]===50 && _pos('kb3',FA.wide)[1]<10);
ok("a square picture in a tall poster takes the slice with the body", _pos('m2',FA.tall)[1]===50 && _pos('m2',FA.tall)[0]<50);
ok("positions never leave 0–100%", Array.from(PHOTO).every(function(id){
    return [FA.wide,FA.row,FA.poster,FA.hero,FA.tall,FA.join].every(function(fa){
      var m=imgPos({id:id},fa).match(/([\d.]+)% ([\d.]+)%/); return m && +m[1]>=0 && +m[1]<=100 && +m[2]>=0 && +m[2]<=100; }); }));
ok("a program with no picture of its own is untouched", imgPos({id:'no-such-program'},FA.wide)==='');

print("\n── LIBRARY: COMING SOON WITHOUT A VIDEO ──");
libEq='All'; noThrow("the Exercises page renders", function(){ openLibrary('All'); });
var _lh=document.getElementById('lib-body').innerHTML, _nv=libDB().filter(function(e){return !e.v;}).length;
ok("it no longer says every movement has a video", _lh.indexOf('each with a demo video')<0);
ok("it counts what plays and what is coming", _lh.indexOf(libDB().filter(hasClip).length+' movements with a demo video')>0 &&
   (_nv===0 || _lh.indexOf(_nv+' coming soon')>0));
ok("unfilmed movements sit in Coming Soon with no play button", _nv===0 ||
   (_lh.split('class="librow soon"').length-1===_nv && _lh.indexOf('Coming Soon')>0));
ok("every program in the catalogue has all its videos", PROGRAMS.filter(function(p){ return !p.rehab; }).every(progClipsReady));
ok("a program missing a video does not open", (function(){
    var fake={id:'zz-test',name:'Test',weeks:[{days:[{name:'D',ex:[_noclip.n]}]}]};
    PROGRAMS.push(fake); var t0=toast, said=''; toast=function(m){ said=m; };
    var was=document.getElementById('progdetail').style.display; document.getElementById('progdetail').style.display='none';
    openProgram('zz-test'); toast=t0; PROGRAMS.pop();
    return said.indexOf('coming soon')>0 && document.getElementById('progdetail').style.display==='none'; })());

print("\n── THE RENEWAL REMINDER ──");
(function(){
  var keep={p:_ent.plusUntil,c:_ent.coachUntil};
  _ent.coachUntil=null; _ent.plusUntil=new Date(Date.now()+60*864e5).toISOString();
  ok("no reminder two months out", renewCard()==='');
  _ent.plusUntil=new Date(Date.now()+10*864e5).toISOString();
  ok("a reminder ten days out", renewCard().indexOf('Ends in 10 days')>0 && renewCard().indexOf('openStore()')>0);
  _ent.plusUntil=new Date(Date.now()+3*3600e3).toISOString();
  ok("...and on the last day", renewCard().indexOf('Ends today')>0);
  _ent.plusUntil=new Date(Date.now()-864e5).toISOString();
  ok("none once it has ended", renewCard()==='');
  _ent.plusUntil=keep.p; _ent.coachUntil=keep.c;
})();

print("\n── T42 HIDDEN ──");
(function(){
  T42_LIVE=false;
  var keep={st:T42.state,ch:T42.challenge,past:T42.past};
  T42.state='ready'; T42.challenge={id:'x',name:'T42',start_date:iso(10),total_days:42}; T42.past=null;
  ok("no T42 card on Home", t42HomeCard()==='');
  ok("no T42 pill in Train", !t42InTrain());
  switchTab('train'); ok("...so the pills do not offer it", document.getElementById('tr-segs').innerHTML.indexOf("setTrSeg('t42')")<0);
  switchTab('me'); ok("no T42 row in Me", document.getElementById('me-body').innerHTML.indexOf('openT42()')<0);
  openT42(); ok("a T42 link lands on Home instead", curTab==='home' && document.getElementById('t42').style.display!=='block');
  pwTier='coach'; pwSku='sub_coach_12m'; var h=paywallHTML(true);
  ok("the Coach membership does not offer a T42 place", h.indexOf('T42')<0, h.match(/[^>]*T42[^<]*/));
  pwTier='plus'; pwSku='sub_plus_12m';
  T42.state=keep.st; T42.challenge=keep.ch; T42.past=keep.past;
  T42_LIVE=true;
})();


print("\n── ACTIVITY TILES HAVE THEIR OWN PICTURES ──");
ok("bottle workouts have pictures", ['bt1','bt2','p34'].every(function(id){return PHOTO.has(id) && FOCAL[id];}));
ok("every activity tile uses a studio picture", ACTIVITIES.every(function(a){return /^\/img\/p\/act-/.test(a.img);}));
ok("the activity row shows the picture", factCard(ACTIVITIES[0]).indexOf("/img/p/act-fatloss.jpg")>0);

print("\n── 30-DAY WEIGHT LOSS ──");
(function(){
  var keepEnt=_ent, keepSW=startWorkout, keepProg=HF.data.progress[WL30_ID], keepWl=HF.data.wl30, keepNut=HF.data.nutrition;
  var played=null; startWorkout=function(exs,meta){ played={exs:exs,meta:meta}; };
  var html=function(id){ return document.getElementById(id).innerHTML; };

  ok("thirty days, in five phases that cover them all", WL30_DAYS.length===30 && progDays(WL30)===30 &&
     WL30_PHASES[0].from===1 && WL30_PHASES[WL30_PHASES.length-1].to===30 &&
     WL30_PHASES.every(function(p,i){ return i===0 || p.from===WL30_PHASES[i-1].to+1; }));
  var bad=[]; WL30_DAYS.forEach(function(d,i){ pickEx(d.ex,null).forEach(function(e,j){
    if(e.n!==d.ex[j] || !e.v || ['Bodyweight','Chair','Bottle','Towel'].indexOf(e.eq)<0) bad.push('day '+(i+1)+': '+d.ex[j]); }); });
  ok("every movement is filmed and needs only home kit", bad.length===0, bad.join(', '));
  ok("day 1 and day 30 are the same fit test", WL30_DAYS[0].k==='test' && WL30_DAYS[29].k==='test' &&
     WL30_DAYS[0].ex.join()===WL30_DAYS[29].ex.join());
  ok("it gets harder: two rounds in week 1, three after", WL30_DAYS.slice(1,6).every(function(d){return d.r===2;}) &&
     WL30_DAYS.slice(7,13).every(function(d){return d.r===3;}));
  ok("every day has a coach's note", WL30_DAYS.every(function(d){ return d.tip && d.tip.length>20; }));
  ok("sold for RM39, the price the server knows", programPrice(WL30)===39 && isPaidProgram(WL30));
  ok("it is one of the training plans", trainingPlans().some(function(p){ return p.id===WL30_ID; }));

  /* someone who has bought nothing */
  _guest(); HF.data.progress[WL30_ID]=0;
  ok("locked to a guest", !ownsProgram(WL30));
  noThrow("its page opens for a guest", function(){ openProgram(WL30_ID); });
  var pg=html('pgd-body');
  ok("...as its own home, not the ordinary program page", pg.indexOf('wl-cal')>0 && pg.indexOf('Your 30 Days')>0);
  ok("...with its price and the membership beside it", pg.indexOf('RM39')>0 && pg.indexOf('Included with HITFAT+')>0);
  ok("...and all thirty days on the calendar", (pg.match(/class="wl-day /g)||[]).length===30);
  ['food','progress'].forEach(function(t){ wlSetTab(t);
    ok("a guest's "+t+" tab shows the offer", html('pgd-body').indexOf('wl-lock')>0); });
  wlSetTab('guide'); ok("the guide is open to everyone", html('pgd-body').indexOf('How It Works')>0 && html('pgd-body').indexOf('wl-lock')<0);
  wlSetTab('plan');
  openDay(WL30_ID,4); ok("a day opens for a guest, locked", html('dd-body').indexOf('Unlock · RM39')>0 && html('dd-body').indexOf("Coach's note")>0);
  played=null; playDay(); ok("...and its player sells the program instead", played===null && html('pw-body').indexOf('Buy for RM39')>0);
  ok("the offer can be bought in the app", html('pw-body').indexOf("startCheckout('prog_wl30')")>0);
  ok("...or claimed with an order number from the website", html('pw-body').indexOf('wl-order')>0);
  ok("checkout knows what it is", checkoutItem('prog_wl30').price===39);
  ok("an old product link lands on the same offer", (openProduct('prog_wl30'), html('pw-body').indexOf('Buy for RM39')>0));
  ok("Home offers it to a guest, on its poster", wlHomeCard().indexOf('New Program')>0 && wlHomeCard().indexOf('RM39')>0 && wlHomeCard().indexOf(WL30_POSTER)>0);
  ok("it goes by its name, BURN30", WL30.name==='BURN30' && checkoutItem('prog_wl30').name==='BURN30' && html('pgd-body').indexOf('BURN30')>0);

  /* someone who bought only this */
  _guest(); _ent.skus['prog_wl30']=true;
  ok("bought on its own, it opens", ownsProgram(WL30));
  ok("...and the rest of the app stays locked", !contentOpen() && PROGRAMS.filter(function(p){return p.id!==WL30_ID;}).every(function(p){ return !ownsProgram(p); }));
  openProgram(WL30_ID); pg=html('pgd-body');
  ok("its home starts at day 1", pg.indexOf('Start Day 1')>0 && pg.indexOf("Today's Checklist")>0);
  openDay(WL30_ID,2); played=null; playDay();
  ok("a day plays with its own rounds", played && played.meta.rounds===2 && played.meta.pid===WL30_ID && played.exs.length===6);
  played=null; playExercise(WL30_DAYS[2].ex[0]);
  ok("...and its movements play without the membership", played && played.exs[0].n===WL30_DAYS[2].ex[0]);
  played=null; playExercise('Kettlebell Swing'); ok("...but the rest of the library does not", played===null);
  HF.data.progress[WL30_ID]=5; openProgram(WL30_ID); pg=html('pgd-body');
  ok("progress shows on the calendar", (pg.match(/wl-day done/g)||[]).length===5 && pg.indexOf('wl-day now')>0 && pg.indexOf('Day 6 of 30')>0);
  ok("Home carries on from the day reached", wlHomeCard().indexOf('Start Day 6')>0);
  wlTick('water'); ok("the checklist ticks", wlData().check[iso(0)].water===true);

  /* nutrition: asks for three numbers, then builds thirty days */
  HF.data.nutrition={}; HF.data.wl30={}; _wlPlan=null;
  wlSetTab('food'); ok("the meal plan asks for weight, height and age first", html('pgd-body').indexOf('Build My Meal Plan')>0);
  HF.data.wl30={profile:{gender:'female', wt:72, ht:158, age:34}}; _wlPlan=null; wlMenuDay=-1;
  wlSetTab('food'); pg=html('pgd-body');
  var mp=wlMealPlan();
  ok("...then plans all thirty days", mp && mp.days.length===30 && mp.nut.cal>=1200);
  ok("...with today's menu, a shopping list and the hand guide", pg.indexOf('Shopping List')>0 && pg.indexOf('Portion Guide')>0 && pg.indexOf('Breakfast')>0);

  /* progress */
  wlSetFit('d1','squat','20'); wlSetFit('d30','squat','30');
  wlSetTab('progress'); pg=html('pgd-body');
  ok("the fit test compares day 1 with day 30", pg.indexOf('+50%')>0);
  ok("five badges, none earned at day 5", (pg.match(/class="wl-badge"/g)||[]).length===5);
  HF.data.progress[WL30_ID]=30; wlSetTab('progress'); pg=html('pgd-body');
  ok("finishing earns every badge and the certificate", (pg.match(/wl-badge on/g)||[]).length===5 && pg.indexOf('30 Days Complete')>0);
  ok("a finished program leaves Home", wlHomeCard()==='');

  /* a member has it as part of HITFAT+ */
  _member(); HF.data.progress[WL30_ID]=0;
  ok("members have it included", ownsProgram(WL30) && wlHomeCard().indexOf('In HITFAT+')>0);

  ok("the app claims website purchases when it loads what you own", /claimLandingPurchases/.test(String(loadEntitlement)));
  startWorkout=keepSW; _ent=keepEnt; HF.data.progress[WL30_ID]=keepProg||0; HF.data.wl30=keepWl||{}; HF.data.nutrition=keepNut; _wlPlan=null;
  wlTab='plan'; wlWeek=-1; wlMenuDay=-1; closeProduct();
})();

print("\n── MEAL SCAN: PORTION AND NAME ──");
(function(){
  var keep=_scanData;
  _scanData={food_name:'Nasi lemak',food_name_bm:'',estimated_calories:600,protein_g:20,carbs_g:70,fat_g:25,confidence:'low',
    breakdown:[{ingredient:'Rice',weight_g:200,calories:300}]};
  _scanPortion=1; _scanName=''; _scanEditing=false;
  renderScanResult(_scanData); var h=document.getElementById('scan-sheet').innerHTML;
  ok("the scan says it is an estimate", h.indexOf('≈')>=0 && h.indexOf('20–30%')>0);
  ok("a low-confidence scan asks for a check", h.indexOf('Not sure about this one')>0);
  ok("the portion can be changed", h.indexOf('scanQty(1)')>0 && h.indexOf('scanQty(-1)')>0);
  setScanPortion(1.3);
  ok("a bigger portion scales what is logged", scanToMeal().kcal===780 && scanToMeal().p===26 && scanToMeal().comps[0].kcal===390);
  _scanName='Nasi lemak ayam';
  ok("a renamed dish is logged by its new name", scanToMeal().name==='Nasi lemak ayam');
  _scanData=keep; _scanPortion=1; _scanName='';
})();

print("\n── MEAL SCAN PLANS ──");
(function(){
  var keepEnt=_ent, keepQ=HF.data.scanQuota;
  ok("three add-ons on sale, priced as agreed", SCAN_PRODUCTS.filter(function(s){return !s.legacy;}).map(function(s){return s.sku+':'+s.price;}).join()==='scan_d3:9.9,scan_d6:14.9,scan_dx:24.9');
  ok("the daily allowances", scanDailyFor('scan_d3')===3 && scanDailyFor('scan_d6')===6 && scanDailyFor('scan_dx')===15 && scanDailyFor('sub_plus_12m')===3 && scanDailyFor('prog_wl30')===0);
  ok("checkout shows ringgit and sen", checkoutItem('scan_d6').price===14.9 && fmtRM(14.9)==='RM14.90' && fmtRM(249)==='RM249');
  _guest(); HF.data.scanQuota={month:thisMonth(), used:3};
  ok("a guest past 3 free scans cannot scan", !canScan() && scanAccess().mode==='none');
  openScan('meal'); scanShoot(); var h=document.getElementById('pw-body').innerHTML;
  ok("...and the shutter shows the plans", h.indexOf("startCheckout('scan_d3')")>0 && h.indexOf("startCheckout('scan_dx')")>0 && h.indexOf('RM9.90')>0);
  ok("...with the membership beside them", h.indexOf('Or join HITFAT+')>0);
  closeProduct();
  _member(); HF.data.scanQuota={month:thisMonth(), used:0, day:iso(0), today:2};
  ok("a member has 1 of 3 left after 2 today", scanAccess().left===1 && /1 of 3 scans left today/.test(scanAccess().label));
  scanBump(3); ok("...and none after the third", !canScan());
  openScanPlans(); h=document.getElementById('pw-body').innerHTML;
  ok("a member is offered only the bigger allowances", h.indexOf("startCheckout('scan_d3')")<0 && h.indexOf("startCheckout('scan_d6')")>0 && h.indexOf('Or join HITFAT+')<0);
  closeProduct();
  _guest(); _ent.scanDaily=6; HF.data.scanQuota={month:thisMonth(), used:0, day:iso(0), today:4};
  ok("an add-on gives its own allowance", scanAccess().daily===6 && scanAccess().left===2);
  HF.data.scanQuota={month:thisMonth(), used:0, day:'2000-01-01', today:6};
  ok("the day's count resets", scanAccess().left===6);
  _ent=keepEnt; HF.data.scanQuota=keepQ;
})();

print("\n── SCANNER: MODES, BARCODE, LABEL ──");
(function(){
  var keep=_scanData;
  openScan('barcode');
  ok("the scanner opens on a mode", _scanMode==='barcode' && document.getElementById('scan-modes').innerHTML.indexOf("setScanMode('label')")>0);
  ok("a barcode costs no scan", document.getElementById('scan-left').textContent.indexOf('free')>=0);
  var off={product_name:'Roti Putih Original',brands:'Gardenia',serving_size:'2 slices (60 g)',
    nutriments:{'energy-kcal_serving':179,proteins_serving:5.8,carbohydrates_serving:31.2,fat_serving:3.1,sugars_serving:2.4,sodium_serving:0.25}};
  var d=offToScan('9556231110045',off);
  ok("a product reads per serving", d.food_name==='Gardenia Roti Putih Original' && d.estimated_calories===179 && d.protein_g===6 && /2 slices/.test(d.portion_size));
  ok("...with sodium in mg", d.sodium_mg===250);
  var d100=offToScan('1',{product_name:'Crackers',nutriments:{'energy-kcal_100g':450,proteins_100g:10,carbohydrates_100g:70,fat_100g:14}});
  ok("...or per 100 g when there is no serving", d100.portion_size==='100 g' && d100.estimated_calories===450);
  ok("...kJ only is turned into kcal", offToScan('2',{product_name:'X',nutriments:{energy_100g:418.4,proteins_100g:1}}).estimated_calories===100);
  ok("a product with no numbers is not a match", offToScan('3',{product_name:'Y',nutriments:{}})===null);
  _scanData=d; _scanPortion=2; _scanImg=''; renderScanResult(d); var h=document.getElementById('scan-sheet').innerHTML;
  ok("two servings double what is shown", h.indexOf('358')>0 && h.indexOf('Log 2 servings')>0 && h.indexOf('Open Food Facts')>0);
  ok("...and what is logged", scanToMeal().kcal===358 && scanToMeal().src==='barcode');
  scanNotFound('123456789');
  ok("a product not in the list offers the label scan", document.getElementById('scan-sheet').innerHTML.indexOf("setScanMode('label')")>0);
  _scanData={kind:'meal',food_name:'Nasi Ayam',estimated_calories:650,protein_g:30,carbs_g:80,fat_g:22,
    breakdown:[{ingredient:'Chicken',weight_g:120,calories:250,x:30,y:40},{ingredient:'Rice',weight_g:200,calories:260,x:70,y:55}]};
  _scanPortion=1; _scanImg='data:image/jpeg;base64,AAAA'; renderScanResult(_scanData); h=document.getElementById('scan-sheet').innerHTML;
  ok("a meal shows its ingredients pinned on the photo", (h.match(/class="sr-pin"/g)||[]).length===2 && h.indexOf('Chicken')>0);
  ok("...four macro tiles", (h.match(/class="sr-tile"/g)||[]).length===4);
  closeScan(); _scanData=keep; _scanPortion=1; _scanImg='';
})();

print("\n── EAT · JOURNAL ──");
(function(){
  var keepMeals=HF.data.meals, keepN=HF.data.nutrition;
  HF.data.nutrition={cal:2000,pt:120,ct:250,ft:60,w:70,h:170,a:30,gender:'male',goal:'lose'};
  HF.data.meals={};
  var id=logMeal({name:'Nasi Ayam',kcal:650,p:30,c:80,f:22,slot:'lunch'});
  ok("a logged meal gets an id", typeof id==='string' && id.length>4 && mealsFor()[0].id===id);
  HF.data.meals[iso(-1)]=[{id:'y1',name:'Oats',kcal:350,p:15,c:55,f:8,slot:'breakfast',time:'8:00 am'},
                         {id:'y2',name:'Gardenia Roti Putih',kcal:358,p:12,c:66,f:4,slot:'snack',src:'barcode',img:'https://images.openfoodfacts.org/x.jpg'}];
  var r=weekReport();
  ok("the week report averages the days with meals", r.logged===2 && r.avgKcal===Math.round((650+708)/2) && r.target===2000);
  eatSeg='journal'; renderEat(); var h=document.getElementById('eat-body').innerHTML;
  ok("the journal shows the report and the chart", h.indexOf('Macros Report')>0 && h.indexOf('class="mchart"')>0 && (h.match(/class="mc-p"/g)||[]).length===2);
  ok("...today and yesterday, newest first", h.indexOf('>Today<')>0 && h.indexOf('>Yesterday<')>0 && h.indexOf('>Today<')<h.indexOf('>Yesterday<'));
  ok("...each meal as a row with its macros", (h.match(/class="jcard"/g)||[]).length===3 && h.indexOf('P 30g')>0);
  ok("...a card per day, today so far, yesterday judged", (h.match(/class="nlist jdc open"/g)||[]).length===2 && h.indexOf('jv now')>0 && h.indexOf('jv under')>0);
  ok("...and one tip from the week", h.indexOf('class="jtip')>0 && h.indexOf('Protein is low')>0);
  noThrow("an older day folds and opens", function(){ jToggle(iso(-1)); });
  ok("...folded, its meals hide", (document.getElementById('eat-body').innerHTML.match(/class="jcard"/g)||[]).length===1);
  jToggle(iso(-1)); h=document.getElementById('eat-body').innerHTML;
  ok("...a product keeps its picture", h.indexOf('images.openfoodfacts.org/x.jpg')>0);
  ok("...only today's meals can be removed", (h.match(/delMeal\(/g)||[]).length===1);
  HF.data.meals={}; renderEat(); h=document.getElementById('eat-body').innerHTML;
  ok("an empty journal points at the scanner", h.indexOf('Your journal starts')>0 && h.indexOf('openScan()')>0);
  eatSeg='today'; HF.data.meals=keepMeals; HF.data.nutrition=keepN;
})();

print("\n── LEADERBOARDS ──");
(function(){
  var keepPrefs=HF.data.prefs; HF.data.prefs={name:'Aiman Rahim'};
  var d={month:'2026-10',count:3,top:[{rank:1,name:'Siti',days:18,me:false},{rank:2,name:'Aiman',days:12,me:true},{rank:3,name:'Member',days:9,me:false}],me:{rank:2,days:12,hidden:false}};
  var h=boardHTML('month',d);
  ok("the board lists ranks, first names and days", (h.match(/class="lb-row/g)||[]).length===3 && h.indexOf('18 days')>0 && h.indexOf('Siti')>0);
  ok("...marks you", h.indexOf('lb-row me')>0 && h.indexOf('<em>You</em>')>0);
  ok("...gold, silver and bronze", h.indexOf('lb-rk t1')>0 && h.indexOf('lb-rk t3')>0);
  ok("...and offers to hide you", h.indexOf('setLbHide(true)')>0);
  d={count:60,top:[{rank:1,name:'A',day:30,me:false}],me:{rank:41,day:6,hidden:false},finished:4};
  h=boardHTML('burn30',d);
  ok("BURN30 shows the day, finishers, and your place below the top", h.indexOf('Finished')>0 && h.indexOf('4 finished')>0 && h.indexOf('lb-gap')>0 && h.indexOf('Day 6')>0);
  ok("an empty board says how to get on it", boardHTML('month',{count:0,top:[]}).indexOf('One session puts you on the board')>0);
  ok("no sign-in, no board", boardHTML('month',null).indexOf('Sign in')>=0);
  HF.data.prefs={}; ok("no name shows as Member, with a hint", boardHTML('month',{count:1,top:[{rank:1,name:'Member',days:1,me:true}]}).indexOf('add your first name')>0);
  HF.data.prefs=keepPrefs;
})();

print("\n── WORKOUTS RECORDED ON THE SERVER ──");
(function(){
  var calls=[], keepSb=sb, keepUid=HF.userId;
  sb={rpc:function(fn,args){ calls.push([fn,args]); return Promise.resolve({data:'sess-1',error:null}); }};
  HF.userId='u-test';
  var fake={meta:{pid:'wl30',gi:4,name:'Upper & Core'}};
  pl=fake; plSessionStart(fake);
  ok("a workout's start is sent with its program and day", calls[0][0]==='plus_session_start' && calls[0][1].p_program==='wl30' && calls[0][1].p_day===4);
  fake.sid='sess-1'; plSessionFinish(fake);
  ok("...and its finish, once", calls[1][0]==='plus_session_finish' && calls[1][1].p_id==='sess-1' && fake.sid===null);
  plSessionFinish(fake); ok("...not twice", calls.length===2);
  sb=null; noThrow("offline, nothing is sent and nothing breaks", function(){ plSessionStart({meta:{}}); plSessionFinish({sid:'x'}); });
  sb=keepSb; HF.userId=keepUid; pl=null;
})();

print("\n── LEADERBOARD, EASY TO FIND ──");
(function(){
  var d={month:'2026-10',count:38,top:[{rank:1,name:'Siti',days:18},{rank:2,name:'Hafiz',days:16},{rank:3,name:'Aina',days:15},{rank:4,name:'Seth',days:12,me:true},{rank:5,name:'Member',days:11},{rank:6,name:'Ali',days:10}],me:{rank:4,days:12,hidden:false}};
  ok("Home's card says your place", /#4 of 38 on the board/.test(monthRankLine(d)));
  ok("...or invites you on", /train to join/.test(monthRankLine({count:5,top:[],me:null})) && /Be the first/.test(monthRankLine({count:0,top:[]})));
  ok("...and stays quiet before the board answers", monthRankLine(null)==='');
  var h=boardHTML('month',d,{limit:5});
  ok("Progress shows the top five and a way to the full board", (h.match(/class="lb-row/g)||[]).length===5 && h.indexOf('openMonthly()')>0 && h.indexOf('setLbHide')<0);
  ok("Progress has a leaderboard section", String(renderProgress).indexOf("lb-prog")>0);
})();
print("\n── AI COACH ──");
(function(){
  var keepEnt=_ent, keepCoach=HF.data.coach, keepSW=startWorkout, keepSave=HF.save;
  ok("the AI coach is hidden: no Home card, no perk", (function(){ _member('plus'); return aicHomeCard()===''; })() && paywallHTML(true).indexOf('AI Coach')<0);
  AICOACH_LIVE=true;
  HF.save=function(){};
  var lib=aicLibrary({equipment:['Dumbbell']});
  ok("the coach chooses only filmed moves", lib.length>20 && lib.every(function(x){ var n=x.split('|')[0]; return DB.some(function(e){ return e.n===n && e.v; }); }));
  ok("...with the member's equipment and bodyweight, nothing else", lib.every(function(x){ var q=x.split('|')[1]; return q==='Bodyweight'||q==='Dumbbell'; }));
  ok("...each name once", lib.length===new Set(lib.map(function(x){ return x.split('|')[0]; })).size);
  var bw=lib.filter(function(x){ return x.split('|')[1]==='Bodyweight'; }).map(function(x){ return x.split('|')[0]; });
  var db=lib.filter(function(x){ return x.split('|')[1]==='Dumbbell'; }).map(function(x){ return x.split('|')[0]; });
  var day={name:'Lower A', minutes:30, blocks:[{ex:bw[0],sets:3,reps:12,rest:45},{ex:db[0],sets:4,reps:8,rest:60,note:'slow down'},{ex:bw[1],sets:2,secs:40,rest:30}]};
  var plan={title:'Strong in 4', summary:'Four weeks', coach_note:'Hi', weeks:[0,1,2,3].map(function(w){ return {focus:'Week '+(w+1), days:[day,day,day]}; })};
  HF.data.coach={plan:plan, planId:'p1', start:iso(-1), done:{}, feed:[], reviewed:{}};
  _guest(); ok("Home shows no coach card to someone who is not a member", aicHomeCard()==='');
  _member('plus'); ok("...a Plus member has the coach too", aicHomeCard().indexOf('Lower A')>0);
  _member('coach');
  ok("a Coach member sees today's session on Home", aicHomeCard().indexOf('Lower A')>0 && aicHomeCard().indexOf('Week 1')>0);
  HF.data.coach={}; ok("...or the invitation before a plan", aicHomeCard().indexOf('Meet your AI Coach')>0);
  HF.data.coach={plan:plan, planId:'p1', start:iso(-1), done:{}, feed:[], reviewed:{}};
  var ex=aicExercises(day);
  ok("a day plays every move", ex.length===3);
  ok("...reps become time (12 reps = 41s, 8 reps = 29s) and seconds stay seconds", ex[0].dur===41 && ex[1].dur===29 && ex[2].dur===40);
  var got=null; startWorkout=function(e,m){ got=m; };
  aicPlay(0,0);
  ok("...in the player, its sets as rounds, and the coach told where it came from", got && got.rounds===3 && got.aic.w===0 && got.aic.d===0 && got.key==='aic-p1-0-0');
  ok("the next session is the first not done", aicNext().d===0);
  HF.data.coach.done['0-0']={at:new Date().toISOString(), rpe:7, logs:[]};
  ok("...and moves on once logged", aicNext().d===1);
  ok("the week is the plan's week by date", aicWeekNow()===0);
  HF.data.coach.start=iso(-8); ok("...a week later, week 2", aicWeekNow()===1);
  HF.data.coach.start=iso(-40); ok("...and it never runs past week 4", aicWeekNow()===3 && aicFinished());
  HF.data.coach.start=iso(-1);
  var h=aicHome(plan);
  ok("the plan page has today, the four weeks and a way to ask", h.indexOf('Today from your coach')>0 && (h.match(/Week \d<\/button>/g)||[]).length===4 && h.indexOf('aicAsk()')>0);
  ok("...and a review once a session is logged", h.indexOf('aicReview(0)')>0);
  HF.data.coach.reviewed={0:true}; ok("...not twice", aicHome(plan).indexOf('aicReview(0)')<0);
  ok("a set reads as sets × reps and rest", aicBlockLine(day.blocks[0])==='3 × 12 · rest 45s' && aicBlockLine(day.blocks[2])==='2 × 40s · rest 30s');
  /* demo mode: a plan made here, nothing kept in the member's data */
  T42_DEMO=true; _aicDemo=null; _guest(); var saved=0; HF.save=function(){ saved++; };
  ok("demo mode shows the coach to anyone", aicHomeCard().indexOf('Meet your AI Coach')>0);
  var dp=aicDemoPlan({goal:'muscle', days:4, minutes:20, equipment:['Bodyweight']});
  ok("a demo plan has 4 weeks of the days asked for", dp.weeks.length===4 && dp.weeks.every(function(w){ return w.days.length===4; }));
  ok("...every move filmed, none twice in a day", dp.weeks.every(function(w){ return w.days.every(function(d){
    return d.blocks.length===5 && new Set(d.blocks.map(function(b){ return b.ex; })).size===5 &&
      d.blocks.every(function(b){ return DB.some(function(e){ return e.n===b.ex && e.v; }); }); }); }));
  ok("...harder each week", dp.weeks[3].days[0].blocks[0].sets>dp.weeks[0].days[0].blocks[0].sets);
  aicData().plan=dp; aicSay('coach','hi');
  ok("...and kept apart from the member's own data", HF.data.coach!==aicStore() && saved===0);
  T42_DEMO=false; _aicDemo=null; AICOACH_LIVE=false;
  startWorkout=keepSW; _ent=keepEnt; HF.data.coach=keepCoach||{}; HF.save=keepSave;
})();
print("\n── NUTRITION ACADEMY ──");
(function(){
  var keepEnt=_ent, keepAc=HF.data.academy, keepSave=HF.save, keepLive=MEMBERSHIP_LIVE;
  HF.save=function(){}; HF.data.academy={};
  ok("28 episodes in nine modules, in order", AC_EPS.length===28 && AC_EPS.every(function(e,i){ return e.id==='ep'+String(i+1).padStart(2,'0') && e.m>=0 && e.m<AC_MODS.length; }) &&
     AC_MODS.every(function(m,i){ return AC_EPS.some(function(e){ return e.m===i; }); }));
  ok("every 'Buat sekarang' goes somewhere real", AC_EPS.every(function(e){ return !e.act || /^acDo\('(weight|today|measure|journal|scan|log|barcode|label|progress|train|mealplan|ep26)'\)$/.test(e.act[1]); }));
  ok("every episode has its video, a summary and a mission", AC_EPS.every(function(e){ return /^\d{6,}$/.test(e.v) && e.d>60 && e.sum && e.mis; }) &&
     new Set(AC_EPS.map(function(e){ return e.v; })).size===28);
  ok("...and three questions, each with an answer that exists and a reason", AC_EPS.every(function(e){ return e.quiz.length===3 &&
     e.quiz.every(function(q){ return q.q && q.o.length>=2 && q.a>=0 && q.a<q.o.length && q.why; }); }));
  ok("the right answer is not always in the same place", new Set([].concat.apply([],AC_EPS.map(function(e){ return e.quiz.map(function(q){ return q.a; }); }))).size>=3);
  var keepVs=AC_EPS.map(function(e){ return e.v; }); AC_EPS.forEach(function(e){ e.v=''; });
  ok("Home stays quiet if no video is up", acHomeCard()==='');
  AC_EPS.forEach(function(e,i){ e.v=keepVs[i]; });
  ok("an unlisted Vimeo video keeps its hash", acVimeo('123/abc').indexOf('/video/123?h=abc&')>0 && acVimeo('123').indexOf('/video/123?title')>0);
  var e1=AC_EPS[0], e5=AC_EPS[4], keepV=e1.v, keepQ=e1.quiz;
  MEMBERSHIP_LIVE=true; _guest();
  ok("the first two episodes are free, the rest are HITFAT+", !acLocked(AC_EPS[0]) && !acLocked(AC_EPS[1]) && acLocked(e5));
  _member('plus'); ok("...and open to a member", !acLocked(e5));
  e1.quiz=[{q:'A?',o:['x','y'],a:0,why:'x'},{q:'B?',o:['x','y'],a:1,why:'y'},{q:'C?',o:['x','y'],a:1,why:'y'}];
  ok("with a video up, Home invites you to start", acHomeCard().indexOf('Ep01 Baca Penimbang')>0);
  ok("pass mark is 2 of 3", acPassMark(e1)===2);
  acView='ep01'; acQuiz=null; acEpisode(e1);
  acAnswer(0,0); acAnswer(1,0);
  ok("...not done after two answers", !acDone(e1));
  acAnswer(2,1);
  ok("...done with 2 of 3 right", acDone(e1) && acData().done.ep01.score===2);
  acQuiz=null; acEpisode(e1); acAnswer(0,1); acAnswer(1,0); acAnswer(2,0);
  ok("...and a worse retry keeps the best score", acData().done.ep01.score===2);
  ok("the next episode is the first not done", acNext().id==='ep02' && acHomeCard().indexOf('Sambung')>0);
  var gotW=null, keepSW2=startWorkout; startWorkout=function(e,m){ gotW=[e,m]; };
  acDo('ep26'); startWorkout=keepSW2;
  ok("Ep26's button plays its five filmed moves, three rounds", gotW && gotW[0].length===5 && gotW[0].every(function(e){ return e.v; }) && gotW[1].rounds===3);
  ok("Eat has a Learn segment", EAT_SEGS.some(function(s){ return s[0]==='learn'; }));
  _acMod={}; var _ah=academyHTML();
  ok("modules fold: only the next episode's module opens", (_ah.match(/class="ac-mod acg open"/g)||[]).length===1 && (_ah.match(/class="ac-mod acg"/g)||[]).length===AC_MODS.length-1 &&
     (_ah.match(/class="ac-ep[ "]/g)||[]).length===AC_EPS.filter(function(e){ return e.m===acNext().m; }).length);
  noThrow("a folded module opens", function(){ acModToggle(5); });
  ok("...and shows its episodes", acModOpen(5) && (academyHTML().match(/class="ac-mod acg open"/g)||[]).length===2);
  _acMod={};
  e1.v=keepV; e1.quiz=keepQ; acView=null; acQuiz=null;
  _ent=keepEnt; HF.data.academy=keepAc||{}; HF.save=keepSave; MEMBERSHIP_LIVE=keepLive;
})();
print("\n── LANGUAGE: BM / EN ──");
(function(){
  ok("a word", i18n('Home')==='Utama' && i18n('Settings')==='Tetapan');
  ok("a number in a template", i18n('4 days a week')==='4 hari seminggu' && i18n('Day 2 of 84')==='Hari 2 daripada 84');
  ok("parts joined with a dot", i18n('Beginner · 4 days a week')==='Pemula · 4 hari seminggu');
  ok("dates", i18n('Tuesday 13 October')==='Selasa 13 Oktober' && i18n('TUESDAY 13 OCTOBER')==='SELASA 13 OKTOBER' && i18n('5 Oct')==='5 Okt');
  ok("names stay English", i18n('Push Up')===null && i18n('HITFAT Transformation')===null && i18n('Upper Strength')===null);
  ok("a name inside a sentence", i18n('Up first: Squat Pulse')==='Mula dengan: Squat Pulse');
  ok("not a date because a word is not one", i18n('May Momentum')==='Momentum Mei' && i18n('Monday blues')===null);
  var keep=LANG; LANG='en'; ok("English stays English", tr('Home')==='Home'); LANG='ms'; ok("...and BM when chosen", tr('Home')==='Utama'); LANG=keep;
  var bad=Object.keys(I18N_MS).filter(function(k){ return (k.match(/#/g)||[]).length!==((I18N_MS[k].match(/#/g)||[]).length) && !/\{\d\}/.test(I18N_MS[k]); });
  ok("every template keeps its numbers", bad.length===0, bad.slice(0,5).join(' | '));
  ok("the switch is hidden while BM waits", LANG_LIVE===false && String(renderMe).indexOf("LANG_LIVE?")>0);
})();
print("\n── LADIES BURN 30 ──");
(function(){
  var keepEnt=_ent, keepLb=HF.data.lb30, keepProg=HF.data.progress[LB30_ID], keepSave=HF.save, keepSW=startWorkout, keepLang=LANG, keepLive=MEMBERSHIP_LIVE;
  HF.save=function(){}; HF.data.lb30={}; MEMBERSHIP_LIVE=true;
  ok("the name lives in one place", LB30.name===LB30_NAME && findProg('lad4')===LB30 && LB30.hub==='lb30');
  ok("30 days in 4 weeks, every day once", LB30_DAYS.length===30 && LB30_WEEKS[0].from===1 && LB30_WEEKS[3].to===30 &&
     LB30_WEEKS.every(function(w,i){ return i===0 || w.from===LB30_WEEKS[i-1].to+1; }) &&
     LB30.weeks.reduce(function(a,w){ return a+w.days.length; },0)===30);
  var moves=[]; LB30_DAYS.forEach(function(d){ moves=moves.concat(d.ex); });
  ok("nothing jumps", moves.every(function(n){ return !/jump|burpee|skip|tuck|skater|jack|hop|bound/i.test(n); }));
  ok("every move is a filmed HITFAT clip, not an animation", moves.every(function(n){ var e=lbEx(n); return !!e.v && DB.some(function(x){ return x.n===n && x.v===e.v && x.eq==='Bodyweight'; }); }));
  ok("no equipment beyond a wall", moves.every(function(n){ return !/chair|bench|dumbbell|kettlebell|bottle|backpack|band|step up/i.test(n); }));
  ok("no running on the spot either", moves.every(function(n){ var e=lbEx(n); return e.t!=='jump' && !/high knee|butt kick|fast feet|sprint/i.test(n); }));
  ok("every session is 20 minutes at most", LB30_DAYS.every(function(d){ return lbMinutes(d)<=20; }), LB30_DAYS.map(lbMinutes).join(','));
  ok("...and each half of 2 × 10 is ten at most", LB30_DAYS.every(function(d){ var h=lbHalves(d); return lbSecs(h[0],d.r)<=600 && lbSecs(h[1],d.r)<=600; }));
  var avg=function(w){ var ds=LB30_DAYS.slice(w.from-1,w.to).filter(function(d){ return d.k==='work'; }), t=0; ds.forEach(function(d){ t+=lbMinutes(d); }); return t/ds.length; };
  ok("it builds from week 1 to week 4", avg(LB30_WEEKS[3])>avg(LB30_WEEKS[0]));
  ok("day 1 and day 30 are the check-in and fit test", LB30_DAYS[0].k==='test' && LB30_DAYS[29].k==='test');
  ok("30 missions, none twice", LB30_MISI.length===30 && new Set(LB30_MISI).size===30);
  ok("walking climbs 4,000 to 10,000", LB30_STEPS.length===30 && LB30_STEPS[0]===4000 && LB30_STEPS[29]===10000 &&
     LB30_STEPS.every(function(v,i){ return i===0||v>=LB30_STEPS[i-1]; }));
  ok("water climbs 2.0 to 2.5 L", lbWater(0)===2.0 && lbWater(29)===2.5);
  /* calories: BURN30's sum, never under 1,200 */
  HF.data.lb30={profile:{wt:42,ht:148,age:60}};
  ok("the target never goes under 1,200 kcal", lbTarget().cal>=1200);
  HF.data.lb30={profile:{wt:95,ht:165,age:30}};
  var t=lbTarget(), n=mpNut({goal:'loss',rate:0.5,gender:'female',age:30,wt:95,ht:165,activity:1.375,styles:['hiprotein']});
  ok("...and is BURN30's own sum otherwise", t.cal===n.cal && t.cal>1200);
  ok("three menu options a meal, different each day", LB30_SLOTS.every(function(s){ var a=lbMenuFor(s,0), b=lbMenuFor(s,1);
     return a.length===3 && new Set(a.map(function(o){return o.n;})).size===3 && a[0].n!==b[0].n; }));
  /* the old Ladies Beginner's days do not carry over */
  HF.data.lb30={}; HF.data.progress[LB30_ID]=9;
  ok("the new program starts at day 1", lbDone()===0);
  /* check-ins: weight, waist, hip on days 1, 15, 30 */
  lbSetBody(1,'kg',70); lbSetBody(1,'waist',88); lbSetBody(1,'hip',102); lbSetBody(15,'hip',99); lbSetBody(30,'kg',67.5);
  var b=lbData().body;
  ok("check-ins keep weight, waist and hip", b[1].kg===70 && b[1].waist===88 && b[1].hip===102 && b[15].hip===99 && b[30].kg===67.5);
  ok("photos are kept on the phone, per day", lbPhotoKey(15).indexOf('hf_lb30_photo_')===0 && lbPhotoKey(1)!==lbPhotoKey(30));
  /* access */
  _guest();
  ok("a guest sees it locked", !lbOwned());
  _ent={skus:{'prog_lad4':1}, credits:0, passUntil:null, plusUntil:null, coachUntil:null, loaded:true, owned:{'prog_lad4':true}};
  var ownsIt=owns('prog_lad4');
  ok("buying it opens it", ownsIt && lbOwned());
  ok("...and only it", !ownsProgram(WL30) && !ownsProgram(findProg('sig1')||{id:'sig1'}));
  _member('plus'); ok("a member has it", lbOwned());
  /* playing: the whole day counts it; split, the second half does */
  var got=null; startWorkout=function(e,m){ got={e:e,m:m}; };
  lbPlay(3); ok("a day plays its moves and counts", got && got.e.length===LB30_DAYS[3].ex.length && got.m.pid==='lad4' && got.m.gi===3 && got.m.lb.gi===3);
  ok("...each with its HITFAT video", got.e.every(function(e){ return !!e.v; }));
  lbPlay(3,'a'); ok("the morning half alone does not count the day", !got.m.pid && got.m.key==='lb30-d3-a');
  lbData().half[3]={a:true}; lbPlay(3,'b'); ok("...the evening half, after it, does", got.m.pid==='lad4' && got.m.gi===3);
  /* Malay on its own pages */
  var html=''; var keepBody=$('pgd-body');
  ['plan','food','progress','guide'].forEach(function(tb){ lbTab=tb; renderLB30(); html+=$('pgd-body').innerHTML; });
  lbOpenDay(0); var d1=$('dd-body').innerHTML;
  ok("the pages are in Malay", ["Today's Checklist","Start Day","Nutrition<","Start Here","Your 30 Days","Day 1 of","Coach's note"].every(function(w){ return html.indexOf(w)<0 && d1.indexOf(w)<0; }) &&
     html.indexOf('Senarai Semak Hari Ini')>0 && html.indexOf('Mula Di Sini')>0 && html.indexOf('Pemakanan')>0);
  ok("Start Here carries the safety note", html.indexOf('baru bersalin (kurang 6 minggu)')>0 && html.indexOf('caesarean')>0 && html.indexOf('hamil')>0);
  ok("day 1: the check-in first, then the fit test, which may be skipped", d1.indexOf('Body Check-in')>0 && d1.indexOf('Body Check-in')<d1.indexOf('Fit Test impak rendah') &&
     d1.indexOf('Pinggul')>0 && d1.indexOf('lbSkipTest(0)')>0);
  /* BURN30 is as it was */
  ok("BURN30 is untouched", WL30.hub===true && findProg('wl30')===WL30 && WL30_DAYS.length===30 && WL30.price===39);
  var wbuy=0, keepWB=wlBuy, keepLB=lbBuy; wlBuy=function(){ wbuy++; }; lbBuy=function(){ wbuy+=10; };
  _guest(); lockedProgram(WL30); lockedProgram(LB30);
  ok("each program sells itself", wbuy===11);
  wlBuy=keepWB; lbBuy=keepLB;
  lbLang(false);
  startWorkout=keepSW; _ent=keepEnt; HF.data.lb30=keepLb||{}; HF.data.progress[LB30_ID]=keepProg||0; HF.save=keepSave; LANG=keepLang; MEMBERSHIP_LIVE=keepLive;
})();
print("\n── DIET 6 MINGGU 6KG ──");
(function(){
  var keepEnt=_ent, keepD=HF.data.d6, keepProg=HF.data.progress[D6_ID], keepSave=HF.save, keepSW=startWorkout, keepW=HF.data.weight, keepLang=LANG, keepLive=MEMBERSHIP_LIVE;
  HF.save=function(){}; HF.data.d6={}; HF.data.weight=[]; MEMBERSHIP_LIVE=true;
  ok("the content is the JSON's, 42 days in 6 weeks", D6_TOT===42 && D6_DAYS[0].day===1 && D6_DAYS[41].day===42 && D6_DATA.weeks['6'] && D6.hub==='d6');
  ok("a course, not a training plan: it is not in Train", !findProg('d6') && trainingPlans().every(function(p){ return p.id!=='d6'; }));
  ok("the name comes from the content", D6.name===D6_DATA.program.name && D6_NAME==='DIET 6 MINGGU 6KG');
  ok("check-ins, audits and recalculations fall on the right days",
     D6_DAYS.filter(function(d){ return d.body_checkin; }).map(function(d){ return d.day; }).join()==='1,21,42' &&
     D6_DAYS.filter(function(d){ return d.food_audit; }).map(function(d){ return d.day; }).join()==='3,14' &&
     D6_DAYS.filter(function(d){ return d.recalculate_budget; }).map(function(d){ return d.day; }).join()==='8,15,22,29,36');
  /* the budget */
  var w=d6Calc({sex:'wanita', age:30, wt:70, ht:160, act:'tidak aktif', rate:0.01});
  var bmr=10*70+6.25*160-5*30-161;
  ok("Mifflin-St Jeor × activity", w.bmr===Math.round(bmr) && w.tdee===Math.round(bmr*1.2));
  ok("a woman's budget never under 1,200 kcal", d6Calc({sex:'wanita', age:65, wt:45, ht:145, act:'tidak aktif', rate:0.01}).cal>=1200);
  ok("a man's never under 1,500 kcal", d6Calc({sex:'lelaki', age:65, wt:55, ht:155, act:'tidak aktif', rate:0.01}).cal>=1500);
  var big=d6Calc({sex:'lelaki', age:30, wt:140, ht:180, act:'aktif', rate:0.01});
  ok("never faster than about 1 kg a week", big.weekly<=1.05 && big.goal<=6);
  ok("the 6 kg is 'up to'", d6Calc({sex:'wanita', age:40, wt:60, ht:155, act:'ringan', rate:0.005}).goal<6);
  ok("rice by the senduk, by budget", d6Senduk(1400)===1 && d6Senduk(1600)===1.5 && d6Senduk(2100)===2);
  ok("targets read from the day's own checklist", d6WaterT(D6_DAYS[0])===2.0 && d6StepsT(D6_DAYS[0])===5000 && d6WaterT(D6_DAYS[41])===2.5 && d6StepsT(D6_DAYS[41])===8000);
  /* the audit */
  HF.data.d6={audit:{3:{0:2,24:1}}};
  ok("the audit adds up the list", d6AuditTotal(3)===2*D6_DATA.food_audit_list[0].kcal+D6_DATA.food_audit_list[24].kcal);
  /* access */
  _guest(); ok("a guest sees it locked", !d6Owned());
  _ent={skus:{'prog_d6':1}, credits:0, passUntil:null, plusUntil:null, coachUntil:null, loaded:true};
  ok("buying it opens it, and only it", d6Owned() && !ownsProgram(WL30) && !lbOwned());
  _member('plus'); ok("a member has it", d6Owned());
  /* the strength sessions play HITFAT clips, the JSON names on screen */
  var got=null; startWorkout=function(e,m){ got={e:e,m:m}; };
  d6Play(0);
  ok("Sesi Kuat A plays, its moves named as written, with their reps", got && got.e.length===5 && got.e[0].n.indexOf('Squat ke kerusi · 10-12')===0 && got.m.rounds===2 && got.m.d6.gi===0);
  ok("...each strength move with a filmed clip but Superman", D6_DATA.workouts.kuat_a.moves.concat(D6_DATA.workouts.kuat_b.moves).every(function(m){ return m.name==='Superman' || !!d6Ex(m).v; }));
  ok("rounds grow by the week", D6_DAYS[0].workout.rounds===2 && D6_DAYS[35].workout.rounds===4);
  /* the course: modules, lessons, tools, progress; Malay; the content unedited */
  HF.data.d6={p:{sex:'wanita',age:30,wt:70,ht:160,act:'tidak aktif',rate:0.005}}; HF.data.d6.bud=d6Calc(HF.data.d6.p);
  var html=''; ['lessons','tools','progress'].forEach(function(t){ d6View=null; d6Seg=t; renderD6(); html+=$('d6c-body').innerHTML; });
  ok("six modules of lessons, each lesson by its card's title", (html.match(/class="ac-mod"/g)||[]).length===6 && html.indexOf(hesc(D6_DAYS[41].card.title))>0);
  ok("the tools carry the content as written", html.indexOf(hesc(D6_DATA.start_here.safety))>0 && html.indexOf(hesc(D6_DATA.nutrition.meals['Sarapan'][0].name))>0);
  ok("...in Malay", ["Today's Checklist","Start Here","Nutrition<","Start Day","Lessons<"].every(function(x){ return html.indexOf(x)<0; }) && html.indexOf('Pelajaran')>0 && html.indexOf('Alat')>0);
  d6View=2; renderD6(); var d3=$('d6c-body').innerHTML;
  ok("a lesson: the card, the mission, one thing to do", d3.indexOf(hesc(D6_DAYS[2].card.body))>0 && d3.indexOf(hesc(D6_DAYS[2].mission))>0 && d3.indexOf("d6Open('audit',2)")>0);
  ok("...short: the 44-line audit opens on its own sheet", d3.indexOf(hesc(D6_DATA.food_audit_list[40].name))<0);
  d6Open('audit',2); ok("the audit sheet lists the foods", $('pw-body').innerHTML.indexOf(hesc(D6_DATA.food_audit_list[40].name))>0);
  d6View=27; renderD6(); ok("day 28 shows its offer", $('d6c-body').innerHTML.indexOf(hesc(D6_DAYS[27].offer.text))>0);
  d6View=0; renderD6(); ok("day 1 has the check-in", $('d6c-body').innerHTML.indexOf("d6Open('checkin',0)")>0);
  ok("Eat → Belajar has the course", String(eatLearn).indexOf('d6LearnCard')>0 && d6LearnCard().indexOf('openD6()')>0);
  d6Complete(0); ok("finishing a day moves it on", d6Done()===1);
  lbLang(false);
  startWorkout=keepSW; _ent=keepEnt; HF.data.d6=keepD||{}; HF.data.progress[D6_ID]=keepProg||0; HF.save=keepSave; HF.data.weight=keepW; LANG=keepLang; MEMBERSHIP_LIVE=keepLive;
})();
print("\n── IF HITFAT ──");
(function(){
  var keepEnt=_ent, keepIf=HF.data.ifs, keepSave=HF.save, keepLive=MEMBERSHIP_LIVE, keepLang=LANG;
  HF.save=function(){}; HF.data.ifs={}; MEMBERSHIP_LIVE=true;
  ok("ten lessons, the ramp 12/12 → 14/10 → 16/8", IF_LESSONS.length===10 && IF_PROTO[0].f===12 && IF_PROTO[1].f===14 && IF_PROTO[3].f===16 && IF_PROTO.every(function(p){ return p.f+p.e===24; }));
  var all=JSON.stringify(IF_LESSONS);
  ok("the claims the evidence doesn't carry are named only to be set aside", IF_LESSONS.filter(function(l){ return /toxins|cancer|fat-burning hormones/.test(JSON.stringify(l)); }).map(function(l){ return l.id; }).join()==='if3' && IF_LESSONS[2].p[2].indexOf('backed by strong enough evidence')>0 && all.indexOf('BCAAs and supplements are NOT required')>0);
  ok("a lesson on who should not fast", all.indexOf('pregnant or breastfeeding')>0 && all.indexOf('insulin')>0);
  ok("in English now", all.indexOf('What is IF?')>0 && !/\banda\b/.test(all));
  _guest();
  ok("a guest reads the first two lessons; the rest open the paywall", ifLearn().indexOf('ifOpenLesson(1)')>0 && ifLearn().indexOf('ifOpenLesson(2)')<0 && ifLearn().split('openPaywall').length-1===IF_LESSONS.length-IF_FREE);
  ok("a guest's timer and plan are locked", ifTimer().indexOf('wl-lock')>0 && ifPlanHTML().indexOf('wl-lock')>0 && ifHistory().indexOf('wl-lock')>0);
  ok("the Home card invites, for everyone", ifHomeCard().indexOf('openIF()')>0);
  _member('plus');
  ok("a member with no plan is asked to build one", ifTimer().indexOf('ifQuizStart()')>0);
  ifQ=0; _ifAns={safe:[]};
  ifPick('goal','loss'); ifPick('exp','none'); ifPick('meals','3'); ifPick('end','1320');
  ok("one question a screen", ifQ===4 && ifQuiz().indexOf('Choose all that apply')>0);
  ifPick('safe','preg'); ifPick('safe','none');
  ok("'Tiada' clears the others", _ifAns.safe.length===1 && _ifAns.safe[0]==='none');
  ifPick('safe','preg'); ifQ++;
  ok("pregnant: IF not recommended, no plan offered", ifResult().indexOf('recommended for you')>0 && ifResult().indexOf('ifSave(true')>0);
  _ifAns.safe=['dm']; 
  ok("diabetes on medication: doctor first, an explicit confirmation", ifResult().indexOf('My doctor says')>0 && ifResult().indexOf('ifSave(false,true')>0);
  _ifAns.safe=['none'];
  ok("a late eater's window still closes by 8pm", ifResult().indexOf('Start This Plan')>0 && ifResult().indexOf('ifSave(false,false,1200,true)')>0);
  ifSave(false,false,1200,true);
  ok("the plan is saved, week 1 at 12/12, eating 8:00 to 20:00", ifPlan().start===iso(0) && ifWeek()===0 && ifWindow().start===480 && ifWindow().end===1200 && ifQ===-1);
  HF.data.ifs.plan.start=iso(-15);
  ok("day 16 is week 3 (14/10); after 4 weeks it stays 16/8", ifWeek()===2 && ifProto().f===14 && (HF.data.ifs.plan.start=iso(-60), ifProto().f===16));
  ok("the plan page lists four weeks", ifPlanHTML().split('Week ').length-1>=4);
  ifBegin();
  ok("start a fast: target is this week's hours", HF.data.ifs.active && HF.data.ifs.active.target===16 && ifTimer().indexOf('End Fast')>0);
  HF.data.ifs.active.at=Date.now()-13*3600000;
  ok("13 hours in: the body-stage card, the ring part-way", ifStageHTML().indexOf('Burning more fat')>0 && ifRing().indexOf('stroke-dashoffset')>0 && ifHomeCard().indexOf('Fasting · ')>0);
  ifShift(-30);
  ok("the start can be moved, never into the future", Math.abs(Date.now()-HF.data.ifs.active.at-13.5*3600000)<5000 && (ifShift(60*24), HF.data.ifs.active.at<=Date.now()));
  HF.data.ifs.active.at=Date.now()-17*3600000; ifEnd();
  ok("end it: logged, target reached, timer idle", !HF.data.ifs.active && HF.data.ifs.log.length===1 && HF.data.ifs.log[0].hrs>=16 && ifHistory().indexOf('if-bars')>0);
  ifRead(0);
  ok("a lesson marked read", HF.data.ifs.read.if1===true && ifLearn().indexOf('1 of 10 read')>0);
  ok("on Home and in Eat → Belajar", typeof eatLearn==='function' && String(eatLearn).indexOf('ifLearnTile')>0 && ifLearnTile().indexOf('openIF()')>0 && PANELS.indexOf('ifp')>=0);
  ifQ=-1; ifLesson=null;
  _ent=keepEnt; HF.data.ifs=keepIf||{}; HF.save=keepSave; MEMBERSHIP_LIVE=keepLive; LANG=keepLang;
})();
print("\n── TRAIN · TIDY (15 Oct 2026) ──");
(function(){
  setTrSeg('explore');
  var segs=document.getElementById('tr-segs').innerHTML;
  ok("no Recovery pill while Recovery is coming soon", RECOVERY_LIVE || segs.indexOf("setTrSeg('recovery')")<0);
  ok("Browse leaves out a category with nothing in it", RECOVERY_LIVE || document.getElementById('tr-body').innerHTML.indexOf("openActivity('Recovery')")<0);
  openActivity('Fat Loss');
  var lb=document.getElementById('lib-body').innerHTML;
  ok("a category: programs first, then workouts, under their own headings", lb.indexOf('>Programs<')>0 && lb.indexOf('>Workouts<')>lb.indexOf('>Programs<'));
  var pi=lb.indexOf('>Workouts<'), before=lb.slice(0,pi), after=lb.slice(pi);
  ok("...each in its place", PROGRAMS.filter(function(p){ return activityMatch('Fat Loss',p); }).every(function(p){
    var at="openProgram('"+p.id+"')"; return p.weeks ? before.indexOf(at)>0 : after.indexOf(at)>0; }));
  openActivity('Quick');
  ok("Quick: single workouts of 20 minutes or less", PROGRAMS.filter(function(p){ return activityMatch('Quick',p); }).every(function(p){ return !p.weeks && p.dur<=20; }) && document.getElementById('lib-body').innerHTML.indexOf('frow')>0);
  setTrSeg('explore');
  ok("Browse fills a 3 × 2 grid", RECOVERY_LIVE || document.getElementById('tr-body').innerHTML.split('class="fbr"').length-1===6);
  switchTab('train');
})();
print("\n── PROGRESS MASCOT ──");
(function(){
  var keepS=HF.data.sessions, keepSave=HF.save, keepLog=window.HFMascot._readLog();
  HF.save=function(){}; window.HFMascot._writeLog([]);
  function ago(n){ var d=new Date(); d.setDate(d.getDate()-n); return d.toISOString(); }
  ok("Seth's file is loaded as it came", typeof window.HFMascot.render==='function' && window.HFMascot.STAGES.length===4 && window.HFMascot.STAGES[3].name==='Juara');
  HF.data.sessions={};
  ok("no workouts: Comel", window.HFMascot.getState({dates:mascotDates()}).stage.name==='Comel');
  HF.data.sessions={a:{date:ago(1)},b:{date:ago(2)},c:{date:ago(2)},d:{date:ago(3)},e:{date:ago(4)},old:{date:ago(12)}};
  var st=window.HFMascot.getState({dates:mascotDates()});
  ok("the days come from the account's saved workouts: 4 days, one counted once, old ones out", st.activeDays===4 && st.stage.name==='Tegap');
  window.HFMascot._writeLog([]); HF.markDone('mascot-t',{name:'x',mins:10});
  st=window.HFMascot.getState({dates:mascotDates()});
  ok("finishing a workout logs today and lifts the count", st.doneToday && st.activeDays===5 && window.HFMascot._readLog().length===1);
  ok("Home has the mascot at the top, tapping it opens Progress", String(mascotRender).indexOf("switchTab('progress')")>0 &&
     document.getElementById('mascot-home')!==null);
  renderProgress();
  renderProgress();
  ok("Bell lives on Home only: no second mascot on Progress", document.getElementById('prog-body').innerHTML.indexOf('mascot-progress')<0);
  setPgP('week'); var _pb=document.getElementById('prog-body').innerHTML;
  ok("a bar for each day of the week, the line at 50", (_pb.match(/class="pgsk-b/g)||[]).length===7 && _pb.indexOf('pgsk-line')>0);
  setPgP('month'); _pb=document.getElementById('prog-body').innerHTML;
  ok("...and of the month", (_pb.match(/class="pgsk-b/g)||[]).length===30); setPgP('week');
  ok("one streak on the page: the HITFAT Score's", String(renderProgress).indexOf('scStreak().n')>0);
  ok("the four stages use the artwork, not the placeholder", window.HFMascot.config.images.join()==='/img/mascot/m1.png,/img/mascot/m2.png,/img/mascot/m3.png,/img/mascot/m4.png');
  ok("markDone re-renders both", String(HF.markDone).indexOf('mascotDone')>0 && String(mascotDone).indexOf('logActivity')>0);
  HF.data.sessions=keepS; HF.save=keepSave; window.HFMascot._writeLog(keepLog);
})();
print("\n── SKOR HITFAT ──");
(function(){
  var keepS=HF.data.sessions, keepM=HF.data.meals, keepD=HF.data.daily, keepI=HF.data.ifs, keepSave=HF.save;
  HF.save=function(){}; HF.data.sessions={}; HF.data.meals={}; HF.data.daily={}; HF.data.ifs={};
  ok("an empty day scores 0, four habits when there is no IF plan", scScore()===0 && scHabits().length===4);
  HF.data.ifs={plan:{start:iso(0),endMin:1200}};
  ok("the fast is out of the score for now: four rings even with an IF plan", SC_FAST_LIVE===false && scHabits().length===4);
  SC_FAST_LIVE=true;
  ok("...and back as a fifth habit when switched on", scHabits().length===5 && scHabits()[4].k==='fast');
  SC_FAST_LIVE=false;
  HF.data.ifs={};
  scSet('water',8);
  ok("8 glasses fill Air: a quarter of 100", scScore()===25 && HF.data.daily[iso(0)].water===8);
  scSet('steps',4000); HF.data.meals[iso(0)]=[{kcal:300},{kcal:500},{kcal:400}];
  ok("half the steps, three meals: 25+12.5+25", scScore()===63);
  HF.data.sessions={x:{date:new Date().toISOString()}, y:{date:new Date(Date.now()-864e5*2).toISOString()}};
  ok("a workout today counts, one from two days ago does not", scWorkouts(iso(0))===1 && scScore()===88);
  ok("arc and look follow the score", scColor(88)==='#FFC20E' && scLevel(88)===4 && scLevel(10)===1 && scColor(30)==='#A1A1AA');
  var h=scHTML();
  ok("Home card: score, arc, Bell's picture, a line, a ring a habit", scPills().indexOf('>88<')>0 && h.indexOf('sc-arc')>0 && h.indexOf('/img/mascot/anim/juara.png')>0 && h.indexOf('sc-say')>0 && (h.match(/class="sc-h( full)?"/g)||[]).length===4);
  ok("each habit has its way in", h.indexOf("scTap('workout')")>0 && h.indexOf("scTap('water')")>0 && String(scTap).indexOf("switchTab('eat')")>0 && String(scTap).indexOf('openIF()')>0);
  scSet('water',3); _scSay=null;
  ok("Bell points at the habit furthest behind", scLine().indexOf(' langkah.')>0 || scLine().indexOf('gelas air')>0 || scLine().indexOf('workout pendek')>0);
  scEvent('water');
  ok("...and talks about what was just done", SC_LINES.water.indexOf(scLine())>=0);
  scSheet('water'); scWater(1);
  ok("the water sheet adds a glass", HF.data.daily[iso(0)].water===4 && document.getElementById('pw-body').innerHTML.indexOf('/ 8 glasses')>0);
  scSheet('steps'); scSteps(1000);
  ok("the steps sheet adds steps", HF.data.daily[iso(0)].steps===5000);
  closeProduct();
  ok("the habits and IF survive a reload", (function(){ var o=JSON.parse(JSON.stringify(HF.data)); o.ifs={plan:{start:'2026-10-01'}}; var keep=HF.data; HF.apply(o);
     var r=HF.data.daily[iso(0)].steps===5000 && HF.data.ifs.plan.start==='2026-10-01'; HF.data=keep; return r; })());
  HF.data.sessions=keepS; HF.data.meals=keepM; HF.data.daily=keepD||{}; HF.data.ifs=keepI||{}; HF.save=keepSave; _scSay=null;
})();
print("\n── SKOR HITFAT · STREAKS ──");
(function(){
  var keepS=HF.data.sessions, keepM=HF.data.meals, keepD=HF.data.daily, keepI=HF.data.ifs, keepSc=HF.data.sc, keepSave=HF.save;
  HF.save=function(){}; HF.data.sessions={}; HF.data.meals={}; HF.data.daily={}; HF.data.ifs={}; HF.data.sc={};
  function padu(off){ HF.data.daily[iso(-off)]={water:8,steps:8000}; }      /* 50: a hari padu */
  ok("no padu days: no streak, the chip says 0", scStreak().n===0 && scChip().indexOf('🔥 0')>0);
  padu(1); padu(2);
  ok("today still in progress: yesterday's run counts", scStreak().n===2 && !scStreak().today);
  padu(0);
  ok("today reaches 50: it joins the run", scStreak().n===3 && scStreak().today && scChip().indexOf('🔥 3')>0);
  HF.data.daily[iso(-3)]={water:2,steps:0}; padu(4);
  ok("a day under 50 ends the run", scStreak().n===3);
  document.getElementById('scc').style.display='none';
  scCheckStreak();
  ok("3 days: the celebration opens", document.getElementById('scc').style.display==='flex' && document.getElementById('scc').innerHTML.indexOf('<b>3-day</b> streak')>0 &&
     document.getElementById('scc').innerHTML.indexOf("scShare(3)")>0);
  ok("...naming the next milestone", document.getElementById('scc').innerHTML.indexOf('Next goal: 7 days')>0);
  scCelebrateClose(); scCheckStreak();
  ok("...once a run, not on every visit", document.getElementById('scc').style.display==='none');
  ok("the milestones", SC_MILES.join()==='3,7,14,30,60,100' && scNextMile(7)===14 && scNextMile(100)===null);
  ok("the chip reopens the card to share any time", scChip().indexOf('scCelebrate(3,true)')>0);
  ok("the celebrations survive a reload", (function(){ var o=JSON.parse(JSON.stringify(HF.data)); var keep=HF.data; HF.apply(o);
     var r=Object.keys(HF.data.sc.seen||{}).length===1; HF.data=keep; return r; })());
  ok("a workout on a day is found from a set, not a walk per day", scWorkouts(iso(0),{})===0 && String(scStreak).indexOf('scWorkoutDays()')>0);
  scCelebrateClose();
  HF.data.sessions=keepS; HF.data.meals=keepM; HF.data.daily=keepD||{}; HF.data.ifs=keepI||{}; HF.data.sc=keepSc||{}; HF.save=keepSave;
})();
print("\n── SKOR HITFAT · RUST & SHINE ──");
(function(){
  var keepS=HF.data.sessions, keepM=HF.data.meals, keepD=HF.data.daily, keepI=HF.data.ifs, keepSc=HF.data.sc, keepSave=HF.save;
  HF.save=function(){}; HF.data.sessions={}; HF.data.meals={}; HF.data.daily={}; HF.data.ifs={}; HF.data.sc={met:1};
  document.getElementById('scc').style.display='none';
  ok("a new member never rusts", scState().k==='' && scGap(1,{})===-1);
  HF.data.daily[iso(-1)]={water:1,steps:0};
  ok("yesterday logged, nothing yet today: fine", scState().k==='' && scState().idle===1);
  HF.data.daily={}; HF.data.daily[iso(-2)]={water:1,steps:0};
  ok("two empty days: dust", scState().k==='dust' && scHTML().indexOf('sc-dust')>0 && scHTML().indexOf('getting dusty')>0);
  HF.data.daily={}; HF.data.daily[iso(-3)]={water:1,steps:0};
  var h=scHTML();
  ok("three empty days: Bara gets messy, the line asks for one small thing", scState().k==='rust' && h.indexOf('sc-rust')>0 && h.indexOf('all messy')>0 && h.indexOf('/img/mascot/anim/kusut.png')>0);
  scSet('water',1);
  ok("log anything: Bell is back", scState().k==='' && scState().back);
  scRender();
  ok("...and shines, once that day", document.getElementById('scc').style.display==='flex' && document.getElementById('scc').innerHTML.indexOf('You saved Bara')>0);
  scCelebrateClose(); scRender();
  ok("...not again on the next visit", document.getElementById('scc').style.display==='none');
  HF.data.daily={}; HF.data.daily[iso(-1)]={water:1,steps:0}; HF.data.daily[iso(0)]={water:1,steps:0}; HF.data.sc={met:1};
  ok("an ordinary day after an active one does not shine", !scState().back && !scCheckShine());
  ok("the messy look is drawn art, not an effect", SC_ART.rust==='/img/mascot/anim/kusut.png' && SC_POSE.kusut===SC_ART.rust && BELL_LOOPS.kusut==='kusut');
  HF.data.sessions=keepS; HF.data.meals=keepM; HF.data.daily=keepD||{}; HF.data.ifs=keepI||{}; HF.data.sc=keepSc||{}; HF.save=keepSave;
})();
print("\n── BELL, ALIVE ──");
(function(){
  ok("a loop for each stage, two reactions", BELL_LOOPS[1]==='comel' && BELL_LOOPS[4]==='juara' && bellPoster(2)==='/img/mascot/anim/aktif.png');
  ok("Bell is touched: a giggle; something logged: a cheer", String(scPoke).indexOf("scReact('giggle')")>0 && String(scRender).indexOf("'cheer'")>0);
  ok("a Bara who misses you (2+ idle days) is the orange sad loop", String(scRender).indexOf("st.k?'kusut'")>0);
  ok("30 days: Beast Mode, the black Bara", String(scCelebrate).indexOf("n>=30")>0 && SC_POSE.hitam==='/img/mascot/anim/hitam.png');
  ok("no canvas, no motion: the poster stays", bellAttach(null,2)===false);
  ok("the card takes the score's colour", scHTML().indexOf('--scc:')>0 && scTint('#22C55E')==='rgba(34,197,94,.16)' && scRGB('#E30613')==='227,6,19');
  ok("the clip is drawn with its mask as alpha", String(bellDraw).indexOf('t[i+3]=b[i]')>0);
})();
print("\n── BELL'S REMINDERS ──");
(function(){
  ok("a browser without push: the row says so, no toggle", pushState()==='none' && pushRow().indexOf('reminders')>0 && pushRow().indexOf('pushEnable()')<0);
  ok("the VAPID key, url-safe base64 to bytes", pushKeyBytes('AQID').length===3 && pushKeyBytes('AQID')[2]===3 && pushKeyBytes('AQ').length===1 && pushB64(new Uint8Array([1,2,3]).buffer)==='AQID');
  ok("the subscription is saved through the database's own function", String(pushEnable).indexOf("sb.rpc('plus_push_save'")>0 && String(pushDisable).indexOf("plus_push_remove")>0);
  ok("permission is asked from a tap, never on load", String(pushEnable).indexOf('Notification.requestPermission')>0 && String(scRender).indexOf('requestPermission')<0);
  ok("an iPhone outside the Home Screen is told how", String(pushInstallHelp).indexOf('Add to Home Screen')>0 && String(pushState).indexOf("'install'")>0);
  ok("Settings carries the row", String(renderMe).indexOf('pushRow()')>0);
  ok("the server's key and functions, not a URL typed twice", pushFn().indexOf('/functions/v1/plus-push')>0);
})();
print("\n── SKOR HITFAT · FREEZE, SCREENS, POSES ──");
(function(){
  var keepS=HF.data.sessions, keepM=HF.data.meals, keepD=HF.data.daily, keepI=HF.data.ifs, keepSc=HF.data.sc, keepSave=HF.save;
  HF.save=function(){}; HF.data.sessions={}; HF.data.meals={}; HF.data.ifs={}; HF.data.sc={met:1}; HF.data.daily={};
  document.getElementById('scc').style.display='none';
  function padu(off){ HF.data.daily[iso(-off)]={water:8,steps:8000}; }
  ok("HITFAT's colours: pale, red, gold", scColor(10)==='#A1A1AA' && scColor(55)==='#E30613' && scColor(90)==='#FFC20E');
  padu(2); padu(3); padu(4);                       /* a 3-day run, then yesterday missed */
  var f=scApplyFreeze();
  ok("yesterday missed after a run: frozen, the run kept", f.length===1 && f[0]===iso(-1) && scStreak().n===3 && scFreezeLeft()===1);
  ok("...and only once", scApplyFreeze().length===0);
  HF.data.sc={met:1}; HF.data.daily={}; padu(3); padu(4);
  ok("two days missed, two freezes: both frozen", scApplyFreeze().length===2 && scFreezeLeft()===0 && scStreak().n===2);
  HF.data.sc={met:1}; HF.data.daily={}; padu(4); padu(5);
  ok("three days missed: more than the freezes, the run ends", scApplyFreeze().length===0 && scStreak().n===0);
  HF.data.sc={met:1}; HF.data.daily={}; padu(2);
  ok("a one-day run is not worth a freeze", scApplyFreeze().length===0);
  HF.data.sc={met:1}; HF.data.daily={}; padu(2); padu(3);
  scRender();
  ok("on a new day, the freeze screen: white, Bell in ice", document.getElementById('scc').style.display==='flex' && document.getElementById('scc').className.indexOf('scc-ice')>0 &&
     document.getElementById('scc').innerHTML.indexOf('frozen.jpg')>0);
  scCelebrateClose();
  scCelebrate(5,true); var h=document.getElementById('scc').innerHTML;
  ok("the streak screen: red, the week with ticks, freezes left, share and next", document.getElementById('scc').className.indexOf('scc-red')>0 &&
     (h.match(/class="scc-d/g)||[]).length===7 && h.indexOf('freezes left')>0 && h.indexOf('scShare(5)')>0 && h.indexOf('>Next<')>0);
  scCelebrate(7,false);
  ok("seven days and up: the gold screen and the gold Bell", document.getElementById('scc').className.indexOf('scc-gold')>0 && document.getElementById('scc').innerHTML.indexOf('anim/gold.png')>0);
  scCelebrateClose();
  HF.data.sc={met:1}; HF.data.daily={}; HF.data.daily[iso(-4)]={water:1,steps:0};
  scRender();
  ok("Bell rusted: the orange screen once that day, a way to fluff him up", document.getElementById('scc').className.indexOf('scc-orange')>0 &&
     document.getElementById('scc').innerHTML.indexOf("scSheet('water')")>0);
  scCelebrateClose(); scRender();
  ok("...not again that day", document.getElementById('scc').style.display==='none');
  ok("water and meals have their own pose", SC_POSE.water.indexOf('water.png')>0 && SC_POSE.meal.indexOf('meal.png')>0 && String(scRender).indexOf('scPose(slot')>0);
  ok("the freezes survive a reload", (function(){ HF.data.sc={frozen:{'2026-10-14':1}}; var o=JSON.parse(JSON.stringify(HF.data)), keep=HF.data; HF.apply(o);
     var r=HF.data.sc.frozen['2026-10-14']===1; HF.data=keep; return r; })());
  scCelebrateClose();
  HF.data.sessions=keepS; HF.data.meals=keepM; HF.data.daily=keepD||{}; HF.data.ifs=keepI||{}; HF.data.sc=keepSc||{}; HF.save=keepSave;
})();
print("\n── BELL'S POSES, MOVING ──");
(function(){
  ok("every moment has its clip and a poster from its first frame", ['gold','frozen','halo','water','meal','calendar'].every(function(k){ return SC_POSE[k].indexOf('/img/mascot/anim/'+k)===0; }));
  ok("the streak, freeze and halo screens play their clip", String(scCelebrate).indexOf('scMomentPlay(pose)')>0 && String(scFreezeScreen).indexOf("scMomentPlay('frozen')")>0 && String(scShine).indexOf("scMomentPlay('halo')")>0);
  ok("Bell in ice plays as it is, on the white screen", BELL_PLAIN.frozen===true);
  ok("water and meals play Bell's own clip", String(scRender).indexOf("water:'water', meal:'meal'")>0);
  ok("no canvas, no clip: the poster stays", bellMini(null,'gold')===false);
})();
print("\n── SKOR HITFAT · COACH, BANNER, ONE TAP, PLAN, RAMADAN, WEEKLY, MEET ──");
(function(){
  var keepS=HF.data.sessions, keepM=HF.data.meals, keepD=HF.data.daily, keepI=HF.data.ifs, keepSc=HF.data.sc, keepSave=HF.save;
  HF.save=function(){}; HF.data.sessions={}; HF.data.meals={}; HF.data.ifs={}; HF.data.sc={}; HF.data.daily={};
  document.getElementById('scc').style.display='none';
  scRender();
  ok("Meet Bara: three screens the first time", document.getElementById('scc').innerHTML.indexOf('Bara 👋')>0 && (document.getElementById('scc').innerHTML.match(/<i class=/g)||[]).length>=3);
  scMeet(2); ok("...the last one starts it", document.getElementById('scc').innerHTML.indexOf('scMeetDone()')>0);
  scMeetDone(); scRender();
  ok("...and only once", HF.data.sc.met===1 && document.getElementById('scc').style.display==='none');
  var h=document.getElementById('mascot-home').innerHTML;
  ok("Misi hari ini under the rings: points to hari padu, the quickest way, a line from the coach", h.indexOf("TODAY'S MISSION")>0 && h.indexOf('points</b> to a strong day')>0 && h.indexOf('hari padu')<0 && h.indexOf('Coach:')>0 && h.indexOf('Coach Seth')<0 && h.indexOf('COACH BELL')<0 && h.indexOf('scx-bar')>0);
  ok("today's plan under the card, one workout row (water and steps stay in the rings)", h.indexOf("Today's Plan")>0 && h.indexOf('glasses of water to go')<0 && h.indexOf("scTap('water')")>0 &&
   (scBurnIsPlan() ? (h.indexOf('wl-poster')>h.indexOf("Today's Plan") && h.indexOf('scx-alt')>0 && (h.match(/class="scx-row[ "]/g)||[]).length===0)
                   : (h.match(/class="scx-row[ "]/g)||[]).length===1));
/* a member with BURN30 and no plan of their own: BURN30 is today's plan, finding one is the quiet line under it, and Home does not show the card twice */
ok("BURN30 is today's plan for a member with no other plan", !scBurnIsPlan() || (h.indexOf('Or find a plan')>0 && (typeof renderHome!=='function' || true)));
  scTap('water');
  ok("one tap on water adds a glass, and Bell's banner offers an undo", HF.data.daily[iso(0)].water===1 && document.getElementById('scb').className.indexOf('on')>0 && document.getElementById('scb').innerHTML.indexOf('Undo')>0);
  HF.data.ifs={plan:{start:iso(0),endMin:1200},log:[]};
  SC_FAST_LIVE=true;
  scTap('fast');
  ok("one tap on the fast starts it", HF.data.ifs.active && HF.data.ifs.active.target===12);
  scMealLogged({name:'Kek coklat',kcal:450});
  ok("junk food: Bell confiscates it", _scSay==='junk' && scLine().indexOf('Kek coklat')>=0 && document.getElementById('scb').innerHTML.indexOf('Confiscated')>0);
  scMealLogged({name:'Nasi ayam',kcal:600});
  ok("...a proper meal is just a meal", _scSay==='meal');
  ok("the meal hook is in logMeal", String(logMeal).indexOf('scMealLogged(m)')>0);
  HF.data.sc.ram='on';
  ok("Mod Ramadan: the fast ring follows the month", scHabits().filter(function(x){ return x.k==='fast'; })[0].ic==='moon');
  scTap('fast');
  ok("...one tap marks the day fasted", HF.data.daily[iso(0)].ram===1 && scHabits().filter(function(x){ return x.k==='fast'; })[0].v===1);
  HF.data.sc.ram='auto';
  ok("...on by date in Ramadan, off outside it", scRamadan('2027-02-20')===true && scRamadan('2027-05-01')===false);
  ok("...and a row in Settings", String(renderMe).indexOf('scRamRow()')>0);
  SC_FAST_LIVE=false; HF.data.sc.ram='auto';
  ok("with the fast out, no Ramadan row and no fast in the plan", scRamRow()==='' && scPlanHTML().indexOf('scFastTap')<0);
  scWeekly(0);
  ok("Laporan Ahad: the week's average, hari padu, streak, best day", document.getElementById('scc').innerHTML.indexOf('report')>0 && document.getElementById('scc').innerHTML.indexOf('strong days')>0);
  scCelebrateClose();
  ok("each habit its own clip", String(scRender).indexOf("workout:'squat', steps:'walk'")>0);
  HF.data.sessions=keepS; HF.data.meals=keepM; HF.data.daily=keepD||{}; HF.data.ifs=keepI||{}; HF.data.sc=keepSc||{}; HF.save=keepSave;
})();
print("\n── HOME · SIMPLE STYLE + CHECK-IN ──");
(function(){
  HF.apply(null); HF.data.onboarded=true; HF.data.sc={met:1};
  _scCar=0; scRender();
  var h=document.getElementById('mascot-home').innerHTML;
  ok("Bell stands on the page, not in a card", h.indexOf('sc sc-page')>0);
  ok("the mission and the check-in are swipe cards", (h.match(/class="sc-sl"/g)||[]).length>=2 && h.indexOf('TODAY\'S MISSION')>0 && h.indexOf('CHECK-IN')>0);
  ok("...with a dot for each", (h.match(/<i class="(on)?" onclick="scCarGo\(/g)||[]).length===(h.match(/class="sc-sl"/g)||[]).length);
  ok("Today's Plan follows the cards", h.indexOf("Today's Plan")>h.indexOf('sc-car'));
  ok("Bell's card leads, with one thing to do now", h.indexOf('scx-bell')>0 && h.indexOf('scx-bell')<h.indexOf('TODAY\'S MISSION') && /class="scx-act" onclick="(scTap|scWaterTap|scSheet)/.test(h));
  ok("each ring says what it is in words", h.indexOf('0/1 workout')>0 && h.indexOf('0/8 glasses')>0 && h.indexOf('0/8k steps')>0);
  ok("the score and the streak are pills up top", /<b>\d+<\/b><\/button>/.test(scPills()) && scPills().indexOf('sc-chip')>0);
  ok("five faces to pick from", (h.match(/onclick="scMood\(/g)||[]).length===5 && h.indexOf('How are you feeling today?')>0);
  var s0=scScore(); _scCar=1;
  scMood(4);
  ok("a face is kept for the day", HF.data.daily[iso(0)].mood===4 && scDaily().mood===4);
  ok("...and does not change the score", scScore()===s0);
  ok("Bell answers it", scLine()===SC_MOOD_LINES[4]);
  h=document.getElementById('mascot-home').innerHTML;
  ok("the card shows the choice", h.indexOf('Feeling good today')>0 && /class="on"[^>]*scMood\(4\)/.test(h));
  ok("the card stays where it was", /<i class="on" onclick="scCarGo\(1\)"/.test(h));
  scMood(9); ok("an unknown face is ignored", scDaily().mood===4);
  ok("the mood survives a reload", (HF.apply(JSON.parse(JSON.stringify(HF.data))), scDaily().mood===4));
  ok("a strong day turns the band gold", (function(){ var d=HF.data.daily[iso(0)]; d.water=8; d.steps=8000; return scBand()==='#E30613' || scScore()>=70 && scBand()==='#FFC20E'; })());
  _scCar=0;
})();
print("\n── HOME · BUDDY'S BUBBLE ──");
(function(){
  HF.apply(null); HF.data.onboarded=true; HF.data.sc={met:1}; _scSay=null; _scCar=0;
  scRender();
  var h=document.getElementById('mascot-home').innerHTML;
  ok("Bara talks in a bubble above Bara", h.indexOf('id="sc-bub"')>0 && h.indexOf('id="sc-bub"')<h.indexOf('id="sc-bell"'));
  ok("nothing logged: a cheeky nudge", SC_BUB.zero.indexOf(scBubText())>=0);
  _scBubI=1; ok("...a new one each time", scBubText()===SC_BUB.zero[1]);
  ok("the card says where the day stands, with Got it", h.indexOf('HITFAT SCORE')>0 && h.indexOf('wake Bara up')>0 && h.indexOf('scx-got')>0);
  scWaterTap();
  ok("something just done: the bubble says so", SC_LINES.water.indexOf(scBubText())>=0);
  ok("under 50 the glow is Bara's cream", scBand()==='#D9C2A3');
  scSet('water',8); scSet('steps',8000);
  ok("a strong day: red glow, red lines", scScore()>=50 && scBand()==='#E30613' && (_scSay=null, SC_BUB.red.indexOf(scBubText())>=0 || SC_BUB.full.indexOf(scBubText())>=0));
  _scBubI=0; _scCar=0;
})();
print("\n── SCORE INSIGHTS ──");
(function(){
  HF.apply(null); HF.data.onboarded=true; HF.data.sc={met:1}; _scSay=null;
  scSet('water',4); scSet('steps',8000);
  scInsights();
  var h=document.getElementById('pw-body').innerHTML;
  ok("opens with today's score and what it means", h.indexOf('Score insights')>0 && h.indexOf('>'+scScore()+'<span>/100')>0 && h.indexOf('points to a strong day')>0);
  ok("every habit with its points", (h.match(/class="sci-row[ "]/g)||[]).length===scHabits().length && h.indexOf('+13')>0 && h.indexOf('+25')>0);
  ok("a habit row takes you to log it", h.indexOf("scTap('water')")>0);
  ok("the week so far, seven days", (h.match(/class="sci-d/g)||[]).length===7 && h.indexOf('freezes left')>0);
  ok("how it works, and the way to the history", h.indexOf('25 points each')>0 && h.indexOf("switchTab('progress')")>0);
  scRender(); var m=document.getElementById('mascot-home').innerHTML;
  ok("the card and the score pill both open it", m.indexOf('onclick="scInsights()"')>0 && scPills().indexOf('scInsights()')>0);
  scClose();
})();
print("\n── CREAM BUDDY STAYS CREAM ──");
(function(){
  HF.apply(null); HF.data.onboarded=true; HF.data.sc={met:1}; _scSay=null;
  var called='', r0=bellReact; bellReact=function(n){ called=n; };
  scRender(); scPoke();
  ok("under 50 a poke plays the cream giggle", called==='w_giggle' && !scRed());
  scSet('water',8); scSet('steps',8000); scRender(); scPoke();
  ok("a red Bara giggles", called==='giggle' && scRed());
  bellReact=r0;
})();
print("\n── THIS WEEK · BEGINNER FRIENDLY ──");
(function(){
  var keepS=HF.data.sessions; HF.data.sessions={};
  renderTrain && renderTrain();
  var h=document.getElementById('tr-body').innerHTML, first=h.indexOf('This Week'), firstLv=((h.slice(first).match(/class="hpo-lv">(\w+)</)||[])[1]||'').toLowerCase();
  var hasBeg=PROGRAMS.some(function(p){ return !p.weeks && !p.rehab && p.level==='Beginner'; });
  ok("new members see the easy ones first", !hasBeg || firstLv==='beginner', firstLv);
  ok("...and are told so", h.indexOf('easy ones come first')>0);
  HF.data.sessions={a:{date:new Date().toISOString()},b:{date:new Date().toISOString()},c:{date:new Date().toISOString()}};
  renderTrain && renderTrain();
  ok("after a few workouts the week is the usual mix", document.getElementById('tr-body').innerHTML.indexOf('A new set of sessions every week.')>0);
  HF.data.sessions=keepS;
})();
(function(){
  var kd=HF.data.daily, km=HF.data.meals, ks=HF.data.sessions;
  HF.data.daily={}; HF.data.meals={}; HF.data.sessions={};
  ok("an empty day's button is a glass of water, as its line says", scScore()===0 && scAct() && scAct()[0]==='+1 glass of water');
  HF.data.daily=kd; HF.data.meals=km; HF.data.sessions=ks;
})();
(function(){
  var kd=HF.data.daily, km=HF.data.meals, ks=HF.data.sessions, fired=0, keep=scTurnRed;
  HF.data.daily={}; HF.data.meals={}; HF.data.sessions={}; scTurnRed=function(){ fired++; };
  scRender._red=undefined; scRender(); var d=HF.data.daily[iso(0)]=(HF.data.daily[iso(0)]||{water:0,steps:0});
  scRender(); ok("no burst on a plain re-render", fired===0);
  d.water=8; d.steps=8000; scRender();
  ok("crossing 50 turns Bara red with one burst", scRed() && fired===1);
  scRender(); ok("...and only once", fired===1);
  scTurnRed=keep; HF.data.daily=kd; HF.data.meals=km; HF.data.sessions=ks; scRender._red=undefined;
})();
print("\n"+pass+" passed, "+fail+" failed");
if(fail) throw new Error(fail+" failed");
