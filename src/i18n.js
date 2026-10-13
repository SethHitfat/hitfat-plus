/* ═══════════════ LANGUAGE: BM / EN ═══════════════
   The app is written in English. Bahasa Melayu is laid over it on screen:
   every text node, placeholder, aria-label and title that matches the
   dictionary below is swapped as it appears (a MutationObserver), and put
   back when the member switches to English. Nothing in the render code has
   to know which language is on.

   How a string is matched, in order:
     1. exactly, after squeezing spaces;
     2. as a template: '#' in a key stands for a number, so
        '# days a week' covers '3 days a week' (and {1} {2} in the Malay
        can reorder them);
     3. in parts, when it is joined with ' · ' ('Beginner · 4 days a week');
     4. as a date ('Tuesday 13 October', '5 Oct').
   Anything else stays English: exercise, program and session names are
   left alone on purpose, and so is whatever the member typed.

   Malay is mixed with English where the Malay sounds stiff (workout, meal
   plan, scan, progress), as the owner asked. The choice is kept on this
   device (hitfat_lang) so the sign-in screen is in it too. */

const I18N_MS={
/* ── navigation and the shell ── */
'Home':'Utama','Train':'Latihan','Eat':'Makan','Progress':'Progress','Me':'Saya','Back':'Kembali','Close':'Tutup',
'Next':'Seterusnya','Done':'Siap','Cancel':'Batal','Continue':'Teruskan','Save':'Simpan','Change':'Tukar','Add':'Tambah',
'Start':'Mula','Finish':'Selesai','Finished':'Selesai','Share':'Kongsi','Scan':'Scan','Edit Plan':'Ubah Pelan','Preview':'Pratonton',
'Settings':'Tetapan','Appearance':'Paparan','Light':'Cerah','Dark':'Gelap','Language':'Bahasa','About':'Tentang',
'Privacy Policy':'Dasar Privasi','Terms of Use':'Terma Penggunaan','Refund Policy':'Polisi Bayaran Balik','Privacy':'Privasi','Terms':'Terma','Refunds':'Bayaran Balik',
'Sign Out':'Log Keluar','Reset Progress':'Set Semula Progress','Profile':'Profil','Your profile':'Profil anda','ACCOUNT':'AKAUN',
'Not signed in':'Belum log masuk','Set your name':'Tetapkan nama anda','Member':'Ahli','HITFAT+ member':'Ahli HITFAT+','Membership':'Keahlian',
'Today':'Hari ini','This Week':'Minggu Ini','This week':'Minggu ini','This Month':'Bulan Ini','This month':'Bulan ini','Week':'Minggu','Month':'Bulan',
'Day':'Hari','Days':'Hari','Weeks':'Minggu','Minutes':'Minit','minutes':'minit','min':'min','seconds':'saat','reps':'reps','sessions':'sesi','years':'tahun',
'Coming Soon':'Akan Datang','Soon':'Tidak lama lagi','New':'Baru','NEW':'BARU','All':'Semua','More':'Lagi','MORE':'LAGI','OR':'ATAU','free':'percuma',
'Overview':'Ringkasan','Summary':'Ringkasan','Tools':'Alatan','Insights':'Insight','Highlights':'Sorotan','Questions':'Soalan',
'Nothing here yet.':'Belum ada apa-apa lagi.','Ready?':'Sedia?','Let\'s Go':'Jom','Get Ready':'Bersedia',

/* ── signing in ── */
'Sign In':'Log Masuk','Email':'Emel','Password':'Kata laluan','Create an account':'Buat akaun','New here?':'Baru di sini?',
'Forgot your password?':'Lupa kata laluan?','Continue with Google':'Teruskan dengan Google',
'Log in to sync your plan and progress across devices.':'Log masuk untuk simpan pelan dan progress anda di semua peranti.',
'HITFAT+ uses its own account, separate from HITFAT Hybrid.':'HITFAT+ guna akaun sendiri, berasingan daripada HITFAT Hybrid.',
'Enter your email and password.':'Masukkan emel dan kata laluan.','Password needs at least 6 characters.':'Kata laluan perlu sekurang-kurangnya 6 aksara.',
'Enter your email first, then tap reset.':'Masukkan emel dulu, kemudian tekan reset.','Check your email to confirm your account.':'Semak emel anda untuk sahkan akaun.',
'Sign-in is not available offline.':'Log masuk tidak boleh dibuat tanpa internet.','Sign in first':'Log masuk dulu','Sign in first.':'Log masuk dulu.',
'Sign in to see where you stand.':'Log masuk untuk tengok kedudukan anda.','Sign in to use Meal Scan.':'Log masuk untuk guna Meal Scan.',
'Sign in first so we can add the membership to your account.':'Log masuk dulu supaya kami boleh tambah keahlian ke akaun anda.',
'Sign in first so we can unlock your purchase.':'Log masuk dulu supaya kami boleh buka pembelian anda.',

/* ── membership, store, paywall ── */
'Join HITFAT+':'Sertai HITFAT+','See Plans':'Lihat Pelan','See Membership':'Lihat Keahlian','Unlock with HITFAT+':'Buka dengan HITFAT+',
'Included in HITFAT+':'Termasuk dalam HITFAT+','With HITFAT+':'Dengan HITFAT+','Open to every member':'Terbuka untuk semua ahli',
'Train with everything':'Berlatih dengan semuanya','Every program, unlimited meal scans and #-day meal plans.':'Semua program, meal scan tanpa had dan meal plan # hari.',
'Everything in the app, for as long as you are a member.':'Semua dalam app, selagi anda ahli.','Everything in HITFAT+':'Semua dalam HITFAT+',
'Every program and session':'Semua program dan sesi','Every program, scan, meal plan and video':'Semua program, scan, meal plan dan video',
'Every movement, on video':'Setiap gerakan, dalam video','The full exercise library, with the camera mirror':'Library latihan penuh, dengan cermin kamera',
'AI meal scan, # a day':'AI meal scan, # sehari','Photograph a plate, get calories and macros':'Ambil gambar pinggan, dapat kalori dan makro',
'Meal plans up to # days':'Meal plan sehingga # hari','Malaysian menus, MDG # and CPG MOH #':'Menu Malaysia, MDG # dan CPG MOH #',
'Signature, strength, fat loss — # programs':'Signature, kekuatan, turun lemak — # program',
'The app, and a coach who checks in on you.':'App ini, dan coach yang pantau anda.','Train with a coach':'Berlatih dengan coach',
'Monthly coach review':'Semakan coach bulanan','Your numbers, looked at by a HITFAT coach each month':'Nombor anda disemak oleh coach HITFAT setiap bulan',
'Members-only group':'Group khas ahli','Questions answered, with the people training alongside you':'Soalan dijawab, bersama mereka yang berlatih dengan anda',
'Ask the Coach on WhatsApp':'Tanya Coach di WhatsApp','Coach':'Coach','HITFAT+ Coach':'HITFAT+ Coach',
'Every program, meal plan and AI meal scan — designed for all levels.':'Semua program, meal plan dan AI meal scan — untuk semua tahap.',
'From RM# a month on the #-month plan. No auto-renew.':'Dari RM# sebulan untuk pelan # bulan. Tiada pembaharuan automatik.',
'RM# a month':'RM# sebulan','or the #-month plan':'atau pelan # bulan','# months':'# bulan','# month':'# bulan','Best value':'Paling berbaloi','save #%':'jimat #%','Most popular':'Paling popular',
'One payment for # months — FPX or DuitNow. It does not renew by itself; we remind you before it ends. All purchases are final.':'Bayar sekali untuk # bulan — FPX atau DuitNow. Ia tidak diperbaharui sendiri; kami ingatkan sebelum tamat. Semua pembelian adalah muktamad.',
'Added on to your current end date — nothing is lost by renewing early.':'Ditambah pada tarikh tamat sekarang — tiada yang hilang jika perbaharui awal.',
'Extend, or add a coach':'Panjangkan, atau tambah coach','Choose your plan':'Pilih pelan anda','Active until # Nov #':'Aktif hingga # Nov #','Until # Nov #':'Hingga # Nov #',
'Every session, before you pay for any of it':'Setiap sesi, sebelum anda bayar apa-apa',
'Your calorie target, meal log, weight and progress stay open without a membership.':'Target kalori, log makan, berat dan progress kekal terbuka tanpa keahlian.',
'Membership opens soon — everything is open in the meantime.':'Keahlian dibuka tidak lama lagi — semuanya terbuka buat masa ini.',
'Meal plans are part of HITFAT+.':'Meal plan sebahagian daripada HITFAT+.','Building your own plan is part of HITFAT+.':'Bina pelan sendiri sebahagian daripada HITFAT+.',
'Every movement in the library is part of HITFAT+.':'Setiap gerakan dalam library sebahagian daripada HITFAT+.',
'You already own this.':'Anda sudah memiliki ini.','Could not start payment — check your connection.':'Pembayaran tidak dapat dimulakan — semak sambungan anda.',
'Could not check that order — try again in a moment.':'Pesanan itu tidak dapat disemak — cuba lagi sebentar.',
'Enter the order number from your receipt':'Masukkan nombor pesanan dari resit anda',
'No paid order with that number. Check the receipt, or message us.':'Tiada pesanan berbayar dengan nombor itu. Semak resit, atau mesej kami.',
'yours for good':'milik anda selamanya','For good. One payment, no subscription. Do it again whenever you like.':'Selamanya. Bayar sekali, tiada langganan. Ulang bila-bila masa.',
'Out of stock':'Habis stok','Claiming…':'Menuntut…',

/* ── meal scan ── */
'AI Meal Scan':'AI Meal Scan','Meal Scanner':'Meal Scanner','Scan a Meal':'Scan Makanan','Scan meal':'Scan makanan','Scan Barcode':'Scan Barcode','Scan with AI':'Scan dengan AI',
'Barcode':'Barcode','Food label':'Label makanan','Flash':'Flash','Hide camera':'Sorok kamera','Retry Camera':'Cuba Kamera Lagi','Choose from photos':'Pilih dari galeri',
'Point at your plate, from above':'Halakan ke pinggan, dari atas','the whole plate in view':'seluruh pinggan dalam paparan','a spoon beside it for size':'sudu di sebelah untuk saiz',
'Line the barcode up inside the frame':'Letak barcode dalam bingkai','Fill the frame with the nutrition panel':'Penuhkan bingkai dengan panel nutrisi',
'Barcode number':'Nombor barcode','Number under the barcode':'Nombor di bawah barcode','Type a barcode number':'Taip nombor barcode','Type the full number under the barcode':'Taip nombor penuh di bawah barcode',
'Barcodes are free and unlimited':'Barcode percuma dan tanpa had','AI reads the plate':'AI baca pinggan',
'Photograph a plate and get its calories and macros.':'Ambil gambar pinggan, dapat kalori dan makronya.',
'# of # scans left today':'# daripada # scan tinggal hari ini','# of # free scans left this month':'# daripada # scan percuma tinggal bulan ini',
'# scans a day for # days':'# scan sehari untuk # hari','Scan Unlimited':'Scan Tanpa Had','You have used your scans.':'Scan anda sudah habis.',
'Or join HITFAT+, with # scans a day included':'Atau sertai HITFAT+, termasuk # scan sehari',
'One payment for # days, no auto-renew. Unlimited is fair use, up to # scans a day. Your count resets at midnight.':'Bayar sekali untuk # hari, tiada pembaharuan automatik. Tanpa had ikut penggunaan wajar, sehingga # scan sehari. Kiraan reset tengah malam.',
'Scan every meal and snack for # days':'Scan setiap makanan dan snek untuk # hari','Scan #':'Scan #',
'Not the exact match?':'Bukan padanan tepat?','No scan yet':'Belum ada scan','Packaged food':'Makanan berbungkus',
'Saved on this phone only.':'Disimpan dalam telefon ini sahaja.','Photo saved':'Gambar disimpan','Not enough space on this phone for the photo':'Ruang telefon tidak cukup untuk gambar',
'Scan the plate, or type it in.':'Scan pinggan, atau taip.','Type it in':'Taip sendiri',

/* ── Eat ── */
'Plan':'Pelan','Log':'Log','Journal':'Jurnal','Learn':'Belajar','Nutrition':'Nutrisi','Calories':'Kalori','Protein':'Protein','Carbs':'Karbo','Fat':'Lemak',
'Breakfast':'Sarapan','Lunch':'Makan Tengah Hari','Dinner':'Makan Malam','Snacks':'Snek','Meal':'Makanan','Meals':'Makanan','Menu':'Menu',
'Set Your Daily Calories':'Tetapkan Kalori Harian Anda','Your daily target':'Target harian anda','Save Target':'Simpan Target','Target set':'Target ditetapkan',
'Change my daily target':'Tukar target harian saya','Change my numbers':'Tukar nombor saya','First, your target':'Mula-mula, target anda','Target':'Target','target #':'target #',
'Weight':'Berat','Height':'Tinggi','Age':'Umur','Sex':'Jantina','Male':'Lelaki','Female':'Perempuan','Goal':'Matlamat','Activity level':'Tahap aktiviti',
'Weight kg':'Berat kg','Height cm':'Tinggi cm','Waist cm':'Pinggang cm','Calories (kcal)':'Kalori (kcal)','Protein g':'Protein g','Carbs g':'Karbo g','Fat g':'Lemak g',
'Lose fat':'Turun lemak','Lose Fat':'Turun Lemak','Lose weight':'Turun berat','Maintain':'Kekal','Gain weight':'Naik berat','Build Muscle':'Bina Otot','Build Strength':'Bina Kekuatan','Burn Fat':'Bakar Lemak',
'Mostly sitting':'Kebanyakannya duduk','Not very active':'Kurang aktif','A bit of walking':'Sedikit berjalan','Moderate':'Sederhana','Active':'Aktif','Very active':'Sangat aktif',
'Physical job or heavy training':'Kerja fizikal atau latihan berat','Training #–#x a week':'Berlatih #–# kali seminggu','Most days':'Kebanyakan hari',
'Relaxed — # kg a week':'Santai — # kg seminggu','Standard — # kg a week':'Standard — # kg seminggu','Faster — # kg a week':'Lebih laju — # kg seminggu','Safe maximum — # kg a week':'Maksimum selamat — # kg seminggu',
'About # kg a week':'Lebih kurang # kg seminggu','high protein':'protein tinggi','High protein':'Protein tinggi',
'Never below # kcal for men or # for women; the deficit is capped at # a day.':'Tidak pernah bawah # kcal untuk lelaki atau # untuk wanita; defisit dihadkan # sehari.',
'Waist is optional — CPG MOH # puts the risk line at #cm for men, #cm for women.':'Pinggang pilihan — CPG MOH # letak garis risiko pada #cm untuk lelaki, #cm untuk wanita.',
'Fill in weight, height and age':'Isi berat, tinggi dan umur','Fill in your profile first':'Isi profil anda dulu',
'Add Food':'Tambah Makanan','Add a meal':'Tambah makanan','Add Manually':'Tambah Sendiri','Log meal':'Log makanan','Log a meal by hand':'Log makanan sendiri','Meal logged':'Makanan direkod','Logged':'Direkod',
'Enter the food name':'Masukkan nama makanan','Enter the calories':'Masukkan kalori','What did you eat? e.g. Nasi lemak':'Apa yang anda makan? cth. Nasi lemak','Macros (optional)':'Makro (pilihan)',
'Log anything by hand — always open, no scan used.':'Log apa-apa sendiri — sentiasa terbuka, tiada scan digunakan.',
'Scan a plate or add it by hand — it lands in the right meal.':'Scan pinggan atau tambah sendiri — ia masuk ke waktu makan yang betul.',
'Scan a plate, a barcode or a label, or add a meal by hand.':'Scan pinggan, barcode atau label, atau tambah makanan sendiri.',
'Tap a meal to log into it.':'Tekan waktu makan untuk log.','tap to log':'tekan untuk log','Today\'s Log':'Log Hari Ini',
'Nothing logged yet today':'Belum ada log hari ini','Nothing logged yet — start with dinner':'Belum ada log — mula dengan makan malam','Saved Meals':'Makanan Disimpan','Saved to quick pick':'Disimpan ke pilihan pantas',
'Aim for about # kcal':'Sasarkan lebih kurang # kcal','about # kcal':'lebih kurang # kcal','balance of the day':'baki hari ini','kcal burned today':'kcal dibakar hari ini',
'Eaten against your target, exercise added back.':'Dimakan berbanding target, senaman ditambah semula.','Earn calories back':'Dapat semula kalori',
'Food Journal':'Jurnal Makan','Macros Report':'Laporan Makro','Calories from protein, carbs and fat, this week.':'Kalori daripada protein, karbo dan lemak, minggu ini.',
'The last two weeks, newest first.':'Dua minggu lepas, terbaru dahulu.','Your journal starts with your first meal':'Jurnal anda bermula dengan makanan pertama anda',
'avg kcal a day':'purata kcal sehari','avg protein':'purata protein','days on target':'hari ikut target','# of # days logged':'# daripada # hari direkod',
'Portion Guide':'Panduan Porsi','No scale needed — use your hand.':'Tak perlu penimbang — guna tangan anda.','Hand guide: protein # palm':'Panduan tangan: protein # tapak tangan',
'carbs # fist':'karbo # genggam','fat # thumb':'lemak # ibu jari','vegetables #–# handfuls.':'sayur #–# genggam.','half the plate':'separuh pinggan',
'meat, fish, eggs, tofu':'daging, ikan, telur, tauhu','rice, noodles, bread':'nasi, mi, roti','oil, butter, nuts':'minyak, mentega, kekacang',
'# palm':'# tapak tangan','# fist':'# genggam','# thumb':'# ibu jari','# handful':'# genggam','# handfuls':'# genggam','# tbsp':'# sudu besar','# tsp':'# sudu teh','# whole':'# biji','# slices':'# keping',
'# bowl':'# mangkuk','# small bowl':'# mangkuk kecil','# medium bowl':'# mangkuk sederhana','# palm / #g':'# tapak tangan / #g','# fist / #g':'# genggam / #g',
'Quarter-quarter-half':'Suku-suku-separuh','Half vegetables, quarter protein, quarter carbs':'Separuh sayur, suku protein, suku karbo',
'Drink # glasses of water a day. Hunger is often thirst.':'Minum # gelas air sehari. Lapar selalunya dahaga.',
'Drink at least # glasses of plain water a day — hunger is often thirst.':'Minum sekurang-kurangnya # gelas air kosong sehari — lapar selalunya dahaga.',
'Eating out: protein first, vegetables second, carbs last. That controls the portion for you.':'Makan di luar: protein dulu, sayur kedua, karbo terakhir. Itu kawal porsi untuk anda.',
'Sleep # hours. Fat is lost while you recover, not only while you sweat.':'Tidur # jam. Lemak turun semasa anda pulih, bukan hanya semasa berpeluh.',
'The deficit comes from what you eat, not from training. Training is what protects your muscle.':'Defisit datang dari apa yang anda makan, bukan dari latihan. Latihan yang lindungi otot anda.',
'# glasses of water':'# gelas air','# hours of sleep':'# jam tidur','Glasses':'Gelas',

/* ── meal plan builder ── */
'Meal Plan':'Meal Plan','Meal plan':'Meal plan','Your meal plan':'Meal plan anda','Build Your Meal Plan':'Bina Meal Plan Anda','Build my plan':'Bina pelan saya','Build My Plan':'Bina Pelan Saya',
'A full Malaysian menu, worked out for you.':'Menu Malaysia lengkap, siap dikira untuk anda.','Malaysian menus':'Menu Malaysia',
'Malaysian menus, with calories worked out from your profile.':'Menu Malaysia, dengan kalori dikira dari profil anda.',
'Five questions, then # to # days of meals — calories, macros and hand portions already worked out.':'Lima soalan, kemudian # hingga # hari makanan — kalori, makro dan porsi tangan siap dikira.',
'# menus, with portions in fists and palms rather than grams.':'# menu, dengan porsi dalam genggam dan tapak tangan, bukan gram.',
'Your calories and a menu for every day, in Nutrition.':'Kalori dan menu untuk setiap hari, dalam Nutrisi.',
'What are you aiming for?':'Apa matlamat anda?','How you eat':'Cara anda makan','Eating style':'Gaya makan','Style':'Gaya','Style & restrictions':'Gaya & sekatan','Restrictions & preferences':'Sekatan & pilihan',
'How many days?':'Berapa hari?','Three meals':'Tiga kali makan','Breakfast, lunch, dinner':'Sarapan, makan tengah hari, makan malam','Six small meals':'Enam hidangan kecil','Smaller plates, more often':'Pinggan kecil, lebih kerap',
'Intermittent fasting #:#':'Intermittent fasting #:#','Everything inside an #-hour window':'Semua dalam tempoh # jam','I like rice':'Saya suka nasi','I like noodles':'Saya suka mi','I like bread':'Saya suka roti',
'Less rice':'Kurang nasi','Carbs stay, just tidier':'Karbo kekal, cuma lebih kemas','Controlled carbs':'Karbo terkawal','No meat':'Tanpa daging','No seafood':'Tanpa makanan laut','No egg':'Tanpa telur',
'Budget':'Bajet','Cheap food that actually works':'Makanan murah yang betul-betul berkesan','Family friendly':'Mesra keluarga','Simple':'Ringkas','Fewer ingredients, easy to cook':'Kurang bahan, senang masak',
'Meal prep':'Meal prep','Cook ahead, save time':'Masak awal, jimat masa','You eat out often':'Anda kerap makan di luar','Eating out':'Makan di luar',
'A steady deficit':'Defisit yang stabil','A deficit you can actually keep to':'Defisit yang anda boleh kekalkan','Hold where you are':'Kekal di tahap sekarang','Hold your weight with balanced eating':'Kekalkan berat dengan makan seimbang',
'A small surplus':'Lebihan kecil','Add calories in a controlled way':'Tambah kalori secara terkawal','More, to grow':'Lebih, untuk membesar','Something to load up with':'Sesuatu untuk menambah tenaga',
'Bulk':'Bulk','Safe calories':'Kalori selamat','Capped at #% of calories or #g/kg':'Dihadkan #% kalori atau #g/kg',
'Three options per meal':'Tiga pilihan setiap makan','Every day gets a different menu.':'Setiap hari menu berbeza.','Swap when an ingredient is missing — the calories stay in range.':'Tukar bila ada bahan tiada — kalori kekal dalam julat.',
'Shopping List':'Senarai Belian','Option #':'Pilihan #','Plan saved':'Pelan disimpan','Your current target is # kcal. The plan recalculates from whatever you enter in the wizard.':'Target semasa anda # kcal. Pelan dikira semula ikut apa yang anda masukkan.',
'Filled in from your calorie target — change anything that is off.':'Diisi dari target kalori anda — tukar apa yang tak betul.',
'Weight, height, age and activity — filled in from your calorie target.':'Berat, tinggi, umur dan aktiviti — diisi dari target kalori anda.',
'Weight, height, age and goal — that is all it takes. Everything else on this tab builds itself from it.':'Berat, tinggi, umur dan matlamat — itu sahaja. Yang lain dalam tab ini terbina sendiri daripadanya.',
'This is what sets your daily calories.':'Ini yang tetapkan kalori harian anda.','Be honest — a plan you skip is worth nothing.':'Jujur — pelan yang anda langkau tiada nilai.',
'About You':'Tentang Anda','About you':'Tentang anda','Your Goal':'Matlamat Anda','Day meal plans':'Meal plan harian','day meal plans':'hari meal plan',
'A meal plan for the month':'Meal plan untuk sebulan',
/* foods in the plans */
'Boiled chicken':'Ayam rebus','Boiled egg':'Telur rebus','Boiled potato':'Kentang rebus','Boiled vegetables':'Sayur rebus','Brown rice':'Nasi perang','White rice':'Nasi putih',
'Rice porridge':'Bubur nasi','Chicken porridge + egg + ginger':'Bubur ayam + telur + halia','Chicken rice porridge + ginger':'Bubur nasi ayam + halia','Chicken tomyam':'Tomyam ayam',
'Chicken tomyam + rice vermicelli':'Tomyam ayam + bihun','Chicken in the tomyam':'Ayam dalam tomyam','Tomyam broth':'Kuah tomyam','Clear broth':'Sup jernih','Rice vermicelli':'Bihun',
'Yellow noodles':'Mi kuning','Yellow noodle chicken soup':'Mi kuning sup ayam','Egg':'Telur','Omelette':'Telur dadar','Soft-boiled egg':'Telur separuh masak','Fried tofu':'Tauhu goreng',
'Tempe':'Tempe','Tempe in soy sauce':'Tempe masak kicap','Grilled chicken, skinless':'Ayam panggang, tanpa kulit','Roast chicken, skinless':'Ayam bakar, tanpa kulit',
'Grilled chicken salad + brown rice':'Salad ayam panggang + nasi perang','Grilled mackerel / seabass':'Ikan kembung / siakap bakar','Grilled aubergine':'Terung bakar',
'Shredded chicken':'Ayam carik','Diced chicken':'Ayam potong dadu','Canned tomato sardines':'Sardin tin','Wholemeal bread':'Roti mil penuh','Wholemeal bread + tomato sardines + salad':'Roti mil penuh + sardin + salad',
'Wholegrain cereal':'Bijirin penuh','Granola':'Granola','Greek yoghurt, plain':'Yogurt Greek, kosong','Low-fat milk':'Susu rendah lemak','Banana':'Pisang','Apple':'Epal','Local fruit':'Buah tempatan',
'Banana oat pancakes':'Pancake oat pisang','Oat + banana + egg blend':'Kisar oat + pisang + telur','Honey':'Madu','Groundnuts':'Kacang tanah','Cucumber':'Timun','Mixed salad':'Salad campur',
'Mixed vegetables':'Sayur campur','Vegetables':'Sayur','Vegetables, stir-fried or boiled':'Sayur, tumis atau rebus','Stir-fried vegetables':'Sayur tumis','Mustard greens':'Sawi',
'Mushroom + vegetables':'Cendawan + sayur','Salad + tomato + cucumber':'Salad + tomato + timun','Salad / cucumber':'Salad / timun','Ulam + tomato sambal':'Ulam + sambal tomato',
'Sambal belacan':'Sambal belacan','Sambal with anchovies':'Sambal ikan bilis','Soy sauce':'Kicap','Soy + oyster sauce':'Kicap + sos tiram','Black pepper sauce':'Sos lada hitam',
'Olive oil + lemon':'Minyak zaitun + lemon','Ginger + spring onion':'Halia + daun bawang','Cooking oil':'Minyak masak','Tea, low sugar':'Teh, kurang gula',
'Egg fried rice, portion controlled':'Nasi goreng telur, porsi terkawal','Rice + grilled chicken + vegetables + soup':'Nasi + ayam panggang + sayur + sup',

/* ── Train ── */
'For You':'Untuk Anda','Explore':'Terokai','Plans':'Pelan','Recovery':'Pemulihan','Library':'Library','Programs':'Program','programs':'program','# programs':'# program',
'Workout':'Workout','Workouts':'Workout','Exercise':'Senaman','Exercises':'Latihan','# exercises':'# latihan','# moves':'# gerakan','Rounds':'Pusingan','Round':'Pusingan','ROUNDS':'PUSINGAN',
'# rounds':'# pusingan','# round':'# pusingan','# sessions':'# sesi','Sessions':'Sesi','# minutes':'# minit','# min a day':'# min sehari','# minutes a day':'# minit sehari',
'# days a week':'# hari seminggu','# DAYS A WEEK':'# HARI SEMINGGU','# MIN/DAY':'# MIN/HARI','#MIN/DAY':'#MIN/HARI','# DAYS':'# HARI','# WEEKS':'# MINGGU','# WORKOUTS':'# WORKOUT',
'# weeks':'# minggu','# week':'# minggu','# days':'# hari','# day':'# hari','# wk':'# mgg','about # min':'lebih kurang # min','min / session':'min / sesi','days / week':'hari / minggu',
'# Weeks of Fat Loss':'# Minggu Turun Lemak','# Week of Fat Loss':'# Minggu Turun Lemak','# Weeks of Strength':'# Minggu Kekuatan','# Week of Strength':'# Minggu Kekuatan','# Weeks of Core':'# Minggu Core',
'# weeks of fat loss':'# minggu turun lemak','# weeks of strength':'# minggu kekuatan',
'Beginner':'Pemula','Intermediate':'Pertengahan','Advanced':'Mahir','Level':'Tahap','Equipment':'Peralatan','Length':'Tempoh','Time':'Masa','Pace':'Rentak',
'Bodyweight':'Tanpa alat','Bodyweight only':'Tanpa alat sahaja','Chair':'Kerusi','Towel':'Tuala','Bottle':'Botol','Bottles':'Botol','Dumbbell':'Dumbbell','Dumbbells':'Dumbbell',
'Dumbbell or kettlebell':'Dumbbell atau kettlebell','Kettlebell':'Kettlebell','One bell':'Satu kettlebell','Two water bottles':'Dua botol air','A sturdy chair':'Kerusi yang kukuh',
'A chair and a towel':'Kerusi dan tuala','A mat or a towel':'Tikar atau tuala','You need: a mat':'Anda perlukan: tikar','Nothing at all':'Tiada apa-apa','Nothing but you and the floor':'Hanya anda dan lantai',
'Home basics':'Asas di rumah','Real weight at home':'Beban sebenar di rumah','Bodyweight, a chair, a towel':'Tanpa alat, kerusi, tuala','no equipment.':'tanpa alat.',
'No equipment is a real answer — most of the library needs none.':'Tanpa alat pun boleh — kebanyakan library tak perlukan alat.','Nothing you have to buy.':'Tiada apa yang perlu dibeli.',
'Arms':'Lengan','Chest':'Dada','Legs':'Kaki','Back':'Kembali','Shoulders':'Bahu','Glutes':'Punggung','Calves':'Betis','Triceps':'Trisep','Core':'Core','Cardio':'Cardio','Mobility':'Mobiliti',
'Obliques':'Obliques','Full Body':'Seluruh Badan','Upper Body':'Badan Atas','Lower Body':'Badan Bawah','Upper':'Atas','Lower':'Bawah','Strength':'Kekuatan','Fat Loss':'Turun Lemak','Fat Burn':'Bakar Lemak',
'Conditioning':'Conditioning','Power':'Power','Holds':'Tahan','Intervals':'Interval','Accessory':'Aksesori','Foundation':'Asas','Finisher':'Finisher','Burn':'Bakar','Build':'Bina','Peak':'Puncak',
'Start Workout':'Mula Workout','Start Plan':'Mula Pelan','Start this plan':'Mula pelan ini','Start the program':'Mula program','Start today':'Mula hari ini','Start Day #':'Mula Hari #','Start Here':'Mula Di Sini',
'View Plan':'Lihat Pelan','See the Program':'Lihat Program','Browse Programs':'Lihat Program','Browse all':'Lihat semua','Find':'Cari',
'Up Next':'Seterusnya','Up next ·':'Seterusnya ·','Today\'s workout':'Workout hari ini','Today, from your plan.':'Hari ini, dari pelan anda.','Today, and the rest of the week.':'Hari ini, dan baki minggu ini.',
'Picked for You':'Dipilih Untuk Anda','Made For You':'Dibuat Untuk Anda','New and picked for you':'Baru dan dipilih untuk anda','Popular Programs':'Program Popular','Top Programs':'Program Teratas',
'Quick Workouts':'Workout Pantas','Collections':'Koleksi','Recently Trained':'Baru Dilatih','The last sessions you finished.':'Sesi terakhir yang anda selesaikan.',
'Beginner plans, at your level.':'Pelan pemula, ikut tahap anda.','Short plans, quick to finish.':'Pelan pendek, cepat habis.','Six weeks and more, for the real change.':'Enam minggu ke atas, untuk perubahan sebenar.',
'Harder moves, longer sessions.':'Gerakan lebih susah, sesi lebih panjang.','Plans built around the deficit.':'Pelan dibina sekitar defisit.','Stronger, week on week.':'Lebih kuat, minggu demi minggu.',
'Learn the moves, build the habit.':'Belajar gerakan, bina tabiat.','Twenty minutes or less.':'Dua puluh minit atau kurang.','Four Weeks or Less':'Empat Minggu atau Kurang',
'Programs matched to your goal and level. Preview one before you start.':'Program ikut matlamat dan tahap anda. Tengok dulu sebelum mula.',
'Matched to your level':'Ikut tahap anda','✓ Matches your level':'✓ Ikut tahap anda','✓ # days a week, exactly what you said':'✓ # hari seminggu, tepat seperti anda kata',
'In This Plan':'Dalam Pelan Ini','In This Week':'Dalam Minggu Ini','In This Workout':'Dalam Workout Ini','What You Need':'Apa Yang Anda Perlukan','What is inside':'Apa di dalamnya','What you get':'Apa yang anda dapat',
'Tap a movement to watch it.':'Tekan gerakan untuk tonton.','Tap any day to see it.':'Tekan mana-mana hari untuk lihat.','Week #':'Minggu #','Week #, Day #':'Minggu #, Hari #','Day #':'Hari #','Day # of #':'Hari # daripada #',
'Days #–#':'Hari #–#','days #–#':'hari #–#','Week by week':'Minggu demi minggu','# of # days':'# daripada # hari','of # days':'daripada # hari','#% complete':'#% siap','#% done':'#% siap',
'Rest':'Rehat','Rest & recover':'Rehat & pulih','Active Recovery':'Pemulihan Aktif','Skip Rest':'Langkau Rehat','Mark done without playing':'Tanda siap tanpa main',
'Do the days in order. Missed one? Do it today — the plan waits for you.':'Buat ikut urutan. Tertinggal satu? Buat hari ini — pelan tunggu anda.',
'If a movement needs kit you do not own, the plan swaps it out.':'Kalau gerakan perlukan alat yang anda tiada, pelan akan tukar.',
'Being filmed now. They play here as soon as the video is in.':'Sedang dirakam. Ia main di sini sebaik video siap.','Clip coming soon':'Klip akan datang',
'# movements with a demo video':'# gerakan dengan video demo','# coming soon.':'# akan datang.','filmed movements':'gerakan dirakam','Recovery is coming soon':'Pemulihan akan datang tidak lama lagi',
'Joint-by-joint programs for knees, shoulders, hips and the back a desk gives you. We are filming every movement now — they open here when the videos are ready.':'Program ikut sendi untuk lutut, bahu, pinggul dan belakang. Kami sedang merakam setiap gerakan — ia dibuka di sini bila video siap.',
'# programs, filming now.':'# program, sedang dirakam.','Recovery & Prehab':'Pemulihan & Prehab',
'Build Your Own':'Bina Sendiri','Custom Plan':'Pelan Sendiri','My Plan':'Pelan Saya','Your Plan':'Pelan Anda','Your plan':'Pelan anda','New Program':'Program Baru',
'Choose the activities and set your schedule.':'Pilih aktiviti dan tetapkan jadual anda.','What do you want to do?':'Apa yang anda nak buat?',
'Pick as many as you like — they get spread across your week.':'Pilih seberapa banyak — ia diagihkan sepanjang minggu.','Which days?':'Hari apa?','How long is each session?':'Berapa lama setiap sesi?',
'What do you have?':'Apa yang anda ada?','How many weeks?':'Berapa minggu?','Plan Preview':'Pratonton Pelan','Everything else becomes a rest day.':'Hari lain jadi hari rehat.',
'Pick something you will actually finish. You can build another after.':'Pilih yang anda betul-betul boleh habiskan. Boleh bina lagi selepas itu.',
'Quick — habit first':'Pantas — tabiat dulu','The usual':'Biasa','Proper session':'Sesi penuh','Long and thorough':'Panjang dan menyeluruh',
'Two days a week at least':'Sekurang-kurangnya dua hari seminggu','Keep one day to rest':'Simpan satu hari untuk rehat','Custom plan deleted':'Pelan sendiri dipadam',
'Delete your custom plan? Its progress is lost.':'Padam pelan sendiri anda? Progress akan hilang.',
'Your activities, workout length, days of the week and the equipment you have.':'Aktiviti, tempoh workout, hari dalam minggu dan alat yang anda ada.',
'Choose Your View':'Pilih Paparan','Switch view':'Tukar paparan','Mirror':'Cermin','Follow along':'Ikut sekali',
'What are you here for?':'Anda di sini untuk apa?','Where are you now?':'Di mana anda sekarang?','How many days a week?':'Berapa hari seminggu?','What have you got?':'Apa yang anda ada?',
'Show my match':'Tunjuk padanan saya','YOUR MATCH':'PADANAN ANDA','These came close':'Yang hampir sepadan','Show me the best match either way':'Tunjuk padanan terbaik juga',
'Answer again':'Jawab semula','One answer. You can change it later.':'Satu jawapan. Boleh tukar kemudian.','Pick as many as apply.':'Pilih semua yang berkenaan.',
'Pick the one you find easiest to stick to.':'Pilih yang paling senang anda ikut.','Just get started':'Mula sahaja','Build the habit first, the rest follows':'Bina tabiat dulu, yang lain menyusul',
'Get stronger':'Jadi lebih kuat','Build strength you can feel day to day':'Bina kekuatan yang terasa setiap hari','Burn more than you eat, keep the muscle':'Bakar lebih dari yang dimakan, kekalkan otot',
'Move':'Bergerak','Recover':'Pulih','Whatever works':'Apa-apa pun boleh','Where most members start.':'Di mana kebanyakan ahli bermula.',
'Previous exercise':'Latihan sebelumnya','Next exercise':'Latihan seterusnya','Play':'Main','Back # seconds':'Undur # saat','Forward # seconds':'Maju # saat',
'Workout Complete':'Workout Selesai','Day complete 🔥':'Hari selesai 🔥','Nothing to play':'Tiada untuk dimain','Rest day logged':'Hari rehat direkod',
'You can still stop early — nothing is wasted.':'Anda masih boleh berhenti awal — tiada yang sia-sia.',
'Every move has an easier version: march instead of jump, push-ups on your knees or against a wall.':'Setiap gerakan ada versi lebih mudah: march ganti lompat, push-up atas lutut atau pada dinding.',
'Do fewer reps, rest longer, or march instead of jumping. Finishing slowly beats stopping.':'Kurangkan reps, rehat lebih lama, atau march ganti lompat. Habis perlahan lebih baik dari berhenti.',
'It is too hard.':'Terlalu susah.','It is too easy.':'Terlalu senang.','I missed a day.':'Saya tertinggal sehari.',
'Fill your bottles fuller, move slower on the way down, and add a round.':'Isi botol lebih penuh, turun lebih perlahan, dan tambah satu pusingan.',
'Pain in a joint is a stop sign. Muscle burn is not.':'Sakit sendi tanda berhenti. Otot rasa terbakar tidak.',
'Carry on from the day you are on. Thirty workouts is the goal, not thirty dates in a row.':'Teruskan dari hari anda sekarang. Tiga puluh workout matlamatnya, bukan tiga puluh tarikh berturut-turut.',
'15 to 25 minutes at home. Follow the video, the timer counts for you.':'15 hingga 25 minit di rumah. Ikut video, pemasa kira untuk anda.',
'# to # minutes at home. Follow the video, the timer counts for you.':'# hingga # minit di rumah. Ikut video, pemasa kira untuk anda.',
'Training':'Latihan','Trained':'Dilatih','Activity':'Aktiviti','Activities':'Aktiviti','Activity Types':'Jenis Aktiviti','Log Exercise':'Log Senaman',
'No activity logged today.':'Tiada aktiviti direkod hari ini.','run':'lari','walk':'jalan','cycle':'basikal','swim':'renang','hiit':'hiit',

/* ── BURN30 ── */
'#-Day Weight Loss':'Turun Berat #-Hari','The Five Phases':'Lima Fasa','The Rules':'Peraturan','How It Works':'Cara Ia Berfungsi','How it works':'Cara ia berfungsi',
'Fit Test':'Fit Test','Fit test':'Fit test','Final Test':'Ujian Akhir','How the fit test works':'Cara fit test berfungsi','Day #: the fit test':'Hari #: fit test','Day #: test again':'Hari #: uji semula',
'Today is your starting line. Count every rep honestly — day # is measured against it.':'Hari ini garisan permulaan anda. Kira setiap rep dengan jujur — hari # diukur berbanding ini.',
'One round, five moves. Count your reps for each — for the plank, the seconds you hold. Write them in Progress when you finish.':'Satu pusingan, lima gerakan. Kira reps setiap satu — untuk plank, saat anda tahan. Tulis dalam Progress bila habis.',
'Five moves, one round. It is your starting line.':'Lima gerakan, satu pusingan. Ini garisan permulaan anda.','Same five moves. Then compare in Progress.':'Lima gerakan sama. Kemudian banding dalam Progress.',
'Weigh yourself on days #, # and # only. Daily numbers go up and down and mean little.':'Timbang hanya pada hari #, # dan #. Nombor harian naik turun dan tak banyak makna.',
'Unlocked — welcome to the 30 days':'Dibuka — selamat datang ke 30 hari','Finish it and keep it':'Habiskan dan simpan','Today\'s Checklist':'Senarai Semak Hari Ini',
'Ate to the plan':'Makan ikut pelan','Eat to your plan':'Makan ikut pelan anda','Progress Photos':'Gambar Progress','Front, side, back':'Depan, sisi, belakang',
'Stand in the same spot, same light, same clothes':'Berdiri di tempat sama, cahaya sama, pakaian sama','Day # against day #.':'Hari # berbanding hari #.',
'Everyone on BURN#, by the days they have played.':'Semua peserta BURN#, ikut hari yang dimainkan.','# people on the board · # finished':'# orang dalam papan · # selesai',
'Crunches day #':'Crunches hari #','Squats day #':'Squats hari #','Plank day #':'Plank hari #','Jumping jacks day #':'Jumping jacks hari #','Knee push-ups day #':'Knee push-ups hari #',
'Weight day #':'Berat hari #','Waist day #':'Pinggang hari #','Your # Days':'# Hari Anda',

/* ── progress ── */
'Progress Score':'Skor Progress','Day Score':'Skor Hari','Streak':'Streak','Day streak':'Streak hari','days in a row':'hari berturut-turut','No streak yet':'Belum ada streak',
'Badges':'Lencana','Body':'Badan','Body Check-ins':'Semakan Badan','Log Measurements':'Log Ukuran','Weight logged':'Berat direkod','Goal set':'Matlamat ditetapkan',
'Weight today (kg)':'Berat hari ini (kg)','Goal weight (kg)':'Berat sasaran (kg)','Enter a weight between 20 and 300':'Masukkan berat antara 20 dan 300','Enter a goal between 30 and 250':'Masukkan sasaran antara 30 dan 250',
'Waist (cm) — leave blank to skip':'Pinggang (cm) — biar kosong untuk langkau','Body fat % — leave blank to skip':'Lemak badan % — biar kosong untuk langkau','Weight today (kg) — leave blank to skip':'Berat hari ini (kg) — biar kosong untuk langkau',
'Waist should be between 40 and 200':'Pinggang perlu antara 40 dan 200','Body fat should be between 1 and 70':'Lemak badan perlu antara 1 dan 70',
'Waist':'Pinggang','Trend':'Trend','Weekly average':'Purata mingguan','#-day average':'Purata #-hari','7-day average':'Purata 7 hari','since you started':'sejak anda mula','all time':'sepanjang masa',
'Log your weight to score this':'Log berat anda untuk skor ini','Two readings are needed before there is a line to draw.':'Perlu dua bacaan sebelum garis boleh dilukis.',
'# reading':'# bacaan','# reading in this window':'# bacaan dalam tempoh ini','each reading':'setiap bacaan','The last # days. Tap a measurement for its trend.':'# hari lepas. Tekan ukuran untuk lihat trend.',
'This week. Tap a measurement for its trend.':'Minggu ini. Tekan ukuran untuk lihat trend.','This week, Monday to today.':'Minggu ini, Isnin hingga hari ini.',
'Day to day this moves on water and food. The average is the part that means something.':'Setiap hari ia berubah ikut air dan makanan. Puratanya yang bermakna.',
'Filled days are days you trained.':'Hari yang berwarna ialah hari anda berlatih.','A square fills in on any day you train':'Petak berwarna pada hari anda berlatih',
'# sessions, # minutes this week':'# sesi, # minit minggu ini','# sessions, # minutes in # days':'# sesi, # minit dalam # hari','Last session # days ago':'Sesi terakhir # hari lepas',
'Last # days':'# hari lepas','Days done':'Hari siap','Days left':'Hari tinggal','# days left':'# hari tinggal','Days logged':'Hari direkod','# to go':'# lagi','#% there':'#% sampai',
'#% of target':'#% daripada target','#% of your weekly goal':'#% daripada matlamat mingguan','# more days to your goal.':'# hari lagi ke matlamat anda.',
'Share Progress Card':'Kongsi Kad Progress','Share to Story':'Kongsi ke Story','Save Image':'Simpan Gambar','Making your card…':'Menyediakan kad anda…','Or press and hold the card to save it.':'Atau tekan lama kad untuk simpan.',
'Copied — paste it anywhere':'Disalin — tampal di mana-mana','Progress reset':'Progress diset semula',
'Reset all progress? Sessions, programs and logs are erased. This cannot be undone.':'Set semula semua progress? Sesi, program dan log dipadam. Ini tidak boleh dibatalkan.',
'Read from your numbers, nothing more.':'Dibaca dari nombor anda, itu sahaja.','Four parts of #, each from what you did.':'Empat bahagian #, setiap satu dari apa yang anda buat.',
'Consistency':'Konsistensi','Leaderboard':'Leaderboard','Hide me from the boards':'Sorok saya dari papan','# people on the board':'# orang dalam papan',
'You show up as "Member" until you add your first name in Me.':'Anda dipaparkan sebagai "Ahli" sehingga anda tambah nama pertama dalam Saya.',
'Days trained this month. A workout of # minutes or more, played in the app, counts.':'Hari berlatih bulan ini. Workout # minit atau lebih, dimainkan dalam app, dikira.',
'days trained this month':'hari berlatih bulan ini','active day':'hari aktif','Any session counts':'Semua sesi dikira','Train any HITFAT+ session to count it':'Buat mana-mana sesi HITFAT+ untuk dikira',
'Program day, single session, recovery — all of it':'Hari program, sesi tunggal, pemulihan — semuanya',

/* ── monthly challenge ── */
'October Challenge':'Cabaran Oktober','OCTOBER CHALLENGE':'CABARAN OKTOBER','The challenge everyone is on.':'Cabaran yang semua orang sertai.','Join October':'Sertai Oktober',
'You\'re in — every session this month counts':'Anda sudah masuk — setiap sesi bulan ini dikira','A new challenge every month':'Cabaran baru setiap bulan',
'Completed months stay on your shelf':'Bulan yang selesai kekal di rak anda','Challenges with a finish line':'Cabaran dengan garisan penamat','It changes by itself on the first':'Ia bertukar sendiri pada hari pertama',
'The year ahead':'Tahun mendatang','One for every week you finish.':'Satu untuk setiap minggu anda habiskan.','Rewards':'Ganjaran','Check in':'Daftar masuk','Classes':'Kelas',

/* ── Nutrition Academy chrome ── */
'Nutrition Academy':'Nutrition Academy','Buat sekarang':'Buat sekarang',

/* ── messages ── */
'Enter your email':'Masukkan emel anda','Your plan is ready':'Pelan anda sudah siap','Please tick the readiness box':'Sila tanda kotak kesediaan','Pick a goal to continue':'Pilih matlamat untuk teruskan',
'Opening':'Membuka','Episod selesai':'Episod selesai',

/* ── Me ── */
'Your Coach':'Coach Anda','Monthly review':'Semakan bulanan','Message coach':'Mesej coach','Challenges':'Cabaran','Not set':'Belum ditetapkan',
'Members group':'Group ahli','HITFAT Club':'HITFAT Club','Staff':'Staf',
/* ── labels the first pass missed ── */
'DAYS':'HARI','DAY':'HARI','MIN':'MIN','DONE':'SIAP','TOTAL':'JUMLAH','KCAL':'KCAL','KG':'KG','Days a week':'Hari seminggu','Train Without It':'Berlatih Tanpanya',
'In Progress':'Sedang Berjalan','In progress.':'Sedang berjalan.','← Progress':'← Progress','first week':'minggu pertama','Related':'Berkaitan','weeks':'minggu','Left':'Baki','Test':'Ujian',
'Walk #m':'Jalan #m','Run #m':'Lari #m','Gym #m':'Gym #m','Cycling #m':'Berbasikal #m','HIIT #m':'HIIT #m','# sessions a week':'# sesi seminggu','# min':'# min','# kcal':'# kcal',
'A workout every day':'Satu workout setiap hari','Three rounds now. Same moves, more of them.':'Tiga pusingan sekarang. Gerakan sama, lebih banyak.',
'The strongest week. Seven moves a day.':'Minggu paling kuat. Tujuh gerakan sehari.','One last burn, then test what changed.':'Satu burn terakhir, kemudian uji apa yang berubah.',
'How long do I keep it?':'Berapa lama saya boleh simpan?','single sessions':'sesi tunggal','Just started':'Baru mula','Preview Day #':'Pratonton Hari #',
'Easy to Start':'Senang Untuk Mula','The Long Game':'Jangka Panjang','A new set of sessions every week.':'Set sesi baru setiap minggu.',
'HITFAT signature programs first':'Program signature HITFAT dahulu','No plan yet.':'Belum ada pelan.','Log faster, plan ahead.':'Log lebih cepat, rancang awal.',
'See yourself':'Lihat diri anda','a little':'sedikit','Always open, unlimited':'Sentiasa terbuka, tanpa had','A stronger middle, and a back that thanks you.':'Bahagian tengah lebih kuat, dan belakang yang berterima kasih.',
'What Is Coming':'Apa Yang Akan Datang','Coach\'s note':'Nota coach','First thing in the morning, before breakfast.':'Awal pagi, sebelum sarapan.',
'# small pancakes':'# pancake kecil','#-# handfuls':'#-# genggam','#/# fist / #g cooked':'#/# genggam / #g dimasak','#/# can / #g':'#/# tin / #g','#/# fist / #g':'#/# genggam / #g',
'#/# tsp':'#/# sudu teh','#/# palm / #g':'#/# tapak tangan / #g','#/# fist':'#/# genggam','#/# palm':'#/# tapak tangan',
'Consistency October':'Konsisten Oktober','No-Skip November':'November Tanpa Ponteng','Strong March':'Mac Kuat','May Momentum':'Momentum Mei','July Sweat':'Julai Berpeluh',
'September Rebuild':'September Bina Semula','New Year Reset':'Reset Tahun Baru','Finish the Year':'Habiskan Tahun','Short Month, No Excuses':'Bulan Pendek, Tiada Alasan',
'Move Every Other Day':'Bergerak Selang Sehari','Back to Basics':'Kembali ke Asas','Halfway Strong':'Separuh Jalan Kuat',

/* ── program and session descriptions ── */
'Twenty days. The hardest one here, and the one that changes people.':'Dua puluh hari. Yang paling susah di sini, dan yang mengubah orang.',
'Grab two bottles and pump up your arms and shoulders at home.':'Ambil dua botol dan kuatkan lengan dan bahu di rumah.',
'A complete #-week foundation program. Build strength, learn the movements, and progress safely week by week.':'Program asas # minggu yang lengkap. Bina kekuatan, belajar gerakan, dan maju dengan selamat minggu demi minggu.',
'One quick fat-burning session every day for # days straight. Build the habit, feel the burn.':'Satu sesi bakar lemak yang pantas setiap hari selama # hari berturut-turut. Bina tabiat, rasa burn-nya.',
'A daily core challenge that gets harder each week. # days to carve out a stronger, tighter core.':'Cabaran core harian yang makin susah setiap minggu. # hari untuk core yang lebih kuat dan padat.',
'Three weeks to build full-body strength. A different focus each day, progressively harder.':'Tiga minggu untuk bina kekuatan seluruh badan. Fokus berbeza setiap hari, makin susah.',
'Twelve weeks, five days a week, the full method. Training, structure and progression in one plan — the programme HITFAT is built on.':'Dua belas minggu, lima hari seminggu, kaedah penuh. Latihan, struktur dan kemajuan dalam satu pelan — program asas HITFAT.',
'Eight weeks built around getting genuinely stronger. Heavier, slower, fewer reps — and a lot more demanding than it looks on paper.':'Lapan minggu untuk betul-betul jadi lebih kuat. Lebih berat, lebih perlahan, kurang reps — dan jauh lebih mencabar dari yang nampak.',
'Twenty-one days to get the habit back. Built for the restart after a long break, not for someone already training five days a week.':'Dua puluh satu hari untuk kembalikan tabiat. Untuk mula semula selepas lama berhenti, bukan untuk yang sudah berlatih lima hari seminggu.',
'Eight weeks aimed squarely at losing fat while keeping the muscle you already have. Five sessions a week, no filler days.':'Lapan minggu fokus pada turun lemak sambil kekalkan otot yang ada. Lima sesi seminggu, tiada hari kosong.',
'Five weeks of short, sweaty sessions you can do in a living room. No equipment, no excuses — just show up on the days marked.':'Lima minggu sesi pendek yang buat berpeluh, boleh buat di ruang tamu. Tanpa alat, tanpa alasan — datang saja pada hari yang ditanda.',
'A gentle four-week start. Low impact, nothing jumpy, and every session scales down if today is a hard day.':'Permulaan empat minggu yang lembut. Impak rendah, tiada lompatan, dan setiap sesi boleh diringankan kalau hari ini susah.',
'Six weeks to rebuild a base. Push, pull, legs and conditioning — the split that has worked for fifty years.':'Enam minggu untuk bina semula asas. Push, pull, kaki dan conditioning — split yang berkesan selama lima puluh tahun.',
'Built around joints, not ego. Chair-supported strength, controlled tempo and real rest days — six weeks of getting stronger without getting sore.':'Dibina untuk sendi, bukan ego. Kekuatan dengan sokongan kerusi, tempo terkawal dan hari rehat sebenar — enam minggu jadi kuat tanpa sakit-sakit.',
'Two weeks, twelve minutes a day, one job: a midsection that holds you together. Floor work only.':'Dua minggu, dua belas minit sehari, satu tugas: bahagian tengah yang kuat. Latihan atas lantai sahaja.',
'Eight weeks of calisthenics progression. Push-ups, squats, lunges and holds — the same movements, harder every fortnight.':'Lapan minggu progresi calisthenics. Push-up, squat, lunge dan tahan — gerakan sama, makin susah setiap dua minggu.',
'Four weeks of intervals in a space the size of a towel. Hard for eighteen minutes, then done.':'Empat minggu interval dalam ruang sebesar tuala. Keras selama lapan belas minit, kemudian siap.',
'Three weeks using what is already in your house — two bottles and a towel. Proof that equipment was never the reason.':'Tiga minggu guna apa yang sudah ada di rumah — dua botol dan tuala. Bukti alat bukan alasan.',
'Twenty-one mornings, ten minutes each. This one is not about the workout — it is about becoming a person who trains before the day starts.':'Dua puluh satu pagi, sepuluh minit setiap satu. Ini bukan tentang workout — ia tentang jadi orang yang berlatih sebelum hari bermula.',
'The long one. Twelve weeks, four sessions a week, every muscle and every energy system. Start it when you are ready to finish it.':'Yang panjang. Dua belas minggu, empat sesi seminggu, setiap otot dan setiap sistem tenaga. Mula bila anda bersedia untuk habiskan.',
'One week of kettlebell training to build full-body power and burn fat. One bell, big results.':'Seminggu latihan kettlebell untuk bina power seluruh badan dan bakar lemak. Satu kettlebell, hasil besar.',
'Two weeks of structured dumbbell training. Build lean muscle with a push/pull/legs split.':'Dua minggu latihan dumbbell berstruktur. Bina otot dengan split push/pull/kaki.',
'Five days of low-impact chair workouts. Perfect for beginners, seniors, or joint-friendly training.':'Lima hari workout kerusi berimpak rendah. Sesuai untuk pemula, warga emas, atau latihan mesra sendi.',
'Three weeks to transform at home. No equipment needed. Follow day by day and build the habit that sticks.':'Tiga minggu untuk berubah di rumah. Tanpa alat. Ikut hari demi hari dan bina tabiat yang kekal.',
'# minutes of intense training every single day for # weeks. No excuses, no rest weeks. Show up daily and transform.':'# minit latihan intensif setiap hari selama # minggu. Tiada alasan, tiada minggu rehat. Datang setiap hari dan berubah.',
"For the days you really can't be bothered. Just # minutes, mostly on the floor. Something is always better than nothing.":'Untuk hari anda betul-betul malas. Hanya # minit, kebanyakannya atas lantai. Sedikit tetap lebih baik dari tiada.',
'A full-body kettlebell circuit that builds power and torches fat. Grab one bell and go.':'Circuit kettlebell seluruh badan yang bina power dan bakar lemak. Ambil satu kettlebell dan mula.',
'Heavy kettlebell strength work. Build full-body power with swings, cleans and presses.':'Latihan kekuatan kettlebell berat. Bina power seluruh badan dengan swing, clean dan press.',
'Kettlebell core circuit to carve a rock-solid midsection and grip strength.':'Circuit core kettlebell untuk bahagian tengah yang kukuh dan genggaman kuat.',
'Build lean muscle head to toe with this complete dumbbell strength session.':'Bina otot dari kepala hingga kaki dengan sesi kekuatan dumbbell yang lengkap ini.',
'Sculpt your arms and shoulders. Curls, presses and raises for definition.':'Bentukkan lengan dan bahu. Curl, press dan raise untuk definisi.',
'Loaded leg session. Squats, lunges and deadlifts to build powerful legs.':'Sesi kaki dengan beban. Squat, lunge dan deadlift untuk kaki yang kuat.',
'No weights? Grab two water bottles. Full-body toning you can do anywhere.':'Tiada pemberat? Ambil dua botol air. Toning seluruh badan yang boleh dibuat di mana-mana.',
'Light bottle weight, heavy core burn. Tighten your abs with this quick circuit.':'Botol ringan, burn core yang berat. Ketatkan abs dengan circuit pantas ini.',
'All you need is a chair. Great for beginners, seniors, or low-impact training days.':'Anda hanya perlukan kerusi. Bagus untuk pemula, warga emas, atau hari latihan impak rendah.',
'Low-impact chair cardio and core. Get your heart rate up without jumping.':'Cardio dan core kerusi berimpak rendah. Naikkan degupan jantung tanpa melompat.',
'A simple towel adds resistance and slide. Tone your whole body with one cloth.':'Tuala biasa beri rintangan dan gelongsor. Toning seluruh badan dengan sehelai kain.',
'Use a towel on smooth floor for sliding core moves that fire up your abs.':'Guna tuala atas lantai licin untuk gerakan core gelongsor yang bakar abs anda.',
'Quick high-energy session to torch calories. Perfect for busy days when you still want to sweat.':'Sesi pantas bertenaga tinggi untuk bakar kalori. Sesuai untuk hari sibuk bila anda masih nak berpeluh.',
'Only got # minutes? This fast-paced cardio blast keeps your heart rate up and the calories burning.':'Hanya ada # minit? Cardio laju ini kekalkan degupan jantung tinggi dan kalori terus terbakar.',
'Hit every muscle group in one session. Strength meets cardio for maximum burn.':'Latih setiap kumpulan otot dalam satu sesi. Kekuatan bertemu cardio untuk burn maksimum.',
'Non-stop high-intensity intervals. No rest, all heart. Built to melt fat fast.':'Interval intensiti tinggi tanpa henti. Tiada rehat, sepenuh hati. Dibina untuk cairkan lemak dengan cepat.',
'Combine fat-burning cardio with toning moves for a lean, defined physique.':'Gabungkan cardio bakar lemak dengan gerakan toning untuk badan yang ramping dan berbentuk.',
'Wake up your body with this energizing flow. The perfect way to start your day strong.':'Bangunkan badan dengan flow bertenaga ini. Cara terbaik untuk mulakan hari dengan kuat.',
'Sculpt and strengthen legs and glutes. Squats, lunges and hip work for serious lower body gains.':'Bentuk dan kuatkan kaki dan punggung. Squat, lunge dan latihan pinggul untuk badan bawah yang kuat.',
'Push, press and dip your way to a stronger chest, shoulders and arms. No weights needed.':'Push, press dan dip untuk dada, bahu dan lengan yang lebih kuat. Tak perlu pemberat.',
'The ultimate leg destroyer. Build powerful quads, hamstrings and glutes.':'Latihan kaki paling mencabar. Bina quads, hamstring dan punggung yang kuat.',
'All pressing movements. Sculpt your chest, shoulders and triceps to perfection.':'Semua gerakan menolak. Bentukkan dada, bahu dan trisep anda.',
'Strengthen your back and improve posture with rows and hinge patterns.':'Kuatkan belakang dan perbaiki postur dengan row dan corak hinge.',
'Target and grow your glutes with focused hip and bridge work.':'Fokus dan besarkan punggung dengan latihan pinggul dan bridge.',
'Build defined arms and capped shoulders with bottle and bodyweight work.':'Bina lengan dan bahu yang berbentuk dengan latihan botol dan tanpa alat.',
'Total-body strength session hitting every major muscle group with compound moves.':'Sesi kekuatan seluruh badan untuk setiap kumpulan otot utama dengan gerakan kompaun.',
'Master your bodyweight with foundational calisthenics movements.':'Kuasai berat badan sendiri dengan gerakan asas calisthenics.',
'Build a rock-solid core with planks, crunches and rotational work. Strong center, strong everything.':'Bina core yang kukuh dengan plank, crunch dan latihan putaran. Tengah kuat, semuanya kuat.',
'A focused core finisher. Carve out your abs with this quick but brutal sequence.':'Finisher core yang fokus. Bentukkan abs dengan urutan pantas tapi mencabar ini.',
'Build deep core control and balance with holds and anti-rotation work.':'Bina kawalan core dalaman dan keseimbangan dengan latihan tahan dan anti-putaran.',
'High-intensity ab circuit. Fast, focused and ruthless on the midsection.':'Circuit abs intensiti tinggi. Laju, fokus dan keras pada bahagian tengah.',
'Carve your side abs with rotational and lateral core work.':'Bentukkan abs sisi dengan latihan core putaran dan sisi.',
'New to core training? Start here. Simple, effective moves to build your base.':'Baru dengan latihan core? Mula di sini. Gerakan ringkas dan berkesan untuk bina asas.',
'# minutes of explosive intervals. Maximum effort, maximum results.':'# minit interval eksplosif. Usaha maksimum, hasil maksimum.',
'Explosive jump training to build athletic power and speed.':'Latihan lompat eksplosif untuk bina power dan kelajuan atlet.',
'Build your cardio base with steady, sustained conditioning work.':'Bina asas cardio dengan latihan conditioning yang stabil dan berterusan.',
'No time? No problem. # minutes of pure cardio to get the blood pumping.':'Tiada masa? Tiada masalah. # minit cardio untuk alirkan darah.',
'A balanced full-body session that fits into any schedule.':'Sesi seluruh badan yang seimbang, sesuai dengan apa-apa jadual.',
'Train like an athlete. Power, strength and conditioning in one demanding circuit.':'Berlatih macam atlet. Power, kekuatan dan conditioning dalam satu circuit yang mencabar.',
'No equipment, no problem. A complete home workout using just your bodyweight.':'Tiada alat, tiada masalah. Workout rumah lengkap dengan berat badan sendiri.',
'New to working out? This gentle full-body intro builds confidence and form.':'Baru mula bersenam? Pengenalan seluruh badan yang lembut ini bina keyakinan dan teknik.',
'Make your weekend count with this challenging full-body burner.':'Manfaatkan hujung minggu dengan burner seluruh badan yang mencabar ini.',
'Add load with a backpack for serious lower body strength gains.':'Tambah beban dengan beg galas untuk kekuatan badan bawah yang serius.'
};

/* months and weekdays, for dates the app writes in English */
const I18N_DATE={January:'Januari',February:'Februari',March:'Mac',April:'April',May:'Mei',June:'Jun',July:'Julai',August:'Ogos',September:'September',October:'Oktober',November:'November',December:'Disember',
  Jan:'Jan',Feb:'Feb',Mar:'Mac',Apr:'Apr',Jun:'Jun',Jul:'Jul',Aug:'Ogo',Sep:'Sep',Sept:'Sep',Oct:'Okt',Nov:'Nov',Dec:'Dis',
  Monday:'Isnin',Tuesday:'Selasa',Wednesday:'Rabu',Thursday:'Khamis',Friday:'Jumaat',Saturday:'Sabtu',Sunday:'Ahad',
  Mon:'Isn',Tue:'Sel',Wed:'Rab',Thu:'Kha',Fri:'Jum',Sat:'Sab',Sun:'Ahd'};
/* a few that a plain template cannot say */
const I18N_RX=[
  [/^#(\d+) of (\d+) on the board$/, '#$1 daripada $2 dalam papan'],
  [/^(\d+) of (\d+) done$/, '$1 daripada $2 siap'],
  [/^Step (\d+) of (\d+)$/, 'Langkah $1 daripada $2'],
  [/^(\d+) wk$/, '$1 mgg'],
  [/^(\d+)min$/, '$1min'],
  [/^Up first: (.+)$/, 'Mula dengan: $1']
];

/* BM is hidden for now (14 Oct 2026, the owner: "English dulu"): no switch
   in Settings and everyone in English, whatever they chose before. Every
   word below is kept. Set this true to bring the switch back. */
var LANG_LIVE=false;
let LANG='en';
try{ LANG=(LANG_LIVE && localStorage.getItem('hitfat_lang')==='ms')?'ms':'en'; }catch(e){}

const _i18nT=[];   /* templates, compiled once */
(function(){
  const esc=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  Object.keys(I18N_MS).forEach(k=>{
    if(k.indexOf('#')<0) return;
    _i18nT.push([new RegExp('^'+esc(k).replace(/#/g,'(\\d+(?:[.,]\\d+)?)')+'$'), I18N_MS[k]]);
  });
})();
function _i18nFill(ms,nums){
  let i=0;
  if(/\{\d\}/.test(ms)) return ms.replace(/\{(\d)\}/g,(_,n)=>nums[+n-1]||'');
  return ms.replace(/#/g,()=>nums[i++]!==undefined?nums[i-1]:'#');
}
function _i18nDate(t){
  /* only when every word in it is a month, a weekday, am or pm */
  const words=t.match(/[A-Za-z]+/g); if(!words || !/\d|^[A-Za-z]+$/.test(t)) return null;
  const cap=w=>w[0].toUpperCase()+w.slice(1).toLowerCase();
  if(!words.every(w=>I18N_DATE[cap(w)] || /^(am|pm)$/i.test(w))) return null;
  if(words.every(w=>/^(am|pm)$/i.test(w))) return null;
  return t.replace(/[A-Za-z]+/g,w=>{ const m=I18N_DATE[cap(w)]; if(!m) return w; return (w.length>1&&w===w.toUpperCase())?m.toUpperCase():m; });
}
/* one string, English → Malay, or null when there is nothing to say */
function i18nWord(t){
  if(I18N_MS.hasOwnProperty(t)) return I18N_MS[t];
  for(const [rx,ms] of _i18nT){ const m=t.match(rx); if(m) return _i18nFill(ms,m.slice(1)); }
  for(const [rx,ms] of I18N_RX){ if(rx.test(t)) return t.replace(rx,ms); }
  return null;
}
function i18n(s){
  const t=String(s).replace(/\s+/g,' ').trim(); if(!t) return null;
  let r=i18nWord(t); if(r!==null) return r;
  if(t.indexOf(' · ')>0){
    let any=false;
    const parts=t.split(' · ').map(p=>{ const x=i18nWord(p)||_i18nDate(p); if(x!==null){ any=true; return x; } return p; });
    if(any) return parts.join(' · ');
  }
  return _i18nDate(t);
}
/* what the member sees, in the language they chose */
function tr(s){ return LANG==='ms' ? (i18n(s)||s) : s; }

/* ── laying it over the screen ── */
const _I18N_SKIP={SCRIPT:1,STYLE:1,IFRAME:1,TEXTAREA:1,INPUT:1,SELECT:1,OPTION:1,CODE:1};
const _I18N_ATTR=['placeholder','aria-label','title'];
function _i18nText(n){
  const v=n.nodeValue; if(!v || !/[A-Za-z]/.test(v)) return;
  if(n.__ms!==undefined && v===n.__ms) return;          /* ours already */
  const ms=i18n(v); if(ms===null){ n.__en=undefined; return; }
  const lead=v.match(/^\s*/)[0], trail=v.match(/\s*$/)[0];
  n.__en=v; n.__ms=lead+ms+trail; n.nodeValue=n.__ms;
}
function _i18nEl(el){
  for(const a of _I18N_ATTR){
    const v=el.getAttribute&&el.getAttribute(a); if(!v) continue;
    const key='__en_'+a; if(el[key+'_ms']===v) continue;
    const ms=i18n(v); if(ms===null) continue;
    el[key]=v; el[key+'_ms']=ms; el.setAttribute(a,ms);
  }
}
function i18nApply(root){
  if(LANG!=='ms' || !root) return;
  if(root.nodeType===3){ const p=root.parentNode; if(p && !_I18N_SKIP[p.nodeName] && !(p.closest&&p.closest('[data-noi18n]'))) _i18nText(root); return; }
  if(root.nodeType!==1 || _I18N_SKIP[root.nodeName] || (root.closest&&root.closest('[data-noi18n]'))) return;
  _i18nEl(root);
  const w=document.createTreeWalker(root, NodeFilter.SHOW_TEXT|NodeFilter.SHOW_ELEMENT, {acceptNode:n=>
    n.nodeType===1 ? ((_I18N_SKIP[n.nodeName]||(n.hasAttribute&&n.hasAttribute('data-noi18n')))?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT) : NodeFilter.FILTER_ACCEPT});
  let n; while((n=w.nextNode())){ if(n.nodeType===3) _i18nText(n); else _i18nEl(n); }
}
/* back to English: every swapped string returns to what the app wrote */
function i18nRestore(root){
  const w=document.createTreeWalker(root||document.body, NodeFilter.SHOW_TEXT|NodeFilter.SHOW_ELEMENT);
  let n; while((n=w.nextNode())){
    if(n.nodeType===3){ if(n.__en!==undefined && n.nodeValue===n.__ms){ n.nodeValue=n.__en; } n.__en=n.__ms=undefined; continue; }
    for(const a of _I18N_ATTR){ const key='__en_'+a; if(n[key]!==undefined){ if(n.getAttribute(a)===n[key+'_ms']) n.setAttribute(a,n[key]); n[key]=n[key+'_ms']=undefined; } }
  }
}
let _i18nObs=null, _i18nQ=[], _i18nRaf=0;
function _i18nFlush(){ _i18nRaf=0; const q=_i18nQ; _i18nQ=[]; for(const n of q) if(n.isConnected!==false) i18nApply(n); }
function i18nStart(){
  if(typeof MutationObserver==='undefined' || typeof document==='undefined' || !document.body) return;
  if(!_i18nObs){
    _i18nObs=new MutationObserver(ms=>{
      if(LANG!=='ms') return;
      for(const m of ms){
        if(m.type==='characterData') _i18nQ.push(m.target);
        else if(m.type==='attributes') _i18nQ.push(m.target);
        else m.addedNodes.forEach(x=>_i18nQ.push(x));
      }
      /* translate before the frame paints, so English never flashes */
      if(!_i18nRaf){ _i18nRaf=1; Promise.resolve().then(_i18nFlush); }
    });
    _i18nObs.observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:_I18N_ATTR});
  }
  if(LANG==='ms') i18nApply(document.body);
  try{ document.documentElement.lang=LANG; }catch(e){}
}
function setLang(l){
  l = l==='ms' ? 'ms' : 'en';
  if(l===LANG) return;
  LANG=l;
  try{ localStorage.setItem('hitfat_lang',l); }catch(e){}
  try{ document.documentElement.lang=l; }catch(e){}
  if(l==='ms') i18nApply(document.body); else i18nRestore(document.body);
  try{ renderMe(); }catch(e){}
}
/* prompt() and confirm() are the browser's, out of the page's reach */
if(typeof window!=='undefined'){
  ['prompt','confirm','alert'].forEach(f=>{
    const orig=window[f]; if(typeof orig!=='function') return;
    window[f]=function(msg){ const a=[].slice.call(arguments); if(a.length) a[0]=tr(a[0]); return orig.apply(window,a); };
  });
}

if(typeof document!=="undefined" && document.body) i18nStart();
