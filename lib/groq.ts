import Groq from "groq-sdk";

if (!process.env.GROQ_API_KEY) {
  throw new Error("GROQ_API_KEY is not set");
}

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Default model — fast, free tier, good at reasoning
export const REASONING_MODEL = "llama-3.3-70b-versatile";