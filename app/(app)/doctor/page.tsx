"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Camera, Upload, Loader2, ChevronRight } from "lucide-react";
import Link from "next/link";

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

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Crop Doctor</h1>
      <p className="text-gray-500 text-sm mb-6">
        Upload a clear photo of the affected leaf for diagnosis
      </p>

      {/* Upload section */}
      {!preview && (
        <div className="space-y-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full bg-green-600 text-white rounded-2xl py-4 flex items-center justify-center gap-2 font-medium"
          >
            <Camera size={20} />
            Open Camera
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            className="hidden"
          />

          <p className="text-center text-xs text-gray-400">
            For best results, take a close-up photo in good lighting
          </p>
        </div>
      )}

      {preview && (
        <div className="space-y-4">
          <div className="rounded-2xl overflow-hidden bg-gray-100">
            <img src={preview} alt="Crop preview" className="w-full" />
          </div>

          <div className="flex gap-3">
            <button
              onClick={reset}
              disabled={uploading}
              className="flex-1 bg-gray-200 py-3 rounded-xl font-medium disabled:opacity-50"
            >
              Retake
            </button>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="flex-1 bg-green-600 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Diagnosing...
                </>
              ) : (
                <>
                  <Upload size={18} />
                  Diagnose
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Past diagnoses */}
      {!preview && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            Past Diagnoses
          </h2>

          {loadingHistory && (
            <div className="text-center py-8 text-gray-400 text-sm">
              Loading...
            </div>
          )}

          {!loadingHistory && history.length === 0 && (
            <div className="bg-white rounded-2xl p-6 text-center">
              <p className="text-sm text-gray-500">
                No diagnoses yet. Upload a photo to start.
              </p>
            </div>
          )}

          {!loadingHistory && history.length > 0 && (
            <div className="space-y-2">
              {history.map((d) => (
                <Link
                  key={d.id}
                  href={`/doctor/${d.id}`}
                  className="flex items-center gap-3 bg-white rounded-2xl p-3 hover:shadow-sm transition"
                >
                  <img
                    src={d.photoUrl}
                    alt=""
                    className="w-14 h-14 rounded-xl object-cover bg-gray-100"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-sm truncate">
                      {d.diseaseDetected ?? (d.status === "failed" ? "Failed" : "Processing...")}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {d.cropDetected ?? "—"} · {formatDate(d.createdAt)}
                    </p>
                  </div>
                  <ChevronRight size={18} className="text-gray-300 shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}