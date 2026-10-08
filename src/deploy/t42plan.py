# Builds 31-t42-plan-v2.sql — the 42-day T42 plan, written once here in
# a form a coach can read, instead of 120 hand-typed rows.
#
#   cd src/deploy && python3 t42plan.py
#
# The shape:
#   · Two blocks of three weeks. Block A (weeks 1–3) teaches the movements;
#     block B (weeks 4–6) swaps in harder versions of the same patterns, so
#     week 4 is new, not just more.
#   · Inside a block, load climbs every week: more reps or seconds, then a
#     round more. No two weeks are the same.
#   · Every number is a round one — reps in twos, holds in fives.
#   · `n` is the exercise's name in the HITFAT+ library (it finds the clip);
#   · `label` is what the member reads. The library's names are filming
#     names ("Bottle Bent Over Row", "Lunges Jump"); the labels are clean.
#   · `sec` marks a timed exercise: the player runs it for that long, and
#     the preview says "40s", never "3 × 40" with no unit.
#   · est_minutes is worked out from the content — rounds × (work + 20s
#     rest) — so the number on the card is the time it takes.
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
REST = 20  # seconds between exercises, as the player runs it

# name in the library -> (clean label, the clip's own interval in seconds)
EX = {
    'Bodyweight Squat': ('Bodyweight Squat', 45), 'Chair Squat': ('Chair Squat', 45),
    'Squat Pulse': ('Squat Pulse', 45), 'Squat Hold': ('Squat Hold', 40),
    'Squat Jump': ('Squat Jump', 40), 'Wall Sit': ('Wall Sit', 40),
    'Reverse Lunges': ('Reverse Lunge', 45), 'Walking Lunges': ('Walking Lunge', 45),
    'Side Lunges': ('Side Lunge', 45), 'Curtsy Lunges': ('Curtsy Lunge', 45),
    'Bulgarian Split Squat': ('Bulgarian Split Squat', 45), 'Lunges Jump': ('Jump Lunge', 45),
    'Step Up Box or Chair': ('Step-Up (Chair)', 45),
    'Assisted Single Leg Pistol Squat': ('Assisted Pistol Squat', 45),
    'Hip Thrust': ('Hip Thrust', 45), 'Single Leg Glutes Bridge': ('Single-Leg Glute Bridge', 45),
    'Backpack Deadlift': ('Deadlift (Backpack)', 45),
    'Calf Raises': ('Calf Raise', 40), 'Single Leg Calf Raises': ('Single-Leg Calf Raise', 40),
    'Push Up': ('Push-Up', 45), 'Wide Push Up': ('Wide Push-Up', 45),
    'Diamond Push Up': ('Diamond Push-Up', 45), 'Decline Push Up': ('Decline Push-Up', 45),
    'Explosive Push Up': ('Explosive Push-Up', 45), 'Push Up Clap': ('Clap Push-Up', 45),
    'Push Up Shoulder Tap': ('Push-Up Shoulder Tap', 45), 'Push Up Hold': ('Push-Up Hold', 30),
    'Wall Push Up': ('Wall Push-Up', 45), 'Incline Push Up (Chair)': ('Incline Push-Up (Chair)', 45),
    'Tricep Dip Chair': ('Tricep Dip (Chair)', 45), 'Bench Dip': ('Bench Dip', 45),
    'Bottle Bent Over Row': ('Bent-Over Row (Bottles)', 45),
    'Bottle Shoulder Press': ('Shoulder Press (Bottles)', 45),
    'Bottle ALT Shoulder Press': ('Alternating Shoulder Press (Bottles)', 45),
    'Jumping Jack': ('Jumping Jacks', 45), 'High Knee': ('High Knees', 45),
    'Butt Kick': ('Butt Kicks', 45), 'Sprint On Spot': ('Sprint on the Spot', 30),
    'Fast Feet': ('Fast Feet', 30), 'Mountain Climber': ('Mountain Climbers', 40),
    'Plank Jack': ('Plank Jacks', 40), 'Half Burpee': ('Half Burpee', 45), 'Burpee': ('Burpee', 45),
    'Skater Jump': ('Skater Jump', 45), 'Tuck Jump': ('Tuck Jump', 40),
    'Broad Jump': ('Broad Jump', 45), 'Lateral Hop': ('Lateral Hop', 40), 'Power Skip': ('Power Skip', 40),
    'Plank': ('Plank', 40), 'Side Plank': ('Side Plank', 30), 'Hollow Hold': ('Hollow Hold', 30),
    'Plank Shoulder Taps': ('Plank Shoulder Tap', 40), 'Dead Bug': ('Dead Bug', 45),
    'Bird Dog': ('Bird Dog', 45), 'Crunch': ('Crunch', 40), 'Reverse Crunch': ('Reverse Crunch', 40),
    'Bicycle Crunch': ('Bicycle Crunch', 40), 'Leg Raises': ('Leg Raise', 40),
    'Russian Twist': ('Russian Twist', 40), 'Flutter Kick': ('Flutter Kicks', 40),
    'Bear Walk': ('Bear Walk', 45),
}

# A session: (title, focus, [(library name, reps or None, seconds or None), ...])
def r(n, reps): return (n, reps, None)
def s(n, sec):  return (n, None, sec)

PLAN = {
  'start': {
    'level': 'Beginner', 'days': [1, 3, 5],
    'sets': [2, 3, 3, 3, 3, 4],          # rounds, weeks 1–6
    'bump': [0, 0, 2, 0, 2, 2],          # added reps (seconds ×2.5) on top of the block's base
    'A': [
      ('Full Body Basics', 'Five movements, learned properly. Nothing to failure.',
       [r('Chair Squat', 10), r('Wall Push Up', 10), r('Reverse Lunges', 8), r('Dead Bug', 10), s('Plank', 20)]),
      ('Move & Breathe', 'Get the heart rate up without wrecking tomorrow.',
       [s('Jumping Jack', 30), r('Chair Squat', 10), s('High Knee', 20), r('Bird Dog', 10), s('Side Plank', 15)]),
      ('Lower Body & Core', 'Legs and midline. Slow and controlled.',
       [r('Bodyweight Squat', 10), r('Hip Thrust', 12), r('Side Lunges', 8), r('Crunch', 12), s('Plank', 25)]),
    ],
    'B': [
      ('Full Body Basics', 'The same five patterns, a step harder.',
       [r('Bodyweight Squat', 12), r('Incline Push Up (Chair)', 10), r('Walking Lunges', 10), r('Bird Dog', 12), s('Plank', 30)]),
      ('Move & Breathe', 'Longer intervals. Breathe through them.',
       [s('Jumping Jack', 40), r('Half Burpee', 6), s('High Knee', 30), s('Mountain Climber', 20), s('Side Plank', 20)]),
      ('Lower Body & Core', 'Single-leg work and a longer hold.',
       [r('Bodyweight Squat', 15), r('Single Leg Glutes Bridge', 10), r('Walking Lunges', 12), r('Reverse Crunch', 12), s('Wall Sit', 30)]),
    ],
  },
  'transform': {
    'level': 'Intermediate', 'days': [1, 2, 4, 6],
    'sets': [3, 3, 4, 3, 4, 4],
    'bump': [0, 2, 2, 0, 0, 2],
    'A': [
      ('Full Body Strength', 'Every major muscle, once. Controlled reps, full range.',
       [r('Bodyweight Squat', 12), r('Push Up', 10), r('Reverse Lunges', 10), r('Bottle Bent Over Row', 12), s('Plank', 30)]),
      ('Fat Burn Conditioning', 'Short rests, steady effort. Keep moving.',
       [s('Jumping Jack', 30), r('Squat Jump', 10), s('Mountain Climber', 30), r('Half Burpee', 8), s('High Knee', 30)]),
      ('Upper Body & Core', 'Push, pull, brace.',
       [r('Push Up', 10), r('Bottle Shoulder Press', 12), r('Bottle Bent Over Row', 12), r('Tricep Dip Chair', 10),
        r('Dead Bug', 12), s('Side Plank', 20)]),
      ('Lower Body & Glutes', 'The biggest muscles, the biggest burn.',
       [r('Bodyweight Squat', 15), r('Walking Lunges', 12), r('Hip Thrust', 15), r('Side Lunges', 10),
        r('Calf Raises', 16), s('Wall Sit', 30)]),
    ],
    'B': [
      ('Full Body Strength', 'Single-leg and loaded work. Slow down, own every rep.',
       [r('Bulgarian Split Squat', 10), r('Wide Push Up', 10), r('Backpack Deadlift', 12),
        r('Bottle Bent Over Row', 14), r('Plank Shoulder Taps', 16)]),
      ('Fat Burn Conditioning', 'Full burpees now. Hold the pace to the last round.',
       [r('Burpee', 8), r('Skater Jump', 16), s('Mountain Climber', 40), r('Squat Jump', 12), s('Sprint On Spot', 30)]),
      ('Upper Body & Core', 'Harder pressing, a stronger brace.',
       [r('Diamond Push Up', 8), r('Bottle ALT Shoulder Press', 12), r('Bottle Bent Over Row', 14),
        r('Push Up Shoulder Tap', 10), r('Russian Twist', 20), s('Hollow Hold', 25)]),
      ('Lower Body & Glutes', 'One leg at a time, and a long hold to finish.',
       [r('Bulgarian Split Squat', 10), r('Curtsy Lunges', 12), r('Single Leg Glutes Bridge', 12),
        r('Squat Pulse', 15), r('Single Leg Calf Raises', 12), s('Squat Hold', 40)]),
    ],
  },
  'perform': {
    'level': 'Advanced', 'days': [1, 2, 3, 5, 6],
    'sets': [4, 4, 5, 4, 5, 5],
    'bump': [0, 2, 2, 0, 0, 2],
    'A': [
      ('Power & Speed', 'Fast and explosive. Full rest is earned, not taken.',
       [r('Squat Jump', 10), r('Explosive Push Up', 8), r('Broad Jump', 8), r('Lunges Jump', 12),
        r('Skater Jump', 16), r('Plank Shoulder Taps', 20)]),
      ('Engine Conditioning', 'Conditioning. This one is meant to be hard.',
       [r('Burpee', 10), s('Sprint On Spot', 30), s('Mountain Climber', 40), r('Tuck Jump', 10), s('High Knee', 40)]),
      ('Upper Body Push & Pull', 'Upper-body volume, front and back.',
       [r('Push Up', 15), r('Decline Push Up', 10), r('Bottle Bent Over Row', 15), r('Bottle Shoulder Press', 12),
        r('Tricep Dip Chair', 12), s('Push Up Hold', 30)]),
      ('Legs & Lungs', 'Strength endurance in the legs.',
       [r('Bodyweight Squat', 20), r('Bulgarian Split Squat', 12), r('Walking Lunges', 16),
        r('Single Leg Glutes Bridge', 12), r('Calf Raises', 20), s('Wall Sit', 45)]),
      ('Core & Stability', 'A midline that holds under fatigue.',
       [s('Hollow Hold', 30), r('Bicycle Crunch', 20), r('Leg Raises', 12), s('Bear Walk', 30),
        s('Side Plank', 30), s('Plank', 45)]),
    ],
    'B': [
      ('Power & Speed', 'Higher jumps, quicker ground contact.',
       [r('Tuck Jump', 10), r('Push Up Clap', 8), r('Broad Jump', 10), r('Lunges Jump', 14),
        s('Lateral Hop', 30), s('Power Skip', 30)]),
      ('Engine Conditioning', 'Longer efforts. Find a pace you can hold.',
       [r('Burpee', 12), s('Fast Feet', 30), s('Plank Jack', 40), r('Squat Jump', 14),
        r('Skater Jump', 20), s('Sprint On Spot', 30)]),
      ('Upper Body Push & Pull', 'Narrow and wide pressing, heavier rows.',
       [r('Diamond Push Up', 12), r('Wide Push Up', 15), r('Bottle Bent Over Row', 16),
        r('Bottle ALT Shoulder Press', 14), r('Bench Dip', 12), r('Push Up Shoulder Tap', 12)]),
      ('Legs & Lungs', 'Single-leg strength, then the burn.',
       [r('Assisted Single Leg Pistol Squat', 8), r('Step Up Box or Chair', 12), r('Curtsy Lunges', 14),
        r('Hip Thrust', 20), r('Single Leg Calf Raises', 14), s('Squat Hold', 45)]),
      ('Core & Stability', 'Longer holds, harder levers.',
       [r('Reverse Crunch', 14), s('Flutter Kick', 30), r('Russian Twist', 24), r('Plank Shoulder Taps', 24),
        s('Side Plank', 40), s('Hollow Hold', 40)]),
    ],
  },
}

def equipment(names):
    kit = []
    if any(n.startswith('Bottle') for n in names): kit.append('Water bottles')
    if any(n.startswith('Backpack') for n in names): kit.append('Backpack')
    if any('Chair' in n or n == 'Bench Dip' or n.startswith('Step Up') or n.startswith('Assisted')
           for n in names): kit.append('Chair')
    return ' · '.join(kit) if kit else 'No equipment'

def build():
    rows = []
    for track, t in PLAN.items():
        for week in range(1, 7):
            block = t['A'] if week <= 3 else t['B']
            rounds, bump = t['sets'][week - 1], t['bump'][week - 1]
            for slot, dow in enumerate(t['days']):
                title, focus, items = block[slot]
                ex, work = [], 0
                for n, reps, sec in items:
                    label, clip = EX[n]
                    if sec is not None:
                        v = sec + (5 if bump else 0)
                        ex.append({'n': n, 'label': label, 'sets': rounds, 'sec': v}); work += v
                    else:
                        v = reps + bump
                        if v % 2 and v % 5: v += 1      # 17 -> 18: reps in twos or fives
                        ex.append({'n': n, 'label': label, 'sets': rounds, 'reps': v}); work += clip
                mins = rounds * (work + REST * len(items)) / 60
                mins = max(10, int(5 * round(mins / 5)))
                rows.append((track, (week - 1) * 7 + dow, title, ex, mins, t['level'],
                             equipment([e['n'] for e in ex]), focus))
    return rows

def q(v): return "'" + str(v).replace("'", "''") + "'"

def sql(rows):
    vals = ',\n    '.join('(%s,%d,%s,%s::jsonb,%d,%s,%s,%s)' % (
        q(tr), d, q(ti), q(json.dumps(ex, separators=(',', ':'))), m, q(lv), q(eq), q(fo))
        for tr, d, ti, ex, m, lv, eq, fo in rows)
    return '''-- ═══════════════════════════════════════════════════════════════
--  T42 · THE PLAN, VERSION 2
--  Generated by t42plan.py — edit that, not this. Safe to run again.
--
--  Two three-week blocks per track; load rises every week; round numbers;
--  clean exercise names (`label`) over the library's filming names (`n`);
--  timed exercises carry `sec`. Same training days as before, so rows are
--  updated in place and any workout already logged keeps its plan day.
--
--    START      days 1, 3, 5         TRANSFORM  days 1, 2, 4, 6
--    PERFORM    days 1, 2, 3, 5, 6   Day 42 is the final assessment.
-- ═══════════════════════════════════════════════════════════════

insert into public.t42_plan_days
  (challenge_id, track, day_no, title, exercises, est_minutes, level, equipment, focus)
select c.id, v.track, v.day_no, v.title, v.exercises, v.est_minutes, v.level, v.equipment, v.focus
  from public.t42_challenges c
  cross join (values
    ''' + vals + '''
  ) as v(track, day_no, title, exercises, est_minutes, level, equipment, focus)
 where c.slug = 't42-nov-2026'
on conflict (challenge_id, track, day_no) do update
   set title = excluded.title, exercises = excluded.exercises, est_minutes = excluded.est_minutes,
       level = excluded.level, equipment = excluded.equipment, focus = excluded.focus;
'''

if __name__ == '__main__':
    rows = build()
    open(os.path.join(HERE, '31-t42-plan-v2.sql'), 'w').write(sql(rows))
    print('wrote 31-t42-plan-v2.sql —', len(rows), 'sessions')
    # The demo carries the TRANSFORM plan, so a recording shows the real thing.
    demo = {d: [ti, m, eq, fo, ex] for t, d, ti, ex, m, lv, eq, fo in rows if t == 'transform'}
    jsp = os.path.join(HERE, '..', 't42demo.js'); js = open(jsp).read()
    a, b = js.index('/*PLAN>*/') + 9, js.index('/*<PLAN*/')
    open(jsp, 'w').write(js[:a] + json.dumps(demo, separators=(',', ':')) + js[b:])
    print('wrote the TRANSFORM plan into t42demo.js')
    for tr in PLAN:
        print(tr, sorted(set((m) for t, d, ti, ex, m, lv, eq, fo in rows if t == tr)), 'min')
