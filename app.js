import express from "express";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import xlsToJson from "xls-to-json-lc";
import { Parser } from "json2csv";
import axios from "axios";

const app = express();
app.use(express.raw({ type: "application/octet-stream", limit: "10mb" }));

// 🟢 Ton token Graph (à coller depuis Graph Explorer ou ton app Azure)
const accessToken = "eyJ0eXAiOiJKV1QiLCJub25jZSI6IkR0Q1pkR2x4WUpPQnU3S2QwRFpTS3ZWWV85TGdJQWZXY1J4d0ExYkZCMlkiLCJhbGciOiJSUzI1NiIsIng1dCI6IkNOdjBPSTNSd3FsSEZFVm5hb01Bc2hDSDJYRSIsImtpZCI6IkNOdjBPSTNSd3FsSEZFVm5hb01Bc2hDSDJYRSJ9.eyJhdWQiOiIwMDAwMDAwMy0wMDAwLTAwMDAtYzAwMC0wMDAwMDAwMDAwMDAiLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC9kZTJmYWNiZi0wMWEyLTQxZDAtYTcwNS0zZjkyNjIxZDRmODQvIiwiaWF0IjoxNzQ0NTY1ODY5LCJuYmYiOjE3NDQ1NjU4NjksImV4cCI6MTc0NDY1MjU2OSwiYWNjdCI6MCwiYWNyIjoiMSIsImFjcnMiOlsicDEiXSwiYWlvIjoiQVdRQW0vOFpBQUFBSEZsbElVZHZwSDlVd0tjd01tQUhIYXhDV1ZpUnFKQWFFNkRvaDJTRGNnd05xM2tHT0hMaVpNSjl0WVJrR3BQU0Y2bExJLzAwNHczSlNKMGhDYmY2N3BlelhyQUdBelNtb0QralpIZXQ2ZFhLRXdCeUpFUGZrREtJZkRVcEE3R0giLCJhbXIiOlsicHdkIiwibWZhIl0sImFwcF9kaXNwbGF5bmFtZSI6IkdyYXBoIEV4cGxvcmVyIiwiYXBwaWQiOiJkZThiYzhiNS1kOWY5LTQ4YjEtYThhZC1iNzQ4ZGE3MjUwNjQiLCJhcHBpZGFjciI6IjAiLCJmYW1pbHlfbmFtZSI6IkNoZWJiaSIsImdpdmVuX25hbWUiOiJGaXJhcyIsImlkdHlwIjoidXNlciIsImlwYWRkciI6IjE5Ny4zLjIxMi44NyIsIm5hbWUiOiJGaXJhcyBDaGViYmkiLCJvaWQiOiIzNmZmZjUxOS00OTg4LTRhYTktYWY4Yi02ODkwM2ZhMTg5MmIiLCJwbGF0ZiI6IjMiLCJwdWlkIjoiMTAwMzIwMDNCODU4ODQxQyIsInJoIjoiMS5BWUVBdjZ3djNxSUIwRUduQlQtU1loMVBoQU1BQUFBQUFBQUF3QUFBQUFBQUFBQ0JBTjZCQUEuIiwic2NwIjoib3BlbmlkIHByb2ZpbGUgVXNlci5SZWFkIGVtYWlsIiwic2lkIjoiMDAyMTI0NzktZDk2MC01OGQwLTg3NjMtOGY2Yjg4NmExZGE4Iiwic2lnbmluX3N0YXRlIjpbImttc2kiXSwic3ViIjoiOVEwTC1hb2RqalRhRnRFU3k2My1jX1J6MjMxTkt6OE5oZG1YbGgycE5fNCIsInRlbmFudF9yZWdpb25fc2NvcGUiOiJBRiIsInRpZCI6ImRlMmZhY2JmLTAxYTItNDFkMC1hNzA1LTNmOTI2MjFkNGY4NCIsInVuaXF1ZV9uYW1lIjoiZmlyYXMuY2hlYmJpQGRmYy1zb2Z0d2FyZS5jb20iLCJ1cG4iOiJmaXJhcy5jaGViYmlAZGZjLXNvZnR3YXJlLmNvbSIsInV0aSI6IjNEbTdETEdtWFU2SXVFRkFWNjBpQUEiLCJ2ZXIiOiIxLjAiLCJ3aWRzIjpbImI3OWZiZjRkLTNlZjktNDY4OS04MTQzLTc2YjE5NGU4NTUwOSJdLCJ4bXNfY2MiOlsiQ1AxIl0sInhtc19mdGQiOiJ1X2hFM2U5RVV2TTlxV1NfVk1ZSk1Ld3NLZVMzdW1ZZmVyWnVKOU9vazQwIiwieG1zX2lkcmVsIjoiMSAxNCIsInhtc19zc20iOiIxIiwieG1zX3N0Ijp7InN1YiI6InBqeWZ4d0hVQ042c1NUTFB6amxIamFxcTlwaEo0blNLVVdwRXVIM2lPeHMifSwieG1zX3RjZHQiOjE2MTYwMDMyMjR9.PeoW9v0m7e9YbYHS2nEsDQRHxPvrA1QTXCz-nTenMiVXyyMtESOVt4EJfsAT5f5TLB4RTfhw0afq7vaLpHI3ukAnFx78V9G6v08KWny_81xCoWalR_Q5vJLkJVsIyQPAzy5bGWOKcSlhIhVqs3jYLvcoKCxTkWqJePJstTn4EFda-If7uYE6uJZvd3RxNzcZEEblat1XBiB7spIdM4TE-P0zX2SW6VmYDwWiQG-fLe-UO9Mh0wWXmps_u8A6Tfe3wGojFaYf-8ihIXlUUopPHPpwmf6MhHFf95KXHtwrxBOhuziT6Fp3neCx0wom_Fi4Z0zAxt55i5S_tUtA_ZQGew";

// 📂 Dossier cible dans ton OneDr
const folderPath = "test"; // (le dossier doit exister
app.post("/convert", async (req, res) => {
  if (!req.body || req.body.length === 0) {
    return res.status(400).json({ error: "No file data received" });
  }

  const tempFilePath = `/tmp/${uuidv4()}.xls`;
  fs.writeFileSync(tempFilePath, req.body);

  try {
    // 1. Convertir en JSON
    const result = await new Promise((resolve, reject) => {
      xlsToJson({ input: tempFilePath, output: null }, (err, jsonResult) => {
        if (err) reject(err);
        else resolve(jsonResult);
      });
    });

    // 2. Convertir en CSV
    const parser = new Parser();
    const csv = parser.parse(result);
    const fileName = `converted-${Date.now()}.csv`;

    // 3. Envoi à ton OneDrive perso
    const uploadUrl = `https://graph.microsoft.com/v1.0/me/drive/root:/${folderPath}/${fileName}:/content`;

    await axios.put(uploadUrl, csv, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "text/csv",
      },
    });

    fs.unlinkSync(tempFilePath);

    res.status(200).json({ message: "CSV uploaded to OneDrive successfully", fileName });
  } catch (err) {
    fs.unlinkSync(tempFilePath);
    res.status(500).json({ error: "Conversion or upload failed", details: err.message });
  }
});

app.listen(3000, () => console.log("✅ API ready on port 3000"));
