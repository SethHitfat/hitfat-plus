/* ═══════════════ BELL'S REMINDERS · Web Push ═══════════════
   A member turns them on once (it must be a tap: the browser asks then);
   the phone's subscription goes to plus_push_subs through plus_push_save,
   and at 8 pm the plus-push function decides whether Bell has something to
   say: dusty, rusty, a streak at risk. At most one a day. See
   deploy/38-plus-push.sql and deploy/plus-push/index.ts.

   /sw.js does nothing but show these and open the app when one is tapped.
   On an iPhone, web push works only once HITFAT+ is on the Home Screen
   (iOS 16.4+); until then the row says how. ES5. */

function pushFn(){ return (typeof SUPA_URL!=='undefined'?SUPA_URL:'')+'/functions/v1/plus-push'; }

function pushIOS(){ return /iPad|iPhone|iPod/.test(navigator.userAgent||'') || (navigator.platform==='MacIntel' && navigator.maxTouchPoints>1); }
function pushStandalone(){ return (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || navigator.standalone===true; }
function pushSupported(){ return ('serviceWorker' in navigator) && ('PushManager' in window) && ('Notification' in window); }
/* what the row can offer: 'on' | 'off' | 'denied' | 'install' (iPhone, not on the Home Screen) | 'none' */
function pushState(){
  if(!pushSupported()) return (pushIOS() && !pushStandalone()) ? 'install' : 'none';
  if(Notification.permission==='denied') return 'denied';
  var on=false; try{ on=localStorage.getItem('hf_push_on')==='1'; }catch(e){}
  return (on && Notification.permission==='granted') ? 'on' : 'off';
}
function pushKeyBytes(b64){
  var s=(b64+'==='.slice(0,(4-b64.length%4)%4)).replace(/-/g,'+').replace(/_/g,'/'), raw=atob(s), out=new Uint8Array(raw.length), i;
  for(i=0;i<raw.length;i++) out[i]=raw.charCodeAt(i);
  return out;
}
function pushB64(buf){ var b=new Uint8Array(buf), s='', i; for(i=0;i<b.length;i++) s+=String.fromCharCode(b[i]); return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''); }
function pushReg(){ return navigator.serviceWorker.register('/sw.js',{scope:'/'}).then(function(){ return navigator.serviceWorker.ready; }); }

function pushEnable(){
  var st=pushState();
  if(st==='install') return pushInstallHelp();
  if(st==='denied'){ toast('Notifikasi disekat. Benarkan dalam tetapan telefon untuk HITFAT+'); return; }
  if(st==='none'){ toast('Telefon ini tidak menyokong notifikasi web'); return; }
  if(!sb || !HF.userId){ toast('Log masuk dahulu'); return; }
  Notification.requestPermission().then(function(p){
    if(p!=='granted'){ toast('Peringatan tidak dihidupkan'); pushRefresh(); return null; }
    return Promise.all([pushReg(), fetch(pushFn()+'?action=key').then(function(r){ return r.json(); })]).then(function(a){
      var reg=a[0], key=a[1] && a[1].key;
      if(!key) throw new Error('no key');
      return reg.pushManager.getSubscription().then(function(old){
        return old || reg.pushManager.subscribe({userVisibleOnly:true, applicationServerKey:pushKeyBytes(key)});
      });
    }).then(function(sub){
      return sb.rpc('plus_push_save',{p_endpoint:sub.endpoint, p_p256dh:pushB64(sub.getKey('p256dh')), p_auth:pushB64(sub.getKey('auth'))});
    }).then(function(r){
      if(r && r.error) throw r.error;
      try{ localStorage.setItem('hf_push_on','1'); }catch(e){}
      toast('Peringatan Bell dihidupkan 🔔'); pushRefresh(); pushTest();
    });
  }).catch(function(e){ console.warn('push enable failed',e); toast('Tidak dapat hidupkan peringatan. Cuba lagi.'); pushRefresh(); });
}
function pushDisable(){
  try{ localStorage.removeItem('hf_push_on'); }catch(e){}
  if(!pushSupported()){ pushRefresh(); return; }
  navigator.serviceWorker.getRegistration('/').then(function(reg){
    return reg && reg.pushManager.getSubscription();
  }).then(function(sub){
    if(!sub) return;
    if(sb) sb.rpc('plus_push_remove',{p_endpoint:sub.endpoint});
    return sub.unsubscribe();
  }).catch(function(){}).then(function(){ toast('Peringatan Bell dimatikan'); pushRefresh(); });
}
/* the member's own test: proves the whole path, phone to server and back */
function pushTest(){
  if(!sb) return;
  sb.auth.getSession().then(function(r){
    var t=r && r.data && r.data.session && r.data.session.access_token; if(!t) return;
    return fetch(pushFn()+'?action=test',{method:'POST', headers:{Authorization:'Bearer '+t}});
  }).catch(function(){});
}
function pushInstallHelp(){
  $('pw-body').innerHTML='<div class="pwtop"><span></span><button class="pwx" aria-label="Tutup" onclick="closeProduct()">✕</button></div>'+
    '<div class="sc-sh"><div class="sc-sh-k">Peringatan Bell di iPhone</div>'+
    '<div class="pu-steps"><div><b>1</b>Buka app.hitfat.io dalam Safari</div><div><b>2</b>Tekan butang Kongsi (petak dengan anak panah ke atas)</div>'+
    '<div><b>3</b>Pilih <i>Add to Home Screen</i>, kemudian <i>Add</i></div><div><b>4</b>Buka HITFAT+ dari ikon di Home Screen, kemudian hidupkan peringatan di sini</div></div>'+
    '<div class="sc-sh-f">Apple hanya membenarkan notifikasi web untuk app yang dipasang di Home Screen (iOS 16.4 ke atas).</div></div>';
  $('pwm').classList.add('on');
}
/* the Settings row */
function pushRow(){
  var st=pushState(), sub={on:'Pukul 8 malam, bila Bell perlu tegur',off:'Bell tegur anda bila streak dalam bahaya',denied:'Disekat dalam tetapan telefon',install:'Pasang ke Home Screen dahulu',none:'Tidak disokong pada pelayar ini'}[st];
  var ctl=(st==='on'||st==='off')?
    '<div class="obseg meseg"><button class="'+(st==='on'?'on':'')+'" onclick="pushEnable()">On</button><button class="'+(st==='off'?'on':'')+'" onclick="pushDisable()">Off</button></div>':
    st==='install'?'<button class="pu-how" onclick="pushInstallHelp()">Cara</button>':'';
  return '<div class="grow grow-ctl" id="push-row">'+ic('bell')+'<div class="grow-l">Peringatan Bell<div class="pu-sub">'+sub+'</div></div>'+ctl+'</div>';
}
/* the invitation under the score, once, until it is answered */
function pushInvite(){
  var st=pushState(), no=false;
  try{ no=localStorage.getItem('hf_push_no')==='1'; }catch(e){}
  if(no || (st!=='off' && st!=='install')) return '';
  return '<div class="pu-inv"><button class="pu-inv-b" onclick="pushEnable()">🔔 Biar Bell ingatkan anda pukul 8 malam</button>'+
    '<button class="pu-inv-x" aria-label="Tutup" onclick="pushNo()">✕</button></div>';
}
function pushNo(){ try{ localStorage.setItem('hf_push_no','1'); }catch(e){} if(typeof scRender==='function') scRender(); }
function pushRefresh(){
  var r=$('push-row'); if(r && r.parentNode) r.outerHTML=pushRow();
  if(typeof scRender==='function' && $('mascot-home') && $('mascot-home').innerHTML) scRender();
}
