import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set");
}

export const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const visionModel = gemini.getGenerativeModel({
  model: "gemini-2.5-flash",      // ← current stable
});
