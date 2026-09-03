import.meta.env;

type Gtag = (command: 'config' | 'event', target: string, parameters?: Record<string, unknown>) => void;

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: Gtag;
  }
}

const measurementId = import.meta.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();
const hostname = window.location.hostname;
const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
const debug = new URLSearchParams(window.location.search).get('analytics_debug') === 'true';
const enabled = Boolean(measurementId) && !isLocalhost;

export const initializeAnalytics = (): void => {
  if (!enabled || !measurementId || window.gtag) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = ((...args: unknown[]) => window.dataLayer.push(args)) as Gtag;
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  document.head.append(script);
  window.gtag('config', measurementId, { send_page_view: true, debug_mode: debug });
  if (debug) console.info('[Analytics] enabled', { measurementId, hostname });
};

export const trackEvent = (name: string, parameters: Record<string, unknown> = {}): void => {
  if (!enabled || !measurementId || !window.gtag) return;

  const safeParameters: Record<string, unknown> = {
    experience: 'cosquin_ar',
    page_path: window.location.pathname,
    hostname,
    ...parameters,
    ...(debug ? { debug_mode: true } : {}),
  };
  window.gtag('event', name, safeParameters);
  if (debug) console.info('[Analytics] event', name, safeParameters);
};
