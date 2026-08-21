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

`jsc run_plus.js` runs 595 assertions against the assembled body.

## Layout

| | |
|---|---|
| `shell2.html` | the page: head, markup, boot, layout. Holds the `__MARKER__` slots. |
| `parts/` | the big data blocks — exercises, programs, meals, CSS |
| `*.js` | one screen or subsystem each, in the order `build.py` lists them |
| `deploy/` | Supabase edge functions and SQL — deployed separately, not by this build |
| `run_plus.js`, `stubp.js`, `tbody.js` | the test harness |

## History

These sources lived only in a scratch directory under `/private/tmp` and were
lost when macOS cleaned it on 2026-08-20. They were reconstructed from the
built file by slicing it at part boundaries, then verified byte-for-byte
against what was live. They belong in the repository for that reason.
