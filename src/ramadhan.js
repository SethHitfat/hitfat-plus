/* ═══════════════ RAMADHAN FIT 30 (Ramadhan 2027) ═══════════════
   27 Nov 2026, Seth: "ni buat progrm baru bukan features". A program of its
   own: sold on its own only (a HITFAT+ membership does not open it: only
   the purchase prog_ramfit does), price to be set later, 30 days of
   Ramadhan with 14 days of Prep as a bonus, each day a lesson and a mission.
   Built 26 Nov as features (Seth: "aku nak buat features untuk ramadhan
   nanti", the lakaran in HITFAT-Buddy-teaser/_projek/ramadhan/lakaran, then
   "Ok, teruskan"). Ideas taken from studying the Ramadan Reset guidebook, made
   for Malaysia: a shorter, hotter fast (13–14 hours), bazar Ramadhan, moreh
   after terawih, Raya open houses and puasa enam. Nothing from the book's
   text, recipes or numbers is copied.

     Home          the red band: day of Ramadhan, time to berbuka or imsak
     Today's Plan  water 6 points, Iftar in 2 Steps, the session at the
                   member's own time, fasting today (the old Mod Ramadan row)
     Training      pick a level (Move Daily · Iftar Ready 12 · After Iftar 20)
                   and a time (five, none in the morning after sahur)
     Water         six points from sahur to bed, each one a glass for the
                   HITFAT Score; today's sweet drinks in teaspoons (drinks.js)
     Iftar         buka kecil → Maghrib → makan utama, the quarter plate,
                   the scan, Peraturan Satu at the bazar, moreh
     My Ramadhan   14 days of Prep, 30 days of Ramadhan, then Syawal with
                   puasa enam

   Prayer times are worked out on the phone from the member's state (JAKIM's
   angles: Subuh 20°, Isyak 18°, 2 minutes ihtiyati, imsak 10 minutes before
   Subuh), within a minute or two of the e-Solat timetable, and the app says
   "anggaran". Ramadhan's dates are the estimate in score2.js (SC_RAMADAN).

   Not here yet: the price and the payment (prog_ramfit in pay-create,
   pay-callback, pay-status), Bara's push reminders (plus-push), the share
   card, a 30-day menu, its own videos and photos. Hidden (RAM_LIVE=false):
   only the listed accounts see it, they get it as if bought, and they can
   preview any day with the demo buttons. ES5. */

var RAM_LIVE=false, RAM_TESTERS=['sethnasser1991@gmail.com','hitfat91@gmail.com'];
var RAM_DAY1=(typeof SC_RAMADAN!=='undefined' && SC_RAMADAN[0][0]) || '2027-02-08';
var RAM_PREP=14, RAM_DAYS=30, RAM_SYAWAL=30, RAM_STEPS=6000;
/* the program. RF_PRICE 0 = not on sale yet (Seth, 27 Nov: "Tentukan kemudian") */
var RF_ID='ramfit', RF_NAME='RAMADHAN FIT 30', RF_SUB='30 hari kekal aktif dan sihat masa puasa', RF_PRICE=0;

/* one lesson and one mission a day: [title, lesson, mission]. Plain advice, no health claims */
var RF_LESSON=[
  ['Sahur itu bekalan','Sahur ialah makan terakhir sebelum 13–14 jam puasa. Pilih yang kenyang lama: nasi atau roti dengan telur, ayam atau ikan, dan sayur.','Bangun sahur, minum segelas air dulu.'],
  ['Air sedikit-sedikit','Air tak boleh dikejar sekali gus masa berbuka. Bahagikan dari berbuka sampai sahur: 6 titik dalam tab Water.','Siapkan 4 daripada 6 titik air.'],
  ['Berbuka 2 langkah','Buka kecil dulu: kurma, air, sup atau buah. Solat Maghrib, baru makan utama. Perut lebih selesa untuk terawih.','Cuba Iftar in 2 Steps malam ini.'],
  ['Pilih waktu latihan','Waktu terbaik ialah waktu yang awak boleh kekal 30 hari. Masa berpuasa, ringan sahaja.','Pilih tahap dan waktu dalam tab Training.'],
  ['Tidur yang cukup','Sahur dan terawih memendekkan tidur malam. Tidur awal lepas terawih, dan lelap sekejap siang jika boleh.','Tidur sebelum 11:30 malam.'],
  ['Langkah dikira','Jalan ke surau, jalan lepas terawih, kemas rumah: semua dikira. Tak perlu gym untuk kekal aktif.','Capai 6,000 langkah hari ini.'],
  ['Air manis masa berbuka','Sirap, air tebu dan teh tarik biasanya gula paling banyak hari itu. Pilih kurang manis atau segelas sahaja.','Rekod minuman berbuka dalam Water.'],
  ['Bazar Ramadhan','Bazar penuh godaan. Peraturan Satu: 1 kuih, 1 lauk, 1 air. Pilih yang paling awak nak.','Ke bazar dengan Peraturan Satu.'],
  ['Gorengan','Gorengan sekali-sekala tak apa. Kalau hari ini ada karipap, esok pilih lauk bakar, rebus atau masak sup.','Satu hidangan tanpa gorengan hari ini.'],
  ['Pinggan suku-suku','Separuh pinggan sayur atau ulam, suku nasi, suku lauk. Cara mudah tanpa kira kalori.','Makan utama ikut pinggan suku-suku.'],
  ['Protein masa sahur','Telur, ayam, ikan, tempe atau susu masa sahur membantu awak rasa kenyang lebih lama.','Masukkan satu protein dalam sahur.'],
  ['Kurma secukupnya','Kurma cara mudah untuk berbuka. Satu hingga tiga biji sudah cukup sebelum makan utama.','Berbuka dengan 1–3 biji kurma.'],
  ['Moreh lepas terawih','Moreh ialah makan ketiga yang ramai tak kira. Ambil satu, dan scan supaya Bara tahu.','Jika ada moreh, ambil satu sahaja.'],
  ['Hari letih','Ada hari badan tak larat. Pada hari itu, buat Move Daily: jalan 10 minit pun cukup. Rutin tak putus.','Bergerak 10 minit walau letih.'],
  ['Separuh jalan','Dah 15 hari! Lihat kalendar awak: kotak merah ialah hari awak berjaya.','Semak kalendar dan sambung rentak.'],
  ['Terawih pun bergerak','Berdiri, rukuk dan sujud dalam terawih ialah pergerakan juga. Bawa botol air ke masjid.','Bawa botol air ke terawih.'],
  ['Sayur dan buah','Tembikai, oren, timun dan tomato banyak air. Tambah satu dalam berbuka atau sahur.','Tambah satu buah atau sayur berair.'],
  ['Kopi dan teh','Kopi atau teh tetap boleh, tapi jangan jadikan ia pengganti air kosong. Minum lepas makan, bukan masa buka kecil.','Ganti satu minuman manis dengan air kosong.'],
  ['Majlis berbuka','Buka puasa di pejabat atau rumah kawan: satu pinggan, mula dengan sayur dan lauk.','Satu pinggan di majlis berbuka.'],
  ['Kekal konsisten','Tak perlu sempurna. Sasaran: kebanyakan hari, bukan setiap hari.','Siapkan sesi atau langkah hari ini.'],
  ['Minggu ketiga','Ramai mula perlahan minggu ini. Kekalkan satu tabiat paling mudah: air atau langkah.','Pilih satu tabiat dan kunci.'],
  ['10 malam terakhir','Masa untuk ibadah lebih. Kalau tidur kurang, pilih Move Daily atau sesi pendek. Tak apa.','Tukar ke sesi pendek jika perlu.'],
  ['Persiapan Raya','Kemas rumah dan membeli-belah pun pergerakan. Jalan kaki di pasar juga dikira.','Jalan kaki semasa membeli-belah.'],
  ['Kuih Raya','Kuih Raya sedap, tapi kecil-kecil itu cepat bertambah. Letak beberapa biji dalam piring, bukan makan dari balang.','Rasa kuih dalam piring, bukan dari balang.'],
  ['Sahur akhir yang baik','Hari-hari terakhir pun sahur tetap penting. Jangan tinggal walau seteguk air.','Sahur hari ini, walau ringkas.'],
  ['Rancang Syawal','Raya sebulan: rumah terbuka hampir setiap minggu. Rancang dari sekarang: satu pinggan setiap rumah.','Fikir satu peraturan untuk rumah terbuka.'],
  ['Puasa enam','Puasa enam boleh disambung dengan tabiat yang sama: sahur, air, berbuka 2 langkah.','Tanda tarikh puasa enam pertama.'],
  ['Selepas Ramadhan','Pilih dua tabiat Ramadhan untuk dibawa: contohnya air 6 titik dan jalan lepas makan malam.','Pilih dua tabiat untuk diteruskan.'],
  ['Hampir sampai','Esok mungkin hari terakhir. Lihat semula kalendar 30 hari awak dan banggalah dengan usaha awak.','Kongsi kemajuan awak dengan seseorang.'],
  ['Hari terakhir','Tahniah, awak dah sampai! Teruskan Raya dengan Raya Mode dan puasa enam dalam Calendar.','Buka Raya Mode dalam Calendar.']];
/* Prep (bonus), turning by day */
var RF_PREP=[
  ['Sedia badan','Prep 5 minit setiap hari selama 2 minggu supaya badan dah biasa bergerak sebelum puasa.','Siapkan Prep 5 hari ini.'],
  ['Kurangkan manis','Mula kurangkan teh tarik atau kopi manis sedikit demi sedikit dari sekarang: kurang manis dulu, kemudian kosong.','Tukar satu minuman ke kurang manis.'],
  ['Cuba sahur awal','Cuba bangun awal sekali dua sebelum Ramadhan supaya badan biasa dengan jadual sahur.','Tidur 30 minit lebih awal malam ini.'],
  ['Pilih waktu','Fikir waktu latihan awak masa Ramadhan nanti, dan pilih tahap dalam Training.','Pilih tahap dan waktu latihan.']];

/* the state capitals, for the prayer times: [key, name, lat, lng] */
var RAM_NEGERI=[
  ['kl','Kuala Lumpur',3.139,101.687],['pj','Putrajaya',2.926,101.696],['sel','Selangor (Shah Alam)',3.073,101.518],
  ['ns','Negeri Sembilan (Seremban)',2.726,101.938],['mel','Melaka',2.189,102.250],['jhr','Johor (Johor Bahru)',1.492,103.741],
  ['phg','Pahang (Kuantan)',3.807,103.326],['trg','Terengganu (Kuala Terengganu)',5.329,103.137],['kel','Kelantan (Kota Bharu)',6.125,102.238],
  ['prk','Perak (Ipoh)',4.597,101.090],['png','Pulau Pinang',5.414,100.329],['kdh','Kedah (Alor Setar)',6.121,100.367],
  ['pls','Perlis (Kangar)',6.441,100.198],['sbh','Sabah (Kota Kinabalu)',5.980,116.073],['swk','Sarawak (Kuching)',1.553,110.359],
  ['lbn','Labuan',5.280,115.241]];

/* the five times to train. "at" turns today's prayer times into the hour of the session */
var RAM_SLOTS=[
  {k:'pre',     t:'30–45 minit sebelum berbuka', s:'Dalam rumah, ringan sahaja. Berbuka terus lepas habis.', tag:'Ringan', c:'am', at:function(T){ return T.maghrib-0.75; }},
  {k:'maghrib', t:'Lepas Maghrib',               s:'Buka kecil dulu (kurma + air), solat, latih, baru makan utama.', tag:'Disyorkan', c:'ok', at:function(T){ return T.maghrib+0.33; }},
  {k:'iftar2h', t:'1–2 jam lepas berbuka',       s:'Paling selesa kalau tak ke terawih. Makan sederhana dulu.', tag:'Disyorkan', c:'ok', at:function(T){ return T.maghrib+1.5; }},
  {k:'terawih', t:'Lepas terawih',               s:'Sesi pendek sebelum tidur. Jangan potong tidur terlalu banyak.', tag:'Popular', c:'red', at:function(T){ return T.isyak+1.5; }},
  {k:'sahur',   t:'Sebelum sahur',               s:'Untuk yang memang biasa bangun awal. Sahur jadi makan lepas latihan.', tag:'Awal', c:'gr', at:function(T){ return T.imsak-1.25; }}];

/* the three levels. Easy has no session: the day's steps are its training */
var RAM_TIERS=[
  {k:'easy',   e:'EASY',   n:'Move Daily',     d:'Tiada sesi. Sasaran 6,000 langkah: jalan ke surau, jalan lepas terawih, kemas rumah.', m:['6,000 langkah','Semua umur'], c:'g'},
  {k:'medium', e:'MEDIUM', n:'Iftar Ready 12', d:'12 minit ringan dalam rumah, sesuai sebelum berbuka. Tiada lompat.', m:['12 minit','Tiada lompat','3× seminggu'], c:'o'},
  {k:'hard',   e:'HARD',   n:'After Iftar 20', d:'20 minit kekuatan + kardio, lepas berbuka atau lepas terawih. Boleh minum air sepanjang sesi.', m:['20 minit','Lepas berbuka','4× seminggu'], c:'r'}];

/* the sessions, three versions each that turn by day; moves from the filmed library.
   [name, warm-up, main moves, rounds, work s, rest s] */
var RAM_WARM=[['Arm Forward Circle','Arm Back Circle','Calf Raises','Chair Squat'],
              ['Arm Back Circle','Towel Rotation Shoulder','Seated High Knee','Sit To Stand'],
              ['Arm Forward Circle','Towel Side Bend','Chair Calf Raises','Chair Squat']];
var RAM_SESS={
  prep:{n:'Ramadhan Prep 5', r:1, w:45, rest:15, warm:false, min:5, v:[
    ['Chair Squat','Incline Push Up (Chair)','Towel Deadlift','Seated High Knee','Seated Twist'],
    ['Sit To Stand','Towel Shoulder Press','Towel Shoulder Back Pull','Chair Calf Raises','Towel Side Bend'],
    ['Bodyweight Squat','Incline Wide Push Up','Towel Upright Row','High Knee Tap Chair','Seated Knee To Chest']]},
  ready:{n:'Iftar Ready 12', r:2, w:40, rest:20, warm:true, min:12, v:[
    ['Chair Squat','Incline Push Up (Chair)','Towel Deadlift','Towel Shoulder Press','Chair Calf Raises'],
    ['Sit To Stand','Towel Upright Row','Chair Assist Hip Abduction','Towel Shoulder Back Pull','Seated Twist'],
    ['Bodyweight Squat','Towel Squat Press','Lateral Step Over','Towel Rotation Shoulder','Towel Side Bend']]},
  after:{n:'After Iftar 20', r:3, w:40, rest:20, warm:true, min:20, v:[
    ['Bodyweight Squat','Knee Push Ups','Backpack Deadlift','Bottle Bent Over Row','High Knee','Plank'],
    ['Squat Pause','Incline Wide Push Up','Towel Squat Press','Towel Shoulder Back Pull','Butt Kick','Side Plank'],
    ['Towel Squat Overhead','Knee Push Ups','Backpack Good Morning','Towel Upright Row','Fast Feet','Bird Dog']]},
  /* the easy days in the week, and a bonus after terawih: slow, seated or standing */
  stretch:{n:'Terawih Stretch 8', r:2, w:35, rest:5, warm:false, min:8, v:[
    ['Towel Rotation Shoulder','Towel Side Bend','Seated Twist','Seated Knee To Chest','Towel Wide Front Bend','Towel Sliding Fold'],
    ['Towel Shoulder Back Pull','Towel Side Bend','Seated Twist','Chair Calf Raises','Towel Wide Front Bend','Seated Knee To Chest'],
    ['Towel Rotation Shoulder','Seated Twist','Towel Sliding Fold','Seated Knee To Chest','Towel Side Bend','Chair Calf Raises']]}};
/* the week (Beachbody-style calendar): 1 = the level's session, 0 = Terawih Stretch 8.
   Medium 3 sessions a week, Hard 4, as the levels say */
var RF_WEEK={medium:[1,0,1,0,1,0,0], hard:[1,1,0,1,1,0,0]};

/* the six water points: [name, when, glasses] */
var RAM_WATER=[['Bangun sahur','imsak',1],['Lepas sahur','imsak',1],['Berbuka','maghrib',1],['Makan malam','maghrib',1],['Bawa botol ke terawih','isyak',1],['Sebelum tidur','tidur',1]];

/* ── who sees it ── */
function ramLive(){ return RAM_LIVE || ramTester(); }
function ramTester(){ return RAM_TESTERS.indexOf(String(HF.email||'').toLowerCase())>=0; }
/* sold on its own: only the purchase opens it, never HITFAT+; a tester has it as if bought */
function rfOwned(){ return ramTester() || (typeof owns==='function' && owns('prog_'+RF_ID)); }
function rfPriceLabel(){ return RF_PRICE ? 'RM'+RF_PRICE : 'Harga akan diumumkan'; }
function rfBuy(){
  if(!RF_PRICE){ toast(RF_NAME+': harga akan diumumkan tidak lama lagi 🌙'); return; }
  if(typeof startCheckout==='function') startCheckout('prog_'+RF_ID);   /* needs prog_ramfit in the pay edge functions first */
}
function ramData(){ var r=HF.data.ram||(HF.data.ram={}); if(!r.days) r.days={}; if(!r.six) r.six=[]; return r; }

/* ── dates: "k" is the day since the 1st of Ramadhan (Prep below 0, Syawal from 30) ── */
function ramISO(dt){ return dt.getFullYear()+'-'+('0'+(dt.getMonth()+1)).slice(-2)+'-'+('0'+dt.getDate()).slice(-2); }
function ramDate(s){ var p=String(s).split('-'); return new Date(+p[0],+p[1]-1,+p[2]); }
function ramAdd(s,n){ var d=ramDate(s); d.setDate(d.getDate()+n); return ramISO(d); }
function ramDiff(a,b){ return Math.round((ramDate(b)-ramDate(a))/864e5); }
function ramToday(){ return ramISO(new Date()); }
/* a tester's demo moves day 1 so that today is the day they picked */
function ramBase(){ var r=ramData(); return (ramTester() && typeof r.demo==='number') ? ramAdd(ramToday(),-r.demo) : RAM_DAY1; }
function ramK(d){ return ramDiff(ramBase(), d||ramToday()); }
function ramPhase(k){ if(k==null) k=ramK(); return k<-RAM_PREP?'before' : k<0?'prep' : k<RAM_DAYS?'ram' : k<RAM_DAYS+RAM_SYAWAL?'syawal' : 'after'; }
function ramOn(){ return ramLive() && ramPhase()==='ram'; }
function ramDay(d,mk){ var r=ramData(); d=d||ramToday(); if(mk && !r.days[d]) r.days[d]={}; return r.days[d]||{}; }
function ramSetDemo(k){ var r=ramData(); if(k===null) delete r.demo; else r.demo=k; HF.save(); ramRefresh(); }

/* ── prayer times (anggaran) ── */
function ramNeg(){ var k=ramData().neg||'kl'; for(var i=0;i<RAM_NEGERI.length;i++) if(RAM_NEGERI[i][0]===k) return RAM_NEGERI[i]; return RAM_NEGERI[0]; }
function ramTimes(d){
  var n=ramNeg(), lat=n[2], lng=n[3], p=String(d||ramToday()).split('-'), y=+p[0], m=+p[1], dd=+p[2], R=Math.PI/180;
  function f360(a){ return a-360*Math.floor(a/360); }
  function f24(h){ return h-24*Math.floor(h/24); }
  if(m<=2){ y-=1; m+=12; }
  var A=Math.floor(y/100), B=2-A+Math.floor(A/4);
  var jd=Math.floor(365.25*(y+4716))+Math.floor(30.6001*(m+1))+dd+B-1524.5-lng/360;
  function sun(t){ var D=jd+t-2451545, g=f360(357.529+0.98560028*D), q=f360(280.459+0.98564736*D),
      L=f360(q+1.915*Math.sin(g*R)+0.020*Math.sin(2*g*R)), e=23.439-0.00000036*D,
      ra=f24(Math.atan2(Math.cos(e*R)*Math.sin(L*R),Math.cos(L*R))/R/15);
    return {d:Math.asin(Math.sin(e*R)*Math.sin(L*R))/R, eq:q/15-ra}; }
  function noon(t){ return f24(12-sun(t).eq); }
  function ang(a,t,ccw){ var s=sun(t), T=Math.acos((-Math.sin(a*R)-Math.sin(s.d*R)*Math.sin(lat*R))/(Math.cos(s.d*R)*Math.cos(lat*R)))/R/15; return noon(t)+(ccw?-T:T); }
  var adj=8-lng/15, ih=2/60, subuh=ang(20,5/24,1)+adj+ih;
  return {imsak:subuh-10/60, subuh:subuh, zohor:noon(.5)+adj+ih, maghrib:ang(0.833,.75,0)+adj+ih, isyak:ang(18,.75,0)+adj+ih};
}
function ramClock(h){ var m=Math.round(h*60), H=Math.floor(m/60)%24, M=m%60, ap=H<12?'am':'pm', h12=H%12||12; return h12+':'+('0'+M).slice(-2)+' '+ap; }
function ramNowH(){ var n=new Date(); return n.getHours()+n.getMinutes()/60+n.getSeconds()/3600; }
function ramLeft(h){ var m=Math.max(0,Math.round(h*60)), H=Math.floor(m/60), M=m%60; return H?(H+' jam '+M+' minit'):(M+' minit'); }

/* ── training ── */
function ramTier(){ return ramData().tier||''; }
function ramSlot(){ var k=ramData().slot||'maghrib'; for(var i=0;i<RAM_SLOTS.length;i++) if(RAM_SLOTS[i].k===k) return RAM_SLOTS[i]; return RAM_SLOTS[1]; }
/* Hard is never done fasting: before berbuka it is Iftar Ready 12 */
function ramSessKey(k){
  if(k==null) k=ramK();
  var ph=ramPhase(k);
  if(ph==='prep') return 'prep';
  if(ph!=='ram') return '';
  var t=ramTier(); if(!RF_WEEK[t]) return '';
  if(!RF_WEEK[t][((k%7)+7)%7]) return 'stretch';
  return t==='medium' ? 'ready' : (ramSlot().k==='pre'?'ready':'after');
}
function ramEx(n,dur,rest){
  if(typeof mfEx==='function') return mfEx(n,dur,rest,'');
  var e=DB.filter(function(x){ return x.n===n && x.v; })[0]||{};
  return {n:n, v:e.v||'', m:e.m||'Full Body', t:e.t||'full', dur:dur, rest:rest, eq:'Bodyweight'};
}
function ramExercises(key,k){
  var s=RAM_SESS[key]; if(!s) return [];
  var v=((k%3)+3)%3, L=[], r, i;
  if(s.warm) RAM_WARM[v].forEach(function(n){ var e=ramEx(n,30,0); e.mfw='warm'; L.push(e); });
  for(r=0;r<s.r;r++) for(i=0;i<s.v[v].length;i++) L.push(ramEx(s.v[v][i],s.w,s.rest));
  return L;
}
function ramMinutes(key,k){ return Math.round(ramExercises(key,k).reduce(function(a,e){ return a+e.dur+(e.rest||0); },0)/60); }
function ramPlay(){
  var k=ramK(), key=ramSessKey(k);
  if(!key){ openRam('latih'); return; }
  startWorkout(ramExercises(key,k),{rounds:1, name:RAM_SESS[key].n, key:'ram-'+key+'-'+ramToday()});
}
function ramTrained(d){ return typeof scWorkouts==='function' && scWorkouts(d||ramToday())>0; }
function ramSetTier(t){ ramData().tier=t; HF.save(); toast(t==='easy'?'Move Daily: 6,000 langkah sehari 🚶':'Tahap disimpan: '+RAM_TIERS.filter(function(x){ return x.k===t; })[0].n); ramRefresh(); }
function ramSetSlot(s){ ramData().slot=s; HF.save(); var T=ramTimes(); toast('Waktu latihan: '+ramClock(ramSlot().at(T))); ramRefresh(); }
function ramSetNeg(v){ ramData().neg=v; HF.save(); ramRefresh(); }

/* ── water: each point is one glass in the HITFAT Score ── */
function ramWaterN(d){ var w=ramDay(d).w||0, n=0, i; for(i=0;i<RAM_WATER.length;i++) if(w&(1<<i)) n++; return n; }
function ramWaterTap(i){
  var o=ramDay(null,1), all=HF.data.daily||(HF.data.daily={}), d=ramToday(), dy=all[d]||(all[d]={water:0,steps:0}), bit=1<<i;
  if((o.w||0)&bit){ o.w&=~bit; dy.water=Math.max(0,(dy.water||0)-RAM_WATER[i][2]); }
  else { o.w=(o.w||0)|bit; dy.water=(dy.water||0)+RAM_WATER[i][2]; if(ramWaterN()===RAM_WATER.length && typeof scBanner==='function') scBanner('6 / 6 titik air 💧','Bara bangga dengan awak. Esok kita buat lagi!'); }
  HF.save(); ramRefresh();
}
function ramSugarTsp(){ if(typeof drToday!=='function') return 0; var g=drToday().reduce(function(a,x){ return a+(x.sugar||0); },0); return Math.round(g/4); }

/* ── Iftar in 2 Steps ── */
function ramIftarTap(i){
  var o=ramDay(null,1), bit=1<<i;
  if((o.i||0)&bit) o.i&=~bit; else { o.i=(o.i||0)|bit; if(i===0) o.it=Date.now(); }
  HF.save(); ramRefresh();
}
function ramPrayLeft(){ var o=ramDay(); if(!o.it || ((o.i||0)&2)) return 0; return Math.max(0,15*60-Math.round((Date.now()-o.it)/1000)); }

/* ── Syawal: puasa enam ── */
function ramSixTap(){
  var r=ramData(), d=ramToday(), i=r.six.indexOf(d);
  if(i>=0) r.six.splice(i,1); else if(r.six.length<6){ r.six.push(d); if(r.six.length===6 && typeof scBanner==='function') scBanner('Puasa enam: lengkap 🌙','Tahniah awak! Enam hari dah siap.'); }
  HF.save(); ramRefresh();
}

/* ── Bara's line for the hour ── */
function ramBara(){
  var ph=ramPhase(), T=ramTimes(), h=ramNowH(), o=ramDay();
  if(ph==='before') return 'Ramadhan dah dekat! Prep 5 minit bermula 2 minggu sebelum puasa. Jom sedia sama-sama.';
  if(ph==='prep') return ramTrained()?'Prep hari ni dah siap. Badan awak makin bersedia!':'Prep 5 minit je hari ni. Badan senang sikit nanti masa puasa.';
  if(ph==='syawal') return 'Selamat Hari Raya! Rumah terbuka: satu pinggan, satu kuih. Puasa enam jangan lupa ya.';
  if(h<T.imsak) return 'Jangan tinggal sahur! Air segelas dulu, kemudian makan yang kenyang lama.';
  if(h<T.maghrib-1) return 'Penat sikit tu biasa. Rehat kejap lepas Zohor kalau boleh, dan jalan perlahan-lahan.';
  if(h<T.maghrib) return 'Sikit lagi awak! Siapkan kurma dengan air dulu. Lepas Maghrib baru makan besar ya.';
  if(!((o.i||0)&2)) return 'Selamat berbuka! Buka kecil, solat Maghrib, baru makan utama.';
  if(h<T.isyak+1.5) return 'Jangan lupa bawa botol air ke terawih ya.';
  return 'Moreh lepas terawih? Ambil satu je. Lepas tu tidur awal, sahur nanti.';
}
function ramPose(){ var ph=ramPhase(), h=ramNowH(), T=ramTimes(); return ph==='ram' && h>=T.maghrib ? 'meal' : ph==='ram' ? 'water' : ph==='syawal' ? 'cheer' : 'walk'; }
function ramImg(p){ return '/img/mascot/anim/'+p+'.png'; }

/* ── Home: the red band ── */
function ramBand(){
  var ph=ramPhase(), k=ramK(), T=ramTimes(), h=ramNowH(), kick='', big='', sub='', pills=[];
  if(ph==='before'){ kick='Ramadhan HITFAT 2027'; big='Ramadhan dalam '+(-k)+' hari'; sub='Prep 5 minit bermula '+ramNice(ramAdd(ramBase(),-RAM_PREP))+' · anggaran'; pills=['🌙 30 hari','🏃 3 tahap']; }
  else if(ph==='prep'){ kick='Prep · Hari '+(RAM_PREP+k+1)+' / '+RAM_PREP; big='Ramadhan dalam '+(-k)+' hari'; sub='Sesi 5 minit hari ni · '+ramNice(ramBase())+' (anggaran)'; pills=['⏱ 5 minit',ramTrained()?'✓ Dah siap':'▶ Belum']; }
  else if(ph==='ram'){
    kick='Ramadhan · Hari '+(k+1)+' / '+RAM_DAYS;
    if(h<T.imsak){ big='Imsak <span id="ram-cd">'+ramLeft(T.imsak-h)+'</span> lagi'; sub='Imsak '+ramClock(T.imsak)+' · Subuh '+ramClock(T.subuh); }
    else if(h<T.maghrib){ big='Berbuka <span id="ram-cd">'+ramLeft(T.maghrib-h)+'</span> lagi'; sub='Maghrib '+ramClock(T.maghrib)+' · Imsak esok '+ramClock(ramTimes(ramAdd(ramToday(),1)).imsak); }
    else { big='Selamat berbuka 🌙'; sub='Isyak '+ramClock(T.isyak)+' · Imsak esok '+ramClock(ramTimes(ramAdd(ramToday(),1)).imsak); }
    pills=['🌙 '+ramFasted()+' hari puasa','💧 '+ramWaterN()+' / 6'];
  }
  else if(ph==='syawal'){ kick=k===RAM_DAYS?'1 Syawal (anggaran)':'Syawal · Hari '+(k-RAM_DAYS+1); big=k===RAM_DAYS?'Selamat Hari Raya!':'Puasa enam '+ramData().six.length+' / 6'; sub='Maaf zahir batin dari HITFAT 🤍'; pills=['🌙 '+ramFasted()+' hari puasa']; }
  else return '';
  return '<div class="ramb" onclick="openRam()"><div class="ramb-moon"></div><div class="ramb-k">'+hesc(kick)+'</div><div class="ramb-big">'+big+'</div>'+
    '<div class="ramb-sub">'+hesc(sub)+'</div><div class="ramb-pills">'+pills.map(function(p){ return '<span>'+hesc(p)+'</span>'; }).join('')+'</div></div>';
}
function ramNice(s){ return ramDate(s).toLocaleDateString('ms-MY',{day:'numeric',month:'short'}); }
function ramFasted(){ var all=HF.data.daily||{}, b=ramBase(), n=0, i; for(i=0;i<RAM_DAYS;i++){ var o=all[ramAdd(b,i)]; if(o&&o.ram) n++; } return n; }
function ramHomeCard(){
  if(!ramLive() || !rfOwned()) return '';
  var ph=ramPhase(); if(ph==='after' || (ph==='before' && !ramTester() && ramK()<-RAM_PREP-14)) return '';
  return '<div class="ramh">'+ramBand()+'<div class="ramh-bara" onclick="openRam()"><img src="'+ramImg(ramPose())+'" alt=""><div><b>Bara</b>'+hesc(ramBara())+'</div></div></div>';
}

/* the Program row on Home: for someone who has not bought it */
function rfHomeTile(){
  if(!ramLive() || rfOwned() || ramPhase()==='after') return '';
  return typeof hpoTile==='function' ? hpoTile({t:RF_NAME, kick:RF_PRICE?'RM'+RF_PRICE:'Akan datang', lv:'30 hari · lelaki & wanita', pal:'red', glyph:'moon', go:'openRam()'}) : '';
}

/* ── Today's Plan rows (score2.js scPlanHTML) ── */
function ramPlanRows(){
  if(!ramLive() || !rfOwned()) return [];
  var ph=ramPhase(), rows=[], k=ramK(), key=ramSessKey(k), dy=(typeof scDaily==='function')?scDaily():{}, sl=ramSlot(), T=ramTimes();
  if(ph==='prep') rows.push({ic:'workout', t:'Ramadhan Prep 5', s:'5 minit · bonus RAMADHAN FIT 30', done:ramTrained(), go:'ramPlay()', b:'Start'});
  if(ph!=='ram') { if(ph==='syawal') rows.push({ic:'moon', t:'Puasa enam '+ramData().six.length+' / 6', s:'Tanda hari awak puasa', done:ramData().six.indexOf(ramToday())>=0, go:'ramSixTap()', b:'Mark'}); return rows; }
  var wn=ramWaterN();
  rows.push({ic:'water', t:'Water '+wn+' / 6', s:wn<6?'Titik seterusnya: '+RAM_WATER[ramNextWater()][0].toLowerCase():'Semua titik siap', done:wn>=6, go:"openRam('air')", b:'Open'});
  rows.push({ic:'food', t:'Iftar in 2 Steps', s:'Buka kecil → Maghrib → makan utama', done:((ramDay().i||0)&3)===3, go:"openRam('buka')", b:'Open'});
  if(key) rows.push({ic:'workout', t:RAM_SESS[key].n, s:ramMinutes(key,k)+' minit · '+ramClock(sl.at(T))+' · '+sl.t.toLowerCase(), done:ramTrained(), go:'ramPlay()', b:'Start'});
  else rows.push({ic:'steps', t:'Steps '+(dy.steps||0).toLocaleString('en-US')+' / '+RAM_STEPS.toLocaleString('en-US'), s:ramTier()?'Jalan ke surau pun dikira':'Pilih tahap latihan Ramadhan awak', done:(dy.steps||0)>=RAM_STEPS, go:"openRam('latih')", b:ramTier()?'':'Pilih'});
  rows.push({ic:'moon', t:dy.ram?'Fasting today ✓':'Fasting today', s:'Tanda bila dah berbuka', done:!!dy.ram, go:'scRamToggle()', b:dy.ram?'':'Mark'});
  return rows;
}
function ramNextWater(){ var w=ramDay().w||0, i; for(i=0;i<RAM_WATER.length;i++) if(!(w&(1<<i))) return i; return RAM_WATER.length-1; }

/* ── the Ramadhan page ── */
var ramSeg='hari', ramPick=null, _ramTick=null;
function openRam(seg){
  if(!ramLive()) return;
  hidePanels(); $('ramp').style.display='block';
  ramSeg=seg||(ramTier()?'hari':'mula'); ramPick=null;
  renderRam(); $('screen').scrollTop=0;
}
function ramBack(){ switchTab(curTab||'home'); }
function ramSet(x){ ramSeg=x; renderRam(); }
function ramRefresh(){
  if($('ramp') && $('ramp').style.display==='block') renderRam();
  if(typeof renderHome==='function' && $('home') && $('home').style.display!=='none') renderHome();
}
function renderRam(){
  var el=$('ramp-body'); if(!el) return;
  if(!rfOwned()){ el.innerHTML=rfSalesHTML(); return; }
  var top=rfParent(ramSeg), h='<div class="rf-name"><span>'+glyph('moon')+'</span>'+RF_NAME+'</div><div class="ramp-top">'+ramBand()+'</div>';
  h+='<div class="rf-tabs ram-noprint">'+RF_TABS.map(function(x){
    return '<button class="'+(top===x[0]?'on':'')+'" onclick="ramSet(\''+x[0]+'\')">'+x[1]+'</button>'; }).join('')+'</div>';
  if(top!==ramSeg) h+='<button class="rf-back ram-noprint" onclick="ramSet(\''+top+'\')">‹ '+rfTabName(top)+'</button>';
  var sg=ramSeg;
  h+= sg==='mula' ? rfStartHTML() : sg==='hari' ? rfTodayHTML() : sg==='wk' ? rfWorkoutsHTML() : sg.indexOf('w:')===0 ? rfWkHTML(sg.slice(2)) :
      sg==='kal' ? ramCalHTML() : sg==='makan' ? rfNutriHTML() : sg==='menu' ? rfMenuHTML() : sg==='bahan' ? rfMatHTML() : sg==='cetak' ? rfPrintHTML() :
      sg.indexOf('g:')===0 ? rfGuideHTML(sg.slice(2)) : sg==='air' ? ramWaterHTML() : sg==='buka' ? ramIftarHTML() : ramTrainHTML();
  if(/^(mula|latih|hari|kal)$/.test(sg)) h+=ramSettingsHTML();
  el.innerHTML=h;
  ramTickStart();
}
function ramTickStart(){
  if(_ramTick) return;
  _ramTick=setInterval(function(){
    var cd=$('ram-cd'), pr=$('ram-pray');
    if(!cd && !pr){ clearInterval(_ramTick); _ramTick=null; return; }
    var T=ramTimes(), h=ramNowH();
    if(cd) cd.textContent=ramLeft((h<T.imsak?T.imsak:T.maghrib)-h);
    if(pr){ var s=ramPrayLeft(); pr.textContent=Math.floor(s/60)+':'+('0'+s%60).slice(-2); }
  },1000);
}

function ramTrainHTML(){
  var t=ramTier(), s=ramSlot(), T=ramTimes(), k=ramK(), key=ramSessKey(k), h='';
  h+='<div class="ram-h">Ramadhan Training</div><div class="ram-p">30 hari · pilih tahap awak</div>';
  h+=RAM_TIERS.map(function(x){
    return '<div class="ram-lvl ram-'+x.c+(t===x.k?' on':'')+'" onclick="ramSetTier(\''+x.k+'\')"><div class="ram-lvl-e">'+x.e+(t===x.k?' · PILIHAN AWAK':'')+'</div>'+
      '<div class="ram-lvl-n">'+x.n+'</div><div class="ram-lvl-d">'+hesc(x.d)+'</div><div class="ram-lvl-m">'+x.m.map(function(m){ return '<span>'+m+'</span>'; }).join('')+'</div></div>';
  }).join('');
  if(t && t!=='easy'){
    h+='<div class="ram-h" style="margin-top:20px">Bila awak nak latih?</div><div class="ram-p">Pilih satu. Boleh tukar bila-bila.</div>';
    h+=RAM_SLOTS.map(function(x){
      var dis=(t==='hard' && x.k==='pre');
      return '<div class="ram-opt'+(s.k===x.k?' on':'')+'" onclick="ramSetSlot(\''+x.k+'\')"><span class="ram-radio"></span><div class="ram-opt-b"><b>'+hesc(x.t)+'</b>'+
        '<span>'+hesc(dis?'After Iftar 20 tak dibuat masa berpuasa. Waktu ni awak dapat Iftar Ready 12.':x.s)+'</span><em>'+ramClock(x.at(T))+' hari ini (anggaran)</em></div><span class="ram-tag ram-t-'+x.c+'">'+x.tag+'</span></div>';
    }).join('');
  }
  h+='<div class="ram-warn">☀️ Cuaca Malaysia panas. Masa berpuasa, jangan latihan berat dan jangan latih di luar. Rasa pening, loya atau berdebar: berhenti, duduk, dan berbuka jika perlu. Ada sakit atau ubat? Tanya doktor dulu.</div>';
  if(key) h+='<button class="ram-go" onclick="ramPlay()">'+glyph('play')+'Start '+RAM_SESS[key].n+' · '+ramMinutes(key,k)+' min</button>';
  else if(ramPhase()==='before') h+='<div class="ram-note">Sesi bermula dengan Prep 5 minit pada '+ramNice(ramAdd(ramBase(),-RAM_PREP))+'.</div>';
  h+=ramBaraHTML('walk', t==='easy'?'Tak sempat latih pun takpe. Jalan ke surau pun dah kira langkah awak!':'Pilih waktu yang awak boleh kekal 30 hari. Konsisten lebih penting dari berat.');
  return h;
}

function ramWaterHTML(){
  var o=ramDay(), w=o.w||0, n=ramWaterN(), T=ramTimes(), nx=ramNextWater(), C=2*Math.PI*52, tsp=ramSugarTsp(), h='';
  var when={imsak:'sebelum imsak '+ramClock(T.imsak), maghrib:'Maghrib '+ramClock(T.maghrib), isyak:'Isyak '+ramClock(T.isyak), tidur:'sebelum tidur'};
  h+='<div class="ram-h">Water · Ramadhan</div><div class="ram-p">Enam titik, dari sahur sampai tidur. Setiap titik satu gelas.</div>';
  h+='<div class="ram-ring"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="52" class="ram-ring-bg"/><path d="M60 8a52 52 0 1 1 0 104a52 52 0 1 1 0-104" class="ram-ring-fg" stroke-dasharray="'+(C*n/6).toFixed(1)+' '+C.toFixed(1)+'"/></svg><div><b>'+n+'/6</b><span>titik air</span></div></div>';
  h+='<div class="ram-card">'+RAM_WATER.map(function(x,i){ var on=!!(w&(1<<i));
    return '<div class="ram-li" onclick="ramWaterTap('+i+')"><span class="ram-chk'+(on?' on':'')+'"></span><div class="ram-li-b"><b>'+x[0]+'</b><span>'+x[2]+' gelas · '+when[x[1]]+'</span></div>'+(!on&&i===nx&&n<6?'<span class="ram-tag ram-t-red">Seterusnya</span>':'')+'</div>'; }).join('')+'</div>';
  if(tsp>0) h+='<div class="ram-warn ram-warn-r" onclick="drOpen(\'sirap\')">🌸 Air manis hari ini ≈ '+tsp+' sudu teh gula (anggaran). Esok cuba "kurang manis" atau air kosong?</div>';
  else h+='<div class="ram-note">Minum sirap, air tebu atau teh tarik masa berbuka? <a onclick="drOpen(\'sirap\')">Rekod di sini</a> dan Bara kira gulanya.</div>';
  h+=ramBaraHTML('water', n>=6?'6 / 6! Bara bangga dengan awak.':'Awak dah '+n+'/6. '+(nx===4?'Jangan lupa bawa botol ke terawih ya.':'Sikit-sikit, lama-lama penuh.'));
  return h;
}

function ramIftarHTML(){
  var o=ramDay(), i=o.i||0, left=ramPrayLeft(), h='';
  h+='<div class="ram-h">Iftar in 2 Steps</div><div class="ram-p">Selamat berbuka 🌙</div><div class="ram-card">';
  h+='<div class="ram-step" onclick="ramIftarTap(0)"><span class="ram-no">1</span><div class="ram-li-b"><b>Buka kecil</b><span>Kurma 1–3 biji · air 1–2 gelas · sup atau buah</span></div><span class="ram-chk'+(i&1?' on':'')+'"></span></div>';
  h+='<div class="ram-step"><span class="ram-no ram-no-g">'+glyph('clock')+'</span><div class="ram-li-b"><b>Solat Maghrib dulu</b><span>Bagi perut rehat sekejap</span></div>'+
     ((i&1)&&!(i&2)?'<span class="ram-timer" id="ram-pray">'+Math.floor(left/60)+':'+('0'+left%60).slice(-2)+'</span>':'')+'</div>';
  h+='<div class="ram-step" onclick="ramIftarTap(1)"><span class="ram-no">2</span><div class="ram-li-b"><b>Makan utama</b><span>Satu pinggan, ikut bahagian di bawah</span></div><span class="ram-chk'+(i&2?' on':'')+'"></span></div>';
  h+='<div class="ram-plate-row"><div class="ram-plate"></div><div class="ram-legend"><div><i class="g"></i>Separuh sayur / ulam</div><div><i class="y"></i>Suku nasi</div><div><i class="r"></i>Suku lauk (ayam, ikan, telur)</div></div></div>';
  h+='<button class="ram-go" onclick="openScan(\'meal\')">'+glyph('photo')+'Scan pinggan saya</button></div>';
  h+='<div class="ram-card">'+
    '<div class="ram-li"><span class="ram-ico">🛍️</span><div class="ram-li-b"><b>Bazar: Peraturan Satu</b><span>1 kuih, 1 lauk, 1 air. Pilih yang paling awak nak, bukan semua yang ada.</span></div></div>'+
    '<div class="ram-li"><span class="ram-ico">🍵</span><div class="ram-li-b"><b>Moreh lepas terawih</b><span>Ambil satu sahaja · scan supaya dikira</span></div></div>'+
    '<div class="ram-li"><span class="ram-ico">🍳</span><div class="ram-li-b"><b>Sahur kilat (10 minit)</b><span>Telur rebus + roti, oat + kurma, atau nasi semalam + lauk. Air segelas dulu.</span></div></div></div>';
  h+=ramBaraHTML('meal', (i&3)===3?'Berbuka cara HITFAT: siap! Perut selesa untuk terawih.':'Pelan-pelan makan. Bara tunggu awak habis solat dulu.');
  return h;
}

function ramCalHTML(){
  var b=ramBase(), k=ramK(), all=HF.data.daily||{}, r=ramData(), h='', i, w, d, cls;
  function cell(i,inner,cls,lab){ return '<div class="ram-d '+cls+(i===k?' now':'')+'" onclick="rfOpenDay('+i+')"><b>'+inner+'</b>'+(lab?'<i>'+lab+'</i>':'')+'</div>'; }
  h+='<div class="ram-h">Program Calendar</div><div class="ram-p">Prep 2 minggu (bonus) · 30 hari · Syawal. Tekan hari untuk buka pelajaran dan sesinya.</div>';
  for(w=0;w<2;w++){
    h+='<div class="ram-sec">Prep · Minggu '+(w+1)+'</div><div class="ram-dots rf-week">';
    for(i=-RAM_PREP+w*7;i<-RAM_PREP+w*7+7;i++){ d=ramAdd(b,i); cls=d>ramToday()?'':ramTrained(d)?'p':''; h+=cell(i,cls==='p'?'✓':(RAM_PREP+i+1),cls,'Prep 5'); }
    h+='</div>';
  }
  for(w=0;w<5;w++){
    h+='<div class="ram-sec">Ramadhan · Minggu '+(w+1)+(w===4?' (akhir)':'')+'</div><div class="ram-dots rf-week">';
    for(i=w*7;i<Math.min(RAM_DAYS,w*7+7);i++){ d=ramAdd(b,i); cls=(all[d]&&all[d].ram)?'x':''; h+=cell(i,i+1,cls,rfShort(ramSessKey(i))); }
    h+='</div>';
  }
  h+='<div class="rf-key"><span><i class="x"></i>Puasa ditanda</span><span><i class="p"></i>Prep siap</span><span><i class="n"></i>Hari ini</span></div>';
  h+='<div class="ram-sec">Raya Mode · Syawal</div><div class="ram-card"><div class="ram-p" style="margin:0 0 8px"><b>Puasa enam</b> · tanda bila dah puasa</div><div class="ram-dots ram-six">';
  for(i=0;i<6;i++) h+='<div class="ram-d '+(i<r.six.length?'rx':'r')+'">'+(i<r.six.length?'✓':(i+1))+'</div>';
  h+='</div>'+(ramPhase()==='syawal'?'<button class="ram-go2" onclick="ramSixTap()">'+(r.six.indexOf(ramToday())>=0?'Batal tanda hari ini':'Saya puasa hari ini')+'</button>':'')+
    '<div class="ram-p" style="margin-top:10px">🏠 Rumah terbuka? Peraturan Satu: 1 pinggan, 1 kuih.</div></div>';
  h+='<button class="ram-go2 ram-noprint" onclick="ramSet(\'cetak\')">'+glyph('calendar')+' Kalendar untuk dicetak</button>';
  h+=ramBaraHTML('calendar', 'Satu kotak sehari. Awak dah '+ramFasted()+' hari puasa bulan ni.');
  return h;
}
/* the session's short name on a calendar day */
function rfShort(key){ return key==='ready'?'12 min':key==='after'?'20 min':key==='stretch'?'Stretch':key==='prep'?'Prep 5':ramTier()==='easy'?'Jalan':''; }

function ramBaraHTML(pose,txt){ return '<div class="ram-bara"><img src="'+ramImg(pose)+'" alt=""><div><b>Bara</b>'+hesc(txt)+'</div></div>'; }
function ramSettingsHTML(){
  var neg=ramNeg()[0], h='<div class="ram-set"><div class="ram-sec">Waktu solat</div>'+
    '<select class="inp" onchange="ramSetNeg(this.value)">'+RAM_NEGERI.map(function(n){ return '<option value="'+n[0]+'"'+(n[0]===neg?' selected':'')+'>'+n[1]+'</option>'; }).join('')+'</select>'+
    '<div class="ram-p" style="margin-top:6px">Waktu dikira di telefon (anggaran, beza 1–2 minit). Ikut azan masjid atau JAKIM untuk waktu tepat. Tarikh Ramadhan juga anggaran sehingga pengumuman rasmi.</div>';
  if(ramTester()){
    var dm=ramData().demo;
    h+='<div class="ram-sec">Demo (tester sahaja)</div><div class="ram-demo">'+[['Off',null],['Prep H5',-10],['Hari 1',0],['Hari 12',11],['Hari 30',29],['Raya',30],['Syawal H8',37]].map(function(x){
      return '<button class="'+(dm===x[1]||(x[1]===null&&typeof dm!=='number')?'on':'')+'" onclick="ramSetDemo('+(x[1]===null?'null':x[1])+')">'+x[0]+'</button>'; }).join('')+'</div>';
  }
  return h+'</div>';
}


/* ── RAMADHAN FIT 30: the day ── */
function rfLessonOf(k){ return k<0 ? RF_PREP[((k%RF_PREP.length)+RF_PREP.length)%RF_PREP.length] : RF_LESSON[Math.min(k,RAM_DAYS-1)]; }
function rfOpenDay(k){ ramPick=k; ramSeg='hari'; renderRam(); try{ $('screen').scrollTop=0; }catch(e){} }
function rfTodayHTML(){
  var now=ramK(), k=(ramPick===null?now:ramPick), ph=ramPhase(k), h='', L, key, today=(k===now);
  if(ph==='before'){ k=-RAM_PREP; ph='prep'; today=false; }
  if(ph==='syawal' || ph==='after'){
    h+='<div class="rf-day"><div class="rf-day-k">Syawal</div><div class="rf-day-t">Selamat Hari Raya!</div><div class="rf-day-p">Awak dah habis RAMADHAN FIT 30 dengan '+ramFasted()+' hari puasa. Raya Mode dan puasa enam ada dalam Calendar.</div>'+
       '<button class="ram-go" onclick="ramSet(\'kal\')">'+glyph('calendar')+'Buka Raya Mode</button></div>';
    return h+ramBaraHTML('cheer','Maaf zahir batin! Satu pinggan setiap rumah terbuka ya.');
  }
  L=rfLessonOf(k); key=ph==='prep'?'prep':ramSessKey(k);
  var lab=ph==='prep' ? 'Prep (bonus) · Hari '+(RAM_PREP+k+1)+' / '+RAM_PREP : 'Hari '+(k+1)+' / '+RAM_DAYS;
  h+='<div class="rf-nav">'+(k>-RAM_PREP?'<button onclick="rfOpenDay('+(k-1)+')">‹</button>':'<span></span>')+
     '<b>'+lab+(today?' · Hari ini':'')+'</b>'+(k<RAM_DAYS-1?'<button onclick="rfOpenDay('+(k+1)+')">›</button>':'<span></span>')+'</div>';
  h+='<div class="rf-day"><div class="rf-day-k">Pelajaran</div><div class="rf-day-t">'+hesc(L[0])+'</div><div class="rf-day-p">'+hesc(L[1])+'</div>'+
     '<div class="rf-mis"><span>🎯</span><div><b>Misi hari ini</b>'+hesc(L[2])+'</div></div></div>';
  h+='<div class="ram-sec">Latihan</div>';
  if(key) h+='<div class="rf-sess" onclick="'+(today?'ramPlay()':'')+'"><div><b>'+RAM_SESS[key].n+'</b><span>'+ramMinutes(key,k)+' minit'+(ph==='ram'?' · '+ramClock(ramSlot().at(ramTimes()))+' · '+hesc(ramSlot().t.toLowerCase()):' · di rumah')+'</span></div>'+
       (today?(ramTrained()?'<em>✓ Siap</em>':'<button onclick="event.stopPropagation();ramPlay()">'+glyph('play')+'Start</button>'):'')+'</div>';
  else h+='<div class="rf-sess" onclick="ramSet(\'latih\')"><div><b>'+(ramTier()==='easy'?'Move Daily · 6,000 langkah':'Pilih tahap latihan')+'</b><span>'+(ramTier()==='easy'?'Jalan ke surau dan lepas terawih pun dikira':'Move Daily, Iftar Ready 12 atau After Iftar 20')+'</span></div><button onclick="event.stopPropagation();ramSet(\'latih\')">'+(ramTier()?'Tukar':'Pilih')+'</button></div>';
  if(ph==='ram' && today){
    var dy=(typeof scDaily==='function')?scDaily():{};
    h+='<div class="ram-sec">Hari ini</div><div class="ram-card">'+
      '<div class="ram-li" onclick="ramSet(\'air\')"><span class="ram-ico">💧</span><div class="ram-li-b"><b>Water '+ramWaterN()+' / 6</b><span>Enam titik dari sahur ke tidur</span></div></div>'+
      '<div class="ram-li" onclick="ramSet(\'buka\')"><span class="ram-ico">🍽️</span><div class="ram-li-b"><b>Iftar in 2 Steps</b><span>Buka kecil → Maghrib → makan utama</span></div><span class="ram-chk'+(((ramDay().i||0)&3)===3?' on':'')+'"></span></div>'+
      '<div class="ram-li" onclick="scRamToggle();ramRefresh()"><span class="ram-ico">🌙</span><div class="ram-li-b"><b>Fasting today</b><span>Tanda bila dah berbuka</span></div><span class="ram-chk'+(dy.ram?' on':'')+'"></span></div></div>';
  }
  return h+ramBaraHTML(ramPose(), today?ramBara():'Hari '+(k<0?(RAM_PREP+k+1)+' Prep':(k+1))+': '+L[2]);
}

/* ══ The program laid out like a streaming program page (Seth, 27 Nov 2026:
   "konsep penyusunan semua kita tiru macam Beachbody on demand"): Start Here,
   Today, Workouts, Calendar, Nutrition, Materials. Only the way it is laid
   out is borrowed; the names, look and words are HITFAT's. Every move plays
   the filmed HITFAT+ library clip (Seth: "kan ada video database yang
   hitfat+ sebelum ni"). ══ */
var RF_TABS=[['mula','Start Here'],['hari','Today'],['wk','Workouts'],['kal','Calendar'],['makan','Nutrition'],['bahan','Materials']];
var RF_NUTRI_G=['sahur','porsi','bazar','manis','tidur'];
function rfParent(sg){
  if(sg==='latih') return 'mula';
  if(sg.indexOf('w:')===0) return 'wk';
  if(sg==='air' || sg==='buka' || sg==='menu') return 'makan';
  if(sg==='cetak') return 'kal';
  if(sg.indexOf('g:')===0) return RF_NUTRI_G.indexOf(sg.slice(2))>=0 ? 'makan' : 'bahan';
  return sg;
}
function rfTabName(k){ for(var i=0;i<RF_TABS.length;i++) if(RF_TABS[i][0]===k) return RF_TABS[i][1]; return 'Back'; }

/* ── Start Here ── */
var RF_VIDEO={v:'1235197860', t:'Puasa & pemakanan', s:'Nutrition Academy · 3 minit', pic:'/img/academy/m5.jpg'}, rfVidOn=false;
function rfVid(){ rfVidOn=true; renderRam(); }
function rfStartHTML(){
  var t=ramTier(), tr=RAM_TIERS.filter(function(x){ return x.k===t; })[0], sl=ramSlot(), h='';
  h+='<div class="rf-wel"><div class="rf-wel-k">Start Here</div><div class="rf-wel-t">Selamat datang ke '+RF_NAME+'</div>'+
     '<div class="rf-wel-p">30 hari kekal aktif masa puasa, di rumah. Setiap hari ada satu pelajaran, satu misi dan satu sesi pendek ikut tahap awak. Mula dengan 3 langkah di bawah.</div></div>';
  h+='<div class="ram-sec">Tonton dulu</div>';
  h+= rfVidOn && RF_VIDEO.v
    ? '<div class="rf-vid"><iframe src="'+(typeof acVimeo==='function'?acVimeo(RF_VIDEO.v):'https://player.vimeo.com/video/'+RF_VIDEO.v)+'&autoplay=1" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe></div>'
    : '<div class="rf-vcard" onclick="rfVid()"><span class="ph" style="background-image:url(\''+RF_VIDEO.pic+'\')"><i>'+glyph('play')+'</i></span><div><b>'+RF_VIDEO.t+'</b><span>'+RF_VIDEO.s+'</span></div></div>';
  h+='<div class="ram-sec">3 langkah untuk mula</div><div class="ram-card">';
  h+='<div class="ram-step" onclick="ramSet(\'latih\')"><span class="ram-no">1</span><div class="ram-li-b"><b>Pilih tahap dan waktu</b><span>'+(tr?tr.n+(t!=='easy'?' · '+hesc(sl.t.toLowerCase()):''):'Move Daily, Iftar Ready 12 atau After Iftar 20')+'</span></div><span class="ram-chk'+(t?' on':'')+'"></span></div>';
  h+='<div class="ram-step" onclick="ramSet(\'hari\')"><span class="ram-no">2</span><div class="ram-li-b"><b>Buka Today setiap hari</b><span>Pelajaran, misi dan sesi hari itu</span></div></div>';
  h+='<div class="ram-step" onclick="ramSet(\'makan\')"><span class="ram-no">3</span><div class="ram-li-b"><b>Ikut Nutrition</b><span>Air 6 titik, berbuka 2 langkah, menu 30 hari</span></div></div></div>';
  h+='<div class="ram-sec">Program Materials</div><div class="rf-mats">'+RF_MATS.slice(0,3).map(rfMatTile).join('')+'</div>';
  h+='<div class="ram-warn">☀️ Masa berpuasa, latihan ringan sahaja dan dalam rumah. Pening, loya atau berdebar: berhenti dan duduk. Ada penyakit, hamil atau makan ubat? Tanya doktor dulu. <a onclick="ramSet(\'g:selamat\')">Panduan keselamatan</a></div>';
  return h+ramBaraHTML('walk', t?'Awak dah sedia! Jumpa di Today ya.':'Jom mula dengan pilih tahap awak dulu.');
}

/* ── Workouts: every session, three versions each, plus the bonus ── */
var RF_WK=[
  {id:'p0',key:'prep',v:0,pic:'rh2'},{id:'p1',key:'prep',v:1,pic:'act-recovery'},{id:'p2',key:'prep',v:2,pic:'rh1'},
  {id:'r0',key:'ready',v:0,pic:'tw1'},{id:'r1',key:'ready',v:1,pic:'rh3'},{id:'r2',key:'ready',v:2,pic:'min3'},
  {id:'a0',key:'after',v:0,pic:'tw2'},{id:'a1',key:'after',v:1,pic:'br-beginner'},{id:'a2',key:'after',v:2,pic:'m1'},
  {id:'s0',key:'stretch',v:0,pic:'br-recovery'},{id:'s1',key:'stretch',v:1,pic:'rh2'},{id:'s2',key:'stretch',v:2,pic:'act-recovery'}];
var RF_WK_SEC=[
  ['ready','Iftar Ready 12','MEDIUM · sebelum atau lepas berbuka · tiada lompat'],
  ['after','After Iftar 20','HARD · lepas berbuka atau lepas terawih sahaja'],
  ['stretch','Terawih Stretch 8','Bonus · hari rehat atau lepas terawih'],
  ['prep','Ramadhan Prep 5','Bonus · 2 minggu sebelum puasa']];
function rfWk(id){ for(var i=0;i<RF_WK.length;i++) if(RF_WK[i].id===id) return RF_WK[i]; return null; }
function rfWkName(w){ return RAM_SESS[w.key].n+' '+'ABC'.charAt(w.v); }
function rfWkPic(w){ return '/img/p/'+w.pic+'.jpg'; }
function rfWkTile(w){
  var tk=ramSessKey(), today=(tk===w.key && ((ramK()%3)+3)%3===w.v);
  return '<div class="rf-wk" onclick="ramSet(\'w:'+w.id+'\')"><span class="ph" style="background-image:url(\''+rfWkPic(w)+'\')">'+(today?'<em>Hari ini</em>':'')+'<i>'+glyph('play')+'</i></span>'+
    '<b>'+hesc(rfWkName(w))+'</b><span>'+ramMinutes(w.key,w.v)+' min · '+RAM_SESS[w.key].v[w.v].length+' gerakan</span></div>';
}
function rfWorkoutsHTML(){
  var h='<div class="ram-h">Workouts</div><div class="ram-p">Semua sesi program. Setiap gerakan ada video coach HITFAT+. Ruang kecil, tuala, kerusi, botol air dan beg galas sahaja.</div>';
  RF_WK_SEC.forEach(function(sc){
    h+='<div class="ram-sec">'+sc[1]+'</div><div class="ram-p" style="margin-top:-4px">'+sc[2]+'</div><div class="rf-wks">'+RF_WK.filter(function(w){ return w.key===sc[0]; }).map(rfWkTile).join('')+'</div>';
  });
  return h;
}
function rfWkHTML(id){
  var w=rfWk(id); if(!w) return rfWorkoutsHTML();
  var S=RAM_SESS[w.key], L=S.v[w.v], warm=S.warm?RAM_WARM[w.v]:[], h='';
  h+='<div class="rf-wkh" style="background-image:url(\''+rfWkPic(w)+'\')"><div><div class="rf-wel-k">'+(w.key==='after'?'Hard':w.key==='ready'?'Medium':'Bonus')+'</div><div class="rf-wkh-t">'+hesc(rfWkName(w))+'</div>'+
     '<div class="rf-wkh-m"><span>'+ramMinutes(w.key,w.v)+' min</span><span>'+S.r+' pusingan</span><span>'+S.w+'s kerja · '+S.rest+'s rehat</span></div></div></div>';
  h+='<button class="ram-go" onclick="rfPlayWk(\''+w.id+'\')">'+glyph('play')+'Start · '+ramMinutes(w.key,w.v)+' min</button>';
  if(warm.length) h+='<div class="ram-sec">Memanaskan badan · 30s setiap satu</div><div class="ram-card">'+warm.map(rfMoveRow).join('')+'</div>';
  h+='<div class="ram-sec">Gerakan · '+S.r+' pusingan</div><div class="ram-card">'+L.map(rfMoveRow).join('')+'</div>';
  h+='<div class="ram-note">Tekan ▶ untuk tengok video gerakan dulu.'+(w.key==='after'?' Sesi ini untuk lepas berbuka sahaja: boleh minum air sepanjang sesi.':'')+'</div>';
  return h;
}
function rfMoveRow(n){
  var e=DB.filter(function(x){ return x.n===n && x.v; })[0]||{};
  return '<div class="ram-li" onclick="rfPreview(\''+String(n).replace(/'/g,"\\'")+'\')"><span class="rf-mv">'+glyph('play')+'</span><div class="ram-li-b"><b>'+hesc(n)+'</b><span>'+hesc((e.m||'')+(e.eq&&e.eq!=='Bodyweight'?' · '+e.eq:''))+'</span></div></div>';
}
/* one move on its own: part of the program, so no HITFAT+ needed */
function rfPreview(n){ var e=ramEx(n,30,0); if(!e.v){ toast('Video akan datang'); return; } startWorkout([e],{rounds:1, name:n, key:'ramx-'+n+'-'+ramToday()}); }
function rfPlayWk(id){ var w=rfWk(id); if(!w) return; startWorkout(ramExercises(w.key,w.v),{rounds:1, name:rfWkName(w), key:'ram-'+w.id+'-'+ramToday()}); }

/* ── Nutrition ── */
function rfNutriHTML(){
  var day=Math.min(RAM_DAYS-1,Math.max(0,ramK())), m=rfMenuDay(day), h='';
  h+='<div class="ram-h">Nutrition</div><div class="ram-p">Tak perlu kira kalori. Ikut susunan berbuka, air dan pinggan, dengan makanan biasa Malaysia.</div>';
  h+='<div class="rf-menu1" onclick="ramSet(\'menu\')"><div class="rf-wel-k">Menu hari '+(day+1)+'</div><div class="rf-m-r"><i>Sahur</i>'+hesc(m[0])+'</div><div class="rf-m-r"><i>Berbuka</i>'+hesc(m[1]+' → '+m[2])+'</div><div class="rf-m-r"><i>Malam</i>'+hesc(m[3])+'</div><span class="rf-more">Menu 30 hari ›</span></div>';
  h+='<div class="rf-mats">'+[
    ['buka','🍽️','Iftar in 2 Steps','Buka kecil, Maghrib, makan utama'],
    ['air','💧','Water 6 points','Dari sahur sampai tidur'],
    ['g:sahur','🍳','Sahur Kilat','5 pilihan siap dalam 10 minit'],
    ['g:porsi','✋','Porsi 3 cara','Tapak tangan, pinggan, sukatan'],
    ['g:bazar','🛍️','Bazar & moreh','Peraturan Satu'],
    ['g:manis','🧋','Kurangkan manis','Pelan 2 minggu sebelum puasa'],
    ['g:tidur','😴','Tidur & rehat','Bila sahur dan terawih potong tidur']].map(function(x){
      return '<div class="rf-mat" onclick="ramSet(\''+x[0]+'\')"><span>'+x[1]+'</span><b>'+x[2]+'</b><em>'+x[3]+'</em></div>'; }).join('')+'</div>';
  return h+ramBaraHTML('meal','Satu pinggan, makan perlahan. Bara pun ikut!');
}
/* the 30-day menu: everyday Malaysian food, one plate. Four lists turned at
   different steps so no two days are the same */
var RF_M_SAHUR=['Nasi 1 genggam, telur dadar sayur, air kosong','Roti mil 2 keping, telur rebus 2 biji, pisang','Oat susu, kurma 2 biji, segenggam kacang','Nasi 1 genggam, ayam masak kicap, timun',
  'Bubur nasi ayam, telur rebus','Nasi 1 genggam, ikan kukus, bayam','Lempeng pisang, telur, susu suam','Nasi 1 genggam, tempe, sup sayur','Sandwic tuna, epal','Nasi 1 genggam, sardin, ulam'];
var RF_M_BUKA=['Kurma 3 biji, air kosong','Kurma 2 biji, air, sup kosong','Kurma 2 biji, tembikai','Kurma 2 biji, air, bubur kacang hijau (mangkuk kecil)','Kurma 1 biji, air, betik','Kurma 2 biji, air, sup sayur'];
var RF_M_MAIN=['Nasi, ayam panggang, ulam','Nasi, ikan bakar, kangkung','Mi sup ayam','Nasi, daging masak merah (sedikit kuah), sayur','Nasi, asam pedas ikan, timun','Nasi, gulai ayam (kuah sedikit), sayur',
  'Nasi, ikan kukus halia, sawi','Nasi, tauhu sumbat, sup sayur','Bihun sup','Nasi, udang masak merah, taugeh','Nasi, sotong sambal kurang minyak, kacang panjang','Nasi, ayam masak halia, kailan',
  'Nasi, telur bistik, sayur','Nasi ayam, sup','Nasi, sup daging, sayur'];
var RF_M_MALAM=['Betik sepotong','Susu suam segelas','Yogurt asli','Jagung rebus','Ubi keledek rebus','Kurma 2 biji, air','Moreh: satu kuih sahaja','Tembikai sepotong'];
function rfMenuDay(i){ return [RF_M_SAHUR[(i*3)%10], RF_M_BUKA[i%6], RF_M_MAIN[(i*7)%15], RF_M_MALAM[(i*5)%8]]; }
var rfMenuPick=null;
function rfMenuGo(i){ rfMenuPick=i; renderRam(); }
function rfMenuHTML(){
  var now=Math.min(RAM_DAYS-1,Math.max(0,ramK())), d=(rfMenuPick===null?now:rfMenuPick), m=rfMenuDay(d), h='', i;
  h+='<div class="ram-h">Menu 30 hari</div><div class="ram-p">Satu pinggan setiap kali makan: separuh sayur, suku nasi (1 genggam), suku lauk (1 tapak tangan).</div><div class="rf-chips">';
  for(i=0;i<RAM_DAYS;i++) h+='<button class="'+(i===d?'on':'')+(i===now?' now':'')+'" onclick="rfMenuGo('+i+')">'+(i+1)+'</button>';
  h+='</div><div class="ram-card">'+[['🌙','Sahur',m[0]],['🌅','Buka kecil',m[1]],['🍽️','Lepas Maghrib',m[2]],['🌃','Malam / moreh',m[3]]].map(function(x){
    return '<div class="ram-li"><span class="ram-ico">'+x[0]+'</span><div class="ram-li-b"><b>'+x[1]+'</b><span>'+hesc(x[2])+'</span></div></div>'; }).join('')+'</div>';
  h+='<div class="ram-note">Air: 6 titik sehari (tab Water). Air manis? Satu gelas, kurang manis. <a onclick="ramSet(\'g:barang\')">Senarai barang dapur</a></div>';
  h+='<button class="ram-go2" onclick="openScan(\'meal\')">'+glyph('photo')+' Scan pinggan saya</button>';
  return h;
}

/* ── guides: Nutrition and Materials. HITFAT's own words, no health claims ── */
var RF_GUIDE={
  mula:{ic:'📘',t:'Quick Start Guide',p:'Semua yang awak perlu tahu dalam 1 minit.',L:[
    ['Pilih tahap','Move Daily (langkah sahaja), Iftar Ready 12 (3× seminggu) atau After Iftar 20 (4× seminggu). Boleh tukar bila-bila.'],
    ['Pilih waktu','Lima pilihan. Masa berpuasa, ringan sahaja. Sesi Hard hanya lepas berbuka.'],
    ['Setiap hari','Buka Today: pelajaran, misi dan sesi. Tanda air, berbuka 2 langkah dan puasa.'],
    ['Hari rehat','Hari tanpa sesi: Terawih Stretch 8 atau jalan kaki.'],
    ['Terlepas sehari?','Tak apa. Sambung esok. Kalendar kekal.'],
    ['Alat','Ruang kecil, tuala, kerusi, botol air dan beg galas.']]},
  selamat:{ic:'🛟',t:'Panduan keselamatan',p:'Puasa di cuaca panas. Selamat dulu, baru laju.',L:[
    ['Berhenti terus','Jika pening, loya, berdebar, sesak nafas atau rasa nak pitam: berhenti, duduk, dan berbuka jika perlu.'],
    ['Tanya doktor dulu','Kencing manis, darah tinggi, sakit jantung atau buah pinggang, hamil, menyusu, atau makan ubat.'],
    ['Masa berpuasa','Ringan dan dalam rumah sahaja. Tiada sesi berat sebelum berbuka.'],
    ['Lepas berbuka','Tunggu sekejap lepas makan utama. Minum air sepanjang sesi.'],
    ['Wanita yang uzur','Boleh teruskan sesi ringan, dan minum air semasa latihan.'],
    ['Waktu solat','Waktu dalam app ialah anggaran. Ikut azan masjid atau JAKIM.']]},
  sahur:{ic:'🍳',t:'Sahur Kilat',p:'Bangun lambat? Lima pilihan siap dalam 10 minit. Minum segelas air dulu.',L:[
    ['Telur rebus + roti mil','Rebus telur malam sebelumnya. Tambah pisang.'],
    ['Oat + kurma','Oat dengan susu atau air panas, 2 biji kurma, sedikit kacang.'],
    ['Nasi semalam + lauk','Panaskan nasi 1 genggam dengan lauk berbuka semalam dan sayur.'],
    ['Sandwic tuna','Tuna tin, roti mil, timun atau salad.'],
    ['Yogurt + buah','Yogurt asli dengan pisang atau betik, kalau tak lalu makan berat.'],
    ['Jangan tinggal sahur','Kalau sangat lambat, sekurang-kurangnya air dan kurma.']]},
  porsi:{ic:'✋',t:'Porsi 3 cara',p:'Pilih cara yang paling senang untuk awak.',L:[
    ['Cara 1: tangan','Lauk 1 tapak tangan · nasi 1 genggam · sayur 2 genggam · minyak atau santan 1 ibu jari.'],
    ['Cara 2: pinggan','Separuh pinggan sayur atau ulam, suku nasi, suku lauk.'],
    ['Cara 3: sukat','Nasi 1 cawan · lauk sebesar dek kad · sayur 2 cawan · kuah 1 senduk.'],
    ['Air manis','Segelas sahaja, pilih kurang manis.'],
    ['Kuih','Satu atau dua ketul kecil, dalam piring.']]},
  bazar:{ic:'🛍️',t:'Bazar & moreh',p:'Bazar Ramadhan dan moreh lepas terawih: nikmati, tapi ada had.',L:[
    ['Peraturan Satu','1 kuih, 1 lauk, 1 air. Pilih yang paling awak nak.'],
    ['Pergi dengan rancangan','Fikir dulu apa nak beli sebelum sampai bazar. Elak beli sebab lapar.'],
    ['Pilih cara masak','Bakar, panggang, rebus atau sup lebih kerap. Gorengan sekali-sekala.'],
    ['Air','Pilih kurang manis, air kelapa atau air kosong.'],
    ['Moreh','Ambil satu. Scan supaya Bara tahu.'],
    ['Majlis berbuka','Satu pinggan. Mula dengan sayur dan lauk.']]},
  manis:{ic:'🧋',t:'Kurangkan manis: pelan 2 minggu',p:'Mula semasa Prep, supaya Ramadhan lebih senang. Sedikit demi sedikit.',L:[
    ['Hari 1–4','Tukar teh tarik atau kopi ke "kurang manis".'],
    ['Hari 5–9','Satu daripada minuman manis sehari ditukar ke air kosong.'],
    ['Hari 10–14','Teh O atau kopi O kurang manis, atau tanpa gula.'],
    ['Kopi','Kurangkan perlahan-lahan. Ada orang rasa tak selesa bila berhenti mengejut.'],
    ['Masa Ramadhan','Segelas air manis masa berbuka cukup. Rekod dalam tab Water.']]},
  tidur:{ic:'😴',t:'Tidur & rehat',p:'Sahur dan terawih memendekkan tidur malam.',L:[
    ['Tidur awal','Lepas terawih, kurangkan skrin dan tidur lebih awal.'],
    ['Lelap sekejap','Kalau boleh, lelap 15–20 minit selepas Zohor.'],
    ['Hari letih','Pilih Terawih Stretch 8 atau jalan sahaja. Itu pun dikira.'],
    ['10 malam terakhir','Tidur kurang? Pilih sesi pendek. Tak apa.']]},
  barang:{ic:'🛒',t:'Senarai barang dapur',p:'Untuk menu 30 hari. Beli ikut keperluan seminggu.',L:[
    ['Protein','Telur, ayam, ikan, sardin atau tuna tin, tempe, tauhu, susu, yogurt asli.'],
    ['Nasi & karbohidrat','Beras, roti mil, oat, bihun atau mi, ubi keledek, jagung.'],
    ['Sayur','Bayam, kangkung, sawi, kailan, kacang panjang, taugeh, timun, tomato, ulam.'],
    ['Buah','Kurma, tembikai, betik, pisang, epal.'],
    ['Lain-lain','Kacang tanah atau badam, sup kosong, botol air untuk terawih.']]},
  faq:{ic:'❓',t:'Soalan lazim',p:'',L:[
    ['Boleh latihan masa puasa?','Ringan sahaja, dalam rumah, 30–45 minit sebelum berbuka. Sesi berat lepas berbuka.'],
    ['Saya terlepas beberapa hari.','Sambung dari hari ini. Program ikut tarikh Ramadhan, bukan "hari ke-" awak.'],
    ['Lutut saya tak boleh lompat.','Iftar Ready 12 tiada lompat. Pilih tahap Medium.'],
    ['Perlu alat?','Tuala, kerusi, botol air dan beg galas sahaja.'],
    ['Ahli HITFAT+ dapat program ini?','Tidak. RAMADHAN FIT 30 dijual berasingan.'],
    ['Waktu solat tepat?','Anggaran (beza 1–2 minit). Ikut azan masjid atau JAKIM.']]}};
function rfGuideHTML(id){
  var g=RF_GUIDE[id]; if(!g) return rfMatHTML();
  return '<div class="rf-gh"><span>'+g.ic+'</span><div><div class="ram-h">'+g.t+'</div>'+(g.p?'<div class="ram-p">'+hesc(g.p)+'</div>':'')+'</div></div>'+
    '<div class="ram-card">'+g.L.map(function(x){ return '<div class="ram-li rf-gl"><div class="ram-li-b"><b>'+hesc(x[0])+'</b><span>'+hesc(x[1])+'</span></div></div>'; }).join('')+'</div>';
}

/* ── Materials ── */
var RF_MATS=[['g:mula','📘','Quick Start Guide','Cara guna dalam 1 minit'],['cetak','🗓️','Kalendar cetak','Tampal di peti ais'],['g:barang','🛒','Senarai barang','Untuk menu 30 hari'],
  ['g:selamat','🛟','Panduan keselamatan','Bila perlu berhenti'],['menu','🍽️','Menu 30 hari','Sahur, berbuka, malam'],['g:faq','❓','Soalan lazim','Jawapan ringkas']];
function rfMatTile(x){ return '<div class="rf-mat" onclick="ramSet(\''+x[0]+'\')"><span>'+x[1]+'</span><b>'+x[2]+'</b><em>'+x[3]+'</em></div>'; }
function rfMatHTML(){
  return '<div class="ram-h">Program Materials</div><div class="ram-p">Panduan program. Semua boleh dibaca dalam app.</div><div class="rf-mats">'+RF_MATS.map(rfMatTile).join('')+'</div>'+
    ramBaraHTML('walk','Kalendar cetak tu tampal di peti ais. Pangkah setiap hari!');
}
function rfPrintHTML(){
  var b=ramBase(), h='<div class="rf-print"><div class="rf-print-t">'+RF_NAME+' · Kalendar</div><div class="ram-p">Pangkah setiap hari. Ramadhan bermula '+ramNice(b)+' (anggaran).</div><table><tr>';
  for(var i=0;i<RAM_DAYS;i++){ if(i && i%6===0) h+='</tr><tr>';
    h+='<td><b>'+(i+1)+'</b><span>'+ramNice(ramAdd(b,i))+'</span><i>'+(rfShort(ramSessKey(i))||'Jalan')+'</i><em>□ Puasa □ Air 6 □ Latih</em></td>'; }
  h+='</tr></table></div><button class="ram-go ram-noprint" onclick="rfPrint()">'+glyph('doc')+'Cetak / simpan PDF</button>';
  return h;
}
function rfPrint(){ try{ document.body.classList.add('ramprint'); window.print(); }catch(e){} setTimeout(function(){ document.body.classList.remove('ramprint'); },800); }

/* ── RAMADHAN FIT 30: for someone who has not bought it ── */
function rfSalesHTML(){
  var h='<div class="rf-hero"><div class="ramb-moon"></div><div class="rf-hero-k">Program baru · Ramadhan 2027</div><div class="rf-hero-t">'+RF_NAME+'</div>'+
    '<div class="rf-hero-s">'+hesc(RF_SUB)+'. Untuk lelaki dan wanita, di rumah.</div></div>';
  h+='<div class="rf-wks rf-wks-s">'+['r0','a1','s0'].map(function(id){ var w=rfWk(id); return '<div class="rf-wk"><span class="ph" style="background-image:url(\''+rfWkPic(w)+'\')"></span><b>'+hesc(RAM_SESS[w.key].n)+'</b><span>'+ramMinutes(w.key,w.v)+' min</span></div>'; }).join('')+'</div>';
  h+='<div class="ram-card rf-has">'+[
    ['▶️','Start Here','Video, 3 langkah untuk mula, pilih tahap dan waktu'],
    ['🗓️','30 hari, satu pelajaran dan satu misi sehari','Ditambah Prep 2 minggu sebelum puasa (bonus)'],
    ['🏃','12 sesi video, 3 tahap','Move Daily · Iftar Ready 12 · After Iftar 20 · Terawih Stretch 8. Latihan berat tak dibuat masa berpuasa'],
    ['🍽️','Menu 30 hari makanan Malaysia','Berbuka 2 langkah, air 6 titik, Sahur Kilat, porsi, bazar dan moreh'],
    ['📘','Program Materials','Kalendar cetak, senarai barang dapur, panduan keselamatan'],
    ['🕌','Waktu imsak dan berbuka ikut negeri','Kira detik terus di Home (anggaran)'],
    ['🌙','Raya Mode','Rumah terbuka dan puasa enam dalam Syawal']].map(function(x){
      return '<div class="ram-li"><span class="ram-ico">'+x[0]+'</span><div class="ram-li-b"><b>'+x[1]+'</b><span>'+x[2]+'</span></div></div>'; }).join('')+'</div>';
  h+='<button class="ram-go" onclick="rfBuy()">'+glyph('lock')+(RF_PRICE?'Dapatkan · RM'+RF_PRICE:rfPriceLabel())+'</button>';
  h+='<div class="ram-note">Dijual berasingan. Tidak termasuk dalam langganan HITFAT+.</div>';
  return h+ramBaraHTML('walk','Jom sedia untuk Ramadhan sama-sama!');
}
