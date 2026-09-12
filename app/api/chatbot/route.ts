import { NextResponse } from "next/server";
import { processChatbotMessage } from "@/server/chatbot/orchestrator";
import type { ChatbotRequest } from "@/server/chatbot/types";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({
      kind: "fallback",
      message: "Please send a valid VISAMGI chatbot message.",
      suggestions: ["Search the VISAMGI collection", "Ask about shipping or payment"],
    }, { status: 400 });
  }

  if (!body || typeof body !== "object" || typeof (body as Partial<ChatbotRequest>).message !== "string") {
    return NextResponse.json({
      kind: "fallback",
      message: "Please send your message as text.",
      suggestions: ["Search the VISAMGI collection", "Ask about shipping or payment"],
    }, { status: 400 });
  }

  try {
    const response = await processChatbotMessage(body as ChatbotRequest);
    return NextResponse.json(response);
  } catch {
    return NextResponse.json({
      kind: "fallback",
      message: "The VISAMGI assistant is temporarily unavailable. Please try again shortly.",
      suggestions: ["Try your request again", "Ask about VISAMGI store policies"],
    });
  }
}
