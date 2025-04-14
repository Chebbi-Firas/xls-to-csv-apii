import express from "express";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
// @ts-ignore
import xlsToJson from "xls-to-json-lc";
import { Parser } from "json2csv";

const app = express();

// ✅ Middleware pour accepter des fichiers binaires bruts (max 10 Mo)
app.use(express.raw({ type: "application/octet-stream", limit: "10mb" }));

app.post("/convert", async (req, res) => {
  console.log("✅ Requête reçue sur /convert");

  // 📌 DEBUG : Logs pour Render
  console.log("🧪 Type req.body:", typeof req.body);
  console.log("🧪 Est Buffer:", Buffer.isBuffer(req.body));
  console.log("🧪 Taille:", req.body?.length || 0);

  if (!req.body || !Buffer.isBuffer(req.body)) {
    console.error("❌ Aucune donnée reçue ou format incorrect");
    return res.status(400).json({ error: "No valid file data received" });
  }

  const tempFilePath = `/tmp/${uuidv4()}.xls`;
  console.log("📁 Création du fichier temporaire :", tempFilePath);

  try {
    // 🔧 Écriture temporaire du fichier .xls
    fs.writeFileSync(tempFilePath, req.body);
    console.log("✅ Fichier temporaire écrit avec succès");

    // 🔄 Conversion XLS → JSON
    const jsonResult = await new Promise((resolve, reject) => {
      xlsToJson({ input: tempFilePath, output: null }, (err, result) => {
        if (err) return reject(err);
        if (!result || result.length === 0) {
          return reject(new Error("XLS file is empty or invalid"));
        }
        resolve(result);
      });
    });

    console.log(`✅ Conversion JSON réussie (${jsonResult.length} lignes)`);

    // 🔁 Conversion JSON → CSV
    const parser = new Parser();
    const csv = parser.parse(jsonResult);
    console.log("✅ Conversion JSON → CSV terminée");

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.status(200).send(csv);
    console.log("📤 Fichier CSV envoyé au client");
  } catch (err) {
    console.error("❌ Erreur de traitement :", err.message);
    res.status(500).json({
      error: "Conversion failed",
      details: err.message,
    });
  } finally {
    // 🧹 Suppression du fichier temporaire
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
      console.log("🧹 Fichier temporaire supprimé");
    }
  }
});

// ✅ Pour Docker / Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 API en ligne : http://localhost:${PORT}/convert`);
});
