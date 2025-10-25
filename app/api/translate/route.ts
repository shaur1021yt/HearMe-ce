import Groq from "groq-sdk"

export const runtime = "nodejs"

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! })

// Store cumulative translations per session
const sessionTranscripts: Record<string, string> = {}

export async function POST(req: Request) {
  try {
    const { textChunk, fromLanguage, toLanguage, sessionId } = await req.json()

    if (!textChunk?.trim()) {
      return Response.json({ error: "No text provided" }, { status: 400 })
    }

    const previousTranscript = sessionTranscripts[sessionId] || ""
    const cumulativeText = previousTranscript + "\n" + textChunk

    console.log(`[v0] Translating chunk for session ${sessionId} (${fromLanguage} → ${toLanguage})`)

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.15, // very deterministic
      max_tokens: 1024,
      messages: [
        {
          role: "system",
          content: `
You are a professional translator.
Always translate every piece of text from ${fromLanguage} to ${toLanguage}.
Do not mix languages, do not output English unless the target language is English.
Maintain tone, fluency, and meaning.
Do not skip or ignore any text, and treat short phrases carefully.
        `.trim(),
        },
        {
          role: "user",
          content: cumulativeText,
        },
      ],
    })

    const translated = completion.choices[0].message.content?.trim()
    if (!translated) throw new Error("Groq returned empty translation.")

    // Save cumulative translation
    sessionTranscripts[sessionId] = translated

    console.log(`[v0] Chunk translated successfully for session ${sessionId}`)

    return Response.json({ translated })
  } catch (err) {
    console.error("[v0] Translation error:", err)
    return Response.json({ error: "Failed to translate chunk" }, { status: 500 })
  }
}
