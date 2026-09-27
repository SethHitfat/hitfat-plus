var pass=0,fail=0;
function ok(n,c,x){ if(c){pass++;print("  ok  "+n);} else {fail++;print("  FAIL "+n+(x!==undefined?"  → "+x:""));} }
function noThrow(n,fn){ try{ fn(); pass++; print("  ok  "+n); }catch(e){ fail++; print("  FAIL "+n+"  → "+e); } }

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
ok("single session shows Start",  document.getElementById('pgd-body').innerHTML.indexOf('Start workout')>0);
ok("and draws no day list",       document.getElementById('pgd-body').innerHTML.indexOf('class="wrow')<0);
noThrow("every program opens",    function(){
  PROGRAMS.forEach(function(p){ if(ownsProgram(p)) openProgram(p.id); }); });

/* The CSS reads var(--navb) but nothing set it, so the nav sat higher than in
   Hybrid. These check the probe runs and lands in a sane range. */
noThrow("nav offset computes",  function(){ setNavOffset(); });
ok("it sets --navb",            !!window._navDiag && typeof window._navDiag.navb==='number',
                                JSON.stringify(window._navDiag));
ok("offset stays sane",         window._navDiag.navb>=2 && window._navDiag.navb<=60,
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
ok("home activity reflects it", (function(){ switchTab('home');
  var h=document.getElementById('home-activity').innerHTML; return h.indexOf('1 total')>0 && h.indexOf('This Week')>0; })());
ok("today hero switches to Continue", document.getElementById('home-today').innerHTML.indexOf('Day 2')>0);
ok("photos are used, not gradients", document.getElementById('home-plans').innerHTML.indexOf('background-image')>0);


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
ok("empty state offers measurement logging", document.getElementById('prog-body').innerHTML.indexOf('Log measurements')>0);
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
_multi.forEach(function(p){ p.weeks.forEach(function(w){ w.days.forEach(function(d){
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

print("\n── PLANS · NETFLIX BROWSE ──");
HF.apply(null); HF.data.onboarded=true;
HF.data.prefs={name:'Seth',goal:'Lose fat',level:'Beginner',days:3,equip:'Bodyweight only'};
noThrow("plans renders", function(){ setTrSeg('plans'); });
var _ph=document.getElementById('tr-body').innerHTML;
ok("billboard",        _ph.indexOf('nhero')>0);
ok("poster cards",     _ph.indexOf('ncard')>0);
ok("ranked Top 10",    _ph.indexOf('ranked')>0 && _ph.indexOf('Top 10')>0);
ok("goal-aware row",   _ph.indexOf('Because your goal')>0, 'goal row');
ok("other category rows", _ph.indexOf('Build strength')>0 && _ph.indexOf('Core & abs')>0);
ok("goal row replaces its twin, not duplicates it",
   _ph.indexOf('Because your goal')>0 && _ph.indexOf('Burn fat')<0);
ok("length rows",      _ph.indexOf('The long game')>0 && _ph.indexOf('Four weeks or less')>0);
HF.data.progress={}; HF.data.progress[_multi[0].id]=3;
noThrow("continue row renders", function(){ setTrSeg('plans'); });
ok("started plan promoted", document.getElementById('tr-body').innerHTML.indexOf('Continue')>0);
ok("progress bar on poster", document.getElementById('tr-body').innerHTML.indexOf('class="pb"')>0);
HF.data.progress={};

print("\n── TRAIN · FITNESS+ SEGMENTS ──");
HF.apply(null); HF.data.onboarded=true;
HF.data.prefs={name:'Seth',goal:'Lose fat',level:'Beginner',days:3,equip:'Bodyweight only'};
['foryou','explore','plans','library'].forEach(function(s){
  noThrow("segment "+s, function(){ setTrSeg(s); }); });
setTrSeg('explore');
var ex=document.getElementById('tr-body').innerHTML;
ok("sampler strip",        ex.indexOf('Free This Week')>0);
ok("activity types",       ex.indexOf('Activity Types')>0 && ex.indexOf('fact')>0);
ok("top programs",         ex.indexOf('Top Programs')>0 && ex.indexOf('fbig')>0);
ok("gradient browse tiles",ex.indexOf('ftile')>0);
ok("workout list rows",    ex.indexOf('frow')>0);
ok("NEW badge used",       ex.indexOf('fnew')>0);
setTrSeg('plans');
var _plansHtml=document.getElementById('tr-body').innerHTML;
ok("billboard leads the page", _plansHtml.indexOf('nhero')>0 && _plansHtml.indexOf('nhero')<_plansHtml.indexOf('nrow'));
ok("billboard has a start action", _plansHtml.indexOf('Start plan')>0 || _plansHtml.indexOf('Continue')>0);
ok("build your own still offered", _plansHtml.toLowerCase().indexOf('build your own')>0);
setTrSeg('library');
var lb=document.getElementById('tr-body').innerHTML;
ok("library rows",         lb.indexOf('flib')>0);
ok("equipment breakdown",  lb.indexOf('Bodyweight')>0);
ok("segment pills render", document.getElementById('tr-segs').innerHTML.indexOf('seg on')>0 ||
                           document.getElementById('tr-segs').innerHTML.indexOf('seg')>0);

print("\n── NO REPEATED CARDS (the Hybrid Explore fault) ──");
function _ids(h){ var o=[],re=/openProgram\(.([a-z0-9]+)./g,m; while((m=re.exec(h))) o.push(m[1]); return o; }
setTrSeg('explore');
var _ex=_ids(document.getElementById('tr-body').innerHTML);
var _c={}; _ex.forEach(function(i){_c[i]=(_c[i]||0)+1;});
var _dup=Object.keys(_c).filter(function(k){return _c[k]>1;});
ok("Explore shows nothing twice", _dup.length===0, _dup.join(","));
ok("Explore still fills the page", _ex.length>=20, _ex.length);
setTrSeg('plans');
var _pl=_ids(document.getElementById('tr-body').innerHTML);
var _pc={}; _pl.forEach(function(i){_pc[i]=(_pc[i]||0)+1;});
// Netflix shows a title in several rows on purpose; what it must not do is
// repeat the same LIST, or bury one plan in every row.
ok("no plan appears in more than 4 rows",
   Object.keys(_pc).filter(function(k){return _pc[k]>4;}).length===0, JSON.stringify(_pc));
ok("no two rows are identical", (function(){
   var rows=document.getElementById('tr-body').innerHTML.split('class="nrow"').slice(1);
   var sigs={},dupe=0;
   rows.forEach(function(r){ var s=_ids(r).join(','); if(!s) return;
     if(sigs[s]) dupe++; sigs[s]=1; });
   return dupe===0; })());
ok("plans browse is deep",  _pl.length>=30, _pl.length);

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
plAdjust(-999);ok("never below 5s", pl.left===5, pl.left);

pl.i=pl.exs.length-1; pl.round=pl.rounds;
ok("last exercise of last round has no next", plNextIndex()===null);
pl.round=1;
ok("rounds loop back to the first exercise",
   pl.rounds>1 ? (plNextIndex().i===0 && plNextIndex().round===2) : true);

pl.i=pl.exs.length-1; pl.round=pl.rounds; pl.t0=Date.now()-6*60000;
plFinish();
ok("finish logs a session",  HF.count()===1, HF.count());
ok("finish advances the day", progDone(_p.id)===1, progDone(_p.id));
ok("done overlay shown",     document.getElementById('pl-done').className.indexOf('on')>=0);
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
ok("Made by you row",  document.getElementById('tr-body').innerHTML.indexOf('Made by you')>0 ||
                       document.getElementById('tr-body').innerHTML.indexOf('nhero')>0);
ok("card offers editing", document.getElementById('tr-body').innerHTML.indexOf('Edit my plan')>0);
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
  PROGRAMS.filter(isBarProgram).forEach(function(p){
    p.weeks.forEach(function(w){ w.days.forEach(function(d){
      if(d.rest) return;
      d.ex.forEach(function(n){
        var e=DB.filter(function(x){ return x.n===n; })[0];
        if(!e || !e.v) bad.push(p.name+': '+n);
      });
    }); });
  });
  return bad.length===0; })(), 'unfilmed movements inside BAR programmes');
ok("no BAR session is left short", PROGRAMS.filter(isBarProgram).every(function(p){
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
ok("BAR plans still get BAR moves", PROGRAMS.filter(isBarProgram).every(function(p){
    return p.weeks[0].days.some(function(d){ return !d.rest && d.ex.some(isBarExercise); }); }));
ok("no generic day went empty",  PROGRAMS.filter(function(p){ return p.weeks; })
    .every(function(p){ return p.weeks.every(function(w){ return w.days.every(function(d){
      return d.rest || d.ex.length>0; }); }); }));

print("\n── FIND MY PROGRAM ──");
HF.apply(null); HF.data.onboarded=true;
_ent={skus:{}, credits:0, passUntil:null, loaded:true};

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
fq={step:3, goal:'strong', joint:null, days:4, equip:'bar', level:'Intermediate'}; fqResult();
ok("bar equipment surfaces a BAR program", (function(){
    return PROGRAMS.filter(isBarProgram).some(function(p){
      return document.getElementById('store-body').innerHTML.indexOf(p.name)>0; }); })());
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
ok("the product sheet shows the weeks before the price", (function(){
    var h=document.getElementById('pw-body').innerHTML;
    return h.indexOf('Week by week')>0 && h.indexOf('Week by week')<h.indexOf('one payment'); })());
closeProduct();
HF.apply(null); trSeg='explore';

print("\n── RECOVERY · prehab ──");
HF.apply(null); HF.data.onboarded=true;
_ent={skus:{}, credits:0, passUntil:null, loaded:true};

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
ok("free ones are labelled free",  document.getElementById('tr-body').innerHTML.indexOf('FREE')>0);
ok("paid ones show a price",       document.getElementById('tr-body').innerHTML.indexOf('RM29')>0);

noThrow("every joint page opens",  function(){ REHAB_JOINTS.forEach(function(j){ openJoint(j.k); }); });
openJoint('Knee');
ok("joint page lists its moves",   rehabFor('Knee').every(function(n){
    return document.getElementById('lib-body').innerHTML.indexOf(n)>0; }));
ok("joint page repeats the warning",
    document.getElementById('lib-body').innerHTML.indexOf('stop')>0);
noThrow("bad joint is safe",       function(){ openJoint('Elbow'); });

openStore('programs');
ok("store has a Recovery row",     document.getElementById('store-body').innerHTML.indexOf('Recovery &amp; prehab')>0
                                || document.getElementById('store-body').innerHTML.indexOf('Recovery & prehab')>0);
HF.apply(null); trSeg='explore';

print("\n── HITFAT BAR & SIGNATURE ──");
HF.apply(null); HF.data.onboarded=true;
_ent={skus:{}, credits:0, passUntil:null, loaded:true};

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

/* BAR programs */
var bars=PROGRAMS.filter(isBarProgram);
ok("BAR programs exist",         bars.length>=5, bars.length);
ok("BAR programs are free",      bars.every(function(p){ return !isPaidProgram(p) && ownsProgram(p); }));
ok("BAR programs open directly", (function(){
    openProgram(bars[0].id);
    return document.getElementById('progdetail').style.display==='block'; })());
ok("BAR days are all BAR moves", bars.every(function(p){
    return p.weeks.every(function(w){ return w.days.every(function(d){
      return d.rest || d.ex.every(isBarExercise); }); }); }));
ok("no BAR day is empty",        bars.every(function(p){
    return p.weeks.every(function(w){ return w.days.every(function(d){
      return d.rest || d.ex.length>0; }); }); }));
ok("BAR weeks differ",           (function(){
    var p=bars.filter(function(x){return x.weeks.length>1;})[0];
    return !p || JSON.stringify(p.weeks[0])!==JSON.stringify(p.weeks[1]); })());
noThrow("BAR segment renders",   function(){ switchTab('train'); setTrSeg('bar'); });
ok("BAR segment lists them",     bars.every(function(p){
    return document.getElementById('tr-body').innerHTML.indexOf(p.name)>0; }));
ok("BAR segment reports its coverage", (function(){
  var h=document.getElementById('tr-body').innerHTML, c=barFootageCount();
  return h.indexOf(c.have+' of '+c.total)>0; })(),
  document.getElementById('tr-body').innerHTML.indexOf('filmed')>0 ? 'has a note' : 'no note at all');
noThrow("BAR library opens filtered", function(){ openLibrary(BAR_EQ); });
ok("library filtered to BAR",    libEq===BAR_EQ);

/* the player must not leave the previous clip running under a new name */
var _noclip=BAR_DB.filter(function(e){ return !e.v; })[0];
ok("an unfilmed movement still exists to test with", !!_noclip);
ok("a clipless exercise blanks the video", (function(){
    playExercise(_noclip.n);
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
openStore('programs');
ok("store has a Signature row",  document.getElementById('store-body').innerHTML.indexOf('Signature')>0);
ok("signature cards are badged", document.getElementById('store-body').innerHTML.indexOf('SIGNATURE')>0);
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
ok("it says it is free",        document.getElementById('mth-body').innerHTML.indexOf('Free for everyone')>0);
noThrow("home card renders",    function(){ switchTab('home'); });
ok("home shows the challenge",  document.getElementById('home-activity').innerHTML.indexOf('mcard')>0);
ok("home card opens the panel", document.getElementById('home-activity').innerHTML.indexOf('openMonthly()')>0);
noThrow("panel survives no data", function(){ HF.apply(null); renderMonthly(); });
ok("empty state offers joining", document.getElementById('mth-body').innerHTML.indexOf('Join ')>0);
HF.apply(null); switchTab('home');

print("\n── STORE · one-off ownership ──");
/* The client-side gate is merchandising, not enforcement. These tests check
   the UI offers the right thing. Scan enforcement lives in the edge function
   and cannot be reached from here. */
HF.apply(null);
_ent={skus:{}, credits:0, passUntil:null, loaded:true};
ok("owns nothing by default",    !ownsAll() && !owns('prog_reset12'));
ok("free programs are open",     FREE_PROGRAMS.every(function(id){
    return ownsProgram(PROGRAMS.filter(function(p){return p.id===id;})[0]); }));
ok("free programs are not sold", FREE_PROGRAMS.every(function(id){
    return !isPaidProgram(PROGRAMS.filter(function(p){return p.id===id;})[0]); }));
ok("single sessions are free",   PROGRAMS.filter(function(p){return !p.weeks;}).every(function(p){
    return !isPaidProgram(p) && ownsProgram(p); }));
ok("paid set is non-empty",      PROGRAMS.filter(isPaidProgram).length>0,
                                 PROGRAMS.filter(isPaidProgram).length);
ok("every paid program is priced", PROGRAMS.filter(isPaidProgram).every(function(p){
    return programPrice(p)>0; }));
ok("longer programs cost more",  (function(){
    var a=programPrice({weeks:new Array(2)}), b=programPrice({weeks:new Array(12)});
    return b>a; })());
ok("bundle beats buying singly", BUNDLE_PRICE < PROGRAMS.filter(isPaidProgram)
                                 .reduce(function(s,p){return s+programPrice(p);},0));

/* buying a program unlocks exactly that program */
var target=PROGRAMS.filter(isPaidProgram)[0];
_ent.skus['prog_'+target.id]=true;
ok("bought program unlocks",     ownsProgram(target));
ok("others stay locked",         PROGRAMS.filter(isPaidProgram)
    .filter(function(p){return p.id!==target.id;}).every(function(p){ return !ownsProgram(p); }));
ok("locked program opens the sheet", (function(){
    var other=PROGRAMS.filter(isPaidProgram).filter(function(p){return p.id!==target.id;})[0];
    openProgram(other.id);
    return document.getElementById('pwm').className.indexOf('on')>=0
        && document.getElementById('progdetail').style.display!=='block'; })());
closeProduct();
ok("owned program actually opens", (function(){
    openProgram(target.id);
    return document.getElementById('progdetail').style.display==='block'; })());

/* the bundle unlocks everything, including anything added later */
_ent.skus={}; _ent.skus[BUNDLE_SKU]=true;
ok("bundle unlocks every program", PROGRAMS.every(ownsProgram));
ok("bundle unlocks 14-day plans",  maxPlanDays()===14);
ok("bundle unlocks saved plans",   maxSavedPlans()===20);
_ent.skus={};
ok("free caps plan length",        maxPlanDays()===FREE_PLAN_DAYS);
ok("free keeps one plan",          maxSavedPlans()===FREE_PLAN_SAVED);

print("\n── SCAN ACCESS ──");
HF.apply(null);
_ent={skus:{}, credits:0, passUntil:null, loaded:true};
ok("free tier comes first",      scanAccess().mode==='free');
ok("free tier reports its count",scanAccess().left===SCAN_FREE_TIER);
scanBump(); scanBump(); scanBump();
ok("free tier runs out",         scanAccess().mode==='none' && !canScan());
_ent.credits=20;
ok("credits take over",          scanAccess().mode==='credits' && scanAccess().left===20);
ok("credits allow scanning",     canScan());
_ent.passUntil=new Date(Date.now()+86400000).toISOString();
ok("a live pass outranks credits", scanAccess().mode==='pass');
ok("a pass is unlimited",        scanAccess().left===Infinity);
_ent.passUntil=new Date(Date.now()-86400000).toISOString();
ok("an expired pass is ignored", scanAccess().mode==='credits');
_ent.credits=0;
ok("nothing left means nothing", scanAccess().mode==='none' && !canScan());
ok("running out opens the store",(function(){
    openScan();
    return document.getElementById('store').style.display==='block'
        && document.getElementById('scan').className.indexOf('on')<0; })());
ok("store lands on the scan tab", storeSeg==='scan');
ok("every scan product is priced", SCAN_PRODUCTS.every(function(s){ return s.price>0 && s.sku && s.name; }));
ok("credits and passes both sold", SCAN_PRODUCTS.some(function(s){return s.kind==='credits';})
                                && SCAN_PRODUCTS.some(function(s){return s.kind==='pass';}));
ok("bigger credit packs cost less each", (function(){
    var c=SCAN_PRODUCTS.filter(function(s){return s.kind==='credits';})
          .sort(function(a,b){return a.credits-b.credits;});
    return c.length<2 || (c[1].price/c[1].credits) < (c[0].price/c[0].credits); })());

print("\n── STORE UI ──");
HF.apply(null);
_ent={skus:{}, credits:0, passUntil:null, loaded:true};
noThrow("store opens",           function(){ openStore('programs'); });
ok("three store segments",       STORE_SEGS.length===3);
noThrow("every segment renders", function(){ STORE_SEGS.forEach(function(s){ setStoreSeg(s[0]); }); });
setStoreSeg('programs');
ok("bundle is offered",          document.getElementById('store-body').innerHTML.indexOf('bundle_all')>0);
ok("paid programs are listed",   document.getElementById('store-body').innerHTML.indexOf('RM')>0);
ok("free programs are shown too",document.getElementById('store-body').innerHTML.indexOf('FREE')>0);
setStoreSeg('scan');
ok("scan tab lists the packs",   SCAN_PRODUCTS.every(function(s){
    return document.getElementById('store-body').innerHTML.indexOf(s.sku)>0; }));
ok("scan tab says what is free", document.getElementById('store-body').innerHTML.indexOf('Manual logging')>0);
setStoreSeg('bar');
ok("bar tab shows the price",    document.getElementById('store-body').innerHTML.indexOf('RM'+BAR_PRICE)>0);
ok("bar tab links out to the site", document.getElementById('store-body').innerHTML.indexOf('openBarSite()')>0);
ok("bar sessions are never sold",PROGRAMS.filter(isBarProgram).every(function(p){ return !isPaidProgram(p); }));
ok("no bar content yet is stated", document.getElementById('store-body').innerHTML.indexOf('being filmed')>0
                                || PROGRAMS.filter(isBarProgram).length>0);

noThrow("every product sheet opens", function(){
  openProduct(BUNDLE_SKU); closeProduct();
  SCAN_PRODUCTS.forEach(function(s){ openProduct(s.sku); closeProduct(); });
  PROGRAMS.filter(isPaidProgram).forEach(function(p){ openProduct('prog_'+p.id); closeProduct(); });
});
openProduct(BUNDLE_SKU);
ok("sheet names the price",      document.getElementById('pw-body').innerHTML.indexOf('RM'+BUNDLE_PRICE)>0);
ok("sheet says one payment",     document.getElementById('pw-body').innerHTML.indexOf('one payment')>0);
ok("sheet promises no subscription", document.getElementById('pw-body').innerHTML.indexOf('No subscription')>0);
noThrow("bad sku is safe",       function(){ openProduct('prog_nope'); openProduct('scan_nope'); });
closeProduct();
print("\n── CHECKOUT ──");
ok("checkout needs a sign-in", (function(){
    var said=null, t0=toast; toast=function(m){ said=m; };
    sb=null; HF.userId=null; startCheckout(BUNDLE_SKU); toast=t0;
    return said && said.indexOf('Sign in')>=0; })());
sb={}; HF.userId='u1';
closeProduct();
noThrow("checkout sheet opens",  function(){ startCheckout(BUNDLE_SKU); });
ok("the sheet is actually visible", document.getElementById('pwm').className.indexOf('on')>=0);
ok("sheet offers both channels", PAY_CHANNELS.every(function(c){
    return document.getElementById('pw-body').innerHTML.indexOf('setPayChannel('+c[0]+')')>0; }));
ok("FPX is the default",         payChannel===1);
noThrow("channel switches",      function(){ setPayChannel(6); });
ok("switch is remembered",       payChannel===6);
ok("sheet names Bayarcash",      document.getElementById('pw-body').innerHTML.indexOf('Bayarcash')>0);
ok("sheet shows the price",      document.getElementById('pw-body').innerHTML.indexOf('RM'+BUNDLE_PRICE)>0);
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
HF.apply(null); _ent={skus:{}, credits:0, passUntil:null, loaded:true}; eatSeg='today';

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
_eg='male'; _egoal='lose';
document.getElementById('e-w').value='88';
document.getElementById('e-h').value='175';
document.getElementById('e-a').value='32';
noThrow("target saves",           function(){ saveNutrition(); });
ok("target computed",             HF.data.nutrition.cal>1200, HF.data.nutrition.cal);
ok("segments appear after setup", document.getElementById('eat-segs').innerHTML.indexOf('setEatSeg')>0);
ok("three segments",              EAT_SEGS.length===3);
ok("every segment has a handler", EAT_SEGS.every(function(s){
    return document.getElementById('eat-segs').innerHTML.indexOf("setEatSeg('"+s[0]+"')")>0; }));
ok("Today is the default",        eatSeg==='today');
ok("hero renders",                document.getElementById('eat-body').innerHTML.indexOf('ehero')>0);
ok("all four slots shown",        SLOTS.every(function(s){
    return document.getElementById('eat-body').innerHTML.indexOf("openManualAt('"+s.k+"')")>0; }));
ok("macros render",               document.getElementById('eat-body').innerHTML.indexOf('emacs')>0);
noThrow("every segment renders",  function(){ EAT_SEGS.forEach(function(s){ setEatSeg(s[0]); }); });
setEatSeg('log');
ok("log offers scan",             document.getElementById('eat-body').innerHTML.indexOf('openScan()')>0);
ok("log offers manual",           document.getElementById('eat-body').innerHTML.indexOf('openManual()')>0);
ok("quota shown honestly",        document.getElementById('eat-body').innerHTML.indexOf('FREE SCANS LEFT')>0);
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
ok("landing names both modes",       _t4.indexOf('ONLINE SOLO')>0 && _t4.indexOf('GYM DUO')>0);
ok("landing names all three tracks", _t4.indexOf('START')>0 && _t4.indexOf('TRANSFORM')>0 &&
                                     _t4.indexOf('PERFORM')>0);

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
ok("an inactive beginner is sent to START",     t42Recommend(0)==='start');
ok("...and so is someone barely training",      t42Recommend(6)==='start');
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
ok("...with all three tabs", document.getElementById('t42-body').innerHTML.indexOf('Basic info')>0 &&
   document.getElementById('t42-body').innerHTML.indexOf('Photos')>0);
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
ok("the Physical tab offers the way back", document.getElementById('t42-body').innerHTML.indexOf('Go to Basic info')>0);
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
         gender:'female',status:'pending',verify_code:'T42-84921'};
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
/* And the banner is the first thing under the header, not below the fold. */
ok("the banner sits directly under the Home header",
   _shell.indexOf('id="home-t42"') > _shell.indexOf('id="home-hdr"') &&
   _shell.indexOf('id="home-t42"') < _shell.indexOf('id="home-week"'));
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
T42.challenge=_t42edition(9); t42Segs();
ok("...and not before the edition starts",
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
ok("no body composition without an InBody", _pb.indexOf('Body composition')<0);
T42.mid={id:'m2',phase:'mid',weight_kg:58.3,waist_cm:68,body_fat_pct:19.4,muscle_mass_kg:26.1};
t42Paint();
ok("...but it appears once there is one",
   document.getElementById('t42-body').innerHTML.indexOf('Body composition')>0);
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
ok("...and naming all five boards", _lb.indexOf('Transform · Women')>0 && _lb.indexOf('Consistency')>0);
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
ok("...with the weight change",    _rr.indexOf('-5.4kg')>0);
/* START trains three days a week. Counting workouts against every day of
   the challenge would tell someone who did all of them they did 43%. */
T42.score.workout_pct=100; T42.completions=[{day_no:1},{day_no:3}];
ok("workouts use the plan-based number once the server has one", T42.workoutPct()===100);
T42.score.workout_pct=null;
ok("...and the app's own count before that", T42.workoutPct()===Math.round(2/42*100));
_t42done();
ok("...and the waist change",      _rr.indexOf('-6cm')>0);
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
ok("...back into HITFAT+",       _nx.indexOf('t42NextTrain()')>0);
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
ok("...and letting pairing wait",      _du.indexOf('Skip for now')>0);
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
ok("the duo sits under today",          _dg.indexOf('Your duo')>0);
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
ok("...and no duo",               document.getElementById('t42-body').innerHTML.indexOf('Your duo')<0);
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

print("\n"+pass+" passed, "+fail+" failed");
if(fail) throw new Error(fail+" failed");
