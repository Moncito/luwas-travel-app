import { db } from "@/firebase/server";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function summarizeReviews(destinationId: string) {
  const snapshot = await db
    .collection("reviews")
    .where("destinationId", "==", destinationId)
    .get();

  const reviews = snapshot.docs.map((doc) => doc.data().comment).filter(Boolean);

  if (reviews.length === 0) {
    return "No reviews available yet for this destination.";
  }

  const prompt = `
You're a travel assistant. Summarize the following user reviews into one short paragraph (2-3 sentences max). Mention key themes and highlight both positive and negative feedback if present. Be neutral and clear.

Reviews:
${reviews.map((r, i) => `${i + 1}. ${r}`).join("\n")}
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  const summary = response.choices[0].message?.content?.trim() || "";

  return summary;
}
