import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { messages, systemPrompt } = await request.json();
  const apiKey = process.env.ANTHROPIC_API_KEY || "";
  
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "anthropic-version": "2023-06-01",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({
      model: "claude-3-haiku-20240307",
      max_tokens: 1000,
      system: systemPrompt,
      messages,
    }),
  });

  const data = await res.json();
  const reply = data.content?.map((c: any) => c.text || "").join("") || "I am here with you.";
  return NextResponse.json({ reply });
}
