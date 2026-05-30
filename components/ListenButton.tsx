"use client";

import { Volume2, Loader2, Pause } from "lucide-react";
import { useState, useRef } from "react";
import { motion } from "framer-motion";

export default function ListenButton({
  text,
  language,
}: {
  text: string;
  language: "kn" | "hi" | "en";
}) {
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  async function handleClick() {
    // If currently playing, pause
    if (playing && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setPlaying(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/voice/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, language }),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Could not play audio");
        setLoading(false);
        return;
      }

      const { audioUrl } = await res.json();

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => setPlaying(false);
      audio.onerror = () => {
        setError("Audio playback failed");
        setPlaying(false);
      };

      await audio.play();
      setPlaying(true);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Could not play audio");
      setLoading(false);
    }
  }

  return (
    <div>
      <motion.button
        onClick={handleClick}
        disabled={loading}
        whileTap={{ scale: 0.98 }}
        className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-60"
        style={
          playing
            ? {
                background: "#f0faf4",
                color: "#1d5c3a",
                border: "2px solid #1d5c3a",
              }
            : {
                background: "linear-gradient(135deg, #1d5c3a 0%, #2d8653 100%)",
                color: "white",
                boxShadow: "0 4px 14px rgba(29,92,58,0.25)",
                border: "2px solid transparent",
              }
        }
      >
        {loading ? (
          <>
            <Loader2 size={17} className="animate-spin" />
            Preparing audio...
          </>
        ) : playing ? (
          <>
            <Pause size={17} />
            Stop Playback
          </>
        ) : (
          <>
            <Volume2 size={17} />
            Listen to Diagnosis
          </>
        )}
      </motion.button>

      {error && (
        <p
          className="text-xs text-center mt-1.5"
          style={{ color: "#dc2626" }}
        >
          {error}
        </p>
      )}
    </div>
  );
}