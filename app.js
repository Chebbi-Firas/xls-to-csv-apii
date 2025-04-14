import express from "express";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import XLSX from "xlsx"; // More reliable than xls-to-json-lc
import { Parser } from "json2csv";
import cors from "cors";

const app = express();

// Middleware
app.use(cors());
app.use(express.raw({ type: "application/octet-stream", limit: "10mb" }));

// Health check
app.get("/", (req, res) => {
  res.send("🟢 XLS to CSV API is operational");
});

app.post("/convert", async (req, res) => {
  const requestId = uuidv4();
  console.log(`📥 [${requestId}] Request received`);

  if (!req.body || !Buffer.isBuffer(req.body)) {
    return res.status(400).json({ error: "Invalid file data" });
  }

  const tempFilePath = `/tmp/${uuidv4()}.xls`;
  
  try {
    // 1. Save incoming file
    fs.writeFileSync(tempFilePath, req.body);
    console.log(`💾 [${requestId}] File saved`);

    // 2. Read XLS file
    const workbook = XLSX.readFile(tempFilePath);
    const sheetName = workbook.SheetNames[0]; // Get first sheet
    const worksheet = workbook.Sheets[sheetName];

    // 3. Convert to JSON (preserve all data types)
    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
      raw: false, // Get formatted strings
      defval: "", // Default value for empty cells
      dateNF: "yyyy-mm-dd" // Date format
    });

    console.log(`📊 [${requestId}] Converted ${jsonData.length} rows`);

    // 4. Convert JSON to CSV
    const parser = new Parser({
      header: true,
      withBOM: true // For Excel compatibility
    });
    const csv = parser.parse(jsonData);

    // 5. Send response
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", "attachment; filename=converted.csv");
    res.send(csv);

    console.log(`✅ [${requestId}] Conversion successful`);

  } catch (err) {
    console.error(`❌ [${requestId}] Error:`, err);
    res.status(500).json({
      error: "Conversion failed",
      details: err.message,
      requestId
    });
  } finally {
    // Cleanup
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server ready at http://localhost:${PORT}`);
});