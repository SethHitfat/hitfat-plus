/* ═══════════════ SKOR HITFAT · the rest of Simple, and ours ═══════════════
   What Simple has that the score card did not, and what we said we would add:

     Kenali Bara     the first time: three screens, Bara says who he is
     Coach Bara      a mission card under the rings: points to hari padu,
                     the quickest way there, and a line from Coach Seth
     Banner          Bara's face at the top when something is logged
     Junk food       Bara "confiscates" the cake (and says so)
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
function scSetRam(m){ var sc=HF.data.sc||(HF.data.sc={}); sc.ram=m; HF.save(); toast(m==='on'?'Ramadan mode on 🌙':m==='off'?'Ramadan mode off':'Ramadan mode follows the dates'); if(typeof renderMe==='function' && $('me') && $('me').style.display!=='none') renderMe(); }
function scRamRow(){
  if(!SC_FAST_LIVE) return '';
  var m=scRamMode();
  return '<div class="grow grow-ctl">'+ic('moon')+'<div class="grow-l">Ramadan mode<div class="pu-sub">'+(scRamadan()?'On: the Fast ring follows Ramadan':'The Fast ring follows Ramadan')+'</div></div>'+
    '<div class="obseg meseg"><button class="'+(m==='auto'?'on':'')+'" onclick="scSetRam(\'auto\')">Auto</button>'+
    '<button class="'+(m==='on'?'on':'')+'" onclick="scSetRam(\'on\')">On</button>'+
    '<button class="'+(m==='off'?'on':'')+'" onclick="scSetRam(\'off\')">Off</button></div></div>';
}
function scRamToggle(){
  var all=HF.data.daily||(HF.data.daily={}), d=iso(0), o=all[d]||(all[d]={water:0,steps:0});
  o.ram=o.ram?0:1; HF.save();
  if(o.ram){ _scSay='ram'; _scSayAt=Date.now(); scBanner('Puasa hari ni 🌙','Bara pun puasa… dari minyak 😅 Jumpa waktu berbuka.'); }
  scRender();
}

/* ── the banner: Bara's face, a word, sometimes an undo ── */
var _scbT=0;
function scBanner(title,body,act,actFn){
  var el=$('scb'); if(!el) return;
  var st=scState(), face=(typeof bellPoster==='function')?bellPoster(st.k==='rust'?'kusut':scLevel(scScore())):'';
  el.innerHTML='<div class="scb-in" onclick="scBannerHide()">'+(face?'<img src="'+face+'" alt="">':'')+
    '<div class="scb-tx"><b>'+hesc(title)+'</b>'+(body?'<span>'+hesc(body)+'</span>':'')+'</div>'+
    (act?'<button onclick="event.stopPropagation();scBannerHide();'+actFn+'">'+act+'</button>':'')+'</div>';
  el.className='scb on';
  clearTimeout(_scbT); _scbT=setTimeout(scBannerHide,act?4500:3200);
}
function scBannerHide(){ var el=$('scb'); if(el) el.className='scb'; }

/* ── junk food: Bara confiscates it ── */
/* (20 Oct, the Bara audit) junk food, and sweet drinks apart: a drink made
   kosong, kurang manis or zero is a good choice, never confiscated, and in a
   plate of several things Bara names only the junk one ("nasi lemak + teh
   tarik": the teh tarik, not the nasi lemak) */
var SC_JUNK=/\b(kek|cake|donut|doughnut|kuih|biskut|cookies?|coklat|chocolate|aiskrim|ais krim|ice ?cream|cendol|ais kacang|keropok|chips|kerepek|pisang goreng|goreng pisang|burger|pizza|fries|kentang goreng|nugget|roti canai|maggi|mee segera|candy|gula-gula|waffle|pancake|brownies?|cheesecake)\b/i;
var SC_SWEET=/\b(teh tarik|milo|kopi ais|bubble tea|boba|coke|cola|soda|pepsi|sirap|bandung)\b/i;
var SC_LESS=/\b(kosong|kurang manis|less sugar|zero|diet|tanpa gula|no sugar|sugar ?free)\b/i;
function scJunkPart(t,ctx){ t=String(t||''); return SC_JUNK.test(t) || (SC_SWEET.test(t) && !SC_LESS.test(t) && !SC_LESS.test(ctx||'')); }
/* the junk thing on this plate, by name, or '' */
function scJunkItem(m){
  if(!m) return '';
  /* the items a scan or the typed box found, then the name's own parts; an
     item "Teh tarik" from "teh tarik kurang manis" keeps the member's word */
  var comps=(m.comps||[]).map(function(c){ return c&&c.name; }).filter(Boolean), i;
  var parts=String(m.name||'').split(/\s*(?:\+|,|&|\/|\bdan\b|\band\b|\bwith\b)\s*/i);
  for(i=0;i<comps.length;i++) if(scJunkPart(comps[i], m.name)) return String(comps[i]).trim();
  for(i=0;i<parts.length;i++) if(parts[i] && scJunkPart(parts[i])) return String(parts[i]).trim();
  return (+m.kcal||0)>=900 ? String(m.name||'') : '';
}
function scJunk(m){ return !!scJunkItem(m); }
SC_LINES.junk=['Bara simpan {x} tu dulu ya 😇 Esok kita tukar dengan buah.',
  'Bara tak marah… cuma {x} tu Bara "simpan" 😏 Minum air kosong sekali ya.',
  'Sekali-sekala tak apa. Tapi Bara nampak {x} tu 👀'];
SC_LINES.ram=['Selamat berpuasa! 🌙 Bara pun puasa… dari makanan berminyak 😅'];
SC_LINES.fast=['Puasa dah mula ⏱️ Bara temankan awak sampai waktu makan.'];
function scJunkLine(name){
  var x=String(name||'snek').split(/[,(]/)[0].trim(); if(x.length>22) x=x.slice(0,22)+'…';
  var a=SC_LINES.junk; return a[new Date().getMinutes()%a.length].replace('{x}',x.charAt(0).toUpperCase()+x.slice(1));
}
/* a meal was logged (eat2.js logMeal) */
function scMealLogged(m){
  /* (20 Oct) a drink from the Drinks sheet has its own report and its own
     word on sugar; here it is water, never "confiscated" (a teh tarik
     kosong was taken away while the report praised it) */
  if(m && m.src==='drink'){ _scSay='water'; _scSayAt=Date.now(); return; }
  if(scJunk(m)){ _scSay='junk'; _scSayAt=Date.now(); _scJunkName=scJunkItem(m); scBanner('Bara rampas 😇',scJunkLine(_scJunkName)); }
  else { _scSay='meal'; _scSayAt=Date.now(); scBanner('Makanan dah dilog 🍽️','Bara suka orang jujur. Protein dulu, nasi secukupnya.'); }
}
var _scJunkName='';

/* ── one tap: water and the fast ── */
function scWaterTap(){
  var dy=scDaily(); scSet('water',dy.water+1); _scSay='water'; _scSayAt=Date.now();
  scBanner('+1 gelas air 💧',(dy.water+1)+'/'+SC_WATER+' hari ni · Glug glug!','Batal','scSet(\'water\',scDaily().water-1);scRender()');
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
  scBanner('Puasa dah mula ⏱️','Sasaran '+f.active.target+' jam. Tekan bulatan Fast untuk tamatkan.');
  scRender();
}

/* ── Coach Bara: the mission to hari padu, and Coach Seth ── */
var SC_SETH=['Consistency beats perfect. One strong day is worth more than a week of "later".',
  'Protein at every meal: chicken, fish, eggs, tofu. You stay full longer.',
  'Rice by the portion: one fist. No need to cut it out, just keep it in check.',
  'Plain water first when you feel hungry. Sometimes your body is only thirsty.',
  'Walk 10 minutes after a meal. Your blood sugar stays steadier.',
  'Sleeping 7 hours is the "workout" most people skip.',
  'Weigh yourself once a week, in the morning, after the toilet. Ignore the daily ups and downs.',
  'A 15-minute workout you do beats a 60-minute one you only plan.',
  'Sugar in drinks is worse than sugar in food. Go for teh O kosong or kopi O kosong.',
  'Cooking for yourself just twice a week already helps a lot.',
  'Slipped up? Don\'t write off the whole day. Pick it up again at the next meal.',
  'Keep sweet snacks out of sight. What you can\'t see, you don\'t eat.',
  'Stronger legs, better metabolism. Don\'t skip squats.',
  'Fat is lost in the kitchen; the body is shaped in the gym.'];
function scSethTip(){ var d=new Date(), n=Math.floor((d-new Date(d.getFullYear(),0,0))/864e5); return SC_SETH[n%SC_SETH.length]; }
function scMission(){
  var hs=scHabits(), share=100/hs.length, s=scScore(), opts=[], i, h, dy=scDaily();
  for(i=0;i<hs.length;i++){ h=hs[i]; if(h.v>=1) continue;
    if(h.k==='workout') opts.push({t:'1 short workout',p:share});
    else if(h.k==='water') opts.push({t:Math.min(3,SC_WATER-dy.water)+(Math.min(3,SC_WATER-dy.water)===1?' glass':' glasses')+' of water',p:share*Math.min(3,SC_WATER-dy.water)/SC_WATER});
    else if(h.k==='meal') opts.push({t:'log 1 meal',p:share/SC_MEALS});
    else if(h.k==='steps') opts.push({t:'walk 2,000 steps',p:share*Math.min(2000,SC_STEPS-dy.steps)/SC_STEPS});
    else if(h.k==='fast') opts.push({t:scRamadan()?'mark today fasted':'start your fast',p:share*(1-h.v)});
  }
  opts.sort(function(a,b){ return b.p-a.p; });
  var top=opts.slice(0,2).map(function(o){ return o.t+' <em>+'+Math.round(o.p)+'</em>'; }).join(' · ');
  if(s>=100) return 'Full score today 🏆 Rest well and get a good night\'s sleep.';
  if(s>=SC_PADU) return 'Strong day secured ✓ Go for 100: '+top;
  return '<b>'+(SC_PADU-s)+' points</b> to a strong day. Quickest: '+top;
}
function scCoachHTML(){
  var s=scScore();
  return '<div class="scx-coach"><div class="scx-k"><i></i>TODAY\'S MISSION</div>'+
    '<div class="scx-t">'+scMission()+'</div>'+
    '<div class="scx-bar"><i style="width:'+Math.min(100,s)+'%"></i><span class="m50'+(s>=SC_PADU?' on':'')+'">✓</span><span class="m100'+(s>=100?' on':'')+'">⚡</span></div>'+
    '<div class="scx-seth"><b>💬 Coach:</b> '+hesc(scSethTip())+'</div></div>';
}

/* ── Check-in: how are you feeling? (Simple asks every day) ──
   One tap, kept in daily[day].mood (1 to 5). It does not change the score;
   Bara answers it, and a low day gets kindness, not a push. */
var SC_MOODS=[[1,'😫','Awful'],[2,'😕','Bad'],[3,'😐','Okay'],[4,'🙂','Good'],[5,'😄','Great']];
var SC_MOOD_LINES={
  1:'Hari yang berat ya. Jaga diri 🤍 Jalan sikit dan minum air pun dah dikira.',
  2:'Slow-slow hari ni. Kemenangan kecil pun dikira 🙏',
  3:'Okay pun dah cukup untuk mula. Satu langkah kecil?',
  4:'Bagus! Jom jadikan hari ni hari padu 💪',
  5:'Semangatnya! Jom kejar hari padu 🔥'};
function scMoodLine(m){ return SC_MOOD_LINES[m]||'Awak rasa macam mana hari ni?'; }
function scMoodHTML(){
  var m=scDaily().mood, cur=null, i, ck=(typeof ckToday==='function')?ckToday():null;
  if(ck){
    for(i=0;i<SC_MOODS.length;i++) if(SC_MOODS[i][0]===ck.f) cur=SC_MOODS[i];
    var left=(ck.plan||[]).filter(function(k){ return !(ck.done&&ck.done[k]); }).length;
    return '<div class="scx-coach scx-mood ck-card" onclick="ckOpen()"><div class="scx-k"><i></i>CHECK-IN ✓</div>'+
      '<div class="scx-t"><b>'+(cur?cur[1]+' Feeling '+cur[2].toLowerCase()+' today':'Checked in today')+'</b></div>'+
      '<div class="ck-tagrow">'+(ck.tags||[]).slice(0,3).map(function(t){ var x=ckTagInfo(t); return x?'<span>'+x[1]+' '+x[2]+'</span>':''; }).join('')+'</div>'+
      '<div class="scx-seth">'+(left?'Bara updated today\'s plan: '+left+' to go below ↓':'Everything from your check-in is done ✓')+' · <u>Change</u></div></div>';
  }
  for(i=0;i<SC_MOODS.length;i++) if(SC_MOODS[i][0]===m) cur=SC_MOODS[i];
  return '<div class="scx-coach scx-mood"><div class="scx-k"><i></i>CHECK-IN</div>'+
    '<div class="scx-t"><b>'+(cur?'Feeling '+cur[2].toLowerCase()+' today':'How are you feeling today?')+'</b></div>'+
    '<div class="scx-faces'+(m?' has':'')+'">'+SC_MOODS.map(function(x){
      return '<button class="'+(x[0]===m?'on':'')+'" onclick="'+(typeof ckOpen==='function'?'ckOpen('+x[0]+')':'scMood('+x[0]+')')+'" aria-label="'+x[2]+'"><span>'+x[1]+'</span><i>'+x[2]+'</i></button>'; }).join('')+'</div>'+
    '<div class="scx-seth">'+(cur?'Saved for today. Tap another face to change it.':'Tap a face: Bara fits today\'s plan to how you feel.')+'</div></div>';
}
function scMood(m){
  if(m<1 || m>5) return;
  scSet('mood',m); _scSay='mood'; _scSayAt=Date.now();
  scRender();
}

/* ── Today's plan ── */
/* Today's Plan is in English, as the app around it (Bara himself speaks Malay) */
function scClock(min){ min=((Math.round(min)%1440)+1440)%1440; var h=Math.floor(min/60), m=min%60; return (h%12||12)+':'+('0'+m).slice(-2)+(h<12?' am':' pm'); }
/* the plan the member is on, at its next session, or null */
function scPlanNext(){
  var nx=(typeof nextUp==='function')?nextUp():null, p=nx&&nx.p&&nx.p.weeks?nx.p:null, gi, at;
  if(p && typeof nextSession==='function' && (gi=nextSession(p))>=0 && (at=sessionAt(p,gi))) return {p:p, gi:gi, at:at};
  return null;
}
/* (16 Oct) with no plan of their own, a member who has BURN30 sees it as
   today's plan, and finding a plan steps back to a quiet link under it:
   two equal calls one above the other left a new member unsure which */
function scBurnIsPlan(){ return !scPlanNext() && typeof wlOwned==='function' && wlOwned() && wlNext()<WL30_DAYS.length; }
function scPlanHTML(){
  var rows=[], dy=scDaily(), pn=scPlanNext(), p=pn&&pn.p, gi=pn&&pn.gi, at=pn&&pn.at;
  if(scBurnIsPlan())
    return '<div class="scx-plan">'+fsec("Today's Plan",'')+wlHomeCard()+
      '<button class="scx-alt" onclick="'+(typeof openFinder==='function'?'openFinder()':"switchTab('train')")+'">Or find a plan matched to your goal →</button>'+
      (typeof ckPlanHTML==='function'?ckPlanHTML():'')+'</div>';
  /* (16 Oct) one way into today's workout: the plan's next day, or finding a
     plan; water and steps live in the rings above, not here again */
  var strip=pn?scWeekStrip(p,gi):'';
  if(pn && !strip)
    rows.push({ic:'workout', t:(at.day.name||'Workout'), s:'Day '+(gi+1)+' of '+progDays(p)+' · '+p.name+' · '+p.dur+' min', done:scWorkouts(iso(0))>0, go:"openDay('"+p.id+"',"+gi+")", b:'Start'});
  else if(!pn) rows.push({ic:'target', t:'Find your first plan', s:'Four questions, matched to your goal and level', done:scWorkouts(iso(0))>0, go:(typeof openFinder==='function'?'openFinder()':"switchTab('train')"), b:'Find'});
  if(!SC_FAST_LIVE){}
  else if(scRamadan()) rows.push({ic:'moon', t:dy.ram?'Fasting today ✓':'Ramadan fast', s:'Sahur, iftar, and water in between', done:!!dy.ram, go:'scRamToggle()', b:dy.ram?'':'Mark'});
  else if(scHasIF() && typeof ifWindow==='function'){
    var w=ifWindow(), f=HF.data.ifs||{};
    rows.push({ic:'clock', t:'Eat '+scClock(w.start)+' – '+scClock(w.end), s:f.active?'Fasting now · end it in IF HITFAT':'Then fast for '+ifProto().f+' hours', done:false, go:f.active?'openIF()':'scFastTap()', b:f.active?'View':'Start'});
  }
  return '<div class="scx-plan">'+fsec("Today's Plan",'')+strip+'<div class="scx-rows'+(rows.length?'':' empty')+'">'+rows.map(function(r){
    return '<div class="scx-row'+(r.done?' done':'')+'" onclick="'+r.go+'"><span class="ic">'+glyph(r.ic)+'</span><div class="tx"><b>'+hesc(r.t)+'</b><span>'+hesc(r.s)+'</span></div>'+
      (r.done?'<span class="ok">✓</span>':(r.b?'<button onclick="event.stopPropagation();'+r.go+'">'+r.b+'</button>':''))+'</div>'; }).join('')+'</div>'+
    (typeof ckPlanHTML==='function'?ckPlanHTML():'')+'</div>';
}

/* ── the week ahead, after Simple's Explore (19 Oct): Today with Start,
   Tomorrow, then what's coming, as cards to swipe. Today's photo is the
   plan's own; the days after are its colour with the day's glyph. A day
   already trained shows done, and the next becomes Tomorrow. */
function scWeekStrip(p,gi){
  if(!p || gi<0 || typeof sessionAt!=='function') return '';
  var tot=progDays(p), done=scWorkouts(iso(0))>0, out='', n=0, i, at, lab, cls, glyphN;
  if(done && gi>0 && (at=sessionAt(p,gi-1)))
    out+='<div class="wkc done" onclick="openDay(\''+p.id+'\','+(gi-1)+')"><span class="wkt">Today ✓</span>'+
      '<div class="wkb"><small>Day '+gi+'</small><b>'+hesc(at.day.name||'Workout')+'</b><em>Done. Well done 💪</em></div></div>';
  for(i=gi;i<tot && n<5;i++){
    at=sessionAt(p,i); if(!at) break;
    lab=n===0?(done?'Tomorrow':'Today'):(n===1&&!done?'Tomorrow':'Upcoming');
    cls=n===0&&!done?'today':at.day.rest?'rest':'soon';
    glyphN=(typeof pdxDayGlyph==='function')?pdxDayGlyph(at.day.name||''):'workout';
    out+='<div class="wkc '+cls+'" onclick="openDay(\''+p.id+'\','+i+')"'+
      (cls==='today'?' style="background-image:linear-gradient(180deg,rgba(0,0,0,0) 30%,rgba(0,0,0,.75)),url(\''+progImg(p)+'\')"':'')+'>'+
      '<span class="wkt">'+lab+'</span>'+(cls!=='today'?'<span class="wkg">'+glyph(at.day.rest?'moon':glyphN)+'</span>':'')+
      '<div class="wkb"><small>Day '+(i+1)+(at.day.rest?'':' · '+p.dur+' min')+'</small><b>'+hesc(at.day.rest?'Rest day':(at.day.name||'Workout'))+'</b>'+
      (cls==='today'?'<button onclick="event.stopPropagation();openDay(\''+p.id+'\','+i+')">'+glyph('play')+'Start</button>':'')+'</div></div>';
    n++;
  }
  if(!out) return '';
  return '<div class="wkstrip"><div class="wkh"><b>'+hesc(p.name)+'</b><span>Week '+(sessionAt(p,gi)||{week:1}).week+' · Day '+(gi+1)+' of '+tot+'</span></div>'+
    '<div class="wkrow">'+out+'</div></div>';
}

/* ── Kenali Bara: once, the first time the card shows ── */
var SC_MEET=[
  {pose:'aktif', t:'Hai! Ini Bara 👋', s:'Kawan HITFAT awak. Bara jadi merah bila awak aktif, dan bulu Bara kusut bila awak lama menghilang 🥲'},
  {pose:'w_water', t:'Penuhkan 4 bulatan setiap hari', s:'Workout, makan, air dan langkah. Semuanya jadi HITFAT Score awak, 0 hingga 100.'},
  {pose:'gold',  t:'Skor 50+ = hari padu 🔥', s:'Hari padu berturut-turut jadi streak. Cukup 7 hari, Bara jadi emas. Terlepas sehari? Awak ada 2 freeze sebulan ❄️'}];
function scCheckMeet(){
  var sc=HF.data.sc||(HF.data.sc={});
  if(sc.met || $('scc').style.display==='flex') return false;
  scMeet(0); return true;
}
function scMeet(i){
  var m=SC_MEET[i], last=i===SC_MEET.length-1;
  $('scc').className='scc scc-meet';
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
  var w=scWeekStats(off), p=scWeekStats(off+1), diff=w.avg-p.avg, st=scStreak().n, pose=w.avg>=SC_PADU?'gold':scTone('calendar','aktif');
  var line=diff>0?'Naik '+diff+' mata dari minggu lepas 👏 Bara bangga dengan awak!':diff<0?'Turun '+(-diff)+' mata. Tak apa, minggu depan kita kejar balik 💪':'Sama macam minggu lepas. Konsisten pun satu kemenangan 🤍';
  var bd=w.best.iso?new Date(w.best.iso+'T00:00:00').toLocaleDateString('en-GB',{weekday:'long'}):'–';
  /* its own light look (18 Oct): it used to borrow Beast Mode's red, where the
     red Bara vanished, the score went grey on red and the tiles were black.
     Now white to soft pink, so a red or gold Bara stands out; the number is
     ink, red on a strong week */
  $('scc').className='scc scc-report';
  $('scc').innerHTML='<div class="scc-in">'+scMomentBell(pose)+
    '<div class="scx-wk">This week\'s report</div>'+
    '<div class="scx-wn'+(w.avg>=SC_PADU?' strong':'')+'">'+w.avg+'<span>/100 average</span></div>'+
    '<div class="scc-s scc-bellsays">'+line+'</div>'+
    '<div class="scx-wg"><div><b>'+w.padu+'</b><span>strong days</span></div><div><b>🔥 '+st+'</b><span>streak</span></div><div><b>'+(w.best.v||'–')+'</b><span>'+bd+'</span></div></div>'+
    '<button class="bigbtn scc-share" onclick="scCelebrateClose()">New week, let\'s go!</button></div>';
  $('scc').style.display='flex'; scMomentPlay(pose);
}


/* ── Score insights (Simple's "Score insights"): today's score habit by
   habit, the week so far, and how the score works. From the card and from
   the score pill. ── */
function scInsights(){
  var s=scScore(), hs=scHabits(), share=100/hs.length, c=scColor(s), st=scStreak(), lv=scLevel(s), i;
  var poster=(typeof bellPoster==='function')?bellPoster(scState().k==='rust'?'kusut':lv):'';
  var status=s>=100?'Full score 🏆 Bara couldn\'t be prouder.':s>=SC_PADU?'Strong day ✓ Bara is red.':(SC_PADU-s)+' points to a strong day, when Bara turns red.';
  var h='<div class="pwtop"><span></span><button class="pwx" aria-label="Close" onclick="scClose()">✕</button></div>'+
    '<div class="sci"><div class="sc-sh-k">Score insights</div>'+
    '<div class="sci-top">'+(poster?'<img src="'+poster+'" alt="Bara">':'')+
      '<div><div class="sci-n" style="color:'+c+'">'+s+'<span>/100</span></div><div class="sci-s">'+status+'</div></div></div>';
  /* habit by habit: what each is worth and what is left */
  h+='<div class="sci-h">Today, habit by habit</div><div class="sci-rows">'+hs.map(function(x){
      var got=Math.round(x.v*share), left=Math.round(share)-got;
      return '<button class="sci-row'+(x.v>=1?' full':'')+'" onclick="scClose();scTap(\''+x.k+'\')">'+
        '<span class="ic">'+glyph(x.ic)+'</span><span class="tx"><b>'+x.n+'</b><span>'+hesc(x.t||x.val)+'</span>'+
        '<i class="bar"><i style="width:'+Math.round(x.v*100)+'%"></i></i></span>'+
        '<span class="pt"><b>+'+got+'</b><span>'+(left>0?left+' to go':'done')+'</span></span></button>';
    }).join('')+'</div>';
  /* the week so far, Monday on */
  var dow=(new Date().getDay()+6)%7, names=['M','T','W','T','F','S','S'], bars='', sum=0, n=0, strong=0, v;
  for(i=0;i<7;i++){
    if(i>dow){ bars+='<div class="sci-d"><i class="col"><i style="height:0"></i></i><span>'+names[i]+'</span></div>'; continue; }
    v=scScore(iso(i-dow)); sum+=v; n++; if(v>=SC_PADU) strong++;
    bars+='<div class="sci-d'+(i===dow?' now':'')+'"><b>'+v+'</b><i class="col"><i style="height:'+Math.max(3,v)+'%;background:'+scColor(v)+'"></i></i><span>'+names[i]+'</span></div>';
  }
  h+='<div class="sci-h">This week</div><div class="sci-wk"><div class="sci-bars"><i class="line"></i>'+bars+'</div>'+
    '<div class="sci-ws"><div><b>'+(n?Math.round(sum/n):0)+'</b><span>average</span></div><div><b>'+strong+'</b><span>strong day'+(strong===1?'':'s')+'</span></div>'+
    '<div><b>🔥 '+st.n+'</b><span>streak</span></div><div><b>❄️ '+scFreezeLeft()+'</b><span>freezes left</span></div></div></div>';
  /* how it works */
  h+='<div class="sci-h">How it works</div><div class="sci-how">'+
    '<div><b>4 habits, 25 points each.</b> A workout, '+SC_MEALS+' meals, '+SC_WATER+' glasses of water, '+SC_STEPS.toLocaleString('en-MY')+' steps. Part of a habit counts too.</div>'+
    '<div><b>50 or more is a strong day.</b> Bara turns from cream to red.</div>'+
    '<div><b>Strong days in a row make your streak.</b> Miss one? '+SC_FREEZES+' freezes a month keep it alive.</div>'+
    '<div><b>Nothing logged for 2 days</b> and Bara gets dusty; 3 days and Bara\'s fur gets messy. One log fixes it.</div></div>'+
    '<button class="bigbtn sci-go" onclick="scClose();switchTab(\'progress\')">See your history</button></div>';
  $('pw-body').innerHTML=h; $('pwm').classList.add('on');
  try{ $('pwm').scrollTop=0; }catch(e){}
}

/* ── Your 30-day base (17 Oct 2026, after Simple's calibration card) ──
   Seth: "aku nk letak line mcm calibration tu". A swipe card for the first
   30 days: Day N, what this week is about, and a pill that runs from
   ASSESSMENT through the 30-DAY BASE to READY!. Our words, not Simple's.
   The start is the first day anything was logged on this account (kept in
   sc.base, so it never moves); someone who logged before is placed on the
   right day, and someone past day 37 never sees it. Days 31–37 show what the
   30 days added up to; after that the card is gone. */
var SC_BASE_DAYS=30, SC_BASE_SHOW=37;
function scBaseStart(){
  var sc=HF.data.sc||(HF.data.sc={}), t=iso(0), first=t, k, o, d;
  if(sc.base && /^\d{4}-\d\d-\d\d$/.test(sc.base)) return sc.base;
  [HF.data.daily||{}, HF.data.meals||{}].forEach(function(o){ for(var k in o) if(/^\d{4}-\d\d-\d\d$/.test(k) && k<first) first=k; });
  o=HF.data.sessions||{};
  for(k in o){ d=o[k]&&o[k].date; if(d){ d=String(d).slice(0,10); if(/^\d{4}-\d\d-\d\d$/.test(d) && d<first) first=d; } }
  sc.base=first; return first;
}
function scBase(){
  var start=scBaseStart(), day=daysBetween(start, iso(0))+1, n=Math.min(day, SC_BASE_DAYS), days=[], logged=0, strong=0, i, d, s;
  if(day<1) day=1;
  var hab={workout:0, meal:0, water:0, steps:0};
  for(i=0;i<n;i++){
    d=iso(i-(day-1)); s=scScore(d); days.push({d:d, s:s});
    if(s>0) logged++; if(s>=SC_PADU) strong++;
    scHabits(d).forEach(function(h){ if(hab[h.k]!==undefined) hab[h.k]+=h.v; });
  }
  var best=null; for(var k in hab) if(hab[k]>0 && (!best || hab[k]>hab[best])) best=k;
  return {start:start, day:day, days:days, logged:logged, strong:strong, best:best,
          ready:day>SC_BASE_DAYS, show:day<=SC_BASE_SHOW, today:scScore()>0};
}
var SC_BASE_HAB={workout:'working out', meal:'logging meals', water:'drinking water', steps:'walking'};
var SC_BASE_WEEK=[
  'Week 1 is about <b>showing up</b>. Log what you eat, drink and move, honestly. Every day you log <em>{f}builds your base</em>.',
  'Week 2: <b>patterns</b> start to show. Open Score insights and see which habit <em>{f}carries your days</em>.',
  'Week 3: go for <b>strong days</b>, a score of 50 or more. Three a week makes a <em>{f}solid base</em>.',
  'The last stretch. <b>Keep your streak</b> and finish the 30 days <em>{f}strong</em>.'];
var SC_BASE_FOCUS=['Show up: log a little every day','Spot which habit carries you','Three strong days a week','Finish strong, keep the streak'];
function scBaseFill(b){ return b.ready?100:Math.round(26+70*Math.min(b.day,SC_BASE_DAYS)/SC_BASE_DAYS); }
function scBaseHTML(){
  if(!HF.data.onboarded) return '';
  var b=scBase(); if(!b.show) return '';
  var f='<svg class="gly" viewBox="0 0 24 24" aria-hidden="true">'+ICON_PATH[iconKind('flame')]+'</svg>', t, p;
  if(b.ready){
    t='Your base is built! 🏆';
    p='30 days: <b>'+b.logged+' day'+(b.logged===1?'':'s')+' logged</b>, <b>'+b.strong+' strong day'+(b.strong===1?'':'s')+'</b>.'+
      (b.best?' Your strongest habit is <em>'+f+SC_BASE_HAB[b.best]+'</em>.':' Start again any day; one log is enough.');
  } else {
    t=b.today?'Day '+b.day+' done!':b.day===1?'Day 1 starts now':'Day '+b.day+': one log counts';
    p=SC_BASE_WEEK[Math.min(3, Math.floor((b.day-1)/7))].replace('{f}', f);
  }
  return '<div class="scx-coach scx-base" onclick="scBaseSheet()" role="button">'+
    '<div class="scx-k"><i></i>'+(b.ready?'BASE BUILT':'YOUR 30-DAY BASE')+' <span class="scb-chev">›</span></div>'+
    '<div class="scb-h">'+t+'</div><div class="scb-p">'+p+'</div>'+
    '<div class="scb-bar'+(b.ready?' done':'')+'"><div class="scb-fill" style="width:'+scBaseFill(b)+'%"><span class="scb-ok">✓</span><span class="scb-go">»</span></div><span class="scb-end">'+f+'</span></div>'+
    '<div class="scb-lab"><span>ASSESSMENT</span><span>30-DAY BASE</span><span>READY!</span></div></div>';
}
/* the whole 30 days at a glance: a dot a day, and what each week is about */
function scBaseSheet(){
  var b=scBase(), wk=Math.min(3, Math.floor((Math.min(b.day,SC_BASE_DAYS)-1)/7)), dots='', i, x, cls;
  for(i=0;i<SC_BASE_DAYS;i++){
    x=b.days[i]; cls=!x?'fut':x.s>=SC_PADU?'strong':x.s>0?'log':'miss';
    if(x && x.d===iso(0)) cls+=' now';
    dots+='<i class="'+cls+'" title="Day '+(i+1)+'">'+(i+1)+'</i>';
  }
  var h='<div class="pwtop"><span></span><button class="pwx" aria-label="Close" onclick="scClose()">✕</button></div>'+
    '<div class="sci scbs"><div class="sc-sh-k">Your 30-day base</div>'+
    '<div class="scbs-top"><b>'+(b.ready?'Built 🏆':'Day '+b.day+'<span> of '+SC_BASE_DAYS+'</span>')+'</b>'+
      '<div class="scbs-st"><div><b>'+b.logged+'</b><span>days logged</span></div><div><b>'+b.strong+'</b><span>strong days</span></div></div></div>'+
    '<div class="scbs-dots">'+dots+'</div>'+
    '<div class="scbs-key"><span><i class="strong"></i>Strong day</span><span><i class="log"></i>Logged</span><span><i class="miss"></i>Nothing logged</span></div>'+
    '<div class="sci-h">Week by week</div><div class="sci-how">'+SC_BASE_FOCUS.map(function(t,j){
      return '<div class="'+(!b.ready&&j===wk?'on':'')+'"><b>Week '+(j+1)+(j===3?' (days 22–30)':'')+'.</b> '+t+'</div>'; }).join('')+'</div>'+
    '<div class="sci-h">How it works</div><div class="sci-how">'+
      '<div><b>Day 1 is your first log.</b> Your goal and plan from sign-up are the assessment.</div>'+
      '<div><b>Any log counts the day.</b> A score of 50 or more makes it a strong day.</div>'+
      '<div><b>After 30 days</b> your Progress shows your real routine, not a guess.</div></div>'+
    '<button class="bigbtn sci-go" onclick="scClose()">'+(b.today||b.ready?'Got it':'Log something now')+'</button></div>';
  $('pw-body').innerHTML=h; $('pwm').classList.add('on');
  try{ $('pwm').scrollTop=0; }catch(e){}
}
