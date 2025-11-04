// backend/pages/api/projects/index.ts
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

export default async function handler(req: any, res: any) {
  const clientId = (req.headers['x-client-id'] as string) || '';

  if (!clientId) {
    return res.status(400).json({ error: 'Falta x-client-id en headers' });
  }

  if (req.method === 'GET') {
    // LISTADO
    const { data, error } = await supabaseAdmin
      .from('projects')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ projects: data ?? [] });
  }

  if (req.method === 'POST') {
    // CREAR
    const { name } = (req.body as any) || {};
    if (!name) return res.status(400).json({ error: 'Falta name' });

    const { data, error } = await supabaseAdmin
      .from('projects')
      .insert([{ client_id: clientId, name }])
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({ project: data });
  }

  return res.status(405).json({ error: 'Método no permitido' });
}
