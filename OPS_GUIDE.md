# Operations Guide: Background Rate Updates

Quick reference for DevOps/operations teams managing the Money Transfer Comparison application.

## What is the Background Rate Update?

The app fetches exchange rates from money transfer providers (Wise, Remitly, etc.) every 10 minutes and caches them in a database. This keeps rates fresh while ensuring the UI never blocks waiting for provider APIs.

## Service: `fetch:live-quotes`

**Command:**
```bash
npm run fetch:live-quotes
```

**What it does:**
1. Calls provider APIs with a 15-second timeout per provider
2. Writes successful rates to the database
3. Falls back to mock rates if all providers fail
4. **Never blocks the web UI** — the UI displays cached/mock rates regardless

**Exit codes:**
- `0` = Success (all or partial rates updated)
- `1` = Failure (all providers timed out; using mock rates)

## Monitoring

### Vercel
```bash
# View recent executions in dashboard
# Dashboard → Functions → fetch-live-quotes

# Manual trigger
curl -X POST https://your-app.vercel.app/api/cron/fetch-live-quotes \
  -H "Authorization: Bearer YOUR_VERCEL_CRON_SECRET"
```

### Docker
```bash
# View logs
docker logs -f container_name

# Manual trigger
docker-compose -f docker-compose.prod.yml exec app npm run fetch:live-quotes
```

### Systemd
```bash
# View status
sudo systemctl status fetch-live-quotes.timer

# View logs (last 50 lines)
sudo journalctl -u fetch-live-quotes.service -n 50

# View logs in real-time
sudo journalctl -u fetch-live-quotes.service -f

# List next 5 scheduled runs
sudo systemctl list-timers fetch-live-quotes.timer

# Manual trigger
sudo systemctl start fetch-live-quotes.service
```

### Cron
```bash
# View logs
tail -f /var/log/money-transfer-quotes.log

# Check cron scheduling
sudo crontab -l

# Manual trigger
cd /opt/money-transfer-comparison && npm run fetch:live-quotes
```

## Alerting

### What to Alert On

1. **Job execution failure** (exit code 1 for 3+ consecutive runs)
2. **No data updated** for 30+ minutes
3. **Database write errors** in logs
4. **High latency** (job takes >30 seconds)

### What NOT to Alert On

- Single job failure (next run will retry)
- Individual provider timeout (app uses mock data)
- Network transient errors (next run will recover)

## Escalation

| Issue | Resolution |
|-------|-----------|
| One provider timeout | Normal; app falls back to other providers |
| All providers timeout 1x | Wait for next run (10 min); check provider status pages |
| All providers timeout 3+ times | Check network/VPN; check provider APIs; page on-call |
| Database connection error | Check DB credentials, host, disk space |
| Job not running | Check scheduler (Vercel/Docker/Systemd); check system time |

## Configuration Changes

### Change fetch frequency (example: every 30 minutes)

**Vercel:**
```json
// vercel.json
{
  "crons": [{
    "path": "/api/cron/fetch-live-quotes",
    "schedule": "*/30 * * * *"  // Changed from */10
  }]
}
```

**Docker:**
```yaml
# docker-compose.prod.yml
labels:
  ofelia.job-exec.fetch-live-quotes.schedule: "@every 30m"  # Changed from @every 10m
```

**Systemd:**
```ini
# fetch-live-quotes.timer
OnUnitActiveSec=30min  # Changed from 10min
sudo systemctl daemon-reload
sudo systemctl restart fetch-live-quotes.timer
```

**Cron:**
```bash
# Change crontab
*/30 * * * * cd /path && npm run fetch:live-quotes  # Changed from */10
```

### Increase provider timeout (example: 30 seconds)

Set environment variable:
```bash
QUOTE_FETCH_TIMEOUT_MS=30000
```

Then restart the application.

## Maintenance Windows

**Planning maintenance?** No special steps needed:
- The web UI continues serving cached rates
- Pause the fetch job during maintenance
- It resumes automatically after restart
- Users experience zero downtime

## Performance Baseline

| Metric | Normal Range |
|--------|--------------|
| Fetch duration | 5-20 seconds |
| Success rate | 80-100% |
| Memory usage | < 100MB |
| Database size | < 10MB |
| Web UI response time | < 500ms |

## Common Issues

### "Fetch job didn't run"

1. Check if scheduler is running:
   - Vercel: Check deployment logs
   - Docker: `docker ps` → check scheduler container
   - Systemd: `systemctl status fetch-live-quotes.timer`
   - Cron: `sudo crontab -l`

2. Check system time (must be correct for schedule to work)

3. Check logs for errors

### "All providers timeout"

1. Check if provider websites are up (Wise, Remitly)
2. Verify network/firewall allows outbound HTTPS
3. Check if API endpoints changed (contact providers)
4. Increase timeout temporarily: `QUOTE_FETCH_TIMEOUT_MS=30000`

### "Database error in logs"

1. Check database is running and accessible
2. Verify connection string in environment
3. Check disk space
4. Check database user permissions

## Disaster Recovery

### If fetch stops working for > 1 hour

1. **Web UI still works** — it displays mock rates
2. **Verify** app is still serving traffic
3. **Check logs** for specific errors
4. **Restart scheduler:**
   - Vercel: Redeploy
   - Docker: `docker-compose restart scheduler`
   - Systemd: `sudo systemctl restart fetch-live-quotes.timer`
   - Cron: Ensure cron daemon is running

### Rollback

If a deployment broke the fetch:
```bash
git revert HEAD
npm run build
# Restart app
```

Fetch will resume with previous version.

## Dashboard Setup (Recommended)

Set up monitoring dashboard with:
- Fetch job success rate (target: 95%+)
- Last update timestamp
- Database size
- Provider API response times

Example Prometheus queries:
```
# Success rate (last 24h)
sum(rate(fetch_success_total[24h])) / sum(rate(fetch_attempts_total[24h]))

# Last update time
time() - quote_last_updated_timestamp_seconds

# Job duration
histogram_quantile(0.95, fetch_duration_seconds)
```

## Contact

- **App Issues:** Email devops@company.com
- **Provider API Issues:** Check provider status pages
- **Infrastructure Issues:** Page on-call engineer

