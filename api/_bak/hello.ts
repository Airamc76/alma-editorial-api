import { allowCors, requireAppKey } from "./_sec";

export default function handler(req: any, res: any) {
  allowCors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  requireAppKey(req, res);
  res.status(200).send("OK from hello");
}
