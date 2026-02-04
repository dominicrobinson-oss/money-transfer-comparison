# 📚 Production Deployment Documentation Index

Quick navigation guide to all production deployment documentation.

## 🚀 Getting Started

**New to deployment?** Start here:
1. Read [PRODUCTION_SETUP_SUMMARY.md](PRODUCTION_SETUP_SUMMARY.md) (5-minute overview)
2. Choose your platform in [DEPLOYMENT.md](DEPLOYMENT.md)
3. Use [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) during deployment

## 📖 Documentation Files

### For Everyone
- **[README.md](README.md)** - Project overview, features, architecture
  - New section: "Production: Background Rate Updates"
  - Explains why UI never calls provider APIs directly
  - Describes graceful failure handling

### For DevOps/Engineers
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Step-by-step deployment guide
  - Vercel (recommended - easiest)
  - Docker + Docker Compose
  - Linux with Systemd
  - Legacy Linux with Cron
  - Database setup (SQLite vs PostgreSQL)
  - Health checks and monitoring
  - Troubleshooting guide
  - **Read this before deploying**

### For Operations/SRE Teams
- **[OPS_GUIDE.md](OPS_GUIDE.md)** - Quick reference guide
  - Service monitoring (all platforms)
  - Alert thresholds
  - Common issues and solutions
  - Performance baselines
  - Disaster recovery
  - Dashboard setup
  - **Share this with your ops team**

### For Release/Deployment Team
- **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)** - Pre/post deployment
  - Pre-deployment verification
  - Platform-specific checklists
  - Post-deployment verification
  - Rollback procedures
  - Sign-off forms
  - **Use this when deploying to production**

### Quick Reference
- **[PRODUCTION_SETUP_SUMMARY.md](PRODUCTION_SETUP_SUMMARY.md)** - 2-minute overview
  - What was added
  - Architecture diagram
  - Quick deployment paths
  - Environment variables
  - Testing status

## 🔧 Configuration Files

### Deployment Configuration
| File | Platform | Purpose |
|------|----------|---------|
| `vercel.json` | Vercel | Cron configuration (every 10 minutes) |
| `Dockerfile` | Docker | Multi-stage production image |
| `docker-compose.prod.yml` | Docker | Docker Compose with scheduler |
| `.env.example` | All | Environment variables template |

### Systemd Service Files
| File | Purpose |
|------|---------|
| `money-transfer-comparison.service` | Main web application |
| `fetch-live-quotes.service` | Background fetch job |
| `fetch-live-quotes.timer` | Timer (runs job every 10 minutes) |

### Application Code
| File | Purpose |
|------|---------|
| `src/app/api/cron/fetch-live-quotes/route.ts` | Vercel cron endpoint |

## 🎯 Platform Selection Guide

### Choose Vercel if...
- Using Vercel for hosting
- Want automatic cron setup
- Minimal DevOps overhead
- Quick to deploy (2 minutes)
- **Recommended for most teams**

→ Read: DEPLOYMENT.md "Option 1: Vercel"

### Choose Docker if...
- Using Docker for containerization
- Deploying to cloud (AWS, GCP, Azure)
- Prefer container orchestration
- **Most scalable option**

→ Read: DEPLOYMENT.md "Option 2: Docker"

### Choose Systemd if...
- Self-hosted Linux VPS/dedicated server
- Full control needed
- Traditional deployment
- **Most control option**

→ Read: DEPLOYMENT.md "Option 3: Systemd"

### Choose Cron if...
- Legacy Linux system
- No systemd available
- Quick setup needed
- **Simplest option**

→ Read: DEPLOYMENT.md "Option 4: Cron"

## 📋 Deployment Workflow

```
1. READ
   └─→ PRODUCTION_SETUP_SUMMARY.md (overview)
   └─→ Choose platform
   └─→ Read platform section in DEPLOYMENT.md

2. PREPARE
   └─→ Set up environment variables (.env.example)
   └─→ Configure database (if PostgreSQL)
   └─→ Generate VERCEL_CRON_SECRET (if Vercel)

3. DEPLOY
   └─→ Use DEPLOYMENT_CHECKLIST.md
   └─→ Follow platform-specific steps in DEPLOYMENT.md
   └─→ Verify all checks pass

4. VERIFY
   └─→ Test web UI loads
   └─→ Verify fetch job runs
   └─→ Check logs for errors
   └─→ Monitor first 24 hours

5. OPERATE
   └─→ Share OPS_GUIDE.md with ops team
   └─→ Set up monitoring dashboard
   └─→ Configure alerts
   └─→ Document runbooks
```

## 🏗️ Architecture Summary

**Background Rate Fetching** runs every 10 minutes:
- Calls provider APIs (Wise, Remitly, etc.)
- Stores rates in database
- Falls back to mock rates on failure
- **Never blocks the web UI**

**Web UI:**
- Displays cached rates from database
- Always responsive (<500ms load)
- Gracefully handles failures
- **Never calls provider APIs directly**

## 🔒 Security

- Cron endpoint protected with `VERCEL_CRON_SECRET`
- No sensitive data in environment files
- Database credentials managed via `DATABASE_URL`
- All external API calls have timeouts (15s default)

## 📞 Support

**For deployment help:** Read DEPLOYMENT.md  
**For operational help:** Read OPS_GUIDE.md  
**For pre-flight checks:** Read DEPLOYMENT_CHECKLIST.md

## ✅ Status

| Component | Status |
|-----------|--------|
| Code | ✅ Production-ready |
| Tests | ✅ All passing (15/15) |
| Documentation | ✅ Complete (5 guides) |
| Configuration | ✅ Ready (4 platforms) |
| Deployment | ⏳ Ready to begin |

---

**Last Updated:** February 4, 2026  
**Documentation Version:** 1.0  
**Deployment Status:** Ready for production
