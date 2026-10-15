/* ═══════════════ SKOR HITFAT · the rest of Simple, and ours ═══════════════
   What Simple has that the score card did not, and what we said we would add:

     Kenali Bell     the first time: three screens, Bell says who he is
     Coach Bell      a mission card under the rings: points to hari padu,
                     the quickest way there, and a line from Coach Seth
     Banner          Bell's face at the top when something is logged
     Junk food       Bell "confiscates" the cake (and says so)
     One tap         the water ring adds a glass; the fast ring starts the
                     fast (or, in Ramadan, marks the day fasted)
     Today's plan    the day's session, eating window and what is left
     Laporan Ahad    on Sunday: the week against the last
     Mod Ramadan     the fast ring follows the month, on by date or by hand

   Hooks into score.js (scHTML, scHabits, scTap, scRender). ES5. */

/* ── Mod Ramadan ── approximate dates for Malaysia; Settings can force it */
var SC_RAMADAN=[['2027-02-08','2027-03-09'],['2028-01-28','2028-02-26'],['2029-01-16','2029-02-14']];
function scRamMode(){ return (HF.data.sc&&HF.data.sc.ram)||'auto'; }
function scRamadan(d){
  var m=scRamMode(); d=d||iso(0);
  if(m==='on') return true;
  if(m==='off') return false;
  for(var i=0;i<SC_RAMADAN.length;i++) if(d>=SC_RAMADAN[i][0] && d<=SC_RAMADAN[i][1]) return true;
  return false;
}
function scSetRam(m){ var sc=HF.data.sc||(HF.data.sc={}); sc.ram=m; HF.save(); toast(m==='on'?'Mod Ramadan dihidupkan 🌙':m==='off'?'Mod Ramadan dimatikan':'Mod Ramadan ikut tarikh'); if(typeof renderMe==='function' && $('me') && $('me').style.display!=='none') renderMe(); }
function scRamRow(){
  if(!SC_FAST_LIVE) return '';
  var m=scRamMode();
  return '<div class="grow grow-ctl">'+ic('moon')+'<div class="grow-l">Mod Ramadan<div class="pu-sub">'+(scRamadan()?'Aktif: bulatan Puasa ikut bulan Ramadan':'Bulatan Puasa ikut bulan Ramadan')+'</div></div>'+
    '<div class="obseg meseg"><button class="'+(m==='auto'?'on':'')+'" onclick="scSetRam(\'auto\')">Auto</button>'+
    '<button class="'+(m==='on'?'on':'')+'" onclick="scSetRam(\'on\')">On</button>'+
    '<button class="'+(m==='off'?'on':'')+'" onclick="scSetRam(\'off\')">Off</button></div></div>';
}
function scRamToggle(){
  var all=HF.data.daily||(HF.data.daily={}), d=iso(0), o=all[d]||(all[d]={water:0,steps:0});
  o.ram=o.ram?0:1; HF.save();
  if(o.ram){ _scSay='ram'; _scSayAt=Date.now(); scBanner('Selamat berpuasa! 🌙','Bell pun puasa juga… dari minyak 😅 Jumpa waktu berbuka.'); }
  scRender();
}

/* ── the banner: Bell's face, a word, sometimes an undo ── */
var _scbT=0;
function scBanner(title,body,act,actFn){
  var el=$('scb'); if(!el) return;
  var face=(typeof bellPoster==='function')?bellPoster(2):'';
  el.innerHTML='<div class="scb-in" onclick="scBannerHide()">'+(face?'<img src="'+face+'" alt="">':'')+
    '<div class="scb-tx"><b>'+hesc(title)+'</b>'+(body?'<span>'+hesc(body)+'</span>':'')+'</div>'+
    (act?'<button onclick="event.stopPropagation();scBannerHide();'+actFn+'">'+act+'</button>':'')+'</div>';
  el.className='scb on';
  clearTimeout(_scbT); _scbT=setTimeout(scBannerHide,act?4500:3200);
}
function scBannerHide(){ var el=$('scb'); if(el) el.className='scb'; }

/* ── junk food: Bell confiscates it ── */
var SC_JUNK=/\b(kek|cake|donut|doughnut|kuih|biskut|cookies?|coklat|chocolate|aiskrim|ais krim|ice ?cream|teh tarik|milo|kopi ais|bubble tea|boba|coke|cola|soda|pepsi|sirap|bandung|cendol|ais kacang|keropok|chips|kerepek|pisang goreng|goreng pisang|burger|pizza|fries|kentang goreng|nugget|roti canai|maggi|mee segera|candy|gula-gula|waffle|pancake|brownies?|cheesecake)\b/i;
function scJunk(m){
  var n=String((m&&m.name)||'');
  return SC_JUNK.test(n) || (m && m.kcal>=900);
}
SC_LINES.junk=['{x} tu Bell rampas dulu ya 😇 Esok kita ganti dengan buah.',
  'Bell tak marah… cuma {x} ni Bell simpan untuk "keselamatan" 😏 Minum air kosong sekali ya.',
  'Sekali-sekala boleh. Tapi Bell nampak {x} tu 👀'];
SC_LINES.ram=['Selamat berpuasa! 🌙 Bell pun puasa juga… dari minyak 😅'];
SC_LINES.fast=['Puasa bermula ⏱️ Bell temankan sampai waktu makan.'];
function scJunkLine(name){
  var x=String(name||'Makanan tu').split(/[,(]/)[0].trim(); if(x.length>22) x=x.slice(0,22)+'…';
  var a=SC_LINES.junk; return a[new Date().getMinutes()%a.length].replace('{x}',x.charAt(0).toUpperCase()+x.slice(1));
}
/* a meal was logged (eat2.js logMeal) */
function scMealLogged(m){
  if(scJunk(m)){ _scSay='junk'; _scSayAt=Date.now(); _scJunkName=m&&m.name; scBanner('Bell rampas! 😇',scJunkLine(m&&m.name)); }
  else { _scSay='meal'; _scSayAt=Date.now(); scBanner('Makanan direkod 🍽️','Bell suka orang yang jujur. Protein dulu, nasi ikut porsi.'); }
}
var _scJunkName='';

/* ── one tap: water and the fast ── */
function scWaterTap(){
  var dy=scDaily(); scSet('water',dy.water+1); _scSay='water'; _scSayAt=Date.now();
  scBanner('+1 gelas air 💧',(dy.water+1)+'/'+SC_WATER+' hari ini. Glup glup!','Batal','scSet(\'water\',scDaily().water-1);scRender()');
  scRender();
}
function scFastTap(){
  if(!SC_FAST_LIVE) return openIF();
  if(scRamadan()) return scRamToggle();
  if(!scHasIF()) return openIF();
  var f=HF.data.ifs||{};
  if(f.active) return openIF();
  f.active={at:Date.now(), target:(typeof ifProto==='function'?ifProto().f:16)}; HF.save();
  _scSay='fast'; _scSayAt=Date.now();
  scBanner('Puasa bermula ⏱️','Sasaran '+f.active.target+' jam. Tekan bulatan Puasa untuk tamatkan.');
  scRender();
}

/* ── Coach Bell: the mission to hari padu, and Coach Seth ── */
var SC_SETH=['Konsisten mengalahkan sempurna. Satu hari padu lebih bernilai dari seminggu yang "nanti".',
  'Protein setiap kali makan. Ayam, ikan, telur, tauhu. Kenyang lebih lama.',
  'Nasi ikut porsi: satu genggam. Tak perlu buang nasi, cuma kawal.',
  'Air kosong dulu bila rasa lapar. Kadang-kadang badan cuma dahaga.',
  'Jalan 10 minit lepas makan. Gula darah lebih stabil.',
  'Tidur 7 jam ialah "workout" yang paling ramai skip.',
  'Timbang berat seminggu sekali, pagi, lepas tandas. Jangan ikut naik turun harian.',
  'Workout 15 minit yang dibuat lebih baik dari 60 minit yang dirancang.',
  'Gula dalam air lebih bahaya dari gula dalam makanan. Teh O kosong, kopi O kosong.',
  'Masak sendiri 2 kali seminggu pun dah banyak membantu.',
  'Bila tersasar, jangan "rosak terus". Sambung pada hidangan seterusnya.',
  'Simpan snek manis jauh dari mata. Yang tak nampak, tak dimakan.',
  'Kaki lebih kuat = metabolisme lebih baik. Jangan skip squat.',
  'Lemak hilang di dapur, badan dibentuk di gim.'];
function scSethTip(){ var d=new Date(), n=Math.floor((d-new Date(d.getFullYear(),0,0))/864e5); return SC_SETH[n%SC_SETH.length]; }
function scMission(){
  var hs=scHabits(), share=100/hs.length, s=scScore(), opts=[], i, h, dy=scDaily();
  for(i=0;i<hs.length;i++){ h=hs[i]; if(h.v>=1) continue;
    if(h.k==='workout') opts.push({t:'1 workout pendek',p:share});
    else if(h.k==='water') opts.push({t:Math.min(3,SC_WATER-dy.water)+' gelas air',p:share*Math.min(3,SC_WATER-dy.water)/SC_WATER});
    else if(h.k==='meal') opts.push({t:'rekod 1 hidangan',p:share/SC_MEALS});
    else if(h.k==='steps') opts.push({t:'jalan 2,000 langkah',p:share*Math.min(2000,SC_STEPS-dy.steps)/SC_STEPS});
    else if(h.k==='fast') opts.push({t:scRamadan()?'tanda puasa hari ini':'mula puasa',p:share*(1-h.v)});
  }
  opts.sort(function(a,b){ return b.p-a.p; });
  var top=opts.slice(0,2).map(function(o){ return o.t+' <em>+'+Math.round(o.p)+'</em>'; }).join(' · ');
  if(s>=100) return 'Skor penuh hari ni 🏆 Rehat, dan tidur cukup malam ni.';
  if(s>=SC_PADU) return 'Hari padu dah selamat ✓ Kejar 100: '+top;
  return 'Tinggal <b>'+(SC_PADU-s)+' mata</b> ke hari padu. Paling cepat: '+top;
}
function scCoachHTML(){
  var s=scScore();
  return '<div class="scx-coach"><div class="scx-k"><i></i>MISI HARI INI</div>'+
    '<div class="scx-t">'+scMission()+'</div>'+
    '<div class="scx-bar"><i style="width:'+Math.min(100,s)+'%"></i><span class="m50'+(s>=SC_PADU?' on':'')+'">✓</span><span class="m100'+(s>=100?' on':'')+'">⚡</span></div>'+
    '<div class="scx-seth"><b>💬 Coach:</b> '+hesc(scSethTip())+'</div></div>';
}

/* ── Today's plan ── */
/* Today's Plan is in English, as the app around it (Bell himself speaks Malay) */
function scClock(min){ min=((Math.round(min)%1440)+1440)%1440; var h=Math.floor(min/60), m=min%60; return (h%12||12)+':'+('0'+m).slice(-2)+(h<12?' am':' pm'); }
function scPlanHTML(){
  var rows=[], dy=scDaily(), nx=(typeof nextUp==='function')?nextUp():null, p=nx&&nx.p&&nx.p.weeks?nx.p:null, gi, at, n=function(x){ return x.toLocaleString('en-MY'); };
  if(p && typeof nextSession==='function' && (gi=nextSession(p))>=0 && (at=sessionAt(p,gi)))
    rows.push({ic:'workout', t:(at.day.name||'Workout'), s:p.name+' · '+p.dur+' min', done:scWorkouts(iso(0))>0, go:"openDay('"+p.id+"',"+gi+")", b:'Start'});
  else rows.push({ic:'workout', t:"Today's workout", s:'Pick a program or a short session', done:scWorkouts(iso(0))>0, go:"switchTab('train')", b:'Pick'});
  if(!SC_FAST_LIVE){}
  else if(scRamadan()) rows.push({ic:'moon', t:dy.ram?'Fasting today ✓':'Ramadan fast', s:'Sahur, iftar, and water in between', done:!!dy.ram, go:'scRamToggle()', b:dy.ram?'':'Mark'});
  else if(scHasIF() && typeof ifWindow==='function'){
    var w=ifWindow(), f=HF.data.ifs||{};
    rows.push({ic:'clock', t:'Eat '+scClock(w.start)+' – '+scClock(w.end), s:f.active?'Fasting now · end it in IF HITFAT':'Then fast for '+ifProto().f+' hours', done:false, go:f.active?'openIF()':'scFastTap()', b:f.active?'View':'Start'});
  }
  var wl=SC_WATER-dy.water, sl=Math.max(0,SC_STEPS-dy.steps);
  rows.push({ic:'water', t:wl<=0?'Water done for today':wl+(wl===1?' glass':' glasses')+' of water to go', s:dy.water+'/'+SC_WATER+' glasses', done:wl<=0, go:'scWaterTap()', b:'+1'});
  rows.push({ic:'steps', t:sl<=0?'Steps done for today':n(sl)+' steps to go', s:n(dy.steps)+'/'+n(SC_STEPS)+' steps', done:sl<=0, go:"scSheet('steps')", b:'Add'});
  return '<div class="scx-plan">'+fsec("Today's Plan",'')+'<div class="scx-rows">'+rows.map(function(r){
    return '<div class="scx-row'+(r.done?' done':'')+'" onclick="'+r.go+'"><span class="ic">'+glyph(r.ic)+'</span><div class="tx"><b>'+hesc(r.t)+'</b><span>'+hesc(r.s)+'</span></div>'+
      (r.done?'<span class="ok">✓</span>':(r.b?'<button onclick="event.stopPropagation();'+r.go+'">'+r.b+'</button>':''))+'</div>'; }).join('')+'</div></div>';
}

/* ── Kenali Bell: once, the first time the card shows ── */
var SC_MEET=[
  {pose:'aktif', t:'Hai! Saya Bell 👋', s:'Kettlebell peribadi anda. Saya hidup bila anda aktif, dan saya berkarat bila anda hilang 🥲'},
  {pose:'water', t:'Isi 4 bulatan setiap hari', s:'Workout, makan, air dan langkah. Semuanya jadi Skor HITFAT anda, 0 hingga 100.'},
  {pose:'gold',  t:'50 ke atas = hari padu 🔥', s:'Hari padu berturut-turut jadi streak. 7 hari, saya jadi Bell Emas. Terlepas sehari? Ada 2 freeze sebulan ❄️'}];
function scCheckMeet(){
  var sc=HF.data.sc||(HF.data.sc={});
  if(sc.met || $('scc').style.display==='flex') return false;
  scMeet(0); return true;
}
function scMeet(i){
  var m=SC_MEET[i], last=i===SC_MEET.length-1;
  $('scc').className='scc scc-red';
  $('scc').innerHTML='<div class="scc-in">'+scMomentBell(m.pose)+
    '<div class="scc-t">'+m.t+'</div><div class="scc-s">'+hesc(m.s)+'</div>'+
    '<div class="scx-dots">'+SC_MEET.map(function(x,j){ return '<i class="'+(j===i?'on':'')+'"></i>'; }).join('')+'</div>'+
    '<button class="bigbtn scc-share" onclick="'+(last?'scMeetDone()':'scMeet('+(i+1)+')')+'">'+(last?'Jom mula!':'Seterusnya')+'</button>'+
    (last?'':'<button class="scc-x" onclick="scMeetDone()">Langkau</button>')+'</div>';
  $('scc').style.display='flex'; scMomentPlay(m.pose);
}
function scMeetDone(){ var sc=HF.data.sc||(HF.data.sc={}); sc.met=1; HF.save(); scCelebrateClose(); }

/* ── Laporan Ahad: the week against the last, once a week from Sunday ── */
function scWeekStats(off){
  var days=scWorkoutDays(), t=new Date(), dow=(t.getDay()+6)%7, start=-(dow+7*off), vals=[], i, d;
  for(i=0;i<7;i++){ d=iso(start+i); if(d>iso(0)) break; vals.push({iso:d, v:scScore(d,days)}); }
  var act=vals.filter(function(x){ return x.v>0; });
  var avg=vals.length?Math.round(vals.reduce(function(a,x){ return a+x.v; },0)/vals.length):0;
  var best=vals.reduce(function(a,x){ return x.v>a.v?x:a; },{v:0,iso:''});
  return {avg:avg, padu:vals.filter(function(x){ return x.v>=SC_PADU; }).length, best:best, active:act.length, monday:iso(start)};
}
function scCheckWeekly(){
  var dow=new Date().getDay(); if(dow!==0 && dow!==1) return false;      /* Sunday, or Monday if missed */
  var w=scWeekStats(dow===1?1:0), sc=HF.data.sc||(HF.data.sc={}), seen=sc.seen||(sc.seen={}), key='week:'+w.monday;
  if(!w.active || seen[key] || $('scc').style.display==='flex') return false;
  seen[key]=1; HF.save(); scWeekly(dow===1?1:0); return true;
}
function scWeekly(off){
  var w=scWeekStats(off), p=scWeekStats(off+1), diff=w.avg-p.avg, st=scStreak().n;
  var line=diff>0?'Naik '+diff+' mata dari minggu lepas 👏 Bell bangga!':diff<0?'Turun '+(-diff)+' mata. Tak apa, minggu depan kita kejar balik 💪':'Sama macam minggu lepas. Konsisten tu pun menang.';
  var bd=w.best.iso?new Date(w.best.iso+'T00:00:00').toLocaleDateString('ms-MY',{weekday:'long'}):'–';
  $('scc').className='scc scc-black';
  $('scc').innerHTML='<div class="scc-in">'+scMomentBell(w.avg>=SC_PADU?'gold':'calendar')+
    '<div class="scx-wk">Laporan minggu ini</div>'+
    '<div class="scx-wn" style="color:'+scColor(w.avg)+'">'+w.avg+'<span>/100 purata</span></div>'+
    '<div class="scc-s">'+line+'</div>'+
    '<div class="scx-wg"><div><b>'+w.padu+'</b><span>hari padu</span></div><div><b>🔥 '+st+'</b><span>streak</span></div><div><b>'+(w.best.v||'–')+'</b><span>'+bd+'</span></div></div>'+
    '<button class="bigbtn scc-share" onclick="scCelebrateClose()">Minggu baru, jom!</button></div>';
  $('scc').style.display='flex'; scMomentPlay(w.avg>=SC_PADU?'gold':'calendar');
}
