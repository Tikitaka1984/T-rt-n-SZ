import { GoogleGenAI } from "@google/genai";
import * as dotenv from "dotenv";
dotenv.config();

const ai = new GoogleGenAI();
async function run() {
  try {
    const models = [] as any[];
    for await (const m of ai.models.list()) {
      models.push(m.name);
    }
    console.log(models);
  } catch (err) {
    console.error(err);
  }
}
run();
