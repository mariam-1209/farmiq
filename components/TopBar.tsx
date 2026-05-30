"use client";

import { Leaf, Mic } from "lucide-react";
import { useState } from "react";
import VoiceModal from "./VoiceModal";

export default function TopBar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 bg-white border-b border-gray-200 z-40">
        <div className="max-w-md mx-auto flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2">
            <Leaf className="text-green-600" size={22} />
            <span className="font-bold text-green-700">FarmIQ</span>
          </div>

          <button
            aria-label="Voice assistant"
            className="p-2 rounded-full bg-green-50 text-green-700 hover:bg-green-100 transition"
            onClick={() => setOpen(true)}
          >
            <Mic size={20} />
          </button>
        </div>
      </header>

      {open && <VoiceModal onClose={() => setOpen(false)} />}
    </>
  );
}