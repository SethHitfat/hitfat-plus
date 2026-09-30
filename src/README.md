# HITFAT+ · sources

The app ships as one self-contained `index.html`. **Never edit that file.**
Edit a part here, run the build, and it writes `../index.html` for you.

```bash
cd src
python3 build.py                                       # assembles + runs every guard
/System/Library/Frameworks/JavaScriptCore.framework/Versions/A/Helpers/jsc run_plus.js
cd .. && git commit -am "..." && git push               # Netlify deploys from main
```

`build.py` refuses to write unless all of these hold:

- every marker in `shell2.html` is consumed
- every `onclick` names a function that exists
- every structural class has CSS
- every referenced id exists
- the scroller still carries `class="screen"`
- prices in `store.js` match `deploy/_shared/catalogue.ts`

`jsc run_plus.js` runs 698 assertions against the assembled body.

## Layout

| | |
|---|---|
| `shell2.html` | the page: head, markup, boot, layout. Holds the `__MARKER__` slots. |
| `parts/` | the big data blocks — exercises, programs, meals, CSS |
| `*.js` | one screen or subsystem each, in the order `build.py` lists them |
| `deploy/` | Supabase edge functions and SQL — deployed separately, not by this build |
| `run_plus.js`, `stubp.js`, `tbody.js` | the test harness |

## HITFAT Club

`club.js` is the gym layer: overview, classes, check-in, body and rewards.
None of it appears unless the server says the account has Club standing.

Deploy order, once, in project `ercvaagznsndvrewlvgt`:

```
deploy/10-club-tables.sql      # members, sessions, bookings, points, rewards, inbody
deploy/11-club-checkin.sql     # check-in tokens, balances view, redeem, roster, missions
supabase functions deploy club-checkin
supabase functions deploy club-inbody
supabase secrets set ANTHROPIC_API_KEY=...     # club-inbody only
```

Then give yourself a row in `club_members` — the bottom of `10-club-tables.sql`
has the statement.

### The check-in QR

The member's phone shows a code; the coach scans it with `coach.html`. What
the QR carries is a token issued by `club-checkin`, good for three minutes and
destroyed on first use, so a photograph of someone's screen is worth nothing.
Under it is a six-character code the coach can type, because cameras fail to
focus and batteries go flat and neither should mean a member cannot be marked
present.

The QR is drawn by an encoder written out in `club.js` rather than pulled from
a CDN — the one moment it matters is a member at the counter with the class
starting, and a script tag that has not loaded is a member who cannot check in.
It is verified in `tbody.js` against fixtures from python-qrcode. Those
fixtures are payloads where our mask choice and theirs coincide: the standard
only says to pick the lowest penalty, and two correct encoders may break that
tie differently.

Points are awarded by the edge function and nowhere else. A client that can
write `club_points` can award itself a shirt.

## T42

`t42.js` is the 42-day challenge: entry, mode, track, the 60-second
assessment, registration and baseline. It is a panel inside the app, like
the Club — one auth session, one design system, one back button — and it
plays its workouts through the same player as every other program.

What it does not share is state. Everything else in HITFAT+ lives in one
JSON blob in `plus_data` that the browser owns and writes. That is right for
a training diary and wrong for a competition, so every T42 row comes from
its own tables and the app never writes a score: `t42_scores` is computed
server-side and is read-only to the client.

Deploy order, once, in project `ercvaagznsndvrewlvgt`:

```
deploy/20-t42-core.sql     # 14 tables, RLS, the duo trigger
deploy/21-t42-seed.sql     # the November edition and its six weeks
deploy/22-t42-plan.sql     # 72 sessions across the three tracks
deploy/23-t42-storage.sql  # the private photo bucket and its policies
deploy/24-t42-scoring.sql  # the guards, the scorer, the leaderboard
deploy/25-t42-finalise.sql # closing an edition and issuing certificates
deploy/26-t42-gym.sql      # Gym Duo — needs the Club schema (10-, 11-) first
deploy/27-t42-engine.sql   # paid places, dates that run the edition, access that ends
deploy/28-t42-gym-duo.sql  # Gym Duo sold beside Online: its own price, gym access on payment
```

Prices are set by hand, never in a migration — both per person:

```sql
update public.t42_challenges
   set price_rm = <online RM>, gym_price_rm = <gym duo RM>
 where slug = 't42-nov-2026';
```

`gym_price_rm` null means Gym Duo costs the same as Online. A paid Gym Duo
place gets its HITFAT Club row (gym check-in) automatically; if that grant
fails, the payment still stands and a `gym_access_failed` note is left for
staff to grant it with `t42_gym_enrol`. Run `28-` again after re-running
`21-`, which rewrites the edition's config.

### The score

`24-` is two things, and the first matters more than the second.

**Guards.** RLS decides whose row a member may write, not what they may
write into it. Triggers on registrations, check-ins, workouts, RUSH results
and measurements hold the rest: a check-in only for today or last night,
dates set by the server's clock, a baseline that locks on day 3 (its fitness
test on day 7), a mid-point open days 21–38, a final from day 39, and no
member ever writing their own body fat, source, or verification status.
`t42.js` knows the same windows (`lockDay`, `fitLockDay`, `t42CanEdit`,
`t42FitPhase`) so nobody fills in a form only to have the database refuse
it — but the database is what actually says no.

**The scorer.** `t42_compute_scores()` reads the weights and targets from
the edition's `config`, refuses to run on a weight set that does not total
100, and writes `t42_scores`, `t42_duo_scores` and `t42_weekly_reviews`. It
runs hourly under pg_cron if the extension is on, and when an admin presses
Recompute. It is not callable by anyone else — Postgres grants EXECUTE to
PUBLIC by default and Supabase exposes every function as an RPC, so the
grants at the bottom of the file are what keep the scorer private.

Body and fitness components are scored against a target and capped at 100.
A 12% weight loss scores the same as the 6% target: the challenge does not
reward the thing it should not be the reason for.

The leaderboard is `t42_leaderboard()`: a first name, an initial, a place, a
score. No column exists on it that could carry a weight or a photo.

### Closing an edition

`t42_finalise()` is pressed once, by an admin, from the last day. In one
transaction it scores the edition as final, **refuses to continue if anyone
on a podium has a final nobody has verified**, marks the edition complete,
and issues the certificates — FINISHER for everyone who completed it,
CHAMPION for first on each board. If it refuses, nothing has happened.

Certificates are written there and nowhere else: `t42_certificates` has no
insert policy. Each one is frozen at issue — full name, edition, score,
serial — and the app draws it onto a canvas from that row, so a certificate
someone has already posted cannot change afterwards.

After the last day, check-ins and workouts close (counted in real days, not
the day number, which stops at 42), and once the edition is complete no
measurement can be edited.

## t42-admin.html

The review desk, and like `coach.html` not part of the build. Staff
(coach/staff/admin in `club_members`) verify finals — baseline beside the
submission, photos on request through hour-long signed links. Admin alone
recomputes and changes a participant's status. Every decision writes a
before/after row to `t42_admin_notes`. It never writes a score.

`22-` is generated, not hand-written: every exercise name in it was checked
against the 310 in `parts/db.js` when the file was made. A T42 workout plays
through the same `startWorkout()` as every other program, so a name the
library does not have would hit the player's own fallback and show someone a
squat where the plan said plank. The app drops an unknown name instead.

Until a row exists in `t42_challenges`, T42 is invisible — no card on Home,
no way in. That is deliberate. Edit the dates at the top of `21-` before
running it.

### Progress photos

The bucket is private and there is no public URL. The app reads a photo
through a signed link that expires in an hour and is never stored. The path
is `<user_id>/<phase>-<slot>.jpg` and the first segment IS the owner, which
is what every storage policy checks — so a duo partner cannot reach them,
because training beside someone is not consent to see them undressed.
Staff can read (a final result may have to be checked against a starting
photo) but cannot write or delete: a photo an admin could replace is not
evidence of anything.

### What is not built yet

All five phases are built, for Online Solo and Gym Duo.

### Gym Duo

Built on HITFAT Club rather than beside it. Attendance is a Club class the
member attended during the challenge — the coach scanning their QR at the
counter is the verification — counted in distinct Malaysian days. Gym
access is a `club_members` row an admin grants for the edition
(`t42_gym_enrol`), because Club check-in refuses anyone without one. The
InBody is typed in by staff on `t42-admin.html` → Gym duo, onto the member's
own baseline or final; the member can never write body composition.

Pairing is by a four-character code (no 0/O or 1/I), same gender and same
track, open until the baseline closes and fixed after. A partner sees the
other through `t42_duo_card()` only: first name, today's ticks and steps,
gym days, and progress as percentages — never kilograms, body fat or photos.
Duos rank on the average of the two partners' scores.

Until `26-` is run, `24-`'s stand-in `t42_gym_attended()` answers NULL and
every gym participant is marked "Gym attendance is not connected yet" rather
than scored on a zero. A gym participant also needs a duo, and on TRANSFORM
a baseline InBody, to be ranked.

Payment is not wired to T42 either: registrations stay `pending`, and the
scorer ranks every status except withdrawn and disqualified.

Gym Duo registers interest and says so on screen. Its check-in, coach
verification and InBody are what HITFAT Club already models, and the Club
schema has not been run on this database yet — so the duo half waits for
`10-club-tables.sql` rather than growing a second QR, a second roster and a
second coach console for one person to keep in step with the other by hand.
