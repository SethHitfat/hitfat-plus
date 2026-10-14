/* ═══════════════ DIET 6 MINGGU 6KG ═══════════════
   "Nasi Kekal, Lemak Hilang": 42 days by Coach Seth, sold on its own
   (prog_d6, RM39) and part of HITFAT+ for members. Built on BURN30's
   template, in Malay, its content read from parts/diet6data.js (D6_DATA,
   the JSON as written, not edited here).

   What a day holds (D6_DATA.days):
     card              the knowledge card, read first
     mission           today's mission, ticked by hand
     checklist         log food · water · steps · rice by the senduk
     workout           optional: a strength session (A or B, played with
                       HITFAT's filmed clips), a walk or a stretch (timed)
     body_checkin      days 1, 21, 42: weight, waist, photo
     food_audit        days 3 and 14: everything eaten, from the audit list
     recalculate_budget days 8, 15, 22, 29, 36: the budget from the newest
                       weight
     offer             days 28, 40, 41, 42: coaching or HITFAT+
     share_card        day 42
   The budget is Mifflin-St Jeor × activity, minus 0.5–1 % of body weight a
   week (at most 1 kg), never under 1,200 kcal for women or 1,500 for men.

   Mapping from the JSON, reported to the owner: a strength move plays the
   HITFAT clip closest to it (D6_CLIP); one without a clip (Superman,
   the stretches) plays its name and reps over the timer. ES5 only. */

var D6_ID='d6', D6_KEY='d6', D6_PRICE=39;
var D6_NAME=D6_DATA.program.name, D6_SUB=D6_DATA.program.subtitle;
var D6_DAYS=D6_DATA.days, D6_TOT=D6_DAYS.length;
var D6_ACCENT='#F0392B';
/* the strength moves, to the filmed HITFAT clip closest to each */
var D6_CLIP={
  'Squat ke kerusi':'Chair Squat',
  'Push-up dinding / lutut':'Wall Push Up',
  'Glute bridge':'Hip Thrust',
  'Row guna beg / botol air':'Bottle Bent Over Row',
  'Plank lutut':'Plank',
  'Step back lunge (pegang kerusi jika perlu)':'Reverse Lunges',
  'Wall sit':'Wall Sit',
  'Dead bug':'Dead Bug',
  'Calf raise':'Calf Raises'
};
var D6_ACTS=['tidak aktif','ringan','sederhana','aktif','sangat aktif'];
var D6_ACT_LABEL={'tidak aktif':'Tidak aktif · kerja pejabat, jarang bersenam','ringan':'Ringan · bersenam 1–3 kali seminggu',
  'sederhana':'Sederhana · bersenam 3–5 kali seminggu','aktif':'Aktif · bersenam 6–7 kali seminggu','sangat aktif':'Sangat aktif · kerja fizikal atau latihan berat'};
var D6_RATES=[[0.005,'Perlahan & selesa','0.5% berat seminggu'],[0.0075,'Sederhana','0.75% berat seminggu'],[0.01,'Laju','1% berat seminggu, maksimum 1 kg']];

/* the program, in the shape the rest of the app reads */
var D6=(function(){
  var weeks=[], w;
  for(w=1; w<=6; w++) weeks.push({days:D6_DAYS.filter(function(d){ return d.week===w; }).map(function(d){ return {name:d.card.title, ex:[]}; })});
  var p={id:D6_ID, name:D6_NAME, sub:D6_SUB, goal:'Fat Loss', level:'Beginner', dur:20, rounds:2,
    c1:'#3a1a12', c2:'#0b0b0d', ac:D6_ACCENT, icon:'🍚', weeks:weeks, hub:'d6', oneTime:true, price:D6_PRICE, wk:6,
    desc:D6_SUB+' 42 hari bersama '+D6_DATA.program.coach+': satu kad ilmu dan satu misi setiap hari, bajet kalori anda sendiri, '+
         'nasi ikut senduk, dan senaman tanpa lompat yang pilihan.'};
  PROGRAMS.push(p);
  return p;
})();

/* ── state ── */
function d6Data(){
  var d=HF.data.d6||(HF.data.d6={});
  d.p=d.p||{}; d.chk=d.chk||{}; d.steps=d.steps||{}; d.water=d.water||{}; d.misi=d.misi||{}; d.wo=d.wo||{};
  d.body=d.body||{}; d.audit=d.audit||{}; d.rc=d.rc||{};
  return d;
}
function d6Owned(){ return ownsProgram(D6); }
function d6Done(){ return Math.min(progDone(D6_ID), D6_TOT); }
function d6Next(){ return d6Done(); }
function d6Day(gi){ return D6_DAYS[Math.max(0,Math.min(gi,D6_TOT-1))]; }
function d6WeekName(w){ return D6_DATA.weeks[String(w)]||''; }
function d6Num(s){ var m=String(s).replace(/,/g,'').match(/(\d+(?:\.\d+)?)/); return m?parseFloat(m[1]):0; }
/* the day's targets, read from its own checklist lines */
function d6WaterT(day){ var t=0; day.checklist.forEach(function(c){ if(/air/i.test(c)&&/L/.test(c)) t=d6Num(c); }); return t; }
function d6StepsT(day){ var t=0; day.checklist.forEach(function(c){ if(/langkah/i.test(c)) t=d6Num(c); }); return t; }

/* ── the budget ── */
function d6Weight(){
  var p=d6Data().p, w=HF.data.weight||[];
  return w.length ? w[w.length-1].kg : (p.wt||0);
}
function d6Calc(p,wt){
  if(!p || !p.sex || !p.age || !p.ht || !(wt||p.wt)) return null;
  wt=wt||p.wt;
  var bmr = p.sex==='lelaki' ? 10*wt+6.25*p.ht-5*p.age+5 : 10*wt+6.25*p.ht-5*p.age-161;
  var f=D6_DATA.budget_calc.activity_factors[p.act||'tidak aktif']||1.2;
  var tdee=Math.round(bmr*f);
  var rateKg=Math.min(1, wt*(p.rate||0.005));                  /* a week, at most 1 kg */
  var floor=p.sex==='lelaki' ? D6_DATA.budget_calc.floor_kcal.lelaki : D6_DATA.budget_calc.floor_kcal.wanita;
  var cal=Math.max(floor, Math.round((tdee-rateKg*7700/7)/10)*10);
  var weekly=Math.round((tdee-cal)*7/7700*10)/10;               /* what the budget really gives */
  return {bmr:Math.round(bmr), tdee:tdee, cal:cal, floor:floor, floorHit:cal===floor && tdee-rateKg*7700/7<floor,
          weekly:weekly, goal:Math.min(6, Math.round(weekly*6*10)/10), wt:wt};
}
function d6Budget(){ var d=d6Data(); return d.bud || null; }
function d6Senduk(cal){
  var r=D6_DATA.nutrition.senduk_rule, i;
  for(i=0;i<r.length;i++) if(cal<=r[i].budget_max) return r[i].senduk_per_main_meal;
  return 2;
}
function d6SaveProfile(){
  var g=function(id){ return parseFloat(($(id)||{}).value); };
  var d=d6Data(), p=d.p;
  p.age=parseInt(($('d6-age')||{}).value,10)||0; p.wt=g('d6-wt')||0; p.ht=g('d6-ht')||0;
  if(!p.sex) return toast('Pilih jantina anda');
  if(!p.wt||!p.ht||!p.age) return toast('Isi berat, tinggi dan umur');
  if(!(HF.data.weight||[]).length) logWeight(p.wt);
  d.bud=d6Calc(p,d6Weight()); d.bud.day=d6Next()+1;
  HF.save(); toast('Bajet anda sudah dikira'); renderD6();
}
function d6Set(k,v){ var p=d6Data().p; p[k]=v; HF.save(); renderD6(); }
/* the recalculation days: the budget again, from the newest weight */
function d6Recalc(gi){
  var d=d6Data(), wt=d6Weight();
  if(!d.p.sex) return toast('Lengkapkan profil di Mula Di Sini dahulu');
  d.bud=d6Calc(d.p,wt); d.bud.day=gi+1; d.rc[gi+1]=true; d.p.wt=wt;
  HF.save(); toast('Bajet dikira semula: '+d.bud.cal.toLocaleString()+' kcal'); d6OpenDay(gi);
}

/* ── the program's home ── */
var d6Tab='plan', d6Week=-1;
function d6SetTab(t){ d6Tab=t; renderD6(); try{ var s=$('screen'), a=$('d6-tabs'); if(s&&a&&a.offsetTop) s.scrollTop=Math.max(0,a.offsetTop-70); }catch(e){} }
function d6Poster(cls){
  return '<div class="'+cls+' d6-type"><img class="lb-mark" src="/img/brand/hf-mark.png" alt="HITFAT">'+
    '<div class="lb-name">'+hesc(D6_NAME)+'</div><div class="lb-sub d6-sub">NASI KEKAL · LEMAK HILANG</div></div>';
}
function d6Hero(kicker,sub,meta,pill){
  return pdxBar(kicker,pill)+d6Poster('wl-hero lb-type'+(kicker==='day'?' day':''))+
    '<div class="wl-hero-tx"><div class="s">'+sub+'</div>'+(meta?'<div class="m">'+meta+'</div>':'')+'</div>';
}
function renderD6(){
  lbLang(true);
  var owned=d6Owned(), done=d6Done(), nx=d6Next(), pct=Math.round(done/D6_TOT*100);
  if(d6Week<0) d6Week=d6Day(nx).week-1;
  var pill=!owned ? {icon:'lock',label:'RM'+D6_PRICE,go:'d6Buy()'} : nx<D6_TOT ? {icon:'play',label:'Hari '+(nx+1),go:'d6OpenDay('+nx+')'} : null;
  var status=!owned ? D6_SUB : nx<D6_TOT ? 'Hari '+(nx+1)+' daripada '+D6_TOT+' · Minggu '+d6Day(nx).week+': '+d6WeekName(d6Day(nx).week) : 'Program selesai';
  var h=d6Hero('program',status, owned?'':'Bayar sekali · milik anda selamanya', pill);
  if(owned) h+='<div class="lb-head"><div class="pbar d6-bar"><i style="width:'+pct+'%"></i></div><span>'+pct+'%</span></div>';
  h+='<div class="pdx-btns">';
  if(!owned) h+='<button class="bigbtn d6-btn" onclick="d6Buy()">Dapatkan Program · RM'+D6_PRICE+'</button>'+
       '<button class="pdx-prev" onclick="openPaywall(\'\')">'+glyph('star')+'Termasuk dalam HITFAT+</button>';
  else if(!d6Budget()) h+='<button class="bigbtn d6-btn" onclick="d6SetTab(\'guide\')">'+glyph('flag')+'Mula: kira bajet anda</button>';
  else if(nx<D6_TOT) h+='<button class="bigbtn d6-btn" onclick="d6OpenDay('+nx+')">'+glyph('play')+(done?'Teruskan · Hari '+(nx+1):'Mula Hari 1')+'</button>';
  else h+='<button class="bigbtn d6-btn" onclick="d6SetTab(\'progress\')">'+glyph('trophy')+'Lihat Keputusan Anda</button>';
  h+='</div>';
  h+='<div class="filters wl-tabs lb-tabs" id="d6-tabs">'+[['plan','Pelan'],['food','Pemakanan'],['progress','Progres'],['guide','Mula Di Sini']]
    .map(function(t){ return '<button class="chip'+(d6Tab===t[0]?' y':'')+'" onclick="d6SetTab(\''+t[0]+'\')">'+t[1]+'</button>'; }).join('')+'</div>';
  if(d6Tab==='food') h+=d6Food();
  else if(d6Tab==='progress') h+=d6Progress();
  else if(d6Tab==='guide') h+=d6Guide();
  else h+=d6Plan();
  $('pgd-body').innerHTML=h;
}

/* ── Plan: today's card, today's list, the six weeks ── */
function d6Plan(){
  var owned=d6Owned(), done=d6Done(), nx=d6Next(), h='';
  if(nx<D6_TOT){
    var day=d6Day(nx);
    h+=fsec(owned?'Hari Ini':'Hari 1','');
    h+='<div class="d6-card" onclick="d6OpenDay('+nx+')"><div class="k">Kad Ilmu · Hari '+day.day+'</div>'+
      '<div class="t">'+hesc(day.card.title)+'</div><div class="s">'+hesc(day.card.body)+'</div>'+
      '<div class="d6-tags">'+d6Tags(day).join('')+'</div><div class="go">Buka Hari '+day.day+' ›</div></div>';
    if(owned) h+=d6Checklist(nx);
  }
  var wk=d6Week+1;
  h+=fsec('6 Minggu','');
  h+='<div class="filters pdx-weeks">'+[1,2,3,4,5,6].map(function(w){
    var last=D6_DAYS.filter(function(d){ return d.week===w; }).pop().day;
    return '<button class="chip'+(w===wk?' y':'')+'" onclick="d6Week='+(w-1)+';renderD6()">'+(done>=last?'✓ ':'')+'M'+w+'</button>'; }).join('')+'</div>';
  h+='<div class="lb-week"><div class="t">Minggu '+wk+' · '+hesc(d6WeekName(wk))+'</div></div>';
  h+='<div class="lb-days">'+D6_DAYS.filter(function(d){ return d.week===wk; }).map(function(d){
    var gi=d.day-1, isDone=gi<done, now=gi===nx&&owned;
    return '<div class="lb-dayrow d6-row'+(isDone?' done':'')+(now?' now':'')+'" onclick="d6OpenDay('+gi+')">'+
      '<span class="n">'+(isDone?glyph('check'):d.day)+'</span>'+
      '<div class="tx"><div class="t">'+hesc(d.card.title)+'</div><div class="m">'+d6Tags(d,true).join(' · ')+'</div></div>'+
      (now?'<span class="lb-now d6-now">Hari ini</span>':'<span class="pdx-chev">›</span>')+'</div>';
  }).join('')+'</div>';
  return h;
}
/* what is special about a day, as short labels */
function d6Tags(d,plain){
  var t=[];
  if(d.body_checkin) t.push('Check-in badan');
  if(d.food_audit) t.push('Audit makan');
  if(d.recalculate_budget) t.push('Kira semula bajet');
  if(d.workout) t.push(d.workout.name);
  return plain ? t : t.map(function(x){ return '<span>'+x+'</span>'; });
}

/* today's list: the day's own four lines, plus the mission */
function d6Checklist(gi){
  var d=d6Data(), day=d6Day(gi), t=iso(0), c=d.chk[t]||{};
  var wT=d6WaterT(day), sT=d6StepsT(day), wt=+d.water[t]||0, st=+d.steps[t]||0;
  var logged=(typeof mealsFor==='function') && mealsFor(t).length>0;
  var items=[
    ['misi', !!d.misi[day.day], 'Misi Hari Ini', day.mission, '', "d6Misi("+day.day+")"],
    ['log', logged||!!c.log, day.checklist[0], logged?'Ada '+mealsFor(t).length+' catatan dalam Log Makan':'Tekan untuk tanda, atau log di tab Makan', '', "d6Tick('log')"],
    ['air', wt>=wT-0.001, day.checklist[1], '', d6Ctl('d6Water(-0.25)', wt.toFixed(2).replace(/0$/,'')+' L', 'd6Water(0.25)'), ''],
    ['langkah', st>=sT, day.checklist[2], '', d6Ctl('d6Steps(-500)', st.toLocaleString(), 'd6Steps(500)'), "d6Steps('goal')"],
    ['nasi', !!c.nasi, day.checklist[3], d6Budget()?d6Senduk(d6Budget().cal)+' senduk setiap makan utama':'', '', "d6Tick('nasi')"]
  ];
  var n=items.filter(function(x){ return x[1]; }).length;
  return fsec('Senarai Semak Hari Ini',n+' daripada '+items.length+' siap')+'<div class="lb-chks">'+items.map(function(x){
    return '<div class="lb-chk d6-chk'+(x[1]?' on':'')+'"'+(x[5]?' onclick="'+x[5]+'"':'')+'><span class="b">'+(x[1]?glyph('check'):'')+'</span>'+
      '<div class="tx"><div class="t">'+hesc(x[2])+'</div>'+(x[3]?'<div class="m">'+hesc(x[3])+'</div>':'')+'</div>'+(x[4]||'')+'</div>';
  }).join('')+'</div>';
}
function d6Ctl(minus,val,plus){ return '<span class="lb-ctl d6-ctl" onclick="event.stopPropagation()"><button onclick="'+minus+'" aria-label="Kurang">−</button><b>'+val+'</b><button onclick="'+plus+'" aria-label="Tambah">+</button></span>'; }
function d6Re(){ if($('daydetail') && $('daydetail').style.display==='block' && d6Cur>=0) d6OpenDay(d6Cur); else renderD6(); }
function d6Tick(k){ var d=d6Data(), t=iso(0); d.chk[t]=d.chk[t]||{}; d.chk[t][k]=!d.chk[t][k]; HF.save(); d6Re(); }
function d6Misi(n){ var d=d6Data(); d.misi[n]=!d.misi[n]; HF.save(); d6Re(); }
function d6Water(n){ var d=d6Data(), t=iso(0); d.water[t]=Math.max(0,Math.round(((+d.water[t]||0)+n)*100)/100); HF.save(); d6Re(); }
function d6Steps(n){
  var d=d6Data(), t=iso(0), sT=d6StepsT(d6Day(d6Next()));
  d.steps[t]= n==='goal' ? ((+d.steps[t]||0)>=sT?0:sT) : Math.max(0,(+d.steps[t]||0)+n);
  HF.save(); d6Re();
}

/* ── a day ── */
var d6Cur=-1;
function d6OpenDay(gi){
  var day=D6_DAYS[gi]; if(!day) return;
  var owned=d6Owned(), d=d6Data(), done=d6Done();
  d6Cur=gi; curProg=D6;
  var h=d6Hero('day','Hari '+day.day+' daripada '+D6_TOT+' · Minggu '+day.week+': '+hesc(d6WeekName(day.week)),'',
    owned?(gi<done?null:{icon:'check',label:'Siap',go:'d6Complete('+gi+')'}):{icon:'lock',label:'RM'+D6_PRICE,go:'d6Buy()'});
  if(!owned){
    h+='<div class="d6-card"><div class="k">Kad Ilmu · Hari '+day.day+'</div><div class="t">'+hesc(day.card.title)+'</div><div class="s">'+hesc(day.card.body)+'</div></div>';
    h+='<div class="pdx-btns"><button class="bigbtn d6-btn" onclick="d6Buy()">'+glyph('lock')+'Buka · RM'+D6_PRICE+'</button></div>';
    $('dd-body').innerHTML=h; hidePanels(); $('daydetail').style.display='block'; $('screen').scrollTop=0; lbLang(true); return;
  }
  /* 1. the knowledge card */
  h+='<div class="d6-card"><div class="k">Kad Ilmu · 2 minit</div><div class="t">'+hesc(day.card.title)+'</div><div class="s">'+hesc(day.card.body)+'</div></div>';
  /* 2. the mission */
  h+='<div class="lb-chks"><div class="lb-chk d6-chk'+(d.misi[day.day]?' on':'')+'" onclick="d6Misi('+day.day+')"><span class="b">'+(d.misi[day.day]?glyph('check'):'')+'</span>'+
     '<div class="tx"><div class="t">Misi Hari Ini</div><div class="m">'+hesc(day.mission)+'</div></div></div></div>';
  /* 3. what only some days have */
  if(day.body_checkin) h+=d6CheckinForm(day.day);
  if(day.food_audit) h+=d6Audit(day.day);
  if(day.recalculate_budget) h+=d6RecalcCard(gi);
  if(day.day===20) h+=d6MetCalc();
  /* 4. the workout, optional */
  if(day.workout) h+=d6Workout(gi);
  /* 5. today's list, on today */
  if(gi===d6Next()) h+=d6Checklist(gi);
  /* 6. the offer, for those it is for */
  if(day.offer) h+=d6Offer(day.offer);
  if(day.share_card) h+='<button class="bigbtn sec" onclick="d6Share()">'+glyph('share')+'Kongsi Kad Hasil</button>';
  h+='<div class="pdx-btns">'+(gi<done
    ? '<div class="d6-done">'+glyph('check')+'Hari '+day.day+' sudah siap</div>'
    : '<button class="bigbtn d6-btn" onclick="d6Complete('+gi+')">'+glyph('check')+'Tandakan Hari '+day.day+' Siap</button>')+'</div>';
  $('dd-body').innerHTML=h;
  hidePanels(); $('daydetail').style.display='block'; $('screen').scrollTop=0;
  lbLang(true);
}
function d6Complete(gi){
  if(progDone(D6_ID)===gi){ HF.data.progress[D6_ID]=gi+1; }
  HF.markDone(D6_KEY+'-d'+gi,{name:D6_DAYS[gi].card.title, mins:0});
  HF.save(); toast('Hari '+(gi+1)+' siap 🔥');
  hidePanels(); $('progdetail').style.display='block'; d6Tab='plan'; d6Week=-1; renderD6(); $('screen').scrollTop=0;
}

/* the workout: strength in the player, walks and stretches on a timer */
function d6Workout(gi){
  var day=D6_DAYS[gi], w=day.workout, d=d6Data(), done=!!d.wo[day.day];
  var timed=!/Sesi Kuat/i.test(w.name);
  var h=fsec('Senaman (pilihan)',w.name+' · '+w.minutes+' min'+(w.rounds?' × '+w.rounds+' pusingan':'')+' · impak '+w.impact);
  h+='<div class="lb-days">'+w.moves.map(function(m,i){
    var clip=D6_CLIP[m.name];
    return '<div class="lb-dayrow d6-row"'+(clip?' onclick="playExercise(\''+clip.replace(/'/g,"\\'")+'\')"':'')+'><span class="n">'+(i+1)+'</span>'+
      '<div class="tx"><div class="t">'+hesc(m.name)+'</div><div class="m">'+hesc(m.reps)+'</div></div>'+
      (clip?'<span class="pdx-play">'+glyph('play')+'</span>':'')+'</div>';
  }).join('')+'</div>';
  if(w.rest && w.rest!=='-') h+='<div class="lb-fine d6-fine">Rehat: '+hesc(w.rest)+'</div>';
  if(done) h+='<div class="d6-done">'+glyph('check')+'Senaman siap</div>';
  else if(timed) h+='<div id="d6-timer" class="d6-timer"><button class="bigbtn d6-btn" onclick="d6StartTimer('+gi+')">'+glyph('play')+'Mula Pemasa · '+w.minutes+' min</button>'+
     '<button class="pdx-prev" onclick="d6WorkoutDone('+gi+')">'+glyph('check')+'Sudah buat, tandakan siap</button></div>';
  else h+='<div class="pdx-btns"><button class="bigbtn d6-btn" onclick="d6Play('+gi+')">'+glyph('play')+'Mula '+hesc(w.name)+'</button>'+
     '<button class="pdx-prev" onclick="d6WorkoutDone('+gi+')">'+glyph('check')+'Sudah buat, tandakan siap</button></div>';
  return h;
}
function d6Ex(m){
  var name=D6_CLIP[m.name], e=null, i;
  if(name) for(i=0;i<DB.length;i++) if(DB[i].n===name && DB[i].v){ e=DB[i]; break; }
  return {n:m.name+' · '+m.reps, v:e?e.v:'', m:e?e.m:'Full Body', dur:45, eq:'Tanpa alat', t:e?e.t:'core'};
}
function d6Play(gi){
  var w=D6_DAYS[gi].workout;
  startWorkout(w.moves.map(d6Ex),{rounds:w.rounds||2, name:w.name, key:D6_KEY+'-d'+gi+'-w', d6:{gi:gi}});
}
function d6AfterSession(m){
  if(HF.data.sessions[D6_KEY+'-d'+m.gi+'-w']){ d6Data().wo[m.gi+1]=true; HF.save(); }
  d6OpenDay(m.gi);
}
function d6WorkoutDone(gi){
  var w=D6_DAYS[gi].workout;
  d6Data().wo[gi+1]=true; HF.markDone(D6_KEY+'-d'+gi+'-w',{name:w.name, mins:w.minutes});
  HF.save(); toast('Senaman siap'); d6OpenDay(gi);
}
var _d6T=null;
function d6StartTimer(gi){
  var w=D6_DAYS[gi].workout, end=Date.now()+w.minutes*60000;
  if(_d6T) clearInterval(_d6T);
  var tick=function(){
    var el=$('d6-timer'); if(!el){ clearInterval(_d6T); _d6T=null; return; }
    var left=Math.max(0,Math.round((end-Date.now())/1000));
    el.innerHTML='<div class="d6-clock">'+Math.floor(left/60)+':'+('0'+(left%60)).slice(-2)+'</div>'+
      '<button class="pdx-prev" onclick="d6StopTimer()">Berhenti</button>';
    if(left<=0){ clearInterval(_d6T); _d6T=null; d6WorkoutDone(gi); }
  };
  _d6T=setInterval(tick,1000); tick();
}
function d6StopTimer(){ if(_d6T){ clearInterval(_d6T); _d6T=null; } if(d6Cur>=0) d6OpenDay(d6Cur); }

/* body check-in: weight, waist, photo — days 1, 21, 42 */
var D6_CHECKINS=[1,21,42];
function d6CheckinForm(n){
  var b=d6Data().body[n]||{}, src=d6Photo(n);
  return fsec('Check-in Badan · Hari '+n,'Pagi, selepas ke tandas, sebelum makan.')+'<div class="lb-body"><div class="esfields">'+
    [['kg','Berat','kg'],['waist','Pinggang','cm']].map(function(m){
      return '<label class="esf"><span>'+m[1]+'</span><input class="inp" inputmode="decimal" placeholder="0" aria-label="'+m[1]+' hari '+n+'" value="'+(b[m[0]]||'')+'" '+
        'onchange="d6SetBody('+n+',\''+m[0]+'\',this.value)"><em>'+m[2]+'</em></label>'; }).join('')+'</div>'+
    '<label class="wl-ph lb-ph'+(src?' has':'')+'"'+(src?' style="background-image:url(\''+src+'\')"':'')+'>'+
      '<input type="file" accept="image/*" onchange="d6AddPhoto('+n+',this)">'+(src?'':ic('photo'))+'<span>Gambar Hari '+n+'</span></label>'+
    '<div class="lb-fine">Gambar disimpan dalam telefon ini sahaja.</div></div>';
}
function d6SetBody(n,k,v){
  var w=d6Data(); w.body[n]=w.body[n]||{}; w.body[n][k]=parseFloat(v)||0;
  if(k==='kg' && w.body[n].kg) logWeight(w.body[n].kg);
  HF.save();
}
function d6PhotoKey(n){ return 'hf_d6_photo_'+(HF.userId||'me')+'_'+n; }
function d6Photo(n){ try{ return localStorage.getItem(d6PhotoKey(n))||''; }catch(e){ return ''; } }
function d6AddPhoto(n,input){
  var f=input&&input.files&&input.files[0]; if(!f) return;
  var r=new FileReader();
  r.onload=function(){ var im=new Image(); im.onload=function(){
    var s=Math.min(1,640/Math.max(im.width,im.height)), c=document.createElement('canvas');
    c.width=Math.round(im.width*s); c.height=Math.round(im.height*s);
    c.getContext('2d').drawImage(im,0,0,c.width,c.height);
    try{ localStorage.setItem(d6PhotoKey(n), c.toDataURL('image/jpeg',0.72)); toast('Gambar disimpan'); }
    catch(e){ toast('Ruang telefon tidak cukup untuk gambar'); }
    d6Re();
  }; im.src=r.result; };
  r.readAsDataURL(f);
}

/* food audit: everything eaten today, from the list; day 14 against day 3 */
function d6Audit(n){
  var a=d6Data().audit[n]||{}, list=D6_DATA.food_audit_list, tot=d6AuditTotal(n), bud=d6Budget();
  var h=fsec('Audit Makan','Tambah setiap yang anda makan dan minum hari ini. Nilai ialah anggaran.');
  h+='<div class="d6-audit-sum"><div><b>'+tot.toLocaleString()+'</b><span>kcal dimakan</span></div>'+
    (bud?'<div><b>'+bud.cal.toLocaleString()+'</b><span>bajet anda</span></div><div><b class="'+(tot>bud.cal?'up':'')+'">'+(tot>bud.cal?'+':'')+(tot-bud.cal).toLocaleString()+'</b><span>beza</span></div>':'')+'</div>';
  if(n===14 && d6AuditTotal(3)) h+='<div class="wl-delta">Hari 3: '+d6AuditTotal(3).toLocaleString()+' kcal → Hari 14: '+tot.toLocaleString()+' kcal</div>';
  h+='<div class="lb-days d6-audit">'+list.map(function(it,i){
    var q=a[i]||0;
    return '<div class="lb-dayrow d6-row'+(q?' on':'')+'"><div class="tx"><div class="t">'+hesc(it.name)+'</div><div class="m">'+hesc(it.portion)+' · '+it.kcal+' kcal</div></div>'+
      d6Ctl('d6AuditAdd('+n+','+i+',-1)', q, 'd6AuditAdd('+n+','+i+',1)')+'</div>';
  }).join('')+'</div>';
  return h;
}
function d6AuditTotal(n){
  var a=(d6Data().audit[n])||{}, list=D6_DATA.food_audit_list, t=0, k;
  for(k in a) if(a.hasOwnProperty(k) && list[k]) t+=list[k].kcal*a[k];
  return t;
}
function d6AuditAdd(n,i,by){
  var d=d6Data(); d.audit[n]=d.audit[n]||{}; d.audit[n][i]=Math.max(0,(d.audit[n][i]||0)+by);
  if(!d.audit[n][i]) delete d.audit[n][i];
  HF.save(); var y=$('screen').scrollTop; d6OpenDay(n-1); $('screen').scrollTop=y;
}

function d6RecalcCard(gi){
  var d=d6Data(), bud=d6Budget(), wt=d6Weight();
  var h=fsec('Kira Semula Bajet','Badan yang lebih ringan perlukan tenaga yang kurang.');
  h+='<div class="d6-bud"><div class="k">Bajet sekarang</div><div class="n">'+(bud?bud.cal.toLocaleString()+'<span> kcal</span>':'—')+'</div>'+
    '<div class="s">Berat terkini: '+(wt?wt+' kg':'belum direkod')+'</div>'+
    '<div class="d6-weigh"><input class="inp" id="d6-wtoday" inputmode="decimal" placeholder="Berat pagi ini (kg)"><button onclick="d6WeighRecalc('+gi+')">Simpan & Kira</button></div>'+
    (d.rc[gi+1]?'<div class="d6-done">'+glyph('check')+'Sudah dikira semula hari ini</div>':'')+'</div>';
  return h;
}
function d6WeighRecalc(gi){ var v=parseFloat(($('d6-wtoday')||{}).value); if(v) logWeight(v); d6Recalc(gi); }

/* how much an activity burns: kcal = MET × kg × hours */
var _d6Met=0, _d6Min=30;
function d6MetCalc(){
  var a=D6_DATA.activity_mets, wt=d6Weight()||60, k=Math.round(a[_d6Met].met*wt*_d6Min/60);
  return fsec('Kalkulator Bakar Kalori','kcal = MET × berat (kg) × jam')+'<div class="d6-met">'+
    '<select class="inp" onchange="_d6Met=+this.value;d6Re()">'+a.map(function(x,i){ return '<option value="'+i+'"'+(i===_d6Met?' selected':'')+'>'+hesc(x.name)+' (MET '+x.met+')</option>'; }).join('')+'</select>'+
    '<div class="d6-met-r"><span>Minit</span>'+d6Ctl('_d6Min=Math.max(5,_d6Min-5);d6Re()', _d6Min, '_d6Min=_d6Min+5;d6Re()')+'</div>'+
    '<div class="d6-met-out"><b>'+k+'</b> kcal <span>· berat '+wt+' kg</span></div>'+
    '<div class="lb-fine">Segelas teh tarik lebih kurang 150 kcal.</div></div>';
}

function d6Offer(o){
  if(o.type==='subscription' && contentOpen()) return '';
  var btn=o.type==='upgrade'
    ? (typeof COACH_WA!=='undefined'&&COACH_WA ? '<button class="bigbtn sec" onclick="window.open(\'https://wa.me/'+COACH_WA+'\',\'_blank\',\'noopener\')">'+glyph('people')+'Lihat pilihan coaching</button>' : '')
    : '<button class="bigbtn d6-btn" onclick="openPaywall(\'\')">'+glyph('star')+'Langgan HITFAT+</button>';
  return '<div class="d6-offer"><div class="t">'+hesc(o.text)+'</div>'+btn+'</div>';
}
function d6Share(){
  var b=d6Data().body, a=b[1]||{}, z=b[42]||{};
  var t='Saya tamatkan '+D6_NAME+' bersama HITFAT'+(a.kg&&z.kg?': turun '+Math.round((a.kg-z.kg)*10)/10+' kg':'')+(a.waist&&z.waist?', pinggang turun '+Math.round((a.waist-z.waist)*10)/10+' cm':'')+'.';
  try{ if(navigator.share){ navigator.share({title:D6_NAME, text:t, url:'https://app.hitfat.io'}); return; } }catch(e){}
  try{ navigator.clipboard.writeText(t+' https://app.hitfat.io'); toast('Disalin — tampal di mana-mana'); }catch(e){ toast(t); }
}

/* ── Pemakanan: the budget, the senduk, five choices a meal ── */
function d6Food(){
  if(!d6Owned()) return d6Locked('food','Bajet kalori & menu','Bajet ikut badan anda, nasi ikut senduk, dan lima pilihan setiap waktu makan.');
  var bud=d6Budget(), N=D6_DATA.nutrition, h='';
  if(!bud) return d6Locked('flag','Kira bajet anda dahulu','Lengkapkan profil di Mula Di Sini: jantina, umur, berat, tinggi dan tahap aktiviti.','d6SetTab(\'guide\')','Ke Mula Di Sini');
  var sd=d6Senduk(bud.cal);
  h+='<div class="nstage wl-stage"><div class="nstage-k">Bajet harian anda</div><div class="nstage-n">'+bud.cal.toLocaleString()+'<span> kcal</span></div>'+
    '<div class="nstage-s">Lebih kurang '+bud.weekly+' kg seminggu · sasaran 6 minggu sehingga '+bud.goal+' kg</div>'+
    '<div class="nstage-g"><div><b>'+sd+'</b><span>Senduk nasi</span></div><div><b>'+N.senduk_kcal+'</b><span>kcal / senduk</span></div><div><b>'+bud.tdee.toLocaleString()+'</b><span>Keperluan</span></div></div></div>';
  if(bud.floorHit) h+='<div class="lb-fine d6-fine">Bajet anda ditetapkan pada lantai '+bud.floor.toLocaleString()+' kcal. App tidak akan pergi lebih rendah.</div>';
  h+='<div class="lb-fine d6-fine">'+hesc(N.meals_note)+'</div>';
  Object.keys(N.meals).forEach(function(slot,si){
    var opts=N.meals[slot], sid='d6m-'+si;
    h+='<div class="mpslot" id="'+sid+'"><div class="mpslot-h"><div><div class="t">'+hesc(slot)+'</div><div class="m">Pilih 1 daripada '+opts.length+'</div></div>'+
      '<div class="mpopts">'+opts.map(function(o,oi){ return '<button class="mpo'+(oi===0?' on':'')+'" aria-label="Pilihan '+(oi+1)+'" onclick="mpOpt(\''+sid+'\','+oi+')">'+(oi+1)+'</button>'; }).join('')+'</div></div>'+
      opts.map(function(o,oi){
        var rice=/\[senduk\]/.test(o.name), name=o.name.replace(/\[senduk\]/g, sd+' senduk'), k=o.kcal_excl_rice+(rice?Math.round(sd*N.senduk_kcal):0);
        return '<div class="mpopt" style="display:'+(oi===0?'block':'none')+';"><div class="mpopt-h"><div class="t">'+hesc(name)+'</div><div class="k">~'+k+' kcal</div></div>'+
          (rice?'<div class="mpitem"><div><div class="m">Lauk ~'+o.kcal_excl_rice+' kcal + nasi '+sd+' senduk ~'+Math.round(sd*N.senduk_kcal)+' kcal</div></div></div>':'')+'</div>';
      }).join('')+'</div>';
  });
  h+=fsec('Senduk Nasi Ikut Bajet','Satu senduk nasi ≈ '+N.senduk_kcal+' kcal.');
  h+='<div class="lb-days">'+N.senduk_rule.map(function(r,i){
    var lo=i?N.senduk_rule[i-1].budget_max+1:0, label=i===0?'Bajet bawah '+(r.budget_max+1).toLocaleString()+' kcal':r.budget_max>9999?'Bajet '+lo.toLocaleString()+' kcal ke atas':'Bajet '+lo.toLocaleString()+' hingga '+r.budget_max.toLocaleString()+' kcal';
    return '<div class="lb-dayrow d6-row'+(r.senduk_per_main_meal===sd?' now':'')+'"><div class="tx"><div class="t">'+label+'</div></div><b>'+r.senduk_per_main_meal+' senduk</b></div>';
  }).join('')+'</div>';
  h+=d6MetCalc();
  h+=fsec('Senarai Kalori','Anggaran untuk makanan dan minuman biasa.');
  h+='<div class="lb-days">'+D6_DATA.food_audit_list.map(function(it){
    return '<div class="lb-dayrow d6-row"><div class="tx"><div class="t">'+hesc(it.name)+'</div><div class="m">'+hesc(it.portion)+'</div></div><b>'+it.kcal+'</b></div>'; }).join('')+'</div>';
  return h;
}

/* ── Progres: weight every morning, the check-ins, the photos ── */
function d6Progress(){
  if(!d6Owned()) return d6Locked('chart','Lihat diri anda berubah','Berat setiap pagi, pinggang dan gambar pada Hari 1, 21 dan 42.');
  var d=d6Data(), done=d6Done(), h='';
  h+='<div class="wl-stats">'+[[done,'Hari siap'],[Object.keys(d.misi).filter(function(k){ return d.misi[k]; }).length,'Misi siap'],
    [Object.keys(d.wo).length,'Senaman']].map(function(x){ return '<div><b>'+x[0]+'</b><span>'+x[1]+'</span></div>'; }).join('')+'</div>';
  /* the morning weigh-in */
  h+=fsec('Timbang Pagi Ini','Selepas ke tandas, sebelum makan. Lihat trend, bukan satu hari.');
  h+='<div class="d6-weigh"><input class="inp" id="d6-wt2" inputmode="decimal" placeholder="Berat (kg)"><button onclick="d6Weigh()">Simpan</button></div>';
  var ws=(HF.data.weight||[]).slice(-14);
  if(ws.length>1){
    var lo=Math.min.apply(null,ws.map(function(x){return x.kg;})), hi=Math.max.apply(null,ws.map(function(x){return x.kg;})), r=Math.max(0.5,hi-lo);
    h+='<div class="d6-spark">'+ws.map(function(x){ return '<i title="'+x.iso+' · '+x.kg+' kg" style="height:'+Math.round(20+(x.kg-lo)/r*80)+'%"></i>'; }).join('')+'</div>'+
      '<div class="lb-fine d6-fine">'+ws.length+' timbangan terakhir · '+ws[0].kg+' kg → '+ws[ws.length-1].kg+' kg</div>';
  }
  h+=fsec('Check-in Badan','Hari 1, 21 dan 42.');
  h+='<div class="wl-fit wl-body"><div class="wl-fit-h"><span></span>'+D6_CHECKINS.map(function(n){ return '<b>Hari '+n+'</b>'; }).join('')+'</div>'+
    [['kg','Berat','kg'],['waist','Pinggang','cm']].map(function(m){ return '<div class="wl-fit-r"><span>'+m[1]+'<small>'+m[2]+'</small></span>'+
      D6_CHECKINS.map(function(n){ return '<input inputmode="decimal" aria-label="'+m[1]+' hari '+n+'" value="'+((d.body[n]||{})[m[0]]||'')+'" onchange="d6SetBody('+n+',\''+m[0]+'\',this.value);renderD6()">'; }).join('')+'</div>'; }).join('')+'</div>';
  var b1=d.body[1]||{}, bl=(d.body[42]&&d.body[42].kg)?d.body[42]:(d.body[21]||{});
  if(b1.kg&&bl.kg){ var dk=Math.round((bl.kg-b1.kg)*10)/10;
    h+='<div class="wl-delta">'+(dk<0?'Turun '+(-dk)+' kg':dk>0?'Naik '+dk+' kg':'Berat kekal')+
      (b1.waist&&bl.waist?' · pinggang '+(bl.waist<=b1.waist?'turun '+Math.round((b1.waist-bl.waist)*10)/10:'naik '+Math.round((bl.waist-b1.waist)*10)/10)+' cm':'')+'</div>'; }
  h+=fsec('Gambar Progres','Disimpan dalam telefon ini sahaja.');
  h+='<div class="wl-photos">'+D6_CHECKINS.map(function(n){
    var src=d6Photo(n);
    return '<label class="wl-ph'+(src?' has':'')+'"'+(src?' style="background-image:url(\''+src+'\')"':'')+'>'+
      '<input type="file" accept="image/*" onchange="d6AddPhoto('+n+',this)">'+(src?'':ic('photo'))+'<span>Hari '+n+'</span></label>';
  }).join('')+'</div>';
  if(d6AuditTotal(3)||d6AuditTotal(14)) h+=fsec('Audit Makan','')+'<div class="d6-audit-sum"><div><b>'+d6AuditTotal(3).toLocaleString()+'</b><span>Hari 3</span></div><div><b>'+d6AuditTotal(14).toLocaleString()+'</b><span>Hari 14</span></div></div>';
  return h;
}
function d6Weigh(){ var v=parseFloat(($('d6-wt2')||{}).value); if(!v||v<20||v>300) return toast('Masukkan berat antara 20 dan 300'); logWeight(v); toast('Berat direkod'); renderD6(); }

/* ── Mula Di Sini: the welcome, the profile that sets the budget, safety ── */
function d6Guide(){
  var S=D6_DATA.start_here, d=d6Data(), p=d.p, h='';
  h+='<div class="d6-card"><div class="t">'+hesc(D6_NAME)+'</div><div class="s">'+hesc(S.welcome)+'</div></div>';
  h+='<div class="lb-safe">'+ic('warning')+'<div><div class="t">Keselamatan</div><div class="s">'+hesc(S.safety)+'</div></div></div>';
  if(d6Owned()){
    h+=fsec('Profil & Bajet','Lima jawapan, dan bajet anda dikira.');
    h+='<div class="obseg d6-seg"><button class="'+(p.sex==='wanita'?'on':'')+'" onclick="d6Set(\'sex\',\'wanita\')">Wanita</button>'+
       '<button class="'+(p.sex==='lelaki'?'on':'')+'" onclick="d6Set(\'sex\',\'lelaki\')">Lelaki</button></div>';
    var fld=function(id,l,u,v,m){ return '<label class="esf"><span>'+l+'</span><input class="inp" id="'+id+'" inputmode="'+m+'" placeholder="0" value="'+(v||'')+'"><em>'+u+'</em></label>'; };
    h+='<div class="esfields">'+fld('d6-wt','Berat','kg',p.wt,'decimal')+fld('d6-ht','Tinggi','cm',p.ht,'decimal')+fld('d6-age','Umur','tahun',p.age,'numeric')+'</div>';
    h+='<div class="d6-q">Tahap aktiviti</div><div class="lb-days">'+D6_ACTS.map(function(a){
      return '<div class="lb-dayrow d6-row'+((p.act||'tidak aktif')===a?' now':'')+'" onclick="d6Set(\'act\',\''+a+'\')"><div class="tx"><div class="t">'+D6_ACT_LABEL[a]+'</div></div>'+((p.act||'tidak aktif')===a?glyph('check'):'')+'</div>'; }).join('')+'</div>';
    h+='<div class="d6-q">Kadar turun berat</div><div class="lb-days">'+D6_RATES.map(function(r){
      return '<div class="lb-dayrow d6-row'+((p.rate||0.005)===r[0]?' now':'')+'" onclick="d6Set(\'rate\','+r[0]+')"><div class="tx"><div class="t">'+r[1]+'</div><div class="m">'+r[2]+'</div></div>'+((p.rate||0.005)===r[0]?glyph('check'):'')+'</div>'; }).join('')+'</div>';
    h+='<button class="bigbtn d6-btn esave" onclick="d6SaveProfile()">'+(d6Budget()?'Kira Semula Bajet Saya':'Kira Bajet Saya')+'</button>';
    var b=d6Budget();
    if(b) h+='<div class="d6-bud"><div class="k">Bajet harian</div><div class="n">'+b.cal.toLocaleString()+'<span> kcal</span></div>'+
      '<div class="s">Keperluan '+b.tdee.toLocaleString()+' kcal · lebih kurang '+b.weekly+' kg seminggu · sasaran 6 minggu sehingga '+b.goal+' kg</div></div>';
  }
  h+=fsec('Cara Guna','');
  h+='<div class="wl-steps">'+S.how_to_use.map(function(s,i){ return '<div class="wl-step"><span class="n">'+(i+1)+'</span><div><div class="m">'+hesc(s)+'</div></div></div>'; }).join('')+'</div>';
  h+=fsec('Sasaran','');
  h+='<div class="wl-tips"><div>'+hesc(S.target_note)+'</div><div>'+hesc(S.calorie_floor)+'</div></div>';
  h+=fsec('Senaman','Pilihan, tetapi sangat digalakkan. Semuanya tanpa lompat.');
  h+='<div class="lb-days">'+Object.keys(D6_DATA.workouts).map(function(k){
    var w=D6_DATA.workouts[k]; return '<div class="lb-dayrow d6-row"><div class="tx"><div class="t">'+hesc(w.name)+'</div><div class="m">'+w.minutes+' min · impak '+hesc(w.impact)+'</div></div></div>'; }).join('')+'</div>';
  if(typeof COACH_WA!=='undefined' && COACH_WA)
    h+='<button class="bigbtn sec" onclick="window.open(\'https://wa.me/'+COACH_WA+'\',\'_blank\',\'noopener\')">'+glyph('people')+'Tanya Coach di WhatsApp</button>';
  return h;
}

function d6Locked(icon,title,text,go,label){
  return '<div class="wl-lock">'+ic(icon)+'<div class="t">'+title+'</div><div class="s">'+text+'</div>'+
    '<button class="bigbtn d6-btn" onclick="'+(go||'d6Buy()')+'">'+(label||'Dapatkan Program · RM'+D6_PRICE)+'</button></div>';
}

/* ── buying it ── */
function d6Buy(){
  if(d6Owned()) return openProgram(D6_ID);
  $('pw-body').innerHTML=
    '<div class="pwtop"><span></span><button class="pwx" aria-label="Tutup" onclick="closeProduct()">✕</button></div>'+
    d6Poster('wl-buy-poster lb-buy lb-type')+
    '<div class="pwlist">'+[
      ['food','Bajet kalori anda sendiri','Nasi kekal, ikut senduk. Tidak pernah bawah 1,200 kcal (wanita) / 1,500 kcal (lelaki)'],
      ['doc','42 kad ilmu & misi harian','Dua minit sehari, bersama '+D6_DATA.program.coach],
      ['chart','Audit makan, check-in, gambar','Hari 1, 21 dan 42 — dalam nombor'],
      ['trophy','Milik anda selamanya','Bayar sekali. Tiada langganan, tiada apa untuk dibatalkan']]
      .map(function(b){ return '<div class="pwf"><div class="ic">'+ic(b[0])+'</div><div><div class="t">'+b[1]+'</div><div class="m">'+b[2]+'</div></div></div>'; }).join('')+'</div>'+
    '<div class="pwprice"><div class="p">RM'+D6_PRICE+'</div><div class="per">bayar sekali</div></div>'+
    '<button class="bigbtn d6-btn" onclick="startCheckout(\'prog_'+D6_ID+'\')">Beli RM'+D6_PRICE+'</button>'+
    '<button class="authalt" onclick="openPaywall(\'\')">Atau dapatkan semua dengan HITFAT+</button>'+
    '<div class="wl-claim"><div class="t">Beli di laman web kami?</div>'+
    '<div class="s">Log masuk dengan emel yang anda guna untuk bayar, dan ia terbuka sendiri. Guna emel lain? Masukkan nombor pesanan dari resit anda.</div>'+
    '<div class="wl-claim-f"><input id="d6-order" placeholder="Nombor pesanan" autocomplete="off"><button onclick="d6Claim()">Buka</button></div></div>';
  $('pwm').classList.add('on');
  try{ $('pwm').scrollTop=0; }catch(e){}
  lbLang(true);
}
function d6Claim(){
  var o=String((($('d6-order')||{}).value)||'').trim();
  if(!o) return toast('Masukkan nombor pesanan dari resit anda');
  if(!sb||!HF.userId) return toast('Log masuk dahulu');
  sb.rpc('plus_claim_landing',{p_order:o}).then(function(r){ if(r.error) throw r.error; return loadEntitlement(); }).then(function(){
    if(d6Owned()){ closeProduct(); toast('Dibuka — selamat datang'); openProgram(D6_ID); }
    else toast('Tiada pesanan berbayar dengan nombor itu. Semak resit, atau mesej kami.');
  })['catch'](function(){ toast('Pesanan itu tidak dapat disemak — cuba lagi sebentar.'); });
}

/* ── Home ──
   A program she has started, or bought on its own, gets its full card;
   the rest sit side by side in one small row, so Home stays tidy. */
function d6Full(){ var o=d6Owned(); return o && d6Next()<D6_TOT && (owns('prog_'+D6_ID) || d6Done()>0); }
function d6HomeCard(){
  if(!d6Full()) return '';
  var nx=d6Next(), day=d6Day(nx), pct=Math.round(d6Done()/D6_TOT*100);
  return '<div class="wl-poster lb-card" onclick="openProgram(\''+D6_ID+'\')">'+d6Poster('lb-card-poster lb-type')+
    '<div class="wl-poster-b"><div class="tx"><div class="k">Hari '+(nx+1)+' · Minggu '+day.week+'</div>'+
    '<div class="t">'+hesc(day.card.title)+'</div><div class="pbar d6-bar"><i style="width:'+pct+'%"></i></div></div>'+
    '<button class="bigbtn d6-btn" onclick="event.stopPropagation();d6OpenDay('+nx+')">'+glyph('play')+'Hari '+(nx+1)+'</button></div></div>';
}
function hubRow(){
  var tiles=[];
  if(typeof lbFull==='function' && !lbFull() && lbNext()<LB30_DAYS.length)
    tiles.push('<div class="hub-tile" onclick="openProgram(\''+LB30_ID+'\')">'+lbPoster('hub-tile-p lb-type')+
      '<div class="hub-tile-t">'+hesc(LB30_NAME)+'</div><div class="hub-tile-s">30 hari · khas wanita</div></div>');
  if(!d6Full() && d6Next()<D6_TOT)
    tiles.push('<div class="hub-tile" onclick="openProgram(\''+D6_ID+'\')">'+d6Poster('hub-tile-p lb-type')+
      '<div class="hub-tile-t">'+hesc(D6_NAME)+'</div><div class="hub-tile-s">42 hari · nasi kekal</div></div>');
  if(!tiles.length) return '';
  return '<div class="hub-row">'+tiles.join('')+'</div>';
}
