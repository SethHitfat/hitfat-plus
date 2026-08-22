var CHALLENGES = [
  {
    id:'c1', name:'7-Day Shred', period:'WEEKLY', days:7, dur:15,
    c1:'#3a1f1f', c2:'#0d0808', ac:'#FF3B30', icon:'🔥',
    desc:'One quick fat-burning session every day for 7 days straight. Build the habit, feel the burn.',
    weeks: challengeWeeks(7, [
      ['Jumping Jack','Bodyweight Squat','High Knee','Push Up','Mountain Climber','Burpee'],
      ['Squat Jump','Walking Lunges','Push Up','Plank','Skater Jump','Half Burpee'],
      ['High Knee','Burpee','Mountain Climber','Bicycle Crunch','Tuck Jump','Fast Feet'],
      ['Bodyweight Squat','Wide Push Up','Reverse Lunges','Plank','Jumping Jack','Burpee'],
      ['Squat Jump','Push Up','Lunges Jump','Mountain Climber','High Knee','Plank Jack'],
      ['Burpee','Skater Jump','Diamond Push Up','Russian Twist','Tuck Jump','Bear Walk'],
      ['Jumping Jack','Squat Jump','Push Up','Walking Lunges','Mountain Climber','Burpee']
    ], 0)
  },
  {
    id:'c2', name:'30-Day Core', period:'MONTHLY', days:30, dur:12,
    c1:'#16273a', c2:'#080b0d', ac:'#00B8FF', icon:'💎',
    desc:'A daily core challenge that gets harder each week. 30 days to carve out a stronger, tighter core.',
    weeks: challengeWeeks(30, [
      ['Crunch','Plank','Dead Bug','Bird Dog'],
      ['Bicycle Crunch','Side Plank','Leg Raises','Plank'],
      ['Russian Twist','Hollow Hold','Crunch','Mountain Climber'],
      ['Flutter Kick','V Sit Squat','Plank Shoulder Taps','Bicycle Crunch'],
      ['Leg Raises','Side Plank','Hollow Hold','Reverse Crunch'],
      ['Russian Twist','V Sit Squat','Flutter Kick','Plank'],
      ['Bicycle Crunch','Hollow Hold','Leg Raises','Side Plank','Mountain Climber']
    ], 7)
  },
  {
    id:'c3', name:'21-Day Strong', period:'MONTHLY', days:21, dur:20,
    c1:'#3a2a18', c2:'#0d0a06', ac:'#FF6B00', icon:'💯',
    desc:'Three weeks to build full-body strength. A different focus each day, progressively harder.',
    weeks: challengeWeeks(21, [
      ['Bodyweight Squat','Walking Lunges','Hip Thrust','Calf Raises','Squat Pulse'],
      ['Push Up','Wide Push Up','Diamond Push Up','Tricep Dip Chair','Push Up Hold'],
      ['Plank','Bicycle Crunch','Russian Twist','Leg Raises','Hollow Hold'],
      ['Squat Jump','Bulgarian Split Squat','Broad Jump','Wall Sit','Calf Raises'],
      ['Explosive Push Up','Push Up','Bottle Shoulder Press','Bottle Bent Over Row','Tricep Dip Chair'],
      ['Burpee','Squat Jump','Push Up','Walking Lunges','Plank','Mountain Climber']
    ], 7)
  }
];


function progEq(p){
  var n=(p&&p.name)||'';
  if(/Kettlebell|KB /i.test(n)) return 'Kettlebell';
  if(/Dumbbell/i.test(n))       return 'Dumbbell';
  if(/Chair/i.test(n))          return 'Chair';
  if(/Towel/i.test(n))          return 'Towel';
  if(/Bottle/i.test(n))         return 'Bottle';
  return null;
}
function pickEx(names,eq){
  return names.map(function(n){
    var e = eq && DB.find(function(x){return x.n===n && x.eq===eq;});
    if(!e) e = DB.find(function(x){return x.n===n;});
    if(!e) console.warn('[HITFAT+] unknown exercise name:',n);
    return e||DB[0];
  });
}

/* ── STORE — Hybrid's HF, its own namespace so the two apps cannot collide ── */
const HF={
  KEY:'hitfat_plus_v1', TABLE:'plus_data',
  userId:null,email:null,data:null,_t:null,
  _defaults(){ return { onboarded:false,readiness:false,prefs:{},sessions:{},progress:{},
    weight:[],meals:{},burn:{},favs:[],custom:null,nutrition:{},scanQuota:{used:0,month:''},owned:{},purchases:[],
    streak:0,lastISO:null,weekGoal:5,note:'',mealPlans:[],wc:0,
    body:[],goalKg:null,
    challengeJoined:{},badges:{} }; },
  cacheKey(){ return this.KEY+(this.userId?'_'+this.userId:''); },
  setUser(id,email){ this.userId=id||null; this.email=email||null; },
  apply(o){
    const d=this._defaults();
    if(o&&typeof o==='object'){
      d.onboarded=!!o.onboarded; d.readiness=!!o.readiness;
      d.prefs=Object.assign({},o.prefs||{}); d.sessions=Object.assign({},o.sessions||{});
      d.progress=Object.assign({},o.progress||{}); d.weight=Array.isArray(o.weight)?o.weight.slice():[];
      d.body=Array.isArray(o.body)?o.body.slice():[]; d.goalKg=(typeof o.goalKg==='number')?o.goalKg:null;
      d.meals=Object.assign({},o.meals||{}); d.burn=Object.assign({},o.burn||{});
      d.favs=Array.isArray(o.favs)?o.favs.slice():[]; d.custom=o.custom||null;
      d.nutrition=Object.assign({},o.nutrition||{});
      d.scanQuota=Object.assign({used:0,month:''},o.scanQuota||{});
      d.owned=Object.assign({},o.owned||{}); d.purchases=Array.isArray(o.purchases)?o.purchases.slice():[];
      d.streak=o.streak||0; d.lastISO=o.lastISO||null; d.weekGoal=o.weekGoal||5; d.note=o.note||'';
      d.mealPlans=Array.isArray(o.mealPlans)?o.mealPlans.slice():[]; d.wc=o.wc||0;
      d.challengeJoined=Object.assign({},o.challengeJoined||{}); d.badges=Object.assign({},o.badges||{});
    }
    this.data=d;
  },
  load(){ try{ const r=localStorage.getItem(this.cacheKey()); this.apply(r?JSON.parse(r):null); }catch(e){ this.apply(null); } },
  save(){ try{ localStorage.setItem(this.cacheKey(),JSON.stringify(this.data)); }catch(e){} this.pushCloud(); },
  pushCloud(){
    if(!sb||!this.userId) return;
    clearTimeout(this._t);
    this._t=setTimeout(()=>{
      sb.from(this.TABLE).upsert({user_id:this.userId,data:this.data,updated_at:new Date().toISOString()},{onConflict:'user_id'})
        .then(r=>{ if(r&&r.error) console.warn('cloud save failed',r.error.message); });
    },700);
  },
  async pull(){
    if(!sb||!this.userId){ this.load(); return; }
    try{
      const {data,error}=await sb.from(this.TABLE).select('data').eq('user_id',this.userId).maybeSingle();
      if(error) throw error;
      if(data&&data.data){ this.apply(data.data); try{ localStorage.setItem(this.cacheKey(),JSON.stringify(this.data)); }catch(e){} }
      else { this.load(); this.pushCloud(); }
    }catch(e){ console.warn('cloud pull failed — using local cache',e.message||e); this.load(); }
  },
  markDone(key,meta){ this.data.sessions[key]=Object.assign({date:new Date().toISOString()},meta||{}); bumpStreak(); this.save(); },
  undone(key){ delete this.data.sessions[key]; this.save(); },
  isDone(key){ return !!this.data.sessions[key]; },
  count(){ return Object.keys(this.data.sessions).length; }
};

function iso(off){ const d=new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate()+(off||0));
  return localISO(d); }
function daysBetween(a,b){ return Math.round((new Date(b+'T00:00:00')-new Date(a+'T00:00:00'))/86400000); }
function weekStartISO(s){ const d=new Date((s||iso(0))+'T00:00:00'); d.setDate(d.getDate()-((d.getDay()+6)%7));
  return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2); }
function bumpStreak(){
  const t=iso(0), last=HF.data.lastISO;
  if(last===t) return;
  HF.data.streak=(last&&daysBetween(last,t)===1)?(HF.data.streak||0)+1:1;
  HF.data.lastISO=t;
}
function liveStreak(){ const l=HF.data.lastISO; return (l&&daysBetween(l,iso(0))<=1)?(HF.data.streak||0):0; }
/* Local calendar date, not UTC. iso() works in local time, so comparing it
   against a UTC slice broke every session logged between midnight and 08:00
   in Malaysia (UTC+8): the session was stamped yesterday, doneToday() said
   no, and the streak reset on the people training earliest. */
function localISO(d){ return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2); }
function sessionISO(s){ try{ const d=new Date(s.date); return isNaN(d.getTime())?null:localISO(d); }catch(e){ return null; } }
function daysThisWeek(){ const ws=weekStartISO(), seen={};
  Object.values(HF.data.sessions).forEach(s=>{ const d=sessionISO(s); if(d&&d>=ws) seen[d]=1; });
  return Object.keys(seen).length; }
function doneToday(){ const t=iso(0); return Object.values(HF.data.sessions).some(s=>sessionISO(s)===t); }

/* ── PANELS — never hand-write a hide list ── */
const PANELS=['home','train','eat','progress','me','progdetail','daydetail','library','mealplan','store','monthly','club'];
function hidePanels(){ PANELS.forEach(id=>{ const e=$(id); if(e) e.style.display='none'; }); }
let curTab='home';
function switchTab(tab){
  curTab=tab; hidePanels();
  $('tabs').style.display='flex';
  const p=$(tab); if(p) p.style.display='block';
  ['home','train','eat','progress','me'].forEach(t=>{ const b=$('tab-'+t); if(b) b.classList.toggle('active',t===tab); });
  if(tab==='home') renderHome();
  if(tab==='train') renderTrain();
  if(tab==='eat') renderEat();
  if(tab==='progress') renderProgress();
  if(tab==='me') renderMe();
  $('screen').scrollTop=0;
}
/* colour helper — used by status pills and any tinted surface */
function hexA(hex,a){ hex=String(hex||'#EF4444').replace('#','');
  if(hex.length===3) hex=hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
  return 'rgba('+parseInt(hex.substr(0,2),16)+','+parseInt(hex.substr(2,2),16)+','+parseInt(hex.substr(4,2),16)+','+a+')'; }
function progDays(p){ let n=0; (p.weeks||[]).forEach(w=>w.days.forEach(()=>n++)); return n; }
function progDone(id){ return HF.data.progress[id]||0; }

