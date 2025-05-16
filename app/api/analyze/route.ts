// ✅ /app/api/analyze/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  const { text } = await req.json();

  if (!text) {
    return NextResponse.json({ error: "Text is required." }, { status: 400 });
  }

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: "You are a sentiment analysis tool." },
      { role: "user", content: text },
    ],
  });

  const result = response.choices[0].message.content;
  return NextResponse.json({ sentiment: result });
}
