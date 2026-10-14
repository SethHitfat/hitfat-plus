/* Prints the app's price list as JSON so build.py can compare it against
   deploy/_shared/catalogue.ts. Run against the freshly built plus_body.js. */
var all = readFile("stubp.js") + "\n" + readFile("plus_body.js") + "\n" + `
var out = {};
out[BUNDLE_SKU] = String(BUNDLE_PRICE);
PROGRAMS.concat(RECOVERY_LIVE?[]:REHAB_PLANS).filter(isPaidProgram).forEach(function(p){ out['prog_'+p.id] = String(programPrice(p)); });
/* a course sold on its own is not among PROGRAMS (it is not a training plan) */
if (typeof D6 !== 'undefined') out['prog_'+D6.id] = String(D6.price);
SCAN_PRODUCTS.forEach(function(s){ out[s.sku] = String(s.price); });
SUB_PLANS.forEach(function(s){ out[s.sku] = String(s.price); });
print(JSON.stringify(out));
`;
(0, eval)(all);
