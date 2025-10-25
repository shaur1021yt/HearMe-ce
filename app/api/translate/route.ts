// app/api/translate/route.ts
import Groq from "groq-sdk"

export const runtime = "nodejs" // Groq SDK requires Node.js runtime

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
})

export async function POST(req: Request) {
  try {
    const { text, fromLanguage, toLanguage } = await req.json()

    if (!text || !text.trim()) {
      return Response.json({ error: "No text provided" }, { status: 400 })
    }

    if (!process.env.GROQ_API_KEY) {
      console.error("[v0] GROQ_API_KEY missing")
      return Response.json(
        {
          error: "Groq API key not configured. Please add it in v0 → Settings → Environment Variables.",
        },
        { status: 500 }
      )
    }

    console.log(`[v0] Translating from ${fromLanguage} → ${toLanguage}`)

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are a professional translator. Translate the user's message from ${fromLanguage} to ${toLanguage}. 
Return ONLY the translated text, without any explanations or formatting.`,
        },
        { role: "user", content: text },
      ],
      temperature: 0.3,
      max_tokens: 1024, // ✅ Correct param name
    })

    const translated = completion.choices[0].message.content?.trim()

    if (!translated) {
      throw new Error("Groq returned an empty translation.")
    }

    console.log("[v0] Translation successful")

    return Response.json({
      original: text,
      translated,
    })
  } catch (error) {
    console.error("[v0] Translation error:", error)
    return Response.json({ error: "Failed to translate text" }, { status: 500 })
  }
}
