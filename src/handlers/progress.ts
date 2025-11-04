import { supa } from '../lib/supabase';

export async function getProgress(project_id: string, client_id: string) {
  const { data, error } = await supa
    .from('progress')
    .select('phase, percent')
    .eq('project_id', project_id)
    .eq('client_id', client_id)
    .maybeSingle();
  if (error) throw error;
  return { progress: data || null };
}

export async function saveProgress(body: any, client_id: string) {
  const { project_id, phase, percent } = body || {};
  const payload = {
    project_id,
    client_id,
    phase: Number(phase) || 0,
    percent: typeof percent === 'number' ? percent : null,
    updated_at: new Date().toISOString(),
  };
  const { error } = await supa
    .from('progress')
    .upsert(payload, { onConflict: 'project_id,client_id' });
  if (error) throw error;
  return { ok: true, updated_at: payload.updated_at };
}
