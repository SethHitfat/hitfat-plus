/* ═══════════════ HITFAT badges, for the physical class (21 Oct 2026) ═══════════════
   After BFT's badge wall and the milestone habits of Orangetheory, Peloton
   and Barry's (Seth: "tiru dan upgrade", class first, online later).

   v8 (22 Oct 2026): Nike Training Club's achievements, which Seth showed in
   a screen recording ("lagi lawa"). Every badge is its own picture, made by
   Seth with ChatGPT in NTC's style (a thin diamond, one object, a small
   engraved number, the HF mark), on black: img/badges/<id>.jpg, cut from the
   sheets in _projek/lencana/ntc. As in NTC the object grows heavier with the
   count (medicine ball 1–7, kettlebell 10–25, dumbbell 50–150, plate 200+),
   and the wall is NTC's: one dark case, a section per kind, the ones not yet
   earned as dim grey silhouettes of the same picture.

     Class Club      all-time classes at HQ (1, 3, 5, 7, 10 … 1,000)
     Streaks         weeks in a row, class days in one week, Bulan Padu
     Records, squad  PRs logged, friends who joined
     Points Club     lifetime points
     Specials        Early Bird, Night Owl, Weekend Warrior, Beast Mode,
                     Comeback, Double Day, InBody, New Year, Merdeka,
                     Ramadan, Birthday

   OS gives every class only for the last 120 days (plus all-time totals and
   weeks), so a badge, once earned, is kept on the account
   (HF.data.kelas.badges, id → the day it was earned) and never taken back.
   A new one gets its moment (kbCheck, after the class loads). ES5. */

var KB_CATS={
  cls:   {n:'Class Club'},
  week:  {n:'Week streak'},
  wkx:   {n:'In one week'},
  month: {n:'Bulan Padu'},
  pr:    {n:'Personal record'},
  frd:   {n:'Bring a friend'},
  pts:   {n:'Points Club'},
  spc:   {n:'Special'}
};
/* the wall's sections, NTC's "Milestones", "Streaks", … */
var KB_SECT=[['Class Club',['cls']],['Streaks',['week','wkx','month']],['Records & squad',['pr','frd']],['Points Club',['pts']],['Specials',['spc']]];
/* Ramadan in Malaysia, approximately (as score2.js) */
var KB_RAMADAN=[['2026-02-18','2026-03-19'],['2027-02-08','2027-03-09'],['2028-01-28','2028-02-26'],['2029-01-16','2029-02-14']];
/* each badge: id (its picture), category, the stat it counts (k) and how many (v, or need) */
var KB_LIST=(function(){
  var L=[], i;
  L.push({id:'cls1', cat:'cls', k:'cls', v:1, t:'First Class', d:'Your first class at HITFAT HQ. Welcome to the family'});
  var cls=[3,5,7,10,25,50,100,150,200,250,300,400,500,750,1000];
  for(i=0;i<cls.length;i++) L.push({id:'cls'+cls[i], cat:'cls', k:'cls', v:cls[i], t:cls[i]+' Class Club', d:cls[i]+' classes at HITFAT HQ'});
  var wk=[4,8,12,26,52];
  for(i=0;i<wk.length;i++) L.push({id:'wk'+wk[i], cat:'week', k:'week', v:wk[i], t:wk[i]+'-week streak', d:'A class every week, '+wk[i]+' weeks in a row'});
  for(i=3;i<=5;i++) L.push({id:'wx'+i, cat:'wkx', k:'wkx', v:i, t:i+'x in a week', d:'Classes on '+i+' different days in one week'});
  var mo=[1,3,6,12];
  for(i=0;i<mo.length;i++) L.push({id:'mo'+mo[i], cat:'month', k:'month', v:mo[i], t:mo[i]===1?'First Bulan Padu':mo[i]+' Bulan Padu', d:mo[i]===1?'A month with 10 classes or more':mo[i]+' months with 10 classes or more'});
  var pr=[1,5,10,25];
  for(i=0;i<pr.length;i++) L.push({id:'pr'+pr[i], cat:'pr', k:'pr', v:pr[i], t:pr[i]===1?'First PR':pr[i]+' PRs', d:pr[i]===1?'Your first personal record':pr[i]+' personal records'});
  var fr=[1,3,5];
  for(i=0;i<fr.length;i++) L.push({id:'fr'+fr[i], cat:'frd', k:'frd', v:fr[i], t:fr[i]===1?'Brought a friend':fr[i]+' friends brought', d:fr[i]===1?'A friend joined because of you':fr[i]+' friends joined because of you'});
  var pts=[[5000,'5K'],[10000,'10K'],[25000,'25K'],[50000,'50K'],[100000,'100K']];
  for(i=0;i<pts.length;i++) L.push({id:'pts'+pts[i][0], cat:'pts', k:'pts', v:pts[i][0], t:pts[i][1]+' Club', d:pts[i][0].toLocaleString('en-MY')+' HITFAT Points earned, all-time'});
  L.push({id:'early',   cat:'spc', k:'early',   need:10, t:'Early Bird',      d:'10 classes that started before 8 am'});
  L.push({id:'owl',     cat:'spc', k:'owl',     need:10, t:'Night Owl',       d:'10 classes at 8 pm or later'});
  L.push({id:'wknd',    cat:'spc', k:'wknd',    need:10, t:'Weekend Warrior', d:'10 classes on a Saturday or Sunday'});
  L.push({id:'beast',   cat:'spc', k:'beast',   need:3,  t:'Beast Mode',      d:'A class 3 days in a row'});
  L.push({id:'back',    cat:'spc', k:'back',    need:1,  t:'Comeback',        d:'Back in class after a month away. Welcome back'});
  L.push({id:'dbl',     cat:'spc', k:'dbl',     need:5,  t:'Double Day',      d:'5 days with two classes, 3 hours apart'});
  L.push({id:'ib1',     cat:'spc', k:'ib',      need:1,  t:'First InBody',    d:'Your first InBody scan, in the app'});
  L.push({id:'ib3',     cat:'spc', k:'ib',      need:3,  t:'Tracking it',     d:'3 InBody scans: you can see the change'});
  L.push({id:'ny',      cat:'spc', k:'ny',      need:1,  t:'New Year',        d:'A class on New Year\'s Day. Start as you mean to go on'});
  L.push({id:'merdeka', cat:'spc', k:'merdeka', need:1,  t:'Merdeka',         d:'A class on 31 August, Hari Merdeka'});
  L.push({id:'ramadan', cat:'spc', k:'ramadan', need:8,  t:'Ramadan Warrior', d:'8 classes in the month of Ramadan'});
  L.push({id:'bday',    cat:'spc', k:'bday',    need:1,  t:'Birthday',        d:'A class on your birthday'});
  return L;
})();

/* ── the numbers, from what OS sends ── */
function kbStats(){
  var d=(typeof Kelas!=='undefined' && Kelas.data)||{}, P=d.points||{};
  var ins=(d.checkins||[]).map(function(t){ return new Date(Date.parse(t)+8*3600e3); });   /* Malaysian time */
  var K=(typeof HF!=='undefined' && HF.data && (HF.data.kelas||(HF.data.kelas={})))||{};
  /* weeks in a row, and a gap of 5 weeks or more (a comeback), from every week OS has */
  var w=(d.weeks||[]).map(function(x){ return Date.parse(String(x).slice(0,10)+'T00:00:00Z'); }).filter(function(x){ return x; }).sort(function(a,b){ return a-b; });
  var best=0, run=0, prev=null, back=0;
  w.forEach(function(t){ if(prev!==null && t-prev>=35*864e5) back=1; run=(prev!==null && t-prev===7*864e5)?run+1:1; if(run>best) best=run; prev=t; });
  /* per day, per month, per week (Monday) */
  var byDay={}, byMonth={}, byWeek={};
  ins.forEach(function(x){ var k=x.toISOString().slice(0,10); (byDay[k]=byDay[k]||[]).push(x.getTime()); });
  var days=Object.keys(byDay).sort();
  days.forEach(function(k){
    var m=k.slice(0,7); byMonth[m]=(byMonth[m]||0)+1;
    var t=Date.parse(k+'T00:00:00Z'), mon=new Date(t-((new Date(t).getUTCDay()+6)%7)*864e5).toISOString().slice(0,10);
    byWeek[mon]=(byWeek[mon]||0)+1;
  });
  var early=0, owl=0, wknd=0, dbl=0, wkx=0, beast=0, brun=0, ram={}, ny=0, mer=0, bd=0;
  ins.forEach(function(x){ var hm=x.getUTCHours()*60+x.getUTCMinutes();
    if(hm<8*60) early++; if(hm>=19*60+45) owl++;            /* a class at 8 pm: in by 7.45 */
    var g=x.getUTCDay(); if(g===0||g===6) wknd++; });
  days.forEach(function(k,i){
    var a=byDay[k].sort(); if(a.length>1 && a[a.length-1]-a[0]>=3*3600e3) dbl++;
    brun=(i && Date.parse(k+'T00:00:00Z')-Date.parse(days[i-1]+'T00:00:00Z')===864e5)?brun+1:1; if(brun>beast) beast=brun;
    if(i && Date.parse(k+'T00:00:00Z')-Date.parse(days[i-1]+'T00:00:00Z')>=31*864e5) back=1;
    var md=k.slice(5); if(md==='01-01') ny=1; if(md==='08-31') mer=1; if(K.bday && md===K.bday) bd=1;
    KB_RAMADAN.forEach(function(r){ if(k>=r[0] && k<=r[1]) ram[r[0]]=(ram[r[0]]||0)+1; });
  });
  Object.keys(byWeek).forEach(function(m){ if(byWeek[m]>wkx) wkx=byWeek[m]; });
  var ramBest=0; Object.keys(ram).forEach(function(r){ if(ram[r]>ramBest) ramBest=ram[r]; });
  /* months with 10+ class days: the ones seen now, and every one seen before */
  var pm=K.padu||(K.padu=[]);
  Object.keys(byMonth).forEach(function(m){ if(byMonth[m]>=10 && pm.indexOf(m)<0) pm.push(m); });
  var refs=(P.history||[]).filter(function(x){ return x.t==='referral'; }).length;
  return {cls:+d.total||0, pts:+P.lifetime||0, week:best, wkx:wkx, month:pm.length, pr:(d.prs||[]).length, frd:refs,
          early:early, owl:owl, wknd:wknd, beast:beast, back:back, dbl:dbl, ib:(d.inbody||[]).length,
          ny:ny, merdeka:mer, ramadan:ramBest, bday:bd};
}
function kbHave(b,S){ return (S[b.k]||0)>=(b.v||b.need); }
/* where the member is on the way to a badge: [now, needed] */
function kbProg(b,S){ var n=b.v||b.need; return [Math.min(S[b.k]||0, n), n]; }
function kbEarned(){ var K=HF.data.kelas||(HF.data.kelas={}); return K.badges||(K.badges={}); }

/* ── the badge: its picture, dim and grey until earned ── */
var KB_V=2, KB_IMG={};
function kbImgSrc(id){ return '/img/badges/'+id+'.jpg?v='+KB_V; }
function kbPic(b, on, size){
  return '<span class="kb-pic'+(on?' on':' off')+'" style="width:'+size+'px;height:'+size+'px"><img src="'+kbImgSrc(b.id)+'" alt="" decoding="async"'+(size<150?' loading="lazy"':'')+'></span>';
}
/* the picture for a canvas: loaded once, cb when ready (or failed) */
function kbImg(id, cb){
  var o=KB_IMG[id];
  if(o && o.done){ if(cb) cb(o.ok?o.im:null); return o.ok?o.im:null; }
  if(!o){ o=KB_IMG[id]={im:new Image(), cbs:[]};
    o.im.onload=function(){ o.done=o.ok=true; o.cbs.forEach(function(f){ f(o.im); }); o.cbs=[]; };
    o.im.onerror=function(){ o.done=true; o.cbs.forEach(function(f){ f(null); }); o.cbs=[]; };
    o.im.src=kbImgSrc(id); }
  if(cb) o.cbs.push(cb);
  return null;
}
/* the IG Story card: black, a red glow, the badge, its name, the member */
function kbDrawShare(x,W,H,cx,F,S){
  var b=KB_LIST.filter(function(z){ return z.id===S.id; })[0]; if(!b) return;
  x.fillStyle='#000000'; x.fillRect(0,0,W,H);
  var r=x.createRadialGradient(cx,H*.42,0,cx,H*.42,W*.8); r.addColorStop(0,'rgba(227,6,19,.38)'); r.addColorStop(1,'rgba(227,6,19,0)');
  x.fillStyle=r; x.fillRect(0,0,W,H);
  x.textAlign='center';
  x.fillStyle='#FFFFFF'; x.font=F(900,64); x.fillText('HITFAT+',cx,220);
  x.fillStyle='rgba(255,255,255,.75)'; x.font=F(800,30); if(typeof _spaced==='function') _spaced(x,'NEW BADGE UNLOCKED',cx,280,6); else x.fillText('NEW BADGE UNLOCKED',cx,280);
  /* the picture is on black: screen-blend it so its black meets the glow */
  var pic=kbImg(b.id), R=330;
  if(pic){ x.save(); x.globalCompositeOperation='screen'; x.drawImage(pic,cx-R,H*.42-R,2*R,2*R); x.restore(); }
  x.textAlign='center';
  x.fillStyle='#FFFFFF'; x.font=F(900,84); x.fillText(b.t,cx,H*.42+430);
  x.fillStyle='rgba(255,255,255,.7)'; x.font=F(600,38); x.fillText(b.d.length>44?b.d.slice(0,42)+'…':b.d,cx,H*.42+500);
  var first=String((typeof Kelas!=='undefined'&&Kelas.data&&Kelas.data.name)||'').trim().split(/\s+/)[0]||'';
  var E=kbEarned(), when=E[b.id]?kbDate(E[b.id]):'';
  x.fillStyle='#FFC20E'; x.font=F(900,52); if(first) x.fillText(first.toUpperCase(),cx,H-300);
  x.fillStyle='rgba(255,255,255,.7)'; x.font=F(700,34); x.fillText('HITFAT HQ'+(when?' · '+when:''),cx,H-245);
  x.fillStyle='rgba(255,255,255,.75)'; x.font=F(700,34); x.fillText('app.hitfat.io',cx,H-110);
}
function kbShare(id){
  var go=function(){ Kelas.share={kind:'badge', id:id}; if(typeof openShare==='function') openShare('kelas'); };
  kbImg(id, go);
}

/* ── the wall, on the class Progress tab: NTC's "Train and collect" ── */
function kbHTML(){
  if(typeof Kelas==='undefined' || !Kelas.data) return '';
  var S=kbStats(), E=kbEarned();
  var has=function(b){ return !!(E[b.id] || kbHave(b,S)); };
  var have=KB_LIST.filter(has);
  /* the latest five earned, fanned across the top */
  var last=have.slice().sort(function(a,c){ return String(E[c.id]||'').localeCompare(String(E[a.id]||'')) || (c.v||0)-(a.v||0); }).slice(0,5);
  var h='<div class="kb"><div class="kb-hero">'+
      (last.length?'<div class="kb-fan">'+last.map(function(b){ return kbPic(b,true,64); }).join('')+'</div>':'')+
      '<b>TRAIN &amp; COLLECT</b><small>'+have.length+' of '+KB_LIST.length+' badges earned</small></div>';
  KB_SECT.forEach(function(sc){
    var list=KB_LIST.filter(function(b){ return sc[1].indexOf(b.cat)>=0; }), n=list.filter(has).length;
    h+='<div class="kb-sec"><div class="kb-sec-h"><b>'+sc[0]+'</b><small>'+n+' / '+list.length+'</small></div><div class="kb-grid">'+
      list.map(function(b){
        var on=has(b), p=kbProg(b,S);
        return '<button class="kb-i'+(on?'':' off')+'" onclick="kbOpen(\''+b.id+'\')">'+kbPic(b,on,96)+'<b>'+hesc(b.t)+'</b>'+
          (on?'':'<small>'+(b.k==='bday'&&!(HF.data.kelas||{}).bday?'Set your birthday':p[0].toLocaleString('en-MY')+' / '+p[1].toLocaleString('en-MY'))+'</small>')+'</button>';
      }).join('')+'</div></div>';
  });
  return h+'</div>';
}
var KB_MON=['January','February','March','April','May','June','July','August','September','October','November','December'];
function kbOpen(id){
  var b=KB_LIST.filter(function(x){ return x.id===id; })[0]; if(!b) return;
  var S=kbStats(), E=kbEarned(), on=!!(E[b.id]||kbHave(b,S)), p=kbProg(b,S), K=HF.data.kelas||{};
  var foot;
  if(on) foot='<div class="kb-sh-on">Earned'+(E[b.id]?' on '+kbDate(E[b.id]):'')+' ✓</div><div><button class="kb-share" onclick="kbClose();kbShare(\''+b.id+'\')">'+glyph('share')+' Share to your story</button></div>';
  else if(b.k==='bday'){
    /* OS has no birthdays: the member gives the day and month, once */
    var bd=String(K.bday||'').split('-'), mo=+bd[0]||0, dy=+bd[1]||0, o1='', o2='', i;
    for(i=1;i<=31;i++) o1+='<option value="'+i+'"'+(i===dy?' selected':'')+'>'+i+'</option>';
    for(i=1;i<=12;i++) o2+='<option value="'+i+'"'+(i===mo?' selected':'')+'>'+KB_MON[i-1]+'</option>';
    foot='<div class="kb-bd"><small>'+(K.bday?'Your birthday':'When is your birthday?')+'</small><div><select id="kb-bd-d">'+o1+'</select><select id="kb-bd-m">'+o2+'</select></div>'+
      '<button class="kb-share" onclick="kbSetBday()">'+(K.bday?'Update':'Save')+'</button></div>';
  }
  else foot='<div class="kb-sh-p"><span class="kl-tb"><i style="width:'+Math.round(p[0]/p[1]*100)+'%"></i></span><small>'+p[0].toLocaleString('en-MY')+' of '+p[1].toLocaleString('en-MY')+'</small></div>';
  var h='<div class="pwtop"><span></span><button class="pwx" aria-label="Close" onclick="kbClose()">✕</button></div>'+
    '<div class="kb-sh"><div class="kb-spin">'+kbPic(b,on,240)+'</div><div class="kb-sh-k">'+KB_CATS[b.cat].n+'</div><div class="kb-sh-t">'+hesc(b.t)+'</div>'+
    '<div class="kb-sh-d">'+hesc(b.d)+'</div>'+foot+'</div>';
  $('pw-body').innerHTML=h; $('pwm').classList.add('on','kbm'); try{ $('pwm').scrollTop=0; }catch(e){}
}
function kbSetBday(){
  var d=+$('kb-bd-d').value, m=+$('kb-bd-m').value;
  if(!d || !m || d>[31,29,31,30,31,30,31,31,30,31,30,31][m-1]) return;
  var K=HF.data.kelas||(HF.data.kelas={});
  K.bday=(m<10?'0':'')+m+'-'+(d<10?'0':'')+d; HF.save();
  kbClose(); if(typeof renderKelas==='function') renderKelas();
  if(typeof toast==='function') toast('Birthday saved 🎂 Come to class that day!');
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
    var rank=['cls','week','month','wkx','pr','frd','pts','spc'];
    var top=fresh.slice().sort(function(a,c){ var r=rank.indexOf(a.cat)-rank.indexOf(c.cat); return r||((c.v||0)-(a.v||0)); })[0], more=fresh.length-1;
    var cols=['#E30613','#FFC20E','#FFFFFF','#FF8A3D'], conf='', i;
    for(i=0;i<24;i++) conf+='<i style="left:'+((i*37)%100)+'%;background:'+cols[i%4]+';-webkit-animation-delay:'+(i%8)*0.18+'s;animation-delay:'+(i%8)*0.18+'s"></i>';
    $('scc').className='scc scc-meet';
    $('scc').innerHTML='<div class="scc-conf">'+conf+'</div><div class="scc-in"><div class="kb-pop">'+kbPic(top,true,220)+'</div>'+
      '<div class="scc-t">'+(more?'New badges! 🏅':'New badge! 🏅')+'</div>'+
      '<div class="scc-s"><b>'+hesc(top.t)+'</b>'+(more?' and '+more+' more':'')+'</div>'+
      '<div class="scc-s scc-bellsays">'+(top.cat==='cls'?'Wah, '+top.v+' kelas! Bara bangga sangat dengan awak 🔥':'Lencana baru untuk awak! Bara tumpang gembira 🎉')+'</div>'+
      '<button class="bigbtn scc-share" onclick="scCelebrateClose();if(typeof openKelas===\'function\'){openKelas();kelasTab(\'progress\');}">See my badges</button>'+
      '<button class="scc-x" onclick="scCelebrateClose()">Later</button></div>';
    $('scc').style.display='flex';
    if(typeof hfSound==='function') try{ hfSound('cheer'); }catch(e){}
    return true;
  }catch(e){ return false; }
}
