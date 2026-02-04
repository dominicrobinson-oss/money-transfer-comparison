import { NextResponse } from "next/server";
import { transferProviders } from "@/lib/data/providers";
import { compareProviders } from "@/lib/comparison";

// GET /api/compare?amount=100
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const amountParam = searchParams.get("amount");

  if (!amountParam) {
    return NextResponse.json(
      { error: "Amount parameter is required" },
      { status: 400 }
    );
  }

  const amount = parseFloat(amountParam);

  if (isNaN(amount) || amount <= 0) {
    return NextResponse.json(
      { error: "Invalid amount. Must be a positive number" },
      { status: 400 }
    );
  }

  try {
    const comparison = compareProviders(transferProviders, amount);
    return NextResponse.json(comparison);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to compare providers" },
      { status: 500 }
    );
  }
}
