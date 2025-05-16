// app/api/reviews/[destinationId]/summary/route.ts
import { NextResponse } from "next/server";
import { summarizeReviews } from "@/lib/summarizeReviews";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const destinationId = url.pathname.split("/")[4]; // grab ID from URL segments

  try {
    const summary = await summarizeReviews(destinationId);
    return NextResponse.json({ summary });
  } catch (err) {
    console.error("Error generating summary:", err);
    return NextResponse.json({ error: "Failed to generate summary" }, { status: 500 });
  }
}
