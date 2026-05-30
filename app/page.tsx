"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Leaf,
  Camera,
  Mic,
  BookOpen,
  ArrowRight,
  GitBranch,
  CheckCircle2,
  Sparkles,
  Zap,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function Home() {
  return (
    <div
      className="min-h-screen"
      style={{ background: "#faf8f4", fontFamily: "var(--font-jakarta, system-ui, sans-serif)" }}
    >
      {/* ── Navbar ─────────────────────────────────────────────── */}
      <nav
        className="sticky top-0 z-50 border-b"
        style={{
          background: "rgba(250,248,244,0.85)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderColor: "#e0ebe4",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "#1d5c3a" }}
            >
              <Leaf size={15} color="white" />
            </div>
            <span
              className="font-bold text-lg tracking-tight"
              style={{ color: "#0f1f15" }}
            >
              FarmIQ
            </span>
          </div>
          <Link
            href="/login"
            className="flex items-center gap-1.5 text-sm font-semibold px-5 py-2.5 rounded-full transition-all"
            style={{
              background: "#1d5c3a",
              color: "white",
            }}
          >
            Sign In
            <ArrowRight size={14} />
          </Link>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Background layers */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(29,92,58,0.08) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: "rgba(29,92,58,0.04)", filter: "blur(60px)" }}
        />
        <div
          className="absolute -bottom-16 -left-24 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: "rgba(240,235,226,0.8)", filter: "blur(60px)" }}
        />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-28 text-center">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-7 border"
              style={{
                background: "rgba(29,92,58,0.08)",
                color: "#1d5c3a",
                borderColor: "rgba(29,92,58,0.2)",
              }}
            >
              <Sparkles size={12} />
              Multi-Agent AI · Built for Indian Farmers
            </div>

            {/* Headline */}
            <h1
              className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight tracking-tight mb-6"
              style={{ color: "#0f1f15" }}
            >
              Your farm&apos;s health,{" "}
              <br className="hidden sm:block" />
              <span
                style={{
                  background: "linear-gradient(135deg, #1d5c3a 0%, #2d8653 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                diagnosed in seconds
              </span>
            </h1>

            {/* Subtext */}
            <p
              className="max-w-lg mx-auto text-lg leading-relaxed mb-10"
              style={{ color: "#4b5563" }}
            >
              Take a photo of any affected leaf. FarmIQ&apos;s AI identifies the
              disease and delivers a step-by-step treatment plan — in Kannada,
              Hindi, or English.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <motion.div whileTap={{ scale: 0.97 }}>
                <Link
                  href="/login"
                  className="flex items-center gap-2 font-semibold text-base px-7 py-3.5 rounded-full transition-all"
                  style={{
                    background: "#1d5c3a",
                    color: "white",
                    boxShadow: "0 4px 20px rgba(29,92,58,0.25)",
                  }}
                >
                  Get Started Free
                  <ArrowRight size={18} />
                </Link>
              </motion.div>
              <motion.div whileTap={{ scale: 0.97 }}>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 font-medium text-base px-7 py-3.5 rounded-full border transition-all"
                  style={{
                    color: "#374151",
                    borderColor: "#d1d5db",
                    background: "white",
                  }}
                >
                  <GitBranch size={18} />
                  GitHub
                </a>
              </motion.div>
            </div>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.65, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="mt-16 inline-flex flex-wrap justify-center gap-6 sm:gap-10 rounded-2xl px-8 py-5 border"
            style={{
              background: "rgba(255,255,255,0.7)",
              backdropFilter: "blur(8px)",
              borderColor: "#e0ebe4",
            }}
          >
            {[
              { value: "95%", label: "Accuracy" },
              { value: "3", label: "Languages" },
              { value: "< 5s", label: "Diagnosis Time" },
              { value: "50+", label: "Diseases Detected" },
            ].map((stat) => (
              <div key={stat.label} className="text-center min-w-[64px]">
                <p className="text-xl font-bold" style={{ color: "#1d5c3a" }}>
                  {stat.value}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "#6b7280" }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 max-w-6xl mx-auto">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <h2
            className="text-3xl font-bold mb-3"
            style={{ color: "#0f1f15" }}
          >
            Everything a farmer needs
          </h2>
          <p className="max-w-sm mx-auto" style={{ color: "#6b7280" }}>
            Built for real farmers in rural India — fast, accurate, and
            multilingual.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              icon: Camera,
              title: "Photo Diagnosis",
              description:
                "Snap a photo of any leaf. Our vision AI instantly identifies the disease, its severity, and affected area.",
              iconBg: "#e8f5ee",
              iconColor: "#1d5c3a",
              delay: 0,
            },
            {
              icon: Mic,
              title: "Voice in Your Language",
              description:
                "Ask questions or hear diagnoses read aloud in Kannada, Hindi, or English. No reading required.",
              iconBg: "#fdf3e3",
              iconColor: "#92520a",
              delay: 0.1,
            },
            {
              icon: BookOpen,
              title: "Actionable Treatment Plans",
              description:
                "Step-by-step treatment instructions, product recommendations, and prevention tips tailored to your crop.",
              iconBg: "#e8f0f5",
              iconColor: "#1a3d5c",
              delay: 0.2,
            },
          ].map((feature) => (
            <motion.div
              key={feature.title}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: feature.delay }}
              whileHover={{ y: -4 }}
              className="rounded-2xl p-6 border transition-shadow"
              style={{
                background: "white",
                borderColor: "#f0f0f0",
                boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ background: feature.iconBg }}
              >
                <feature.icon size={22} color={feature.iconColor} />
              </div>
              <h3
                className="font-semibold text-lg mb-2"
                style={{ color: "#0f1f15" }}
              >
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "#6b7280" }}>
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6" style={{ background: "#f5f0e8" }}>
        <div className="max-w-6xl mx-auto">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl font-bold mb-3" style={{ color: "#0f1f15" }}>
              How it works
            </h2>
            <p className="max-w-sm mx-auto" style={{ color: "#6b7280" }}>
              Three simple steps from photo to treatment plan.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                step: "01",
                title: "Take a Photo",
                description:
                  "Open the Crop Doctor and snap a close-up photo of the affected leaf or plant part in good lighting.",
              },
              {
                step: "02",
                title: "AI Analyzes It",
                description:
                  "Our multi-agent AI pipeline identifies the crop, detects the disease, and assesses severity — all within seconds.",
              },
              {
                step: "03",
                title: "Follow the Plan",
                description:
                  "Receive a personalized treatment plan with exact steps, product names, and timelines. Listen to it aloud.",
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative rounded-2xl p-6 border"
                style={{
                  background: "white",
                  borderColor: "#e8e0d5",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                }}
              >
                <div
                  className="text-5xl font-black leading-none mb-4"
                  style={{ color: "#e8f5ee" }}
                >
                  {item.step}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 size={17} color="#1d5c3a" />
                  <h3 className="font-semibold" style={{ color: "#0f1f15" }}>
                    {item.title}
                  </h3>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: "#6b7280" }}>
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ─────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto rounded-3xl p-10 text-center"
          style={{ background: "#1d5c3a" }}
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: "rgba(255,255,255,0.12)" }}
          >
            <Zap size={22} color="white" />
          </div>
          <h2
            className="text-2xl font-bold mb-3"
            style={{ color: "white" }}
          >
            Ready to protect your crops?
          </h2>
          <p className="text-sm mb-7" style={{ color: "rgba(255,255,255,0.65)" }}>
            Free to use. No app download needed. Works on any phone.
          </p>
          <motion.div whileTap={{ scale: 0.97 }}>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 font-semibold px-7 py-3.5 rounded-full transition-colors"
              style={{ background: "white", color: "#1d5c3a" }}
            >
              Start Now — It&apos;s Free
              <ArrowRight size={18} />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer
        className="border-t py-8 px-4 sm:px-6"
        style={{ borderColor: "#e0ebe4" }}
      >
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: "#1d5c3a" }}
            >
              <Leaf size={12} color="white" />
            </div>
            <span className="font-bold text-sm" style={{ color: "#0f1f15" }}>
              FarmIQ
            </span>
            <span style={{ color: "#9ca3af" }} className="text-sm">
              · Built with care for farmers
            </span>
          </div>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm transition-colors"
            style={{ color: "#6b7280" }}
          >
            <GitBranch size={16} />
            GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}
