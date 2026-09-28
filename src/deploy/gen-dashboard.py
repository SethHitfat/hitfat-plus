"""Writes deploy/dashboard/<fn>.ts — one self-contained file per edge function,
for the Supabase dashboard editor, which cannot follow `../_shared/` imports.

    cd src/deploy && python3 gen-dashboard.py

The source of truth stays deploy/<fn>/index.ts plus deploy/_shared/. Run this
after changing either, and commit both. (Recreated Sept 2026 to reproduce the
existing dashboard files byte for byte before T42 payment was added.)
"""
import re, os

HEADER = """/* ═══════════════════════════════════════════════════════════════
   Single-file build for the Supabase dashboard editor, which takes one
   file per function. The shared catalogue and grant helper are inlined
   below instead of imported.

   Generated — do not hand-edit. The source of truth is
   deploy/<name>/index.ts plus deploy/_shared/.
   ═══════════════════════════════════════════════════════════════ */

"""
IMP = re.compile(r"^import .*? from '([^']+)';\n", re.M)

def split(src):
    """(external imports, relative import targets, body without imports)"""
    ext, rel = [], []
    for m in IMP.finditer(src):
        (rel if m.group(1).startswith('.') else ext).append((m.group(0), m.group(1)))
    return ext, rel, IMP.sub('', src)

def inline(name, seen, out):
    if name in seen: return
    seen.add(name)
    src = open(os.path.join('_shared', name)).read()
    ext, rel, body = split(src)
    for _, target in rel:
        inline(os.path.basename(target), seen, out)
    body = re.sub(r'^export (?=(async |const |function |type |let ))', '', body, flags=re.M)
    out.append((name, ext, body.strip('\n') + '\n'))

def build(fn):
    src = open(os.path.join(fn, 'index.ts')).read()
    ext, rel, body = split(src)
    parts, seen = [], set()
    for _, target in rel:
        inline(os.path.basename(target), seen, parts)
    imports, have = [], set()
    for line, _ in ext + [e for p in parts for e in p[1]]:
        if line not in have: have.add(line); imports.append(line)
    text = HEADER + '\n' + ''.join(imports)
    for name, _, pbody in parts:
        text += '\n/* ── inlined from _shared/%s ── */\n%s' % (name, pbody)
    text += '\n' + body.lstrip('\n')
    return text

if __name__ == '__main__':
    for fn in ('pay-create', 'pay-callback', 'pay-status', 'scan-food'):
        open(os.path.join('dashboard', fn + '.ts'), 'w').write(build(fn))
        print('wrote dashboard/%s.ts' % fn)
