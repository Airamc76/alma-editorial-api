import { supabaseAdmin, getClientId } from "./_supabase";
import { allowCors, requireAppKey } from "./_sec";

export default async function handler(req: any, res: any) {
  allowCors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  requireAppKey(req, res);
  if (req.method !== "POST") return res.status(405).send("Method not allowed");

  try {
    const client_id = getClientId(req);
    const p = req.body?.project || {};
    const row = {
      id: p.id, client_id,
      title: p.title, subtitle: p.subtitle, author: p.author,
      audience: p.audience, value_proposition: p.value_proposition,
      tone: p.tone, register: p.register, updated_at: new Date().toISOString()
    };

    const { data, error } = await supabaseAdmin
      .from("projects")
      .upsert(row, { onConflict: "id", ignoreDuplicates: false })
      .select()
      .single();

    if (error) throw error;
    res.status(200).json({ project: data });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
}
