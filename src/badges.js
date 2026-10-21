/* ═══════════════ HITFAT badges, for the physical class (21 Oct 2026) ═══════════════
   After BFT's badge wall ("Earned / Available") and the milestone habits of
   Orangetheory, Peloton and Barry's (Seth: "tiru dan upgrade", class first,
   online later). Round badges in HITFAT's colours, drawn here as SVG, so
   they are sharp at any size and need no artwork:

     red     Class Club      all-time classes at HQ
     black   Week streak     weeks in a row with a class
     orange  Bulan Padu      months with 10 classes or more
     gold    Personal record PRs logged
     blue    Bring a friend  friends who joined
     teal    Specials        early bird, weekend warrior, double day, InBody

   OS gives every class only for the last 120 days (plus all-time totals and
   weeks), so a badge, once earned, is kept on the account
   (HF.data.kelas.badges, id → the day it was earned) and never taken back.
   A new one gets its moment (kbCheck, after the class loads). ES5. */

var KB_CATS={
  cls:   {n:'Class Club',      c:['#FF4B4B','#B3040F'], top:'CLASS CLUB',  bot:'HITFAT HQ', rib:'CLASSES'},
  week:  {n:'Week streak',     c:['#4A4A50','#111113'], top:'WEEK STREAK', bot:'IN A ROW', rib:'WEEK STREAK'},
  month: {n:'Bulan Padu',      c:['#FF9A3D','#D9480F'], top:'BULAN PADU',  bot:'10+ CLASSES', rib:'BULAN PADU'},
  pr:    {n:'Personal record', c:['#FFD45E','#B07800'], top:'PERSONAL',    bot:'RECORDS', rib:'PR'},
  frd:   {n:'Bring a friend',  c:['#4C8DFF','#163FB0'], top:'SQUAD',       bot:'FRIENDS IN', rib:'SQUAD'},
  spc:   {n:'Specials',        c:['#2FD1B8','#0B7F72'], top:'HITFAT',      bot:'SPECIAL'},
  pts:   {n:'Points Club',     c:['#4A4A50','#111113'], top:'POINTS CLUB', bot:'LIFETIME'}
};
/* each badge: id, category, the number on it (or an icon), what earns it */
var KB_LIST=(function(){
  var L=[], i;
  L.push({id:'cls1', cat:'cls', v:1, lab:'FIRST CLASS', t:'First Class', d:'Your first class at HITFAT HQ. Welcome to the family'});
  var cls=[10,25,50,100,150,200,250,300,400,500,750,1000];
  for(i=0;i<cls.length;i++) L.push({id:'cls'+cls[i], cat:'cls', v:cls[i], lab:'CLASSES', t:cls[i]+' Class Club', d:cls[i]+' classes at HITFAT HQ'});
  var wk=[4,8,12,26,52];
  for(i=0;i<wk.length;i++) L.push({id:'wk'+wk[i], cat:'week', v:wk[i], lab:'WEEKS', t:wk[i]+'-week streak', d:'A class every week, '+wk[i]+' weeks in a row'});
  var mo=[1,3,6,12];
  for(i=0;i<mo.length;i++) L.push({id:'mo'+mo[i], cat:'month', v:mo[i], lab:mo[i]===1?'MONTH':'MONTHS', t:mo[i]===1?'First Bulan Padu':mo[i]+' Bulan Padu', d:mo[i]===1?'A month with 10 classes or more':mo[i]+' months with 10 classes or more'});
  var pr=[1,5,10,25];
  for(i=0;i<pr.length;i++) L.push({id:'pr'+pr[i], cat:'pr', v:pr[i], lab:pr[i]===1?'FIRST PR':'PRS', t:pr[i]===1?'First PR':pr[i]+' PRs', d:pr[i]===1?'Your first personal record':pr[i]+' personal records'});
  var fr=[1,3,5];
  for(i=0;i<fr.length;i++) L.push({id:'fr'+fr[i], cat:'frd', v:fr[i], lab:fr[i]===1?'FRIEND':'FRIENDS', t:fr[i]===1?'Brought a friend':fr[i]+' friends brought', d:fr[i]===1?'A friend joined because of you':fr[i]+' friends joined because of you'});
  var pts=[[5000,'5K'],[10000,'10K'],[25000,'25K'],[50000,'50K'],[100000,'100K']];
  for(i=0;i<pts.length;i++) L.push({id:'pts'+pts[i][0], cat:'pts', v:pts[i][0], disp:pts[i][1], lab:'POINTS', t:pts[i][1]+' Club', d:pts[i][0].toLocaleString('en-MY')+' HITFAT Points earned, all-time'});
  L.push({id:'early', cat:'spc', ic:'sunrise', lab:'EARLY BIRD', t:'Early Bird', d:'10 classes that started before 8 am', need:10});
  L.push({id:'wknd',  cat:'spc', ic:'calendar', lab:'WEEKEND', t:'Weekend Warrior', d:'10 classes on a Saturday or Sunday', need:10});
  L.push({id:'dbl',   cat:'spc', ic:'repeat', lab:'DOUBLE DAY', t:'Double Day', d:'5 days with two classes, 3 hours apart', need:5});
  L.push({id:'ib1',   cat:'spc', ic:'scale', lab:'INBODY', t:'First InBody', d:'Your first InBody scan, in the app', need:1});
  L.push({id:'ib3',   cat:'spc', ic:'chart', lab:'INBODY x3', t:'Tracking it', d:'3 InBody scans: you can see the change', need:3});
  return L;
})();

/* ── the numbers, from what OS sends ── */
function kbStats(){
  var d=(typeof Kelas!=='undefined' && Kelas.data)||{}, P=d.points||{}, now=Date.now();
  var ins=(d.checkins||[]).map(function(t){ return new Date(Date.parse(t)+8*3600e3); });   /* Malaysian time */
  /* weeks in a row, from every week OS has */
  var w=(d.weeks||[]).map(function(x){ return Date.parse(String(x).slice(0,10)+'T00:00:00Z'); }).filter(function(x){ return x; }).sort(function(a,b){ return a-b; });
  var best=0, run=0, prev=null;
  w.forEach(function(t){ run=(prev!==null && t-prev===7*864e5)?run+1:1; if(run>best) best=run; prev=t; });
  /* per day, per month */
  var byDay={}, byMonth={};
  ins.forEach(function(x){ var k=x.toISOString().slice(0,10); (byDay[k]=byDay[k]||[]).push(x.getTime()); });
  Object.keys(byDay).forEach(function(k){ var m=k.slice(0,7); byMonth[m]=(byMonth[m]||0)+1; });
  var early=0, wknd=0, dbl=0;
  ins.forEach(function(x){ if(x.getUTCHours()<8) early++; var g=x.getUTCDay(); if(g===0||g===6) wknd++; });
  Object.keys(byDay).forEach(function(k){ var a=byDay[k].sort(); if(a.length>1 && a[a.length-1]-a[0]>=3*3600e3) dbl++; });
  /* months with 10+ class days: the ones seen now, and every one seen before */
  var K=(typeof HF!=='undefined' && HF.data && (HF.data.kelas||(HF.data.kelas={})))||{}, pm=K.padu||(K.padu=[]);
  Object.keys(byMonth).forEach(function(m){ if(byMonth[m]>=10 && pm.indexOf(m)<0) pm.push(m); });
  var refs=(P.history||[]).filter(function(x){ return x.t==='referral'; }).length;
  return {cls:+d.total||0, pts:+P.lifetime||0, week:best, month:pm.length, pr:(d.prs||[]).length, frd:refs,
          early:early, wknd:wknd, dbl:dbl, ib:(d.inbody||[]).length};
}
function kbHave(b,S){
  if(b.cat==='cls') return S.cls>=b.v;
  if(b.cat==='week') return S.week>=b.v;
  if(b.cat==='month') return S.month>=b.v;
  if(b.cat==='pr') return S.pr>=b.v;
  if(b.cat==='frd') return S.frd>=b.v;
  if(b.cat==='pts') return S.pts>=b.v;
  if(b.id==='early') return S.early>=10;
  if(b.id==='wknd') return S.wknd>=10;
  if(b.id==='dbl') return S.dbl>=5;
  if(b.id==='ib1') return S.ib>=1;
  if(b.id==='ib3') return S.ib>=3;
  return false;
}
/* where the member is on the way to a badge: [now, needed] */
function kbProg(b,S){
  var now=b.cat==='cls'?S.cls:b.cat==='week'?S.week:b.cat==='month'?S.month:b.cat==='pr'?S.pr:b.cat==='frd'?S.frd:b.cat==='pts'?S.pts:
          b.id==='early'?S.early:b.id==='wknd'?S.wknd:b.id==='dbl'?S.dbl:S.ib;
  return [Math.min(now, b.v||b.need), b.v||b.need];
}
function kbEarned(){ var K=HF.data.kelas||(HF.data.kelas={}); return K.badges||(K.badges={}); }

/* ── the badge itself (v6, 21 Oct 2026: after the badge Seth made with
   ChatGPT, "100 CLASSES", which he liked) ──
   A glass medal: a thick glossy rim in the category's colour with a black
   band across its upper right, a thin bright ring, a dark face with
   diagonal light panels, a flare on the left, the number huge in heavy
   italic (white to a tint, a dark edge, a glow), its word spaced out
   under it. A sheen on earned ones; graphite when locked. kbDraw draws the
   same on a canvas for the IG Story card. */
var KB_COL={
  /* light, mid, dark, face, the number's tint */
  cls:  ['#FF6B6B','#E30613','#7A030A','#1E0003','#FFD9D9'],
  week: ['#A4A4AC','#3A3A40','#0A0A0C','#0B0B0D','#E6E6EA'],
  month:['#FFB37A','#FF6A1A','#7A2800','#1E0900','#FFE2CC'],
  pr:   ['#FFE680','#E8A800','#6E4A00','#1C1300','#FFF1B8'],
  frd:  ['#8FB8FF','#2563EB','#0A2570','#030B24','#DCE8FF'],
  spc:  ['#7FEADB','#14B8A6','#064E47','#011C19','#D6FFF8'],
  pts:  ['#FFE07A','#C99A00','#3A2A00','#09090A','#FFD45E'],
  lock: ['#77777D','#3A3A3F','#18181B','#121214','#8A8A90']
};
var KB_FONT="'Inter',-apple-system,'Helvetica Neue',Arial,sans-serif";
var _kbN=0;
/* the number's size and baseline: as big as the face allows */
function kbNumSize(n){
  var w=n.length+(/[KMW]/.test(n)?0.6:0);
  return w>=4.5?[56,124]:w>=4?[64,126]:w>=3.5?[70,127]:w>=3?[86,130]:w>=2?[100,134]:[110,136];
}
function kbSVG(b, on, size){
  var id='kb'+(++_kbN), s=size||96, C=KB_COL[on?b.cat:'lock'];
  var n=b.disp||(b.v!=null?String(b.v):''), m=kbNumSize(n), fs=m[0], ny=m[1], nx=100+ny*0.2126-3;
  var band=on?(b.cat==='week'?'#6A6A72':'#0E0E10'):'#2A2A2E';
  var arc=function(r1,r2,a1,a2){ var R=Math.PI/180, p=function(r,a){ return (100+r*Math.cos(a*R)).toFixed(2)+' '+(100+r*Math.sin(a*R)).toFixed(2); };
    return 'M'+p(r2,a1)+' A'+r2+' '+r2+' 0 0 1 '+p(r2,a2)+' L'+p(r1,a2)+' A'+r1+' '+r1+' 0 0 0 '+p(r1,a1)+' Z'; };
  var panel=function(cx,cy,w,h,col,op){ return '<rect x="'+(cx-w/2)+'" y="'+(cy-h/2)+'" width="'+w+'" height="'+h+'" rx="6" fill="'+col+'" opacity="'+(op||1)+'" transform="rotate(42 '+cx+' '+cy+')"/>'; };
  var mid=b.ic && typeof ICON_PATH!=='undefined'
    ? '<svg x="56" y="38" width="88" height="88" viewBox="0 0 24 24" fill="none" stroke="url(#'+id+'n)" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" filter="url(#'+id+'w)">'+ICON_PATH[iconKind(b.ic)]+'</svg>'
    : '<g transform="skewX(-12)" filter="url(#'+id+'w)" font-family="'+KB_FONT+'" font-size="'+fs+'" font-weight="900" font-style="italic" letter-spacing="-4" text-anchor="middle">'+
        '<text x="'+nx.toFixed(1)+'" y="'+ny+'" fill="'+C[2]+'" stroke="'+C[3]+'" stroke-width="9" stroke-linejoin="round">'+n+'</text>'+
        '<text x="'+nx.toFixed(1)+'" y="'+ny+'" fill="url(#'+id+'n)" stroke="url(#'+id+'n)" stroke-width="3.2" stroke-linejoin="round">'+n+'</text></g>';
  return '<svg class="kb-svg'+(on?' on':' off')+' c-'+b.cat+'" width="'+s+'" height="'+s+'" viewBox="0 0 200 200" role="img" aria-label="'+hesc(b.t)+'">'+
    '<defs>'+
      '<linearGradient id="'+id+'r" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="'+C[0]+'"/><stop offset=".4" stop-color="'+C[1]+'"/><stop offset=".8" stop-color="'+C[2]+'"/><stop offset="1" stop-color="'+C[1]+'"/></linearGradient>'+
      '<radialGradient id="'+id+'f" cx="40%" cy="35%" r="75%"><stop offset="0" stop-color="'+C[2]+'"/><stop offset=".6" stop-color="'+C[3]+'"/><stop offset="1" stop-color="#000000"/></radialGradient>'+
      '<linearGradient id="'+id+'p" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+C[0]+'" stop-opacity=".95"/><stop offset=".5" stop-color="'+C[1]+'" stop-opacity=".9"/><stop offset="1" stop-color="'+C[2]+'" stop-opacity=".6"/></linearGradient>'+
      '<linearGradient id="'+id+'n" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".55" stop-color="#FFFFFF"/><stop offset="1" stop-color="'+C[4]+'"/></linearGradient>'+
      '<linearGradient id="'+id+'g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".55"/><stop offset=".35" stop-color="#FFFFFF" stop-opacity="0"/></linearGradient>'+
      '<radialGradient id="'+id+'x" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".95"/><stop offset=".3" stop-color="'+C[0]+'" stop-opacity=".55"/><stop offset="1" stop-color="'+C[0]+'" stop-opacity="0"/></radialGradient>'+
      '<linearGradient id="'+id+'s" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFFFFF" stop-opacity="0"/><stop offset=".5" stop-color="#FFFFFF" stop-opacity=".4"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></linearGradient>'+
      '<filter id="'+id+'w" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="2" stdDeviation="1.2" flood-color="#000" flood-opacity=".55"/><feDropShadow dx="0" dy="0" stdDeviation="'+(on?4:0)+'" flood-color="'+C[1]+'" flood-opacity="'+(on?.9:0)+'"/></filter>'+
      '<clipPath id="'+id+'c"><circle cx="100" cy="100" r="82"/></clipPath>'+
    '</defs>'+
    /* the rim, its black band, its gloss */
    '<circle cx="100" cy="100" r="97" fill="url(#'+id+'r)"/>'+
    '<path d="'+arc(84,97,-62,28)+'" fill="'+band+'"/>'+
    '<path d="'+arc(84,97,148,182)+'" fill="'+band+'" opacity=".85"/>'+
    '<circle cx="100" cy="100" r="97" fill="url(#'+id+'g)"/>'+
    '<circle cx="100" cy="100" r="96" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="1.2"/>'+
    /* the face: dark, with diagonal panels of light */
    '<circle cx="100" cy="100" r="84" fill="'+C[1]+'"/>'+
    '<g clip-path="url(#'+id+'c)">'+
      '<circle cx="100" cy="100" r="82" fill="url(#'+id+'f)"/>'+
      panel(132,58,26,150,'url(#'+id+'p)',.95)+panel(160,92,12,150,'url(#'+id+'p)',.75)+panel(74,108,18,170,'url(#'+id+'p)',.55)+panel(46,140,30,120,'url(#'+id+'p)',.9)+panel(108,160,10,120,C[1],.6)+
      '<rect x="-40" y="-40" width="280" height="140" fill="url(#'+id+'g)" opacity=".5"/>'+
      (on?'<rect class="kb-sheen" x="-120" y="-10" width="60" height="230" fill="url(#'+id+'s)" transform="skewX(-18)"/>':'')+
    '</g>'+
    '<circle cx="100" cy="100" r="83" fill="none" stroke="'+C[0]+'" stroke-width="1.6" opacity=".9"/>'+
    mid+
    '<text x="100" y="'+(b.v!=null?158:150)+'" text-anchor="middle" font-size="'+(b.lab.length>9?12:14)+'" font-weight="800" letter-spacing="'+(b.lab.length>9?3:5)+'" fill="#FFFFFF" fill-opacity="'+(on?1:.6)+'" font-family="'+KB_FONT+'">'+hesc(b.lab)+'</text>'+
    (on?'<circle cx="24" cy="64" r="16" fill="url(#'+id+'x)"/>':'')+
    '</svg>';
}
/* the same medal on a canvas (the IG Story card): centre cx,cy, radius R */
function kbDraw(x, b, cx, cy, R){
  var C=KB_COL[b.cat], k=R/100, P=function(v){ return (v-100)*k; }, D=Math.PI/180;
  x.save(); x.translate(cx,cy);
  var g=x.createLinearGradient(-R,-R,R,R); g.addColorStop(0,C[0]); g.addColorStop(.4,C[1]); g.addColorStop(.8,C[2]); g.addColorStop(1,C[1]);
  x.fillStyle=g; x.beginPath(); x.arc(0,0,97*k,0,Math.PI*2); x.fill();
  var band=function(a1,a2,al){ x.globalAlpha=al; x.fillStyle=b.cat==='week'?'#6A6A72':'#0E0E10'; x.beginPath(); x.arc(0,0,97*k,a1*D,a2*D); x.arc(0,0,84*k,a2*D,a1*D,true); x.closePath(); x.fill(); x.globalAlpha=1; };
  band(-62,28,1); band(148,182,.85);
  var gl=x.createLinearGradient(-R,-R,R,R); gl.addColorStop(0,'rgba(255,255,255,.55)'); gl.addColorStop(.35,'rgba(255,255,255,0)');
  x.fillStyle=gl; x.beginPath(); x.arc(0,0,97*k,0,Math.PI*2); x.fill();
  x.fillStyle=C[1]; x.beginPath(); x.arc(0,0,84*k,0,Math.PI*2); x.fill();
  x.save(); x.beginPath(); x.arc(0,0,82*k,0,Math.PI*2); x.clip();
  var f=x.createRadialGradient(P(83.6),P(75.4),0,P(83.6),P(75.4),123*k); f.addColorStop(0,C[2]); f.addColorStop(.6,C[3]); f.addColorStop(1,'#000000');
  x.fillStyle=f; x.fillRect(-R,-R,2*R,2*R);
  /* the panels as kbSVG's: centred at px,py, turned 42°, light at the top */
  var panel=function(px,py,w,h,op,flat){ x.save(); x.translate(P(px),P(py)); x.rotate(42*D); x.globalAlpha=op;
    if(flat) x.fillStyle=C[1];
    else { var pg=x.createLinearGradient(0,-h*k/2,0,h*k/2); pg.addColorStop(0,C[0]); pg.addColorStop(.5,C[1]); pg.addColorStop(1,C[2]); x.fillStyle=pg; }
    x.beginPath(); if(x.roundRect) x.roundRect(-w*k/2,-h*k/2,w*k,h*k,6*k); else x.rect(-w*k/2,-h*k/2,w*k,h*k); x.fill(); x.restore(); };
  panel(132,58,26,150,.9); panel(160,92,12,150,.7); panel(74,108,18,170,.5); panel(46,140,30,120,.85); panel(108,160,10,120,.6,true);
  var tg=x.createLinearGradient(P(-40),P(-40),P(240),P(100)); tg.addColorStop(0,'rgba(255,255,255,.28)'); tg.addColorStop(.35,'rgba(255,255,255,0)');
  x.fillStyle=tg; x.fillRect(P(-40),P(-40),280*k,140*k);
  x.restore();
  x.strokeStyle=C[0]; x.lineWidth=1.6*k; x.beginPath(); x.arc(0,0,83*k,0,Math.PI*2); x.stroke();
  var n=b.disp||(b.v!=null?String(b.v):'');
  if(n){
    /* the skew turns about the centre here (the SVG's turns about its corner) */
    var m=kbNumSize(n), fs=m[0]*k, ny=P(m[1]), nx=ny*0.2126-3*k;
    x.save(); x.transform(1,0,-0.2126,1,0,0);
    x.font='italic 900 '+fs+'px '+KB_FONT; x.textAlign='center'; x.textBaseline='alphabetic';
    if('letterSpacing' in x) x.letterSpacing=(-4*k)+'px';
    var ng=x.createLinearGradient(0,ny-fs*.8,0,ny); ng.addColorStop(0,'#FFFFFF'); ng.addColorStop(.55,'#FFFFFF'); ng.addColorStop(1,C[4]);
    x.lineJoin='round'; x.shadowColor=C[1]; x.shadowBlur=14*k;
    x.lineWidth=9*k; x.strokeStyle=C[3]; x.strokeText(n,nx,ny);
    x.shadowBlur=0; x.fillStyle=C[2]; x.fillText(n,nx,ny);
    x.lineWidth=3.2*k; x.strokeStyle=ng; x.strokeText(n,nx,ny);
    x.fillStyle=ng; x.fillText(n,nx,ny);
    if('letterSpacing' in x) x.letterSpacing='0px';
    x.restore();
  }
  x.fillStyle='#FFFFFF'; x.font='800 '+((b.lab.length>9?12:14)*k)+'px '+KB_FONT; x.textAlign='center';
  if('letterSpacing' in x) x.letterSpacing=((b.lab.length>9?3:5)*k)+'px';
  x.fillText(b.lab,0,P(b.v!=null?158:150));
  if('letterSpacing' in x) x.letterSpacing='0px';
  var fl=x.createRadialGradient(P(24),P(64),0,P(24),P(64),16*k); fl.addColorStop(0,'rgba(255,255,255,.95)'); fl.addColorStop(1,'rgba(255,255,255,0)');
  x.fillStyle=fl; x.beginPath(); x.arc(P(24),P(64),16*k,0,Math.PI*2); x.fill();
  x.restore();
}
/* the IG Story card: black, a red glow, the medal, its name, the member */
function kbDrawShare(x,W,H,cx,F,S){
  var b=KB_LIST.filter(function(z){ return z.id===S.id; })[0]; if(!b) return;
  x.fillStyle='#070708'; x.fillRect(0,0,W,H);
  var r=x.createRadialGradient(cx,H*.32,0,cx,H*.32,W*.9); r.addColorStop(0,'rgba(227,6,19,.55)'); r.addColorStop(1,'rgba(227,6,19,0)');
  x.fillStyle=r; x.fillRect(0,0,W,H);
  x.textAlign='center';
  x.fillStyle='#FFFFFF'; x.font=F(900,64); x.fillText('HITFAT+',cx,220);
  x.fillStyle='rgba(255,255,255,.75)'; x.font=F(800,30); if(typeof _spaced==='function') _spaced(x,'NEW BADGE UNLOCKED',cx,280,6); else x.fillText('NEW BADGE UNLOCKED',cx,280);
  x.save(); x.shadowColor='rgba(0,0,0,.6)'; x.shadowBlur=60; x.shadowOffsetY=30; kbDraw(x,b,cx,H*.42,330); x.restore();
  x.fillStyle='#FFFFFF'; x.font=F(900,84); x.fillText(b.t,cx,H*.42+460);
  x.fillStyle='rgba(255,255,255,.7)'; x.font=F(600,38); x.fillText(b.d,cx,H*.42+530);
  var first=String((typeof Kelas!=='undefined'&&Kelas.data&&Kelas.data.name)||'').trim().split(/\s+/)[0]||'';
  var E=kbEarned(), when=E[b.id]?kbDate(E[b.id]):'';
  x.fillStyle='#FFC20E'; x.font=F(900,52); if(first) x.fillText(first.toUpperCase(),cx,H-300);
  x.fillStyle='rgba(255,255,255,.7)'; x.font=F(700,34); x.fillText('HITFAT HQ'+(when?' · '+when:''),cx,H-245);
  x.fillStyle='rgba(255,255,255,.75)'; x.font=F(700,34); x.fillText('app.hitfat.io',cx,H-110);
}
function kbShare(id){ Kelas.share={kind:'badge', id:id}; if(typeof openShare==='function') openShare('kelas'); }

/* ── the wall, on the class Progress tab ── */
function kbHTML(){
  if(typeof Kelas==='undefined' || !Kelas.data) return '';
  var S=kbStats(), E=kbEarned(), tab=Kelas.kbTab||'earned';
  var have=KB_LIST.filter(function(b){ return E[b.id] || kbHave(b,S); });
  var todo=KB_LIST.filter(function(b){ return !(E[b.id] || kbHave(b,S)); });
  var list=tab==='earned'?have:todo;
  var h='<div class="kb"><div class="kb-h"><div><b>Badges</b><small>'+have.length+' of '+KB_LIST.length+' earned</small></div></div>'+
    '<div class="kb-tabs"><button class="'+(tab==='earned'?'on':'')+'" onclick="kbTab(\'earned\')">Earned · '+have.length+'</button>'+
    '<button class="'+(tab==='todo'?'on':'')+'" onclick="kbTab(\'todo\')">Available · '+todo.length+'</button></div>';
  if(!list.length) h+='<div class="kb-none">'+(tab==='earned'?'Your first badge comes with your 10th class. Every class counts.':'Every badge earned. Legend. 🏆')+'</div>';
  else h+='<div class="kb-grid">'+list.map(function(b){
      var p=kbProg(b,S), on=tab==='earned';
      return '<button class="kb-i" onclick="kbOpen(\''+b.id+'\')">'+kbSVG(b,on,92)+'<b>'+hesc(b.t)+'</b>'+
        (on?'':'<small>'+p[0]+' / '+p[1]+'</small>')+'</button>';
    }).join('')+'</div>';
  return h+'</div>';
}
function kbTab(t){ Kelas.kbTab=t; if(typeof renderKelas==='function') renderKelas(); }
function kbOpen(id){
  var b=KB_LIST.filter(function(x){ return x.id===id; })[0]; if(!b) return;
  var S=kbStats(), E=kbEarned(), on=!!(E[b.id]||kbHave(b,S)), p=kbProg(b,S);
  var h='<div class="pwtop"><span></span><button class="pwx" aria-label="Close" onclick="kbClose()">✕</button></div>'+
    '<div class="kb-sh"><div class="kb-spin">'+kbSVG(b,on,210)+'</div><div class="kb-sh-k">'+KB_CATS[b.cat].n+'</div><div class="kb-sh-t">'+hesc(b.t)+'</div>'+
    '<div class="kb-sh-d">'+hesc(b.d)+'</div>'+
    (on?'<div class="kb-sh-on">Earned'+(E[b.id]?' on '+kbDate(E[b.id]):'')+' ✓</div><div><button class="kb-share" onclick="kbClose();kbShare(\''+b.id+'\')">'+glyph('share')+' Share to your story</button></div>'
       :'<div class="kb-sh-p"><span class="kl-tb"><i style="width:'+Math.round(p[0]/p[1]*100)+'%"></i></span><small>'+p[0]+' of '+p[1]+'</small></div>')+
    '</div>';
  $('pw-body').innerHTML=h; $('pwm').classList.add('on','kbm'); try{ $('pwm').scrollTop=0; }catch(e){}
}
function kbClose(){ $('pwm').classList.remove('kbm'); closeProduct(); }
function kbDate(k){ try{ return new Date(k+'T00:00:00').toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}); }catch(e){ return k; } }

/* ── newly earned: kept, and shown once ── */
function kbCheck(){
  try{
    if(typeof Kelas==='undefined' || !Kelas.data || typeof HF==='undefined' || !HF.data) return false;
    var S=kbStats(), E=kbEarned(), today=iso(0), fresh=[];
    KB_LIST.forEach(function(b){ if(!E[b.id] && kbHave(b,S)){ E[b.id]=today; fresh.push(b); } });
    if(!fresh.length) return false;
    HF.save();
    if(!$('scc') || $('scc').style.display==='flex') return false;
    /* the proudest one leads: the biggest Class Club, then the longest streak, … */
    var rank=['cls','week','month','pr','frd','spc'];
    var top=fresh.slice().sort(function(a,c){ var r=rank.indexOf(a.cat)-rank.indexOf(c.cat); return r||((c.v||0)-(a.v||0)); })[0], more=fresh.length-1;
    var cols=['#E30613','#FFC20E','#FFFFFF','#FF8A3D'], conf='', i;
    for(i=0;i<24;i++) conf+='<i style="left:'+((i*37)%100)+'%;background:'+cols[i%4]+';-webkit-animation-delay:'+(i%8)*0.18+'s;animation-delay:'+(i%8)*0.18+'s"></i>';
    $('scc').className='scc scc-meet';
    $('scc').innerHTML='<div class="scc-conf">'+conf+'</div><div class="scc-in"><div class="kb-pop">'+kbSVG(top,true,200)+'</div>'+
      '<div class="scc-t">'+(more?'New badges! 🏅':'New badge! 🏅')+'</div>'+
      '<div class="scc-s"><b>'+hesc(top.t)+'</b>'+(more?' and '+more+' more':'')+'</div>'+
      '<div class="scc-s scc-bellsays">'+(top.cat==='cls'?'Wah, '+top.v+' kelas! Bara bangga sangat dengan awak 🔥':'Lencana baru untuk awak! Bara tumpang gembira 🎉')+'</div>'+
      '<button class="bigbtn scc-share" onclick="scCelebrateClose();if(typeof openKelas===\'function\'){openKelas();Kelas.kbTab=\'earned\';kelasTab(\'progress\');}">See my badges</button>'+
      '<button class="scc-x" onclick="scCelebrateClose()">Later</button></div>';
    $('scc').style.display='flex';
    if(typeof hfSound==='function') try{ hfSound('cheer'); }catch(e){}
    return true;
  }catch(e){ return false; }
}
