import { supa } from '../lib/supabase';

export async function listProjects(clientId: string) {
  const { data, error } = await supa
    .from('projects')
    .select('*')
    .eq('client_id', clientId)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return { projects: data ?? [] };
}

export async function getProject(id: string) {
  const { data, error } = await supa.from('projects').select('*').eq('id', id).single();
  if (error) throw error;
  return { project: data };
}

export async function saveProject(body: any, clientId: string) {
  const row = { ...(body?.project || {}), client_id: clientId };
  const { data, error } = await supa.from('projects').upsert(row).select().single();
  if (error) throw error;
  return { project: data };
}

export async function deleteProjectById(id: string, clientId: string) {
  const { error } = await supa.from('projects').delete().eq('id', id).eq('client_id', clientId);
  if (error) throw error;
  return { ok: true };
}
