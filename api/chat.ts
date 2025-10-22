// Tipado simple para evitar fricciones: any
export default async function handler(req: any, res: any) {
  // CORS preflight
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    return res.status(200).end();
  }
  if (req.method !== "POST") return res.status(405).send("Method not allowed");

  try {
    const { messages, memory } = req.body || {};
    const systemPrompt =
      process.env.ALMA_SYSTEM_PROMPT || "Alma Editorial — Kit Universal";
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

    const payload = {
      model,
      stream: true,
      messages: [
        { role: "system", content: systemPrompt },
        memory?.project
          ? { role: "system", content: `Contexto de proyecto: ${JSON.stringify(memory.project)}` }
          : null,
        ...(messages || []),
      ].filter(Boolean),
    };

    const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!upstream.ok || !upstream.body) {
      const text = await upstream.text();
      res.setHeader("Access-Control-Allow-Origin", "*");
      return res.status(500).send(`OpenAI error: ${text}`);
    }

    // Encabezados SSE + CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");

    // Leer Web ReadableStream y escribir en la respuesta Node
    const reader = (upstream.body as ReadableStream).getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = typeof value === "string" ? value : decoder.decode(value, { stream: true });
      res.write(chunk); // envía tal cual el SSE de OpenAI (líneas "data: ...\n\n")
    }

    res.end();
  } catch (e: any) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(500).send(`Server error: ${e.message}`);
  }
}
