/**
 * Vercel Cron Job: Fetch Live Quotes
 * 
 * Runs every 10 minutes via Vercel's cron scheduling.
 * This is a POST endpoint that triggers the live quote fetch script.
 * 
 * Schedule: every 10 minutes
 */

import { execSync } from "child_process";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// Allow only Vercel cron to call this endpoint
const VERCEL_CRON_SECRET = process.env.VERCEL_CRON_SECRET || "";

export async function POST(request: NextRequest) {
  // Verify Vercel cron secret
  const authHeader = request.headers.get("authorization");
  
  if (VERCEL_CRON_SECRET && authHeader !== `Bearer ${VERCEL_CRON_SECRET}`) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    // Execute the fetch-live-quotes script
    const output = execSync("npm run fetch:live-quotes", {
      encoding: "utf-8",
      timeout: 60000, // 60 second timeout
    });

    return NextResponse.json(
      {
        status: "success",
        message: "Live quotes fetched successfully",
        output: output.split("\n").slice(-5), // Last 5 lines
      },
      { status: 200 }
    );
  } catch (error: any) {
    const errorMessage = error.message || String(error);
    const stderr = error.stderr?.toString() || "";
    const stdout = error.stdout?.toString() || "";

    return NextResponse.json(
      {
        status: "error",
        message: "Failed to fetch live quotes",
        error: errorMessage,
        details: stderr || stdout,
      },
      { status: 500 }
    );
  }
}
