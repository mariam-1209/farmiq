import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";

export default async function DiagnosisResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const diagnosis = await prisma.diagnosis.findUnique({ where: { id } });
  if (!diagnosis) notFound();
  if (diagnosis.userId !== user.id) notFound();

  const plan = diagnosis.treatmentPlan as {
    symptoms?: string[];
    observation?: string;
    error?: string;
  } | null;

  const severityColor =
    diagnosis.severity === "high"
      ? "bg-red-100 text-red-700"
      : diagnosis.severity === "medium"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-green-100 text-green-700";

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">Diagnosis</h1>

      <div className="rounded-2xl overflow-hidden bg-gray-100">
        <img src={diagnosis.photoUrl} alt="Uploaded crop" className="w-full" />
      </div>

      {diagnosis.status === "processing" && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 text-center">
          <Loader2 className="animate-spin mx-auto text-yellow-600 mb-3" size={32} />
          <p className="font-medium text-yellow-800">Analyzing image...</p>
        </div>
      )}

      {diagnosis.status === "failed" && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={20} />
            <div>
              <p className="font-medium text-red-800">Analysis failed</p>
              <p className="text-sm text-red-700 mt-1">
                {plan?.error ?? "Please try again with a different photo."}
              </p>
            </div>
          </div>
        </div>
      )}

      {diagnosis.status === "complete" && (
        <>
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Plant</p>
            <p className="text-lg font-semibold text-gray-800">
              {diagnosis.cropDetected ?? "Unknown"}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Diagnosis</p>
                <p className="text-lg font-semibold text-gray-800">
                  {diagnosis.diseaseDetected ?? "Unknown"}
                </p>
              </div>
              {diagnosis.diseaseDetected === "Healthy" && (
                <CheckCircle className="text-green-600 shrink-0" size={24} />
              )}
            </div>

            <div className="flex gap-2 mt-3">
              {diagnosis.severity && (
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${severityColor}`}>
                  {diagnosis.severity.toUpperCase()} severity
                </span>
              )}
              {diagnosis.confidence !== null && (
                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 font-medium">
                  {Math.round((diagnosis.confidence ?? 0) * 100)}% confident
                </span>
              )}
            </div>
          </div>

          {plan?.observation && (
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Observation</p>
              <p className="text-sm text-gray-700">{plan.observation}</p>
            </div>
          )}

          {plan?.symptoms && plan.symptoms.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Symptoms detected</p>
              <ul className="space-y-1">
                {plan.symptoms.map((s, i) => (
                  <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">•</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
            <p className="text-xs text-blue-800">
              Treatment recommendations coming in next update.
            </p>
          </div>

          <p className="text-xs text-gray-400 text-center pt-2">
            AI-generated diagnosis. Consult an expert for serious cases.
          </p>
        </>
      )}
    </div>
  );
}