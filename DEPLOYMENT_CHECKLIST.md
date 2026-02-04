# Production Deployment Checklist

This document tracks everything needed for production deployment of Money Transfer Comparison.

## Pre-Deployment

- [ ] Environment variables configured (see `.env.example`)
- [ ] Database URL set for PostgreSQL (if using)
- [ ] VERCEL_CRON_SECRET generated (if using Vercel)
- [ ] All smoke tests passing: `npm run smoke`
- [ ] Code reviewed and merged to main branch

## Deployment Files

### Configuration Files
- [x] `vercel.json` - Vercel cron configuration
- [x] `Dockerfile` - Production Docker image
- [x] `docker-compose.prod.yml` - Docker Compose with scheduler
- [x] `.env.example` - Environment variables template

### Systemd Service Files
- [x] `money-transfer-comparison.service` - Main app service
- [x] `fetch-live-quotes.service` - Background fetch job
- [x] `fetch-live-quotes.timer` - Cron-like scheduler (10-min interval)

### API Routes
- [x] `src/app/api/cron/fetch-live-quotes/route.ts` - Vercel cron endpoint

### Documentation
- [x] `DEPLOYMENT.md` - Complete deployment guide (4 platforms)
- [x] `OPS_GUIDE.md` - Operations team quick reference
- [x] `README.md` - Updated with "Background Rate Updates" section

## Deployment by Platform

### Vercel
- [ ] Push to Git repository
- [ ] Create Vercel project from repository
- [ ] Set environment variables:
  - [ ] `VERCEL_CRON_SECRET` (recommended)
  - [ ] `DATABASE_URL` (if PostgreSQL)
- [ ] Verify cron job appears in Vercel dashboard
- [ ] Test manual trigger: POST `/api/cron/fetch-live-quotes`

### Docker + Docker Compose
- [ ] Build image: `docker build -t money-transfer-comparison:latest .`
- [ ] Set environment variables in docker-compose.prod.yml
- [ ] Start services: `docker-compose -f docker-compose.prod.yml up -d`
- [ ] Verify scheduler container is running: `docker ps`
- [ ] Check logs: `docker logs -f scheduler`
- [ ] Verify web app is accessible

### Systemd (Linux VPS)
- [ ] Clone repository to `/opt/money-transfer-comparison`
- [ ] Install Node.js 20+
- [ ] Run: `npm ci && npm run build`
- [ ] Create app user: `useradd -r -s /bin/bash app-user`
- [ ] Copy systemd files to `/etc/systemd/system/`:
  - [ ] `money-transfer-comparison.service`
  - [ ] `fetch-live-quotes.service`
  - [ ] `fetch-live-quotes.timer`
- [ ] Enable and start services:
  - [ ] `systemctl enable --now money-transfer-comparison.service`
  - [ ] `systemctl enable --now fetch-live-quotes.timer`
- [ ] Verify: `systemctl status money-transfer-comparison.service`
- [ ] Verify timer: `systemctl list-timers fetch-live-quotes.timer`

### Cron (Legacy Linux)
- [ ] Clone repository and install
- [ ] Add to crontab: `*/10 * * * * cd /path && npm run fetch:live-quotes`
- [ ] Verify: `sudo crontab -l`
- [ ] Monitor: `tail -f /var/log/money-transfer-quotes.log`

## Post-Deployment Verification

### Web Application
- [ ] Home page loads: `curl http://localhost:3000`
- [ ] Comparison page works: `curl http://localhost:3000/gbp-to-ngn`
- [ ] API endpoint works: `curl http://localhost:3000/api/providers`
- [ ] Health check passes (Docker): `curl http://localhost:3000/api/providers`

### Background Job
- [ ] Fetch job runs successfully (check logs)
- [ ] Fetch job scheduled (check systemd/cron/Vercel)
- [ ] Database updated with latest rates (if fetch succeeded)
- [ ] Mock rates displayed if fetch failed (graceful fallback)

### Monitoring Setup
- [ ] Logs aggregated (Vercel/CloudWatch/journalctl)
- [ ] Alerts configured for fetch failures
- [ ] Dashboard shows fetch job status
- [ ] Health check monitoring enabled

## Rollback Plan

### If Deployment Fails

**Immediate (within 10 minutes):**
1. Web UI continues serving cached rates
2. Rollback code to previous version
3. Restart application
4. Verify fetch job resumes

**For Vercel:**
```bash
vercel rollback
```

**For Docker:**
```bash
docker-compose -f docker-compose.prod.yml down
# Tag and run previous image
docker tag money-transfer-comparison:previous money-transfer-comparison:latest
docker-compose -f docker-compose.prod.yml up -d
```

**For Systemd:**
```bash
cd /opt/money-transfer-comparison
git revert HEAD
npm run build
systemctl restart money-transfer-comparison.service
```

## Key Architecture Points

✅ **UI never blocks on provider APIs** - Always serves cached rates instantly
✅ **Background job runs separately** - No impact on web server performance
✅ **Graceful degradation** - Mock rates displayed if fetch fails
✅ **Automatic recovery** - Failed fetch retries in 10 minutes
✅ **Zero-downtime updates** - New code can be deployed while job runs
✅ **Production-ready** - Suitable for high-traffic environments

## Support Resources

| Document | Purpose |
|----------|---------|
| README.md | Architecture overview, getting started |
| DEPLOYMENT.md | Detailed deployment guide for each platform |
| OPS_GUIDE.md | Operations team quick reference |
| .env.example | Environment variables documentation |

## Sign-Off

- [ ] Deployment reviewed by tech lead
- [ ] Operations team acknowledged OPS_GUIDE.md
- [ ] All environment variables verified
- [ ] Monitoring and alerting configured
- [ ] Rollback plan documented and tested

---

**Deployment Date:** ___________  
**Deployed By:** ___________  
**Approved By:** ___________
