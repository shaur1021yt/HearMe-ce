import Groq from "groq-sdk"

export const runtime = "edge"

export async function POST(req: Request) {
  try {
    const { text, language } = await req.json()

    if (!process.env.GROQ_API_KEY) {
      throw new Error("Missing GROQ_API_KEY")
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
    const prompt = `Summarize the following transcript in ${language}.
Keep it short, clear, and accurate.\n\n${text}`

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 500,
    })

    const summary = completion.choices[0].message.content
    return Response.json({ summary })
  } catch (error) {
    console.error("[v0] Summarization error:", error)
    return Response.json({ error: "Failed to summarize text" }, { status: 500 })
  }
}
