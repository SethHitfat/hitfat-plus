/* ═══════════════ NUTRITION ACADEMY ═══════════════
   HITFAT's own nutrition course, in Malay: 18 episodes in six modules,
   for members who want to understand food, not only follow a plan.

   An episode is a Vimeo video, a short quiz (pass 2 of 3) and one thing to
   do now in the app: the label episode opens the label scanner, the
   protein one the Journal, the last one the 7-day meal plan. That last part
   is what a course site cannot do.

   The first AC_FREE episodes are open to everyone; the rest are HITFAT+.
   Progress is kept in HF.data.academy: {done:{ep01:{at,score}}, last}.

   Each episode: v (the Vimeo id, or 'id/hash' for an unlisted video), d
   (seconds), sum, mis (the 7-day mission the video ends with) and quiz,
   written from the video's own transcript. Videos are vertical (9:16).
   An episode without v shows as coming soon. */

const AC_FREE=2;
const AC_MODS=[
  ['Asas','Apa yang penimbang beritahu, dan apa yang tidak'],
  ['Apa Dalam Pinggan','Protein, nasi, santan dan minyak'],
  ['Makan Di Luar','Mamak, kenduri, minum petang dan label'],
  ['Badan & Minda','Tidur, emosi, lapar dan plateau'],
  ['Lanjutan','Sekitar latihan, supplement, IF dan Ramadan'],
  ['Pelan Anda','Semua sekali, dalam 7 hari'],
  ['Minda & Sistem','Bila tersasar, dan bila motivasi hilang'],
  ['Nombor Anda','TDEE, audit makan, jam pintar dan air'],
  ['Badan Yang Kekal','Crash diet, latihan, rehat, dan selepas 30 hari']
];
/* m: module index. act: [label, onclick] or null. quiz: [{q, o:[...], a:index, why}] */
function acMins(e){ return e.d?Math.max(1,Math.round(e.d/60))+' min':''; }
const AC_EPS=[
  {id:'ep01',m:0,t:'Baca Penimbang',v:'1235197765',d:173,act:['Log berat hari ini','acDo(\'weight\')'],
   sum:"Kenapa berat naik turun setiap hari, dan tiga langkah untuk baca penimbang dengan betul.",
   mis:"Mula rekod berat esok pagi.",
   quiz:[{"q": "Malam tadi makan masakan masin, pagi ni berat naik 1 kg. Apa yang paling mungkin naik?", "o": ["Lemak", "Air", "Otot"], "a": 1, "why": "Makanan masin buat badan pegang air. Itu bukan lemak."}, {"q": "Cara paling tepat untuk menilai berat anda?", "o": ["Bandingkan purata 7 hari minggu ini dengan minggu lepas", "Timbang beberapa kali sehari, ambil yang paling rendah", "Tengok bacaan pagi ini sahaja"], "a": 0, "why": "Satu bacaan ialah gabungan banyak faktor. Purata 7 hari tunjuk arah sebenar."}, {"q": "Bila patut semak semula pemakanan?", "o": ["Bila berat naik 1 kg dalam sehari", "Bila purata tak berubah 2 hingga 3 minggu berturut-turut", "Setiap kali hampir haid"], "a": 1, "why": "Naik turun harian itu normal. Purata yang tersekat 2 hingga 3 minggu barulah tanda perlu semak."}]},
  {id:'ep02',m:0,t:'Defisit Tanpa Lapar',v:'1235197763',d:203,act:['Tengok target kalori anda','acDo(\'today\')'],
   sum:"Defisit kalori ialah masuk kurang sikit daripada keluar, secara konsisten. Kunci kenyang: protein, serat dan isi padu.",
   mis:"Pilih satu pertukaran makanan dan buat 7 hari berturut-turut.",
   quiz:[{"q": "Apa maksud defisit kalori?", "o": ["Makan sangat sedikit selama beberapa hari", "Masuk kurang sikit daripada keluar, secara konsisten", "Langkau sarapan setiap hari"], "a": 1, "why": "Kurang banyak selama 3 hari akan kalah dengan kurang sikit selama 3 bulan."}, {"q": "Tiga perkara yang buat hidangan lebih mengenyangkan?", "o": ["Protein, serat dan isi padu", "Gula, minyak dan garam", "Nasi, roti dan mi"], "a": 0, "why": "Protein dan serat buat kenyang lebih lama. Sayur dan buah beri isi padu dengan kalori rendah."}, {"q": "Ikut pinggan suku-suku separuh, separuh pinggan diisi dengan apa?", "o": ["Nasi", "Lauk protein", "Sayur dan buah"], "a": 2, "why": "Separuh sayur dan buah, suku protein, suku nasi."}]},
  {id:'ep03',m:0,t:'Turun Berat, Bukan Lemak?',v:'1235197769',d:198,act:['Log ukuran badan','acDo(\'measure\')'],
   sum:"Berat turun tak semestinya lemak turun. Matlamatnya turunkan lemak dan kekalkan otot.",
   mis:"Ukur pinggang dan ambil satu gambar minggu ini. Ulang setiap minggu.",
   quiz:[{"q": "A turun 3 kg tapi pinggang sama. B turun 1 kg tapi pinggang kecil 4 cm. Siapa kemungkinan besar buang lebih banyak lemak?", "o": ["A", "B", "Sama sahaja"], "a": 1, "why": "Pinggang yang mengecil ialah tanda lemak turun. Berat cuma satu nombor."}, {"q": "Kenapa otot penting semasa turun lemak?", "o": ["Otot buat badan kuat dan tegap, dan guna tenaga walaupun berehat", "Otot buat berat cepat turun", "Otot tak penting semasa diet"], "a": 0, "why": "Kehilangan otot buat badan kecil tapi lembik dan lemah."}, {"q": "Mana yang BUKAN cara jaga otot semasa turun lemak?", "o": ["Protein setiap kali makan", "Latihan kekuatan sekurang-kurangnya 2 kali seminggu", "Potong makan habis-habisan supaya berat turun laju"], "a": 2, "why": "Defisit perlu sikit sahaja. Makan terlalu sikit buat sebahagian berat yang hilang itu otot."}]},
  {id:'ep04',m:1,t:'Protein',v:'1235197764',d:178,act:['Tengok protein minggu ini','acDo(\'journal\')'],
   sum:"Protein buat kenyang lebih lama, jaga otot dan bantu defisit. Sasarkan satu tapak tangan setiap kali makan.",
   mis:"Ada protein dalam setiap hidangan, 7 hari berturut-turut.",
   quiz:[{"q": "Berapa banyak protein setiap kali makan, cara paling mudah?", "o": ["Satu tapak tangan (lelaki boleh sampai dua)", "Satu sudu teh", "Sepinggan penuh"], "a": 0, "why": "Guna tangan anda sebagai ukuran, setiap kali makan."}, {"q": "Sarapan mana lebih tinggi protein?", "o": ["Roti bakar kaya dan teh tarik", "Dua biji telur, roti dan teh O"], "a": 1, "why": "Telur beri protein. Roti kaya dan teh tarik kebanyakannya gula dan karbohidrat."}, {"q": "Mana yang BUKAN sebab protein membantu semasa turun lemak?", "o": ["Ia paling mengenyangkan", "Ia bantu kekalkan otot", "Ia tiada kalori"], "a": 2, "why": "Protein ada kalori. Tetapi ia mengenyangkan, jaga otot, dan badan guna lebih tenaga untuk hadamnya."}]},
  {id:'ep05',m:1,t:'Karbohidrat & Nasi',v:'1235197789',d:195,act:['Scan pinggan nasi anda','acDo(\'scan\')'],
   sum:"Nasi bukan musuh. Masalahnya saiz pinggan dan apa yang datang bersamanya.",
   mis:"Nasi suku pinggan, 7 hari berturut-turut.",
   quiz:[{"q": "Kenapa berat turun cepat minggu pertama bila buang nasi?", "o": ["Kebanyakannya air dan glikogen, bukan lemak", "Lemak terbakar lebih laju", "Metabolisme naik dua kali ganda"], "a": 0, "why": "Bila nasi kembali, berat itu pun kembali."}, {"q": "Cara mana lebih senang untuk turun lemak?", "o": ["Buang nasi terus, walaupun selalu teringin", "Nasi suku pinggan setiap hari, dengan lauk protein dan sayur"], "a": 1, "why": "Cara yang anda boleh buat setiap hari itulah yang menang. Konsisten lebih penting daripada sempurna."}, {"q": "Karbohidrat jenis mana yang paling perlu dikurangkan?", "o": ["Beras perang dan oat", "Karbohidrat bergula: air manis, kuih, biskut dan kek", "Buah-buahan"], "a": 1, "why": "Ia senang dimakan banyak tapi tak buat kenyang."}]},
  {id:'ep06',m:1,t:'Lemak, Santan & Goreng',v:'1235197792',d:170,act:['Log makanan hari ini','acDo(\'log\')'],
   sum:"Lemak diperlukan badan tetapi padat kalori. Cara masak paling memberi kesan.",
   mis:"Satu hidangan tanpa goreng setiap hari, 7 hari berturut-turut.",
   quiz:[{"q": "Satu gram lemak ada lebih kurang berapa kalori?", "o": ["4", "9", "20"], "a": 1, "why": "Karbohidrat dan protein lebih kurang 4 kalori setiap gram. Lemak lebih dua kali ganda."}, {"q": "Saiz yang sama. Mana lebih banyak lemak?", "o": ["Ayam goreng tepung", "Ayam bakar"], "a": 0, "why": "Ayam yang sama, tapi tepung dan minyak goreng menambah lemak dan kalori."}, {"q": "Untuk masakan bersantan, apa tipnya?", "o": ["Ambil lauk lebih, kuah kurang", "Tambah kuah supaya cepat kenyang", "Jangan makan langsung"], "a": 0, "why": "Kuah santan pekat menyumbang banyak lemak."}]},
  {id:'ep07',m:2,t:'Mamak & Warung',v:'1235197794',d:145,act:['Scan makanan mamak anda','acDo(\'scan\')'],
   sum:"Kalori di mamak datang dari minyak, gula dalam minuman dan saiz hidangan. Lepak boleh, pilih dengan bijak.",
   mis:"Air tanpa gula setiap kali makan di luar, 7 hari berturut-turut.",
   quiz:[{"q": "Tiga sumber utama kalori di mamak dan warung?", "o": ["Minyak, gula dalam minuman dan saiz hidangan", "Sayur, buah dan air", "Garam, cili dan rempah"], "a": 0, "why": "Mula dengan minuman: teh tarik, milo ais dan sirap bandung ada gula dan susu pekat."}, {"q": "Makan malam mana pilihan lebih baik?", "o": ["Maggi goreng dan milo ais", "Dua chapati, kuah dhal, ayam tandoori dan teh O kosong"], "a": 1, "why": "Ada protein, serat dari dhal dan minuman tanpa gula."}, {"q": "Nak roti canai juga. Apa tipnya?", "o": ["Tiga keping supaya kenyang", "Satu keping cukup, tambah telur untuk protein", "Celup dalam kuah kari yang banyak"], "a": 1, "why": "Tosai dan chapati biasanya kurang minyak daripada roti canai."}]},
  {id:'ep08',m:2,t:'Kenduri, Raya & Buffet',v:'1235197795',d:155,act:['Scan pinggan kenduri','acDo(\'scan\')'],
   sum:"Satu hari makan banyak tak musnahkan progres. Rancang, nikmati, dan kembali ke rutin esoknya.",
   mis:"Satu pinggan tersusun di majlis seterusnya, tanpa tambah kali kedua.",
   quiz:[{"q": "Apa nak buat sebelum ke kenduri?", "o": ["Pergi dalam keadaan sangat lapar", "Makan sesuatu yang ada protein dulu, seperti telur atau yogurt"], "a": 1, "why": "Datang terlalu lapar buat kita ambil pinggan penuh dan makan laju."}, {"q": "Di buffet, mana lebih senang dikawal?", "o": ["Ambil sikit-sikit semua lauk, lima kali pergi", "Satu pinggan tersusun dengan lauk kegemaran dan satu pencuci mulut kecil"], "a": 1, "why": "Anda masih nikmati makanan kegemaran tanpa makan berlebihan."}, {"q": "Esok selepas makan banyak di majlis, apa nak buat?", "o": ["Berlapar untuk tebus", "Terus kembali ke rutin biasa", "Puasa dua hari"], "a": 1, "why": "Protein, sayur, air kosong dan bergerak. Tak perlu tebus."}]},
  {id:'ep09',m:2,t:'Minum Petang',v:'1235197808',d:151,act:['Scan barcode minuman','acDo(\'barcode\')'],
   sum:"Lapar petang boleh dirancang. Pilih protein dan buah, kurangkan goreng dan gula.",
   mis:"Minum petang dengan protein dan air tanpa gula, 7 hari berturut-turut.",
   quiz:[{"q": "Kenapa selalu lapar waktu petang?", "o": ["Makan tengah hari kurang protein, atau terlalu lama tak makan", "Terlalu banyak minum air kosong", "Terlalu banyak makan sayur"], "a": 0, "why": "Sebab itu minum petang yang dirancang sebenarnya boleh membantu."}, {"q": "Snek mana buat kenyang sampai makan malam?", "o": ["Dua keping karipap dan teh tarik", "Yogurt dengan buah, atau telur rebus dan kopi O kosong"], "a": 1, "why": "Ada protein dan kurang gula. Karipap dan teh tarik cepat habis, cepat lapar."}, {"q": "Cara makan keropok yang disyorkan?", "o": ["Makan terus dari bungkusan besar", "Ambil satu genggam ke dalam pinggan dan simpan bungkusan"], "a": 1, "why": "Bungkusan besar memang senang dihabiskan tanpa sedar."}]},
  {id:'ep10',m:2,t:'Baca Label Makanan',v:'1235197815',d:168,act:['Scan label makanan','acDo(\'label\')'],
   sum:"Semak saiz hidangan, kalori dan gula di belakang bungkusan. Jangan percaya perkataan di depan.",
   mis:"Semak label setiap kali membeli snek atau minuman, 7 hari berturut-turut.",
   quiz:[{"q": "Label tulis 150 kcal setiap hidangan, dan satu bungkus ada 2 hidangan. Habis satu bungkus, berapa kalori?", "o": ["150 kcal", "300 kcal", "75 kcal"], "a": 1, "why": "Nombor kalori selalunya untuk satu hidangan, bukan satu bungkus."}, {"q": "Label tulis 20 g gula. Lebih kurang berapa sudu teh?", "o": ["2 sudu teh", "5 sudu teh", "10 sudu teh"], "a": 1, "why": "4 g gula lebih kurang satu sudu teh."}, {"q": "Gula di tempat pertama atau kedua dalam senarai ramuan bermaksud apa?", "o": ["Produk itu tinggi gula", "Produk itu rendah gula", "Tiada makna apa-apa"], "a": 0, "why": "Ramuan disusun daripada yang paling banyak."}]},
  {id:'ep11',m:3,t:'Kurang Tidur',v:'1235197816',d:151,act:null,
   sum:"Kurang tidur naikkan lapar, buat teringin manis dan kurang bergerak. Sasarkan sekurang-kurangnya 7 jam.",
   mis:"Tidur dan bangun pada waktu yang sama, 7 hari berturut-turut.",
   quiz:[{"q": "Apa berlaku pada hormon bila kurang tidur?", "o": ["Hormon lapar cenderung naik, hormon kenyang cenderung turun", "Kedua-duanya naik", "Tiada kesan"], "a": 0, "why": "Hasilnya anda rasa lebih lapar sepanjang hari."}, {"q": "Berapa jam tidur untuk kebanyakan orang dewasa?", "o": ["Sekurang-kurangnya 5 jam", "Sekurang-kurangnya 7 jam", "Tepat 10 jam"], "a": 1, "why": "Tidur cukup buat lapar lebih terkawal dan badan pulih lebih baik."}, {"q": "Mana yang BUKAN tip tidur yang disyorkan?", "o": ["Tidur dan bangun pada waktu yang sama", "Kurangkan skrin telefon sebelum tidur", "Minum kopi lewat petang"], "a": 2, "why": "Elak kafein lewat petang. Bilik gelap dan sejuk juga membantu."}]},
  {id:'ep12',m:3,t:'Makan Ikut Emosi',v:'1235197821',d:159,act:['Tengok Journal makan anda','acDo(\'journal\')'],
   sum:"Lapar emosi datang tiba-tiba dan mahukan makanan tertentu. Berhenti, tanya diri, tunggu 10 minit.",
   mis:"Setiap kali teringin, tanya: lapar perut atau lapar perasaan? 7 hari berturut-turut.",
   quiz:[{"q": "Mana ciri lapar emosi?", "o": ["Datang perlahan, dan apa-apa makanan pun boleh", "Datang tiba-tiba, dan mahukan makanan tertentu seperti manis atau goreng"], "a": 1, "why": "Lapar emosi juga tak hilang walaupun perut dah penuh."}, {"q": "Pukul 11 malam, baru habis kerja yang tertekan, tiba-tiba teringin coklat. Kemungkinan besar lapar jenis apa?", "o": ["Lapar fizikal", "Lapar emosi"], "a": 1, "why": "Datang tiba-tiba, nak makanan tertentu, dan dicetus oleh stres."}, {"q": "Kalau tetap makan sebab emosi, apa nak buat?", "o": ["Hukum diri dan langkau makan esok", "Jangan hukum diri. Makan perlahan, dan kembali ke rutin pada hidangan seterusnya"], "a": 1, "why": "Rasa bersalah hanya mengulang kitaran."}]},
  {id:'ep13',m:3,t:'Lapar Atau Dahaga?',v:'1235197835',d:160,act:null,
   sum:"Dahaga boleh terasa macam lapar. Air bantu tenaga dan latihan, dan menggantikan air manis.",
   mis:"Habiskan satu botol air sebelum tengah hari, 7 hari berturut-turut.",
   quiz:[{"q": "Tanda paling mudah anda cukup minum?", "o": ["Rasa sangat dahaga", "Air kencing berwarna kuning cair"], "a": 1, "why": "Kuning pekat tanda perlu minum lebih. Rasa dahaga datang agak lambat."}, {"q": "Tiba-tiba lapar di luar waktu makan. Apa cuba dulu?", "o": ["Makan kuih terus", "Minum segelas air dan tunggu 10 minit"], "a": 1, "why": "Kalau masih lapar, makan snek yang ada protein."}, {"q": "Berapa banyak air perlu diminum?", "o": ["Sama untuk semua orang", "Bergantung pada saiz badan, cuaca dan berapa banyak berpeluh"], "a": 1, "why": "Cuaca Malaysia panas, jadi selalunya kita perlukan lebih."}]},
  {id:'ep14',m:3,t:'Plateau',v:'1235197844',d:188,act:['Tengok trend berat anda','acDo(\'progress\')'],
   sum:"Turun lemak macam tangga, bukan gelongsor. Sahkan plateau dulu, kemudian buat satu perubahan kecil.",
   mis:"Rekod semua yang anda makan dan minum selama 3 hari, termasuk snek dan air manis.",
   quiz:[{"q": "Bila boleh dikatakan betul-betul plateau?", "o": ["Berat sama selama 3 hari", "Purata berat 7 hari dan pinggang tak berubah 2 hingga 3 minggu"], "a": 1, "why": "Kadang-kadang berat sama tapi pinggang mengecil."}, {"q": "Bila plateau, tindakan mana lebih bijak?", "o": ["Potong makan separuh", "Semak porsi dan langkah harian, kemudian buat satu perubahan kecil"], "a": 1, "why": "Perubahan kecil yang boleh dikekalkan lebih berkesan daripada langkah ekstrem."}, {"q": "Mana yang BUKAN sebab biasa plateau?", "o": ["Badan yang lebih kecil guna tenaga lebih sikit", "Porsi makin besar sikit demi sikit tanpa sedar", "Terlalu banyak minum air kosong"], "a": 2, "why": "Kurang tidur, stres dan haid juga boleh buat badan simpan air."}]},
  {id:'ep15',m:4,t:'Makan Sekitar Latihan',v:'1235197846',d:170,act:['Pergi ke latihan hari ini','acDo(\'train\')'],
   sum:"Sebelum latihan untuk tenaga, selepas latihan untuk pemulihan.",
   mis:"Rancang makan sebelum dan selepas setiap sesi latihan minggu ini.",
   quiz:[{"q": "Snek kecil sebelum latihan sebaiknya dimakan bila?", "o": ["30 hingga 60 minit sebelum", "5 minit sebelum", "5 jam sebelum"], "a": 0, "why": "Atau hidangan biasa 2 hingga 3 jam sebelum. Pilih karbohidrat ringan dengan sedikit protein."}, {"q": "Lepas kelas HIIT waktu malam, mana pilihan lebih baik?", "o": ["Tak makan langsung supaya bakar lebih lemak", "Nasi suku pinggan, ayam atau ikan, dan sayur"], "a": 1, "why": "Langkau makan selepas latihan boleh buat anda lebih lapar dan makan berlebihan nanti."}, {"q": "Untuk turun lemak, apa yang paling penting?", "o": ["Masa makan yang tepat", "Jumlah makanan sepanjang hari"], "a": 1, "why": "Waktu makan cuma membantu tenaga dan keselesaan."}]},
  {id:'ep16',m:4,t:'Supplement',v:'1235197853',d:179,act:null,
   sum:"Supplement ialah tambahan, bukan asas. Betulkan makan, tidur dan latihan dulu.",
   mis:"Sebelum beli apa-apa supplement, tanya: protein, tidur dan air saya dah cukup?",
   quiz:[{"q": "Apa itu whey protein?", "o": ["Pembakar lemak", "Protein dari susu, dalam bentuk serbuk", "Ubat kurus"], "a": 1, "why": "Berguna kalau susah cukupkan protein dari makanan, tapi bukan wajib."}, {"q": "Creatine membantu apa?", "o": ["Membakar lemak", "Prestasi latihan kekuatan dan intensiti tinggi"], "a": 1, "why": "Creatine bukan pembakar lemak. Berat mungkin naik sikit sebab otot simpan lebih air."}, {"q": "Sebelum beli supplement, apa yang perlu disemak?", "o": ["Ia berdaftar atau dinotifikasi dengan KKM", "Ia janji turun berat paling cepat", "Ia yang paling mahal"], "a": 0, "why": "Jauhi produk yang janji turun berat cepat. Tanya profesional kesihatan dulu, terutama jika ambil ubat."}]},
  {id:'ep17',m:4,t:'IF & Ramadan',v:'1235197860',d:172,act:['Bina meal plan','acDo(\'mealplan\')'],
   sum:"Intermittent fasting hanya satu cara capai defisit, bukan magik. Ramadan: berbuka bersederhana dan jangan tinggal sahur.",
   mis:"Pilih cara makan yang anda boleh kekalkan.",
   quiz:[{"q": "Kenapa intermittent fasting membantu sesetengah orang?", "o": ["Tempoh makan yang pendek biasanya kurangkan jumlah makan", "Ia bakar lemak secara magik", "Ia naikkan metabolisme dua kali ganda"], "a": 0, "why": "Untuk turun berat, hasilnya lebih kurang sama dengan kurangkan kalori cara biasa."}, {"q": "Kenapa ramai berat naik masa Ramadan walaupun berpuasa?", "o": ["Puasa lambatkan metabolisme", "Berbuka dan bersahur berlebihan, dengan banyak goreng dan air manis"], "a": 1, "why": "Bazar, kuih, air manis dan makan besar masa berbuka buat jumlah sehari lebih tinggi."}, {"q": "Mana tip Ramadan yang disyorkan?", "o": ["Tinggal sahur supaya kurang kalori", "Berbuka dengan kurma dan air kosong, solat dulu sebelum makan berat", "Beli banyak jenis kuih di bazar"], "a": 1, "why": "Susun pinggan suku-suku separuh, pilih satu kuih sahaja, dan jangan tinggal sahur."}]},
  {id:'ep18',m:5,t:'Recap: Pelan 7 Hari',v:'1235197865',d:135,act:['Bina meal plan 7 hari anda','acDo(\'mealplan\')'],
   sum:"Semua 17 episod dalam satu pelan 7 hari yang boleh dimulakan esok.",
   mis:"Mula pelan 7 hari esok. Tersasar? Teruskan pada hidangan seterusnya.",
   quiz:[{"q": "Hari 1 pelan 7 hari: apa yang dibuat?", "o": ["Susun pinggan: suku protein, suku nasi, separuh sayur dan buah", "Puasa sehari penuh", "Buang nasi sepenuhnya"], "a": 0, "why": "Setiap kali makan."}, {"q": "Minggu ini anda tersasar dua hari. Apa nak buat?", "o": ["Berhenti dan mula semula bulan depan", "Teruskan pada hidangan seterusnya"], "a": 1, "why": "Tak perlu sempurna. Konsisten mengalahkan sempurna."}, {"q": "Hari 7 pelan 7 hari: apa yang dibuat?", "o": ["Ukur pinggang, ambil gambar dan semak minggu anda", "Timbang tiga kali sehari", "Makan bebas sepanjang hari"], "a": 0, "why": "Berat bukan satu-satunya ukuran: tengok purata, pinggang, gambar dan kekuatan."}]},
  {id:'ep19',m:6,t:"Peraturan 80/20",v:'1235268123',d:151,act:null,
   sum:"Yang rosakkan diet bukan kek pertama, tapi apa yang kita buat selepasnya. Guna peraturan 80/20.",
   mis:"Rancang empat waktu makan bebas minggu ini.",
   quiz:[{"q": "Apa itu \"kesan alang-alang\"?", "o": ["Bila rasa dah langgar peraturan, terus lepas semua", "Makan perlahan supaya cepat kenyang", "Makan ikut jadual yang tetap"], "a": 0, "why": "Yang rosakkan diet bukan kek pertama, tapi apa yang dibuat selepas kek itu."}, {"q": "Siapa yang lebih stabil berat badannya?", "o": ["Diet ketat, langsung tak boleh makan manis", "Diet fleksibel, kurangkan tapi masih boleh"], "a": 1, "why": "Kajian Westerhof (1999): orang yang fleksibel lebih stabil beratnya dan kurang kerap makan berlebihan."}, {"q": "Makan 3 kali sehari ikut peraturan 80/20. Lebih kurang berapa kali seminggu boleh makan bebas?", "o": ["1 kali", "4 kali", "10 kali"], "a": 1, "why": "21 waktu makan seminggu, 20% lebih kurang empat. Bila dirancang awal, ia bukan gagal."}]},
  {id:'ep20',m:6,t:"Sistem \"Kalau… Maka…\"",v:'1235268124',d:165,act:null,
   sum:"Motivasi datang dan pergi. Sistem \"kalau… maka…\" dengan tindakan kecil jalan sendiri.",
   mis:"Tulis tiga pelan \"kalau… maka…\": untuk kenduri, hari penat dan hari hujan.",
   quiz:[{"q": "Menurut kajian di London (2010), purata masa untuk bina tabiat ialah?", "o": ["7 hari", "21 hari", "66 hari"], "a": 2, "why": "Ada yang 18 hari, ada yang lebih 200. Kalau minggu kedua masih susah, itu normal."}, {"q": "Mana yang lebih berkesan?", "o": ["Niat kuat: \"Saya akan makan sihat minggu ni\"", "\"Kalau ada kenduri, maka saya ambil lauk dan sayur dulu\""], "a": 1, "why": "Hampir 100 kajian (Gollwitzer dan Sheeran): pelan kalau-maka lebih berjaya daripada niat sahaja."}, {"q": "Tindakan dalam pelan kalau-maka sepatutnya bagaimana?", "o": ["Besar dan mencabar", "Kecil, supaya betul-betul berlaku"], "a": 1, "why": "Contoh: \"Kalau balik kerja penat, maka saya jalan 10 minit sahaja.\""}]},
  {id:'ep21',m:7,t:"Kira TDEE Anda",v:'1235268126',d:185,act:['Tengok target kalori anda','acDo(\'today\')'],
   sum:"BMR ialah tenaga asas, TDEE ialah jumlah tenaga sehari. Kira nombor anda sendiri, kemudian betulkan selepas 14 hari.",
   mis:"Kira BMR dan TDEE anda, timbang setiap pagi, dan betulkan pada hari ke-14.",
   quiz:[{"q": "Apa itu TDEE?", "o": ["Tenaga yang badan guna kalau baring sepanjang hari", "Jumlah tenaga sehari, termasuk bergerak", "Kalori dalam satu hidangan"], "a": 1, "why": "Tenaga ketika baring ialah BMR. TDEE ialah BMR darab tahap aktiviti."}, {"q": "Formula kata TDEE anda 2,400 kalori. Adakah ia tepat 100%?", "o": ["Ya, formula tepat", "Tak semestinya, ia anggaran"], "a": 1, "why": "Berat badan sebenar ialah \"penyata bank\". Selepas 14 hari timbang dan catat makan, TDEE sebenar boleh dikira."}, {"q": "Berat turun lebih laju daripada jangkaan. Apa maksudnya?", "o": ["TDEE anda lebih tinggi daripada anggaran", "TDEE anda lebih rendah daripada anggaran", "Formula itu rosak"], "a": 0, "why": "Kalau tak turun langsung pula, TDEE lebih rendah. Betulkan sikit dan teruskan."}]},
  {id:'ep22',m:7,t:"Audit Makan 3 Hari",v:'1235268125',d:178,act:['Mula catat makan hari ini','acDo(\'log\')'],
   sum:"Kita semua cenderung kira rendah apa yang kita makan. Audit 3 hari tunjuk bil yang sebenar.",
   mis:"Catat semua makan dan minum selama 3 hari, tanpa ubah apa-apa.",
   quiz:[{"q": "Kajian tahun 1992: orang yang yakin makan sikit tapi berat tak turun, sebenarnya?", "o": ["Makan tepat seperti yang dilaporkan", "Melaporkan makan hampir separuh kurang daripada sebenar", "Sengaja menipu"], "a": 1, "why": "Mereka tak menipu. Otak kita memang lemah mengira makanan."}, {"q": "Mana yang BUKAN \"kalori senyap\"?", "o": ["Air manis", "Kuah dan minyak", "Telur rebus"], "a": 2, "why": "Tiga kalori senyap: air manis, kuah dan minyak, dan makan sambil buat benda lain."}, {"q": "Semasa audit 3 hari, apa yang perlu dibuat?", "o": ["Terus kurangkan makan", "Jangan ubah apa-apa dulu, catat sahaja"], "a": 1, "why": "Kita nak tengok bil yang sebenar, kemudian bandingkan dengan TDEE."}]},
  {id:'ep23',m:7,t:"Jam Pintar & NEAT",v:'1235268151',d:170,act:null,
   sum:"Nombor kalori jam pintar boleh tersasar jauh. Langkah harian (NEAT) ialah pembakaran yang paling stabil.",
   mis:"Purata langkah harian anda tambah 4,000, lima hari minggu ini.",
   quiz:[{"q": "Kajian Stanford (2017): kalori pada jam pintar yang paling baik tersasar lebih kurang berapa?", "o": ["2%", "27%", "Tepat"], "a": 1, "why": "Degupan jantung agak tepat, tetapi kalori tidak. Yang paling teruk tersasar sampai 93%."}, {"q": "Untuk tambah pembakaran yang stabil setiap hari, mana lebih boleh dipercayai?", "o": ["Makan balik ikut kalori jam pintar", "Tambah langkah harian"], "a": 1, "why": "NEAT ialah pergerakan harian seperti jalan, naik tangga dan kerja rumah."}, {"q": "Purata langkah anda 5,000 sehari. Apa sasaran baru?", "o": ["6,000", "9,000", "20,000"], "a": 1, "why": "Tambah 4,000. Jalan 10 minit lepas setiap kali makan sudah lebih kurang 3,000 langkah."}]},
  {id:'ep24',m:7,t:"Glikogen & Air",v:'1235268155',d:176,act:null,
   sum:"Glikogen pegang air. Air turun cepat dan naik cepat; lemak turun perlahan tapi kekal lama.",
   mis:"Cari satu iklan \"kurus cepat\" dan uji dengan tiga soalan.",
   quiz:[{"q": "Satu gram glikogen pegang lebih kurang berapa gram air?", "o": ["1 gram", "3 gram", "10 gram"], "a": 1, "why": "Sebab itu minggu pertama diet rendah karbo, kebanyakan yang turun ialah air."}, {"q": "Iklan: turun 7 kg seminggu dengan teh kurus. Apa yang kebanyakannya turun?", "o": ["Lemak", "Air dan isi usus"], "a": 1, "why": "Teh kurus selalunya julap. Bila berhenti, berat naik balik."}, {"q": "Dakwaan turun berat dalam masa kurang dua minggu biasanya?", "o": ["Kebanyakannya air", "Kebanyakannya lemak"], "a": 0, "why": "Tanya juga: adakah ia potong karbo atau guna julap, dan apa jadi sebulan selepas berhenti?"}]},
  {id:'ep25',m:8,t:"Bahaya Crash Diet",v:'1235268156',d:182,act:['Semak target kalori anda','acDo(\'today\')'],
   sum:"Defisit terlalu besar membawa lapar melampau, hilang otot dan berat naik balik. Jangan makan di bawah BMR.",
   mis:"Semak target kalori anda hari ini. Pastikan ia tak di bawah BMR.",
   quiz:[{"q": "Kajian Minnesota (1944): selepas enam bulan makan separuh keperluan, apa jadi bila program tamat?", "o": ["Berat kekal rendah", "Ramai makan berlebihan, dan berat naik melebihi asal"], "a": 1, "why": "Mereka juga jadi obses dengan makanan, murung dan cepat marah."}, {"q": "Mana yang lebih banyak menghilangkan otot?", "o": ["Defisit sederhana, protein tinggi dan latihan bebanan", "Makan sangat sedikit, di bawah BMR"], "a": 1, "why": "Bila defisit terlalu besar, badan guna otot juga, bukan lemak sahaja."}, {"q": "Mana satu tanda pelan anda dah jadi crash diet?", "o": ["Makan di bawah BMR", "Ada protein dalam setiap hidangan", "Defisit 400 kalori sehari"], "a": 0, "why": "Tanda lain: makan kurang separuh TDEE, atau bawah 1,000 hingga 1,200 kalori tanpa pengawasan doktor."}]},
  {id:'ep26',m:8,t:"Latihan Rumah 25 Minit",v:'1235268157',d:169,act:['Mula sesi 25 minit ini','acDo(\'ep26\')'],
   sum:"Latihan bebanan semasa diet jaga otot. Lima gerakan, tanpa alat, tiga kali seminggu.",
   mis:"Tiga sesi minggu ini, dan catat ulangan anda.",
   quiz:[{"q": "Kenapa latihan bebanan penting semasa diet?", "o": ["Lebih banyak otot dapat dikekalkan", "Ia buang lebih banyak air", "Ia tak penting semasa diet"], "a": 0, "why": "Otot itu aset. Masa berjimat, jangan jual aset."}, {"q": "Minggu depan, macam mana nak pastikan badan terus kekalkan otot?", "o": ["Buat sesi yang sama tepat setiap minggu", "Tambah sikit setiap minggu"], "a": 1, "why": "Progressive overload: tambah satu ulangan, satu pusingan, atau kurangkan rehat 10 saat."}, {"q": "Bila perlu berhenti latihan?", "o": ["Sengal otot ringan pada esok hari", "Sakit tajam pada sendi, pening atau sesak dada"], "a": 1, "why": "Sengal otot ringan pada esok hari itu normal."}]},
  {id:'ep27',m:8,t:"Rehat",v:'1235268181',d:172,act:null,
   sum:"Otot jadi kuat masa pulih, bukan masa latihan. Seminggu: tiga latihan, dua hari aktif ringan, dua hari rehat.",
   mis:"Tandakan dua hari rehat dalam kalendar sebelum minggu bermula.",
   quiz:[{"q": "Bila otot jadi lebih kuat?", "o": ["Masa latihan", "Masa pulih selepas latihan"], "a": 1, "why": "Macam kereta: enjin yang tak pernah diservis lambat laun rosak."}, {"q": "Mana satu tanda badan perlukan rehat tambahan?", "o": ["Otot rasa sengal sikit esok selepas latihan", "Prestasi makin turun dan tidur terganggu walaupun penat"], "a": 1, "why": "Tanda lain: sakit sendi, lesu dan cepat marah. Dua tanda atau lebih, ambil sehari dua rehat."}, {"q": "Apa maksud hari rehat?", "o": ["Duduk sepanjang hari", "Langkah harian tetap jalan, dengan regangan ringan dan tidur awal"], "a": 1, "why": "Rehat bukan duduk sepanjang hari."}]},
  {id:'ep28',m:8,t:"Kekal Selepas 30 Hari",v:'1235268191',d:166,act:['Tengok progress anda','acDo(\'progress\')'],
   sum:"Yang kekal: timbang kerap, aktif hampir setiap hari, makan konsisten. Hari ke-30 bukan penamat.",
   mis:"Pilih laluan 30 hari seterusnya, dan tulis matlamat anda.",
   quiz:[{"q": "Apa tabiat orang yang berjaya kekalkan berat (National Weight Control Registry)?", "o": ["Cuba diet pelik yang berbeza setiap bulan", "Timbang kerap, aktif hampir setiap hari, makan konsisten termasuk hujung minggu"], "a": 1, "why": "Tiada diet pelik. Tabiat biasa, setiap hari."}, {"q": "Hari ke-30: berat turun 2 kg (bukan 4), tapi seluar longgar dan anda lebih kuat. Ini?", "o": ["Gagal", "Berjaya"], "a": 1, "why": "Nilai dengan purata 7 hari, lilitan pinggang dan prestasi, bukan satu nombor."}, {"q": "Laluan \"kekalkan\" bermaksud?", "o": ["Naikkan kalori ke paras maintenance, teruskan protein, latihan dan langkah", "Berhenti semua tabiat", "Potong kalori lagi"], "a": 0, "why": "Laluan lain: teruskan turun (kira semula TDEE) atau prestasi (contohnya masa HYROX)."}]},
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
  /* texttrack=false: the subtitles are burned into the videos, so Vimeo's
     own captions would show them twice */
  return 'https://player.vimeo.com/video/'+p[0]+'?'+(p[1]?'h='+p[1]+'&':'')+'title=0&byline=0&portrait=0&dnt=1&playsinline=1&texttrack=false';
}

/* The episodes are filmed 9:16 with empty space above the "HITFAT
   NUTRITION" heading and below the subtitles, where Vimeo's control bar
   sits. The frame crops both (see .ac-video in design.css), so the bar is
   replaced by a thin one of our own: progress read from the player's
   timeupdate messages, a tap on it seeks. Play and pause stay a tap on the
   video itself, inside Vimeo's frame, which is what iPhone allows. */
let _acDur=0;
function acPlayer(){ const f=document.querySelector('#ac-body .ac-video iframe'); return f&&f.contentWindow; }
function acPost(method,value){
  const w=acPlayer(); if(!w) return;
  try{ w.postMessage(JSON.stringify(value===undefined?{method}:{method,value}),'https://player.vimeo.com'); }catch(e){}
}
function acFmt(s){ s=Math.max(0,Math.round(s||0)); return Math.floor(s/60)+':'+String(s%60).padStart(2,'0'); }
function acOnMessage(ev){
  if(ev.origin!=='https://player.vimeo.com') return;
  let d; try{ d=typeof ev.data==='string'?JSON.parse(ev.data):ev.data; }catch(e){ return; }
  if(!d) return;
  if(d.event==='ready'){ ['timeupdate','play','pause','ended'].forEach(x=>acPost('addEventListener',x)); return; }
  const bar=$('ac-bar'); if(!bar) return;
  if(d.event==='timeupdate' && d.data){
    _acDur=d.data.duration||_acDur;
    const i=bar.querySelector('i'); if(i) i.style.width=(Math.min(1,d.data.percent||0)*100).toFixed(2)+'%';
    const t=$('ac-time'); if(t) t.textContent=acFmt(d.data.seconds)+' / '+acFmt(_acDur);
  }
  if(d.event==='play') bar.classList.add('on');
  if(d.event==='pause'||d.event==='ended') bar.classList.remove('on');
}
function acSeek(ev){
  const bar=$('ac-bar'); if(!bar||!_acDur) return;
  const r=bar.getBoundingClientRect(), x=((ev.touches&&ev.touches[0])||ev).clientX;
  acPost('setCurrentTime', Math.max(0,Math.min(1,(x-r.left)/r.width))*_acDur);
}
if(typeof window!=='undefined' && window.addEventListener) window.addEventListener('message',acOnMessage);

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
  let h='<div class="ac-hero"><span class="fw-ic">'+glyph('food')+'</span><div class="k">HITFAT+ · '+all+' episod video</div>'+
    '<div class="t">Nutrition Academy</div>'+
    '<div class="s">'+all+' episod pendek tentang makan untuk turun lemak, cara Malaysia: nasi, mamak, kenduri, Ramadan. '+
    'Setiap episod ada kuiz ringkas dan satu benda untuk terus buat dalam app.</div>'+
    '<div class="ac-prog"><div class="pbar"><i style="width:'+Math.round(n/all*100)+'%"></i></div>'+
    '<span>'+n+' / '+all+' selesai</span></div>'+
    (nx?'<button class="bigbtn" onclick="acOpen(\''+nx.id+'\')">'+glyph('play')+(n?'Sambung: Ep'+String(acNum(nx)).padStart(2,'0'):'Mula Episod 1')+'</button>'
       :'<div class="ac-cert">'+glyph('medal')+'<div><b>Tahniah, anda dah habis semua episod.</b><br>Ulang mana-mana episod bila perlu.</div></div>')+
    '</div>';
  /* each module a card that folds; the one with the next episode starts open (16 Oct) */
  AC_MODS.forEach((m,mi)=>{
    const eps=AC_EPS.filter(e=>e.m===mi), d=eps.filter(acDone).length, open=acModOpen(mi), full=d===eps.length;
    h+='<div class="ac-mod acg'+(open?' open':'')+'"><div class="ac-mod-h" onclick="acModToggle('+mi+')">'+
      '<span class="acg-n'+(full?' full':'')+'">'+(full?glyph('check'):(mi+1))+'</span>'+
      '<div class="acg-tx"><div class="t">'+m[0]+'</div><div class="s">'+m[1]+'</div>'+
      '<div class="acg-bar"><i style="width:'+Math.round(d/eps.length*100)+'%"></i></div></div>'+
      '<span class="ac-mod-n">'+d+'/'+eps.length+'</span><span class="jchev">›</span></div>'+
      (open?'<div class="ac-eps">'+eps.map(acRow).join('')+'</div>':'')+'</div>';
  });
  h+='<div class="aic-fine">Kandungan ini untuk pendidikan umum, bukan nasihat perubatan. Jika ada penyakit seperti diabetes, '+
     'darah tinggi atau buah pinggang, atau sedang hamil, rujuk doktor atau pakar dietetik dulu.</div>';
  return h;
}
let _acMod={};
function acModOpen(mi){ if(mi in _acMod) return _acMod[mi]; const nx=acNext(); return nx?nx.m===mi:false; }
function acModToggle(mi){ _acMod[mi]=!acModOpen(mi); if($('academy')&&$('academy').style.display==='block') renderAcademy(); else renderEat(); }
function acRow(e){
  const done=acDone(e), lock=acLocked(e), ready=acReady(e), num=String(acNum(e)).padStart(2,'0');
  const tag=done?'':lock?'<span class="ac-tag">'+glyph('lock')+'</span>':!ready?'<span class="ac-tag soon">Akan datang</span>':
    acFree(e)&&!contentOpen()?'<span class="ac-tag free">Percuma</span>':'';
  return '<div class="ac-ep'+(done?' done':'')+(ready?'':' soon')+'" onclick="acOpen(\''+e.id+'\')">'+
    '<span class="n">'+(done?glyph('check'):num)+'</span><div class="tx"><div class="t">'+hesc(e.t)+'</div>'+
    '<div class="m">Episod '+num+(e.d?' · '+acMins(e):'')+(e.quiz.length?' · kuiz '+e.quiz.length+' soalan':'')+(done&&e.quiz.length&&acData().done[e.id].score!=null?' · '+acData().done[e.id].score+'/'+e.quiz.length:'')+'</div></div>'+
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
  _acDur=e.d||0;
  let h='<div class="ac-video">'+(acReady(e)
    ?'<iframe src="'+acVimeo(e.v)+'" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen title="'+hesc(e.t)+'"></iframe>'
    :'<div class="ac-soon">'+glyph('play')+'<div>Video akan datang</div></div>')+'</div>';
  if(acReady(e)) h+='<div class="ac-ctl"><div class="ac-bar" id="ac-bar" onclick="acSeek(event)"><i></i></div>'+
    '<span id="ac-time">0:00 / '+acFmt(e.d)+'</span></div>';
  h+='<div class="ac-ep-h"><div class="k">Modul '+(e.m+1)+' · Episod '+num+(e.d?' · '+acMins(e):'')+'</div><div class="t">'+hesc(e.t)+'</div>'+
     (e.sum?'<div class="s">'+hesc(e.sum)+'</div>':'')+'</div>';
  if(e.mis) h+='<div class="ac-mis"><div class="k">'+glyph('target')+'Misi anda</div><div class="t">'+hesc(e.mis)+'</div></div>';
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
    (prev&&prev.score!=null?' Markah terbaik anda: '+prev.score+'/'+e.quiz.length+'.':'')+'</div></div>';
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
  if(k==='ep26')    return acHomeWorkout();
  /* the Eat segments */
  switchTab('eat');
  if(HF.data.nutrition && HF.data.nutrition.cal) setEatSeg(k);
}

/* Ep26's session: five moves, three rounds, as the video sets it out
   (the video's burpee broad jump is played as a burpee, the closest filmed) */
const AC_EP26=[['Bodyweight Squat',45],['Alternating Lunges',50],['Push Up',40],['Burpee',30],['Wall Sit',30]];
function acHomeWorkout(){
  const exs=AC_EP26.map(x=>{ const e=DB.find(d=>d.n===x[0]&&d.v); return e?Object.assign({},e,{dur:x[1]}):null; }).filter(Boolean);
  startWorkout(exs,{rounds:3, key:'ac-ep26', name:'Latihan Rumah 25 Minit'});
}

/* ── Eat's Learn segment: the same course page, in place ── */
function eatLearn(){
  const tiles=(typeof d6LearnCard==='function'?d6LearnCard():'')+(typeof ifLearnTile==='function'?ifLearnTile():'');
  $('eat-body').innerHTML='<div class="ac-in-eat">'+
    (tiles?fsec('Courses','Follow along, day by day.')+'<div class="lcourses">'+tiles+'</div>':'')+
    '<div class="lc-gap"></div>'+academyHTML()+'</div>';
}

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
