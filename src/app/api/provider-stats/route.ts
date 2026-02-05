import { NextResponse } from "next/server";
import { getProviderClickStats } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const stats = await getProviderClickStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching provider stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch provider statistics" },
      { status: 500 }
    );
  }
}
