import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';
import { api, postSSE } from '../api';

// ---- Types ----
export interface DeviceInfo {
  id: string;
  name: string;
  type: string;
  battery: number;
  signal_strength: number;
  firmware_version: string;
  temperature: number;
  audio_latency: number;
  mic_enabled: boolean;
  connected_at: string | null;
}

export interface DeviceState {
  connected: boolean;
  device: DeviceInfo | null;
  connection_quality: string;
  phase: string;
  message: string;
}

export interface AudioState {
  is_recording: boolean;
  duration: number;
  sample_rate: number;
  volume_level: number;
  noise_level: number;
  clarity_score: number;
  text: string;
}

export interface AIConfig {
  mode: 'standard' | 'high_precision';
}

export interface ProcessingStatus {
  phase: string;
  progress: number;
  confidence: number;
  message: string;
  current_text: string;
}

export interface TranscriptionResult {
  original_text: string;
  translated_text: string | null;
  summary: string | null;
  confidence: number;
  word_count: number;
  processing_time_ms: number;
}

export interface ReportData {
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

// ---- Context ----
interface AppState {
  deviceState: DeviceState;
  audioState: AudioState;
  aiConfig: AIConfig;
  processingStatus: ProcessingStatus;
  isProcessing: boolean;
  result: TranscriptionResult | null;
  report: ReportData | null;
  selectedScenario: string;
  showDisconnectModal: boolean;

  connectDevice: (id: string) => Promise<void>;
  disconnectDevice: () => Promise<void>;
  dismissDisconnectModal: () => void;
  startRecording: (scenario: string) => Promise<void>;
  stopRecording: () => Promise<void>;
  processAI: (scenario: string) => Promise<void>;
  fetchReport: () => Promise<void>;
  resetResult: () => void;
  resetAudioState: () => void;
}

const defaultDeviceState: DeviceState = {
  connected: false,
  device: null,
  connection_quality: 'unknown',
  phase: 'idle',
  message: '',
};

const defaultAudioState: AudioState = {
  is_recording: false,
  duration: 0,
  sample_rate: 48000,
  volume_level: 0,
  noise_level: 25,
  clarity_score: 80,
  text: '',
};

const defaultProcessingStatus: ProcessingStatus = {
  phase: 'idle',
  progress: 0,
  confidence: 0,
  message: '',
  current_text: '',
};

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [deviceState, setDeviceState] = useState<DeviceState>(defaultDeviceState);
  const [audioState, setAudioState] = useState<AudioState>(defaultAudioState);
  const [aiConfig] = useState<AIConfig>({ mode: 'standard' });
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>(defaultProcessingStatus);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<TranscriptionResult | null>(null);
  const [report, setReport] = useState<ReportData | null>(null);
  const [selectedScenario, setSelectedScenario] = useState('meeting');
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  const wasConnectedRef = useRef(false);

  // Detect unexpected disconnection
  useEffect(() => {
    if (deviceState.connected) {
      wasConnectedRef.current = true;
    } else if (wasConnectedRef.current && deviceState.phase === 'idle') {
      // Was connected, now disconnected unexpectedly
      setShowDisconnectModal(true);
    }
  }, [deviceState.connected, deviceState.phase]);

  // ---- Real-time timer: ticks every 100ms when recording ----
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = useCallback(() => {
    if (timerRef.current) return;
    timerRef.current = setInterval(() => {
      setAudioState((prev) => ({
        ...prev,
        duration: +(prev.duration + 0.1).toFixed(1),
      }));
    }, 100);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => () => stopTimer(), [stopTimer]);

  // ---- Actions ----
  const connectDevice = useCallback(async (id: string) => {
    setDeviceState((prev) => ({ ...prev, phase: 'searching', message: '正在搜索设备...' }));

    await postSSE(`/device/connect/${id}`, (data) => {
      setDeviceState((prev) => ({
        ...prev,
        phase: data.phase ?? prev.phase,
        message: data.message ?? prev.message,
        ...(data.phase === 'connected' && data.device
          ? {
              connected: true,
              device: data.device as DeviceInfo,
              connection_quality: 'excellent',
            }
          : {}),
      }));
    });
  }, []);

  const disconnectDevice = useCallback(async () => {
    wasConnectedRef.current = false;
    try {
      await api.disconnectDevice();
      setDeviceState(defaultDeviceState);
    } catch { /* ignore */ }
  }, []);

  const dismissDisconnectModal = useCallback(() => {
    setShowDisconnectModal(false);
  }, []);

  const startRecording = useCallback(async (scenario: string) => {
    setSelectedScenario(scenario);
    setAudioState((prev) => ({ ...prev, is_recording: true, duration: 0, text: '' }));
    startTimer();

    await postSSE(`/audio/start/${scenario}`, (data) => {
      if (data.phase === 'recording') {
        setAudioState({
          is_recording: true,
          duration: data.elapsed ?? 0,
          sample_rate: data.sample_rate ?? 48000,
          volume_level: data.volume ?? 50,
          noise_level: data.noise_level ?? 25,
          clarity_score: data.clarity_score ?? 80,
          text: data.text ?? '',
        });
      }
    });

    stopTimer();
    setAudioState((prev) => ({ ...prev, is_recording: false }));
  }, [startTimer, stopTimer]);

  const stopRecording = useCallback(async () => {
    stopTimer();
    try {
      const state = await api.stopRecording();
      setAudioState((prev) => ({
        ...prev,
        is_recording: false,
        duration: state.duration ?? prev.duration,
        text: state.text ?? prev.text,
      }));
    } catch {
      setAudioState((prev) => ({ ...prev, is_recording: false }));
    }
  }, [stopTimer]);

  const processAI = useCallback(async (scenario: string) => {
    setIsProcessing(true);
    setProcessingStatus({
      phase: 'transcribing',
      progress: 0,
      confidence: 0,
      message: '开始处理...',
      current_text: '',
    });

    await postSSE(`/ai/process?scenario=${scenario}`, (data) => {
      setProcessingStatus({
        phase: data.phase ?? 'idle',
        progress: data.progress ?? 0,
        confidence: data.confidence ?? 0,
        message: data.message ?? '',
        current_text: data.current_text ?? '',
      });

      if (data.phase === 'done' && data.result) {
        setResult(data.result);
        setIsProcessing(false);
      }
    });
  }, []);

  const fetchReport = useCallback(async () => {
    try {
      const data = await api.getReport();
      setReport(data);
    } catch { /* ignore */ }
  }, []);

  const resetResult = useCallback(() => {
    setResult(null);
    setProcessingStatus(defaultProcessingStatus);
  }, []);

  const resetAudioState = useCallback(() => {
    stopTimer();
    setAudioState({
      is_recording: false,
      duration: 0,
      sample_rate: 48000,
      volume_level: 0,
      noise_level: 25,
      clarity_score: 80,
      text: '',
    });
  }, [stopTimer]);

  return (
    <AppContext.Provider
      value={{
        deviceState,
        audioState,
        aiConfig,
        processingStatus,
        isProcessing,
        result,
        report,
        selectedScenario,
        showDisconnectModal,
        connectDevice,
        disconnectDevice,
        dismissDisconnectModal,
        startRecording,
        stopRecording,
        processAI,
        fetchReport,
        resetResult,
        resetAudioState,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
