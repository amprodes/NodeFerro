# NodeFerro

NodeFerro is a Vite + React frontend with Vercel serverless APIs for checkout, order management, and shipping quotes.

## Implemented Backend Routes

- `POST /api/checkout/create-payment-intent`
- `POST /api/checkout/confirm`
- `GET /api/orders/:id`
- `POST /api/shipping/quote`
- `GET /api/health`

The API supports PostgreSQL via `DATABASE_URL`. If no database is configured, it falls back to an in-memory store for demo/dev behavior.

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Create your env file:

```bash
cp .env.example .env
```

3. Run frontend:

```bash
npm run dev
```

## Production Environment Variables

Set these in Vercel Project Settings -> Environment Variables:

- `DATABASE_URL`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `ORDER_FROM_EMAIL`
- `VITE_API_URL` (optional; leave empty for same-origin calls)

## GitHub + Vercel Deployment

1. Initialize and push to GitHub:

```bash
git init
git add .
git commit -m "feat: nodeferro backend, checkout integration, and SEO"
gh repo create nodeferro --public --source=. --remote=origin --push
```

2. Import the GitHub repo in Vercel and deploy.

3. In Vercel, add all required environment variables.

4. Redeploy.

## SEO and AI Discoverability

Implemented:

- Canonical URL and rich meta tags in `index.html`
- Open Graph and Twitter cards
- JSON-LD structured data (`Organization`, `WebSite`, `Product`)
- `public/robots.txt`
- `public/sitemap.xml`
- `public/llms.txt`

Remember to replace the placeholder domain (`https://nodeferro.ai`) with your final domain in:

- `index.html`
- `public/robots.txt`
- `public/sitemap.xml`
- `public/llms.txt`
