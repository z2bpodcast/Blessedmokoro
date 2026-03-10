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
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1000,
        system: systemPrompt,
        messages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Anthropic API error:", JSON.stringify(data));
      return NextResponse.json(
        { error: "Coach Manlaw is temporarily unavailable.", detail: data },
        { status: response.status }
      );
    }

    console.log("Anthropic response type:", data.stop_reason, "content blocks:", data.content?.length);
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