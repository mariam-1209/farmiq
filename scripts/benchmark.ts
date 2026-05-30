import "dotenv/config";
import { analyzeCropPhoto } from "../lib/agents/cropDoctor";
import { createObjectCsvWriter } from "csv-writer";
import * as fs from "fs";
import * as path from "path";

const IMAGES_DIR = path.join(process.cwd(), "benchmark-images");
const DELAY_MS = 2000;

// Parse filename like "tomato-early-blight-1.jpg" into { crop, disease }
function parseFilename(filename: string): { crop: string; disease: string } | null {
  const base = filename.replace(/\.(jpg|jpeg|png|webp)$/i, "");
  const parts = base.split("-");
  if (parts.length < 3) return null;

  const crop = parts[0];
  const numberPart = parts[parts.length - 1];
  const diseaseParts = parts.slice(1, parts.length - 1);

  // Capitalize each word
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

  return {
    crop: capitalize(crop),
    disease: diseaseParts.map(capitalize).join(" "),
  };
}

function normalize(s: string | null | undefined): string {
  if (!s) return "";
  return s.toLowerCase().replace(/[^a-z]/g, "");
}

function isMatch(predicted: string | null, truth: string): boolean {
  const p = normalize(predicted);
  const t = normalize(truth);
  if (!p || !t) return false;
  return p.includes(t) || t.includes(p);
}

type Result = {
  filename: string;
  trueCrop: string;
  trueDisease: string;
  predictedCrop: string | null;
  predictedDisease: string | null;
  confidence: number;
  cropCorrect: boolean;
  diseaseCorrect: boolean;
  durationMs: number;
  error: string | null;
};

async function imageFileToDataUrl(filePath: string): Promise<string> {
  const buffer = fs.readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase().slice(1);
  const mime = ext === "jpg" ? "jpeg" : ext;
  return `data:image/${mime};base64,${buffer.toString("base64")}`;
}

async function runBenchmark() {
  if (!fs.existsSync(IMAGES_DIR)) {
    console.error(`Folder not found: ${IMAGES_DIR}`);
    console.error("Create 'benchmark-images/' in project root with labeled images.");
    process.exit(1);
  }

  const files = fs
    .readdirSync(IMAGES_DIR)
    .filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f))
    .sort();

  if (files.length === 0) {
    console.error("No images found in benchmark-images/");
    process.exit(1);
  }

  console.log(`Found ${files.length} images. Starting benchmark...\n`);
  const results: Result[] = [];

  for (let i = 0; i < files.length; i++) {
    const filename = files[i];
    const labels = parseFilename(filename);

    if (!labels) {
      console.log(`[${i + 1}/${files.length}] ${filename} — SKIPPED (bad filename)`);
      continue;
    }

    console.log(`\n[${i + 1}/${files.length}] ${filename}`);
    console.log(`  Expected: ${labels.crop} - ${labels.disease}`);

    const filePath = path.join(IMAGES_DIR, filename);
    const dataUrl = await imageFileToDataUrl(filePath);
    const start = Date.now();

    try {
      const analysis = await analyzeCropPhoto(dataUrl);
      const duration = Date.now() - start;

      const cropCorrect = isMatch(analysis.crop, labels.crop);
      const diseaseCorrect = isMatch(analysis.disease, labels.disease);

      console.log(`  Predicted: ${analysis.crop ?? "null"} - ${analysis.disease ?? "null"} (conf: ${analysis.confidence})`);
      console.log(`  Crop ${cropCorrect ? "✓" : "✗"}  Disease ${diseaseCorrect ? "✓" : "✗"}  (${duration}ms)`);

      results.push({
        filename,
        trueCrop: labels.crop,
        trueDisease: labels.disease,
        predictedCrop: analysis.crop,
        predictedDisease: analysis.disease,
        confidence: analysis.confidence,
        cropCorrect,
        diseaseCorrect,
        durationMs: duration,
        error: null,
      });
    } catch (err) {
      const duration = Date.now() - start;
      const msg = err instanceof Error ? err.message : String(err);
      console.log(`  ERROR: ${msg}`);
      results.push({
        filename,
        trueCrop: labels.crop,
        trueDisease: labels.disease,
        predictedCrop: null,
        predictedDisease: null,
        confidence: 0,
        cropCorrect: false,
        diseaseCorrect: false,
        durationMs: duration,
        error: msg,
      });
    }

    if (i < files.length - 1) {
      await new Promise((r) => setTimeout(r, DELAY_MS));
    }
  }

  // Aggregate
  const total = results.length;
  const successful = results.filter((r) => !r.error).length;
  const cropAcc = (results.filter((r) => r.cropCorrect).length / total) * 100;
  const diseaseAcc = (results.filter((r) => r.diseaseCorrect).length / total) * 100;
  const bothAcc = (results.filter((r) => r.cropCorrect && r.diseaseCorrect).length / total) * 100;
  const avgDuration = results.reduce((sum, r) => sum + r.durationMs, 0) / total;

  const perClass = new Map<string, { correct: number; total: number }>();
  for (const r of results) {
    const key = `${r.trueCrop} - ${r.trueDisease}`;
    const cur = perClass.get(key) ?? { correct: 0, total: 0 };
    cur.total += 1;
    if (r.diseaseCorrect) cur.correct += 1;
    perClass.set(key, cur);
  }

  console.log("\n========== BENCHMARK RESULTS ==========");
  console.log(`Total samples:       ${total}`);
  console.log(`Successful calls:    ${successful}`);
  console.log(`Crop accuracy:       ${cropAcc.toFixed(1)}%`);
  console.log(`Disease accuracy:    ${diseaseAcc.toFixed(1)}%`);
  console.log(`Both correct:        ${bothAcc.toFixed(1)}%`);
  console.log(`Avg latency:         ${avgDuration.toFixed(0)}ms`);
  console.log("\nPer-class accuracy:");
  for (const [key, { correct, total }] of perClass.entries()) {
    console.log(`  ${key}: ${correct}/${total} (${((correct / total) * 100).toFixed(0)}%)`);
  }

  // Save outputs
  const outDir = path.join(process.cwd(), "benchmark-results");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

  const writer = createObjectCsvWriter({
    path: path.join(outDir, `results-${timestamp}.csv`),
    header: [
      { id: "filename", title: "Filename" },
      { id: "trueCrop", title: "True Crop" },
      { id: "trueDisease", title: "True Disease" },
      { id: "predictedCrop", title: "Predicted Crop" },
      { id: "predictedDisease", title: "Predicted Disease" },
      { id: "confidence", title: "Confidence" },
      { id: "cropCorrect", title: "Crop Correct" },
      { id: "diseaseCorrect", title: "Disease Correct" },
      { id: "durationMs", title: "Duration (ms)" },
      { id: "error", title: "Error" },
    ],
  });
  await writer.writeRecords(results);

  const summary = `FarmIQ Vision Agent — Benchmark Results
========================================
Date:               ${new Date().toISOString()}
Model:              gemini-2.5-flash
Samples:            ${total}
Successful calls:   ${successful}

Overall:
  Crop accuracy:    ${cropAcc.toFixed(1)}%
  Disease accuracy: ${diseaseAcc.toFixed(1)}%
  Both correct:     ${bothAcc.toFixed(1)}%
  Avg latency:      ${avgDuration.toFixed(0)}ms

Per-class:
${Array.from(perClass.entries())
  .map(([k, { correct, total }]) => `  ${k}: ${correct}/${total} (${((correct / total) * 100).toFixed(0)}%)`)
  .join("\n")}
`;
  fs.writeFileSync(path.join(outDir, `summary-${timestamp}.txt`), summary);

  console.log(`\nResults saved to benchmark-results/`);
}

runBenchmark()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Benchmark crashed:", err);
    process.exit(1);
  });