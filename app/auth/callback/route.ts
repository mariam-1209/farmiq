import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error, data } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Ensure a profile row exists for this user
      const existing = await prisma.profile.findUnique({
        where: { id: data.user.id },
      });

      if (!existing) {
        await prisma.profile.create({
          data: {
            id: data.user.id,
            name: data.user.user_metadata?.full_name ?? null,
          },
        });
      }

      // Decide where to send them
      const profile = existing ?? await prisma.profile.findUnique({
        where: { id: data.user.id },
      });

      if (profile?.onboardingComplete) {
        return NextResponse.redirect(`${origin}/dashboard`);
      } else {
        return NextResponse.redirect(`${origin}/onboarding`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}