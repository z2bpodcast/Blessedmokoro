// FILE LOCATION: app/api/coach-manlaw/route.ts
// This proxies the Anthropic API call server-side to avoid CORS errors

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { messages, systemPrompt } = await req.json();

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: systemPrompt,
        messages,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Anthropic API error:", error);
      return NextResponse.json(
        { error: "Coach Manlaw is temporarily unavailable." },
        { status: response.status }
      );
    }

    const data = await response.json();
    const reply =
      data.content?.map((c: any) => c.text || "").join("") ||
      "I am here with you. Take a breath and tell me what is on your mind.";

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("Coach Manlaw route error:", err);
    return NextResponse.json(
      { error: "Something interrupted our connection." },
      { status: 500 }
    );
  }
}