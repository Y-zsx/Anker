export interface DeviceInfo {
  id: string;
  name: string;
  type: 'bluetooth' | 'wifi';
  battery: number;
  signal_strength: number;
  firmware_version: string;
  temperature: number;
  audio_latency: number;
}

export interface DeviceStatus {
  connected: boolean;
  device: DeviceInfo | null;
  connection_quality: string;
}

export interface AudioState {
  is_recording: boolean;
  duration: number;
  sample_rate: number;
  noise_level: number;
  clarity_score: number;
  volume_level: number;
}

export interface Scenario {
  id: string;
  label: string;
  icon: string;
}

export interface AIConfig {
  speech_to_text_model: string;
  language: string;
  translation_source: string;
  translation_target: string;
  summary_max_length: number;
  summary_style: string;
  mode: 'standard' | 'high_precision';
}

export interface TranscriptionResult {
  original_text: string;
  translated_text: string | null;
  summary: string | null;
  confidence: number;
  word_count: number;
  processing_time_ms: number;
  confidence_segments: Array<{ start: number; end: number; confidence: number }>;
}

export interface PerformanceMetrics {
  avg_response_time_ms: number;
  transcription_accuracy: number;
  ai_processing_time_ms: number;
  total_interactions: number;
  connection_uptime_pct: number;
  noise_environment: string;
  speech_rate: string;
  bottlenecks: string[];
  suggestions: string[];
}

export interface SSEEvent {
  phase: string;
  progress: number;
  confidence: number;
  message: string;
  current_text?: string;
  translated_text?: string;
  summary?: string;
  result?: TranscriptionResult;
  device?: DeviceInfo;
  elapsed?: number;
  volume?: number;
  noise_level?: number;
  clarity_score?: number;
  sample_rate?: number;
  noise_reduction?: number;
  waveform?: number[];
}
