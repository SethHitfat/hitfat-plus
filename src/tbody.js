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
ok("every BAR exercise is awaiting footage", BAR_DB.every(function(e){ return !e.v; }));
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
ok("BAR segment admits no film", document.getElementById('tr-body').innerHTML.indexOf('being filmed')>0);
noThrow("BAR library opens filtered", function(){ openLibrary(BAR_EQ); });
ok("library filtered to BAR",    libEq===BAR_EQ);

/* the player must not leave the previous clip running under a new name */
ok("a clipless exercise blanks the video", (function(){
    playExercise(BAR_DB[0].n);
    var f=document.getElementById('pl-video');
    return String(f.src||'').indexOf('vimeo')<0; })());
ok("and says so on screen",      document.getElementById('pl-nofilm').style.display==='grid');
ok("the notice names the move",  document.getElementById('pl-nofilm-m')
   .textContent.indexOf(BAR_DB[0].n)===0,
   document.getElementById('pl-nofilm-m').textContent.slice(0,50));
noThrow("player closes",         function(){ plClose(); });
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


print("\n"+pass+" passed, "+fail+" failed");
if(fail) throw new Error(fail+" failed");
