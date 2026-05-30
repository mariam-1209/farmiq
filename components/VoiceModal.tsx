"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Mic, Square, Loader2 } from "lucide-react";

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
      } else if (data.intent.intent === "price") {
        setTimeout(() => {
          onClose();
          router.push("/prices");
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
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-lg">Voice Assistant</h2>
          <button onClick={onClose} aria-label="Close">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="text-center py-6">
          {!recording && !processing && !transcript && (
            <>
              <button
                onClick={startRecording}
                className="w-20 h-20 mx-auto rounded-full bg-green-600 text-white flex items-center justify-center hover:bg-green-700 transition"
              >
                <Mic size={32} />
              </button>
              <p className="text-sm text-gray-500 mt-4">
                Tap to speak in Kannada, Hindi, or English
              </p>
            </>
          )}

          {recording && (
            <>
              <button
                onClick={stopRecording}
                className="w-20 h-20 mx-auto rounded-full bg-red-600 text-white flex items-center justify-center animate-pulse"
              >
                <Square size={28} fill="white" />
              </button>
              <p className="text-sm text-gray-700 mt-4 font-medium">
                Listening... tap to stop
              </p>
            </>
          )}

          {processing && (
            <>
              <Loader2 className="animate-spin mx-auto text-green-600" size={48} />
              <p className="text-sm text-gray-700 mt-4">Processing...</p>
            </>
          )}

          {transcript && !processing && (
            <div className="text-left">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">You said</p>
              <p className="text-gray-800 bg-gray-50 rounded-xl p-3 mb-4">{transcript}</p>

              {intent && (
                <div className="mb-4">
                  {intent.intent === "crop_doctor" && (
                    <div className="bg-green-50 text-green-800 rounded-xl p-3 text-sm">
                      Taking you to Crop Doctor...
                    </div>
                  )}
                  {intent.intent === "price" && (
                    <div className="bg-green-50 text-green-800 rounded-xl p-3 text-sm">
                      Taking you to Market Prices...
                    </div>
                  )}
                  {intent.intent === "general" && (
                    <div className="bg-blue-50 text-blue-800 rounded-xl p-3 text-sm">
                      I understand: {intent.reasoning}
                    </div>
                  )}
                  {intent.intent === "unclear" && (
                    <div className="bg-yellow-50 text-yellow-800 rounded-xl p-3 text-sm">
                      I&apos;m not sure what you need. Try asking about a crop disease or market price.
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={reset}
                className="w-full bg-gray-200 py-2 rounded-xl text-sm font-medium"
              >
                Try Again
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 rounded-xl p-3 text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}