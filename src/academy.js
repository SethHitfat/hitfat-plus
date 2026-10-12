/* ═══════════════ NUTRITION ACADEMY ═══════════════
   HITFAT's own nutrition course, in Malay: 18 episodes in six modules,
   for members who want to understand food, not only follow a plan.

   An episode is a Vimeo video, a short quiz (pass 2 of 3) and one thing to
   do now in the app: the label episode opens the label scanner, the
   protein one the Journal, the last one the 7-day meal plan. That last part
   is what a course site cannot do.

   The first AC_FREE episodes are open to everyone; the rest are HITFAT+.
   Progress is kept in HF.data.academy: {done:{ep01:{at,score}}, last}.

   To publish an episode, fill its v (the Vimeo id, or 'id/hash' for an
   unlisted video), sum and quiz. Until then it shows as coming soon. */

const AC_FREE=2;
const AC_MODS=[
  ['Asas','Apa yang penimbang beritahu, dan apa yang tidak'],
  ['Apa Dalam Pinggan','Protein, nasi, santan dan minyak'],
  ['Makan Di Luar','Mamak, kenduri, minum petang dan label'],
  ['Badan & Minda','Tidur, emosi, lapar dan plateau'],
  ['Lanjutan','Sekitar latihan, supplement, IF dan Ramadan'],
  ['Pelan Kau','Semua sekali, dalam 7 hari']
];
/* m: module index. act: [label, onclick] or null. quiz: [{q, o:[...], a:index, why}] */
const AC_EPS=[
  {id:'ep01',m:0,t:'Baca Penimbang',            v:'',sum:'',quiz:[],act:['Log berat hari ini','acDo(\'weight\')']},
  {id:'ep02',m:0,t:'Defisit Tanpa Lapar',       v:'',sum:'',quiz:[],act:['Tengok target kalori kau','acDo(\'today\')']},
  {id:'ep03',m:0,t:'Turun Berat, Bukan Lemak?', v:'',sum:'',quiz:[],act:['Log ukuran badan','acDo(\'measure\')']},
  {id:'ep04',m:1,t:'Protein',                   v:'',sum:'',quiz:[],act:['Tengok protein minggu ini','acDo(\'journal\')']},
  {id:'ep05',m:1,t:'Karbohidrat & Nasi',        v:'',sum:'',quiz:[],act:['Scan pinggan nasi kau','acDo(\'scan\')']},
  {id:'ep06',m:1,t:'Lemak, Santan & Goreng',    v:'',sum:'',quiz:[],act:['Log makanan hari ini','acDo(\'log\')']},
  {id:'ep07',m:2,t:'Mamak & Warung',            v:'',sum:'',quiz:[],act:['Scan makanan mamak kau','acDo(\'scan\')']},
  {id:'ep08',m:2,t:'Kenduri, Raya & Buffet',    v:'',sum:'',quiz:[],act:['Scan pinggan kenduri','acDo(\'scan\')']},
  {id:'ep09',m:2,t:'Minum Petang',              v:'',sum:'',quiz:[],act:['Scan barcode minuman','acDo(\'barcode\')']},
  {id:'ep10',m:2,t:'Baca Label Makanan',        v:'',sum:'',quiz:[],act:['Scan label makanan','acDo(\'label\')']},
  {id:'ep11',m:3,t:'Kurang Tidur',              v:'',sum:'',quiz:[],act:null},
  {id:'ep12',m:3,t:'Makan Ikut Emosi',          v:'',sum:'',quiz:[],act:['Tengok Journal makan kau','acDo(\'journal\')']},
  {id:'ep13',m:3,t:'Lapar Atau Dahaga?',        v:'',sum:'',quiz:[],act:null},
  {id:'ep14',m:3,t:'Plateau',                   v:'',sum:'',quiz:[],act:['Tengok trend berat kau','acDo(\'progress\')']},
  {id:'ep15',m:4,t:'Makan Sekitar Latihan',     v:'',sum:'',quiz:[],act:['Pergi ke latihan hari ini','acDo(\'train\')']},
  {id:'ep16',m:4,t:'Supplement',                v:'',sum:'',quiz:[],act:null},
  {id:'ep17',m:4,t:'IF & Ramadan',              v:'',sum:'',quiz:[],act:['Bina meal plan','acDo(\'mealplan\')']},
  {id:'ep18',m:5,t:'Recap: Pelan 7 Hari',       v:'',sum:'',quiz:[],act:['Bina meal plan 7 hari kau','acDo(\'mealplan\')']}
];
let acView=null, acQuiz=null;

function acData(){
  const a=HF.data.academy||(HF.data.academy={});
  a.done=a.done||{}; return a;
}
function acEp(id){ return AC_EPS.find(e=>e.id===id)||null; }
function acNum(e){ return AC_EPS.indexOf(e)+1; }
function acReady(e){ return !!e.v; }
function acFree(e){ return acNum(e)<=AC_FREE; }
function acLocked(e){ return !acFree(e) && !contentOpen(); }
function acDone(e){ return !!acData().done[e.id]; }
function acCount(){ return AC_EPS.filter(acDone).length; }
/* where to carry on: the first episode not done */
function acNext(){ return AC_EPS.find(e=>!acDone(e))||null; }
function acVimeo(v){
  const p=String(v).split('/');
  return 'https://player.vimeo.com/video/'+p[0]+'?'+(p[1]?'h='+p[1]+'&':'')+'title=0&byline=0&portrait=0&dnt=1&playsinline=1';
}

/* ── the course page ── */
function openAcademy(id){
  hidePanels(); $('academy').style.display='block';
  acView=id||null; acQuiz=null; renderAcademy(); $('screen').scrollTop=0;
}
function renderAcademy(){
  const el=$('ac-body'); if(!el) return;
  if(acView){ const e=acEp(acView); if(e) return acEpisode(e); acView=null; }
  el.innerHTML=academyHTML();
}
function acBack(){
  if(acView){ acView=null; acQuiz=null; renderAcademy(); $('screen').scrollTop=0; }
  else switchTab('eat');
}

function academyHTML(){
  const n=acCount(), all=AC_EPS.length, nx=acNext();
  let h='<div class="ac-hero"><div class="k">HITFAT+ · Kursus Pemakanan</div>'+
    '<div class="t">Nutrition Academy</div>'+
    '<div class="s">'+all+' episod pendek tentang makan untuk turun lemak, cara Malaysia: nasi, mamak, kenduri, Ramadan. '+
    'Setiap episod ada kuiz ringkas dan satu benda untuk terus buat dalam app.</div>'+
    '<div class="ac-prog"><div class="pbar"><i style="width:'+Math.round(n/all*100)+'%"></i></div>'+
    '<span>'+n+' / '+all+' selesai</span></div>'+
    (nx?'<button class="bigbtn" onclick="acOpen(\''+nx.id+'\')">'+glyph('play')+(n?'Sambung: Ep'+String(acNum(nx)).padStart(2,'0'):'Mula Episod 1')+'</button>'
       :'<div class="ac-cert">'+glyph('medal')+'<div><b>Tahniah, kau dah habis semua episod.</b><br>Ulang mana-mana episod bila perlu.</div></div>')+
    '</div>';
  AC_MODS.forEach((m,mi)=>{
    const eps=AC_EPS.filter(e=>e.m===mi), d=eps.filter(acDone).length;
    h+='<div class="ac-mod"><div class="ac-mod-h"><div><div class="k">Modul '+(mi+1)+'</div><div class="t">'+m[0]+'</div>'+
      '<div class="s">'+m[1]+'</div></div><span class="ac-mod-n">'+d+'/'+eps.length+'</span></div><div class="ac-eps">'+
      eps.map(acRow).join('')+'</div></div>';
  });
  h+='<div class="aic-fine">Kandungan ini untuk pendidikan umum, bukan nasihat perubatan. Jika ada penyakit seperti diabetes, '+
     'darah tinggi atau buah pinggang, atau sedang hamil, rujuk doktor atau pakar dietetik dulu.</div>';
  return h;
}
function acRow(e){
  const done=acDone(e), lock=acLocked(e), ready=acReady(e), num=String(acNum(e)).padStart(2,'0');
  const tag=done?'':lock?'<span class="ac-tag">'+glyph('lock')+'</span>':!ready?'<span class="ac-tag soon">Akan datang</span>':
    acFree(e)&&!contentOpen()?'<span class="ac-tag free">Percuma</span>':'';
  return '<div class="ac-ep'+(done?' done':'')+(ready?'':' soon')+'" onclick="acOpen(\''+e.id+'\')">'+
    '<span class="n">'+(done?glyph('check'):num)+'</span><div class="tx"><div class="t">'+hesc(e.t)+'</div>'+
    '<div class="m">Episod '+num+(e.quiz.length?' · kuiz '+e.quiz.length+' soalan':'')+(done&&e.quiz.length&&acData().done[e.id].score!=null?' · '+acData().done[e.id].score+'/'+e.quiz.length:'')+'</div></div>'+
    tag+'<span class="pdx-chev">›</span></div>';
}
function acOpen(id){
  const e=acEp(id); if(!e) return;
  if(acLocked(e) && needPlus('Nutrition Academy penuh ada dalam HITFAT+.')) return;
  if($('academy').style.display!=='block'){ return openAcademy(id); }
  acView=id; acQuiz=null; renderAcademy(); $('screen').scrollTop=0;
}

/* ── an episode: the video, what it covers, one thing to do, the quiz ── */
function acEpisode(e){
  const a=acData(); a.last=e.id; HF.save();
  const num=String(acNum(e)).padStart(2,'0'), done=acDone(e);
  let h='<div class="ac-video">'+(acReady(e)
    ?'<iframe src="'+acVimeo(e.v)+'" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen title="'+hesc(e.t)+'"></iframe>'
    :'<div class="ac-soon">'+glyph('play')+'<div>Video akan datang</div></div>')+'</div>';
  h+='<div class="ac-ep-h"><div class="k">Modul '+(e.m+1)+' · Episod '+num+'</div><div class="t">'+hesc(e.t)+'</div>'+
     (e.sum?'<div class="s">'+hesc(e.sum)+'</div>':'')+'</div>';
  if(e.act) h+='<div class="ac-act" onclick="'+e.act[1]+'"><span class="ic">'+glyph('bolt')+'</span><div class="tx"><div class="k">Buat sekarang</div>'+
     '<div class="t">'+hesc(e.act[0])+'</div></div><span class="pdx-chev">›</span></div>';
  h+=acQuizHTML(e);
  if(!e.quiz.length && acReady(e) && !done)
    h+='<button class="bigbtn" onclick="acFinish(\''+e.id+'\',null)">'+glyph('check')+'Tandakan Selesai</button>';
  const nx=AC_EPS[acNum(e)];
  if(nx) h+='<button class="authalt" onclick="acOpen(\''+nx.id+'\')">Episod seterusnya: '+hesc(nx.t)+' ›</button>';
  $('ac-body').innerHTML=h;
}

/* the quiz: one question at a time is overkill for three, so all at once,
   each marked the moment it is answered, with the reason */
function acQuizHTML(e){
  if(!e.quiz.length) return acReady(e)?'':'<div class="ac-qempty">Kuiz untuk episod ini akan datang bersama videonya.</div>';
  const q=acQuiz&&acQuiz.id===e.id?acQuiz:(acQuiz={id:e.id, ans:e.quiz.map(()=>-1)});
  const prev=acData().done[e.id];
  let h='<div class="ac-quiz"><div class="ac-quiz-h"><div class="t">Kuiz</div><div class="s">Jawab '+e.quiz.length+' soalan. Lulus '+acPassMark(e)+' untuk tandakan episod selesai.'+
    (prev&&prev.score!=null?' Markah terbaik kau: '+prev.score+'/'+e.quiz.length+'.':'')+'</div></div>';
  e.quiz.forEach((x,i)=>{
    const a=q.ans[i];
    h+='<div class="ac-q"><div class="ac-q-t">'+(i+1)+'. '+hesc(x.q)+'</div>'+x.o.map((o,j)=>{
      const cls=a<0?'':j===x.a?' right':j===a?' wrong':' dim';
      return '<button class="ac-o'+cls+'" '+(a<0?'onclick="acAnswer('+i+','+j+')"':'disabled')+'>'+hesc(o)+'</button>';
    }).join('')+(a>=0?'<div class="ac-why'+(a===x.a?' ok':'')+'"><b>'+(a===x.a?'Betul.':'Belum tepat.')+'</b> '+hesc(x.why||'')+'</div>':'')+'</div>';
  });
  if(q.ans.every(a=>a>=0)){
    const s=acScore(e,q), pass=s>=acPassMark(e);
    h+='<div class="ac-res'+(pass?' pass':'')+'"><div class="t">'+s+' / '+e.quiz.length+(pass?' · Lulus':'')+'</div>'+
      '<div class="s">'+(pass?'Episod ini ditanda selesai.':'Tonton semula bahagian yang terlepas, kemudian cuba lagi.')+'</div>'+
      '<button class="bigbtn sec" onclick="acRetry()">Cuba Semula</button></div>';
  }
  return h+'</div>';
}
function acPassMark(e){ return Math.max(1, Math.ceil(e.quiz.length*2/3)); }
function acScore(e,q){ return e.quiz.reduce((s,x,i)=>s+(q.ans[i]===x.a?1:0),0); }
function acAnswer(i,j){
  const e=acEp(acView); if(!e||!acQuiz||acQuiz.ans[i]>=0) return;
  acQuiz.ans[i]=j;
  if(acQuiz.ans.every(a=>a>=0)){
    const s=acScore(e,acQuiz);
    if(s>=acPassMark(e)) acFinish(e.id,s,true);
  }
  const y=$('screen').scrollTop; acEpisode(e); $('screen').scrollTop=y;
}
function acRetry(){ const e=acEp(acView); if(!e) return; acQuiz=null; acEpisode(e); }
function acFinish(id,score,quiet){
  const a=acData(), prev=a.done[id];
  a.done[id]={at:(prev&&prev.at)||new Date().toISOString(), score:score==null?null:Math.max(score,(prev&&prev.score)||0)};
  HF.save();
  if(acCount()===AC_EPS.length && !(prev)) toast('Tahniah! Semua '+AC_EPS.length+' episod selesai');
  else if(!prev) toast('Episod selesai');
  if(!quiet) acEpisode(acEp(id));
}

/* "Buat sekarang": from the lesson straight to the tool */
function acDo(k){
  if(k==='weight') return askWeight();
  if(k==='measure'){ switchTab('progress'); return askMeasure(); }
  if(k==='scan')    return openScan('meal');
  if(k==='barcode') return openScan('barcode');
  if(k==='label')   return openScan('label');
  if(k==='mealplan') return openMealPlan();
  if(k==='progress') return switchTab('progress');
  if(k==='train')   return switchTab('train');
  /* the Eat segments */
  switchTab('eat');
  if(HF.data.nutrition && HF.data.nutrition.cal) setEatSeg(k);
}

/* ── Eat's Learn segment: the same course page, in place ── */
function eatLearn(){ $('eat-body').innerHTML='<div class="ac-in-eat">'+academyHTML()+'</div>'; }

/* ── Home: carry on where you left off ── */
function acHomeCard(){
  /* nothing to send anyone to until a video is up */
  const nx=acNext(); if(!nx || !AC_EPS.some(acReady)) return '';
  const n=acCount(), num=String(acNum(nx)).padStart(2,'0');
  return '<div class="ac-card" onclick="acOpen(\''+nx.id+'\')"><span class="ic">'+glyph('food')+'</span><div class="tx">'+
    '<div class="k">Nutrition Academy'+(n?' · '+n+'/'+AC_EPS.length:'')+'</div>'+
    '<div class="t">'+(n?'Sambung: ':'')+'Ep'+num+' '+hesc(nx.t)+'</div>'+
    '<div class="s">'+(n?'Satu episod pendek dan kuiz 3 soalan.':AC_EPS.length+' episod tentang makan untuk turun lemak, cara Malaysia.')+'</div></div><span class="pdx-chev">›</span></div>';
}
