// ── VoxGuard Batch Analysis & A/B Differential Forensic API Endpoint ───────
// POST /api/batch
// Handles batch analysis of multiple audio files or A/B comparative forensic divergence.

import { NextRequest, NextResponse } from "next/server";
import { validateAudioUpload, sanitizeFilename } from "@/lib/server/validators";
import { parseAudioBuffer, type ParsedAudio } from "@/lib/server/audioParser";
import { runServerForensicAnalysis } from "@/lib/server/dspEngine";
import { issueForensicCertificate } from "@/lib/server/certificate";
import { apiSuccess, apiError } from "@/lib/server/response";
import { logger } from "@/lib/server/logger";
import type {
  AnalysisResult,
  CompareAudioResponse,
  DivergenceDelta,
} from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const startTime = performance.now();
  const requestId = `req_batch_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;

  try {
    const contentType = req.headers.get("content-type") || "";

    if (!contentType.includes("multipart/form-data")) {
      return apiError(
        "Batch analysis requires 'multipart/form-data' content type.",
        "UNSUPPORTED_MEDIA_TYPE",
        415,
        startTime,
        undefined,
        requestId
      );
    }

    const formData = await req.formData();
    const mode = (formData.get("mode") as string) || "batch"; // 'batch' or 'compare'

    // ── Mode A: A/B Comparative Divergence ────────────────────────────────
    if (mode === "compare") {
      const fileA = formData.get("fileA");
      const fileB = formData.get("fileB");

      if (!fileA || !(fileA instanceof Blob) || !fileB || !(fileB instanceof Blob)) {
        return apiError(
          "Comparison mode requires both 'fileA' and 'fileB' form fields.",
          "MISSING_COMPARISON_FILES",
          400,
          startTime,
          undefined,
          requestId
        );
      }

      const bufferA = await fileA.arrayBuffer();
      const bufferB = await fileB.arrayBuffer();

      const valA = validateAudioUpload(bufferA, fileA.type, requestId);
      const valB = validateAudioUpload(bufferB, fileB.type, requestId);

      if (!valA.valid || !valB.valid) {
        return apiError(
          `Validation failed: ${[...valA.errors, ...valB.errors].join(" ")}`,
          "VALIDATION_FAILED",
          422,
          startTime,
          undefined,
          requestId
        );
      }

      const parsedA = parseAudioBuffer(bufferA, valA.detectedFormat, requestId);
      const parsedB = parseAudioBuffer(bufferB, valB.detectedFormat, requestId);

      const nameA = sanitizeFilename((fileA as File).name || "sample_A.wav");
      const nameB = sanitizeFilename((fileB as File).name || "sample_B.wav");

      const resultA = runServerForensicAnalysis(parsedA, nameA, undefined, requestId);
      const resultB = runServerForensicAnalysis(parsedB, nameB, undefined, requestId);

      issueForensicCertificate(resultA, requestId);
      issueForensicCertificate(resultB, requestId);

      // Compute acoustic divergence delta
      const jitterDelta = Math.abs(
        resultA.measurements.pitchJitterPercent - resultB.measurements.pitchJitterPercent
      );
      const shimmerDelta = Math.abs(
        resultA.measurements.vocalShimmerPercent - resultB.measurements.vocalShimmerPercent
      );
      const bandwidthDelta = Math.abs(
        resultA.measurements.spectralRolloff - resultB.measurements.spectralRolloff
      );
      const authenticityGap = Math.abs(resultA.overallScore - resultB.overallScore);

      let keyFinding = "Acoustically consistent profiles across both samples.";
      if (resultA.verdict !== resultB.verdict) {
        keyFinding = `Critical verdict divergence: Sample A detected as ${resultA.verdict.toUpperCase()} while Sample B detected as ${resultB.verdict.toUpperCase()}.`;
      } else if (authenticityGap > 0.3) {
        keyFinding = `Substantial authenticity score divergence (${(authenticityGap * 100).toFixed(1)}% gap) indicates differing vocoder/compression signatures.`;
      } else if (jitterDelta > 1.5) {
        keyFinding = `Micro-tremor pitch instability divergence (${jitterDelta.toFixed(2)}% PPQ difference).`;
      }

      const divergence: DivergenceDelta = {
        jitterDeltaPercent: Number(jitterDelta.toFixed(3)),
        shimmerDeltaPercent: Number(shimmerDelta.toFixed(3)),
        bandwidthDeltaHz: Math.round(bandwidthDelta),
        authenticityGap: Number(authenticityGap.toFixed(3)),
        confidence: Number(((resultA.confidence + resultB.confidence) / 2).toFixed(3)),
        keyDivergenceFinding: keyFinding,
      };

      const comparisonResponse: CompareAudioResponse = {
        sampleA: resultA,
        sampleB: resultB,
        divergence,
        comparisonTimestamp: new Date().toISOString(),
      };

      return apiSuccess(comparisonResponse, startTime, 200, requestId);
    }

    // ── Mode B: Multi-File Batch Analysis ─────────────────────────────────
    const files = formData.getAll("files");
    if (!files || files.length === 0) {
      return apiError(
        "No files provided in 'files' field for batch processing.",
        "NO_FILES_PROVIDED",
        400,
        startTime,
        undefined,
        requestId
      );
    }

    const batchResults: AnalysisResult[] = [];
    const batchErrors: { fileName: string; error: string }[] = [];

    for (const item of files) {
      if (item instanceof Blob) {
        const fileName = sanitizeFilename((item as File).name || "batch_audio.wav");
        try {
          const buffer = await item.arrayBuffer();
          const validation = validateAudioUpload(buffer, item.type, requestId);
          if (!validation.valid) {
            batchErrors.push({ fileName, error: validation.errors.join(", ") });
            continue;
          }

          const parsed = parseAudioBuffer(buffer, validation.detectedFormat, requestId);
          const result = runServerForensicAnalysis(parsed, fileName, undefined, requestId);
          issueForensicCertificate(result, requestId);
          batchResults.push(result);
        } catch (err) {
          batchErrors.push({
            fileName,
            error: err instanceof Error ? err.message : String(err),
          });
        }
      }
    }

    logger.info("Batch analysis complete", {
      totalSubmitted: files.length,
      successful: batchResults.length,
      failed: batchErrors.length,
    }, requestId);

    return apiSuccess(
      {
        total: files.length,
        processed: batchResults.length,
        results: batchResults,
        errors: batchErrors,
      },
      startTime,
      200,
      requestId
    );
  } catch (err) {
    logger.error("Unhandled error in /api/batch", err, {}, requestId);
    return apiError(
      "Batch processing failure.",
      "BATCH_ERROR",
      500,
      startTime,
      { error: err instanceof Error ? err.message : String(err) },
      requestId
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
