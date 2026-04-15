/**
 * Supabase Edge Function: expire-listings
 *
 * Automatically expires listings that are past their expires_at date.
 * Also deactivates featured listings whose featured_until has passed.
 *
 * Deploy: supabase functions deploy expire-listings
 *
 * Schedule with pg_cron (run in SQL editor):
 *   select cron.schedule('expire-listings', '0 * * * *', $$
 *     select net.http_post(
 *       url := 'https://<project-ref>.supabase.co/functions/v1/expire-listings',
 *       headers := '{"Authorization": "Bearer <service-role-key>"}'::jsonb
 *     )
 *   $$);
 *
 * OR schedule via Supabase Dashboard > Edge Functions > Schedules
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async (_req) => {
  const now = new Date().toISOString();

  // 1. Expire listings past their expires_at
  const { data: expired, error: expireError } = await supabase
    .from('listings')
    .update({ is_active: false, status: 'expired' })
    .lt('expires_at', now)
    .eq('is_active', true)
    .in('status', ['approved'])
    .select('id, title');

  if (expireError) {
    console.error('Error expiring listings:', expireError);
    return new Response(JSON.stringify({ error: expireError.message }), { status: 500 });
  }

  // 2. Remove featured status from listings whose featured_until has passed
  const { data: unfeatured, error: unfeaturedError } = await supabase
    .from('listings')
    .update({ is_featured: false, featured_until: null })
    .lt('featured_until', now)
    .eq('is_featured', true)
    .select('id, title');

  if (unfeaturedError) {
    console.error('Error unfeaturing listings:', unfeaturedError);
    return new Response(JSON.stringify({ error: unfeaturedError.message }), { status: 500 });
  }

  const result = {
    expired_count: expired?.length ?? 0,
    unfeatured_count: unfeatured?.length ?? 0,
    expired_ids: expired?.map(l => l.id) ?? [],
    unfeatured_ids: unfeatured?.map(l => l.id) ?? [],
    timestamp: now,
  };

  console.log('Expiry run complete:', result);

  return new Response(JSON.stringify(result), {
    headers: { 'Content-Type': 'application/json' },
  });
});
