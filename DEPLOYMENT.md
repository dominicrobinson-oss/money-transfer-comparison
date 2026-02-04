# Deployment Guide: Money Transfer Comparison

This guide covers production deployment options for the Money Transfer Comparison application with background rate updates.

## Prerequisites

- Node.js 20.9.0 or higher
- npm package manager
- For self-hosted: Linux/Unix server with systemd or cron

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    User Browser                             │
│           (Never makes provider API calls)                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                    (every 10 sec)
                         │
┌────────────────────────▼────────────────────────────────────┐
│                   Next.js App (Web UI)                      │
│  - Displays quotes from database                            │
│  - Redirects to provider websites                           │
│  - Always responsive (no blocking API calls)                │
└────────────────────────┬────────────────────────────────────┘
                         │
                  (reads/writes)
                         │
┌────────────────────────▼────────────────────────────────────┐
│              SQLite/PostgreSQL Database                     │
│         (Stores cached exchange rates)                      │
└────────────────────────┬────────────────────────────────────┘
                         │
                    (every 10 min)
                         │
┌────────────────────────▼────────────────────────────────────┐
│      Background Job: fetch:live-quotes Script              │
│  - Calls provider APIs (Wise, Remitly, etc.)               │
│  - Updates database with latest rates                      │
│  - Fails gracefully; doesn't break the UI                  │
└─────────────────────────────────────────────────────────────┘
```

## Deployment Options

### Option 1: Vercel (Recommended - Easiest)

**Best for:** Teams using Vercel, minimal infrastructure management

#### Steps:

1. Push code to Git repository (GitHub, GitLab, etc.)

2. Connect repository to Vercel:
   - Visit [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Select your repository
   - Click "Import"

3. Configure environment variables:
   - `DATABASE_URL` (optional): PostgreSQL connection string
   - `VERCEL_CRON_SECRET` (recommended): Random secret token for securing cron endpoint

4. Deploy:
   - Vercel will automatically build and deploy
   - Cron job configured in `vercel.json` runs every 10 minutes
   - No additional setup required

5. Monitor:
   - Vercel Dashboard → Functions → fetch-live-quotes
   - Check execution logs and errors

**Cron Configuration:** Defined in `vercel.json`
```json
{
  "crons": [{
    "path": "/api/cron/fetch-live-quotes",
    "schedule": "*/10 * * * *"
  }]
}
```

---

### Option 2: Docker + Docker Compose (Self-Hosted)

**Best for:** Teams with Docker expertise, cloud (AWS, Azure, etc.)

#### Prerequisites:
- Docker and Docker Compose installed
- Linux or macOS host

#### Steps:

1. Build Docker image:
```bash
docker build -t money-transfer-comparison:latest .
```

2. Run with scheduler:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

3. The `ofelia` service automatically schedules the fetch job every 10 minutes

4. Monitor:
```bash
# View logs
docker logs -f money-transfer-comparison_app_1

# Check scheduler status
docker logs money-transfer-comparison_scheduler_1

# Execute fetch manually
docker-compose -f docker-compose.prod.yml exec app npm run fetch:live-quotes
```

5. Persistent data:
   - Database stored in `./data` volume
   - Survives container restarts

**Environment variables:**
- `DATABASE_URL`: Database connection string (defaults to SQLite)
- `NODE_ENV`: Set to `production`

---

### Option 3: Linux with Systemd (VPS/Dedicated Server)

**Best for:** Full control, VPS/dedicated server environments

#### Prerequisites:
- Linux system with systemd (Ubuntu 18.04+, CentOS 8+, Debian 10+)
- Node.js 20+ installed

#### Steps:

1. Clone repository and install:
```bash
git clone https://github.com/your-org/money-transfer-comparison.git /opt/money-transfer-comparison
cd /opt/money-transfer-comparison
npm ci
npm run build
```

2. Create app user:
```bash
sudo useradd -r -s /bin/bash app-user
sudo chown -R app-user:app-user /opt/money-transfer-comparison
```

3. Install systemd service files:
```bash
sudo cp money-transfer-comparison.service /etc/systemd/system/
sudo cp fetch-live-quotes.service /etc/systemd/system/
sudo cp fetch-live-quotes.timer /etc/systemd/system/
```

4. Enable and start services:
```bash
# Reload systemd configuration
sudo systemctl daemon-reload

# Start the web application
sudo systemctl enable --now money-transfer-comparison.service

# Start the quote fetch timer (runs every 10 minutes)
sudo systemctl enable --now fetch-live-quotes.timer
```

5. Monitor:
```bash
# View app logs
sudo journalctl -u money-transfer-comparison.service -f

# View fetch job logs
sudo journalctl -u fetch-live-quotes.service -f

# Check timer status
sudo systemctl status fetch-live-quotes.timer

# List upcoming timer executions
sudo systemctl list-timers fetch-live-quotes.timer
```

6. Manual fetch:
```bash
sudo systemctl start fetch-live-quotes.service
```

---

### Option 4: Cron (Linux without Systemd)

**Best for:** Minimal systems, legacy environments

#### Steps:

1. Clone and install as above

2. Create cron job:
```bash
sudo crontab -e
```

3. Add entry:
```bash
*/10 * * * * cd /opt/money-transfer-comparison && npm run fetch:live-quotes >> /var/log/money-transfer-quotes.log 2>&1
```

4. Monitor:
```bash
tail -f /var/log/money-transfer-quotes.log
```

---

## Environment Variables

**Database:**
```bash
DATABASE_URL=postgresql://user:password@host:5432/money_transfer_comparison
```

**Quote Fetch:**
```bash
QUOTE_FETCH_TIMEOUT_MS=15000  # Timeout per provider (default: 15 seconds)
```

**Application:**
```bash
NODE_ENV=production
```

**Vercel Cron:**
```bash
VERCEL_CRON_SECRET=your-random-secret-here
```

---

## Database

### SQLite (Development/Small Scale)
- Default, no setup required
- File-based: `./data/quotes.db`
- Suitable for < 10k requests/day

### PostgreSQL (Production Recommended)
```bash
# Set environment variable
DATABASE_URL=postgresql://user:password@host:5432/money_transfer_comparison

# Migrations run automatically on app start
npm run build && npm start
```

---

## Health Checks

All deployment options include health checks. The app responds to:

```bash
curl http://localhost:3000/api/providers
```

Docker and Systemd use this to automatically restart if unhealthy.

---

## Troubleshooting

### Fetch job not running

**Vercel:**
- Check Vercel Dashboard → Functions tab
- Verify `VERCEL_CRON_SECRET` is set if required

**Docker:**
- `docker logs scheduler` - check ofelia scheduler
- Verify `ofelia.enabled: "true"` label is set

**Systemd:**
- `sudo systemctl status fetch-live-quotes.timer`
- `sudo journalctl -u fetch-live-quotes.service`

### Quotes not updating

1. Manually trigger fetch:
   - Vercel: POST `/api/cron/fetch-live-quotes` with auth header
   - Docker: `docker-compose exec app npm run fetch:live-quotes`
   - Systemd: `sudo systemctl start fetch-live-quotes.service`

2. Check logs for API errors or timeouts

3. Verify database permissions

4. If all providers fail, UI displays mock quotes (fallback strategy)

### High resource usage

- Fetch job runs for max 15 seconds per provider
- To reduce frequency, adjust schedule:
  - Vercel: Change `schedule` in `vercel.json` (e.g., `*/30 * * * *` = every 30 min)
  - Docker: Adjust `@every 10m` in docker-compose labels
  - Systemd: Adjust `OnUnitActiveSec=10min` in timer file
  - Cron: Change `*/10` in crontab

---

## Rollback Strategy

### Vercel
```bash
vercel rollback  # Reverts to previous deployment
```

### Docker
```bash
# Stop current version
docker-compose -f docker-compose.prod.yml down

# Run previous version
docker-compose -f docker-compose.prod.yml down
docker image ls | grep money-transfer-comparison
docker-compose -f docker-compose.prod.yml up -d  # Uses previous tag
```

### Systemd
```bash
# Revert code
git revert HEAD
npm run build

# Restart service
sudo systemctl restart money-transfer-comparison.service
```

---

## Support

- **Issues:** [GitHub Issues](https://github.com/your-org/money-transfer-comparison/issues)
- **Documentation:** See `README.md`
- **Architecture:** See "Background Rate Updates" section in README

