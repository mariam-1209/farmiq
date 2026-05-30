"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { LogOut, Loader2 } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

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
    <motion.button
      onClick={handleSignOut}
      disabled={loading}
      whileTap={{ scale: 0.98 }}
      className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm border transition-all disabled:opacity-60"
      style={{
        background: "#fef2f2",
        color: "#b91c1c",
        borderColor: "#fecaca",
      }}
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <LogOut size={16} />
      )}
      {loading ? "Signing out..." : "Sign Out"}
    </motion.button>
  );
}