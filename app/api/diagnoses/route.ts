import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const diagnoses = await prisma.diagnosis.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        photoUrl: true,
        photoPath: true,
        cropDetected: true,
        diseaseDetected: true,
        severity: true,
        status: true,
        createdAt: true,
      },
    });

    // Refresh signed URLs for any diagnosis with a stored photoPath
    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const withFreshUrls = await Promise.all(
      diagnoses.map(async (d) => {
        if (d.photoPath) {
          const { data: signedData } = await admin.storage
            .from("crop-photos")
            .createSignedUrl(d.photoPath, 60 * 60); // 1 hour
          if (signedData) {
            return { ...d, photoUrl: signedData.signedUrl };
          }
        }
        return d;
      })
    );

    return NextResponse.json({ diagnoses: withFreshUrls });
  } catch (err) {
    console.error("Failed to fetch diagnoses:", err);
    return NextResponse.json(
      { error: "Could not load history" },
      { status: 500 }
    );
  }
}