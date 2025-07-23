import type { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import fs from "fs";
import fetch from "node-fetch";

export const config = { api: { bodyParser: false } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end("Only POST requests are allowed");

  const form = formidable({ keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: "Error parsing form data" });

    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    const { originalFilename, mimetype, size, filepath } = file;

    const token = process.env.NEXT_PUBLIC_YOUR_ACCESS_TOKEN;
    const botId = process.env.NEXT_PUBLIC_ID_APP;
    const version = process.env.GRAPH_API_VERSION || "v23.0";

    if (!token || !botId) {
      return res.status(500).json({ error: "Faltan TOKEN o BOT_ID en las variables de entorno" });
    }

    // Paso 1: Crear sesión de carga
    const bodyParams = new URLSearchParams({
      file_name: originalFilename ?? "image.jpg",
      file_length: size.toString(),
      file_type: mimetype ?? "image/jpeg",
    });

    console.log("🚀 Params sesión:", bodyParams.toString());

    const sessionRes = await fetch(`https://graph.facebook.com/${version}/${botId}/uploads`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: bodyParams,
    });

    const sessionJson: any = await sessionRes.json();
    if (!sessionJson.id) {
      return res.status(500).json({ error: "Error creando sesión de carga", debug: sessionJson });
    }

    const uploadUrl = `https://graph.facebook.com/${version}/upload:${sessionJson.id}`;

    const fileStream = fs.createReadStream(filepath);

    // Paso 2: Subir el archivo
    const uploadRes = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "file_offset": "0",
        "Content-Type": mimetype ?? "image/jpeg",
        "Content-Length": size.toString(),
      },
      body: fileStream,
    });

    const uploadText = await uploadRes.text();
    if (!uploadRes.ok) {
      return res.status(500).json({ error: "Error subiendo archivo binario", debug: uploadText });
    }

    return res.status(200).json(JSON.parse(uploadText));
  });
}