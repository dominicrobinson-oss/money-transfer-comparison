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

/**
 * Get the most recent live quotes for a currency corridor
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
