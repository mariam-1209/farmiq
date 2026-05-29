"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  async function signInWithGoogle() {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      alert("Login failed: " + error.message);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8 text-center">
        <h1 className="text-3xl font-bold text-green-700 mb-2">FarmIQ</h1>
        <p className="text-gray-500 mb-8">Smart farming assistant</p>

        <button
          onClick={signInWithGoogle}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-xl py-3 px-4 font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
        >
          {loading ? "Loading..." : "Continue with Google"}
        </button>

        <p className="text-xs text-gray-400 mt-6">
          By continuing, you agree to our terms.
        </p>
      </div>
    </div>
  );
}