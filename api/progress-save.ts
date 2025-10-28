import { supabaseAdmin, getClientId } from "./_supabase";
import { allowCors, requireAppKey } from "./_sec";

export default async function handler(req: any, res: any) {
  allowCors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  requireAppKey(req, res);
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const client_id = getClientId(req);
    const { project_id, phase, percent } = req.body || {};

    if (!project_id || !client_id)
      return res.status(400).json({ error: "Missing fields" });

    const updated_at = new Date().toISOString();

    const { error } = await supabaseAdmin
      .from("progress")
      .upsert(
        {
          project_id,
          client_id,
          phase,
          percent,
          updated_at,
        },
        { onConflict: "project_id,client_id" }
      );

    if (error) return res.status(400).json({ error: error.message });

    return res.status(200).json({ ok: true, updated_at });
  } catch (e: any) {
    return res.status(400).json({ error: e.message });
  }
}
