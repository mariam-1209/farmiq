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
    <div
      className="desktop-bg"
      style={{
        fontFamily: "var(--font-jakarta, system-ui, sans-serif)",
      }}
    >
      <div className="phone-frame">
        <TopBar />
        <main className="phone-frame-scrollable px-0">{children}</main>
        <BottomNav />
      </div>
    </div>
  );
}