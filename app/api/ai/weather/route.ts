// app/api/ai/weather/route.ts

import { OpenAI } from "openai";
import { NextRequest, NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const { title, location } = await req.json();

    const prompt = `
You are a travel assistant. For the Philippine destination titled "${title}" located in "${location}", generate a JSON object that includes:

1. A list of ideal times to visit, based on actual weather, tourism patterns, and local events.
2. General weather information per month or season with average temperature ranges.

Return in this format (JSON only):

{
  "bestTime": [
    {
      "label": "January to March",
      "reason": "Cool and dry season, ideal for beach trips and hiking.",
      "emoji": "☀️"
    },
    {
      "label": "June to August",
      "reason": "Rainy season with occasional typhoons; fewer tourists.",
      "emoji": "🌧️"
    }
  ],
  "weatherInfo": [
    {
      "label": "Dry Season",
      "months": "November to May",
      "temperature": "25°C – 33°C (77°F – 91°F)"
    },
    {
      "label": "Wet Season",
      "months": "June to October",
      "temperature": "24°C – 30°C (75°F – 86°F)"
    }
  ]
}

Do not include explanations, markdown, or extra commentary. Only return valid JSON.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const raw = completion.choices[0].message.content || "";
    const parsed = JSON.parse(raw);

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("🔥 AI weather route error:", err);
    return NextResponse.json({ error: "Failed to fetch weather info." }, { status: 500 });
  }
}
