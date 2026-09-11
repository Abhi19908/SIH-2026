// ── VoxGuard Server Input Validation ──────────────────────────────────────
// Magic-byte detection, MIME/header validation, size limits, and sanitization.

import { logger } from "./logger";

/* -------------------------------------------------------------------------- */
/*  Constants                                                                  */
/* -------------------------------------------------------------------------- */

/** Max upload size: 50 MB */
export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;

/** Min file size: 44 bytes (empty WAV header) */
export const MIN_FILE_SIZE_BYTES = 44;

/** Max audio duration: 300 seconds (5 minutes) */
export const MAX_DURATION_SECONDS = 300;

/** Min audio duration: 0.1 seconds */
export const MIN_DURATION_SECONDS = 0.1;

/** Supported content types */
export const SUPPORTED_MIME_TYPES = new Set([
  "audio/wav",
  "audio/x-wav",
  "audio/wave",
  "audio/vnd.wave",
  "audio/mpeg",
  "audio/mp3",
  "audio/mp4",
  "audio/aac",
  "audio/ogg",
  "audio/webm",
  "audio/flac",
  "audio/x-flac",
  "audio/opus",
  "application/octet-stream", // Allow generic binary with magic-byte validation
]);

/* -------------------------------------------------------------------------- */
/*  Magic Byte Signatures                                                      */
/* -------------------------------------------------------------------------- */

interface MagicSignature {
  format: string;
  offsets: { pos: number; bytes: number[] }[];
}

const MAGIC_SIGNATURES: MagicSignature[] = [
  // RIFF....WAVE (WAV)
  {
    format: "wav",
    offsets: [
      { pos: 0, bytes: [0x52, 0x49, 0x46, 0x46] }, // RIFF
      { pos: 8, bytes: [0x57, 0x41, 0x56, 0x45] }, // WAVE
    ],
  },
  // ID3 tag or MPEG sync word (MP3)
  {
    format: "mp3",
    offsets: [{ pos: 0, bytes: [0x49, 0x44, 0x33] }], // ID3
  },
  {
    format: "mp3",
    offsets: [{ pos: 0, bytes: [0xff, 0xfb] }], // MPEG sync
  },
  {
    format: "mp3",
    offsets: [{ pos: 0, bytes: [0xff, 0xf3] }], // MPEG2 Layer3
  },
  {
    format: "mp3",
    offsets: [{ pos: 0, bytes: [0xff, 0xf2] }], // MPEG2.5 Layer3
  },
  // fLaC (FLAC)
  {
    format: "flac",
    offsets: [{ pos: 0, bytes: [0x66, 0x4c, 0x61, 0x43] }],
  },
  // OggS (OGG/Opus/Vorbis)
  {
    format: "ogg",
    offsets: [{ pos: 0, bytes: [0x4f, 0x67, 0x67, 0x53] }],
  },
  // ftyp (MP4/M4A/AAC container)
  {
    format: "mp4",
    offsets: [{ pos: 4, bytes: [0x66, 0x74, 0x79, 0x70] }],
  },
  // WebM (EBML header)
  {
    format: "webm",
    offsets: [{ pos: 0, bytes: [0x1a, 0x45, 0xdf, 0xa3] }],
  },
];

/* -------------------------------------------------------------------------- */
/*  Validation Result Types                                                    */
/* -------------------------------------------------------------------------- */

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  detectedFormat?: string;
  fileSizeBytes?: number;
}

/* -------------------------------------------------------------------------- */
/*  Public Validators                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Detect audio format from magic bytes at the start of the buffer.
 */
export function detectAudioFormat(buffer: ArrayBuffer): string | null {
  const view = new Uint8Array(buffer);

  for (const sig of MAGIC_SIGNATURES) {
    let match = true;
    for (const { pos, bytes } of sig.offsets) {
      for (let i = 0; i < bytes.length; i++) {
        if (pos + i >= view.length || view[pos + i] !== bytes[i]) {
          match = false;
          break;
        }
      }
      if (!match) break;
    }
    if (match) return sig.format;
  }

  return null;
}

/**
 * Validate an uploaded audio file buffer.
 * Checks: size limits, magic bytes, content integrity.
 */
export function validateAudioUpload(
  buffer: ArrayBuffer,
  declaredMimeType?: string,
  requestId?: string
): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
    fileSizeBytes: buffer.byteLength,
  };

  // 1. File size checks
  if (buffer.byteLength < MIN_FILE_SIZE_BYTES) {
    result.valid = false;
    result.errors.push(
      `File too small (${buffer.byteLength} bytes). Minimum is ${MIN_FILE_SIZE_BYTES} bytes.`
    );
    logger.warn("Upload rejected: file too small", {
      size: buffer.byteLength,
    }, requestId);
    return result;
  }

  if (buffer.byteLength > MAX_FILE_SIZE_BYTES) {
    result.valid = false;
    result.errors.push(
      `File too large (${(buffer.byteLength / (1024 * 1024)).toFixed(1)} MB). Maximum is ${MAX_FILE_SIZE_BYTES / (1024 * 1024)} MB.`
    );
    logger.warn("Upload rejected: file too large", {
      size: buffer.byteLength,
      maxSize: MAX_FILE_SIZE_BYTES,
    }, requestId);
    return result;
  }

  // 2. Magic byte detection
  const detected = detectAudioFormat(buffer);
  result.detectedFormat = detected || undefined;

  if (!detected) {
    // Check if the declared MIME type is audio — allow but warn
    if (declaredMimeType && declaredMimeType.startsWith("audio/")) {
      result.warnings.push(
        `Could not verify audio format from file header. Declared type "${declaredMimeType}" — proceeding with caution.`
      );
      logger.warn("Unrecognized magic bytes; relying on declared MIME", {
        declaredMimeType,
      }, requestId);
    } else {
      result.valid = false;
      result.errors.push(
        "File does not match any known audio format. Upload a WAV, MP3, FLAC, OGG, WebM, or M4A file."
      );
      logger.warn("Upload rejected: unknown file format", {
        declaredMimeType,
        firstBytes: Array.from(new Uint8Array(buffer.slice(0, 16)))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join(" "),
      }, requestId);
      return result;
    }
  }

  // 3. MIME mismatch warning (non-blocking)
  if (declaredMimeType && detected) {
    const mimeFormatMap: Record<string, string[]> = {
      wav: ["audio/wav", "audio/x-wav", "audio/wave", "audio/vnd.wave"],
      mp3: ["audio/mpeg", "audio/mp3"],
      flac: ["audio/flac", "audio/x-flac"],
      ogg: ["audio/ogg", "audio/opus"],
      mp4: ["audio/mp4", "audio/aac", "audio/x-m4a"],
      webm: ["audio/webm"],
    };

    const expectedMimes = mimeFormatMap[detected] || [];
    if (
      !expectedMimes.includes(declaredMimeType) &&
      declaredMimeType !== "application/octet-stream"
    ) {
      result.warnings.push(
        `Declared MIME type "${declaredMimeType}" does not match detected format "${detected}".`
      );
    }
  }

  // 4. WAV-specific header validation
  if (detected === "wav") {
    const wavErrors = validateWavHeader(buffer, requestId);
    if (wavErrors.length > 0) {
      result.errors.push(...wavErrors);
      result.valid = false;
    }
  }

  return result;
}

/**
 * Validate WAV RIFF header fields for internal consistency.
 */
function validateWavHeader(buffer: ArrayBuffer, requestId?: string): string[] {
  const errors: string[] = [];
  const view = new DataView(buffer);

  if (buffer.byteLength < 44) {
    errors.push("WAV file too short — incomplete RIFF header.");
    return errors;
  }

  // Check RIFF chunk size consistency
  const riffSize = view.getUint32(4, true);
  if (riffSize + 8 > buffer.byteLength + 1000) {
    // Allow small padding inconsistencies
    errors.push(
      `WAV RIFF size mismatch: header claims ${riffSize + 8} bytes but file is ${buffer.byteLength} bytes.`
    );
    logger.warn("WAV RIFF size inconsistency", {
      riffSize: riffSize + 8,
      actualSize: buffer.byteLength,
    }, requestId);
  }

  // Validate fmt chunk
  const audioFormat = view.getUint16(20, true);
  if (audioFormat !== 1 && audioFormat !== 3 && audioFormat !== 0xfffe) {
    // 1=PCM, 3=IEEE float, 0xFFFE=extensible
    errors.push(
      `Unsupported WAV audio format code: ${audioFormat}. Only PCM (1), IEEE Float (3), and Extensible (0xFFFE) are supported.`
    );
  }

  const numChannels = view.getUint16(22, true);
  if (numChannels === 0 || numChannels > 8) {
    errors.push(`Invalid channel count: ${numChannels}. Expected 1–8.`);
  }

  const sampleRate = view.getUint32(24, true);
  if (sampleRate < 8000 || sampleRate > 192000) {
    errors.push(
      `Unsupported sample rate: ${sampleRate} Hz. Expected 8000–192000 Hz.`
    );
  }

  const bitsPerSample = view.getUint16(34, true);
  if (![8, 16, 24, 32].includes(bitsPerSample)) {
    errors.push(
      `Unsupported bit depth: ${bitsPerSample}. Expected 8, 16, 24, or 32 bits.`
    );
  }

  return errors;
}

/**
 * Validate a SHA-256 hex string format.
 */
export function isValidSHA256(hash: string): boolean {
  return /^[a-f0-9]{64}$/i.test(hash);
}

/**
 * Sanitize a filename: strip path traversal, limit length, allow safe chars only.
 */
export function sanitizeFilename(name: string): string {
  // Remove path separators and traversal
  let clean = name.replace(/[\\/:*?"<>|]/g, "_");
  // Remove leading dots (hidden files / traversal)
  clean = clean.replace(/^\.+/, "");
  // Limit length
  if (clean.length > 200) {
    const ext = clean.split(".").pop() || "";
    clean = clean.substring(0, 195) + (ext ? `.${ext}` : "");
  }
  return clean || "untitled_audio";
}

/**
 * Validate base64-encoded audio string.
 * Returns the decoded ArrayBuffer or null on failure.
 */
export function decodeBase64Audio(
  base64: string,
  requestId?: string
): ArrayBuffer | null {
  try {
    // Strip data URI prefix if present
    const raw = base64.replace(/^data:[^;]+;base64,/, "");

    // Validate base64 characters
    if (!/^[A-Za-z0-9+/]+=*$/.test(raw)) {
      logger.warn("Invalid base64 characters in audio payload", {}, requestId);
      return null;
    }

    const binaryString = atob(raw);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  } catch (err) {
    logger.error("Base64 decode failed", err, {}, requestId);
    return null;
  }
}
