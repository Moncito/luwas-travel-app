const GOOGLE_API_KEY = process.env.GOOGLE_CSE_API_KEY
const GOOGLE_CX = process.env.GOOGLE_CSE_CX
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY

export async function fetchImageForPlace(placeName: string): Promise<string> {
  const cleanQuery = `${placeName} Philippines`;

  // 1. Google CSE
  try {
    const googleRes = await fetch(
      `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CX}&searchType=image&q=${encodeURIComponent(cleanQuery)}`
    );
    const googleJson = await googleRes.json();
    const googleImage = googleJson.items?.[0]?.link;
    if (googleImage) return googleImage;
  } catch (err) {
    console.error("Google image failed:", err);
  }

  // 2. Unsplash fallback
  try {
    const unsplashRes = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(placeName)}&client_id=${UNSPLASH_ACCESS_KEY}&per_page=1`
    );
    const unsplashJson = await unsplashRes.json();
    const unsplashImage = unsplashJson.results?.[0]?.urls?.regular;
    if (unsplashImage) return unsplashImage;
  } catch (err) {
    console.error("Unsplash fallback failed:", err);
  }

  // 3. Default fallback
  return "/images/default-travel.jpg";
}
