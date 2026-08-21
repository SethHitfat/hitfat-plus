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

import { createClient } from 'jsr:@supabase/supabase-js@2';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { CORS, json, isPaidStatus } from '../_shared/catalogue.ts';
import { grant } from '../_shared/grant.ts';

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
