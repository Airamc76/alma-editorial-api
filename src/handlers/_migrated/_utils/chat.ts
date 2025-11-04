// api/_utils/chat.ts
// Streaming chat helper without CORS/auth checks; alma.ts handles those.
export default async function handleChatStream(req: any, res: any) {
  const { messages, memory } = req.body || {};
  const systemPrompt = process.env.ALMA_SYSTEM_PROMPT || "Alma Editorial — Kit Universal";
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
    return res.status(500).send(`OpenAI error: ${text}`);
  }

  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");

  const reader = (upstream.body as ReadableStream).getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = typeof value === "string" ? value : decoder.decode(value, { stream: true });
    res.write(chunk);
  }

  res.end();
}
