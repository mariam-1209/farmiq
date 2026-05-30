import { groq, REASONING_MODEL } from "@/lib/groq";

export type Intent = {
  intent: "crop_doctor" | "general" | "unclear";
  cropMentioned: string | null;
  confidence: number;
  reasoning: string;
};

const SYSTEM_PROMPT = `You are the intent router for FarmIQ, a plant disease diagnosis assistant.

The user spoke a query (could be in Kannada, Hindi, or English). Classify their intent.

Respond with ONLY valid JSON:
{
  "intent": "crop_doctor" | "general" | "unclear",
  "cropMentioned": string or null,
  "confidence": number from 0 to 1,
  "reasoning": "1 sentence explanation"
}

Intent definitions:
- "crop_doctor": user describes disease, symptoms, sick plants, or asks about plant problems
- "general": general farming/gardening questions not about disease diagnosis
- "unclear": cannot determine intent

Rules:
- Be conservative. If confidence < 0.6, set intent to "unclear".
- Translate crop names to English (e.g., "ಟೊಮೆಟೊ" → "tomato").
- Do not add any text outside the JSON.`;

export async function routeIntent(transcript: string): Promise<Intent> {
  const completion = await groq.chat.completions.create({
    model: REASONING_MODEL,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `User said: "${transcript}"\n\nClassify the intent.` },
    ],
    temperature: 0.2,
    response_format: { type: "json_object" },
  });

  const text = completion.choices[0]?.message?.content?.trim();
  if (!text) throw new Error("Empty response from orchestrator");

  return JSON.parse(text) as Intent;
}