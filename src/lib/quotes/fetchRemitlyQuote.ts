import { Quote } from "@/types/core";
import { chromium } from "playwright";

const REMITLY_CALCULATOR_URL = "https://www.remitly.com/gb/en/send-money";
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
 * Fetches a live Remitly quote for GBP → NGN
 * Uses Playwright to read Remitly's public send money calculator
 * Hard timeout: 5 seconds - aborts and throws if exceeded
 */
export async function fetchRemitlyQuote(): Promise<Quote> {
  let browser: import("playwright").Browser | null = null;
  let page: import("playwright").Page | null = null;
  let timeoutHandle: NodeJS.Timeout | null = null;

  try {
    const timeoutPromise = new Promise<Quote>((_, reject) => {
      timeoutHandle = setTimeout(
        () => reject(new Error("Remitly quote fetch exceeded 5 second hard timeout")),
        HARD_TIMEOUT_MS
      );
    });

    const fetchPromise = (async (): Promise<Quote> => {
      browser = await chromium.launch({ headless: true });
      page = await browser.newPage();

      await page.goto(REMITLY_CALCULATOR_URL, {
        waitUntil: "domcontentloaded",
        timeout: DEFAULT_TIMEOUT_MS,
      });

      // Set send currency to GBP
      const sendCurrencySelector = '[data-testid="send-currency-select"], [name="sendCurrency"], select[aria-label*="Send"]';
      const sendCurrencyField = page.locator(sendCurrencySelector).first();
      if (await sendCurrencyField.isVisible()) {
        await sendCurrencyField.click();
        await page.locator("text=GBP").click();
        await page.waitForTimeout(500);
      }

      // Set receive currency to NGN
      const receiveCurrencySelector = '[data-testid="receive-currency-select"], [name="receiveCurrency"], select[aria-label*="Receive"]';
      const receiveCurrencyField = page.locator(receiveCurrencySelector).first();
      if (await receiveCurrencyField.isVisible()) {
        await receiveCurrencyField.click();
        await page.locator("text=NGN").click();
        await page.waitForTimeout(500);
      }

      // Set send amount to 100
      const amountSelector = '[data-testid="send-amount"], [name="sendAmount"], input[placeholder*="Amount"]';
      const amountField = page.locator(amountSelector).first();
      if (await amountField.isVisible()) {
        await amountField.clear();
        await amountField.fill("100");
        await page.keyboard.press("Tab");
        await page.waitForTimeout(1000);
      }

      // Extract exchange rate
      const rateText =
        (await readText(page, "[data-testid='exchange-rate']", DEFAULT_TIMEOUT_MS)) ||
        (await readText(page, "[data-testid='rate']", DEFAULT_TIMEOUT_MS)) ||
        (await readText(page, "text=/Exchange rate/i", DEFAULT_TIMEOUT_MS));

      // Extract total fee
      const feeText =
        (await readText(page, "[data-testid='total-fee']", DEFAULT_TIMEOUT_MS)) ||
        (await readText(page, "[data-testid='fee']", DEFAULT_TIMEOUT_MS)) ||
        (await readText(page, "text=/Fee/i", DEFAULT_TIMEOUT_MS));

      // Extract receive amount
      const receiveText =
        (await readText(page, "[data-testid='receive-amount']", DEFAULT_TIMEOUT_MS)) ||
        (await readText(page, "[data-testid='recipient-amount']", DEFAULT_TIMEOUT_MS)) ||
        (await readText(page, "text=/You receive|Recipient gets/i", DEFAULT_TIMEOUT_MS));

      if (!rateText || !feeText || !receiveText) {
        throw new Error("Unable to read Remitly calculator values.");
      }

      const rate = parseNumber(rateText);
      const fee = parseNumber(feeText);
      const receiveAmount = parseNumber(receiveText);

      const quote: Quote = {
        providerId: "remitly",
        fromCurrency: "GBP",
        toCurrency: "NGN",
        sendAmount: 100,
        rate,
        fee,
        receiveAmount,
        fetchedAt: new Date().toISOString(),
        source: "live",
      };
      return quote;
    })();

    return await Promise.race([fetchPromise, timeoutPromise]);
  } catch (error) {
    throw new Error(
      `Failed to fetch Remitly quote: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  } finally {
    if (timeoutHandle) clearTimeout(timeoutHandle);
    if (page) {
      try {
        await (page as any).close();
      } catch {
        // Ignore close errors if already closed
      }
    }
    if (browser) {
      try {
        await (browser as any).close();
      } catch {
        // Ignore close errors if already closed
      }
    }
  }
}
