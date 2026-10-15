/* ═══════════════ SKOR HITFAT · phase 1 ═══════════════
   Simple's Success Score, the HITFAT+ way. Bell, the kettlebell mascot, sits
   in an arc that fills 0–100 with today's habits; under it, one ring a habit
   with its own way in; over it, Bell says something about the day.

     Workout   a session finished today (HF.data.sessions)        → Train
     Makan     meals logged today, 3 fill it (HF.data.meals)      → Eat
     Air       glasses today, 8 fill it (HF.data.daily)           → sheet
     Langkah   steps today, 8,000 fill it (HF.data.daily)         → sheet
     Puasa     today's fast against the IF plan (HF.data.ifs)     → IF HITFAT
               counted only for a member with an IF plan, so no one is
               marked down for a habit they never took up

   Each habit counted is an equal share of 100. Bell's look follows the score
   (the four stages of the artwork); the Progress page keeps the weekly one.
   Phase 2 (streaks, share card) and 3 (rust and shine) come later. ES5. */

var SC_WATER=8, SC_STEPS=8000, SC_MEALS=3;
/* the fast is not part of the score for now (Seth, 15 Oct 2026): four rings for
   everyone. IF HITFAT keeps its own timer; true brings the fifth ring back,
   with Mod Ramadan (and SC_FAST_LIVE in plus-push to match) */
var SC_FAST_LIVE=false;
/* Bell's poses (img/mascot/anim/, each a clip with its first frame as poster): the moments and the habit reactions */
var SC_POSE={aktif:'/img/mascot/anim/aktif.png', gold:'/img/mascot/anim/gold.png', frozen:'/img/mascot/anim/frozen.jpg', halo:'/img/mascot/anim/halo.png',
  water:'/img/mascot/anim/water.png', meal:'/img/mascot/anim/meal.png', calendar:'/img/mascot/anim/calendar.png'};
/* the moment's slot: the pose's poster now, its clip once it plays */
function scMomentBell(name,extra){ return '<div class="scc-bell scc-live'+(extra?' '+extra:'')+'" id="scc-bell"><img src="'+SC_POSE[name]+'" alt="Bell"></div>'; }
function scMomentPlay(name){ if(typeof bellMini==='function') bellMini($('scc-bell'),name); }
var _scSay=null, _scSayAt=0;

/* a saved date (ISO string) as the local day it fell on */
function scDayOf(v){ var x=new Date(v); return x.getFullYear()+'-'+('0'+(x.getMonth()+1)).slice(-2)+'-'+('0'+x.getDate()).slice(-2); }
function scDaily(d){ var all=HF.data.daily||{}; var o=all[d||iso(0)]||{}; return {water:o.water||0, steps:o.steps||0, ram:o.ram||0}; }
function scSet(k,v){
  var all=HF.data.daily||(HF.data.daily={}), d=iso(0), o=all[d]||(all[d]={water:0,steps:0});
  o[k]=Math.max(0,Math.round(v)); HF.save();
}
function scWorkouts(d,days){
  if(days) return days[d]||0;
  var s=HF.data.sessions||{}, n=0, k;
  for(k in s){ if(s.hasOwnProperty(k) && s[k] && s[k].date && scDayOf(s[k].date)===d) n++; }
  return n;
}
function scWorkoutDays(){
  var s=HF.data.sessions||{}, out={}, k, d;
  for(k in s){ if(s.hasOwnProperty(k) && s[k] && s[k].date){ d=scDayOf(s[k].date); out[d]=(out[d]||0)+1; } }
  return out;
}
function scHasIF(){ var f=HF.data.ifs||{}; return !!(f.plan && !f.plan.blocked); }
/* hours fasted toward today: a fast that ended today, or the one running now */
function scFast(d){
  var f=HF.data.ifs||{}, best=0, tgt=16, i, x;
  for(i=0;i<(f.log||[]).length;i++){ x=f.log[i]; if(scDayOf(x.end)===d && x.hrs>best){ best=x.hrs; tgt=x.target; } }
  if(f.active && d===iso(0)){ var h=(Date.now()-f.active.at)/36e5; if(h>best){ best=h; tgt=f.active.target; } }
  return {hrs:best, target:tgt};
}

/* today's habits, each with how full it is (0–1) */
function scHabits(d,days){
  d=d||iso(0);
  var dy=scDaily(d), w=scWorkouts(d,days), m=(HF.data.meals&&HF.data.meals[d]||[]).length, out=[];
  var k1=function(n){ return n>=1000?(Math.round(n/100)/10)+'k':String(n); };
  out.push({k:'workout', n:'Workout', ic:'workout', c:'#E30613', v:Math.min(1,w), val:Math.min(w,1)+'/1'});
  out.push({k:'meal',    n:'Meals',   ic:'food',    c:'#FF8A3D', v:Math.min(1,m/SC_MEALS), val:Math.min(m,SC_MEALS)+'/'+SC_MEALS});
  out.push({k:'water',   n:'Water',     ic:'water',   c:'#3B82F6', v:Math.min(1,dy.water/SC_WATER), val:Math.min(dy.water,SC_WATER)+'/'+SC_WATER});
  out.push({k:'steps',   n:'Steps', ic:'steps',   c:'#22C55E', v:Math.min(1,dy.steps/SC_STEPS), val:k1(dy.steps)+'/'+k1(SC_STEPS)});
  if(!SC_FAST_LIVE){}
  else if(typeof scRamadan==='function' && scRamadan(d)) out.push({k:'fast', n:'Fast', ic:'moon', c:'#E30613', v:dy.ram?1:0, val:dy.ram?'Done':'Not yet'});
  else if(scHasIF()){ var f=scFast(d); out.push({k:'fast', n:'Fast', ic:'clock', c:'#A855F7', v:Math.min(1,f.hrs/f.target), val:Math.min(Math.floor(f.hrs),f.target)+'/'+f.target+'h'}); }
  for(var i=0;i<out.length;i++) if(out[i].v>=1) out[i].val='✓ '+out[i].val;
  return out;
}
function scScore(d,days){
  var hs=scHabits(d,days), t=0, i;
  for(i=0;i<hs.length;i++) t+=hs[i].v;
  return Math.round(t/hs.length*100);
}
/* HITFAT's colours: a pale white when the day is thin, red as it fills, gold
   when it is padu (black, white and red are the brand; gold is the prize) */
function scColor(s){ return s>=70?'#FFC20E':s>=40?'#E30613':'#A1A1AA'; }
function scLevel(s){ return s>=80?4:s>=50?3:s>=25?2:1; }

/* what Bell says: about what was just done, or else the habit furthest behind */
var SC_LINES={
  workout:['Workout siap! Bell nak squat sekali, tapi Bell takde lutut 😅','Padu! Peluh tu tanda lemak tengah menangis 💪'],
  meal:['Makanan direkod! Bell suka orang yang jujur 🍽️','Dah makan? Bagus. Protein dulu, nasi ikut porsi 👍'],
  water:['Glup glup! 💧 Bell pun rasa segar.','Air masuk! Badan anda berterima kasih 💧'],
  steps:['Langkah demi langkah 👟 Bell kagum!','Kaki anda hari ni lagi rajin dari Bell 👟']
};
function scLine(){
  var s=scScore(), hs=scHabits(), i, low=null;
  if(_scSay==='junk' && Date.now()-_scSayAt<120000 && typeof scJunkLine==='function') return scJunkLine(_scJunkName);
  if(_scSay && SC_LINES[_scSay] && Date.now()-_scSayAt<120000){ var a=SC_LINES[_scSay]; return a[new Date().getMinutes()%a.length]; }
  if(s>=100) return 'Skor penuh! Bell rasa macam juara dunia 🏆';
  for(i=0;i<hs.length;i++) if(hs[i].v<1 && (!low || hs[i].v<low.v)) low=hs[i];
  var hint=!low?'':low.k==='water'?'Tinggal '+(SC_WATER-scDaily().water)+' gelas air lagi.':
           low.k==='steps'?'Tinggal '+Math.max(0,SC_STEPS-scDaily().steps).toLocaleString('en-MY')+' langkah lagi.':
           low.k==='meal'?'Jangan lupa rekod makanan anda.':
           low.k==='workout'?'Satu workout pendek pun cukup hari ni.':
           'Puasa anda belum capai sasaran.';
  if(s===0) return 'Bell masih mamai 😴 '+hint;
  if(s<40) return 'Bell baru bangun. '+hint;
  if(s<70) return 'Separuh jalan! '+hint;
  return 'Hari yang padu! 🔥 '+hint;
}
/* something was just done: Bell talks about it */
function scEvent(k){ _scSay=k; _scSayAt=Date.now(); scRender(); }

/* the arc: 240°, open at the bottom, a knob where the score reaches */
function scArc(s){
  var cx=120, cy=118, r=100, a0=150, sweep=240;
  function pt(a){ var t=a*Math.PI/180; return (cx+r*Math.cos(t)).toFixed(1)+' '+(cy+r*Math.sin(t)).toFixed(1); }
  var d='M'+pt(a0)+' A'+r+' '+r+' 0 1 1 '+pt(a0+sweep), c=scColor(s), k=pt(a0+sweep*Math.max(0,Math.min(1,s/100))).split(' ');
  return '<svg class="sc-arc" viewBox="0 0 240 184" aria-hidden="true">'+
    '<path d="'+d+'" class="sc-arc-t" pathLength="100"/>'+
    (s>0?'<path d="'+d+'" class="sc-arc-v" pathLength="100" stroke="'+c+'" stroke-dasharray="'+s+' 100"/>':'')+
    '<circle cx="'+k[0]+'" cy="'+k[1]+'" r="9" fill="var(--surface)" stroke="'+c+'" stroke-width="5"/></svg>';
}
function scRing(h){
  var c=h.v>=1?'#FFC20E':'#E30613';
  return '<button class="sc-h'+(h.v>=1?' full':'')+'" onclick="scTap(\''+h.k+'\')" aria-label="'+h.n+'">'+
    '<span class="sc-ring" style="color:'+c+'"><svg viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="26" r="22" class="sc-ring-t"/>'+
    (h.v>0?'<circle cx="26" cy="26" r="22" class="sc-ring-v" pathLength="100" stroke="currentColor" stroke-dasharray="'+Math.round(h.v*100)+' 100"/>':'')+
    '</svg><span class="sc-ic"'+(h.v>0?' style="color:'+c+'"':'')+'>'+glyph(h.ic)+'</span>'+(h.v<1?'<span class="sc-plus">+</span>':'')+'</span>'+
    '<b>'+h.val+'</b><span class="sc-l">'+h.n+'</span></button>';
}
/* the card takes the score's colour, as Simple's screens do (A); Bell's
   look and liveliness follow the stage (B, and bell.js) */
function scRGB(c){ var n=parseInt(c.slice(1),16); return (n>>16&255)+','+(n>>8&255)+','+(n&255); }
function scTint(c){ return 'rgba('+scRGB(c)+',.16)'; }
function scHTML(){
  var s=scScore(), lv=scLevel(s), M=(typeof hfm==='function')?hfm():null, st=scState(), c=st.k==='rust'?'#A6541E':scColor(s);
  var poster=(typeof bellPoster==='function')?bellPoster(st.k?1:lv):(M&&M.config.images[lv-1]), fx='';
  if(st.k==='rust'){ poster=SC_ART.rust||poster; if(!SC_ART.rust) fx='<span class="sc-rustfx" style="-webkit-mask-image:url('+poster+');mask-image:url('+poster+')"></span>'; }
  var img=poster?'<img class="sc-poster" src="'+poster+'" alt="Bell'+(st.k==='rust'?' berkarat':', tahap '+lv)+'">'+fx:'';
  return '<div class="sc" style="--scc:'+scRGB(c)+'">'+
    '<div class="sc-head"><div><div class="sc-k">HITFAT Score · Today</div><div class="sc-n" style="color:'+scColor(s)+'"><i>'+s+'</i><span>/100</span></div></div>'+
      scChip()+'</div>'+
    '<div class="sc-stage">'+scArc(s)+'<div class="sc-bell '+(st.k?'sc-'+st.k:'sc-lv'+lv)+'" id="sc-bell" onclick="scPoke()" role="button" aria-label="Touch Bell">'+img+'</div></div>'+
    '<div class="sc-say'+(st.k?' sc-say-'+st.k:'')+'" id="sc-say">'+hesc(st.k?scRustLine(st):scLine())+'</div>'+
    '<div class="sc-hs">'+scHabits().map(scRing).join('')+'</div>'+
    (typeof scCoachHTML==='function'?scCoachHTML():'')+
    (typeof pushInvite==='function'?pushInvite():'')+'</div>'+
    (typeof scPlanHTML==='function'?scPlanHTML():'');
}
var _scCheered=0;
function scRender(){
  var el=$('mascot-home'); if(!el) return;
  el.innerHTML=scHTML();
  /* Bell alive, except rusty: a rusty kettlebell does not move */
  var slot=$('sc-bell'), st=scState(), lv=scLevel(scScore());
  if(slot && st.k!=='rust' && typeof bellAttach==='function' && bellAttach(slot, st.k?1:lv)){
    slot.className+=' sc-live';
    if(_scSay && _scSay!=='poke' && _scSayAt>_scCheered && Date.now()-_scSayAt<8000){
      _scCheered=_scSayAt;
      /* each habit its own clip; its poster shows till the clip plays */
      var R={water:'water', meal:'meal', junk:'giggle', workout:'squat', steps:'walk'};
      bellReact(R[_scSay]||'cheer');
    } else if(_scPose.until>Date.now()+150) scPose(slot,_scPose.src,_scPose.until-Date.now());
  }
  if(typeof scCheckMeet==='function' && scCheckMeet()) return;
  if(scCheckShine()) return;
  if(scCheckFreeze()) return;
  if(scCheckRust()) return;
  if(typeof scCheckWeekly==='function' && scCheckWeekly()) return;
  scCheckStreak();
}
function scCheckFreeze(){
  if($('scc').style.display==='flex') return false;
  var f=scApplyFreeze(); if(!f.length) return false;
  scFreezeScreen(f); return true;
}
function scCheckRust(){
  var st=scState(), sc=HF.data.sc||(HF.data.sc={}), seen=sc.seen||(sc.seen={}), key='rust:'+iso(0);
  if(st.k!=='rust' || seen[key] || $('scc').style.display==='flex') return false;
  seen[key]=1; HF.save(); scRustScreen(st); return true;
}
/* a pose for a moment (Bell with the water bottle, with the plate), then back */
var _scPose={src:'', until:0};
function scPose(slot,src,ms){
  ms=ms||2600; _scPose={src:src, until:Date.now()+ms};
  var im=document.createElement('img'); im.className='sc-pose'; im.src=src; im.alt='';
  if(ms<2600){ im.style.webkitAnimationDelay=im.style.animationDelay='-'+((2600-ms)/1000)+'s'; }
  slot.appendChild(im); slot.className+=' posing';
  setTimeout(function(){ if(im.parentNode) im.parentNode.removeChild(im); slot.className=slot.className.replace(/ ?posing/g,''); },ms);
}
/* touch Bell: a giggle, and a word */
SC_LINES.poke=['Hihi, geli! 😆','Eh eh, Bell tengah fokus ni 😤','Hehe, sentuh lagi? 🙈','Bell sihat, terima kasih tanya 💪'];
var _scPokes=0;
function scPoke(){
  if(scState().k==='rust'){ toast('Bell has rusted 🥲 Log one thing to polish him'); return; }
  if(typeof bellReact==='function') bellReact('giggle');
  var el=$('sc-say'); if(el){ el.className='sc-say'; el.textContent=SC_LINES.poke[(_scPokes++)%SC_LINES.poke.length]; }
}

/* each habit's way in */
function scTap(k){
  if(k==='workout') return switchTab('train');
  if(k==='meal') return switchTab('eat');
  if(k==='fast') return typeof scFastTap==='function'?scFastTap():openIF();
  if(k==='water' && typeof scWaterTap==='function') return scWaterTap();
  scSheet(k);
}
function scSheet(k){
  var dy=scDaily(), h='<div class="pwtop"><span></span><button class="pwx" aria-label="Close" onclick="scClose()">✕</button></div>';
  if(k==='water'){
    h+='<div class="sc-sh"><div class="sc-sh-k">Water today</div><div class="sc-sh-n">'+dy.water+'<span> / '+SC_WATER+' glasses</span></div>'+
      '<div class="sc-sh-ctl"><button onclick="scWater(-1)" aria-label="One glass less">−</button><button class="on" onclick="scWater(1)" aria-label="One glass more">+ 1 glass</button></div>'+
      '<div class="sc-sh-f">A glass is about 250 ml.</div></div>';
  } else {
    h+='<div class="sc-sh"><div class="sc-sh-k">Steps today</div><div class="sc-sh-n">'+dy.steps.toLocaleString('en-MY')+'<span> / '+SC_STEPS.toLocaleString('en-MY')+'</span></div>'+
      '<div class="sc-sh-ctl"><button onclick="scSteps(1000)">+1,000</button><button onclick="scSteps(2000)">+2,000</button><button onclick="scSteps(5000)">+5,000</button></div>'+
      '<div class="sc-sh-in"><input class="inp" id="sc-steps" type="number" inputmode="numeric" placeholder="Total from your phone" min="0">'+
      '<button class="bigbtn" onclick="scStepsSet()">Simpan</button></div>'+
      '<div class="sc-sh-f">Check your steps in Apple Health or Google Fit, then enter the total here.</div></div>';
  }
  $('pw-body').innerHTML=h; $('pwm').classList.add('on');
  try{ $('pwm').scrollTop=0; }catch(e){}
  scSheet._k=k;
}
function scClose(){ closeProduct(); scRender(); }
function scWater(n){ scSet('water',scDaily().water+n); if(n>0){ _scSay='water'; _scSayAt=Date.now(); } scSheet('water'); scRender(); }
function scSteps(n){ scSet('steps',scDaily().steps+n); _scSay='steps'; _scSayAt=Date.now(); scSheet('steps'); scRender();
  if(typeof scBanner==='function') scBanner('+'+n.toLocaleString('en-MY')+' steps 👟',scDaily().steps.toLocaleString('en-MY')+'/'+SC_STEPS.toLocaleString('en-MY')+' today · Kaki anda rajin!'); }
function scStepsSet(){
  var v=parseInt(($('sc-steps')||{}).value,10);
  if(!(v>=0) || v>100000){ toast('Enter your steps'); return; }
  scSet('steps',v); _scSay='steps'; _scSayAt=Date.now(); scClose();
}


/* ═══════════════ phase 2 · streaks ═══════════════
   A day counts when its score reached SC_PADU ("hari padu"). The streak is
   the run of such days up to today, or up to yesterday while today is still
   being earned. Reaching 3, 7, 14, 30, 60 or 100 days opens a celebration
   once per run, with a card the member can share to an IG Story. */
var SC_PADU=50, SC_MILES=[3,7,14,30,60,100];
var SC_MILE_LINES={3:'Permulaan yang padu! Bell dah nampak potensi anda 🔥',
  7:'Seminggu penuh! Bell bangga gila 💪',14:'Dua minggu! Ini dah jadi tabiat, bukan lagi usaha.',
  30:'30 hari! Anda juara sebenar 🏆',60:'60 hari! Badan anda dah lain, kan? 😎',100:'100 hari! Bell tabik spring 🫡'};

var SC_FREEZES=2;
function scFrozen(){ var sc=HF.data.sc||(HF.data.sc={}); return sc.frozen||(sc.frozen={}); }
function scStreak(){
  var days=scWorkoutDays(), fz=scFrozen(), n=0, i=0, d, start=null;
  if(scScore(iso(0),days)<SC_PADU) i=1;            /* today is still in progress */
  for(;i<400;i++){
    d=iso(-i);
    if(scScore(d,days)>=SC_PADU){ n++; start=d; }
    else if(!fz[d]) break;                         /* a frozen day keeps the run, adds nothing */
  }
  return {n:n, start:start, today:scScore(iso(0),days)>=SC_PADU};
}
function scFreezeLeft(){
  var m=iso(0).slice(0,7), f=scFrozen(), used=0, k;
  for(k in f) if(f.hasOwnProperty(k) && k.slice(0,7)===m) used++;
  return Math.max(0,SC_FREEZES-used);
}
/* the days missed since the last hari padu, frozen if there are freezes for
   all of them; returns the days frozen now */
function scApplyFreeze(){
  var days=scWorkoutDays(), fz=scFrozen(), miss=[], i, d, found=false;
  for(i=1;i<=SC_FREEZES+1;i++){
    d=iso(-i);
    if(scScore(d,days)>=SC_PADU){ var p=iso(-(i+1)); found=scScore(p,days)>=SC_PADU || !!fz[p]; break; }
    if(!fz[d]) miss.push(d);
  }
  if(!found || !miss.length || miss.length>scFreezeLeft()) return [];
  for(i=0;i<miss.length;i++) fz[miss[i]]=1;
  HF.save();
  return miss;
}
function scNextMile(n){ for(var i=0;i<SC_MILES.length;i++) if(SC_MILES[i]>n) return SC_MILES[i]; return null; }
function scChip(){
  var st=scStreak();
  if(!st.n) return '<button class="sc-chip off" onclick="scStreakInfo()">🔥 0</button>';
  return '<button class="sc-chip" onclick="scCelebrate('+st.n+',true)">🔥 '+st.n+' hari</button>';
}
/* a milestone reached on this run and not yet celebrated */
function scCheckStreak(){
  var st=scStreak(), sc=HF.data.sc||(HF.data.sc={}), seen=sc.seen||(sc.seen={}), m=0, i, key;
  if(!st.n || $('scc').style.display==='flex') return;
  for(i=0;i<SC_MILES.length;i++) if(st.n>=SC_MILES[i]) m=SC_MILES[i];
  if(!m) return;
  key=st.start+':'+m;
  if(seen[key]) return;
  seen[key]=1; HF.save();
  scCelebrate(m,false);
}
function scStreakInfo(){
  toast('Score '+SC_PADU+' in a day to start a streak 🔥');
}
/* this week, Monday first: padu, frozen, today, still to come */
function scWeekPill(){
  var days=scWorkoutDays(), fz=scFrozen(), t=new Date(), dow=(t.getDay()+6)%7, out='', i, d, off, cls, mark;
  var L=['M','T','W','T','F','S','S'];
  for(i=0;i<7;i++){
    off=dow-i; d=iso(-off);
    cls=off<0?'fut':scScore(d,days)>=SC_PADU?'on':fz[d]?'fz':'';
    if(off===0) cls+=' now';
    mark=cls.indexOf('on')>=0?'✓':cls.indexOf('fz')>=0?'❄':'';
    out+='<div class="scc-d '+cls+'"><span>'+L[i]+'</span><b>'+mark+'</b></div>';
  }
  return '<div class="scc-week">'+out+'</div>';
}
function scCelebrate(n,mine){
  var gold=n>=7, pose=gold?'gold':'calendar', next=scNextMile(n), conf='', i;
  var cols=['#E30613','#FFC20E','#FFFFFF','#111111'];
  if(!mine) for(i=0;i<24;i++) conf+='<i style="left:'+((i*37)%100)+'%;background:'+cols[i%cols.length]+';-webkit-animation-delay:'+(i%8)*0.18+'s;animation-delay:'+(i%8)*0.18+'s"></i>';
  var line=SC_MILE_LINES[n]||(next?'Tinggal '+(next-n)+' hari lagi ke sasaran '+next+' hari. Jangan putus! 🔥':'Teruskan, juara 🔥');
  $('scc').className='scc '+(gold?'scc-gold':'scc-red');
  $('scc').innerHTML='<div class="scc-conf">'+conf+'</div><div class="scc-in">'+
    scMomentBell(pose)+
    '<div class="scc-t">'+(gold?'<b>'+n+'-day</b> streak! 🏆':'You\'re on a <b>'+n+'-day</b> streak')+'</div>'+
    '<div class="scc-s">'+hesc(line)+'</div>'+
    scWeekPill()+
    '<div class="scc-fz">❄️ '+scFreezeLeft()+'/'+SC_FREEZES+' freezes left this month'+(next?' · Next goal: '+next+' days':'')+'</div>'+
    '<button class="bigbtn scc-share" onclick="scShare('+n+')">Share milestone</button>'+
    '<button class="scc-x" onclick="scCelebrateClose()">Next</button>'+
    '<div class="scc-fine">A strong day is a HITFAT Score of '+SC_PADU+' or more. A freeze saves your streak when you miss a day.</div></div>';
  $('scc').style.display='flex'; scMomentPlay(pose);
}
/* a freeze was used: Bell in ice, the run safe */
function scFreezeScreen(frozen){
  var st=scStreak();
  $('scc').className='scc scc-ice';
  $('scc').innerHTML='<div class="scc-in">'+
    scMomentBell('frozen','scc-still')+
    '<div class="scc-t">Streak saved ❄️</div>'+
    '<div class="scc-s">Your <b>'+st.n+'-day</b> streak is safe: '+frozen.length+(frozen.length>1?' freezes':' freeze')+' used for '+(frozen.length>1?'the days':'the day')+' you missed, '+scFreezeLeft()+'/'+SC_FREEZES+' left this month.</div>'+
    '<div class="scc-s scc-bellsays">Bell beku sekejap untuk anda 🥶 Jom pastikan skor hari ni 50 ke atas.</div>'+
    '<button class="bigbtn scc-share" onclick="scCelebrateClose()">Continue</button></div>';
  $('scc').style.display='flex'; scMomentPlay('frozen');
}
/* Bell has rusted: the black screen, once a day */
function scRustScreen(st){
  var p=(typeof bellPoster==='function')?bellPoster(1):'';
  $('scc').className='scc scc-black';
  $('scc').innerHTML='<div class="scc-in">'+
    '<div class="scc-bell scc-still scc-rusty"><img src="'+p+'" alt="Rusty Bell"><span class="sc-rustfx" style="-webkit-mask-image:url('+p+');mask-image:url('+p+')"></span></div>'+
    '<div class="scc-t">Bell has rusted</div>'+
    '<div class="scc-s">'+st.idle+' days with nothing logged.</div><div class="scc-s scc-bellsays">Bell duduk sorang-sorang dalam gelap 🥲 Satu rekod pun cukup untuk gilap Bell semula.</div>'+
    '<button class="bigbtn scc-share" onclick="scCelebrateClose();scSheet(\'water\')">Polish Bell: log a glass of water</button>'+
    '<button class="scc-x" onclick="scCelebrateClose()">Later</button></div>';
  $('scc').style.display='flex';
}
function scCelebrateClose(){ $('scc').style.display='none'; $('scc').innerHTML=''; $('scc').className='scc'; }

/* the share card: 1080 × 1920, drawn on a canvas, shared as a file where the
   phone allows it, otherwise shown to keep with a long press */
function scCard(n,done){
  var M=(typeof hfm==='function')?hfm():null, cv=document.createElement('canvas');
  if(!cv.getContext){ done(null); return; }
  cv.width=1080; cv.height=1920;
  var g=cv.getContext('2d'), img=new Image();
  var bg=g.createRadialGradient(540,700,80,540,800,1200);
  bg.addColorStop(0,'#5A0A0E'); bg.addColorStop(.55,'#1A0607'); bg.addColorStop(1,'#0B0B0D');
  g.fillStyle=bg; g.fillRect(0,0,1080,1920);
  function text(t,x,y,size,col,w){ g.font=(w||800)+' '+size+'px -apple-system, "Helvetica Neue", Arial, sans-serif'; g.fillStyle=col; g.textAlign='center'; g.fillText(t,x,y); }
  function finish(){
    g.font='800 64px -apple-system, "Helvetica Neue", Arial, sans-serif'; g.textAlign='left';
    var w1=g.measureText('HITFAT').width, w2=g.measureText('+').width, x0=540-(w1+w2)/2;
    g.fillStyle='#FFFFFF'; g.fillText('HITFAT',x0,190); g.fillStyle='#E30613'; g.fillText('+',x0+w1,190);
    text(String(n),540,1390,300,'#FFFFFF');
    text('STRONG DAYS IN A ROW',540,1480,52,'#FFC20E',800);
    text('HITFAT Score '+SC_PADU+'+ every day',540,1560,42,'rgba(255,255,255,.75)',600);
    text('app.hitfat.io',540,1800,40,'rgba(255,255,255,.55)',600);
    g.fillStyle='#FFC20E'; g.font='90px sans-serif'; g.fillText('✦',200,420); g.fillText('✦',880,360); g.font='60px sans-serif'; g.fillText('✦',930,760);
    done(cv);
  }
  if(M && M.config.images[3]){ img.onload=function(){ g.drawImage(img,190,280,700,700); finish(); }; img.onerror=finish; img.src=M.config.images[3]; }
  else finish();
}
function scShare(n){
  scCard(n,function(cv){
    if(!cv){ toast('Couldn\'t make the card on this device'); return; }
    var text='🔥 '+n+' strong days in a row with HITFAT+! app.hitfat.io';
    var fallback=function(){
      $('scc').innerHTML='<div class="scc-in"><img class="scc-card" src="'+cv.toDataURL('image/png')+'" alt="Kad streak">'+
        '<div class="scc-s">Press and hold the picture to save it, then share it to your IG Story.</div>'+
        '<button class="scc-x" onclick="scCelebrateClose()">Close</button></div>';
    };
    if(!cv.toBlob){ fallback(); return; }
    cv.toBlob(function(b){
      var f=null; try{ f=new File([b],'hitfat-streak-'+n+'.png',{type:'image/png'}); }catch(e){}
      if(f && navigator.canShare && navigator.canShare({files:[f]})){
        navigator.share({files:[f], text:text}).catch(function(){});
      } else fallback();
    },'image/png');
  });
}


/* ═══════════════ phase 3 · rust and shine ═══════════════
   A kettlebell left alone rusts. A day "kosong" is a day with nothing at all
   logged (score 0). Two kosong days in a row and Bell gathers dust; three,
   and Bell rusts. Log anything after a rusty spell and Bell shines again,
   with a moment of its own. Until the drawn rusty and shiny Bells come, the
   looks are effects on the artwork: SC_ART can name them later. */
var SC_ART={rust:null, shine:null};

/* empty days from `from` days ago backwards to the last day with anything
   logged; -1 when nothing was ever logged (a new member never rusts) */
function scGap(from,days){
  for(var i=from;i<120;i++) if(scScore(iso(-i),days)>0) return i-from;
  return -1;
}
function scState(){
  var days=scWorkoutDays(), today=scScore(iso(0),days)>0, g=scGap(1,days);
  if(g<0) return {k:'', idle:0, back:false};
  if(today) return {k:'', idle:0, back:g>=2};
  var idle=g+1;
  return {k: idle>=3?'rust':idle===2?'dust':'', idle:idle, back:false};
}
function scRustLine(st){
  if(st.k==='rust') return 'Bell dah berkarat 🥲 '+st.idle+' hari tanpa apa-apa. Gilap Bell: rekod satu perkara hari ni, segelas air pun boleh.';
  return 'Bell mula berhabuk... 😟 Rekod sesuatu hari ni supaya Bell tak berkarat esok.';
}
/* back after a rusty spell: once a day */
function scCheckShine(){
  var st=scState(), sc=HF.data.sc||(HF.data.sc={}), seen=sc.seen||(sc.seen={}), key='shine:'+iso(0);
  if(!st.back || seen[key] || $('scc').style.display==='flex') return false;
  seen[key]=1; HF.save(); scShine(); return true;
}
function scShine(){
  var sp='', i;
  for(i=0;i<14;i++) sp+='<i style="left:'+((i*29+7)%92)+'%;top:'+(6+(i*41+11)%34)+'%;-webkit-animation-delay:'+(i%7)*0.2+'s;animation-delay:'+(i%7)*0.2+'s">✦</i>';
  $('scc').className='scc scc-red';
  $('scc').innerHTML='<div class="scc-spark">'+sp+'</div><div class="scc-in">'+
    scMomentBell('halo','scc-shine')+
    '<div class="scc-t">You saved Bell!</div>'+
    '<div class="scc-s scc-bellsays">Yay! Karat dah hilang ✨ Okay okay, Bell maafkan anda. Jangan tinggal Bell lama-lama lagi ya 😇</div>'+
    '<button class="bigbtn scc-share" onclick="scCelebrateClose()">Let\'s go!</button></div>';
  $('scc').style.display='flex'; scMomentPlay('halo');
}
