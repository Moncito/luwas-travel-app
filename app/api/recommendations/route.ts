import { NextRequest, NextResponse } from "next/server";
import { fetchImageForPlace } from "@/lib/fetchImage";

export const dynamic = "force-dynamic";

// Define the Overpass element structure
interface OverpassElement {
  type: "node";
  id: number;
  lat: number;
  lon: number;
  tags?: {
    name?: string;
    description?: string;
    [key: string]: string | undefined;
  };
}

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

  const radius = 1000;
  const overpassQuery = `
    [out:json][timeout:25];
    (
      node["tourism"](around:${radius},${lat},${lon});
      node["historic"](around:${radius},${lat},${lon});
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
    const rawPlaces: OverpassElement[] = json.elements || [];
    const seenTitles = new Set<string>();

    const places: Place[] = (
      await Promise.all(
        rawPlaces
          .filter((place): place is OverpassElement => !!place.tags?.name)
          .slice(0, 10)
          .map(async (place) => {
            const name = place.tags!.name!;
            if (seenTitles.has(name)) return null;
            seenTitles.add(name);

            const image = await fetchImageForPlace(name);

            return {
              title: name,
              description: place.tags?.description || "A recommended spot nearby.",
              link: `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lon}`,
              image,
            };
          })
      )
    ).filter((p): p is Place => p !== null).slice(0, 3);

    return NextResponse.json({ places });
  } catch (err) {
    console.error("🧭 Overpass error:", err);
    return NextResponse.json({ places: [] });
  }
}
