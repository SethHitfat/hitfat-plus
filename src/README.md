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
