// api/_supabase.ts
import { createClient } from "@supabase/supabase-js";

// Este cliente usa el Service Role (solo en server) para saltar RLS y aplicar nuestras reglas
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE!,
  { auth: { persistSession: false } }
);

// Helper para leer el client_id (enviado por el front)
export function getClientId(req: any): string {
  // 1) Header x-client-id tiene prioridad
  const fromHeader = req.headers?.["x-client-id"];
  if (typeof fromHeader === "string" && fromHeader.trim()) return fromHeader.trim();

  // 2) body.client_id como fallback
  const fromBody = req.body?.client_id;
  if (typeof fromBody === "string" && fromBody.trim()) return fromBody.trim();

  throw new Error("Falta client_id (Header 'x-client-id' o body.client_id).");
}
