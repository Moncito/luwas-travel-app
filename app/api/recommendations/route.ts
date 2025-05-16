import { NextRequest, NextResponse } from 'next/server'

async function fetchWikipediaImage(title: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`
    )
    const data = await res.json()
    return data?.thumbnail?.source || null
  } catch {
    return null
  }
}

async function fetchUnsplashImage(title: string): Promise<string | null> {
  try {
    const accessKey = process.env.UNSPLASH_ACCESS_KEY
    if (!accessKey) return null

    const query = `Tourism ${title}`
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
      query
    )}&client_id=${accessKey}&per_page=1`

    const res = await fetch(url)
    const data = await res.json()
    return data?.results?.[0]?.urls?.small || null
  } catch {
    return null
  }
}

export async function GET(req: NextRequest) {
  const lat = req.nextUrl.searchParams.get('lat')
  const lon = req.nextUrl.searchParams.get('lon')

  if (!lat || !lon) {
    return NextResponse.json({ error: 'Missing coordinates' }, { status: 400 })
  }

  const query = `
    [out:json];
    (
      node["tourism"](around:3000, ${lat}, ${lon});
      node["attraction"](around:3000, ${lat}, ${lon});
    );
    out center 10;
  `

  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`

  try {
    const response = await fetch(url)
    const data = await response.json()

    const enrichedPlaces = await Promise.all(
      data.elements.map(async (el: any) => {
        const title = el.tags?.name || 'Unnamed Place'

        const wikipediaImage = await fetchWikipediaImage(title)
        const unsplashImage = wikipediaImage ? null : await fetchUnsplashImage(title)

        return {
          title,
          description: el.tags?.description || 'Tourist spot near this destination.',
          link: `https://maps.google.com/?q=${el.lat},${el.lon}`,
          image:
            wikipediaImage ||
            unsplashImage ||
            'https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg',
          hasImage: !!(wikipediaImage || unsplashImage),
        }
      })
    )

    const topPlaces = enrichedPlaces
      .filter((place) => place.hasImage)
      .sort((a, b) => a.title.localeCompare(b.title)) // Optional: alphabetically
      .slice(0, 3)

    return NextResponse.json({ places: topPlaces })
  } catch (err) {
    console.error('[RECOMMENDATIONS ERROR]', err)
    return NextResponse.json({ places: [] }, { status: 500 })
  }
}
