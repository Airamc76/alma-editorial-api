import { supabaseAdmin } from "./_supabase";
import { allowCors, requireAppKey } from "./_sec";

export default async function handler(req: any, res: any) {
  allowCors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  requireAppKey(req, res);
  if (req.method !== "POST") return res.status(405).send("Method not allowed");

  try {
    const { project_id, chapters } = req.body || {};
    if (!project_id || !Array.isArray(chapters)) {
      throw new Error("Faltan project_id o chapters[]");
    }

    const rows = chapters.map((c: any, i: number) => {
      const row: any = {
        project_id,
        idx: typeof c.idx === "number" ? c.idx : i,
        title: c.title ?? `Capítulo ${i + 1}`,
        v1: c.v1 ?? null,
        v2: c.v2 ?? null,
        final: c.final ?? null,
        status: c.status ?? "draft",
        updated_at: new Date().toISOString(),
      };
      // Solo incluir id si viene definido (así Postgres usa default gen_random_uuid())
      if (c.id) row.id = c.id;
      return row;
    });

    const { data, error } = await supabaseAdmin
      .from("chapters")
      .upsert(rows, { onConflict: "id", ignoreDuplicates: false })
      .select();

    if (error) throw error;
    res.status(200).json({ chapters: data });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
}
