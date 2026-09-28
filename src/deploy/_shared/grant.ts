/* One place that turns a settled order into an entitlement, so the push path
   (pay-callback) and the pull path (pay-status) can never grant differently.
   Two code paths granting the same purchase is exactly how one of them ends
   up giving away a program the other charges for. */

import { entitlementFor, t42Slug } from './catalogue.ts';

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

  const { error } = await admin.from('plus_entitlements').insert({ ...row, user_id });

  /* 23505 = the unique index on (user_id, sku) for programs. A duplicate here
     means a retry landed twice, which is success, not failure. */
  if (error && error.code !== '23505') { console.error('grant failed', error.message); return false; }

  await admin.from('plus_orders')
    .update({ status: 'paid', transaction_id: tx || null, paid_at: new Date().toISOString() })
    .eq('order_number', order_number);
  return true;
}
