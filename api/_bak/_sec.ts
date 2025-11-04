// api/_sec.ts
function normalizeList(value?: string) {
  return (value || "*")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
}

function matchOrigin(origin: string, patterns: string[]) {
  if (!origin) return false;
  try {
    const o = new URL(origin);
    for (const p of patterns) {
      if (p === "*") return true;
      const pat = p.trim();
      const u = new URL(pat.replace("*.", "sub.")); // para parsear
      const wantHost = u.host.replace(/^sub\./, "");
      const protoOK = !u.protocol || u.protocol === o.protocol;
      if (!protoOK) continue;

      // match exacto
      if (pat.indexOf("*.") === -1 && pat === origin) return true;

      // wildcard: *.dominio.tld
      if (pat.indexOf("*.") !== -1 && o.host.endsWith(wantHost)) return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function allowCors(req: any, res: any) {
  const allowList = normalizeList(process.env.ALLOWED_ORIGIN);
  const origin = req.headers.origin || "";
  const ok = matchOrigin(origin, allowList);

  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Origin", ok ? origin : "null");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

  // Refleja lo que pide el navegador en preflight
  const reqHeaders =
    (req.headers["access-control-request-headers"] as string) ||
    "Content-Type, x-client-id, x-app-key, Authorization";
  res.setHeader("Access-Control-Allow-Headers", reqHeaders);

  res.setHeader("Access-Control-Max-Age", "86400");
}

export function withCors(handler: (req: any, res: any) => Promise<any> | any) {
  return async (req: any, res: any) => {
    const allowed = normalizeList(process.env.ALLOWED_ORIGIN);
    const origin = req.headers.origin || "";
    const ok = matchOrigin(origin, allowed);

    res.setHeader("Vary", "Origin");
    if (ok) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    }
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "content-type, x-app-key, x-client-id, authorization"
    );
    res.setHeader("Access-Control-Max-Age", "86400");
    if (req.method === "OPTIONS") return res.status(204).end();
    return handler(req, res);
  };
}

export function requireAppKey(req: any, res: any) {
  const key = req.headers?.["x-app-key"];
  if (!process.env.APP_KEY || key !== process.env.APP_KEY) {
    res.status(401).json({ error: "Unauthorized" });
    throw new Error("UNAUTHORIZED");
  }
}
