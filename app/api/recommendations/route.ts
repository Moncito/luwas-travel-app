import { NextRequest, NextResponse } from "next/server";
import { fetchImageForPlace } from "@/lib/fetchImage";
import OpenAI from "openai";

export const dynamic = "force-dynamic";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface Place {
  title: string;
  description: string;
  link: string;
  image: string;
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!lat || !lon) {
    return NextResponse.json({ error: "Missing lat or lon" }, { status: 400 });
  }

  const radius = 10000;

  const overpassQuery = `
    [out:json][timeout:25];
    (
      node["tourism"](around:${radius},${lat},${lon});
      node["historic"](around:${radius},${lat},${lon});
      node["natural"](around:${radius},${lat},${lon});
      node["leisure"](around:${radius},${lat},${lon});
      node["amenity"="place_of_worship"](around:${radius},${lat},${lon});
    );
    out center 6;
  `;

  try {
    const res = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: overpassQuery,
    });

    const json = await res.json();
    const elements = json.elements || [];

    const seen = new Set();
    const places: Place[] = [];

    for (const item of elements) {
      const name = item.tags?.name;
      if (!name || seen.has(name)) continue;
      seen.add(name);

      const image = await fetchImageForPlace(name);
      places.push({
        title: name,
        description: item.tags?.description || "A recommended spot nearby.",
        link: `https://www.google.com/maps/search/?api=1&query=${item.lat},${item.lon}`,
        image,
      });

      if (places.length >= 3) break;
    }

    if (places.length > 0) {
      return NextResponse.json({ places });
    }

    // 🧠 OpenAI fallback
    const aiPrompt = `
Suggest 3 must-visit tourist attractions near latitude ${lat} and longitude ${lon} (Palawan area).
Each item must follow this format:
1. Title – Short description.

Be clear, local, and helpful to travelers. Avoid generic or repeated names.`;

    const chat = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: aiPrompt }],
    });

    const aiResponse = chat.choices[0].message.content || "";

    const aiPlaces: Place[] = [];

    const lines = aiResponse.split("\n").filter((line) => line.trim() !== "");
    for (const line of lines) {
      const match = line.match(/^\d+\.\s*(.+?)\s*(–|-)\s*(.+)$/);
      if (!match) continue;

      const [, title, description] = match; // ✅ destructure without unused _
      const image = await fetchImageForPlace(title);
      aiPlaces.push({
        title,
        description,
        link: `https://www.google.com/maps/search/?q=${encodeURIComponent(title)}`,
        image,
      });

      if (aiPlaces.length >= 3) break;
    }

    return NextResponse.json({ places: aiPlaces });
  } catch (err) {
    console.error("❌ Recommendation error:", err);
    return NextResponse.json({ places: [] });
  }
}
