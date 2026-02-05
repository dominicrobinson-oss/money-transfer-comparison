import { NextRequest, NextResponse } from "next/server";
import { getLatestLiveQuotes } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Get currency parameters from query string, default to GBP → NGN
    const from = request.nextUrl.searchParams.get("from") || "GBP";
    const to = request.nextUrl.searchParams.get("to") || "NGN";

    const quotes = await getLatestLiveQuotes(from, to);

    if (!quotes || quotes.length === 0) {
      return NextResponse.json(
        { status: "empty", data: [] },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { status: "success", data: quotes },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error retrieving live quotes from database:", error);
    return NextResponse.json(
      { status: "empty", data: [] },
      { status: 200 }
    );
  }
}

