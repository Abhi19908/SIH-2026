// ── VoxGuard Server Audio Binary Parser ──────────────────────────────────
// Pure Node.js / TypeScript binary parser for RIFF/WAV files and PCM decoding.
// Does NOT require Web Audio API (works in edge / Node.js server environments).

import { createHash } from "crypto";
import { logger } from "./logger";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

export interface ParsedAudio {
  pcmData: Float32Array; // Mono downmixed PCM samples (-1.0 to 1.0)
  sampleRate: number; // e.g. 44100, 48000, 16000
  duration: number; // Seconds
  channels: number; // Original channel count
  bitsPerSample: number; // 8, 16, 24, 32
  rawBuffer: ArrayBuffer;
  sha256: string;
}

export interface WavChunks {
  fmtOffset: number;
  fmtSize: number;
  dataOffset: number;
  dataSize: number;
  audioFormat: number;
  channels: number;
  sampleRate: number;
  byteRate: number;
  blockAlign: number;
  bitsPerSample: number;
}

/* -------------------------------------------------------------------------- */
/*  SHA-256 Utility for Node.js                                                */
/* -------------------------------------------------------------------------- */

export function computeServerSHA256(buffer: ArrayBuffer): string {
  const hash = createHash("sha256");
  hash.update(Buffer.from(buffer));
  return hash.digest("hex");
}

/* -------------------------------------------------------------------------- */
/*  WAV RIFF Chunk Scanner                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Scan a WAV file to locate the `fmt ` and `data` chunks, handling arbitrary
 * chunk ordering and metadata chunks (LIST, JUNK, ID3, etc.).
 */
export function scanWavChunks(buffer: ArrayBuffer): WavChunks | null {
  const view = new DataView(buffer);
  const len = buffer.byteLength;

  if (len < 12) return null;

  // Check "RIFF"
  const riff = String.fromCharCode(
    view.getUint8(0),
    view.getUint8(1),
    view.getUint8(2),
    view.getUint8(3)
  );
  if (riff !== "RIFF") return null;

  // Check "WAVE"
  const wave = String.fromCharCode(
    view.getUint8(8),
    view.getUint8(9),
    view.getUint8(10),
    view.getUint8(11)
  );
  if (wave !== "WAVE") return null;

  let offset = 12;
  let fmtChunk: Partial<WavChunks> | null = null;
  let dataOffset = -1;
  let dataSize = -1;

  while (offset + 8 <= len) {
    const chunkId = String.fromCharCode(
      view.getUint8(offset),
      view.getUint8(offset + 1),
      view.getUint8(offset + 2),
      view.getUint8(offset + 3)
    );
    const chunkSize = view.getUint32(offset + 4, true);

    if (chunkId === "fmt ") {
      if (offset + 8 + 16 > len) return null;
      fmtChunk = {
        fmtOffset: offset + 8,
        fmtSize: chunkSize,
        audioFormat: view.getUint16(offset + 8, true),
        channels: view.getUint16(offset + 10, true),
        sampleRate: view.getUint32(offset + 12, true),
        byteRate: view.getUint32(offset + 16, true),
        blockAlign: view.getUint16(offset + 20, true),
        bitsPerSample: view.getUint16(offset + 22, true),
      };
    } else if (chunkId === "data") {
      dataOffset = offset + 8;
      dataSize = Math.min(chunkSize, len - dataOffset);
    }

    // Move to next chunk (chunks are 2-byte aligned in RIFF)
    offset += 8 + chunkSize + (chunkSize % 2);
  }

  if (!fmtChunk || dataOffset === -1 || dataSize <= 0) {
    return null;
  }

  return {
    ...fmtChunk,
    dataOffset,
    dataSize,
  } as WavChunks;
}

/* -------------------------------------------------------------------------- */
/*  PCM Extraction and Multi-channel Downmixing                                */
/* -------------------------------------------------------------------------- */

/**
 * Parse a WAV ArrayBuffer into decoded mono Float32Array PCM samples.
 */
export function parseWavAudio(
  buffer: ArrayBuffer,
  requestId?: string
): ParsedAudio {
  const sha256 = computeServerSHA256(buffer);
  const chunks = scanWavChunks(buffer);

  if (!chunks) {
    throw new Error(
      "Invalid WAV file: missing RIFF/WAVE header, fmt chunk, or data chunk."
    );
  }

  const {
    dataOffset,
    dataSize,
    audioFormat,
    channels,
    sampleRate,
    bitsPerSample,
  } = chunks;

  const view = new DataView(buffer);
  const bytesPerSample = bitsPerSample / 8;
  const numFrames = Math.floor(dataSize / (channels * bytesPerSample));

  if (numFrames <= 0) {
    throw new Error("WAV file contains no audio sample data.");
  }

  const pcmData = new Float32Array(numFrames);

  // Decode samples based on format and bit depth
  if (audioFormat === 1) {
    // PCM Integer
    if (bitsPerSample === 16) {
      for (let i = 0; i < numFrames; i++) {
        let sum = 0;
        for (let c = 0; c < channels; c++) {
          const sampleOffset = dataOffset + (i * channels + c) * 2;
          if (sampleOffset + 2 <= buffer.byteLength) {
            const intVal = view.getInt16(sampleOffset, true);
            sum += intVal / 32768.0;
          }
        }
        pcmData[i] = sum / channels;
      }
    } else if (bitsPerSample === 8) {
      // 8-bit PCM is unsigned: 0 = -1.0, 128 = 0.0, 255 = +1.0
      for (let i = 0; i < numFrames; i++) {
        let sum = 0;
        for (let c = 0; c < channels; c++) {
          const sampleOffset = dataOffset + (i * channels + c);
          if (sampleOffset < buffer.byteLength) {
            const uintVal = view.getUint8(sampleOffset);
            sum += (uintVal - 128) / 128.0;
          }
        }
        pcmData[i] = sum / channels;
      }
    } else if (bitsPerSample === 24) {
      for (let i = 0; i < numFrames; i++) {
        let sum = 0;
        for (let c = 0; c < channels; c++) {
          const sampleOffset = dataOffset + (i * channels + c) * 3;
          if (sampleOffset + 3 <= buffer.byteLength) {
            const b0 = view.getUint8(sampleOffset);
            const b1 = view.getUint8(sampleOffset + 1);
            const b2 = view.getUint8(sampleOffset + 2);
            // Sign-extend 24-bit to 32-bit
            let val = (b2 << 16) | (b1 << 8) | b0;
            if (val & 0x800000) val |= 0xff000000;
            sum += val / 8388608.0;
          }
        }
        pcmData[i] = sum / channels;
      }
    } else if (bitsPerSample === 32) {
      for (let i = 0; i < numFrames; i++) {
        let sum = 0;
        for (let c = 0; c < channels; c++) {
          const sampleOffset = dataOffset + (i * channels + c) * 4;
          if (sampleOffset + 4 <= buffer.byteLength) {
            const intVal = view.getInt32(sampleOffset, true);
            sum += intVal / 2147483648.0;
          }
        }
        pcmData[i] = sum / channels;
      }
    } else {
      throw new Error(`Unsupported PCM bit depth: ${bitsPerSample}`);
    }
  } else if (audioFormat === 3) {
    // IEEE 32-bit Float
    if (bitsPerSample === 32) {
      for (let i = 0; i < numFrames; i++) {
        let sum = 0;
        for (let c = 0; c < channels; c++) {
          const sampleOffset = dataOffset + (i * channels + c) * 4;
          if (sampleOffset + 4 <= buffer.byteLength) {
            sum += view.getFloat32(sampleOffset, true);
          }
        }
        pcmData[i] = Math.max(-1.0, Math.min(1.0, sum / channels));
      }
    } else {
      throw new Error(
        `Unsupported IEEE Float bit depth: ${bitsPerSample}`
      );
    }
  } else {
    throw new Error(
      `Unsupported WAV audio format code: ${audioFormat}`
    );
  }

  const duration = numFrames / sampleRate;

  logger.info("Parsed WAV audio", {
    sampleRate,
    channels,
    bitsPerSample,
    durationSec: Number(duration.toFixed(2)),
    samples: numFrames,
    sha256Prefix: sha256.substring(0, 8),
  }, requestId);

  return {
    pcmData,
    sampleRate,
    duration,
    channels,
    bitsPerSample,
    rawBuffer: buffer,
    sha256,
  };
}

/**
 * Universal audio buffer parser.
 * Handles WAV natively; for non-WAV formats (MP3/OGG/etc.), attempts fallback
 * or returns structured error indicating format support.
 */
export function parseAudioBuffer(
  buffer: ArrayBuffer,
  format?: string,
  requestId?: string
): ParsedAudio {
  const normalizedFormat = (format || "wav").toLowerCase();
  if (normalizedFormat === "wav") {
    try {
      return parseWavAudio(buffer, requestId);
    } catch (err) {
      throw new Error(
        `Failed to parse audio as WAV: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  throw new Error(
    `Direct server-side decoding for format "${format}" is not supported yet without ffmpeg/transcoding. Use WAV or pass client-decoded PCM.`
  );
}
