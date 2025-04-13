import express from "express";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import xlsToJson from "xls-to-json-lc";
import { Parser } from "json2csv";

const app = express();
app.use(express.raw({ type: "application/octet-stream", limit: "10mb" }));

app.post("/convert", async (req, res) => {
  if (!req.body || req.body.length === 0) {
    return res.status(400).json({ error: "No file data received" });
  }

  const tempFilePath = `/tmp/${uuidv4()}.xls`;
  fs.writeFileSync(tempFilePath, req.body);

  try {
    const result = await new Promise((resolve, reject) => {
      xlsToJson({ input: tempFilePath, output: null }, (err, jsonResult) => {
        if (err) reject(err);
        else resolve(jsonResult);
      });
    });

    const parser = new Parser();
    const csv = parser.parse(result);

    fs.unlinkSync(tempFilePath);

    res.setHeader("Content-Type", "text/csv");
    res.send(csv);
  } catch (err) {
    fs.unlinkSync(tempFilePath);
    res.status(500).json({ error: "Conversion failed", details: err.message });
  }
});

app.listen(3000, () => console.log("✅ XLS to CSV API running on port 3000"));
