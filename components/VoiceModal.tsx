"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Mic, Square, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function VoiceModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();

  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [intent, setIntent] = useState<{ intent: string; reasoning: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  async function startRecording() {
    setError(null);
    setTranscript(null);
    setIntent(null);
    chunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach((t) => t.stop());
        await transcribe(blob);
      };

      recorder.start();
      setRecording(true);
    } catch (err) {
      console.error(err);
      setError("Microphone access denied or unavailable");
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setRecording(false);
    setProcessing(true);
  }

  async function transcribe(blob: Blob) {
    try {
      const formData = new FormData();
      formData.append("audio", blob, "recording.webm");

      const res = await fetch("/api/voice/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Transcription failed");
        setProcessing(false);
        return;
      }

      const data = await res.json();
      const text = data.transcript || "";
      setTranscript(text);

      // Route intent next
      await routeIntent(text);
    } catch (err) {
      console.error(err);
      setError("Could not process audio");
      setProcessing(false);
    }
  }

  async function routeIntent(text: string) {
    try {
      const res = await fetch("/api/voice/route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: text }),
      });

      if (!res.ok) {
        setProcessing(false);
        return;
      }

      const data = await res.json();
      setIntent(data.intent);
      setProcessing(false);

      // Auto-navigate based on intent
      if (data.intent.intent === "crop_doctor") {
        setTimeout(() => {
          onClose();
          router.push("/doctor");
        }, 1500);
      }
      // unclear and general stay in modal
    } catch (err) {
      console.error(err);
      setProcessing(false);
    }
  }

  useEffect(() => {
    return () => {
      mediaRecorderRef.current?.stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  function reset() {
    setTranscript(null);
    setIntent(null);
    setError(null);
  }

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50"
        style={{ background: "rgba(15,31,21,0.65)" }}
        onClick={onClose}
      />

      {/* Bottom sheet */}
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", stiffness: 380, damping: 32 }}
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl border-t overflow-hidden"
        style={{
          background: "white",
          borderColor: "#e8eee9",
          paddingBottom: "env(safe-area-inset-bottom)",
          maxWidth: "448px",
          margin: "0 auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-0">
          <div
            className="w-10 h-1 rounded-full"
            style={{ background: "#e5e7eb" }}
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-4 pb-2">
          <div>
            <h2 className="font-bold text-lg" style={{ color: "#0f1f15" }}>
              Voice Assistant
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "#9ca3af" }}>
              Speak in Kannada, Hindi, or English
            </p>
          </div>
          <motion.button
            onClick={onClose}
            whileTap={{ scale: 0.9 }}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "#f3f4f6" }}
            aria-label="Close"
          >
            <X size={16} color="#374151" />
          </motion.button>
        </div>

        {/* Content */}
        <div className="px-6 pb-8 pt-6">
          {/* Idle state */}
          {!recording && !processing && !transcript && (
            <div className="flex flex-col items-center gap-5">
              {/* Mic button with pulse rings */}
              <div className="relative">
                <span
                  className="absolute inset-0 rounded-full animate-ping"
                  style={{
                    background: "rgba(29,92,58,0.12)",
                    animationDuration: "2s",
                    margin: "-8px",
                  }}
                />
                <motion.button
                  onClick={startRecording}
                  whileTap={{ scale: 0.95 }}
                  className="relative w-20 h-20 rounded-full flex items-center justify-center text-white"
                  style={{
                    background: "linear-gradient(135deg, #1d5c3a 0%, #2d8653 100%)",
                    boxShadow: "0 8px 24px rgba(29,92,58,0.3)",
                  }}
                >
                  <Mic size={28} />
                </motion.button>
              </div>
              <p className="text-sm text-center" style={{ color: "#6b7280" }}>
                Tap to speak
              </p>
            </div>
          )}

          {/* Recording state */}
          {recording && (
            <div className="flex flex-col items-center gap-5">
              <div className="relative">
                {/* Pulsing rings */}
                {[1, 2].map((i) => (
                  <span
                    key={i}
                    className="absolute inset-0 rounded-full animate-ping"
                    style={{
                      background: "rgba(220,38,38,0.1)",
                      animationDuration: `${1.2 + i * 0.4}s`,
                      margin: `${-8 * i}px`,
                    }}
                  />
                ))}
                <motion.button
                  onClick={stopRecording}
                  whileTap={{ scale: 0.95 }}
                  className="relative w-20 h-20 rounded-full flex items-center justify-center"
                  style={{
                    background: "#dc2626",
                    boxShadow: "0 8px 24px rgba(220,38,38,0.3)",
                  }}
                >
                  <Square size={24} fill="white" color="white" />
                </motion.button>
              </div>
              <div className="text-center">
                <p className="font-semibold text-sm" style={{ color: "#0f1f15" }}>
                  Listening...
                </p>
                <p className="text-xs mt-0.5" style={{ color: "#9ca3af" }}>
                  Tap the button to stop
                </p>
              </div>
            </div>
          )}

          {/* Processing */}
          {processing && (
            <div className="flex flex-col items-center gap-4 py-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: "#e8f5ee" }}
              >
                <Loader2 size={28} className="animate-spin" color="#1d5c3a" />
              </div>
              <p className="text-sm font-medium" style={{ color: "#374151" }}>
                Processing your request...
              </p>
            </div>
          )}

          {/* Transcript + intent result */}
          {transcript && !processing && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              {/* What you said */}
              <div
                className="rounded-2xl p-4 border"
                style={{ background: "#f8f9fa", borderColor: "#f0f0f0" }}
              >
                <p
                  className="text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: "#9ca3af" }}
                >
                  You said
                </p>
                <p className="text-sm leading-relaxed" style={{ color: "#0f1f15" }}>
                  {transcript}
                </p>
              </div>

              {/* Intent result */}
              {intent && (
                <div>
                  {intent.intent === "crop_doctor" && (
                    <div
                      className="rounded-2xl p-3 flex items-center gap-2 text-sm"
                      style={{ background: "#f0faf4", color: "#1d5c3a" }}
                    >
                      <span>🌿</span>
                      <span className="font-medium">
                        Taking you to Crop Doctor...
                      </span>
                    </div>
                  )}
                  {intent.intent === "general" && (
                    <div
                      className="rounded-2xl p-3 text-sm"
                      style={{ background: "#eff6ff", color: "#1e40af" }}
                    >
                      <span className="font-medium">Got it: </span>
                      {intent.reasoning}
                    </div>
                  )}
                  {intent.intent === "unclear" && (
                    <div
                      className="rounded-2xl p-3 text-sm"
                      style={{ background: "#fffbeb", color: "#92400e" }}
                    >
                      I&apos;m not sure what you need. Try asking about a crop
                      disease or treatment.
                    </div>
                  )}
                </div>
              )}

              <motion.button
                onClick={reset}
                whileTap={{ scale: 0.97 }}
                className="w-full py-2.5 rounded-xl text-sm font-medium"
                style={{ background: "#f3f4f6", color: "#374151" }}
              >
                Try Again
              </motion.button>
            </motion.div>
          )}

          {/* Error */}
          {error && (
            <div
              className="mt-3 rounded-xl p-3 text-sm"
              style={{ background: "#fef2f2", color: "#b91c1c" }}
            >
              {error}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}