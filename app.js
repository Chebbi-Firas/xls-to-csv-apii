import express from "express";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
// @ts-ignore
import xlsToJson from "xls-to-json-lc";

import { Parser } from "json2csv";

const app = express();

// Pour accepter les fichiers binaires envoyés depuis Power Automate
app.use(express.raw({ type: "application/octet-stream", limit: "10mb" }));

app.post("/convert", async (req, res) => {
  console.log("✅ Requête reçue sur /convert");

  // Vérifie si un fichier est bien envoyé
  if (!req.body || !(req.body instanceof Buffer)) {
    console.error("❌ Aucune donnée reçue ou format incorrect");
    return res.status(400).json({ error: "No valid file data received" });
  }

  const tempFilePath = `/tmp/${uuidv4()}.xls`;
  console.log("📁 Chemin du fichier temporaire :", tempFilePath);

  try {
    // Sauvegarde le fichier temporairement
    fs.writeFileSync(tempFilePath, req.body);
    console.log("✅ Fichier .xls écrit avec succès");

    // Conversion XLS → JSON
    const result = await new Promise((resolve, reject) => {
      xlsToJson({ input: tempFilePath, output: null }, (err, jsonResult) => {
        if (err) {
          console.error("❌ Erreur lors de la conversion XLS → JSON :", err);
          return reject(err);
        }
        if (!jsonResult || jsonResult.length === 0) {
          console.error("❌ Le fichier est vide ou mal formaté.");
          return reject(new Error("XLS file is empty or invalid"));
        }
        console.log("✅ Conversion vers JSON réussie :", jsonResult.length, "lignes");
        resolve(jsonResult);
      });
    });

    // Conversion JSON → CSV
    const parser = new Parser();
    const csv = parser.parse(result);
    console.log("✅ Conversion JSON → CSV terminée");

    res.setHeader("Content-Type", "text/csv");
    res.status(200).send(csv);
    console.log("📤 Fichier CSV envoyé au client");
  } catch (err) {
    console.error("❌ Erreur finale :", err.message);
    res.status(500).json({ error: "Conversion failed", details: err.message });
  } finally {
    // Nettoyage du fichier temporaire
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
      console.log("🧹 Fichier temporaire supprimé");
    }
  }
});

app.listen(3000, () => {
  console.log("🚀 API XLS ➜ CSV en ligne sur http://localhost:3000/convert");
});
