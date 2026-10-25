/* ═══════════════ HYROX by HITFAT (19 Oct 2026) ═══════════════
   Three programs from HITFAT Hybrid (hybrid.hitfat.io), at Hybrid's prices:
     hx12  HYROX 12-Week Race Ready   RM149  12 weeks × 5 days, three levels
     hx8   HYROX 8-Week Race Prep     RM99    8 weeks × 5 days, three levels
     hxft  HYROX First Timer          RM19    4 weeks × 4 sessions
   Each is part of HITFAT+ (All Access, and class members through it) and
   sold on its own, like MAK2FIT 30. The sessions are Hybrid's own
   words (parts/hyroxdata.js): a coach's whiteboard for the race builds,
   blocks of moves with HITFAT's clips for the First Timer. They are gym
   sessions (SkiErg, rower, sled, wall balls), so the page says so.

   State, in keys HF already keeps (HF.apply drops any other):
     HF.data.sessions['hx12-w3-d2']   a session done ({date, name, mins, res})
     HF.data.progress[id]             the first session not yet done
     HF.data.prefs.hxLevel            Beginner, OPEN or PRO
   A done session is a workout like any other: Bara and the streak count it. */

var HX_LEVELS=['Beginner','OPEN','PRO'];
var HX_PICK8=[0,2,4,6,8,9,10,11];          // Hybrid's KL8_PICK: the 8 weeks taken from the 12
var HX_ACCENT='#FFD400';
var HX_GEAR_RACE=['SkiErg','RowErg','Sled','Wall ball','Kettlebells','Dumbbells','Sandbag'];
var HX_DEFS=[
  {id:'hx12', name:'HYROX 12-Week Race Ready', short:'12-Week Race Ready', price:149, wk:12, per:5, kind:'race', mins:60,
   kick:'12 weeks · 5 days', line:'Base, Pace, Accelerate, Prime, Race',
   desc:'The full race build from HITFAT Hybrid: Base, Pace, Accelerate, Prime and Race, five sessions a week, at your level. It opens with a benchmark test, so you see how far you come.'},
  {id:'hx8', name:'HYROX 8-Week Race Prep', short:'8-Week Race Prep', price:99, wk:8, per:5, kind:'race', mins:60,
   kick:'8 weeks · 5 days', line:'The final block before race day',
   desc:'A complete race-ready block from HITFAT Hybrid: eight weeks, five sessions a week, at your level. Nothing wasted before race day.'},
  {id:'hxft', name:'HYROX First Timer', short:'First Timer', price:19, wk:4, per:4, kind:'ft', mins:45,
   kick:'4 weeks · 4 days', line:'Your first HYROX, step by step',
   desc:'Four weeks for anyone curious about HYROX: hybrid basics, then engine and strength, then the stations, then a mini simulation. Every move has a HITFAT clip where one is filmed.'}
];
function hxDef(id){ for(var i=0;i<HX_DEFS.length;i++) if(HX_DEFS[i].id===id) return HX_DEFS[i]; return null; }
function hxLevel(){ var l=HF.data.prefs&&HF.data.prefs.hxLevel; return HX_LEVELS.indexOf(l)>=0?l:'Beginner'; }
function hxSetLevel(l){ if(HX_LEVELS.indexOf(l)<0) return; HF.data.prefs.hxLevel=l; HF.save(); renderHX(); }

/* the weeks of a program at a level: [{label, block, days:[…]}] */
function hxWeeks(def,lv){
  if(def.kind==='ft') return HX_FT.map(function(w){ return {label:'Week '+w.week, block:w.phase, days:w.days}; });
  var src=(HX_RACE[lv||hxLevel()]||HX_RACE.Beginner).weeks;
  var picked=def.wk===8?HX_PICK8.map(function(i){ return src[i]; }):src;
  return picked.map(function(w,i){ return {label:'Week '+(i+1), block:w.block, days:w.days}; });
}
function hxKey(id,w,d){ return id+'-w'+(w+1)+'-d'+(d+1); }
function hxFlat(def){ var out=[]; hxWeeks(def).forEach(function(w,wi){ w.days.forEach(function(d,di){ out.push({w:wi,d:di,day:d}); }); }); return out; }
function hxDoneN(def){ var n=0; hxFlat(def).forEach(function(x){ if(HF.isDone(hxKey(def.id,x.w,x.d))) n++; }); return n; }
/* the first session not done: where Continue goes, and what the plan lists read */
function hxNext(def){ var f=hxFlat(def); for(var i=0;i<f.length;i++) if(!HF.isDone(hxKey(def.id,f[i].w,f[i].d))) return i; return f.length; }
function hxSync(def){ HF.data.progress[def.id]=hxNext(def); }
function hxOwned(def){ return ownsProgram(hxProg(def.id)); }
function hxProg(id){ for(var i=0;i<PROGRAMS.length;i++) if(PROGRAMS[i].id===id) return PROGRAMS[i]; return null; }
function hxFtMins(s){ var m=0; (s.blocks||[]).forEach(function(b){ m+=(+b.mins||0); }); return m; }
function hxTitle(def,day){ return def.kind==='ft'?day.title:day.type; }
/* a session's one-line preview: its first two lines, bullets dropped ("3× · Goblet squat × 20") */
function hxFirstLine(t){ return String(t||'').split('\n').map(function(x){ return x.replace(/^[\s•\-*]+/,'').trim(); }).filter(Boolean).slice(0,2).join(' · '); }

/* the programs, in the shape the rest of the app reads (Train, plans, the store) */
var HX_PROGS=HX_DEFS.map(function(def){
  var weeks=hxWeeks(def,'Beginner').map(function(w){ return {days:w.days.map(function(d){ return {name:hxTitle(def,d), ex:[]}; })}; });
  var p={id:def.id, name:def.name, sub:def.kick+' · gym', goal:'Strength', level:'All levels', dur:def.mins, rounds:1,
    c1:'#26260f', c2:'#0b0b0d', ac:HX_ACCENT, icon:'🏁', weeks:weeks, hub:'hx', oneTime:true, price:def.price, wk:def.wk, desc:def.desc};
  var old=hxProg(def.id); if(old){ for(var k in p) if(p.hasOwnProperty(k)) old[k]=p[k]; return old; }
  PROGRAMS.push(p); return p;
});

/* ── the program page ── */
var hxWeekOpen=-1;
function hxCur(){ return curProg && curProg.hub==='hx' ? hxDef(curProg.id) : null; }
function hxPoster(def,cls){
  return '<div class="hx-poster '+(cls||'')+'"><div class="hx-ph" style="background-image:url(\'/img/p/'+def.id+'.jpg\');'+
    '-webkit-mask-image:url(\'/img/p/mask/'+def.id+'.png\');mask-image:url(\'/img/p/mask/'+def.id+'.png\')"></div>'+
    '<div class="hx-ptx"><div class="hx-k">HYROX · HITFAT</div><div class="hx-n">'+hesc(def.short)+'</div><div class="hx-s">'+hesc(def.kick)+'</div></div></div>';
}
function renderHX(){
  var def=hxCur(); if(!def) return;
  hxSync(def);
  var owned=hxOwned(def), W=hxWeeks(def), f=hxFlat(def), nx=hxNext(def), tot=f.length, done=hxDoneN(def);
  if(hxWeekOpen<0 || hxWeekOpen>=W.length) hxWeekOpen=nx<tot?f[nx].w:W.length-1;
  var pill=!owned?{icon:'lock',label:'RM'+def.price,go:"hxBuy('"+def.id+"')"}:nx<tot?{icon:'play',label:'Week '+(f[nx].w+1)+' · Day '+(f[nx].d+1),go:'hxOpenDay('+nx+')'}:null;
  var h=pdxBar('program',pill)+hxPoster(def,'');
  h+='<div class="wl-hero-tx"><div class="s">'+hesc(def.line)+'</div><div class="m">'+(owned?(done?done+' of '+tot+' sessions done':'Included with your HITFAT+'):'One payment · yours for good · also in HITFAT+')+'</div></div>';
  if(owned && done) h+='<div class="lb-head"><div class="pbar hx-bar"><i style="width:'+Math.round(done/tot*100)+'%"></i></div><span>'+Math.round(done/tot*100)+'%</span></div>';
  h+='<div class="pdx-btns">';
  if(!owned) h+='<button class="bigbtn hx-btn" onclick="hxBuy(\''+def.id+'\')">Get the program · RM'+def.price+'</button>'+
                '<button class="pdx-prev" onclick="openPaywall(\'\')">'+glyph('star')+'Included in HITFAT+</button>';
  else if(nx<tot) h+='<button class="bigbtn hx-btn" onclick="hxOpenDay('+nx+')">'+glyph('play')+(done?'Continue · Week '+(f[nx].w+1)+' Day '+(f[nx].d+1):'Start Week 1 · Day 1')+'</button>';
  h+='</div>';
  h+='<p class="hx-desc">'+hesc(def.desc)+'</p>';
  /* the level, for the race builds */
  if(def.kind==='race'){
    var lv=hxLevel();
    h+=fsec('Your level','Change it any time; your progress stays.');
    h+='<div class="hx-lv">'+HX_LEVELS.map(function(l){ return '<button class="'+(l===lv?'on':'')+'" onclick="hxSetLevel(\''+l+'\')">'+l+'</button>'; }).join('')+'</div>';
    h+='<div class="hx-lvd">'+hesc((HX_RACE[lv]||{}).desc||'')+'</div>';
  }
  /* the weeks */
  h+=fsec(W.length+' weeks','');
  h+='<div class="filters pdx-weeks">'+W.map(function(w,i){
    var all=w.days.every(function(d,di){ return HF.isDone(hxKey(def.id,i,di)); });
    return '<button class="chip'+(i===hxWeekOpen?' y':'')+'" onclick="hxWeekOpen='+i+';renderHX()">'+(all?'✓ ':'')+'Week '+(i+1)+'</button>'; }).join('')+'</div>';
  var w=W[hxWeekOpen], base=0, i;
  for(i=0;i<hxWeekOpen;i++) base+=W[i].days.length;
  h+='<div class="hx-week"><span>'+hesc(w.label)+'</span><b>'+hesc(w.block||'')+'</b></div>';
  h+='<div class="hx-days">'+w.days.map(function(d,di){
    var gi=base+di, isDone=HF.isDone(hxKey(def.id,hxWeekOpen,di)), now=owned && gi===nx;
    var m=def.kind==='ft'?(hxFtMins(d)?hxFtMins(d)+' min · ':'')+'RPE '+(d.rpe||'–'):hxFirstLine(d.workout);
    return '<div class="hx-day'+(isDone?' done':'')+(now?' now':'')+'" onclick="hxOpenDay('+gi+')">'+
      '<span class="n">'+(isDone?glyph('check'):'D'+(di+1))+'</span>'+
      '<div class="tx"><div class="t">'+hesc(hxTitle(def,d))+'</div><div class="m">'+hesc(m)+'</div></div>'+
      (now?'<span class="hx-now">Next</span>':'<span class="pdx-chev">›</span>')+'</div>';
  }).join('')+'</div>';
  /* what it takes */
  h+=fsec('Before you start','');
  h+='<div class="hx-info">'+
    '<div><b>Where</b><span>A gym with HYROX kit. '+(def.kind==='ft'?'Most sessions use a SkiErg or rower, dumbbells and a wall ball.':'You will use '+HX_GEAR_RACE.join(', ')+'.')+'</span></div>'+
    '<div><b>How</b><span>'+def.per+' sessions a week. Do them in order; a missed day waits for you. Tick each one off when it is done.</span></div>'+
    '<div><b>Safety</b><span>New to training, injured or unwell? Start at Beginner and check with your doctor first. Stop if anything hurts.</span></div>'+
    '<div><b>From</b><span>HITFAT Hybrid, the programs behind HITFAT\'s HYROX class.</span></div></div>';
  $('pgd-body').innerHTML=h;
}

/* ── a session ── */
var hxCurGi=0;
function hxOpenDay(gi){
  var def=hxCur()||null; if(!def){ return; }
  var f=hxFlat(def), x=f[gi]; if(!x) return;
  hxCurGi=gi;
  var owned=hxOwned(def), W=hxWeeks(def), d=x.day, key=hxKey(def.id,x.w,x.d), done=HF.isDone(key);
  curDay={p:curProg, day:curProg.weeks[x.w]?curProg.weeks[x.w].days[x.d]:null, gi:gi};
  var h=pdxBar('day', owned?{icon:done?'check':'flag',label:done?'Done':'Mark done',go:'hxToggle()'}:{icon:'lock',label:'RM'+def.price,go:"hxBuy('"+def.id+"')"});
  h+=hxPoster(def,'hx-pday');
  h+='<div class="hx-dhead"><div class="hx-k">'+hesc(W[x.w].label+' · Day '+(x.d+1)+(W[x.w].block?' · '+W[x.w].block:''))+'</div>'+
     '<div class="hx-dt">'+hesc(hxTitle(def,d))+'</div>'+
     (def.kind==='race'?'<div class="hx-dm">'+hesc(hxLevel())+' level</div>':'<div class="hx-dm">'+(hxFtMins(d)?hxFtMins(d)+' min · ':'')+'RPE '+(d.rpe||'–')+'</div>')+'</div>';
  if(!owned){
    h+='<div class="hx-lock">'+glyph('lock')+'<div><b>Part of '+hesc(def.name)+'</b><span>RM'+def.price+' once, or included in HITFAT+.</span></div></div>'+
       '<div class="pdx-btns"><button class="bigbtn hx-btn" onclick="hxBuy(\''+def.id+'\')">Get the program · RM'+def.price+'</button></div>';
    $('pgd-body').innerHTML=h; $('screen').scrollTop=0; return;
  }
  if(def.kind==='race'){
    h+='<div class="hx-board"><div class="hx-bh">The workout</div><pre>'+hesc(d.workout||'')+'</pre></div>';
    if(d.notes) h+='<div class="hx-notes"><div class="hx-bh">Coach notes</div><p>'+hesc(d.notes).replace(/\n/g,'<br>')+'</p></div>';
  } else {
    if(d.desc) h+='<p class="hx-desc">'+hesc(d.desc)+'</p>';
    if(d.equip&&d.equip.length) h+='<div class="hx-gear">'+d.equip.map(function(e){ return '<span>'+hesc(e)+'</span>'; }).join('')+'</div>';
    (d.blocks||[]).forEach(function(b,bi){
      h+='<div class="hx-block"><div class="hx-bt"><b>'+hesc(b.phase||'')+'</b><span>'+hesc([b.format,b.mins?b.mins+' min':''].filter(Boolean).join(' · '))+'</span></div>'+
        (b.note?'<div class="hx-bn">'+hesc(b.note)+'</div>':'')+
        '<div class="hx-moves">'+(b.moves||[]).map(function(m,mi){
          if(m.rest) return '<div class="hx-mv rest"><span>Rest</span><em>'+m.rest+'s</em></div>';
          var amt=m.reps!=null?m.reps+' reps':m.time?m.time+'s':'';
          var id='hxv-'+bi+'-'+mi;
          return '<div class="hx-mv'+(m.vimeo?' vid':'')+'"'+(m.vimeo?' onclick="hxClip(\''+id+'\',\''+m.vimeo+'\')"':'')+'>'+
            '<span>'+hesc(m.name)+'</span><em>'+amt+'</em>'+(m.vimeo?'<i>'+glyph('play')+'</i>':'')+'</div><div class="hx-clip" id="'+id+'"></div>';
        }).join('')+'</div></div>';
    });
  }
  /* the result, then done */
  var s=HF.data.sessions[key]||{};
  h+='<div class="hx-res"><label for="hx-res">Your time or score <small>(optional)</small></label>'+
     '<input id="hx-res" placeholder="e.g. 18:45, 6 rounds, 24 kg" value="'+hesc(s.res||'')+'" autocomplete="off"></div>';
  h+='<div class="pdx-btns"><button class="bigbtn hx-btn" onclick="hxToggle()">'+(done?glyph('check')+'Done · tap to undo':glyph('flag')+'Mark as done')+'</button></div>';
  var tot=f.length;
  h+='<div class="hx-nav">'+(gi>0?'<button onclick="hxOpenDay('+(gi-1)+')">'+glyph('chevleft')+'Previous</button>':'<span></span>')+
     (gi<tot-1?'<button class="r" onclick="hxOpenDay('+(gi+1)+')">Next session</button>':'<span></span>')+'</div>';
  hidePanels(); $('progdetail').style.display='block';
  $('pgd-body').innerHTML=h; $('screen').scrollTop=0;
}
/* a move's clip, opened under it; tap again to close */
function hxClip(id,v){
  var el=$(id); if(!el) return;
  if(el.innerHTML){ el.innerHTML=''; return; }
  el.innerHTML='<div class="hx-frame"><iframe src="https://player.vimeo.com/video/'+encodeURIComponent(v)+'?title=0&byline=0&portrait=0&dnt=1&playsinline=1&autoplay=1&muted=1&loop=1" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen title="Move"></iframe></div>';
}
function hxToggle(){
  var def=hxCur(); if(!def || !hxOwned(def)) return;
  var x=hxFlat(def)[hxCurGi]; if(!x) return;
  var key=hxKey(def.id,x.w,x.d), res=String((($('hx-res')||{}).value)||'').trim().slice(0,60);
  if(HF.isDone(key)){ HF.undone(key); }
  else{
    HF.markDone(key,{name:def.short+' · '+hxTitle(def,x.day), mins:def.kind==='ft'?(hxFtMins(x.day)||def.mins):def.mins, res:res||undefined});
    if(typeof scEvent==='function') scEvent('workout');
    toast('Session done. Strong work 💪');
  }
  hxSync(def); HF.save();
  hxOpenDay(hxCurGi);
}

/* ── buying ── */
function hxBuy(id){
  var def=hxDef(id)||hxCur(); if(!def) return;
  var p=hxProg(def.id);
  if(p && ownsProgram(p)){ closeProduct(); return openProgram(def.id); }
  $('pw-body').innerHTML=
    '<div class="pwtop"><span></span><button class="pwx" aria-label="Close" onclick="closeProduct()">✕</button></div>'+
    hxPoster(def,'hx-buy')+
    '<div class="pwlist">'+[
      ['workout',def.kick+(def.kind==='race'?', three levels':''),def.kind==='race'?'Beginner, OPEN or PRO, each with its own sessions':'Hybrid basics, engine, stations, a mini simulation'],
      ['clipboard','A coach\'s plan for every day',def.kind==='race'?'The workout and the coach\'s notes, from HITFAT Hybrid':'Every block and move, with HITFAT clips'],
      ['chart','Your progress kept','Tick each session, log your time, see the weeks fill'],
      ['trophy','Yours for good','One payment. No subscription, nothing to cancel']]
      .map(function(b){ return '<div class="pwf"><div class="ic">'+ic(b[0])+'</div><div><div class="t">'+hesc(b[1])+'</div><div class="m">'+hesc(b[2])+'</div></div></div>'; }).join('')+'</div>'+
    '<div class="pwprice"><div class="p">RM'+def.price+'</div><div class="per">one payment</div></div>'+
    '<button class="bigbtn hx-btn" onclick="startCheckout(\'prog_'+def.id+'\')">Buy · RM'+def.price+'</button>'+
    '<button class="authalt" onclick="openPaywall(\'\')">Or get everything with HITFAT+</button>';
  $('pwm').classList.add('on');
  try{ $('pwm').scrollTop=0; }catch(e){}
}

/* ── where they show: Train, and the HYROX class ── */
function hxTile(def){
  var p=hxProg(def.id);
  return p && typeof hpoCard==='function' ? hpoCard(p,{}) : '';
}
function hxTrainRow(){
  if(typeof hpoCard!=='function') return '';
  return fsec('HYROX','Race programs from HITFAT Hybrid. For the gym.')+
    '<div class="hscroll hpo-row hx-row">'+HX_DEFS.map(hxTile).join('')+'</div>';
}
/* the HYROX class space: the programs, as part of what the class gives */
function hxKelasCard(){
  return '<div class="hx-kl"><div class="hx-kl-h"><b>HYROX programs</b><span>Included with your class. Train the days between classes.</span></div>'+
    HX_DEFS.map(function(def){
      var n=hxDoneN(def), tot=hxFlat(def).length;
      return '<button class="hx-kl-r" onclick="openProgram(\''+def.id+'\')"><span class="hx-kl-ph" style="background-image:url(\'/img/p/'+def.id+'.jpg\')"></span>'+
        '<span class="hx-kl-t"><b>'+hesc(def.short)+'</b><small>'+hesc(def.kick)+(n?' · '+n+'/'+tot+' done':'')+'</small></span><i>›</i></button>';
    }).join('')+'</div>';
}
