import express from "express";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import xlsToJson from "xls-to-json-lc";
import { Parser } from "json2csv";
import cors from "cors";

const app = express();

// Middleware
app.use(cors());
app.use(express.raw({ type: "application/octet-stream", limit: "10mb" }));

// Routes
app.get("/", (req, res) => {
  res.send("🟢 API XLS ➜ CSV is running 🎉");
});

app.post("/convert", async (req, res) => {
  const requestId = uuidv4();
  console.log(`✅ [${requestId}] Requête reçue`);

  if (!req.body || !Buffer.isBuffer(req.body)) {
    return res.status(400).json({ error: "No valid file data received" });
  }

  const tempFilePath = `/tmp/${uuidv4()}.xls`;
  
  try {
    fs.writeFileSync(tempFilePath, req.body);
    const jsonResult = await new Promise((resolve, reject) => {
      xlsToJson({ input: tempFilePath, output: null }, (err, result) => {
        if (err) reject(err);
        resolve(result || []);
      });
    });

    const csv = new Parser().parse(jsonResult);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=converted.csv");
    res.status(200).send(csv);
  } catch (err) {
    res.status(500).json({ 
      error: "Conversion failed",
      details: err.message 
    });
  } finally {
    if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});