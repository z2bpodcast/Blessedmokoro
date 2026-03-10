import { NextRequest, NextResponse } from "next/server";

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY ?? "";

export async function POST(req: NextRequest) {
  try {
    const { messages, systemPrompt } = await req.json();

    console.log("KEY LENGTH:", ANTHROPIC_KEY.length);
    console.log("KEY START:", ANTHROPIC_KEY.substring(0, 20));

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_KEY,
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
    console.log("ANTHROPIC STATUS:", response.status);
    console.log("ANTHROPIC RESPONSE:", JSON.stringify(data).substring(0, 200));

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