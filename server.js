
import express from "express";
import { GoogleGenAI } from "@google/genai";

const app = express();
app.use(express.json({ limit: "20kb" }));

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY secret is missing");
}

const ai = new GoogleGenAI({ apiKey });

app.get("/", (req, res) => {
  res.send("JARVIS backend is running.");
});

app.post("/chat", async (req, res) => {
  try {
    const message = req.body?.message;

    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ error: "Enter a message." });
    }

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: message.trim().slice(0, 10000)
    });

    res.json({ reply: result.text || "No response received." });
  } catch (error) {
    console.error("Gemini request failed.");
    res.status(500).json({ error: "AI request failed. Check backend logs." });
  }
});

const port = process.env.PORT || 3000;

app.listen(port, "0.0.0.0", () => {
  console.log(`JARVIS backend listening on port ${port}`);
});
