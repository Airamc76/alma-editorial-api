// api/projects-get.ts
import { allowCors } from "./_utils/cors";
import { requireAppKey, getClientId } from "./_utils/auth";
import { supabaseAdmin } from "./_utils/supabase";

export default async function handler(req: any, res: any) {
  if (allowCors(req, res)) return;
  try {
    requireAppKey(req);
  } catch (e: any) {
    return res.status(401).json({ error: e.message || "Unauthorized" });
  }

  if (req.method !== "GET") return res.status(405).json({ error: "Method Not Allowed" });

  const project_id = (req.query.project_id as string) || "";
  if (!project_id) return res.status(400).json({ error: "project_id required" });

  let client_id: string;
  try {
    client_id = getClientId(req);
  } catch (e: any) {
    return res.status(400).json({ error: e.message || "client_id required" });
  }

  const { data: project, error: e1 } = await supabaseAdmin
    .from("projects")
    .select("*")
    .eq("id", project_id)
    .single();
  if (e1) return res.status(500).json({ error: e1.message });

  const { data: chapters, error: e2 } = await supabaseAdmin
    .from("chapters")
    .select("*")
    .eq("project_id", project_id)
    .order("idx", { ascending: true });
  if (e2) return res.status(500).json({ error: e2.message });

  const { data: progress, error: e3 } = await supabaseAdmin
    .from("progress")
    .select("phase,percent")
    .eq("project_id", project_id)
    .eq("client_id", client_id)
    .maybeSingle();
  if (e3) return res.status(500).json({ error: e3.message });

  return res.status(200).json({
    project,
    chapters: chapters || [],
    progress: progress || null,
  });
}
