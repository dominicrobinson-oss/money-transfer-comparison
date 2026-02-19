/**
 * Analytics: Get scroll depth distribution for a corridor
 */
export function getScrollDepthDistribution(corridor: string): Promise<Array<{ bucket: string; count: number; percent: number }>> {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT bucket, COUNT(*) as count
      FROM telemetry_events
      WHERE eventType = 'scroll_depth' AND corridor = ?
      GROUP BY bucket
      ORDER BY count DESC
    `;
    db.all(sql, [corridor], (err, rows: any[]) => {
      if (err) { reject(err); return; }
      const total = rows.reduce((sum, row) => sum + Number(row.count), 0);
      const result = rows.map(row => ({
        bucket: row.bucket,
        count: Number(row.count),
        percent: total ? (Number(row.count) / total) * 100 : 0
      }));
      resolve(result);
    });
  });
}

/**
 * Analytics: Get impression to click conversion for top provider
 */
export function getTopProviderImpressionConversion(corridor: string): Promise<{ impressions: number; clicks: number; conversionRate: number }> {
  return new Promise((resolve, reject) => {
    const sqlImpressions = `
      SELECT COUNT(*) as impressions
      FROM telemetry_events
      WHERE eventType = 'top_provider_impression' AND corridor = ?
    `;
    const sqlClicks = `
      SELECT COUNT(*) as clicks
      FROM provider_clicks
      WHERE rankingPosition = 1 AND corridor = ?
    `;
    db.get(sqlImpressions, [corridor], (err, row1: { impressions: number }) => {
      if (err) { reject(err); return; }
      db.get(sqlClicks, [corridor], (err2, row2: { clicks: number }) => {
        if (err2) { reject(err2); return; }
        const impressions = row1?.impressions || 0;
        const clicks = row2?.clicks || 0;
        resolve({
          impressions,
          clicks,
          conversionRate: impressions > 0 ? (clicks / impressions) * 100 : 0
        });
      });
    });
  });
}
/**
 * Analytics: Get ranking drop-off curve (clicks and percent by ranking position)
 */
export function getRankingDropoffCurve(): Promise<Array<{ rankingPosition: number; clicks: number; percent: number }>> {
  type RankingDropoffRow = { rankingPosition: number; clicks: number };
  return new Promise((resolve, reject) => {
    const sql = `SELECT rankingPosition, COUNT(*) as clicks FROM provider_clicks WHERE rankingPosition IS NOT NULL GROUP BY rankingPosition ORDER BY rankingPosition ASC`;
    db.all<RankingDropoffRow>(sql, [], (err, rows) => {
      if (err) { reject(err); return; }
      const total = rows.reduce((sum, row) => sum + Number(row.clicks), 0);
      const result = rows.map(row => ({
        rankingPosition: Number(row.rankingPosition),
        clicks: Number(row.clicks),
        percent: total ? (Number(row.clicks) / total) * 100 : 0
      }));
      resolve(result);
    });
  });
}

/**
 * Analytics: Get signal performance (clicks and percent by signal)
 */
export function getSignalPerformance(): Promise<Array<{ signalShown: string; clicks: number; percent: number }>> {
  type SignalPerformanceRow = { signalShown: string; clicks: number };
  return new Promise((resolve, reject) => {
    const sql = `SELECT signalShown, COUNT(*) as clicks FROM provider_clicks WHERE signalShown IS NOT NULL GROUP BY signalShown ORDER BY clicks DESC`;
    db.all<SignalPerformanceRow>(sql, [], (err, rows) => {
      if (err) { reject(err); return; }
      const total = rows.reduce((sum, row) => sum + Number(row.clicks), 0);
      const result = rows.map(row => ({
        signalShown: row.signalShown,
        clicks: Number(row.clicks),
        percent: total ? (Number(row.clicks) / total) * 100 : 0
      }));
      resolve(result);
    });
  });
}

/**
 * Analytics: Get device CTR breakdown (clicks by device type)
 */
export function getDeviceCTRBreakdown(): Promise<Array<{ deviceType: string; clicks: number }>> {
  type DeviceCTRBreakdownRow = { deviceType: string; clicks: number };
  return new Promise((resolve, reject) => {
    const sql = `SELECT deviceType, COUNT(*) as clicks FROM provider_clicks WHERE deviceType IS NOT NULL GROUP BY deviceType ORDER BY clicks DESC`;
    db.all<DeviceCTRBreakdownRow>(sql, [], (err, rows) => {
      if (err) { reject(err); return; }
      resolve(rows.map(row => ({ deviceType: row.deviceType, clicks: Number(row.clicks) })));
    });
  });
}
/**
 * Analytics: Get capture rates for top ranked providers (rank #1, #2, #3+)
 */
export async function getTopRankedProviderCaptureRates(): Promise<{
  rank1: { count: number; percent: number };
  rank2: { count: number; percent: number };
  rank3plus: { count: number; percent: number };
  total: number;
}> {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT rankingPosition, COUNT(*) as clicks
      FROM provider_clicks
      WHERE rankingPosition IS NOT NULL
      GROUP BY rankingPosition
    `;
    db.all(sql, [], (err, rows: any[]) => {
      if (err) { reject(err); return; }
      let rank1 = 0, rank2 = 0, rank3plus = 0, total = 0;
      rows.forEach(row => {
        const pos = Number(row.rankingPosition);
        const clicks = Number(row.clicks);
        if (pos === 1) rank1 += clicks;
        else if (pos === 2) rank2 += clicks;
        else if (pos >= 3) rank3plus += clicks;
        total += clicks;
      });
      resolve({
        rank1: { count: rank1, percent: total ? (rank1 / total) * 100 : 0 },
        rank2: { count: rank2, percent: total ? (rank2 / total) * 100 : 0 },
        rank3plus: { count: rank3plus, percent: total ? (rank3plus / total) * 100 : 0 },
        total
      });
    });
  });
}
/**
 * Analytics: Get conversion rate by signal type
 */
export function getConversionRateBySignal(): Promise<Array<{ signalShown: string; clicks: number }>> {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT signalShown, COUNT(*) as clicks
      FROM provider_clicks
      WHERE signalShown IS NOT NULL
      GROUP BY signalShown
      ORDER BY clicks DESC
    `;
    db.all(sql, [], (err, rows: any[]) => {
      if (err) { reject(err); return; }
      resolve(rows || []);
    });
  });
}

/**
 * Analytics: Get clicks by ranking position
 */
export function getClicksByRankingPosition(): Promise<Array<{ rankingPosition: number; clicks: number }>> {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT rankingPosition, COUNT(*) as clicks
      FROM provider_clicks
      WHERE rankingPosition IS NOT NULL
      GROUP BY rankingPosition
      ORDER BY rankingPosition ASC
    `;
    db.all(sql, [], (err, rows: any[]) => {
      if (err) { reject(err); return; }
      resolve(rows || []);
    });
  });
}

/**
 * Analytics: Get mobile vs desktop CTR
 */
export function getClicksByDeviceType(): Promise<Array<{ deviceType: string; clicks: number }>> {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT deviceType, COUNT(*) as clicks
      FROM provider_clicks
      WHERE deviceType IS NOT NULL
      GROUP BY deviceType
      ORDER BY clicks DESC
    `;
    db.all(sql, [], (err, rows: any[]) => {
      if (err) { reject(err); return; }
      resolve(rows || []);
    });
  });
}
/**
 * Analytics: Get daily view counts grouped by date
 */
export function getDailyViewCounts(): Promise<Array<{ date: string; views: number }>> {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT strftime('%Y-%m-%d', createdAt) as date, COUNT(*) as views
      FROM telemetry_events
      WHERE eventType = 'corridor_view'
      GROUP BY date
      ORDER BY date DESC
      LIMIT 30
    `;
    db.all(sql, [], (err, rows: any[]) => {
      if (err) { reject(err); return; }
      resolve(rows || []);
    });
  });
}

/**
 * Analytics: Get daily click counts grouped by date
 */
export function getDailyClickCounts(): Promise<Array<{ date: string; clicks: number }>> {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT strftime('%Y-%m-%d', createdAt) as date, COUNT(*) as clicks
      FROM provider_clicks
      GROUP BY date
      ORDER BY date DESC
      LIMIT 30
    `;
    db.all(sql, [], (err, rows: any[]) => {
      if (err) { reject(err); return; }
      resolve(rows || []);
    });
  });
}

/**
 * Analytics: Get daily conversion rates (clicks/views) grouped by date
 */
export async function getDailyConversionRates(): Promise<Array<{ date: string; views: number; clicks: number; conversionRate: number }>> {
  const views = await getDailyViewCounts();
  const clicks = await getDailyClickCounts();
  const byDate: Record<string, { views: number; clicks: number }> = {};
  views.forEach(v => { byDate[v.date] = { views: v.views, clicks: 0 }; });
  clicks.forEach(c => {
    if (!byDate[c.date]) byDate[c.date] = { views: 0, clicks: 0 };
    byDate[c.date].clicks = c.clicks;
  });
  return Object.entries(byDate).map(([date, { views, clicks }]) => ({
    date,
    views,
    clicks,
    conversionRate: views > 0 ? clicks / views : 0,
  })).sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * Analytics: Get top corridors by views in the last 7 days
 */
export function getTopCorridors7d(): Promise<Array<{ corridor: string; views: number }>> {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT corridor, COUNT(*) as views
      FROM telemetry_events
      WHERE eventType = 'corridor_view' AND corridor IS NOT NULL
        AND date(createdAt) >= date('now', '-7 days')
      GROUP BY corridor
      ORDER BY views DESC
      LIMIT 10
    `;
    db.all(sql, [], (err, rows: any[]) => {
      if (err) { reject(err); return; }
      resolve(rows || []);
    });
  });
}

/**
 * Analytics: Get top providers by clicks in the last 7 days
 */
export function getTopProviders7d(): Promise<Array<{ providerId: string; clicks: number }>> {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT providerId, COUNT(*) as clicks
      FROM provider_clicks
      WHERE date(createdAt) >= date('now', '-7 days')
      GROUP BY providerId
      ORDER BY clicks DESC
      LIMIT 10
    `;
    db.all(sql, [], (err, rows: any[]) => {
      if (err) { reject(err); return; }
      resolve(rows || []);
    });
  });
}
import fs from "fs";
import path from "path";
import sqlite3 from "sqlite3";
import { Quote } from "@/types/core";

const dataDir = path.join(process.cwd(), "data");
const dbPath = path.join(dataDir, "app.db");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

sqlite3.verbose();
const db = new sqlite3.Database(dbPath);

// Initialize tables if they don't exist
const initSql = `
  CREATE TABLE IF NOT EXISTS provider_clicks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    providerId TEXT NOT NULL,
    fromCurrency TEXT NOT NULL,
    toCurrency TEXT NOT NULL,
    amount REAL NOT NULL,
    userAgent TEXT,
    referrer TEXT,
    createdAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS live_quotes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    providerId TEXT NOT NULL,
    fromCurrency TEXT NOT NULL,
    toCurrency TEXT NOT NULL,
    rate REAL NOT NULL,
    fee REAL NOT NULL,
    receiveAmount REAL NOT NULL,
    fetchedAt TEXT NOT NULL,
    createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(providerId, fromCurrency, toCurrency)
  );

  CREATE TABLE IF NOT EXISTS telemetry_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    eventType TEXT NOT NULL,
    corridor TEXT,
    amountBucket TEXT,
    fromCurrency TEXT,
    toCurrency TEXT,
    providerId TEXT,
    createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`;

db.serialize(() => {
  db.run(initSql);
});

/**
 * Ensure database is initialized
 * Call this at the start of any CLI script that uses the database
 */
export function ensureDbInitialized(): Promise<void> {
  return new Promise((resolve, reject) => {
    db.exec(initSql, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

export interface ProviderClickRecord {
  providerId: string;
  fromCurrency: string;
  toCurrency: string;
  amount: number;
  corridor?: string;
  rankingPosition?: number;
  signalShown?: string;
  deviceType?: string;
  userAgent: string;
  referrer: string | null;
  createdAt: string; // ISO string
}

const insertSql = `
  INSERT INTO provider_clicks (
    providerId,
    fromCurrency,
    toCurrency,
    amount,
    corridor,
    rankingPosition,
    signalShown,
    deviceType,
    userAgent,
    referrer,
    createdAt
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

export function logProviderClick(clickRecord: ProviderClickRecord): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run(
      insertSql,
      [
        clickRecord.providerId,
        clickRecord.fromCurrency,
        clickRecord.toCurrency,
        clickRecord.amount,
        clickRecord.corridor || null,
        clickRecord.rankingPosition ?? null,
        clickRecord.signalShown || null,
        clickRecord.deviceType || null,
        clickRecord.userAgent,
        clickRecord.referrer,
        clickRecord.createdAt,
      ],
      (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });
}

/**
 * Save or update a live quote for a provider
 * Overwrites previous quote for the same provider/corridor
 */
export function saveLiveQuote(quote: Quote): Promise<void> {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO live_quotes (
        providerId,
        fromCurrency,
        toCurrency,
        rate,
        fee,
        receiveAmount,
        fetchedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(providerId, fromCurrency, toCurrency)
      DO UPDATE SET
        rate = excluded.rate,
        fee = excluded.fee,
        receiveAmount = excluded.receiveAmount,
        fetchedAt = excluded.fetchedAt,
        createdAt = CURRENT_TIMESTAMP
    `;

    db.run(
      sql,
      [
        quote.providerId,
        quote.fromCurrency,
        quote.toCurrency,
        quote.rate,
        quote.fee,
        quote.receiveAmount,
        quote.fetchedAt,
      ],
      (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      }
    );
  });
}

/** * Log telemetry event (anonymous, privacy-safe)
 */
export interface TelemetryEventRecord {
  eventType: string;
  corridor?: string;
  amountBucket?: string;
  fromCurrency?: string;
  toCurrency?: string;
  providerId?: string;
}

export function logTelemetryEvent(event: TelemetryEventRecord): Promise<void> {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO telemetry_events (
        eventType, corridor, amountBucket, fromCurrency, toCurrency, providerId
      ) VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.run(
      sql,
      [
        event.eventType,
        event.corridor || null,
        event.amountBucket || null,
        event.fromCurrency || null,
        event.toCurrency || null,
        event.providerId || null,
      ],
      (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });
}

/** * Get the most recent live quotes for a currency corridor
 * Returns one quote per provider, sorted by fetchedAt descending
 */
export function getLatestLiveQuotes(
  fromCurrency: string,
  toCurrency: string
): Promise<Quote[]> {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT
        providerId,
        fromCurrency,
        toCurrency,
        rate,
        fee,
        receiveAmount,
        fetchedAt
      FROM live_quotes
      WHERE fromCurrency = ? AND toCurrency = ?
      ORDER BY fetchedAt DESC
    `;

    db.all(sql, [fromCurrency, toCurrency], (err, rows: any[]) => {
      if (err) {
        reject(err);
        return;
      }

      const quotes: Quote[] = (rows || []).map((row) => ({
        providerId: row.providerId,
        fromCurrency: row.fromCurrency,
        toCurrency: row.toCurrency,
        sendAmount: 0, // Not stored in live_quotes table
        rate: row.rate,
        fee: row.fee,
        receiveAmount: row.receiveAmount,
        fetchedAt: row.fetchedAt,
        source: "live" as const,
      }));

      resolve(quotes);
    });
  });
}
export function getProviderClickStats(): Promise<
  Record<string, { clicks: number; lastClickedAt: string | null }>
> {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT
        providerId,
        COUNT(*) as clicks,
        MAX(createdAt) as lastClickedAt
      FROM provider_clicks
      GROUP BY providerId
    `;

    db.all(sql, (err, rows: any[]) => {
      if (err) {
        reject(err);
        return;
      }

      const stats: Record<string, { clicks: number; lastClickedAt: string | null }> = {};
      (rows || []).forEach((row) => {
        stats[row.providerId] = {
          clicks: row.clicks,
          lastClickedAt: row.lastClickedAt,
        };
      });

      resolve(stats);
    });
  });
}
/**
 * Analytics: Get top corridors by view count
 */
export function getTopCorridorsByViews(): Promise<Array<{ corridor: string; views: number }>> {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT
        corridor,
        COUNT(*) as views
      FROM telemetry_events
      WHERE eventType = 'corridor_view' AND corridor IS NOT NULL
      GROUP BY corridor
      ORDER BY views DESC
      LIMIT 10
    `;

    db.all(sql, [], (err, rows: any[]) => {
      if (err) {
        reject(err);
        return;
      }
      resolve((rows || []).map((r) => ({ corridor: r.corridor, views: r.views })));
    });
  });
}

/**
 * Analytics: Get top providers by click count
 */
export function getTopProvidersByClicks(): Promise<Array<{ providerId: string; clicks: number }>> {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT
        providerId,
        COUNT(*) as clicks
      FROM provider_clicks
      GROUP BY providerId
      ORDER BY clicks DESC
    `;

    db.all(sql, [], (err, rows: any[]) => {
      if (err) {
        reject(err);
        return;
      }
      resolve((rows || []).map((r) => ({ providerId: r.providerId, clicks: r.clicks })));
    });
  });
}

/**
 * Analytics: Get click-through rate per corridor with activation readiness
 * CTR = (provider clicks) / (corridor views)
 * Includes corridor status and activation candidate flag
 */
export function getCorridorClickThroughRates(): Promise<
  Array<{ 
    corridor: string; 
    views: number; 
    clicks: number; 
    ctr: number;
    status: string;
    isActivationCandidate: boolean;
  }>
> {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT
        COALESCE(v.corridor, c.corridor) as corridor,
        COALESCE(v.views, 0) as views,
        COALESCE(c.clicks, 0) as clicks,
        CASE
          WHEN COALESCE(v.views, 0) > 0
          THEN CAST(COALESCE(c.clicks, 0) AS REAL) / CAST(v.views AS REAL)
          ELSE 0
        END as ctr
      FROM (
        SELECT corridor, COUNT(*) as views
        FROM telemetry_events
        WHERE eventType = 'corridor_view' AND corridor IS NOT NULL
        GROUP BY corridor
      ) v
      LEFT JOIN (
        SELECT (fromCurrency || '-' || toCurrency) as corridor, COUNT(*) as clicks
        FROM provider_clicks
        GROUP BY corridor
      ) c ON v.corridor = c.corridor
      ORDER BY views DESC
    `;

    db.all(sql, [], (err, rows: any[]) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(
        (rows || []).map((r) => ({
          corridor: r.corridor,
          views: r.views,
          clicks: r.clicks,
          ctr: r.ctr,
          status: '', // Will be filled in by the page component
          isActivationCandidate: r.views >= 10 && (r.clicks === 0 || r.ctr < 0.05),
        }))
      );
    });
  });
}

/**
 * Analytics: Get most selected transfer methods
 */
export function getTopTransferMethods(): Promise<
  Array<{ method: string; selections: number; percentage: number }>
> {
  return new Promise((resolve, reject) => {
    const sql = `
      WITH method_counts AS (
        SELECT
          eventType as method,
          COUNT(*) as selections
        FROM telemetry_events
        WHERE eventType IN ('method_bank', 'method_card', 'method_cash', 'method_wallet')
        GROUP BY eventType
      ),
      total AS (
        SELECT SUM(selections) as total_selections FROM method_counts
      )
      SELECT
        REPLACE(method, 'method_', '') as method,
        selections,
        CAST(selections AS REAL) / CAST(total_selections AS REAL) * 100 as percentage
      FROM method_counts, total
      ORDER BY selections DESC
    `;

    db.all(sql, [], (err, rows: any[]) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(
        (rows || []).map((r) => ({
          method: r.method,
          selections: r.selections,
          percentage: r.percentage,
        }))
      );
    });
  });
}
