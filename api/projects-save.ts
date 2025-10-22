import { supabaseAdmin, getClientId } from "./_supabase";

export default async function handler(req: any, res: any) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-client-id");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    return res.status(200).end();
  }
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
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json({ project: data });
  } catch (e: any) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(400).json({ error: e.message });
  }
}
