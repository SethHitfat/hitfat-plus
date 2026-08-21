   No subscription. The app is free; individual programs are bought once and
   owned forever, and Meal Scan sells access three ways because its cost is
   the one thing here that recurs.

   Everything in this file is presentation. It decides what the UI offers,
   not what the server allows. That distinction is load-bearing:

     · A program is a JSON object already sitting in this file. Gating it
       here is honest merchandising, not security — someone who reads the
       source can extract it, and that costs Seth nothing.
     · A meal scan is a paid Anthropic call. Its limit is enforced inside
       the edge function against plus_entitlements and plus_scans. What is
       written here only mirrors that decision so the buttons look right.

   Ownership is read from plus_entitlements — a table the client can select
   from and has no policy to write. It is deliberately NOT read from HF.data,
   because the browser writes HF.data and could set any flag it liked.      */

/* ── catalogue ────────────────────────────────────────────
   Free programs are the sample. They have to be genuinely good or the paid
   ones never get a look — a crippled free tier sells nothing.              */
const FREE_PROGRAMS=['fl30','core14','mch','m4','am21',
  /* the two recovery entry points — someone arriving with a sore knee should
     find something to do that day, not a price */
  'rh4','rh5'];

/* Price follows length, because that is what the buyer is actually
   comparing. Change these numbers freely — nothing derives from them. */
function programPrice(p){
  const wk=(p.weeks||[]).length;
  if(isSignature(p)){                       // the flagship tier sits one step up
    if(wk>=12) return 89;
    if(wk>=8)  return 69;
    if(wk>=3)  return 49;
    return 39;
  }
  if(wk>=12) return 59;
  if(wk>=6)  return 39;
  if(wk>=3)  return 29;
  return 19;
}
function isPaidProgram(p){
  return !!(p && p.weeks) && FREE_PROGRAMS.indexOf(p.id)<0 && !isBarProgram(p);
}
/* The bar sessions are free on purpose — the bar is the product, and a paywall
   in front of the thing that sells it would be working against the sale. */
function isBarProgram(p){ return !!(p && p.bar); }
function isSignature(p){ return !!(p && p.special); }
function isRehabProgram(p){ return !!(p && p.rehab); }

const BUNDLE_SKU='bundle_all', BUNDLE_PRICE=199;
const BAR_PRICE=139, BAR_WAS=399, BAR_URL='https://hitfat.my/hitfatbar';

/* Meal Scan sells three ways. Credits match the cost exactly; the passes
   trade a little margin for a price people find easier to say yes to. */
const SCAN_PRODUCTS=[
  {sku:'scan_c20',  kind:'credits', credits:20,  price:19, name:'20 scans',  note:'about RM0.95 each'},
  {sku:'scan_c60',  kind:'credits', credits:60,  price:45, name:'60 scans',  note:'about RM0.75 each · best value'},
  {sku:'scan_m',    kind:'pass',    days:30,     price:19, name:'30-day pass', note:'unlimited for 30 days'},
  {sku:'scan_y',    kind:'pass',    days:365,    price:99, name:'1-year pass', note:'unlimited for a year'}
];
const SCAN_FREE_TIER=3;

/* the meal plan limit on free — plan generation costs nothing to serve, so
   this is merchandising, and it is capped gently on purpose */
const FREE_PLAN_DAYS=3, FREE_PLAN_SAVED=1;

/* ── what the user owns ───────────────────────────────────  */
let _ent={skus:{}, credits:0, passUntil:null, loaded:false};

function owns(sku){ return !!_ent.skus[sku]; }
function ownsAll(){ return owns(BUNDLE_SKU); }
function ownsProgram(p){
  if(!isPaidProgram(p)) return true;
  return ownsAll() || owns('prog_'+p.id);
}
function ownsBar(){ return owns('bar'); }

/* Free tier first, then a pass, then credits — cheapest for the user in
   that order, which is also the order the edge function checks. */
function scanAccess(){
  const used=scanUsed(), freeLeft=Math.max(0, SCAN_FREE_TIER-used);
  if(_ent.passUntil && new Date(_ent.passUntil)>new Date())
    return {mode:'pass', label:'Unlimited until '+new Date(_ent.passUntil).toLocaleDateString('en-MY',{day:'numeric',month:'short',year:'numeric'}), left:Infinity};
  if(freeLeft>0)   return {mode:'free',    label:freeLeft+' of '+SCAN_FREE_TIER+' free scans left this month', left:freeLeft};
  if(_ent.credits>0) return {mode:'credits', label:_ent.credits+' scan credit'+(_ent.credits>1?'s':'')+' left', left:_ent.credits};
  return {mode:'none', label:'No scans left — free resets next month', left:0};
}
function canScan(){ return scanAccess().left>0; }

async function loadEntitlement(){
  _ent={skus:{}, credits:0, passUntil:null, loaded:true};
  if(!sb || !HF.userId) return _ent;
  try{
    const r=await sb.from('plus_entitlements')
                    .select('sku, kind, credits_left, expires_at')
                    .eq('user_id',HF.userId);
    (r&&r.data||[]).forEach(e=>{
      const live = !e.expires_at || new Date(e.expires_at)>new Date();
      if(e.kind==='credits'){ _ent.credits += (e.credits_left||0); return; }
      if(!live) return;
      if(e.kind==='pass'){
        if(!_ent.passUntil || new Date(e.expires_at)>new Date(_ent.passUntil)) _ent.passUntil=e.expires_at;
        return;
      }
      _ent.skus[e.sku]=true;         // programs, the bundle, the bar
    });
  }catch(e){ /* offline, or the table is not deployed yet — stay on free */ }
  return _ent;
}

function maxPlanDays(){ return ownsAll() ? 14 : FREE_PLAN_DAYS; }
function maxSavedPlans(){ return ownsAll() ? 20 : FREE_PLAN_SAVED; }

/* ── STORE panel ──────────────────────────────────────────  */
let _storeBackSeg='explore';
function openStore(focus){
  /* Remember where to go back to. Without this, Back returned to TRAIN, which
     saw trSeg still set to 'store' and immediately reopened the store — the
     button looked broken because nothing on screen ever changed. */
  if(typeof trSeg!=='undefined' && trSeg!=='store') _storeBackSeg=trSeg;
  hidePanels(); $('store').style.display='block';
  renderStore(focus||'programs'); $('screen').scrollTop=0;
}
function closeStore(){
  if(typeof trSeg!=='undefined') trSeg=_storeBackSeg||'explore';
  switchTab('train');
}
let storeSeg='programs';
const STORE_SEGS=[['programs','Programs'],['scan','Meal Scan'],['bar','HITFAT BAR']];
function setStoreSeg(s){ storeSeg=s; renderStore(s); $('screen').scrollTop=0; }

function renderStore(seg){
  storeSeg=seg||storeSeg;
  $('store-segs').innerHTML='<div class="segs">'+STORE_SEGS.map(s=>
    '<button class="seg'+(storeSeg===s[0]?' on':'')+'" onclick="setStoreSeg(\''+s[0]+'\')">'+s[1]+'</button>').join('')+'</div>';
  if(storeSeg==='scan') return storeScan();
  if(storeSeg==='bar')  return storeBar();
  storePrograms();
}

function storePrograms(){
  const paid=PROGRAMS.filter(isPaidProgram);
  const mine=paid.filter(ownsProgram), rest=paid.filter(p=>!ownsProgram(p));
  let h=fqCard();

  if(!ownsAll()){
    h+='<div class="ecta" style="background:'+egrad('#2a1016','#0b0b0d','#EF4444')+';" onclick="openProduct(\''+BUNDLE_SKU+'\')">'+
       '<div class="ic">✦</div><div class="t">Every program, one payment</div>'+
       '<div class="s">All '+paid.length+' paid programs, and every one added later. No subscription — buy it once, it is yours.</div>'+
       '<div class="go">RM'+BUNDLE_PRICE+' · Get all access</div>'+
       '<div class="lock">WORTH RM'+paid.reduce((s,p)=>s+programPrice(p),0)+' BOUGHT SEPARATELY</div></div>';
  } else {
    h+='<div class="mpnote" style="border-color:rgba(46,194,126,.35);color:var(--ok);">You own All Access — every program here is unlocked, including anything added later.</div>';
  }

  if(mine.length){
    h+=fsec('Yours','Bought and unlocked');
    h+='<div class="hscroll">'+mine.map(p=>flandCard(p,'OWNED')).join('')+'</div>';
  }
  const sig=rest.filter(isSignature),
        rhb=rest.filter(isRehabProgram),
        other=rest.filter(p=>!isSignature(p) && !isRehabProgram(p));
  if(sig.length){
    h+=fsec('Signature','The flagship programs — longer, harder, coach-led');
    h+='<div class="prods">'+sig.map(p=>prodCard(p)).join('')+'</div>';
  }
  if(rhb.length){
    h+=fsec('Recovery & prehab','Joint by joint — knees, shoulders, hips, back');
    h+='<div class="prods">'+rhb.map(p=>prodCard(p)).join('')+'</div>';
  }
  if(other.length){
    h+=fsec('Programs','Buy once, keep forever');
    h+='<div class="prods">'+other.map(p=>prodCard(p)).join('')+'</div>';
  }
  h+=fsec('Free to everyone','No payment, no account needed');
  h+='<div class="hscroll">'+PROGRAMS.filter(p=>p.weeks&&!isPaidProgram(p)&&!isBarProgram(p))
      .map(p=>flandCard(p,'FREE')).join('')+'</div>';
  h+='<div class="mpnote">Every single session in the library is free too — '+
     PROGRAMS.filter(p=>!p.weeks).length+' of them. Paid programs are the structured multi-week ones.</div>';
  $('store-body').innerHTML=h;
}

function prodCard(p){
  const done=progDone(p.id), tot=progDays(p);
  return '<div class="prod" onclick="openProduct(\'prog_'+p.id+'\')">'+
    '<div class="im" style="background-image:url(\''+progImg(p)+'\')">'+
    (isSignature(p)?'<span class="sigb">SIGNATURE</span>':'')+
    '<span class="pr">RM'+programPrice(p)+'</span></div>'+
    '<div class="in"><div class="t">'+p.name+'</div>'+
    '<div class="m">'+p.weeks.length+' weeks · '+tot+' days · '+p.level+'</div>'+
    (done>0?'<div class="m" style="color:var(--hyrox);">'+Math.round(done/tot*100)+'% started</div>':'')+
    '</div></div>';
}

function storeScan(){
  const a=scanAccess();
  let h='';
  h+='<div class="ehero"><div class="k">AI Meal Scan</div>'+
     '<div class="row"><div style="flex:1;min-width:0;">'+
     '<div class="n" style="font-size:40px;">'+(a.mode==='pass'?'Unlimited':a.left===Infinity?'Unlimited':a.left)+'</div>'+
     '<div class="u">'+a.label+'</div></div></div></div>';
  h+=fsec('How it is priced','Every scan is a real AI call, so you pay for what you use');
  h+='<div class="prods">'+SCAN_PRODUCTS.map(s=>
    '<div class="prod flat" onclick="openProduct(\''+s.sku+'\')">'+
    '<div class="in"><div class="t">'+s.name+'</div><div class="m">'+s.note+'</div>'+
    '<div class="pbig">RM'+s.price+'</div></div></div>').join('')+'</div>';
  h+='<div class="mpnote">Credits never expire. Passes run from the day you buy and do not auto-renew — nothing recurring, nothing to cancel.</div>';
  h+=fsec('Always free','');
  h+='<div class="flib">'+[
      ['✏️','Manual logging','Unlimited, forever — type any meal in'],
      ['📷',SCAN_FREE_TIER+' scans a month','Resets on the first of the month'],
      ['📊','Your daily target and dashboard','Calories, macros, burn, the lot'],
      ['🍽️','Meal plans up to '+FREE_PLAN_DAYS+' days','Full 14-day plans come with All Access']
    ].map(x=>'<div class="row" style="cursor:default;"><div class="ic">'+x[0]+'</div>'+
      '<div style="flex:1;"><div style="font-size:15px;font-weight:600;color:var(--txt);">'+x[1]+'</div>'+
      '<div style="font-size:13px;color:var(--dim);margin-top:3px;">'+x[2]+'</div></div></div>').join('')+'</div>';
  $('store-body').innerHTML=h;
}

function storeBar(){
  const bp=PROGRAMS.filter(isBarProgram);
  let h='';
  h+='<div class="ecta" style="background:'+egrad('#1a1410','#0b0b0d','#FF8A1E')+';" onclick="openBarSite()">'+
     '<div class="ic">🏋️</div><div class="t">HITFAT BAR</div>'+
     '<div class="s">A bar and five resistance bands. What a gym gives you for the parts that matter, in the space of a doorway.</div>'+
     '<div class="go">RM'+BAR_PRICE+' <s style="opacity:.5;font-weight:400;">RM'+BAR_WAS+'</s></div>'+
     '<div class="lock">SAVE RM'+(BAR_WAS-BAR_PRICE)+'</div></div>';

  if(bp.length){
    h+='<div class="mpnote" style="border-color:rgba(46,194,126,.35);color:var(--ok);">'+
       'All '+bp.length+' BAR sessions are free in this app, whether you own the bar or not.</div>';
    h+=fsec('BAR sessions','Free · built for the bar and bands');
    h+='<div class="hscroll">'+bp.map(p=>flandCard(p,'FREE')).join('')+'</div>';
  } else {
    /* The exercise library has no band or bar movements in it — 310 exercises
       across bodyweight, chair, towel, bottle, dumbbell and kettlebell, and
       not one band. Relabelling a dumbbell clip as a bar exercise would show
       the buyer a dumbbell, so this section says what is true instead. */
    h+='<div class="mpnote" style="border-color:rgba(245,158,11,.35);color:#f59e0b;">'+
       'BAR sessions are being filmed. They will appear here free — no purchase inside the app, ever.</div>';
  }

  h+=fsec('What is in the box','');
  h+='<div class="flib">'+[
      ['🏋️','The bar','Collapsible, fits in a drawer'],
      ['🎯','Five resistance bands','Stack them for the load you need'],
      ['📱','This app','Every BAR session, free'],
      ['🎥','Video for every move','No guessing at form']
    ].map(x=>'<div class="row" style="cursor:default;"><div class="ic">'+x[0]+'</div>'+
      '<div style="flex:1;"><div style="font-size:15px;font-weight:600;color:var(--txt);">'+x[1]+'</div>'+
      '<div style="font-size:13px;color:var(--dim);margin-top:3px;">'+x[2]+'</div></div></div>').join('')+'</div>';
  h+='<button class="bigbtn" onclick="openBarSite()">Get the HITFAT BAR · RM'+BAR_PRICE+'</button>';
  $('store-body').innerHTML=h;
}
function openBarSite(){ try{ window.open(BAR_URL,'_blank','noopener'); }catch(e){ toast('Open '+BAR_URL); } }

/* ── product sheet ────────────────────────────────────────  */
let _prod=null;
function openProduct(sku){
  _prod=sku;
  let title,price,sub,bullets,cta;

  if(sku===BUNDLE_SKU){
    const paid=PROGRAMS.filter(isPaidProgram);
    title='All Access'; price=BUNDLE_PRICE;
    sub='Every paid program, and everything added later. One payment, yours for good.';
    bullets=[['✦',paid.length+' programs unlocked','Worth RM'+paid.reduce((s,p)=>s+programPrice(p),0)+' separately'],
             ['🍽️','Meal plans up to 14 days','Free builds 3 days at a time'],
             ['📋','Save every plan you build','Free keeps your latest one'],
             ['➕','Future programs included','New releases unlock automatically']];
    cta='Get All Access';
  } else if(sku.indexOf('scan_')===0){
    const s=SCAN_PRODUCTS.filter(x=>x.sku===sku)[0]; if(!s) return;
    title=s.name; price=s.price; sub=s.note;
    bullets=[['📷', s.kind==='credits' ? s.credits+' scans' : 'Unlimited scans',
                    s.kind==='credits' ? 'Credits never expire' : 'For '+s.days+' days from purchase'],
             ['🧠','Full nutrition breakdown','Calories, protein, carbs, fat, ingredient by ingredient'],
             ['💪','Coach and Action on every scan','What to fix, and what to do next'],
             ['🔄','No auto-renew','Nothing recurring, nothing to cancel']];
    cta='Buy '+s.name;
  } else {
    const p=PROGRAMS.filter(x=>'prog_'+x.id===sku)[0]; if(!p) return;
    title=p.name; price=programPrice(p);
    sub=p.desc||(p.weeks.length+' weeks of structured training, yours to keep.');
    bullets=[['📅',p.weeks.length+' weeks · '+progDays(p)+' sessions','Follow it day by day'],
             ['🎥','Video for every exercise','Filmed, not described'],
             ['📈','Progress saved as you go','Pick up where you left off on any device'],
             ['♾️','Yours forever','Buy once, no subscription']];
    cta='Buy for RM'+price;
  }

  $('pw-body').innerHTML=
    '<div class="pwtop"><button class="pwx" onclick="closeProduct()">✕</button></div>'+
    '<div class="pwhero"><div class="pwmark">HITFAT<span>+</span></div>'+
    '<div class="pwh">'+title+'</div><div class="pws">'+sub+'</div></div>'+
    '<div class="pwlist">'+bullets.map(b=>
      '<div class="pwf"><div class="ic">'+b[0]+'</div><div><div class="t">'+b[1]+'</div>'+
      '<div class="m">'+b[2]+'</div></div></div>').join('')+'</div>'+
    (sku.indexOf('prog_')===0 ? weekPhases(PROGRAMS.filter(x=>'prog_'+x.id===sku)[0]) : '')+
    '<div class="pwprice"><div class="p">RM'+price+'</div><div class="per">one payment</div></div>'+
    '<button class="bigbtn" onclick="startCheckout(\''+sku+'\')">'+cta+'</button>'+
    '<button class="authalt" onclick="closeProduct()">Not now</button>'+
    '<div class="pwfine">No subscription. Manual logging, your daily target, all single sessions and the HITFAT BAR programs stay free.</div>';
  $('pwm').classList.add('on');
}
function closeProduct(){ $('pwm').classList.remove('on'); }

/* ── checkout ─────────────────────────────────────────────
   The browser sends a SKU and never an amount. pay-create looks the price up
   server-side, because a client that can name its own price will eventually
   be asked to.                                                             */
const PAY_CREATE = SUPA_URL + '/functions/v1/pay-create';
const PAY_STATUS = SUPA_URL + '/functions/v1/pay-status';
const PAY_CHANNELS = [[1,'FPX','Online banking'],[6,'DuitNow QR','Any bank or eWallet app']];
let payChannel = 1, _paySku = null;

function setPayChannel(c){
  payChannel = c;
  Array.prototype.forEach.call(document.querySelectorAll('.paych'), (b,i) =>
    b.classList.toggle('on', PAY_CHANNELS[i][0] === c));
}

function startCheckout(sku){
  const item = SCAN_PRODUCTS.filter(x=>x.sku===sku)[0];
  const price = sku===BUNDLE_SKU ? BUNDLE_PRICE
              : item ? item.price
              : (function(){ const p=PROGRAMS.filter(x=>'prog_'+x.id===sku)[0]; return p?programPrice(p):0; })();
  if(!price) return;
  if(!sb || !HF.userId) return toast('Sign in first so we can unlock your purchase.');
  _paySku = sku; payChannel = 1;

  $('pw-body').innerHTML=
    '<div class="pwtop"><button class="pwx" onclick="closeProduct()">✕</button></div>'+
    '<div class="pwhero"><div class="pwmark">HITFAT<span>+</span></div>'+
    '<div class="pwh">How would you like to pay?</div>'+
    '<div class="pws">RM'+price+', once. It unlocks in your account as soon as the payment clears.</div></div>'+
    '<div class="paychs">'+PAY_CHANNELS.map((c,i)=>
      '<button class="paych'+(i===0?' on':'')+'" onclick="setPayChannel('+c[0]+')">'+
      '<b>'+c[1]+'</b><small>'+c[2]+'</small></button>').join('')+'</div>'+
    '<div class="pwfine" style="text-align:left;margin:14px 0 0;">Secure payment via Bayarcash. '+
      'We never see your banking details.</div>'+
    '<button class="bigbtn" id="pay-go" onclick="payNow()">Pay RM'+price+'</button>'+
    '<button class="authalt" onclick="closeProduct()">Cancel</button>';
  /* Usually the sheet is already open because openProduct put it there, but
     checkout can be reached directly — writing into a hidden modal shows the
     buyer nothing at all. */
  $('pwm').classList.add('on');
}

async function payNow(){
  const sku=_paySku; if(!sku) return;
  const btn=$('pay-go'); if(btn){ btn.disabled=true; btn.textContent='Opening secure payment…'; }
  try{
    const tk=await scanToken();
    if(!tk){ toast('Sign in first.'); if(btn) btn.disabled=false; return; }
    const r=await fetch(PAY_CREATE,{method:'POST',
      headers:{'Content-Type':'application/json','Authorization':'Bearer '+tk,'apikey':SUPA_KEY},
      body:JSON.stringify({sku, channel:payChannel, name:(HF.data.prefs&&HF.data.prefs.name)||''})});
    const d=await r.json();
    if(r.ok && d && d.url){ localStorage.setItem('hf_plus_pending', sku); location.href=d.url; return; }
    if(d && d.code==='already_owned'){ toast('You already own this.'); await refreshPurchases(); closeProduct(); return; }
    toast((d&&d.error)||'Could not start payment. Try again.');
  }catch(e){ toast('Could not start payment — check your connection.'); }
  if(btn){ btn.disabled=false; btn.textContent='Pay'; }
}

/* Ask the server what actually settled. The browser never grants itself
   anything — a hand-typed ?paid= in the URL unlocks nothing. */
async function refreshPurchases(){
  if(!sb || !HF.userId) return 0;
  const before=Object.keys(_ent.skus).length + _ent.credits + (_ent.passUntil?1:0);
  try{
    const tk=await scanToken();
    if(tk) await fetch(PAY_STATUS,{headers:{'Authorization':'Bearer '+tk,'apikey':SUPA_KEY}});
  }catch(e){}
  await loadEntitlement();
  const after=Object.keys(_ent.skus).length + _ent.credits + (_ent.passUntil?1:0);
  return after>before ? 1 : 0;
}

/* Coming back from the gateway, the callback can take a few seconds. Poll
   briefly rather than telling the buyer it failed. */
function awaitPayment(){
  let tries=0;
  toast('Confirming your payment…');
  const t=setInterval(async ()=>{
    tries++;
    const got=await refreshPurchases();
    if(got || tries>=8){
      clearInterval(t);
      if(got){ toast('Payment confirmed — unlocked 🎉'); try{ renderStore(storeSeg); }catch(e){} }
      else toast('Not confirmed yet — it will unlock by itself once received.');
    }
  }, 3000);
}

/* Runs before auth so the marker survives an OAuth redirect. */
function capturePaidParam(){
  try{
    const sku=new URLSearchParams(location.search).get('paid');
    if(sku){ localStorage.setItem('hf_plus_pending', sku);
      history.replaceState(null,'',location.pathname+location.hash); }
  }catch(e){}
}
function handlePaidRedirect(){
  try{
    const sku=localStorage.getItem('hf_plus_pending');
    if(sku){ localStorage.removeItem('hf_plus_pending'); awaitPayment(); return; }
    refreshPurchases();
  }catch(e){}
}


/* ═══════════════ FIND MY PROGRAM ═══════════════
