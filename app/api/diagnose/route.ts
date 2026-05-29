import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";
import { analyzeCropPhoto } from "@/lib/agents/cropDoctor";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  photoPath: z.string().min(1).max(500),
});

export async function POST(request: Request) {
  // 1. Auth
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Validate input
  let body;
  try {
    body = schema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  // 3. Ownership check
  if (!body.photoPath.startsWith(`${user.id}/`)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 4. Signed URL via admin client
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: signedData, error: signedError } = await admin.storage
    .from("crop-photos")
    .createSignedUrl(body.photoPath, 60 * 60 * 24 * 7);

  if (signedError || !signedData) {
    console.error("Signed URL error:", signedError);
    return NextResponse.json({ error: "Could not access photo" }, { status: 500 });
  }

  // 5. Create the row first (status: processing) so the UI has something to render
  const diagnosis = await prisma.diagnosis.create({
    data: {
      userId: user.id,
      photoUrl: signedData.signedUrl,
      status: "processing",
    },
  });

  // 6. Run Gemini Vision analysis
  try {
    const analysis = await analyzeCropPhoto(signedData.signedUrl);

    // If photo isn't a plant, mark as failed with explanation
    if (!analysis.isPlant) {
      await prisma.diagnosis.update({
        where: { id: diagnosis.id },
        data: {
          status: "failed",
          treatmentPlan: {
            error: "We could not detect a plant in this photo. Please try again with a clear photo of a leaf or plant.",
          },
        },
      });
      return NextResponse.json({ diagnosisId: diagnosis.id });
    }

    // Save successful analysis
    await prisma.diagnosis.update({
      where: { id: diagnosis.id },
      data: {
        status: "complete",
        cropDetected: analysis.crop,
        diseaseDetected: analysis.disease,
        confidence: analysis.confidence,
        severity: analysis.severity,
        treatmentPlan: {
          symptoms: analysis.symptoms,
          observation: analysis.rawObservation,
          // Treatment steps come from the next agent (Day 9)
        },
      },
    });

    return NextResponse.json({ diagnosisId: diagnosis.id });
  } catch (err) {
    console.error("Vision agent failed:", err);
    await prisma.diagnosis.update({
      where: { id: diagnosis.id },
      data: {
        status: "failed",
        treatmentPlan: { error: "Analysis failed. Please try again." },
      },
    });
    return NextResponse.json({ diagnosisId: diagnosis.id });
  }
}