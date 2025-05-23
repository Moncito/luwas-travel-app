import { db } from '@/firebase/admin'
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function GET(req: NextRequest) {
  const destinationId = req.nextUrl.searchParams.get('destinationId')

  if (!destinationId) {
    return NextResponse.json({ summary: '', keywords: [] }, { status: 400 })
  }

  try {
    const snapshot = await db
      .collection('reviews')
      .where('destinationId', '==', destinationId)
      .orderBy('createdAt', 'desc')
      .get()

    const reviews = snapshot.docs.map((doc) => doc.data()?.comment).filter(Boolean)

    if (!reviews.length) {
      return NextResponse.json({
        summary: 'There are no reviews yet for this destination.',
        keywords: [],
      })
    }

    const prompt = `
You are an AI tour assistant. Summarize the following travel reviews in 2 sentences, and extract 3-5 relevant keywords or themes.

Reviews:
${reviews.join('\n')}

Respond with a JSON object in this format:
{
  "summary": "summary here",
  "keywords": ["keyword1", "keyword2"]
}
`

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    })

    const text = response.choices[0].message?.content || '{}'
    const parsed = JSON.parse(text)

    return NextResponse.json({
      summary: parsed.summary || '',
      keywords: parsed.keywords || [],
    })
  } catch (error) {
    console.error('[AI SUMMARY ERROR]', error)

    // ✅ Fallback response to prevent page crash
    return NextResponse.json({
      summary: 'Summary is currently unavailable. Please check back later.',
      keywords: [],
    }, { status: 200 })
  }
}
