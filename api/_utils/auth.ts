// api/_utils/auth.ts
import { getClientId as getClientIdInner } from "../_supabase";

export function requireAppKey(req: any) {
  const headerKey = req.headers?.["x-app-key"];
  const appKey = process.env.APP_KEY;
  if (!appKey || headerKey !== appKey) {
    throw new Error("Unauthorized");
  }
}

export const getClientId = getClientIdInner;
