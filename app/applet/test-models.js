import { GoogleGenAI } from "@google/genai";
import * as dotenv from "dotenv";
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function run() {
  const result = await ai.models.list();
  for await (const m of result) {
    console.log(m.name);
  }
}
run();
