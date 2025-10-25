import Groq from "groq-sdk"

export const runtime = "nodejs"

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
})

export async function POST(req: Request) {
  try {
    const { text, fromLanguage, toLanguage } = await req.json()

    if (!text?.trim()) {
      return Response.json({ error: "No text provided" }, { status: 400 })
    }

    console.log(`[v0] Translating from ${fromLanguage} → ${toLanguage}`)

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.2, // low for consistency
      max_tokens: 1024,
      messages: [
        {
          role: "system",
          content: `
You are a strict professional translator.
Always translate the input text from ${fromLanguage} into ${toLanguage}.
Do not auto-detect language, do not mix languages, and do not output English unless ${toLanguage} is English.
Preserve tone, meaning, and natural fluency in ${toLanguage}.
        `,
        },
        {
          role: "user",
          content: `Translate the following text from ${fromLanguage} to ${toLanguage}:

${text}`,
        },
      ],
    })

    const translated = completion.choices[0].message.content?.trim()

    if (!translated) throw new Error("Groq returned an empty translation.")

    console.log("[v0] Translation successful")

    return Response.json({ original: text, translated })
  } catch (error) {
    console.error("[v0] Translation error:", error)
    return Response.json({ error: "Failed to translate text" }, { status: 500 })
  }
}
