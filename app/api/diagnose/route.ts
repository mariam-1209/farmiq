import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";
import { analyzeCropPhoto } from "@/lib/agents/cropDoctor";
import { generateTreatmentPlan } from "@/lib/agents/treatmentPlanner";
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

  // 2. Validate
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

  // 4. Signed URL
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

  // 5. Create processing row
  const diagnosis = await prisma.diagnosis.create({
    data: {
      userId: user.id,
      photoUrl: signedData.signedUrl,
      status: "processing",
    },
  });

  // 6. Multi-agent pipeline: Vision → Treatment
  try {
    // --- Agent 1: Vision ---
    const analysis = await analyzeCropPhoto(signedData.signedUrl);

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

    // --- Agent 2: Treatment Planner ---
    let treatmentPlan = null;
    if (analysis.crop && analysis.disease) {
      try {
        treatmentPlan = await generateTreatmentPlan({
          crop: analysis.crop,
          disease: analysis.disease,
          severity: analysis.severity,
          symptoms: analysis.symptoms,
          observation: analysis.rawObservation,
        });
      } catch (err) {
        console.error("Treatment agent failed:", err);
        // Don't fail the whole diagnosis if treatment fails — partial result is still useful
      }
    }

    // Save combined result
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
          plan: treatmentPlan,
        },
      },
    });

    return NextResponse.json({ diagnosisId: diagnosis.id });
  } catch (err) {
    console.error("Pipeline failed:", err);
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