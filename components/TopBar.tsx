"use client";

import { Leaf, Mic } from "lucide-react";

export default function TopBar() {
  return (
    <header className="sticky top-0 bg-white border-b border-gray-200 z-40">
      <div className="max-w-md mx-auto flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-2">
          <Leaf className="text-green-600" size={22} />
          <span className="font-bold text-green-700">FarmIQ</span>
        </div>

        <button
          aria-label="Voice assistant"
          className="p-2 rounded-full bg-green-50 text-green-700 hover:bg-green-100 transition"
          onClick={() => alert("Voice coming in Week 3!")}
        >
          <Mic size={20} />
        </button>
      </div>
    </header>
  );
}