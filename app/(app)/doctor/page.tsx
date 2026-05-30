"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Camera, Upload, Loader2, ChevronRight, ImageIcon, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

type PastDiagnosis = {
  id: string;
  photoUrl: string;
  cropDetected: string | null;
  diseaseDetected: string | null;
  severity: string | null;
  status: string;
  createdAt: string;
};

export default function DoctorPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [history, setHistory] = useState<PastDiagnosis[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await fetch("/api/diagnoses");
        if (res.ok) {
          const data = await res.json();
          setHistory(data.diagnoses);
        }
      } catch (err) {
        console.error("Failed to load history", err);
      } finally {
        setLoadingHistory(false);
      }
    }
    loadHistory();
  }, []);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!selected.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }
    if (selected.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB");
      return;
    }

    setError(null);
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  }

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("Please log in again");
        setUploading(false);
        return;
      }

      const ext = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("crop-photos")
        .upload(fileName, file);

      if (uploadError) {
        setError("Upload failed: " + uploadError.message);
        setUploading(false);
        return;
      }

      const res = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoPath: fileName }),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Something went wrong");
        setUploading(false);
        return;
      }

      const { diagnosisId } = await res.json();
      router.push(`/doctor/${diagnosisId}`);
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
      setUploading(false);
    }
  }

  function reset() {
    setPreview(null);
    setFile(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function formatDate(iso: string) {
    const d = new Date(iso);
    const now = new Date();
    const diff = (now.getTime() - d.getTime()) / 1000;
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
    return d.toLocaleDateString();
  }

  function getSeverityStyle(severity: string | null) {
    if (severity === "high") return { bg: "#fef2f2", dot: "#ef4444", text: "#b91c1c" };
    if (severity === "medium") return { bg: "#fffbeb", dot: "#f59e0b", text: "#92400e" };
    return { bg: "#f0faf4", dot: "#22c55e", text: "#166534" };
  }

  return (
    <div className="p-4 pt-6">
      {/* ── Header ── */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "#0f1f15" }}>
          Crop Doctor
        </h1>
        <p className="text-sm mt-1" style={{ color: "#6b7280" }}>
          Upload a clear photo of the affected leaf
        </p>
      </div>

      {/* ── Upload section ── */}
      <AnimatePresence mode="wait">
        {!preview ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            {/* Drop zone */}
            <motion.button
              onClick={() => fileInputRef.current?.click()}
              whileTap={{ scale: 0.99 }}
              className="w-full flex flex-col items-center justify-center gap-3 py-12 rounded-2xl border-2 border-dashed transition-colors"
              style={{
                borderColor: "#c6e8d2",
                background: "#f8fdfb",
              }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: "#e8f5ee" }}
              >
                <Camera size={26} color="#1d5c3a" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-sm" style={{ color: "#1d5c3a" }}>
                  Take or upload a photo
                </p>
                <p className="text-xs mt-0.5" style={{ color: "#9ca3af" }}>
                  JPG, PNG · Max 5 MB
                </p>
              </div>
            </motion.button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />

            <p
              className="text-center text-xs mt-3"
              style={{ color: "#9ca3af" }}
            >
              For best results, shoot in bright natural light
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="space-y-3"
          >
            {/* Image preview */}
            <div
              className="rounded-2xl overflow-hidden border"
              style={{ background: "#f3f4f6", borderColor: "#e5e7eb" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="Crop preview"
                className="w-full object-cover"
                style={{ maxHeight: "280px" }}
              />
            </div>

            <div className="flex gap-3">
              <motion.button
                onClick={reset}
                disabled={uploading}
                whileTap={{ scale: 0.97 }}
                className="flex-1 py-3 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                style={{ background: "#f3f4f6", color: "#374151" }}
              >
                Retake
              </motion.button>
              <motion.button
                onClick={handleUpload}
                disabled={uploading}
                whileTap={{ scale: 0.97 }}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                style={{
                  background: "#1d5c3a",
                  color: "white",
                  boxShadow: "0 4px 12px rgba(29,92,58,0.25)",
                }}
              >
                {uploading ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Diagnosing...
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    Diagnose
                  </>
                )}
              </motion.button>
            </div>

            {uploading && (
              <div
                className="rounded-xl p-3 flex items-center gap-2"
                style={{ background: "#f0faf4" }}
              >
                <Loader2 size={14} className="animate-spin" color="#1d5c3a" />
                <p className="text-xs" style={{ color: "#1d5c3a" }}>
                  AI is analyzing your crop photo — this takes a few seconds...
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Error ── */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 flex items-start gap-2 p-3 rounded-xl"
          style={{ background: "#fef2f2" }}
        >
          <AlertCircle size={15} color="#dc2626" className="shrink-0 mt-0.5" />
          <p className="text-sm" style={{ color: "#b91c1c" }}>
            {error}
          </p>
        </motion.div>
      )}

      {/* ── Past diagnoses ── */}
      {!preview && (
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={14} color="#9ca3af" />
            <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: "#9ca3af" }}>
              Past Diagnoses
            </h2>
          </div>

          {/* Skeleton loading */}
          {loadingHistory && (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-2xl border animate-pulse"
                  style={{ background: "white", borderColor: "#f0f0f0" }}
                >
                  <div
                    className="w-14 h-14 rounded-xl shrink-0"
                    style={{ background: "#f3f4f6" }}
                  />
                  <div className="flex-1 space-y-2">
                    <div
                      className="h-3 rounded-full"
                      style={{ background: "#f3f4f6", width: "60%" }}
                    />
                    <div
                      className="h-3 rounded-full"
                      style={{ background: "#f3f4f6", width: "40%" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loadingHistory && history.length === 0 && (
            <div
              className="rounded-2xl p-8 text-center border"
              style={{ background: "white", borderColor: "#f0f0f0" }}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
                style={{ background: "#f5f5f5" }}
              >
                <ImageIcon size={22} color="#9ca3af" />
              </div>
              <p className="font-medium text-sm" style={{ color: "#374151" }}>
                No diagnoses yet
              </p>
              <p className="text-xs mt-1" style={{ color: "#9ca3af" }}>
                Upload your first photo to get started
              </p>
            </div>
          )}

          {/* History list */}
          {!loadingHistory && history.length > 0 && (
            <div className="space-y-2">
              {history.map((d) => {
                const sev = getSeverityStyle(d.severity);
                return (
                  <Link
                    key={d.id}
                    href={`/doctor/${d.id}`}
                    className="group flex items-center gap-3 rounded-2xl p-3 border transition-all"
                    style={{
                      background: "white",
                      borderColor: "#f0f0f0",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={d.photoUrl}
                      alt=""
                      className="w-14 h-14 rounded-xl object-cover shrink-0"
                      style={{ background: "#f3f4f6" }}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className="font-semibold text-sm truncate"
                        style={{ color: "#0f1f15" }}
                      >
                        {d.diseaseDetected ??
                          (d.status === "failed" ? "Analysis failed" : "Processing...")}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs truncate" style={{ color: "#6b7280" }}>
                          {d.cropDetected ?? "—"} · {formatDate(d.createdAt)}
                        </p>
                        {d.severity && (
                          <span
                            className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full font-medium shrink-0"
                            style={{
                              background: sev.bg,
                              color: sev.text,
                            }}
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ background: sev.dot }}
                            />
                            {d.severity}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight
                      size={16}
                      color="#d1d5db"
                      className="shrink-0 group-hover:translate-x-0.5 transition-transform"
                    />
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}