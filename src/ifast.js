/* ═══════════════ IF HITFAT · PUASA BERSELANG ═══════════════
   Intermittent fasting as a feature of its own: something to learn, and
   a system to use, the way Simple (simple.life) does it.

     Ilmu     ten short lessons from Seth's IF ebook (2021), brought up to
              date: the claims the evidence does not carry are gone (toxins,
              cancer, HGH ×20), BCAA is no longer "a must", a safety lesson is
              added, and it agrees with DIET 6 MINGGU and the Academy (IF
              works mostly because the eating window shortens the day's
              eating; the total still matters).
     Pelan    a short quiz, one question a screen, with a safety screen;
              then a 4-week plan on the ebook's own ramp: 12/12, 14/10,
              14/10, 16/8, its eating window placed on the member's day.
     Pemasa   start and end a fast; a ring for the hours, the stage the
              body is roughly in, the last fasts, a streak.

   The first two lessons are open to everyone; the plan and the timer are
   HITFAT+. In Malay; the shared screens follow through lbLang. ES5. */

var IF_PROTO=[{f:12,e:12,n:'12/12',s:'Mula perlahan: puasa 12 jam, kebanyakannya semasa tidur.'},
              {f:14,e:10,n:'14/10',s:'Panjangkan puasa 2 jam. Badan sudah mula biasa.'},
              {f:14,e:10,n:'14/10',s:'Kekalkan 14 jam. Tabiat makin kukuh.'},
              {f:16,e:8, n:'16/8', s:'Protokol akhir: puasa 16 jam, makan dalam 8 jam.'}];
/* roughly what is happening, hour by hour; approximate, and said so */
var IF_STAGES=[[0,'Mencerna makanan','Gula darah naik selepas makan, kemudian turun semula.'],
               [4,'Gula darah stabil','Badan selesai memproses makanan terakhir.'],
               [8,'Guna simpanan tenaga','Badan mula guna simpanan glikogen.'],
               [12,'Lebih banyak lemak digunakan','Selepas lebih kurang 12 jam, lebih banyak tenaga datang dari lemak.'],
               [16,'Puasa panjang','Minum air, dengar badan anda. Pening atau lemah luar biasa: buka puasa.']];

/* ── the lessons ── */
var IF_LESSONS=[
  {id:'if1', t:'Apa itu IF?', p:[
    'Intermittent fasting (IF) bukan diet. Ia pola makan: anda tetapkan BILA makan, dan berpuasa di luar waktu itu.',
    'Contoh 16/8: puasa 16 jam, makan dalam tempoh 8 jam ("eating window"). Kebanyakan jam puasa itu berlaku semasa anda tidur.',
    'Anda masih makan seperti biasa, dua atau tiga hidangan yang mengenyangkan, cuma dalam waktu yang lebih pendek.'],
   k:['IF tentang bila makan, bukan apa yang dilarang.','Waktu tidur sudah separuh daripada puasa anda.']},
  {id:'if2', t:'Kenapa IF membantu turun lemak', p:[
    'Sebab utama: bila tempoh makan lebih pendek, kebanyakan orang makan kurang tanpa perlu mengira. Snek lewat malam dan makan sepanjang hari hilang sendiri.',
    'Kajian setakat ini menunjukkan hasil turun berat dengan IF lebih kurang sama dengan mengurangkan kalori cara biasa. IF bukan magik, tetapi ramai yang rasa ia lebih mudah diikuti.',
    'Bila insulin rendah antara waktu makan, badan lebih senang menggunakan simpanan tenaga. Tetapi jumlah yang anda makan dalam tempoh makan tetap penting.'],
   k:['IF membantu kerana anda makan kurang dengan lebih mudah.','Pilih cara yang anda boleh kekalkan.']},
  {id:'if3', t:'Kebaikan yang ada bukti', p:[
    'Yang disokong kajian: turun berat dan lemak (setanding defisit kalori biasa), kepekaan insulin yang lebih baik bagi sesetengah orang, dan kurang masa memikirkan makanan.',
    'Ramai juga rasa lebih kenyang kerana dapat makan hidangan yang lebih besar, bukan sedikit-sedikit sepanjang hari.',
    'Dakwaan seperti "buang toksin", "elak kanser" atau "hormon pembakar lemak naik berkali ganda" tidak disokong bukti yang cukup kuat. Hati dan buah pinggang anda sudah buat kerja "detoks" setiap hari.'],
   k:['Fokus pada kebaikan yang ada bukti: berat, tabiat, insulin.','Hati-hati dengan dakwaan yang terlalu hebat.']},
  {id:'if4', t:'Protokol: naik perlahan-lahan', p:[
    'Minggu 1: 12/12. Contoh: makan 8 pagi hingga 8 malam.',
    'Minggu 2 dan 3: 14/10. Contoh: makan 10 pagi hingga 8 malam.',
    'Minggu 4: 16/8. Contoh: makan 12 tengah hari hingga 8 malam.',
    'Naik secara ansur maju beri masa untuk badan dan selera anda menyesuaikan diri. Waktu boleh diubah ikut jadual anda, asalkan tempoh puasa dipatuhi.'],
   k:['12/12 → 14/10 → 16/8, seminggu demi seminggu.','Elak makan lewat malam bila boleh.']},
  {id:'if5', t:'Apa boleh diminum semasa puasa', p:[
    'Air kosong: wajib, dan banyak. Lapar kadang-kadang sebenarnya dahaga.',
    'Kopi O kosong dan teh O kosong (termasuk teh hijau): boleh, tanpa gula dan tanpa susu.',
    'Minuman "zero" dengan pemanis tiruan tidak berkalori, tetapi bagi sesetengah orang ia menaikkan selera manis. Lebih baik air kosong.',
    'Cuka epal tidak wajib. Jika anda suka, cairkan dan minum dengan straw untuk lindungi gigi.'],
   k:['Air, kopi O kosong, teh O kosong.','Apa-apa yang ada kalori membuka puasa.']},
  {id:'if6', t:'Apa nak makan dalam tempoh makan', p:[
    'IF bukan lesen untuk makan sebanyak mungkin dalam 8 jam. Jumlah sehari masih menentukan berat anda.',
    'Mula hidangan pertama dengan protein dan sayur: telur, ayam, ikan, tauhu, tempe. Nasi ikut porsi, satu genggam.',
    'Buka puasa dengan hidangan biasa yang seimbang, bukan gorengan dan air manis. Ini sama seperti strategi berbuka di bulan Ramadan.'],
   k:['Protein dan sayur dahulu.','Kualiti dan jumlah makanan tetap penting.']},
  {id:'if7', t:'Mitos tentang IF', p:[
    '"IF memperlahankan metabolisme." Puasa pendek seperti 16 jam tidak memperlahankan metabolisme. Yang memperlahankannya ialah makan terlalu sedikit untuk tempoh yang lama.',
    '"Puasa buat saya hilang otot." Tidak, jika anda makan protein yang cukup dalam tempoh makan dan buat latihan kekuatan.',
    '"Saya akan sentiasa lapar." Rasa lapar biasanya berkurang selepas seminggu dua bila badan menyesuaikan diri. Sibukkan diri dan minum air.'],
   k:['Protein cukup + latihan kekuatan = otot kekal.','Lapar awal itu normal, dan ia berkurang.']},
  {id:'if8', t:'Senaman semasa berpuasa', p:[
    'Boleh. Ramai suka bersenam pagi sebelum makan. Pada minggu pertama prestasi mungkin turun sedikit sementara badan menyesuaikan diri.',
    'BCAA atau supplement TIDAK wajib. Protein yang cukup dalam tempoh makan sudah memadai untuk kebanyakan orang.',
    'Jika anda pening, lemah atau berdebar semasa bersenam berpuasa, berhenti dan makan. Untuk sesi yang berat, pilih waktu dalam tempoh makan.'],
   k:['Senam semasa puasa boleh, ikut keselesaan.','BCAA tidak wajib.']},
  {id:'if9', t:'Siapa tidak sesuai untuk IF', p:[
    'Dapatkan nasihat doktor dahulu, atau jangan amalkan IF, jika anda:',
    'Hamil atau menyusu · bawah 18 tahun · pernah ada masalah pemakanan (binge, anoreksia, bulimia) · ada diabetes dan ambil insulin atau ubat gula (risiko gula darah jatuh) · ada gastrik atau ulser teruk · mengambil ubat yang perlu dimakan bersama makanan.',
    'Berhenti dan dapatkan nasihat jika anda pening teruk, pitam, berdebar, atau mula makan berlebihan tanpa kawalan selepas berpuasa.'],
   k:['Keselamatan dahulu, berat kemudian.','Jika ragu, tanya doktor.']},
  {id:'if10', t:'IF selepas 4 minggu, dan Ramadan', p:[
    'Selepas 4 minggu, pilih tempoh yang anda paling selesa: ramai kekal di 14/10 atau 16/8. Tidak perlu lebih panjang.',
    'Hari kenduri atau cuti? Longgarkan sehari, kemudian sambung semula. Konsisten mengalahkan sempurna.',
    'Bulan Ramadan ialah puasa yang lebih panjang. Kemahiran yang sama terpakai: berbuka bersederhana, protein dan sayur, jangan tinggal sahur.'],
   k:['Pilih tempoh yang anda boleh kekalkan.','Tersasar? Sambung pada puasa seterusnya.']}
];
var IF_FREE=2;

/* ── state ── */
function ifData(){
  var d=HF.data.ifs||(HF.data.ifs={});
  d.read=d.read||{}; d.log=d.log||[];
  return d;
}
function ifOwned(){ return typeof contentOpen==='function' && contentOpen(); }
function ifPlan(){ return ifData().plan||null; }
/* the plan's week today, 0–3 (and it stays on week 4 after) */
function ifWeek(){
  var p=ifPlan(); if(!p||!p.start) return 0;
  return Math.max(0,Math.min(3,Math.floor(daysBetween(p.start,iso(0))/7)));
}
function ifProto(){ return IF_PROTO[ifWeek()]; }
function ifHm(min){ min=((Math.round(min)%1440)+1440)%1440; var h=Math.floor(min/60), m=min%60; return (h%12||12)+':'+('0'+m).slice(-2)+(h<12?' pagi':h<14?' tengah hari':h<19?' petang':' malam'); }
function ifHm12(min){ min=((Math.round(min)%1440)+1440)%1440; var h=Math.floor(min/60), m=min%60, hh=h%12||12; return hh+':'+('0'+m).slice(-2)+(h<12?' pagi':h<19?' ptg':' mlm'); }
/* the eating window for a week: it ends at the plan's last meal, it opens f hours after */
function ifWindow(w){
  var p=ifPlan(), pr=IF_PROTO[w===undefined?ifWeek():w];
  var end=(p&&p.endMin)||20*60;
  return {start:end-pr.e*60, end:end};
}
function ifDur(ms){ var m=Math.max(0,Math.floor(ms/60000)), h=Math.floor(m/60); return h+'j '+('0'+(m%60)).slice(-2)+'m'; }
function ifStage(h){ var s=IF_STAGES[0]; IF_STAGES.forEach(function(x){ if(h>=x[0]) s=x; }); return s; }

/* ── the panel ── */
var ifSeg='timer', ifQ=-1, _ifAns={}, _ifTick=null, ifLesson=null;
function openIF(seg){
  hidePanels(); $('ifp').style.display='block';
  if(seg) ifSeg=seg; ifLesson=null;
  renderIF(); $('screen').scrollTop=0;
}
function ifBack(){
  if(ifLesson!==null){ ifLesson=null; renderIF(); return; }
  if(ifQ>=0){ ifQ--; renderIF(); return; }
  ifQ=-1; switchTab(curTab||'home');
}
function ifSet(x){ ifSeg=x; ifLesson=null; renderIF(); $('screen').scrollTop=0; }
function renderIF(){
  lbLang(true);
  var el=$('ifp-body'); if(!el) return;
  if(_ifTick){ clearInterval(_ifTick); _ifTick=null; }
  if(ifQ>=0) { el.innerHTML=ifQuiz(); return; }
  if(ifLesson!==null){ el.innerHTML=ifLessonHTML(ifLesson); return; }
  var h='<div class="ac-hero if-hero"><div class="k">HITFAT+ · Puasa Berselang</div><div class="t">IF HITFAT</div>'+
    '<div class="s">Belajar cara IF yang betul, kemudian amalkan dengan pelan dan pemasa anda sendiri.</div></div>';
  h+='<div class="obseg d6-segs">'+[['timer','Pemasa'],['plan','Pelan'],['learn','Ilmu'],['history','Sejarah']].map(function(x){
    return '<button class="'+(ifSeg===x[0]?'on':'')+'" onclick="ifSet(\''+x[0]+'\')">'+x[1]+'</button>'; }).join('')+'</div>';
  if(ifSeg==='learn') h+=ifLearn();
  else if(ifSeg==='plan') h+=ifPlanHTML();
  else if(ifSeg==='history') h+=ifHistory();
  else h+=ifTimer();
  el.innerHTML=h;
  if(ifSeg==='timer' && ifData().active) _ifTick=setInterval(function(){
    if(!$('ifp')||$('ifp').style.display!=='block'||ifSeg!=='timer'||ifQ>=0||ifLesson!==null){ clearInterval(_ifTick); _ifTick=null; return; }
    var r=$('if-ring'); if(r) r.outerHTML=ifRing(); var s=$('if-stage'); if(s) s.outerHTML=ifStageHTML();
  },30000);
}

/* ── Pemasa ── */
function ifTimer(){
  if(!ifOwned()) return ifLocked('Pemasa puasa','Mula dan tamat puasa dengan satu tekan, lihat berapa jam lagi, dan fasa badan anda.');
  if(!ifPlan()) return '<div class="if-start">'+glyph('clock')+'<div class="t">Bina pelan IF anda dahulu</div>'+
    '<div class="s">Lima soalan ringkas. Kami susun waktu makan dan puasa ikut hari anda, naik perlahan dari 12/12 ke 16/8.</div>'+
    '<button class="bigbtn if-btn" onclick="ifQuizStart()">Mula</button></div>';
  var d=ifData(), pr=ifProto(), w=ifWindow(), h='';
  if(ifPlan().blocked) return '<div class="lb-safe">'+ic('warning')+'<div><div class="t">IF tidak disyorkan untuk anda sekarang</div><div class="s">'+
    'Berdasarkan jawapan anda, dapatkan nasihat doktor sebelum berpuasa. Anda masih boleh belajar di tab Ilmu.</div></div></div>'+
    '<button class="authalt" onclick="ifQuizStart()">Jawab semula</button>';
  h+=ifRing();
  if(d.active) h+=ifStageHTML();
  h+='<div class="pdx-btns">'+(d.active
    ? '<button class="bigbtn if-btn" onclick="ifEnd()">Tamat Puasa</button>'+
      '<div class="if-adj"><span>Mula puasa pada '+new Date(d.active.at).toLocaleTimeString('ms-MY',{hour:'numeric',minute:'2-digit'})+'</span>'+
      '<button onclick="ifShift(-30)">−30m</button><button onclick="ifShift(30)">+30m</button></div>'
    : '<button class="bigbtn if-btn" onclick="ifBegin()">Mula Puasa · '+pr.f+' jam</button>')+'</div>';
  h+='<div class="d6-budrow if-today"><div><b>'+pr.n+'</b><span>Minggu '+(ifWeek()+1)+'</span></div>'+
    '<div><b>'+ifHm12(w.start)+'</b><span>Buka puasa</span></div><div><b>'+ifHm12(w.end)+'</b><span>Mula puasa</span></div></div>';
  h+='<div class="lb-fine d6-fine">'+pr.s+' Semasa puasa: air, kopi O kosong, teh O kosong.</div>';
  return h;
}
function ifRing(){
  var d=ifData(), pr=ifProto(), sz=230, r=sz/2-14, c=2*Math.PI*r;
  var on=!!d.active, el=on?Date.now()-d.active.at:0, tgt=(on?d.active.target:pr.f)*3600000, pct=on?Math.min(1,el/tgt):0;
  var big=on?ifDur(el):pr.f+' jam', small=on?(el>=tgt?'Sasaran dicapai 🎉':'lagi '+ifDur(tgt-el)):'sasaran puasa hari ini';
  return '<div class="if-ring" id="if-ring"><svg viewBox="0 0 '+sz+' '+sz+'" aria-hidden="true">'+
    '<circle cx="'+sz/2+'" cy="'+sz/2+'" r="'+r+'" class="if-ring-t"/>'+
    (pct>0?'<path d="M'+sz/2+' '+(sz/2-r)+' a'+r+' '+r+' 0 1 1 0 '+(2*r)+' a'+r+' '+r+' 0 1 1 0 '+(-2*r)+'" class="if-ring-v" stroke-dasharray="'+c.toFixed(1)+'" stroke-dashoffset="'+(c*(1-pct)).toFixed(1)+'"/>':'')+
    '</svg><div class="if-ring-c"><span>'+(on?'Sedang puasa':'Tidak berpuasa')+'</span><b>'+big+'</b><small>'+small+'</small></div></div>';
}
function ifStageHTML(){
  var d=ifData(); if(!d.active) return '';
  var h=(Date.now()-d.active.at)/3600000, s=ifStage(h);
  return '<div class="if-stage" id="if-stage"><div class="k">Anggaran fasa badan · '+Math.floor(h)+' jam</div><div class="t">'+s[1]+'</div><div class="s">'+s[2]+'</div></div>';
}
function ifBegin(){ var d=ifData(); d.active={at:Date.now(), target:ifProto().f}; HF.save(); toast('Puasa bermula'); renderIF(); }
function ifShift(min){ var d=ifData(); if(!d.active) return; d.active.at=Math.min(Date.now(), d.active.at+min*60000); HF.save(); renderIF(); }
function ifEnd(){
  var d=ifData(); if(!d.active) return;
  var hrs=(Date.now()-d.active.at)/3600000;
  d.log.unshift({at:d.active.at, end:Date.now(), hrs:Math.round(hrs*10)/10, target:d.active.target});
  d.log=d.log.slice(0,90); d.active=null; HF.save();
  toast(hrs>=d.log[0].target?'Tahniah, puasa '+Math.floor(hrs)+' jam selesai':'Puasa '+Math.floor(hrs)+' jam direkod');
  renderIF();
}

/* ── Pelan ── */
function ifPlanHTML(){
  if(!ifOwned()) return ifLocked('Pelan IF 4 minggu','Lima soalan, kemudian pelan ikut hari anda: 12/12, 14/10, 14/10, 16/8.');
  var p=ifPlan();
  if(!p) return '<div class="if-start">'+glyph('calendar')+'<div class="t">Belum ada pelan</div>'+
    '<button class="bigbtn if-btn" onclick="ifQuizStart()">Bina Pelan Saya</button></div>';
  var wk=ifWeek(), h=fsec('Pelan IF 4 Minggu Anda','Mula '+new Date(p.start+'T00:00:00').toLocaleDateString('ms-MY',{day:'numeric',month:'short'}));
  h+='<div class="ac-eps">'+IF_PROTO.map(function(pr,i){
    var w=ifWindow(i), now=i===wk;
    return '<div class="ac-ep'+(i<wk?' done':'')+(now?' if-on':'')+'"><span class="n">'+(i<wk?glyph('check'):(i+1))+'</span>'+
      '<div class="tx"><div class="t">Minggu '+(i+1)+' · '+pr.n+'</div><div class="m">Makan '+ifHm(w.start)+' hingga '+ifHm(w.end)+'</div></div>'+
      (now?'<span class="ac-tag if-today-t">Minggu ini</span>':'')+'</div>';
  }).join('')+'</div>';
  if(p.late) h+='<div class="lb-fine d6-fine">Makan terakhir anda biasanya lewat malam. Cuba majukan sedikit demi sedikit — lebih awal lebih baik untuk tidur dan selera.</div>';
  if(p.doc) h+='<div class="lb-safe">'+ic('warning')+'<div><div class="t">Dengan nasihat doktor</div><div class="s">Anda menyatakan keadaan yang memerlukan nasihat doktor. Buka puasa segera jika pening, lemah atau berdebar.</div></div></div>';
  h+='<button class="authalt" onclick="ifQuizStart()">Bina semula pelan</button>';
  return h;
}

/* the quiz, Simple's way: one question a screen */
var IF_Q=[
  {k:'goal', t:'Apa matlamat utama anda?', o:[['loss','Turun berat & lemak'],['habit','Kawal selera & tabiat makan'],['energy','Lebih bertenaga & fokus'],['try','Sekadar ingin mencuba']]},
  {k:'exp', t:'Pernah amalkan IF?', o:[['none','Belum pernah'],['some','Pernah cuba sekali-sekala'],['yes','Ya, selalu amalkan']]},
  {k:'meals', t:'Berapa kali anda makan sehari?', o:[['2','1–2 kali'],['3','3 kali'],['4','4 kali atau lebih, termasuk snek']]},
  {k:'end', t:'Bila biasanya anda makan kali terakhir?', o:[['1140','Sebelum 7 malam'],['1200','7 hingga 9 malam'],['1320','9 hingga 11 malam'],['1380','Selepas 11 malam']]},
  {k:'safe', t:'Ada mana-mana yang berkaitan dengan anda?', multi:true, o:[['preg','Hamil'],['bf','Sedang menyusu'],['u18','Bawah 18 tahun'],['ed','Pernah ada masalah pemakanan (binge, anoreksia, bulimia)'],['dm','Diabetes dan ambil insulin atau ubat gula'],['gi','Gastrik atau ulser yang teruk'],['none','Tiada']]}
];
function ifQuizStart(){ if(!ifOwned()) return openPaywall(''); ifQ=0; _ifAns={safe:[]}; renderIF(); $('screen').scrollTop=0; }
function ifQuiz(){
  if(ifQ>=IF_Q.length) return ifResult();
  var q=IF_Q[ifQ], pct=Math.round(ifQ/IF_Q.length*100), sel=_ifAns[q.k];
  var h='<div class="if-qbar"><i style="width:'+pct+'%"></i></div><div class="if-qk">Soalan '+(ifQ+1)+' daripada '+IF_Q.length+'</div>'+
    '<div class="if-qt">'+q.t+'</div>'+(q.multi?'<div class="if-qs">Pilih semua yang berkaitan.</div>':'')+'<div class="if-opts">';
  h+=q.o.map(function(o){
    var on=q.multi ? (sel||[]).indexOf(o[0])>=0 : sel===o[0];
    return '<button class="if-opt'+(on?' on':'')+'" onclick="ifPick(\''+q.k+'\',\''+o[0]+'\')">'+o[1]+(on?glyph('check'):'')+'</button>'; }).join('');
  h+='</div>';
  if(q.multi) h+='<button class="bigbtn if-btn" '+((sel||[]).length?'':'disabled')+' onclick="ifQ++;renderIF()">Seterusnya</button>';
  return h;
}
function ifPick(k,v){
  var q=IF_Q[ifQ];
  if(q.multi){
    var a=_ifAns[k]||[];
    if(v==='none') a=['none']; else { a=a.filter(function(x){ return x!=='none'; }); var i=a.indexOf(v); if(i>=0) a.splice(i,1); else a.push(v); }
    _ifAns[k]=a; renderIF(); return;
  }
  _ifAns[k]=v; ifQ++; renderIF(); $('screen').scrollTop=0;
}
function ifResult(){
  var s=_ifAns.safe||[], block=['preg','bf','u18','ed'].some(function(x){ return s.indexOf(x)>=0; }), doc=['dm','gi'].some(function(x){ return s.indexOf(x)>=0; });
  var endMin=Math.min(+(_ifAns.end||1200), 20*60), late=+(_ifAns.end||0)>=1320;
  var h='<div class="if-qbar"><i style="width:100%"></i></div>';
  if(block){
    h+='<div class="lb-safe">'+ic('warning')+'<div><div class="t">IF tidak disyorkan untuk anda sekarang</div><div class="s">'+
      'Untuk wanita hamil atau menyusu, bawah 18 tahun, atau yang pernah ada masalah pemakanan, berpuasa boleh membawa risiko. '+
      'Dapatkan nasihat doktor. Anda masih boleh belajar tentang IF di tab Ilmu.</div></div></div>'+
      '<button class="bigbtn if-btn" onclick="ifSave(true,false,'+endMin+','+late+')">Faham</button>';
    return h;
  }
  h+='<div class="if-qk">Pelan anda sudah siap</div><div class="if-qt">Pelan IF 4 Minggu</div>';
  h+='<div class="ac-eps">'+IF_PROTO.map(function(pr,i){ var st=endMin-pr.e*60;
    return '<div class="ac-ep"><span class="n">'+(i+1)+'</span><div class="tx"><div class="t">Minggu '+(i+1)+' · '+pr.n+'</div>'+
      '<div class="m">Makan '+ifHm(st)+' hingga '+ifHm(endMin)+'</div></div></div>'; }).join('')+'</div>';
  if(late) h+='<div class="lb-fine d6-fine">Anda biasa makan lewat malam. Pelan ini tamatkan makan pada 8 malam — mula dengan langkah kecil.</div>';
  if(doc) h+='<div class="lb-safe">'+ic('warning')+'<div><div class="t">Dapatkan nasihat doktor dahulu</div><div class="s">'+
    'Diabetes dengan ubat, atau gastrik/ulser teruk, memerlukan nasihat doktor sebelum berpuasa. Teruskan hanya jika doktor anda membenarkan.</div></div></div>';
  h+='<button class="bigbtn if-btn" onclick="ifSave(false,'+doc+','+endMin+','+late+')">'+(doc?'Doktor saya benarkan · Mula':'Mula Pelan Ini')+'</button>';
  return h;
}
function ifSave(block,doc,endMin,late){
  var d=ifData();
  d.plan={start:iso(0), endMin:endMin, late:!!late, doc:!!doc, blocked:!!block, ans:_ifAns};
  HF.save(); ifQ=-1; ifSeg=block?'learn':'timer'; renderIF(); $('screen').scrollTop=0;
}

/* ── Ilmu ── */
function ifLearn(){
  var d=ifData(), n=IF_LESSONS.filter(function(l){ return d.read[l.id]; }).length;
  var h=fsec('Ilmu IF',n+' daripada '+IF_LESSONS.length+' dibaca');
  h+='<div class="ac-eps">'+IF_LESSONS.map(function(l,i){
    var lock=i>=IF_FREE && !ifOwned(), done=!!d.read[l.id];
    return '<div class="ac-ep'+(done?' done':'')+'" onclick="'+(lock?'openPaywall(\'\')':'ifOpenLesson('+i+')')+'"><span class="n">'+(done?glyph('check'):(i+1))+'</span>'+
      '<div class="tx"><div class="t">'+l.t+'</div><div class="m">Pelajaran '+(i+1)+(i<IF_FREE&&!ifOwned()?' · percuma':'')+'</div></div>'+
      (lock?'<span class="ac-tag">'+glyph('lock')+'</span>':'')+'<span class="pdx-chev">›</span></div>';
  }).join('')+'</div>';
  h+='<div class="aic-fine">Ilmu ini untuk pendidikan umum, bukan nasihat perubatan. Dikemas kini daripada ebook IF Seth Hitfat (2021).</div>';
  return h;
}
function ifOpenLesson(i){ if(i>=IF_FREE && !ifOwned()) return openPaywall(''); ifLesson=i; renderIF(); $('screen').scrollTop=0; }
function ifLessonHTML(i){
  var l=IF_LESSONS[i], d=ifData();
  var h='<div class="ac-ep-h"><div class="k">Ilmu IF · Pelajaran '+(i+1)+' daripada '+IF_LESSONS.length+'</div><div class="t">'+l.t+'</div></div>';
  h+=l.p.map(function(x){ return '<p class="d6-read if-p">'+hesc(x)+'</p>'; }).join('');
  h+='<div class="ac-mis"><div class="k">'+glyph('target')+'Ingat</div><div class="t">'+l.k.map(hesc).join('<br>')+'</div></div>';
  if(!d.read[l.id]) h+='<button class="bigbtn if-btn" onclick="ifRead('+i+')">Faham, tandakan dibaca</button>';
  else h+='<div class="d6-done">'+glyph('check')+'Sudah dibaca</div>';
  if(IF_LESSONS[i+1]) h+='<button class="authalt" onclick="ifOpenLesson('+(i+1)+')">Seterusnya: '+IF_LESSONS[i+1].t+' ›</button>';
  return h;
}
function ifRead(i){ ifData().read[IF_LESSONS[i].id]=true; HF.save(); toast('Pelajaran dibaca'); if(IF_LESSONS[i+1]) ifOpenLesson(i+1); else { ifLesson=null; renderIF(); } }

/* ── Sejarah ── */
function ifHistory(){
  if(!ifOwned()) return ifLocked('Sejarah puasa','Setiap puasa anda direkod: berapa jam, dan sama ada sasaran dicapai.');
  var log=ifData().log, h='';
  if(!log.length) return '<div class="if-start">'+glyph('chart')+'<div class="t">Belum ada puasa direkod</div><div class="s">Tamatkan puasa pertama anda di tab Pemasa.</div></div>';
  var hit=log.filter(function(x){ return x.hrs>=x.target; }).length, avg=Math.round(log.slice(0,7).reduce(function(a,x){ return a+x.hrs; },0)/Math.min(7,log.length)*10)/10;
  h+='<div class="d6-budrow"><div><b>'+log.length+'</b><span>puasa</span></div><div><b>'+hit+'</b><span>capai sasaran</span></div><div><b>'+avg+'j</b><span>purata 7 terakhir</span></div></div>';
  var last=log.slice(0,7).reverse(), mx=Math.max(16,Math.max.apply(null,last.map(function(x){ return x.hrs; })));
  h+='<div class="if-bars" style="grid-template-columns:repeat('+last.length+',minmax(0,44px))">'+last.map(function(x){ return '<div><i class="'+(x.hrs>=x.target?'ok':'')+'" style="height:'+Math.round(x.hrs/mx*100)+'%"></i><span>'+Math.round(x.hrs)+'j</span></div>'; }).join('')+'</div>';
  h+='<div class="lb-days">'+log.slice(0,20).map(function(x){
    return '<div class="lb-dayrow d6-row"><div class="tx"><div class="t">'+new Date(x.at).toLocaleDateString('ms-MY',{weekday:'short',day:'numeric',month:'short'})+'</div>'+
      '<div class="m">'+x.hrs+' jam · sasaran '+x.target+' jam</div></div>'+(x.hrs>=x.target?glyph('check'):'')+'</div>'; }).join('')+'</div>';
  return h;
}

function ifLocked(title,text){
  return '<div class="wl-lock">'+ic('lock')+'<div class="t">'+title+'</div><div class="s">'+text+' Sebahagian daripada HITFAT+.</div>'+
    '<button class="bigbtn if-btn" onclick="openPaywall(\'\')">Sertai HITFAT+</button></div>';
}

/* ── Home: the IF card, live while fasting ── */
function ifHomeCard(){
  var d=ifData(), p=ifPlan(), sub, t, k='IF HITFAT · Puasa Berselang';
  if(ifOwned() && d.active){
    var el=Date.now()-d.active.at, tgt=d.active.target*3600000;
    t='Sedang puasa · '+ifDur(el); sub=el>=tgt?'Sasaran '+d.active.target+' jam dicapai — boleh buka puasa':'Lagi '+ifDur(tgt-el)+' ke '+d.active.target+' jam';
  } else if(ifOwned() && p && !p.blocked){
    var w=ifWindow(); t='Minggu '+(ifWeek()+1)+' · '+ifProto().n; sub='Makan '+ifHm12(w.start)+' – '+ifHm12(w.end)+' · tekan untuk mula puasa';
  } else { t='Puasa berselang, cara HITFAT'; sub='Belajar IF, dapatkan pelan 4 minggu dan pemasa puasa'; }
  var pct=(ifOwned()&&d.active)?Math.min(100,Math.round((Date.now()-d.active.at)/(d.active.target*36000))):0;
  return '<div class="ac-card if-card" onclick="openIF()"><span class="ic">'+glyph('clock')+'</span><div class="tx">'+
    '<div class="k">'+k+'</div><div class="t">'+t+'</div><div class="s">'+sub+'</div>'+
    (pct?'<div class="pbar if-bar"><i style="width:'+pct+'%"></i></div>':'')+'</div><span class="pdx-chev">›</span></div>';
}
