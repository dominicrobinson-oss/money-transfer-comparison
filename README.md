# Money Transfer Comparison

A mobile-first web application for comparing money transfer services from GBP to NGN.

## Tech Stack

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** SQLite (development) / PostgreSQL (production ready)


## Features

- Compare real-time transfer rates for GBP → NGN
- View fees, exchange rates, and transfer speeds
- Provider logos with image optimization
- User-friendly 404 and loading states
- Redirect to provider websites
- Mobile-first responsive design
- Accessibility and ARIA improvements
- SEO meta tags (Open Graph, Twitter)
- Privacy-friendly analytics (Plausible)
- No authentication or payment processing

## Getting Started

### Prerequisites

- Node.js 20.9.0 or higher
- npm

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file based on `.env.example`:

```bash
cp .env.example .env.local
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## API Endpoints

### GET `/api/providers`
Returns all available transfer providers.

**Response:**
```json
{
  "providers": [...],
  "count": 5
}
```

### GET `/api/compare?amount=100`
Compare providers for a specific transfer amount.

**Parameters:**
- `amount` (required): Amount in GBP to transfer

**Response:**
```json
{
  "comparisons": [...],
  "bestRate": {...},
  "fastestTransfer": {...},
  "lowestFee": {...},
  "timestamp": "2026-02-03T..."
}
```

## Project Structure

```
money-transfer-comparison/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── compare/
│   │   │   │   └── route.ts
│   │   │   └── providers/
│   │   │       └── route.ts
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── lib/
│   │   ├── data/
│   │   │   └── providers.ts
│   │   └── comparison.ts
│   └── types/
│       └── index.ts
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

## Development Roadmap

- [x] Project setup and configuration
- [x] Type definitions
- [x] Mock provider data
- [x] Comparison logic
- [x] API routes
- [x] User-friendly error and loading states
- [x] Provider logos and image optimization
- [x] Accessibility and SEO improvements
- [x] Privacy-friendly analytics
- [ ] Database integration (SQLite/PostgreSQL)
- [ ] UI components
- [ ] Mobile-responsive design
- [ ] Testing
- [ ] Deployment

## Production: Background Rate Updates

### Architecture

The application uses a **decoupled background job** architecture for fetching live exchange rates:

- **UI Layer:** Never makes direct API calls to money transfer providers. Always displays rates from the database.
- **Background Job:** Runs on a scheduled interval (recommended: every 10 minutes) to fetch and cache live rates.
- **Graceful Degradation:** If live fetch fails, the UI displays mock rates with clear labeling.

### Why This Approach?

1. **Performance:** UI is never blocked by slow provider APIs; users get instant page loads.
2. **Reliability:** Provider API outages don't break the UI; cached rates are always available.
3. **Cost Control:** Single background process prevents duplicate API calls; no risk of API rate limits from frontend.
4. **User Experience:** Consistent, predictable rate updates instead of variable latency per user request.

### Running Live Quote Fetch

#### Manual Fetch
```bash
npm run fetch:live-quotes
```

Fetches quotes for GBP → NGN corridor and stores them in the database. Exit code 0 = success, 1 = partial/complete failure (falls back to mock data).

#### Scheduled Fetch (Recommended Setup)

##### Option 1: Vercel Cron Jobs (Recommended for Vercel Deployments)

Create `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/fetch-live-quotes",
      "schedule": "*/10 * * * *"
    }
  ]
}
```

Then create `src/app/api/cron/fetch-live-quotes/route.ts` to trigger the fetch script.

##### Option 2: Linux Cron (Self-Hosted/VPS)

Add to `crontab -e`:
```bash
*/10 * * * * cd /path/to/app && npm run fetch:live-quotes >> /var/log/money-transfer-quotes.log 2>&1
```

Fetches live quotes every 10 minutes.

##### Option 3: Docker + Ofelia (Containerized)

Add service to `docker-compose.yml`:
```yaml
services:
  app:
    image: money-transfer-comparison:latest
    # ... other config ...

  quote-scheduler:
    image: mcuadros/ofelia:latest
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    command: daemon --docker
    depends_on:
      - app

  # Add to app service labels:
    # labels:
    #   ofelia: "enabled"
    #   ofelia.enabled: "true"
    #   ofelia.schedule: "@every 10m"
    #   ofelia.job-exec: "npm run fetch:live-quotes"
```

##### Option 4: Systemd Timer (Linux Systemd)

Create `/etc/systemd/system/fetch-live-quotes.service`:
```ini
[Unit]
Description=Fetch live money transfer quotes
After=network.target

[Service]
Type=oneshot
ExecStart=/usr/bin/npm run fetch:live-quotes
WorkingDirectory=/path/to/app
User=app-user
```

Create `/etc/systemd/system/fetch-live-quotes.timer`:
```ini
[Unit]
Description=Run fetch-live-quotes every 10 minutes
Requires=fetch-live-quotes.service

[Timer]
OnBootSec=1min
OnUnitActiveSec=10min
Persistent=true

[Install]
WantedBy=timers.target
```

Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable --now fetch-live-quotes.timer
```

### Failure Handling

- **API Timeouts:** If a provider API times out (>15s), the request is abandoned and that provider uses cached/mock data.
- **Partial Failures:** If 1 of 2 providers fails, the successful rate is updated; failed provider keeps previous rate.
- **All Failures:** If all providers timeout, the UI displays mock rates from `MOCK_QUOTES` constant.
- **Database Errors:** If database write fails, quotes remain in-memory; next successful fetch updates the database.

**The UI never shows an error page.** It always renders with available data.

### Monitoring

Monitor the fetch job via logs:

```bash
# Vercel: Check deployment logs
vercel logs fetch-live-quotes

# Linux Cron: Check cron output
tail -f /var/log/money-transfer-quotes.log

# Docker: Check service logs
docker logs quote-scheduler

# Systemd: Check timer status
systemctl status fetch-live-quotes.timer
journalctl -u fetch-live-quotes.service -f
```

### Environment Variables

For production deployment, set:

```bash
# Database (optional, defaults to SQLite)
DATABASE_URL=postgresql://user:password@host:5432/money_transfer_comparison

# Quote fetch timeout (milliseconds, default 15000)
QUOTE_FETCH_TIMEOUT_MS=15000

# Environment
NODE_ENV=production
```

