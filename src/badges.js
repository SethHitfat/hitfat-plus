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

/* ── the badge itself (v5, 21 Oct 2026: "more wow, more sporty"; Seth chose
   direction A, the jersey) ──
   A round medal in the category's colour: a bevelled rim, a dark ring,
   speed slashes across the face, a chevron on top, the number in italic
   Oswald with a thick black outline like a jersey, its word in a black tab
   under it, a stitched ring round the edge. Gloss and a sheen on earned
   ones; graphite when locked. The same drawing goes on the IG Story card
   (kbDraw, canvas). */
var KB_COL={
  /* light, mid, dark, and the number's colour */
  cls:  ['#FF8A80','#E30613','#6E0309','#FFFFFF'],
  week: ['#8E8E96','#2B2B30','#050506','#FFFFFF'],
  month:['#FFC78A','#FF6A1A','#7A2800','#FFFFFF'],
  pr:   ['#FFF0A0','#E8A800','#6E4A00','#FFFFFF'],
  frd:  ['#A9CBFF','#2563EB','#0A2570','#FFFFFF'],
  spc:  ['#9BF2E3','#14B8A6','#064E47','#FFFFFF'],
  pts:  ['#6A6A72','#1C1C1F','#000000','#FFC20E'],
  lock: ['#6E6E74','#3A3A3F','#18181B','rgba(255,255,255,.55)']
};
var KB_FONT="Oswald,'Arial Narrow',Impact,sans-serif";
var _kbN=0;
function kbSVG(b, on, size){
  var id='kb'+(++_kbN), s=size||96, C=KB_COL[on?b.cat:'lock'];
  var n=b.disp||(b.v!=null?String(b.v):''), fs=n.length>=4?66:n.length===3?78:92, ny=n.length>=3?132:138;
  var mid=b.ic && typeof ICON_PATH!=='undefined'
    ? '<svg x="58" y="44" width="84" height="84" viewBox="0 0 24 24" fill="none" stroke="#111" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round">'+ICON_PATH[iconKind(b.ic)]+'</svg>'+
      '<svg x="58" y="44" width="84" height="84" viewBox="0 0 24 24" fill="none" stroke="'+C[3]+'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+ICON_PATH[iconKind(b.ic)]+'</svg>'
    : '<text x="104" y="'+ny+'" text-anchor="middle" font-size="'+fs+'" font-weight="700" font-style="italic" transform="skewX(-8)" fill="'+C[3]+'" stroke="#111" stroke-width="7" paint-order="stroke" stroke-linejoin="round" letter-spacing="-1" font-family="'+KB_FONT+'">'+n+'</text>';
  return '<svg class="kb-svg'+(on?' on':' off')+' c-'+b.cat+'" width="'+s+'" height="'+s+'" viewBox="0 0 200 200" role="img" aria-label="'+hesc(b.t)+'">'+
    '<defs>'+
      '<linearGradient id="'+id+'r" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="'+C[0]+'"/><stop offset=".45" stop-color="'+C[1]+'"/><stop offset=".85" stop-color="'+C[2]+'"/><stop offset="1" stop-color="'+C[1]+'"/></linearGradient>'+
      '<radialGradient id="'+id+'f" cx="38%" cy="30%" r="80%"><stop offset="0" stop-color="'+C[0]+'"/><stop offset=".55" stop-color="'+C[1]+'"/><stop offset="1" stop-color="'+C[2]+'"/></radialGradient>'+
      '<linearGradient id="'+id+'g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".36"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></linearGradient>'+
      '<linearGradient id="'+id+'s" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFFFFF" stop-opacity="0"/><stop offset=".5" stop-color="#FFFFFF" stop-opacity=".45"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></linearGradient>'+
      '<clipPath id="'+id+'c"><circle cx="100" cy="100" r="84"/></clipPath>'+
    '</defs>'+
    '<circle cx="100" cy="100" r="97" fill="url(#'+id+'r)"/>'+
    '<circle cx="100" cy="100" r="86" fill="#0E0E10"/>'+
    '<g clip-path="url(#'+id+'c)">'+
      '<circle cx="100" cy="100" r="84" fill="url(#'+id+'f)"/>'+
      '<path d="M-20 170 L120 -20 L150 -20 L10 170Z" fill="rgba(255,255,255,'+(on?'.16':'.06')+')"/>'+
      '<path d="M20 190 L160 0 L172 0 L32 190Z" fill="rgba(255,255,255,'+(on?'.24':'.08')+')"/>'+
      '<path d="M60 210 L200 20 L230 20 L90 210Z" fill="rgba(0,0,0,.18)"/>'+
      '<ellipse cx="100" cy="40" rx="110" ry="60" fill="url(#'+id+'g)"/>'+
      (on?'<rect class="kb-sheen" x="-120" y="-10" width="60" height="230" fill="url(#'+id+'s)" transform="skewX(-18)"/>':'')+
    '</g>'+
    '<path d="M70 26 L100 40 L130 26" fill="none" stroke="'+(on?'#FFFFFF':'rgba(255,255,255,.4)')+'" stroke-width="5" stroke-linejoin="round" stroke-linecap="round" opacity=".92"/>'+
    '<path d="M78 36 L100 46 L122 36" fill="none" stroke="'+(on?'#FFFFFF':'rgba(255,255,255,.4)')+'" stroke-width="3" stroke-linecap="round" opacity=".55"/>'+
    mid+
    '<rect x="'+(b.lab.length>9?40:52)+'" y="146" width="'+(b.lab.length>9?120:96)+'" height="22" rx="4" fill="#111" opacity=".88"/>'+
    '<text x="100" y="162" text-anchor="middle" font-size="14" font-weight="600" fill="'+(on?'#FFFFFF':'rgba(255,255,255,.55)')+'" letter-spacing="2.5" font-family="'+KB_FONT+'">'+hesc(b.lab)+'</text>'+
    '<circle cx="100" cy="100" r="92" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="1.5" stroke-dasharray="3 9"/>'+
    '</svg>';
}
/* the same medal on a canvas (the IG Story card): centre cx,cy, radius R */
function kbDraw(x, b, cx, cy, R){
  var C=KB_COL[b.cat], k=R/100, P=function(v){ return (v-100)*k; };
  x.save(); x.translate(cx,cy);
  var g=x.createLinearGradient(-R,-R,R,R); g.addColorStop(0,C[0]); g.addColorStop(.45,C[1]); g.addColorStop(.85,C[2]); g.addColorStop(1,C[1]);
  x.fillStyle=g; x.beginPath(); x.arc(0,0,97*k,0,Math.PI*2); x.fill();
  x.fillStyle='#0E0E10'; x.beginPath(); x.arc(0,0,86*k,0,Math.PI*2); x.fill();
  x.save(); x.beginPath(); x.arc(0,0,84*k,0,Math.PI*2); x.clip();
  var f=x.createRadialGradient(P(76),P(60),0,P(76),P(60),160*k); f.addColorStop(0,C[0]); f.addColorStop(.55,C[1]); f.addColorStop(1,C[2]);
  x.fillStyle=f; x.fillRect(-R,-R,2*R,2*R);
  var poly=function(pts,col){ x.fillStyle=col; x.beginPath(); pts.forEach(function(p,i){ if(i) x.lineTo(P(p[0]),P(p[1])); else x.moveTo(P(p[0]),P(p[1])); }); x.closePath(); x.fill(); };
  poly([[-20,170],[120,-20],[150,-20],[10,170]],'rgba(255,255,255,.16)');
  poly([[20,190],[160,0],[172,0],[32,190]],'rgba(255,255,255,.24)');
  poly([[60,210],[200,20],[230,20],[90,210]],'rgba(0,0,0,.18)');
  var gl=x.createLinearGradient(0,P(-20),0,P(100)); gl.addColorStop(0,'rgba(255,255,255,.36)'); gl.addColorStop(1,'rgba(255,255,255,0)');
  x.fillStyle=gl; x.beginPath(); x.ellipse(0,P(40),110*k,60*k,0,0,Math.PI*2); x.fill();
  x.restore();
  x.strokeStyle='#FFFFFF'; x.lineCap='round'; x.lineJoin='round';
  x.lineWidth=5*k; x.globalAlpha=.92; x.beginPath(); x.moveTo(P(70),P(26)); x.lineTo(0,P(40)); x.lineTo(P(130),P(26)); x.stroke();
  x.lineWidth=3*k; x.globalAlpha=.55; x.beginPath(); x.moveTo(P(78),P(36)); x.lineTo(0,P(46)); x.lineTo(P(122),P(36)); x.stroke();
  x.globalAlpha=1;
  var n=b.disp||(b.v!=null?String(b.v):'');
  if(n){
    var fs=(n.length>=4?66:n.length===3?78:92)*k, ny=P(n.length>=3?132:138);
    x.save(); x.transform(1,0,-0.14,1,0,0);
    x.font='italic 700 '+fs+'px '+KB_FONT; x.textAlign='center'; x.textBaseline='alphabetic';
    x.lineWidth=7*k; x.strokeStyle='#111'; x.lineJoin='round'; x.strokeText(n,P(104)+ny*0.14,ny);
    x.fillStyle=C[3]; x.fillText(n,P(104)+ny*0.14,ny); x.restore();
  }
  var wide=b.lab.length>9;
  x.globalAlpha=.88; x.fillStyle='#111'; x.beginPath();
  if(x.roundRect) x.roundRect(P(wide?40:52),P(146),(wide?120:96)*k,22*k,4*k); else x.rect(P(wide?40:52),P(146),(wide?120:96)*k,22*k);
  x.fill(); x.globalAlpha=1;
  x.fillStyle='#FFFFFF'; x.font='600 '+(14*k)+'px '+KB_FONT; x.textAlign='center';
  if('letterSpacing' in x) x.letterSpacing=(2.5*k)+'px';
  x.fillText(b.lab,0,P(162));
  if('letterSpacing' in x) x.letterSpacing='0px';
  x.strokeStyle='rgba(255,255,255,.35)'; x.lineWidth=1.5*k; x.setLineDash([3*k,9*k]); x.beginPath(); x.arc(0,0,92*k,0,Math.PI*2); x.stroke(); x.setLineDash([]);
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
