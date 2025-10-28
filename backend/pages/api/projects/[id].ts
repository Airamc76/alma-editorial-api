// backend/pages/api/projects/[id].ts
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

export default async function handler(req: any, res: any) {
  const clientId = (req.headers['x-client-id'] as string) || '';
  const { id } = req.query as { id: string };

  if (!clientId) return res.status(400).json({ error: 'Falta x-client-id' });

  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin
      .from('projects')
      .select('*')
      .eq('id', id)
      .eq('client_id', clientId)
      .single();

    if (error) return res.status(404).json({ error: 'No encontrado' });
    return res.status(200).json({ project: data });
  }

  if (req.method === 'PATCH') {
    // Actualiza nombre, phases y/o current_phase
    const { name, phases, current_phase } = (req.body as any) || {};

    const { data, error } = await supabaseAdmin
      .from('projects')
      .update({ ...(name && { name }), ...(phases && { phases }), ...(current_phase && { current_phase }) })
      .eq('id', id)
      .eq('client_id', clientId)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ project: data });
  }

  return res.status(405).json({ error: 'Método no permitido' });
}
