/* ═══════════════════════════════════════════════════════════════
   Single-file build for the Supabase dashboard editor, which takes one
   file per function. The shared catalogue and grant helper are inlined
   below instead of imported.

   Generated — do not hand-edit. The source of truth is
   deploy/<name>/index.ts plus deploy/_shared/.
   ═══════════════════════════════════════════════════════════════ */


import { createClient } from 'jsr:@supabase/supabase-js@2';
import { createHmac, timingSafeEqual } from 'node:crypto';

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
  "scan_c20": { price: 19, kind: "credits", credits: 20 },
  "scan_c60": { price: 45, kind: "credits", credits: 60 },
  "scan_m": { price: 19, kind: "pass", days: 30 },
  "scan_y": { price: 99, kind: "pass", days: 365 },
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

/* Bayarcash transaction status: 3 = Success (0 New · 1 Pending · 2 Failed · 4 Cancelled) */
function isPaidStatus(s: unknown) {
  return String(s) === '3' || String(s).toLowerCase() === 'success';
}

/* ── inlined from _shared/grant.ts ── */
/* One place that turns a settled order into an entitlement, so the push path
   (pay-callback) and the pull path (pay-status) can never grant differently.
   Two code paths granting the same purchase is exactly how one of them ends
   up giving away a program the other charges for. */


async function grant(admin: any, user_id: string, sku: string, order_number: string, tx: string) {
  const row = entitlementFor(sku, order_number);
  if (!row) { console.error('grant for unknown sku', sku); return false; }

  const { error } = await admin.from('plus_entitlements').insert({ ...row, user_id });

  /* 23505 = the unique index on (user_id, sku) for programs. A duplicate here
     means a retry landed twice, which is success, not failure. */
  if (error && error.code !== '23505') { console.error('grant failed', error.message); return false; }

  await admin.from('plus_orders')
    .update({ status: 'paid', transaction_id: tx || null, paid_at: new Date().toISOString() })
    .eq('order_number', order_number);
  return true;
}

/* ═══════════════════════════════════════════════════════════════
   HITFAT+ · pay-callback
   Bayarcash calls this server-to-server when a payment settles.

   Hybrid points its callback_url at /.netlify/functions/pay-callback, and
   that file does not exist — so nothing ever lands there and every unlock
   depends on the buyer coming back and the app polling. That works, but a
   buyer who closes the tab stays locked out until they open the app again.
   This function makes the push path real; pay-status still provides the
   pull path as a backstop, so a lost callback cannot strand a payment.

   Deployed with --no-verify-jwt, because Bayarcash has no user session.
   That is exactly why the checksum below is not optional: without it,
   anyone who learns the URL could POST a fake "paid" and grant themselves
   the catalogue.

   Deploy:  supabase functions deploy pay-callback --no-verify-jwt
   Secrets: BAYARCASH_SECRET
   ═══════════════════════════════════════════════════════════════ */


/* Bayarcash signs these five, sorted by key, joined with "|" */
const SIGNED = ['amount', 'order_number', 'payer_email', 'payer_name', 'payment_channel'];

function verify(payload: Record<string, unknown>, secret: string): boolean {
  const given = String(payload.checksum || '');
  if (!given) return false;
  const body = SIGNED
    .filter((k) => payload[k] !== undefined && payload[k] !== null)
    .sort()
    .map((k) => String(payload[k]).trim())
    .join('|');
  const mine = createHmac('sha256', secret).update(body).digest('hex');
  const a = Buffer.from(mine, 'utf8'), b = Buffer.from(given, 'utf8');
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);          // constant time — a plain === leaks the answer a byte at a time
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST')    return json({ error: 'Method not allowed' }, 405);

  const SECRET = Deno.env.get('BAYARCASH_SECRET');
  if (!SECRET) { console.error('BAYARCASH_SECRET missing — refusing to trust any callback'); return json({ ok: false }, 500); }

  try {
    /* Bayarcash may post JSON or form-encoded depending on portal settings */
    let p: Record<string, unknown> = {};
    const ct = req.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      p = await req.json();
    } else {
      const f = await req.formData();
      f.forEach((v, k) => { p[k] = typeof v === 'string' ? v : String(v); });
    }

    if (!verify(p, SECRET)) {
      console.warn('callback rejected: bad checksum', String(p.order_number || ''));
      return json({ ok: false, error: 'bad_checksum' }, 401);
    }

    const order_number = String(p.order_number || '');
    if (!order_number) return json({ ok: false, error: 'no_order' }, 400);

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } },
    );

    const { data: order } = await admin
      .from('plus_orders')
      .select('order_number, user_id, sku, amount, status')
      .eq('order_number', order_number)
      .maybeSingle();

    /* An order we never created is not ours to honour, however well signed. */
    if (!order) { console.warn('callback for unknown order', order_number); return json({ ok: false }, 404); }

    if (!isPaidStatus(p.status)) {
      await admin.from('plus_orders')
        .update({ status: 'failed', note: 'status=' + String(p.status) })
        .eq('order_number', order_number).neq('status', 'paid');
      return json({ ok: true });
    }

    /* The signed amount must match what we charged. A valid signature over a
       different number is still somebody paying RM1 for RM149 of programs. */
    const paid = Number(String(p.amount ?? '').replace(/[^\d.]/g, ''));
    if (!(paid >= Number(order.amount))) {
      console.warn('callback amount mismatch', order_number, paid, order.amount);
      await admin.from('plus_orders')
        .update({ status: 'failed', note: 'amount ' + paid + ' < ' + order.amount })
        .eq('order_number', order_number).neq('status', 'paid');
      return json({ ok: false, error: 'amount_mismatch' }, 400);
    }

    if (order.status === 'paid') return json({ ok: true, already: true });   // Bayarcash retries; do not double-grant

    await grant(admin, order.user_id, order.sku, order_number,
                String(p.transaction_id || p.id || ''));

    return json({ ok: true });

  } catch (e) {
    console.error('pay-callback crashed', e);
    return json({ ok: false }, 500);
  }
});
