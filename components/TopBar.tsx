"use client";

import { Leaf, Mic } from "lucide-react";
import { useState } from "react";
import VoiceModal from "./VoiceModal";
import { motion } from "framer-motion";

export default function TopBar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header
        className="sticky top-0 z-40 border-b"
        style={{
          background: "rgba(250,248,244,0.88)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderColor: "#e8eee9",
        }}
      >
        <div className="max-w-md mx-auto flex items-center justify-between h-14 px-4">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "#1d5c3a" }}
            >
              <Leaf size={15} color="white" />
            </div>
            <span
              className="font-bold text-base tracking-tight"
              style={{ color: "#0f1f15" }}
            >
              FarmIQ
            </span>
          </div>

          {/* Mic button */}
          <motion.button
            aria-label="Voice assistant"
            onClick={() => setOpen(true)}
            whileTap={{ scale: 0.93 }}
            className="relative flex items-center justify-center w-9 h-9 rounded-full transition-colors"
            style={{ background: "#e8f5ee" }}
          >
            <Mic size={17} color="#1d5c3a" />
            {/* Subtle pulse ring */}
            <span
              className="absolute inset-0 rounded-full animate-ping"
              style={{
                background: "rgba(29,92,58,0.12)",
                animationDuration: "2.5s",
              }}
            />
          </motion.button>
        </div>
      </header>

      {open && <VoiceModal onClose={() => setOpen(false)} />}
    </>
  );
}