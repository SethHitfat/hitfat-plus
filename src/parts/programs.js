var PROGRAMS = [
  // ═══ EQUIPMENT: KETTLEBELL ═══
  {
    id:'kb1', name:'Kettlebell Blast', goal:'Fat Loss', level:'Intermediate', dur:20, rounds:3,
    c1:'#2a2118', c2:'#0d0a06', ac:'#FF8A1E', icon:'🔔',
    desc:'A full-body kettlebell circuit that builds power and torches fat. Grab one bell and go.',
    ex:['Kettlebell Swing','Kettlebell Goblet Squat','Kettlebell Clean','Kettlebell Reverse Lunges','Kettlebell Russian Twist','Burpees']
  },
  {
    id:'kb2', name:'KB Power Strength', goal:'Strength', level:'Advanced', dur:25, rounds:4,
    c1:'#2a2118', c2:'#0d0a06', ac:'#FF8A1E', icon:'💪',
    desc:'Heavy kettlebell strength work. Build full-body power with swings, cleans and presses.',
    ex:['Kettlebell Deadlift','Kettlebell Thruster','Kettlebell Bend Over Row','Kettlebell Shoulder Press','Kettlebell Swing To Squat','Kettlebell Halo']
  },
  {
    id:'kb3', name:'KB Core & Carry', goal:'Core', level:'Intermediate', dur:15, rounds:3,
    c1:'#2a2118', c2:'#0d0a06', ac:'#FF8A1E', icon:'🎯',
    desc:'Kettlebell core circuit to carve a rock-solid midsection and grip strength.',
    ex:['Kettlebell Russian Twist','Farmer Carry','Kettlebell Sit Up Russian Twist','Kettlebell Crunches','Plank','Kettlebell Toe Taps']
  },
  // ═══ EQUIPMENT: DUMBBELL ═══
  {
    id:'db1', name:'Dumbbell Strength', goal:'Strength', level:'Intermediate', dur:25, rounds:3,
    c1:'#16273a', c2:'#080b0d', ac:'#2EA8FF', icon:'🏋️',
    desc:'Build lean muscle head to toe with this complete dumbbell strength session.',
    ex:['Normal Squat','Deadlift','Chest Press','Bicep Curl','ALT Shoulder Press','Clean Press']
  },
  {
    id:'db2', name:'Dumbbell Arms & Shoulders', goal:'Strength', level:'Beginner', dur:18, rounds:3,
    c1:'#16273a', c2:'#080b0d', ac:'#2EA8FF', icon:'💪',
    desc:'Sculpt your arms and shoulders. Curls, presses and raises for definition.',
    ex:['Bicep Curl','Hammer Curl','Shoulder Front Raises','Shoulder Fly','Tricep Kick Back','Shrug']
  },
  {
    id:'db3', name:'Dumbbell Leg Day', goal:'Strength', level:'Intermediate', dur:22, rounds:4,
    c1:'#16273a', c2:'#080b0d', ac:'#2EA8FF', icon:'🦵',
    desc:'Loaded leg session. Squats, lunges and deadlifts to build powerful legs.',
    ex:['Wide Squat','ALT Lunges','RDL','Squat Thruster','Side Lunges','Calf Raises']
  },
  // ═══ EQUIPMENT: BOTTLE ═══
  {
    id:'bt1', name:'Bottle Burn', goal:'Fat Loss', level:'Beginner', dur:15, rounds:3,
    c1:'#16302a', c2:'#06100d', ac:'#1FD67A', icon:'💧',
    desc:'No weights? Grab two water bottles. Full-body toning you can do anywhere.',
    ex:['Bottle Shoulder Press','Bottle Bicep Curl','Bottle Front Raises','Bottle Russian Twist','Bottle Hip Thrust','Bottle Forward Punch']
  },
  {
    id:'bt2', name:'Bottle Core Shred', goal:'Core', level:'Beginner', dur:12, rounds:3,
    c1:'#16302a', c2:'#06100d', ac:'#1FD67A', icon:'🔥',
    desc:'Light bottle weight, heavy core burn. Tighten your abs with this quick circuit.',
    ex:['Bottle Crunches','Bottle Bicycle','Bottle V In Crunches','Bottle Flutter Kick','Bottle Plank Taps','Bottle Sit Up Russian Twist']
  },
  // ═══ EQUIPMENT: CHAIR ═══
  {
    id:'ch1', name:'Chair Workout', goal:'Strength', level:'Beginner', dur:18, rounds:3,
    c1:'#2a1830', c2:'#0d0610', ac:'#C16BFF', icon:'🪑',
    desc:'All you need is a chair. Great for beginners, seniors, or low-impact training days.',
    ex:['Chair Squat','Tricep Dip','Step Up Knee Drive','Incline Push Up','Chair Glute Bridge','Sit To Stand']
  },
  {
    id:'ch2', name:'Chair Core & Cardio', goal:'Fat Loss', level:'Beginner', dur:15, rounds:3,
    c1:'#2a1830', c2:'#0d0610', ac:'#C16BFF', icon:'⚡',
    desc:'Low-impact chair cardio and core. Get your heart rate up without jumping.',
    ex:['Seated High Knee','Chair Russian Twist','Seated Jack','Chair Flutter Kick','High Knee Tap Chair','Chair Half Burpee']
  },
  // ═══ EQUIPMENT: TOWEL ═══
  {
    id:'tw1', name:'Towel Sculpt', goal:'Strength', level:'Intermediate', dur:18, rounds:3,
    c1:'#1a2a30', c2:'#06100d', ac:'#33C9D6', icon:'🧖',
    desc:'A simple towel adds resistance and slide. Tone your whole body with one cloth.',
    ex:['Towel Squat Press','Towel Upright Row','Towel Shoulder Press','Towel Bicep Curl','Towel Deadlift','Towel Reverse Lunges Press']
  },
  {
    id:'tw2', name:'Towel Core Slide', goal:'Core', level:'Intermediate', dur:14, rounds:3,
    c1:'#1a2a30', c2:'#06100d', ac:'#33C9D6', icon:'🎯',
    desc:'Use a towel on smooth floor for sliding core moves that fire up your abs.',
    ex:['Towel Knee Tuck','Towel Hollow Hold','Towel Russian Twist','Towel Mountain Climber','Towel V Sit','Towel Plank Hold']
  },

  {
    id:'p1', name:'Fat Burn Express', goal:'Fat Loss', level:'Beginner', dur:15,
    c1:'#3a1f1f', c2:'#0d0808', ac:'#FF3B30', icon:'🔥',
    desc:'Quick high-energy session to torch calories. Perfect for busy days when you still want to sweat.',
    ex:['Jumping Jack','Bodyweight Squat','High Knee','Push Up','Mountain Climber','Burpee']
  },
  {
    id:'p5', name:'Quick Sweat', goal:'Fat Loss', level:'Beginner', dur:10,
    c1:'#3a2a18', c2:'#0d0a06', ac:'#FF6B00', icon:'💦',
    desc:'Only got 10 minutes? This fast-paced cardio blast keeps your heart rate up and the calories burning.',
    ex:['Jumping Jack','High Knee','Mountain Climber','Burpee','Fast Feet']
  },
  {
    id:'p10', name:'Full Body Burn', goal:'Fat Loss', level:'Intermediate', dur:28,
    c1:'#3a1f1f', c2:'#0d0808', ac:'#FF3B30', icon:'⚡',
    desc:'Hit every muscle group in one session. Strength meets cardio for maximum burn.',
    ex:['Burpee','Bodyweight Squat','Push Up','Walking Lunges','Mountain Climber','Squat Jump','Plank','Jumping Jack']
  },
  {
    id:'p11', name:'Cardio Inferno', goal:'Fat Loss', level:'Advanced', dur:25,
    c1:'#3a2a18', c2:'#0d0a06', ac:'#FF6B00', icon:'🌋',
    desc:'Non-stop high-intensity intervals. No rest, all heart. Built to melt fat fast.',
    ex:['Burpee','Tuck Jump','High Knee','Skater Jump','Mountain Climber','Half Burpee','Fast Feet','Plank Jack']
  },
  {
    id:'p12', name:'Sweat & Sculpt', goal:'Fat Loss', level:'Intermediate', dur:22,
    c1:'#3a1f2d', c2:'#0d080b', ac:'#FF2D78', icon:'🔥',
    desc:'Combine fat-burning cardio with toning moves for a lean, defined physique.',
    ex:['Jumping Jack','Squat Jump','Push Up','Lunges Jump','Bicycle Crunch','Burpee','Mountain Climber']
  },
  {
    id:'p13', name:'Morning Kickstart', goal:'Fat Loss', level:'Beginner', dur:12,
    c1:'#3a2a18', c2:'#0d0a06', ac:'#FF6B00', icon:'☀️',
    desc:'Wake up your body with this energizing flow. The perfect way to start your day strong.',
    ex:['Jumping Jack','High Knee','Bodyweight Squat','Butt Kick','Mountain Climber']
  },
  {
    id:'p4', name:'Lower Body Power', goal:'Strength', level:'Intermediate', dur:25,
    c1:'#2a1f3a', c2:'#0b080d', ac:'#A855F7', icon:'🦵',
    desc:'Sculpt and strengthen legs and glutes. Squats, lunges and hip work for serious lower body gains.',
    ex:['Bodyweight Squat','Walking Lunges','Hip Thrust','Bulgarian Split Squat','Calf Raises','Squat Pulse','Side Lunges']
  },
  {
    id:'p6', name:'Upper Body Builder', goal:'Strength', level:'Intermediate', dur:22,
    c1:'#3a1f1f', c2:'#0d0808', ac:'#FF3B30', icon:'💪',
    desc:'Push, press and dip your way to a stronger chest, shoulders and arms. No weights needed.',
    ex:['Push Up','Wide Push Up','Diamond Push Up','Tricep Dip Chair','Bottle Shoulder Press','Bottle Bicep Curl','Decline Push Up']
  },
  {
    id:'p14', name:'Leg Day', goal:'Strength', level:'Advanced', dur:30,
    c1:'#2a1f3a', c2:'#0b080d', ac:'#A855F7', icon:'🦿',
    desc:'The ultimate leg destroyer. Build powerful quads, hamstrings and glutes.',
    ex:['Bodyweight Squat','Bulgarian Split Squat','Walking Lunges','Squat Jump','Backpack Squat','Single Leg Glutes Bridge','Wall Sit','Calf Raises']
  },
  {
    id:'p15', name:'Push Power', goal:'Strength', level:'Intermediate', dur:20,
    c1:'#3a1f1f', c2:'#0d0808', ac:'#FF3B30', icon:'🤜',
    desc:'All pressing movements. Sculpt your chest, shoulders and triceps to perfection.',
    ex:['Push Up','Wide Push Up','Diamond Push Up','Decline Push Up','Bottle Shoulder Press','Tricep Dip Chair','Push Up Hold']
  },
  {
    id:'p16', name:'Pull & Posture', goal:'Strength', level:'Intermediate', dur:20,
    c1:'#16273a', c2:'#080b0d', ac:'#00B8FF', icon:'🎯',
    desc:'Strengthen your back and improve posture with rows and hinge patterns.',
    ex:['Bottle Bent Over Row','Backpack Deadlift','Backpack Good Morning','Bird Dog','Backpack Good Morning','Plank']
  },
  {
    id:'p17', name:'Glute Focus', goal:'Strength', level:'Beginner', dur:18,
    c1:'#3a1f2d', c2:'#0d080b', ac:'#FF2D78', icon:'🍑',
    desc:'Target and grow your glutes with focused hip and bridge work.',
    ex:['Hip Thrust','Single Leg Glutes Bridge','Curtsy Lunges','Side Lunges','Backpack Squat','Step Up Box or Chair']
  },
  {
    id:'p18', name:'Arms & Shoulders', goal:'Strength', level:'Beginner', dur:16,
    c1:'#3a2a18', c2:'#0d0a06', ac:'#FF6B00', icon:'💪',
    desc:'Build defined arms and capped shoulders with bottle and bodyweight work.',
    ex:['Bottle Bicep Curl','Bottle Lateral Raises','Bottle Shoulder Press','Bottle Front Raises','Tricep Dip Chair','Diamond Push Up']
  },
  {
    id:'p19', name:'Full Body Strength', goal:'Strength', level:'Advanced', dur:35,
    c1:'#3a1f1f', c2:'#0d0808', ac:'#FF3B30', icon:'🏋️',
    desc:'Total-body strength session hitting every major muscle group with compound moves.',
    ex:['Backpack Squat','Push Up','Backpack Deadlift','Walking Lunges','Bottle Shoulder Press','Bottle Bent Over Row','Bulgarian Split Squat','Plank']
  },
  {
    id:'p20', name:'Calisthenics Base', goal:'Strength', level:'Intermediate', dur:24,
    c1:'#16273a', c2:'#080b0d', ac:'#00B8FF', icon:'🤸',
    desc:'Master your bodyweight with foundational calisthenics movements.',
    ex:['Push Up','Bodyweight Squat','Walking Lunges','Plank','Explosive Push Up','Assisted Single Leg Pistol Squat','Bear Walk']
  },
  {
    id:'p2', name:'Core Crusher', goal:'Core', level:'Intermediate', dur:20,
    c1:'#16302d', c2:'#080d0c', ac:'#00D9C0', icon:'💎',
    desc:'Build a rock-solid core with planks, crunches and rotational work. Strong center, strong everything.',
    ex:['Plank','Crunch','Bicycle Crunch','Russian Twist','Leg Raises','Dead Bug','Side Plank','Hollow Hold']
  },
  {
    id:'p7', name:'Ab Shred', goal:'Core', level:'Beginner', dur:12,
    c1:'#16273a', c2:'#080b0d', ac:'#00B8FF', icon:'🔥',
    desc:'A focused core finisher. Carve out your abs with this quick but brutal sequence.',
    ex:['Crunch','Bicycle Crunch','Leg Raises','Plank','Russian Twist']
  },
  {
    id:'p9', name:'Core Stability', goal:'Core', level:'Intermediate', dur:18,
    c1:'#1a3322', c2:'#080d0a', ac:'#1FD655', icon:'🧘',
    desc:'Build deep core control and balance with holds and anti-rotation work.',
    ex:['Plank','Side Plank','Dead Bug','Bird Dog','Hollow Hold','Plank Shoulder Taps']
  },
  {
    id:'p21', name:'Six Pack Sprint', goal:'Core', level:'Advanced', dur:15,
    c1:'#16302d', c2:'#080d0c', ac:'#00D9C0', icon:'⚡',
    desc:'High-intensity ab circuit. Fast, focused and ruthless on the midsection.',
    ex:['Bicycle Crunch','Hollow Hold','Leg Raises','Flutter Kick','V Sit Squat','Mountain Climber','Plank']
  },
  {
    id:'p22', name:'Obliques & Twist', goal:'Core', level:'Intermediate', dur:14,
    c1:'#2a1f3a', c2:'#0b080d', ac:'#A855F7', icon:'🌀',
    desc:'Carve your side abs with rotational and lateral core work.',
    ex:['Russian Twist','Side Plank','Bicycle Crunch','Plank Shoulder Taps','Mountain Climber']
  },
  {
    id:'p23', name:'Core Foundations', goal:'Core', level:'Beginner', dur:10,
    c1:'#1a3322', c2:'#080d0a', ac:'#1FD655', icon:'🌱',
    desc:'New to core training? Start here. Simple, effective moves to build your base.',
    ex:['Crunch','Dead Bug','Bird Dog','Plank','Reverse Crunch']
  },
  {
    id:'p24', name:'HIIT Blast', goal:'Fat Loss', level:'Advanced', dur:20,
    c1:'#3a1f1f', c2:'#0d0808', ac:'#FF3B30', icon:'💥',
    desc:'20 minutes of explosive intervals. Maximum effort, maximum results.',
    ex:['Burpee','Squat Jump','Tuck Jump','High Knee','Skater Jump','Mountain Climber','Half Burpee']
  },
  {
    id:'p25', name:'Plyo Power', goal:'Strength', level:'Advanced', dur:22,
    c1:'#3a2a18', c2:'#0d0a06', ac:'#FF6B00', icon:'🚀',
    desc:'Explosive jump training to build athletic power and speed.',
    ex:['Squat Jump','Broad Jump','Tuck Jump','Lunges Jump','Lateral Hop','Power Skip','Skater Jump']
  },
  {
    id:'p26', name:'Endurance Engine', goal:'Fat Loss', level:'Intermediate', dur:30,
    c1:'#16273a', c2:'#080b0d', ac:'#00B8FF', icon:'🫀',
    desc:'Build your cardio base with steady, sustained conditioning work.',
    ex:['Jumping Jack','High Knee','Butt Kick','Fast Feet','Sprint On Spot','Mountain Climber','Plank Jack']
  },
  {
    id:'p27', name:'Quick Cardio', goal:'Fat Loss', level:'Beginner', dur:8,
    c1:'#3a2a18', c2:'#0d0a06', ac:'#FF6B00', icon:'⏱️',
    desc:'No time? No problem. 8 minutes of pure cardio to get the blood pumping.',
    ex:['Jumping Jack','High Knee','Butt Kick','Fast Feet']
  },
  {
    id:'p28', name:'Total Body Express', goal:'Strength', level:'Beginner', dur:15,
    c1:'#16302d', c2:'#080d0c', ac:'#00D9C0', icon:'🎯',
    desc:'A balanced full-body session that fits into any schedule.',
    ex:['Bodyweight Squat','Push Up','Walking Lunges','Plank','Jumping Jack','Crunch']
  },
  {
    id:'p29', name:'Athlete Circuit', goal:'Strength', level:'Advanced', dur:32,
    c1:'#3a1f1f', c2:'#0d0808', ac:'#FF3B30', icon:'🏆',
    desc:'Train like an athlete. Power, strength and conditioning in one demanding circuit.',
    ex:['Squat Jump','Push Up','Broad Jump','Burpee','Bulgarian Split Squat','Bear Walk','Plank','Mountain Climber','Tuck Jump']
  },
  {
    id:'p30', name:'Home Hero', goal:'Strength', level:'Beginner', dur:18,
    c1:'#1a3322', c2:'#080d0a', ac:'#1FD655', icon:'🏠',
    desc:'No equipment, no problem. A complete home workout using just your bodyweight.',
    ex:['Bodyweight Squat','Knee Push Ups','Walking Lunges','Plank','Single Leg Glutes Bridge','Crunch']
  },
  {
    id:'p31', name:'Beginner Foundations', goal:'Strength', level:'Beginner', dur:14,
    c1:'#16273a', c2:'#080b0d', ac:'#00B8FF', icon:'🌱',
    desc:'New to working out? This gentle full-body intro builds confidence and form.',
    ex:['Chair Squat','Wall Push Up','Incline Push Up (Chair)','Bird Dog','Dead Bug','Calf Raises']
  },
  {
    id:'p32', name:'Weekend Warrior', goal:'Fat Loss', level:'Intermediate', dur:26,
    c1:'#2a1f3a', c2:'#0b080d', ac:'#A855F7', icon:'⚔️',
    desc:'Make your weekend count with this challenging full-body burner.',
    ex:['Burpee','Backpack Squat','Push Up','Walking Lunges','Mountain Climber','Squat Jump','Russian Twist','Plank']
  },
  {
    id:'p33', name:'Loaded Lower', goal:'Strength', level:'Intermediate', dur:24,
    c1:'#2a1f3a', c2:'#0b080d', ac:'#A855F7', icon:'🎒',
    desc:'Add load with a backpack for serious lower body strength gains.',
    ex:['Backpack Squat','Backpack Lunges','Backpack Deadlift','Backpack Good Morning','Single Leg Glutes Bridge','Calf Raises']
  },
  {
    id:'p34', name:'Bottle Pump', goal:'Strength', level:'Beginner', dur:16,
    c1:'#3a2a18', c2:'#0d0a06', ac:'#FF6B00', icon:'🍶',
    desc:'Grab two bottles and pump up your arms and shoulders at home.',
    ex:['Bottle Bicep Curl','Bottle Shoulder Press','Bottle Lateral Raises','Bottle Front Raises','Bottle Bent Over Row']
  }
];
// Merge multi-day programs at the front so they feature prominently
PROGRAMS = PROGRAMS_MULTI.concat(PROGRAMS);


/* ═══════════════ RECOVERY · prehab library ═══════════════
