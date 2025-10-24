// api/_sec.ts
function originMatches(origin: string, patterns: string[]) {
  if (!origin) return false;
  return patterns.some(p => {
    const pat = p.trim();
    if (pat === "*") return true;
    if (pat === origin) return true;
    // wildcard del tipo https://*.lovableproject.com
    if (pat.includes("*.")) {
      try {
        const url = new URL(origin);
        const host = url.host;
        const want = new URL(pat.replace("*.", "sub.")).host.replace(/^sub\./, "");
        return host.endsWith(want);
      } catch {
        return false;
      }
    }
    return false;
  });
}

export function allowCors(req: any, res: any) {
  const raw = (process.env.ALLOWED_ORIGIN || "*")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);

  const origin = req.headers.origin || "";
  const ok = originMatches(origin, raw);

  // Refleja el origin válido o usa el primero configurado
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Origin", ok ? origin : (raw[0] || "*"));
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

  // Toma los headers solicitados por el navegador en el preflight
  const reqHeaders =
    (req.headers["access-control-request-headers"] as string) ||
    "Content-Type, x-client-id, x-app-key, Authorization";
  res.setHeader("Access-Control-Allow-Headers", reqHeaders);

  // Permite cachear la respuesta de preflight
  res.setHeader("Access-Control-Max-Age", "86400");
}

export function requireAppKey(req: any, res: any) {
  const key = req.headers?.["x-app-key"];
  if (!process.env.APP_KEY || key !== process.env.APP_KEY) {
    res.status(401).json({ error: "Unauthorized" });
    throw new Error("UNAUTHORIZED");
  }
}
