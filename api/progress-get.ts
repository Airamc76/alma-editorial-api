import { supabaseAdmin, getClientId } from "./_supabase";
import { allowCors, requireAppKey } from "./_sec";

export default async function handler(req: any, res: any) {
  allowCors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  requireAppKey(req, res);
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const project_id = req.query?.project_id;
  let client_id = req.query?.client_id as string | undefined;
  if (!client_id) {
    try {
      client_id = getClientId(req);
    } catch {}
  }

  if (!project_id || !client_id)
    return res.status(400).json({ error: "Missing project_id or client_id" });

  const { data, error } = await supabaseAdmin
    .from("progress")
    .select("phase, percent")
    .eq("project_id", project_id)
    .eq("client_id", client_id)
    .single();

  if (error || !data) return res.status(200).json({ progress: null });

  return res.status(200).json({ progress: { phase: data.phase, percent: data.percent } });
}
