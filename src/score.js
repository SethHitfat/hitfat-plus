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
var _scSay=null, _scSayAt=0;

/* a saved date (ISO string) as the local day it fell on */
function scDayOf(v){ var x=new Date(v); return x.getFullYear()+'-'+('0'+(x.getMonth()+1)).slice(-2)+'-'+('0'+x.getDate()).slice(-2); }
function scDaily(d){ var all=HF.data.daily||{}; var o=all[d||iso(0)]||{}; return {water:o.water||0, steps:o.steps||0}; }
function scSet(k,v){
  var all=HF.data.daily||(HF.data.daily={}), d=iso(0), o=all[d]||(all[d]={water:0,steps:0});
  o[k]=Math.max(0,Math.round(v)); HF.save();
}
function scWorkouts(d){
  var s=HF.data.sessions||{}, n=0, k;
  for(k in s){ if(s.hasOwnProperty(k) && s[k] && s[k].date && scDayOf(s[k].date)===d) n++; }
  return n;
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
function scHabits(d){
  d=d||iso(0);
  var dy=scDaily(d), w=scWorkouts(d), m=(HF.data.meals&&HF.data.meals[d]||[]).length, out=[];
  out.push({k:'workout', n:'Workout', ic:'workout', v:Math.min(1,w), val:w?'Siap':'0/1'});
  out.push({k:'meal',    n:'Makan',   ic:'food',    v:Math.min(1,m/SC_MEALS), val:m+'/'+SC_MEALS});
  out.push({k:'water',   n:'Air',     ic:'water',   v:Math.min(1,dy.water/SC_WATER), val:dy.water+'/'+SC_WATER});
  out.push({k:'steps',   n:'Langkah', ic:'steps',   v:Math.min(1,dy.steps/SC_STEPS), val:dy.steps>=1000?(Math.round(dy.steps/100)/10)+'k':String(dy.steps)});
  if(scHasIF()){ var f=scFast(d); out.push({k:'fast', n:'Puasa', ic:'clock', v:Math.min(1,f.hrs/f.target), val:Math.floor(f.hrs)+'/'+f.target+'j'}); }
  return out;
}
function scScore(d){
  var hs=scHabits(d), t=0, i;
  for(i=0;i<hs.length;i++) t+=hs[i].v;
  return Math.round(t/hs.length*100);
}
function scColor(s){ return s>=70?'#22C55E':s>=40?'#FFC20E':'#FF8A3D'; }
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
  var c=h.v>=1?'#22C55E':'#E30613';
  return '<button class="sc-h'+(h.v>=1?' full':'')+'" onclick="scTap(\''+h.k+'\')" aria-label="'+h.n+'">'+
    '<span class="sc-ring"><svg viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="26" r="22" class="sc-ring-t"/>'+
    (h.v>0?'<circle cx="26" cy="26" r="22" class="sc-ring-v" pathLength="100" stroke="'+c+'" stroke-dasharray="'+Math.round(h.v*100)+' 100"/>':'')+
    '</svg><span class="sc-ic">'+glyph(h.ic)+'</span>'+(h.v<1?'<span class="sc-plus">+</span>':'')+'</span>'+
    '<b>'+h.val+'</b><span class="sc-l">'+h.n+'</span></button>';
}
function scHTML(){
  var s=scScore(), lv=scLevel(s), M=(typeof hfm==='function')?hfm():null;
  var img=M&&M.config.images[lv-1]?'<img src="'+M.config.images[lv-1]+'" alt="Bell, tahap '+lv+'">':'';
  return '<div class="sc">'+
    '<div class="sc-head"><div><div class="sc-k">Skor HITFAT · Hari ini</div><div class="sc-n" style="color:'+scColor(s)+'">'+s+'<span>/100</span></div></div></div>'+
    '<div class="sc-stage" onclick="switchTab(\'progress\')">'+scArc(s)+'<div class="sc-bell sc-lv'+lv+'">'+img+'</div></div>'+
    '<div class="sc-say">'+hesc(scLine())+'</div>'+
    '<div class="sc-hs">'+scHabits().map(scRing).join('')+'</div></div>';
}
function scRender(){ var el=$('mascot-home'); if(el) el.innerHTML=scHTML(); }

/* each habit's way in */
function scTap(k){
  if(k==='workout') return switchTab('train');
  if(k==='meal') return switchTab('eat');
  if(k==='fast') return openIF();
  scSheet(k);
}
function scSheet(k){
  var dy=scDaily(), h='<div class="pwtop"><span></span><button class="pwx" aria-label="Tutup" onclick="scClose()">✕</button></div>';
  if(k==='water'){
    h+='<div class="sc-sh"><div class="sc-sh-k">Air hari ini</div><div class="sc-sh-n">'+dy.water+'<span> / '+SC_WATER+' gelas</span></div>'+
      '<div class="sc-sh-ctl"><button onclick="scWater(-1)" aria-label="Tolak satu gelas">−</button><button class="on" onclick="scWater(1)" aria-label="Tambah satu gelas">+ 1 gelas</button></div>'+
      '<div class="sc-sh-f">Satu gelas lebih kurang 250 ml.</div></div>';
  } else {
    h+='<div class="sc-sh"><div class="sc-sh-k">Langkah hari ini</div><div class="sc-sh-n">'+dy.steps.toLocaleString('en-MY')+'<span> / '+SC_STEPS.toLocaleString('en-MY')+'</span></div>'+
      '<div class="sc-sh-ctl"><button onclick="scSteps(1000)">+1,000</button><button onclick="scSteps(2000)">+2,000</button><button onclick="scSteps(5000)">+5,000</button></div>'+
      '<div class="sc-sh-in"><input class="inp" id="sc-steps" type="number" inputmode="numeric" placeholder="Jumlah dari telefon anda" min="0">'+
      '<button class="bigbtn" onclick="scStepsSet()">Simpan</button></div>'+
      '<div class="sc-sh-f">Lihat jumlah langkah dalam app Health atau Google Fit, kemudian masukkan di sini.</div></div>';
  }
  $('pw-body').innerHTML=h; $('pwm').classList.add('on');
  try{ $('pwm').scrollTop=0; }catch(e){}
  scSheet._k=k;
}
function scClose(){ closeProduct(); scRender(); }
function scWater(n){ scSet('water',scDaily().water+n); if(n>0){ _scSay='water'; _scSayAt=Date.now(); } scSheet('water'); scRender(); }
function scSteps(n){ scSet('steps',scDaily().steps+n); _scSay='steps'; _scSayAt=Date.now(); scSheet('steps'); scRender(); }
function scStepsSet(){
  var v=parseInt(($('sc-steps')||{}).value,10);
  if(!(v>=0) || v>100000){ toast('Masukkan jumlah langkah'); return; }
  scSet('steps',v); _scSay='steps'; _scSayAt=Date.now(); scClose();
}
