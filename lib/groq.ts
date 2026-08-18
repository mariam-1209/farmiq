import Groq from "groq-sdk";

if (!process.env.GROQ_API_KEY) {
  throw new Error("GROQ_API_KEY is not set");
}

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Default model — fast, free tier, good at reasoning
export const REASONING_MODEL = "openai/gpt-oss-120b";