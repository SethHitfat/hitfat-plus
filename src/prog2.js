/* ═══════════════ PROGRESS ═══════════════
   The retention surface: the reason to open the app on a day you did not train.
   Everything here is derived from logged sessions, meals and weigh-ins — nothing
   is estimated or seeded, so a new account honestly reads as empty.            */

let _pgP='week';
function setPgP(p){ _pgP=p; renderProgress(); }
function pgDays(){ return _pgP==='week'?7:30; }

function weightLog(){ return (HF.data.weight||[]).slice().sort((a,b)=>a.iso<b.iso?-1:1); }
function logWeight(kg){
  if(!kg||kg<=0) return;
  HF.data.weight=(HF.data.weight||[]).filter(x=>x.iso!==iso(0)).concat([{iso:iso(0),kg:Number(kg)}]);
  if(HF.data.nutrition&&HF.data.nutrition.cal){ HF.data.nutrition.w=Number(kg); }   // target follows the scale
  HF.save();
}
function askWeight(){
  const v=prompt('Weight today (kg)'); if(v===null) return;
  const kg=parseFloat(v);
  if(!kg||kg<20||kg>300){ toast('Enter a weight between 20 and 300'); return; }
  logWeight(kg); toast('Weight logged'); renderProgress();
}

/* window helpers — every stat below reads the same N-day window */
function pgWindow(){ const out=[]; for(let i=pgDays()-1;i>=0;i--) out.push(iso(-i)); return out; }
function pgTraining(){
  const days=pgWindow(), set={}; let mins=0, n=0;
  Object.values(HF.data.sessions).forEach(s=>{ const d=sessionISO(s);
    if(d&&days.indexOf(d)>=0){ set[d]=(set[d]||0)+(s.mins||20); mins+=(s.mins||20); n++; } });
  return {days, byDay:set, mins, sessions:n, activeDays:Object.keys(set).length};
}
function pgNutrition(){
  const days=pgWindow(), n=HF.data.nutrition||{};
  let logged=0, sumK=0, onTrack=0, sumScore=0;
  days.forEach(d=>{
    const m=mealTotals(d); if(!m.kcal) return;
    logged++; sumK+=m.kcal;
    if(n.cal && m.kcal<=n.cal && m.kcal>=n.cal*0.5) onTrack++;
    sumScore+=hfScore(m.kcal,m.p,m.c,m.f);
  });
  return {logged, avgKcal:logged?Math.round(sumK/logged):0, onTrack,
          avgScore:logged?Math.round(sumScore/logged):0, target:n.cal||0};
}

/* ── Progress · measurements ───────────────────────────────────────────
   Body fat and waist ride along with the weigh-in. Every one of them is
   optional; the screen leaves out whatever has never been entered rather
   than showing a zero. */
function bodyLog(){ return (HF.data.body||[]).slice().sort((a,b)=>a.iso<b.iso?-1:1); }
function logBody(o){
  const day=iso(0), rest=(HF.data.body||[]).filter(x=>x.iso!==day);
  const prev=(HF.data.body||[]).filter(x=>x.iso===day)[0]||{};
  HF.data.body=rest.concat([Object.assign({iso:day}, prev, o)]);
  HF.save();
}
function bodySeries(key){ return bodyLog().filter(x=>typeof x[key]==='number').map(x=>({iso:x.iso, v:x[key]})); }
function windowDelta(series, days){
  const from=iso(-(days-1)), win=series.filter(x=>x.iso>=from);
  if(win.length<2) return null;
  return Math.round((win[win.length-1].v-win[0].v)*10)/10;
}

/* ── Progress score ───────────────────────────────────────────────────
   Four parts of twenty-five, each read from something the user actually
   did. The breakdown is shown on screen: a score nobody can take apart is
   a score nobody trusts. */
function progressScore(){
  const parts=[];
  const cons=consistency();                       // % of weekly goal, last 4 weeks
  parts.push({label:'Training', got:Math.round(Math.min(1,cons/100)*25), max:25,
              note:cons+'% of your weekly goal'});

  const nu=pgNutrition(), days=pgDays();
  const logRate=days?Math.min(1,nu.logged/days):0;
  parts.push({label:'Nutrition', got:Math.round(logRate*25), max:25,
              note:nu.logged+' of '+days+' days logged'});

  const w=weightLog().map(x=>({iso:x.iso,v:x.kg}));
  const d=windowDelta(w,30), goal=(HF.data.nutrition&&HF.data.nutrition.goal)||'lose';
  let trend=0, tnote='Log your weight to score this';
  if(d!==null){
    const good=(goal==='lose'&&d<0)||((goal==='muscle'||goal==='bulk')&&d>0)||(goal==='maintain'&&Math.abs(d)<=1);
    trend=good?25:(Math.abs(d)<=0.5?15:8);
    tnote=(d>0?'+':'')+d+' kg this month';
  }
  parts.push({label:'Trend', got:trend, max:25, note:tnote});

  const st=liveStreak();
  parts.push({label:'Streak', got:Math.round(Math.min(1,st/14)*25), max:25,
              note:st?st+' day'+(st===1?'':'s')+' running':'No streak yet'});

  const score=parts.reduce((a,b)=>a+b.got,0);
  const band=score>=80?'Excellent':score>=60?'Improving':score>=35?'Getting going':'Just started';
  return {score, band, parts};
}

/* A sparkline with no axes — the shape is the whole point at this size. */
function spark(series, good){
  if(series.length<2) return '<div style="height:26px;"></div>';
  const w=88,h=26,pad=3, vs=series.map(x=>x.v);
  const lo=Math.min.apply(null,vs), hi=Math.max.apply(null,vs), rng=(hi-lo)||1;
  const pts=series.map((x,i)=>{
    const px=pad+(i/(series.length-1))*(w-pad*2);
    const py=pad+(1-(x.v-lo)/rng)*(h-pad*2);
    return px.toFixed(1)+','+py.toFixed(1);
  }).join(' ');
  return '<svg viewBox="0 0 '+w+' '+h+'" style="width:100%;height:26px;display:block;overflow:visible;">'+
         '<polyline points="'+pts+'" fill="none" stroke="'+(good?'var(--pg-good)':'var(--pg-bad)')+
         '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
}

/* One tile. Returns '' when there is nothing to show, so the grid simply
   holds fewer tiles rather than a row of dashes. */
/* The Fitness Trends tile: the label in its colour on top, the number
   large, the change under it in green or red, and the shape of it. */
const PG_COL={'Weight':'#FF5A5F','Body fat':'#FFC93C','Waist':'#FFC93C','Workouts':'#FF5A5F','Days logged':'#FFFFFF','Streak':'#FFC93C'};
/* the same hues, deep enough to read on the light theme's grey */
const PG_COL_L={'Weight':'#C21A14','Body fat':'#8A5A00','Waist':'#8A5A00','Workouts':'#C21A14','Days logged':'#000000','Streak':'#8A5A00'};
function pgTile(label, value, unit, sub, series, goodDown, metric){
  if(value===null||value===undefined) return '';
  const d=series&&series.length>1?windowDelta(series,30):null;
  let tone='var(--dim)';
  if(d!==null && d!==0) tone=((d<0)===!!goodDown)?'var(--pg-good)':'var(--pg-bad)';
  const tap=metric?' onclick="pgOpenMetric(\''+metric+'\')"':'';
  return '<div class="htile pgt'+(metric?' tap':'')+'"'+tap+'>'+
    '<div class="l pgl" style="--c:'+(PG_COL[label]||'var(--txt)')+';--cl:'+(PG_COL_L[label]||'var(--txt)')+'">'+label+'</div>'+
    '<div class="v">'+value+(unit?'<span> '+String(unit).toUpperCase()+'</span>':'')+'</div>'+
    (sub?'<div class="s" style="color:'+tone+'">'+sub+'</div>':'')+
    (series?spark(series, d===null?false:(((d<0)===!!goodDown)||d===0)):'')+
  '</div>';
}
/* One ring, one colour, the number in the middle. */
function pgRing(pct,col,size,big,small){
  const c=size/2, w=size*.11, r=c-w/2;
  return '<div class="pgring" style="width:'+size+'px;height:'+size+'px">'+
    '<svg viewBox="0 0 '+size+' '+size+'" width="'+size+'" height="'+size+'" aria-hidden="true">'+
    '<circle cx="'+c+'" cy="'+c+'" r="'+r+'" fill="none" stroke="'+col+'" stroke-opacity=".22" stroke-width="'+w+'"/>'+
    (pct>0?'<path d="'+ringArc(c,c,r,pct)+'" fill="none" stroke="'+col+'" stroke-width="'+w+'" stroke-linecap="round"/>':'')+
    '</svg><div class="pgring-c"><b>'+big+'</b><span>'+small+'</span></div></div>';
}

/* This month's training, as a calendar. Filled = trained, ring = today. */
function pgCalendar(){
  const now=new Date(), y=now.getFullYear(), m=now.getMonth();
  const first=new Date(y,m,1), start=(first.getDay()+6)%7, total=new Date(y,m+1,0).getDate();
  const trained={};
  Object.values(HF.data.sessions).forEach(x=>{ const d=sessionISO(x); if(d) trained[d]=1; });
  let cells='';
  for(let i=0;i<start;i++) cells+='<i class="pgd blank"></i>';
  for(let day=1;day<=total;day++){
    const dISO=y+'-'+('0'+(m+1)).slice(-2)+'-'+('0'+day).slice(-2);
    const cls='pgd'+(trained[dISO]?' on':'')+(dISO===iso(0)?' today':'')+(dISO>iso(0)?' future':'');
    cells+='<i class="'+cls+'">'+day+'</i>';
  }
  const names=['M','T','W','T','F','S','S'].map(n=>'<i class="pgh">'+n+'</i>').join('');
  return '<div class="pgcal">'+names+cells+'</div>';
}

function renderProgress(){
  /* One measurement open takes the whole panel — same idea as the class
     detail: the overview answers where you are, this answers which way. */
  if(pgMetric) return renderMetric();
  const tr=pgTraining(), nu=pgNutrition(), wl=weightLog(), streak=liveStreak();
  const sc=progressScore();
  const wSeries=wl.map(x=>({iso:x.iso,v:x.kg}));
  const fSeries=bodySeries('bf'), waistSeries=bodySeries('waist');
  const goal=(HF.data.nutrition&&HF.data.nutrition.goal)||'lose';
  const goodDown=(goal!=='muscle'&&goal!=='bulk');
  /* The date small, the title large — the Home header's shape. */
  const dl=new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'}).toUpperCase();
  let h='<div class="hsum"><div class="hsum-l"><div class="k">'+dl+'</div><div class="t">Progress</div></div></div>';

  /* ── score ── one ring and the four parts it is made of, the way the
     Activity card shows its rings and their numbers. */
  h+=fsec('Progress Score','Four parts of 25, each from what you did.')+
     '<div class="hact">'+pgRing(sc.score,'#FF453A',112,sc.score,'/100')+
     '<div class="hact-r"><div class="hact-s"><div class="l">This month</div><div class="v hc-mins">'+sc.band+'</div></div>'+
     sc.parts.map(p=>'<div class="pgpart"><span>'+p.label+'</span><b>'+p.got+'<small>/25</small></b></div>').join('')+
     '</div></div>'+
     '<div class="pgnotes">'+sc.parts.map(p=>'<div><b>'+p.label+'</b> · '+p.note+'</div>').join('')+'</div>';

  /* ── this month ── every tile is left out when its measurement has never
     been entered, rather than printed as a dash. */
  const tiles=[
    pgTile('Weight', wl.length?wl[wl.length-1].kg:null, 'kg',
           windowDelta(wSeries,30)!==null?fmtDelta(windowDelta(wSeries,30),'kg'):'', wSeries, goodDown, 'weight'),
    pgTile('Body fat', fSeries.length?fSeries[fSeries.length-1].v:null, '%',
           windowDelta(fSeries,30)!==null?fmtDelta(windowDelta(fSeries,30),'%'):'', fSeries, true, 'bf'),
    pgTile('Waist', waistSeries.length?waistSeries[waistSeries.length-1].v:null, 'cm',
           windowDelta(waistSeries,30)!==null?fmtDelta(windowDelta(waistSeries,30),'cm'):'', waistSeries, true, 'waist'),
    pgTile('Workouts', tr.sessions||0, '', tr.mins+' min', null, false),
    pgTile('Days logged', nu.logged||0, '', 'of '+pgDays()+' days', null, false),
    pgTile('Streak', streak, streak===1?'day':'days', streak?'Keep it up':'Start today', null, false)
  ].filter(Boolean).join('');
  h+=fsec('Highlights','Tap a measurement for its trend.')+
     '<div class="pgseg">'+
     '<button class="seg'+(pgDays()===7?' on':'')+'" onclick="setPgP(\'week\')">This week</button>'+
     '<button class="seg'+(pgDays()===7?'':' on')+'" onclick="setPgP(\'month\')">Last 30 days</button>'+
     '</div><div class="pggrid">'+tiles+'</div>';

  /* ── goal ── */
  if(HF.data.goalKg && wl.length){
    const cur=wl[wl.length-1].kg, start=wl[0].kg, target=HF.data.goalKg;
    const span=Math.abs(start-target)||1, done=Math.abs(start-cur);
    const pct=Math.max(0,Math.min(100,Math.round(done/span*100)));
    const left=Math.round(Math.abs(cur-target)*10)/10;
    h+=fsec('Goal','')+
       '<div class="acard"><div class="ah"><div class="t">Weight goal</div>'+
       '<div class="c" onclick="askGoalWeight()" style="cursor:pointer;color:var(--hitfat);font-weight:700;font-size:13px;">Edit</div></div>'+
       '<div style="display:flex;align-items:baseline;gap:8px;margin-top:4px;">'+
       '<div class="big">'+cur+'</div><div class="sub">/ '+target+' kg</div></div>'+
       '<div class="sub">'+left+' kg to go</div>'+
       '<div class="pgbar"><i style="width:'+pct+'%"></i></div>'+
       '<div class="sub" style="text-align:right;">'+pct+'%</div></div>';
  }

  /* ── training ── */
  h+=fsec('Training','Filled days are days you trained.')+
     '<div class="acard"><div class="ah">'+ic('workout')+'<div class="t">'+(pgDays()===7?'This week':'Last 30 days')+'</div></div>'+
     '<div class="arow pgstats">'+
     '<div><div class="big">'+tr.sessions+'</div><div class="sub">sessions</div></div>'+
     '<div><div class="big">'+tr.mins+'</div><div class="sub">minutes</div></div>'+
     '<div><div class="big">'+tr.activeDays+'</div><div class="sub">active days</div></div></div>'+
     pgCalendar()+
     '<div class="pglegend"><i class="pgd on"></i><span>Trained</span><i class="pgd"></i><span>Rest</span></div>'+
     '</div>';

  /* ── nutrition ── only when there is something logged to describe. */
  if(nu.logged){
    const n=HF.data.nutrition||{};
    const pct=n.cal?Math.min(100,Math.round(nu.avgKcal/n.cal*100)):0;
    h+=fsec('Nutrition','What you logged, on average.')+
       '<div class="acard"><div class="ah">'+ic('food')+'<div class="t">Average intake</div></div>'+
       '<div style="display:flex;align-items:baseline;gap:8px;">'+
       '<div class="big">'+nu.avgKcal+'</div><div class="sub">kcal / day'+(n.cal?' · target '+n.cal:'')+'</div></div>'+
       (n.cal?'<div class="pgbar"><i style="width:'+pct+'%"></i></div>':'')+
       '<div class="sub" style="margin-top:8px;">'+nu.logged+' of '+pgDays()+' days logged'+
       (nu.avgScore?' · quality '+nu.avgScore+'/100':'')+'</div></div>';
  }

  /* ── insights ── each line is a rule over real numbers, so none of them
     can say something the data does not support. */
  const ins=[];
  const wd=windowDelta(wSeries,30);
  if(wd!==null) ins.push({ok:(wd<0)===goodDown||wd===0, t:'Weight '+(wd<0?'trending down':wd>0?'trending up':'holding'),
                          s:fmtDelta(wd,'kg')+' over 30 days'});
  if(tr.sessions) ins.push({ok:tr.sessions>=(HF.data.weekGoal||5)*2, t:'Training',
                          s:tr.sessions+' sessions, '+tr.mins+' minutes this month'});
  if(nu.logged) ins.push({ok:nu.logged>=pgDays()*0.6, t:'Food logging',
                          s:nu.logged+' of '+pgDays()+' days'});
  if(streak) ins.push({ok:streak>=3, t:'Streak', s:streak+' day'+(streak===1?'':'s')+' running'});
  if(ins.length){
    h+=fsec('Insights','Read from your numbers, nothing more.')+'<div class="acard">'+
       ins.map(x=>'<div class="pgins"><i class="'+(x.ok?'ok':'warn')+'"></i>'+
       '<div><b>'+x.t+'</b><small>'+x.s+'</small></div></div>').join('')+'</div>';
  }

  /* ── achievements ── */
  const badges=Object.keys(HF.data.badges||{});
  if(badges.length){
    h+=fsec('Achievements','')+'<div class="pggrid">'+
       badges.slice(-6).map(k=>'<div class="pgtile" style="text-align:center;">'+
       '<div style="font-size:26px;">'+glyph('trophy')+'</div><div class="l">'+k+'</div></div>').join('')+'</div>';
  }

  /* programs in flight */
  const going=PROGRAMS.filter(p=>p.weeks&&progDone(p.id)>0&&progDone(p.id)<progDays(p));
  if(going.length) h+=fsec('Programs','In progress.')+going.map(frow).join('');

  h+='<button class="bigbtn" onclick="askMeasure()" style="margin-top:22px;">Log Measurements</button>'+
     '<button class="bigbtn sec" onclick="openShare()">Share Progress Card</button>';
  $('prog-body').innerHTML=h;
}

function fmtDelta(d,unit){ return (d>0?'+':'')+d+' '+unit; }

function askGoalWeight(){
  const v=prompt('Goal weight (kg)', HF.data.goalKg||'');
  if(v===null) return;
  const kg=parseFloat(v);
  if(!kg||kg<30||kg>250){ toast('Enter a goal between 30 and 250'); return; }
  HF.data.goalKg=kg; HF.save(); toast('Goal set'); renderProgress();
}

/* One sheet for all three, each optional — leaving a field blank keeps
   whatever was there before rather than wiping it. */
function askMeasure(){
  const w=prompt('Weight today (kg) — leave blank to skip');
  if(w===null) return;
  if(w.trim()){
    const kg=parseFloat(w);
    if(!kg||kg<20||kg>300){ toast('Enter a weight between 20 and 300'); return; }
    logWeight(kg);
  }
  const bf=prompt('Body fat % — leave blank to skip');
  if(bf!==null && bf.trim()){
    const v=parseFloat(bf);
    if(v>0 && v<70) logBody({bf:Math.round(v*10)/10});
    else { toast('Body fat should be between 1 and 70'); return; }
  }
  const wa=prompt('Waist (cm) — leave blank to skip');
  if(wa!==null && wa.trim()){
    const v=parseFloat(wa);
    if(v>40 && v<200) logBody({waist:Math.round(v*10)/10});
    else { toast('Waist should be between 40 and 200'); return; }
  }
  toast('Logged'); renderProgress();
}

/* Sparkline of every weigh-in — no axes, just the shape of the trend. */
function weightChart(wl){
  if(wl.length<2) return '';
  const w=280,hh=64,pad=6;
  const ks=wl.map(x=>x.kg), lo=Math.min(...ks), hi=Math.max(...ks), rng=(hi-lo)||1;
  const pts=wl.map((x,i)=>{
    const px=pad+(i/(wl.length-1))*(w-pad*2);
    const py=pad+(1-(x.kg-lo)/rng)*(hh-pad*2);
    return px.toFixed(1)+','+py.toFixed(1);
  }).join(' ');
  return '<svg viewBox="0 0 '+w+' '+hh+'" style="width:100%;height:'+hh+'px;margin-top:12px;display:block;">'+
    '<polyline points="'+pts+'" fill="none" stroke="var(--hyrox)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>'+
    wl.map((x,i)=>{ const px=pad+(i/(wl.length-1))*(w-pad*2), py=pad+(1-(x.kg-lo)/rng)*(hh-pad*2);
      return '<circle cx="'+px.toFixed(1)+'" cy="'+py.toFixed(1)+'" r="2.8" style="fill:var(--surface);stroke:var(--hyrox);stroke-width:1.6"/>'; }).join('')+
    '</svg>';
}

/* ── SHARE CARD ──────────────────────────────────────────────────────
   1080×1920 canvas, drawn on device. Works with one user, which a
   leaderboard does not — this is the acquisition loop, not ranking. */
/* kind 'workout' shares the session just finished (the player's Done
   screen); anything else shares the progress window, as before. */
let _shareKind='progress';
function openShare(kind){
  _shareKind=kind==='workout'&&typeof _lastWorkout!=='undefined'&&_lastWorkout?'workout':'progress';
  $('sharemodal').classList.add('on');
  $('share-img').style.display='none';
  $('share-load').style.display='block';
  const go=()=>{
    try{ drawShareCard(); }catch(e){ console.error(e); }
    const url=$('share-canvas').toDataURL('image/png');
    const img=$('share-img');
    img.onload=()=>{ img.style.display='block'; $('share-load').style.display='none'; };
    img.src=url;
  };
  if(document.fonts&&document.fonts.load){
    Promise.all([document.fonts.load("700 100px 'Oswald'"),document.fonts.load("800 40px 'Inter'")])
      .then(()=>document.fonts.ready).then(go).catch(go);
  } else setTimeout(go,150);
}
function closeShare(){ $('sharemodal').classList.remove('on'); }
function shareImage(){
  const cv=$('share-canvas');
  if(cv.toBlob){
    cv.toBlob(b=>{
      try{
        if(b&&navigator.canShare){
          const f=new File([b],'hitfat-plus.png',{type:'image/png'});
          if(navigator.canShare({files:[f]})){
            navigator.share({files:[f],title:'HITFAT+',text:_shareKind==='workout'?'Workout done with HITFAT+ 💪':'My progress with HITFAT+ 💪'}).catch(()=>{});
            return;
          }
        }
        saveShare();
      }catch(e){ saveShare(); }
    },'image/png');
  } else saveShare();
}
function saveShare(){
  const a=document.createElement('a');
  a.href=$('share-canvas').toDataURL('image/png'); a.download='hitfat-plus.png';
  document.body.appendChild(a); a.click();
  setTimeout(()=>{ try{ document.body.removeChild(a); }catch(e){} },1200);
}
function _rr(x,rx,ry,w,h,r){ x.beginPath();x.moveTo(rx+r,ry);x.arcTo(rx+w,ry,rx+w,ry+h,r);
  x.arcTo(rx+w,ry+h,rx,ry+h,r);x.arcTo(rx,ry+h,rx,ry,r);x.arcTo(rx,ry,rx+w,ry,r);x.closePath(); }
function _spaced(x,t,cx,y,sp){
  let tot=0; for(const ch of t) tot+=x.measureText(ch).width+sp; tot-=sp;
  let px=cx-tot/2; const prev=x.textAlign; x.textAlign='left';
  for(const ch of t){ x.fillText(ch,px,y); px+=x.measureText(ch).width+sp; }
  x.textAlign=prev;
}
function _wrap(x,t,cx,y,maxW,lh){
  const words=String(t).split(' '); let line='', lines=[];
  words.forEach(w=>{ const tst=line?line+' '+w:w;
    if(x.measureText(tst).width>maxW&&line){ lines.push(line); line=w; } else line=tst; });
  if(line) lines.push(line);
  lines.forEach((l,i)=>x.fillText(l,cx,y+i*lh));
  return lines.length;
}
/* The card, after the Fitness+ workout summary: black, a red glow and a
   little yellow, the HITFAT+ mark, the workout (or the window) by name, the
   week as the three rings Home shows, and four tiles in red, yellow and
   white. 1080×1920, so it drops straight into a story. */
const SC_RED='#FF5A5F', SC_YEL='#FFC93C', SC_WHITE='#FFFFFF', SC_DIM='rgba(255,255,255,.62)', SC_TILE='#1C1C1E';
function _scRing(x,cx,cy,r,w,pct,col){
  x.lineCap='round'; x.lineWidth=w;
  x.strokeStyle=col; x.globalAlpha=.22; x.beginPath(); x.arc(cx,cy,r,0,Math.PI*2); x.stroke();
  x.globalAlpha=1;
  const p=Math.max(0,Math.min(100,pct||0))/100;
  if(p>0){ x.beginPath(); x.arc(cx,cy,r,-Math.PI/2,-Math.PI/2+p*Math.PI*2); x.stroke(); }
}
function _scTile(x,tx,ty,tw,th,label,val,unit,col){
  x.fillStyle=SC_TILE; _rr(x,tx,ty,tw,th,40); x.fill();
  x.textAlign='left';
  x.fillStyle=SC_WHITE; x.font="600 36px 'Inter',system-ui,sans-serif"; x.fillText(label,tx+40,ty+72);
  x.fillStyle=col; x.font="700 108px 'Inter',system-ui,sans-serif"; x.fillText(val,tx+40,ty+th-46);
  const vw=x.measureText(val).width;
  x.fillStyle=SC_DIM; x.font="700 34px 'Inter',system-ui,sans-serif"; x.fillText(unit,tx+52+vw,ty+th-48);
}
function drawShareCard(){
  const cv=$('share-canvas'), x=cv.getContext('2d'), W=1080, H=1920, cx=W/2, L=90;
  const tr=pgTraining(), nu=pgNutrition(), wl=weightLog(), streak=liveStreak();
  const wk=(typeof _shareKind!=='undefined'&&_shareKind==='workout'&&typeof _lastWorkout!=='undefined')?_lastWorkout:null;
  x.clearRect(0,0,W,H);
  x.fillStyle='#000000'; x.fillRect(0,0,W,H);
  let g=x.createRadialGradient(W*.92,H*.06,20,W*.92,H*.06,900);
  g.addColorStop(0,'rgba(220,26,34,.55)'); g.addColorStop(1,'rgba(220,26,34,0)');
  x.fillStyle=g; x.fillRect(0,0,W,H);
  g=x.createRadialGradient(W*.05,H*.98,20,W*.05,H*.98,760);
  g.addColorStop(0,'rgba(255,194,26,.22)'); g.addColorStop(1,'rgba(255,194,26,0)');
  x.fillStyle=g; x.fillRect(0,0,W,H);

  // the mark
  x.textAlign='left'; x.textBaseline='alphabetic';
  x.fillStyle=SC_WHITE; x.font="800 54px 'Inter',system-ui,sans-serif"; x.fillText('HITFAT',L,170);
  x.fillStyle=SC_RED; x.fillText('+',L+x.measureText('HITFAT').width+2,170);

  // what this is, by name
  const kick=wk?'Workout Complete':(_pgP==='week'?'This Week':'Last 30 Days');
  x.fillStyle=wk?'#30D158':SC_RED; x.font="700 44px 'Inter',system-ui,sans-serif"; x.fillText(kick,L,350);
  x.fillStyle=SC_WHITE; x.font="800 112px 'Inter',system-ui,sans-serif";
  const title=wk?wk.name:'My Progress';
  x.textAlign='left';
  const lines=_wrapL(x,title,L,468,W-2*L,116,2);
  const dy=468+(lines-1)*116;
  x.fillStyle=SC_DIM; x.font="500 42px 'Inter',system-ui,sans-serif";
  x.fillText(new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'}),L,dy+70);

  // the week, as rings, with its numbers beside them
  const days=daysThisWeek(), wg=HF.data.weekGoal||5, wm=weekMinutes(), cons=consistency();
  const ry=dy+360, rcx=L+226;
  _scRing(x,rcx,ry,200,52,days/wg*100,'#DC1A22');
  _scRing(x,rcx,ry,138,52,wm/150*100,'#FFC21A');
  _scRing(x,rcx,ry,76,52,cons,SC_WHITE);
  const lx=rcx+270;
  [['Days',days+'/'+wg,SC_RED],['Minutes',wm+'/150',SC_YEL],['Consistency',cons+'%',SC_WHITE]].forEach((r,i)=>{
    const yy=ry-150+i*140;
    x.fillStyle=SC_WHITE; x.font="600 36px 'Inter',system-ui,sans-serif"; x.fillText(r[0],lx,yy);
    x.fillStyle=r[2]; x.font="700 64px 'Inter',system-ui,sans-serif"; x.fillText(r[1],lx,yy+70);
  });

  // four tiles
  let tiles;
  if(wk) tiles=[['Time',String(wk.mins),'MIN',SC_RED],['Exercises',String(wk.exs),'DONE',SC_YEL],
                ['Rounds',String(wk.rounds),'ROUNDS',SC_WHITE],['Streak',String(streak),streak===1?'DAY':'DAYS',SC_YEL]];
  else {
    let w4=[nu.target?'On Target':'Active Days', nu.target?(nu.onTrack+'/'+nu.logged):String(tr.activeDays), 'DAYS', SC_WHITE];
    if(wl.length>=2){
      const d=Math.round((wl[wl.length-1].kg-wl[0].kg)*10)/10;
      const goal=(HF.data.nutrition&&HF.data.nutrition.goal)||'lose';
      const good=(goal==='lose'&&d<0)||((goal==='muscle'||goal==='bulk')&&d>0);
      w4=['Weight',(d>0?'+':'')+d,'KG',good?'#30D158':SC_WHITE];
    }
    tiles=[['Sessions',String(tr.sessions),'DONE',SC_RED],['Time',String(tr.mins),'MIN',SC_YEL],
           w4,['Streak',String(streak),streak===1?'DAY':'DAYS',SC_YEL]];
  }
  const ty=ry+280, tw=(W-2*L-30)/2, th=250;
  tiles.forEach((t,i)=>_scTile(x,L+(i%2)*(tw+30),ty+Math.floor(i/2)*(th+30),tw,th,t[0],t[1],t[2],t[3]));

  // the way in
  x.textAlign='left';
  x.fillStyle=SC_WHITE; x.font="700 44px 'Inter',system-ui,sans-serif"; x.fillText('Train with HITFAT+',L,H-120);
  x.fillStyle=SC_DIM; x.font="500 38px 'Inter',system-ui,sans-serif"; x.fillText('app.hitfat.io',L,H-66);
}
/* left-aligned wrap, at most `max` lines, the last one cut with an ellipsis */
function _wrapL(x,t,lx,y,maxW,lh,max){
  const words=String(t).split(' '); let line='', lines=[];
  words.forEach(w=>{ const tst=line?line+' '+w:w;
    if(x.measureText(tst).width>maxW&&line){ lines.push(line); line=w; } else line=tst; });
  if(line) lines.push(line);
  if(lines.length>max){ lines=lines.slice(0,max); lines[max-1]=lines[max-1].replace(/\s*\S*$/,'')+'…'; }
  lines.forEach((l,i)=>x.fillText(l,lx,y+i*lh));
  return lines.length;
}

/* ── One measurement, in full ─────────────────────────────────────────
   A tile answers "where am I". This answers "which way am I going", which
   is a different and harder question — daily weight swings a kilo on water
   alone, so the raw line is mostly noise. The moving average is the signal,
   and the weekly table is how anyone should actually read a scale. */
var pgMetric=null, pgWin=30;
const PG_METRICS={
  weight:{label:'Weight', unit:'kg',  goodDown:true},
  bf:    {label:'Body fat',unit:'%',  goodDown:true},
  waist: {label:'Waist',  unit:'cm',  goodDown:true}
};

function pgSeries(key){
  if(key==='weight') return weightLog().map(x=>({iso:x.iso, v:x.kg}));
  return bodySeries(key);
}
function pgWindowed(series, days){
  if(!days) return series;
  const from=iso(-(days-1));
  return series.filter(x=>x.iso>=from);
}

/* A trailing average over real days, not over the last N readings — someone
   who weighs in twice a week would otherwise get an "average" spanning a
   month and a line that lags reality badly. */
function movingAvg(series, days){
  const out=[];
  for(let i=0;i<series.length;i++){
    const end=series[i].iso, start=iso(0);
    const cutoff=new Date(end+'T00:00:00');
    cutoff.setDate(cutoff.getDate()-(days-1));
    const c=cutoff.getFullYear()+'-'+('0'+(cutoff.getMonth()+1)).slice(-2)+'-'+('0'+cutoff.getDate()).slice(-2);
    const win=series.filter(x=>x.iso>=c && x.iso<=end);
    if(!win.length) continue;
    out.push({iso:end, v:win.reduce((a,b)=>a+b.v,0)/win.length});
  }
  return out;
}

function weeklyAverages(series){
  if(!series.length) return [];
  const buckets={};
  series.forEach(x=>{ const k=weekStartISO(x.iso); (buckets[k]=buckets[k]||[]).push(x.v); });
  const keys=Object.keys(buckets).sort();
  return keys.map((k,i)=>{
    const avg=buckets[k].reduce((a,b)=>a+b,0)/buckets[k].length;
    const prev=i?buckets[keys[i-1]]:null;
    const pavg=prev?prev.reduce((a,b)=>a+b,0)/prev.length:null;
    return {week:k, avg:avg, change:(pavg===null?null:avg-pavg), n:buckets[k].length};
  }).reverse();
}

/* SVG rather than canvas: it scales with the card, it survives a theme
   change without redrawing, and the harness can read it. */
function pgChart(raw, avg, unit){
  if(raw.length<2)
    return '<div class="sub" style="padding:22px 0;text-align:center;">'+
           'Two readings are needed before there is a line to draw.</div>';
  const W=320,H=150,L=6,R=6,T=14,B=22;
  const all=raw.map(x=>x.v).concat(avg.map(x=>x.v));
  let lo=Math.min.apply(null,all), hi=Math.max.apply(null,all);
  if(hi===lo){ hi+=0.5; lo-=0.5; }
  const pad=(hi-lo)*0.18; lo-=pad; hi+=pad;
  const t0=new Date(raw[0].iso+'T00:00:00').getTime();
  const t1=new Date(raw[raw.length-1].iso+'T00:00:00').getTime();
  const span=(t1-t0)||1;
  const X=d=>L+((new Date(d+'T00:00:00').getTime()-t0)/span)*(W-L-R);
  const Y=v=>T+(1-(v-lo)/(hi-lo))*(H-T-B);
  const line=s=>s.map((p,i)=>(i?'L':'M')+X(p.iso).toFixed(1)+' '+Y(p.v).toFixed(1)).join(' ');
  const last=raw[raw.length-1];
  let g='';
  for(let i=0;i<=2;i++){ const y=T+(H-T-B)*(i/2);
    g+='<line x1="'+L+'" y1="'+y.toFixed(1)+'" x2="'+(W-R)+'" y2="'+y.toFixed(1)+
       '" stroke="var(--hairline)" stroke-width="1"/>'; }
  return '<svg viewBox="0 0 '+W+' '+H+'" style="width:100%;height:150px;display:block;overflow:visible;">'+g+
    '<path d="'+line(raw)+'" fill="none" stroke="var(--dim2)" stroke-width="1.5" '+
      'stroke-linejoin="round" stroke-linecap="round" opacity=".7"/>'+
    (avg.length>1?'<path d="'+line(avg)+'" fill="none" stroke="var(--hitfat)" stroke-width="2.6" '+
      'stroke-linejoin="round" stroke-linecap="round"/>':'')+
    '<circle cx="'+X(last.iso).toFixed(1)+'" cy="'+Y(last.v).toFixed(1)+'" r="4" fill="var(--hitfat)"/>'+
    '<text x="'+L+'" y="'+(T-4)+'" fill="var(--dim2)" font-size="10">'+hi.toFixed(1)+' '+unit+'</text>'+
    '<text x="'+L+'" y="'+(H-B+12)+'" fill="var(--dim2)" font-size="10">'+lo.toFixed(1)+' '+unit+'</text>'+
    '<text x="'+(W-R)+'" y="'+(H-B+12)+'" fill="var(--dim2)" font-size="10" text-anchor="end">'+
      pgShortDate(last.iso)+'</text>'+
    '</svg>';
}
function pgShortDate(d){
  try{ return new Date(d+'T00:00:00').toLocaleDateString('en-MY',{day:'numeric',month:'short'}); }
  catch(e){ return d; }
}

function pgOpenMetric(k){ pgMetric=k; pgWin=30; renderProgress(); $('screen').scrollTop=0; }
function pgCloseMetric(){ pgMetric=null; renderProgress(); $('screen').scrollTop=0; }
function pgSetWin(n){ pgWin=n; renderProgress(); }

function renderMetric(){
  const meta=PG_METRICS[pgMetric], full=pgSeries(pgMetric);
  const win=pgWindowed(full, pgWin), avg=movingAvg(win,7);
  const d=win.length>1?win[win.length-1].v-win[0].v:null;
  const tone=d===null||d===0?'var(--dim)':(((d<0)===meta.goodDown)?'var(--ok)':'var(--hitfat)');

  let h='<button class="back" onclick="pgCloseMetric()">← Progress</button>';
  h+='<div class="sechead">'+meta.label+'</div>';

  h+='<div class="pgseg">'+[[14,'14 days'],[30,'30 days'],[90,'90 days'],[0,'All']]
      .map(o=>'<button class="seg'+(pgWin===o[0]?' on':'')+'" onclick="pgSetWin('+o[0]+')">'+o[1]+'</button>')
      .join('')+'</div>';

  if(!win.length){
    h+='<div class="acard"><div class="sub">Nothing logged in this window.</div>'+
       '<button class="bigbtn" onclick="askMeasure()">＋ Log measurements</button></div>';
    $('prog-body').innerHTML=h; return;
  }

  h+='<div class="acard">'+
     '<div style="display:flex;align-items:baseline;gap:10px;">'+
     '<div class="big">'+win[win.length-1].v+'<span class="sub"> '+meta.unit+'</span></div>'+
     (d===null?'':'<div style="font-size:13px;font-weight:800;color:'+tone+';">'+
        (d>0?'+':'')+Math.round(d*10)/10+' '+meta.unit+'</div>')+
     '</div>'+
     '<div class="sub">'+win.length+' reading'+(win.length===1?'':'s')+' in this window</div>'+
     pgChart(win, avg, meta.unit)+
     /* The two lines mean different things and the difference is the whole
        point, so the legend is not decoration. */
     '<div class="pglegend" style="gap:14px;">'+
       '<span style="display:flex;align-items:center;gap:6px;font-size:11px;color:var(--dim);">'+
       '<i style="width:14px;height:2px;background:var(--dim2);border-radius:2px;"></i>each reading</span>'+
       '<span style="display:flex;align-items:center;gap:6px;font-size:11px;color:var(--dim);">'+
       '<i style="width:14px;height:3px;background:var(--hitfat);border-radius:2px;"></i>7-day average</span>'+
     '</div>'+
     '<div class="sub" style="margin-top:8px;line-height:1.5;">'+
     'Day to day this moves on water and food. The average is the part that means something.</div>'+
     '</div>';

  const wk=weeklyAverages(win);
  if(wk.length){
    h+='<div class="sechead">Weekly average</div><div class="acard">'+
      wk.slice(0,8).map(r=>{
        const c=r.change;
        const ct=c===null?'var(--dim2)':(((c<0)===meta.goodDown)?'var(--ok)':'var(--hitfat)');
        return '<div class="pgins"><div style="flex:1;">'+
          '<b>'+pgShortDate(r.week)+'</b>'+
          '<small>'+r.n+' reading'+(r.n===1?'':'s')+'</small></div>'+
          '<div style="text-align:right;">'+
          '<b>'+(Math.round(r.avg*10)/10)+' '+meta.unit+'</b>'+
          '<small style="color:'+ct+';">'+(c===null?'first week'
            :((c>0?'+':'')+(Math.round(c*10)/10)+' '+meta.unit))+'</small></div></div>';
      }).join('')+'</div>';
  }
  $('prog-body').innerHTML=h;
}
