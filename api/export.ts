import { allowCors, requireAppKey } from "./_sec";

export default async function handler(req: any, res: any) {
  allowCors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  requireAppKey(req, res);
  if (req.method !== "POST") return res.status(405).send("Method not allowed");

  const { project, chapters } = req.body || {};

  const md = `# ${project?.title || "Título del libro"}
**Subtítulo:** ${project?.subtitle || "<<PENDIENTE>>"}
**Autor:** ${project?.author || "<<PENDIENTE>>"}
**Audiencia:** ${project?.audience || "<<PENDIENTE>>"}
**Propuesta de valor:** ${project?.value_proposition || "<<PENDIENTE>>"}
**Tono/Registro:** ${project?.tone || "<<PENDIENTE>>"} / ${project?.register || "<<PENDIENTE>>"}

---

## Índice
${(chapters || []).map((c: any, i: number) => `${i + 1}. ${c.title}`).join("\n")}

---

${(chapters || []).map((c: any) => `# ${c.title}\n\n${c.final || c.v2 || c.v1 || "<<PENDIENTE>>"}`).join("\n\n---\n\n")}
`;

  res.setHeader("Content-Type", "text/markdown; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="Libro_Compilado.md"');
  res.send(md);
}
