import { visionModel } from "@/lib/gemini";

export type CropAnalysis = {
  isPlant: boolean;
  crop: string | null;
  disease: string | null;
  severity: "low" | "medium" | "high" | null;
  confidence: number;
  symptoms: string[];
  rawObservation: string;
};

const SYSTEM_PROMPT = `You are an expert agricultural plant pathologist analyzing a photo of a plant.

Your job: identify the plant, detect any diseases or problems, and assess severity.

Respond with ONLY valid JSON in this exact shape:
{
  "isPlant": boolean (true if photo contains a recognizable plant),
  "crop": string or null (e.g., "Tomato", "Potato", "Rose", "Tulsi"),
  "disease": string or null (specific disease name like "Early Blight", or "Healthy" if no disease),
  "severity": "low" | "medium" | "high" | null,
  "confidence": number from 0 to 1 (how confident you are in the diagnosis),
  "symptoms": array of strings describing what you observe (e.g., ["yellow leaf spots", "wilting"]),
  "rawObservation": string (1-2 sentence plain description of what you see)
}

Rules:
- If the photo is not a plant, set isPlant: false and all other fields to null/empty.
- If the plant looks healthy, set disease: "Healthy" and severity: null.
- Be conservative with confidence. Only go above 0.85 if you're very sure.
- Use specific disease names, not generic terms like "fungal infection".
- Do not add any text outside the JSON. No markdown, no code blocks, no explanation.`;

export async function analyzeCropPhoto(imageUrl: string): Promise<CropAnalysis> {
  // Fetch the image and convert to base64 for Gemini
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error("Failed to fetch image for analysis");
  }
  const buffer = await response.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  const mimeType = response.headers.get("content-type") || "image/jpeg";

  const result = await visionModel.generateContent([
    SYSTEM_PROMPT,
    {
      inlineData: {
        data: base64,
        mimeType,
      },
    },
  ]);

  const text = result.response.text().trim();

  // Strip code fences if Gemini adds them despite our instruction
  const cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  try {
    const parsed = JSON.parse(cleaned) as CropAnalysis;
    return parsed;
  } catch (err) {
    console.error("Failed to parse Gemini response:", cleaned);
    throw new Error("Could not understand AI response");
  }
}