var PROGRAMS_MULTI = [
  // ═══ KETTLEBELL 7-DAY ═══
  {
    id:'mkb', name:'7 Day Kettlebell', goal:'Strength', level:'Intermediate', dur:22, rounds:3,
    c1:'#2a2118', c2:'#0d0a06', ac:'#FF8A1E', icon:'🔔',
    desc:'One week of kettlebell training to build full-body power and burn fat. One bell, big results.',
    ex:['Kettlebell Swing','Kettlebell Goblet Squat','Kettlebell Clean','Kettlebell Russian Twist'],
    weeks:[
      {days:[
        {name:'Full Body Power', ex:['Kettlebell Swing','Kettlebell Goblet Squat','Kettlebell Clean','Kettlebell Bend Over Row','Burpees']},
        {name:'Legs & Glutes', ex:['Kettlebell Deadlift','Kettlebell Reverse Lunges','Kettlebell Squat Pulse','Kettlebell Swing To Squat','Kettlebell Squat Calf Raises']},
        {rest:true},
        {name:'Upper & Core', ex:['Kettlebell Shoulder Press','Kettlebell Thruster','Kettlebell Halo','Kettlebell Russian Twist','Push Up']},
        {name:'Conditioning', ex:['Kettlebell Half Burpee','Kettlebell Swing Side Step','Mountain Climber','High Knee','Skater Jump']},
        {name:'Full Body Finisher', ex:['Kettlebell Swing','Kettlebell Clean','Kettlebell Goblet Squat','Kettlebell Sit Up Press','Burpees']},
        {rest:true}
      ]}
    ]
  },
  // ═══ DUMBBELL 2-WEEK ═══
  {
    id:'mdb', name:'14 Day Dumbbell', goal:'Strength', level:'Intermediate', dur:25, rounds:3,
    c1:'#16273a', c2:'#080b0d', ac:'#2EA8FF', icon:'🏋️',
    desc:'Two weeks of structured dumbbell training. Build lean muscle with a push/pull/legs split.',
    ex:['Normal Squat','Chest Press','Deadlift','Bicep Curl'],
    weeks:[
      {days:[
        {name:'Push Day', ex:['Chest Press','ALT Shoulder Press','Chest Fly','Tricep Kick Back','Tricep Dips']},
        {name:'Pull Day', ex:['Upright Row','Bicep Curl','Hammer Curl','Reverse Curl','Shrug']},
        {rest:true},
        {name:'Leg Day', ex:['Normal Squat','RDL','ALT Lunges','Squat Thruster','Calf Raises']},
        {name:'Full Body', ex:['Squat Clean','Clean Press','Deadlift','Snatch','Squat Bicep Curl']},
        {name:'Core & Arms', ex:['Russian Twist','V In Crunches','Bicep Curl','Tricep Pulse','L Sit Crunch']},
        {rest:true}
      ]},
      {days:[
        {name:'Push Power', ex:['ALT Shoulder Press','Jerk Press','Chest Fly','Single Tricep Kick Back','Triceps Dips Hold']},
        {name:'Pull Strength', ex:['Upright Row','Close Bicep Curl','Hammer Curl','Rotation Bicep','Shrug']},
        {rest:true},
        {name:'Leg Burn', ex:['Wide Squat','SLDL','Lunges Pulse','Army Squat','Side Lunges']},
        {name:'Full Body Power', ex:['Squat Clean','Snatch','Clean Press','Squat Thruster','Deadlift']},
        {name:'Core Finisher', ex:['Sit Up Russian Twist','V In Crunches','Russian Twist','L Sit Crunch','Leg Raises']},
        {rest:true}
      ]}
    ]
  },
  // ═══ CHAIR 5-DAY (low impact) ═══
  {
    id:'mch', name:'5 Day Chair', goal:'Fat Loss', level:'Beginner', dur:16, rounds:2,
    c1:'#2a1830', c2:'#0d0610', ac:'#C16BFF', icon:'🪑',
    desc:'Five days of low-impact chair workouts. Perfect for beginners, seniors, or joint-friendly training.',
    ex:['Chair Squat','Tricep Dip','Sit To Stand','Chair Russian Twist'],
    weeks:[
      {days:[
        {name:'Lower Body', ex:['Chair Squat','Sit To Stand','Step Up Knee Drive','Chair Calf Raises','Chair Glute Bridge']},
        {name:'Upper Body', ex:['Incline Push Up','Chair Push Up','Tricep Dip','Incline Wide Push Up','Tricep Dip Hold']},
        {name:'Core Seated', ex:['Seated Twist','Chair Russian Twist','Seated Bicycle','Chair Flutter Kick','V Sit Hold']},
        {name:'Cardio Low Impact', ex:['Seated High Knee','Seated Jack','High Knee Tap Chair','Chair Half Burpee','Fast Seated High Knee']},
        {name:'Full Body', ex:['Chair Squat','Tricep Dip','Step Up Knee Drive','Chair Russian Twist','Lateral Step Over']},
        {rest:true},
        {rest:true}
      ]}
    ]
  },

  {
    id:'m1', name:'21 Day Home', goal:'Fat Loss', level:'Beginner', dur:20,
    c1:'#3a2a18', c2:'#0d0a06', ac:'#FF6B00', icon:'🏠',
    desc:'Three weeks to transform at home. No equipment needed. Follow day by day and build the habit that sticks.',
    ex:['Bodyweight Squat','Push Up','Walking Lunges','Plank','Jumping Jack','Crunch'],
    weeks:[
      {days:[
        {name:'Full Body Start', ex:['Jumping Jack','Bodyweight Squat','Knee Push Ups','Walking Lunges','Plank']},
        {name:'Cardio Burn', ex:['High Knee','Butt Kick','Mountain Climber','Jumping Jack','Fast Feet']},
        {rest:true},
        {name:'Lower Body', ex:['Bodyweight Squat','Reverse Lunges','Hip Thrust','Calf Raises','Wall Sit']},
        {name:'Core Focus', ex:['Crunch','Plank','Bicycle Crunch','Leg Raises','Dead Bug']},
        {name:'Full Body', ex:['Burpee','Push Up','Bodyweight Squat','Mountain Climber','Plank']},
        {rest:true}
      ]},
      {days:[
        {name:'Upper Body', ex:['Push Up','Wide Push Up','Tricep Dip Chair','Diamond Push Up','Plank Shoulder Taps']},
        {name:'HIIT Cardio', ex:['Squat Jump','High Knee','Skater Jump','Burpee','Fast Feet']},
        {rest:true},
        {name:'Legs & Glutes', ex:['Bulgarian Split Squat','Curtsy Lunges','Single Leg Glutes Bridge','Squat Pulse','Calf Raises']},
        {name:'Core Crusher', ex:['Russian Twist','Hollow Hold','Leg Raises','Side Plank','Bicycle Crunch']},
        {name:'Full Body Sweat', ex:['Burpee','Lunges Jump','Push Up','Mountain Climber','Plank Jack']},
        {rest:true}
      ]},
      {days:[
        {name:'Power Upper', ex:['Explosive Push Up','Push Up','Decline Push Up','Tricep Dip Chair','Bottle Shoulder Press']},
        {name:'Cardio Inferno', ex:['Tuck Jump','Burpee','High Knee','Skater Jump','Half Burpee']},
        {rest:true},
        {name:'Leg Destroyer', ex:['Squat Jump','Bulgarian Split Squat','Walking Lunges','Wall Sit','Calf Raises']},
        {name:'Abs Finisher', ex:['Bicycle Crunch','V Sit Squat','Hollow Hold','Flutter Kick','Plank']},
        {name:'Final Push', ex:['Burpee','Squat Jump','Push Up','Mountain Climber','Bear Walk','Plank']},
        {rest:true}
      ]}
    ]
  },
  {
    id:'m2', name:'8 Week Beginner Training', goal:'Strength', level:'Beginner', dur:25,
    c1:'#16273a', c2:'#080b0d', ac:'#00B8FF', icon:'🎓',
    desc:'A complete 8-week foundation program. Build strength, learn the movements, and progress safely week by week.',
    ex:['Bodyweight Squat','Push Up','Walking Lunges','Plank'],
    weeks:[
      {days:[
        {name:'Lower Body Intro', ex:['Chair Squat','Bodyweight Squat','Reverse Lunges','Calf Raises']},
        {rest:true},
        {name:'Upper Body Intro', ex:['Wall Push Up','Incline Push Up (Chair)','Knee Push Ups','Tricep Dip Chair']},
        {rest:true},
        {name:'Core Intro', ex:['Crunch','Dead Bug','Bird Dog','Plank']},
        {rest:true},
        {rest:true}
      ]},
      {days:[
        {name:'Lower Body', ex:['Bodyweight Squat','Walking Lunges','Hip Thrust','Calf Raises']},
        {rest:true},
        {name:'Upper Body', ex:['Knee Push Ups','Push Up','Tricep Dip Chair','Bottle Shoulder Press']},
        {rest:true},
        {name:'Core', ex:['Crunch','Bicycle Crunch','Plank','Leg Raises']},
        {rest:true},
        {rest:true}
      ]},
      {days:[
        {name:'Legs', ex:['Bodyweight Squat','Bulgarian Split Squat','Reverse Lunges','Squat Pulse','Calf Raises']},
        {rest:true},
        {name:'Push', ex:['Push Up','Wide Push Up','Diamond Push Up','Tricep Dip Chair']},
        {rest:true},
        {name:'Core + Cardio', ex:['Mountain Climber','Bicycle Crunch','Plank','Jumping Jack']},
        {rest:true},
        {rest:true}
      ]},
      {days:[
        {name:'Lower Power', ex:['Squat Jump','Walking Lunges','Hip Thrust','Wall Sit','Calf Raises']},
        {rest:true},
        {name:'Upper Strength', ex:['Push Up','Decline Push Up','Bottle Shoulder Press','Bottle Bent Over Row']},
        {rest:true},
        {name:'Core Strong', ex:['Hollow Hold','Russian Twist','Side Plank','Leg Raises']},
        {rest:true},
        {rest:true}
      ]},
      {days:[
        {name:'Legs Volume', ex:['Bodyweight Squat','Bulgarian Split Squat','Curtsy Lunges','Squat Pulse','Single Leg Calf Raises']},
        {rest:true},
        {name:'Push Volume', ex:['Push Up','Wide Push Up','Diamond Push Up','Decline Push Up','Tricep Dip Chair']},
        {rest:true},
        {name:'Core Volume', ex:['Bicycle Crunch','V Sit Squat','Hollow Hold','Plank','Flutter Kick']},
        {rest:true},
        {rest:true}
      ]},
      {days:[
        {name:'Lower Strength', ex:['Backpack Squat','Bulgarian Split Squat','Backpack Lunges','Squat Jump','Calf Raises']},
        {rest:true},
        {name:'Upper Strength', ex:['Explosive Push Up','Push Up','Bottle Shoulder Press','Bottle Bent Over Row','Tricep Dip Chair']},
        {rest:true},
        {name:'Core Power', ex:['Hollow Hold','Bicycle Crunch','Side Plank','Leg Raises','Plank Shoulder Taps']},
        {rest:true},
        {rest:true}
      ]},
      {days:[
        {name:'Full Lower', ex:['Squat Jump','Backpack Squat','Walking Lunges','Hip Thrust','Wall Sit','Calf Raises']},
        {rest:true},
        {name:'Full Upper', ex:['Push Up','Decline Push Up','Diamond Push Up','Bottle Shoulder Press','Bottle Bicep Curl']},
        {rest:true},
        {name:'Full Core', ex:['Bicycle Crunch','Hollow Hold','Russian Twist','V Sit Squat','Plank']},
        {rest:true},
        {rest:true}
      ]},
      {days:[
        {name:'Peak Lower', ex:['Squat Jump','Bulgarian Split Squat','Broad Jump','Backpack Squat','Calf Raises']},
        {rest:true},
        {name:'Peak Upper', ex:['Explosive Push Up','Push Up Clap','Decline Push Up','Bottle Shoulder Press','Tricep Dip Chair']},
        {rest:true},
        {name:'Peak Core', ex:['Hollow Hold','V Sit Squat','Bicycle Crunch','Side Plank','Flutter Kick']},
        {name:'Final Test', ex:['Burpee','Squat Jump','Push Up','Walking Lunges','Plank','Mountain Climber']},
        {rest:true}
      ]}
    ]
  },
  {
    id:'m3', name:'22 Minutes Hardcore', goal:'Fat Loss', level:'Advanced', dur:22,
    c1:'#3a1f1f', c2:'#0d0808', ac:'#FF3B30', icon:'🔥',
    desc:'22 minutes of intense training every single day for 4 weeks. No excuses, no rest weeks. Show up daily and transform.',
    ex:['Burpee','Squat Jump','Push Up','Mountain Climber'],
    weeks:(function(){
      var W=[];
      var dayTemplates=[
        {name:'HIIT Full Body', ex:['Burpee','Squat Jump','Push Up','Mountain Climber','High Knee','Plank']},
        {name:'Lower Power', ex:['Squat Jump','Lunges Jump','Broad Jump','Wall Sit','Calf Raises','Bear Walk']},
        {name:'Upper Burn', ex:['Push Up','Explosive Push Up','Diamond Push Up','Tricep Dip Chair','Plank Shoulder Taps','Push Up Hold']},
        {name:'Core Inferno', ex:['Bicycle Crunch','Hollow Hold','V Sit Squat','Russian Twist','Leg Raises','Plank']},
        {name:'Cardio Blast', ex:['Tuck Jump','Skater Jump','High Knee','Burpee','Fast Feet','Half Burpee']},
        {name:'Full Body Finisher', ex:['Burpee','Squat Jump','Push Up','Walking Lunges','Mountain Climber','Bear Walk']},
        {name:'Active Recovery', ex:['Bird Dog','Dead Bug','Plank','Hollow Hold','Bodyweight Squat']}
      ];
      for(var w=0;w<4;w++){
        W.push({days:dayTemplates.map(function(d){return {name:d.name, ex:d.ex.slice()};})});
      }
      return W;
    })()
  },
  {
    id:'m4', name:'Lazy Workout', goal:'Fat Loss', level:'Beginner', dur:8,
    c1:'#16302d', c2:'#080d0c', ac:'#00D9C0', icon:'😴',
    desc:'For the days you really can\'t be bothered. Just 8 minutes, mostly on the floor. Something is always better than nothing.',
    ex:['Single Leg Glutes Bridge','Dead Bug','Bird Dog','Crunch'],
    weeks:[
      {days:[
        {name:'Easy Floor', ex:['Single Leg Glutes Bridge','Dead Bug','Crunch','Bird Dog']},
        {name:'Gentle Move', ex:['Bodyweight Squat','Chair Squat','Wall Push Up','Plank']},
        {rest:true},
        {name:'Stretch & Core', ex:['Bird Dog','Dead Bug','Side Plank','Crunch']},
        {name:'Easy Cardio', ex:['Jumping Jack','High Knee','Butt Kick','Bodyweight Squat']},
        {rest:true},
        {rest:true}
      ]}
    ]
  }
];


