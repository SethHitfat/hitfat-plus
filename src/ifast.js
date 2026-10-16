/* ═══════════════ IF HITFAT · PUASA BERSELANG ═══════════════
   Intermittent fasting as a feature of its own: something to learn, and
   a system to use, the way Simple (simple.life) does it.

     Ilmu     ten short lessons from Seth's IF ebook (2021), brought up to
              date: the claims the evidence does not carry are gone (toxins,
              cancer, HGH ×20), BCAA is no longer "a must", a safety lesson is
              added, and it agrees with DIET 6 MINGGU and the Academy (IF
              works mostly because the eating window shortens the day's
              eating; the total still matters).
     Pelan    a short quiz, one question a screen, with a safety screen;
              then a 4-week plan on the ebook's own ramp: 12/12, 14/10,
              14/10, 16/8, its eating window placed on the member's day.
     Pemasa   start and end a fast; a ring for the hours, the stage the
              body is roughly in, the last fasts, a streak.

   The first two lessons are open to everyone; the plan and the timer are
   HITFAT+. In English (it was Malay until 15 Oct 2026). ES5. */

var IF_PROTO=[{f:12,e:12,n:'12/12',s:'Start gently: a 12-hour fast, most of it while you sleep.'},
              {f:14,e:10,n:'14/10',s:'Stretch the fast by 2 hours. Your body is getting used to it.'},
              {f:14,e:10,n:'14/10',s:'Hold at 14 hours. The habit is getting stronger.'},
              {f:16,e:8, n:'16/8', s:'The full protocol: fast 16 hours, eat within 8.'}];
/* roughly what is happening, hour by hour; approximate, and said so */
var IF_STAGES=[[0,'Digesting','Blood sugar rises after a meal, then settles again.'],
               [4,'Blood sugar steady','Your body has finished processing the last meal.'],
               [8,'Using stored energy','Your body starts drawing on its glycogen stores.'],
               [12,'Burning more fat','After about 12 hours, more of your energy comes from fat.'],
               [16,'Long fast','Drink water and listen to your body. Unusually dizzy or weak? Break the fast.']];

/* ── the lessons ── */
var IF_LESSONS=[
  {id:'if1', t:'What is IF?', p:[
    'Intermittent fasting (IF) is not a diet. It’s an eating pattern: you decide WHEN you eat, and fast outside that window.',
    'Take 16/8: fast for 16 hours, eat within an 8-hour “eating window”. Most of those fasting hours happen while you sleep.',
    'You still eat normally, two or three filling meals, just in a shorter window.'],
   k:['IF is about when you eat, not what’s forbidden.','Your sleep already covers half your fast.']},
  {id:'if2', t:'Why IF helps you lose fat', p:[
    'The main reason: with a shorter eating window, most people simply eat less without counting. Late-night snacks and all-day grazing disappear on their own.',
    'So far, studies show weight loss with IF is about the same as cutting calories the usual way. IF isn’t magic, but many people find it easier to stick to.',
    'When insulin stays low between meals, your body uses stored energy more easily. But how much you eat inside the window still matters.'],
   k:['IF works because it makes eating less easier.','Choose the approach you can keep up.']},
  {id:'if3', t:'Benefits backed by evidence', p:[
    'What research supports: weight and fat loss (on par with a regular calorie deficit), better insulin sensitivity for some people, and less time thinking about food.',
    'Many also feel fuller because they eat bigger meals instead of picking all day.',
    'Claims like “flushes out toxins”, “prevents cancer” or “multiplies your fat-burning hormones” aren’t backed by strong enough evidence. Your liver and kidneys already “detox” every day.'],
   k:['Focus on the proven benefits: weight, habits, insulin.','Be wary of claims that sound too good.']},
  {id:'if4', t:'The protocol: build up slowly', p:[
    'Week 1: 12/12. For example, eat from 8 am to 8 pm.',
    'Weeks 2 and 3: 14/10. For example, eat from 10 am to 8 pm.',
    'Week 4: 16/8. For example, eat from 12 noon to 8 pm.',
    'Building up gradually gives your body and appetite time to adjust. Move the times to fit your schedule, as long as you keep the fasting hours.'],
   k:['12/12 → 14/10 → 16/8, week by week.','Avoid eating late at night when you can.']},
  {id:'if5', t:'What you can drink while fasting', p:[
    'Plain water: a must, and plenty of it. Hunger is sometimes just thirst.',
    'Black coffee and plain tea (green tea too): fine, with no sugar and no milk.',
    '“Zero” drinks with sweeteners have no calories, but for some people they raise sugar cravings. Plain water is better.',
    'Apple cider vinegar isn’t required. If you like it, dilute it and drink through a straw to protect your teeth.'],
   k:['Water, black coffee, plain tea.','Anything with calories breaks the fast.']},
  {id:'if6', t:'What to eat in your eating window', p:[
    'IF isn’t a licence to eat as much as possible in 8 hours. What you eat in a day still decides your weight.',
    'Start your first meal with protein and vegetables: eggs, chicken, fish, tofu, tempeh. Rice by the portion, one fist.',
    'Break your fast with a normal, balanced meal, not fried food and sweet drinks. It’s the same idea as breaking fast in Ramadan.'],
   k:['Protein and vegetables first.','Food quality and amount still matter.']},
  {id:'if7', t:'IF myths', p:[
    '“IF slows your metabolism.” A short fast like 16 hours doesn’t. Eating far too little for a long time does.',
    '“Fasting makes me lose muscle.” Not if you eat enough protein in your eating window and do strength training.',
    '“I’ll be hungry all the time.” Hunger usually eases after a week or two as your body adjusts. Keep busy and drink water.'],
   k:['Enough protein + strength training = muscle kept.','Early hunger is normal, and it fades.']},
  {id:'if8', t:'Exercising while fasting', p:[
    'You can. Many people like to train in the morning before eating. In the first week your performance may dip a little while your body adjusts.',
    'BCAAs and supplements are NOT required. Enough protein in your eating window is plenty for most people.',
    'If you feel dizzy, weak or your heart races while training fasted, stop and eat. For hard sessions, train inside your eating window.'],
   k:['Training fasted is fine, if it feels fine.','BCAAs are not required.']},
  {id:'if9', t:'Who shouldn’t do IF', p:[
    'Talk to a doctor first, or don’t do IF, if you:',
    'are pregnant or breastfeeding · are under 18 · have had an eating disorder (binge eating, anorexia, bulimia) · have diabetes and take insulin or blood-sugar medicine (risk of low blood sugar) · have severe gastritis or ulcers · take medicine that must be taken with food.',
    'Stop and get advice if you feel very dizzy, faint, your heart races, or you start overeating out of control after fasting.'],
   k:['Safety first, weight second.','If in doubt, ask a doctor.']},
  {id:'if10', t:'IF after 4 weeks, and Ramadan', p:[
    'After 4 weeks, pick the window you’re most comfortable with: many stay at 14/10 or 16/8. There’s no need to go longer.',
    'A wedding feast or a holiday? Loosen up for a day, then pick it back up. Consistency beats perfect.',
    'Ramadan is a longer fast. The same skills apply: break your fast moderately, protein and vegetables first, and don’t skip sahur.'],
   k:['Pick the window you can keep.','Slipped up? Continue with the next fast.']}
];
var IF_FREE=2;

/* ── state ── */
function ifData(){
  var d=HF.data.ifs||(HF.data.ifs={});
  d.read=d.read||{}; d.log=d.log||[];
  return d;
}
function ifOwned(){ return typeof contentOpen==='function' && contentOpen(); }
function ifPlan(){ return ifData().plan||null; }
/* the plan's week today, 0–3 (and it stays on week 4 after) */
function ifWeek(){
  var p=ifPlan(); if(!p||!p.start) return 0;
  return Math.max(0,Math.min(3,Math.floor(daysBetween(p.start,iso(0))/7)));
}
function ifProto(){ return IF_PROTO[ifWeek()]; }
function ifHm(min){ min=((Math.round(min)%1440)+1440)%1440; var h=Math.floor(min/60), m=min%60; return (h%12||12)+':'+('0'+m).slice(-2)+(h<12?' am':' pm'); }
function ifHm12(min){ return ifHm(min); }
/* the eating window for a week: it ends at the plan's last meal, it opens f hours after */
function ifWindow(w){
  var p=ifPlan(), pr=IF_PROTO[w===undefined?ifWeek():w];
  var end=(p&&p.endMin)||20*60;
  return {start:end-pr.e*60, end:end};
}
function ifDur(ms){ var m=Math.max(0,Math.floor(ms/60000)), h=Math.floor(m/60); return h+'h '+('0'+(m%60)).slice(-2)+'m'; }
function ifStage(h){ var s=IF_STAGES[0]; IF_STAGES.forEach(function(x){ if(h>=x[0]) s=x; }); return s; }

/* ── the panel ── */
var ifSeg='timer', ifQ=-1, _ifAns={}, _ifTick=null, ifLesson=null;
function openIF(seg){
  hidePanels(); $('ifp').style.display='block';
  if(seg) ifSeg=seg; ifLesson=null;
  renderIF(); $('screen').scrollTop=0;
}
function ifBack(){
  if(ifLesson!==null){ ifLesson=null; renderIF(); return; }
  if(ifQ>=0){ ifQ--; renderIF(); return; }
  ifQ=-1; switchTab(curTab||'home');
}
function ifSet(x){ ifSeg=x; ifLesson=null; renderIF(); $('screen').scrollTop=0; }
function renderIF(){
  var el=$('ifp-body'); if(!el) return;
  if(_ifTick){ clearInterval(_ifTick); _ifTick=null; }
  if(ifQ>=0) { el.innerHTML=ifQuiz(); return; }
  if(ifLesson!==null){ el.innerHTML=ifLessonHTML(ifLesson); return; }
  var h='<div class="ac-hero if-hero"><div class="k">HITFAT+ · Intermittent Fasting</div><div class="t">IF HITFAT</div>'+
    '<div class="s">Learn how to do IF right, then put it to work with your own plan and timer.</div></div>';
  h+='<div class="obseg d6-segs">'+[['timer','Timer'],['plan','Plan'],['learn','Learn'],['history','History']].map(function(x){
    return '<button class="'+(ifSeg===x[0]?'on':'')+'" onclick="ifSet(\''+x[0]+'\')">'+x[1]+'</button>'; }).join('')+'</div>';
  if(ifSeg==='learn') h+=ifLearn();
  else if(ifSeg==='plan') h+=ifPlanHTML();
  else if(ifSeg==='history') h+=ifHistory();
  else h+=ifTimer();
  el.innerHTML=h;
  if(ifSeg==='timer' && ifData().active) _ifTick=setInterval(function(){
    if(!$('ifp')||$('ifp').style.display!=='block'||ifSeg!=='timer'||ifQ>=0||ifLesson!==null){ clearInterval(_ifTick); _ifTick=null; return; }
    var r=$('if-ring'); if(r) r.outerHTML=ifRing(); var s=$('if-stage'); if(s) s.outerHTML=ifStageHTML();
  },30000);
}

/* ── Pemasa ── */
function ifTimer(){
  if(!ifOwned()) return ifLocked('Fasting timer','Start and end a fast with one tap, see how long is left, and the stage your body is in.');
  if(!ifPlan()) return '<div class="if-start">'+glyph('clock')+'<div class="t">Build your IF plan first</div>'+
    '<div class="s">Five quick questions. We fit your eating and fasting times to your day, building up from 12/12 to 16/8.</div>'+
    '<button class="bigbtn if-btn" onclick="ifQuizStart()">Start</button></div>';
  var d=ifData(), pr=ifProto(), w=ifWindow(), h='';
  if(ifPlan().blocked) return '<div class="lb-safe">'+ic('warning')+'<div><div class="t">IF isn’t recommended for you right now</div><div class="s">'+
    'Based on your answers, talk to a doctor before fasting. You can still learn in the Learn tab.</div></div></div>'+
    '<button class="authalt" onclick="ifQuizStart()">Answer again</button>';
  h+=ifRing();
  if(d.active) h+=ifStageHTML();
  h+='<div class="pdx-btns">'+(d.active
    ? '<button class="bigbtn if-btn" onclick="ifEnd()">End Fast</button>'+
      '<div class="if-adj"><span>Started at '+new Date(d.active.at).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})+'</span>'+
      '<button onclick="ifShift(-30)">−30m</button><button onclick="ifShift(30)">+30m</button></div>'
    : '<button class="bigbtn if-btn" onclick="ifBegin()">Start Fast · '+pr.f+' hours</button>')+'</div>';
  h+='<div class="d6-budrow if-today"><div><b>'+pr.n+'</b><span>Week '+(ifWeek()+1)+'</span></div>'+
    '<div><b>'+ifHm12(w.start)+'</b><span>Start eating</span></div><div><b>'+ifHm12(w.end)+'</b><span>Start fasting</span></div></div>';
  h+='<div class="lb-fine d6-fine">'+pr.s+' While fasting: water, black coffee, plain tea.</div>';
  return h;
}
function ifRing(){
  var d=ifData(), pr=ifProto(), sz=230, r=sz/2-14, c=2*Math.PI*r;
  var on=!!d.active, el=on?Date.now()-d.active.at:0, tgt=(on?d.active.target:pr.f)*3600000, pct=on?Math.min(1,el/tgt):0;
  var big=on?ifDur(el):pr.f+' hours', small=on?(el>=tgt?'Goal reached 🎉':ifDur(tgt-el)+' to go'):'today’s fasting goal';
  return '<div class="if-ring" id="if-ring"><svg viewBox="0 0 '+sz+' '+sz+'" aria-hidden="true">'+
    '<circle cx="'+sz/2+'" cy="'+sz/2+'" r="'+r+'" class="if-ring-t"/>'+
    (pct>0?'<path d="M'+sz/2+' '+(sz/2-r)+' a'+r+' '+r+' 0 1 1 0 '+(2*r)+' a'+r+' '+r+' 0 1 1 0 '+(-2*r)+'" class="if-ring-v'+(pct>=1?' done':'')+'" stroke-dasharray="'+c.toFixed(1)+'" stroke-dashoffset="'+(c*(1-pct)).toFixed(1)+'"/>':'')+
    '</svg><div class="if-ring-c"><span>'+(on?'Fasting':'Not fasting')+'</span><b>'+big+'</b><small>'+small+'</small></div></div>';
}
function ifStageHTML(){
  var d=ifData(); if(!d.active) return '';
  var h=(Date.now()-d.active.at)/3600000, s=ifStage(h);
  return '<div class="if-stage" id="if-stage"><div class="k">Rough body stage · '+Math.floor(h)+' hours</div><div class="t">'+s[1]+'</div><div class="s">'+s[2]+'</div></div>';
}
function ifBegin(){ var d=ifData(); d.active={at:Date.now(), target:ifProto().f}; HF.save(); toast('Fast started'); renderIF(); }
function ifShift(min){ var d=ifData(); if(!d.active) return; d.active.at=Math.min(Date.now(), d.active.at+min*60000); HF.save(); renderIF(); }
function ifEnd(){
  var d=ifData(); if(!d.active) return;
  var hrs=(Date.now()-d.active.at)/3600000;
  d.log.unshift({at:d.active.at, end:Date.now(), hrs:Math.round(hrs*10)/10, target:d.active.target});
  d.log=d.log.slice(0,90); d.active=null; HF.save();
  toast(hrs>=d.log[0].target?'Well done, a '+Math.floor(hrs)+'-hour fast complete':Math.floor(hrs)+'-hour fast logged');
  renderIF();
}

/* ── Pelan ── */
function ifPlanHTML(){
  if(!ifOwned()) return ifLocked('4-week IF plan','Five questions, then a plan fitted to your day: 12/12, 14/10, 14/10, 16/8.');
  var p=ifPlan();
  if(!p) return '<div class="if-start">'+glyph('calendar')+'<div class="t">No plan yet</div>'+
    '<button class="bigbtn if-btn" onclick="ifQuizStart()">Build My Plan</button></div>';
  var wk=ifWeek(), h=fsec('Your 4-Week IF Plan','Started '+new Date(p.start+'T00:00:00').toLocaleDateString('en-GB',{day:'numeric',month:'short'}));
  h+='<div class="ac-eps">'+IF_PROTO.map(function(pr,i){
    var w=ifWindow(i), now=i===wk;
    return '<div class="ac-ep'+(i<wk?' done':'')+(now?' if-on':'')+'"><span class="n">'+(i<wk?glyph('check'):(i+1))+'</span>'+
      '<div class="tx"><div class="t">Week '+(i+1)+' · '+pr.n+'</div><div class="m">Eat '+ifHm(w.start)+' to '+ifHm(w.end)+'</div></div>'+
      (now?'<span class="ac-tag if-today-t">This week</span>':'')+'</div>';
  }).join('')+'</div>';
  if(p.late) h+='<div class="lb-fine d6-fine">Your last meal is usually late at night. Try moving it earlier bit by bit: earlier is better for sleep and appetite.</div>';
  if(p.doc) h+='<div class="lb-safe">'+ic('warning')+'<div><div class="t">With your doctor’s advice</div><div class="s">You told us about a condition that needs a doctor’s advice. Break your fast right away if you feel dizzy, weak or your heart races.</div></div></div>';
  h+='<button class="authalt" onclick="ifQuizStart()">Rebuild my plan</button>';
  return h;
}

/* the quiz, Simple's way: one question a screen */
var IF_Q=[
  {k:'goal', t:'What’s your main goal?', o:[['loss','Lose weight & fat'],['habit','Control cravings & eating habits'],['energy','More energy & focus'],['try','Just curious to try']]},
  {k:'exp', t:'Have you done IF before?', o:[['none','Never'],['some','Tried it now and then'],['yes','Yes, I do it often']]},
  {k:'meals', t:'How many times do you eat a day?', o:[['2','1–2 times'],['3','3 times'],['4','4 or more, snacks included']]},
  {k:'end', t:'When do you usually eat your last meal?', o:[['1140','Before 7 pm'],['1200','7 to 9 pm'],['1320','9 to 11 pm'],['1380','After 11 pm']]},
  {k:'safe', t:'Do any of these apply to you?', multi:true, o:[['preg','Pregnant'],['bf','Breastfeeding'],['u18','Under 18'],['ed','A past eating disorder (binge eating, anorexia, bulimia)'],['dm','Diabetes, on insulin or blood-sugar medicine'],['gi','Severe gastritis or ulcers'],['none','None of these']]}
];
function ifQuizStart(){ if(!ifOwned()) return openPaywall(''); ifQ=0; _ifAns={safe:[]}; renderIF(); $('screen').scrollTop=0; }
function ifQuiz(){
  if(ifQ>=IF_Q.length) return ifResult();
  var q=IF_Q[ifQ], pct=Math.round(ifQ/IF_Q.length*100), sel=_ifAns[q.k];
  var h='<div class="if-qbar"><i style="width:'+pct+'%"></i></div><div class="if-qk">Question '+(ifQ+1)+' of '+IF_Q.length+'</div>'+
    '<div class="if-qt">'+q.t+'</div>'+(q.multi?'<div class="if-qs">Choose all that apply.</div>':'')+'<div class="if-opts">';
  h+=q.o.map(function(o){
    var on=q.multi ? (sel||[]).indexOf(o[0])>=0 : sel===o[0];
    return '<button class="if-opt'+(on?' on':'')+'" onclick="ifPick(\''+q.k+'\',\''+o[0]+'\')">'+o[1]+(on?glyph('check'):'')+'</button>'; }).join('');
  h+='</div>';
  if(q.multi) h+='<button class="bigbtn if-btn" '+((sel||[]).length?'':'disabled')+' onclick="ifQ++;renderIF()">Next</button>';
  return h;
}
function ifPick(k,v){
  var q=IF_Q[ifQ];
  if(q.multi){
    var a=_ifAns[k]||[];
    if(v==='none') a=['none']; else { a=a.filter(function(x){ return x!=='none'; }); var i=a.indexOf(v); if(i>=0) a.splice(i,1); else a.push(v); }
    _ifAns[k]=a; renderIF(); return;
  }
  _ifAns[k]=v; ifQ++; renderIF(); $('screen').scrollTop=0;
}
function ifResult(){
  var s=_ifAns.safe||[], block=['preg','bf','u18','ed'].some(function(x){ return s.indexOf(x)>=0; }), doc=['dm','gi'].some(function(x){ return s.indexOf(x)>=0; });
  var endMin=Math.min(+(_ifAns.end||1200), 20*60), late=+(_ifAns.end||0)>=1320;
  var h='<div class="if-qbar"><i style="width:100%"></i></div>';
  if(block){
    h+='<div class="lb-safe">'+ic('warning')+'<div><div class="t">IF isn’t recommended for you right now</div><div class="s">'+
      'If you’re pregnant or breastfeeding, under 18, or have had an eating disorder, fasting can be risky. '+
      'Talk to a doctor. You can still learn about IF in the Learn tab.</div></div></div>'+
      '<button class="bigbtn if-btn" onclick="ifSave(true,false,'+endMin+','+late+')">Got it</button>';
    return h;
  }
  h+='<div class="if-qk">Your plan is ready</div><div class="if-qt">4-Week IF Plan</div>';
  h+='<div class="ac-eps">'+IF_PROTO.map(function(pr,i){ var st=endMin-pr.e*60;
    return '<div class="ac-ep"><span class="n">'+(i+1)+'</span><div class="tx"><div class="t">Week '+(i+1)+' · '+pr.n+'</div>'+
      '<div class="m">Eat '+ifHm(st)+' to '+ifHm(endMin)+'</div></div></div>'; }).join('')+'</div>';
  if(late) h+='<div class="lb-fine d6-fine">You usually eat late at night. This plan ends eating at 8 pm, so start with small steps.</div>';
  if(doc) h+='<div class="lb-safe">'+ic('warning')+'<div><div class="t">Talk to a doctor first</div><div class="s">'+
    'Diabetes on medication, or severe gastritis or ulcers, needs a doctor’s advice before fasting. Only continue if your doctor says it’s okay.</div></div></div>';
  h+='<button class="bigbtn if-btn" onclick="ifSave(false,'+doc+','+endMin+','+late+')">'+(doc?'My doctor says it’s okay · Start':'Start This Plan')+'</button>';
  return h;
}
function ifSave(block,doc,endMin,late){
  var d=ifData();
  d.plan={start:iso(0), endMin:endMin, late:!!late, doc:!!doc, blocked:!!block, ans:_ifAns};
  HF.save(); ifQ=-1; ifSeg=block?'learn':'timer'; renderIF(); $('screen').scrollTop=0;
}

/* ── Ilmu ── */
function ifLearn(){
  var d=ifData(), n=IF_LESSONS.filter(function(l){ return d.read[l.id]; }).length;
  var h=fsec('Learn IF',n+' of '+IF_LESSONS.length+' read');
  h+='<div class="ac-eps">'+IF_LESSONS.map(function(l,i){
    var lock=i>=IF_FREE && !ifOwned(), done=!!d.read[l.id];
    return '<div class="ac-ep'+(done?' done':'')+'" onclick="'+(lock?'openPaywall(\'\')':'ifOpenLesson('+i+')')+'"><span class="n">'+(done?glyph('check'):(i+1))+'</span>'+
      '<div class="tx"><div class="t">'+l.t+'</div><div class="m">Lesson '+(i+1)+(i<IF_FREE&&!ifOwned()?' · free':'')+'</div></div>'+
      (lock?'<span class="ac-tag">'+glyph('lock')+'</span>':'')+'<span class="pdx-chev">›</span></div>';
  }).join('')+'</div>';
  h+='<div class="aic-fine">For general education, not medical advice. Updated from Seth Hitfat’s IF ebook (2021).</div>';
  return h;
}
function ifOpenLesson(i){ if(i>=IF_FREE && !ifOwned()) return openPaywall(''); ifLesson=i; renderIF(); $('screen').scrollTop=0; }
function ifLessonHTML(i){
  var l=IF_LESSONS[i], d=ifData();
  var h='<div class="ac-ep-h"><div class="k">Learn IF · Lesson '+(i+1)+' of '+IF_LESSONS.length+'</div><div class="t">'+l.t+'</div></div>';
  h+=l.p.map(function(x){ return '<p class="d6-read if-p">'+hesc(x)+'</p>'; }).join('');
  h+='<div class="ac-mis"><div class="k">'+glyph('target')+'Remember</div><div class="t">'+l.k.map(hesc).join('<br>')+'</div></div>';
  if(!d.read[l.id]) h+='<button class="bigbtn if-btn" onclick="ifRead('+i+')">Got it, mark as read</button>';
  else h+='<div class="d6-done">'+glyph('check')+'Read</div>';
  if(IF_LESSONS[i+1]) h+='<button class="authalt" onclick="ifOpenLesson('+(i+1)+')">Next: '+IF_LESSONS[i+1].t+' ›</button>';
  return h;
}
function ifRead(i){ ifData().read[IF_LESSONS[i].id]=true; HF.save(); toast('Lesson read'); if(IF_LESSONS[i+1]) ifOpenLesson(i+1); else { ifLesson=null; renderIF(); } }

/* ── Sejarah ── */
function ifHistory(){
  if(!ifOwned()) return ifLocked('Fasting history','Every fast is logged: how long it was, and whether you hit your goal.');
  var log=ifData().log, h='';
  if(!log.length) return '<div class="if-start">'+glyph('chart')+'<div class="t">No fasts logged yet</div><div class="s">End your first fast in the Timer tab.</div></div>';
  var hit=log.filter(function(x){ return x.hrs>=x.target; }).length, avg=Math.round(log.slice(0,7).reduce(function(a,x){ return a+x.hrs; },0)/Math.min(7,log.length)*10)/10;
  h+='<div class="d6-budrow"><div><b>'+log.length+'</b><span>fasts</span></div><div><b>'+hit+'</b><span>goals hit</span></div><div><b>'+avg+'h</b><span>last 7 average</span></div></div>';
  var last=log.slice(0,7).reverse(), mx=Math.max(16,Math.max.apply(null,last.map(function(x){ return x.hrs; })));
  h+='<div class="if-bars" style="grid-template-columns:repeat('+last.length+',minmax(0,44px))">'+last.map(function(x){ return '<div><i class="'+(x.hrs>=x.target?'ok':'')+'" style="height:'+Math.round(x.hrs/mx*100)+'%"></i><span>'+Math.round(x.hrs)+'h</span></div>'; }).join('')+'</div>';
  h+='<div class="lb-days">'+log.slice(0,20).map(function(x){
    return '<div class="lb-dayrow d6-row"><div class="tx"><div class="t">'+new Date(x.at).toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'})+'</div>'+
      '<div class="m">'+x.hrs+' hours · goal '+x.target+' hours</div></div>'+(x.hrs>=x.target?glyph('check'):'')+'</div>'; }).join('')+'</div>';
  return h;
}

function ifLocked(title,text){
  return '<div class="wl-lock">'+ic('lock')+'<div class="t">'+title+'</div><div class="s">'+text+' Part of HITFAT+.</div>'+
    '<button class="bigbtn if-btn" onclick="openPaywall(\'\')">Join HITFAT+</button></div>';
}

/* ── Home: the IF card, live while fasting ── */
/* Eat → Learn: IF as a colour tile beside Diet 6 (16 Oct); Home keeps ifHomeCard */
function ifLearnTile(){
  /* (16 Oct) a poster like Train's, on Home and in Eat → Learn: 16:8 big, a faint clock */
  var d=ifData(), p=ifPlan(), sub='4-week plan + timer';
  if(ifOwned() && d.active) sub='Fasting · '+ifDur(Date.now()-d.active.at);
  else if(ifOwned() && p && !p.blocked) sub='Week '+(ifWeek()+1)+' · tap to start';
  if(typeof hpoTile!=='function') return '';
  return hpoTile({t:'16:8 IF',kick:'IF HITFAT',lv:sub,pal:'blue',glyph:'clock',go:'openIF()'});
}
function ifHomeCard(){
  var d=ifData(), p=ifPlan(), sub, t, k='IF HITFAT · Intermittent Fasting';
  if(ifOwned() && d.active){
    var el=Date.now()-d.active.at, tgt=d.active.target*3600000;
    t='Fasting · '+ifDur(el); sub=el>=tgt?d.active.target+'-hour goal reached, you can eat now':ifDur(tgt-el)+' to your '+d.active.target+'-hour goal';
  } else if(ifOwned() && p && !p.blocked){
    var w=ifWindow(); t='Week '+(ifWeek()+1)+' · '+ifProto().n; sub='Eat '+ifHm12(w.start)+' – '+ifHm12(w.end)+' · tap to start your fast';
  } else { t='Intermittent fasting, the HITFAT way'; sub='Learn IF, get a 4-week plan and a fasting timer'; }
  var pct=(ifOwned()&&d.active)?Math.min(100,Math.round((Date.now()-d.active.at)/(d.active.target*36000))):0;
  return '<div class="ac-card if-card" onclick="openIF()"><span class="ic">'+glyph('clock')+'</span><div class="tx">'+
    '<div class="k">'+k+'</div><div class="t">'+t+'</div><div class="s">'+sub+'</div>'+
    (pct?'<div class="pbar if-bar"><i style="width:'+pct+'%"></i></div>':'')+'</div><span class="pdx-chev">›</span></div>';
}
