/* ═══ Buku Resipi (draft, 25 Oct 2026; after Everfit's on-demand recipe books) ═══
   Recipes for the dishes the app already photographs (ladies/img/menu), one
   serving each, the portions the menu uses (a fist of rice, a palm of
   protein), kcal as the menu gives them. Seth reviews each book before it
   goes into the app. Makan Malam Keluarga cooks for four (srv): its kcal is
   her plate, and pinggan says what goes on it. */
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
  {id:'sarapan', t:'Sarapan 10 Minit', s:'Pagi yang sibuk, sarapan yang betul. Semua siap dalam 10 minit.', recipes:[
    {n:'Telur Rebus & Roti Mil Penuh', img:'/ladies/img/menu/d01.jpg', min:10, k:350,
     bahan:['2 biji telur','2 keping roti mil penuh','Timun atau tomato, beberapa hiris','Lada sulah dan garam secubit','Teh o kurang manis'],
     cara:['Masukkan telur ke dalam periuk, tuang air hingga tenggelam, didihkan.','Bila mendidih, masak 7 minit untuk kuning yang lembut, 9 minit untuk masak penuh.','Rendam telur dalam air sejuk 1 minit, kemudian kupas.','Bakar roti, susun telur dihiris dengan timun atau tomato, tabur lada dan garam.'],
     tip:'Rebus 6 biji sekali pada hari Ahad. Simpan dalam peti sejuk, tahan 5 hari.'},
    {n:'Oat Susu & Pisang', img:'/ladies/img/menu/d02.jpg', min:5, k:330,
     bahan:['Oat, 4 sudu besar (40 g)','Susu rendah lemak, 1 gelas (200 ml)','1 biji pisang','Kayu manis serbuk secubit (pilihan)'],
     cara:['Masukkan oat dan susu ke dalam periuk kecil.','Masak api sederhana 3 minit sambil dikacau hingga pekat.','Tuang ke mangkuk, hiris pisang di atas, tabur kayu manis.'],
     tip:'Pisang sudah manis. Tak perlu gula atau susu pekat.'},
    {n:'Roti Telur', img:'/ladies/img/menu/d04.jpg', min:8, k:330,
     bahan:['2 keping roti mil penuh','1 biji telur','Sedikit daun bawang, hiris','Garam dan lada sulah','½ sudu kecil minyak atau mentega','Kopi o kosong'],
     cara:['Pukul telur bersama daun bawang, garam dan lada.','Celup sekeping roti ke dalam telur hingga kedua-dua belah basah.','Panaskan minyak dalam kuali tak melekat, goreng roti 1 hingga 2 minit setiap belah.','Ulang untuk roti kedua dengan baki telur.'],
     tip:'Kuali tak melekat: setengah sudu kecil minyak cukup untuk dua keping.'},
    {n:'Bihun Goreng Kurang Minyak', img:'/ladies/img/menu/d05.jpg', min:10, k:400,
     bahan:['Bihun, 1 genggam (direndam malam sebelumnya)','1 ulas bawang putih, cincang','1 sudu kecil cili kisar (pilihan)','1 sudu kecil kicap masin','1 sudu kecil minyak','Sawi, 1 genggam','1 biji telur'],
     cara:['Toskan bihun yang sudah direndam.','Tumis bawang putih dan cili kisar dengan minyak 1 minit.','Masukkan sawi dan bihun, renjis 2 sudu besar air dan kicap. Gaul 2 hingga 3 minit.','Tolak ke tepi, pecahkan telur di sebelah, masak sebagai telur mata atau kacau bersama bihun.'],
     tip:'Rendam bihun dalam bekas bertutup sebelum tidur. Pagi esok terus masuk kuali.'},
    {n:'Lempeng Pisang & Telur', img:'/ladies/img/menu/d06.jpg', min:10, k:360,
     bahan:['1 biji pisang masak','3 sudu besar tepung gandum','2 sudu besar air','Garam secubit','½ sudu kecil minyak','1 biji telur rebus','Teh o kosong'],
     cara:['Lenyek pisang, gaul dengan tepung, air dan garam hingga jadi adunan pekat.','Sapu sedikit minyak pada kuali tak melekat.','Tuang adunan jadi 2 keping kecil, masak 2 minit setiap belah hingga keperangan.','Hidang dengan telur rebus.'],
     tip:'Pisang yang terlalu masak paling sesuai. Tak perlu tambah gula.'},
    {n:'Bubur Nasi Ayam', img:'/ladies/img/menu/d07.jpg', min:10, k:340,
     bahan:['Nasi semalam, ½ genggam','400 ml air atau air rebusan ayam','Ayam carik, ½ tapak tangan (baki semalam)','2 hiris halia, hiris halus','Garam dan lada sulah','Daun bawang dan sedikit bawang goreng','Teh o kosong'],
     cara:['Didihkan nasi dengan air dan halia.','Masak api sederhana 6 hingga 8 minit sambil dikacau hingga nasi kembang dan pekat.','Masukkan ayam carik, perasakan dengan garam dan lada.','Tabur daun bawang dan sedikit bawang goreng.'],
     tip:'Separuh genggam nasi jadi semangkuk penuh bubur: kenyang, kalori rendah.'},
    {n:'Mihun Sup', img:'/ladies/img/menu/n01.jpg', min:10, k:320,
     bahan:['Mihun, 1 genggam (direndam)','400 ml air','1 kiub stok ayam kurang garam atau air rebusan ayam','Ayam carik, ½ tapak tangan','Sawi atau taugeh, 1 genggam','Daun sup dan bawang goreng sedikit','Teh o kosong'],
     cara:['Didihkan air dengan stok.','Celur mihun dan sawi 1 minit, angkat ke mangkuk.','Masukkan ayam carik ke dalam sup untuk dipanaskan.','Tuang sup ke atas mihun, tabur daun sup dan bawang goreng.'],
     tip:'Stok kiub tinggi garam. Guna separuh kiub, atau air rebusan ayam semalam.'},
    {n:'Sandwic Tuna', img:'/ladies/img/menu/n02.jpg', min:5, k:340,
     bahan:['2 keping roti mil penuh','Tuna dalam air, 3 sudu besar, ditoskan','1 sudu besar yogurt asli (ganti mayonis)','Bawang besar, 1 sudu besar, cincang halus','Lada sulah dan perahan limau','Timun dan salad'],
     cara:['Gaul tuna dengan yogurt, bawang, lada dan limau.','Sapu di atas sekeping roti.','Susun timun dan salad, tutup dengan roti kedua.','Potong dua.'],
     tip:'Yogurt asli ganti mayonis: rasa berkrim, lemaknya jauh kurang.'},
    {n:'Pancake Oat Pisang', img:'/ladies/img/menu/n03.jpg', min:10, k:330,
     bahan:['Oat, 3 sudu besar (30 g)','1 biji pisang','1 biji telur','Serbuk penaik secubit (pilihan)','½ sudu kecil minyak','Susu rendah lemak, 1 gelas'],
     cara:['Lenyek pisang, gaul dengan telur dan oat (atau kisar semua sekali).','Sapu sedikit minyak pada kuali tak melekat, api perlahan.','Tuang 1 sudu besar adunan setiap satu, masak 2 minit hingga berbuih, terbalikkan.','Hidang dengan segelas susu.'],
     tip:'Api perlahan. Pancake tanpa tepung ini mudah hangus.'}
  ]},
  {id:'keluarga', t:'Makan Malam Keluarga', s:'Satu masakan untuk seisi rumah. Ambil bahagian anda.', srv:4, recipes:[
    {n:'Asam Pedas Ikan', img:'/ladies/img/menu/d21.jpg', min:30, k:480,
     pinggan:'Nasi 1 genggam, ikan 1 tapak tangan, kuah 2 senduk, bayam 1 genggam',
     bahan:['Ikan pari atau tenggiri, 4 potong (600 g)','5 tangkai cili kering dan 5 biji bawang merah, 2 ulas bawang putih, 2 cm kunyit hidup, kisar','1 sudu besar minyak','2 sudu besar air asam jawa pekat','1 batang serai, ketuk','Bendi, 8 batang','Daun kesum, segenggam','600 ml air','Garam dan sedikit gula','Bayam, 1 ikat, untuk ditumis'],
     cara:['Tumis bahan kisar dan serai dengan minyak hingga pecah minyak, 8 hingga 10 minit.','Masukkan air dan air asam jawa, didihkan.','Masukkan bendi, daun kesum dan ikan. Masak 8 minit tanpa dikacau kuat.','Perasakan dengan garam dan sedikit gula.','Tumis bayam dengan bawang putih dan sedikit minyak.'],
     tip:'Asam pedas tiada santan. Lauk berkuah yang paling ringan untuk seisi rumah.'},
    {n:'Sup Ayam & Tempe', img:'/ladies/img/menu/d22.jpg', min:40, k:450,
     pinggan:'Nasi ½ genggam, ayam 1 tapak tangan, sup semangkuk, tempe 2 keping',
     bahan:['Ayam, ½ ekor, buang kulit, potong 8','1.5 liter air','1 sudu besar rempah sup','2 ulas bawang putih dan 3 hiris halia','2 batang lobak merah dan 2 biji kentang, potong','Daun sup dan daun bawang','Garam dan lada sulah','Tempe, 1 papan, potong 8','1 sudu kecil kunyit serbuk dan garam'],
     cara:['Rebus ayam dengan bawang putih, halia dan rempah sup 25 minit.','Masukkan lobak dan kentang, masak lagi 10 minit. Perasakan.','Lumur tempe dengan kunyit dan garam.','Bakar tempe dalam air fryer 180°C 10 minit, atau atas kuali leper.','Tabur daun sup dan daun bawang sebelum hidang.'],
     tip:'Ada kentang dalam sup, jadi nasi separuh genggam sudah cukup.'},
    {n:'Ayam Panggang & Ulam', img:'/ladies/img/menu/d23.jpg', min:45, k:480,
     pinggan:'Nasi 1 genggam, ayam 1 tapak tangan, ulam 2 genggam, sambal 1 sudu kecil',
     bahan:['Ayam, 8 ketul peha atau dada, buang kulit','3 ulas bawang putih dan 3 cm halia, tumbuk','2 sudu besar kicap manis dan 1 sudu besar sos tiram','1 sudu kecil serbuk ketumbar','Perahan 1 biji limau','Ulam: timun, kacang botol, pegaga, kubis','Sambal belacan, sedikit'],
     cara:['Gaul ayam dengan bahan perap. Perap 20 minit atau semalaman.','Panggang dalam ketuhar atau air fryer 190°C 25 hingga 30 minit. Terbalikkan separuh masa.','Sapu baki perapan pada ayam 5 minit terakhir.','Potong ulam, hidang bersama sambal.'],
     tip:'Buang kulit sebelum perap: separuh lemak ayam ada pada kulit.'},
    {n:'Ikan Kukus Halia', img:'/ladies/img/menu/d24.jpg', min:25, k:450,
     pinggan:'Nasi 1 genggam, ikan 1 tapak tangan, sawi 1 genggam',
     bahan:['Ikan siakap, 1 ekor besar (800 g)','5 cm halia, hiris halus','3 ulas bawang putih, cincang','3 sudu besar kicap ringan dan 1 sudu besar sos tiram','1 sudu kecil minyak bijan','Daun bawang dan daun ketumbar','2 biji cili merah, hiris','Sawi, 1 ikat, untuk ditumis'],
     cara:['Toreh ikan di kedua-dua belah, susun atas pinggan tahan panas.','Tabur halia dan bawang putih, tuang kicap dan sos tiram.','Kukus 12 hingga 15 minit.','Renjis minyak bijan, tabur daun bawang, ketumbar dan cili.','Tumis sawi dengan sedikit bawang putih.'],
     tip:'Ikan kukus hampir tanpa minyak. Kuahnya sedap dituang atas nasi.'},
    {n:'Gulai Ayam', img:'/ladies/img/menu/d25.jpg', min:45, k:520,
     pinggan:'Nasi 1 genggam, ayam 1 tapak tangan, kuah 1 senduk, timun dan tomato',
     bahan:['Ayam, ½ ekor, buang kulit, potong 8','3 sudu besar rempah kari ayam','4 biji bawang merah, 2 ulas bawang putih, 2 cm halia, kisar','1 sudu besar minyak','Kayu manis, bunga lawang, buah pelaga','100 ml santan dan 500 ml air','2 biji kentang, potong','Daun kari, garam','Timun dan tomato'],
     cara:['Bancuh rempah kari dengan sedikit air jadi pes.','Tumis rempah empat sekawan, bahan kisar dan pes kari hingga pecah minyak.','Masukkan ayam dan kentang, kacau 3 minit.','Masukkan air, masak 20 minit. Masukkan santan dan daun kari, didihkan perlahan 5 minit.','Perasakan dengan garam.'],
     tip:'Santan dicairkan dengan air: 100 ml cukup untuk seisi rumah. Ambil kuah satu senduk sahaja.'},
    {n:'Tauhu Sumbat & Sup Sayur', img:'/ladies/img/menu/d26.jpg', min:30, k:430,
     pinggan:'Nasi ½ genggam, tauhu sumbat 2 keping, sup semangkuk',
     bahan:['Tauhu keras, 4 keping, potong dua jadi segi tiga','Taugeh dan timun, 2 genggam, hiris halus','Lobak merah, 1 batang, parut','Kuah: 2 sudu besar sos cili, 1 sudu besar kacang tanah tumbuk, perahan limau','1 sudu kecil minyak','Sup: 1 liter air, sayur campur (kobis, lobak, cendawan), 2 ulas bawang putih','Garam dan lada sulah'],
     cara:['Bakar tauhu dalam air fryer 200°C 12 minit hingga garing, atau goreng dengan sedikit minyak.','Belah bahagian tengah tauhu, sumbat dengan taugeh, timun dan lobak.','Gaul bahan kuah.','Didihkan air dengan bawang putih, masukkan sayur, masak 5 minit. Perasakan.'],
     tip:'Tauhu goreng biasa menyerap minyak. Air fryer beri garing yang sama.'},
    {n:'Ayam Masak Halia', img:'/ladies/img/menu/d27.jpg', min:30, k:460,
     pinggan:'Nasi 1 genggam, ayam 1 tapak tangan, kailan 1 genggam',
     bahan:['Ayam, 600 g, buang kulit, potong kecil','5 cm halia, hiris panjang','3 ulas bawang putih, cincang','1 biji bawang besar, hiris','2 sudu besar sos tiram dan 1 sudu besar kicap','1 sudu besar minyak','150 ml air','Daun bawang','Kailan, 1 ikat, untuk ditumis'],
     cara:['Tumis halia hingga wangi dan sedikit garing, kemudian bawang putih dan bawang besar.','Masukkan ayam, kacau hingga berubah warna.','Masukkan sos tiram, kicap dan air. Tutup, masak 15 minit.','Tabur daun bawang.','Tumis kailan dengan sedikit bawang putih.'],
     tip:'Halia yang ditumis garing bagi rasa. Tak perlu banyak minyak.'},
    {n:'Sotong Sambal Kurang Minyak', img:'/ladies/img/menu/d28.jpg', min:30, k:470,
     pinggan:'Nasi 1 genggam, sotong 1 tapak tangan, kacang panjang 1 genggam',
     bahan:['Sotong, 600 g, dibersihkan, potong bulat','4 sudu besar cili kisar','1 biji bawang besar dan 2 ulas bawang putih, kisar','1 biji bawang besar, hiris bulat','1 sudu besar minyak','2 sudu besar air asam jawa','1 sudu besar gula dan garam','Kacang panjang, 1 ikat, potong'],
     cara:['Tumis bahan kisar dan cili kisar dengan minyak, api perlahan, hingga pecah minyak, 10 minit.','Masukkan air asam jawa, gula dan garam.','Masukkan sotong dan bawang hiris, masak 3 hingga 4 minit sahaja.','Tumis kacang panjang dengan sedikit minyak.'],
     tip:'Sotong jangan dimasak lama, nanti liat. Tumis cili dengan api perlahan: minyak kurang, tak hangus.'},
    {n:'Telur Bistik & Sayur', img:'/ladies/img/menu/d29.jpg', min:25, k:450,
     pinggan:'Nasi ½ genggam, telur 2 biji, kuah sedikit, sayur 2 genggam',
     bahan:['8 biji telur','1 biji bawang besar, hiris bulat','2 biji tomato, potong','2 biji kentang, potong dadu dan rebus','3 sudu besar sos tomato dan 1 sudu besar kicap','1 sudu besar sos tiram','1 sudu kecil minyak','200 ml air','Kacang pea dan lobak, 2 genggam'],
     cara:['Rebus telur 9 minit, kupas.','Tumis bawang besar dengan minyak hingga layu.','Masukkan sos tomato, kicap, sos tiram dan air. Didihkan.','Masukkan kentang, tomato, kacang pea dan lobak. Masak 5 minit.','Masukkan telur, renih 3 minit.'],
     tip:'Telur rebus, bukan goreng: protein sama, minyak jauh kurang.'},
    {n:'Udang Masak Merah', img:'/ladies/img/menu/d30.jpg', min:30, k:480,
     pinggan:'Nasi 1 genggam, udang 1 tapak tangan, taugeh 1 genggam',
     bahan:['Udang sederhana, 600 g, buang kepala','3 sudu besar cili kisar','1 biji bawang besar dan 2 ulas bawang putih, kisar','3 sudu besar sos tomato','1 sudu besar minyak','1 sudu kecil gula dan garam','100 ml air','Taugeh, 3 genggam'],
     cara:['Tumis bahan kisar dan cili kisar hingga pecah minyak.','Masukkan sos tomato, gula, garam dan air. Didihkan.','Masukkan udang, masak 3 hingga 4 minit hingga merah.','Tumis taugeh dengan bawang putih, 1 minit.'],
     tip:'Udang ialah protein yang tinggi dan rendah lemak. Masak sekejap sahaja supaya tak keras.'}
  ]},
  {id:'snek', t:'Snek Bawah 200 kcal', s:'Ganti goreng pisang petang. Setiap satu bawah 200 kcal.', recipes:[
    {n:'Bubur Kacang Hijau Tanpa Santan', img:'/ladies/img/menu/n31.jpg', min:45, k:150, srv:6,
     bahan:['Kacang hijau, 1 cawan (200 g), direndam 1 jam','1.5 liter air','2 helai daun pandan, simpul','3 sudu besar gula merah atau gula melaka','Garam secubit','2 cm halia, ketuk (pilihan)'],
     cara:['Rebus kacang hijau dengan pandan dan halia 35 hingga 40 minit hingga kembang.','Masukkan gula dan garam, kacau hingga larut.','Ambil separuh mangkuk untuk satu hidangan.'],
     tip:'Tanpa santan dan gula separuh: rasanya masih manis. Tahan 3 hari dalam peti sejuk.'},
    {n:'Jagung Rebus', img:'/ladies/img/menu/n20.jpg', min:15, k:150,
     bahan:['1 tongkol jagung','Air untuk merebus','Garam secubit','Teh o kosong'],
     cara:['Didihkan air dengan garam.','Masukkan jagung, rebus 10 hingga 12 minit.','Angkat dan biarkan sejuk sedikit.'],
     tip:'Tak perlu mentega atau susu pekat. Jagung manis sudah manis.'},
    {n:'Ubi Keledek Rebus', img:'/ladies/img/menu/n21.jpg', min:25, k:150,
     bahan:['Ubi keledek, 1 genggam (150 g)','Air untuk merebus','Teh o kosong'],
     cara:['Basuh keledek, potong dua jika besar.','Rebus 20 minit hingga lembut bila dicucuk garpu.','Kupas atau makan dengan kulit.'],
     tip:'Rebus sekali untuk 3 hari. Keledek sejuk pun sedap.'},
    {n:'Oat & Kurma', img:'/ladies/img/menu/n29.jpg', min:5, k:140,
     bahan:['Oat, 3 sudu besar','150 ml air atau susu rendah lemak','1 biji kurma, hiris'],
     cara:['Masak oat dengan air 2 minit sambil dikacau.','Tuang ke mangkuk, letak kurma di atas.'],
     tip:'Hangat dan mengenyangkan: sesuai untuk lapar waktu malam.'},
    {n:'Jambu Batu & Telur Rebus', img:'/ladies/img/menu/n19.jpg', min:12, k:140,
     bahan:['Jambu batu, separuh biji','1 biji telur','Garam asam (pilihan), secubit'],
     cara:['Rebus telur 9 minit, rendam air sejuk dan kupas.','Potong jambu batu.','Tabur garam asam jika suka.'],
     tip:'Jambu batu tinggi serat dan vitamin C. Telur tambah protein supaya kenyang lebih lama.'},
    {n:'Yogurt Asli & Betik', img:'/ladies/img/menu/n16.jpg', min:3, k:150,
     bahan:['Yogurt asli, 1 cawan kecil (120 g)','Betik, 1 genggam, potong dadu'],
     cara:['Masukkan yogurt ke dalam mangkuk.','Susun betik di atas.'],
     tip:'Pilih yogurt asli. Yogurt berperisa ada gula tambahan.'},
    {n:'Roti Mil & Mentega Kacang', img:'/ladies/img/menu/n24.jpg', min:3, k:190,
     bahan:['1 keping roti mil penuh','Mentega kacang, 1 sudu teh','Hirisan pisang (pilihan, tambah 30 kcal)'],
     cara:['Bakar roti jika suka.','Sapu mentega kacang nipis-nipis.','Susun beberapa hiris pisang.'],
     tip:'Ukur dengan sudu teh, bukan disapu terus dari balang.'},
    {n:'Tembikai & Badam', img:'/ladies/img/menu/n25.jpg', min:3, k:150,
     bahan:['Tembikai, 1 mangkuk, potong dadu','Badam, 10 biji'],
     cara:['Potong tembikai ke dalam mangkuk.','Hidang dengan badam di tepi.'],
     tip:'Kira 10 biji badam. Segenggam penuh hampir 200 kcal.'},
    {n:'Pisang & Kacang Tanah', img:'/ladies/img/menu/n15.jpg', min:2, k:170,
     bahan:['1 biji pisang','Kacang tanah panggang, 1 genggam kecil (15 g)'],
     cara:['Kupas pisang.','Hidang dengan kacang tanah.'],
     tip:'Genggam kecil sahaja. Kacang tanah sihat tetapi padat kalori.'},
    {n:'Telur Rebus & Timun', img:'/ladies/img/menu/n32.jpg', min:12, k:90,
     bahan:['1 biji telur','Timun, ½ batang','Lada sulah dan garam secubit'],
     cara:['Rebus telur 9 minit, rendam air sejuk dan kupas.','Potong timun.','Tabur lada dan garam.'],
     tip:'Snek paling ringan dalam buku ini, dan tinggi protein.'}
  ]}
];

/* ── the books in the app (Eat → Plan) ──
   A book: its cover (its first dish), its recipes as rows. A recipe: the
   photograph, minutes and kcal, the ingredients to tick while cooking, the
   method, one tip, and I ate this. The first recipe of a book is open to
   everyone; the rest come with HITFAT+. */
var rbBook=null, rbAt=-1, rbTick={};
function rbBooks(){ return RB_BOOKS.filter(function(b){ return b.recipes.length; }); }
/* a family pot serves several: the kcal is then her plate (pinggan says what is on it) */
function rbSrv(b,r){ return r.srv||b.srv||1; }
/* her share of a pot: a plate when the book says what goes on it, else a serving */
function rbPer(b,r){ return rbSrv(b,r)>1?(r.pinggan?' a plate':' a serving'):''; }
function rbServes(n){ return n>1?'Serves '+n:'1 serving'; }
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
        '<span class="tx"><b>'+hesc(r.n)+'</b><span>'+r.min+' min · '+r.k+' kcal'+rbPer(b,r)+' · '+rbServes(rbSrv(b,r))+'</span></span>'+
        '<span class="go">'+(open?'›':glyph('lock'))+'</span></button>'; }).join('')+'</div>';
    if(!(typeof contentOpen==='function'&&contentOpen())) h+='<div class="rb-lock">'+glyph('lock')+'<div><b>The first recipe is free.</b><span>Every recipe comes with HITFAT+.</span></div><button onclick="openPaywall(\'\')">Unlock</button></div>';
  } else {
    var r=b.recipes[rbAt], sv=rbSrv(b,r);
    h+='<div class="rb-photo" style="background-image:url(\''+r.img+'\')"></div>'+
      '<div class="rb-head"><b>'+hesc(r.n)+'</b><div class="chips"><span>'+glyph('clock')+r.min+' min</span><span>'+glyph('flame')+r.k+' kcal'+rbPer(b,r)+'</span><span>'+glyph(sv>1?'people':'person')+rbServes(sv)+'</span></div></div>'+
      (r.pinggan?'<div class="rb-plate">'+glyph('food')+'<div><b>Your plate</b><span>'+hesc(r.pinggan)+'</span></div></div>':'')+
      '<div class="rb-sec">Ingredients</div><div class="rb-ings">'+r.bahan.map(function(x,i){ var k=b.id+':'+rbAt+':'+i, on=!!rbTick[k];
        return '<button class="rb-ing'+(on?' on':'')+'" onclick="rbTickIng(\''+k+'\')"><span class="b">'+(on?glyph('check'):'')+'</span><span>'+hesc(x)+'</span></button>'; }).join('')+'</div>'+
      '<div class="rb-sec">Method</div><ol class="rb-steps">'+r.cara.map(function(x){ return '<li>'+hesc(x)+'</li>'; }).join('')+'</ol>'+
      (r.tip?'<div class="rb-tip">'+glyph('spark')+'<div><b>Tip</b><span>'+hesc(r.tip)+'</span></div></div>':'')+
      '<button class="bigbtn rb-eat" onclick="rbEat()">'+glyph('check')+'I ate this</button>'+
      '<div class="nfoot" style="text-align:center;">'+(sv>1?'kcal is an estimate for one '+(r.pinggan?'plate':'serving')+' as written.':'kcal is an estimate for the portion written.')+'</div>'+
      (rbAt+1<b.recipes.length?'<button class="authalt" onclick="openRecipe('+(rbAt+1)+')">Next: '+hesc(b.recipes[rbAt+1].n)+' ›</button>':'');
  }
  el.innerHTML=h;
}
