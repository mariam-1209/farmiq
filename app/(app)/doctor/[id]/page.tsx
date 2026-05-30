import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { Loader2, AlertCircle, CheckCircle, AlertTriangle, ShoppingBag, Shield } from "lucide-react";
import type { TreatmentPlan } from "@/lib/agents/treatmentPlanner";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import ListenButton from "@/components/ListenButton";

export const dynamic = "force-dynamic";

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
  const profile = await prisma.profile.findUnique({ where: { id: user.id } });
  const userLang = (profile?.primaryLanguage ?? "en") as "kn" | "hi" | "en";

  // Regenerate fresh signed URL if we have a stored path (handles expiry)
  let displayPhotoUrl = diagnosis.photoUrl;
  if (diagnosis.photoPath) {
    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { data: signedData } = await admin.storage
      .from("crop-photos")
      .createSignedUrl(diagnosis.photoPath, 60 * 60);
    if (signedData) {
      displayPhotoUrl = signedData.signedUrl;
    }
  }

  const treatmentData = diagnosis.treatmentPlan as {
    symptoms?: string[];
    observation?: string;
    plan?: TreatmentPlan;
    error?: string;
  } | null;

  const plan = treatmentData?.plan;

  const severityColor =
    diagnosis.severity === "high"
      ? "bg-red-100 text-red-700"
      : diagnosis.severity === "medium"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-green-100 text-green-700";

  return (
    <div className="p-4 space-y-4 pb-8">
      <h1 className="text-2xl font-bold text-gray-800">Diagnosis</h1>

      <div className="rounded-2xl overflow-hidden bg-gray-100">
        <img src={displayPhotoUrl} alt="Uploaded crop" className="w-full" />
      </div>

      {diagnosis.status === "processing" && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 text-center">
          <Loader2 className="animate-spin mx-auto text-yellow-600 mb-3" size={32} />
          <p className="font-medium text-yellow-800">Analyzing image...</p>
        </div>
      )}

      {diagnosis.status === "failed" && (
        <div className="space-y-3">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-medium text-red-800">Analysis failed</p>
                <p className="text-sm text-red-700 mt-1">
                  {treatmentData?.error ?? "Please try again with a different photo."}
                </p>
              </div>
            </div>
          </div>
          <a
            href="/doctor"
            className="block w-full bg-green-600 text-white py-3 rounded-xl font-medium text-center"
           >
            Try Again
          </a>
        </div>
      )}

      {diagnosis.status === "complete" && (
        <>
          {/* Plant & Diagnosis card */}
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Plant</p>
            <p className="text-lg font-semibold text-gray-800">
              {diagnosis.cropDetected ?? "Unknown"}
            </p>

            <div className="border-t mt-4 pt-4">
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

              <div className="flex flex-wrap gap-2 mt-3">
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
          </div>

          {/* Treatment Plan */}
          {plan ? (
            <>
              {/* Summary */}
              <div className="bg-white rounded-2xl shadow-sm p-5">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Summary</p>
                <p className="text-sm text-gray-700">{plan.summary}</p>
              </div>

              {/* Immediate Actions */}
              {plan.immediateActions && plan.immediateActions.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="text-red-600" size={18} />
                    <p className="font-semibold text-red-800">Do This Now</p>
                  </div>
                  <ul className="space-y-2">
                    {plan.immediateActions.map((action, i) => (
                      <li key={i} className="text-sm text-red-700 flex items-start gap-2">
                        <span className="text-red-600 mt-0.5">•</span>
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Treatment Steps */}
              {plan.treatmentSteps && plan.treatmentSteps.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm p-5">
                  <p className="font-semibold text-gray-800 mb-3">Treatment Steps</p>
                  <div className="space-y-4">
                    {plan.treatmentSteps.map((step) => (
                      <div key={step.step} className="flex gap-3">
                        <div className="shrink-0 w-7 h-7 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-semibold">
                          {step.step}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-800 text-sm">{step.title}</p>
                          <p className="text-sm text-gray-600 mt-0.5">{step.description}</p>
                          <p className="text-xs text-gray-400 mt-1">⏱ {step.timing}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Products */}
              {plan.recommendedProducts && plan.recommendedProducts.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <ShoppingBag size={18} className="text-gray-700" />
                    <p className="font-semibold text-gray-800">Recommended Products</p>
                  </div>
                  <div className="space-y-3">
                    {plan.recommendedProducts.map((product, i) => (
                      <div key={i} className="border-l-2 border-green-500 pl-3">
                        <p className="font-medium text-gray-800 text-sm">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.type} · {product.purpose}</p>
                        <p className="text-xs text-gray-600 mt-1">{product.notes}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Prevention */}
              {plan.preventionTips && plan.preventionTips.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield size={18} className="text-gray-700" />
                    <p className="font-semibold text-gray-800">Prevention Tips</p>
                  </div>
                  <ul className="space-y-2">
                    {plan.preventionTips.map((tip, i) => (
                      <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-green-600 mt-0.5">✓</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* When to see expert */}
              {plan.whenToSeeExpert && (
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                  <p className="text-sm text-blue-900">
                    <span className="font-semibold">When to see an expert: </span>
                    {plan.whenToSeeExpert}
                  </p>
                </div>
              )}
               
               {/* Listen Button */}
              <ListenButton
                text={`Diagnosis: ${diagnosis.diseaseDetected ?? "Unknown"} on ${diagnosis.cropDetected ?? "your plant"}. ${plan.summary} ${plan.treatmentSteps?.map((s) => `Step ${s.step}: ${s.title}. ${s.description}`).join(" ") ?? ""} ${plan.whenToSeeExpert ?? ""}`}
                language={userLang}
              />

              {/* Disclaimer */}
              {plan.disclaimer && (
                <p className="text-xs text-gray-400 text-center pt-2 px-2">
                  {plan.disclaimer}
                </p>
              )}
            </>
          ) : (
            // Vision succeeded but treatment failed — show partial result
            <>
              {treatmentData?.observation && (
                <div className="bg-white rounded-2xl shadow-sm p-5">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Observation</p>
                  <p className="text-sm text-gray-700">{treatmentData.observation}</p>
                </div>
              )}
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
                <p className="text-xs text-yellow-800">
                  Treatment plan could not be generated. Try refreshing the page.
                </p>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}