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
  /* Home carries the HITFAT Score (score.js), Bara in its arc; the compact card is the fallback */
  if(typeof scRender==='function') scRender();
  else M.render($('mascot-home'), { mode:'compact', dates:d, onClick:function(){ switchTab('progress'); } });
  var st=M.render($('mascot-progress'), { mode:'full', dates:d });
  /* the file's hint reads "Aktif 2 hari lagi ... naik ke Aktif" when the next
     stage is itself called Aktif: say it without the clash */
  var el=$('mascot-progress'), hint=el && el.querySelector && el.querySelector('.hfm-hint');
  if(hint && st && st.nextName) hint.innerHTML='Workout <b>'+st.daysToNext+' hari lagi</b> minggu ni untuk naik ke <b>'+st.nextName+'</b>.';
}
/* a workout finished, in any program */
function mascotDone(){
  var M=hfm(); if(!M) return;
  M.logActivity(); if(typeof scEvent==='function'){ _scSay='workout'; _scSayAt=Date.now(); }
  if(typeof scBanner==='function') scBanner('Workout siap 💪','Bara buat setiap rep dengan awak (dalam hati) 😅');
  mascotRender();
}
