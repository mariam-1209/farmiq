import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { translateText } from "@/lib/agents/translator";
import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";

const schema = z.object({
  text: z.string().min(1).max(2000),
  language: z.enum(["kn", "hi", "en"]),
});

// Sarvam TTS supports specific language codes
const SARVAM_LANG_CODES: Record<string, string> = {
  kn: "kn-IN",
  hi: "hi-IN",
  en: "en-IN",
};

export async function POST(request: Request) {
  // 1. Auth
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Validate
  let body;
  try {
    body = schema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  // 3. Cache key — hash of text+language. Same input = same audio.
  const cacheKey = crypto
    .createHash("sha256")
    .update(`${body.language}::${body.text}`)
    .digest("hex");
  const cachePath = `${user.id}/${cacheKey}.wav`;

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 4. Check cache — if audio for this exact text+language already exists, return it
  const { data: existing } = await admin.storage
    .from("tts-audio")
    .list(user.id, { search: `${cacheKey}.wav` });

  if (existing && existing.length > 0) {
    const { data: signedData } = await admin.storage
      .from("tts-audio")
      .createSignedUrl(cachePath, 60 * 60);
    if (signedData) {
      return NextResponse.json({ audioUrl: signedData.signedUrl, cached: true });
    }
  }

  // 5. Translate text if needed
  let textToSpeak = body.text;
  try {
    textToSpeak = await translateText(body.text, body.language);
  } catch (err) {
    console.error("Translation failed:", err);
    // Continue with original text as fallback
  }

  // 6. Call Sarvam TTS
  try {
    const sarvamRes = await fetch("https://api.sarvam.ai/text-to-speech", {
      method: "POST",
      headers: {
        "api-subscription-key": process.env.SARVAM_API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: textToSpeak,
        target_language_code: SARVAM_LANG_CODES[body.language],
        speaker: "anushka",
        model: "bulbul:v2",
      }),
    });

    if (!sarvamRes.ok) {
      const errText = await sarvamRes.text();
      console.error("Sarvam TTS failed:", sarvamRes.status, errText);
      return NextResponse.json(
        { error: "Text-to-speech service error" },
        { status: 500 }
      );
    }

    const data = await sarvamRes.json();
    // Sarvam returns base64-encoded audio in `audios` array
    const audioBase64 = data.audios?.[0];
    if (!audioBase64) {
      return NextResponse.json(
        { error: "No audio returned" },
        { status: 500 }
      );
    }

    // 7. Upload to Supabase Storage for caching
    const audioBuffer = Buffer.from(audioBase64, "base64");
    const { error: uploadError } = await admin.storage
      .from("tts-audio")
      .upload(cachePath, audioBuffer, {
        contentType: "audio/wav",
        upsert: true,
      });

    if (uploadError) {
      console.error("Cache upload failed:", uploadError);
      // Continue — return a data URL fallback
      const dataUrl = `data:audio/wav;base64,${audioBase64}`;
      return NextResponse.json({ audioUrl: dataUrl, cached: false });
    }

    // 8. Return signed URL
    const { data: signedData } = await admin.storage
      .from("tts-audio")
      .createSignedUrl(cachePath, 60 * 60);

    if (!signedData) {
      const dataUrl = `data:audio/wav;base64,${audioBase64}`;
      return NextResponse.json({ audioUrl: dataUrl, cached: false });
    }

    return NextResponse.json({
      audioUrl: signedData.signedUrl,
      cached: false,
    });
  } catch (err) {
    console.error("TTS error:", err);
    return NextResponse.json(
      { error: "Could not generate audio" },
      { status: 500 }
    );
  }
}