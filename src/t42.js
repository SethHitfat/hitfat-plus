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

   T42 is a CHALLENGE, not a program you own. Each edition — November,
   Ramadan, Merdeka — is its own product with its own dates, bought on its
   own. The lifecycle every screen follows is T42.stage():

     discover  → no place in the open edition: the invitation
     unpaid    → signed up, payment not confirmed: secure your spot
     upcoming  → paid, before day 1: countdown and a checklist
     active    → day 1 to 42: today, train, check in, progress, rank
     closing   → after day 42, results being checked: the final
     finished  → results out: result, certificate, My T42 Journey

   When an edition ends its content closes — the database enforces that in
   27-t42-engine.sql — and what the member keeps is the trophy cabinet:
   result, score, certificate. Nothing here unlocks HITFAT+.

   Gym Duo is built but switched off per edition (config.gym_enabled).
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
  open:null,                    // the edition taking people now, whatever is on screen
  weeks:[],                     // every t42_weeks row of the edition, for the timeline
  journey:null,                 // every registration I have ever had, for My T42 Journey

  isJoined(){ return !!this.reg; },

  /* ── the lifecycle ── */
  isPaid(){ var s=this.reg&&this.reg.status; return s==='paid'||s==='active'||s==='completed'; },
  isOut(){ var s=this.reg&&this.reg.status; return s==='withdrawn'||s==='disqualified'; },
  /* The last day the challenge content is open: access_ends_on when the
     edition sets one, otherwise its final day. */
  lastDay(){
    var c=this.challenge; if(!c) return null;
    var d=t42Date(c.access_ends_on); if(d) return d;
    var s=t42Date(c.starts_on); if(!s) return null;
    s.setDate(s.getDate()+((c.total_days||42)-1));
    return s;
  },
  accessEnded(){
    var d=this.lastDay(); if(!d) return false;
    var t=new Date(); t.setHours(0,0,0,0);
    return t>d;
  },
  stage(){
    if(!this.challenge) return 'none';
    if(!this.reg)       return 'discover';
    if(this.isOut())    return 'out';
    if(!this.isPaid())  return 'unpaid';
    if(this.isComplete()) return 'finished';
    if(this.isOver())   return 'closing';
    if(!this.dayNo())   return 'upcoming';
    return 'active';
  },
  daysLeft(){
    var c=this.challenge; if(!c) return 0;
    return Math.max(0, (c.total_days||42)-this.dayNo());
  },
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

  /* The six weeks, for the timeline on the invitation and the dashboard.
     Themes are the challenge's public face; the plan behind them is not. */
  async loadWeeks(){
    this.weeks=[];
    if(!this.challenge) return;
    var w=await sb.from('t42_weeks').select('week_no,theme,focus,step_target')
      .eq('challenge_id',this.challenge.id).order('week_no',{ascending:true});
    this.weeks=(w.error?[]:w.data)||[];
  },

  /* Every edition I have been part of, with what each one left me. */
  async loadJourney(){
    if(T42_DEMO){ this.journey=t42DemoJourney(); return; }
    var uid=await this.uid(); if(!uid){ this.journey=[]; return; }
    var r=await sb.from('t42_registrations')
      .select('*, t42_challenges(*), t42_scores(*), t42_certificates(id,kind), t42_measurements(phase,weight_kg,waist_cm)')
      .eq('user_id',uid).order('joined_at',{ascending:false});
    this.journey=(r.error?[]:r.data)||[];
  },

  async uid(){
    try{ var r=await sb.auth.getSession();
      return (r&&r.data&&r.data.session&&r.data.session.user.id)||null; }
    catch(e){ return null; }
  },

  async load(force){
    if(T42_DEMO){ t42DemoApply(); return; }
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
      /* '*' rather than a column list: the engine's columns (price_rm,
         access_ends_on…) arrive with 27-t42-engine.sql, and naming them here
         would break the whole screen on a database that has not run it. */
      var ch=await sb.from('t42_challenges')
        .select('*')
        .in('status',['registration','running','assessment'])
        .order('starts_on',{ascending:false}).limit(1).maybeSingle();
      if(t42SchemaMissing(ch.error)){ this.state='nosetup'; return; }
      if(ch.error) throw ch.error;
      this.challenge=ch.data||null;
      this.open=this.challenge;
      this.reg=null; this.past=null; this.journey=null; this.viewingPast=false;

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
          .select('*, t42_challenges!inner(*)')
          .eq('user_id',uid).in('t42_challenges.status',['complete','archived'])
          .order('joined_at',{ascending:false}).limit(1);
        var row=(!pr.error && pr.data && pr.data[0]) || null;
        if(row){
          var pc=row.t42_challenges; delete row.t42_challenges;
          if(!this.challenge){ this.challenge=pc; this.reg=row; }
          else this.past={challenge:pc, reg:row};
        }
      }

      if(!this.challenge){ this.baseline=null; this.mid=null; this.final=null;
                           this.t42ClearDay(); this.weeks=[]; this.state='ready'; return; }
      await Promise.all([this.loadReg(), this.loadWeeks()]);
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

/* ── what this edition offers ──
   Read from the edition's own config, so the next one can change them
   without a release. START stays defined for anyone who already chose it;
   it is simply not offered unless an edition lists it. */
function t42Cfg(){ return (T42.challenge&&T42.challenge.config)||{}; }
function t42Tracks(){
  var ids=t42Cfg().tracks;
  if(!ids || !ids.length) ids=['transform','perform'];
  return T42_TRACKS.filter(function(t){ return ids.indexOf(t.id)>=0; });
}
function t42GymOpen(){ return t42Cfg().gym_enabled===true; }
function t42Steps(){ return t42GymOpen() ? 3 : 2; }

var T42_MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
/* "3 Nov" — and the year only when it is not this one. */
function t42Day(d,withYear){
  if(!d) return '';
  return d.getDate()+' '+T42_MONTHS[d.getMonth()]+(withYear?' '+d.getFullYear():'');
}
function t42Range(c){
  if(!c) return '';
  var a=t42Date(c.starts_on), b=t42Date(c.ends_on);
  if(!a||!b) return '';
  return t42Day(a)+' – '+t42Day(b,true);
}
/* The short name of an edition: "November 2026" for "T42 November 2026". */
function t42EdName(c){ return (c&&(c.edition||c.name))||'T42'; }


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
  t42ShellBack('Back', null);
  var busy=t42StateCard();
  if(busy){ el.innerHTML=busy; return; }
  if(t42View==='mode')     return t42RenderMode();
  if(t42View==='track')    return t42RenderTrack();
  if(t42View==='assess')   return t42RenderAssess();
  if(t42View==='baseline') return t42RenderBaseline();
  if(t42View==='pay')      return t42RenderPay();
  if(t42View==='joined')   return t42RenderJoined();
  if(t42View==='rules')    return t42RenderRules();
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
  if(t42View==='journey')  return t42RenderJourney();
  if(t42View==='duo')      return t42RenderDuo();
  return t42RenderLanding();
}

/* The tabs follow the stage. Before the start there are two things to look
   at; during it, five; after it, the result and the cabinet. Onboarding and
   payment are a wizard, and a nav bar above a wizard offers exits that all
   refuse. */
var T42_SEGS={
  upcoming:[['joined','Overview','t42GoJoined'],['rules','Rules','t42GoRules']],
  active:  [['dash','Today','t42GoDash'],['train','Train','t42GoTrain'],['checkin','Check in','t42GoCheckin'],
            ['progress','Progress','t42GoProgress'],['rank','Rank','t42GoRank']],
  closing: [['final','Final','t42GoFinal'],['progress','Progress','t42GoProgress'],
            ['rank','Rank','t42GoRank'],['journey','My T42','t42GoJourney']],
  finished:[['result','Result','t42GoResult'],['rank','Rank','t42GoRank'],['journey','My T42','t42GoJourney']]
};
function t42SegFor(v,stage){
  if(v==='measure'||v==='fitness'||v==='review') return 'progress';
  if(v==='cert'||v==='next') return stage==='finished'?'result':'dash';
  if(v==='duo') return stage==='upcoming'?'joined':'dash';
  if(v==='dash' && stage==='closing') return 'final';
  if(v==='dash' && stage==='finished') return 'result';
  if(v==='dash' && stage==='upcoming') return 'joined';
  return v;
}
function t42Segs(){
  var bar=$('t42-segs'); if(!bar) return;
  var stage=T42.state==='ready' ? T42.stage() : 'none';
  var list=T42_SEGS[stage];
  /* Past the baseline lock, a member without one still gets the tabs —
     they can train and check in, they just are not ranked. */
  var on = !!list && (stage!=='active' || T42.hasBaseline() || T42.dayNo()>T42.lockDay())
                  && (stage!=='upcoming' || T42.hasBaseline())
                  && !(t42View==='baseline' && !T42.hasBaseline());
  bar.style.display = on ? 'flex' : 'none';
  if(!on) return;
  var cur=t42SegFor(t42View,stage);
  bar.innerHTML=list.map(function(t){
    return '<button class="seg'+(t[0]===cur?' on':'')+'" data-seg="'+t[0]+'" onclick="'+t[2]+'()">'+t[1]+'</button>';
  }).join('');
  /* The bar scrolls — five tabs do not fit a 375px phone. The app moving
     you itself, after a check-in or a finished workout, to a tab sitting
     off the right edge must bring the highlight into view. */
  var live=bar.querySelector ? bar.querySelector('.seg.on') : null;
  if(live && typeof live.scrollIntoView==='function'){
    try{ live.scrollIntoView({block:'nearest', inline:'nearest'}); }catch(e){}
  }
}

function t42StateCard(){
  if(T42.state==='loading'||T42.state==='idle')
    return '<div class="t42-skel"><div></div><div></div><div></div></div>';
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
  if(T42_DEMO) t42DemoMount();
  t42DraftLoad();
  t42CkReady=false; t42CkFor=null;
  /* Resume BEFORE the first paint when the state is already loaded. Opening
     on the landing hero and correcting it when the promise settles meant a
     member walking back from a finished workout saw "JOIN T42" flash at
     them — an invitation to join what they are already eighteen days into. */
  if(T42.state==='ready') t42Resume(); else t42View='landing';
  t42Paint(); t42Segs();
  T42.load().then(function(){ t42Resume(); t42Paint(); t42Segs(); });
}

/* Where someone lands is decided by the stage, and by one exception: a
   baseline still to give, while it can still be given. */
function t42Resume(){
  if(T42.state!=='ready') return;
  var st=T42.stage();
  var needBase = T42.isJoined() && !T42.hasBaseline();
  if(st==='unpaid'){ t42View = (needBase && T42.regOpen()) ? 'baseline' : 'pay'; return; }
  if(st==='finished'){ t42View='result'; return; }
  if(st==='closing'){  t42View='final'; return; }
  /* After the lock, the baseline form would be a form the server refuses —
     so the member goes to the dashboard, which says why they are not ranked. */
  if(needBase && T42.dayNo()<=T42.lockDay() && (st==='upcoming'||st==='active')){ t42View='baseline'; return; }
  if(st==='active'){   t42View='dash'; return; }
  if(st==='upcoming'){ t42View='joined'; return; }
  t42View='landing';
}

function t42Go(v){
  /* Leaving the check-in throws away the half-filled form. It is rebuilt
     from the saved row next time, so an abandoned edit does not quietly
     become the answer two screens later. */
  if(t42View==='checkin' && v!=='checkin'){ t42CkReady=false; t42CkFor=null; }
  t42View=v; t42Paint(); t42Segs(); $('screen').scrollTop=0;
}
function t42Reload(){ T42.load(true).then(function(){ t42Resume(); t42Paint(); t42Segs(); }); }

/* Named wrappers, because build.py checks that every onclick resolves to a
   real function and a bare T42.method would slip past it. */
function t42GoLanding(){ t42Go('landing'); }
function t42GoMode(){ t42Go('mode'); }
function t42GoTrack(){ t42Go('track'); }
function t42GoBaseline(){ t42Go('baseline'); }
function t42GoPay(){ t42Go('pay'); }
function t42GoJoined(){ t42Go('joined'); }
function t42GoRules(){ t42Go('rules'); }
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
function t42GoHome(){ t42Resume(); t42Paint(); t42Segs(); $('screen').scrollTop=0; }
function t42GoPhotos(){ t42ProgTab='photos'; t42Go('progress'); }
function t42GoJourney(){
  t42Go('journey');
  if(T42.journey===null || T42.journey===undefined){
    T42.loadJourney().then(function(){ if(t42View==='journey') t42RenderJourney(); },
                           function(){ T42.journey=[]; if(t42View==='journey') t42RenderJourney(); });
  }
}

/* A way back for the screens that sit outside the tabs — photos before the
   start, the rules, a past edition's result. */
/* There is one back button: the panel's own, at the top. A screen inside
   T42 tells it where to go and what to say ("‹ Track", "‹ T42"); every
   other screen leaves it on its default, back to Home. Two back buttons
   stacked one above the other asked a member to guess which was which. */
function t42ShellBack(label,go){
  if(typeof document==='undefined' || !document.querySelector) return;
  var b=document.querySelector('#t42 > .back'); if(!b || !b.setAttribute) return;
  b.innerHTML='<span class="bk-c" aria-hidden="true"></span>'+t42Esc(label||'Back');
  b.setAttribute('onclick', go ? go+'()' : "switchTab('home')");
}
function t42Back(label,go){ t42ShellBack(label||'T42', go||'t42GoHome'); return ''; }


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
      'The next one will show up here the moment registration opens.</div></div>'+
      t42JourneyLink();
    return;
  }

  var joined=T42.isJoined(), open=T42.regOpen();
  var price=Number(c.price_rm)||0;

  /* ── the poster ── */
  var h='<div class="t42-stage">'+
    '<div class="t42-stage-top"><span class="t42-logo t42-logo-s">T42</span>'+
    '<span class="t42-stage-tag">TRANSFORMATION 42 DAYS</span></div>'+
    '<div class="t42-stage-ed">'+t42Esc(t42EdName(c))+'</div>'+
    '<div class="t42-stage-h">'+t42Esc(c.subtitle||'42 days. One transformation.')+'</div>'+
    '<div class="t42-stage-dates">'+glyph('calendar')+'<span>'+t42Esc(t42Range(c))+'</span></div>'+
    '<div class="t42-when">'+t42Esc(t42WhenLine(c))+'</div>';
  if(joined && !T42.isOut()){
    h+='<button class="t42-stage-cta" onclick="t42Continue()">Continue</button>';
  } else if(!joined && open){
    h+='<button class="t42-stage-cta" onclick="t42Begin()">Join T42</button>'+
       (price ? '<div class="t42-stage-fine">RM'+t42Money(price)+' · this edition only</div>' : '');
  }
  h+='</div>';

  if(T42.isOut()){
    h+='<div class="acard"><div class="ah">'+ic('lock')+'<div class="t">Your place has ended</div></div>'+
       '<div class="sub">Your registration for '+t42Esc(t42EdName(c))+' was '+t42Esc(T42.reg.status)+
       '. If you think that is a mistake, message HITFAT.</div></div>';
  }
  if(!joined && !open){
    h+='<div class="acard"><div class="ah">'+ic('lock')+'<div class="t">Registration closed</div></div>'+
       '<div class="sub">This edition is no longer taking new participants. '+
       'The next one will open here.</div></div>';
  }

  if(T42.past && T42.past.challenge){
    h+='<div class="t42-list"><div class="t42-row" onclick="t42GoJourney()">'+t42Ic('trophy')+
       '<div class="t42-row-b"><div class="t42-row-l">Your '+t42Esc(t42EdName(T42.past.challenge))+' result</div>'+
       '<div class="t42-row-v">Result and certificate · My T42 Journey</div></div>'+
       '<span class="t42-chev">›</span></div></div>';
  }

  /* ── what it is, in four lines a beginner reads in five seconds ── */
  h+='<div class="sechead">How it works</div><div class="t42-list">'+
     t42Info('calendar','One start line','Everyone starts '+t42Day(t42Date(c.starts_on))+
             ' and finishes together, '+((c.total_days)||42)+' days later.')+
     t42Info('workout','A plan for every day','A workout, a step goal, water and one food habit — '+
             'about five things a day.')+
     t42Info('chart','Scored on more than the scale','Consistency, progress, missions and fitness. '+
             'Never kilograms alone.')+
     t42Info('trophy','Leaderboard and certificate','Ranked separately for men and women. '+
             'Every finisher gets a certificate.')+
     '</div>';

  h+=t42WeeksBlock('Six weeks');

  var tracks=t42Tracks();
  h+='<div class="sechead">'+(tracks.length===2?'Two tracks':'The tracks')+'</div><div class="t42-list">';
  tracks.forEach(function(t){
    h+='<div class="t42-row t42-info">'+ic(t.icon)+'<div class="t42-row-b">'+
       '<div class="t42-row-l t42-trackn">'+t42Esc(t.name)+'</div>'+
       '<div class="t42-row-v">'+t42Esc(t.line)+' '+t42Esc(t.who)+'</div></div></div>';
  });
  h+='</div>';

  /* The two experiences, but only when the edition runs both. */
  if(t42GymOpen()){
    h+='<div class="sechead">Two ways to do it</div><div class="t42-modes">';
    T42_MODES.forEach(function(m){
      h+='<div class="t42-mini"><div class="t42-mini-n">'+t42Esc(m.name)+'</div>'+
         '<div class="t42-mini-t">'+t42Esc(m.tag)+'</div></div>';
    });
    h+='</div>';
  }

  h+='<div class="sechead">Good to know</div><div class="t42-list">'+
     t42Info('lock','This edition only',
             'Your place is for '+t42EdName(c)+'. The next T42 is a new challenge and a new sign-up.')+
     t42Info('clock','Access ends with the challenge',
             'Daily content closes on '+t42Day(T42.lastDay(),true)+'. Your result, score and certificate stay with you.')+
     t42Info('eyeoff','Your numbers stay private',
             'The leaderboard shows your name and points — never your weight, waist or photos.')+
     '</div>';

  if(!joined && open)
    h+='<button class="bigbtn" onclick="t42Begin()">Join T42</button>';

  el.innerHTML=h;
}

/* One line of explanation, as a grouped-list row without a chevron. */
function t42Info(icon,title,sub){
  return '<div class="t42-row t42-info">'+t42Ic(icon)+'<div class="t42-row-b">'+
    '<div class="t42-row-l">'+t42Esc(title)+'</div><div class="t42-row-v">'+t42Esc(sub)+'</div></div></div>';
}
function t42Money(n){ n=Number(n)||0; return n%1 ? n.toFixed(2) : String(n); }

/* The six weeks as one strip: the week we are in lit, the ones done filled.
   Before day 1 every week is ahead, which is the point of showing it. */
var T42_WEEK_FALLBACK=['Build the Habit','Move More','Eat Better','Build Fitness','Push Performance','Finish Strong'];
function t42WeeksBlock(title){
  var total=(T42.challenge&&T42.challenge.total_days)||42;
  var n=Math.ceil(total/7), wk=T42.weekNo();
  var h=(title?'<div class="sechead">'+t42Esc(title)+'</div>':'')+'<div class="t42-weeks">';
  for(var i=1;i<=n;i++){
    var row=(T42.weeks||[]).filter(function(w){ return w.week_no===i; })[0];
    var name=(row&&row.theme)||T42_WEEK_FALLBACK[i-1]||('Week '+i);
    var cls = wk>i ? ' done' : wk===i ? ' now' : '';
    h+='<div class="t42-wk'+cls+'"><div class="t42-wk-n">Week '+i+'</div>'+
       '<div class="t42-wk-t">'+t42Esc(name)+'</div></div>';
  }
  return h+'</div>';
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
  if(c.status==='complete') return 'This edition has finished';
  if(c.status==='registration'||day===0){
    if(d===0) return 'Starts today';
    if(d===1) return 'Starts tomorrow';
    return 'Starts in '+d+' days';
  }
  if(T42.isOver()) return 'Finished · results coming';
  return 'Day '+day+' of '+(c.total_days||42);
}

function t42Begin(){
  if(!T42.challenge){ toast('No T42 edition is open'); return; }
  if(!T42.regOpen()){ toast('Registration for this T42 is closed'); return; }
  t42DraftLoad();
  if(!t42GymOpen()) t42Draft.mode='online_solo';
  t42Go(t42GymOpen() && !t42Draft.mode ? 'mode' : 'track');
}
function t42Continue(){ t42Resume(); t42Paint(); t42Segs(); $('screen').scrollTop=0; }

/* The way into the cabinet, for someone with no open edition to look at. */
function t42JourneyLink(){
  return '<button class="bigbtn sec" onclick="t42GoJourney()">My T42 Journey</button>';
}


/* ═══════════════════════════════════════════════════════════════
   03 · Mode
   ═══════════════════════════════════════════════════════════════ */

function t42RenderMode(){
  var el=$('t42-body'); if(!el) return;
  var h=t42Back('T42','t42GoLanding')+
        '<div class="hgroup"><div class="k">Step 1 of 3</div><h2>Choose your mode</h2>'+
        '<p>Same challenge. Different experience.</p></div>';

  T42_MODES.forEach(function(m){
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
  h+='<div class="t42-note">Gym Duo is trained at HITFAT HQ in Kota Bharu. You pair with '+
     'one partner of the same gender on the same track, you check in at the gym by QR, '+
     'and your body fat is measured on the gym\'s InBody at the start and the end.</div>';

  h+='<button class="bigbtn'+(t42Draft.mode?'':' off')+'" onclick="t42ModeNext()">Next</button>';
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
  var n=t42Steps();
  var h=t42Back('T42',n===3?'t42GoMode':'t42GoLanding')+
        '<div class="hgroup"><div class="k">Step '+(n-1)+' of '+n+'</div><h2>Choose your track</h2>'+
        '<p>Different goals. Same 42 days. Which track is for you?</p></div>';

  t42Tracks().forEach(function(t){
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

  h+='<button class="bigbtn'+(t42Draft.track?'':' off')+'" onclick="t42TrackNext()">Next</button>';
  el.innerHTML=h;
}

function t42PickTrack(t){ t42Draft.track=t; t42DraftSave(); t42RenderTrack(); }
function t42TrackNext(){
  /* A track this edition does not offer — a draft kept from an older one —
     is not a choice. */
  var ok=t42Tracks().some(function(x){ return x.id===t42Draft.track; });
  if(!t42Draft.track || !ok){ toast('Pick a track first'); return; }
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
  var id = score<=6 ? 'start' : score<=15 ? 'transform' : 'perform';
  /* An edition without START sends its beginners to TRANSFORM, which is
     built to be started from zero. */
  if(!t42Tracks().some(function(t){ return t.id===id; })) id='transform';
  return id;
}

function t42RenderAssessResult(){
  var el=$('t42-body'); if(!el) return;
  var id=t42Recommend(t42Quiz.score), t=t42Track(id);
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
  if(T42_DEMO && !T42.baseline){ t42Base={weight:'86.4',height:'174',waist:'98',age:'31',gender:'male',goal:'Fat Loss'}; return; }
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
  t42BaseTab='basic';

  var n=t42Steps(), joined=T42.isJoined();
  var h=(!joined ? t42Back('Track','t42GoTrack') : T42.isPaid() ? t42Back('T42') : t42Back('T42','t42GoLanding'))+
        '<div class="hgroup"><div class="k">'+(joined?'Your starting point':'Step '+n+' of '+n)+'</div>'+
        '<h2>'+(joined?'Your baseline':'Your starting point')+'</h2>'+
        '<p>Every number you beat is measured from here. Weigh in the morning, before eating.</p></div>';

  /* One form, in the order a person stands on a scale: weight, then height
     and waist, then the two things a leaderboard needs. The old Basic /
     Photos / Physical tabs sent a beginner looking for the button. */
  h+='<div class="bl-card"><div class="bl-h">'+ic('scale')+'<span>Your body</span></div>'+
     '<div class="bl-grid">'+
       t42BlField('t42-wt','weight','Weight','kg','decimal','0.1')+
       t42BlField('t42-ht','height','Height','cm','numeric','1')+
       t42BlField('t42-wc','waist','Waist','cm','decimal','0.1')+
       t42BlField('t42-age','age','Age','yrs','numeric','1')+
     '</div>'+
     '<div class="bl-tip">'+glyph('measure')+'<span>Waist: tape level with your belly button, standing relaxed, after you breathe out.</span></div>'+
     ((HF&&HF.data&&HF.data.nutrition&&HF.data.nutrition.w) ? '<div class="bl-note">Filled in from your HITFAT+ profile — change anything that is out of date.</div>' : '')+
     '</div>';

  h+='<div class="bl-card"><div class="bl-h">'+ic('people')+'<span>Your category</span></div>'+
     '<div class="t42-seg3">'+
       '<button class="'+(t42Base.gender==='male'?'on':'')+'" onclick="t42BaseSet(\'gender\',\'male\')">Men</button>'+
       '<button class="'+(t42Base.gender==='female'?'on':'')+'" onclick="t42BaseSet(\'gender\',\'female\')">Women</button></div>'+
     '<div class="bl-note" style="margin-top:2px;">Leaderboards are ranked separately for men and women.</div></div>';

  if(joined){
    var b=T42.baseline||{}, photos=!!(b.photo_front||b.photo_side||b.photo_back);
    h+='<div class="t42-list">'+
       t42Row('photo','Starting photos', photos?'Saved — private to you':'Front, side and back — private to you',
              photos?'done':'todo','t42GoPhotos()')+
       (T42.reg && T42.reg.mode!=='gym_duo' && T42.reg.verify_code
         ? t42Row('lock','Your verification code', t42Esc(T42.reg.verify_code)+' · for a scale photo if you finish on top','info','t42Noop()') : '')+
       '</div>';
  }

  h+=t42BaseFoot();
  el.innerHTML=h;
}
/* A number with its unit inside the box, so nobody types 175 into the kg. */
function t42BlField(id,key,label,unit,mode,step){
  return '<label class="bl-f" for="'+id+'"><span class="bl-l">'+label+'</span>'+
    '<span class="bl-in"><input class="inp" id="'+id+'" type="number" inputmode="'+mode+'" step="'+step+'" value="'+
    t42Esc(t42Base[key])+'" oninput="t42BaseNum(\''+id+'\',\''+key+'\')" placeholder="—"><i>'+unit+'</i></span></label>';
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
    h+='<div class="acard"><div class="ah">'+ic('photo')+'<div class="t">Front, side and back</div></div>'+
       '<div class="sub" style="margin-top:3px;">Stand in the same spot, same light, same clothes '+
       'you will wear on day 42.</div>'+
       '<button class="bigbtn sec" onclick="t42GoPhotos()">Add starting photos</button></div>';
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
    (T42.isJoined()?'':'<div class="t42-q" style="text-align:center;">Next: confirm your place.</div>');
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
  if(T42_DEMO){ if(!t42BaseValid()){ toast(t42BaseMissingLine()||'Fill in your baseline'); return; }
                t42DraftClear(); t42Base._ready=false; toast('Signed up — one step left'); t42DemoGo('pay'); return; }
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
    toast(T42.isPaid() ? 'Baseline saved' : 'Signed up — one step left');
    t42Go(T42.isPaid() ? (T42.dayNo()>0 ? 'dash' : 'joined') : 'pay');
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
  if(!T42.isPaid()) return t42RenderPay();
  if(T42.dayNo()>0) return t42RenderDash();
  var tr=t42Track(r.track)||{}, md=t42Mode(r.mode)||{};
  var to=T42.daysTo(), b=T42.baseline;

  var h='<div class="t42-stage">'+
    '<div class="t42-stage-top"><span class="t42-logo t42-logo-s">T42</span>'+
    '<span class="t42-stage-tag">'+t42Esc(t42EdName(c).toUpperCase())+'</span></div>'+
    '<div class="t42-stage-h t42-in">You\'re in.</div>'+
    '<div class="t42-stage-k">'+t42Esc(t42EdName(c))+' starts in</div>'+
    '<div class="t42-count" id="t42-cd">'+t42Countdown()+'</div>'+
    '<div class="t42-stage-dates">'+glyph('calendar')+'<span>'+t42Esc(t42Range(c))+'</span></div>'+
    '</div>';

  /* ── the checklist ── */
  var items=t42PrepItems(), done=items.filter(function(i){ return i.done; }).length;
  h+='<div class="sechead">Get ready <span class="t42-sec-n">'+done+' of '+items.length+'</span></div>'+
     '<div class="t42-list">';
  items.forEach(function(it){
    h+=t42Row(it.icon, t42Esc(it.label), t42Esc(it.value), it.done?'done':(it.go?'todo':'info'), it.go||'t42Noop()');
  });
  h+='</div>';

  if(r.mode==='gym_duo') h+=t42DuoSummaryCard();

  h+='<div class="sechead">Your challenge</div><div class="t42-grid">'+
     t42Stat('Track', tr.name||'—')+
     t42Stat('Mode',  r.mode==='gym_duo' ? 'Gym duo' : 'Online')+
     t42Stat('Starts', t42Day(t42Date(c.starts_on)))+
     t42Stat('Code',  r.verify_code||'—')+
     '</div>';
  if(b) h+='<div class="t42-grid" style="margin-top:10px;">'+
     t42Stat('Weight', b.weight_kg+' kg')+t42Stat('Waist', b.waist_cm+' cm')+'</div>';

  h+='<div class="t42-note">Day 1\'s workout, the daily check-in and the leaderboard open on '+
     t42Day(t42Date(c.starts_on))+'. Nothing to do until then except get ready.</div>';

  el.innerHTML=h;
  t42Tick();
}

/* ── the countdown ──
   Days and hours to midnight of day 1, redrawn once a minute while the
   screen is up. Seconds would be a slot machine; this is a date. */
function t42Countdown(){
  var c=T42.challenge, s=c&&t42Date(c.starts_on);
  if(!s) return '';
  var ms=Math.max(0, s-new Date());
  var d=Math.floor(ms/86400000), hr=Math.floor((ms%86400000)/3600000);
  return '<div class="t42-cd"><b>'+d+'</b><span>'+(d===1?'day to go':'days to go')+'</span></div>'+
         '<div class="t42-cd"><b>'+('0'+hr).slice(-2)+'</b><span>'+(hr===1?'hour':'hours')+'</span></div>';
}
var t42Timer=null;
function t42Tick(){
  if(t42Timer || typeof setInterval!=='function') return;
  t42Timer=setInterval(function(){
    var el=$('t42-cd');
    if(!el || t42View!=='joined'){ clearInterval(t42Timer); t42Timer=null; return; }
    el.innerHTML=t42Countdown();
    if(T42.dayNo()>0){ clearInterval(t42Timer); t42Timer=null; t42Resume(); t42Paint(); t42Segs(); }
  },60000);
}

/* What to have done before day 1. Each line opens the screen that does it;
   the ticks are read from what exists, never from a box someone ticked. */
function t42PrepItems(){
  var r=T42.reg||{}, b=T42.baseline, tr=t42Track(r.track)||{};
  var photos=!!(b && (b.photo_front||b.photo_side||b.photo_back));
  var items=[
    {icon:'check',   label:'Place confirmed', value:'Paid · '+t42EdName(T42.challenge), done:T42.isPaid()},
    {icon:'person',  label:'Profile', value:(b&&b.age?b.age+' yrs · ':'')+(r.gender==='female'?'Women':r.gender==='male'?'Men':'Category not set'),
                     done:!!(b && r.gender), go:'t42GoBaseline()'},
    {icon:'target',  label:'Track', value:tr.name||'—', done:!!tr.name},
    {icon:'measure', label:'Starting weight & waist',
                     value:T42.hasBaseline() ? b.weight_kg+' kg · '+b.waist_cm+' cm' : 'Add them',
                     done:T42.hasBaseline(), go:'t42GoBaseline()'},
    {icon:'photo',   label:'Starting photos', value:photos?'Saved — private to you':'Front, side, back',
                     done:photos, go:'t42GoPhotos()'},
    {icon:'doc',     label:'Rules & scoring', value:t42RulesRead()?'Read':'Two minutes to read',
                     done:t42RulesRead(), go:'t42GoRules()'}
  ];
  var url=t42Cfg().community_url;
  if(url) items.push({icon:'people', label:'Join the community', value:'The T42 group',
                      done:false, go:'t42Community()'});
  return items;
}
function t42Community(){
  var url=t42Cfg().community_url;
  if(url && /^https:\/\//.test(url)) window.open(url,'_blank');
}
function t42RulesKey(){ return 't42_rules_'+((T42.challenge&&T42.challenge.id)||''); }
function t42RulesRead(){ try{ return localStorage.getItem(t42RulesKey())==='1'; }catch(e){ return false; } }


/* ═══════════════════════════════════════════════════════════════
   Secure your spot

   Signed up is not in. The registration row exists from the baseline on,
   as 'pending'; payment turns it 'paid' on the server (pay-callback, or
   pay-status on the way back), and only then does anything count. The
   browser never names a price — it sends "t42:<edition>" and the server
   reads the price off the edition's own row.
   ═══════════════════════════════════════════════════════════════ */

var t42Paying=false;

function t42RenderPay(){
  var el=$('t42-body'); if(!el) return;
  var c=T42.challenge, r=T42.reg;
  if(!r) return t42RenderLanding();
  if(T42.isPaid()) return t42RenderJoined();
  var tr=t42Track(r.track)||{}, price=Number(c.price_rm)||0;
  var open=T42.regOpen() && !T42.isOver();

  var h='<div class="hgroup"><div class="k">'+(open?'Last step':t42EdName(c))+'</div>'+
        '<h2>'+(open?'Secure your spot':'Registration closed')+'</h2>'+
        '<p>'+(open?'Your sign-up is saved. Your place is confirmed the moment payment clears.'
                   :'This edition is no longer taking payments, so your place was not confirmed.')+
        '</p></div>';

  h+='<div class="t42-list">'+
     t42Row('calendar', t42Esc(t42EdName(c)), t42Esc(t42Range(c)), 'info', 't42Noop()')+
     t42Row('target', 'Track', t42Esc(tr.name||'—'), 'done', 't42Noop()')+
     t42Row('measure', 'Starting point', T42.hasBaseline()
        ? T42.baseline.weight_kg+' kg · '+T42.baseline.waist_cm+' cm' : 'Not added yet',
        T42.hasBaseline()?'done':'todo', 't42GoBaseline()')+
     '</div>';

  if(!open){
    h+=t42JourneyLink();
    el.innerHTML=h; return;
  }

  /* HITFAT+ Coach includes one edition a year: claimed, not paid. */
  if(typeof hasCoach==='function' && hasCoach()){
    h+='<div class="acard"><div class="ah">'+ic('trophy')+'<div class="t">Included with HITFAT+ Coach</div></div>'+
       '<div class="sub">Your membership includes one T42 edition a year. Claim this place instead of paying.</div>'+
       '<button class="bigbtn" id="t42-claim" onclick="t42ClaimCoach()">Claim my place</button></div>';
    h+='<div class="t42-q" style="text-align:center;margin:10px 0 4px;">Or pay for it separately</div>';
  }
  if(price>0){
    h+='<div class="t42-price"><div class="t42-price-n">RM'+t42Money(price)+'</div>'+
       '<div class="t42-price-l">One payment · '+t42Esc(t42EdName(c))+' only</div></div>';
    if(typeof PAY_CHANNELS!=='undefined'){
      h+='<div class="paychs">'+PAY_CHANNELS.map(function(ch){
        return '<button class="paych'+(ch[0]===payChannel?' on':'')+'" onclick="setPayChannel('+ch[0]+')">'+
               '<b>'+ch[1]+'</b><small>'+ch[2]+'</small></button>';
      }).join('')+'</div>';
    }
    h+='<button class="bigbtn" id="t42-pay-go" onclick="t42PayNow()">Pay RM'+t42Money(price)+'</button>'+
       '<div class="t42-note">Secure payment by Bayarcash — FPX or DuitNow. This covers '+
       t42Esc(t42EdName(c))+' only: daily content closes on '+t42Day(T42.lastDay(),true)+
       ', your result and certificate stay with you. It is not a HITFAT+ subscription.</div>';
  } else {
    h+='<div class="acard"><div class="ah">'+ic('clock')+'<div class="t">Payment opens soon</div></div>'+
       '<div class="sub">Your spot is held. Online payment for this edition is not open yet — '+
       'message HITFAT and we will confirm your place.</div>'+
       '<button class="bigbtn sec" onclick="t42AskPay()">Message HITFAT</button></div>';
  }
  h+='<button class="bigbtn sec" onclick="t42Reload()">I have paid — check again</button>';
  el.innerHTML=h;
}

var t42Claiming=false;
async function t42ClaimCoach(){
  if(T42_DEMO){ t42DemoNote(); return; }
  if(t42Claiming || !T42.challenge) return;
  t42Claiming=true;
  var b=$('t42-claim'); if(b){ b.classList.add('off'); b.textContent='Claiming…'; }
  try{
    var r=await sb.rpc('t42_claim_with_coach',{p_challenge:T42.challenge.id});
    if(r.error) throw r.error;
    toast('Your place is confirmed — you\'re in');
    await T42.load(true); t42Resume(); t42Paint(); t42Segs();
  }catch(e){
    toast((e&&e.message)||'Could not claim the place');
    if(b){ b.classList.remove('off'); b.textContent='Claim my place'; }
  }finally{ t42Claiming=false; }
}

function t42AskPay(){
  var c=T42.challenge, r=T42.reg||{};
  window.open('https://wa.me/60176132170?text='+encodeURIComponent(
    'Hi HITFAT, I signed up for '+t42EdName(c)+' (code '+(r.verify_code||'-')+') and would like to pay.'),'_blank');
}

async function t42PayNow(){
  if(T42_DEMO){ toast('Payment confirmed — you\'re in'); t42DemoGo('upcoming'); return; }
  if(t42Paying) return;
  var c=T42.challenge; if(!c || !T42.reg) return;
  if(typeof PAY_CREATE==='undefined'){ toast('Payment is not available here'); return; }
  var sku='t42:'+c.slug;
  var btn=$('t42-pay-go');
  t42Paying=true;
  if(btn){ btn.classList.add('off'); btn.textContent='Opening secure payment…'; }
  try{
    var tk=await scanToken();
    if(!tk){ toast('Sign in first.'); return; }
    var r=await fetch(PAY_CREATE,{method:'POST',
      headers:{'Content-Type':'application/json','Authorization':'Bearer '+tk,'apikey':SUPA_KEY},
      body:JSON.stringify({sku:sku, channel:payChannel, name:(HF.data.prefs&&HF.data.prefs.name)||''})});
    var d=await r.json();
    if(r.ok && d && d.url){ localStorage.setItem('hf_plus_pending', sku); location.href=d.url; return; }
    if(d && d.code==='already_owned'){ toast('You are already in'); t42Reload(); return; }
    toast((d&&d.error)||'Could not start payment. Try again.');
  }catch(e){ toast('Could not start payment — check your connection.'); }
  finally{
    t42Paying=false;
    if(btn){ btn.classList.remove('off'); btn.textContent='Pay RM'+t42Money(c.price_rm); }
  }
}

/* Back from the gateway. The callback usually lands first; pay-status is
   the backstop that asks Bayarcash directly. Either way the answer is the
   registration row, read again. */
function t42AwaitPayment(){
  var tries=0;
  toast('Confirming your T42 payment…');
  var t=setInterval(async function(){
    tries++;
    try{
      var tk=await scanToken();
      if(tk) await fetch(PAY_STATUS,{headers:{'Authorization':'Bearer '+tk,'apikey':SUPA_KEY}});
    }catch(e){}
    try{ await T42.load(true); }catch(e){}
    if(T42.isPaid() || tries>=8){
      clearInterval(t);
      if(T42.isPaid()){ toast('Payment confirmed — you\'re in'); openT42(); try{ renderHome(); }catch(e){} }
      else toast('Not confirmed yet — your place is confirmed by itself once it clears.');
    }
  },3000);
}


/* ═══════════════════════════════════════════════════════════════
   The rules, in plain words

   Everything a participant should know before day 1, on one page, read
   from the edition — dates, weights, categories — so the page cannot say
   one thing while the scorer does another.
   ═══════════════════════════════════════════════════════════════ */

var T42_WEIGHT_NAME={
  weight_pct:'Weight change', waist_pct:'Waist change', bodyfat_pct:'Body fat change',
  weight_waist_pct:'Weight & waist', workout_pct:'Workouts completed', consistency_pct:'Daily consistency',
  attendance_pct:'Gym attendance', rush_pct:'RUSH missions', fitness_pct:'Fitness tests',
  checkin_pct:'Daily check-ins', steps_pct:'Step goal', weekly_pct:'Weekly reviews'
};
function t42WeightSet(){
  var sc=t42Cfg().scoring||{}, r=T42.reg||{};
  var key = r.track==='perform' ? 'perform' : r.track==='start' ? 'consistency'
          : r.mode==='gym_duo' ? 'gym_transform' : 'online_transform';
  return sc[key] || sc.online_transform || null;
}

function t42RenderRules(){
  var el=$('t42-body'); if(!el) return;
  var c=T42.challenge; if(!c) return t42RenderLanding();
  try{ localStorage.setItem(t42RulesKey(),'1'); }catch(e){}
  var tr=t42Track((T42.reg||{}).track);
  var h=(T42.stage()==='upcoming' ? '' : t42Back('T42'))+
        '<div class="hgroup"><div class="k">'+t42Esc(t42EdName(c))+'</div><h2>How T42 works</h2>'+
        '<p>Two minutes. Everything that decides your result.</p></div>';

  h+='<div class="sechead">The dates</div><div class="t42-list">'+
     t42Info('calendar','Day 1', t42Day(t42Date(c.starts_on),true))+
     t42Info('flag','Day '+(c.total_days||42), t42Day(t42Date(c.ends_on),true))+
     (c.results_on ? t42Info('trophy','Results', t42Day(t42Date(c.results_on),true)) : '')+
     t42Info('lock','Content closes', t42Day(T42.lastDay(),true)+'. Your result stays.')+
     '</div>';

  h+='<div class="sechead">Every day</div><div class="t42-list">'+
     t42Info('workout','Do the workout','Or rest, on a rest day. It plays in the HITFAT+ player.')+
     t42Info('steps','Walk your steps','The goal grows each week, from '+t42Num(T42.stepTarget())+'.')+
     t42Info('food','One food habit','Keep portions controlled and include a good protein source in your main meals.')+
     t42Info('check','Check in','Thirty seconds. The app works out your score — you never add anything up.')+
     '</div>';

  var ws=t42WeightSet();
  if(ws){
    h+='<div class="sechead">How you are scored</div>'+
       '<div class="acard"><div class="sub" style="margin-bottom:10px;">'+
       (tr?t42Esc(tr.name)+' is':'Your track is')+' scored out of 100, and never on kilograms alone:</div>';
    Object.keys(ws).forEach(function(k){
      var v=Number(ws[k])||0; if(!v) return;
      h+=t42Bar(T42_WEIGHT_NAME[k]||k.replace(/_pct$/,'').replace(/_/g,' '), v);
    });
    h+='</div>';
  }

  h+='<div class="sechead">The leaderboard</div><div class="t42-list">'+
     t42Info('people','Ranked separately','Transform and Perform, men and women — plus a Consistency award.')+
     t42Info('eyeoff','Private by design','Your name and points only. Never your weight, waist or photos.')+
     t42Info('lock','Verified finishers','Top finishers show a scale photo with their code before results are announced.')+
     '</div>';

  h+='<div class="sechead">If you miss a day</div>'+
     '<div class="acard"><div class="sub">Nothing resets. You stay on the same day as everyone else '+
     'and carry on with today. A missed day counts against consistency — one day never ruins 42.</div></div>';

  h+='<div class="sechead">After day '+(c.total_days||42)+'</div>'+
     '<div class="acard"><div class="sub">The daily plan, check-ins and leaderboard close with the challenge. '+
     'Your result, score, badges and certificate stay in My T42 Journey. The next T42 is a new '+
     'challenge and a new sign-up.</div></div>';

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

  var head, sub, cta, st=T42.stage(), day=T42.dayNo(), to=T42.daysTo();
  var tn=((t42Track(T42.reg&&T42.reg.track)||{}).name||'');
  if(st==='out') return '';
  if(st==='finished'){
    head='T42 complete';
    sub = T42.certs&&T42.certs.length ? 'Your result and certificate are ready' : 'See your result';
    cta='See Result';
  } else if(st==='closing'){
    head='Finished'; sub='Finished · results are being checked'; cta='Open T42';
  } else if(st==='unpaid'){
    if(!T42.hasBaseline() && T42.regOpen()){
      head='Finish your sign-up'; sub='Your starting point, then your place'; cta='Continue';
    } else {
      head='Secure your spot'; sub='One step left — confirm your place in '+t42EdName(T42.challenge); cta='Continue';
    }
  } else if((st==='upcoming'||st==='active') && !T42.hasBaseline() && day<=T42.lockDay()){
    head='Finish your baseline';
    sub='Your starting point is what every result is measured from';
    cta='Continue';
  } else if(st==='upcoming'){
    head = to===0 ? 'Starts today' : 'Starts in '+to+(to===1?' day':' days');
    sub  = 'You\'re in · '+tn;
    cta='Open T42';
  } else if(st==='active'){
    head='Day '+day+' of '+((T42.challenge.total_days)||42);
    /* The one thing still to do today, so the banner is a nudge rather
       than a label. */
    sub = !T42.today ? 'Check in for today'
        : (T42.planDay && !T42.doneToday) ? 'Today: '+T42.planDay.title
        : 'Today is done';
    cta='Open Today';
  } else {
    /* Nobody is invited to a door that is shut. */
    if(!T42.regOpen()) return '';
    head=T42.challenge.subtitle||'42 days. One transformation.';
    sub = t42WhenLine(T42.challenge)+' · '+t42Tracks().map(function(t){ return t.name; }).join(' · ');
    cta='Join T42';
  }

  var ed=t42EdName(T42.challenge).toUpperCase();
  var bar = st==='active'
    ? '<div class="t42-banner-bar"><i style="width:'+Math.round(day/((T42.challenge.total_days)||42)*100)+'%"></i></div>' : '';
  return '<div class="t42-banner" onclick="openT42()">'+
    '<div class="t42-banner-top"><span class="t42-banner-logo">T42</span>'+
    '<span class="t42-banner-tag">'+t42Esc(ed)+'</span></div>'+
    '<div class="t42-banner-line">'+t42Esc(head)+'</div>'+
    '<div class="t42-banner-sub">'+t42Esc(sub)+'</div>'+bar+
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
  if(!T42.isPaid()) return t42RenderPay();
  if(!day)     return t42RenderJoined();          // still counting down
  if(T42.isComplete()) return t42RenderResult();  // the results are out
  if(T42.isOver())     return t42RenderFinal();   // over, results being checked

  var total=(c&&c.total_days)||42, left=T42.daysLeft();
  var wk=T42.weekNo(), theme=T42.week&&T42.week.theme;

  /* ── where I am: one number, one bar, one line ── */
  var h='<div class="t42-stage t42-today">'+
    '<div class="t42-stage-top"><span class="t42-logo t42-logo-s">T42</span>'+
    '<span class="t42-stage-tag">'+t42Esc(t42EdName(c).toUpperCase())+'</span></div>'+
    '<div class="t42-day"><div class="t42-day-l">'+
      '<div class="t42-day-n">Day '+day+'</div>'+
      '<div class="t42-day-s">of '+total+(wk?' · Week '+wk+(theme?' · '+t42Esc(theme):''):'')+'</div></div>'+
      '<div class="t42-left"><b>'+left+'</b><span>'+(left===1?'day left':'days left')+'</span></div></div>'+
    t42Journey(day,total)+
    '</div>';

  if(T42.week && T42.week.focus)
    h+='<div class="t42-q t42-focus">'+t42Esc(T42.week.focus)+'</div>';

  /* ── the one button: what to do next, before anything else ── */
  var nx=t42NextAction();
  h+='<button class="bigbtn t42-go'+(nx.done?' sec':'')+'" onclick="'+nx.go+'">'+t42Esc(nx.label)+'</button>';

  /* ── the moments worth stopping for ── */
  var ms=t42Milestone(day,total);
  if(ms) h+='<div class="t42-mile"><div class="t42-mile-i">'+glyph(ms.icon)+'</div>'+
            '<div><div class="t42-mile-t">'+t42Esc(ms.title)+'</div>'+
            '<div class="t42-mile-s">'+t42Esc(ms.sub)+'</div></div></div>';

  /* A missed day is said once, kindly, with the one thing that helps: the
     check-in for yesterday is still open until tonight. */
  if(t42MissedYesterday()){
    h+='<div class="acard t42-missed"><div class="ah">'+ic('heart')+'<div class="t">You missed yesterday</div></div>'+
       '<div class="sub">That is fine — nothing resets. Today\'s plan is ready. '+
       'If you did train or walk yesterday, you can still log it this morning.</div>'+
       '<button class="bigbtn sec" onclick="t42CheckYesterday()">Log yesterday</button></div>';
  }

  /* The two states that outrank today's list. */
  if(!T42.hasBaseline()){
    h+='<div class="acard"><div class="ah">'+ic('measure')+'<div class="t">Not ranked this time</div></div>'+
       '<div class="sub">The baseline closed on day '+T42.lockDay()+' without one, so there is no '+
       'starting point to measure a result from. Keep training and checking in — it all still counts '+
       'for you, just not on the leaderboard.</div></div>';
  } else if(t42OpenPhase()==='final'){
    var fl=t42FinalItems().filter(function(i){ return i.done===false && !i.optional && !i.coach; }).length;
    h+='<div class="acard t42-alert" onclick="t42GoFinal()" style="cursor:pointer;">'+
       '<div class="ah">'+ic('flag')+'<div class="t">Final assessment is open</div><div class="c">›</div></div>'+
       '<div class="sub">'+(fl ? fl+' thing'+(fl===1?'':'s')+' left to submit'
                               : 'Everything is in. Waiting on verification.')+'</div></div>';
  } else if(t42OpenPhase()==='mid' && !T42.mid){
    h+='<div class="acard t42-alert" onclick="t42GoProgress()" style="cursor:pointer;">'+
       '<div class="ah">'+ic('measure')+'<div class="t">Halfway check-in is open</div><div class="c">›</div></div>'+
       '<div class="sub">Weight, waist and photos — the same way as day 1.</div></div>';
  }

  /* ── today ── */
  h+='<div class="sechead">Today</div><div class="t42-list">';

  var ck=T42.today;
  var wDone=!!T42.doneToday;
  var planned=T42.planDay;

  h+=t42Row('workout','Workout',
        wDone ? t42Esc(T42.doneToday.title||'Completed')
              : (planned ? t42Esc(planned.title)+(planned.est_minutes?' · '+planned.est_minutes+' min':'') : 'Rest day'),
        wDone ? 'done' : (planned?'todo':'rest'), 't42GoTrain()');

  h+=t42Row('steps','Steps',
        ck&&ck.steps!=null ? (t42Num(ck.steps)+' / '+t42Num(T42.stepTarget()))
                           : ('Goal '+t42Num(T42.stepTarget())),
        ck&&ck.steps>=T42.stepTarget() ? 'done' : 'todo', 't42GoCheckin()');

  h+=t42Row('food','Nutrition',
        ck&&ck.nutrition ? t42NutLabel(ck.nutrition) : 'Protein with each main meal',
        ck&&ck.nutrition==='on_track' ? 'done' : 'todo', 't42GoCheckin()');

  h+=t42Row('water','Water',
        ck&&ck.water_ml!=null ? ((ck.water_ml/1000).toFixed(1)+'L / '+(T42.waterTarget()/1000).toFixed(1)+'L')
                              : ('Goal '+(T42.waterTarget()/1000).toFixed(1)+'L'),
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
  if(T42.isGym()) h+=t42DuoDashCard();

  /* ── how it is going: four numbers, all earned ── */
  var sc=T42.score, pts = sc && sc.eligible ? t42Fmt(t42MyBoard()==='consistency'?sc.consistency_total:sc.total) : '—';
  h+='<div class="sechead">Your progress</div><div class="t42-grid">'+
     t42Stat('Streak', T42.streak()+(T42.streak()===1?' day':' days'))+
     t42Stat('Compliance', T42.consistency()+'%')+
     t42Stat('Workouts', T42.workoutPct()+'%')+
     t42Stat('Points', pts)+
     '</div>';
  var dw=t42Delta('weight_kg'), dc=t42Delta('waist_cm');
  if(dw!=null || dc!=null){
    h+='<div class="t42-grid" style="margin-top:10px;">'+
       t42Change('Weight', dw, 'kg', t42DeltaPct('weight_kg'))+
       t42Change('Waist',  dc, 'cm', t42DeltaPct('waist_cm'))+'</div>';
  }

  /* The mini challenge, if the week carries one. */
  if(T42.week && T42.week.mini_title){
    h+='<div class="sechead">This week</div>'+
       '<div class="acard"><div class="ah">'+ic('target')+'<div class="t">'+
       t42Esc(T42.week.mini_title)+'</div></div>'+
       '<div class="sub">'+t42Esc(T42.week.mini_detail||'')+'</div></div>';
  }

  /* The rank is the server's. Until it has run there is none, and saying so
     beats a zero that looks like a result. A gym member competes as a duo,
     and the duo card above already carries the standing that matters. */
  var rk=t42MyRank();
  if(T42.isGym()){
    /* nothing — the duo card is the standing */
  } else if(sc && sc.eligible && rk){
    h+='<div class="t42-list" style="margin-top:14px;"><div class="t42-row" onclick="t42GoRank()">'+
       t42Ic('trophy')+'<div class="t42-row-b"><div class="t42-row-l">Leaderboard</div>'+
       '<div class="t42-row-v">'+t42Esc((T42_BOARDS.filter(function(x){ return x.id===t42MyBoard(); })[0]||{}).n||'')+
       '</div></div><span class="t42-lb-s">'+String.fromCharCode(35)+rk+'</span><span class="t42-chev">›</span></div></div>';
  } else if(sc && !sc.eligible && sc.note){
    h+='<div class="t42-note">Not ranked yet — '+t42Esc(sc.note.charAt(0).toLowerCase()+sc.note.slice(1))+'.</div>';
  } else {
    h+='<div class="t42-note">Your place on the leaderboard appears once the first scores are in. '+
       'They are worked out on the server every hour.</div>';
  }

  el.innerHTML=h;
}

/* The 42 days as six weeks, filled up to today, with the milestones on it.
   Built from divs so it scales with the card instead of a fixed SVG. */
function t42Journey(day,total){
  var n=Math.ceil(total/7), h='<div class="t42-jbar">';
  for(var i=1;i<=n;i++){
    var from=(i-1)*7, span=Math.min(7,total-from);
    var fill=Math.max(0,Math.min(1,(day-from)/span));
    h+='<div class="t42-jseg'+(fill>=1?' full':'')+'"><i style="width:'+Math.round(fill*100)+'%"></i></div>';
  }
  h+='</div><div class="t42-jlab">';
  for(var j=1;j<=n;j++) h+='<span'+(j===T42.weekNo()?' class="on"':'')+'>W'+j+'</span>';
  return h+'</div>';
}

var T42_MILESTONES={
  7: {title:'7 days complete',   sub:'One week of showing up. That is the habit starting.', icon:'star'},
  14:{title:'Two weeks strong',  sub:'Fourteen days in. Most people never get this far.',   icon:'flame'},
  21:{title:'Halfway there',     sub:'Twenty-one down, twenty-one to go. Time for your halfway check-in.', icon:'target'},
  28:{title:'4 weeks complete',  sub:'Four weeks of work. You can feel it now.',           icon:'bolt'},
  35:{title:'Final week',        sub:'Seven days left. Finish the way you started.',        icon:'flag'},
  42:{title:'You did it.',       sub:'Day 42. Finish today, then your final assessment.',   icon:'trophy'}
};
function t42Milestone(day,total){
  if(day===total && total!==42) return T42_MILESTONES[42];
  return T42_MILESTONES[day]||null;
}

/* Yesterday had no check-in, today has none yet, and it is not day 1. */
function t42MissedYesterday(){
  var day=T42.dayNo(); if(day<2 || T42.today) return false;
  return !T42.checkins.some(function(c){ return c.day_no===day-1; });
}
function t42CheckYesterday(){
  var day=T42.dayNo(); if(day<2) return;
  t42CkReady=false; t42Go('checkin'); t42CkFor=day-1; t42CkReady=false; t42RenderCheckin();
}

/* What "Continue today" means right now. */
function t42NextAction(){
  if(T42.planDay && !T42.doneToday) return {label:'Continue Today · Start Workout', go:'t42PlayToday()'};
  if(!T42.today)                     return {label:'Continue Today · Check In', go:'t42GoCheckin()'};
  return {label:'Today is done — see your progress', go:'t42GoProgress()', done:true};
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
  /* Anything T42 does not draw itself comes from the app's own set. */
  if(!T42_ICON[kind] && typeof ic==='function') return ic(kind);
  var cls = kind==='photo' ? 'check' : kind==='clock' ? 'rush' : kind;
  return '<span class="t42-ic '+cls+'"><svg viewBox="0 0 24 24" aria-hidden="true">'+
         (T42_ICON[kind]||T42_ICON.check)+'</svg></span>';
}

function t42Row(icon,label,value,state,go){
  var mark = state==='done' ? '<span class="t42-tick">✓</span>'
           : state==='rest' ? '<span class="t42-rest">rest</span>'
           : state==='info' ? ''
           : '<span class="t42-chev">›</span>';
  return '<div class="t42-row'+(state==='done'?' done':'')+(state==='info'?' t42-info':'')+'" onclick="'+go+'">'+
    t42Ic(icon)+
    '<div class="t42-row-b"><div class="t42-row-l">'+label+'</div>'+
    '<div class="t42-row-v">'+value+'</div></div>'+mark+'</div>';
}
/* A row that ends in a result rather than a chevron: start → finish, change. */
function t42ResRow(icon,label,value,res){
  return '<div class="t42-row t42-info">'+t42Ic(icon)+
    '<div class="t42-row-b"><div class="t42-row-l">'+t42Esc(label)+'</div>'+
    '<div class="t42-row-v">'+t42Esc(value)+'</div></div><span class="t42-res">'+t42Esc(res)+'</span></div>';
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
/* The day being checked in. Null is today; yesterday is allowed until the
   server's morning-after window closes, so a missed evening is not lost. */
var t42CkFor=null;
function t42CkDay(){ return t42CkFor || T42.dayNo(); }

function t42CkLoad(){
  var d=t42CkDay();
  var c=t42CkFor ? (T42.checkins.filter(function(x){ return x.day_no===d; })[0]||null) : T42.today;
  t42Ck = c ? {energy:c.energy||0, sleep:c.sleep||'', nutrition:c.nutrition||'',
               water_ml:c.water_ml||0, steps:c.steps!=null?String(c.steps):'',
               workout:c.workout||'', mood:c.mood||''}
            : {energy:0, sleep:'', nutrition:'', water_ml:0, steps:'',
               workout:(!t42CkFor && T42.doneToday)?'completed':'', mood:''};
  t42CkReady=true;
}

function t42RenderCheckin(){
  var el=$('t42-body'); if(!el) return;
  if(!T42.reg || !T42.dayNo()) return t42RenderDash();
  if(T42.isOver() || T42.isComplete()) return t42Finished('Check-ins');
  if(!t42CkReady) t42CkLoad();

  var day=t42CkDay(), past=!!t42CkFor;
  var saved=past ? T42.checkins.some(function(x){ return x.day_no===day; }) : !!T42.today;
  var h='<div class="hgroup"><div class="k">Day '+day+(past?' · Yesterday':'')+'</div><h2>Daily check-in</h2>'+
        '<p>'+(saved?'Already saved. Change anything you like.'
               :past?'Log what you did yesterday. It closes tonight.'
                    :'Five quick answers, about thirty seconds.')+'</p></div>';

  var pill=function(k,v,label){
    return '<button class="t42-pill'+(t42Ck[k]===v?' on':'')+'" onclick="t42CkSet(\''+k+'\','+(typeof v==='number'?v:'\''+v+'\'')+')">'+label+'</button>';
  };
  var card=function(icon,title,sub,body){
    return '<div class="ck-card"><div class="ck-h">'+t42Ic(icon)+'<div><div class="ck-t">'+title+'</div>'+
      (sub?'<div class="ck-s">'+sub+'</div>':'')+'</div></div>'+body+'</div>';
  };

  /* In the order that matters for the day: did I train, did I move, did I
     drink, did I eat well — then how I feel. */
  var plan=(!past && T42.planDay) ? t42Esc(T42.planDay.title) : (past ? 'Yesterday\'s session' : 'Rest day — recovery counts');
  h+=card('workout','Workout', plan,
     '<div class="t42-pills">'+pill('workout','completed','Done')+pill('workout','rest','Rest day')+pill('workout','planned','Not yet')+'</div>');

  var stp=parseInt(t42Ck.steps,10)||0, tgt=T42.stepTarget(), sp=Math.min(100,Math.round(stp/tgt*100));
  h+=card('steps','Steps','Goal '+t42Num(tgt)+' · read it off your phone\'s health app',
     '<span class="bl-in ck-in"><input class="inp" id="t42-steps" type="number" inputmode="numeric" placeholder="0" value="'+
       t42Esc(t42Ck.steps)+'" oninput="t42CkNum(\'t42-steps\',\'steps\')"><i>steps</i></span>'+
     '<div class="nbar"><i id="t42-stepbar" style="width:'+sp+'%;background:var(--hitfat);"></i></div>');

  var glasses=Math.round((t42Ck.water_ml||0)/250);
  h+=card('water','Water', ((t42Ck.water_ml||0)/1000).toFixed(2).replace(/0$/,'')+' L of '+(T42.waterTarget()/1000).toFixed(1)+' L · each glass 250 ml',
     '<div class="t42-glasses">'+[1,2,3,4,5,6,7,8].map(function(n){
       return '<button class="t42-glass'+(n<=glasses?' on':'')+'" aria-label="'+n+' glasses" onclick="t42CkWater('+n+')">'+glyph('water')+'</button>';
     }).join('')+'</div>');

  h+=card('food','Food','A good protein source with each main meal?',
     '<div class="t42-pills">'+pill('nutrition','on_track','On track')+pill('nutrition','partly','Partly')+pill('nutrition','off_track','Off track')+'</div>');

  h+=card('person','How you feel','',
     '<div class="ck-sub">Energy</div><div class="t42-pills">'+[1,2,3,4,5].map(function(n){ return pill('energy',n,String(n)); }).join('')+'</div>'+
     '<div class="ck-scale"><span>Low</span><span>Great</span></div>'+
     '<div class="ck-sub">Sleep</div><div class="t42-pills">'+pill('sleep','poor','Poor')+pill('sleep','ok','OK')+pill('sleep','good','Good')+'</div>');

  var answered=['workout','nutrition','energy','sleep'].filter(function(k){ return !!t42Ck[k]; }).length+
               (t42Ck.water_ml?1:0)+(t42Ck.steps!==''?1:0);
  h+='<div class="ck-foot"><div class="ck-count">'+answered+' of 6 answered</div>'+
     '<button class="bigbtn'+(t42CkValid()?'':' off')+'" onclick="t42SaveCheckin()">'+
     (saved?'Update Check-in':'Save Check-in')+'</button></div>';

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
  var bar=$('t42-stepbar');
  if(bar && bar.style) bar.style.width=Math.min(100,Math.round((parseInt(t42Ck.steps,10)||0)/T42.stepTarget()*100))+'%';
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
  if(!T42.reg || (!T42_DEMO && (!sb || !SUPA_READY))){ toast('Sign in to check in'); return; }
  var day=t42CkDay(), today=T42.dayNo();
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
    var r = T42_DEMO ? {data:Object.assign({id:'demo-ck-'+day},row)}
      : await sb.from('t42_daily_checkins')
        .upsert(row,{onConflict:'registration_id,day_no'}).select().maybeSingle();
    if(r.error) throw r.error;

    if(day===today) T42.today=r.data;
    T42.checkins=T42.checkins.filter(function(c){ return c.day_no!==day; });
    T42.checkins.unshift(r.data);
    T42.checkins.sort(function(a,b){ return b.day_no-a.day_no; });
    toast('Checked in for day '+day);
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
  if(T42_DEMO && T42.reg && meta && meta.t42day){
    T42.doneToday={day_no:meta.t42day,title:meta.name||'Workout',minutes:mins||meta.t42mins||null};
    T42.completions=[T42.doneToday].concat(T42.completions.filter(function(c){ return c.day_no!==meta.t42day; }));
    return;
  }
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

  /* Before day 1 this is only reached for the starting photos, from the
     checklist — and the tabs above do not list it, so it needs its own way back. */
  var h=(T42.stage()==='upcoming' ? t42Back('Overview','t42GoJoined') : '')+
        '<div class="segs" id="t42-progtabs">'+
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
  if(T42_DEMO){ t42DemoNote(); return; }
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
  if(T42_DEMO){ t42DemoNote(); return; }
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
  if(T42_DEMO){ t42DemoNote(); return; }
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

  /* Gym duo only where there is a gym edition, or for someone in one. */
  var h='';
  if(t42GymOpen() || T42.isGym()){
    h+='<div class="segs" id="t42-ranktabs">'+
      '<button class="seg'+(t42BoardMode==='online'?' on':'')+'" onclick="t42RankMode(\'online\')">Online solo</button>'+
      '<button class="seg'+(t42BoardMode==='duo'?' on':'')+'" onclick="t42RankMode(\'duo\')">Gym duo</button></div>';
  } else t42BoardMode='online';

  if(t42BoardMode==='duo'){ el.innerHTML=h+t42DuoBoard(); return; }

  /* Which board, as two plain questions: which category, then men or women.
     Five chips in a heap made the member hunt for their own. */
  var grp = t42Board==='consistency' ? 'consistency' : t42Board.split('_')[0];
  var sex = t42Board==='consistency' ? '' : t42Board.split('_')[1];
  h+='<div class="t42-seg3">'+[['transform','Transform'],['perform','Perform'],['consistency','Consistency']].map(function(g){
       return '<button class="'+(grp===g[0]?'on':'')+'" onclick="t42RankGroup(\''+g[0]+'\')">'+g[1]+'</button>'; }).join('')+'</div>';
  if(grp!=='consistency')
    h+='<div class="t42-seg3 t42-seg2">'+[['male','Men'],['female','Women']].map(function(x){
       return '<button class="'+(sex===x[0]?'on':'')+'" onclick="t42RankSex(\''+x[0]+'\')">'+x[1]+'</button>'; }).join('')+'</div>';

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
function t42RankGroup(g){
  if(g==='consistency'){ t42Board='consistency'; }
  else { var s=t42Board==='consistency' ? ((T42.reg&&T42.reg.gender)||'male') : t42Board.split('_')[1]; t42Board=g+'_'+s; }
  t42RenderRank();
}
function t42RankSex(s){ var g=t42Board==='consistency'?'transform':t42Board.split('_')[0]; t42Board=g+'_'+s; t42RenderRank(); }
function t42RankReload(){ delete t42BoardState[t42Board]; t42RenderRank(); }

async function t42LoadBoard(id){
  if(T42_DEMO){ t42BoardRows[id]=t42DemoBoard(id); t42BoardState[id]='ready';
                if(t42View==='rank' && t42Board===id) setTimeout(t42RenderRank,0); return; }
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

/* A closed door, drawn as an achievement rather than an error: what closed,
   what stays, and where to go next. Reached from any screen that belongs to
   the running challenge once it is over. */
function t42Finished(what){
  var el=$('t42-body'); if(!el) return;
  var c=T42.challenge, done=T42.isComplete();
  var h='<div class="t42-stage t42-locked">'+
    '<div class="t42-lock-i">'+glyph(done?'trophy':'lock')+'</div>'+
    '<div class="t42-stage-ed">'+t42Esc(t42EdName(c))+'</div>'+
    '<div class="t42-stage-h">'+(done?'Challenge completed':'T42 has finished')+'</div>'+
    '<div class="t42-stage-k">'+t42Esc(what)+' closed with the last day. Your achievement stays in your T42 Journey.</div>'+
    '</div>';
  h+='<div class="t42-list">'+
     t42Row('trophy', done?'View my result':'See where you finished', done?'Score, rank and changes':'Final assessment and results',
            'todo', done?'t42GoResult()':'t42GoFinal()')+
     (T42.certs && T42.certs.length ? t42Row('medal','View certificate','T42 Finisher','todo','t42GoCert()') : '')+
     t42Row('clock','My T42 Journey','Every edition you have taken part in','todo','t42GoJourney()')+
     '</div>';
  h+=t42NextBlock();
  el.innerHTML=h;
}

/* "Ready for another 42 days?" — the next edition if one is taking people,
   and HITFAT+ for training without a challenge. Neither is unlocked by the
   edition just finished; both are invitations. */
function t42NextBlock(){
  var o=T42.open, cur=T42.challenge;
  var h='<div class="sechead">Ready for another 42 days?</div>';
  if(o && (!cur || o.id!==cur.id)){
    h+='<div class="t42-stage t42-next" onclick="t42JoinOpen()">'+
       '<div class="t42-stage-top"><span class="t42-logo t42-logo-s">T42</span>'+
       '<span class="t42-stage-tag">REGISTRATION OPEN</span></div>'+
       '<div class="t42-stage-h">'+t42Esc(t42EdName(o))+'</div>'+
       '<div class="t42-stage-dates">'+glyph('calendar')+'<span>'+t42Esc(t42Range(o))+'</span></div>'+
       '<button class="t42-stage-cta">Join the next challenge</button></div>';
  } else {
    h+='<div class="acard"><div class="ah">'+ic('repeat')+'<div class="t">The next T42</div></div>'+
       '<div class="sub">Every T42 is a new challenge and a new sign-up. When the next edition opens, '+
       'it appears here and on your Home screen.</div>'+
       '<button class="bigbtn sec" onclick="t42Reload()">Check for a new edition</button></div>';
  }
  h+='<div class="acard"><div class="ah">'+ic('workout')+'<div class="t">Continue with HITFAT+</div></div>'+
     '<div class="sub">Programs and filmed workouts on your own schedule, outside the challenge. '+
     'Sold separately — T42 does not include them.</div>'+
     '<button class="bigbtn sec" onclick="t42NextStore()">Explore HITFAT+</button></div>';
  return h;
}
/* Go to the open edition from wherever we are — a past result included. */
function t42JoinOpen(){
  T42.load(true).then(function(){ t42View='landing'; t42Resume(); t42Paint(); t42Segs(); $('screen').scrollTop=0; });
}

/* A past edition, opened from My T42 Journey: its result, its certificate,
   and nothing that would let the old plan back in. */
async function t42OpenReg(id){
  if(T42_DEMO){ t42DemoGo('results'); return; }
  var row=(T42.journey||[]).filter(function(x){ return x.id===id; })[0]; if(!row) return;
  var ch=row.t42_challenges, reg={};
  Object.keys(row).forEach(function(k){ if(k.indexOf('t42_')!==0) reg[k]=row[k]; });
  T42.challenge=ch; T42.reg=reg; T42.viewingPast=true;
  T42.state='loading'; t42Go('result');
  try{ await T42.loadReg(); }catch(e){}
  T42.state='ready';
  t42Resume(); t42Paint(); t42Segs();
}
function t42OpenPast(){ t42GoJourney(); }


/* ═══════════════════════════════════════════════════════════════
   My T42 Journey

   The trophy cabinet. Every edition this account has joined, newest
   first, with what it left behind — the change, the score, the
   certificate — and the state of its access, said plainly. Opening one
   shows its result; it never reopens its plan.
   ═══════════════════════════════════════════════════════════════ */

function t42RenderJourney(){
  var el=$('t42-body'); if(!el) return;
  var rows=T42.journey;
  var h=(T42_SEGS[T42.stage()] ? '' : t42Back('T42'))+
        '<div class="hgroup"><div class="k">T42</div><h2>My T42 Journey</h2>'+
        '<p>Every challenge you have taken on, and what you did with it.</p></div>';

  if(rows===null || rows===undefined){
    el.innerHTML=h+'<div class="t42-skel"><div></div><div></div></div>'; return;
  }

  var o=T42.open;
  var inOpen = o && rows.some(function(r){ return r.challenge_id===o.id; });
  if(o && !inOpen && t42RegOpenFor(o)){
    h+='<div class="t42-jcard t42-jopen" onclick="t42JoinOpen()">'+
       '<div class="t42-jtop"><div class="t42-jname">'+t42Esc(o.name||t42EdName(o))+'</div>'+
       '<span class="t42-chip open">Registration open</span></div>'+
       '<div class="t42-jsub">New challenge · '+t42Esc(t42Range(o))+'</div>'+
       '<button class="bigbtn">Join now</button></div>';
  }

  if(!rows.length){
    h+='<div class="acard"><div class="ah">'+ic('trophy')+'<div class="t">Nothing here yet</div></div>'+
       '<div class="sub">Finish a T42 and it lives here — your result, your score and your certificate.</div></div>';
  }
  rows.forEach(function(r){ h+=t42JourneyCard(r); });

  h+=t42NextBlock();
  el.innerHTML=h;
}

function t42RegOpenFor(c){
  if(!c || (c.status!=='registration' && c.status!=='running')) return false;
  var cl=t42Date(c.reg_closes_on), t=new Date(); t.setHours(0,0,0,0);
  return !(cl && t>cl);
}

function t42One(x){ return Array.isArray(x) ? (x[0]||null) : (x||null); }

function t42JourneyCard(r){
  var c=r.t42_challenges||{}, sc=t42One(r.t42_scores), certs=r.t42_certificates||[];
  var ms=r.t42_measurements||[];
  var pick=function(p){ return ms.filter(function(m){ return m.phase===p; })[0]||null; };
  var b=pick('baseline'), l=pick('final')||pick('mid');
  var paid=['paid','active','completed'].indexOf(r.status)>=0;
  var total=c.total_days||42;
  var start=t42Date(c.starts_on), t=new Date(); t.setHours(0,0,0,0);
  var day=start && t>=start ? Math.min(total, Math.floor((t-start)/86400000)+1) : 0;
  var last=t42Date(c.access_ends_on) || (start ? new Date(start.getTime()+(total-1)*86400000) : null);
  var ended=last && t>last;

  var chip, cls;
  if(r.status==='withdrawn'||r.status==='disqualified'){ chip=r.status==='withdrawn'?'Withdrawn':'Disqualified'; cls='out'; }
  else if(!paid){ chip='Payment pending'; cls='wait'; }
  else if(c.status==='complete'||c.status==='archived'){ chip='Completed'; cls='done'; }
  else if(day>total || c.status==='assessment'){ chip='Results pending'; cls='wait'; }
  else if(day>0){ chip='Active · Day '+day; cls='live'; }
  else { chip='Upcoming'; cls='wait'; }

  var h='<div class="t42-jcard"><div class="t42-jtop"><div class="t42-jname">'+t42Esc(c.name||t42EdName(c))+'</div>'+
        '<span class="t42-chip '+cls+'">'+t42Esc(chip)+'</span></div>'+
        '<div class="t42-jsub">'+t42Esc(t42Range(c))+' · '+t42Esc(((t42Track(r.track)||{}).name)||'')+'</div>';

  if(cls==='done'){
    var dw = b&&l&&b.weight_kg!=null&&l.weight_kg!=null ? Math.round((l.weight_kg-b.weight_kg)*10)/10 : null;
    var dc = b&&l&&b.waist_cm!=null&&l.waist_cm!=null ? Math.round((l.waist_cm-b.waist_cm)*10)/10 : null;
    var rk = sc && (sc.category==='consistency'||r.track==='start') ? sc.rank_consistency : sc&&sc.rank_category;
    h+='<div class="t42-jgrid">'+
       t42JStat('Days', total+' / '+total)+
       t42JStat('Weight', t42Signed(dw,' kg'))+
       t42JStat('Waist', t42Signed(dc,' cm'))+
       t42JStat('Compliance', sc&&sc.consistency_pct!=null ? Math.round(Number(sc.consistency_pct))+'%' : '—')+
       t42JStat('Score', sc&&sc.eligible ? t42Fmt(r.track==='start'?sc.consistency_total:sc.total) : '—')+
       t42JStat('Rank', sc&&sc.eligible&&rk ? String.fromCharCode(35)+rk : '—')+
       '</div>';
    if(certs.length) h+='<div class="t42-badges">'+certs.map(function(x){
      return '<span class="t42-badge">'+glyph('medal')+t42Esc(T42_CERT_TITLE[x.kind]||x.kind)+'</span>'; }).join('')+'</div>';
  }

  h+='<div class="t42-jaccess">'+glyph(ended?'lock':'clock')+'<span>Program access: '+
     (ended ? 'Ended' : last ? 'Open until '+t42Day(last,true) : 'Open')+'</span></div>';

  var btns='';
  if(cls==='done'){
    btns+='<button class="bigbtn sec" onclick="t42OpenReg(\''+r.id+'\')">View result</button>';
    if(certs.length) btns+='<button class="bigbtn sec" onclick="t42OpenCert(\''+r.id+'\')">Certificate</button>';
  } else if(cls!=='out'){
    btns+='<button class="bigbtn sec" onclick="t42JoinOpen()">Open</button>';
  }
  if(btns) h+='<div class="t42-jbtns">'+btns+'</div>';
  return h+'</div>';
}
function t42JStat(l,v){
  return '<div><div class="t42-jstat-v">'+t42Esc(v)+'</div><div class="t42-jstat-l">'+t42Esc(l)+'</div></div>';
}
function t42OpenCert(id){
  t42OpenReg(id).then(function(){ t42Go('cert'); });
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

  var h=(T42.viewingPast ? t42Back('My T42 Journey','t42BackToJourney') : '')+
        '<div class="t42-stage t42-finish">'+
        '<div class="t42-trophy">'+glyph('trophy')+'</div>'+
        '<div class="t42-stage-h">You did it.</div>'+
        '<div class="t42-logo t42-logo-m">T42 COMPLETE</div>'+
        '<div class="t42-sub">'+total+' / '+total+' DAYS · '+
        t42Esc((T42.challenge.edition||T42.challenge.name||'').toUpperCase())+'</div>'+
        '<div class="t42-badge t42-badge-lg">'+glyph('medal')+'T42 Finisher</div></div>';

  var dw=t42Delta('weight_kg'), dc=t42Delta('waist_cm');
  var b=T42.baseline||{}, l=t42Latest()||{};
  h+='<div class="sechead">Your body</div><div class="t42-list">'+
     t42ResRow('scale','Weight', (b.weight_kg!=null?b.weight_kg+' kg':'—')+' → '+(l!==b&&l.weight_kg!=null?l.weight_kg+' kg':'—'),
               t42Signed(dw,' kg'))+
     t42ResRow('measure','Waist', (b.waist_cm!=null?b.waist_cm+' cm':'—')+' → '+(l!==b&&l.waist_cm!=null?l.waist_cm+' cm':'—'),
               t42Signed(dc,' cm'))+
     '</div>';
  h+='<div class="sechead">Your 42 days</div><div class="t42-grid">'+
     t42Stat('Workouts',    T42.workoutPct()+'%')+
     t42Stat('Check-ins',   T42.checkins.length+' / '+total)+
     t42Stat('Longest streak', t42BestStreak()+(t42BestStreak()===1?' day':' days'))+
     t42Stat('Compliance',  T42.consistency()+'%')+
     t42Stat('Steps',       t42Num(steps))+
     t42Stat('Fitness',     fit!=null ? t42Signed(fit,'%') : '—')+
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
  if(T42.accessEnded())
    h+='<div class="t42-jaccess" style="justify-content:center;">'+glyph('lock')+
       '<span>Program access ended '+t42Day(T42.lastDay(),true)+' · your result stays here</span></div>';
  el.innerHTML=h;
}
function t42BackToJourney(){
  T42.load(true).then(function(){ t42GoJourney(); });
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
  var h=t42Back('Result','t42GoResult')+
        '<div class="hgroup"><div class="k">After T42</div><h2>What\'s next?</h2>'+
        '<p>You have a routine now. Here is where to keep it.</p></div>';

  h+=t42NextBlock();

  h+='<div class="sechead">Keep going</div>';
  h+=t42NextCard('⚡','HITFAT RUSH',
      'Keep racing. Your times carry on at rush.hitfat.io.', 't42Rush()','Open RUSH');
  h+=t42NextCard('🏛️','Train with us at HITFAT HQ',
      'Coach-led classes in Kota Bharu, with InBody and a community.', 't42NextGym()','Ask about the gym');
  h+=t42NextCard('🏃','HYROX training',
      'Structured HYROX preparation with the HITFAT coaches.', 't42NextHyrox()','Ask about HYROX');

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
