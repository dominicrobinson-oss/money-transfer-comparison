import { NextRequest, NextResponse } from "next/server";
import { ProviderClick } from "@/types/core";
import { logProviderClick, logTelemetryEvent } from "@/lib/db";
import { getProviderById } from "@/lib/providers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log("Redirect providerId:", id);
  const searchParams = request.nextUrl.searchParams;
  const userAgent = request.headers.get("user-agent") || "unknown";
  const referrer = request.headers.get("referer");

  // Get query parameters
  const fromCurrency = searchParams.get("from") || "GBP";
  const toCurrency = searchParams.get("to") || "NGN";
  const amount = searchParams.get("amount");

  // Validate provider exists using provider config
  const provider = getProviderById(id);
  if (!provider) {
    return NextResponse.json(
      { error: "Provider not found" },
      { status: 404 }
    );
  }

  // Validate amount
  const sendAmount = amount ? parseFloat(amount) : 0;
  if (!amount || isNaN(sendAmount) || sendAmount <= 0) {
    return NextResponse.json(
      { error: "Invalid amount parameter" },
      { status: 400 }
    );
  }

  // Log provider click event
  const clickEvent: ProviderClick = {
    providerId: id,
    fromCurrency: fromCurrency as "GBP",
    toCurrency: toCurrency as "NGN",
    sendAmount,
    clickedAt: new Date().toISOString(),
    userAgent,
    referrer,
  };

  const clickRecord = {
    event: clickEvent,
    source: "redirect",
    createdAt: new Date().toISOString(),
  };

  try {
    await logProviderClick({
      providerId: clickEvent.providerId,
      fromCurrency: clickEvent.fromCurrency,
      toCurrency: clickEvent.toCurrency,
      amount: clickEvent.sendAmount,
      userAgent: clickEvent.userAgent,
      referrer: clickEvent.referrer,
      createdAt: clickEvent.clickedAt,
    });
    
    // Log telemetry event (anonymous, privacy-safe)
    logTelemetryEvent({
      eventType: "provider_clicked",
      providerId: id,
      corridor: `${fromCurrency}-${toCurrency}`,
      fromCurrency,
      toCurrency,
    }).catch((error) => {
      console.error("Failed to log telemetry:", error);
    });
  } catch (error) {
    console.error("Failed to log provider click:", error);
  }

  console.log("Provider Click Event:", clickRecord);

  // Redirect based on redirectStrategy
  let redirectUrl = provider.websiteUrl;
  if (provider.redirectStrategy === "affiliate-only" && provider.affiliateUrl) {
    try {
      redirectUrl = new URL(provider.affiliateUrl).toString();
    } catch {
      redirectUrl = provider.websiteUrl;
    }
  }
  const url = new URL(redirectUrl);
  url.searchParams.set("utm_source", "money-transfer-comparison");
  url.searchParams.set("utm_medium", "referral");
  url.searchParams.set(
    "utm_campaign",
    `${fromCurrency.toLowerCase()}-${toCurrency.toLowerCase()}`
  );
  return NextResponse.redirect(url.toString(), { status: 302 });
}
