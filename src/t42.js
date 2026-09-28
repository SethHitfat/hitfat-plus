/* ═══════════════════════════════════════════════════════════════
   T42 · TRANSFORMATION 42 DAYS

   A challenge module inside HITFAT+, not an app beside it. It signs in
   with the account the user already has, plays its workouts through the
   player every other program uses, and takes payment through the same
   Bayarcash functions. What it does NOT share is state.

   Everything HITFAT+ knows about a user lives in one JSON blob in
   plus_data, written by the browser. That is right for a training diary
   and wrong for a competition: a blob the client owns is a blob the
   client can edit, and T42 hands out prizes. So every row this file reads
   comes from its own tables, and the one thing it never writes is a
   score — t42_scores is computed server-side and is read-only to the app.

   Phase 1 is here: entry, mode, track, the 60-second assessment,
   registration and baseline. The dashboard, the daily check-in and the
   leaderboard are Phase 2 and land against the same state object.

   Gym Duo is deliberately not finished. Its check-in, coach verification
   and InBody are what HITFAT Club already models, and the Club schema has
   not been run on this database yet. Rather than build a second QR and a
   second roster for a coach to keep in step by hand, Gym Duo registers
   interest and says so plainly.
   ═══════════════════════════════════════════════════════════════ */

var T42_MODES = [
  { id:'online_solo', name:'ONLINE SOLO', tag:'Train anywhere. Compete individually.',
    bullets:['Train anywhere, on your own schedule','Structured 42-day plan','Progress tracking and weekly review',
             'Online leaderboard','RUSH missions','Full app support'] },
  { id:'gym_duo', name:'GYM DUO', tag:'Train together. Finish together.',
    bullets:['Two partners, one team score','Face-to-face coaching at HITFAT HQ','Official InBody, baseline and final',
             'Gym check-in and attendance','Coach verification','Duo leaderboard'] }
];

var T42_TRACKS = [
  { id:'start',     name:'START',     line:'Build Habits. Get Active.',
    who:'Beginners, or anyone starting again after a long break.', icon:'📈' },
  { id:'transform', name:'TRANSFORM', line:'Burn Fat. Get Stronger.',
    who:'Fat loss and body composition. The most-taken track.', icon:'🔥' },
  { id:'perform',   name:'PERFORM',   line:'Higher Fitness. Greater You.',
    who:'Already training. Here for stamina, strength and fitness.', icon:'⚡' }
];

/* ── the 60-second assessment ──
   Six questions, and the honest framing matters: this recommends, it does
   not decide. Someone who trains four times a week may still want START
   because they are coming back from injury, and a quiz that overrules them
   is a quiz that loses them. */
var T42_QUIZ = [
  { q:'How often do you train right now?',
    a:[['Not at all',0],['Once or twice a month',1],['1–2 times a week',2],['3+ times a week',4]] },
  { q:'How would you describe your last three months?',
    a:[['Mostly inactive',0],['On and off',1],['Fairly consistent',3],['Training hard',4]] },
  { q:'Can you complete 20 minutes of continuous exercise?',
    a:[['Not yet',0],['With breaks',1],['Yes, comfortably',3],['Easily, and more',4]] },
  { q:'What matters most to you over these 42 days?',
    a:[['Building the habit',0],['Losing fat',2],['Losing fat and getting stronger',3],['Getting fitter and faster',4]] },
  { q:'Any injury or condition that limits training?',
    a:[['Yes, significantly',0],['Something minor',2],['Nothing',3]] },
  { q:'How many days a week can you realistically train?',
    a:[['1–2',0],['3',2],['4',3],['5 or more',4]] }
];


/* ═══════════════════════════════════════════════════════════════
   State
   ═══════════════════════════════════════════════════════════════ */

var t42View='landing';          // landing | mode | track | assess | baseline | joined
var t42BaseTab='basic';         // basic | photos | physical
var t42Quiz={i:0, score:0, answers:[]};

var T42 = {
  state:'idle',                 // idle | loading | ready | nosetup | error
  challenge:null,               // the open edition, or null if none is running
  reg:null,                     // my t42_registrations row, or null
  baseline:null,                // my phase='baseline' measurement, or null
  mid:null,                     // the day-21 checkpoint, or null
  final:null,                   // the day-39 assessment, or null
  err:null,

  /* The running challenge. Loaded only once the edition has begun — before
     day 1 there is no workout to assign and no day to check in against. */
  week:null,                    // the t42_weeks row for the week we are in
  planDay:null,                 // today's t42_plan_days row, or null for a rest day
  today:null,                   // today's t42_daily_checkins row, or null
  doneToday:null,               // today's t42_workout_completions row, or null
  checkins:[],                  // every check-in this edition, newest first
  completions:[],               // every workout logged this edition
  score:null,                   // my t42_scores row — written by the server only
  reviews:[],                   // my t42_weekly_reviews rows, oldest first
  certs:[],                     // my t42_certificates — issued by the server only
  duo:null,                     // my t42_duos row {id, code, locked_at}, or null
  duoCard:[],                   // t42_duo_card(): me first, then my partner
  duoScore:null,                // my duo's t42_duo_scores row
  past:null,                    // {challenge, reg} of a finished edition beside an open one

  isJoined(){ return !!this.reg; },
  /* Baseline is complete when it exists AND carries the three numbers the
     score is computed from. A row with a weight and no waist would let
     someone into the leaderboard with half a starting point. */
  hasBaseline(){
    var b=this.baseline;
    return !!(b && b.weight_kg!=null && b.waist_cm!=null && b.height_cm!=null);
  },
  dayNo(){
    var c=this.challenge; if(!c) return 0;
    var start=t42Date(c.starts_on); if(!start) return 0;
    var today=new Date(); today.setHours(0,0,0,0);
    if(today<start) return 0;                               // not begun: a countdown, not day 1
    var n=Math.floor((today-start)/86400000)+1;
    return Math.min(c.total_days||42, n);
  },
  daysTo(){
    var c=this.challenge; if(!c) return 0;
    var start=t42Date(c.starts_on); if(!start) return 0;
    var today=new Date(); today.setHours(0,0,0,0);
    return Math.max(0, Math.round((start-today)/86400000));
  },

  weekNo(){ var d=this.dayNo(); return d>0 ? Math.ceil(d/7) : 0; },

  /* Real days since the start, not capped at 42. dayNo() stops at the last
     day on purpose — every screen wants "Day 42 of 42" after the end — but
     whether the challenge is OVER needs the uncapped count. */
  rawDay(){
    var c=this.challenge; if(!c) return 0;
    var start=t42Date(c.starts_on); if(!start) return 0;
    var today=new Date(); today.setHours(0,0,0,0);
    if(today<start) return 0;
    return Math.floor((today-start)/86400000)+1;
  },
  isOver(){ return this.rawDay() > ((this.challenge&&this.challenge.total_days)||42); },
  isComplete(){ return !!(this.challenge && this.challenge.status==='complete'); },

  isGym(){ return !!(this.reg && this.reg.mode==='gym_duo'); },
  /* Pairs form and break until the baseline closes, then they are fixed —
     the same window t42_duo_window_open() enforces on the server. */
  duoWindowOpen(){
    var c=this.challenge; if(!c) return false;
    if(c.status!=='registration' && c.status!=='running') return false;
    return this.rawDay() <= this.lockDay();
  },

  /* The duo, for a gym participant who is in one. The partner is reached
     only through t42_duo_card(): their own rows are closed to me, and the
     card carries percentages and ticks, never their kilograms or photos. */
  async loadDuo(){
    this.duo=null; this.duoCard=[]; this.duoScore=null;
    if(!this.reg || this.reg.mode!=='gym_duo' || !this.reg.duo_id) return;
    var d=await Promise.all([
      sb.from('t42_duos').select('id,code,team_name,locked_at').eq('id',this.reg.duo_id).maybeSingle(),
      sb.rpc('t42_duo_card',{p_registration:this.reg.id}),
      sb.from('t42_duo_scores').select('*').eq('duo_id',this.reg.duo_id).maybeSingle()
    ]);
    this.duo      = d[0].error ? null : (d[0].data||null);
    this.duoCard  = d[1].error ? []   : (d[1].data||[]);
    this.duoScore = d[2].error ? null : (d[2].data||null);
  },

  /* Everything that hangs off my registration. */
  async loadReg(){
    if(!this.reg){ this.baseline=null; this.mid=null; this.final=null;
                   this.t42ClearDay(); this.certs=[]; return; }
    var ms=await sb.from('t42_measurements').select('*')
      .eq('registration_id',this.reg.id);
    /* A measurement table that is not there yet must not cost someone
       their registration screen. */
    var all=(ms.error?[]:ms.data)||[];
    this.baseline=t42Phase(all,'baseline');
    this.mid     =t42Phase(all,'mid');
    this.final   =t42Phase(all,'final');
    var ce=await sb.from('t42_certificates').select('*')
      .eq('registration_id',this.reg.id).order('created_at',{ascending:true});
    this.certs=(ce.error?[]:ce.data)||[];
    await this.loadDuo();
    await this.loadDay();
  },

  t42ClearDay(){
    this.week=null; this.planDay=null; this.today=null; this.doneToday=null;
    this.checkins=[]; this.completions=[]; this.score=null; this.reviews=[];
  },

  /* The same rules the database enforces in 24-t42-scoring.sql, read from
     the same config. The server refuses a baseline edited on day 4 whatever
     the app does; the app knowing the rule is what stops someone filling in
     a form only to be told no. */
  lockDay(){
    var cfg=(this.challenge&&this.challenge.config)||{};
    return cfg.baseline_lock_day!=null ? cfg.baseline_lock_day : 3;
  },
  fitLockDay(){
    var cfg=(this.challenge&&this.challenge.config)||{};
    return cfg.baseline_fitness_lock_day!=null ? cfg.baseline_fitness_lock_day : 7;
  },
  regOpen(){
    var c=this.challenge; if(!c) return false;
    if(c.status!=='registration' && c.status!=='running') return false;
    if(c.reg_closes_on){
      var cl=t42Date(c.reg_closes_on), t=new Date(); t.setHours(0,0,0,0);
      if(cl && t>cl) return false;
    }
    return true;
  },

  /* The day's five questions, asked at once. Five awaits in a row is five
     round trips on a phone holding one bar of signal in a gym. */
  async loadDay(){
    var day=this.dayNo();
    if(!day || !this.reg){ this.t42ClearDay(); return; }
    var wk=this.weekNo();
    var r=await Promise.all([
      sb.from('t42_weeks').select('*')
        .eq('challenge_id',this.challenge.id).eq('week_no',wk).maybeSingle(),
      sb.from('t42_plan_days').select('*')
        .eq('challenge_id',this.challenge.id).eq('track',this.reg.track)
        .eq('day_no',day).maybeSingle(),
      sb.from('t42_daily_checkins').select('*')
        .eq('registration_id',this.reg.id).order('day_no',{ascending:false}).limit(60),
      sb.from('t42_workout_completions').select('*')
        .eq('registration_id',this.reg.id).order('day_no',{ascending:false}).limit(60),
      sb.from('t42_scores').select('*').eq('registration_id',this.reg.id).maybeSingle(),
      sb.from('t42_weekly_reviews').select('*')
        .eq('registration_id',this.reg.id).order('week_no',{ascending:true})
    ]);
    /* Each of these is allowed to be missing. A database that has had 20-
       run but not 21- has no weeks and no plan, and that should cost the
       member a heading and a workout — not the whole dashboard. */
    this.week     = r[0].error ? null : (r[0].data||null);
    this.planDay  = r[1].error ? null : (r[1].data||null);
    this.checkins = r[2].error ? [] : (r[2].data||[]);
    this.completions = r[3].error ? [] : (r[3].data||[]);
    this.score    = r[4].error ? null : (r[4].data||null);
    this.reviews  = r[5].error ? [] : (r[5].data||[]);
    this.today    = this.checkins.filter(function(c){ return c.day_no===day; })[0]||null;
    this.doneToday= this.completions.filter(function(c){ return c.day_no===day; })[0]||null;
  },

  /* Consecutive days ending today or yesterday. Yesterday counts because a
     streak that dies at midnight punishes the person who trains at 9pm and
     checks in the next morning — and HITFAT+ already counts it that way. */
  streak(){
    var day=this.dayNo(); if(!day) return 0;
    var have={}; this.checkins.forEach(function(c){ have[c.day_no]=1; });
    var from = have[day] ? day : (have[day-1] ? day-1 : 0);
    if(!from) return 0;
    var n=0; while(from>0 && have[from]){ n++; from--; }
    return n;
  },

  /* Out of the days that have actually happened, not out of 42. Someone on
     day 3 who has checked in three times is at 100%, not 7%. */
  consistency(){
    var day=this.dayNo(); if(!day) return 0;
    return Math.round((Math.min(this.checkins.length,day)/day)*100);
  },

  /* Against what the PLAN asked for, which only the server can see in full
     — START trains three days a week and doing all three is 100%, not 43%.
     Until the scorer has run, the app's own count against elapsed days is
     the best it has, and it is only ever an underestimate. */
  workoutPct(){
    if(this.score && this.score.workout_pct!=null) return Math.round(Number(this.score.workout_pct));
    var day=this.dayNo(); if(!day) return 0;
    return Math.round((Math.min(this.completions.length,day)/day)*100);
  },

  stepTarget(){
    if(this.week && this.week.step_target) return this.week.step_target;
    var cfg=(this.challenge&&this.challenge.config)||{};
    return cfg.step_target||8000;
  },
  waterTarget(){
    var cfg=(this.challenge&&this.challenge.config)||{};
    return cfg.water_target_ml||2000;
  },

  async uid(){
    try{ var r=await sb.auth.getSession();
      return (r&&r.data&&r.data.session&&r.data.session.user.id)||null; }
    catch(e){ return null; }
  },

  async load(force){
    if(this.state==='loading') return;
    if(this.state==='ready' && !force) return;
    if(!sb || !SUPA_READY){ this.state='nosetup'; return; }
    var uid=await this.uid();
    if(!uid){ this.state='nosetup'; return; }
    this.state='loading'; this.err=null;
    try{
      /* The open edition. More than one can exist — November's is archived
         while Ramadan's is in registration — so the app asks for the one
         accepting people, newest first, rather than assuming a single row. */
      var ch=await t42OpenEdition();
      if(t42SchemaMissing(ch.error)){ this.state='nosetup'; return; }
      if(ch.error) throw ch.error;
      this.challenge=ch.data||null;
      this.reg=null; this.past=null;

      if(this.challenge){
        var rg=await sb.from('t42_registrations').select('*')
          .eq('challenge_id',this.challenge.id).eq('user_id',uid).maybeSingle();
        if(rg.error) throw rg.error;
        this.reg=rg.data||null;
      }

      /* A finished edition is not "open", so the query above never returns
         it — and without this, the day the results came out would be the
         day the member lost sight of them. If they are not in the open
         edition, find the last one they finished. With no open edition it
         becomes the screen; with one, it sits beside the invitation. */
      if(!this.reg){
        var pr=await sb.from('t42_registrations')
          .select('*, t42_challenges!inner('+t42ChallengeCols()+')')
          .eq('user_id',uid).eq('t42_challenges.status','complete')
          .order('joined_at',{ascending:false}).limit(1);
        var row=(!pr.error && pr.data && pr.data[0]) || null;
        if(row){
          var pc=row.t42_challenges; delete row.t42_challenges;
          if(!this.challenge){ this.challenge=pc; this.reg=row; }
          else this.past={challenge:pc, reg:row};
        }
      }

      /* Every edition this account has been part of — the T42 Journey. A
         failure here costs the journey list, never the screen they came for. */
      try{ await this.loadHistory(uid); }catch(e){ this.history=[]; }

      if(!this.challenge){ this.baseline=null; this.mid=null; this.final=null;
                           this.t42ClearDay(); this.state='ready'; return; }
      await this.loadReg();
      this.state='ready';
    }catch(e){
      if(t42SchemaMissing(e)){ this.state='nosetup'; return; }
      this.err=(e&&e.message)||'Could not reach T42 right now.';
      this.state='error';
    }
  }
};

/* Same lesson the Club had to learn: going through supabase-js it is
   PostgREST that answers a missing table, out of its own schema cache, and
   it does not say "does not exist". Matching only Postgres' 42P01 means the
   setup state is never recognised and a user reads a cache message. */
function t42SchemaMissing(e){
  if(!e) return false;
  var c=e.code||'';
  if(c==='42P01'||c==='PGRST205'||c==='PGRST202') return true;
  return /does not exist|schema cache/i.test(e.message||'');
}

function t42Esc(s){
  return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function t42Date(iso){
  if(!iso) return null;
  var d=new Date(String(iso).slice(0,10)+'T00:00:00');
  return isNaN(d.getTime())?null:d;
}
function t42Track(id){
  for(var i=0;i<T42_TRACKS.length;i++) if(T42_TRACKS[i].id===id) return T42_TRACKS[i];
  return null;
}
function t42Mode(id){
  for(var i=0;i<T42_MODES.length;i++) if(T42_MODES[i].id===id) return T42_MODES[i];
  return null;
}


/* ═══════════════════════════════════════════════════════════════
   The join draft

   Someone who picks a mode, picks a track and then loses signal should not
   come back to an empty first screen. The draft is kept on the device only
   — nothing here is a registration until the row is written.
   ═══════════════════════════════════════════════════════════════ */

var T42_DRAFT_KEY='t42_draft_v1';
var t42Draft={mode:null, track:null, gender:null, consent:false};

function t42DraftLoad(){
  try{
    var r=localStorage.getItem(T42_DRAFT_KEY);
    var o=r?JSON.parse(r):null;
    if(o && typeof o==='object'){
      t42Draft={ mode:o.mode||null, track:o.track||null,
                 gender:o.gender||null, consent:!!o.consent };
    }
  }catch(e){ /* a corrupt draft is no draft */ }
}
function t42DraftSave(){
  try{ localStorage.setItem(T42_DRAFT_KEY, JSON.stringify(t42Draft)); }catch(e){}
}
function t42DraftClear(){
  t42Draft={mode:null, track:null, gender:null, consent:false};
  try{ localStorage.removeItem(T42_DRAFT_KEY); }catch(e){}
}


/* ═══════════════════════════════════════════════════════════════
   Shell
   ═══════════════════════════════════════════════════════════════ */

function t42Paint(){
  var el=$('t42-body'); if(!el) return;
  var busy=t42StateCard();
  if(busy){ el.innerHTML=busy; return; }
  if(t42Gate()) return;                       // unpaid, or the edition has closed
  if(t42View==='pay')      return t42RenderPay();
  if(t42View==='ended')    return t42RenderEnded();
  if(t42View==='journey')  return t42RenderJourney();
  if(t42View==='rules')    return t42RenderRules();
  if(t42View==='mode')     return t42RenderMode();
  if(t42View==='track')    return t42RenderTrack();
  if(t42View==='assess')   return t42RenderAssess();
  if(t42View==='baseline') return t42RenderBaseline();
  if(t42View==='joined')   return t42RenderJoined();
  if(t42View==='dash')     return t42RenderDash();
  if(t42View==='checkin')  return t42RenderCheckin();
  if(t42View==='train')    return t42RenderTrain();
  if(t42View==='progress') return t42RenderProgress();
  if(t42View==='measure')  return t42RenderMeasure();
  if(t42View==='fitness')  return t42RenderFitness();
  if(t42View==='review')   return t42RenderReview();
  if(t42View==='rank')     return t42RenderRank();
  if(t42View==='final')    return t42RenderFinal();
  if(t42View==='result')   return t42RenderResult();
  if(t42View==='cert')     return t42RenderCert();
  if(t42View==='next')     return t42RenderNext();
  if(t42View==='duo')      return t42RenderDuo();
  return t42RenderLanding();
}

/* The segment bar only belongs to a participant in a running edition.
   Before that there is nothing to segment — the onboarding is a wizard,
   and a nav bar above it would offer three tabs that all refuse. */
function t42Segs(){
  var bar=$('t42-segs'); if(!bar) return;
  /* Past the baseline lock, a member without one still gets the tabs —
     they can train and check in, they just are not ranked. */
  var on = T42.state==='ready' && T42.isJoined() && T42.dayNo()>0 &&
           T42.entitled() && T42.accessOpen() &&
           (T42.hasBaseline() || T42.dayNo()>T42.lockDay());
  bar.style.display = on ? 'flex' : 'none';
  if(!on || !bar.children) return;
  var v=t42View;
  if(v==='measure'||v==='fitness'||v==='review') v='progress';
  if(v==='final'||v==='result'||v==='cert'||v==='next'||v==='duo') v='dash';
  var live=null;
  Array.prototype.forEach.call(bar.children,function(b){
    var on=b.getAttribute('data-seg')===v;
    b.classList.toggle('on', on);
    if(on) live=b;
  });
  /* The bar scrolls — four tabs do not fit a 375px phone and Rank will make
     five. Tapping a tab you can see is fine; the problem is the app moving
     you itself, after a check-in or a finished workout, to a tab sitting off
     the right edge. Then the highlight is somewhere you cannot see. */
  if(live && typeof live.scrollIntoView==='function'){
    try{ live.scrollIntoView({block:'nearest', inline:'nearest'}); }catch(e){}
  }
}

function t42StateCard(){
  if(T42.state==='loading'||T42.state==='idle')
    return '<div class="acard"><div class="sub">Loading T42…</div></div>';
  if(T42.state==='nosetup')
    return '<div class="acard"><div class="ah">'+ic('calendar')+'<div class="t">Not open yet</div></div>'+
      '<div class="sub" style="margin-top:3px;">T42 is not running on this account yet. '+
      'Watch this space — the next edition will appear here.</div></div>';
  if(T42.state==='error')
    return '<div class="acard"><div class="ah">'+ic('warning')+'<div class="t">Could not load T42</div></div>'+
      '<div class="sub" style="margin-top:3px;">'+t42Esc(T42.err)+'</div>'+
      '<button class="bigbtn sec" onclick="t42Reload()">Try again</button></div>';
  return null;
}

function openT42(){
  hidePanels(); $('t42').style.display='block'; $('screen').scrollTop=0;
  t42DraftLoad();
  t42CkReady=false;
  /* Resume BEFORE the first paint when the state is already loaded. Opening
     on the landing hero and correcting it when the promise settles meant a
     member walking back from a finished workout saw "JOIN T42" flash at
     them — an invitation to join what they are already eighteen days into. */
  if(T42.state==='ready') t42Resume(); else t42View='landing';
  t42Paint(); t42Segs();
  T42.load().then(function(){ t42Resume(); t42Paint(); t42Segs(); });
}

/* Where someone lands depends on how far they got last time. A participant
   who has registered but never filled a baseline should open on the
   baseline, not on a hero that invites them to join something they are
   already in. */
function t42Resume(){
  if(T42.state!=='ready') return;
  /* The edition has closed for this participant: history, not programme. */
  if(T42.isJoined() && !T42.accessOpen()){ t42View='ended'; return; }
  /* Signed up, not paid: the one thing left to do. */
  if(T42.isJoined() && T42.needsPayment() && T42.hasBaseline()){ t42View='pay'; return; }
  /* The results are out: that is the only screen that matters now. */
  if(T42.isJoined() && T42.isComplete()){ t42View='result'; return; }
  /* No baseline, but only while one can still be given. After the lock,
     the baseline form would be a form the server refuses — so the member
     goes to the dashboard, which says plainly why they are not ranked. */
  if(T42.isJoined() && !T42.hasBaseline() && T42.dayNo()<=T42.lockDay()){ t42View='baseline'; return; }
  /* Once the edition is running, the dashboard is the screen. A registered
     member on day 18 opening onto a hero that says JOIN is being shown the
     one thing they no longer need. */
  if(T42.isJoined() && T42.dayNo()>0){ t42View='dash'; return; }
  if(T42.isJoined()){ t42View='joined'; return; }
  t42View='landing';
}

function t42Go(v){
  /* Leaving the check-in throws away the half-filled form. It is rebuilt
     from the saved row next time, so an abandoned edit does not quietly
     become the answer two screens later. */
  if(t42View==='checkin' && v!=='checkin') t42CkReady=false;
  t42View=v; t42Paint(); t42Segs(); $('screen').scrollTop=0;
}
function t42Reload(){ T42.load(true).then(function(){ t42Paint(); t42Segs(); }); }

/* Named wrappers, because build.py checks that every onclick resolves to a
   real function and a bare T42.method would slip past it. */
function t42GoLanding(){ t42Go('landing'); }
function t42GoMode(){ t42Go('mode'); }
function t42GoTrack(){ t42Go('track'); }
function t42GoBaseline(){ t42Go('baseline'); }
function t42GoDash(){ t42Go('dash'); }
function t42GoCheckin(){ t42Go('checkin'); }
function t42GoTrain(){ t42Go('train'); }
function t42GoProgress(){ t42Go('progress'); }
function t42GoRank(){ t42Go('rank'); }
function t42GoFinal(){ t42Go('final'); }
function t42GoResult(){ t42Go('result'); }
function t42GoCert(){ t42Go('cert'); }
function t42GoNext(){ t42Go('next'); }
function t42GoDuo(){ t42Go('duo'); }
function t42GoPhotos(){ t42ProgTab='photos'; t42Go('progress'); }


/* ═══════════════════════════════════════════════════════════════
   01 · Landing
   ═══════════════════════════════════════════════════════════════ */

function t42RenderLanding(){
  var el=$('t42-body'); if(!el) return;
  var c=T42.challenge;

  if(!c){
    el.innerHTML=t42Hero()+
      '<div class="acard"><div class="ah">'+ic('calendar')+'<div class="t">No edition open</div></div>'+
      '<div class="sub" style="margin-top:3px;">There is no T42 running right now. '+
      'The next one will show up here the moment registration opens.</div></div>';
    return;
  }

  var joined=T42.isJoined();
  var when=t42WhenLine(c);
  var h=t42Hero();

  /* The edition itself: its name, its dates, and — once there is one — its
     price. A challenge is sold on a starting line, so the dates come first. */
  h+='<div class="t42-ed"><div class="t42-ed-n">'+t42Esc((c.name||'').toUpperCase())+'</div>'+
     (c.subtitle?'<div class="t42-ed-s">'+t42Esc(c.subtitle)+'</div>':'')+
     '<div class="t42-grid">'+t42Stat('Challenge starts', t42LongDate(c.starts_on))+
     t42Stat('Challenge ends', t42LongDate(c.ends_on))+'</div>'+
     (T42.price() && !joined ? '<div class="t42-ed-p">RM'+T42.price()+' · this edition only</div>' : '')+
     '</div>';

  h+='<div class="t42-when">'+t42Esc(when)+'</div>';

  if(joined){
    var tr=t42Track(T42.reg.track);
    h+='<div class="acard"><div class="ah">'+ic('check')+'<div class="t">You are in</div></div>'+
      '<div class="sub" style="margin-top:3px;">'+
      t42Esc((t42Mode(T42.reg.mode)||{}).name||'')+' · '+t42Esc((tr||{}).name||'')+'</div>'+
      '<button class="bigbtn" onclick="t42Continue()">Continue</button></div>';
  } else if(T42.regOpen()){
    h+='<button class="bigbtn" onclick="t42Begin()">Join T42</button>';
  } else {
    h+='<div class="acard"><div class="ah">'+ic('lock')+'<div class="t">Registration closed</div></div>'+
       '<div class="sub">This edition is no longer taking new participants. '+
       'The next one will open here.</div></div>';
  }

  if(T42.past && T42.past.challenge){
    h+='<div class="acard" onclick="t42OpenPast()" style="cursor:pointer;">'+
       '<div class="ah">'+ic('trophy')+'<div class="t">Your '+t42Esc(T42.past.challenge.edition||T42.past.challenge.name)+
       ' result</div><div class="c">›</div></div>'+
       '<div class="sub">Your result and certificate from the last T42.</div></div>';
  }

  /* The two experiences, shown before the choice is asked for. Someone
     deciding whether to join at all needs to know a gym option exists. */
  var modes=T42_MODES.filter(function(m){ return T42.offers('modes',m.id); });
  if(modes.length>1){
    h+='<div class="sechead">Two ways to do it</div><div class="t42-modes">';
    modes.forEach(function(m){
      h+='<div class="t42-mini"><div class="t42-mini-n">'+t42Esc(m.name)+'</div>'+
         '<div class="t42-mini-t">'+t42Esc(m.tag)+'</div></div>';
    });
    h+='</div>';
  }

  h+='<div class="sechead">The tracks</div>';
  T42_TRACKS.filter(function(t){ return T42.offers('tracks',t.id); }).forEach(function(t){
    h+='<div class="t42-trackrow"><span class="t42-trackicon">'+glyph(t.icon)+'</span>'+
       '<div><div class="t42-trackn">'+t42Esc(t.name)+'</div>'+
       '<div class="t42-q">'+t42Esc(t.line)+'</div></div></div>';
  });

  h+='<button class="bigbtn sec" onclick="t42GoRules()">How T42 works</button>';
  if((T42.history||[]).length)
    h+='<button class="bigbtn sec" onclick="t42GoJourney()">My T42 Journey</button>';

  el.innerHTML=h;
}

function t42Hero(){
  return '<div class="t42-hero">'+
    '<div class="t42-logo">T42</div>'+
    '<div class="t42-sub">TRANSFORMATION 42 DAYS</div>'+
    '<div class="t42-by">HITFAT</div>'+
    '<div class="t42-line">42 Days. One Journey. A Stronger You.</div></div>';
}

/* What the dates mean today, in one sentence. "Starts 3 Nov" is a fact;
   "Starts in 9 days" is the thing someone actually wants to know. */
function t42WhenLine(c){
  var d=T42.daysTo(), day=T42.dayNo();
  if(c.status==='registration'||day===0){
    if(d===0) return 'Starts today';
    if(d===1) return 'Starts tomorrow';
    return 'Starts in '+d+' days';
  }
  if(c.status==='complete') return 'This edition has finished';
  return 'Day '+day+' of '+(c.total_days||42);
}

function t42Begin(){
  if(!T42.challenge){ toast('No T42 edition is open'); return; }
  if(!T42.regOpen()){ toast('Registration for this T42 is closed'); return; }
  t42DraftLoad();
  /* An edition with one mode (November 2026: online only) has no choice to
     ask for — and a draft left over from an edition that offered Gym Duo
     must not carry it into one that does not. */
  var modes=T42_MODES.filter(function(m){ return T42.offers('modes',m.id); });
  if(t42Draft.mode && !T42.offers('modes',t42Draft.mode)) t42Draft.mode=null;
  if(t42Draft.track && !T42.offers('tracks',t42Draft.track)) t42Draft.track=null;
  if(modes.length===1){ t42Draft.mode=modes[0].id; t42DraftSave(); }
  t42Go(t42Draft.mode ? 'track' : 'mode');
}
function t42Continue(){
  if(!T42.hasBaseline()) return t42Go('baseline');
  t42Go('joined');
}


/* ═══════════════════════════════════════════════════════════════
   03 · Mode
   ═══════════════════════════════════════════════════════════════ */

function t42RenderMode(){
  var el=$('t42-body'); if(!el) return;
  var h='<div class="hgroup"><div class="k">Step 1 of 3</div><h2>Choose your mode</h2>'+
        '<p>Same challenge. Different experience.</p></div>';

  T42_MODES.filter(function(m){ return T42.offers('modes',m.id); }).forEach(function(m){
    var on=t42Draft.mode===m.id;
    h+='<div class="t42-card'+(on?' on':'')+'" onclick="t42PickMode(\''+m.id+'\')">'+
       '<div class="t42-card-h"><div class="t42-card-n">'+t42Esc(m.name)+'</div>'+
       '<div class="t42-radio'+(on?' on':'')+'"></div></div>'+
       '<div class="t42-card-t">'+t42Esc(m.tag)+'</div><ul class="t42-bul">'+
       m.bullets.map(function(b){ return '<li>'+t42Esc(b)+'</li>'; }).join('')+
       '</ul></div>';
  });

  /* Said before the choice, not after it: Gym Duo means turning up in
     Kota Bharu, with a partner, and that is worth knowing before step 2. */
  if(T42.offers('modes','gym_duo'))
  h+='<div class="t42-note">Gym Duo is trained at HITFAT HQ in Kota Bharu. You pair with '+
     'one partner of the same gender on the same track, you check in at the gym by QR, '+
     'and your body fat is measured on the gym\'s InBody at the start and the end.</div>';

  h+='<button class="bigbtn'+(t42Draft.mode?'':' off')+'" onclick="t42ModeNext()">Next</button>'+
     '<button class="bigbtn sec" onclick="t42GoLanding()">Back</button>';
  el.innerHTML=h;
}

function t42PickMode(m){ t42Draft.mode=m; t42DraftSave(); t42RenderMode(); }
function t42ModeNext(){
  if(!t42Draft.mode){ toast('Pick a mode first'); return; }
  t42Go('track');
}


/* ═══════════════════════════════════════════════════════════════
   04 · Track
   ═══════════════════════════════════════════════════════════════ */

function t42RenderTrack(){
  var el=$('t42-body'); if(!el) return;
  var oneMode=T42_MODES.filter(function(m){ return T42.offers('modes',m.id); }).length===1;
  var h='<div class="hgroup"><div class="k">'+(oneMode?'Step 1 of 2':'Step 2 of 3')+'</div><h2>Choose your track</h2>'+
        '<p>Different goals. Same 42 days. Which track is for you?</p></div>';

  T42_TRACKS.filter(function(t){ return T42.offers('tracks',t.id); }).forEach(function(t){
    var on=t42Draft.track===t.id;
    h+='<div class="t42-card'+(on?' on':'')+'" onclick="t42PickTrack(\''+t.id+'\')">'+
       '<div class="t42-card-h"><span class="t42-trackicon">'+glyph(t.icon)+'</span>'+
       '<div class="t42-card-n">'+t42Esc(t.name)+'</div>'+
       '<div class="t42-radio'+(on?' on':'')+'"></div></div>'+
       '<div class="t42-card-t">'+t42Esc(t.line)+'</div>'+
       '<div class="t42-q">'+t42Esc(t.who)+'</div></div>';
  });

  h+='<div class="acard"><div class="ah">'+ic('compass')+'<div class="t">Not sure which track?</div></div>'+
     '<div class="sub" style="margin-top:3px;">Six questions, about a minute. '+
     'It recommends — you still choose.</div>'+
     '<button class="bigbtn sec" onclick="t42StartAssess()">Take the Assessment</button></div>';

  h+='<button class="bigbtn'+(t42Draft.track?'':' off')+'" onclick="t42TrackNext()">Next</button>'+
     '<button class="bigbtn sec" onclick="'+(oneMode?'t42GoLanding()':'t42GoMode()')+'">Back</button>';
  el.innerHTML=h;
}

function t42PickTrack(t){ t42Draft.track=t; t42DraftSave(); t42RenderTrack(); }
function t42TrackNext(){
  if(!t42Draft.track){ toast('Pick a track first'); return; }
  t42Go('baseline');
}


/* ═══════════════════════════════════════════════════════════════
   The 60-second assessment
   ═══════════════════════════════════════════════════════════════ */

function t42StartAssess(){ t42Quiz={i:0, score:0, answers:[]}; t42Go('assess'); }

function t42RenderAssess(){
  var el=$('t42-body'); if(!el) return;

  if(t42Quiz.i>=T42_QUIZ.length) return t42RenderAssessResult();

  var q=T42_QUIZ[t42Quiz.i];
  var pct=Math.round((t42Quiz.i/T42_QUIZ.length)*100);
  var h='<div class="hgroup"><div class="k">Question '+(t42Quiz.i+1)+' of '+T42_QUIZ.length+'</div>'+
        '<h2>'+t42Esc(q.q)+'</h2></div>'+
        '<div class="pbar"><i style="width:'+pct+'%"></i></div>';

  q.a.forEach(function(a,idx){
    h+='<button class="t42-opt" onclick="t42Answer('+idx+')">'+t42Esc(a[0])+'</button>';
  });

  h+='<button class="bigbtn sec" onclick="t42AssessBack()">Back</button>';
  el.innerHTML=h;
}

function t42Answer(idx){
  var q=T42_QUIZ[t42Quiz.i]; if(!q||!q.a[idx]) return;
  t42Quiz.answers[t42Quiz.i]=idx;
  t42Quiz.score+=q.a[idx][1];
  t42Quiz.i++;
  t42RenderAssess();
  $('screen').scrollTop=0;
}

function t42AssessBack(){
  if(t42Quiz.i===0) return t42Go('track');
  t42Quiz.i--;
  var prev=t42Quiz.answers[t42Quiz.i];
  var q=T42_QUIZ[t42Quiz.i];
  if(prev!=null && q && q.a[prev]) t42Quiz.score-=q.a[prev][1];
  t42RenderAssess();
}

/* The recommendation. Thresholds are on the total of six answers, max 23.
   Deliberately generous toward the middle: TRANSFORM suits most people who
   come to a 42-day fat-loss challenge, and pushing a returning beginner
   into PERFORM is how someone gets hurt in week one. */
function t42Recommend(score){
  if(score<=6)  return 'start';
  if(score<=15) return 'transform';
  return 'perform';
}

function t42RenderAssessResult(){
  var el=$('t42-body'); if(!el) return;
  var id=t42Recommend(t42Quiz.score);
  /* A beginner's START, in an edition without it, is TRANSFORM — the track
     built for fat loss and habits, at the pace of the person doing it. */
  if(!T42.offers('tracks',id)) id = T42.offers('tracks','transform') ? 'transform' : 'perform';
  var t=t42Track(id);
  var h='<div class="hgroup"><div class="k">Your result</div><h2>We suggest '+t42Esc(t.name)+'</h2>'+
        '<p>'+t42Esc(t.line)+'</p></div>'+
        '<div class="t42-card on"><div class="t42-card-h"><span class="t42-trackicon">'+glyph(t.icon)+'</span>'+
        '<div class="t42-card-n">'+t42Esc(t.name)+'</div></div>'+
        '<div class="t42-q">'+t42Esc(t.who)+'</div></div>'+
        '<div class="t42-note">This is a suggestion, not a decision. Pick whichever '+
        'track you actually want — you know things a quiz does not.</div>'+
        '<button class="bigbtn" onclick="t42TakeSuggested(\''+id+'\')">Use '+t42Esc(t.name)+'</button>'+
        '<button class="bigbtn sec" onclick="t42GoTrack()">Choose a different track</button>';
  el.innerHTML=h;
}

function t42TakeSuggested(id){
  t42Draft.track=id; t42DraftSave();
  t42Go('track');
}


/* ═══════════════════════════════════════════════════════════════
   06 · Baseline

   Everything HITFAT+ already knows is filled in. The brief's rule — do not
   ask twice — is not politeness: a second weight, typed from memory into a
   second form, is the number the whole score is measured against.
   ═══════════════════════════════════════════════════════════════ */

var t42Base={weight:'', height:'', waist:'', age:'', gender:'', goal:'Fat Loss'};

function t42BasePrefill(){
  var n=(HF && HF.data && HF.data.nutrition)||{};
  var w=(HF && HF.data && HF.data.weight)||[];
  var last=w.length?w[w.length-1]:null;
  var b=T42.baseline||{};
  t42Base={
    weight: b.weight_kg!=null ? String(b.weight_kg) : (last&&last.kg?String(last.kg):(n.w?String(n.w):'')),
    height: b.height_cm!=null ? String(b.height_cm) : (n.h?String(n.h):''),
    waist:  b.waist_cm!=null  ? String(b.waist_cm)  : ((HF&&HF.data&&HF.data.wc)?String(HF.data.wc):''),
    age:    b.age!=null       ? String(b.age)       : (n.a?String(n.a):''),
    gender: b.id ? (T42.reg&&T42.reg.gender)||'' : (n.gender||''),
    goal:   b.goal || (HF&&HF.data&&HF.data.prefs&&HF.data.prefs.goal) || 'Fat Loss'
  };
}

function t42RenderBaseline(){
  var el=$('t42-body'); if(!el) return;
  if(!t42Base._ready){ t42BasePrefill(); t42Base._ready=true; }

  var h='<div class="hgroup"><div class="k">Step 3 of 3</div><h2>Complete your baseline</h2>'+
        '<p>Track your starting point. Every number you beat is measured from here.</p></div>';

  h+='<div class="segs" id="t42-basetabs">'+
     '<button class="seg'+(t42BaseTab==='basic'?' on':'')+'" onclick="t42BaseTab1()">Basic info</button>'+
     '<button class="seg'+(t42BaseTab==='photos'?' on':'')+'" onclick="t42BaseTab2()">Photos</button>'+
     '<button class="seg'+(t42BaseTab==='physical'?' on':'')+'" onclick="t42BaseTab3()">Physical</button></div>';

  if(t42BaseTab==='basic')    h+=t42BaseBasic();
  if(t42BaseTab==='photos')   h+=t42BasePhotos();
  if(t42BaseTab==='physical') h+=t42BasePhysical();

  el.innerHTML=h;
}

function t42BaseBasic(){
  var known=[];
  var n=(HF && HF.data && HF.data.nutrition)||{};
  if(n.w) known.push('weight');
  if(n.h) known.push('height');
  if(HF&&HF.data&&HF.data.wc) known.push('waist');
  var pre = known.length
    ? '<div class="t42-note">Filled in from your HITFAT+ profile. Correct anything that has changed.</div>'
    : '';

  return pre+
    '<div class="t42-field"><label for="t42-wt">Weight (kg)</label>'+
    '<input class="inp" id="t42-wt" type="number" inputmode="decimal" step="0.1" value="'+
      t42Esc(t42Base.weight)+'" oninput="t42BaseNum(\'t42-wt\',\'weight\')"></div>'+
    '<div class="t42-field"><label for="t42-ht">Height (cm)</label>'+
    '<input class="inp" id="t42-ht" type="number" inputmode="numeric" value="'+
      t42Esc(t42Base.height)+'" oninput="t42BaseNum(\'t42-ht\',\'height\')"></div>'+
    '<div class="t42-field"><label for="t42-wc">Waist (cm)</label>'+
    '<input class="inp" id="t42-wc" type="number" inputmode="decimal" step="0.1" value="'+
      t42Esc(t42Base.waist)+'" oninput="t42BaseNum(\'t42-wc\',\'waist\')"></div>'+
    '<div class="t42-field"><label for="t42-age">Age</label>'+
    '<input class="inp" id="t42-age" type="number" inputmode="numeric" value="'+
      t42Esc(t42Base.age)+'" oninput="t42BaseNum(\'t42-age\',\'age\')"></div>'+
    /* Gender is asked because the competition is judged in gendered
       categories and a Gym duo must be same-gender — not to decorate a
       profile. Saying so is cheaper than being asked why. */
    '<div class="t42-field"><label>Category</label>'+
    '<div class="t42-pills">'+
      '<button class="t42-pill'+(t42Base.gender==='male'?' on':'')+'" onclick="t42BaseSet(\'gender\',\'male\')">Men</button>'+
      '<button class="t42-pill'+(t42Base.gender==='female'?' on':'')+'" onclick="t42BaseSet(\'gender\',\'female\')">Women</button>'+
    '</div><div class="t42-q">Leaderboards are ranked separately for men and women.</div></div>'+
    t42BaseFoot();
}

function t42BasePhotos(){
  /* Photos need a registration row to hang off and a private bucket to land
     in. Both exist only after the baseline is saved, so the honest thing is
     to say what happens rather than show three dead tiles. */
  var saved=T42.hasBaseline();
  var h='<div class="t42-note">Progress photos stay private. They are never shown on a '+
        'leaderboard, never visible to another participant, and are used only to verify '+
        'your own before-and-after.</div>';
  if(!saved){
    h+='<div class="acard"><div class="ah">'+ic('photo')+'<div class="t">Save your basics first</div></div>'+
       '<div class="sub" style="margin-top:3px;">Fill in Basic info and save. '+
       'Photo upload opens as soon as your baseline exists.</div></div>';
  } else {
    h+='<div class="t42-photos">'+
       ['front','side','back'].map(function(s){
         return '<div class="t42-photo"><div class="t42-photo-i">＋</div>'+
                '<div class="t42-photo-l">'+s.charAt(0).toUpperCase()+s.slice(1)+'</div></div>';
       }).join('')+'</div>'+
       '<div class="t42-q">Photo upload lands in the next release — '+
       'your baseline numbers are already saved and counted.</div>';
  }
  return h+t42BaseFoot();
}

function t42BasePhysical(){
  var code=(T42.reg&&T42.reg.verify_code)||null;
  var h='';
  if(t42Draft.mode==='gym_duo' || (T42.reg&&T42.reg.mode==='gym_duo')){
    h+='<div class="acard"><div class="ah">'+ic('lab')+'<div class="t">InBody at HQ</div></div>'+
       '<div class="sub" style="margin-top:3px;">Your body composition is measured on the '+
       'gym\'s InBody and signed off by a coach. Nothing to type here — it appears once '+
       'your scan is done.</div></div>';
  } else {
    h+='<div class="acard"><div class="ah">'+ic('lock')+'<div class="t">Your verification code</div></div>'+
       '<div class="sub" style="margin-top:3px;">Top finishers are asked to show a photo of '+
       'their scale with this code written beside it. It is yours alone and never changes.</div>'+
       (code ? '<div class="t42-code">'+t42Esc(code)+'</div>'
             : '<div class="sub" style="margin-top:8px;">Issued when you save your baseline.</div>')+
       '</div>';
  }
  h+='<div class="t42-note">A fitness test is added in week one, once the edition starts.</div>';
  return h+t42BaseFoot();
}

/* What is still missing, in words. A faded button that does not say why
   left someone on the Physical tab tapping at JOIN with no idea the answer
   was two tabs to the left. */
function t42BaseMissing(){
  var w=parseFloat(t42Base.weight), h=parseFloat(t42Base.height), c=parseFloat(t42Base.waist);
  var m=[];
  if(!(w>20 && w<400)) m.push(t42Base.weight?'a real weight':'weight');
  if(!(h>90 && h<250)) m.push(t42Base.height?'a real height':'height');
  if(!(c>30 && c<250)) m.push(t42Base.waist?'a real waist':'waist');
  if(!t42Base.gender)  m.push('Men or Women');
  return m;
}
function t42BaseMissingLine(){
  var m=t42BaseMissing(); if(!m.length) return '';
  var list = m.length===1 ? m[0] : m.slice(0,-1).join(', ')+' and '+m[m.length-1];
  return 'Still needed: '+list+(t42BaseTab!=='basic'?' — on Basic info.':'.');
}

function t42BaseFoot(){
  var ok=t42BaseValid();
  var miss=t42BaseMissingLine();
  return '<div class="t42-q t42-miss" id="t42-basemiss">'+t42Esc(miss)+'</div>'+
    (miss && t42BaseTab!=='basic'
      ? '<button class="bigbtn sec" onclick="t42BaseTab1()">Go to Basic info</button>' : '')+
    '<button class="bigbtn'+(ok?'':' off')+'" onclick="t42SaveBaseline()">'+
    (T42.isJoined()?'Save Baseline':'Join T42')+'</button>'+
    (T42.isJoined()?'':'<button class="bigbtn sec" onclick="t42GoTrack()">Back</button>');
}

function t42BaseTab1(){ t42BaseTab='basic';    t42RenderBaseline(); }
function t42BaseTab2(){ t42BaseTab='photos';   t42RenderBaseline(); }
function t42BaseTab3(){ t42BaseTab='physical'; t42RenderBaseline(); }

function t42BaseNum(id,key){
  var e=$(id); if(!e) return;
  t42Base[key]=e.value;
  /* Repainting on every keystroke would move the caret. Only the footer
     button changes state, so only it is touched. */
  t42BaseFootSync();
}
function t42BaseSet(key,val){ t42Base[key]=val; t42RenderBaseline(); }

function t42BaseFootSync(){
  var el=$('t42-body'); if(!el||!el.querySelectorAll) return;
  var btns=el.querySelectorAll('.bigbtn');
  /* The JOIN button is the last-but-one primary: find it by its action
     rather than its position, now that a "Go to Basic info" can sit above. */
  Array.prototype.forEach.call(btns||[],function(b){
    if(String(b.getAttribute&&b.getAttribute('onclick')).indexOf('t42SaveBaseline')===0)
      b.classList.toggle('off', !t42BaseValid());
  });
  var m=$('t42-basemiss'); if(m) m.textContent=t42BaseMissingLine();
}

/* What a baseline must have before it can anchor a score. Height is in
   here because BMI and the waist-to-height ratio both need it, and a
   baseline missing one of the three cannot be compared to a final. */
function t42BaseValid(){
  var w=parseFloat(t42Base.weight), h=parseFloat(t42Base.height), c=parseFloat(t42Base.waist);
  if(!(w>20 && w<400)) return false;
  if(!(h>90 && h<250)) return false;
  if(!(c>30 && c<250)) return false;
  if(!t42Base.gender)  return false;
  return true;
}


/* ═══════════════════════════════════════════════════════════════
   Writing it down

   Registration and baseline are saved together. Two buttons would mean a
   population of half-registered people with no starting weight, which is
   exactly who an admin then has to chase.
   ═══════════════════════════════════════════════════════════════ */

var t42Saving=false;

async function t42SaveBaseline(){
  if(t42Saving) return;                       // double-tap is one registration
  if(!t42BaseValid()){
    toast(t42BaseMissingLine()||'Fill in your baseline');
    if(t42BaseTab!=='basic'){ t42BaseTab='basic'; t42RenderBaseline(); }
    return;
  }
  if(!sb || !SUPA_READY){ toast('Sign in to join T42'); return; }
  if(!T42.challenge){ toast('No T42 edition is open'); return; }

  t42Saving=true;
  try{
    var uid=await T42.uid();
    if(!uid){ toast('Sign in to join T42'); return; }

    if(!T42.reg){
      var mode=t42Draft.mode||'online_solo';
      var track=t42Draft.track||'transform';
      var ins=await sb.from('t42_registrations').insert({
        challenge_id: T42.challenge.id,
        user_id: uid,
        mode: mode,
        track: track,
        gender: t42Base.gender||null,
        status: 'pending',
        /* The code is shown to the participant and photographed beside a
           scale. It is not a secret and it is not security — it ties one
           photo to one person so a reviewer can tell two submissions
           apart. The server is free to replace it. */
        verify_code: t42MakeCode(),
        consent_at: new Date().toISOString()
      }).select().maybeSingle();
      if(ins.error) throw ins.error;
      T42.reg=ins.data;
    }

    var row={
      registration_id: T42.reg.id,
      phase: 'baseline',
      weight_kg: parseFloat(t42Base.weight),
      height_cm: parseFloat(t42Base.height),
      waist_cm:  parseFloat(t42Base.waist),
      age:       t42Base.age?parseInt(t42Base.age,10):null,
      goal:      t42Base.goal||null,
      source:    'self',
      verify_status: 'none'
    };
    var up = T42.baseline
      ? await sb.from('t42_measurements').update(row).eq('id',T42.baseline.id).select().maybeSingle()
      : await sb.from('t42_measurements').insert(row).select().maybeSingle();
    if(up.error) throw up.error;
    T42.baseline=up.data;

    t42DraftClear();
    t42Base._ready=false;
    if(T42.needsPayment()){
      toast('Details saved — one step left');
      t42Go('pay');
    } else {
      toast('You are in — baseline saved');
      t42Go('joined');
    }
    try{ renderHome(); }catch(e){}
  }catch(e){
    toast(t42SchemaMissing(e) ? 'T42 is not switched on for this account yet'
                              : ((e&&e.message)||'Could not save your baseline'));
  }finally{
    t42Saving=false;
  }
}

/* Five digits off the clock and a little randomness. Uniqueness is the
   database's job — this only has to be hard to collide with by accident
   and easy to read off a phone held over a bathroom scale. */
function t42MakeCode(){
  var n=Math.floor(Math.random()*90000)+10000;
  return 'T42-'+n;
}


/* ═══════════════════════════════════════════════════════════════
   Registered · the holding screen until the dashboard lands
   ═══════════════════════════════════════════════════════════════ */

function t42RenderJoined(){
  var el=$('t42-body'); if(!el) return;
  var c=T42.challenge, r=T42.reg;
  if(!r) return t42RenderLanding();
  var tr=t42Track(r.track)||{}, md=t42Mode(r.mode)||{};
  var day=T42.dayNo(), to=T42.daysTo();
  if(T42.needsPayment()) return t42RenderPay();
  if(day===0) return t42RenderUpcoming();

  var h=t42Hero();

  if(day===0){
    h+='<div class="t42-count"><div class="t42-count-n">'+to+'</div>'+
       '<div class="t42-count-l">'+(to===1?'day to go':'days to go')+'</div></div>';
  } else {
    var pct=Math.round((day/((c&&c.total_days)||42))*100);
    h+='<div class="t42-count"><div class="t42-count-n">Day '+day+'</div>'+
       '<div class="t42-count-l">of '+((c&&c.total_days)||42)+'</div></div>'+
       '<div class="pbar"><i style="width:'+pct+'%"></i></div>';
  }

  h+='<div class="sechead">Your challenge</div>'+
     '<div class="acard"><div class="ah">'+ic((tr.icon||'🔥'))+''+
     '<div class="t">'+t42Esc(tr.name||'')+'</div></div>'+
     '<div class="sub" style="margin-top:3px;">'+t42Esc(md.name||'')+' · '+t42Esc(tr.line||'')+'</div></div>';

  if(r.mode==='gym_duo') h+=t42DuoSummaryCard();

  h+='<div class="sechead">Your baseline</div><div class="t42-grid">'+
     t42Stat('Weight', (T42.baseline&&T42.baseline.weight_kg)+' kg')+
     t42Stat('Waist',  (T42.baseline&&T42.baseline.waist_cm)+' cm')+
     t42Stat('Height', (T42.baseline&&T42.baseline.height_cm)+' cm')+
     t42Stat('Code',   (r.verify_code||'—'))+
     '</div>'+
     '<button class="bigbtn sec" onclick="t42GoBaseline()">Edit baseline</button>';

  h+='<div class="t42-note">Your daily check-in, today\'s workout and the leaderboard '+
     'open when the edition starts.</div>';

  el.innerHTML=h;
}

function t42Stat(label,val){
  return '<div class="t42-stat"><div class="t42-stat-l">'+t42Esc(label)+'</div>'+
         '<div class="t42-stat-v">'+t42Esc(val)+'</div></div>';
}


/* ═══════════════════════════════════════════════════════════════
   The way in, from Home

   One card. A user who has joined sees where they are; a user who has not
   sees the invitation. When no edition is open, neither — an app should
   not advertise a challenge nobody can join.
   ═══════════════════════════════════════════════════════════════ */

function t42HomeCard(){
  if(T42.state==='nosetup'||T42.state==='error') return '';
  if(!T42.challenge) return '';

  var head, sub, cta;
  if(T42.isJoined() && !T42.accessOpen()){
    head='T42 complete';
    sub = 'Your result and certificate are in your T42 Journey';
    cta='See Result';
  } else if(T42.isJoined() && T42.needsPayment()){
    head='Confirm your place';
    sub = (T42.regOpen() ? 'One payment and you are in · ' : 'Registration has closed · ')+
          t42WhenLine(T42.challenge);
    cta= T42.regOpen() ? 'Complete payment' : 'Open T42';
  } else if(T42.isJoined() && T42.isComplete()){
    head='T42 complete';
    sub = T42.certs&&T42.certs.length ? 'Your result and certificate are ready' : 'See your result';
    cta='See Result';
  } else if(T42.isJoined()){
    var day=T42.dayNo(), to=T42.daysTo();
    if(T42.isOver()){
      head='Finished'; sub='Finished · results are being checked'; cta='Open T42';
    } else if(!T42.hasBaseline() && day<=T42.lockDay()){
      head='Finish your baseline';
      sub='Your starting point is what every result is measured from';
      cta='Continue';
    } else if(day===0){
      head = to===0 ? 'Starts today' : 'Starts in '+to+(to===1?' day':' days');
      sub  = ((t42Track(T42.reg.track)||{}).name||'')+' · '+((t42Mode(T42.reg.mode)||{}).name||'');
      cta='Open T42';
    } else {
      head='Day '+day+' of '+((T42.challenge.total_days)||42);
      /* The one thing still to do today, so the banner is a nudge rather
         than a label. */
      sub = !T42.today ? 'Check in for today'
          : (T42.planDay && !T42.doneToday) ? 'Today: '+T42.planDay.title
          : 'Today is done';
      cta='Open Today';
    }
  } else {
    /* Nobody is invited to a door that is shut. */
    if(!T42.regOpen()) return '';
    head='42 Days. One Journey. A Stronger You.';
    sub = t42WhenLine(T42.challenge)+' · '+T42_TRACKS.filter(function(t){
      return T42.offers('tracks',t.id); }).map(function(t){ return t.name; }).join(' · ');
    cta='Join T42';
  }

  return '<div class="t42-banner" onclick="openT42()">'+
    '<div class="t42-banner-top"><span class="t42-banner-logo">T42</span>'+
    '<span class="t42-banner-tag">TRANSFORMATION 42 DAYS</span></div>'+
    '<div class="t42-banner-line">'+t42Esc(head)+'</div>'+
    '<div class="t42-banner-sub">'+t42Esc(sub)+'</div>'+
    '<div class="t42-banner-cta">'+t42Esc(cta)+'</div></div>';
}


/* ═══════════════════════════════════════════════════════════════
   07 · The dashboard

   The brief's rule, and it is the right one: today's status must read in
   three seconds. So the top of this screen is one number — which day it is
   — and then a list of what today asks for, each row either done or not.
   Everything else is below the fold on purpose.
   ═══════════════════════════════════════════════════════════════ */

function t42RenderDash(){
  var el=$('t42-body'); if(!el) return;
  var c=T42.challenge, day=T42.dayNo();
  if(!T42.reg) return t42RenderLanding();
  if(!day)     return t42RenderJoined();          // still counting down
  if(T42.isComplete()) return t42RenderResult();  // the results are out
  if(T42.isOver())     return t42RenderFinal();   // over, results being checked

  var total=(c&&c.total_days)||42;
  var pct=Math.round((day/total)*100);

  var h=t42MilestoneCard()+t42DashHead()+t42MissedCard()+'<div class="t42-day"><div class="t42-day-l">'+
        '<div class="t42-day-n">Day '+day+'</div>'+
        '<div class="t42-day-s">of '+total+
        (T42.week ? ' · Week '+T42.weekNo()+' · '+t42Esc(T42.week.theme) : '')+'</div></div>'+
        donutSVG(pct,'#F0392B',62)+'</div>';

  if(T42.week && T42.week.focus)
    h+='<div class="t42-q" style="margin-bottom:14px;">'+t42Esc(T42.week.focus)+'</div>';

  /* The two states that outrank today's list. */
  if(!T42.hasBaseline()){
    h+='<div class="acard"><div class="ah">'+ic('measure')+'<div class="t">Not ranked this time</div></div>'+
       '<div class="sub">The baseline closed on day '+T42.lockDay()+' without one, so there is no '+
       'starting point to measure a result from. Keep training and checking in — it all still counts '+
       'for you, just not on the leaderboard.</div></div>';
  } else if(t42OpenPhase()==='final'){
    var left=t42FinalItems().filter(function(i){ return i.done===false && !i.optional && !i.coach; }).length;
    h+='<div class="acard" onclick="t42GoFinal()" style="cursor:pointer;border-color:var(--hyrox);">'+
       '<div class="ah">'+ic('flag')+'<div class="t">Final assessment is open</div><div class="c">›</div></div>'+
       '<div class="sub">'+(left ? left+' thing'+(left===1?'':'s')+' left to submit'
                                 : 'Everything is in. Waiting on verification.')+'</div></div>';
  }

  /* ── today ── */
  h+='<div class="sechead">Today</div><div class="t42-list">';

  var ck=T42.today;
  var wDone=!!T42.doneToday;
  var planned=T42.planDay;

  h+=t42Row('workout','Workout',
        wDone ? (T42.doneToday.title||'Completed')
              : (planned ? t42Esc(planned.title) : 'Rest day'),
        wDone ? 'done' : (planned?'todo':'rest'), 't42GoTrain()');

  h+=t42Row('steps','Steps',
        ck&&ck.steps!=null ? (t42Num(ck.steps)+' / '+t42Num(T42.stepTarget()))
                           : ('— / '+t42Num(T42.stepTarget())),
        ck&&ck.steps>=T42.stepTarget() ? 'done' : 'todo', 't42GoCheckin()');

  h+=t42Row('food','Nutrition',
        ck&&ck.nutrition ? t42NutLabel(ck.nutrition) : 'Not logged',
        ck&&ck.nutrition==='on_track' ? 'done' : 'todo', 't42GoCheckin()');

  h+=t42Row('water','Water',
        ck&&ck.water_ml!=null ? ((ck.water_ml/1000).toFixed(1)+'L / '+(T42.waterTarget()/1000).toFixed(1)+'L')
                              : ('— / '+(T42.waterTarget()/1000).toFixed(1)+'L'),
        ck&&ck.water_ml>=T42.waterTarget() ? 'done' : 'todo', 't42GoCheckin()');

  h+=t42Row('check','Daily check-in', ck ? 'Completed' : 'Not yet',
        ck ? 'done' : 'todo', 't42GoCheckin()');

  if(T42.isGym()){
    var meRow=t42DuoMe();
    h+=t42Row('gym','Gym check-in',
          meRow&&meRow.gym_today ? 'Checked in at HQ' : 'Show your QR at the counter',
          meRow&&meRow.gym_today ? 'done' : 'todo', 't42GymCheckin()');
  }

  if(T42.week && T42.week.rush_title)
    h+=t42Row('rush','RUSH · '+t42Esc(T42.week.rush_title),
          t42Esc(T42.week.rush_target||''), 'todo', 't42Rush()');

  h+='</div>';                                   // end of today's list

  /* One button for the next thing today still asks for. */
  var next = (planned && !wDone) ? ['Continue today · start workout','t42GoTrain()']
           : !ck                 ? ['Continue today · check in','t42GoCheckin()']
           : null;
  if(next) h+='<button class="bigbtn" onclick="'+next[1]+'">'+t42Esc(next[0])+'</button>';
  else h+='<div class="t42-note t42-done-day"><b>Today is done.</b> See you tomorrow.</div>';
  if(T42.isGym()) h+=t42DuoDashCard();

  /* ── the two numbers that are actually earned ── */
  h+='<div class="t42-grid" style="margin-top:14px;">'+
     t42Stat('Streak', T42.streak()+(T42.streak()===1?' day':' days'))+
     t42Stat('Consistency', T42.consistency()+'%')+
     '</div>';

  /* The mini challenge, if the week carries one. */
  if(T42.week && T42.week.mini_title){
    h+='<div class="sechead">This week</div>'+
       '<div class="acard"><div class="ah">'+ic('target')+'<div class="t">'+
       t42Esc(T42.week.mini_title)+'</div></div>'+
       '<div class="sub">'+t42Esc(T42.week.mini_detail||'')+'</div></div>';
  }

  /* The rank is the server's. Until it has run there is none, and saying so
     beats a zero that looks like a result. */
  var sc=T42.score, rk=t42MyRank();
  /* A gym member competes as a duo, and the duo card above already carries
     the score and rank that matter. A second, individual one under it
     would be two answers to one question. */
  if(T42.isGym()){
    /* nothing — the duo card is the standing */
  } else if(sc && sc.eligible && rk){
    h+='<div class="sechead">Standing</div><div class="t42-grid">'+
       t42Stat('Rank', '#'+rk)+
       t42Stat('Score', t42Fmt(t42MyBoard()==='consistency'?sc.consistency_total:sc.total))+
       '</div>'+
       '<button class="bigbtn sec" onclick="t42GoRank()">Leaderboard</button>';
  } else if(sc && !sc.eligible && sc.note){
    h+='<div class="t42-note">Not ranked yet — '+t42Esc(sc.note.charAt(0).toLowerCase()+sc.note.slice(1))+'.</div>';
  } else {
    h+='<div class="t42-note">Your rank appears once the first scores are in. '+
       'They are worked out on the server every hour.</div>';
  }

  el.innerHTML=h;
}


/* ── icons ──
   A glyph in a rounded tile of its own colour, the way Settings and Health
   draw a list. Emoji render differently on every phone and read as a chat
   message; a tinted tile reads as a row of an app. */
var T42_ICON={
  workout:'<path d="M6 7v10M18 7v10M3 10v4M21 10v4M6 12h12"/>',
  steps:  '<circle cx="13.5" cy="4.5" r="1.8"/><path d="M10.5 21l2-6-3-3 1.5-5 3.5 3 3.5 1M9 12l-3 2.5"/>',
  food:   '<path d="M7 3v7a2 2 0 0 0 2 2v9M11 3v7M7 7h4M17 21v-8c-1.8 0-2.6-2-2.6-4.6S15.5 3 17 3z"/>',
  water:  '<path d="M12 3.5s6 6.3 6 10.5a6 6 0 0 1-12 0c0-4.2 6-10.5 6-10.5z"/>',
  check:  '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  gym:    '<path d="M12 21s7-6.1 7-11.4a7 7 0 0 0-14 0C5 14.9 12 21 12 21z"/><circle cx="12" cy="9.6" r="2.5"/>',
  rush:   '<path d="M13 2.5L4.5 13.5H11l-1 8 8.5-11H12l1-8z"/>',
  measure:'<path d="M3.5 16.5L16.5 3.5l4 4-13 13z"/><path d="M7.5 12.5l2 2M10.5 9.5l2 2M13.5 6.5l2 2"/>',
  flag:   '<path d="M6 21V4M6 4h10.5l-2 4 2 4H6"/>',
  photo:  '<path d="M4 8h3l2-2.5h6L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.4"/>',
  clock:  '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  person: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20c1.2-3.6 4-5 7-5s5.8 1.4 7 5"/>'
};
function t42Ic(kind){
  var cls = kind==='photo' ? 'check' : kind==='clock' ? 'rush' : kind;
  return '<span class="t42-ic '+cls+'"><svg viewBox="0 0 24 24" aria-hidden="true">'+
         (T42_ICON[kind]||T42_ICON.check)+'</svg></span>';
}

function t42Row(icon,label,value,state,go){
  var mark = state==='done' ? '<span class="t42-tick">✓</span>'
           : state==='rest' ? '<span class="t42-rest">rest</span>'
           : '<span class="t42-chev">›</span>';
  return '<div class="t42-row'+(state==='done'?' done':'')+'" onclick="'+go+'">'+
    t42Ic(icon)+
    '<div class="t42-row-b"><div class="t42-row-l">'+label+'</div>'+
    '<div class="t42-row-v">'+value+'</div></div>'+mark+'</div>';
}
function t42Num(n){ return String(n).replace(/\B(?=(\d{3})+(?!\d))/g,','); }
function t42NutLabel(v){
  return v==='on_track' ? 'On track' : v==='partly' ? 'Partly' : 'Off track';
}
function t42Rush(){
  window.open('https://rush.hitfat.io','_blank');
}


/* ═══════════════════════════════════════════════════════════════
   08 · The daily check-in

   Under thirty seconds is the requirement, so nothing here is typed except
   two numbers. Everything else is one tap, and the whole thing saves in one
   write. Weight is deliberately absent: asked daily it becomes the number
   people avoid the app to avoid.
   ═══════════════════════════════════════════════════════════════ */

var t42Ck={energy:0, sleep:'', nutrition:'', water_ml:0, steps:'', workout:'', mood:''};
var t42CkReady=false;

function t42CkLoad(){
  var c=T42.today;
  t42Ck = c ? {energy:c.energy||0, sleep:c.sleep||'', nutrition:c.nutrition||'',
               water_ml:c.water_ml||0, steps:c.steps!=null?String(c.steps):'',
               workout:c.workout||'', mood:c.mood||''}
            : {energy:0, sleep:'', nutrition:'', water_ml:0, steps:'',
               workout:T42.doneToday?'completed':'', mood:''};
  t42CkReady=true;
}

function t42RenderCheckin(){
  var el=$('t42-body'); if(!el) return;
  if(!T42.reg || !T42.dayNo()) return t42RenderDash();
  if(T42.isOver() || T42.isComplete()) return t42Finished('Check-ins');
  if(!t42CkReady) t42CkLoad();

  var day=T42.dayNo();
  var h='<div class="hgroup"><div class="k">Day '+day+'</div><h2>Daily check-in</h2>'+
        '<p>'+(T42.today?'Already saved today. Change anything you like.'
                        :'Thirty seconds. Then you are done for the day.')+'</p></div>';

  h+='<div class="t42-field"><label>Energy</label><div class="t42-pills">'+
     [1,2,3,4,5].map(function(n){
       return '<button class="t42-pill'+(t42Ck.energy===n?' on':'')+
              '" onclick="t42CkSet(\'energy\','+n+')">'+n+'</button>';
     }).join('')+'</div></div>';

  h+='<div class="t42-field"><label>Sleep</label><div class="t42-pills">'+
     [['poor','Poor'],['ok','OK'],['good','Good']].map(function(o){
       return '<button class="t42-pill'+(t42Ck.sleep===o[0]?' on':'')+
              '" onclick="t42CkSet(\'sleep\',\''+o[0]+'\')">'+o[1]+'</button>';
     }).join('')+'</div></div>';

  h+='<div class="t42-field"><label>Nutrition</label><div class="t42-pills">'+
     [['on_track','On track'],['partly','Partly'],['off_track','Off track']].map(function(o){
       return '<button class="t42-pill'+(t42Ck.nutrition===o[0]?' on':'')+
              '" onclick="t42CkSet(\'nutrition\',\''+o[0]+'\')">'+o[1]+'</button>';
     }).join('')+'</div></div>';

  /* Water as taps, not a slider. A slider on a phone is a fight for a
     number that only ever moves in glasses. */
  var glasses=Math.round((t42Ck.water_ml||0)/250);
  h+='<div class="t42-field"><label>Water · '+((t42Ck.water_ml||0)/1000).toFixed(2).replace(/0$/,'')+
     'L of '+(T42.waterTarget()/1000).toFixed(1)+'L</label>'+
     '<div class="t42-glasses">'+
     [1,2,3,4,5,6,7,8].map(function(n){
       return '<button class="t42-glass'+(n<=glasses?' on':'')+
              '" onclick="t42CkWater('+n+')">'+(n<=glasses?glyph('water'):'·')+'</button>';
     }).join('')+'</div>'+
     '<div class="t42-q">Each glass is 250ml. Tap the same one again to go back.</div></div>';

  h+='<div class="t42-field"><label for="t42-steps">Steps</label>'+
     '<input class="inp" id="t42-steps" type="number" inputmode="numeric" '+
     'placeholder="'+t42Num(T42.stepTarget())+'" value="'+t42Esc(t42Ck.steps)+
     '" oninput="t42CkNum(\'t42-steps\',\'steps\')">'+
     '<div class="t42-q">Read it off your phone\'s health app. Target '+
     t42Num(T42.stepTarget())+'.</div></div>';

  h+='<div class="t42-field"><label>Workout</label><div class="t42-pills">'+
     [['completed','Done'],['planned','Planned'],['rest','Rest']].map(function(o){
       return '<button class="t42-pill'+(t42Ck.workout===o[0]?' on':'')+
              '" onclick="t42CkSet(\'workout\',\''+o[0]+'\')">'+o[1]+'</button>';
     }).join('')+'</div></div>';

  h+='<button class="bigbtn'+(t42CkValid()?'':' off')+'" onclick="t42SaveCheckin()">'+
     (T42.today?'Update Check-in':'Save Check-in')+'</button>'+
     '<button class="bigbtn sec" onclick="t42GoDash()">Back</button>';

  el.innerHTML=h;
}

function t42CkSet(k,v){
  /* Tapping the chosen pill again clears it. Without that, a mis-tap on a
     five-point scale can never be taken back. */
  t42Ck[k] = (t42Ck[k]===v) ? (typeof v==='number'?0:'') : v;
  t42RenderCheckin();
}
function t42CkWater(n){
  var cur=Math.round((t42Ck.water_ml||0)/250);
  t42Ck.water_ml = (cur===n ? n-1 : n)*250;
  t42RenderCheckin();
}
function t42CkNum(id,k){
  var e=$(id); if(!e) return;
  t42Ck[k]=e.value;
  t42CkFootSync();
}
function t42CkFootSync(){
  var el=$('t42-body'); if(!el||!el.querySelectorAll) return;
  var b=el.querySelectorAll('.bigbtn');
  if(b&&b.length) b[0].classList.toggle('off', !t42CkValid());
}

/* A check-in is worth saving once it says something. Demanding all seven
   fields would turn thirty seconds into a form, and a skipped day scores
   worse than a partial one. */
function t42CkValid(){
  return !!(t42Ck.energy || t42Ck.sleep || t42Ck.nutrition ||
            t42Ck.water_ml || t42Ck.steps || t42Ck.workout);
}

var t42CkSaving=false;

async function t42SaveCheckin(){
  if(t42CkSaving) return;
  if(!t42CkValid()){ toast('Answer at least one thing'); return; }
  if(!sb || !SUPA_READY || !T42.reg){ toast('Sign in to check in'); return; }
  var day=T42.dayNo();
  if(!day){ toast('T42 has not started yet'); return; }

  t42CkSaving=true;
  try{
    var row={
      registration_id: T42.reg.id,
      day_no: day,
      on_date: t42TodayISO(),
      energy: t42Ck.energy||null,
      sleep: t42Ck.sleep||null,
      nutrition: t42Ck.nutrition||null,
      water_ml: t42Ck.water_ml||null,
      steps: t42Ck.steps!==''?parseInt(t42Ck.steps,10):null,
      workout: t42Ck.workout||null,
      mood: t42Ck.mood||null
    };
    /* Upsert on (registration_id, day_no), which is the unique index. Two
       taps on Save is one check-in, and re-opening the screen at night to
       add the evening's steps must not create a second row the consistency
       count would then read as two days. */
    var r=await sb.from('t42_daily_checkins')
      .upsert(row,{onConflict:'registration_id,day_no'}).select().maybeSingle();
    if(r.error) throw r.error;

    T42.today=r.data;
    T42.checkins=T42.checkins.filter(function(c){ return c.day_no!==day; });
    T42.checkins.unshift(r.data);
    toast(T42.today?'Checked in for day '+day:'Saved');
    t42Go('dash');
    try{ renderHome(); }catch(e){}
  }catch(e){
    toast(t42SchemaMissing(e) ? 'T42 is not switched on for this account yet'
                              : ((e&&e.message)||'Could not save your check-in'));
  }finally{
    t42CkSaving=false;
  }
}

function t42TodayISO(){
  var d=new Date();
  return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);
}


/* ═══════════════════════════════════════════════════════════════
   09 · Today's workout

   The plan names exercises; HITFAT+ already owns them, their clips and the
   player that runs them. So this screen resolves names against DB and hands
   the result to the same startWorkout() every other program uses — one
   player, one set of 310 clips, one camera.
   ═══════════════════════════════════════════════════════════════ */

function t42RenderTrain(){
  var el=$('t42-body'); if(!el) return;
  if(!T42.reg || !T42.dayNo()) return t42RenderDash();
  if(T42.isOver() || T42.isComplete()) return t42Finished('The plan');

  var day=T42.dayNo(), p=T42.planDay;

  if(!p){
    var why = T42.challenge ? 'Today is a rest day. Move, eat well, sleep.' : '';
    el.innerHTML='<div class="hgroup"><div class="k">Day '+day+'</div><h2>Rest day</h2>'+
      '<p>'+why+'</p></div>'+
      '<div class="acard"><div class="ah">'+ic('moon')+'<div class="t">Nothing scheduled</div></div>'+
      '<div class="sub">Recovery is part of the plan, not a gap in it. '+
      'Your streak is kept by checking in, not by training.</div>'+
      '<button class="bigbtn sec" onclick="t42GoCheckin()">Check in for today</button></div>'+
      '<button class="bigbtn sec" onclick="t42GoDash()">Back</button>';
    return;
  }

  var exs=t42PlanExercises(p);
  var done=!!T42.doneToday;

  var h='<div class="hgroup"><div class="k">Day '+day+'</div><h2>'+t42Esc(p.title)+'</h2>'+
        '<p>'+[p.est_minutes?p.est_minutes+' min':'', p.level||'', p.equipment||'']
              .filter(function(x){return x;}).map(t42Esc).join(' · ')+'</p></div>';

  if(p.focus) h+='<div class="t42-note">'+t42Esc(p.focus)+'</div>';

  if(done){
    h+='<div class="acard"><div class="ah">'+ic('check')+'<div class="t">Done today</div></div>'+
       '<div class="sub">'+(T42.doneToday.minutes?T42.doneToday.minutes+' min':'Logged')+
       '. Play it again if you want — it counts once.</div></div>';
  }

  h+='<button class="bigbtn" onclick="t42PlayToday()">'+
     (done?'Play Again':'Start Workout')+'</button>';

  h+='<div class="sechead">Workout preview</div>';
  if(!exs.length){
    h+='<div class="acard"><div class="sub">This day has no exercises listed yet.</div></div>';
  } else {
    exs.forEach(function(e,i){
      h+='<div class="t42-ex"><span class="t42-ex-n">'+(i+1)+'</span>'+
         '<div class="t42-ex-b">'+t42Esc(e.n)+'</div>'+
         '<div class="t42-ex-s">'+(e.sets||3)+' × '+(e.reps||12)+'</div></div>';
    });
  }

  h+='<button class="bigbtn sec" onclick="t42GoDash()">Back</button>';
  el.innerHTML=h;
}

/* Resolve the plan's names against the exercise library. A name that is not
   in DB is dropped rather than silently replaced: the player's own pickEx
   falls back to DB[0], which would show someone a squat where the plan said
   plank and give them no way to know. */
function t42PlanExercises(p){
  var list=(p&&p.exercises)||[];
  if(!list.length || typeof DB==='undefined') return [];
  var out=[];
  list.forEach(function(item){
    var name=(typeof item==='string')?item:item.n;
    var found=null;
    for(var i=0;i<DB.length;i++) if(DB[i].n===name){ found=DB[i]; break; }
    if(!found){ if(typeof console!=='undefined') console.warn('[T42] unknown exercise:',name); return; }
    out.push({n:found.n, v:found.v, m:found.m, t:found.t, eq:found.eq,
              dur:found.dur, sets:(item&&item.sets)||found.sets,
              reps:(item&&item.reps)||found.reps});
  });
  return out;
}

function t42PlayToday(){
  var p=T42.planDay; if(!p){ toast('Nothing scheduled today'); return; }
  var exs=t42PlanExercises(p);
  if(!exs.length){ toast('This day has no exercises yet'); return; }
  startWorkout(exs,{
    rounds: 1,
    /* The key HITFAT+ logs the session under. Namespaced by day so a T42
       session appears in the member's own diary alongside everything else,
       and cannot collide with a program's key. */
    key: 't42-'+T42.challenge.id.slice(0,8)+'-d'+p.day_no,
    name: p.title,
    t42day: p.day_no,
    t42plan: p.id,
    t42mins: p.est_minutes||null,
    t42count: exs.length
  });
}

/* Called by the player when a workout finishes. The local diary is written
   by plFinish itself; this is the copy the scorer reads, and it is the only
   reason T42 needs its own table rather than counting plus_data sessions. */
async function t42RecordWorkout(meta,mins){
  if(!sb || !SUPA_READY || !T42.reg || !meta || !meta.t42day) return;
  try{
    var row={
      registration_id: T42.reg.id,
      day_no: meta.t42day,
      plan_day_id: meta.t42plan||null,
      title: meta.name||null,
      minutes: mins||meta.t42mins||null,
      exercises_done: meta.t42count||null,
      exercises_total: meta.t42count||null,
      completed_at: new Date().toISOString()
    };
    var r=await sb.from('t42_workout_completions')
      .upsert(row,{onConflict:'registration_id,day_no'}).select().maybeSingle();
    if(r.error) throw r.error;
    T42.doneToday=r.data;
    T42.completions=T42.completions.filter(function(c){ return c.day_no!==meta.t42day; });
    T42.completions.unshift(r.data);
  }catch(e){
    /* The session is already in the member's own diary. Losing the server
       copy is a scoring problem, not a reason to interrupt someone who has
       just finished training — it is re-sent on the next load. */
    if(typeof console!=='undefined') console.warn('[T42] workout not recorded:',(e&&e.message)||e);
  }
}


/* ═══════════════════════════════════════════════════════════════
   14 · Progress

   Four tabs, and the split between them is not cosmetic. BODY and FITNESS
   are what the challenge SCORES, and every number on them comes from a
   measurement somebody can be asked to prove. CONSISTENCY is what the
   member DID, counted from their own rows. PHOTOS is the one thing here
   that is nobody else's business.
   ═══════════════════════════════════════════════════════════════ */

var t42ProgTab='body';

function t42Phase(list,phase){
  for(var i=0;i<(list||[]).length;i++) if(list[i].phase===phase) return list[i];
  return null;
}

/* Which checkpoint is open today. The brief unlocks the final around day
   39; the mid-point is the halfway mark. Before either, the only
   measurement that exists is the baseline, and re-taking THAT after the
   challenge has begun would move the line everything is measured from. */
function t42OpenPhase(){
  var d=T42.dayNo(), total=(T42.challenge&&T42.challenge.total_days)||42;
  if(!d) return 'baseline';
  if(d>=Math.max(1,total-3)) return 'final';
  if(d>=Math.round(total/2)) return 'mid';
  return null;
}
function t42PhaseLabel(p){
  return p==='baseline' ? 'Baseline' : p==='mid' ? 'Mid-point' : p==='final' ? 'Final' : '';
}
function t42PhaseRow(p){
  return p==='baseline' ? T42.baseline : p==='mid' ? T42.mid : p==='final' ? T42.final : null;
}

/* The latest measurement that actually exists, which is what "now" means
   on a progress screen. */
function t42Latest(){ return T42.final || T42.mid || T42.baseline || null; }

function t42Delta(field){
  var b=T42.baseline, l=t42Latest();
  if(!b || !l || l===b) return null;
  if(b[field]==null || l[field]==null) return null;
  return Math.round((l[field]-b[field])*10)/10;
}
function t42DeltaPct(field){
  var b=T42.baseline, l=t42Latest();
  if(!b || !l || l===b || !b[field] || l[field]==null) return null;
  return Math.round(((l[field]-b[field])/b[field])*1000)/10;
}
function t42Signed(n,unit){
  if(n==null) return '—';
  return (n>0?'+':'')+n+(unit||'');
}

function t42RenderProgress(){
  var el=$('t42-body'); if(!el) return;
  if(!T42.reg) return t42RenderLanding();

  var h='<div class="segs" id="t42-progtabs">'+
    [['body','Body'],['fitness','Fitness'],['consistency','Consistency'],['photos','Photos']]
      .concat(T42.isGym()?[['duo','Duo']]:[])
      .map(function(t){
        return '<button class="seg'+(t42ProgTab===t[0]?' on':'')+
               '" onclick="t42ProgGo(\''+t[0]+'\')">'+t[1]+'</button>';
      }).join('')+'</div>';

  if(t42ProgTab==='body')        h+=t42ProgBody();
  if(t42ProgTab==='fitness')     h+=t42ProgFitness();
  if(t42ProgTab==='consistency') h+=t42ProgConsistency();
  if(t42ProgTab==='photos')      h+=t42ProgPhotos();
  if(t42ProgTab==='duo')         h+=t42ProgDuo();

  el.innerHTML=h;
}
function t42ProgGo(t){ t42ProgTab=t; t42RenderProgress(); $('screen').scrollTop=0; }


/* ── BODY ── */
function t42ProgBody(){
  var b=T42.baseline;
  if(!b) return '<div class="acard"><div class="ah">'+ic('measure')+'<div class="t">No baseline yet</div></div>'+
    '<div class="sub">Your progress is measured from a starting point. '+
    'Fill one in and this fills up.</div>'+
    '<button class="bigbtn sec" onclick="t42GoBaseline()">Complete baseline</button></div>';

  var h='';
  var dw=t42Delta('weight_kg'), dc=t42Delta('waist_cm');

  /* The headline pair. Down is good here, so the colour follows the
     direction of the goal rather than the sign of the number. */
  h+='<div class="t42-grid">'+
     t42Change('Weight', dw, 'kg', t42DeltaPct('weight_kg'))+
     t42Change('Waist',  dc, 'cm', t42DeltaPct('waist_cm'))+
     '</div>';

  if(dw==null && dc==null)
    h+='<div class="t42-note">Nothing to compare yet. Your first checkpoint opens '+
       'at the halfway mark.</div>';

  /* The scored checkpoints, in order, with what is missing said plainly. */
  h+='<div class="sechead">Checkpoints</div><div class="t42-list">';
  ['baseline','mid','final'].forEach(function(p){
    var r=t42PhaseRow(p), open=t42CanEdit(p);
    var val = r ? (r.weight_kg!=null?r.weight_kg+' kg':'—')+
                  (r.waist_cm!=null?' · '+r.waist_cm+' cm':'')+t42VerifyWord(r)
                : (open?'Open now':'Not yet');
    h+='<div class="t42-row'+(r?' done':'')+'" onclick="'+
       (open ? 't42TakeMeasure(\''+p+'\')' : 't42Noop()')+'">'+
       t42Ic(p==='final'?'flag':'measure')+
       '<div class="t42-row-b"><div class="t42-row-l">'+t42PhaseLabel(p)+'</div>'+
       '<div class="t42-row-v">'+t42Esc(val)+'</div></div>'+
       (r?'<span class="t42-tick">✓</span>':(open?'<span class="t42-chev">›</span>':
          '<span class="t42-rest">locked</span>'))+'</div>';
  });

  h+='</div>';
  /* Body composition, only when there is any. An online participant has no
     InBody and should not read four empty rows about it. */
  if(b.body_fat_pct!=null || (t42Latest()&&t42Latest().body_fat_pct!=null)){
    var l=t42Latest();
    h+='<div class="sechead">Body composition</div><div class="t42-grid">'+
       t42Stat('Body fat', (l.body_fat_pct!=null?l.body_fat_pct+'%':'—'))+
       t42Stat('Muscle',   (l.muscle_mass_kg!=null?l.muscle_mass_kg+' kg':'—'))+
       '</div>';
  }

  /* The member's own weight log, which HITFAT+ already keeps. Motivation,
     not scoring — the scored numbers are the three checkpoints above, and
     mixing the two would let a daily self-weigh look like a result. */
  var wl=(typeof weightLog==='function')?weightLog():[];
  h+='<div class="sechead">Your weight log</div>';
  if(wl.length<2){
    h+='<div class="acard"><div class="sub">Log your weight a few times and the '+
       'trend appears here. This is yours — it is not what you are scored on.</div>'+
       '<button class="bigbtn sec" onclick="t42LogWeight()">Log weight</button></div>';
  } else {
    h+='<div class="acard"><div class="ah">'+ic('scale')+'<div class="t">'+
       wl[wl.length-1].kg+' kg</div></div>'+
       '<div class="sub">'+wl.length+' entries · not scored</div>'+
       ((typeof weightChart==='function')?weightChart(wl):'')+
       '<button class="bigbtn sec" onclick="t42LogWeight()">Log weight</button></div>';
  }
  return h;
}

function t42Change(label,n,unit,pct){
  var good = n!=null && n<0;                 // down is the goal for both
  return '<div class="t42-stat"><div class="t42-stat-l">'+t42Esc(label)+'</div>'+
    '<div class="t42-stat-v"'+(good?' style="color:var(--ok);"':'')+'>'+
    t42Signed(n,unit)+'</div>'+
    (pct!=null?'<div class="t42-q" style="margin-top:2px;">'+t42Signed(pct,'%')+'</div>':'')+
    '</div>';
}
function t42Noop(){}
function t42LogWeight(){
  if(typeof askWeight!=='function') return;
  askWeight();
  /* askWeight repaints the app's own Progress tab. Ours has to be told. */
  t42RenderProgress();
}


/* ── FITNESS ──
   One test, four numbers, repeated at each checkpoint. Deliberately things
   anyone can do on a floor with a phone: a test that needs a gym cannot be
   the test an online participant is scored on. */
var T42_FITNESS=[
  {k:'pushups',   n:'Push-ups',   u:'reps', hint:'Max in 60 seconds', up:true},
  {k:'squats',    n:'Squats',     u:'reps', hint:'Max in 60 seconds', up:true},
  {k:'plank_sec', n:'Plank hold', u:'sec',  hint:'Longest hold',      up:true},
  {k:'run1k_sec', n:'1 km',       u:'sec',  hint:'Time in seconds, if you run', up:false}
];

function t42ProgFitness(){
  var b=T42.baseline, l=t42Latest();
  var bf=(b&&b.fitness)||{}, lf=(l&&l.fitness)||{};
  var any=false;
  T42_FITNESS.forEach(function(f){ if(bf[f.k]!=null||lf[f.k]!=null) any=true; });

  var h='';
  if(!any){
    h+='<div class="acard"><div class="ah">'+ic('workout')+'<div class="t">No test taken yet</div></div>'+
       '<div class="sub">Four movements, about ten minutes, no equipment. '+
       'Take it once now and again at each checkpoint — the improvement is '+
       'what the PERFORM track is scored on.</div>'+
       t42FitButton('Take the test')+'</div>';
    return h;
  }

  h+='<div class="sechead">Baseline vs now</div><div class="t42-list">';
  T42_FITNESS.forEach(function(f){
    var a=bf[f.k], c=lf[f.k];
    var d=(a!=null&&c!=null)?Math.round((c-a)*10)/10:null;
    var better = d==null?null:(f.up ? d>0 : d<0);
    h+='<div class="t42-row" onclick="'+(t42FitPhase()?'t42TakeFitness()':'t42Noop()')+'">'+
       t42Ic(f.up?'workout':'clock')+
       '<div class="t42-row-b"><div class="t42-row-l">'+f.n+'</div>'+
       '<div class="t42-row-v">'+(a!=null?a:'—')+' → '+(c!=null?c:'—')+' '+f.u+'</div></div>'+
       (d!=null?'<span class="'+(better?'t42-tick':'t42-chev')+'">'+t42Signed(d,'')+'</span>'
               :'<span class="t42-chev">›</span>')+
       '</div>';
  });
  h+='</div>'+t42FitButton('Retake the test');

  /* RUSH sits here because it is the other performance number, and it is
     the one the app cannot verify on its own. */
  h+='<div class="sechead">RUSH</div>'+
     '<div class="acard"><div class="sub">RUSH races are run at rush.hitfat.io and '+
     'logged there. Your results appear here once the two are linked.</div>'+
     '<button class="bigbtn sec" onclick="t42Rush()">Open RUSH</button></div>';
  return h;
}


/* ── CONSISTENCY ──
   Everything here is counted from rows the member wrote themselves, so it
   needs no measurement and no verification. It is also the only tab that
   can be full on day three. */
function t42ProgConsistency(){
  var day=T42.dayNo();
  if(!day) return '<div class="acard"><div class="sub">This fills in once the '+
    'challenge starts.</div></div>';

  var target=T42.stepTarget();
  var hit=T42.checkins.filter(function(c){ return c.steps!=null && c.steps>=target; }).length;
  var nut=T42.checkins.filter(function(c){ return c.nutrition==='on_track'; }).length;
  var steps=T42.checkins.reduce(function(a,c){ return a+(c.steps||0); },0);

  var h='<div class="t42-grid">'+
    t42Stat('Workouts',   T42.completions.length+' / '+day)+
    t42Stat('Check-ins',  T42.checkins.length+' / '+day)+
    t42Stat('Streak',     T42.streak()+(T42.streak()===1?' day':' days'))+
    t42Stat('Best streak',t42BestStreak()+' days')+
    '</div>';

  h+='<div class="sechead">Rates</div>';
  h+=t42Bar('Workout completion', T42.workoutPct());
  h+=t42Bar('Daily check-in',     T42.consistency());
  h+=t42Bar('Step target',        day?Math.round(hit/day*100):0);
  h+=t42Bar('Nutrition on track', day?Math.round(nut/day*100):0);

  h+='<div class="sechead">Totals</div><div class="t42-grid">'+
    t42Stat('Steps',     t42Num(steps))+
    t42Stat('Days in',   day+' of '+((T42.challenge&&T42.challenge.total_days)||42))+
    '</div>';

  h+='<button class="bigbtn sec" onclick="t42GoReview()">Weekly review</button>';
  return h;
}

function t42Bar(label,pct){
  pct=Math.max(0,Math.min(100,pct||0));
  return '<div class="t42-meter"><div class="t42-meter-h">'+
    '<span>'+t42Esc(label)+'</span><span>'+pct+'%</span></div>'+
    '<div class="pbar"><i style="width:'+pct+'%"></i></div></div>';
}

/* The longest run of consecutive check-ins anywhere in the challenge, not
   just the one ending today. A streak someone lost in week two is still
   something they did. */
function t42BestStreak(){
  var have={}; T42.checkins.forEach(function(c){ have[c.day_no]=1; });
  var days=Object.keys(have).map(Number).sort(function(a,b){ return a-b; });
  var best=0, run=0, prev=null;
  days.forEach(function(d){
    run = (prev!=null && d===prev+1) ? run+1 : 1;
    if(run>best) best=run;
    prev=d;
  });
  return best;
}


/* ── PHOTOS ──
   Private by default is not a setting here; it is the only mode. The
   bucket is private, the app reads through a link that expires, and no
   other participant — duo partner included — can reach these at all. */
var t42PhotoUrls={};        // path -> signed url, for this session only
var t42PhotoBusy='';

function t42ProgPhotos(){
  var h='<div class="t42-note">These stay private. Nobody else on T42 can see them '+
        '— not the leaderboard, not your duo partner. Coaches can view them only to '+
        'verify a result. You can delete any of them, any time.</div>';

  ['baseline','mid','final'].forEach(function(p){
    var r=t42PhaseRow(p), open=t42OpenPhase()===p;
    var dayLbl = p==='baseline'?'Day 0':p==='mid'?'Day '+Math.round(((T42.challenge&&T42.challenge.total_days)||42)/2):'Day '+((T42.challenge&&T42.challenge.total_days)||42);
    h+='<div class="sechead">'+t42PhaseLabel(p)+' · '+dayLbl+'</div>';
    if(!r){
      h+='<div class="acard"><div class="sub">'+
         (open?'Take this checkpoint first, then add photos.'
              :'Opens later in the challenge.')+'</div></div>';
      return;
    }
    h+='<div class="t42-photos">'+['front','side','back'].map(function(slot){
      var path=r['photo_'+slot];
      var url=path?t42PhotoUrls[path]:null;
      var busy=(t42PhotoBusy===p+'-'+slot);
      return '<div class="t42-photo'+(path?' has':'')+'" onclick="t42PickPhoto(\''+p+'\',\''+slot+'\')">'+
        (url?'<img class="t42-photo-img" src="'+t42Esc(url)+'" alt="">':
             '<div class="t42-photo-i">'+(busy?'…':(path?'✓':'＋'))+'</div>')+
        '<div class="t42-photo-l">'+slot.charAt(0).toUpperCase()+slot.slice(1)+'</div></div>';
    }).join('')+'</div>';
    if(r.photo_front||r.photo_side||r.photo_back)
      h+='<button class="bigbtn sec" onclick="t42ShowPhotos(\''+p+'\')">Show these photos</button>';
  });
  return h;
}

/* Signed links are fetched on demand and never stored. Leaving the screen
   throws them away, and they expire on their own in an hour. */
async function t42ShowPhotos(phase){
  var r=t42PhaseRow(phase); if(!r || !sb || !SUPA_READY) return;
  var paths=['photo_front','photo_side','photo_back']
    .map(function(k){ return r[k]; }).filter(function(x){ return x; });
  if(!paths.length) return;
  try{
    var s=await sb.storage.from('t42-photos').createSignedUrls(paths,3600);
    if(s.error) throw s.error;
    (s.data||[]).forEach(function(o){ if(o.path && o.signedUrl) t42PhotoUrls[o.path]=o.signedUrl; });
    t42RenderProgress();
  }catch(e){ toast((e&&e.message)||'Could not open those photos'); }
}

function t42PickPhoto(phase,slot){
  var r=t42PhaseRow(phase);
  if(!r){ toast('Take this checkpoint first'); return; }
  if(!sb || !SUPA_READY){ toast('Sign in to add photos'); return; }
  if(typeof document.createElement!=='function') return;
  var inp=document.createElement('input');
  inp.type='file'; inp.accept='image/*';
  inp.onchange=function(){
    var f=inp.files && inp.files[0];
    if(f) t42UploadPhoto(phase,slot,f);
  };
  inp.click();
}

async function t42UploadPhoto(phase,slot,file){
  var r=t42PhaseRow(phase); if(!r) return;
  if(file.size > 8*1024*1024){ toast('That photo is over 8MB'); return; }
  t42PhotoBusy=phase+'-'+slot; t42RenderProgress();
  try{
    var uid=await T42.uid();
    if(!uid) throw new Error('Sign in to add photos');
    /* The first path segment is the owner, which is what every storage
       policy checks. Extension follows the file so the bucket's mime list
       and the object agree. */
    var ext=(file.name||'').split('.').pop().toLowerCase();
    if(['jpg','jpeg','png','webp','heic'].indexOf(ext)<0) ext='jpg';
    var path=uid+'/'+phase+'-'+slot+'.'+ext;
    var up=await sb.storage.from('t42-photos')
      .upload(path,file,{upsert:true,contentType:file.type||'image/jpeg'});
    if(up.error) throw up.error;

    var patch={}; patch['photo_'+slot]=path;
    var m=await sb.from('t42_measurements').update(patch).eq('id',r.id).select().maybeSingle();
    if(m.error) throw m.error;
    t42SetPhase(phase,m.data);
    toast('Photo saved');
  }catch(e){
    toast((e&&e.message)||'Could not save that photo');
  }finally{
    t42PhotoBusy=''; t42RenderProgress();
  }
}

function t42SetPhase(phase,row){
  if(phase==='baseline') T42.baseline=row;
  if(phase==='mid')      T42.mid=row;
  if(phase==='final')    T42.final=row;
}


/* ═══════════════════════════════════════════════════════════════
   19 · Checkpoints — the mid-point and the final

   The same two numbers as the baseline, taken again. Deliberately NOT the
   baseline form: that one registers you, this one measures you, and a
   screen that could do both would eventually let someone re-register in
   week six and reset the line they are measured from.
   ═══════════════════════════════════════════════════════════════ */

var t42MeasPhase='mid';
var t42Meas={weight:'', waist:'', bodyfat:'', muscle:''};
var t42MeasReady=false;

function t42TakeMeasure(phase){
  t42MeasPhase=phase;
  var r=t42PhaseRow(phase);
  t42Meas={
    weight: r&&r.weight_kg!=null?String(r.weight_kg):'',
    waist:  r&&r.waist_cm!=null?String(r.waist_cm):'',
    bodyfat:r&&r.body_fat_pct!=null?String(r.body_fat_pct):'',
    muscle: r&&r.muscle_mass_kg!=null?String(r.muscle_mass_kg):''
  };
  t42MeasReady=true;
  /* The baseline has its own screen and its own rules. Sending someone
     there from a checkpoint row keeps one path to it. */
  if(phase==='baseline') return t42Go('baseline');
  t42Go('measure');
}

function t42RenderMeasure(){
  var el=$('t42-body'); if(!el) return;
  var p=t42MeasPhase, open=t42OpenPhase();
  if(!t42MeasReady) return t42Go('progress');

  if(p!==open && !t42PhaseRow(p)){
    el.innerHTML='<div class="acard"><div class="ah">'+ic('lock')+'<div class="t">Not open yet</div></div>'+
      '<div class="sub">The '+t42PhaseLabel(p).toLowerCase()+' checkpoint opens later in the challenge.</div>'+
      '<button class="bigbtn sec" onclick="t42GoProgress()">Back</button></div>';
    return;
  }

  var gym=T42.reg&&T42.reg.mode==='gym_duo';
  var b=T42.baseline;
  var h='<div class="hgroup"><div class="k">Day '+T42.dayNo()+'</div><h2>'+
        t42PhaseLabel(p)+' checkpoint</h2>'+
        '<p>The same two numbers as your baseline, measured the same way — '+
        'morning, before eating, same scale.</p></div>';

  if(b) h+='<div class="t42-note">Your baseline: '+(b.weight_kg!=null?b.weight_kg+' kg':'—')+
           (b.waist_cm!=null?' · '+b.waist_cm+' cm waist':'')+'</div>';

  h+='<div class="t42-field"><label for="t42-mw">Weight (kg)</label>'+
     '<input class="inp" id="t42-mw" type="number" inputmode="decimal" step="0.1" value="'+
     t42Esc(t42Meas.weight)+'" oninput="t42MeasNum(\'t42-mw\',\'weight\')"></div>'+
     '<div class="t42-field"><label for="t42-mc">Waist (cm)</label>'+
     '<input class="inp" id="t42-mc" type="number" inputmode="decimal" step="0.1" value="'+
     t42Esc(t42Meas.waist)+'" oninput="t42MeasNum(\'t42-mc\',\'waist\')"></div>';

  if(gym){
    h+='<div class="t42-note">Body fat and muscle mass come from the gym\'s InBody '+
       'and are entered by your coach. Leave them blank.</div>';
  }

  h+='<button class="bigbtn'+(t42MeasValid()?'':' off')+'" onclick="t42SaveMeasure()">'+
     (t42PhaseRow(p)?'Update ':'Save ')+t42PhaseLabel(p)+'</button>'+
     '<button class="bigbtn sec" onclick="t42GoProgress()">Back</button>';
  el.innerHTML=h;
}

function t42MeasNum(id,k){
  var e=$(id); if(!e) return;
  t42Meas[k]=e.value;
  var el=$('t42-body'); if(!el||!el.querySelectorAll) return;
  var b=el.querySelectorAll('.bigbtn');
  if(b&&b.length) b[0].classList.toggle('off', !t42MeasValid());
}
function t42MeasValid(){
  var w=parseFloat(t42Meas.weight), c=parseFloat(t42Meas.waist);
  return (w>20&&w<400) && (c>30&&c<250);
}

var t42MeasSaving=false;

async function t42SaveMeasure(){
  if(t42MeasSaving) return;
  if(!t42MeasValid()){ toast('Enter a weight and a waist'); return; }
  if(!sb || !SUPA_READY || !T42.reg){ toast('Sign in first'); return; }
  t42MeasSaving=true;
  try{
    var p=t42MeasPhase, existing=t42PhaseRow(p);
    var row={
      registration_id: T42.reg.id,
      phase: p,
      taken_on: t42TodayISO(),
      weight_kg: parseFloat(t42Meas.weight),
      waist_cm:  parseFloat(t42Meas.waist),
      /* Height does not change over six weeks, and asking again is asking
         twice. Carried from the baseline so the row can stand on its own. */
      height_cm: T42.baseline?T42.baseline.height_cm:null,
      source:'self',
      verify_status: p==='final' ? 'pending' : 'none'
    };
    var r = existing
      ? await sb.from('t42_measurements').update(row).eq('id',existing.id).select().maybeSingle()
      : await sb.from('t42_measurements').insert(row).select().maybeSingle();
    if(r.error) throw r.error;
    t42SetPhase(p,r.data);
    /* A final goes in for review. Saying so beats leaving someone to guess
       why their result is not final yet. */
    toast(p==='final' ? 'Final saved — sent for verification'
                      : t42PhaseLabel(p)+' saved');
    t42MeasReady=false;
    t42ProgTab='body';
    t42Go('progress');
  }catch(e){
    toast(t42SchemaMissing(e) ? 'T42 is not switched on for this account yet'
                              : ((e&&e.message)||'Could not save that'));
  }finally{
    t42MeasSaving=false;
  }
}


/* ═══════════════════════════════════════════════════════════════
   The fitness test

   Written onto the measurement for whichever checkpoint is open, so the
   improvement compares like with like: the baseline test against the final
   test, not against whatever was typed in on a random Tuesday.
   ═══════════════════════════════════════════════════════════════ */

var t42Fit={};
var t42FitReady=false;

/* The fitness test attaches to the baseline through week one, then to
   whichever checkpoint is open. Between the two there is nowhere for it to
   go — which is the point: the improvement compares one test with another,
   not with whatever was typed on a Tuesday in week two. */
function t42FitPhase(){
  if(T42.dayNo()<=T42.fitLockDay()) return 'baseline';
  return t42OpenPhase();
}

function t42TakeFitness(){
  var p=t42FitPhase();
  if(!p){ toast(t42FitClosedLine()); return; }
  var r=t42PhaseRow(p);
  t42Fit={};
  var f=(r&&r.fitness)||{};
  T42_FITNESS.forEach(function(x){ t42Fit[x.k]= f[x.k]!=null?String(f[x.k]):''; });
  t42FitReady=true;
  t42Go('fitness');
}

function t42RenderFitness(){
  var el=$('t42-body'); if(!el) return;
  if(!t42FitReady) return t42Go('progress');
  var p=t42FitPhase();
  if(!p) return t42Go('progress');
  var r=t42PhaseRow(p);

  var h='<div class="hgroup"><div class="k">'+t42PhaseLabel(p)+'</div><h2>Fitness test</h2>'+
        '<p>No equipment, about ten minutes. Rest properly between each one — '+
        'this is a measurement, not a workout.</p></div>';

  if(!r) h+='<div class="t42-note">Save your '+t42PhaseLabel(p).toLowerCase()+
            ' checkpoint first and the test attaches to it.</div>';

  T42_FITNESS.forEach(function(x){
    h+='<div class="t42-field"><label for="t42-f-'+x.k+'">'+x.n+' ('+x.u+')</label>'+
       '<input class="inp" id="t42-f-'+x.k+'" type="number" inputmode="numeric" value="'+
       t42Esc(t42Fit[x.k]||'')+'" oninput="t42FitNum(\''+x.k+'\')">'+
       '<div class="t42-q">'+x.hint+'</div></div>';
  });

  h+='<button class="bigbtn'+((r&&t42FitAny())?'':' off')+'" onclick="t42SaveFitness()">Save Test</button>'+
     '<button class="bigbtn sec" onclick="t42GoProgress()">Back</button>';
  el.innerHTML=h;
}

function t42FitNum(k){
  var e=$('t42-f-'+k); if(!e) return;
  t42Fit[k]=e.value;
  var el=$('t42-body'); if(!el||!el.querySelectorAll) return;
  var b=el.querySelectorAll('.bigbtn');
  var r=t42PhaseRow(t42FitPhase());
  if(b&&b.length) b[0].classList.toggle('off', !(r&&t42FitAny()));
}
function t42FitAny(){
  for(var i=0;i<T42_FITNESS.length;i++){
    var v=t42Fit[T42_FITNESS[i].k];
    if(v!=='' && v!=null && !isNaN(parseFloat(v))) return true;
  }
  return false;
}

var t42FitSaving=false;

async function t42SaveFitness(){
  if(t42FitSaving) return;
  var p=t42FitPhase(), r=p?t42PhaseRow(p):null;
  if(!r){ toast('Save that checkpoint first'); return; }
  if(!t42FitAny()){ toast('Fill in at least one result'); return; }
  if(!sb || !SUPA_READY){ toast('Sign in first'); return; }
  t42FitSaving=true;
  try{
    var f={};
    T42_FITNESS.forEach(function(x){
      var v=t42Fit[x.k];
      if(v!=='' && v!=null && !isNaN(parseFloat(v))) f[x.k]=parseFloat(v);
    });
    var up=await sb.from('t42_measurements').update({fitness:f})
      .eq('id',r.id).select().maybeSingle();
    if(up.error) throw up.error;
    t42SetPhase(p,up.data);
    toast('Fitness test saved');
    t42FitReady=false;
    t42ProgTab='fitness';
    t42Go('progress');
  }catch(e){
    toast((e&&e.message)||'Could not save the test');
  }finally{
    t42FitSaving=false;
  }
}


/* ═══════════════════════════════════════════════════════════════
   17 · Weekly review

   Computed here, from the member's own rows, and shown as provisional.
   It is NOT written to t42_weekly_reviews: that table is the scorer's,
   and a weekly score a browser could write is a weekly score a browser
   could choose. When Phase 4 lands, this screen reads the stored rows
   instead and stops computing anything.
   ═══════════════════════════════════════════════════════════════ */

function t42WeekStats(week){
  var total=(T42.challenge&&T42.challenge.total_days)||42;
  var from=(week-1)*7+1, to=Math.min(total, week*7);
  var days=to-from+1;
  var inWeek=function(c){ return c.day_no>=from && c.day_no<=to; };
  var cks=T42.checkins.filter(inWeek);
  var wks=T42.completions.filter(inWeek);
  var target=T42.stepTarget();
  var steps=cks.reduce(function(a,c){ return a+(c.steps||0); },0);
  var nut=cks.filter(function(c){ return c.nutrition==='on_track'; }).length;
  var stepDays=cks.filter(function(c){ return c.steps!=null && c.steps>=target; }).length;

  /* Elapsed days only. Scoring week 6 out of seven on a Tuesday would
     tell someone they are failing a week that has not happened. */
  var today=T42.dayNo();
  var elapsed=Math.max(0, Math.min(days, today-from+1));

  var score=null;
  if(elapsed>0){
    score=Math.round(((wks.length/elapsed)*0.4 + (cks.length/elapsed)*0.3 +
                      (stepDays/elapsed)*0.2 + (nut/elapsed)*0.1)*100);
    score=Math.max(0,Math.min(100,score));
  }
  return {week:week, from:from, to:to, days:days, elapsed:elapsed,
          workouts:wks.length, checkins:cks.length, steps:steps,
          nutrition:nut, stepDays:stepDays, score:score,
          complete: today>to};
}

function t42GoReview(){ t42Go('review'); }

function t42RenderReview(){
  var el=$('t42-body'); if(!el) return;
  var day=T42.dayNo();
  if(!day) return t42Go('progress');
  var wkNow=T42.weekNo();

  var h='<div class="hgroup"><div class="k">Week '+wkNow+'</div><h2>Weekly review</h2>'+
        '<p>What each week actually held.</p></div>';

  var guessed=0;
  for(var w=1; w<=wkNow; w++){
    var s=t42WeekStats(w);
    /* The server's review of this week, if it has written one. It counts
       workouts against what the plan asked for, which this app cannot see
       beyond today — so when both exist, the server's is the one shown. */
    var st=t42StoredWeek(w);
    if(!st) guessed++;
    var meta=T42.week && T42.week.week_no===w ? T42.week : null;
    var score = st ? Math.round(st.week_score) : s.score;
    h+='<div class="acard"><div class="ah">'+ic((s.complete?'✅':'⏳'))+''+
       '<div class="t">Week '+w+(meta&&meta.theme?' · '+t42Esc(meta.theme):'')+'</div>'+
       '<div class="c">'+(score!=null?score+'%':'')+'</div></div>'+
       '<div class="sub">'+(s.complete?'Complete':'In progress — day '+
         Math.min(s.elapsed,s.days)+' of '+s.days)+
         (st?' · scored':' · provisional')+'</div>'+
       '<div class="t42-grid" style="margin-top:11px;">'+
       t42Stat('Workouts',  st ? st.workouts_done+' / '+st.workouts_target : s.workouts+' / '+s.elapsed)+
       t42Stat('Check-ins', (st?st.checkins_done:s.checkins)+' / '+s.elapsed)+
       t42Stat('Steps',     t42Num(st?st.steps_total:s.steps))+
       t42Stat('On track',  (st?st.nutrition_days:s.nutrition)+' days')+
       '</div></div>';
  }

  if(guessed)
    h+='<div class="t42-note">Weeks marked provisional are this app doing the arithmetic on '+
       'your own rows. Your official T42 score is computed on the server and is not '+
       'the same number.</div>';
  h+=''+
     '<button class="bigbtn sec" onclick="t42GoProgress()">Back</button>';
  el.innerHTML=h;
}


/* ═══════════════════════════════════════════════════════════════
   The rules, as the app sees them
   ═══════════════════════════════════════════════════════════════ */

/* Whether a checkpoint can be touched today. Mirrors the measurement guard
   in 24-t42-scoring.sql exactly, and for the same reason the server has it:
   the baseline is the line every result is measured from. */
function t42CanEdit(p){
  var r=t42PhaseRow(p);
  if(r && (r.verify_status==='verified' || r.verify_status==='flagged')) return false;
  if(p==='baseline') return T42.dayNo()<=T42.lockDay();
  return t42OpenPhase()===p;
}

/* What a reviewer has said about a checkpoint, in a few words. Silence on
   the baseline and mid, which nobody reviews unless asked. */
function t42VerifyWord(r){
  if(!r) return '';
  if(r.verify_status==='verified') return ' · verified';
  if(r.verify_status==='pending' && r.phase==='final') return ' · awaiting check';
  if(r.verify_status==='resubmit') return ' · please resubmit';
  if(r.verify_status==='flagged')  return ' · under review';
  return '';
}

function t42FitButton(label){
  if(t42FitPhase()) return '<button class="bigbtn sec" onclick="t42TakeFitness()">'+label+'</button>';
  return '<div class="t42-q" style="margin-top:10px;">'+t42Esc(t42FitClosedLine())+'</div>';
}
function t42FitClosedLine(){
  var total=(T42.challenge&&T42.challenge.total_days)||42;
  return 'The next fitness test opens with the mid-point, on day '+Math.round(total/2)+'.';
}

function t42StoredWeek(w){
  var r=T42.reviews||[];
  for(var i=0;i<r.length;i++) if(r[i].week_no===w) return r[i];
  return null;
}

function t42Fmt(n){
  if(n==null || isNaN(n)) return '—';
  return (Math.round(Number(n)*10)/10).toFixed(1);
}


/* ═══════════════════════════════════════════════════════════════
   16 · The leaderboard

   Names and totals, and nothing else. It is read through t42_leaderboard,
   a server function that returns a first name, an initial, a place and a
   score — so there is no column here that could carry a weight or a photo
   even by mistake.
   ═══════════════════════════════════════════════════════════════ */

var T42_BOARDS=[
  {id:'transform_female', n:'Transform · Women'},
  {id:'transform_male',   n:'Transform · Men'},
  {id:'perform_female',   n:'Perform · Women'},
  {id:'perform_male',     n:'Perform · Men'},
  {id:'consistency',      n:'Consistency'}
];
var t42BoardMode='online';          // online | duo
var t42Board=null;                  // which board is open
var t42BoardRows={};                // board id -> rows from the server
var t42BoardState={};               // board id -> loading | ready | error

/* The board a participant competes on. START has no transformation board —
   it is judged on showing up, so its board is Consistency. */
function t42MyBoard(){
  var s=T42.score;
  if(s && s.category && s.category.indexOf('gym_')!==0) return s.category;
  var r=T42.reg;
  if(!r || r.track==='start' || !r.gender) return 'consistency';
  return r.track+'_'+r.gender;
}
function t42MyRank(){
  var s=T42.score; if(!s || !s.eligible) return null;
  return t42MyBoard()==='consistency' ? s.rank_consistency : s.rank_category;
}

function t42RenderRank(){
  var el=$('t42-body'); if(!el) return;
  if(!T42.reg) return t42RenderLanding();
  if(!t42Board) t42Board=t42MyBoard();
  if(!t42BoardModeSet){ t42BoardMode=T42.isGym()?'duo':'online'; t42BoardModeSet=true; }

  var h='<div class="segs" id="t42-ranktabs">'+
    '<button class="seg'+(t42BoardMode==='online'?' on':'')+'" onclick="t42RankMode(\'online\')">Online solo</button>'+
    '<button class="seg'+(t42BoardMode==='duo'?' on':'')+'" onclick="t42RankMode(\'duo\')">Gym duo</button></div>';

  if(t42BoardMode==='duo'){ el.innerHTML=h+t42DuoBoard(); return; }

  h+='<div class="t42-pills t42-boards">'+T42_BOARDS.map(function(b){
    return '<button class="t42-pill'+(t42Board===b.id?' on':'')+
           '" onclick="t42RankBoard(\''+b.id+'\')">'+t42Esc(b.n)+'</button>';
  }).join('')+'</div>';

  /* Your own standing, from your own score row, above the list — so it is
     there whether or not you are in the top ten. */
  var mine=t42MyBoard()===t42Board, sc=T42.score;
  if(mine){
    var rk=t42MyRank();
    h+='<div class="t42-me">'+
       '<div class="t42-me-l">You</div>'+
       (sc && sc.eligible && rk
         ? '<div class="t42-me-r">#'+rk+'</div><div class="t42-me-s">'+
           t42Fmt(t42Board==='consistency'?sc.consistency_total:sc.total)+'</div>'
         : '<div class="t42-me-n">'+t42Esc(sc&&sc.note?sc.note:'Not ranked yet')+'</div>')+
       '</div>';
  }

  var st=t42BoardState[t42Board], rows=t42BoardRows[t42Board]||[];
  if(!st){ t42LoadBoard(t42Board); st='loading'; }

  if(st==='loading'){
    h+='<div class="acard"><div class="sub">Loading the leaderboard…</div></div>';
  } else if(st==='error'){
    h+='<div class="acard"><div class="sub">Could not load this leaderboard.</div>'+
       '<button class="bigbtn sec" onclick="t42RankReload()">Try again</button></div>';
  } else if(!rows.length){
    h+='<div class="acard"><div class="ah">'+ic('flag')+'<div class="t">No ranking yet</div></div>'+
       '<div class="sub">Scores are worked out on the server every hour once the challenge '+
       'is running. The first ranking appears here.</div></div>';
  } else {
    h+='<div class="sechead">Top '+rows.length+'</div>';
    rows.forEach(function(r){
      h+='<div class="t42-lb'+(r.is_me?' me':'')+'">'+
         '<span class="t42-lb-p'+(r.place<=3?' top':'')+'">'+(r.place!=null?r.place:'–')+'</span>'+
         '<span class="t42-lb-n">'+t42Esc(r.display_name)+(r.is_me?' · you':'')+'</span>'+
         '<span class="t42-lb-s">'+t42Fmt(r.score)+'</span></div>';
    });
  }

  h+='<div class="t42-note">Only first names and scores are shown here. Weight, waist, body fat '+
     'and photos never appear on any leaderboard.</div>';
  el.innerHTML=h;
}

var t42BoardModeSet=false;
function t42RankMode(m){ t42BoardMode=m; t42BoardModeSet=true; t42RenderRank(); }
function t42RankBoard(id){ t42Board=id; t42RenderRank(); }
function t42RankReload(){ delete t42BoardState[t42Board]; t42RenderRank(); }

async function t42LoadBoard(id){
  t42BoardState[id]='loading';
  if(!sb || !SUPA_READY || !T42.challenge){ t42BoardState[id]='error'; return; }
  try{
    var r=await sb.rpc('t42_leaderboard',{p_challenge:T42.challenge.id, p_category:id, p_limit:10});
    if(r.error) throw r.error;
    t42BoardRows[id]=r.data||[];
    t42BoardState[id]='ready';
  }catch(e){
    t42BoardState[id]= t42SchemaMissing(e) ? 'ready' : 'error';
    t42BoardRows[id]=[];
  }
  /* Only repaint if the member is still looking at this board. A slow
     answer for Perform must not replace Transform they have since opened. */
  if(t42View==='rank' && t42Board===id) t42RenderRank();
}


/* ═══════════════════════════════════════════════════════════════
   After the last day
   ═══════════════════════════════════════════════════════════════ */

function t42Finished(what){
  var el=$('t42-body'); if(!el) return;
  el.innerHTML='<div class="acard"><div class="ah">'+ic('flag')+'<div class="t">T42 has finished</div></div>'+
    '<div class="sub">'+t42Esc(what)+' closed with the last day. Everything you logged is in — '+
    'and HITFAT+ carries on without the challenge.</div>'+
    '<button class="bigbtn sec" onclick="t42GoDash()">See where you finished</button></div>';
}

async function t42OpenPast(){
  var p=T42.past; if(!p) return;
  T42.challenge=p.challenge; T42.reg=p.reg; T42.past=null;
  T42.state='loading'; t42Go('result');
  try{ await T42.loadReg(); }catch(e){}
  T42.state='ready';
  t42Paint(); t42Segs();
}


/* ═══════════════════════════════════════════════════════════════
   19 · The final assessment

   The same checkpoint as the mid-point, plus everything a result is judged
   on, as one list. Each line opens the screen that fills it — nothing is
   entered here, so there is still only one place to enter each thing.
   ═══════════════════════════════════════════════════════════════ */

function t42FinalItems(){
  var f=T42.final, gym=T42.reg && T42.reg.mode==='gym_duo';
  var items=[
    {n:'Final weight & waist', ic:'measure', done:!!(f && f.weight_kg!=null && f.waist_cm!=null),
     go:"t42TakeMeasure('final')"},
    {n:'Final photos', ic:'photo', done:!!(f && (f.photo_front||f.photo_side||f.photo_back)),
     go:'t42GoPhotos()'},
    {n:'Final fitness test', ic:'workout', done:!!(f && f.fitness && Object.keys(f.fitness).length),
     go:'t42TakeFitness()'},
    /* RUSH is its own product and the app cannot see a race until the two
       are linked. Listed so it is not forgotten; not counted as missing. */
    {n:'Final RUSH race', ic:'rush', done:null, go:'t42Rush()', optional:true}
  ];
  if(gym) items.push({n:'Final InBody', ic:'gym', done:!!(f && f.body_fat_pct!=null), go:'t42Noop()', coach:true});
  return items;
}

function t42RenderFinal(){
  var el=$('t42-body'); if(!el) return;
  if(!T42.reg) return t42RenderLanding();
  var total=(T42.challenge&&T42.challenge.total_days)||42;
  var open=t42OpenPhase()==='final' || T42.isOver();
  var over=T42.isOver();
  var f=T42.final;

  var h='<div class="hgroup"><div class="k">'+(over?'T42 has finished':'Day '+T42.dayNo()+' of '+total)+
        '</div><h2>Final assessment</h2><p>'+
        (open ? 'The numbers your result is judged on. Measure the way you did on day one — '+
                'morning, before eating, same scale.'
              : 'Opens on day '+Math.max(1,total-3)+'.')+'</p></div>';

  if(!T42.hasBaseline()){
    h+='<div class="acard"><div class="sub">There is no baseline to compare a final against, so '+
       'this edition is not ranked for you.</div></div>';
    el.innerHTML=h+'<button class="bigbtn sec" onclick="t42GoNext()">What\'s next</button>';
    return;
  }

  h+='<div class="t42-list">';
  t42FinalItems().forEach(function(it){
    var clickable = open && !it.coach && !(f && f.verify_status==='verified' && !it.optional);
    var mark = it.done===true ? '<span class="t42-tick">✓</span>'
             : it.optional    ? '<span class="t42-rest">optional</span>'
             : it.coach       ? '<span class="t42-rest">coach</span>'
             : open           ? '<span class="t42-chev">›</span>'
             :                  '<span class="t42-rest">locked</span>';
    var sub = it.done===true ? 'Done'
            : it.optional    ? 'Race at rush.hitfat.io'
            : it.coach       ? 'Taken at HQ and entered by your coach'
            : open           ? 'Not yet' : 'Opens day '+Math.max(1,total-3);
    h+='<div class="t42-row'+(it.done?' done':'')+'" onclick="'+(clickable?it.go:'t42Noop()')+'">'+
       t42Ic(it.ic||'check')+'<div class="t42-row-b"><div class="t42-row-l">'+t42Esc(it.n)+'</div>'+
       '<div class="t42-row-v">'+t42Esc(sub)+'</div></div>'+mark+'</div>';
  });

  h+='</div>';
  if(f){
    var vs=f.verify_status;
    h+='<div class="acard" style="margin-top:12px;"><div class="ah">'+ic(vs==='verified'?'check':vs==='resubmit'?'repeat':vs==='flagged'?'warning':'clock')+''+
       '<div class="t">'+(vs==='verified'?'Your final is verified'
                        :vs==='resubmit'?'Please resubmit'
                        :vs==='flagged'?'Your final is under review'
                        :'Waiting for verification')+'</div></div>'+
       '<div class="sub">'+(f.verify_note&&vs!=='verified' ? t42Esc(f.verify_note)
         : vs==='verified' ? 'Nothing more to do. Your result is counted.'
         : 'A reviewer compares your final with your baseline. Top finishers are always checked before results are announced.')+
       '</div></div>';
  }

  var code=T42.reg && T42.reg.verify_code;
  if(code && T42.reg.mode!=='gym_duo')
    h+='<div class="t42-note">If you are asked to verify, photograph your scale with your code, '+
       '<b>'+t42Esc(code)+'</b>, written on paper beside it.</div>';

  if(over) h+='<div class="t42-note">Results are announced once every podium final has been checked.</div>';
  el.innerHTML=h;
}


/* ═══════════════════════════════════════════════════════════════
   20 · The result

   Only the member's own numbers, and only once the server has closed the
   edition. Everything here is the change from their own baseline — there
   is no "you beat 60% of people", because this screen is not about them.
   ═══════════════════════════════════════════════════════════════ */

/* The same fitness arithmetic the scorer uses: the average improvement
   across whichever tests were taken both times, faster being better for
   the run and more being better for everything else. */
function t42FitImprove(){
  var b=(T42.baseline&&T42.baseline.fitness)||{}, l=(t42Latest()&&t42Latest().fitness)||{};
  var sum=0, n=0;
  Object.keys(b).forEach(function(k){
    var a=Number(b[k]), c=Number(l[k]);
    if(!(a>0) || isNaN(c) || l[k]==null) return;
    sum += k==='run1k_sec' ? (a-c)/a : (c-a)/a; n++;
  });
  return n ? Math.round(sum/n*1000)/10 : null;
}

function t42RenderResult(){
  var el=$('t42-body'); if(!el) return;
  if(!T42.reg) return t42RenderLanding();
  if(!T42.isComplete()) return t42RenderFinal();
  var total=(T42.challenge&&T42.challenge.total_days)||42;
  var sc=T42.score, board=t42MyBoard();
  var steps=T42.checkins.reduce(function(a,c){ return a+(c.steps||0); },0);
  var fit=t42FitImprove();

  var h='<div class="t42-hero" style="padding-bottom:6px;">'+
        '<div class="t42-trophy">'+glyph('trophy')+'</div>'+
        '<div class="t42-logo" style="font-size:44px;">T42 COMPLETE</div>'+
        '<div class="t42-sub">'+total+' / '+total+' DAYS · '+
        t42Esc((T42.challenge.edition||T42.challenge.name||'').toUpperCase())+'</div></div>';

  var dw=t42Delta('weight_kg'), dc=t42Delta('waist_cm');
  h+='<div class="t42-grid">'+
     t42Change('Weight', dw, 'kg', t42DeltaPct('weight_kg'))+
     t42Change('Waist',  dc, 'cm', t42DeltaPct('waist_cm'))+
     t42Stat('Workouts',    T42.workoutPct()+'%')+
     t42Stat('Steps',       t42Num(steps))+
     t42Stat('Fitness',     fit!=null ? t42Signed(fit,'%') : '—')+
     t42Stat('Consistency', T42.consistency()+'%')+
     t42Stat('Check-ins',   T42.checkins.length+' / '+total)+
     t42Stat('Longest streak', t42BestStreak()+' days')+
     /* Missions exist from the v2 engine on; an older edition has none to show. */
     ((T42.reviews||[]).some(function(w){ return w.mission_done!=null; })
       ? t42Stat('Missions', (T42.reviews||[]).filter(function(w){ return w.mission_done; }).length+' / '+
                 (T42.reviews||[]).filter(function(w){ return w.mission_done!=null; }).length)
       : '')+
     '</div>';

  if(sc && sc.eligible){
    var rk=t42MyRank(), v=board==='consistency'?sc.consistency_total:sc.total;
    var bn=(T42_BOARDS.filter(function(b){ return b.id===board; })[0]||{}).n||'';
    h+='<div class="t42-score"><div class="t42-score-l">Your T42 score</div>'+
       '<div class="t42-score-n">'+t42Fmt(v)+'</div>'+
       (rk?'<div class="t42-score-r">#'+rk+' · '+t42Esc(bn)+'</div>':'')+'</div>';
  } else {
    h+='<div class="acard"><div class="ah">'+ic('clipboard')+'<div class="t">Not ranked</div></div>'+
       '<div class="sub">'+t42Esc(sc&&sc.note ? sc.note+'.' :
         'A ranked result needs a baseline and a final assessment.')+
       ' Everything above is still yours.</div></div>';
  }

  if(T42.certs && T42.certs.length)
    h+='<button class="bigbtn" onclick="t42GoCert()">'+
       (T42.certs.length>1?'Claim Your Certificates':'Claim Certificate')+'</button>';
  h+='<button class="bigbtn sec" onclick="t42GoRank()">Final leaderboard</button>'+
     '<button class="bigbtn sec" onclick="t42GoNext()">What\'s next</button>';
  el.innerHTML=h;
}


/* ═══════════════════════════════════════════════════════════════
   21 · The certificate

   Issued by the server when the edition is finalised, and drawn here onto
   a canvas from that frozen row — the name, the edition, the score and a
   serial exactly as they were on the day. Nothing on it is read live, so a
   certificate that has been posted does not quietly change afterwards.
   ═══════════════════════════════════════════════════════════════ */

var T42_CERT_TITLE={
  finisher:'FINISHER',
  transformation_champion:'TRANSFORMATION CHAMPION',
  performance_champion:'PERFORMANCE CHAMPION',
  consistency_champion:'CONSISTENCY CHAMPION',
  duo_champion:'DUO CHAMPION'
};
var t42CertPick=0;
var t42CertImg={};                   // certificate id -> data URL
var t42CertFail={};                  // certificate id -> true once drawing it has failed
var t42CertCv={};                    // certificate id -> the canvas it was drawn on

function t42RenderCert(){
  var el=$('t42-body'); if(!el) return;
  var cs=T42.certs||[];

  if(!cs.length){
    var sc=T42.score;
    el.innerHTML='<div class="hgroup"><div class="k">T42</div><h2>Certificate</h2></div>'+
      '<div class="acard"><div class="sub">'+
      (!T42.isComplete() ? 'Certificates are issued when the results are announced.'
        : (sc && sc.eligible) ? 'Your certificate is being issued. Check back shortly.'
        : 'Certificates go to everyone who completed a baseline and a final assessment.')+
      '</div></div><button class="bigbtn sec" onclick="t42GoResult()">Back</button>';
    return;
  }

  if(t42CertPick>=cs.length) t42CertPick=0;
  var c=cs[t42CertPick];
  var h='<div class="hgroup"><div class="k">'+t42Esc(c.edition||'T42')+'</div><h2>'+
        (cs.length>1?'Your certificates':'Your certificate')+'</h2></div>';

  if(cs.length>1){
    h+='<div class="t42-pills t42-boards">'+cs.map(function(x,i){
      return '<button class="t42-pill'+(i===t42CertPick?' on':'')+'" onclick="t42CertTab('+i+')">'+
             t42Esc(T42_CERT_TITLE[x.kind]||x.kind)+'</button>';
    }).join('')+'</div>';
  }

  var img=t42CertImg[c.id];
  if(img){
    h+='<img class="t42-cert" src="'+img+'" alt="'+t42Esc((T42_CERT_TITLE[c.kind]||'')+' — '+c.participant_name)+'">';
  } else if(t42CertFail[c.id]){
    /* Drawn once, failed once — said, not retried. Retrying from here is
       what used to loop: render, draw, fail, render again, until the stack
       gave out and the screen froze. */
    h+='<div class="acard"><div class="ah">'+ic('warning')+'<div class="t">'+
       t42Esc(T42_CERT_TITLE[c.kind]||'Certificate')+'</div></div>'+
       '<div class="sub">'+t42Esc(c.participant_name)+' · '+t42Esc(c.edition||'')+
       '. This phone could not draw the image — your certificate is issued and safe.</div></div>';
  } else {
    h+='<div class="acard"><div class="sub">Preparing your certificate…</div></div>';
  }

  h+='<div class="t42-q" style="text-align:center;">Serial '+t42Esc(c.serial||'—')+' · issued '+
     t42Esc(c.issued_on||'')+'</div>'+
     '<button class="bigbtn" onclick="t42ShareCert()">Share</button>'+
     '<button class="bigbtn sec" onclick="t42SaveCert()">Save image</button>'+
     '<button class="bigbtn sec" onclick="t42GoResult()">Back</button>';
  el.innerHTML=h;
  /* Drawn only after the screen is written. When drawing finishes at once
     — a browser without document.fonts — it repaints with the image, and
     starting it mid-render meant this function's own later innerHTML
     overwrote that image with "Preparing…" again. */
  if(!img && !t42CertFail[c.id]) t42DrawCertAsync(c);
}
function t42CertTab(i){ t42CertPick=i; t42RenderCert(); }

/* Fonts first: a certificate drawn before Oswald has loaded is drawn in the
   fallback serif and cached that way. */
function t42DrawCertAsync(c){
  var go=function(){
    try{ t42DrawCert(c); }catch(e){ if(typeof console!=='undefined') console.warn('[T42] certificate',e); }
    if(!t42CertImg[c.id]) t42CertFail[c.id]=true;
    if(t42View==='cert') t42RenderCert();
  };
  if(typeof document!=='undefined' && document.fonts && document.fonts.load){
    Promise.all([document.fonts.load("700 100px 'Oswald'"), document.fonts.load("800 40px 'Inter'")])
      .then(function(){ return document.fonts.ready; }).then(go, go);
  } else go();
}

/* Shrinks a line until it fits, so a long name is smaller rather than off
   the edge of the page. */
function t42FitText(x,text,maxW,size,weight,family){
  var s=size;
  do { x.font=weight+' '+s+'px '+family; s-=2; }
  while(s>18 && x.measureText(text).width>maxW);
  return x.font;
}

function t42DrawCert(c){
  var cv=document.createElement('canvas');
  var W=1080, H=1350;
  cv.width=W; cv.height=H;
  var x=cv.getContext('2d'); if(!x) return;

  // paper, and a double rule around it
  x.fillStyle='#F7F5F1'; x.fillRect(0,0,W,H);
  x.strokeStyle='#0B0B0D'; x.lineWidth=6; x.strokeRect(48,48,W-96,H-96);
  x.strokeStyle='rgba(11,11,13,.22)'; x.lineWidth=2; x.strokeRect(68,68,W-136,H-136);

  x.textAlign='center'; x.textBaseline='alphabetic';
  x.fillStyle='#0B0B0D';
  x.font="700 30px 'Oswald', sans-serif";
  if(typeof _spaced==='function') _spaced(x,'HITFAT',W/2,172,10); else x.fillText('HITFAT',W/2,172);

  var g=x.createLinearGradient(W/2-170,0,W/2+170,0);
  g.addColorStop(0,'#1FA7E8'); g.addColorStop(.78,'#F0392B');
  x.fillStyle=g; x.font="700 200px 'Oswald', sans-serif";
  x.fillText('T42',W/2,392);

  x.fillStyle='#0B0B0D'; x.font="600 28px 'Oswald', sans-serif";
  if(typeof _spaced==='function') _spaced(x,'TRANSFORMATION 42 DAYS',W/2,446,7);
  else x.fillText('TRANSFORMATION 42 DAYS',W/2,446);

  var title=T42_CERT_TITLE[c.kind]||'FINISHER';
  t42FitText(x,title,W-220,82,'700',"'Oswald', sans-serif");
  x.fillText(title,W/2,610);

  x.fillStyle='#5A5751'; x.font="400 30px 'Inter', sans-serif";
  x.fillText('This certifies that',W/2,716);

  x.fillStyle='#0B0B0D';
  t42FitText(x,c.participant_name||'',W-220,64,'800',"'Inter', sans-serif");
  x.fillText(c.participant_name||'',W/2,806);

  x.fillStyle='#5A5751'; x.font="400 30px 'Inter', sans-serif";
  x.fillText('completed all 42 days of the T42 challenge',W/2,876);
  x.fillText(c.edition||'',W/2,922);

  if(c.final_score!=null){
    x.fillStyle='#0B0B0D'; x.font="700 44px 'Oswald', sans-serif";
    x.fillText('SCORE '+t42Fmt(c.final_score),W/2,1024);
  }

  // footer: the date on the left, the serial on the right, a rule between
  x.strokeStyle='rgba(11,11,13,.25)'; x.lineWidth=2;
  x.beginPath(); x.moveTo(140,1150); x.lineTo(W-140,1150); x.stroke();
  x.fillStyle='#5A5751'; x.font="600 22px 'Inter', sans-serif";
  x.textAlign='left';  x.fillText('ISSUED '+String(c.issued_on||'').toUpperCase(),140,1196);
  x.textAlign='right'; x.fillText(String(c.serial||''),W-140,1196);
  x.textAlign='center'; x.fillStyle='#0B0B0D'; x.font="700 26px 'Oswald', sans-serif";
  x.fillText('HITFAT',W/2,1250);

  t42CertCv[c.id]=cv;
  t42CertImg[c.id]=cv.toDataURL('image/png');
}

function t42CertFile(){
  var c=(T42.certs||[])[t42CertPick];
  return c ? 'T42-'+(T42_CERT_TITLE[c.kind]||'certificate').replace(/\s+/g,'-')+'.png' : 'T42.png';
}

/* The phone's own share sheet where it has one — which is where a
   certificate is actually going, to a story or a family chat. */
function t42ShareCert(){
  var c=(T42.certs||[])[t42CertPick], cv=c&&t42CertCv[c.id];
  if(!cv){ toast('Still preparing your certificate'); return; }
  if(!cv.toBlob) return t42SaveCert();
  cv.toBlob(function(b){
    try{
      if(b && typeof navigator!=='undefined' && navigator.canShare){
        var f=new File([b],t42CertFile(),{type:'image/png'});
        if(navigator.canShare({files:[f]})){
          navigator.share({files:[f], title:'T42 · '+(T42_CERT_TITLE[c.kind]||''),
                           text:'I finished T42 — Transformation 42 Days with HITFAT.'}).catch(function(){});
          return;
        }
      }
      t42SaveCert();
    }catch(e){ t42SaveCert(); }
  },'image/png');
}
function t42SaveCert(){
  var c=(T42.certs||[])[t42CertPick], url=c&&t42CertImg[c.id];
  if(!url){ toast('Still preparing your certificate'); return; }
  var a=document.createElement('a');
  a.href=url; a.download=t42CertFile();
  document.body.appendChild(a); a.click();
  setTimeout(function(){ try{ document.body.removeChild(a); }catch(e){} },1200);
}


/* ═══════════════════════════════════════════════════════════════
   22 · What's next

   Forty-two days builds a habit; the worst thing the app can do on day 43
   is have nothing to say. Every card here opens something that exists
   today — no card for a product that is not there yet.
   ═══════════════════════════════════════════════════════════════ */

function t42RenderNext(){
  var el=$('t42-body'); if(!el) return;
  var h='<div class="hgroup"><div class="k">After T42</div><h2>What\'s next?</h2>'+
        '<p>You have a routine now. Here is where to keep it.</p></div>';

  h+=t42NextCard('💪','Keep training in HITFAT+',
      'Every program and all 310 filmed exercises you have used here, on your own schedule.',
      't42NextTrain()','Open programs');
  h+=t42NextCard('🛒','Pick your next program',
      'Programs you buy once and keep — no subscription.', 't42NextStore()','Open the store');
  h+=t42NextCard('⚡','HITFAT RUSH',
      'Keep racing. Your times carry on at rush.hitfat.io.', 't42Rush()','Open RUSH');
  h+=t42NextCard('🏛️','Train with us at HITFAT HQ',
      'Coach-led classes in Kota Bharu, with InBody and a community.', 't42NextGym()','Ask about the gym');
  h+=t42NextCard('🏃','HYROX training',
      'Structured HYROX preparation with the HITFAT coaches.', 't42NextHyrox()','Ask about HYROX');

  /* The next edition — a new registration, never a carry-over — or a
     promise that it will show up in the one place they already look. */
  h+=t42NextEditionCard();

  h+='<button class="bigbtn sec" onclick="t42GoResult()">Back to my result</button>';
  el.innerHTML=h;
}

function t42NextCard(icon,title,sub,go,label){
  return '<div class="acard"><div class="ah">'+ic(icon)+'<div class="t">'+t42Esc(title)+'</div></div>'+
    '<div class="sub">'+t42Esc(sub)+'</div>'+
    '<button class="bigbtn sec" onclick="'+go+'">'+t42Esc(label)+'</button></div>';
}
function t42NextTrain(){ if(typeof switchTab==='function') switchTab('train'); }
function t42NextStore(){ if(typeof openStore==='function') openStore(); }
function t42NextGym(){ if(typeof clubEnquire==='function') clubEnquire(); }
/* The same HITFAT WhatsApp line the Club uses for enquiries, with a message
   that says where it came from. */
function t42NextHyrox(){
  window.open('https://wa.me/60176132170?text='+encodeURIComponent(
    'Hi HITFAT, I just finished T42 and I would like to know about HYROX training.'),'_blank');
}


/* ═══════════════════════════════════════════════════════════════
   GYM DUO

   Two people, one team score, one gym. Everything the gym already does —
   the QR at the counter, the coach who scans it, the roster — is HITFAT
   Club's, and T42 reads the result rather than running a second copy.
   What is T42's is the pairing and the partner card.
   ═══════════════════════════════════════════════════════════════ */

function t42DuoMe(){
  var c=T42.duoCard||[];
  for(var i=0;i<c.length;i++) if(c[i].is_me) return c[i];
  return null;
}
function t42DuoPartner(){
  var c=T42.duoCard||[];
  for(var i=0;i<c.length;i++) if(!c[i].is_me) return c[i];
  return null;
}

/* How ready the team is to compete: each partner needs a registration, a
   baseline and — on TRANSFORM, which is 40% body fat — an InBody. A
   partner who has not joined yet counts as nothing done, because the team
   cannot start without them. */
function t42DuoReadiness(){
  var need=(T42.reg&&T42.reg.track==='transform')?3:2, done=0;
  [t42DuoMe(), t42DuoPartner()].forEach(function(m){
    if(!m) return;
    done+=1;                                   // registered
    if(m.baseline_ok) done+=1;
    if(need===3 && m.inbody_ok) done+=1;
  });
  return Math.round(done/(need*2)*100);
}

/* Club check-in is where the QR lives. T42 sends the member there rather
   than drawing a second QR a coach would have to know about. */
function t42GymCheckin(){
  if(typeof openClub!=='function'){ toast('Gym check-in is not available'); return; }
  openClub();
  if(typeof clubGoCheckin==='function') clubGoCheckin();
}


/* ── 05 · the duo screen ── */
function t42RenderDuo(){
  var el=$('t42-body'); if(!el) return;
  if(!T42.isGym()) return t42GoDash();

  var h='<div class="hgroup"><div class="k">Gym Duo</div><h2>'+
        (T42.reg.duo_id?'Your duo':'Create your duo')+'</h2>'+
        '<p>Find your partner. Finish together.</p></div>';

  if(!T42.reg.duo_id){
    if(!T42.duoWindowOpen()){
      h+='<div class="acard"><div class="ah">'+ic('lock')+'<div class="t">Pairing has closed</div></div>'+
         '<div class="sub">Duos were fixed when the baseline closed on day '+T42.lockDay()+
         '. You can still train, check in and log everything — the duo board is for pairs.</div></div>';
      el.innerHTML=h; return;
    }
    h+='<div class="acard"><div class="ah">'+ic('plus')+'<div class="t">Invite a partner</div></div>'+
       '<div class="sub">Create the duo and get a code to give your partner.</div>'+
       '<button class="bigbtn" onclick="t42DuoCreate()">Create Duo</button></div>';
    h+='<div class="acard"><div class="ah">'+ic('key')+'<div class="t">Enter your partner\'s code</div></div>'+
       '<div class="sub">They created the duo? Type the code they gave you.</div>'+
       '<input class="inp t42-codein" id="t42-duocode" maxlength="8" placeholder="T42-K8F2" '+
       'autocapitalize="characters" autocomplete="off" spellcheck="false">'+
       '<button class="bigbtn sec" onclick="t42DuoJoin()">Join Duo</button></div>';
    h+='<div class="t42-note">A duo is two partners of the same gender on the same track, '+
       'each with their own HITFAT+ account. Pairs can change until day '+T42.lockDay()+'.</div>';
    /* Pairing can wait. Nothing else in T42 depends on it — the duo only
       decides who you are ranked with — so it must never be a wall. */
    h+='<button class="bigbtn sec" onclick="t42DuoDone()">Skip for now</button>';
    el.innerHTML=h; return;
  }

  var code=T42.duo&&T42.duo.code;
  h+='<div class="acard"><div class="ah">'+ic('people')+'<div class="t">Your duo code</div></div>'+
     '<div class="t42-code">'+t42Esc(code||'—')+'</div>'+
     '<div class="sub" style="margin-top:8px;">Give this to your partner. Both of you must finish registration.</div>'+
     (code?'<button class="bigbtn sec" onclick="t42DuoShare()">Send the code</button>':'')+'</div>';

  h+='<div class="sechead">Team status</div><div class="t42-list">';
  var tr=T42.reg.track==='transform';
  [t42DuoMe(), t42DuoPartner()].forEach(function(m,i){
    if(!m){
      h+='<div class="t42-row">'+t42Ic('clock')+'<div class="t42-row-b">'+
         '<div class="t42-row-l">'+(i===0?'You':'Your partner')+'</div>'+
         '<div class="t42-row-v">Waiting for them to join with the code</div></div></div>';
      return;
    }
    var bits=['Registered ✓', 'Baseline '+(m.baseline_ok?'✓':'pending')];
    if(tr) bits.push('InBody '+(m.inbody_ok?'✓':'at HQ'));
    h+='<div class="t42-row'+(m.ready?' done':'')+'">'+t42Ic('person')+
       '<div class="t42-row-b"><div class="t42-row-l">'+t42Esc(m.is_me?'You':m.display_name)+'</div>'+
       '<div class="t42-row-v">'+t42Esc(bits.join(' · '))+'</div></div>'+
       (m.ready?'<span class="t42-tick">✓</span>':'<span class="t42-rest">not ready</span>')+'</div>';
  });

  h+='</div>';
  var pct=t42DuoReadiness();
  h+=t42Bar('Team readiness', pct);
  if(pct<100)
    h+='<div class="t42-q">The duo competes once both of you are ready.'+
       (tr?' The InBody is done at HQ with a coach.':'')+'</div>';

  /* The way back into the challenge. This screen used to have none: the
     only exit was the panel's Back, which leaves T42 altogether, so a member
     who had just made a duo was stranded on it. */
  h+='<button class="bigbtn" onclick="t42DuoDone()">'+(T42.dayNo()>0?'Back to Today':'Continue to T42')+'</button>';
  if(T42.duoWindowOpen())
    h+='<button class="bigbtn sec" onclick="t42DuoLeave()">Leave this duo</button>';
  else
    h+='<div class="t42-note">Your duo is fixed for this edition.</div>';
  el.innerHTML=h;
}

/* Wherever the member belongs right now — the baseline, the countdown or
   today — decided the same way opening T42 decides it. */
function t42DuoDone(){ t42Resume(); t42Paint(); t42Segs(); $('screen').scrollTop=0; }

var t42DuoBusy=false;

async function t42DuoCreate(){
  if(t42DuoBusy) return;
  if(!sb || !SUPA_READY || !T42.reg){ toast('Sign in first'); return; }
  t42DuoBusy=true;
  try{
    var r=await sb.rpc('t42_duo_create',{p_registration:T42.reg.id});
    if(r.error) throw r.error;
    T42.reg.duo_id=r.data&&r.data.duo_id;
    await T42.loadDuo();
    toast('Duo created — send your partner the code');
    t42RenderDuo();
  }catch(e){ toast((e&&e.message)||'Could not create the duo'); }
  finally{ t42DuoBusy=false; }
}

async function t42DuoJoin(){
  if(t42DuoBusy) return;
  var inp=$('t42-duocode');
  var code=String((inp&&inp.value)||'').trim().toUpperCase();
  /* People type what they hear: "K8F2" without the prefix is the same code. */
  if(code && code.indexOf('T42-')!==0) code='T42-'+code.replace(/^T42/,'');
  if(!/^T42-[A-Z0-9]{4}$/.test(code)){ toast('Enter the code your partner gave you'); return; }
  if(!sb || !SUPA_READY || !T42.reg){ toast('Sign in first'); return; }
  t42DuoBusy=true;
  try{
    var r=await sb.rpc('t42_duo_join',{p_registration:T42.reg.id, p_code:code});
    if(r.error) throw r.error;
    T42.reg.duo_id=r.data&&r.data.duo_id;
    await T42.loadDuo();
    toast('You are in a duo');
    t42RenderDuo();
  }catch(e){ toast((e&&e.message)||'Could not join that duo'); }
  finally{ t42DuoBusy=false; }
}

async function t42DuoLeave(){
  if(t42DuoBusy || !T42.reg || !T42.reg.duo_id) return;
  if(!window.confirm('Leave this duo? Your partner stays in it and can pair with someone else.')) return;
  t42DuoBusy=true;
  try{
    var r=await sb.rpc('t42_duo_leave',{p_registration:T42.reg.id});
    if(r.error) throw r.error;
    T42.reg.duo_id=null;
    await T42.loadDuo();
    toast('You have left the duo');
    t42RenderDuo();
  }catch(e){ toast((e&&e.message)||'Could not leave the duo'); }
  finally{ t42DuoBusy=false; }
}

function t42DuoShare(){
  var code=T42.duo&&T42.duo.code; if(!code) return;
  var text='Join my T42 Gym Duo — open T42 in HITFAT+ and enter the code '+code;
  try{
    if(typeof navigator!=='undefined' && navigator.share){
      navigator.share({title:'T42 Gym Duo', text:text}).catch(function(){});
      return;
    }
  }catch(e){}
  window.open('https://wa.me/?text='+encodeURIComponent(text),'_blank');
}


/* The small version, for the registered and countdown screens. */
function t42DuoSummaryCard(){
  if(!T42.reg.duo_id){
    return '<div class="acard" onclick="t42GoDuo()" style="cursor:pointer;">'+
      '<div class="ah">'+ic('people')+'<div class="t">Set up your duo</div><div class="c">›</div></div>'+
      '<div class="sub">Create a duo and send the code, or enter your partner\'s.</div></div>';
  }
  var p=t42DuoPartner();
  return '<div class="acard" onclick="t42GoDuo()" style="cursor:pointer;">'+
    '<div class="ah">'+ic('people')+'<div class="t">'+(p?'Your duo with '+t42Esc(p.display_name):'Waiting for your partner')+
    '</div><div class="c">›</div></div>'+
    '<div class="sub">Team readiness '+t42DuoReadiness()+'%'+(T42.duo&&T42.duo.code?' · code '+t42Esc(T42.duo.code):'')+'</div></div>';
}


/* ── 07 · YOUR DUO on the dashboard ──
   Accountability is the point of a duo, so the partner's day sits right
   under your own: did they train, did they check in at the gym, how far
   have they walked. That, and nothing more personal than that. */
function t42DuoDashCard(){
  if(!T42.reg.duo_id){
    return '<div class="sechead">Your duo</div>'+
      '<div class="acard" onclick="t42GoDuo()" style="cursor:pointer;">'+
      '<div class="ah">'+ic('people')+'<div class="t">Not in a duo</div><div class="c">›</div></div>'+
      '<div class="sub">'+(T42.duoWindowOpen()?'Pair up before day '+T42.lockDay()+' to compete as a team.'
                                              :'Pairing has closed for this edition.')+'</div></div>';
  }
  var me=t42DuoMe(), p=t42DuoPartner();
  var col=function(m,label){
    if(!m) return '<div class="t42-duo-c"><div class="t42-duo-n">'+label+'</div>'+
                  '<div class="t42-q">Not joined yet</div></div>';
    var tick=function(ok){ return ok?'<span class="t42-duo-ok">✓</span>':'<span class="t42-duo-no">✕</span>'; };
    return '<div class="t42-duo-c"><div class="t42-duo-n">'+t42Esc(m.is_me?'You':m.display_name)+'</div>'+
      '<div class="t42-duo-l"><span>Workout</span>'+tick(m.workout_today)+'</div>'+
      '<div class="t42-duo-l"><span>Gym check-in</span>'+tick(m.gym_today)+'</div>'+
      '<div class="t42-duo-l"><span>Check-in</span>'+tick(m.checked_in_today)+'</div>'+
      '<div class="t42-duo-l"><span>Steps</span><b>'+(m.steps_today!=null?t42Num(m.steps_today):'—')+'</b></div></div>';
  };
  var ds=T42.duoScore;
  var h='<div class="sechead">Your duo</div><div class="t42-duo">'+col(me,'You')+col(p,'Partner')+'</div>';
  if(ds && ds.eligible){
    h+='<div class="t42-grid" style="margin-top:10px;">'+
       t42Stat('Duo score', t42Fmt(ds.team_total))+
       t42Stat('Team rank', ds.rank_category?'#'+ds.rank_category:'—')+'</div>';
  } else {
    h+='<div class="t42-q">'+(t42DuoReadiness()<100
         ? 'Team readiness '+t42DuoReadiness()+'% — the duo is ranked once both of you are ready.'
         : 'Your duo score appears once the first scores are in.')+'</div>';
  }
  h+='<button class="bigbtn sec" onclick="t42GymCheckin()">Check in at HQ</button>';
  return h;
}


/* ── 15 · duo progress ──
   Each partner as a percentage of their own start, and the team as the
   average of the two. Never kilograms added together: a duo that was
   heavier on day one would win on arithmetic. */
function t42ProgDuo(){
  if(!T42.reg.duo_id)
    return '<div class="acard"><div class="sub">You are not in a duo.</div>'+
           '<button class="bigbtn sec" onclick="t42GoDuo()">Set up your duo</button></div>';
  var me=t42DuoMe(), p=t42DuoPartner();
  var line=function(m,label){
    if(!m) return '<div class="acard"><div class="ah"><div class="t">'+label+'</div></div>'+
                  '<div class="sub">Not joined yet.</div></div>';
    return '<div class="acard"><div class="ah">'+ic((m.is_me?'🙋':'🤝'))+'<div class="t">'+
      t42Esc(m.is_me?'You':m.display_name)+'</div><div class="c">'+
      (m.total!=null?t42Fmt(m.total):'')+'</div></div>'+
      '<div class="t42-grid" style="margin-top:10px;">'+
      t42Stat('Weight', m.weight_change_pct!=null?t42Signed(Number(m.weight_change_pct),'%'):'—')+
      t42Stat('Waist',  m.waist_change_pct!=null?t42Signed(Number(m.waist_change_pct),'%'):'—')+
      t42Stat('Gym days', String(m.attended||0))+
      t42Stat('Workouts', m.workout_pct!=null?Math.round(m.workout_pct)+'%':'—')+
      '</div></div>';
  };
  var h=line(me,'You')+line(p,'Partner');

  var both=[me,p].filter(function(m){ return m && m.weight_change_pct!=null; });
  if(both.length===2){
    var avg=Math.round((Number(both[0].weight_change_pct)+Number(both[1].weight_change_pct))/2*10)/10;
    h+='<div class="t42-score"><div class="t42-score-l">Team transformation</div>'+
       '<div class="t42-score-n">'+t42Signed(avg,'%')+'</div>'+
       (T42.duoScore&&T42.duoScore.eligible
         ? '<div class="t42-score-r">Duo score '+t42Fmt(T42.duoScore.team_total)+
           (T42.duoScore.rank_category?' · #'+T42.duoScore.rank_category:'')+'</div>' : '')+
       '</div>';
  }
  h+='<div class="t42-note">Your partner sees these percentages too — never your kilograms, '+
     'your body fat or your photos. They see the same of you.</div>';
  return h;
}


/* ── 16 · the duo leaderboard ── */
var T42_DUO_BOARDS=[
  {id:'duo_transform_female', n:'Transform · Women'},
  {id:'duo_transform_male',   n:'Transform · Men'},
  {id:'duo_perform_female',   n:'Perform · Women'},
  {id:'duo_perform_male',     n:'Perform · Men'}
];
var t42DuoBoardId=null;

function t42MyDuoBoard(){
  if(T42.duoScore && T42.duoScore.category && T42.duoScore.category.indexOf('duo_')===0)
    return T42.duoScore.category;
  var r=T42.reg;
  if(r && r.mode==='gym_duo' && r.gender && r.track!=='start') return 'duo_'+r.track+'_'+r.gender;
  return 'duo_transform_female';
}

function t42DuoBoard(){
  if(!t42DuoBoardId) t42DuoBoardId=t42MyDuoBoard();
  var id=t42DuoBoardId;
  var h='<div class="t42-pills t42-boards">'+T42_DUO_BOARDS.map(function(b){
    return '<button class="t42-pill'+(id===b.id?' on':'')+'" onclick="t42DuoBoardPick(\''+b.id+'\')">'+
           t42Esc(b.n)+'</button>';
  }).join('')+'</div>';

  var ds=T42.duoScore;
  if(T42.isGym() && t42MyDuoBoard()===id){
    h+='<div class="t42-me"><div class="t42-me-l">Your duo</div>'+
       (ds && ds.eligible && ds.rank_category
         ? '<div class="t42-me-r">#'+ds.rank_category+'</div><div class="t42-me-s">'+t42Fmt(ds.team_total)+'</div>'
         : '<div class="t42-me-n">'+(T42.reg.duo_id?'Not ranked yet':'Not in a duo')+'</div>')+'</div>';
  }

  var st=t42BoardState[id], rows=t42BoardRows[id]||[];
  if(!st){ t42LoadDuoBoard(id); st='loading'; }
  if(st==='loading'){
    h+='<div class="acard"><div class="sub">Loading the duo leaderboard…</div></div>';
  } else if(st==='error'){
    h+='<div class="acard"><div class="sub">Could not load this leaderboard.</div>'+
       '<button class="bigbtn sec" onclick="t42DuoBoardReload()">Try again</button></div>';
  } else if(!rows.length){
    h+='<div class="acard"><div class="ah">'+ic('flag')+'<div class="t">No duos ranked yet</div></div>'+
       '<div class="sub">A duo is ranked once both partners are ready and the first scores are in.</div></div>';
  } else {
    h+='<div class="sechead">Top '+rows.length+'</div>';
    rows.forEach(function(r){
      h+='<div class="t42-lb'+(r.is_mine?' me':'')+'">'+
         '<span class="t42-lb-p'+(r.place<=3?' top':'')+'">'+(r.place!=null?r.place:'–')+'</span>'+
         '<span class="t42-lb-n">'+t42Esc(r.team)+(r.is_mine?' · you':'')+'</span>'+
         '<span class="t42-lb-s">'+t42Fmt(r.score)+'</span></div>';
    });
  }
  h+='<div class="t42-note">Duos are ranked on the average of both partners\' improvement — '+
     'never on kilograms added together. Only first names and scores are shown.</div>';
  return h;
}
function t42DuoBoardPick(id){ t42DuoBoardId=id; t42RenderRank(); }
function t42DuoBoardReload(){ delete t42BoardState[t42DuoBoardId]; t42RenderRank(); }

async function t42LoadDuoBoard(id){
  t42BoardState[id]='loading';
  if(!sb || !SUPA_READY || !T42.challenge){ t42BoardState[id]='error'; return; }
  try{
    var r=await sb.rpc('t42_duo_leaderboard',{p_challenge:T42.challenge.id, p_category:id, p_limit:10});
    if(r.error) throw r.error;
    t42BoardRows[id]=r.data||[];
    t42BoardState[id]='ready';
  }catch(e){
    t42BoardState[id]= t42SchemaMissing(e) ? 'ready' : 'error';
    t42BoardRows[id]=[];
  }
  if(t42View==='rank' && t42BoardMode==='duo' && t42DuoBoardId===id) t42RenderRank();
}


/* ═══════════════════════════════════════════════════════════════
   THE CHALLENGE ENGINE (Sept 2026)

   T42 is a challenge, not a library. Each edition is its own product with
   its own dates and its own price; a participant is entitled to the one
   they paid for, and only until that edition's access closes. After that
   the programme is gone and the achievement stays — the T42 Journey.

   The database is what enforces every rule here (20-t42-core.sql:
   t42_reg_entitled, t42_access_open, t42_can_read_plan). The app knows the
   same rules so nobody is shown a door the server will shut.
   ═══════════════════════════════════════════════════════════════ */

/* The edition's columns. The engine's new ones are asked for only until a
   database without them answers "column does not exist" — then the app
   falls back to the original set and carries on as it did before the
   migration, rather than losing T42 until someone runs the SQL. */
var T42_COLS_BASE='id,slug,name,edition,starts_on,ends_on,reg_opens_on,reg_closes_on,status,total_days,config';
var T42_COLS_ENGINE=',subtitle,price,results_on,access_ends_on,tracks,modes';
var t42Legacy=false;
function t42ChallengeCols(){ return T42_COLS_BASE+(t42Legacy?'':T42_COLS_ENGINE); }
function t42MissingColumn(e){
  if(!e) return false;
  return e.code==='42703' || e.code==='PGRST204' || /column .* does not exist/i.test(e.message||'');
}
async function t42OpenEdition(){
  var q=function(){
    return sb.from('t42_challenges').select(t42ChallengeCols())
      .in('status',['registration','running','assessment'])
      .order('starts_on',{ascending:false}).limit(1).maybeSingle();
  };
  var r=await q();
  if(r.error && !t42Legacy && t42MissingColumn(r.error)){ t42Legacy=true; r=await q(); }
  return r;
}

/* ── lifecycle, worked out from the dates ── */
function t42Today(){ var d=new Date(); d.setHours(0,0,0,0); return d; }

T42.history=[];                       // every registration of mine, newest first

/* The day the programme closes, or null when the edition sets no date —
   which is how every edition behaved before the date existed. */
T42.accessEndsOn=function(c){
  c=c||this.challenge; if(!c) return null;
  return t42Date(c.access_ends_on||c.results_on);
};
T42.accessOpen=function(c){
  c=c||this.challenge; if(!c) return false;
  if(c.status==='draft'||c.status==='archived') return false;
  var end=this.accessEndsOn(c);
  return !end || t42Today()<=end;
};
/* Paid for — or free, when the edition has no price. The same rule as
   t42_reg_entitled() on the server. */
T42.entitled=function(r,c){
  r=r||this.reg; c=c||this.challenge; if(!r) return false;
  if(r.status==='withdrawn'||r.status==='disqualified') return false;
  if(r.status==='paid'||r.status==='active'||r.status==='completed') return true;
  return !(Number(c&&c.price)>0);
};
T42.needsPayment=function(){ return !!this.reg && this.reg.status==='pending' && !this.entitled(); };
T42.price=function(){ var p=Number(this.challenge&&this.challenge.price); return p>0?p:0; };
/* draft · registration · upcoming · active · completed · closed — the same
   answer as t42_phase() in the database. */
T42.phase=function(c){
  c=c||this.challenge; if(!c) return 'none';
  var t=t42Today();
  if(c.status==='draft') return 'draft';
  if(c.status==='archived' || !this.accessOpen(c)) return 'closed';
  var ends=t42Date(c.ends_on), starts=t42Date(c.starts_on);
  if(c.status==='complete' || (ends && t>ends)) return 'completed';
  if(starts && t>=starts) return 'active';
  var ro=t42Date(c.reg_opens_on), rc=t42Date(c.reg_closes_on);
  if((!ro||t>=ro) && (!rc||t<=rc)) return 'registration';
  return 'upcoming';
};
T42.daysLeft=function(){
  var tot=(this.challenge&&this.challenge.total_days)||42;
  return Math.max(0, tot-this.dayNo());
};
/* Does this edition offer a track or a mode? An edition that says nothing
   (a database before the migration) offers everything, as T42 always did. */
T42.offers=function(kind,id){
  var list=this.challenge && this.challenge[kind];
  return !list || !list.length || list.indexOf(id)>-1;
};

T42.loadHistory=async function(uid){
  var q=function(){
    return sb.from('t42_registrations')
      .select('id,challenge_id,mode,track,status,joined_at,completed_at, t42_challenges!inner('+t42ChallengeCols()+')')
      .eq('user_id',uid).order('joined_at',{ascending:false}).limit(24);
  };
  var r=await q();
  if(r.error && !t42Legacy && t42MissingColumn(r.error)){ t42Legacy=true; r=await q(); }
  if(r.error){ this.history=[]; return; }
  this.history=(r.data||[]).map(function(row){
    var c=row.t42_challenges; delete row.t42_challenges;
    return {reg:row, challenge:c, score:null, certs:null};
  });
  /* The edition taking registrations now, if I am not already in it — the
     "ready for another 42 days?" card on a finished edition's screens. */
  var mine={}; this.history.forEach(function(x){ mine[x.challenge.id]=1; });
  var nx=await sb.from('t42_challenges').select(t42ChallengeCols())
    .eq('status','registration').order('starts_on',{ascending:true}).limit(3);
  var self=this;
  this.nextOpen=((!nx.error&&nx.data)||[]).filter(function(c){
    var saved=self.challenge; self.challenge=c;
    var ok=!mine[c.id] && self.regOpen();
    self.challenge=saved; return ok;
  })[0]||null;
  t42JourneyLoaded=false;
};

/* The views a participant can only open while paid and while the edition
   is open. Everything else — landing, result, certificate, journey — stays
   reachable, because an achievement does not expire with the programme. */
var T42_LIVE_VIEWS={dash:1, checkin:1, train:1, progress:1, measure:1, fitness:1,
                    review:1, rank:1, final:1, duo:1};

/* Called by t42Paint before any view. Returns true if it drew a gate. */
function t42Gate(){
  if(T42.state!=='ready' || !T42.reg) return false;
  if(t42View==='pay'||t42View==='ended'||t42View==='journey'||t42View==='rules') return false;
  if(!T42_LIVE_VIEWS[t42View]) return false;
  if(!T42.accessOpen()){ t42RenderEnded(); return true; }
  if(T42.needsPayment()){ t42RenderPay(); return true; }
  return false;
}

function t42GoPay(){ t42Go('pay'); }
function t42GoEnded(){ t42Go('ended'); }
function t42GoJourney(){ t42Go('journey'); }
function t42GoRules(){ t42Go('rules'); }


/* ── paying for the edition ── */
var t42PayChannel=1, t42Paying=false;
function t42SetPayChannel(c){ t42PayChannel=c; t42RenderPay(); }

function t42RenderPay(){
  var el=$('t42-body'); if(!el) return;
  var c=T42.challenge, r=T42.reg;
  if(!c || !r) return t42RenderLanding();
  if(T42.entitled()) return t42RenderJoined();
  var tr=t42Track(r.track)||{}, price=T42.price();
  var open=T42.regOpen();

  var h=t42Hero()+
    '<div class="hgroup"><div class="k">Almost in</div><h2>Confirm your place</h2>'+
    '<p>'+t42Esc(c.name||'T42')+' · '+t42Esc(tr.name||'')+'</p></div>'+
    '<div class="t42-grid">'+
      t42Stat('Starts', t42LongDate(c.starts_on))+
      t42Stat('Ends',   t42LongDate(c.ends_on))+
    '</div>';

  if(!open){
    h+='<div class="acard"><div class="ah">'+ic('lock')+'<div class="t">Registration closed</div></div>'+
       '<div class="sub">This edition is no longer taking payment. Your sign-up is saved — '+
       'the next T42 will show up here when it opens.</div></div>'+
       '<button class="bigbtn sec" onclick="t42GoJourney()">My T42 Journey</button>';
    el.innerHTML=h; return;
  }

  h+='<div class="t42-price"><div class="t42-price-n">RM'+price+'</div>'+
     '<div class="t42-price-l">One payment · this edition only</div></div>'+
     '<ul class="t42-bul">'+
       '<li>The full 42-day plan for your track, one day at a time</li>'+
       '<li>Daily check-in, weekly missions and your progress</li>'+
       '<li>Scored and ranked on the leaderboard</li>'+
       '<li>Result and T42 Finisher certificate</li>'+
     '</ul>'+
     '<div class="t42-note">T42 is a challenge, not a library: the programme is open from day 1 until '+
       t42Esc(t42LongDate(c.access_ends_on||c.results_on||c.ends_on))+'. Your result and certificate stay '+
       'in your T42 Journey after that. It does not include HITFAT+ programs or future editions.</div>'+
     '<div class="paychs">'+PAY_CHANNELS.map(function(ch){
       return '<button class="paych'+(t42PayChannel===ch[0]?' on':'')+'" onclick="t42SetPayChannel('+ch[0]+')">'+
              '<b>'+ch[1]+'</b><small>'+ch[2]+'</small></button>';
     }).join('')+'</div>'+
     '<button class="bigbtn'+(t42Paying?' off':'')+'" id="t42-pay-go" onclick="t42PayNow()">'+
       (t42Paying?'Opening secure payment…':'Pay RM'+price)+'</button>'+
     '<div class="pwfine" style="text-align:left;">Secure payment via Bayarcash. We never see your banking details.</div>'+
     '<button class="bigbtn sec" onclick="t42GoBaseline()">Edit my details</button>';
  el.innerHTML=h;
}

async function t42PayNow(){
  if(t42Paying || !T42.challenge) return;
  t42Paying=true; t42RenderPay();
  try{
    var tk=await scanToken();
    if(!tk){ toast('Sign in first.'); return; }
    var sku='t42:'+T42.challenge.slug;
    var r=await fetch(PAY_CREATE,{method:'POST',
      headers:{'Content-Type':'application/json','Authorization':'Bearer '+tk,'apikey':SUPA_KEY},
      body:JSON.stringify({sku:sku, channel:t42PayChannel,
                           name:(HF.data.prefs&&HF.data.prefs.name)||''})});
    var d=await r.json().catch(function(){ return null; });
    if(r.ok && d && d.url){ localStorage.setItem('hf_plus_pending', sku); location.href=d.url; return; }
    if(d && d.code==='already_owned'){ toast('You are already in.'); await T42.load(true); t42Resume(); t42Paint(); t42Segs(); return; }
    if(d && d.code==='free'){ await T42.load(true); t42Resume(); t42Paint(); t42Segs(); return; }
    toast((d&&d.error)||'Could not start payment. Try again.');
  }catch(e){
    toast('Could not start payment — check your connection.');
  }finally{
    t42Paying=false;
    if(t42View==='pay') t42RenderPay();
  }
}

/* Back from the gateway with ?paid=t42:… — the callback can take a few
   seconds. pay-status settles anything the callback missed; the
   registration row is the only thing that says "paid". */
function t42AwaitPayment(){
  var tries=0;
  toast('Confirming your T42 payment…');
  var tick=async function(){
    tries++;
    try{
      var tk=await scanToken();
      if(tk) await fetch(PAY_STATUS,{headers:{'Authorization':'Bearer '+tk,'apikey':SUPA_KEY}});
    }catch(e){}
    await T42.load(true);
    if(T42.reg && T42.entitled()){
      toast('Payment confirmed — you are in 🎉');
      openT42(); return;
    }
    if(tries<8) setTimeout(tick,3000);
    else toast('Not confirmed yet — it will unlock by itself once received.');
  };
  setTimeout(tick,1500);
}


/* ── before day 1: the countdown and the checklist ── */
function t42CountdownParts(){
  var c=T42.challenge; var s=c&&t42Date(c.starts_on); if(!s) return null;
  var ms=Math.max(0, s.getTime()-Date.now());
  return {days:Math.floor(ms/86400000), hours:Math.floor(ms/3600000)%24};
}

var T42_RULES_KEY='t42_rules_read_v1';
function t42RulesRead(){
  try{ return localStorage.getItem(T42_RULES_KEY+':'+(T42.challenge&&T42.challenge.id))==='1'; }catch(e){ return false; }
}

function t42Checklist(){
  var b=T42.baseline||{}, r=T42.reg||{};
  var name=(HF&&HF.data&&HF.data.prefs&&HF.data.prefs.name)||'';
  return [
    {n:'Complete your profile',        done:!!name && !!r.gender,           go:'t42GoBaseline()'},
    {n:'Add your starting weight',     done:b.weight_kg!=null,              go:'t42GoBaseline()'},
    {n:'Add your waist measurement',   done:b.waist_cm!=null,               go:'t42GoBaseline()'},
    {n:'Upload a starting photo',      done:!!(b.photo_front||b.photo_side||b.photo_back),
                                                                            go:'t42GoPhotos()', optional:true},
    {n:'Select your track',            done:!!r.track,                      go:null},
    {n:'Read the rules and scoring',   done:t42RulesRead(),                 go:'t42GoRules()'}
  ];
}

function t42RenderUpcoming(){
  var el=$('t42-body'); if(!el) return;
  var c=T42.challenge, r=T42.reg, tr=t42Track(r.track)||{};
  var cd=t42CountdownParts()||{days:T42.daysTo(),hours:0};
  var list=t42Checklist(), done=list.filter(function(i){ return i.done; }).length;

  var h='<div class="t42-in"><div class="t42-in-k">You\'re in.</div>'+
        '<div class="t42-in-t">'+t42Esc(c.name||'T42')+' starts in</div>'+
        '<div class="t42-cd"><div><b>'+(cd.days<10?'0':'')+cd.days+'</b><span>'+(cd.days===1?'day to go':'days to go')+'</span></div>'+
        '<div><b>'+(cd.hours<10?'0':'')+cd.hours+'</b><span>hours</span></div></div>'+
        '<div class="t42-in-s">'+t42Esc(t42LongDate(c.starts_on))+' → '+t42Esc(t42LongDate(c.ends_on))+
        ' · '+t42Esc(tr.name||'')+'</div></div>';

  h+='<div class="sechead">Get ready · '+done+' / '+list.length+'</div><div class="t42-list">';
  list.forEach(function(it){
    h+='<div class="t42-row'+(it.go?'':' static')+'"'+(it.go?' onclick="'+it.go+'"':'')+'>'+
       '<span class="t42-tick'+(it.done?' on':'')+'">'+(it.done?t42Ic('check'):'')+'</span>'+
       '<div class="t42-row-b"><div class="t42-row-l">'+t42Esc(it.n)+'</div>'+
       (it.optional?'<div class="t42-row-v">Optional — private, only you and the review team see it</div>':'')+
       '</div>'+(it.go?'<span class="t42-chev">›</span>':'')+'</div>';
  });
  h+='</div>';

  if(r.mode==='gym_duo') h+=t42DuoSummaryCard();

  /* The starting line, read back — and the code that goes in the photo
     beside the scale, so a reviewer can tie one picture to one person. */
  var b=T42.baseline||{};
  if(b.id){
    h+='<div class="sechead">Your starting line</div><div class="t42-grid">'+
       t42Stat('Weight', b.weight_kg+' kg')+
       t42Stat('Waist',  b.waist_cm+' cm')+
       t42Stat('Height', b.height_cm+' cm')+
       t42Stat('Code',   r.verify_code||'—')+
       '</div>';
  }

  var cu=c.config&&c.config.community_url;
  if(cu) h+='<button class="bigbtn sec" onclick="t42OpenCommunity()">Join the T42 community</button>';

  h+='<div class="t42-note">Day 1 opens on '+t42Esc(t42LongDate(c.starts_on))+': your first workout, '+
     'your first check-in and the leaderboard. Nothing is scored before then.</div>'+
     '<button class="bigbtn sec" onclick="t42GoJourney()">My T42 Journey</button>';
  el.innerHTML=h;
}
function t42OpenCommunity(){
  var u=T42.challenge&&T42.challenge.config&&T42.challenge.config.community_url;
  if(u) window.open(u,'_blank');
}


/* ── the rules, in plain words ── */
function t42RenderRules(){
  var el=$('t42-body'); if(!el) return;
  try{ localStorage.setItem(T42_RULES_KEY+':'+(T42.challenge&&T42.challenge.id),'1'); }catch(e){}
  var c=T42.challenge||{}, cfg=c.config||{};
  var w=(cfg.scoring&&cfg.scoring.v2)||{consistency_pct:40,progress_pct:25,missions_pct:20,fitness_pct:15};
  var lock=T42.lockDay();
  var h='<div class="hgroup"><div class="k">'+t42Esc(c.name||'T42')+'</div><h2>How T42 works</h2>'+
        '<p>42 days, one edition, everyone on the same dates.</p></div>'+
        '<div class="sechead">Every day</div>'+
        '<ul class="t42-bul"><li>Do today\'s workout (rest days are part of the plan)</li>'+
        '<li>Check in: steps, water and whether your eating was on track</li>'+
        '<li>That is all. Most days take one workout and one minute.</li></ul>'+
        '<div class="sechead">How you are scored</div><div class="t42-weights">'+
        t42Weight('Consistency', w.consistency_pct, 'Doing each day\'s actions')+
        t42Weight('Progress',    w.progress_pct,    'Weight, waist or fitness — against a healthy target')+
        t42Weight('Missions',    w.missions_pct,    'One weekly mission, checked automatically')+
        t42Weight('Fitness',     w.fitness_pct,     'Your fitness test, start to finish')+
        '</div>'+
        '<div class="t42-note">Losing more than '+t42Esc(String((cfg.targets&&cfg.targets.weight_loss_pct)||6))+
        '% of your starting weight scores no more than reaching it. The leaderboard rewards consistency, '+
        'never crash dieting.</div>'+
        '<div class="sechead">Dates that matter</div><ul class="t42-bul">'+
        '<li>Your baseline (weight, waist, height) locks on day '+lock+'</li>'+
        '<li>Check-ins count for today, or the next morning</li>'+
        '<li>Mid-point on day '+Math.round(((c.total_days)||42)/2)+', final assessment from day '+(((c.total_days)||42)-3)+'</li>'+
        '<li>The programme closes on '+t42Esc(t42LongDate(c.access_ends_on||c.results_on||c.ends_on))+
        ' — your result and certificate stay after that</li></ul>'+
        '<div class="t42-note">Missed a day? Nothing resets. Pick up today\'s plan — the missed day '+
        'just counts as missed.</div>'+
        '<button class="bigbtn sec" onclick="t42Resume();t42Paint();t42Segs();">Back</button>';
  el.innerHTML=h;
}
function t42Weight(n,pct,sub){
  return '<div class="t42-w"><div class="t42-w-h"><span>'+t42Esc(n)+'</span><b>'+t42Esc(String(pct||0))+'%</b></div>'+
         '<div class="pbar"><i style="width:'+Math.min(100,Number(pct)||0)+'%"></i></div>'+
         '<div class="t42-w-s">'+t42Esc(sub)+'</div></div>';
}


/* ── milestones ──
   Day 7, 14, 21, 28, 35 and 42 — shown once each, the first time the
   dashboard opens after that many days are behind the participant. */
var T42_MILESTONES=[
  {d:7,  t:'7 days complete',    s:'The first week is the hardest one. It is behind you.'},
  {d:14, t:'Two weeks strong',   s:'Fourteen days of showing up. This is a routine now.'},
  {d:21, t:'Halfway there',      s:'Twenty-one days in. Take your mid-point check when it opens.'},
  {d:28, t:'4 weeks complete',   s:'Four weeks. Most people never get this far.'},
  {d:35, t:'Final week',         s:'Seven days left. Finish the way you started.'},
  {d:42, t:'You did it.',        s:'42 days completed. Submit your final assessment.'}
];
function t42MilestoneKey(m){ return 't42_ms_'+(T42.reg&&T42.reg.id)+'_'+m.d; }
function t42DueMilestone(){
  if(!T42.reg) return null;
  var day=T42.dayNo(), over=T42.isOver();
  for(var i=T42_MILESTONES.length-1;i>=0;i--){
    var m=T42_MILESTONES[i];
    /* Day N is complete once day N+1 has begun — or, for the last day, once
       day 42 itself has arrived. */
    var reached = m.d===42 ? (day>=42 || over) : day>m.d;
    if(!reached) continue;
    try{ if(localStorage.getItem(t42MilestoneKey(m))==='1') return null; }catch(e){ return null; }
    return m;
  }
  return null;
}
function t42MilestoneCard(){
  var m=t42DueMilestone(); if(!m) return '';
  return '<div class="t42-ms" id="t42-ms"><div class="t42-ms-n">DAY '+m.d+'</div>'+
         '<div class="t42-ms-t">'+t42Esc(m.t)+'</div><div class="t42-ms-s">'+t42Esc(m.s)+'</div>'+
         '<button class="t42-ms-x" onclick="t42DismissMilestone('+m.d+')">Continue</button></div>';
}
function t42DismissMilestone(d){
  try{ localStorage.setItem('t42_ms_'+(T42.reg&&T42.reg.id)+'_'+d,'1'); }catch(e){}
  var el=$('t42-ms'); if(el && el.parentNode) el.parentNode.removeChild(el);
}

/* Yesterday went unlogged. Said kindly, once, and never as a reset. */
function t42MissedCard(){
  var day=T42.dayNo(); if(day<2) return '';
  var have={}; (T42.checkins||[]).forEach(function(c){ have[c.day_no]=1; });
  if(have[day-1] || have[day]) return '';
  return '<div class="t42-note t42-missed"><b>You missed yesterday.</b> Nothing resets — '+
         'continue with today\'s plan and get back on track.</div>';
}

/* The header strip the dashboard adds: days left, and the one CTA. */
function t42DashHead(){
  var left=T42.daysLeft();
  return '<div class="t42-left"><span>'+t42Esc((T42.challenge&&T42.challenge.name)||'T42')+'</span>'+
         '<b>'+left+(left===1?' day left':' days left')+'</b></div>';
}


/* ── after access ends: the trophy cabinet, not the library ── */
function t42RenderEnded(){
  var el=$('t42-body'); if(!el) return;
  var c=T42.challenge||{}, r=T42.reg;
  var h='<div class="t42-hero" style="padding-bottom:6px;">'+
        '<div class="t42-trophy">'+glyph('trophy')+'</div>'+
        '<div class="t42-logo" style="font-size:40px;">'+t42Esc((c.name||'T42').toUpperCase())+'</div>'+
        '<div class="t42-sub">CHALLENGE COMPLETED</div></div>'+
        '<div class="acard"><div class="ah">'+ic('lock')+'<div class="t">Your challenge access has ended</div></div>'+
        '<div class="sub">The 42-day programme closed on '+t42Esc(t42LongDate(c.access_ends_on||c.results_on||c.ends_on))+
        '. Your achievement remains part of your T42 Journey.</div></div>';
  if(r && T42.isComplete())
    h+='<button class="bigbtn" onclick="t42GoResult()">View my result</button>';
  if(T42.certs && T42.certs.length)
    h+='<button class="bigbtn sec" onclick="t42GoCert()">View certificate</button>';
  h+='<button class="bigbtn sec" onclick="t42GoJourney()">My T42 Journey</button>'+
     t42NextEditionCard()+
     t42PlusUpsell();
  el.innerHTML=h;
}

/* The next edition, if one is open and I am not in it yet. */
function t42NextEdition(){
  var h=T42.history||[], mine={};
  h.forEach(function(x){ mine[x.challenge.id]=1; });
  var c=T42.challenge;
  if(c && !mine[c.id] && T42.regOpen()) return c;
  return T42.nextOpen||null;
}
function t42NextEditionCard(){
  var n=t42NextEdition();
  if(n){
    return '<div class="acard t42-next"><div class="ah">'+ic('repeat')+'<div class="t">Ready for another 42 days?</div></div>'+
      '<div class="sub">'+t42Esc(n.name)+' · starts '+t42Esc(t42LongDate(n.starts_on))+
      '. A new edition is a new registration — your last one does not carry over.</div>'+
      '<button class="bigbtn" onclick="t42JoinNext()">Join the next challenge</button></div>';
  }
  return '<div class="acard"><div class="ah">'+ic('repeat')+'<div class="t">The next T42</div></div>'+
    '<div class="sub">Registration for the next edition will open here. Same account, a new starting line.</div>'+
    '<button class="bigbtn sec" onclick="t42Reload()">Check for a new edition</button></div>';
}
function t42PlusUpsell(){
  return '<div class="acard"><div class="ah">'+ic('workout')+'<div class="t">Continue with HITFAT+</div></div>'+
    '<div class="sub">For long-term training outside the challenge: programs you buy once and keep. '+
    'T42 does not include them.</div>'+
    '<button class="bigbtn sec" onclick="t42NextStore()">Explore HITFAT+</button></div>';
}
/* Move to the open edition and start its join flow. */
async function t42JoinNext(){
  var n=t42NextEdition(); if(!n) return;
  T42.challenge=n; T42.reg=null; T42.past=null;
  T42.baseline=null; T42.mid=null; T42.final=null; T42.certs=[]; T42.t42ClearDay();
  t42DraftClear(); t42Begin();
}


/* ── MY T42 JOURNEY ── */
var t42JourneyLoaded=false;
async function t42LoadJourneyDetail(){
  var h=T42.history||[]; if(!h.length){ t42JourneyLoaded=true; return; }
  var ids=h.map(function(x){ return x.reg.id; });
  try{
    var r=await Promise.all([
      sb.from('t42_scores').select('registration_id,total,consistency_total,category,rank_category,compliance_pct,eligible').in('registration_id',ids),
      sb.from('t42_certificates').select('*').in('registration_id',ids)
    ]);
    var sc=(r[0].error?[]:r[0].data)||[], ce=(r[1].error?[]:r[1].data)||[];
    h.forEach(function(x){
      x.score=sc.filter(function(s){ return s.registration_id===x.reg.id; })[0]||null;
      x.certs=ce.filter(function(c){ return c.registration_id===x.reg.id; });
    });
  }catch(e){}
  t42JourneyLoaded=true;
  if(t42View==='journey') t42RenderJourney();
}

function t42JourneyStatus(x){
  var p=T42.phase(x.challenge), paid=T42.entitled(x.reg,x.challenge);
  if(!paid && p!=='closed' && p!=='completed') return {l:'Payment pending', k:'warn'};
  if(p==='closed')    return {l:'Completed · access ended', k:'done'};
  if(p==='completed') return {l:'Completed', k:'done'};
  if(p==='active')    return {l:'Active', k:'live'};
  return {l:'Upcoming', k:'soon'};
}

function t42RenderJourney(){
  var el=$('t42-body'); if(!el) return;
  if(!t42JourneyLoaded) t42LoadJourneyDetail();
  var h='<div class="hgroup"><div class="k">T42</div><h2>My T42 Journey</h2>'+
        '<p>Every edition you have been part of.</p></div>';
  var list=T42.history||[];
  if(!list.length){
    h+='<div class="acard"><div class="sub">No T42 yet. When you join an edition, it lives here — '+
       'and your result stays here after the challenge ends.</div></div>';
  }
  list.forEach(function(x){
    var c=x.challenge, st=t42JourneyStatus(x), sc=x.score, tr=t42Track(x.reg.track)||{};
    var total=c.total_days||42;
    h+='<div class="t42-jr"><div class="t42-jr-h"><div class="t42-jr-n">'+t42Esc((c.name||'T42').toUpperCase())+'</div>'+
       '<span class="t42-jr-s '+st.k+'">'+t42Esc(st.l)+'</span></div>'+
       '<div class="t42-jr-m">'+t42Esc(t42LongDate(c.starts_on))+' – '+t42Esc(t42LongDate(c.ends_on))+
       ' · '+t42Esc(tr.name||'')+' · '+total+' days</div>';
    if(sc && sc.total!=null){
      h+='<div class="t42-grid">'+
         t42Stat('Final score', t42Fmt(sc.total))+
         t42Stat('Rank', sc.eligible && sc.rank_category ? '#'+sc.rank_category : '—')+
         (sc.compliance_pct!=null ? t42Stat('Compliance', Math.round(sc.compliance_pct)+'%') : '')+
         '</div>';
    }
    var act='';
    if(x.certs && x.certs.length) act+='<button class="bigbtn sec" onclick="t42OpenJourney(\''+x.reg.id+'\',\'cert\')">Certificate</button>';
    if(st.k==='done') act+='<button class="bigbtn sec" onclick="t42OpenJourney(\''+x.reg.id+'\',\'result\')">View result</button>';
    else act+='<button class="bigbtn sec" onclick="t42OpenJourney(\''+x.reg.id+'\',null)">Open</button>';
    h+=act;
    if(st.k==='done') h+='<div class="t42-jr-a">Program access: ENDED</div>';
    h+='</div>';
  });
  h+=t42NextEditionCard();
  el.innerHTML=h;
}

/* Open one edition from the journey: its result, its certificate, or —
   while it is running — the edition itself. */
async function t42OpenJourney(regId, view){
  var x=(T42.history||[]).filter(function(y){ return y.reg.id===regId; })[0]; if(!x) return;
  T42.challenge=x.challenge; T42.state='loading'; t42Paint();
  try{
    var rg=await sb.from('t42_registrations').select('*').eq('id',regId).maybeSingle();
    T42.reg=(rg&&rg.data)||x.reg;
    await T42.loadReg();
  }catch(e){}
  T42.state='ready';
  if(view) t42Go(view); else { t42Resume(); t42Paint(); t42Segs(); }
}


/* ── dates, as a person says them ── */
var T42_MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function t42LongDate(iso){
  var d=t42Date(iso); if(!d) return '—';
  return d.getDate()+' '+T42_MONTHS[d.getMonth()]+' '+d.getFullYear();
}
