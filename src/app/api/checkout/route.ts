import { NextResponse } from "next/server";

// Portfolio demo build: payments are off, so nothing ever reaches Stripe.
export async function POST() {
  return NextResponse.json({ error: "Payments are disabled in the demo." }, { status: 503 });
}
