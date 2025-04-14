import dotenv from "dotenv";
dotenv.config();

import express from "express";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import xlsToJson from "xls-to-json-lc";
import { Parser } from "json2csv";

const app = express();
app.use(express.raw({ type: "application/octet-stream", limit: "10mb" }));

app.get("/", (req, res) => {
  res.send("🟢 API XLS ➜ CSV is running 🎉");
});

app.post("/convert", async (req, res) => {
  // ... ton code de conversion
});

// ✅ Utilisation des variables .env
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running at http://${HOST}:${PORT}/convert`);
});
