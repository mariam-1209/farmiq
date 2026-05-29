import BottomNav from "@/components/BottomNav";
import TopBar from "@/components/TopBar";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Make sure they've completed onboarding
  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
  });

  if (!profile?.onboardingComplete) {
    redirect("/onboarding");
  }

  return (
    <div className="min-h-screen bg-green-50">
      <TopBar />
      <main className="max-w-md mx-auto pb-20">{children}</main>
      <BottomNav />
    </div>
  );
}