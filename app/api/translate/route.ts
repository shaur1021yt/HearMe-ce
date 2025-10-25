// app/api/translate/route.ts
import Groq from "groq-sdk"

export const runtime = "nodejs"

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
        { error: "Groq API key not configured. Please add it in v0 → Settings → Environment Variables." },
        { status: 500 }
      )
    }

    console.log(`[v0] Translating from ${fromLanguage} → ${toLanguage}`)

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are a **strict professional translator**.
Always translate the text from ${fromLanguage} **into ${toLanguage} only**.
Do not mix or include English unless ${toLanguage} is English.
Preserve tone, meaning, and natural fluency in ${toLanguage}.`,
        },
        {
          role: "user",
          content: `Translate this text faithfully from ${fromLanguage} to ${toLanguage}.
If the input already seems to be in ${toLanguage}, return it unchanged.

Text:
${text}`,
        },
      ],
      temperature: 0.2, // keeps it consistent
      max_tokens: 1024,
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
