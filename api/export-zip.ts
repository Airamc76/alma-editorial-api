// api/export-zip.ts
import JSZip from "jszip";

function mdFrom(project: any, chapters: any[]) {
  const titulo = project?.title || "Título del libro";
  const md =
`# ${titulo}
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
  return md;
}

export default async function handler(req: any, res: any) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    return res.status(200).end();
  }
  if (req.method !== "POST") return res.status(405).send("Method not allowed");

  const { project, chapters } = req.body || {};
  const title = (project?.title || "Libro").toString().replace(/\s+/g, "_");

  const zip = new JSZip();

  // Markdown principal
  zip.file(`${title}.md`, mdFrom(project, chapters || []));

  // Carpeta /chapters con cada capítulo por separado
  const folder = zip.folder("chapters");
  (chapters || []).forEach((c: any, i: number) => {
    const name = `${String(i + 1).padStart(2, "0")}_${(c?.title || "capitulo").toString().replace(/\s+/g, "_")}.md`;
    folder?.file(name, `# ${c?.title || "Capítulo"}\n\n${c?.final || c?.v2 || c?.v1 || "<<PENDIENTE>>"}`);
  });

  const buffer = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/zip");
  res.setHeader("Content-Disposition", `attachment; filename="${title}.zip"`);
  res.send(buffer);
}
