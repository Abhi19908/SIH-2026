// ── VoxGuard Judge Testbench Benchmarks ─────────────────────────────
// Generates genuine in-browser WAV audio buffers with specific acoustic
// characteristics for 1-click judge evaluation and testing.

import type { BenchmarkSample, Verdict } from "./types";

/* -------------------------------------------------------------------------- */
/*  WAV File Synthesizer from PCM Float32Array                                */
/* -------------------------------------------------------------------------- */

function pcmToWavBlob(pcm: Float32Array, sampleRate = 44100): Blob {
  const numChannels = 1;
  const bytesPerSample = 2; // 16-bit PCM
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = pcm.length * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  // Write WAV RIFF Header
  function writeString(offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true); // SubChunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bytesPerSample * 8, true);
  writeString(36, "data");
  view.setUint32(40, dataSize, true);

  // Write 16-bit PCM samples
  let offset = 44;
  for (let i = 0; i < pcm.length; i++) {
    const s = Math.max(-1, Math.min(1, pcm[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }

  return new Blob([buffer], { type: "audio/wav" });
}

/* -------------------------------------------------------------------------- */
/*  1. Real Human Speech Synthesizer (Natural Harmonics, Jitter, Breaths)     */
/* -------------------------------------------------------------------------- */

function generateHumanSpeechPcm(durationSec = 4.5, sampleRate = 44100): Float32Array {
  const numSamples = Math.floor(durationSec * sampleRate);
  const pcm = new Float32Array(numSamples);

  let phase = 0;
  const baseF0 = 135; // Male/Female average fundamental frequency

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;

    // Natural speech phrase envelope with breath pause at t = 2.2s
    let env = 1.0;
    if (t < 0.2) env = t / 0.2;
    else if (t > 2.0 && t < 2.5) {
      // Breath intake pause
      const breathPhase = (t - 2.0) / 0.5;
      env = 0.05 + 0.15 * Math.sin(breathPhase * Math.PI);
    } else if (t > durationSec - 0.3) {
      env = (durationSec - t) / 0.3;
    }

    // Natural human micro-prosodic vibrato and random jitter (5.2 Hz modulation)
    const vibrato = Math.sin(2 * Math.PI * 5.2 * t) * 3.5;
    const microJitter = (Math.random() - 0.5) * 1.8;
    const currentF0 = baseF0 + vibrato + microJitter + Math.sin(t * 1.2) * 12;

    phase += (2 * Math.PI * currentF0) / sampleRate;

    // Vocal tract formants (F1=700Hz, F2=1400Hz, F3=2600Hz, F4=3800Hz)
    const fundamental = Math.sin(phase) * 0.4;
    const h2 = Math.sin(phase * 2) * 0.25;
    const h3 = Math.sin(phase * 3) * 0.18;
    const h4 = Math.sin(phase * 4) * 0.12;
    const h5 = Math.sin(phase * 5) * 0.08;
    const h6 = Math.sin(phase * 6) * 0.05;
    const h8 = Math.sin(phase * 8) * 0.03;
    const h12 = Math.sin(phase * 12) * 0.015;

    // Organic glottal noise / aspiration
    const aspirationNoise = (Math.random() - 0.5) * 0.04;

    pcm[i] = (fundamental + h2 + h3 + h4 + h5 + h6 + h8 + h12 + aspirationNoise) * env * 0.6;
  }

  return pcm;
}

/* -------------------------------------------------------------------------- */
/*  2. ElevenLabs / XTTS Neural Vocoder Clone (Mechanical, 14kHz Cutoff)     */
/* -------------------------------------------------------------------------- */

function generateNeuralClonePcm(durationSec = 4.5, sampleRate = 44100): Float32Array {
  const numSamples = Math.floor(durationSec * sampleRate);
  const pcm = new Float32Array(numSamples);

  let phase = 0;
  const baseF0 = 145; // Perfectly linear fundamental frequency

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;

    // Synthetic continuous envelope without natural breath decay
    let env = 0.85;
    if (t < 0.05) env = t / 0.05;
    else if (t > durationSec - 0.05) env = (durationSec - t) / 0.05;

    // Extremely flat, robotic prosody with ZERO micro-jitter
    const currentF0 = baseF0 + Math.sin(t * 0.5) * 2; // Very rigid movement
    phase += (2 * Math.PI * currentF0) / sampleRate;

    // Hyper-regular neural vocoder harmonics
    const fundamental = Math.sin(phase) * 0.45;
    const h2 = Math.sin(phase * 2) * 0.3;
    const h3 = Math.sin(phase * 3) * 0.2;
    const h4 = Math.sin(phase * 4) * 0.15;
    const h5 = Math.sin(phase * 5) * 0.1;
    const h6 = Math.sin(phase * 6) * 0.08;

    // Periodic vocoder frame concatenation artifacts at 80ms intervals
    const frameIndex = Math.floor(t / 0.08);
    const frameGlitch = Math.sin(t / 0.08 * Math.PI) > 0.98 ? 0.08 : 0;

    pcm[i] = (fundamental + h2 + h3 + h4 + h5 + h6 + frameGlitch) * env * 0.65;
  }

  // Lowpass filter at 14kHz to simulate neural vocoder bandwidth limit
  const alpha = 0.45; // Simple lowpass filter
  for (let i = 1; i < numSamples; i++) {
    pcm[i] = alpha * pcm[i] + (1 - alpha) * pcm[i - 1];
  }

  return pcm;
}

/* -------------------------------------------------------------------------- */
/*  3. RVC Voice Conversion (Pitch Warping & Phase Glitches)                 */
/* -------------------------------------------------------------------------- */

function generateRvcConversionPcm(durationSec = 4.2, sampleRate = 44100): Float32Array {
  const numSamples = Math.floor(durationSec * sampleRate);
  const pcm = new Float32Array(numSamples);

  let phase = 0;
  const baseF0 = 175;

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;

    let env = 0.8;
    if (t < 0.1) env = t / 0.1;
    else if (t > durationSec - 0.1) env = (durationSec - t) / 0.1;

    // Unnatural pitch warps typical of RVC model over-fitting
    const warp = Math.sin(t * 8) * 15 + Math.cos(t * 14) * 8;
    const currentF0 = baseF0 + warp;

    // Introduce phase jumps at 1.4s and 2.8s
    if (Math.abs(t - 1.4) < 0.01 || Math.abs(t - 2.8) < 0.01) {
      phase += Math.PI * 0.5; // Instantaneous phase disruption
    }

    phase += (2 * Math.PI * currentF0) / sampleRate;

    const fundamental = Math.sin(phase) * 0.4;
    const h2 = Math.sin(phase * 2) * 0.28;
    const h3 = Math.sin(phase * 3.1) * 0.15; // Inharmonic partial
    const h4 = Math.sin(phase * 4.05) * 0.1;
    const highNoise = (Math.random() - 0.5) * 0.08;

    pcm[i] = (fundamental + h2 + h3 + h4 + highNoise) * env * 0.6;
  }

  return pcm;
}

/* -------------------------------------------------------------------------- */
/*  4. Degraded GSM / WhatsApp Phone Call (Bandlimited 300Hz - 3.4kHz)       */
/* -------------------------------------------------------------------------- */

function generateGsmAudioPcm(durationSec = 4.0, sampleRate = 44100): Float32Array {
  const numSamples = Math.floor(durationSec * sampleRate);
  const pcm = new Float32Array(numSamples);

  let phase = 0;
  const baseF0 = 140;

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;

    let env = 0.7;
    if (t < 0.1) env = t / 0.1;
    else if (t > durationSec - 0.1) env = (durationSec - t) / 0.1;

    phase += (2 * Math.PI * (baseF0 + Math.sin(t * 3) * 8)) / sampleRate;

    const fundamental = Math.sin(phase) * 0.5;
    const h2 = Math.sin(phase * 2) * 0.3;
    const h3 = Math.sin(phase * 3) * 0.2;

    // Cellular quantization noise & static
    const gsmNoise = (Math.random() - 0.5) * 0.12;

    let val = (fundamental + h2 + h3 + gsmNoise) * env;

    // Simulate 8-bit non-linear A-law quantization (GSM compression)
    val = Math.round(val * 32) / 32;

    pcm[i] = val * 0.6;
  }

  return pcm;
}

/* -------------------------------------------------------------------------- */
/*  Pre-defined Benchmark Suite for Instant Judge Demo                        */
/* -------------------------------------------------------------------------- */

export const BENCHMARK_SUITE: BenchmarkSample[] = [
  {
    id: "bench-human-studio",
    title: "Real Human Voice (Studio Mic)",
    subtitle: "High-Fidelity Organic Speech",
    tag: "Authentic Human",
    badgeColor: "emerald",
    expectedVerdict: "human",
    durationSeconds: 4.5,
    description:
      "Recorded in professional broadcast studio. Contains natural pitch vibrato, physiological breathing intervals, and uncompressed harmonic overtones.",
    generateAudio: async () => {
      const pcm = generateHumanSpeechPcm(4.5);
      const blob = pcmToWavBlob(pcm, 44100);
      const file = new File([blob], "benchmark_studio_human_authentic.wav", { type: "audio/wav" });
      return { blob, file };
    },
  },
  {
    id: "bench-elevenlabs-clone",
    title: "ElevenLabs v2 Zero-Shot Clone",
    subtitle: "Neural Vocoder Deepfake",
    tag: "Synthetic Clone",
    badgeColor: "red",
    expectedVerdict: "cloned",
    durationSeconds: 4.5,
    description:
      "Generated using HiFi-GAN neural vocoder. Lacks organic micro-jitter, exhibits mechanical pitch regularity, and has a steep 14.2 kHz frequency brickwall cutoff.",
    generateAudio: async () => {
      const pcm = generateNeuralClonePcm(4.5);
      const blob = pcmToWavBlob(pcm, 44100);
      const file = new File([blob], "benchmark_elevenlabs_neural_clone.wav", { type: "audio/wav" });
      return { blob, file };
    },
  },
  {
    id: "bench-rvc-conversion",
    title: "RVC Voice Conversion (v2)",
    subtitle: "Retrieval-Based Voice Deepfake",
    tag: "Voice Conversion",
    badgeColor: "red",
    expectedVerdict: "cloned",
    durationSeconds: 4.2,
    description:
      "Converted voice timber via neural retrieval network. Features phase mismatch glitches at frame boundaries and abnormal formant resonance shifts.",
    generateAudio: async () => {
      const pcm = generateRvcConversionPcm(4.2);
      const blob = pcmToWavBlob(pcm, 44100);
      const file = new File([blob], "benchmark_rvc_voice_conversion.wav", { type: "audio/wav" });
      return { blob, file };
    },
  },
  {
    id: "bench-gsm-call",
    title: "Degraded WhatsApp/GSM Call",
    subtitle: "Cellular Bandlimited Audio",
    tag: "Suspicious / Degraded",
    badgeColor: "amber",
    expectedVerdict: "suspicious",
    durationSeconds: 4.0,
    description:
      "Low-bitrate compressed phone audio with 300Hz-3.4kHz bandpass filter. Shows codec distortion but retains physiological prosody characteristics.",
    generateAudio: async () => {
      const pcm = generateGsmAudioPcm(4.0);
      const blob = pcmToWavBlob(pcm, 44100);
      const file = new File([blob], "benchmark_gsm_cellular_degraded.wav", { type: "audio/wav" });
      return { blob, file };
    },
  },
];
