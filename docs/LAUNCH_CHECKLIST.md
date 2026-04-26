# Vireon AI Launch Checklist

## Core app
- [ ] Authentication works in production
- [ ] Dashboard loads
- [ ] Studio image generation works
- [ ] Studio video generation works
- [ ] Assets page loads
- [ ] Gallery loads
- [ ] Creator profiles load
- [ ] Pricing page loads
- [ ] Billing pages load

## Environment variables
- [ ] DATABASE_URL
- [ ] CLERK_SECRET_KEY
- [ ] NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
- [ ] SENTRY_DSN
- [ ] NEXT_PUBLIC_SENTRY_DSN
- [ ] SENTRY_AUTH_TOKEN
- [ ] SENTRY_ORG
- [ ] SENTRY_PROJECT
- [ ] NEXT_PUBLIC_APP_URL
- [ ] REDIS_URL
- [ ] PAYSTACK_SECRET_KEY
- [ ] PAYSTACK_WEBHOOK_SECRET
- [ ] PAYSTACK_PLAN_STARTER
- [ ] PAYSTACK_PLAN_CREATOR
- [ ] PAYSTACK_PLAN_PRO
- [ ] ADMIN_USER_IDS
- [ ] AI_IMAGE_PROVIDER
- [ ] AI_VIDEO_PROVIDER
- [ ] REPLICATE_API_TOKEN
- [ ] REPLICATE_IMAGE_MODEL
- [ ] REPLICATE_VIDEO_MODEL
- [ ] CLOUDINARY_CLOUD_NAME
- [ ] CLOUDINARY_API_KEY
- [ ] CLOUDINARY_API_SECRET
- [ ] UPSTASH_REDIS_REST_URL
- [ ] UPSTASH_REDIS_REST_TOKEN

## Workers
- [ ] Generation worker deployed
- [ ] Scene worker deployed
- [ ] Project export worker deployed
- [ ] Redis connected
- [ ] Failed jobs visible in admin
- [ ] Stuck jobs can be retried

## Payments
- [ ] Paystack checkout opens
- [ ] Webhook URL configured
- [ ] Successful payment grants credits
- [ ] Duplicate webhook does not double-credit
- [ ] Failed/cancelled payment does not grant credits
- [ ] Billing history shows purchase
- [ ] Credit ledger records deductions/refunds

## AI generation
- [ ] Image generation deducts credits
- [ ] Failed image generation refunds credits
- [ ] Video generation deducts credits
- [ ] Failed video generation refunds credits
- [ ] Provider failure reason is stored
- [ ] Cloudinary stores outputs
- [ ] Fallback provider works

## Multi-scene video
- [ ] Create video project
- [ ] Add/edit/delete scenes
- [ ] Reorder scenes
- [ ] Generate scene image
- [ ] Generate scene video
- [ ] Export combined video
- [ ] Failed export refunds credits
- [ ] Publish exported video to gallery

## SEO
- [ ] /sitemap.xml works
- [ ] /robots.txt works
- [ ] Homepage metadata works
- [ ] Gallery metadata works
- [ ] Public asset pages work
- [ ] Creator profile metadata works
- [ ] JSON-LD appears on public pages

## Mobile
- [ ] Homepage responsive
- [ ] Dashboard responsive
- [ ] Studio responsive
- [ ] Gallery responsive
- [ ] Asset modal responsive
- [ ] Video projects responsive
- [ ] Billing responsive

## Admin
- [ ] Admin dashboard protected
- [ ] User management works
- [ ] Payment audit works
- [ ] Generation monitor works
- [ ] Credit adjustment audit works
- [ ] Moderation queue works
- [ ] Prompt safety logs available
