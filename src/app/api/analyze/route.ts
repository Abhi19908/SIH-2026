// ── VoxGuard Server Audio Analysis API Endpoint ───────────────────────────
// POST /api/analyze
// Accepts multipart/form-data file uploads or JSON payloads with base64 audio.
// Performs server-side binary validation, DSP forensic extraction, and cryptographic signing.

import { NextRequest, NextResponse } from "next/server";
import { validateAudioUpload, decodeBase64Audio, sanitizeFilename } from "@/lib/server/validators";
import { parseAudioBuffer, computeServerSHA256, type ParsedAudio } from "@/lib/server/audioParser";
import { runServerForensicAnalysis } from "@/lib/server/dspEngine";
import { issueForensicCertificate } from "@/lib/server/certificate";
import { apiSuccess, apiError } from "@/lib/server/response";
import { logger } from "@/lib/server/logger";
import type { Verdict } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const startTime = performance.now();
  const requestId = `req_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;

  try {
    const contentType = req.headers.get("content-type") || "";

    let buffer: ArrayBuffer | null = null;
    let fileName = "audio_sample.wav";
    let declaredMime: string | undefined;
    let forcedVerdict: Verdict | undefined;

    // ── 1. Parse Request (Multipart Form Data vs. JSON) ───────────────────
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file");
      const formVerdict = formData.get("forcedVerdict") as string | null;
      const formFileName = formData.get("fileName") as string | null;

      if (!file || !(file instanceof Blob)) {
        return apiError(
          "Missing or invalid 'file' field in multipart form data.",
          "INVALID_FORM_DATA",
          400,
          startTime,
          undefined,
          requestId
        );
      }

      buffer = await file.arrayBuffer();
      fileName = formFileName || (file as File).name || "uploaded_audio.wav";
      declaredMime = file.type || undefined;

      if (formVerdict === "human" || formVerdict === "cloned" || formVerdict === "suspicious") {
        forcedVerdict = formVerdict;
      }
    } else if (contentType.includes("application/json")) {
      const body = await req.json();

      if (body.audioBase64) {
        buffer = decodeBase64Audio(body.audioBase64, requestId);
        if (!buffer) {
          return apiError(
            "Failed to decode base64 audio payload.",
            "INVALID_BASE64",
            400,
            startTime,
            undefined,
            requestId
          );
        }
      } else if (body.pcmData && Array.isArray(body.pcmData)) {
        // Direct PCM ingestion from browser Web Audio API
        const pcmArray = new Float32Array(body.pcmData);
        const sampleRate = Number(body.sampleRate) || 44100;
        const rawBuffer = pcmArray.buffer as ArrayBuffer;
        const sha256 = computeServerSHA256(rawBuffer);

        fileName = sanitizeFilename(body.fileName || "client_pcm.wav");
        if (body.forcedVerdict === "human" || body.forcedVerdict === "cloned" || body.forcedVerdict === "suspicious") {
          forcedVerdict = body.forcedVerdict;
        }

        const parsed: ParsedAudio = {
          pcmData: pcmArray,
          sampleRate,
          duration: pcmArray.length / sampleRate,
          channels: 1,
          bitsPerSample: 32,
          rawBuffer,
          sha256,
        };

        const analysis = runServerForensicAnalysis(parsed, fileName, forcedVerdict, requestId);
        issueForensicCertificate(analysis, requestId);

        return apiSuccess(analysis, startTime, 200, requestId);
      } else {
        return apiError(
          "JSON payload must contain 'audioBase64' string or 'pcmData' array with 'sampleRate'.",
          "MISSING_AUDIO_PAYLOAD",
          400,
          startTime,
          undefined,
          requestId
        );
      }

      fileName = sanitizeFilename(body.fileName || "audio_sample.wav");
      declaredMime = body.mimeType;
      if (body.forcedVerdict === "human" || body.forcedVerdict === "cloned" || body.forcedVerdict === "suspicious") {
        forcedVerdict = body.forcedVerdict;
      }
    } else {
      return apiError(
        "Unsupported Content-Type. Use 'multipart/form-data' or 'application/json'.",
        "UNSUPPORTED_MEDIA_TYPE",
        415,
        startTime,
        undefined,
        requestId
      );
    }

    if (!buffer || buffer.byteLength === 0) {
      return apiError(
        "Empty audio payload received.",
        "EMPTY_PAYLOAD",
        400,
        startTime,
        undefined,
        requestId
      );
    }

    // ── 2. Validate Binary Payload & Magic Bytes ──────────────────────────
    const validation = validateAudioUpload(buffer, declaredMime, requestId);
    if (!validation.valid) {
      return apiError(
        validation.errors.join(" "),
        "VALIDATION_FAILED",
        422,
        startTime,
        { errors: validation.errors, warnings: validation.warnings },
        requestId
      );
    }

    // ── 3. Parse Audio Binary to Decoded Float32 PCM ──────────────────────
    let parsedAudio: ParsedAudio;
    try {
      parsedAudio = parseAudioBuffer(buffer, validation.detectedFormat, requestId);
    } catch (parseErr) {
      logger.error("Audio decoding error", parseErr, {}, requestId);
      return apiError(
        `Audio parsing error: ${parseErr instanceof Error ? parseErr.message : String(parseErr)}`,
        "DECODE_ERROR",
        422,
        startTime,
        undefined,
        requestId
      );
    }

    // ── 4. Run Server DSP & Forensic Feature Extraction ───────────────────
    const analysis = runServerForensicAnalysis(
      parsedAudio,
      sanitizeFilename(fileName),
      forcedVerdict,
      requestId
    );

    // ── 5. Issue Cryptographic Certificate ────────────────────────────────
    issueForensicCertificate(analysis, requestId);

    logger.info("Forensic analysis completed successfully", {
      caseId: analysis.id,
      verdict: analysis.verdict,
      confidence: analysis.confidence,
      processingTimeMs: Math.round(performance.now() - startTime),
    }, requestId);

    return apiSuccess(analysis, startTime, 200, requestId);
  } catch (err) {
    logger.error("Unhandled exception during /api/analyze", err, {}, requestId);
    return apiError(
      "Internal forensic server error occurred during analysis.",
      "INTERNAL_SERVER_ERROR",
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
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
