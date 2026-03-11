# Hospitable Reviews Automation (Deer Valley Basecamp)

This site is static HTML, so webhooks must be handled outside the website host.
Use Supabase Edge Functions to receive Hospitable review events and expose a public JSON feed.

## 1) Create table

Run [`reviews_schema.sql`](./reviews_schema.sql) in Supabase SQL Editor.

## 2) Deploy Edge Functions

Deploy both files:

- `hospitable_review_webhook.ts` as function name `hospitable-review-webhook`
- `public_reviews_feed.ts` as function name `public-reviews`

Set function environment variables:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `HOSPITABLE_WEBHOOK_TOKEN` (only for `hospitable-review-webhook`)

## 3) Configure Hospitable webhook

In Hospitable Webhooks:

- URL:
  `https://<your-project-ref>.functions.supabase.co/hospitable-review-webhook?token=<HOSPITABLE_WEBHOOK_TOKEN>`
- Event type: reviews (new review events)

## 4) Connect website feed

In [`reviews.html`](../../reviews.html), set:

```html
<script>
  window.DEER_VALLEY_REVIEWS_FEED_URL = 'https://<your-project-ref>.functions.supabase.co/public-reviews?listing=deer-valley-basecamp';
</script>
```

The page already has fallback local reviews. Once feed URL is set and webhook is active, new reviews will appear automatically.

## 5) Quick test

Open:

`https://<your-project-ref>.functions.supabase.co/public-reviews?listing=deer-valley-basecamp`

Expected:

```json
{
  "listing": "deer-valley-basecamp",
  "count": 1,
  "reviews": [
    {
      "id": "...",
      "platform": "airbnb",
      "guest_name": "Guest",
      "text": "Great stay",
      "rating": 5,
      "date": "2026-03-10T00:00:00.000Z",
      "date_text": null
    }
  ]
}
```
