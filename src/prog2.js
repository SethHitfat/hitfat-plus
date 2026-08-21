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
         '<polyline points="'+pts+'" fill="none" stroke="'+(good?'var(--ok)':'var(--hitfat)')+
         '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
}

/* One tile. Returns '' when there is nothing to show, so the grid simply
   holds fewer tiles rather than a row of dashes. */
function pgTile(label, value, unit, sub, series, goodDown){
  if(value===null||value===undefined) return '';
  const d=series&&series.length>1?windowDelta(series,30):null;
  let tone='var(--dim)';
  if(d!==null && d!==0) tone=((d<0)===!!goodDown)?'var(--ok)':'var(--hitfat)';
  return '<div class="pgtile">'+
    '<div class="v">'+value+(unit?'<span class="u"> '+unit+'</span>':'')+'</div>'+
    '<div class="l">'+label+'</div>'+
    (sub?'<div class="s" style="color:'+tone+'">'+sub+'</div>':'')+
    (series?spark(series, d===null?false:(((d<0)===!!goodDown)||d===0)):'')+
  '</div>';
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
  const tr=pgTraining(), nu=pgNutrition(), wl=weightLog(), streak=liveStreak();
  const sc=progressScore();
  const wSeries=wl.map(x=>({iso:x.iso,v:x.kg}));
  const fSeries=bodySeries('bf'), waistSeries=bodySeries('waist');
  const goal=(HF.data.nutrition&&HF.data.nutrition.goal)||'lose';
  const goodDown=(goal!=='muscle'&&goal!=='bulk');
  let h='';

  /* ── score ── the only dark card on a light page, so it reads as the
     headline rather than one more panel. */
  h+='<div class="pgscore">'+
     '<div class="k">HITFAT PROGRESS SCORE</div>'+
     '<div class="row"><div class="n">'+sc.score+'<span>/100</span></div>'+
     '<div class="band">'+sc.band+'</div></div>'+
     '<div class="bar"><i style="width:'+sc.score+'%"></i></div>'+
     '<div class="parts">'+sc.parts.map(p=>
       '<div class="p"><b>'+p.got+'</b><span>'+p.label+'</span><small>'+p.note+'</small></div>').join('')+
     '</div></div>';

  /* ── this month ── every tile is left out when its measurement has never
     been entered, rather than printed as a dash. */
  const tiles=[
    pgTile('Weight', wl.length?wl[wl.length-1].kg:null, 'kg',
           windowDelta(wSeries,30)!==null?fmtDelta(windowDelta(wSeries,30),'kg'):'', wSeries, goodDown),
    pgTile('Body fat', fSeries.length?fSeries[fSeries.length-1].v:null, '%',
           windowDelta(fSeries,30)!==null?fmtDelta(windowDelta(fSeries,30),'%'):'', fSeries, true),
    pgTile('Waist', waistSeries.length?waistSeries[waistSeries.length-1].v:null, 'cm',
           windowDelta(waistSeries,30)!==null?fmtDelta(windowDelta(waistSeries,30),'cm'):'', waistSeries, true),
    pgTile('Workouts', tr.sessions||0, '', tr.mins+' min', null, false),
    pgTile('Days logged', nu.logged||0, '', 'of '+pgDays()+' days', null, false),
    pgTile('Streak', streak, streak===1?'day':'days', streak?'Keep it up':'Start today', null, false)
  ].filter(Boolean).join('');
  h+='<div class="sechead">'+(pgDays()===7?'This week':'Last 30 days')+'</div>'+
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
    h+='<div class="sechead">Goal</div>'+
       '<div class="acard"><div class="ah"><div class="t">Weight goal</div>'+
       '<div class="c" onclick="askGoalWeight()" style="cursor:pointer;color:var(--hitfat);font-weight:700;font-size:13px;">Edit</div></div>'+
       '<div style="display:flex;align-items:baseline;gap:8px;margin-top:4px;">'+
       '<div class="big">'+cur+'</div><div class="sub">/ '+target+' kg</div></div>'+
       '<div class="sub">'+left+' kg to go</div>'+
       '<div class="pgbar"><i style="width:'+pct+'%"></i></div>'+
       '<div class="sub" style="text-align:right;">'+pct+'%</div></div>';
  }

  /* ── training ── */
  h+='<div class="sechead">Training</div>'+
     '<div class="acard"><div class="ah"><span>🏋️</span><div class="t">'+(pgDays()===7?'This week':'Last 30 days')+'</div></div>'+
     '<div class="arow" style="margin:6px 0 2px;">'+
     '<div><div class="big">'+tr.sessions+'</div><div class="sub">sessions</div></div>'+
     '<div><div class="big">'+tr.mins+'</div><div class="sub">minutes</div></div>'+
     '<div><div class="big">'+tr.activeDays+'</div><div class="sub">active days</div></div></div>'+
     pgCalendar()+
     '<div class="pglegend"><i class="pgd on"></i> trained <i class="pgd"></i> rest</div>'+
     '</div>';

  /* ── nutrition ── only when there is something logged to describe. */
  if(nu.logged){
    const n=HF.data.nutrition||{};
    const pct=n.cal?Math.min(100,Math.round(nu.avgKcal/n.cal*100)):0;
    h+='<div class="sechead">Nutrition</div>'+
       '<div class="acard"><div class="ah"><span>🍽️</span><div class="t">Average intake</div></div>'+
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
    h+='<div class="sechead">Insights</div><div class="acard">'+
       ins.map(x=>'<div class="pgins"><i class="'+(x.ok?'ok':'warn')+'"></i>'+
       '<div><b>'+x.t+'</b><small>'+x.s+'</small></div></div>').join('')+'</div>';
  }

  /* ── achievements ── */
  const badges=Object.keys(HF.data.badges||{});
  if(badges.length){
    h+='<div class="sechead">Achievements</div><div class="pggrid">'+
       badges.slice(-6).map(k=>'<div class="pgtile" style="text-align:center;">'+
       '<div style="font-size:26px;">🏅</div><div class="l">'+k+'</div></div>').join('')+'</div>';
  }

  /* programs in flight */
  const going=PROGRAMS.filter(p=>p.weeks&&progDone(p.id)>0&&progDone(p.id)<progDays(p));
  if(going.length) h+='<div class="sechead">Programs</div>'+going.map(frow).join('');

  h+='<button class="bigbtn" onclick="askMeasure()" style="margin-top:20px;">＋ Log measurements</button>'+
     '<button class="bigbtn sec" onclick="openShare()">📤 Share progress card</button>';
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
      return '<circle cx="'+px.toFixed(1)+'" cy="'+py.toFixed(1)+'" r="2.6" fill="#fff"/>'; }).join('')+
    '</svg>';
}

/* ── SHARE CARD ──────────────────────────────────────────────────────
   1080×1920 canvas, drawn on device. Works with one user, which a
   leaderboard does not — this is the acquisition loop, not ranking. */
function openShare(){
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
            navigator.share({files:[f],title:'HITFAT+',text:'My progress with HITFAT+ 💪'}).catch(()=>{});
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
function drawShareCard(){
  const cv=$('share-canvas'), x=cv.getContext('2d'), W=1080, H=1920, cx=W/2;
  const tr=pgTraining(), nu=pgNutrition(), wl=weightLog(), streak=liveStreak();
  x.clearRect(0,0,W,H);
  x.fillStyle='#0b0b0d'; x.fillRect(0,0,W,H);
  x.strokeStyle='rgba(239,68,68,.05)'; x.lineWidth=1;
  for(let g=0;g<=W;g+=60){ x.beginPath();x.moveTo(g,0);x.lineTo(g,H);x.stroke(); }
  for(let g=0;g<=H;g+=60){ x.beginPath();x.moveTo(0,g);x.lineTo(W,g);x.stroke(); }
  let rg=x.createRadialGradient(W*.8,H*.12,40,W*.8,H*.12,720);
  rg.addColorStop(0,'rgba(239,68,68,.30)'); rg.addColorStop(1,'rgba(239,68,68,0)');
  x.fillStyle=rg; x.fillRect(0,0,W,H);
  x.strokeStyle='rgba(239,68,68,.35)'; x.lineWidth=3; _rr(x,0,30,30,W-60,H-60,40); x.stroke();

  x.textAlign='center';
  x.fillStyle='#fff'; x.font="800 44px 'Inter',sans-serif";
  x.fillText('HITFAT', cx-28, 180);
  x.fillStyle='#EF4444'; x.fillText('+', cx+72, 180);
  x.fillStyle='rgba(255,255,255,.45)'; x.font="800 22px 'Inter',sans-serif";
  _spaced(x,_pgP==='week'?'THIS WEEK':'LAST 30 DAYS',cx,238,6);

  // hero — weight change if there is one, otherwise sessions
  let heroN, heroL, heroC='#fff';
  if(wl.length>=2){
    const d=Math.round((wl[wl.length-1].kg-wl[0].kg)*10)/10;
    heroN=(d>0?'+':'')+d; heroL='KG CHANGE';
    const goal=(HF.data.nutrition&&HF.data.nutrition.goal)||'lose';
    heroC=((goal==='lose'&&d<0)||((goal==='muscle'||goal==='bulk')&&d>0))?'var(--ok)':'#fff';
  } else { heroN=String(tr.sessions); heroL='SESSIONS'; heroC='#EF4444'; }
  x.fillStyle=heroC; x.font="700 300px 'Oswald',sans-serif";
  x.fillText(heroN, cx, 700);
  x.fillStyle='rgba(255,255,255,.5)'; x.font="800 26px 'Inter',sans-serif";
  _spaced(x,heroL,cx,760,5);

  // streak pill
  const pill=streak>0?('🔥 '+streak+' DAY STREAK'):'🔥 START YOUR STREAK';
  x.font="800 32px 'Inter',sans-serif";
  const pw=x.measureText(pill).width+72, ph=74, py=850, px=cx-pw/2;
  x.fillStyle='rgba(239,68,68,.14)'; _rr(x,px,py,pw,ph,37); x.fill();
  x.strokeStyle='rgba(239,68,68,.5)'; x.lineWidth=2; _rr(x,px,py,pw,ph,37); x.stroke();
  x.fillStyle='#ff6b8a'; x.textBaseline='middle'; x.fillText(pill,cx,py+ph/2+2); x.textBaseline='alphabetic';

  // three stats
  const cards=[[String(tr.sessions),'SESSIONS'],[tr.mins+'m','MINUTES'],
               [nu.target?(nu.onTrack+'/'+nu.logged):String(tr.activeDays), nu.target?'ON TARGET':'ACTIVE DAYS']];
  const cw=(W-120-48)/3, cy=1010;
  cards.forEach((s,i)=>{
    const cxx=60+i*(cw+24);
    x.fillStyle='#f5f3ef'; _rr(x,cxx,cy,cw,200,28); x.fill();
    x.fillStyle='#1a1a1a'; x.font="700 60px 'Oswald',sans-serif"; x.textAlign='center';
    x.fillText(s[0],cxx+cw/2,cy+102);
    x.fillStyle='rgba(0,0,0,.45)'; x.font="800 19px 'Inter',sans-serif";
    _spaced(x,s[1],cxx+cw/2,cy+150,2);
  });

  const line = tr.sessions>=5 ? 'Seriously consistent. That is real discipline. 💪'
             : tr.sessions>=3 ? 'Solid progress — keep pushing, do not ease off now.'
             : tr.sessions>=1 ? 'You started. Do not stop. Every day counts.'
             : 'Today is day one. Let us do this properly.';
  x.fillStyle='rgba(255,255,255,.88)'; x.font="600 42px 'Inter',sans-serif"; x.textAlign='center';
  _wrap(x,line,cx,1400,860,56);

  x.strokeStyle='rgba(255,255,255,.1)'; x.lineWidth=2;
  x.beginPath(); x.moveTo(150,1700); x.lineTo(W-150,1700); x.stroke();
  x.fillStyle='rgba(255,255,255,.4)'; x.font="800 24px 'Inter',sans-serif";
  _spaced(x,'TRAIN · EAT · RECOVER',cx,1766,3);
  x.fillStyle='#EF4444'; x.font="700 70px 'Oswald',sans-serif";
  _spaced(x,'HITFAT.IO',cx,1846,5);
}


/* ═══════════════ TRAIN · Fitness+ structure ═══════════════
