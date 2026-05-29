import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  photoPath: z.string().min(1).max(500),
});

export async function POST(request: Request) {
  // 1. Auth check using the user's session
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

  // 3. Verify the photo belongs to this user
  if (!body.photoPath.startsWith(`${user.id}/`)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 4. Use admin client (service role) to generate signed URL
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: signedData, error: signedError } = await admin.storage
    .from("crop-photos")
    .createSignedUrl(body.photoPath, 60 * 60 * 24 * 7);

  if (signedError || !signedData) {
    console.error("Signed URL error:", signedError);
    return NextResponse.json(
      { error: "Could not access photo: " + (signedError?.message ?? "unknown") },
      { status: 500 }
    );
  }

  // 5. Create diagnosis row
  try {
    const diagnosis = await prisma.diagnosis.create({
      data: {
        userId: user.id,
        photoUrl: signedData.signedUrl,
        status: "processing",
      },
    });

    return NextResponse.json({ diagnosisId: diagnosis.id });
  } catch (err) {
    console.error("Failed to create diagnosis:", err);
    return NextResponse.json(
      { error: "Could not save diagnosis" },
      { status: 500 }
    );
  }
}