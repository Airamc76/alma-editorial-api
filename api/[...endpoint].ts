// api/[...endpoint].ts
// Adaptado a los helpers existentes del repo (sin tipos de @vercel/node para evitar dependencias)
import { allowCors } from "./_utils/cors";
import { requireAppKey, getClientId } from "./_utils/auth";
import { supabaseAdmin as supabase } from "./_utils/supabase";
import chatHandler from "./chat"; // reutiliza el stream SSE existente

// Utilidad: parsear la parte después de /api/
function getPath(req: any) {
  const url = new URL(req.url, `https://${req.headers.host}`);
  return url.pathname.replace(/^\/api\//, "");
}

async function projectsList(req: any, res: any) {
  const clientId = getClientId(req);
  const { data, error } = await supabase
    .from("projects")
    .select("id, title, updated_at")
    .eq("client_id", clientId)
    .order("updated_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json({ projects: data ?? [] });
}

async function projectsSave(req: any, res: any) {
  const clientId = getClientId(req);
  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  const project = body?.project ?? {};
  project.client_id = clientId;

  const { data, error } = await supabase
    .from("projects")
    .upsert(project, { onConflict: "id", defaultToNull: false })
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json({ project: data });
}

async function projectsDelete(req: any, res: any) {
  const clientId = getClientId(req);
  const url = new URL(req.url, `https://${req.headers.host}`);
  const id = url.searchParams.get("id");
  if (!id) return res.status(400).json({ error: "Missing id" });

  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", id)
    .eq("client_id", clientId);

  if (error) return res.status(400).json({ error: error.message });
  res.json({ ok: true });
}

async function progressGet(req: any, res: any) {
  const clientId = getClientId(req);
  const url = new URL(req.url, `https://${req.headers.host}`);
  const projectId = url.searchParams.get("project_id");
  if (!projectId) return res.status(400).json({ error: "Missing project_id" });

  const { data, error } = await supabase
    .from("progress")
    .select("phase, percent")
    .eq("project_id", projectId)
    .eq("client_id", clientId)
    .maybeSingle();

  if (error) return res.status(500).json({ error: error.message });
  res.json({ progress: data ?? null });
}

async function progressSave(req: any, res: any) {
  const clientId = getClientId(req);
  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  const { project_id, phase, percent } = body ?? {};
  if (!project_id || typeof phase !== "number") {
    return res.status(400).json({ error: "Missing project_id or phase" });
  }

  const updated_at = new Date().toISOString();
  const { error } = await supabase
    .from("progress")
    .upsert(
      { project_id, client_id: clientId, phase, percent, updated_at },
      { onConflict: "project_id,client_id" }
    );

  if (error) return res.status(400).json({ error: error.message });
  res.json({ ok: true, updated_at });
}

export default async function handler(req: any, res: any) {
  // CORS + preflight
  if (allowCors(req, res)) return;

  // API key común
  try {
    requireAppKey(req);
  } catch (_e: any) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const path = getPath(req); // ej: "projects-list", "progress-save", "chat"

  try {
    switch (path) {
      case "projects-list":
        if (req.method !== "GET") return res.status(405).end();
        return await projectsList(req, res);

      case "projects-save":
        if (req.method !== "POST") return res.status(405).end();
        return await projectsSave(req, res);

      case "projects-delete":
        if (req.method !== "DELETE") return res.status(405).end();
        return await projectsDelete(req, res);

      case "progress-get":
        if (req.method !== "GET") return res.status(405).end();
        return await progressGet(req, res);

      case "progress-save":
        if (req.method !== "POST") return res.status(405).end();
        return await progressSave(req, res);

      case "chat":
        if (req.method !== "POST") return res.status(405).end();
        // Reutilizamos el handler existente que ya streamea SSE
        return await chatHandler(req, res);

      default:
        return res.status(404).json({ error: "Not found" });
    }
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err?.message ?? "Internal error" });
  }
}
