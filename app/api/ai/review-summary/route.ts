import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { db } from '@/firebase/admin' // adjust path if needed

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  const { name, location } = await req.json()

  const prompt = `Write a short, friendly, and helpful review-style summary about a travel itinerary titled "${name}" located in "${location}". Highlight what tourists might experience, visit, or enjoy. Make it informative and inviting.`

  try {
    const chat = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 150,
    })

    const aiSummary = chat.choices[0]?.message?.content || ''

    // ✅ Firestore logging
    await db.collection('reviewLogs').add({
      source: 'openai',
      name,
      location,
      summary: aiSummary,
      timestamp: new Date(),
    })

    return NextResponse.json({ summary: aiSummary })
  } catch (err) {
    console.error('[AI REVIEW ERROR]', err)
    return NextResponse.json({ summary: '' }, { status: 500 })
  }
}
