export async function POST(req) {
  const { modality, difficulty, messages, lang } = await req.json();

  const transcript = messages
    .filter((m) => !m.hidden)
    .map((m) => `${m.role === "user" ? "THERAPIST" : "PATIENT"}: ${m.content}`)
    .join("\n");

  const system = `You are a clinical supervisor reviewing a therapy trainee's session. The trainee was practicing ${modality} therapy at ${difficulty} level.

TRANSCRIPT:
${transcript}

Provide structured feedback in ${lang === "es" ? "Spanish" : "English"} covering:
1. **Strengths** - What the trainee did well (2-3 specific examples from the transcript)
2. **Areas for Growth** - Specific missed opportunities or unhelpful interventions (2-3 examples)
3. **Modality Alignment** - How well they used ${modality} principles
4. **Patient Rapport** - Quality of therapeutic alliance
5. **One Key Takeaway** - The single most important thing to improve

Be specific, reference actual lines from the transcript, and be encouraging but honest.`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: "Provide feedback now." }] }],
        generationConfig: { maxOutputTokens: 2048, temperature: 0.7 }
      }),
    }
  );

  const data = await response.json();
  if (data.error) return Response.json({ error: data.error.message }, { status: 400 });
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  return Response.json({ text });
}
