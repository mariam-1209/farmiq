import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import SignOutButton from "@/components/SignOutButton";
import { Mail, User as UserIcon } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
  });

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">Profile</h1>

      <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
            <UserIcon size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Name</p>
            <p className="font-medium text-gray-800">
              {profile?.name ?? user.user_metadata?.full_name ?? "Farmer"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
            <Mail size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
            <p className="font-medium text-gray-800">{user.email}</p>
          </div>
        </div>
      </div>

      <SignOutButton />

      <p className="text-xs text-gray-400 text-center pt-4">
        FarmIQ v1.0 · Built with care
      </p>
    </div>
  );
}