import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { enforceAiRateLimit, isAiRateLimitError } from "@/lib/ai-rate-limit";

export async function POST(request: NextRequest) {
  let message = "";
  
  try {
    const { response: authError, user } = await requireAuth(request);
    if (authError) return authError;
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await enforceAiRateLimit({
      userId: user.uid,
      tool: "emailTemplates",
    });

    const body = await request.json();
    message = body.message || "";

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Portfolio demo build: AI is offline, so the message comes back unchanged
    // (the same graceful fallback the app uses without an API key).
    return NextResponse.json({ improved: message });
  } catch (error) {
    if (isAiRateLimitError(error)) {
      return NextResponse.json(
        {
          error: "Too many AI requests. Please try again later.",
          retryAfter: error.retryAfterSeconds,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(error.retryAfterSeconds),
          },
        }
      );
    }

    console.error("AI message improvement error:", error);
    // Return original message on error (graceful degradation)
    return NextResponse.json({ improved: message || "Error processing message" });
  }
}
