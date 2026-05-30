import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import SignOutButton from "@/components/SignOutButton";
import { Mail, User as UserIcon, MapPin, Leaf, Sprout } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
  });

  const name: string = profile?.name ?? user.user_metadata?.full_name ?? "Farmer";
  const initials = name
    .split(" ")
    .map((n: string) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const infoRows = [
    {
      icon: UserIcon,
      label: "Name",
      value: name,
    },
    {
      icon: Mail,
      label: "Email",
      value: user.email ?? "—",
    },
    ...(profile?.state
      ? [
          {
            icon: MapPin,
            label: "Location",
            value: [profile.district, profile.state].filter(Boolean).join(", "),
          },
        ]
      : []),
    ...(profile?.primaryLanguage
      ? [
          {
            icon: Leaf,
            label: "Language",
            value:
              profile.primaryLanguage === "kn"
                ? "Kannada"
                : profile.primaryLanguage === "hi"
                ? "Hindi"
                : "English",
          },
        ]
      : []),
    ...(profile?.farmSize
      ? [
          {
            icon: Sprout,
            label: "Farm Size",
            value: `${profile.farmSize} acre${profile.farmSize === "1" ? "" : "s"}`,
          },
        ]
      : []),
  ];

  return (
    <div className="p-4 pt-6 space-y-6">
      {/* ── Avatar section ── */}
      <div className="flex flex-col items-center py-4">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mb-3"
          style={{
            background: "linear-gradient(135deg, #1d5c3a 0%, #2d8653 100%)",
            boxShadow: "0 8px 24px rgba(29,92,58,0.25)",
          }}
        >
          {initials}
        </div>
        <h1 className="text-xl font-bold" style={{ color: "#0f1f15" }}>
          {name}
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "#6b7280" }}>
          {user.email}
        </p>
      </div>

      {/* ── Info card ── */}
      <div
        className="rounded-2xl border overflow-hidden"
        style={{ background: "white", borderColor: "#f0f0f0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
      >
        {infoRows.map((row, index) => {
          const Icon = row.icon;
          return (
            <div
              key={row.label}
              className="flex items-center gap-4 px-5 py-4"
              style={{
                borderTop: index > 0 ? "1px solid #f5f5f5" : "none",
              }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "#f3f4f6" }}
              >
                <Icon size={16} color="#6b7280" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "#9ca3af" }}>
                  {row.label}
                </p>
                <p className="font-medium text-sm mt-0.5 truncate" style={{ color: "#0f1f15" }}>
                  {row.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Sign out ── */}
      <SignOutButton />

      {/* ── Version ── */}
      <p className="text-xs text-center" style={{ color: "#c4c9d0" }}>
        FarmIQ v1.0 · Built with care 🌿
      </p>
    </div>
  );
}