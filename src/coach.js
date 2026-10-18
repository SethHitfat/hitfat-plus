/* ═══════════════ THE COACH IN YOUR EAR (18 Oct 2026) ═══════════════
   Seth: "aku nak biar ada music … dengan command voice. Ready, 3, 2, 1, go.
   Okay, squat … nak habis 5, 4, 3, 2, 1, rest. Macam coach tengah bercakap."

   Voice: short clips made once with an AI voice (Higgsfield / ElevenLabs,
   preset "Brooks", not anyone's cloned voice), one per cue and one per
   exercise name, under /sfx/coach/<voice>/ and /sfx/coach/<voice>/n/<slug>.
   A name without a clip is read by the phone's own voice instead.
   Music: two original loops synthesised note by note for HITFAT
   (_projek/workout_music/wmusic.swift), so nothing is licensed or copied.

   Both are fetched only when a workout opens, mixed in Web Audio, and the
   music dips under the coach. With our music on, the phone plays it like a
   music app (the silent switch doesn't mute it); with it off, the coach
   mixes over the member's own Spotify. */
const CO_VOICE='v1';
const CO_TRACKS={pulse:{n:'Pulse',u:'/sfx/music/pulse.m4a',loop:60.0},
                 drive:{n:'Drive',u:'/sfx/music/drive.m4a',loop:54.857143}};
const CO_CUES=['ready','c5','c4','c3','c2','c1','go','rest','rest1','rest2','rest3','next','first',
  'half1','half2','half3','ten1','ten2','last','round','lastround','done'];
const CO_SAY={'Step Up Box or Chair':'Step Ups','SLDL':'Single Leg Deadlift','RDL':'Romanian Deadlift','IC Warm':'Warm Up',
  '90/90 Hip Switch':'Ninety Ninety Hip Switch','Childs Pose':"Child's Pose",'Kettlebell Bend Over Row':'Kettlebell Bent Over Row',
  'Tricep Dip Chair':'Chair Tricep Dips','Sprint On Spot':'Sprint On The Spot'};
let co={buf:{}, q:[], src:null, vEnd:0, mSrc:null, mGain:null, vGain:null, mAt:0, mOff:0, mKey:null, n:0};

/* a workout under way: moving or resting, not paused, not finished */
function coLive(){ return !!(pl && pl.started && !pl.finished && (pl.running || pl.resting)); }
function coPrefs(){ const p=(HF.data&&HF.data.prefs)||{}; return {voice:p.coachVoice!==false, music:p.music===undefined?'pulse':p.music}; }
function coSet(k,v){
  HF.data.prefs=HF.data.prefs||{}; HF.data.prefs[k]=v; HF.save();
  if(k==='music'){ coMusicStop(); co.mOff=0; if(coLive()) coMusicPlay(); else if(CO_TRACKS[v]) coLoad(CO_TRACKS[v].u); }
  if(k==='coachVoice' && !v) coHush();
  coSession(); coPanelPaint(); coReadyLine();
}
/* the name as it is shown → the clip it is kept under */
function coNorm(n){ return String(n||'').replace(/\(.*?\)/g,'').replace(/\s+\d+$/,'').replace(/\s+/g,' ').trim(); }
function coSlug(n){ return coNorm(n).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,''); }
function coSpoken(n){ const k=coNorm(n); return CO_SAY[k]||k.replace(/\bALT\b/g,'Alternating'); }
function coCueUrl(k){ return '/sfx/coach/'+CO_VOICE+'/'+k+'.m4a'; }
function coNameUrl(n){ return '/sfx/coach/'+CO_VOICE+'/n/'+coSlug(n)+'.m4a'; }

/* fetched once, kept decoded; null while on its way, false when missing */
function coLoad(u){
  const ac=typeof hfAC==='function'?hfAC():null;
  if(!ac || co.buf[u]!==undefined || typeof fetch!=='function') return;
  co.buf[u]=null;
  fetch(u).then(r=>{ if(!r.ok) throw 0; return r.arrayBuffer(); })
    .then(b=>new Promise((ok,no)=>ac.decodeAudioData(b,ok,no)))
    .then(b=>{ co.buf[u]=b; if(u===coTrackUrl() && coLive() && !co.mSrc) coMusicPlay(); },()=>{ co.buf[u]=false; });
}
function coTrackUrl(){ const m=coPrefs().music; return CO_TRACKS[m]?CO_TRACKS[m].u:null; }
/* when a workout opens: every cue, this workout's names, the chosen track */
function coPrep(exs){
  const p=coPrefs();
  if(p.voice){ CO_CUES.forEach(k=>coLoad(coCueUrl(k))); (exs||[]).forEach(e=>coLoad(coNameUrl(e.n))); }
  if(coTrackUrl()) coLoad(coTrackUrl());
}
/* iPhone: our music plays like a music app; the coach alone mixes with the member's own */
function coSession(on){
  try{
    if(typeof navigator==='undefined' || !navigator.audioSession) return;
    const live=on!==undefined?on:!!(pl && !pl.finished);
    navigator.audioSession.type=(live && coTrackUrl())?'playback':'ambient';
  }catch(e){}
}
function coAC(){
  const ac=typeof hfAC==='function'?hfAC():null; if(!ac) return null;
  if(ac.state!=='running' && ac.resume){ try{ ac.resume(); }catch(e){} }
  if(!co.vGain){ co.vGain=ac.createGain(); co.vGain.gain.value=1; co.vGain.connect(ac.destination);
                 co.mGain=ac.createGain(); co.mGain.gain.value=0; co.mGain.connect(ac.destination); }
  return ac;
}

/* ── the voice: a queue, so "Next up" and the name follow each other ── */
function coSay(keys,cut){
  if(!coPrefs().voice) return;
  if(cut) coHush();
  co.q=co.q.concat(keys.filter(Boolean));
  if(!co.src && !co.speaking) coNext();
}
function coHush(){
  co.q=[];
  if(co.src){ try{ co.src.onended=null; co.src.stop(); }catch(e){} co.src=null; }
  try{ if(co.speaking && window.speechSynthesis) speechSynthesis.cancel(); }catch(e){}
  co.speaking=false; coDuck(false);
}
/* a cue is 'c3' or 'go'; a name is {n:'Squat Jump'} */
function coNext(){
  const ac=coAC(); const k=co.q.shift();
  if(k===undefined){ coDuck(false); return; }
  if(!ac){ co.q=[]; return; }
  const u=typeof k==='string'?coCueUrl(k):coNameUrl(k.n), b=co.buf[u];
  if(b){
    const s=ac.createBufferSource(); s.buffer=b; s.connect(co.vGain);
    s.onended=()=>{ if(co.src===s){ co.src=null; coNext(); } };
    co.src=s; coDuck(true); s.start();
    return;
  }
  /* no clip yet: a name goes to the phone's own voice; a cue still loading is skipped */
  if(typeof k!=='string' && coSpeak(coSpoken(k.n))) return;
  coNext();
}
function coSpeak(t){
  try{
    if(typeof window==='undefined' || !window.speechSynthesis || typeof SpeechSynthesisUtterance==='undefined') return false;
    const u=new SpeechSynthesisUtterance(t); u.lang='en-US'; u.rate=1.05;
    u.onend=u.onerror=()=>{ co.speaking=false; coNext(); };
    co.speaking=true; coDuck(true); speechSynthesis.speak(u);
    return true;
  }catch(e){ co.speaking=false; return false; }
}

/* ── the music: a seamless loop that dips under the coach and in the rest ── */
function coLevel(){ return (pl && pl.resting)?0.32:0.5; }
function coDuck(on){
  const ac=typeof hfAC==='function'?hfAC():null; if(!ac || !co.mGain || !co.mSrc) return;
  const t=ac.currentTime, g=co.mGain.gain, v=coLevel()*(on?0.4:1);
  try{ g.cancelScheduledValues(t); g.setValueAtTime(g.value,t); g.linearRampToValueAtTime(v,t+(on?0.08:0.45)); }catch(e){ g.value=v; }
}
function coMusicPlay(){
  const u=coTrackUrl(); if(!u) return;
  const ac=coAC(), b=co.buf[u];
  if(!ac) return;
  if(!b){ coLoad(u); return; }
  if(co.mSrc && co.mKey===u) return;
  coMusicStop();
  const tr=CO_TRACKS[coPrefs().music], s=ac.createBufferSource();
  s.buffer=b; s.loop=true;
  /* the loop's own length, so the encoder's padding never makes a gap */
  const L=Math.min(tr.loop,b.duration); s.loopStart=0; s.loopEnd=L;
  s.connect(co.mGain);
  co.mGain.gain.cancelScheduledValues(ac.currentTime);
  co.mGain.gain.setValueAtTime(0,ac.currentTime);
  co.mGain.gain.linearRampToValueAtTime(coLevel()*(co.src||co.speaking?0.4:1),ac.currentTime+0.6);
  const off=co.mKey===u?(co.mOff%L):0;
  s.start(0,off); co.mSrc=s; co.mKey=u; co.mAt=ac.currentTime-off;
}
function coMusicStop(){
  const ac=typeof hfAC==='function'?hfAC():null;
  if(!co.mSrc) return;
  if(ac) co.mOff=ac.currentTime-co.mAt;
  try{ co.mSrc.stop(); }catch(e){}
  co.mSrc=null;
}

/* ── the moments, called from the player ── */
/* each second of a move: halfway, ten to go, then the count out */
function coWorkTick(){
  if(!pl || !coPrefs().voice) return;
  const left=pl.left, len=pl.len||left, half=Math.floor(len/2);
  if(left>=1 && left<=5) coSay(['c'+left],true);
  else if(len>=30 && left===half && half>10) coSay([['half1','half2','half3'][(co.n++)%3]]);
  else if(len>=25 && left===10) coSay([['ten1','ten2'][(co.n++)%2]]);
}
function coRestStart(n){
  if(!pl) return;
  coDuck(false);
  const last=!(n.i+1<pl.exs.length || n.round<pl.rounds);
  const k=[(co.n++)%2?'rest1':'rest'];
  if(n.round!==pl.round) k.push(n.round===pl.rounds?'lastround':'round');
  k.push('next',{n:pl.exs[n.i].n});
  if(last) k.push('last');
  coSay(k,true);
}
function coRestTick(){
  if(!pl || !pl.rest || !coPrefs().voice) return;
  const l=pl.rest.left;
  if(l>=1 && l<=3) coSay(['c'+l],true);
  else if(l===0) coSay(['go'],true);
  else if(l===12 && pl.rest.total>=20 && !co.src) coSay([(co.n++)%2?'rest2':'rest3']);
}
function coCountdown(c){ if(c===4) coSay(['ready'],true); else if(c>0) coSay(['c'+c],true); else coSay(['go',{n:pl&&pl.exs[pl.i].n}],true); }
/* iPhone lets the phone's own voice speak later only if it first spoke inside a tap */
function coUnlock(){
  coAC();
  try{ if(coPrefs().voice && window.speechSynthesis && typeof SpeechSynthesisUtterance!=='undefined' && !co.su){ co.su=1; const u=new SpeechSynthesisUtterance(' '); u.volume=0; speechSynthesis.speak(u); } }catch(e){}
}
function coPause(){ coHush(); coMusicStop(); }
function coResume(){ coMusicPlay(); }
function coFinish(){ coMusicStop(); co.mOff=0; coSay(['done'],true); coSession(false); }
function coExit(){ coHush(); coMusicStop(); co.mOff=0; co.mKey=null; coSession(false); }

/* ── the controls: a speaker in the player's top bar and a line on the ready screen ── */
function coSummary(){
  const p=coPrefs();
  return (p.voice?'Coach voice on':'Coach voice off')+' · '+(CO_TRACKS[p.music]?'Music: '+CO_TRACKS[p.music].n:'No music');
}
function coReadyLine(){
  const b=$('pl-rdsnd'); if(b) b.innerHTML='<svg class="gly" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/></svg><span>'+coSummary()+'</span>';
}
function coPanel(){
  let el=$('pl-snd');
  if(!el){
    el=document.createElement('div'); el.id='pl-snd'; el.className='pl-snd';
    el.onclick=e=>{ if(e.target===el) coPanelClose(); };
    ($('play')||document.body).appendChild(el);
  }
  coPanelPaint(); el.classList.add('on');
}
function coPanelClose(){ const el=$('pl-snd'); if(el) el.classList.remove('on'); }
function coPanelPaint(){
  const el=$('pl-snd'); if(!el) return;
  const p=coPrefs();
  const chip=(on,lab,js)=>'<button class="'+(on?'on':'')+'" onclick="'+js+'">'+lab+'</button>';
  el.innerHTML='<div class="pl-sndc">'+
    '<div class="h"><b>Sound</b><button class="x" onclick="coPanelClose()" aria-label="Close">✕</button></div>'+
    '<div class="r"><span>Coach voice</span><div class="seg">'+chip(p.voice,'On','coSet(\'coachVoice\',true)')+chip(!p.voice,'Off','coSet(\'coachVoice\',false)')+'</div></div>'+
    '<div class="s">Ready, 3-2-1, go · the move\'s name · 5-4-3-2-1, rest · what\'s next</div>'+
    '<div class="r"><span>Music</span><div class="seg">'+
      Object.keys(CO_TRACKS).map(k=>chip(p.music===k,CO_TRACKS[k].n,'coSet(\'music\',\''+k+'\')')).join('')+
      chip(!CO_TRACKS[p.music],'Off','coSet(\'music\',\'off\')')+'</div></div>'+
    '<div class="s">'+(CO_TRACKS[p.music]?'HITFAT\'s own tracks. Plays even with the silent switch on.':'Play your own music; the coach talks over it.')+'</div>'+
  '</div>';
}
