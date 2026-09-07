import { createAnalyticsClient } from '@corsteno/analytics-client';

type Client = ReturnType<typeof createAnalyticsClient>;
const apiUrl = import.meta.env.VITE_CORSTENO_ANALYTICS_URL?.trim();
const apiKey = import.meta.env.VITE_CORSTENO_ANALYTICS_KEY?.trim();
const debug = import.meta.env.VITE_CORSTENO_ANALYTICS_DEBUG?.trim().toLowerCase() === 'true';
const endpoint = apiUrl ? `${apiUrl.replace(/\/+$/, '')}/v1/events` : null;
const client: Client | null = apiUrl && apiKey ? createAnalyticsClient({
  apiUrl: apiUrl.replace(/\/+$/, ''), apiKey,
  onResponse: (response) => { if (debug) console.info('[Analytics] event sent', { endpoint, status: response.status }); },
  onError: (error) => { if (debug) console.error('[Analytics] event failed', { endpoint, error: error instanceof Error ? error.message : String(error) }); },
}) : null;

if (!client && (import.meta.env.DEV || debug)) {
  console.warn('[Analytics] disabled: VITE_CORSTENO_ANALYTICS_URL and VITE_CORSTENO_ANALYTICS_KEY are required');
}

const sent = new Set<string>();
export const initializeAnalytics = (): void => {};
export const trackEvent = (name: string, parameters: Record<string, unknown> = {}): void => {
  if (debug) console.info('[Analytics] event attempted', { event: name, endpoint });
  if (client) void client.track(name, { surface: 'web', experience: 'cosquin_ar', ...parameters });
};
export const trackOnce = (name: string, properties: Record<string, unknown> = {}): void => {
  if (sent.has(name)) return;
  sent.add(name);
  trackEvent(name, properties);
};
