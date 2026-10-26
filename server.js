
import express from "express";
import { GoogleGenAI } from "@google/genai";

const app = express();

app.use(express.json({ limit: "20kb" }));

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("Missing GEMINI_API_KEY environment variable.");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

app.get("/", (req, res) => {
  res.status(200).send("JARVIS backend is running.");
});

app.post("/chat", async (req, res) => {
  try {
    const message = req.body?.message;

    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        error: "Please enter a message."
      });
    }

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: message.trim().slice(0, 10000)
    });

    const reply = result.text;

    if (!reply) {
      return res.status(502).json({
        error: "Gemini returned an empty response."
      });
    }

    return res.json({ reply });
  } catch (error) {
    // Log diagnostic information, never the API key.
    console.error("Gemini request failed:", {
      message: error?.message || "Unknown error",
      status: error?.status || error?.statusCode || "unknown"
    });

    return res.status(500).json({
      error: "Gemini request failed. Check Render logs."
    });
  }
});

const port = process.env.PORT || 3000;

app.listen(port, "0.0.0.0", () => {
  console.log(`JARVIS backend listening on port ${port}`);
});


