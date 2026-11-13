/* ── HITFAT SYNC 30 (13 Nov 2026) ──
   Seth, 13 Nov: "dia asing, dia dalam HITFAT Plus, tapi dia kena beli … harga tu nanti",
   then the model ("ni terbaik"), the 15-minute pilot ("semua okay"), levels "Easy · Medium · Hard"
   and "3, ya" (put it in the app).
   One session is one video made in _projek/sync: the coach's voice, the music and the moves on one
   timeline, so the app only plays it. Every rep is counted aloud ("Down… Up! ONE!"); timed moves get
   energy, not counting. Three levels of the same 15 minutes.
   Sold on its own: HITFAT+ does NOT include it (the first program like that). Until it has a price it is
   kept out of PROGRAMS, the Store and checkout; testers see it on Home and own it for testing. */
const SYNC_ID='sync30', SYNC_NAME='HITFAT SYNC 30', SYNC_N=30, SYNC_MIN=15;
const SYNC_LIVE=false, SYNC_TESTERS=['sethnasser1991@gmail.com'];
/* Vimeo "id" or "id/hash" per level; empty until Seth uploads the three videos */
const SYNC_VIDEO={easy:'', medium:'', hard:''};
const SYNC_PIC='/img/p/sync/hero.jpg?v=2';
const SYNC_LEVELS=[
  {k:'easy',   n:'Easy',   s:'Perlahan, tanpa lompat',      d:['Squat 8 · Push up 6, perlahan','Mountain climber & plank 25 saat','Rehat 25 saat · 60 saat antara pusingan','Tiada lompat, tiada burpee']},
  {k:'medium', n:'Medium', s:'Rentak penuh',                d:['Squat 12 · Push up 10','Mountain climber & plank 30 saat','Rehat 15 saat · 45 saat antara pusingan','Penutup: wall sit + burpee 8']},
  {k:'hard',   n:'Hard',   s:'Lebih ulangan, rehat pendek', d:['Squat 12 · Push up 12','Mountain climber & plank 40 saat','Rehat 10 saat · 30 saat antara pusingan','Penutup: wall sit 45 saat + burpee 10']}
];

function syTester(){ return SYNC_TESTERS.indexOf(String(HF.email||'').toLowerCase())>=0; }
/* bought on its own: never through contentOpen()/hasPlus() */
function syOwned(){ return (typeof owns==='function' && owns('prog_'+SYNC_ID)) || syTester(); }
function syLive(){ return SYNC_LIVE || syOwned(); }
function syData(){ const d=HF.data.sync||(HF.data.sync={}); d.log=d.log||[]; d.level=d.level||'medium'; return d; }
function syDone(){ return Math.min(syData().log.length, SYNC_N); }
function syLevel(k){ return SYNC_LEVELS.find(l=>l.k===k)||SYNC_LEVELS[1]; }
function syReady(k){ return !!SYNC_VIDEO[k]; }

/* ── Home: a tile in "Program & Kursus" for testers ── */
function syHomeTile(){
  if(!syLive() || typeof hpoTile!=='function') return '';
  const d=syDone();
  return hpoTile({t:'HITFAT SYNC', kick:d?'Sesi '+(d+1)+' / '+SYNC_N:'Baru · '+SYNC_MIN+' min', lv:'Coach di telinga · ikut rentak', pal:'red', img:SYNC_PIC, pos:'50% 35%', go:'syOpen()'});
}

/* ── the page ── */
function syOpen(){
  syClose();
  const o=document.createElement('div'); o.id='syv'; o.className='sy';
  document.body.appendChild(o); syRender();
}
function syClose(){ const o=$('syv'); if(o&&o.parentNode) o.parentNode.removeChild(o); }
function syPick(k){ syData().level=k; HF.save(); syRender(); }
function syRender(){
  const o=$('syv'); if(!o) return;
  const d=syData(), n=syDone(), lv=syLevel(d.level);
  let h='<button class="sy-x" aria-label="Tutup" onclick="syClose()">✕</button>'+
    '<div class="sy-hero" style="background-image:url(\''+SYNC_PIC+'\')"><div class="sy-hero-in">'+
      '<div class="sy-k">Program baru · '+SYNC_MIN+' minit</div><div class="sy-t">HITFAT <b>SYNC</b> 30</div>'+
      '<div class="sy-s">Coach di telinga. Setiap ulangan dikira, ikut rentak muzik.</div></div></div>'+
    '<div class="sy-body">'+
    '<div class="sy-prog"><div class="sy-prog-h"><b>'+n+'</b> / '+SYNC_N+' sesi</div><div class="sy-bar"><i style="width:'+(n/SYNC_N*100).toFixed(1)+'%"></i></div></div>'+
    '<div class="sy-how">'+
      '<div><span>'+glyph('play')+'</span><p><b>Down… Up! ONE!</b> Setiap ulangan squat, push up dan burpee dikira dengan suara.</p></div>'+
      '<div><span>'+glyph('bolt')+'</span><p><b>Gerakan ikut masa</b> (high knee, plank…): coach bagi semangat sampai "3, 2, 1, Stop!"</p></div>'+
      '<div><span>'+glyph('target')+'</span><p><b>Pakai earphone</b> dan naikkan volume. Tiada alat diperlukan.</p></div></div>'+
    '<div class="sy-h">Pilih tahap</div><div class="sy-lv">';
  SYNC_LEVELS.forEach(l=>{
    h+='<button class="sy-card'+(l.k===lv.k?' on':'')+'" onclick="syPick(\''+l.k+'\')"><div class="sy-card-h"><b>'+l.n+'</b><span>'+hesc(l.s)+'</span></div>'+
      '<ul>'+l.d.map(x=>'<li>'+hesc(x)+'</li>').join('')+'</ul></button>';
  });
  h+='</div>'+
    '<button class="sy-go'+(syReady(lv.k)?'':' off')+'" onclick="syPlay()">'+(syReady(lv.k)?'Mula · '+lv.n+' · '+SYNC_MIN+' minit':'Video '+lv.n+' akan datang')+'</button>'+
    (syReady(lv.k)?'':'<div class="sy-note">Video sedang dimuat naik.</div>');
  if(d.log.length){
    h+='<div class="sy-h">Rekod anda</div><div class="sy-log">'+d.log.slice(-6).reverse().map(x=>
      '<div><b>Sesi '+x.n+'</b><span>'+syLevel(x.lv).n+' · '+String(x.at||'').slice(0,10)+'</span></div>').join('')+'</div>';
  }
  h+='</div>';
  o.innerHTML=h; o.scrollTop=0;
}

/* ── the player: the session video full screen, with its own sound ── */
let _sy=null;   /* {lv, sid, seen, dur, done} */
function syVimeo(v){
  const p=String(v).split('/');
  return 'https://player.vimeo.com/video/'+p[0]+'?'+(p[1]?'h='+p[1]+'&':'')+'autoplay=1&title=0&byline=0&portrait=0&dnt=1&playsinline=1&texttrack=false';
}
function syPlay(){
  const lv=syData().level; if(!syReady(lv)) return;
  syStop();
  _sy={lv:lv, sid:null, seen:0, dur:0, done:false};
  const o=document.createElement('div'); o.id='syp';
  o.innerHTML='<iframe src="'+syVimeo(SYNC_VIDEO[lv])+'" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen title="HITFAT SYNC"></iframe>'+
    '<button class="x" aria-label="Tutup" onclick="syStop()">✕</button>';
  document.body.appendChild(o);
}
function syStop(){ const o=$('syp'); if(o&&o.parentNode) o.parentNode.removeChild(o); _sy=null; }
function syPost(method,value){
  const f=document.querySelector('#syp iframe'), w=f&&f.contentWindow; if(!w) return;
  try{ w.postMessage(JSON.stringify(value===undefined?{method}:{method,value}),'https://player.vimeo.com'); }catch(e){}
}
function syOnMessage(ev){
  if(ev.origin!=='https://player.vimeo.com' || !_sy) return;
  let d; try{ d=typeof ev.data==='string'?JSON.parse(ev.data):ev.data; }catch(e){ return; }
  if(!d) return;
  if(d.event==='ready'){ ['timeupdate','play','ended'].forEach(x=>syPost('addEventListener',x)); return; }
  if(d.event==='play' && !_sy.sid) sySessionStart();
  if(d.event==='timeupdate' && d.data){
    _sy.dur=d.data.duration||_sy.dur;
    /* count only time really played forward, so a skip to the end is not a session */
    const s=d.data.seconds||0; if(s>_sy.seen && s-_sy.seen<3) _sy.seen=s;
    if(_sy.dur && _sy.seen>=_sy.dur*0.95) syFinish();
  }
  if(d.event==='ended' && _sy.dur && _sy.seen>=_sy.dur*0.9) syFinish();
}
if(typeof window!=='undefined' && window.addEventListener) window.addEventListener('message',syOnMessage);
function sySessionStart(){
  try{
    if(!sb || !HF.userId || !_sy) return;
    const p=_sy, n=syDone()+1;
    sb.rpc('plus_session_start',{p_program:SYNC_ID, p_day:n-1, p_label:'HITFAT SYNC · Sesi '+n+' · '+syLevel(p.lv).n})
      .then(r=>{ if(r && !r.error && _sy===p) p.sid=r.data; }).catch(()=>{});
  }catch(e){}
}
function syFinish(){
  if(!_sy || _sy.done) return; _sy.done=true;
  const d=syData(), n=d.log.length+1, lv=_sy.lv;
  d.log.push({n:n, lv:lv, at:new Date().toISOString()});
  HF.markDone(SYNC_ID+'-s'+(n-1),{name:'HITFAT SYNC · Sesi '+n+' · '+syLevel(lv).n, mins:SYNC_MIN});
  try{ if(sb && _sy.sid){ const id=_sy.sid; _sy.sid=null; sb.rpc('plus_session_finish',{p_id:id}).then(()=>{ if(typeof _lbCache!=='undefined') _lbCache={}; }).catch(()=>{}); } }catch(e){}
  const o=$('syp');
  if(o){
    const done=document.createElement('div'); done.className='sy-done';
    done.innerHTML='<div class="sy-k">Sesi '+n+' / '+SYNC_N+' · '+syLevel(lv).n+'</div><div class="sy-t">SIAP!</div>'+
      '<div class="sy-s">'+SYNC_MIN+' minit, ikut rentak. Direkod dalam streak anda.</div>'+
      '<button class="sy-go" onclick="syStop();syRender()">Tutup</button>';
    o.appendChild(done);
  }
  if(typeof toast==='function') toast('Sesi SYNC siap 🔥');
}
