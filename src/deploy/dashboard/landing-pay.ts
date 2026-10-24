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
  "prog_lad4": { price: 39, kind: "program" },      // Ladies Burn 30 (RM39 from 19 Oct 2026)
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
  "prog_d6": { price: 39, kind: "program" },        // DIET 6 MINGGU 6KG · sold on its own, also on its landing page
  "prog_hx12": { price: 149, kind: "program" },     // HYROX 12-Week Race Ready (from HITFAT Hybrid, 19 Oct 2026)
  "prog_hx8": { price: 99, kind: "program" },       // HYROX 8-Week Race Prep
  "prog_hxft": { price: 19, kind: "program" },      // HYROX First Timer
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
  "sub_plus_6m":   { price: 179, kind: "pass", days: 183 },
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
   HITFAT+ · landing-pay
   A program bought straight from its landing page, on Bayarcash itself
   (24 Oct 2026, Seth: "aku nk guna bayarcash saja", not a Bayarcash Link
   form). The buyer has no account yet, so this is pay-create without the
   sign-in: the landing page sends the SKU and who is paying, never a price.

   POST ?action=create    {sku, name, email, phone, channel}
        → records the order (plus_landing_orders), opens a payment intent,
          returns {url}. Back to SITE + the program's berjaya page with the
          order number.
   POST ?action=callback  Bayarcash, server to server, signed: verified as
        pay-callback verifies (HMAC with BAYARCASH_SECRET), amount checked.
   GET  ?action=status&order=…  the berjaya page asking; pending orders are
        looked up on Bayarcash (the pull path, so a late callback cannot
        strand her). Answers the status only, nothing personal.

   Paid → a row of plus_landing_purchases, once; the app's claim (order
   number or email) opens the program on whichever account signs in.

   Deploy:  supabase functions deploy landing-pay --no-verify-jwt
   Secrets: BAYARCASH_TOKEN · BAYARCASH_PORTAL_KEY · BAYARCASH_SECRET (as pay-create)
            META_CAPI_TOKEN (Events Manager, Conversions API; optional)
   GET  ?action=capi-test&order=HL…&code=TEST…  a paid order's Purchase to
        Events Manager's Test events only, to check the Conversions API.
   ═══════════════════════════════════════════════════════════════ */


/* the programs sold on their own, and the page each comes back to */
const LANDING: Record<string, string> = {
  prog_lad4: '/ladies/berjaya/',            // Ladies Burn 30, RM39
};

function admin() {
  return createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } });
}

/* Bayarcash's signature, as pay-callback checks it */
const SIGNED = ['amount', 'order_number', 'payer_email', 'payer_name', 'payment_channel'];
function hmacOf(p: Record<string, unknown>, keys: string[], secret: string): string {
  const body = keys.filter((k) => p[k] !== undefined && p[k] !== null).sort().map((k) => String(p[k]).trim()).join('|');
  return createHmac('sha256', secret).update(body).digest('hex');
}
function same(x: string, y: string): boolean {
  const e = new TextEncoder(), a = e.encode(x), b = e.encode(y);
  return a.length === b.length && timingSafeEqual(a, b);
}
/* What Bayarcash's transaction callback really signs (24 Oct 2026, found on
   the first real payment, which the two checks below refused): these
   thirteen, sorted by key, a missing one as an empty value, joined with
   "|", untrimmed — bayarcash-php-sdk verifyTransactionCallbackData. */
const TX_SIGNED = ['record_type', 'transaction_id', 'exchange_reference_number', 'exchange_transaction_id', 'order_number',
  'currency', 'amount', 'payer_name', 'payer_email', 'payer_bank_name', 'status', 'status_description', 'datetime'];
function hmacExact(p: Record<string, unknown>, keys: string[], secret: string): string {
  const body = keys.slice().sort().map((k) => (p[k] === undefined || p[k] === null) ? '' : String(p[k])).join('|');
  return createHmac('sha256', secret).update(body).digest('hex');
}
function verify(p: Record<string, unknown>, secret: string): boolean {
  const given = String(p.checksum || '').toLowerCase();
  if (!given) return false;
  if (same(hmacExact(p, TX_SIGNED, secret), given)) return true;
  const every = Object.keys(p).filter((k) => k !== 'checksum');
  return same(hmacOf(p, SIGNED, secret), given) || same(hmacOf(p, every, secret), given);
}

/* Meta Conversions API (24 Oct 2026, Seth: "ok teruskan"). The Purchase the
   berjaya page sends from the browser, sent again from here once Bayarcash
   has confirmed it, under the same event id (lad4-<order>), so Meta counts
   it once and still sees it when the browser's Pixel was blocked. Email and
   phone go hashed (SHA-256); no health, meal or body data. Without the
   META_CAPI_TOKEN secret this does nothing. */
const PIXEL_ID = '1860516742038949';                  // HITFAT+ Pixel, as ladies/index.html
const EVENT_ID: Record<string, string> = { prog_lad4: 'lad4-' };   // as ladies/berjaya's eventID
const LANDING_PAGE: Record<string, string> = { prog_lad4: '/ladies/' };
async function sha256(s: string): Promise<string> {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return Array.from(new Uint8Array(d), (x) => x.toString(16).padStart(2, '0')).join('');
}
/* Meta wants the phone with its country code, digits only: 012… → 6012… */
function phoneIntl(p: string): string {
  const d = String(p || '').replace(/\D/g, '');
  return d.startsWith('0') ? '6' + d : d;
}
async function sendCapi(o: any, testCode = ''): Promise<{ ok: boolean; detail: string }> {
  const TOKEN = Deno.env.get('META_CAPI_TOKEN');
  if (!TOKEN) return { ok: false, detail: 'no token' };
  const m = (o.meta && typeof o.meta === 'object') ? o.meta : {};
  const user: Record<string, unknown> = { country: [await sha256('my')] };
  if (o.email) user.em = [await sha256(String(o.email).trim().toLowerCase())];
  if (o.phone && phoneIntl(o.phone).length >= 9) user.ph = [await sha256(phoneIntl(o.phone))];
  if (m.fbp) user.fbp = m.fbp;
  if (m.fbc) user.fbc = m.fbc;
  if (m.ip) user.client_ip_address = m.ip;
  if (m.ua) user.client_user_agent = m.ua;
  const body: Record<string, unknown> = {
    access_token: TOKEN,
    data: [{
      event_name: 'Purchase', event_time: Math.floor(Date.now() / 1000),
      event_id: (EVENT_ID[o.sku] || o.sku + '-') + o.order_number,
      action_source: 'website', event_source_url: SITE + (LANDING_PAGE[o.sku] || '/'),
      user_data: user,
      custom_data: { value: Number(o.amount), currency: 'MYR', content_ids: [o.sku], content_type: 'product', order_id: o.order_number },
    }],
  };
  if (testCode) body.test_event_code = testCode;
  try {
    const r = await fetch('https://graph.facebook.com/v21.0/' + PIXEL_ID + '/events', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    const d = await r.json().catch(() => null);
    if (!r.ok) {
      console.error('landing-pay: capi refused', r.status, d?.error?.message || '');
      return { ok: false, detail: String(d?.error?.message || r.status) };
    }
    return { ok: true, detail: 'events_received ' + String(d?.events_received ?? '?') };
  } catch (e) {
    console.error('landing-pay: capi failed', String(e));
    return { ok: false, detail: 'network' };
  }
}

/* An order Bayarcash says is paid, for at least its price: record it once.
   The purchase row is what the app claims; upsert so a retry is a no-op.
   Only the call that turns it paid tells Meta, so a callback and the
   berjaya page's status check arriving together send one Purchase. */
async function markPaid(db: any, o: any, tx: string, paid: number): Promise<boolean> {
  if (!(paid >= Number(o.amount))) {
    await db.from('plus_landing_orders').update({ status: 'failed', note: 'amount ' + paid + ' < ' + o.amount })
      .eq('order_number', o.order_number).neq('status', 'paid');
    return false;
  }
  const { error } = await db.from('plus_landing_purchases').upsert({
    sku: o.sku, email: o.email, name: o.name, phone: o.phone, order_number: o.order_number,
    amount: o.amount, source: 'landing', raw: { via: 'landing-pay', transaction_id: tx || null },
  }, { onConflict: 'order_number', ignoreDuplicates: true });
  if (error) { console.error('landing-pay: purchase insert failed', error.message); return false; }
  const { data: turned } = await db.from('plus_landing_orders').update({ status: 'paid', transaction_id: tx || null, paid_at: new Date().toISOString() })
    .eq('order_number', o.order_number).neq('status', 'paid').select('order_number');
  if (turned && turned.length) {
    const c = await sendCapi(o);
    if (c.ok) await db.from('plus_landing_orders').update({ capi_sent_at: new Date().toISOString() }).eq('order_number', o.order_number);
  }
  return true;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  const action = new URL(req.url).searchParams.get('action') || '';

  try {
    /* ── create: the landing page's Bayar button ── */
    if (action === 'create' && req.method === 'POST') {
      const TOKEN = Deno.env.get('BAYARCASH_TOKEN'), PORTAL = Deno.env.get('BAYARCASH_PORTAL_KEY');
      if (!TOKEN || !PORTAL) return json({ error: 'Bayaran belum tersedia.' }, 500);
      let b: any = {}; try { b = await req.json(); } catch { /* checked below */ }
      const sku = String(b?.sku || '');
      if (!LANDING[sku] || CATALOGUE[sku]?.kind !== 'program') return json({ error: 'Produk tidak dikenali.' }, 400);
      const name = String(b?.name || '').replace(/\s+/g, ' ').trim().slice(0, 60);
      const email = String(b?.email || '').trim().toLowerCase().slice(0, 120);
      const phone = String(b?.phone || '').replace(/[^\d+]/g, '').slice(0, 16);
      if (name.length < 2) return json({ error: 'Masukkan nama anda.' }, 400);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return json({ error: 'Emel tidak sah.' }, 400);
      if (phone.replace(/\D/g, '').length < 9) return json({ error: 'Masukkan no. telefon penuh.' }, 400);
      const channel = CHANNELS.indexOf(Number(b?.channel)) > -1 ? Number(b.channel) : 1;
      const price = CATALOGUE[sku].price;

      const rnd = crypto.getRandomValues(new Uint8Array(6)), tail = Array.from(rnd, (x) => (x % 36).toString(36)).join('').toUpperCase();
      const order_number = 'HL' + Date.now().toString(36).toUpperCase() + tail;
      const db = admin();
      /* what Meta needs to match the Purchase to the ad later (sendCapi) */
      const fb = (v: unknown) => { const s = String(v || '').trim(); return /^fb\.\d\.\d+\.[\w.-]{1,200}$/.test(s) ? s : ''; };
      const meta = {
        fbp: fb(b?.fbp), fbc: fb(b?.fbc),
        ip: (req.headers.get('x-forwarded-for') || '').split(',')[0].trim().slice(0, 64),
        ua: (req.headers.get('user-agent') || '').slice(0, 400),
      };
      const { error: oErr } = await db.from('plus_landing_orders').insert({ order_number, sku, email, name, phone, amount: price, channel, meta });
      if (oErr) return json({ error: 'Pesanan tidak dapat dimulakan.', detail: oErr.message }, 500);

      const amount = Number(price).toFixed(2);
      const intent: Record<string, unknown> = {
        payment_channel: channel, portal_key: PORTAL, order_number, amount,
        payer_name: name, payer_email: email, payer_telephone_number: phone,
        return_url: SITE + LANDING[sku] + '?order_number=' + encodeURIComponent(order_number),
        callback_url: (Deno.env.get('SUPABASE_URL') || '') + '/functions/v1/landing-pay?action=callback',
        metadata: sku,
      };
      const SECRET = Deno.env.get('BAYARCASH_SECRET');
      if (SECRET) {
        const parts: Record<string, unknown> = { payment_channel: channel, order_number, amount, payer_name: name, payer_email: email };
        intent.checksum = createHmac('sha256', SECRET)
          .update(Object.keys(parts).sort().map((k) => String(parts[k]).trim()).join('|')).digest('hex');
      }
      const res = await fetch(BC_API + '/payment-intents', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + TOKEN }, body: JSON.stringify(intent),
      });
      const d = await res.json().catch(() => null);
      if (!res.ok || !d || !d.url) {
        await db.from('plus_landing_orders').update({ status: 'failed', note: JSON.stringify(d).slice(0, 400) }).eq('order_number', order_number);
        console.error('landing-pay: intent failed', res.status, JSON.stringify(d).slice(0, 400));
        return json({ error: 'Halaman bayaran tidak dapat dibuka. Cuba lagi.' }, 502);
      }
      return json({ url: d.url, order_number });
    }

    /* ── callback: Bayarcash, signed ── */
    if (action === 'callback' && req.method === 'POST') {
      const SECRET = Deno.env.get('BAYARCASH_SECRET');
      if (!SECRET) { console.error('landing-pay: BAYARCASH_SECRET missing'); return json({ ok: false }, 500); }
      let p: Record<string, unknown> = {};
      const ct = req.headers.get('content-type') || '';
      if (ct.includes('application/json')) p = await req.json();
      else { const f = await req.formData(); f.forEach((v, k) => { p[k] = typeof v === 'string' ? v : String(v); }); }
      if (!verify(p, SECRET)) { console.warn('landing-pay: bad checksum', String(p.order_number || ''), 'fields', Object.keys(p).sort().join(',')); return json({ ok: false, error: 'bad_checksum' }, 401); }
      const db = admin();
      const { data: o } = await db.from('plus_landing_orders').select('*').eq('order_number', String(p.order_number || '')).maybeSingle();
      if (!o) return json({ ok: false }, 404);                        // not an order we made
      if (o.status === 'paid') return json({ ok: true, already: true });
      if (!isPaidStatus(p.status)) {
        await db.from('plus_landing_orders').update({ status: 'failed', note: 'status=' + String(p.status) })
          .eq('order_number', o.order_number).neq('status', 'paid');
        return json({ ok: true });
      }
      const ok = await markPaid(db, o, String(p.transaction_id || p.id || ''), Number(String(p.amount ?? '').replace(/[^\d.]/g, '')));
      return json({ ok });
    }

    /* ── status: the berjaya page asking ── */
    if (action === 'status') {
      const order = (new URL(req.url).searchParams.get('order') || '').trim().slice(0, 40);
      if (!/^HL[A-Z0-9]+$/.test(order)) return json({ status: 'unknown' });
      const db = admin();
      const { data: o } = await db.from('plus_landing_orders').select('*').eq('order_number', order).maybeSingle();
      if (!o) return json({ status: 'unknown' });
      if (o.status !== 'pending') return json({ status: o.status, sku: o.sku });
      /* still open here: ask Bayarcash */
      const TOKEN = Deno.env.get('BAYARCASH_TOKEN');
      if (TOKEN) {
        try {
          const r = await fetch(BC_API + '/transactions?order_number=' + encodeURIComponent(order),
            { headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + TOKEN } });
          if (r.ok) {
            const d = await r.json();
            const list: any[] = Array.isArray(d) ? d : (d && d.data) || [];
            const won = list.find((t) => isPaidStatus(t.status));
            if (won && await markPaid(db, o, String(won.id || won.transaction_id || ''), Number(String(won.amount ?? '').replace(/[^\d.]/g, ''))))
              return json({ status: 'paid', sku: o.sku });
            if (list.length && list.every((t) => ['2', '4'].includes(String(t.status)))) {
              await db.from('plus_landing_orders').update({ status: 'failed', note: 'bayarcash status' }).eq('order_number', order).eq('status', 'pending');
              return json({ status: 'failed', sku: o.sku });
            }
          }
        } catch { /* stays pending; the callback may still come */ }
      }
      return json({ status: 'pending', sku: o.sku });
    }

    /* ── capi-test: a paid order's Purchase again, to Events Manager's Test
          events tab only (test_event_code is required, so it never counts) ── */
    if (action === 'capi-test') {
      const q = new URL(req.url).searchParams;
      const order = (q.get('order') || '').trim().slice(0, 40), code = (q.get('code') || '').trim().slice(0, 40);
      if (!/^HL[A-Z0-9]+$/.test(order) || !/^TEST\w+$/.test(code)) return json({ ok: false, error: 'order and code' }, 400);
      const { data: o } = await admin().from('plus_landing_orders').select('*').eq('order_number', order).eq('status', 'paid').maybeSingle();
      if (!o) return json({ ok: false, error: 'not a paid order' }, 404);
      return json(await sendCapi(o, code));
    }

    return json({ error: 'Unknown action' }, 400);
  } catch (e) {
    console.error('landing-pay crashed', e);
    return json({ error: 'Ralat. Cuba lagi.' }, 500);
  }
});
