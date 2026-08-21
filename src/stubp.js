// full 2D context so canvas drawing is exercised, not skipped
var _canvas={rects:0,texts:0,strokes:0,fills:0,nan:0};
function _ctx2d(){
  function chk(){ for(var i=0;i<arguments.length;i++){ var v=arguments[i];
    if(typeof v==="number" && !isFinite(v)) _canvas.nan++; } }
  return {
    fillRect:function(a,b,c,d){chk(a,b,c,d);_canvas.rects++;},
    clearRect:function(a,b,c,d){chk(a,b,c,d);},
    fillText:function(t,a,b){chk(a,b);_canvas.texts++;},
    measureText:function(t){return {width:String(t).length*9};},
    createRadialGradient:function(){return {addColorStop:function(){}};},
    createLinearGradient:function(){return {addColorStop:function(){}};},
    beginPath:function(){}, closePath:function(){},
    moveTo:function(a,b){chk(a,b);}, lineTo:function(a,b){chk(a,b);},
    arc:function(a,b,c){chk(a,b,c);}, arcTo:function(a,b,c,d,e){chk(a,b,c,d,e);},
    stroke:function(){_canvas.strokes++;}, fill:function(){_canvas.fills++;},
    setTransform:function(){}, save:function(){}, restore:function(){},
    font:"", textAlign:"", textBaseline:"", fillStyle:"", strokeStyle:"", lineWidth:0
  };
}
var _els={};
function El(id){ this.id=id; this.style={}; var cls={};
  var self=this;
  function sync(){ self.className=Object.keys(cls).join(" "); }
  this.className='';
  this.classList={add:function(c){cls[c]=1;sync();},remove:function(c){delete cls[c];sync();},
    toggle:function(c,on){ if(on===undefined){cls[c]?delete cls[c]:cls[c]=1;} else {on?cls[c]=1:delete cls[c];} sync(); },
    contains:function(c){return !!cls[c];}};
  this.textContent=''; this.innerHTML=''; this.value='';
  /* The nav-offset probe appends a hidden div, reads offsetHeight/offsetWidth
     to get the real env(safe-area-*) values, then removes it. Without a
     parentNode the probe threw, the try/catch swallowed it, and the test could
     not tell a broken probe from a stub that could not model one. */
  this.parentNode=null;
  this.offsetHeight=0; this.offsetWidth=0;
  this.appendChild=function(c){ if(c) c.parentNode=self; return c; };
  this.removeChild=function(c){ if(c) c.parentNode=null; return c; };
  this.addEventListener=function(){};
  this.querySelector=function(){return new El('q');}; this.querySelectorAll=function(){return [];};
  this.getContext=function(){ return _ctx2d(); };
  this.toDataURL=function(){ return "data:image/png;base64,AAAA"; };
  this.toBlob=function(cb){ cb(null); };
  this.scrollTop=0; this.srcObject=null; this.focus=function(){};
}
var document={ getElementById:function(id){ if(!_els[id]) _els[id]=new El(id); return _els[id]; },
  querySelector:function(){return new El('q');}, querySelectorAll:function(){return [];},
  createElement:function(){return new El('t');}, addEventListener:function(){},
  head:new El('head'), body:new El('body'), readyState:'complete',
  /* setNavOffset writes --navb here. Without documentElement the probe threw,
     the try/catch swallowed it, and the test could not tell a broken probe
     from a stub that had no root element to write to. */
  documentElement:(function(){ var r=new El('html'); var props={};
    r.style.setProperty=function(k,v){ props[k]=v; };
    r.style.getPropertyValue=function(k){ return props[k]||''; };
    return r; })() };
var _ls={};
var localStorage={ getItem:function(k){return _ls[k]===undefined?null:_ls[k];},
  setItem:function(k,v){_ls[k]=String(v);}, removeItem:function(k){delete _ls[k];} };
var window={ addEventListener:function(){}, location:{origin:'https://plus.hitfat.io',pathname:'/',href:'',hostname:'plus.hitfat.io',protocol:'https:'},
  innerWidth:390, innerHeight:844, devicePixelRatio:3, supabase:null };
var _cam={mode:'ok', stopped:0};   // 'ok' | 'deny' | 'hang' | 'none'
function _track(){ return {stop:function(){_cam.stopped++;}}; }
var navigator={ userAgent:'jsc', mediaDevices:{
  getUserMedia:function(){
    if(_cam.mode==='deny') return Promise.reject(new Error('denied'));
    if(_cam.mode==='hang') return new Promise(function(){});   // never settles
    return Promise.resolve({getTracks:function(){return [_track()];}});
  }}};
function setTimeout(){return 0;} function clearTimeout(){} function setInterval(){return 0;} function clearInterval(){}
function alert(){} function confirm(){return true;} function prompt(){return null;}
var console={ warn:function(){}, log:function(){}, error:function(m){ print("  console.error: "+m); } };
var location = window.location;
