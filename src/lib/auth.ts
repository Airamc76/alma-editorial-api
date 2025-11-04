export function requireAppKey(req: any) {
  const got = req.headers['x-app-key'] as string | undefined;
  const must = process.env.APP_KEY;
  if (!must || got !== must) throw new Error('Unauthorized');
}

export function getClientId(req: any) {
  return (
    (req.headers['x-client-id'] as string) ||
    (req.query?.client_id as string) ||
    (req.body?.client_id as string) ||
    'anon'
  );
}

export function getAllowedOrigin() {
  const env = process.env.ALLOWED_ORIGIN || '';
  return env.split(',')[0]?.trim() || '*';
}
