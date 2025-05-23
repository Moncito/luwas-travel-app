import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get('name')
  const location = req.nextUrl.searchParams.get('location')

  if (!name || !location) {
    return NextResponse.json({ error: 'Missing name or location' }, { status: 400 })
  }

  try {
    // Step 1: Search for the business
    const searchRes = await fetch(`https://api.yelp.com/v3/businesses/search?term=${encodeURIComponent(name)}&location=${encodeURIComponent(location)}`, {
      headers: {
        Authorization: `Bearer ${process.env.YELP_API_KEY}`,
      },
    })

    const searchJson = await searchRes.json()
    const biz = searchJson.businesses?.[0]
    if (!biz) return NextResponse.json({ summary: 'No Yelp data found.' })

    // Step 2: Get reviews for the found business
    const reviewsRes = await fetch(`https://api.yelp.com/v3/businesses/${biz.id}/reviews`, {
      headers: {
        Authorization: `Bearer ${process.env.YELP_API_KEY}`,
      },
    })

    const reviewsJson = await reviewsRes.json()

    return NextResponse.json({
      summary: biz.categories?.map((c: any) => c.title).join(', ') || 'Tourism spot',
      rating: biz.rating,
      url: biz.url,
      image: biz.image_url,
      reviews: reviewsJson.reviews?.slice(0, 3) || [],
    })
  } catch (err) {
    console.error('[YELP ERROR]', err)
    return NextResponse.json({ summary: 'Failed to fetch Yelp data.' }, { status: 500 })
  }
}
