// app/api/fix/route.ts
import Groq from "groq-sdk"

export const runtime = "nodejs" // groq-sdk requires Node APIs

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
})

export async function POST(req: Request) {
  try {
    const { text, language } = await req.json()

    if (!text?.trim()) {
      return Response.json({ error: "No text provided" }, { status: 400 })
    }

    if (!process.env.GROQ_API_KEY) {
      console.error("[v0] GROQ_API_KEY missing")
      return Response.json(
        { error: "Groq API key not configured" },
        { status: 500 },
      )
    }

    console.log("[v0] Guessing inaudible parts in", language)

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are a speech transcript assistant working in ${language}.
When parts of the transcript are missing or unclear, do NOT replace them.
Instead, insert a marker like [INAUDIBLE: your best guess].
Keep the rest of the transcript untouched and natural.

Example:
Input: "I went to the [noise] yesterday."
Output: "I went to [INAUDIBLE: the concert] yesterday."`,
        },
        { role: "user", content: text },
      ],
      temperature: 0.5,
      max_tokens: 1024,
    })

    const fixedText = completion.choices[0].message.content?.trim()

    console.log("[v0] Transcript fixed with guesses")

    return Response.json({
      original: text,
      fixed: fixedText,
    })
  } catch (error) {
    console.error("[v0] Transcript fix error:", error)
    return Response.json(
      { error: "Failed to fix transcript" },
      { status: 500 },
    )
  }
}

// Optional diagnostic route
export async function GET() {
  return Response.json({
    hasGroqKey: !!process.env.GROQ_API_KEY,
  })
}
