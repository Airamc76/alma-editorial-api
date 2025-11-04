// api/alma.ts
import { allowCorsWrap } from "./_utils/cors";
import { requireAppKey, getClientId } from "./_utils/auth";
import { supabaseAdmin } from "./_utils/supabase";
import chatHandler from "./_utils/chat"; // opcional: reusar tu SSE existente

export default allowCorsWrap(async (req: any, res: any) => {
  try {
    // seguridad común
    requireAppKey(req);

    // el rewrite pondrá ?route=projects-get, progress-save, etc.
    const route = (req.query.route as string) || "";

    switch (route) {
      case "projects-list": {
        const cid = getClientId(req);
        const { data, error } = await supabaseAdmin
          .from("projects")
          .select("*")
          .eq("client_id", cid)
          .order("updated_at", { ascending: false });
        if (error) return res.status(400).json({ error: error.message });
        return res.json({ projects: data ?? [] });
      }

      case "projects-get": {
        const id = (req.query.id as string) || (req.query.project_id as string);
        if (!id) return res.status(400).json({ error: "Missing id" });
        const { data, error } = await supabaseAdmin
          .from("projects")
          .select("*")
          .eq("id", id)
          .single();
        if (error) return res.status(400).json({ error: error.message });
        return res.json({ project: data });
      }

      case "projects-save": {
        if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });
        const body = req.body?.project || {};
        const { data, error } = await supabaseAdmin
          .from("projects")
          .upsert(body)
          .select()
          .single();
        if (error) return res.status(400).json({ error: error.message });
        return res.json({ project: data });
      }

      case "projects-delete": {
        // acepta POST { id } y DELETE ?id= o ?project_id=
        const id = (
          (req.method === "POST" ? req.body?.id : req.query.id) as string
        ) || (req.query.project_id as string);
        if (!id) return res.status(400).json({ error: "Missing id" });
        const { error } = await supabaseAdmin.from("projects").delete().eq("id", id);
        if (error) return res.status(400).json({ error: error.message });
        return res.json({ ok: true });
      }

      case "progress-get": {
        const project_id = (req.query.project_id as string) || (req.query.id as string);
        const client_id = (req.query.client_id as string) || getClientId(req);
        if (!project_id || !client_id)
          return res.status(400).json({ error: "Missing project_id/client_id" });
        const { data, error } = await supabaseAdmin
          .from("progress")
          .select("phase, percent")
          .eq("project_id", project_id)
          .eq("client_id", client_id)
          .maybeSingle();
        if (error) return res.status(400).json({ error: error.message });
        return res.json({ progress: data || null });
      }

      case "progress-save": {
        if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });
        const { project_id, phase, percent, client_id: cidBody } = req.body || {};
        const client_id = cidBody || getClientId(req);
        if (!project_id || client_id == null || typeof phase !== "number") {
          return res.status(400).json({ error: "Missing project_id/client_id/phase" });
        }
        const payload = {
          project_id,
          client_id,
          phase,
          percent: percent ?? null,
          updated_at: new Date().toISOString(),
        };
        const { error } = await supabaseAdmin
          .from("progress")
          .upsert(payload, { onConflict: "project_id,client_id" });
        if (error) return res.status(400).json({ error: error.message });
        return res.json({ ok: true, updated_at: payload.updated_at });
      }

      case "chat": {
        if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });
        return await chatHandler(req, res);
      }

      default:
        return res.status(404).json({ error: `Unknown route: ${route}` });
    }
  } catch (e: any) {
    return res.status(401).json({ error: e.message || "Unauthorized" });
  }
});
