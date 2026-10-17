/* ═══════════════ HITFAT SOUNDS (17 Oct 2026) ═══════════════
   Seth: a cute sound of HITFAT's own, the way Foodpanda, Grab and Shopee
   have theirs. Made here with Web Audio, note by note: no recording, no
   licence, nothing to download.

     giggle  touching Bara: a small voice saying "HIT-FAT!" (sfx/hitfat-tap)
     cheer   the HITFAT sound: the same voice, a touch quicker and higher,
             with a sparkle after it (sfx/hitfat); a class checked in, Bara
             turning red, a mission done
     The voice: Seth chose no. 9 (Daisy, a preset AI voice from Higgsfield,
     not anyone's cloned voice) on 17 Oct. Until it has loaded the notes
     below stand in; a tap while it still speaks stays quiet (no pile-up).
     bell    Ring the bell: a struck bell that rings out
     pop     a small tap: a reaction in the group

   Notifications cannot carry it: a web app's push uses the phone's own
   sound (iOS and Android both). Only an App Store app can bring its own.

   Quiet on purpose, and it follows the iPhone's silent switch (the
   'ambient' audio session). Me → Sounds turns it off. */
var _hfAC=null;
function hfSoundOn(){ return !(HF && HF.data && HF.data.prefs && HF.data.prefs.sound===false); }
function hfAC(){
  if(_hfAC) return _hfAC;
  try{
    if(typeof navigator!=='undefined' && navigator.audioSession) navigator.audioSession.type='ambient';
    var C=window.AudioContext||window.webkitAudioContext; if(!C) return null;
    _hfAC=new C();
  }catch(e){ _hfAC=null; }
  return _hfAC;
}
/* one note: a shape, a pitch (or a glide), a length, a level */
function hfTone(ac,t,type,f0,f1,dur,vol){
  var o=ac.createOscillator(), g=ac.createGain();
  o.type=type; o.frequency.setValueAtTime(f0,t);
  if(f1 && f1!==f0) o.frequency.exponentialRampToValueAtTime(f1,t+dur*0.6);
  g.gain.setValueAtTime(0.0001,t);
  g.gain.exponentialRampToValueAtTime(vol,t+0.012);
  g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  o.connect(g); g.connect(ac.destination);
  o.start(t); o.stop(t+dur+0.02);
}
/* the spoken HITFAT, fetched once and kept decoded */
var HF_VOICE={giggle:'/sfx/hitfat-tap.m4a',cheer:'/sfx/hitfat.m4a'}, _hfBuf={}, _hfVoiceEnd=0;
function hfVoiceLoad(ac,name){
  if(_hfBuf[name]!==undefined || !HF_VOICE[name] || typeof fetch!=='function') return;
  _hfBuf[name]=null;
  fetch(HF_VOICE[name]).then(function(r){ return r.arrayBuffer(); })
    .then(function(b){ return new Promise(function(ok,no){ ac.decodeAudioData(b,ok,no); }); })
    .then(function(buf){ _hfBuf[name]=buf; }, function(){ delete _hfBuf[name]; });
}
function hfVoice(ac,name){
  var buf=_hfBuf[name];
  if(!buf) return false;
  if(ac.currentTime<_hfVoiceEnd) return true;
  var s=ac.createBufferSource(), g=ac.createGain();
  g.gain.value=0.55; s.buffer=buf; s.connect(g); g.connect(ac.destination); s.start();
  _hfVoiceEnd=ac.currentTime+buf.duration;
  return true;
}
function hfSound(name){
  if(!hfSoundOn()) return;
  var ac=hfAC(); if(!ac) return;
  try{ if(ac.state==='suspended') ac.resume(); }catch(e){}
  hfVoiceLoad(ac,'giggle'); hfVoiceLoad(ac,'cheer');
  var t=ac.currentTime+0.01;
  try{
    if(HF_VOICE[name] && hfVoice(ac,name)) return;
    if(name==='giggle'){
      hfTone(ac,t,'sine',880,1240,0.09,0.16);
      hfTone(ac,t+0.08,'sine',990,1400,0.09,0.15);
      hfTone(ac,t+0.16,'sine',1100,1660,0.13,0.14);
    } else if(name==='cheer'){
      hfTone(ac,t,'triangle',784,784,0.12,0.22);            /* HIT */
      hfTone(ac,t+0.13,'triangle',1046,1318,0.30,0.22);     /* FAT, bouncing up */
      hfTone(ac,t+0.17,'sine',2637,2637,0.22,0.05);         /* the sparkle */
      hfTone(ac,t+0.30,'sine',3136,3136,0.18,0.035);
    } else if(name==='bell'){
      hfTone(ac,t,'sine',1318,1318,1.3,0.2);
      hfTone(ac,t,'sine',2637,2637,0.9,0.07);
      hfTone(ac,t,'sine',3951,3951,0.5,0.03);
    } else if(name==='pop'){
      hfTone(ac,t,'sine',620,980,0.07,0.14);
    }
  }catch(e){}
}
function hfSoundSet(on){
  HF.data.prefs=HF.data.prefs||{}; HF.data.prefs.sound=!!on; HF.save();
  if(on) hfSound('cheer');
  if(typeof renderMe==='function' && $('me') && $('me').style.display!=='none') renderMe();
}
/* the first touch anywhere opens the sound and fetches the voice, so the
   first tap on Bara already speaks */
if(typeof document!=='undefined' && document.addEventListener){
  document.addEventListener('pointerdown',function hfWake(){
    document.removeEventListener('pointerdown',hfWake,true);
    if(!hfSoundOn()) return;
    var ac=hfAC(); if(ac){ hfVoiceLoad(ac,'giggle'); hfVoiceLoad(ac,'cheer'); }
  },true);
}
