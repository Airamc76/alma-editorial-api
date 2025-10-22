import { supabaseAdmin } from "./_supabase";

export default async function handler(req: any, res: any) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-client-id");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    return res.status(200).end();
  }
  if (req.method !== "POST") return res.status(405).send("Method not allowed");

  try {
    const { project_id, chapters } = req.body || {};
    if (!project_id || !Array.isArray(chapters)) throw new Error("Faltan project_id o chapters[]");
    const rows = chapters.map((c: any, i: number) => ({
      id: c.id,
      project_id,
      idx: typeof c.idx === "number" ? c.idx : i,
      title: c.title,
      v1: c.v1, v2: c.v2, final: c.final,
      status: c.status || "draft",
      updated_at: new Date().toISOString()
    }));

    const { data, error } = await supabaseAdmin
      .from("chapters")
      .upsert(rows, { onConflict: "id", ignoreDuplicates: false })
      .select();

    if (error) throw error;
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json({ chapters: data });
  } catch (e: any) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(400).json({ error: e.message });
  }
}
