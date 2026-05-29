import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { Loader2 } from "lucide-react";

export default async function DiagnosisResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const diagnosis = await prisma.diagnosis.findUnique({
    where: { id },
  });

  if (!diagnosis) notFound();
  if (diagnosis.userId !== user.id) notFound(); // security: only owner can view

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Diagnosis</h1>

      <div className="rounded-2xl overflow-hidden bg-gray-100 mb-4">
        <img
          src={diagnosis.photoUrl}
          alt="Uploaded crop"
          className="w-full"
        />
      </div>

      {diagnosis.status === "processing" && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 text-center">
          <Loader2 className="animate-spin mx-auto text-yellow-600 mb-3" size={32} />
          <p className="font-medium text-yellow-800">Analyzing.....</p>
          <p className="text-sm text-yellow-700 mt-1">
            AI diagnosis coming in next step (Day 8)
          </p>
        </div>
      )}

      {diagnosis.status === "complete" && (
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="font-bold text-lg">
            {diagnosis.diseaseDetected ?? "Disease detected"}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Severity: {diagnosis.severity ?? "—"}
          </p>
          <p className="text-sm text-gray-500">
            Confidence: {diagnosis.confidence ? `${Math.round(diagnosis.confidence * 100)}%` : "—"}
          </p>
        </div>
      )}

      {diagnosis.status === "failed" && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <p className="font-medium text-red-800">Diagnosis failed</p>
          <p className="text-sm text-red-700 mt-1">Please try again</p>
        </div>
      )}
    </div>
  );
}