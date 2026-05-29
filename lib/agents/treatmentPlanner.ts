import { groq, REASONING_MODEL } from "@/lib/groq";

export type TreatmentPlan = {
  summary: string;
  immediateActions: string[];
  treatmentSteps: TreatmentStep[];
  preventionTips: string[];
  recommendedProducts: RecommendedProduct[];
  whenToSeeExpert: string;
  disclaimer: string;
};

export type TreatmentStep = {
  step: number;
  title: string;
  description: string;
  timing: string;
};

export type RecommendedProduct = {
  name: string;
  type: string;
  purpose: string;
  notes: string;
};

const SYSTEM_PROMPT = `You are an expert agricultural advisor writing a treatment plan for a plant disease.

You will be given:
- Plant name (crop)
- Disease name
- Severity (low/medium/high)
- Symptoms observed
- A brief observation from a vision AI

Your job: write a clear, practical treatment plan that a home gardener or small farmer can follow.

Respond with ONLY valid JSON in this exact shape:
{
  "summary": "1-2 sentence overview of the disease and approach",
  "immediateActions": ["urgent thing 1", "urgent thing 2"],
  "treatmentSteps": [
    {
      "step": 1,
      "title": "Short action name",
      "description": "1-2 sentence instruction in plain language",
      "timing": "When to do this (e.g., 'Today', 'Within 2 days', 'Every 7 days')"
    }
  ],
  "preventionTips": ["tip 1", "tip 2", "tip 3"],
  "recommendedProducts": [
    {
      "name": "Specific product name (e.g., 'Mancozeb 75% WP')",
      "type": "Category (e.g., 'Fungicide', 'Organic spray', 'Fertilizer')",
      "purpose": "What it treats",
      "notes": "Dosage and application advice"
    }
  ],
  "whenToSeeExpert": "1 sentence describing when this needs professional help",
  "disclaimer": "Brief safety reminder"
}

Rules:
- Write in clear, simple English. No technical jargon without explanation.
- Treatment steps should be 3-6 steps, in order, actionable.
- Prevention tips: 3-5 practical tips.
- Recommended products: 1-3 widely available items (Indian market: Mancozeb, Copper Oxychloride, Neem oil, etc.)
- If disease is "Healthy", give a maintenance plan instead of treatment.
- Always include the disclaimer about consulting an expert for severe cases.
- Do not include markdown, code blocks, or any text outside the JSON.`;

export async function generateTreatmentPlan(input: {
  crop: string;
  disease: string;
  severity: "low" | "medium" | "high" | null;
  symptoms: string[];
  observation: string;
}): Promise<TreatmentPlan> {
  const userMessage = `Plant: ${input.crop}
Disease: ${input.disease}
Severity: ${input.severity ?? "unknown"}
Symptoms: ${input.symptoms.join(", ") || "none specified"}
Observation: ${input.observation}

Generate the treatment plan as JSON.`;

  const completion = await groq.chat.completions.create({
    model: REASONING_MODEL,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userMessage },
    ],
    temperature: 0.3,
    response_format: { type: "json_object" },
  });

  const text = completion.choices[0]?.message?.content?.trim();
  if (!text) {
    throw new Error("Empty response from treatment agent");
  }

  try {
    return JSON.parse(text) as TreatmentPlan;
  } catch (err) {
    console.error("Failed to parse treatment plan:", text);
    throw new Error("Could not understand treatment agent response");
  }
}