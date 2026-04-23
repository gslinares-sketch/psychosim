export async function POST(req) {
  const { system, messages } = await req.json();

  // Convert messages to Gemini format
  const contents = messages.map(m => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }]
  }));

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: system }] },
        contents,
        generationConfig: { maxOutputTokens: 1024, temperature: 0.9 }
      }),
    }
  );

  const data = await response.json();
  if (data.error) return Response.json({ error: data.error.message }, { status: 400 });
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  return Response.json({ text });
}
