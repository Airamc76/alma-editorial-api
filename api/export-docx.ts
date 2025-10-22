// api/export-docx.ts
import { Document, Packer, Paragraph, HeadingLevel, TextRun } from "docx";

function sanitize(text?: string) {
  return (text ?? "<<PENDIENTE>>").toString();
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
  const title = sanitize(project?.title);

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({ text: title, heading: HeadingLevel.TITLE }),
          new Paragraph({ text: `Subtítulo: ${sanitize(project?.subtitle)}` }),
          new Paragraph({ text: `Autor: ${sanitize(project?.author)}` }),
          new Paragraph({ text: `Audiencia: ${sanitize(project?.audience)}` }),
          new Paragraph({ text: `Propuesta de valor: ${sanitize(project?.value_proposition)}` }),
          new Paragraph({ text: `Tono/Registro: ${sanitize(project?.tone)} / ${sanitize(project?.register)}` }),
          new Paragraph({ text: "" }),
          new Paragraph({ text: "Índice", heading: HeadingLevel.HEADING_1 }),
          ...(Array.isArray(chapters) ? chapters : []).map(
            (c: any, i: number) =>
              new Paragraph({ children: [new TextRun(`${i + 1}. ${sanitize(c?.title)}`)] })
          ),
          new Paragraph({ text: "" }),
          ...(Array.isArray(chapters) ? chapters : []).flatMap((c: any) => [
            new Paragraph({ text: sanitize(c?.title), heading: HeadingLevel.HEADING_1 }),
            new Paragraph({ text: sanitize(c?.final || c?.v2 || c?.v1) }),
            new Paragraph({ text: "" }),
          ]),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const fileName = `${title.replace(/\s+/g, "_") || "Libro"}.docx`;

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
  res.send(Buffer.from(buffer));
}
