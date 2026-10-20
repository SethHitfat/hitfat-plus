/* ═══════════════ the meal report (20 Oct 2026) ═══════════════
   After Simple's meal flow (Seth: "try cek apa blh tiru dan upgrade"): a
   meal that is logged gets its own moment instead of a toast that vanishes.
   Bara takes the meal in, the HITFAT Score climbs to its new number, Bara
   says one thing about this plate (in Malay, as Bara and awak), and today's
   calories, protein, carbs and fat show against the member's own target with
   what this meal added. Then one useful next step: a glass of water, a short
   walk, or undo. Ideas only; the words, the art and the layout are HITFAT's.

   Called from the three places a member logs by hand: a scan (logScanned),
   the manual sheet (saveManual) and a quick pick (logFav). mrBefore() is
   read before the meal is saved, so the score can move from where it was. */

var _mr=null;
function mrBefore(){ try{ return typeof scScore==='function' ? scScore() : 0; }catch(e){ return 0; } }

/* what Bara says about this plate: the most useful one thing */
function mrLine(m, over){
  var kcal=+m.kcal||0, p=+m.p||0, c=+m.c||0, f=+m.f||0;
  if(typeof scJunk==='function' && scJunk(m)) return scJunkLine(m.name);
  if(over) return 'Hari ni dah lebih sikit dari sasaran. Tak apa, jalan kaki sekejap dan esok kita sambung 🤍';
  if(p>=25) return 'Protein padu! Awak akan kenyang lebih lama, Bara suka 💪';
  if(kcal && c*4>kcal*0.6) return 'Karbo agak tinggi. Jalan 10 minit lepas makan, Bara teman 🚶';
  if(kcal && f*9>kcal*0.45) return 'Berminyak sikit. Waktu makan seterusnya, tambah sayur ya 🥗';
  if(kcal && kcal<250) return 'Snek ringan, pandai awak pilih 👍';
  return 'Dah log, Bara bangga! Jujur macam ni yang buat badan berubah ✨';
}
/* one bar: today's total against the target, this meal's part marked.
   kind 'max' (calories, carbs, fat: up to the target) or 'min' (protein: at least) */
function mrStatus(total, target, kind){
  if(!target) return null;
  var r=total/target;
  if(kind==='min') return r>=0.85 ? ['ok','On target'] : ['low','Need more'];
  return r>1.05 ? ['over','Over'] : r>=0.85 ? ['ok','On target'] : ['room','Room left'];
}
function mrRow(label, unit, added, total, target, kind){
  var st=mrStatus(total, target, kind), cap=target?Math.max(target, total)*1.0:Math.max(total,1);
  var before=Math.max(0,total-added), pb=Math.min(100,before/cap*100), pa=Math.min(100-pb,added/cap*100);
  var mark=target?Math.min(100,target/cap*100):null;
  return '<div class="mr-row"><div class="mr-rh"><b>'+label+'</b><span class="mr-add">+'+Math.round(added).toLocaleString('en-MY')+unit+'</span>'+
    (st?'<em class="mr-st '+st[0]+'">'+st[1]+'</em>':'')+'</div>'+
    '<div class="mr-bar"><i class="b" style="width:'+pb.toFixed(1)+'%"></i><i class="a '+(st?st[0]:'')+'" style="left:'+pb.toFixed(1)+'%;width:0%" data-w="'+pa.toFixed(1)+'"></i>'+
    (mark!==null&&mark<100?'<s style="left:'+mark.toFixed(1)+'%"></s>':'')+'</div>'+
    '<div class="mr-rf"><span>Today '+Math.round(total).toLocaleString('en-MY')+unit+'</span>'+
    (target?'<span>'+(kind==='min'?'Aim':'Target')+' '+Math.round(target).toLocaleString('en-MY')+unit+'</span>':'')+'</div></div>';
}
function mrOpen(m, before){
  if(!m || !$('pwm') || !$('pw-body')) return;
  var after=mrBefore(), n=HF.data.nutrition||{}, t=typeof mealTotals==='function'?mealTotals(iso(0)):{kcal:0,p:0,c:0,f:0};
  var burned=typeof burnTotal==='function'?burnTotal():0, left=n.cal?Math.round(n.cal+burned-t.kcal):null, over=left!==null&&left<-Math.max(50,n.cal*0.05);
  var lv=typeof scLevel==='function'?scLevel(after):1, up=typeof scLevel==='function' && scLevel(after)>scLevel(before);
  _mr={from:before, to:after, m:m};
  var pose=typeof bellPoster==='function'?bellPoster(lv):'/img/mascot/anim/aktif.png';
  var chip=left===null?'Set your daily target to see what is left':
    over?Math.abs(left).toLocaleString('en-MY')+' kcal over today':left.toLocaleString('en-MY')+' kcal left today';
  var h='<div class="mr'+(after>=50?' hot':'')+'">'+
    '<div class="pwtop"><span></span><button class="pwx" aria-label="Close" onclick="mrDone()">✕</button></div>'+
    '<div class="mr-top">'+(up?'<div class="mr-conf" aria-hidden="true">'+mrConfetti()+'</div>':'')+
      '<div class="mr-arc">'+scArc(before)+'</div>'+
      '<img class="mr-bara" src="'+pose+'" alt="Bara">'+
      '<div class="mr-score"><b id="mr-n">'+before+'</b><small>HITFAT Score'+(after>before?' · +'+(after-before):'')+'</small></div>'+
      '<span class="mr-chip'+(over?' over':'')+'">'+chip+'</span></div>'+
    '<div class="mr-say"><b>Bara</b><span>'+hesc(mrLine(m, over))+'</span></div>'+
    '<div class="mr-meal"><div class="mr-mn">'+hesc(m.name||'Meal')+'</div><div class="mr-mk">'+(+m.kcal||0).toLocaleString('en-MY')+' kcal'+
      ' · P '+(+m.p||0)+' g · C '+(+m.c||0)+' g · F '+(+m.f||0)+' g</div></div>';
  if(n.cal){
    h+='<div class="mr-h">Today against your target</div><div class="mr-rows">'+
      mrRow('Calories',' kcal',+m.kcal||0,t.kcal,n.cal+burned,'max')+
      mrRow('Protein',' g',+m.p||0,t.p,n.pt,'min')+
      mrRow('Carbs',' g',+m.c||0,t.c,n.ct,'max')+
      mrRow('Fat',' g',+m.f||0,t.f,n.ft,'max')+'</div>';
  } else {
    h+='<button class="mr-set" onclick="mrDone();switchTab(\'eat\')">'+glyph('target')+'<span><b>Set your daily target</b><small>Weight, height and goal: then every meal shows what is left</small></span><i>›</i></button>';
  }
  /* the next step */
  h+='<div class="mr-h">What next</div><div class="mr-acts">'+
    '<button onclick="mrWater()">'+glyph('water')+'<span>+1 glass of water</span></button>'+
    ((+m.kcal||0)>=300?'<button onclick="mrWalk()">'+glyph('steps')+'<span>A 10-min walk after</span></button>':'')+
    '<button onclick="mrUndo()">'+glyph('repeat')+'<span>Undo this log</span></button></div>'+
    '<button class="bigbtn mr-done" onclick="mrDone()">Done</button></div>';
  if(typeof scBannerHide==='function') scBannerHide();   // the report says it; no banner behind it
  $('pw-body').innerHTML=h;
  $('pwm').classList.add('on'); try{ $('pwm').scrollTop=0; }catch(e){}
  if(typeof hfSound==='function') try{ hfSound(up?'cheer':'giggle'); }catch(e){}
  mrAnimate();
}
function mrConfetti(){
  var cols=['#E30613','#FFC20E','#FFFFFF','#FF8A3D'], s='';
  for(var i=0;i<18;i++) s+='<i style="left:'+((i*37)%100)+'%;background:'+cols[i%4]+';animation-delay:'+((i%6)*0.06).toFixed(2)+'s;transform:rotate('+(i*29)+'deg)"></i>';
  return s;
}
/* the score climbs, the arc follows, the bars fill */
function mrAnimate(){
  if(!_mr) return;
  var from=_mr.from, to=_mr.to, t0=Date.now(), dur=900;
  setTimeout(function(){
    var p=document.querySelector('.mr-arc .sc-arc-v'); if(p) p.setAttribute('stroke-dasharray', to+' 100');
    if(!p && to>0){ var a=document.querySelector('.mr-arc'); if(a) a.innerHTML=scArc(to); }
    document.querySelectorAll('.mr-bar .a').forEach(function(b){ b.style.width=b.getAttribute('data-w')+'%'; });
  },120);
  (function tick(){
    var el=$('mr-n'); if(!el || !_mr) return;
    var k=Math.min(1,(Date.now()-t0)/dur), v=Math.round(from+(to-from)*(1-Math.pow(1-k,3)));
    el.textContent=v; if(k<1) setTimeout(tick,30);
  })();
}
function mrWater(){
  if(typeof scSet==='function'){ scSet('water',scDaily().water+1); }
  toast('+1 glass of water 💧'); mrRefresh();
}
function mrWalk(){
  if(typeof addBurn==='function'){ toast('Enjoy the walk. Log it from Eat → Exercise when you are back 👟'); }
  else toast('Enjoy the walk 👟');
}
function mrUndo(){
  var d=iso(0), L=HF.data.meals[d]||[], m=_mr&&_mr.m;
  for(var i=L.length-1;i>=0;i--){ if(m && L[i].id===m.id){ L.splice(i,1); break; } }
  HF.save(); toast('Log undone'); _mr=null; mrClose();
}
function mrRefresh(){ var m=_mr&&_mr.m; if(m) mrOpen(m,_mr.to); }
function mrClose(){
  if(typeof closeProduct==='function') closeProduct(); else $('pwm').classList.remove('on');
  if($('eat') && $('eat').style.display!=='none' && typeof renderEat==='function') renderEat();
  if(typeof scRender==='function') try{ scRender(); }catch(e){}
}
function mrDone(){ _mr=null; mrClose(); }
