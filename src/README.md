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
```

### The challenge engine (Sept 2026)

T42 is a **challenge, not a library**. Every edition — November, Ramadan,
Merdeka — is its own product with its own dates and its own price. Paying
for one registers you for that edition only: not HITFAT+, not the next
edition. When the edition's access closes, the programme closes with it and
what stays is the history — result, score, certificate — in **My T42 Journey**.

**Where each rule lives** (the app knows them too, but the database says no):

| rule | server | app |
|---|---|---|
| today, in Malaysia (the DB clock is UTC) | `t42_today()` | device date |
| paid for this edition, or the edition is free | `t42_reg_entitled()` | `T42.entitled()` |
| the programme is still open | `t42_access_open()` | `T42.accessOpen()` |
| draft · registration · upcoming · active · completed · closed | `t42_phase()` | `T42.phase()` |
| read a plan day: paid, on that track, not ahead of today, while open | `t42_can_read_plan()` (RLS on `t42_plan_days`) | `t42Gate()` |
| check-ins, workouts, RUSH: paid and open | `t42_guard_day()`, `t42_guard_rush()` | `t42Gate()` |
| only the tracks and modes the edition offers | `t42_guard_registration()` | `T42.offers()` |

**An edition's columns** (`t42_challenges`, added by `20-`):

- `price` — ringgit, read by `pay-create` on the server. **NULL = free**,
  which is how T42 ran before payment; running the migration changes nothing
  until a price is set.
- `mode_prices` — a price per mode when they differ, e.g.
  `{"online_solo":149,"gym_duo":299}`. Per person: each Gym Duo partner pays
  their own place. A mode left out falls back to `price`. Read through
  `t42_price(edition, mode)` (SQL), `t42ModePrice()` (pay-create) and
  `T42.modePrice()` (app) — all three give the same answer. The mode is fixed
  at registration (members have no UPDATE policy), so nobody pays the online
  price and moves to the gym.
- `results_on`, `access_ends_on` — the programme closes after
  `access_ends_on` (else `results_on`). An edition with neither never closes by
  date, as before — archive it instead.
- `tracks`, `modes` — what the edition offers. November 2026 is
  `{transform,perform}` / `{online_solo,gym_duo}`. START stays in the engine.
- `subtitle`, `cover_url` — the discovery screen.
- `config.scoring_model = 'v2'` — consistency 40 · progress 25 · missions 20 ·
  fitness 15 (`config.scoring.v2`, must total 100); `config.progress_mix`
  says what "progress" means per track; `config.community_url` adds a
  community button before day 1. v1 is still there for older editions.
- `t42_weeks.mission_rule` — the weekly mission, checked by the scorer from
  the week's own rows (types listed in `20-`). Never a box a browser ticks.

**Paying.** The SKU is `t42:<slug>`. `pay-create` prices it from the edition
row (`_shared/t42.ts` — not the catalogue, so a new edition is not a
deploy), refuses a closed, free or already-paid edition and anyone who has not
signed up, and the grant marks the **registration** `paid`. Nothing goes into
`plus_entitlements`. The app's join flow saves the baseline first, then asks
for payment; the gateway returns to `?paid=t42:…` and `t42AwaitPayment()`
confirms it.

**Launching a new edition** is SQL, not code:

```sql
insert into public.t42_challenges
  (slug, name, edition, subtitle, starts_on, ends_on, reg_opens_on, reg_closes_on,
   results_on, access_ends_on, price, tracks, modes, status, total_days, config)
select 't42-ramadan-2027', 'T42 Ramadan 2027', 'Ramadan 2027', '42 days. One transformation.',
       date '2027-02-08', date '2027-03-21', date '2027-01-10', date '2027-02-07',
       date '2027-03-28', date '2027-03-28', 99, tracks, modes, 'registration', 42, config
  from public.t42_challenges where slug = 't42-nov-2026';
-- then copy the weeks (t42_weeks) and the plan (t42_plan_days) for the new id
```

**Deploying the engine onto the live database** — every file is safe to run
again:

```
deploy/20-t42-core.sql      # new columns + helpers + the gated plan policy
deploy/24-t42-scoring.sql   # guards + scorer v2 + scoring by date
deploy/10-club-tables.sql   # Gym Duo check-in runs on HITFAT Club — once, if not run yet
deploy/11-club-checkin.sql
deploy/26-t42-gym.sql       # duos, gym attendance, gym access granted on payment
deploy/21-t42-seed.sql      # November: Online Solo + Gym Duo, two tracks, v2, missions, dates
update public.t42_challenges set mode_prices = '{"online_solo":<RM>,"gym_duo":<RM>}'
 where slug = 't42-nov-2026';
supabase functions deploy pay-create pay-callback pay-status
```

(or paste `deploy/dashboard/*.ts` into the dashboard editor — regenerate them
with `python3 deploy/gen-dashboard.py` after changing `deploy/*/index.ts` or
`_shared/`). The app falls back to the old columns until `20-` has run, so
the order of app and SQL deploys does not matter.

`deploy/test/run.sh` checks all of this against a local PostgreSQL: it
builds the schema as it was before the engine, upgrades it, and diffs a
scenario (paid/unpaid, reading ahead, access ending, the v2 score) against
`expected.out`.

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
access is a `club_members` row for the edition, because Club check-in refuses
anyone without one. It is granted **automatically when a Gym Duo place is
paid** (trigger `t42_gym_on_paid`); a grant that fails does not fail the
payment — it leaves a `gym_access_failed` note, and staff grant it by hand
with `t42_gym_enrol`. The
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

Payment is wired per edition (see *The challenge engine* above): an edition
with a price ranks only paid registrations; a free edition (no price) ranks
every status except withdrawn and disqualified, as before.

Gym Duo is sold beside Online Solo at its own price. Its check-in, coach
verification and InBody are what HITFAT Club already models — so `10-` and
`11-` (Club) and `26-` must be live before a Gym Duo edition starts, rather
than growing a second QR, roster and coach console.
