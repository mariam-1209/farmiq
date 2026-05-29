"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

const STATES = ["Karnataka", "Maharashtra", "Tamil Nadu", "Andhra Pradesh", "Telangana"];

const CROPS = [
  { id: "tomato", label: "Tomato " },
  { id: "potato", label: "Potato "},
  { id: "rice", label: "Rice" },
  { id: "cotton", label: "Cotton " },
  { id: "chili", label: "Chili " },
  { id: "onion", label: "Onion" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
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

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="flex gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 flex-1 rounded-full ${s <= step ? "bg-green-600" : "bg-gray-200"}`}
            />
          ))}
        </div>

        {step === 1 && (
          <div>
            <h2 className="text-xl font-bold mb-1">Choose your language</h2>
            <p className="text-sm text-gray-500 mb-6">ನಿಮ್ಮ ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ</p>
            <div className="grid gap-3">
              {[
                { code: "kn", label: "ಕನ್ನಡ (Kannada)" },
                { code: "hi", label: "हिंदी (Hindi)" },
                { code: "en", label: "English" },
              ].map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`p-4 rounded-xl border-2 text-left ${
                    language === lang.code
                      ? "border-green-600 bg-green-50"
                      : "border-gray-200"
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep(2)}
              className="w-full mt-6 bg-green-600 text-white py-3 rounded-xl font-medium"
            >
              Next
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-xl font-bold mb-1">Where is your farm?</h2>
            <p className="text-sm text-gray-500 mb-6">ನಿಮ್ಮ ಫಾರ್ಮ್ ಎಲ್ಲಿದೆ?</p>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full p-3 border rounded-xl mb-3"
            >
              <option value="">Select state</option>
              {STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="District (e.g., Mysuru)"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full p-3 border rounded-xl"
            />
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep(1)}
                className="flex-1 bg-gray-200 py-3 rounded-xl font-medium"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!state || !district}
                className="flex-1 bg-green-600 text-white py-3 rounded-xl font-medium disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-xl font-bold mb-1">Your crops & farm size</h2>
            <p className="text-sm text-gray-500 mb-6">ನಿಮ್ಮ ಬೆಳೆಗಳು</p>

            <p className="text-sm font-medium mb-2">Crops (pick any):</p>
            <div className="grid grid-cols-2 gap-2 mb-6">
              {CROPS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => toggleCrop(c.id)}
                  className={`p-3 rounded-xl border-2 text-sm ${
                    selectedCrops.includes(c.id)
                      ? "border-green-600 bg-green-50"
                      : "border-gray-200"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <p className="text-sm font-medium mb-2">Farm size:</p>
            <select
              value={farmSize}
              onChange={(e) => setFarmSize(e.target.value)}
              className="w-full p-3 border rounded-xl"
            >
              <option value="">Select size</option>
              <option value="<1">Less than 1 acre</option>
              <option value="1-2">1 to 2 acres</option>
              <option value="2-5">2 to 5 acres</option>
              <option value="5+">More than 5 acres</option>
            </select>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep(2)}
                className="flex-1 bg-gray-200 py-3 rounded-xl font-medium"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || selectedCrops.length === 0 || !farmSize}
                className="flex-1 bg-green-600 text-white py-3 rounded-xl font-medium disabled:opacity-50"
              >
                {loading ? "Saving..." : "Finish"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}