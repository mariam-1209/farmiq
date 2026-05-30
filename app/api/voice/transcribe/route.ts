import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  // 1. Auth check
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Get audio from form data
  const formData = await request.formData();
  const audioFile = formData.get("audio");

  if (!audioFile || !(audioFile instanceof File)) {
    return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
  }

  if (audioFile.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "Audio too large (max 10MB)" }, { status: 400 });
  }

  // 3. Send to Sarvam Speech-to-Text
  try {
    const sarvamForm = new FormData();
    sarvamForm.append("file", audioFile, "recording.webm");
    sarvamForm.append("model", "saarika:v2.5");
    sarvamForm.append("language_code", "unknown"); // auto-detect

    const sarvamRes = await fetch("https://api.sarvam.ai/speech-to-text", {
      method: "POST",
      headers: {
        "api-subscription-key": process.env.SARVAM_API_KEY!,
      },
      body: sarvamForm,
    });

    if (!sarvamRes.ok) {
      const errText = await sarvamRes.text();
      console.error("Sarvam STT failed:", sarvamRes.status, errText);
      return NextResponse.json(
        { error: "Transcription service error" },
        { status: 500 }
      );
    }

    const data = await sarvamRes.json();

    return NextResponse.json({
      transcript: data.transcript || "",
      language: data.language_code || "unknown",
    });
  } catch (err) {
    console.error("Transcription error:", err);
    return NextResponse.json(
      { error: "Could not transcribe audio" },
      { status: 500 }
    );
  }
}