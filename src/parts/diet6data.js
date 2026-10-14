/* DIET 6 MINGGU 6KG: the program's content, exactly as Coach Seth wrote it
   (diet-6-minggu-6kg-content.json, 14 Oct 2026). Not edited here: change the
   JSON and copy it in again. The logic that reads it is diet6.js. */
var D6_DATA={
 "program": {
  "id": "diet-6-minggu-6kg",
  "name": "DIET 6 MINGGU 6KG",
  "subtitle": "Nasi Kekal, Lemak Hilang. Sasaran sehingga 6kg, ikut badan anda.",
  "days": 42,
  "coach": "Coach Seth, HITFAT",
  "price_note": "RM39 sekali bayar (untuk diuji)"
 },
 "start_here": {
  "welcome": "Selamat datang ke DIET 6 MINGGU 6KG. Anda tak perlu tinggal nasi. Anda cuma perlu tahu bajet kalori anda dan ikut sedikit demi sedikit setiap hari.",
  "how_to_use": [
   "Setiap hari buka app dan baca Kad Ilmu (2 minit).",
   "Siapkan Misi Hari Ini.",
   "Tandakan Senarai Semak: log makan, air, langkah, nasi ikut senduk.",
   "Senaman adalah pilihan tetapi sangat digalakkan.",
   "Timbang setiap pagi. Ukuran penuh pada Hari 1, 21 dan 42."
  ],
  "target_note": "Sasaran 6kg ialah 'sehingga'. App kira sasaran peribadi ikut berat anda. Kadar selamat ialah 0.5 hingga 1% berat badan seminggu. Hasil berbeza mengikut individu.",
  "safety": "Jika anda hamil, menyusu, ada penyakit seperti diabetes, darah tinggi atau penyakit jantung, sedang mengambil ubat, atau pernah ada masalah pemakanan, dapatkan nasihat doktor sebelum mula. Hentikan senaman jika rasa sakit dada, pening atau sesak nafas luar biasa.",
  "calorie_floor": "App tidak akan menetapkan bajet bawah 1,200 kcal (wanita) atau 1,500 kcal (lelaki)."
 },
 "weeks": {
  "1": "FAHAM BAJET",
  "2": "NASI KEKAL",
  "3": "GERAK LEBIH",
  "4": "MAKAN LUAR & MAJLIS",
  "5": "JANGAN TERTIPU",
  "6": "LEMAK HILANG, TABIAT KEKAL"
 },
 "workouts": {
  "kuat_a": {
   "name": "Sesi Kuat A",
   "minutes": 20,
   "impact": "rendah, tanpa lompat",
   "moves": [
    {
     "name": "Squat ke kerusi",
     "reps": "10-12"
    },
    {
     "name": "Push-up dinding / lutut",
     "reps": "8-10"
    },
    {
     "name": "Glute bridge",
     "reps": "12-15"
    },
    {
     "name": "Row guna beg / botol air",
     "reps": "12"
    },
    {
     "name": "Plank lutut",
     "reps": "20-30 saat"
    }
   ],
   "rest": "45 saat antara pusingan"
  },
  "kuat_b": {
   "name": "Sesi Kuat B",
   "minutes": 20,
   "impact": "rendah, tanpa lompat",
   "moves": [
    {
     "name": "Step back lunge (pegang kerusi jika perlu)",
     "reps": "8 setiap kaki"
    },
    {
     "name": "Wall sit",
     "reps": "20-30 saat"
    },
    {
     "name": "Superman",
     "reps": "10"
    },
    {
     "name": "Dead bug",
     "reps": "8 setiap sisi"
    },
    {
     "name": "Calf raise",
     "reps": "15"
    }
   ],
   "rest": "45 saat antara pusingan"
  },
  "jalan": {
   "name": "Jalan Pantas",
   "minutes": 20,
   "impact": "rendah",
   "moves": [
    {
     "name": "Jalan pantas (boleh bercakap, tak boleh menyanyi)",
     "reps": "20 minit"
    }
   ],
   "rest": "-"
  },
  "jalan_panjang": {
   "name": "Jalan Panjang Hujung Minggu",
   "minutes": 30,
   "impact": "rendah",
   "moves": [
    {
     "name": "Jalan santai hingga pantas, boleh bersama keluarga",
     "reps": "30-40 minit"
    }
   ],
   "rest": "-"
  },
  "rehat": {
   "name": "Rehat Aktif & Regangan",
   "minutes": 10,
   "impact": "sangat rendah",
   "moves": [
    {
     "name": "Regangan peha depan & belakang",
     "reps": "30 saat setiap sisi"
    },
    {
     "name": "Regangan dada di pintu",
     "reps": "30 saat"
    },
    {
     "name": "Cat-cow",
     "reps": "10"
    },
    {
     "name": "Child's pose",
     "reps": "45 saat"
    }
   ],
   "rest": "-"
  }
 },
 "days": [
  {
   "day": 1,
   "week": 1,
   "phase": "FAHAM BAJET",
   "label": "Hari 1 · Faham Bajet",
   "card": {
    "title": "Selamat datang: badan anda ikut bajet",
    "body": "Berat badan berubah ikut tenaga yang masuk (makanan dan minuman) dan tenaga yang keluar (hidup, bergerak, bersenam). Bila masuk kurang daripada keluar, badan guna simpanan lemak. Program ini ajar anda kawal bajet itu tanpa buang nasi."
   },
   "mission": "Timbang berat, ukur pinggang dan ambil gambar pagi ini sebelum sarapan. Kemudian lihat bajet kalori dan sasaran 6 minggu anda.",
   "workout": {
    "name": "Sesi Kuat A",
    "minutes": 20,
    "impact": "rendah, tanpa lompat",
    "moves": [
     {
      "name": "Squat ke kerusi",
      "reps": "10-12"
     },
     {
      "name": "Push-up dinding / lutut",
      "reps": "8-10"
     },
     {
      "name": "Glute bridge",
      "reps": "12-15"
     },
     {
      "name": "Row guna beg / botol air",
      "reps": "12"
     },
     {
      "name": "Plank lutut",
      "reps": "20-30 saat"
     }
    ],
    "rest": "45 saat antara pusingan",
    "rounds": 2
   },
   "workout_optional": true,
   "checklist": [
    "Log makan hari ini",
    "Minum 2.0 L air",
    "5,000 langkah",
    "Nasi ikut senduk bajet"
   ],
   "body_checkin": true,
   "food_audit": false,
   "recalculate_budget": false
  },
  {
   "day": 2,
   "week": 1,
   "phase": "FAHAM BAJET",
   "label": "Hari 2 · Faham Bajet",
   "card": {
    "title": "BMR: tenaga untuk terus hidup",
    "body": "BMR ialah tenaga yang badan guna walaupun anda baring sepanjang hari: untuk bernafas, jantung, otak dan organ. Ia selalunya bahagian terbesar pembakaran harian. Selebihnya datang dari bergerak, bersenam dan mencerna makanan."
   },
   "mission": "Semak semula tahap aktiviti dalam profil anda. Pilih dengan jujur. Kerja pejabat dan jarang bersenam ialah 'tidak aktif', bukan 'sederhana'.",
   "workout": {
    "name": "Jalan Pantas",
    "minutes": 20,
    "impact": "rendah",
    "moves": [
     {
      "name": "Jalan pantas (boleh bercakap, tak boleh menyanyi)",
      "reps": "20 minit"
     }
    ],
    "rest": "-",
    "rounds": 1
   },
   "workout_optional": true,
   "checklist": [
    "Log makan hari ini",
    "Minum 2.0 L air",
    "5,000 langkah",
    "Nasi ikut senduk bajet"
   ],
   "body_checkin": false,
   "food_audit": false,
   "recalculate_budget": false
  },
  {
   "day": 3,
   "week": 1,
   "phase": "FAHAM BAJET",
   "label": "Hari 3 · Faham Bajet",
   "card": {
    "title": "Bajet kalori seperti gaji",
    "body": "Bajet kalori sama seperti gaji bulanan. Belanja lebih daripada gaji, hutang bertambah. Makan lebih daripada bajet, lemak bertambah. Langkah pertama ialah tahu ke mana 'duit' kalori anda pergi."
   },
   "mission": "AUDIT MAKAN: log SEMUA yang anda makan dan minum hari ini, termasuk air manis, kuih dan cicah-cicah. Jangan ubah apa-apa lagi. Kita nak tengok gambaran sebenar.",
   "workout": {
    "name": "Sesi Kuat B",
    "minutes": 20,
    "impact": "rendah, tanpa lompat",
    "moves": [
     {
      "name": "Step back lunge (pegang kerusi jika perlu)",
      "reps": "8 setiap kaki"
     },
     {
      "name": "Wall sit",
      "reps": "20-30 saat"
     },
     {
      "name": "Superman",
      "reps": "10"
     },
     {
      "name": "Dead bug",
      "reps": "8 setiap sisi"
     },
     {
      "name": "Calf raise",
      "reps": "15"
     }
    ],
    "rest": "45 saat antara pusingan",
    "rounds": 2
   },
   "workout_optional": true,
   "checklist": [
    "Log makan hari ini",
    "Minum 2.0 L air",
    "5,000 langkah",
    "Nasi ikut senduk bajet"
   ],
   "body_checkin": false,
   "food_audit": true,
   "recalculate_budget": false
  },
  {
   "day": 4,
   "week": 1,
   "phase": "FAHAM BAJET",
   "label": "Hari 4 · Faham Bajet",
   "card": {
    "title": "Berapa laju yang selamat?",
    "body": "Kadar selamat ialah sekitar 0.5 hingga 1% berat badan seminggu. Lebih laju daripada itu, anda lebih cenderung hilang otot, rasa sangat lapar dan berat naik balik. Perlahan sedikit, tapi kekal."
   },
   "mission": "Buka keputusan Audit Makan semalam. Cari 3 makanan atau minuman yang paling banyak kalori. Itu sasaran pertama anda.",
   "workout": {
    "name": "Jalan Pantas",
    "minutes": 20,
    "impact": "rendah",
    "moves": [
     {
      "name": "Jalan pantas (boleh bercakap, tak boleh menyanyi)",
      "reps": "20 minit"
     }
    ],
    "rest": "-",
    "rounds": 1
   },
   "workout_optional": true,
   "checklist": [
    "Log makan hari ini",
    "Minum 2.0 L air",
    "5,000 langkah",
    "Nasi ikut senduk bajet"
   ],
   "body_checkin": false,
   "food_audit": false,
   "recalculate_budget": false
  },
  {
   "day": 5,
   "week": 1,
   "phase": "FAHAM BAJET",
   "label": "Hari 5 · Faham Bajet",
   "card": {
    "title": "Kurang makan, lebih gerak, atau gabungan?",
    "body": "Defisit boleh datang dari makan kurang sedikit atau bergerak lebih. Untuk kebanyakan orang, gabungan kedua-duanya paling mudah diteruskan. Pemakanan biasanya beri kesan lebih besar, senaman bantu jaga otot dan semangat."
   },
   "mission": "Pilih gaya anda: 'Fokus makan', 'Seimbang' atau 'Fokus gerak'. Tiada jawapan salah, pilih yang anda boleh buat 6 minggu.",
   "workout": {
    "name": "Sesi Kuat A",
    "minutes": 20,
    "impact": "rendah, tanpa lompat",
    "moves": [
     {
      "name": "Squat ke kerusi",
      "reps": "10-12"
     },
     {
      "name": "Push-up dinding / lutut",
      "reps": "8-10"
     },
     {
      "name": "Glute bridge",
      "reps": "12-15"
     },
     {
      "name": "Row guna beg / botol air",
      "reps": "12"
     },
     {
      "name": "Plank lutut",
      "reps": "20-30 saat"
     }
    ],
    "rest": "45 saat antara pusingan",
    "rounds": 2
   },
   "workout_optional": true,
   "checklist": [
    "Log makan hari ini",
    "Minum 2.0 L air",
    "5,000 langkah",
    "Nasi ikut senduk bajet"
   ],
   "body_checkin": false,
   "food_audit": false,
   "recalculate_budget": false
  },
  {
   "day": 6,
   "week": 1,
   "phase": "FAHAM BAJET",
   "label": "Hari 6 · Faham Bajet",
   "card": {
    "title": "Kisah Amir (bahagian 1)",
    "body": "Amir, 32 tahun, kerja pejabat, 78kg. Keperluan hariannya sekitar 2,450 kcal, tapi audit makan tunjuk dia makan hampir 2,800 kcal: teh tarik 3 kali, nasi lemak pagi, gorengan petang. Dia tak makan 'banyak', cuma banyak kalori tersembunyi."
   },
   "mission": "Kira beza antara apa yang anda makan (Audit Makan) dan bajet anda. Berapa lebih atau kurang?",
   "workout": {
    "name": "Jalan Panjang Hujung Minggu",
    "minutes": 30,
    "impact": "rendah",
    "moves": [
     {
      "name": "Jalan santai hingga pantas, boleh bersama keluarga",
      "reps": "30-40 minit"
     }
    ],
    "rest": "-",
    "rounds": 1
   },
   "workout_optional": true,
   "checklist": [
    "Log makan hari ini",
    "Minum 2.0 L air",
    "5,000 langkah",
    "Nasi ikut senduk bajet"
   ],
   "body_checkin": false,
   "food_audit": false,
   "recalculate_budget": false
  },
  {
   "day": 7,
   "week": 1,
   "phase": "FAHAM BAJET",
   "label": "Hari 7 · Faham Bajet",
   "card": {
    "title": "Timbangan naik turun itu normal",
    "body": "Berat boleh naik turun 0.5 hingga 1.5kg sehari kerana air, garam, makanan dalam perut dan kitaran haid. Itu bukan lemak. Lihat purata mingguan, bukan satu hari."
   },
   "mission": "Timbang setiap pagi selepas ke tandas, sebelum makan. Catat dalam app. Fokus pada trend minggu, bukan angka harian.",
   "workout": {
    "name": "Rehat Aktif & Regangan",
    "minutes": 10,
    "impact": "sangat rendah",
    "moves": [
     {
      "name": "Regangan peha depan & belakang",
      "reps": "30 saat setiap sisi"
     },
     {
      "name": "Regangan dada di pintu",
      "reps": "30 saat"
     },
     {
      "name": "Cat-cow",
      "reps": "10"
     },
     {
      "name": "Child's pose",
      "reps": "45 saat"
     }
    ],
    "rest": "-",
    "rounds": 1
   },
   "workout_optional": true,
   "checklist": [
    "Log makan hari ini",
    "Minum 2.0 L air",
    "5,000 langkah",
    "Nasi ikut senduk bajet"
   ],
   "body_checkin": false,
   "food_audit": false,
   "recalculate_budget": false
  },
  {
   "day": 8,
   "week": 2,
   "phase": "NASI KEKAL",
   "label": "Hari 8 · Nasi Kekal",
   "card": {
    "title": "Nasi bukan musuh, porsi yang jadi masalah",
    "body": "Nasi ialah sumber tenaga yang biasa untuk kita. Masalahnya ialah pinggan penuh nasi dengan sedikit lauk dan sayur. Kaedah pinggan: separuh sayur, suku protein, suku nasi."
   },
   "mission": "Makan tengah hari hari ini ikut kaedah pinggan. Ambil gambar pinggan anda.",
   "workout": {
    "name": "Sesi Kuat A",
    "minutes": 20,
    "impact": "rendah, tanpa lompat",
    "moves": [
     {
      "name": "Squat ke kerusi",
      "reps": "10-12"
     },
     {
      "name": "Push-up dinding / lutut",
      "reps": "8-10"
     },
     {
      "name": "Glute bridge",
      "reps": "12-15"
     },
     {
      "name": "Row guna beg / botol air",
      "reps": "12"
     },
     {
      "name": "Plank lutut",
      "reps": "20-30 saat"
     }
    ],
    "rest": "45 saat antara pusingan",
    "rounds": 2
   },
   "workout_optional": true,
   "checklist": [
    "Log makan hari ini",
    "Minum 2.0 L air",
    "6,000 langkah",
    "Nasi ikut senduk bajet"
   ],
   "body_checkin": false,
   "food_audit": false,
   "recalculate_budget": true
  },
  {
   "day": 9,
   "week": 2,
   "phase": "NASI KEKAL",
   "label": "Hari 9 · Nasi Kekal",
   "card": {
    "title": "Kenal senduk anda",
    "body": "Satu senduk nasi (lebih kurang 100g) membawa sekitar 130 kcal. App tunjuk berapa senduk ikut bajet anda. Guna senduk yang sama setiap hari supaya ukuran konsisten."
   },
   "mission": "Pilih satu senduk di rumah sebagai 'senduk rasmi'. Ikut bilangan senduk dalam bajet anda untuk setiap waktu makan.",
   "workout": {
    "name": "Jalan Pantas",
    "minutes": 20,
    "impact": "rendah",
    "moves": [
     {
      "name": "Jalan pantas (boleh bercakap, tak boleh menyanyi)",
      "reps": "20 minit"
     }
    ],
    "rest": "-",
    "rounds": 1
   },
   "workout_optional": true,
   "checklist": [
    "Log makan hari ini",
    "Minum 2.0 L air",
    "6,000 langkah",
    "Nasi ikut senduk bajet"
   ],
   "body_checkin": false,
   "food_audit": false,
   "recalculate_budget": false
  },
  {
   "day": 10,
   "week": 2,
   "phase": "NASI KEKAL",
   "label": "Hari 10 · Nasi Kekal",
   "card": {
    "title": "Kalori dalam gelas",
    "body": "Minuman manis senang terlepas pandang. Segelas teh tarik boleh membawa sekitar 120 hingga 180 kcal. Tiga gelas sehari hampir sama dengan sepinggan nasi, tanpa rasa kenyang."
   },
   "mission": "Tukar sekurang-kurangnya satu minuman manis hari ini kepada teh-O atau kopi-O kurang manis, atau air kosong.",
   "workout": {
    "name": "Sesi Kuat B",
    "minutes": 20,
    "impact": "rendah, tanpa lompat",
    "moves": [
     {
      "name": "Step back lunge (pegang kerusi jika perlu)",
      "reps": "8 setiap kaki"
     },
     {
      "name": "Wall sit",
      "reps": "20-30 saat"
     },
     {
      "name": "Superman",
      "reps": "10"
     },
     {
      "name": "Dead bug",
      "reps": "8 setiap sisi"
     },
     {
      "name": "Calf raise",
      "reps": "15"
     }
    ],
    "rest": "45 saat antara pusingan",
    "rounds": 2
   },
   "workout_optional": true,
   "checklist": [
    "Log makan hari ini",
    "Minum 2.0 L air",
    "6,000 langkah",
    "Nasi ikut senduk bajet"
   ],
   "body_checkin": false,
   "food_audit": false,
   "recalculate_budget": false
  },
  {
   "day": 11,
   "week": 2,
   "phase": "NASI KEKAL",
   "label": "Hari 11 · Nasi Kekal",
   "card": {
    "title": "Protein buat anda kenyang lebih lama",
    "body": "Protein bantu anda rasa kenyang dan bantu jaga otot semasa berat turun. Sasaran mudah: satu tapak tangan protein setiap kali makan, contohnya ayam, ikan, telur, tauhu atau tempe."
   },
   "mission": "Pastikan setiap waktu makan hari ini ada satu tapak tangan protein.",
   "workout": {
    "name": "Jalan Pantas",
    "minutes": 20,
    "impact": "rendah",
    "moves": [
     {
      "name": "Jalan pantas (boleh bercakap, tak boleh menyanyi)",
      "reps": "20 minit"
     }
    ],
    "rest": "-",
    "rounds": 1
   },
   "workout_optional": true,
   "checklist": [
    "Log makan hari ini",
    "Minum 2.0 L air",
    "6,000 langkah",
    "Nasi ikut senduk bajet"
   ],
   "body_checkin": false,
   "food_audit": false,
   "recalculate_budget": false
  },
  {
   "day": 12,
   "week": 2,
   "phase": "NASI KEKAL",
   "label": "Hari 12 · Nasi Kekal",
   "card": {
    "title": "Cara masak ubah segalanya",
    "body": "Ayam yang sama boleh berbeza ratusan kalori bergantung cara masak. Satu sudu besar minyak membawa sekitar 120 kcal. Bakar, rebus, kukus, masak sup dan gulai kurang santan lebih menjimatkan bajet."
   },
   "mission": "Tukar satu hidangan goreng hari ini kepada bakar, rebus, kukus atau sup.",
   "workout": {
    "name": "Sesi Kuat A",
    "minutes": 20,
    "impact": "rendah, tanpa lompat",
    "moves": [
     {
      "name": "Squat ke kerusi",
      "reps": "10-12"
     },
     {
      "name": "Push-up dinding / lutut",
      "reps": "8-10"
     },
     {
      "name": "Glute bridge",
      "reps": "12-15"
     },
     {
      "name": "Row guna beg / botol air",
      "reps": "12"
     },
     {
      "name": "Plank lutut",
      "reps": "20-30 saat"
     }
    ],
    "rest": "45 saat antara pusingan",
    "rounds": 2
   },
   "workout_optional": true,
   "checklist": [
    "Log makan hari ini",
    "Minum 2.0 L air",
    "6,000 langkah",
    "Nasi ikut senduk bajet"
   ],
   "body_checkin": false,
   "food_audit": false,
   "recalculate_budget": false
  },
  {
   "day": 13,
   "week": 2,
   "phase": "NASI KEKAL",
   "label": "Hari 13 · Nasi Kekal",
   "card": {
    "title": "Snek pintar untuk petang",
    "body": "Ramai 'tewas' waktu petang kerana terlalu lapar, lalu terus beli gorengan. Snek yang dirancang mengelakkan keputusan terburu-buru."
   },
   "mission": "Sediakan 2 snek untuk esok: buah, telur rebus, segenggam kacang atau yogurt.",
   "workout": {
    "name": "Jalan Panjang Hujung Minggu",
    "minutes": 30,
    "impact": "rendah",
    "moves": [
     {
      "name": "Jalan santai hingga pantas, boleh bersama keluarga",
      "reps": "30-40 minit"
     }
    ],
    "rest": "-",
    "rounds": 1
   },
   "workout_optional": true,
   "checklist": [
    "Log makan hari ini",
    "Minum 2.0 L air",
    "6,000 langkah",
    "Nasi ikut senduk bajet"
   ],
   "body_checkin": false,
   "food_audit": false,
   "recalculate_budget": false
  },
  {
   "day": 14,
   "week": 2,
   "phase": "NASI KEKAL",
   "label": "Hari 14 · Nasi Kekal",
   "card": {
    "title": "Audit Makan kedua",
    "body": "Seminggu lepas anda audit makan. Hari ini kita buat sekali lagi untuk lihat perubahan. Perubahan kecil pada minuman dan porsi selalunya sudah beri beza besar."
   },
   "mission": "AUDIT MAKAN 2: log semua makanan hari ini dan bandingkan dengan Hari 3.",
   "workout": {
    "name": "Rehat Aktif & Regangan",
    "minutes": 10,
    "impact": "sangat rendah",
    "moves": [
     {
      "name": "Regangan peha depan & belakang",
      "reps": "30 saat setiap sisi"
     },
     {
      "name": "Regangan dada di pintu",
      "reps": "30 saat"
     },
     {
      "name": "Cat-cow",
      "reps": "10"
     },
     {
      "name": "Child's pose",
      "reps": "45 saat"
     }
    ],
    "rest": "-",
    "rounds": 1
   },
   "workout_optional": true,
   "checklist": [
    "Log makan hari ini",
    "Minum 2.0 L air",
    "6,000 langkah",
    "Nasi ikut senduk bajet"
   ],
   "body_checkin": false,
   "food_audit": true,
   "recalculate_budget": false
  },
  {
   "day": 15,
   "week": 3,
   "phase": "GERAK LEBIH",
   "label": "Hari 15 · Gerak Lebih",
   "card": {
    "title": "Langkah harian: senjata yang dipandang ringan",
    "body": "Pergerakan harian di luar senaman, seperti berjalan, naik tangga dan kerja rumah, boleh membakar lebih banyak tenaga daripada sesi senaman itu sendiri. Ia mudah, murah dan selamat."
   },
   "mission": "Tambah 1,000 langkah berbanding purata anda minggu lepas.",
   "workout": {
    "name": "Sesi Kuat A",
    "minutes": 20,
    "impact": "rendah, tanpa lompat",
    "moves": [
     {
      "name": "Squat ke kerusi",
      "reps": "10-12"
     },
     {
      "name": "Push-up dinding / lutut",
      "reps": "8-10"
     },
     {
      "name": "Glute bridge",
      "reps": "12-15"
     },
     {
      "name": "Row guna beg / botol air",
      "reps": "12"
     },
     {
      "name": "Plank lutut",
      "reps": "20-30 saat"
     }
    ],
    "rest": "45 saat antara pusingan",
    "rounds": 3
   },
   "workout_optional": true,
   "checklist": [
    "Log makan hari ini",
    "Minum 2.25 L air",
    "7,000 langkah",
    "Nasi ikut senduk bajet"
   ],
   "body_checkin": false,
   "food_audit": false,
   "recalculate_budget": true
  },
  {
   "day": 16,
   "week": 3,
   "phase": "GERAK LEBIH",
   "label": "Hari 16 · Gerak Lebih",
   "card": {
    "title": "Kenapa latihan kekuatan penting semasa diet",
    "body": "Bila makan kurang, badan boleh hilang otot bersama lemak. Latihan kekuatan memberi isyarat kepada badan untuk simpan otot. Otot membantu bentuk badan nampak lebih kemas."
   },
   "mission": "Siapkan Sesi Kuat hari ini. Fokus pada teknik, bukan laju.",
   "workout": {
    "name": "Jalan Pantas",
    "minutes": 20,
    "impact": "rendah",
    "moves": [
     {
      "name": "Jalan pantas (boleh bercakap, tak boleh menyanyi)",
      "reps": "20 minit"
     }
    ],
    "rest": "-",
    "rounds": 1
   },
   "workout_optional": true,
   "checklist": [
    "Log makan hari ini",
    "Minum 2.25 L air",
    "7,000 langkah",
    "Nasi ikut senduk bajet"
   ],
   "body_checkin": false,
   "food_audit": false,
   "recalculate_budget": false
  },
  {
   "day": 17,
   "week": 3,
   "phase": "GERAK LEBIH",
   "label": "Hari 17 · Gerak Lebih",
   "card": {
    "title": "Berapa banyak senaman yang cukup?",
    "body": "Garis panduan kesihatan umum ialah sekitar 150 minit aktiviti sederhana seminggu, ditambah latihan kekuatan 2 kali seminggu. Itu cuma kira-kira 20 hingga 30 minit sehari."
   },
   "mission": "Tulis jadual 3 sesi senaman minggu ini dalam kalendar telefon anda.",
   "workout": {
    "name": "Sesi Kuat B",
    "minutes": 20,
    "impact": "rendah, tanpa lompat",
    "moves": [
     {
      "name": "Step back lunge (pegang kerusi jika perlu)",
      "reps": "8 setiap kaki"
     },
     {
      "name": "Wall sit",
      "reps": "20-30 saat"
     },
     {
      "name": "Superman",
      "reps": "10"
     },
     {
      "name": "Dead bug",
      "reps": "8 setiap sisi"
     },
     {
      "name": "Calf raise",
      "reps": "15"
     }
    ],
    "rest": "45 saat antara pusingan",
    "rounds": 3
   },
   "workout_optional": true,
   "checklist": [
    "Log makan hari ini",
    "Minum 2.25 L air",
    "7,000 langkah",
    "Nasi ikut senduk bajet"
   ],
   "body_checkin": false,
   "food_audit": false,
   "recalculate_budget": false
  },
  {
   "day": 18,
   "week": 3,
   "phase": "GERAK LEBIH",
   "label": "Hari 18 · Gerak Lebih",
   "card": {
    "title": "Tidur dan rasa lapar",
    "body": "Kurang tidur boleh buat anda lebih lapar dan lebih mengidam makanan manis keesokan harinya. Tidur yang cukup ialah sebahagian daripada program ini."
   },
   "mission": "Sasarkan 7 jam tidur malam ini. Letak telefon jauh 30 minit sebelum tidur.",
   "workout": {
    "name": "Jalan Pantas",
    "minutes": 20,
    "impact": "rendah",
    "moves": [
     {
      "name": "Jalan pantas (boleh bercakap, tak boleh menyanyi)",
      "reps": "20 minit"
     }
    ],
    "rest": "-",
    "rounds": 1
   },
   "workout_optional": true,
   "checklist": [
    "Log makan hari ini",
    "Minum 2.25 L air",
    "7,000 langkah",
    "Nasi ikut senduk bajet"
   ],
   "body_checkin": false,
   "food_audit": false,
   "recalculate_budget": false
  },
  {
   "day": 19,
   "week": 3,
   "phase": "GERAK LEBIH",
   "label": "Hari 19 · Gerak Lebih",
   "card": {
    "title": "Gerak tanpa 'senaman'",
    "body": "Naik tangga, letak kereta lebih jauh, sapu rumah, main dengan anak, berjalan semasa bercakap telefon. Semua ini dikira. Kumpulkan sedikit demi sedikit."
   },
   "mission": "Pilih 2 cara bergerak tambahan hari ini dan tandakan bila siap.",
   "workout": {
    "name": "Sesi Kuat A",
    "minutes": 20,
    "impact": "rendah, tanpa lompat",
    "moves": [
     {
      "name": "Squat ke kerusi",
      "reps": "10-12"
     },
     {
      "name": "Push-up dinding / lutut",
      "reps": "8-10"
     },
     {
      "name": "Glute bridge",
      "reps": "12-15"
     },
     {
      "name": "Row guna beg / botol air",
      "reps": "12"
     },
     {
      "name": "Plank lutut",
      "reps": "20-30 saat"
     }
    ],
    "rest": "45 saat antara pusingan",
    "rounds": 3
   },
   "workout_optional": true,
   "checklist": [
    "Log makan hari ini",
    "Minum 2.25 L air",
    "7,000 langkah",
    "Nasi ikut senduk bajet"
   ],
   "body_checkin": false,
   "food_audit": false,
   "recalculate_budget": false
  },
  {
   "day": 20,
   "week": 3,
   "phase": "GERAK LEBIH",
   "label": "Hari 20 · Gerak Lebih",
   "card": {
    "title": "Tak boleh lari dari pinggan",
    "body": "Jalan pantas 30 minit mungkin membakar sekitar 120 hingga 180 kcal, lebih kurang segelas teh tarik. Senaman sangat bagus untuk kesihatan, tapi kawalan makan tetap kunci utama turun berat."
   },
   "mission": "Guna Kalkulator Bakar Kalori untuk aktiviti anda hari ini. Bandingkan dengan satu minuman manis.",
   "workout": {
    "name": "Jalan Panjang Hujung Minggu",
    "minutes": 30,
    "impact": "rendah",
    "moves": [
     {
      "name": "Jalan santai hingga pantas, boleh bersama keluarga",
      "reps": "30-40 minit"
     }
    ],
    "rest": "-",
    "rounds": 1
   },
   "workout_optional": true,
   "checklist": [
    "Log makan hari ini",
    "Minum 2.25 L air",
    "7,000 langkah",
    "Nasi ikut senduk bajet"
   ],
   "body_checkin": false,
   "food_audit": false,
   "recalculate_budget": false
  },
  {
   "day": 21,
   "week": 3,
   "phase": "GERAK LEBIH",
   "label": "Hari 21 · Gerak Lebih",
   "card": {
    "title": "Ukuran pertengahan",
    "body": "Pinggang selalunya turun walaupun berat lambat bergerak, terutamanya jika anda bersenam kekuatan. Sebab itu kita ukur kedua-duanya."
   },
   "mission": "CHECK-IN: timbang berat, ukur pinggang dan ambil gambar pagi ini. Bandingkan dengan Hari 1.",
   "workout": {
    "name": "Rehat Aktif & Regangan",
    "minutes": 10,
    "impact": "sangat rendah",
    "moves": [
     {
      "name": "Regangan peha depan & belakang",
      "reps": "30 saat setiap sisi"
     },
     {
      "name": "Regangan dada di pintu",
      "reps": "30 saat"
     },
     {
      "name": "Cat-cow",
      "reps": "10"
     },
     {
      "name": "Child's pose",
      "reps": "45 saat"
     }
    ],
    "rest": "-",
    "rounds": 1
   },
   "workout_optional": true,
   "checklist": [
    "Log makan hari ini",
    "Minum 2.25 L air",
    "7,000 langkah",
    "Nasi ikut senduk bajet"
   ],
   "body_checkin": true,
   "food_audit": false,
   "recalculate_budget": false
  },
  {
   "day": 22,
   "week": 4,
   "phase": "MAKAN LUAR & MAJLIS",
   "label": "Hari 22 · Makan Luar & Majlis",
   "card": {
    "title": "Formula nasi campur",
    "body": "Di kedai nasi campur: 1 protein yang tidak digoreng, 2 jenis sayur, kuah sedikit di tepi, nasi ikut senduk bajet. Formula ini boleh dipakai di mana-mana."
   },
   "mission": "Order nasi campur hari ini ikut formula. Ambil gambar dan log dalam app.",
   "workout": {
    "name": "Sesi Kuat A",
    "minutes": 20,
    "impact": "rendah, tanpa lompat",
    "moves": [
     {
      "name": "Squat ke kerusi",
      "reps": "10-12"
     },
     {
      "name": "Push-up dinding / lutut",
      "reps": "8-10"
     },
     {
      "name": "Glute bridge",
      "reps": "12-15"
     },
     {
      "name": "Row guna beg / botol air",
      "reps": "12"
     },
     {
      "name": "Plank lutut",
      "reps": "20-30 saat"
     }
    ],
    "rest": "45 saat antara pusingan",
    "rounds": 3
   },
   "workout_optional": true,
   "checklist": [
    "Log makan hari ini",
    "Minum 2.25 L air",
    "7,000 langkah",
    "Nasi ikut senduk bajet"
   ],
   "body_checkin": false,
   "food_audit": false,
   "recalculate_budget": true
  },
  {
   "day": 23,
   "week": 4,
   "phase": "MAKAN LUAR & MAJLIS",
   "label": "Hari 23 · Makan Luar & Majlis",
   "card": {
    "title": "Menu mamak bawah 500 kcal",
    "body": "Di kedai mamak, pilihan yang lebih jimat termasuk capati dengan dal, tosai, roti telur tanpa minyak tambahan, atau nasi dengan lauk bakar. Hati-hati dengan 'kuah banjir' dan minuman manis."
   },
   "mission": "Senaraikan 3 menu mamak kegemaran anda yang muat bawah 500 kcal termasuk minuman.",
   "workout": {
    "name": "Jalan Pantas",
    "minutes": 20,
    "impact": "rendah",
    "moves": [
     {
      "name": "Jalan pantas (boleh bercakap, tak boleh menyanyi)",
      "reps": "20 minit"
     }
    ],
    "rest": "-",
    "rounds": 1
   },
   "workout_optional": true,
   "checklist": [
    "Log makan hari ini",
    "Minum 2.25 L air",
    "7,000 langkah",
    "Nasi ikut senduk bajet"
   ],
   "body_checkin": false,
   "food_audit": false,
   "recalculate_budget": false
  },
  {
   "day": 24,
   "week": 4,
   "phase": "MAKAN LUAR & MAJLIS",
   "label": "Hari 24 · Makan Luar & Majlis",
   "card": {
    "title": "Sarapan tradisional tanpa rasa bersalah",
    "body": "Nasi lemak, nasi kerabu, nasi dagang dan roti canai boleh dimakan. Kuncinya: separuh nasi, lebih ulam atau sayur, protein bakar atau telur rebus, dan minuman tanpa gula."
   },
   "mission": "Pilih satu sarapan tradisional kegemaran dan rancang versi 'ikut bajet' anda.",
   "workout": {
    "name": "Sesi Kuat B",
    "minutes": 20,
    "impact": "rendah, tanpa lompat",
    "moves": [
     {
      "name": "Step back lunge (pegang kerusi jika perlu)",
      "reps": "8 setiap kaki"
     },
     {
      "name": "Wall sit",
      "reps": "20-30 saat"
     },
     {
      "name": "Superman",
      "reps": "10"
     },
     {
      "name": "Dead bug",
      "reps": "8 setiap sisi"
     },
     {
      "name": "Calf raise",
      "reps": "15"
     }
    ],
    "rest": "45 saat antara pusingan",
    "rounds": 3
   },
   "workout_optional": true,
   "checklist": [
    "Log makan hari ini",
    "Minum 2.25 L air",
    "7,000 langkah",
    "Nasi ikut senduk bajet"
   ],
   "body_checkin": false,
   "food_audit": false,
   "recalculate_budget": false
  },
  {
   "day": 25,
   "week": 4,
   "phase": "MAKAN LUAR & MAJLIS",
   "label": "Hari 25 · Makan Luar & Majlis",
   "card": {
    "title": "Strategi kenduri",
    "body": "Di kenduri: ambil pinggan sekali sahaja, isi sayur dan protein dahulu, nasi ikut senduk, dan minum air kosong. Kuih pencuci mulut pilih satu, bukan semua."
   },
   "mission": "Tulis strategi kenduri anda dalam 3 baris supaya sedia untuk majlis seterusnya.",
   "workout": {
    "name": "Jalan Pantas",
    "minutes": 20,
    "impact": "rendah",
    "moves": [
     {
      "name": "Jalan pantas (boleh bercakap, tak boleh menyanyi)",
      "reps": "20 minit"
     }
    ],
    "rest": "-",
    "rounds": 1
   },
   "workout_optional": true,
   "checklist": [
    "Log makan hari ini",
    "Minum 2.25 L air",
    "7,000 langkah",
    "Nasi ikut senduk bajet"
   ],
   "body_checkin": false,
   "food_audit": false,
   "recalculate_budget": false
  },
  {
   "day": 26,
   "week": 4,
   "phase": "MAKAN LUAR & MAJLIS",
   "label": "Hari 26 · Makan Luar & Majlis",
   "card": {
    "title": "Makan bersama keluarga",
    "body": "Anda tak perlu masak berasingan. Makan lauk yang sama, cuma ubah porsi: kurangkan nasi dan kuah santan, tambah sayur dan protein di pinggan anda."
   },
   "mission": "Makan malam bersama keluarga ikut kaedah pinggan, tanpa masak menu lain.",
   "workout": {
    "name": "Sesi Kuat A",
    "minutes": 20,
    "impact": "rendah, tanpa lompat",
    "moves": [
     {
      "name": "Squat ke kerusi",
      "reps": "10-12"
     },
     {
      "name": "Push-up dinding / lutut",
      "reps": "8-10"
     },
     {
      "name": "Glute bridge",
      "reps": "12-15"
     },
     {
      "name": "Row guna beg / botol air",
      "reps": "12"
     },
     {
      "name": "Plank lutut",
      "reps": "20-30 saat"
     }
    ],
    "rest": "45 saat antara pusingan",
    "rounds": 3
   },
   "workout_optional": true,
   "checklist": [
    "Log makan hari ini",
    "Minum 2.25 L air",
    "7,000 langkah",
    "Nasi ikut senduk bajet"
   ],
   "body_checkin": false,
   "food_audit": false,
   "recalculate_budget": false
  },
  {
   "day": 27,
   "week": 4,
   "phase": "MAKAN LUAR & MAJLIS",
   "label": "Hari 27 · Makan Luar & Majlis",
   "card": {
    "title": "Satu hidangan bebas, bukan satu hari bebas",
    "body": "Menikmati makanan kegemaran itu normal. Satu hidangan bebas seminggu boleh dimuatkan dalam bajet. Satu hari 'cheat' penuh pula boleh memadam defisit beberapa hari."
   },
   "mission": "Rancang satu hidangan bebas minggu ini dan nikmatinya tanpa rasa bersalah.",
   "workout": {
    "name": "Jalan Panjang Hujung Minggu",
    "minutes": 30,
    "impact": "rendah",
    "moves": [
     {
      "name": "Jalan santai hingga pantas, boleh bersama keluarga",
      "reps": "30-40 minit"
     }
    ],
    "rest": "-",
    "rounds": 1
   },
   "workout_optional": true,
   "checklist": [
    "Log makan hari ini",
    "Minum 2.25 L air",
    "7,000 langkah",
    "Nasi ikut senduk bajet"
   ],
   "body_checkin": false,
   "food_audit": false,
   "recalculate_budget": false
  },
  {
   "day": 28,
   "week": 4,
   "phase": "MAKAN LUAR & MAJLIS",
   "label": "Hari 28 · Makan Luar & Majlis",
   "card": {
    "title": "Rumusan bulan pertama",
    "body": "Empat minggu sudah berlalu. Lihat graf berat dan pinggang anda. Trend menurun, walaupun perlahan, bermaksud sistem anda berfungsi."
   },
   "mission": "Semak graf dalam tab Progres. Tulis satu perkara yang paling banyak membantu anda.",
   "workout": {
    "name": "Rehat Aktif & Regangan",
    "minutes": 10,
    "impact": "sangat rendah",
    "moves": [
     {
      "name": "Regangan peha depan & belakang",
      "reps": "30 saat setiap sisi"
     },
     {
      "name": "Regangan dada di pintu",
      "reps": "30 saat"
     },
     {
      "name": "Cat-cow",
      "reps": "10"
     },
     {
      "name": "Child's pose",
      "reps": "45 saat"
     }
    ],
    "rest": "-",
    "rounds": 1
   },
   "workout_optional": true,
   "checklist": [
    "Log makan hari ini",
    "Minum 2.25 L air",
    "7,000 langkah",
    "Nasi ikut senduk bajet"
   ],
   "body_checkin": false,
   "food_audit": false,
   "recalculate_budget": false,
   "offer": {
    "type": "upgrade",
    "text": "Nak hasil lebih laju dengan coach yang semak progres anda setiap minggu? Lihat pilihan coaching."
   }
  },
  {
   "day": 29,
   "week": 5,
   "phase": "JANGAN TERTIPU",
   "label": "Hari 29 · Jangan Tertipu",
   "card": {
    "title": "Pembakar lemak: apa yang sebenarnya berlaku",
    "body": "Kebanyakan pembakar lemak berasaskan kafein dan perangsang. Kesannya kecil berbanding pemakanan dan pergerakan. Ada yang menyebabkan berdebar atau susah tidur."
   },
   "mission": "Semak label satu produk 'kurus' atau 'detoks' yang anda ada atau pernah lihat. Apa bahan utamanya?",
   "workout": {
    "name": "Sesi Kuat A",
    "minutes": 20,
    "impact": "rendah, tanpa lompat",
    "moves": [
     {
      "name": "Squat ke kerusi",
      "reps": "10-12"
     },
     {
      "name": "Push-up dinding / lutut",
      "reps": "8-10"
     },
     {
      "name": "Glute bridge",
      "reps": "12-15"
     },
     {
      "name": "Row guna beg / botol air",
      "reps": "12"
     },
     {
      "name": "Plank lutut",
      "reps": "20-30 saat"
     }
    ],
    "rest": "45 saat antara pusingan",
    "rounds": 3
   },
   "workout_optional": true,
   "checklist": [
    "Log makan hari ini",
    "Minum 2.5 L air",
    "8,000 langkah",
    "Nasi ikut senduk bajet"
   ],
   "body_checkin": false,
   "food_audit": false,
   "recalculate_budget": true
  },
  {
   "day": 30,
   "week": 5,
   "phase": "JANGAN TERTIPU",
   "label": "Hari 30 · Jangan Tertipu",
   "card": {
    "title": "Protein serbuk: perlu atau tidak?",
    "body": "Protein serbuk bukan wajib. Ia cuma cara mudah untuk menambah protein. Makanan biasa seperti telur, ayam, ikan dan tauhu sudah memadai untuk kebanyakan orang."
   },
   "mission": "Bandingkan kos satu hidangan protein: 2 biji telur, seketul ayam, atau satu sudu protein serbuk.",
   "workout": {
    "name": "Jalan Pantas",
    "minutes": 20,
    "impact": "rendah",
    "moves": [
     {
      "name": "Jalan pantas (boleh bercakap, tak boleh menyanyi)",
      "reps": "20 minit"
     }
    ],
    "rest": "-",
    "rounds": 1
   },
   "workout_optional": true,
   "checklist": [
    "Log makan hari ini",
    "Minum 2.5 L air",
    "8,000 langkah",
    "Nasi ikut senduk bajet"
   ],
   "body_checkin": false,
   "food_audit": false,
   "recalculate_budget": false
  },
  {
   "day": 31,
   "week": 5,
   "phase": "JANGAN TERTIPU",
   "label": "Hari 31 · Jangan Tertipu",
   "card": {
    "title": "Shake gantian makanan",
    "body": "Shake gantian makanan boleh membantu waktu sibuk, tetapi bukan penyelesaian jangka panjang. Anda tetap perlu belajar makan makanan biasa ikut bajet."
   },
   "mission": "Jika anda guna shake, hadkan kepada satu waktu makan sahaja. Jika tidak, langkau misi ini.",
   "workout": {
    "name": "Sesi Kuat B",
    "minutes": 20,
    "impact": "rendah, tanpa lompat",
    "moves": [
     {
      "name": "Step back lunge (pegang kerusi jika perlu)",
      "reps": "8 setiap kaki"
     },
     {
      "name": "Wall sit",
      "reps": "20-30 saat"
     },
     {
      "name": "Superman",
      "reps": "10"
     },
     {
      "name": "Dead bug",
      "reps": "8 setiap sisi"
     },
     {
      "name": "Calf raise",
      "reps": "15"
     }
    ],
    "rest": "45 saat antara pusingan",
    "rounds": 3
   },
   "workout_optional": true,
   "checklist": [
    "Log makan hari ini",
    "Minum 2.5 L air",
    "8,000 langkah",
    "Nasi ikut senduk bajet"
   ],
   "body_checkin": false,
   "food_audit": false,
   "recalculate_budget": false
  },
  {
   "day": 32,
   "week": 5,
   "phase": "JANGAN TERTIPU",
   "label": "Hari 32 · Jangan Tertipu",
   "card": {
    "title": "Detoks, jus dan 'teh kurus'",
    "body": "Hati dan buah pinggang sudah menjalankan kerja 'detoks' setiap hari. Sesetengah teh kurus bertindak sebagai julap, jadi berat yang turun kebanyakannya air, dan ia boleh berbahaya jika diambil lama."
   },
   "mission": "Jika ada produk detoks di rumah, baca amarannya. Kongsi satu fakta hari ini dengan seseorang.",
   "workout": {
    "name": "Jalan Pantas",
    "minutes": 20,
    "impact": "rendah",
    "moves": [
     {
      "name": "Jalan pantas (boleh bercakap, tak boleh menyanyi)",
      "reps": "20 minit"
     }
    ],
    "rest": "-",
    "rounds": 1
   },
   "workout_optional": true,
   "checklist": [
    "Log makan hari ini",
    "Minum 2.5 L air",
    "8,000 langkah",
    "Nasi ikut senduk bajet"
   ],
   "body_checkin": false,
   "food_audit": false,
   "recalculate_budget": false
  },
  {
   "day": 33,
   "week": 5,
   "phase": "JANGAN TERTIPU",
   "label": "Hari 33 · Jangan Tertipu",
   "card": {
    "title": "Mesin dan pusat pelangsingan",
    "body": "Mesin getar, balutan panas dan rawatan 'buang lemak' selalunya hanya mengurangkan air buat sementara. Tiada mesin yang menggantikan bajet kalori dan pergerakan."
   },
   "mission": "Fikir berapa banyak wang yang anda pernah belanja untuk jalan pintas. Tulis jumlahnya, sebagai peringatan.",
   "workout": {
    "name": "Sesi Kuat A",
    "minutes": 20,
    "impact": "rendah, tanpa lompat",
    "moves": [
     {
      "name": "Squat ke kerusi",
      "reps": "10-12"
     },
     {
      "name": "Push-up dinding / lutut",
      "reps": "8-10"
     },
     {
      "name": "Glute bridge",
      "reps": "12-15"
     },
     {
      "name": "Row guna beg / botol air",
      "reps": "12"
     },
     {
      "name": "Plank lutut",
      "reps": "20-30 saat"
     }
    ],
    "rest": "45 saat antara pusingan",
    "rounds": 3
   },
   "workout_optional": true,
   "checklist": [
    "Log makan hari ini",
    "Minum 2.5 L air",
    "8,000 langkah",
    "Nasi ikut senduk bajet"
   ],
   "body_checkin": false,
   "food_audit": false,
   "recalculate_budget": false
  },
  {
   "day": 34,
   "week": 5,
   "phase": "JANGAN TERTIPU",
   "label": "Hari 34 · Jangan Tertipu",
   "card": {
    "title": "Gambar sebelum-selepas dalam iklan",
    "body": "Pencahayaan, sudut kamera, postur dan masa ambil gambar boleh mengubah rupa badan dengan banyak. Bandingkan diri anda dengan diri anda sendiri, bukan dengan iklan."
   },
   "mission": "Bandingkan gambar Hari 1 dan Hari 21 anda dalam cahaya dan sudut yang sama.",
   "workout": {
    "name": "Jalan Panjang Hujung Minggu",
    "minutes": 30,
    "impact": "rendah",
    "moves": [
     {
      "name": "Jalan santai hingga pantas, boleh bersama keluarga",
      "reps": "30-40 minit"
     }
    ],
    "rest": "-",
    "rounds": 1
   },
   "workout_optional": true,
   "checklist": [
    "Log makan hari ini",
    "Minum 2.5 L air",
    "8,000 langkah",
    "Nasi ikut senduk bajet"
   ],
   "body_checkin": false,
   "food_audit": false,
   "recalculate_budget": false
  },
  {
   "day": 35,
   "week": 5,
   "phase": "JANGAN TERTIPU",
   "label": "Hari 35 · Jangan Tertipu",
   "card": {
    "title": "5 soalan sebelum beli produk kesihatan",
    "body": "Sebelum beli: (1) Apa bahannya? (2) Ada kajian sebenar? (3) Siapa yang jual dan untung? (4) Berapa kos sebulan? (5) Boleh capai hasil sama dengan makanan dan gerak?"
   },
   "mission": "Simpan 5 soalan ini dalam nota telefon anda.",
   "workout": {
    "name": "Rehat Aktif & Regangan",
    "minutes": 10,
    "impact": "sangat rendah",
    "moves": [
     {
      "name": "Regangan peha depan & belakang",
      "reps": "30 saat setiap sisi"
     },
     {
      "name": "Regangan dada di pintu",
      "reps": "30 saat"
     },
     {
      "name": "Cat-cow",
      "reps": "10"
     },
     {
      "name": "Child's pose",
      "reps": "45 saat"
     }
    ],
    "rest": "-",
    "rounds": 1
   },
   "workout_optional": true,
   "checklist": [
    "Log makan hari ini",
    "Minum 2.5 L air",
    "8,000 langkah",
    "Nasi ikut senduk bajet"
   ],
   "body_checkin": false,
   "food_audit": false,
   "recalculate_budget": false
  },
  {
   "day": 36,
   "week": 6,
   "phase": "LEMAK HILANG, TABIAT KEKAL",
   "label": "Hari 36 · Lemak Hilang, Tabiat Kekal",
   "card": {
    "title": "Kenapa makin lama makin perlahan",
    "body": "Bila berat turun, badan yang lebih kecil memerlukan tenaga yang kurang. Jadi penurunan secara semula jadi menjadi perlahan. Itu tanda badan berubah, bukan tanda gagal."
   },
   "mission": "Kira semula bajet kalori anda menggunakan berat terbaru dalam app.",
   "workout": {
    "name": "Sesi Kuat A",
    "minutes": 20,
    "impact": "rendah, tanpa lompat",
    "moves": [
     {
      "name": "Squat ke kerusi",
      "reps": "10-12"
     },
     {
      "name": "Push-up dinding / lutut",
      "reps": "8-10"
     },
     {
      "name": "Glute bridge",
      "reps": "12-15"
     },
     {
      "name": "Row guna beg / botol air",
      "reps": "12"
     },
     {
      "name": "Plank lutut",
      "reps": "20-30 saat"
     }
    ],
    "rest": "45 saat antara pusingan",
    "rounds": 4
   },
   "workout_optional": true,
   "checklist": [
    "Log makan hari ini",
    "Minum 2.5 L air",
    "8,000 langkah",
    "Nasi ikut senduk bajet"
   ],
   "body_checkin": false,
   "food_audit": false,
   "recalculate_budget": true
  },
  {
   "day": 37,
   "week": 6,
   "phase": "LEMAK HILANG, TABIAT KEKAL",
   "label": "Hari 37 · Lemak Hilang, Tabiat Kekal",
   "card": {
    "title": "Bila berat 'tersekat'",
    "body": "Jika berat tidak bergerak 2 minggu, semak tiga perkara: porsi sudah membesar semula? Langkah berkurang? Tidur terganggu? Jangan terus potong makan secara drastik."
   },
   "mission": "Semak tiga perkara itu dan pilih satu untuk dibaiki minggu ini.",
   "workout": {
    "name": "Jalan Pantas",
    "minutes": 20,
    "impact": "rendah",
    "moves": [
     {
      "name": "Jalan pantas (boleh bercakap, tak boleh menyanyi)",
      "reps": "20 minit"
     }
    ],
    "rest": "-",
    "rounds": 1
   },
   "workout_optional": true,
   "checklist": [
    "Log makan hari ini",
    "Minum 2.5 L air",
    "8,000 langkah",
    "Nasi ikut senduk bajet"
   ],
   "body_checkin": false,
   "food_audit": false,
   "recalculate_budget": false
  },
  {
   "day": 38,
   "week": 6,
   "phase": "LEMAK HILANG, TABIAT KEKAL",
   "label": "Hari 38 · Lemak Hilang, Tabiat Kekal",
   "card": {
    "title": "Kisah Amir (bahagian 2)",
    "body": "Selepas 6 minggu, Amir turun beberapa kilogram dan pinggangnya berkurang. Yang paling penting, dia masih minum teh, cuma kurang manis, dan masih makan nasi lemak, cuma separuh nasi. Tabiat kecil itulah yang kekal."
   },
   "mission": "Tulis 3 tabiat yang anda akan teruskan selepas program ini.",
   "workout": {
    "name": "Sesi Kuat B",
    "minutes": 20,
    "impact": "rendah, tanpa lompat",
    "moves": [
     {
      "name": "Step back lunge (pegang kerusi jika perlu)",
      "reps": "8 setiap kaki"
     },
     {
      "name": "Wall sit",
      "reps": "20-30 saat"
     },
     {
      "name": "Superman",
      "reps": "10"
     },
     {
      "name": "Dead bug",
      "reps": "8 setiap sisi"
     },
     {
      "name": "Calf raise",
      "reps": "15"
     }
    ],
    "rest": "45 saat antara pusingan",
    "rounds": 4
   },
   "workout_optional": true,
   "checklist": [
    "Log makan hari ini",
    "Minum 2.5 L air",
    "8,000 langkah",
    "Nasi ikut senduk bajet"
   ],
   "body_checkin": false,
   "food_audit": false,
   "recalculate_budget": false
  },
  {
   "day": 39,
   "week": 6,
   "phase": "LEMAK HILANG, TABIAT KEKAL",
   "label": "Hari 39 · Lemak Hilang, Tabiat Kekal",
   "card": {
    "title": "Bajet selepas program",
    "body": "Selepas capai sasaran, naikkan bajet secara perlahan, contohnya 100 hingga 200 kcal seminggu, sehingga berat stabil. Ini membantu elak berat naik semula dengan mendadak."
   },
   "mission": "Lihat cadangan bajet kekal anda dalam app.",
   "workout": {
    "name": "Jalan Pantas",
    "minutes": 20,
    "impact": "rendah",
    "moves": [
     {
      "name": "Jalan pantas (boleh bercakap, tak boleh menyanyi)",
      "reps": "20 minit"
     }
    ],
    "rest": "-",
    "rounds": 1
   },
   "workout_optional": true,
   "checklist": [
    "Log makan hari ini",
    "Minum 2.5 L air",
    "8,000 langkah",
    "Nasi ikut senduk bajet"
   ],
   "body_checkin": false,
   "food_audit": false,
   "recalculate_budget": false
  },
  {
   "day": 40,
   "week": 6,
   "phase": "LEMAK HILANG, TABIAT KEKAL",
   "label": "Hari 40 · Lemak Hilang, Tabiat Kekal",
   "card": {
    "title": "Bersedia untuk musim makan",
    "body": "Ramadan, Raya, cuti sekolah dan musim kenduri akan datang. Dengan ilmu bajet, anda boleh nikmati semuanya dan tahu cara kembali ke landasan."
   },
   "mission": "Pilih satu musim yang akan datang dan tulis satu strategi untuknya.",
   "workout": {
    "name": "Sesi Kuat A",
    "minutes": 20,
    "impact": "rendah, tanpa lompat",
    "moves": [
     {
      "name": "Squat ke kerusi",
      "reps": "10-12"
     },
     {
      "name": "Push-up dinding / lutut",
      "reps": "8-10"
     },
     {
      "name": "Glute bridge",
      "reps": "12-15"
     },
     {
      "name": "Row guna beg / botol air",
      "reps": "12"
     },
     {
      "name": "Plank lutut",
      "reps": "20-30 saat"
     }
    ],
    "rest": "45 saat antara pusingan",
    "rounds": 4
   },
   "workout_optional": true,
   "checklist": [
    "Log makan hari ini",
    "Minum 2.5 L air",
    "8,000 langkah",
    "Nasi ikut senduk bajet"
   ],
   "body_checkin": false,
   "food_audit": false,
   "recalculate_budget": false,
   "offer": {
    "type": "subscription",
    "text": "Teruskan momentum. Langgan HITFAT+ untuk buka semua program."
   }
  },
  {
   "day": 41,
   "week": 6,
   "phase": "LEMAK HILANG, TABIAT KEKAL",
   "label": "Hari 41 · Lemak Hilang, Tabiat Kekal",
   "card": {
    "title": "Siapa anda sekarang",
    "body": "Perubahan yang kekal datang dari identiti: 'Saya orang yang ambil berat apa yang saya makan', bukan 'Saya sedang berdiet'. Tabiat ikut identiti."
   },
   "mission": "Lengkapkan ayat ini: 'Saya seorang yang...'",
   "workout": {
    "name": "Jalan Panjang Hujung Minggu",
    "minutes": 30,
    "impact": "rendah",
    "moves": [
     {
      "name": "Jalan santai hingga pantas, boleh bersama keluarga",
      "reps": "30-40 minit"
     }
    ],
    "rest": "-",
    "rounds": 1
   },
   "workout_optional": true,
   "checklist": [
    "Log makan hari ini",
    "Minum 2.5 L air",
    "8,000 langkah",
    "Nasi ikut senduk bajet"
   ],
   "body_checkin": false,
   "food_audit": false,
   "recalculate_budget": false,
   "offer": {
    "type": "subscription",
    "text": "Program seterusnya sedang menunggu. Langgan untuk akses semua program."
   }
  },
  {
   "day": 42,
   "week": 6,
   "phase": "LEMAK HILANG, TABIAT KEKAL",
   "label": "Hari 42 · Lemak Hilang, Tabiat Kekal",
   "card": {
    "title": "Tahniah, 6 minggu selesai",
    "body": "Bandingkan diri anda hari ini dengan Hari 1: berat, pinggang, gambar dan tabiat. Setiap kilogram dan setiap sentimeter ialah hasil kerja anda sendiri."
   },
   "mission": "CHECK-IN AKHIR: timbang, ukur pinggang, ambil gambar. Lihat perbandingan dan kongsi kad hasil anda.",
   "workout": {
    "name": "Rehat Aktif & Regangan",
    "minutes": 10,
    "impact": "sangat rendah",
    "moves": [
     {
      "name": "Regangan peha depan & belakang",
      "reps": "30 saat setiap sisi"
     },
     {
      "name": "Regangan dada di pintu",
      "reps": "30 saat"
     },
     {
      "name": "Cat-cow",
      "reps": "10"
     },
     {
      "name": "Child's pose",
      "reps": "45 saat"
     }
    ],
    "rest": "-",
    "rounds": 1
   },
   "workout_optional": true,
   "checklist": [
    "Log makan hari ini",
    "Minum 2.5 L air",
    "8,000 langkah",
    "Nasi ikut senduk bajet"
   ],
   "body_checkin": true,
   "food_audit": false,
   "recalculate_budget": false,
   "offer": {
    "type": "subscription",
    "text": "Tahniah! Langgan HITFAT+ untuk cabaran baru setiap bulan."
   },
   "share_card": true
  }
 ],
 "nutrition": {
  "senduk_kcal": 130,
  "senduk_rule": [
   {
    "budget_max": 1499,
    "senduk_per_main_meal": 1
   },
   {
    "budget_max": 1899,
    "senduk_per_main_meal": 1.5
   },
   {
    "budget_max": 99999,
    "senduk_per_main_meal": 2
   }
  ],
  "meals_note": "Kalori lauk tidak termasuk nasi. Tambah nasi ikut senduk bajet. Semua nilai ialah ANGGARAN, semak sebelum lancar.",
  "meals": {
   "Sarapan": [
    {
     "name": "Nasi lemak separuh nasi + telur rebus + timun, teh-O kurang manis",
     "kcal_excl_rice": 380
    },
    {
     "name": "Roti gandum 2 keping + 2 telur hancur + kopi-O kosong",
     "kcal_excl_rice": 330
    },
    {
     "name": "Oat masak susu rendah lemak + pisang",
     "kcal_excl_rice": 360
    },
    {
     "name": "Capati 1 + kuah dal + telur rebus, teh-O kurang manis",
     "kcal_excl_rice": 310
    },
    {
     "name": "Bihun sup ayam",
     "kcal_excl_rice": 300
    }
   ],
   "Tengah hari": [
    {
     "name": "Nasi [senduk] + ayam bakar + sayur rebus + ulam + sambal sedikit",
     "kcal_excl_rice": 340
    },
    {
     "name": "Nasi [senduk] + ikan kukus / bakar + sayur campur + sup sayur",
     "kcal_excl_rice": 300
    },
    {
     "name": "Nasi [senduk] + gulai ikan kurang santan + ulam",
     "kcal_excl_rice": 330
    },
    {
     "name": "Nasi [senduk] + tauhu tempe (kurang minyak) + sayur + telur rebus",
     "kcal_excl_rice": 360
    },
    {
     "name": "Nasi campur ikut formula: 1 protein bukan goreng + 2 sayur + kuah sikit",
     "kcal_excl_rice": 380
    }
   ],
   "Snek": [
    {
     "name": "Buah epal / oren + segenggam kecil kacang",
     "kcal_excl_rice": 190
    },
    {
     "name": "2 telur rebus",
     "kcal_excl_rice": 140
    },
    {
     "name": "Yogurt + pisang kecil",
     "kcal_excl_rice": 180
    },
    {
     "name": "Roti gandum 1 keping + telur rebus",
     "kcal_excl_rice": 150
    },
    {
     "name": "Kurma 3 biji + susu rendah lemak",
     "kcal_excl_rice": 180
    }
   ],
   "Makan malam": [
    {
     "name": "Nasi [senduk] + sup ayam + sayur tumis sedikit minyak",
     "kcal_excl_rice": 320
    },
    {
     "name": "Nasi [senduk] + ikan bakar + ulam + air asam",
     "kcal_excl_rice": 280
    },
    {
     "name": "Nasi [senduk] + ayam masak kicap (kulit dibuang) + sayur rebus",
     "kcal_excl_rice": 350
    },
    {
     "name": "Nasi [senduk] + telur dadar 2 biji (sedikit minyak) + sayur",
     "kcal_excl_rice": 330
    },
    {
     "name": "Tomyam campur (tanpa santan) + nasi [senduk]",
     "kcal_excl_rice": 300
    }
   ]
  }
 },
 "food_audit_list": [
  {
   "name": "Nasi putih",
   "portion": "1 senduk (~100g)",
   "kcal": 130
  },
  {
   "name": "Nasi lemak bungkus biasa",
   "portion": "1 bungkus",
   "kcal": 400
  },
  {
   "name": "Nasi goreng kampung",
   "portion": "1 pinggan",
   "kcal": 600
  },
  {
   "name": "Nasi kerabu (dengan lauk)",
   "portion": "1 pinggan",
   "kcal": 500
  },
  {
   "name": "Nasi dagang (dengan gulai ikan)",
   "portion": "1 pinggan",
   "kcal": 550
  },
  {
   "name": "Mee goreng mamak",
   "portion": "1 pinggan",
   "kcal": 600
  },
  {
   "name": "Bihun sup",
   "portion": "1 mangkuk",
   "kcal": 300
  },
  {
   "name": "Laksa",
   "portion": "1 mangkuk",
   "kcal": 450
  },
  {
   "name": "Roti canai kosong",
   "portion": "1 keping",
   "kcal": 300
  },
  {
   "name": "Roti telur",
   "portion": "1 keping",
   "kcal": 350
  },
  {
   "name": "Capati",
   "portion": "1 keping",
   "kcal": 120
  },
  {
   "name": "Tosai kosong",
   "portion": "1 keping",
   "kcal": 170
  },
  {
   "name": "Kuah dal",
   "portion": "1 senduk kecil",
   "kcal": 80
  },
  {
   "name": "Kuah kari / santan",
   "portion": "1 senduk kecil",
   "kcal": 100
  },
  {
   "name": "Ayam goreng (peha)",
   "portion": "1 ketul",
   "kcal": 290
  },
  {
   "name": "Ayam bakar / panggang",
   "portion": "1 ketul",
   "kcal": 200
  },
  {
   "name": "Ikan goreng (kembung)",
   "portion": "1 ekor",
   "kcal": 220
  },
  {
   "name": "Ikan bakar / kukus",
   "portion": "1 ekor",
   "kcal": 160
  },
  {
   "name": "Telur goreng",
   "portion": "1 biji",
   "kcal": 100
  },
  {
   "name": "Telur rebus",
   "portion": "1 biji",
   "kcal": 70
  },
  {
   "name": "Tauhu / tempe goreng",
   "portion": "2 keping",
   "kcal": 180
  },
  {
   "name": "Sayur campur goreng",
   "portion": "1 senduk",
   "kcal": 90
  },
  {
   "name": "Sayur rebus / ulam",
   "portion": "1 hidang",
   "kcal": 30
  },
  {
   "name": "Sambal",
   "portion": "1 sudu besar",
   "kcal": 60
  },
  {
   "name": "Teh tarik",
   "portion": "1 gelas",
   "kcal": 150
  },
  {
   "name": "Kopi / Nescafe tarik",
   "portion": "1 gelas",
   "kcal": 140
  },
  {
   "name": "Milo ais",
   "portion": "1 gelas",
   "kcal": 200
  },
  {
   "name": "Air sirap / bandung",
   "portion": "1 gelas",
   "kcal": 150
  },
  {
   "name": "Teh-O / kopi-O kurang manis",
   "portion": "1 gelas",
   "kcal": 40
  },
  {
   "name": "Teh-O / kopi-O kosong",
   "portion": "1 gelas",
   "kcal": 5
  },
  {
   "name": "Air kosong",
   "portion": "1 gelas",
   "kcal": 0
  },
  {
   "name": "Karipap",
   "portion": "1 biji",
   "kcal": 130
  },
  {
   "name": "Pisang goreng",
   "portion": "1 keping",
   "kcal": 150
  },
  {
   "name": "Kuih muih (kuih lapis, seri muka)",
   "portion": "1 keping",
   "kcal": 150
  },
  {
   "name": "Biskut kering",
   "portion": "3 keping",
   "kcal": 120
  },
  {
   "name": "Buah epal / oren",
   "portion": "1 biji",
   "kcal": 70
  },
  {
   "name": "Pisang",
   "portion": "1 biji sederhana",
   "kcal": 100
  },
  {
   "name": "Tembikai",
   "portion": "1 hiris",
   "kcal": 50
  },
  {
   "name": "Kurma",
   "portion": "3 biji",
   "kcal": 70
  },
  {
   "name": "Kacang (badam / tanah)",
   "portion": "1 genggam (~30g)",
   "kcal": 170
  },
  {
   "name": "Susu rendah lemak",
   "portion": "250ml",
   "kcal": 110
  },
  {
   "name": "Yogurt biasa",
   "portion": "1 cawan kecil",
   "kcal": 100
  },
  {
   "name": "Roti gandum",
   "portion": "1 keping",
   "kcal": 80
  },
  {
   "name": "Oat",
   "portion": "1/2 cawan kering",
   "kcal": 150
  }
 ],
 "activity_mets": [
  {
   "name": "Jalan santai",
   "met": 2.8
  },
  {
   "name": "Jalan biasa",
   "met": 3.5
  },
  {
   "name": "Jalan pantas",
   "met": 4.3
  },
  {
   "name": "Naik tangga (perlahan)",
   "met": 4.0
  },
  {
   "name": "Joging perlahan",
   "met": 7.0
  },
  {
   "name": "Berbasikal santai",
   "met": 4.0
  },
  {
   "name": "Senaman kekuatan (berat badan)",
   "met": 3.8
  },
  {
   "name": "Aerobik impak rendah",
   "met": 5.0
  },
  {
   "name": "Kerja rumah (sapu, mop)",
   "met": 3.3
  },
  {
   "name": "Main dengan anak (aktif)",
   "met": 4.0
  },
  {
   "name": "Berkebun",
   "met": 3.8
  },
  {
   "name": "Badminton santai",
   "met": 5.5
  },
  {
   "name": "Berenang santai",
   "met": 6.0
  },
  {
   "name": "Futsal / bola sepak santai",
   "met": 7.0
  },
  {
   "name": "Regangan / yoga ringan",
   "met": 2.5
  }
 ],
 "budget_calc": {
  "bmr": "Mifflin-St Jeor",
  "activity_factors": {
   "tidak aktif": 1.2,
   "ringan": 1.375,
   "sederhana": 1.55,
   "aktif": 1.725,
   "sangat aktif": 1.9
  },
  "rate": "0.5-1% berat badan seminggu, maksimum ~1kg seminggu",
  "floor_kcal": {
   "wanita": 1200,
   "lelaki": 1500
  },
  "recalculate_on_days": [
   8,
   15,
   22,
   29,
   36
  ]
 }
};
