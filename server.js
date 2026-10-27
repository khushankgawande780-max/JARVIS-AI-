

import express from "express";
import { GoogleGenAI } from "@google/genai";

const app = express();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

app.use(express.json({ limit: "20kb" }));

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("GEMINI_API_KEY is missing");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

app.get("/", (req, res) => {
  res.send("JARVIS backend is running.");
});

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

app.post("/chat", async (req, res) => {
  const message = req.body?.message;

  if (typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ error: "Please enter a message." });
  }

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const result = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: message.trim().slice(0, 10000)
      });

      return res.json({
        reply: result.text || "No response received."
      });
    } catch (error) {
      const status = Number(error?.status || error?.statusCode || 0);

      console.error("Gemini request failed:", {
        status: status || "unknown",
        message: error?.message || "Unknown error",
        attempt: attempt + 1
      });

      const retryable = [429, 500, 503].includes(status);

      if (retryable && attempt < 2) {
        await wait(1000 * (2 ** attempt));
        continue;
      }

      return res.status(status === 429 || status === 503 ? status : 500).json({
        error: status === 429
          ? "Gemini API quota or rate limit reached."
          : status === 503
          ? "Gemini is temporarily busy. Please try again."
          : "AI request failed. Check Render logs."
      });
    }
  }
});

const port = process.env.PORT || 3000;

app.listen(port, "0.0.0.0", () => {
  console.log(`JARVIS backend listening on port ${port}`);
});
