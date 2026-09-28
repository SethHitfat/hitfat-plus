# Builds deploy/dashboard/<name>.ts — one file per function, for pasting
# into the Supabase dashboard editor, which cannot follow an import into
# ../_shared. The source of truth stays deploy/<name>/index.ts plus
# deploy/_shared/; run this after changing either:
#
#   cd src/deploy && python3 dashboard.py
import os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
FUNCS = ['pay-create', 'pay-callback', 'pay-status', 'scan-food']

HEADER = '''/* ═══════════════════════════════════════════════════════════════
   Single-file build for the Supabase dashboard editor, which takes one
   file per function. The shared catalogue and grant helper are inlined
   below instead of imported.

   Generated — do not hand-edit. The source of truth is
   deploy/<name>/index.ts plus deploy/_shared/.
   ═══════════════════════════════════════════════════════════════ */

'''

def rd(p): return open(os.path.join(HERE, p)).read()
def is_import(l): return l.startswith('import ')
def unexport(src): return re.sub(r'^export ', '', src, flags=re.M)

def build(root, name):
    main = open(os.path.join(root, name, 'index.ts')).read()
    lines = main.split('\n')
    imports = [l for l in lines if is_import(l) and '../_shared/' not in l]
    uses_grant = any('../_shared/grant.ts' in l for l in lines if is_import(l))
    uses_cat = uses_grant or any('../_shared/catalogue.ts' in l for l in lines if is_import(l))
    body = '\n'.join(l for l in lines if not is_import(l))

    out = HEADER + '\n' + '\n'.join(imports) + '\n'
    if uses_cat:
        out += '\n/* ── inlined from _shared/catalogue.ts ── */\n'
        out += unexport(open(os.path.join(root, '_shared', 'catalogue.ts')).read())
    if uses_grant:
        g = open(os.path.join(root, '_shared', 'grant.ts')).read()
        g = '\n'.join(l for l in g.split('\n') if not is_import(l))
        out += '\n/* ── inlined from _shared/grant.ts ── */\n' + unexport(g)
    out += '\n' + body
    return out

if __name__ == '__main__':
    root = sys.argv[1] if len(sys.argv) > 1 else HERE
    dest = sys.argv[2] if len(sys.argv) > 2 else os.path.join(HERE, 'dashboard')
    for f in FUNCS:
        open(os.path.join(dest, f + '.ts'), 'w').write(build(root, f))
        print('wrote', os.path.join(dest, f + '.ts'))
