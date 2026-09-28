/* ═══════════════════════════════════════════════════════════════
   T42 · paying for one edition

   A T42 purchase is not a catalogue item. Every edition is its own product
   — November, Ramadan, Merdeka — with its own price, so the price lives on
   the edition's row in t42_challenges (admin-written, never the browser's)
   and a new edition is an INSERT, not a redeploy of this function.

   The SKU is 't42:<slug>'. What it buys is ONE registration becoming
   'paid' for THAT edition. It does not touch plus_entitlements: buying T42
   does not unlock HITFAT+ programs, and a November payment does not unlock
   Ramadan. The registration row is the entitlement, and the database
   (t42_reg_entitled, t42_can_read_plan) is what enforces it.
   ═══════════════════════════════════════════════════════════════ */

export const T42_PREFIX = 't42:';

export function isT42Sku(sku: string) {
  return typeof sku === 'string' && sku.indexOf(T42_PREFIX) === 0;
}

/* Today in Malaysia, as the database's t42_today() sees it. */
function t42TodayISO() {
  return new Date(Date.now() + 8 * 3600 * 1000).toISOString().slice(0, 10);
}

type T42Offer =
  | { ok: true; price: number; challenge_id: string; name: string }
  | { ok: false; status: number; error: string; code?: string };

/* What a buyer is allowed to pay for, and how much. Every refusal here is
   one a buyer could otherwise have paid into: a closed edition, a free one,
   one they have not signed up for, or one they already own. */
export async function t42Offer(admin: any, sku: string, user_id: string): Promise<T42Offer> {
  const slug = sku.slice(T42_PREFIX.length);
  const { data: ch } = await admin
    .from('t42_challenges')
    .select('id, name, price, status, reg_closes_on')
    .eq('slug', slug).maybeSingle();
  if (!ch || ch.status === 'draft') return { ok: false, status: 400, error: 'Unknown item.' };
  if (ch.status !== 'registration' && ch.status !== 'running') {
    return { ok: false, status: 409, error: 'Registration for this T42 is closed.', code: 'closed' };
  }
  if (ch.reg_closes_on && t42TodayISO() > String(ch.reg_closes_on).slice(0, 10)) {
    return { ok: false, status: 409, error: 'Registration for this T42 is closed.', code: 'closed' };
  }
  const price = Number(ch.price || 0);
  if (!(price > 0)) return { ok: false, status: 400, error: 'This T42 needs no payment.', code: 'free' };

  const { data: reg } = await admin
    .from('t42_registrations')
    .select('id, status')
    .eq('challenge_id', ch.id).eq('user_id', user_id).maybeSingle();
  if (!reg) {
    return { ok: false, status: 409, error: 'Finish signing up for T42 first.', code: 'not_registered' };
  }
  if (reg.status === 'paid' || reg.status === 'active' || reg.status === 'completed') {
    return { ok: false, status: 409, error: 'You are already in this T42.', code: 'already_owned' };
  }
  if (reg.status !== 'pending') {
    return { ok: false, status: 403, error: 'This registration cannot be paid for.' };
  }
  return { ok: true, price, challenge_id: ch.id, name: ch.name };
}

/* The grant. Idempotent: a retried callback finds the row already paid and
   reports success rather than failure. */
export async function t42Grant(admin: any, user_id: string, sku: string) {
  const slug = sku.slice(T42_PREFIX.length);
  const { data: ch } = await admin
    .from('t42_challenges').select('id').eq('slug', slug).maybeSingle();
  if (!ch) { console.error('t42 grant for unknown edition', slug); return false; }

  const { error } = await admin.from('t42_registrations')
    .update({ status: 'paid' })
    .eq('challenge_id', ch.id).eq('user_id', user_id).eq('status', 'pending');
  if (error) { console.error('t42 grant failed', error.message); return false; }

  const { data: reg } = await admin.from('t42_registrations')
    .select('status').eq('challenge_id', ch.id).eq('user_id', user_id).maybeSingle();
  return !!reg && (reg.status === 'paid' || reg.status === 'active' || reg.status === 'completed');
}
