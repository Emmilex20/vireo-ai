# Production Test Commands

## Workers

Generation worker:

```bash
cd apps/web && pnpm worker:generation
```

Scene worker:

```bash
cd apps/web && pnpm worker:scenes
```

Project export worker:

```bash
cd apps/web && pnpm worker:project-export
```

## Health checks

Open:
- /sitemap.xml
- /robots.txt
- /gallery
- /creators
- /pricing
- /billing
- /admin
