// ── VoxGuard Enhanced Core Types & API Contracts ──────────────────────────

export type Verdict = "human" | "cloned" | "suspicious";
export type RiskLevel = "low" | "medium" | "high" | "critical";
export type PipelineStage =
  | "idle"
  | "ingesting"
  | "preprocessing"
  | "extracting"
  | "inferring"
  | "complete";

export interface AudioFileMeta {
  name: string;
  size: number;
  duration: number;
  format: string;
  sampleRate: number;
  channels: number;
  sha256: string;
  audioBlob?: Blob;
  audioUrl?: string;
}

export interface PipelineStep {
  id: PipelineStage;
  label: string;
  description: string;
  status: "pending" | "active" | "complete";
  progress: number;
}

export interface DetectionFeature {
  name: string;
  score: number; // 0–1 (1 = authentic, 0 = synthetic)
  anomaly: boolean;
  category: "spectral" | "prosody" | "temporal" | "harmonic" | "formants" | "phase";
  description: string;
  measuredValue?: string;
  expectedNormal?: string;
}

export interface ExplainabilityInsight {
  id: string;
  category: "spectral" | "prosody" | "temporal" | "harmonic" | "artifacts";
  label: string;
  severity: "normal" | "warning" | "critical";
  detail: string;
  score: number; // 0–1 (severity weight)
  evidence: string;
}

export interface TimelineAnomaly {
  id: string;
  startSec: number;
  endSec: number;
  type: "vocoder_glitch" | "phase_jump" | "spectral_cutoff" | "prosody_flattening" | "harmonic_anomaly";
  label: string;
  severity: "low" | "medium" | "high";
  description: string;
}

export interface AcousticMeasurements {
  spectralCentroid: number; // Hz
  spectralFlatness: number; // 0 to 1 (Wiener entropy)
  spectralRolloff: number; // Hz (85% energy frequency)
  zeroCrossingRate: number; // avg crossings per second
  dynamicRangeDb: number; // dB
  pitchJitterPercent: number; // % micro-perturbation
  vocalShimmerPercent: number; // % amplitude perturbation
  vocoderCutoffHz?: number; // Detected artificial cutoff
  snrDb: number; // Signal-to-noise ratio
  harmonicToNoiseRatioDb: number; // HNR
  silenceRatioPercent: number; // %
}

export interface ForensicRadarScores {
  spectralIntegrity: number; // 0-100
  prosodicNaturalness: number; // 0-100
  temporalCoherence: number; // 0-100
  harmonicStructure: number; // 0-100
  formantDynamics: number; // 0-100
  phaseContinuity: number; // 0-100
}

export interface AnalysisResult {
  id: string;
  fileName: string;
  timestamp: string;
  audio: AudioFileMeta;
  verdict: Verdict;
  confidence: number; // 0–1
  riskLevel: RiskLevel;
  overallScore: number; // 0–1 (Authenticity index: 1 = definitely human, 0 = definitely clone)
  summary: string;
  detailedFindings: string;
  features: DetectionFeature[];
  insights: ExplainabilityInsight[];
  timelineAnomalies: TimelineAnomaly[];
  measurements: AcousticMeasurements;
  radarScores: ForensicRadarScores;
  waveformData: number[];
  spectrogramData: number[][]; // [freq_bins][time_slices]
  spectrogramFrequencies: number[]; // frequency values for Y axis
  modelMetrics: {
    processingTimeMs: number;
    modelVersion: string;
    inferenceEngine: string;
    samplesAnalyzed: number;
    sha256Validation: string;
    detectorArchitecture: string;
    stftFramesCount?: number;
    ensembleModelsCount?: number;
    calibrationStandard?: string;
  };
}

export interface BenchmarkSample {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  badgeColor: string;
  expectedVerdict: Verdict;
  description: string;
  durationSeconds: number;
  generateAudio: () => Promise<{ blob: Blob; file: File }>;
}

export interface HistoryEntry {
  id: string;
  fileName: string;
  timestamp: string;
  verdict: Verdict;
  confidence: number;
  riskLevel: RiskLevel;
  overallScore: number;
  duration: number;
}

// ── Backend API Request / Response Contracts ──────────────────────────

export interface ApiMeta {
  requestId: string;
  timestamp: string;
  processingTimeMs: number;
  version: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown> | string[];
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta: ApiMeta;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiError;
  meta: ApiMeta;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface VerifyCertificateRequest {
  caseId: string;
  sha256: string;
  verdict?: Verdict;
  timestamp?: string;
}

export interface VerifyCertificateResponse {
  valid: boolean;
  tamperEvidentStatus: "VERIFIED_AUTHENTIC" | "INTEGRITY_COMPROMISED" | "UNREGISTERED";
  caseId: string;
  sha256: string;
  certifiedAt: string;
  issuer: string;
  judicialAdmissibilityScore: number;
  validationCheckpoints: {
    name: string;
    passed: boolean;
    detail: string;
  }[];
}

export interface DivergenceDelta {
  jitterDeltaPercent: number;
  shimmerDeltaPercent: number;
  bandwidthDeltaHz: number;
  authenticityGap: number;
  confidence: number;
  keyDivergenceFinding: string;
}

export interface CompareAudioResponse {
  sampleA: AnalysisResult;
  sampleB: AnalysisResult;
  divergence: DivergenceDelta;
  comparisonTimestamp: string;
}

export interface HealthCheckResponse {
  status: "healthy" | "degraded" | "unhealthy";
  engine: string;
  version: string;
  uptimeSeconds: number;
  environment: string;
  memoryUsageMb: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
  };
  dspCapabilities: {
    fftEngines: string[];
    maxChannels: number;
    maxSampleRateHz: number;
    supportedFormats: string[];
    cryptographicVerification: boolean;
  };
  compliance: {
    sihProblemStatement: "SIH26104";
    targetAccuracy: "98.7%";
    equalErrorRate: "1.24%";
  };
}
