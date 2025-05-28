import { OpenAI } from "openai";
import { NextRequest, NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { title, location } = await req.json();

    const prompt = `
You are a travel assistant. For the Philippine destination "${title}" located in "${location}", provide:
1. The best month(s) to visit based on weather and tourism.
2. A short weather summary (2-3 sentences).

Respond in this format:
BestTime: <e.g. December to February>
Summary: <your generated text>
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const text = completion.choices[0].message.content || "";

    const bestTime = text.match(/BestTime:\s*(.+)/i)?.[1]?.trim() || "N/A";
    const summary = text.match(/Summary:\s*(.+)/is)?.[1]?.trim() || "No summary provided.";

    return NextResponse.json({ bestTime, summary });
  } catch (err) {
    console.error("🌤️ Weather AI error:", err);
    return new NextResponse("AI error", { status: 500 });
  }
}
