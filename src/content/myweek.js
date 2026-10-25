/* ═══ My Week (25 Oct 2026; after Everfit's Flexible Meal Guidance) ═══
   She chooses her own meals for the week from the recipe books, and the app
   shows, before she eats, whether each day still fits her target: every
   option says if it fits what is left of that day, and the week adds up.
   Breakfast comes from Sarapan 10 Minit, the snack from Snek Bawah 200 kcal,
   lunch and dinner from Bekal Pejabat and Makan Malam Keluarga.
   State: HF.data.myWeek = {w:{'<monday>':{'<day 0-6>':{<slot>:'<book>:<index>'}}},
   ate:{'<date>:<slot>':'<meal id>'}}; four weeks are kept. */
var MW_SLOTS=[
  {k:'sarapan', n:'Breakfast', log:'breakfast', share:.25, books:['sarapan']},
  {k:'bekal',   n:'Lunch',     log:'lunch',     share:.35, books:['bekal','keluarga']},
  {k:'snek',    n:'Snack',     log:'snack',     share:.10, books:['snek']},
  {k:'keluarga',n:'Dinner',    log:'dinner',    share:.30, books:['keluarga','bekal']}
];
var MW_DAYS=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
var mwDay=-1, mwPick=null, mwOff=0, mwSrc='', mwQ='', mwShop=false;  /* the day on screen; the slot whose options are open; this week (0) or next (1) */

function mwData(){ var d=HF.data.myWeek=HF.data.myWeek||{}; d.w=d.w||{}; d.ate=d.ate||{}; return d; }
function mwMon(off){ var d=new Date(weekStartISO()+'T00:00:00'); d.setDate(d.getDate()+7*(off||0)); return localISO(d); }
function mwWeek(off){ var w=mwData().w, k=mwMon(off); return w[k]||{}; }
function mwToday(){ return (new Date().getDay()+6)%7; }
function mwDate(di){ var d=new Date(mwMon(mwOff)+'T00:00:00'); d.setDate(d.getDate()+di); return d; }
function mwCal(){ var n=HF.data.nutrition||{}; return n.cal||1500; }
function mwRef(s){ if(!s) return null; var x=s.split(':'), r=rbRec(x[0],+x[1]); return r?{b:x[0],i:+x[1],r:r}:null; }
function mwGet(di,sk,off){ return mwRef((mwWeek(off==null?mwOff:off)[di]||{})[sk]); }
function mwDayTot(di,skip,off){ var t={k:0,p:0,c:0,f:0,n:0}; MW_SLOTS.forEach(function(s){ if(s.k===skip) return; var m=mwGet(di,s.k,off); if(m){ t.k+=m.r.k; t.p+=m.r.p; t.c+=m.r.c; t.f+=m.r.f; t.n++; } }); return t; }
/* what one slot may hold: the target, less the meals already chosen that day,
   less the usual share of the slots still empty */
function mwRoom(di,sk){ var cal=mwCal(), left=cal;
  MW_SLOTS.forEach(function(s){ if(s.k===sk) return; var m=mwGet(di,s.k); left-=m?m.r.k:Math.round(cal*s.share); });
  return left; }
function mwFits(di,sk,r){ return r.k<=mwRoom(di,sk)*1.1; }
function mwSave(){ var d=mwData(), keep=[mwMon(-3),mwMon(-2),mwMon(-1),mwMon(0),mwMon(1)];
  Object.keys(d.w).forEach(function(k){ if(keep.indexOf(k)<0) delete d.w[k]; });
  var since=mwMon(-1); Object.keys(d.ate).forEach(function(k){ if(k.slice(0,10)<since) delete d.ate[k]; });
  HF.save(); }
function mwSet(di,sk,bid,i){
  if(!rbOpen(i)){ openPaywall(''); return; }
  var d=mwData(), k=mwMon(mwOff); d.w[k]=d.w[k]||{}; d.w[k][di]=d.w[k][di]||{};
  d.w[k][di][sk]=bid+':'+i; mwPick=null; mwSave(); mwKeep();
}
function mwClear(di,sk){ var w=mwWeek(mwOff); if(w[di]) delete w[di][sk]; mwPick=null; mwSave(); mwKeep(); }
function mwOpenPick(sk){ mwPick=(mwPick===sk)?null:sk; mwSrc=''; mwQ=''; mwKeep(); }
/* where the options come from: the meal's own books, her saved recipes, or every book (after Everfit's Replace Meal) */
function mwSetSrc(v){ mwSrc=v; mwKeep(); }
/* the search hides the options that do not match, without redrawing, so the keyboard stays up */
function mwFind(q){ mwQ=String(q||''); var t=mwQ.toLowerCase().trim();
  Array.prototype.forEach.call(document.querySelectorAll('#mw-body .opt'),function(e){ e.style.display=(!t||(e.getAttribute('data-n')||'').indexOf(t)>=0)?'':'none'; }); }
function mwOptRefs(s){
  if(mwSrc==='fav') return (typeof rbFavs==='function'?rbFavs():[]).map(function(k){ var x=k.split(':'); return [x[0],+x[1]]; }).filter(function(x){ return rbRec(x[0],x[1]); });
  var bs=mwSrc==='all'?rbBooks().map(function(b){ return b.id; }):s.books, out=[];
  bs.forEach(function(bid){ rbFind(bid).recipes.forEach(function(r,i){ out.push([bid,i]); }); }); return out;
}
function mwSetDay(di){ mwDay=di; mwPick=null; mwKeep(); }
function mwSetWeek(off){ mwOff=off; mwDay=off?0:mwToday(); mwPick=null; mwArm=false; mwKeep(); }
/* a start: a featured plan's days go into the slots still empty */
function mwFill(pid){
  var p=rbFind(pid); if(!p||!p.days) return;
  var d=mwData(), k=mwMon(mwOff); d.w[k]=d.w[k]||{}; var n=0;
  for(var di=0;di<7;di++){ var day=p.days[di%p.days.length]; d.w[k][di]=d.w[k][di]||{};
    day.forEach(function(x){ if(!d.w[k][di][x[0]] && rbOpen(x[1])){ d.w[k][di][x[0]]=x[0]+':'+x[1]; n++; } }); }
  mwSave(); mwKeep(); toast(n?n+' meals added from '+p.t:'Your week is already full');
}
function mwCopyLast(){ var last=mwWeek(mwOff-1); if(!Object.keys(last).length) return;
  var d=mwData(); d.w[mwMon(mwOff)]=JSON.parse(JSON.stringify(last)); mwSave(); mwKeep(); toast('Last week copied'); }
/* clearing a week takes a second tap */
var mwArm=false;
function mwClearWeek(){ if(!mwArm){ mwArm=true; mwKeep(); return; } mwArm=false; delete mwData().w[mwMon(mwOff)]; mwSave(); mwKeep(); }
/* today's meal, eaten: into the diary under its slot, and out again */
function mwAteKey(sk){ return iso(0)+':'+sk; }
function mwEat(sk){
  var d=mwData(), k=mwAteKey(sk), m=mwGet(mwToday(),sk,0); if(!m) return;
  if(d.ate[k]){ var list=HF.data.meals[iso(0)]||[], j=list.map(function(x){ return x.id; }).indexOf(d.ate[k]);
    if(j>=0) list.splice(j,1); delete d.ate[k]; mwSave(); mwKeep(); toast('Removed from your log'); return; }
  var id=Date.now().toString(36)+Math.random().toString(36).slice(2,6), s=MW_SLOTS.filter(function(x){ return x.k===sk; })[0];
  logMeal({id:id, name:m.r.n, bm:m.r.n, kcal:m.r.k, p:m.r.p, c:m.r.c, f:m.r.f, slot:s.log, src:'recipe', img:m.r.img});
  d.ate[k]=id; mwSave(); mwKeep(); toast('Logged: '+m.r.n);
}
function openMyWeek(){ mwShop=false; mwOff=0; mwDay=mwToday(); mwPick=null; mwArm=false; hidePanels(); $('myweek').style.display='block'; renderMyWeek(); $('screen').scrollTop=0; }
function mwKeep(){ var y=$('screen').scrollTop; renderMyWeek(); $('screen').scrollTop=y; }
function mwBack(){ if(mwShop){ mwShop=false; renderMyWeek(); $('screen').scrollTop=0; return; } eatSeg='plan'; switchTab('eat'); }

/* ── the card on Eat → Plan ── */
function mwCard(){
  var cal=mwCal(), n=0, bars='';
  for(var di=0;di<7;di++){ var t=mwDayTot(di,null,0); n+=t.n;
    bars+='<span class="'+(di===mwToday()?'now':'')+'"><span class="c"><i style="height:'+Math.min(100,Math.round(t.k/cal*100))+'%" class="'+mwState(t,cal)+'"></i></span><em>'+MW_DAYS[di].charAt(0)+'</em></span>'; }
  return '<div class="fsec"><div class="ft">My Week</div><div class="fs">Choose your own meals; the app shows what fits.</div></div>'+
    '<button class="mw-card" onclick="openMyWeek()"><span class="bars">'+bars+'</span><span class="tx"><b>'+(n?n+' of 28 meals chosen':'Plan your week')+'</b>'+
    '<em>'+(n?'Tap to see each day against '+cal.toLocaleString('en-MY')+' kcal':'Pick from the recipe books, day by day')+'</em></span><span class="go">›</span></button>';
}
/* a day: on target when all four are chosen and it lands within 10% */
function mwState(t,cal){ if(!t.n) return 'none'; if(t.k>cal*1.1) return 'over'; if(t.n===4&&t.k>=cal*0.9) return 'on'; return 'part'; }

/* ── the shopping list, in the app (after Everfit's Shopping List): the week's
   recipes once each, ×2 when chosen twice, every ingredient ticked off as it is
   bought; kept a week (HF.data.myWeek.shop[monday]), and sent to WhatsApp ── */
function mwShopRefs(){ var refs=[]; for(var di=0;di<7;di++) MW_SLOTS.forEach(function(s){ var m=mwGet(di,s.k); if(m) refs.push([m.b,m.i]); }); return refs; }
function mwShopTicks(){ var d=mwData(); d.shop=d.shop||{}; var k=mwMon(mwOff); return d.shop[k]=d.shop[k]||{}; }
function mwShopList(){
  var cnt={}, order=[], tk=mwShopTicks(), items=[];
  mwShopRefs().forEach(function(x){ var k=x[0]+':'+x[1]; if(!cnt[k]){ cnt[k]=0; order.push(x); } cnt[k]++; });
  var recipes=order.map(function(x){ var b=rbFind(x[0]), r=b.recipes[x[1]], k=x[0]+':'+x[1];
    var its=r.bahan.map(function(t,j){ var ik=k+':'+j, it={k:ik, t:t, on:!!tk[ik]}; items.push(it); return it; });
    return {b:b, r:r, n:cnt[k], items:its}; });
  return {recipes:recipes, items:items};
}
function mwOpenShop(){ mwShop=true; renderMyWeek(); $('screen').scrollTop=0; }
function mwTick(ik){ var tk=mwShopTicks(); if(tk[ik]) delete tk[ik]; else tk[ik]=1; mwSave(); mwKeep(); }
function mwShopClear(){ var d=mwData(); if(d.shop) delete d.shop[mwMon(mwOff)]; mwSave(); mwKeep(); }
function renderMwShop(){
  var sl=mwShopList(), tk=sl.items.filter(function(x){ return x.on; }).length;
  var h='<button class="back" onclick="mwBack()"><span class="bk-c" aria-hidden="true"></span>My Week</button>'+
    '<div class="rb-title">Shopping list</div><div class="rb-subt">'+mwDate(0).toLocaleDateString('en-MY',{day:'numeric',month:'short'})+' – '+
      mwDate(6).toLocaleDateString('en-MY',{day:'numeric',month:'short'})+' · '+sl.recipes.length+' recipes</div>'+
    '<div class="mw-shopsum"><b>'+tk+'<i> / '+sl.items.length+'</i></b><span>ticked</span><div class="t"><i style="width:'+Math.round(tk/(sl.items.length||1)*100)+'%"></i></div></div>'+
    rbWaBtn(mwShopRefs(),'My Week '+mwDate(0).toLocaleDateString('en-MY',{day:'numeric',month:'short'}),'Send the list to WhatsApp');
  sl.recipes.forEach(function(x){
    h+='<div class="rb-sec">'+hesc(x.r.n)+(x.n>1?' ×'+x.n:'')+(rbSrv(x.b,x.r)>1?' · for '+rbSrv(x.b,x.r):'')+'</div><div class="rb-ings">'+
      x.items.map(function(it){ return '<button class="rb-ing'+(it.on?' on':'')+'" onclick="mwTick(\''+it.k+'\')"><span class="b">'+(it.on?glyph('check'):'')+'</span><span>'+hesc(it.t)+'</span></button>'; }).join('')+'</div>';
  });
  if(tk) h+='<button class="authalt" onclick="mwShopClear()">Untick everything</button>';
  return h;
}

/* ── the screen ── */
function renderMyWeek(){
  var el=$('mw-body'); if(!el) return;
  if(mwShop){ el.innerHTML=renderMwShop(); return; }
  if(mwDay<0) mwDay=mwToday();
  var cal=mwCal(), wk={k:0,p:0,n:0,days:0}, h='';
  for(var i=0;i<7;i++){ var t=mwDayTot(i); wk.k+=t.k; wk.p+=t.p; wk.n+=t.n; if(t.n) wk.days++; }
  var left=cal*7-wk.k;
  h+='<button class="back" onclick="mwBack()"><span class="bk-c" aria-hidden="true"></span>Eat</button>'+
    '<div class="rb-title">My Week</div><div class="rb-subt">'+mwDate(0).toLocaleDateString('en-MY',{day:'numeric',month:'short'})+' – '+
      mwDate(6).toLocaleDateString('en-MY',{day:'numeric',month:'short'})+' · your target '+cal.toLocaleString('en-MY')+' kcal a day</div>'+
    '<div class="mw-wk"><button class="'+(mwOff?'':'on')+'" onclick="mwSetWeek(0)">This week</button><button class="'+(mwOff?'on':'')+'" onclick="mwSetWeek(1)">Next week</button></div>';
  /* the week, like Everfit's weekly averages */
  h+='<div class="mw-sum"><div class="g"><div><b>'+wk.n+'<i>/28</i></b><span>meals chosen</span></div>'+
    '<div><b>'+(wk.days?Math.round(wk.k/wk.days).toLocaleString('en-MY'):'–')+'</b><span>kcal a day</span></div>'+
    '<div><b>'+(wk.days?Math.round(wk.p/wk.days):'–')+'<i>g</i></b><span>protein a day</span></div></div>'+
    '<div class="days">'+MW_DAYS.map(function(d,i){ var t=mwDayTot(i), st=mwState(t,cal);
      return '<button class="'+(i===mwDay?'on ':'')+(!mwOff&&i===mwToday()?'now':'')+'" onclick="mwSetDay('+i+')"><span class="c"><i class="'+st+'" style="height:'+Math.min(100,Math.round(t.k/cal*100))+'%"></i></span>'+
        '<b>'+d+'</b><small>'+mwDate(i).getDate()+'</small></button>'; }).join('')+'</div>'+
    '<div class="s">'+(wk.n?(left>=0?'Still to plan'+(mwOff?' next':' this')+' week: <b>'+left.toLocaleString('en-MY')+' kcal</b>':'<b>'+(-left).toLocaleString('en-MY')+' kcal</b> over'+(mwOff?' next':' this')+' week'):'Choose a meal for each slot, or start from a plan below.')+'</div></div>';
  if(wk.n<28) h+='<div class="mw-starts">'+RB_PLANS.slice(0,1).map(function(p){ return '<button onclick="mwFill(\''+p.id+'\')">'+glyph('star')+'Start from '+hesc(p.t)+'</button>'; }).join('')+
    (Object.keys(mwWeek(mwOff-1)).length?'<button onclick="mwCopyLast()">'+glyph('repeat')+(mwOff?'Same as this week':'Same as last week')+'</button>':'')+'</div>';
  if(wk.n){ var sl=mwShopList(), tk=sl.items.filter(function(x){ return x.on; }).length;
    h+='<button class="mw-shopbtn" onclick="mwOpenShop()">'+glyph('bag')+'<span><b>Shopping list</b><small>'+tk+' of '+sl.items.length+' ticked · '+sl.recipes.length+' recipes</small></span><span class="go">›</span></button>'; }
  /* the day */
  var t=mwDayTot(mwDay), st=mwState(t,cal), isToday=!mwOff&&mwDay===mwToday();
  /* the day's nutrition, as Everfit's Daily Nutrition Total: the kcal as a ring, protein, carbs and fat against her targets */
  var nu=HF.data.nutrition||{}, tg={p:nu.pt||Math.round(cal*.2/4), c:nu.ct||Math.round(cal*.5/4), f:nu.ft||Math.round(cal*.3/9)};
  var mb=function(l,v,g,col){ return '<div class="mb"><div class="h"><span>'+l+'</span><b>'+v+'<i> / '+g+' g</i></b></div><div class="t"><i style="width:'+Math.min(100,Math.round(v/(g||1)*100))+'%;background:'+col+'"></i></div></div>'; };
  h+='<div class="mw-dayhd"><div><b>'+mwDate(mwDay).toLocaleDateString('en-MY',{weekday:'long'})+(isToday?' · Today':'')+'</b></div>'+
    '<em class="'+st+'">'+({none:'Empty',part:(cal-t.k>=0?(cal-t.k).toLocaleString('en-MY')+' left':'Over'),on:'On target',over:'Over by '+(t.k-cal).toLocaleString('en-MY')})[st]+'</em></div>'+
    '<div class="mw-daycard">'+nRing(Math.round(t.k/cal*100),t.k.toLocaleString('en-MY'),'/ '+cal.toLocaleString('en-MY')+' kcal',108)+
      '<div class="mbs">'+mb('Protein',t.p,tg.p,'#E30613')+mb('Carbs',t.c,tg.c,'#FFC20E')+mb('Fat',t.f,tg.f,'#A1A1AA')+'</div></div>';
  h+='<div class="mw-slots">'+MW_SLOTS.map(function(s){
    var m=mwGet(mwDay,s.k), room=mwRoom(mwDay,s.k), out='<div class="mw-slot'+(mwPick===s.k?' open':'')+'">';
    if(m){
      var ate=isToday&&!!mwData().ate[mwAteKey(s.k)];
      out+='<div class="row"><span class="ph" style="background-image:url(\''+m.r.img+'\')" onclick="openRecipeIn(\''+m.b+'\','+m.i+')"></span>'+
        '<span class="tx" onclick="openRecipeIn(\''+m.b+'\','+m.i+')"><small>'+s.n+'</small><b>'+hesc(m.r.n)+'</b><span>'+m.r.k+' kcal · '+m.r.p+' g protein</span></span>'+
        '<button class="chg" onclick="mwOpenPick(\''+s.k+'\')">'+(mwPick===s.k?'Close':'Change')+'</button>'+
        (isToday?'<button class="ate'+(ate?' on':'')+'" aria-label="I ate this" onclick="mwEat(\''+s.k+'\')">'+glyph(ate?'check':'plus')+'</button>':'')+'</div>';
    } else {
      out+='<button class="empty" onclick="mwOpenPick(\''+s.k+'\')"><span class="pl">'+glyph('plus')+'</span><span class="tx"><small>'+s.n+'</small>'+
        '<b>Choose '+s.n.toLowerCase()+'</b><span>Room for about '+Math.max(0,Math.round(room/10)*10).toLocaleString('en-MY')+' kcal</span></span></button>';
    }
    if(mwPick===s.k){
      var refs=mwOptRefs(s);
      out+='<div class="mw-src">'+[['','For '+s.n.toLowerCase()],['fav','♥ Saved'],['all','All recipes']].map(function(x){
          return '<button class="'+(mwSrc===x[0]?'on':'')+'" onclick="mwSetSrc(\''+x[0]+'\')">'+x[1]+'</button>'; }).join('')+'</div>'+
        '<div class="mw-q">'+glyph('compass')+'<input class="inp" placeholder="Search recipes" value="'+hesc(mwQ)+'" oninput="mwFind(this.value)"></div>';
      if(!refs.length) out+='<div class="mw-none">'+(mwSrc==='fav'?'Nothing saved yet. Tap ♥ on a recipe to keep it here.':'No recipes.')+'</div>';
      out+='<div class="opts">';
      refs.forEach(function(x){ var bid=x[0], i=x[1], r=rbRec(bid,i); (function(){
        var on=!!m&&m.b===bid&&m.i===i, fit=mwFits(mwDay,s.k,r), open=rbOpen(i);
        out+='<button class="opt'+(on?' on':'')+(fit?'':' dim')+'" data-n="'+hesc(r.n.toLowerCase())+'"'+(mwQ&&r.n.toLowerCase().indexOf(mwQ.toLowerCase().trim())<0?' style="display:none"':'')+' onclick="mwSet('+mwDay+',\''+s.k+'\',\''+bid+'\','+i+')">'+
          '<span class="ph" style="background-image:url(\''+r.img+'\')">'+(on?'<span class="ck">'+glyph('check')+'</span>':'')+(open?'':'<span class="lk">'+glyph('lock')+'</span>')+'</span>'+
          '<b>'+hesc(r.n)+'</b><span class="m">'+r.k+' kcal · P '+r.p+' g</span>'+
          '<span class="ft '+(fit?'y':'n')+'">'+(fit?'Fits':'Over by '+Math.round(r.k-mwRoom(mwDay,s.k)))+'</span></button>'; })(); });
      out+='</div>'+(m?'<button class="mw-rm" onclick="mwClear('+mwDay+',\''+s.k+'\')">Remove '+s.n.toLowerCase()+'</button>':'');
    }
    return out+'</div>'; }).join('')+'</div>';
  if(!isToday) h+='<div class="nfoot" style="text-align:center;">On the day itself, + puts each meal into your diary.</div>';
  if(wk.n) h+='<button class="authalt" onclick="mwClearWeek()">'+(mwArm?'Tap again to clear all '+wk.n+' meals':(mwOff?'Clear next week':'Clear this week'))+'</button>';
  h+=rbLockCard();
  el.innerHTML=h;
}
