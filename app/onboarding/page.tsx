"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Check, Loader2, MapPin, Leaf, Sprout } from "lucide-react";

const STATES = [
  "Karnataka",
  "Maharashtra",
  "Tamil Nadu",
  "Andhra Pradesh",
  "Telangana",
];

const CROPS = [
  { id: "tomato", label: "Tomato", emoji: "🍅" },
  { id: "potato", label: "Potato", emoji: "🥔" },
  { id: "rice", label: "Rice", emoji: "🌾" },
  { id: "cotton", label: "Cotton", emoji: "🌿" },
  { id: "chili", label: "Chili", emoji: "🌶️" },
  { id: "onion", label: "Onion", emoji: "🧅" },
];

const LANGUAGES = [
  { code: "kn", label: "Kannada", script: "ಕನ್ನಡ", region: "Karnataka" },
  { code: "hi", label: "Hindi", script: "हिंदी", region: "North India" },
  { code: "en", label: "English", script: "English", region: "All regions" },
];

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({
    x: dir > 0 ? -60 : 60,
    opacity: 0,
  }),
};

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(false);

  const [language, setLanguage] = useState("kn");
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [selectedCrops, setSelectedCrops] = useState<string[]>([]);
  const [farmSize, setFarmSize] = useState("");

  function toggleCrop(id: string) {
    setSelectedCrops((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  function goNext() {
    setDirection(1);
    setStep((s) => s + 1);
  }

  function goBack() {
    setDirection(-1);
    setStep((s) => s - 1);
  }

  async function handleSubmit() {
    setLoading(true);
    const res = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        primaryLanguage: language,
        state,
        district,
        crops: selectedCrops,
        farmSize,
      }),
    });

    if (res.ok) {
      router.push("/dashboard");
    } else {
      alert("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  const stepLabels = ["Language", "Location", "Farm"];

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-16"
      style={{
        background: "#faf8f4",
        fontFamily: "var(--font-jakarta, system-ui, sans-serif)",
      }}
    >
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: "#1d5c3a" }}
          >
            <Leaf size={18} color="white" />
          </div>
          <h1 className="text-xl font-bold" style={{ color: "#0f1f15" }}>
            Set up your profile
          </h1>
          <p className="text-sm mt-1" style={{ color: "#6b7280" }}>
            Helps us personalize your experience
          </p>
        </div>

        {/* Step progress */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex-1 flex flex-col items-center gap-1.5">
              <div className="w-full flex items-center">
                <div
                  className="flex-1 h-1.5 rounded-full transition-all duration-500"
                  style={{
                    background: s <= step ? "#1d5c3a" : "#e5e7eb",
                  }}
                />
              </div>
              <span
                className="text-xs font-medium transition-colors duration-300"
                style={{
                  color: s <= step ? "#1d5c3a" : "#9ca3af",
                }}
              >
                {stepLabels[s - 1]}
              </span>
            </div>
          ))}
        </div>

        {/* Card */}
        <div
          className="rounded-3xl border overflow-hidden"
          style={{
            background: "white",
            borderColor: "#eaeaea",
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.04), 0 16px 32px -8px rgba(0,0,0,0.06)",
          }}
        >
          <div className="relative overflow-hidden" style={{ minHeight: "380px" }}>
            <AnimatePresence custom={direction} mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="p-7"
                >
                  <h2
                    className="text-lg font-bold mb-1"
                    style={{ color: "#0f1f15" }}
                  >
                    Choose your language
                  </h2>
                  <p className="text-sm mb-6" style={{ color: "#6b7280" }}>
                    Voice responses and audio will be in this language
                  </p>

                  <div className="space-y-3">
                    {LANGUAGES.map((lang) => {
                      const selected = language === lang.code;
                      return (
                        <motion.button
                          key={lang.code}
                          onClick={() => setLanguage(lang.code)}
                          whileTap={{ scale: 0.99 }}
                          className="w-full flex items-center justify-between p-4 rounded-2xl border-2 text-left transition-all"
                          style={{
                            borderColor: selected ? "#1d5c3a" : "#f0f0f0",
                            background: selected ? "#f0faf4" : "white",
                          }}
                        >
                          <div>
                            <p
                              className="font-semibold"
                              style={{ color: selected ? "#1d5c3a" : "#0f1f15" }}
                            >
                              {lang.script}
                            </p>
                            <p
                              className="text-xs mt-0.5"
                              style={{ color: "#6b7280" }}
                            >
                              {lang.label} · {lang.region}
                            </p>
                          </div>
                          {selected && (
                            <div
                              className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                              style={{ background: "#1d5c3a" }}
                            >
                              <Check size={13} color="white" />
                            </div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="p-7"
                >
                  <h2
                    className="text-lg font-bold mb-1"
                    style={{ color: "#0f1f15" }}
                  >
                    Where is your farm?
                  </h2>
                  <p className="text-sm mb-6" style={{ color: "#6b7280" }}>
                    Used for local disease alerts and regional advice
                  </p>

                  <div className="space-y-3">
                    {/* State select */}
                    <div className="relative">
                      <MapPin
                        size={16}
                        color="#9ca3af"
                        className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                      />
                      <select
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full pl-10 pr-4 py-3.5 rounded-2xl border text-sm font-medium transition-all"
                        style={{
                          borderColor: state ? "#1d5c3a" : "#e5e7eb",
                          color: state ? "#0f1f15" : "#9ca3af",
                          background: "white",
                          boxShadow: state
                            ? "0 0 0 3px rgba(29,92,58,0.08)"
                            : "none",
                        }}
                      >
                        <option value="">Select your state</option>
                        {STATES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* District input */}
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="District (e.g., Mysuru)"
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="w-full px-4 py-3.5 rounded-2xl border text-sm font-medium transition-all"
                        style={{
                          borderColor: district ? "#1d5c3a" : "#e5e7eb",
                          color: "#0f1f15",
                          background: "white",
                          boxShadow: district
                            ? "0 0 0 3px rgba(29,92,58,0.08)"
                            : "none",
                        }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="p-7"
                >
                  <h2
                    className="text-lg font-bold mb-1"
                    style={{ color: "#0f1f15" }}
                  >
                    Your crops &amp; farm
                  </h2>
                  <p className="text-sm mb-5" style={{ color: "#6b7280" }}>
                    Select all crops you grow
                  </p>

                  <div className="grid grid-cols-3 gap-2 mb-5">
                    {CROPS.map((c) => {
                      const sel = selectedCrops.includes(c.id);
                      return (
                        <motion.button
                          key={c.id}
                          onClick={() => toggleCrop(c.id)}
                          whileTap={{ scale: 0.97 }}
                          className="flex flex-col items-center gap-1 py-3 rounded-xl border-2 text-sm font-medium transition-all relative"
                          style={{
                            borderColor: sel ? "#1d5c3a" : "#f0f0f0",
                            background: sel ? "#f0faf4" : "white",
                            color: sel ? "#1d5c3a" : "#374151",
                          }}
                        >
                          {sel && (
                            <div
                              className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center"
                              style={{ background: "#1d5c3a" }}
                            >
                              <Check size={9} color="white" />
                            </div>
                          )}
                          <span className="text-xl">{c.emoji}</span>
                          <span className="text-xs">{c.label}</span>
                        </motion.button>
                      );
                    })}
                  </div>

                  <div className="relative">
                    <Sprout
                      size={16}
                      color="#9ca3af"
                      className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                    />
                    <select
                      value={farmSize}
                      onChange={(e) => setFarmSize(e.target.value)}
                      className="w-full pl-10 pr-4 py-3.5 rounded-2xl border text-sm font-medium transition-all"
                      style={{
                        borderColor: farmSize ? "#1d5c3a" : "#e5e7eb",
                        color: farmSize ? "#0f1f15" : "#9ca3af",
                        background: "white",
                        boxShadow: farmSize
                          ? "0 0 0 3px rgba(29,92,58,0.08)"
                          : "none",
                      }}
                    >
                      <option value="">Farm size</option>
                      <option value="<1">Less than 1 acre</option>
                      <option value="1-2">1 to 2 acres</option>
                      <option value="2-5">2 to 5 acres</option>
                      <option value="5+">More than 5 acres</option>
                    </select>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Navigation buttons */}
          <div
            className="flex gap-3 px-7 pb-7"
            style={{ borderTop: "1px solid #f5f5f5" }}
          >
            {step > 1 && (
              <motion.button
                onClick={goBack}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-1.5 px-5 py-3 rounded-xl text-sm font-medium transition-colors"
                style={{ background: "#f3f4f6", color: "#374151" }}
              >
                <ChevronLeft size={16} />
                Back
              </motion.button>
            )}

            {step < 3 ? (
              <motion.button
                onClick={goNext}
                disabled={step === 2 && (!state || !district)}
                whileTap={{ scale: 0.97 }}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 mt-4"
                style={{ background: "#1d5c3a", color: "white" }}
              >
                Continue
                <ChevronRight size={16} />
              </motion.button>
            ) : (
              <motion.button
                onClick={handleSubmit}
                disabled={loading || selectedCrops.length === 0 || !farmSize}
                whileTap={{ scale: 0.97 }}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 mt-4"
                style={{ background: "#1d5c3a", color: "white" }}
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Check size={16} />
                )}
                {loading ? "Saving..." : "Finish Setup"}
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}