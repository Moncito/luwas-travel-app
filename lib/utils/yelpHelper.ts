// lib/utils/yelpHelper.ts

/**
 * Extracts a Yelp-friendly search name from a title.
 * Removes marketing/travel keywords and falls back to location if empty.
 */
export function extractYelpName(title: string, location: string): string {
  if (!title && location) return location;

  const cleaned = title
    .replace(/(Trip|Itinerary|Tour|Days|Nights|at|in|Package|Plan|Promo|Deal|Offer)/gi, "")
    .replace(/[^\w\s]/g, "") // remove special characters
    .trim()
    .split(" ")
    .filter((word) => word.length > 2) // ignore very short words
    .slice(0, 3) // Yelp works best with short search terms
    .join(" ");

  return cleaned || location || "Philippines";
}

/**
 * Extracts a Yelp-friendly location.
 * If multiple cities are comma-separated, only use the first one.
 */
export function extractYelpLocation(location: string): string {
  if (!location) return "Philippines";
  return location.split(",")[0].trim();
}
