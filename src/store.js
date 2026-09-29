/* ═══════════════ STORE · HITFAT+ membership ═══════════════
   HITFAT+ is a membership, bought for 6 or 12 months, in two tiers:

     HITFAT+        every program, session, the library, meal plans, AI scan
     HITFAT+ Coach  all of that, plus one T42 edition, a monthly coach
                    review and the members' WhatsApp group

   Anyone signed in sees the whole app — FitOn-style — and anything behind
   the membership shows a lock and opens the paywall. T42 is its own product
   and is never behind this: a T42 participant trains T42 without a
   membership. Personal tracking (the daily calorie target, logging meals by
   hand, weight and progress) stays open, because it is the member's own data.

   Bayarcash charges once, so a membership is paid up front and ends on a
   date; renewing adds to that date. Old purchases are honoured: All Access
   counts as HITFAT+ for good, a program bought on its own stays unlocked,
   and scan credits and passes keep working.

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
let _ent={skus:{}, credits:0, passUntil:null, plusUntil:null, coachUntil:null, loaded:false};

/* ── the membership ──
   Prices are the server's too (deploy/_shared/catalogue.ts); build.py
   refuses to ship if the two disagree. Change a price in both. */
const SUB_PLANS=[
  {sku:'sub_plus_12m',  tier:'plus',  months:12, days:365, price:249},
  {sku:'sub_plus_6m',   tier:'plus',  months:6,  days:183, price:149},
  {sku:'sub_coach_12m', tier:'coach', months:12, days:365, price:599},
  {sku:'sub_coach_6m',  tier:'coach', months:6,  days:183, price:349}
];
/* The coach's line and the members' group. The group link is set when it
   exists; until then the row is not shown. */
const COACH_WA='60176132170', COACH_GROUP_URL='';

function liveDate(d){ return !!(d && new Date(d)>new Date()); }
function hasCoach(){ return liveDate(_ent.coachUntil); }
function hasPlus(){ return hasCoach() || liveDate(_ent.plusUntil) || owns(BUNDLE_SKU); }
function memberTier(){ return hasCoach() ? 'coach' : hasPlus() ? 'plus' : null; }
/* The date access runs to, or null for All Access (which does not end). */
function memberUntil(){
  if(hasCoach()) return _ent.coachUntil;
  if(liveDate(_ent.plusUntil)) return _ent.plusUntil;
  return null;
}
function fmtDate(d){ return new Date(d).toLocaleDateString('en-MY',{day:'numeric',month:'short',year:'numeric'}); }

function owns(sku){ return !!_ent.skus[sku]; }
/* "Everything unlocked" — the membership, or the All Access bought before it. */
function ownsAll(){ return hasPlus(); }
/* Every program and session is part of the membership now, the ones that
   used to be free included. A program bought on its own before stays open. */
function ownsProgram(p){
  if(!p) return false;
  return hasPlus() || owns('prog_'+p.id);
}
function ownsBar(){ return owns('bar'); }

/* Free tier first, then a pass, then credits — cheapest for the user in
   that order, which is also the order the edge function checks. */
function scanAccess(){
  /* A member scans without limit: the membership is a pass on the server. */
  if(hasPlus() && memberUntil()) return {mode:'pass', label:'Unlimited with HITFAT+', left:Infinity};
  const used=scanUsed(), freeLeft=Math.max(0, SCAN_FREE_TIER-used);
  if(_ent.passUntil && new Date(_ent.passUntil)>new Date())
    return {mode:'pass', label:'Unlimited until '+new Date(_ent.passUntil).toLocaleDateString('en-MY',{day:'numeric',month:'short',year:'numeric'}), left:Infinity};
  if(freeLeft>0)   return {mode:'free',    label:freeLeft+' of '+SCAN_FREE_TIER+' free scans left this month', left:freeLeft};
  if(_ent.credits>0) return {mode:'credits', label:_ent.credits+' scan credit'+(_ent.credits>1?'s':'')+' left', left:_ent.credits};
  return {mode:'none', label:'No scans left — free resets next month', left:0};
}
function canScan(){ return scanAccess().left>0; }

async function loadEntitlement(){
  _ent={skus:{}, credits:0, passUntil:null, plusUntil:null, coachUntil:null, loaded:true};
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
        /* A membership is a pass too — the scan function already treats any
           live pass as unlimited scanning — and its SKU says which tier. */
        if(String(e.sku).indexOf('sub_coach')===0){
          if(!_ent.coachUntil || new Date(e.expires_at)>new Date(_ent.coachUntil)) _ent.coachUntil=e.expires_at;
        } else if(String(e.sku).indexOf('sub_plus')===0){
          if(!_ent.plusUntil || new Date(e.expires_at)>new Date(_ent.plusUntil)) _ent.plusUntil=e.expires_at;
        }
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
  renderStore(focus||'plans'); $('screen').scrollTop=0;
}
function closeStore(){
  if(typeof trSeg!=='undefined') trSeg=_storeBackSeg||'explore';
  switchTab('train');
}
let storeSeg='plans';
/* One page: the membership. Programs and scan packs are no longer sold on
   their own; the BAR tab returns with BAR_ENABLED. */
const STORE_SEGS=[['plans','Membership'],['bar','HITFAT BAR']]
  .filter(s=>BAR_ENABLED || s[0]!=='bar');
function setStoreSeg(s){ storeSeg=s; renderStore(s); $('screen').scrollTop=0; }

function renderStore(seg){
  storeSeg=seg||storeSeg;
  $('store-segs').innerHTML = STORE_SEGS.length>1 ? '<div class="segs">'+STORE_SEGS.map(s=>
    '<button class="seg'+(storeSeg===s[0]?' on':'')+'" onclick="setStoreSeg(\''+s[0]+'\')">'+s[1]+'</button>').join('')+'</div>' : '';
  if(storeSeg==='bar' && BAR_ENABLED) return storeBar();
  storeMembership();
}

function storePrograms(){
  const paid=PROGRAMS.filter(isPaidProgram);
  const mine=paid.filter(ownsProgram), rest=paid.filter(p=>!ownsProgram(p));
  let h=fqCard();

  if(!ownsAll()){
    h+='<div class="ecta" style="background:'+egrad('#2a1016','#0b0b0d','#EF4444')+';" onclick="openProduct(\''+BUNDLE_SKU+'\')">'+
       '<div class="ic">'+glyph('spark')+'</div><div class="t">Every program, one payment</div>'+
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
    '<div class="m">'+wks(p.weeks.length)+' · '+tot+' days · '+p.level+'</div>'+
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
    ].map(x=>'<div class="row" style="cursor:default;"><div class="ic">'+ic(x[0])+'</div>'+
      '<div style="flex:1;"><div style="font-size:15px;font-weight:600;color:var(--txt);">'+x[1]+'</div>'+
      '<div style="font-size:13px;color:var(--dim);margin-top:3px;">'+x[2]+'</div></div></div>').join('')+'</div>';
  $('store-body').innerHTML=h;
}

function storeBar(){
  const bp=PROGRAMS.filter(isBarProgram);
  let h='';
  h+='<div class="ecta" style="background:'+egrad('#1a1410','#0b0b0d','#FF8A1E')+';" onclick="openBarSite()">'+
     '<div class="ic">'+glyph('workout')+'</div><div class="t">HITFAT BAR</div>'+
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
    ].map(x=>'<div class="row" style="cursor:default;"><div class="ic">'+ic(x[0])+'</div>'+
      '<div style="flex:1;"><div style="font-size:15px;font-weight:600;color:var(--txt);">'+x[1]+'</div>'+
      '<div style="font-size:13px;color:var(--dim);margin-top:3px;">'+x[2]+'</div></div></div>').join('')+'</div>';
  h+='<button class="bigbtn" onclick="openBarSite()">Get the HITFAT BAR · RM'+BAR_PRICE+'</button>';
  $('store-body').innerHTML=h;
}
function openBarSite(){ try{ window.open(BAR_URL,'_blank','noopener'); }catch(e){ toast('Open '+BAR_URL); } }

/* ── product sheet ────────────────────────────────────────  */
let _prod=null;
function openProduct(sku){
  /* Programs, All Access and scan packs are part of the membership now.
     Every old way into a product sheet lands on the paywall instead. */
  if(sku===BUNDLE_SKU || String(sku).indexOf('prog_')===0 || String(sku).indexOf('scan_')===0){
    const p=String(sku).indexOf('prog_')===0 ? PROGRAMS.filter(x=>'prog_'+x.id===sku)[0] : null;
    return openPaywall(p ? p.name+' is part of HITFAT+.' : '');
  }
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
    sub=p.desc||(wks(p.weeks.length)+' of structured training, yours to keep.');
    bullets=[['📅',wks(p.weeks.length)+' · '+progDays(p)+' sessions','Follow it day by day'],
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
      '<div class="pwf"><div class="ic">'+ic(b[0])+'</div><div><div class="t">'+b[1]+'</div>'+
      '<div class="m">'+b[2]+'</div></div></div>').join('')+'</div>'+
    (sku.indexOf('prog_')===0 ? weekPhases(PROGRAMS.filter(x=>'prog_'+x.id===sku)[0]) : '')+
    '<div class="pwprice"><div class="p">RM'+price+'</div><div class="per">one payment</div></div>'+
    '<button class="bigbtn" onclick="startCheckout(\''+sku+'\')">'+cta+'</button>'+
    '<button class="authalt" onclick="closeProduct()">Not now</button>'+
    '<div class="pwfine">No subscription. Manual logging, your daily target, all single sessions'+(BAR_ENABLED?' and the HITFAT BAR programs':'')+' stay free.</div>';
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
  const item = SCAN_PRODUCTS.filter(x=>x.sku===sku)[0] || SUB_PLANS.filter(x=>x.sku===sku)[0];
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
function entSig(){ return JSON.stringify([Object.keys(_ent.skus).sort(), _ent.credits, _ent.passUntil, _ent.plusUntil, _ent.coachUntil]); }
async function refreshPurchases(){
  if(!sb || !HF.userId) return 0;
  const before=entSig();
  try{
    const tk=await scanToken();
    if(tk) await fetch(PAY_STATUS,{headers:{'Authorization':'Bearer '+tk,'apikey':SUPA_KEY}});
  }catch(e){}
  await loadEntitlement();
  const after=entSig();
  return after!==before ? 1 : 0;
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
      if(got){ toast('Payment confirmed — welcome to HITFAT+'); try{ renderStore(storeSeg); renderHome(); }catch(e){} }
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
    /* A T42 place is confirmed on its registration, not in the store's
       entitlements — T42 waits for it itself. */
    if(sku && sku.indexOf('t42:')===0 && typeof t42AwaitPayment==='function'){
      localStorage.removeItem('hf_plus_pending'); t42AwaitPayment(); return; }
    if(sku){ localStorage.removeItem('hf_plus_pending'); awaitPayment(); return; }
    refreshPurchases();
  }catch(e){}
}




/* ═══════════════ THE PAYWALL ═══════════════
   One sheet for every lock: the tier, what it includes, 12 or 6 months with
   the monthly figure beside each, and one button. The 12-month plan is the
   default and says why. Prices are real prices — nothing is struck through
   against a "regular" price nobody was ever charged. */
let pwTier='plus', pwSku='sub_plus_12m', pwReason='';

const TIER_INFO={
  plus:{name:'HITFAT+', line:'Everything in the app, for as long as you are a member.',
    perks:[['workout','Every program and session','Signature, strength, fat loss, recovery — '+PROGRAMS.filter(p=>p.weeks).length+' programs'],
           ['photo','AI meal scan','Photograph a plate, get calories and macros'],
           ['food','Meal plans up to 14 days','Malaysian menus, MDG 2020 and CPG MOH 2023'],
           ['play','Every movement, on video','The full exercise library, with the camera mirror']]},
  coach:{name:'HITFAT+ Coach', line:'The app, and a coach who checks in on you.',
    perks:[['check','Everything in HITFAT+','Every program, scan, meal plan and video'],
           ['trophy','One T42 challenge included','Claim a place in the next edition, no extra payment'],
           ['person','Monthly coach review','Your numbers, looked at by a HITFAT coach each month'],
           ['people','Members-only group','Questions answered, with the people training alongside you']]}
};
function subPlan(sku){ return SUB_PLANS.filter(x=>x.sku===sku)[0]; }
function perMonth(p){ return (p.price/p.months).toFixed(2).replace(/\.00$/,''); }

function openPaywall(reason){
  pwReason=reason||'';
  if(!subPlan(pwSku) || subPlan(pwSku).tier!==pwTier) pwSku='sub_'+pwTier+'_12m';
  $('pw-body').innerHTML=paywallHTML(true);
  $('pwm').classList.add('on');
}
function pwSetTier(t){ pwTier=t; pwSku='sub_'+t+'_12m'; repaintPaywall(); }
function pwSetPlan(sku){ pwSku=sku; repaintPaywall(); }
function repaintPaywall(){
  if($('pwm').classList.contains('on')) $('pw-body').innerHTML=paywallHTML(true);
  if($('store') && $('store').style.display==='block') storeMembership();
}
function pwBuy(){
  const p=subPlan(pwSku); if(!p) return;
  if(typeof sb==='undefined' || !sb || !HF.userId){ toast('Sign in first so we can add the membership to your account.'); return; }
  startCheckout(p.sku);
}

/* The membership offer, as a sheet (sheet=true) or inside the Store page. */
function paywallHTML(sheet){
  const info=TIER_INFO[pwTier], plans=SUB_PLANS.filter(x=>x.tier===pwTier);
  const chosen=subPlan(pwSku)||plans[0];
  let h='';
  if(sheet) h+='<div class="pwtop"><button class="pwx" aria-label="Close" onclick="closeProduct()">✕</button></div>';
  h+='<div class="sub-hero"><span class="sub-mark" aria-hidden="true"></span>'+
     '<div class="sub-h">'+(pwReason?'Unlock with HITFAT+':'Train with everything')+'</div>'+
     '<div class="sub-s">'+hesc(pwReason||info.line)+'</div></div>';
  h+='<div class="segs sub-tiers">'+
     '<button class="seg'+(pwTier==='plus'?' on':'')+'" onclick="pwSetTier(\'plus\')">HITFAT+</button>'+
     '<button class="seg'+(pwTier==='coach'?' on':'')+'" onclick="pwSetTier(\'coach\')">HITFAT+ Coach</button></div>';
  h+='<div class="sub-perks">'+info.perks.map(x=>
     '<div class="sub-perk">'+ic(x[0])+'<div><div class="t">'+x[1]+'</div><div class="m">'+x[2]+'</div></div></div>').join('')+'</div>';
  h+='<div class="sub-plans">'+plans.map(p=>{
       const on=p.sku===chosen.sku, best=p.months===12;
       const save=best ? Math.round((1-(p.price/12)/(plans.filter(x=>x.months===6)[0].price/6))*100) : 0;
       return '<button class="sub-plan'+(on?' on':'')+'" onclick="pwSetPlan(\''+p.sku+'\')">'+
         (best?'<span class="sub-best">Best value'+(save>0?' · save '+save+'%':'')+'</span>':'')+
         '<span class="sub-radio"></span>'+
         '<span class="sub-pl"><b>'+p.months+' months</b><small>RM'+perMonth(p)+' a month</small></span>'+
         '<span class="sub-pr">RM'+p.price+'</span></button>';
     }).join('')+'</div>';
  h+='<button class="bigbtn sub-cta" onclick="pwBuy()">Continue · RM'+chosen.price+'</button>';
  h+='<div class="sub-fine">One payment for '+chosen.months+' months — FPX or DuitNow. It does not renew by itself; '+
     'we remind you before it ends. '+(pwTier==='coach'?'Includes one T42 edition during your membership.':'T42 challenges are sold separately.')+'</div>';
  return h;
}

/* ── the Store page ── */
function storeMembership(){
  const t=memberTier(), until=memberUntil();
  let h='';
  if(t){
    h+='<div class="sub-status"><span class="sub-mark" aria-hidden="true"></span><div>'+
       '<div class="sub-status-t">'+(t==='coach'?'HITFAT+ Coach':'HITFAT+')+' member</div>'+
       '<div class="sub-status-s">'+(until?'Active until '+fmtDate(until):'All Access — yours for good')+'</div></div></div>';
    /* All Access never ends, so the only thing left to offer is the coach. */
    if(!until){ $('store-body').innerHTML=h+coachUpsell(); return; }
    if(t==='coach' && pwTier!=='coach'){ pwTier='coach'; pwSku='sub_coach_12m'; }
    h+='<div class="nhead"><div class="nhead-t">'+(t==='coach'?'Extend':'Extend, or add a coach')+'</div>'+
       '<div class="nhead-s">Added on to your current end date — nothing is lost by renewing early.</div></div>';
    $('store-body').innerHTML=h+paywallHTML(false);
    return;
  }
  h+=paywallHTML(false);
  h+='<div class="nhead"><div class="nhead-t">What is inside</div></div><div class="sub-inside">'+
     [[PROGRAMS.filter(p=>p.weeks).length,'programs'],[PROGRAMS.filter(p=>!p.weeks).length,'single sessions'],
      [libDB().length,'filmed movements'],['14','day meal plans']].map(x=>
     '<div><b>'+x[0]+'</b><span>'+x[1]+'</span></div>').join('')+'</div>';
  h+='<div class="nfoot">Your calorie target, meal log, weight and progress stay open without a membership. T42 participants train T42 either way.</div>';
  $('store-body').innerHTML=h;
}
function coachUpsell(){
  pwTier='coach'; if(!subPlan(pwSku)||subPlan(pwSku).tier!=='coach') pwSku='sub_coach_12m';
  return '<div class="nhead"><div class="nhead-t">Add a coach</div><div class="nhead-s">A monthly review, the members group and a T42 place.</div></div>'+paywallHTML(false);
}

/* ── the lock, wherever content is shown ── */
function lockTag(p){
  return (p && !ownsProgram(p)) ? '<span class="lockt" aria-label="HITFAT+">'+glyph('lock')+'</span>' : '';
}
/* Anything that plays: gated here, so every door is covered. T42 does not
   come through these — it plays its own day directly. */
function needPlus(reason){
  if(hasPlus()) return false;
  openPaywall(reason||'');
  return true;
}
