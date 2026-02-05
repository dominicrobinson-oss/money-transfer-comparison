# Telemetry Implementation

## Overview
Privacy-safe, anonymous usage telemetry to track user interactions without collecting any personally identifiable information (PII).

## Events Tracked

### 1. corridor_viewed
- **When**: On page mount
- **Data**: `fromCurrency`, `toCurrency`, `corridor` (e.g., "GBP-NGN")
- **Location**: All corridor pages (`gbp-to-ngn`, `gbp-to-ghs`, etc.)

### 2. amount_changed
- **When**: User changes amount input (debounced, 1 second delay)
- **Data**: `amountBucket` only (`<100`, `100-500`, `500-1000`, `1000+`)
- **Privacy**: Exact amounts are NOT logged, only bucketed ranges
- **Location**: All corridor pages

### 3. currency_selected
- **When**: User selects a different currency from dropdown
- **Data**: `fromCurrency`, `toCurrency`, `corridor`
- **Location**: All corridor pages

### 4. provider_clicked
- **When**: User clicks provider redirect link
- **Data**: `providerId`, `fromCurrency`, `toCurrency`, `corridor`
- **Location**: `/go/provider/[id]` redirect handler

## Technical Implementation

### Client-Side (`src/lib/telemetry.ts`)
- **Fire-and-forget**: Uses `navigator.sendBeacon` (preferred) or `fetch` with `keepalive: true`
- **Non-blocking**: Events sent asynchronously, errors silently ignored
- **Development mode**: Telemetry disabled in `NODE_ENV=development`

### Server-Side (`src/app/api/telemetry/route.ts`)
- **Endpoint**: `POST /api/telemetry`
- **Returns immediately**: 200 OK response without waiting for DB write
- **Error handling**: All errors silently logged, never break the app

### Database (`src/lib/db.ts`)
- **Table**: `telemetry_events`
- **Columns**: `eventType`, `corridor`, `amountBucket`, `fromCurrency`, `toCurrency`, `providerId`, `createdAt`
- **No PII**: No IP addresses, user agents, emails, or names

## Privacy Guarantees

✅ **Anonymous**: No user identification
✅ **No PII**: No names, emails, IP addresses
✅ **Bucketed amounts**: Exact amounts not logged
✅ **Non-blocking**: Never affects UI performance
✅ **Fire-and-forget**: Failures don't impact user experience
✅ **Smoke-test safe**: All telemetry calls fail gracefully

## Usage Example

```typescript
// Corridor view (automatic on mount)
trackCorridorView("GBP", "NGN");

// Amount change (debounced)
trackAmountChange(250); // Logs bucket "100-500"

// Currency selection
trackCurrencySelect("GBP", "USD");

// Provider click (automatic on redirect)
trackProviderClick("wise", "GBP", "NGN");
```

## Files Modified

### Created
- `src/lib/telemetry.ts` - Telemetry utilities
- `src/app/api/telemetry/route.ts` - API endpoint

### Modified
- `src/lib/db.ts` - Added `telemetry_events` table and `logTelemetryEvent` function
- `src/app/gbp-to-ngn/page.tsx` - Added tracking
- `src/app/gbp-to-ghs/page.tsx` - Added tracking
- `src/app/gbp-to-zar/page.tsx` - Added tracking
- `src/app/gbp-to-usd/page.tsx` - Added tracking
- `src/app/gbp-to-eur/page.tsx` - Added tracking
- `src/app/gbp-to-cad/page.tsx` - Added tracking
- `src/app/go/provider/[id]/route.ts` - Added provider click tracking

## Data Retention

Events are stored locally in SQLite (`data/app.db`). No automatic expiration implemented. Consider adding periodic cleanup if needed.

## Testing

In development mode (`NODE_ENV=development`), telemetry is automatically disabled to reduce noise during testing.

For production testing:
1. Build the app: `npm run build`
2. Start production server: `npm start`
3. Interact with the app
4. Check database: `sqlite3 data/app.db "SELECT * FROM telemetry_events ORDER BY createdAt DESC LIMIT 10;"`
