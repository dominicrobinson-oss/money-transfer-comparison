import { NextRequest, NextResponse } from "next/server";
import { logTelemetryEvent, TelemetryEventRecord } from "@/lib/db";

/**
 * POST /api/telemetry
 * 
 * Privacy-safe anonymous telemetry endpoint
 * - No PII collected
 * - Fire-and-forget from client
 * - Non-blocking
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventType, data } = body;

    if (!eventType) {
      return NextResponse.json(
        { error: "eventType required" },
        { status: 400 }
      );
    }

    // Extract telemetry data (all optional, privacy-safe)
    const event: TelemetryEventRecord = {
      eventType,
      corridor: data?.corridor,
      amountBucket: data?.amountBucket,
      fromCurrency: data?.fromCurrency,
      toCurrency: data?.toCurrency,
      providerId: data?.providerId,
    };

    // Log to database (fire-and-forget, don't wait)
    logTelemetryEvent(event).catch((error) => {
      // Silently log errors - telemetry should never break the app
      console.error("Telemetry logging failed:", error);
    });

    // Return immediately (non-blocking)
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    // Silently fail - telemetry should never break the app
    console.error("Telemetry error:", error);
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
