import { NextRequest, NextResponse } from "next/server";
import { logProviderClick } from "@/lib/db";

/**
 * POST /api/provider-clicks
 * Logs enhanced provider click telemetry for revenue analytics.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
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
      timestamp,
    } = body;

    if (!providerId || !fromCurrency || !toCurrency || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await logProviderClick({
      providerId,
      fromCurrency,
      toCurrency,
      amount,
      corridor,
      rankingPosition,
      signalShown,
      deviceType,
      userAgent: userAgent || request.headers.get("user-agent") || "",
      referrer: referrer || request.headers.get("referer") || null,
      createdAt: timestamp ? new Date(timestamp).toISOString() : new Date().toISOString(),
    });

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to log click" }, { status: 500 });
  }
}
