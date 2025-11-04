import { allowCorsWrap } from "./_utils/cors";
import { requireAppKey, getClientId } from "./_utils/auth";
import { supabaseAdmin } from "./_utils/supabase";

export default allowCorsWrap(async function handler(req: any, res: any) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    requireAppKey(req);

    const project_id = (req.query?.project_id as string) || (req.query?.id as string);
    const client_id = (req.query?.client_id as string) || getClientId(req);

    if (!project_id) return res.status(400).json({ error: 'Missing project_id' });
    if (!client_id) return res.status(400).json({ error: 'Missing client_id' });

    const { data, error } = await supabaseAdmin
      .from('progress')
      .select('phase, percent')
      .eq('project_id', project_id)
      .eq('client_id', client_id)
      .maybeSingle();

    if (error) return res.status(400).json({ error: error.message });
    res.json({ progress: data || null });
  } catch (e: any) {
    res.status(401).json({ error: e.message || 'Unauthorized' });
  }
});
