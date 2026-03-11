// Supabase Edge Function
// Deploy as: hospitable-review-webhook
// Env required:
// - SUPABASE_URL
// - SUPABASE_SERVICE_ROLE_KEY
// - HOSPITABLE_WEBHOOK_TOKEN

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function normalizePlatform(input?: string) {
  const value = String(input || '').toLowerCase();
  if (value.includes('book')) return 'booking';
  if (value.includes('vrbo')) return 'vrbo';
  return 'airbnb';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const expectedToken = Deno.env.get('HOSPITABLE_WEBHOOK_TOKEN');
  const url = new URL(req.url);
  const providedToken =
    req.headers.get('x-webhook-token') ||
    req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ||
    url.searchParams.get('token');

  if (!expectedToken || providedToken !== expectedToken) {
    return json({ error: 'Unauthorized' }, 401);
  }

  const payload = await req.json().catch(() => ({}));
  const eventType = payload?.event || payload?.type || payload?.event_type || '';

  if (!String(eventType).toLowerCase().includes('review')) {
    return json({ ok: true, ignored: true, reason: 'Not a review event' });
  }

  const source = payload?.data?.review || payload?.review || payload?.data || payload;
  const externalId =
    source?.id ||
    source?.review_id ||
    source?.external_id ||
    source?.uid ||
    crypto.randomUUID();

  const guestName =
    source?.guest_name ||
    source?.reviewer_name ||
    source?.author ||
    source?.guest ||
    'Guest';

  const reviewText =
    source?.text ||
    source?.review_text ||
    source?.comment ||
    source?.message ||
    '';

  if (!reviewText) {
    return json({ ok: true, ignored: true, reason: 'Review text missing' });
  }

  const reviewDateRaw = source?.review_date || source?.created_at || source?.date || null;
  const reviewDate = reviewDateRaw ? new Date(reviewDateRaw).toISOString() : null;

  const normalized = {
    listing_slug: source?.listing_slug || 'deer-valley-basecamp',
    external_id: String(externalId),
    platform: normalizePlatform(source?.platform || source?.source || source?.channel),
    guest_name: String(guestName),
    review_text: String(reviewText),
    rating: Number(source?.rating || source?.stars || 5) || 5,
    review_date: reviewDate,
    date_text: source?.date_text || null,
    published: true,
    raw_payload: payload,
  };

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const { error } = await supabase
    .from('public_reviews')
    .upsert(normalized, { onConflict: 'external_id' });

  if (error) return json({ error: error.message }, 500);

  return json({ ok: true });
});
