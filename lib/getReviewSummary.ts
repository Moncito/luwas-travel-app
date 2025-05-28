import { OpenAI } from 'openai'

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY, // or use a secret if server-side
  dangerouslyAllowBrowser: false, // for security
})

export async function getReviewSummary(comments: string[]) {
  if (!comments || comments.length === 0) return ''

  const prompt = `Summarize these travel reviews in 2 sentences:\n\n${comments.join('\n- ')}`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 100,
  })

  return completion.choices[0].message.content?.trim() || ''
}
