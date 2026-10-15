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
  out.push({k:'workout', n:'Workout', ic:'workout', v:Math.min(1,w), val:w?'Siap':'0/1'});
  out.push({k:'meal',    n:'Makan',   ic:'food',    v:Math.min(1,m/SC_MEALS), val:m+'/'+SC_MEALS});
  out.push({k:'water',   n:'Air',     ic:'water',   v:Math.min(1,dy.water/SC_WATER), val:dy.water+'/'+SC_WATER});
  out.push({k:'steps',   n:'Langkah', ic:'steps',   v:Math.min(1,dy.steps/SC_STEPS), val:dy.steps>=1000?(Math.round(dy.steps/100)/10)+'k':String(dy.steps)});
  if(scHasIF()){ var f=scFast(d); out.push({k:'fast', n:'Puasa', ic:'clock', v:Math.min(1,f.hrs/f.target), val:Math.floor(f.hrs)+'/'+f.target+'j'}); }
  return out;
}
function scScore(d,days){
  var hs=scHabits(d,days), t=0, i;
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
  var s=scScore(), lv=scLevel(s), M=(typeof hfm==='function')?hfm():null, st=scState();
  var src=M&&M.config.images[lv-1], fx='';
  if(st.k==='rust'){ src=SC_ART.rust||(M&&M.config.images[0]); if(!SC_ART.rust) fx='<span class="sc-rustfx" style="-webkit-mask-image:url('+src+');mask-image:url('+src+')"></span>'; }
  var img=src?'<img src="'+src+'" alt="Bell'+(st.k==='rust'?' berkarat':', tahap '+lv)+'">'+fx:'';
  return '<div class="sc">'+
    '<div class="sc-head"><div><div class="sc-k">Skor HITFAT · Hari ini</div><div class="sc-n" style="color:'+scColor(s)+'">'+s+'<span>/100</span></div></div>'+
      scChip()+'</div>'+
    '<div class="sc-stage" onclick="switchTab(\'progress\')">'+scArc(s)+'<div class="sc-bell '+(st.k?'sc-'+st.k:'sc-lv'+lv)+'">'+img+'</div></div>'+
    '<div class="sc-say'+(st.k?' sc-say-'+st.k:'')+'">'+hesc(st.k?scRustLine(st):scLine())+'</div>'+
    '<div class="sc-hs">'+scHabits().map(scRing).join('')+'</div></div>';
}
function scRender(){ var el=$('mascot-home'); if(el){ el.innerHTML=scHTML(); if(!scCheckShine()) scCheckStreak(); } }

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


/* ═══════════════ phase 2 · streaks ═══════════════
   A day counts when its score reached SC_PADU ("hari padu"). The streak is
   the run of such days up to today, or up to yesterday while today is still
   being earned. Reaching 3, 7, 14, 30, 60 or 100 days opens a celebration
   once per run, with a card the member can share to an IG Story. */
var SC_PADU=50, SC_MILES=[3,7,14,30,60,100];
var SC_MILE_LINES={3:'Permulaan yang padu! Bell dah nampak potensi anda 🔥',
  7:'Seminggu penuh! Bell bangga gila 💪',14:'Dua minggu! Ini dah jadi tabiat, bukan lagi usaha.',
  30:'30 hari! Anda juara sebenar 🏆',60:'60 hari! Badan anda dah lain, kan? 😎',100:'100 hari! Bell tabik spring 🫡'};

function scStreak(){
  var days=scWorkoutDays(), n=0, i=0, d;
  if(scScore(iso(0),days)<SC_PADU) i=1;            /* today is still in progress */
  for(;i<400;i++){ d=iso(-i); if(scScore(d,days)>=SC_PADU) n++; else break; }
  return {n:n, start:n?iso(-(i-1)):null, today:scScore(iso(0),days)>=SC_PADU};
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
  toast('Capai skor '+SC_PADU+' sehari untuk mula streak 🔥');
}
function scCelebrate(n,mine){
  var M=(typeof hfm==='function')?hfm():null, img=M?M.config.images[3]:'', next=scNextMile(n), conf='', i;
  var cols=['#E30613','#FFC20E','#22C55E','#FFFFFF','#FF8A3D'];
  for(i=0;i<24;i++) conf+='<i style="left:'+((i*37)%100)+'%;background:'+cols[i%cols.length]+';-webkit-animation-delay:'+(i%8)*0.18+'s;animation-delay:'+(i%8)*0.18+'s"></i>';
  var line=SC_MILE_LINES[n]||('Streak '+n+' hari! Teruskan 🔥');
  $('scc').innerHTML='<div class="scc-conf">'+conf+'</div><div class="scc-in">'+
    '<div class="scc-bell">'+(img?'<img src="'+img+'" alt="Bell">':'')+'</div>'+
    '<div class="scc-n">'+n+'</div><div class="scc-k">hari padu berturut-turut</div>'+
    '<div class="scc-s">'+hesc(line)+'</div>'+
    (next?'<div class="scc-f">Sasaran seterusnya: '+next+' hari</div>':'')+
    '<button class="bigbtn scc-share" onclick="scShare('+n+')">Kongsi ke IG Story</button>'+
    '<button class="scc-x" onclick="scCelebrateClose()">Teruskan</button>'+
    '<div class="scc-fine">Hari padu = Skor HITFAT '+SC_PADU+' ke atas.</div></div>';
  $('scc').style.display='flex';
}
function scCelebrateClose(){ $('scc').style.display='none'; $('scc').innerHTML=''; }

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
    text('HARI PADU BERTURUT-TURUT',540,1480,52,'#FFC20E',800);
    text('Skor HITFAT '+SC_PADU+'+ setiap hari',540,1560,42,'rgba(255,255,255,.75)',600);
    text('app.hitfat.io',540,1800,40,'rgba(255,255,255,.55)',600);
    g.fillStyle='#FFC20E'; g.font='90px sans-serif'; g.fillText('✦',200,420); g.fillText('✦',880,360); g.font='60px sans-serif'; g.fillText('✦',930,760);
    done(cv);
  }
  if(M && M.config.images[3]){ img.onload=function(){ g.drawImage(img,190,280,700,700); finish(); }; img.onerror=finish; img.src=M.config.images[3]; }
  else finish();
}
function scShare(n){
  scCard(n,function(cv){
    if(!cv){ toast('Kad tidak dapat dibuat pada peranti ini'); return; }
    var text='🔥 '+n+' hari padu berturut-turut dengan HITFAT+! app.hitfat.io';
    var fallback=function(){
      $('scc').innerHTML='<div class="scc-in"><img class="scc-card" src="'+cv.toDataURL('image/png')+'" alt="Kad streak">'+
        '<div class="scc-s">Tekan lama pada gambar untuk simpan, kemudian kongsi ke IG Story.</div>'+
        '<button class="scc-x" onclick="scCelebrateClose()">Tutup</button></div>';
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
  var M=(typeof hfm==='function')?hfm():null, img=SC_ART.shine||(M?M.config.images[3]:''), sp='', i;
  for(i=0;i<14;i++) sp+='<i style="left:'+((i*29+7)%92)+'%;top:'+(6+(i*41+11)%34)+'%;-webkit-animation-delay:'+(i%7)*0.2+'s;animation-delay:'+(i%7)*0.2+'s">✦</i>';
  $('scc').innerHTML='<div class="scc-spark">'+sp+'</div><div class="scc-in">'+
    '<div class="scc-bell scc-shine">'+(img?'<img src="'+img+'" alt="Bell berkilat">':'')+'</div>'+
    '<div class="scc-k">Bell berkilat semula!</div>'+
    '<div class="scc-s">Terima kasih sebab kembali ✨ Karat dah hilang. Satu hari padu lagi, streak baru bermula.</div>'+
    '<button class="bigbtn scc-share" onclick="scCelebrateClose()">Jom!</button></div>';
  $('scc').style.display='flex';
}
