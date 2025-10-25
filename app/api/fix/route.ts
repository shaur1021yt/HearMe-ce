// app/api/route.ts
import { createOpenAI } from "ai"
import { Groq } from "groq-sdk"
// app/api/test/route.ts
export async function GET() {
  return Response.json({
    hasKey: !!process.env.GROQ_API_KEY,
  })
}

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export const runtime = "edge"

export async function POST(req: Request) {
  const { text, language } = await req.json()

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: `You are helping to fill in inaudible parts of a speech transcript in ${language}. Replace [INAUDIBLE: guess] with the most contextually appropriate word or phrase.`,
      },
      { role: "user", content: text },
    ],
    temperature: 0.3,
    max_output_tokens: 1024,
  })

  const fixedText = response.choices[0].message.content

  return Response.json({ original: text, fixed: fixedText })
}
