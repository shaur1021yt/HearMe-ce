import { generateText } from "ai"
export const runtime = "edge" // optional for speed

export async function POST(req: Request) {
  try {
    const { text, fromLanguage, toLanguage } = await req.json()

    if (!text || !text.trim()) {
      return Response.json({ error: "No text provided" }, { status: 400 })
    }

    if (!process.env.GROQ_API_KEY) {
      console.error("[v0] GROQ_API_KEY is missing")
      return Response.json(
        {
          error:
            "Groq API key not configured. Please add GROQ_API_KEY to environment variables.",
        },
        { status: 500 },
      )
    }

    console.log("[v0] Translating from", fromLanguage, "to", toLanguage)

    const { text: translatedText } = await generateText({
      // ✅ Use Groq provider
      model: groq("llama-3.3-70b-versatile"),

      prompt: `You are a professional translator.
Translate the following text from ${fromLanguage} to ${toLanguage}.
Provide **only** the translated text — no explanations, notes, or formatting.

Text:
${text}`,

      temperature: 0.3,
      maxOutputTokens: 1024,
    })

    console.log("[v0] Translation successful")

    return Response.json({
      original: text,
      translated: translatedText.trim(),
    })
  } catch (error) {
    console.error("[v0] Error translating text:", error)
    return Response.json({ error: "Failed to translate text" }, { status: 500 })
  }
}
