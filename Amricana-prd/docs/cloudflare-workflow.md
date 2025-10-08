# Cloudflare Deployment Workflow

This guide summarizes the end-to-end workflow for deploying the SSDP frontend and API gateway to Cloudflare.

## 1. Prepare Environment
- Install Wrangler globally: `npm install -g wrangler`
- Ensure Node.js 18+ is available for the Next.js build
- Export credentials before running deployments:
  ```bash
  export CLOUDFLARE_ACCOUNT_ID=xxxxx
  export CLOUDFLARE_API_TOKEN=xxxxx
  export CLOUDFLARE_PAGES_PROJECT=ssdp-dashboard   # optional override
  export CLOUDFLARE_PAGES_BRANCH=production        # optional override
  ```

## 2. Configure Frontend Environment Variables
- Copy `apps/ssdp-web/.env.example` to `.env`
- Adjust for each environment (local vs staging vs production)
  - `NEXT_PUBLIC_DISTRIBUTION_API` → FastAPI base URL (`https://api.internal.brainsait.com`)
  - `NEXT_PUBLIC_WORKER_API` → Cloudflare Worker URL (`https://ssdp-api.<account>.workers.dev`)
- Mirror the same variables inside Cloudflare Pages project settings

## 3. Build & Deploy
Run the orchestrated script from the repository root:
```bash
npm run deploy:cloudflare
```
This performs:
1. Installs frontend dependencies
2. Runs `npx @cloudflare/next-on-pages build` to emit `.vercel/output/`
3. Deploys the static bundle & edge functions to Cloudflare Pages
4. Installs worker dependencies & deploys `cf-workers/ssdp-api`

## 4. Post-Deployment Checks
- Access the Pages URL to verify the dashboard (ensure live data renders)
- Hit `https://ssdp-api.<account>.workers.dev/health` for Worker status
- Confirm analytics/vehicles/outlets sections updating with live API data
- Monitor Cloudflare dashboards for deployment logs and analytics

## 5. GitHub Sync & CI/CD
- Commit changes locally: `git add . && git commit -m "feat: enhance dashboard UI and cloudflare deploy"`
- Push to remote GitHub repository: `git push origin main`
- Optional: configure GitHub Actions to run tests (`npm run lint`, `npm run build:web`) then call `npm run deploy:cloudflare`

## 6. Rollback Strategy
- Use `wrangler pages deployments list` to identify previous versions; rerun with `--deployment=<id>` to rollback
- For Workers, `wrangler deployments list ssdp-api` then `wrangler rollback ssdp-api --tag <tag>`

## 7. Observability
- Enable Cloudflare Analytics for Pages & Workers
- Ship logs to your SIEM using Workers Logpush if compliance requires centralized logging
- Update BrainSAIT audit systems with deployment metadata (time, actor, version)

---
Maintaining this workflow keeps the frontend synchronized with the backend services and ensures consistent, auditable deployments across environments.
