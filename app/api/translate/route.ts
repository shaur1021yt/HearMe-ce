import Groq from "groq-sdk"

export const runtime = "nodejs"

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! })

// In-memory session storage; use Redis/Supabase in production
const sessionTranscripts: Record<string, string> = {}

export async function POST(req: Request) {
  try {
    const { textChunk, fromLanguage, toLanguage, sessionId, addTimestamps, chunkTimestamp } =
      await req.json()

    if (!textChunk?.trim()) {
      return Response.json({ error: "No text provided" }, { status: 400 })
    }

    // Append chunk to cumulative transcript
    const previousTranscript = sessionTranscripts[sessionId] || ""
    const cumulativeTranscript = previousTranscript + "\n" + textChunk

    console.log(`[v0] Processing chunk for session ${sessionId}`)

    // Build system prompt
    let systemPrompt = `
You are a professional speech transcript assistant and translator.
- Fill inaudible segments with [INAUDIBLE: your best guess] based on context.
- Keep all other text untouched and natural.
- If 'addTimestamps' is true, include timestamps for each [INAUDIBLE: ...] as [INAUDIBLE HH:MM:SS: guess].
- Translate the final transcript from ${fromLanguage} to ${toLanguage} with full fidelity.
- Never mix languages, never output English unless ${toLanguage} is English.
    `.trim()

    if (!addTimestamps) {
      systemPrompt = systemPrompt.replace(
        /If 'addTimestamps' is true.*?\n/g,
        "",
      )
    }

    // Optional timestamp string
    const timestampNote = addTimestamps && chunkTimestamp ? `Current chunk timestamp: ${chunkTimestamp}` : ""

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.2,
      max_tokens: 1024,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: cumulativeTranscript + "\n" + timestampNote },
      ],
    })

    const processedTranslated = completion.choices[0].message.content?.trim()
    if (!processedTranslated) throw new Error("Groq returned empty output.")

    // Save cumulative transcript for next chunk
    sessionTranscripts[sessionId] = processedTranslated

    console.log(`[v0] Chunk processed successfully for session ${sessionId}`)

    return Response.json({ translated: processedTranslated })
  } catch (err) {
    console.error("[v0] Real-time fix & translation error:", err)
    return Response.json({ error: "Failed to process chunk" }, { status: 500 })
  }
}
