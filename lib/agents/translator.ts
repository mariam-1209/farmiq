import { groq, REASONING_MODEL } from "@/lib/groq";

const LANGUAGE_NAMES: Record<string, string> = {
  kn: "Kannada",
  hi: "Hindi",
  en: "English",
};

export async function translateText(
  text: string,
  targetLanguage: "kn" | "hi" | "en"
): Promise<string> {
  // If already English, skip translation
  if (targetLanguage === "en") return text;

  const langName = LANGUAGE_NAMES[targetLanguage];

  const completion = await groq.chat.completions.create({
    model: REASONING_MODEL,
    messages: [
      {
        role: "system",
        content: `You are a professional translator. Translate the user's text into ${langName}.

Rules:
- Output ONLY the translation. No preamble, no explanation, no quotes.
- Keep technical/scientific terms (chemical names, product names) in English.
- Use simple, conversational ${langName} that a farmer would understand.
- Preserve the structure and meaning faithfully.`,
      },
      { role: "user", content: text },
    ],
    temperature: 0.3,
  });

  const translated = completion.choices[0]?.message?.content?.trim();
  if (!translated) {
    throw new Error("Translation failed");
  }
  return translated;
}