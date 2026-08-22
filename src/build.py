import re,sys,os
shell=open('shell2.html').read()
def rd(p): return open(p).read()
subs=[('/*__CSS__*/','parts/hybrid-red.css'),('<!--__AUTH__-->','auth.html'),('<!--__SCANUI__-->','scanui.html'),
 ('/*__DB__*/','parts/db.js'),('/*__PROGRAMS_MULTI__*/','parts/programs_multi.js'),
 ('/*__PROGRAMS__*/','parts/programs.js'),('/*__REHABLIB__*/','parts/rehablib.js'),('/*__BARLIB__*/','parts/barlib.js'),('/*__PLANS__*/','plans2.js'),('/*__BARPLANS__*/','barplans.js'),('/*__REHABPLANS__*/','rehabplans.js'),('/*__MONTHLY__*/','monthly.js'),('/*__STORE__*/','store.js'),('/*__FINDER__*/','finder.js'),('/*__MEALDB__*/','parts/mealdb.js'),('/*__MEALPLAN__*/','mealplan.js'),('/*__CUSTOM__*/','custom.js'),('/*__PLAYER__*/','player.js'),('/*__CHALLENGES__*/','parts/challenges.js'),('/*__CLUB__*/','club.js'),
 ('/*__VIEWS__*/','views2.js'),('/*__EAT__*/','eat2.js'),('/*__PROG__*/','prog2.js'),
 ('/*__TRAIN__*/','train2.js'),('/*__AUTHJS__*/','authjs.js')]
for k,f in subs:
    if k not in shell: sys.exit('marker missing: '+k)
    shell=shell.replace(k,rd(f))
left=re.findall(r'__[A-Z]+__',shell)
if left: sys.exit('unconsumed markers: '+str(set(left)))

body=shell.split('<script>')[-1]
defined=set(re.findall(r'function ([a-zA-Z_$][\w$]*)\s*\(',body))
defined|=set(re.findall(r'(?:const|let|var)\s+([a-zA-Z_$][\w$]*)\s*=\s*(?:\(|[a-zA-Z_$][\w$]*\s*=>)',body))
called=set(re.findall(r'onclick="([a-zA-Z_$][\w$]*)\(',shell))
bad=sorted(c for c in called if c not in defined)
if bad: sys.exit('onclick with no definition: '+str(bad))

css=shell.split('<style>',1)[1].split('</style>',1)[0]
have=set(re.findall(r'\.([a-zA-Z][\w-]*)',css))
need=['app','screen','pad','tabs','tab','hhdr','wk2','plan','ov','pi','join','acard','arow','mbar',
      'sechead','hscroll','frow','th','chev','wrow','num','bigbtn','ovl','hgroup','empty','pbar','inp',
      'sheet','segs','seg','fsec','fland','fact','fbig','ftile','fplan','flib','fnew','share-in','y','av2',
      'nhero','nrows','nrow','nt','ncard','ranked','rk','pb',
      'cp-in','cpbar','cpstep','cph','cpsub','cpgrid','cpo','cpdays','cpd','cpnote','cprow','cpfoot',
      'pl-scrim','pl-top','pl-x','pl-hd','pl-bot','pl-name','pl-sub','pl-clock','pl-ctrl','pl-go','pl-ov','pl-pill','pl-next','pl-segs','pl-timerow','pl-adj','pl-sm','now','done',
      'pl-fill','pl-ic','pl-dot','pl-modes','pl-mo','pl-busy','mirrormode','camoff','hascam','rdt','rds',
      'mpbadge','mppill','mpnote','mpday','mpday-h','mpday-b','mpbals','mpbal','mpslot','mpslot-h',
      'mpopt-h','mpitem','mpgap','mpgap-h','mpgap-s','mpopts','mpo',
      'ehero','estat','eslot','emacs','emac','ecta','elog','hit',
      'pw-in','pwtop','pwx','pwhero','pwmark','pwh','pws','pwlist','pwf','pwprice','pwfine','plocked','plock',
      'prods','prod','pr','pbig','flat','paychs','paych','sigb','nofilm','fqwhy','fqcta','tabmid','tlogo','splogo','mcard','mtop','me','mtag','mn','mbar','mrow','mgrid','mday','mbadges','mbadge']
miss=[c for c in need if c not in have]
if miss: sys.exit('classes with no CSS: '+str(miss))

ids=set(re.findall(r'id="([\w-]+)"',shell))
needids=['home','train','eat','progress','me','tr-segs','tr-body','prog-body','eat-body',
         'library','lib-body','scan','sharemodal','share-canvas','screen','tabs','cpm','cp-body','play','pl-video','pl-cam','pl-clock','pl-rest','pl-cd','pl-done','pl-ready','pl-modes','pl-camdot','pl-mode','pl-camhide','pl-pill','pl-next','pl-segs','mpm','mp-body','mealplan','mp-view','eat-segs','pwm','pw-body','store','store-segs','store-body','pl-nofilm','pl-nofilm-m','fqm','fq-body','tab-train-logo','monthly','mth-body','club','club-body','club-segs']
missid=[i for i in needids if i not in ids]
if missid: sys.exit('ids missing: '+str(missid))
if 'class="screen" id="screen"' not in shell: sys.exit('scroller lost its .screen class')

# Straight to the file that ships. The old flow wrote here and relied on me
# remembering to copy it up a level, which is exactly the kind of step that
# gets skipped at midnight.
open('../index.html','w').write(shell)
open('plus_body.js','w').write(shell.split('<script>')[-1].split('</script>')[0])
# ── prices must match the server's catalogue ──
# store.js decides what the buyer is shown; deploy/_shared/catalogue.ts decides
# what they are charged. A price changed in one and not the other means the app
# advertises RM29 while Bayarcash asks for RM39 — so the build refuses to ship it.
import json as _json, subprocess as _sp
_server = dict(re.findall(r'"(\w+)":\s*\{\s*price:\s*(\d+)', open('deploy/_shared/catalogue.ts').read()))
_r = _sp.run(['/System/Library/Frameworks/JavaScriptCore.framework/Versions/A/Helpers/jsc','pricecheck.js'],
             capture_output=True, text=True)
if _r.returncode != 0:
    sys.exit('price check could not run: ' + (_r.stderr.strip() or 'no output')[:300])
_app = _json.loads(_r.stdout.strip().splitlines()[-1])
_drift = sorted(set([k for k in _app if k not in _server]
                  + [k for k in _server if k not in _app]
                  + [k for k in _app if k in _server and _app[k] != _server[k]]))
if _drift:
    sys.exit('price drift between store.js and deploy/_shared/catalogue.ts: ' + ', '.join(_drift[:10]))
print('prices match the server catalogue (%d skus)' % len(_app))
print('assembled',len(shell),'bytes — all guards passed')
