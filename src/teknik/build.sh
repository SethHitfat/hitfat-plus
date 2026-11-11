#!/bin/bash
# Semak Teknik THE START → ../../teknik/index.html (app.hitfat.io/teknik)
# Enjin: engine/*.js disalin tanpa ubah dari Desktop Macbook/hitfat-trainer-src.
set -e
cd "$(dirname "$0")"
JSC=/System/Library/Frameworks/JavaScriptCore.framework/Versions/A/Helpers/jsc
JS="engine/b_config.js engine/c_pose.js engine/d_geom.js engine/e_detect.js t_judge.js t_ui.js"
cat $JS > .chk.js; echo 'print("SINTAKS OK")' >> .chk.js
"$JSC" -e "try{checkSyntax('.chk.js');print('SINTAKS OK')}catch(e){print('SYNTAX ERROR '+e)}" 2>/dev/null | grep -q "SYNTAX ERROR" && { echo "REFUSING: sintaks"; exit 1; }
rm -f .chk.js
T=$("$JSC" test.js); echo "$T"
case "$T" in *GAGAL*) echo "REFUSING: ujian gagal"; exit 1;; esac
OUT=../../teknik/index.html
mkdir -p ../../teknik
BUILD=$(date +%Y%m%d-%H%M)
{ cat head.html; cat $JS; printf '\nTK.boot();\n</script>\n</body>\n</html>\n'; } > "$OUT"
sed -i '' "s/__BUILD__/$BUILD/g" "$OUT"
echo "BUILD $BUILD → teknik/index.html ($(wc -c < "$OUT") bait)"
