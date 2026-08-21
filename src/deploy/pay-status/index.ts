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

import { createClient } from 'jsr:@supabase/supabase-js@2';
import { BC_API, CORS, json, isPaidStatus } from '../_shared/catalogue.ts';
import { grant } from '../_shared/grant.ts';

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
