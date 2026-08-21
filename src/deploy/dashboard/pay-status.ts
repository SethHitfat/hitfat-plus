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
   HITFAT+ · pay-status
   The pull path. After returning from the gateway the app calls this; it
   asks Bayarcash directly about any order still pending and grants what has
   actually settled.

   pay-callback is the fast path, but a callback can be lost, delayed, or
   rejected for a checksum mismatch. Without this, that payment strands. With
   it, the worst case is the buyer waiting until they reopen the app.

   Deploy:  supabase functions deploy pay-status
   Secrets: BAYARCASH_TOKEN
   ═══════════════════════════════════════════════════════════════ */


async function bcStatus(order_number: string, token: string) {
  try {
    const r = await fetch(BC_API + '/transactions?order_number=' + encodeURIComponent(order_number), {
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    });
    if (!r.ok) return { paid: false, error: 'http_' + r.status };
    const d = await r.json();
    const list = Array.isArray(d) ? d : (d && d.data) || [];
    const hit = list.find((t: any) => isPaidStatus(t.status));
    return { paid: !!hit, tx: hit ? String(hit.id || hit.transaction_id || '') : '' };
  } catch (e) { return { paid: false, error: String(e) }; }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  try {
    /* The caller's own token decides whose orders are checked. Hybrid took
       user_id from the query string, which let anyone read another buyer's
       purchases just by knowing their id. */
    const auth  = req.headers.get('Authorization') || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
    if (!token) return json({ error: 'Sign in first.' }, 401);

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } },
    );
    const { data: ud, error: uErr } = await admin.auth.getUser(token);
    const user = ud?.user;
    if (uErr || !user || !user.id || user.role === 'anon') return json({ error: 'Sign in first.' }, 401);

    const BC_TOKEN = Deno.env.get('BAYARCASH_TOKEN');
    let granted = 0;

    if (BC_TOKEN) {
      const { data: pending } = await admin
        .from('plus_orders')
        .select('order_number, sku')
        .eq('user_id', user.id).eq('status', 'pending')
        .order('created_at', { ascending: false }).limit(10);

      for (const o of (pending || [])) {
        const v = await bcStatus(o.order_number, BC_TOKEN);
        if (v.paid && await grant(admin, user.id, o.sku, o.order_number, v.tx || '')) granted++;
      }
    }

    const { data: ents } = await admin
      .from('plus_entitlements')
      .select('sku, kind, credits_left, expires_at')
      .eq('user_id', user.id);

    return json({ granted, entitlements: ents || [] });

  } catch (e) {
    console.error('pay-status crashed', e);
    return json({ error: 'Could not check your purchases.' }, 500);
  }
});
