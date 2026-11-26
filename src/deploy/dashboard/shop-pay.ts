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
  "prog_ay30": { price: 39, kind: "program" },      // AYAH2FIT 30
  "prog_mula": { price: 59, kind: "program" },      // THE START (RM59 since 12 Nov 2026; RM49 on 11 Nov)
  "prog_sync30": { price: 59, kind: "program" },    // HITFAT SYNC 30, on its own page app.hitfat.io/sync (24 Nov 2026)
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

/* A final no. 0 and 1 are not: DuitNow QR sends 1 before the buyer has paid. */
function isFailedStatus(s: unknown) {
  return ['2', '4', 'failed', 'cancelled'].includes(String(s).toLowerCase());
}

/* ═══════════════════════════════════════════════════════════════
   HITFAT · shop-pay
   The HITFAT Performance tee, bought on app.hitfat.io/shop and paid on
   Bayarcash (26 Nov 2026, Seth: "setiap sehelai baju 69, tapi kalau dia
   beli 3, dia akan jatuh pada 59 sehelai … terus sambung dengan bayar
   cash … QR dengan … standard yang kita buat sebelum ni").

   A sibling of landing-pay, kept apart so the programs' checkout is never
   touched by the shop. The page sends what is in the cart (colour, size,
   how many) and who is paying, never a price: the price is worked out here.

   POST ?action=create    {items:[{c,s,q}], name, email, phone, channel, delivery, address}
        → records the order (shop_orders), opens a Bayarcash payment intent,
          returns {url}. Back to SITE/shop/berjaya/?order_number=…
   POST ?action=callback  Bayarcash, server to server, signed (as landing-pay).
   GET  ?action=status&order=HS…  the berjaya page asking; a pending order is
        looked up on Bayarcash. Answers the status and the order's lines only.

   Deploy:  supabase functions deploy shop-pay --no-verify-jwt
   Secrets: BAYARCASH_TOKEN · BAYARCASH_PORTAL_KEY · BAYARCASH_SECRET (already set)
   Table:   60-shop-orders.sql
   ═══════════════════════════════════════════════════════════════ */


/* ── THE SHOP: the only place a price is trusted ── */
const PRICE_ONE = 69;          // RM, one or two tees
const PRICE_BULK = 59;         // RM each, 3 tees or more (any colours, any sizes)
const BULK_FROM = 3;
const MAX_QTY = 30;            // one order; more than this, WhatsApp us
const COLOURS: Record<string, string> = {
  'merah-putih': 'Merah Putih',
  'hitam-teal': 'Hitam Teal',
  'hitam-merah': 'Hitam Merah',
  'hitam-neon': 'Hitam Neon',
};
const SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', '6XL'];
/* How it reaches the buyer. Postage is null until Seth gives the rate, and an
   option with a null price is refused, so nobody is charged a made-up fee. */
const DELIVERY: Record<string, { label: string; fee: number | null }> = {
  ambil: { label: 'Ambil di HITFAT Kota Bharu', fee: 0 },
  pos: { label: 'Pos ke rumah', fee: null },
};

export function priceOf(qty: number): number { return qty >= BULK_FROM ? PRICE_BULK : PRICE_ONE; }

function admin() {
  return createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } });
}

/* Bayarcash's signature: the same three checks landing-pay makes */
const SIGNED = ['amount', 'order_number', 'payer_email', 'payer_name', 'payment_channel'];
const TX_SIGNED = ['record_type', 'transaction_id', 'exchange_reference_number', 'exchange_transaction_id', 'order_number',
  'currency', 'amount', 'payer_name', 'payer_email', 'payer_bank_name', 'status', 'status_description', 'datetime'];
function hmacOf(p: Record<string, unknown>, keys: string[], secret: string): string {
  const body = keys.filter((k) => p[k] !== undefined && p[k] !== null).sort().map((k) => String(p[k]).trim()).join('|');
  return createHmac('sha256', secret).update(body).digest('hex');
}
function hmacExact(p: Record<string, unknown>, keys: string[], secret: string): string {
  const body = keys.slice().sort().map((k) => (p[k] === undefined || p[k] === null) ? '' : String(p[k])).join('|');
  return createHmac('sha256', secret).update(body).digest('hex');
}
function same(x: string, y: string): boolean {
  const e = new TextEncoder(), a = e.encode(x), b = e.encode(y);
  return a.length === b.length && timingSafeEqual(a, b);
}
function verify(p: Record<string, unknown>, secret: string): boolean {
  const given = String(p.checksum || '').toLowerCase();
  if (!given) return false;
  if (same(hmacExact(p, TX_SIGNED, secret), given)) return true;
  const every = Object.keys(p).filter((k) => k !== 'checksum');
  return same(hmacOf(p, SIGNED, secret), given) || same(hmacOf(p, every, secret), given);
}

/* the cart as the page sent it → clean lines, same colour+size merged */
function cleanItems(raw: unknown): { c: string; s: string; q: number }[] | null {
  if (!Array.isArray(raw) || !raw.length || raw.length > 40) return null;
  const m: Record<string, number> = {};
  for (const it of raw) {
    const c = String((it as any)?.c || ''), s = String((it as any)?.s || ''), q = Math.floor(Number((it as any)?.q));
    if (!COLOURS[c] || SIZES.indexOf(s) < 0 || !(q >= 1 && q <= MAX_QTY)) return null;
    m[c + '|' + s] = (m[c + '|' + s] || 0) + q;
  }
  return Object.keys(m).map((k) => ({ c: k.split('|')[0], s: k.split('|')[1], q: m[k] }));
}

async function markPaid(db: any, o: any, tx: string, paid: number): Promise<boolean> {
  if (!(paid >= Number(o.amount))) {
    await db.from('shop_orders').update({ status: 'failed', note: 'amount ' + paid + ' < ' + o.amount })
      .eq('order_number', o.order_number).neq('status', 'paid');
    return false;
  }
  await db.from('shop_orders').update({ status: 'paid', transaction_id: tx || null, paid_at: new Date().toISOString() })
    .eq('order_number', o.order_number).neq('status', 'paid');
  return true;
}

/* what the berjaya page may show: the lines and the total, nothing personal */
function summary(o: any) {
  return { status: o.status, items: o.items, qty: o.qty, unit: o.unit_price, amount: Number(o.amount), delivery: o.delivery };
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  const q = new URL(req.url).searchParams, action = q.get('action') || '';

  try {
    /* ── create: the shop's Bayar button ── */
    if (action === 'create' && req.method === 'POST') {
      const TOKEN = Deno.env.get('BAYARCASH_TOKEN'), PORTAL = Deno.env.get('BAYARCASH_PORTAL_KEY');
      if (!TOKEN || !PORTAL) return json({ error: 'Bayaran belum tersedia.' }, 500);
      let b: any = {}; try { b = await req.json(); } catch { /* checked below */ }
      const items = cleanItems(b?.items);
      if (!items) return json({ error: 'Troli tidak sah. Pilih warna dan saiz semula.' }, 400);
      const qty = items.reduce((n, x) => n + x.q, 0);
      if (qty > MAX_QTY) return json({ error: 'Lebih ' + MAX_QTY + ' helai? WhatsApp kami untuk tempahan pukal.' }, 400);
      const name = String(b?.name || '').replace(/\s+/g, ' ').trim().slice(0, 60);
      const email = String(b?.email || '').trim().toLowerCase().slice(0, 120);
      const phone = String(b?.phone || '').replace(/[^\d+]/g, '').slice(0, 16);
      if (name.length < 2) return json({ error: 'Masukkan nama anda.' }, 400);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return json({ error: 'Emel tidak sah.' }, 400);
      if (phone.replace(/\D/g, '').length < 9) return json({ error: 'Masukkan no. telefon penuh.' }, 400);
      const dk = String(b?.delivery || 'ambil'), dv = DELIVERY[dk];
      if (!dv || dv.fee === null) return json({ error: 'Cara terima ini belum dibuka.' }, 400);
      let address: Record<string, string> | null = null;
      if (dk === 'pos') {
        const a = b?.address || {};
        address = { line: String(a.line || '').trim().slice(0, 200), poskod: String(a.poskod || '').replace(/\D/g, '').slice(0, 5),
          bandar: String(a.bandar || '').trim().slice(0, 60), negeri: String(a.negeri || '').trim().slice(0, 40) };
        if (address.line.length < 8 || address.poskod.length !== 5 || !address.bandar || !address.negeri)
          return json({ error: 'Lengkapkan alamat penghantaran.' }, 400);
      }
      const channel = CHANNELS.indexOf(Number(b?.channel)) > -1 ? Number(b.channel) : 1;
      const unit = priceOf(qty), amountN = unit * qty + Number(dv.fee);
      const lines = items.map((x) => ({ ...x, warna: COLOURS[x.c] }));

      const rnd = crypto.getRandomValues(new Uint8Array(6)), tail = Array.from(rnd, (x) => (x % 36).toString(36)).join('').toUpperCase();
      const order_number = 'HS' + Date.now().toString(36).toUpperCase() + tail;
      const db = admin();
      const { error: oErr } = await db.from('shop_orders').insert({
        order_number, email, name, phone, items: lines, qty, unit_price: unit, delivery: dk, delivery_fee: dv.fee,
        address, amount: amountN, channel,
        meta: { ip: (req.headers.get('x-forwarded-for') || '').split(',')[0].trim().slice(0, 64), ua: (req.headers.get('user-agent') || '').slice(0, 400) },
      });
      if (oErr) return json({ error: 'Pesanan tidak dapat dimulakan.', detail: oErr.message }, 500);

      const amount = amountN.toFixed(2);
      const intent: Record<string, unknown> = {
        payment_channel: channel, portal_key: PORTAL, order_number, amount,
        payer_name: name, payer_email: email, payer_telephone_number: phone,
        return_url: SITE + '/shop/berjaya/?order_number=' + encodeURIComponent(order_number),
        callback_url: (Deno.env.get('SUPABASE_URL') || '') + '/functions/v1/shop-pay?action=callback',
        metadata: 'shop_tee',
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
        await db.from('shop_orders').update({ status: 'failed', note: JSON.stringify(d).slice(0, 400) }).eq('order_number', order_number);
        console.error('shop-pay: intent failed', res.status, JSON.stringify(d).slice(0, 400));
        return json({ error: 'Halaman bayaran tidak dapat dibuka. Cuba lagi.' }, 502);
      }
      return json({ url: d.url, order_number });
    }

    /* ── callback: Bayarcash, signed ── */
    if (action === 'callback' && req.method === 'POST') {
      const SECRET = Deno.env.get('BAYARCASH_SECRET');
      if (!SECRET) { console.error('shop-pay: BAYARCASH_SECRET missing'); return json({ ok: false }, 500); }
      let p: Record<string, unknown> = {};
      const ct = req.headers.get('content-type') || '';
      if (ct.includes('application/json')) p = await req.json();
      else { const f = await req.formData(); f.forEach((v, k) => { p[k] = typeof v === 'string' ? v : String(v); }); }
      if (!verify(p, SECRET)) { console.warn('shop-pay: bad checksum', String(p.order_number || '')); return json({ ok: false, error: 'bad_checksum' }, 401); }
      const db = admin();
      const { data: o } = await db.from('shop_orders').select('*').eq('order_number', String(p.order_number || '')).maybeSingle();
      if (!o) return json({ ok: false }, 404);
      if (o.status === 'paid') return json({ ok: true, already: true });
      if (!isPaidStatus(p.status)) {
        if (isFailedStatus(p.status)) await db.from('shop_orders').update({ status: 'failed', note: 'status=' + String(p.status) })
          .eq('order_number', o.order_number).neq('status', 'paid');
        return json({ ok: true });
      }
      return json({ ok: await markPaid(db, o, String(p.transaction_id || p.id || ''), Number(String(p.amount ?? '').replace(/[^\d.]/g, ''))) });
    }

    /* ── status: the berjaya page asking ── */
    if (action === 'status') {
      const order = (q.get('order') || '').trim().slice(0, 40);
      if (!/^HS[A-Z0-9]+$/.test(order)) return json({ status: 'unknown' });
      const db = admin();
      const { data: o } = await db.from('shop_orders').select('*').eq('order_number', order).maybeSingle();
      if (!o) return json({ status: 'unknown' });
      if (o.status !== 'pending') return json(summary(o));
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
              return json({ ...summary(o), status: 'paid' });
            if (list.length && list.every((t) => isFailedStatus(t.status))) {
              await db.from('shop_orders').update({ status: 'failed', note: 'bayarcash status' }).eq('order_number', order).eq('status', 'pending');
              return json({ ...summary(o), status: 'failed' });
            }
          }
        } catch { /* stays pending; the callback may still come */ }
      }
      return json(summary(o));
    }

    return json({ error: 'Unknown action' }, 400);
  } catch (e) {
    console.error('shop-pay crashed', e);
    return json({ error: 'Ralat. Cuba lagi.' }, 500);
  }
});
