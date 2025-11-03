import { allowCors } from "./_utils/cors";
import { requireAppKey } from "./_utils/auth";
import { supabaseAdmin } from "./_utils/supabase";

export default async function handler(req: any, res: any) {
  if (allowCors(req, res)) return;
  try {
    requireAppKey(req);
  } catch (e: any) {
    return res.status(401).json({ error: e.message || "Unauthorized" });
  }

  if (req.method !== "DELETE") return res.status(405).json({ error: "Method Not Allowed" });

  const project_id = req.query.project_id as string;
  if (!project_id) return res.status(400).json({ error: "project_id required" });

  // borro dependencias primero si no hay cascada
  const { error: eCh } = await supabaseAdmin.from("chapters").delete().eq("project_id", project_id);
  if (eCh) return res.status(500).json({ error: eCh.message });

  const { error: ePr } = await supabaseAdmin.from("progress").delete().eq("project_id", project_id);
  if (ePr) return res.status(500).json({ error: ePr.message });

  const { error } = await supabaseAdmin.from("projects").delete().eq("id", project_id);
  if (error) return res.status(500).json({ error: error.message });

  return res.status(200).json({ ok: true });
}
