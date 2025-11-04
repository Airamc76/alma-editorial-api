// api/projects-get.ts
import { allowCorsWrap } from "./_utils/cors";
import { requireAppKey } from "./_utils/auth";
import { supabaseAdmin } from "./_utils/supabase";

export default allowCorsWrap(async function handler(req: any, res: any) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });
  try {
    requireAppKey(req);

    const id = (req.query.id as string) || (req.query.project_id as string);
    if (!id) return res.status(400).json({ error: 'Missing id' });

    const { data, error } = await supabaseAdmin
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json({ project: data });
  } catch (e: any) {
    res.status(401).json({ error: e.message || 'Unauthorized' });
  }
});
