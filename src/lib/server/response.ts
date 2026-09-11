// ── VoxGuard Server Response Utility ──────────────────────────────────────
// Standardizes JSON responses, HTTP status codes, security headers, and timing.

import { NextResponse } from "next/server";
import type { ApiSuccessResponse, ApiErrorResponse, ApiMeta, ApiError } from "@/lib/types";

const SERVER_VERSION = "3.2.0-Production";

export function createApiMeta(startTimeMs: number, requestId?: string): ApiMeta {
  return {
    requestId: requestId || `req_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    processingTimeMs: Math.max(1, Math.round(performance.now() - startTimeMs)),
    version: SERVER_VERSION,
  };
}

export function apiSuccess<T>(
  data: T,
  startTimeMs: number,
  status = 200,
  requestId?: string,
  extraHeaders: Record<string, string> = {}
): NextResponse<ApiSuccessResponse<T>> {
  const meta = createApiMeta(startTimeMs, requestId);
  const body: ApiSuccessResponse<T> = {
    success: true,
    data,
    meta,
  };

  return NextResponse.json(body, {
    status,
    headers: {
      "Content-Type": "application/json",
      "X-VoxGuard-Version": SERVER_VERSION,
      "X-VoxGuard-Latency-Ms": String(meta.processingTimeMs),
      "X-VoxGuard-Request-Id": meta.requestId,
      ...extraHeaders,
    },
  });
}

export function apiError(
  message: string,
  code: string,
  status = 400,
  startTimeMs = performance.now(),
  details?: Record<string, unknown> | string[],
  requestId?: string
): NextResponse<ApiErrorResponse> {
  const meta = createApiMeta(startTimeMs, requestId);
  const errorObj: ApiError = {
    code,
    message,
    ...(details ? { details } : {}),
  };

  const body: ApiErrorResponse = {
    success: false,
    error: errorObj,
    meta,
  };

  return NextResponse.json(body, {
    status,
    headers: {
      "Content-Type": "application/json",
      "X-VoxGuard-Version": SERVER_VERSION,
      "X-VoxGuard-Error-Code": code,
      "X-VoxGuard-Request-Id": meta.requestId,
    },
  });
}
