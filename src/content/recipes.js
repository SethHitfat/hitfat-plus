/* ═══ Buku Resipi (draft, 25 Oct 2026; after Everfit's on-demand recipe books) ═══
   Recipes for the dishes the app already photographs (ladies/img/menu), one
   serving each, the portions the menu uses (a fist of rice, a palm of
   protein), kcal as the menu gives them. Seth reviews before any of it goes
   into the app. Book 1 first, so the style can be checked; books 2 to 4
   follow the same shape. */
var RB_BOOKS=[
  {id:'bekal', t:'Bekal Pejabat', s:'Masak malam ni, bawa esok. 10 hidangan tengah hari.', recipes:[
    {n:'Ayam Masak Kicap', img:'/ladies/img/menu/d11.jpg', min:25, k:500,
     bahan:['Nasi putih, 1 genggam (150 g)','Ayam tanpa kulit, 1 tapak tangan (120 g), potong kecil','1 ulas bawang putih, cincang','¼ biji bawang besar, hiris','1 sudu besar kicap manis','1 sudu kecil kicap masin','1 sudu kecil minyak','3 sudu besar air','Sayur campur (lobak, kobis, kacang buncis), 2 genggam'],
     cara:['Panaskan minyak, tumis bawang putih dan bawang besar hingga wangi.','Masukkan ayam, gaul hingga bertukar warna, lebih kurang 5 minit.','Masukkan kicap manis, kicap masin dan air. Masak api perlahan 8 hingga 10 minit hingga kuah pekat.','Celur sayur dalam air mendidih 2 minit, atau tumis dengan sedikit air.','Isi bekas: nasi, ayam dengan kuah sedikit, sayur.'],
     tip:'Kuah sedikit sahaja: kicap manis itu gula. Tahan 3 hari dalam peti sejuk.'},
    {n:'Ikan Bakar & Kangkung', img:'/ladies/img/menu/d12.jpg', min:25, k:480,
     bahan:['Nasi perang, 1 genggam (150 g)','Ikan kembung, 1 ekor sederhana','½ sudu kecil serbuk kunyit','Garam secubit dan perahan limau','Kangkung, 2 genggam','1 ulas bawang putih, cincang','1 sudu kecil minyak','1 sudu kecil sos tiram (pilihan)'],
     cara:['Lumur ikan dengan kunyit, garam dan limau. Perap 10 minit.','Bakar dalam air fryer 180°C 12 hingga 15 minit, atau atas kuali leper. Terbalikkan sekali.','Tumis bawang putih dengan minyak, masukkan kangkung dan sos tiram. Kacau 1 hingga 2 minit.','Hidang dengan nasi perang.'],
     tip:'Air fryer jimat minyak. Ikan bakar sejuk pun sedap untuk bekal.'},
    {n:'Mi Sup Ayam', img:'/ladies/img/menu/d13.jpg', min:20, k:430,
     bahan:['Mi kuning, 1 genggam (100 g)','Dada ayam, 1 tapak tangan','400 ml air','1 ulas bawang putih, ketuk','2 hiris halia','Sawi, 1 genggam','Garam dan lada sulah','Daun bawang dan sedikit bawang goreng'],
     cara:['Didihkan air bersama bawang putih dan halia. Masukkan ayam, rebus 12 minit hingga masak.','Angkat ayam dan carik halus.','Perasakan sup dengan garam dan lada sulah.','Celur mi dan sawi dalam sup 1 hingga 2 minit.','Tuang ke mangkuk, tabur ayam, daun bawang dan sedikit bawang goreng.'],
     tip:'Untuk bekal, bawa sup dalam termos berasingan supaya mi tak kembang.'},
    {n:'Telur Dadar Sayur', img:'/ladies/img/menu/d14.jpg', min:15, k:450,
     bahan:['Nasi putih, 1 genggam (150 g)','2 biji telur','Sayur dicincang (lobak, kobis, daun bawang), 1 genggam','¼ biji bawang besar, cincang','Garam dan lada sulah','1 sudu kecil minyak','Timun, ½ batang, potong dadu','1 sudu kecil sambal dan perahan limau'],
     cara:['Pukul telur bersama sayur, bawang, garam dan lada.','Panaskan minyak dalam kuali tak melekat. Tuang telur, masak api sederhana 3 minit setiap belah.','Gaul timun dengan sambal dan limau.','Hidang dengan nasi.'],
     tip:'Dengan kuali tak melekat, satu sudu kecil minyak sudah cukup.'},
    {n:'Daging Masak Merah', img:'/ladies/img/menu/d15.jpg', min:40, k:520,
     bahan:['Nasi putih, 1 genggam (150 g)','Daging lembu, 1 tapak tangan (120 g), hiris nipis','1 sudu besar cili kisar','½ biji bawang besar dan 1 ulas bawang putih, kisar','2 sudu besar sos tomato','½ sudu kecil gula','Garam secukup rasa','1 sudu kecil minyak','100 ml air','Sawi, 2 genggam'],
     cara:['Rebus daging dengan sedikit air dan garam 20 minit hingga lembut.','Tumis bahan kisar dan cili kisar hingga pecah minyak, 5 hingga 7 minit.','Masukkan sos tomato, gula dan daging bersama sedikit air rebusan. Masak hingga kuah pekat.','Tumis sawi dengan sedikit bawang putih.','Hidang dengan nasi, kuah sedikit.'],
     tip:'Masak sekali untuk 3 hari dan simpan dalam bekas berasingan.'},
    {n:'Nasi Goreng Kampung', img:'/ladies/img/menu/d16.jpg', min:15, k:520,
     bahan:['Nasi sejuk (nasi semalam), 1 genggam','1 sudu besar ikan bilis','1 ulas bawang putih, 2 biji bawang merah, 2 biji cili padi, tumbuk','Kangkung atau sawi, 1 genggam','1 sudu kecil minyak','1 biji telur','Garam sedikit','Timun'],
     cara:['Goreng telur mata dengan sedikit minyak, ketepikan.','Dalam kuali yang sama, tumis bahan tumbuk dan ikan bilis hingga wangi.','Masukkan nasi dan gaul rata, kemudian sayur. Masak 2 hingga 3 minit.','Perasakan dengan sedikit garam (ikan bilis sudah masin).','Hidang dengan telur mata dan timun.'],
     tip:'Nasi semalam lebih kering, jadi tak perlu banyak minyak.'},
    {n:'Sup Daging & Sayur', img:'/ladies/img/menu/d18.jpg', min:45, k:480,
     bahan:['Nasi putih, 1 genggam (150 g)','Daging lembu, 1 tapak tangan, potong dadu','500 ml air','1 sudu kecil rempah sup (atau kayu manis, bunga lawang, buah pelaga)','1 ulas bawang putih dan 2 hiris halia','Lobak merah dan 1 biji kentang kecil, potong','Daun sup','Kobis, 1 genggam, dan ½ sudu kecil minyak'],
     cara:['Rebus daging dengan bawang putih, halia dan rempah sup 30 minit.','Masukkan lobak dan kentang, masak lagi 10 minit.','Perasakan dengan garam dan tabur daun sup.','Tumis kobis dengan sedikit minyak.','Hidang dengan nasi.'],
     tip:'Selepas sup sejuk, buang lemak yang terapung di atas.'},
    {n:'Ikan Masak Lemak Cili Api', img:'/ladies/img/menu/d19.jpg', min:25, k:510,
     bahan:['Nasi putih, 1 genggam (150 g)','Ikan tenggiri atau kembung, 1 tapak tangan','3 biji cili padi, 1 cm kunyit hidup, 2 biji bawang merah, tumbuk','2 sudu besar santan dan 100 ml air','1 keping asam keping','Garam secukup rasa','Kacang buncis, 1 genggam, dan ½ sudu kecil minyak'],
     cara:['Rebus bahan tumbuk dengan air dan asam keping 5 minit.','Masukkan santan, didihkan perlahan sambil dikacau.','Masukkan ikan, masak 6 hingga 8 minit. Perasakan dengan garam.','Tumis kacang buncis dengan sedikit minyak.','Hidang dengan nasi, kuah sedikit.'],
     tip:'Santan dicairkan dengan air: rasanya sama, lemaknya separuh.'},
    {n:'Nasi Ayam & Sup', img:'/ladies/img/menu/n06.jpg', min:40, k:540,
     bahan:['Beras, ½ cawan','1 ulas bawang putih, 2 hiris halia, 1 helai daun pandan','Dada ayam, 1 tapak tangan','½ sudu kecil kicap dan ½ sudu kecil madu','Lada sulah','Daun bawang','Timun','Sos cili (pilihan)'],
     cara:['Rebus ayam dengan halia 15 minit. Simpan air rebusan.','Masak beras dengan bawang putih, halia, pandan dan air rebusan, tanpa minyak.','Lumur ayam dengan kicap, madu dan lada. Bakar dalam air fryer atau kuali 8 minit.','Perasakan baki air rebusan dan tabur daun bawang, jadi sup.','Hidang nasi, ayam dihiris, sup dan timun.'],
     tip:'Nasi ayam kedai dimasak dengan minyak ayam. Versi rumah ni jauh lebih ringan.'},
    {n:'Tempe & Tauhu Sambal', img:'/ladies/img/menu/n09.jpg', min:20, k:480,
     bahan:['Nasi putih, 1 genggam (150 g)','Tempe, ½ papan, potong','Tauhu keras, 1 keping, potong','1 sudu besar cili kisar','2 biji bawang merah dan 1 ulas bawang putih, hiris','1 sudu kecil gula, garam, sedikit air asam jawa','1 sudu kecil minyak','Sayur campur, 1 genggam'],
     cara:['Bakar tempe dan tauhu dalam air fryer 180°C 10 minit, atau goreng dengan sedikit minyak.','Tumis bawang dan cili kisar hingga pecah minyak.','Masukkan air asam jawa, gula dan garam. Masukkan tempe dan tauhu, gaul rata.','Celur sayur.','Hidang dengan nasi.'],
     tip:'Tempe ialah protein yang murah: sesuai untuk bajet.'}
  ]},
  {id:'sarapan', t:'Sarapan 10 Minit', s:'Pagi yang sibuk, sarapan yang betul.', recipes:[]},
  {id:'keluarga', t:'Makan Malam Keluarga', s:'Satu masakan untuk seisi rumah, ambil bahagian anda.', recipes:[]},
  {id:'snek', t:'Snek Bawah 200 kcal', s:'Ganti goreng pisang petang.', recipes:[]}
];

/* ── the books in the app (Eat → Plan) ──
   A book: its cover (its first dish), its recipes as rows. A recipe: the
   photograph, minutes and kcal, the ingredients to tick while cooking, the
   method, one tip, and I ate this. The first recipe of a book is open to
   everyone; the rest come with HITFAT+. */
var rbBook=null, rbAt=-1, rbTick={};
function rbBooks(){ return RB_BOOKS.filter(function(b){ return b.recipes.length; }); }
function rbOpen(i){ return i===0 || (typeof contentOpen==='function' && contentOpen()); }
function rbShelf(){
  var bs=rbBooks(); if(!bs.length) return '';
  return fsec('Recipe Books','Cook it yourself, in the app\'s portions.')+
    '<div class="rb-shelf">'+bs.map(function(b){ var mins=b.recipes.reduce(function(a,r){ return a+r.min; },0);
      return '<button class="rb-cover" onclick="openRecipeBook(\''+b.id+'\')" style="background-image:url(\''+(b.cover||b.recipes[0].img)+'\')">'+
        '<span class="ov"></span><span class="tx"><small>'+b.recipes.length+' recipes</small><b>'+hesc(b.t)+'</b><em>'+hesc(b.s)+'</em></span></button>'; }).join('')+'</div>';
}
function openRecipeBook(id){ rbBook=id; rbAt=-1; hidePanels(); $('recipes').style.display='block'; renderRecipes(); $('screen').scrollTop=0; }
function openRecipe(i){ var b=rbFind(); if(!b) return; if(!rbOpen(i)){ openPaywall(''); return; } rbAt=i; renderRecipes(); $('screen').scrollTop=0; }
function rbFind(){ for(var i=0;i<RB_BOOKS.length;i++) if(RB_BOOKS[i].id===rbBook) return RB_BOOKS[i]; return null; }
function rbBack(){ if(rbAt>=0){ rbAt=-1; renderRecipes(); $('screen').scrollTop=0; } else { eatSeg='plan'; switchTab('eat'); } }
function rbTickIng(k){ rbTick[k]=!rbTick[k]; var y=$('screen').scrollTop; renderRecipes(); $('screen').scrollTop=y; }
/* she cooked it and ate it: today's diary, macros in her target's proportions */
function rbEat(){
  var b=rbFind(), r=b&&b.recipes[rbAt]; if(!r) return;
  var n=HF.data.nutrition||{}, cal=n.cal||0, pp=cal&&n.pt?n.pt*4/cal:0.2, cp=cal&&n.ct?n.ct*4/cal:0.5, fp=cal&&n.ft?n.ft*9/cal:0.3;
  logMeal({name:r.n, bm:r.n, kcal:r.k, p:Math.round(r.k*pp/4), c:Math.round(r.k*cp/4), f:Math.round(r.k*fp/9), src:'recipe', img:r.img});
  toast('Logged: '+r.n);
}
function renderRecipes(){
  var b=rbFind(), el=$('rb-body'); if(!b||!el) return;
  var h='<button class="back" onclick="rbBack()"><span class="bk-c" aria-hidden="true"></span>'+(rbAt>=0?hesc(b.t):'Eat')+'</button>';
  if(rbAt<0){
    h+='<div class="rb-hero" style="background-image:url(\''+(b.cover||b.recipes[0].img)+'\')"><span class="ov"></span><div class="tx"><small>Recipe Book · '+b.recipes.length+' recipes</small><b>'+hesc(b.t)+'</b><span>'+hesc(b.s)+'</span></div></div>';
    h+='<div class="rb-list">'+b.recipes.map(function(r,i){ var open=rbOpen(i);
      return '<button class="rb-row" onclick="openRecipe('+i+')"><span class="ph" style="background-image:url(\''+r.img+'\')"></span>'+
        '<span class="tx"><b>'+hesc(r.n)+'</b><span>'+r.min+' min · '+r.k+' kcal · 1 serving</span></span>'+
        '<span class="go">'+(open?'›':glyph('lock'))+'</span></button>'; }).join('')+'</div>';
    if(!(typeof contentOpen==='function'&&contentOpen())) h+='<div class="rb-lock">'+glyph('lock')+'<div><b>The first recipe is free.</b><span>Every recipe comes with HITFAT+.</span></div><button onclick="openPaywall(\'\')">Unlock</button></div>';
  } else {
    var r=b.recipes[rbAt];
    h+='<div class="rb-photo" style="background-image:url(\''+r.img+'\')"></div>'+
      '<div class="rb-head"><b>'+hesc(r.n)+'</b><div class="chips"><span>'+glyph('clock')+r.min+' min</span><span>'+glyph('flame')+r.k+' kcal</span><span>'+glyph('person')+'1 serving</span></div></div>'+
      '<div class="rb-sec">Ingredients</div><div class="rb-ings">'+r.bahan.map(function(x,i){ var k=b.id+':'+rbAt+':'+i, on=!!rbTick[k];
        return '<button class="rb-ing'+(on?' on':'')+'" onclick="rbTickIng(\''+k+'\')"><span class="b">'+(on?glyph('check'):'')+'</span><span>'+hesc(x)+'</span></button>'; }).join('')+'</div>'+
      '<div class="rb-sec">Method</div><ol class="rb-steps">'+r.cara.map(function(x){ return '<li>'+hesc(x)+'</li>'; }).join('')+'</ol>'+
      (r.tip?'<div class="rb-tip">'+glyph('spark')+'<div><b>Tip</b><span>'+hesc(r.tip)+'</span></div></div>':'')+
      '<button class="bigbtn rb-eat" onclick="rbEat()">'+glyph('check')+'I ate this</button>'+
      '<div class="nfoot" style="text-align:center;">kcal is an estimate for the portion written.</div>'+
      (rbAt+1<b.recipes.length?'<button class="authalt" onclick="openRecipe('+(rbAt+1)+')">Next: '+hesc(b.recipes[rbAt+1].n)+' ›</button>':'');
  }
  el.innerHTML=h;
}
