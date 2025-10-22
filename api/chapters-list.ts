import { supabaseAdmin } from "./_supabase";

export default async function handler(req: any, res: any) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-client-id");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    return res.status(200).end();
  }
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
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json({ chapters: data });
  } catch (e: any) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(400).json({ error: e.message });
  }
}
