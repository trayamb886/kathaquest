// This file lives at /api/turn.js, so Vercel automatically exposes it as
// POST https://your-project.vercel.app/api/turn
// No extra config needed.

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

const SYSTEM_PROMPT = `You are the Dungeon Master for "KathaQuest", an educational interactive
visual novel for children (ages 8-14) about Indian history and folklore.

Rules:
- Stay historically accurate. If unsure about a specific fact, keep details vague rather than inventing them.
- Keep narration to 2-4 short sentences, simple language suitable for kids.
- Always offer 2-4 clear choices.
- After 4 turns, wrap up the story with a satisfying ending and a short "Did you know?" historical fact.
- Respond ONLY with valid JSON, no markdown fences, no extra text, in exactly this shape:
{
  "narration": "string",
  "choices": ["string", "string", "string"],
  "image_prompt": "a short vivid visual description for an image generator, no character names, focus on setting/action/style",
  "is_ending": false
}`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST" });
  }

  try {
    // `history` is the running Gemini conversation array the frontend keeps in
    // its own state and sends back on every turn (stateless server = Vercel-friendly).
    const { history } = req.body;

    if (!Array.isArray(history) || history.length === 0) {
      return res.status(400).json({ error: "Missing conversation history" });
    }

    const body = {
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: history,
      generationConfig: { temperature: 0.9 },
    };

    const geminiResp = await fetch(`${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!geminiResp.ok) {
      const text = await geminiResp.text();
      throw new Error(`Gemini API error: ${geminiResp.status} ${text}`);
    }

    const data = await geminiResp.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
    const cleaned = rawText.replace(/```json|```/g, "").trim();
    const story = JSON.parse(cleaned);

    res.status(200).json(story);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate story turn" });
  }
}
