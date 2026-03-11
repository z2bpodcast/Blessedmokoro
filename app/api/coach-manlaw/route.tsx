// FILE LOCATION: app/api/coach-manlaw/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { messages, systemPrompt } = await req.json();

    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey || apiKey.trim().length === 0) {
      console.error("ANTHROPIC_API_KEY is missing or empty");
      return NextResponse.json({ error: "API key not configured." }, { status: 500 });
    }

    const cleanKey = apiKey.trim();
    console.log("Key length:", cleanKey.length, "starts:", cleanKey.slice(0, 15));

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01",
        "x-api-key": cleanKey,
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1000,
        system: systemPrompt,
        messages,
      }),
    });

    const data = await response.json();
    console.log("Anthropic status:", response.status);
    console.log("Anthropic response:", JSON.stringify(data).slice(0, 300));

    if (!response.ok) {
      return NextResponse.json(
        { error: "Coach Manlaw is temporarily unavailable.", detail: data },
        { status: response.status }
      );
    }

    const reply =
      data.content?.map((c: any) => c.text || "").join("") ||
      "I am here with you. Take a breath and tell me what is on your mind.";

    return NextResponse.json({ reply });

  } catch (err) {
    console.error("Coach Manlaw route error:", err);
    return NextResponse.json({ error: "Something interrupted our connection." }, { status: 500 });
  }
}// Wed, Mar 11, 2026  6:36:00 AM
