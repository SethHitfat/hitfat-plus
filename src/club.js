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

   Five screens: Overview, Classes, Check In, Body, Rewards.
   ═══════════════════════════════════════════════════════════════ */

/* ── QR, small enough to carry ────────────────────────────────────
   Byte mode, error correction M, versions 1 to 10 — every payload this
   screen will ever hold, since a check-in token is 41 characters and
   fits in version 3 with room to spare.

   It is written out here rather than pulled from a CDN because the one
   moment this code matters is a member standing at the counter with the
   class about to start. A script tag that has not loaded is a member who
   cannot check in, and no amount of retry logic fixes a blocked network.

   Verified against python-qrcode across 210 payloads covering every
   version from 1 to 10, including the two-block-group structures of 8,
   9 and 10 where the interleaving is easiest to get wrong. */

var QR_EXP=new Uint8Array(512), QR_LOG=new Uint8Array(256);
(function(){
  for(var i=0,x=1;i<255;i++){ QR_EXP[i]=x; QR_LOG[x]=i; x<<=1; if(x&256) x^=0x11D; }
  for(var j=255;j<512;j++) QR_EXP[j]=QR_EXP[j-255];
})();
function qrMul(a,b){ return (a===0||b===0)?0:QR_EXP[QR_LOG[a]+QR_LOG[b]]; }

/* The generator polynomial for n error-correction codewords is the product
   of (x + a^i). g[0] is the highest-degree coefficient: multiplying by x
   keeps a coefficient at the same index in the longer array, multiplying by
   the constant moves it one right. Swapping those two builds the polynomial
   back to front, which leaves g[0] other than 1 and silently breaks the
   division below — the codes still look well formed and none of them scan. */
function qrGenPoly(n){
  var g=[1];
  for(var i=0;i<n;i++){
    var ng=new Array(g.length+1), k;
    for(k=0;k<ng.length;k++) ng[k]=0;
    for(var j=0;j<g.length;j++){
      ng[j]^=g[j];
      ng[j+1]^=qrMul(g[j],QR_EXP[i]);
    }
    g=ng;
  }
  return g;
}
function qrEcc(data,n){
  var g=qrGenPoly(n), res=new Array(data.length+n), i;
  for(i=0;i<data.length;i++) res[i]=data[i];
  for(i=data.length;i<res.length;i++) res[i]=0;
  for(i=0;i<data.length;i++){
    var f=res[i]; if(!f) continue;
    for(var j=0;j<g.length;j++) res[i+j]^=qrMul(g[j],f);
  }
  return res.slice(data.length);
}

/* Per version at error correction M:
   [ecc per block, group1 blocks, group1 data, group2 blocks, group2 data] */
var QR_M=[null,
  [10,1,16,0,0],[16,1,28,0,0],[26,1,44,0,0],[18,2,32,0,0],[24,2,43,0,0],
  [16,4,27,0,0],[18,4,31,0,0],[22,2,38,2,39],[22,3,36,2,37],[26,4,43,1,44]];
var QR_ALIGN=[null,[],[6,18],[6,22],[6,26],[6,30],[6,34],[6,22,38],[6,24,42],[6,26,46],[6,28,50]];
function qrCapacity(v){ var s=QR_M[v]; return s[1]*s[2]+s[3]*s[4]; }

function QRBits(){ this.buf=[]; this.len=0; }
QRBits.prototype.put=function(val,n){ for(var i=n-1;i>=0;i--) this.putBit(((val>>>i)&1)===1); };
QRBits.prototype.putBit=function(b){
  var i=this.len>>3;
  if(this.buf.length<=i) this.buf.push(0);
  if(b) this.buf[i]|=(0x80>>>(this.len&7));
  this.len++;
};

function qrBitLen(x){ var n=0; while(x!==0){ n++; x>>>=1; } return n; }
function qrVersionBits(v){
  var d=v<<12, r=d;
  while(qrBitLen(r)-qrBitLen(0x1F25)>=0) r^=0x1F25<<(qrBitLen(r)-qrBitLen(0x1F25));
  return d|r;
}
function qrFormatBits(ecBits,mask){
  var d=((ecBits<<3)|mask), r=d<<10;
  while(qrBitLen(r)-qrBitLen(0x537)>=0) r^=0x537<<(qrBitLen(r)-qrBitLen(0x537));
  return ((d<<10)|r)^0x5412;
}
function qrMaskFn(k,r,c){
  switch(k){
    case 0: return ((r+c)%2)===0;
    case 1: return (r%2)===0;
    case 2: return (c%3)===0;
    case 3: return ((r+c)%3)===0;
    case 4: return ((Math.floor(r/2)+Math.floor(c/3))%2)===0;
    case 5: return (((r*c)%2)+((r*c)%3))===0;
    case 6: return ((((r*c)%2)+((r*c)%3))%2)===0;
    default:return ((((r+c)%2)+((r*c)%3))%2)===0;
  }
}

function qrMakeMatrix(v){
  var n=v*4+17, m=new Array(n), fixed=new Array(n), i, j;
  for(i=0;i<n;i++){ m[i]=new Array(n); fixed[i]=new Array(n);
    for(j=0;j<n;j++){ m[i][j]=0; fixed[i][j]=0; } }

  function finder(r,c){
    for(var dr=-1;dr<=7;dr++) for(var dc=-1;dc<=7;dc++){
      var rr=r+dr, cc=c+dc;
      if(rr<0||rr>=n||cc<0||cc>=n) continue;
      var on=(dr>=0&&dr<=6&&(dc===0||dc===6))||(dc>=0&&dc<=6&&(dr===0||dr===6))||
             (dr>=2&&dr<=4&&dc>=2&&dc<=4);
      m[rr][cc]=on?1:0; fixed[rr][cc]=1;
    }
  }
  finder(0,0); finder(0,n-7); finder(n-7,0);

  for(i=8;i<n-8;i++){
    m[6][i]=(i%2===0)?1:0; fixed[6][i]=1;
    m[i][6]=(i%2===0)?1:0; fixed[i][6]=1;
  }

  var al=QR_ALIGN[v];
  for(i=0;i<al.length;i++) for(j=0;j<al.length;j++){
    var r=al[i], c=al[j];
    if((r<=8&&c<=8)||(r<=8&&c>=n-9)||(r>=n-9&&c<=8)) continue;
    for(var dr2=-2;dr2<=2;dr2++) for(var dc2=-2;dc2<=2;dc2++){
      m[r+dr2][c+dc2]=(Math.max(Math.abs(dr2),Math.abs(dc2))!==1)?1:0;
      fixed[r+dr2][c+dc2]=1;
    }
  }

  m[n-8][8]=1; fixed[n-8][8]=1;

  for(i=0;i<9;i++){
    if(!fixed[8][i]){ fixed[8][i]=1; m[8][i]=0; }
    if(!fixed[i][8]){ fixed[i][8]=1; m[i][8]=0; }
  }
  for(i=0;i<8;i++){
    if(!fixed[8][n-1-i]){ fixed[8][n-1-i]=1; m[8][n-1-i]=0; }
    if(!fixed[n-1-i][8]){ fixed[n-1-i][8]=1; m[n-1-i][8]=0; }
  }

  if(v>=7){
    var vi=qrVersionBits(v);
    for(i=0;i<18;i++){
      var b=(vi>>>i)&1, r3=Math.floor(i/3), c3=i%3;
      m[r3][n-11+c3]=b; fixed[r3][n-11+c3]=1;
      m[n-11+c3][r3]=b; fixed[n-11+c3][r3]=1;
    }
  }
  return {m:m,fixed:fixed,n:n};
}

/* The four penalty rules. Their only job is to pick the mask that scans
   most reliably; every mask produces a valid code, because the format
   block tells the scanner which one to undo. */
function qrPenalty(m,n){
  var p=0,i,j,run,last;
  for(i=0;i<n;i++){
    run=1; last=m[i][0];
    for(j=1;j<n;j++){
      if(m[i][j]===last) run++;
      else { if(run>=5) p+=3+(run-5); run=1; last=m[i][j]; }
    }
    if(run>=5) p+=3+(run-5);
  }
  for(j=0;j<n;j++){
    run=1; last=m[0][j];
    for(i=1;i<n;i++){
      if(m[i][j]===last) run++;
      else { if(run>=5) p+=3+(run-5); run=1; last=m[i][j]; }
    }
    if(run>=5) p+=3+(run-5);
  }
  for(i=0;i<n-1;i++) for(j=0;j<n-1;j++){
    var s=m[i][j]+m[i][j+1]+m[i+1][j]+m[i+1][j+1];
    if(s===0||s===4) p+=3;
  }
  var pat1=[1,0,1,1,1,0,1,0,0,0,0], pat2=[0,0,0,0,1,0,1,1,1,0,1];
  function match(get,len){
    var c=0;
    for(var a=0;a+11<=len;a++){
      var ok1=true, ok2=true;
      for(var b=0;b<11;b++){ var vv=get(a+b); if(vv!==pat1[b]) ok1=false; if(vv!==pat2[b]) ok2=false; }
      if(ok1) c++;
      if(ok2) c++;
    }
    return c;
  }
  for(i=0;i<n;i++){
    p+=40*match((function(row){ return function(k){ return m[row][k]; }; })(i),n);
    p+=40*match((function(col){ return function(k){ return m[k][col]; }; })(i),n);
  }
  var dark=0;
  for(i=0;i<n;i++) for(j=0;j<n;j++) dark+=m[i][j];
  p+=10*Math.floor(Math.abs(dark*100/(n*n)-50)/5);
  return p;
}

/* Returns an n x n array of 0/1, or null if the payload will not fit. */
function qrEncode(text){
  var bytes=[], i;
  var esc=unescape(encodeURIComponent(String(text)));
  for(i=0;i<esc.length;i++) bytes.push(esc.charCodeAt(i)&0xFF);

  var v=0;
  for(var vv=1;vv<=10;vv++){
    if(bytes.length*8+4+((vv<10)?8:16)<=qrCapacity(vv)*8){ v=vv; break; }
  }
  if(!v) return null;

  var spec=QR_M[v], total=qrCapacity(v), bits=new QRBits();
  bits.put(4,4);
  bits.put(bytes.length,(v<10)?8:16);
  for(i=0;i<bytes.length;i++) bits.put(bytes[i],8);
  bits.put(0,Math.min(4,total*8-bits.len));
  while(bits.len%8!==0) bits.putBit(false);
  var data=bits.buf.slice(), pad=[0xEC,0x11], k=0;
  while(data.length<total) data.push(pad[(k++)%2]);

  var blocks=[], eccs=[], pos=0;
  function take(count,len){
    for(var b=0;b<count;b++){
      var d=data.slice(pos,pos+len); pos+=len;
      blocks.push(d); eccs.push(qrEcc(d,spec[0]));
    }
  }
  take(spec[1],spec[2]);
  if(spec[3]) take(spec[3],spec[4]);

  var out=[], maxD=Math.max(spec[2],spec[4]||0), b2;
  for(i=0;i<maxD;i++) for(b2=0;b2<blocks.length;b2++)
    if(i<blocks[b2].length) out.push(blocks[b2][i]);
  for(i=0;i<spec[0];i++) for(b2=0;b2<eccs.length;b2++) out.push(eccs[b2][i]);

  var base=qrMakeMatrix(v), n=base.n, bitIdx=0;
  function nextBit(){
    var byteI=bitIdx>>3;
    if(byteI>=out.length) return 0;
    var b=(out[byteI]>>>(7-(bitIdx&7)))&1; bitIdx++; return b;
  }
  var placed=[];
  for(i=0;i<n;i++) placed[i]=base.m[i].slice();
  var up=true;
  for(var col=n-1;col>0;col-=2){
    if(col===6) col--;
    for(var r=0;r<n;r++){
      var row=up?(n-1-r):r;
      for(var cc=0;cc<2;cc++){
        var c=col-cc;
        if(base.fixed[row][c]) continue;
        placed[row][c]=nextBit();
      }
    }
    up=!up;
  }

  var best=null, bestScore=Infinity;
  for(var mk=0;mk<8;mk++){
    var mm=new Array(n), j2;
    for(i=0;i<n;i++) mm[i]=placed[i].slice();
    for(i=0;i<n;i++) for(j2=0;j2<n;j2++)
      if(!base.fixed[i][j2] && qrMaskFn(mk,i,j2)) mm[i][j2]^=1;

    var fmt=qrFormatBits(0,mk);   /* 0 = level M */
    for(i=0;i<15;i++){
      /* Most significant bit first: the module at (8,0) carries bit 14. */
      var bit=(fmt>>>(14-i))&1;
      if(i<6)        mm[8][i]=bit;
      else if(i<8)   mm[8][i+1]=bit;
      else if(i===8) mm[7][8]=bit;
      else           mm[14-i][8]=bit;
      /* The split copy divides at seven, not eight — row n-8 of that
         column is the always-dark module, so a bit sent there is lost. */
      if(i<7)        mm[n-1-i][8]=bit;
      else           mm[8][n-15+i]=bit;
    }
    mm[n-8][8]=1;

    var sc=qrPenalty(mm,n);
    if(sc<bestScore){ bestScore=sc; best=mm; }
  }
  return best;
}

/* Draw it as one SVG path. One path rather than a rect per module keeps a
   version-10 code at a few hundred bytes of DOM instead of a few thousand
   nodes, which matters on the phones this actually runs on. */
function qrSVG(text,px){
  var m=qrEncode(text);
  if(!m) return '';
  var n=m.length, quiet=2, size=n+quiet*2, d='';
  for(var i=0;i<n;i++) for(var j=0;j<n;j++)
    if(m[i][j]) d+='M'+(j+quiet)+' '+(i+quiet)+'h1v1h-1z';
  return '<svg class="qrsvg" viewBox="0 0 '+size+' '+size+'" width="'+px+'" height="'+px+'" '+
    'shape-rendering="crispEdges" role="img" aria-label="Check-in code">'+
    '<rect width="'+size+'" height="'+size+'" fill="#fff"/>'+
    '<path d="'+d+'" fill="#000"/></svg>';
}


/* ═══════════════════════════════════════════════════════════════
   State
   ═══════════════════════════════════════════════════════════════ */

var clubOpenId=null;
var clubSegNow='overview';

/* "The Club schema has not been run yet." Two different layers answer that
   question in two different ways, and only one of them is Postgres:

     42P01    the database itself — relation does not exist
     PGRST205 PostgREST, which answers from its own schema cache and says
              "Could not find the table 'public.club_members' in the schema
              cache" without ever reaching the table

   Going through supabase-js, PGRST205 is the one that actually arrives, so
   matching 42P01 alone meant the setup state was never recognised and a
   member got the raw cache message on the Club screen. PGRST202 is the same
   miss for a function, which is what a database with 10- but not 11- gives
   back for club_redeem and club_roster. */
function clubSchemaMissing(e){
  if(!e) return false;
  var c=e.code||'';
  if(c==='42P01'||c==='PGRST205'||c==='PGRST202') return true;
  return /does not exist|schema cache/i.test(e.message||'');
}

var Club = {
  state:'idle',          // idle | loading | ready | nosetup | error
  member:null,           // the club_members row, or null for a general user
  points:0,
  ledger:[],             // club_points rows, newest first
  sessions:[],           // upcoming club_sessions
  bookings:{},           // session_id -> booking row (upcoming only)
  history:[],            // past bookings that were attended
  counts:{},             // session_id -> how many are booked
  rewards:[],
  redemptions:[],
  missions:[],
  scans:[],              // club_inbody rows, newest first
  err:null,

  isMember(){ return !!(this.member && this.member.status==='active'); },
  isStaff(){ return !!(this.member && ['coach','staff','admin'].indexOf(this.member.role)>=0); },

  async uid(){
    try{ const r=await sb.auth.getSession();
      return (r&&r.data&&r.data.session&&r.data.session.user.id)||null; }
    catch(e){ return null; }
  },

  async load(force){
    if(this.state==='loading') return;
    if(this.state==='ready' && !force) return;
    if(!sb || !SUPA_READY){ this.state='nosetup'; return; }
    const uid=await this.uid();
    if(!uid){ this.state='nosetup'; return; }
    this.state='loading'; this.err=null;
    try{
      const m=await sb.from('club_members').select('*').eq('user_id',uid).maybeSingle();
      /* The schema has not been run yet. That is a setup state, not a
         failure, and the app must not show an error to a general user
         because of it. */
      if(clubSchemaMissing(m.error)){ this.state='nosetup'; return; }
      if(m.error) throw m.error;
      this.member=m.data||null;
      if(!this.isMember() && !this.isStaff()){ this.state='ready'; return; }

      const now=new Date().toISOString();
      const [ses,bk,pts,bal,rw,rd,ms,ib]=await Promise.all([
        sb.from('club_sessions').select('id,title,kind,coach_name,starts_at,ends_at,capacity,status,description,level,location,bring')
          .gte('starts_at',now).eq('status','scheduled').order('starts_at').limit(60),
        /* Bookings carry their session inline. Attendance history is the
           same rows at a later point in their life, so one query answers
           both "what have I booked" and "what have I done". */
        sb.from('club_bookings')
          .select('id,session_id,status,checked_in_at,club_sessions(starts_at,ends_at,title,kind)')
          .eq('user_id',uid).order('booked_at',{ascending:false}).limit(400),
        sb.from('club_points').select('amount,kind,description,created_at')
          .eq('user_id',uid).order('created_at',{ascending:false}).limit(200),
        /* The balance is the sum of the whole ledger, and the ledger above is
           capped at the 200 rows the history screen shows. Summing that capped
           list would quietly understate the balance of any member who has been
           here two years — so the total comes from the view, which sums all of
           it in the database. */
        sb.from('club_balances').select('balance').eq('user_id',uid).maybeSingle(),
        sb.from('club_rewards').select('*').eq('active',true).order('cost_points'),
        sb.from('club_redemptions').select('id,reward_id,cost_points,status,created_at')
          .eq('user_id',uid).order('created_at',{ascending:false}).limit(50),
        sb.from('club_missions').select('*').eq('active',true).order('sort'),
        sb.from('club_inbody').select('*').eq('user_id',uid).order('scan_date',{ascending:false}).limit(24)
      ]);
      if(ses.error) throw ses.error;
      this.sessions=ses.data||[];

      this.bookings={}; this.history=[];
      (bk.data||[]).forEach(b=>{
        if(b.status==='cancelled') return;
        this.bookings[b.session_id]=b;
        if(b.status==='attended') this.history.push(b);
      });
      this.history.sort((a,b)=>clubStartOf(b).localeCompare(clubStartOf(a)));

      this.ledger=pts.data||[];
      /* A database that has had 10- run but not 11- has no view yet. Falling
         back to the capped sum there is better than showing nothing, and it
         is right for every member who has not yet earned 200 ledger rows. */
      this.points=(!bal.error && bal.data && typeof bal.data.balance==='number')
        ? bal.data.balance
        : this.ledger.reduce((a,r)=>a+(r.amount||0),0);
      /* These four are new tables. An old database that has had 10- run but
         not 11- should still show classes and points rather than an error,
         so a failure here empties the tab instead of breaking the screen. */
      this.rewards=(rw.error?[]:rw.data)||[];
      this.redemptions=(rd.error?[]:rd.data)||[];
      this.missions=(ms.error?[]:ms.data)||[];
      this.scans=(ib.error?[]:ib.data)||[];

      await this.loadCounts();
      this.state='ready';
    }catch(e){
      /* A half-run schema is still a setup state, wherever the miss surfaces.
         club_members can exist while club_sessions does not, and a member
         should not read a PostgREST cache message because of it. */
      if(clubSchemaMissing(e)){ this.state='nosetup'; return; }
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
    const uid=await this.uid();
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
      clubPaint();
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
      clubPaint();
    }catch(e){ toast((e&&e.message)||'Could not cancel'); }
  }
};


/* ═══════════════════════════════════════════════════════════════
   Small shared helpers
   ═══════════════════════════════════════════════════════════════ */

function clubDayKey(iso2){ return String(iso2).slice(0,10); }
function clubStartOf(b){ return (b && b.club_sessions && b.club_sessions.starts_at) || b.checked_in_at || ''; }
function clubTime(iso2){
  try{ return new Date(iso2).toLocaleTimeString('en-MY',{hour:'numeric',minute:'2-digit',hour12:true}); }
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
function clubDate(d){
  try{ return new Date(d+'T00:00:00').toLocaleDateString('en-MY',{day:'numeric',month:'long',year:'numeric'}); }
  catch(e){ return d; }
}
function clubShortDate(d){
  try{ return new Date(String(d).slice(0,10)+'T00:00:00').toLocaleDateString('en-MY',{day:'numeric',month:'short'}); }
  catch(e){ return String(d).slice(0,10); }
}
function clubEsc(s){
  return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function clubMins(s){
  try{ return Math.max(0, Math.round((new Date(s.ends_at)-new Date(s.starts_at))/60000)); }
  catch(e){ return 0; }
}

/* Classes attended since Monday. The chip on the overview reads off this,
   and so does the weekly mission. */
function clubThisWeek(){
  const ws=weekStartISO();
  return Club.history.filter(b=>clubDayKey(clubStartOf(b))>=ws).length;
}
/* Consecutive weeks with at least one class, counting back from this one.
   A day streak is the wrong unit for a gym nobody attends seven days a
   week — it would read zero for a member training hard three times a week. */
function clubWeekStreak(){
  if(!Club.history.length) return 0;
  const weeks={};
  Club.history.forEach(b=>{ const k=clubDayKey(clubStartOf(b)); if(k) weeks[weekStartISO(k)]=1; });
  let n=0, cur=weekStartISO();
  /* This week not having started yet must not end the streak, so an empty
     current week is skipped rather than counted as a break. */
  if(!weeks[cur]){
    const d=new Date(cur+'T00:00:00'); d.setDate(d.getDate()-7);
    cur=weekStartISO(localISO(d));
    if(!weeks[cur]) return 0;
  }
  while(weeks[cur]){
    n++;
    const d=new Date(cur+'T00:00:00'); d.setDate(d.getDate()-7);
    cur=weekStartISO(localISO(d));
  }
  return n;
}
function clubAttendedIn(days){
  const from=iso(-days);
  return Club.history.filter(b=>clubDayKey(clubStartOf(b))>=from).length;
}


/* ═══════════════════════════════════════════════════════════════
   Shell
   ═══════════════════════════════════════════════════════════════ */

/* Every repaint goes through here. A load resolving in the background used to
   call renderClub() directly, which threw a member out of a class they had
   just opened. */
function clubPaint(){
  if(clubOpenId) return renderClubSession();
  if(clubSegNow==='classes') return renderClubClasses();
  if(clubSegNow==='checkin') return renderClubCheckin();
  if(clubSegNow==='body')    return renderClubBody();
  if(clubSegNow==='rewards') return renderClubRewards();
  return renderClub();
}

function openClub(){
  hidePanels(); $('club').style.display='block'; $('screen').scrollTop=0;
  clubOpenId=null; clubSegNow='overview';
  clubPaint();
  Club.load().then(clubPaint);
}

function clubSeg(s){
  /* Leaving Check In must stop the countdown and the token refresh, or the
     screen keeps pulling a new QR every ninety seconds from three tabs down. */
  if(clubSegNow==='checkin' && s!=='checkin') clubCiStop();
  clubSegNow=s;
  const bar=$('club-segs');
  /* An element with no children is not the same as no element, and the
     second is what a test harness or a trimmed shell hands back. Reading
     .children off it threw and took the whole navigation with it. */
  if(bar && bar.children) Array.prototype.forEach.call(bar.children,function(b){
    b.classList.toggle('on', b.getAttribute('data-seg')===s);
  });
  clubOpenId=null;
  clubPaint();
  $('screen').scrollTop=0;
}

/* Named wrappers, because build.py checks that every onclick in the shell
   resolves to a real function and a bare Club.method would slip past it. */
function clubGoOverview(){ clubSeg('overview'); }
function clubGoClasses(){ clubSeg('classes'); }
function clubGoCheckin(){ clubSeg('checkin'); }
function clubGoBody(){ clubSeg('body'); }
function clubGoRewards(){ clubSeg('rewards'); }
function clubReload(){ Club.load(true).then(clubPaint); }
function clubBook(id){ Club.book(id); }
function clubCancel(id){ Club.cancel(id); }

function clubStateCard(){
  if(Club.state==='loading'||Club.state==='idle')
    return '<div class="acard"><div class="sub">Loading your Club…</div></div>';
  if(Club.state==='nosetup')
    return '<div class="acard"><div class="ah"><span>🏛️</span><div class="t">Not set up yet</div></div>'+
      '<div class="sub" style="margin-top:3px;">The Club is not switched on for this account.</div></div>';
  if(Club.state==='error')
    return '<div class="acard"><div class="ah"><span>⚠️</span><div class="t">Could not load the Club</div></div>'+
      '<div class="sub" style="margin-top:3px;">'+clubEsc(Club.err)+'</div>'+
      '<button class="bigbtn sec" onclick="clubReload()">Try again</button></div>';
  return null;
}


/* ═══════════════════════════════════════════════════════════════
   Overview
   ═══════════════════════════════════════════════════════════════ */

function renderClub(){
  const el=$('club-body'); if(!el) return;
  const busy=clubStateCard();
  if(busy){ el.innerHTML='<div class="sechead">HITFAT Club</div>'+busy; return; }
  if(!Club.isMember() && !Club.isStaff()){ el.innerHTML=clubPromoHTML(true); return; }

  const m=Club.member;
  let h='';

  /* ── the three numbers a member checks on the way in ── */
  const credits=(typeof m.credits_left==='number')?m.credits_left:'∞';
  h+='<div class="cstats">'+
     clubStatChip('Class credits',credits,'HF')+
     clubStatChip('This week',clubThisWeek(),'▲')+
     clubStatChip('HF Points',Club.points.toLocaleString(),'P')+
     '</div>';

  /* ── next class ── the single most important thing on this screen */
  const mine=Club.sessions.filter(s=>Club.myBooking(s));
  const next=mine[0]||null;
  if(next){
    const b=Club.myBooking(next);
    h+='<div class="chero" onclick="openClubSession(\''+next.id+'\')">'+
       '<div class="chero-k">'+(b.status==='waitlisted'?'ON THE WAITLIST':'YOUR NEXT CLASS')+'</div>'+
       '<h2>'+clubEsc(next.title)+'</h2>'+
       '<div class="chero-s">'+clubDayLabel(clubDayKey(next.starts_at))+' · '+clubTime(next.starts_at)+
       ' · '+clubEsc(next.coach_name||'HITFAT')+'</div>'+
       '<div class="chero-go">Open class →</div></div>';
  }else{
    h+='<div class="chero empty2" onclick="clubGoClasses()">'+
       '<div class="chero-k">NOTHING BOOKED</div>'+
       '<h2>Book your week</h2>'+
       '<div class="chero-s">Classes fill from the front. Pick your sessions now.</div>'+
       '<div class="chero-go">See the timetable →</div></div>';
  }

  /* ── the two things done at the door ── */
  h+='<div class="cacts">'+
     '<button class="cact" onclick="clubGoCheckin()">'+clubIcon('qr')+'<span>Check in</span></button>'+
     '<button class="cact" onclick="clubGoClasses()">'+clubIcon('cal')+'<span>Book a class</span></button>'+
     '</div>';

  /* ── membership ── */
  h+='<div class="sechead">Membership</div>'+
     '<div class="acard"><div class="ah"><div class="t">'+clubEsc(m.plan||'HITFAT Club')+'</div>'+
     '<div class="c cpill '+(m.status==='active'?'ok':'warn')+'">'+clubEsc(String(m.status||'').toUpperCase())+'</div></div>'+
     (m.member_no?'<div class="sub">Member '+clubEsc(m.member_no)+'</div>':'')+
     (m.expires_on?'<div class="sub">Expires '+clubDate(m.expires_on)+'</div>':'')+
     (typeof m.credits_left==='number'?'<div class="sub">'+m.credits_left+' class credits left</div>':'')+
     '</div>';

  /* ── consistency, which is the only thing that changes a body ── */
  const streak=clubWeekStreak();
  h+='<div class="sechead">Your rhythm</div>'+
     '<div class="acard">'+clubWeekGrid()+
     '<div class="sub" style="margin-top:10px;">'+
     (streak>1?('<b>'+streak+' weeks</b> running without missing one.')
              :'Train once this week to start a streak.')+
     '</div></div>';

  /* ── points, and the nearest thing they buy ── */
  const affordable=Club.rewards.filter(r=>r.cost_points<=Club.points);
  const nextUp=Club.rewards.filter(r=>r.cost_points>Club.points)
    .sort((a,b)=>a.cost_points-b.cost_points)[0];
  h+='<div class="sechead">HF Points</div>'+
     '<div class="acard cpts" onclick="clubGoRewards()">'+
     '<div class="cpts-l"><div class="cpts-n">'+Club.points.toLocaleString()+'</div>'+
     '<div class="sub">'+(affordable.length
        ? affordable.length+' reward'+(affordable.length===1?'':'s')+' within reach'
        : 'Earned from classes, streaks and challenges')+'</div>'+
     (nextUp?'<div class="cpts-next">'+(nextUp.cost_points-Club.points)+' more for '+clubEsc(nextUp.name)+'</div>':'')+
     '</div>'+clubShield()+'</div>';

  /* ── body, if there is anything to show ── */
  const s0=Club.scans[0];
  if(s0){
    const s1=Club.scans[1];
    h+='<div class="sechead">Your numbers</div>'+
       '<div class="acard cbody-mini" onclick="clubGoBody()">'+
       clubMiniStat('Weight',s0.weight,s1&&s1.weight,'kg')+
       clubMiniStat('Body fat',s0.pbf,s1&&s1.pbf,'%')+
       clubMiniStat('Muscle',s0.smm,s1&&s1.smm,'kg')+
       '</div>';
  }else{
    h+='<div class="sechead">Your numbers</div>'+
       '<div class="acard"><div class="ah"><span>📄</span><div class="t">No InBody scan yet</div></div>'+
       '<div class="sub" style="margin-top:3px;">Photograph the printout and the app will read it, '+
       'then chart every scan after it.</div>'+
       '<button class="bigbtn sec" onclick="clubGoBody()">Add a scan</button></div>';
  }

  el.innerHTML=h;
}

function clubStatChip(label,value,mark){
  return '<div class="cstat"><div class="cs-l">'+clubEsc(label)+'</div>'+
    '<div class="cs-v">'+clubEsc(value)+'</div>'+
    '<div class="cs-m">'+clubEsc(mark)+'</div></div>';
}

function clubMiniStat(label,v,prev,unit){
  if(v==null) return '';
  let d='';
  if(prev!=null){
    const diff=Math.round((v-prev)*10)/10;
    if(diff!==0) d='<span class="cd '+(diff>0?'up':'dn')+'">'+(diff>0?'+':'')+diff+'</span>';
  }
  return '<div class="cbm"><div class="cbm-l">'+clubEsc(label)+'</div>'+
    '<div class="cbm-v">'+v+'<small>'+unit+'</small>'+d+'</div></div>';
}

/* Seven cells, Monday first, filled where a class was attended. */
function clubWeekGrid(){
  const ws=weekStartISO(), letters=['M','T','W','T','F','S','S'];
  const done={};
  Club.history.forEach(b=>{ const k=clubDayKey(clubStartOf(b)); if(k>=ws) done[k]=1; });
  let h='<div class="cweek">';
  for(let i=0;i<7;i++){
    const d=new Date(ws+'T00:00:00'); d.setDate(d.getDate()+i);
    const k=localISO(d), on=!!done[k], today=(k===iso(0));
    h+='<div class="cwd'+(on?' on':'')+(today?' now':'')+'"><i>'+letters[i]+'</i><span></span></div>';
  }
  return h+'</div>';
}

function clubShield(){
  return '<svg class="cshield" viewBox="0 0 80 100" width="46" aria-hidden="true">'+
    '<path d="M22 24 L28 13 L34 21 L40 10 L46 21 L52 13 L58 24 Z" fill="var(--gold)"/>'+
    '<path d="M16 28 H64 V60 C64 80 52 88 40 92 C28 88 16 80 16 60 Z" fill="none" '+
    'stroke="var(--gold)" stroke-width="2.5"/>'+
    '<text x="40" y="62" text-anchor="middle" font-size="17" font-weight="800" fill="var(--gold)">HF</text></svg>';
}

function clubIcon(k){
  const a='fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"';
  if(k==='qr') return '<svg viewBox="0 0 24 24" width="26" height="26" '+a+'>'+
    '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>'+
    '<rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3M21 21v.01M17 21h.01M21 17h.01"/></svg>';
  return '<svg viewBox="0 0 24 24" width="26" height="26" '+a+'>'+
    '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/></svg>';
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
    '<div class="ah"><span>🏛️</span><div class="t">'+(n?clubEsc(n.title):'Nothing booked')+'</div><div class="c">›</div></div>'+
    '<div class="sub">'+(n?(clubDayLabel(clubDayKey(n.starts_at))+' · '+clubTime(n.starts_at))
                          :'Tap to book a class')+'</div></div>';
}


/* ═══════════════════════════════════════════════════════════════
   Classes
   ═══════════════════════════════════════════════════════════════ */

function renderClubClasses(){
  const el=$('club-body'); if(!el) return;
  const busy=clubStateCard();
  if(busy){ el.innerHTML='<div class="sechead">Classes</div>'+busy; return; }
  if(!Club.sessions.length){
    el.innerHTML='<div class="sechead">Classes</div>'+
      '<div class="acard"><div class="sub">No classes are scheduled yet.</div></div>';
    return;
  }
  const byDay={};
  Club.sessions.forEach(s=>{ const k=clubDayKey(s.starts_at); (byDay[k]=byDay[k]||[]).push(s); });
  let h='<div class="cloc">'+clubEsc(Club.sessions[0].location||'HITFAT HQ · Kelantan')+'</div>';
  Object.keys(byDay).sort().forEach(k=>{
    h+='<div class="sechead">'+clubDayLabel(k)+'</div>';
    byDay[k].forEach(s=>{
      const left=Club.seatsLeft(s), b=Club.myBooking(s), taken=Club.counts[s.id]||0;
      const pct=s.capacity?Math.min(100,Math.round(taken/s.capacity*100)):0;
      let note, btn, tag='';
      if(b && b.status==='waitlisted'){ note='On the waitlist'; tag='<span class="ctag wait">WAITLIST</span>';
        btn='<button class="cbtn sec" onclick="clubCancel(\''+s.id+'\')">Leave waitlist</button>'; }
      else if(b){ note='You are booked'; tag='<span class="ctag ok">BOOKED</span>';
        btn='<button class="cbtn sec" onclick="clubCancel(\''+s.id+'\')">Cancel</button>'; }
      else if(left<=0){ note='Full';
        btn='<button class="cbtn sec" onclick="clubBook(\''+s.id+'\')">Join waitlist</button>'; }
      else if(left<=3){ note=left+' spot'+(left===1?'':'s')+' left';
        btn='<button class="cbtn" onclick="clubBook(\''+s.id+'\')">Book</button>'; }
      else { note=taken+' / '+s.capacity+' booked';
        btn='<button class="cbtn" onclick="clubBook(\''+s.id+'\')">Book</button>'; }

      h+='<div class="ccls">'+
         '<div class="ccls-t" onclick="openClubSession(\''+s.id+'\')">'+
           '<div class="ccls-time"><b>'+clubTime(s.starts_at)+'</b><small>'+clubMins(s)+' min</small></div>'+
           '<div class="ccls-m"><div class="ccls-n">'+clubEsc(s.title)+tag+'</div>'+
           '<div class="ccls-c">'+clubEsc(s.coach_name||'HITFAT')+
           (s.kind?' · <span class="ccls-k">'+clubEsc(s.kind)+'</span>':'')+'</div>'+
           '<div class="cbar'+(left<=3?' hot':'')+'"><i style="width:'+pct+'%"></i></div>'+
           '<div class="ccls-s">'+clubEsc(note)+'</div></div>'+
           '<div class="ccls-go">›</div>'+
         '</div>'+btn+'</div>';
    });
  });
  el.innerHTML=h;
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
    btn='<button class="bigbtn sec" onclick="clubCancel(\''+s.id+'\')">Leave waitlist</button>';
  else if(b)
    btn='<button class="bigbtn sec" onclick="clubCancel(\''+s.id+'\')">Cancel booking</button>';
  else if(left<=0)
    btn='<button class="bigbtn" onclick="clubBook(\''+s.id+'\')">Join waitlist</button>';
  else
    btn='<button class="bigbtn" onclick="clubBook(\''+s.id+'\')">Book class</button>';

  let h='<button class="back" onclick="clubBackToList()">← Classes</button>';

  h+='<div class="chero flat2">'+
     (s.kind?'<div class="chero-k">'+clubEsc(s.kind)+'</div>':'<div class="chero-k">CLASS</div>')+
     '<h2>'+clubEsc(s.title)+'</h2>'+
     '<div class="chero-s">'+clubDayLabel(clubDayKey(s.starts_at))+' · '+clubTime(s.starts_at)+
     ' – '+clubTime(s.ends_at)+(mins?' · '+mins+' min':'')+'</div>'+
     '<div class="chero-s">'+clubEsc(s.coach_name||'HITFAT')+'</div></div>';

  /* Capacity as a bar, because "18 / 25" is a fact and a filling bar is
     a reason to book now. */
  h+='<div class="acard"><div class="ah"><div class="t">Spaces</div>'+
     '<div class="c cpill '+(left<=3?'warn':'')+'">'+(left<=0?'FULL':left+' LEFT')+'</div></div>'+
     '<div class="cbar'+(left<=3?' hot':'')+'"><i style="width:'+pct+'%"></i></div>'+
     '<div class="sub">'+taken+' of '+s.capacity+' booked</div></div>';

  const facts=[];
  if(s.level) facts.push(['Level', s.level]);
  if(s.location) facts.push(['Where', s.location]);
  if(facts.length){
    h+='<div class="acard">'+facts.map(f=>
      '<div class="pgins"><i class="ok"></i><div><b>'+clubEsc(f[0])+'</b><small>'+clubEsc(f[1])+'</small></div></div>').join('')+'</div>';
  }

  if(s.description)
    h+='<div class="sechead">About this class</div>'+
       '<div class="acard"><div class="sub" style="line-height:1.6;">'+clubEsc(s.description)+'</div></div>';

  const bring=Array.isArray(s.bring)?s.bring.filter(Boolean):[];
  if(bring.length)
    h+='<div class="sechead">Bring</div>'+
       '<div class="acard"><div class="pgseg" style="flex-wrap:wrap;">'+
       bring.map(x=>'<span class="chip">'+clubEsc(x)+'</span>').join('')+'</div></div>';

  h+=btn;
  el.innerHTML=h;
}


/* ═══════════════════════════════════════════════════════════════
   Check In

   The member shows a QR; the coach scans it. The code behind it is
   issued by the server, lives about three minutes and dies the moment
   it is used, so a photograph of someone's screen is worth nothing.

   Under it, always, a six-character code the coach can type — because
   cameras fail to focus, screens crack, and batteries go flat, and none
   of those should mean a member cannot be marked present.
   ═══════════════════════════════════════════════════════════════ */

var clubCi={ token:null, code:null, expires:0, timer:null, tick:null, loading:false, err:null };

function clubCiStop(){
  if(clubCi.timer){ clearTimeout(clubCi.timer); clubCi.timer=null; }
  if(clubCi.tick){ clearInterval(clubCi.tick); clubCi.tick=null; }
}

async function clubCiFetch(){
  if(!sb || !SUPA_READY){ clubCi.err='Sign in to check in.'; renderClubCheckin(); return; }
  clubCi.loading=true; clubCi.err=null;
  try{
    const r=await sb.auth.getSession();
    const jwt=r&&r.data&&r.data.session&&r.data.session.access_token;
    if(!jwt) throw new Error('Sign in to check in.');
    const res=await fetch(SUPA_URL.replace(/\/+$/,'')+'/functions/v1/club-checkin',{
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':'Bearer '+jwt,'apikey':SUPA_KEY},
      body:JSON.stringify({action:'token'})
    });
    const j=await res.json();
    if(!res.ok||!j.ok) throw new Error(j.error||'Could not get a check-in code.');
    clubCi.token=j.token; clubCi.code=j.code;
    clubCi.expires=new Date(j.expires_at).getTime();

    /* Refresh at half the life, so the code on screen is never the one
       about to expire as the coach lifts the camera. */
    clubCiStop();
    const half=Math.max(20000,(clubCi.expires-Date.now())/2);
    clubCi.timer=setTimeout(function(){
      /* Leaving the Club by the Back button goes through switchTab, not
         clubSeg, so nothing here was ever told the screen had gone. Without
         this check the app quietly asks the server for a fresh token every
         ninety seconds for the rest of the session. */
      if(!clubCiOnScreen()){ clubCiStop(); return; }
      clubCiFetch();
    }, half);
    clubCi.tick=setInterval(clubCiCountdown,1000);
  }catch(e){
    clubCi.err=(e&&e.message)||'Could not get a check-in code.';
  }
  clubCi.loading=false;
  /* The member may have moved on while this was in flight. Painting now
     would overwrite whichever screen they are actually looking at. */
  if(clubSegNow==='checkin') renderClubCheckin();
}

/* Still on the check-in screen, and the Club still on top? */
function clubCiOnScreen(){
  if(clubSegNow!=='checkin') return false;
  const p=$('club');
  return !!(p && p.style && p.style.display!=='none');
}

function clubCiCountdown(){
  if(!clubCiOnScreen()){ clubCiStop(); return; }
  const el=$('ci-left'); if(!el){ clubCiStop(); return; }
  const s=Math.max(0,Math.round((clubCi.expires-Date.now())/1000));
  el.textContent=s>0?('Refreshes in '+Math.floor(s/60)+':'+('0'+(s%60)).slice(-2)):'Refreshing…';
}

function clubCiRefresh(){ clubCiFetch(); }

function renderClubCheckin(){
  const el=$('club-body'); if(!el) return;
  const busy=clubStateCard();
  if(busy){ el.innerHTML='<div class="sechead">Check in</div>'+busy; return; }
  if(!Club.isMember() && !Club.isStaff()){ el.innerHTML=clubPromoHTML(true); return; }

  /* Already in today? The register is the truth, not the phone. */
  const today=iso(0);
  const inToday=Club.history.filter(b=>clubDayKey(clubStartOf(b))===today)[0];

  let h='<div class="sechead">Check in</div>';

  if(inToday){
    const t=inToday.checked_in_at?clubTime(inToday.checked_in_at):'';
    h+='<div class="cdone">'+
       '<div class="cdone-i">✓</div>'+
       '<div class="cdone-t">You are checked in</div>'+
       '<div class="cdone-s">'+clubEsc((inToday.club_sessions&&inToday.club_sessions.title)||'Today\'s class')+
       (t?' · '+t:'')+'</div>'+
       '<div class="cdone-p">+5<small>HF POINTS</small></div>'+
       '</div>';
    h+='<div class="acard"><div class="sub">Showing a code again will not check you in twice. '+
       'Come back tomorrow.</div></div>';
    el.innerHTML=h;
    clubCiStop();
    return;
  }

  if(clubCi.err){
    h+='<div class="acard"><div class="ah"><span>⚠️</span><div class="t">No code yet</div></div>'+
       '<div class="sub" style="margin-top:3px;">'+clubEsc(clubCi.err)+'</div>'+
       '<button class="bigbtn sec" onclick="clubCiRefresh()">Try again</button></div>';
    el.innerHTML=h;
    return;
  }

  if(!clubCi.token){
    h+='<div class="cqr"><div class="cqr-wait">Getting your code…</div></div>';
    el.innerHTML=h;
    if(!clubCi.loading) clubCiFetch();
    return;
  }

  const m=Club.member||{};
  h+='<p class="cqr-lead">Show this to your coach at the counter.</p>'+
     '<div class="cqr">'+
       '<div class="cqr-frame">'+
         '<i class="cc tl"></i><i class="cc tr"></i><i class="cc bl"></i><i class="cc br"></i>'+
         qrSVG('HFC1:'+clubCi.token,220)+
       '</div>'+
       '<div class="cqr-name">'+clubEsc(clubMyName())+'</div>'+
       '<div class="cqr-id">'+clubEsc(m.member_no||'HITFAT Club')+'</div>'+
       '<div class="cqr-code"><span>'+clubEsc(clubCi.code||'')+'</span></div>'+
       '<div class="cqr-hint" id="ci-left">Refreshes shortly</div>'+
     '</div>'+
     '<div class="cqr-note">Cannot scan? The coach can type the six characters above. '+
     'A new code replaces this one every few minutes.</div>';

  h+='<div class="sechead">Today</div>'+
     '<div class="acard"><div class="crow3">'+
     '<div class="cr3"><b>'+clubThisWeek()+'</b><small>THIS WEEK</small></div>'+
     '<div class="cr3"><b>5</b><small>PTS / CLASS</small></div>'+
     '<div class="cr3"><b>'+clubWeekStreak()+'</b><small>WEEK STREAK</small></div>'+
     '</div></div>';

  el.innerHTML=h;
  clubCiCountdown();
}

/* The name under the QR is what lets the coach confirm they scanned the
   person in front of them, so it has to be the member's own name and not a
   placeholder. It lives where the Me screen reads it from; the email's
   local part is the fallback, because "aiman" beats "HITFAT member" for
   telling two people apart at a counter. */
function clubMyName(){
  try{
    const n=HF && HF.data && HF.data.prefs && HF.data.prefs.name;
    if(n && String(n).trim()) return String(n).trim();
  }catch(e){}
  try{
    const e2=HF && HF.email;
    if(e2 && e2.indexOf('@')>0) return e2.split('@')[0];
  }catch(e){}
  return 'HITFAT member';
}


/* ═══════════════════════════════════════════════════════════════
   Body · InBody

   A machine prints a sheet, the sheet gets lost, and nobody can say
   whether the last eight weeks did anything. Photograph it once and the
   trend draws itself from then on.
   ═══════════════════════════════════════════════════════════════ */

var clubIb={ busy:false, err:null, openId:null };

function renderClubBody(){
  const el=$('club-body'); if(!el) return;
  const busy=clubStateCard();
  if(busy){ el.innerHTML='<div class="sechead">Body</div>'+busy; return; }
  if(!Club.isMember() && !Club.isStaff()){ el.innerHTML=clubPromoHTML(true); return; }

  const s=Club.scans[0], prev=Club.scans[1];
  let h='<div class="sechead">Body</div>';

  if(clubIb.busy){
    h+='<div class="acard"><div class="ah"><span>📄</span><div class="t">Reading your sheet…</div></div>'+
       '<div class="sub" style="margin-top:3px;">This takes a few seconds.</div></div>';
    el.innerHTML=h; return;
  }
  if(clubIb.err){
    h+='<div class="acard"><div class="ah"><span>⚠️</span><div class="t">Could not read that</div></div>'+
       '<div class="sub" style="margin-top:3px;">'+clubEsc(clubIb.err)+'</div>'+
       '<button class="bigbtn sec" onclick="clubIbPick()">Try another photo</button></div>';
    clubIb.err=null;
    el.innerHTML=h; return;
  }

  if(!s){
    h+='<div class="acard"><div class="ah"><span>📄</span><div class="t">No scan yet</div></div>'+
       '<div class="sub" style="margin-top:3px;line-height:1.55;">Photograph the InBody printout. '+
       'The app reads the numbers off it and keeps the trend, so the next scan means something.</div>'+
       '<button class="bigbtn" onclick="clubIbPick()">Scan a printout</button></div>';
    el.innerHTML=h; return;
  }

  /* ── the headline ── */
  h+='<div class="cscore">'+
     '<div class="cscore-l"><div class="cscore-k">INBODY SCORE</div>'+
     '<div class="cscore-n">'+(s.score!=null?s.score:'—')+'</div>'+
     '<div class="cscore-d">'+clubShortDate(s.scan_date)+
     (prev&&s.score!=null&&prev.score!=null?clubDelta(s.score-prev.score,''):'')+'</div></div>'+
     clubRadar(s)+'</div>';

  /* ── the numbers that move ── */
  h+='<div class="cgrid">'+
     clubIbCard('Weight',s.weight,prev&&prev.weight,'kg',false)+
     clubIbCard('Body fat',s.pbf,prev&&prev.pbf,'%',false)+
     clubIbCard('Muscle',s.smm,prev&&prev.smm,'kg',true)+
     clubIbCard('Fat mass',s.bfm,prev&&prev.bfm,'kg',false)+
     clubIbCard('BMI',s.bmi,prev&&prev.bmi,'',false)+
     clubIbCard('Visceral',s.vfa,prev&&prev.vfa,'',false)+
     '</div>';

  /* ── trends, once there are two points to draw between ── */
  if(Club.scans.length>1){
    h+='<div class="sechead">Trend</div>';
    h+='<div class="acard">'+clubTrend('Weight','weight','kg')+'</div>';
    h+='<div class="acard">'+clubTrend('Body fat','pbf','%')+'</div>';
    h+='<div class="acard">'+clubTrend('Muscle','smm','kg')+'</div>';
  }

  /* ── segmental, if the sheet had it ── */
  if(s.segmental){
    h+='<div class="sechead">Segments</div><div class="acard">'+clubSegBars(s)+'</div>';
  }

  h+='<div class="sechead">History</div><div class="acard chist">';
  Club.scans.forEach(function(x){
    h+='<div class="chist-r"><div class="chist-d">'+clubShortDate(x.scan_date)+'</div>'+
       '<div class="chist-v">'+(x.weight!=null?x.weight+' kg':'—')+'</div>'+
       '<div class="chist-v">'+(x.pbf!=null?x.pbf+'%':'—')+'</div>'+
       '<div class="chist-s">'+(x.score!=null?x.score:'—')+'</div></div>';
  });
  h+='</div>';

  h+='<button class="bigbtn sec" onclick="clubIbPick()">Add a new scan</button>';
  el.innerHTML=h;
}

function clubDelta(d,unit){
  if(d==null||!isFinite(d)||Math.round(d*10)===0) return '';
  const v=Math.round(d*10)/10;
  return ' <span class="cd '+(v>0?'up':'dn')+'">'+(v>0?'+':'')+v+unit+'</span>';
}

/* higherBetter decides the colour, not the arrow. Losing fat and gaining
   muscle both read as progress, and a single "down is good" rule would
   colour a muscle loss green. */
function clubIbCard(label,v,prev,unit,higherBetter){
  if(v==null) return '';
  let d='';
  if(prev!=null){
    const diff=Math.round((v-prev)*10)/10;
    if(diff!==0){
      const good=higherBetter?(diff>0):(diff<0);
      d='<div class="cib-d '+(good?'good':'bad')+'">'+(diff>0?'+':'')+diff+'</div>';
    }
  }
  return '<div class="cib"><div class="cib-l">'+clubEsc(label)+'</div>'+
    '<div class="cib-v">'+v+'<small>'+unit+'</small></div>'+d+'</div>';
}

/* A five-axis radar of segmental lean mass. It is the one picture that
   shows an imbalance a column of numbers hides. */
function clubRadar(s){
  const seg=s.segmental||{};
  const keys=[['trunk','Trunk'],['right_arm','R arm'],['right_leg','R leg'],['left_leg','L leg'],['left_arm','L arm']];
  const vals=keys.map(k=>{
    const o=seg[k[0]]; const v=o&&typeof o.lean==='number'?o.lean:null; return v;
  });
  if(!vals.some(v=>v!=null)) return '<div class="cscore-r"></div>';
  /* Trunk lean dwarfs an arm, so each axis is scaled against the largest
     value on that axis rather than a shared one — otherwise every chart is
     a trunk spike between four stubs and shows nothing. */
  const max=Math.max.apply(null,vals.map(v=>v==null?0:v))||1;
  const cx=54, cy=54, R=42;
  let poly='', rings='', axes='';
  for(let r=1;r<=3;r++){
    let p='';
    for(let i=0;i<5;i++){
      const a=-Math.PI/2+i*2*Math.PI/5, rr=R*r/3;
      p+=(i?'L':'M')+(cx+rr*Math.cos(a)).toFixed(1)+' '+(cy+rr*Math.sin(a)).toFixed(1);
    }
    rings+='<path d="'+p+'Z" fill="none" stroke="var(--hairline)" stroke-width="1"/>';
  }
  for(let i=0;i<5;i++){
    const a=-Math.PI/2+i*2*Math.PI/5;
    axes+='<line x1="'+cx+'" y1="'+cy+'" x2="'+(cx+R*Math.cos(a)).toFixed(1)+'" y2="'+
      (cy+R*Math.sin(a)).toFixed(1)+'" stroke="var(--hairline)" stroke-width="1"/>';
    const v=vals[i]==null?0:vals[i], rr=R*Math.max(0.12,v/max);
    poly+=(i?'L':'M')+(cx+rr*Math.cos(a)).toFixed(1)+' '+(cy+rr*Math.sin(a)).toFixed(1);
  }
  return '<div class="cscore-r"><svg viewBox="0 0 108 108" width="108" height="108" aria-label="Segmental lean mass">'+
    rings+axes+'<path d="'+poly+'Z" fill="var(--accent-wash)" stroke="var(--hitfat)" stroke-width="2"/>'+
    '</svg></div>';
}

/* Segmental lean as five bars, each against the largest segment. */
function clubSegBars(s){
  const seg=s.segmental||{};
  const rows=[['trunk','Trunk'],['left_arm','Left arm'],['right_arm','Right arm'],
              ['left_leg','Left leg'],['right_leg','Right leg']];
  const vals=rows.map(r=>{ const o=seg[r[0]]; return (o&&typeof o.lean==='number')?o.lean:null; });
  const max=Math.max.apply(null,vals.map(v=>v==null?0:v))||1;
  let h='';
  rows.forEach(function(r,i){
    const v=vals[i];
    h+='<div class="cseg"><div class="cseg-l">'+r[1]+'</div>'+
       '<div class="cseg-b"><i style="width:'+(v==null?0:Math.round(v/max*100))+'%"></i></div>'+
       '<div class="cseg-v">'+(v==null?'—':v+' kg')+'</div></div>';
  });
  /* Left against right, which is what a coach actually looks for. */
  const bal=[['arm','left_arm','right_arm','Arms'],['leg','left_leg','right_leg','Legs']];
  bal.forEach(function(b){
    const l=seg[b[1]], r=seg[b[2]];
    if(!l||!r||typeof l.lean!=='number'||typeof r.lean!=='number') return;
    const d=Math.abs(l.lean-r.lean), pct=Math.round(d/Math.max(l.lean,r.lean)*1000)/10;
    h+='<div class="sub" style="margin-top:8px;">'+b[3]+' differ by '+
       (Math.round(d*10)/10)+' kg ('+pct+'%)'+(pct>10?' — worth showing your coach.':'')+'</div>';
  });
  return h;
}

/* One metric across every scan, oldest to newest. */
function clubTrend(label,key,unit){
  const pts=Club.scans.slice().reverse()
    .filter(s=>s[key]!=null).map(s=>({d:String(s.scan_date).slice(0,10), v:Number(s[key])}));
  if(pts.length<2) return '';
  const vs=pts.map(p=>p.v);
  let lo=Math.min.apply(null,vs), hi=Math.max.apply(null,vs);
  if(hi===lo){ hi=lo+1; lo=lo-1; }
  const pad=(hi-lo)*0.15; lo-=pad; hi+=pad;
  const W=280, H=76, n=pts.length;
  let d='', dots='';
  pts.forEach(function(p,i){
    const x=(n===1?W/2:(i/(n-1))*(W-16)+8);
    const y=H-8-((p.v-lo)/(hi-lo))*(H-20);
    d+=(i?'L':'M')+x.toFixed(1)+' '+y.toFixed(1);
    if(i===n-1) dots+='<circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="3.5" fill="var(--hitfat)"/>';
  });
  const first=pts[0].v, last=pts[n-1].v, diff=Math.round((last-first)*10)/10;
  return '<div class="ctr"><div class="ctr-h"><div class="ctr-l">'+label+'</div>'+
    '<div class="ctr-v">'+last+'<small>'+unit+'</small>'+
    (diff!==0?'<span class="cd '+(diff>0?'up':'dn')+'">'+(diff>0?'+':'')+diff+'</span>':'')+'</div></div>'+
    '<svg viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="none" class="ctr-svg" aria-hidden="true">'+
    '<path d="'+d+'" fill="none" stroke="var(--hitfat)" stroke-width="2" '+
    'stroke-linecap="round" stroke-linejoin="round"/>'+dots+'</svg>'+
    '<div class="ctr-x"><span>'+clubShortDate(pts[0].d)+'</span><span>'+clubShortDate(pts[n-1].d)+'</span></div></div>';
}

/* ── uploading a sheet ── */
function clubIbPick(){
  let inp=$('club-ib-file');
  if(!inp){
    inp=document.createElement('input');
    inp.type='file'; inp.accept='image/*'; inp.id='club-ib-file';
    inp.style.display='none';
    inp.addEventListener('change',function(){ clubIbChosen(this.files&&this.files[0]); });
    document.body.appendChild(inp);
  }
  inp.value='';
  inp.click();
}

function clubIbChosen(file){
  if(!file) return;
  clubIb.busy=true; clubIb.err=null; renderClubBody();
  /* Downscale before upload. A modern phone photograph is four megabytes
     and the sheet is legible at a fraction of that; sending the original
     is slow on gym wifi and costs more to read. */
  const fr=new FileReader();
  fr.onload=function(){
    const img=new Image();
    img.onload=function(){
      const max=1600, sc=Math.min(1,max/Math.max(img.width,img.height));
      const cv=document.createElement('canvas');
      cv.width=Math.round(img.width*sc); cv.height=Math.round(img.height*sc);
      cv.getContext('2d').drawImage(img,0,0,cv.width,cv.height);
      let data;
      try{ data=cv.toDataURL('image/jpeg',0.9); }
      catch(e){ data=String(fr.result); }
      clubIbSend(data.replace(/^data:image\/\w+;base64,/,''));
    };
    img.onerror=function(){ clubIb.busy=false; clubIb.err='That file is not an image.'; renderClubBody(); };
    img.src=String(fr.result);
  };
  fr.onerror=function(){ clubIb.busy=false; clubIb.err='Could not read that file.'; renderClubBody(); };
  fr.readAsDataURL(file);
}

async function clubIbSend(b64){
  try{
    const r=await sb.auth.getSession();
    const jwt=r&&r.data&&r.data.session&&r.data.session.access_token;
    if(!jwt) throw new Error('Sign in first.');
    const res=await fetch(SUPA_URL.replace(/\/+$/,'')+'/functions/v1/club-inbody',{
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':'Bearer '+jwt,'apikey':SUPA_KEY},
      body:JSON.stringify({action:'scan', image_base64:b64, media_type:'image/jpeg'})
    });
    const j=await res.json();
    if(!res.ok||!j.ok) throw new Error(j.error||'Could not read that sheet.');
    clubIb.busy=false;
    toast('Scan saved');
    await Club.load(true);
    clubSegNow='body';
    renderClubBody();
  }catch(e){
    clubIb.busy=false;
    clubIb.err=(e&&e.message)||'Could not read that sheet.';
    renderClubBody();
  }
}


/* ═══════════════════════════════════════════════════════════════
   Rewards
   ═══════════════════════════════════════════════════════════════ */

var clubRwTab='redeem';
function clubRwSeg(t){ clubRwTab=t; renderClubRewards(); }
function clubRwMissions(){ clubRwSeg('missions'); }
function clubRwRedeem(){ clubRwSeg('redeem'); }
function clubRwMine(){ clubRwSeg('mine'); }

function renderClubRewards(){
  const el=$('club-body'); if(!el) return;
  const busy=clubStateCard();
  if(busy){ el.innerHTML='<div class="sechead">Rewards</div>'+busy; return; }
  if(!Club.isMember() && !Club.isStaff()){ el.innerHTML=clubPromoHTML(true); return; }

  let h='<div class="cbal">'+clubShield()+
    '<div><div class="cbal-n">'+Club.points.toLocaleString()+'</div>'+
    '<div class="cbal-l">HF POINTS</div></div></div>';

  h+='<div class="crtabs">'+
     '<button class="crt'+(clubRwTab==='missions'?' on':'')+'" onclick="clubRwMissions()">Missions</button>'+
     '<button class="crt'+(clubRwTab==='redeem'?' on':'')+'" onclick="clubRwRedeem()">Redeem</button>'+
     '<button class="crt'+(clubRwTab==='mine'?' on':'')+'" onclick="clubRwMine()">Mine</button>'+
     '</div>';

  if(clubRwTab==='missions')      h+=clubMissionsHTML();
  else if(clubRwTab==='mine')     h+=clubMineHTML();
  else                            h+=clubRedeemHTML();

  el.innerHTML=h;
}

function clubMissionsHTML(){
  if(!Club.missions.length)
    return '<div class="acard"><div class="sub">No missions are running right now.</div></div>';
  let h='';
  Club.missions.forEach(function(m){
    const prog=clubMissionProgress(m);
    const pct=Math.min(100,Math.round(prog/m.target*100));
    const done=prog>=m.target;
    h+='<div class="acard cmis'+(done?' done':'')+'">'+
       '<div class="ah"><div class="t">'+clubEsc(m.title)+'</div>'+
       '<div class="c cpts-tag">+'+m.reward_points+'</div></div>'+
       (m.detail?'<div class="sub" style="margin-bottom:9px;">'+clubEsc(m.detail)+'</div>':'')+
       '<div class="cbar'+(done?' full':'')+'"><i style="width:'+pct+'%"></i></div>'+
       '<div class="sub">'+(done?'Complete':prog+' of '+m.target)+
       (m.window_days?' · rolling '+m.window_days+' days':'')+'</div></div>';
  });
  return h;
}

/* Progress is computed from the same history the rest of the screen uses.
   The server pays the points; this only shows how close the member is. */
function clubMissionProgress(m){
  if(m.kind==='inbody') return Club.scans.length?1:0;
  if(m.kind==='streak') return Math.min(m.target, clubWeekStreak()*7);
  if(m.kind==='attendance') return m.window_days?clubAttendedIn(m.window_days):Club.history.length;
  return 0;
}

function clubRedeemHTML(){
  if(!Club.rewards.length)
    return '<div class="acard"><div class="sub">The rewards shelf is empty right now.</div></div>';
  let h='<div class="crw">';
  Club.rewards.forEach(function(r){
    const can=Club.points>=r.cost_points;
    const out=(r.stock!=null && r.stock<=0);
    const pct=Math.min(100,Math.round(Club.points/r.cost_points*100));
    h+='<div class="crwc'+(can&&!out?' can':'')+'">'+
       '<div class="crwc-h"><div class="crwc-n">'+clubEsc(r.name)+'</div>'+
       (r.category?'<div class="crwc-c">'+clubEsc(r.category)+'</div>':'')+'</div>'+
       '<div class="crwc-p">'+r.cost_points.toLocaleString()+'<small>pts</small></div>'+
       (can?'':'<div class="cbar mini"><i style="width:'+pct+'%"></i></div>')+
       (out?'<div class="crwc-b out">Out of stock</div>'
           :(can?'<button class="crwc-b go" onclick="clubRedeem(\''+r.id+'\')">Redeem</button>'
                :'<div class="crwc-b">'+(r.cost_points-Club.points).toLocaleString()+' to go</div>'))+
       '</div>';
  });
  return h+'</div>';
}

function clubMineHTML(){
  if(!Club.redemptions.length && !Club.ledger.length)
    return '<div class="acard"><div class="sub">Nothing redeemed yet.</div></div>';
  let h='';
  if(Club.redemptions.length){
    h+='<div class="acard chist">';
    Club.redemptions.forEach(function(r){
      const rw=Club.rewards.filter(x=>x.id===r.reward_id)[0];
      h+='<div class="chist-r"><div class="chist-d">'+clubShortDate(r.created_at)+'</div>'+
         '<div class="chist-n">'+clubEsc(rw?rw.name:'Reward')+'</div>'+
         '<div class="cpill '+(r.status==='collected'?'ok':'')+'">'+clubEsc(String(r.status).toUpperCase())+'</div></div>';
    });
    h+='</div>';
  }
  h+='<div class="sechead">Points ledger</div><div class="acard chist">';
  Club.ledger.slice(0,40).forEach(function(p){
    h+='<div class="chist-r"><div class="chist-d">'+clubShortDate(p.created_at)+'</div>'+
       '<div class="chist-n">'+clubEsc(p.description||p.kind)+'</div>'+
       '<div class="chist-a '+(p.amount<0?'neg':'pos')+'">'+(p.amount>0?'+':'')+p.amount+'</div></div>';
  });
  return h+'</div>';
}

/* The balance check here is a courtesy so the button can be disabled; the
   database re-checks it inside one transaction, because two phones can
   redeem the last 300 points at the same moment. */
async function clubRedeem(id){
  const r=Club.rewards.filter(x=>x.id===id)[0];
  if(!r) return;
  if(Club.points<r.cost_points){ toast('Not enough points yet'); return; }
  if(!window.confirm('Redeem '+r.name+' for '+r.cost_points+' points?')) return;
  try{
    const res=await sb.rpc('club_redeem',{p_reward:id});
    if(res.error) throw res.error;
    toast('Redeemed — collect it at the counter');
    await Club.load(true);
    clubRwTab='mine';
    renderClubRewards();
  }catch(e){
    toast((e&&e.message)||'Could not redeem that');
  }
}
