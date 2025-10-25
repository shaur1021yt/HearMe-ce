import { generateText } from "ai"

export const runtime = "edge" // optional for speed on Vercel/Next

export async function POST(req: Request) {
  try {
    const { text, language } = await req.json()

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

    console.log("[v0] Summarizing text in", language)

    const { text: summary } = await generateText({
      // ✅ Use Groq provider wrapper instead of a plain string
      model: groq("llama-3.3-70b-versatile"),

      prompt: `Summarize the following transcript in ${language}. 
Provide a concise summary that captures the main points and key information.
Keep it brief, clear, and faithful to the content.

Transcript:
${text}`,

      temperature: 0.3,
      maxOutputTokens: 500,
    })

    console.log("[v0] Summarization successful")

    return Response.json({
      summary: summary.trim(),
    })
  } catch (error) {
    console.error("[v0] Summarization error:", error)
    return Response.json({ error: "Failed to summarize text" }, { status: 500 })
  }
}
