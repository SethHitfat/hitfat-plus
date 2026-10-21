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
  spc:   {n:'Specials',        c:['#2FD1B8','#0B7F72'], top:'HITFAT',      bot:'SPECIAL'}
};
/* each badge: id, category, the number on it (or an icon), what earns it */
var KB_LIST=(function(){
  var L=[], i;
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
  return {cls:+d.total||0, week:best, month:pm.length, pr:(d.prs||[]).length, frd:refs,
          early:early, wknd:wknd, dbl:dbl, ib:(d.inbody||[]).length};
}
function kbHave(b,S){
  if(b.cat==='cls') return S.cls>=b.v;
  if(b.cat==='week') return S.week>=b.v;
  if(b.cat==='month') return S.month>=b.v;
  if(b.cat==='pr') return S.pr>=b.v;
  if(b.cat==='frd') return S.frd>=b.v;
  if(b.id==='early') return S.early>=10;
  if(b.id==='wknd') return S.wknd>=10;
  if(b.id==='dbl') return S.dbl>=5;
  if(b.id==='ib1') return S.ib>=1;
  if(b.id==='ib3') return S.ib>=3;
  return false;
}
/* where the member is on the way to a badge: [now, needed] */
function kbProg(b,S){
  var now=b.cat==='cls'?S.cls:b.cat==='week'?S.week:b.cat==='month'?S.month:b.cat==='pr'?S.pr:b.cat==='frd'?S.frd:
          b.id==='early'?S.early:b.id==='wknd'?S.wknd:b.id==='dbl'?S.dbl:S.ib;
  return [Math.min(now, b.v||b.need), b.v||b.need];
}
function kbEarned(){ var K=HF.data.kelas||(HF.data.kelas={}); return K.badges||(K.badges={}); }

/* ── the badge itself (v2, 21 Oct 2026: Seth wanted it "wow", HITFAT first) ──
   The shield of the HF mark, its V notch on top, in a metal for its tier:
   bronze, silver, gold, HITFAT red, and HITFAT Black at the very top; a red
   ribbon carries the category, the HF+ mark crowns it, stars count the tier,
   and an earned badge has a sheen that sweeps across it. */
var KB_METAL={
  bronze:['#FFD3A1','#D08A4A','#8A4B1C','#5A2E0E'],
  silver:['#FFFFFF','#D9DDE3','#9AA1AB','#5E6570'],
  gold:  ['#FFF6B8','#FFD23F','#D49A00','#7A5300'],
  red:   ['#FF8A80','#FF2A2A','#C20510','#6E0309'],
  black: ['#5A5A62','#2A2A2F','#141416','#000000']
};
var KB_TIERN={bronze:1, silver:2, gold:3, red:4, black:5};
/* each badge's tier: low steps bronze, the long road black */
function kbTier(b){
  var T={cls:{10:'bronze',25:'bronze',50:'silver',100:'silver',150:'gold',200:'gold',250:'gold',300:'red',400:'red',500:'red',750:'black',1000:'black'},
         week:{4:'bronze',8:'bronze',12:'silver',26:'gold',52:'black'},
         month:{1:'bronze',3:'silver',6:'gold',12:'black'},
         pr:{1:'bronze',5:'silver',10:'gold',25:'black'},
         frd:{1:'silver',3:'gold',5:'red'}};
  return (T[b.cat] && T[b.cat][b.v]) || 'red';
}
var _kbN=0;
function kbSVG(b, on, size){
  var id='kb'+(++_kbN), s=size||96, tier=kbTier(b), M=KB_METAL[tier], dark=(tier==='black'||tier==='red'||tier==='bronze');
  var num=b.v!=null?String(b.v):'', fs=num.length>=4?46:num.length===3?56:66;
  var ink=tier==='silver'||tier==='gold'?'#1A1A1C':'#FFFFFF', ribbon=tier==='red'?'#141416':'#E30613';
  var stars='', n=KB_TIERN[tier], k;
  for(k=0;k<n;k++){ var sx=100+(k-(n-1)/2)*15; stars+='<path transform="translate('+sx.toFixed(1)+',86) scale(.55)" d="M0,-10 L2.9,-3.1 10,-3.1 4.3,1.2 6.5,8.1 0,4 -6.5,8.1 -4.3,1.2 -10,-3.1 -2.9,-3.1Z" fill="'+(tier==='gold'||tier==='silver'?'#1A1A1C':'#FFC20E')+'"/>'; }
  var shield='M100 30 L84 14 L16 14 L16 112 C16 162 56 194 100 214 C144 194 184 162 184 112 L184 14 L116 14 Z';
  var inner ='M100 46 L88 28 L30 28 L30 112 C30 154 64 182 100 198 C136 182 170 154 170 112 L170 28 L112 28 Z';
  var mid=b.ic && typeof ICON_PATH!=='undefined'
    ? '<svg x="70" y="94" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="'+ink+'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+ICON_PATH[iconKind(b.ic)]+'</svg>'
    : '<text x="100" y="'+(num.length>=4?146:150)+'" text-anchor="middle" font-size="'+fs+'" font-weight="900" fill="'+ink+'" letter-spacing="-2" font-family="-apple-system,Inter,Helvetica,Arial,sans-serif" style="paint-order:stroke" stroke="rgba(0,0,0,'+(dark?'.25':'0')+')" stroke-width="3">'+num+'</text>';
  var lab=(b.v!=null?(KB_CATS[b.cat].rib||KB_CATS[b.cat].top):b.lab);
  return '<svg class="kb-svg'+(on?' on':' off')+' t-'+tier+'" width="'+s+'" height="'+Math.round(s*1.1)+'" viewBox="0 0 200 220" role="img" aria-label="'+hesc(b.t)+'">'+
    '<defs>'+
      '<linearGradient id="'+id+'m" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="'+M[0]+'"/><stop offset=".35" stop-color="'+M[1]+'"/><stop offset=".7" stop-color="'+M[2]+'"/><stop offset="1" stop-color="'+M[3]+'"/></linearGradient>'+
      '<linearGradient id="'+id+'i" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+M[1]+'"/><stop offset="1" stop-color="'+M[2]+'"/></linearGradient>'+
      '<linearGradient id="'+id+'s" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFFFFF" stop-opacity="0"/><stop offset=".5" stop-color="#FFFFFF" stop-opacity=".55"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></linearGradient>'+
      '<clipPath id="'+id+'c"><path d="'+shield+'"/></clipPath>'+
    '</defs>'+
    /* the shield, its bevel, its face */
    '<path d="'+shield+'" fill="url(#'+id+'m)"/>'+
    '<path d="'+inner+'" fill="url(#'+id+'i)" stroke="rgba(255,255,255,.45)" stroke-width="2"/>'+
    '<path d="'+inner+'" fill="none" stroke="rgba(0,0,0,.18)" stroke-width="1" transform="translate(0,2)"/>'+
    /* a glint on the top left, the sheen that sweeps (earned only) */
    '<path d="M30 28 L88 28 L60 70 L30 92 Z" fill="#FFFFFF" opacity=".16"/>'+
    (on?'<g clip-path="url(#'+id+'c)"><rect class="kb-sheen" x="-120" y="-10" width="70" height="240" fill="url(#'+id+'s)" transform="skewX(-18)"/></g>':'')+
    /* HF+ on top, the tier's stars */
    '<image href="/img/brand/hfplus-mark.png" x="84" y="40" width="32" height="34" opacity="'+(ink==='#FFFFFF'?'.95':'.85')+'" style="'+(ink==='#FFFFFF'?'':'filter:invert(1)')+'"/>'+
    stars+
    mid+
    /* the ribbon */
    '<path d="M4 160 L196 160 L186 175 L196 190 L4 190 L14 175 Z" fill="rgba(0,0,0,.25)" transform="translate(0,3)"/>'+
    '<path d="M4 160 L196 160 L186 175 L196 190 L4 190 L14 175 Z" fill="'+ribbon+'"/>'+
    '<path d="M4 160 L196 160 L196 164 L4 164 Z" fill="rgba(255,255,255,.22)"/>'+
    '<text x="100" y="180" text-anchor="middle" font-size="'+(lab.length>12?12:14)+'" font-weight="900" fill="#FFFFFF" letter-spacing="2" font-family="-apple-system,Inter,Helvetica,Arial,sans-serif">'+hesc(lab)+'</text>'+
    '</svg>';
}

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
  var h='<div class="pwtop"><span></span><button class="pwx" aria-label="Close" onclick="closeProduct()">✕</button></div>'+
    '<div class="kb-sh">'+kbSVG(b,on,190)+'<div class="kb-sh-k">'+KB_CATS[b.cat].n+'</div><div class="kb-sh-t">'+hesc(b.t)+'</div>'+
    '<div class="kb-sh-d">'+hesc(b.d)+'</div>'+
    (on?'<div class="kb-sh-on">Earned'+(E[b.id]?' on '+kbDate(E[b.id]):'')+' ✓</div>'
       :'<div class="kb-sh-p"><span class="kl-tb"><i style="width:'+Math.round(p[0]/p[1]*100)+'%"></i></span><small>'+p[0]+' of '+p[1]+'</small></div>')+
    '</div>';
  $('pw-body').innerHTML=h; $('pwm').classList.add('on'); try{ $('pwm').scrollTop=0; }catch(e){}
}
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
