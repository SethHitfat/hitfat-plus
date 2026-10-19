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
var KELAS_CATS={Membership:'HITFAT Active Class', Ladies:'Ladies Only', Mens:'Mens Only', HYROX:'HYROX Class', PT:'Personal Coaching'};
var KELAS_DOW=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

var Kelas={state:'idle', data:null, step:'phone', phone:'', found:null, err:'', busy:false, day:null, unlinkAsk:false};

function kelasKey(){ return 'hf_kelas_'+(HF&&HF.userId||''); }
function kelasSave(){ try{ if(HF.userId) localStorage.setItem(kelasKey(), JSON.stringify(Kelas.data)); }catch(e){} }
function kelasRestore(){
  try{ const s=HF.userId&&localStorage.getItem(kelasKey()); Kelas.data=s?JSON.parse(s):null; }catch(e){ Kelas.data=null; }
}
function kelasLinked(){ return !!(KELAS_LIVE && Kelas.data && Kelas.data.linked); }
function kelasMems(){ return (Kelas.data&&Kelas.data.memberships)||[]; }
/* HYROX and Active, apart (17 Oct 2026, 095). Seth: "aku nk hyrox dan
   active asing", data too. Two spaces:
     active  Membership (Unlimited / HITFAT Active Class), Ladies, Mens
     hyrox   HYROX
   A member with both switches at the top of the Class screen; the kiosk
   asks them which class each time, so every check-in has its space. The
   streak, the Class Club, the boards, the week's target, the month, the
   timetable, the group are each space's own. HITFAT Points stay one
   wallet; InBody is one body. Bara on Home counts every class. */
function kelasMemSpace(m){ const c=m&&m.category; return c==='HYROX'?'hyrox':c==='Ladies'?'ladies':c==='Mens'?'mens':'active'; }
var KL_SPACES=[['active','Active'],['ladies','Ladies'],['mens','Mens'],['hyrox','HYROX'],['pt','PT']];
function kelasHasSpace(sp){ if(sp==='pt') return !!kelasPtLive(); return kelasMems().some(m=>m.active && kelasMemSpace(m)===sp); }
/* personal coaching (098): the PT package, as a membership of its own space */
function kelasPt(){ return (Kelas.data&&Kelas.data.pt&&typeof Kelas.data.pt==='object')?Kelas.data.pt:null; }
function kelasPtLive(){ const p=kelasPt(); return p&&p.active?p:null; }
function kelasPtMem(){ const p=kelasPt(); if(!p) return null;
  return {category:'PT', plan:(p.type==='Small Group'?'Small Group':'1-on-1')+' · '+(p.total||0)+' sessions', start_date:p.start, end_date:p.end, active:!!p.active}; }
function kelasSpaces(){ return KL_SPACES.map(x=>x[0]).filter(kelasHasSpace); }
function kelasSpace(){
  const sp=kelasSpaces();
  if(!sp.length){ if(!kelasMems().length && kelasPt()) return 'pt'; const m=kelasMainAll(); return kelasMemSpace(m); }   /* ended: the last one */
  if(sp.length===1) return sp[0];
  let v=Kelas.space; if(!v){ try{ v=localStorage.getItem('hf_kelas_sp'); }catch(e){} }
  return sp.indexOf(v)>=0?v:'active';
}
function kelasSetSpace(v){
  Kelas.space=v; try{ localStorage.setItem('hf_kelas_sp',v); }catch(e){}
  Kelas.cm=null; Kelas.cmCat=null; Kelas.day=null; Kelas.hxLog=null; Kelas.cmKind='classes';
  if(Kelas.tab==='group') kelasCmLoad();
  renderKelas(); if($('screen')) $('screen').scrollTop=0;
}
function kelasSpMems(){ const sp=kelasSpace(); if(sp==='pt'){ const m=kelasPtMem(); return m?[m]:[]; }
  const a=kelasMems().filter(m=>kelasMemSpace(m)===sp); return a.length?a:kelasMems(); }
/* the space's group in the Community */
function kelasSpaceCat(){
  const sp=kelasSpace(), a=kelasMems().filter(m=>m.active && kelasMemSpace(m)===sp);
  return sp==='hyrox'?'HYROX':sp==='ladies'?'Ladies':sp==='mens'?'Mens':((a[0]&&a[0].category)||'');
}
function kelasMainAll(){
  const m=kelasMems().slice().sort((a,b)=>(b.active-a.active)||String(b.end_date||'').localeCompare(String(a.end_date||'')));
  return m[0]||null;
}
/* the membership that runs longest in this space; the one the card follows */
function kelasMain(){
  const m=kelasSpMems().slice().sort((a,b)=>(b.active-a.active)||String(b.end_date||'').localeCompare(String(a.end_date||'')));
  return m[0]||null;
}
function kelasActive(){ const m=kelasMain(); return kelasLinked() && !!(m && m.active); }
function kelasCat(c){ return KELAS_CATS[c]||c||'Class'; }
/* what a visit is called in this space: a class, or (PT) a session */
function kelasUnit(n){ const pt=kelasSpace()==='pt'; return pt?(n===1?'session':'sessions'):(n===1?'class':'classes'); }

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
  Kelas.state='loading'; _kelasAt=Date.now();
  try{
    const was=kelasLinked();
    const st=await kelasCall('status');
    Kelas.data=st&&st.linked?st:null; kelasSave(); Kelas.state='ready';
    kelasSyncDays();
    kelasPhotoSync();
    /* the pass may have moved (renewed, ended, released at the counter):
       read it again so the app opens or closes with it */
    if(was || kelasLinked()) await loadEntitlement();
  }catch(e){ Kelas.state='error'; }
  kelasRepaint();
}
/* back to the app after a while (a check-in at the kiosk, the phone in a
   pocket): read the class again, at most every five minutes, so Bara on
   Home counts this morning's class without a restart */
var _kelasAt=0;
if(typeof document!=='undefined' && document.addEventListener) document.addEventListener('visibilitychange',function(){
  if(document.visibilityState!=='visible' || !kelasLinked() || Kelas.state==='loading') return;
  if(Date.now()-_kelasAt<5*60e3) return;
  kelasLoad();
});
/* the profile photo (Me), to HITFAT OS for the boards, posts and comments:
   sent when it differs from what was last sent from this phone */
async function kelasPhotoSync(){
  if(!kelasLinked() || typeof sb==='undefined' || !sb || !HF.userId || typeof hfPhoto!=='function') return;
  const ph=hfPhoto(), k='hf_kelas_ph_'+HF.userId;
  let was=null; try{ was=localStorage.getItem(k); }catch(e){}
  if(was===ph) return;
  try{ const r=await kelasCall('photo',{url:ph||null}); if(r&&r.ok){ try{ localStorage.setItem(k,ph); }catch(e){} } }catch(e){}
}
/* a member's face: their photo over their initial (the letter shows if the
   photo will not load); my own from this phone, so a change shows at once */
function kelasAv(ph,name,cls,mine){
  const src=mine&&typeof hfPhoto==='function'?(hfPhoto()||ph):ph;
  return '<span class="kl-av'+(cls?' '+cls:'')+'">'+hesc(String(name||'M').charAt(0).toUpperCase())+
    (src?'<img src="'+hesc(src)+'" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">':'')+'</span>';
}
function kelasRepaint(){
  if($('kelas') && $('kelas').style.display==='block') renderKelas();
  else if($('home') && $('home').style.display!=='none' && typeof renderHome==='function') renderHome();
}

/* ── the ?kelas link staff send ── */
function captureKelasParam(){
  try{
    const q=new URLSearchParams(location.search);
    if(q.has('kelas')){ localStorage.setItem('hf_kelas_go',q.get('kelas')||'1');
      q.delete('kelas'); const s=q.toString();
      history.replaceState(null,'',location.pathname+(s?'?'+s:'')+location.hash); }
  }catch(e){}
}
function handleKelasParam(){
  try{ const v=localStorage.getItem('hf_kelas_go'); if(v){ localStorage.removeItem('hf_kelas_go'); kelasGo(v); } }catch(e){}
}

/* a notification tapped (sw.js → push.js), or ?kelas=<tab>: the Class
   screen, on that tab (group, today, progress…) */
function kelasGo(tab){
  openKelas();
  if(kelasLinked() && KL_TABS.some(t=>t[0]===tab)){ if(tab==='group') Kelas.cm=null; kelasTab(tab); }
}
function kelasOpenUrl(u){
  const m=String(u||'').match(/[?&]kelas=([^&#]*)/); if(m) kelasGo(decodeURIComponent(m[1])||'today');
}

/* ── open ── */
function openKelas(){
  hidePanels(); $('kelas').style.display='block'; $('screen').scrollTop=0; Kelas.tab='today'; Kelas.ibIdx=0;
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
function kelasClasses(){ const sp=kelasSpace(); return ((Kelas.data&&Kelas.data.classes)||[]).filter(c=>kelasMemSpace(c)===sp); }
function kelasNext(){
  const cls=kelasClasses(); if(!cls.length) return null;
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
/* every class, both spaces (Bara's score on Home counts them all) */
function kelasInsAll(){ return ((Kelas.data&&Kelas.data.checkins)||[]).map(t=>new Date(Date.parse(t)+8*3600e3)); }
/* this space's classes: HYROX ones come marked (hx_ins), the rest are Active */
function kelasIns(){
  const d=Kelas.data||{}, sp=kelasSpace(), A=k=>Array.isArray(d[k])?d[k]:[], hx=A('hx_ins'), lx=A('lx_ins'), mx=A('mx_ins');
  const X=new Set(hx.concat(lx,mx).map(t=>Date.parse(t)));
  if(sp==='pt') return ((kelasPt()||{}).done||[]).map(t=>new Date(Date.parse(String(t).slice(0,10)+'T12:00:00Z')));
  const a=sp==='hyrox'?hx:sp==='ladies'?lx:sp==='mens'?mx:(d.checkins||[]).filter(t=>!X.has(Date.parse(t)));
  return a.map(t=>new Date(Date.parse(t)+8*3600e3));
}
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
  const when=days===0?'Today':days===1?'Yesterday':days+' days ago';
  return kelasSpace()==='pt'?when:when+' · '+t;
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
  if(kelasLinked() && (Kelas.tab||'today')==='today') kelasBaraLive();
}

function kelasQR(px){ return typeof qrSVG==='function' ? qrSVG(String(Kelas.data.member_id), px) : ''; }

/* Four tabs (17 Oct 2026), the screen had grown into one long scroll:
     Today     the QR and Bara, the next class and the timetable, membership
     Progress  this week and the streak, the club level, the latest class,
               personal records, 12 weeks of check-ins
     Body      InBody
     Points    HITFAT Points and the rewards
   Home's card and Check in open Today. */
var KL_TABS=[['today','Today'],['progress','Progress'],['body','Body'],['points','Points'],['group','Group']];
function kelasTab(t){ Kelas.tab=t; if(t==='group' && !Kelas.cm && !Kelas.cmBusy) kelasCmLoad(); renderKelas(); $('screen').scrollTop=0; }
function kelasHTML(){
  const tab=Kelas.tab||'today', hx=kelasIsHx();
  let h='';
  const sps=kelasSpaces();
  if(sps.length>1){ const sp=kelasSpace();
    h+='<div class="kl-space n'+sps.length+'">'+KL_SPACES.filter(x=>sps.indexOf(x[0])>=0).map(x=>
      '<button class="'+x[0]+(sp===x[0]?' on':'')+'" onclick="kelasSetSpace(\''+x[0]+'\')">'+x[1]+'</button>').join('')+'</div>'; }
  const tabs=kelasSpace()==='pt'?KL_TABS.filter(t=>t[0]!=='group'):KL_TABS;
  if(kelasSpace()==='pt' && tab==='group'){ Kelas.tab='today'; return kelasHTML(); }
  h+='<div class="obseg kl-tabs'+(tabs.length===4?' n4':'')+'">'+tabs.map(t=>'<button class="'+(t[0]===tab?'on':'')+'" onclick="kelasTab(\''+t[0]+'\')">'+(hx&&t[0]==='progress'?'Perform':t[1])+'</button>').join('')+'</div>';
  if(tab==='progress') h+=kelasProgressTab();
  else if(tab==='body') h+=kelasBodyTab();
  else if(tab==='points') h+=kelasPointsHTML()||'<div class="kl-none">Points load with your class. Pull to refresh.</div>';
  else if(tab==='group') h+=kelasGroupTab();
  else h+=kelasTodayTab();
  return '<div class="kl-sp kl-sp-'+kelasSpace()+'">'+h+'</div>';
}
/* Today: the door first */
function kelasTodayTab(){
  const d=Kelas.data, m=kelasMain(), left=m?kelasDaysLeft(m.end_date):null;
  const act=kelasActive(), soon=act && left!==null && left<=7;
  const first=String(d.name||'').trim().split(/\s+/)[0]||'';
  let h='';
  /* a shorter hero: the name and the class on the left, the QR on the
     right (tap for full screen at the kiosk), Bara underneath */
  const spc=kelasSpace(), hxs=spc==='hyrox', lxs=spc==='ladies', mxs=spc==='mens', pts=spc==='pt';
  h+='<div class="kl-hero kl-hero2'+(hxs?' hx':lxs?' lx':mxs?' mx':pts?' pt':'')+(act?'':' off')+'">'+
     '<div class="kl-hrow"><div class="kl-hl"><div class="kl-kick">'+(hxs?'HYROX · HQ':lxs?'Ladies2Fit · HQ':mxs?'Mens2Fit · HQ':pts?'Personal Coaching':'HITFAT Class · HQ')+'</div>'+
     '<div class="kl-hi">'+kelasGreet()+'</div><div class="kl-name">'+hesc(first)+'</div>'+
     '<div class="kl-cat">'+kelasSpMems().filter(x=>x.active).map(x=>hesc(kelasCat(x.category))).join(' · ')+'</div>'+
     '<button class="kl-ci" onclick="kelasQRFull()">'+glyph('qr')+(act?' Check in':' Renew first')+'</button></div>'+
     '<button class="kl-qr kl-qr2" onclick="kelasQRFull()" aria-label="Show my check-in QR full screen">'+kelasQR(116)+'<small>Tap to enlarge</small></button></div>'+
     kelasBaraHTML()+kelasLoyHTML()+'</div>';
  h+=kelasGiftHTML();

  /* the next class straight under the door: the one thing a regular wants
     to know after checking in (19 Oct 2026, the loyalty pass) */
  const cls=kelasClasses(), n=cls.length?kelasNext():null;
  if(n) h+='<div class="kl-next kl-next-top"><div class="kl-nt">Next class</div>'+
     '<div class="kl-nw">'+kelasWhen(n)+' · '+kelasClock(n.c.start)+'</div>'+
     '<div class="kl-nn">'+hesc(n.c.name)+' · '+(n.c.min||60)+' min'+(n.c.coach?' · '+hesc(n.c.coach):'')+'</div></div>';

  /* FIRST 30: a new member's first month, mission by mission; then a
     60-day journey for the goal */
  if(lxs) h+=kelasLxTodayHTML();
  if(mxs) h+=kelasMxTodayHTML();
  if(pts) h+=kelasPtTodayHTML();
  if(!hxs && !pts){ h+=kelasF30HTML(); h+=kelasJourneyHTML(); }
  if(kelasIsHx()) h+=kelasHxTodayHTML();
  h+=kelasWodHTML();

  /* the timetable, this space's classes only */
  if(cls.length){
    if(Kelas.day===null||Kelas.day===undefined) Kelas.day=n?n.c.dow:kelasDow(kelasNowMY());
    h+=fsec('Timetable','Every class at HITFAT HQ this week.');
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
       '<div class="kl-dates"><div><small>This term from</small><b>'+kelasDate(m.start_date)+'</b></div>'+
       '<div class="kl-left">'+(act&&left!==null?'<b>'+(left+1)+'</b><small>day'+(left===0?'':'s')+' left</small>':'')+'</div>'+
       '<div class="r"><small>'+(act?'Ends':'Ended')+'</small><b>'+kelasDate(m.end_date)+'</b></div></div>'+
       (soon||!act?'<button class="kl-renew" onclick="kelasRenew()">'+glyph('repeat')+' Renew with HITFAT</button>':'')+
       '</div>';
    kelasSpMems().filter(x=>x!==m && x.active && x.category!==m.category).forEach(x=>{
      h+='<div class="kl-mem2"><span>'+hesc(kelasCat(x.category))+'</span><span>until '+kelasDate(x.end_date)+'</span></div>';
    });
  }
  const aaEnd=kelasMems().filter(x=>x.active).map(x=>x.end_date).concat(kelasPtLive()?[kelasPt().end]:[]).filter(Boolean).sort().pop();
  h+='<div class="kl-foot">Your HITFAT+ All Access runs with your HITFAT membership'+(aaEnd?', until '+kelasDate(aaEnd):'')+'.<br>'+
     '<button class="kl-unlink" onclick="kelasUnlink()">'+(Kelas.unlinkAsk?'Tap again to disconnect':'Not you? Disconnect')+'</button></div>';
  return h;
}
/* ── the loyalty pass (19 Oct 2026). Class members are HITFAT's longest
   and most loyal clients: the screen greets them, shows what they have
   built (their club and their points) at a glance, and says so when a
   reward is waiting. Nothing here is invented: the count is the kiosk's,
   the points are OS's. ── */
function kelasGreet(){ const h=kelasNowMY().getUTCHours(); return h<12?'Good morning':h<18?'Good afternoon':'Good evening'; }
function kelasLoyHTML(){
  const n=kelasTotal(), pt=kelasSpace()==='pt', L=kelasLevel(n), P=kelasPts();
  const club=pt?(n?n+' '+kelasUnit(n):'First session'):(L.cur?L.cur+' Class Club':'Getting started');
  const csub=pt?'with your coach':(n+' '+kelasUnit(n)+' at HQ');
  let h='<div class="kl-loy"><button onclick="kelasTab(\'progress\')">'+glyph(pt?'workout':'trophy')+'<span><b>'+club+'</b><small>'+csub+'</small></span></button>';
  if(P){ const ready=(P.rewards||[]).filter(r=>r.points<=(P.balance||0)).length;
    h+='<button onclick="kelasTab(\'points\')">'+glyph('star')+'<span><b>'+kelasN(P.balance)+' points</b><small>'+(ready?ready+' reward'+(ready===1?'':'s')+' ready':'HITFAT Points')+'</small></span></button>'; }
  return h+'</div>';
}
function kelasGiftHTML(){
  const P=kelasPts(); if(!P || !kelasActive()) return '';
  const r=(P.rewards||[]).filter(x=>x.points<=(P.balance||0)).sort((a,b)=>b.points-a.points);
  if(!r.length) return '';
  return '<button class="kl-gift" onclick="kelasTab(\'points\')"><span class="kl-gift-i">'+glyph('star')+'</span>'+
    '<span class="kl-gift-t"><b>'+(r.length===1?'Your reward is ready: '+hesc(r[0].name):r.length+' rewards ready, up to '+hesc(r[0].name))+'</b>'+
    '<small>Thank you for training with us. Show your QR at the counter.</small></span><i>›</i></button>';
}
/* Progress: the week, the level, the latest class, records, history */
function kelasProgressTab(){
  let h='';
  if(kelasIsHx()) h+=kelasHxHTML();
  if(kelasSpace()==='ladies'||kelasSpace()==='mens') h+=kelasLxChallengeHTML(true);
  if(kelasSpace()==='mens'||kelasSpace()==='pt') h+=kelasMxStrengthHTML();
  h+=kelasMonthHTML();
  h+=kelasGlanceHTML();
  const pt=kelasSpace()==='pt';
  h+=kelasStreakHTML()+(pt?'':kelasLevelHTML());
  h+=kelasLatestHTML();
  h+=kelasPRHTML();
  const month=kelasThisMonth(), last=kelasLastIn();
  h+=fsec('History',pt?'Every session your coach logs.':'From the kiosk at the door.');
  h+='<div class="kl-grid" aria-label="'+(pt?'Sessions':'Check-ins')+', last 12 weeks">'+kelasGrid()+'</div>';
  h+='<div class="kl-last">'+month+' '+kelasUnit(month)+' this month'+(last?' · last '+(pt?'session ':'check-in ')+last.charAt(0).toLowerCase()+last.slice(1):'')+'</div>';
  return h;
}
/* two tiles that open the other tabs: points to spend, the last InBody */
function kelasGlanceHTML(){
  const P=kelasPts(), ib=kelasIBs()[0];
  return '<div class="kl-tiles">'+
    '<button class="kl-tile kl-tgo" onclick="kelasTab(\'points\')"><small>HITFAT Points</small><div><b>'+(P?kelasN(P.balance):'—')+'</b></div>'+
    '<span class="kl-tsub">'+(P?kelasNextReward(P):'Earn at every class')+'</span></button>'+
    '<button class="kl-tile kl-tgo" onclick="kelasTab(\'body\')"><small>InBody</small><div><b>'+(ib&&ib.score!=null?kelasF(ib.score,0):ib?kelasF(ib.pbf)+'<span>%</span>':'—')+'</b></div>'+
    '<span class="kl-tsub">'+(ib?(ib.score!=null?'score · ':'body fat · ')+kelasIBDate(ib.scan_date,true):'Scan your sheet')+'</span></button></div>';
}
function kelasNextReward(P){
  const r=(P.rewards||[]).filter(x=>x.points>(P.balance||0)).sort((a,b)=>a.points-b.points)[0];
  const ready=(P.rewards||[]).filter(x=>x.points<=(P.balance||0)).length;
  return ready?ready+' reward'+(ready===1?'':'s')+' ready':r?kelasN(r.points-(P.balance||0))+' to '+r.name.toLowerCase():'Spend at the counter';
}
/* Body: InBody, the full result inline */
function kelasBodyTab(){
  const all=kelasIBs(), lx=['ladies','mens','pt'].indexOf(kelasSpace())>=0?kelasLxBodyHTML():'';
  if(!all.length || Kelas.ibBusy) return lx+kelasIBCard();
  return lx+kelasIBDetail();
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
function kelasTotal(){
  const d=Kelas.data||{}, sp=kelasSpace(), k=sp==='hyrox'?'total_hx':sp==='ladies'?'total_lx':sp==='mens'?'total_mx':'total_act';
  if(sp==='pt') return +((kelasPt()||{}).total_done)||0;
  return (typeof d[k]==='number'?d[k]:(sp==='active'?d.total:0))||0;
}
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
    '<div class="kl-lvl-s">'+(L.next?(L.next-n)+' more to the '+L.next+' Class Club':'Top of the club. Legend.')+'</div></div>';
}
/* the longest run of weeks with a class, from every week OS has */
function kelasLongest(){
  const d=Kelas.data||{}, sp=kelasSpace(), wk=sp==='pt'?Array.from(new Set(kelasIns().map(x=>{ const y=new Date(x.getTime()); y.setUTCDate(y.getUTCDate()-(kelasDow(y)-1)); return kelasDayKey(y); })))
    :sp==='hyrox'?(d.weeks_hx||[]):sp==='ladies'?(d.weeks_lx||[]):sp==='mens'?(d.weeks_mx||[]):(d.weeks_act||d.weeks||[]);
  const w=wk.map(x=>Date.parse(String(x).slice(0,10)+'T00:00:00Z')).sort((a,b)=>a-b);
  let best=0, run=0, prev=null;
  w.forEach(t=>{ run=(prev!==null && t-prev===7*864e5)?run+1:1; if(run>best) best=run; prev=t; });
  return Math.max(best, kelasWeekStreak());
}
function kelasStreakHTML(){
  const cur=kelasWeekStreak(), best=kelasLongest(), now=kelasNowMY(), today=kelasDow(now);
  const days=new Set(kelasIns().map(kelasDayKey)), cls=kelasClasses();
  /* PT has no timetable: the booked sessions are the days ahead */
  const booked=kelasSpace()==='pt'?new Set(((kelasPt()||{}).next||[]).map(x=>kelasDayKey(new Date(Date.parse(x.at)+8*3600e3)))):null;
  const mon=new Date(now.getTime()); mon.setUTCDate(mon.getUTCDate()-(today-1));
  const row=KELAS_DOW.map((w,i)=>{
    const d=new Date(mon.getTime()); d.setUTCDate(d.getUTCDate()+i);
    const done=days.has(kelasDayKey(d)), has=booked?booked.has(kelasDayKey(d)):cls.some(c=>c.dow===i+1);
    const st=done?'done':(i+1===today?'now':(i+1>today?(has?'next':'rest'):'miss'));
    return '<div class="kl-wd '+st+'"><small>'+w+'</small><span>'+(done?glyph('check'):'')+'</span></div>';
  }).join('');
  const n=kelasThisWeekN(), t=kelasTarget();
  return '<div class="kl-stk"><div class="kl-wkh"><b>'+n+' of '+t+'</b> '+kelasUnit(t)+' this week'+(n>=t?' · target met 🔥':'')+
    '<span class="kl-tb"><i style="width:'+Math.min(100,Math.round(n/t*100))+'%"></i></span></div><div class="kl-stk-row">'+
    '<div>'+glyph('flame')+'<div><b>'+cur+' week'+(cur===1?'':'s')+'</b><small>current streak</small></div></div>'+
    '<div>'+glyph('calendar')+'<div><b>'+best+' week'+(best===1?'':'s')+'</b><small>longest streak</small></div></div></div>'+
    '<div class="kl-wrow">'+row+'</div></div>';
}

/* ═══════════════ this week, the latest class, personal records ═══════════════
   After Burn Boot Camp's My Plan (17 Oct 2026). Calories, protein and water
   are not repeated here: the HITFAT Score on Home already has them. */
var KELAS_TARGET={Membership:4, Ladies:4, Mens:3, HYROX:3};   // classes a week, by hitfat.io/one
function kelasTarget(){
  if(kelasSpace()==='pt'){ const p=kelasPt(); return Math.max(1,Math.round(((p&&p.total)||8)/4.3)); }
  const a=kelasSpMems().filter(m=>m.active).map(m=>KELAS_TARGET[m.category]||3);
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
  kelasClasses().filter(c=>c.dow===dow).forEach(c=>{
    const p=String(c.start).split(':'), st=(+p[0])*60+(+p[1]||0), g=mins-st;
    if(g>=-60 && g<=(c.min||60) && Math.abs(g)<gap){ gap=Math.abs(g); best=c; }
  });
  return {d:d, c:best};
}
function kelasLatestHTML(){
  const L=kelasLatest(); if(!L) return '';
  const dd=L.d, date=dd.toLocaleDateString('en-MY',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'});
  if(kelasSpace()==='pt'){ const p=kelasPt()||{}, k=kelasDayKey(dd), n=(p.notes||[]).filter(x=>String(x.d).slice(0,10)===k)[0], co=(n&&n.coach)||p.coach;
    return fsec('Latest session','')+'<div class="kl-latest"><div class="kl-ld"><b>'+date+'</b><small>'+hesc(p.type==='Small Group'?'Small Group':'1-on-1')+'</small></div>'+
      '<div class="kl-ln">'+hesc(n&&n.focus?n.focus:'Personal coaching')+'<small>'+(co?'Coach '+hesc(String(co).split(' ')[0])+' · ':'')+'session #'+kelasTotal()+'</small></div></div>'; }
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
    :'<div class="kl-pr0">'+glyph('bell')+'<div><b>Beat a number in '+(kelasSpace()==='pt'?'a session':'class')+'?</b><span>Log it, ring the bell, share it.</span></div></div>')+'</div>';
  h+='<div class="kl-prbar"><button class="kl-add'+(all.length?'':' kl-add1')+'" onclick="kelasPROpen()">'+glyph('plus')+(all.length?' Add a PR':' Add your first PR')+'</button>'+
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
       '<div class="klpr-note">'+(r.pr?(r.prev?'Beat your best of '+hesc(kelasFmt(r.prev.v,r.prev.u))+'.':'Your first record for this one.')+(kelasLinked()?' Rung in your class group too.':''):
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
  if(typeof hfSound==='function') hfSound(pr?'bell':'pop');
  /* a new best rings in the class group too */
  if(pr && kelasLinked()){ kelasCall('cm_post',{move:name, value:kelasFmt(v,p.u)}).then(()=>{ Kelas.cm=null; }).catch(()=>{}); }
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
  if(S.kind==='ib') return kelasDrawIB(x,W,H,cx,F,S);
  if(S.kind==='month') return kelasDrawMonth(x,W,H,cx,F,S);
  if(S.kind==='lx') return kelasDrawLx(x,W,H,cx,F,S);
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
  const title=S.kind==='pr'?('NEW PR: '+String(S.m||'').toUpperCase()):S.kind==='f30'?'FIRST 30 COMPLETE':'CLASS DONE';
  const lines=_wrap(x,title,cx,cy+120,cw-120,66);
  const ly=cy+120+(lines-1)*66+50;
  x.fillStyle='rgba(227,6,19,.25)'; x.fillRect(cxl+90,ly,cw-180,4);
  x.fillStyle='#E30613'; x.font=F(900,S.kind==='pr'?170:200);
  x.fillText(S.kind==='pr'?String(S.val||''):S.kind==='f30'?'30':'#'+(S.n||0),cx,ly+220);
  x.fillStyle='#55555C'; x.font=F(700,36);
  x.fillText(S.kind==='pr'?'HITFAT HQ · Kota Bharu':S.kind==='f30'?'days · '+(S.n||0)+' classes at HQ':String(S.name||''),cx,cy+chh-60);
  // under the card
  const first=String((Kelas.data&&Kelas.data.name)||'').trim().split(/\s+/)[0]||'';
  x.fillStyle='#FFFFFF'; x.font=F(900,64); if(first) x.fillText(first.toUpperCase(),cx,cy+chh+130);
  x.fillStyle='rgba(255,255,255,.9)'; x.font=F(700,38);
  const sub=S.kind==='pr'?new Date().toLocaleDateString('en-MY',{day:'numeric',month:'long',year:'numeric'})
    :[S.level,S.streak?S.streak+'-week streak':''].filter(Boolean).join(' · ');
  if(sub) x.fillText(sub,cx,cy+chh+196);
  x.fillStyle='rgba(255,255,255,.8)'; x.font=F(700,34); x.fillText('app.hitfat.io',cx,H-110);
}

/* ═══════════════ HITFAT Points ═══════════════
   Counted by HITFAT OS from the kiosk (083_hitfat_points.sql): +100 a class
   day, a weekly bonus for 3+ classes that grows with each week in a row,
   missions. Spent at the counter, where staff redeem them in OS. The app
   only shows; nothing here can add a point. */
function kelasPts(){ return (Kelas.data&&Kelas.data.points)||null; }
function kelasN(n){ return (+n||0).toLocaleString('en-MY'); }
function kelasPointsHTML(){
  const P=kelasPts(); if(!P) return '';
  const life=P.lifetime||0, seg=[['Classes',P['class']||0,'c'],['Weekly bonus',P.bonus||0,'b'],['Missions',P.missions||0,'m']];
  let h=fsec('HITFAT Points','Earned at HQ, spent at the counter.');
  h+='<div class="kl-pts"><div class="kl-pts-top"><div><b>'+kelasN(P.balance)+'</b><small>Current balance</small></div>'+
     '<span class="kl-pts-mark">'+glyph('star')+'</span></div>'+
     '<div class="kl-pts-life"><b>'+kelasN(life)+'</b> lifetime earned</div>'+
     '<div class="kl-pts-bar">'+(life?seg.filter(x=>x[1]>0).map(x=>'<i class="'+x[2]+'" style="width:'+(x[1]/life*100).toFixed(1)+'%"></i>').join(''):'')+'</div>'+
     '<div class="kl-pts-leg">'+seg.map(x=>'<span><i class="'+x[2]+'"></i><b>'+(life?Math.round(x[1]/life*100):0)+'%</b> '+x[0]+'</span>').join('')+'</div>'+
     kelasPtsChart(P.weeks||[])+'</div>';

  h+=kelasReferHTML(P);
  /* how to earn */
  const linked=(P.history||[]).some(x=>x.t==='link');
  h+='<div class="kl-earn">'+
     '<div class="kl-er"><span class="kl-eic">'+glyph('calendar')+'</span><div><b>Class at HQ</b><small>Once a day, from the kiosk</small></div><em>+100</em></div>'+
     '<div class="kl-er"><span class="kl-eic">'+glyph('chart')+'</span><div><b>Weekly bonus</b><small>3+ classes in a week: +25, then +50, +75… up to +200 a week in a row</small></div><em>+25↑</em></div>'+
     '<div class="kl-er"><span class="kl-eic">'+glyph('repeat')+'</span><div><b>Second class, same day</b><small>3 hours or more after the first</small></div><em>+50</em></div>'+
     (kelasPt()?'<div class="kl-er"><span class="kl-eic">'+glyph('workout')+'</span><div><b>PT session</b><small>Each session with your coach, once it is logged</small></div><em>+150</em></div>':'')+
     '<div class="kl-er"><span class="kl-eic">'+glyph('people')+'</span><div><b>Bring a friend</b><small>When they join, tell the counter you brought them</small></div><em>+500</em></div>'+
     '<div class="kl-er"><span class="kl-eic">'+glyph('trophy')+'</span><div><b>Connect HITFAT+</b><small>'+(linked?'Done':'Once')+'</small></div><em>'+(linked?glyph('check'):'+300')+'</em></div></div>';

  /* rewards */
  h+='<div class="kl-rwh">Rewards</div><div class="kl-rws">'+(P.rewards||[]).map(r=>{
    const ok=(P.balance||0)>=r.points, pct=Math.min(100,Math.round((P.balance||0)/r.points*100));
    return '<div class="kl-rw'+(ok?' ok':'')+'"><div class="kl-rwm"><b>'+hesc(r.name)+'</b><small>'+hesc(r.note||'')+'</small>'+
      (ok?'<span class="kl-rwok">Ready. Show your QR at the counter</span>'
         :'<span class="kl-tb"><i style="width:'+pct+'%"></i></span><small>'+kelasN(r.points-(P.balance||0))+' to go</small>')+
      '</div><em>'+kelasN(r.points)+'</em></div>';
  }).join('')+'</div>';
  const hist=(P.history||[]).slice(0,5);
  if(hist.length) h+='<div class="kl-rwh">Recent</div><div class="kl-hist">'+hist.map(x=>
    '<div><span>'+hesc(x.name)+'<small>'+new Date(x.at).toLocaleDateString('en-MY',{day:'numeric',month:'short'})+'</small></span>'+
    '<b class="'+(x.p<0?'neg':'')+'">'+(x.p>0?'+':'')+kelasN(x.p)+'</b></div>').join('')+'</div>';
  h+='<div class="kl-fine2">Points count from 17 Oct 2026. Staff redeem them at the counter; this screen updates after.</div>';
  return h;
}
/* the last 12 weeks of points as bars, this week on the right */
function kelasPtsChart(weeks){
  const now=kelasNowMY(), mon=new Date(now.getTime()); mon.setUTCDate(mon.getUTCDate()-(kelasDow(now)-1));
  const by={}; weeks.forEach(x=>{ by[String(x.w).slice(0,10)]=+x.p||0; });
  const col=[]; for(let i=11;i>=0;i--){ const d=new Date(mon.getTime()); d.setUTCDate(d.getUTCDate()-7*i); col.push(by[kelasDayKey(d)]||0); }
  const mx=Math.max(400,...col);
  return '<div class="kl-ch"><div class="kl-chh">Points, last 12 weeks</div><div class="kl-chb">'+
    col.map((v,i)=>'<span title="'+v+'"><i style="height:'+Math.max(v?6:2,Math.round(v/mx*100))+'%"'+(i===11?' class="now"':'')+'></i></span>').join('')+
    '</div></div>';
}

/* ═══════════════ InBody ═══════════════
   The member photographs the sheet the InBody machine prints; plus-class
   reads it with Claude and saves the full reading in HITFAT OS (085), where
   the coach sees it too. Shown here more plainly than the InBody app does:
   what each number means, in or out of the normal range, what changed since
   the last scan, the body by segment, every scan over time, and a story
   card that shares the progress (muscle and fat), never the weight. */
function kelasIBs(){ return ((Kelas.data&&Kelas.data.inbody)||[]).slice().sort((a,b)=>String(b.scan_date).localeCompare(String(a.scan_date))); }
function kelasIBDate(d,short){
  return new Date(String(d).slice(0,10)+'T00:00:00+08:00').toLocaleDateString('en-MY',
    short?{day:'numeric',month:'short',timeZone:'Asia/Kuala_Lumpur'}:{day:'numeric',month:'short',year:'numeric',timeZone:'Asia/Kuala_Lumpur'});
}
function kelasF(v,dp){ return (v===undefined||v===null||v==='')?'—':(+v).toFixed(dp===undefined?1:dp).replace(/\.0+$/,''); }
/* the normal range: printed on the sheet, or the usual one where the sheet has none */
function kelasRange(s,k){
  const r=s.ranges&&s.ranges[k]; if(r) return r;
  if(k==='bmi') return [18.5,25];
  if(k==='pbf') return s.sex==='female'?[18,28]:[10,20];
  return null;
}
function kelasZone(s,k){
  const v=s[k], r=kelasRange(s,k); if(v===undefined||v===null||!r) return null;
  return v<r[0]?'under':v>r[1]?'over':'normal';
}
/* good or not depends on what it is: more muscle is good, more fat is not */
function kelasTone(k,z){
  if(!z) return '';
  if(k==='smm') return z==='under'?'warn':'good';
  if(k==='bfm'||k==='pbf') return z==='over'?'bad':'good';
  return z==='normal'?'good':'warn';
}
var KL_ZLABEL={under:'Under',normal:'Normal',over:'Over'};
function kelasDelta(k,cur,prev){
  if(!prev || prev[k]===undefined || prev[k]===null || cur[k]===undefined || cur[k]===null) return '';
  const d=Math.round((cur[k]-prev[k])*10)/10; if(!d) return '<span class="ib-d">no change</span>';
  const better = (k==='smm'||k==='score'||k==='bmr') ? d>0 : (k==='bfm'||k==='pbf'||k==='vfl') ? d<0 : null;
  return '<span class="ib-d '+(better===null?'':better?'up':'down')+'">'+(d>0?'▲ +':'▼ ')+kelasF(Math.abs(d))+'</span>';
}
/* one plain sentence about the result, and one about the change */
function kelasIBSay(s,prev){
  const m=kelasZone(s,'smm'), f=kelasZone(s,'pbf')||kelasZone(s,'bfm');
  let a;
  if(f==='over' && m==='under') a='Body fat is above the healthy range and muscle is below it. The plan: build muscle and lose fat together, with strength classes 3 times a week and enough protein.';
  else if(f==='over') a='Muscle is where it should be; body fat is above the healthy range.'+(s.fat_control?' Aim to lose about '+kelasF(Math.abs(s.fat_control))+' kg of fat and keep the muscle.':' Lose fat, keep the muscle.');
  else if(m==='under') a='Body fat is healthy; muscle is below the normal range.'+(s.muscle_control?' Aim to build about '+kelasF(Math.abs(s.muscle_control))+' kg of muscle.':' Strength work and protein will build it.');
  else if(m==='over') a='Strong build: muscle above normal and body fat in the healthy range. Keep it there.';
  else if(m||f) a='Muscle and body fat are both in the normal range. Keep it there.';
  else a='Your latest body composition reading.';
  if(prev){
    const dm=(s.smm!=null&&prev.smm!=null)?Math.round((s.smm-prev.smm)*10)/10:null, df=(s.bfm!=null&&prev.bfm!=null)?Math.round((s.bfm-prev.bfm)*10)/10:null;
    const bits=[]; if(dm) bits.push('muscle '+(dm>0?'+':'−')+kelasF(Math.abs(dm))+' kg'); if(df) bits.push('fat '+(df>0?'+':'−')+kelasF(Math.abs(df))+' kg');
    if(bits.length) a+=' Since '+kelasIBDate(prev.scan_date,true)+': '+bits.join(', ')+'.';
  }
  return a;
}
function kelasRing(score,px){
  const r=42, c=2*Math.PI*r, p=Math.max(0,Math.min(100,+score||0))/100;
  return '<svg class="ib-ring" viewBox="0 0 100 100" width="'+px+'" height="'+px+'" aria-hidden="true">'+
    '<circle cx="50" cy="50" r="'+r+'" class="ib-rbg"/><circle cx="50" cy="50" r="'+r+'" class="ib-rfg" stroke-dasharray="'+(c*p).toFixed(1)+' '+c.toFixed(1)+'" transform="rotate(-90 50 50)"/></svg>';
}

/* the card on the Class screen */
function kelasIBCard(){
  const all=kelasIBs(), s=all[0], prev=all[1];
  let h=fsec('Body composition','InBody, from a photo of your result sheet.');
  h+='<input type="file" id="kl-ibf" accept="image/*" style="display:none" onchange="kelasIBPick(this)">';
  if(Kelas.ibBusy) return h+'<div class="ib-card ib-busy"><span class="ib-spin"></span><b>Reading your sheet…</b><small>This takes about 20 seconds. Keep the app open.</small></div>';
  if(!s){
    return h+'<div class="ib-card ib-empty"><div class="ib-ei">'+glyph('scale')+'</div><b>Snap your InBody sheet</b>'+
      '<small>Take a straight, bright photo of the whole printed result. Every number is read for you, explained, and kept with your coach.</small>'+
      '<button class="bigbtn kl-go" onclick="kelasIBShoot()">'+glyph('photo')+' Scan my InBody sheet</button>'+
      '<span class="ib-bonus">+200 points for your first scan</span></div>';
  }
  const tile=(k,label,unit)=>{ const z=kelasZone(s,k);
    return '<div class="ib-t"><small>'+label+'</small><b>'+kelasF(s[k])+'<i>'+unit+'</i></b>'+
      (z?'<span class="ib-z '+kelasTone(k,z)+'">'+KL_ZLABEL[z]+'</span>':'')+kelasDelta(k,s,prev)+'</div>'; };
  h+='<div class="ib-card" onclick="kelasIBOpen(0)"><div class="ib-top"><div><b>InBody result</b><small>'+kelasIBDate(s.scan_date)+(s.src==='staff'?' · recorded at HQ':'')+'</small></div>'+
     (s.score!=null?'<div class="ib-sc">'+kelasRing(s.score,64)+'<span><b>'+kelasF(s.score,0)+'</b><small>score</small></span></div>':'')+'</div>'+
     '<div class="ib-tiles">'+tile('weight','Weight','kg')+tile('smm','Muscle','kg')+tile('pbf','Body fat','%')+'</div>'+
     '<div class="ib-say">'+hesc(kelasIBSay(s,prev))+'</div>'+
     '<div class="ib-acts"><button class="kl-add" onclick="event.stopPropagation();kelasIBOpen(0)">Full result</button>'+
     '<button class="kl-alt2" onclick="event.stopPropagation();kelasIBShoot()">'+glyph('photo')+' New scan</button></div></div>';
  return h;
}

/* the full result */
function kelasIBOpen(i){ Kelas.tab='body'; Kelas.ibIdx=i||0; Kelas.ibSeg=Kelas.ibSeg||'lean'; renderKelas(); $('screen').scrollTop=0; }
function kelasIBBack(){ Kelas.tab='progress'; renderKelas(); $('screen').scrollTop=0; }
function kelasBack(){ switchTab('home'); }
function kelasIBBar(s,k,label,unit){
  const v=s[k]; if(v===undefined||v===null) return '';
  const r=kelasRange(s,k), z=kelasZone(s,k);
  let track='';
  if(r){
    const w=r[1]-r[0], lo=r[0]-w*.9, hi=r[1]+w*1.3, pos=x=>Math.max(2,Math.min(98,(x-lo)/(hi-lo)*100));
    track='<div class="ib-track"><span class="ib-norm" style="left:'+pos(r[0]).toFixed(1)+'%;right:'+(100-pos(r[1])).toFixed(1)+'%"></span>'+
      '<i class="ib-mark '+kelasTone(k,z)+'" style="left:'+pos(v).toFixed(1)+'%"></i></div>'+
      '<div class="ib-scale"><span>Under</span><span>Normal '+kelasF(r[0])+'–'+kelasF(r[1])+'</span><span>Over</span></div>';
  }
  return '<div class="ib-bar"><div class="ib-bh"><span>'+label+'</span><b>'+kelasF(v)+' <i>'+unit+'</i></b>'+
    (z?'<em class="ib-z '+kelasTone(k,z)+'">'+KL_ZLABEL[z]+'</em>':'')+'</div>'+track+'</div>';
}
function kelasIBBody(s){
  if(!s.seg_lean && !s.seg_fat) return '';
  const fat=Kelas.ibSeg==='fat' && !!s.seg_fat || !s.seg_lean, seg=fat?s.seg_fat:s.seg_lean;
  /* muscle: below normal orange, normal green, above normal dark green;
     fat: more than normal red, otherwise green */
  const tone=p=>p==null?'':fat?(p>110?'bad':'good'):(p<90?'warn':p>110?'top':'good');
  const g=k=>(seg&&seg[k])||{};
  const R=(k,x,y,w,h,rx)=>'<rect class="ib-seg '+tone(g(k).pct)+'" x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+(rx||4)+'"/>';
  /* the figure faces you: its right arm is on your left */
  const svg='<svg viewBox="0 0 100 210" aria-hidden="true"><defs><clipPath id="ibclip"><path d="'+TD_OUTLINE+'"/></clipPath></defs>'+
    '<ellipse class="ib-head" cx="50" cy="14.5" rx="9.2" ry="11.2"/><path class="ib-out" d="'+TD_OUTLINE+'"/>'+
    '<g clip-path="url(#ibclip)">'+R('right_arm',8,30,24.5,80)+R('left_arm',67.5,30,24.5,80)+R('trunk',33,26,34,77,6)+
    R('right_leg',28,104,21.5,100)+R('left_leg',50.5,104,21.5,100)+'</g></svg>';
  const lab=(k,name)=>{ const v=g(k);
    return '<div class="ib-sl '+tone(v.pct)+'"><small>'+name+'</small><b>'+(v.kg!=null?kelasF(v.kg)+' kg':'—')+'</b><span>'+(v.pct!=null?kelasF(v.pct)+'%':'')+'</span></div>'; };
  return '<div class="ib-sec"><div class="ib-sech"><b>Body by segment</b>'+(s.seg_lean&&s.seg_fat?'<div class="obseg ib-tog">'+
    '<button class="'+(fat?'':'on')+'" onclick="Kelas.ibSeg=\'lean\';renderKelas()">Muscle</button>'+
    '<button class="'+(fat?'on':'')+'" onclick="Kelas.ibSeg=\'fat\';renderKelas()">Fat</button></div>':'')+'</div>'+
    '<div class="ib-fig"><div class="ib-col">'+lab('right_arm','Right arm')+lab('trunk','Trunk')+lab('right_leg','Right leg')+'</div>'+svg+
    '<div class="ib-col">'+lab('left_arm','Left arm')+'<div class="ib-sl ib-key">'+(fat?'<i class="bad"></i>More than normal<i class="good"></i>Normal or less'
      :'<i class="top"></i>Above normal<i class="good"></i>Normal<i class="warn"></i>Below normal')+'</div>'+lab('left_leg','Left leg')+'</div></div>'+
    '<div class="ib-note">'+(fat?'% is against the normal amount of fat for each part. Over 110% is more than normal.'
      :'% is against the normal amount of muscle for each part. 90–110% is normal, and left and right close together means a balanced body.')+'</div></div>';
}
var KL_IB_MORE=[['bmr','Basal metabolic rate','kcal',0,'Calories your body burns at rest in a day. More muscle raises it.'],
  ['vfl','Visceral fat level','',0,'Fat around the organs. Under 10 is the healthy zone.'],
  ['tbw','Body water','L',1,'Water in your body, mostly held in muscle.'],
  ['protein','Protein','kg',1,'The building blocks of muscle.'],
  ['mineral','Minerals','kg',2,'Mostly bone. Keeps your frame strong.'],
  ['ffm','Fat-free mass','kg',1,'Everything that is not fat: muscle, bone, water.'],
  ['smi','Skeletal muscle index','kg/m²',1,'Arm and leg muscle for your height.'],
  ['whr','Waist-hip ratio','',2,'Where fat sits. Lower is healthier.'],
  ['ecw_ratio','ECW ratio','',3,'Water balance. Around 0.36–0.39 is normal.']];
function kelasIBDetail(){
  const all=kelasIBs(), i=Math.min(Kelas.ibIdx||0,all.length-1), s=all[i]; if(!s) return kelasIBCard();
  const prev=all[i+1];
  let h='<div class="ib-hero"><div class="kl-kick">InBody result</div><div class="ib-hd">'+kelasIBDate(s.scan_date)+(s.model?' · '+hesc(s.model):'')+'</div>'+
     (s.score!=null?'<div class="ib-big">'+kelasRing(s.score,150)+'<span><b>'+kelasF(s.score,0)+'</b><small>InBody score</small></span></div>':'')+
     '<div class="ib-say">'+hesc(kelasIBSay(s,prev))+'</div>'+
     '<button class="ib-sharebtn" onclick="kelasIBShare('+i+')">'+glyph('share')+' Share my progress</button></div>';
  h+='<div class="ib-sec"><div class="ib-sech"><b>Muscle and fat</b></div>'+kelasIBBar(s,'weight','Weight','kg')+kelasIBBar(s,'smm','Skeletal muscle','kg')+kelasIBBar(s,'bfm','Body fat','kg')+'</div>';
  if(s.bmi!=null||s.pbf!=null) h+='<div class="ib-sec"><div class="ib-sech"><b>Obesity check</b></div>'+kelasIBBar(s,'bmi','BMI','')+kelasIBBar(s,'pbf','Body fat','%')+'</div>';
  if(s.target_weight!=null||s.fat_control!=null||s.muscle_control!=null){
    const c=(v)=>v==null?'—':(v>0?'+':v<0?'−':'')+kelasF(Math.abs(v))+' kg';
    h+='<div class="ib-sec"><div class="ib-sech"><b>Your targets</b></div><div class="ib-goal">'+
      '<div><small>Target weight</small><b>'+(s.target_weight!=null?kelasF(s.target_weight)+' kg':'—')+'</b></div>'+
      '<div><small>Fat</small><b class="'+((s.fat_control||0)<0?'good':'')+'">'+c(s.fat_control)+'</b></div>'+
      '<div><small>Muscle</small><b class="'+((s.muscle_control||0)>0?'good':'')+'">'+c(s.muscle_control)+'</b></div></div></div>';
  }
  h+=kelasIBBody(s);
  const more=KL_IB_MORE.filter(m=>s[m[0]]!=null);
  if(more.length) h+='<div class="ib-sec"><div class="ib-sech"><b>More from your sheet</b></div><div class="ib-more">'+more.map(m=>
    '<div><small>'+m[1]+'</small><b>'+kelasF(s[m[0]],m[3])+(m[2]?' <i>'+m[2]+'</i>':'')+'</b>'+kelasDelta(m[0],s,prev)+'<p>'+m[4]+'</p></div>').join('')+'</div></div>';
  h+=kelasIBHistory(all);
  h+='<div class="ib-sec"><div class="ib-sech"><b>Every scan</b></div><div class="ib-list">'+all.map((x,j)=>
    '<button class="'+(j===i?'on':'')+'" onclick="kelasIBOpen('+j+')"><span>'+kelasIBDate(x.scan_date)+'<small>'+(x.src==='staff'?'Recorded at HQ':'From your sheet')+'</small></span>'+
    '<b>'+kelasF(x.weight)+' kg · '+kelasF(x.pbf)+'%</b></button>').join('')+'</div></div>';
  h+='<button class="bigbtn kl-go" onclick="kelasIBShoot()">'+glyph('photo')+' Scan a new sheet</button>';
  h+='<input type="file" id="kl-ibf" accept="image/*" style="display:none" onchange="kelasIBPick(this)">';
  h+='<div class="kl-fine2">A body composition estimate from the InBody machine, not a medical diagnosis. Your coach sees the same numbers.</div>';
  return h;
}
/* every scan as a line, after the InBody app's History, oldest on the left */
function kelasIBHistory(all){
  const rows=all.slice(0,10).reverse();
  const chart=(k,label,unit,dp)=>{
    const pts=rows.filter(x=>x[k]!=null); if(!pts.length) return '';
    const vs=pts.map(x=>+x[k]), mn=Math.min(...vs), mx=Math.max(...vs), pad=(mx-mn)||1;
    const W=300, H=96, X=j=>pts.length<2?W/2:18+j*(W-36)/(pts.length-1), Y=v=>pts.length<2?H/2+6:H-14-(v-mn)/pad*(H-44);
    const line=pts.map((x,j)=>(j?'L':'M')+X(j).toFixed(1)+' '+Y(+x[k]).toFixed(1)).join('');
    return '<div class="ib-hc"><div class="ib-hch"><span>'+label+'</span><b>'+kelasF(vs[vs.length-1],dp)+(unit?' '+unit:'')+'</b></div>'+
      '<svg viewBox="0 0 '+W+' '+H+'"><path class="ib-hl" d="'+line+'"/>'+
      pts.map((x,j)=>'<circle class="'+(j===pts.length-1?'last':'')+'" cx="'+X(j).toFixed(1)+'" cy="'+Y(+x[k]).toFixed(1)+'" r="3.6"/>'+
        '<text class="'+(j===pts.length-1?'last':'')+'" x="'+X(j).toFixed(1)+'" y="'+(Y(+x[k])-9).toFixed(1)+'">'+kelasF(x[k],dp)+'</text>').join('')+'</svg>'+
      '<div class="ib-hx">'+pts.map(x=>'<span>'+kelasIBDate(x.scan_date,true)+'</span>').join('')+'</div></div>';
  };
  return '<div class="ib-sec"><div class="ib-sech"><b>Over time</b></div>'+
    (all.length<2?'<div class="ib-note ib-first">This is your first scan, so each line starts here. Scan again in about 4 weeks and the change shows.</div>':'')+
    chart('score','InBody score','',0)+chart('smm','Skeletal muscle','kg',1)+chart('bfm','Body fat','kg',1)+chart('pbf','Body fat','%',1)+chart('weight','Weight','kg',1)+'</div>';
}

/* taking the photo: the camera or the library, shrunk on the phone to a
   size that reads well and uploads fast */
function kelasIBShoot(){ const f=$('kl-ibf'); if(f){ f.value=''; f.click(); } }
function kelasIBPick(inp){
  const file=inp&&inp.files&&inp.files[0]; if(!file) return;
  const rd=new FileReader();
  rd.onload=()=>{
    const img=new Image();
    img.onload=()=>{
      const mx=2000, sc=Math.min(1,mx/Math.max(img.width,img.height));
      const c=document.createElement('canvas'); c.width=Math.round(img.width*sc); c.height=Math.round(img.height*sc);
      c.getContext('2d').drawImage(img,0,0,c.width,c.height);
      kelasIBSend(c.toDataURL('image/jpeg',.86));
    };
    img.onerror=()=>toast('Could not open that photo. Try another one.');
    img.src=rd.result;
  };
  rd.readAsDataURL(file);
}
var KL_IB_ERR={too_many:'That is 4 scans today. Try again tomorrow.',
  not_inbody:'That does not look like an InBody result sheet. Take a straight, bright photo of the whole sheet.',
  unread:'Could not read that sheet. Try a straighter, brighter photo.', too_large:'That photo is too large. Try again.',
  not_linked:'Connect your class membership first.', signin:'Sign in first.'};
async function kelasIBSend(dataUrl){
  Kelas.ibBusy=true; renderKelas();
  try{
    const firstEver=!kelasIBs().some(x=>x.src==='sheet');
    const r=await kelasCall('inbody',{image_base64:dataUrl, media_type:'image/jpeg'});
    const list=((Kelas.data.inbody)||[]).filter(x=>String(x.scan_date)!==String(r.scan.scan_date));
    list.push(r.scan); Kelas.data.inbody=list; kelasSave();
    Kelas.ibBusy=false;
    toast(firstEver?'Sheet read. +200 points for your first InBody scan.':'Sheet read and saved.');
    kelasIBOpen(kelasIBs().findIndex(x=>x.scan_date===r.scan.scan_date));
    kelasLoad();
  }catch(e){
    Kelas.ibBusy=false; renderKelas();
    toast(KL_IB_ERR[e.message]||'Could not read the sheet. Check your connection and try again.');
  }
}
function kelasIBShare(i){
  const all=kelasIBs(), s=all[i], prev=all[i+1]; if(!s) return;
  Kelas.share={kind:'ib', s:s, prev:prev||null}; openShare('kelas');
}

/* the InBody story card, an explainer more than a brag (17 Oct): the score
   and what it means; then muscle, body fat, visceral fat and metabolism, each
   with one line on what it is, the normal range as a bar, the verdict in a
   word and the change since the last scan. Weight is left off; it is theirs
   to share. */
function kelasDrawIB(x,W,H,cx,F,S){
  const s=S.s, p=S.prev, L=110, R=W-110;
  x.textAlign='center';
  x.fillStyle='#FFFFFF'; x.font=F(900,60); x.fillText('HITFAT+',cx,170);
  x.fillStyle='rgba(255,255,255,.88)'; x.font=F(800,28); _spaced(x,'MY BODY COMPOSITION · '+kelasIBDate(s.scan_date).toUpperCase(),cx,222,4);
  /* the score, and what it is */
  let y=290;
  if(s.score!=null){
    const r=104, c0=L+r+10, c1=y+r+6;
    x.lineCap='round'; x.lineWidth=26; x.strokeStyle='rgba(255,255,255,.22)'; x.beginPath(); x.arc(c0,c1,r,0,Math.PI*2); x.stroke();
    x.strokeStyle='#FFFFFF'; x.beginPath(); x.arc(c0,c1,r,-Math.PI/2,-Math.PI/2+Math.min(1,s.score/100)*Math.PI*2); x.stroke();
    x.fillStyle='#FFFFFF'; x.font=F(900,96); x.fillText(String(Math.round(s.score)),c0,c1+30);
    x.textAlign='left';
    x.fillStyle='#FFFFFF'; x.font=F(900,44); x.fillText('InBody Score',c0+r+50,c1-46);
    x.fillStyle='rgba(255,255,255,.9)'; x.font=F(600,30);
    _wrapL(x,'Muscle against fat for your body, out of 100. 80 and up is fit and strong.',c0+r+50,c1+2,R-(c0+r+50),40);
    x.textAlign='center';
    y=c1+r+50;
  }
  /* four rows on a white card */
  const rows=[['smm','Skeletal muscle','kg','The muscle you train. More is stronger and burns more.'],
    ['pbf','Body fat','%','How much of your body is fat.'],
    ['vfl','Visceral fat','level','Fat around your organs. Under 10 is healthy.'],
    ['bmr','Metabolism (BMR)','kcal','Calories your body burns at rest, every day.']].filter(r=>s[r[0]]!=null);
  const rh=270, ch=rows.length*rh+40;
  x.save(); x.shadowColor='rgba(0,0,0,.25)'; x.shadowBlur=50; x.shadowOffsetY=20;
  x.fillStyle='#FFFFFF'; _rr(x,L-20,y,R-L+40,ch,52); x.fill(); x.restore();
  const zoneOf=(k)=>k==='vfl'?(s.vfl<10?'normal':'over'):kelasZone(s,k);
  const rangeOf=(k)=>k==='vfl'?[1,9]:kelasRange(s,k);
  const ZC={good:'#1F9D4C',warn:'#C26A00',bad:'#E30613'};
  rows.forEach((r,ix)=>{
    const k=r[0], ty=y+40+ix*rh, z=zoneOf(k), tone=k==='vfl'?(z==='normal'?'good':'bad'):kelasTone(k,z);
    if(ix) { x.fillStyle='#EEEEF0'; x.fillRect(L+30,ty-22,R-L-60,3); }
    x.textAlign='left';
    x.fillStyle='#111111'; x.font=F(900,40); x.fillText(r[1],L+30,ty+40);
    x.fillStyle='#6A6A70'; x.font=F(600,26); _wrapL(x,r[3],L+30,ty+80,R-L-60-230,32);
    /* the value, right */
    x.textAlign='right';
    const val=kelasF(s[k],k==='bmr'||k==='vfl'?0:1);
    x.fillStyle='#111111'; x.font=F(900,64); x.fillText(val,R-30,ty+48);
    x.fillStyle='#6A6A70'; x.font=F(800,26); x.fillText(r[2],R-30,ty+82);
    /* the range bar with the normal zone, the marker, the verdict */
    const rg=rangeOf(k), bx=L+30, bw=R-L-60-190, by=ty+150;
    if(rg){
      const w=rg[1]-rg[0], lo=rg[0]-w*.9, hi=rg[1]+w*1.3, pos=v=>bx+Math.max(.02,Math.min(.98,(v-lo)/(hi-lo)))*bw;
      x.fillStyle='#EDEDF0'; _rr(x,bx,by,bw,18,9); x.fill();
      x.fillStyle='rgba(52,193,95,.45)'; _rr(x,pos(rg[0]),by,pos(rg[1])-pos(rg[0]),18,9); x.fill();
      x.fillStyle=ZC[tone]||'#55555C'; x.beginPath(); x.arc(pos(s[k]),by+9,17,0,Math.PI*2); x.fill();
      x.strokeStyle='#FFFFFF'; x.lineWidth=6; x.stroke();
      x.textAlign='center'; x.fillStyle='#8A8A90'; x.font=F(700,22);
      x.fillText('Normal '+kelasF(rg[0],k==='vfl'?0:1)+'–'+kelasF(rg[1],k==='vfl'?0:1),(pos(rg[0])+pos(rg[1]))/2,by+52);
    }
    if(z){
      const lab=k==='vfl'?(z==='normal'?'Healthy':'High'):KL_ZLABEL[z], tw=150, tx=R-30-tw;
      x.fillStyle=(ZC[tone]||'#55555C')+'22'; _rr(x,tx,by-14,tw,46,23); x.fill();
      x.textAlign='center'; x.fillStyle=ZC[tone]||'#55555C'; x.font=F(900,26); x.fillText(lab,tx+tw/2,by+18);
    }
    /* the change since the last scan, under the bar */
    if(p && p[k]!=null){
      const d=Math.round((s[k]-p[k])*10)/10;
      if(d){
        const good=(k==='smm'||k==='bmr')?d>0:d<0;
        x.textAlign='right'; x.fillStyle=good?'#1F9D4C':'#E30613'; x.font=F(900,28);
        x.fillText((d>0?'▲ +':'▼ −')+kelasF(Math.abs(d),k==='bmr'||k==='vfl'?0:1)+' since '+kelasIBDate(p.scan_date,true),R-30,by+52);
      }
    }
  });
  y+=ch+60;
  /* the takeaway, in one plain sentence */
  x.textAlign='center'; x.fillStyle='#FFFFFF'; x.font=F(800,34);
  _wrap(x,kelasIBSay(s,null).split('. ')[0]+'.',cx,y,W-220,46);
  x.fillStyle='rgba(255,255,255,.8)'; x.font=F(700,30); x.fillText('Measured on InBody at HITFAT HQ · app.hitfat.io',cx,H-90);
}
/* left-aligned wrap for the card's explainer */
function _wrapL(x,t,lx,y,maxW,lh){
  const words=String(t).split(' '); let line='', n=0;
  words.forEach(w=>{ const tst=line?line+' '+w:w; if(x.measureText(tst).width>maxW&&line){ x.fillText(line,lx,y+n*lh); n++; line=w; } else line=tst; });
  if(line) x.fillText(line,lx,y+n*lh);
}

/* ═══════════════ Bara ═══════════════
   A class at HQ is a workout. Its days (from the kiosk, in Malaysia) are kept
   in HF.data.kelas.days, which the HITFAT Score reads (scWorkouts in
   score.js) and which syncs with the rest of the member's data, so Bara's
   evening reminder from plus-push counts it too. */
function kelasClassDays(){
  const out=new Set(); kelasInsAll().forEach(d=>out.add(kelasDayKey(d)));
  return Array.from(out).sort();
}
function kelasSyncDays(){
  if(!HF.data) return;
  const k=HF.data.kelas||(HF.data.kelas={});
  const days=Kelas.data && Kelas.data.linked ? kelasClassDays() : [];
  const was=JSON.stringify(k.days||[]), now=JSON.stringify(days);
  if(was!==now){ k.days=days; HF.save(); }
}
/* what Bara says on the Class screen: one line, the most useful one */
function kelasBaraLine(){
  const m=kelasMain(), act=kelasActive(), left=m?kelasDaysLeft(m.end_date):null;
  const today=kelasDayKey(kelasNowMY()), days=new Set(kelasIns().map(kelasDayKey));
  const n=kelasThisWeekN(), t=kelasTarget(), nx=kelasNext();
  if(kelasSpace()==='pt'){ const p=kelasPt(), nx=p&&(p.next||[])[0];
    if(!act) return ['kusut','Pakej PT awak dah tamat. Bara rindu nak tengok awak berlatih dengan coach. Sambung dengan coach ya!'];
    const left=p?(+p.total||0)-(+p.used||0):0;
    /* a session today or tomorrow first; then (phase 2) a reply, today's homework, the end-of-week check-in */
    const today=kelasDayKey(kelasNowMY()), C=(p&&p.checkins)||[], cw=String(p&&p.week||'').slice(0,10);
    if(nx && /^(today|tomorrow)/.test(kelasPtWhen(nx.at))) return ['aktif','Sesi seterusnya '+kelasPtWhen(nx.at).replace(/^tomorrow/,'esok').replace(/^today/,'hari ini')+(nx.coach?' dengan Coach '+String(nx.coach).split(' ')[0]:'')+'. Bara tunggu awak! 💪'];
    if(C.some(c=>c.reply&&!c.seen)) return ['giggle','Coach dah balas check-in awak! Baca kat bawah 💬'];
    const hw=kelasPtHw().filter(x=>(x.daily?(today>=x.from&&today<=x.due):true) && !kelasPtHwDone(x,today))[0];
    if(hw) return ['aktif','Homework dari coach: '+hw.t+'. Siapkan, dapat +20 mata! 💪'];
    if(!C.some(c=>String(c.w).slice(0,10)===cw) && kelasDow(kelasNowMY())>=5) return ['calendar','Check-in mingguan dengan coach belum lagi. Dua minit je, +50 mata!'];
    if(nx) return ['aktif','Sesi seterusnya '+kelasPtWhen(nx.at).replace(/^tomorrow/,'esok').replace(/^today/,'hari ini')+(nx.coach?' dengan Coach '+String(nx.coach).split(' ')[0]:'')+'. Bara tunggu awak! 💪'];
    if(left<=2) return ['calendar','Tinggal '+left+' sesi dalam pakej awak. Cakap dengan coach untuk sambung ya!'];
    return ['aktif','Setiap sesi PT = +150 mata. Coach awak tulis nota lepas setiap sesi, baca di bawah.']; }
  if(act && kelasSpace()==='ladies'){ const cy=kelasCyc(); if(cy && cy.phase==='period') return ['aktif','Hari ni ikut badan awak. Datang kelas kalau rasa okay, rehat pun okay. Bara tetap bangga dengan awak 🤍']; }
  if(!act) return ['kusut','Membership awak dah tamat. Bara rindu nak tengok awak kat kelas. Renew di kaunter ya!'];
  if(left!==null && left<=7) return ['calendar','Membership awak tamat dalam '+(left+1)+' hari. Renew awal supaya streak awak tak putus!'];
  const f30=kelasSpace()==='hyrox'?null:kelasF30(); if(f30 && !f30.complete) return kelasF30Line(f30);
  const jr=kelasSpace()==='hyrox'?null:kelasJr(); if(jr) return kelasJrLine(jr);
  if(f30) return kelasF30Line(f30);
  if(days.has(today)) return ['cheer','Bara nampak awak dah datang kelas hari ni! Dikira sebagai workout dalam Skor HITFAT, +100 mata 💪'];
  if(n>=t) return ['gold','Sasaran '+t+' kelas minggu ni dah capai! Bara bangga sangat 🔥'];
  if(nx && nx.inDays===0) return ['aktif','Ada kelas hari ni! Bara tunggu awak kat HQ 💪 '+n+' daripada '+t+' kelas minggu ni.'];
  return ['aktif','Datang kelas = workout hari tu siap, +100 mata. '+n+' daripada '+t+' kelas minggu ni.'];
}
/* The same Bara as Home (17 Oct): his colour follows today's HITFAT Score,
   cream under 50, red from 50, messy after days with nothing logged. Only a
   class membership that has ended shows him messy here regardless. */
function kelasBaraSrc(pose){
  try{
    if(pose!=='kusut' && typeof bellPoster==='function' && typeof scScore==='function' && typeof scLevel==='function'){
      const st=typeof scState==='function'?scState():{k:''};
      return bellPoster(st.k?'kusut':scLevel(scScore(iso(0))));
    }
  }catch(e){}
  return (typeof SC_POSE!=='undefined'&&SC_POSE[pose])||'/img/mascot/anim/'+pose+'.png';
}
function kelasBaraHTML(){
  const L=kelasBaraLine(), src=kelasBaraSrc(L[0]);
  Kelas.baraPose=L[0];
  /* the same live Bara as Home (bell.js moves its one player here), in a
     white glow so he stands out on the red; tap him and he giggles */
  return '<div class="kl-bara"><div class="kl-bslot" id="kl-bell" onclick="kelasBaraPoke()" role="button" aria-label="Bara">'+
    '<img class="sc-poster" src="'+src+'" alt="Bara" onerror="this.style.visibility=\'hidden\'"></div>'+
    '<div class="kl-bub"><b>Bara</b><span>'+hesc(L[1])+'</span></div></div>';
}
/* Bara alive on the Class screen: the loop for today's score (or the messy
   one for an ended membership), and once on a day with a class, a cheer */
function kelasBaraLive(){
  const slot=$('kl-bell'); if(!slot || typeof bellAttach!=='function') return;
  let lv;
  try{ const st=typeof scState==='function'?scState():{k:''};
       lv=(Kelas.baraPose==='kusut'||st.k)?'kusut':scLevel(scScore(iso(0))); }catch(e){ lv=2; }
  if(!bellAttach(slot,lv)) return;
  const today=kelasDayKey(kelasNowMY()), k=HF.data&&(HF.data.kelas||(HF.data.kelas={}));
  if(k && kelasIns().some(d=>kelasDayKey(d)===today) && k.cheer!==today){
    k.cheer=today; try{ HF.save(); }catch(e){}
    setTimeout(()=>{ if(typeof scReact==='function') scReact('cheer'); if(typeof hfSound==='function') hfSound('cheer'); },600);
  }
}
var KL_POKE=['Hehe, gelilah! 😆','Jumpa kat kelas nanti ya! 💪','Bara tunggu awak kat HQ 😄','Hehe, lagi? 🙈'];
function kelasBaraPoke(){
  if(typeof scReact==='function') scReact('giggle');
  if(typeof hfSound==='function') hfSound('giggle');
  const b=document.querySelector('#kelas-body .kl-bub span');
  if(b) b.textContent=KL_POKE[(Kelas.pokes=(Kelas.pokes||0)+1)%KL_POKE.length];
}

/* ═══════════════ Group: the community and the leaderboard ═══════════════
   After Everfit and Bod groups (17 Oct 2026), for class members first.
   A group is the class (Active Class, Ladies Only, Mens Only, HYROX):
   members are in theirs without joining, and Ladies Only stays among women.
   The feed fills itself from the kiosk (first class, Class Club, 3 classes in
   a week) and from Ring the bell; members react with fire, clap or muscle.
   The board counts classes this week or this month, from the kiosk only.
   No comments and no messages yet. Admin (Seth) posts an announcement,
   pins and hides. All of it lives in HITFAT OS (086_community.sql). */
var KL_CM_ICON={first:'people',club:'trophy',week:'flame',pr:'bell',announce:'flag'};
var KL_CM_EMO=[['fire','🔥'],['clap','👏'],['muscle','💪']];
async function kelasCmLoad(cat){
  Kelas.cmBusy=true; Kelas.cmErr=false;
  try{ Kelas.cm=await kelasCall('cm_feed',{cat:cat||Kelas.cmCat||kelasSpaceCat()||''}); Kelas.cmCat=Kelas.cm.cat; }
  catch(e){ Kelas.cmErr=true; }
  Kelas.cmBusy=false;
  if($('kelas') && $('kelas').style.display==='block' && Kelas.tab==='group') renderKelas();
}
function kelasAgo(t){
  const m=Math.max(0,Math.round((Date.now()-Date.parse(t))/60000));
  if(m<1) return 'just now'; if(m<60) return m+' min ago';
  const h=Math.round(m/60); if(h<24) return h+' h ago';
  const d=Math.round(h/24); return d<7?d+' d ago':new Date(t).toLocaleDateString('en-MY',{day:'numeric',month:'short'});
}
function kelasGroupTab(){
  const C=Kelas.cm;
  if(!C) return Kelas.cmErr
    ? '<div class="kl-none">The group did not load. Check your connection, then <button class="kl-unlink" onclick="kelasCmLoad()">try again</button>.</div>'
    : '<div class="ib-card ib-busy"><span class="ib-spin"></span><b>Loading your group…</b></div>';
  const sp=kelasSpace(), cats=(C.cats||[]).filter(c=>C.admin||kelasMemSpace({category:c})===sp);
  if(!cats.length) return '<div class="kl-none">The group opens while your class membership is active.</div>';
  let h='';
  if(cats.length>1) h+='<div class="kl-gchips">'+cats.map(c=>'<button class="'+(c===C.cat?'on':'')+'" onclick="kelasCmLoad(\''+c+'\')">'+hesc(kelasCat(c))+'</button>').join('')+'</div>';
  h+='<div class="kl-ghead"><div class="kl-kick">Group</div><b>'+hesc(kelasCat(C.cat))+'</b>'+(C.admin?'<span class="kl-admin">Admin</span>':'')+'</div>';
  if(C.cat==='Ladies'||C.cat==='Mens') h+=kelasLxGroupHTML(C);
  h+=kelasBoardHTML(C);
  if(C.admin) h+=kelasCmComposer(C);
  h+=fsec('Feed','Wins, photos and milestones from your class.');
  h+=kelasCmComposerMember();
  const posts=C.posts||[];
  h+='<div class="kl-feed">'+(posts.length?posts.map(kelasPostHTML).join('')
    :'<div class="kl-none">Nothing here yet. Every first class, Class Club and 3-class week shows up here, and so does every bell rung.</div>')+'</div>';
  const P=C.prefs||{};
  h+='<div class="kl-gprefs"><button onclick="kelasCmPref(\'feed\')">'+(P.hide_feed?'Show':'Hide')+' my milestones in the group</button>'+
     '<button onclick="kelasCmPref(\'board\')">'+(P.hide_board?'Show me on':'Hide me from')+' the leaderboard</button></div>';
  return h;
}
/* Three boards, all from the kiosk and all counted by days (a second class
   the same day earns points, not places):
     Classes        class days this week or this month
     Most improved  this month against last month to the same date, so a
                    newcomer or someone coming back can top it
     Streak         weeks in a row with 3+ classes */
var KL_BOARDS=[['classes','Classes'],['improved','Improved'],['streak','Streak']];
function kelasBoardKinds(C){ return C&&C.cat==='HYROX'?KL_BOARDS.concat([['stations','Stations']]):C&&C.cat==='Mens'?KL_BOARDS.concat([['strength','Strength']]):KL_BOARDS; }
function kelasBoardHTML(C){
  if(Kelas.cmKind==='stations' && C.cat!=='HYROX') Kelas.cmKind='classes';
  if(Kelas.cmKind==='strength' && C.cat!=='Mens') Kelas.cmKind='classes';
  if(Kelas.cmKind==='stations') return kelasHxBoardHTML(C);
  if(Kelas.cmKind==='strength') return kelasMxBoardHTML(C);
  const kind=Kelas.cmKind||'classes', which=Kelas.cmBoard||'week';
  const B=(kind==='classes'?C[which]:C[kind])||{}, top=B.top||[], me=B.me;
  const unit=kind==='streak'?(n=>'week'+(n===1?'':'s')):kind==='improved'?(()=>'vs last month'):(n=>'class'+(n===1?'':'es'));
  const val=kind==='improved'?(n=>(n>0?'+':'')+n):(n=>String(n));
  let h='<div class="kl-board"><div class="kl-bh"><b>Leaderboard</b>'+
    (kind==='classes'?'<div class="obseg kl-bseg">'+
      '<button class="'+(which==='week'?'on':'')+'" onclick="Kelas.cmBoard=\'week\';renderKelas()">Week</button>'+
      '<button class="'+(which==='month'?'on':'')+'" onclick="Kelas.cmBoard=\'month\';renderKelas()">Month</button></div>':'')+'</div>'+
    '<div class="kl-bkinds'+(C.cat==='HYROX'||C.cat==='Mens'?' kl-bk4':'')+'">'+kelasBoardKinds(C).map(k=>'<button class="'+(k[0]===kind?'on':'')+'" onclick="Kelas.cmKind=\''+k[0]+'\';renderKelas()">'+k[1]+'</button>').join('')+'</div>'+
    '<div class="kl-bnote">'+(kind==='improved'?'Classes this month against last month, to the same date. Anyone can win this one.'
      :kind==='streak'?'Weeks in a row with 3 or more classes.':'One class a day counts, morning or evening.')+'</div>';
  if(!top.length) return h+'<div class="kl-none">'+(kind==='streak'?'No streaks yet. Three classes this week starts one.':kind==='improved'?'Nobody has come yet this month. Be the first.':'No classes yet '+(which==='week'?'this week':'this month')+'. Be the first on the board.')+'</div></div>';
  const row=r=>'<div class="kl-br'+(r.me?' me':'')+'"><span class="kl-rk r'+r.r+'">'+r.r+'</span>'+kelasAv(r.ph,r.me&&r.name==='You'?((HF.data.prefs&&HF.data.prefs.name)||'Y'):r.name,'bd',r.me)+'<span class="kl-bn">'+hesc(r.name)+(r.me?' <i>you</i>':'')+
    (kind==='improved'&&r.was!=null?'<em>'+r.was+' → '+r.now+'</em>':'')+'</span><b>'+val(r.n)+'</b><small>'+unit(r.n)+'</small></div>';
  h+=top.map(row).join('');
  if(me && !top.some(r=>r.me)) h+='<div class="kl-bsep">⋯</div>'+row({r:me.r,name:'You',n:me.n,me:true,ph:me.ph});
  const more=kind==='streak'?(g=>g+' more week'+(g===1?'':'s')):kind==='improved'?(g=>g+' more class'+(g===1?'':'es')):(g=>g+' more class'+(g===1?'':'es'));
  h+='<div class="kl-bfoot">'+(me?(me.r===1?'You are top of the board. Keep it there!':(me.gap?more(me.gap)+' to move up':'Level with the next place up')+' · #'+me.r+' of '+B.people)
      :(kind==='streak'?'Three classes this week puts you on this board.':'Check in at the kiosk to get on the board.'))+'</div></div>';
  return h;
}
function kelasPostHTML(p){
  const r=p.r||{}, my=p.my||[], C=Kelas.cm||{}, own=p.kind==='photo'||p.kind==='text';
  let h='<div class="kl-post k-'+p.kind+(p.pinned?' pin':'')+(p.hidden?' hid':'')+(own?' own':'')+'" id="kp-'+p.id+'">';
  if(own){
    const nm=String(p.title||'Member');
    h+='<div class="kl-ph">'+kelasAv(p.ph,nm,'',p.mine)+'<div><b>'+hesc(nm)+'</b><small>'+kelasAgo(p.at)+
       (p.pinned?' · <span class="kl-pin">Pinned</span>':'')+(p.hidden?' · <span class="kl-pin">Hidden</span>':'')+'</small></div>'+kelasPostMenu(p)+'</div>';
    if(p.body) h+='<div class="kl-pcap">'+hesc(p.body)+'</div>';
    if(p.img) h+='<img class="kl-pimg" src="'+hesc(p.img)+'" alt="" loading="lazy" onclick="kelasCmZoom(this.src)">';
    else if(p.data&&p.data.path) h+='<div class="kl-pimg kl-pimg0">Photo</div>';
    h+='<div class="kl-pbody2">';
  } else {
    h+='<div class="kl-prow">'+((p.ph||p.mine&&typeof hfPhoto==='function'&&hfPhoto())&&p.kind!=='announce'
        ?'<span class="kl-pic kl-pic-av">'+kelasAv(p.ph,p.title,'',p.mine)+'<i>'+glyph(KL_CM_ICON[p.kind]||'star')+'</i></span>'
        :'<span class="kl-pic">'+glyph(KL_CM_ICON[p.kind]||'star')+'</span>')+
      '<div class="kl-pb"><div class="kl-pt">'+hesc(p.title)+'</div>'+(p.body?'<div class="kl-pbody">'+hesc(p.body)+'</div>':'')+
      '<div class="kl-pm">'+(p.pinned?'<span class="kl-pin">Pinned</span>':'')+(p.hidden?'<span class="kl-pin">Hidden</span>':'')+kelasAgo(p.at)+'</div></div>'+kelasPostMenu(p)+'</div>'+
      '<div class="kl-pbody2 kl-pindent">';
  }
  h+='<div class="kl-reacts">'+KL_CM_EMO.map(e=>'<button class="'+(my.indexOf(e[0])>=0?'on':'')+'" onclick="kelasCmReact(\''+p.id+'\',\''+e[0]+'\')">'+e[1]+(r[e[0]]?' <b>'+r[e[0]]+'</b>':'')+'</button>').join('')+
     '<button class="kl-cbtn" onclick="kelasCmOpen(\''+p.id+'\')">💬'+(p.nc?' <b>'+p.nc+'</b>':' Comment')+'</button></div>';
  h+=kelasCommentsHTML(p)+'</div></div>';
  return h;
}
/* ⋯ on a post: report someone else's, delete your own; the admin pins, hides, deletes */
function kelasPostMenu(p){
  const C=Kelas.cm||{}, open=Kelas.cmMenu===p.id, own=p.kind==='photo'||p.kind==='text';
  let items='';
  if(open){
    if(C.admin) items+='<button onclick="kelasCmAdmin(\''+(p.pinned?'unpin':'pin')+'\',\''+p.id+'\')">'+(p.pinned?'Unpin':'Pin')+'</button>'+
      '<button onclick="kelasCmAdmin(\''+(p.hidden?'unhide':'hide')+'\',\''+p.id+'\')">'+(p.hidden?'Unhide':'Hide')+'</button>';
    if(p.mine && own || C.admin) items+='<button class="danger" onclick="kelasCmDelete(\''+p.id+'\',null)">Delete</button>';
    if(!p.mine) items+='<button onclick="kelasCmReport(\''+p.id+'\',null)">Report</button>';
    if(C.admin && p.rep) items+='<span class="kl-repn">'+p.rep+' report'+(p.rep===1?'':'s')+'</span>';
  }
  return '<div class="kl-pmenu"><button class="kl-dots" aria-label="More" onclick="Kelas.cmMenu=Kelas.cmMenu===\''+p.id+'\'?null:\''+p.id+'\';renderKelas()">⋯</button>'+
    (open?'<div class="kl-pmenu-l">'+items+'</div>':'')+'</div>';
}
/* the comments: the last two in the feed, all of them once opened, with
   replies under their comment (one level, like Facebook) */
function kelasCmOne(p,c,reply){
  const adm=Kelas.cm&&Kelas.cm.admin;
  return '<div class="kl-cm'+(c.hidden?' hid':'')+(reply?' rep':'')+'">'+kelasAv(c.ph,c.name,'sm',c.mine)+
    '<div class="kl-cmb"><b>'+hesc(c.name||'Member')+'</b> '+hesc(c.body)+'<small>'+kelasAgo(c.at)+
    (c.id!=='tmp'?' · <button onclick="kelasCmReplyTo(\''+p.id+'\',\''+(c.parent||c.id)+'\',\''+hesc(String(c.name||'Member')).replace(/'/g,'')+'\')">Reply</button>':'')+
    (c.id==='tmp'?'':(c.mine||adm)?' · <button onclick="kelasCmDelete(\''+p.id+'\',\''+c.id+'\')">Delete</button>':' · <button onclick="kelasCmReport(\''+p.id+'\',\''+c.id+'\')">Report</button>')+
    '</small></div></div>';
}
function kelasCommentsHTML(p){
  const all=(Kelas.cmC||{})[p.id], list=all||p.cm||[], open=Kelas.cmOpenId===p.id, R=Kelas.cmReply&&Kelas.cmReply.post===p.id?Kelas.cmReply:null;
  let h='';
  if(p.nc>list.length && !all) h+='<button class="kl-cmore" onclick="kelasCmOpen(\''+p.id+'\')">View all '+p.nc+' comments</button>';
  if(list.length){
    const tops=all?list.filter(c=>!c.parent):list;
    h+='<div class="kl-cms">'+tops.map(c=>kelasCmOne(p,c,false)+
      (all?list.filter(x=>x.parent===c.id).map(x=>kelasCmOne(p,x,true)).join(''):'')).join('')+'</div>';
  }
  if(open) h+=(R?'<div class="kl-replying">Replying to <b>'+hesc(R.name)+'</b> <button onclick="Kelas.cmReply=null;renderKelas()">✕</button></div>':'')+
    '<div class="kl-cin"><input id="kl-cin-'+p.id+'" class="kl-in" maxlength="500" placeholder="'+(R?'Write a reply…':'Write a comment…')+'" onkeydown="if(event.key===\'Enter\')kelasCmSend(\''+p.id+'\')">'+
    '<button class="f30-go" onclick="kelasCmSend(\''+p.id+'\')">Send</button></div>';
  return h;
}
function kelasCmReplyTo(pid,parent,name){
  Kelas.cmReply={post:pid,parent:parent,name:name};
  if(Kelas.cmOpenId!==pid) return kelasCmOpen(pid);
  renderKelas(); setTimeout(()=>{ const f=$('kl-cin-'+pid); if(f) f.focus(); },50);
}
async function kelasCmOpen(id){
  Kelas.cmOpenId=id; renderKelas();
  setTimeout(()=>{ const f=$('kl-cin-'+id); if(f) f.focus(); },50);
  try{ const r=await kelasCall('cm_comments',{post:id}); if(r&&r.ok){ Kelas.cmC=Kelas.cmC||{}; Kelas.cmC[id]=r.comments||[]; renderKelas(); const f=$('kl-cin-'+id); if(f) f.focus(); } }catch(e){}
}
async function kelasCmSend(id){
  const f=$('kl-cin-'+id), t=(f&&f.value||'').trim(); if(!t) return;
  f.value='';
  const p=((Kelas.cm&&Kelas.cm.posts)||[]).filter(x=>x.id===id)[0];
  const R=Kelas.cmReply&&Kelas.cmReply.post===id?Kelas.cmReply:null; Kelas.cmReply=null;
  Kelas.cmC=Kelas.cmC||{}; const list=Kelas.cmC[id]||(p&&p.cm)||[];
  Kelas.cmC[id]=list.concat([{id:'tmp',parent:R?R.parent:null,name:'You',body:t,at:new Date().toISOString(),mine:true}]);
  if(p) p.nc=(p.nc||0)+1;
  if(typeof hfSound==='function') hfSound('pop');
  renderKelas();
  try{
    const r=await kelasCall('cm_comment',{post:id,body:t,parent:R?R.parent:null});
    if(!r||!r.ok) toast(r&&r.error==='too_many'?'That is a lot of comments today. Try again tomorrow.':'Could not post the comment.');
    const all=await kelasCall('cm_comments',{post:id}); if(all&&all.ok){ Kelas.cmC[id]=all.comments||[]; renderKelas(); }
  }catch(e){ toast('Could not post the comment. Check your connection.'); }
}
async function kelasCmReport(pid,cid){
  Kelas.cmMenu=null;
  try{ await kelasCall('cm_report',{post:pid,comment:cid}); toast('Reported. Thank you, the admin will look at it.'); }catch(e){ toast('Could not report. Try again.'); }
  renderKelas();
}
async function kelasCmDelete(pid,cid){
  Kelas.cmMenu=null;
  if(Kelas.cmDel!==(cid||pid)){ Kelas.cmDel=cid||pid; toast('Tap Delete again to remove it.'); renderKelas(); return; }
  Kelas.cmDel=null;
  try{ await kelasCall('cm_delete',{post:pid,comment:cid}); if(cid&&Kelas.cmC) delete Kelas.cmC[pid]; toast('Deleted.'); kelasCmLoad(); }catch(e){ toast('Could not delete. Try again.'); }
}
function kelasCmZoom(src){
  let o=$('klzoom'); if(!o){ o=document.createElement('div'); o.id='klzoom'; o.onclick=()=>o.classList.remove('on'); document.body.appendChild(o); }
  o.innerHTML='<img src="'+hesc(src)+'" alt="">'; o.classList.add('on');
}

/* every member: share a win, a selfie, a word with the class */
function kelasCmComposerMember(){
  const c=Kelas.cmNew;
  if(!c) return '<button class="kl-share-win" onclick="Kelas.cmNew={body:\'\',img:null};renderKelas()">'+((typeof hfPhoto==='function'&&hfPhoto())?kelasAv('',(HF.data.prefs&&HF.data.prefs.name)||'Me','',true):'<span class="kl-av">+</span>')+'<span>Share a win with your class…</span>'+glyph('photo')+'</button>';
  return '<div class="kl-comp kl-comp2"><textarea id="kl-cmn" class="kl-in" maxlength="1000" rows="3" placeholder="A win, a selfie after class, a thank you to your coach…" oninput="Kelas.cmNew.body=this.value">'+hesc(c.body||'')+'</textarea>'+
    (c.img?'<div class="kl-cprev"><img src="'+c.img+'" alt=""><button onclick="Kelas.cmNew.img=null;renderKelas()" aria-label="Remove photo">✕</button></div>':'')+
    '<input type="file" id="kl-cmf" accept="image/*" style="display:none" onchange="kelasCmPhoto(this)">'+
    '<div class="kl-crow"><button class="kl-alt2" onclick="$(\'kl-cmf\').click()">'+glyph('photo')+' Photo</button>'+
    '<button class="kl-alt2" onclick="Kelas.cmNew=null;renderKelas()">Cancel</button>'+
    '<button class="bigbtn kl-go" onclick="kelasCmCreate()"'+(Kelas.cmBusyNew?' disabled':'')+'>'+(Kelas.cmBusyNew?'Posting…':'Post')+'</button></div>'+
    '<div class="kl-fine2">Only your class group sees it. Be kind; posts others report are hidden.</div></div>';
}
function kelasCmPhoto(inp){
  const file=inp&&inp.files&&inp.files[0]; if(!file) return;
  const rd=new FileReader();
  rd.onload=()=>{ const img=new Image();
    img.onload=()=>{ const mx=1280, sc=Math.min(1,mx/Math.max(img.width,img.height));
      const cv=document.createElement('canvas'); cv.width=Math.round(img.width*sc); cv.height=Math.round(img.height*sc);
      cv.getContext('2d').drawImage(img,0,0,cv.width,cv.height);
      const t=$('kl-cmn'); if(t) Kelas.cmNew.body=t.value;
      Kelas.cmNew.img=cv.toDataURL('image/jpeg',.82); renderKelas(); };
    img.src=rd.result; };
  rd.readAsDataURL(file);
}
async function kelasCmCreate(){
  const c=Kelas.cmNew; if(!c) return;
  const t=$('kl-cmn'); if(t) c.body=t.value;
  if(!(c.body||'').trim() && !c.img){ toast('Write something or add a photo.'); return; }
  Kelas.cmBusyNew=true; renderKelas();
  try{
    const r=await kelasCall('cm_create',{body:c.body||'', image_base64:c.img||''});
    if(r&&r.ok){ Kelas.cmNew=null; toast('Posted to your class group.'); if(typeof hfSound==='function') hfSound('cheer'); await kelasCmLoad(); }
    else toast(r&&r.error==='too_many'?'That is 5 posts today. Try again tomorrow.':'Could not post. Try again.');
  }catch(e){ toast('Could not post. Check your connection.'); }
  Kelas.cmBusyNew=false; renderKelas();
}
async function kelasCmReact(id,emo){
  const p=((Kelas.cm&&Kelas.cm.posts)||[]).filter(x=>x.id===id)[0]; if(!p) return;
  p.r=p.r||{}; p.my=p.my||[];
  const on=p.my.indexOf(emo)<0;
  if(on){ p.my.push(emo); p.r[emo]=(p.r[emo]||0)+1; if(typeof hfSound==='function') hfSound('pop'); } else { p.my=p.my.filter(x=>x!==emo); p.r[emo]=Math.max(0,(p.r[emo]||1)-1); }
  renderKelas();
  try{ await kelasCall('cm_react',{post:id,emoji:emo}); }catch(e){ toast('Could not react. Check your connection.'); }
}
async function kelasCmPref(k){
  const P=Object.assign({hide_board:false,hide_feed:false},(Kelas.cm&&Kelas.cm.prefs)||{});
  if(k==='feed') P.hide_feed=!P.hide_feed; else P.hide_board=!P.hide_board;
  try{ await kelasCall('cm_pref',P); toast(k==='feed'?(P.hide_feed?'Your milestones stay private now.':'Your milestones show in the group.'):(P.hide_board?'You are off the leaderboard.':'You are back on the leaderboard.')); kelasCmLoad(); }
  catch(e){ toast('Could not save. Check your connection.'); }
}
/* admin: one announcement, pinned, to this group or every group */
function kelasCmComposer(C){
  return '<div class="kl-comp"><b>Post an announcement</b>'+
    '<input id="kl-cmt" class="kl-in" maxlength="120" placeholder="Title, e.g. Class 3 moves to 6:30 PM today">'+
    '<textarea id="kl-cmb" class="kl-in" maxlength="1000" rows="3" placeholder="Details (optional)"></textarea>'+
    '<div class="kl-crow"><select id="kl-cmc" class="kl-in"><option value="'+hesc(C.cat)+'">'+hesc(kelasCat(C.cat))+'</option><option value="all">Every class group</option></select>'+
    '<button class="bigbtn kl-go" onclick="kelasCmAnnounce()">Post and pin</button></div></div>';
}
async function kelasCmAnnounce(){
  const t=(($('kl-cmt')||{}).value||'').trim(), b=(($('kl-cmb')||{}).value||'').trim(), c=($('kl-cmc')||{}).value||'';
  if(!t){ toast('Write a title first.'); return; }
  try{ const r=await kelasCall('cm_admin',{op:'announce',title:t,body:b,cat:c}); if(r&&r.ok){ toast('Posted and pinned.'); kelasCmLoad(); } else toast('Could not post.'); }
  catch(e){ toast('Could not post. Check your connection.'); }
}
async function kelasCmAdmin(op,id){
  try{ await kelasCall('cm_admin',{op:op,post:id}); kelasCmLoad(); }catch(e){ toast('Could not change that post.'); }
}

/* ═══════════════ FIRST 30 ═══════════════
   A new member's first thirty days (17 Oct 2026, from Seth's talk with
   ChatGPT: "where am I, what next, how close"). Seven missions, every one
   from data HITFAT OS already keeps, the same list the staff see as
   Client Onboarding (088_first30.sql). Bara speaks for the journey while it
   runs. Done: +300 points and a post in the class group, once. Visible from
   day 1 to day 37; members who started before it never see it. */
var KL_F30=[
  ['goal','Set your goal','Tell your coach what you are here for','target'],
  ['inbody1','First InBody','Your starting point, from the sheet','scale'],
  ['coach','Meet your coach','A consultation at the counter','person'],
  ['class1','Your first class','Show your QR at the kiosk','qr'],
  ['week3','3 classes in one week','Any week, at your pace','calendar'],
  ['ten','10 classes','This is where the habit starts','trophy'],
  ['inbody2','Second InBody','From day 21: see what changed','chart']];
var KL_GOALS=['Lose fat','Build muscle','Get fitter','Get stronger','My first HYROX'];
function kelasF30(){ const f=Kelas.data&&Kelas.data.first30; return f&&f.active?f:null; }
function kelasF30M(f,k){ return ((f&&f.missions)||[]).filter(m=>m.k===k)[0]||{}; }
/* the next thing to do: the first one not done that is open today */
function kelasF30Next(f){
  for(const d of KL_F30){ const m=kelasF30M(f,d[0]); if(!m.done && !(m.from && f.day<m.from)) return d; }
  return null;
}
/* Bara, as the journey companion */
function kelasF30Line(f){
  const n=f.done, nx=kelasF30Next(f), w=kelasF30M(f,'week3');
  if(f.complete) return ['gold','Awak dah tamatkan FIRST 30! Bara bangga sangat. Teruskan 3 kelas seminggu 🏅'];
  if(f.day>30) return ['calendar','FIRST 30 hampir siap: '+n+' daripada 7. Jumpa coach untuk misi terakhir sebelum hari ke-37.'];
  if(f.day<=2) return ['cheer','Selamat datang ke HITFAT! Bara teman awak 30 hari pertama. Mula dengan misi pertama ya.'];
  if(f.day<=7) return w.done?['gold','3 kelas dalam seminggu, dah capai! Bara bangga 🔥']:['aktif','Minggu pertama awak: '+(w.n||0)+' daripada 3 kelas. Sikit lagi!'];
  if(f.day<=14) return ['aktif','Dua minggu pertama awak paling penting. '+n+' daripada 7 misi siap. Teruskan!'];
  if(f.day<21) return ['aktif','Separuh jalan, awak hebat! '+n+' daripada 7 misi siap'+(nx?'. Seterusnya: '+nx[1]:'')+'.'];
  return kelasF30M(f,'inbody2').done?['cheer','InBody kedua dah ada! Tengok apa yang berubah di tab Body.']
    :['aktif','Masa untuk InBody kedua: tengok apa yang dah berubah sejak hari pertama!'];
}
function kelasF30HTML(){
  const f=kelasF30(); if(!f) return '';
  const pct=Math.round(f.done/(f.total||7)*100), nx=kelasF30Next(f);
  let h='<div class="f30'+(f.complete?' done':'')+'"><div class="f30-top"><div><div class="kl-kick">FIRST 30 · Day '+Math.min(f.day,30)+' of 30</div>'+
    '<b>'+(f.complete?'First 30 complete':'Your first 30 days')+'</b></div><span class="f30-n">'+f.done+'<small>/'+(f.total||7)+'</small></span></div>'+
    '<span class="kl-tb f30-bar"><i style="width:'+pct+'%"></i></span>';
  if(f.complete){
    h+='<div class="f30-win">'+glyph('trophy')+'<div><b>+300 points'+(f.awarded?' added':'')+'</b><span>Seven of seven. Next: choose a 60-day journey below.</span></div></div>'+
       '<button class="bigbtn kl-go" onclick="kelasF30Share()">'+glyph('share')+' Share my First 30</button></div>';
    return h;
  }
  if(f.day>30) h+='<div class="f30-late">Day 30 has passed. Finish the last '+(7-f.done)+' with your coach by day 37.</div>';
  h+='<div class="f30-list">'+KL_F30.map(d=>{
    const m=kelasF30M(f,d[0]), locked=m.from && f.day<m.from && !m.done, isNext=nx && nx[0]===d[0];
    const prog=(d[0]==='week3'?(m.n||0)+'/3':d[0]==='ten'?(m.n||0)+'/10':'');
    let act='';
    if(!m.done && !locked){
      if(d[0]==='goal') act='<button class="f30-go" onclick="kelasF30GoalOpen()">Choose</button>';
      else if(d[0]==='inbody1'||d[0]==='inbody2') act='<button class="f30-go" onclick="kelasTab(\'body\')">Scan</button>';
      else if(d[0]==='class1') act='<button class="f30-go" onclick="kelasQRFull()">QR</button>';
    }
    let row='<div class="f30-m'+(m.done?' ok':'')+(isNext?' next':'')+(locked?' lock':'')+'"><span class="f30-c">'+(m.done?glyph('check'):glyph(d[3]))+'</span>'+
      '<div class="f30-t"><b>'+d[1]+(prog&&!m.done?' <em>'+prog+'</em>':'')+'</b><small>'+(d[0]==='goal'&&m.done&&m.goal?hesc(m.goal):locked?'Opens on day '+m.from:d[2])+'</small></div>'+act+'</div>';
    if(d[0]==='goal' && Kelas.f30Goal && !m.done) row+='<div class="f30-goals">'+KL_GOALS.map(g=>'<button onclick="kelasF30SetGoal(\''+g+'\')">'+g+'</button>').join('')+'</div>';
    return row;
  }).join('')+'</div></div>';
  return h;
}
function kelasF30GoalOpen(){ Kelas.f30Goal=!Kelas.f30Goal; renderKelas(); }
async function kelasF30SetGoal(g){
  const f=kelasF30(); Kelas.f30Goal=false;
  const m=kelasF30M(f,'goal'); if(m){ m.done=true; m.goal=g; f.done=Math.min(f.total||7,(f.done||0)+1); }
  if(HF.data && HF.data.prefs && !HF.data.prefs.goal){ HF.data.prefs.goal=g; HF.save(); }
  renderKelas();
  if(typeof hfSound==='function') hfSound('cheer');
  try{ await kelasCall('goal',{goal:g}); toast('Goal set: '+g+'. Your coach sees it too.'); }
  catch(e){ toast('Could not save the goal. Try again.'); }
}
function kelasF30Share(){
  Kelas.share={kind:'f30', n:kelasTotal(), streak:kelasWeekStreak()}; openShare('kelas');
}

/* ═══════════════ 60-day journeys ═══════════════
   After FIRST 30, or any time for a member who joined before it (089):
   one journey for the goal, 60 days, four missions from OS data. Done:
   +600 and a post in the class group. One at a time; an unfinished one
   ends on day 67 and another can start. */
var KL_JR={
  fat60:   {n:'Fat Loss 60',       s:'Lose fat, keep the muscle',      r:'Body fat % lower than at the start', ic:'flame', unit:'%'},
  strong60:{n:'Stronger 60',       s:'Build muscle and strength',      r:'More muscle than at the start',      ic:'trophy', unit:'kg'},
  engine60:{n:'Build Your Engine', s:'Fitter, faster, for longer',     r:'A higher InBody Score than at the start', ic:'bolt', unit:''},
  hyrox60: {n:'HYROX Foundation',  s:'Ready for your first HYROX',     r:'More muscle than at the start',      ic:'flag', unit:'kg'}};
var KL_JR_M={weeks:['8 weeks of 3+ classes','A week counts with 3 classes','calendar'],
  classes:['24 classes','Every class at HQ counts','trophy'],
  inbody:['2 InBody scans','Week 4 and week 8','scale'],
  result:['The result','','chart']};
function kelasJr(){ const j=Kelas.data&&Kelas.data.journey; return j&&j.active?j:null; }
function kelasJrM(j,k){ return ((j&&j.missions)||[]).filter(m=>m.k===k)[0]||{}; }
function kelasJrLine(j){
  const w=Math.ceil(Math.min(j.day,60)/7), wk=kelasJrM(j,'weeks'), J=KL_JR[j.kind]||{n:'Journey'};
  if(j.complete) return ['gold','Awak dah tamatkan '+J.n+'! +600 mata. Bara bangga sangat 🏅'];
  if(j.day>60) return ['calendar',J.n+' dah sampai hari 60: '+j.done+' daripada 4. Ada seminggu lagi untuk habiskan, awak boleh!'];
  if(w===4 || w===8) return ['aktif','Minggu '+w+': masa untuk InBody. Tengok apa yang berubah, awak!'];
  return ['aktif',J.n+', minggu '+w+' daripada 8. Awak dah ada '+(wk.n||0)+' minggu dengan 3+ kelas.'];
}
function kelasJourneyHTML(){
  const J=Kelas.data&&Kelas.data.journey, f30=kelasF30();
  if(!J) return '';
  if(J.active){
    const D=KL_JR[J.kind]||{n:'Journey',r:''}, pct=Math.round(J.done/(J.total||4)*100);
    let h='<div class="f30 jr'+(J.complete?' done':'')+'"><div class="f30-top"><div><div class="kl-kick">'+hesc(D.n)+' · Day '+Math.min(J.day,60)+' of 60</div>'+
      '<b>'+(J.complete?D.n+' complete':hesc(D.s))+'</b></div><span class="f30-n">'+J.done+'<small>/'+(J.total||4)+'</small></span></div>'+
      '<span class="kl-tb f30-bar"><i style="width:'+pct+'%"></i></span>';
    if(J.complete) return h+'<div class="f30-win">'+glyph('trophy')+'<div><b>+600 points</b><span>Four of four. Choose your next journey any time.</span></div></div></div>';
    if(J.day>60) h+='<div class="f30-late">Day 60 has passed. You have until day 67 to finish.</div>';
    h+='<div class="f30-list">'+['weeks','classes','inbody','result'].map(k=>{
      const m=kelasJrM(J,k), d=KL_JR_M[k];
      let sub=d[1];
      if(k==='result'){
        sub=D.r+(m.base!=null?' · start '+kelasF(m.base)+(D.unit?' '+D.unit:'')+(m.last!=null?' → now '+kelasF(m.last)+(D.unit?' '+D.unit:''):''):' · scan in week 1 to set the start');
      }
      return '<div class="f30-m'+(m.done?' ok':'')+'"><span class="f30-c">'+(m.done?glyph('check'):glyph(k==='result'?D.ic:d[2]))+'</span>'+
        '<div class="f30-t"><b>'+d[0]+(m.of&&!m.done?' <em>'+(m.n||0)+'/'+m.of+'</em>':'')+'</b><small>'+hesc(sub)+'</small></div>'+
        (k==='inbody'&&!m.done?'<button class="f30-go" onclick="kelasTab(\'body\')">Scan</button>':'')+'</div>';
    }).join('')+'</div></div>';
    return h;
  }
  /* no journey running: choose one, if FIRST 30 is behind them */
  if(!J.eligible || (f30 && !f30.complete)) return '';
  const pick=Kelas.jrPick;
  let h='<div class="f30 jr-pick"><div class="kl-kick">'+(J.done?'Your next journey':'60-day journeys')+'</div><b class="jr-h">Choose your next journey</b>'+
    '<div class="jr-sub">Sixty days, four missions, +600 points. One at a time.</div><div class="jr-opts">'+
    Object.keys(KL_JR).map(k=>{ const D=KL_JR[k];
      return '<button class="jr-o'+(pick===k?' on':'')+'" onclick="Kelas.jrPick=\''+k+'\';renderKelas()"><span class="f30-c">'+glyph(D.ic)+'</span>'+
        '<span class="jr-ot"><b>'+D.n+(J.suggest===k?' <em>For your goal</em>':'')+'</b><small>'+D.s+'</small></span></button>'; }).join('')+'</div>';
  if(pick) h+='<button class="bigbtn kl-go" onclick="kelasJrStart()"'+(Kelas.jrBusy?' disabled':'')+'>'+(Kelas.jrBusy?'Starting…':'Start '+KL_JR[pick].n)+'</button>';
  return h+'</div>';
}
async function kelasJrStart(){
  const k=Kelas.jrPick; if(!k) return;
  Kelas.jrBusy=true; renderKelas();
  try{
    const r=await kelasCall('journey_start',{kind:k});
    if(r && r.ok){ toast(KL_JR[k].n+' starts today. Bara is with you!'); Kelas.jrPick=null; await kelasLoad(); }
    else toast(r&&r.error==='first30'?'Finish FIRST 30 first.':r&&r.error==='running'?'A journey is already running.':'Could not start. Try again.');
  }catch(e){ toast('Could not start. Check your connection.'); }
  Kelas.jrBusy=false; renderKelas();
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
      Kelas.data=Object.assign({}, r.status, {until:r.until}); kelasSave(); Kelas.state='ready'; kelasSyncDays();
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

/* ═══════════════ HYROX: performance (17 Oct 2026) ═══════════════
   Seth: HYROX is a performance class; its members get a different screen
   from the unlimited classes. For an active HYROX member Progress becomes
   Perform: the race (date, division, the days left and the phase of
   training), every station's time against the member's own best, a
   predicted finish from those times, where the race time goes, and in the
   HYROX group a board for each station (094_hyrox.sql).

   Every HYROX station is scored by time. A race is 8 × 1 km run, each
   followed by a station, in this order. The prediction is an estimate and
   says so: the runs are slower inside a race than fresh (×1.15 on the best
   1 km), and the Roxzone (the transitions) is set at 6 minutes. */
var HX_ST=[['run','1 km run','Run','1 km'],['ski','SkiErg','Ski','1000 m'],['push','Sled Push','Push','50 m'],['pull','Sled Pull','Pull','50 m'],
  ['bbj','Burpee Broad Jumps','BBJ','80 m'],['row','Rowing','Row','1000 m'],['carry','Farmers Carry','Carry','200 m'],
  ['lunge','Sandbag Lunges','Lunges','100 m'],['wb','Wall Balls','Wall Balls','100 reps']];
var HX_DIVS=['Open Men','Open Women','Pro Men','Pro Women','Doubles Men','Doubles Women','Doubles Mixed'];
var HX_RUN_FACTOR=1.15, HX_ROXZONE=360;
function kelasIsHx(){ return kelasLinked() && kelasSpace()==='hyrox' && kelasHasSpace('hyrox'); }
function kelasHxProf(){ const k=HF.data.kelas||(HF.data.kelas={}); if(!k.hx||typeof k.hx!=='object') k.hx={}; return k.hx; }
function kelasHxDiv(){ return kelasHxProf().div||''; }
function kelasHxRes(){ return (Kelas.data&&Array.isArray(Kelas.data.hyrox))?Kelas.data.hyrox:[]; }
function kelasHxName(st){ const r=HX_ST.filter(x=>x[0]===st)[0]; return st==='sim'?'Full simulation':r?r[1]:st; }
function hxClock(sec){
  sec=Math.round(+sec||0); const h=Math.floor(sec/3600), m=Math.floor(sec%3600/60), s=sec%60;
  return (h?h+':'+String(m).padStart(2,'0'):m)+':'+String(s).padStart(2,'0');
}
function hxParse(t){
  t=String(t||'').trim(); if(!/^\d{1,2}(:\d{1,2}){1,2}$/.test(t)) return null;
  const p=t.split(':').map(Number); if(p.slice(1).some(x=>x>59)) return null;
  const v=p.length===3?p[0]*3600+p[1]*60+p[2]:p[0]*60+p[1]; return v>0?v:null;
}
function kelasHxList(st,div){ return kelasHxRes().filter(r=>r.st===st && (!div||r.div===div)).sort((a,b)=>String(b.d).localeCompare(String(a.d))); }
function kelasHxBest(st,div){ const a=kelasHxList(st,div); return a.length?Math.min.apply(null,a.map(r=>+r.s)):null; }
function kelasHxPredict(div){
  const parts=[], missing=[];
  HX_ST.forEach(x=>{ const b=kelasHxBest(x[0],div); if(b===null) missing.push(x[0]); else parts.push({k:x[0], label:x[0]==='run'?'Runs (8 × 1 km)':x[1], s:x[0]==='run'?b*8*HX_RUN_FACTOR:b}); });
  if(missing.length) return {done:false, missing:missing, have:HX_ST.length-missing.length};
  parts.push({k:'rox', label:'Roxzone (estimate)', s:HX_ROXZONE});
  const total=parts.reduce((a,p)=>a+p.s,0);
  return {done:true, total:total, parts:parts.sort((a,b)=>b.s-a.s)};
}
function kelasHxDays(){ const r=kelasHxProf().race; if(!r) return null; return Math.round((Date.parse(r+'T00:00:00Z')-Date.parse(kelasDayKey(kelasNowMY())+'T00:00:00Z'))/864e5); }
function kelasHxPhase(d){
  if(d===null||d<0) return null;
  const D=Kelas.hxData, W=D&&kelasHxProf().race?kelasHxWeek():null;
  if(W&&W.n){ const wk=kelasHxPlanWeek(D,W.n); if(wk) return [wk.block, 'Week '+W.n+' of the 16-week race plan.']; }
  if(d<=7) return ['Race week','Short and sharp. Sleep, eat well, nothing new.'];
  if(d<=28) return ['Peak','Race-pace work and one full simulation.'];
  if(d<=84) return ['Build','Heavy sleds and lunges; a simulation every two weeks.'];
  return ['Base','Build the engine: easy runs and clean technique on every station.'];
}
/* Today: a strip with the race */
function kelasHxTodayHTML(){
  const d=kelasHxDays(), ph=kelasHxPhase(d), P=kelasHxPredict(kelasHxDiv());
  if(d===null||d<0) return '<button class="kl-hxt" onclick="kelasTab(\'progress\')"><span class="kl-hxt-k">HYROX</span><b>Set your race</b><small>Date and division, then log your stations</small><i>›</i></button>';
  return '<button class="kl-hxt" onclick="kelasTab(\'progress\')"><span class="kl-hxt-k">HYROX · '+hesc(kelasHxDiv()||'')+'</span>'+
    '<b>'+(d===0?'Race day! 🔥':d+' day'+(d===1?'':'s')+' to race')+'</b><small>'+(ph?ph[0]+' · ':'')+(P.done?'predicted '+hxClock(P.total):P.have+' of 9 logged')+'</small><i>›</i></button>';
}
/* Perform: the race, the prediction, the stations */
function kelasHxHTML(){
  const prof=kelasHxProf(), div=prof.div||'';
  let h='<div class="kl-hx">';
  /* the race */
  if(!div || Kelas.hxSet){
    h+='<div class="kl-hx-k">HYROX · your race</div><div class="kl-hx-q">Which division?</div><div class="kl-hx-divs">'+
      HX_DIVS.map(v=>'<button class="'+(v===div?'on':'')+'" onclick="kelasHxSetDiv(\''+v+'\')">'+v+'</button>').join('')+'</div>'+
      '<div class="kl-hx-q">Race date <small>(optional)</small></div><div class="kl-hx-dt"><input type="date" id="kl-hxd" value="'+hesc(prof.race||'')+'" min="'+kelasDayKey(kelasNowMY())+'">'+
      '<button onclick="kelasHxSetRace()">'+(div?'Save':'Skip')+'</button></div></div>';
    return h+kelasHxStationsHTML('');
  }
  const d=kelasHxDays(), ph=kelasHxPhase(d);
  h+='<div class="kl-hx-top"><div><div class="kl-hx-k">HYROX · '+hesc(div)+'</div>'+
    (d!==null&&d>=0?'<div class="kl-hx-cd"><b>'+d+'</b><span>day'+(d===1?'':'s')+' to race</span></div>'+
      '<div class="kl-hx-ph"><span>'+ph[0]+'</span>'+ph[1]+'</div>'
     :'<div class="kl-hx-cd"><span>No race date set</span></div>')+'</div>'+
    '<button class="kl-hx-ed" onclick="Kelas.hxSet=true;renderKelas()">Edit</button></div>';
  /* the prediction */
  const P=kelasHxPredict(div), sim=kelasHxBest('sim',div);
  if(P.done){
    h+='<div class="kl-hx-pred"><small>Predicted finish</small><b>'+hxClock(P.total)+'</b>'+(sim?'<em>Best simulation '+hxClock(sim)+'</em>':'')+'</div>';
    const top=P.parts.filter(p=>p.k!=='run'&&p.k!=='rox')[0];
    h+='<div class="kl-hx-where"><div class="kl-hx-wh">Where your time goes</div><div class="kl-hx-bar">'+
      P.parts.map(p=>'<i class="'+(p.k==='run'?'run':p.k==='rox'?'rox':p===top?'top':'')+'" style="width:'+(p.s/P.total*100).toFixed(1)+'%"></i>').join('')+'</div>'+
      P.parts.map(p=>'<div class="kl-hx-row'+(p===top?' top':'')+'"'+(p===top?' onclick="Kelas.hxLog=\''+p.k+'\';renderKelas();setTimeout(()=>{const e=document.querySelector(\'.kl-hx-log\');if(e)e.scrollIntoView({block:\'start\'});},50)" style="cursor:pointer"':'')+'><span>'+hesc(p.label)+(p===top?' <em>focus · train it</em>':'')+'</span><b>'+hxClock(p.s)+'</b><small>'+Math.round(p.s/P.total*100)+'%</small></div>').join('')+
      '<div class="kl-hx-fine">An estimate: race runs ×1.15 on your best 1 km, Roxzone 6 min. '+(top?hesc(top.label)+' costs you the most time of the stations.':'')+'</div></div>';
  } else {
    h+='<div class="kl-hx-pred off"><small>Predicted finish</small><b>'+P.have+'<span> / 9</span></b><em>Log your 1 km run and all 8 stations to see your race time.</em></div>';
  }
  h+='</div>';
  return h+kelasHxPlanHTML()+kelasHxStationsHTML(div)+kelasHxPaceHTML(div);
}
function kelasHxStationsHTML(div){
  const open=Kelas.hxLog;
  let h=fsec('Stations',div?'Your best at '+div+'. Tap one to log a time.':'Pick your division above first.');
  h+='<div class="kl-hx-grid">'+HX_ST.concat([['sim','Full simulation','Simulation','8 km + 8 stations']]).map(x=>{
    const b=div?kelasHxBest(x[0],div):null, n=div?kelasHxList(x[0],div).length:0;
    return '<button class="kl-hx-st'+(open===x[0]?' on':'')+(b?'':' empty')+(x[0]==='sim'?' sim':'')+'" '+(div?'onclick="kelasHxOpen(\''+x[0]+'\')"':'disabled')+'>'+
      '<small>'+x[3]+'</small><span>'+x[2]+'</span><b>'+(b?hxClock(b):'—')+'</b>'+(n>1?'<em>'+n+' times</em>':'')+'</button>';
  }).join('')+'</div>';
  if(open && div) h+=kelasHxLogHTML(open,div);
  return h;
}
function kelasHxOpen(st){ Kelas.hxLog=Kelas.hxLog===st?null:st; renderKelas(); }
function kelasHxLogHTML(st,div){
  const L=kelasHxList(st,div), b=kelasHxBest(st,div), last=L.slice(0,8).reverse();
  const mx=last.length?Math.max.apply(null,last.map(r=>+r.s)):0, mn=last.length?Math.min.apply(null,last.map(r=>+r.s)):0;
  let h='<div class="kl-hx-log"><div class="kl-hx-lt"><b>'+hesc(kelasHxName(st))+'</b>'+(b?'<span>Best '+hxClock(b)+'</span>':'')+'</div>'+
    '<div class="kl-hx-in"><input id="kl-hxv" class="kl-in" inputmode="text" maxlength="8" placeholder="'+(st==='sim'?'h:mm:ss':'m:ss')+'">'+
    '<input id="kl-hxdt" class="kl-in" type="date" value="'+kelasDayKey(kelasNowMY())+'" max="'+kelasDayKey(kelasNowMY())+'">'+
    '<button class="bigbtn kl-go" onclick="kelasHxSave(\''+st+'\')"'+(Kelas.hxBusy?' disabled':'')+'>'+(Kelas.hxBusy?'…':'Save')+'</button></div>';
  if(last.length>1) h+='<div class="kl-hx-spark">'+last.map(r=>'<i class="'+(+r.s===b?'best':'')+'" style="height:'+(mx===mn?60:Math.round(25+(mx-r.s)/(mx-mn)*75))+'%" title="'+hxClock(r.s)+'"></i>').join('')+'</div>';
  if(L.length) h+='<div class="kl-hx-hist">'+L.slice(0,5).map(r=>'<div><span>'+kelasIBDate(r.d,true)+'</span><b>'+hxClock(r.s)+(+r.s===b?' <em>best</em>':'')+'</b>'+
      (r.id&&r.id!=='tmp'?'<button onclick="kelasHxDel(\''+r.id+'\')" aria-label="Delete">✕</button>':'')+'</div>').join('')+'</div>';
  if(st!=='sim') h+=kelasHxTargetsHTML(st);
  return h+'</div>';
}
function kelasHxSetDiv(v){ const p=kelasHxProf(); p.div=v; HF.save(); renderKelas(); }
function kelasHxSetRace(){
  const p=kelasHxProf(), el=$('kl-hxd'), v=el?el.value:'';
  if(!p.div){ toast('Pick your division first'); return; }
  if(v && /^\d{4}-\d{2}-\d{2}$/.test(v)) p.race=v; else if(!v) delete p.race;
  HF.save(); Kelas.hxSet=false; renderKelas();
}
async function kelasHxSave(st,val,day){
  const div=kelasHxDiv(); if(!div) return;
  const t=val!==undefined?val:(($('kl-hxv')||{}).value||''), secs=hxParse(t);
  const d=day||(($('kl-hxdt')||{}).value)||kelasDayKey(kelasNowMY());
  if(!secs){ toast(st==='sim'?'Type the time as h:mm:ss, e.g. 1:15:30':'Type the time as m:ss, e.g. 4:35'); return; }
  Kelas.hxBusy=true; renderKelas();
  try{
    const r=await kelasCall('hx_log',{station:st, secs:secs, div:div, date:d});
    if(!r||!r.ok) throw new Error(r&&r.error||'failed');
    if(Kelas.data){ Kelas.data.hyrox=[{id:r.id,st:st,s:secs,div:div,d:d}].concat(kelasHxRes()); kelasSave(); }
    if(r.pb){ if(typeof hfSound==='function') hfSound('bell'); toast('New best! 🔔 Posted to your HYROX group'); Kelas.cm=null; Kelas.hxB=null; }
    else toast(r.first?'Logged. Now beat it 💪':'Logged');
  }catch(e){ toast(e.message==='too_many'?'That is a lot of logging for one day. Try tomorrow.':'Could not save. Try again.'); }
  Kelas.hxBusy=false; renderKelas();
}
async function kelasHxDel(id){
  if(Kelas.hxDelAsk!==id){ Kelas.hxDelAsk=id; toast('Tap ✕ again to delete'); return; }
  Kelas.hxDelAsk=null;
  try{ await kelasCall('hx_delete',{id:id}); if(Kelas.data){ Kelas.data.hyrox=kelasHxRes().filter(r=>r.id!==id); kelasSave(); } Kelas.hxB=null; renderKelas(); }
  catch(e){ toast('Could not delete. Try again.'); }
}
/* the HYROX group: a board for each station, by division */
function kelasHxBoardHTML(C){
  const div=Kelas.hxBDiv||kelasHxDiv()||'Open Men', st=Kelas.hxBSt||'run', B=Kelas.hxB&&Kelas.hxB[div];
  if(!B && !Kelas.hxBBusy && !Kelas.hxBErr) setTimeout(()=>kelasHxBoardLoad(div),0);
  let h='<div class="kl-board"><div class="kl-bh"><b>Leaderboard</b></div>'+
    '<div class="kl-bkinds kl-bk4">'+kelasBoardKinds(C).map(k=>'<button class="'+(k[0]==='stations'?'on':'')+'" onclick="Kelas.cmKind=\''+k[0]+'\';renderKelas()">'+k[1]+'</button>').join('')+'</div>'+
    '<div class="kl-hx-bc"><select onchange="Kelas.hxBDiv=this.value;renderKelas()">'+HX_DIVS.map(v=>'<option'+(v===div?' selected':'')+'>'+v+'</option>').join('')+'</select></div>'+
    '<div class="kl-hx-bst">'+HX_ST.concat([['sim','','Simulation']]).map(x=>'<button class="'+(x[0]===st?'on':'')+'" onclick="Kelas.hxBSt=\''+x[0]+'\';renderKelas()">'+x[2]+'</button>').join('')+'</div>';
  if(!B) return h+'<div class="kl-none">'+(Kelas.hxBErr?'Could not load the board. <button class="kl-alt2" onclick="Kelas.hxBErr=false;renderKelas()">Try again</button>':'Loading…')+'</div></div>';
  const S=(B.boards||{})[st]||{}, top=S.top||[];
  if(!top.length) return h+'<div class="kl-none">No '+hesc(kelasHxName(st))+' times in '+hesc(div)+' yet. Log yours in Perform and take the top spot.</div></div>';
  const row=r=>'<div class="kl-br'+(r.me?' me':'')+'"><span class="kl-rk r'+r.r+'">'+r.r+'</span>'+kelasAv(r.ph,r.name,'bd',r.me)+
    '<span class="kl-bn">'+hesc(r.name)+(r.me?' <i>you</i>':'')+'</span><b>'+hxClock(r.s)+'</b><small></small></div>';
  h+=top.map(row).join('');
  if(S.me && !top.some(r=>r.me)) h+='<div class="kl-bsep">⋯</div>'+row({r:S.me.r,name:'You',s:S.me.s,me:true});
  return h+'<div class="kl-bfoot">Fastest time each, '+hesc(div)+' · '+S.people+' on this board</div></div>';
}
async function kelasHxBoardLoad(div){
  Kelas.hxBBusy=true; Kelas.hxBErr=false;
  try{ const r=await kelasCall('hx_board',{div:div}); Kelas.hxB=Kelas.hxB||{}; Kelas.hxB[div]=r&&r.ok?r:{boards:{}}; }
  catch(e){ Kelas.hxBErr=true; }
  Kelas.hxBBusy=false; if(Kelas.tab==='group') renderKelas();
}

/* ═══════════════ HYROX: from HITFAT Hybrid (17 Oct 2026) ═══════════════
   Seth: one app, everything in app.hitfat.io. Three things come over from
   hybrid.hitfat.io, its content unchanged (/hx/hyrox.json, read when
   Perform opens):
     the race plan   16 weeks: 4 of Prep, then Base, Pace, Accelerate,
                     Prime, Race; 5 days a week; PRO, OPEN or Beginner.
                     It follows the race date (race week = week 16), or
                     the day the member started it.
     Targets         three sessions for each station (and grip, engine),
                     with the coaching cue; in each station's log.
     PaceMe          a goal time turned into a run pace and station splits,
                     scaled from the member's own times when all are in.
   Hybrid's race-floor photos stay there: HITFAT+ uses studio photos. */
var HX_TGT={run:'run',ski:'ski',push:'sledpush',pull:'sledpull',bbj:'burpee',row:'row',carry:'farmers',lunge:'lunge',wb:'wallball'};
var HX_DEF_KEY={ski:'ski',push:'sledpush',pull:'sledpull',bbj:'burpee',row:'row',carry:'farmers',lunge:'lunge',wb:'wallball'};
var HX_LVLS=[['Beginner','Beginner','New to lifting, 10K over 1 hour'],['OPEN','Open','Some training behind you'],['PRO','Pro','Strong lifter, 10K under 40–45 min']];
function kelasHxData(){
  if(Kelas.hxData || Kelas.hxDataBusy || typeof fetch!=='function') return Kelas.hxData||null;
  Kelas.hxDataBusy=true;
  fetch('/hx/hyrox.json').then(r=>r.json()).then(d=>{ Kelas.hxData=d; }).catch(()=>{}).then(()=>{ Kelas.hxDataBusy=false; if(Kelas.tab==='progress') renderKelas(); });
  return null;
}
function kelasHxLvl(){ const p=kelasHxProf(); return p.lvl||(/^Pro/.test(p.div||'')?'PRO':'OPEN'); }
/* where the member is in the 16 weeks: {n:1..16} or {before:weeks} or null */
function kelasHxWeek(){
  const p=kelasHxProf(), today=Date.parse(kelasDayKey(kelasNowMY())+'T00:00:00Z');
  if(p.race){
    const d=Math.round((Date.parse(p.race+'T00:00:00Z')-today)/864e5); if(d<0) return null;
    const out=Math.floor(d/7)+1, n=16-out+1;
    return n<1?{before:out-16, from:new Date(Date.parse(p.race+'T00:00:00Z')-(16*7-1)*864e5).toISOString().slice(0,10)}:{n:n};
  }
  if(p.start){ const n=Math.floor((today-Date.parse(p.start+'T00:00:00Z'))/(7*864e5))+1; return n>=1&&n<=16?{n:n}:null; }
  return null;
}
function kelasHxPlanWeek(D,n){ const L=kelasHxLvl(); return n<=4?D.prep[L][n-1]:D.levels[L].weeks[n-5]; }
function kelasHxPlanHTML(){
  const D=kelasHxData(), p=kelasHxProf(), W=kelasHxWeek();
  let h=fsec('Race plan',"16 weeks to race day, from HITFAT Hybrid.");
  if(!D) return h+'<div class="kl-none">Loading the plan…</div>';
  h+='<div class="kl-hxp"><div class="kl-hxp-l">'+HX_LVLS.map(l=>'<button class="'+(kelasHxLvl()===l[0]?'on':'')+'" onclick="kelasHxSetLvl(\''+l[0]+'\')"><b>'+l[1]+'</b><small>'+l[2]+'</small></button>').join('')+'</div>';
  if(!W){
    return h+'<div class="kl-hxp-0">'+(p.race?'Your race is past. Set the next one with Edit above.':'No race date? Start the 16 weeks from today.')+
      (p.race?'':'<button class="bigbtn kl-go" onclick="kelasHxStartPlan()">Start the plan today</button>')+'</div></div>';
  }
  if(W.before) return h+'<div class="kl-hxp-0">Your plan starts on <b>'+kelasIBDate(W.from)+'</b>, 16 weeks out. Until then: easy runs and clean technique on every station.</div></div>';
  const wk=kelasHxPlanWeek(D,W.n); if(!wk) return h+'</div>';
  const done=p.done||{}, nd=wk.days.filter((x,i)=>done['w'+W.n+'d'+(i+1)]).length, open=Kelas.hxDay;
  h+='<div class="kl-hxp-w"><div><small>Week '+W.n+' of 16</small><b>'+hesc(wk.block)+'</b></div><span>'+nd+' / '+wk.days.length+' done</span></div>'+
    '<div class="kl-hxp-bar">'+Array.from({length:16},(x,i)=>'<i class="'+(i+1<W.n?'past':i+1===W.n?'now':'')+'"></i>').join('')+'</div>';
  h+=wk.days.map((x,i)=>{ const k='w'+W.n+'d'+(i+1), on=open===k, dn=!!done[k];
    return '<div class="kl-hxd'+(dn?' done':'')+(on?' on':'')+'"><button class="kl-hxd-h" onclick="Kelas.hxDay=Kelas.hxDay===\''+k+'\'?null:\''+k+'\';renderKelas()">'+
      '<span class="kl-hxd-n">'+(dn?glyph('check'):'D'+(i+1))+'</span><span class="kl-hxd-t"><b>'+hesc(x.type.replace(/^HYROX\s*/,'')||'Session')+'</b><small>'+hesc(String(x.workout).split('\n')[0])+'</small></span><i>'+(on?'−':'+')+'</i></button>'+
      (on?'<div class="kl-hxd-b"><div class="kl-hxd-w">'+hesc(x.workout)+'</div>'+(x.notes?'<div class="kl-hxd-c">'+hesc(x.notes)+'</div>':'')+
        '<button class="kl-alt2" onclick="kelasHxDone(\''+k+'\')">'+(dn?'Mark not done':'Mark done')+'</button></div>':'')+'</div>';
  }).join('');
  return h+'<div class="kl-fine2">Do these around your HYROX classes at HQ: a class counts as the session it is closest to.</div></div>';
}
function kelasHxSetLvl(l){ kelasHxProf().lvl=l; HF.save(); renderKelas(); }
function kelasHxStartPlan(){ kelasHxProf().start=kelasDayKey(kelasNowMY()); HF.save(); renderKelas(); }
function kelasHxDone(k){
  const p=kelasHxProf(); p.done=p.done||{};
  if(p.done[k]) delete p.done[k]; else { p.done[k]=kelasDayKey(kelasNowMY()); if(typeof hfSound==='function') hfSound('pop'); }
  HF.save(); renderKelas();
}
/* Targets: the station's own sessions, in its log */
function kelasHxTargetsHTML(st){
  const D=kelasHxData(), T=D&&D.targets&&D.targets[HX_TGT[st]]; if(!T) return '';
  return '<div class="kl-hxt2"><div class="kl-hxt2-h"><b>Train this station</b><small>'+hesc(T.tag||'')+'</small></div>'+
    T.workouts.map((w,i)=>{ const k=st+i, on=Kelas.hxTgt===k;
      return '<div class="kl-hxd'+(on?' on':'')+'"><button class="kl-hxd-h" onclick="Kelas.hxTgt=Kelas.hxTgt===\''+k+'\'?null:\''+k+'\';renderKelas()">'+
        '<span class="kl-hxd-n">'+(w.mins||'')+'<em>min</em></span><span class="kl-hxd-t"><b>'+hesc(w.title)+'</b><small>'+hesc(w.focus||'')+'</small></span><i>'+(on?'−':'+')+'</i></button>'+
        (on?'<div class="kl-hxd-b"><div class="kl-hxd-w">'+hesc(w.workout)+'</div>'+(w.notes?'<div class="kl-hxd-c">'+hesc(w.notes)+'</div>':'')+'</div>':'')+'</div>';
    }).join('')+'</div>';
}
/* PaceMe: a goal time, the paces to hit it */
function kelasHxPace(goal,div){
  const G=hxParse(goal); if(!G) return null;
  const P=kelasHxPredict(div), D=kelasHxData(), def=(D&&D.defaults)||{};
  let run, rox, sts;
  if(P.done){
    const f=G/P.total, part=k=>(P.parts.filter(p=>p.k===k)[0]||{}).s||0;
    run=part('run')*f; rox=part('rox')*f;
    sts=HX_ST.slice(1).map(x=>({k:x[0], label:x[1], s:part(x[0])*f}));
  } else {
    run=G*0.55; rox=G*0.07;
    const tot=HX_ST.slice(1).reduce((a,x)=>a+(def[HX_DEF_KEY[x[0]]]||240),0);
    sts=HX_ST.slice(1).map(x=>({k:x[0], label:x[1], s:G*0.38*(def[HX_DEF_KEY[x[0]]]||240)/tot}));
  }
  return {goal:G, pace:run/8, run:run, rox:rox, stations:sts, mine:P.done};
}
function kelasHxPaceHTML(div){
  const p=kelasHxProf(), R=p.goal?kelasHxPace(p.goal,div):null;
  let h=fsec('PaceMe','Your goal time, as paces to hit.');
  h+='<div class="kl-hxpm"><div class="kl-hxpm-in"><input id="kl-hxg" class="kl-in" maxlength="8" placeholder="Goal, e.g. 1:15:00" value="'+hesc(p.goal||'')+'">'+
    '<button class="bigbtn kl-go" onclick="kelasHxSetGoal()">Plan</button></div>';
  if(R){
    h+='<div class="kl-hxpm-top"><div><b>'+hxClock(R.pace)+'</b><small>run / km</small></div><div><b>'+hxClock(R.stations.reduce((a,x)=>a+x.s,0))+'</b><small>stations</small></div><div><b>'+hxClock(R.rox)+'</b><small>Roxzone</small></div></div>'+
      R.stations.map(x=>'<div class="kl-hx-row"><span>'+hesc(x.label)+'</span><b>'+hxClock(x.s)+'</b><small></small></div>').join('')+
      '<div class="kl-hx-fine" style="color:var(--dim)">'+(R.mine?'Scaled from your own station times.':'A standard split. Log your 1 km and all 8 stations to make it yours.')+'</div>';
  }
  return h+'</div>';
}
function kelasHxSetGoal(){
  const v=(($('kl-hxg')||{}).value||'').trim();
  if(v && !hxParse(v)){ toast('Type the goal as h:mm:ss, e.g. 1:15:00'); return; }
  const p=kelasHxProf(); if(v) p.goal=v; else delete p.goal; HF.save(); renderKelas();
}

/* ═══════════════ Ladies (17 Oct 2026) ═══════════════
   Seth: Ladies2Fit gets its own space (096), as HYROX did, and four things
   of its own:
     the cycle     a member logs her period; the app shows the day, the
                   phase and a training note for it, and Bara is gentle on
                   period days. Private: it stays in her own HITFAT+ data
                   (HF.data.kelas.cyc) and never goes to HITFAT OS or the
                   coach. General guidance, not medical advice.
     measurements  waist, hip, thigh, arm, with the change since the first;
                   progress photos in a private bucket only she can open
                   (43-progress-photos.sql), and a before/after card that
                   shows centimetres, never weight.
     Ladies Burn 30  open to her with the class (All Access), for the
                   days without class.
     the challenge 12 Ladies classes a month; the group sees who made it
                   (096 posts it when the 12th lands). */
var LX_TARGET=12, MX_TARGET=10;
function kelasChTarget(){ return kelasSpace()==='mens'?MX_TARGET:LX_TARGET; }
function kelasChLabel(){ return kelasSpace()==='mens'?'Mens':'Ladies'; }
var LX_PH={period:['Period','#DB2777','Go by feel today. Class is fine if you feel good; lighter loads or mobility if you don’t. Water and iron-rich food help.'],
  follicular:['Follicular','#F59E0B','Energy usually climbs now. A good week to push the pace and chase a PR.'],
  ovulation:['Ovulation','#10B981','Many women feel strongest here. Warm up well and keep landings and knees controlled.'],
  luteal:['Luteal','#8B5CF6','Energy can dip toward the end. Keep the habit going: steady effort beats max effort. Cravings are normal.']};
function kelasCycData(){ const k=HF.data.kelas||(HF.data.kelas={}); if(!k.cyc||typeof k.cyc!=='object') k.cyc={}; return k.cyc; }
function kelasCyc(){
  const c=kelasCycData(), st=(c.starts||[]).slice().sort(); if(!c.on||!st.length) return null;
  const today=kelasDayKey(kelasNowMY()), T=d=>Date.parse(d+'T00:00:00Z');
  const past=st.filter(d=>d<=today); if(!past.length) return null;
  const gaps=[]; for(let i=1;i<past.length;i++){ const g=Math.round((T(past[i])-T(past[i-1]))/864e5); if(g>=18&&g<=45) gaps.push(g); }
  const len=gaps.length?Math.round(gaps.slice(-3).reduce((a,b)=>a+b,0)/gaps.slice(-3).length):(+c.len||28), plen=+c.plen||5;
  const last=past[past.length-1], day=Math.round((T(today)-T(last))/864e5)+1, ov=len-14;
  const phase=day<=plen?'period':day<ov-1?'follicular':day<=ov+1?'ovulation':'luteal';
  const next=new Date(T(last)+len*864e5).toISOString().slice(0,10);
  return {day:day, len:len, plen:plen, phase:phase, next:next, late:day>len?day-len:0, last:last};
}
function kelasCycHTML(){
  const c=kelasCycData(), C=kelasCyc();
  if(!c.on) return '<div class="kl-cyc off"><div><b>Track your cycle</b><small>Train with your body, not against it. Private: only you see it.</small></div>'+
    '<button onclick="kelasCycSetup()">Start</button></div>';
  if(Kelas.cycEdit||!C) return '<div class="kl-cyc"><div class="kl-cyc-k">Your cycle · private</div>'+
    '<label>First day of your last period<input type="date" id="kl-cy-d" value="'+hesc((c.starts||[]).slice(-1)[0]||kelasDayKey(kelasNowMY()))+'" max="'+kelasDayKey(kelasNowMY())+'"></label>'+
    '<div class="kl-cyc-2"><label>Cycle length<input id="kl-cy-l" inputmode="numeric" value="'+(c.len||28)+'"></label><label>Period length<input id="kl-cy-p" inputmode="numeric" value="'+(c.plen||5)+'"></label></div>'+
    '<div class="kl-cyc-b"><button class="go" onclick="kelasCycSave()">Save</button><button onclick="kelasCycOff()">Turn off</button></div>'+
    '<div class="kl-cyc-f">Only you see this. It stays in your HITFAT+ account; your coach and HITFAT OS never get it. General guidance, not medical advice.</div></div>';
  const P=LX_PH[C.phase], segs=[['period',C.plen],['follicular',Math.max(0,C.len-14-1-1-C.plen)],['ovulation',3],['luteal',Math.max(0,C.len-(C.len-14+1))]];
  const tot=segs.reduce((a,x)=>a+x[1],0)||C.len, pos=Math.min(100,(Math.min(C.day,C.len)-.5)/tot*100);
  return '<div class="kl-cyc"><div class="kl-cyc-top"><div><div class="kl-cyc-k">Your cycle · private</div><b>Day '+C.day+'</b> <span style="color:'+P[1]+'">'+P[0]+'</span></div>'+
    '<button class="kl-cyc-e" onclick="Kelas.cycEdit=true;renderKelas()">Edit</button></div>'+
    '<div class="kl-cyc-bar">'+segs.map(x=>'<i style="flex:'+x[1]+';background:'+LX_PH[x[0]][1]+'"></i>').join('')+'<em style="left:'+pos.toFixed(1)+'%"></em></div>'+
    '<div class="kl-cyc-t">'+P[2]+'</div>'+
    '<div class="kl-cyc-n"><span>'+(C.late?'Period expected '+C.late+' day'+(C.late===1?'':'s')+' ago':'Next period around <b>'+kelasIBDate(C.next,true)+'</b>')+'</span>'+
    '<button onclick="kelasCycToday()">'+(C.phase==='period'&&C.day<=2?'Logged':'Period started today')+'</button></div></div>';
}
function kelasCycSetup(){ const c=kelasCycData(); c.on=true; Kelas.cycEdit=true; HF.save(); renderKelas(); }
function kelasCycOff(){ const c=kelasCycData(); c.on=false; Kelas.cycEdit=false; HF.save(); renderKelas(); }
function kelasCycSave(d,len,plen){
  const c=kelasCycData();
  d=d||(($('kl-cy-d')||{}).value); len=+(len||(($('kl-cy-l')||{}).value)); plen=+(plen||(($('kl-cy-p')||{}).value));
  if(!/^\d{4}-\d{2}-\d{2}$/.test(d||'')){ toast('Pick the first day of your last period'); return; }
  c.len=Math.max(21,Math.min(40,len||28)); c.plen=Math.max(2,Math.min(9,plen||5)); c.on=true;
  c.starts=Array.from(new Set((c.starts||[]).concat([d]))).sort().slice(-24);
  Kelas.cycEdit=false; HF.save(); renderKelas();
}
function kelasCycToday(){
  const c=kelasCycData(), t=kelasDayKey(kelasNowMY()), C=kelasCyc();
  if(C && C.phase==='period' && C.day<=2) return;
  c.starts=Array.from(new Set((c.starts||[]).concat([t]))).sort().slice(-24); HF.save();
  toast('Logged. Go easy on yourself today 🤍'); renderKelas();
}
/* Today (Ladies): the cycle, Ladies Burn 30, the challenge */
function kelasLxTodayHTML(){
  let h=kelasCycHTML();
  h+=kelasLxChallengeHTML(false);
  const n=typeof lbDone==='function'?lbDone():0, tot=(typeof LB30_DAYS!=='undefined'&&LB30_DAYS.length)||30;
  h+='<button class="kl-lb" onclick="openProgram(\'lad4\')"><span class="kl-lb-ic">'+glyph('flame')+'</span><span class="kl-lb-t"><b>Ladies Burn 30</b>'+
     '<small>For the days without class · up to 20 min at home · included with your class</small></span><em>'+(n?n+'/'+tot:'Open')+'</em></button>';
  return h;
}
/* the month's challenge: 12 Ladies classes */
function kelasLxChallenge(){
  const n=kelasThisMonth(), now=kelasNowMY(), y=now.getUTCFullYear(), m=now.getUTCMonth();
  const dim=new Date(Date.UTC(y,m+1,0)).getUTCDate(), left=dim-now.getUTCDate();
  /* the months already won (the last four, from the kiosk) */
  const by={}; kelasIns().forEach(d=>{ const k=kelasDayKey(d); (by[k.slice(0,7)]=by[k.slice(0,7)]||new Set()).add(k); });
  const T=kelasChTarget(), months=[]; for(let i=3;i>=1;i--){ const k=new Date(Date.UTC(y,m-i,1)).toISOString().slice(0,7); months.push({k:k, won:!!(by[k]&&by[k].size>=T)}); }
  return {n:n, target:T, left:left, done:n>=T, name:KL_MONTHS[m], months:months, label:kelasChLabel()};
}
function kelasLxChallengeHTML(full){
  const X=kelasLxChallenge(), pct=Math.min(100,Math.round(X.n/X.target*100)), need=Math.max(0,X.target-X.n);
  let h='<div class="kl-lxc'+(X.done?' done':'')+(kelasSpace()==='mens'?' mx':'')+'"><div class="kl-lxc-h"><div><small>'+X.name+' '+X.label+' Challenge</small><b>'+X.n+'<span> / '+X.target+' classes</span></b></div>'+
    '<span class="kl-lxc-badge">'+(X.done?'🏅 Done':glyph('trophy'))+'</span></div>'+
    '<div class="kl-lxc-bar"><i style="width:'+pct+'%"></i></div>'+
    '<div class="kl-lxc-s">'+(X.done?'Challenge complete! Your group saw it. Keep going, every class still counts.'
      :need+' more to go · '+X.left+' day'+(X.left===1?'':'s')+' left this month'+(need>0&&X.left>0?' · about '+Math.ceil(need/Math.max(1,X.left/7))+' a week':''))+'</div>';
  if(full) h+='<div class="kl-lxc-m">'+X.months.map(x=>'<span class="'+(x.won?'won':'')+'">'+(x.won?'🏅':'○')+'<small>'+KL_MONTHS[+x.k.slice(5,7)-1].slice(0,3)+'</small></span>').join('')+
    '<span class="now'+(X.done?' won':'')+'">'+(X.done?'🏅':pct+'%')+'<small>'+X.name.slice(0,3)+'</small></span></div>';
  return h+'</div>';
}
function kelasLxGroupHTML(C){
  const top=((C.month||{}).top)||[], done=top.filter(r=>r.n>=kelasChTarget());
  return kelasLxChallengeHTML(false)+
    (done.length?'<div class="kl-lxg"><b>Made it this month</b><div>'+done.map(r=>kelasAv(r.ph,r.name,'sm',r.me)).join('')+'</div><small>'+done.length+' of the group</small></div>':'');
}
/* measurements and progress photos */
var LX_MEAS=[['waist','Waist'],['hip','Hip'],['thigh','Thigh'],['arm','Arm']];
var MX_MEAS=[['waist','Waist'],['chest','Chest'],['arm','Arm'],['thigh','Thigh']];
var PT_MEAS=[['waist','Waist'],['hip','Hip'],['chest','Chest'],['arm','Arm']];
function kelasMeasSet(){ return kelasSpace()==='mens'?MX_MEAS:kelasSpace()==='pt'?PT_MEAS:LX_MEAS; }
function kelasLxMeas(){ const k=HF.data.kelas||(HF.data.kelas={}); if(!Array.isArray(k.meas)) k.meas=[]; return k.meas; }
function kelasLxPics(){ const k=HF.data.kelas||(HF.data.kelas={}); if(!Array.isArray(k.pics)) k.pics=[]; return k.pics; }
function kelasLxBodyHTML(){
  const M=kelasLxMeas().slice().sort((a,b)=>String(a.d).localeCompare(String(b.d))), first=M[0], last=M[M.length-1];
  let h=fsec('Measurements','Centimetres, private to you.');
  h+='<div class="kl-lxm">';
  if(last) h+='<div class="kl-lxm-g">'+kelasMeasSet().map(x=>{ const v=last[x[0]], f=first&&first[x[0]], d=(v!=null&&f!=null&&first!==last)?Math.round((v-f)*10)/10:null;
    return '<div><small>'+x[1]+'</small><b>'+(v!=null?v:'—')+'</b>'+(d!==null?'<em class="'+(d<0?'down':d>0?'up':'')+'">'+(d>0?'+':'')+d+'</em>':'')+'</div>'; }).join('')+'</div>'+
    (kelasSpace()==='mens'&&last.waist!=null?'<div class="kl-mxw '+(last.waist<90?'ok':'hi')+'"><b>'+(last.waist<90?'Waist under 90 cm':'Waist 90 cm or more')+'</b><span>'+
      (last.waist<90?'Inside the healthy range for Asian men. Keep it there.':'Above 90 cm, health risk rises for Asian men (heart, diabetes). Every cm down counts.')+'</span></div>':'')+
    '<div class="kl-lxm-s">'+(first!==last?'Since '+kelasIBDate(first.d,true)+' · '+M.length+' entries':'First entry '+kelasIBDate(last.d,true))+'</div>';
  if(Kelas.lxAdd || !last) h+='<div class="kl-lxm-in">'+kelasMeasSet().map(x=>'<label>'+x[1]+'<input id="kl-lxm-'+x[0]+'" inputmode="decimal" placeholder="cm" value="'+(last&&last[x[0]]!=null?last[x[0]]:'')+'"></label>').join('')+
      '</div><button class="bigbtn kl-go kl-lxm-go" onclick="kelasLxSave()">Save today</button>';
  else h+='<button class="kl-alt2" onclick="Kelas.lxAdd=true;renderKelas()">'+glyph('plus')+' Measure again</button>';
  h+='</div>';
  /* photos */
  const P=kelasLxPics().slice().sort((a,b)=>String(a.d).localeCompare(String(b.d)));
  if(P.length && !Kelas.lxUrlsBusy && P.some(p=>!(Kelas.lxUrls||{})[p.path])) setTimeout(kelasLxSign,0);
  h+=fsec('Progress photos','Only you can open them.');
  h+='<div class="kl-lxp"><input type="file" id="kl-lxf" accept="image/*" style="display:none" onchange="kelasLxPhoto(this)">'+
    '<div class="kl-lxp-g">'+P.slice(-6).reverse().map(p=>{ const u=(Kelas.lxUrls||{})[p.path];
      return '<div class="kl-lxp-i">'+(u?'<img src="'+hesc(u)+'" alt="" onclick="kelasCmZoom(this.src)">':'<span></span>')+'<small>'+kelasIBDate(p.d,true)+'</small>'+
        '<button onclick="kelasLxDel(\''+hesc(p.path)+'\')" aria-label="Delete">✕</button></div>'; }).join('')+
    '<button class="kl-lxp-add" onclick="$(\'kl-lxf\').click()"'+(Kelas.lxBusy?' disabled':'')+'>'+(Kelas.lxBusy?'…':glyph('photo')+'<small>Add</small>')+'</button></div>'+
    (P.length>=2?'<button class="bigbtn kl-go kl-lxp-sh" onclick="kelasLxShare()">'+glyph('share')+' Before & after card</button>':'<div class="kl-lxp-s">Take one now and another in 4 weeks, same spot, same light.</div>')+'</div>';
  return h;
}
function kelasLxSave(vals){
  const e={d:kelasDayKey(kelasNowMY())}; let any=false;
  kelasMeasSet().forEach(x=>{ const raw=vals?vals[x[0]]:(($('kl-lxm-'+x[0])||{}).value); const v=parseFloat(String(raw||'').replace(',','.'));
    if(isFinite(v) && v>=10 && v<=250){ e[x[0]]=Math.round(v*10)/10; any=true; } });
  if(!any){ toast('Type at least one measurement in cm'); return; }
  const M=kelasLxMeas().filter(x=>x.d!==e.d); M.push(e); HF.data.kelas.meas=M.slice(-120);
  Kelas.lxAdd=false; HF.save(); if(typeof hfSound==='function') hfSound('pop'); toast('Saved'); renderKelas();
}
async function kelasLxSign(){
  const P=kelasLxPics(); if(!P.length||typeof sb==='undefined'||!sb) return;
  Kelas.lxUrlsBusy=true;
  try{ const r=await sb.storage.from('progress').createSignedUrls(P.map(p=>p.path),3600); Kelas.lxUrls=Kelas.lxUrls||{};
    (r.data||[]).forEach(x=>{ if(x&&x.signedUrl) Kelas.lxUrls[x.path]=x.signedUrl; }); }catch(e){}
  Kelas.lxUrlsBusy=false; if(Kelas.tab==='body') renderKelas();
}
function kelasLxPhoto(inp){
  const f=inp&&inp.files&&inp.files[0]; if(!f) return;
  if(typeof sb==='undefined'||!sb||!HF.userId){ toast('Sign in first'); return; }
  const rd=new FileReader();
  rd.onload=()=>{ const img=new Image();
    img.onload=()=>{ const mx=1280, sc=Math.min(1,mx/Math.max(img.width,img.height)), cv=document.createElement('canvas');
      cv.width=Math.round(img.width*sc); cv.height=Math.round(img.height*sc); cv.getContext('2d').drawImage(img,0,0,cv.width,cv.height);
      cv.toBlob(b=>kelasLxUpload(b),'image/jpeg',.85); };
    img.src=rd.result; };
  rd.readAsDataURL(f);
}
async function kelasLxUpload(blob){
  if(!blob) return; Kelas.lxBusy=true; renderKelas();
  try{
    const path=HF.userId+'/'+Date.now().toString(36)+Math.random().toString(36).slice(2,7)+'.jpg';
    const up=await sb.storage.from('progress').upload(path,blob,{contentType:'image/jpeg'}); if(up.error) throw up.error;
    kelasLxPics().push({d:kelasDayKey(kelasNowMY()), path:path}); HF.save(); Kelas.lxUrls=Kelas.lxUrls||{};
    toast('Photo saved. Only you can see it.');
  }catch(e){ toast('Could not save the photo. Try again.'); }
  Kelas.lxBusy=false; kelasLxSign(); renderKelas();
}
async function kelasLxDel(path){
  if(Kelas.lxDelAsk!==path){ Kelas.lxDelAsk=path; toast('Tap ✕ again to delete the photo'); return; }
  Kelas.lxDelAsk=null;
  try{ await sb.storage.from('progress').remove([path]); }catch(e){}
  HF.data.kelas.pics=kelasLxPics().filter(p=>p.path!==path); HF.save(); renderKelas();
}
/* before & after: the first photo and the latest, the centimetres between */
function kelasLxShare(){
  const P=kelasLxPics().slice().sort((a,b)=>String(a.d).localeCompare(String(b.d))); if(P.length<2) return;
  const a=P[0], b=P[P.length-1], U=Kelas.lxUrls||{};
  if(!U[a.path]||!U[b.path]){ toast('Photos still loading. Try again in a moment.'); kelasLxSign(); return; }
  const M=kelasLxMeas().slice().sort((x,y)=>String(x.d).localeCompare(String(y.d))), f=M[0], l=M[M.length-1];
  const ch=f&&l&&f!==l?kelasMeasSet().map(x=>(f[x[0]]!=null&&l[x[0]]!=null)?[x[1],Math.round((l[x[0]]-f[x[0]])*10)/10]:null).filter(Boolean):[];
  const wks=Math.max(1,Math.round((Date.parse(b.d)-Date.parse(a.d))/(7*864e5)));
  /* the card is drawn at once, so both photos load first */
  const ld=src=>new Promise(res=>{ const im=new Image(); im.crossOrigin='anonymous'; im.onload=()=>res(im); im.onerror=()=>res(null); im.src=src; });
  toast('Making your card…');
  Promise.all([ld(U[a.path]),ld(U[b.path])]).then(ims=>{
    if(!ims[0]||!ims[1]){ toast('Could not load the photos. Try again.'); return; }
    Kelas.share={kind:'lx', sp:kelasSpace(), ia:ims[0], ib:ims[1], da:a.d, db:b.d, wks:wks, ch:ch}; openShare('kelas');
  });
}
function kelasDrawLx(x,W,H,cx,F,S){
  const M=S.sp==='mens', g=x.createLinearGradient(0,0,0,H);
  if(M){ g.addColorStop(0,'#3B82F6'); g.addColorStop(.5,'#1D4ED8'); g.addColorStop(1,'#172554'); }
  else { g.addColorStop(0,'#F472B6'); g.addColorStop(.5,'#DB2777'); g.addColorStop(1,'#831843'); }
  x.fillStyle=g; x.fillRect(0,0,W,H);
  x.fillStyle='#FFFFFF'; x.font=F(900,64); x.fillText('HITFAT+',cx,200);
  x.fillStyle='rgba(255,255,255,.88)'; x.font=F(800,30); _spaced(x,(M?'MENS2FIT':'LADIES2FIT')+' · '+S.wks+' WEEK'+(S.wks===1?'':'S'),cx,256,6);
  const pw=450, ph=760, y=340;
  [[S.ia,cx-pw-15,'BEFORE',S.da],[S.ib,cx+15,'NOW',S.db]].forEach(p=>{
    const im=p[0], px=p[1];
    if(im){ x.save(); _rr(x,px,y,pw,ph,36); x.clip();
      const r=Math.max(pw/im.width,ph/im.height), w=im.width*r, h=im.height*r; x.drawImage(im,px+(pw-w)/2,y+(ph-h)/2,w,h); x.restore(); }
    x.fillStyle='rgba(255,255,255,.95)'; x.font=F(900,34); x.fillText(p[2],px+pw/2,y+ph+56);
    x.fillStyle='rgba(255,255,255,.75)'; x.font=F(700,26);
    x.fillText(new Date(p[3]+'T00:00:00Z').toLocaleDateString('en-MY',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}),px+pw/2,y+ph+94);
  });
  const lines=(S.ch||[]).filter(c=>c[1]!==0).slice(0,4);
  if(lines.length){ const by=y+ph+150; x.fillStyle='#FFFFFF'; _rr(x,cx-420,by,840,130,36); x.fill();
    lines.forEach((c,i)=>{ const sx=cx-420+840/(lines.length*2)*(2*i+1);
      x.fillStyle=M?'#1D4ED8':'#DB2777'; x.font=F(900,48); x.fillText((c[1]>0?'+':'')+c[1]+' cm',sx,by+70); x.fillStyle='#55555C'; x.font=F(700,24); x.fillText(c[0],sx,by+106); }); }
  x.fillStyle='rgba(255,255,255,.8)'; x.font=F(700,34); x.fillText('app.hitfat.io',cx,H-110);
}

/* ═══════════════ Mens (17 Oct 2026) ═══════════════
   Seth: Mens2Fit gets its own space (097) and four things of its own:
     strength      the main lifts, weight × reps, the estimated 1RM (Epley:
                   kg × (1 + reps/30)); a new best rings the bell and goes
                   to the Mens group; a strength board in the group.
     measurements  waist, chest, arm, thigh, and the waist against 90 cm,
                   the line health guidance draws for Asian men; private
                   progress photos and a before/after card without weight
                   (shared with Ladies' code).
     Men's Body Reset  open with the class, for the days without class.
     the challenge 10 Mens classes a month (Mens2Fit is 3 a week). */
var MX_LIFTS=[['bench','Bench Press'],['squat','Back Squat'],['deadlift','Deadlift'],['ohp','Overhead Press'],['pullup','Weighted Pull-up']];
function kelasMxRes(){ return (Kelas.data&&Array.isArray(Kelas.data.strength))?Kelas.data.strength:[]; }
function kelasMxList(l){ return kelasMxRes().filter(r=>r.l===l).sort((a,b)=>String(b.d).localeCompare(String(a.d))); }
function kelasMxBest(l){ const a=kelasMxList(l); return a.length?a.reduce((b,r)=>(+r.e>+b.e?r:b),a[0]):null; }
function kelasE1rm(kg,reps){ kg=+kg; reps=+reps; return Math.round((reps===1?kg:kg*(1+reps/30))*10)/10; }
function kelasMxTodayHTML(){
  let h=kelasLxChallengeHTML(false);
  h+='<button class="kl-lb mx" onclick="openProgram(\'men6\')"><span class="kl-lb-ic">'+glyph('workout')+'</span><span class="kl-lb-t"><b>Men’s Body Reset</b>'+
     '<small>For the days without class · 6 weeks · included with your class</small></span><em>Open</em></button>';
  return h;
}
function kelasMxStrengthHTML(){
  const open=Kelas.mxLift;
  let h=fsec('Strength','Your best lifts, as an estimated 1 rep max.');
  h+='<div class="kl-mx-grid">'+MX_LIFTS.map(x=>{ const b=kelasMxBest(x[0]);
    return '<button class="kl-mx-l'+(open===x[0]?' on':'')+(b?'':' empty')+'" onclick="Kelas.mxLift=Kelas.mxLift===\''+x[0]+'\'?null:\''+x[0]+'\';renderKelas()">'+
      '<span>'+x[1]+'</span><b>'+(b?kelasF(b.e)+'<i> kg</i>':'—')+'</b><small>'+(b?kelasF(b.kg)+' kg × '+b.r:'Log a set')+'</small></button>'; }).join('')+'</div>';
  if(open) h+=kelasMxLogHTML(open);
  return h;
}
function kelasMxLogHTML(l){
  const L=kelasMxList(l), b=kelasMxBest(l), last=L.slice(0,8).reverse();
  const mx=last.length?Math.max.apply(null,last.map(r=>+r.e)):0, mn=last.length?Math.min.apply(null,last.map(r=>+r.e)):0;
  let h='<div class="kl-hx-log"><div class="kl-hx-lt"><b>'+hesc((MX_LIFTS.filter(x=>x[0]===l)[0]||[])[1]||l)+'</b>'+(b?'<span>Best '+kelasF(b.e)+' kg</span>':'')+'</div>'+
    '<div class="kl-mx-in"><input id="kl-mxkg" class="kl-in" inputmode="decimal" placeholder="kg"><span>×</span><input id="kl-mxr" class="kl-in" inputmode="numeric" placeholder="reps">'+
    '<button class="bigbtn kl-go" onclick="kelasMxSave(\''+l+'\')"'+(Kelas.mxBusy?' disabled':'')+'>'+(Kelas.mxBusy?'…':'Save')+'</button></div>'+
    '<div class="kl-mx-f">The heaviest set you did today. Up to 10 reps estimates best; 1 rep is the real thing.</div>';
  if(last.length>1) h+='<div class="kl-hx-spark">'+last.map(r=>'<i class="'+(b&&r.id===b.id?'best':'')+'" style="height:'+(mx===mn?60:Math.round(25+(r.e-mn)/(mx-mn)*75))+'%"></i>').join('')+'</div>';
  if(L.length) h+='<div class="kl-hx-hist">'+L.slice(0,5).map(r=>'<div><span>'+kelasIBDate(r.d,true)+' · '+kelasF(r.kg)+' kg × '+r.r+'</span><b>'+kelasF(r.e)+(b&&r.id===b.id?' <em>best</em>':'')+'</b>'+
      (r.id&&r.id!=='tmp'?'<button onclick="kelasMxDel(\''+r.id+'\')" aria-label="Delete">✕</button>':'')+'</div>').join('')+'</div>';
  return h+'</div>';
}
async function kelasMxSave(l,kgv,repsv){
  const kg=parseFloat(String(kgv!==undefined?kgv:(($('kl-mxkg')||{}).value||'')).replace(',','.')), reps=parseInt(repsv!==undefined?repsv:(($('kl-mxr')||{}).value||''),10);
  if(!(kg>=0&&kg<=500)||!(reps>=1&&reps<=30)){ toast('Type the weight in kg and the reps (1–30)'); return; }
  Kelas.mxBusy=true; renderKelas();
  try{
    const r=await kelasCall('st_log',{lift:l, kg:kg, reps:reps, date:kelasDayKey(kelasNowMY())});
    if(!r||!r.ok) throw new Error(r&&r.error||'failed');
    if(Kelas.data){ Kelas.data.strength=[{id:r.id,l:l,kg:kg,r:reps,e:r.e1rm,d:kelasDayKey(kelasNowMY())}].concat(kelasMxRes()); kelasSave(); }
    if(r.pb){ if(typeof hfSound==='function') hfSound('bell'); toast('New best! 🔔 Posted to your Mens group'); Kelas.cm=null; Kelas.mxB=null; }
    else toast(r.first?'Logged. Now beat it 💪':'Logged · est. 1RM '+kelasF(r.e1rm)+' kg');
  }catch(e){ toast(e.message==='too_many'?'That is a lot for one day. Try tomorrow.':'Could not save. Try again.'); }
  Kelas.mxBusy=false; renderKelas();
}
async function kelasMxDel(id){
  if(Kelas.mxDelAsk!==id){ Kelas.mxDelAsk=id; toast('Tap ✕ again to delete'); return; }
  Kelas.mxDelAsk=null;
  try{ await kelasCall('st_delete',{id:id}); if(Kelas.data){ Kelas.data.strength=kelasMxRes().filter(r=>r.id!==id); kelasSave(); } Kelas.mxB=null; renderKelas(); }
  catch(e){ toast('Could not delete. Try again.'); }
}
/* the Mens group: a strength board, best estimated 1RM per lift */
function kelasMxBoardHTML(C){
  const l=Kelas.mxBL||'bench', B=Kelas.mxB;
  if(!B && !Kelas.mxBBusy && !Kelas.mxBErr) setTimeout(kelasMxBoardLoad,0);
  let h='<div class="kl-board"><div class="kl-bh"><b>Leaderboard</b></div>'+
    '<div class="kl-bkinds kl-bk4">'+kelasBoardKinds(C).map(k=>'<button class="'+(k[0]==='strength'?'on':'')+'" onclick="Kelas.cmKind=\''+k[0]+'\';renderKelas()">'+k[1]+'</button>').join('')+'</div>'+
    '<div class="kl-hx-bst">'+MX_LIFTS.map(x=>'<button class="'+(x[0]===l?'on':'')+'" onclick="Kelas.mxBL=\''+x[0]+'\';renderKelas()">'+x[1]+'</button>').join('')+'</div>';
  if(!B) return h+'<div class="kl-none">'+(Kelas.mxBErr?'Could not load the board. <button class="kl-alt2" onclick="Kelas.mxBErr=false;renderKelas()">Try again</button>':'Loading…')+'</div></div>';
  const S=(B.boards||{})[l]||{}, top=S.top||[];
  if(!top.length) return h+'<div class="kl-none">No '+hesc((MX_LIFTS.filter(x=>x[0]===l)[0]||[])[1]||'')+' yet. Log yours in Progress and take the top spot.</div></div>';
  const row=r=>'<div class="kl-br'+(r.me?' me':'')+'"><span class="kl-rk r'+r.r+'">'+r.r+'</span>'+kelasAv(r.ph,r.name,'bd',r.me)+
    '<span class="kl-bn">'+hesc(r.name)+(r.me?' <i>you</i>':'')+'</span><b>'+kelasF(r.e)+'</b><small>kg</small></div>';
  h+=top.map(row).join('');
  if(S.me && !top.some(r=>r.me)) h+='<div class="kl-bsep">⋯</div>'+row({r:S.me.r,name:'You',e:S.me.e,me:true});
  return h+'<div class="kl-bfoot">Estimated 1 rep max, best each · '+S.people+' on this board</div></div>';
}
async function kelasMxBoardLoad(){
  Kelas.mxBBusy=true; Kelas.mxBErr=false;
  try{ const r=await kelasCall('st_board',{}); Kelas.mxB=r&&r.ok?r:{boards:{}}; }catch(e){ Kelas.mxBErr=true; }
  Kelas.mxBBusy=false; if(Kelas.tab==='group') renderKelas();
}

/* ═══════════════ Personal coaching (17 Oct 2026) ═══════════════
   Seth: face-to-face PT, RM1,600 a month with a fixed number of sessions.
   The package lives in HITFAT OS's PT tab (pt_packages, pt_sessions, 098):
   the coach schedules the sessions there and logs each one with its Focus
   and a Performance note, which the client reads here. The client sees
   the next session, the sessions left and the end date, the coach's notes,
   their strength and their body; each session done is +150 points. */
function kelasPtWhen(at){
  const t=new Date(Date.parse(at)+8*3600e3), today=kelasDayKey(kelasNowMY()), d=kelasDayKey(t);
  const days=Math.round((Date.parse(d)-Date.parse(today))/864e5);
  const hm=kelasClock(String(t.getUTCHours()).padStart(2,'0')+':'+String(t.getUTCMinutes()).padStart(2,'0'));
  return (days===0?'today':days===1?'tomorrow':KELAS_DOW[kelasDow(t)-1]+' '+t.getUTCDate()+' '+KL_MONTHS[t.getUTCMonth()].slice(0,3))+' · '+hm;
}
function kelasPtTodayHTML(){
  const p=kelasPt(); if(!p) return '';
  const total=+p.total||0, used=+p.used||0, left=Math.max(0,total-used), nx=(p.next||[])[0];
  const daysEnd=p.end?Math.round((Date.parse(p.end)-Date.parse(kelasDayKey(kelasNowMY())))/864e5):null;
  let h='<div class="kl-pt-next">'+(nx?'<small>Next session</small><b>'+hesc(kelasPtWhen(nx.at).replace(/^./,c=>c.toUpperCase()))+'</b>'+
      '<span>'+(nx.coach?'with Coach '+hesc(nx.coach):'with your coach')+'</span>'
    :'<small>Next session</small><b>Not booked yet</b><span>Your coach books it at HQ</span>')+'</div>';
  if((p.next||[]).length>1) h+='<div class="kl-pt-up">'+p.next.slice(1,4).map(x=>'<span>'+hesc(kelasPtWhen(x.at))+'</span>').join('')+'</div>';
  const pct=total?Math.round(used/total*100):0;
  h+='<div class="kl-pt-pk"><div class="kl-pt-ring" style="--p:'+pct+'"><b>'+left+'</b><small>left</small></div>'+
    '<div class="kl-pt-pkt"><b>'+used+' of '+total+' sessions done</b><small>'+hesc(p.type==='Small Group'?'Small Group':'1-on-1')+(p.end?' · ends '+kelasIBDate(p.end,true)+(daysEnd!==null&&daysEnd>=0?' ('+(daysEnd+1)+' day'+(daysEnd===0?'':'s')+' left)':''):'')+'</small>'+
    (p.active&&(left<=2||(daysEnd!==null&&daysEnd<=7))?'<em>Talk to your coach about your next month</em>':!p.active?'<em>Package ended. Talk to your coach to continue</em>':'')+'</div></div>';
  h+=kelasPtHwHTML()+kelasPtCiHTML();
  /* the coach's notes */
  const N=p.notes||[];
  h+=fsec('From your coach','After every session.');
  if(!N.length) return h+'<div class="kl-none">Your coach’s notes appear here after your first session.</div>';
  const all=Kelas.ptAll?N:N.slice(0,3);
  h+='<div class="kl-pt-notes">'+all.map((n,i)=>'<div class="kl-pt-note'+(i===0?' first':'')+'"><div class="kl-pt-nh"><b>'+hesc(n.focus||'Session')+'</b><small>'+kelasIBDate(n.d,true)+(n.coach?' · Coach '+hesc(String(n.coach).split(' ')[0]):'')+'</small></div>'+
    (n.note?'<div class="kl-pt-nb">'+hesc(n.note)+'</div>':'')+'</div>').join('')+'</div>';
  if(N.length>3) h+='<button class="kl-alt2" onclick="Kelas.ptAll=!Kelas.ptAll;renderKelas()">'+(Kelas.ptAll?'Show fewer':'All '+N.length+' notes')+'</button>';
  return h;
}

/* ── Phase 2 (18 Oct 2026, 099): homework from the coach, the weekly
   check-in. The coach sets homework in OS (once, by a date; or every day
   to a date) and the client ticks it here, +20 points each (a day of a
   daily one). Once a week the client sends weight, energy, sleep and how
   well they ate to plan, with a note; the coach replies from OS and the
   reply shows here (and the evening push says so). +50 a check-in. ── */
function kelasPtCoach(p){ const c=p&&(p.coach||'')||''; return c?'Coach '+String(c).split(' ')[0]:'your coach'; }
function kelasPtHw(){ const p=kelasPt(); return (p&&Array.isArray(p.hw))?p.hw:[]; }
function kelasPtHwDays(h){
  if(!h.daily||!h.from||!h.due) return [];
  const out=[]; let t=Date.parse(String(h.from).slice(0,10)+'T00:00:00Z'); const e=Date.parse(String(h.due).slice(0,10)+'T00:00:00Z');
  while(t<=e && out.length<31){ out.push(new Date(t).toISOString().slice(0,10)); t+=864e5; }
  return out;
}
function kelasPtHwDone(h,today){ const D=h.done||[]; return h.daily?D.indexOf(today)>=0:D.length>0; }
function kelasPtHwHTML(){
  const L=kelasPtHw(); if(!L.length) return '';
  const p=kelasPt(), today=kelasDayKey(kelasNowMY());
  const dd=d=>KELAS_DOW[(new Date(String(d).slice(0,10)+'T12:00:00Z').getUTCDay()+6)%7]+' '+kelasIBDate(d,true);
  let h=fsec('Homework','From '+kelasPtCoach(p)+' · +20 points each');
  h+='<div class="kl-hw">'+L.map(x=>{
    const done=kelasPtHwDone(x,today), days=kelasPtHwDays(x), soon=x.daily&&x.from>today, over=!x.daily&&!done&&x.due&&x.due<today;
    const n=(x.done||[]).length;
    const meta=x.daily?(soon?'Starts '+dd(x.from):'Every day to '+dd(x.due)+' · '+n+' of '+days.length+' days')
      :done?'Done ✓':x.due?(over?'Was due '+dd(x.due):'By '+dd(x.due)):'This week';
    return '<div class="kl-hw-r'+(done?' on':'')+(over?' over':'')+'">'+
      '<button class="kl-hw-b" '+(soon?'disabled':'onclick="kelasPtHwTick(\''+x.id+'\')"')+' aria-label="'+(done?'Not done':'Done')+': '+hesc(x.t)+'">'+(done?glyph('check'):'')+'</button>'+
      '<div class="kl-hw-t"><b>'+hesc(x.t)+'</b>'+(x.x?'<span>'+hesc(x.x)+'</span>':'')+'<small>'+meta+(x.daily&&!soon&&!done?' · today not yet':'')+'</small>'+
      (x.daily&&days.length<=14?'<i class="kl-hw-d">'+days.map(d=>'<u class="'+((x.done||[]).indexOf(d)>=0?'y':d===today?'n':d<today?'m':'')+'"></u>').join('')+'</i>':'')+'</div></div>';
  }).join('')+'</div>';
  return h;
}
async function kelasPtHwTick(id){
  const x=kelasPtHw().filter(h=>h.id===id)[0]; if(!x) return;
  const today=kelasDayKey(kelasNowMY()), on=!kelasPtHwDone(x,today), keep=(x.done||[]).slice();
  x.done=x.daily?(on?keep.concat([today]):keep.filter(d=>d!==today)):(on?[today]:[]);
  kelasSave(); renderKelas();
  if(on) toast('+20 points · '+x.t);
  try{ const r=await kelasCall('pt_hw',{id:id, day:today, on:on}); if(!r||!r.ok) throw new Error((r&&r.error)||'failed'); }
  catch(e){ x.done=keep; kelasSave(); renderKelas(); toast('Could not save. Try again.'); }
}
var KL_CI=[['energy','Energy',['Drained','Low','Okay','Good','Great']],['sleep','Sleep',['Very bad','Poor','Okay','Good','Great']],
           ['food','Ate to plan',['Not at all','A little','Half','Mostly','All week']]];
function kelasPtCiHTML(){
  const p=kelasPt(); if(!p) return '';
  const C=Array.isArray(p.checkins)?p.checkins:[], wk=String(p.week||'').slice(0,10), cur=C.filter(c=>String(c.w).slice(0,10)===wk)[0];
  if(!p.active && !C.length) return '';
  const coach=kelasPtCoach(p);
  let h=fsec('Weekly check-in','For '+coach+' · once a week · +50 points');
  if(p.active && (!cur || Kelas.ciEdit)){
    const f=Kelas.ci||(Kelas.ci=cur?{kg:cur.kg||'',energy:cur.energy,sleep:cur.sleep,food:cur.food,note:cur.note||''}:{kg:'',note:''});
    h+='<div class="kl-ci-f"><label class="kl-ci-kg"><span>Weight this morning</span><input id="kl-ci-kg" class="kl-in" inputmode="decimal" maxlength="5" placeholder="e.g. 72.4" value="'+hesc(String(f.kg||''))+'"><em>kg</em></label>'+
      KL_CI.map(q=>'<div class="kl-ci-q"><div><b>'+q[1]+'</b><small>'+(f[q[0]]?q[2][f[q[0]]-1]:'Tap one')+'</small></div>'+
        '<div class="kl-ci-s">'+[1,2,3,4,5].map(v=>'<button class="'+(f[q[0]]===v?'on':'')+'" onclick="kelasPtCiSet(\''+q[0]+'\','+v+')" aria-label="'+q[1]+' '+v+' of 5, '+q[2][v-1]+'">'+v+'</button>').join('')+'</div></div>').join('')+
      '<textarea id="kl-ci-note" class="kl-in kl-ci-note" maxlength="600" rows="3" placeholder="Anything for '+hesc(coach)+'? A win, a pain, a question.">'+hesc(f.note||'')+'</textarea>'+
      '<button class="bigbtn kl-ci-go" onclick="kelasPtCiSend()"'+(Kelas.ciBusy?' disabled':'')+'>'+(Kelas.ciBusy?'Sending…':cur?'Update my check-in':'Send to '+hesc(coach))+'</button>'+
      (cur?'<button class="kl-alt2" onclick="Kelas.ciEdit=false;Kelas.ci=null;renderKelas()">Cancel</button>':'')+'</div>';
  } else if(cur){
    h+=kelasPtCiCard(cur,true);
  }
  const past=C.filter(c=>c!==cur).slice(0,Kelas.ciAll?8:2);
  if(past.length) h+='<div class="kl-ci-past">'+past.map(c=>kelasPtCiCard(c,false)).join('')+'</div>';
  if(C.filter(c=>c!==cur).length>2) h+='<button class="kl-alt2" onclick="Kelas.ciAll=!Kelas.ciAll;renderKelas()">'+(Kelas.ciAll?'Show fewer':'All check-ins')+'</button>';
  /* a reply not read yet: shown as new now, marked read on the server */
  if(C.some(c=>c.reply&&!c.seen) && !Kelas.ciSeenSent){ Kelas.ciSeenSent=true; kelasCall('pt_seen',{}).catch(()=>{ Kelas.ciSeenSent=false; }); }
  return h;
}
function kelasPtCiCard(c,mine){
  const lab=[c.kg?'<span>'+kelasF(c.kg)+' kg</span>':'']
    .concat(KL_CI.map(q=>c[q[0]]?'<span>'+q[1]+' '+c[q[0]]+'/5</span>':'')).filter(Boolean).join('');
  return '<div class="kl-ci-c'+(mine?' cur':'')+'"><div class="kl-ci-ch"><b>'+(mine?'This week':'Week of '+kelasIBDate(c.w,true))+'</b>'+
    (mine&&!c.reply?'<button onclick="Kelas.ciEdit=true;Kelas.ci=null;renderKelas()">Edit</button>':'')+'</div>'+
    (lab?'<div class="kl-ci-chips">'+lab+'</div>':'')+(c.note?'<div class="kl-ci-n">'+hesc(c.note)+'</div>':'')+
    (c.reply?'<div class="kl-ci-r'+(c.seen?'':' new')+'"><small>'+(c.seen?'':'<i>New</i> ')+hesc(c.coach?'Coach '+String(c.coach).split(' ')[0]:'Your coach')+(c.at?' · '+kelasIBDate(c.at,true):'')+'</small>'+hesc(c.reply)+'</div>'
      :mine?'<div class="kl-ci-w">Sent ✓ Waiting for '+hesc(kelasPtCoach(kelasPt()))+'’s reply.</div>':'')+'</div>';
}
function kelasPtCiKeep(){
  const f=Kelas.ci||(Kelas.ci={}), k=$('kl-ci-kg'), n=$('kl-ci-note');
  if(k) f.kg=k.value; if(n) f.note=n.value;
  return f;
}
function kelasPtCiSet(k,v){ const f=kelasPtCiKeep(); f[k]=v; renderKelas(); }
async function kelasPtCiSend(){
  const f=kelasPtCiKeep(), p=kelasPt(); if(!p) return;
  if(!f.energy||!f.sleep||!f.food){ toast('Tap a number for energy, sleep and food'); return; }
  const kg=parseFloat(String(f.kg||'').replace(',','.'));
  if(f.kg && !(kg>=20 && kg<=400)){ toast('Weight in kg, e.g. 72.4'); return; }
  Kelas.ciBusy=true; renderKelas();
  try{
    const r=await kelasCall('pt_checkin',{kg:f.kg?kg:null, energy:f.energy, sleep:f.sleep, food:f.food, note:String(f.note||'').slice(0,600)});
    if(!r||!r.ok){ toast(r&&r.error==='replied'?'Your coach already replied to this week’s.':'Could not send. Try again.'); Kelas.ciBusy=false; renderKelas(); return; }
    const wk=String(r.week||p.week).slice(0,10), had=(p.checkins||[]).some(c=>String(c.w).slice(0,10)===wk);
    const C=p.checkins=(p.checkins||[]).filter(c=>String(c.w).slice(0,10)!==wk);
    C.unshift({w:wk, kg:f.kg?kg:null, energy:f.energy, sleep:f.sleep, food:f.food, note:f.note||'', reply:null});
    Kelas.ci=null; Kelas.ciEdit=false; Kelas.ciBusy=false; kelasSave(); renderKelas();
    toast(had?'Check-in updated':'+50 points · sent to '+kelasPtCoach(p));
  }catch(e){ Kelas.ciBusy=false; renderKelas(); toast('Could not send. Try again.'); }
}

/* ═══════════════ Today's workout (17 Oct 2026) ═══════════════
   The coach writes the day's class workout in HITFAT OS (Live Class →
   Workout for members; class_wods, 093). The member sees it today, and
   tomorrow's the day before, and logs their score after class. Scores stay
   on the member's account (HF.data.kelas.wod), and the same workout done
   again shows the last score to beat. */
var KL_WOD_UNIT={time:['Time','mm:ss','e.g. 12:45'],reps:['Reps','reps','e.g. 86'],rounds:['Rounds','rounds + reps','e.g. 5+12'],
  weight:['Weight','kg','e.g. 60'],distance:['Distance','m','e.g. 2000']};
function kelasWods(){ return (Kelas.data&&Kelas.data.wods)||[]; }
function kelasWodFor(day){
  if(kelasSpace()==='pt') return null;
  const sp=kelasSpace(), a=kelasWods().filter(w=>String(w.date).slice(0,10)===day && (w.cat==='all'||kelasMemSpace({category:w.cat})===sp));
  return a.filter(w=>w.cat!=='all')[0]||a[0]||null;   /* the member's own class before the one for all */
}
function kelasWodLog(){ const k=HF.data.kelas||(HF.data.kelas={}); if(!k.wod||typeof k.wod!=='object') k.wod={}; return k.wod; }
/* the last score for the same workout, before this day */
function kelasWodPrev(title,day){
  const L=kelasWodLog(), t=String(title||'').trim().toLowerCase();
  return Object.keys(L).filter(d=>d<day && String(L[d].t||'').trim().toLowerCase()===t).sort().reverse().map(d=>Object.assign({d:d},L[d]))[0]||null;
}
function kelasWodHTML(){
  const today=kelasDayKey(kelasNowMY()), tm=new Date(kelasNowMY().getTime()+864e5), tmr=kelasDayKey(tm);
  let w=kelasWodFor(today), when='Today';
  if(!w){ w=kelasWodFor(tmr); when='Tomorrow'; }
  if(!w) return '';
  const day=String(w.date).slice(0,10), U=w.type&&KL_WOD_UNIT[w.type], mine=kelasWodLog()[day], prev=kelasWodPrev(w.title,day);
  let h='<div class="kl-wod"><div class="kl-wod-k">'+glyph('workout')+' '+when+"'s workout"+(w.cat!=='all'?' · '+hesc(kelasCat(w.cat)):'')+'</div>'+
    '<div class="kl-wod-t">'+hesc(w.title)+'</div>'+
    (w.body?'<div class="kl-wod-b">'+hesc(w.body)+'</div>':'');
  if(U && when==='Today'){
    if(mine && !Kelas.wodEdit) h+='<div class="kl-wod-me"><div><small>Your '+U[0].toLowerCase()+'</small><b>'+hesc(mine.v)+'</b>'+
        (U[1]!=='mm:ss'&&U[1]!=='rounds + reps'?' <span>'+U[1]+'</span>':'')+'</div>'+
        '<button onclick="Kelas.wodEdit=true;renderKelas()">Edit</button></div>';
    else h+='<div class="kl-wod-in"><input id="kl-wodv" class="kl-in" inputmode="'+(w.type==='time'||w.type==='rounds'?'text':'decimal')+'" maxlength="12" placeholder="'+U[2]+'" value="'+hesc(mine?mine.v:'')+'">'+
        '<button class="bigbtn kl-go" onclick="kelasWodSave(\''+day+'\')">Log '+U[0].toLowerCase()+'</button></div>';
    if(prev) h+='<div class="kl-wod-prev">Last time ('+kelasIBDate(prev.d,true)+'): <b>'+hesc(prev.v)+'</b>. Beat it!</div>';
  } else if(U) h+='<div class="kl-wod-prev">Scored for '+U[0].toLowerCase()+'. '+(prev?'Your last: <b>'+hesc(prev.v)+'</b>.':'Log yours after class.')+'</div>';
  return h+'</div>';
}
function kelasWodSave(day,val){
  const w=kelasWodFor(day), el=val===undefined?$('kl-wodv'):{value:val}; if(!w||!el) return;
  let v=String(el.value||'').trim().replace(/\s+/g,'');
  const ok=w.type==='time'?/^\d{1,3}(:\d{2}){1,2}$/.test(v):w.type==='rounds'?/^\d{1,3}(\+\d{1,3})?$/.test(v):/^\d{1,5}(\.\d{1,2})?$/.test(v);
  if(!ok){ toast(w.type==='time'?'Type the time as mm:ss, e.g. 12:45':w.type==='rounds'?'Type rounds, or rounds+reps, e.g. 5+12':'Type a number'); return; }
  kelasWodLog()[day]={t:w.title, v:v, at:Date.now()};
  const L=kelasWodLog(), keys=Object.keys(L).sort(); while(keys.length>200) delete L[keys.shift()];
  HF.save(); Kelas.wodEdit=false;
  if(typeof hfSound==='function') hfSound('pop');
  toast('Score logged 💪'); renderKelas();
}

/* ═══════════════ Bring a friend (17 Oct 2026) ═══════════════
   +500 points when a friend joins a class and the counter records who
   brought them (OS: Member → Brought in by member, 072/084). The member
   sends the invitation from here; the friend gives the member's name at
   the counter. Nothing is promised to the friend. */
function kelasReferText(){
  const nm=String((Kelas.data&&Kelas.data.name)||'').trim();
  return 'Jom join kelas HITFAT dengan aku! 💪 Kelas berkumpulan di HITFAT HQ. Tengok kelas dan harga di sini: https://hitfat.io/one'+
    (nm?'\n\nBila daftar di kaunter, sebut nama aku: '+nm+' 😄':'');
}
function kelasReferHTML(P){
  const n=((P&&P.history)||[]).filter(x=>x.t==='referral').length;
  return '<div class="kl-ref"><div class="kl-ref-t"><span class="kl-ref-ic">'+glyph('people')+'</span><div><b>Bring a friend, get 500 points</b>'+
    '<small>When your friend joins a class, they tell the counter your name. The points land here.</small></div></div>'+
    '<div class="kl-ref-b"><button class="bigbtn kl-go" onclick="kelasRefer()">'+glyph('share')+' Invite a friend</button>'+
    (n?'<span class="kl-ref-n">'+n+' friend'+(n===1?'':'s')+' brought · +'+kelasN(n*500)+'</span>':'')+'</div></div>';
}
async function kelasRefer(){
  const t=kelasReferText();
  try{ if(navigator.share){ await navigator.share({text:t}); return; } }catch(e){ if(e&&e.name==='AbortError') return; }
  location.href='https://wa.me/?text='+encodeURIComponent(t);
}

/* ═══════════════ The month (17 Oct 2026) ═══════════════
   This month so far, and in the first week of a month the one before: the
   classes against the month before, the best week, the records set, the
   streak, the club level. A story card shares it (plus-push says on the
   1st that it is ready). Counted from the kiosk; PRs from the member's own
   log and the coach's. */
var KL_MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];
function kelasMonthKey(off){ const n=kelasNowMY(); const d=new Date(Date.UTC(n.getUTCFullYear(),n.getUTCMonth()+off,1)); return d.toISOString().slice(0,7); }
/* upTo: a month still running is held against the month before up to
   the same date, as the Improved board, not against all of it */
function kelasMonthStats(ym,upTo){
  const days=Array.from(new Set(kelasIns().map(kelasDayKey))).filter(k=>k.slice(0,7)===ym).sort();
  const y=+ym.slice(0,4), mo=+ym.slice(5,7)-1, pk=new Date(Date.UTC(y,mo-1,1)).toISOString().slice(0,7);
  const prevN=new Set(kelasIns().map(kelasDayKey).filter(k=>k.slice(0,7)===pk && (!upTo || +k.slice(8,10)<=upTo))).size;
  const wk={}; days.forEach(k=>{ const d=new Date(k+'T00:00:00Z'); d.setUTCDate(d.getUTCDate()-(kelasDow(d)-1)); const m=d.toISOString().slice(0,10); wk[m]=(wk[m]||0)+1; });
  const best=Object.keys(wk).reduce((a,k)=>Math.max(a,wk[k]),0);
  /* records: each time a move was beaten (or first logged) that month */
  let prs=0; const top={};
  (typeof kelasOwnPRs==='function'?kelasOwnPRs():[]).slice().sort((a,b)=>a.at-b.at).forEach(e=>{
    const k=String(e.m).toLowerCase(), lower=kelasLower(e.m), b=top[k], beat=b===undefined||(lower?e.v<b:e.v>b);
    if(beat){ top[k]=e.v; if(new Date(e.at+8*3600e3).toISOString().slice(0,7)===ym) prs++; }
  });
  ((Kelas.data&&Kelas.data.prs)||[]).forEach(e=>{ const t=Date.parse(e.at); if(t && new Date(t+8*3600e3).toISOString().slice(0,7)===ym) prs++; });
  return {ym:ym, name:KL_MONTHS[mo], n:days.length, prev:prevN, prevName:KL_MONTHS[(mo+11)%12], upTo:upTo||0, best:best, prs:prs, weeks:Object.keys(wk).length};
}
function kelasMonthPick(){
  const n=kelasNowMY(), early=n.getUTCDate()<=7, last=kelasMonthStats(kelasMonthKey(-1));
  return early && last.n ? Object.assign(last,{done:true}) : Object.assign(kelasMonthStats(kelasMonthKey(0),n.getUTCDate()),{done:false});
}
function kelasMonthHTML(){
  const M=kelasMonthPick(), d=M.n-M.prev;
  if(!M.n && !M.prev) return '';
  return '<div class="kl-mon"><div class="kl-mon-h"><div><small>'+(M.done?'Your month':'This month so far')+'</small><b>'+M.name+'</b></div>'+
    '<button class="kl-mon-sh" onclick="kelasShareMonth()">'+glyph('share')+' Share</button></div>'+
    '<div class="kl-mon-big"><b>'+M.n+'</b><span>'+kelasUnit(M.n)+'<em class="'+(d>0?'up':d<0?'down':'')+'">'+
      (M.prev||d?(d>0?'▲ '+d+' vs ':d<0?'▼ '+(-d)+' vs ':'same as ')+(M.upTo?M.upTo+' ':'')+M.prevName.slice(0,3):'')+'</em></span></div>'+
    '<div class="kl-mon-g"><div><b>'+M.best+'</b><small>best week</small></div><div><b>'+M.prs+'</b><small>PR'+(M.prs===1?'':'s')+'</small></div>'+
    '<div><b>'+kelasWeekStreak()+'</b><small>week streak</small></div><div><b>'+kelasTotal()+'</b><small>all-time</small></div></div></div>';
}
function kelasShareMonth(){
  const M=kelasMonthPick(), L=kelasLevel(kelasTotal());
  Kelas.share={kind:'month', name:M.name, ym:M.ym, n:M.n, prev:M.prev, prevName:M.prevName, upTo:M.upTo, best:M.best, prs:M.prs,
    streak:kelasWeekStreak(), level:L.cur?L.cur+' Class Club':''};
  openShare('kelas');
}
function kelasDrawMonth(x,W,H,cx,F,S){
  x.fillStyle='rgba(255,255,255,.10)'; x.font=F(900,380); x.fillText(String(S.name||'').slice(0,3).toUpperCase(),cx,H-250);
  x.fillStyle='#FFFFFF'; x.font=F(900,64); x.fillText('HITFAT+',cx,220);
  x.fillStyle='rgba(255,255,255,.85)'; x.font=F(800,30); _spaced(x,'MY MONTH AT HITFAT HQ',cx,276,6);
  const cw=860, chh=780, cxl=cx-cw/2, cy=420;
  x.save(); x.shadowColor='rgba(0,0,0,.28)'; x.shadowBlur=60; x.shadowOffsetY=24;
  x.fillStyle='#FFFFFF'; _rr(x,cxl,cy,cw,chh,56); x.fill(); x.restore();
  x.fillStyle='#E30613'; x.font=F(900,64); x.fillText(String(S.name||'').toUpperCase()+' '+String(S.ym||'').slice(0,4),cx,cy+120);
  x.fillStyle='#E30613'; x.font=F(900,260); x.fillText(String(S.n||0),cx,cy+380);
  x.fillStyle='#55555C'; x.font=F(800,44); x.fillText('class'+(S.n===1?'':'es')+' at HQ',cx,cy+450);
  const d=(S.n||0)-(S.prev||0);
  if(d>0){ x.fillStyle='#1F9D4C'; x.font=F(800,34); x.fillText('▲ '+d+' more than '+(S.upTo?'by '+S.upTo+' ':'')+S.prevName,cx,cy+505); }
  const st=[[S.best,'best week'],[S.prs,'PR'+(S.prs===1?'':'s')],[S.streak,'week streak']];
  st.forEach((t,i)=>{ const sx=cxl+cw/6+i*cw/3;
    x.fillStyle='#16161A'; x.font=F(900,84); x.fillText(String(t[0]||0),sx,cy+chh-120);
    x.fillStyle='#8A8A92'; x.font=F(700,30); x.fillText(t[1],sx,cy+chh-72); });
  x.fillStyle='rgba(227,6,19,.18)'; x.fillRect(cxl+90,cy+chh-230,cw-180,4);
  const first=String((Kelas.data&&Kelas.data.name)||'').trim().split(/\s+/)[0]||'';
  x.fillStyle='#FFFFFF'; x.font=F(900,64); if(first) x.fillText(first.toUpperCase(),cx,cy+chh+130);
  if(S.level){ x.fillStyle='rgba(255,255,255,.9)'; x.font=F(700,38); x.fillText(S.level,cx,cy+chh+196); }
  x.fillStyle='rgba(255,255,255,.8)'; x.font=F(700,34); x.fillText('app.hitfat.io',cx,H-110);
}

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
    points:{balance:1450, lifetime:2250, 'class':1600, bonus:350, missions:300, redeemed:800, since:'2026-10-17',
      weeks:(function(){ const w=[], m=new Date(now.getTime()); m.setUTCDate(m.getUTCDate()-(kelasDow(now)-1));
        [300,425,400,550,0,325,450].forEach((p,i)=>{ const d=new Date(m.getTime()); d.setUTCDate(d.getUTCDate()-7*(6-i)); w.push({w:kelasDayKey(d),p:p}); }); return w; })(),
      rewards:[{id:'drink',name:'A drink at the counter',points:600,note:'Any drink on the counter menu'},
        {id:'renew20',name:'RM20 off your next renewal',points:2500,note:'Used at the counter when you renew'},
        {id:'inbody',name:'InBody body analysis',points:3500,note:'Book a time with the counter'}],
      history:[{t:'redeem',name:'A drink at the counter',p:-600,at:new Date(Date.now()-2*864e5).toISOString()},
        {t:'link',name:'Connected HITFAT+',p:300,at:new Date(Date.now()-20*864e5).toISOString()}]},
    journey:{active:false, eligible:false, suggest:'fat60', done:0},
    wods:[{date:iso(now), cat:'Membership', title:'HITFAT 21-15-9', body:'21-15-9 reps, for time:\nKettlebell swings\nBurpees\nAir squats\n\nCap 15 min.', type:'time'}],
    first30:{active:true, day:6, done:3, total:7, complete:false, awarded:false, missions:[
      {k:'goal',done:true,goal:'Lose fat'},{k:'inbody1',done:true},{k:'coach',done:false},{k:'class1',done:true},
      {k:'week3',done:false,n:2},{k:'ten',done:false,n:4},{k:'inbody2',done:false,from:21}]},
    inbody:[
      {scan_date:'2026-10-14',src:'sheet',model:'InBody 270',sex:'female',height_cm:158,weight:62.4,smm:23.1,bfm:20.6,pbf:33.0,bmi:25.0,score:68,
       tbw:30.4,protein:8.2,mineral:3.1,ffm:41.8,vfl:9,bmr:1273,whr:0.89,smi:6.1,ecw_ratio:0.378,target_weight:56.3,fat_control:-6.1,muscle_control:0,
       ranges:{weight:[45.8,61.9],smm:[20.6,25.2],bfm:[11.6,18.5],pbf:[18,28],bmi:[18.5,25]},
       seg_lean:{right_arm:{kg:2.1,pct:96.2},left_arm:{kg:2.0,pct:94.1},trunk:{kg:18.9,pct:101.5},right_leg:{kg:6.4,pct:92.3},left_leg:{kg:6.3,pct:91.4}},
       seg_fat:{right_arm:{kg:1.4,pct:168.0},left_arm:{kg:1.5,pct:171.2},trunk:{kg:10.3,pct:188.4},right_leg:{kg:3.2,pct:139.5},left_leg:{kg:3.2,pct:140.1}}},
      {scan_date:'2026-09-12',src:'sheet',weight:63.9,smm:22.6,bfm:22.3,pbf:34.9,bmi:25.6,score:65,bmr:1258,vfl:10,sex:'female',ranges:{smm:[20.6,25.2],bfm:[11.6,18.5],pbf:[18,28]}},
      {scan_date:'2026-08-10',src:'staff',weight:65.2,smm:22.2,bfm:23.8,pbf:36.5,score:63}],
    weeks:(function(){ const w=[], m=new Date(now.getTime()); m.setUTCDate(m.getUTCDate()-(kelasDow(now)-1));
      for(let i=0;i<9;i++){ const d=new Date(m.getTime()); d.setUTCDate(d.getUTCDate()-7*i); w.push(kelasDayKey(d)); }
      for(let i=14;i<26;i++){ const d=new Date(m.getTime()); d.setUTCDate(d.getUTCDate()-7*i); w.push(kelasDayKey(d)); }
      return w.sort(); })()};
  Kelas.state='ready';
  const ago=h=>new Date(Date.now()-h*3600e3).toISOString();
  Kelas.cm={linked:true, admin:true, cats:['Membership'], cat:'Membership', prefs:{hide_board:false,hide_feed:false},
    posts:[{id:'00000000-0000-0000-0000-000000000001',kind:'announce',title:'Class 3 moves to 6:30 PM today',body:'Hari ni sahaja. Jumpa di HQ!',pinned:true,at:ago(2),r:{fire:4},my:[]},
      {id:'00000000-0000-0000-0000-000000000009',kind:'photo',title:'Lina M.',body:'First time finishing Class 4 without stopping! Terima kasih coach 🙏',at:ago(1),r:{fire:7,clap:3},my:[],nc:3,
       cm:[{id:'c1',name:'Siti N.',body:'Power gila! 🔥',at:ago(0.8)},{id:'c2',name:'Coach Amir',body:'Proud of you. Next week we go heavier.',at:ago(0.5)}]},
      {id:'00000000-0000-0000-0000-000000000002',kind:'pr',title:'Hakim A. rang the bell: Plank hold 3:05',at:ago(5),r:{fire:6,muscle:3},my:['fire']},
      {id:'00000000-0000-0000-0000-000000000003',kind:'week',title:'Aina R. hit 3 classes this week',body:'5 weeks in a row',at:ago(20),r:{clap:5},my:[]},
      {id:'00000000-0000-0000-0000-000000000004',kind:'club',title:'Siti N. reached the 50 Class Club',at:ago(30),r:{fire:9,clap:7},my:['clap']},
      {id:'00000000-0000-0000-0000-000000000005',kind:'first',title:'Farah Z. came to their first class',at:ago(50),r:{clap:11},my:[]}],
    week:{people:18,top:[{r:1,name:'Hakim A.',n:5},{r:2,name:'Siti N.',n:4},{r:2,name:'Aina R.',n:4,me:true},{r:4,name:'Farah Z.',n:3},{r:5,name:'Amir S.',n:3},
      {r:6,name:'Lina M.',n:2},{r:7,name:'Zul H.',n:2},{r:8,name:'Nora K.',n:1},{r:9,name:'Haziq R.',n:1},{r:10,name:'Mira T.',n:1}],me:{r:2,n:4,gap:1}},
    month:{people:22,top:[{r:1,name:'Siti N.',n:14},{r:2,name:'Hakim A.',n:13},{r:3,name:'Amir S.',n:11}],me:{r:7,n:8,gap:1}},
    improved:{people:22,top:[{r:1,name:'Farah Z.',n:6,was:2,now:8},{r:2,name:'Aina R.',n:4,was:4,now:8,me:true},{r:3,name:'Zul H.',n:3,was:1,now:4}],me:{r:2,n:4,gap:2}},
    streak:{people:8,top:[{r:1,name:'Siti N.',n:4},{r:2,name:'Hakim A.',n:3},{r:3,name:'Aina R.',n:2,me:true}],me:{r:3,n:2,gap:1}}};
}
