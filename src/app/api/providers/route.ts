import { NextResponse } from "next/server";
import { transferProviders } from "@/lib/data/providers";

// GET /api/providers
export async function GET() {
  return NextResponse.json({
    providers: transferProviders,
    count: transferProviders.length,
  });
}
