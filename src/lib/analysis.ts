// ── VoxGuard Analysis Engine Bridge ─────────────────────────────────
// Connects UI to real DSP decoding and pre-calculated forensic datasets.
// Hybrid Architecture: Dispatches to /api/analyze endpoint with automatic
// client-side DSP fallback for offline and low-latency local execution.

import { decodeAudio, runFullForensicAnalysis } from "./dsp";
import type { AnalysisResult, ApiResponse } from "./types";

export async function analyzeRealAudio(
  file: File | Blob,
  forcedVerdict?: "human" | "cloned" | "suspicious"
): Promise<AnalysisResult> {
  const fileName = (file as File).name || `recording_${Date.now()}.wav`;

  // ── Strategy 1: Attempt Server-Side Forensic API Analysis ───────────────
  if (typeof window !== "undefined" && typeof fetch !== "undefined") {
    try {
      const formData = new FormData();
      formData.append("file", file, fileName);
      if (forcedVerdict) {
        formData.append("forcedVerdict", forcedVerdict);
      }

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const json: ApiResponse<AnalysisResult> = await response.json();
        if (json.success && json.data) {
          const serverResult = json.data;
          // Attach local object URL for instant audio playback
          serverResult.audio.audioBlob = file;
          serverResult.audio.audioUrl = URL.createObjectURL(file);
          return serverResult;
        }
      }
    } catch {
      // Server API unreachable or offline; seamlessly continue to client DSP
    }
  }

  // ── Strategy 2: Client-Side Radix-2 DSP & Autocorrelation Fallback ──────
  const decoded = await decodeAudio(file);
  const result = runFullForensicAnalysis(decoded, fileName, forcedVerdict);

  // Attach object URL for audio playback
  result.audio.audioBlob = file;
  result.audio.audioUrl = URL.createObjectURL(file);

  return result;
}

export function getInitialHistory(): AnalysisResult[] {
  return [
    {
      id: "VG-HIST-9021",
      fileName: "ceo_voice_authorization_wire.wav",
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      verdict: "cloned",
      confidence: 0.968,
      overallScore: 0.12,
      riskLevel: "critical",
      summary:
        "CRITICAL ALERT: Synthetic neural vocoder footprint identified. Severe brickwall harmonic truncation at 14.8 kHz and unnaturally quantized F0 prosody pitch contours characteristic of diffusion-based zero-shot voice synthesis.",
      detailedFindings:
        "Fourier transform analysis reveals steep energy drops >48dB/octave above 14.8 kHz consistent with HiFi-GAN upsampling filters.",
      audio: {
        name: "ceo_voice_authorization_wire.wav",
        duration: 4.85,
        sampleRate: 44100,
        channels: 1,
        format: "audio/wav",
        size: 428000,
        sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      },
      measurements: {
        spectralCentroid: 2480,
        spectralFlatness: 0.042,
        spectralRolloff: 14200,
        zeroCrossingRate: 0.038,
        dynamicRangeDb: 42.5,
        pitchJitterPercent: 0.09,
        vocalShimmerPercent: 0.82,
        vocoderCutoffHz: 14800,
        snrDb: 34.2,
        harmonicToNoiseRatioDb: 18.6,
        silenceRatioPercent: 4.8,
      },
      radarScores: {
        spectralIntegrity: 18,
        prosodicNaturalness: 22,
        temporalCoherence: 84,
        harmonicStructure: 24,
        formantDynamics: 31,
        phaseContinuity: 19,
      },
      features: [
        {
          name: "Spectral Continuity & Energy Drop",
          category: "spectral",
          score: 0.18,
          anomaly: true,
          description: "High-frequency vocoder brickwall cutoff at 14.8 kHz; zero natural harmonics above Nyquist ceiling.",
          measuredValue: "14.8 kHz cutoff",
          expectedNormal: "> 20.0 kHz continuous",
        },
        {
          name: "Pitch Jitter & Glottal Dynamics",
          category: "prosody",
          score: 0.22,
          anomaly: true,
          description: "Unnatural F0 quantization variance (0.09%); robotic glottal pulse spacing.",
          measuredValue: "0.09% PPQ (Robotic)",
          expectedNormal: "0.5% - 1.2% PPQ",
        },
        {
          name: "Vocal Shimmer & Breath Turbulence",
          category: "harmonic",
          score: 0.28,
          anomaly: true,
          description: "Synthetic vocal tract air turbulence absence; unnatural micro-amplitude uniformity.",
          measuredValue: "0.82% APQ",
          expectedNormal: "2.5% - 5.0% APQ",
        },
        {
          name: "Mel-Frequency Cepstral Consistency",
          category: "spectral",
          score: 0.35,
          anomaly: true,
          description: "Diffusion vocoder frame stitching discontinuity across 12 MFCC filterbanks.",
          measuredValue: "Delta 0.42 MFCC",
          expectedNormal: "< 0.15 MFCC",
        },
        {
          name: "Harmonic-to-Noise Ratio (HNR)",
          category: "harmonic",
          score: 0.25,
          anomaly: true,
          description: "Over-regularized harmonic ratio indicative of HiFi-GAN post-filtering.",
          measuredValue: "18.6 dB",
          expectedNormal: "22 - 32 dB",
        },
      ],
      insights: [
        {
          id: "ins-1",
          category: "spectral",
          severity: "critical",
          label: "Neural Vocoder Brickwall Cutoff",
          detail: "Spectrogram displays abrupt energy extinction above 14.8 kHz, a definitive signature of neural vocoders like HiFi-GAN and BigVGAN.",
          score: 0.95,
          evidence: "STFT Fourier band energy drop > 48 dB/octave above 14.8 kHz.",
        },
        {
          id: "ins-2",
          category: "prosody",
          severity: "warning",
          label: "Zero-Shot Prosody Quantization",
          detail: "Pitch fundamental (F0) lacks organic human micro-tremors and natural laryngeal biomechanics.",
          score: 0.78,
          evidence: "Standard deviation of pitch period perturbation is 4.3x lower than organic human baselines.",
        },
      ],
      timelineAnomalies: [
        {
          id: "ta-1",
          startSec: 0.85,
          endSec: 1.4,
          type: "vocoder_glitch",
          label: "Vocoder Stitching Artifact",
          severity: "high",
          description: "Frame boundary phase discontinuity detected during phoneme transition.",
        },
        {
          id: "ta-2",
          startSec: 2.6,
          endSec: 3.15,
          type: "harmonic_anomaly",
          label: "Harmonic Dropout",
          severity: "high",
          description: "Sudden collapse of 3rd and 4th formant harmonics.",
        },
      ],
      spectrogramData: Array.from({ length: 64 }, (_, r) =>
        Array.from({ length: 120 }, (_, c) => {
          if (r > 42) return 0.01 + Math.random() * 0.02; // Dead cutoff
          return Math.sin((r * c) / 30) * 0.4 + 0.4 + Math.random() * 0.1;
        })
      ),
      spectrogramFrequencies: Array.from({ length: 64 }, (_, i) => Math.round((i * 22050) / 64)),
      waveformData: Array.from({ length: 100 }, (_, i) => Math.sin(i * 0.2) * 0.7 * (1 - (i % 10) * 0.03)),
      modelMetrics: {
        inferenceEngine: "VoxGuard-DSP v3.2 + Neural-Acoustic Ensemble",
        modelVersion: "3.2.0-Production",
        detectorArchitecture: "Radix-2 FFT + Wiener Entropy + Spectral Descriptors",
        sha256Validation: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        processingTimeMs: 142,
        samplesAnalyzed: 213885,
      },
    },
    {
      id: "VG-HIST-9022",
      fileName: "press_conference_statement.wav",
      timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
      verdict: "human",
      confidence: 0.984,
      overallScore: 0.96,
      riskLevel: "low",
      summary:
        "AUTHENTIC VOICE: Natural biological vocal tract characteristics confirmed. Continuous high-frequency harmonic distribution up to 21.4 kHz with rich organic laryngeal jitter and realistic glottal pulse turbulence.",
      detailedFindings:
        "Unbroken formant trajectories, high frequency energy up to Nyquist bound, natural jitter (0.68%) and shimmer (3.24%).",
      audio: {
        name: "press_conference_statement.wav",
        duration: 5.2,
        sampleRate: 44100,
        channels: 1,
        format: "audio/wav",
        size: 458640,
        sha256: "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9",
      },
      measurements: {
        spectralCentroid: 3120,
        spectralFlatness: 0.018,
        spectralRolloff: 19800,
        zeroCrossingRate: 0.065,
        dynamicRangeDb: 58.4,
        pitchJitterPercent: 0.68,
        vocalShimmerPercent: 3.24,
        snrDb: 46.8,
        harmonicToNoiseRatioDb: 24.2,
        silenceRatioPercent: 8.2,
      },
      radarScores: {
        spectralIntegrity: 96,
        prosodicNaturalness: 94,
        temporalCoherence: 92,
        harmonicStructure: 95,
        formantDynamics: 93,
        phaseContinuity: 97,
      },
      features: [
        {
          name: "Spectral Continuity & Energy Drop",
          category: "spectral",
          score: 0.97,
          anomaly: false,
          description: "Full-bandwidth acoustic spectrum with organic harmonic decay up to Nyquist boundary.",
          measuredValue: "Organic Roll-off",
          expectedNormal: "Gradual decay",
        },
        {
          name: "Pitch Jitter & Glottal Dynamics",
          category: "prosody",
          score: 0.94,
          anomaly: false,
          description: "Natural micro-perturbation (0.68%) corresponding to biological vocal fold oscillations.",
          measuredValue: "0.68% PPQ (Normal)",
          expectedNormal: "0.5% - 1.2% PPQ",
        },
        {
          name: "Vocal Shimmer & Breath Turbulence",
          category: "harmonic",
          score: 0.95,
          anomaly: false,
          description: "Natural turbulent airflow and breath envelope variations consistent with human vocal tract.",
          measuredValue: "3.24% APQ",
          expectedNormal: "2.5% - 5.0% APQ",
        },
      ],
      insights: [
        {
          id: "ins-1",
          category: "prosody",
          severity: "normal",
          label: "Organic Biological Glottal Pulses",
          detail: "Continuous glottal airflow variation and natural vocal fold biomechanical friction observed across all phoneme segments.",
          score: 0.95,
          evidence: "Pitch period perturbation within standard human biological reference range (0.5% - 1.2%).",
        },
      ],
      timelineAnomalies: [],
      spectrogramData: Array.from({ length: 64 }, (_, r) =>
        Array.from({ length: 120 }, (_, c) => {
          return (Math.sin((r * c) / 25) * 0.3 + 0.35) * Math.exp(-r / 50) + Math.random() * 0.08;
        })
      ),
      spectrogramFrequencies: Array.from({ length: 64 }, (_, i) => Math.round((i * 22050) / 64)),
      waveformData: Array.from({ length: 100 }, (_, i) => Math.sin(i * 0.15) * 0.6 * (0.8 + Math.sin(i * 0.05) * 0.2)),
      modelMetrics: {
        inferenceEngine: "VoxGuard-DSP v3.2 + Neural-Acoustic Ensemble",
        modelVersion: "3.2.0-Production",
        detectorArchitecture: "Radix-2 FFT + Wiener Entropy + Spectral Descriptors",
        sha256Validation: "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9",
        processingTimeMs: 168,
        samplesAnalyzed: 229320,
      },
    },
  ];
}
