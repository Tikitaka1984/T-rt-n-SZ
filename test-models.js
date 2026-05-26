import { GoogleGenAI } from "@google/genai";
import * as dotenv from "dotenv";
dotenv.config();
const ai = new GoogleGenAI();
async function run() {
  const result = await ai.models.list();
  for await (const m of result) {
    if (m.name.includes('flash')) console.log(m.name);
  }
}
run();
