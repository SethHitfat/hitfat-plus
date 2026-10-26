/* One place that turns a settled order into an entitlement, so the push path
   (pay-callback) and the pull path (pay-status) can never grant differently.
   Two code paths granting the same purchase is exactly how one of them ends
   up giving away a program the other charges for. */

import { entitlementFor, t42Slug, CATALOGUE } from './catalogue.ts';

export async function grant(admin: any, user_id: string, sku: string, order_number: string, tx: string) {
  /* A T42 place is not a plus_entitlements row. The registration IS the
     entitlement — one edition, one person — so paying turns that row from
     pending to paid, and nothing else in HITFAT+ changes. */
  const slug = t42Slug(sku);
  if (slug) {
    const { data: ch } = await admin.from('t42_challenges').select('id').eq('slug', slug).maybeSingle();
    if (!ch) { console.error('grant for unknown T42 edition', slug); return false; }
    const { error: rErr } = await admin.from('t42_registrations')
      .update({ status: 'paid', product_sku: sku })
      .eq('challenge_id', ch.id).eq('user_id', user_id).eq('status', 'pending');
    if (rErr) { console.error('T42 grant failed', rErr.message); return false; }
    await admin.from('plus_orders')
      .update({ status: 'paid', transaction_id: tx || null, paid_at: new Date().toISOString() })
      .eq('order_number', order_number);
    return true;
  }

  const row = entitlementFor(sku, order_number);
  if (!row) { console.error('grant for unknown sku', sku); return false; }

  /* A membership bought while one of the same tier is still running starts
     where that one ends. Renewing early must add months, not overwrite them. */
  if (sku.startsWith('sub_') || sku.startsWith('scan_d')) {
    /* a Meal Scan add-on renews the same way, by its own SKU */
    const tier = sku.startsWith('scan_d') ? sku : sku.startsWith('sub_coach') ? 'sub_coach' : 'sub_plus';
    const { data: live } = await admin.from('plus_entitlements')
      .select('expires_at').eq('user_id', user_id).like('sku', tier + '%')
      .gt('expires_at', new Date().toISOString())
      .order('expires_at', { ascending: false }).limit(1);
    const from = live && live[0] ? new Date(live[0].expires_at) : new Date();
    const days = CATALOGUE[sku]?.days ?? 0;
    from.setDate(from.getDate() + days);
    row.expires_at = from.toISOString();
  }

  const { error } = await admin.from('plus_entitlements').insert({ ...row, user_id });

  /* 23505 = the unique index on (user_id, sku) for programs. A duplicate here
     means a retry landed twice, which is success, not failure. */
  if (error && error.code !== '23505') { console.error('grant failed', error.message); return false; }

  await admin.from('plus_orders')
    .update({ status: 'paid', transaction_id: tx || null, paid_at: new Date().toISOString() })
    .eq('order_number', order_number);
  await commission(admin, user_id, sku, order_number);
  return true;
}

/* An affiliate's commission for an order that came through her link (26 Oct
   2026). The rules (approved code, not her own purchase, the rate) are in
   plus_commission_record; the order number is unique there, so the push and
   pull paths both calling this records it once. Never blocks the grant. */
async function commission(admin: any, user_id: string, sku: string, order_number: string) {
  try {
    const { data: o } = await admin.from('plus_orders').select('ref, amount').eq('order_number', order_number).maybeSingle();
    if (!o || !o.ref) return;
    const { data: u } = await admin.auth.admin.getUserById(user_id);
    const { error } = await admin.rpc('plus_commission_record', { p_order: order_number, p_source: 'app', p_sku: sku,
      p_sale: o.amount, p_ref: o.ref, p_buyer: user_id, p_email: u?.user?.email || null });
    if (error) console.error('commission failed', error.message);
  } catch (e) { console.error('commission crashed', String(e)); }
}
