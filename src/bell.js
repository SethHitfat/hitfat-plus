/* ═══════════════ BELL, ALIVE ═══════════════
   Bell breathes, blinks and looks about, the way Simple's Blinky does: short
   clips made from Seth's artwork (Kling, start frame = end frame, so each
   loops without a seam), one for each stage, and two reactions — a giggle
   when Bell is touched, a cheer when something is logged.

   The clips are "stacked alpha": an ordinary H.264 file, colour in the top
   half and Bell's mask in the bottom half. Each frame is drawn to a canvas
   with the mask as its alpha, so Bell stands on any card, dark or light, on
   any phone. Every clip has a poster (its first frame, transparent PNG)
   that shows until the clip plays, and stays when it cannot: Low Power
   Mode, reduced motion, a browser without canvas.

   One player for the page. The HITFAT Score re-draws its card often; the
   player is moved into the new card, not rebuilt, so the clip never
   restarts. ES5. */

var BELL_DIR='/img/mascot/anim/';
var BELL_LOOPS={1:'comel',2:'aktif',3:'tegap',4:'juara'};
var _bell={node:null, v:null, cv:null, g:null, buf:null, bg:null, loop:'', react:'', raf:0, live:false};

function bellPoster(lv){ return BELL_DIR+BELL_LOOPS[lv]+'.png'; }
/* the slot shows the poster until the clip draws, then the clip only */
function bellMark(on){
  var p=_bell.node && _bell.node.parentNode; if(!p || !p.className) return;
  p.className=p.className.replace(/ ?is-live/g,'')+(on?' is-live':'');
}
function bellCanAnimate(){
  try{
    if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
    var c=document.createElement('canvas');
    return !!(c && c.getContext && c.getContext('2d') && document.createElement('video').play);
  }catch(e){ return false; }
}
function bellBuild(){
  var n=document.createElement('div'); n.className='bell-live';
  var cv=document.createElement('canvas'); cv.width=360; cv.height=360; cv.className='bell-cv';
  var v=document.createElement('video');
  v.muted=true; v.defaultMuted=true; v.playsInline=true; v.preload='auto';
  v.setAttribute('muted',''); v.setAttribute('playsinline',''); v.setAttribute('webkit-playsinline','');
  v.className='bell-v';
  n.appendChild(cv); n.appendChild(v);
  var buf=document.createElement('canvas'); buf.width=360; buf.height=720;
  _bell.node=n; _bell.v=v; _bell.cv=cv; _bell.g=cv.getContext('2d'); _bell.buf=buf; _bell.bg=buf.getContext('2d');
  v.addEventListener('ended',function(){ if(_bell.react){ _bell.react=''; bellSrc(_bell.loop,true); } });
  v.addEventListener('playing',function(){ bellTick(); });
  document.addEventListener('visibilitychange',function(){ if(document.hidden) v.pause(); else bellResume(); });
  return n;
}
function bellSrc(name,loop){
  var v=_bell.v, src=BELL_DIR+name+'.mp4';
  if(v.getAttribute('src')!==src){ v.setAttribute('src',src); try{ v.load(); }catch(e){} }
  v.loop=!!loop;
  try{ v.currentTime=0; }catch(e){}
  bellResume();
}
function bellResume(){
  var v=_bell.v; if(!v || document.hidden) return;
  var p=v.play();
  if(p && p.catch) p.catch(function(){ _bell.live=false; if(_bell.node) _bell.node.className='bell-live'; bellMark(false); });
}
/* one frame: the top half's colour, the bottom half's grey as alpha */
function bellDraw(){
  var v=_bell.v; if(!v || v.readyState<2) return;
  try{
    _bell.bg.drawImage(v,0,0,360,720);
    var top=_bell.bg.getImageData(0,0,360,360), bot=_bell.bg.getImageData(0,360,360,360), t=top.data, b=bot.data, i;
    for(i=0;i<t.length;i+=4) t[i+3]=b[i];
    _bell.g.putImageData(top,0,0);
    if(!_bell.live){ _bell.live=true; _bell.node.className='bell-live on'; bellMark(true); }
  }catch(e){}
}
function bellTick(){
  if(_bell.raf) return;
  var step=function(){
    _bell.raf=0;
    var v=_bell.v;
    if(!v || v.paused || v.ended) return;
    /* off the page (another tab, Home hidden): stop drawing, pause */
    if(!_bell.node || !_bell.node.parentNode || _bell.node.offsetParent===null){ v.pause(); return; }
    bellDraw();
    _bell.raf=(window.requestAnimationFrame||function(f){ return setTimeout(f,40); })(step);
  };
  step();
}

/* put Bell, alive, into a slot (the score card's), at a stage */
function bellAttach(slot,lv){
  if(!slot || !bellCanAnimate()) return false;
  if(!_bell.node) bellBuild();
  slot.appendChild(_bell.node);
  var want=BELL_LOOPS[lv]||'aktif';
  if(_bell.loop!==want){ _bell.loop=want; if(!_bell.react){ _bell.live=false; _bell.node.className='bell-live'; bellSrc(want,true); } }
  else { if(_bell.live) bellMark(true); bellResume(); }
  return true;
}
/* a reaction, then back to the loop */
function bellReact(name){
  if(!_bell.v || !_bell.node || !_bell.node.parentNode) return;
  _bell.react=name; bellSrc(name,false);
}
