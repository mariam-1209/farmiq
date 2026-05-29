import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const profileSchema = z.object({
  primaryLanguage: z.enum(["kn", "hi", "en"]),
  state: z.string().min(1).max(100),
  district: z.string().min(1).max(100),
  crops: z.array(z.string()).min(1).max(20),
  farmSize: z.enum(["<1", "1-2", "2-5", "5+"]),
});

export async function POST(request: Request) {
  // 1. Verify user is logged in
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Validate input (Rule 1: never trust frontend)
  let body;
  try {
    const json = await request.json();
    body = profileSchema.parse(json);
  } catch (err) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  // 3. Update profile in DB
  try {
    const profile = await prisma.profile.update({
      where: { id: user.id },
      data: {
        primaryLanguage: body.primaryLanguage,
        state: body.state,
        district: body.district,
        crops: body.crops,
        farmSize: body.farmSize,
        onboardingComplete: true,
      },
    });

    return NextResponse.json({ ok: true, profile });
  } catch (err) {
    console.error("Profile update failed:", err);
    return NextResponse.json({ error: "Failed to save profile" }, { status: 500 });
  }
}