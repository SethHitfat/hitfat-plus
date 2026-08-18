# HITFAT+

The app is one self-contained `index.html` — photos, icons and logo are all
embedded, so there are no loose files to lose on the way to the host.

Netlify publishes this repo's root. Push to `main` and it deploys.

Built from sources in the working scratchpad via `build.py`, which refuses to
write output unless every marker resolves, every `onclick` has a definition,
every structural class has CSS, every referenced id exists, and the prices in
the app match `deploy/_shared/catalogue.ts`. Do not hand-edit `index.html`.

Backend lives in Supabase project `ercvaagznsndvrewlvgt` — separate from
HITFAT Hybrid, which keeps its own project and its own user accounts.
