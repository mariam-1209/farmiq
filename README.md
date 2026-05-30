# FarmIQ

A multi-agent AI assistant that diagnoses plant diseases from photos and responds in Kannada, Hindi, or English.

**Live:** https://farmiq-mu.vercel.app




---

## Screenshots

## Screenshots

<p align="center">
  <img src="screenshots/landing.jpg.jpeg" width="200" alt="Landing page" />
  <img src="screenshots/dashboard.jpg.jpeg" width="200" alt="Dashboard" />
  <img src="screenshots/result.jpg.jpeg" width="200" alt="Diagnosis result" />
  <img src="screenshots/voice1.jpg.jpeg" width="200" alt="Voice input" />
</p>

---

## Overview

FarmIQ accepts a leaf photo or a voice query and returns a structured treatment plan in the user's preferred language. It is built for Indian farmers and home gardeners underserved by English-only AI tools.

---

## Architecture

| Agent | Role | Model |
|---|---|---|
| Vision | Identifies plant, disease, severity, symptoms from a photo | Gemini 2.5 Flash |
| Treatment | Generates structured treatment plan with steps, products, prevention | Groq Llama 3.3 70B |
| Orchestrator | Classifies voice transcripts and routes intent | Groq Llama 3.3 70B |
| Translation | Translates English plans into Kannada or Hindi | Groq Llama 3.3 70B |
| Voice Pipeline | Speech-to-text and text-to-speech with audio caching | Sarvam AI |

Each agent is independent and specialized, allowing the system to use the most cost-effective model per task and to degrade gracefully when any single agent fails.

---

## Tech Stack

- Next.js 16 (App Router), TypeScript, Tailwind CSS, Framer Motion
- Prisma 7 with `@prisma/adapter-pg`, Supabase Postgres
- Supabase Auth (Google OAuth), Supabase Storage (private buckets with signed URLs)
- Gemini, Groq, Sarvam APIs
- Deployed on Vercel

---

## Engineering Highlights

- Private storage with 1-hour signed URLs regenerated on every render
- Ownership validation and Zod input validation on every API route
- TTS audio cached by SHA-256 hash of text and language
- Graceful degradation when individual agents fail

---

## Vision Benchmark

Tested against 10 manually curated leaf images covering four crops and six conditions.

| Class | Accuracy |
|---|---|
| Rice (Blast, Healthy) | 100% |
| Potato (Healthy, Late Blight) | 100% |
| Tomato Early Blight | 50% |
| Potato Early Blight | 0% |
| Tomato Late Blight | 0% |
| Tomato Healthy | 0% |

Overall: 60% crop, 50% disease, ~4s average latency.

The model performs well on visually distinctive diseases and underperforms on tomato leaf conditions. A production version would augment Gemini with a specialized classifier as a second opinion.

---

## Roadmap

- Offline PWA mode with sync on reconnect
- Larger benchmark study with confusion matrix
- Mandi price integration via data.gov.in
- Diagnosis-aware crop calendar

---

## Local Setup

```bash
git clone https://github.com/mariam-1209/farmiq.git
cd farmiq
pnpm install
cp .env.example .env
pnpm prisma db push
pnpm prisma generate
pnpm dev
```

Required environment variables: Supabase URL and keys, `DATABASE_URL`, `DIRECT_URL`, `GEMINI_API_KEY`, `GROQ_API_KEY`, `SARVAM_API_KEY`.

---

## License

MIT
