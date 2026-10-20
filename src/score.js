/* ═══════════════ SKOR HITFAT · phase 1 ═══════════════
   Simple's Success Score, the HITFAT+ way. Bara, the HITFAT mascot, sits
   in an arc that fills 0–100 with today's habits; under it, one ring a habit
   with its own way in; over it, Bara says something about the day.

     Workout   a session finished today (HF.data.sessions)        → Train
     Makan     meals logged today, 3 fill it (HF.data.meals)      → Eat
     Air       glasses today, 8 fill it (HF.data.daily)           → sheet
     Langkah   steps today, 8,000 fill it (HF.data.daily)         → sheet
     Puasa     today's fast against the IF plan (HF.data.ifs)     → IF HITFAT
               counted only for a member with an IF plan, so no one is
               marked down for a habit they never took up

   Each habit counted is an equal share of 100. Bara's look follows the score
   (the four stages of the artwork); the Progress page keeps the weekly one.
   Phase 2 (streaks, share card) and 3 (rust and shine) come later. ES5. */

var SC_WATER=8, SC_STEPS=8000, SC_MEALS=3;
/* the fast is not part of the score for now (Seth, 15 Oct 2026): four rings for
   everyone. IF HITFAT keeps its own timer; true brings the fifth ring back,
   with Mod Ramadan (and SC_FAST_LIVE in plus-push to match) */
var SC_FAST_LIVE=false;
/* Bara's poses (img/mascot/anim/, each a clip with its first frame as poster): the moments and the habit reactions */
var SC_POSE={hitam:'/img/mascot/anim/hitam.png', aktif:'/img/mascot/anim/aktif.png', gold:'/img/mascot/anim/gold.png', frozen:'/img/mascot/anim/frozen.jpg', halo:'/img/mascot/anim/halo.png',
  water:'/img/mascot/anim/water.png', meal:'/img/mascot/anim/meal.png', calendar:'/img/mascot/anim/calendar.png', kusut:'/img/mascot/anim/kusut.png'};
/* the moment's slot: the pose's poster now, its clip once it plays */
function scPoseSrc(name){ return SC_POSE[name]||'/img/mascot/anim/'+name+'.png'; }
/* (20 Oct, the Bara audit) every picture of Bara in today's colour: the red
   pose from a strong day (50+), the cream one under it, messy when rusty */
function scTone(red,cream){ return scState().k==='rust'?'kusut':scRed()?red:cream; }
function scMomentBell(name,extra){ return '<div class="scc-bell scc-live'+(extra?' '+extra:'')+'" id="scc-bell"><img src="'+scPoseSrc(name)+'" alt="Bara"></div>'; }
function scMomentPlay(name){ if(typeof bellMini==='function') bellMini($('scc-bell'),name); }
var _scSay=null, _scSayAt=0;

/* a saved date (ISO string) as the local day it fell on */
function scDayOf(v){ var x=new Date(v); return x.getFullYear()+'-'+('0'+(x.getMonth()+1)).slice(-2)+'-'+('0'+x.getDate()).slice(-2); }
function scDaily(d){ var all=HF.data.daily||{}; var o=all[d||iso(0)]||{}; return {water:o.water||0, steps:o.steps||0, ram:o.ram||0, mood:o.mood||0}; }
function scSet(k,v){
  var all=HF.data.daily||(HF.data.daily={}), d=iso(0), o=all[d]||(all[d]={water:0,steps:0});
  o[k]=Math.max(0,Math.round(v)); HF.save();
}
/* a class at HITFAT HQ (kiosk check-in, HF.data.kelas.days from kelas.js)
   counts as that day's workout */
function scClassDays(){ var k=HF.data.kelas; return (k && Array.isArray(k.days)) ? k.days : []; }
function scWorkouts(d,days){
  if(days) return days[d]||0;
  var s=HF.data.sessions||{}, n=0, k;
  for(k in s){ if(s.hasOwnProperty(k) && s[k] && s[k].date && scDayOf(s[k].date)===d) n++; }
  if(scClassDays().indexOf(d)>=0) n++;
  return n;
}
function scWorkoutDays(){
  var s=HF.data.sessions||{}, out={}, k, d, cd=scClassDays(), i;
  for(k in s){ if(s.hasOwnProperty(k) && s[k] && s[k].date){ d=scDayOf(s[k].date); out[d]=(out[d]||0)+1; } }
  for(i=0;i<cd.length;i++) out[cd[i]]=(out[cd[i]]||0)+1;
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
  var T={workout:out[0].v>=1?'Workout done':'0/1 workout', meal:out[1].val+' meals', water:out[2].val+' glasses', steps:(dy.steps>=SC_STEPS?k1(dy.steps):out[3].val)+' steps'};
  for(var i=0;i<out.length;i++){ out[i].t=T[out[i].k]||out[i].val; if(out[i].v>=1) out[i].val='✓ '+out[i].val; }
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

/* what Bara says: about what was just done, or else the habit furthest behind */
var SC_LINES={
  workout:['Workout siap! Bara bangga sangat 💪','Hebatnya awak! Peluh tu tanda lemak terbakar 🔥'],
  meal:['Makanan dah dilog. Bagus, awak jujur! 🍽️','Dah makan? Protein dulu, nasi secukupnya ya 👍'],
  water:['Glug glug! Segarnya 💧','Air masuk! Badan awak berterima kasih 💧'],
  steps:['Langkah demi langkah, Bara kagum! 👟','Wah, kaki awak lagi aktif dari Bara hari ni 👟']
};
function scLine(){
  var s=scScore(), hs=scHabits(), i, low=null;
  if(_scSay==='junk' && Date.now()-_scSayAt<120000 && typeof scJunkLine==='function') return scJunkLine(_scJunkName);
  if(_scSay==='mood' && Date.now()-_scSayAt<120000 && typeof scMoodLine==='function') return scMoodLine(scDaily().mood);
  if(_scSay && SC_LINES[_scSay] && Date.now()-_scSayAt<120000){ var a=SC_LINES[_scSay]; return a[new Date().getMinutes()%a.length]; }
  /* Bara speaks Malay, calls himself Bara and the member awak (16 Oct, the user's style A); the cards around him stay English */
  if(s>=100) return '100 penuh! Bara rasa macam juara dunia 🏆';
  var hint=scHintBM();
  if(s===0) return 'Bara masih mengantuk 😴 '+hint;
  if(s<40) return 'Bara baru bangun. '+hint;
  if(s<70) return 'Dah separuh jalan! '+hint;
  return 'Hari padu! 🔥 '+hint;
}
/* the habit furthest behind, in Bara's Malay */
function scHintBM(){
  var hs=scHabits(), i, low=null;
  for(i=0;i<hs.length;i++) if(hs[i].v<1 && (!low || hs[i].v<low.v)) low=hs[i];
  return !low?'':low.k==='water'?'Lagi '+(SC_WATER-scDaily().water)+' gelas air.':
           low.k==='steps'?'Lagi '+Math.max(0,SC_STEPS-scDaily().steps).toLocaleString('en-MY')+' langkah.':
           low.k==='meal'?'Jangan lupa log makanan ya.':
           low.k==='workout'?'Satu workout pendek pun dah cukup.':
           'Puasa awak belum capai sasaran.';
}
function scHint(){
  var hs=scHabits(), i, low=null;
  for(i=0;i<hs.length;i++) if(hs[i].v<1 && (!low || hs[i].v<low.v)) low=hs[i];
  return !low?'':low.k==='water'?(SC_WATER-scDaily().water)+' more glasses of water to go.':
           low.k==='steps'?Math.max(0,SC_STEPS-scDaily().steps).toLocaleString('en-MY')+' more steps to go.':
           low.k==='meal'?'Don\'t forget to log your meals.':
           low.k==='workout'?'One short workout is enough today.':
           'Your fast hasn\'t reached its goal yet.';
}
/* something was just done: Bara talks about it */
function scEvent(k){ _scSay=k; _scSayAt=Date.now(); scRender(); }

/* the arc, after Simple's (16 Oct): a half ring over Bara, its track a soft
   tint of HITFAT red, the score in full red, a white knob ringed in red */
function scArc(s){
  var cx=120, cy=120, r=100, a0=170, sweep=200;
  function pt(a){ var t=a*Math.PI/180; return (cx+r*Math.cos(t)).toFixed(1)+' '+(cy+r*Math.sin(t)).toFixed(1); }
  var d='M'+pt(a0)+' A'+r+' '+r+' 0 1 1 '+pt(a0+sweep), c='#E30613', k=pt(a0+sweep*Math.max(0,Math.min(1,s/100))).split(' ');
  return '<svg class="sc-arc" viewBox="0 0 240 184" aria-hidden="true">'+
    '<path d="'+d+'" class="sc-arc-t" pathLength="100"/>'+
    (s>0?'<path d="'+d+'" class="sc-arc-v" pathLength="100" stroke="'+c+'" stroke-dasharray="'+s+' 100"/>':'')+
    '<circle class="sc-knob" cx="'+k[0]+'" cy="'+k[1]+'" r="7" fill="#FFFFFF" stroke="'+c+'" stroke-width="4"/></svg>';
}
function scRing(h){
  var c=h.v>=1?'#FFC20E':'#E30613';
  return '<button class="sc-h'+(h.v>=1?' full':'')+'" onclick="scTap(\''+h.k+'\')" aria-label="'+h.n+'">'+
    '<span class="sc-ring" style="color:'+c+'"><svg viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="26" r="22" class="sc-ring-t"/>'+
    (h.v>0?'<circle cx="26" cy="26" r="22" class="sc-ring-v" pathLength="100" stroke="currentColor" stroke-dasharray="'+Math.round(h.v*100)+' 100"/>':'')+
    '</svg><span class="sc-ic"'+(h.v>0?' style="color:'+c+'"':'')+'>'+glyph(h.ic)+'</span>'+(h.v<1?'<span class="sc-plus">+</span>':'<span class="sc-plus sc-okb">✓</span>')+'</span>'+
    '<b>'+h.val+'</b><span class="sc-l">'+h.n+'</span><span class="sc-t">'+hesc(h.t||h.val)+'</span></button>';
}
/* the card takes the score's colour, as Simple's screens do (A); Bara's
   look and liveliness follow the stage (B, and bell.js) */
function scRGB(c){ var n=parseInt(c.slice(1),16); return (n>>16&255)+','+(n>>8&255)+','+(n&255); }
function scTint(c){ return 'rgba('+scRGB(c)+',.16)'; }
/* Simple's two pills, top right of Home: the score (tap: Progress) and the streak */
function scPills(){
  var s=scScore(), c=s>=70?'#FFC20E':'#E30613';
  return '<button class="sc-pill" onclick="scInsights()" aria-label="HITFAT Score '+s+' of 100">'+
    '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="7.5" fill="none" stroke="#E30613" stroke-opacity=".22" stroke-width="3"/>'+
    (s>0?'<circle cx="10" cy="10" r="7.5" fill="none" stroke="'+c+'" stroke-width="3" stroke-linecap="round" pathLength="100" stroke-dasharray="'+s+' 100" transform="rotate(-90 10 10)"/>':'')+
    '</svg><b>'+s+'</b></button>'+scChip();
}
/* Bara's card, first of the swipe cards: what Bara says, and the one thing to do now */
function scAct(){
  var hs=scHabits(), i, low=null;
  for(i=0;i<hs.length;i++) if(hs[i].v<1 && (!low || hs[i].v<low.v)) low=hs[i];
  if(!low) return null;
  /* (16 Oct) a day with nothing logged starts with the easiest thing, as the line says: a glass of water */
  if(scScore()===0 && hs.some(function(h){ return h.k==='water'; })) low={k:'water'};
  return {workout:['Start a workout',"scTap('workout')"], meal:['What did you eat?',"scTap('meal')"], water:['+1 glass of water','scWaterTap()'],
          steps:['Add steps',"scSheet('steps')"], fast:['Start your fast',"scTap('fast')"]}[low.k]||null;
}
/* the card says where the day stands, Simple's "Success Score" card: the
   playful lines are Bara's, in the bubble above; this one is the plain truth */
function scInsight(st){
  var s=scScore(), h=scHint();
  if(st.k) return scRustLine(st);
  if(s>=100) return 'Full score today 🏆 Rest well. Bara will be here tomorrow.';
  if(s>=SC_PADU) return 'Strong day! Bara is red 🔥 Go for 100: '+h.charAt(0).toLowerCase()+h.slice(1);
  if(s===0) return 'Log one thing to wake Bara up. Even a glass of water counts.';
  return '<b>'+(SC_PADU-s)+' points</b> to a strong day, when Bara turns red. '+hesc(h);
}
function scBellCard(st){
  var a=st.k?['Fluff Bara up','scWaterTap()']:scAct();
  return '<div class="scx-coach scx-bell"><div class="scx-k"><i></i>HITFAT SCORE</div>'+
    '<div class="scx-say" id="sc-say">'+(st.k?hesc(scInsight(st)):scInsight(st))+'</div>'+
    '<div class="scx-btns">'+(a?'<button class="scx-act" onclick="'+a[1]+'">'+a[0]+'</button>':'')+
    '<button class="scx-got" onclick="scInsights()">Score insights</button></div></div>';
}
/* Bara's bubble, above Bara: cheeky lines, a new one every few seconds
   (Simple's mascot does this), or what was just done */
var SC_BUB={
  zero:['Satu log pun jadi… Bara tunggu ni 🥺','Minum segelas air dulu? Bara nak bangun 😴','Bara masih mengantuk… tolong kejutkan 🥱','Bara setia tunggu awak di sini 🤍'],
  low:['Dah mula! Bara makin segar 👀','Sikit lagi Bara jadi merah! 🔥','Bara dah bangun. Teruskan, awak hebat!'],
  red:['Yeay, Bara dah merah! Terima kasih awak 😎','Hari padu! Bara bangga dengan awak 💪','Jom kejar 100? Bara dah tak sabar!'],
  full:['100! Bara paling gembira hari ni 🏆','Hari sempurna! Awak memang juara 🎉'],
  dust:['Bara rasa sunyi sikit… 😟','Satu log je, Bara terus ceria balik.'],
  rust:['Bulu Bara dah kusut… 🥲','Segelas air pun boleh buat Bara gebu balik.','Bara rindu awak 🥺']};
var _scBubI=0, _scBubT=null;
function scBubLines(){
  var st=scState(), s=scScore();
  if(st.k) return SC_BUB[st.k==='rust'?'rust':'dust'];
  if(_scSay && _scSay!=='poke' && Date.now()-_scSayAt<60000) return [scLine()];
  return SC_BUB[s>=100?'full':s>=SC_PADU?'red':s>0?'low':'zero'];
}
function scBubText(){ var l=scBubLines(); return l[_scBubI%l.length]; }
/* (16 Oct, after Simple) the bubble only speaks when there is a reason — a
   log, a poke, turning red, the first look of a visit — then fades out */
var _scBubHide=null;
function scBubSet(t){
  var b=$('sc-bub'); if(!b) return;
  b.textContent=t; b.className='sc-bub';
  try{ void b.offsetWidth; }catch(e){}
  b.className='sc-bub show pop';
  if(_scBubHide) clearTimeout(_scBubHide);
  _scBubHide=setTimeout(function(){ var x=$('sc-bub'); if(x) x.className='sc-bub'; },4500);
}
function scBubNext(){
  var b=$('sc-bub');
  if(!b || b.offsetParent===null) return;
  _scBubI++; scBubSet(scBubText());
}
function scHTML(){
  var s=scScore(), lv=scLevel(s), M=(typeof hfm==='function')?hfm():null, st=scState(), c=st.k==='rust'?'#8E8E93':scColor(s);
  var poster=(typeof bellPoster==='function')?bellPoster(st.k?1:lv):(M&&M.config.images[lv-1]), fx='';
  if(st.k){ poster=SC_ART.rust||poster; if(!SC_ART.rust) fx='<span class="sc-rustfx" style="-webkit-mask-image:url('+poster+');mask-image:url('+poster+')"></span>'; }
  var img=poster?'<img class="sc-poster" src="'+poster+'" alt="Bara'+(st.k==='rust'?', messy':', level '+lv)+'">'+fx:'';
  var slides=[];
  if(typeof scCoachHTML==='function') slides.push(scCoachHTML());
  if(typeof scMoodHTML==='function') slides.push(scMoodHTML());
  var inv=(typeof pushInvite==='function')?pushInvite():'';
  if(inv) slides.push('<div class="scx-coach scx-push"><div class="scx-k"><i></i>REMINDERS</div><div class="scx-t"><b>Let Bara nudge you</b></div>'+
    '<div class="scx-seth">At 8 pm, only when a streak is at risk or Bara misses you. One a day at most.</div>'+inv+'</div>');
  slides.unshift(scBellCard(st));
  var base=(typeof scBaseHTML==='function')?scBaseHTML():'';   /* the first 30 days, second after the score card */
  if(base) slides.splice(1,0,base);
  return '<div class="sc sc-page" style="--scc:'+scRGB(c)+'">'+
    '<div class="sc-stage"><div class="sc-bub" id="sc-bub">'+hesc(scBubText())+'</div>'+scArc(s)+'<div class="sc-bell '+(st.k?'sc-'+st.k:'sc-lv'+lv)+'" id="sc-bell" onclick="scPoke()" role="button" aria-label="Touch Bara">'+img+'</div></div>'+
    '<div class="sc-hs">'+scHabits().map(scRing).join('')+'</div></div>'+
    '<div class="sc-tail"></div>'+scCarHTML(slides)+
    (typeof scPlanHTML==='function'?scPlanHTML():'');
}
var _scCheered=0;
/* the swipe cards: their place is kept across a re-render (a tap on a mood
   face re-renders Home; it must not jump back to the first card) */
var _scCar=0;
function scCarHTML(slides){
  if(!slides.length) return '';
  if(_scCar>=slides.length) _scCar=0;
  return '<div class="sc-car" id="sc-car" onscroll="scCarScroll(this)">'+slides.map(function(x){ return '<div class="sc-sl">'+x+'</div>'; }).join('')+'</div>'+
    (slides.length>1?'<div class="sc-cdots" id="sc-cdots">'+slides.map(function(x,i){ return '<i class="'+(i===_scCar?'on':'')+'" onclick="scCarGo('+i+')"></i>'; }).join('')+'</div>':'');
}
/* the box takes the height of the card in view (18 Oct): a tall card (the
   30-day base) left an empty band under the short ones */
function scCarFit(el,i){ try{ var s=el.children[i]; if(s && s.offsetHeight) el.style.height=s.offsetHeight+'px'; }catch(e){} }
function scCarScroll(el){
  var w=el.clientWidth||1, i=Math.round(el.scrollLeft/w), d=$('sc-cdots');
  scCarFit(el,i);
  if(i===_scCar) return; _scCar=i;
  if(d) for(var j=0;j<d.children.length;j++) d.children[j].className=j===i?'on':'';
}
function scCarGo(i){ var el=$('sc-car'); if(!el) return; _scCar=i; try{ el.scrollTo({left:i*el.clientWidth,behavior:'smooth'}); }catch(e){ el.scrollLeft=i*el.clientWidth; } scCarScroll(el); }
/* the colour behind the top of Home: red, gold on a strong-enough day, rust when rusty */
function scBand(){ var s=scScore(), st=scState(); return st.k?'#F06A1C':s>=SC_PADU?'#E30613':'#D9C2A3'; }
/* the two soft lights behind Bara, Simple's way (16 Oct): a cream Bara on
   coral and peach so the white fur stands out, a red one on orange and red */
function scGlow(){ var s=scScore(), st=scState(); return st.k?['#F06A1C','#C24A0E']:s>=SC_PADU?['#FF8A5B','#E30613']:['#E8424A','#F47C6E']; }
function scRender(){
  var el=$('mascot-home'); if(!el) return;
  el.innerHTML=scHTML();
  /* the first Home of a visit comes in the way Simple's does: the arc draws,
     Bara appears, the bubble pops, the cards rise. Once. */
  if(!scRender._in){ scRender._in=true; el.className=(el.className||'')+' sc-enter';
    setTimeout(function(){ el.className=String(el.className||'').replace(/ ?sc-enter/g,''); },1800); }
  if(_scBubT) clearInterval(_scBubT);
  if(!scRender._said || (_scSay && Date.now()-_scSayAt<5000)){ scRender._said=true; scBubSet(scBubText()); }
  if($('sc-pills')) $('sc-pills').innerHTML=scPills();
  try{ var sr=$('screen'); if(sr && sr.style && sr.style.setProperty) sr.style.setProperty('--scb',scRGB(scBand())); var gl=scGlow(); sr.style.setProperty('--sga',scRGB(gl[0])); sr.style.setProperty('--sgb',scRGB(gl[1])); }catch(e){}
  var car=$('sc-car'); if(car && _scCar){ try{ car.scrollLeft=_scCar*(car.clientWidth||0); }catch(e){} }
  if(car) scCarFit(car,_scCar||0);
  /* Bara alive; messy (the rust state) has its own sad loop */
  var slot=$('sc-bell'), st=scState(), lv=scLevel(scScore());
  if(slot && typeof bellAttach==='function' && bellAttach(slot, st.k?'kusut':lv)){
    slot.className+=' sc-live';
    if(_scSay && _scSay!=='poke' && _scSayAt>_scCheered && Date.now()-_scSayAt<8000){
      _scCheered=_scSayAt;
      /* each habit its own clip; its poster shows till the clip plays */
      var R={water:'water', meal:'meal', junk:'giggle', workout:'squat', steps:'walk', mood:scDaily().mood>=4?'cheer':scDaily().mood===3?'giggle':''};
      if(_scSay==='mood' && !R.mood){ /* a hard day: Bara stays quiet and kind, no dancing */ }
      else scReact(R[_scSay]||'cheer');
    } else if(scRed() && _scPose.until>Date.now()+150) scPose(slot,_scPose.src,_scPose.until-Date.now());
  }
  /* (16 Oct) the moment Bara turns red, live: a squash, a red burst, the cheer */
  var red=scRed();
  if(scRender._red===false && red){ scTurnRed(); if(typeof hfSound==='function') hfSound('cheer'); }
  scRender._red=red;
  if(typeof scCheckMeet==='function' && scCheckMeet()) return;
  if(scCheckShine()) return;
  if(scCheckFreeze()) return;
  if(scCheckRust()) return;
  if(typeof scCheckWeekly==='function' && scCheckWeekly()) return;
  scCheckStreak();
}
function scTurnRed(){
  var stg=document.querySelector('#mascot-home .sc-stage'); if(!stg) return;
  var b=document.createElement('div'); b.className='sc-burst'; b.innerHTML='<i></i><i></i><b></b>';
  stg.appendChild(b); stg.className=stg.className.replace(/ ?sc-turnred/g,'')+' sc-turnred';
  setTimeout(function(){ if(b.parentNode) b.parentNode.removeChild(b); stg.className=stg.className.replace(/ ?sc-turnred/g,''); },1800);
  setTimeout(function(){ scReact('cheer'); scBubSet("Bara dah MERAH! 🔥 Hari padu!"); },420);
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
/* a pose for a moment (Bara with the water bottle, with the plate), then back */
var _scPose={src:'', until:0};
function scPose(slot,src,ms){
  ms=ms||2600; _scPose={src:src, until:Date.now()+ms};
  var im=document.createElement('img'); im.className='sc-pose'; im.src=src; im.alt='';
  if(ms<2600){ im.style.webkitAnimationDelay=im.style.animationDelay='-'+((2600-ms)/1000)+'s'; }
  slot.appendChild(im); slot.className+=' posing';
  setTimeout(function(){ if(im.parentNode) im.parentNode.removeChild(im); slot.className=slot.className.replace(/ ?posing/g,''); },ms);
}
/* touch Bara: a giggle, and a word */
SC_LINES.poke=['Hehe, gelilah! 😆','Eh, Bara tengah fokus ni 😤','Hehe, lagi? 🙈','Bara okay, terima kasih tanya 💪'];
var _scPokes=0;
/* the reactions come in both colours: w_water, w_giggle... for a cream
   Bara (under 50), the plain names for a red one. A cream Bara whose
   reaction has no cream clip bounces instead. */
var SC_WREACT={giggle:1, water:1, meal:1, squat:1, walk:1, cheer:1};
function scRed(){ return scScore()>=SC_PADU && !scState().k; }
function scReact(name){
  if(typeof bellReact!=='function') return;
  if(scRed()) return bellReact(name);
  if(SC_WREACT[name]) return bellReact('w_'+name);
  scBounce();
}
function scBounce(){
  var b=$('sc-bell'); if(!b) return;
  b.className=b.className.replace(/ ?sc-boing/g,'');
  try{ void b.offsetWidth; }catch(e){}
  b.className+=' sc-boing';
  setTimeout(function(){ b.className=b.className.replace(/ ?sc-boing/g,''); },700);
}
function scPoke(){
  if(scState().k==='rust'){ scBubSet('Bulu Bara kusut 🥲 Log satu benda je, Bara terus gebu balik.'); return; }
  scReact('giggle');
  if(typeof hfSound==='function') hfSound('giggle');
  scBubSet(SC_LINES.poke[(_scPokes++)%SC_LINES.poke.length]);
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
      '<div class="sc-sh-f">A glass is about 250 ml.</div>'+
      (typeof drOpen==='function'?'<button class="sc-sh-dr" onclick="scClose();drOpen()">Teh tarik, kopi, Milo or another drink?</button>':'')+'</div>';
  } else {
    h+='<div class="sc-sh"><div class="sc-sh-k">Steps today</div><div class="sc-sh-n">'+dy.steps.toLocaleString('en-MY')+'<span> / '+SC_STEPS.toLocaleString('en-MY')+'</span></div>'+
      '<div class="sc-sh-ctl"><button onclick="scSteps(1000)">+1,000</button><button onclick="scSteps(2000)">+2,000</button><button onclick="scSteps(5000)">+5,000</button></div>'+
      '<div class="sc-sh-in"><input class="inp" id="sc-steps" type="number" inputmode="numeric" placeholder="Total from your phone" min="0">'+
      '<button class="bigbtn" onclick="scStepsSet()">Save</button></div>'+
      '<div class="sc-sh-f">Check your steps in Apple Health or Google Fit, then enter the total here.</div></div>';
  }
  $('pw-body').innerHTML=h; $('pwm').classList.add('on');
  try{ $('pwm').scrollTop=0; }catch(e){}
  scSheet._k=k;
}
function scClose(){ closeProduct(); scRender(); }
function scWater(n){ scSet('water',scDaily().water+n); if(n>0){ _scSay='water'; _scSayAt=Date.now(); } scSheet('water'); scRender(); }
function scSteps(n){ scSet('steps',scDaily().steps+n); _scSay='steps'; _scSayAt=Date.now(); scSheet('steps'); scRender();
  if(typeof scBanner==='function') scBanner('+'+n.toLocaleString('en-MY')+' langkah 👟',scDaily().steps.toLocaleString('en-MY')+'/'+SC_STEPS.toLocaleString('en-MY')+' hari ni · Kaki awak rajin!'); }
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
var SC_MILE_LINES={3:'Permulaan yang padu! Bara nampak potensi awak 🔥',
  7:'Seminggu penuh! Bara bangga sangat 💪',14:'Dua minggu! Ini dah jadi tabiat, bukan usaha lagi.',
  30:'30 hari! Awak memang juara sebenar 🏆',60:'60 hari! Badan rasa lain kan? 😎',100:'100 hari! Bara tabik awak 🫡'};

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
  return '<button class="sc-chip" onclick="scCelebrate('+st.n+',true)">🔥 '+st.n+'</button>';
}
/* a milestone reached on this run and not yet celebrated */
function scCheckStreak(){
  var st=scStreak(), sc=HF.data.sc||(HF.data.sc={}), seen=sc.seen||(sc.seen={}), m=0, i, key, dk='day:'+iso(0);
  if(!st.n || $('scc').style.display==='flex') return;
  for(i=0;i<SC_MILES.length;i++) if(st.n>=SC_MILES[i]) m=SC_MILES[i];
  key=m?st.start+':'+m:'';
  if(key && !seen[key]){ seen[key]=1; if(st.today) seen[dk]=1; HF.save(); scCelebrate(m,false); return; }
  /* (19 Oct) every other strong day gets its own small moment, the number
     ticking up (Simple's daily streak); after Bara's turn-red burst */
  if(st.today && !seen[dk]){
    seen[dk]=1; HF.save();
    setTimeout(function(){ if($('scc').style.display!=='flex') scDayStreak(scStreak().n); },1900);
  }
}
/* the daily streak: Bara in front of a fire, the count going up by one */
function scDayStreak(n){
  if(!n) return;
  var next=scNextMile(n), pose=scTone('cheer','w_cheer');
  $('scc').className='scc scc-day';
  $('scc').innerHTML='<div class="sd-fire"><i></i><i></i><i></i></div><div class="scc-in">'+
    scMomentBell(pose)+
    '<div class="sd-num"><span class="o">'+(n-1)+'</span><span class="n">'+n+'</span></div>'+
    '<div class="scc-t">day streak!</div>'+
    scWeekPill()+
    '<div class="scc-s scc-bellsays">'+(n===1?'Hari padu pertama! Bara tunggu awak esok, jom jadikan 2 🔥':'Hari padu ke-'+n+'! Bara tunggu awak esok, jom jadikan '+(n+1)+' 🔥')+'</div>'+
    (next?'<div class="scc-fz">Next goal: '+next+' days · '+(next-n)+' to go</div>':'')+
    '<button class="bigbtn scc-share" onclick="scCelebrateClose()">Continue</button></div>';
  $('scc').style.display='flex'; scMomentPlay(pose);
  if(typeof hfSound==='function') setTimeout(function(){ hfSound('cheer'); },650);
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
  var black=n>=30, gold=n>=7&&!black, pose=black?'hitam':gold?'gold':scTone('calendar','aktif'), next=scNextMile(n), conf='', i;
  var cols=['#E30613','#FFC20E','#FFFFFF','#111111'];
  if(!mine) for(i=0;i<24;i++) conf+='<i style="left:'+((i*37)%100)+'%;background:'+cols[i%cols.length]+';-webkit-animation-delay:'+(i%8)*0.18+'s;animation-delay:'+(i%8)*0.18+'s"></i>';
  var line=SC_MILE_LINES[n]||(next?(next-n)+' hari lagi ke matlamat '+next+' hari. Jangan putus! 🔥':'Teruskan, juara 🔥');
  $('scc').className='scc '+(black?'scc-black':gold?'scc-gold':'scc-red');
  $('scc').innerHTML='<div class="scc-conf">'+conf+'</div><div class="scc-in">'+
    scMomentBell(pose)+
    '<div class="scc-t">'+(black?'<b>'+n+'-day</b> streak! Beast Mode 🖤':gold?'<b>'+n+'-day</b> streak! 🏆':'You\'re on a <b>'+n+'-day</b> streak')+'</div>'+
    '<div class="scc-s">'+hesc(line)+'</div>'+
    scWeekPill()+
    '<div class="scc-fz">❄️ '+scFreezeLeft()+'/'+SC_FREEZES+' freezes left this month'+(next?' · Next goal: '+next+' days':'')+'</div>'+
    '<button class="bigbtn scc-share" onclick="scShare('+n+')">Share milestone</button>'+
    '<button class="scc-x" onclick="scCelebrateClose()">Next</button>'+
    '<div class="scc-fine">A strong day is a HITFAT Score of '+SC_PADU+' or more. A freeze saves your streak when you miss a day.</div></div>';
  $('scc').style.display='flex'; scMomentPlay(pose);
}
/* a freeze was used: Bara in ice, the run safe */
function scFreezeScreen(frozen){
  var st=scStreak();
  $('scc').className='scc scc-ice';
  $('scc').innerHTML='<div class="scc-in">'+
    scMomentBell('frozen','scc-still')+
    '<div class="scc-t">Streak saved ❄️</div>'+
    '<div class="scc-s">Your <b>'+st.n+'-day</b> streak is safe: '+frozen.length+(frozen.length>1?' freezes':' freeze')+' used for '+(frozen.length>1?'the days':'the day')+' you missed, '+scFreezeLeft()+'/'+SC_FREEZES+' left this month.</div>'+
    '<div class="scc-s scc-bellsays">Bara beku sekejap untuk selamatkan streak awak 🥶 Jom jadikan hari ni 50 ke atas!</div>'+
    '<button class="bigbtn scc-share" onclick="scCelebrateClose()">Continue</button></div>';
  $('scc').style.display='flex'; scMomentPlay('frozen');
}
/* Bara has rusted: the black screen, once a day */
function scRustScreen(st){
  $('scc').className='scc scc-orange';
  $('scc').innerHTML='<div class="scc-in">'+
    scMomentBell('kusut')+
    '<div class="scc-t">Bara is all messy</div>'+
    '<div class="scc-s">'+st.idle+' days with nothing logged.</div><div class="scc-s scc-bellsays">Bara duduk sorang-sorang, bulu dah kusut 🥲 Satu log je, Bara terus gebu balik.</div>'+
    '<button class="bigbtn scc-share" onclick="scCelebrateClose();scSheet(\'water\')">Fluff Bara up: log a glass of water</button>'+
    '<button class="scc-x" onclick="scCelebrateClose()">Later</button></div>';
  $('scc').style.display='flex'; scMomentPlay('kusut');
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
   Bara left alone gets messy (the "rust" state, named from the kettlebell days). A day "kosong" is a day with nothing at all
   logged (score 0). Two kosong days in a row and Bara gathers dust; three,
   and Bara rusts. Log anything after a rusty spell and Bara shines again,
   with a moment of its own. Until the drawn rusty and shiny Bells come, the
   looks are effects on the artwork: SC_ART can name them later. */
var SC_ART={rust:'/img/mascot/anim/kusut.png', shine:null};

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
  if(st.k==='rust') return 'Bara is all messy 🥲 '+st.idle+' days with nothing logged. Log one thing today, even a glass of water, to fluff Bara up.';
  return 'Bara is getting dusty... 😟 Log something today so Bara\'s fur doesn\'t get messy tomorrow.';
}
/* back after a rusty spell: once a day */
function scCheckShine(){
  var st=scState(), sc=HF.data.sc||(HF.data.sc={}), seen=sc.seen||(sc.seen={}), key='shine:'+iso(0);
  if(!st.back || seen[key] || $('scc').style.display==='flex') return false;
  seen[key]=1; HF.save(); scShine(); return true;
}
function scShine(){
  var sp='', i, pose=scTone('halo','w_cheer');
  for(i=0;i<14;i++) sp+='<i style="left:'+((i*29+7)%92)+'%;top:'+(6+(i*41+11)%34)+'%;-webkit-animation-delay:'+(i%7)*0.2+'s;animation-delay:'+(i%7)*0.2+'s">✦</i>';
  $('scc').className='scc scc-red';
  $('scc').innerHTML='<div class="scc-spark">'+sp+'</div><div class="scc-in">'+
    scMomentBell(pose,'scc-shine')+
    '<div class="scc-t">You saved Bara!</div>'+
    '<div class="scc-s scc-bellsays">Yeay! Bara gebu balik ✨ Okay okay, Bara maafkan awak. Jangan tinggal Bara lama-lama lagi ya 😇</div>'+
    '<button class="bigbtn scc-share" onclick="scCelebrateClose()">Let\'s go!</button></div>';
  $('scc').style.display='flex'; scMomentPlay(pose);
}
