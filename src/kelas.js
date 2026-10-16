/* ═══════════════════════════════════════════════════════════════
   HITFAT CLASS · the physical class member's corner (17 Oct 2026)

   Members of a class at HITFAT HQ (HITFAT Active Class, Ladies Only, Mens
   Only, HYROX; RM250 a month) get All Access in HITFAT+ while their class
   membership runs. They connect once with their phone number, the one the
   counter has in HITFAT OS (os.hitfat.io), and then see:

     the check-in QR    the member id, exactly what their member card
                        carries, so the kiosk at the door reads it as is
     the membership     when it started, when it ends, days left
     the timetable      their classes this week, and the next one
     attendance         this month, the week streak, every check-in

   Nobody else sees any of it: a member who is not connected has one row
   in Me, one line under the paywall, and the ?kelas link staff send.

   The edge function plus-class does the asking (HITFAT OS is another
   Supabase project) and keeps the All Access pass in step with the end
   date. The last answer is kept on the phone, per account, so the QR
   still shows at the door with no signal.
   ═══════════════════════════════════════════════════════════════ */

/* Live since 17 Oct 2026: 39-plus-class.sql here, 080_plus_bridge.sql in
   HITFAT OS, the key's hash in OS plus_bridge, plus-class deployed.
   false hides every way in (Me, the paywall line, Home) at once. */
var KELAS_LIVE=true;
var KELAS_CATS={Membership:'HITFAT Active Class', Ladies:'Ladies Only', Mens:'Mens Only', HYROX:'HYROX Class'};
var KELAS_DOW=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

var Kelas={state:'idle', data:null, step:'phone', phone:'', found:null, err:'', busy:false, day:null, unlinkAsk:false};

function kelasKey(){ return 'hf_kelas_'+(HF&&HF.userId||''); }
function kelasSave(){ try{ if(HF.userId) localStorage.setItem(kelasKey(), JSON.stringify(Kelas.data)); }catch(e){} }
function kelasRestore(){
  try{ const s=HF.userId&&localStorage.getItem(kelasKey()); Kelas.data=s?JSON.parse(s):null; }catch(e){ Kelas.data=null; }
}
function kelasLinked(){ return !!(KELAS_LIVE && Kelas.data && Kelas.data.linked); }
function kelasMems(){ return (Kelas.data&&Kelas.data.memberships)||[]; }
/* the membership that runs longest; the one the card and the access follow */
function kelasMain(){
  const m=kelasMems().slice().sort((a,b)=>(b.active-a.active)||String(b.end_date||'').localeCompare(String(a.end_date||'')));
  return m[0]||null;
}
function kelasActive(){ const m=kelasMain(); return kelasLinked() && !!(m && m.active); }
function kelasCat(c){ return KELAS_CATS[c]||c||'Class'; }

/* ── talking to plus-class ── */
async function kelasCall(action, extra){
  if(typeof sb==='undefined' || !sb || !HF.userId) throw new Error('signin');
  const s=await sb.auth.getSession();
  const tok=s&&s.data&&s.data.session&&s.data.session.access_token;
  if(!tok) throw new Error('signin');
  const r=await fetch(SUPA_URL.replace(/\/+$/,'')+'/functions/v1/plus-class',{
    method:'POST', headers:{'Content-Type':'application/json', Authorization:'Bearer '+tok, apikey:SUPA_KEY},
    body:JSON.stringify(Object.assign({action:action}, extra||{}))});
  const j=await r.json().catch(()=>({}));
  if(r.status===429) throw new Error('too_many');
  if(!r.ok) throw new Error(j.error||'failed');
  return j;
}
/* At sign-in and on opening the Class screen. Quiet: a member who is not
   connected costs one small request and sees nothing. */
async function kelasLoad(){
  if(!KELAS_LIVE || typeof sb==='undefined' || !sb || !HF.userId) return;
  if(Kelas.state==='idle') kelasRestore();
  Kelas.state='loading';
  try{
    const was=kelasLinked();
    const st=await kelasCall('status');
    Kelas.data=st&&st.linked?st:null; kelasSave(); Kelas.state='ready';
    /* the pass may have moved (renewed, ended, released at the counter):
       read it again so the app opens or closes with it */
    if(was || kelasLinked()) await loadEntitlement();
  }catch(e){ Kelas.state='error'; }
  kelasRepaint();
}
function kelasRepaint(){
  if($('kelas') && $('kelas').style.display==='block') renderKelas();
  else if($('home') && $('home').style.display!=='none' && typeof renderHome==='function') renderHome();
}

/* ── the ?kelas link staff send ── */
function captureKelasParam(){
  try{
    const q=new URLSearchParams(location.search);
    if(q.has('kelas')){ localStorage.setItem('hf_kelas_go','1');
      q.delete('kelas'); const s=q.toString();
      history.replaceState(null,'',location.pathname+(s?'?'+s:'')+location.hash); }
  }catch(e){}
}
function handleKelasParam(){
  try{ if(localStorage.getItem('hf_kelas_go')){ localStorage.removeItem('hf_kelas_go'); openKelas(); } }catch(e){}
}

/* ── open ── */
function openKelas(){
  hidePanels(); $('kelas').style.display='block'; $('screen').scrollTop=0;
  if(!kelasLinked()){ Kelas.step='phone'; Kelas.err=''; Kelas.found=null; }
  Kelas.unlinkAsk=false;
  renderKelas();
  if(kelasLinked()) kelasLoad();
}
function openKelasLink(){
  if(typeof closeProduct==='function' && $('pwm') && $('pwm').classList.contains('on')) closeProduct();
  openKelas();
}

/* ── time, in Malaysia ── */
function kelasNowMY(){ return new Date(Date.now()+8*3600e3); }   // read with getUTC*
function kelasDow(d){ return ((d.getUTCDay()+6)%7)+1; }           // 1 = Mon … 7 = Sun
function kelasClock(hm){
  const p=String(hm||'').split(':'), h=+p[0]||0, m=p[1]||'00';
  return (h%12||12)+':'+m+' '+(h<12?'AM':'PM');
}
function kelasDate(d){
  if(!d) return '—';
  return new Date(d+'T00:00:00+08:00').toLocaleDateString('en-MY',{day:'numeric',month:'short',year:'numeric',timeZone:'Asia/Kuala_Lumpur'});
}
function kelasDaysLeft(end){
  if(!end) return null;
  const today=Date.parse(kelasNowMY().toISOString().slice(0,10)+'T00:00:00Z');
  return Math.round((Date.parse(end+'T00:00:00Z')-today)/864e5);
}
/* the next class from now: today's still to start, or the days after */
function kelasNext(){
  const cls=(Kelas.data&&Kelas.data.classes)||[]; if(!cls.length) return null;
  const now=kelasNowMY(), dow=kelasDow(now), mins=now.getUTCHours()*60+now.getUTCMinutes();
  for(let k=0;k<8;k++){
    const d=((dow-1+k)%7)+1;
    const todays=cls.filter(c=>c.dow===d).filter(c=>{
      const p=String(c.start).split(':'); return k>0 || (+p[0]*60+(+p[1]||0))>mins; });
    if(todays.length) return {c:todays[0], inDays:k};
  }
  return null;
}
function kelasWhen(n){ return n.inDays===0?'Today':n.inDays===1?'Tomorrow':KELAS_DOW[n.c.dow-1]; }

/* ── attendance ── */
function kelasIns(){ return ((Kelas.data&&Kelas.data.checkins)||[]).map(t=>new Date(Date.parse(t)+8*3600e3)); }
function kelasDayKey(d){ return d.toISOString().slice(0,10); }
function kelasThisMonth(){
  const n=kelasNowMY(), ym=n.toISOString().slice(0,7);
  return new Set(kelasIns().filter(d=>d.toISOString().slice(0,7)===ym).map(kelasDayKey)).size;
}
/* weeks in a row with at least one class, Monday to Sunday; this week
   counts once it has one, and does not break the run before it has */
function kelasWeekStreak(){
  const wk=d=>{ const x=new Date(d.getTime()); x.setUTCDate(x.getUTCDate()-(kelasDow(x)-1)); return kelasDayKey(x); };
  const have=new Set(kelasIns().map(wk));
  const cur=new Date(kelasNowMY().getTime());
  let n=0;
  if(!have.has(wk(cur))) cur.setUTCDate(cur.getUTCDate()-7);
  while(have.has(wk(cur))){ n++; cur.setUTCDate(cur.getUTCDate()-7); }
  return n;
}
function kelasLastIn(){
  const a=kelasIns(); if(!a.length) return null;
  const d=a[0], days=Math.round((Date.parse(kelasDayKey(kelasNowMY()))-Date.parse(kelasDayKey(d)))/864e5);
  const t=kelasClock(String(d.getUTCHours()).padStart(2,'0')+':'+String(d.getUTCMinutes()).padStart(2,'0'));
  return (days===0?'Today':days===1?'Yesterday':days+' days ago')+' · '+t;
}

/* ═══════════════ the Class screen ═══════════════ */
function renderKelas(){
  const el=$('kelas-body'); if(!el) return;
  if(typeof sb==='undefined' || !sb || !HF.userId){
    el.innerHTML='<div class="kl-link"><div class="kl-kick">HITFAT Class</div><h2 class="kl-h">Sign in first</h2>'+
      '<p class="kl-p">Sign in to HITFAT+, then connect your class membership with your phone number.</p></div>';
    return;
  }
  el.innerHTML=kelasLinked()?kelasHTML():kelasLinkHTML();
}

function kelasQR(px){ return typeof qrSVG==='function' ? qrSVG(String(Kelas.data.member_id), px) : ''; }

function kelasHTML(){
  const d=Kelas.data, m=kelasMain(), left=m?kelasDaysLeft(m.end_date):null;
  const act=kelasActive(), soon=act && left!==null && left<=7;
  const first=String(d.name||'').trim().split(/\s+/)[0]||'';
  let h='';

  /* the door: the QR, large, on the hero */
  h+='<div class="kl-hero'+(act?'':' off')+'">'+
     '<div class="kl-kick">HITFAT Class · HQ</div>'+
     '<div class="kl-name">'+hesc(first)+'</div>'+
     '<div class="kl-cat">'+kelasMems().filter(x=>x.active).map(x=>hesc(kelasCat(x.category))).join(' · ')+'</div>'+
     '<button class="kl-qr" onclick="kelasQRFull()" aria-label="Show my check-in QR full screen">'+kelasQR(184)+'</button>'+
     '<div class="kl-qrs">'+(act?'Show this at the kiosk to check in':'Membership ended: renew at the counter')+'</div></div>';

  /* the membership */
  if(m){
    const s0=m.start_date?Date.parse(m.start_date):null, s1=m.end_date?Date.parse(m.end_date):null;
    const pct=(s0&&s1&&s1>s0)?Math.max(0,Math.min(100,Math.round((Date.now()-s0)/(s1+864e5-s0)*100))):0;
    h+=fsec('Membership','');
    h+='<div class="kl-mem'+(soon?' soon':'')+(act?'':' off')+'">'+
       '<div class="kl-mrow"><div><div class="kl-mt">'+hesc(kelasCat(m.category))+'</div>'+
       '<div class="kl-ms">'+hesc(m.plan||'')+'</div></div>'+
       '<span class="kl-chip">'+(act?(soon?'Ends soon':'Active'):'Ended')+'</span></div>'+
       '<div class="kl-bar"><i style="width:'+(act?pct:100)+'%"></i></div>'+
       '<div class="kl-dates"><div><small>Started</small><b>'+kelasDate(m.start_date)+'</b></div>'+
       '<div class="kl-left">'+(act&&left!==null?'<b>'+(left+1)+'</b><small>day'+(left===0?'':'s')+' left</small>':'')+'</div>'+
       '<div class="r"><small>'+(act?'Ends':'Ended')+'</small><b>'+kelasDate(m.end_date)+'</b></div></div>'+
       (soon||!act?'<button class="kl-renew" onclick="kelasRenew()">'+glyph('repeat')+' Renew with HITFAT</button>':'')+
       '</div>';
    kelasMems().filter(x=>x!==m && x.active).forEach(x=>{
      h+='<div class="kl-mem2"><span>'+hesc(kelasCat(x.category))+'</span><span>until '+kelasDate(x.end_date)+'</span></div>';
    });
  }

  /* progress, after Keep Moving Club: the club level by classes, the week
     streak (classes run 3 to 6 days a week, so a day streak would break on
     every rest day), and this week day by day */
  h+=fsec('Your progress','Every class at HQ counts.');
  h+=kelasWeekHTML()+kelasLevelHTML()+kelasStreakHTML();
  h+=kelasLatestHTML();

  /* personal records, after Burn Boot Camp: log one, ring the bell, share it */
  h+=kelasPRHTML();

  /* the timetable */
  const cls=d.classes||[];
  if(cls.length){
    const n=kelasNext();
    if(Kelas.day===null) Kelas.day=n?n.c.dow:kelasDow(kelasNowMY());
    h+=fsec('Classes','Your timetable at HITFAT HQ.');
    if(n) h+='<div class="kl-next"><div class="kl-nt">Next class</div>'+
       '<div class="kl-nw">'+kelasWhen(n)+' · '+kelasClock(n.c.start)+'</div>'+
       '<div class="kl-nn">'+hesc(n.c.name)+' · '+(n.c.min||60)+' min'+(n.c.coach?' · '+hesc(n.c.coach):'')+'</div></div>';
    const today=kelasDow(kelasNowMY());
    h+='<div class="kl-days">'+KELAS_DOW.map((w,i)=>{
      const dd=i+1, has=cls.some(c=>c.dow===dd);
      return '<button class="'+(dd===Kelas.day?'on ':'')+(has?'':'rest ')+(dd===today?'now':'')+'" onclick="kelasPickDay('+dd+')">'+w+'</button>';
    }).join('')+'</div>';
    const day=cls.filter(c=>c.dow===Kelas.day);
    h+='<div class="kl-list">'+(day.length?day.map(c=>
      '<div class="kl-cls"><b>'+kelasClock(c.start)+'</b><div><div class="kl-cn">'+hesc(c.name)+'</div>'+
      '<div class="kl-cm">'+(c.min||60)+' min · '+hesc(kelasCat(c.category))+(c.coach?' · '+hesc(c.coach):'')+'</div></div></div>').join('')
      :'<div class="kl-none">No class on '+KELAS_DOW[Kelas.day-1]+'. Rest day.</div>')+'</div>';
  }

  /* history: 12 weeks of check-ins from the kiosk */
  const month=kelasThisMonth(), last=kelasLastIn();
  h+=fsec('History','From the kiosk at the door.');
  h+='<div class="kl-grid" aria-label="Check-ins, last 12 weeks">'+kelasGrid()+'</div>';
  h+='<div class="kl-last">'+month+' class'+(month===1?'':'es')+' this month'+(last?' · last check-in '+last.charAt(0).toLowerCase()+last.slice(1):'')+'</div>';

  h+='<div class="kl-foot">Your HITFAT+ All Access runs with this membership'+(act&&m?', until '+kelasDate(m.end_date):'')+'.<br>'+
     '<button class="kl-unlink" onclick="kelasUnlink()">'+(Kelas.unlinkAsk?'Tap again to disconnect':'Not you? Disconnect')+'</button></div>';
  return h;
}
/* 12 weeks of days, Monday at the top, this week on the right */
function kelasGrid(){
  const days=new Set(kelasIns().map(kelasDayKey)), now=kelasNowMY();
  const start=new Date(now.getTime()); start.setUTCDate(start.getUTCDate()-(kelasDow(now)-1)-77);
  let h='';
  for(let w=0;w<12;w++){
    h+='<div class="kl-wk">';
    for(let i=0;i<7;i++){
      const d=new Date(start.getTime()); d.setUTCDate(d.getUTCDate()+w*7+i);
      const k=kelasDayKey(d), fut=k>kelasDayKey(now);
      h+='<i class="'+(days.has(k)?'on':'')+(fut?' fut':'')+'"></i>';
    }
    h+='</div>';
  }
  return h;
}
/* ── club levels: 10, 25, 50 … classes ── */
var KELAS_LEVELS=[10,25,50,100,150,200,250,300,400,500,750,1000];
function kelasTotal(){ return (Kelas.data&&Kelas.data.total)||0; }
function kelasLevel(n){
  let cur=null, next=KELAS_LEVELS[0];
  KELAS_LEVELS.forEach(m=>{ if(n>=m) cur=m; });
  next=KELAS_LEVELS.filter(m=>m>n)[0]||null;
  return {cur:cur, next:next};
}
function kelasLevelHTML(){
  const n=kelasTotal(), L=kelasLevel(n), i=L.cur?KELAS_LEVELS.indexOf(L.cur):-1;
  /* five stops on the track: the one reached, and what comes after it */
  const from=Math.max(0,Math.min(i,KELAS_LEVELS.length-5)), stops=KELAS_LEVELS.slice(from,from+5);
  const fill=(()=>{ // how far along the track the member is, between the stops
    if(n>=stops[stops.length-1]) return 100;
    let k=0; while(k<stops.length && n>=stops[k]) k++;
    const lo=k?stops[k-1]:0, hi=stops[k], seg=100/(stops.length-1);
    const base=k?(k-1)*seg:0, part=k?(n-lo)/(hi-lo)*seg:0;
    return Math.max(0,Math.min(100,base+part));
  })();
  return '<div class="kl-lvl">'+
    '<div class="kl-lvl-top"><span class="kl-badge">'+(L.cur?L.cur:glyph('flag'))+'</span>'+
    '<div class="kl-lvl-n"><small>Level</small><b>'+(L.cur?L.cur+' Class Club':'Getting started')+'</b></div>'+
    '<div class="kl-lvl-c"><small>Classes</small><b>'+n+'</b></div></div>'+
    '<div class="kl-track"><span class="kl-line"><i style="width:'+fill.toFixed(1)+'%"></i></span>'+
    stops.map((m,k)=>'<span class="kl-stop'+(n>=m?' on':'')+(m===L.cur?' cur':'')+'" style="left:'+(k*25)+'%">'+m+'</span>').join('')+'</div>'+
    '<div class="kl-lvl-s">'+(L.next?(L.next-n)+' class'+(L.next-n===1?'':'es')+' to the '+L.next+' Class Club. Keep it up!':'Top of the club. Legend.')+'</div></div>';
}
/* the longest run of weeks with a class, from every week OS has */
function kelasLongest(){
  const w=((Kelas.data&&Kelas.data.weeks)||[]).map(x=>Date.parse(String(x).slice(0,10)+'T00:00:00Z')).sort((a,b)=>a-b);
  let best=0, run=0, prev=null;
  w.forEach(t=>{ run=(prev!==null && t-prev===7*864e5)?run+1:1; if(run>best) best=run; prev=t; });
  return Math.max(best, kelasWeekStreak());
}
function kelasStreakHTML(){
  const cur=kelasWeekStreak(), best=kelasLongest(), now=kelasNowMY(), today=kelasDow(now);
  const days=new Set(kelasIns().map(kelasDayKey)), cls=(Kelas.data&&Kelas.data.classes)||[];
  const mon=new Date(now.getTime()); mon.setUTCDate(mon.getUTCDate()-(today-1));
  const row=KELAS_DOW.map((w,i)=>{
    const d=new Date(mon.getTime()); d.setUTCDate(d.getUTCDate()+i);
    const done=days.has(kelasDayKey(d)), has=cls.some(c=>c.dow===i+1);
    const st=done?'done':(i+1===today?'now':(i+1>today?(has?'next':'rest'):'miss'));
    return '<div class="kl-wd '+st+'"><small>'+w+'</small><span>'+(done?glyph('check'):'')+'</span></div>';
  }).join('');
  return '<div class="kl-stk"><div class="kl-stk-row">'+
    '<div>'+glyph('flame')+'<div><b>'+cur+' week'+(cur===1?'':'s')+'</b><small>current streak</small></div></div>'+
    '<div>'+glyph('calendar')+'<div><b>'+best+' week'+(best===1?'':'s')+'</b><small>longest streak</small></div></div></div>'+
    '<div class="kl-wrow">'+row+'</div></div>';
}

/* ═══════════════ this week, the latest class, personal records ═══════════════
   After Burn Boot Camp's My Plan (17 Oct 2026). Calories, protein and water
   are not repeated here: the HITFAT Score on Home already has them. */
var KELAS_TARGET={Membership:4, Ladies:4, Mens:3, HYROX:3};   // classes a week, by hitfat.io/one
function kelasTarget(){
  const a=kelasMems().filter(m=>m.active).map(m=>KELAS_TARGET[m.category]||3);
  return a.length?Math.max.apply(null,a):3;
}
function kelasThisWeekN(){
  const now=kelasNowMY(), mon=new Date(now.getTime()); mon.setUTCDate(mon.getUTCDate()-(kelasDow(now)-1));
  const m=kelasDayKey(mon);
  return new Set(kelasIns().map(kelasDayKey).filter(k=>k>=m)).size;
}
function kelasWeekHTML(){
  const n=kelasThisWeekN(), t=kelasTarget(), tot=kelasTotal(), L=kelasLevel(tot);
  const lo=L.cur||0, hi=L.next||tot||1;
  return '<div class="kl-tiles">'+
    '<div class="kl-tile"><small>Classes this week</small><div><b>'+n+'</b><span> / '+t+'</span></div>'+
    '<span class="kl-tb"><i style="width:'+Math.min(100,Math.round(n/t*100))+'%"></i></span></div>'+
    '<div class="kl-tile"><small>Club count</small><div><b>'+tot+'</b><span> / '+(L.next||tot)+'</span></div>'+
    '<span class="kl-tb"><i style="width:'+(L.next?Math.round((tot-lo)/(hi-lo)*100):100)+'%"></i></span></div></div>';
}
/* the last check-in, matched to the class on the timetable it was for */
function kelasLatest(){
  const a=kelasIns(); if(!a.length) return null;
  const d=a[0], dow=kelasDow(d), mins=d.getUTCHours()*60+d.getUTCMinutes();
  let best=null, gap=1e9;
  ((Kelas.data&&Kelas.data.classes)||[]).filter(c=>c.dow===dow).forEach(c=>{
    const p=String(c.start).split(':'), st=(+p[0])*60+(+p[1]||0), g=mins-st;
    if(g>=-60 && g<=(c.min||60) && Math.abs(g)<gap){ gap=Math.abs(g); best=c; }
  });
  return {d:d, c:best};
}
function kelasLatestHTML(){
  const L=kelasLatest(); if(!L) return '';
  const dd=L.d, date=dd.toLocaleDateString('en-MY',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'});
  const t=kelasClock(String(dd.getUTCHours()).padStart(2,'0')+':'+String(dd.getUTCMinutes()).padStart(2,'0'));
  return fsec('Latest class','')+'<div class="kl-latest"><div class="kl-ld"><b>'+date+'</b><small>'+t+'</small></div>'+
    '<div class="kl-ln">'+hesc(L.c?L.c.name:'Class at HQ')+'<small>'+(L.c?(L.c.min||60)+' min · ':'')+'class #'+kelasTotal()+'</small></div>'+
    '<button class="kl-share" onclick="kelasShare(\'class\')">'+glyph('share')+' Share</button></div>';
}

/* ── personal records ── */
/* [name, unit, note, lower is better] */
var KELAS_MOVES=[['Push-ups','reps','1 min'],['Burpees','reps','1 min'],['Plank hold','time'],['Wall sit','time'],
  ['Kettlebell swings','reps','1 min'],['Wall balls','reps','1 min'],['Pull-ups','reps'],['Squat','kg'],['Deadlift','kg'],
  ['Bench press','kg'],['Row 500 m','time','',1],['SkiErg 1000 m','time','',1],['1 km run','time','',1]];
function kelasMove(n){ return KELAS_MOVES.filter(m=>m[0].toLowerCase()===String(n||'').toLowerCase())[0]||null; }
function kelasLower(n){ const m=kelasMove(n); return !!(m&&m[3]); }
function kelasFmt(v,u){
  if(u==='time'){ const s=Math.round(+v||0); return Math.floor(s/60)+':'+String(s%60).padStart(2,'0'); }
  return (Math.round((+v||0)*10)/10)+(u==='kg'?' kg':' reps');
}
function kelasOwnPRs(){ const k=HF.data&&HF.data.kelas; return (k&&Array.isArray(k.prs))?k.prs:[]; }
/* the best of each movement: the member's own, and the coach's from HITFAT LIVE */
function kelasBests(){
  const by={};
  kelasOwnPRs().forEach(e=>{
    const k=e.m.toLowerCase(), b=by[k], lower=kelasLower(e.m);
    if(!b || (lower?e.v<b.v:e.v>b.v)) by[k]={m:e.m,u:e.u,v:e.v,at:e.at,disp:kelasFmt(e.v,e.u)};
  });
  ((Kelas.data&&Kelas.data.prs)||[]).forEach(e=>{
    const k=String(e.m||'').toLowerCase(); if(!k) return;
    const at=Date.parse(e.at)||0;
    if(!by[k] || at>=by[k].at) by[k]={m:e.m,u:e.t||'',v:+e.v||0,at:at,disp:e.d||String(e.v),coach:true};
  });
  return Object.keys(by).map(k=>by[k]).sort((a,b)=>b.at-a.at);
}
function kelasPRHTML(){
  const all=kelasBests(), show=Kelas.prAll?all:all.slice(0,4);
  let h=fsec('Personal records','Log a best, ring the bell.');
  h+='<div class="kl-prs">'+(all.length?show.map(b=>
    '<div class="kl-pr"><div class="kl-prm">'+hesc(b.m)+(b.coach?'<span class="kl-coach">Coach</span>':'')+
    '<small>'+new Date(b.at).toLocaleDateString('en-MY',{day:'numeric',month:'short'})+'</small></div>'+
    '<b>'+hesc(b.disp)+'</b>'+
    '<button class="kl-prs-sh" aria-label="Share this record" onclick="kelasSharePR('+all.indexOf(b)+')">'+glyph('share')+'</button></div>').join('')
    :'<div class="kl-none">No records yet. Log your first one after class.</div>')+'</div>';
  h+='<div class="kl-prbar"><button class="kl-add" onclick="kelasPROpen()">'+glyph('plus')+' Add a PR</button>'+
     (all.length>4?'<button class="kl-alt2" onclick="Kelas.prAll=!Kelas.prAll;renderKelas()">'+(Kelas.prAll?'Show less':'View all '+all.length)+'</button>':'')+'</div>';
  return h;
}

/* the sheet: pick a movement, the number, ring the bell */
function kelasPROpen(){
  Kelas.pr={m:null, custom:'', u:'reps', rung:null};
  let o=$('klpr'); if(!o){ o=document.createElement('div'); o.id='klpr'; o.className='klpr'; document.body.appendChild(o); }
  kelasPRPaint(); o.classList.add('on');
}
function kelasPRClose(){ const o=$('klpr'); if(o) o.classList.remove('on'); }
function kelasPRPick(i){
  const p=Kelas.pr;
  if(i<0){ p.m='__other'; p.u='reps'; }
  else { p.m=KELAS_MOVES[i][0]; p.u=KELAS_MOVES[i][1]; }
  kelasPRPaint();
  setTimeout(()=>{ const f=$('klpr-v')||$('klpr-mm')||$('klpr-n'); if(f) f.focus(); },60);
}
function kelasPRUnit(u){ Kelas.pr.u=u; kelasPRPaint(); }
function kelasPRPaint(){
  const o=$('klpr'), p=Kelas.pr; if(!o||!p) return;
  let h='<div class="klpr-in"><div class="klpr-top"><div><div class="klpr-t">'+(p.rung?(p.rung.pr?'New PR!':'Logged'):'Add new PR')+'</div>'+
    '<div class="klpr-s">'+(p.m&&p.m!=='__other'?hesc(p.m):p.rung?hesc(p.rung.m):'Pick a movement')+'</div></div>'+
    '<button class="klpr-x" aria-label="Close" onclick="kelasPRClose()">✕</button></div>';
  if(p.rung){
    const r=p.rung;
    h+='<div class="klpr-bell'+(r.pr?' rang':'')+'">'+glyph('bell')+'</div>'+
       '<div class="klpr-val">'+hesc(kelasFmt(r.v,r.u))+'</div>'+
       '<div class="klpr-note">'+(r.pr?(r.prev?'Beat your best of '+hesc(kelasFmt(r.prev.v,r.prev.u))+'.':'Your first record for this one.'):
         'Your best is still '+hesc(kelasFmt(r.best.v,r.best.u))+'. Next time.')+'</div>'+
       (r.pr?'<button class="bigbtn kl-go" onclick="kelasPRShareRung()">'+glyph('share')+' Share it</button>':'')+
       '<button class="kl-alt" onclick="kelasPRClose()">Done</button>';
  } else {
    h+='<div class="klpr-moves">'+KELAS_MOVES.map((m,i)=>
      '<button class="'+(p.m===m[0]?'on':'')+'" onclick="kelasPRPick('+i+')">'+hesc(m[0])+(m[2]?'<small>'+m[2]+'</small>':'')+'</button>').join('')+
      '<button class="'+(p.m==='__other'?'on':'')+'" onclick="kelasPRPick(-1)">Other</button></div>';
    if(p.m){
      if(p.m==='__other'){
        h+='<input id="klpr-n" class="kl-in klpr-name" placeholder="Movement name" maxlength="40" value="'+hesc(p.custom)+'" oninput="Kelas.pr.custom=this.value">'+
           '<div class="obseg klpr-units">'+['reps','kg','time'].map(u=>'<button class="'+(p.u===u?'on':'')+'" onclick="kelasPRUnit(\''+u+'\')">'+u+'</button>').join('')+'</div>';
      }
      h+=p.u==='time'
        ? '<div class="klpr-row"><input id="klpr-mm" class="kl-in" type="number" inputmode="numeric" min="0" placeholder="0"><span>min</span>'+
          '<input id="klpr-ss" class="kl-in" type="number" inputmode="numeric" min="0" max="59" placeholder="00"><span>sec</span></div>'
        : '<div class="klpr-row"><input id="klpr-v" class="kl-in" type="number" inputmode="decimal" min="0" placeholder="0"><span>'+(p.u==='kg'?'kg':'reps')+'</span></div>';
      h+='<button class="bigbtn kl-go klpr-ring" onclick="kelasPRRing()">'+glyph('bell')+' Ring the bell</button>';
    }
  }
  o.innerHTML=h+'</div>';
}
function kelasPRRing(){
  const p=Kelas.pr; if(!p||!p.m) return;
  const name=p.m==='__other'?String(p.custom||'').trim():p.m;
  if(!name){ toast('Name the movement first.'); return; }
  let v;
  if(p.u==='time'){
    const mm=+(($('klpr-mm')||{}).value||0), ss=+(($('klpr-ss')||{}).value||0);
    v=Math.round(mm*60+ss);
  } else v=+(($('klpr-v')||{}).value||0);
  if(!(v>0) || v>100000){ toast('Enter your number first.'); return; }
  const lower=kelasLower(name), own=kelasOwnPRs().filter(e=>e.m.toLowerCase()===name.toLowerCase());
  let prev=null; own.forEach(e=>{ if(!prev || (lower?e.v<prev.v:e.v>prev.v)) prev=e; });
  const pr=!prev || (lower?v<prev.v:v>prev.v);
  if(!HF.data.kelas) HF.data.kelas={};
  if(!Array.isArray(HF.data.kelas.prs)) HF.data.kelas.prs=[];
  const e={m:name, u:p.u, v:v, at:Date.now()};
  HF.data.kelas.prs.push(e); HF.data.kelas.prs=HF.data.kelas.prs.slice(-300); HF.save();
  p.rung={m:name, u:p.u, v:v, pr:pr, prev:prev, best:pr?e:prev};
  kelasPRPaint();
  if(pr && navigator.vibrate) try{ navigator.vibrate([30,60,30]); }catch(x){}
  if($('kelas') && $('kelas').style.display==='block') renderKelas();
}
function kelasPRShareRung(){
  const r=Kelas.pr&&Kelas.pr.rung; if(!r) return;
  kelasPRClose();
  Kelas.share={kind:'pr', m:r.m, val:kelasFmt(r.v,r.u)}; openShare('kelas');
}
function kelasSharePR(i){
  const b=kelasBests()[i]; if(!b) return;
  Kelas.share={kind:'pr', m:b.m, val:b.disp}; openShare('kelas');
}
function kelasShare(kind){
  const L=kelasLatest(), lv=kelasLevel(kelasTotal());
  Kelas.share={kind:'class', n:kelasTotal(), name:L&&L.c?L.c.name:'Class at HQ',
    level:lv.cur?lv.cur+' Class Club':'', streak:kelasWeekStreak()};
  openShare('kelas');
}

/* the story card, 1080×1920: HITFAT red, a white card with the record or
   the class, the member's first name, a big faint PR behind */
function kelasDraw(){
  const cv=$('share-canvas'), x=cv.getContext('2d'), W=1080, H=1920, cx=W/2, S=Kelas.share||{kind:'class'};
  const F=(w,px)=>w+' '+px+"px 'Inter',system-ui,sans-serif";
  cv.width=W; cv.height=H;
  const g=x.createLinearGradient(0,0,0,H); g.addColorStop(0,'#FF3B3B'); g.addColorStop(.45,'#E30613'); g.addColorStop(1,'#6E020C');
  x.fillStyle=g; x.fillRect(0,0,W,H);
  const r=x.createRadialGradient(W*.85,H*.08,0,W*.85,H*.08,W*.9); r.addColorStop(0,'rgba(255,255,255,.28)'); r.addColorStop(1,'rgba(255,255,255,0)');
  x.fillStyle=r; x.fillRect(0,0,W,H);
  x.textAlign='center'; x.textBaseline='alphabetic';
  // big faint mark behind
  x.fillStyle='rgba(255,255,255,.10)'; x.font=F(900,S.kind==='pr'?560:420);
  x.fillText(S.kind==='pr'?'PR':'#'+(S.n||0),cx,H-260);
  // the mark
  x.fillStyle='#FFFFFF'; x.font=F(900,64); x.fillText('HITFAT+',cx,220);
  x.fillStyle='rgba(255,255,255,.85)'; x.font=F(800,30); _spaced(x,'HITFAT HQ · CLASS',cx,276,6);
  // the card
  const cw=820, chh=560, cxl=cx-cw/2, cy=520;
  x.save(); x.shadowColor='rgba(0,0,0,.28)'; x.shadowBlur=60; x.shadowOffsetY=24;
  x.fillStyle='#FFFFFF'; _rr(x,cxl,cy,cw,chh,56); x.fill(); x.restore();
  x.fillStyle='#E30613'; x.font=F(900,58);
  const title=S.kind==='pr'?('NEW PR: '+String(S.m||'').toUpperCase()):'CLASS DONE';
  const lines=_wrap(x,title,cx,cy+120,cw-120,66);
  const ly=cy+120+(lines-1)*66+50;
  x.fillStyle='rgba(227,6,19,.25)'; x.fillRect(cxl+90,ly,cw-180,4);
  x.fillStyle='#E30613'; x.font=F(900,S.kind==='pr'?170:200);
  x.fillText(S.kind==='pr'?String(S.val||''):'#'+(S.n||0),cx,ly+220);
  x.fillStyle='#55555C'; x.font=F(700,36);
  x.fillText(S.kind==='pr'?'HITFAT HQ · Kota Bharu':String(S.name||''),cx,cy+chh-60);
  // under the card
  const first=String((Kelas.data&&Kelas.data.name)||'').trim().split(/\s+/)[0]||'';
  x.fillStyle='#FFFFFF'; x.font=F(900,64); if(first) x.fillText(first.toUpperCase(),cx,cy+chh+130);
  x.fillStyle='rgba(255,255,255,.9)'; x.font=F(700,38);
  const sub=S.kind==='pr'?new Date().toLocaleDateString('en-MY',{day:'numeric',month:'long',year:'numeric'})
    :[S.level,S.streak?S.streak+'-week streak':''].filter(Boolean).join(' · ');
  if(sub) x.fillText(sub,cx,cy+chh+196);
  x.fillStyle='rgba(255,255,255,.8)'; x.font=F(700,34); x.fillText('app.hitfat.io',cx,H-110);
}

function kelasPickDay(d){ Kelas.day=d; renderKelas(); }
function kelasRenew(){
  const m=kelasMain();
  window.open('https://wa.me/60176132170?text='+encodeURIComponent(
    'Hi HITFAT, I would like to renew my '+kelasCat(m&&m.category)+' membership.'),'_blank');
}

/* the QR, full screen and white, for a kiosk camera in a dim lobby */
function kelasQRFull(){
  if(!kelasLinked()) return;
  let o=$('klqr');
  if(!o){ o=document.createElement('div'); o.id='klqr'; document.body.appendChild(o); }
  const d=Kelas.data, m=kelasMain();
  o.innerHTML='<button class="klqr-x" aria-label="Close" onclick="kelasQRClose()">✕</button>'+
    '<div class="klqr-k">HITFAT Class · check in</div>'+
    '<div class="klqr-q">'+kelasQR(280)+'</div>'+
    '<div class="klqr-n">'+hesc(d.name||'')+'</div>'+
    '<div class="klqr-s">'+(m?hesc(kelasCat(m.category))+' · until '+kelasDate(m.end_date):'')+'</div>';
  o.classList.add('on');
}
function kelasQRClose(){ const o=$('klqr'); if(o) o.classList.remove('on'); }

function kelasUnlink(){
  if(!Kelas.unlinkAsk){ Kelas.unlinkAsk=true; renderKelas(); return; }
  Kelas.unlinkAsk=false;
  kelasCall('unlink').then(()=>{
    Kelas.data=null; kelasSave(); Kelas.step='phone';
    return loadEntitlement();
  }).then(()=>{ renderKelas(); toast('Class membership disconnected.'); })
    .catch(()=>{ toast('Could not disconnect. Check your connection and try again.'); renderKelas(); });
}

/* ═══════════════ connecting, with the phone number ═══════════════ */
function kelasLinkHTML(){
  let h='<div class="kl-link"><div class="kl-kick">HITFAT Class · HQ</div>'+
    '<h2 class="kl-h">Connect your class membership</h2>'+
    '<p class="kl-p">For members of HITFAT Active Class, Ladies Only, Mens Only and HYROX at HITFAT HQ. '+
    'HITFAT+ All Access is included with your class.</p>';
  if(Kelas.step==='confirm' && Kelas.found){
    const f=Kelas.found;
    h+='<div class="kl-found"><div class="kl-fq">Is this you?</div>'+
       '<div class="kl-fn">'+hesc(f.name)+'</div>'+
       '<div class="kl-fc">'+hesc(kelasCat(f.category))+' · until '+kelasDate(f.end_date)+'</div></div>'+
       '<button class="bigbtn kl-go" onclick="kelasClaim()"'+(Kelas.busy?' disabled':'')+'>'+(Kelas.busy?'Connecting…':'Yes, this is me')+'</button>'+
       '<button class="kl-alt" onclick="kelasBack()">No, use another number</button>';
  } else {
    h+='<label class="kl-lab" for="kl-ph">Phone number at the counter</label>'+
       '<input id="kl-ph" class="kl-in" type="tel" inputmode="tel" autocomplete="tel" placeholder="012-345 6789" value="'+hesc(Kelas.phone)+'" '+
       'onkeydown="if(event.key===\'Enter\')kelasFind()">'+
       '<button class="bigbtn kl-go" onclick="kelasFind()"'+(Kelas.busy?' disabled':'')+'>'+(Kelas.busy?'Checking…':'Find my membership')+'</button>';
  }
  if(Kelas.err) h+='<div class="kl-err">'+Kelas.err+'</div>';
  h+='<div class="kl-fine">Not a class member yet? <a href="https://hitfat.io/one" target="_blank" rel="noopener">See the classes at HITFAT HQ</a></div></div>';
  return h;
}
function kelasBack(){ Kelas.step='phone'; Kelas.found=null; Kelas.err=''; renderKelas(); }
function kelasDigits(p){ return String(p||'').replace(/\D/g,''); }
const KELAS_ERR={
  not_found:'This number is not on our class list. Use the number you gave at the counter, or <a href="https://wa.me/60176132170" target="_blank" rel="noopener">WhatsApp HITFAT</a>.',
  expired:'Your class membership has ended. Renew at the counter and connect again.',
  taken:'This number is already connected to another HITFAT+ account. Ask at the counter and we will release it.',
  too_many:'Too many tries. Please wait an hour, or ask at the counter.',
  signin:'Sign in to HITFAT+ first.',
  failed:'Could not check right now. Check your connection and try again.'
};
async function kelasFind(){
  const inp=$('kl-ph'); if(inp) Kelas.phone=inp.value;
  const dg=kelasDigits(Kelas.phone);
  if(dg.length<9){ Kelas.err='Enter your full phone number.'; renderKelas(); return; }
  Kelas.busy=true; Kelas.err=''; renderKelas();
  try{
    const r=await kelasCall('lookup',{phone:Kelas.phone});
    if(!r.found) Kelas.err=KELAS_ERR.not_found;
    else if(r.taken) Kelas.err=KELAS_ERR.taken;
    else if(!r.active) Kelas.err=KELAS_ERR.expired;
    else { Kelas.found=r; Kelas.step='confirm'; }
  }catch(e){ Kelas.err=KELAS_ERR[e.message]||KELAS_ERR.failed; }
  Kelas.busy=false; renderKelas();
}
async function kelasClaim(){
  Kelas.busy=true; Kelas.err=''; renderKelas();
  try{
    const r=await kelasCall('claim',{phone:Kelas.phone});
    if(!r.ok){ Kelas.err=KELAS_ERR[r.error]||KELAS_ERR.failed; Kelas.step='phone'; }
    else {
      Kelas.data=Object.assign({}, r.status, {until:r.until}); kelasSave(); Kelas.state='ready';
      Kelas.step='phone'; Kelas.found=null; Kelas.phone='';
      await loadEntitlement();
      toast('Connected. HITFAT+ All Access is yours with your class.');
    }
  }catch(e){ Kelas.err=KELAS_ERR[e.message]||KELAS_ERR.failed; }
  Kelas.busy=false; renderKelas();
}

/* ═══════════════ elsewhere in the app ═══════════════ */
/* Home: the door, one tap from opening the app */
function kelasHomeCard(){
  if(!kelasLinked()) return '';
  const n=kelasNext(), act=kelasActive();
  return '<div class="kl-home" onclick="openKelas()">'+
    '<span class="kl-hqr">'+glyph('qr')+'</span>'+
    '<div class="kl-ht"><div class="kl-htk">HITFAT Class'+(act&&n?' · next':'')+'</div>'+
    '<div class="kl-htt">'+(act?(n?kelasWhen(n)+' · '+kelasClock(n.c.start):'Your classes'):'Membership ended')+'</div>'+
    '<div class="kl-hts">'+(act?(n?hesc(n.c.name)+' · '+(n.c.min||60)+' min':'Timetable and attendance'):'Renew at the counter')+'</div></div>'+
    (act?'<button class="kl-hbtn" onclick="event.stopPropagation();kelasQRFull()">Check in</button>':'')+'</div>';
}
/* Me: connected, the screen; not connected, the way in */
function kelasMeRow(){
  if(!KELAS_LIVE) return '';
  if(kelasLinked()){
    const m=kelasMain();
    return grow('qr','HITFAT Class', kelasActive()&&m?'Until '+kelasDate(m.end_date):'Ended','openKelas()');
  }
  return grow('building','HITFAT HQ class member?','Connect','openKelasLink()');
}
function kelasPaywallLine(){
  if(!KELAS_LIVE || kelasLinked()) return '';
  return '<button class="kl-pwlink" onclick="openKelasLink()">Class member at HITFAT HQ? <b>Connect with your phone number</b></button>';
}

/* A fixture for the preview and the tests: no network, no account. */
function kelasDemo(){
  const now=kelasNowMY(), iso=d=>d.toISOString().slice(0,10);
  const s=new Date(now.getTime()); s.setUTCDate(s.getUTCDate()-12);
  const e=new Date(now.getTime()); e.setUTCDate(e.getUTCDate()+18);
  const ins=[]; for(let i=1;i<60;i+=2+(i%3)){ const d=new Date(Date.now()-i*864e5); d.setUTCHours(10,4,0,0); ins.push(d.toISOString()); }
  const cls=[]; [6,7,1,2,3,4].forEach(dw=>[['Class 1','08:15'],['Class 2','10:30'],['Class 3','18:00'],['Class 4','20:15']]
    .forEach(c=>cls.push({name:c[0],dow:dw,start:c[1],min:45,coach:null,category:'Membership'})));
  Kelas.data={linked:true, member_id:'5b0f2c1e-8d3a-4c7e-9f21-3a6d0b9e4c11', name:'Aina Rahman',
    memberships:[{category:'Membership',plan:'1 Month',start_date:iso(s),end_date:iso(e),active:true}],
    classes:cls, checkins:ins, total:61,
    weeks:(function(){ const w=[], m=new Date(now.getTime()); m.setUTCDate(m.getUTCDate()-(kelasDow(now)-1));
      for(let i=0;i<9;i++){ const d=new Date(m.getTime()); d.setUTCDate(d.getUTCDate()-7*i); w.push(kelasDayKey(d)); }
      for(let i=14;i<26;i++){ const d=new Date(m.getTime()); d.setUTCDate(d.getUTCDate()-7*i); w.push(kelasDayKey(d)); }
      return w.sort(); })()};
  Kelas.state='ready';
}
