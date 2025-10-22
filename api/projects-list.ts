import { supabaseAdmin, getClientId } from "./_supabase";

export default async function handler(req: any, res: any) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-client-id");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    return res.status(200).end();
  }
  if (req.method !== "GET") return res.status(405).send("Method not allowed");

  try {
    const client_id = getClientId({ headers: req.headers }); // lee header
    const { data, error } = await supabaseAdmin
      .from("projects")
      .select("*")
      .eq("client_id", client_id)
      .order("updated_at", { ascending: false });

    if (error) throw error;
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json({ projects: data });
  } catch (e: any) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(400).json({ error: e.message });
  }
}
