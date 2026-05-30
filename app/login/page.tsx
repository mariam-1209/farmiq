"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Leaf, Loader2, ArrowRight, Camera, Mic, BookOpen } from "lucide-react";

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
    <div
      className="min-h-screen flex"
      style={{ fontFamily: "var(--font-jakarta, system-ui, sans-serif)" }}
    >
      {/* ── Left panel — brand story (hidden on mobile) ── */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: "#1d5c3a" }}
      >
        {/* Background circles */}
        <div
          className="absolute -top-24 -right-24 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: "rgba(255,255,255,0.05)" }}
        />
        <div
          className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: "rgba(255,255,255,0.04)" }}
        />

        {/* Logo */}
        <div className="flex items-center gap-2.5 relative z-10">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.15)" }}
          >
            <Leaf size={17} color="white" />
          </div>
          <span className="font-bold text-xl text-white tracking-tight">
            FarmIQ
          </span>
        </div>

        {/* Features */}
        <div className="relative z-10 space-y-6">
          <p
            className="text-3xl font-bold leading-snug"
            style={{ color: "rgba(255,255,255,0.95)" }}
          >
            AI-powered crop disease diagnosis for every Indian farmer.
          </p>

          <div className="space-y-4 pt-2">
            {[
              { icon: Camera, text: "Photo diagnosis in under 5 seconds" },
              { icon: Mic, text: "Voice responses in your language" },
              { icon: BookOpen, text: "Expert treatment plans, instantly" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: "rgba(255,255,255,0.12)" }}
                >
                  <item.icon size={16} color="rgba(255,255,255,0.9)" />
                </div>
                <span
                  className="text-sm"
                  style={{ color: "rgba(255,255,255,0.75)" }}
                >
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer text */}
        <p
          className="text-xs relative z-10"
          style={{ color: "rgba(255,255,255,0.4)" }}
        >
          Free to use · No app download needed
        </p>
      </div>

      {/* ── Right panel — sign-in card ── */}
      <div
        className="flex-1 flex flex-col items-center justify-center px-4 py-16 relative"
        style={{ background: "#faf8f4" }}
      >
        {/* Subtle bg gradient */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(29,92,58,0.06) 0%, transparent 70%)",
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="flex items-center justify-center gap-2.5 mb-10 lg:hidden">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: "#1d5c3a" }}
            >
              <Leaf size={18} color="white" />
            </div>
            <span
              className="font-bold text-2xl tracking-tight"
              style={{ color: "#0f1f15" }}
            >
              FarmIQ
            </span>
          </div>

          {/* Card */}
          <div
            className="rounded-3xl p-8 border"
            style={{
              background: "white",
              borderColor: "#eaeaea",
              boxShadow:
                "0 4px 6px -1px rgba(0,0,0,0.04), 0 20px 40px -8px rgba(0,0,0,0.06)",
            }}
          >
            <div className="text-center mb-8">
              <h1
                className="text-2xl font-bold mb-1.5"
                style={{ color: "#0f1f15" }}
              >
                Welcome to FarmIQ
              </h1>
              <p className="text-sm" style={{ color: "#6b7280" }}>
                Sign in to start diagnosing your crops
              </p>
            </div>

            {/* Google Sign-In Button */}
            <motion.button
              onClick={signInWithGoogle}
              disabled={loading}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl border font-medium text-sm transition-all disabled:opacity-60"
              style={{
                background: "white",
                borderColor: "#e0e0e0",
                color: "#374151",
                boxShadow: "0 1px 3px rgba(0,0,0,0.07)",
              }}
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" style={{ color: "#1d5c3a" }} />
              ) : (
                /* Google G logo */
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              )}
              {loading ? "Redirecting to Google..." : "Continue with Google"}
            </motion.button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px" style={{ background: "#f0f0f0" }} />
              <span className="text-xs" style={{ color: "#9ca3af" }}>
                secure sign-in
              </span>
              <div className="flex-1 h-px" style={{ background: "#f0f0f0" }} />
            </div>

            {/* Trust note */}
            <div className="flex items-center justify-center gap-1.5">
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center"
                style={{ background: "#e8f5ee" }}
              >
                <ArrowRight size={9} color="#1d5c3a" />
              </div>
              <p className="text-xs" style={{ color: "#9ca3af" }}>
                We never post anything without your permission
              </p>
            </div>
          </div>

          <p className="text-center text-xs mt-5" style={{ color: "#b0b8c1" }}>
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </motion.div>
      </div>
    </div>
  );
}