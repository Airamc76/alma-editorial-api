import { supabaseAdmin } from "./_supabase";
import { allowCors, requireAppKey } from "./_sec";

export default async function handler(req: any, res: any) {
  allowCors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  requireAppKey(req, res);
  if (req.method !== "GET") return res.status(405).send("Method not allowed");

  try {
    const project_id = req.query?.project_id;
    if (!project_id) throw new Error("Falta project_id");

    const { data, error } = await supabaseAdmin
      .from("chapters")
      .select("*")
      .eq("project_id", project_id)
      .order("idx", { ascending: true });

    if (error) throw error;
    res.status(200).json({ chapters: data });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
}
