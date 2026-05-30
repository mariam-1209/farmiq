import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import {
  Loader2,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  ShoppingBag,
  Shield,
  ChevronLeft,
  Clock,
  Leaf,
} from "lucide-react";
import type { TreatmentPlan } from "@/lib/agents/treatmentPlanner";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import ListenButton from "@/components/ListenButton";
import Link from "next/link";

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

  // Severity styles
  const severityConfig =
    diagnosis.severity === "high"
      ? { bg: "#fef2f2", text: "#b91c1c", dot: "#ef4444", label: "High Severity" }
      : diagnosis.severity === "medium"
      ? { bg: "#fffbeb", text: "#92400e", dot: "#f59e0b", label: "Medium Severity" }
      : { bg: "#f0faf4", text: "#166534", dot: "#22c55e", label: "Low Severity" };

  return (
    <div className="pb-8">
      {/* ── Back link ── */}
      <div className="px-4 pt-4 pb-2">
        <Link
          href="/doctor"
          className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
          style={{ color: "#6b7280" }}
        >
          <ChevronLeft size={16} />
          Back to Crop Doctor
        </Link>
      </div>

      {/* ── Hero photo ── */}
      <div className="relative">
        <div
          className="overflow-hidden mx-4 rounded-2xl border"
          style={{ background: "#f3f4f6", borderColor: "#e5e7eb" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={displayPhotoUrl}
            alt="Uploaded crop"
            className="w-full object-cover"
            style={{ maxHeight: "280px" }}
          />
        </div>

        {/* Severity badge overlaid on photo */}
        {diagnosis.severity && diagnosis.status === "complete" && (
          <div className="absolute bottom-3 right-7">
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border"
              style={{
                background: severityConfig.bg,
                color: severityConfig.text,
                borderColor: severityConfig.dot + "40",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: severityConfig.dot }}
              />
              {severityConfig.label}
            </span>
          </div>
        )}
      </div>

      <div className="px-4 space-y-4 mt-4">
        {/* ── Processing state ── */}
        {diagnosis.status === "processing" && (
          <div
            className="rounded-2xl p-8 text-center border"
            style={{ background: "#fffbeb", borderColor: "#fde68a" }}
          >
            <div className="relative w-16 h-16 mx-auto mb-4">
              <Loader2
                className="animate-spin"
                size={48}
                style={{ color: "#d97706" }}
              />
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ color: "#d97706" }}
              >
                <Leaf size={18} />
              </div>
            </div>
            <p className="font-semibold" style={{ color: "#92400e" }}>
              Analyzing your crop...
            </p>
            <p className="text-xs mt-1" style={{ color: "#b45309" }}>
              Our AI agents are identifying the disease. This takes a few seconds.
            </p>
            <p className="text-xs mt-3 flex items-center justify-center gap-1" style={{ color: "#d97706" }}>
              <Clock size={11} />
              Refresh this page in a moment
            </p>
          </div>
        )}

        {/* ── Failed state ── */}
        {diagnosis.status === "failed" && (
          <div className="space-y-3">
            <div
              className="rounded-2xl p-5 border"
              style={{ background: "#fef2f2", borderColor: "#fecaca" }}
            >
              <div className="flex items-start gap-3">
                <AlertCircle
                  size={20}
                  style={{ color: "#dc2626" }}
                  className="shrink-0 mt-0.5"
                />
                <div>
                  <p className="font-semibold" style={{ color: "#991b1b" }}>
                    Analysis failed
                  </p>
                  <p className="text-sm mt-1" style={{ color: "#b91c1c" }}>
                    {treatmentData?.error ??
                      "Please try again with a clearer photo in good lighting."}
                  </p>
                </div>
              </div>
            </div>
            <Link
              href="/doctor"
              className="block w-full py-3 rounded-xl font-semibold text-sm text-center transition-all"
              style={{
                background: "#1d5c3a",
                color: "white",
                boxShadow: "0 4px 12px rgba(29,92,58,0.2)",
              }}
            >
              Try Again with a New Photo
            </Link>
          </div>
        )}

        {/* ── Complete state ── */}
        {diagnosis.status === "complete" && (
          <>
            {/* Plant & Diagnosis card */}
            <div
              className="rounded-2xl border p-5"
              style={{ background: "white", borderColor: "#f0f0f0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <p
                    className="text-xs font-semibold uppercase tracking-wider mb-1"
                    style={{ color: "#9ca3af" }}
                  >
                    Plant identified
                  </p>
                  <p
                    className="text-xl font-bold"
                    style={{ color: "#0f1f15" }}
                  >
                    {diagnosis.cropDetected ?? "Unknown"}
                  </p>
                </div>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "#e8f5ee" }}
                >
                  <Leaf size={18} color="#1d5c3a" />
                </div>
              </div>

              <div
                className="pt-4 border-t"
                style={{ borderColor: "#f5f5f5" }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p
                      className="text-xs font-semibold uppercase tracking-wider mb-1"
                      style={{ color: "#9ca3af" }}
                    >
                      Diagnosis
                    </p>
                    <div className="flex items-center gap-2">
                      <p
                        className="text-lg font-bold"
                        style={{ color: "#0f1f15" }}
                      >
                        {diagnosis.diseaseDetected ?? "Unknown"}
                      </p>
                      {diagnosis.diseaseDetected === "Healthy" && (
                        <CheckCircle size={20} color="#1d5c3a" />
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  {diagnosis.severity && (
                    <span
                      className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium"
                      style={{
                        background: severityConfig.bg,
                        color: severityConfig.text,
                      }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: severityConfig.dot }}
                      />
                      {diagnosis.severity.charAt(0).toUpperCase() + diagnosis.severity.slice(1)} severity
                    </span>
                  )}
                  {diagnosis.confidence !== null && (
                    <span
                      className="text-xs px-2.5 py-1 rounded-full font-medium"
                      style={{ background: "#f3f4f6", color: "#374151" }}
                    >
                      {Math.round((diagnosis.confidence ?? 0) * 100)}% confidence
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Treatment Plan */}
            {plan ? (
              <>
                {/* Summary */}
                <div
                  className="rounded-2xl border p-5"
                  style={{ background: "white", borderColor: "#f0f0f0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
                >
                  <p
                    className="text-xs font-semibold uppercase tracking-wider mb-2"
                    style={{ color: "#9ca3af" }}
                  >
                    Summary
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: "#374151" }}>
                    {plan.summary}
                  </p>
                </div>

                {/* Immediate Actions */}
                {plan.immediateActions && plan.immediateActions.length > 0 && (
                  <div
                    className="rounded-2xl border p-5"
                    style={{ background: "#fef2f2", borderColor: "#fecaca" }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ background: "#fee2e2" }}
                      >
                        <AlertTriangle size={14} color="#dc2626" />
                      </div>
                      <p className="font-semibold text-sm" style={{ color: "#991b1b" }}>
                        Do This Now
                      </p>
                    </div>
                    <ul className="space-y-2">
                      {plan.immediateActions.map((action, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <span
                            className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold"
                            style={{ background: "#fecaca", color: "#dc2626" }}
                          >
                            {i + 1}
                          </span>
                          <span className="text-sm" style={{ color: "#b91c1c" }}>
                            {action}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Treatment Steps */}
                {plan.treatmentSteps && plan.treatmentSteps.length > 0 && (
                  <div
                    className="rounded-2xl border p-5"
                    style={{ background: "white", borderColor: "#f0f0f0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
                  >
                    <p className="font-semibold text-sm mb-4" style={{ color: "#0f1f15" }}>
                      Treatment Steps
                    </p>
                    <div className="space-y-4">
                      {plan.treatmentSteps.map((s) => (
                        <div key={s.step} className="flex gap-3">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                            style={{ background: "#e8f5ee", color: "#1d5c3a" }}
                          >
                            {s.step}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-sm" style={{ color: "#0f1f15" }}>
                              {s.title}
                            </p>
                            <p className="text-sm mt-0.5 leading-relaxed" style={{ color: "#4b5563" }}>
                              {s.description}
                            </p>
                            <p className="text-xs mt-1 flex items-center gap-1" style={{ color: "#9ca3af" }}>
                              <Clock size={11} />
                              {s.timing}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Products */}
                {plan.recommendedProducts && plan.recommendedProducts.length > 0 && (
                  <div
                    className="rounded-2xl border p-5"
                    style={{ background: "white", borderColor: "#f0f0f0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <ShoppingBag size={16} color="#374151" />
                      <p className="font-semibold text-sm" style={{ color: "#0f1f15" }}>
                        Recommended Products
                      </p>
                    </div>
                    <div className="space-y-3">
                      {plan.recommendedProducts.map((product, i) => (
                        <div
                          key={i}
                          className="pl-3 border-l-2"
                          style={{ borderColor: "#1d5c3a" }}
                        >
                          <p className="font-semibold text-sm" style={{ color: "#0f1f15" }}>
                            {product.name}
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: "#6b7280" }}>
                            {product.type} · {product.purpose}
                          </p>
                          <p className="text-xs mt-1 leading-relaxed" style={{ color: "#4b5563" }}>
                            {product.notes}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Prevention */}
                {plan.preventionTips && plan.preventionTips.length > 0 && (
                  <div
                    className="rounded-2xl border p-5"
                    style={{ background: "white", borderColor: "#f0f0f0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Shield size={16} color="#374151" />
                      <p className="font-semibold text-sm" style={{ color: "#0f1f15" }}>
                        Prevention Tips
                      </p>
                    </div>
                    <ul className="space-y-2">
                      {plan.preventionTips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <span
                            className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                            style={{ background: "#e8f5ee" }}
                          >
                            <CheckCircle size={11} color="#1d5c3a" />
                          </span>
                          <span className="text-sm" style={{ color: "#374151" }}>
                            {tip}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* When to see expert */}
                {plan.whenToSeeExpert && (
                  <div
                    className="rounded-2xl border p-4 flex items-start gap-3"
                    style={{ background: "#eff6ff", borderColor: "#bfdbfe" }}
                  >
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: "#dbeafe" }}
                    >
                      <AlertCircle size={13} color="#2563eb" />
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: "#1e40af" }}>
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
                  <p
                    className="text-xs text-center px-2"
                    style={{ color: "#9ca3af" }}
                  >
                    {plan.disclaimer}
                  </p>
                )}
              </>
            ) : (
              // Vision succeeded but treatment failed — show partial result
              <>
                {treatmentData?.observation && (
                  <div
                    className="rounded-2xl border p-5"
                    style={{ background: "white", borderColor: "#f0f0f0" }}
                  >
                    <p
                      className="text-xs font-semibold uppercase tracking-wider mb-2"
                      style={{ color: "#9ca3af" }}
                    >
                      Observation
                    </p>
                    <p className="text-sm leading-relaxed" style={{ color: "#374151" }}>
                      {treatmentData.observation}
                    </p>
                  </div>
                )}
                <div
                  className="rounded-2xl border p-4"
                  style={{ background: "#fffbeb", borderColor: "#fde68a" }}
                >
                  <p className="text-xs" style={{ color: "#92400e" }}>
                    Treatment plan could not be generated. Try refreshing the page.
                  </p>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}