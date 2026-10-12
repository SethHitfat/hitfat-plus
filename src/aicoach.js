/* ═══════════════ AI COACH ═══════════════
   Every HITFAT+ member (Plus or Coach) gets a coach that is an AI (ai-coach edge
   function, 36-plus-ai-coach.sql), working the way TrainHeroic's coaches
   do: a plan written for the member, followed with the app's own filmed
   videos, logged after each session, reviewed each week, with the next
   week rewritten to suit how this one went.

   1. Answers: goal, level, days a week, minutes, equipment, limitations.
   2. A 4-week plan, generated from the filmed library only.
   3. Today's session on Home and here; played in the usual player.
   4. A log after each session: reps and kg per move, effort 1-10, a note.
   5. A weekly review: the coach's note, and next week adjusted.
   6. Questions, answered with the plan and the logs in view.

   The plan lives in plus_coach_plans on the server and is cached in
   HF.data.coach, with the logs and the conversation.

   In demo mode (?demo) nothing reaches the server or the member's data:
   the plan is put together here from the library, the coach's words are
   written in advance, and it all lives only on screen. */

const AIC_GOALS=[['lose','Lose fat','flame'],['muscle','Build muscle','workout'],['fit','Get fitter','bolt'],['strong','Get stronger','trophy'],['move','Move better','leaf']];
const AIC_LEVELS=['Beginner','Intermediate','Advanced'];
const AIC_EQUIP=['Bodyweight','Dumbbell','Kettlebell','Chair','Towel','Bottle'];
const AIC_LIMITS=[['knee','Knees'],['back','Lower back'],['shoulder','Shoulders'],['wrist','Wrists']];
let aicView=null, aicBusy='', aicWeek=-1, _aicForm=null;

function aicFn(){ return SUPA_URL+'/functions/v1/ai-coach'; }
let _aicDemo=null;
function aicIsDemo(){ return typeof T42_DEMO!=='undefined' && !!T42_DEMO; }
function aicStore(){ return aicIsDemo() ? (_aicDemo||(_aicDemo={})) : (HF.data.coach||(HF.data.coach={})); }
function aicSave(){ if(!aicIsDemo()) aicSave(); }
function aicData(){
  const c=aicStore();
  c.done=c.done||{}; c.feed=c.feed||[]; c.reviewed=c.reviewed||{};
  return c;
}
function aicPlan(){ const c=aicStore(); return c && c.plan && Array.isArray(c.plan.weeks) ? c.plan : null; }
/* the plan's week today: one per 7 days from when it was made, 0 to 3 */
function aicWeekNow(){
  const c=aicData(); if(!c.start) return 0;
  return Math.max(0, Math.min(3, Math.floor(daysBetween(c.start, iso(0))/7)));
}
function aicFinished(){ const c=aicData(); return !!c.start && daysBetween(c.start, iso(0))>=28; }
function aicKey(w,d){ return w+'-'+d; }
function aicDone(w,d){ return !!aicData().done[aicKey(w,d)]; }
/* the next session: the first not done in this week */
function aicNext(){
  const p=aicPlan(); if(!p) return null;
  const w=aicWeekNow(), wk=p.weeks[w]; if(!wk) return null;
  for(let d=0; d<wk.days.length; d++) if(!aicDone(w,d)) return {w,d,day:wk.days[d]};
  return null;
}
function aicBlockLine(b){ return b.sets+' × '+(b.secs?b.secs+'s':b.reps)+(b.rest?' · rest '+b.rest+'s':''); }

/* what the coach may choose from: filmed, matching the member's equipment */
function aicLibrary(intake){
  const eq=new Set(['Bodyweight'].concat((intake&&intake.equipment)||[]));
  const seen={}, out=[];
  DB.forEach(e=>{
    if(!e.v || e.j || (typeof BAR_EQ!=='undefined' && e.eq===BAR_EQ) || !eq.has(e.eq) || seen[e.n]) return;
    seen[e.n]=1; out.push(e.n+'|'+e.eq+'|'+e.t+'|'+e.m);
  });
  return out;
}

/* ── talking to the coach ── */
async function aicCall(payload){
  const tk=await scanToken();
  if(!tk) throw Object.assign(new Error('Sign in to talk to your coach.'),{code:'auth'});
  const r=await fetch(aicFn(),{method:'POST',
    headers:{'Content-Type':'application/json','Authorization':'Bearer '+tk,'apikey':SUPA_KEY},
    body:JSON.stringify(payload)});
  const j=await r.json().catch(()=>({}));
  if(!r.ok) throw Object.assign(new Error(j.error||'The coach could not answer.'),{code:j.code});
  return j;
}
function aicSay(from,text){
  const c=aicData(); c.feed.push({from, text:String(text||''), at:new Date().toISOString()});
  c.feed=c.feed.slice(-60); aicSave();
}

/* ── the page ── */
function openAICoach(){ hidePanels(); $('aicoach').style.display='block'; aicView=null; renderAICoach(); $('screen').scrollTop=0; }
function renderAICoach(){
  const el=$('aic-body'); if(!el) return;
  if(aicBusy==='plan'){ el.innerHTML=aicWorking('Your coach is building your plan','Choosing from '+aicLibrary(_aicForm||{}).length+' filmed movements to fit your answers. Up to a minute.'); return; }
  if(aicView) return aicDayPage(aicView.w,aicView.d);
  const p=aicPlan();
  if(!p || aicData().redo) return aicIntake();
  el.innerHTML=aicHome(p);
}
function aicWorking(t,s){
  return '<div class="aic-work"><div class="aic-orb"><i></i><i></i><i></i></div><div class="t">'+t+'</div><div class="s">'+s+'</div></div>';
}

/* answers, all on one page */
function aicIntake(){
  const c=aicData(), n=HF.data.nutrition||{}, prefs=HF.data.prefs||{};
  const f=_aicForm||(_aicForm=Object.assign({goal:'lose', level:prefs.level||'Beginner', days:3, minutes:30,
      equipment:['Bodyweight'], limits:[], notes:''}, c.intake||{}));
  const chip=(on,label,go)=>'<button class="aic-chip'+(on?' on':'')+'" onclick="'+go+'">'+label+'</button>';
  let h='<div class="aic-hero">'+aicMark()+'<div class="k">HITFAT+</div><div class="t">Your AI Coach</div>'+
    '<div class="s">Answer a few questions. Your coach writes a 4-week plan for you from HITFAT\'s filmed workouts, '+
    'then reads your logs every week and adjusts what comes next.</div></div>';
  h+='<div class="aic-q">Your goal</div><div class="aic-chips">'+AIC_GOALS.map(g=>chip(f.goal===g[0],glyph(g[2])+g[1],"aicSet('goal','"+g[0]+"')")).join('')+'</div>';
  h+='<div class="aic-q">Your level</div><div class="aic-chips">'+AIC_LEVELS.map(l=>chip(f.level===l,l,"aicSet('level','"+l+"')")).join('')+'</div>';
  h+='<div class="aic-q">Days a week</div><div class="aic-chips">'+[2,3,4,5,6].map(d=>chip(f.days===d,String(d),"aicSet('days',"+d+")")).join('')+'</div>';
  h+='<div class="aic-q">Minutes a session</div><div class="aic-chips">'+[15,20,30,45].map(m=>chip(f.minutes===m,m+' min',"aicSet('minutes',"+m+")")).join('')+'</div>';
  h+='<div class="aic-q">What you have <small>bodyweight is always in</small></div><div class="aic-chips">'+
     AIC_EQUIP.filter(e=>e!=='Bodyweight').map(e=>chip(f.equipment.indexOf(e)>=0,e,"aicToggle('equipment','"+e+"')")).join('')+'</div>';
  h+='<div class="aic-q">Anything that hurts or to go easy on</div><div class="aic-chips">'+
     AIC_LIMITS.map(l=>chip(f.limits.indexOf(l[0])>=0,l[1],"aicToggle('limits','"+l[0]+"')")).join('')+'</div>';
  h+='<div class="aic-q">Anything else your coach should know <small>optional</small></div>'+
     '<textarea id="aic-notes" class="aic-notes" rows="3" maxlength="300" placeholder="e.g. I work shifts, I want to run a 5K, I had a baby last year">'+hesc(f.notes||'')+'</textarea>';
  if(!n.w) h+='<div class="aic-fine">Set your daily target in Eat too: your coach uses your weight and height.</div>';
  h+='<button class="bigbtn" onclick="aicGenerate()">'+(aicPlan()?'Build My New Plan':'Build My Plan')+'</button>';
  if(aicPlan()) h+='<button class="authalt" onclick="aicData().redo=false;renderAICoach()">Keep my current plan</button>';
  h+='<div class="aic-fine">Your coach is an AI. It does not diagnose injuries: if something hurts, stop that movement and see a doctor or physiotherapist.</div>';
  $('aic-body').innerHTML=h;
}
function aicSet(k,v){ _aicForm[k]=v; aicKeepNotes(); aicIntake(); }
function aicToggle(k,v){ const a=_aicForm[k]; const i=a.indexOf(v); if(i>=0) a.splice(i,1); else a.push(v); aicKeepNotes(); aicIntake(); }
function aicKeepNotes(){ const t=$('aic-notes'); if(t && typeof t.value==='string') _aicForm.notes=t.value.slice(0,300); }

async function aicGenerate(){
  aicKeepNotes();
  const n=HF.data.nutrition||{};
  const intake=Object.assign({}, _aicForm, {
    sex:n.gender||null, age:n.a||null, weight_kg:n.w||null, height_cm:n.h||null,
    first_name:((HF.data.prefs&&HF.data.prefs.name)||'').split(' ')[0]||null});
  aicBusy='plan'; renderAICoach(); $('screen').scrollTop=0;
  try{
    const r=aicIsDemo() ? await aicDemoWait({id:'demo', plan:aicDemoPlan(intake)})
                        : await aicCall({action:'plan', intake, library:aicLibrary(intake)});
    const c=aicData();
    c.intake=_aicForm; c.plan=r.plan; c.planId=r.id; c.start=iso(0);
    c.done={}; c.reviewed={}; c.redo=false;
    if(r.plan.coach_note) aicSay('coach', r.plan.coach_note);
    aicSave(); aicWeek=-1;
    toast('Your plan is ready');
  }catch(e){
    if(e.code==='not_coach'){ aicBusy=''; renderAICoach(); pwTier='plus'; openPaywall('Your AI coach comes with HITFAT+.'); return; }
    toast(e.message||'The coach could not build a plan. Try again.');
  }
  aicBusy=''; renderAICoach();
}

/* the plan: today, the coach's latest word, the weeks, the review, a question */
function aicHome(p){
  const c=aicData(), w=aicWeekNow(), nx=aicNext();
  if(aicWeek<0) aicWeek=w;
  let h='<div class="aic-hero sm">'+aicMark()+'<div class="k">Your AI Coach · Week '+(w+1)+' of 4</div>'+
    '<div class="t">'+hesc(p.title)+'</div><div class="s">'+hesc(p.weeks[w]&&p.weeks[w].focus||p.summary||'')+'</div></div>';
  if(aicFinished()){
    h+='<div class="aic-today done"><div class="k">Plan complete</div><div class="t">Four weeks done</div>'+
       '<div class="s">Answer again and your coach builds the next four, harder where you are ready.</div>'+
       '<button class="bigbtn" onclick="aicRedo()">Build My Next Plan</button></div>';
  } else if(nx){
    h+='<div class="aic-today" onclick="aicOpenDay('+nx.w+','+nx.d+')"><div class="k">Today from your coach</div>'+
       '<div class="t">'+hesc(nx.day.name)+'</div><div class="s">'+nx.day.minutes+' min · '+nx.day.blocks.length+' moves · day '+(nx.d+1)+' of '+p.weeks[nx.w].days.length+' this week</div>'+
       '<button class="bigbtn" onclick="event.stopPropagation();aicPlay('+nx.w+','+nx.d+')">'+glyph('play')+'Start</button></div>';
  } else {
    h+='<div class="aic-today done"><div class="k">This week</div><div class="t">Every session done</div>'+
       '<div class="s">'+(c.reviewed[w]?'Your coach has reviewed this week. Next week starts on its own.':'Ask your coach to review the week, and next week will be set to match.')+'</div></div>';
  }
  /* the review, once there is something to review */
  const doneThisWeek=(p.weeks[w]&&p.weeks[w].days||[]).filter((_,d)=>aicDone(w,d)).length;
  if(doneThisWeek && !c.reviewed[w])
    h+='<button class="bigbtn sec aic-rv" onclick="aicReview('+w+')" '+(aicBusy==='review'?'disabled':'')+'>'+
       (aicBusy==='review'?'Your coach is reading your week…':glyph('chart')+'Review week '+(w+1)+' with your coach')+'</button>';

  /* the conversation */
  const feed=c.feed.slice(-6);
  if(feed.length){
    h+=fsec('From your coach','');
    h+='<div class="aic-feed">'+feed.map(m=>'<div class="aic-msg '+(m.from==='me'?'me':'coach')+'">'+
      (m.from==='me'?'':aicMark())+'<div class="b">'+hesc(m.text).replace(/\n/g,'<br>')+'</div></div>').join('')+'</div>';
  }
  h+='<div class="aic-ask"><input id="aic-q" maxlength="500" placeholder="Ask your coach anything" onkeydown="if(event.key===\'Enter\')aicAsk()">'+
     '<button onclick="aicAsk()" '+(aicBusy==='ask'?'disabled':'')+'>'+(aicBusy==='ask'?'…':'Ask')+'</button></div>';

  /* the four weeks */
  h+=fsec('Your 4 Weeks',hesc(p.summary||''));
  h+='<div class="filters">'+p.weeks.map((x,i)=>'<button class="chip'+(i===aicWeek?' y':'')+'" onclick="aicWeek='+i+';renderAICoach()">Week '+(i+1)+'</button>').join('')+'</div>';
  const wk=p.weeks[aicWeek]||p.weeks[0];
  h+='<div class="aic-wf">'+hesc(wk.focus||'')+'</div><div class="pdx-eps">'+wk.days.map((d,i)=>{
    const dn=aicDone(aicWeek,i);
    return '<div class="aic-day'+(dn?' done':'')+'" onclick="aicOpenDay('+aicWeek+','+i+')">'+
      '<span class="n">'+(dn?glyph('check'):(i+1))+'</span><div class="tx"><div class="t">'+hesc(d.name)+'</div>'+
      '<div class="m">'+d.minutes+' min · '+d.blocks.length+' moves'+(dn&&c.done[aicKey(aicWeek,i)].rpe?' · effort '+c.done[aicKey(aicWeek,i)].rpe+'/10':'')+'</div></div><span class="pdx-chev">›</span></div>';
  }).join('')+'</div>';
  h+='<button class="authalt" onclick="aicRedo()">Start again with new answers</button>';
  return h;
}
function aicRedo(){ aicData().redo=true; aicView=null; _aicForm=null; renderAICoach(); $('screen').scrollTop=0; }
function aicMark(){ return '<span class="aic-av" aria-hidden="true"><img src="/img/brand/hf-mark.png" alt=""></span>'; }

/* a day: its moves, each with its video */
function aicOpenDay(w,d){ aicView={w,d}; renderAICoach(); $('screen').scrollTop=0; }
function aicDayPage(w,d){
  const p=aicPlan(); const day=p&&p.weeks[w]&&p.weeks[w].days[d];
  if(!day){ aicView=null; return renderAICoach(); }
  const dn=aicData().done[aicKey(w,d)];
  let h='<button class="authalt aic-back" onclick="aicView=null;renderAICoach()">'+glyph('chevleft')+'Your plan</button>';
  h+='<div class="aic-hero sm"><div class="k">Week '+(w+1)+' · day '+(d+1)+'</div><div class="t">'+hesc(day.name)+'</div>'+
     '<div class="s">'+day.minutes+' min · '+day.blocks.length+' moves</div></div>';
  h+='<div class="pdx-btns"><button class="bigbtn" onclick="aicPlay('+w+','+d+')">'+glyph('play')+(dn?'Do It Again':'Start Workout')+'</button>'+
     (dn?'':'<button class="pdx-prev" onclick="aicLog('+w+','+d+')">'+glyph('check')+'Done it already? Log it</button>')+'</div>';
  h+='<div class="pdx-eps aic-moves">'+day.blocks.map((b,i)=>{
    const e=DB.find(x=>x.n===b.ex)||{};
    return '<div class="pdx-ex" onclick="playExercise(\''+b.ex.replace(/'/g,"\\'")+'\')"><span class="n">'+(i+1)+'</span>'+
      '<div class="tx"><div class="t">'+hesc(b.ex)+'</div><div class="m">'+aicBlockLine(b)+(e.eq?' · '+e.eq:'')+'</div>'+
      (b.note?'<div class="aic-cue">'+hesc(b.note)+'</div>':'')+'</div><span class="pdx-play">'+glyph('play')+'</span></div>';
  }).join('')+'</div>';
  if(dn) h+='<div class="aic-fine">Logged '+new Date(dn.at).toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'short'})+(dn.rpe?' · effort '+dn.rpe+'/10':'')+'.</div>';
  $('aic-body').innerHTML=h;
}

/* play a day in the usual player: each move for its time, the sets as rounds */
function aicExercises(day){
  return day.blocks.map(b=>{
    const e=DB.find(x=>x.n===b.ex && x.v) || DB.find(x=>x.n===b.ex);
    if(!e) return null;
    const dur=b.secs ? b.secs : Math.max(25, Math.min(60, b.reps*3+5));
    return Object.assign({}, e, {dur});
  }).filter(Boolean);
}
function aicPlay(w,d){
  const p=aicPlan(); const day=p&&p.weeks[w]&&p.weeks[w].days[d]; if(!day) return;
  const exs=aicExercises(day); if(!exs.length){ toast('These moves are not in the library'); return; }
  const rounds=Math.max(1, Math.round(day.blocks.reduce((s,b)=>s+b.sets,0)/day.blocks.length));
  startWorkout(exs,{rounds, key:'aic-'+(aicData().planId||'p')+'-'+w+'-'+d, name:day.name, aic:{w,d}});
}
/* the player hands back here when it closes */
function aicAfterSession(a){ openAICoach(); aicLog(a.w,a.d); }

/* ── the log: reps and kg for each move, effort, a note ── */
let _aicRpe=0;
function aicLog(w,d){
  const p=aicPlan(); const day=p&&p.weeks[w]&&p.weeks[w].days[d]; if(!day) return;
  const prev=aicData().done[aicKey(w,d)]||{}; _aicRpe=prev.rpe||0;
  let h='<div class="pwtop"><span></span><button class="pwx" aria-label="Close" onclick="closeProduct()">✕</button></div>'+
    '<div class="aic-lg-h"><div class="t">Log '+hesc(day.name)+'</div><div class="s">Your coach reads this when reviewing your week. Leave a box empty if you did as planned.</div></div>';
  h+='<div class="aic-lg">'+day.blocks.map((b,i)=>{
    const lg=(prev.logs||[])[i]||{};
    return '<div class="aic-lg-r"><div class="tx"><div class="t">'+hesc(b.ex)+'</div><div class="m">Planned '+aicBlockLine(b)+'</div></div>'+
      '<label><input id="aic-r'+i+'" inputmode="numeric" placeholder="'+(b.secs?b.secs:b.reps)+'" value="'+(lg.reps||'')+'"><span>'+(b.secs?'sec':'reps')+'</span></label>'+
      '<label><input id="aic-k'+i+'" inputmode="decimal" placeholder="–" value="'+(lg.kg||'')+'"><span>kg</span></label></div>';
  }).join('')+'</div>';
  h+='<div class="aic-q">How hard was it? <small>1 easy · 10 all-out</small></div><div class="aic-rpe" id="aic-rpe">'+aicRpeButtons()+'</div>';
  h+='<textarea id="aic-note" class="aic-notes" rows="2" maxlength="300" placeholder="Anything for your coach? e.g. knee felt sore on lunges">'+hesc(prev.note||'')+'</textarea>';
  h+='<button class="bigbtn" onclick="aicSaveLog('+w+','+d+')">Save Log</button>';
  $('pw-body').innerHTML=h; $('pwm').classList.add('on');
  try{ $('pwm').scrollTop=0; }catch(e){}
}
function aicRpeButtons(){ return [1,2,3,4,5,6,7,8,9,10].map(n=>'<button class="'+(n===_aicRpe?'on':'')+'" onclick="_aicRpe='+n+';$(\'aic-rpe\').innerHTML=aicRpeButtons()">'+n+'</button>').join(''); }
function aicSaveLog(w,d){
  const p=aicPlan(); const day=p&&p.weeks[w]&&p.weeks[w].days[d]; if(!day) return;
  const num=id=>{ const v=parseFloat((($(id)||{}).value||'').replace(',','.')); return isFinite(v)&&v>0?v:null; };
  const logs=day.blocks.map((b,i)=>({ex:b.ex, sets:b.sets, planned:b.secs?b.secs+'s':b.reps, reps:num('aic-r'+i), kg:num('aic-k'+i)}));
  const note=String((($('aic-note')||{}).value)||'').trim().slice(0,300);
  aicData().done[aicKey(w,d)]={at:new Date().toISOString(), rpe:_aicRpe||null, note, logs};
  aicSave(); closeProduct(); toast('Logged for your coach'); aicView=null; renderAICoach();
}

/* ── the weekly review ── */
async function aicReview(w){
  const c=aicData(), p=aicPlan(); if(!p) return;
  const logs=(p.weeks[w].days||[]).map((day,d)=>{ const x=c.done[aicKey(w,d)];
    return {session:day.name, done:!!x, effort:x&&x.rpe||null, note:x&&x.note||'', moves:x&&x.logs||[]}; });
  aicBusy='review'; renderAICoach();
  try{
    const r=aicIsDemo() ? await aicDemoWait({message:AIC_DEMO_REVIEW, next_week:null}) : await aicCall({action:'review', week:w, plan_id:c.planId, intake:c.intake||{}, logs,
      next_week:p.weeks[w+1]||null, library:aicLibrary(c.intake||{})});
    if(r.next_week && p.weeks[w+1]) p.weeks[w+1]=r.next_week;
    c.reviewed[w]=true; aicSay('coach', r.message); aicSave();
    toast(r.next_week?'Next week is updated':'Your coach has replied');
  }catch(e){ toast(e.message||'The coach could not review your week.'); }
  aicBusy=''; renderAICoach();
}

/* ── a question ── */
async function aicAsk(){
  const q=String((($('aic-q')||{}).value)||'').trim(); if(q.length<3) return;
  const c=aicData(), p=aicPlan();
  aicSay('me', q); aicBusy='ask'; renderAICoach();
  try{
    const recent=Object.keys(c.done).sort().slice(-6).map(k=>Object.assign({day:k},c.done[k]));
    const r=aicIsDemo() ? await aicDemoWait({answer:AIC_DEMO_ANSWER}) : await aicCall({action:'ask', question:q, intake:c.intake||{}, week_plan:p&&p.weeks[aicWeekNow()]||null, logs:recent});
    aicSay('coach', r.answer);
  }catch(e){ aicSay('coach', e.message||'I could not answer just now. Try again in a moment.'); }
  aicBusy=''; renderAICoach();
}

/* ── Home: today's session, or the invitation ── */
function aicHomeCard(){
  if(!(aicIsDemo() || (typeof hasPlus==='function' && hasPlus()))) return '';
  const p=aicPlan();
  if(!p) return '<div class="aic-card" onclick="openAICoach()">'+aicMark()+'<div class="tx"><div class="k">New in HITFAT+</div>'+
    '<div class="t">Meet your AI Coach</div><div class="s">Answer a few questions and get a 4-week plan written for you.</div></div><span class="pdx-chev">›</span></div>';
  const nx=aicNext();
  return '<div class="aic-card" onclick="openAICoach()">'+aicMark()+'<div class="tx"><div class="k">Your AI Coach · Week '+(aicWeekNow()+1)+'</div>'+
    '<div class="t">'+(aicFinished()?'Plan complete':nx?hesc(nx.day.name):'Week done')+'</div>'+
    '<div class="s">'+(aicFinished()?'Build your next four weeks':nx?nx.day.minutes+' min · '+nx.day.blocks.length+' moves':'Review it with your coach')+'</div></div><span class="pdx-chev">›</span></div>';
}

/* ── demo mode: a plan from the library, the coach's words written in advance ── */
const AIC_DEMO_REVIEW='Strong first week. You finished every session and kept your effort around 7, which is exactly where we want it. '+
  'Your squats looked solid, so next week I have added two reps to each lower-body move and cut the rest to 40 seconds. '+
  'Keep the same slow tempo on the way down.';
const AIC_DEMO_ANSWER='Good question. On rest days, walk 20 to 30 minutes and keep your protein up: eggs, chicken, tempeh or tofu with every meal. '+
  'If you are eating out, nasi campur with more lauk and sayur and less rice works well. Sleep 7 hours if you can.';
function aicDemoWait(v){ return new Promise(r=>setTimeout(()=>r(v), 2200)); }
function aicDemoPlan(intake){
  const lib=aicLibrary(intake).map(x=>x.split('|'));
  const pool=ms=>lib.filter(x=>ms.indexOf(x[3])>=0).map(x=>x[0]);
  const P={lower:pool(['Legs','Glutes','Calves']), upper:pool(['Chest','Shoulders','Arms','Triceps','Back']),
           core:pool(['Core']), burn:pool(['Cardio','Full Body','Power'])};
  const KINDS=[['Lower Body Strength',['lower','lower','lower','core','burn']],
               ['Upper Body Push & Pull',['upper','upper','upper','core','core']],
               ['Full Body Burn',['burn','lower','upper','burn','core']],
               ['Core & Conditioning',['core','core','burn','burn','lower']]];
  const days=Math.max(2,Math.min(6,intake.days||3)), mins=intake.minutes||30;
  const weeks=[0,1,2,3].map(w=>({focus:['Learn the moves','More reps','Less rest','Your hardest week'][w],
    days:Array.from({length:days},(_,d)=>{
      const k=KINDS[d%KINDS.length], seen={};
      return {name:k[0], minutes:mins, blocks:k[1].map((g,i)=>{
        const arr=P[g].length?P[g]:P.lower; let j=(d*7+i*3)%arr.length;
        while(seen[arr[j]] && Object.keys(seen).length<arr.length) j=(j+1)%arr.length;
        seen[arr[j]]=1;
        const timed=g==='burn' || /plank|hold|wall sit/i.test(arr[j]);
        return Object.assign({ex:arr[j], sets:w<2?3:4, rest:Math.max(20,45-w*5), note:i===0?'Slow on the way down':''},
          timed?{secs:30+w*5}:{reps:10+w*2});
      })};
    })}));
  const goal=(AIC_GOALS.find(g=>g[0]===intake.goal)||AIC_GOALS[0])[1].toLowerCase();
  return {title:'Your 4-Week Plan', summary:days+' sessions a week, '+mins+' minutes each, harder every week.',
    coach_note:'Welcome! You told me you want to '+goal+', so we will train '+days+' days a week for '+mins+' minutes. '+
      'This week is about learning each move well: watch the video before you start, and go slow on the way down. '+
      'Log every session and I will adjust next week to match.', weeks};
}
