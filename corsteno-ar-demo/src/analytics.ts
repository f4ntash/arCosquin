import { createCorstenoAnalyticsClient, type AnalyticsProperties, type CosquinEventName } from './lib/corstenoAnalyticsClient';
import { DEMO_MODE } from './data/cosquinRock2026';
const apiUrl = import.meta.env.VITE_CORSTENO_ANALYTICS_URL?.trim();
const apiKey = import.meta.env.VITE_CORSTENO_ANALYTICS_KEY?.trim();
const debug = import.meta.env.VITE_CORSTENO_ANALYTICS_DEBUG?.trim().toLowerCase() === 'true';
const endpoint = apiUrl ? `${apiUrl.replace(/\/+$/, '')}/v1/events` : null;
const client = apiUrl && apiKey ? createCorstenoAnalyticsClient({ apiUrl, apiKey, debug }) : null;

if (debug) {
  console.info('[Analytics] initialized', { endpoint, hasUrl: Boolean(apiUrl), hasKey: Boolean(apiKey), debug });
}

if (!client && (import.meta.env.DEV || debug)) {
  console.warn('[Analytics] disabled: VITE_CORSTENO_ANALYTICS_URL and VITE_CORSTENO_ANALYTICS_KEY are required');
}

const sent = new Set<string>();
export const initializeAnalytics = (): void => {};
export const trackEvent = (name: CosquinEventName, parameters: AnalyticsProperties = {}): void => {
  if (debug && !client) console.info('[Analytics] event attempted', { event: name, endpoint });
  if (client) void client.track(name, { surface: 'web', experience: 'cosquin_ar', ...parameters, demo_mode: DEMO_MODE });
};
export const trackOnce = (name: CosquinEventName, properties: AnalyticsProperties = {}): void => {
  if (sent.has(name)) return;
  sent.add(name);
  trackEvent(name, properties);
};
