import Groq from "groq-sdk"

export const runtime = "nodejs"

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
})

// Store cumulative translation for a session (in-memory example)
// In production, use Redis, Supabase, or DB keyed by user/session ID
const sessionTranslations: Record<string, string> = {}

export async function POST(req: Request) {
  try {
    const { textChunk, fromLanguage, toLanguage, sessionId } = await req.json()

    if (!textChunk?.trim()) {
      return Response.json({ error: "No text provided" }, { status: 400 })
    }

    // Append new chunk to previous transcript
    const previousTranslation = sessionTranslations[sessionId] || ""
    const cumulativeText = previousTranslation + "\n" + textChunk

    console.log(`[v0] Translating chunk for session ${sessionId}`)

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.2,
      max_tokens: 1024,
      messages: [
        {
          role: "system",
          content: `
You are a professional translator.
Always translate text from ${fromLanguage} to ${toLanguage}.
Never mix languages, never autodetect, never output English unless ${toLanguage} is English.
Preserve tone, meaning, and natural fluency.
Translate the cumulative transcript so far.
        `,
        },
        {
          role: "user",
          content: cumulativeText,
        },
      ],
    })

    const translated = completion.choices[0].message.content?.trim()

    if (!translated) throw new Error("Groq returned an empty translation.")

    // Save cumulative translation for next chunk
    sessionTranslations[sessionId] = translated

    console.log(`[v0] Translation successful for session ${sessionId}`)

    return Response.json({ translated })
  } catch (err) {
    console.error("[v0] Real-time translation error:", err)
    return Response.json({ error: "Failed to translate chunk" }, { status: 500 })
  }
}
