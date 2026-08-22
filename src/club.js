/* ═══════════════════════════════════════════════════════════════
   HITFAT CLUB · the physical gym layer

   HITFAT+ is a national app. Most people using it will never stand in
   the Kelantan gym, so nothing here appears unless the server says the
   signed-in user has Club standing. A general user sees one quiet
   invitation on Home and nothing else.

   Everything below reads from Supabase. There is no localStorage copy
   of a booking, an attendance or a points balance — the old prototype
   kept those on the device, which meant two phones disagreed and the
   front desk could not see either. localStorage here holds only which
   day of the schedule you were last looking at.
   ═══════════════════════════════════════════════════════════════ */
var Club = {
  state:'idle',          // idle | loading | ready | nosetup | error
  member:null,           // the club_members row, or null for a general user
  points:0,
  sessions:[],           // upcoming club_sessions
  bookings:{},           // session_id -> booking row
  counts:{},             // session_id -> how many are booked
  err:null,

  isMember(){ return !!(this.member && this.member.status==='active'); },
  isStaff(){ return !!(this.member && ['coach','staff','admin'].indexOf(this.member.role)>=0); },

  async load(force){
    if(this.state==='loading') return;
    if(this.state==='ready' && !force) return;
    if(!sb || !SUPA_READY){ this.state='nosetup'; return; }
    let uid=null;
    try{ const r=await sb.auth.getSession(); uid=r&&r.data&&r.data.session&&r.data.session.user.id; }catch(e){}
    if(!uid){ this.state='nosetup'; return; }
    this.state='loading'; this.err=null;
    try{
      const m=await sb.from('club_members').select('*').eq('user_id',uid).maybeSingle();
      /* 42P01 is "relation does not exist" — the schema has not been run
         yet. That is a setup state, not a failure, and the app must not
         show an error to a general user because of it. */
      if(m.error && (m.error.code==='42P01' || /does not exist/i.test(m.error.message||''))){
        this.state='nosetup'; return;
      }
      if(m.error) throw m.error;
      this.member=m.data||null;
      if(!this.isMember() && !this.isStaff()){ this.state='ready'; return; }

      const now=new Date().toISOString();
      const [ses,bk,pts]=await Promise.all([
        sb.from('club_sessions').select('id,title,kind,coach_name,starts_at,ends_at,capacity,status,description,level,location,bring')
          .gte('starts_at',now).eq('status','scheduled').order('starts_at').limit(60),
        sb.from('club_bookings').select('id,session_id,status').eq('user_id',uid),
        sb.from('club_points').select('amount').eq('user_id',uid)
      ]);
      if(ses.error) throw ses.error;
      this.sessions=ses.data||[];
      this.bookings={};
      (bk.data||[]).forEach(b=>{ if(b.status!=='cancelled') this.bookings[b.session_id]=b; });
      this.points=(pts.data||[]).reduce((a,r)=>a+(r.amount||0),0);
      await this.loadCounts();
      this.state='ready';
    }catch(e){
      this.err=(e&&e.message)||'Could not reach the Club right now.';
      this.state='error';
    }
  },

  /* How many seats are taken. Counted on the server per session rather
     than trusted from the client, because capacity is the one number a
     member would benefit from being wrong. */
  async loadCounts(){
    this.counts={};
    const ids=this.sessions.map(s=>s.id);
    if(!ids.length) return;
    try{
      const r=await sb.from('club_bookings').select('session_id,status').in('session_id',ids);
      (r.data||[]).forEach(b=>{
        if(b.status==='cancelled'||b.status==='no_show') return;
        this.counts[b.session_id]=(this.counts[b.session_id]||0)+1;
      });
    }catch(e){}
  },

  seatsLeft(s){ return Math.max(0, (s.capacity||0) - (this.counts[s.id]||0)); },
  myBooking(s){ return this.bookings[s.id]||null; },

  async book(id){
    const s=this.sessions.filter(x=>x.id===id)[0]; if(!s) return;
    let uid=null;
    try{ const r=await sb.auth.getSession(); uid=r&&r.data&&r.data.session&&r.data.session.user.id; }catch(e){}
    if(!uid){ toast('Sign in to book'); return; }
    const full=this.seatsLeft(s)<=0;
    try{
      const r=await sb.from('club_bookings')
        .upsert({user_id:uid, session_id:id, status:full?'waitlisted':'booked', booked_at:new Date().toISOString()},
                {onConflict:'user_id,session_id'}).select().maybeSingle();
      if(r.error) throw r.error;
      this.bookings[id]=r.data;
      await this.loadCounts();
      toast(full?'Added to the waitlist':'Booked');
      renderClub();
    }catch(e){ toast((e&&e.message)||'Could not book that class'); }
  },

  async cancel(id){
    const b=this.bookings[id]; if(!b) return;
    try{
      const r=await sb.from('club_bookings').update({status:'cancelled'}).eq('id',b.id);
      if(r.error) throw r.error;
      delete this.bookings[id];
      await this.loadCounts();
      toast('Booking cancelled');
      renderClub();
    }catch(e){ toast((e&&e.message)||'Could not cancel'); }
  }
};

function clubDayKey(iso){ return String(iso).slice(0,10); }
function clubTime(iso){
  try{ return new Date(iso).toLocaleTimeString('en-MY',{hour:'numeric',minute:'2-digit',hour12:true}); }
  catch(e){ return ''; }
}
function clubDayLabel(k){
  const d=new Date(k+'T00:00:00');
  const days=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const t=iso(0), tm=iso(1);
  if(k===t) return 'Today';
  if(k===tm) return 'Tomorrow';
  return days[d.getDay()]+' '+d.getDate();
}

function openClub(){
  hidePanels(); $('club').style.display='block'; $('screen').scrollTop=0;
  renderClub();
  Club.load().then(renderClub);
}

function renderClub(){
  const el=$('club-body'); if(!el) return;

  if(Club.state==='loading'||Club.state==='idle'){
    el.innerHTML='<div class="sechead">HITFAT Club</div>'+
      '<div class="acard"><div class="sub">Loading your Club…</div></div>';
    return;
  }
  if(Club.state==='nosetup'){
    el.innerHTML='<div class="sechead">HITFAT Club</div>'+
      '<div class="acard"><div class="ah"><span>🏛️</span><div class="t">Not set up yet</div></div>'+
      '<div class="sub" style="margin-top:3px;">The Club is not switched on for this account.</div></div>';
    return;
  }
  if(Club.state==='error'){
    el.innerHTML='<div class="sechead">HITFAT Club</div>'+
      '<div class="acard"><div class="ah"><span>⚠️</span><div class="t">Could not load the Club</div></div>'+
      '<div class="sub" style="margin-top:3px;">'+Club.err+'</div>'+
      '<button class="bigbtn sec" onclick="Club.load(true).then(renderClub)">Try again</button></div>';
    return;
  }
  if(!Club.isMember() && !Club.isStaff()){ el.innerHTML=clubPromoHTML(true); return; }

  const m=Club.member;
  let h='';

  /* ── next class ── the single most important thing on this screen */
  const mine=Club.sessions.filter(s=>Club.myBooking(s));
  const next=mine[0]||null;
  h+='<div class="sechead">Next class</div>';
  if(next){
    const b=Club.myBooking(next);
    h+='<div class="acard"><div class="ah"><span>🔥</span><div class="t">'+next.title+'</div>'+
       (b.status==='waitlisted'?'<div class="c" style="color:var(--hitfat);font-weight:700;font-size:12px;">WAITLIST</div>':'')+
       '</div>'+
       '<div class="big" style="margin-top:2px;">'+clubDayLabel(clubDayKey(next.starts_at))+' · '+clubTime(next.starts_at)+'</div>'+
       '<div class="sub">'+(next.coach_name||'HITFAT')+'</div>'+
       '<button class="bigbtn sec" onclick="Club.cancel(\''+next.id+'\')">Cancel booking</button></div>';
  }else{
    h+='<div class="acard"><div class="sub">Nothing booked yet.</div>'+
       '<button class="bigbtn" onclick="clubSeg(\'classes\')">Book a class</button></div>';
  }

  /* ── membership ── */
  h+='<div class="sechead">Membership</div>'+
     '<div class="acard"><div class="ah"><div class="t">'+(m.plan||'HITFAT Club')+'</div>'+
     '<div class="c" style="font-size:12px;font-weight:800;color:'+(m.status==='active'?'var(--ok)':'var(--hitfat)')+';">'+
     String(m.status||'').toUpperCase()+'</div></div>'+
     (m.expires_on?'<div class="sub">Expires '+clubDate(m.expires_on)+'</div>':'')+
     (m.member_no?'<div class="sub">Member '+m.member_no+'</div>':'')+
     (typeof m.credits_left==='number'?'<div class="sub">'+m.credits_left+' class credits left</div>':'')+
     '</div>';

  /* ── points ── the balance is the sum of the ledger, never a stored number */
  h+='<div class="sechead">HF Points</div>'+
     '<div class="acard"><div class="big">'+Club.points.toLocaleString()+'</div>'+
     '<div class="sub">Earned from classes, streaks and challenges</div></div>';

  el.innerHTML=h;
}

function clubDate(d){
  try{ return new Date(d+'T00:00:00').toLocaleDateString('en-MY',{day:'numeric',month:'long',year:'numeric'}); }
  catch(e){ return d; }
}

/* ── the schedule ── */
function renderClubClasses(){
  const el=$('club-body'); if(!el) return;
  if(!Club.sessions.length){
    el.innerHTML='<div class="sechead">Classes</div>'+
      '<div class="acard"><div class="sub">No classes are scheduled yet.</div></div>';
    return;
  }
  const byDay={};
  Club.sessions.forEach(s=>{ const k=clubDayKey(s.starts_at); (byDay[k]=byDay[k]||[]).push(s); });
  let h='';
  Object.keys(byDay).sort().forEach(k=>{
    h+='<div class="sechead">'+clubDayLabel(k)+'</div>';
    byDay[k].forEach(s=>{
      const left=Club.seatsLeft(s), b=Club.myBooking(s), taken=Club.counts[s.id]||0;
      let note, btn;
      if(b && b.status==='waitlisted'){ note='On the waitlist';
        btn='<button class="bigbtn sec" onclick="Club.cancel(\''+s.id+'\')">Leave waitlist</button>'; }
      else if(b){ note='Booked';
        btn='<button class="bigbtn sec" onclick="Club.cancel(\''+s.id+'\')">Cancel</button>'; }
      else if(left<=0){ note='Full';
        btn='<button class="bigbtn sec" onclick="Club.book(\''+s.id+'\')">Join waitlist</button>'; }
      else if(left<=3){ note='🔥 '+left+' spot'+(left===1?'':'s')+' left';
        btn='<button class="bigbtn" onclick="Club.book(\''+s.id+'\')">Book class</button>'; }
      else { note=taken+' / '+s.capacity+' booked';
        btn='<button class="bigbtn" onclick="Club.book(\''+s.id+'\')">Book class</button>'; }
      h+='<div class="acard"><div onclick="openClubSession(\''+s.id+'\')" style="cursor:pointer;">'+
         '<div class="ah"><div class="t">'+s.title+'</div>'+
         (s.kind?'<div class="c" style="font-size:11px;font-weight:800;color:var(--hitfat);">'+s.kind+'</div>':'')+
         '<div class="c">›</div></div>'+
         '<div class="big" style="margin-top:2px;">'+clubTime(s.starts_at)+' – '+clubTime(s.ends_at)+'</div>'+
         '<div class="sub">'+(s.coach_name||'HITFAT')+' · '+note+'</div></div>'+btn+'</div>';
    });
  });
  el.innerHTML=h;
}

var clubSegNow='overview';
function clubSeg(s){
  clubSegNow=s;
  const bar=$('club-segs');
  if(bar) Array.prototype.forEach.call(bar.children,function(b){
    b.classList.toggle('on', b.getAttribute('data-seg')===s);
  });
  if(s==='classes') renderClubClasses(); else renderClub();
  $('screen').scrollTop=0;
}

/* ── the quiet invitation a general user sees ──
   HITFAT+ has to keep working for someone in Johor who will never visit
   Kelantan. One card, below their own content, never a nav item. */
function clubPromoHTML(full){
  return '<div class="sechead">Train with us</div>'+
    '<div class="acard"><div class="ah"><span>🏛️</span><div class="t">HITFAT HQ · Kelantan</div></div>'+
    '<div class="sub" style="margin-top:3px;line-height:1.5;">Coach-led classes, structured training and a real '+
    'community. If you are near Kota Bharu, come and train with us in person.</div>'+
    '<button class="bigbtn sec" onclick="clubEnquire()">Explore HITFAT Club</button></div>';
}
function clubEnquire(){
  window.open('https://wa.me/60176132170?text='+encodeURIComponent(
    'Hi HITFAT, I use HITFAT+ and I would like to know about training at the gym.'),'_blank');
}
function clubHomeCard(){
  if(!Club.isMember() && !Club.isStaff()) return '';
  const mine=Club.sessions.filter(s=>Club.myBooking(s));
  const n=mine[0];
  return '<div class="sechead">HITFAT Club</div>'+
    '<div class="acard" onclick="openClub()" style="cursor:pointer;">'+
    '<div class="ah"><span>🏛️</span><div class="t">'+(n?n.title:'Nothing booked')+'</div><div class="c">›</div></div>'+
    '<div class="sub">'+(n?(clubDayLabel(clubDayKey(n.starts_at))+' · '+clubTime(n.starts_at))
                          :'Tap to book a class')+'</div></div>';
}


/* ── one class, in full ──────────────────────────────────────────
   The list answers "when"; this answers "should I". Level, what to
   bring and what the session actually is are the things a member
   weighs before committing a Tuesday evening. */
var clubOpenId=null;

function clubMins(s){
  try{ return Math.max(0, Math.round((new Date(s.ends_at)-new Date(s.starts_at))/60000)); }
  catch(e){ return 0; }
}

function openClubSession(id){
  clubOpenId=id;
  renderClubSession();
  $('screen').scrollTop=0;
}
function clubBackToList(){ clubOpenId=null; clubSeg('classes'); }

function renderClubSession(){
  const el=$('club-body'); if(!el) return;
  const s=Club.sessions.filter(x=>x.id===clubOpenId)[0];
  if(!s){ clubBackToList(); return; }

  const left=Club.seatsLeft(s), taken=Club.counts[s.id]||0, b=Club.myBooking(s);
  const mins=clubMins(s);
  const pct=s.capacity?Math.min(100,Math.round(taken/s.capacity*100)):0;

  let btn;
  if(b && b.status==='waitlisted')
    btn='<button class="bigbtn sec" onclick="Club.cancel(\''+s.id+'\')">Leave waitlist</button>';
  else if(b)
    btn='<button class="bigbtn sec" onclick="Club.cancel(\''+s.id+'\')">Cancel booking</button>';
  else if(left<=0)
    btn='<button class="bigbtn" onclick="Club.book(\''+s.id+'\')">Join waitlist</button>';
  else
    btn='<button class="bigbtn" onclick="Club.book(\''+s.id+'\')">Book class</button>';

  let h='<button class="back" onclick="clubBackToList()">← Classes</button>';

  h+='<div class="sechead">'+s.title+'</div>';
  h+='<div class="acard">'+
     (s.kind?'<div class="ah"><div class="c" style="font-size:11px;font-weight:800;color:var(--hitfat);">'+s.kind+'</div></div>':'')+
     '<div class="big">'+clubDayLabel(clubDayKey(s.starts_at))+' · '+clubTime(s.starts_at)+'</div>'+
     '<div class="sub">'+clubTime(s.starts_at)+' – '+clubTime(s.ends_at)+(mins?' · '+mins+' min':'')+'</div>'+
     '<div class="sub">'+(s.coach_name||'HITFAT')+'</div>'+
     '</div>';

  /* Capacity as a bar, because "18 / 25" is a fact and a filling bar is
     a reason to book now. */
  h+='<div class="acard"><div class="ah"><div class="t">Spaces</div>'+
     '<div class="c" style="font-size:13px;font-weight:800;color:'+(left<=3?'var(--hitfat)':'var(--dim)')+';">'+
     (left<=0?'FULL':left+' left')+'</div></div>'+
     '<div class="pgbar"><i style="width:'+pct+'%"></i></div>'+
     '<div class="sub">'+taken+' of '+s.capacity+' booked</div></div>';

  const facts=[];
  if(s.level) facts.push(['Level', s.level]);
  if(s.location) facts.push(['Where', s.location]);
  if(facts.length){
    h+='<div class="acard">'+facts.map(f=>
      '<div class="pgins"><i class="ok"></i><div><b>'+f[0]+'</b><small>'+f[1]+'</small></div></div>').join('')+'</div>';
  }

  if(s.description)
    h+='<div class="sechead">About this class</div>'+
       '<div class="acard"><div class="sub" style="line-height:1.6;">'+s.description+'</div></div>';

  const bring=Array.isArray(s.bring)?s.bring.filter(Boolean):[];
  if(bring.length)
    h+='<div class="sechead">Bring</div>'+
       '<div class="acard"><div class="pgseg" style="flex-wrap:wrap;">'+
       bring.map(x=>'<span class="chip">'+x+'</span>').join('')+'</div></div>';

  h+=btn;
  el.innerHTML=h;
}
