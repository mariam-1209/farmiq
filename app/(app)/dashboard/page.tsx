import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Stethoscope } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const profile = await prisma.profile.findUnique({
    where: { id: user!.id },
  });

  const greeting = profile?.primaryLanguage === "kn"
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

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-gray-800">
        {greeting}, {profile?.name?.split(" ")[0] ?? "Farmer"} 👋
      </h1>
      <p className="text-gray-500 text-sm mt-1">
        {profile?.district}, {profile?.state}
      </p>

      <div className="grid gap-3 mt-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.href}
              href={card.href}
              className="bg-white rounded-2xl shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition"
            >
              <div className={`${card.bg} ${card.color} p-3 rounded-xl`}>
                <Icon size={24} />
              </div>
              <div>
                <h2 className="font-semibold text-gray-800">{card.title}</h2>
                <p className="text-xs text-gray-500">{card.subtitle}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}