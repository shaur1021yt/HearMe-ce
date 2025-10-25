import Groq from "groq-sdk"

export const runtime = "nodejs"

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
})

export async function POST(req: Request) {
  try {
    const { text, language } = await req.json()

    if (!text?.trim()) {
      return Response.json({ error: "No text provided" }, { status: 400 })
    }

    console.log("[v0] Fixing inaudible parts with timestamps in", language)

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.6,
      max_tokens: 1024,
      messages: [
        {
          role: "system",
          content: `
You are a speech transcript fixer in ${language}.
When a part of the transcript is missing or unclear, insert a marker in this format:
[INAUDIBLE HH:MM:SS: your best guess]

- HH:MM:SS should be an estimated timestamp for where the unclear word/phrase occurred.
- Keep the rest of the transcript exactly the same.
- Never remove unclear parts; always mark them.
- Make contextually plausible guesses.

Examples:
Input: "I went to the [noise] yesterday."
Output: "I went to [INAUDIBLE 00:02:15: the concert] yesterday."

Input: "She [cut out] to me after the meeting."
Output: "She [INAUDIBLE 00:05:30: talked] to me after the meeting."
`,
        },
        {
          role: "user",
          content: text,
        },
      ],
    })

    const fixedText = completion.choices?.[0]?.message?.content?.trim()

    console.log("[v0] Transcript fixed with guesses and timestamps")

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
