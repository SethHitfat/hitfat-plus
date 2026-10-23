/* ═══════════════ BELL'S REMINDERS · Web Push ═══════════════
   A member turns them on once (it must be a tap: the browser asks then);
   the phone's subscription goes to plus_push_subs through plus_push_save,
   and at 8 pm the plus-push function decides whether Bara has something to
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
  if(st==='denied'){ toast('Notifications are blocked. Allow them for HITFAT+ in your phone settings'); return; }
  if(st==='none'){ toast('This phone doesn\'t support web notifications'); return; }
  if(!sb || !HF.userId){ toast('Sign in first'); return; }
  Notification.requestPermission().then(function(p){
    if(p!=='granted'){ toast('Reminders not turned on'); pushRefresh(); return null; }
    return pushSubscribe(false);
  }).catch(function(e){ console.warn('push enable failed',e); toast('Couldn\'t turn reminders on. Try again.'); pushRefresh(); });
}
/* the phone's subscription, saved for this member; quiet: no toast, no test
   (the automatic switch-on when permission is already there) */
function pushSubscribe(quiet){
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
      if(!quiet){ toast('Bara\'s reminders are on 🔔'); pushTest(); }
      pushRefresh();
    });
}

/* ── on by default, as far as a phone allows (21 Oct 2026) ──
   Seth: "bara remind tu terus on". A web app cannot switch notifications on
   by itself; the member has to tap Allow once. So: where permission is
   already there (an app added again to the Home Screen keeps no
   subscription), Bara's reminders switch on with no question; where it has
   not been asked, Bara asks once on Home, full screen, one tap to the
   phone's Allow. "Nanti dulu" asks again in 3 days, 3 times at most; the ✕
   on the invite card, or a phone that blocked them, is never asked again. */
function pushAuto(){
  try{
    if(!pushSupported() || !pushStandalone() || !sb || !HF.userId) return;
    if(Notification.permission==='granted' && localStorage.getItem('hf_push_on')!=='1' && !pushAuto._busy){
      pushAuto._busy=true; pushSubscribe(true).catch(function(){}).then(function(){ pushAuto._busy=false; });
    }
  }catch(e){}
}
function pushAskDue(){
  try{
    if(pushState()!=='off' || !pushStandalone() || Notification.permission!=='default') return false;
    if(!sb || !HF.userId || !HF.data.onboarded) return false;
    if(!(HF.data.sc && HF.data.sc.met)) return false;              // Kenali Bara first
    if(localStorage.getItem('hf_push_no')==='1') return false;
    var a=JSON.parse(localStorage.getItem('hf_push_ask')||'null');
    if(a && (a.n>=3 || Date.now()-a.t<3*864e5)) return false;
    return true;
  }catch(e){ return false; }
}
function pushAsk(){
  if(!pushAskDue() || !$('scc') || $('scc').style.display==='flex') return false;
  var a=null; try{ a=JSON.parse(localStorage.getItem('hf_push_ask')||'null'); }catch(e){}
  try{ localStorage.setItem('hf_push_ask', JSON.stringify({n:((a&&a.n)||0)+1, t:Date.now()})); }catch(e){}
  var pose=typeof scTone==='function'?scTone('cheer','w_cheer'):'aktif';
  $('scc').className='scc scc-meet';
  $('scc').innerHTML='<div class="scc-in">'+(typeof scMomentBell==='function'?scMomentBell(pose):'')+
    '<div class="scc-t">Boleh Bara ingatkan awak? 🔔</div>'+
    '<div class="scc-s">Pagi untuk check-in, tengah hari untuk log makan, malam bila streak awak dalam bahaya. Paling banyak 3 sehari, bila ada sebab je.</div>'+
    '<div class="scc-s" style="font-size:13px;opacity:.7;margin-top:6px">Lepas tekan, telefon akan tanya. Pilih <b>Allow</b>.</div>'+
    '<button class="bigbtn scc-share" onclick="pushAskYes()">Hidupkan peringatan</button>'+
    '<button class="scc-x" onclick="scCelebrateClose()">Nanti dulu</button></div>';
  $('scc').style.display='flex';
  if(typeof scMomentPlay==='function') scMomentPlay(pose);
  return true;
}
function pushAskYes(){ if(typeof scCelebrateClose==='function') scCelebrateClose(); pushEnable(); }
function pushDisable(){
  try{ localStorage.removeItem('hf_push_on'); }catch(e){}
  if(!pushSupported()){ pushRefresh(); return; }
  navigator.serviceWorker.getRegistration('/').then(function(reg){
    return reg && reg.pushManager.getSubscription();
  }).then(function(sub){
    if(!sub) return;
    if(sb) sb.rpc('plus_push_remove',{p_endpoint:sub.endpoint});
    return sub.unsubscribe();
  }).catch(function(){}).then(function(){ toast('Bara\'s reminders are off'); pushRefresh(); });
}
/* the member's own test: proves the whole path, phone to server and back */
function pushTest(){
  if(!sb) return;
  sb.auth.getSession().then(function(r){
    var t=r && r.data && r.data.session && r.data.session.access_token; if(!t) return;
    return fetch(pushFn()+'?action=test',{method:'POST', headers:{Authorization:'Bearer '+t}});
  }).catch(function(){});
}
/* ═══════════════ ON THE HOME SCREEN (24 Oct 2026) ═══════════════
   Seth: the install tutorial in the app too. Members open HITFAT+ from the
   gym's QR, WhatsApp or Instagram. Inside Instagram's or Facebook's own
   browser Google refuses to sign in (disallowed_useragent) and there is no
   Add to Home Screen, so the sign-in screen says so before anything else.
   Signed in, in a phone browser rather than the Home Screen app, Home has a
   card with the steps for that phone and that browser. */
function hfUA(ua){ return ua!=null ? String(ua) : String(navigator.userAgent||''); }
/* the app whose own browser this is, or '' */
function hfInApp(ua){
  ua=hfUA(ua);
  if(/Instagram/i.test(ua)) return 'Instagram';
  if(/FBAN|FBAV|FB_IAB|FBIOS|FB4A/.test(ua)) return 'Facebook';
  if(/musical_ly|BytedanceWebview|TikTok/i.test(ua)) return 'TikTok';
  if(/Barcelona/.test(ua)) return 'Threads';
  if(/ Line\//.test(ua)) return 'LINE';
  if(/Snapchat/i.test(ua)) return 'Snapchat';
  if(/LinkedInApp/.test(ua)) return 'LinkedIn';
  if(/\bGSA\//.test(ua) && /iPhone|iPad/.test(ua)) return 'the Google app';
  if(/Android/.test(ua) && /; wv\)/.test(ua)) return 'this app';
  return '';
}
function hfPhone(ua){
  if(ua==null && typeof pushIOS==='function' && pushIOS()) return 'ios';
  ua=hfUA(ua); return /iPhone|iPad|iPod/.test(ua)?'ios':/Android/.test(ua)?'android':'';
}
/* which browser: the steps differ */
function hfBrowser(ua){
  var ph=hfPhone(ua); ua=hfUA(ua);
  if(ph==='ios') return /CriOS|FxiOS|EdgiOS|OPiOS/.test(ua) ? 'ios-other' : 'safari';
  if(ph!=='android') return '';
  if(/SamsungBrowser/.test(ua)) return 'samsung';
  if(/Chrome\//.test(ua) && !/EdgA|OPR|Firefox|HuaweiBrowser|MiuiBrowser|HeyTap|VivoBrowser/.test(ua)) return 'chrome';
  return 'android-other';
}
function hfInstallSteps(br){
  var S={
    safari:['Tap <b>Share</b> at the bottom (the square with the arrow up). Don\'t see it? Tap <b>···</b> first',
            'Scroll down and choose <b>Add to Home Screen</b>','Keep <b>Open as Web App</b> on, then tap <b>Add</b>',
            'Open HITFAT+ from its icon and sign in once more'],
    'ios-other':['Tap <b>Share</b> in the address bar','Choose <b>Add to Home Screen</b>','Tap <b>Add</b>',
            'Open HITFAT+ from its icon and sign in once more'],
    chrome:['Tap <b>⋮</b> at the top right','Choose <b>Add to Home screen</b> or <b>Install app</b>','Tap <b>Install</b>','Open HITFAT+ from its icon'],
    samsung:['Tap <b>≡</b> at the bottom right','Choose <b>Add page to</b>, then <b>Home screen</b>','Tap <b>Add</b>','Open HITFAT+ from its icon'],
    'android-other':['Open <b>app.hitfat.io</b> in <b>Google Chrome</b>','Tap <b>⋮</b> and choose <b>Add to Home screen</b>','Tap <b>Install</b>','Open HITFAT+ from its icon']
  };
  return S[br]||S.safari;
}
/* the steps, for this phone (Home's card, the reminders row, Settings) */
function pushInstallHelp(){
  var br=hfBrowser()||'safari', ios=hfPhone()==='ios';
  $('pw-body').innerHTML='<div class="pwtop"><span></span><button class="pwx" aria-label="Tutup" onclick="closeProduct()">✕</button></div>'+
    '<div class="sc-sh"><img class="hi-icon" src="/img/icon/icon-192.png?v=3" alt=""><div class="sc-sh-k">HITFAT+ on your Home Screen</div>'+
    '<div class="hi-t">Opens like an app, full screen, and lets Bara send you reminders</div>'+
    '<div class="pu-steps">'+hfInstallSteps(br).map(function(t,i){ return '<div><b>'+(i+1)+'</b><span>'+t+'</span></div>'; }).join('')+'</div>'+
    '<div class="sc-sh-f">'+(ios?'Apple allows web notifications only for apps added to the Home Screen (iOS 16.4 or later).':'No Play Store needed. It takes a few seconds.')+'</div></div>';
  $('pwm').classList.add('on');
}
/* Home's card: a phone, in its browser, not dismissed in the last 3 weeks */
function hfInstallCard(){
  if(!hfPhone() || pushStandalone() || hfInApp()) return '';
  var no=0; try{ no=+localStorage.getItem('hf_inst_no')||0; }catch(e){}
  if(no && Date.now()-no<21*864e5) return '';
  return '<div class="scx-coach scx-push scx-inst"><div class="scx-k"><i></i>HOME SCREEN</div><div class="scx-t"><b>Put HITFAT+ on your phone</b></div>'+
    '<div class="scx-seth">One tap to open, full screen, with Bara\'s reminders. No '+(hfPhone()==='ios'?'App':'Play')+' Store needed.</div>'+
    '<div class="pu-inv"><button class="pu-inv-b" onclick="pushInstallHelp()">📲 Show me how</button>'+
    '<button class="pu-inv-x" aria-label="Tutup" onclick="hfInstallNo()">✕</button></div></div>';
}
function hfInstallNo(){ try{ localStorage.setItem('hf_inst_no',String(Date.now())); }catch(e){} if(typeof scRender==='function') scRender(); }
/* the sign-in screen inside Instagram & co: open it in the phone's browser */
function hfInAppNote(){
  var app=hfInApp(), box=$('auth-inapp');
  if(!app){ if(box && box.parentNode) box.parentNode.removeChild(box); return; }
  if(!box){
    var g=document.querySelector('#auth .gbtn'); if(!g) return;
    box=document.createElement('div'); box.id='auth-inapp'; box.className='auth-inapp'; g.parentNode.insertBefore(box,g);
  }
  var and=hfPhone()==='android';
  box.innerHTML='<b>You\'re inside '+hesc(app)+'.</b> Google sign-in and adding HITFAT+ to your Home Screen don\'t work here. '+
    'Tap <b>'+(and?'⋮':'···')+'</b> and choose <b>Open in '+(and?'Chrome':'Safari')+'</b> (or Open in browser).'+
    '<div class="ai-b">'+(and?'<button onclick="hfOpenChrome()">Open in Chrome</button>':'')+'<button onclick="hfCopyLink()">Copy link</button></div>';
}
function hfOpenChrome(){ location.href='intent://'+location.host+location.pathname+location.search+'#Intent;scheme=https;package=com.android.chrome;end'; }
function hfCopyLink(){
  var u=location.href, done=function(){ toast('Link copied. Paste it in '+(hfPhone()==='android'?'Chrome':'Safari')); };
  try{ navigator.clipboard.writeText(u).then(done,function(){ window.prompt('Copy this link',u); }); }catch(e){ window.prompt('Copy this link',u); }
}
/* the Settings row */
function pushRow(){
  var st=pushState(), sub={on:'Morning, lunch, 8 pm and bedtime, only with a reason. 3 a day at most',off:'Bara nudges you to check in, log meals and keep your streak',denied:'Blocked in your phone settings',install:'Add HITFAT+ to your Home Screen first',none:'Not supported in this browser'}[st];
  var ctl=(st==='on'||st==='off')?
    '<div class="obseg meseg"><button class="'+(st==='on'?'on':'')+'" onclick="pushEnable()">On</button><button class="'+(st==='off'?'on':'')+'" onclick="pushDisable()">Off</button></div>':
    st==='install'?'<button class="pu-how" onclick="pushInstallHelp()">How</button>':'';
  return '<div class="grow grow-ctl" id="push-row">'+ic('bell')+'<div class="grow-l">Bara\'s reminders<div class="pu-sub">'+sub+'</div></div>'+ctl+'</div>';
}
/* the invitation under the score, once, until it is answered */
function pushInvite(){
  var st=pushState(), no=false;
  try{ no=localStorage.getItem('hf_push_no')==='1'; }catch(e){}
  if(no || (st!=='off' && st!=='install')) return '';
  return '<div class="pu-inv"><button class="pu-inv-b" onclick="pushEnable()">🔔 Turn on Bara\'s reminders</button>'+
    '<button class="pu-inv-x" aria-label="Tutup" onclick="pushNo()">✕</button></div>';
}
function pushNo(){ try{ localStorage.setItem('hf_push_no','1'); }catch(e){} if(typeof scRender==='function') scRender(); }
function pushRefresh(){
  var r=$('push-row'); if(r && r.parentNode) r.outerHTML=pushRow();
  if(typeof scRender==='function' && $('mascot-home') && $('mascot-home').innerHTML) scRender();
}

/* a notification tapped while the app is open: sw.js says where it points
   (a comment opens the class group) */
if(typeof navigator!=='undefined' && navigator.serviceWorker && navigator.serviceWorker.addEventListener){
  navigator.serviceWorker.addEventListener('message',function(e){
    var d=e&&e.data; if(!d||d.hf!=='open'||typeof d.url!=='string') return;
    if(typeof kelasOpenUrl==='function') kelasOpenUrl(d.url);
    pushGoUrl(d.url);
  });
}
/* (20 Oct) Bara's daily reminders open where they point: ?go=checkin (the
   9 am one), ?go=eat (1 pm), ?go=home (10 pm). Kept until the app has
   started, like ?kelas, then handled once. */
function pushGo(v){
  try{
    if(v==='checkin'){ if(typeof switchTab==='function') switchTab('home'); if(typeof ckOpen==='function') ckOpen(); }
    else if(v==='eat'){ if(typeof switchTab==='function') switchTab('eat'); }
    else if(v==='home'){ if(typeof switchTab==='function') switchTab('home'); }
  }catch(e){}
}
function pushGoUrl(u){ var m=String(u||'').match(/[?&]go=([a-z]+)/); if(m) pushGo(m[1]); }
function pushCaptureGo(){
  try{
    var q=new URLSearchParams(location.search);
    if(q.has('go')){ localStorage.setItem('hf_push_go',q.get('go')||''); q.delete('go'); var s=q.toString();
      history.replaceState(null,'',location.pathname+(s?'?'+s:'')+location.hash); }
  }catch(e){}
}
function pushHandleGo(){ try{ var v=localStorage.getItem('hf_push_go'); if(v){ localStorage.removeItem('hf_push_go'); pushGo(v); } }catch(e){} }
