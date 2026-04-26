# Deployment Notes

## Web app
Deploy the Next.js web app normally.

Recommended:
- Vercel for web
- Render background workers
- Neon/Supabase/Postgres for DB
- Upstash/Redis for queues/rate limits
- Cloudinary for media storage

## Required worker services

### Generation worker
```bash
cd apps/web && pnpm worker:generation
```

### Scene worker
```bash
cd apps/web && pnpm worker:scenes
```

### Project export worker
```bash
cd apps/web && pnpm worker:project-export
```

## Paystack webhook
Production webhook URL:
`https://your-domain.com/api/billing/paystack/webhook`

## Important
The web app alone is not enough. Workers must be running for:
- image/video completion
- scene generation
- project export
