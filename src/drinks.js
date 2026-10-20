/* ═══════════════ drinks (20 Oct 2026) ═══════════════
   After Simple's hydration tracker (Seth sent its recording: "ni plak"), made
   for Malaysia, where the drink is often the biggest sugar of the day. The
   one-tap glass of water on Home stays as it is; this sheet is for
   everything else: teh tarik, kopi, Milo, teh O, sirap, a can, a juice,
   milk, each regular, kurang manis or kosong, by the cup, glass, mug or
   bottle. Every drink counts toward water (a glass is 250 ml); one with
   calories is logged as food too, so Eat and the HITFAT Score see it, and
   the report says the sugar in teaspoons, which people understand.

   Numbers are per 250 ml, typical Malaysian kopitiam and mamak serving,
   estimates: [sweetness, kcal, sugar g, protein g, fat g].
   Stored: HF.data.daily[day].drinks = [{k, s, ml, kcal, sugar, at, mid}]
   (daily is kept whole by HF.apply). */

var DR_TYPES=[
  {k:'water', n:'Air kosong', e:'💧', s:[['plain',0,0,0,0]]},
  {k:'tehtarik', n:'Teh tarik', e:'🧋', s:[['regular',120,19,3,3],['less',85,11,3,3],['none',45,4,3,3]]},
  {k:'kopi', n:'Kopi', e:'☕', s:[['regular',110,17,2,3],['less',75,10,2,3],['none',5,0,0,0]]},
  {k:'milo', n:'Milo', e:'🥤', s:[['regular',150,22,4,4],['less',115,15,4,4],['none',90,9,4,3]]},
  {k:'teho', n:'Teh O / ais', e:'🍵', s:[['regular',75,18,0,0],['less',45,11,0,0],['none',2,0,0,0]]},
  {k:'sirap', n:'Sirap / Bandung', e:'🌸', s:[['regular',110,26,1,1],['less',70,17,1,1]]},
  {k:'tin', n:'Air tin / soda', e:'🥫', s:[['regular',105,26,0,0],['zero',1,0,0,0]]},
  {k:'jus', n:'Jus buah', e:'🧃', s:[['regular',125,28,1,0],['less',95,20,1,0]]},
  {k:'susu', n:'Susu', e:'🥛', s:[['full',160,12,8,9],['low fat',110,12,8,3]]}
];
var DR_SWEET={plain:'Plain', regular:'Regular', less:'Kurang manis', none:'Kosong', zero:'Zero sugar', full:'Full cream', 'low fat':'Low fat'};
var DR_SIZES=[['Cup',150],['Glass',250],['Mug / can',330],['Big glass',500],['Bottle',1000]];
var _dr={k:'water', s:0, ml:250, n:1};

function drDay(){ var all=HF.data.daily||(HF.data.daily={}), d=iso(0); return all[d]||(all[d]={water:0,steps:0}); }
function drToday(){ return drDay().drinks||[]; }
function drType(k){ for(var i=0;i<DR_TYPES.length;i++) if(DR_TYPES[i].k===k) return DR_TYPES[i]; return DR_TYPES[0]; }
/* what one choice comes to: per 250 ml, scaled to the size and servings */
function drCalc(k,si,ml,n){
  var t=drType(k), s=t.s[Math.min(si,t.s.length-1)], f=(ml*(n||1))/250;
  return {kcal:Math.round(s[1]*f), sugar:Math.round(s[2]*f), p:Math.round(s[3]*f), fat:Math.round(s[4]*f), ml:ml*(n||1), sweet:s[0]};
}
function drTsp(g){ return Math.round(g/4); }        // a teaspoon of sugar is about 4 g
function drName(k,si){ var t=drType(k), s=t.s[Math.min(si,t.s.length-1)][0]; return t.n+(t.s.length>1?' '+DR_SWEET[s].toLowerCase():''); }

/* the row on Eat → Today */
function drRowHTML(){
  var L=drToday(), ml=L.reduce(function(a,x){ return a+(x.ml||0); },0), sug=L.reduce(function(a,x){ return a+(x.sugar||0); },0);
  var sub=L.length ? (ml>=1000?(ml/1000).toFixed(1)+' L':ml+' ml')+' · '+(sug?'≈ '+drTsp(sug)+' tsp sugar':'no sugar') : 'Teh tarik, kopi, Milo, air tin… tap to log';
  return '<button class="dr-row" onclick="drOpen()"><span class="dr-ic">🧋</span><span class="dr-t"><b>Drinks</b><small>'+sub+'</small></span><i>+</i></button>';
}
/* ── the sheet ── */
function drOpen(k){ _dr={k:k||'tehtarik', s:0, ml:250, n:1}; drPaint(); $('pwm').classList.add('on'); try{ $('pwm').scrollTop=0; }catch(e){} }
function drSet(f,v){ _dr[f]=v; if(f==='k') _dr.s=0; drPaint(); }
function drPaint(){
  var t=drType(_dr.k), c=drCalc(_dr.k,_dr.s,_dr.ml,_dr.n);
  var h='<div class="pwtop"><span></span><button class="pwx" aria-label="Close" onclick="drClose()">✕</button></div>'+
    '<div class="dr"><div class="dr-h">Log a drink</div>'+
    '<button class="dr-quick" onclick="drClose();scWaterTap()">'+glyph('water')+'<span><b>+1 glass of water</b><small>250 ml, one tap</small></span></button>'+
    '<div class="dr-k">What did you drink?</div><div class="dr-types">'+DR_TYPES.map(function(x){
      return '<button class="'+(x.k===_dr.k?'on':'')+'" onclick="drSet(\'k\',\''+x.k+'\')"><span>'+x.e+'</span>'+hesc(x.n)+'</button>'; }).join('')+'</div>';
  if(t.s.length>1) h+='<div class="dr-k">How sweet?</div><div class="dr-chips">'+t.s.map(function(s,i){
      return '<button class="'+(i===_dr.s?'on':'')+'" onclick="drSet(\'s\','+i+')">'+DR_SWEET[s[0]]+'</button>'; }).join('')+'</div>';
  h+='<div class="dr-k">How much?</div><div class="dr-chips">'+DR_SIZES.map(function(z){
      return '<button class="'+(z[1]===_dr.ml?'on':'')+'" onclick="drSet(\'ml\','+z[1]+')">'+z[0]+'<small>'+z[1]+' ml</small></button>'; }).join('')+'</div>'+
    '<div class="dr-n"><span>Servings</span><button onclick="drSet(\'n\','+Math.max(1,_dr.n-1)+')" aria-label="Fewer">−</button><b>'+_dr.n+'</b><button onclick="drSet(\'n\','+Math.min(6,_dr.n+1)+')" aria-label="More">+</button></div>'+
    '<div class="dr-sum"><div><b>'+(c.ml>=1000?(c.ml/1000).toFixed(1)+' L':c.ml+' ml')+'</b><small>to your water</small></div>'+
      '<div><b>'+c.kcal+'</b><small>kcal</small></div>'+
      '<div class="'+(drTsp(c.sugar)>=4?'hi':'')+'"><b>'+(c.sugar?'≈ '+drTsp(c.sugar):'0')+'</b><small>tsp sugar</small></div></div>'+
    '<button class="bigbtn" onclick="drLog()">Log '+hesc(drName(_dr.k,_dr.s))+'</button>'+
    '<div class="nfoot" style="text-align:center">Typical kopitiam and mamak servings. An estimate.</div></div>';
  $('pw-body').innerHTML=h;
}
function drClose(){ if(typeof closeProduct==='function') closeProduct(); else $('pwm').classList.remove('on'); }
/* ── log it: water first, food if it has calories, then the report ── */
function drLog(){
  var before=typeof mrBefore==='function'?mrBefore():0;
  var c=drCalc(_dr.k,_dr.s,_dr.ml,_dr.n), day=drDay(), name=drName(_dr.k,_dr.s);
  var glasses=Math.max(c.ml>=150?1:0, Math.round(c.ml/250));
  if(typeof scSet==='function') scSet('water', scDaily().water+glasses); else { day.water=(day.water||0)+glasses; }
  var rec={k:_dr.k, s:_dr.s, ml:c.ml, kcal:c.kcal, sugar:c.sugar, g:glasses, at:new Date().toISOString()};
  if(c.kcal>=10 && typeof logMeal==='function'){
    rec.mid=logMeal({name:name+' · '+c.ml+' ml', bm:name, kcal:c.kcal, p:c.p, c:c.sugar, f:c.fat, src:'drink'});
  }
  day=drDay(); (day.drinks||(day.drinks=[])).push(rec); HF.save();
  drReport(rec, before);
}
function drLine(rec){
  var t=drType(rec.k), sw=t.s[Math.min(rec.s,t.s.length-1)][0], tsp=drTsp(rec.sugar), left=Math.max(0,SC_WATER-scDaily().water);
  if(rec.k==='water') return left?'Glug glug! Segarnya 💧 Lagi '+left+' gelas hari ni.':'Cukup air hari ni! Bara rasa segar sangat 💧';
  if(sw==='none'||sw==='zero') return 'Pandai pilih '+(sw==='zero'?'zero sugar':'kosong')+'! Bara bangga dengan awak 👍';
  if(sw==='less') return 'Kurang manis, langkah yang bagus! Masih ≈ '+tsp+' sudu gula. Lain kali cuba kosong? 😉';
  if(rec.k==='tin') return 'Air tin ni ≈ '+tsp+' sudu gula 😮 Air kosong lepas ni ya, Bara teman 💧';
  if(tsp>=4) return 'Sedap kan? Tapi ni ≈ '+tsp+' sudu gula. Esok cuba kurang manis ya 😉';
  return 'Dah log, Bara catat. Jangan lupa air kosong juga 💧';
}
function drReport(rec, before){
  var after=typeof mrBefore==='function'?mrBefore():0, w=scDaily().water, tsp=drTsp(rec.sugar), lv=typeof scLevel==='function'?scLevel(after):1;
  _mr={from:before, to:after, m:null, drink:rec};
  var pose=typeof bellPoster==='function'?bellPoster(lv):'/img/mascot/anim/aktif.png';
  var pct=Math.min(100,Math.round(w/SC_WATER*100));
  var h='<div class="mr'+(after>=50?' hot':'')+'"><div class="pwtop"><span></span><button class="pwx" aria-label="Close" onclick="mrDone()">✕</button></div>'+
    '<div class="mr-top"><div class="mr-arc">'+scArc(before)+'</div><img class="mr-bara" src="'+pose+'" alt="Bara">'+
    '<div class="mr-score"><b id="mr-n">'+before+'</b><small>HITFAT Score'+(after>before?' · +'+(after-before):'')+'</small></div>'+
    '<span class="mr-chip">'+(rec.ml>=1000?(rec.ml/1000).toFixed(1)+' L':rec.ml+' ml')+' · '+hesc(drName(rec.k,rec.s))+'</span></div>'+
    '<div class="mr-say"><b>Bara</b><span>'+hesc(drLine(rec))+'</span></div>'+
    '<div class="mr-h">Water today</div><div class="mr-rows"><div class="mr-row"><div class="mr-rh"><b>'+w+' of '+SC_WATER+' glasses</b><span class="mr-add">+'+rec.g+'</span>'+
      '<em class="mr-st '+(w>=SC_WATER?'ok':'room')+'">'+(w>=SC_WATER?'On target':'Room left')+'</em></div>'+
      '<div class="mr-bar"><i class="a '+(w>=SC_WATER?'ok':'')+'" style="left:0;width:0%" data-w="'+pct+'"></i></div>'+
      '<div class="mr-rf"><span>≈ '+(w*250).toLocaleString('en-MY')+' ml</span><span>Aim '+(SC_WATER*250).toLocaleString('en-MY')+' ml</span></div></div></div>';
  if(rec.sugar>0){
    var dayS=drToday().reduce(function(a,x){ return a+(x.sugar||0); },0);
    h+='<div class="mr-h">Sugar from drinks today</div><div class="dr-sug">'+
      '<div class="dr-tsp">'+new Array(Math.min(12,drTsp(dayS))+1).join('<i></i>')+'</div>'+
      '<div class="dr-sug-t"><b>≈ '+drTsp(dayS)+' teaspoons</b><small>'+(drTsp(dayS)>=8?'More than the 6–8 a day many health bodies suggest for all added sugar.':'Keep added sugar to about 6–8 teaspoons a day.')+'</small></div></div>';
  }
  h+='<div class="mr-h">What next</div><div class="mr-acts">'+
    (rec.k!=='water'?'<button onclick="mrDone();scWaterTap()">'+glyph('water')+'<span>+1 glass of plain water</span></button>':'')+
    '<button onclick="drUndo()">'+glyph('repeat')+'<span>Undo this drink</span></button></div>'+
    '<button class="bigbtn mr-done" onclick="mrDone()">Done</button></div>';
  if(typeof scBannerHide==='function') scBannerHide();
  $('pw-body').innerHTML=h; $('pwm').classList.add('on'); try{ $('pwm').scrollTop=0; }catch(e){}
  if(typeof mrAnimate==='function') mrAnimate();
}
function drUndo(){
  var rec=_mr&&_mr.drink, day=drDay(); if(!rec) return mrDone();
  day.drinks=(day.drinks||[]).filter(function(x){ return x!==rec && x.at!==rec.at; });
  day.water=Math.max(0,(day.water||0)-(rec.g||0));
  if(rec.mid){ var L=HF.data.meals[iso(0)]||[]; for(var i=L.length-1;i>=0;i--) if(L[i].id===rec.mid){ L.splice(i,1); break; } }
  HF.save(); toast('Drink undone'); _mr=null; mrClose();
}
