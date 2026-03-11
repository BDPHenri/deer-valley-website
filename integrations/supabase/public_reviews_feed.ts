// Supabase Edge Function
// Deploy as: public-reviews
// Env required:
// - SUPABASE_URL
// - SUPABASE_SERVICE_ROLE_KEY

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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'GET') return json({ error: 'Method not allowed' }, 405);

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const url = new URL(req.url);
  const listingSlug = url.searchParams.get('listing') || 'deer-valley-basecamp';
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get('limit') || 50)));

  const { data, error } = await supabase
    .from('public_reviews')
    .select('external_id, platform, guest_name, review_text, rating, review_date, date_text, created_at')
    .eq('listing_slug', listingSlug)
    .eq('published', true)
    .order('review_date', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) return json({ error: error.message }, 500);

  const reviews = (data || []).map((row) => ({
    id: row.external_id,
    platform: row.platform,
    guest_name: row.guest_name,
    text: row.review_text,
    rating: row.rating,
    date: row.review_date,
    date_text: row.date_text,
  }));

  return json({
    listing: listingSlug,
    count: reviews.length,
    reviews,
  });
});
