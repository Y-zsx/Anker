const API_BASE = '/api';

async function fetchJson<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const api = {
  // Devices
  listDevices: () => fetchJson<{ devices: any[] }>('/devices'),
  getDeviceStatus: () => fetchJson<any>('/device/status'),
  connectDevice: (id: string) => fetchJson(`/device/connect/${id}`, { method: 'POST' }),
  disconnectDevice: () => fetchJson<any>('/device/disconnect', { method: 'POST' }),

  // Audio
  listScenarios: () => fetchJson<{ scenarios: any[] }>('/audio/scenarios'),
  getAudioState: () => fetchJson<any>('/audio/state'),
  stopRecording: () => fetchJson<any>('/audio/stop', { method: 'POST' }),

  // AI
  getAIConfig: () => fetchJson<any>('/ai/config'),
  updateAIConfig: (config: any) =>
    fetchJson('/ai/config', { method: 'POST', body: JSON.stringify(config) }),
  getAIResult: () => fetchJson<any>('/ai/result'),
  getAIHistory: () => fetchJson<{ history: any[] }>('/ai/history'),

  // Sessions (records)
  getSessions: () => fetchJson<{ sessions: any[]; total: number }>('/report/sessions'),

  // Report
  getReport: () => fetchJson<any>('/report'),
  clearData: () => fetchJson<any>('/report/clear', { method: 'DELETE' }),

  // Health
  health: () => fetchJson<any>('/health'),
};

// SSE helper
export function createSSE(url: string, onData: (data: any) => void): EventSource {
  const evt = new EventSource(`${API_BASE}${url}`);
  evt.addEventListener('message', (e: MessageEvent) => {
    onData(JSON.parse(e.data));
  });
  evt.onerror = () => evt.close();
  return evt;
}

// POST SSE helper using fetch + ReadableStream
export async function postSSE(
  url: string,
  onData: (data: any) => void
): Promise<void> {
  const response = await fetch(`${API_BASE}${url}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.body) return;

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            onData(data);
          } catch { /* skip malformed */ }
        }
      }
    }
  } catch { /* stream closed */ }
}
