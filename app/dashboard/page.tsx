import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-green-50 p-6">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-green-700">FarmIQ</h1>
        <p className="text-gray-600 mt-2">
          Welcome, {user.email}
        </p>

        <div className="grid gap-4 mt-8">
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="font-semibold text-lg">📷 Photo se Doctor</h2>
            <p className="text-gray-500 text-sm">Detect crop disease from a photo</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="font-semibold text-lg">💰 Aaj ka Bhaav</h2>
            <p className="text-gray-500 text-sm">Today's mandi prices</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="font-semibold text-lg">📋 Yojana Check</h2>
            <p className="text-gray-500 text-sm">Find government schemes</p>
          </div>
        </div>
      </div>
    </div>
  );
}