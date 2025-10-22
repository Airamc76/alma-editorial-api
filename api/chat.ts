import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * /api/chat
 * Proxy serverless con streaming de OpenAI (SSE).
 * Incluye CORS básico para que tu front (Lovable/otro dominio) pueda llamar.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Preflight CORS
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
          ? {
              role: "system",
              content: `Contexto de proyecto: ${JSON.stringify(memory.project)}`,
            }
          : null,
        ...((messages || []) as Array<{ role: string; content: string } | null>),
      ].filter((m): m is { role: string; content: string } => Boolean(m)),
    };

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!resp.ok || !resp.body) {
      const text = await resp.text();
      res.setHeader("Access-Control-Allow-Origin", "*");
      return res.status(500).send(`OpenAI error: ${text}`);
    }

    // Encabezados SSE + CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");

    const body: any = resp.body;
    if (body && typeof body.getReader === "function") {
      const reader = body.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) res.write(value);
        }
      } finally {
        res.end();
      }
    } else if (body && typeof body.pipe === "function") {
      body.pipe(res as any);
    } else {
      const text = await resp.text();
      res.write(text);
      res.end();
    }
  } catch (e: any) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(500).send(`Server error: ${e.message}`);
  }
}
