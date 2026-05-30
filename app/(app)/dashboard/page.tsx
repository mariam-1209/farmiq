import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Stethoscope, MapPin, ChevronRight, Sparkles } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const profile = await prisma.profile.findUnique({
    where: { id: user!.id },
  });

  const greeting =
    profile?.primaryLanguage === "kn"
      ? "ನಮಸ್ಕಾರ"
      : profile?.primaryLanguage === "hi"
      ? "नमस्ते"
      : "Hello";

  const cards = [
    {
      href: "/doctor",
      icon: Stethoscope,
      title: "Crop Doctor",
      subtitle: "Diagnose plant diseases",
      bg: "bg-green-100",
      color: "text-green-700",
    },
  ];

  // Build initials for avatar
  const name: string = profile?.name ?? user?.user_metadata?.full_name ?? "Farmer";
  const initials = name
    .split(" ")
    .map((n: string) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const firstName = name.split(" ")[0] ?? "Farmer";

  return (
    <div className="p-4 pt-6 space-y-6">
      {/* ── Greeting header ── */}
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 text-white font-bold text-lg"
          style={{
            background: "linear-gradient(135deg, #1d5c3a 0%, #2d8653 100%)",
          }}
        >
          {initials}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium mb-0.5" style={{ color: "#9ca3af" }}>
            {greeting} 👋
          </p>
          <h1
            className="text-xl font-bold truncate"
            style={{ color: "#0f1f15" }}
          >
            {firstName}
          </h1>
          {(profile?.district || profile?.state) && (
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin size={11} color="#9ca3af" />
              <p className="text-xs truncate" style={{ color: "#9ca3af" }}>
                {[profile.district, profile.state].filter(Boolean).join(", ")}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Hero feature card ── */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#9ca3af" }}>
          Features
        </p>

        <div className="space-y-3">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.href}
                href={card.href}
                className="group relative flex items-center gap-4 rounded-2xl p-5 overflow-hidden transition-all"
                style={{
                  background: "linear-gradient(135deg, #1d5c3a 0%, #2d8653 100%)",
                  boxShadow: "0 4px 20px rgba(29,92,58,0.25)",
                }}
              >
                {/* Decorative circle */}
                <div
                  className="absolute -top-8 -right-8 w-32 h-32 rounded-full pointer-events-none"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                />
                <div
                  className="absolute -bottom-6 right-12 w-20 h-20 rounded-full pointer-events-none"
                  style={{ background: "rgba(255,255,255,0.04)" }}
                />

                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 relative z-10"
                  style={{ background: "rgba(255,255,255,0.15)" }}
                >
                  <Icon size={22} color="white" />
                </div>

                <div className="flex-1 relative z-10">
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold text-white text-base">
                      {card.title}
                    </h2>
                    <div
                      className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{ background: "rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.9)" }}
                    >
                      <Sparkles size={9} />
                      AI
                    </div>
                  </div>
                  <p
                    className="text-sm mt-0.5"
                    style={{ color: "rgba(255,255,255,0.7)" }}
                  >
                    {card.subtitle}
                  </p>
                </div>

                <ChevronRight
                  size={20}
                  color="rgba(255,255,255,0.6)"
                  className="shrink-0 relative z-10 group-hover:translate-x-0.5 transition-transform"
                />
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── Quick tip card ── */}
      <div
        className="rounded-2xl p-4 border"
        style={{
          background: "#f0faf4",
          borderColor: "#c6e8d2",
        }}
      >
        <p className="text-xs font-semibold mb-1" style={{ color: "#1d5c3a" }}>
          💡 Tip for best results
        </p>
        <p className="text-xs leading-relaxed" style={{ color: "#374151" }}>
          Take photos in bright natural light. Get close to the affected leaf — the clearer the photo, the more accurate the diagnosis.
        </p>
      </div>
    </div>
  );
}