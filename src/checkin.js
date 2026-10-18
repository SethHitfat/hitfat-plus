/* ═══════════════ TODAY'S CHECK-IN, with Bara (19 Oct 2026) ═══════════════
   Seth, from a Simple screen recording: "buat dua2". The face on Home now
   opens a check-in: how you feel, then a few chips (mood, appetite, body).
   Bara reads it back in Malay and changes today's plan to fit: three things
   to do, each one tap away, ticked on Today's Plan. No AI: plain rules, so it
   costs nothing and says nothing it can't stand behind.

   Kept in HF.data.daily[day].ck = {f: 1–5, tags: [..], plan: [..], done: {..}}
   (and daily[day].mood, as before). The chips are English like the cards
   around them; Bara speaks Malay, calls himself Bara and the member awak.
   Not medical advice: the sheet says so, and nothing here diagnoses. */
var CK_GROUPS=[
  ['Your mood',[['energetic','⚡','Energetic'],['calm','😌','Calm'],['stressed','😣','Stressed'],['tired','😴','Tired'],['low','😔','Low']]],
  ['Your appetite',[['appnormal','✅','Normal appetite'],['hungry','🍽️','Hungry all day'],['cravings','🍩','Sweet cravings'],['noapp','🙅','No appetite']]],
  ['Your body',[['nosym','👍','No symptoms'],['sore','💪','Sore muscles'],['poorsleep','🌙','Slept badly'],['bloated','🎈','Bloated'],['constipated','🚽','Constipated'],['headache','🤕','Headache'],['period','🩸','On my period']]]];
/* chips that cancel each other within a group */
var CK_ALONE={appnormal:1, nosym:1, noapp:1};
var CK_LINE={
  energetic:'Bertenaga hari ni! Ini masa terbaik untuk workout penuh 💪',
  calm:'Tenang macam ni, senang nak buat pilihan yang baik.',
  stressed:'Stres boleh buat badan rasa nak makan manis dan susah nak rehat.',
  tired:'Penat selalunya sebab kurang tidur atau kurang minum air.',
  low:'Hari yang berat pun, Bara ada dengan awak 🤍',
  hungry:'Selera naik? Protein dan serat buat awak kenyang lebih lama.',
  cravings:'Teringin manis tu normal. Kita lawan dengan protein dulu.',
  noapp:'Tak ada selera pun, badan tetap perlukan tenaga. Makan sikit tapi berkhasiat.',
  sore:'Otot sakit tandanya awak dah berusaha. Hari ni gerak ringan je.',
  poorsleep:'Kurang tidur buat rasa lapar naik esoknya. Malam ni tidur awal ya.',
  bloated:'Kembung selalunya sebab kurang air dan serat.',
  constipated:'Sembelit? Air dan serat ialah kawan baik awak hari ni.',
  headache:'Sakit kepala selalunya tanda badan kurang air.',
  period:'Hari period, dengar badan awak. Gerak ringan pun dah dikira.'};
var CK_OPEN={1:'Hari ni rasa berat ya.',2:'Hari ni kurang bersemangat ya.',3:'Hari biasa, okay je.',4:'Rasa baik hari ni!',5:'Semangat betul hari ni!'};
/* the things Bara can put on today's plan */
var CK_TASKS={
  water2:{ic:'water',t:'Drink 2 glasses of water now',s:'Tired or hungry often means thirsty'},
  walk10:{ic:'steps',t:'A 10-minute walk outside',s:'Fresh air lifts stress and energy'},
  stretch:{ic:'run',t:'4-minute stretch with Bara',s:'Four slow moves to unwind. Grab a towel',x:'play'},
  mobility:{ic:'run',t:'Easy mobility for sore muscles',s:'Five gentle moves, about 4 minutes',x:'play'},
  protein:{ic:'food',t:'Log a high-protein, high-fibre meal',s:'Keeps you full for longer'},
  snack:{ic:'food',t:'A small protein snack',s:'A boiled egg, yoghurt or a glass of milk'},
  fibre:{ic:'food',t:'Vegetables at lunch, fruit at tea time',s:'Fibre and water keep things moving'},
  sleep:{ic:'moon',t:'Lights out by 11 pm tonight',s:'Good sleep makes tomorrow easier'},
  lightwo:{ic:'workout',t:'A light workout today',s:'Move, but go easy on yourself'},
  fullwo:{ic:'workout',t:"Go for today's full workout",s:'You have the energy, use it'},
  weigh:{ic:'scale',t:'Weigh in today',s:'Same time, same scale, before breakfast'},
  ep11:{ic:'play',t:'Lesson: Kurang Tidur',s:'Nutrition Academy · 3 min',x:'ep'},
  ep12:{ic:'play',t:'Lesson: Makan Ikut Emosi',s:'Nutrition Academy · 3 min',x:'ep'},
  ep13:{ic:'play',t:'Lesson: Lapar Atau Dahaga?',s:'Nutrition Academy · 3 min',x:'ep'},
  ep04:{ic:'play',t:'Lesson: Protein',s:'Nutrition Academy · 3 min',x:'ep'}};
/* what each answer asks for, strongest first */
var CK_RULE={
  stressed:['stretch','walk10','ep12'], tired:['water2','lightwo','sleep'], low:['walk10','stretch'],
  hungry:['protein','water2','ep13'], cravings:['protein','ep12'], noapp:['snack','water2'],
  sore:['mobility','lightwo'], poorsleep:['sleep','ep11','water2'], bloated:['fibre','water2'],
  constipated:['fibre','water2','walk10'], headache:['water2','sleep'], period:['lightwo','water2','snack'],
  energetic:['fullwo','weigh'], calm:['fullwo','protein']};
/* filmed moves only (the rehab library's mobility moves have no clips yet) */
var CK_STRETCH=[['Seated Twist',50],['Towel Side Bend',50],['Towel Shoulder Back Pull',50],['Towel Wide Front Bend',50]];
var CK_MOBILITY=[['IC Warm',45],['Bird Dog',45],['Towel Sliding Fold',45],['Seated Knee To Chest',45],['Seated Twist',45]];

var _ck={f:0, tags:{}, step:'ask'};
function ckTagInfo(t){ var r=null; CK_GROUPS.forEach(function(g){ g[1].forEach(function(x){ if(x[0]===t) r=x; }); }); return r; }
function ckToday(d){ var all=HF.data.daily||{}; var o=all[d||iso(0)]; return o&&o.ck||null; }
function ckDay(){ var all=HF.data.daily||(HF.data.daily={}), d=iso(0); return all[d]||(all[d]={water:0,steps:0}); }
function ckName(){ var n=((HF.data.prefs&&HF.data.prefs.name)||'').trim().split(' ')[0]; return n||''; }

/* the plan: up to three, the strongest asks first, at most one lesson */
function ckPlan(f,tags){
  var asks=[], out=[], lessons=0, i, j, k, pri=['stressed','low','tired','poorsleep','hungry','cravings','noapp','sore','bloated','constipated','headache','period','energetic','calm'];
  for(i=0;i<pri.length;i++) if(tags.indexOf(pri[i])>=0) asks.push(CK_RULE[pri[i]]);
  if(f && f<=2 && tags.indexOf('low')<0) asks.push(CK_RULE.low);
  if(!asks.length) asks.push(f>=4?CK_RULE.energetic:['fullwo','protein','water2']);
  /* round by round: the first ask of each answer, then the second … */
  for(j=0;j<3 && out.length<3;j++) for(i=0;i<asks.length && out.length<3;i++){
    k=asks[i][j]; if(!k || out.indexOf(k)>=0) continue;
    if(CK_TASKS[k].x==='ep'){ if(lessons) continue; lessons++; }
    if(k==='fullwo' && (tags.indexOf('sore')>=0 || tags.indexOf('period')>=0 || f<=2)) continue;
    out.push(k);
  }
  ['water2','protein','walk10'].forEach(function(x){ if(out.length<3 && out.indexOf(x)<0) out.push(x); });
  return out;
}
/* Bara's read-back, in Malay: how the day feels, then the two answers that matter most */
function ckSummary(f,tags){
  var bits=[CK_OPEN[f]||''], pri=['stressed','low','tired','poorsleep','hungry','cravings','noapp','sore','bloated','constipated','headache','period','energetic','calm'], n=0, i;
  for(i=0;i<pri.length && n<2;i++) if(tags.indexOf(pri[i])>=0){ bits.push(CK_LINE[pri[i]]); n++; }
  bits.push('Bara dah ubah plan hari ni ikut keadaan awak 🌱');
  return bits.filter(Boolean).join(' ');
}

/* ── the sheet ── */
function ckOpen(f){
  var c=ckToday();
  _ck={f:f||(c&&c.f)||0, tags:{}, step:'ask'};
  if(c && c.tags) c.tags.forEach(function(t){ _ck.tags[t]=1; });
  ckPaint();
  $('pwm').classList.add('on'); try{ $('pwm').scrollTop=0; }catch(e){}
}
function ckFace(f){ _ck.f=f; ckPaint(); }
function ckTag(t){
  if(_ck.tags[t]){ delete _ck.tags[t]; ckPaint(); return; }
  /* a chip that stands alone clears its group, and any other chip clears it */
  CK_GROUPS.forEach(function(g){
    var keys=g[1].map(function(x){ return x[0]; });
    if(keys.indexOf(t)<0) return;
    keys.forEach(function(k){ if(CK_ALONE[t] ? k!==t : CK_ALONE[k]) delete _ck.tags[k]; });
  });
  _ck.tags[t]=1; ckPaint();
}
function ckPaint(){
  var h='<div class="pwtop"><span></span><button class="pwx" aria-label="Close" onclick="ckClose()">✕</button></div>';
  if(_ck.step==='done') h+=ckDoneHTML();
  else{
    h+='<div class="ck"><div class="ck-h">Today\'s Check-in</div>'+
      '<div class="ck-q">How are you feeling?</div>'+
      '<div class="ck-faces">'+SC_MOODS.map(function(x){
        return '<button class="'+(x[0]===_ck.f?'on':'')+'" onclick="ckFace('+x[0]+')" aria-label="'+x[2]+'"><span>'+x[1]+'</span><i>'+x[2]+'</i></button>'; }).join('')+'</div>'+
      '<div class="ck-more'+(_ck.f?' on':'')+'"><div class="ck-k">Anything else?</div>'+
      CK_GROUPS.map(function(g){
        return '<div class="ck-g"><b>'+g[0]+'</b><div class="ck-chips">'+g[1].map(function(x){
          return '<button class="'+(_ck.tags[x[0]]?'on':'')+'" onclick="ckTag(\''+x[0]+'\')"><span>'+x[1]+'</span>'+x[2]+'</button>'; }).join('')+'</div></div>'; }).join('')+
      '</div>'+
      '<button class="bigbtn ck-go"'+(_ck.f?'':' disabled')+' onclick="ckSave()">Complete check-in</button>'+
      '<div class="ck-fine">For everyday wellbeing only, not medical advice. If something doesn\'t feel right or keeps going, see a doctor.</div></div>';
  }
  $('pw-body').innerHTML=h;
}
function ckSave(){
  if(!_ck.f) return;
  var tags=Object.keys(_ck.tags), d=ckDay(), old=d.ck||{};
  var plan=ckPlan(_ck.f,tags), done={};
  /* a change of answers later in the day keeps what was already done */
  if(old.done) plan.forEach(function(k){ if(old.done[k]) done[k]=1; });
  d.ck={f:_ck.f, tags:tags, plan:plan, done:done, at:Date.now()};
  d.mood=_ck.f; HF.save();
  _scSay='mood'; _scSayAt=Date.now();
  _ck.step='done'; ckPaint();
  try{ $('pwm').scrollTop=0; }catch(e){}
}
function ckDoneHTML(){
  var c=ckToday(); if(!c) return '';
  var n=ckName(), pose=c.f>=4?'aktif':c.f<=2?'calendar':'water';
  return '<div class="ck ck-done">'+
    '<div class="ck-bara"><img src="'+SC_POSE[pose]+'" alt="Bara"></div>'+
    '<div class="ck-h">Thanks for checking in'+(n?', '+hesc(n):'')+'</div>'+
    '<div class="ck-say"><b>Bara</b>'+hesc(ckSummary(c.f,c.tags||[]))+'</div>'+
    '<div class="ck-cal"><span>Calibrated with your check-in</span><i><em style="width:'+Math.min(100,30+10*ckDays())+'%"></em></i></div>'+
    '<div class="ck-k">Today\'s plan, updated</div>'+ckRowsHTML(c,true)+
    '<button class="bigbtn ck-go" onclick="ckClose()">Got it</button>'+
    '<button class="ck-edit" onclick="ckOpen()">Change my answers</button></div>';
}
/* check-ins in the last 30 days, for the calibration bar */
function ckDays(){ var n=0, i; for(i=0;i<30;i++) if(ckToday(iso(-i))) n++; return n; }
function ckRowsHTML(c,sheet){
  return '<div class="scx-rows ck-rows">'+(c.plan||[]).map(function(k){
    var t=CK_TASKS[k]; if(!t) return '';
    var done=!!(c.done&&c.done[k]);
    return '<div class="scx-row'+(done?' done':'')+'" onclick="ckDo(\''+k+'\')"><span class="ic">'+glyph(t.ic)+'</span>'+
      '<div class="tx"><b>'+hesc(t.t)+'</b><span>'+hesc(t.s)+'</span></div>'+
      (done?'<span class="ok">✓</span>':'<button onclick="event.stopPropagation();ckDo(\''+k+'\')">'+(t.x==='play'?'Start':t.x==='ep'?'Watch':'Do it')+'</button>')+'</div>'; }).join('')+'</div>';
}
function ckClose(){ if(typeof closeProduct==='function') closeProduct(); else $('pwm').classList.remove('on'); if(typeof scRender==='function') scRender(); }
/* each task does its thing, and counts as done */
function ckMark(k){ var d=ckDay(); if(!d.ck) return; d.ck.done=d.ck.done||{}; d.ck.done[k]=1; HF.save(); }
function ckDo(k){
  var c=ckToday(); if(!c) return;
  if(c.done && c.done[k]){ return; }
  ckMark(k);
  var go=function(){ if($('pwm') && $('pwm').classList.contains('on')) ckClose(); };
  if(k==='water2'){ go(); scSet('water',scDaily().water+2); _scSay='water'; _scSayAt=Date.now();
    if(typeof scBanner==='function') scBanner('+2 glasses of water 💧',scDaily().water+'/'+SC_WATER+' today'); scRender(); return; }
  if(k==='stretch' || k==='mobility'){ go(); ckPlay(k==='stretch'?CK_STRETCH:CK_MOBILITY, k==='stretch'?'4-minute stretch with Bara':'Easy mobility'); return; }
  if(k==='protein' || k==='snack' || k==='fibre'){ go(); switchTab('eat'); return; }
  if(k==='fullwo' || k==='lightwo'){ go(); if(typeof scTap==='function') scTap('workout'); else switchTab('train'); return; }
  if(k==='weigh'){ go(); if(typeof askWeight==='function') askWeight(); return; }
  if(CK_TASKS[k].x==='ep'){ go(); if(typeof openAcademy==='function') openAcademy(k); return; }
  /* the walk and the early night are promises: ticked, with a word from Bara */
  if(typeof toast==='function') toast(k==='sleep'?'Bara will remind you to rest tonight 🌙':'Ticked. Enjoy the walk 👟');
  if($('pwm') && $('pwm').classList.contains('on')) ckPaint(); else if(typeof scRender==='function') scRender();
}
function ckPlay(list,name){
  if(typeof DB==='undefined' || typeof startWorkout!=='function') return;
  var exs=list.map(function(x){ var e=DB.find(function(d){ return d.n===x[0]; }); return e?Object.assign({},e,{dur:x[1]}):null; }).filter(Boolean);
  if(exs.length) startWorkout(exs,{name:name, rounds:1});
}
/* on Today's Plan: the check-in's three, under the plan's own row */
function ckPlanHTML(){
  var c=ckToday(); if(!c || !c.plan || !c.plan.length) return '';
  var left=c.plan.filter(function(k){ return !(c.done&&c.done[k]); }).length;
  return '<div class="ck-plan"><div class="ck-pk"><span>From your check-in</span><b>'+(left?left+' to go':'All done ✓')+'</b></div>'+ckRowsHTML(c,false)+'</div>';
}
