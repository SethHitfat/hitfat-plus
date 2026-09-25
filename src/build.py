import re,sys,os
shell=open('shell2.html').read()
def rd(p): return open(p).read()
subs=[('/*__CSS__*/','parts/hybrid-red.css'),('<!--__AUTH__-->','auth.html'),('<!--__SCANUI__-->','scanui.html'),
 ('/*__DB__*/','parts/db.js'),('/*__PROGRAMS_MULTI__*/','parts/programs_multi.js'),
 ('/*__PROGRAMS__*/','parts/programs.js'),('/*__REHABLIB__*/','parts/rehablib.js'),('/*__BARLIB__*/','parts/barlib.js'),('/*__PLANS__*/','plans2.js'),('/*__BARPLANS__*/','barplans.js'),('/*__REHABPLANS__*/','rehabplans.js'),('/*__MONTHLY__*/','monthly.js'),('/*__STORE__*/','store.js'),('/*__FINDER__*/','finder.js'),('/*__MEALDB__*/','parts/mealdb.js'),('/*__MEALPLAN__*/','mealplan.js'),('/*__CUSTOM__*/','custom.js'),('/*__PLAYER__*/','player.js'),('/*__CHALLENGES__*/','parts/challenges.js'),('/*__CLUB__*/','club.js'),('/*__T42__*/','t42.js'),
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
      'prods','prod','pr','pbig','flat','paychs','paych','sigb','nofilm','fqwhy','fqcta','tabmid','tlogo','splogo','mcard','mtop','me','mtag','mn','mbar','mrow','mgrid','mday','mbadges','mbadge',
      # HITFAT Club — check-in, body and rewards
      'cstats','cstat','cs-l','cs-v','cs-m','chero','chero-k','chero-s','chero-go',
      'cacts','cact','cpill','cweek','cwd','cpts','cpts-l','cpts-n','cpts-next','cshield',
      'cbody-mini','cbm','cbm-l','cbm-v','cd','cloc','ccls','ccls-t','ccls-time','ccls-m',
      'ccls-n','ccls-c','ccls-k','ccls-s','ccls-go','ctag','cbar','cbtn',
      'cqr','cqr-lead','cqr-frame','cqr-name','cqr-id','cqr-code','cqr-hint','cqr-note','cqr-wait',
      'cc','qrsvg','cdone','cdone-i','cdone-t','cdone-s','cdone-p','crow3','cr3',
      'cscore','cscore-l','cscore-k','cscore-n','cscore-d','cscore-r','cgrid','cib','cib-l','cib-v','cib-d',
      'ctr-h','ctr-l','ctr-v','ctr-svg','ctr-x','cseg','cseg-l','cseg-b','cseg-v',
      'chist-r','chist-d','chist-n','chist-v','chist-s','chist-a',
      'cbal','cbal-n','cbal-l','crtabs','crt','cmis','cpts-tag','crw','crwc','crwc-h','crwc-n',
      'crwc-c','crwc-p','crwc-b',
      # T42 — the 42-day challenge
      't42-hero','t42-logo','t42-sub','t42-by','t42-line','t42-when',
      't42-modes','t42-mini','t42-mini-n','t42-mini-t',
      't42-trackrow','t42-trackicon','t42-trackn',
      't42-card','t42-card-h','t42-card-n','t42-card-t','t42-radio','t42-bul',
      't42-note','t42-q','t42-opt','t42-field','t42-pills','t42-pill',
      't42-photos','t42-photo','t42-photo-i','t42-photo-l','t42-code',
      't42-count','t42-count-n','t42-count-l',
      't42-grid','t42-stat','t42-stat-l','t42-stat-v','t42-home',
      # T42 — the running challenge
      't42-day','t42-day-l','t42-day-n','t42-day-s',
      't42-row','t42-row-i','t42-row-b','t42-row-l','t42-row-v',
      't42-tick','t42-chev','t42-rest','t42-glasses','t42-glass',
      't42-ex','t42-ex-n','t42-ex-b','t42-ex-s',
      # T42 — progress
      't42-meter','t42-meter-h','t42-photo-img',
      # T42 — leaderboard
      't42-boards','t42-me','t42-me-l','t42-me-r','t42-me-s','t42-me-n',
      't42-lb','t42-lb-p','t42-lb-n','t42-lb-s',
      # T42 — the end
      't42-trophy','t42-score','t42-score-l','t42-score-n','t42-score-r','t42-cert',
      # T42 — gym duo
      't42-codein','t42-duo','t42-duo-c','t42-duo-n','t42-duo-l','t42-duo-ok','t42-duo-no',
      # T42 — the Home banner
      't42-banner','t42-banner-top','t42-banner-logo','t42-banner-tag','t42-banner-line',
      't42-banner-sub','t42-banner-cta','t42-miss']
miss=[c for c in need if c not in have]
if miss: sys.exit('classes with no CSS: '+str(miss))

ids=set(re.findall(r'id="([\w-]+)"',shell))
needids=['home','train','eat','progress','me','tr-segs','tr-body','prog-body','eat-body',
         'library','lib-body','scan','sharemodal','share-canvas','screen','tabs','cpm','cp-body','play','pl-video','pl-cam','pl-clock','pl-rest','pl-cd','pl-done','pl-ready','pl-modes','pl-camdot','pl-mode','pl-camhide','pl-pill','pl-next','pl-segs','mpm','mp-body','mealplan','mp-view','eat-segs','pwm','pw-body','store','store-segs','store-body','pl-nofilm','pl-nofilm-m','fqm','fq-body','tab-train-logo','monthly','mth-body','club','club-body','club-segs','t42','t42-body','t42-segs','home-t42']
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
