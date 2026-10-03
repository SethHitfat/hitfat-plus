/* ═══════════════════════════════════════════════════════════════
   HITFAT+ · t42-purchase
   The webhook of the T42 landing-page form (Bayarcash Link, hitfat.bcl.my).
   A successful payment is recorded in t42_purchases against the buyer's
   email; when they sign in to the app with that email, their T42 place is
   confirmed (29-t42-purchases.sql).

   URL:  …/functions/v1/t42-purchase?edition=t42-nov-2026&key=<secret>
   The secret is t42_settings.purchase_webhook_key — only the service role
   can read it. A request without it records nothing.

   The form's payload shape is read leniently (the fields are named
   differently across Bayarcash products) and stored whole in `raw`. Where
   the order can be looked up on Bayarcash with BAYARCASH_TOKEN, a payment
   Bayarcash does not show as paid is refused.

   Deploy:  supabase functions deploy t42-purchase --no-verify-jwt
   ═══════════════════════════════════════════════════════════════ */

import { createClient } from 'jsr:@supabase/supabase-js@2';

const CORS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: CORS });

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
  const edition = url.searchParams.get('edition') || '';

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } },
  );

  const { data: secret } = await admin.from('t42_settings').select('value').eq('key', 'purchase_webhook_key').maybeSingle();
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

  /* Which edition: the URL names it; otherwise the one taking people now. */
  const { data: chs } = edition
    ? await admin.from('t42_challenges').select('id, slug, status').eq('slug', edition).limit(1)
    : await admin.from('t42_challenges').select('id, slug, status')
        .in('status', ['registration', 'running']).order('starts_on', { ascending: false }).limit(1);
  const ch = chs && chs[0];
  if (!ch) return json({ ok: false, error: 'no such T42 edition' }, 404);

  const row = { challenge_id: ch.id, email, name: name || null, phone: phone || null,
                order_number: order || null, amount, source: 'landing', raw: p };
  const { error } = order
    ? await admin.from('t42_purchases').upsert(row, { onConflict: 'order_number', ignoreDuplicates: true })
    : await admin.from('t42_purchases').insert(row);
  if (error) { console.error('t42-purchase insert failed', error.message); return json({ ok: false }, 500); }
  return json({ ok: true, edition: ch.slug });
});
