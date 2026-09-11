import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Modality } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

function pcmToWav(
  pcmBuffer: Buffer,
  sampleRate = 24000,
  numChannels = 1,
  bitsPerSample = 16
): Buffer {
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = pcmBuffer.length;
  const header = Buffer.alloc(44);

  header.write("RIFF", 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16); // Subchunk1Size for PCM
  header.writeUInt16LE(1, 20); // AudioFormat 1 = PCM
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write("data", 36);
  header.writeUInt32LE(dataSize, 40);

  return Buffer.concat([header, pcmBuffer]);
}

let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set in environment");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", service: "jummah-companion" });
  });

  // TTS with gemini-3.1-flash-tts-preview
  app.post("/api/tts", async (req, res) => {
    try {
      const { text, voice = "Kore", tone = "reverent", lang = "arabic" } = req.body;
      if (!text || typeof text !== "string") {
        return res.status(400).json({ error: "Missing 'text' field" });
      }

      const ai = getAiClient();

      // Customize prompt instruction for optimal tajweed & devotional pronunciation
      let promptInstruction = "";
      if (lang === "arabic") {
        promptInstruction = `Recite with clear, reverent, melodic Tajweed and respectful pauses: "${text}"`;
      } else if (lang === "bangla") {
        promptInstruction = `Speak in clear, beautiful Bengali with respectful and warm articulation: "${text}"`;
      } else {
        promptInstruction = `Recite clearly and respectfully with calm pacing: "${text}"`;
      }

      // Valid prebuilt voices: 'Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'
      const validVoices = ["Puck", "Charon", "Kore", "Fenrir", "Zephyr"];
      const selectedVoice = validVoices.includes(voice) ? voice : "Kore";

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text: promptInstruction }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: selectedVoice },
            },
          },
        },
      });

      const part = response.candidates?.[0]?.content?.parts?.[0];
      const base64Audio = part?.inlineData?.data;

      if (!base64Audio) {
        return res.status(500).json({
          error: "No audio data received from Gemini TTS model",
        });
      }

      // Gemini TTS provides raw 24kHz 16-bit PCM little-endian
      const pcmBuffer = Buffer.from(base64Audio, "base64");
      const wavBuffer = pcmToWav(pcmBuffer, 24000, 1, 16);
      const wavBase64 = wavBuffer.toString("base64");

      return res.json({
        success: true,
        audioWavBase64: wavBase64,
        audioPcmBase64: base64Audio,
        mimeType: "audio/wav",
        sampleRate: 24000,
        voice: selectedVoice,
      });
    } catch (err: any) {
      console.error("TTS generation error:", err);
      return res.status(500).json({
        error: err.message || "Failed to generate speech audio",
      });
    }
  });

  // AI Knowledge & Advice about Surah Kahf and Friday Sunnah
  app.post("/api/ai/ask", async (req, res) => {
    try {
      const { question } = req.body;
      if (!question) {
        return res.status(400).json({ error: "Question is required" });
      }

      const ai = getAiClient();
      const prompt = `You are a gentle, knowledgeable Islamic companion assistant specializing in Friday (Jummah) Sunnahs, Surah Al-Kahf reflections, Durood Sharif virtues, and the blessed hour of Dua (between the two Khutbahs and before Maghrib).
Answer respectfully with authentic references (Quran & Sahih Hadith from Bukhari, Muslim, Tirmidhi, Abu Dawud).
Support Bengali and English according to the user query.
Keep answers concise, inspiring, practical, and clear.

User Query: ${question}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
      });

      return res.json({
        answer: response.text || "No response generated.",
      });
    } catch (err: any) {
      console.error("AI Ask error:", err);
      return res.status(500).json({
        error: err.message || "Failed to generate answer",
      });
    }
  });

  // Vite middleware in dev; static files in prod
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
