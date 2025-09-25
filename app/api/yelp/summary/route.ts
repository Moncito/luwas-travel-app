import { NextRequest, NextResponse } from "next/server";

interface YelpCategory {
  title: string;
}

interface YelpReview {
  text: string;
  rating: number;
  user: {
    name: string;
    image_url: string;
  };
}

/**
 * Attempts to find a Yelp business with multiple fallbacks:
 * 1. name + location
 * 2. location only
 * 3. location + "Philippines"
 */
async function searchBusiness(name: string, location: string) {
  const attempts = [
    { term: name, loc: location },                  // Try title + location
    { term: location, loc: location },              // Try location only
    { term: location, loc: `${location}, Philippines` }, // Try with country appended
  ];

  for (const attempt of attempts) {
    const searchRes = await fetch(
      `https://api.yelp.com/v3/businesses/search?term=${encodeURIComponent(
        attempt.term
      )}&location=${encodeURIComponent(attempt.loc)}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.YELP_API_KEY}`,
        },
      }
    );

    const searchJson = await searchRes.json();

    if (searchJson.businesses?.[0]) {
      return searchJson.businesses[0];
    }
  }

  return null; // No matches after all attempts
}

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get("name");
  const location = req.nextUrl.searchParams.get("location");

  if (!name || !location) {
    return NextResponse.json(
      { error: "Missing name or location" },
      { status: 400 }
    );
  }

  try {
    // 🔎 Try multiple strategies to find a business
    const biz = await searchBusiness(name, location);

    if (!biz) {
      console.warn("⚠️ No Yelp data found for:", { name, location });
      return NextResponse.json(
        {
          summary: "No Yelp data found.",
          rating: 0,
          url: "",
          image: "",
          reviews: [],
        },
        { status: 404 }
      );
    }

    // 🗣️ Fetch reviews
    const reviewsRes = await fetch(
      `https://api.yelp.com/v3/businesses/${biz.id}/reviews`,
      {
        headers: {
          Authorization: `Bearer ${process.env.YELP_API_KEY}`,
        },
      }
    );

    const reviewsJson = await reviewsRes.json();
    const reviews = (reviewsJson.reviews as YelpReview[])?.slice(0, 3) || [];

    // 🧠 Return Yelp data
    return NextResponse.json({
      summary:
        (biz.categories as YelpCategory[])?.map((c) => c.title).join(", ") ||
        "Tourism spot",
      rating: biz.rating || 0,
      url: biz.url || "",
      image: biz.image_url || "",
      reviews,
    });
  } catch (err) {
    console.error("[YELP ERROR]", err);
    return NextResponse.json(
      {
        summary: "Failed to fetch Yelp data.",
        rating: 0,
        url: "",
        image: "",
        reviews: [],
      },
      { status: 500 }
    );
  }
}
