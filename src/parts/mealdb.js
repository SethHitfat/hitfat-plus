/* ═══════════════ MALAYSIAN MEAL DATABASE ═══════════════
   Seth's own set, written in English. Dishes that have a real English name use
   it ("white rice", "grilled chicken"); the ones that do not are left alone —
   nasi lemak, tomyam, laksa, sambal, tempe and ulam are the names of the food,
   not descriptions of it, and translating them would make the app worse.
   Portions use hand units (fist, palm, handful) because a kitchen scale is the
   first thing people stop using.                                              */
const MDB={
breakfast:[
 {name:"Oats + banana + milk",tags:["budget","hiprotein"],items:[{food:"Oats (cooked)",portion:"1/2 cup / 40g",kcal:148},{food:"Banana",portion:"1 medium",kcal:89},{food:"Low-fat milk",portion:"1 glass / 250ml",kcal:102}]},
 {name:"Wholemeal bread + omelette + cucumber",tags:["loveroti","budget"],items:[{food:"Wholemeal bread",portion:"2 slices",kcal:138},{food:"Egg",portion:"2 whole",kcal:140},{food:"Cucumber",portion:"1 handful",kcal:16},{food:"Cooking oil",portion:"1/2 tsp",kcal:20}]},
 {name:"Egg fried rice + vegetables",tags:["lovenasi","budget"],items:[{food:"White rice",portion:"1 fist",kcal:180},{food:"Fried egg",portion:"1 whole",kcal:78},{food:"Stir-fried vegetables",portion:"1 handful",kcal:40},{food:"Cooking oil",portion:"1/2 tsp",kcal:20}]},
 {name:"Rice vermicelli chicken soup",tags:["lovemee"],items:[{food:"Rice vermicelli",portion:"1 fist / 50g",kcal:183},{food:"Shredded boiled chicken",portion:"1 palm / 80g",kcal:104},{food:"Mustard greens / spinach",portion:"1 handful",kcal:18},{food:"Clear broth",portion:"1 small bowl",kcal:25}]},
 {name:"Greek yoghurt + granola + fruit",tags:[],items:[{food:"Greek yoghurt, plain",portion:"1 cup / 170g",kcal:100},{food:"Granola",portion:"2 tbsp / 25g",kcal:110},{food:"Local fruit",portion:"1 fist",kcal:60}]},
 {name:"Chicken rice porridge + ginger",tags:["lovenasi"],items:[{food:"Rice porridge",portion:"1 medium bowl",kcal:190},{food:"Shredded chicken",portion:"1/2 palm / 50g",kcal:65},{food:"Ginger + spring onion",portion:"a little",kcal:8}]},
 {name:"Boiled eggs + wholemeal bread + tea",tags:["loveroti","budget"],items:[{food:"Boiled egg",portion:"2 whole",kcal:140},{food:"Wholemeal bread",portion:"2 slices",kcal:138},{food:"Tea, low sugar",portion:"1 glass",kcal:30}]},
 {name:"Nasi lemak, portion controlled",tags:["lovenasi"],items:[{food:"White rice",portion:"1 fist",kcal:200},{food:"Sambal with anchovies",portion:"1 tbsp",kcal:55},{food:"Boiled egg",portion:"1 whole",kcal:70},{food:"Cucumber",portion:"1/2 stick",kcal:10},{food:"Groundnuts",portion:"1 tbsp",kcal:50}]},
 {name:"Bread wrap + tuna + salad",tags:["loveroti","hiprotein","lowcarb"],items:[{food:"Wholemeal wrap",portion:"1 piece",kcal:100},{food:"Canned tuna in water",portion:"1/2 can / 80g",kcal:92},{food:"Salad + tomato",portion:"2 handfuls",kcal:25},{food:"Low-fat mayonnaise",portion:"1 tsp",kcal:30}]},
 {name:"Wholegrain cereal + milk + fruit",tags:["budget"],items:[{food:"Wholegrain cereal",portion:"1 small bowl / 40g",kcal:145},{food:"Low-fat milk",portion:"3/4 glass / 180ml",kcal:75},{food:"Local fruit",portion:"1/2 fist",kcal:50}]},
 {name:"Yellow noodle chicken soup",tags:["lovemee"],items:[{food:"Yellow noodles",portion:"1 fist / 60g",kcal:195},{food:"Boiled chicken",portion:"1 palm / 80g",kcal:104},{food:"Mustard greens",portion:"1 handful",kcal:18},{food:"Clear broth",portion:"1 bowl",kcal:20}]},
 {name:"Banana oat pancakes",tags:["budget"],items:[{food:"Oat + banana + egg blend",portion:"3 small pancakes",kcal:220},{food:"Honey",portion:"1 tsp",kcal:21}]}
],
snack:[
 {name:"Greek yoghurt + honey",tags:["hiprotein"],items:[{food:"Greek yoghurt, plain",portion:"1 cup / 170g",kcal:100},{food:"Honey",portion:"1 tsp",kcal:21}]},
 {name:"Banana + nuts",tags:["budget"],items:[{food:"Banana",portion:"1 medium",kcal:89},{food:"Almonds / groundnuts",portion:"15g / 1 thumb",kcal:90}]},
 {name:"Boiled eggs",tags:["hiprotein","budget"],items:[{food:"Boiled egg",portion:"2 whole",kcal:140}]},
 {name:"Cut fruit (papaya / watermelon)",tags:["budget","lowcarb"],items:[{food:"Papaya / watermelon",portion:"2 fists / 200g",kcal:72}]},
 {name:"Apple + tea",tags:["budget","lowcarb"],items:[{food:"Apple",portion:"1 whole / 150g",kcal:78},{food:"Tea, low sugar",portion:"1 glass",kcal:25}]},
 {name:"High-protein milk",tags:["hiprotein"],items:[{food:"High-protein milk / shake",portion:"1 glass / 250ml",kcal:130}]},
 {name:"Wholemeal bread + peanut butter",tags:["budget","loveroti"],items:[{food:"Wholemeal bread",portion:"1 slice",kcal:69},{food:"Peanut butter",portion:"1 tbsp / 15g",kcal:94}]},
 {name:"Small chicken sandwich",tags:["hiprotein","loveroti"],items:[{food:"Wholemeal bread",portion:"2 small slices",kcal:138},{food:"Shredded boiled chicken",portion:"1/2 palm / 50g",kcal:65}]},
 {name:"Grilled tofu + soy sauce",tags:["budget"],items:[{food:"Tofu",portion:"2 blocks / 100g",kcal:120},{food:"Low-sodium soy sauce",portion:"1 tbsp",kcal:10}]},
 {name:"Edamame / boiled beans",tags:["budget","hiprotein"],items:[{food:"Edamame / boiled beans",portion:"1 cup / 150g",kcal:125}]}
],
lunch:[
 {name:"Rice + vegetable curry + tofu + beans",tags:["lovenasi","budget"],items:[{food:"White rice",portion:"1 fist",kcal:180},{food:"Vegetable curry (dhal + pumpkin)",portion:"1 ladle",kcal:130},{food:"Fried tofu",portion:"3 blocks / 90g",kcal:135},{food:"Stir-fried long beans",portion:"1-2 handfuls",kcal:40}]},
 {name:"Fried noodles with vegetables + tempe",tags:["lovemee","budget"],items:[{food:"Yellow noodles",portion:"1 fist / 70g",kcal:210},{food:"Fried tempe",portion:"4 pieces / 70g",kcal:140},{food:"Mixed vegetables",portion:"2 handfuls",kcal:45},{food:"Cooking oil",portion:"1 tsp",kcal:40}]},
 {name:"Brown rice buddha bowl",tags:["lovenasi","hiprotein"],items:[{food:"Brown rice",portion:"1 fist / 90g cooked",kcal:190},{food:"Boiled chickpeas",portion:"1/2 cup / 80g",kcal:135},{food:"Grilled tofu",portion:"2 blocks / 100g",kcal:95},{food:"Salad + ulam",portion:"2 handfuls",kcal:35},{food:"Olive oil",portion:"1 tsp",kcal:40}]},
 {name:"Rice + grilled chicken + vegetables + soup",tags:["lovenasi","hiprotein"],items:[{food:"White rice",portion:"1 fist",kcal:180},{food:"Grilled chicken, skinless",portion:"1 palm / 100g",kcal:165},{food:"Vegetables, stir-fried or boiled",portion:"1-2 handfuls",kcal:45},{food:"Clear broth",portion:"1 small bowl",kcal:25}]},
 {name:"Rice + grilled fish + vegetables + sambal",tags:["lovenasi"],items:[{food:"White rice",portion:"1 fist",kcal:180},{food:"Grilled mackerel / seabass",portion:"1 palm",kcal:140},{food:"Vegetables",portion:"1-2 handfuls",kcal:45},{food:"Sambal belacan",portion:"1 tsp",kcal:25}]},
 {name:"Rice vermicelli soup + greens",tags:["lovemee"],items:[{food:"Rice vermicelli",portion:"1 fist / 50g",kcal:183},{food:"Boiled chicken",portion:"1 palm / 100g",kcal:165},{food:"Mustard greens",portion:"1-2 handfuls",kcal:25},{food:"Clear broth",portion:"1 bowl",kcal:25}]},
 {name:"Brown rice + tempe + tofu + vegetables",tags:["lovenasi","budget"],items:[{food:"Brown rice",portion:"1 fist / 80g cooked",kcal:170},{food:"Fried tempe",portion:"3-4 pieces / 60g",kcal:120},{food:"Boiled tofu",portion:"2 blocks / 100g",kcal:80},{food:"Stir-fried vegetables",portion:"1-2 handfuls",kcal:40}]},
 {name:"Grilled chicken chop + potato + salad",tags:["hiprotein","lowcarb"],items:[{food:"Roast chicken, skinless",portion:"120g / 1 large palm",kcal:198},{food:"Boiled potato",portion:"1 fist / 100g",kcal:87},{food:"Mixed salad",portion:"2 handfuls",kcal:30},{food:"Black pepper sauce",portion:"2 tbsp",kcal:30}]},
 {name:"Steamed rice + chicken, portion controlled",tags:["lovenasi"],items:[{food:"White rice",portion:"1 fist",kcal:180},{food:"Boiled chicken, skinless",portion:"1 palm / 100g",kcal:165},{food:"Cucumber + tomato",portion:"1 handful",kcal:25},{food:"Sambal",portion:"1 tsp",kcal:25}]},
 {name:"Fried noodles, portion controlled",tags:["lovemee","budget"],items:[{food:"Yellow noodles",portion:"1 fist / 60g",kcal:185},{food:"Chicken / egg",portion:"1/2 palm / 1 whole",kcal:100},{food:"Mixed vegetables",portion:"1-2 handfuls",kcal:40},{food:"Soy + oyster sauce",portion:"1 tbsp",kcal:20},{food:"Cooking oil",portion:"1/2 tsp",kcal:21}]},
 {name:"Wholemeal bread + tomato sardines + salad",tags:["loveroti","budget"],items:[{food:"Wholemeal bread",portion:"2 slices",kcal:138},{food:"Canned tomato sardines",portion:"1/2 can / 75g",kcal:118},{food:"Salad / cucumber",portion:"1 handful",kcal:15}]},
 {name:"Chicken tomyam + a little rice",tags:["lovenasi"],items:[{food:"Chicken tomyam",portion:"1 bowl / 250ml",kcal:120},{food:"Chicken in the tomyam",portion:"1/2 palm",kcal:82},{food:"White rice",portion:"1/2 fist",kcal:90}]},
 {name:"Grilled chicken salad + brown rice",tags:["hiprotein","lowcarb"],items:[{food:"Grilled chicken, skinless",portion:"1 palm / 100g",kcal:165},{food:"Brown rice",portion:"1/2 fist / 60g cooked",kcal:110},{food:"Salad + tomato + cucumber",portion:"2 handfuls",kcal:35},{food:"Olive oil + lemon",portion:"1 tsp",kcal:40}]},
 {name:"Asam laksa, lighter version",tags:["lovemee"],items:[{food:"Rice vermicelli / laksa noodles",portion:"1 fist",kcal:190},{food:"Mackerel / sardines",portion:"1/2 palm / 60g",kcal:100},{food:"Cucumber + pineapple",portion:"1 handful",kcal:30},{food:"Asam laksa broth",portion:"1 bowl",kcal:60}]}
],
dinner:[
 {name:"Vegetable soup + tofu + a little rice",tags:["lovenasi","budget"],items:[{food:"Mixed vegetable soup",portion:"1 large bowl",kcal:95},{food:"Boiled tofu",portion:"3 blocks / 130g",kcal:105},{food:"White rice",portion:"1/2 fist",kcal:100},{food:"Stir-fried spinach",portion:"1-2 handfuls",kcal:45}]},
 {name:"Soy tempe + grilled aubergine + brown rice",tags:["lovenasi","hiprotein","budget"],items:[{food:"Tempe in soy sauce",portion:"5 pieces / 90g",kcal:180},{food:"Grilled aubergine",portion:"1 medium",kcal:55},{food:"Brown rice",portion:"1/2 fist / 60g",kcal:125},{food:"Ulam + tomato sambal",portion:"1 handful",kcal:35}]},
 {name:"Fried rice vermicelli + beans",tags:["lovemee","budget"],items:[{food:"Rice vermicelli",portion:"1 fist / 60g",kcal:210},{food:"Chickpeas + sweetcorn",portion:"1/2 cup",kcal:120},{food:"Mixed vegetables",portion:"2 handfuls",kcal:45},{food:"Cooking oil",portion:"1 tsp",kcal:40}]},
 {name:"Chicken vegetable soup + a little rice",tags:["lovenasi","budget"],items:[{food:"Boiled chicken, skinless",portion:"1 palm / 100g",kcal:165},{food:"Mixed vegetables",portion:"1-2 handfuls",kcal:50},{food:"White rice",portion:"1/2 fist",kcal:90},{food:"Clear broth",portion:"1 bowl",kcal:25}]},
 {name:"Grilled fish + ulam + sambal + a little rice",tags:["lovenasi"],items:[{food:"Grilled mackerel / seabass",portion:"1 palm",kcal:140},{food:"Ulam / cucumber",portion:"1 handful",kcal:15},{food:"Sambal belacan",portion:"1 tsp",kcal:25},{food:"White rice",portion:"1/2 fist",kcal:90}]},
 {name:"Wholemeal bread + tuna salad",tags:["loveroti","hiprotein","lowcarb"],items:[{food:"Wholemeal bread",portion:"2 slices",kcal:138},{food:"Canned tuna in water",portion:"1 can / 140g",kcal:165},{food:"Mixed salad",portion:"1-2 handfuls",kcal:25},{food:"Low-fat mayonnaise",portion:"1 tsp",kcal:20}]},
 {name:"Ginger soy chicken + vegetables + a little rice",tags:["lovenasi"],items:[{food:"Soy chicken, light on oil",portion:"1 palm / 100g",kcal:185},{food:"Stir-fried vegetables",portion:"1-2 handfuls",kcal:40},{food:"White rice",portion:"1/2 fist",kcal:90}]},
 {name:"Chicken tomyam + rice vermicelli",tags:["lovemee"],items:[{food:"Chicken in the tomyam",portion:"1 palm",kcal:165},{food:"Rice vermicelli",portion:"1/2 fist / 35g",kcal:130},{food:"Mushroom + vegetables",portion:"1 handful",kcal:30},{food:"Tomyam broth",portion:"1 bowl",kcal:45}]},
 {name:"Chicken porridge + egg + ginger",tags:["lovenasi"],items:[{food:"Rice porridge",portion:"1 medium bowl",kcal:160},{food:"Shredded chicken",portion:"1/2 palm / 50g",kcal:65},{food:"Soft-boiled egg",portion:"1 whole",kcal:70},{food:"Ginger + spring onion",portion:"a little",kcal:8}]},
 {name:"Chicken stir-fry + vegetables + egg + rice",tags:["lovenasi","hiprotein"],items:[{food:"Diced chicken",portion:"1 palm / 100g",kcal:165},{food:"Mixed vegetables",portion:"1-2 handfuls",kcal:50},{food:"Egg",portion:"1 whole",kcal:70},{food:"White rice",portion:"1/2 fist",kcal:90},{food:"Soy + oyster sauce",portion:"1 tbsp",kcal:20}]},
 {name:"Rice + egg + anchovy sambal + vegetables",tags:["lovenasi","budget"],items:[{food:"White rice",portion:"1/2 fist",kcal:90},{food:"Omelette",portion:"1 whole",kcal:90},{food:"Sambal with anchovies",portion:"1 tbsp",kcal:60},{food:"Boiled vegetables",portion:"1-2 handfuls",kcal:30}]},
 {name:"Tofu + tempe + vegetables + a little rice",tags:["lovenasi","budget"],items:[{food:"Fried tofu",portion:"2 blocks / 100g",kcal:120},{food:"Tempe",portion:"3 pieces / 60g",kcal:120},{food:"Stir-fried vegetables",portion:"1-2 handfuls",kcal:40},{food:"White rice",portion:"1/2 fist",kcal:90}]},
 {name:"Chicken salad + boiled egg + dressing",tags:["hiprotein","lowcarb"],items:[{food:"Grilled chicken, skinless",portion:"1 palm / 100g",kcal:165},{food:"Boiled egg",portion:"1 whole",kcal:70},{food:"Salad + tomato + cucumber",portion:"2-3 handfuls",kcal:35},{food:"Olive oil + lemon",portion:"1 tsp",kcal:40}]},
 {name:"Steamed ginger fish + rice + vegetables",tags:["lovenasi"],items:[{food:"Steamed fish",portion:"1 palm / 100g",kcal:130},{food:"Ginger + soy sauce",portion:"1 tbsp",kcal:15},{food:"White rice",portion:"1/2 fist",kcal:90},{food:"Boiled broccoli / kailan",portion:"1-2 handfuls",kcal:35}]},
 {name:"Egg fried rice, portion controlled",tags:["lovenasi","budget"],items:[{food:"White rice",portion:"1 fist",kcal:180},{food:"Egg",portion:"1 whole",kcal:70},{food:"Mixed vegetables",portion:"1 handful",kcal:30},{food:"Soy sauce",portion:"1 tbsp",kcal:20},{food:"Cooking oil",portion:"1/2 tsp",kcal:21}]}
]};

/* food-group detection — drives the daily balance check against MDG 2020.
   Matched on whole words, so "fried" never counts as a fruit the way the
   Malay "goreng" used to match "oren".                                       */
const FRUIT_KW=['banana','fruit','apple','papaya','watermelon','pineapple','orange','mango','strawberry','grapes'];
const SAYUR_KW=['vegetable','vegetables','greens','salad','cucumber','tomato','broccoli','kailan','spinach','pumpkin',
                'ulam','mushroom','cabbage','aubergine','beans','sweetcorn'];
const PROTEIN_KW=['chicken','fish','egg','eggs','tofu','tempe','tuna','sardines','beef','yoghurt','milk','edamame',
                  'chickpeas','groundnuts','almonds','peanut','mackerel','seabass','anchovies','omelette'];
const KARBO_KW=['rice','vermicelli','noodles','bread','oat','oats','porridge','cereal','potato','pancakes','wrap','granola'];
/* the fruit MDG asks for daily, when no menu in the day happens to carry one */
const MP_FRUITS=[{food:"Banana",portion:"1 medium",kcal:89},
                 {food:"Apple",portion:"1 whole",kcal:80},
                 {food:"Cut papaya",portion:"1 fist",kcal:60},
                 {food:"Cut watermelon",portion:"1 fist",kcal:46},
                 {food:"Orange",portion:"1 whole",kcal:62}];
const GAP_POOL=[
 {food:"White rice, +½ fist",kcal:90,grp:"karbo"},{food:"1 boiled egg",kcal:70,grp:"protein"},
 {food:"1 slice wholemeal bread",kcal:69,grp:"karbo"},{food:"1 banana",kcal:89,grp:"buah"},
 {food:"Boiled chicken, 50g",kcal:65,grp:"protein"},{food:"Tofu, 2 blocks",kcal:80,grp:"protein"},
 {food:"Tempe, 2 pieces",kcal:80,grp:"protein"},{food:"1 glass low-fat milk",kcal:102,grp:"protein"},
 {food:"A handful of nuts",kcal:90,grp:"protein"},{food:"Oats, 2 tbsp",kcal:74,grp:"karbo"}
];

/* ── dietary tags are DERIVED, never hand-written ──
   Hand-tagging 45 menus produced 30 wrong or missing tags on the first pass,
   including a "nomeat" porridge with chicken in it and a "noseafood" nasi lemak
   with anchovy sambal. A restriction tag that lies is worse than no tag, so the
   three restriction tags are computed from the ingredient list instead.
   The preference tags (lovenasi, budget, hiprotein…) stay hand-written —
   those are taste, not safety.                                              */
const _EGG=['egg','eggs','omelette'],
      _SEA=['fish','tuna','prawn','prawns','squid','anchovies','belacan','mackerel','seabass','sardines','crab','cockles'],
      _MEAT=['chicken','beef','mutton','lamb','duck','burger','sausage'];
(function deriveDietTags(){
  const words=s=>String(s).toLowerCase().split(/[^a-z]+/).filter(Boolean);
  const hit=(o,kw)=>o.items.some(i=>words(i.food).some(w=>kw.indexOf(w)>-1))
                 || words(o.name).some(w=>kw.indexOf(w)>-1);
  Object.keys(MDB).forEach(k=>MDB[k].forEach(o=>{
    o.tags=o.tags.filter(t=>t!=='noegg'&&t!=='noseafood'&&t!=='nomeat');
    if(!hit(o,_EGG))  o.tags.push('noegg');
    if(!hit(o,_SEA))  o.tags.push('noseafood');
    if(!hit(o,_MEAT)) o.tags.push('nomeat');
  }));
})();


