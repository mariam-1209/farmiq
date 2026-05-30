"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useState } from "react";

export default function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleSignOut}
      disabled={loading}
      className="w-full bg-red-50 text-red-700 border border-red-200 py-3 rounded-2xl font-medium flex items-center justify-center gap-2 hover:bg-red-100 transition disabled:opacity-50"
    >
      <LogOut size={18} />
      {loading ? "Signing out..." : "Sign Out"}
    </button>
  );
}