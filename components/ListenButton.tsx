"use client";

import { Volume2, Loader2, Pause } from "lucide-react";
import { useState, useRef } from "react";

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
      <button
        onClick={handleClick}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-green-50 text-green-700 border border-green-200 py-3 rounded-xl font-medium hover:bg-green-100 transition disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" size={18} />
            Preparing audio...
          </>
        ) : playing ? (
          <>
            <Pause size={18} />
            Stop
          </>
        ) : (
          <>
            <Volume2 size={18} />
            Listen
          </>
        )}
      </button>
      {error && (
        <p className="text-xs text-red-600 mt-1 text-center">{error}</p>
      )}
    </div>
  );
}