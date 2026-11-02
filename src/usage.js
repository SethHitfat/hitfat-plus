/* ═══════════════════════════════════════════════════════════════
   Usage (2 Nov 2026, Seth: "mudah aku nk tahu apa yang diorang bukak")

   Which screens people open, and when, for the report in HITFAT OS.
   Screen names only: never what anyone types, eats or weighs. Each open
   function is wrapped once here, so no screen has to remember to report.
   Nothing here may ever get in the way of the app, so every step fails
   silently; a screen lost on a bad connection is only a smaller count.
   ═══════════════════════════════════════════════════════════════ */
(function(){ try{
  var MAP={openProgram:'program',openDay:'hari_latihan',playDay:'mula_latihan',openLibrary:'library',
    openStore:'kedai',openPaywall:'paywall',openScan:'scan',openMonthly:'bulanan',openAICoach:'ai_coach',
    openAcademy:'academy',openRecipeBooks:'resepi',openMyWeek:'my_week',openMealPlan:'meal_plan',
    openCustom:'custom',openClub:'club',openKelas:'kelas',openT42:'t42',openFinder:'finder',openD6:'d6',openIF:'if'};
  var q=[], last='', hidAt=0;
  function add(n){ if(!n||n===last) return; last=n; if(q.length<60) q.push({n:n,t:new Date().toISOString()}); }
  function flush(){ try{
    if(!q.length||typeof sb==='undefined'||!sb||!HF.userId) return;
    var r=sb.rpc('plus_track',{p_items:q.splice(0,30)});
    if(r&&r.then) r.then(null,function(){});
  }catch(e){} }
  function wrap(fn,name){ var f=window[fn]; if(typeof f!=='function') return;
    window[fn]=function(a){ try{ add(name||String(a||'')); }catch(e){} return f.apply(this,arguments); }; }
  Object.keys(MAP).forEach(function(k){ wrap(k,MAP[k]); });
  wrap('switchTab');
  add('app_open');
  setInterval(flush,20000);
  document.addEventListener('visibilitychange',function(){
    if(document.hidden){ hidAt=Date.now(); flush(); return; }
    if(hidAt&&Date.now()-hidAt>1800000){ last=''; add('app_open'); }
    hidAt=0;
  });
}catch(e){} })();
