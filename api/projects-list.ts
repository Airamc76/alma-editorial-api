import { supabaseAdmin, getClientId } from "./_supabase";
import { allowCors, requireAppKey } from "./_sec";

export default async function handler(req: any, res: any) {
  allowCors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  requireAppKey(req, res);
  if (req.method !== "GET") return res.status(405).send("Method not allowed");

  try {
    const client_id = getClientId({ headers: req.headers }); // lee header
    const { data, error } = await supabaseAdmin
      .from("projects")
      .select("*")
      .eq("client_id", client_id)
      .order("updated_at", { ascending: false });

    if (error) throw error;
    res.status(200).json({ projects: data });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
}
