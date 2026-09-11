// ── VoxGuard Forensic Certificate Verification API Endpoint ───────────────
// POST /api/verify
// Accepts a caseId and/or SHA-256 hash to verify chain-of-custody authenticity.

import { NextRequest, NextResponse } from "next/server";
import { verifyForensicCertificate } from "@/lib/server/certificate";
import { apiSuccess, apiError } from "@/lib/server/response";
import { logger } from "@/lib/server/logger";
import type { VerifyCertificateRequest } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const startTime = performance.now();
  const requestId = `req_vrfy_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;

  try {
    const body: VerifyCertificateRequest = await req.json();

    if (!body || (!body.caseId && !body.sha256)) {
      return apiError(
        "Request body must contain 'caseId' or 'sha256' hash.",
        "MISSING_VERIFICATION_IDENTIFIER",
        400,
        startTime,
        undefined,
        requestId
      );
    }

    const verification = verifyForensicCertificate(body, requestId);

    logger.info("Certificate verification endpoint executed", {
      caseId: body.caseId,
      sha256Prefix: (body.sha256 || "").substring(0, 8),
      status: verification.tamperEvidentStatus,
    }, requestId);

    return apiSuccess(verification, startTime, 200, requestId);
  } catch (err) {
    logger.error("Unhandled error in /api/verify", err, {}, requestId);
    return apiError(
      "Failed to verify forensic certificate.",
      "VERIFICATION_ERROR",
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
