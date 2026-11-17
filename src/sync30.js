/* ── HITFAT SYNC 30 (13 Nov 2026; the 30-day program page 17 Nov) ──
   Seth, 13 Nov: "dia asing, dia dalam HITFAT Plus, tapi dia kena beli … harga tu nanti",
   then the model ("ni terbaik"), the 15-minute pilot ("semua okay"), levels "Easy · Medium · Hard"
   and "3, ya" (put it in the app). 14 Nov: "ok" to 10 sessions over 30 days in three phases.
   17 Nov: "buat satu interface khas dulu … lepas tu barulah kita masukkan satu video per video".
   One session is one video made in _projek/sync: the coach's voice, the music and the moves on one
   timeline, so the app only plays it. Every rep is counted aloud ("Down… Up! ONE!"); timed moves get
   energy, not counting. 10 sessions × 3 levels = 30 videos, each 15 minutes.
   Sold on its own: HITFAT+ does NOT include it (the first program like that). Until it has a price it is
   kept out of PROGRAMS, the Store and checkout; testers see it on Home and own it for testing. */
const SYNC_ID='sync30', SYNC_NAME='HITFAT SYNC 30', SYNC_N=30, SYNC_MIN=15;
const SYNC_LIVE=false, SYNC_TESTERS=['sethnasser1991@gmail.com'];
/* Vimeo "id" or "id/hash" for each of the 30 videos, filled one by one as Seth uploads them.
   Key: s<session>_<level>. An empty one shows "Video akan datang" on every day that uses it. */
const SYNC_VIDEO={
  s1_easy:'', s1_medium:'', s1_hard:'',
  s2_easy:'', s2_medium:'', s2_hard:'',
  s3_easy:'', s3_medium:'', s3_hard:'',
  s4_easy:'', s4_medium:'', s4_hard:'',
  s5_easy:'', s5_medium:'', s5_hard:'',
  s6_easy:'', s6_medium:'', s6_hard:'',
  s7_easy:'', s7_medium:'', s7_hard:'',
  s8_easy:'', s8_medium:'', s8_hard:'',
  s9_easy:'', s9_medium:'', s9_hard:'',
  s10_easy:'', s10_medium:'', s10_hard:''
};
const SYNC_PIC='/img/p/sync/hero.jpg?v=2';
const SYNC_LEVELS=[
  {k:'easy',   n:'Easy',   s:'Perlahan, tanpa lompat. Ulangan 6–8, rehat 25 saat.'},
  {k:'medium', n:'Medium', s:'Rentak penuh. Ulangan 10–12, rehat 15 saat.'},
  {k:'hard',   n:'Hard',   s:'Lebih ulangan, lebih lama, rehat 10 saat.'}
];
/* the 10 sessions; moves per level as "warm up / one round (×3) / finisher", read from the rendered
   timelines in _projek/sync so the page lists exactly what the video plays */
const SYNC_S=[
  {n:'Full Body',     s:'Asas seluruh badan', m:{easy:'High Knee 40s/Squat ×8|Push Up ×6|Mountain Climber 25s|Plank 25s/Wall Sit 30s', medium:'High Knee 40s|Jumping Jack 40s/Squat ×12|Push Up ×10|Mountain Climber 30s|Plank 30s/Wall Sit 40s|Burpee ×8', hard:'High Knee 40s|Jumping Jack 40s/Squat ×12|Push Up ×12|Mountain Climber 40s|Plank 40s/Wall Sit 45s|Burpee ×10'}},
  {n:'Kaki',          s:'Lunges, squat dan lompat', m:{easy:'Butt Kick 40s/Reverse Lunges ×8|Squat Pause ×8|Fast Feet 25s|Squat Hold 25s/Calf Raises ×8|Squat Pause ×8', medium:'Butt Kick 40s|Jumping Jack 40s/Reverse Lunges ×12|Squat Pause ×12|Fast Feet 25s|Squat Hold 25s/Calf Raises ×12|Squat Jump ×10', hard:'Butt Kick 40s|Jumping Jack 40s/Reverse Lunges ×12|Squat Pause ×12|Fast Feet 30s|Squat Hold 30s/Calf Raises ×12|Squat Jump ×12'}},
  {n:'Atas + Core',   s:'Dada, lengan dan perut', m:{easy:'High Knee 40s|Plank Shoulder Tap 40s/Knee Push Up ×6|Tricep Dip ×6|Plank Shoulder Tap 25s|Crunch ×8/Russian Twist 30s|Plank 30s', medium:'High Knee 40s|Plank Jack 40s/Push Up ×10|Tricep Dip ×10|Plank Shoulder Tap 30s|Crunch ×12/Russian Twist 40s|Plank 40s', hard:'High Knee 40s|Plank Jack 40s/Push Up ×12|Tricep Dip ×12|Plank Shoulder Tap 35s|Crunch ×12/Russian Twist 40s|Plank 40s'}},
  {n:'Full Body 2',   s:'Seluruh badan, gerakan baru', m:{easy:'Butt Kick 40s/Squat ×8|Incline Push Up ×6|Mountain Climber 25s|Sit Up ×8/Wall Sit 30s|Half Burpee ×6', medium:'Jumping Jack 40s|Butt Kick 40s/Squat ×12|Wide Push Up ×10|Mountain Climber 30s|Sit Up ×12/Wall Sit 40s|Half Burpee ×8', hard:'Jumping Jack 40s|Butt Kick 40s/Squat ×12|Wide Push Up ×12|Mountain Climber 35s|Sit Up ×12/Wall Sit 40s|Half Burpee ×10'}},
  {n:'Kaki + Kardio', s:'Kaki kuat, jantung laju', m:{easy:'High Knee 40s|Fast Feet 40s/Alternating Lunges ×8|Squat Pause ×8|Fast Feet 25s|Wall Sit 25s/Side Lunges ×8|Half Burpee ×6', medium:'High Knee 40s|Fast Feet 40s/Alternating Lunges ×12|Squat Jump ×10|Skater Jump 30s|Wall Sit 30s/Side Lunges ×12|Burpee ×8', hard:'High Knee 40s|Fast Feet 40s/Alternating Lunges ×12|Squat Jump ×12|Skater Jump 35s|Wall Sit 35s/Side Lunges ×12|Burpee ×10'}},
  {n:'Core',          s:'Perut dan pinggang', m:{easy:'Butt Kick 40s|Plank Shoulder Tap 40s/Crunch ×8|Leg Raises ×8|Flutter Kick 25s|Side Plank 25s/Hollow Hold 30s|Bicycle Crunch 30s', medium:'Jumping Jack 40s|Plank Jack 40s/Crunch ×12|Leg Raises ×12|Flutter Kick 30s|Side Plank 30s/Hollow Hold 40s|Bicycle Crunch 40s', hard:'Jumping Jack 40s|Plank Jack 40s/Crunch ×12|Leg Raises ×12|Flutter Kick 35s|Side Plank 35s/Hollow Hold 40s|Bicycle Crunch 40s'}},
  {n:'Push',          s:'Dada, bahu dan trisep', m:{easy:'High Knee 40s|Butt Kick 40s/Knee Push Up ×6|Push Up Shoulder Tap 25s|Tricep Dip ×6/Push Up Hold 30s|Plank Shoulder Tap 30s', medium:'High Knee 40s|Jumping Jack 40s/Push Up ×10|Diamond Push Up ×10|Push Up Shoulder Tap 30s|Tricep Dip ×10/Push Up Hold 40s|Plank Jack 40s', hard:'High Knee 40s|Jumping Jack 40s/Push Up ×12|Diamond Push Up ×12|Push Up Shoulder Tap 40s|Tricep Dip ×12/Push Up Hold 45s|Plank Jack 45s'}},
  {n:'Kaki Kuat',     s:'Kaki, punggung dan lompat', m:{easy:'Butt Kick 40s|High Knee 40s/Curtsy Lunges ×8|Squat Pause ×8|Reverse Lunges ×8|Squat Hold 25s/Hip Thrust ×8|Squat Pause ×8', medium:'Butt Kick 40s|High Knee 40s/Curtsy Lunges ×12|Squat Pause ×12|Jump Lunges ×10|Squat Hold 25s/Hip Thrust ×12|Squat Jump ×10', hard:'Butt Kick 40s|High Knee 40s/Curtsy Lunges ×12|Squat Pause ×12|Jump Lunges ×12|Squat Hold 30s/Hip Thrust ×12|Squat Jump ×12'}},
  {n:'HIIT',          s:'Kardio penuh tenaga', m:{easy:'Butt Kick 40s|High Knee 40s/Half Burpee ×6|High Knee 25s|Fast Feet 25s|Mountain Climber 25s/Butt Kick 30s|Squat Pause ×8', medium:'Jumping Jack 40s|High Knee 40s/Burpee ×8|High Knee 30s|Skater Jump 30s|Mountain Climber 30s/Butt Kick 40s|Squat Jump ×10', hard:'Jumping Jack 40s|High Knee 40s/Burpee ×10|High Knee 35s|Skater Jump 35s|Mountain Climber 35s/Butt Kick 40s|Squat Jump ×12'}},
  {n:'Ujian Akhir',   s:'Ukur sejauh mana anda pergi', m:{easy:'High Knee 40s|Butt Kick 40s/Squat ×8|Knee Push Up ×6|Half Burpee ×6|Plank 25s/Wall Sit 30s|High Knee 30s', medium:'High Knee 40s|Jumping Jack 40s/Squat ×12|Push Up ×10|Burpee ×8|Plank 30s/Wall Sit 40s|High Knee 40s', hard:'High Knee 40s|Jumping Jack 40s/Squat ×12|Push Up ×12|Burpee ×10|Plank 40s/Wall Sit 45s|High Knee 45s'}}
];
/* 30 days in three phases (Seth, 14 Nov): each phase repeats its sessions three times */
const SYNC_PHASES=[
  {n:'Fasa 1', t:'Asas', s:[1,2,3], from:1,  to:9},
  {n:'Fasa 2', t:'Bina', s:[4,5,6], from:10, to:18},
  {n:'Fasa 3', t:'Kuat', s:[7,8,9,10], from:19, to:30}
];
function syPhase(day){ return SYNC_PHASES.find(p=>day>=p.from && day<=p.to)||SYNC_PHASES[0]; }
function sySession(day){ const p=syPhase(day); return p.s[(day-p.from)%p.s.length]; }   /* 1–10 */
function syKey(sn,lv){ return 's'+sn+'_'+lv; }

function syTester(){ return SYNC_TESTERS.indexOf(String(HF.email||'').toLowerCase())>=0; }
/* bought on its own: never through contentOpen()/hasPlus() */
function syOwned(){ return (typeof owns==='function' && owns('prog_'+SYNC_ID)) || syTester(); }
function syLive(){ return SYNC_LIVE || syOwned(); }
function syData(){
  const d=HF.data.sync||(HF.data.sync={}); d.log=d.log||[]; d.level=d.level||'medium';
  /* days done: {day: {lv, at}}; the first testers' sessions were counted in order, so session n was day n */
  if(!d.days){ d.days={}; d.log.forEach(x=>{ if(x.n>=1 && x.n<=SYNC_N && !d.days[x.n]) d.days[x.n]={lv:x.lv, at:x.at}; }); }
  return d;
}
function syDone(){ return Object.keys(syData().days).length; }
function syNext(){ const dd=syData().days; for(let i=1;i<=SYNC_N;i++) if(!dd[i]) return i; return SYNC_N; }
function syLevel(k){ return SYNC_LEVELS.find(l=>l.k===k)||SYNC_LEVELS[1]; }
function syReady(sn,lv){ return !!SYNC_VIDEO[syKey(sn,lv)]; }
function syVideos(){ return Object.keys(SYNC_VIDEO).filter(k=>SYNC_VIDEO[k]).length; }

/* ── Home: a tile in "Program & Kursus" for testers ── */
function syHomeTile(){
  if(!syLive() || typeof hpoTile!=='function') return '';
  const n=syDone();
  return hpoTile({t:'HITFAT SYNC', kick:n?'Hari '+Math.min(n+1,SYNC_N)+' / '+SYNC_N:'Baru · '+SYNC_N+' hari', lv:'Coach di telinga · ikut rentak', pal:'red', img:SYNC_PIC, pos:'50% 35%', go:'syOpen()'});
}

/* ── the page (17 Nov, Seth: "style Spotify … YouTube Music"): a playlist page. Each session has its own
   cover (the SYNC photo in its own colour); the 30 days are the tracks; a mini player at the bottom
   holds the next day; tapping a day opens it full screen like "now playing", with its moves as the
   track list and ⏮ ▶ ⏭ to step through the days. ── */
const SYNC_COL=['#FF2E43','#FF7A1A','#7C5CFF','#E9418F','#14B8A6','#3B82F6','#F59E0B','#C81E3A','#B44DFF','#E5B800'];
const SY_I={
  play:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/></svg>',
  prev:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5h2v14H6zM19 6.2v11.6a1 1 0 0 1-1.55.83L9.5 13.2a1.4 1.4 0 0 1 0-2.4l7.95-5.43A1 1 0 0 1 19 6.2z"/></svg>',
  next:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 5h2v14h-2zM5 6.2v11.6a1 1 0 0 0 1.55.83l7.95-5.43a1.4 1.4 0 0 0 0-2.4L6.55 5.37A1 1 0 0 0 5 6.2z"/></svg>',
  ok:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.5 16.2 5.3 12l-1.4 1.4 5.6 5.6 11-11-1.4-1.4z"/></svg>',
  down:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.4 8.6 12 14.2l5.6-5.6L19 10l-7 7-7-7z"/></svg>'
};
let _syS=0, _syIn=false;   /* the day open full screen (0 = none); _syIn = slide it up this render */
function syOpen(){
  syClose(); _syS=0;
  const o=document.createElement('div'); o.id='syv'; o.className='sy';
  document.body.appendChild(o); syRender(true);
}
function syClose(){ const o=$('syv'); if(o&&o.parentNode) o.parentNode.removeChild(o); _syS=0; }
function syPick(k){ syData().level=k; HF.save(); syRender(); }
function syDay(n){ _syIn=!_syS; _syS=Math.max(1,Math.min(SYNC_N,n)); syRender(); _syIn=false; }
function syShut(){ _syS=0; syRender(); }
/* the big play button: plays the next day, or opens it when its video is not up yet */
function syGo(){ const n=syNext(); if(syReady(sySession(n),syData().level)) syPlay(n); else syDay(n); }
function syDaysOf(sn){ const r=[]; for(let i=1;i<=SYNC_N;i++) if(sySession(i)===sn) r.push(i); return r; }
function sySessionDay(sn){ const dd=syData().days, r=syDaysOf(sn); return r.find(i=>!dd[i])||r[0]; }
function syCover(sn,cls){
  const c=SYNC_COL[sn-1];
  return '<div class="sy-cv'+(cls?' '+cls:'')+'" style="--c:'+c+';background-image:linear-gradient(180deg,rgba(0,0,0,0) 25%,'+c+'e6 78%),url(\''+SYNC_PIC+'\');background-position:50% '+(14+sn*5)+'%">'+
    '<i>SYNC '+String(sn).padStart(2,'0')+'</i><b>'+hesc(SYNC_S[sn-1].n)+'</b></div>';
}
function syMoveList(sn,lv){
  const p=String(SYNC_S[sn-1].m[lv]||'').split('/'), names=['Warm up','3 pusingan · ulang 3 kali','Penutup'];
  let h='', k=0;
  p.forEach((x,j)=>{
    if(!x) return;
    h+='<div class="sy-ml-h">'+names[j]+'</div>';
    x.split('|').forEach(m=>{
      const r=/^(.*?)\s+(×\d+|\d+s)$/.exec(m)||[0,m,''];
      k++; h+='<div class="sy-ml"><span>'+k+'</span><b>'+hesc(r[1])+'</b><em>'+hesc(r[2])+'</em></div>';
    });
  });
  return h;
}
function syMoveCount(sn,lv){ return String(SYNC_S[sn-1].m[lv]||'').split(/[|/]/).filter(Boolean).length; }
function syRender(top){
  const o=$('syv'); if(!o) return;
  const d=syData(), n=syDone(), lv=syLevel(d.level), nxt=syNext(), nsn=sySession(nxt);
  const pc=(n/SYNC_N*100).toFixed(1);
  let h='<button class="sy-x" aria-label="Tutup" onclick="syClose()">'+SY_I.down+'</button>'+
    '<div class="sy-top" style="--c:'+SYNC_COL[nsn-1]+'">'+
      '<div class="sy-art" style="background-image:url(\''+SYNC_PIC+'\')"><span>HITFAT <b>SYNC</b> 30</span></div>'+
      '<div class="sy-t">HITFAT SYNC 30</div>'+
      '<div class="sy-s">Coach di telinga. Setiap ulangan dikira, ikut rentak muzik.</div>'+
      '<div class="sy-meta"><span class="sy-logo">H</span><b>HITFAT</b> · '+SYNC_N+' hari · 10 sesi · '+SYNC_MIN+' min sehari</div>'+
      '<div class="sy-acts">'+
        '<div class="sy-pr"><div><b>'+n+'</b> / '+SYNC_N+' hari siap</div><div class="sy-bar"><i style="width:'+pc+'%"></i></div></div>'+
        '<button class="sy-play" aria-label="Main hari '+nxt+'" onclick="syGo()">'+SY_I.play+'</button>'+
      '</div>'+
    '</div>'+
    '<div class="sy-body">'+
    '<div class="sy-chips">'+SYNC_LEVELS.map(l=>'<button class="'+(l.k===lv.k?'on':'')+'" onclick="syPick(\''+l.k+'\')">'+l.n+'</button>').join('')+'</div>'+
    '<div class="sy-lvs">'+hesc(lv.s)+'</div>';
  /* up next: one wide card */
  const nd=d.days[nxt];
  h+='<div class="sy-h2">'+(n?'Sambung semula':'Mula di sini')+'</div>'+
    '<button class="sy-up" onclick="syDay('+nxt+')">'+syCover(nsn,'sm')+
      '<div class="sy-up-in"><div class="sy-up-k">Hari '+nxt+' · '+syPhase(nxt).n+' · '+syPhase(nxt).t+'</div>'+
      '<div class="sy-up-t">'+hesc(SYNC_S[nsn-1].n)+'</div>'+
      '<div class="sy-up-s">'+(nd?'Program siap · ulang bila-bila':hesc(SYNC_S[nsn-1].s))+' · '+lv.n+' · '+SYNC_MIN+' min</div></div>'+
      '<span class="sy-up-p">'+SY_I.play+'</span></button>';
  /* the 10 sessions as a shelf of albums */
  h+='<div class="sy-h2">10 sesi<span>Leret →</span></div><div class="sy-shelf">';
  SYNC_S.forEach((S,i)=>{
    const sn=i+1, ds=syDaysOf(sn), dn=ds.filter(x=>d.days[x]).length;
    h+='<button class="sy-al'+(syReady(sn,lv.k)?'':' soon')+'" onclick="syDay('+sySessionDay(sn)+')">'+syCover(sn)+
      '<b>'+hesc(S.n)+'</b><small>Hari '+ds.join(', ')+(dn?' · '+dn+'/'+ds.length+' ✓':'')+'</small></button>';
  });
  h+='</div>';
  /* the 30 days as tracks, by phase */
  SYNC_PHASES.forEach(p=>{
    h+='<div class="sy-h2">'+p.n+' · '+p.t+'<span>Hari '+p.from+'–'+p.to+'</span></div><div class="sy-trs">';
    for(let i=p.from;i<=p.to;i++){
      const s=sySession(i), S=SYNC_S[s-1], dn=d.days[i], ok=syReady(s,lv.k), cl=['sy-tr'];
      if(dn) cl.push('done'); if(i===nxt && !dn) cl.push('nx'); if(!ok) cl.push('soon');
      h+='<button class="'+cl.join(' ')+'" onclick="syDay('+i+')">'+
        '<span class="sy-no">'+(i===nxt && !dn?'<i class="sy-eq"><i></i><i></i><i></i></i>':i)+'</span>'+syCover(s,'xs')+
        '<span class="sy-tr-in"><b>'+hesc(S.n)+'</b><small>'+(dn?'✓ Siap · '+syLevel(dn.lv).n:'Hari '+i+' · '+hesc(S.s))+'</small></span>'+
        '<span class="sy-tr-r">'+(dn?'<em class="sy-ok">'+SY_I.ok+'</em>':ok?SYNC_MIN+' min':'Akan datang')+'</span></button>';
    }
    h+='</div>';
  });
  h+='<div class="sy-h2">Tentang program</div><div class="sy-how">'+
      '<div><span>'+glyph('play')+'</span><p><b>Down… Up! ONE!</b> Setiap ulangan dikira dengan suara, ikut rentak muzik.</p></div>'+
      '<div><span>'+glyph('bolt')+'</span><p><b>Gerakan ikut masa</b> (high knee, plank…): coach bagi semangat sampai "3, 2, 1, Stop!"</p></div>'+
      '<div><span>'+glyph('target')+'</span><p><b>Pakai earphone</b> dan naikkan volume. Tiada alat diperlukan, cuma kerusi untuk tricep dip.</p></div></div>';
  if(syVideos()<SYNC_N) h+='<div class="sy-note">'+syVideos()+' / '+SYNC_N+' video sudah ada. Yang lain dimuat naik satu demi satu.</div>';
  h+='</div>';
  /* the mini player: the next day, always one tap away */
  if(!_syS) h+='<div class="sy-mini" onclick="syDay('+nxt+')">'+syCover(nsn,'xs')+
      '<div class="sy-mini-in"><b>Hari '+nxt+' · '+hesc(SYNC_S[nsn-1].n)+'</b><small>Seterusnya · '+lv.n+' · '+SYNC_MIN+' min</small></div>'+
      '<button class="sy-mini-p" aria-label="Main" onclick="event.stopPropagation();syGo()">'+SY_I.play+'</button>'+
      '<i class="sy-mini-bar" style="width:'+pc+'%"></i></div>';
  if(_syS) h+=sySheet(_syS);
  const keep=top?0:o.scrollTop;
  o.innerHTML=h; o.scrollTop=keep;
}
/* one day full screen, like "now playing": cover, title, level, ⏮ ▶ ⏭, then its moves as the track list */
function sySheet(day){
  const d=syData(), lv=syLevel(d.level), sn=sySession(day), S=SYNC_S[sn-1], ph=syPhase(day), dn=d.days[day], ok=syReady(sn,lv.k);
  return '<div class="sy-np'+(_syIn?' in':'')+'" style="--c:'+SYNC_COL[sn-1]+'">'+
    '<div class="sy-np-top"><button class="sy-np-x" aria-label="Kecilkan" onclick="syShut()">'+SY_I.down+'</button>'+
      '<div><small>Hari '+day+' / '+SYNC_N+'</small><b>'+ph.n+' · '+ph.t+'</b></div><span></span></div>'+
    syCover(sn,'lg')+
    '<div class="sy-np-t">'+hesc(S.n)+'</div>'+
    '<div class="sy-np-s">'+hesc(S.s)+' · '+syMoveCount(sn,lv.k)+' gerakan · '+SYNC_MIN+' min</div>'+
    (dn?'<div class="sy-tick">'+SY_I.ok+' Siap · '+syLevel(dn.lv).n+' · '+String(dn.at||'').slice(0,10)+'</div>':'')+
    '<div class="sy-np-bar"><i style="width:'+(day/SYNC_N*100).toFixed(1)+'%"></i></div>'+
    '<div class="sy-np-bt"><small>Hari 1</small><small>Hari '+SYNC_N+'</small></div>'+
    '<div class="sy-np-c">'+
      '<button aria-label="Hari sebelum" '+(day>1?'onclick="syDay('+(day-1)+')"':'disabled')+'>'+SY_I.prev+'</button>'+
      '<button class="sy-np-p'+(ok?'':' off')+'" aria-label="Main" onclick="syPlay('+day+')">'+SY_I.play+'</button>'+
      '<button aria-label="Hari selepas" '+(day<SYNC_N?'onclick="syDay('+(day+1)+')"':'disabled')+'>'+SY_I.next+'</button>'+
    '</div>'+
    '<div class="sy-np-go">'+(ok?(dn?'Ulang':'Mula')+' · '+lv.n:'Video '+hesc(S.n)+' ('+lv.n+') akan datang')+'</div>'+
    '<div class="sy-chips sm">'+SYNC_LEVELS.map(l=>'<button class="'+(l.k===lv.k?'on':'')+'" onclick="syPick(\''+l.k+'\')">'+l.n+'</button>').join('')+'</div>'+
    '<div class="sy-np-list"><div class="sy-np-lh">Dalam sesi ini</div>'+syMoveList(sn,lv.k)+'</div>'+
  '</div>';
}

/* ── the player: the session video full screen, with its own sound ── */
let _sy=null;   /* {day, sn, lv, sid, seen, dur, done} */
function syVimeo(v){
  const p=String(v).split('/');
  return 'https://player.vimeo.com/video/'+p[0]+'?'+(p[1]?'h='+p[1]+'&':'')+'autoplay=1&title=0&byline=0&portrait=0&dnt=1&playsinline=1&texttrack=false';
}
function syPlay(n){
  const lv=syData().level, day=n||syNext(), sn=sySession(day); if(!syReady(sn,lv)) return;
  syStop();
  _sy={day:day, sn:sn, lv:lv, sid:null, seen:0, dur:0, done:false};
  const o=document.createElement('div'); o.id='syp';
  o.innerHTML='<iframe src="'+syVimeo(SYNC_VIDEO[syKey(sn,lv)])+'" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen title="HITFAT SYNC"></iframe>'+
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
function syLabel(p){ return 'HITFAT SYNC · Hari '+p.day+' · '+SYNC_S[p.sn-1].n+' · '+syLevel(p.lv).n; }
function sySessionStart(){
  try{
    if(!sb || !HF.userId || !_sy) return;
    const p=_sy;
    sb.rpc('plus_session_start',{p_program:SYNC_ID, p_day:p.day-1, p_label:syLabel(p)})
      .then(r=>{ if(r && !r.error && _sy===p) p.sid=r.data; }).catch(()=>{});
  }catch(e){}
}
function syFinish(){
  if(!_sy || _sy.done) return; _sy.done=true;
  const d=syData(), p=_sy, at=new Date().toISOString();
  d.days[p.day]={lv:p.lv, at:at};
  d.log.push({n:p.day, s:p.sn, lv:p.lv, at:at});
  HF.markDone(SYNC_ID+'-s'+(p.day-1),{name:syLabel(p), mins:SYNC_MIN});
  try{ if(sb && p.sid){ const id=p.sid; p.sid=null; sb.rpc('plus_session_finish',{p_id:id}).then(()=>{ if(typeof _lbCache!=='undefined') _lbCache={}; }).catch(()=>{}); } }catch(e){}
  const o=$('syp');
  if(o){
    const el=document.createElement('div'); el.className='sy-done';
    el.innerHTML='<div class="sy-k">Hari '+p.day+' / '+SYNC_N+' · '+hesc(SYNC_S[p.sn-1].n)+' · '+syLevel(p.lv).n+'</div><div class="sy-t">SIAP!</div>'+
      '<div class="sy-s">'+SYNC_MIN+' minit, ikut rentak. Direkod dalam streak anda.</div>'+
      '<button class="sy-go" onclick="syStop();_syS=0;syRender()">Tutup</button>';
    o.appendChild(el);
  }
  if(typeof toast==='function') toast('Hari '+p.day+' SYNC siap 🔥');
}
