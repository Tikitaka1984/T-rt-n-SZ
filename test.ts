import { GoogleGenAI } from "@google/genai";
import * as dotenv from "dotenv";
dotenv.config();

const ai = new GoogleGenAI();
async function run() {
  try {
    const list = [];
    for await (const m of ai.models.list({})) {
      list.push(m.name);
    }
    console.log(list);
  } catch (err) {
    console.error(err);
  }
}
run();
