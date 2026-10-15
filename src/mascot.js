/* ═══════════════ The progress mascot · glue ═══════════════
   parts/hitfat-mascot.js is Seth's file, loaded as it came; it puts HFMascot
   on window. This is what ties it to HITFAT+: the days come from the workouts
   saved on the account (HF.data.sessions, which syncs to the database),
   joined with the mascot's own log on this phone, so a workout done on
   another device still counts. */
function hfm(){ return (typeof window!=='undefined' && window.HFMascot) || null; }
/* the four stages, cut from Seth's artwork on a clear ground: Comel, Aktif, Tegap, Juara */
if(hfm()) hfm().config.images=['/img/mascot/m1.png','/img/mascot/m2.png','/img/mascot/m3.png','/img/mascot/m4.png'];
function mascotDates(){
  var out=[], s=(HF.data&&HF.data.sessions)||{}, k;
  for(k in s){ if(s.hasOwnProperty(k) && s[k] && s[k].date) out.push(s[k].date); }
  return hfm() ? out.concat(hfm()._readLog()) : out;
}
function mascotRender(){
  var M=hfm(); if(!M) return;
  var d=mascotDates();
  /* Home carries the HITFAT Score (score.js), Bell in its arc; the compact card is the fallback */
  if(typeof scRender==='function') scRender();
  else M.render($('mascot-home'), { mode:'compact', dates:d, onClick:function(){ switchTab('progress'); } });
  M.render($('mascot-progress'), { mode:'full', dates:d });
}
/* a workout finished, in any program */
function mascotDone(){
  var M=hfm(); if(!M) return;
  M.logActivity(); if(typeof scEvent==='function'){ _scSay='workout'; _scSayAt=Date.now(); } mascotRender();
}
