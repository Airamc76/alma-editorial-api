// api/_utils/cors.ts
export function allowCors(req: any, res: any) {
  const origin = req.headers.origin ?? "";
  const allowed = (process.env.ALLOWED_ORIGIN || "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);

  if (allowed.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    // Durante pruebas, puedes habilitar wildcard si lo necesitas:
    // res.setHeader("Access-Control-Allow-Origin", "*");
  }

  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, DELETE");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "content-type,x-client-id,x-app-key,authorization"
  );
  res.setHeader("Access-Control-Max-Age", "86400");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return true;
  }
  return false;
}
