import { Quote } from "@/types/core";
import { chromium } from "playwright";

const WISE_CALCULATOR_URL =
  "https://wise.com/gb/compare/?source=GBP&target=NGN&sendAmount=100";
const DEFAULT_TIMEOUT_MS = 20000;
const HARD_TIMEOUT_MS = 15000; // Abort if exceeds 15 seconds

function parseNumber(text: string): number {
  const normalized = text.replace(/,/g, "").replace(/[^0-9.]/g, "");
  const value = parseFloat(normalized);
  if (Number.isNaN(value)) {
    throw new Error(`Unable to parse number from: ${text}`);
  }
  return value;
}

async function readText(
  page: import("playwright").Page,
  selector: string,
  timeout: number
): Promise<string | null> {
  const locator = page.locator(selector).first();
  try {
    await locator.waitFor({ timeout });
    const text = await locator.textContent();
    return text?.trim() ?? null;
  } catch {
    return null;
  }
}

/**
 * Fetches a live Wise quote for GBP → NGN
 * Uses Playwright to read Wise's public transfer calculator
 * Hard timeout: 5 seconds - aborts and throws if exceeded
 */
export async function fetchWiseQuote(): Promise<Quote> {
  let browser: import("playwright").Browser | null = null;
  let page: import("playwright").Page | null = null;
  let timeoutHandle: NodeJS.Timeout | null = null;

  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutHandle = setTimeout(
        () => reject(new Error("Wise quote fetch exceeded 5 second hard timeout")),
        HARD_TIMEOUT_MS
      );
    });

    const fetchPromise = (async () => {
      browser = await chromium.launch({ headless: true });
      page = await browser.newPage();

      await page.goto(WISE_CALCULATOR_URL, {
        waitUntil: "domcontentloaded",
        timeout: DEFAULT_TIMEOUT_MS,
      });

      const rateText =
        (await readText(page, "[data-testid='exchange-rate']", DEFAULT_TIMEOUT_MS)) ||
        (await readText(page, "[data-testid='rate-value']", DEFAULT_TIMEOUT_MS)) ||
        (await readText(page, "text=/Exchange rate/i", DEFAULT_TIMEOUT_MS));

      const feeText =
        (await readText(page, "[data-testid='total-fee']", DEFAULT_TIMEOUT_MS)) ||
        (await readText(page, "[data-testid='fee-value']", DEFAULT_TIMEOUT_MS)) ||
        (await readText(page, "text=/Fee/i", DEFAULT_TIMEOUT_MS));

      const receiveText =
        (await readText(page, "[data-testid='target-amount']", DEFAULT_TIMEOUT_MS)) ||
        (await readText(page, "[data-testid='recipient-amount']", DEFAULT_TIMEOUT_MS)) ||
        (await readText(page, "text=/You receive/i", DEFAULT_TIMEOUT_MS));

      if (!rateText || !feeText || !receiveText) {
        throw new Error("Unable to read Wise calculator values.");
      }

      const rate = parseNumber(rateText);
      const fee = parseNumber(feeText);
      const receiveAmount = parseNumber(receiveText);

      return {
        providerId: "wise",
        fromCurrency: "GBP",
        toCurrency: "NGN",
        sendAmount: 100,
        rate,
        fee,
        receiveAmount,
        fetchedAt: new Date().toISOString(),
        source: "live",
      };
    })();

    return await Promise.race([fetchPromise, timeoutPromise]);
  } catch (error) {
    throw new Error(
      `Failed to fetch Wise quote: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  } finally {
    if (timeoutHandle) clearTimeout(timeoutHandle);
    if (page) await page.close();
    if (browser) await browser.close();
  }
}
