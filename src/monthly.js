/* ═══════════════ MONTHLY CHALLENGE ═══════════════
   FitON keeps people coming back by having something new every month. The
   cheapest honest way to do that is a calendar rotation: twelve challenges,
   one per month, picked by the date. Nothing to deploy, nothing to remember,
   and it is already correct on the first of every month.

   It repeats after a year. That is a real limit and it is fine — a year from
   now there will be more to add, and adding one is a single line here.

   Progress is DERIVED from sessions the user already logged, not tracked
   separately. There is no second counter to drift, no way to be "on" the
   challenge but show zero, and joining late still counts the days already
   trained this month.                                                       */

const MONTHLY=[
  {m:0,  n:'New Year Reset',      e:'❄️', target:16, d:'A start you can actually keep. Sixteen days moving, no heroics.'},
  {m:1,  n:'Short Month, No Excuses', e:'⚡', target:14, d:'The shortest month. Fourteen days is half of it — that is the whole point.'},
  {m:2,  n:'Strong March',        e:'💪', target:16, d:'Build something. Lean on the strength sessions this month.'},
  {m:3,  n:'Move Every Other Day',e:'🌤️', target:15, d:'One on, one off, all month. The rhythm that survives a busy life.'},
  {m:4,  n:'May Momentum',        e:'🔥', target:18, d:'Eighteen days. This is the month you find out what consistent feels like.'},
  {m:5,  n:'Halfway Strong',      e:'🎯', target:16, d:'Six months in. Prove the first half was not a fluke.'},
  {m:6,  n:'July Sweat',          e:'☀️', target:18, d:'Hot month, short sessions, more of them.'},
  {m:7,  n:'Back to Basics',      e:'🧱', target:16, d:'Foundations again. Everyone drifts; this is the month to tidy up.'},
  {m:8,  n:'September Rebuild',   e:'🛠️', target:17, d:'The real new year. Rebuild the habit before the year runs out.'},
  {m:9,  n:'Consistency October', e:'📈', target:20, d:'Twenty days. The hardest one here, and the one that changes people.'},
  {m:10, n:'No-Skip November',    e:'🌧️', target:18, d:'The month motivation dies. Turn up anyway.'},
  {m:11, n:'Finish the Year',     e:'🏁', target:15, d:'Fifteen days through the busiest month. End it standing.'}
];

function monthKey(d){ d=d||new Date(); return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2); }
function thisChallenge(d){ d=d||new Date(); return MONTHLY[d.getMonth()]; }
function monthName(d){ d=d||new Date(); return d.toLocaleDateString('en-MY',{month:'long'}); }
function daysInMonth(d){ d=d||new Date(); return new Date(d.getFullYear(), d.getMonth()+1, 0).getDate(); }
function daysLeftInMonth(d){ d=d||new Date(); return daysInMonth(d)-d.getDate()+1; }

/* Distinct days trained inside a given month, read from the sessions the user
   already logged. Local dates, matching everything else in the app. */
function trainedDaysIn(key){
  key=key||monthKey();
  const seen={};
  Object.values(HF.data.sessions||{}).forEach(s=>{
    const iso=sessionISO(s);
    if(iso && iso.slice(0,7)===key) seen[iso]=1;
  });
  return Object.keys(seen).sort();
}
function challengeProgress(key){
  key=key||monthKey();
  const c=thisChallenge(key===monthKey()?null:new Date(key+'-01T00:00:00'));
  const days=trainedDaysIn(key);
  return {key, c, days, done:days.length, target:c.target,
          pct:Math.min(100,Math.round(days.length/c.target*100)),
          complete:days.length>=c.target};
}

function joinedChallenge(key){ return !!(HF.data.challengeJoined||{})[key||monthKey()]; }
function joinChallenge(){
  const k=monthKey();
  HF.data.challengeJoined=Object.assign({},HF.data.challengeJoined||{});
  HF.data.challengeJoined[k]=new Date().toISOString();
  HF.save();
  toast("You're in — every session this month counts");
  renderMonthly();
}

/* A month is banked the moment it is finished, so a completed challenge stays
   on the shelf after the calendar moves on. */
function bankMonth(){
  const p=challengeProgress();
  if(!p.complete) return false;
  const b=Object.assign({},HF.data.badges||{});
  if(b[p.key]) return false;
  b[p.key]={name:p.c.n, icon:p.c.e, days:p.done, target:p.target};
  HF.data.badges=b; HF.save();
  return true;
}
function earnedBadges(){
  const b=HF.data.badges||{};
  return Object.keys(b).sort().reverse().map(k=>Object.assign({key:k},b[k]));
}

/* ── the card that lives on Home ── */
function monthlyCard(){
  const p=challengeProgress(), left=daysLeftInMonth();
  return '<div class="mcard" onclick="openMonthly()">'+
    '<div class="mtop"><span class="me">'+p.c.e+'</span>'+
    '<span class="mtag">'+monthName().toUpperCase()+' CHALLENGE</span></div>'+
    '<div class="mn">'+p.c.n+'</div>'+
    '<div class="mbar"><i style="width:'+p.pct+'%"></i></div>'+
    '<div class="mrow"><span>'+p.done+' of '+p.target+' days</span>'+
    '<span>'+(p.complete?'Done ✓':(left+' day'+(left>1?'s':'')+' left'))+'</span></div>'+
    '</div>';
}

/* ── the panel ── */
function openMonthly(){
  hidePanels(); $('monthly').style.display='block';
  renderMonthly(); $('screen').scrollTop=0;
}
function renderMonthly(){
  const p=challengeProgress(), left=daysLeftInMonth(), n=daysInMonth();
  const trained={}; p.days.forEach(d=>trained[Number(d.slice(-2))]=1);
  const today=new Date().getDate();
  bankMonth();

  let h='';
  h+='<div class="ehero"><div class="k">'+monthName().toUpperCase()+' CHALLENGE</div>'+
     '<div class="row"><div style="flex:1;min-width:0;">'+
     '<div class="n" style="font-size:46px;">'+p.c.e+' '+p.c.n+'</div>'+
     '<div class="u">'+p.c.d+'</div></div></div>'+
     '<div class="sp">'+
     [[p.done,'Days done'],[p.target,'Target'],[p.complete?'✓':left,p.complete?'Complete':'Days left']]
       .map(x=>'<div><div class="v">'+x[0]+'</div><div class="l">'+x[1]+'</div></div>').join('')+
     '</div></div>';

  h+='<div class="mbar" style="margin-top:14px;"><i style="width:'+p.pct+'%"></i></div>'+
     '<div class="mrow" style="margin-top:8px;"><span>'+p.pct+'% there</span>'+
     '<span>'+Math.max(0,p.target-p.done)+' to go</span></div>';

  if(p.complete)
    h+='<div class="mpnote" style="border-color:rgba(46,194,126,.35);color:var(--ok);">'+
       'Challenge complete. It is on your shelf below and stays there.</div>';
  else if(!joinedChallenge())
    h+='<button class="bigbtn" onclick="joinChallenge()">Join '+monthName()+'</button>';
  else
    h+='<div class="mpnote">You are in. Every session you log this month counts — nothing else to press.</div>';

  h+=fsec('This month','A square fills in on any day you train');
  h+='<div class="mgrid">';
  for(let d=1; d<=n; d++){
    const cls = trained[d] ? 'on' : (d===today ? 'now' : (d<today ? 'miss' : ''));
    h+='<div class="mday '+cls+'">'+d+'</div>';
  }
  h+='</div>';

  h+=fsec('How it works','');
  h+='<div class="flib">'+[
      ['📅','A new challenge every month','It changes by itself on the first'],
      ['🏃','Any session counts','Program day, single session, BAR, recovery — all of it'],
      ['🎖️','Finish it and keep it','Completed months stay on your shelf'],
      ['🆓','Free for everyone','No purchase, nothing locked']
    ].map(x=>'<div class="row" style="cursor:default;"><div class="ic">'+x[0]+'</div>'+
      '<div style="flex:1;"><div style="font-size:15px;font-weight:600;color:var(--txt);">'+x[1]+'</div>'+
      '<div style="font-size:13px;color:var(--dim);margin-top:3px;">'+x[2]+'</div></div></div>').join('')+'</div>';

  const b=earnedBadges();
  if(b.length){
    h+=fsec('Your shelf',b.length+' challenge'+(b.length>1?'s':'')+' finished');
    h+='<div class="mbadges">'+b.map(x=>
      '<div class="mbadge"><div class="e">'+x.icon+'</div><div class="t">'+x.name+'</div>'+
      '<div class="m">'+x.days+'/'+x.target+' days</div></div>').join('')+'</div>';
  }

  h+=fsec('The year ahead','');
  h+='<div class="flib">'+MONTHLY.map((c,i)=>{
      const cur=i===new Date().getMonth();
      return '<div class="row" style="cursor:default;'+(cur?'':'opacity:.55;')+'">'+
        '<div class="ic">'+c.e+'</div>'+
        '<div style="flex:1;"><div style="font-size:15px;font-weight:600;color:'+(cur?'var(--hyrox)':'#fff')+';">'+
        new Date(2000,i,1).toLocaleDateString('en-MY',{month:'long'})+' · '+c.n+'</div></div>'+
        '<div class="ct">'+c.target+'d</div></div>';
    }).join('')+'</div>';

  $('mth-body').innerHTML=h;
}


