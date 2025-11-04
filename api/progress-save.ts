import { allowCorsWrap } from "./_utils/cors";
import { requireAppKey, getClientId } from "./_utils/auth";
import { supabaseAdmin } from "./_utils/supabase";

export default allowCorsWrap(async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    requireAppKey(req);

    const { project_id, phase, percent, client_id: clientFromBody } = req.body || {};
    const client_id = clientFromBody || getClientId(req);

    if (!project_id) return res.status(400).json({ error: 'Missing project_id' });
    if (typeof phase !== 'number') return res.status(400).json({ error: 'Missing/invalid phase' });
    if (client_id == null) return res.status(400).json({ error: 'Missing client_id' });

    const updated_at = new Date().toISOString();
    const payload = { project_id, client_id, phase, percent: percent ?? null, updated_at };

    const { error } = await supabaseAdmin
      .from('progress')
      .upsert(payload, { onConflict: 'project_id,client_id' });

    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ ok: true, updated_at });
  } catch (e: any) {
    return res.status(401).json({ error: e.message || 'Unauthorized' });
  }
});
