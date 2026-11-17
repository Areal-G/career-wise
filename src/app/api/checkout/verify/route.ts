import { NextResponse } from "next/server";

// Portfolio demo build: payments are off, so there is never a session to verify.
export async function GET() {
  return NextResponse.json({ error: "Payments are disabled in the demo." }, { status: 503 });
}
