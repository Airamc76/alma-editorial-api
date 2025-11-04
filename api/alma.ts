import { allowCors } from '../src/lib/cors';
import { requireAppKey, getClientId, getAllowedOrigin } from '../src/lib/auth';
import { listProjects, getProject, saveProject, deleteProjectById } from '../src/handlers/projects';
import { getProgress, saveProgress } from '../src/handlers/progress';
import { handleChat } from '../src/handlers/chat';

export default async function handler(req: any, res: any) {
  const origin = getAllowedOrigin();
  allowCors(res, origin);

  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    requireAppKey(req);
    const route = (req.query.route as string) || '';
    const clientId = getClientId(req);

    if (route === 'projects-list' && req.method === 'GET') {
      return res.json(await listProjects(clientId));
    }

    if (route === 'projects-get' && req.method === 'GET') {
      const id = (req.query.id as string) || (req.query.project_id as string);
      if (!id) return res.status(400).json({ error: 'missing id' });
      return res.json(await getProject(id));
    }

    if (route === 'projects-save' && req.method === 'POST') {
      return res.json(await saveProject((req as any).body, clientId));
    }

    if (route === 'projects-delete') {
      const id = ((req as any).body?.id as string) || (req.query.id as string) || (req.query.project_id as string);
      if (!id) return res.status(400).json({ error: 'missing id' });
      return res.json(await deleteProjectById(id, clientId));
    }

    if (route === 'progress-get' && req.method === 'GET') {
      const pid = (req.query.project_id as string) || (req.query.id as string);
      if (!pid) return res.status(400).json({ error: 'missing project_id' });
      return res.json(await getProgress(pid, clientId));
    }

    if (route === 'progress-save' && req.method === 'POST') {
      return res.json(await saveProgress((req as any).body, clientId));
    }

    if (route === 'chat') {
      return res.json(await handleChat(req));
    }

    return res.status(404).json({ error: 'Not found', route, method: req.method });
  } catch (err: any) {
    const msg = err?.message || 'Internal error';
    const code = msg === 'Unauthorized' ? 401 : 500;
    return res.status(code).json({ error: msg });
  }
}
