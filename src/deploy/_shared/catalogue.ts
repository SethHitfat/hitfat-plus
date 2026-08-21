/* ═══════════════════════════════════════════════════════════════
   The price list, server-side.

   This is the ONLY place a price is trusted. The browser sends a SKU and
   nothing else — never an amount — because a browser that can name its own
   price will eventually be asked to.

   These numbers must match store.js in the app. build.py compares the two
   and refuses to build if they drift, so a price changed in one place and
   not the other cannot ship.
   ═══════════════════════════════════════════════════════════════ */

export type Sku = {
  price: number;                                   // ringgit
  kind: 'program' | 'credits' | 'pass' | 'bar';
  credits?: number;                                // credits packs
  days?: number;                                   // passes
};

export const CATALOGUE: Record<string, Sku> = {
  "bundle_all": { price: 199, kind: "program" },
  "prog_sig1": { price: 89, kind: "program" },      // HITFAT Transformation · 12wk
  "prog_sig2": { price: 69, kind: "program" },      // HITFAT Strong · 8wk
  "prog_sig3": { price: 49, kind: "program" },      // HITFAT Reset 21 · 3wk
  "prog_sig4": { price: 69, kind: "program" },      // HITFAT Lean 8 · 8wk
  "prog_rh1": { price: 29, kind: "program" },       // Knee Prehab · 4wk
  "prog_rh2": { price: 29, kind: "program" },       // Shoulder Prehab · 4wk
  "prog_rh3": { price: 29, kind: "program" },       // Hip & Lower Back · 4wk
  "prog_rh6": { price: 19, kind: "program" },       // Post-Workout Recovery · 2wk
  "prog_lad4": { price: 29, kind: "program" },      // Ladies Beginner
  "prog_men6": { price: 39, kind: "program" },      // Men's Body Reset
  "prog_f40": { price: 39, kind: "program" },       // Fit After 40
  "prog_bws8": { price: 39, kind: "program" },      // Bodyweight Strength
  "prog_hiit4": { price: 29, kind: "program" },     // Home HIIT
  "prog_min3": { price: 29, kind: "program" },      // Towel & Bottle
  "prog_reset12": { price: 59, kind: "program" },   // Full Body Reset
  "prog_mkb": { price: 19, kind: "program" },       // 7 Day Kettlebell
  "prog_mdb": { price: 19, kind: "program" },       // 14 Day Dumbbell
  "prog_m1": { price: 29, kind: "program" },        // 21 Day Home
  "prog_m2": { price: 39, kind: "program" },        // 8 Week Beginner Training
  "prog_m3": { price: 29, kind: "program" },        // 22 Minutes Hardcore
  "scan_c20": { price: 19, kind: "credits", credits: 20 },
  "scan_c60": { price: 45, kind: "credits", credits: 60 },
  "scan_m": { price: 19, kind: "pass", days: 30 },
  "scan_y": { price: 99, kind: "pass", days: 365 },
};

/* 1 = FPX Online Banking · 6 = DuitNow QR — the two the portal offers */
export const CHANNELS = [1, 6];

export const BC_API = 'https://api.console.bayar.cash/v3';

/* Where the buyer comes back to. app.hitfat.io is HITFAT+'s own home — not
   hybrid.hitfat.io, which stays untouched. The secret overrides this, so the
   domain can move without redeploying. */
export const SITE = Deno.env.get('HITFAT_PLUS_SITE') || 'https://app.hitfat.io';

export const CORS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

export function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: CORS });
}

/* Turn a paid order into the row that grants it. Passes and credits differ:
   a pass expires, credits count down, a program never does either. */
export function entitlementFor(sku: string, order: string) {
  const p = CATALOGUE[sku];
  if (!p) return null;
  const row: Record<string, unknown> = { sku, kind: p.kind, source: order };
  if (p.kind === 'credits') row.credits_left = p.credits ?? 0;
  if (p.kind === 'pass') {
    const d = new Date();
    d.setDate(d.getDate() + (p.days ?? 30));
    row.expires_at = d.toISOString();
  }
  return row;
}

/* Bayarcash transaction status: 3 = Success (0 New · 1 Pending · 2 Failed · 4 Cancelled) */
export function isPaidStatus(s: unknown) {
  return String(s) === '3' || String(s).toLowerCase() === 'success';
}
