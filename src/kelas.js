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

/* Off until the bridge is installed: 39-plus-class.sql here, 080_plus_bridge.sql
   in HITFAT OS, the hash copied across, plus-class deployed. Then true. */
var KELAS_LIVE=false;
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
      return '<button class="'+(dd===Kelas.day?'on ':'')+(has?'':'rest ')+(dd===today?'today':'')+'" onclick="kelasPickDay('+dd+')">'+w+'</button>';
    }).join('')+'</div>';
    const day=cls.filter(c=>c.dow===Kelas.day);
    h+='<div class="kl-list">'+(day.length?day.map(c=>
      '<div class="kl-cls"><b>'+kelasClock(c.start)+'</b><div><div class="kl-cn">'+hesc(c.name)+'</div>'+
      '<div class="kl-cm">'+(c.min||60)+' min · '+hesc(kelasCat(c.category))+(c.coach?' · '+hesc(c.coach):'')+'</div></div></div>').join('')
      :'<div class="kl-none">No class on '+KELAS_DOW[Kelas.day-1]+'. Rest day.</div>')+'</div>';
  }

  /* attendance */
  const month=kelasThisMonth(), streak=kelasWeekStreak(), last=kelasLastIn();
  h+=fsec('Attendance','From the kiosk at the door.');
  h+='<div class="kl-att">'+
     '<div><b>'+month+'</b><small>this month</small></div>'+
     '<div><b>'+streak+'</b><small>week'+(streak===1?'':'s')+' in a row</small></div>'+
     '<div><b>'+(d.total||0)+'</b><small>all time</small></div></div>';
  h+='<div class="kl-grid" aria-label="Check-ins, last 12 weeks">'+kelasGrid()+'</div>';
  h+='<div class="kl-last">Last 12 weeks'+(last?' · last check-in '+last.charAt(0).toLowerCase()+last.slice(1):'')+'</div>';

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
    classes:cls, checkins:ins, total:47};
  Kelas.state='ready';
}
