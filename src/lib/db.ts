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
    userAgent,
    referrer,
    createdAt
  ) VALUES (?, ?, ?, ?, ?, ?, ?)
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
        clickRecord.userAgent,
        clickRecord.referrer,
        clickRecord.createdAt,
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
 * Analytics: Get click-through rate per corridor
 * CTR = (provider clicks) / (corridor views)
 */
export function getCorridorClickThroughRates(): Promise<
  Array<{ corridor: string; views: number; clicks: number; ctr: number }>
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
      ORDER BY ctr DESC
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
