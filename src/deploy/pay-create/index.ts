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

import { createClient } from 'jsr:@supabase/supabase-js@2';
import { createHmac } from 'node:crypto';
import { CATALOGUE, CHANNELS, BC_API, SITE, CORS, json, t42Slug, t42ModePrice } from '../_shared/catalogue.ts';

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
    const slug = t42Slug(sku);
    const item = slug ? null : CATALOGUE[sku];
    if (!slug && !item) return json({ error: 'Unknown item.' }, 400);
    let price = item ? item.price : 0;

    const channel = CHANNELS.indexOf(Number(body?.channel)) > -1 ? Number(body.channel) : 1;

    /* A T42 place: one edition, priced on its own row. The buyer must have
       signed up (the pending registration) and not already be in. */
    if (slug) {
      const { data: ch } = await admin.from('t42_challenges')
        .select('id, status, price_rm, gym_price_rm, reg_closes_on').eq('slug', slug).maybeSingle();
      if (!ch || ['registration', 'running'].indexOf(ch.status) < 0) {
        return json({ error: 'This T42 is not taking new participants.' }, 400);
      }
      const today = new Date().toISOString().slice(0, 10);
      if (ch.reg_closes_on && today > String(ch.reg_closes_on)) {
        return json({ error: 'Registration for this T42 has closed.' }, 400);
      }
      const { data: reg } = await admin.from('t42_registrations')
        .select('id, status, mode').eq('challenge_id', ch.id).eq('user_id', user.id).maybeSingle();
      if (!reg) return json({ error: 'Finish your T42 sign-up first.' }, 400);
      if (reg.status !== 'pending') return json({ error: 'You are already in this T42.', code: 'already_owned' }, 409);
      /* Gym Duo has its own price (per person); the mode is read from the
         buyer's own registration, never from the request. */
      price = t42ModePrice(ch, reg.mode);
      if (!(price > 0)) return json({ error: 'Payment for this T42 is not open yet.' }, 400);
    }

    /* Buying something you already own is a refund request waiting to happen.
       Credits and passes may be bought again; a program may not. */
    if (item && (item.kind === 'program' || item.kind === 'bar')) {
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
      order_number, user_id: user.id, sku, amount: price, status: 'pending', channel,
    });
    if (oErr) return json({ error: 'Could not start the order.', detail: oErr.message }, 500);

    /* Ringgit with two decimals. Bayarcash reads a bare 19 as ambiguous, and
       the existing Hybrid forms all send "199.00". */
    const amount = Number(price).toFixed(2);
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
