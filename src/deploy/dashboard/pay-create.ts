/* ═══════════════════════════════════════════════════════════════
   Single-file build for the Supabase dashboard editor, which takes one
   file per function. The shared catalogue and grant helper are inlined
   below instead of imported.

   Generated — do not hand-edit. The source of truth is
   deploy/<name>/index.ts plus deploy/_shared/.
   ═══════════════════════════════════════════════════════════════ */


import { createClient } from 'jsr:@supabase/supabase-js@2';
import { createHmac } from 'node:crypto';

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

/* ═══════════════════════════════════════════════════════════════
   HITFAT+ · pay-create
   Creates a Bayarcash payment intent. The access token never reaches the
   browser, and neither does the price: the client sends a SKU, the server
   looks up what it costs.

   Two things this does that the Hybrid version does not:
     · verifies the caller's JWT, so user_id cannot be spoofed. In Hybrid,
       user_id came from the request body — anyone could have paid for
       somebody else's account, or claimed to be an account they do not own.
     · records the order before creating the intent, so a callback can never
       arrive for an order we have no record of.

   Deploy:  supabase functions deploy pay-create
   Secrets: BAYARCASH_TOKEN · BAYARCASH_PORTAL_KEY · BAYARCASH_SECRET
            HITFAT_PLUS_SITE (e.g. https://plus.hitfat.io)
   ═══════════════════════════════════════════════════════════════ */


Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST')    return json({ error: 'Method not allowed' }, 405);

  const TOKEN  = Deno.env.get('BAYARCASH_TOKEN');
  const PORTAL = Deno.env.get('BAYARCASH_PORTAL_KEY');
  if (!TOKEN || !PORTAL) return json({ error: 'Payment is not configured yet.' }, 500);

  try {
    /* ── who is buying ── */
    const auth  = req.headers.get('Authorization') || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
    if (!token) return json({ error: 'Sign in before buying.' }, 401);

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } },
    );
    const { data: ud, error: uErr } = await admin.auth.getUser(token);
    const user = ud?.user;
    if (uErr || !user || !user.id || user.role === 'anon') {
      return json({ error: 'Sign in before buying.' }, 401);
    }
    const email = user.email;
    if (!email) return json({ error: 'Your account has no email address.' }, 400);

    /* ── what they are buying ── */
    let body: any = {};
    try { body = await req.json(); } catch { /* empty body is a missing sku */ }

    const sku  = String(body?.sku || '');
    const item = CATALOGUE[sku];
    if (!item) return json({ error: 'Unknown item.' }, 400);

    const channel = CHANNELS.indexOf(Number(body?.channel)) > -1 ? Number(body.channel) : 1;

    /* Buying something you already own is a refund request waiting to happen.
       Credits and passes may be bought again; a program may not. */
    if (item.kind === 'program' || item.kind === 'bar') {
      const { data: had } = await admin
        .from('plus_entitlements')
        .select('id').eq('user_id', user.id).eq('sku', sku).maybeSingle();
      if (had) return json({ error: 'You already own this.', code: 'already_owned' }, 409);

      if (sku !== 'bundle_all') {
        const { data: bundle } = await admin
          .from('plus_entitlements')
          .select('id').eq('user_id', user.id).eq('sku', 'bundle_all').maybeSingle();
        if (bundle) return json({ error: 'All Access already covers this.', code: 'already_owned' }, 409);
      }
    }

    /* ── record the attempt before creating the intent ── */
    const order_number = 'HP' + Date.now().toString(36).toUpperCase()
                       + Math.random().toString(36).slice(2, 6).toUpperCase();

    const { error: oErr } = await admin.from('plus_orders').insert({
      order_number, user_id: user.id, sku, amount: item.price, status: 'pending', channel,
    });
    if (oErr) return json({ error: 'Could not start the order.', detail: oErr.message }, 500);

    /* Ringgit with two decimals. Bayarcash reads a bare 19 as ambiguous, and
       the existing Hybrid forms all send "199.00". */
    const amount = Number(item.price).toFixed(2);
    const payer_name = String(body?.name || '').trim().slice(0, 60) || 'HITFAT athlete';

    const intent: Record<string, unknown> = {
      payment_channel: channel,
      portal_key: PORTAL,
      order_number,
      amount,
      payer_name,
      payer_email: email,
      return_url:   SITE + '/?paid=' + encodeURIComponent(sku),
      callback_url: (Deno.env.get('SUPABASE_URL') || '') + '/functions/v1/pay-callback',
      metadata: sku,
    };

    /* HMAC over the five fields, sorted by key, joined with "|" — the same
       shape Bayarcash verifies on its side. */
    const SECRET = Deno.env.get('BAYARCASH_SECRET');
    if (SECRET) {
      const parts: Record<string, unknown> = {
        payment_channel: channel, order_number, amount, payer_name, payer_email: email,
      };
      const payload = Object.keys(parts).sort().map((k) => String(parts[k]).trim()).join('|');
      intent.checksum = createHmac('sha256', SECRET).update(payload).digest('hex');
    }

    const res = await fetch(BC_API + '/payment-intents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + TOKEN },
      body: JSON.stringify(intent),
    });
    const d = await res.json().catch(() => null);

    if (!res.ok || !d || !d.url) {
      await admin.from('plus_orders')
        .update({ status: 'failed', note: JSON.stringify(d).slice(0, 400) })
        .eq('order_number', order_number);
      console.error('intent failed', res.status, JSON.stringify(d).slice(0, 400));
      return json({ error: 'Could not open the payment page. Try again.' }, 502);
    }

    return json({ url: d.url, order_number });

  } catch (e) {
    console.error('pay-create crashed', e);
    return json({ error: 'Could not start payment.' }, 500);
  }
});
