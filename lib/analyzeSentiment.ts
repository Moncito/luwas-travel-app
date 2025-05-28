// lib/analyzeSentiment.ts

import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Make sure to set this in your .env.local
});

export const analyzeSentiment = async (comment: string) => {
  const prompt = `
You are a travel sentiment analyzer. Analyze this review:

"${comment}"

1. Sentiment (choose one): Positive, Neutral, or Negative.
2. Top 2-3 keywords or phrases that best describe this review.

Format:
Sentiment: <positive|neutral|negative>
Keywords: [ "keyword1", "keyword2", "keyword3" ]
`;

  const res = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
  });

  const text = res.choices[0].message.content || "";

  // Simple extract (can be improved)
  const sentimentMatch = text.match(/Sentiment:\s*(.*)/i);
  const keywordsMatch = text.match(/Keywords:\s*(\[.*\])/i);

  const sentiment = sentimentMatch?.[1]?.toLowerCase() ?? "neutral";
  const keywords = keywordsMatch ? JSON.parse(keywordsMatch[1]) : [];

  return {
    sentiment,
    keywords,
  };
};
