/* ═══════════════════════════════════════════════════════════════
   Single-file build for the Supabase dashboard editor, which takes one
   file per function. The shared catalogue and grant helper are inlined
   below instead of imported.

   Generated — do not hand-edit. The source of truth is
   deploy/<name>/index.ts plus deploy/_shared/.
   ═══════════════════════════════════════════════════════════════ */


import { createClient } from 'jsr:@supabase/supabase-js@2';

/* ── inlined from _shared/catalogue.ts ── */
/* ═══════════════════════════════════════════════════════════════
   The price list, server-side.

   This is the ONLY place a price is trusted. The browser sends a SKU and
   nothing else — never an amount — because a browser that can name its own
   price will eventually be asked to.

   These numbers must match store.js in the app. build.py compares the two
   and refuses to build if they drift, so a price changed in one place and
   not the other cannot ship.
   ═══════════════════════════════════════════════════════════════ */

type Sku = {
  price: number;                                   // ringgit
  kind: 'program' | 'credits' | 'pass' | 'bar';
  credits?: number;                                // credits packs
  days?: number;                                   // passes
};

const CATALOGUE: Record<string, Sku> = {
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
  "prog_wl30": { price: 39, kind: "program" },      // 30-Day Weight Loss · sold on its own, also on its landing page
  /* Meal Scan add-ons (12 Oct 2026): 30 days of a daily allowance, enforced in
     scan-food. The credit packs and old passes below are no longer sold and
     stay so a late callback still grants. */
  "scan_d3": { price: 9.9, kind: "pass", days: 30 },
  "scan_d6": { price: 14.9, kind: "pass", days: 30 },
  "scan_dx": { price: 24.9, kind: "pass", days: 30 },
  "scan_c20": { price: 19, kind: "credits", credits: 20 },
  "scan_c60": { price: 45, kind: "credits", credits: 60 },
  "scan_m": { price: 19, kind: "pass", days: 30 },
  "scan_y": { price: 99, kind: "pass", days: 365 },
  /* HITFAT+ membership. Stored as a pass: it ends on a date, and the scan
     function already treats a live pass as unlimited scanning. The SKU
     prefix is the tier. Programs, All Access and scan packs stay listed so
     an order made before the membership still grants on a late callback. */
  "sub_plus_6m":   { price: 149, kind: "pass", days: 183 },
  "sub_plus_12m":  { price: 249, kind: "pass", days: 365 },
  "sub_coach_6m":  { price: 349, kind: "pass", days: 183 },
  "sub_coach_12m": { price: 599, kind: "pass", days: 365 },
};

/* 1 = FPX Online Banking · 6 = DuitNow QR — the two the portal offers */
const CHANNELS = [1, 6];

const BC_API = 'https://api.console.bayar.cash/v3';

/* Where the buyer comes back to. app.hitfat.io is HITFAT+'s own home — not
   hybrid.hitfat.io, which stays untouched. The secret overrides this, so the
   domain can move without redeploying. */
const SITE = Deno.env.get('HITFAT_PLUS_SITE') || 'https://app.hitfat.io';

const CORS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: CORS });
}

/* Turn a paid order into the row that grants it. Passes and credits differ:
   a pass expires, credits count down, a program never does either. */
function entitlementFor(sku: string, order: string) {
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

/* A T42 edition is sold as "t42:<slug>" — 't42:t42-nov-2026'. Its price is
   NOT in the catalogue above: it lives on the edition's own row
   (t42_challenges.price_rm), read with the service role, so a new edition
   is an insert and not a redeploy. The browser still names only the SKU. */
function t42Slug(sku: string): string | null {
  const m = /^t42:([a-z0-9-]{3,60})$/.exec(String(sku || ''));
  return m ? m[1] : null;
}

/* Bayarcash transaction status: 3 = Success (0 New · 1 Pending · 2 Failed · 4 Cancelled) */
function isPaidStatus(s: unknown) {
  return String(s) === '3' || String(s).toLowerCase() === 'success';
}

/* ═══════════════════════════════════════════════════════════════
   HITFAT+ · plus-landing
   The webhook of a program's landing-page form (Bayarcash Link). A
   successful payment is recorded in plus_landing_purchases against the
   buyer's email; when they sign in to HITFAT+ with that email, the app
   claims it and the program opens on their account (33-plus-landing.sql).

   URL:  …/functions/v1/plus-landing?sku=prog_wl30&key=<secret>
   The secret is plus_settings.landing_webhook_key — admins copy the whole
   address from plus-admin.html. A request without it records nothing.
   Only a program sold on its own (plus_landing_sku) is accepted.

   The form's payload is read leniently, as t42-purchase reads it, and kept
   whole in `raw`. Where the order can be looked up on Bayarcash with
   BAYARCASH_TOKEN, a payment Bayarcash does not show as paid is refused.

   Deploy:  supabase functions deploy plus-landing --no-verify-jwt
   ═══════════════════════════════════════════════════════════════ */


/* the programs sold on their own — the same list as plus_landing_sku() */
const LANDING_SKUS = ['prog_wl30'];

/* First non-empty value among several possible field names, nested too. */
function pick(o: Record<string, unknown>, keys: string[]): string {
  for (const k of keys) {
    const parts = k.split('.');
    let v: unknown = o;
    for (const p of parts) v = (v && typeof v === 'object') ? (v as Record<string, unknown>)[p] : undefined;
    if (v !== undefined && v !== null && String(v).trim() !== '') return String(v).trim();
  }
  return '';
}
function paidStatus(s: string): boolean | null {
  if (!s) return null;
  const v = s.toLowerCase();
  if (v === '3' || v === 'success' || v === 'successful' || v === 'paid' || v === 'completed') return true;
  if (['0', '1', '2', '4', 'new', 'pending', 'failed', 'cancelled', 'canceled', 'unsuccessful'].includes(v)) return false;
  return null;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ ok: false, error: 'Method not allowed' }, 405);

  const url = new URL(req.url);
  const key = url.searchParams.get('key') || '';
  const sku = url.searchParams.get('sku') || '';
  if (!LANDING_SKUS.includes(sku) || CATALOGUE[sku]?.kind !== 'program') return json({ ok: false, error: 'unknown product' }, 400);

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } },
  );

  const { data: secret } = await admin.from('plus_settings').select('value').eq('key', 'landing_webhook_key').maybeSingle();
  if (!secret || !key || key !== secret.value) return json({ ok: false, error: 'unauthorised' }, 401);

  let p: Record<string, unknown> = {};
  try {
    const ct = req.headers.get('content-type') || '';
    if (ct.includes('application/json')) p = await req.json();
    else { const f = await req.formData(); f.forEach((v, k) => { p[k] = typeof v === 'string' ? v : String(v); }); }
  } catch { return json({ ok: false, error: 'unreadable body' }, 400); }

  const status = pick(p, ['status', 'transaction_status', 'payment_status', 'data.status', 'transaction.status']);
  if (paidStatus(status) === false) return json({ ok: true, ignored: 'not paid', status });

  const email = pick(p, ['payer_email', 'email', 'customer_email', 'buyer_email', 'data.payer_email', 'customer.email', 'payer.email']).toLowerCase();
  const order = pick(p, ['order_number', 'order_no', 'reference', 'ref_no', 'data.order_number', 'transaction.order_number']);
  const name  = pick(p, ['payer_name', 'name', 'customer_name', 'data.payer_name', 'customer.name', 'payer.name']);
  const phone = pick(p, ['payer_telephone_number', 'phone', 'telephone', 'mobile', 'customer.phone', 'payer.phone']);
  const amount = Number(pick(p, ['amount', 'total', 'grand_total', 'data.amount']).replace(/[^\d.]/g, '')) || null;
  if (!email || email.indexOf('@') < 0) return json({ ok: false, error: 'no email in payload' }, 400);

  /* Ask Bayarcash, where we can. Not found is not a refusal — the form may
     sit on a portal this token does not see — but "found and not paid" is. */
  const token = Deno.env.get('BAYARCASH_TOKEN');
  if (token && order) {
    try {
      const r = await fetch('https://api.console.bayar.cash/v3/transactions?order_number=' + encodeURIComponent(order),
        { headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token } });
      if (r.ok) {
        const d = await r.json();
        const list = Array.isArray(d) ? d : (d && d.data) || [];
        if (list.length && !list.some((t: { status?: unknown }) => paidStatus(String(t.status)) === true)) {
          return json({ ok: false, error: 'Bayarcash does not show this order as paid' }, 409);
        }
      }
    } catch { /* lookup is a second check, not the first */ }
  }

  const row = { sku, email, name: name || null, phone: phone || null,
                order_number: order || null, amount, source: 'landing', raw: p };
  const { error } = order
    ? await admin.from('plus_landing_purchases').upsert(row, { onConflict: 'order_number', ignoreDuplicates: true })
    : await admin.from('plus_landing_purchases').insert(row);
  if (error) { console.error('plus-landing insert failed', error.message); return json({ ok: false }, 500); }
  return json({ ok: true, sku });
});
