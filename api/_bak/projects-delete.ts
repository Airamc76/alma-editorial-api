import { allowCorsWrap } from "./_utils/cors";
import { requireAppKey } from "./_utils/auth";
import { supabaseAdmin } from "./_utils/supabase";

export default allowCorsWrap(async function handler(req: any, res: any) {
  try {
    requireAppKey(req);

    let id = '';
    if (req.method === 'POST') {
      id = (req.body?.id as string) || '';
    } else if (req.method === 'DELETE') {
      id = (req.query.project_id as string) || (req.query.id as string) || '';
    } else if (req.method === 'OPTIONS') {
      return res.status(204).end();
    } else {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    if (!id) return res.status(400).json({ error: 'Missing id' });

    const { error } = await supabaseAdmin.from('projects').delete().eq('id', id);
    if (error) return res.status(400).json({ error: error.message });

    res.json({ ok: true });
  } catch (e: any) {
    res.status(401).json({ error: e.message || 'Unauthorized' });
  }
});
